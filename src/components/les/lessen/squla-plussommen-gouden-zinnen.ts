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
 *   - 18 november 2026 (Sara, na de proefles Tellen): alle zinnen nagelopen en in varianten gezet; de les kiest met de
 *     gedeelde kiezer (nooit-dubbel.ts). Oud naast nieuw: WIJZIGINGEN-ZINNEN-PLUSSOMMEN.md.
 *
 * Leesbare versie: FOUTTABEL-squla-plus-bakkerij-1-gouden.md (maak hem opnieuw met
 * `npx tsx scripts/fouttabel-plussommen-gouden.ts`; dat script doet ook de verklapcontrole).
 * {4:geel} = een getal in de kleur van het lekkers waar het naar verwijst; {10:wit} = een getal zonder voorwerp.
 */

import type { Groep } from "../vlakken/squla-plussommen-vlak";
import { etenKleuren } from "../vlakken/squla-getalring";
import type { Rijtje } from "./squla-klok-gouden-zinnen";
import { deeltStuk, type Kiezer } from "./nooit-dubbel";

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
/** (C) Toonbank: de som bovenaan; tik op het goede kaartje (uit 3). */
export type Toonbank = Basis & { soort: "toonbank"; a: number; b: number; kaarten: number[] };
/** (D) Verbinden: 3 sommen links, 3 antwoorden rechts. */
export type Verbind = Basis & { soort: "verbind"; sommen: [number, number][]; antwoorden: number[] };
export type Plusvraag = Verhaal | Somkeuze | Toonbank | Verbind;

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
const toonbank = (nr: number, a: number, b: number, kaarten: number[]): Toonbank => ({ soort: "toonbank", nr, id: `vraag${nr}-toonbank-${a}+${b}`, a, b, kaarten });
const verbind = (nr: number, sommen: [number, number][], antwoorden: number[]): Verbind => ({ soort: "verbind", nr, id: `vraag${nr}-verbind-${sommen.map(([x, y]) => `${x}+${y}`).join("-")}`, sommen, antwoorden });

/** "−" zoals in de oude les (echt minteken). */
const MIN = "−";

