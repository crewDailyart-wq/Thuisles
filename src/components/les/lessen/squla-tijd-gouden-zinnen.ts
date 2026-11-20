/**
 * ALLE ZINNEN VAN BLIEPO in de gouden les Tijd (squla-tijd-dagen-1-gouden, "Dagen van de week", 11 november 2026), op
 * één plek, met de FOUTTABEL. De les zelf (squla-tijd-gouden.tsx) bevat geen eigen zinnen.
 *
 *   - De rijtjes (lof, momenten, naam, goed na een fout, einde, eerste zin als de denkfout niet duidelijk is, overgang)
 *     zijn dezelfde als in de andere gouden lessen (BLIEPO-KARAKTER.md). Hier alleen de reactie bij deze les (in de geest
 *     van BLIEPO-KARAKTER.md §4 "Dagen en tijd"), met zinnen zonder "Ja" voor na een lofzin met "Ja".
 *   - De inhoud (12 vragen + 3 die aan het eind terugkomen, de weektrein, de dagkaarten, de getallen en de goede
 *     antwoorden) is die van squla-tijd-dagen-1 "Dagen van de week" level 1 (squla-tijd.tsx, BOUWREGELS 15.22): de eerste
 *     en de laatste dag van de week, het weekend (hoeveel dagen, welke dagen), 7 keer "Welke dag komt meteen na …?" en
 *     "Hoeveel dagen heeft een week?". Daarna komen 3 vragen terug: eerst wat niet meteen goed was, aangevuld met vraag 1,
 *     3 en 9 (zoals de oude les).
 *   - GEEN SYNTHESIS-LES: Synthesis heeft geen les over dagen, de week of de kalender (KOPPELING.md §10). Het skelet is
 *     exact dat van de andere gouden lessen (laag 1: LESRECEPT.md en BLIEPO-KARAKTER.md). Alles wat per onderwerp anders
 *     is (de denkfouten, de eerste zinnen, de hints, de uitleg en het samen voordoen) is "EIGEN INVULLING, NIET VAN
 *     SYNTHESIS" (BOUWREGELS 15.22, 15.25; SYNTHESIS-ANALYSE/DRAAIBOEKEN-NIEUW/tijd.md).
 *   - WARME ZINNEN IN VARIANTEN (Sara, 18 november 2026; zoals de proefles Tellen en de lessen Geld en Klok): voor elke
 *     situatie die terugkomt een rijtje versies. De les kiest met de gedeelde kiezer (nooit-dubbel.ts): nooit 2 keer
 *     achter elkaar dezelfde zin, ook niet over vragen heen. Een getal of een dagnaam klinkt nooit 2 keer vlak achter
 *     elkaar. Oud naast nieuw: WIJZIGINGEN-ZINNEN-TIJD.md.
 *
 * Leesbare versie: FOUTTABEL-squla-tijd-dagen-1-gouden.md (maak hem opnieuw met `npx tsx scripts/fouttabel-tijd-gouden.ts`;
 * dat script keurt ELKE variant: verklappen, waarheid, lengte, vraag of opdracht, en speelt de kiezer 20.000 keer na).
 *
 * Getalkleur (BOUWREGELS 2.1, 2.2, 14.20, 14.27): "2 dagen", "7 dagen", "5 dagen" verwijzen naar wagons van verschillende
 * kleuren of naar niets in beeld (de getallen op de knoppen): wit (zoals bij de gouden les Dagen).
 */

import type { Rijtje } from "./squla-klok-gouden-zinnen";
import { deeltStuk, maakVorm } from "./nooit-dubbel";

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
export const LEEG7: (number | null)[] = [null, null, null, null, null, null, null];
export const naam = (d: number) => NAMEN[d];
export const Naam = (d: number) => NAMEN[d][0].toUpperCase() + NAMEN[d].slice(1);
/** De dag erna en de dag ervoor (de week gaat rond: na zondag komt maandag). */
export const na = (d: number) => (d + 1) % 7;
export const voor = (d: number) => (d + 6) % 7;
/** Een kaart als sleutel ("5-6") en terug. */
export const sleutel = (dagen: number[]) => dagen.join("-");
export const dagenVan = (s: string) => s.split("-").map(Number);
/** De naam van een kaart: "maandag" of "zaterdag en zondag". */
export const kaartNaam = (s: string) => dagenVan(s).map(naam).join(" en ");
const KaartNaam = (s: string) => {
  const k = kaartNaam(s);
  return k[0].toUpperCase() + k.slice(1);
};

/* ---------- de 12 vragen van squla-tijd-dagen-1 (zelfde volgorde, zelfde dagen, zelfde kaarten, zelfde getallen) ---------- */

/**
 * eerste          "Wat is de eerste dag van de week?": een lege trein (7 lege plekken), 3 dagkaarten.
 * laatste         "Wat is de laatste dag van de week?": idem.
 * weekendHoeveel  "In het weekend ga je niet naar school. Hoeveel dagen heeft het weekend?": alleen de locomotief; 3
 *                 getallen (knoppen bij Bliepo). Na het antwoord rijdt de hele trein binnen.
 * weekendWelke    "Op welke dagen is het weekend?": een lege trein, 3 kaarten met elk 2 dagen.
 * na              "Welke dag komt meteen na …?": een stukje trein [dag, lege plek] en 3 dagkaarten.
 * hoeveelWeek     "Hoeveel dagen heeft een week?": alleen de locomotief; 3 getallen. Na het antwoord de hele trein.
 */
