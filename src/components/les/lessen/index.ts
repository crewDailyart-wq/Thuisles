/**
 * Alle uitleglessen met het nieuwe lesscherm, per onderdeel een bestand.
 * Een nieuwe les zet je in de lijst van zijn eigen onderdeel.
 */

import type { Lesdraaiboek } from "../soort";
import { optellenOnder10 } from "./optellen-onder-10";
import { LESSEN_OPTELLEN_TOT_10 } from "./optellen-tot-10";
import { LESSEN_AFTREKKEN_TOT_10 } from "./aftrekken-tot-10";
import { LESSEN_VERGELIJKEN } from "./vergelijken";
import { LESSEN_OPTELLEN_TOT_20 } from "./optellen-tot-20";
import { LESSEN_OPTELLEN_TOT_100 } from "./optellen-tot-100";
import { LESSEN_TIENTALLEN } from "./tientallen";
import { LESSEN_TELLEN_TOT_120 } from "./tellen-tot-120";
import { LESSEN_GETALLENLIJN } from "./getallenlijn";
import { LESSEN_KLOKKIJKEN } from "./klokkijken";
import { LESSEN_VERHAALTJESSOMMEN } from "./verhaaltjessommen";
import { LESSEN_FLITSEN } from "./flitsen";
import { LESSEN_ZO_WERKT_HET } from "./zo-werkt-het";
/* Nieuwe lessen naar Squla (30 oktober 2026): eerst 3 voorbeelden ter beoordeling. */
import { LESSEN_SQULA_HUISNUMMERS } from "./squla-huisnummers";
import { LESSEN_SQULA_SPLITSEN } from "./squla-splitsen";
import { LESSEN_SQULA_PIRAAT } from "./squla-piraat";
import { LESSEN_SQULA_REKENTAAL } from "./squla-rekentaal";
import { LESSEN_SQULA_REKENTAAL_GOUDEN } from "./squla-rekentaal-gouden";
import { LESSEN_SQULA_DAGEN } from "./squla-dagen";
import { LESSEN_SQULA_GETALLENLIJN } from "./squla-getallenlijn";
import { LESSEN_SQULA_TELLEN } from "./squla-tellen";
import { LESSEN_SQULA_TIJD } from "./squla-tijd";
import { LESSEN_SQULA_MEER_MINDER } from "./squla-meer-minder";
import { LESSEN_SQULA_MINSOMMEN } from "./squla-minsommen";
import { LESSEN_SQULA_PLUSSOMMEN } from "./squla-plussommen";
import { LESSEN_SQULA_GELD } from "./squla-geld";
import { LESSEN_SQULA_METEN } from "./squla-meten";
import { LESSEN_SQULA_KLOK } from "./squla-klok";
/* De gouden klokles (8 november 2026, BOUWREGELS hoofdstuk 15): een nieuwe les naast squla-klok-hoelaat-1. */
import { LESSEN_SQULA_KLOK_GOUDEN } from "./squla-klok-gouden";
/* De gouden les Tellen (9 november 2026, BOUWREGELS 15.22): een nieuwe les naast squla-tellen-fruit-1. */
import { LESSEN_SQULA_TELLEN_GOUDEN } from "./squla-tellen-gouden";
/* De gouden les Splitsen (9 november 2026, BOUWREGELS 15.22): een nieuwe les naast squla-splits-splitsen1-1. */
import { LESSEN_SQULA_SPLITSEN_GOUDEN } from "./squla-splitsen-gouden";
/* De gouden les Plussommen (9 november 2026, BOUWREGELS 15.22): een nieuwe les naast squla-plus-bakkerij-1. */
import { LESSEN_SQULA_PLUSSOMMEN_GOUDEN } from "./squla-plussommen-gouden";
/* De gouden les Minsommen (10 november 2026, BOUWREGELS 15.22): een nieuwe les naast squla-min-machine-1. */
import { LESSEN_SQULA_MINSOMMEN_GOUDEN } from "./squla-minsommen-gouden";
/* De gouden les Meer-minder (10 november 2026, BOUWREGELS 15.22): een nieuwe les naast squla-meer-minder-evenveel2-1. */
import { LESSEN_SQULA_MEER_MINDER_GOUDEN } from "./squla-meer-minder-gouden";
/* De gouden les Huisnummers (10 november 2026, BOUWREGELS 15.22): een nieuwe les naast squla-huisnummers. */
import { LESSEN_SQULA_HUISNUMMERS_GOUDEN } from "./squla-huisnummers-gouden";
import { LESSEN_SQULA_GETALLENLIJN_GOUDEN } from "./squla-getallenlijn-gouden";
/* De gouden les Meten (10 november 2026, BOUWREGELS 15.21, 15.22): een nieuwe les naast squla-meten-oppervlakte-1. */
import { LESSEN_SQULA_METEN_GOUDEN } from "./squla-meten-gouden";
/* De gouden les Geld (11 november 2026, BOUWREGELS 15.22, 15.25): een nieuwe les naast squla-geld-geldmachine-1. */
import { LESSEN_SQULA_GELD_GOUDEN } from "./squla-geld-gouden";
/* De gouden les Vormen: Patronen (11 november 2026, BOUWREGELS 15.22, 15.25): een nieuwe les naast squla-vormen-patronen-1. */
import { LESSEN_SQULA_VORMEN_GOUDEN } from "./squla-vormen-gouden";
/* De gouden les Dagen (11 november 2026, BOUWREGELS 15.22, 15.25): een nieuwe les naast squla-dagen-van-de-week. */
import { LESSEN_SQULA_DAGEN_GOUDEN } from "./squla-dagen-gouden";
/* De gouden les Tijd (11 november 2026, BOUWREGELS 15.22, 15.25): een nieuwe les naast squla-tijd-dagen-1. */
import { LESSEN_SQULA_TIJD_GOUDEN } from "./squla-tijd-gouden";
import { LESSEN_SQULA_VORMEN } from "./squla-vormen";
import { LESSEN_SQULA_REKENMIX } from "./squla-rekenmix";