export const VRAGEN: Plusvraag[] = [
  verhaal(1, [hoop(1, "taart"), hoop(4, "taart")], [4, 5, 6, 1], [TAARTJE, TAARTJE], "taartjes", (ka, kb) => [`Hier ligt ${g(1, ka)} taartje.`, `Daar liggen er ${g(4, kb)}.`, "Hoeveel taartjes zijn het samen?"]),
  verhaal(2, [hoop(5, "brood"), hoop(2, "bruin-brood")], [6, 7, 8, 3], [WIT_BROOD, BRUIN_BROOD], "broden", (ka, kb) => [`Hier liggen ${g(5, ka)} witte broden.`, `Daar liggen ${g(2, kb)} bruine broden.`, "Hoeveel broden zijn het samen?"]),
  verhaal(3, [hoop(4, "cupcake"), hoop(5, "cupcake")], [8, 9, 10, 1], [CUPCAKE, CUPCAKE], "cupcakes", (ka, kb) => [`Er staan ${g(4, ka)} cupcakes klaar.`, `Ik bak er nog ${g(5, kb)} bij.`, "Hoeveel cupcakes zijn het samen?"]),
  verhaal(4, [hoop(2, "krentenbol", true), hoop(6, "krentenbol", true)], [7, 8, 4, 9], [KRENTENBOL, KRENTENBOL], "krentenbollen", (ka, kb) => [`Hier liggen ${g(2, ka)} krentenbollen.`, `Daar liggen er ${g(6, kb)}.`, "Hoeveel krentenbollen zijn het samen?"]),
  somkeuze(5, [hoop(3, "koekje"), hoop(7, "koekje")], [`7 ${MIN} 3 = 4`, "3 + 7 = 10", "3 + 3 = 6", "7 + 7 = 14"], [KOEKJE, KOEKJE], "koekjes", (ka, kb) => [`Er liggen nog maar ${g(3, ka)} koekjes.`, `Ik bak er ${g(7, kb)} bij.`, "Welke som hoort erbij?"]),
  toonbank(6, 5, 3, [9, 7, 8]),
  toonbank(7, 6, 4, [10, 8, 9]),
  verbind(8, [[3, 4], [5, 3], [2, 7]], [9, 7, 8]),
  verhaal(9, [hoop(4, "donut"), hoop(4, "donut")], [4, 8, 7, 0], [DONUT, DONUT], "donuts", (ka, kb) => [`Hier liggen ${g(4, ka)} donuts.`, `Daar liggen er ook ${g(4, kb)}.`, "Hoeveel donuts zijn het samen?"]),
  verhaal(10, [hoop(2, "croissant"), hoop(5, "croissant")], [6, 7, 8, 2], [CROISSANT, CROISSANT], "croissants", (ka, kb) => [`Ik heb ${g(2, ka)} croissants gebakken.`, `Daarna bak ik er nog ${g(5, kb)}.`, "Hoeveel croissants zijn het samen?"]),
  verhaal(11, [hoop(3, "broodje"), hoop(6, "broodje")], [8, 9, 10, 3], [BROODJE, BROODJE], "broodjes", (ka, kb) => [`Hier liggen ${g(3, ka)} broodjes.`, `Daar liggen er ${g(6, kb)}.`, "Hoeveel broodjes zijn het samen?"]),
  somkeuze(12, [hoop(4, "taart"), hoop(5, "taart")], [`5 ${MIN} 4 = 1`, "4 + 5 = 9", "4 + 4 = 8", "5 + 5 = 10"], [TAARTJE, TAARTJE], "taartjes", (ka, kb) => [`Er staan ${g(4, ka)} taartjes.`, `Ik zet er ${g(5, kb)} bij.`, "Welke som hoort erbij?"]),
  toonbank(13, 2, 6, [7, 9, 8]),
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

/* ---------- vaste zinnen van het verloop (draaiboek Plussommen §2) ----------
 *
 * Sara, 18 november 2026 (na de proefles Tellen): Bliepo klinkt als een warme juf, niet als een robot. Elke zin is
 * nagelopen (kort, gewone woorden, lief, nooit "fout", een getal nooit 2 keer achter elkaar) en elke situatie die
 * terugkomt heeft varianten: 3 tot 5 voor reacties en aanmoediging, 2 of 3 voor instructies en samen voordoen. De les
 * kiest met de gedeelde kiezer (nooit-dubbel.ts): nooit dezelfde zin 2 keer achter elkaar, ook niet over vragen heen.
 * Getal, antwoord en betekenis zijn niet veranderd. Oud naast nieuw: WIJZIGINGEN-ZINNEN-PLUSSOMMEN.md.
 * 19 november 2026 (besluit Sara, BOUWREGELS 15.41): de zinnen die vertaald uit Synthesis (Adding below 10) kwamen, zijn
 * eigen zinnen geworden op dezelfde plek ("1 en 4 samen is meer dan 3." werd "3 is te weinig voor 1 en 4 samen.", enz.;
 * oud naast nieuw onderaan WIJZIGINGEN-ZINNEN-PLUSSOMMEN.md).
 * Een lijst = varianten (de les kiest er 1). Schooltermen blijven gelijk: "samen", "erbij", "plus", "som", "plussom".
 */

/** "welk taartje" / "welke cupcake" (bij "elk" hoort "welk", bij "elke" hoort "welke"). */
const welk = (nm: Naam) => (nm.elk === "elk" ? "welk" : "welke");

export const ZIN = {
  /** Stap 1: openen. Eerst wat we gaan doen (1 van de varianten), dan hoe dat heet. Geen startvraag (draaiboek §0). */
  begin: ["Vandaag tellen we lekkers uit de bakkerij bij elkaar op.", "We gaan samen lekkers uit de bakkerij optellen."],
  beginNaam: "Dat heet een plussom.",
  /*
   * Niet meer gezegd sinds de omzetting naar 15.27 (11 november 2026; WEGGEHAALD.md): "Klaar met kijken? Tik dan op de
   * blauwe pijl." en "Tik op de blauwe pijl als je het nog eens wilt proberen." Het kind hoeft nooit meer op de pijl te
   * tikken. De zinnen blijven hier ter herinnering staan.
   */
  pijlUitleg: "Klaar met kijken? Tik dan op de blauwe pijl.",
  pijlUitlegNaFout: "Tik op de blauwe pijl als je het nog eens wilt proberen.",
  /** Toonbank (Squla): de som staat bovenaan, het kind tikt op het kaartje. De eerste keer wat het kind doet (3.15). */
  toonbank: (a: number, b: number) => `Welk kaartje hoort bij ${g(a)} + ${g(b)}?`,
  toonbankEerste: "Tik op het goede kaartje.",
  /** Verbinden (Squla): de eerste keer de hele opdracht, daarna korter (geleerd bij Splitsen: niet steeds de lange zin). */
  verbind: ["Welk antwoord hoort bij welke som?", "Tik op een som en dan op het antwoord."],
  /* Keuring 19 nov 2026 (15.36): "Welk antwoord hoort bij elke som? Tik ze weer aan." was vaag (wat tik je aan?); nu zegt
     de zin wat het kind aantikt (WIJZIGINGEN-ZINNEN-PLUSSOMMEN.md, WEGGEHAALD.md). */
  verbindKort: ["Zoek weer bij elke som het goede antwoord.", "Tik weer op een som en dan op het antwoord dat erbij hoort."],
  /** Hulphandje bij het verbinden (opdracht, 15.19): wijst naar een som zonder lijn, nooit naar een antwoord. */
  verbindHand: ["Tik op een som. Tik dan op het antwoord dat erbij hoort.", "Kies eerst een som. Tik daarna op het antwoord dat erbij hoort."],
  verbindHandGekozen: (x: number, y: number) => [`Reken ${g(x)} + ${g(y)} uit en tik op het antwoord.`, `Hoeveel is ${g(x)} + ${g(y)}? Tik op dat antwoord.`],
  /** Samen tellen (2e keer mis, draaiboek §3 C.5 en D.4): Bliepo zet het begin klaar, het kind telt verder. */
  samenHelp: ["Kom, we tellen samen.", "Weet je wat? We tellen samen.", "Geeft niks. We tellen samen.", "Ik doe even mee. We tellen samen.", "Kijk maar met mij mee. We tellen samen."],
  samenKijk: ["Kom, we kijken samen.", "Weet je wat? We kijken er samen naar.", "Geeft niks. We kijken samen.", "Ik help je even. We kijken samen."],
  samenHier: (n: number, nm: Naam, k: string) => (n === 1 ? [`Hier ligt ${aantal(1, nm, k)}.`, `Kijk, hier ligt ${aantal(1, nm, k)}.`] : [`Hier liggen ${aantal(n, nm, k)}.`, `Kijk, hier liggen ${aantal(n, nm, k)}.`]),
  samenVerder: (a: number, ka: string, nm: Naam) => [`We tellen verder vanaf ${g(a, ka)}. Tik op ${nm.elk} ${nm.een} daar.`, `Na ${g(a, ka)} tellen we verder. Tik ${nm.elk} ${nm.een} daar aan.`, `We beginnen bij ${g(a, ka)}. Tik op ${nm.elk} ${nm.een} daar. Ik tel mee.`],
  samenHand: (nm: Naam) => [`Tik op een ${nm.een} zonder getal.`, `Zoek een ${nm.een} zonder getal en tik erop.`, `${hoofd(welk(nm))} ${nm.een} heeft nog geen getal? Tik erop.`],
  /** Het laatste getal is het aantal. Het getal staat er 1 keer (was: "5. Samen zijn het 5 taartjes: 1 + 4 = 5."). */
  samenKlaar: (s: number, wat: string, a: number, b: number, ka: string, kb: string) => [`En ${g(s)}! Zoveel ${wat} zijn het samen.`, `Alles geteld! ${g(a, ka)} + ${g(b, kb)} = ${g(s)}.`, `We hebben ze allemaal geteld. ${g(a, ka)} + ${g(b, kb)} = ${g(s)}.`],
  /** Samen tellen met de stippen (de toonbank en verbinden: daar is geen lekkers). */
  stippen: (a: number, b: number) => {
    const o = `${g(a, ORANJE)} ${a === 1 ? "oranje stip" : "oranje stippen"}`;
    const bl = `${g(b, BLAUW)} ${b === 1 ? "blauwe stip" : "blauwe stippen"}`;
    return [`Kijk: ${o} en ${bl}.`, `Hier zie je ${o} en ${bl}.`];
  },
  stippenVerder: (a: number) => [`We tellen verder vanaf ${g(a, ORANJE)}. Tik op elke blauwe stip.`, `Na ${g(a, ORANJE)} tellen we verder. Tik elke blauwe stip aan.`, `We beginnen bij ${g(a, ORANJE)}. Tik op elke blauwe stip. Ik tel mee.`],
  stippenHand: ["Tik op een blauwe stip zonder getal.", "Zoek een blauwe stip zonder getal en tik erop.", "Welke blauwe stip heeft nog geen getal? Tik erop."],
  stippenKlaar: (a: number, b: number) => [`En ${g(a + b)}! Zoveel stippen zijn het samen.`, `Alles geteld! ${g(a, ORANJE)} + ${g(b, BLAUW)} = ${g(a + b)}.`, `We hebben alle stippen geteld. ${g(a, ORANJE)} + ${g(b, BLAUW)} = ${g(a + b)}.`],
  /**
   * Vangnet bij samen tellen (LESRECEPT, geleerd bij Meer-minder; omzetting 11 nov 2026): na 20 s zonder tik telt Bliepo
   * de rest zelf. Dan zegt hij "Kijk, …" en nooit "Ja" (keuring Meer-minder), alsof het kind het deed.
   */
  samenZelf: (s: number, wat: string, a: number, b: number, ka: string, kb: string) => [`Kijk, ik tel de rest. ${g(a, ka)} + ${g(b, kb)} = ${g(s)}.`, `Kijk, ik tel even verder. Samen zijn het ${g(s)} ${wat}.`],
  stippenZelf: (a: number, b: number) => [`Kijk, ik tel de rest. ${g(a, ORANJE)} + ${g(b, BLAUW)} = ${g(a + b)}.`, `Kijk, ik tel even verder. Samen zijn het ${g(a + b)} stippen.`],
  /** Na de stippen: het goede kaartje licht op. Het getal is net gezegd, dus hier niet nog een keer. */
  toonbankKlaar: ["Kijk, dit kaartje hoort erbij.", "Dat getal staat op dit kaartje."],
  /** De som is net genoemd ("Je verbond 3 + 4 met 9."), dus hier "die som" (niet nog een keer de getallen). */
  verbindSamen: ["Kom, we rekenen die som samen uit.", "Weet je wat? We rekenen die som samen uit.", "Ik help je even. We rekenen die som samen uit."],
  verbindAlles: (sommen: [number, number][]) => {
    const rij = sommen.map(([x, y]) => `${g(x)} + ${g(y)} = ${g(x + y)}`).join(", ");
    return [`Zo horen ze bij elkaar: ${rij}.`, `Kijk, zo hoort het: ${rij}.`];
  },
  /** Welke som (2e keer mis): Bliepo wijst de groepjes aan, het kind tikt de goede som. */
  somEerst: (n: number, nm: Naam, k: string) => (n === 1 ? [`Eerst ligt er ${aantal(1, nm, k)}.`, `Er ligt eerst ${aantal(1, nm, k)}.`] : [`Eerst liggen er ${aantal(n, nm, k)}.`, `Er liggen eerst ${aantal(n, nm, k)}.`]),
  somErbij: (n: number, nm: Naam, k: string) => [`Er ${n === 1 ? "komt" : "komen"} ${aantal(n, nm, k)} bij. Erbij is plus.`, `Dan ${n === 1 ? "komt" : "komen"} er ${aantal(n, nm, k)} bij. Erbij is plus.`],
  somTik: ["Tik op de som die erbij hoort.", "Tik maar op de som die erbij hoort."],
  somKlaar: (a: number, b: number, ka: string, kb: string) => [`Zo is het: ${g(a, ka)} + ${g(b, kb)} = ${g(a + b)}.`, `Kijk, zo hoort het: ${g(a, ka)} + ${g(b, kb)} = ${g(a + b)}.`],
  /** Hetzelfde antwoord 2 keer: niet 2 keer dezelfde eerste zin (geleerd bij Tellen). */
  weerGekozen: (x: string) => [`Je koos weer ${x}.`, `Je tikte weer op ${x}.`, `Weer ${x}, zie ik.`],
  weerVerbonden: (som: string, z: string) => [`Je verbond ${som} weer met ${z}.`, `Weer ${som} bij ${z}, zie ik.`],
  /** Stap 13: einde. */
  slot: [`Je hebt plussommen gemaakt tot ${g(10)}!`, `Wat heb jij goed opgeteld: tot wel ${g(10)}!`, `Knap, hoor! Je kunt al goed optellen tot ${g(10)}.`],
  kaartTik: ["Tik op de kaart.", "Tik maar op de kaart.", "Kijk, een kaart voor jou! Tik erop."],
  /** Aanmoediging bij het hulphandje (het kind moet tikken, niet nadenken; 14.35, geleerd bij Tellen). */
  aanmoedigTikken: ["Je bent goed bezig.", "Jij kunt dit.", "Het gaat goed zo.", "Probeer het maar.", "Toe maar, je doet het goed."],
};

/** Bewaard voor wie hem nog laadt: de 2 eerste aanmoedigingen (nu 5 in ZIN.aanmoedigTikken). */
export const AANMOEDIG_TIKKEN = ZIN.aanmoedigTikken;

/**
 * BLIEPO-KARAKTER.md §4 Optellen: zin 11, 12 en 15, plus 2 zinnen zonder "Ja" (voor na een lofzin met "Ja"); 5 en 6 zijn
 * erbij gekomen (18 november 2026; 5 was vertaald uit Synthesis en is sinds 19 november een eigen zin, 15.41).
 */
export const PLUSREACTIE = (a: number, b: number, ka: string, kb: string) =>
  rij(
    [
      `Ja, ${g(a, ka)} en ${g(b, kb)} zijn samen ${g(a + b)}.`,
      `Ja, ${g(a, ka)} plus ${g(b, kb)} is ${g(a + b)}.`,
      `${g(a, ka)} en ${g(b, kb)} zijn samen ${g(a + b)}.`,
      `${g(a, ka)} + ${g(b, kb)} = ${g(a + b)}.`,
      `Zie je, ${g(a, ka)} en nog ${g(b, kb)} is ${g(a + b)}.`,
      `Goed gerekend: ${g(a, ka)} + ${g(b, kb)} = ${g(a + b)}.`,
      `Dat klopt, ${g(a, ka)} en ${g(b, kb)} zijn samen ${g(a + b)}.`,
    ],
    [4],
  );
export const PLUSREACTIE_JA = [0, 1];
export const PLUSREACTIE_ROBOT = 4;
/** Na het verbinden (eigen invulling: Synthesis heeft geen verbinden). */
export const VERBINDREACTIE = rij(["Ja, elke som heeft het goede antwoord.", "Elke lijn klopt.", "Alle 3 de sommen kloppen.", "Bij elke som staat het goede antwoord."]);
export const VERBINDREACTIE_JA = [0];

/* ---------- denkfouten (draaiboek Plussommen §7; namen voor de voortgang) ---------- */

export const DENKFOUTEN = ["deel-als-antwoord", "min-in-plaats-van-plus", "een-te-veel", "te-veel", "een-te-weinig", "te-weinig", "getal-herhalen", "onduidelijk"] as const;
export type Denkfoutnaam = (typeof DENKFOUTEN)[number];

/** Wat de zinnen het kind vertellen; daarmee rekent het fouttabel-script na hoeveel keuzes er nog over zijn (15.17). */
export type Beperking = { meerDan?: number; minderDan?: number; plus?: true; getallen?: [number, number] };

/** Alle varianten bij 1 antwoord dat niet goed is; de les kiest er steeds 1 (nooit 2 keer achter elkaar dezelfde). */
export type Varianten = { eerste: string[]; hint: string[]; uitleg: string[]; weerEerste: string[]; weerUitleg: string[] };

export type Fout = {
  code: Denkfoutnaam;
  /** Welke uitleg bij de 2e fout hoort (dezelfde soort 2 keer = "weer"). */
  soort: string;
  denkfout: string;
  /** Bliepo's eerste zin: 1 vaste variant voor de fouttabel (leeg bij "onduidelijk": dan een zin uit BLIEPO-KARAKTER.md §10). */
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
  /** De eerste zin bij de 2e fout, als die anders is (alleen nog bij de vaste variant van het verbinden). */
  kort?: string;
  /** Alle varianten (18 nov 2026); `eerste`, `hint`, `uitleg` en `weer` hierboven zijn er 1 van. */
  v?: Varianten;
};

const SCHERM_KEUZE = "Bliepo's scherm 1,5 s rood (geen fout-geluidje); de knoppen weg, de som en het lekkers blijven staan; met de hint komen dezelfde knoppen meteen terug (geen pijl, draaiboek §3 D.2)";
const SCHERM_TOONBANK = "Bliepo's scherm 1,5 s rood; de kaartjes worden dof en zijn niet te tikken; met de hint zijn ze weer gewoon te tikken";
const SCHERM_SOM = "Bliepo's scherm 1,5 s rood; de knoppen weg, het lekkers blijft staan; met de hint komen de 4 sommen meteen terug";
const SCHERM_VERBIND = "Bliepo's scherm 1,5 s rood; de lijnen blijven even staan (wit, geen rood), daarna zijn ze weg en verbindt het kind alles opnieuw";
const NOOT = "richting niet genoemd: dan bleef er maar 1 keuze over";

/** Hoeveel keuzes er na de beperking over zijn (getallen). */
export const overNa = (keuzes: number[], x: number, b: Beperking) => keuzes.filter((k) => k !== x && (b.meerDan === undefined || k > b.meerDan) && (b.minderDan === undefined || k < b.minderDan));

const kaalZin = (z: string) => z.replace(/\{([^}:]+):[a-zA-Z]+\}/g, "$1");
const getallenIn = (z: string) => kaalZin(z).match(/\d+/g) ?? [];
/**
 * Een getal staat niet 2 keer in 1 variant (Sara, 18 nov 2026). `mag` = getallen die in de som zelf 2 keer voorkomen
 * (4 + 4). Blijven er minder dan 2 varianten over, dan blijft het rijtje zoals het was.
 */
