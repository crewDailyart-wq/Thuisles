"use server";

/** Serveracties voor de app-brede beheerinstellingen. */

import { revalidatePath } from "next/cache";
import { zetAlgemeenAantalVragen } from "@/lib/data/instellingen";

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
