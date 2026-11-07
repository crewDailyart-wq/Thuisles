"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { vereisLesbeheer, zetLesbeheer } from "@/lib/lessen/lokaal-beheer";
import { bewaarKeuze, bewaarEigenTekst } from "./keuzes-bewaren";

export async function pasTekstAan(sleutel: string, tekst: string, verwacht: string, versie: string) {
  await vereisLesbeheer();
  const resultaat = bewaarEigenTekst(sleutel, tekst, verwacht, versie);
  if (!resultaat.fout) {
    revalidatePath("/voorbeeld/uitleg-kindertaal");
    revalidatePath("/voorbeeld/les/[les]", "page");
  }
  return resultaat;
}

export async function kiesTekst(sleutel: string, aan: boolean, verwacht: string, versie: string) {
  await vereisLesbeheer();
  const resultaat = bewaarKeuze(sleutel, aan, verwacht, versie);
  if (!resultaat.fout) {
    revalidatePath("/voorbeeld/uitleg-kindertaal");
    revalidatePath("/voorbeeld/les/[les]", "page");
  }
  return resultaat;
}

export async function activeerTekstkeuzes() {
  await zetLesbeheer(true);
  redirect("/voorbeeld/uitleg-kindertaal");
}
