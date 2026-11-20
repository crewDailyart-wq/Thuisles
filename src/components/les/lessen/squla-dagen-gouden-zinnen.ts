/**
 * ALLE ZINNEN VAN BLIEPO in de gouden les Dagen (squla-dagen-van-de-week-gouden, "Dagen van de week", 11 november 2026),
 * op één plek, met de FOUTTABEL. De les zelf (squla-dagen-gouden.tsx) bevat geen eigen zinnen.
 *
 *   - De rijtjes (lof, momenten, naam, goed na een fout, einde, eerste zin als de denkfout niet duidelijk is, overgang)
 *     zijn dezelfde als in de andere gouden lessen (BLIEPO-KARAKTER.md). Hier alleen de reactie bij Dagen (in de geest
 *     van BLIEPO-KARAKTER.md §4 "Dagen en tijd", zin 51, 52 en 55), met zinnen zonder "Ja" voor na een lofzin met "Ja".
 *   - De inhoud (17 vragen, de weektrein, de dagkaarten en de goede antwoorden) is die van squla-dagen-van-de-week
 *     "Dagen van de week" (squla-dagen.tsx, BOUWREGELS 15.22): 3 keer "Tik op de wagon van …", 2 keer "Welke dag komt
 *     na …?", 2 keer "Welke dag komt voor …?", 3 keer "Er mist een dag in de trein" (slepen), gisteren en morgen, het
 *     weekend (2 vragen), na zondag, voor maandag en "Vandaag is het maandag. Welke dag was het gisteren?".
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
 *
 * 18 november 2026 (Sara: Bliepo klinkt als een warme juf; zelfde aanpak als Tellen, Splitsen, ..., Getallenlijn en Geld):
 * elke zin nagelopen; zinnen die terugkomen staan in rijtjes versies en de les kiest met de gedeelde kiezer
 * (nooit-dubbel.ts): nooit 2 keer achter elkaar dezelfde, ook niet over vragen heen. Een dagnaam en een getal klinken nooit
 * 2 keer vlak achter elkaar; na elke hint komt de vraag terug (15.37, F16). Oud naast nieuw: WIJZIGINGEN-ZINNEN-DAGEN.md.
 */

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
 * na/voor  een stukje trein met een lege plek; 3 dagkaarten; "Welke dag komt na/voor …?".
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

/* ---------- hulp voor de varianten (zuiver; de les en het fouttabel-script gebruiken precies dit) ---------- */

/** Zonder kleurcode: {7:wit} wordt 7. */
export const kaal = (z: string) => z.replace(/\{([^}:]+):[a-zA-Z]+\}/g, "$1");
/** De getallen in een zin. */
export const getallenIn = (z: string) => (kaal(z).match(/\d+/g) ?? []).map(Number);
/** Noemen 2 zinnen hetzelfde getal? (Sara, 18 nov 2026: een getal klinkt nooit 2 keer vlak achter elkaar.) */
export const deeltGetal = (a: string, b: string) => getallenIn(a).some((n) => getallenIn(b).includes(n));
/** De dagen die een zin noemt (als nummer, 0 = maandag). */
export const dagenIn = (z: string) => NAMEN.map((n, i) => (new RegExp(`\\b${n}\\b`, "i").test(kaal(z)) ? i : -1)).filter((i) => i >= 0);
/** Noemen 2 zinnen dezelfde dag? (Net als een getal: een dagnaam klinkt niet 2 keer vlak achter elkaar.) */
export const deeltDag = (a: string, b: string) => dagenIn(a).some((d) => dagenIn(b).includes(d));
/** Past zin `z` achter de zinnen `eerder`: geen getal, geen dagnaam en geen stuk van 4 woorden dat er net al was. */
export const pastNa =
  (...eerder: string[]) =>
  (z: string) =>
    eerder.every((a) => !deeltGetal(a, z) && !deeltDag(a, z) && !deeltStuk(a, z, 4));
/** Woorden die per vraag wisselen: "Je koos weer maandag." en "Je koos weer gisteren." tellen als dezelfde zin. */
export const WISSEL = [...NAMEN, "gisteren", "morgen", "vandaag", "wagon", "kaart", "na", "voor"];
/**
 * Zo lang mag 1 stuk tekst van Bliepo hooguit zijn (tekens, zonder kleurcodes), anders past het niet in het vaste
 * tekstvak (BOUWREGELS 15.30; ± 110 tekens is bij de gouden lessen het langste dat zeker past). Een harde eis: wat te
 * lang is gaat vooraf uit de lijst, niet als wens aan de kiezer.
 */
export const MAX_STUK = 110;
/** Past een stuk in het tekstvak: hooguit MAX_STUK tekens en hooguit 3 zinnen. */
export const past = (...delen: string[]) => {
  const t = kaal(delen.filter(Boolean).join(" "));
  return t.length <= MAX_STUK && t.split(/(?<=[.!?])\s+/).filter(Boolean).length <= 3;
};
/** Eindigt een stuk met een vraag of een opdracht die zegt wat het kind doet (15.37)? */
export const eindigtMetOpdracht = (z: string) => {
  const laatste = kaal(z).trim().split(/(?<=[.!?])\s+/).at(-1) ?? "";
  return /\?$/.test(laatste) || /^(?:Nu jij! )?(Tik|Sleep|Zoek|Kies)\b/.test(laatste);
};

/* ---------- vaste zinnen van het verloop (laag 1 van de gouden lessen; eigen woorden) ---------- */

