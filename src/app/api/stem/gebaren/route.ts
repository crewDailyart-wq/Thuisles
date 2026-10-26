/**
 * Het gebarenplan van een zin (26 oktober 2026): GET ?zin=... geeft
 * { gebaren: [{ clip, woord, soort, tempo? }] }. Eén keer uitgezocht
 * (woordenboek, of een goedkoop AI-model) en bewaard naast de stem; daarna
 * alleen nog gelezen (lib/gebaren-server.ts). Achter het slot van de site.
 */

import { NextRequest, NextResponse } from "next/server";
import { gebarenPlan } from "@/lib/gebaren-server";
import { MAX_LENGTE } from "@/lib/stem-server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const zin = (request.nextUrl.searchParams.get("zin") ?? "").trim();
  if (!zin || zin.length > MAX_LENGTE) return NextResponse.json({ fout: "Geen geldige zin." }, { status: 400 });
  const gebaren = await gebarenPlan(zin);
  return NextResponse.json({ gebaren }, { headers: { "Cache-Control": "private, max-age=86400" } });
}
