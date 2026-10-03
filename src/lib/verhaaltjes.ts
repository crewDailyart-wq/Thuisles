/**
 * Verhaaltjessommen: korte verhaaltjes met een som erin (WERKPLAN.md, groep 4).
 *
 * Een gewoon bestand zonder React, net als `tijd.ts` en `geld.ts`: de generator
 * draait op de server en in `npm run opgaven`, en het scherm kijkt hier na.
 *
 * ---------------------------------------------------------------------------
 * Hoe een verhaaltje ontstaat
 * ---------------------------------------------------------------------------
 * Elk verhaaltje komt uit een zinsjabloon dat met de hand is geschreven en
 * nagelezen. Een sjabloon kiest zijn eigen getallen, binnen een grens die past
 * bij wat er gebeurt: in een klas zitten hooguit 32 kinderen, in een eierdoos
 * 4, 6 of 10 eieren. Er is altijd minstens 2 van iets, zodat werkwoord en
 * meervoud altijd kloppen ("Er vallen 3 appels", nooit "Er vallen 1 appel").
 *
 * De taalregels (WERKPLAN.md) worden bij elk verhaaltje nagekeken door
 * `controleerVerhaal`: elke zin hoogstens 12 woorden, elke zin met een
 * hoofdletter, de vraag als laatste zin met "Hoeveel", "Hoe" of "Op welke",
 * en het antwoord binnen het getallengebied. Een verhaaltje dat niet door die
 * controle komt, wordt niet gebruikt.
 */

export type Woord = { ev: string; mv: string };

const w = (ev: string, mv: string): Woord => ({ ev, mv });
/** Een eenheid die niet verandert: "euro", "centimeter", "keer". */
const vast = (woord: string): Woord => ({ ev: woord, mv: woord });

/** "1 sticker", "12 stickers". */
export function aantal(n: number, woord: Woord): string {
  return `${n} ${n === 1 ? woord.ev : woord.mv}`;
}

/** Namen die afwisselen, uit verschillende culturen. */
export const NAMEN = [
  "Noor", "Daan", "Aya", "Milan", "Lina", "Finn", "Yara", "Bilal", "Mila", "Ravi",
  "Zoë", "Sem", "Fatima", "Luuk", "Amira", "Jesse", "Elif", "Thijs", "Sanne", "Omar",
  "Julia", "Mehmet", "Nina", "Kofi",
];

/** Maanden met 31 dagen: daar past elke datum tot en met 31 in. */
const MAANDEN31 = ["januari", "maart", "mei", "juli", "augustus", "oktober", "december"];

export type Thema = "school" | "winkel" | "spel" | "thuis";

/** Wat een sjabloon oplevert. */
export type Verhaal = {
  zinnen: string[];
  antwoord: number;
  eenheid: Woord;
  /** Getallen die in het verhaal staan; een daarvan is een foute keuze. */
  uitVerhaal: number[];
  /** De uitkomst van de verkeerde bewerking, of null als die er niet is. */
  verkeerd: number | null;
  /** Bij een datum: dan horen de keuzes tussen 1 en 31 te liggen. */
  datum?: boolean;
};

/** Het getallengebied van een oefening. */
export type Bereik = {
  /** Het hoogste getal: 20, 50 of 100. */
  tot: number;
  /** Het laagste getal dat er bij dit kopje "groot" toe doet. */
  min: number;
  /** Over het tiental: true = moet, false = mag niet, null = maakt niet uit. */
  brug: boolean | null;
};

type Kans = () => number;

export type Sjabloon = {
  id: string;
  thema: Thema;
  maak: (kans: Kans, bereik: Bereik, namen: string[]) => Verhaal | null;
};

// ---------------------------------------------------------------------------
// Getallen kiezen
// ---------------------------------------------------------------------------

function tussen(kans: Kans, van: number, tot: number): number {
  if (tot < van) return NaN;
  return van + Math.floor(kans() * (tot - van + 1));
}

function kies<T>(kans: Kans, lijst: readonly T[]): T {
  return lijst[Math.floor(kans() * lijst.length)];
}

/** Gaat a + b over het tiental? 38 + 25 wel, 32 + 15 niet. */
function brugPlus(a: number, b: number): boolean {
  return (a % 10) + (b % 10) >= 10;
}
/** Gaat a − b over het tiental? 52 − 17 wel, 58 − 13 niet. */
function brugMin(a: number, b: number): boolean {
  return a % 10 < b % 10;
}

function brugKlopt(brug: boolean | null, gaatErover: boolean): boolean {
  return brug === null || brug === gaatErover;
}

/**
 * Twee getallen die samen een uitkomst in het bereik geven. De uitkomst ligt
 * tussen `min` en de kleinste van `tot` en de grens van het verhaal; beide
 * getallen zijn minstens 2.
 */
function plusGetallen(kans: Kans, b: Bereik, grens = 100): [number, number, number] | null {
  const hoog = Math.min(b.tot, grens);
  for (let p = 0; p < 60; p++) {
    const r = tussen(kans, Math.max(b.min, 4), hoog);
    if (Number.isNaN(r)) return null;
    const x = tussen(kans, 2, r - 2);
    const y = r - x;
    if (y < 2) continue;
    if (!brugKlopt(b.brug, brugPlus(x, y))) continue;
    return [x, y, r];
  }
  return null;
}

/** Een begingetal in het bereik en wat eraf gaat; de uitkomst is minstens 2. */
function minGetallen(kans: Kans, b: Bereik, grens = 100): [number, number, number] | null {
  const hoog = Math.min(b.tot, grens);
  for (let p = 0; p < 60; p++) {
    const a = tussen(kans, Math.max(b.min, 5), hoog);
    if (Number.isNaN(a)) return null;
    const s = tussen(kans, 2, a - 2);
    if (Number.isNaN(s)) continue;
    if (!brugKlopt(b.brug, brugMin(a, s))) continue;
    return [a, s, a - s];
  }
  return null;
}

/** Drie getallen van minstens 2 die samen een uitkomst in het bereik geven. */
function drieGetallen(kans: Kans, b: Bereik, grens = 100): [number, number, number, number] | null {
  const hoog = Math.min(b.tot, grens);
  for (let p = 0; p < 60; p++) {
    const r = tussen(kans, Math.max(b.min, 6), hoog);
    if (Number.isNaN(r)) return null;
    const x = tussen(kans, 2, r - 4);
    const y = tussen(kans, 2, r - x - 2);
    const z = r - x - y;
    if (Number.isNaN(y) || z < 2) continue;
    return [x, y, z, r];
  }
  return null;
}

/** Een begingetal en twee keer iets eraf; wat overblijft is minstens 2. */
function tweeKeerEraf(kans: Kans, b: Bereik, grens = 100): [number, number, number, number] | null {
  const hoog = Math.min(b.tot, grens);
  for (let p = 0; p < 60; p++) {
    const a = tussen(kans, Math.max(b.min, 8), hoog);
    if (Number.isNaN(a)) return null;
    const x = tussen(kans, 2, a - 4);
    const y = tussen(kans, 2, a - x - 2);
    if (Number.isNaN(y)) continue;
    const r = a - x - y;
    if (r < 2) continue;
    return [a, x, y, r];
  }
  return null;
}

/** Verschil: het grote getal in het bereik, het kleine eronder. */
function verschilGetallen(kans: Kans, b: Bereik, grens = 100): [number, number, number] | null {
  const r = minGetallen(kans, b, grens);
  return r ? [r[0], r[2], r[1]] : null;
}

/** Aanvullen: het doel in het bereik, wat er al is eronder. */
function aanvulGetallen(kans: Kans, b: Bereik, grens = 100): [number, number, number] | null {
  const r = minGetallen(kans, b, grens);
  return r ? [r[0], r[1], r[2]] : null;
}

