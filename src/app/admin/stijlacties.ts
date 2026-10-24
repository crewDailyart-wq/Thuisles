"use server";

/**
 * De stijl van de nieuwe onderdelen bewaren (stijlkiezer, /admin/stijl; 24
 * oktober 2026). Een instelling voor de hele app, geen content.
 */

import { revalidatePath } from "next/cache";
import { zetStijl } from "@/lib/data/stijl";
import { maakStijl, STANDAARD_STIJL, type Stijl } from "@/lib/stijl";

export async function bewaarStijl(stijl: Stijl): Promise<{ ok: true; stijl: Stijl }> {
  const veilig = maakStijl(stijl);
  zetStijl(veilig);
  revalidatePath("/", "layout");
  return { ok: true, stijl: veilig };
}

/** Terug naar de standaard (het goedgekeurde ontwerp). */
export async function stijlTerug(): Promise<{ ok: true; stijl: Stijl }> {
  zetStijl(STANDAARD_STIJL);
  revalidatePath("/", "layout");
  return { ok: true, stijl: STANDAARD_STIJL };
}