export const ZIN = {
  /** Het begin (geen startvraag: er is geen draaiboek met een startvraag). Samen met de groet 1 stuk; in beeld de hele
      weektrein. De eerste versie is de oude zin; geen versie is langer (dan past het met de groet in het tekstvak). */
  start: [
    "In deze les leer je de dagen van de week. Ze rijden mee in de weektrein.",
    "Vandaag oefenen we de dagen van de week. Ze rijden in de weektrein.",
    "Kijk, de weektrein! Elke wagon is een dag van de week.",
  ],
  /** De vraag (de vraagzinnen van de oude les; "voor" is "voor" geworden, KEUZES Ronde 38). De eerste kaartvraag zegt
      wat het kind doet (3.15). Dezelfde soort vraag houdt dezelfde woorden (3.11): hier geen varianten. */
  vraag: (v: Vraag, eersteKaart: boolean): string[] => {
    if (v.soort === "tik") return [`Tik op de wagon van ${naam(v.dag)}.`];
    if (v.soort === "na") return [`Welke dag komt na ${naam(v.dag)}?`, ...(eersteKaart ? ["Tik op de goede wagon."] : [])];
    if (v.soort === "voor") return [`Welke dag komt voor ${naam(v.dag)}?`, ...(eersteKaart ? ["Tik op de goede wagon."] : [])];
    if (v.soort === "gm") return [`Vandaag is het ${naam(v.dag)}.`, v.wat === "gisteren" ? "Welke dag was het gisteren?" : "Welke dag is het morgen?"];
    if (v.soort === "gmMaandag") return ["Vandaag is het maandag.", "Welke dag was het gisteren?"];
    /* Oude les: "2 dagen samen heten het weekend." Een zin die met een cijfer begint leest lastig (KEUZES Ronde 38). */
    if (v.soort === "weekend1") return [`Het weekend heeft ${g(2)} dagen.`, "Tik op een dag van het weekend."];
    if (v.soort === "weekend2") return ["Tik op de andere dag van het weekend."];
    return ["Sleep de goede dag naar de lege plek."];
  },
  /** Na de hint van de 1e keer: de vraag kort, zodat het kind weet wat het doet (F1, F16; een nieuwe poging mag de vraag
      opnieuw stellen, 3.23). Elke versie is een vraag of een opdracht. Bij "Er mist een dag" is de hint zelf de opdracht. */
  opnieuw: (v: Vraag): string[] => {
    const d = naam(v.dag);
    if (v.soort === "tik") return [`Tik op de wagon van ${d}.`, `Waar is de wagon van ${d}? Tik erop.`, `Zoek de wagon van ${d}. Tik erop.`];
    if (v.soort === "na") return [`Welke dag komt na ${d}?`, `Welke dag komt na ${d}, denk je?`, `Kies nog een keer. Welke dag komt na ${d}?`];
    if (v.soort === "voor") return [`Welke dag komt voor ${d}?`, `Welke dag komt voor ${d}, denk je?`, `Kies nog een keer. Welke dag komt voor ${d}?`];
    if (v.wat === "gisteren") return ["Welke dag was het gisteren?", "Welke dag was het gisteren, denk je?", "Kies nog een keer. Welke dag was het gisteren?"];
    if (v.wat === "morgen") return ["Welke dag is het morgen?", "Welke dag is het morgen, denk je?", "Kies nog een keer. Welke dag is het morgen?"];
    if (v.soort === "weekend1") return ["Tik op een dag van het weekend.", "Tik op een dag zonder school.", "Zoek een dag van het weekend. Tik erop."];
    if (v.soort === "weekend2") return ["Tik op de andere dag van het weekend.", "Op welke andere dag is er geen school?", "Zoek de andere dag zonder school. Tik erop."];
    return ["Sleep de goede dag naar de lege plek."];
  },
  /** Bij "Er mist een dag": eerst wat er is (1 stuk, met de pijl), dan de opdracht (zoals de ketting bij Vormen). */
  mistIntro: ["Er mist een dag in de trein.", "Oei, er mist een dag in de trein!", "Kijk, er is een lege plek in de trein."],
  mistHand: ["Sleep een wagon naar de lege plek.", "Sleep maar een wagon naar de lege plek."],
  /** 2e keer mis: Bliepo doet het samen voor (eigen invulling, niet van Synthesis). "Geeft niks" zegt Synthesis hier ook. */
  samen: ["Kom, we kijken samen.", "We zoeken het samen.", "Kom, samen lukt het.", "Geeft niks. We kijken samen.", "Weet je wat? We zoeken het samen."],
  /** tik: Bliepo loopt met het rondje langs de wagons, vanaf maandag (vast tempo, de pijl slaat het over). Het begin noemt
      geen maandag meer: die dagnaam komt meteen erna. */
  samenTelBegin: ["We lopen samen langs de wagons.", "We lezen samen de bordjes, van voor naar achter.", "Kom, we gaan de trein langs. Ik begin vooraan."],
  samenTelDag: (d: number) => `${Naam(d)}.`,
  /** "Nu jij": het kind tikt de wagon of kaart met het rondje. De dag noemt Bliepo niet nog een keer (hij zei hem net). */
  samenWagonJij: ["Tik jij op de wagon in het rondje?", "Nu jij! Tik op de wagon in het rondje."],
  samenKaartJij: ["Tik jij op de wagon in het rondje?", "Nu jij! Tik op de losse wagon in het rondje."],
  samenTikKlaar: (d: number) => [`Ja, dat is de wagon van ${naam(d)}.`, `Goed zo! Dat is de wagon van ${naam(d)}.`, `Precies, daar rijdt ${naam(d)}.`],
  /* Na het vangnet (Bliepo deed de stap zelf): "Kijk, …", nooit "Ja" alsof het kind het deed (keuring Meer-minder). */
  samenTikZelf: (d: number) => [`Kijk, dit is de wagon van ${naam(d)}.`, `Kijk, ik tik hem aan. Dit is ${naam(d)}.`],
  /** na en voor: de hele trein, rondje om de dag van de vraag en dan om de goede dag. */
  samenHier: (d: number) => [`Hier is ${naam(d)} in de weektrein.`, `Kijk, hier rijdt ${naam(d)}.`, `Dit is de wagon van ${naam(d)}.`],
  samenNa: (d: number) =>
    d === 6
      ? ["Dit is de laatste wagon. Daarna begint de week weer met maandag.", "Daarna begint een nieuwe week. Die begint met maandag.", "Na de laatste dag komt weer maandag, vooraan."]
      : [`Erachter hangt ${naam(na(d))}.`, `Direct erachter rijdt ${naam(na(d))}.`, `De wagon erachter is ${naam(na(d))}.`],
  samenVoor: (d: number) =>
    d === 0
      ? ["Dit is de eerste wagon. De dag ervoor was zondag, de laatste van de vorige week.", "Ervoor was de vorige week. Die eindigde met zondag.", "Voor de eerste dag komt de laatste dag: zondag."]
      : [`Ervoor hangt ${naam(voor(d))}.`, `Direct ervoor rijdt ${naam(voor(d))}.`, `De wagon ervoor is ${naam(voor(d))}.`],
  samenNaKlaar: (d: number) => [`Ja, na ${naam(d)} komt ${naam(na(d))}.`, `Goed zo! Na ${naam(d)} komt ${naam(na(d))}.`, `Precies, ${naam(na(d))} komt direct na ${naam(d)}.`],
  samenNaZelf: (d: number) => [`Kijk, na ${naam(d)} komt ${naam(na(d))}.`, `Kijk, ik tik hem aan. Na ${naam(d)} komt ${naam(na(d))}.`],
  samenVoorKlaar: (d: number) => [`Ja, voor ${naam(d)} komt ${naam(voor(d))}.`, `Goed zo! Voor ${naam(d)} komt ${naam(voor(d))}.`, `Precies, ${naam(voor(d))} komt direct voor ${naam(d)}.`],
  samenVoorZelf: (d: number) => [`Kijk, voor ${naam(d)} komt ${naam(voor(d))}.`, `Kijk, ik tik hem aan. Voor ${naam(d)} komt ${naam(voor(d))}.`],
  /** Er mist een dag: rondje om de buren van de lege plek (1 rondje tegelijk, 7.8), dan om de goede kaart; het kind
      sleept hem. Per stap: [wat het rondje krijgt, wat Bliepo kan zeggen]. */
  samenMistBuren: (d: number): [string, string[]][] =>
    d === 0
      ? [["w1", ["De lege plek is de eerste wagon. Erachter hangt dinsdag.", "De lege plek staat vooraan. Daarachter rijdt dinsdag."]]]
      : d === 6
        ? [["w5", ["De lege plek is de laatste wagon. Ervoor hangt zaterdag.", "De lege plek staat achteraan. Daarvoor rijdt zaterdag."]]]
        : [
            [`w${voor(d)}`, [`Voor de lege plek hangt ${naam(voor(d))}.`, `Kijk, voor de lege plek rijdt ${naam(voor(d))}.`]],
            [`w${na(d)}`, [`Erachter hangt ${naam(na(d))}.`, `En erachter rijdt ${naam(na(d))}.`]],
          ],
  samenMistDag: (d: number) => (d === 0 ? ["De dag voor dinsdag is maandag.", "Dus vooraan hoort maandag."] : [`Daartussen hoort ${naam(d)}.`, `Op de lege plek hoort dus ${naam(d)}.`, `Daar tussenin hoort ${naam(d)}.`]),
  samenMistJij: ["Sleep jij de wagon in het rondje naar de lege plek?", "Nu jij! Sleep de wagon in het rondje naar de lege plek."],
  samenMistKlaar: ["Ja, nu is de trein weer heel.", "Goed zo! De trein is weer heel.", "Precies, nu rijden alle dagen weer mee."],
  samenMistZelf: (d: number) => [`Kijk, ${naam(d)} hoort op de lege plek.`, `Kijk, ik sleep hem erin. Nu rijdt ${naam(d)} weer mee.`],
  /** Gisteren en morgen. */
  samenVandaag: (v: number) => (v === 0 ? ["Vandaag is het maandag, de eerste dag van de week.", "Kijk, hier is vandaag: maandag, de eerste dag."] : [`Vandaag is het ${naam(v)}.`, `Kijk, hier is vandaag: ${naam(v)}.`, `De pijl staat bij ${naam(v)}. Dat is vandaag.`]),
  samenGm: (v: number, wat: "gisteren" | "morgen") =>
    wat === "gisteren"
      ? v === 0
        ? ["Gisteren was nog de vorige week: zondag.", "Gisteren hoorde bij de vorige week. Dat was zondag."]
        : [`Gisteren is de dag ervoor: ${naam(voor(v))}.`, `De wagon ervoor is ${naam(voor(v))}. Dat was gisteren.`]
      : [`Morgen is de dag erna: ${naam(na(v))}.`, `De wagon erachter is ${naam(na(v))}. Dat is morgen.`],
  samenGmKlaar: (a: number, wat: "gisteren" | "morgen") =>
    wat === "gisteren" ? [`Ja, gisteren was het ${naam(a)}.`, `Goed zo! Gisteren was het ${naam(a)}.`, `Precies, gisteren was ${naam(a)}.`] : [`Ja, morgen is het ${naam(a)}.`, `Goed zo! Morgen is het ${naam(a)}.`, `Precies, morgen is ${naam(a)}.`],
  samenGmZelf: (a: number, wat: "gisteren" | "morgen") => (wat === "gisteren" ? [`Kijk, gisteren was het ${naam(a)}.`, `Kijk, ik tik hem aan. Gisteren was het ${naam(a)}.`] : [`Kijk, morgen is het ${naam(a)}.`, `Kijk, ik tik hem aan. Morgen is het ${naam(a)}.`]),
  /** Het weekend (1 rondje om zaterdag en zondag samen). */
  samenWeekend: ["Zaterdag en zondag zijn het weekend. Ze staan achteraan.", "Kijk, achteraan rijden zaterdag en zondag. Dat is het weekend."],
  samenWeekendJij: ["Tik jij op zaterdag of zondag?", "Nu jij! Tik op een wagon in het rondje."],
  samenWeekendKlaar: (d: number) => [`Ja, ${naam(d)} hoort bij het weekend.`, `Goed zo! ${Naam(d)} is weekend.`, `Precies, op ${naam(d)} is er geen school.`],
  samenWeekendZelf: ["Kijk, zaterdag hoort bij het weekend.", "Kijk, ik tik zaterdag aan. Dat is weekend."],
  samenWeekend2: (ander: number) => [`${Naam(ander)} hoort ook bij het weekend.`, `Kijk, ${naam(ander)} is ook weekend.`],
  samenWeekend2Klaar: ["Ja, zaterdag en zondag zijn samen het weekend.", "Goed zo! Nu heb je het hele weekend.", `Precies, dat zijn de ${g(2)} dagen van het weekend.`],
  samenWeekend2Zelf: ["Kijk, zaterdag en zondag zijn samen het weekend.", "Kijk, ik tik hem aan. Nu heb je allebei de dagen."],
  /** Het hulphandje bij de kleine stap. */
  handWagon: ["Tik op de wagon in het rondje.", "Tik maar op de wagon in het rondje."],
  handKaart: ["Tik op de losse wagon in het rondje.", "Tik maar op de losse wagon in het rondje."],
  handSleep: ["Sleep de wagon in het rondje naar de lege plek.", "Sleep maar de wagon in het rondje naar de lege plek."],
  /** Vangnet bij slepen: lang niets nagekeken. */
  mistVangnet: ["Deze doen we samen.", "Ik help je even."],
  /** Hetzelfde antwoord 2 keer: niet 2 keer dezelfde eerste zin (geleerd bij Tellen). Bliepo zegt wat hij ziet. */
  weerGekozen: (v: Vraag, c: number) =>
    v.invoer === "sleep" ? [`Je sleepte weer ${naam(c)}.`, `Weer ${naam(c)}, zie ik.`, `Dat is weer ${naam(c)}.`] : [`Je koos weer ${naam(c)}.`, `Weer ${naam(c)}, zie ik.`, `Je tikte weer op ${naam(c)}.`],
  /** Het einde. */
  slot: ["Nu ken je de dagen van de week.", "Je hebt goed gewerkt vandaag! Je kent nu de dagen van de week.", "Mooi gewerkt! Je weet nu hoe de week loopt."],
  kaartTik: ["Tik op de kaart.", "Tik maar op de kaart.", "Kijk, een kaart voor jou! Tik erop."],
};

