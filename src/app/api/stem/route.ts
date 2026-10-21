/**
 * De stem van Bliepo (21 oktober 2026, keuze eigenaar: Fish Audio).
 *
 * GET /api/stem?zin=... geeft de zin als mp3, uitgesproken met de stem die de
 * eigenaar op fish.audio heeft gekozen (FISH_STEM_ID, model FISH_MODEL).
 *
 * Elke zin wordt maar één keer bij Fish Audio gemaakt en daarna bewaard in de
 * map `stem` naast de database (online op het volume: /data/stem). Wie de zin
 * daarna nog eens vraagt, krijgt het bewaarde bestand; dat kost niets.
 *
 * Lukt het niet (geen sleutel, geen tegoed, geen verbinding), dan komt er een
 * foutcode terug en praat Bliepo met de stem uit de browser (lib/stem.ts).
 *
 * Dit adres heeft geen extensie en zit dus achter het slot van de site
 * (proxy.ts); alleen wie binnen mag, kan zinnen laten maken.
 */

import { createHash } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAP = path.join(path.dirname(process.env.THUISLES_DB ?? path.join(process.cwd(), "data", "thuisles.db")), "stem");
/** Langer dan dit is geen zin van Bliepo meer; dat maken we niet. */
const MAX_LENGTE = 500;

/** Zinnen die nu gemaakt worden, zodat twee gelijke verzoeken maar één keer betalen. */
const bezig = new Map<string, Promise<Buffer | number>>();

function mp3(data: Buffer) {
  return new NextResponse(new Uint8Array(data), {
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Length": String(data.length),
      /* Dezelfde zin klinkt altijd hetzelfde: de browser mag hem lang bewaren. */
      "Cache-Control": "private, max-age=31536000, immutable",
    },
  });
}

async function maak(zin: string, sleutel: string, stem: string, model: string): Promise<Buffer | number> {
  const antwoord = await fetch("https://api.fish.audio/v1/tts", {
    method: "POST",
    headers: { Authorization: `Bearer ${sleutel}`, "Content-Type": "application/json", model },
    body: JSON.stringify({ text: zin, reference_id: stem, format: "mp3", latency: "normal" }),
    signal: AbortSignal.timeout(45000),
  }).catch(() => null);
  if (!antwoord) return 504;
  if (!antwoord.ok) {
    console.error(`[stem] Fish Audio gaf ${antwoord.status}: ${(await antwoord.text().catch(() => "")).slice(0, 200)}`);
    return antwoord.status;
  }
  return Buffer.from(await antwoord.arrayBuffer());
}

export async function GET(request: NextRequest) {
  const zin = (request.nextUrl.searchParams.get("zin") ?? "").trim();
  if (!zin || zin.length > MAX_LENGTE) return NextResponse.json({ fout: "Geen geldige zin." }, { status: 400 });

  const sleutel = process.env.FISH_API_KEY;
  const stem = process.env.FISH_STEM_ID;
  const model = process.env.FISH_MODEL ?? "s2.1-pro";
  if (!sleutel || !stem) return NextResponse.json({ fout: "Geen stem ingesteld." }, { status: 503 });

  const naam = createHash("sha256").update(`${model}\n${stem}\n${zin}`).digest("hex").slice(0, 32);
  const bestand = path.join(MAP, `${naam}.mp3`);

  const bewaard = await readFile(bestand).catch(() => null);
  if (bewaard) return mp3(bewaard);

  let klus = bezig.get(naam);
  if (!klus) {
    klus = maak(zin, sleutel, stem, model).finally(() => bezig.delete(naam));
    bezig.set(naam, klus);
  }
  const uitkomst = await klus;
  if (typeof uitkomst === "number") {
    /* 402 = geen tegoed bij Fish Audio, 401 = sleutel klopt niet. De browser valt dan terug op zijn eigen stem. */
    return NextResponse.json({ fout: "De stem kon niet gemaakt worden.", code: uitkomst }, { status: 503 });
  }

  await mkdir(MAP, { recursive: true });
  const tijdelijk = `${bestand}.${process.pid}.tmp`;
  await writeFile(tijdelijk, uitkomst);
  await rename(tijdelijk, bestand);
  return mp3(uitkomst);
}