/** Een tafelsom: hoeveel groepjes en hoeveel in elk, uitkomst hoogstens `max`. */
function keerGetallen(
  kans: Kans,
  tafels: readonly number[],
  max = 100,
  groepen: readonly number[] = [2, 3, 4, 5, 6, 7, 8, 9, 10],
): [number, number, number] | null {
  for (let p = 0; p < 60; p++) {
    const k = kies(kans, tafels);
    const g = kies(kans, groepen);
    if (g * k <= max) return [g, k, g * k];
  }
  return null;
}

/** Namen, steeds andere: de eerste drie voor het verhaal. */
function noem(namen: string[]): [string, string, string] {
  return [namen[0], namen[1], namen[2]];
}

// ---------------------------------------------------------------------------
// Woorden
// ---------------------------------------------------------------------------

const VERZAMEL = [
  w("sticker", "stickers"),
  w("knikker", "knikkers"),
  w("ruilkaart", "ruilkaarten"),
  w("kraal", "kralen"),
  w("stuiter", "stuiters"),
];
const SNOEP = [w("snoepje", "snoepjes"), w("sticker", "stickers"), w("knikker", "knikkers"), w("ruilkaart", "ruilkaarten")];

const STUKS_FRUIT = w("stuk fruit", "stuks fruit");
const EURO = vast("euro");
const CM = vast("centimeter");
const METER = vast("meter");
const KEER = vast("keer");
const KM = vast("kilometer");
const MINUTEN = w("minuut", "minuten");

// ---------------------------------------------------------------------------
// Optellen
// ---------------------------------------------------------------------------

export const OPTELLEN_ERBIJ: Sjabloon[] = [
  {
    id: "plus-oma",
    thema: "thuis",
    maak: (k, b, n) => {
      const g = plusGetallen(k, b);
      if (!g) return null;
      const [x, y, r] = g;
      const ding = kies(k, VERZAMEL);
      const [a] = noem(n);
      return {
        zinnen: [`${a} heeft ${aantal(x, ding)}.`, `Van oma krijgt ${a} er ${y} bij.`, `Hoeveel ${ding.mv} heeft ${a} nu?`],
        antwoord: r, eenheid: ding, uitVerhaal: [x, y], verkeerd: x - y,
      };
    },
  },
  {
    id: "plus-winkel",
    thema: "winkel",
    maak: (k, b, n) => {
      const g = plusGetallen(k, b);
      if (!g) return null;
      const [x, y, r] = g;
      const ding = kies(k, [w("ruilkaart", "ruilkaarten"), w("sticker", "stickers"), w("knikker", "knikkers")]);
      const [a] = noem(n);
      return {
        zinnen: [`${a} heeft ${aantal(x, ding)}.`, `In de winkel koopt ${a} er nog ${y}.`, `Hoeveel ${ding.mv} heeft ${a} nu?`],
        antwoord: r, eenheid: ding, uitVerhaal: [x, y], verkeerd: x - y,
      };
    },
  },
  {
    id: "plus-schelpen",
    thema: "spel",
    maak: (k, b, n) => {
      const g = plusGetallen(k, b);
      if (!g) return null;
      const [x, y, r] = g;
      const [a] = noem(n);
      return {
        zinnen: [`${a} zoekt schelpen op het strand.`, `Eerst vindt ${a} ${x} schelpen.`, `Daarna vindt ${a} er nog ${y}.`, `Hoeveel schelpen vindt ${a} in totaal?`],
        antwoord: r, eenheid: w("schelp", "schelpen"), uitVerhaal: [x, y], verkeerd: x - y,
      };
    },
  },
  {
    id: "plus-stoelen",
    thema: "school",
    maak: (k, b) => {
      /* In een klas staan er al minstens tien stoelen. */
      const g = plusGetallen(k, b, 40);
      if (!g || g[0] < 10) return null;
      const [x, y, r] = g;
      return {
        zinnen: [`In de klas staan ${x} stoelen.`, `De juf zet er nog ${y} bij.`, `Hoeveel stoelen staan er nu in de klas?`],
        antwoord: r, eenheid: w("stoel", "stoelen"), uitVerhaal: [x, y], verkeerd: x - y,
      };
    },
  },
  {
    id: "plus-spaarpot",
    thema: "thuis",
    maak: (k, b, n) => {
      const g = plusGetallen(k, b);
      if (!g) return null;
      const [x, y, r] = g;
      const [a] = noem(n);
      return {
        zinnen: [`${a} heeft ${x} euro in de spaarpot.`, `Opa geeft ${a} nog ${y} euro.`, `Hoeveel euro heeft ${a} nu?`],
        antwoord: r, eenheid: EURO, uitVerhaal: [x, y], verkeerd: x - y,
      };
    },
  },
  {
    id: "plus-punten",
    thema: "spel",
    maak: (k, b, n) => {
      const g = plusGetallen(k, b);
      if (!g) return null;
      const [x, y, r] = g;
      const [a] = noem(n);
      return {
        zinnen: [`${a} heeft ${x} punten bij een spelletje.`, `In de laatste ronde krijgt ${a} er ${y} bij.`, `Hoeveel punten heeft ${a} nu?`],
        antwoord: r, eenheid: w("punt", "punten"), uitVerhaal: [x, y], verkeerd: x - y,
      };
    },
  },
];

export const OPTELLEN_SAMEN: Sjabloon[] = [
  {
    id: "samen-twee",
    thema: "thuis",
    maak: (k, b, n) => {
      const g = plusGetallen(k, b);
      if (!g) return null;
      const [x, y, r] = g;
      const ding = kies(k, VERZAMEL);
      const [a, c] = noem(n);
      return {
        zinnen: [`${a} heeft ${aantal(x, ding)}.`, `${c} heeft ${aantal(y, ding)}.`, `Hoeveel ${ding.mv} hebben ze samen?`],
        antwoord: r, eenheid: ding, uitVerhaal: [x, y], verkeerd: Math.abs(x - y),
      };
    },
  },
  {
    id: "samen-plein",
    thema: "spel",
    maak: (k, b) => {
      const g = plusGetallen(k, b);
      if (!g) return null;
      const [x, y, r] = g;
      return {
        zinnen: [`Op het plein spelen ${x} jongens.`, `Er spelen ook ${y} meisjes.`, `Hoeveel kinderen spelen er op het plein?`],
        antwoord: r, eenheid: w("kind", "kinderen"), uitVerhaal: [x, y], verkeerd: Math.abs(x - y),
      };
    },
  },
  {
    id: "samen-fruit",
    thema: "thuis",
    maak: (k, b) => {
      const g = plusGetallen(k, b, 30);
      if (!g) return null;
      const [x, y, r] = g;
      return {
        zinnen: [`In de schaal liggen ${x} appels en ${y} peren.`, `Hoeveel stuks fruit liggen er in de schaal?`],
        antwoord: r, eenheid: STUKS_FRUIT, uitVerhaal: [x, y], verkeerd: Math.abs(x - y),
      };
    },
  },
  {
    id: "samen-boeken",
    thema: "school",
    maak: (k, b) => {
      /* In de kast van een groep staan minstens vijf boeken. */
      const g = plusGetallen(k, b);
      if (!g || g[0] < 5 || g[1] < 5) return null;
      const [x, y, r] = g;
      return {
        zinnen: [`Groep 4 heeft ${x} boeken in de kast.`, `Groep 5 heeft er ${y}.`, `Hoeveel boeken hebben de twee groepen samen?`],
        antwoord: r, eenheid: w("boek", "boeken"), uitVerhaal: [x, y], verkeerd: Math.abs(x - y),
      };
    },
  },
  {
    id: "samen-ballen",
    thema: "winkel",
    maak: (k, b) => {
      const g = plusGetallen(k, b);
      if (!g) return null;
      const [x, y, r] = g;
      return {
        zinnen: [`In de winkel liggen ${x} rode ballen.`, `Er liggen ook ${y} blauwe ballen.`, `Hoeveel ballen liggen er samen?`],
        antwoord: r, eenheid: w("bal", "ballen"), uitVerhaal: [x, y], verkeerd: Math.abs(x - y),
      };
    },
  },
];

