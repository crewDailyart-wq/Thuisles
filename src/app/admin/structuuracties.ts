"use server";

/**
 * Serveracties voor het beheren van de leerdoelstructuur.
 *
 * Ze geven een uitslag terug in plaats van door te sturen naar een andere
 * pagina: het scherm blijft staan waar het staat, toont een eventuele fout, en
 * je kunt meteen door met de volgende. Dat is het verschil tussen tien
 * leerdoelen in een minuut en tien keer heen en weer klikken.
 */

import { revalidatePath } from "next/cache";
import {
  dupliceerLeerdoel,
  maakVak,
  verwijderVak,
  wijzigVak,
  maakDomein,
  maakLeerdoel,
  maakLeerdoelenUitLijst,
  maakSubdomein,
  verwijderDomein,
  verwijderLeerdoel,
  verplaatsLeerdoel,
  verwijderSubdomein,
  wijzigDomein,
  wijzigLeerdoel,
  wijzigSubdomein,
  zetUitlegvorm,
  type RegelUitslag,
} from "@/lib/data/structuur";
import type { Domein, Leerdoel, Subdomein, Vak } from "@/lib/types";

export type Antwoord<T> = { ok: true; waarde: T } | { ok: false; fout: string };

/** Alles wat de structuur raakt, raakt ook de kinderkant. */
function ververs() {
  revalidatePath("/admin", "layout");
  revalidatePath("/oefenen", "layout");
  revalidatePath("/start");
}

function tekst(data: FormData, veld: string): string {
  return String(data.get(veld) ?? "").trim();
}

function getal(data: FormData, veld: string): number {
  return Number(data.get(veld) ?? NaN);
}

// --- Vak ------------------------------------------------------------------

export async function nieuwVak(data: FormData): Promise<Antwoord<Vak>> {
  const uitslag = maakVak({
    naam: tekst(data, "naam"),
    omschrijving: tekst(data, "omschrijving"),
    icoon: tekst(data, "icoon") || "vak-rekenen",
    actief: data.get("actief") === "aan",
  });
  if (uitslag.ok) ververs();
  return uitslag;
}

export async function bewerkVak(data: FormData): Promise<Antwoord<true>> {
  const uitslag = wijzigVak(tekst(data, "id"), {
    naam: tekst(data, "naam"),
    omschrijving: tekst(data, "omschrijving"),
    icoon: tekst(data, "icoon") || "vak-rekenen",
    actief: data.get("actief") === "aan",
  });
  if (uitslag.ok) ververs();
  return uitslag;
}

export async function wegVak(data: FormData): Promise<Antwoord<true>> {
  const uitslag = verwijderVak(tekst(data, "id"));
  if (uitslag.ok) ververs();
  return uitslag;
}

// --- Domein ---------------------------------------------------------------

export async function nieuwDomein(data: FormData): Promise<Antwoord<Domein>> {
  const uitslag = maakDomein({
    vakId: tekst(data, "vakId"),
    naam: tekst(data, "naam"),
    omschrijving: tekst(data, "omschrijving"),
    icoon: tekst(data, "icoon") || "getalbegrip",
    actief: data.get("actief") === "aan",
  });
  if (uitslag.ok) ververs();
  return uitslag;
}

export async function bewerkDomein(data: FormData): Promise<Antwoord<true>> {
  const uitslag = wijzigDomein(tekst(data, "id"), {
    naam: tekst(data, "naam"),
    omschrijving: tekst(data, "omschrijving"),
    icoon: tekst(data, "icoon") || "getalbegrip",
    actief: data.get("actief") === "aan",
  });
  if (uitslag.ok) ververs();
  return uitslag;
}

export async function wegDomein(data: FormData): Promise<Antwoord<true>> {
  const uitslag = verwijderDomein(tekst(data, "id"));
  if (uitslag.ok) ververs();
  return uitslag;
}

// --- Subdomein ------------------------------------------------------------

