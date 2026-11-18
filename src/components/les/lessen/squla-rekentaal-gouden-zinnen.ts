/**
 * ALLE ZINNEN VAN BLIEPO in de gouden les Rekentaal (squla-rekentaal-gouden, "Groot en klein, vol en leeg", 11 november
 * 2026), op één plek, met de FOUTTABEL. De les zelf (squla-rekentaal-gouden.tsx) bevat geen eigen zinnen.
 *
 *   - De rijtjes (lof, momenten, naam, goed na een fout, einde, eerste zin als de denkfout niet duidelijk is) zijn
 *     dezelfde als in de andere gouden lessen (BLIEPO-KARAKTER.md). Hier alleen de reactie bij deze les (in de geest van
 *     BLIEPO-KARAKTER.md §4 "Meten"), met zinnen zonder "Ja" voor na een lofzin met "Ja".
 *   - De inhoud (16 vragen: 8 in de keuken, 8 bij de picknick; dezelfde voorwerpen, maten, keuzes en goede antwoorden)
 *     is die van squla-rekentaal "Groot en klein, vol en leeg" (squla-rekentaal.tsx, BOUWREGELS 15.22).
 *   - GEEN SYNTHESIS-LES: Synthesis heeft geen tutorles over groot/klein, vol/leeg, zwaar/licht of lang/kort (KOPPELING.md
 *     §12: alleen het spel Less or More). Het skelet is exact dat van de andere gouden lessen (laag 1: LESRECEPT.md en
 *     BLIEPO-KARAKTER.md). Alles wat per onderwerp anders is (de denkfouten, de eerste zinnen, de hints, de uitleg en het
 *     samen voordoen) is "EIGEN INVULLING, NIET VAN SYNTHESIS" (BOUWREGELS 15.22, 15.25;
 *     SYNTHESIS-ANALYSE/DRAAIBOEKEN-NIEUW/rekentaal.md).
 *
 * BLIEPO ALS WARME JUF (Sara, 18 november 2026; zoals de proefles Tellen en de gouden lessen Vormen en Klok): elke zin
 * die terugkomt heeft een rijtje varianten. De les kiest er steeds 1 met de gedeelde kiezer (nooit-dubbel.ts): nooit 2
 * keer achter elkaar dezelfde zin, ook niet over vragen heen. "Je koos deze pannenkoek." en "Je koos deze beker." tellen
 * als dezelfde zin (de voorwerpen en rekenwoorden zijn wisselwoorden). Harde eisen (past in het tekstvak; geen woord 2 keer
 * in 1 reactie) worden vooraf uit het rijtje gehaald. Wat het kind koos, noemt Bliepo 1 keer per reactie. Na elke hint
 * komt de vraag terug in andere woorden (of de opdracht), zonder het antwoord (15.17, 15.37, F16). Oud naast nieuw:
 * WIJZIGINGEN-ZINNEN-REKENTAAL.md.
 *
 * Leesbare versie: FOUTTABEL-squla-rekentaal-gouden.md (maak hem opnieuw met `npx tsx scripts/fouttabel-rekentaal-gouden.ts`;
 * dat script doet ook de verklap-, waarheids- en herhaalcontrole, keurt ELKE variant en speelt de kiezer 20.000 keer na).
 *
 * Getallen: deze les heeft geen getallen in Bliepo's zinnen (de oude les ook bijna niet). Het script controleert dat er
 * geen kaal cijfer in een zin staat (14.20).
 */

import type { RekenDing } from "../vlakken/squla-rekentaal-keuken";
import type { Rijtje } from "./squla-klok-gouden-zinnen";
import { deeltStuk } from "./nooit-dubbel";

export {
  BEVESTIG,
  EINDE,
  EINDE_VEEL_FOUTEN,
  LOF,
  MOMENT,
  NAAM_GROET,
  NAAM_LOF,
  ONDUIDELIJK,
  ONDUIDELIJK_NOG_1_KEER,
  metNaam,
  type Rijtje,
} from "./squla-klok-gouden-zinnen";

const rij = (zinnen: string[], robot: number[] = []): Rijtje => ({ zinnen, robot });
const Hoofd = (z: string) => z[0].toUpperCase() + z.slice(1);

/* ---------- de 16 vragen van squla-rekentaal (zelfde volgorde, voorwerpen, maten, keuzes en goede antwoorden) ---------- */

/**
 * twee      kies uit 2 voorwerpen (groter, kleiner, vol, leeg, langer, korter);
 * weeg      kies op de weegschaal (zwaarder, lichter);
 * drie      kies uit 3 voorwerpen (het grootst, half vol, het kleinst, het langst, het kortst);
 * volgorde  3 voorwerpen op volgorde zetten, van klein naar groot (tik = naar de volgende plek).
 */
export type Soort = "twee" | "weeg" | "drie" | "volgorde";
export type Indeling = "rij" | "onder" | "weegschaal" | "volgorde";
export type Vraag = {
  nr: number;
  id: string;
  soort: Soort;
  /** Het voorwerp in de vraag ("pannenkoek") en of het een het-woord is ("dit glas", "dit broodje"). */
  ding: string;
  het: boolean;
  /** Het rekenwoord van de vraag ("groter", "het grootst", "half vol", "zwaarder"). */
  woord: string;
  /** De vraagzinnen van de oude les. */
  vraag: string[];
  indeling: Indeling;
  ondergrond: "tafel" | "kleed";
  zwaar?: string;
  /** De voorwerpen, met de ids en maten van de oude les (de les schudt de plek). */
  dingen: RekenDing[];
  /** Het goede antwoord: een id, of bij volgorde de ids van klein naar groot ("k,m,g"). */
  goed: string;
  /** Waarom het goed is (kort, zonder hoofdletter; voor de reactie na de lof). */
  reden: string;
  /**
   * Samen voordoen: Bliepo wijst de voorwerpen 1 voor 1 aan (rondje + zin, in varianten), daarna tikt het kind het goede.
   * De eerste variant van elk rijtje is de zin van vóór 18 november 2026.
   */
  samen: { intro?: string[]; stappen: [string, string[]][]; jij: string[]; klaar: string };
};

const d = (id: string, soort: RekenDing["soort"], naam: string, extra: Partial<RekenDing> = {}): RekenDing => ({ id, soort, naam, ...extra });

const STREEP_SLIERT = ["De slierten beginnen bij dezelfde streep.", "Kijk, de slierten beginnen op dezelfde plek."];
const STREEP_BROOD = ["De broodjes beginnen bij dezelfde streep.", "Kijk, de broodjes beginnen op dezelfde plek."];