/** Een datum vooruit: alleen als de uitkomst binnen de maand blijft (tot en met 31). */
function datumVooruit(k: Kans, b: Bereik, naam: string): Verhaal | null {
  if (b.min > 31) return null;
  const g = plusGetallen(k, { ...b, tot: Math.min(b.tot, 31), brug: null });
  if (!g) return null;
  const [d, y, r] = g;
  const maand = kies(k, MAANDEN31);
  return {
    zinnen: [`Het is ${d} ${maand}.`, `Over ${y} dagen is ${naam} jarig.`, `Op welke datum is ${naam} jarig?`],
    antwoord: r, eenheid: vast(maand), uitVerhaal: [d, y], verkeerd: d - y, datum: true,
  };
}

/** Een datum terug: tellen op de kalender, in de tegenwoordige tijd. */
function datumTerug(k: Kans, b: Bereik, naam: string): Verhaal | null {
  if (b.min > 31) return null;
  const g = minGetallen(k, { ...b, tot: Math.min(b.tot, 31), brug: null });
  if (!g) return null;
  const [d, s, r] = g;
  const maand = kies(k, MAANDEN31);
  return {
    zinnen: [`Het is ${d} ${maand}.`, `${naam} telt ${s} dagen terug op de kalender.`, `Op welke datum komt ${naam} uit?`],
    antwoord: r, eenheid: vast(maand), uitVerhaal: [d, s], verkeerd: d + s, datum: true,
  };
}

export const OPTELLEN_METEN: Sjabloon[] = [
  {
    id: "meten-zonnebloem",
    thema: "thuis",
    maak: (k, b) => {
      /* Een zonnebloem groeit in een week hooguit een centimeter of vijftien. */
      const g = plusGetallen(k, b);
      if (!g || g[1] > 15) return null;
      const [x, y, r] = g;
      return {
        zinnen: [`Een zonnebloem is ${x} centimeter hoog.`, `In een week groeit hij ${y} centimeter.`, `Hoe hoog is de zonnebloem nu?`],
        antwoord: r, eenheid: CM, uitVerhaal: [x, y], verkeerd: x - y,
      };
    },
  },
  {
    id: "meten-toren",
    thema: "school",
    maak: (k, b, n) => {
      const g = plusGetallen(k, b);
      if (!g) return null;
      const [x, y, r] = g;
      const [a] = noem(n);
      return {
        zinnen: [`${a} bouwt een toren van ${x} centimeter.`, `Daarna maakt ${a} hem ${y} centimeter hoger.`, `Hoe hoog is de toren nu?`],
        antwoord: r, eenheid: CM, uitVerhaal: [x, y], verkeerd: x - y,
      };
    },
  },
  {
    id: "meten-vlieger",
    thema: "spel",
    maak: (k, b) => {
      const g = plusGetallen(k, b);
      if (!g) return null;
      const [x, y, r] = g;
      return {
        zinnen: [`Een vlieger vliegt ${x} meter hoog.`, `Dan gaat hij nog ${y} meter omhoog.`, `Hoe hoog vliegt de vlieger nu?`],
        antwoord: r, eenheid: METER, uitVerhaal: [x, y], verkeerd: x - y,
      };
    },
  },
  {
    id: "meten-rij",
    thema: "school",
    maak: (k, b, n) => {
      const g = plusGetallen(k, b);
      if (!g) return null;
      const [x, y, r] = g;
      const [a] = noem(n);
      return {
        zinnen: [`Een rij blokjes is ${x} centimeter lang.`, `${a} legt er ${y} centimeter bij.`, `Hoe lang is de rij nu?`],
        antwoord: r, eenheid: CM, uitVerhaal: [x, y], verkeerd: x - y,
      };
    },
  },
  { id: "meten-jarig", thema: "thuis", maak: (k, b, n) => datumVooruit(k, b, n[0]) },
];

export const OPTELLEN_DRIE: Sjabloon[] = [
  {
    id: "drie-lezen",
    thema: "thuis",
    maak: (k, b, n) => {
      /* Een kind van groep 4 leest hooguit een bladzijde of dertig per dag. */
      const g = drieGetallen(k, b);
      if (!g || Math.max(g[0], g[1], g[2]) > 30) return null;
      const [x, y, z, r] = g;
      const [a] = noem(n);
      return {
        zinnen: [`Op maandag leest ${a} ${x} bladzijden.`, `Op dinsdag leest ${a} er ${y}.`, `Op woensdag leest ${a} er ${z}.`, `Hoeveel bladzijden leest ${a} in drie dagen?`],
        antwoord: r, eenheid: w("bladzijde", "bladzijden"), uitVerhaal: [x, y, z], verkeerd: x + y,
      };
    },
  },
  {
    id: "drie-bakken",
    thema: "spel",
    maak: (k, b) => {
      const g = drieGetallen(k, b);
      if (!g) return null;
      const [x, y, z, r] = g;
      return {
        zinnen: [`In de eerste bak liggen ${x} ballen.`, `In de tweede bak liggen er ${y}.`, `In de derde bak liggen er ${z}.`, `Hoeveel ballen liggen er in de drie bakken?`],
        antwoord: r, eenheid: w("bal", "ballen"), uitVerhaal: [x, y, z], verkeerd: x + y,
      };
    },
  },
  {
    id: "drie-plukken",
    thema: "thuis",
    maak: (k, b, n) => {
      const g = drieGetallen(k, b);
      if (!g) return null;
      const [x, y, z, r] = g;
      const [a, c, d] = noem(n);
      return {
        zinnen: [`${a}, ${c} en ${d} plukken appels.`, `${a} plukt er ${x}, ${c} ${y} en ${d} ${z}.`, `Hoeveel appels plukken ze samen?`],
        antwoord: r, eenheid: w("appel", "appels"), uitVerhaal: [x, y, z], verkeerd: x + y,
      };
    },
  },
  {
    id: "drie-autos",
    thema: "winkel",
    maak: (k, b) => {
      const g = drieGetallen(k, b);
      if (!g) return null;
      const [x, y, z, r] = g;
      return {
        zinnen: [`Bij de supermarkt staan ${x} rode auto's.`, `Er staan ook ${y} blauwe en ${z} witte auto's.`, `Hoeveel auto's staan er bij de supermarkt?`],
        antwoord: r, eenheid: w("auto", "auto's"), uitVerhaal: [x, y, z], verkeerd: x + y,
      };
    },
  },
  {
    id: "drie-bus",
    thema: "school",
    maak: (k, b) => {
      const g = drieGetallen(k, b, 60);
      if (!g) return null;
      const [x, y, z, r] = g;
      return {
        zinnen: [`De schoolbus is eerst leeg.`, `Bij de eerste halte stappen ${x} kinderen in.`, `Bij de tweede halte stappen er ${y} in.`, `Bij de derde halte stappen er ${z} in.`, `Hoeveel kinderen zitten er nu in de bus?`],
        antwoord: r, eenheid: w("kind", "kinderen"), uitVerhaal: [x, y, z], verkeerd: x + y,
      };
    },
  },
];

// ---------------------------------------------------------------------------
// Aftrekken
// ---------------------------------------------------------------------------

