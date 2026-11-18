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
 * WARME JUF (Sara, 18 november 2026; zoals Tellen, Splitsen, Getallenlijn): elke zin nagelopen en in varianten; de les
 * kiest met de gedeelde kiezer (nooit-dubbel.ts) nooit 2 keer achter elkaar dezelfde, ook niet over vragen heen. Wat het
 * kind koos wordt niet 2 keer achter elkaar genoemd ("Je koos rood. Die kleur ligt al aan het eind."), na een hint komt
 * altijd een vraag of opdracht (15.37, F16), en alles past in het tekstvak. Oud naast nieuw: WIJZIGINGEN-ZINNEN-VORMEN.md.
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
import { deeltStuk } from "./nooit-dubbel";

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

/* ---------- NOOIT 2 KEER HETZELFDE (Sara, 18 november 2026; zoals de proefles Tellen) ----------
 * Elke zin die terugkomt heeft een rijtje varianten; de les kiest er steeds 1 met de gedeelde kiezer (nooit-dubbel.ts):
 * nooit 2 keer achter elkaar dezelfde, ook niet over vragen heen. "Je koos rood." en "Je koos blauw." tellen als dezelfde
 * zin (de kleuren, dingen en vormen zijn wisselwoorden). Harde eisen (past in het tekstvak, noemt niet nog een keer wat in
 * de zin ervoor al genoemd werd) worden vooraf uit het rijtje gehaald. Oud naast nieuw: WIJZIGINGEN-ZINNEN-VORMEN.md.
 */

/** De woorden die in dezelfde zin wisselen (voor de kiezer): kleuren, dingen, vormen, en ketting/rij, lege plek/pijl. */
export const WISSELWOORDEN: string[] = [
  ...new Set([
    ...Object.values(KLEURWOORD).flat(),
    ...Object.values(DING).flatMap(([, a, b]) => [a, b]),
    ...Object.values(VORM).flatMap((x) => [x![1], x![2]]),
    "ketting",
    "rij",
    "de lege plek",
    "de pijl",
  ]),
];

/** Zonder kleurcode: {2:rood} wordt 2. */
export const kaal = (z: string) => z.replace(/\{([^}:]+):[a-zA-Z]+\}/g, "$1");
/** Zo lang mag 1 stuk tekst zijn (1 stuk = wat Bliepo in 1 keer zegt): dan past het in het tekstvak (15.30). */
export const MAX_STUK = 125;
export const lengte = (...zinnen: string[]) => kaal(zinnen.filter(Boolean).join(" ")).length;

/** Welke kralen, dingen en vormen een zin noemt (met hoe vaak), om niets 2 keer achter elkaar te zeggen. */
const NAAMWOORD = new Map<string, string>();
for (const [k, [a, b]] of Object.entries(KLEURWOORD)) {
  NAAMWOORD.set(a, k);
  NAAMWOORD.set(b, k);
}
for (const [k, [, a, b]] of Object.entries(DING)) {
  NAAMWOORD.set(a, k);
  NAAMWOORD.set(b, k);
}
for (const [k, x] of Object.entries(VORM)) {
  NAAMWOORD.set(x![1], k);
  NAAMWOORD.set(x![2], k);
}
export function dingenIn(z: string): string[] {
  return (kaal(z).toLowerCase().match(/[a-zë]+/g) ?? []).flatMap((w) => (NAAMWOORD.has(w) ? [NAAMWOORD.get(w)!] : []));
}
/** Noemen 2 zinnen dezelfde kraal (kleur), hetzelfde ding of dezelfde vorm? */
export const deeltDing = (a: string, b: string) => {
  const A = new Set(dingenIn(a));
  return dingenIn(b).some((x) => A.has(x));
};
/** Harde eis: alleen varianten die niet noemen wat de zin ervoor al noemde (is er geen, dan allemaal). */
export const zonderDingUit = (zinnen: readonly string[], ervoor: string): string[] => {
  const over = zinnen.filter((z) => !deeltDing(ervoor, z));
  return over.length ? over : [...zinnen];
};
/** Harde eis: alleen varianten die passen (samen met `rest` in 1 stuk). Past er geen, dan de kortste. */
export const passend = (zinnen: readonly string[], ...rest: string[]): string[] => {
  const over = zinnen.filter((z) => lengte(...rest, z) <= MAX_STUK);
  return over.length ? over : [[...zinnen].sort((a, b) => lengte(a) - lengte(b))[0]];
};
/** Het begin van een zin (de eerste 2 woorden), om niet 2 keer achter elkaar "Je koos …" te zeggen. */
export const beginVan = (z: string) => kaal(z).toLowerCase().replace(/\d+/g, "#").split(/[.!?,:]/)[0].trim().split(/\s+/).slice(0, 2).join(" ");

/** De kiezer van de les (nooit-dubbel.ts): kiest 1 zin uit een rijtje, nooit 2 keer achter elkaar dezelfde. */
export type Kies = (sleutel: string, zinnen: readonly string[], mag?: (z: string) => boolean) => string;

/* ---------- hoe Bliepo het gekozen ding kort noemt ---------- */

