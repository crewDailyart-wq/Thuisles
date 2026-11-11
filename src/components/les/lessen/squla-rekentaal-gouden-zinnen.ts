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
 * Leesbare versie: FOUTTABEL-squla-rekentaal-gouden.md (maak hem opnieuw met `npx tsx scripts/fouttabel-rekentaal-gouden.ts`;
 * dat script doet ook de verklap-, waarheids- en herhaalcontrole).
 *
 * Getallen: deze les heeft geen getallen in Bliepo's zinnen (de oude les ook bijna niet). Het script controleert dat er
 * geen kaal cijfer in een zin staat (14.20).
 */

import type { RekenDing } from "../vlakken/squla-rekentaal-keuken";
import type { Rijtje } from "./squla-klok-gouden-zinnen";

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
  /** Samen voordoen: Bliepo wijst de voorwerpen 1 voor 1 aan (rondje + zin), daarna tikt het kind het goede. */
  samen: { intro?: string; stappen: [string, string][]; jij: string; klaar: string };
};

const d = (id: string, soort: RekenDing["soort"], naam: string, extra: Partial<RekenDing> = {}): RekenDing => ({ id, soort, naam, ...extra });

export const VRAGEN: Vraag[] = [
  /* ---------- in de keuken ---------- */
  {
    nr: 1, id: "vraag1-groter", soort: "twee", ding: "pannenkoek", het: false, woord: "groter",
    vraag: ["Welke pannenkoek is groter?", "Tik erop."], indeling: "rij", ondergrond: "tafel",
    dingen: [d("k", "pannenkoek", "de kleine pannenkoek", { maat: 0.6 }), d("g", "pannenkoek", "de grote pannenkoek", { maat: 0.95 })], goed: "g",
    reden: "hij is breder dan de andere",
    samen: { stappen: [["k", "Deze pannenkoek is klein."], ["g", "En deze is groot."]], jij: "Tik jij op de grote pannenkoek?", klaar: "Ja, deze pannenkoek is groter." },
  },
  {
    nr: 2, id: "vraag2-kleiner", soort: "twee", ding: "beker", het: false, woord: "kleiner",
    vraag: ["Welke beker is kleiner?"], indeling: "rij", ondergrond: "tafel",
    dingen: [d("g", "beker", "de grote beker", { maat: 1.05 }), d("k", "beker", "de kleine beker", { maat: 0.65 })], goed: "k",
    reden: "hij is lager en smaller dan de andere",
    samen: { stappen: [["g", "Deze beker is groot."], ["k", "En deze is klein."]], jij: "Tik jij op de kleine beker?", klaar: "Ja, deze beker is kleiner." },
  },
  {
    nr: 3, id: "vraag3-vol", soort: "twee", ding: "glas", het: true, woord: "vol",
    vraag: ["Welk glas is vol?"], indeling: "rij", ondergrond: "tafel",
    dingen: [d("leeg", "glas", "het lege glas", { vul: 0 }), d("vol", "glas", "het volle glas", { vul: 1 })], goed: "vol",
    reden: "het sap komt tot de rand",
    samen: { stappen: [["leeg", "In dit glas zit niets."], ["vol", "En dit zit tot de rand vol."]], jij: "Tik jij op het volle glas?", klaar: "Ja, dit glas is vol." },
  },
  {
    nr: 4, id: "vraag4-leeg", soort: "twee", ding: "glas", het: true, woord: "leeg",
    vraag: ["Welk glas is leeg?"], indeling: "rij", ondergrond: "tafel",
    dingen: [d("vol", "glas", "het volle glas", { vul: 1 }), d("leeg", "glas", "het lege glas", { vul: 0 })], goed: "leeg",
    reden: "er zit niets in",
    samen: { stappen: [["vol", "In dit glas zit sap."], ["leeg", "En hier zit niets in."]], jij: "Tik jij op het lege glas?", klaar: "Ja, dit glas is leeg." },
  },
  {
    nr: 5, id: "vraag5-zwaarder", soort: "weeg", ding: "weegschaal", het: false, woord: "zwaarder",
    vraag: ["Kijk naar de weegschaal.", "Wat is zwaarder?"], indeling: "weegschaal", ondergrond: "tafel", zwaar: "meloen",
    dingen: [d("appel", "appel", "de appel"), d("meloen", "meloen", "de meloen", { maat: 0.8 })], goed: "meloen",
    reden: "die kant zakt naar beneden",
    samen: { stappen: [["meloen", "Deze kant zakt naar beneden."], ["appel", "De andere kant gaat omhoog."]], jij: "Tik jij op de meloen?", klaar: "Ja, de meloen is zwaarder." },
  },
  {
    nr: 6, id: "vraag6-lichter", soort: "weeg", ding: "weegschaal", het: false, woord: "lichter",
    vraag: ["Kijk naar de weegschaal.", "Wat is lichter?"], indeling: "weegschaal", ondergrond: "tafel", zwaar: "zak",
    dingen: [d("zak", "zak", "de zak meel", { maat: 0.8 }), d("aardbei", "aardbei", "de aardbei")], goed: "aardbei",
    reden: "die kant gaat omhoog",
    samen: { stappen: [["zak", "Deze kant zakt naar beneden."], ["aardbei", "De andere kant gaat omhoog."]], jij: "Tik jij op de aardbei?", klaar: "Ja, de aardbei is lichter." },
  },
  {
    nr: 7, id: "vraag7-langer", soort: "twee", ding: "sliert", het: false, woord: "langer",
    vraag: ["Kijk naar de slierten spaghetti.", "Welke sliert is langer?"], indeling: "onder", ondergrond: "tafel",
    dingen: [d("kort", "sliert", "de korte sliert", { lengte: 330 }), d("lang", "sliert", "de lange sliert", { lengte: 640 })], goed: "lang",
    reden: "hij loopt verder door",
    samen: { intro: "De slierten beginnen bij dezelfde streep.", stappen: [["kort", "Deze sliert stopt eerder."], ["lang", "En deze loopt verder door."]], jij: "Tik jij op de lange sliert?", klaar: "Ja, deze sliert is langer." },
  },
  {
    nr: 8, id: "vraag8-korter", soort: "twee", ding: "sliert", het: false, woord: "korter",
    vraag: ["Welke sliert is korter?"], indeling: "onder", ondergrond: "tafel",
    dingen: [d("lang", "sliert", "de lange sliert", { lengte: 600 }), d("kort", "sliert", "de korte sliert", { lengte: 400 })], goed: "kort",
    reden: "hij stopt eerder",
    samen: { intro: "De slierten beginnen bij dezelfde streep.", stappen: [["lang", "Deze sliert loopt verder door."], ["kort", "En deze stopt eerder."]], jij: "Tik jij op de korte sliert?", klaar: "Ja, deze sliert is korter." },
  },
  /* ---------- bij de picknick ---------- */
  {
    nr: 9, id: "vraag9-grootst", soort: "drie", ding: "mand", het: false, woord: "het grootst",
    vraag: ["Welke mand is het grootst?"], indeling: "rij", ondergrond: "kleed",
    dingen: [d("m", "mand", "de middelste mand", { maat: 0.85 }), d("g", "mand", "de grootste mand", { maat: 1.12 }), d("k", "mand", "de kleinste mand", { maat: 0.6 })], goed: "g",
    reden: "hij is hoger en breder dan alle andere",
    samen: { stappen: [["k", "Deze mand is klein."], ["m", "Die is groter."], ["g", "En deze is het grootst."]], jij: "Tik jij op de grootste mand?", klaar: "Ja, deze mand is het grootst." },
  },
  {
    nr: 10, id: "vraag10-halfvol", soort: "drie", ding: "glas", het: true, woord: "half vol",
    vraag: ["Welk glas is half vol?"], indeling: "rij", ondergrond: "kleed",
    dingen: [d("vol", "glas", "het volle glas", { vul: 1 }), d("leeg", "glas", "het lege glas", { vul: 0 }), d("half", "glas", "het halfvolle glas", { vul: 0.5 })], goed: "half",
    reden: "het sap komt tot de helft",
    samen: { stappen: [["vol", "Dit glas is vol."], ["leeg", "Dat is leeg."], ["half", "En hier komt het sap tot de helft."]], jij: "Tik jij op het halfvolle glas?", klaar: "Ja, dit glas is half vol." },
  },
  {
    nr: 11, id: "vraag11-kleinst", soort: "drie", ding: "appel", het: false, woord: "het kleinst",
    vraag: ["Welke appel is het kleinst?"], indeling: "rij", ondergrond: "kleed",
    dingen: [d("g", "appel", "de grootste appel", { maat: 1.35 }), d("k", "appel", "de kleinste appel", { maat: 0.7 }), d("m", "appel", "de middelste appel", { maat: 1 })], goed: "k",
    reden: "hij is kleiner dan alle andere",
    samen: { stappen: [["g", "Deze appel is groot."], ["m", "Die is kleiner."], ["k", "En deze is het kleinst."]], jij: "Tik jij op de kleinste appel?", klaar: "Ja, deze appel is het kleinst." },
  },
  {
    nr: 12, id: "vraag12-langst", soort: "drie", ding: "broodje", het: true, woord: "het langst",
    vraag: ["Welk broodje is het langst?"], indeling: "onder", ondergrond: "kleed",
    dingen: [d("k", "broodje", "het kortste broodje", { lengte: 300 }), d("l", "broodje", "het langste broodje", { lengte: 640 }), d("m", "broodje", "het middelste broodje", { lengte: 470 })], goed: "l",
    reden: "het loopt het verst door",
    samen: { intro: "De broodjes beginnen bij dezelfde streep.", stappen: [["k", "Dit broodje is kort."], ["m", "Dat is langer."], ["l", "En dit gaat het verst door."]], jij: "Tik jij op het langste broodje?", klaar: "Ja, dit broodje is het langst." },
  },
  {
    nr: 13, id: "vraag13-zwaarder", soort: "weeg", ding: "weegschaal", het: false, woord: "zwaarder",
    vraag: ["Kijk naar de weegschaal.", "Wat is zwaarder?"], indeling: "weegschaal", ondergrond: "kleed", zwaar: "meloen",
    dingen: [d("mand", "mand", "de lege mand", { maat: 0.8 }), d("meloen", "meloen", "de meloen", { maat: 0.6 })], goed: "meloen",
    reden: "zijn kant zakt naar beneden",
    samen: { stappen: [["mand", "De mand is groot, maar hij gaat omhoog."], ["meloen", "Aan de andere kant zakt de meloen omlaag."]], jij: "Tik jij op de meloen?", klaar: "Ja, de meloen is zwaarder." },
  },
  {
    nr: 14, id: "vraag14-kortst", soort: "drie", ding: "broodje", het: true, woord: "het kortst",
    vraag: ["Welk broodje is het kortst?"], indeling: "onder", ondergrond: "kleed",
    dingen: [d("m", "broodje", "het middelste broodje", { lengte: 450 }), d("l", "broodje", "het langste broodje", { lengte: 620 }), d("k", "broodje", "het kortste broodje", { lengte: 270 })], goed: "k",
    reden: "het stopt het eerst",
    samen: { intro: "De broodjes beginnen bij dezelfde streep.", stappen: [["l", "Dit broodje is lang."], ["m", "Dat is korter."], ["k", "En dit stopt het eerst."]], jij: "Tik jij op het kortste broodje?", klaar: "Ja, dit broodje is het kortst." },
  },
  {
    nr: 15, id: "vraag15-volgorde-appels", soort: "volgorde", ding: "appel", het: false, woord: "van klein naar groot",
    vraag: ["Zet de appels op volgorde.", "Van klein naar groot.", "Tik eerst op de kleinste."], indeling: "volgorde", ondergrond: "kleed",
    dingen: [d("m", "appel", "de middelste appel", { maat: 0.95 }), d("g", "appel", "de grootste appel", { maat: 1.3 }), d("k", "appel", "de kleinste appel", { maat: 0.6 })], goed: "k,m,g",
    reden: "",
    samen: { stappen: [["k", "Deze appel is het kleinst. Die komt vooraan."], ["m", "Dan komt deze appel."]], jij: "Tik jij op de grootste appel?", klaar: "Ja, nu staan ze van klein naar groot." },
  },
  {
    nr: 16, id: "vraag16-volgorde-bekers", soort: "volgorde", ding: "beker", het: false, woord: "van klein naar groot",
    vraag: ["Zet de bekers op volgorde.", "Van klein naar groot.", "Tik eerst op de kleinste."], indeling: "volgorde", ondergrond: "kleed",
    dingen: [d("g", "beker", "de grootste beker", { maat: 0.95 }), d("k", "beker", "de kleinste beker", { maat: 0.45 }), d("m", "beker", "de middelste beker", { maat: 0.7 })], goed: "k,m,g",
    reden: "",
    samen: { stappen: [["k", "Deze beker is het kleinst. Die komt vooraan."], ["m", "Dan komt deze beker."]], jij: "Tik jij op de grootste beker?", klaar: "Ja, nu staan ze van klein naar groot." },
  },
];