/** Aanmoediging bij het hulphandje (het kind moet tikken of slepen, niet nadenken; 14.35, geleerd bij Tellen; dezelfde 5 als daar). */
export const AANMOEDIG_DOEN = ["Je bent goed bezig.", "Jij kunt dit.", "Het gaat goed zo.", "Probeer het maar.", "Toe maar, je doet het goed."];

/* ---------- reactie na de lof (BLIEPO-KARAKTER.md §4 Dagen en tijd, zin 51, 52, 55, plus zinnen zonder "Ja") ---------- */

/** De robotzin (plek 4) hooguit 1 keer per les. Zin 0 en 1 beginnen met "Ja". Nieuwe versies (18 nov) komen achteraan. */
export function dagenReactie(v: Vraag, dag: number): Rijtje {
  const d = v.dag;
  if (v.soort === "tik") return rij([`Ja, dit is de wagon van ${naam(d)}.`, `Ja, op het bordje staat ${naam(d)}.`, `Dat is de wagon van ${naam(d)}.`, `${Naam(d)} heeft een eigen wagon.`, `Zie je, je vond ${naam(d)}.`, `Precies, dit is ${naam(d)}.`, `Dat klopt, daar rijdt ${naam(d)}.`], [4]);
  if (v.soort === "na")
    return d === 6
      ? rij(["Ja, na zondag begint de week weer met maandag.", "Ja, na zondag komt maandag.", "Na de laatste dag begint de week opnieuw.", "Maandag komt direct na zondag.", "Zie je, de trein begint weer bij maandag.", "Precies, dan begint de week weer.", "Dat klopt, maandag is weer de eerste dag."], [4])
      : rij([`Ja, na ${naam(d)} komt ${naam(na(d))}.`, `Ja, ${naam(na(d))} hangt achter ${naam(d)}.`, `${Naam(na(d))} komt direct na ${naam(d)}.`, `Na ${naam(d)} is het ${naam(na(d))}.`, `Zie je, ${naam(na(d))} is de volgende dag.`, `Precies, daarna komt ${naam(na(d))}.`, `Dat klopt, ${naam(na(d))} hangt erachter.`], [4]);
  if (v.soort === "voor")
    return d === 0
      ? rij(["Ja, voor maandag komt zondag.", "Ja, de week ervoor eindigde met zondag.", "Zondag komt direct voor maandag.", "Voor maandag was het zondag.", "Zie je, zondag is de dag ervoor.", "Precies, de vorige week eindigde met zondag.", "Dat klopt, zondag was de laatste dag."], [4])
      : rij([`Ja, voor ${naam(d)} komt ${naam(voor(d))}.`, `Ja, ${naam(voor(d))} hangt voor ${naam(d)}.`, `${Naam(voor(d))} komt direct voor ${naam(d)}.`, `Voor ${naam(d)} is het ${naam(voor(d))}.`, `Zie je, ${naam(voor(d))} is de dag ervoor.`, `Precies, daarvoor komt ${naam(voor(d))}.`, `Dat klopt, ${naam(voor(d))} hangt ervoor.`], [4]);
  if (v.soort === "mist")
    return rij([`Ja, ${naam(d)} hoort op die plek.`, `Ja, nu zijn alle ${g(7)} dagen er weer.`, d === 0 ? "Maandag is de eerste dag van de week." : `${Naam(d)} komt na ${naam(voor(d))}.`, "De trein is weer heel.", `Zie je, er hangen weer ${g(7)} wagons aan de trein.`, `Precies, nu rijdt ${naam(d)} weer mee.`, "Dat klopt, nu mist er niets meer."], [4]);
  if (v.soort === "gm" || v.soort === "gmMaandag") {
    const a = v.goed[0];
    return v.wat === "gisteren"
      ? rij([`Ja, gisteren was het ${naam(a)}.`, `Ja, ${naam(a)} is ${g(1)} dag terug.`, `Gisteren was het ${naam(a)}.`, `${Naam(a)} komt direct voor ${naam(d)}.`, `Zie je, ${naam(a)} was ${g(1)} dag geleden.`, `Precies, ${naam(a)} was gisteren.`, `Dat klopt, ${naam(a)} is al voorbij.`], [4])
      : rij([`Ja, morgen is het ${naam(a)}.`, `Ja, ${naam(a)} is ${g(1)} dag verder.`, `Morgen is het ${naam(a)}.`, `${Naam(a)} komt direct na ${naam(d)}.`, `Zie je, ${naam(a)} komt over ${g(1)} dag.`, `Precies, ${naam(a)} is morgen.`, `Dat klopt, ${naam(a)} moet nog komen.`], [4]);
  }
  if (v.soort === "weekend1") return rij([`Ja, ${naam(dag)} hoort bij het weekend.`, "Ja, dat is een dag van het weekend.", `${Naam(dag)} is een dag zonder school.`, "In het weekend is er geen school.", `Zie je, op ${naam(dag)} ben je vrij.`, `Precies, ${naam(dag)} is weekend.`, "Dat klopt, dan is er geen school."], [4]);
  return rij(["Ja, zaterdag en zondag zijn het weekend.", "Ja, nu heb je ze allebei.", `Het weekend heeft ${g(2)} dagen.`, "Dan is er geen school.", "Zie je, je vond allebei de vrije dagen.", "Precies, nu heb je het hele weekend.", "Dat klopt, allebei de dagen zijn weekend."], [4]);
}
export const REACTIE_JA = [0, 1];
export const REACTIE_ROBOT = 4;