export const VRAGEN: Vraag[] = [
  /* ---------- in de keuken ---------- */
  {
    nr: 1, id: "vraag1-groter", soort: "twee", ding: "pannenkoek", het: false, woord: "groter",
    vraag: ["Welke pannenkoek is groter?", "Tik erop."], indeling: "rij", ondergrond: "tafel",
    dingen: [d("k", "pannenkoek", "de kleine pannenkoek", { maat: 0.6 }), d("g", "pannenkoek", "de grote pannenkoek", { maat: 0.95 })], goed: "g",
    reden: "hij is breder dan de andere",
    samen: { stappen: [["k", ["Deze pannenkoek is klein.", "Kijk naar deze pannenkoek. Die is klein."]], ["g", ["En deze is groot.", "En deze is groot. Hij is veel breder."]]], jij: ["Tik jij op de grote pannenkoek?", "Tik jij erop?", "Nu jij! Tik in het rode rondje."], klaar: "Ja, deze pannenkoek is groter." },
  },
  {
    nr: 2, id: "vraag2-kleiner", soort: "twee", ding: "beker", het: false, woord: "kleiner",
    vraag: ["Welke beker is kleiner?"], indeling: "rij", ondergrond: "tafel",
    dingen: [d("g", "beker", "de grote beker", { maat: 1.05 }), d("k", "beker", "de kleine beker", { maat: 0.65 })], goed: "k",
    reden: "hij is lager en smaller dan de andere",
    samen: { stappen: [["g", ["Deze beker is groot.", "Kijk naar deze beker. Die is groot."]], ["k", ["En deze is klein.", "En deze is lager en smaller."]]], jij: ["Tik jij op de kleine beker?", "Tik jij erop?", "Nu jij! Tik in het rode rondje."], klaar: "Ja, deze beker is kleiner." },
  },
  {
    nr: 3, id: "vraag3-vol", soort: "twee", ding: "glas", het: true, woord: "vol",
    vraag: ["Welk glas is vol?"], indeling: "rij", ondergrond: "tafel",
    dingen: [d("leeg", "glas", "het lege glas", { vul: 0 }), d("vol", "glas", "het volle glas", { vul: 1 })], goed: "vol",
    reden: "het sap komt tot de rand",
    samen: { stappen: [["leeg", ["In dit glas zit niets.", "Kijk, dit glas is leeg."]], ["vol", ["En dit zit tot de rand vol.", "En hier komt het sap tot de rand."]]], jij: ["Tik jij op het volle glas?", "Tik jij erop?", "Nu jij! Tik in het rode rondje."], klaar: "Ja, dit glas is vol." },
  },
  {
    nr: 4, id: "vraag4-leeg", soort: "twee", ding: "glas", het: true, woord: "leeg",
    vraag: ["Welk glas is leeg?"], indeling: "rij", ondergrond: "tafel",
    dingen: [d("vol", "glas", "het volle glas", { vul: 1 }), d("leeg", "glas", "het lege glas", { vul: 0 })], goed: "leeg",
    reden: "er zit niets in",
    samen: { stappen: [["vol", ["In dit glas zit sap.", "Kijk, dit glas is vol."]], ["leeg", ["En hier zit niets in.", "En dit glas is helemaal leeg."]]], jij: ["Tik jij op het lege glas?", "Tik jij erop?", "Nu jij! Tik in het rode rondje."], klaar: "Ja, dit glas is leeg." },
  },
  {
    nr: 5, id: "vraag5-zwaarder", soort: "weeg", ding: "weegschaal", het: false, woord: "zwaarder",
    vraag: ["Kijk naar de weegschaal.", "Wat is zwaarder?"], indeling: "weegschaal", ondergrond: "tafel", zwaar: "meloen",
    dingen: [d("appel", "appel", "de appel"), d("meloen", "meloen", "de meloen", { maat: 0.8 })], goed: "meloen",
    reden: "die kant zakt naar beneden",
    samen: { stappen: [["meloen", ["Deze kant zakt naar beneden.", "Kijk, de meloen hangt laag."]], ["appel", ["De andere kant gaat omhoog.", "De appel gaat omhoog."]]], jij: ["Tik jij op de meloen?", "Tik jij erop?", "Nu jij! Tik in het rode rondje."], klaar: "Ja, de meloen is zwaarder." },
  },
  {
    nr: 6, id: "vraag6-lichter", soort: "weeg", ding: "weegschaal", het: false, woord: "lichter",
    vraag: ["Kijk naar de weegschaal.", "Wat is lichter?"], indeling: "weegschaal", ondergrond: "tafel", zwaar: "zak",
    dingen: [d("zak", "zak", "de zak meel", { maat: 0.8 }), d("aardbei", "aardbei", "de aardbei")], goed: "aardbei",
    reden: "die kant gaat omhoog",
    samen: { stappen: [["zak", ["Deze kant zakt naar beneden.", "Kijk, de zak meel hangt laag."]], ["aardbei", ["De andere kant gaat omhoog.", "De aardbei gaat omhoog."]]], jij: ["Tik jij op de aardbei?", "Tik jij erop?", "Nu jij! Tik in het rode rondje."], klaar: "Ja, de aardbei is lichter." },
  },
  {
    nr: 7, id: "vraag7-langer", soort: "twee", ding: "sliert", het: false, woord: "langer",
    vraag: ["Kijk naar de slierten spaghetti.", "Welke sliert is langer?"], indeling: "onder", ondergrond: "tafel",
    dingen: [d("kort", "sliert", "de korte sliert", { lengte: 330 }), d("lang", "sliert", "de lange sliert", { lengte: 640 })], goed: "lang",
    reden: "hij loopt verder door",
    samen: { intro: STREEP_SLIERT, stappen: [["kort", ["Deze sliert stopt eerder.", "Deze sliert houdt eerder op."]], ["lang", ["En deze loopt verder door.", "En deze gaat nog verder."]]], jij: ["Tik jij op de lange sliert?", "Tik jij erop?", "Nu jij! Tik in het rode rondje."], klaar: "Ja, deze sliert is langer." },
  },
  {
    nr: 8, id: "vraag8-korter", soort: "twee", ding: "sliert", het: false, woord: "korter",
    vraag: ["Welke sliert is korter?"], indeling: "onder", ondergrond: "tafel",
    dingen: [d("lang", "sliert", "de lange sliert", { lengte: 600 }), d("kort", "sliert", "de korte sliert", { lengte: 400 })], goed: "kort",
    reden: "hij stopt eerder",
    samen: { intro: STREEP_SLIERT, stappen: [["lang", ["Deze sliert loopt verder door.", "Deze sliert gaat ver door."]], ["kort", ["En deze stopt eerder.", "En deze houdt eerder op."]]], jij: ["Tik jij op de korte sliert?", "Tik jij erop?", "Nu jij! Tik in het rode rondje."], klaar: "Ja, deze sliert is korter." },
  },
  /* ---------- bij de picknick ---------- */
  {
    nr: 9, id: "vraag9-grootst", soort: "drie", ding: "mand", het: false, woord: "het grootst",
    vraag: ["Welke mand is het grootst?"], indeling: "rij", ondergrond: "kleed",
    dingen: [d("m", "mand", "de middelste mand", { maat: 0.85 }), d("g", "mand", "de grootste mand", { maat: 1.12 }), d("k", "mand", "de kleinste mand", { maat: 0.6 })], goed: "g",
    reden: "hij is hoger en breder dan alle andere",
    samen: { stappen: [["k", ["Deze mand is klein.", "Kijk, deze mand is klein."]], ["m", ["Die is groter.", "Die is al groter."]], ["g", ["En deze is het grootst.", "En deze is nog groter: het grootst."]]], jij: ["Tik jij op de grootste mand?", "Tik jij erop?", "Nu jij! Tik in het rode rondje."], klaar: "Ja, deze mand is het grootst." },
  },
  {
    nr: 10, id: "vraag10-halfvol", soort: "drie", ding: "glas", het: true, woord: "half vol",
    vraag: ["Welk glas is half vol?"], indeling: "rij", ondergrond: "kleed",
    dingen: [d("vol", "glas", "het volle glas", { vul: 1 }), d("leeg", "glas", "het lege glas", { vul: 0 }), d("half", "glas", "het halfvolle glas", { vul: 0.5 })], goed: "half",
    reden: "het sap komt tot de helft",
    samen: { stappen: [["vol", ["Dit glas is vol.", "Kijk, dit glas is helemaal vol."]], ["leeg", ["Dat is leeg.", "Daar zit niets in."]], ["half", ["En hier komt het sap tot de helft.", "En in dit glas komt het sap tot het midden."]]], jij: ["Tik jij op het halfvolle glas?", "Tik jij erop?", "Nu jij! Tik in het rode rondje."], klaar: "Ja, dit glas is half vol." },
  },
  {
    nr: 11, id: "vraag11-kleinst", soort: "drie", ding: "appel", het: false, woord: "het kleinst",
    vraag: ["Welke appel is het kleinst?"], indeling: "rij", ondergrond: "kleed",
    dingen: [d("g", "appel", "de grootste appel", { maat: 1.35 }), d("k", "appel", "de kleinste appel", { maat: 0.7 }), d("m", "appel", "de middelste appel", { maat: 1 })], goed: "k",
    reden: "hij is kleiner dan alle andere",
    samen: { stappen: [["g", ["Deze appel is groot.", "Kijk, deze appel is groot."]], ["m", ["Die is kleiner.", "Die is al kleiner."]], ["k", ["En deze is het kleinst.", "En deze is nog kleiner: het kleinst."]]], jij: ["Tik jij op de kleinste appel?", "Tik jij erop?", "Nu jij! Tik in het rode rondje."], klaar: "Ja, deze appel is het kleinst." },
  },
  {
    nr: 12, id: "vraag12-langst", soort: "drie", ding: "broodje", het: true, woord: "het langst",
    vraag: ["Welk broodje is het langst?"], indeling: "onder", ondergrond: "kleed",
    dingen: [d("k", "broodje", "het kortste broodje", { lengte: 300 }), d("l", "broodje", "het langste broodje", { lengte: 640 }), d("m", "broodje", "het middelste broodje", { lengte: 470 })], goed: "l",
    reden: "het loopt het verst door",
    samen: { intro: STREEP_BROOD, stappen: [["k", ["Dit broodje is kort.", "Kijk, dit broodje is kort."]], ["m", ["Dat is langer.", "Dat is al langer."]], ["l", ["En dit gaat het verst door.", "En dit is nog langer: het langst."]]], jij: ["Tik jij op het langste broodje?", "Tik jij erop?", "Nu jij! Tik in het rode rondje."], klaar: "Ja, dit broodje is het langst." },
  },
  {
    nr: 13, id: "vraag13-zwaarder", soort: "weeg", ding: "weegschaal", het: false, woord: "zwaarder",
    vraag: ["Kijk naar de weegschaal.", "Wat is zwaarder?"], indeling: "weegschaal", ondergrond: "kleed", zwaar: "meloen",
    dingen: [d("mand", "mand", "de lege mand", { maat: 0.8 }), d("meloen", "meloen", "de meloen", { maat: 0.6 })], goed: "meloen",
    reden: "zijn kant zakt naar beneden",
    samen: { stappen: [["mand", ["De mand is groot, maar hij gaat omhoog.", "Kijk, de mand is groot. Toch gaat hij omhoog."]], ["meloen", ["Aan de andere kant zakt de meloen omlaag.", "De meloen zakt naar beneden."]]], jij: ["Tik jij op de meloen?", "Tik jij erop?", "Nu jij! Tik in het rode rondje."], klaar: "Ja, de meloen is zwaarder." },
  },
  {
    nr: 14, id: "vraag14-kortst", soort: "drie", ding: "broodje", het: true, woord: "het kortst",
    vraag: ["Welk broodje is het kortst?"], indeling: "onder", ondergrond: "kleed",
    dingen: [d("m", "broodje", "het middelste broodje", { lengte: 450 }), d("l", "broodje", "het langste broodje", { lengte: 620 }), d("k", "broodje", "het kortste broodje", { lengte: 270 })], goed: "k",
    reden: "het stopt het eerst",
    samen: { intro: STREEP_BROOD, stappen: [["l", ["Dit broodje is lang.", "Kijk, dit broodje is lang."]], ["m", ["Dat is korter.", "Dat is al korter."]], ["k", ["En dit stopt het eerst.", "En dit is nog korter: het kortst."]]], jij: ["Tik jij op het kortste broodje?", "Tik jij erop?", "Nu jij! Tik in het rode rondje."], klaar: "Ja, dit broodje is het kortst." },
  },
  {
    nr: 15, id: "vraag15-volgorde-appels", soort: "volgorde", ding: "appel", het: false, woord: "van klein naar groot",
    vraag: ["Zet de appels op volgorde.", "Van klein naar groot.", "Tik eerst op de kleinste."], indeling: "volgorde", ondergrond: "kleed",
    dingen: [d("m", "appel", "de middelste appel", { maat: 0.95 }), d("g", "appel", "de grootste appel", { maat: 1.3 }), d("k", "appel", "de kleinste appel", { maat: 0.6 })], goed: "k,m,g",
    reden: "",
    samen: { stappen: [["k", ["Deze appel is het kleinst. Die komt vooraan.", "Kijk, deze appel is het kleinst. Die zet ik vooraan."]], ["m", ["Dan komt deze appel.", "Daarna komt deze appel."]]], jij: ["Tik jij op de grootste appel?", "Nu jij! Tik op de grootste appel.", "Tik jij in het rode rondje?"], klaar: "Ja, nu staan ze van klein naar groot." },
  },
  {
    nr: 16, id: "vraag16-volgorde-bekers", soort: "volgorde", ding: "beker", het: false, woord: "van klein naar groot",
    vraag: ["Zet de bekers op volgorde.", "Van klein naar groot.", "Tik eerst op de kleinste."], indeling: "volgorde", ondergrond: "kleed",
    dingen: [d("g", "beker", "de grootste beker", { maat: 0.95 }), d("k", "beker", "de kleinste beker", { maat: 0.45 }), d("m", "beker", "de middelste beker", { maat: 0.7 })], goed: "k,m,g",
    reden: "",
    samen: { stappen: [["k", ["Deze beker is het kleinst. Die komt vooraan.", "Kijk, deze beker is het kleinst. Die zet ik vooraan."]], ["m", ["Dan komt deze beker.", "Daarna komt deze beker."]]], jij: ["Tik jij op de grootste beker?", "Nu jij! Tik op de grootste beker.", "Tik jij in het rode rondje?"], klaar: "Ja, nu staan ze van klein naar groot." },
  },
];

