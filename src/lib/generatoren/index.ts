/**
 * De lijst met beschikbare generatoren.
 *
 * Een nieuw type toevoegen: bestand erbij, hier aanmelden. De beheerschermen
 * en de opslag hoeven niet te veranderen.
 */

import { aftrekkenGenerator } from "@/lib/generatoren/aftrekken";
import { busGenerator } from "@/lib/generatoren/bus";
import { kralenGenerator } from "@/lib/generatoren/kralen";
import { optellenGenerator } from "@/lib/generatoren/optellen";
import { splitsenGenerator } from "@/lib/generatoren/splitsen";
import { tellenslepenGenerator } from "@/lib/generatoren/tellenslepen";
import { tafelsGenerator } from "@/lib/generatoren/tafels";
import type { Generator } from "@/lib/generatoren/soort";

export const alleGeneratoren: Generator[] = [
  tafelsGenerator,
  optellenGenerator,
  aftrekkenGenerator,
  splitsenGenerator,
  kralenGenerator,
  busGenerator,
  tellenslepenGenerator,
];

export function zoekGenerator(id: string): Generator | null {
  return alleGeneratoren.find((g) => g.id === id) ?? null;
}