/* ---------- denkfouten (eigen invulling, niet van Synthesis; namen voor de voortgang) ---------- */

export const DENKFOUTEN = ["dag-ernaast", "voor-na-verwisseld", "gisteren-morgen-verwisseld", "vandaag-gekozen", "andere-dag", "schooldag", "onduidelijk"] as const;
export type Denkfoutnaam = (typeof DENKFOUTEN)[number];

export const DENKFOUT_UITLEG: Record<Denkfoutnaam, string> = {
  "dag-ernaast": "koos de dag die er vlak naast staat (1 dag te ver of te kort in de week)",
  "voor-na-verwisseld": "koos bij \"na\" de dag ervoor, of bij \"voor\" de dag erna",
  "gisteren-morgen-verwisseld": "koos morgen in plaats van gisteren, of gisteren in plaats van morgen",
  "vandaag-gekozen": "koos de dag van vandaag (de dag met de pijl) in plaats van gisteren of morgen",
  "andere-dag": "koos een dag die verder weg ligt in de week (niet vlak ervoor of erna); geen reden verzonnen",
  schooldag: "koos een schooldag (maandag tot en met vrijdag) in plaats van een dag van het weekend",
  onduidelijk: "niet duidelijk: geen reden verzonnen",
};

/** Wat een zin beweert over de keuzes (voor de verklapcontrole van het script, 15.17): welke keuzes erna nog kunnen. */
export type Bewering = { soort: "alleen-c" } | { soort: "naast-c" } | { soort: "binnen-1-van"; dag: number };