/** "deze pannenkoek", "dit glas", of op de weegschaal de naam ("de meloen"). */
export const ditDing = (v: Vraag, id: string): string => {
  if (v.soort === "weeg") return v.dingen.find((x) => x.id === id)?.naam ?? "dit";
  return `${v.het ? "dit" : "deze"} ${v.ding}`;
};
/** De naam van een voorwerp (aria-label en testantwoord): "de grote pannenkoek". */
export const naamVan = (v: Vraag, id: string) => v.dingen.find((x) => x.id === id)?.naam ?? id;
/** Het meervoud van het voorwerp ("appels", "glazen", "broodjes"). */
const MEERVOUD: Record<string, string> = { appel: "appels", beker: "bekers", glas: "glazen", broodje: "broodjes", mand: "manden", sliert: "slierten", pannenkoek: "pannenkoeken" };
export const meervoud = (v: Vraag) => MEERVOUD[v.ding] ?? `${v.ding}en`;
/** De vraagzin (met vraagteken) van een vraag. */
export const vraagZin = (v: Vraag) => v.vraag.find((z) => z.endsWith("?")) ?? "";

/* ---------- tekstvak, woorden en wisselwoorden ---------- */

/** Zonder kleurcode: {2:wit} wordt 2. */
export const kaal = (z: string) => z.replace(/\{([^}:]+):[a-zA-Z]+\}/g, "$1");
/** Zo lang mag 1 stuk tekst zijn (wat Bliepo in 1 keer zegt): dan past het in het tekstvak (15.30; ± 110 tekens is bij de
    andere gouden lessen het langste dat past). */
