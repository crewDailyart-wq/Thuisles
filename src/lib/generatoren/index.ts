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
import { splitstabelGenerator } from "@/lib/generatoren/splitstabel";
import { aanvullenGenerator } from "@/lib/generatoren/aanvullen";
import { splitsschemaGenerator } from "@/lib/generatoren/splitsschema";
import { verdelenGenerator } from "@/lib/generatoren/verdelen";
import { splitsdriehoekGenerator } from "@/lib/generatoren/splitsdriehoek";
import { plaatjessomGenerator } from "@/lib/generatoren/plaatjessom";
import { plussomGenerator } from "@/lib/generatoren/plussom";
import { somkeuzeGenerator } from "@/lib/generatoren/somkeuze";
import { aanvultabelGenerator } from "@/lib/generatoren/aanvultabel";
import { evenveelsomGenerator } from "@/lib/generatoren/evenveelsom";
import { koppelsommenGenerator } from "@/lib/generatoren/koppelsommen";
import { viatienGenerator } from "@/lib/generatoren/viatien";
import { tweegetallenGenerator } from "@/lib/generatoren/tweegetallen";
import { balansGenerator } from "@/lib/generatoren/balans";
import { wegstrepenGenerator } from "@/lib/generatoren/wegstrepen";
import { minsomplaatjeGenerator } from "@/lib/generatoren/minsomplaatje";
import { plaatjesminsomGenerator } from "@/lib/generatoren/plaatjesminsom";
import { minsomGenerator } from "@/lib/generatoren/minsom";
import { minkoppelenGenerator } from "@/lib/generatoren/minkoppelen";
import { rekenrekflitsGenerator } from "@/lib/generatoren/rekenrekflits";
import { rekenrekafGenerator } from "@/lib/generatoren/rekenrekaf";
import { rekenrekhoofdGenerator } from "@/lib/generatoren/rekenrekhoofd";
import { straatGenerator } from "@/lib/generatoren/straat";
import { bioscoopGenerator } from "@/lib/generatoren/bioscoop";
import { vakkenGenerator } from "@/lib/generatoren/vakken";
import { treinGenerator } from "@/lib/generatoren/trein";
import { vissenGenerator } from "@/lib/generatoren/vissen";
import { getallenlijnGenerator } from "@/lib/generatoren/getallenlijn";
import { stapstenenGenerator } from "@/lib/generatoren/stapstenen";
import { tellenslepenGenerator } from "@/lib/generatoren/tellenslepen";
import { tafelsGenerator } from "@/lib/generatoren/tafels";
/* De domeinen Tafels en Delen: de kale sommen, het koppelen en het kraampje. */
import {
  deelkoppelenGenerator,
  deelsomGenerator,
  welkedeelsomGenerator,
} from "@/lib/generatoren/delen";
import {
  handigkeerGenerator,
  keerdeelkoppelenGenerator,
  keerdeelsamenGenerator,
  keerkoppelenGenerator,
  keernullenGenerator,
  keerplaatjesGenerator,
  keerrasterGenerator,
  keersomGenerator,
  marktkraamGenerator,
  welkekeersomGenerator,
} from "@/lib/generatoren/tafelsommen";
import type { Generator } from "@/lib/generatoren/soort";
import { bosGeneratoren } from "@/lib/generatoren/bosspellen";

export const alleGeneratoren: Generator[] = [
  tafelsGenerator,
  /* Tafels: eerst begrijpen, dan oefenen, dan de link met delen, dan het echt. */
  keerrasterGenerator,
  keerplaatjesGenerator,
  handigkeerGenerator,
  keernullenGenerator,
  keersomGenerator,
  keerkoppelenGenerator,
  welkekeersomGenerator,
  keerdeelkoppelenGenerator,
  keerdeelsamenGenerator,
  marktkraamGenerator,
  /* Delen: de kale deelsom, het koppelen en zelf een deelsom maken. */
  deelsomGenerator,
  deelkoppelenGenerator,
  welkedeelsomGenerator,
  optellenGenerator,
  aftrekkenGenerator,
  splitsenGenerator,
  splitstabelGenerator,
  aanvullenGenerator,
  splitsschemaGenerator,
  verdelenGenerator,
  splitsdriehoekGenerator,
  plaatjessomGenerator,
  plussomGenerator,
  somkeuzeGenerator,
  aanvultabelGenerator,
  evenveelsomGenerator,
  koppelsommenGenerator,
  viatienGenerator,
  tweegetallenGenerator,
  balansGenerator,
  wegstrepenGenerator,
  minsomplaatjeGenerator,
  plaatjesminsomGenerator,
  minsomGenerator,
  minkoppelenGenerator,
  rekenrekflitsGenerator,
  rekenrekafGenerator,
  rekenrekhoofdGenerator,
  kralenGenerator,
  busGenerator,
  tellenslepenGenerator,
  stapstenenGenerator,
  plaatjestellenGenerator,
  blokkenGenerator,
  straatGenerator,
  vissenGenerator,
  treinGenerator,
  vakkenGenerator,
  bioscoopGenerator,
  getallenlijnGenerator,
  ...bosGeneratoren,
];

export function zoekGenerator(id: string): Generator | null {
  return alleGeneratoren.find((g) => g.id === id) ?? null;
}
