/**
 * ALLE ZINNEN VAN BLIEPO in de gouden les Dagen (squla-dagen-van-de-week-gouden, "Dagen van de week", 11 november 2026),
 * op één plek, met de FOUTTABEL. De les zelf (squla-dagen-gouden.tsx) bevat geen eigen zinnen.
 *
 *   - De rijtjes (lof, momenten, naam, goed na een fout, einde, eerste zin als de denkfout niet duidelijk is, overgang)
 *     zijn dezelfde als in de andere gouden lessen (BLIEPO-KARAKTER.md). Hier alleen de reactie bij Dagen (in de geest
 *     van BLIEPO-KARAKTER.md §4 "Dagen en tijd", zin 51, 52 en 55), met zinnen zonder "Ja" voor na een lofzin met "Ja".
 *   - De inhoud (17 vragen, de weektrein, de dagkaarten en de goede antwoorden) is die van squla-dagen-van-de-week
 *     "Dagen van de week" (squla-dagen.tsx, BOUWREGELS 15.22): 3 keer "Tik op de wagon van …", 2 keer "Welke dag komt
 *     na …?", 2 keer "Welke dag komt vóór …?", 3 keer "Er mist een dag in de trein" (slepen), gisteren en morgen, het
 *     weekend (2 vragen), na zondag, vóór maandag en "Vandaag is het maandag. Welke dag was het gisteren?".
 *   - GEEN SYNTHESIS-LES: Synthesis heeft geen les over dagen, de week of de kalender (KOPPELING.md §9). Het skelet is
 *     exact dat van de andere gouden lessen (laag 1: LESRECEPT.md en BLIEPO-KARAKTER.md). Alles wat per onderwerp anders
 *     is (de denkfouten, de eerste zinnen, de hints, de uitleg en het samen voordoen) is "EIGEN INVULLING, NIET VAN
 *     SYNTHESIS" (BOUWREGELS 15.22, 15.25; SYNTHESIS-ANALYSE/DRAAIBOEKEN-NIEUW/dagen.md).
 *
 * Leesbare versie: FOUTTABEL-squla-dagen-van-de-week-gouden.md (maak hem opnieuw met
 * `npx tsx scripts/fouttabel-dagen-gouden.ts`; dat script doet ook de verklap- en waarheidscontrole).
 *
 * Getalkleur (BOUWREGELS 2.1, 2.2, 14.20, 14.27): er staan bijna geen getallen in deze les. "2 dagen", "1 dag", "7 dagen"
 * verwijzen naar wagons van verschillende kleuren of naar niets in beeld: wit (zoals "3 briefjes" bij Geld).
 */

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
/** Een getal in de zin (wit: het verwijst niet naar 1 voorwerp met 1 kleur). */
export const g = (n: number) => `{${n}:wit}`;

/* ---------- de dagen ---------- */

export const NAMEN = ["maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag", "zondag"] as const;
export const ALLE = [0, 1, 2, 3, 4, 5, 6];
export const naam = (d: number) => NAMEN[d];
export const Naam = (d: number) => NAMEN[d][0].toUpperCase() + NAMEN[d].slice(1);
/** De dag erna en de dag ervoor (de week gaat rond: na zondag komt maandag). */
export const na = (d: number) => (d + 1) % 7;
export const voor = (d: number) => (d + 6) % 7;
/** Afstand in dagen, rondom gemeten (zaterdag–maandag = 2). */
export const afstand = (a: number, b: number) => Math.min((a - b + 7) % 7, (b - a + 7) % 7);

/* ---------- de 17 vragen van squla-dagen-van-de-week (zelfde volgorde, zelfde dagen, zelfde kaarten) ---------- */

/**
 * tik      Bliepo noemt een dag; het kind tikt op die wagon in de hele trein.
 * na/voor  een stukje trein met een lege plek; 3 dagkaarten; "Welke dag komt na/vóór …?".
 * mist     de hele trein met 1 lege plek; 3 dagkaarten; slepen naar de lege plek.
 * gm       de hele trein, vandaag heeft een pijl en een bordje; "Welke dag was het gisteren?" / "… is het morgen?".
 * weekend1 tik op een dag van het weekend (zaterdag én zondag zijn goed, 14.30).
 * weekend2 tik op de andere dag van het weekend.
 * gmMaandag "Vandaag is het maandag. Welke dag was het gisteren?": een stukje trein [lege plek, maandag] en 3 kaarten.
 */
