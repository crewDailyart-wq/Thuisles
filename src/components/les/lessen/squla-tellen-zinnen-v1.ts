/**
 * DE EERSTE VERSIE van de telzinnen (9 tot 17 november 2026), letterlijk bewaard.
 *
 * Op 18 november 2026 kreeg de gouden les Tellen (de proefles) warmere zinnen in varianten (Sara: "Bliepo klinkt als
 * een juf, niet als een robot"); die staan in squla-tellen-gouden-zinnen.ts onder TEL. De zinnen hieronder zijn NIET
 * weggegooid en NIET veranderd: de gouden Rekenmix-lessen gebruiken ze nog (via squla-tellen-gouden-zinnen.ts, zelfde
 * namen als altijd: ZIN, TELREACTIE, AANMOEDIG_TIKKEN). Die lessen komen later aan de beurt, na akkoord van Sara.
 * Oud naast nieuw: WIJZIGINGEN-ZINNEN-TELLEN.md.
 */

import { VASTE_KLEUR } from "../vlakken/squla-tellen-tekenen";
import type { Rijtje } from "./squla-klok-gouden-zinnen";
import type { Fruit } from "./squla-tellen-gouden-zinnen";

const rij = (zinnen: string[], robot: number[] = []): Rijtje => ({ zinnen, robot });
const gk = (n: number, f: Fruit) => `{${n}:${f.kleur}}`;

/* ---------- vaste zinnen van het verloop (draaiboek Tellen §2; eigen woorden) ---------- */

export const ZIN = {
  /** Stap 1: openen (eigen beginzin van de les, BOUWREGELS 4.3). */
  begin: ["In deze les tel je fruit.", `Kijk, de appels liggen in rijen van {5:${VASTE_KLEUR.appel}}.`],
  /* "Klaar met kijken? Tik dan op de blauwe pijl." (pijlUitleg) is weg sinds 10 nov 2026: Bliepo praat door en het kind
     hoeft nooit op de pijl te tikken (BOUWREGELS 15.27; WEGGEHAALD.md). */
  /** De vraag (Squla: "Hoeveel … zie je?"); de eerste keer met wat het kind moet doen (de knoppen 1 keer uitleggen, 3.15). */
  vraag: (f: Fruit) => `Hoeveel ${f.naam} zie je?`,
  vraagEerste: "Tel ze en tik op het goede getal.",
  /** Draaiboek §3 A.1 (b): bij de eerste telvraag samen natellen. */
  natellen: "Laten we ze samen natellen.",
  natellenKlaar: (n: number, f: Fruit) => `Zie je? Het zijn er ${gk(n, f)}. Je had het precies goed.`,
  /** Draaiboek §3 A.3: na de 2e fout samen tellen. */
  /** 3 versies die wisselen (5.10; keuring Minsommen: niet bij elke 2e fout dezelfde zin). */
  samenHelp: ["Kom, we tellen ze samen.", "We tellen ze samen.", "Kom, samen tellen we ze."],
  samenTik: (f: Fruit) => `Tik op elke ${f.een}. Ik tel mee.`,
  samenHand: (f: Fruit) => `Tik op een ${f.een} zonder nummer.`,
  samenKlaar: (n: number, f: Fruit) => `${gk(n, f)}. Samen telden we ${gk(n, f)} ${f.naam}.`,
  /** Vangnet (LESRECEPT, geleerd bij Meer-minder): 20 s geen tik, dan telt Bliepo de rest zelf (geen "Ja", geen "samen"). */
  samenZelf: (n: number, f: Fruit) => `Kijk, ik tel de rest. Het zijn er ${gk(n, f)}.`,
  /** Stap 10: einde. */
  slot: "Je telde fruit tot wel 17.",
  /** Draaiboek stap 10: Bliepo zegt kort wat het kind met de kaart doet. */
  kaartTik: "Tik op de kaart.",
  /** Hetzelfde foute getal 2 keer: niet 2 keer dezelfde eerste zin (keuring 9 nov). */
  weerGekozen: (x: number, f: Fruit) => `Je koos weer ${gk(x, f)}.`,
};

/** BLIEPO-KARAKTER.md §4 Tellen: zin 6, 7 en 10 (met het aantal, zoals de lof in het draaiboek). */
/* Zin 3 en 4 zonder "Ja" (kind-test 9 nov: geen 2 keer "Ja" achter elkaar); eigen aanvulling op het rijtje. De robotzin
   (laatste) hooguit 1 keer per les. */
export const TELREACTIE = (n: number, f: Fruit) => rij([`Ja, er zijn er ${gk(n, f)}.`, `Ja, je telde ze allemaal: ${gk(n, f)}.`, `Het zijn er ${gk(n, f)}.`, `Je telde er ${gk(n, f)}.`, `Inderdaad, je telde tot ${gk(n, f)}.`], [4]);
export const TELREACTIE_JA = [0, 1];
export const TELREACTIE_ROBOT = 4;
/** Aanmoediging bij het hulphandje tijdens het samen tellen (het kind moet tikken, niet nadenken; 14.35). */
export const AANMOEDIG_TIKKEN = ["Je bent goed bezig.", "Jij kunt dit."];
