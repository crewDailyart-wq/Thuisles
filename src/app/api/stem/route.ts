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
 * POST /api/stem met { zin } maakt één zin opnieuw (knop "Opnieuw maken" op
 * /voorbeeld-bliepo, 21 oktober 2026). De oude versie wordt niet weggegooid:
 * die gaat naar de map `stem/oud`, met datum en tijd in de naam.
 *
 * Dit adres heeft geen extensie en zit dus achter het slot van de site
 * (proxy.ts); alleen wie binnen mag, kan zinnen laten maken.
 */

import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAP = path.join(path.dirname(process.env.THUISLES_DB ?? path.join(process.cwd(), "data", "thuisles.db")), "stem");
/** Langer dan dit is geen zin van Bliepo meer; dat maken we niet. */
const MAX_LENGTE = 500;

/** Zinnen die nu gemaakt worden, zodat twee gelijke verzoeken maar één keer betalen. */
const bezig = new Map<string, Promise<Buffer | number>>();

function mp3(data: Buffer, request: NextRequest) {
  /*
    De browser mag de zin bewaren, maar vraagt elke keer kort na of hij nog
    klopt (ETag). Zo hoort iedereen een zin die opnieuw is gemaakt meteen in
    de nieuwe versie; is hij niet veranderd, dan komt er alleen een kort
    "niet veranderd" terug.
  */
  const etag = `"${createHash("sha1").update(data).digest("hex").slice(0, 20)}"`;
  const headers = { ETag: etag, "Cache-Control": "private, no-cache" };
  if (request.headers.get("if-none-match") === etag) return new NextResponse(null, { status: 304, headers });
  return new NextResponse(new Uint8Array(data), {
    headers: { ...headers, "Content-Type": "audio/mpeg", "Content-Length": String(data.length) },
  });
}

/** De instellingen uit de omgeving, of null als er geen stem is ingesteld. */
function instellingen() {
  const sleutel = process.env.FISH_API_KEY;
  const stem = process.env.FISH_STEM_ID;
  const model = process.env.FISH_MODEL ?? "s2.1-pro";
  /*
    Spreektempo (FISH_SNELHEID, 1 = gewoon). 21 oktober 2026: s2-pro met 0,88.
    Gemeten op lange zinnen schommelt de stem met s2-pro het minst in
    toonhoogte en volume; 0,88 maakt hem even snel als met drama-3.
  */
  const snelheid = Number(process.env.FISH_SNELHEID ?? 1) || 1;
  return sleutel && stem ? { sleutel, stem, model, snelheid } : null;
}

type Instellingen = NonNullable<ReturnType<typeof instellingen>>;

/**
 * Waar een zin bewaard wordt: één bestand per model, stem, tempo en zin. Het
 * tempo telt alleen mee als het niet 1 is, zodat de zinnen die eerder zijn
 * gemaakt bij hun instellingen blijven horen (terugzetten = de oude weer).
 */
function bestandVoor(zin: string, s: Instellingen) {
  const tempo = s.snelheid !== 1 ? `\nsnelheid ${s.snelheid}` : "";
  const naam = createHash("sha256").update(`${s.model}\n${s.stem}\n${zin}${tempo}`).digest("hex").slice(0, 32);
  return { naam, bestand: path.join(MAP, `${naam}.mp3`) };
}

/** Maakt de zin (één keer tegelijk per zin) en bewaart hem. Geeft het geluid of een foutcode. */
async function maakEnBewaar(zin: string, s: Instellingen): Promise<Buffer | number> {
  const { naam, bestand } = bestandVoor(zin, s);
  let klus = bezig.get(naam);
  if (!klus) {
    klus = maak(zin, s)
      .then(async (uitkomst) => {
        if (typeof uitkomst === "number") return uitkomst;
        await mkdir(MAP, { recursive: true });
        const tijdelijk = `${bestand}.${process.pid}.tmp`;
        await writeFile(tijdelijk, uitkomst);
        await rename(tijdelijk, bestand);
        /* De zin zelf erbij, zodat later te zien is welk bestand bij welke zin hoort. */
        await writeFile(path.join(MAP, `${naam}.txt`), `${zin}\n`).catch(() => {});
        return uitkomst;
      })
      .finally(() => bezig.delete(naam));
    bezig.set(naam, klus);
  }
  return klus;
}

async function maak(zin: string, { sleutel, stem, model, snelheid }: Instellingen): Promise<Buffer | number> {
  const antwoord = await fetch("https://api.fish.audio/v1/tts", {
    method: "POST",
    headers: { Authorization: `Bearer ${sleutel}`, "Content-Type": "application/json", model },
    body: JSON.stringify({
      text: zin,
      reference_id: stem,
      format: "mp3",
      latency: "normal",
      ...(snelheid !== 1 && { prosody: { speed: snelheid } }),
    }),
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

  const s = instellingen();
  if (!s) return NextResponse.json({ fout: "Geen stem ingesteld." }, { status: 503 });

  const bewaard = await readFile(bestandVoor(zin, s).bestand).catch(() => null);
  if (bewaard) return mp3(bewaard, request);

  const uitkomst = await maakEnBewaar(zin, s);
  if (typeof uitkomst === "number") {
    /* 402 = geen tegoed bij Fish Audio, 401 = sleutel klopt niet. De browser valt dan terug op zijn eigen stem. */
    return NextResponse.json({ fout: "De stem kon niet gemaakt worden.", code: uitkomst }, { status: 503 });
  }
  return mp3(uitkomst, request);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const zin = typeof body?.zin === "string" ? body.zin.trim() : "";
  if (!zin || zin.length > MAX_LENGTE) return NextResponse.json({ fout: "Geen geldige zin." }, { status: 400 });

  const s = instellingen();
  if (!s) return NextResponse.json({ fout: "Geen stem ingesteld." }, { status: 503 });

  /* De oude versie bewaren in stem/oud (niets weggooien), daarna opnieuw maken. */
  const { naam, bestand } = bestandVoor(zin, s);
  const oud = path.join(MAP, "oud");
  await mkdir(oud, { recursive: true });
  const tijd = new Date().toISOString().replace(/[:.]/g, "-");
  await copyFile(bestand, path.join(oud, `${naam}-${tijd}.mp3`)).catch(() => {});

  const uitkomst = await maak(zin, s);
  if (typeof uitkomst === "number") {
    return NextResponse.json({ fout: "De stem kon niet opnieuw gemaakt worden.", code: uitkomst }, { status: 503 });
  }
  const tijdelijk = `${bestand}.${process.pid}.tmp`;
  await mkdir(MAP, { recursive: true });
  await writeFile(tijdelijk, uitkomst);
  await rename(tijdelijk, bestand);
  await writeFile(path.join(MAP, `${naam}.txt`), `${zin}\n`).catch(() => {});
  return NextResponse.json({ ok: true });
}
