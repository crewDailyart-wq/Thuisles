/**
 * Afbeeldingen bij vragen die er pas ná het bouwen van de site bij kwamen.
 *
 * De productieserver van Next kent alleen de bestanden die bij het bouwen al
 * in `public/` stonden. Een plaatje dat je daarna uploadt, gaf daardoor 404,
 * ook al stond het bestand er gewoon. Staat een bestand wél in de gebouwde
 * public-map, dan levert Next dat zelf en komt het verzoek hier niet.
 *
 * Het bestand komt uit AFBEELDINGEN_MAP: online de vaste schijf, op de laptop
 * public/vragen. Alleen veilige namen en toegestane soorten.
 */

import fs from "node:fs";
import path from "node:path";
import { AFBEELDINGEN_MAP } from "@/lib/data/afbeeldingen";
import { TOEGESTAAN, extensieVan } from "@/lib/afbeeldingregels";

const VEILIGE_NAAM = /^[A-Za-z0-9._-]+$/;

export async function GET(_verzoek: Request, { params }: RouteContext<"/vragen/[naam]">) {
  const { naam } = await params;
  const soort = TOEGESTAAN[extensieVan(naam)];
  if (!VEILIGE_NAAM.test(naam) || !soort) return new Response("Niet gevonden", { status: 404 });

  let bytes: Buffer;
  try {
    bytes = await fs.promises.readFile(path.join(AFBEELDINGEN_MAP, naam));
  } catch {
    return new Response("Niet gevonden", { status: 404 });
  }

  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": soort,
      "Cache-Control": "public, max-age=3600",
      "X-Content-Type-Options": "nosniff",
      // Een geüploade SVG mag nooit een script uitvoeren.
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'",
    },
  });
}