export const AFTREKKEN_WEG: Sjabloon[] = [
  {
    id: "min-geven",
    thema: "thuis",
    maak: (k, b, n) => {
      const g = minGetallen(k, b);
      if (!g) return null;
      const [x, s, r] = g;
      const ding = kies(k, SNOEP);
      const [a, c] = noem(n);
      return {
        zinnen: [`${a} heeft ${aantal(x, ding)}.`, `${a} geeft er ${s} aan ${c}.`, `Hoeveel ${ding.mv} heeft ${a} nog?`],
        antwoord: r, eenheid: ding, uitVerhaal: [x, s], verkeerd: x + s,
      };
    },
  },
  {
    id: "min-koekjes",
    thema: "thuis",
    maak: (k, b) => {
      const g = minGetallen(k, b, 60);
      if (!g) return null;
      const [x, s, r] = g;
      return {
        zinnen: [`In de koektrommel zitten ${x} koekjes.`, `De kinderen eten er ${s} op.`, `Hoeveel koekjes zitten er nog in de trommel?`],
        antwoord: r, eenheid: w("koekje", "koekjes"), uitVerhaal: [x, s], verkeerd: x + s,
      };
    },
  },
  {
    id: "min-knikkers",
    thema: "spel",
    maak: (k, b, n) => {
      const g = minGetallen(k, b);
      if (!g) return null;
      const [x, s, r] = g;
      const [a] = noem(n);
      return {
        zinnen: [`${a} heeft ${x} knikkers.`, `Op het schoolplein verliest ${a} er ${s}.`, `Hoeveel knikkers heeft ${a} nog?`],
        antwoord: r, eenheid: w("knikker", "knikkers"), uitVerhaal: [x, s], verkeerd: x + s,
      };
    },
  },
  {
    id: "min-appelboom",
    thema: "thuis",
    maak: (k, b) => {
      const g = minGetallen(k, b);
      if (!g) return null;
      const [x, s, r] = g;
      return {
        zinnen: [`In de appelboom hangen ${x} appels.`, `Er vallen ${s} appels op de grond.`, `Hoeveel appels hangen er nog in de boom?`],
        antwoord: r, eenheid: w("appel", "appels"), uitVerhaal: [x, s], verkeerd: x + s,
      };
    },
  },
  {
    id: "min-boek",
    thema: "winkel",
    maak: (k, b, n) => {
      const g = minGetallen(k, b);
      if (!g) return null;
      const [x, s, r] = g;
      const [a] = noem(n);
      return {
        zinnen: [`${a} heeft ${x} euro.`, `${a} koopt een boek van ${s} euro.`, `Hoeveel euro houdt ${a} over?`],
        antwoord: r, eenheid: EURO, uitVerhaal: [x, s], verkeerd: x + s,
      };
    },
  },
  {
    id: "min-potloden",
    thema: "school",
    maak: (k, b) => {
      const g = minGetallen(k, b);
      if (!g) return null;
      const [x, s, r] = g;
      return {
        zinnen: [`In de kast liggen ${x} potloden.`, `De juf deelt er ${s} uit.`, `Hoeveel potloden liggen er nog in de kast?`],
        antwoord: r, eenheid: w("potlood", "potloden"), uitVerhaal: [x, s], verkeerd: x + s,
      };
    },
  },
];

export const AFTREKKEN_VERSCHIL: Sjabloon[] = [
  {
    id: "verschil-meer",
    thema: "spel",
    maak: (k, b, n) => {
      const g = verschilGetallen(k, b);
      if (!g) return null;
      const [x, y, r] = g;
      const ding = kies(k, VERZAMEL);
      const [a, c] = noem(n);
      return {
        zinnen: [`${a} heeft ${aantal(x, ding)}.`, `${c} heeft er ${y}.`, `Hoeveel ${ding.mv} heeft ${a} meer dan ${c}?`],
        antwoord: r, eenheid: ding, uitVerhaal: [x, y], verkeerd: x + y,
      };
    },
  },
  {
    id: "verschil-groepen",
    thema: "school",
    maak: (k, b) => {
      const g = verschilGetallen(k, b, 32);
      if (!g) return null;
      const [x, y, r] = g;
      if (y < 12) return null;
      return {
        zinnen: [`In groep 4 zitten ${x} kinderen.`, `In groep 3 zitten er ${y}.`, `Hoeveel kinderen zitten er meer in groep 4?`],
        antwoord: r, eenheid: w("kind", "kinderen"), uitVerhaal: [x, y], verkeerd: x + y,
      };
    },
  },
  {
    id: "verschil-touw",
    thema: "spel",
    maak: (k, b, n) => {
      const g = verschilGetallen(k, b);
      if (!g) return null;
      const [x, y, r] = g;
      const [a, c] = noem(n);
      return {
        zinnen: [`${a} springt ${x} keer touw.`, `${c} springt ${y} keer touw.`, `Hoeveel keer springt ${a} meer dan ${c}?`],
        antwoord: r, eenheid: KEER, uitVerhaal: [x, y], verkeerd: x + y,
      };
    },
  },
  {
    id: "verschil-duurder",
    thema: "winkel",
    maak: (k, b) => {
      const g = verschilGetallen(k, b);
      if (!g) return null;
      const [x, y, r] = g;
      /* Een prijs die bij het ding past: een fiets kost geen 9 euro. */
      const [duur, goedkoop] = x <= 20 ? ["bal", "knuffel"] : ["fiets", "step"];
      return {
        zinnen: [`Een ${duur} kost ${x} euro.`, `Een ${goedkoop} kost ${y} euro.`, `Hoeveel euro is de ${duur} duurder?`],
        antwoord: r, eenheid: EURO, uitVerhaal: [x, y], verkeerd: x + y,
      };
    },
  },
  {
    id: "verschil-lezen",
    thema: "thuis",
    maak: (k, b, n) => {
      const g = verschilGetallen(k, b);
      if (!g) return null;
      const [x, y, r] = g;
      const [a, c] = noem(n);
      return {
        zinnen: [`${a} leest ${x} bladzijden.`, `${c} leest er ${y}.`, `Hoeveel bladzijden leest ${c} minder dan ${a}?`],
        antwoord: r, eenheid: w("bladzijde", "bladzijden"), uitVerhaal: [x, y], verkeerd: x + y,
      };
    },
  },
];

export const AFTREKKEN_METEN: Sjabloon[] = [
  {
    id: "korter-kaars",
    thema: "thuis",
    maak: (k, b) => {
      /* Op één avond brandt een kaars hooguit een centimeter of tien op. */
      const g = minGetallen(k, b, 50);
      if (!g || g[1] > 10) return null;
      const [x, s, r] = g;
      return {
        zinnen: [`Een kaars is ${x} centimeter lang.`, `Na een avond is hij ${s} centimeter korter.`, `Hoe lang is de kaars nu?`],
        antwoord: r, eenheid: CM, uitVerhaal: [x, s], verkeerd: x + s,
      };
    },
  },
  {
    id: "korter-sneeuwpop",
    thema: "spel",
    maak: (k, b) => {
      const g = minGetallen(k, b);
      if (!g) return null;
      const [x, s, r] = g;
      return {
        zinnen: [`Een sneeuwpop is ${x} centimeter hoog.`, `In de zon smelt hij ${s} centimeter.`, `Hoe hoog is de sneeuwpop nu?`],
        antwoord: r, eenheid: CM, uitVerhaal: [x, s], verkeerd: x + s,
      };
    },
  },
  {
    id: "lager-vlieger",
    thema: "spel",
    maak: (k, b) => {
      const g = minGetallen(k, b);
      if (!g) return null;
      const [x, s, r] = g;
      return {
        zinnen: [`Een vlieger vliegt ${x} meter hoog.`, `Dan zakt hij ${s} meter.`, `Hoe hoog vliegt de vlieger nu?`],
        antwoord: r, eenheid: METER, uitVerhaal: [x, s], verkeerd: x + s,
      };
    },
  },
  {
    id: "korter-touw",
    thema: "thuis",
    maak: (k, b, n) => {
      const g = minGetallen(k, b);
      if (!g) return null;
      const [x, s, r] = g;
      const [a] = noem(n);
      return {
        zinnen: [`Een touw is ${x} meter lang.`, `${a} knipt er ${s} meter af.`, `Hoe lang is het touw nu?`],
        antwoord: r, eenheid: METER, uitVerhaal: [x, s], verkeerd: x + s,
      };
    },
  },
  { id: "eerder-kalender", thema: "school", maak: (k, b, n) => datumTerug(k, b, n[0]) },
];

