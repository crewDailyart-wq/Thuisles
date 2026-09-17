"use server";

/**
 * De standaardvos opslaan.
 *
 * Aparte actie en niet bij de sjabloonacties: dit is een instelling voor de
 * hele app, geen eigenschap van één sjabloon. Wat hier staat geldt voor elk
 * oefeningstype waar een mascotte bij hoort.
 */

import { revalidatePath } from "next/cache";
import { zetStandaardvos } from "@/lib/data/instellingen";

export async function bewaarStandaardvos(houdingen: {
  vangend: string;
  wachtend: string;
  blij: string;
}): Promise<{ ok: true }> {
  zetStandaardvos({
    vangend: houdingen.vangend.trim() || null,
    wachtend: houdingen.wachtend.trim() || null,
    blij: houdingen.blij.trim() || null,
  });

  /*
    De vos zit in de vragen die de kinderkant ophaalt, en in het voorbeeld bij
    een sjabloon. Allebei opnieuw laten ophalen, anders blijft de oude vos in
    beeld tot er toevallig iets anders verandert.
  */
  revalidatePath("/admin", "layout");
  revalidatePath("/oefenen", "layout");

  return { ok: true };
}
