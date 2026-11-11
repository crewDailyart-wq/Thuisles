/**
 * ALLE ZINNEN VAN BLIEPO in de gouden les Patronen (squla-vormen-patronen-1-gouden, 11 november 2026), op één plek, met de
 * FOUTTABEL. De les zelf (squla-vormen-gouden.tsx) bevat geen eigen zinnen.
 *
 *   - De rijtjes (lof, momenten, naam, goed na een fout, einde, eerste zin als de denkfout niet duidelijk is, overgang)
 *     zijn dezelfde als in de andere gouden lessen (BLIEPO-KARAKTER.md). Hier alleen de reactie bij Patronen (in de geest
 *     van BLIEPO-KARAKTER.md §4 Vormen, zin 46 en 50), met zinnen zonder "Ja" voor na een lofzin met "Ja".
 *   - De inhoud (15 vragen, de kralen, de dingen, de vormen, de keuzes en de puzzel) is die van squla-vormen-patronen-1
 *     "Patronen" (squla-vormen.tsx, BOUWREGELS 15.22): 7 keer een kraal kiezen (3 keer "na de …", 2 keer "nu", 2 keer de
 *     lege plek), 3 keer de ketting langer maken (3 kralen slepen), 3 keer "Wat hoort bij de pijl?" (dingen), 1 keer
 *     "Welke vorm komt nu?" en 1 puzzel. De vraagzinnen zijn die van de oude les.
 *   - GEEN SYNTHESIS-LES: Synthesis heeft geen les over vormen of patronen (KOPPELING.md §13: alles op "Coming soon").
 *     Het skelet is exact dat van de andere gouden lessen (laag 1: LESRECEPT.md en BLIEPO-KARAKTER.md). Alles wat per
 *     onderwerp anders is (de denkfouten, de eerste zinnen, de hints, de uitleg en het samen voordoen) is "EIGEN
 *     INVULLING, NIET VAN SYNTHESIS" (BOUWREGELS 15.22, 15.25; SYNTHESIS-ANALYSE/DRAAIBOEKEN-NIEUW/vormen.md).
 *
 * Leesbare versie: FOUTTABEL-squla-vormen-patronen-1-gouden.md (maak hem opnieuw met
 * `npx tsx scripts/fouttabel-vormen-gouden.ts`; dat script doet ook de verklap- en waarheidscontrole).
 *
 * Getalkleur (BOUWREGELS 2.1, 2.2, 14.22, 14.27): er staan bijna geen getallen in deze les. Een getal dat naar kralen van
 * 1 kleur verwijst ("2 oranje kralen"), heeft die kleur; een getal dat naar niets in beeld verwijst ("2 keer") is wit.
 */

import type { Kleur, PuzzelPlaatje, VormNaam } from "../vlakken/squla-vormen-tekenen";
import { KLEURWOORD } from "../vlakken/squla-vormen-tekenen";
import type { Rijtje } from "./squla-klok-gouden-zinnen";

export {
  BEVESTIG,
  EINDE,
  EINDE_VEEL_FOUTEN,
  LOF,
  LOF_KIJK_INDEX,
  MOMENT,
  NAAM_GROET,
  NAAM_LOF,
  ONDUIDELIJK,
  ONDUIDELIJK_NOG_1_KEER,
  OVERGANG,
  metNaam,
  type Rijtje,
} from "./squla-klok-gouden-zinnen";

const rij = (zinnen: string[], robot: number[] = []): Rijtje => ({ zinnen, robot });
const Hoofd = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
/** Een getal in de zin, in een kleur (of wit). */
export const g = (n: number, k: string) => `{${n}:${k}}`;

/* ---------- wat er in een rij ligt: kralen, dingen of vormen ---------- */

export type Wat = "kraal" | "ding" | "vorm";

/** Dingen: [lidwoord, enkelvoud, meervoud] (zoals de oude les; het speelblok heet "blok"). */
export const DING: Record<string, [string, string, string]> = {
  appel: ["de", "appel", "appels"],
  banaan: ["de", "banaan", "bananen"],
  peer: ["de", "peer", "peren"],
  mandarijn: ["de", "mandarijn", "mandarijnen"],
  bal: ["de", "bal", "ballen"],
  speelblok: ["het", "blok", "blokken"],
  potlood: ["het", "potlood", "potloden"],
  boek: ["het", "boek", "boeken"],
};
/** Vormen: [lidwoord, naam, meervoud]. */
export const VORM: Partial<Record<VormNaam, [string, string, string]>> = {
  cirkel: ["de", "cirkel", "cirkels"],
  driehoek: ["de", "driehoek", "driehoeken"],
  vierkant: ["het", "vierkant", "vierkanten"],
};

const kw = (k: Kleur) => KLEURWOORD[k][0];
const kwb = (k: Kleur) => KLEURWOORD[k][1];