/** "deze pannenkoek", "dit glas", of op de weegschaal de naam ("de meloen"). */
export const ditDing = (v: Vraag, id: string): string => {
  if (v.soort === "weeg") return v.dingen.find((x) => x.id === id)?.naam ?? "dit";
  return `${v.het ? "dit" : "deze"} ${v.ding}`;
};
/** De naam van een voorwerp (aria-label en testantwoord): "de grote pannenkoek". */
export const naamVan = (v: Vraag, id: string) => v.dingen.find((x) => x.id === id)?.naam ?? id;
/** Het meervoud van het voorwerp (alleen bij volgorde). */
export const meervoud = (v: Vraag) => (v.ding === "appel" ? "appels" : v.ding === "beker" ? "bekers" : `${v.ding}en`);

/* ---------- vaste zinnen van het verloop (laag 1 van de gouden lessen; eigen woorden) ---------- */

export const ZIN = {
  /** Het begin (geen startvraag: er is geen draaiboek met een startvraag). Samen met de groet 1 stuk. */
  start: "In deze les leer je rekenwoorden, zoals groot en klein, vol en leeg.",
  /** Van de keuken naar de picknick (de oude les). */
  picknick: ["De keuken is klaar.", "Nu gaan we picknicken in het park."],
  /** 2e fout: Bliepo doet het samen voor (eigen invulling, niet van Synthesis). 3 versies, om de beurt. */
  samen: ["Kom, we kijken samen.", "We zoeken het samen.", "Kom, samen lukt het."],
  /** Vangnet (20 s niets of 3 keer iets anders): Bliepo doet de laatste stap zelf, zonder "Ja". */
  zelf: (klaar: string) => klaar.replace(/^Ja, /, "Kijk, "),
  /** Op volgorde: 45 s niets nagekeken; dan doen we het samen (zoals slepen bij de gouden les Dagen). */
  volgVangnet: "Ik help je met deze.",
  /** Het hulphandje bij de kleine stap (het rondje staat om het goede voorwerp). */
  handDing: "Tik in het rode rondje.",
  /** Het hulphandje bij op volgorde zetten: bij de eerste lege plek (nooit op het goede voorwerp, 15.17). */
  handVolgorde: (v: Vraag) => `Tik op een ${v.ding}. Die komt dan hier.`,
  /** Hetzelfde foute antwoord 2 keer: niet 2 keer dezelfde eerste zin (geleerd bij Tellen). */
  weerGekozen: (v: Vraag, x: string) => (v.soort === "volgorde" ? "Je zette ze weer in dezelfde volgorde." : `Je koos weer ${ditDing(v, x)}.`),
  /** Het einde. */
  slot: "Nu ken je veel rekenwoorden.",
  kaartTik: "Tik op de kaart.",
};

