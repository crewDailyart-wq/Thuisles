/**
 * Erbijsommen en erafsommen tot en met 100 (WERKPLAN.md, groep 4: Optellen en
 * Aftrekken uitgebreid, oktober 2026).
 *
 * Eén type voor alle nieuwe oefeningen bij Optellen en Aftrekken boven de 20:
 * de kale som, de som met een oranje inktvlek, de som bij stippen, kiezen uit
 * vier sommen, handig optellen, twee getallen zoeken, beide kanten gelijk, en
 * de sommen met tientallen. Voor "aanvullen" en "koppelen" maakt het de
 * figuren van de bestaande types (`aanvultabel`, `koppelsommen`,
 * `minkoppelen`), zodat het kind daar hetzelfde scherm krijgt als tot 20.
 *
 * De bestaande types zijn met opzet niet aangepast: die werken tot en met 20
 * en blijven precies zoals ze zijn.
 *
 * Elke oefening heeft vijftien vaste opgaven, van makkelijk naar moeilijk: de
 * figuur draagt een `volgnummer`, en het oefenscherm zet de opgaven daarop in
 * volgorde.
 */

import type { Aanpak, Foutpatroon, Leeftijdsgroep, Somgegevens } from "@/lib/generatoren/foutpatroon";
import { MANIER_VAN_VORM } from "@/lib/generatoren/uitlegscript";
import type { Groepsvorm, Uitlegbron } from "@/lib/generatoren/uitlegscript";
import { getal, husselen, kansGenerator, tekst, type Figuur, type Generator, type Gegenereerd } from "@/lib/generatoren/soort";

type Kans = () => number;

const MIN = "−";

function tussen(k: Kans, van: number, tot: number): number {
  if (tot < van) return NaN;
  return van + Math.floor(k() * (tot - van + 1));
}

function kies<T>(k: Kans, lijst: readonly T[]): T {
  return lijst[Math.floor(k() * lijst.length)];
}

/** Gaat a + b over het tiental? */
const brugPlus = (a: number, b: number) => (a % 10) + (b % 10) >= 10;
/** Gaat a − b over het tiental? De eenheid van b is groter dan die van a. */
const brugMin = (a: number, b: number) => b % 10 > a % 10;

/** "14 + 7" of "26 − 9", met vaste spaties: een som breekt nooit over twee regels. */
function som(a: number, teken: string, b: number): string {
  return `${a}\u00a0${teken}\u00a0${b}`;
}

/** De plek in de som die het kind invult: 0 het eerste getal, 1 het tweede, 2 de uitkomst. */
type Plek = 0 | 1 | 2;

/** Wat het oefenscherm per opgave nodig heeft. */
export type Rekenfiguur = Extract<Figuur, { soort: "rekensom" }>;

// ---------------------------------------------------------------------------
// Getallen kiezen
// ---------------------------------------------------------------------------

type Bereik = { van: number; tot: number; brug: "ja" | "nee" | "vrij" };

function brugKlopt(brug: Bereik["brug"], gaatErover: boolean): boolean {
  return brug === "vrij" || (brug === "ja") === gaatErover;
}

/** Een plussom met de uitkomst tussen `van` en `tot`; beide getallen minstens 1. */
function plusPaar(k: Kans, b: Bereik): [number, number, number] | null {
  for (let p = 0; p < 80; p++) {
    const r = tussen(k, Math.max(b.van, 3), b.tot);
    const x = tussen(k, 1, r - 1);
    const y = r - x;
    if (Number.isNaN(r) || y < 1) continue;
    if (!brugKlopt(b.brug, brugPlus(x, y))) continue;
    return [x, y, r];
  }
  return null;
}

/** Een erafsom met het eerste getal tussen `van` en `tot`; de uitkomst minstens 1. */
function minPaar(k: Kans, b: Bereik): [number, number, number] | null {
  for (let p = 0; p < 80; p++) {
    const a = tussen(k, Math.max(b.van, 3), b.tot);
    /* Tot en met 20 haal je er een getal onder de tien af: 13 − 5, 18 − 5. */
    const y = tussen(k, 1, b.tot <= 20 ? Math.min(9, a - 1) : a - 1);
    if (Number.isNaN(a) || Number.isNaN(y) || a - y < 1) continue;
    if (!brugKlopt(b.brug, brugMin(a, y))) continue;
    return [a, y, a - y];
  }
  return null;
}

function paar(k: Kans, teken: string, b: Bereik) {
  return teken === "+" ? plusPaar(k, b) : minPaar(k, b);
}