/** Hoe Bliepo een ding uit de rij noemt. `kleur` = de kleur van een vorm in deze vraag. */
export type Namen = { een: (x: string) => string; de: (x: string) => string; kort: (x: string) => string; meer: (x: string) => string; noem: (x: string) => string; noemEen: (x: string) => string };
export function namen(wat: Wat, kleur: Record<string, Kleur> = {}): Namen {
  /* `noem`: zoals het in "Na … komt" klinkt: bij kralen de kleur ("Na rood"), anders met lidwoord ("Na de banaan"). */
  if (wat === "kraal") return { een: (x) => `een ${kwb(x as Kleur)} kraal`, de: (x) => `de ${kwb(x as Kleur)} kraal`, kort: (x) => kw(x as Kleur), meer: (x) => `${kwb(x as Kleur)} kralen`, noem: (x) => kw(x as Kleur), noemEen: (x) => kw(x as Kleur) };
  if (wat === "ding") return { een: (x) => `een ${DING[x][1]}`, de: (x) => `${DING[x][0]} ${DING[x][1]}`, kort: (x) => DING[x][1], meer: (x) => DING[x][2], noem: (x) => `${DING[x][0]} ${DING[x][1]}`, noemEen: (x) => `een ${DING[x][1]}` };
  /* "een groen vierkant", "het groene vierkant", "de oranje driehoek" (bij het-woorden met "een" geen -e). */
  const v = (x: string) => VORM[x as VormNaam]!;
  const bijv = (x: string, metE: boolean) => (metE || v(x)[0] === "de" ? kwb(kleur[x]) : kw(kleur[x]));
  return { een: (x) => `een ${bijv(x, false)} ${v(x)[1]}`, de: (x) => `${v(x)[0]} ${bijv(x, true)} ${v(x)[1]}`, kort: (x) => v(x)[1], meer: (x) => `${kwb(kleur[x])} ${v(x)[2]}`, noem: (x) => `${v(x)[0]} ${v(x)[1]}`, noemEen: (x) => `een ${v(x)[1]}` };
}
/** Hoe de rij heet: een ketting (kralen) of een rij (dingen, vormen). */
export const rijWoord = (wat: Wat) => (wat === "kraal" ? "ketting" : "rij");
/** Hoe het soort heet in een zin ("dezelfde kleur", "hetzelfde ding", "dezelfde vorm"). */
const zelfde = (wat: Wat) => (wat === "kraal" ? "dezelfde kleur" : wat === "ding" ? "hetzelfde ding" : "dezelfde vorm");

/* ---------- de 15 vragen van squla-vormen-patronen-1 (zelfde volgorde, zelfde kralen, dingen en keuzes) ---------- */

export const herhaal = <T,>(eenheid: T[], n: number) => Array.from({ length: n }, (_, i) => eenheid[i % eenheid.length]);

/**
 * Een keuzevraag over een rij: de rij ligt in beeld met 1 lege plek (aan het eind, of een gat); 3 keuzes eronder.
 *   vorm "na"  "Welke kraal komt na de … kraal?"   (lege plek aan het eind)
 *   vorm "nu"  "Welke kraal komt nu?" / "Welke vorm komt nu?"
 *   vorm "gat" "Welke kraal hoort op de lege plek?" / "Wat hoort bij de pijl?"
 */
export type Keuzevraag = {
  nr: number;
  id: string;
  soort: "keuze";
  wat: Wat;
  vorm: "na" | "nu" | "gat";
  eenheid: string[];
  /** Wat er in beeld ligt (de hele rij, met `null` op de lege plek). */
  rij: (string | null)[];
  /** Waar de lege plek is. */
  plek: number;
  goed: string;
  keuzes: string[];
  /** Alleen bij vormen: de kleur van elke vorm. */
  kleur?: Record<string, Kleur>;
};
/** De ketting langer maken: 3 kralen naar de lege plekken slepen. */
export type Kettingvraag = { nr: number; id: string; soort: "ketting"; wat: "kraal"; eenheid: Kleur[]; getoond: number; losse: Kleur[]; rij: Kleur[]; doel: Kleur[] };
/** De puzzel (een opdracht: hij kan niet fout, een stukje op een verkeerde plek klikt niet vast). */
export type Puzzelvraag = { nr: number; id: string; soort: "puzzel"; plaatje: PuzzelPlaatje; n: number };
export type Vraag = Keuzevraag | Kettingvraag | Puzzelvraag;