const zonderDubbel = (l: string[], mag: number[] = []) => {
  const over = l.filter((z) => {
    const g2 = getallenIn(z).filter((n) => !mag.includes(Number(n)));
    return new Set(g2).size === g2.length;
  });
  return over.length >= 2 ? over : l;
};
const vasteVariant = (l: string[], nr: number) => l[nr % l.length] ?? "";

/** Woorden waarmee Bliepo zegt dat het bijna goed was. Bij 1 vraag komt zo'n woord hooguit 1 keer (geleerd bij Tellen). */
const KERN = /dichtbij|bijna|scheelt/gi;
export const zelfdeKern = (a: string, b: string) => {
  const A = new Set((a.match(KERN) ?? []).map((w) => w.toLowerCase()));
  return (b.match(KERN) ?? []).some((w) => A.has(w.toLowerCase()));
};

/**
 * De eerste zin als Bliepo de richting niet noemt (zou het antwoord verklappen, 15.17). "Dichtbij" alleen als dat woord
 * zelf niets verklapt (er liggen dan nog minstens 2 keuzes dichtbij); anders alleen wat het kind koos.
 */
export const DICHTBIJ = [(X: string) => `Je koos ${X}. Je zit er dichtbij.`, (X: string) => `Je koos ${X}. Dat scheelt niet veel.`, (X: string) => `Bijna! ${X} is het net niet.`, (X: string) => `${X}? Dat is heel dichtbij.`, (X: string) => `Je tikte op ${X}. Het scheelt maar een klein beetje.`];
export const ZONDER_RICHTING = [(X: string) => `Je koos ${X}. Ik kom op een ander getal.`, (X: string) => `${X}? Ik tel een ander getal.`, (X: string) => `Je tikte op ${X}. We tellen nog een keer.`];

