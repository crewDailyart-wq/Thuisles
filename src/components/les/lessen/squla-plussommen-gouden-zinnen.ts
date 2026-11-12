/**
 * ALLE ZINNEN VAN BLIEPO in de gouden les Plussommen (squla-plus-bakkerij-1-gouden, 9 november 2026), op één plek, met
 * de FOUTTABEL. De les zelf (squla-plussommen-gouden.tsx) bevat geen eigen zinnen.
 *
 *   - De rijtjes (lof, momenten, naam, goed na een fout, einde, eerste zin als de denkfout niet duidelijk is,
 *     aanmoedigen, overgang) zijn dezelfde als in de gouden lessen klok, Tellen en Splitsen (BLIEPO-KARAKTER.md). Hier
 *     alleen de reactie bij Optellen (BLIEPO-KARAKTER.md §4, zin 11, 12 en 15, plus 2 zinnen zonder "Ja").
 *   - De inhoud (16 vragen, getallen, keuzes en voorwerpen) is die van squla-plus-bakkerij-1 (BOUWREGELS 15.22). De
 *     verhaaltjes zijn de zinnen van de oude les; alleen waar BOUWREGELS 15.26 het vraagt is iets anders verwoord
 *     (KEUZES-VOOR-SARA.md, Ronde 22).
 *   - De soort reactie volgt het draaiboek Plussommen (Adding below 10, SYNTHESIS-ANALYSE/DRAAIBOEKEN-NIEUW/plussommen.md
 *     §3 D, E en §7): bij een fout totaal zegt Bliepo in welke richting het goede antwoord ligt ("1 en 4 samen is meer
 *     dan 4") en laat het kind meteen opnieuw kiezen. Zou die richting maar 1 keuze overlaten, dan noemt hij hem niet
 *     (BOUWREGELS 15.17). Het verbinden heeft Synthesis niet: daar zijn de zinnen EIGEN INVULLING, NIET VAN SYNTHESIS
 *     (15.22 punt 5).
 *
 * Leesbare versie: FOUTTABEL-squla-plus-bakkerij-1-gouden.md (maak hem opnieuw met
 * `npx tsx scripts/fouttabel-plussommen-gouden.ts`; dat script doet ook de verklapcontrole).
 * {4:geel} = een getal in de kleur van het lekkers waar het naar verwijst; {10:wit} = een getal zonder voorwerp.
 */

import type { Groep } from "../vlakken/squla-plussommen-vlak";
import { etenKleuren } from "../vlakken/squla-getalring";
import type { Rijtje } from "./squla-klok-gouden-zinnen";