/** "rood" (kraal), "de appel" (ding), "het vierkant" (vorm). */
const wie = (wat: Wat, x: string) => (wat === "kraal" ? kw(x as Kleur) : namen(wat).noem(x));
/** "Die kleur" (kraal), "Die" (de-woord), "Dat" (het-woord). */
const Die = (wat: Wat, x: string) => (wat === "kraal" ? "Die kleur" : (wat === "ding" ? DING[x][0] : VORM[x as VormNaam]![0]) === "het" ? "Dat" : "Die");
/** "dezelfde kleur" (kraal), anders "hetzelfde". */
const hetzelfde = (wat: Wat) => (wat === "kraal" ? "dezelfde kleur" : "hetzelfde");
/** Hoe het eerste woord van een zin klinkt met een hoofdletter. */
const H = Hoofd;

/* ---------- vaste zinnen van het verloop (laag 1 van de gouden lessen; eigen woorden, in varianten) ---------- */

/** De vraagzinnen van de oude les; de 2e vraag van dezelfde soort achter elkaar krijgt "En … nu …" (3.11: de schoolterm blijft). */
const NOG_EEN: Record<string, string> = {
  "Welke kraal komt nu?": "En welke kraal komt er nu?",
  "Welke kraal hoort op de lege plek?": "En welke kraal hoort nu op de lege plek?",
  "Wat hoort bij de pijl?": "En wat hoort nu bij de pijl?",
  "Welke vorm komt nu?": "En welke vorm komt er nu?",
};
function basisVraag(v: Keuzevraag): string {
  if (v.wat === "ding") return "Wat hoort bij de pijl?";
  if (v.wat === "vorm") return "Welke vorm komt nu?";
  if (v.vorm === "gat") return "Welke kraal hoort op de lege plek?";
  if (v.vorm === "nu") return "Welke kraal komt nu?";
  return `Welke kraal komt na de ${kwb(v.rij[v.plek - 1] as Kleur)} kraal?`;
}
/** De vraagzin van deze vraag: die van de oude les; staat dezelfde vraag er net al, dan om en om met "En … nu …". */
export function vraagZin(v: Keuzevraag): string {
  const basis = basisVraag(v);
  let k = 0;
  for (let i = VRAGEN.indexOf(v) - 1; i >= 0; i--) {
    const w = VRAGEN[i];
    if (w.soort !== "keuze" || basisVraag(w) !== basis) break;
    k++;
  }
  return k % 2 === 1 && NOG_EEN[basis] ? NOG_EEN[basis] : basis;
}
/** Wat Bliepo vóór de vraag zegt (kijken), per soort vraag in varianten. */
export function vraagIntro(v: Keuzevraag): string[] {
  if (v.wat === "ding") return ["Er is iets weg.", "Kijk, er is iets weg uit de rij.", "In deze rij ontbreekt iets."];
  if (v.wat === "vorm") return ["Kijk naar de vormen.", "Kijk goed naar deze rij vormen."];
  if (v.vorm === "gat") return ["Er is een lege plek in de ketting.", "In deze ketting is een plek leeg.", "Kijk, er ontbreekt een kraal in de ketting."];
  return ["Kijk naar de ketting.", "Kijk goed naar deze ketting.", "Hier is een nieuwe ketting."];
}
/** Na de hint van de 1e fout: de vraag in andere woorden (F1, 15.37; 1 keer vóór deze poging, 3.23). */
export function opnieuwVraag(v: Keuzevraag): string[] {
  if (v.wat === "ding") return ["Wat hoort bij de pijl?", "Wat hoort bij de pijl, denk je?", "Tik op wat bij de pijl hoort."];
  if (v.wat === "vorm") return ["Welke vorm komt nu?", "Welke vorm komt nu, denk je?", "Tik op de vorm die nu komt."];
  if (v.vorm === "gat") return ["Welke kraal hoort op de lege plek?", "Welke kraal past op de lege plek, denk je?", "Tik op de kraal die op de lege plek hoort."];
  if (v.vorm === "nu") return ["Welke kraal komt nu?", "Welke kraal komt nu, denk je?", "Tik op de kraal die nu komt."];
  return [basisVraag(v), "Welke kraal komt nu, denk je?", "Tik op de kraal die nu komt."];
}
/** Na een hint die zelf al zegt wat je zoekt ("… kijk wat daarna komt."): kort wat het kind doet (niet nog eens de vraag). */
export function opnieuwKort(v: Keuzevraag): string[] {
  if (v.wat === "ding") return ["Tik dan op wat past.", "Kies dan wat bij de pijl past."];
  if (v.wat === "vorm") return ["Tik dan op de vorm die past.", "Kies dan de vorm die past."];
  return ["Tik dan op de kraal die past.", "Kies dan de kraal die past."];
}
/** Wat er na deze hint komt: de vraag in andere woorden, of kort de opdracht (de hint zegt al waar het om gaat). */
export const opnieuwNa = (v: Keuzevraag, hint: string) => (/kijk wat (daarna|ervoor) komt/i.test(hint) ? opnieuwKort(v) : opnieuwVraag(v));

