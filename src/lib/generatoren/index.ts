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
/* Het domein Tijd: de wijzerklok, de digitale klok, dagen, maanden en de kalender. */
import {
  dagdeelGenerator,
  klokaflezenGenerator,
  klokduurGenerator,
  klokkiezenGenerator,
  klokkloptGenerator,
  klokkoppelenGenerator,
  klokkenvolgordeGenerator,
  kloktypenGenerator,
  klokvlekGenerator,
  klokzettenGenerator,
  urenminutenGenerator,
  wijzeraanwijzenGenerator,
} from "@/lib/generatoren/tijd-wijzerklok";
import {
  digitaalaflezenGenerator,
  digitaaldagdeelGenerator,
  digitaaldelenGenerator,
  digitaalverschilGenerator,
} from "@/lib/generatoren/tijd-digitaal";
import {
  dagenaanvullenGenerator,
  dagvraagGenerator,
  kalenderaantalGenerator,
  kalenderdagGenerator,
  kalenderdatumGenerator,
  kalendernachtjesGenerator,
  kalenderzoekGenerator,
  maandenaanvullenGenerator,
  maandvraagGenerator,
} from "@/lib/generatoren/tijd-kalender";
/* Het domein Geld: munten en briefjes, betalen, en rekenen met geld. */
import {
  evenveelGenerator,
  geldgroepenGenerator,
  geldleggenGenerator,
  geldontbreektGenerator,
  geldtellenGenerator,
  geldvolgordeGenerator,
  geldwaardeGenerator,
  muntenofeurosGenerator,
  welkegroepjesGenerator,
} from "@/lib/generatoren/geld-munten";
import {
  bonnetjeGenerator,
  geldafrondenGenerator,
  geldkortingGenerator,
  geldschattenGenerator,
  geldsomGenerator,
  geldverhaalGenerator,
  kunjebetalenGenerator,
} from "@/lib/generatoren/geld-rekenen";
import { geldnotatieGenerator } from "@/lib/generatoren/geld-notatie";
import { verhaaltjeGenerator } from "@/lib/generatoren/verhaaltje";
import { rekensomGenerator } from "@/lib/generatoren/rekensom";
import { rekenrekerbijGenerator } from "@/lib/generatoren/rekenrekerbij";
import { groepjesmakerGenerator } from "@/lib/generatoren/groepjesmaker";
import { raketsomGenerator } from "@/lib/generatoren/raketsom";
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
  /* Tijd: eerst de uren en de dagdelen, dan de wijzerklok, dan de digitale. */
  urenminutenGenerator,
  dagdeelGenerator,
  wijzeraanwijzenGenerator,
  klokaflezenGenerator,
  klokkloptGenerator,
  klokkiezenGenerator,
  klokzettenGenerator,
  klokkoppelenGenerator,
  klokkenvolgordeGenerator,
  kloktypenGenerator,
  klokduurGenerator,
  klokvlekGenerator,
  digitaaldelenGenerator,
  digitaaldagdeelGenerator,
  digitaalaflezenGenerator,
  digitaalverschilGenerator,
  /* Tijd: de dagen, de maanden en de kalender. */
  dagvraagGenerator,
  dagenaanvullenGenerator,
  maandvraagGenerator,
  maandenaanvullenGenerator,
  kalenderdagGenerator,
  kalenderzoekGenerator,
  kalenderaantalGenerator,
  kalenderdatumGenerator,
  kalendernachtjesGenerator,
  /* Geld: eerst munten en briefjes, dan betalen, dan rekenen met geld. */
  geldwaardeGenerator,
  geldvolgordeGenerator,
  geldtellenGenerator,
  geldleggenGenerator,
  muntenofeurosGenerator,
  geldnotatieGenerator,
  geldgroepenGenerator,
  evenveelGenerator,
  welkegroepjesGenerator,
  geldontbreektGenerator,
  geldsomGenerator,
  geldverhaalGenerator,
  kunjebetalenGenerator,
  bonnetjeGenerator,
  geldafrondenGenerator,
  geldschattenGenerator,
  geldkortingGenerator,
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
  /* Verhaaltjessommen: optellen, aftrekken, tafels en delen in korte verhaaltjes. */
  verhaaltjeGenerator,
  /* Erbij- en erafsommen tot en met 100. */
  rekensomGenerator,
  rekenrekerbijGenerator,
  /* Godot-bouwstenen (oktober 2026). */
  groepjesmakerGenerator,
  raketsomGenerator,
];

export function zoekGenerator(id: string): Generator | null {
  return alleGeneratoren.find((g) => g.id === id) ?? null;
}