export type Soort = "tik" | "na" | "voor" | "mist" | "gm" | "weekend1" | "weekend2" | "gmMaandag";
export type Invoer = "wagon" | "kaart" | "sleep";
export type Vraag = {
  nr: number;
  id: string;
  soort: Soort;
  invoer: Invoer;
  /** tik: de gevraagde dag; na/voor: de dag in de vraag; mist: de dag die mist; gm/gmMaandag: vandaag; weekend2: de dag die het kind al koos. */
  dag: number;
  wat?: "gisteren" | "morgen";
  /** De dagkaarten (in de volgorde van de oude les; de les schudt ze bij het tonen). Leeg bij wagonvragen. */
  kaarten: number[];
  /** Welke dagen goed zijn. */
  goed: number[];
};

const tik = (nr: number, d: number): Vraag => ({ nr, id: `vraag${nr}-tik-${naam(d)}`, soort: "tik", invoer: "wagon", dag: d, kaarten: [], goed: [d] });
const naV = (nr: number, d: number, kaarten: number[]): Vraag => ({ nr, id: `vraag${nr}-na-${naam(d)}`, soort: "na", invoer: "kaart", dag: d, kaarten, goed: [na(d)] });
const voorV = (nr: number, d: number, kaarten: number[]): Vraag => ({ nr, id: `vraag${nr}-voor-${naam(d)}`, soort: "voor", invoer: "kaart", dag: d, kaarten, goed: [voor(d)] });
const mist = (nr: number, d: number, kaarten: number[]): Vraag => ({ nr, id: `vraag${nr}-mist-${naam(d)}`, soort: "mist", invoer: "sleep", dag: d, kaarten, goed: [d] });
const gm = (nr: number, v: number, wat: "gisteren" | "morgen"): Vraag => ({ nr, id: `vraag${nr}-${wat}-${naam(v)}`, soort: "gm", invoer: "wagon", dag: v, wat, kaarten: [], goed: [wat === "gisteren" ? voor(v) : na(v)] });
/** De 2e weekendvraag hangt af van de dag die het kind bij de 1e koos. */
export const weekend2 = (eerste: number): Vraag => ({ nr: 14, id: "vraag14-weekend2", soort: "weekend2", invoer: "wagon", dag: eerste, kaarten: [], goed: [eerste === 5 ? 6 : 5] });

export const VRAGEN: Vraag[] = [
  tik(1, 3),
  tik(2, 5),
  tik(3, 1),
  naV(4, 1, [4, 2, 0]),
  naV(5, 4, [5, 3, 6]),
  voorV(6, 4, [3, 5, 2]),
  voorV(7, 2, [3, 0, 1]),
  mist(8, 2, [4, 2, 0]),
  mist(9, 5, [5, 3, 6]),
  mist(10, 0, [1, 6, 0]),
  gm(11, 2, "gisteren"),
  gm(12, 4, "morgen"),
  { nr: 13, id: "vraag13-weekend1", soort: "weekend1", invoer: "wagon", dag: -1, kaarten: [], goed: [5, 6] },
  weekend2(5),
  naV(15, 6, [5, 0, 1]),
  voorV(16, 0, [6, 1, 5]),
  { nr: 17, id: "vraag17-gisteren-maandag", soort: "gmMaandag", invoer: "kaart", dag: 0, wat: "gisteren", kaarten: [1, 6, 5], goed: [6] },
];

/** Wat er in beeld staat bij de vraag (zoals de oude les). `null` = de lege plek. */
export function beeldVan(v: Vraag): { wagons: (number | null)[]; vandaag: number | null } {
  if (v.soort === "na") return { wagons: [v.dag, null], vandaag: null };
  if (v.soort === "voor") return { wagons: [null, v.dag], vandaag: null };
  if (v.soort === "mist") return { wagons: ALLE.map((i) => (i === v.dag ? null : i)), vandaag: null };
  if (v.soort === "gm") return { wagons: ALLE, vandaag: v.dag };
  if (v.soort === "gmMaandag") return { wagons: [null, 0], vandaag: 0 };
  return { wagons: ALLE, vandaag: null };
}
/** Het beeld na een goed antwoord (de lege plek is gevuld). */
export function naGoedBeeld(v: Vraag, dag: number): (number | null)[] {
  if (v.soort === "na") return [v.dag, dag];
  if (v.soort === "voor") return [dag, v.dag];
  if (v.soort === "gmMaandag") return [dag, 0];
  return ALLE;
}
/** Welke antwoorden het kind kan kiezen (wagonvragen: elke wagon; bij weekend2 niet de dag die al een vinkje heeft). */
export function opties(v: Vraag): number[] {
  if (v.invoer !== "wagon") return v.kaarten;
  if (v.soort === "weekend2") return ALLE.filter((d) => d !== v.dag);
  return ALLE;
}