export const ZIN = {
  /** Het begin (geen startvraag: er is geen draaiboek met een startvraag). Samen met de groet 1 stuk; in beeld de
      blauw-gele ketting van de oude les. */
  start: ["Vandaag maken we patronen af. Kijk: blauw, geel, blauw, geel. Dat komt steeds terug.", "We gaan samen patronen afmaken. In een patroon komt steeds hetzelfde stukje terug."],
  /** De vraag: wat er te zien is, de vraagzin van de oude les, en de eerste keer kiezen wat het kind doet (3.15). */
  vraagIntro,
  vraag: vraagZin,
  tikErop: "Tik erop.",
  opnieuwVraag,
  opnieuwKort,
  /** De ketting langer maken: eerst wat er te zien is (1 stuk, met de pijl), dan de opdracht. */
  kettingIntro: ["Maak de ketting langer. Kijk goed naar het patroon.", "We maken de ketting langer. Kijk eerst goed naar het patroon.", "Deze ketting is nog niet af. Kijk goed naar de kralen."],
  kettingOpdracht: ["Sleep de kralen naar de lege plekken.", "Sleep de losse kralen naar de lege plekken.", "Sleep elke kraal naar een lege plek. Let op de volgorde."],
  kettingHand: ["Sleep een kraal naar een lege plek.", "Sleep maar een kraal naar een lege plek.", "Hier is een lege plek. Sleep er een kraal heen."],
  /** Na de hint bij de ketting: wat het kind nu doet (de hint zelf is geen opdracht; 15.37, F16). */
  kettingOpnieuw: ["Sleep de kralen dan opnieuw.", "Sleep ze daarna nog een keer.", "Leg ze dan opnieuw. Sleep maar!"],
  /** De puzzel: eerst het plaatje (1 stuk, met de pijl), dan de opdracht. */
  puzzelIntro: ["Nu een puzzel. Kijk goed naar het patroon.", "Tot slot een puzzel. Kijk eerst goed naar het plaatje."],
  puzzelOpdracht: (eerste: boolean) => (eerste ? ["Maak de puzzel. Sleep elk stukje naar zijn plek.", "Sleep elk stukje naar zijn plek op het bord."] : ["Maak de puzzel af. Sleep de stukjes naar het bord.", "Sleep de stukjes naar het bord."]),
  puzzelHand: ["Sleep een stukje naar het bord.", "Sleep maar een stukje naar het bord.", "Hier is het bord. Sleep er een stukje heen."],
  /** 2e fout: Bliepo doet het samen voor (eigen invulling; "Ik help je even" is van Synthesis). */
  samen: ["Kom, we kijken samen.", "We zoeken het samen.", "Kom, samen lukt het.", "Ik help je even. We kijken samen.", "Geeft niks. We zoeken het samen."],
  /** Samen: Bliepo wijst het stukje aan dat steeds terugkomt (het eerste stukje van de rij). */
  samenPatroon: (wat: Wat, eenheid: string[], kleur?: Record<string, Kleur>) => {
    const rijtje = eenheid.map(namen(wat, kleur).kort).join(", ");
    return [`Kijk: ${rijtje}. Dat komt steeds terug.`, `Dit stukje komt steeds terug: ${rijtje}.`, `Zie je het stukje? ${H(rijtje)}. Dat komt steeds weer terug.`];
  },
  /** Samen: het rondje om de goede keuze, en wat het is. */
  samenGoed: (v: Keuzevraag) => {
    const e = namen(v.wat, v.kleur).een(v.goed);
    if (v.wat === "ding") return [`Bij de pijl hoort dus ${e}.`, `Dus bij de pijl hoort ${e}.`, `Daarom hoort er ${e} bij de pijl.`];
    if (v.vorm === "gat") return [`Op de lege plek hoort dus ${e}.`, `Dus op de lege plek hoort ${e}.`, `Daarom hoort er ${e} op de lege plek.`];
    return [`Hier komt dus ${e}.`, `Dus hier komt ${e}.`, `Daarom komt hier ${e}.`];
  },
  /** De kleine stap: het kind tikt de keuze in het rondje aan (Bliepo noemde hem net; niet nog een keer). */
  samenJij: ["Tik jij erop?", "Wil jij erop tikken?", "Nu jij! Tik op de keuze in het rondje."],
  samenHand: ["Tik op de keuze in het rondje.", "Tik maar op de keuze in het rondje.", "Hier is het. Tik erop."],
  samenKlaar: (v: Keuzevraag) => [`Ja, ${namen(v.wat, v.kleur).de(v.goed)} past in het patroon.`, "Ja, zo klopt het patroon weer.", "Precies, nu is het patroon weer heel."],
  /** Na het vangnet (Bliepo deed de stap zelf): geen "Ja" alsof het kind het deed (keuring Meer-minder). */
  samenZelf: (v: Keuzevraag) => [`Kijk, ${namen(v.wat, v.kleur).de(v.goed)} past in het patroon.`, "Kijk, zo klopt het patroon weer."],
  /** Samen bij de ketting: de eerste 2 kralen legt Bliepo; het kind sleept de laatste. */
  samenKetting: (v: Kettingvraag) => {
    const [l, a, b] = [kw(v.rij.at(-1)!), kw(v.doel[0]), kw(v.doel[1])];
    return [`Na ${l} komen ${a} en ${b}.`, `Ik leg ${a} en ${b} erbij. Die komen na ${l}.`, `Kijk, na ${l} komt eerst ${a} en dan ${b}.`];
  },
  samenKettingJij: ["Sleep jij de laatste kraal?", "Nu jij! Sleep de laatste kraal naar de lege plek.", "Sleep jij de laatste kraal erbij?"],
  samenKettingHand: ["Sleep de kraal naar de lege plek.", "Sleep de kraal maar naar de lege plek.", "Hier is de lege plek. Sleep de kraal erheen."],
  samenKettingKlaar: ["Ja, de ketting is af.", "Ja, nu klopt de ketting.", "Precies, zo is de ketting af."],
  samenKettingZelf: ["Kijk, zo is de ketting af.", "Ik leg de laatste kraal erbij. Nu is de ketting af."],
  /** Samen bij de puzzel en daarna (Bliepo wijst de plek aan met het rondje). Eén rijtje, zodat de zin niet 2 keer achter
      elkaar klinkt. */
  puzzelWijs: ["Dit stukje hoort in het rondje.", "Kijk, hier hoort dit stukje.", "Kijk, dit stukje past in het rondje."],
  puzzelWijsJij: ["Sleep jij het naar het rondje?", "Sleep het stukje naar die plek.", "Nu jij! Sleep het stukje naar het rondje."],
  samenPuzzelKlaar: ["Ja, dat stukje zit vast.", "Ja, dat past precies.", "Precies, dat stukje zit op zijn plek."],
  samenPuzzelZelf: ["Kijk, daar hoort het.", "Kijk, ik leg het op zijn plek."],
  /** Vangnet bij de puzzel (20 s geen stukje erbij): Bliepo legt er 1, en daarna maakt hij hem af. */
  puzzelVangnet1: ["Kijk, dit stukje leg ik voor je.", "Ik help je even. Dit stukje leg ik erin."],
  puzzelVangnet2: ["Kijk, ik maak de puzzel af.", "Kom, ik leg de andere stukjes erbij."],
  /** Vangnet bij de ketting (lang niets nagekeken): Bliepo doet het samen voor (zonder daarna nog "Kom, we kijken samen."). */
  kettingVangnet: ["Kom, we maken de ketting samen.", "Ik help je even. We maken de ketting samen.", "Geeft niks. We maken de ketting samen."],
  /** Hetzelfde foute antwoord 2 keer: niet 2 keer dezelfde eerste zin (geleerd bij Tellen). */
  weerGekozen: (v: Keuzevraag, x: string) => [`Je koos weer ${namen(v.wat, v.kleur).de(x)}.`, `Weer ${wie(v.wat, x)}, zie ik.`, `Je tikte weer op ${namen(v.wat, v.kleur).de(x)}.`],
  /** Dezelfde foute kraal op dezelfde plek in de ketting. */
  weerKetting: (plek: number, x: string, ervoor: string | null) =>
    plek === 0 || !ervoor ? [`Je sleepte weer eerst een ${kwb(x as Kleur)} kraal.`, `Weer eerst ${kw(x as Kleur)}, zie ik.`] : [`Je sleepte weer een ${kwb(x as Kleur)} kraal na de ${kwb(ervoor as Kleur)}.`, `Weer ${kw(x as Kleur)} na ${kw(ervoor as Kleur)}, zie ik.`],
  /** Het einde (de oude les: "Je kunt een patroon afmaken."). */
  slot: ["Nu kun je een patroon afmaken.", "Jij kunt nu zelf een patroon afmaken.", "Nu weet je welk stukje steeds terugkomt."],
  kaartTik: ["Tik op de kaart.", "Tik maar op de kaart.", "Kijk, een kaart voor jou! Tik erop."],
};