export {
  AANMOEDIG,
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

/** Een getal in de zin, in de kleur van het voorwerp waar het naar verwijst (BOUWREGELS 2.1, 2.2); wit = geen voorwerp. */
export const g = (n: number, k = "wit") => `{${n}:${k}}`;
/** De stippen in de rij van 10 (rekenmateriaal van de oude les): oranje en blauw. */
export const ORANJE = "oranje";
export const BLAUW = "blauw";

/* ---------- het lekkers ---------- */

/** Naam van een stuk lekkers: [het/de + enkelvoud, meervoud, "elk"/"elke"]. */
type Naam = { een: string; het: string; meer: string; elk: string };
const N = (een: string, het: string, meer: string, elk: "elk" | "elke"): Naam => ({ een, het, meer, elk });
const TAARTJE = N("taartje", "het taartje", "taartjes", "elk");
const WIT_BROOD = N("wit brood", "het witte brood", "witte broden", "elk");
const BRUIN_BROOD = N("bruin brood", "het bruine brood", "bruine broden", "elk");
const CUPCAKE = N("cupcake", "de cupcake", "cupcakes", "elke");
const KRENTENBOL = N("krentenbol", "de krentenbol", "krentenbollen", "elke");
const KOEKJE = N("koekje", "het koekje", "koekjes", "elk");
const DONUT = N("donut", "de donut", "donuts", "elke");
const CROISSANT = N("croissant", "de croissant", "croissants", "elke");
const BROODJE = N("broodje", "het broodje", "broodjes", "elk");

/** Eerste letter een hoofdletter ("elk" → "Elk"). */
const hoofd = (w: string) => w.charAt(0).toUpperCase() + w.slice(1);

/** "1 taartje" / "4 taartjes", met het getal in de kleur van het groepje. */
const aantal = (n: number, nm: Naam, k: string) => `${g(n, k)} ${n === 1 ? nm.een : nm.meer}`;

/* ---------- de 16 vragen van squla-plus-bakkerij-1 (zelfde volgorde, getallen, keuzes en voorwerpen) ---------- */

type Basis = { nr: number; id: string };
/** (A) Verhaaltje met 2 groepjes lekkers; hoeveel samen? (4 keuzes) */
export type Verhaal = Basis & { soort: "verhaal"; groepen: [Groep, Groep]; a: number; b: number; keuzes: number[]; namen: [Naam, Naam]; wat: string; zinnen: (ka: string, kb: string) => [string, string, string] };
/** (B) Verhaaltje met 2 groepjes; welke som hoort erbij? (4 sommen) */
export type Somkeuze = Basis & { soort: "som"; groepen: [Groep, Groep]; a: number; b: number; opties: string[]; namen: [Naam, Naam]; wat: string; zinnen: (ka: string, kb: string) => [string, string, string] };
/** (C) Discospel: de som bovenaan; tik op het goede kaartje (uit 3). */
export type Disco = Basis & { soort: "disco"; a: number; b: number; kaarten: number[] };
/** (D) Verbinden: 3 sommen links, 3 antwoorden rechts. */
export type Verbind = Basis & { soort: "verbind"; sommen: [number, number][]; antwoorden: number[] };
export type Plusvraag = Verhaal | Somkeuze | Disco | Verbind;

const hoop = (n: number, ding: Groep["ding"], label = false): Groep => ({ n, ding, label });

const verhaal = (nr: number, groepen: [Groep, Groep], keuzes: number[], namen: [Naam, Naam], wat: string, zinnen: Verhaal["zinnen"]): Verhaal => ({
  soort: "verhaal",
  nr,
  id: `vraag${nr}-${groepen[0].n}+${groepen[1].n}-${groepen[0].ding}`,
  groepen,
  a: groepen[0].n,
  b: groepen[1].n,
  keuzes,
  namen,
  wat,
  zinnen,
});
const somkeuze = (nr: number, groepen: [Groep, Groep], opties: string[], namen: [Naam, Naam], wat: string, zinnen: Somkeuze["zinnen"]): Somkeuze => ({
  soort: "som",
  nr,
  id: `vraag${nr}-welke-som-${groepen[0].n}+${groepen[1].n}`,
  groepen,
  a: groepen[0].n,
  b: groepen[1].n,
  opties,
  namen,
  wat,
  zinnen,
});
const disco = (nr: number, a: number, b: number, kaarten: number[]): Disco => ({ soort: "disco", nr, id: `vraag${nr}-disco-${a}+${b}`, a, b, kaarten });
const verbind = (nr: number, sommen: [number, number][], antwoorden: number[]): Verbind => ({ soort: "verbind", nr, id: `vraag${nr}-verbind-${sommen.map(([x, y]) => `${x}+${y}`).join("-")}`, sommen, antwoorden });

/** "−" zoals in de oude les (echt minteken). */
const MIN = "−";

export const VRAGEN: Plusvraag[] = [
  verhaal(1, [hoop(1, "taart"), hoop(4, "taart")], [4, 5, 6, 1], [TAARTJE, TAARTJE], "taartjes", (ka, kb) => [`Hier ligt ${g(1, ka)} taartje.`, `Daar liggen er ${g(4, kb)}.`, "Hoeveel taartjes zijn het samen?"]),
  verhaal(2, [hoop(5, "brood"), hoop(2, "bruin-brood")], [6, 7, 8, 3], [WIT_BROOD, BRUIN_BROOD], "broden", (ka, kb) => [`Hier liggen ${g(5, ka)} witte broden.`, `Daar liggen ${g(2, kb)} bruine broden.`, "Hoeveel broden zijn het samen?"]),
  verhaal(3, [hoop(4, "cupcake"), hoop(5, "cupcake")], [8, 9, 10, 1], [CUPCAKE, CUPCAKE], "cupcakes", (ka, kb) => [`Er staan ${g(4, ka)} cupcakes klaar.`, `Ik bak er nog ${g(5, kb)} bij.`, "Hoeveel cupcakes zijn het samen?"]),
  verhaal(4, [hoop(2, "krentenbol", true), hoop(6, "krentenbol", true)], [7, 8, 4, 9], [KRENTENBOL, KRENTENBOL], "krentenbollen", (ka, kb) => [`Hier liggen ${g(2, ka)} krentenbollen.`, `Daar liggen er ${g(6, kb)}.`, "Hoeveel krentenbollen zijn het samen?"]),
  somkeuze(5, [hoop(3, "koekje"), hoop(7, "koekje")], [`7 ${MIN} 3 = 4`, "3 + 7 = 10", "3 + 3 = 6", "7 + 7 = 14"], [KOEKJE, KOEKJE], "koekjes", (ka, kb) => [`Er liggen nog maar ${g(3, ka)} koekjes.`, `Ik bak er ${g(7, kb)} bij.`, "Welke som hoort erbij?"]),
  disco(6, 5, 3, [9, 7, 8]),
  disco(7, 6, 4, [10, 8, 9]),
  verbind(8, [[3, 4], [5, 3], [2, 7]], [9, 7, 8]),
  verhaal(9, [hoop(4, "donut"), hoop(4, "donut")], [4, 8, 7, 0], [DONUT, DONUT], "donuts", (ka, kb) => [`Hier liggen ${g(4, ka)} donuts.`, `Daar liggen er ook ${g(4, kb)}.`, "Hoeveel donuts zijn het samen?"]),
  verhaal(10, [hoop(2, "croissant"), hoop(5, "croissant")], [6, 7, 8, 2], [CROISSANT, CROISSANT], "croissants", (ka, kb) => [`Ik heb ${g(2, ka)} croissants gebakken.`, `Daarna bak ik er nog ${g(5, kb)}.`, "Hoeveel croissants zijn het samen?"]),
  verhaal(11, [hoop(3, "broodje"), hoop(6, "broodje")], [8, 9, 10, 3], [BROODJE, BROODJE], "broodjes", (ka, kb) => [`Hier liggen ${g(3, ka)} broodjes.`, `Daar liggen er ${g(6, kb)}.`, "Hoeveel broodjes zijn het samen?"]),
  somkeuze(12, [hoop(4, "taart"), hoop(5, "taart")], [`5 ${MIN} 4 = 1`, "4 + 5 = 9", "4 + 4 = 8", "5 + 5 = 10"], [TAARTJE, TAARTJE], "taartjes", (ka, kb) => [`Er staan ${g(4, ka)} taartjes.`, `Ik zet er ${g(5, kb)} bij.`, "Welke som hoort erbij?"]),
  disco(13, 2, 6, [7, 9, 8]),
  verbind(14, [[1, 6], [4, 2], [5, 4]], [9, 7, 6]),
  verhaal(15, [hoop(7, "koekje"), hoop(2, "koekje")], [8, 9, 10, 5], [KOEKJE, KOEKJE], "koekjes", (ka, kb) => [`Ik heb ${g(7, ka)} koekjes.`, `Er komen er ${g(2, kb)} bij.`, "Hoeveel koekjes zijn het samen?"]),
  verhaal(16, [hoop(5, "krentenbol"), hoop(5, "krentenbol")], [5, 10, 9, 0], [KRENTENBOL, KRENTENBOL], "krentenbollen", (ka, kb) => [`Hier liggen ${g(5, ka)} krentenbollen.`, `Daar liggen er ook ${g(5, kb)}.`, "Hoeveel krentenbollen zijn het samen?"]),
];

/** De kleuren van de 2 groepjes lekkers (dezelfde als in de oude les: `etenKleuren`). */
export const kleurenVan = (v: Verhaal | Somkeuze): [string, string] => {
  const [ka, kb] = etenKleuren(v.groepen);
  return [ka, kb];
};

/** Een som als tekst op een knop of kaartje ("3 + 7 = 10"). */
export const somTekst = (a: number, b: number) => `${a} + ${b} = ${a + b}`;

/* ---------- vaste zinnen van het verloop (draaiboek Plussommen §2; eigen woorden) ---------- */

export const ZIN = {
  /** Stap 1: openen. Eigen beginzin van de les (BOUWREGELS 4.3); geen startvraag (draaiboek §0). */
  begin: "In deze les tel je lekkers uit de bakkerij bij elkaar op. Dat heet een plussom.",
  /*
   * Niet meer gezegd sinds de omzetting naar 15.27 (11 november 2026; WEGGEHAALD.md): "Klaar met kijken? Tik dan op de
   * blauwe pijl." en "Tik op de blauwe pijl als je het nog eens wilt proberen." Het kind hoeft nooit meer op de pijl te
   * tikken. De zinnen blijven hier ter herinnering staan.
   */
  pijlUitleg: "Klaar met kijken? Tik dan op de blauwe pijl.",
  pijlUitlegNaFout: "Tik op de blauwe pijl als je het nog eens wilt proberen.",
  /** Disco (Squla): de som staat bovenaan, het kind tikt op het kaartje. De eerste keer wat het kind doet (3.15). */
  disco: (a: number, b: number) => `Welk kaartje hoort bij ${g(a)} + ${g(b)}?`,
  discoEerste: "Tik op het goede kaartje.",
  /** Verbinden (Squla): de eerste keer de hele opdracht, daarna korter (geleerd bij Splitsen: niet steeds de lange zin). */
  verbind: ["Welk antwoord hoort bij welke som?", "Tik op een som en dan op het antwoord."],
  verbindKort: ["Verbind weer elke som met zijn antwoord."],
  /** Hulphandje bij het verbinden (opdracht, 15.19): wijst naar een som zonder lijn, nooit naar een antwoord. */
  verbindHand: "Tik op een som. Tik dan op het antwoord dat erbij hoort.",
  verbindHandGekozen: (x: number, y: number) => `Reken ${g(x)} + ${g(y)} uit en tik op het antwoord.`,
  /** Samen tellen (2e fout, draaiboek §3 C.5 en D.4): Bliepo zet het begin klaar, het kind telt verder. */
  /** 3 versies (omzetting 11 nov 2026, geleerd bij Tellen en Splitsen: niet bij elke 2e fout dezelfde zin). */
  samenHelp: ["Kom, we tellen samen.", "We tellen het samen.", "Kom, samen tellen we het."],
  samenKijk: ["Kom, we kijken samen.", "We kijken het samen na."],
  samenHier: (n: number, nm: Naam, k: string) => (n === 1 ? `Hier ligt ${aantal(1, nm, k)}.` : `Hier liggen ${aantal(n, nm, k)}.`),
  samenVerder: (a: number, ka: string, nm: Naam) => `We tellen verder vanaf ${g(a, ka)}. Tik op ${nm.elk} ${nm.een} daar.`,
  samenHand: (nm: Naam) => `Tik op een ${nm.een} zonder getal.`,
  samenKlaar: (s: number, wat: string, a: number, b: number, ka: string, kb: string) => `${g(s)}. Samen zijn het ${g(s)} ${wat}: ${g(a, ka)} + ${g(b, kb)} = ${g(s)}.`,
  /** Samen tellen met de stippen (disco en verbinden: daar is geen lekkers). */
  stippen: (a: number, b: number) => `Kijk: ${g(a, ORANJE)} ${a === 1 ? "oranje stip" : "oranje stippen"} en ${g(b, BLAUW)} ${b === 1 ? "blauwe stip" : "blauwe stippen"}.`,
  stippenVerder: (a: number) => `We tellen verder vanaf ${g(a, ORANJE)}. Tik op elke blauwe stip.`,
  stippenHand: "Tik op een blauwe stip zonder getal.",
  stippenKlaar: (a: number, b: number) => `${g(a + b)}. Dus ${g(a, ORANJE)} + ${g(b, BLAUW)} = ${g(a + b)}.`,
  /**
   * Vangnet bij samen tellen (LESRECEPT, geleerd bij Meer-minder; omzetting 11 nov 2026): na 20 s zonder tik telt Bliepo
   * de rest zelf. Dan zegt hij "Kijk, …" en nooit "Ja" (keuring Meer-minder), alsof het kind het deed.
   */
  samenZelf: (s: number, wat: string, a: number, b: number, ka: string, kb: string) => `Kijk, ik tel de rest. Samen zijn het ${g(s)} ${wat}: ${g(a, ka)} + ${g(b, kb)} = ${g(s)}.`,
  stippenZelf: (a: number, b: number) => `Kijk, ik tel de rest. ${g(a, ORANJE)} + ${g(b, BLAUW)} = ${g(a + b)}.`,
  discoKlaar: (s: number) => `Op dit kaartje staat ${g(s)}.`,
  verbindSamen: (x: number, y: number) => `Kom, we rekenen ${g(x)} + ${g(y)} samen uit.`,
  verbindAlles: (sommen: [number, number][]) => `Zo horen ze bij elkaar: ${sommen.map(([x, y]) => `${g(x)} + ${g(y)} = ${g(x + y)}`).join(", ")}.`,
  /** Welke som (2e fout): Bliepo wijst de groepjes aan, het kind tikt de goede som. */
  somEerst: (n: number, nm: Naam, k: string) => (n === 1 ? `Eerst ligt er ${aantal(1, nm, k)}.` : `Eerst liggen er ${aantal(n, nm, k)}.`),
  somErbij: (n: number, nm: Naam, k: string) => `Er ${n === 1 ? "komt" : "komen"} ${aantal(n, nm, k)} bij. Erbij is plus.`,
  somTik: "Tik op de som die erbij hoort.",
  somKlaar: (a: number, b: number, ka: string, kb: string) => `Zo is het: ${g(a, ka)} + ${g(b, kb)} = ${g(a + b)}.`,
  /** Hetzelfde foute antwoord 2 keer: niet 2 keer dezelfde eerste zin (geleerd bij Tellen). */
  weerGekozen: (x: string) => `Je koos weer ${x}.`,
  /** Stap 13: einde. */
  slot: `Je maakte plussommen tot ${g(10)}.`,
  kaartTik: "Tik op de kaart.",
};

/** Aanmoediging bij het hulphandje (het kind moet tikken, niet nadenken; 14.35, geleerd bij Tellen). */
export const AANMOEDIG_TIKKEN = ["Je bent goed bezig.", "Jij kunt dit."];

/** BLIEPO-KARAKTER.md §4 Optellen: zin 11, 12 en 15, plus 2 zinnen zonder "Ja" (voor na een lofzin met "Ja"). */
export const PLUSREACTIE = (a: number, b: number, ka: string, kb: string) =>
  rij([`Ja, ${g(a, ka)} en ${g(b, kb)} zijn samen ${g(a + b)}.`, `Ja, ${g(a, ka)} plus ${g(b, kb)} is ${g(a + b)}.`, `${g(a, ka)} en ${g(b, kb)} zijn samen ${g(a + b)}.`, `${g(a, ka)} + ${g(b, kb)} = ${g(a + b)}.`, `Nagekeken: ${g(a, ka)} plus ${g(b, kb)} is ${g(a + b)}. Klopt!`], [4]);
export const PLUSREACTIE_JA = [0, 1];
export const PLUSREACTIE_ROBOT = 4;
/** Na het verbinden (eigen invulling: Synthesis heeft geen verbinden). */
export const VERBINDREACTIE = rij(["Ja, elke som heeft het goede antwoord.", "Elke lijn klopt.", "Alle 3 de sommen kloppen."]);
export const VERBINDREACTIE_JA = [0];

/* ---------- denkfouten (draaiboek Plussommen §7; namen voor de voortgang) ---------- */

export const DENKFOUTEN = ["deel-als-antwoord", "min-in-plaats-van-plus", "een-te-veel", "te-veel", "een-te-weinig", "te-weinig", "getal-herhalen", "onduidelijk"] as const;
export type Denkfoutnaam = (typeof DENKFOUTEN)[number];

/** Wat de zinnen het kind vertellen; daarmee rekent het fouttabel-script na hoeveel keuzes er nog over zijn (15.17). */
export type Beperking = { meerDan?: number; minderDan?: number; plus?: true; getallen?: [number, number] };

export type Fout = {
  code: Denkfoutnaam;
  /** Welke uitleg bij de 2e fout hoort (dezelfde soort 2 keer = "weer"). */
  soort: string;
  denkfout: string;
  /** Bliepo's eerste zin (leeg bij "onduidelijk": dan een zin uit BLIEPO-KARAKTER.md §10). */
  eerste: string;
  hint: string;
  /** Uitleg na de 2e fout (daarna meteen samen voordoen). */
  uitleg: string;
  /** Dezelfde denkfout 2 keer (en de 1e keer zei Bliepo al wat er mis was): anders uitleggen. */
  weer: string[];
  scherm: string;
  beperking: Beperking;
  /** Waarom de richting niet genoemd wordt (zou het antwoord verklappen, BOUWREGELS 15.17). */
  noot?: string;
  /** De eerste zin bij de 2e fout, als die anders is (leeg = alleen de uitleg; anders zegt Bliepo 2 keer hetzelfde). */
  kort?: string;
};

const SCHERM_KEUZE = "Bliepo's scherm 1,5 s rood (geen fout-geluidje); de knoppen weg, de som en het lekkers blijven staan; met de hint komen dezelfde knoppen meteen terug (geen pijl, draaiboek §3 D.2)";
const SCHERM_DISCO = "Bliepo's scherm 1,5 s rood; de kaartjes worden dof en zijn niet te tikken; met de hint zijn ze weer gewoon te tikken";
const SCHERM_SOM = "Bliepo's scherm 1,5 s rood; de knoppen weg, het lekkers blijft staan; met de hint komen de 4 sommen meteen terug";
const SCHERM_VERBIND = "Bliepo's scherm 1,5 s rood; de lijnen blijven even staan (wit, geen rood), daarna zijn ze weg en verbindt het kind alles opnieuw";

/** Hoeveel keuzes er na de beperking over zijn (getallen). */
export const overNa = (keuzes: number[], x: number, b: Beperking) => keuzes.filter((k) => k !== x && (b.meerDan === undefined || k > b.meerDan) && (b.minderDan === undefined || k < b.minderDan));

/** De eerste zin als Bliepo de richting niet noemt (zou het antwoord verklappen): 3 versies, alleen wat het kind koos. */
export const ZONDER_RICHTING = [(X: string) => `Je koos ${X}.`, (X: string) => `${X} is het niet.`, (X: string) => `Je koos ${X}. Dat is het nog niet.`];

/**
 * De fouttabel van 1 fout antwoord bij een TOTAAL (verhaal en disco). Draaiboek §3 D en §7: deel als antwoord, het
 * verschil (min), 1 te veel of te weinig. Bliepo zegt wat de keuze is en in welke richting het goede antwoord ligt; zou
 * die richting maar 1 keuze overlaten, dan noemt hij hem niet en wijst hij alleen naar de manier van tellen.
 * Voor de verhaaltjes noemt Bliepo het lekkers; bij de disco zijn er geen dingen in beeld, dan "de som".
 */
export function totaalFout(v: Verhaal | Disco, x: number): Fout {
  const { a, b } = v;
  const s = a + b;
  const groot = Math.max(a, b);
  const klein = Math.min(a, b);
  const isVerhaal = v.soort === "verhaal";
  const [ka, kb] = isVerhaal ? kleurenVan(v) : ["wit", "wit"];
  const A = g(a, ka);
  const B = g(b, kb);
  const X = g(x);
  const keuzes = isVerhaal ? v.keuzes : v.kaarten;
  const scherm = isVerhaal ? SCHERM_KEUZE : SCHERM_DISCO;
  const nr = v.nr;
  const nm = isVerhaal ? v.namen : null;
  const wat = isVerhaal ? v.wat : "";
  /* Hints zonder richting (mogen altijd): alleen hoe je telt. */
  const neutraal = isVerhaal
    ? [`Tel alle ${wat} nog eens, 1 voor 1.`, `Begin bij ${A} en tel de ${nm![1].meer} daar erbij.`, `Wijs ze 1 voor 1 aan en tel ze samen.`][nr % 3]
    : [`Begin bij ${A} en tel ${B} verder.`, `Tel verder vanaf ${A}: nog ${B} erbij.`, `Begin bij ${A}. Tel er ${B} bij.`][nr % 3];
  const metRichting = (code: Denkfoutnaam, soort: string, denkfout: string, eerste: string, hint: string, beperking: Beperking, uitleg: string, weer: string[]): Fout => {
    const over = overNa(keuzes, x, beperking);
    /* Zonder richting: 3 versies die per vraag wisselen (keuring Meer-minder: niet steeds dezelfde zin). Elke versie is
       waar voor elk fout antwoord: er staat alleen in wat het kind koos. */
    if (over.length <= 1)
      return { code, soort, denkfout, eerste: ZONDER_RICHTING[(nr + (isVerhaal ? 0 : 1)) % 3](X), hint: neutraal, uitleg, weer: [], scherm, beperking: {}, noot: "richting niet genoemd: dan bleef er maar 1 keuze over", ...(soort === "te-veel" || soort === "te-weinig" ? { kort: "" } : {}) };
    /* "1 en 4 samen is minder dan 6. 6 is te veel." zegt 2 keer hetzelfde: bij de 2e fout dan alleen de uitleg. */
    return { code, soort, denkfout, eerste, hint, uitleg, weer, scherm, beperking, ...(soort === "te-veel" || soort === "te-weinig" ? { kort: "" } : {}) };
  };

  /* Het getal van 1 groepje (of een getal uit de som). Bij 3 + 6 is 3 ook 6 − 3; het is in elk geval 1 van de 2 getallen. */
  if (x === a || x === b) {
    const kant = x === a ? 0 : 1;
    const eerste = isVerhaal
      ? x === 1
        ? `Je koos ${X}. Dat is alleen ${nm![kant].het} ${kant === 0 ? "hier" : "daar"}.`
        : `Je koos ${X}. Dat zijn alleen de ${nm![kant].meer} ${kant === 0 ? "hier" : "daar"}.`
      : `${X} staat al in de som. Er komt nog iets bij.`;
    const hint = isVerhaal ? [`Tel ze allemaal samen, hier en daar.`, `Tel de ${wat} hier én daar.`, `Begin bij ${A} en tel de andere erbij.`][nr % 3] : neutraal;
    return metRichting("deel-als-antwoord", "deel", "koos het getal van 1 groepje (of 1 getal uit de som) als antwoord", eerste, hint, { meerDan: x }, isVerhaal ? `Samen betekent: de ${wat} hier én daar.` : `Bij plus komt er iets bij. Dan wordt het meer.`, [isVerhaal ? "Je koos weer maar 1 kant." : "Je koos weer een getal uit de som.", isVerhaal ? `De andere ${wat} horen er ook bij.` : "Het antwoord is meer dan elk getal in de som."]);
  }
  /* Het verschil: plus en min verwisseld. */
  if (x === groot - klein) {
    const K = a === b ? g(a, ka) : g(klein, klein === a ? ka : kb);
    const G = a === b ? g(b, kb) : g(groot, groot === a ? ka : kb);
    return metRichting(
      "min-in-plaats-van-plus",
      "min",
      "trok het kleine getal van het grote af (min in plaats van plus)",
      `${X} krijg je als je ${K} van ${G} afhaalt.`,
      isVerhaal ? `Bij samen tel je ze erbij. Begin bij ${A}.` : `Bij plus tel je erbij. Begin bij ${A}.`,
      { meerDan: groot },
      /* 2 versies (keuring Minsommen: niet bij elke 2e fout dezelfde uitleg). */
      nr % 2 ? "Bij samen haal je er niets af. Je telt ze erbij." : "Bij samen gaat er niets weg. Er komt juist iets bij.",
      ["Je haalde er weer iets af.", "Bij plus komt er iets bij."],
    );
  }
  if (x > s) {
    const een = x === s + 1;
    const hint = isVerhaal ? [`Tel verder vanaf ${A}. Tel ${nm![1].elk} ${nm![1].een} maar 1 keer.`, `Begin bij ${A} en wijs ${nm![1].elk} ${nm![1].een} daar 1 keer aan.`, `Tel nog eens verder vanaf ${A}, rustig 1 voor 1.`][nr % 3] : [`Begin bij ${A} en tel ${B} verder, niet meer.`, `Tel verder vanaf ${A}: nog ${B} erbij, niet meer.`, `Begin bij ${A}. Tel er precies ${B} bij.`][nr % 3];
    return metRichting(een ? "een-te-veel" : "te-veel", "te-veel", een ? "telde 1 te veel" : "telde er te veel", `${A} en ${B} samen is minder dan ${X}.`, hint, { minderDan: x }, `${X} is te veel.`, ["Je koos weer te veel.", isVerhaal ? `${hoofd(nm![1].elk)} ${nm![1].een} telt maar 1 keer.` : `Er komen er ${B} bij, niet meer.`]);
  }
  if (x < s) {
    const een = x === s - 1;
    const hint = isVerhaal ? [`Tel verder vanaf ${A}. Sla er geen over.`, `Begin bij ${A} en tel alle ${nm![1].meer} daar erbij.`, `Tel nog eens verder vanaf ${A}. Sla er geen ${nm![1].een} over.`][nr % 3] : [`Begin bij ${A} en tel ${B} verder. Sla er geen over.`, `Tel verder vanaf ${A}: nog ${B} erbij. Sla er geen over.`, `Begin bij ${A}. Tel er ${B} bij en sla er geen over.`][nr % 3];
    return metRichting(een ? "een-te-weinig" : "te-weinig", "te-weinig", een ? "telde 1 te weinig" : "telde er te weinig", `${A} en ${B} samen is meer dan ${X}.`, hint, { meerDan: x }, `${X} is te weinig.`, ["Je koos weer te weinig.", isVerhaal ? `${hoofd(nm![1].elk)} ${nm![1].een} telt mee.` : `Er komen er ${B} bij, niet minder.`]);
  }
  return { code: "onduidelijk", soort: "onduidelijk", denkfout: "niet duidelijk (geen reden verzonnen)", eerste: "", hint: neutraal, uitleg: "We tellen ze samen.", weer: [], scherm, beperking: {} };
}

/** De fouttabel van een fout antwoord bij "welke som hoort erbij?" (draaiboek §3 E en §7). */
export function somFout(v: Somkeuze, optie: string): Fout {
  const { a, b } = v;
  const [ka, kb] = kleurenVan(v);
  const A = g(a, ka);
  const B = g(b, kb);
  const m = optie.match(/^(\d+) (.) (\d+) = (\d+)$/);
  const [p, teken, q] = m ? [Number(m[1]), m[2], Number(m[3])] : [0, "", 0];
  if (teken === MIN)
    return {
      code: "min-in-plaats-van-plus",
      soort: "min",
      denkfout: "koos een minsom (min in plaats van plus)",
      eerste: `Bij ${g(p)} ${MIN} ${g(q)} gaan er ${v.wat} weg.`,
      hint: `Hier komen er ${v.wat} bij. Erbij is plus.`,
      uitleg: `Er komen ${aantal(b, v.namen[1], kb)} bij. Dan is het een plussom.`,
      weer: ["Je koos weer een minsom.", "Bij erbij hoort het plusteken."],
      scherm: SCHERM_SOM,
      beperking: { plus: true },
    };
  if (p === q)
    return {
      code: "getal-herhalen",
      soort: "herhalen",
      denkfout: "nam 2 keer hetzelfde getal (keek naar 1 groepje)",
      eerste: `In ${g(p)} + ${g(q)} staat 2 keer de ${g(p)}.`,
      hint: `Kijk naar de ${v.wat} hier én daar.`,
      uitleg: `In de som horen allebei de getallen: ${A} en ${B}.`,
      weer: ["Je koos weer 2 keer hetzelfde getal.", `Hier liggen er ${A}, daar ${B}.`],
      scherm: SCHERM_SOM,
      beperking: { getallen: [a, b] },
    };
  return { code: "onduidelijk", soort: "onduidelijk", denkfout: "niet duidelijk (geen reden verzonnen)", eerste: "", hint: `Kijk naar de ${v.wat} hier én daar.`, uitleg: `In de som horen ${A} en ${B}.`, weer: [], scherm: SCHERM_SOM, beperking: {} };
}

/** Welke sommen er na de beperking over zijn (voor de verklapcontrole). */
export function sommenOver(v: Somkeuze, optie: string, b: Beperking): string[] {
  return v.opties.filter((o) => {
    if (o === optie) return false;
    if (b.plus && !o.includes("+")) return false;
    if (b.getallen) {
      const n = (o.match(/\d+/g) ?? []).map(Number).slice(0, 2);
      if (!(n.includes(b.getallen[0]) && n.includes(b.getallen[1]))) return false;
    }
    return true;
  });
}

/**
 * De fouttabel bij het verbinden: som `i` kreeg antwoord `z`. EIGEN INVULLING, NIET VAN SYNTHESIS (15.22 punt 5): het
 * verbinden heeft Synthesis niet; de soort reactie is die van een totaal (§3 D: de richting, als dat niets verklapt).
 */
export function verbindFout(v: Verbind, i: number, z: number): Fout {
  const [x, y] = v.sommen[i];
  const s = x + y;
  const S = `${g(x)} + ${g(y)}`;
  const Z = g(z);
  const eerst = `Je verbond ${S} met ${Z}.`;
  const hint = "Reken elke som uit en verbind ze opnieuw.";
  const metRichting = (code: Denkfoutnaam, soort: string, denkfout: string, zin: string, beperking: Beperking, uitleg: string): Fout => {
    const over = overNa(v.antwoorden, z, beperking);
    if (over.length <= 1) return { code, soort, denkfout, eerste: eerst, hint, uitleg, weer: [], scherm: SCHERM_VERBIND, beperking: {}, noot: "richting niet genoemd: dan bleef er maar 1 antwoord over" };
    return { code, soort, denkfout, eerste: `${eerst} ${zin}`, hint, uitleg, weer: [], scherm: SCHERM_VERBIND, beperking, kort: eerst };
  };
  if (z === x || z === y) return metRichting("deel-als-antwoord", "deel", "koos een getal uit de som zelf", `Maar ${Z} staat al in die som.`, { meerDan: z }, `${S} is meer dan ${Z}: er komt nog iets bij.`);
  if (z > s) return metRichting(z === s + 1 ? "een-te-veel" : "te-veel", "te-veel", z === s + 1 ? "1 te veel" : "te veel", `${S} is minder dan ${Z}.`, { minderDan: z }, `${S} hoort bij een kleiner getal.`);
  if (z < s) return metRichting(z === s - 1 ? "een-te-weinig" : "te-weinig", "te-weinig", z === s - 1 ? "1 te weinig" : "te weinig", `${S} is meer dan ${Z}.`, { meerDan: z }, `${S} hoort bij een groter getal.`);
  return { code: "onduidelijk", soort: "onduidelijk", denkfout: "niet duidelijk", eerste: "", hint, uitleg: `${S} hoort bij een ander antwoord.`, weer: [], scherm: SCHERM_VERBIND, beperking: {} };
}

/** De fouttabel van een vraag: elk fout antwoord (bij verbinden: elke som met elk fout antwoord). */
export function foutenVan(v: Plusvraag): Record<string, Fout> {
  if (v.soort === "verhaal") return Object.fromEntries(v.keuzes.filter((k) => k !== v.a + v.b).map((k) => [String(k), totaalFout(v, k)]));
  if (v.soort === "disco") return Object.fromEntries(v.kaarten.filter((k) => k !== v.a + v.b).map((k) => [String(k), totaalFout(v, k)]));
  if (v.soort === "som") return Object.fromEntries(v.opties.filter((o) => o !== somTekst(v.a, v.b)).map((o) => [o, somFout(v, o)]));
  return Object.fromEntries(v.sommen.flatMap(([x, y], i) => v.antwoorden.filter((z) => z !== x + y).map((z) => [`${x} + ${y} → ${z}`, verbindFout(v, i, z)])));
}
