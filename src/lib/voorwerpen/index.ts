/**
 * Alle voorwerpen bij elkaar. Elk onderwerp heeft zijn eigen lijstbestand,
 * zodat meerdere bouwers tegelijk kunnen werken. Zoek eerst of een ding al
 * bestaat (ook in een ander lijstbestand) en gebruik dan dezelfde naam:
 * hetzelfde ding ziet er overal hetzelfde uit.
 */
import type { Voorwerp } from "./soort";
import { ALGEMEEN } from "./lijst-algemeen";
import { SPLITSEN } from "./lijst-splitsen";
import { PIRAAT } from "./lijst-piraat";
import { KLOK } from "./lijst-klok";
import { PLUSSOMMEN } from "./lijst-plussommen";
import { GELD } from "./lijst-geld";
import { MINSOMMEN } from "./lijst-minsommen";
import { METEN } from "./lijst-meten";
import { TELLEN } from "./lijst-tellen";
import { GETALLENLIJN } from "./lijst-getallenlijn";
import { VORMEN } from "./lijst-vormen";
import { TIJD } from "./lijst-tijd";
import { MEER_MINDER } from "./lijst-meer-minder";
import { REKENMIX } from "./lijst-rekenmix";

export const VOORWERPEN: Voorwerp[] = [...ALGEMEEN, ...SPLITSEN, ...PIRAAT, ...GELD, ...PLUSSOMMEN, ...KLOK, ...MINSOMMEN, ...METEN, ...TELLEN, ...GETALLENLIJN, ...TIJD, ...VORMEN, ...MEER_MINDER, ...REKENMIX];

export { GROEPEN, type Voorwerp, type Groep } from "./soort";