/** Aanmoediging bij het hulphandje (het kind moet slepen of tikken, niet nadenken; 14.35, geleerd bij Tellen). */
export const AANMOEDIG = ["Je bent goed bezig.", "Jij kunt dit.", "Het gaat goed zo.", "Probeer het maar.", "Toe maar, je doet het goed."];

/* ---------- reactie na de lof (BLIEPO-KARAKTER.md §4 Vormen, zin 46 en 50, plus zinnen zonder "Ja") ---------- */

/** De robotzin (index 4) hooguit 1 keer per les. Zin 0 en 1 beginnen met "Ja"; 5 en 6 zijn erbij sinds 18 november 2026. */
export function patroonReactie(v: Vraag): Rijtje {
  if (v.soort === "ketting") return rij(["Ja, de ketting gaat goed verder.", "Ja, zo gaat het patroon verder.", "De ketting is langer en klopt.", "Alle kralen liggen goed.", "Nagekeken: de ketting klopt.", "Precies, zo gaat de ketting verder.", "Dat klopt: elke kraal ligt op zijn plek."], [4]);
  if (v.soort === "puzzel") return rij(["Ja, de puzzel is af.", "Ja, elk stukje ligt goed.", "De puzzel klopt.", "Alle stukjes liggen op hun plek.", "Nagekeken: de puzzel is af.", "Precies, het plaatje is heel.", "Dat klopt: alles zit op zijn plek."], [4]);
  const n = namen(v.wat, v.kleur);
  return rij([`Ja, ${n.de(v.goed)} past in het patroon.`, "Ja, zo gaat het patroon verder.", `${Hoofd(n.de(v.goed))} past precies.`, "Het patroon klopt weer.", "Nagekeken: het patroon klopt.", "Precies, zo loopt het patroon door.", `Dat klopt: ${n.de(v.goed)} hoort hier.`], [4]);
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

/**
 * Alle varianten bij 1 fout antwoord (18 november 2026); de les kiest er steeds 1 (nooit 2 keer achter elkaar dezelfde).
 *   eerste      1e keer: wat het kind koos + iets waars daarover (nooit het antwoord);
 *   hint        1e keer: hoe je zoekt; daarna komt de vraag in andere woorden (of kort wat het kind doet);
 *   uitleg      2e keer (daarna samen voordoen): geen opdracht;
 *   weerEerste / weerUitleg   2 keer dezelfde denkfout (en Bliepo noemde hem de 1e keer al): anders uitleggen.
 */
export type Varianten = { eerste: string[]; hint: string[]; uitleg: string[]; weerEerste: string[]; weerUitleg: string[] };

export type Fout = {
  code: Denkfoutnaam;
  /** Welke uitleg bij de 2e fout hoort (dezelfde soort 2 keer = "weer"); met een richting een eigen soort per kant. */
  soort: string;
  denkfout: string;
  /** Voor de fouttabel: 1 vaste variant van elk rijtje hieronder (de les kiest uit `v`). */
  eerste: string;
  hint: string;
  uitleg: string;
  weer: string[];
  scherm: string;
  /** Welke keuzes de eerste zin en de hint nog toelaten (voor de verklapcontrole van het script, 15.17). */
  over: string[];
  /** Voor het script: wat de eerste zin beweert (om na te lopen). */
  bewering: Bewering;
  v: Varianten;
};
/** Wat een eerste zin of uitleg beweert, zodat het script het tegen het beeld kan nalopen (waarheidscontrole). */
export type Bewering =
  | { soort: "eind-al"; x: string; n: number }
  | { soort: "na-paar"; x: string; voor: string; n: number }
  | { soort: "naast"; kant: "links" | "rechts"; x: string }
  | { soort: "nooit-na"; na: string; x: string }
  | { soort: "ketting"; plek: number; x: string; na: string }
  | { soort: "geen" };

/** De vaste variant voor de fouttabel (per vraag een andere, zodat de tabel er verschillende laat zien). */
const vast = <T,>(lijst: T[], nr: number) => lijst[nr % lijst.length];

const UITLEG = {
  volgorde: ["Een patroon gaat steeds in dezelfde volgorde.", "In een patroon komt steeds hetzelfde stukje terug.", "In een patroon blijft de volgorde steeds hetzelfde."],
  buur: ["Het patroon loopt ook door op de lege plek.", "Ook op de lege plek gaat het patroon gewoon verder.", "De lege plek hoort ook bij het patroon."],
};

const SCHERM = {
  keuze: "Bliepo's scherm 1,5 s rood (geen fout-geluidje); het vinkje gaat van de keuze; een rood rondje om de gekozen keuze zolang Bliepo hem noemt (nooit om het antwoord); dan de hint met de vraag in andere woorden (of kort wat het kind doet) en het kind mag opnieuw kiezen (alle 3 keuzes blijven, geen pijl)",
  ketting: "Bliepo's scherm 1,5 s rood (geen fout-geluidje); de kralen gaan terug naar beneden; bij de eerste kraal een rood rondje om de laatste kraal van de ketting zolang Bliepo hem noemt; dan de hint met wat het kind doet als nieuwe opdrachtzin (geen pijl)",
};

/** De zoek-hints die altijd kloppen: het stukje dat steeds terugkomt. */
const zoekBegin = (woord: string) => [
  woord === "ketting" ? "Zoek in de ketting het stukje dat steeds terugkomt." : "Zoek het stukje dat steeds terugkomt.",
  `Begin vooraan in de ${woord}. Zoek waar hetzelfde stukje weer begint.`,
  `Een patroon is een stukje dat steeds terugkomt. Zoek dat stukje in de ${woord}.`,
];
const hoeVaak = (wat: Wat) => {
  const e = wat === "kraal" ? "elke kleur" : "elke vorm";
  return [`Kijk hoe vaak ${e} achter elkaar komt.`, `Tel hoe vaak ${e} achter elkaar komt.`];
};
/** "In deze ketting komt elke kleur 2 keer achter elkaar." (alle) of "De driehoek en de cirkel komen steeds 2 keer achter elkaar." */
function paarUitleg(v: Keuzevraag): string[] {
  const n = namen(v.wat, v.kleur);
  const woord = rijWoord(v.wat);
  const dubbel = [...new Set(v.eenheid.filter((e, i) => v.eenheid[(i + 1) % v.eenheid.length] === e))];
  if (dubbel.length === new Set(v.eenheid).size) {
    const e = v.wat === "kraal" ? "elke kleur" : "elke vorm";
    return [`In deze ${woord} komt ${e} ${g(2, "wit")} keer achter elkaar.`, `Hier komt ${e} steeds ${g(2, "wit")} keer achter elkaar.`];
  }
  const wie = dubbel.map((d) => (v.wat === "kraal" ? n.kort(d) : `de ${n.kort(d)}`)).join(" en ");
  const ww = dubbel.length > 1 ? "komen" : "komt";
  const soorten = v.wat === "kraal" ? "kleuren" : "vormen";
  return [`${Hoofd(wie)} ${ww} steeds ${g(2, "wit")} keer achter elkaar.`, `Hier ${ww} ${wie} steeds ${g(2, "wit")} keer achter elkaar.`, `In deze ${woord} komen sommige ${soorten} ${g(2, "wit")} keer achter elkaar.`, `Sommige ${soorten} komen steeds ${g(2, "wit")} keer achter elkaar.`];
}

/** De fouttabel van 1 fout antwoord bij een keuzevraag (met alle varianten). */
export function keuzeFout(v: Keuzevraag, x: string): Fout {
  const n = namen(v.wat, v.kleur);
  const woord = rijWoord(v.wat);
  const andere = v.keuzes.filter((k) => k !== x);
  const X = wie(v.wat, x);
  const DIE = Die(v.wat, x);
  const basis = { denkfout: "", scherm: SCHERM.keuze, over: andere };
  const maak = (code: Denkfoutnaam, soort: string, V: Varianten, bewering: Bewering): Fout => ({
    ...basis,
    code,
    soort,
    denkfout: DENKFOUT_UITLEG[code],
    eerste: vast(V.eerste, v.nr),
    hint: vast(zonderDingUit(V.hint, vast(V.eerste, v.nr)), v.nr),
    uitleg: vast(V.uitleg, v.nr),
    weer: V.weerEerste.length ? [vast(V.weerEerste, v.nr), vast(zonderDingUit(V.weerUitleg, vast(V.weerEerste, v.nr)), v.nr)] : [],
    bewering,
    v: V,
  });
  const anders = v.wat === "kraal" ? "een andere kleur" : "iets anders";
  if (v.vorm === "gat") {
    const links = v.rij[v.plek - 1]!;
    const rechts = v.rij[v.plek + 1];
    const plekWoord = v.wat === "ding" ? "de pijl" : "de lege plek";
    const ding = v.wat === "kraal" ? "die kraal" : "dat";
    /* Een hint mag alleen zeggen "zoek eerder in de rij …" als dat er eerder echt ligt, en als daarna (of ervoor) in het
       patroon steeds hetzelfde komt (waarheidscontrole van het script, keuring Huisnummers). */
    const eerderNa = (a: string) => v.rij.slice(0, v.plek - 1).includes(a) && naVan(v.eenheid, a).size === 1;
    const eerderVoor = (a: string) => v.rij.slice(1, v.plek).some((e, i) => e === a && v.rij[i] !== null) && voorVan(v.eenheid, a).size === 1;
    const naHints = eerderNa(links) ? [`Zoek eerder in de ${woord} ${n.een(links)}. Kijk wat daarna komt.`, `Kijk links van ${plekWoord}. Zoek ${ding} eerder en kijk wat daarna komt.`] : [];
    const voorHints = rechts && eerderVoor(rechts) ? [`Zoek eerder in de ${woord} ${n.een(rechts)}. Kijk wat ervoor komt.`, `Kijk rechts van ${plekWoord}. Zoek ${ding} eerder en kijk wat ervoor komt.`] : [];
    const zoek = zoekBegin(woord);
    if (x === links && !naVan(v.eenheid, links).has(x)) {
      return maak("buur-herhaald", "buur-herhaald-links", {
        eerste: [`Je koos ${X}. ${DIE} ligt al links van ${plekWoord}.`, `${H(X)}? Links van ${plekWoord} ligt al ${hetzelfde(v.wat)}.`, `Je koos ${hetzelfde(v.wat)} als links van ${plekWoord}.`],
        hint: [...naHints, ...voorHints, ...zoek],
        uitleg: UITLEG.buur,
        weerEerste: ["Je koos weer hetzelfde als ernaast.", "Weer hetzelfde als ernaast, zie ik."],
        weerUitleg: [`Na ${n.noem(links)} komt in dit patroon steeds ${anders}.`, `Ernaast komt in dit patroon steeds ${anders}.`],
      }, { soort: "naast", kant: "links", x });
    }
    if (rechts && x === rechts && !voorVan(v.eenheid, rechts).has(x)) {
      return maak("buur-herhaald", "buur-herhaald-rechts", {
        eerste: [`Je koos ${X}. ${DIE} ligt al rechts van ${plekWoord}.`, `${H(X)}? Rechts van ${plekWoord} ligt al ${hetzelfde(v.wat)}.`, `Je koos ${hetzelfde(v.wat)} als rechts van ${plekWoord}.`],
        hint: [...voorHints, ...naHints, ...zoek],
        uitleg: UITLEG.buur,
        weerEerste: ["Je koos weer hetzelfde als ernaast.", "Weer hetzelfde als ernaast, zie ik."],
        weerUitleg: [`Vóór ${n.noem(rechts)} komt in dit patroon steeds ${anders}.`, `Ernaast komt in dit patroon steeds ${anders}.`],
      }, { soort: "naast", kant: "rechts", x });
    }
    return maak("verkeerde-volgorde", "verkeerde-volgorde", {
      eerste: [`Je koos ${X}. ${DIE} komt nooit na ${n.noem(links)}.`, `${H(X)}? Na ${n.noem(links)} komt in dit patroon iets anders.`, `Na ${n.noem(links)} komt in dit patroon nooit ${n.noemEen(x)}.`],
      hint: [...naHints, ...voorHints, ...zoek],
      uitleg: UITLEG.volgorde,
      weerEerste: [`Je koos weer iets dat niet na ${n.noem(links)} komt.`, `Ook dat komt niet na ${n.noem(links)}.`],
      weerUitleg: [`Daarna komt in dit patroon steeds ${zelfde(v.wat)}.`, UITLEG.volgorde[1]],
    }, { soort: "nooit-na", na: links, x });
  }
  /* De lege plek aan het eind ("na", "nu"). */
  const voor = voorPlek(v);
  const laatste = voor.at(-1)!;
  const reeks = eindReeks(voor);
  const na = naVan(v.eenheid, laatste);
  const laatsteWoord = v.wat === "kraal" ? "kraal" : v.wat === "vorm" ? "vorm" : "ding";
  const dieL = v.wat === "kraal" ? "die kleur" : v.wat === "vorm" ? "die vorm" : "dat";
  /* Kan er na het laatste meer dan 1 ding komen (een paar), dan helpt "zoek … en kijk wat daarna komt" niet: dan het stukje. */
  const eerderL = voor.slice(0, -1).includes(laatste) && na.size === 1;
  const naHints = eerderL ? [`Zoek eerder in de ${woord} ${n.een(laatste)}. Kijk wat daarna komt.`, `Kijk naar de laatste ${laatsteWoord}. Zoek ${dieL} eerder en kijk wat daarna komt.`] : [];
  const hints = na.size === 1 ? [...naHints, ...zoekBegin(woord)] : [...zoekBegin(woord), ...hoeVaak(v.wat)];
  const uitlegNa = na.size === 1 ? UITLEG.volgorde : paarUitleg(v);
  if (x === laatste) {
    const kl = kleurVan(v, x);
    const eerste =
      reeks >= 2
        ? [`Je koos ${X}. ${DIE} ligt al ${g(reeks, "wit")} keer aan het eind.`, `${H(X)}? Daarvan liggen er al ${g(reeks, kl)} aan het eind.`, `Je koos ${hetzelfde(v.wat)} als de laatste ${v.wat === "kraal" ? "kralen" : "vormen"}.`]
        : [`Je koos ${X}. ${DIE} ligt al aan het eind.`, `${H(X)}? ${DIE} ligt al aan het eind van de ${woord}.`, v.wat === "kraal" ? "Je koos dezelfde kleur als de laatste kraal." : `Je koos hetzelfde als aan het eind van de ${woord}.`];
    const anders2 = reeks >= 2 ? [`Na ${g(reeks, kl)} ${n.meer(x)} komt steeds iets anders.`, `Na ${g(reeks, kl)} ${n.meer(x)} komt er een nieuwe kleur.`] : [`Na ${n.noem(x)} komt in dit patroon steeds iets anders.`, `Daarna komt in dit patroon nooit weer ${n.noem(x)}.`];
    return maak("laatste-herhaald", "laatste-herhaald", {
      eerste,
      hint: hints,
      uitleg: uitlegNa,
      weerEerste: ["Je koos weer hetzelfde als aan het eind.", `Weer ${hetzelfde(v.wat)} als aan het eind, zie ik.`],
      weerUitleg: anders2,
    }, { soort: "eind-al", x, n: reeks });
  }
  if (na.has(x)) {
    const p = paarVoor(v.eenheid, x, laatste);
    const veel = `${g(p, kleurVan(v, laatste))} ${n.meer(laatste)}`;
    return maak("paar-vergeten", "paar-vergeten", {
      eerste: [`Je koos ${X}. ${DIE} komt pas na ${veel}.`, `${H(X)}? Daarvoor komen eerst ${veel}.`, `In dit patroon komt ${n.noem(x)} pas na ${veel}.`],
      hint: [...zoekBegin(woord), ...hoeVaak(v.wat)],
      uitleg: paarUitleg(v),
      weerEerste: [`Je koos weer ${n.een(x)}.`, `Weer ${X}, zie ik.`],
      weerUitleg: [`Aan het eind ligt nog maar ${g(1, kleurVan(v, laatste))} ${v.wat === "kraal" ? `${kwb(laatste as Kleur)} kraal` : n.kort(laatste)}.`, `Aan het eind ligt ${n.de(laatste)} nog alleen.`],
    }, { soort: "na-paar", x, voor: laatste, n: p });
  }
  return maak("verkeerde-volgorde", "verkeerde-volgorde", {
    eerste: [`Je koos ${X}. ${DIE} komt nooit na ${n.noem(laatste)}.`, `${H(X)}? Na ${n.noem(laatste)} komt in dit patroon iets anders.`, `Na ${n.noem(laatste)} komt in dit patroon nooit ${n.noemEen(x)}.`],
    hint: hints,
    uitleg: na.size === 1 ? UITLEG.volgorde : [...paarUitleg(v), UITLEG.volgorde[0]],
    weerEerste: [`Je koos weer iets dat niet na ${n.noem(laatste)} komt.`, `Ook dat komt niet na ${n.noem(laatste)}.`],
    weerUitleg: na.size === 1 ? [`Daarna komt in dit patroon steeds ${zelfde(v.wat)}.`, UITLEG.volgorde[1]] : [UITLEG.volgorde[1], UITLEG.volgorde[2]],
  }, { soort: "nooit-na", na: laatste, x });
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
  const nr = v.nr + i;
  const naHints = v.rij.includes(laatste) && na.size === 1 ? [`Zoek eerder in de ketting een ${kwb(laatste)} kraal. Kijk wat daarna komt.`, ...(i === 0 ? ["Kijk naar de laatste kraal. Zoek die kleur eerder en kijk wat daarna komt."] : [])] : [];
  const hint = [...naHints, ...zoekBegin("ketting")];
  const maak = (code: Denkfoutnaam, V: Varianten): Fout => ({
    scherm: SCHERM.ketting,
    over: andere,
    code,
    soort: code,
    denkfout: DENKFOUT_UITLEG[code],
    eerste: vast(V.eerste, nr),
    hint: vast(zonderDingUit(V.hint, vast(V.eerste, nr)), nr),
    uitleg: vast(V.uitleg, nr),
    weer: [vast(V.weerEerste, nr), vast(zonderDingUit(V.weerUitleg, vast(V.weerEerste, nr)), nr)],
    bewering: { soort: "ketting", plek: i, x, na: laatste },
    v: V,
  });
  if (x === laatste && !na.has(x)) {
    return maak("laatste-herhaald", {
      eerste: i === 0 ? [`Je sleepte eerst een ${kwb(x)} kraal. Die kleur ligt al aan het eind.`, `Eerst ${kw(x)}? Die kleur ligt al aan het eind van de ketting.`, "Je begon met dezelfde kleur als de laatste kraal."] : ["De eerste kraal klopt. Daarna sleepte je dezelfde kleur nog een keer.", "De eerste kraal is goed. Maar de tweede heeft dezelfde kleur."],
      hint,
      uitleg: UITLEG.volgorde,
      weerEerste: ["Je sleepte weer dezelfde kleur als ervoor.", "Weer dezelfde kleur als ervoor, zie ik."],
      weerUitleg: [`Na ${kw(laatste)} komt in dit patroon steeds een andere kleur.`, "In deze ketting komt na een kleur steeds een andere kleur."],
    });
  }
  return maak("verkeerde-volgorde", {
    eerste:
      i === 0
        ? [`Je sleepte eerst een ${kwb(x)} kraal. Die komt nooit na ${kw(laatste)}.`, `Eerst ${kw(x)}? Na ${kw(laatste)} komt in dit patroon iets anders.`, `Je begon met ${kw(x)}. Die kleur komt nooit na ${kw(laatste)}.`]
        : [`De eerste kraal klopt. Daarna sleepte je ${kw(x)}. Die kleur komt nooit na ${kw(laatste)}.`, `De eerste kraal is goed. Maar ${kw(x)} komt nooit na ${kw(laatste)}.`, `Goed begonnen! Maar na ${kw(laatste)} komt in dit patroon iets anders.`],
    hint,
    uitleg: UITLEG.volgorde,
    weerEerste: [`Je sleepte weer een kraal die niet na ${kw(laatste)} komt.`, `Ook die kraal komt niet na ${kw(laatste)}.`],
    weerUitleg: na.size === 1 ? ["Daarna komt in dit patroon steeds dezelfde kleur.", UITLEG.volgorde[1]] : [UITLEG.volgorde[1], UITLEG.volgorde[2]],
  });
}

/** De puzzel: een stukje op een plek waar het niet past (eigen invulling). De hint is de nieuwe opdracht (15.37). */
export const PUZZEL_FOUT = {
  code: "stukje-mis" as Denkfoutnaam,
  eerste: ["Dat stukje past daar niet.", "Daar hoort dat stukje niet.", "Op die plek past het stukje niet."],
  hint: ["Kijk naar de kleuren op het stukje. Sleep het naar de plek waar die kleuren passen.", "Kijk naar de randjes van het stukje. Sleep het naar een andere plek.", "Elk stukje heeft een eigen plek. Sleep het naar een andere plek."],
  uitleg: ["Een stukje klikt alleen vast op zijn eigen plek.", "Elk stukje hoort op een vaste plek in het plaatje."],
};

/** Na de 2e fout met een ander antwoord: niet 2 keer "Je koos …" achter elkaar (keuring Tellen en Splitsen). */
export const nuKoos = (z: string) => z.replace(/^Je koos /, "Nu koos je ").replace(/^Je sleepte /, "Nu sleepte je ").replace(/^Je begon /, "Nu begon je ");

/**
 * Wat Bliepo zegt bij een antwoord dat niet goed is, uit de varianten. De les en het fouttabel-script gebruiken allebei
 * deze functie, zodat het script precies naspeelt wat de les doet.
 *   1e keer: eerste zin (wat het kind koos) + hint (de hint noemt niet nog eens wat de eerste zin noemde).
 *   2e keer: bij 2 keer dezelfde denkfout "weer" + een andere uitleg; bij hetzelfde antwoord 2 keer "Je koos weer …" + de
 *   uitleg; anders de eerste zin (met "Nu koos je …") + de uitleg. Nooit een stuk dat niet in het tekstvak past.
 */
export function foutReactie(kies: Kies, f: Fout, poging: 1 | 2, eerder: Fout | null, zelfdeAntwoord: boolean, eersteZin: string, weerGekozen: string[]): string[] {
  const V = f.v;
  if (poging === 1) {
    const e = kies("eerste", passend(V.eerste));
    return [e, kies("hint", passend(zonderDingUit(V.hint, e)), (z) => !deeltStuk(e, z, 3))];
  }
  /* "Weer" alleen als Bliepo de 1e keer al zei wat er mis was. */
  if (eerder !== null && eerder.soort === f.soort && f.code !== "onduidelijk" && V.weerEerste.length > 0) {
    const w = kies("weer", V.weerEerste);
    return [w, kies("weerUitleg", passend(zonderDingUit(V.weerUitleg, w)), (z) => !deeltStuk(w, z, 3))];
  }
  if (zelfdeAntwoord) {
    const w = kies("weerGekozen", weerGekozen);
    return [w, kies("uitleg", passend(zonderDingUit(V.uitleg, w)), (z) => !deeltStuk(w, z, 3))];
  }
  const e = nuKoos(kies("eerste", passend(V.eerste), (z) => beginVan(nuKoos(z)) !== beginVan(eersteZin)));
  return [e, kies("uitleg", passend(zonderDingUit(V.uitleg, e)), (z) => !deeltStuk(e, z, 3))];
}

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
