/**
 * Zuivere delen van de 3 EXTRA gouden lessen (12 november 2026): de vorm van een fouttabel-regel en een paar kleine
 * hulpfuncties. Geen koppeling met het lesscherm of de database, zodat de fouttabel-scripts dit bestand kunnen laden.
 */

import { BEVESTIG, EINDE, EINDE_VEEL_FOUTEN, LOF, LOF_KIJK_INDEX, MOMENT, NAAM_LOF, ONDUIDELIJK, ONDUIDELIJK_NOG_1_KEER, metNaam, type Rijtje } from "./squla-klok-gouden-zinnen";

export { BEVESTIG, EINDE, EINDE_VEEL_FOUTEN, LOF, LOF_KIJK_INDEX, MOMENT, NAAM_LOF, ONDUIDELIJK, ONDUIDELIJK_NOG_1_KEER, metNaam, type Rijtje };

/** De fouttabel van 1 fout antwoord (zelfde vorm als in de gouden lessen). */
export type Fout = {
  code: string;
  /** Welke uitleg bij de 2e fout hoort (dezelfde soort 2 keer = "weer"). */
  soort: string;
  denkfout: string;
  /** Bliepo's eerste zin (leeg bij "onduidelijk": dan een zin uit BLIEPO-KARAKTER.md §10). */
  eerste: string;
  hint: string;
  /** Uitleg na de 2e fout (zonder het antwoord; daarna volgt het samen doen). */
  uitleg: string;
  /** Dezelfde denkfout 2 keer: zeggen dat het weer gebeurt, en anders uitleggen. */
  weer: string[];
  /** Wat er op het scherm gebeurt. */
  scherm: string;
  /** Waarom de richting niet genoemd wordt (zou het antwoord verklappen, 15.17). */
  noot?: string;
};

export const OND_FOUT = (hint: string, uitleg: string): Fout => ({ code: "onduidelijk", soort: "onduidelijk", denkfout: "niet duidelijk (geen reden verzonnen)", eerste: "", hint, uitleg, weer: [uitleg], scherm: "" });

/** Een vaste "toevalsreeks" per tekst (dezelfde plekken elke keer). */
export function zaad(tekst: string) {
  let h = 2166136261;
  for (const ch of tekst) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