function kraal(nr: number, eenheid: Kleur[], lengte: number, vorm: "na" | "nu" | "gat", keuzes: Kleur[], gat = -1): Keuzevraag {
  const reeks = herhaal(eenheid, Math.max(lengte, gat + 1) + (vorm === "gat" ? 0 : 1));
  const plek = vorm === "gat" ? gat : lengte;
  const r: (string | null)[] = vorm === "gat" ? herhaal(eenheid, lengte) : [...herhaal(eenheid, lengte), null];
  r[plek] = null;
  return { nr, id: `vraag${nr}-kraal-${vorm}`, soort: "keuze", wat: "kraal", vorm, eenheid, rij: r, plek, goed: reeks[plek], keuzes };
}
function pijl(nr: number, eenheid: string[], lengte: number, gat: number, keuzes: string[]): Keuzevraag {
  const r: (string | null)[] = herhaal(eenheid, lengte);
  const goed = r[gat]!;
  r[gat] = null;
  return { nr, id: `vraag${nr}-pijl`, soort: "keuze", wat: "ding", vorm: "gat", eenheid, rij: r, plek: gat, goed, keuzes };
}
function ketting(nr: number, eenheid: Kleur[], getoond: number, losse: Kleur[]): Kettingvraag {
  return { nr, id: `vraag${nr}-ketting`, soort: "ketting", wat: "kraal", eenheid, getoond, losse, rij: herhaal(eenheid, getoond), doel: herhaal(eenheid, getoond + 3).slice(getoond) };
}

/** De vormen van vraag 14, met hun kleur (zoals de oude les). */
const VORMKLEUR: Record<string, Kleur> = { vierkant: "groen", driehoek: "oranje", cirkel: "paars" };

export const VRAGEN: Vraag[] = [
  kraal(1, ["rood", "groen", "blauw"], 7, "na", ["groen", "blauw", "rood"]),
  kraal(2, ["roze", "geel", "groen"], 7, "na", ["roze", "groen", "geel"]),
  kraal(3, ["paars", "oranje", "groen", "geel"], 6, "na", ["geel", "groen", "paars"]),
  kraal(4, ["rood", "rood", "blauw", "blauw", "groen", "groen"], 7, "nu", ["blauw", "rood", "groen"]),
  kraal(5, ["oranje", "oranje", "groen", "groen", "paars", "paars"], 8, "nu", ["groen", "paars", "oranje"]),
  kraal(6, ["blauw", "oranje", "paars", "groen"], 8, "gat", ["oranje", "blauw", "groen"], 5),
  kraal(7, ["rood", "geel", "blauw"], 8, "gat", ["blauw", "rood", "geel"], 4),
  ketting(8, ["geel", "rood", "blauw", "groen"], 6, ["groen", "geel", "blauw"]),
  ketting(9, ["oranje", "groen", "paars", "rood", "geel"], 7, ["rood", "geel", "paars"]),
  ketting(10, ["paars", "geel", "groen"], 6, ["geel", "groen", "paars"]),
  pijl(11, ["appel", "banaan", "peer", "mandarijn"], 8, 6, ["peer", "appel", "banaan"]),
  pijl(12, ["bal", "speelblok", "potlood", "boek"], 8, 4, ["boek", "bal", "speelblok"]),
  pijl(13, ["bal", "boek", "potlood"], 8, 4, ["potlood", "boek", "bal"]),
  {
    nr: 14,
    id: "vraag14-vorm-nu",
    soort: "keuze",
    wat: "vorm",
    vorm: "nu",
    eenheid: ["vierkant", "driehoek", "driehoek", "cirkel", "cirkel"],
    rij: ["vierkant", "driehoek", "driehoek", "cirkel", "cirkel", "vierkant", "driehoek", null],
    plek: 7,
    goed: "driehoek",
    keuzes: ["cirkel", "driehoek", "vierkant"],
    kleur: VORMKLEUR,
  },
  {
    nr: 15,
    id: "vraag15-puzzel",
    soort: "puzzel",
    plaatje: {
      soort: "raster",
      raster: [
        ["groen", "oranje", "paars", "oranje", "groen"],
        ["oranje", "lichtblauw", "paars", "lichtblauw", "oranje"],
        ["paars", "paars", "paars", "paars", "paars"],
        ["oranje", "lichtblauw", "paars", "lichtblauw", "oranje"],
        ["groen", "oranje", "paars", "oranje", "groen"],
      ],
    },
    n: 3,
  },
];

/** Wat er in de tekening staat (voor het vooraf laden): de dingen van de oude les; de bal is de strandbal "speelbal". */
export const VOORWERPEN = ["appel", "banaan", "peer", "mandarijn", "bal", "speelblok", "potlood", "boek", "speelbal"];

/* ---------- het patroon: wat komt na wat ---------- */

/** Alles wat in het patroon direct na `x` kan komen. */
export const naVan = (eenheid: string[], x: string) => new Set(eenheid.flatMap((e, i) => (e === x ? [eenheid[(i + 1) % eenheid.length]] : [])));
/** Alles wat in het patroon direct vóór `x` kan komen. */
export const voorVan = (eenheid: string[], x: string) => new Set(eenheid.flatMap((e, i) => (e === x ? [eenheid[(i - 1 + eenheid.length) % eenheid.length]] : [])));
/** Hoeveel keer `voor` in het patroon direct vóór `x` staat (bij een paar: 2). */
export const paarVoor = (eenheid: string[], x: string, voor: string) => {
  const u = eenheid.length;
  const j = eenheid.indexOf(x);
  let n = 0;
  while (n < u && eenheid[(j - 1 - n + u * 2) % u] === voor) n++;
  return n;
};
/** Hoeveel keer hetzelfde aan het eind van een rij ligt. */
export const eindReeks = (voor: string[]) => {
  let n = 0;
  while (n < voor.length && voor[voor.length - 1 - n] === voor[voor.length - 1]) n++;
  return n;
};
/** Wat er vóór de lege plek ligt (bij "na" en "nu": de hele rij). */
export const voorPlek = (v: Keuzevraag) => v.rij.slice(0, v.plek) as string[];