/* ---------- vaste zinnen van het verloop (laag 1 van de gouden lessen; eigen woorden) ---------- */

export const ZIN = {
  /** Het begin (geen startvraag: er is geen draaiboek met een startvraag). Samen met de groet 1 stuk; in beeld de hele
      weektrein. */
  start: "In deze les leer je de dagen van de week. Ze rijden mee in de weektrein.",
  /** De vraag (de vraagzinnen van de oude les; "voor" is "vóór" geworden, KEUZES Ronde 38). De eerste kaartvraag zegt
      wat het kind doet (3.15). */
  vraag: (v: Vraag, eersteKaart: boolean): string[] => {
    if (v.soort === "tik") return [`Tik op de wagon van ${naam(v.dag)}.`];
    if (v.soort === "na") return [`Welke dag komt na ${naam(v.dag)}?`, ...(eersteKaart ? ["Tik op de goede kaart."] : [])];
    if (v.soort === "voor") return [`Welke dag komt vóór ${naam(v.dag)}?`, ...(eersteKaart ? ["Tik op de goede kaart."] : [])];
    if (v.soort === "gm") return [`Vandaag is het ${naam(v.dag)}.`, v.wat === "gisteren" ? "Welke dag was het gisteren?" : "Welke dag is het morgen?"];
    if (v.soort === "gmMaandag") return ["Vandaag is het maandag.", "Welke dag was het gisteren?"];
    /* Oude les: "2 dagen samen heten het weekend." Een zin die met een cijfer begint leest lastig (KEUZES Ronde 38). */
    if (v.soort === "weekend1") return [`Het weekend heeft ${g(2)} dagen.`, "Tik op een dag van het weekend."];
    if (v.soort === "weekend2") return ["Tik op de andere dag van het weekend."];
    return ["Sleep de goede dag naar de lege plek."];
  },
  /** Bij "Er mist een dag": eerst wat er is (1 stuk, met de pijl), dan de opdracht (zoals de ketting bij Vormen). */
  mistIntro: "Er mist een dag in de trein.",
  mistHand: "Sleep een kaart naar de lege plek.",
  /** 2e fout: Bliepo doet het samen voor (eigen invulling, niet van Synthesis). 3 versies, om de beurt. */
  samen: ["Kom, we kijken samen.", "We zoeken het samen.", "Kom, samen lukt het."],
  /** tik: Bliepo loopt met het rondje langs de wagons, vanaf maandag (vast tempo, de pijl slaat het over). */
  samenTelBegin: "We lopen langs de wagons, vanaf maandag.",
  samenTelDag: (d: number) => `${Naam(d)}.`,
  samenTikJij: (d: number) => `Tik jij op de wagon van ${naam(d)}?`,
  samenTikKlaar: (d: number) => `Ja, dat is de wagon van ${naam(d)}.`,
  samenTikZelf: (d: number) => `Kijk, dit is de wagon van ${naam(d)}.`,
  /** na en vóór: de hele trein, rondje om de dag van de vraag en dan om de goede dag. */
  samenHier: (d: number) => `Hier is ${naam(d)} in de weektrein.`,
  samenNa: (d: number) => (d === 6 ? "Zondag is de laatste wagon. Daarna begint de week weer met maandag." : `Erachter hangt ${naam(na(d))}.`),
  samenVoor: (d: number) => (d === 0 ? "Maandag is de eerste wagon. De dag ervoor was zondag, de laatste van de vorige week." : `Ervoor hangt ${naam(voor(d))}.`),
  samenKaartJij: (a: number) => `Tik jij op de kaart van ${naam(a)}?`,
  samenNaKlaar: (d: number) => `Ja, na ${naam(d)} komt ${naam(na(d))}.`,
  samenNaZelf: (d: number) => `Kijk, na ${naam(d)} komt ${naam(na(d))}.`,
  samenVoorKlaar: (d: number) => `Ja, vóór ${naam(d)} komt ${naam(voor(d))}.`,
  samenVoorZelf: (d: number) => `Kijk, vóór ${naam(d)} komt ${naam(voor(d))}.`,
  /** Er mist een dag: rondje om de buren van de lege plek (1 rondje tegelijk, 7.8), dan om de goede kaart; het kind
      sleept hem. Per stap: [wat het rondje krijgt, wat Bliepo zegt]. */
  samenMistBuren: (d: number): [string, string][] =>
    d === 0
      ? [["w1", "De lege plek is de eerste wagon. Erachter hangt dinsdag."]]
      : d === 6
        ? [["w5", "De lege plek is de laatste wagon. Ervoor hangt zaterdag."]]
        : [
            [`w${voor(d)}`, `Vóór de lege plek hangt ${naam(voor(d))}.`],
            [`w${na(d)}`, `Erachter hangt ${naam(na(d))}.`],
          ],
  samenMistDag: (d: number) => (d === 0 ? "De dag vóór dinsdag is maandag." : `Daartussen hoort ${naam(d)}.`),
  samenMistJij: (d: number) => `Sleep jij ${naam(d)} naar de lege plek?`,
  samenMistKlaar: "Ja, nu is de trein weer heel.",
  samenMistZelf: (d: number) => `Kijk, ${naam(d)} hoort op de lege plek.`,
  /** Gisteren en morgen. */
  samenVandaag: (v: number) => (v === 0 ? "Vandaag is het maandag, de eerste dag van de week." : `Vandaag is het ${naam(v)}.`),
  samenGm: (v: number, wat: "gisteren" | "morgen") => (wat === "gisteren" ? (v === 0 ? "Gisteren was nog de vorige week: zondag." : `Gisteren is de dag ervoor: ${naam(voor(v))}.`) : `Morgen is de dag erna: ${naam(na(v))}.`),
  samenGmJij: (a: number) => `Tik jij op ${naam(a)}?`,
  samenGmKlaar: (a: number, wat: "gisteren" | "morgen") => (wat === "gisteren" ? `Ja, gisteren was het ${naam(a)}.` : `Ja, morgen is het ${naam(a)}.`),
  samenGmZelf: (a: number, wat: "gisteren" | "morgen") => (wat === "gisteren" ? `Kijk, gisteren was het ${naam(a)}.` : `Kijk, morgen is het ${naam(a)}.`),
  /** Het weekend. */
  samenWeekend: "Zaterdag en zondag zijn het weekend. Ze staan achteraan.",
  samenWeekendJij: "Tik jij op zaterdag of zondag?",
  samenWeekendKlaar: (d: number) => `Ja, ${naam(d)} hoort bij het weekend.`,
  samenWeekendZelf: "Kijk, zaterdag hoort bij het weekend.",
  samenWeekend2: (ander: number) => `${Naam(ander)} hoort ook bij het weekend.`,
  samenWeekend2Jij: (ander: number) => `Tik jij op ${naam(ander)}?`,
  samenWeekend2Klaar: "Ja, zaterdag en zondag zijn samen het weekend.",
  samenWeekend2Zelf: "Kijk, zaterdag en zondag zijn samen het weekend.",
  /** Het hulphandje bij de kleine stap. */
  handWagon: "Tik op de wagon in het rondje.",
  handKaart: "Tik op de kaart in het rondje.",
  handSleep: "Sleep de kaart in het rondje naar de lege plek.",
  /** Vangnet bij slepen: lang niets nagekeken. */
  mistVangnet: "Ik help je met deze.",
  /** Hetzelfde foute antwoord 2 keer: niet 2 keer dezelfde eerste zin (geleerd bij Tellen). */
  weerGekozen: (v: Vraag, c: number) => (v.invoer === "sleep" ? `Je sleepte weer ${naam(c)}.` : `Je koos weer ${naam(c)}.`),
  /** Het einde. */
  slot: "Nu ken je de dagen van de week.",
  kaartTik: "Tik op de kaart.",
};

