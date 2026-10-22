/**
 * De stem van Bliepo (21 oktober 2026, keuze eigenaar: Fish Audio; sinds
 * 22 oktober 2026 ElevenLabs met de stem "Ruth", met toon en tempo per groep,
 * en Fish Audio als reserve).
 *
 * GET /api/stem?zin=... geeft de zin als mp3. Hoe hij gemaakt en gecontroleerd
 * wordt, staat in lib/stem-server.ts. De groep komt van het kind dat op dit
 * apparaat oefent; `&groep=1..8` kiest zelf een groep (voor /voorbeeld-bliepo).
 *
 * Elke zin wordt maar één keer bij Fish Audio gemaakt en daarna bewaard in de
 * map `stem` naast de database (online op het volume: /data/stem). Wie de zin
 * daarna nog eens vraagt, krijgt het bewaarde bestand; dat kost niets.
 *
 * Lukt ElevenLabs niet op tijd, dan komt Fish Audio, en daarna de oude Fish
 * Audio-stem. Lukt ook
 * die niet (geen sleutel, geen tegoed, geen verbinding), dan komt er een
 * foutcode terug en praat Bliepo met de stem uit de browser (lib/stem.ts).
 *
 * POST /api/stem met { zin, groep? } maakt één zin opnieuw (knop "Opnieuw
 * maken" op /voorbeeld-bliepo). De oude versie wordt niet weggegooid: die gaat
 * naar de map `stem/oud`, met datum en tijd in de naam.
 *
 * GET /api/stem?mislukt=1 geeft het lijstje zinnen waarin een woord bleef
 * ontbreken, plus de teller en de voortgang van "alles opnieuw".
 * POST /api/stem met { actie: "alles" } maakt alle bewaarde zinnen en de vaste
 * zinnen opnieuw met de nieuwe stem (op de achtergrond).
 *
 * Dit adres heeft geen extensie en zit dus achter het slot van de site
 * (proxy.ts); alleen wie binnen mag, kan zinnen laten maken.
 */

import { createHash } from "node:crypto";
import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { huidigKind } from "@/lib/auth/sessie";
import { verbinding } from "@/lib/db/sqlite";
import {
  instellingen,
  leesMislukt,
  leesTeller,
  leesVoortgang,
  maakAllesOpnieuw,
  maakZin,
  MAP,
  MAX_LENGTE,
  type Profiel,
  profielVoor,
  zinBestand,
  zinVoorKind,
} from "@/lib/stem-server";
import { VASTE_ZINNEN } from "@/lib/stem-vaste-zinnen";
import { alleHintZinnen } from "@/lib/tutor/hints";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Zo lang wacht een kind op een nieuwe zin met de nieuwe stem; daarna de oude stem. */
const WACHT_MS = 6000;

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

/** De groep: zelf gekozen (testpagina), anders die van het kind op dit apparaat, anders groep 4. */
async function groepVan(gevraagd: unknown): Promise<number> {
  const g = Number(gevraagd);
  if (Number.isInteger(g) && g >= 1 && g <= 8) return g;
  const kind = await huidigKind().catch(() => null);
  return kind?.groep ?? 4;
}

/** De groepen van alle kinderen, voor "alles opnieuw". */
function profielenVanKinderen(): Profiel[] {
  const rijen = verbinding().prepare("SELECT DISTINCT groep FROM kinderen").all() as { groep: number }[];
  const profielen = new Set(rijen.map((r) => profielVoor(Number(r.groep))));
  if (profielen.size === 0) profielen.add("3-5");
  return [...profielen];
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  if (params.has("mislukt")) {
    return NextResponse.json({ mislukt: await leesMislukt(), teller: await leesTeller(), voortgang: leesVoortgang() });
  }

  const zin = (params.get("zin") ?? "").trim();
  if (!zin || zin.length > MAX_LENGTE) return NextResponse.json({ fout: "Geen geldige zin." }, { status: 400 });

  const profiel = profielVoor(await groepVan(params.get("groep")));
  if (!instellingen(profiel)) return NextResponse.json({ fout: "Geen stem ingesteld." }, { status: 503 });

  const uitkomst = await zinVoorKind(zin, profiel, WACHT_MS);
  if (typeof uitkomst === "number") {
    /* 402 = geen tegoed bij Fish Audio, 401 = sleutel klopt niet. De browser valt dan terug op zijn eigen stem. */
    return NextResponse.json({ fout: "De stem kon niet gemaakt worden.", code: uitkomst }, { status: 503 });
  }
  return mp3(uitkomst, request);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (body?.actie === "alles") {
    return NextResponse.json(maakAllesOpnieuw([...VASTE_ZINNEN, ...alleHintZinnen()], profielenVanKinderen()));
  }

  const zin = typeof body?.zin === "string" ? body.zin.trim() : "";
  if (!zin || zin.length > MAX_LENGTE) return NextResponse.json({ fout: "Geen geldige zin." }, { status: 400 });

  const profiel = profielVoor(await groepVan(body?.groep));
  const s = instellingen(profiel);
  if (!s) return NextResponse.json({ fout: "Geen stem ingesteld." }, { status: 503 });

  /* De oude versie bewaren in stem/oud (niets weggooien), daarna opnieuw maken. */
  const { naam, bestand } = zinBestand(zin, s);
  const oud = path.join(MAP, "oud");
  await mkdir(oud, { recursive: true });
  const tijd = new Date().toISOString().replace(/[:.]/g, "-");
  await copyFile(bestand, path.join(oud, `${naam}-${tijd}.mp3`)).catch(() => {});

  const uitkomst = await maakZin(zin, profiel, true);
  if (!uitkomst.goed) {
    return NextResponse.json({ fout: "De stem kon niet opnieuw gemaakt worden.", code: uitkomst.code ?? 422 }, { status: 503 });
  }
  return NextResponse.json({ ok: true });
}