/** De sommen met tientallen, elk met zijn eigen soort getallen. */
function tientalPaar(k: Kans, soort: string): [number, number, string] | null {
  for (let p = 0; p < 80; p++) {
    switch (soort) {
      case "tientalplus": {
        const t = tussen(k, 1, 9) * 10;
        const e = tussen(k, 1, 9);
        return [t, e, "+"];
      }
      case "eenhedenerbij": {
        const a = tussen(k, 11, 98);
        const e = tussen(k, 1, 8);
        if (a % 10 === 0 || (a % 10) + e > 9) continue;
        return [a, e, "+"];
      }
      case "tientallen": {
        const a = tussen(k, 1, 8) * 10;
        const b = tussen(k, 1, 9) * 10;
        if (a + b > 100) continue;
        return [a, b, "+"];
      }
      case "optiental": {
        const a = tussen(k, 1, 98);
        if (a % 10 === 0) continue;
        const b = 10 - (a % 10);
        if (a + b > 100) continue;
        return [a, b, "+"];
      }
      case "overtiental": {
        const a = tussen(k, 11, 94);
        const b = tussen(k, 2, 9);
        if (a % 10 === 0 || (a % 10) + b <= 10 || a + b > 100) continue;
        return [a, b, "+"];
      }
      case "getalplustientallen": {
        const a = tussen(k, 1, 89);
        const b = tussen(k, 1, 9) * 10;
        if (a % 10 === 0 || a + b > 100) continue;
        return [a, b, "+"];
      }
      case "samentiental": {
        const a = tussen(k, 11, 89);
        const b = tussen(k, 11, 89);
        if (a % 10 === 0 || (a % 10) + (b % 10) !== 10 || a + b > 100) continue;
        return [a, b, "+"];
      }
      case "heletientallen": {
        const a = tussen(k, 2, 10) * 10;
        const b = tussen(k, 1, a / 10) * 10;
        return [a, b, MIN];
      }
      case "eenhedenaf": {
        const a = tussen(k, 12, 99);
        if (a % 10 < 2) continue;
        const b = tussen(k, 1, (a % 10) - 1);
        return [a, b, MIN];
      }
      case "totheeltiental": {
        const a = tussen(k, 11, 99);
        if (a % 10 === 0) continue;
        return [a, a % 10, MIN];
      }
      case "tientallenaf": {
        const a = tussen(k, 21, 99);
        if (a % 10 === 0) continue;
        const b = tussen(k, 1, Math.floor(a / 10) - 1) * 10;
        if (Number.isNaN(b)) continue;
        return [a, b, MIN];
      }
      case "gelijkeeenheden": {
        const a = tussen(k, 21, 99);
        if (a % 10 === 0) continue;
        const b = tussen(k, 1, Math.floor(a / 10) - 1) * 10 + (a % 10);
        if (Number.isNaN(b)) continue;
        return [a, b, MIN];
      }
      case "vantiental": {
        const a = tussen(k, 2, 10) * 10;
        const b = tussen(k, 1, 9);
        return [a, b, MIN];
      }
      case "overtientalaf": {
        const a = tussen(k, 21, 99);
        const b = tussen(k, 2, 9);
        if (a % 10 === 0 || b <= a % 10) continue;
        return [a, b, MIN];
      }
    }
    return null;
  }
  return null;
}

const uitkomst = (a: number, teken: string, b: number) => (teken === "+" ? a + b : a - b);

/** Een som als sleutel; 15 + 51 en 51 + 15 zijn dezelfde, zodat ze nooit allebei een keuze zijn. */
function sleutel(a: number, teken: string, b: number): string {
  return teken === "+" ? `${Math.min(a, b)}+${Math.max(a, b)}` : `${a}-${b}`;
}

// ---------------------------------------------------------------------------
// De opgaven per stand
// ---------------------------------------------------------------------------

type Opgave = {
  handtekening: string;
  vraagtekst: string;
  antwoord: string;
  figuur: Figuur;
  som: Somgegevens;
  /** Hoe moeilijk, om op te sorteren. */
  stap: number;
};

/** Vier verschillende uitkomsten rond de goede: 1 of 10 ernaast bij plus, 1 of 2 bij min. */
function bijna(k: Kans, r: number, teken: string, max: number): number[] {
  const opties = teken === "+" ? [1, -1, 10, -10] : [1, -1, 2, -2];
  return husselen(k, opties)
    .map((d) => r + d)
    .filter((x) => x >= 0 && x <= Math.min(100, Math.max(max, r + 10)) && x !== r);
}

