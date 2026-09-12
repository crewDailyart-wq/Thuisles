/**
 * Het voorbeeldbestand voor de bulk-upload.
 *
 * Wordt hier opgebouwd in plaats van als vast bestand neergezet, zodat de
 * kolommen altijd gelijk zijn aan wat de import verwacht. De voorbeeldrijen
 * gebruiken echte leerdoelcodes uit de database, zodat het bestand meteen
 * werkt als je het ongewijzigd uploadt.
 */

import { CSV_KOLOMMEN } from "@/lib/data/import";
import { haalLeerdoelen } from "@/lib/data/vragen";

function veld(waarde: string): string {
  return /[",;\n]/.test(waarde) ? `"${waarde.replace(/"/g, '""')}"` : waarde;
}

export async function GET(
  _verzoek: Request,
  { params }: { params: Promise<{ vak: string }> },
) {
  const { vak } = await params;
  const leerdoelen = haalLeerdoelen().filter((l) => l.vakSlug === vak);
  if (leerdoelen.length === 0) {
    return new Response("Dit vak heeft nog geen leerdoelen.", { status: 404 });
  }

  const tafels = leerdoelen.find((l) => l.code === "REK-BEW-TAF-02") ?? leerdoelen[0];
  const optellen = leerdoelen.find((l) => l.code === "REK-BEW-OPT-02") ?? leerdoelen[0];
  const breuken = leerdoelen.find((l) => l.code === "REK-GET-BRK-01") ?? leerdoelen[0];

  /** Vult een rij aan met lege kolommen tot de volledige breedte. */
  const rij = (waarden: string[]) =>
    CSV_KOLOMMEN.map((_, i) => waarden[i] ?? "");

  const rijen = [
    [...CSV_KOLOMMEN],
    rij([
      tafels.vakNaam,
      tafels.domeinNaam,
      tafels.subdomeinNaam,
      tafels.code,
      String(tafels.groepVan),
      "meerkeuze",
      "Hoeveel is 6 x 4?",
      "20|22|*24|26",
      "Tel zes keer vier bij elkaar op.",
      "6 x 4 betekent 6 keer 4 erbij: 4, 8, 12, 16, 20, 24.",
    ]),
    rij([
      optellen.vakNaam,
      optellen.domeinNaam,
      optellen.subdomeinNaam,
      optellen.code,
      String(optellen.groepVan),
      "open",
      "Hoeveel is 48 + 27?",
      "75|vijfenzeventig",
      "Maak eerst 48 + 20, en tel daarna 7 erbij.",
      "48 + 27: maak eerst 50 (dat is +2), dan nog +25 = 75.",
    ]),
    rij([
      tafels.vakNaam,
      tafels.domeinNaam,
      tafels.subdomeinNaam,
      tafels.code,
      String(tafels.groepVan),
      "waar/niet waar",
      "3 x 6 is 18",
      "waar",
      "",
      "3 x 6 betekent 3 keer 6 erbij: 6, 12, 18. Dat klopt dus.",
    ]),
    // Meerkeuze met een afbeelding per antwoord. De tekst mag hier leeg
    // blijven; het sterretje geeft nog steeds aan welk antwoord goed is.
    rij([
      breuken.vakNaam,
      breuken.domeinNaam,
      breuken.subdomeinNaam,
      breuken.code,
      String(breuken.groepVan),
      "meerkeuze",
      "Welke figuur laat een halve cirkel zien?",
      "een kwart|*de helft|driekwart|helemaal vol",
      "Denk aan een pizza die je in twee gelijke stukken snijdt.",
      "Bij de helft is de cirkel in twee even grote stukken verdeeld, en is er één gekleurd.",
      "",
      "",
      "breuk-kwart.svg",
      "breuk-half.svg",
      "breuk-driekwart.svg",
      "breuk-heel.svg",
    ]),
  ];

  // Puntkomma's: daar gaat Nederlandse Excel goed mee om.
  const csv = rijen.map((r) => r.map(veld).join(";")).join("\r\n");

  return new Response(`﻿${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="thuisles-vragen-voorbeeld.csv"',
      "Cache-Control": "no-store",
    },
  });
}