/**
 * De fouttabel van 1 antwoord dat niet goed is bij een TOTAAL (verhaal en toonbank). Draaiboek §3 D en §7: deel als
 * antwoord, het verschil (min), 1 te veel of te weinig. Bliepo zegt wat het kind koos en in welke richting het goede
 * antwoord ligt; zou die richting maar 1 keuze overlaten, dan noemt hij hem niet en wijst hij alleen naar de manier van
 * tellen. Voor de verhaaltjes noemt Bliepo het lekkers; bij de toonbank zijn er geen dingen in beeld, dan "de som".
 */
export function totaalFout(v: Verhaal | Toonbank, x: number): Fout {
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
  const scherm = isVerhaal ? SCHERM_KEUZE : SCHERM_TOONBANK;
  const nr = v.nr;
  const nm = isVerhaal ? v.namen : null;
  const wat = isVerhaal ? v.wat : "";
  const mag = a === b ? [a] : [];
  /* Hints zonder richting (mogen altijd): alleen hoe je telt. */
  const neutraal = isVerhaal
    ? [`Tel alle ${wat} nog eens, stuk voor stuk.`, `Begin bij ${A} en tel de ${nm![1].meer} daar erbij.`, `Wijs ze stuk voor stuk aan en tel ze samen.`, `Begin nog een keer bij ${A} en tel door.`, `Tel het nog eens na. Begin bij ${A}.`]
    : [`Begin bij ${A} en tel ${B} verder.`, `Tel verder vanaf ${A}: nog ${B} erbij.`, `Begin bij ${A}. Tel er ${B} bij.`, `Probeer het nog eens. Tel verder vanaf het eerste getal.`];
  /* "Dichtbij" verklapt niets als er nog minstens 2 keuzes dichtbij liggen (en het goede antwoord er 1 van is). */
  const dichtbijMag = (bp: Beperking) => Math.abs(s - x) <= 2 && overNa(keuzes, x, bp).filter((k) => Math.abs(k - x) <= 2).length >= 2;
  const zonderRichting = (dichtbijMag({}) ? DICHTBIJ : ZONDER_RICHTING).map((z) => z(X));
  const maak = (code: Denkfoutnaam, soort: string, denkfout: string, beperking: Beperking, d: Varianten): Fout => {
    const verklapt = overNa(keuzes, x, beperking).length <= 1;
    const vv: Varianten = {
      eerste: zonderDubbel(verklapt ? zonderRichting : d.eerste, mag),
      hint: zonderDubbel(verklapt ? neutraal : d.hint, mag),
      uitleg: zonderDubbel(d.uitleg, mag),
      /* "Weer" alleen als Bliepo de 1e keer al zei wat er mis was. */
      weerEerste: verklapt ? [] : d.weerEerste,
      weerUitleg: verklapt ? [] : zonderDubbel(d.weerUitleg, mag),
    };
    return {
      code,
      soort,
      denkfout,
      eerste: vasteVariant(vv.eerste, nr),
      hint: vasteVariant(vv.hint, nr),
      uitleg: vasteVariant(vv.uitleg, nr),
      weer: vv.weerEerste.length ? [vasteVariant(vv.weerEerste, nr), vasteVariant(vv.weerUitleg, nr)] : [],
      scherm,
      beperking: verklapt ? {} : beperking,
      ...(verklapt ? { noot: NOOT } : {}),
      v: vv,
    };
  };

  /* Het getal van 1 groepje (of een getal uit de som). Bij 3 + 6 is 3 ook 6 − 3; het is in elk geval 1 van de 2 getallen. */
  if (x === a || x === b) {
    const kant = x === a ? 0 : 1;
    const plek = kant === 0 ? "hier" : "daar";
    const ander = kant === 0 ? "daar" : "hier";
    const anderN = kant === 0 ? b : a;
    const alleen = isVerhaal ? (x === 1 ? `Dat is alleen ${nm![kant].het} ${plek}.` : `Dat zijn alleen de ${nm![kant].meer} ${plek}.`) : "";
    const eerste = isVerhaal
      ? [`Je koos ${X}. ${alleen}`, `${X}? ${alleen}`, x === 1 ? `Je tikte op ${X}. ${alleen}` : `Je tikte op ${X}. Zoveel liggen er alleen ${plek}.`]
      : [`${X} staat al in de som. Er komt nog iets bij.`, `Je koos ${X}. Dat getal staat al in de som.`, `Je tikte op ${X}. Maar er komt nog iets bij.`];
    const hint = isVerhaal
      ? [`Tel ze allemaal samen, hier en daar.`, `Tel de ${wat} hier én daar.`, `Begin bij ${A} en tel de andere erbij.`, `Probeer het nog eens. Tel ook ${anderN === 1 ? nm![1 - kant].het : `de ${nm![1 - kant].meer}`} ${ander}.`]
      : neutraal;
    return maak("deel-als-antwoord", "deel", "koos het getal van 1 groepje (of 1 getal uit de som) als antwoord", { meerDan: x }, {
      eerste,
      hint,
      uitleg: isVerhaal ? [`Samen betekent: de ${wat} hier én daar.`, `De ${wat} hier en daar tellen allebei mee.`, "Samen is alles bij elkaar: hier en daar."] : ["Bij plus komt er iets bij. Dan wordt het meer.", "Bij plus tel je de getallen bij elkaar op.", "Het antwoord is meer dan elk getal in de som."],
      weerEerste: isVerhaal ? ["Je koos weer maar 1 kant.", "Dat is weer maar 1 kant.", "Weer alleen de ene kant, zie ik."] : ["Je koos weer een getal uit de som.", "Dat is weer een getal uit de som.", "Weer een getal uit de som, zie ik."],
      weerUitleg: isVerhaal ? [`De andere ${wat} horen er ook bij.`, `De ${wat} aan de andere kant tellen ook mee.`] : ["Het antwoord is meer dan elk getal in de som.", "Bij plus wordt het meer dan de getallen in de som."],
    });
  }
  /* Het verschil: plus en min verwisseld. */
  if (x === groot - klein) {
    const K = a === b ? g(a, ka) : g(klein, klein === a ? ka : kb);
    const G = a === b ? g(b, kb) : g(groot, groot === a ? ka : kb);
    return maak("min-in-plaats-van-plus", "min", "trok het kleine getal van het grote af (min in plaats van plus)", { meerDan: groot }, {
      eerste: [`${X} krijg je als je ${K} van ${G} afhaalt.`, `Je koos ${X}. Dan heb je er ${K} afgehaald.`, `${X}? Dan ${klein === 1 ? "gaat" : "gaan"} er ${K} weg.`],
      hint: isVerhaal
        ? [`Bij samen tel je ze erbij. Begin bij ${A}.`, `Samen is erbij. Tel verder vanaf ${A}.`, `Hier gaat niets weg. Tel de ${wat} bij elkaar op.`]
        : [`Bij plus tel je erbij. Begin bij ${A}.`, `Bij plus komt er iets bij. Tel verder vanaf ${A}.`, `Hier gaat niets weg. Tel de getallen bij elkaar op.`],
      uitleg: isVerhaal
        ? ["Bij samen haal je er niets af. Je telt ze erbij.", "Bij samen gaat er niets weg. Er komt juist iets bij.", "Samen is erbij. Er gaat niets weg."]
        : ["Bij plus haal je er niets af. Je telt erbij.", "Bij plus gaat er niets weg. Er komt juist iets bij.", "Plus is erbij. Er gaat niets weg."],
      weerEerste: ["Je haalde er weer iets af.", "Dat is weer eraf in plaats van erbij.", "Weer eraf, zie ik."],
      weerUitleg: ["Bij plus komt er iets bij.", "Plus is erbij, niet eraf."],
    });
  }
  if (x > s) {
    const een = x === s + 1;
    const bijna = een && dichtbijMag({ minderDan: x });
    return maak(een ? "een-te-veel" : "te-veel", "te-veel", een ? "telde 1 te veel" : "telde er te veel", { minderDan: x }, {
      eerste: [
        `${X} is te veel voor ${A} en ${B} samen.`,
        isVerhaal ? `Je koos ${X}. Dat zijn er te veel.` : `Je koos ${X}. Dat is te veel.`,
        `${X}? Dat is meer dan ${A} en ${B} samen.`,
        bijna ? `Bijna! ${X} is iets te veel.` : isVerhaal ? `Je tikte op ${X}. Zo veel zijn het er niet.` : `Je tikte op ${X}. Zo veel is het niet.`,
      ],
      hint: isVerhaal
        ? [`Tel verder vanaf ${A}. Tel ${nm![1].elk} ${nm![1].een} maar ${g(1)} keer.`, `Begin bij ${A} en wijs ${nm![1].elk} ${nm![1].een} daar ${g(1)} keer aan.`, `Tel nog eens verder vanaf ${A}, rustig, stuk voor stuk.`, `Probeer het nog eens. Tel geen ${nm![1].een} ${g(2)} keer.`]
        : [`Begin bij ${A} en tel ${B} verder, niet meer.`, `Tel verder vanaf ${A}: nog ${B} erbij, niet meer.`, `Begin bij ${A}. Tel er precies ${B} bij.`, "Probeer het nog eens. Tel er niet te veel bij."],
      uitleg: een
        ? [`Je telde er ${g(1)} te veel.`, isVerhaal ? `Het is er ${g(1)} minder.` : `Het is ${g(1)} minder.`, `${X} is net iets te veel.`]
        : ["Je telde er een paar te veel.", isVerhaal ? "Het zijn er een paar minder." : "Het is een paar minder.", `${X} is te veel.`],
      weerEerste: ["Je koos weer te veel.", "Het is weer te veel.", "Weer te veel, zie ik."],
      weerUitleg: isVerhaal ? [`${hoofd(nm![1].elk)} ${nm![1].een} telt maar ${g(1)} keer.`, `We tellen ${nm![1].elk} ${nm![1].een} precies ${g(1)} keer.`] : [`Er komen er ${B} bij, niet meer.`, `Na ${A} tel je er ${B} bij. Dan stop je.`],
    });
  }
  if (x < s) {
    const een = x === s - 1;
    const bijna = een && dichtbijMag({ meerDan: x });
    return maak(een ? "een-te-weinig" : "te-weinig", "te-weinig", een ? "telde 1 te weinig" : "telde er te weinig", { meerDan: x }, {
      eerste: [
        `${X} is te weinig voor ${A} en ${B} samen.`,
        isVerhaal ? `Je koos ${X}. Dat zijn er te weinig.` : `Je koos ${X}. Dat is te weinig.`,
        `${X}? Dat is minder dan ${A} en ${B} samen.`,
        bijna ? `Bijna! ${X} is nog iets te weinig.` : isVerhaal ? `Je tikte op ${X}. Het zijn er meer.` : `Je tikte op ${X}. Het is meer.`,
      ],
      hint: isVerhaal
        ? [`Tel verder vanaf ${A}. Sla er geen over.`, `Begin bij ${A} en tel alle ${nm![1].meer} daar erbij.`, `Tel nog eens verder vanaf ${A}. Sla geen ${nm![1].een} over.`, `Probeer het nog eens. Tel ${nm![1].elk} ${nm![1].een} mee, ook ${nm![1].elk === "elk" ? "het" : "de"} laatste.`]
        : [`Begin bij ${A} en tel ${B} verder. Sla er geen over.`, `Tel verder vanaf ${A}: nog ${B} erbij. Sla er geen over.`, `Begin bij ${A}. Tel er ${B} bij en sla er geen over.`, "Probeer het nog eens. Tel verder en sla er geen over."],
      uitleg: een
        ? [`Je telde er ${g(1)} te weinig.`, isVerhaal ? `Het is er ${g(1)} meer.` : `Het is ${g(1)} meer.`, `${X} is net iets te weinig.`]
        : ["Je telde er een paar te weinig.", isVerhaal ? "Het zijn er een paar meer." : "Het is een paar meer.", `${X} is te weinig.`],
      weerEerste: ["Je koos weer te weinig.", "Het is weer te weinig.", "Weer te weinig, zie ik."],
      weerUitleg: isVerhaal ? [`${hoofd(nm![1].elk)} ${nm![1].een} telt mee.`, `We slaan geen ${nm![1].een} over.`] : [`Er komen er ${B} bij, niet minder.`, `Na ${A} komen er nog ${B} bij.`],
    });
  }
  return { code: "onduidelijk", soort: "onduidelijk", denkfout: "niet duidelijk (geen reden verzonnen)", eerste: "", hint: neutraal[nr % neutraal.length], uitleg: "We tellen ze samen.", weer: [], scherm, beperking: {} };
}