export const MAX_STUK = 110;
export const lengte = (...zinnen: string[]) => kaal(zinnen.filter(Boolean).join(" ")).length;
/** Harde eis: alleen varianten die passen (samen met `rest` in 1 stuk). Past er geen, dan de kortste. */
export const passend = (zinnen: readonly string[], ...rest: string[]): string[] => {
  const over = zinnen.filter((z) => lengte(...rest, z) <= MAX_STUK);
  return over.length ? over : [[...zinnen].sort((a, b) => lengte(a) - lengte(b))[0]];
};

/** De woorden die in dezelfde zin wisselen (voor de kiezer): voorwerpen, meervouden, rekenwoorden en hun vormen. */
export const WISSELWOORDEN: string[] = [
  ...new Set([
    ...VRAGEN.flatMap((v) => [v.ding, meervoud(v), v.woord, ...v.dingen.map((x) => x.naam), ...v.dingen.map((x) => x.soort)]),
    "zak meel", "deze", "dit", "die", "dat", "hij", "het",
    "groot", "grote", "groter", "grootste", "klein", "kleine", "kleiner", "kleinste", "lang", "lange", "langer", "langste",
    "kort", "korte", "korter", "kortste", "vol", "volle", "leeg", "lege", "halfvolle", "middelste", "zwaarder", "lichter",
    "hoger", "lager", "omhoog", "omlaag", "hoog", "laag", "eerder", "verder", "grootst", "kleinst", "langst", "kortst",
  ]),
];

/** Kleine woordjes die in 1 reactie wel 2 keer mogen (LESRECEPT, geleerd bij Rekentaal: de herhaalcontrole). */
export const KLEIN = new Set("de het een en is in op je ze die dat dit deze er van niet nog dan zo als hij met tot maar naar wat hier daar zit al bij hoe waar welke welk".split(" "));
export const woordenVan = (t: string) => kaal(t).toLowerCase().split(/[^a-zà-ÿ0-9]+/).filter(Boolean);
const zinnenVan = (t: string) => kaal(t).split(/(?<=[.!?])\s+/).filter(Boolean);

/**
 * Herhaalcontrole van 1 reactie (LESRECEPT, geleerd bij Rekentaal): geen woord 2 keer, behalve kleine woordjes en de
 * woorden van de vraag zelf; geen getal 2 keer; niet 2 keer hetzelfde woord achter elkaar. Geeft de reden, of null.
 * De les gebruikt dit als harde eis bij het kiezen; het fouttabel-script keurt er elke combinatie mee.
 */
export function dubbelIn(v: Vraag, delen: string[]): string | null {
  const vraagWoorden = new Set(woordenVan(v.vraag.join(" ")));
  const gezien = new Map<string, number>();
  for (const w of delen.flatMap(woordenVan)) gezien.set(w, (gezien.get(w) ?? 0) + 1);
  for (const [w, n] of gezien) {
    if (n < 2) continue;
    if (/^\d+$/.test(w)) return `getal ${w} 2 keer`;
    if (KLEIN.has(w) || vraagWoorden.has(w)) continue;
    return `"${w}" ${n} keer`;
  }
  const zinnen = delen.flatMap(zinnenVan);
  for (let i = 1; i < zinnen.length; i++) {
    const a = woordenVan(zinnen[i - 1]).at(-1);
    const b = woordenVan(zinnen[i])[0];
    if (a && b && a === b && !KLEIN.has(a)) return `"${a}" 2 keer achter elkaar`;
  }
  return null;
}
/** Harde eis: alleen varianten die samen met wat ervoor kwam geen woord 2 keer zeggen (is er geen, dan allemaal). */
export const zonderDubbel = (v: Vraag, zinnen: readonly string[], ...ervoor: string[]): string[] => {
  const over = zinnen.filter((z) => !dubbelIn(v, [...ervoor, z]));
  return over.length ? over : [...zinnen];
};
/** Wens: ook geen woord van de vraag 2 keer (alleen kleine woordjes). */
export const geenWoordGedeeld = (a: string, b: string) => {
  const A = new Set(woordenVan(a).filter((w) => !KLEIN.has(w)));
  return !woordenVan(b).some((w) => !KLEIN.has(w) && A.has(w));
};
/** Het begin van een zin (de eerste 2 woorden), om niet 2 keer achter elkaar "Je koos …" te zeggen. */
export const beginVan = (z: string) => kaal(z).toLowerCase().replace(/\d+/g, "#").split(/[.!?,:]/)[0].trim().split(/\s+/).slice(0, 2).join(" ");

/** De kiezer van de les (nooit-dubbel.ts): kiest 1 zin uit een rijtje, nooit 2 keer achter elkaar dezelfde. */
export type Kies = (sleutel: string, zinnen: readonly string[], mag?: (z: string) => boolean) => string;

/* ---------- de vraag (de vraagzinnen van de oude les) ---------- */

/** De kijk-zin vóór de vraag ("Kijk naar de weegschaal."): in varianten, zodat vraag 5 en 6 niet 2 keer hetzelfde beginnen. */
const KIJK_INTRO: Record<string, string[]> = {
  "Kijk naar de weegschaal.": ["Kijk naar de weegschaal.", "Kijk goed naar de weegschaal.", "Hier staat een weegschaal."],
  "Kijk naar de slierten spaghetti.": ["Kijk naar de slierten spaghetti.", "Hier liggen slierten spaghetti."],
};
/** Op volgorde 2 keer achter elkaar: de 2e keer met "En nu …" (niet 2 keer precies dezelfde zinnen; de schoolterm blijft). */
const NOG_EEN_VOLGORDE = (v: Vraag) => [`En nu de ${meervoud(v)}.`, "Zet ze ook op volgorde, van klein naar groot.", `Tik eerst op de kleinste ${v.ding}.`];
/** Wat Bliepo bij de vraag zegt: de zinnen van de oude les, met de kijk-zin in varianten. */
export function vraagZinnen(v: Vraag, kies: Kies): string[] {
  const vorige = VRAGEN[VRAGEN.indexOf(v) - 1];
  if (v.soort === "volgorde" && vorige?.soort === "volgorde") return NOG_EEN_VOLGORDE(v);
  return v.vraag.map((z) => (KIJK_INTRO[z] ? kies(`intro-${z}`, KIJK_INTRO[z]) : z));
}
/** Alle mogelijke vraagzinnen van een vraag (voor het script). */
export const alleVraagZinnen = (v: Vraag): string[][] => {
  const vorige = VRAGEN[VRAGEN.indexOf(v) - 1];
  if (v.soort === "volgorde" && vorige?.soort === "volgorde") return [NOG_EEN_VOLGORDE(v)];
  const eerst = KIJK_INTRO[v.vraag[0]];
  return eerst ? eerst.map((i) => [i, ...v.vraag.slice(1)]) : [v.vraag];
};

