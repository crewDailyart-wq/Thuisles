"use server";

/**
 * De standaardvos opslaan.
 *
 * Aparte actie en niet bij de sjabloonacties: dit is een instelling voor de
 * hele app, geen eigenschap van één sjabloon. Wat hier staat geldt voor elk
 * oefeningstype waar een mascotte bij hoort.
 */

import { revalidatePath } from "next/cache";
import { zetStandaardvos, zetTypemascottes } from "@/lib/data/instellingen";

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

/**
 * De standaardmascotte van één oefeningstype opslaan.
 *
 * Per type apart, zodat het opslaan van de stapstenen niets doet met de trein.
 * Wat hier staat geldt voor elk sjabloon van dat type dat zijn eigen veld leeg
 * laat — ook voor sjablonen die er nog niet zijn.
 */
export async function bewaarTypemascotte(
  type: string,
  waarden: Record<string, string>,
): Promise<{ ok: true }> {
  zetTypemascottes(type, waarden);

  /* Dezelfde reden als hierboven: de vos zit in de vragen en in het voorbeeld. */
  revalidatePath("/admin", "layout");
  revalidatePath("/oefenen", "layout");

  return { ok: true };
}
