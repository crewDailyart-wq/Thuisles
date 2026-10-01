/**
 * Welke voorwerpen een opdracht mag gebruiken, en hoe ze elkaar afwisselen.
 *
 * Dezelfde getekende voorwerpen als bij Plaatjes tellen: de appel, het eendje,
 * het muisje. Welke er mogen voorkomen staat per sjabloon in de database — dus
 * niets staat hier vast behalve de lijst waaruit te kiezen valt.
 *
 * Binnen één vraag is het altijd hetzelfde voorwerp, anders weet een kind niet
 * wat het moet tellen. Per vraag wisselt het wél: de lijst wordt gehusseld en
 * daarna op een rij afgelopen, zodat niet drie keer achter elkaar de ster komt
 * en het eendje nooit.
 */

import { husselen, type Veld } from "@/lib/generatoren/soort";
import { TELPLAATJE_NAMEN, TELPLAATJE_OPTIES } from "@/lib/telplaatjes";

/** Het instelveld; overal hetzelfde, zodat elk type dezelfde keuze biedt. */
export const plaatjesVeld: Veld = {
  soort: "vinkjes",
  sleutel: "plaatjes",
  label: "Welke voorwerpen mogen voorkomen",
  opties: TELPLAATJE_OPTIES.map((o) => ({ waarde: o.waarde, label: o.meervoud })),
  hulp: "Vink er meerdere aan voor afwisseling: dan heeft vraag 1 appels, vraag 2 muisjes, enzovoort. Binnen één vraag is het altijd hetzelfde voorwerp. Niets aangevinkt = alle voorwerpen.",
};

/** De voorwerpen waaruit deze ronde gekozen mag worden; leeg = allemaal. */
export function bruikbarePlaatjes(gekozen: string[]): string[] {
  const geldig = gekozen.filter((n) => TELPLAATJE_NAMEN.includes(n));
  return geldig.length > 0 ? geldig : [...TELPLAATJE_NAMEN];
}

/** De gehusselde reeks om per vraag langs te lopen. */
export function plaatjesReeks(kans: () => number, gekozen: string[]): string[] {
  return husselen(kans, bruikbarePlaatjes(gekozen));
}