export async function nieuwSubdomein(data: FormData): Promise<Antwoord<Subdomein>> {
  const uitslag = maakSubdomein({
    domeinId: tekst(data, "domeinId"),
    naam: tekst(data, "naam"),
    omschrijving: tekst(data, "omschrijving"),
    icoon: tekst(data, "icoon") || "tafels",
  });
  if (uitslag.ok) ververs();
  return uitslag;
}

export async function bewerkSubdomein(data: FormData): Promise<Antwoord<true>> {
  const uitslag = wijzigSubdomein(tekst(data, "id"), {
    naam: tekst(data, "naam"),
    omschrijving: tekst(data, "omschrijving"),
    icoon: tekst(data, "icoon") || "tafels",
  });
  if (uitslag.ok) ververs();
  return uitslag;
}

export async function wegSubdomein(data: FormData): Promise<Antwoord<true>> {
  const uitslag = verwijderSubdomein(tekst(data, "id"));
  if (uitslag.ok) ververs();
  return uitslag;
}

// --- Leerdoel -------------------------------------------------------------

export async function nieuwLeerdoel(data: FormData): Promise<Antwoord<Leerdoel>> {
  const uitslag = maakLeerdoel({
    subdomeinId: tekst(data, "subdomeinId"),
    titel: tekst(data, "titel"),
    groepVan: getal(data, "groepVan"),
    groepTot: getal(data, "groepTot"),
  });
  if (uitslag.ok) ververs();
  return uitslag;
}

export async function nieuweLeerdoelenUitLijst(data: FormData): Promise<RegelUitslag[]> {
  const uitslagen = maakLeerdoelenUitLijst(
    tekst(data, "subdomeinId"),
    String(data.get("lijst") ?? ""),
    getal(data, "groepVan"),
    getal(data, "groepTot"),
  );
  if (uitslagen.some((r) => r.gelukt)) ververs();
  return uitslagen;
}

export async function bewerkLeerdoel(data: FormData): Promise<Antwoord<true>> {
  /*
    Het aantal vragen per oefensessie staat hier bewust NIET bij. Dat stel je in
    bij het sjabloon; dit formulier laat het met rust. Zou het hier wel worden
    meegestuurd, dan zou het wijzigen van een titel de instelling wissen — het
    veld is hier immers leeg.
  */
  const uitslag = wijzigLeerdoel(tekst(data, "id"), {
    titel: tekst(data, "titel"),
    groepVan: getal(data, "groepVan"),
    groepTot: getal(data, "groepTot"),
  });
  if (uitslag.ok) ververs();
  return uitslag;
}

export async function bewerkUitlegvorm(data: FormData): Promise<Antwoord<true>> {
  const uitslag = zetUitlegvorm(tekst(data, "id"), tekst(data, "uitlegvorm"));
  if (uitslag.ok) ververs();
  return uitslag;
}

export async function wegLeerdoel(data: FormData): Promise<Antwoord<true>> {
  const uitslag = verwijderLeerdoel(tekst(data, "id"));
  if (uitslag.ok) ververs();
  return uitslag;
}

/**
 * Een leerdoel naar een ander onderwerp verhuizen.
 *
 * Met opzet een eigen actie en niet een veld erbij in `bewerkLeerdoel`. Dat
 * formulier stuurt titel en groep mee; een onderwerp dat daar half in zou
 * hangen, zou bij elke titelwijziging meeverhuizen of juist leeg binnenkomen.
 * Zie HARDE REGEL 1 in CLAUDE.md — dat is precies de fout die daar beschreven
 * staat.
 */
export async function verhuisLeerdoel(data: FormData): Promise<Antwoord<true>> {
  const uitslag = verplaatsLeerdoel(tekst(data, "id"), tekst(data, "subdomeinId"));
  if (uitslag.ok) ververs();
  return uitslag;
}

export async function kopieerLeerdoel(data: FormData): Promise<Antwoord<Leerdoel>> {
  const uitslag = dupliceerLeerdoel(tekst(data, "id"));
  if (uitslag.ok) ververs();
  return uitslag;
}