export const AFTREKKEN_TWEEKEER: Sjabloon[] = [
  {
    id: "tweekeer-geven",
    thema: "thuis",
    maak: (k, b, n) => {
      const g = tweeKeerEraf(k, b);
      if (!g) return null;
      const [x, y, z, r] = g;
      const ding = kies(k, SNOEP);
      const [a, c, d] = noem(n);
      return {
        zinnen: [`${a} heeft ${aantal(x, ding)}.`, `${a} geeft er ${y} aan ${c}.`, `Daarna geeft ${a} er ${z} aan ${d}.`, `Hoeveel ${ding.mv} heeft ${a} nog?`],
        antwoord: r, eenheid: ding, uitVerhaal: [x, y, z], verkeerd: x - y + z,
      };
    },
  },
  {
    id: "tweekeer-bus",
    thema: "school",
    maak: (k, b) => {
      const g = tweeKeerEraf(k, b, 60);
      if (!g) return null;
      const [x, y, z, r] = g;
      return {
        zinnen: [`In de schoolbus zitten ${x} kinderen.`, `Bij de eerste halte stappen er ${y} uit.`, `Bij de tweede halte stappen er ${z} uit.`, `Hoeveel kinderen zitten er nog in de bus?`],
        antwoord: r, eenheid: w("kind", "kinderen"), uitVerhaal: [x, y, z], verkeerd: x - y + z,
      };
    },
  },
  {
    id: "tweekeer-koekjes",
    thema: "thuis",
    maak: (k, b, n) => {
      const g = tweeKeerEraf(k, b, 60);
      if (!g) return null;
      const [x, y, z, r] = g;
      const [a, c] = noem(n);
      return {
        zinnen: [`In de koektrommel zitten ${x} koekjes.`, `${a} eet er ${y} op.`, `Daarna eet ${c} er ${z} op.`, `Hoeveel koekjes zitten er nog in de trommel?`],
        antwoord: r, eenheid: w("koekje", "koekjes"), uitVerhaal: [x, y, z], verkeerd: x - y + z,
      };
    },
  },
  {
    id: "tweekeer-kopen",
    thema: "winkel",
    maak: (k, b, n) => {
      const g = tweeKeerEraf(k, b);
      if (!g) return null;
      const [x, y, z, r] = g;
      const [a] = noem(n);
      return {
        zinnen: [`${a} heeft ${x} euro.`, `${a} koopt een spel van ${y} euro.`, `Daarna koopt ${a} een boek van ${z} euro.`, `Hoeveel euro heeft ${a} nog?`],
        antwoord: r, eenheid: EURO, uitVerhaal: [x, y, z], verkeerd: x - y + z,
      };
    },
  },
  {
    id: "tweekeer-lezen",
    thema: "thuis",
    maak: (k, b, n) => {
      const g = tweeKeerEraf(k, b);
      if (!g) return null;
      const [x, y, z, r] = g;
      const [a] = noem(n);
      return {
        zinnen: [`Een boek heeft ${x} bladzijden.`, `Op maandag leest ${a} er ${y}.`, `Op dinsdag leest ${a} er ${z}.`, `Hoeveel bladzijden moet ${a} nog lezen?`],
        antwoord: r, eenheid: w("bladzijde", "bladzijden"), uitVerhaal: [x, y, z], verkeerd: x - y + z,
      };
    },
  },
];

// ---------------------------------------------------------------------------
// Optellen en aftrekken
// ---------------------------------------------------------------------------

/** Erbij of eraf: hetzelfde verhaal met een werkwoord dat de kant bepaalt. */
function erbijOfEraf(
  id: string,
  thema: Thema,
  grens: number,
  bouw: (erbij: boolean, x: number, y: number, a: string) => { zinnen: string[]; eenheid: Woord },
): Sjabloon {
  return {
    id,
    thema,
    maak: (k, b, n) => {
      const erbij = k() < 0.5;
      const g = erbij ? plusGetallen(k, b, grens) : minGetallen(k, b, grens);
      if (!g) return null;
      const [x, y, r] = g;
      const { zinnen, eenheid } = bouw(erbij, x, y, n[0]);
      return { zinnen, antwoord: r, eenheid, uitVerhaal: [x, y], verkeerd: erbij ? x - y : x + y };
    },
  };
}

export const PLUSMIN_ERBIJERAF: Sjabloon[] = [
  erbijOfEraf("pm-knikkers", "spel", 100, (erbij, x, y, a) => ({
    zinnen: [`${a} heeft ${x} knikkers.`, `Bij een spelletje ${erbij ? "wint" : "verliest"} ${a} er ${y}.`, `Hoeveel knikkers heeft ${a} nu?`],
    eenheid: w("knikker", "knikkers"),
  })),
  erbijOfEraf("pm-bus", "school", 60, (erbij, x, y) => ({
    zinnen: [`In de schoolbus zitten ${x} kinderen.`, `Bij de halte stappen er ${y} ${erbij ? "in" : "uit"}.`, `Hoeveel kinderen zitten er nu in de bus?`],
    eenheid: w("kind", "kinderen"),
  })),
  erbijOfEraf("pm-eieren", "thuis", 60, (erbij, x, y) => ({
    zinnen: [`In de mand liggen ${x} eieren.`, erbij ? `Mama legt er ${y} bij.` : `Mama pakt er ${y} uit.`, `Hoeveel eieren liggen er nu in de mand?`],
    eenheid: w("ei", "eieren"),
  })),
  erbijOfEraf("pm-eenden", "thuis", 100, (erbij, x, y) => ({
    zinnen: [`In de vijver zwemmen ${x} eenden.`, erbij ? `Er komen ${y} eenden bij.` : `Er vliegen ${y} eenden weg.`, `Hoeveel eenden zwemmen er nu in de vijver?`],
    eenheid: w("eend", "eenden"),
  })),
  erbijOfEraf("pm-geld", "winkel", 100, (erbij, x, y, a) => ({
    zinnen: [`${a} heeft ${x} euro.`, erbij ? `Voor de verjaardag krijgt ${a} ${y} euro.` : `${a} betaalt ${y} euro voor een boek.`, `Hoeveel euro heeft ${a} nu?`],
    eenheid: EURO,
  })),
];

export const PLUSMIN_AANVULLEN: Sjabloon[] = [
  {
    id: "aanvul-stickers",
    thema: "thuis",
    maak: (k, b, n) => {
      const g = aanvulGetallen(k, b);
      if (!g) return null;
      const [doel, al, r] = g;
      const [a] = noem(n);
      return {
        zinnen: [`${a} wil ${doel} stickers sparen.`, `${a} heeft er al ${al}.`, `Hoeveel stickers heeft ${a} nog nodig?`],
        antwoord: r, eenheid: w("sticker", "stickers"), uitVerhaal: [doel, al], verkeerd: doel + al,
      };
    },
  },
  {
    id: "aanvul-puzzel",
    thema: "thuis",
    maak: (k, b, n) => {
      /* Een puzzel heeft minstens twaalf stukjes. */
      const g = aanvulGetallen(k, b);
      if (!g || g[0] < 12) return null;
      const [doel, al, r] = g;
      const [a] = noem(n);
      return {
        zinnen: [`Een puzzel heeft ${doel} stukjes.`, `${a} legt er eerst ${al}.`, `Hoeveel stukjes moet ${a} nog leggen?`],
        antwoord: r, eenheid: w("stukje", "stukjes"), uitVerhaal: [doel, al], verkeerd: doel + al,
      };
    },
  },
  {
    id: "aanvul-stoelen",
    thema: "school",
    maak: (k, b) => {
      const g = aanvulGetallen(k, b);
      if (!g) return null;
      const [doel, al, r] = g;
      return {
        zinnen: [`In de zaal moeten ${doel} stoelen staan.`, `Er staan er al ${al}.`, `Hoeveel stoelen moeten er nog bij?`],
        antwoord: r, eenheid: w("stoel", "stoelen"), uitVerhaal: [doel, al], verkeerd: doel + al,
      };
    },
  },
  {
    id: "aanvul-spel",
    thema: "winkel",
    maak: (k, b, n) => {
      const g = aanvulGetallen(k, b);
      if (!g) return null;
      const [doel, al, r] = g;
      const [a] = noem(n);
      return {
        zinnen: [`${a} wil een spel van ${doel} euro kopen.`, `${a} heeft ${al} euro.`, `Hoeveel euro heeft ${a} nog nodig?`],
        antwoord: r, eenheid: EURO, uitVerhaal: [doel, al], verkeerd: doel + al,
      };
    },
  },
  {
    id: "aanvul-punten",
    thema: "spel",
    maak: (k, b) => {
      const g = aanvulGetallen(k, b);
      if (!g) return null;
      const [doel, al, r] = g;
      return {
        zinnen: [`Het team wil ${doel} punten halen.`, `Het team heeft al ${al} punten.`, `Hoeveel punten moet het team nog halen?`],
        antwoord: r, eenheid: w("punt", "punten"), uitVerhaal: [doel, al], verkeerd: doel + al,
      };
    },
  },
];