export type Soort = "eerste" | "laatste" | "weekendHoeveel" | "weekendWelke" | "na" | "hoeveelWeek";
export type Invoer = "kaart" | "getal";
export type Vraag = {
  nr: number;
  id: string;
  soort: Soort;
  invoer: Invoer;
  /** na: de dag in de vraag; anders -1. */
  dag: number;
  /** De keuzes: kaartsleutels ("0", "5-6") of getallen ("2"), in de volgorde van de oude les (de les schudt ze). */
  keuzes: string[];
  /** Het goede antwoord (1 per vraag). */
  goed: string;
  /** Een vraag die aan het eind terugkomt (eigen id; de les kiest dan een andere hint dan de eerste keer). */
  terug?: boolean;
};

const kaart = (nr: number, soort: Soort, kaarten: number[][], goed: number[]): Vraag => ({ nr, id: `vraag${nr}-${soort}`, soort, invoer: "kaart", dag: -1, keuzes: kaarten.map(sleutel), goed: sleutel(goed) });
const getal = (nr: number, soort: Soort, opties: number[], goed: number): Vraag => ({ nr, id: `vraag${nr}-${soort}`, soort, invoer: "getal", dag: -1, keuzes: opties.map(String), goed: String(goed) });
const naV = (nr: number, d: number, kaarten: number[]): Vraag => ({ nr, id: `vraag${nr}-na-${naam(d)}`, soort: "na", invoer: "kaart", dag: d, keuzes: kaarten.map(String), goed: String(na(d)) });

export const VRAGEN: Vraag[] = [
  kaart(1, "eerste", [[2], [0], [6]], [0]),
  kaart(2, "laatste", [[5], [1], [6]], [6]),
  getal(3, "weekendHoeveel", [1, 2, 5], 2),
  kaart(4, "weekendWelke", [[3, 4], [5, 6], [6, 0]], [5, 6]),
  naV(5, 0, [2, 1, 6]),
  naV(6, 3, [4, 2, 5]),
  naV(7, 2, [1, 6, 3]),
  naV(8, 5, [4, 6, 0]),
  naV(9, 6, [0, 5, 1]),
  getal(10, "hoeveelWeek", [6, 7, 8], 7),
  naV(11, 1, [2, 0, 4]),
  naV(12, 4, [3, 5, 6]),
];
/** Welke vragen terugkomen als het kind niets (of minder dan 3) miste: de reserve van de oude les (vraag 1, 3 en 9). */
export const RESERVE = [0, 2, 8];
/** Een vraag die aan het eind terugkomt: eigen id. */
export const alsTerug = (v: Vraag): Vraag => ({ ...v, id: `${v.id}-terug`, terug: true });

/** Wat er in beeld staat bij de vraag (zoals de oude les). `null` = een lege plek; `[]` = alleen de locomotief. */
export function beeldVan(v: Vraag): (number | null)[] {
  if (v.soort === "na") return [v.dag, null];
  if (v.soort === "weekendHoeveel" || v.soort === "hoeveelWeek") return [];
  return LEEG7;
}
/** Het beeld na een goed antwoord: de lege plek is gevuld, of de hele trein rijdt binnen. */
export function naGoedBeeld(v: Vraag): (number | null)[] {
  if (v.soort === "na") return [v.dag, na(v.dag)];
  if (v.soort === "eerste") return [0, null, null, null, null, null, null];
  if (v.soort === "laatste") return [null, null, null, null, null, null, 6];
  if (v.soort === "weekendWelke") return [null, null, null, null, null, 5, 6];
  return ALLE;
}
/** Het rondje bij de lof (alleen als de reactie die wagons noemt; 7.8): bij het weekend zaterdag en zondag. */
export const lofLicht = (v: Vraag): string[] => (v.soort === "weekendHoeveel" ? ["w5", "w6"] : []);

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
/** Woorden die per vraag wisselen: "Je koos weer maandag." en "Je koos weer zondag en maandag." tellen als dezelfde zin. */
export const WISSEL = [...NAMEN];
/** Dezelfde zin? (getallen en dagnamen weggedacht; zoals de kiezer telt). */
export const vorm = maakVorm(WISSEL);
/**
 * Zo lang mag 1 stuk tekst van Bliepo hooguit zijn (tekens, zonder kleurcodes), anders past het niet in het vaste
 * tekstvak (BOUWREGELS 15.30; ± 110 tekens is bij de gouden lessen het langste dat zeker past). Een harde eis: wat te
 * lang is gaat vooraf uit de lijst, niet als wens aan de kiezer.
 */
export const MAX_STUK = 110;
export const past = (...delen: string[]) => kaal(delen.filter(Boolean).join(" ")).length <= MAX_STUK;
/** Eindigt een stuk met een vraag of een opdracht die zegt wat het kind doet (15.37)? */
export const eindigtMetOpdracht = (z: string) => {
  const laatste = kaal(z).trim().split(/(?<=[.!?])\s+/).at(-1) ?? "";
  return /\?$/.test(laatste) || /^(?:Nu jij! )?(Tik|Kies)\b/.test(laatste);
};

/* ---------- vaste zinnen van het verloop (laag 1 van de gouden lessen; eigen woorden) ---------- */