/** Alle versies van wat Bliepo bij 1 antwoord kan zeggen; de les kiest met de gedeelde kiezer (nooit-dubbel.ts). */
export type Varianten = {
  /** De eerste zin (wat het kind koos). */
  eerste: string[];
  /** De hint bij de 1e keer. Bij kiezen komt de vraag er meteen achteraan (`opnieuwZin`), behalve als de hint zelf al
      met een opdracht eindigt. Bij "Er mist een dag" is de hint de nieuwe opdracht. Geen hint eindigt met een vraag. */
  hint: string[];
  /** Uitleg bij de 2e keer (geen opdracht: daarna doet Bliepo het samen voor). */
  uitleg: string[];
  /** Dezelfde denkfout 2 keer: "weer …" en een andere uitleg. Leeg = dan gewoon de eerste zin en de uitleg. */
  weerEerste: string[];
  weerUitleg: string[];
};

export type Fout = {
  code: Denkfoutnaam;
  /** Welke uitleg bij de 2e fout hoort (dezelfde soort 2 keer = "weer"). */
  soort: string;
  denkfout: string;
  /** De eerste versie van elke zin (voor de tabel). */
  eerste: string;
  hint: string;
  uitleg: string;
  weer: string[];
  /** Alle versies. */
  v: Varianten;
  scherm: string;
  bewering: Bewering;
  /** Welke keuzes de eerste zin en de hint nog toelaten (voor de verklapcontrole van het script, 15.17). */
  over: number[];
};