/**
 * Eerst erbij en dan eraf (of andersom). Elk tussengetal blijft binnen het
 * bereik, en het grootste getal hoort bij het kopje.
 */
function tweeStappen(k: Kans, b: Bereik, eerstErbij: boolean, grens = 100): [number, number, number, number] | null {
  const hoog = Math.min(b.tot, grens);
  for (let p = 0; p < 80; p++) {
    if (eerstErbij) {
      const top = tussen(k, Math.max(b.min, 8), hoog);
      if (Number.isNaN(top)) return null;
      const x = tussen(k, 2, top - 2);
      const y = top - x;
      const z = tussen(k, 2, top - 2);
      if (y < 2 || Number.isNaN(z)) continue;
      return [x, y, z, top - z];
    }
    const x = tussen(k, Math.max(b.min, 8), hoog);
    if (Number.isNaN(x)) return null;
    const y = tussen(k, 2, x - 2);
    const z = tussen(k, 2, hoog - (x - y));
    if (Number.isNaN(y) || Number.isNaN(z)) continue;
    return [x, y, z, x - y + z];
  }
  return null;
}

export const PLUSMIN_TWEESTAPPEN: Sjabloon[] = [
  {
    id: "stappen-bus",
    thema: "school",
    maak: (k, b) => {
      const g = tweeStappen(k, b, true, 60);
      if (!g) return null;
      const [x, y, z, r] = g;
      return {
        zinnen: [`In de schoolbus zitten ${x} kinderen.`, `Bij de halte stappen er ${y} in en ${z} uit.`, `Hoeveel kinderen zitten er nu in de bus?`],
        antwoord: r, eenheid: w("kind", "kinderen"), uitVerhaal: [x, y, z], verkeerd: x + y + z,
      };
    },
  },
  {
    id: "stappen-ruilen",
    thema: "thuis",
    maak: (k, b, n) => {
      const g = tweeStappen(k, b, true);
      if (!g) return null;
      const [x, y, z, r] = g;
      const ding = kies(k, VERZAMEL);
      const [a, c, d] = noem(n);
      return {
        zinnen: [`${a} heeft ${aantal(x, ding)}.`, `${a} krijgt er ${y} van ${c}.`, `Daarna geeft ${a} er ${z} aan ${d}.`, `Hoeveel ${ding.mv} heeft ${a} nu?`],
        antwoord: r, eenheid: ding, uitVerhaal: [x, y, z], verkeerd: x + y + z,
      };
    },
  },
  {
    id: "stappen-geld",
    thema: "winkel",
    maak: (k, b, n) => {
      const g = tweeStappen(k, b, false);
      if (!g) return null;
      const [x, y, z, r] = g;
      const [a] = noem(n);
      return {
        zinnen: [`${a} heeft ${x} euro.`, `${a} betaalt ${y} euro voor een boek.`, `Daarna krijgt ${a} ${z} euro van opa.`, `Hoeveel euro heeft ${a} nu?`],
        antwoord: r, eenheid: EURO, uitVerhaal: [x, y, z], verkeerd: x - y - z >= 0 ? x - y - z : x + y + z,
      };
    },
  },
  {
    id: "stappen-plein",
    thema: "spel",
    maak: (k, b) => {
      const g = tweeStappen(k, b, false);
      if (!g) return null;
      const [x, y, z, r] = g;
      return {
        zinnen: [`Op het plein spelen ${x} kinderen.`, `Er gaan ${y} kinderen naar huis.`, `Daarna komen er ${z} kinderen bij.`, `Hoeveel kinderen spelen er nu op het plein?`],
        antwoord: r, eenheid: w("kind", "kinderen"), uitVerhaal: [x, y, z], verkeerd: x - y - z >= 0 ? x - y - z : x + y + z,
      };
    },
  },
  {
    id: "stappen-eenden",
    thema: "thuis",
    maak: (k, b) => {
      const g = tweeStappen(k, b, false);
      if (!g) return null;
      const [x, y, z, r] = g;
      return {
        zinnen: [`In de vijver zwemmen ${x} eenden.`, `Er vliegen ${y} eenden weg.`, `Daarna landen er ${z} eenden in het water.`, `Hoeveel eenden zwemmen er nu in de vijver?`],
        antwoord: r, eenheid: w("eend", "eenden"), uitVerhaal: [x, y, z], verkeerd: x - y - z >= 0 ? x - y - z : x + y + z,
      };
    },
  },
];

export const PLUSMIN_METEN: Sjabloon[] = [...OPTELLEN_METEN, ...AFTREKKEN_METEN];

// ---------------------------------------------------------------------------
// Tafels (groep 4: de tafels van 1 tot en met 10)
// ---------------------------------------------------------------------------

const LAAG = [2, 3, 4, 5, 10];
const ALLE = [2, 3, 4, 5, 6, 7, 8, 9, 10];

function keer(
  id: string,
  thema: Thema,
  tafels: readonly number[],
  max: number,
  bouw: (g: number, kk: number, a: string) => { zinnen: string[]; eenheid: Woord },
  groepen?: readonly number[],
): Sjabloon {
  return {
    id,
    thema,
    maak: (k, _b, n) => {
      const g = keerGetallen(k, tafels, max, groepen);
      if (!g) return null;
      const [groep, kk, r] = g;
      const { zinnen, eenheid } = bouw(groep, kk, n[0]);
      return { zinnen, antwoord: r, eenheid, uitVerhaal: [groep, kk], verkeerd: groep + kk };
    },
  };
}

export const TAFELS_GROEPJES: Sjabloon[] = [
  keer("keer-zakjes", "thuis", ALLE, 100, (g, kk, a) => ({
    zinnen: [`In een zakje zitten ${kk} snoepjes.`, `${a} heeft ${g} zakjes.`, `Hoeveel snoepjes heeft ${a} in totaal?`],
    eenheid: w("snoepje", "snoepjes"),
  })),
  keer("keer-eierdozen", "winkel", [4, 6, 10], 100, (g, kk) => ({
    zinnen: [`In een doos zitten ${kk} eieren.`, `Mama koopt ${g} dozen.`, `Hoeveel eieren koopt mama?`],
    eenheid: w("ei", "eieren"),
  })),
  keer("keer-potloden", "school", ALLE, 100, (g, kk) => ({
    zinnen: [`In een bakje liggen ${kk} kleurpotloden.`, `Op de tafel staan ${g} bakjes.`, `Hoeveel kleurpotloden zijn dat samen?`],
    eenheid: w("kleurpotlood", "kleurpotloden"),
  })),
  keer("keer-aardbeien", "winkel", ALLE, 100, (g, kk, a) => ({
    zinnen: [`In een bakje zitten ${kk} aardbeien.`, `${a} koopt ${g} bakjes.`, `Hoeveel aardbeien koopt ${a}?`],
    eenheid: w("aardbei", "aardbeien"),
  })),
];