/**
 * Na de hint van de 1e fout: de vraag in andere woorden, of bij op volgorde de opdracht (15.37, F16). Nooit precies de
 * vraagzin van de 1e keer (die klonk net al), en nooit het antwoord (15.17).
 */
export function opnieuwVan(v: Vraag): string[] {
  if (v.soort === "volgorde") return [`Zet de ${meervoud(v)} van klein naar groot.`, "Zet ze nu van klein naar groot.", "Tik ze aan van klein naar groot."];
  const vz = vraagZin(v);
  if (v.soort === "weeg") return [`${vz.slice(0, -1)}, denk je?`, `Tik op wat ${v.woord} is.`, `Kies wat ${v.woord} is.`];
  const lw = `${v.het ? "het" : "de"} ${v.ding} ${v.het ? "dat" : "die"} ${v.woord} is`;
  return [`${vz.slice(0, -1)}, denk je?`, `Tik op ${lw}.`, `Kies ${lw}.`];
}

/* ---------- vaste zinnen van het verloop (laag 1 van de gouden lessen; eigen woorden, in varianten) ---------- */

export const ZIN = {
  /** Het begin (geen startvraag: er is geen draaiboek met een startvraag). Samen met de groet 1 stuk; in beeld een grote en
      een kleine pannenkoek. */
  start: ["Vandaag leren we rekenwoorden. Kijk: een grote en een kleine pannenkoek.", "We gaan samen rekenwoorden leren, zoals groot en klein, vol en leeg.", "Vandaag leren we woorden als groot en klein, vol en leeg."],
  /** Van de keuken naar de picknick (de oude les); 2 stukken. */
  picknick: [["De keuken is klaar.", "Nu gaan we picknicken in het park."], ["Klaar in de keuken!", "Kom, we gaan picknicken in het park."], ["Dat was de keuken.", "Nu gaan we naar het park. Daar picknicken we."]] as [string, string][],
  vraagZinnen,
  opnieuwVan,
  /** 2e fout: Bliepo doet het samen voor (eigen invulling; "Ik help je even" is van Synthesis). */
  samen: ["Kom, we kijken samen.", "We zoeken het samen.", "Kom, samen lukt het.", "Ik help je even. We kijken samen.", "Geeft niks. We zoeken het samen."],
  /** Vangnet (20 s niets of 3 keer iets anders): Bliepo doet de laatste stap zelf, zonder "Ja". */
  zelf: (klaar: string) => klaar.replace(/^Ja, /, "Kijk, "),
  /** Op volgorde: 45 s niets nagekeken; dan doen we het samen (zoals slepen bij de gouden les Dagen). Er zit al "samen" of
      "help" in: daarna niet nog eens "Kom, we kijken samen.". */
  volgVangnet: ["Ik help je met deze.", "Kom, we zetten ze samen op volgorde.", "Geeft niks. We doen het samen."],
  /** Het hulphandje bij de kleine stap (het rondje staat om het goede voorwerp). */
  handDing: ["Tik in het rode rondje.", "Tik maar in het rode rondje.", "Hier is het. Tik in het rode rondje."],
  /** Het hulphandje bij op volgorde zetten: bij de eerste lege plek (nooit op het goede voorwerp, 15.17). */
  handVolgorde: (v: Vraag) => [`Tik op een ${v.ding}. Die komt dan hier.`, `Tik maar op een ${v.ding}. Die komt dan hier.`, `Hier is een lege plek. Tik op een ${v.ding}.`],
  /** Hetzelfde foute antwoord 2 keer: niet 2 keer dezelfde eerste zin (geleerd bij Tellen). */
  weerGekozen: (v: Vraag, x: string) =>
    v.soort === "volgorde" ? ["Je zette ze weer in dezelfde volgorde.", "Weer dezelfde volgorde, zie ik."] : [`Je koos weer ${ditDing(v, x)}.`, `Weer ${ditDing(v, x)}, zie ik.`, `Je tikte weer op ${ditDing(v, x)}.`],
  /** Samen voordoen: de stappen, de kleine stap van het kind, en klaar (in varianten). */
  samenKlaar: (v: Vraag) =>
    v.soort === "volgorde"
      ? [v.samen.klaar, "Precies, eerst de kleinste en als laatste de grootste.", "Zo is het: klein, groter, het grootst."]
      : [v.samen.klaar, `Precies! ${Hoofd(v.reden)}.`, `Zo is het: ${ditDing(v, v.goed)} is ${v.woord}.`],
  samenZelf: (v: Vraag) =>
    v.soort === "volgorde" ? [ZIN_ZELF(v.samen.klaar), "Kijk, zo staan ze goed: van klein naar groot."] : [ZIN_ZELF(v.samen.klaar), `Kijk, ${v.reden}.`],
  /** Het einde. */
  slot: ["Nu ken je veel rekenwoorden.", "Jij kent nu veel rekenwoorden.", "Nu weet jij wat al die rekenwoorden betekenen."],
  kaartTik: ["Tik op de kaart.", "Tik maar op de kaart.", "Kijk, een kaart voor jou! Tik erop."],
};
function ZIN_ZELF(klaar: string) {
  return klaar.replace(/^Ja, /, "Kijk, ");
}

/** Aanmoediging bij het hulphandje (het kind moet tikken, niet nadenken; 14.35, geleerd bij Tellen). */
export const AANMOEDIG_DOEN = ["Je bent goed bezig.", "Jij kunt dit.", "Het gaat goed zo.", "Probeer het maar.", "Toe maar, je doet het goed."];

/* ---------- reactie na de lof (BLIEPO-KARAKTER.md §4 Meten, plus zinnen zonder "Ja") ---------- */

/** De robotzin (index 4) hooguit 1 keer per les. Zin 0 en 1 beginnen met "Ja"; 5 en 6 zijn erbij sinds 18 november 2026.
    Elk rijtje heeft dezelfde volgorde, zodat de les "niet 2 keer dezelfde zin achter elkaar" over de vragen heen bewaakt. */
export function rekenReactie(v: Vraag): Rijtje {
  if (v.soort === "volgorde")
    return rij(["Ja, van klein naar groot.", "Ja, eerst de kleinste en als laatste de grootste.", "Klein, groter, het grootst.", `Nu staan de ${meervoud(v)} van klein naar groot.`, "Nagekeken: ze staan echt van klein naar groot.", "Precies, zo staan ze goed.", "Dat klopt: de grootste staat achteraan."], [4]);
  const wie = ditDing(v, v.goed);
  return rij([`Ja, ${wie} is ${v.woord}.`, `Ja, ${v.reden}.`, `${Hoofd(v.reden)}.`, `${Hoofd(wie)} is ${v.woord}.`, `Nagekeken: ${wie} is echt ${v.woord}.`, `Precies, ${wie} is ${v.woord}.`, `Dat klopt: ${v.reden}.`], [4]);
}
export const REACTIE_JA = [0, 1];
export const REACTIE_ROBOT = 4;