export const ZIN = {
  /** Het begin (geen startvraag: er is geen draaiboek met een startvraag). Samen met de groet 1 stuk; in beeld de hele
      weektrein. De eerste versie is de oude zin; geen versie is langer (dan past het met de groet in het tekstvak). */
  start: [
    "In deze les leer je hoe een week in elkaar zit. Elke dag is een wagon van de weektrein.",
    "Vandaag leren we hoe de week loopt. Elke dag is een wagon van de weektrein.",
    "Kijk, de weektrein! Elke wagon is een dag. Samen zijn ze een week.",
  ],
  /** De vraag (de vraagzinnen van de oude les). De eerste kaartvraag zegt wat het kind doet (3.15). Dezelfde soort vraag
      houdt dezelfde woorden (3.11): hier geen varianten. */
  vraag: (v: Vraag, eersteKaart: boolean): string[] => {
    const tik = eersteKaart ? ["Tik op de goede kaart."] : [];
    if (v.soort === "eerste") return ["Wat is de eerste dag van de week?", ...tik];
    if (v.soort === "laatste") return ["Wat is de laatste dag van de week?", ...tik];
    if (v.soort === "weekendHoeveel") return ["In het weekend ga je niet naar school.", "Hoeveel dagen heeft het weekend?"];
    if (v.soort === "weekendWelke") return ["Op welke dagen is het weekend?", ...tik];
    if (v.soort === "na") return [`Welke dag komt meteen na ${naam(v.dag)}?`, ...tik];
    return ["Hoeveel dagen heeft een week?"];
  },
  /** Na de hint van de 1e keer: de vraag kort terug, zodat het kind weet wat het doet (F1, F16, 15.37). Nooit precies
      dezelfde zin als de 1e keer, wel dezelfde vraag (3.11). Elke versie is een vraag. */
  opnieuw: (v: Vraag): string[] => {
    if (v.soort === "eerste") return ["Wat is de eerste dag van de week, denk je?", "Kies nog een keer. Wat is de eerste dag van de week?", "Welke dag komt als eerste in de week?"];
    if (v.soort === "laatste") return ["Wat is de laatste dag van de week, denk je?", "Kies nog een keer. Wat is de laatste dag van de week?", "Welke dag komt als laatste in de week?"];
    if (v.soort === "weekendHoeveel") return ["Hoeveel dagen heeft het weekend, denk je?", "Kies nog een keer. Hoeveel dagen heeft het weekend?", "Hoeveel vrije dagen heeft het weekend?"];
    if (v.soort === "weekendWelke") return ["Op welke dagen is het weekend, denk je?", "Kies nog een keer. Op welke dagen is het weekend?", "Welke kaart heeft alleen vrije dagen?"];
    if (v.soort === "na") {
      const d = naam(v.dag);
      return [`Welke dag komt meteen na ${d}, denk je?`, `Kies nog een keer. Welke dag komt meteen na ${d}?`, `Welke dag hoort meteen achter ${d}?`];
    }
    return ["Hoeveel dagen heeft een week, denk je?", "Kies nog een keer. Hoeveel dagen heeft een week?", "Hoeveel dagen zijn het samen?"];
  },
  /** 2e fout: Bliepo doet het samen voor (eigen invulling, niet van Synthesis). "Geeft niks" zegt Synthesis hier ook. */
  samen: ["Kom, we kijken samen.", "We zoeken het samen.", "Kom, samen lukt het.", "Geeft niks. We kijken samen.", "Weet je wat? We zoeken het samen."],
  /** De hele weektrein komt in beeld. (Wordt sinds 11 november niet meer gezegd; blijft staan, harde regel 3.) */
  samenTrein: "Hier is de hele weektrein.",
  /** De eerste en de laatste dag (rondje om die wagon). */
  samenEerste: ["Vooraan, vlak achter de locomotief, hangt maandag. Daar begint de week.", "Kijk, de eerste wagon achter de locomotief is maandag.", "Maandag rijdt vooraan. Daar begint de week mee."],
  samenLaatste: ["Helemaal achteraan hangt zondag. Daar eindigt de week.", "Kijk, de allerlaatste wagon is zondag.", "Zondag rijdt achteraan. Daar eindigt de week mee."],
  /** "Nu jij": het kind tikt de kaart met het rondje. De dag noemt Bliepo niet nog een keer (hij zei hem net). */
  samenKaartJij: ["Tik jij op de kaart in het rondje?", "Nu jij! Tik op de kaart in het rondje."],
  samenEersteKlaar: ["Ja, maandag is de eerste dag van de week.", "Goed zo! Maandag is de eerste dag van de week.", "Precies, de week begint met maandag."],
  /* Na het vangnet (Bliepo deed de stap zelf): "Kijk, …", nooit "Ja" alsof het kind het deed (keuring Meer-minder). */
  samenEersteZelf: ["Kijk, maandag is de eerste dag van de week.", "Kijk, ik tik hem aan. Maandag is de eerste dag."],
  samenLaatsteKlaar: ["Ja, zondag is de laatste dag van de week.", "Goed zo! Zondag is de laatste dag van de week.", "Precies, de week eindigt met zondag."],
  samenLaatsteZelf: ["Kijk, zondag is de laatste dag van de week.", "Kijk, ik tik hem aan. Zondag is de laatste dag."],
  /** Het weekend: eerst de schooldagen (1 rondje), dan zaterdag en zondag (1 rondje). */
  samenSchool: ["Van maandag tot en met vrijdag ga je naar school.", "Kijk, dit zijn de schooldagen: van maandag tot en met vrijdag.", "Op deze dagen is er school, van maandag tot en met vrijdag."],
  samenWeekendDagen: ["Op zaterdag en zondag is er geen school. Dat is het weekend.", "Zaterdag en zondag zijn vrij. Samen heten ze het weekend.", "Achteraan rijden zaterdag en zondag. Dat is het weekend."],
  samenWeekendTel: [`Daarna komen zaterdag en zondag. Dat zijn ${g(2)} dagen zonder school.`, `Dan zaterdag en zondag: ${g(2)} vrije dagen.`, `Zaterdag en zondag zijn vrij. Dat zijn ${g(2)} dagen.`],
  samenWelkeKlaar: ["Ja, zaterdag en zondag zijn het weekend.", "Goed zo! Zaterdag en zondag zijn het weekend.", "Precies, op die dagen is er geen school."],
  samenWelkeZelf: ["Kijk, zaterdag en zondag zijn het weekend.", "Kijk, ik tik hem aan. Dit is het weekend."],
  /** Meteen na: de hele trein, rondje om de dag van de vraag en dan om de goede dag. */
  samenHier: (d: number) => [`Hier is ${naam(d)} in de weektrein.`, `Kijk, hier rijdt ${naam(d)}.`, `Dit is de wagon van ${naam(d)}.`],
  /* Bij zondag staat het rondje om maandag (vooraan): de zin praat over maandag, niet over "deze laatste wagon". */
  samenNa: (d: number) =>
    d === 6
      ? ["Daarna begint de week weer vooraan, met maandag.", "Na de laatste wagon begint een nieuwe week. Die begint met maandag.", "Na de laatste dag komt weer maandag, vooraan."]
      : [`Erachter hangt ${naam(na(d))}.`, `Direct erachter rijdt ${naam(na(d))}.`, `De wagon erachter is ${naam(na(d))}.`],
  samenNaKlaar: (d: number) => [`Ja, meteen na ${naam(d)} komt ${naam(na(d))}.`, `Goed zo! Meteen na ${naam(d)} komt ${naam(na(d))}.`, `Precies, ${naam(na(d))} komt meteen na ${naam(d)}.`],
  samenNaZelf: (d: number) => [`Kijk, meteen na ${naam(d)} komt ${naam(na(d))}.`, `Kijk, ik tik hem aan. Na ${naam(d)} komt ${naam(na(d))}.`],
  /** Hoeveel dagen heeft een week: Bliepo loopt met het rondje langs de wagons (vast tempo, de pijl slaat het over). Het
      begin noemt geen maandag meer: die dagnaam komt meteen erna. */
  samenTelBegin: ["We lopen samen langs de wagons.", "We lezen samen de bordjes, van voor naar achter.", "Kom, we gaan de trein langs. Ik begin vooraan."],
  samenTelDag: (d: number) => `${Naam(d)}.`,
  samenWeekTel: [`Elke wagon is een dag. Samen zijn het ${g(7)} wagons.`, `Dat zijn ${g(7)} wagons. Elke wagon is een dag.`, `We kwamen langs ${g(7)} wagons. Bij elke wagon hoort een dag.`],
  /** De kleine stap bij een getal: het kind tikt het getal (de enige knop). Het getal noemt Bliepo niet nog een keer. */
  samenGetalJij: ["Tik jij op het getal?", "Nu jij! Tik op het getal.", "Tik jij het getal nu aan?"],
  samenWeekendKlaar: [`Ja, het weekend heeft ${g(2)} dagen.`, `Goed zo! Het weekend heeft ${g(2)} dagen.`, `Precies, zaterdag en zondag: ${g(2)} dagen.`],
  samenWeekKlaar: [`Ja, een week heeft ${g(7)} dagen.`, `Goed zo! Een week heeft ${g(7)} dagen.`, `Precies, de week heeft ${g(7)} dagen.`],
  /** Het hulphandje bij de kleine stap. */
  handKaart: ["Tik op de kaart in het rondje.", "Tik maar op de kaart in het rondje."],
  /** Hetzelfde foute antwoord 2 keer: niet 2 keer dezelfde eerste zin (geleerd bij Tellen). Bliepo zegt wat hij ziet. */
  weerGekozen: (v: Vraag, x: string) => {
    const w = v.invoer === "getal" ? g(Number(x)) : kaartNaam(x);
    return [`Je koos weer ${w}.`, `Weer ${w}, zie ik.`, `Je tikte weer op ${w}.`];
  },
  /** De vragen die terugkomen (de oude les: eerst wat niet meteen goed was, aangevuld met vaste vragen). */
  terug1: [`Er komt nog ${g(1)} vraag van net terug.`, `We doen nog ${g(1)} vraag van net.`, `Nog ${g(1)} vraag van net. Die oefenen we nog even.`],
  terugN: (n: number) => [`Nu komen er nog ${g(n)} vragen van net terug.`, `We doen nog ${g(n)} vragen van net.`, `Nog ${g(n)} vragen van net. Die oefenen we nog even.`],
  extra1: [`Nog ${g(1)} vraag om te oefenen.`, `We oefenen nog ${g(1)} vraag.`],
  extraN: (n: number) => [`We oefenen er nog ${g(n)} van net.`, `Nog ${g(n)} vragen om te oefenen.`],
  terugLastig: ["Die oefenen we een andere keer nog eens.", "Dit oefenen we een andere keer nog eens. Dat komt goed."],
  /** Het einde. */
  slot: ["Nu weet je hoe een week in elkaar zit.", "Je hebt goed gewerkt vandaag! Je kent nu de dagen van de week.", "Mooi gewerkt! Je weet nu hoe de week loopt."],
  kaartTik: ["Tik op de kaart.", "Tik maar op de kaart.", "Kijk, een kaart voor jou! Tik erop."],
};

