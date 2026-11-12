"use server";

/**
 * De uitkomst van een vraag in een les bewaren (besluit Sara, 9 november 2026).
 *
 * Bij welk kind het hoort, bepaalt de SERVER (het koekje van het apparaat), nooit de browser. Is er geen kind gekozen,
 * of gaat er iets mis, dan gebeurt er niets en merkt het kind niets: de les gaat gewoon door. Deze actie gooit nooit
 * een fout en stuurt nooit door.
 */

import { headers } from "next/headers";
import { huidigKind } from "@/lib/auth/sessie";
import { voorbeeldMagBewaren } from "@/lib/data/lesuitkomsten-voorbeeld";
import { bewaarLesUitkomst, type LesUitkomst } from "@/lib/data/lesuitkomsten";

export async function bewaarUitkomst(invoer: { lesId: string; vraagId: string; uitkomst: LesUitkomst; denkfouten: string[]; pogingen: number }): Promise<{ ok: boolean }> {
  try {
    const kind = await huidigKind();
    if (!kind) return { ok: false };
    if (!voorbeeldMagBewaren((await headers()).get("referer"), kind.roepnaam)) return { ok: false };
    return { ok: bewaarLesUitkomst({ kindId: kind.id, ...invoer, denkfouten: Array.isArray(invoer.denkfouten) ? invoer.denkfouten.map(String) : [] }) };
  } catch {
    return { ok: false };
  }
}