/** Aanmoediging bij het hulphandje (het kind moet tikken of slepen, niet nadenken; 14.35, geleerd bij Tellen). */
export const AANMOEDIG_DOEN = ["Je bent goed bezig.", "Jij kunt dit."];

/* ---------- reactie na de lof (BLIEPO-KARAKTER.md §4 Dagen en tijd, zin 51, 52, 55, plus zinnen zonder "Ja") ---------- */

/** De robotzin (de laatste) hooguit 1 keer per les. Zin 0 en 1 beginnen met "Ja". */
export function dagenReactie(v: Vraag, dag: number): Rijtje {
  const d = v.dag;
  if (v.soort === "tik") return rij([`Ja, dit is de wagon van ${naam(d)}.`, `Ja, op het bordje staat ${naam(d)}.`, `Dat is de wagon van ${naam(d)}.`, `${Naam(d)} heeft een eigen wagon.`, `Nagekeken: dit is echt ${naam(d)}.`], [4]);
  if (v.soort === "na")
    return d === 6
      ? rij(["Ja, na zondag begint de week weer met maandag.", "Ja, na zondag komt maandag.", "Na de laatste dag begint de week opnieuw.", "Maandag komt direct na zondag.", "Nagekeken: na zondag komt echt maandag."], [4])
      : rij([`Ja, na ${naam(d)} komt ${naam(na(d))}.`, `Ja, ${naam(na(d))} hangt achter ${naam(d)}.`, `${Naam(na(d))} komt direct na ${naam(d)}.`, `Na ${naam(d)} is het ${naam(na(d))}.`, `Nagekeken: na ${naam(d)} komt echt ${naam(na(d))}.`], [4]);
  if (v.soort === "voor")
    return d === 0
      ? rij(["Ja, vóór maandag komt zondag.", "Ja, de week ervoor eindigde met zondag.", "Zondag komt direct vóór maandag.", "Vóór maandag was het zondag.", "Nagekeken: vóór maandag komt echt zondag."], [4])
      : rij([`Ja, vóór ${naam(d)} komt ${naam(voor(d))}.`, `Ja, ${naam(voor(d))} hangt vóór ${naam(d)}.`, `${Naam(voor(d))} komt direct vóór ${naam(d)}.`, `Vóór ${naam(d)} is het ${naam(voor(d))}.`, `Nagekeken: vóór ${naam(d)} komt echt ${naam(voor(d))}.`], [4]);
  if (v.soort === "mist")
    return rij([`Ja, ${naam(d)} hoort op die plek.`, `Ja, nu zijn alle ${g(7)} dagen er weer.`, d === 0 ? "Maandag is de eerste dag van de week." : `${Naam(d)} komt na ${naam(voor(d))}.`, "De trein is weer heel.", `Nagekeken: de trein heeft weer ${g(7)} wagons.`], [4]);
  if (v.soort === "gm" || v.soort === "gmMaandag") {
    const a = v.goed[0];
    return v.wat === "gisteren"
      ? rij([`Ja, gisteren was het ${naam(a)}.`, `Ja, ${naam(a)} is ${g(1)} dag terug.`, `Gisteren was het ${naam(a)}.`, `${Naam(a)} komt direct vóór ${naam(d)}.`, `Nagekeken: gisteren was echt ${naam(a)}.`], [4])
      : rij([`Ja, morgen is het ${naam(a)}.`, `Ja, ${naam(a)} is ${g(1)} dag verder.`, `Morgen is het ${naam(a)}.`, `${Naam(a)} komt direct na ${naam(d)}.`, `Nagekeken: morgen is echt ${naam(a)}.`], [4]);
  }
  if (v.soort === "weekend1") return rij([`Ja, ${naam(dag)} hoort bij het weekend.`, "Ja, dat is een dag van het weekend.", `${Naam(dag)} is een dag zonder school.`, "In het weekend is er geen school.", `Nagekeken: ${naam(dag)} is weekend.`], [4]);
  return rij(["Ja, zaterdag en zondag zijn het weekend.", "Ja, nu heb je ze allebei.", `Het weekend heeft ${g(2)} dagen.`, "Dan is er geen school.", "Nagekeken: allebei de dagen van het weekend."], [4]);
}
export const REACTIE_JA = [0, 1];
export const REACTIE_ROBOT = 4;