/** Aanmoediging bij het hulphandje (het kind moet tikken, niet nadenken; 14.35, geleerd bij Tellen; dezelfde 5 als daar). */
export const AANMOEDIG_DOEN = ["Je bent goed bezig.", "Jij kunt dit.", "Het gaat goed zo.", "Probeer het maar.", "Toe maar, je doet het goed."];

/* ---------- reactie na de lof (BLIEPO-KARAKTER.md §4 Dagen en tijd, plus zinnen zonder "Ja") ---------- */

/** De robotzin (plek 4) hooguit 1 keer per les. Zin 0 en 1 beginnen met "Ja". Nieuwe versies (18 nov) komen achteraan. */
export function tijdReactie(v: Vraag): Rijtje {
  const d = v.dag;
  if (v.soort === "eerste") return rij(["Ja, maandag is de eerste dag van de week.", "Ja, de week begint met maandag.", "Op maandag begint de school weer.", "Maandag hangt vooraan in de trein.", `Zie je, maandag is dag ${g(1)} van de week.`, "Precies, maandag is de eerste dag.", "Dat klopt, met maandag begint de week."], [4]);
  if (v.soort === "laatste") return rij(["Ja, zondag is de laatste dag van de week.", "Ja, de week eindigt met zondag.", "Na zondag begint er een nieuwe week.", "Zondag hangt achteraan in de trein.", `Zie je, zondag is dag ${g(7)} van de week.`, "Precies, zondag is de laatste dag.", "Dat klopt, met zondag eindigt de week."], [4]);
  if (v.soort === "weekendHoeveel") return rij([`Ja, het weekend heeft ${g(2)} dagen: zaterdag en zondag.`, "Ja, zaterdag en zondag zijn samen het weekend.", `Zaterdag en zondag: dat zijn ${g(2)} dagen.`, "Op zaterdag en zondag is er geen school.", `Zie je, op zaterdag en zondag ben je ${g(2)} dagen vrij.`, "Precies, zaterdag en zondag zijn vrij.", "Dat klopt, het weekend is zaterdag en zondag."], [4]);
  if (v.soort === "weekendWelke") return rij(["Ja, zaterdag en zondag zijn het weekend.", "Ja, op die dagen is er geen school.", "Zaterdag en zondag horen bij het weekend.", "In het weekend is er geen school.", `Zie je, je vond de ${g(2)} dagen zonder school.`, "Precies, dat is het weekend.", "Dat klopt, op die dagen ben je vrij."], [4]);
  if (v.soort === "na")
    return d === 6
      ? rij(["Ja, na zondag begint de week weer met maandag.", "Ja, meteen na zondag komt maandag.", "Na de laatste dag begint de week opnieuw.", "Maandag komt direct na zondag.", "Zie je, de trein begint weer bij maandag.", "Precies, dan begint de week weer.", "Dat klopt, maandag is weer de eerste dag."], [4])
      : rij([`Ja, meteen na ${naam(d)} komt ${naam(na(d))}.`, `Ja, ${naam(na(d))} hangt achter ${naam(d)}.`, `${Naam(na(d))} komt direct na ${naam(d)}.`, `Na ${naam(d)} is het ${naam(na(d))}.`, `Zie je, ${naam(na(d))} is de volgende dag.`, `Precies, daarna komt ${naam(na(d))}.`, `Dat klopt, ${naam(na(d))} hangt erachter.`], [4]);
  return rij([`Ja, een week heeft ${g(7)} dagen.`, "Ja, van maandag tot en met zondag.", `Dat zijn ${g(7)} wagons, van maandag tot en met zondag.`, "Elke dag heeft een eigen wagon.", `Zie je, de week telt ${g(7)} dagen.`, `Precies, ${g(7)} dagen in een week.`, "Dat klopt, elke dag telt mee."], [4]);
}
export const REACTIE_JA = [0, 1];
export const REACTIE_ROBOT = 4;