/** De fouttabel van een antwoord dat niet goed is bij "welke som hoort erbij?" (draaiboek §3 E en §7). */
export function somFout(v: Somkeuze, optie: string): Fout {
  const { a, b } = v;
  const [ka, kb] = kleurenVan(v);
  const A = g(a, ka);
  const B = g(b, kb);
  const m = optie.match(/^(\d+) (.) (\d+) = (\d+)$/);
  const [p, teken, q] = m ? [Number(m[1]), m[2], Number(m[3])] : [0, "", 0];
  const maak = (code: Denkfoutnaam, soort: string, denkfout: string, beperking: Beperking, vv: Varianten): Fout => ({
    code,
    soort,
    denkfout,
    eerste: vasteVariant(vv.eerste, v.nr),
    hint: vasteVariant(vv.hint, v.nr),
    uitleg: vasteVariant(vv.uitleg, v.nr),
    weer: [vasteVariant(vv.weerEerste, v.nr), vasteVariant(vv.weerUitleg, v.nr)],
    scherm: SCHERM_SOM,
    beperking,
    v: vv,
  });
  if (teken === MIN)
    return maak("min-in-plaats-van-plus", "min", "koos een minsom (min in plaats van plus)", { plus: true }, {
      eerste: [`Bij ${g(p)} ${MIN} ${g(q)} gaan er ${v.wat} weg.`, `Je koos een minsom. Dan gaan er ${v.wat} weg.`, `${g(p)} ${MIN} ${g(q)}? Dan haal je er ${v.wat} af.`],
      hint: [`Hier komen er ${v.wat} bij. Erbij is plus. Welke som hoort erbij?`, `Er gaan geen ${v.wat} weg. Er komen er juist bij. Kies de som die erbij hoort.`, `Er komen ${v.wat} bij. Zoek een som met een plus.`],
      uitleg: [`Er komen ${aantal(b, v.namen[1], kb)} bij. Dan is het een plussom.`, "Bij erbij hoort een plus, geen min."],
      weerEerste: ["Je koos weer een minsom.", "Dat is weer een minsom.", "Weer de minsom, zie ik."],
      weerUitleg: ["Bij erbij hoort het plusteken.", "Erbij schrijf je met een plus."],
    });
  if (p === q)
    return maak("getal-herhalen", "herhalen", "nam 2 keer hetzelfde getal (keek naar 1 groepje)", { getallen: [a, b] }, {
      /* Was "In 3 + 3 staat 2 keer de 3.": het getal stond er 3 keer. */
      eerste: ["In deze som staat 2 keer hetzelfde getal.", `Je koos een som met 2 keer de ${g(p)}.`, `Deze som heeft 2 keer de ${g(p)}.`],
      hint: [`Kijk naar de ${v.wat} hier én daar. Welke som hoort erbij?`, `Hoeveel ${v.wat} zijn er hier? En hoeveel daar?`, `Tel eerst de ${v.wat} hier. Tel dan de ${v.wat} daar.`],
      uitleg: [`In de som horen allebei de getallen: ${A} en ${B}.`, `De som begint met ${A}. Dan komen er ${B} bij.`],
      weerEerste: ["Je koos weer 2 keer hetzelfde getal.", "Dat is weer 2 keer hetzelfde getal.", "Weer 2 keer hetzelfde getal, zie ik."],
      weerUitleg: [`Hier liggen er ${A}, daar ${B}.`, `Eerst zijn er ${A}. Daarna komen er ${B} bij.`],
    });
  return { code: "onduidelijk", soort: "onduidelijk", denkfout: "niet duidelijk (geen reden verzonnen)", eerste: "", hint: `Kijk naar de ${v.wat} hier én daar. Welke som hoort erbij?`, uitleg: `In de som horen ${A} en ${B}.`, weer: [], scherm: SCHERM_SOM, beperking: {} };
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
 * De som staat in 1 reactie maar 1 keer (was: "Je verbond 3 + 4 met 9. 3 + 4 is minder dan 9.").
 */
export function verbindFout(v: Verbind, i: number, z: number): Fout {
  const [x, y] = v.sommen[i];
  const s = x + y;
  const S = `${g(x)} + ${g(y)}`;
  const Z = g(z);
  /* Alleen wat het kind deed (zonder richting): ook de eerste zin bij de 2e keer. */
  const kaal = [`Je verbond ${S} met ${Z}.`, `Bij ${S} koos je ${Z}.`, `${S} en ${Z} horen niet bij elkaar.`];
  const hint = ["Reken elke som uit en verbind ze opnieuw.", "Probeer het nog eens. Reken eerst elke som uit.", "Reken de sommen nog eens uit. Verbind ze daarna opnieuw."];
  const maak = (code: Denkfoutnaam, soort: string, denkfout: string, beperking: Beperking, metRichting: string[], uitleg: string[]): Fout => {
    const verklapt = overNa(v.antwoorden, z, beperking).length <= 1;
    const vv: Varianten = { eerste: verklapt ? kaal : metRichting, hint, uitleg, weerEerste: [], weerUitleg: [] };
    return {
      code,
      soort,
      denkfout,
      eerste: vasteVariant(vv.eerste, v.nr + i),
      hint: vasteVariant(hint, v.nr + i),
      uitleg: vasteVariant(uitleg, v.nr + i),
      weer: [],
      scherm: SCHERM_VERBIND,
      beperking: verklapt ? {} : beperking,
      ...(verklapt ? { noot: "richting niet genoemd: dan bleef er maar 1 antwoord over" } : {}),
      kort: vasteVariant(kaal, v.nr + i),
      v: vv,
    };
  };
  if (z === x || z === y)
    return maak("deel-als-antwoord", "deel", "koos een getal uit de som zelf", { meerDan: z }, [`Je verbond ${S} met ${Z}. Maar dat getal staat al in die som.`, `Bij ${S} koos je ${Z}. Dat getal zit zelf al in de som.`, `${S} en ${Z} horen niet bij elkaar. Er komt nog iets bij.`], ["Bij plus komt er nog iets bij. Het wordt meer.", "Die som hoort bij een groter getal."]);
  if (z > s)
    return maak(z === s + 1 ? "een-te-veel" : "te-veel", "te-veel", z === s + 1 ? "1 te veel" : "te veel", { minderDan: z }, [`Je verbond ${S} met ${Z}. Dat is te veel voor die som.`, `Bij ${S} koos je ${Z}. Dat is te veel.`, `${S} en ${Z} horen niet bij elkaar. Die som is minder.`], ["Die som hoort bij een kleiner getal.", "Het antwoord van die som is minder."]);
  if (z < s)
    return maak(z === s - 1 ? "een-te-weinig" : "te-weinig", "te-weinig", z === s - 1 ? "1 te weinig" : "te weinig", { meerDan: z }, [`Je verbond ${S} met ${Z}. Dat is te weinig voor die som.`, `Bij ${S} koos je ${Z}. Dat is te weinig.`, `${S} en ${Z} horen niet bij elkaar. Die som is meer.`], ["Die som hoort bij een groter getal.", "Het antwoord van die som is meer."]);
  return { code: "onduidelijk", soort: "onduidelijk", denkfout: "niet duidelijk", eerste: "", hint: hint[0], uitleg: "Die som hoort bij een ander antwoord.", weer: [], scherm: SCHERM_VERBIND, beperking: {} };
}

/** De zinnen bij het verbinden die alleen zeggen wat het kind deed (voor de 2e keer: daarna volgt de uitleg). */
export const verbindKaal = (v: Verbind, i: number, z: number) => {
  const [x, y] = v.sommen[i];
  return [`Je verbond ${g(x)} + ${g(y)} met ${g(z)}.`, `Bij ${g(x)} + ${g(y)} koos je ${g(z)}.`, `${g(x)} + ${g(y)} en ${g(z)} horen niet bij elkaar.`];
};

/* ---------- kiezen uit de varianten (zuiver: de les en het fouttabel-script gebruiken allebei deze functies) ---------- */

/** De woorden die per vraag wisselen (het lekkers, hier/daar): "Je koos 4. … taartjes daar." = "Je koos 2. … broodjes hier.". */
export const WISSELWOORDEN = [
  ...[TAARTJE, WIT_BROOD, BRUIN_BROOD, CUPCAKE, KRENTENBOL, KOEKJE, DONUT, CROISSANT, BROODJE].flatMap((n) => [n.het, n.meer, n.een]),
  "broden",
  "hier",
  "daar",
  "ligt",
  "liggen",
  "komt",
  "komen",
  "elke",
  "elk",
  "welke",
  "welk",
];

/** Hebben 2 zinnen een getal gemeen? (Dan liever een andere variant: een getal niet 2 keer achter elkaar.) */
export const deeltGetal = (p: string, q: string) => {
  const P = new Set(getallenIn(p));
  return getallenIn(q).some((n) => P.has(n));
};

/**
 * Wat Bliepo bij de 2e keer als eerste zin mag zeggen als het kind iets ANDERS koos dan de 1e keer (en het niet dezelfde
 * denkfout is): elke variant van de eerste zin, behalve die met een woord dat hij bij deze vraag al zei ("dichtbij",
 * "bijna", "scheelt").
 */
export function tweedeEerste(alle: string[], eersteZin: string): string[] {
  const over = alle.filter((z) => !zelfdeKern(eersteZin, z));
  return over.length ? over : alle;
}

/**
 * Wat Bliepo zegt bij een antwoord dat niet goed is, gekozen uit de varianten van de fouttabel:
 *   1e keer: eerste zin (wat het kind koos) + hint;
 *   2e keer: eerste zin + uitleg; of, bij 2 keer dezelfde denkfout (en Bliepo zei de 1e keer al wat er mis was), "weer" +
 *   een andere uitleg; of, bij hetzelfde antwoord 2 keer, "Je koos weer …" + uitleg.
 * In 1 reactie staat geen stuk en geen getal 2 keer, als er een variant is waarbij dat kan.
 */
export function kiesFoutZinnen(
  K: Kiezer,
  f: Fout,
  o: { poging: 1 | 2; eerder: Fout | null; zelfdeX: boolean; weerGekozen: string[]; eersteZin: string; onduidelijk: () => string; kaal?: string[] },
): string[] {
  const v = f.v;
  if (!v || !v.eerste.length) {
    /* Denkfout niet duidelijk (komt in deze les niet voor): een zin uit het vaste rijtje en de algemene hint. */
    const e = f.eerste || o.onduidelijk();
    return o.poging === 1 ? [e, f.hint] : [e, f.uitleg];
  }
  const past = (e: string) => (z: string) => !deeltStuk(e, z) && !deeltGetal(e, z);
  if (o.poging === 1) {
    const e = K.kies("eerste", v.eerste);
    return [e, K.kies("hint", v.hint, past(e))];
  }
  if (o.eerder !== null && o.eerder.soort === f.soort && !o.eerder.noot && !f.noot && v.weerEerste.length) {
    const w = K.kies("weer", v.weerEerste);
    return [w, K.kies("uitleg", v.weerUitleg, (z) => !deeltStuk(w, z))];
  }
  const e = o.zelfdeX ? K.kies("weerGekozen", o.weerGekozen) : K.kies("eerste", tweedeEerste(o.kaal ?? v.eerste, o.eersteZin));
  return [e, K.kies("uitleg", v.uitleg, past(e))];
}

/** De fouttabel van een vraag: elk fout antwoord (bij verbinden: elke som met elk fout antwoord). */
export function foutenVan(v: Plusvraag): Record<string, Fout> {
  if (v.soort === "verhaal") return Object.fromEntries(v.keuzes.filter((k) => k !== v.a + v.b).map((k) => [String(k), totaalFout(v, k)]));
  if (v.soort === "toonbank") return Object.fromEntries(v.kaarten.filter((k) => k !== v.a + v.b).map((k) => [String(k), totaalFout(v, k)]));
  if (v.soort === "som") return Object.fromEntries(v.opties.filter((o) => o !== somTekst(v.a, v.b)).map((o) => [o, somFout(v, o)]));
  return Object.fromEntries(v.sommen.flatMap(([x, y], i) => v.antwoorden.filter((z) => z !== x + y).map((z) => [`${x} + ${y} → ${z}`, verbindFout(v, i, z)])));
}