/* ---------- denkfouten (eigen invulling, niet van Synthesis; namen voor de voortgang) ---------- */

export const DENKFOUTEN = ["dag-ernaast", "voor-na-verwisseld", "gisteren-morgen-verwisseld", "vandaag-gekozen", "andere-dag", "schooldag", "onduidelijk"] as const;
export type Denkfoutnaam = (typeof DENKFOUTEN)[number];

export const DENKFOUT_UITLEG: Record<Denkfoutnaam, string> = {
  "dag-ernaast": "koos de dag die er vlak naast staat (1 dag te ver of te kort in de week)",
  "voor-na-verwisseld": "koos bij \"na\" de dag ervóór, of bij \"vóór\" de dag erna",
  "gisteren-morgen-verwisseld": "koos morgen in plaats van gisteren, of gisteren in plaats van morgen",
  "vandaag-gekozen": "koos de dag van vandaag (de dag met de pijl) in plaats van gisteren of morgen",
  "andere-dag": "koos een dag die verder weg ligt in de week (niet vlak ervoor of erna); geen reden verzonnen",
  schooldag: "koos een schooldag (maandag tot en met vrijdag) in plaats van een dag van het weekend",
  onduidelijk: "niet duidelijk: geen reden verzonnen",
};

/** Wat een zin beweert over de keuzes (voor de verklapcontrole van het script, 15.17): welke keuzes erna nog kunnen. */
export type Bewering = { soort: "alleen-c" } | { soort: "naast-c" } | { soort: "binnen-1-van"; dag: number };

