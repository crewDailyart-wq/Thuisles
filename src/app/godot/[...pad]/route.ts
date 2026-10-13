/**
 * De Godot-spelletjes online (Railway, oktober 2026).
 *
 * De webexport van Godot (public/godot/, ±40 MB) staat niet in Git: te groot.
 * Op de laptop levert Next de bestanden gewoon uit public/. Online bouwt
 * Railway de site uit GitHub, en daar zitten ze dus niet in de gebouwde
 * public-map. `npm run online` zet ze daarom op de vaste schijf (/data/godot;
 * THUISLES_GODOT wijst ernaar) en deze route levert ze van daar. Staat een
 * bestand wél in de gebouwde public-map, dan levert Next dat zelf en komt het
 * verzoek hier niet.
 *
 * Alleen gewone namen per deel van het pad (geen ".."), en alleen de soorten
 * bestanden die een webexport van Godot heeft.
 */

import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";

const MAP = process.env.THUISLES_GODOT ?? path.join(process.cwd(), "public", "godot");
const VEILIG_DEEL = /^[A-Za-z0-9_-][A-Za-z0-9._-]*$/;
const SOORTEN: Record<string, string> = {
  html: "text/html; charset=utf-8",
  js: "text/javascript; charset=utf-8",
  wasm: "application/wasm",
  pck: "application/octet-stream",
  png: "image/png",
  svg: "image/svg+xml",
  ico: "image/x-icon",
  json: "application/json",
};

function nietGevonden() {
  return new Response("Niet gevonden", { status: 404 });
}

export async function GET(verzoek: Request, { params }: RouteContext<"/godot/[...pad]">) {
  const { pad } = await params;
  if (pad.length === 0 || !pad.every((deel) => VEILIG_DEEL.test(deel))) return nietGevonden();
  const soort = SOORTEN[path.extname(pad[pad.length - 1]).slice(1).toLowerCase()];
  if (!soort) return nietGevonden();

  const bestand = path.join(MAP, ...pad);
  let info: fs.Stats;
  try {
    info = await fs.promises.stat(bestand);
  } catch {
    return nietGevonden();
  }
  if (!info.isFile()) return nietGevonden();

  /* De spelletjes zijn groot: alleen opnieuw sturen als het bestand veranderd is. */
  const etag = `"${info.size.toString(36)}-${Math.floor(info.mtimeMs).toString(36)}"`;
  const kop = {
    ETag: etag,
    "Cache-Control": "public, max-age=0, must-revalidate",
    "X-Content-Type-Options": "nosniff",
  };
  if (verzoek.headers.get("if-none-match") === etag) return new Response(null, { status: 304, headers: kop });

  const stroom = Readable.toWeb(fs.createReadStream(bestand)) as ReadableStream<Uint8Array>;
  return new Response(stroom, {
    headers: { ...kop, "Content-Type": soort, "Content-Length": String(info.size) },
  });
}