/* ---------- denkfouten (eigen invulling, niet van Synthesis; namen voor de voortgang) ---------- */

export const DENKFOUTEN = [
  "groot-klein-verwisseld",
  "vol-leeg-verwisseld",
  "zwaar-licht-verwisseld",
  "lang-kort-verwisseld",
  "middelste-gekozen",
  "helemaal-vol",
  "leeg-in-plaats-van-half",
  "grootste-gekozen",
  "groot-naar-klein",
  "niet-bij-kleinste",
  "grootste-in-het-midden",
  "onduidelijk",
] as const;
export type Denkfoutnaam = (typeof DENKFOUTEN)[number];

export const DENKFOUT_UITLEG: Record<Denkfoutnaam, string> = {
  "groot-klein-verwisseld": "koos het andere uiterste: het kleine bij groot(er/st), het grote bij klein(er/st)",
  "vol-leeg-verwisseld": "koos het lege glas bij vol, of het volle bij leeg",
  "zwaar-licht-verwisseld": "koos op de weegschaal de andere kant (de kant die omhoog gaat bij zwaarder, die zakt bij lichter)",
  "lang-kort-verwisseld": "koos het andere uiterste: het korte bij lang(er/st), het lange bij kort(er/st)",
  "middelste-gekozen": "koos het voorwerp dat qua maat in het midden zit, niet het grootste of kleinste, langste of kortste",
  "helemaal-vol": "koos het volle glas bij half vol",
  "leeg-in-plaats-van-half": "koos het lege glas bij half vol",
  "grootste-gekozen": "koos op de weegschaal het grootste voorwerp (de lege mand), terwijl die kant omhoog gaat",
  "groot-naar-klein": "zette ze precies andersom: van groot naar klein",
  "niet-bij-kleinste": "begon niet met de kleinste",
  "grootste-in-het-midden": "begon goed met de kleinste, maar zette daarna de grootste",
  onduidelijk: "niet duidelijk: geen reden verzonnen",
};

/** Wat een zin beweert over de keuzes (voor de verklapcontrole van het script, 15.17): welke keuzes erna nog kunnen. */
export type Bewering = { soort: "alleen-c" } | { soort: "volgorde" };

/**
 * Alle varianten bij 1 fout antwoord (18 november 2026); de les kiest er steeds 1 (nooit 2 keer achter elkaar dezelfde).
 *   eerste      1e keer: wat het kind koos + iets waars daarover (nooit het antwoord);
 *   hint        1e keer: hoe je kijkt; daarna komt de vraag in andere woorden (opnieuwVan);
 *   uitleg      2e keer (daarna samen voordoen): geen opdracht;
 *   weerEerste / weerUitleg   2 keer dezelfde denkfout met een ander antwoord (alleen bij op volgorde).
 */
export type Varianten = { eerste: string[]; hint: string[]; uitleg: string[]; weerEerste: string[]; weerUitleg: string[] };

export type Fout = {
  code: Denkfoutnaam;
  /** Welke uitleg bij de 2e fout hoort (dezelfde soort 2 keer met een ander antwoord = "weer"). */
  soort: string;
  denkfout: string;
  /** Voor de fouttabel: 1 vaste variant van elk rijtje (de les kiest uit `v`). `hint` = de hint + de vraag opnieuw. */
  eerste: string;
  hint: string;
  uitleg: string;
  weer: string[];
  scherm: string;
  /** Het rode rondje bij de eerste zin: om wat het kind koos (of om wat op de verkeerde plek staat). Nooit om het antwoord. */
  rondje: string | null;
  bewering: Bewering;
  /** Welke keuzes de eerste zin en de hint nog toelaten (voor de verklapcontrole van het script, 15.17). */
  over: string[];
  v: Varianten;
};

/** De vaste variant voor de fouttabel (per vraag een andere, zodat de tabel er verschillende laat zien). */
const vast = <T,>(lijst: T[], nr: number) => lijst[nr % lijst.length];

const SCHERM = {
  kies: "Bliepo's scherm 1,5 s rood (geen fout-geluidje); het vinkje gaat weg; een rood rondje om wat het kind koos zolang Bliepo het noemt (nooit om het antwoord); dan de hint met de vraag in andere woorden en het kind mag opnieuw kiezen (alle voorwerpen blijven staan, geen pijl)",
  volgorde: "Bliepo's scherm 1,5 s rood (geen fout-geluidje); een rood rondje om het voorwerp dat als eerste op een verkeerde plek staat; dan gaan alle voorwerpen terug naar boven, de hint met de opdracht is de nieuwe opdracht en het kind zet ze opnieuw (geen pijl)",
};

/**
 * De hints per vraag (hoe je kijkt, niet waar het antwoord staat; 15.17). De vraag komt er daarna in andere woorden achter
 * (opnieuwVan). Keuring 11 november 2026: geen "vergelijk" (WOORDEN-GROEP3.md).
 */
const HINTS: Record<number, string[]> = {
  1: ["Kijk van rand tot rand hoe breed ze zijn.", "Kijk hoe breed elke pannenkoek is.", "Kijk goed naar allebei de pannenkoeken."],
  2: ["Kijk hoe hoog en hoe breed ze zijn.", "Kijk goed naar allebei de bekers.", "Kijk welke beker minder hoog komt."],
  3: ["Kijk hoe hoog het sap komt.", "Zoek sap tot aan de rand.", "Kijk goed in allebei de glazen."],
  4: ["Kijk waar geen sap in zit.", "Zoek waar niets in zit.", "Kijk goed in allebei de glazen."],
  5: ["Iets zwaars trekt de weegschaal omlaag.", "Kijk welke kant van de weegschaal zakt.", "Kijk welke schaal lager hangt.", "Zoek de schaal die het laagst is."],
  6: ["Iets lichts gaat omhoog op de weegschaal.", "Kijk welke kant van de weegschaal omhoog gaat.", "Kijk welke schaal hoger hangt.", "Zoek de schaal die het hoogst is."],
  7: ["Ze beginnen bij dezelfde streep.", "Kijk waar elke sliert ophoudt.", "Volg elke sliert met je ogen tot het eind."],
  8: ["Kijk welke sliert als eerste ophoudt.", "Ze beginnen bij dezelfde streep.", "Volg elke sliert met je ogen tot het eind."],
  9: ["Kijk hoe hoog en hoe breed ze zijn.", "Kijk goed naar alle manden.", "Kijk welke mand het hoogst komt."],
  10: ["Kijk tot waar het sap komt.", "Zoek sap tot de helft.", "Kijk goed in alle glazen."],
  11: ["Kijk hoe hoog en hoe breed ze zijn.", "Kijk goed naar alle appels.", "Kijk welke appel het minst hoog komt."],
  12: ["Kijk waar ze allemaal stoppen.", "Ze beginnen bij dezelfde streep.", "Volg elk broodje met je ogen tot het eind."],
  13: ["Iets groots is niet altijd zwaar.", "Kijk welke kant van de weegschaal zakt.", "Kijk welke schaal lager hangt.", "Zoek de schaal die het laagst is."],
  14: ["Ze beginnen bij dezelfde streep.", "Kijk waar ze allemaal stoppen.", "Kijk welk broodje als eerste ophoudt."],
};
/** De hint bij op volgorde zetten hoort bij de denkfout (keuring 11 november 2026: wie al met de kleinste begon, heeft
    niets aan "Begin met de kleinste"). Daarna komt de opdracht (opnieuwVan). */
