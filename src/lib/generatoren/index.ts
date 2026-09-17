/**
 * De lijst met beschikbare generatoren.
 *
 * Een nieuw type toevoegen: bestand erbij, hier aanmelden. De beheerschermen
 * en de opslag hoeven niet te veranderen.
 */

import { aftrekkenGenerator } from "@/lib/generatoren/aftrekken";
import { blokkenGenerator } from "@/lib/generatoren/blokken";
import { busGenerator } from "@/lib/generatoren/bus";
import { kralenGenerator } from "@/lib/generatoren/kralen";
import { optellenGenerator } from "@/lib/generatoren/optellen";
import { plaatjestellenGenerator } from "@/lib/generatoren/plaatjestellen";
import { splitsenGenerator } from "@/lib/generatoren/splitsen";
import { straatGenerator } from "@/lib/generatoren/straat";
import { stapstenenGenerator } from "@/lib/generatoren/stapstenen";
import { tellenslepenGenerator } from "@/lib/generatoren/tellenslepen";
import { tafelsGenerator } from "@/lib/generatoren/tafels";
import type { Generator } from "@/lib/generatoren/soort";
import { bosGeneratoren } from "@/lib/generatoren/bosspellen";

export const alleGeneratoren: Generator[] = [
  tafelsGenerator,
  optellenGenerator,
  aftrekkenGenerator,
  splitsenGenerator,
  kralenGenerator,
  busGenerator,
  tellenslepenGenerator,
  stapstenenGenerator,
  plaatjestellenGenerator,
  blokkenGenerator,
  straatGenerator,
  ...bosGeneratoren,
];

export function zoekGenerator(id: string): Generator | null {
  return alleGeneratoren.find((g) => g.id === id) ?? null;
}
