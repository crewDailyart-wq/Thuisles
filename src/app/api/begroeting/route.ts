/**
 * De begroeting van Bliepo op de startpagina (23 oktober 2026).
 *
 * GET  geeft de zinnen voor vandaag ({ al: true } als het kind vandaag al
 *      begroet is). Zonder gekozen kind: een begroeting die bij het uur past,
 *      zonder naam; de browser onthoudt dan zelf dat het vandaag al gebeurd is.
 * POST zegt dat de begroeting is afgespeeld: vandaag niet nog eens.
 *
 * Het geluid zelf komt gewoon van /api/stem (gedeeld door alle kinderen).
 */

import { NextResponse } from "next/server";
import { huidigKind } from "@/lib/auth/sessie";
import { kiesBegroeting } from "@/lib/begroeting";
import { begroetingVoor, maakNaamStukje, markeerBegroet } from "@/lib/begroeting-server";

export const runtime = "nodejs";

const geenOpslag = { "Cache-Control": "no-store" };

export async function GET() {
  const kind = await huidigKind().catch(() => null);
  if (!kind) {
    const uur = Number(new Intl.DateTimeFormat("nl-NL", { timeZone: "Europe/Amsterdam", hour: "numeric", hourCycle: "h23" }).format(new Date()));
    const { situatie, zin } = kiesBegroeting({
      uur,
      dagnummer: Math.floor(Date.now() / 86_400_000),
      eerderGezien: true,
      gisterenOfVandaagActief: true,
      gisterenGoed: false,
    });
    return NextResponse.json({ al: false, situatie, zinnen: [zin], zelfOnthouden: true }, { headers: geenOpslag });
  }
  const b = begroetingVoor(kind);
  /* Eén kind zonder kindcode komt zonder inlogscherm binnen: dan het naamstukje hier maken. */
  if (!b.al) maakNaamStukje(kind);
  return NextResponse.json(b, { headers: geenOpslag });
}

export async function POST() {
  const kind = await huidigKind().catch(() => null);
  if (kind) markeerBegroet(kind.id);
  return NextResponse.json({ ok: true }, { headers: geenOpslag });
}
