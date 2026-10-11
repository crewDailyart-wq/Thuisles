"use server";

/** Serveracties voor de app-brede beheerinstellingen. */

import { revalidatePath } from "next/cache";
import { zetAlgemeenAantalVragen } from "@/lib/data/instellingen";
import { zetMaatjeAlgemeen } from "@/lib/data/maatje";

export type Antwoord<T> = { ok: true; waarde: T } | { ok: false; fout: string };

export async function zetAlgemeenAantal(data: FormData): Promise<Antwoord<number>> {
  const ingevuld = Number(data.get("aantal"));
  if (!Number.isFinite(ingevuld)) {
    return { ok: false, fout: "Vul een getal in." };
  }

  const bewaard = zetAlgemeenAantalVragen(ingevuld);

  // De oefenschermen lezen dit bij elke sessie; die moeten opnieuw opgehaald.
  revalidatePath("/admin", "layout");
  revalidatePath("/oefenen", "layout");

  return { ok: true, waarde: bewaard };
}

/**
 * Het maatje in één keer voor alles aan of uit (wachtrij, oktober 2026).
 *
 * Uit is overal uit. Aan betekent: bij elk leerdoel waar het maatje aan staat.
 * De instelling per leerdoel blijft dus bewaard als je dit uit en weer aan zet.
 */
export async function zetMaatjeAlles(data: FormData): Promise<Antwoord<boolean>> {
  const aan = data.get("maatje") === "1";
  zetMaatjeAlgemeen(aan);
  revalidatePath("/admin", "layout");
  revalidatePath("/oefenen", "layout");
  return { ok: true, waarde: aan };
}
