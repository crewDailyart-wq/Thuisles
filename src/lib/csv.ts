/**
 * Inlezen van het CSV-bestand voor de bulk-upload.
 *
 * Eigen lezer, geen extra pakket: het bestand is klein en de regels zijn
 * eenvoudig. Wel opgevangen wat er in de praktijk misgaat bij Excel:
 *
 *   - Nederlandse Excel schrijft puntkomma's in plaats van komma's;
 *   - velden met een komma of een regeleinde staan tussen dubbele aanhalings-
 *     tekens, met "" voor een echt aanhalingsteken;
 *   - Windows-regeleindes en een onzichtbaar BOM-teken vooraan.
 */

export type CsvRij = Record<string, string>;

/** Raadt het scheidingsteken op basis van de kopregel. */
function raadScheidingsteken(kop: string): string {
  const punt = (kop.match(/;/g) ?? []).length;
  const komma = (kop.match(/,/g) ?? []).length;
  const tab = (kop.match(/\t/g) ?? []).length;
  if (tab > punt && tab > komma) return "\t";
  return punt > komma ? ";" : ",";
}

function splitsVelden(regel: string, scheiding: string): string[] {
  const velden: string[] = [];
  let veld = "";
  let inAanhaling = false;

  for (let i = 0; i < regel.length; i++) {
    const teken = regel[i];

    if (inAanhaling) {
      if (teken === '"') {
        if (regel[i + 1] === '"') {
          veld += '"';
          i++;
        } else {
          inAanhaling = false;
        }
      } else {
        veld += teken;
      }
      continue;
    }

    if (teken === '"') inAanhaling = true;
    else if (teken === scheiding) {
      velden.push(veld);
      veld = "";
    } else veld += teken;
  }

  velden.push(veld);
  return velden.map((v) => v.trim());
}

export function leesCsv(tekst: string): { kolommen: string[]; rijen: CsvRij[] } {
  const schoon = tekst.replace(/^﻿/, "").replace(/\r\n?/g, "\n");
  const regels = schoon.split("\n").filter((r) => r.trim() !== "");
  if (regels.length === 0) return { kolommen: [], rijen: [] };

  const scheiding = raadScheidingsteken(regels[0]);
  const kolommen = splitsVelden(regels[0], scheiding).map((k) =>
    k.toLowerCase().replace(/\s+/g, ""),
  );

  const rijen = regels.slice(1).map((regel) => {
    const velden = splitsVelden(regel, scheiding);
    const rij: CsvRij = {};
    kolommen.forEach((kolom, i) => {
      rij[kolom] = velden[i] ?? "";
    });
    return rij;
  });

  return { kolommen, rijen };
}