/* ---------- vaste zinnen van het verloop (laag 1 van de gouden lessen; eigen woorden) ---------- */

export const ZIN = {
  /** Het begin (geen startvraag: er is geen draaiboek met een startvraag). Samen met de groet 1 stuk; in beeld de
      blauw-gele ketting van de oude les. */
  start: "In deze les maak je patronen af. Een patroon komt steeds terug.",
  /** De vraag (de zinnen van de oude les). De eerste keer kiezen: wat het kind doet (tikken; 3.15). */
  vraag: (v: Keuzevraag, eerste: boolean) => [...vraagZinnen(v), ...(eerste ? ["Tik erop."] : [])],
  /** Na de hint van de 1e fout: de vraag kort (F1; 1 keer vóór deze poging, 3.23). */
  opnieuw: (v: Keuzevraag) => vraagZinnen(v).at(-1)!,
  /** De ketting langer maken: eerst wat er te zien is (1 stuk, met de pijl), dan de opdracht. */
  kettingIntro: "Maak de ketting langer. Kijk goed naar het patroon.",
  kettingOpdracht: "Sleep de kralen naar de lege plekken.",
  kettingHand: "Sleep een kraal naar een lege plek.",
  /** De puzzel: eerst het plaatje (1 stuk, met de pijl), dan de opdracht. */
  puzzelIntro: "Nu een puzzel. Kijk goed naar het patroon.",
  puzzelOpdracht: (eerste: boolean) => (eerste ? "Maak de puzzel. Sleep elk stukje naar zijn plek." : "Maak de puzzel."),
  puzzelHand: "Sleep een stukje naar het bord.",
  /** 2e fout: Bliepo doet het samen voor (eigen invulling, niet van Synthesis). 3 versies, om de beurt. */
  samen: ["Kom, we kijken samen.", "We zoeken het samen.", "Kom, samen lukt het."],
  /** Samen: Bliepo wijst het stukje aan dat steeds terugkomt (het eerste stukje van de rij). */
  samenPatroon: (wat: Wat, eenheid: string[], kleur?: Record<string, Kleur>) => `Kijk: ${eenheid.map(namen(wat, kleur).kort).join(", ")}. Dat komt steeds terug.`,
  /** Samen: het rondje om de goede keuze, en wat het is. */
  samenGoed: (v: Keuzevraag) => {
    const n = namen(v.wat, v.kleur);
    if (v.wat === "ding") return `Bij de pijl hoort dus ${n.een(v.goed)}.`;
    return v.vorm === "gat" ? `Op de lege plek hoort dus ${n.een(v.goed)}.` : `Hier komt dus ${n.een(v.goed)}.`;
  },
  samenJij: (v: Keuzevraag) => `Tik jij op ${namen(v.wat, v.kleur).de(v.goed)}?`,
  samenHand: "Tik op de keuze in het rondje.",
  samenKlaar: (v: Keuzevraag) => `Ja, ${namen(v.wat, v.kleur).de(v.goed)} past in het patroon.`,
  samenZelf: (v: Keuzevraag) => `Kijk, ${namen(v.wat, v.kleur).de(v.goed)} past in het patroon.`,
  /** Samen bij de ketting: de eerste 2 kralen legt Bliepo; het kind sleept de laatste. */
  samenKetting: (v: Kettingvraag) => `Na ${kw(v.rij.at(-1)!)} komen ${kw(v.doel[0])} en ${kw(v.doel[1])}.`,
  samenKettingJij: "Sleep jij de laatste kraal?",
  samenKettingHand: "Sleep de kraal naar de lege plek.",
  samenKettingKlaar: "Ja, de ketting is af.",
  samenKettingZelf: "Kijk, zo is de ketting af.",
  /** Samen bij de puzzel: het rondje om de plek van 1 stukje. */
  samenPuzzel: "Dit stukje hoort in het rondje.",
  samenPuzzelJij: "Sleep jij het naar het rondje?",
  samenPuzzelKlaar: "Ja, dat stukje zit vast.",
  samenPuzzelZelf: "Kijk, daar hoort het.",
  /** De puzzel na het samen voordoen: nog een stukje op een verkeerde plek. */
  puzzelWijs: ["Kijk, hier hoort dit stukje.", "Dit stukje hoort in het rondje."],
  puzzelWijsJij: ["Sleep jij het stukje erheen?", "Sleep het stukje naar die plek."],
  /** Vangnet bij de puzzel (20 s geen stukje erbij): Bliepo legt er 1, en daarna maakt hij hem af. */
  puzzelVangnet1: "Kijk, dit stukje leg ik voor je.",
  puzzelVangnet2: "Kijk, ik maak de puzzel af.",
  /** Vangnet bij de ketting (lang niets nagekeken): Bliepo doet het samen voor. */
  kettingVangnet: "Kom, we maken de ketting samen.",
  /** Hetzelfde foute antwoord 2 keer: niet 2 keer dezelfde eerste zin (geleerd bij Tellen). */
  weerGekozen: (v: Keuzevraag, x: string) => `Je koos weer ${namen(v.wat, v.kleur).de(x)}.`,
  /** Dezelfde foute kraal op dezelfde plek in de ketting. */
  weerKetting: (plek: number, x: string, ervoor: string | null) => (plek === 0 || !ervoor ? `Je sleepte weer eerst een ${kwb(x as Kleur)} kraal.` : `Je sleepte weer een ${kwb(x as Kleur)} kraal na de ${kwb(ervoor as Kleur)}.`),
  /** Het einde (de oude les: "Je kunt een patroon afmaken."). */
  slot: "Nu kun je een patroon afmaken.",
  kaartTik: "Tik op de kaart.",
};