/** Aanmoediging bij het hulphandje (het kind moet tikken, niet nadenken; 14.35, geleerd bij Tellen). */
export const AANMOEDIG_DOEN = ["Je bent goed bezig.", "Jij kunt dit."];

/* ---------- reactie na de lof (BLIEPO-KARAKTER.md §4 Meten, plus zinnen zonder "Ja") ---------- */

/** De robotzin (de laatste) hooguit 1 keer per les. Zin 0 en 1 beginnen met "Ja". */
export function rekenReactie(v: Vraag): Rijtje {
  if (v.soort === "volgorde")
    return rij(["Ja, van klein naar groot.", "Ja, eerst de kleinste en als laatste de grootste.", "Klein, groter, het grootst.", `Nu staan de ${meervoud(v)} van klein naar groot.`, "Nagekeken: ze staan echt van klein naar groot."], [4]);
  const wie = ditDing(v, v.goed);
  return rij([`Ja, ${wie} is ${v.woord}.`, `Ja, ${v.reden}.`, `${Hoofd(v.reden)}.`, `${Hoofd(wie)} is ${v.woord}.`, `Nagekeken: ${wie} is echt ${v.woord}.`], [4]);
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

export type Fout = {
  code: Denkfoutnaam;
  /** Welke uitleg bij de 2e fout hoort (dezelfde soort 2 keer met een ander antwoord = "weer"). */
  soort: string;
  denkfout: string;
  /** Bliepo's eerste zin: wat het kind koos + iets waars daarover. */
  eerste: string;
  /** De hint; eindigt met de vraag of de opdracht (F1). */
  hint: string;
  /** Uitleg na de 2e fout (daarna meteen samen voordoen); geen opdracht. */
  uitleg: string;
  /** Dezelfde denkfout 2 keer met een ander antwoord (alleen bij volgorde mogelijk). */
  weer: string[];
  scherm: string;
  /** Het rode rondje bij de eerste zin: om wat het kind koos (of om wat op de verkeerde plek staat). Nooit om het antwoord. */
  rondje: string | null;
  bewering: Bewering;
  /** Welke keuzes de eerste zin en de hint nog toelaten (voor de verklapcontrole van het script, 15.17). */
  over: string[];
};

const kies2 = <T,>(lijst: T[], nr: number) => lijst[nr % lijst.length];

const SCHERM = {
  kies: "Bliepo's scherm 1,5 s rood (geen fout-geluidje); het vinkje gaat weg; een rood rondje om wat het kind koos zolang Bliepo het noemt (nooit om het antwoord); dan de hint en het kind mag opnieuw kiezen (alle voorwerpen blijven staan, geen pijl)",
  volgorde: "Bliepo's scherm 1,5 s rood (geen fout-geluidje); een rood rondje om het voorwerp dat als eerste op een verkeerde plek staat; dan gaan alle voorwerpen terug naar boven, de hint is de nieuwe opdracht en het kind zet ze opnieuw (geen pijl)",
};

/** De hints per vraag (2 versies, om de beurt per vraag; ze zeggen hoe je kijkt, niet waar het antwoord staat; 15.17). */
/* Keuring 11 november 2026: geen "vergelijk" (WOORDEN-GROEP3.md: vergelijken als werkwoord niet), en "Ze beginnen bij
   dezelfde streep." niet bij 3 vragen (het samen voordoen zegt het daar ook al): bij vraag 8 en 12 de andere versie. */
const HINTS: Record<number, [string, string]> = {
  1: ["Kijk van rand tot rand hoe breed ze zijn. Welke pannenkoek is groter?", "Kijk hoe breed elke pannenkoek is. Welke pannenkoek is groter?"],
  2: ["Kijk hoe hoog en hoe breed ze zijn. Welke beker is kleiner?", "Kijk naar allebei de bekers. Welke beker is kleiner?"],
  3: ["Kijk hoe hoog het sap komt. Welk glas is vol?", "Zoek sap tot aan de rand. Welk glas is vol?"],
  4: ["Kijk waar geen sap in zit. Welk glas is leeg?", "Zoek waar niets in zit. Welk glas is leeg?"],
  5: ["Iets zwaars trekt de weegschaal omlaag. Wat is zwaarder?", "Kijk welke kant van de weegschaal zakt. Wat is zwaarder?"],
  6: ["Iets lichts gaat omhoog op de weegschaal. Wat is lichter?", "Kijk welke kant van de weegschaal omhoog gaat. Wat is lichter?"],
  7: ["Ze beginnen bij dezelfde streep. Welke sliert is langer?", "Kijk waar elke sliert ophoudt. Welke sliert is langer?"],
  8: ["Kijk welke sliert als eerste ophoudt. Welke sliert is korter?", "Ze beginnen bij dezelfde streep. Welke sliert is korter?"],
  9: ["Kijk hoe hoog en hoe breed ze zijn. Welke mand is het grootst?", "Kijk naar alle manden. Welke mand is het grootst?"],
  10: ["Kijk tot waar het sap komt. Welk glas is half vol?", "Zoek sap tot de helft. Welk glas is half vol?"],
  11: ["Kijk hoe hoog en hoe breed ze zijn. Welke appel is het kleinst?", "Kijk naar alle appels. Welke appel is het kleinst?"],
  12: ["Kijk waar ze allemaal stoppen. Welk broodje is het langst?", "Ze beginnen bij dezelfde streep. Welk broodje is het langst?"],
  13: ["Iets groots is niet altijd zwaar. Wat is zwaarder?", "Kijk welke kant van de weegschaal zakt. Wat is zwaarder?"],
  14: ["Ze beginnen bij dezelfde streep. Welk broodje is het kortst?", "Kijk waar ze allemaal stoppen. Welk broodje is het kortst?"],
};
/**
 * De hint bij op volgorde zetten: de nieuwe opdracht (eindigt met wat het kind doet), per denkfout (keuring 11 november
 * 2026: wie al met de kleinste begon, heeft niets aan "Begin met de kleinste"; en niet "Je begon …" + "Begin …").
 */
const hintVolgorde = (v: Vraag, code: Denkfoutnaam) => {
  const zet = `Zet de ${meervoud(v)} van klein naar groot.`;
  if (code === "grootste-in-het-midden") return `Tik steeds op de kleinste die nog over is. ${zet}`;
  if (code === "niet-bij-kleinste") return `${kies2(["Kijk welke het kleinst is.", "Zoek eerst de kleinste."], v.nr)} ${zet}`;
  return `Begin met de kleinste en pak dan steeds een grotere. ${zet}`;
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

/** De eerste zin (2e deel), de uitleg en de "weer"-zinnen per vraag en denkfout. */
function tekst(v: Vraag, x: string, code: Denkfoutnaam): { eerste2: string; uitleg: string; weer: string[] } {
  const t = (eerste2: string, uitleg: string, weer: string[] = []) => ({ eerste2, uitleg, weer });
  switch (v.nr) {
    case 1: return t("Hij is kleiner dan de andere.", "Groter betekent hier: hij is breder.");
    case 2: return t("Hij is hoger en breder dan de andere.", "Kleiner betekent: lager en smaller.");
    case 3: return t("Het is leeg.", "Vol betekent: het sap komt tot de rand.");
    case 4: return t("Het is vol.", "Leeg betekent: er zit niets in.");
    case 5: return t("Die hangt hoger.", "Wat zwaarder is, zakt naar beneden.");
    case 6: return t("Die hangt lager.", "Wat lichter is, gaat omhoog.");
    case 7: return t("Die stopt eerder.", "Langer betekent: hij loopt verder door.");
    case 8: return t("Die loopt verder door.", "Korter betekent: hij stopt eerder.");
    case 9: return code === "middelste-gekozen" ? t("Die is niet de grootste.", "Een andere mand is nog groter.") : t("Dat is de kleinste.", "Het grootst betekent: groter dan alle andere.");
    case 10: return code === "helemaal-vol" ? t("Dat is helemaal vol.", "Half vol is niet tot de rand, maar tot de helft.") : t("Daar zit niets in.", "Bij half vol komt het sap tot de helft.");
    case 11: return code === "middelste-gekozen" ? t("Die is niet de kleinste.", "Een andere appel is nog kleiner.") : t("Dat is de grootste.", "Het kleinst betekent: kleiner dan alle andere.");
    case 12: return code === "middelste-gekozen" ? t("Dat is niet het langste.", "Een ander broodje loopt nog verder door.") : t("Dat is het kortste.", "Het langst betekent: langer dan alle andere.");
    case 13: return t("Die is groot, maar hangt hoger.", "De zware kant van de weegschaal zakt naar beneden.");
    case 14: return code === "middelste-gekozen" ? t("Dat is niet het kortste.", "Een ander broodje stopt nog eerder.") : t("Dat is het langste.", "Het kortst betekent: korter dan alle andere.");
  }
  /* Op volgorde. */
  if (code === "groot-naar-klein") return t("", "Van klein naar groot: de kleinste staat vooraan.");
  /* Bekers staan, appels liggen (3.12; keuring 11 november 2026). */
  if (code === "niet-bij-kleinste") return t(`Er ${v.ding === "beker" ? "staat" : "ligt"} nog een kleinere.`,"De kleinste hoort vooraan.", ["Weer stond de kleinste niet vooraan.", "Van klein naar groot: je begint links."]);
  return t("", "Na de kleinste komt eerst de middelste.");
}

/** De fouttabel van 1 fout antwoord. `x` = het gekozen voorwerp (id), of bij volgorde de gezette volgorde ("m,k,g"). */
export function rekenFout(v: Vraag, x: string): Fout {
  const code = denkfoutVan(v, x);
  const denkfout = DENKFOUT_UITLEG[code];
  const { eerste2, uitleg, weer } = tekst(v, x, code);
  if (v.soort === "volgorde") {
    const xs = x.split(",");
    const goed = v.goed.split(",");
    const p = Math.max(0, xs.findIndex((id, i) => id !== goed[i]));
    const eerste =
      code === "groot-naar-klein"
        ? "Je zette ze van groot naar klein."
        : code === "niet-bij-kleinste"
          ? `Je begon met ${ditDing(v, xs[0])}. ${eerste2}`
          : "Je zette de grootste in het midden.";
    return { code, soort: code, denkfout, eerste, hint: hintVolgorde(v, code), uitleg, weer, scherm: SCHERM.volgorde, rondje: xs[p], bewering: { soort: "volgorde" }, over: [] };
  }
  const eerste = `Je koos ${ditDing(v, x)}. ${eerste2}`;
  return {
    code,
    soort: code,
    denkfout,
    eerste,
    hint: kies2(HINTS[v.nr], v.nr),
    uitleg,
    weer,
    scherm: SCHERM.kies,
    rondje: x,
    bewering: { soort: "alleen-c" },
    over: v.dingen.map((q) => q.id).filter((k) => k !== x),
  };
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