function maakOpgave(k: Kans, inst: Record<string, unknown>): Opgave | null {
  const stand = tekst(inst as never, "stand", "som");
  const teken = tekst(inst as never, "bewerking", "plus") === "min" ? MIN : "+";
  const b: Bereik = {
    van: getal(inst as never, "van", 1),
    tot: getal(inst as never, "tot", 20),
    brug: (tekst(inst as never, "brug", "vrij") as Bereik["brug"]) || "vrij",
  };

  switch (stand) {
    case "som":
    case "vlek": {
      const p = paar(k, teken, b);
      if (!p) return null;
      const [a, y, r] = p;
      const plekInst = tekst(inst as never, "plek", stand === "vlek" ? "tweede" : "uitkomst");
      const plek: Plek =
        plekInst === "eerste" ? 0 : plekInst === "tweede" ? 1 : plekInst === "overal" ? (kies(k, [0, 1, 2]) as Plek) : 2;
      const getallen = [a, y, r];
      const vlek = stand === "vlek";
      const tekstSom = `${som(a, teken, y)} = ${r}`;
      return {
        handtekening: `rekensom:${stand}:${tekstSom}:${plek}`,
        vraagtekst: vlek ? "Welk getal zit er onder de vlek?" : plek === 2 ? `Hoeveel is ${som(a, teken, y)}?` : "Welk getal hoort in het vakje?",
        antwoord: String(getallen[plek]),
        figuur: { soort: "rekensom", weergave: "som", teken, getallen, leeg: plek, vlek, volgnummer: 0, antwoordTekst: String(getallen[plek]) },
        som: { soort: "rekensom", variant: stand, getallen, goed: getallen[plek], extra: { teken: teken === "+" ? 1 : -1, plek } },
        stap: r + (brugPlus(a, y) || brugMin(a, y) ? 100 : 0),
      };
    }

    case "tientallen": {
      const t = tientalPaar(k, tekst(inst as never, "tiental", "tientalplus"));
      if (!t) return null;
      const [a, y, tk] = t;
      const r = uitkomst(a, tk, y);
      if (r < 0 || r > 100) return null;
      return {
        handtekening: `rekensom:tientallen:${som(a, tk, y)}`,
        vraagtekst: `Hoeveel is ${som(a, tk, y)}?`,
        antwoord: String(r),
        figuur: { soort: "rekensom", weergave: "som", teken: tk, getallen: [a, y, r], leeg: 2, vlek: false, volgnummer: 0, antwoordTekst: String(r) },
        som: { soort: "rekensom", variant: "tientallen", getallen: [a, y, r], goed: r, extra: { teken: tk === "+" ? 1 : -1, plek: 2 } },
        stap: a,
      };
    }

    case "stippen": {
      /* Twee groepjes stippen in rijen van vijf; het kind typt de hele som. */
      const p = plusPaar(k, b);
      if (!p) return null;
      const [a, y, r] = p;
      return {
        handtekening: `rekensom:stippen:${a}+${y}`,
        vraagtekst: "Tel de stippen. Maak de som en reken uit.",
        antwoord: `${a},${y},${r}`,
        figuur: { soort: "rekensom", weergave: "stippen", teken: "+", getallen: [a, y, r], leeg: null, vlek: false, volgnummer: 0, antwoordTekst: `${a} + ${y} = ${r}` },
        som: { soort: "rekensom", variant: "stippen", getallen: [a, y, r], goed: r, extra: { teken: 1, plek: 3 } },
        stap: r,
      };
    }

    case "klopt": {
      /* Vier sommen met een uitkomst; precies één klopt. */
      const kaarten: { tekst: string; goed: boolean }[] = [];
      const p = paar(k, teken, b);
      if (!p) return null;
      kaarten.push({ tekst: `${som(p[0], teken, p[1])}\u00a0=\u00a0${p[2]}`, goed: true });
      const gebruikt = new Set([sleutel(p[0], teken, p[1])]);
      for (let i = 0; i < 40 && kaarten.length < 4; i++) {
        const q = paar(k, teken, b);
        if (!q || gebruikt.has(sleutel(q[0], teken, q[1]))) continue;
        const fout = bijna(k, q[2], teken, b.tot)[0];
        if (fout === undefined) continue;
        gebruikt.add(sleutel(q[0], teken, q[1]));
        kaarten.push({ tekst: `${som(q[0], teken, q[1])}\u00a0=\u00a0${fout}`, goed: false });
      }
      if (kaarten.length < 4) return null;
      const gehusseld = husselen(k, kaarten);
      const goed = gehusseld.findIndex((c) => c.goed);
      return {
        handtekening: `rekensom:klopt:${gehusseld.map((c) => c.tekst).join("|")}`,
        vraagtekst: "Welke som klopt?",
        antwoord: String(goed),
        figuur: { soort: "rekensom", weergave: "kaarten", teken, getallen: p, leeg: null, vlek: false, volgnummer: 0, kaarten: gehusseld.map((c) => c.tekst), goed, antwoordTekst: gehusseld[goed].tekst },
        som: { soort: "rekensom", variant: "klopt", getallen: p, goed: p[2], extra: { teken: teken === "+" ? 1 : -1, keuze: 1 } },
        stap: p[2],
      };
    }

    case "nietbij": {
      /* Drie sommen komen uit op het doel, één net ernaast. */
      const doelPaar = paar(k, teken, b);
      if (!doelPaar) return null;
      const doel = doelPaar[2];
      const goedeSommen = new Set<string>();
      const lijst: [number, number][] = [];
      for (let i = 0; i < 80 && lijst.length < 3; i++) {
        const x = teken === "+" ? tussen(k, 1, doel - 1) : tussen(k, doel + 1, b.tot);
        const y = teken === "+" ? doel - x : x - doel;
        if (Number.isNaN(x) || y < 1 || goedeSommen.has(sleutel(x, teken, y))) continue;
        goedeSommen.add(sleutel(x, teken, y));
        lijst.push([x, y]);
      }
      if (lijst.length < 3) return null;
      const anders = kies(k, teken === "+" ? [doel - 1, doel + 1] : [doel - 1, doel + 1]);
      let fout: [number, number] | null = null;
      for (let i = 0; i < 60 && !fout; i++) {
        const x = teken === "+" ? tussen(k, 1, anders - 1) : tussen(k, anders + 1, b.tot);
        const y = teken === "+" ? anders - x : x - anders;
        if (Number.isNaN(x) || y < 1 || anders < 1 || goedeSommen.has(sleutel(x, teken, y))) continue;
        fout = [x, y];
      }
      if (!fout) return null;
      const kaarten = husselen(k, [...lijst.map(([x, y]) => ({ x, y, goed: false })), { x: fout[0], y: fout[1], goed: true }]);
      const goed = kaarten.findIndex((c) => c.goed);
      const vraag = teken === "+" ? `Welke som is niet ${doel}?` : `Welke som komt niet uit op ${doel}?`;
      const juist = som(fout[0], teken, fout[1]);
      return {
        handtekening: `rekensom:nietbij:${doel}:${kaarten.map((c) => som(c.x, teken, c.y)).join("|")}`,
        vraagtekst: vraag,
        antwoord: String(goed),
        figuur: { soort: "rekensom", weergave: "kaarten", teken, getallen: [fout[0], fout[1], anders], leeg: null, vlek: false, volgnummer: 0, kaarten: kaarten.map((c) => som(c.x, teken, c.y)), goed, antwoordTekst: juist },
        som: { soort: "rekensom", variant: "nietbij", getallen: [fout[0], fout[1], doel, anders], goed: anders, extra: { teken: teken === "+" ? 1 : -1, keuze: 1 } },
        stap: doel,
      };
    }

    case "evenveel": {
      /* Eén som bovenaan; precies één van de vier kaartjes komt op hetzelfde uit. */
      const boven = paar(k, teken, b);
      if (!boven) return null;
      const r = boven[2];
      let goedKaart: [number, number] | null = null;
      for (let i = 0; i < 60 && !goedKaart; i++) {
        const x = teken === "+" ? tussen(k, 1, r - 1) : tussen(k, r + 1, b.tot);
        const y = teken === "+" ? r - x : x - r;
        if (Number.isNaN(x) || y < 1 || (x === boven[0] && y === boven[1]) || (x === boven[1] && y === boven[0])) continue;
        goedKaart = [x, y];
      }
      if (!goedKaart) return null;
      const fouten: [number, number][] = [];
      const gezien = new Set([sleutel(goedKaart[0], teken, goedKaart[1]), sleutel(boven[0], teken, boven[1])]);
      for (const d of bijna(k, r, teken, b.tot)) {
        if (fouten.length >= 3) break;
        for (let i = 0; i < 30; i++) {
          const x = teken === "+" ? tussen(k, 1, d - 1) : tussen(k, d + 1, b.tot);
          const y = teken === "+" ? d - x : x - d;
          if (Number.isNaN(x) || y < 1 || d < 0 || gezien.has(sleutel(x, teken, y))) continue;
          gezien.add(sleutel(x, teken, y));
          fouten.push([x, y]);
          break;
        }
      }
      if (fouten.length < 3) return null;
      const kaarten = husselen(k, [{ x: goedKaart[0], y: goedKaart[1], goed: true }, ...fouten.map(([x, y]) => ({ x, y, goed: false }))]);
      const goed = kaarten.findIndex((c) => c.goed);
      const bovenSom = som(boven[0], teken, boven[1]);
      return {
        handtekening: `rekensom:evenveel:${bovenSom}:${kaarten.map((c) => som(c.x, teken, c.y)).join("|")}`,
        vraagtekst: teken === "+" ? `Welke som is evenveel als ${bovenSom}?` : "Welke som heeft dezelfde uitkomst?",
        antwoord: String(goed),
        figuur: {
          soort: "rekensom", weergave: "kaarten", teken, getallen: [goedKaart[0], goedKaart[1], r], leeg: null, vlek: false, volgnummer: 0,
          kaarten: kaarten.map((c) => som(c.x, teken, c.y)), goed, boven: teken === "+" ? null : bovenSom,
          antwoordTekst: som(goedKaart[0], teken, goedKaart[1]),
        },
        som: { soort: "rekensom", variant: "evenveel", getallen: [boven[0], boven[1], goedKaart[0], goedKaart[1]], goed: r, extra: { teken: teken === "+" ? 1 : -1, keuze: 1 } },
        stap: r,
      };
    }

    case "handig": {
      /* Zes getallen die per twee een tiental maken: 6 + 4, 1 + 9, 13 + 7. */
      for (let p = 0; p < 60; p++) {
        const paren: [number, number][] = [];
        for (let i = 0; i < 3; i++) {
          const tiental = kies(k, [10, 10, 20, 20, 30]);
          const x = tussen(k, 1, tiental - 1);
          if (x % 10 === 0) break;
          paren.push([x, tiental - x]);
        }
        if (paren.length < 3) continue;
        const lijst = husselen(k, paren.flat());
        const totaal = lijst.reduce((s, x) => s + x, 0);
        if (totaal > 100 || new Set(lijst).size < 5) continue;
        return {
          handtekening: `rekensom:handig:${[...lijst].sort((a, c) => a - c).join("+")}`,
          vraagtekst: "Tel alle getallen op. Zoek eerst twee getallen die samen een tiental zijn.",
          antwoord: String(totaal),
          figuur: { soort: "rekensom", weergave: "handig", teken: "+", getallen: [0, 0, totaal], leeg: 2, vlek: false, volgnummer: 0, lijst, antwoordTekst: String(totaal) },
          som: { soort: "rekensom", variant: "handig", getallen: lijst, goed: totaal, extra: { teken: 1 } },
          stap: totaal,
        };
      }
      return null;
    }

    case "tweegetallen": {
      /* Zes getallen; precies één paar maakt samen het doel. */
      const p = plusPaar(k, b);
      if (!p) return null;
      const [x, y, doel] = p;
      if (x === y) return null;
      const lijst = [x, y];
      for (let i = 0; i < 80 && lijst.length < 6; i++) {
        const z = tussen(k, 1, doel - 1);
        if (lijst.includes(z)) continue;
        /* Geen tweede paar dat ook op het doel uitkomt. */
        if (lijst.some((w) => w + z === doel)) continue;
        lijst.push(z);
      }
      if (lijst.length < 6) return null;
      const gehusseld = husselen(k, lijst);
      return {
        handtekening: `rekensom:tweegetallen:${doel}:${[...lijst].sort((a, c) => a - c).join(",")}`,
        vraagtekst: `Welke twee getallen zijn samen ${doel}?`,
        antwoord: `${x},${y}|${y},${x}`,
        figuur: { soort: "rekensom", weergave: "tweegetallen", teken: "+", getallen: [x, y, doel], leeg: null, vlek: false, volgnummer: 0, lijst: gehusseld, antwoordTekst: `${x} en ${y}` },
        som: { soort: "rekensom", variant: "tweegetallen", getallen: [x, y, doel], goed: doel, extra: { teken: 1 } },
        stap: doel,
      };
    }

    case "balans": {
      /* Twee sommen met een isgelijkteken; één getal ontbreekt. */
      for (let p = 0; p < 80; p++) {
        const links = paar(k, teken, b);
        if (!links) return null;
        const r = links[2];
        /* De andere kant: bij plus een plussom, bij min een erafsom of een plussom. */
        const ander = teken === "+" ? "+" : kies(k, ["+", MIN]);
        const x = ander === "+" ? tussen(k, 1, r - 1) : tussen(k, r + 1, b.tot);
        const y = ander === "+" ? r - x : x - r;
        if (Number.isNaN(x) || y < 1 || r < 2) continue;
        const kanten = kies(k, [0, 1]) === 0
          ? { links: [links[0], links[1]] as number[], linksTeken: teken, rechts: [x, y] as number[], rechtsTeken: ander }
          : { links: [x, y] as number[], linksTeken: ander, rechts: [links[0], links[1]] as number[], rechtsTeken: teken };
        const leeg = tussen(k, 0, 3);
        const alle = [...kanten.links, ...kanten.rechts];
        const antwoord = alle[leeg];
        const tekstVan = (i: number) => (i === leeg ? "☐" : String(alle[i]));
        const zin = `${tekstVan(0)} ${kanten.linksTeken} ${tekstVan(1)} = ${tekstVan(2)} ${kanten.rechtsTeken} ${tekstVan(3)}`;
        return {
          handtekening: `rekensom:balans:${zin}`,
          vraagtekst: "Maak beide kanten gelijk.",
          antwoord: String(antwoord),
          figuur: { soort: "rekensom", weergave: "balans", teken, getallen: alle, leeg, vlek: false, volgnummer: 0, linksTeken: kanten.linksTeken, rechtsTeken: kanten.rechtsTeken, antwoordTekst: String(antwoord) },
          som: { soort: "rekensom", variant: "balans", getallen: alle, goed: antwoord, extra: { links: kanten.linksTeken === "+" ? 1 : -1, rechts: kanten.rechtsTeken === "+" ? 1 : -1, leeg } },
          stap: r,
        };
      }
      return null;
    }

    case "aanvullen": {
      /* Vier opeenvolgende getallen; onder elk hoeveel er nog bij moet tot het doel. */
      const doel = getal(inst as never, "doel", 0) || tussen(k, Math.max(b.van, 8), b.tot);
      const start = tussen(k, 1, doel - 4);
      if (Number.isNaN(start)) return null;
      const getallen = [start, start + 1, start + 2, start + 3];
      return {
        handtekening: `rekensom:aanvullen:${doel}:${start}`,
        vraagtekst: `Hoeveel moet erbij tot ${doel}?`,
        antwoord: getallen.map((g) => doel - g).join(","),
        figuur: { soort: "aanvultabel", doel, getallen, volgnummer: 0 } as Figuur,
        som: { soort: "rekensom", variant: "aanvullen", getallen: [doel, ...getallen], goed: doel - start, extra: { teken: 1 } },
        stap: doel * 100 + start,
      };
    }

    case "aanvullentot": {
      /* Aanvullen tot een rond getal: 63 + ☐ = 100. */
      const doel = getal(inst as never, "doel", 100);
      const a = tussen(k, Math.max(1, b.van), doel - 1);
      const y = doel - a;
      return {
        handtekening: `rekensom:aanvullentot:${a}`,
        vraagtekst: "Welk getal hoort in het vakje?",
        antwoord: String(y),
        figuur: { soort: "rekensom", weergave: "som", teken: "+", getallen: [a, y, doel], leeg: 1, vlek: false, volgnummer: 0, antwoordTekst: String(y) },
        som: { soort: "rekensom", variant: "aanvullentot", getallen: [a, y, doel], goed: y, extra: { teken: 1, plek: 1 } },
        stap: a % 10 === 0 ? a : 100 + a,
      };
    }

    case "koppelen": {
      /* Vijf sommen, vijf verschillende uitkomsten die dicht bij elkaar liggen. */
      for (let p = 0; p < 80; p++) {
        const midden = tussen(k, Math.max(b.van, 8), b.tot - 4);
        if (Number.isNaN(midden)) return null;
        const uitkomsten = husselen(k, [0, 1, 2, 3, 4, 5, 6].map((d) => midden - 2 + d)).slice(0, 5).filter((x) => x >= 1 && x <= b.tot);
        if (uitkomsten.length < 5) continue;
        const sommen: { eerste: number; tweede: number }[] = [];
        for (const r of uitkomsten) {
          const x = teken === "+" ? tussen(k, 1, r - 1) : tussen(k, r + 1, b.tot);
          const y = teken === "+" ? r - x : x - r;
          if (Number.isNaN(x) || y < 1) break;
          sommen.push({ eerste: x, tweede: y });
        }
        if (sommen.length < 5) continue;
        const keuzes = husselen(k, [...uitkomsten]);
        const figuur = teken === "+"
          ? ({ soort: "koppelsommen", sommen, keuzes, volgnummer: 0 } as Figuur)
          : ({ soort: "minkoppelen", sommen, keuzes, volgnummer: 0 } as Figuur);
        return {
          handtekening: `rekensom:koppelen:${sommen.map((s) => som(s.eerste, teken, s.tweede)).join("|")}`,
          vraagtekst: "Sleep de uitkomst naar de som.",
          antwoord: uitkomsten.join(","),
          figuur,
          som: { soort: "rekensom", variant: "koppelen", getallen: [sommen[0].eerste, sommen[0].tweede], goed: uitkomsten[0], extra: { teken: teken === "+" ? 1 : -1, rijen: 5 } },
          stap: midden,
        };
      }
      return null;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Uitleg: het goede antwoord in gewone taal
// ---------------------------------------------------------------------------

const t = (som: Somgegevens, i: number) => som.getallen[i] ?? 0;
const tekenVan = (n: number | undefined) => (n === -1 ? MIN : "+");

/** De zin na een fout antwoord: "Het goede antwoord is 8, want 15 − 7 = 8." */
function controleVan(s: Somgegevens): string {
  const tk = tekenVan(s.extra?.teken);
  switch (s.variant) {
    case "som":
    case "vlek":
    case "tientallen":
    case "aanvullentot":
      return `Het goede antwoord is ${s.goed}, want ${t(s, 0)} ${tk} ${t(s, 1)} = ${t(s, 2)}.`;
    case "stippen":
      return `Het goede antwoord is ${t(s, 0)} + ${t(s, 1)} = ${t(s, 2)}.`;
    case "klopt":
      return `Het goede antwoord is ${t(s, 0)} ${tk} ${t(s, 1)} = ${t(s, 2)}.`;
    case "nietbij":
      return `Het goede antwoord is ${t(s, 0)} ${tk} ${t(s, 1)}, want dat is ${t(s, 3)} en niet ${t(s, 2)}.`;
    case "evenveel":
      return `Het goede antwoord is ${t(s, 2)} ${tk} ${t(s, 3)}, want dat is ${s.goed}, net als ${t(s, 0)} ${tk} ${t(s, 1)}.`;
    case "handig":
      return `Het goede antwoord is ${s.goed}, want ${s.getallen.join(" + ")} = ${s.goed}.`;
    case "tweegetallen":
      return `Het goede antwoord is ${t(s, 0)} en ${t(s, 1)}, want ${t(s, 0)} + ${t(s, 1)} = ${t(s, 2)}.`;
    case "balans": {
      const l = tekenVan(s.extra?.links);
      const r = tekenVan(s.extra?.rechts);
      const links = l === "+" ? t(s, 0) + t(s, 1) : t(s, 0) - t(s, 1);
      return `Het goede antwoord is ${s.goed}, want ${t(s, 0)} ${l} ${t(s, 1)} = ${links} en ${t(s, 2)} ${r} ${t(s, 3)} = ${links}.`;
    }
    case "aanvullen":
      return `Het goede antwoord is ${s.getallen.slice(1).map((g) => t(s, 0) - g).join(", ")}: samen met het getal erboven is dat steeds ${t(s, 0)}.`;
    case "koppelen":
      return "Reken elke som uit en zoek dan de uitkomst die erbij hoort.";
  }
  return `Het goede antwoord is ${s.goed}.`;
}

function somRegel(s: Somgegevens): string {
  const tk = tekenVan(s.extra?.teken);
  if (["som", "vlek", "tientallen", "aanvullentot", "stippen", "klopt"].includes(s.variant ?? "")) {
    return `${t(s, 0)} ${tk} ${t(s, 1)} = ${t(s, 2)}`;
  }
  if (s.variant === "handig") return `${s.getallen.join(" + ")} = ${s.goed}`;
  if (s.variant === "evenveel") return `${t(s, 2)} ${tk} ${t(s, 3)} = ${s.goed}`;
  if (s.variant === "nietbij") return `${t(s, 0)} ${tk} ${t(s, 1)} = ${t(s, 3)}`;
  if (s.variant === "tweegetallen") return `${t(s, 0)} + ${t(s, 1)} = ${t(s, 2)}`;
  return String(s.goed);
}

const rekenAanpak: Aanpak = {
  zin: (s): Record<Leeftijdsgroep, string> => ({
    "34": s.extra?.teken === -1 ? "Haal het tweede getal eraf." : "Tel de getallen bij elkaar.",
    "56":
      s.extra?.teken === -1
        ? "Haal eerst de tientallen eraf en daarna de eenheden. Ga je over het tiental, spring dan eerst naar het hele tiental."
        : "Tel eerst de tientallen en dan de eenheden. Ga je over het tiental, maak dan eerst het tiental vol.",
    "78": "Splits het getal in tientallen en eenheden en reken in stappen: eerst naar het hele tiental, dan de rest.",
  }),
  stappen: (s) => [
    { tekst: "Kijk goed naar de getallen.", som: somRegel(s).split(" = ")[0] },
    { tekst: "Reken in stappen uit.", som: somRegel(s) },
  ],
  controle: controleVan,
};

const rekenPatronen: Foutpatroon[] = [
  {
    id: "erbij-in-plaats-van-eraf",
    naam: "Erbij gedaan in plaats van eraf",
    herkent: (s, gegeven) =>
      s.extra?.teken === -1 && s.extra?.plek === 2 && gegeven === t(s, 0) + t(s, 1) && gegeven !== s.goed,
    kindtekst: {
      "34": "Kijk naar het teken: het is eraf, niet erbij.",
      "56": "Je hebt de getallen bij elkaar opgeteld. Bij een minteken haal je het tweede getal eraf.",
      "78": "Het minteken vraagt om aftrekken; je hebt opgeteld. Haal het tweede getal van het eerste af.",
    },
    hint: "Kijk goed naar het teken tussen de getallen.",
    uitleg: (s) => [{ tekst: "Haal het tweede getal eraf.", som: somRegel(s) }],
    ouder: {
      uitleg: "Er is opgeteld bij een erafsom.",
      zinnen: ["Wijs samen het teken aan voordat je gaat rekenen.", "Vraag: wordt het meer of minder?"],
      schoolwoord: "erafsom",
    },
  },
];

const STRATEGIE = { waarde: "in-stappen", label: "Reken in stappen", uitleg: "Eerst de tientallen, dan de eenheden; over het tiental via het hele tiental." };

const rekenUitleg: Uitlegbron = {
  modellen: ["som"],
  strategieen: [STRATEGIE],
  standaardStrategie: () => STRATEGIE.waarde,
  script(s, vorm: Groepsvorm) {
    const kort = MANIER_VAN_VORM[vorm] === "34";
    const regel = somRegel(s);
    const stappen = [
      { som: regel.split(" = ")[0], zin: kort ? "Kijk naar de som." : "Kijk goed naar de getallen en het teken." },
      { som: regel, zin: kort ? "Dat is het antwoord!" : `Het antwoord is ${s.goed}.` },
    ];
    return {
      vorm,
      strategie: STRATEGIE.waarde,
      strategieNaam: STRATEGIE.label,
      stappen: stappen.map((st, i) => {
        const laatste = i === stappen.length - 1;
        return {
          model: { soort: "som" as const, tekst: st.som },
          zin: st.zin,
          houding: laatste ? ("juichend" as const) : ("wijzend" as const),
          ...(laatste ? { feest: true, beweging: "juichen" as const } : {}),
        };
      }),
    };
  },
  vergelijkbaar: () => null,
};

// ---------------------------------------------------------------------------
// De generator
// ---------------------------------------------------------------------------

const ZIN = "{zin}";
const ZINNEN: Record<Leeftijdsgroep, string> = { "34": ZIN, "56": ZIN, "78": ZIN };

export const rekensomGenerator: Generator = {
  id: "rekensom",
  naam: "Erbij- en erafsommen tot en met 100",
  uitleg:
    "Erbijsommen en erafsommen boven de 20: de kale som, de som met een vlek, stippen, kiezen uit vier sommen, handig optellen, twee getallen zoeken, beide kanten gelijk, aanvullen, koppelen en de sommen met tientallen. Vijftien vaste opgaven, van makkelijk naar moeilijk.",
  suggestie: "Groep 4: optellen en aftrekken tot en met 30, 40, 50 en 100",
  velden: [
    {
      soort: "keuze", sleutel: "bewerking", label: "Erbij of eraf",
      opties: [{ waarde: "plus", label: "Erbij (optellen)" }, { waarde: "min", label: "Eraf (aftrekken)" }],
    },
    {
      soort: "keuze", sleutel: "stand", label: "Wat het kind doet",
      opties: [
        { waarde: "som", label: "Kale som uitrekenen" },
        { waarde: "vlek", label: "Een getal onder een vlek" },
        { waarde: "stippen", label: "Som bij twee groepjes stippen" },
        { waarde: "klopt", label: "Welke som klopt?" },
        { waarde: "nietbij", label: "Welke som past er niet bij?" },
        { waarde: "evenveel", label: "Welke som heeft dezelfde uitkomst?" },
        { waarde: "handig", label: "Handig optellen: zes getallen" },
        { waarde: "tweegetallen", label: "Twee getallen die samen … zijn" },
        { waarde: "balans", label: "Beide kanten gelijk" },
        { waarde: "aanvullen", label: "Aanvullen in de tabel" },
        { waarde: "aanvullentot", label: "Aanvullen tot een rond getal" },
        { waarde: "koppelen", label: "Sommen en uitkomsten koppelen" },
        { waarde: "tientallen", label: "Rekenen met tientallen" },
      ],
    },
    { soort: "getal", sleutel: "van", label: "Kleinste getal (uitkomst bij erbij, begingetal bij eraf)", min: 1, max: 100 },
    { soort: "getal", sleutel: "tot", label: "Grootste getal", min: 2, max: 100 },
    {
      soort: "keuze", sleutel: "brug", label: "Over het tiental",
      opties: [{ waarde: "vrij", label: "Maakt niet uit" }, { waarde: "nee", label: "Niet over het tiental" }, { waarde: "ja", label: "Wel over het tiental" }],
    },
    {
      soort: "keuze", sleutel: "plek", label: "Waar het lege vakje of de vlek staat",
      opties: [{ waarde: "uitkomst", label: "De uitkomst" }, { waarde: "tweede", label: "Het tweede getal" }, { waarde: "eerste", label: "Het eerste getal" }, { waarde: "overal", label: "Overal" }],
    },
    {
      soort: "tekst", sleutel: "tiental", label: "Soort som met tientallen", plaatshouder: "tientalplus",
      hulp: "Erbij: tientalplus, eenhedenerbij, tientallen, optiental, overtiental, getalplustientallen, samentiental · Eraf: heletientallen, eenhedenaf, totheeltiental, tientallenaf, gelijkeeenheden, vantiental, overtientalaf",
    },
    { soort: "getal", sleutel: "doel", label: "Vast doelgetal (leeg = verschillend)", min: 0, max: 100 },
    { soort: "getal", sleutel: "niveau", label: "Bolletjes (1 tot en met 5)", min: 1, max: 5 },
  ],
  vraagteksten: { standaard: ZINNEN },
  standaard: { bewerking: "plus", stand: "som", van: 21, tot: 50, brug: "vrij", plek: "uitkomst", tiental: "tientalplus", doel: 0, niveau: 2 },
  foutpatronen: rekenPatronen,
  aanpak: rekenAanpak,
  uitleganimatie: rekenUitleg,

  maximum: () => null,

  maak(inst, aantal, alGebruikt, zaad) {
    const k = kansGenerator(zaad);
    const opgaven: Opgave[] = [];
    for (let poging = 0; poging < aantal * 300 && opgaven.length < aantal; poging++) {
      const o = maakOpgave(k, inst as Record<string, unknown>);
      if (!o || alGebruikt.has(o.handtekening)) continue;
      const alleGetallen = o.som.getallen;
      if (alleGetallen.some((g) => g < 0 || g > 100) || o.som.goed < 0 || o.som.goed > 100) continue;
      alGebruikt.add(o.handtekening);
      opgaven.push(o);
    }
    /* Van makkelijk naar moeilijk; het volgnummer gaat mee in de figuur. */
    opgaven.sort((a, c) => a.stap - c.stap);
    return opgaven.map((o, i): Gegenereerd => ({
      handtekening: o.handtekening,
      vorm: "open",
      vraagtekst: o.vraagtekst,
      antwoord: o.antwoord,
      figuur: { ...o.figuur, volgnummer: i + 1 } as Figuur,
      somgegevens: o.som,
    }));
  },
};