function vraagZinnen(v: Keuzevraag): string[] {
  if (v.wat === "ding") return ["Er is iets weg.", "Wat hoort bij de pijl?"];
  if (v.wat === "vorm") return ["Kijk naar de vormen.", "Welke vorm komt nu?"];
  if (v.vorm === "gat") return ["Er is een lege plek in de ketting.", "Welke kraal hoort op de lege plek?"];
  if (v.vorm === "nu") return ["Kijk naar de ketting.", "Welke kraal komt nu?"];
  const laatste = v.rij[v.plek - 1] as Kleur;
  return ["Kijk naar de ketting.", `Welke kraal komt na de ${kwb(laatste)} kraal?`];
}

/** Aanmoediging bij het hulphandje (het kind moet slepen, niet nadenken; 14.35, geleerd bij Tellen). */
export const AANMOEDIG = ["Je bent goed bezig.", "Jij kunt dit."];

/* ---------- reactie na de lof (BLIEPO-KARAKTER.md §4 Vormen, zin 46 en 50, plus zinnen zonder "Ja") ---------- */

/** De robotzin (de laatste) hooguit 1 keer per les. Zin 0 en 1 beginnen met "Ja". */
export function patroonReactie(v: Vraag): Rijtje {
  if (v.soort === "ketting") return rij(["Ja, de ketting gaat goed verder.", "Ja, zo gaat het patroon verder.", "De ketting is langer en klopt.", "Alle kralen liggen goed.", "Nagekeken: de ketting klopt."], [4]);
  if (v.soort === "puzzel") return rij(["Ja, de puzzel is af.", "Ja, elk stukje ligt goed.", "De puzzel klopt.", "Alle stukjes liggen op hun plek.", "Nagekeken: de puzzel is af."], [4]);
  const n = namen(v.wat, v.kleur);
  return rij([`Ja, ${n.de(v.goed)} past in het patroon.`, "Ja, zo gaat het patroon verder.", `${Hoofd(n.de(v.goed))} past precies.`, "Het patroon klopt weer.", "Nagekeken: het patroon klopt."], [4]);
}
export const REACTIE_JA = [0, 1];
export const REACTIE_ROBOT = 4;

/* ---------- denkfouten (eigen invulling, niet van Synthesis; namen voor de voortgang) ---------- */

export const DENKFOUTEN = ["laatste-herhaald", "paar-vergeten", "buur-herhaald", "verkeerde-volgorde", "stukje-mis", "onduidelijk"] as const;
export type Denkfoutnaam = (typeof DENKFOUTEN)[number];

export const DENKFOUT_UITLEG: Record<Denkfoutnaam, string> = {
  "laatste-herhaald": "koos hetzelfde als wat aan het eind ligt, terwijl het patroon daar iets anders laat komen",
  "paar-vergeten": "koos wat na het paar komt, terwijl het paar aan het eind nog niet af is (in dit patroon komt iets 2 keer achter elkaar)",
  "buur-herhaald": "koos voor de lege plek hetzelfde als wat er direct naast ligt",
  "verkeerde-volgorde": "koos iets uit het patroon dat hier niet direct na komt (de volgorde van het patroon niet gevolgd)",
  "stukje-mis": "legde een puzzelstukje op een plek waar het niet past",
  onduidelijk: "niet duidelijk: geen reden verzonnen",
};