export const TAFELS_RIJEN: Sjabloon[] = [
  keer("keer-zaal", "school", ALLE, 100, (g, kk) => ({
    zinnen: [`In de zaal staan ${g} rijen stoelen.`, `In elke rij staan ${kk} stoelen.`, `Hoeveel stoelen staan er in de zaal?`],
    eenheid: w("stoel", "stoelen"),
  })),
  keer("keer-bloemen", "thuis", ALLE, 100, (g, kk) => ({
    zinnen: [`In de tuin zijn ${g} rijen bloemen.`, `In elke rij staan ${kk} bloemen.`, `Hoeveel bloemen staan er in de tuin?`],
    eenheid: w("bloem", "bloemen"),
  })),
  keer("keer-tafels", "school", LAAG, 40, (g, kk) => ({
    zinnen: [`In de klas staan ${g} rijen tafels.`, `In elke rij staan ${kk} tafels.`, `Hoeveel tafels staan er in de klas?`],
    eenheid: w("tafel", "tafels"),
  })),
  keer("keer-gym", "spel", ALLE, 32, (g, kk) => ({
    zinnen: [`Bij de gymles staan de kinderen in ${g} rijen.`, `In elke rij staan ${kk} kinderen.`, `Hoeveel kinderen doen er mee?`],
    eenheid: w("kind", "kinderen"),
  })),
];

export const TAFELS_ELKEDAG: Sjabloon[] = [
  keer("dag-lezen", "thuis", ALLE, 100, (g, kk, a) => ({
    zinnen: [`${a} leest elke dag ${kk} bladzijden.`, `Hoeveel bladzijden leest ${a} in ${g} dagen?`],
    eenheid: w("bladzijde", "bladzijden"),
  })),
  keer("dag-fietsen", "spel", ALLE, 100, (g, kk, a) => ({
    zinnen: [`${a} fietst elke dag ${kk} kilometer.`, `Hoeveel kilometer fietst ${a} in ${g} dagen?`],
    eenheid: KM,
  })),
  keer("dag-piano", "thuis", [5, 10], 100, (g, kk, a) => ({
    zinnen: [`${a} oefent elke dag ${kk} minuten op de piano.`, `Hoeveel minuten oefent ${a} in ${g} dagen?`],
    eenheid: MINUTEN,
  })),
  keer("dag-woorden", "school", ALLE, 100, (g, kk) => ({
    zinnen: [`De klas leert elke dag ${kk} nieuwe woorden.`, `Hoeveel nieuwe woorden leert de klas in ${g} dagen?`],
    eenheid: w("woord", "woorden"),
  })),
];

export const TAFELS_GELD: Sjabloon[] = [
  keer("geld-ijsjes", "winkel", [2, 3, 4], 100, (g, kk, a) => ({
    zinnen: [`Een ijsje kost ${kk} euro.`, `${a} koopt ${g} ijsjes.`, `Hoeveel euro moet ${a} betalen?`],
    eenheid: EURO,
  })),
  keer("geld-schriften", "school", [2, 3, 4, 5], 100, (g, kk) => ({
    zinnen: [`Een schrift kost ${kk} euro.`, `De juf koopt ${g} schriften.`, `Hoeveel euro betaalt de juf?`],
    eenheid: EURO,
  })),
  keer("geld-bios", "winkel", [5, 6, 7, 8, 9, 10], 100, (g, kk, a) => ({
    zinnen: [`Een kaartje voor de film kost ${kk} euro.`, `${a} koopt ${g} kaartjes.`, `Hoeveel euro betaalt ${a}?`],
    eenheid: EURO,
  })),
  keer("geld-ballen", "spel", [5, 6, 7, 8, 9, 10], 100, (g, kk) => ({
    zinnen: [`Een bal kost ${kk} euro.`, `De gymjuf koopt ${g} ballen.`, `Hoeveel euro betaalt de gymjuf?`],
    eenheid: EURO,
  })),
];

// ---------------------------------------------------------------------------
// Delen (altijd zonder rest)
// ---------------------------------------------------------------------------

/** Een deelsom zonder rest: het totaal, waardoor er gedeeld wordt, en de uitkomst. */
function deel(
  id: string,
  thema: Thema,
  delers: readonly number[],
  max: number,
  vraagtNaar: "elk" | "groepjes",
  bouw: (totaal: number, door: number, a: string, c: string) => { zinnen: string[]; eenheid: Woord },
  uitkomsten: readonly number[] = ALLE,
): Sjabloon {
  return {
    id,
    thema,
    maak: (k, _b, n) => {
      for (let p = 0; p < 60; p++) {
        const door = kies(k, delers);
        const uit = kies(k, uitkomsten);
        const totaal = door * uit;
        if (totaal > max) continue;
        const { zinnen, eenheid } = bouw(totaal, door, n[0], n[1]);
        const verkeerd = totaal * door <= 100 ? totaal * door : totaal - door;
        return { zinnen, antwoord: uit, eenheid, uitVerhaal: [totaal, door], verkeerd };
      }
      return null;
    },
  };
}

export const DELEN_VERDELEN: Sjabloon[] = [
  deel("deel-snoep", "thuis", ALLE, 100, "elk", (t, d, a) => ({
    zinnen: [`${a} heeft ${t} snoepjes.`, `${a} verdeelt ze eerlijk over ${d} kinderen.`, `Hoeveel snoepjes krijgt elk kind?`],
    eenheid: w("snoepje", "snoepjes"),
  })),
  deel("deel-koekjes", "thuis", ALLE, 60, "elk", (t, d) => ({
    zinnen: [`Mama bakt ${t} koekjes.`, `Ze verdeelt de koekjes eerlijk over ${d} bordjes.`, `Hoeveel koekjes liggen er op elk bordje?`],
    eenheid: w("koekje", "koekjes"),
  })),
  deel("deel-knikkers", "spel", [2], 100, "elk", (t, _d, a, c) => ({
    zinnen: [`${a} en ${c} hebben samen ${t} knikkers.`, `Ze verdelen de knikkers eerlijk.`, `Hoeveel knikkers krijgt elk kind?`],
    eenheid: w("knikker", "knikkers"),
  })),
  deel("deel-stickers", "school", ALLE, 100, "elk", (t, d) => ({
    zinnen: [`De juf heeft ${t} stickers.`, `Ze verdeelt de stickers eerlijk over ${d} kinderen.`, `Hoeveel stickers krijgt elk kind?`],
    eenheid: w("sticker", "stickers"),
  })),
];

export const DELEN_GROEPJES: Sjabloon[] = [
  deel("groep-gym", "school", [2, 3, 4, 5, 6, 8], 32, "groepjes", (t, d) => ({
    zinnen: [`In de gymzaal zijn ${t} kinderen.`, `De juf maakt groepjes van ${d}.`, `Hoeveel groepjes zijn er?`],
    eenheid: w("groepje", "groepjes"),
  })),
  /* Een ketting heeft minstens 5 kralen; van 2 kralen maak je geen ketting. */
  deel("groep-kralen", "thuis", [5, 6, 7, 8, 9, 10], 100, "groepjes", (t, d, a) => ({
    zinnen: [`${a} heeft ${t} kralen.`, `${a} maakt kettingen van ${d} kralen.`, `Hoeveel kettingen maakt ${a}?`],
    eenheid: w("ketting", "kettingen"),
  })),
  deel("groep-eieren", "thuis", [4, 6, 10], 100, "groepjes", (t, d) => ({
    zinnen: [`Er liggen ${t} eieren.`, `In elke doos passen ${d} eieren.`, `Hoeveel dozen zijn er nodig?`],
    eenheid: w("doos", "dozen"),
  })),
  deel("groep-broodjes", "winkel", ALLE, 100, "groepjes", (t, d) => ({
    zinnen: [`De bakker heeft ${t} broodjes.`, `In elke zak doet hij ${d} broodjes.`, `Hoeveel zakken vult de bakker?`],
    eenheid: w("zak", "zakken"),
  })),
];