const hintVolgorde = (v: Vraag, code: Denkfoutnaam): string[] => {
  if (code === "grootste-in-het-midden") return ["Tik steeds op de kleinste die nog over is.", "Pak steeds de kleinste die nog over is.", "Kijk na elke tik welke nu het kleinst is."];
  if (code === "niet-bij-kleinste") return ["Kijk welke het kleinst is.", "Zoek eerst de kleinste.", `Kijk goed welke ${v.ding} het kleinst is.`];
  return ["Begin met de kleinste en pak dan steeds een grotere.", "De kleinste komt eerst, de grootste als laatste.", "Begin bij de kleinste. Pak daarna steeds een grotere."];
};

/** Welke denkfout bij een fout antwoord hoort (vaste regel, zodat het script elke combinatie kan nalopen). */
export function denkfoutVan(v: Vraag, x: string): Denkfoutnaam {
  if (v.soort === "volgorde") {
    const [a, b] = x.split(",");
    if (x === "g,m,k") return "groot-naar-klein";
    if (a !== "k") return "niet-bij-kleinste";
    return b === "g" ? "grootste-in-het-midden" : "onduidelijk";
  }
  if (v.nr === 13) return "grootste-gekozen";
  if (v.soort === "weeg") return "zwaar-licht-verwisseld";
  if (v.nr === 10) return x === "vol" ? "helemaal-vol" : "leeg-in-plaats-van-half";
  if (v.nr === 3 || v.nr === 4) return "vol-leeg-verwisseld";
  if (v.soort === "drie" && x === "m") return "middelste-gekozen";
  return v.ding === "sliert" || v.ding === "broodje" ? "lang-kort-verwisseld" : "groot-klein-verwisseld";
}

/**
 * Wat Bliepo over het gekozen voorwerp zegt (2e deel van de eerste zin), per vraag en denkfout: [na "Je koos …", na
 * "Deze …?", na "Je tikte op …"]. Een lege 3e = alleen "Je tikte op <de naam>." (dan zegt de naam zelf al wat het is).
 * De uitleg bij de 2e fout en de "weer"-zinnen (alleen bij op volgorde).
 */
function tekst(v: Vraag, code: Denkfoutnaam): { eig: [string, string, string]; uitleg: string[]; weer?: [string[], string[]] } {
  const t = (eig: [string, string, string], uitleg: string[], weer?: [string[], string[]]) => ({ eig, uitleg, weer });
  switch (v.nr) {
    case 1: return t(["Hij is kleiner dan de andere.", "Die is kleiner dan de andere.", ""], ["Groter betekent hier: hij is breder.", "Een grotere pannenkoek is breder."]);
    case 2: return t(["Hij is hoger en breder dan de andere.", "Die is groter dan de andere.", ""], ["Kleiner betekent: lager en smaller.", "Een kleine beker is niet zo hoog en niet zo breed."]);
    case 3: return t(["Het is leeg.", "Daar zit niets in.", ""], ["Vol betekent: het sap komt tot de rand.", "In een vol glas komt het sap tot bovenaan."]);
    case 4: return t(["Het is vol.", "Daar zit sap in.", ""], ["Leeg betekent: er zit niets in.", "In een leeg glas zit helemaal niets."]);
    case 5: return t(["Die hangt hoger.", "Die gaat omhoog.", "Die kant staat hoog."], ["Wat zwaarder is, zakt naar beneden.", "De zware kant van de weegschaal zakt naar beneden.", "Hoe zwaarder iets is, hoe lager het hangt."]);
    case 6: return t(["Die hangt lager.", "Die gaat omlaag.", "Die kant staat laag."], ["Wat lichter is, gaat omhoog.", "De lichte kant van de weegschaal gaat omhoog.", "Hoe lichter iets is, hoe hoger het hangt.", "Iets lichts blijft boven hangen."]);
    case 7: return t(["Die stopt eerder.", "Die houdt eerder op.", ""], ["Langer betekent: hij loopt verder door.", "Een langere sliert gaat verder door."]);
    case 8: return t(["Die loopt verder door.", "Die is langer dan de andere.", ""], ["Korter betekent: hij stopt eerder.", "Een kortere sliert houdt eerder op."]);
    case 9: return code === "middelste-gekozen"
      ? t(["Die is niet de grootste.", "Die is niet het grootst.", ""], ["Een andere mand is nog groter.", "Er staat een mand die nog groter is."])
      : t(["Dat is de kleinste.", "Die is het kleinst van allemaal.", ""], ["Het grootst betekent: groter dan alle andere.", "Het grootst is groter dan alle andere manden."]);
    case 10: return code === "helemaal-vol"
      ? t(["Dat is helemaal vol.", "Dat zit tot bovenaan vol.", ""], ["Half vol is niet tot de rand, maar tot de helft.", "Bij half vol komt het sap tot het midden."])
      : t(["Daar zit niets in.", "Dat is helemaal leeg.", ""], ["Bij half vol komt het sap tot de helft.", "In een glas dat half vol is, komt het sap tot het midden."]);
    case 11: return code === "middelste-gekozen"
      ? t(["Die is niet de kleinste.", "Die is niet het kleinst.", ""], ["Een andere appel is nog kleiner.", "Er ligt een appel die nog kleiner is."])
      : t(["Dat is de grootste.", "Die is het grootst van allemaal.", ""], ["Het kleinst betekent: kleiner dan alle andere.", "Het kleinst is kleiner dan alle andere appels."]);
    case 12: return code === "middelste-gekozen"
      ? t(["Dat is niet het langste.", "Dat is niet het langst.", ""], ["Een ander broodje loopt nog verder door.", "Er ligt een broodje dat nog verder doorloopt."])
      : t(["Dat is het kortste.", "Dat stopt het eerst.", ""], ["Het langst betekent: langer dan alle andere.", "Het langst is langer dan alle andere broodjes."]);
    case 13: return t(["Die is groot, maar hangt hoger.", "Die is groot, maar gaat omhoog.", "Die kant staat hoog."], ["De zware kant van de weegschaal zakt naar beneden.", "Wat zwaarder is, zakt naar beneden.", "Hoe zwaarder iets is, hoe lager het hangt."]);
    case 14: return code === "middelste-gekozen"
      ? t(["Dat is niet het kortste.", "Dat is niet het kortst.", ""], ["Een ander broodje stopt nog eerder.", "Er ligt een broodje dat nog eerder stopt."])
      : t(["Dat is het langste.", "Dat loopt het verst door.", ""], ["Het kortst betekent: korter dan alle andere.", "Het kortst is korter dan alle andere broodjes."]);
  }
  /* Op volgorde. */
  if (code === "groot-naar-klein") return t(["", "", ""], ["Van klein naar groot: de kleinste staat vooraan.", "Van klein naar groot betekent: eerst de kleinste, dan steeds een grotere.", "De kleinste hoort helemaal aan het begin."]);
  if (code === "niet-bij-kleinste") return t(["", "", ""], ["De kleinste hoort vooraan.", "Van klein naar groot begint altijd met de kleinste."], [["Weer stond de kleinste niet vooraan.", "Ook nu stond de kleinste niet vooraan."], ["Van klein naar groot: je begint links.", "Je begint links, met de kleinste."]]);
  return t(["", "", ""], ["Na de kleinste komt eerst de middelste.", "De middelste hoort direct na de kleinste."]);
}