export type Fout = {
  code: Denkfoutnaam;
  /** Welke uitleg bij de 2e fout hoort (dezelfde soort 2 keer = "weer"); met een richting een eigen soort per kant. */
  soort: string;
  denkfout: string;
  /** Bliepo's eerste zin (wat het kind koos + iets waars daarover). */
  eerste: string;
  hint: string;
  /** Uitleg na de 2e fout (daarna meteen samen voordoen); geen opdracht. */
  uitleg: string;
  /** Dezelfde denkfout 2 keer (en de 1e keer zei Bliepo al wat er mis was): anders uitleggen, zonder opdracht. */
  weer: string[];
  scherm: string;
  /** Welke keuzes de eerste zin en de hint nog toelaten (voor de verklapcontrole van het script, 15.17). */
  over: string[];
  /** Voor het script: wat de eerste zin beweert (om na te lopen). */
  bewering: Bewering;
};
/** Wat een eerste zin of uitleg beweert, zodat het script het tegen het beeld kan nalopen (waarheidscontrole). */
export type Bewering =
  | { soort: "eind-al"; x: string; n: number }
  | { soort: "na-paar"; x: string; voor: string; n: number }
  | { soort: "naast"; kant: "links" | "rechts"; x: string }
  | { soort: "nooit-na"; na: string; x: string }
  | { soort: "ketting"; plek: number; x: string; na: string }
  | { soort: "geen" };

/* 2 à 3 versies per hint, zodat het kind niet steeds dezelfde zin hoort (LESRECEPT, geleerd bij Tellen). */
const kies2 = <T,>(lijst: T[], nr: number) => lijst[nr % lijst.length];

const UITLEG = {
  volgorde: ["Een patroon gaat steeds in dezelfde volgorde.", "In een patroon komt steeds hetzelfde stukje terug."],
  buur: ["Het patroon loopt ook door op de lege plek.", "Ook op de lege plek gaat het patroon gewoon verder."],
};

const SCHERM = {
  keuze: "Bliepo's scherm 1,5 s rood (geen fout-geluidje); het vinkje gaat van de keuze; een rood rondje om de gekozen keuze zolang Bliepo hem noemt (nooit om het antwoord); dan de hint en het kind mag opnieuw kiezen (alle 3 keuzes blijven, geen pijl)",
  ketting: "Bliepo's scherm 1,5 s rood (geen fout-geluidje); de kralen gaan terug naar beneden; bij de eerste kraal een rood rondje om de laatste kraal van de ketting zolang Bliepo hem noemt; de hint is de nieuwe opdrachtzin (geen pijl)",
};