/* ---------- denkfouten (eigen invulling, niet van Synthesis; namen voor de voortgang) ---------- */

export const DENKFOUTEN = ["eerste-laatste-verwisseld", "dag-ernaast", "andere-dag", "voor-na-verwisseld", "schooldagen", "schooldag-erbij", "een-te-weinig", "een-te-veel", "onduidelijk"] as const;
export type Denkfoutnaam = (typeof DENKFOUTEN)[number];

export const DENKFOUT_UITLEG: Record<Denkfoutnaam, string> = {
  "eerste-laatste-verwisseld": "koos de laatste dag (zondag) bij de vraag naar de eerste dag",
  "dag-ernaast": "koos de dag vlak voor de laatste dag (zaterdag) bij de vraag naar de laatste dag",
  "andere-dag": "koos een dag die niet vooraan, niet achteraan of niet meteen erna komt; geen reden verzonnen",
  "voor-na-verwisseld": "koos bij \"meteen na\" de dag ervoor",
  schooldagen: "koos de schooldagen (5 dagen, of donderdag en vrijdag) in plaats van het weekend",
  "schooldag-erbij": "koos 1 dag van het weekend met een schooldag erbij (zondag en maandag)",
  "een-te-weinig": "koos een getal dat te klein is (1 dag weekend, 6 dagen in een week)",
  "een-te-veel": "koos een getal dat te groot is (8 dagen in een week)",
  onduidelijk: "niet duidelijk: geen reden verzonnen",
};

/** Wat een zin beweert over de keuzes (voor de verklapcontrole van het script, 15.17): welke keuzes erna nog kunnen. */
export type Bewering = { soort: "alleen-c" } | { soort: "groter-dan"; n: number } | { soort: "kleiner-dan"; n: number };

/** Alle versies van wat Bliepo bij 1 antwoord kan zeggen; de les kiest met de gedeelde kiezer (nooit-dubbel.ts). */
export type Varianten = {
  /** De eerste zin (wat het kind koos + iets waars daarover). */
  eerste: string[];
  /** De hint bij de 1e keer: zonder vraag komt de vraag er meteen achteraan (`opnieuwZin`); met een eigen vraag niets. */
  hint: string[];
  /** Uitleg bij de 2e keer (geen opdracht: daarna doet Bliepo het samen voor). */
  uitleg: string[];
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
  /** Dezelfde denkfout 2 keer met een ander antwoord: komt in deze les niet voor (elke denkfout hoort bij 1 antwoord per
      vraag). Hetzelfde antwoord 2 keer: "Je koos weer …" (ZIN.weerGekozen). */
  weer: string[];
  /** Alle versies. */
  v: Varianten;
  scherm: string;
  /** Rondje om de gekozen kaart (alleen bij een kaart; een getal is een knop bij Bliepo). */
  rondje: boolean;
  bewering: Bewering;
  /** Welke keuzes de eerste zin en de hint nog toelaten (voor de verklapcontrole van het script, 15.17). */
  over: string[];
};

