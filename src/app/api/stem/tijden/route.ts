/**
 * Een zin met Ruth plus de tijd per woord (voorbeeld "Tekst boven Bliepo" op
 * /voorbeeld-bliepo, 23 oktober 2026): GET ?zin=...&groep=... geeft
 * { audio (mp3, base64), woorden: [{ woord, begin, eind }] }. Achter het slot
 * van de site, net als /api/stem.
 */

import { NextRequest, NextResponse } from "next/server";
import { MAX_LENGTE, profielVoor, zinMetTijden } from "@/lib/stem-server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const zin = (request.nextUrl.searchParams.get("zin") ?? "").trim();
  if (!zin || zin.length > MAX_LENGTE) return NextResponse.json({ fout: "Geen geldige zin." }, { status: 400 });
  const g = Number(request.nextUrl.searchParams.get("groep"));
  const profiel = profielVoor(Number.isInteger(g) && g >= 1 && g <= 8 ? g : 3);
  const uit = await zinMetTijden(zin, profiel);
  if (typeof uit === "number") return NextResponse.json({ fout: "Lukte niet.", code: uit }, { status: 503 });
  return NextResponse.json(
    { audio: uit.data.toString("base64"), woorden: uit.woorden },
    { headers: { "Cache-Control": "private, max-age=86400" } },
  );
}
