/**
 * Het bestand van een werkblad of poster, van schijf.
 *
 * Uploads komen na het bouwen van de site, dus Next kent ze niet als gewone
 * bestanden in public/. Daarom levert deze route ze: alleen veilige namen en
 * alleen de toegestane soorten (zie src/lib/data/werkbladen.ts).
 */

import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { WERKBLAD_SOORTEN, WERKBLADEN_MAP, extensieVanWerkblad } from "@/lib/data/werkbladen";

const VEILIGE_NAAM = /^[a-z0-9][a-z0-9.-]*$/;

export async function GET(_verzoek: Request, { params }: RouteContext<"/werkbladen/bestand/[naam]">) {
  const { naam } = await params;
  const extensie = extensieVanWerkblad(naam);
  if (!VEILIGE_NAAM.test(naam) || !extensie) return new Response("Niet gevonden", { status: 404 });

  const bestand = path.join(WERKBLADEN_MAP, naam);
  let info: fs.Stats;
  try {
    info = await fs.promises.stat(bestand);
  } catch {
    return new Response("Niet gevonden", { status: 404 });
  }
  const stroom = Readable.toWeb(fs.createReadStream(bestand)) as ReadableStream<Uint8Array>;
  return new Response(stroom, {
    headers: {
      "Content-Type": WERKBLAD_SOORTEN[extensie],
      "Content-Length": String(info.size),
      "Content-Disposition": `inline; filename="${naam}"`,
      "Cache-Control": "public, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
