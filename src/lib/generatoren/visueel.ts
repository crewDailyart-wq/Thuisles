/**
 * Hoeveel sommen van een oefening visueel beginnen.
 *
 * ---------------------------------------------------------------------------
 * De afspraak
 * ---------------------------------------------------------------------------
 * De meeste opdrachten beginnen met een visueel stuk waarin het kind het zelf
 * doet: plaatjes wegtikken, kralen wegschuiven. Zo ziet het waaróm het klopt.
 * Daarna volgt gewoon oefenen. Zie ONTWERPREGELS.md.
 *
 * Hoeveel sommen dat zijn is geen vaste keuze van de programmeur maar een
 * instelling per sjabloon, zodat de eigenaar het per titel kan bijstellen.
 * Standaard drie.
 *
 * De generator zet het antwoord erop: de eerste sommen die hij maakt krijgen
 * `visueel: true` in de figuur mee. Het oefenscherm zet die sommen vooraan in
 * de serie, zodat het kind ze ook echt als eerste ziet.
 */

import { getal, type Instellingen, type Veld } from "@/lib/generatoren/soort";

/** De standaard: drie sommen met het beeld erbij. */
export const VISUEEL_STANDAARD = 3;

/** Het instelveld; overal hetzelfde, zodat het bij elk type hetzelfde heet. */
export const VISUEEL_VELD: Veld = {
  soort: "getal",
  sleutel: "visueel",
  label: "Hoeveel sommen beginnen met het beeld erbij",
  min: 0,
  max: 15,
  hulp: "De eerste sommen van de oefening doet het kind zelf voor zich: wegstrepen of kralen wegschuiven. Daarna volgt gewoon oefenen. Nul betekent meteen oefenen zonder beeld.",
};

/** Wat er bij dit sjabloon is ingesteld, binnen de grenzen van het veld. */
export function visueleSommen(inst: Instellingen): number {
  return Math.max(0, Math.min(15, getal(inst, "visueel", VISUEEL_STANDAARD)));
}
