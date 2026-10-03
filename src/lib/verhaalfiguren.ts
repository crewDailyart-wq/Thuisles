/**
 * Wat er bij een verhaaltjessom in het antwoordvak hoort.
 *
 * Net als `geldfiguren.ts`: een gewoon bestand zonder React, zodat `npm run
 * opgaven` kan nakijken dat het antwoord van de generator precies is wat het
 * scherm als goed ziet.
 */

import type { Figuur } from "@/lib/generatoren/soort";

export type Verhaalfiguur = Extract<Figuur, { soort: "verhaaltje" }>;

export function isVerhaalfiguur(figuur: Figuur | null | undefined): figuur is Verhaalfiguur {
  return figuur !== null && figuur !== undefined && figuur.soort === "verhaaltje";
}

/** Bij kiezen het nummer van de goede knop; bij typen staat het getal in de vraag zelf. */
export function juistKeuzeAntwoord(figuur: Verhaalfiguur): string | null {
  return figuur.keuzes ? String(figuur.goed) : null;
}