/** De fouttabel van 1 fout antwoord bij een keuzevraag. */
export function keuzeFout(v: Keuzevraag, x: string): Fout {
  const n = namen(v.wat, v.kleur);
  const woord = rijWoord(v.wat);
  const andere = v.keuzes.filter((k) => k !== x);
  const jeKoos = `Je koos ${n.de(x)}.`;
  const basis = { denkfout: "", scherm: SCHERM.keuze, over: andere };
  if (v.vorm === "gat") {
    const links = v.rij[v.plek - 1]!;
    const rechts = v.rij[v.plek + 1];
    const plekWoord = v.wat === "ding" ? "de pijl" : "de lege plek";
    /* Een hint mag alleen zeggen "zoek eerder in de rij …" als dat er eerder echt ligt, en als daarna (of ervoor) in het
       patroon steeds hetzelfde komt (waarheidscontrole van het script, keuring Huisnummers). */
    const eerderNa = (a: string) => v.rij.slice(0, v.plek - 1).includes(a) && naVan(v.eenheid, a).size === 1;
    const eerderVoor = (a: string) => v.rij.slice(1, v.plek).some((e, i) => e === a && v.rij[i] !== null) && voorVan(v.eenheid, a).size === 1;
    const zoekBegin = "Zoek het stukje dat steeds terugkomt.";
    const zoekNa = eerderNa(links) ? `Zoek eerder in de ${woord} ${n.een(links)}. Kijk wat daarna komt.` : null;
    const zoekLinks = eerderNa(links) ? `Kijk links van ${plekWoord}. Zoek ${v.wat === "kraal" ? "die kraal" : "dat"} eerder.` : null;
    const zoekVoor = rechts && eerderVoor(rechts) ? `Zoek eerder in de ${woord} ${n.een(rechts)}. Kijk wat ervoor komt.` : null;
    const hintsGat = (eerst: (string | null)[]) => {
      const h = [...eerst, zoekNa, zoekLinks, zoekVoor, zoekBegin].filter((z): z is string => !!z);
      return [...new Set(h)].slice(0, 2);
    };
    if (x === links && !naVan(v.eenheid, links).has(x)) {
      return { ...basis, code: "buur-herhaald", soort: "buur-herhaald-links", denkfout: DENKFOUT_UITLEG["buur-herhaald"], eerste: `${jeKoos} Links van ${plekWoord} ligt al ${n.een(x)}.`, hint: kies2(hintsGat([zoekNa, zoekLinks]), v.nr), uitleg: kies2(UITLEG.buur, v.nr), weer: [`Je koos weer hetzelfde als ernaast.`, `Na ${n.noem(links)} komt in dit patroon steeds ${v.wat === "kraal" ? "een andere kleur" : "iets anders"}.`], bewering: { soort: "naast", kant: "links", x } };
    }
    if (rechts && x === rechts && !voorVan(v.eenheid, rechts).has(x)) {
      return { ...basis, code: "buur-herhaald", soort: "buur-herhaald-rechts", denkfout: DENKFOUT_UITLEG["buur-herhaald"], eerste: `${jeKoos} Rechts van ${plekWoord} ligt al ${n.een(x)}.`, hint: kies2(hintsGat([zoekVoor, zoekNa]), v.nr), uitleg: kies2(UITLEG.buur, v.nr), weer: [`Je koos weer hetzelfde als ernaast.`, `Vóór ${n.noem(rechts)} komt in dit patroon steeds ${v.wat === "kraal" ? "een andere kleur" : "iets anders"}.`], bewering: { soort: "naast", kant: "rechts", x } };
    }
    return { ...basis, code: "verkeerde-volgorde", soort: "verkeerde-volgorde", denkfout: DENKFOUT_UITLEG["verkeerde-volgorde"], eerste: `${jeKoos} Na ${n.noem(links)} komt nooit ${n.noemEen(x)}.`, hint: kies2(hintsGat([zoekNa, zoekVoor]), v.nr + 1), uitleg: kies2(UITLEG.volgorde, v.nr), weer: [`Je koos weer iets dat niet na ${n.noem(links)} komt.`, `Na ${n.noem(links)} komt in dit patroon steeds ${zelfde(v.wat)}.`], bewering: { soort: "nooit-na", na: links, x } };
  }
  /* De lege plek aan het eind ("na", "nu"). */
  const voor = voorPlek(v);
  const laatste = voor.at(-1)!;
  const reeks = eindReeks(voor);
  const na = naVan(v.eenheid, laatste);
  /* Kan er na het laatste meer dan 1 ding komen (een paar), dan helpt "zoek … en kijk wat daarna komt" niet: dan het stukje. */
  const zoekNa = `Zoek eerder in de ${woord} ${n.een(laatste)}. Kijk wat daarna komt.`;
  const zoekBegin = "Zoek het stukje dat steeds terugkomt.";
  const hoeVaak = `Kijk hoe vaak elk${v.wat === "kraal" ? "e kleur" : "e vorm"} achter elkaar komt.`;
  const hints = na.size === 1 ? [zoekNa, zoekBegin] : [zoekBegin, hoeVaak];
  const dubbel = v.eenheid.filter((e, i) => v.eenheid[(i + 1) % v.eenheid.length] === e);
  const alleDubbel = new Set(dubbel).size === new Set(v.eenheid).size;
  const paarUitleg = alleDubbel ? `In deze ${woord} komt elk${v.wat === "kraal" ? "e kleur" : "e vorm"} ${g(2, "wit")} keer achter elkaar.` : `${Hoofd([...new Set(dubbel)].map((d) => n.kort(d)).map((d) => (v.wat === "vorm" ? `de ${d}` : d)).join(" en "))} ${new Set(dubbel).size > 1 ? "komen" : "komt"} steeds ${g(2, "wit")} keer achter elkaar.`;
  if (x === laatste) {
    const eind = reeks >= 2 ? `Aan het eind liggen al ${g(reeks, kleurVan(v, x))} ${n.meer(x)}.` : `Aan het eind ligt al ${n.een(x)}.`;
    const anders = reeks >= 2 ? `Na ${g(reeks, kleurVan(v, x))} ${n.meer(x)} komt steeds iets anders.` : `Na ${n.noem(x)} komt in dit patroon steeds iets anders.`;
    return { ...basis, code: "laatste-herhaald", soort: "laatste-herhaald", denkfout: DENKFOUT_UITLEG["laatste-herhaald"], eerste: `${jeKoos} ${eind}`, hint: kies2(hints, v.nr), uitleg: kies2(na.size === 1 ? UITLEG.volgorde : [paarUitleg], v.nr), weer: ["Je koos weer hetzelfde als aan het eind.", anders], bewering: { soort: "eind-al", x, n: reeks } };
  }
  if (na.has(x)) {
    return { ...basis, code: "paar-vergeten", soort: "paar-vergeten", denkfout: DENKFOUT_UITLEG["paar-vergeten"], eerste: `${jeKoos} In dit patroon komt ${n.noem(x)} na ${g(paarVoor(v.eenheid, x, laatste), kleurVan(v, laatste))} ${n.meer(laatste)}.`, hint: kies2([zoekBegin, hoeVaak], v.nr), uitleg: paarUitleg, weer: [`Je koos weer ${n.een(x)}.`, `Aan het eind ligt nog maar ${g(1, kleurVan(v, laatste))} ${v.wat === "kraal" ? `${kwb(laatste as Kleur)} kraal` : n.kort(laatste)}.`], bewering: { soort: "na-paar", x, voor: laatste, n: paarVoor(v.eenheid, x, laatste) } };
  }
  return { ...basis, code: "verkeerde-volgorde", soort: "verkeerde-volgorde", denkfout: DENKFOUT_UITLEG["verkeerde-volgorde"], eerste: `${jeKoos} Na ${n.noem(laatste)} komt nooit ${n.noemEen(x)}.`, hint: kies2(hints, v.nr + 1), uitleg: kies2(na.size === 1 ? UITLEG.volgorde : [paarUitleg, UITLEG.volgorde[0]], v.nr), weer: [`Je koos weer iets dat niet na ${n.noem(laatste)} komt.`, na.size === 1 ? `Na ${n.noem(laatste)} komt in dit patroon steeds ${zelfde(v.wat)}.` : UITLEG.volgorde[1]], bewering: { soort: "nooit-na", na: laatste, x } };
}