export const LESSEN: Lesdraaiboek[] = [
  ...LESSEN_ZO_WERKT_HET,
  /* De instaptoets eerst, dan "Optellen onder de 10", dan de rest: de volgorde van Synthesis. */
  ...LESSEN_OPTELLEN_TOT_10.slice(0, 1),
  optellenOnder10,
  ...LESSEN_OPTELLEN_TOT_10.slice(1),
  ...LESSEN_AFTREKKEN_TOT_10,
  ...LESSEN_OPTELLEN_TOT_20,
  ...LESSEN_TELLEN_TOT_120,
  ...LESSEN_VERGELIJKEN,
  ...LESSEN_KLOKKIJKEN,
  ...LESSEN_GETALLENLIJN,
  ...LESSEN_VERHAALTJESSOMMEN,
  ...LESSEN_TIENTALLEN,
  ...LESSEN_OPTELLEN_TOT_100,
  ...LESSEN_FLITSEN,
  ...LESSEN_SQULA_HUISNUMMERS,
  ...LESSEN_SQULA_HUISNUMMERS_GOUDEN,
  ...LESSEN_SQULA_GETALLENLIJN_GOUDEN,
  ...LESSEN_SQULA_METEN_GOUDEN,
  ...LESSEN_SQULA_GELD_GOUDEN,
  ...LESSEN_SQULA_VORMEN_GOUDEN,
  ...LESSEN_SQULA_SPLITSEN,
  ...LESSEN_SQULA_SPLITSEN_GOUDEN,
  ...LESSEN_SQULA_PIRAAT,
  ...LESSEN_SQULA_REKENTAAL,
  ...LESSEN_SQULA_REKENTAAL_GOUDEN,
  ...LESSEN_SQULA_DAGEN,
  ...LESSEN_SQULA_DAGEN_GOUDEN,
  ...LESSEN_SQULA_GETALLENLIJN,
  ...LESSEN_SQULA_TELLEN,
  ...LESSEN_SQULA_TELLEN_GOUDEN,
  ...LESSEN_SQULA_TIJD,
  ...LESSEN_SQULA_TIJD_GOUDEN,
  ...LESSEN_SQULA_MEER_MINDER,
  ...LESSEN_SQULA_MEER_MINDER_GOUDEN,
  ...LESSEN_SQULA_MINSOMMEN,
  ...LESSEN_SQULA_MINSOMMEN_GOUDEN,
  ...LESSEN_SQULA_PLUSSOMMEN,
  ...LESSEN_SQULA_PLUSSOMMEN_GOUDEN,
  ...LESSEN_SQULA_GELD,
  ...LESSEN_SQULA_METEN,
  ...LESSEN_SQULA_KLOK,
  ...LESSEN_SQULA_KLOK_GOUDEN,
  ...LESSEN_SQULA_VORMEN,
  ...LESSEN_SQULA_REKENMIX,
];

export function zoekDraaiboek(id: string): Lesdraaiboek | null {
  return LESSEN.find((l) => l.id === id) ?? null;
}
