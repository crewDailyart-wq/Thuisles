"use server";

/**
 * De niveautest samenstellen in beheer: onderdelen toevoegen, aanpassen,
 * verschuiven en weghalen. Wat hier staat, is de toets op /niveautest.
 */

import { revalidatePath } from "next/cache";
import {
  controleerOnderdeel,
  geldigAantal,
  geldigNiveau,
  verschuifOnderdeel,
  verwijderOnderdeel,
  voegOnderdeelToe,
  wijzigOnderdeel,
  type Toetsniveau,
} from "@/lib/data/niveautest";

export type Niveautestuitslag = { ok: boolean; melding: string } | null;

function ververs() {
  revalidatePath("/admin/niveautest");
  revalidatePath("/niveautest", "layout");
  revalidatePath("/", "layout");
}

export async function voegToetsonderdeelToe(_vorige: Niveautestuitslag, data: FormData): Promise<Niveautestuitslag> {
  const groep = Number(data.get("groep"));
  const leerdoelId = String(data.get("leerdoel") ?? "");
  const aantal = Number(data.get("aantal"));
  const niveau = String(data.get("niveau") ?? "");
  const fout = controleerOnderdeel(groep, leerdoelId, aantal, niveau);
  if (fout) return { ok: false, melding: fout };
  const nogEenFout = voegOnderdeelToe(groep, leerdoelId, aantal, niveau as Toetsniveau);
  if (nogEenFout) return { ok: false, melding: nogEenFout };
  ververs();
  return { ok: true, melding: `Toegevoegd aan de toets van groep ${groep}.` };
}

/*
  Het formulier in de lijst stuurt altijd allebei de velden mee, aantal en
  niveau. Ontbreekt er toch een, dan blijft het onderdeel zoals het was in
  plaats van dat een lege waarde over de instelling heen wordt geschreven.
*/
export async function wijzigToetsonderdeel(data: FormData): Promise<void> {
  const id = String(data.get("id") ?? "");
  if (!id || !data.has("aantal") || !data.has("niveau")) return;
  const aantal = Number(data.get("aantal"));
  const niveau = String(data.get("niveau"));
  if (!geldigAantal(aantal) || !geldigNiveau(niveau)) return;
  wijzigOnderdeel(id, aantal, niveau);
  ververs();
}

export async function verschuifToetsonderdeel(data: FormData): Promise<void> {
  const richting = data.get("richting") === "op" ? "op" : "neer";
  verschuifOnderdeel(String(data.get("id") ?? ""), richting);
  ververs();
}

export async function verwijderToetsonderdeelActie(data: FormData): Promise<void> {
  verwijderOnderdeel(String(data.get("id") ?? ""));
  ververs();
}