const SCHERM = {
  wagon: "Bliepo's scherm 1,5 s rood (geen fout-geluidje); het vinkje gaat van de wagon; een rood rondje om de gekozen wagon zolang Bliepo hem noemt (nooit om het antwoord); dan de hint met de vraag erachter en het kind mag opnieuw kiezen (alle wagons blijven, geen pijl)",
  kaart: "Bliepo's scherm 1,5 s rood (geen fout-geluidje); het vinkje gaat van de kaart; een rood rondje om de gekozen kaart zolang Bliepo hem noemt (nooit om het antwoord); dan de hint met de vraag erachter en het kind mag opnieuw kiezen (alle 3 kaarten blijven, geen pijl)",
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

/* Hints en uitleg in versies, zodat het kind niet steeds dezelfde zin hoort (eigen invulling, niet van Synthesis). */
const HINT = {
  /* Tik op de wagon van …: de vraag (met de dag) komt erachter. De 2e versie is van de logica-controle (F16) en eindigt
     zelf met de opdracht; daar komt niets meer achter. */
  tik: (d: number) => [
    "Lees de bordjes vanaf maandag, vooraan.",
    `De week begint vooraan met maandag. Zeg de dagen op tot ${naam(d)}. Tik dan op die wagon.`,
    "Lees de bordjes van voor naar achter.",
    "De wagons staan op volgorde van de week.",
  ],
  /* Welke dag komt na …? Geen dagnaam: de vraag erachter noemt de dag al. */
  na: ["Na is de dag die erachter komt.", "Zeg de dagen op, vanaf het begin van de week.", "De dag erna hoort op de lege plek.", "De lege plek is de wagon erachter."],
  naZondag: ["Na de laatste dag begint de week opnieuw.", "Na het weekend begint een nieuwe week.", "Zeg de dagen op tot het eind. Dan begint de week weer."],
  voor: ["Voor is de dag die ervoor komt.", "Zeg de dagen op, vanaf het begin van de week.", "De dag ervoor hoort op de lege plek.", "De lege plek is de wagon ervoor."],
  voorMaandag: ["Ervoor was de vorige week.", "Zeg de dagen van de week op, tot het eind.", "Denk aan het eind van de vorige week."],
  /* Er mist een dag: de hint is de nieuwe opdracht (sleep). */
  mist: ["Kijk naar de wagons naast de lege plek. Sleep de dag die daartussen hoort.", "Zeg de dagen op vanaf maandag. Sleep de dag die mist.", "Welke dag hangt er niet in de trein? Sleep die naar de lege plek.", "Lees de bordjes naast de lege plek. Sleep de dag die daar hoort."],
  mistVooraan: ["Kijk naar de wagon achter de lege plek. Sleep de dag die daarvoor komt.", "Zeg de dagen op vanaf het begin van de week. Sleep de dag die mist.", "Welke dag hangt er niet in de trein? Sleep die naar de lege plek."],
  gisteren: ["Gisteren is de dag voor vandaag.", "Gisteren is al voorbij.", "Gisteren is de wagon voor vandaag.", "Bij de pijl is het vandaag."],
  morgen: ["Morgen is de dag na vandaag.", "Morgen moet nog komen.", "Morgen is de wagon achter vandaag.", "Bij de pijl is het vandaag."],
  maandag: ["Gisteren was nog de vorige week.", "Maandag is de eerste dag. Gisteren was de dag daarvoor.", "Denk aan het eind van de vorige week."],
  weekend1: ["In het weekend is er geen school.", "Op een schooldag ga je naar school.", "Het weekend zijn de dagen zonder school."],
  weekend2: (d: number) => [`${Naam(d)} heb je al.`, `${Naam(d)} is ${g(1)} van de ${g(2)} dagen van het weekend.`, "Er is nog een dag zonder school."],
};
const UITLEG = {
  tik: ["Maandag staat vooraan. Daarna komen de andere dagen, op volgorde.", "Elke dag heeft een eigen wagon, met de naam op het bordje.", "De trein rijdt met de dagen op volgorde, net als de week."],
  na: (d: number) => [`Na ${naam(d)} komt de dag die er direct achter hangt.`, "Na is altijd de dag erachter in de week.", "De dag erna hangt direct achter de andere."],
  naZondag: ["Na zondag begint de week weer vooraan in de trein.", `Een week heeft ${g(7)} dagen. Daarna begint de week opnieuw.`, "Na de laatste dag begint een nieuwe week."],
  voor: (d: number) => [`Voor ${naam(d)} komt de dag die er direct voor hangt.`, "Voor is altijd de dag ervoor in de week.", "De dag ervoor hangt direct voor de andere."],
  voorMaandag: ["Een week eindigt met zondag. Daarna begint een nieuwe week met maandag.", "Voor de eerste dag komt het eind van de vorige week.", "De vorige week eindigde met de laatste dag."],
  mist: [`Elke dag hangt ${g(1)} keer in de trein, op volgorde.`, "Op de lege plek hoort de dag die nog mist.", `Een week heeft ${g(7)} dagen. Er rijden er nu ${g(6)} mee.`],
  gisteren: ["Gisteren is de dag voor vandaag, de wagon ervoor.", "Gisteren is de dag die net voorbij is.", "Eerst was het gisteren, nu is het vandaag."],
  morgen: ["Morgen is de dag na vandaag, de wagon erachter.", "Morgen is de dag die nu nog komt.", "Eerst is het vandaag, daarna morgen."],
  maandag: ["Voor maandag komt de laatste dag van de vorige week.", "Gisteren hoort bij de vorige week.", "De vorige week eindigde gisteren."],
  weekend1: ["Het weekend is zaterdag en zondag.", "Van maandag tot en met vrijdag is er school.", "In het weekend ga je niet naar school."],
  weekend2: ["Zaterdag en zondag horen samen bij het weekend.", `Het weekend heeft ${g(2)} dagen, achteraan in de week.`, "Op een schooldag ga je naar school. In het weekend niet."],
};
/** Dezelfde denkfout 2 keer: op een andere manier uitleggen dan UITLEG (15.9 punt 2), zonder opdracht. */
const ANDERS = {
  naast: [`Elke wagon is ${g(1)} dag. Ze staan op volgorde.`, "De dagen staan in de trein op volgorde van de week."],
  na: ["Na is de dag erachter, niet de dag ervoor.", "Na kijk je vooruit in de week, niet terug."],
  naVer: ["Na is de dag die er direct achter komt.", "De dag erna hangt meteen erachter, niet verder."],
  voor: ["Voor is de dag ervoor, niet de dag erachter.", "Voor kijk je terug in de week, niet vooruit."],
  voorVer: ["Voor is de dag die er direct voor komt.", "De dag ervoor hangt meteen ervoor, niet verder."],
  mist: [`Elke dag hangt maar ${g(1)} keer in de trein.`, "Wat al in de trein hangt, hoort niet op de lege plek.", "Elke wagon heeft een andere dag."],
  vandaag: ["Vandaag is de dag van de pijl.", "De pijl wijst naar vandaag. We zoeken een andere dag."],
  gm: ["Gisteren is voorbij, morgen moet nog komen.", "Gisteren was de dag ervoor. Morgen is de dag erna."],
  gisterenVer: [`Gisteren is maar ${g(1)} dag geleden.`, "Gisteren ligt vlak naast vandaag."],
  morgenVer: [`Morgen is over ${g(1)} dag.`, "Morgen ligt vlak naast vandaag."],
  school: ["Van maandag tot en met vrijdag is er school.", "Op zaterdag en zondag is er geen school."],
};

/** De fouttabel van 1 fout antwoord. `c` = de gekozen (of gesleepte) dag. */
export function dagFout(v: Vraag, c: number): Fout {
  const code = denkfoutVan(v, c);
  const denkfout = DENKFOUT_UITLEG[code];
  const d = v.dag;
  const n = naam(c);
  const N = Naam(c);
  const D = naam(d);
  const maak = (f: { soort?: string; v: Varianten; scherm: string; bewering: Bewering }): Fout => ({
    code,
    soort: f.soort ?? code,
    denkfout,
    eerste: f.v.eerste[0],
    hint: f.v.hint[0],
    uitleg: f.v.uitleg[0],
    weer: f.v.weerEerste.length ? [f.v.weerEerste[0], f.v.weerUitleg[0]] : [],
    v: f.v,
    scherm: f.scherm,
    bewering: f.bewering,
    over: overNa(v, c, f.bewering),
  });

  /* Tik op de wagon van … (de hele trein). */
  if (v.soort === "tik") {
    /* "Vlak naast" alleen als er dan nog 2 wagons over zijn: een wagon aan het eind heeft maar 1 buur (15.17). */
    if (code === "dag-ernaast" && c > 0 && c < 6)
      return maak({
        v: { eerste: [`Je koos de wagon van ${n}. Je zit er vlak naast.`, `${N}? Die wagon staat er vlak naast.`, `Je tikte op ${n}. Je bent er heel dichtbij.`], hint: HINT.tik(d), uitleg: UITLEG.tik, weerEerste: ["Je zat er weer vlak naast.", "Weer vlak ernaast, zie ik."], weerUitleg: ANDERS.naast },
        scherm: SCHERM.wagon,
        bewering: { soort: "naast-c" },
      });
    return maak({ soort: `${code}-stil`, v: { eerste: [`Je koos de wagon van ${n}.`, `Je tikte op ${n}.`, `Dit is de wagon van ${n}.`], hint: HINT.tik(d), uitleg: UITLEG.tik, weerEerste: [], weerUitleg: [] }, scherm: SCHERM.wagon, bewering: { soort: "alleen-c" } });
  }

  /* Welke dag komt na …? */
  if (v.soort === "na") {
    const hint = d === 6 ? HINT.naZondag : HINT.na;
    const uitleg = d === 6 ? UITLEG.naZondag : UITLEG.na(d);
    if (code === "voor-na-verwisseld")
      return maak({ v: { eerste: [`Je koos ${n}. Die dag komt voor ${D}.`, `${N}? Die dag hangt voor ${D}.`, `Je tikte op ${n}. Die dag komt ervoor, niet erna.`], hint, uitleg, weerEerste: [`Je koos weer de dag voor ${D}.`, "Weer de dag ervoor, zie ik."], weerUitleg: ANDERS.na }, scherm: SCHERM.kaart, bewering: { soort: "alleen-c" } });
    return maak({ v: { eerste: [`Je koos ${n}. Die dag komt niet direct na ${D}.`, `${N}? Die hangt niet direct achter ${D}.`, `Je tikte op ${n}. Die dag ligt verder weg.`], hint, uitleg, weerEerste: [`Je koos weer een dag die niet direct na ${D} komt.`, "Weer een dag verder weg, zie ik."], weerUitleg: ANDERS.naVer }, scherm: SCHERM.kaart, bewering: { soort: "alleen-c" } });
  }

  /* Welke dag komt voor …? */
  if (v.soort === "voor") {
    const hint = d === 0 ? HINT.voorMaandag : HINT.voor;
    const uitleg = d === 0 ? UITLEG.voorMaandag : UITLEG.voor(d);
    if (code === "voor-na-verwisseld")
      return maak({ v: { eerste: [`Je koos ${n}. Die dag komt na ${D}.`, `${N}? Die dag hangt achter ${D}.`, `Je tikte op ${n}. Die dag komt erna, niet ervoor.`], hint, uitleg, weerEerste: [`Je koos weer de dag na ${D}.`, "Weer de dag erna, zie ik."], weerUitleg: ANDERS.voor }, scherm: SCHERM.kaart, bewering: { soort: "alleen-c" } });
    return maak({ v: { eerste: [`Je koos ${n}. Die dag komt niet direct voor ${D}.`, `${N}? Die hangt niet direct voor ${D}.`, `Je tikte op ${n}. Die dag ligt verder weg.`], hint, uitleg, weerEerste: [`Je koos weer een dag die niet direct voor ${D} komt.`, "Weer een dag verder weg, zie ik."], weerUitleg: ANDERS.voorVer }, scherm: SCHERM.kaart, bewering: { soort: "alleen-c" } });
  }

  /* Er mist een dag (slepen). Alle andere dagen hangen al in de trein. */
  if (v.soort === "mist") {
    const hint = d === 0 ? HINT.mistVooraan : HINT.mist;
    if (code === "dag-ernaast")
      return maak({ v: { eerste: [`Je sleepte ${n}. Die dag hangt al vlak naast de lege plek.`, `${N}? Die hangt al naast de lege plek.`, `Je sleepte ${n}. Die dag rijdt al mee, vlak ernaast.`], hint, uitleg: UITLEG.mist, weerEerste: ["Je sleepte weer een dag die er al naast hangt.", "Weer een dag die er al naast hangt, zie ik."], weerUitleg: ANDERS.mist }, scherm: SCHERM.sleep, bewering: { soort: "alleen-c" } });
    return maak({ v: { eerste: [`Je sleepte ${n}. Die dag hangt al ergens anders in de trein.`, `${N}? Die rijdt al mee in de trein.`, `Je sleepte ${n}. Die dag heeft al een wagon.`], hint, uitleg: UITLEG.mist, weerEerste: ["Je sleepte weer een dag die al in de trein hangt.", "Weer een dag die al meerijdt, zie ik."], weerUitleg: ANDERS.mist }, scherm: SCHERM.sleep, bewering: { soort: "alleen-c" } });
  }

  /* Gisteren en morgen (de hele trein met de pijl; of "Vandaag is het maandag" met kaarten). */
  if (v.soort === "gm" || v.soort === "gmMaandag") {
    const gist = v.wat === "gisteren";
    const scherm = v.invoer === "kaart" ? SCHERM.kaart : SCHERM.wagon;
    const hint = v.soort === "gmMaandag" ? HINT.maandag : gist ? HINT.gisteren : HINT.morgen;
    const uitleg = v.soort === "gmMaandag" ? UITLEG.maandag : gist ? UITLEG.gisteren : UITLEG.morgen;
    if (code === "vandaag-gekozen")
      return maak({ v: { eerste: [`Je koos ${n}. Dat is vandaag.`, `${N}? Dat is vandaag, bij de pijl.`, "Je tikte op de dag van vandaag."], hint, uitleg, weerEerste: ["Je koos weer vandaag.", "Weer vandaag, zie ik."], weerUitleg: ANDERS.vandaag }, scherm, bewering: { soort: "alleen-c" } });
    if (code === "gisteren-morgen-verwisseld")
      return maak({
        v: gist
          ? { eerste: [`Je koos ${n}. Dat is morgen.`, `${N}? Dat is morgen, de dag erna.`, `Je tikte op ${n}. Die dag moet nog komen.`], hint, uitleg, weerEerste: ["Je koos weer morgen.", "Weer morgen, zie ik."], weerUitleg: ANDERS.gm }
          : { eerste: [`Je koos ${n}. Dat was gisteren.`, `${N}? Dat was gisteren, de dag ervoor.`, `Je tikte op ${n}. Die dag is al voorbij.`], hint, uitleg, weerEerste: ["Je koos weer gisteren.", "Weer gisteren, zie ik."], weerUitleg: ANDERS.gm },
        scherm,
        bewering: { soort: "alleen-c" },
      });
    /* Een dag verder weg: geen richting (15.17), wel iets waars ("verder weg" = meer dan 1 dag van vandaag). */
    if (v.soort === "gmMaandag")
      return maak({ v: { eerste: [`Je koos ${n}. Die dag komt niet direct voor maandag.`, `${N}? Die hangt niet direct voor maandag.`, `Je tikte op ${n}. Die dag ligt verder weg.`], hint, uitleg, weerEerste: [], weerUitleg: [] }, scherm, bewering: { soort: "alleen-c" } });
    return maak({
      v: { eerste: [`Je koos ${n}. Die dag ligt verder van vandaag af.`, `${N}? Die dag ligt verder weg van vandaag.`, `Je tikte op ${n}. Die is verder weg.`], hint, uitleg, weerEerste: ["Je koos weer een dag die verder van vandaag af ligt.", "Weer een dag verder weg, zie ik."], weerUitleg: gist ? ANDERS.gisterenVer : ANDERS.morgenVer },
      scherm,
      bewering: { soort: "binnen-1-van", dag: d },
    });
  }

  /* Het weekend. */
  return maak({
    v: { eerste: [`Je koos ${n}. Dat is een schooldag.`, `${N}? Dan ga je naar school.`, `Je tikte op ${n}. Die dag hoort niet bij het weekend.`], hint: v.soort === "weekend1" ? HINT.weekend1 : HINT.weekend2(d), uitleg: v.soort === "weekend1" ? UITLEG.weekend1 : UITLEG.weekend2, weerEerste: ["Je koos weer een schooldag.", "Weer een schooldag, zie ik."], weerUitleg: ANDERS.school },
    scherm: SCHERM.wagon,
    bewering: { soort: "alleen-c" },
  });
}

/** De fouttabel van een vraag: elk fout antwoord dat het kind kan kiezen. Sleutel = de dag (als tekst). */
export function foutenVan(v: Vraag): Record<string, Fout> {
  return Object.fromEntries(opties(v).filter((c) => !v.goed.includes(c)).map((c) => [String(c), dagFout(v, c)]));
}

/* ---------- welke versie Bliepo zegt (zuiver: de les en het fouttabel-script gebruiken precies dit) ---------- */

/** De kiezer van de les (nooit-dubbel.ts): een zin uit `zinnen`, nooit 2 keer achter elkaar dezelfde binnen 1 `sleutel`. */
export type Variant = (sleutel: string, zinnen: readonly string[], mag?: (z: string) => boolean) => string;

/** Een ander antwoord bij de 2e keer: "Nu koos je …" in plaats van weer "Je koos …" (keuring Tellen en Splitsen). */
export const nuKoos = (z: string) => z.replace(/^Je koos /, "Nu koos je ").replace(/^Je tikte op /, "Nu tikte je op ").replace(/^Je sleepte /, "Nu sleepte je ");

/**
 * Wat Bliepo zegt bij een antwoord dat niet goed is.
 *   1e keer: eerste zin (wat het kind koos) + hint. De hint herhaalt geen getal, geen dagnaam en geen stuk uit de eerste zin.
 *   2e keer: eerste zin + uitleg; of, bij 2 keer dezelfde denkfout, "weer …" + een andere uitleg; of, bij hetzelfde
 *   antwoord 2 keer, "Je koos weer …" + uitleg. Daarna doet Bliepo het samen met het kind voor.
 * `onduidelijk` = een zin uit het vaste rijtje (BLIEPO-KARAKTER.md §10) als de denkfout niet duidelijk is.
 */
export function foutStuk(variant: Variant, f: Fout, v: Vraag, poging: 1 | 2, eerder: Fout | null, o: { x: number; zelfdeAntwoord: boolean; onduidelijk: () => string }): string[] {
  const hintSleutel = v.invoer === "sleep" ? "hintOpdracht" : "hint";
  if (f.code === "onduidelijk") {
    const e = o.onduidelijk();
    return poging === 1 ? [e, variant(hintSleutel, f.v.hint, pastNa(e))] : [e, variant("uitleg", f.v.uitleg, pastNa(e))];
  }
  if (poging === 1) {
    const e = variant("eerste", f.v.eerste);
    return [e, variant(hintSleutel, f.v.hint, pastNa(e))];
  }
  /* "Weer" alleen als Bliepo de 1e keer al zei wat er mis was. */
  if (eerder !== null && eerder.soort === f.soort && eerder.code !== "onduidelijk" && f.v.weerEerste.length > 0) {
    const weer = variant("weer", f.v.weerEerste);
    return [weer, variant("uitleg", f.v.weerUitleg, pastNa(weer))];
  }
  const e = o.zelfdeAntwoord ? variant("weerGekozen", ZIN.weerGekozen(v, o.x)) : variant("eerste", eerder ? [...f.v.eerste, nuKoos(f.v.eerste[0])] : f.v.eerste);
  return [e, variant("uitleg", f.v.uitleg, pastNa(e))];
}

/**
 * De vraag opnieuw na de hint (bij kiezen): een vraag of opdracht die samen met de hint in het tekstvak past en geen
 * dagnaam of getal uit de hint herhaalt. Eindigt de hint zelf al met een opdracht ("Tik dan op die wagon."), dan niets.
 */
export function opnieuwZin(variant: Variant, v: Vraag, hint: string): string {
  if (v.invoer === "sleep" || eindigtMetOpdracht(hint)) return "";
  const alle = ZIN.opnieuw(v);
  const passend = alle.filter((z) => past(hint, z) && !deeltDag(hint, z) && !deeltGetal(hint, z));
  return variant(`opnieuw-${v.soort}`, passend.length ? passend : alle);
}
