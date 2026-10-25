"use server";

/**
 * De stijl van de kinderkant bewaren (stijlkiezer, /admin/stijl; 24 oktober
 * 2026). Een instelling voor de hele app, geen content.
 *
 * Na elke wijziging wordt de hele site opnieuw opgebouwd (revalidatePath op
 * de hoofdlayout); de pagina's van de kinderkant lezen de stijl bovendien bij
 * elk bezoek opnieuw (StijlVariabelen), dus er blijft geen oude stijl hangen.
 */

import { revalidatePath } from "next/cache";
import { bewaarThema, haalVorige, zetStijl, zetVorigeTerug, type Thema } from "@/lib/data/stijl";
import { maakStijl, STANDAARD_STIJL, type Stijl } from "@/lib/stijl";

type Uitslag = { ok: true; stijl: Stijl; vorige: number };

function ververs() {
  revalidatePath("/", "layout");
}

export async function bewaarStijl(stijl: Stijl): Promise<Uitslag> {
  const veilig = maakStijl(stijl);
  zetStijl(veilig);
  ververs();
  return { ok: true, stijl: veilig, vorige: haalVorige().length };
}

/** Terug naar de standaard (het goedgekeurde ontwerp). De stijl van daarvoor blijft als vorige versie bewaard. */
export async function stijlTerug(): Promise<Uitslag> {
  zetStijl(STANDAARD_STIJL);
  ververs();
  return { ok: true, stijl: STANDAARD_STIJL, vorige: haalVorige().length };
}

/** Terug naar de vorige bewaarde versie. */
export async function vorigeStijlTerug(): Promise<Uitslag | { ok: false }> {
  const s = zetVorigeTerug();
  if (!s) return { ok: false };
  ververs();
  return { ok: true, stijl: s, vorige: haalVorige().length };
}

export async function slaThemaOp(naam: string, stijl: Stijl): Promise<Thema[]> {
  return bewaarThema(String(naam ?? ""), maakStijl(stijl));
}
