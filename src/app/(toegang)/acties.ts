"use server";

/**
 * De serveracties rond het kiezen van een kindprofiel.
 *
 * TIJDELIJK GEEN INLOG: registreren en inloggen bestaan niet. Wie de app opent
 * is meteen de ouder. Zie `src/lib/auth/sessie.ts` voor wat er vóór livegang
 * terug moet.
 *
 * Wat hier wél gebeurt, blijft gecontroleerd: een profiel openen kan alleen
 * als het profiel bestaat en de kindcode klopt.
 */

import { redirect } from "next/navigation";
import { kiesKind, verlaatKind, vereisOuder } from "@/lib/auth/sessie";
import { haalKindVanOuder, kindcodeKlopt } from "@/lib/data/kinderen";

type Uitkomst = { fout: string } | null;

function tekst(gegevens: FormData, naam: string): string {
  const waarde = gegevens.get(naam);
  return typeof waarde === "string" ? waarde.trim() : "";
}

/**
 * Een kindprofiel openen.
 *
 * De kindcode is een drempel tussen broers en zussen, geen beveiliging. Heeft
 * een kind geen code, dan gaat het profiel gewoon open.
 */
export async function kiesProfiel(
  _vorige: Uitkomst,
  gegevens: FormData,
): Promise<Uitkomst> {
  const ouder = await vereisOuder();
  const kindId = tekst(gegevens, "kindId");
  const code = tekst(gegevens, "kindcode");

  const kind = haalKindVanOuder(ouder.id, kindId);
  if (!kind) return { fout: "Dat profiel bestaat niet." };

  if (kind.heeftKindcode && !code) {
    // Geen fout, maar een vervolgstap: het scherm vraagt nu om de code.
    redirect(`/kies?kind=${kind.id}`);
  }

  if (!kindcodeKlopt(ouder.id, kind.id, code)) {
    return { fout: "Die code klopt niet. Probeer het nog eens." };
  }

  await kiesKind(kind.id);
  redirect("/start");
}

/**
 * Een profiel openen vanaf de profielkeuze.
 *
 * Dezelfde controles als `kiesProfiel`, maar zonder terugkoppeling naar het
 * scherm: dit knopje heeft geen invoerveld waar een melding bij past. Heeft
 * het kind een code, dan stuurt `kiesProfiel` door naar het codescherm.
 */
export async function openProfiel(gegevens: FormData): Promise<void> {
  const uitkomst = await kiesProfiel(null, gegevens);
  if (uitkomst?.fout) redirect("/kies");
}

/** Terug van de kinderkant naar de ouderomgeving. */
export async function verlaatProfiel(): Promise<void> {
  await verlaatKind();
  redirect("/ouder/overzicht");
}