const SCHERM = {
  kaart: "Bliepo's scherm 1,5 s rood (geen fout-geluidje); het vinkje gaat van de kaart; een rood rondje om de gekozen kaart zolang Bliepo hem noemt (nooit om het antwoord); dan de hint met de vraag erachter en het kind mag opnieuw kiezen (alle 3 kaarten blijven, geen pijl)",
  getal: "Bliepo's scherm 1,5 s rood (geen fout-geluidje); de knoppen weg; Bliepo zegt wat het kind koos (geen rondje: het antwoord is een knop, in beeld staat alleen de locomotief); dan komen dezelfde 3 knoppen terug met de hint en de vraag erachter (geen pijl)",
};

/** Welke denkfout bij een fout antwoord hoort (vaste regel, zodat het script elke combinatie kan nalopen). */
export function denkfoutVan(v: Vraag, x: string): Denkfoutnaam {
  if (v.soort === "eerste") return x === "6" ? "eerste-laatste-verwisseld" : "andere-dag";
  if (v.soort === "laatste") return x === "5" ? "dag-ernaast" : "andere-dag";
  if (v.soort === "weekendHoeveel") return x === "5" ? "schooldagen" : Number(x) < 2 ? "een-te-weinig" : "een-te-veel";
  if (v.soort === "weekendWelke") return dagenVan(x).every((d) => d < 5) ? "schooldagen" : "schooldag-erbij";
  if (v.soort === "na") return Number(x) === voor(v.dag) ? "voor-na-verwisseld" : "andere-dag";
  return Number(x) < 7 ? "een-te-weinig" : "een-te-veel";
}

/** Welke keuzes er na een bewering nog over zijn (het goede antwoord hoort erbij; minstens 2, 15.17). */
export function overNa(v: Vraag, x: string, b: Bewering): string[] {
  const rest = v.keuzes.filter((k) => k !== x);
  if (b.soort === "groter-dan") return rest.filter((k) => Number(k) > b.n);
  if (b.soort === "kleiner-dan") return rest.filter((k) => Number(k) < b.n);
  return rest;
}

/* Hints en uitleg in versies, zodat het kind niet steeds dezelfde zin hoort (eigen invulling, niet van Synthesis). Geen
   hint noemt het antwoord (15.17). Een hint zonder vraag krijgt de vraag meteen erachter (`opnieuwZin`); een hint die
   zelf al met een eigen vraag eindigt (de oude hints, zoals "Welke dag zeg je als eerste?"), krijgt niets erachter: zo
   staan er nooit 2 vragen achter elkaar (F16, 3.23). */
const HINT = {
  eerste: ["Zeg de dagen van de week op. Welke dag zeg je als eerste?", "Na het weekend begint een nieuwe week.", "Denk aan de dag waarop de schoolweek begint."],
  laatste: ["Zeg de dagen van de week op. Welke dag zeg je als laatste?", "Na de laatste dag begint een nieuwe week.", "Denk aan het eind van de week."],
  weekendHoeveel: ["Het weekend zijn de vrije dagen.", "Denk aan de dagen waarop je vrij bent.", "Denk aan de dagen na vrijdag."],
  weekendWelke: [`In het weekend ben je vrij. Welke kaart heeft ${g(2)} vrije dagen?`, "Het weekend komt aan het eind van de week.", "Het weekend zijn de dagen zonder school."],
  /* Meteen na: geen dagnaam van de vraag (de vraag erachter noemt hem al), behalve de oude hint "Zeg de dagen op, vanaf …". */
  na: (d: number) => ["Het gaat om de dag die erachter komt.", "Zeg de dagen op, vanaf het begin van de week.", "De dag erna hoort op de lege plek.", `Zeg de dagen op, vanaf ${naam(d)}. Welke dag zeg je daarna?`],
  naZondag: ["Na de laatste dag begint de week opnieuw.", "Na zondag begint een nieuwe week. Welke dag komt dan?", "Zeg de dagen op tot het eind. Dan begint de week weer."],
  hoeveelWeek: ["Zeg de dagen op van maandag tot en met zondag. Hoeveel dagen zijn het?", "Denk aan alle dagen, van maandag tot en met zondag.", "Elke dag van de week heeft een eigen wagon."],
};
const UITLEG = {
  eersteLaatste: ["De eerste dag staat vooraan in de week, niet achteraan.", "De week begint niet met het weekend.", "De eerste dag hangt vooraan, vlak achter de locomotief."],
  eerste: ["De eerste dag hangt vooraan in de weektrein, vlak achter de locomotief.", "Met de eerste dag begint de schoolweek.", "Voor de eerste dag hangt alleen de locomotief."],
  laatste: ["De laatste dag hangt helemaal achteraan in de weektrein.", "De laatste dag is de allerlaatste wagon van de trein.", "Na de laatste dag komt er in deze week niets meer."],
  schooldagen: ["Het weekend zijn de vrije dagen aan het eind van de week.", "Na de schooldagen komt het weekend.", "Het weekend is korter dan de schoolweek."],
  weinigWeekend: ["Na vrijdag is er geen school meer, tot het maandag is.", "Zaterdag is vrij, en de dag erna ook.", "Het weekend begint na vrijdag en duurt tot maandag."],
  welkeSchool: ["Het weekend zijn de vrije dagen aan het eind van de week.", "Na de schooldagen komt het weekend.", "In het weekend ga je niet naar school."],
  welkeErbij: ["Op allebei de dagen van het weekend ben je vrij.", "In het weekend is er op geen enkele dag school.", "Het weekend begint na de laatste schooldag."],
  voorNa: (d: number) =>
    d === 6
      ? ["Meteen na is de dag die erna komt, niet de dag ervoor.", "Erna betekent: later, niet eerder.", "Een nieuwe week begint weer vooraan in de trein."]
      : ["Meteen na is de dag erachter, niet de dag ervoor.", "Erna betekent: later, niet eerder.", "De dag erna komt later in de week."],
  ander: (d: number) =>
    d === 6
      ? ["Na zondag begint de week opnieuw vooraan in de trein.", "Na het eind van de week begin je weer vooraan.", "Een nieuwe week begint weer met de eerste dag."]
      : [`Meteen na ${naam(d)} komt de dag die er direct achter hangt.`, "Meteen na betekent: de dag direct erachter.", "Je slaat geen dag over. Het is de dag direct erachter."],
  weinigWeek: ["Elke dag van maandag tot en met zondag telt mee.", "Vergeet het weekend niet. Dat hoort ook bij de week.", "Ook zaterdag en zondag horen bij de week."],
  veelWeek: [`Elke dag van de week telt maar ${g(1)} keer mee.`, "Na zondag begint een nieuwe week. Die tel je niet mee.", "Je telt van maandag tot en met zondag, niet verder."],
};

