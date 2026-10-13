"use server";

/**
 * Werkbladen en posters in beheer: uploaden, aan- en uitzetten, weghalen.
 * Wat hier gebeurt, is het enige wat er op de openbare werkbladenpagina komt.
 */

import { revalidatePath } from "next/cache";
import {
  bewaarWerkblad,
  controleerWerkblad,
  verwijderWerkblad,
  zetWerkbladZichtbaar,
} from "@/lib/data/werkbladen";

export type Werkbladuitslag = { ok: boolean; melding: string } | null;

function ververs() {
  revalidatePath("/admin/werkbladen");
  revalidatePath("/werkbladen");
  revalidatePath("/", "layout");
}

export async function uploadWerkblad(_vorige: Werkbladuitslag, data: FormData): Promise<Werkbladuitslag> {
  const bestand = data.get("bestand");
  const invoer = {
    titel: String(data.get("titel") ?? ""),
    omschrijving: String(data.get("omschrijving") ?? ""),
    soort: String(data.get("soort") ?? ""),
    vak: String(data.get("vak") ?? ""),
    groepen: String(data.get("groepen") ?? ""),
  };
  const fout = controleerWerkblad(invoer, bestand instanceof File ? bestand : null);
  if (fout) return { ok: false, melding: fout };
  const w = await bewaarWerkblad(invoer, bestand as File);
  ververs();
  return { ok: true, melding: `"${w.titel}" is opgeslagen. Het staat nog uit; zet het aan als het klaar is.` };
}

export async function wisselWerkblad(data: FormData): Promise<void> {
  zetWerkbladZichtbaar(String(data.get("id") ?? ""), data.get("zichtbaar") === "1");
  ververs();
}

export async function verwijderWerkbladActie(data: FormData): Promise<void> {
  verwijderWerkblad(String(data.get("id") ?? ""));
  ververs();
}