/** De fouttabel van 1 fout antwoord. `x` = het gekozen voorwerp (id), of bij volgorde de gezette volgorde ("m,k,g"). */
export function rekenFout(v: Vraag, x: string): Fout {
  const code = denkfoutVan(v, x);
  const denkfout = DENKFOUT_UITLEG[code];
  const { eig, uitleg, weer } = tekst(v, code);
  const opnieuw = opnieuwVan(v);
  const maak = (V: Varianten, scherm: string, rondje: string, bewering: Bewering, over: string[]): Fout => {
    const e = vast(V.eerste, v.nr);
    const h = vast(zonderDubbel(v, V.hint, e), v.nr);
    const o = vast(passend(zonderDubbel(v, opnieuw, e, h), h), v.nr);
    const w = V.weerEerste.length ? vast(V.weerEerste, v.nr) : "";
    return { code, soort: code, denkfout, eerste: e, hint: `${h} ${o}`, uitleg: vast(zonderDubbel(v, V.uitleg, e), v.nr), weer: w ? [w, vast(zonderDubbel(v, V.weerUitleg, w), v.nr)] : [], scherm, rondje, bewering, over, v: V };
  };
  if (v.soort === "volgorde") {
    const xs = x.split(",");
    const goed = v.goed.split(",");
    const p = Math.max(0, xs.findIndex((id, i) => id !== goed[i]));
    const dit = ditDing(v, xs[0]);
    const kleiner = `${v.ding === "beker" ? "staat" : "ligt"} nog een kleinere`;
    /* Bekers staan, appels liggen (3.12; keuring 11 november 2026). */
    const eerste =
      code === "groot-naar-klein"
        ? ["Je zette ze van groot naar klein.", "Van groot naar klein? Dat is net andersom.", "De grootste staat nu vooraan."]
        : code === "niet-bij-kleinste"
          ? [`Je begon met ${dit}. Er ${kleiner}.`, `${Hoofd(dit)} eerst? Er ${kleiner}.`, `Je zette eerst ${dit}. Maar er ${kleiner}.`]
          : ["Je zette de grootste in het midden.", "De grootste staat nu in het midden.", "In het midden staat nu de grootste."];
    return maak({ eerste, hint: hintVolgorde(v, code), uitleg, weerEerste: weer?.[0] ?? [], weerUitleg: weer?.[1] ?? [] }, SCHERM.volgorde, xs[p], { soort: "volgorde" }, []);
  }
  const dit = ditDing(v, x);
  const eerste = [`Je koos ${dit}. ${eig[0]}`, `${Hoofd(dit)}? ${eig[1]}`, eig[2] ? `Je tikte op ${dit}. ${eig[2]}` : `Je tikte op ${naamVan(v, x)}.`];
  return maak({ eerste, hint: HINTS[v.nr], uitleg, weerEerste: [], weerUitleg: [] }, SCHERM.kies, x, { soort: "alleen-c" }, v.dingen.map((q) => q.id).filter((k) => k !== x));
}

/** Na de 2e fout met een ander antwoord: niet 2 keer "Je koos …" achter elkaar (keuring Tellen en Splitsen). */
export const nuKoos = (z: string) => z.replace(/^Je koos /, "Nu koos je ").replace(/^Je tikte op /, "Nu tikte je op ").replace(/^Je begon /, "Nu begon je ").replace(/^Je zette /, "Nu zette je ");

/**
 * Wat Bliepo zegt bij een antwoord dat niet goed is, uit de varianten. De les en het fouttabel-script gebruiken allebei
 * deze functie, zodat het script precies naspeelt wat de les doet.
 *   1e keer: [eerste zin (wat het kind koos), hint + de vraag in andere woorden (1 stuk: de nieuwe vraagzin)]. De hint en
 *   de vraag zeggen geen woord van de eerste zin nog eens (behalve kleine woordjes en de woorden van de vraag).
 *   2e keer: [eerste, uitleg]: bij 2 keer dezelfde denkfout "weer" + een andere uitleg; bij hetzelfde antwoord 2 keer
 *   "Je koos weer …" + de uitleg; anders de eerste zin (met "Nu koos je …") + de uitleg. Alles past in het tekstvak.
 */
export function foutReactie(kies: Kies, v: Vraag, f: Fout, poging: 1 | 2, eerder: Fout | null, zelfdeAntwoord: boolean, eersteZin: string): string[] {
  const V = f.v;
  if (poging === 1) {
    const e = kies("eerste", passend(V.eerste));
    const h = kies("hint", passend(zonderDubbel(v, V.hint, e)), (z) => !deeltStuk(e, z, 3) && geenWoordGedeeld(e, z));
    const o = kies("opnieuw", passend(zonderDubbel(v, opnieuwVan(v), e, h), h), (z) => geenWoordGedeeld(h, z));
    return [e, `${h} ${o}`];
  }
  const uitleg = (w: string, lijst: string[], sleutel: string) => kies(sleutel, passend(zonderDubbel(v, lijst, w)), (z) => !deeltStuk(w, z, 3));
  /* "Weer" alleen als Bliepo de 1e keer al zei wat er mis was. */
  if (eerder !== null && eerder.soort === f.soort && f.code !== "onduidelijk" && V.weerEerste.length > 0) {
    const w = kies("weer", V.weerEerste);
    return [w, uitleg(w, V.weerUitleg, "weerUitleg")];
  }
  if (zelfdeAntwoord) {
    const w = kies("weerGekozen", ZIN.weerGekozen(v, f.rondje && v.soort !== "volgorde" ? f.rondje : ""));
    return [w, uitleg(w, V.uitleg, "uitleg")];
  }
  const e = nuKoos(kies("eerste", passend(V.eerste), (z) => beginVan(nuKoos(z)) !== beginVan(eersteZin)));
  return [e, uitleg(e, V.uitleg, "uitleg")];
}

/** Alle volgordes die een kind kan zetten (3 voorwerpen). */
export function volgordes(v: Vraag): string[] {
  const ids = v.dingen.map((q) => q.id);
  const uit: string[] = [];
  for (const a of ids) for (const b of ids) for (const c of ids) if (a !== b && b !== c && a !== c) uit.push([a, b, c].join(","));
  return uit;
}

/** De fouttabel van een vraag: elk fout antwoord dat het kind kan geven. Sleutel = het voorwerp of de volgorde. */
export function foutenVan(v: Vraag): Record<string, Fout> {
  const lijst = v.soort === "volgorde" ? volgordes(v) : v.dingen.map((q) => q.id);
  return Object.fromEntries(lijst.filter((k) => k !== v.goed).map((k) => [k, rekenFout(v, k)]));
}