export type Fout = {
  code: Denkfoutnaam;
  /** Welke uitleg bij de 2e fout hoort (dezelfde soort 2 keer = "weer"). */
  soort: string;
  denkfout: string;
  /** Bliepo's eerste zin: wat het kind koos + iets waars daarover. */
  eerste: string;
  hint: string;
  /** Uitleg na de 2e fout (daarna meteen samen voordoen); geen opdracht. */
  uitleg: string;
  /** Dezelfde denkfout 2 keer (en de 1e keer zei Bliepo al wat er mis was): anders uitleggen, zonder opdracht. */
  weer: string[];
  scherm: string;
  bewering: Bewering;
  /** Welke keuzes de eerste zin en de hint nog toelaten (voor de verklapcontrole van het script, 15.17). */
  over: number[];
};

const kies2 = <T,>(lijst: T[], nr: number) => lijst[nr % lijst.length];
/** "Je zit er vlak naast." in 3 versies over de les (geleerd bij Meer-minder en Plussommen: geen vaste zin). */
const NAAST = ["Je zit er vlak naast.", "Die staat er vlak naast.", "Je bent er heel dichtbij."];

const SCHERM = {
  wagon: "Bliepo's scherm 1,5 s rood (geen fout-geluidje); het vinkje gaat van de wagon; een rood rondje om de gekozen wagon zolang Bliepo hem noemt (nooit om het antwoord); dan de hint en het kind mag opnieuw kiezen (alle wagons blijven, geen pijl)",
  kaart: "Bliepo's scherm 1,5 s rood (geen fout-geluidje); het vinkje gaat van de kaart; een rood rondje om de gekozen kaart zolang Bliepo hem noemt (nooit om het antwoord); dan de hint en het kind mag opnieuw kiezen (alle 3 kaarten blijven, geen pijl)",
  sleep: "Bliepo's scherm 1,5 s rood (geen fout-geluidje); de kaart schuift terug naar beneden; een rood rondje om die kaart zolang Bliepo hem noemt; de hint is de nieuwe opdrachtzin (geen pijl)",
};

/** Welke denkfout bij een fout antwoord hoort (vaste regel, zodat het script elke combinatie kan nalopen). */
export function denkfoutVan(v: Vraag, c: number): Denkfoutnaam {
  const d = v.dag;
  if (v.soort === "tik" || v.soort === "mist") return Math.abs(c - d) === 1 ? "dag-ernaast" : "andere-dag";
  if (v.soort === "na") return c === voor(d) ? "voor-na-verwisseld" : "andere-dag";
  if (v.soort === "voor") return c === na(d) ? "voor-na-verwisseld" : "andere-dag";
  if (v.soort === "gm" || v.soort === "gmMaandag") {
    if (c === d) return "vandaag-gekozen";
    if (c === (v.wat === "gisteren" ? na(d) : voor(d))) return "gisteren-morgen-verwisseld";
    return "andere-dag";
  }
  return c === 5 || c === 6 ? "onduidelijk" : "schooldag";
}

/** Welke keuzes er na een bewering nog over zijn (het goede antwoord hoort erbij; minstens 2, 15.17). */
export function overNa(v: Vraag, c: number, b: Bewering): number[] {
  const rest = opties(v).filter((x) => x !== c);
  if (b.soort === "naast-c") return rest.filter((x) => Math.abs(x - c) === 1);
  if (b.soort === "binnen-1-van") return rest.filter((x) => afstand(x, b.dag) <= 1);
  return rest;
}