/** De kleur van een getal dat naar dingen in de rij verwijst: bij kralen de kleur van de kraal, bij vormen de kleur van de vorm; dingen wit (hun kleur is geen getalkleur). */
function kleurVan(v: Keuzevraag, x: string): string {
  if (v.wat === "kraal") return x;
  if (v.wat === "vorm") return v.kleur![x];
  return "wit";
}

/**
 * De fouttabel van een foute ketting (3 kralen gesleept). De eerste kraal die niet klopt, bepaalt de denkfout (dezelfde
 * regels als hierboven, met als "laatste" de kraal ervoor: de laatste van de ketting, of de kraal die het kind net goed
 * legde). Met 3 verschillende kralen kan alleen de 1e of de 2e kraal de eerste zijn die niet klopt.
 */
export function kettingFout(v: Kettingvraag, gelegd: string[]): Fout {
  const i = gelegd.findIndex((k, p) => k !== v.doel[p]);
  const x = gelegd[i] as Kleur;
  const voor = [...v.rij, ...v.doel.slice(0, i)];
  const laatste = voor.at(-1) as Kleur;
  const na = naVan(v.eenheid, laatste);
  const andere = [...new Set(v.losse)].filter((k) => k !== x);
  const begin = i === 0 ? `Je sleepte eerst ${`een ${kwb(x)} kraal`}.` : `De eerste kraal klopt. Daarna sleepte je ${`een ${kwb(x)} kraal`}.`;
  const zoekNa = `Zoek eerder in de ketting een ${kwb(laatste)} kraal. Kijk wat daarna komt.`;
  const zoekBegin = "Zoek in de ketting het stukje dat steeds terugkomt.";
  const basis = { scherm: SCHERM.ketting, over: andere };
  if (x === laatste && !na.has(x)) {
    const eind = i === 0 ? `De ketting eindigt al met een ${kwb(x)} kraal.` : `Daarvoor lag ook al een ${kwb(x)} kraal.`;
    return { ...basis, code: "laatste-herhaald", soort: "laatste-herhaald", denkfout: DENKFOUT_UITLEG["laatste-herhaald"], eerste: `${begin} ${eind}`, hint: kies2([zoekNa, zoekBegin], v.nr), uitleg: kies2(UITLEG.volgorde, v.nr), weer: ["Je sleepte weer dezelfde kleur als ervoor.", `Na ${kw(laatste)} komt in dit patroon steeds een andere kleur.`], bewering: { soort: "ketting", plek: i, x, na: laatste } };
  }
  return { ...basis, code: "verkeerde-volgorde", soort: "verkeerde-volgorde", denkfout: DENKFOUT_UITLEG["verkeerde-volgorde"], eerste: `${begin} Na ${kw(laatste)} komt nooit ${kw(x)}.`, hint: kies2([zoekNa, zoekBegin], v.nr + 1), uitleg: kies2(UITLEG.volgorde, v.nr), weer: [`Je sleepte weer een kraal die niet na ${kw(laatste)} komt.`, na.size === 1 ? `Na ${kw(laatste)} komt in dit patroon steeds dezelfde kleur.` : UITLEG.volgorde[1]], bewering: { soort: "ketting", plek: i, x, na: laatste } };
}

/** De puzzel: een stukje op een plek waar het niet past (eigen invulling). 2 versies van de hint. */
export const PUZZEL_FOUT = {
  code: "stukje-mis" as Denkfoutnaam,
  eerste: ["Dat stukje past daar niet.", "Daar hoort dat stukje niet."],
  hint: ["Kijk naar de kleuren op het stukje. Zoek die kleuren in het patroon.", "Kijk naar de randjes van het stukje. Welke kleuren raken elkaar?"],
  uitleg: "Een stukje klikt alleen vast op zijn eigen plek.",
};

/** De fouttabel van een vraag: elk fout antwoord (bij de ketting: elke foute volgorde van de 3 kralen). */
export function foutenVan(v: Vraag): Record<string, Fout> {
  if (v.soort === "keuze") return Object.fromEntries(v.keuzes.filter((k) => k !== v.goed).map((k) => [k, keuzeFout(v, k)]));
  if (v.soort === "ketting") return Object.fromEntries(permutaties(v.losse).filter((p) => p.join() !== v.doel.join()).map((p) => [p.join(","), kettingFout(v, p)]));
  return {};
}

export function permutaties<T>(lijst: T[]): T[][] {
  if (lijst.length <= 1) return [lijst];
  return lijst.flatMap((x, i) => permutaties([...lijst.slice(0, i), ...lijst.slice(i + 1)]).map((r) => [x, ...r]));
}