/** De fouttabel van 1 fout antwoord. `x` = de gekozen kaart (sleutel) of het gekozen getal. */
export function tijdFout(v: Vraag, x: string): Fout {
  const code = denkfoutVan(v, x);
  const denkfout = DENKFOUT_UITLEG[code];
  const maak = (vv: Varianten, bewering: Bewering): Fout => ({ code, soort: code, denkfout, eerste: vv.eerste[0], hint: vv.hint[0], uitleg: vv.uitleg[0], weer: [], v: vv, scherm: v.invoer === "kaart" ? SCHERM.kaart : SCHERM.getal, rondje: v.invoer === "kaart", bewering, over: overNa(v, x, bewering) });
  const c = Number(x);
  const n = v.invoer === "getal" ? g(c) : kaartNaam(x);
  const N = v.invoer === "getal" ? g(c) : KaartNaam(x);
  const alleen: Bewering = { soort: "alleen-c" };

  /* Wat is de eerste dag van de week? */
  if (v.soort === "eerste") {
    if (code === "eerste-laatste-verwisseld") return maak({ eerste: ["Je koos zondag. Dat is de laatste dag van de week.", "Zondag? Die dag komt helemaal aan het eind.", "Je tikte op zondag. Die hangt achteraan, niet vooraan."], hint: HINT.eerste, uitleg: UITLEG.eersteLaatste }, alleen);
    return maak({ eerste: [`Je koos ${n}. Dat is niet de eerste dag.`, `${N}? Daarvoor komen nog andere dagen.`, `Je tikte op ${n}. Die dag komt later in de week.`], hint: HINT.eerste, uitleg: UITLEG.eerste }, alleen);
  }

  /* Wat is de laatste dag van de week? Niet "Na zaterdag komt nog een dag": dan blijft er maar 1 keuze over (15.17). */
  if (v.soort === "laatste") {
    if (code === "dag-ernaast") return maak({ eerste: ["Je koos zaterdag. Die hoort bij het weekend, maar is niet de laatste dag.", "Zaterdag? Die is weekend, maar niet de laatste dag.", "Je tikte op zaterdag. Dat is een weekenddag, maar niet de laatste."], hint: HINT.laatste, uitleg: UITLEG.laatste }, alleen);
    return maak({ eerste: [`Je koos ${n}. Dat is niet de laatste dag.`, `${N}? Daarna komen nog meer dagen.`, `Je tikte op ${n}. Die dag hangt niet achteraan.`], hint: HINT.laatste, uitleg: UITLEG.laatste }, alleen);
  }

  /* In het weekend ga je niet naar school. Hoeveel dagen heeft het weekend? (1, 2, 5). Geen zin begint met een getal. */
  if (v.soort === "weekendHoeveel") {
    if (code === "schooldagen") return maak({ eerste: [`Je koos ${n}. Op zoveel dagen ga je naar school.`, `Je tikte op ${n}. Zoveel schooldagen zijn er.`, `Met ${n} tel je de schooldagen.`], hint: HINT.weekendHoeveel, uitleg: UITLEG.schooldagen }, alleen);
    return maak({ eerste: [`Je koos ${n}. Het weekend is langer dan dat.`, `Je tikte op ${n}. Het weekend duurt langer.`, `Met ${n} dag ben je er nog niet.`], hint: HINT.weekendHoeveel, uitleg: UITLEG.weinigWeekend }, { soort: "groter-dan", n: c });
  }

  /* Op welke dagen is het weekend? (kaarten met 2 dagen) */
  if (v.soort === "weekendWelke") {
    if (code === "schooldagen") return maak({ eerste: [`Je koos ${n}. Dat zijn schooldagen.`, `${N}? Op die dagen ga je naar school.`, `Je tikte op ${n}. Dan is er nog school.`], hint: HINT.weekendWelke, uitleg: UITLEG.welkeSchool }, alleen);
    /* Niet "Op maandag ga je naar school.": de dag klonk dan 2 keer achter elkaar. */
    return maak({ eerste: [`Je koos ${n}. Daar zit een schooldag bij.`, `${N}? Op een van die dagen is er school.`, `Je tikte op ${n}. Niet allebei die dagen zijn vrij.`], hint: HINT.weekendWelke, uitleg: UITLEG.welkeErbij }, alleen);
  }

  /* Welke dag komt meteen na …? */
  if (v.soort === "na") {
    const d = v.dag;
    const D = naam(d);
    const hint = d === 6 ? HINT.naZondag : HINT.na(d);
    if (code === "voor-na-verwisseld") return maak({ eerste: [`Je koos ${n}. Die komt voor ${D}.`, `${N}? Die dag hangt voor ${D}.`, `Je tikte op ${n}. Die dag komt ervoor, niet erna.`], hint, uitleg: UITLEG.voorNa(d) }, alleen);
    return maak({ eerste: [`Je koos ${n}. Die komt niet meteen na ${D}.`, `${N}? Die hangt niet direct achter ${D}.`, `Je tikte op ${n}. Die dag ligt verder weg.`], hint, uitleg: UITLEG.ander(d) }, alleen);
  }

  /* Hoeveel dagen heeft een week? (6, 7, 8). Niet "Met 6 mis je nog 1 dag": dan is het antwoord gezegd (15.17). */
  if (code === "een-te-weinig") return maak({ eerste: [`Je koos ${n}. Dat zijn te weinig dagen.`, `Je tikte op ${n}. Een week heeft meer dagen.`, `Met ${n} ben je er nog niet.`], hint: HINT.hoeveelWeek, uitleg: UITLEG.weinigWeek }, { soort: "groter-dan", n: c });
  return maak({ eerste: [`Je koos ${n}. Dat zijn te veel dagen.`, `Je tikte op ${n}. Zoveel dagen heeft een week niet.`, `Met ${n} tel je te ver door.`], hint: HINT.hoeveelWeek, uitleg: UITLEG.veelWeek }, { soort: "kleiner-dan", n: c });
}