/** De fouttabel van 1 fout antwoord. `c` = de gekozen (of gesleepte) dag. */
export function dagFout(v: Vraag, c: number): Fout {
  const code = denkfoutVan(v, c);
  const denkfout = DENKFOUT_UITLEG[code];
  const d = v.dag;
  const maak = (f: Omit<Fout, "code" | "denkfout" | "over">): Fout => ({ ...f, code, denkfout, over: overNa(v, c, f.bewering) });

  /* Tik op de wagon van … (de hele trein). */
  if (v.soort === "tik") {
    const hint = kies2([`Lees de bordjes vanaf maandag, vooraan. Waar staat ${naam(d)}?`, `De week begint vooraan met maandag. Zeg de dagen op tot ${naam(d)}.`], v.nr);
    const uitleg = kies2(["De wagons staan op volgorde van de week. Maandag staat vooraan.", "Elke dag heeft een eigen wagon, met de naam op het bordje."], v.nr);
    /* "Vlak naast" alleen als er dan nog 2 wagons over zijn: een wagon aan het eind heeft maar 1 buur (15.17). */
    if (code === "dag-ernaast" && c > 0 && c < 6)
      return maak({ soort: code, eerste: `Je koos de wagon van ${naam(c)}. ${kies2(NAAST, v.nr)}`, hint, uitleg, weer: ["Je zat er weer vlak naast.", `Elke wagon is ${g(1)} dag. Ze staan op volgorde.`], scherm: SCHERM.wagon, bewering: { soort: "naast-c" } });
    return maak({ soort: `${code}-stil`, eerste: `Je koos de wagon van ${naam(c)}.`, hint, uitleg, weer: [], scherm: SCHERM.wagon, bewering: { soort: "alleen-c" } });
  }

  /* Welke dag komt na …? */
  if (v.soort === "na") {
    const hint = d === 6 ? kies2(["Na zondag begint een nieuwe week. Welke dag komt dan?", "Na de laatste dag begint de week opnieuw. Welke dag komt na zondag?"], v.nr) : kies2([`Na ${naam(d)} is de dag erachter. Welke dag komt na ${naam(d)}?`, `Zeg de dagen op, vanaf ${naam(d)}. Welke dag zeg je daarna?`], v.nr);
    const uitleg = d === 6 ? "Na zondag begint de week weer vooraan in de trein." : `Na ${naam(d)} komt de dag die er direct achter hangt.`;
    if (code === "voor-na-verwisseld") return maak({ soort: code, eerste: `Je koos ${naam(c)}. Die dag komt vóór ${naam(d)}.`, hint, uitleg, weer: [`Je koos weer de dag vóór ${naam(d)}.`, "Na is de dag erachter, niet de dag ervoor."], scherm: SCHERM.kaart, bewering: { soort: "alleen-c" } });
    return maak({ soort: code, eerste: `Je koos ${naam(c)}. Die dag komt niet direct na ${naam(d)}.`, hint, uitleg, weer: [`Je koos weer een dag die niet direct na ${naam(d)} komt.`, "Na is de dag die er direct achter komt."], scherm: SCHERM.kaart, bewering: { soort: "alleen-c" } });
  }

  /* Welke dag komt vóór …? */
  if (v.soort === "voor") {
    const hint = d === 0 ? kies2(["Vóór maandag was de vorige week. Hoe eindigt een week?", "Zeg de dagen van de week op, tot het eind. Welke dag komt vóór een nieuwe maandag?"], v.nr) : kies2([`Vóór ${naam(d)} is de dag ervoor. Welke dag komt vóór ${naam(d)}?`, `Zeg de dagen op tot ${naam(d)}. Welke dag zeg je net daarvoor?`], v.nr);
    const uitleg = d === 0 ? "Een week eindigt met zondag. Daarna begint een nieuwe week met maandag." : `Vóór ${naam(d)} komt de dag die er direct voor hangt.`;
    if (code === "voor-na-verwisseld") return maak({ soort: code, eerste: `Je koos ${naam(c)}. Die dag komt na ${naam(d)}.`, hint, uitleg, weer: [`Je koos weer de dag na ${naam(d)}.`, "Vóór is de dag ervoor, niet de dag erachter."], scherm: SCHERM.kaart, bewering: { soort: "alleen-c" } });
    return maak({ soort: code, eerste: `Je koos ${naam(c)}. Die dag komt niet direct vóór ${naam(d)}.`, hint, uitleg, weer: [`Je koos weer een dag die niet direct vóór ${naam(d)} komt.`, "Vóór is de dag die er direct voor komt."], scherm: SCHERM.kaart, bewering: { soort: "alleen-c" } });
  }

  /* Er mist een dag (slepen). Alle andere dagen hangen al in de trein. */
  if (v.soort === "mist") {
    const hint = d === 0 ? kies2(["Kijk naar de wagon achter de lege plek. Sleep de dag die daarvoor komt.", "Zeg de dagen op vanaf het begin van de week. Sleep de dag die mist."], v.nr) : kies2(["Kijk naar de wagons naast de lege plek. Sleep de dag die daartussen hoort.", "Zeg de dagen op vanaf maandag. Sleep de dag die mist."], v.nr);
    const uitleg = kies2([`Elke dag hangt ${g(1)} keer in de trein, op volgorde.`, "Op de lege plek hoort de dag die nog mist."], v.nr);
    if (code === "dag-ernaast") return maak({ soort: code, eerste: `Je sleepte ${naam(c)}. Die dag hangt al vlak naast de lege plek.`, hint, uitleg, weer: ["Je sleepte weer een dag die er al naast hangt.", `Elke dag hangt maar ${g(1)} keer in de trein.`], scherm: SCHERM.sleep, bewering: { soort: "alleen-c" } });
    return maak({ soort: code, eerste: `Je sleepte ${naam(c)}. Die dag hangt al ergens anders in de trein.`, hint, uitleg, weer: ["Je sleepte weer een dag die al in de trein hangt.", `Elke dag hangt maar ${g(1)} keer in de trein.`], scherm: SCHERM.sleep, bewering: { soort: "alleen-c" } });
  }

  /* Gisteren en morgen (de hele trein met de pijl; of "Vandaag is het maandag" met kaarten). */
  if (v.soort === "gm" || v.soort === "gmMaandag") {
    const gist = v.wat === "gisteren";
    const scherm = v.invoer === "kaart" ? SCHERM.kaart : SCHERM.wagon;
    const hint =
      v.soort === "gmMaandag"
        ? kies2(["Gisteren was nog de vorige week. Welke dag was het gisteren?", "Maandag is de eerste dag. Gisteren was de dag daarvoor. Welke dag was dat?"], v.nr)
        : gist
          ? kies2(["Gisteren is de dag vóór vandaag. Welke dag was het gisteren?", "Gisteren is al voorbij. Welke dag was het gisteren?"], v.nr)
          : kies2(["Morgen is de dag na vandaag. Welke dag is het morgen?", "Morgen moet nog komen. Welke dag is het morgen?"], v.nr);
    const uitleg = v.soort === "gmMaandag" ? "Vóór maandag komt de laatste dag van de vorige week." : gist ? "Gisteren is de dag vóór vandaag, de wagon ervoor." : "Morgen is de dag na vandaag, de wagon erachter.";
    if (code === "vandaag-gekozen") return maak({ soort: code, eerste: `Je koos ${naam(c)}. Dat is vandaag.`, hint, uitleg, weer: ["Je koos weer vandaag.", "Vandaag is de dag van de pijl."], scherm, bewering: { soort: "alleen-c" } });
    if (code === "gisteren-morgen-verwisseld")
      return maak({ soort: code, eerste: gist ? `Je koos ${naam(c)}. Dat is morgen.` : `Je koos ${naam(c)}. Dat was gisteren.`, hint, uitleg, weer: [gist ? "Je koos weer morgen." : "Je koos weer gisteren.", "Gisteren is voorbij, morgen moet nog komen."], scherm, bewering: { soort: "alleen-c" } });
    /* Een dag verder weg: geen richting (15.17), wel iets waars ("verder weg" = meer dan 1 dag van vandaag). */
    return maak({ soort: code, eerste: v.soort === "gmMaandag" ? `Je koos ${naam(c)}. Die dag komt niet direct vóór maandag.` : `Je koos ${naam(c)}. Die dag ligt verder van vandaag af.`, hint, uitleg, weer: v.soort === "gmMaandag" ? [] : ["Je koos weer een dag die verder van vandaag af ligt.", gist ? `Gisteren is maar ${g(1)} dag geleden.` : `Morgen is over ${g(1)} dag.`], scherm, bewering: v.soort === "gmMaandag" ? { soort: "alleen-c" } : { soort: "binnen-1-van", dag: d } });
  }

  /* Het weekend. */
  const hint =
    v.soort === "weekend1"
      ? kies2(["In het weekend is er geen school. Tik op een dag zonder school.", "Op een schooldag ga je naar school. Tik op een dag van het weekend."], v.nr)
      : kies2([`${Naam(d)} heb je al. Op welke andere dag is er geen school?`, `Het weekend heeft ${g(2)} dagen. ${Naam(d)} is er ${g(1)} van. Tik op de andere.`], v.nr);
  const uitleg = v.soort === "weekend1" ? "Het weekend is zaterdag en zondag." : "Zaterdag en zondag horen samen bij het weekend.";
  return maak({ soort: code, eerste: `Je koos ${naam(c)}. Dat is een schooldag.`, hint, uitleg, weer: ["Je koos weer een schooldag.", "Van maandag tot en met vrijdag is er school."], scherm: SCHERM.wagon, bewering: { soort: "alleen-c" } });
}

/** De fouttabel van een vraag: elk fout antwoord dat het kind kan kiezen. Sleutel = de dag (als tekst). */
export function foutenVan(v: Vraag): Record<string, Fout> {
  return Object.fromEntries(opties(v).filter((c) => !v.goed.includes(c)).map((c) => [String(c), dagFout(v, c)]));
}
