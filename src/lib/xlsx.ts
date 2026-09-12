/**
 * Minimale lezer voor Excel-bestanden (.xlsx).
 *
 * Een xlsx-bestand is een zip met XML erin. We pakken alleen wat nodig is: het
 * eerste werkblad en de tabel met gedeelde teksten. Formules worden niet
 * uitgerekend; wel wordt de laatst bewaarde uitkomst gebruikt, en die staat er
 * altijd in zodra het bestand in Excel is opgeslagen.
 *
 * Bewust geen extern pakket voor het lezen van de sheets zelf: het formaat is
 * hier eenvoudig, en zo blijft er weinig code van derden in het project.
 */

import { unzipSync, strFromU8 } from "fflate";

function ontsnapAf(tekst: string): string {
  return tekst
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&amp;/g, "&");
}

/** Alle losse tekstjes uit één XML-element samenvoegen. */
function tekstUit(xml: string): string {
  const delen = [...xml.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((m) => m[1]);
  return ontsnapAf(delen.join(""));
}

/** "B12" -> kolom 1 (nul-gebaseerd). */
function kolomVan(verwijzing: string): number {
  const letters = verwijzing.match(/^[A-Z]+/)?.[0] ?? "A";
  let n = 0;
  for (const letter of letters) n = n * 26 + (letter.charCodeAt(0) - 64);
  return n - 1;
}

/**
 * Leest het eerste werkblad als rijen met cellen.
 * Lege cellen worden aangevuld, zodat de kolommen op hun plek blijven staan.
 */
export function leesXlsx(bytes: Uint8Array): string[][] {
  const bestanden = unzipSync(bytes);

  const gedeeld: string[] = [];
  const gedeeldXml = bestanden["xl/sharedStrings.xml"];
  if (gedeeldXml) {
    for (const m of strFromU8(gedeeldXml).matchAll(/<si>([\s\S]*?)<\/si>/g)) {
      gedeeld.push(tekstUit(m[1]));
    }
  }

  // Het eerste werkblad; de naam kan per programma verschillen.
  const bladNaam =
    Object.keys(bestanden)
      .filter((n) => /^xl\/worksheets\/sheet\d+\.xml$/.test(n))
      .sort()[0] ?? "";
  if (!bladNaam) return [];

  const blad = strFromU8(bestanden[bladNaam]);
  const rijen: string[][] = [];

  for (const rijMatch of blad.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)) {
    const cellen: string[] = [];

    for (const celMatch of rijMatch[1].matchAll(/<c([^>]*)>([\s\S]*?)<\/c>|<c([^>]*)\/>/g)) {
      const kenmerken = celMatch[1] ?? celMatch[3] ?? "";
      const inhoud = celMatch[2] ?? "";
      const kolom = kolomVan(kenmerken.match(/r="([A-Z]+\d+)"/)?.[1] ?? "A1");
      const soort = kenmerken.match(/t="([^"]+)"/)?.[1] ?? "n";

      let waarde = "";
      if (soort === "s") {
        const nr = Number(inhoud.match(/<v>(\d+)<\/v>/)?.[1] ?? -1);
        waarde = gedeeld[nr] ?? "";
      } else if (soort === "inlineStr") {
        waarde = tekstUit(inhoud);
      } else {
        waarde = ontsnapAf(inhoud.match(/<v>([\s\S]*?)<\/v>/)?.[1] ?? "");
      }

      while (cellen.length < kolom) cellen.push("");
      cellen[kolom] = waarde.trim();
    }

    rijen.push(cellen);
  }

  return rijen.filter((r) => r.some((c) => c !== ""));
}

/** Zet een werkblad om naar dezelfde vorm als een CSV-bestand. */
export function xlsxAlsCsv(bytes: Uint8Array): string {
  return leesXlsx(bytes)
    .map((rij) =>
      rij
        .map((cel) => (/[";\n]/.test(cel) ? `"${cel.replace(/"/g, '""')}"` : cel))
        .join(";"),
    )
    .join("\n");
}