export const DELEN_GELD: Sjabloon[] = [
  deel("deelgeld-kinderen", "thuis", ALLE, 100, "elk", (t, d) => ({
    zinnen: [`Samen krijgen ${d} kinderen ${t} euro.`, `Ze verdelen het geld eerlijk.`, `Hoeveel euro krijgt elk kind?`],
    eenheid: EURO,
  })),
  deel("deelgeld-opa", "thuis", [2, 3, 4, 5], 100, "elk", (t, d) => ({
    zinnen: [`Opa geeft ${t} euro aan ${d} kleinkinderen.`, `Elk kleinkind krijgt evenveel.`, `Hoeveel euro krijgt elk kleinkind?`],
    eenheid: EURO,
  })),
  deel("deelgeld-wassen", "spel", [2], 100, "elk", (t, _d, a, c) => ({
    zinnen: [`${a} en ${c} wassen samen auto's.`, `Ze verdienen ${t} euro.`, `Hoeveel euro krijgt elk kind?`],
    eenheid: EURO,
  })),
  deel("deelgeld-schriften", "winkel", ALLE, 100, "elk", (t, d) => ({
    zinnen: [`Samen kosten ${d} schriften ${t} euro.`, `Hoeveel euro kost één schrift?`],
    eenheid: EURO,
  }), [2, 3, 4, 5]),
];

export const DELEN_TEAMS: Sjabloon[] = [
  deel("team-voetbal", "spel", [4, 5, 6, 7, 8], 48, "groepjes", (t, d) => ({
    zinnen: [`Er doen ${t} kinderen mee met voetbal.`, `In elk team zitten ${d} kinderen.`, `Hoeveel teams zijn er?`],
    eenheid: w("team", "teams"),
  })),
  deel("team-stoelen", "school", ALLE, 40, "groepjes", (t, d) => ({
    zinnen: [`In de klas staan ${t} stoelen.`, `In elke rij staan ${d} stoelen.`, `Hoeveel rijen zijn er?`],
    eenheid: w("rij", "rijen"),
  })),
  deel("team-bloemen", "thuis", ALLE, 100, "groepjes", (t, d) => ({
    zinnen: [`In de tuin staan ${t} bloemen.`, `In elke rij staan er ${d}.`, `Hoeveel rijen bloemen zijn er?`],
    eenheid: w("rij", "rijen"),
  })),
  deel("team-gym", "spel", [2, 3, 4, 5, 6, 8], 32, "elk", (t, d) => ({
    zinnen: [`Bij de gymles zijn ${t} kinderen.`, `Ze staan in ${d} even lange rijen.`, `Hoeveel kinderen staan er in elke rij?`],
    eenheid: w("kind", "kinderen"),
  })),
];

/** Andersom: wat iedereen krijgt is bekend, hoeveel was het samen? */
export const KEER_VERDELEN: Sjabloon[] = [
  keer("terug-snoep", "thuis", ALLE, 100, (g, kk, a) => ({
    zinnen: [`${a} verdeelt snoepjes over ${g} kinderen.`, `Elk kind krijgt ${kk} snoepjes.`, `Hoeveel snoepjes verdeelt ${a}?`],
    eenheid: w("snoepje", "snoepjes"),
  })),
  keer("terug-stickers", "school", ALLE, 100, (g, kk) => ({
    zinnen: [`De juf deelt stickers uit aan ${g} kinderen.`, `Elk kind krijgt er ${kk}.`, `Hoeveel stickers deelt de juf uit?`],
    eenheid: w("sticker", "stickers"),
  })),
];

// ---------------------------------------------------------------------------
// Antwoordknoppen en controle
// ---------------------------------------------------------------------------

/**
 * De vier knoppen, van klein naar groot: het goede antwoord, een getal uit het
 * verhaal, 1 ernaast, boven de 20 ook 10 ernaast, en waar dan nog plek is de
 * uitkomst van de verkeerde bewerking. Nooit twee keer hetzelfde, nooit 0 of minder,
 * en bij een datum nooit na de 31e.
 */
export function maakKeuzes(v: Verhaal, kans: Kans): number[] | null {
  const r = v.antwoord;
  const geldig = (x: number | null): x is number =>
    x !== null && Number.isInteger(x) && x > 0 && x !== r && (!v.datum || x <= 31);
  const keuzes: number[] = [r];
  const neem = (x: number | null) => {
    if (keuzes.length < 4 && geldig(x) && !keuzes.includes(x)) keuzes.push(x);
  };
  /* Volgorde zoals WERKPLAN.md: een getal uit het verhaal, 1 ernaast, boven de 20 ook 10 ernaast, en waar mogelijk de verkeerde bewerking. */
  const uit = [...v.uitVerhaal].sort((a, b) => b - a);
  for (const x of uit) {
    if (keuzes.length >= 2) break;
    neem(x);
  }
  const eenErnaast = kans() < 0.5 ? [r + 1, r - 1] : [r - 1, r + 1];
  if (!keuzes.includes(eenErnaast[0]) && geldig(eenErnaast[0])) neem(eenErnaast[0]);
  else neem(eenErnaast[1]);
  if (r > 20) {
    const tien = kans() < 0.5 ? [r + 10, r - 10] : [r - 10, r + 10];
    if (geldig(tien[0]) && !keuzes.includes(tien[0])) neem(tien[0]);
    else neem(tien[1]);
  }
  neem(v.verkeerd);
  for (const x of [...eenErnaast, r + 10, r - 10, r + 2, r - 2, ...uit]) neem(x);
  if (keuzes.length < 4) return null;
  return keuzes.sort((a, b) => a - b);
}

/** Een getal met de eenheid erachter: "12 stickers", "1 sticker", "21 mei". */
export function metEenheid(n: number, eenheid: Woord): string {
  return aantal(n, eenheid);
}

/** De zinnen van een verhaaltje, elk afzonderlijk. */
export function zinnenVan(tekst: string): string[] {
  return tekst.split(/(?<=[.?!])\s+/).filter(Boolean);
}

/**
 * De taalregels, bij elk verhaaltje nagekeken. Geeft de eerste fout terug, of
 * null als het verhaaltje klopt.
 */
export function controleerVerhaal(v: Verhaal, bereik: Bereik): string | null {
  if (v.zinnen.length < 2) return "te weinig zinnen";
  for (const z of v.zinnen) {
    const woorden = z.split(/\s+/).filter(Boolean).length;
    if (woorden > 12) return `zin te lang (${woorden} woorden): ${z}`;
    if (!/^[A-ZÀ-Ý]/.test(z)) return `zin zonder hoofdletter: ${z}`;
    if (!/[.?]$/.test(z)) return `zin zonder punt of vraagteken: ${z}`;
    if (/\s{2,}|\bundefined\b|\bNaN\b/.test(z)) return `kapotte zin: ${z}`;
  }
  const vraag = v.zinnen[v.zinnen.length - 1];
  if (!/^(Hoeveel|Hoe|Op welke) /.test(vraag) || !vraag.endsWith("?")) return `vraag niet goed: ${vraag}`;
  if (v.zinnen.slice(0, -1).some((z) => z.endsWith("?"))) return "vraag staat niet als laatste";
  if (!Number.isInteger(v.antwoord) || v.antwoord < 1) return `antwoord niet geldig: ${v.antwoord}`;
  if (v.antwoord > bereik.tot) return `antwoord boven ${bereik.tot}: ${v.antwoord}`;
  if (v.datum && v.antwoord > 31) return "datum na de 31e";
  const getallen = v.zinnen.join(" ").match(/\d+/g)?.map(Number) ?? [];
  if (getallen.some((g) => g > bereik.tot)) return "getal boven het bereik";
  /* Nooit "1" met een meervoud of "er 1": het kleinste getal in een verhaal is 2. */
  if (getallen.some((g) => g < 2 && g !== 0)) return "een 1 in het verhaal";
  return null;
}