/** De fouttabel van een vraag: elk fout antwoord dat het kind kan kiezen. Sleutel = de kaart of het getal. */
export function foutenVan(v: Vraag): Record<string, Fout> {
  return Object.fromEntries(v.keuzes.filter((k) => k !== v.goed).map((k) => [k, tijdFout(v, k)]));
}

/* ---------- kiezen met de gedeelde kiezer (de les en het fouttabel-script gebruiken precies dit) ---------- */

/** Een variant kiezen: `sleutel` = de situatie; binnen 1 sleutel nooit 2 keer achter elkaar dezelfde zin. */
export type Variant = (sleutel: string, zinnen: readonly string[], mag?: (z: string) => boolean) => string;

/** De eerste zin bij de 2e fout met een ander antwoord: "Nu koos je …" als extra versie (keuring Tellen en Splitsen). */
export const nuKoos = (z: string) => z.replace(/^Je koos /, "Nu koos je ").replace(/^Je tikte op /, "Nu tikte je op ");

/**
 * Wat Bliepo zegt bij een antwoord dat niet goed is: [eerste zin, hint] bij de 1e keer, [eerste zin, uitleg] bij de 2e.
 *   - de hint herhaalt geen getal, geen dagnaam en geen stuk uit de eerste zin (`pastNa`);
 *   - `eerdereHints`: hints die bij DEZE vraag al klonken (ook de eerste keer, als de vraag aan het eind terugkomt):
 *     die liever niet nog een keer (5.10; een wens aan de kiezer);
 *   - de 2e keer: hetzelfde antwoord = "Je koos weer …"; een ander antwoord = nooit dezelfde eerste zin als de 1e keer.
 */
export function foutStuk(variant: Variant, f: Fout, v: Vraag, poging: 1 | 2, eerder: Fout | null, o: { x: string; zelfdeAntwoord: boolean; onduidelijk: () => string; eerdereHints?: readonly string[]; vorigeEerste?: string }): string[] {
  const al = new Set((o.eerdereHints ?? []).map(vorm));
  if (f.code === "onduidelijk") {
    const e = o.onduidelijk();
    return poging === 1 ? [e, variant("hint", f.v.hint, pastNa(e))] : [e, variant("uitleg", f.v.uitleg, pastNa(e))];
  }
  if (poging === 1) {
    const e = variant("eerste", f.v.eerste);
    return [e, variant("hint", f.v.hint, (z) => pastNa(e)(z) && !al.has(vorm(z)))];
  }
  /* Een ander antwoord de 2e keer: ook het begin anders dan de 1e keer ("Zondag? …" en daarna niet "Zaterdag? …"). */
  const begin = (z: string) => vorm(kaal(z).split(/(?<=[.!?])\s+/)[0] ?? "");
  const anders = (z: string) => !o.vorigeEerste || begin(z) !== begin(o.vorigeEerste);
  const e = o.zelfdeAntwoord ? variant("weerGekozen", ZIN.weerGekozen(v, o.x)) : variant("eerste", eerder ? [...f.v.eerste, nuKoos(f.v.eerste[0])] : f.v.eerste, anders);
  return [e, variant("uitleg", f.v.uitleg, pastNa(e))];
}

/**
 * De vraag opnieuw na de hint: een vraag die samen met de hint in het tekstvak past en geen dagnaam of getal uit de hint
 * herhaalt (harde eisen: vooraf uit de lijst).
 */
export function opnieuwZin(variant: Variant, v: Vraag, hint: string): string {
  if (eindigtMetOpdracht(hint)) return "";
  const alle = ZIN.opnieuw(v);
  const passend = alle.filter((z) => past(hint, z) && !deeltDag(hint, z) && !deeltGetal(hint, z));
  return variant(`opnieuw-${v.soort}`, passend.length ? passend : alle);
}
