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
];

export function zoekDraaiboek(id: string): Lesdraaiboek | null {
  return LESSEN.find((l) => l.id === id) ?? null;
}
