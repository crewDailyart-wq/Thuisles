import "server-only";

/**
 * Tekst uit een PDF halen — genoeg om een methodenaam te vinden.
 *
 * Eigen lezer, geen extra pakket. Een PDF bewaart zijn tekst in "streams" die
 * meestal met zlib zijn ingepakt; `fflate` zit al in het project voor de
 * Excel-import, en die kan ze uitpakken. Daarna staan de woorden in de stream
 * tussen haakjes, achter de operatoren Tj en TJ.
 *
 * Wat deze lezer NIET kan, en dat is bewust:
 *   - PDF's waarin de tekst een afbeelding is (een scan). Daar valt zonder
 *     tekstherkenning niets uit te halen.
 *   - lettertypen met een eigen tekenafbeelding. De tekst komt er dan als
 *     onzin uit; die levert simpelweg geen treffer op.
 *
 * Dat is geen probleem voor waar het voor bedoeld is: we zoeken alleen of een
 * methodenaam ergens in de tekst voorkomt. Lukt dat niet, dan vindt de zoeker
 * niets bij die school en gaat hij verder. Er wordt nooit iets geraden.
 */

import { inflateSync, unzlibSync } from "fflate";

/** Zoekt alle voorkomens van een reeks bytes. */
function vindAlle(bron: Uint8Array, naald: string): number[] {
  const plekken: number[] = [];
  const bytes = new TextEncoder().encode(naald);

  buiten: for (let i = 0; i + bytes.length <= bron.length; i++) {
    for (let j = 0; j < bytes.length; j++) {
      if (bron[i + j] !== bytes[j]) continue buiten;
    }
    plekken.push(i);
  }
  return plekken;
}

/** Pakt een stream uit; lukt dat niet, dan wordt hij overgeslagen. */
function pakUit(rauw: Uint8Array, ingepakt: boolean): Uint8Array | null {
  if (!ingepakt) return rauw;
  try {
    return unzlibSync(rauw);
  } catch {
    try {
      return inflateSync(rauw);
    } catch {
      return null;
    }
  }
}

/**
 * Haalt de leesbare tekst uit een contentstream.
 *
 * Alleen wat tussen haakjes staat vóór Tj, TJ, ' of " telt; de rest van de
 * stream is opmaak en positionering en hoeft niet.
 */
function tekstUitStream(stream: string): string {
  const stukken: string[] = [];
  let i = 0;

  while (i < stream.length) {
    if (stream[i] !== "(") {
      i++;
      continue;
    }

    // Een letterlijke tekst loopt tot de bijbehorende sluithaak.
    let diepte = 1;
    let woord = "";
    i++;

    while (i < stream.length && diepte > 0) {
      const teken = stream[i];

      if (teken === "\\") {
        const volgend = stream[i + 1];
        if (volgend >= "0" && volgend <= "7") {
          // Octale code, bijvoorbeeld \351 voor é.
          const cijfers = stream.slice(i + 1, i + 4).match(/^[0-7]{1,3}/)?.[0] ?? "";
          woord += String.fromCharCode(parseInt(cijfers, 8));
          i += 1 + cijfers.length;
          continue;
        }
        const vervanging: Record<string, string> = {
          n: "\n", r: "\r", t: "\t", b: "", f: "", "(": "(", ")": ")", "\\": "\\",
        };
        woord += vervanging[volgend] ?? volgend ?? "";
        i += 2;
        continue;
      }

      if (teken === "(") diepte++;
      else if (teken === ")") {
        diepte--;
        if (diepte === 0) break;
      }
      if (diepte > 0) woord += teken;
      i++;
    }
    i++;

    // Staat er verderop een tekstoperator, dan hoort dit stuk bij de tekst.
    const staart = stream.slice(i, i + 24);
    if (/^\s*(-?[\d.]+\s*)*(Tj|TJ|'|")/.test(staart) || /^\s*\]?\s*TJ/.test(staart)) {
      stukken.push(woord);
    } else if (/^\s*[-\d.]/.test(staart)) {
      // Binnen een TJ-reeks staan getallen tussen de stukken tekst.
      stukken.push(woord);
    }
  }

  return stukken.join("");
}

/**
 * Alle leesbare tekst uit een PDF.
 *
 * Levert een lange platte tekst op. Bij een PDF die niet te lezen valt, komt
 * er een lege tekst uit — nooit een fout die de zoeker stilzet.
 */
export function tekstUitPdf(bestand: Uint8Array): string {
  const stukken: string[] = [];

  try {
    for (const begin of vindAlle(bestand, "stream")) {
      // De kop vóór de stream vertelt of hij is ingepakt.
      const kopStart = Math.max(0, begin - 400);
      const kop = new TextDecoder("latin1").decode(bestand.subarray(kopStart, begin));
      if (!/\/Filter\s*\/(FlateDecode|Fl)\b/.test(kop) && /\/Filter/.test(kop)) {
        // Een ander soort inpakking (bijvoorbeeld een afbeelding): overslaan.
        continue;
      }
      const ingepakt = /\/Filter\s*\/(FlateDecode|Fl)\b/.test(kop);

      let start = begin + "stream".length;
      if (bestand[start] === 0x0d) start++;
      if (bestand[start] === 0x0a) start++;

      const einde = vindAlle(bestand.subarray(start), "endstream")[0];
      if (einde === undefined) continue;

      const uitgepakt = pakUit(bestand.subarray(start, start + einde), ingepakt);
      if (!uitgepakt) continue;

      const alsTekst = new TextDecoder("latin1").decode(uitgepakt);
      // Alleen streams die er als tekst uitzien; de rest is beeld of opmaak.
      if (!/\b(Tj|TJ)\b/.test(alsTekst)) continue;

      stukken.push(tekstUitStream(alsTekst));
    }
  } catch {
    return "";
  }

  return stukken.join(" ").replace(/\s+/g, " ").trim();
}
