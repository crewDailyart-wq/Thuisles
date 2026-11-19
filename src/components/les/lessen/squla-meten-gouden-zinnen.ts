/**
 * ALLE ZINNEN VAN BLIEPO in de gouden les Meten (squla-meten-oppervlakte-1-gouden, "Hoe groot is het?", 10 november
 * 2026), op één plek, met de FOUTTABEL. De les zelf (squla-meten-gouden.tsx) bevat geen eigen zinnen.
 *
 *   - De rijtjes (lof, momenten, naam, goed na een fout, einde, eerste zin als de denkfout niet duidelijk is) zijn
 *     dezelfde als in de andere gouden lessen (BLIEPO-KARAKTER.md). Hier alleen de reactie bij Meten (BLIEPO-KARAKTER.md
 *     §4 Meten, eigen zinnen per vraag), met zinnen zonder "Ja" voor na een lofzin met "Ja".
 *   - De inhoud (12 vragen + 3 die terugkomen, de getallen en de keuzes) is die van squla-meten-oppervlakte-1 "Hoe groot
 *     is het?" (BOUWREGELS 15.21, 15.22): 2 keer schilderijen (kies er 2), tafels op volgorde, 2 keer muurtjes op
 *     volgorde, het gedraaide kaartje, blauw en geel op ruitjespapier (kies er 2), 2 keer speelmatten, 3 keer een tafel
 *     vol blaadjes (typen). De vraagzinnen zijn die van de oude les (18 november 2026: bij vraag 2 "kaartjes" in plaats
 *     van "zinnen", bij vraag 11 "Typ het getal." erbij; KEUZES-METEN.md).
 *   - Het skelet volgt het draaiboek Meten (Area: Cover It Up, SYNTHESIS-ANALYSE/DRAAIBOEKEN-NIEUW/meten.md): geen
 *     startvraag, meteen de eerste vraag (§1); de keuzes tegelijk met de vraag, een tik is het antwoord (§0); bij "hoeveel
 *     tegels?" een eigen zin per fout getal (§3 C: de bovenste rij, een rij gemist, 1 te veel) en tegels aantikken om te
 *     tellen (§0, §3 G: goud met een nummer); bij de 2e fout samen tellen (§3 G); het getal in de kleur van de tegels
 *     naast het ding na goed (§0); hulphandje alleen bij doe-opdrachten (§0, §4); niets bij heel snel (§3 C.2).
 *   - Schilderijen, op volgorde, het gedraaide kaartje, ruitjes en speelmatten zitten NIET zo in Cover It Up (draaiboek
 *     §8): die vragen hebben hetzelfde skelet, maar hun eerste zinnen, hints en fouttabel zijn "eigen invulling, niet van
 *     Synthesis" (BOUWREGELS 15.22 punt 5), behalve waar een denkfout uit het draaiboek komt (§7: lang-lijkt-groter,
 *     groot-vierkant-lijkt-groter, vorm-verandert-grootte, een-rij-geteld, rij-gemist, een-te-veel).
 *
 * Leesbare versie: FOUTTABEL-squla-meten-oppervlakte-1-gouden.md (maak hem opnieuw met
 * `npx tsx scripts/fouttabel-meten-gouden.ts`; dat script doet ook de reken-, verklap- en waarheidscontrole).
 * WARME JUF, NOOIT 2 KEER HETZELFDE (Sara, 18 november 2026; zoals de proefles Tellen): elke zin die terugkomt is een
 * lijst van varianten; de les kiest er 1 met de gedeelde kiezer (nooit-dubbel.ts). `foutReactie` onderaan kiest wat
 * Bliepo zegt na een antwoord dat niet goed is; het fouttabel-script speelt precies die functie na en keurt ELKE
 * variant. Oud naast nieuw: WIJZIGINGEN-ZINNEN-METEN.md.
 * Getalkleur (BOUWREGELS 2.1, 2.2, 14.27): een getal heeft de kleur van de dingen waar het naar verwijst: de blaadjes
 * (groen, blauw, oranje), de blauwe en gele hokjes, de tegels op de muur (geel), de stenen (rood). Puzzelstukken in
 * allerlei kleuren, borden en kale getallen: wit.
 */

import type { Rijtje } from "./squla-klok-gouden-zinnen";
import { deeltStuk, maakKiezer, type Kiezer } from "./nooit-dubbel";

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
  metNaam,
  type Rijtje,
} from "./squla-klok-gouden-zinnen";

const rij = (zinnen: string[], robot: number[] = []): Rijtje => ({ zinnen, robot });
const g = (n: number, kleur: string) => `{${n}:${kleur}}`;

/* ---------- de vragen van squla-meten-oppervlakte-1 (zelfde volgorde, getallen en keuzes) ---------- */

export type Kaart = { id: string; tekening?: string; label?: string; zeg: string; naam: string };
export type Soort = "twee" | "orden" | "kies" | "typ";
export type Thema = "schilderij" | "ruitjes" | "tafels" | "muurtjes" | "vellen" | "matten" | "tafel";

export type Vraag = {
  nr: number;
  id: string;
  soort: Soort;
  thema: Thema;
  /** De tekening bovenaan (sleutel uit squla-meten-tekeningen.ts). */
  beeld: string;
  /** Het goede antwoord als tekst: 2 kaarten ("huis,zon", op naam gesorteerd), een volgorde ("a,b,c,d"), een zin of een getal. */
  goed: string;
  /** Wat Bliepo eerst over het beeld zegt (1 stuk met de pijl), zodat het stuk met de vraag niet te lang wordt (15.30: Bliepo werd anders kleiner). */
  intro?: string[];
  vraag: string[];
  /** Kies er 2: de kaartjes in het vlak. */
  kaarten?: Kaart[];
  /** Op volgorde: de losse kaartjes en de goede volgorde. */
  losse?: Kaart[];
  juist?: string[];
  /** Kiezen bij Bliepo: de zinnen op de knoppen. */
  opties?: string[];
  /** Typen: de tafel (k blaadjes per rij, r rijen) en de kleur van de blaadjes. */
  k?: number;
  r?: number;
  kleur?: string;
  /** Speelmatten: hoeveel stukken elke mat heeft. */
  stukken?: number;
};

const SCH = (id: string, o: string, wat: string, zin: string, naam: string): Kaart => ({ id, tekening: `onderwerp|o=${o}`, label: wat, zeg: zin, naam });
const K = (id: string, tekening: string, naam: string): Kaart => ({ id, tekening, zeg: "", naam });
const Z = (id: string, label: string, tekening: string): Kaart => ({ id, label, tekening, zeg: label, naam: label });

/** Hoeveel tegels elk schilderij bedekt (uit MUREN in squla-meten-tekeningen.ts: breedte × hoogte in tegels). */
export const TEGELS: Record<string, number> = { zon: 9, bloem: 16, huis: 20, boot: 6, boom: 12, planeet: 20 };
/** Hoe groot elk kaartje op volgorde is (om te vergelijken): borden of plekken op een tafel, stenen naast elkaar. */
export const MAAT: Record<string, number> = { a: 2, b: 4, c: 6, d: 9, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7 };

const twee = (a: string, b: string) => [a, b].sort().join(",");

export const VRAGEN: Vraag[] = [
  {
    nr: 1,
    id: "vraag1-schilderijen-zon",
    soort: "twee",
    thema: "schilderij",
    beeld: "muur|v=1",
    kaarten: [
      SCH("zon", "zon", "kleinst", "Het schilderij met de zon is het kleinst.", "de zon"),
      SCH("bloem", "bloem", "kleinst", "Het schilderij met de bloem is het kleinst.", "de bloem"),
      SCH("huis", "huis", "grootst", "Het schilderij met het huis is het grootst.", "het huis"),
    ],
    goed: twee("zon", "huis"),
    vraag: ["Kijk naar de schilderijen op de muur.", "Wat klopt er? Kies er 2."],
  },
  {
    nr: 2,
    id: "vraag2-schilderijen-boot",
    soort: "twee",
    thema: "schilderij",
    beeld: "muur|v=2",
    kaarten: [
      SCH("boot", "boot", "kleinst", "Het schilderij met de boot is het kleinst.", "de boot"),
      SCH("boom", "boom", "kleinst", "Het schilderij met de boom is het kleinst.", "de boom"),
      SCH("planeet", "planeet", "grootst", "Het schilderij met de planeet is het grootst.", "de planeet"),
    ],
    goed: twee("boot", "planeet"),
    /* "kaartjes", niet "zinnen": op een kaartje staat een plaatje met 1 woord (3.12; 18 november 2026). */
    vraag: ["Weer een muur met schilderijen.", "Welke 2 kaartjes kloppen?"],
  },
  {
    nr: 3,
    id: "vraag3-tafels",
    soort: "orden",
    thema: "tafels",
    beeld: "",
    juist: ["a", "b", "c", "d"],
    losse: [K("d", "tafelb|k=3|r=3|n=6", "de tafel met plek over"), K("a", "tafelb|k=2|r=1|n=2", "de tafel met 2 borden"), K("c", "tafelb|k=3|r=2|n=6", "de tafel met 6 borden"), K("b", "tafelb|k=2|r=2|n=4", "de tafel met 4 borden")],
    goed: "a,b,c,d",
    intro: ["Hier zijn 4 tafels met borden."],
    vraag: ["Zet de tafels op volgorde.", "Van klein naar groot."],
  },
  {
    nr: 4,
    id: "vraag4-muurtjes-2-4-6",
    soort: "orden",
    thema: "muurtjes",
    beeld: "",
    juist: ["2", "4", "6"],
    losse: [K("6", "muurtje|n=6", "het muurtje van 6 stenen breed"), K("2", "muurtje|n=2", "het muurtje van 2 stenen breed"), K("4", "muurtje|n=4", "het muurtje van 4 stenen breed")],
    goed: "2,4,6",
    vraag: ["Zet de muurtjes op volgorde.", "Van smal naar breed."],
  },
  {
    nr: 5,
    id: "vraag5-gedraaid-kaartje",
    soort: "kies",
    thema: "vellen",
    beeld: "vellen|draai=1",
    opties: ["Ze zijn even groot.", "Ze zijn niet even groot."],
    goed: "Ze zijn even groot.",
    intro: ["Hier liggen 2 kaartjes papier.", "Kaartje {2:oranje} ligt op zijn kant."],
    vraag: ["Wat klopt?", "Zijn ze even groot, of niet even groot?"],
  },
  {
    nr: 6,
    id: "vraag6-ruitjes",
    soort: "twee",
    thema: "ruitjes",
    beeld: "ruitjes|a=2x4|b=1x8",
    kaarten: [Z("even", "Ze zijn even groot.", "teken|t=="), Z("niet", "Ze zijn niet even groot.", "teken|t=niet"), Z("tel", "Blauw is 8 hokjes groot.", "teken|t=tel")],
    goed: twee("even", "tel"),
    vraag: ["Kijk naar de blauwe en de gele vorm.", "Wat klopt er? Kies er 2."],
  },
  {
    nr: 7,
    id: "vraag7-matten-4",
    soort: "kies",
    thema: "matten",
    beeld: "matten|a=2x2|b=1x4",
    opties: ["Ze zijn even groot.", "Mat 1 is groter.", "Mat 2 is groter."],
    goed: "Ze zijn even groot.",
    stukken: 4,
    intro: ["Kijk naar de 2 speelmatten.", "Ze zijn gemaakt van puzzelstukken."],
    vraag: ["Wat klopt?", "Zijn ze even groot?", "Is mat {1:wit} groter?", "Of is mat {2:wit} groter?"],
  },
  {
    nr: 8,
    id: "vraag8-matten-10",
    soort: "kies",
    thema: "matten",
    beeld: "matten|a=2x5|b=1x10",
    opties: ["Ze zijn even groot.", "Mat 1 is groter.", "Mat 2 is groter."],
    goed: "Ze zijn even groot.",
    stukken: 10,
    vraag: ["Weer 2 speelmatten.", "Zijn ze even groot, of is mat {1:wit} of mat {2:wit} groter?"],
  },
  { nr: 9, id: "vraag9-tafel-10", soort: "typ", thema: "tafel", beeld: "tafel|k=5|r=2|kl=groen", k: 5, r: 2, kleur: "groen", goed: "10", intro: ["Op de tafel liggen blaadjes papier.", "Ze bedekken de hele tafel."], vraag: ["Hoe groot is de tafel?", "Tik de blaadjes aan als je telt.", "Typ dan het getal."] },
  { nr: 10, id: "vraag10-tafel-9", soort: "typ", thema: "tafel", beeld: "tafel|k=3|r=3|kl=blauw", k: 3, r: 3, kleur: "blauw", goed: "9", vraag: ["Weer een tafel vol blaadjes.", "Hoe groot is de tafel?", "Tel de blaadjes en typ het getal."] },
  { nr: 11, id: "vraag11-tafel-12", soort: "typ", thema: "tafel", beeld: "tafel|k=4|r=3|kl=oranje", k: 4, r: 3, kleur: "oranje", goed: "12", vraag: ["Nog een tafel vol blaadjes.", "Hoe groot is deze tafel?", "Typ het getal."] },
  {
    nr: 12,
    id: "vraag12-muurtjes-3-5-7",
    soort: "orden",
    thema: "muurtjes",
    beeld: "",
    juist: ["3", "5", "7"],
    losse: [K("5", "muurtje|n=5", "het muurtje van 5 stenen breed"), K("7", "muurtje|n=7", "het muurtje van 7 stenen breed"), K("3", "muurtje|n=3", "het muurtje van 3 stenen breed")],
    goed: "3,5,7",
    vraag: ["Nog meer muurtjes.", "Zet ze op volgorde.", "Van smal naar breed."],
  },
];

/** Welke vragen terugkomen als het kind niets miste (de reserve van de oude les: schilderijen 1, muurtjes, het gedraaide kaartje). */
export const RESERVE = [0, 3, 4];

/** Welke vragen eigen invulling zijn (draaiboek §8): alles behalve de tafel vol blaadjes (dat is "hoeveel tegels?", §3 C). */
export const eigenInvulling = (v: Vraag) => v.soort !== "typ";

/* ---------- hulpjes ---------- */

export const naamVan = (v: Vraag, id: string) => [...(v.kaarten ?? []), ...(v.losse ?? [])].find((k) => k.id === id)?.naam ?? id;
const Hoofd = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const klein = (v: Vraag) => (v.thema === "tafels" ? "klein" : "smal");
const groot = (v: Vraag) => (v.thema === "tafels" ? "groot" : "breed");
/** "de kleinste tafel" / "het smalste muurtje" */
const kleinste = (v: Vraag) => (v.thema === "tafels" ? "de kleinste tafel" : "het smalste muurtje");
/** "de grootste tafel" / "het breedste muurtje" */
const grootste = (v: Vraag) => (v.thema === "tafels" ? "de grootste tafel" : "het breedste muurtje");
/** De stenen van een muurtje zijn rood; de getallen in de naam dus ook (2.2). Borden zijn wit. */
const metKleur = (v: Vraag, naam: string) => naam.replace(/(\d+) (stenen|borden)/, (_, n: string, w: string) => `${g(Number(n), w === "stenen" ? "rood" : "wit")} ${w}`);
export const naamK = (v: Vraag, id: string) => metKleur(v, naamVan(v, id));

/* ---------- NOOIT 2 KEER HETZELFDE (Sara, 18 november 2026; zoals de proefles Tellen) ---------- */

/**
 * Elke zin die terugkomt staat hieronder als LIJST van varianten. De les kiest er 1 met de gedeelde kiezer
 * (nooit-dubbel.ts): nooit 2 keer achter elkaar dezelfde zin, ook niet over vragen heen. "De kleinste tafel hoort
 * vooraan." en "Het smalste muurtje hoort vooraan." tellen als dezelfde zin (de wisselwoorden hieronder), net als "Je
 * typte weer 9." en "Je typte weer 11.".
 */
export const WISSEL = ["de", "het", "tafel", "tafels", "muurtje", "muurtjes", "klein", "smal", "groot", "breed", "kleinste", "smalste", "grootste", "breedste", "kleinere", "smaller", "grotere", "breder", "hoger", "langer", "borden", "stenen"];
export const nieuweKiezer = (toeval?: () => number): Kiezer => maakKiezer({ wissel: WISSEL, toeval });

/** Hoe lang een stuk tekst op het scherm is (zonder de kleurcodes). */
export const lengte = (...zinnen: string[]) => zinnen.join(" ").replace(/\{([^}:]+):[a-zA-Z]+\}/g, "$1").length;
/**
 * Een reactie moet in het vaste tekstvak passen (15.30). Zo lang waren de langste reacties van de eerste versie (die
 * pasten): eerste zin + hint 123 tekens, eerste zin + uitleg 130 tekens.
 */
export const MAX_HINT = 123;
export const MAX_UITLEG = 130;
/**
 * Alleen de varianten die met de rest van de reactie in het tekstvak passen. Dat is een HARDE eis: die haal je vooraf uit
 * de lijst, want de kiezer laat "nooit 2 keer dezelfde" voorgaan op een wens. Past er geen, dan de kortste.
 */
export const passend = (zinnen: readonly string[], max: number, ...rest: string[]): string[] => {
  const over = zinnen.filter((z) => lengte(...rest, z) <= max);
  return over.length ? over : [[...zinnen].sort((a, b) => lengte(a) - lengte(b))[0]];
};
const getallenVan = (z: string): string[] => [...(z.replace(/\{(\d+):[a-zA-Z]+\}/g, "$1").match(/\d+/g) ?? [])];
/** Een wens (geen eis): de tweede zin herhaalt geen stuk van 3 woorden en geen getal uit de eerste zin. */
const pastBij = (a: string) => (z: string) => !deeltStuk(a, z, 3) && !getallenVan(z).some((n) => getallenVan(a).includes(n));

/* ---------- vaste zinnen van het verloop (draaiboek Meten §2; eigen woorden) ---------- */

/** Het warme begin van "we doen het samen" (2e keer mis); elke soort vraag maakt de zin af. */
const samenMet = (rest: string, wij = "We") => [`Kom, w${wij.slice(1)} ${rest}`, `Weet je wat? ${wij} ${rest}`, `Geeft niks. ${wij} ${rest}`, `Ik help je even. ${wij} ${rest}`];

export const ZIN = {
  /**
   * Het begin (draaiboek §1: geen startvraag, meteen de eerste vraag). De groet en het uitlegdeel zijn 1 stuk (Sara,
   * 10 nov; BOUWREGELS 4.3, 4.4). Warm, zoals een juf begint ("Vandaag …", "We gaan samen …").
   */
  start: ["Vandaag kijken we hoe groot iets is. We tellen hoeveel tegels of hokjes het bedekt.", "We gaan samen kijken hoe groot iets is. We tellen de tegels of de hokjes."],

  /** De vraag van de oude les (3.11); niet 2 keer na elkaar precies hetzelfde (F7). */
  vraag: (v: Vraag): string[] => v.vraag,
  /** Op volgorde, de eerste keer: hoe het werkt (3.15: 1 keer per les uitleggen). */
  ordenHoe: "Sleep een plaatje naar een leeg vak. Tikken mag ook.",
  /** Kies er 2, de eerste keer: hoe het werkt (3.15). Zonder getal: "Kies er 2." staat er net voor. */
  tweeHoe: "Tik op de kaartjes.",
  /** Een nieuwe poging na de hint: de vraag in andere woorden (3.23), altijd een vraag of een opdracht (15.37). */
  opnieuw: (v: Vraag): string[] => {
    if (v.soort === "twee") return ["Welke 2 kaartjes kloppen?", "Welke 2 kaartjes kloppen, denk je?", "Kies nog een keer 2 kaartjes."].filter((z) => !v.vraag.includes(z));
    if (v.soort === "orden") return [`Leg ze nu van ${klein(v)} naar ${groot(v)}.`, `Probeer het nog eens. Leg ze van ${klein(v)} naar ${groot(v)}.`, `Zet ze nog een keer op volgorde: van ${klein(v)} naar ${groot(v)}.`];
    if (v.thema === "vellen") return ["Zijn de 2 kaartjes even groot, of niet?", "Wat denk je nu? Zijn de kaartjes even groot, of niet?"];
    if (v.thema === "matten") return ["Zijn de matten even groot, of is er 1 groter?", "Wat denk je nu? Zijn de matten even groot, of is er 1 groter?"];
    return ["Hoeveel blaadjes liggen er op de tafel?", "Hoeveel blaadjes tel je nu? Typ het getal.", "Tel de blaadjes nog een keer. Hoeveel zijn het?"];
  },
  /**
   * Op volgorde: het hulphandje wijst een leeg vak aan (nooit het goede plaatje, 15.17). De zin komt in Bliepo's tekstvak
   * terwijl de les op het kind wacht, dus hij zegt wat het kind doet (F16, Sara 18 november 2026; BOUWREGELS 15.37).
   * Eerst: "Hier komt een plaatje."
   */
  ordenHand: ["Sleep een plaatje naar dit vak.", "Sleep maar een plaatje naar dit vak."],

  /** 2e keer mis: samen voordoen (draaiboek §3 G: samen tellen; op volgorde en kiezen: eigen invulling). */
  samen: (v: Vraag): string[] =>
    v.thema === "tafel"
      ? ["Kom, we tellen samen.", "Weet je wat? We tellen ze samen.", "Geeft niks. We tellen ze samen.", "Ik help je even. We tellen ze samen.", "Laten we ze samen tellen."]
      : v.thema === "schilderij"
        ? samenMet("kijken samen naar de tegels.")
        : v.thema === "ruitjes"
          ? samenMet("tellen de hokjes samen.")
          : v.thema === "matten"
            ? samenMet("tellen de stukken samen.")
            : v.thema === "vellen"
              ? samenMet("draaien het kaartje terug.")
              : samenMet("leggen ze samen.").concat("Laten we ze samen op volgorde leggen."),
  /** Samen tellen: het kind tikt (draaiboek §3 G.1: "tik elke tegel 1 keer"). */
  samenTelTafel: ["Tik elk blaadje 1 keer aan.", "Tik op elk blaadje. Ik tel mee.", "Tik de blaadjes aan, stuk voor stuk. Ik tel mee."],
  samenTelHand: ["Tik op dit blaadje.", "Tik dit blaadje maar aan."],
  /** Bliepo zegt het getal bij elke tik (draaiboek §3 G.2). */
  telGetal: (n: number, kleur: string) => `${g(n, kleur)}.`,
  /** De schilderijen: Bliepo noemt per schilderij hoeveel tegels erachter zitten (de tegels zijn nu te zien). */
  samenSchilderij: (naam: string, n: number): string[] => [`${Hoofd(naam)} bedekt ${g(n, "geel")} tegels.`, `Achter ${naam} zitten ${g(n, "geel")} tegels.`, `${Hoofd(naam)} is ${g(n, "geel")} tegels groot.`],
  samenSchilderijSlot: (klein: string, groot: string): string[] => [`${Hoofd(klein)} bedekt de minste tegels. ${Hoofd(groot)} de meeste.`, `De minste tegels zitten achter ${klein}. De meeste achter ${groot}.`],
  samenTweeStap: ["Tik jij de 2 kaartjes aan die kloppen?", "Nu jij! Tik op de 2 kaartjes die kloppen."],
  samenTweeHand: ["Tik dit kaartje aan.", "Tik maar op dit kaartje."],
  /**
   * Ruitjes en matten: Bliepo telt de eerste vorm, het kind de tweede. Het laatste getal zegt Bliepo IN deze zin (niet
   * eerst los "8." en dan "Blauw heeft 8 hokjes.": dan klinkt het getal 2 keer achter elkaar).
   */
  samenBlauwKlaar: [`En ${g(8, "blauw")}! Zoveel hokjes heeft blauw.`, `En de laatste is ${g(8, "blauw")}. Zoveel hokjes heeft blauw.`],
  samenGeelStap: ["Tel jij de gele hokjes? Tik elk hokje aan.", "Nu jij! Tik op elk geel hokje. Ik tel mee."],
  samenGeelHand: ["Tik op dit hokje.", "Tik dit hokje maar aan."],
  samenMat1Klaar: (n: number): string[] => [`En ${g(n, "wit")}! Zoveel stukken heeft mat ${g(1, "wit")}.`, `En de laatste is ${g(n, "wit")}. Zoveel stukken heeft mat ${g(1, "wit")}.`],
  samenMat2Stap: [`Tel jij de stukken van mat ${g(2, "wit")}? Tik elk stuk aan.`, `Nu jij! Tik op elk stuk van mat ${g(2, "wit")}. Ik tel mee.`],
  samenMatHand: ["Tik op dit stuk.", "Tik dit stuk maar aan."],
  /** Het gedraaide kaartje: het kind tikt kaartje 2 en het draait terug. */
  samenVelStap: [`Tik jij op kaartje ${g(2, "oranje")}?`, `Nu jij! Tik op kaartje ${g(2, "oranje")}.`],
  samenVelHand: ["Tik hier.", "Tik maar hier."],
  /** Op volgorde: Bliepo legt ze, het kind sleept de laatste. */
  samenOrden: (v: Vraag, i: number, id: string): string[] => (i === 0 ? [`Vooraan ${naamK(v, id)}.`, `Vooraan komt ${naamK(v, id)}.`] : [`Dan ${naamK(v, id)}.`, `Daarna ${naamK(v, id)}.`, `En dan komt ${naamK(v, id)}.`]),
  samenOrdenStap: (v: Vraag, id: string): string[] => [`Sleep jij ${naamK(v, id)} naar het laatste vak?`, `Nu jij! Sleep ${naamK(v, id)} naar het laatste vak.`],
  samenOrdenHand: ["Sleep het hierheen.", "Sleep het plaatje maar hierheen."],
  /**
   * Klaar met samen voordoen; het kind deed de laatste stap (geen "Ja" van een lofzin: dat was samen, 3.4). Bij tellen
   * zegt Bliepo het laatste getal IN deze zin, 1 keer (eerst: "10." en dan "Samen geteld: de tafel is 10 blaadjes groot.").
   */
  samenKlaar: (v: Vraag): string[] => {
    if (v.thema === "tafel") {
      const n = g(v.k! * v.r!, v.kleur!);
      return [`En ${n}! Zo groot is de tafel.`, `Alles geteld! De tafel is ${n} blaadjes groot.`, `We hebben alle blaadjes geteld. De tafel is ${n} blaadjes groot.`];
    }
    if (v.thema === "schilderij") {
      const kl = v.kaarten!.find((k) => k.label === "kleinst" && v.goed.split(",").includes(k.id))!.naam;
      const gr = v.kaarten!.find((k) => k.label === "grootst")!.naam;
      return [`${Hoofd(kl)} is het kleinst, en ${gr} is het grootst.`, `Deze 2 kaartjes kloppen: ${kl} is het kleinst en ${gr} het grootst.`];
    }
    if (v.thema === "ruitjes") return [`En ${g(8, "geel")}! Net zoveel als blauw. Ze zijn dus even groot.`, `Alles geteld! Geel heeft ook ${g(8, "geel")} hokjes. Ze zijn even groot.`, `Geel heeft er ook ${g(8, "geel")}. Blauw en geel zijn dus even groot.`];
    if (v.thema === "matten") {
      const n = g(v.stukken!, "wit");
      return [`En ${n}! Net zoveel als de andere mat. De matten zijn even groot.`, `Alles geteld! Mat ${g(2, "wit")} heeft ook ${n} stukken. De matten zijn even groot.`, `Deze mat heeft er ook ${n}. De matten zijn dus even groot.`];
    }
    if (v.thema === "vellen") return ["Nu liggen ze allebei rechtop. Ze zijn even groot.", "Nu liggen ze allebei rechtop. Je ziet het: ze zijn even groot."];
    return [`Nu liggen ze van ${klein(v)} naar ${groot(v)}.`, `Zo liggen ze goed: van ${klein(v)} naar ${groot(v)}.`, `Mooi, ze liggen nu van ${klein(v)} naar ${groot(v)}.`];
  },
  /** Na het vangnet (Bliepo deed de stap zelf): geen "Ja" en geen "samen geteld" (keuring Meer-minder, 10 nov). */
  samenZelf: (v: Vraag): string[] => {
    if (v.thema === "tafel") return [`Kijk, de tafel is ${g(v.k! * v.r!, v.kleur!)} blaadjes groot.`, `Kijk, ik tel de rest. De tafel is ${g(v.k! * v.r!, v.kleur!)} blaadjes groot.`];
    if (v.thema === "schilderij") return ["Kijk, deze 2 kaartjes kloppen.", "Kijk, ik tik ze aan. Deze 2 kaartjes kloppen."];
    if (v.thema === "ruitjes") return [`Kijk, geel heeft ook ${g(8, "geel")} hokjes. Ze zijn even groot.`, `Kijk, ik tel de rest. Geel heeft ook ${g(8, "geel")} hokjes. Ze zijn even groot.`];
    if (v.thema === "matten") return [`Kijk, mat ${g(2, "wit")} heeft ook ${g(v.stukken!, "wit")} stukken. De matten zijn even groot.`, `Kijk, ik tel de rest. Deze mat heeft ook ${g(v.stukken!, "wit")} stukken. De matten zijn even groot.`];
    if (v.thema === "vellen") return ["Kijk, nu liggen ze allebei rechtop. Ze zijn even groot.", "Kijk, ik draai het terug. Nu liggen ze allebei rechtop. Ze zijn even groot."];
    return [`Kijk, nu liggen ze van ${klein(v)} naar ${groot(v)}.`, `Kijk, ik leg de laatste erbij. Nu liggen ze van ${klein(v)} naar ${groot(v)}.`];
  },
  /** 2 keer een getal vlak naast het antwoord (bijvoorbeeld 9 en dan 11): niet 2 keer "dichtbij" (keuring Meten, 10 nov; 5.10). */
  weerDichtbij: ["Je zit er weer vlak naast.", "Weer bijna!", "Ook dit getal is het net niet."],
  /** Hetzelfde antwoord 2 keer: niet 2 keer dezelfde eerste zin (geleerd bij Tellen). */
  weerGekozen: (x: string, v: Vraag): string[] =>
    v.soort === "orden"
      ? ["Je legde ze weer zo neer.", "Ze liggen weer net zo als eerst.", "Weer dezelfde volgorde, zie ik."]
      : v.soort === "twee"
        ? ["Je koos weer dezelfde 2 kaartjes.", "Je tikte weer op dezelfde 2 kaartjes.", "Weer dezelfde 2 kaartjes, zie ik."]
        : v.soort === "typ"
          ? [`Je typte weer ${g(Number(x), "wit")}.`, `Je kwam weer op ${g(Number(x), "wit")}.`, `Weer ${g(Number(x), "wit")}, zie ik.`]
          : ["Je koos weer hetzelfde antwoord.", "Je tikte weer op hetzelfde antwoord.", "Weer hetzelfde antwoord, zie ik."],
  /** Na goed bij typen: het getal naast de tafel, in de kleur van de blaadjes (draaiboek §3 C.4: "14 tegels"). */
  label: (n: number) => `${n} blaadjes`,

  /** De vragen die terugkomen (de oude les: eerst wat niet meteen goed was, aangevuld met vaste vragen). */
  terug1: [`We doen nog ${g(1, "wit")} vraag van net.`, `Nog ${g(1, "wit")} vraag van net. Die oefenen we nog even.`],
  terugN: (n: number): string[] => [`We doen nog ${n} vragen van net.`, `Nog ${n} vragen van net. Die oefenen we nog even.`],
  extra1: [`Nog ${g(1, "wit")} vraag om te oefenen.`, `We oefenen nog ${g(1, "wit")} vraag.`],
  extraN: (n: number): string[] => [`Nog ${n} vragen om te oefenen.`, `We oefenen nog ${n} vragen.`],
  terugLastig: ["Deze vragen oefenen we een andere keer nog eens.", "Dit oefenen we een andere keer nog eens. Dat komt goed."],
  /** Einde. */
  slot: ["Je weet nu hoe je kunt zien hoe groot iets is.", "Je hebt goed gewerkt vandaag! Je kunt nu tellen hoe groot iets is.", "Mooi gewerkt! Je ziet nu hoe groot iets is als je telt."],
  kaartTik: ["Tik op de kaart.", "Tik maar op de kaart.", "Kijk, een kaart voor jou! Tik erop."],
};

/** Aanmoediging bij het hulphandje (het kind moet slepen of tikken, niet nadenken; 14.35, geleerd bij Tellen). Dezelfde 5 als bij Tellen. */
export const AANMOEDIG_TIKKEN = ["Je bent goed bezig.", "Jij kunt dit.", "Het gaat goed zo.", "Probeer het maar.", "Toe maar, je doet het goed."];

/**
 * Reactie na de lof (BLIEPO-KARAKTER.md §4 Meten, eigen zinnen per vraag). Index 0 en 1 beginnen met "Ja", 2 en 3 niet,
 * 4 is de robotzin (hooguit 1 keer per les), 5 en 6 zijn erbij gekomen op 18 november 2026 (zoals bij Plussommen).
 */
export function metenReactie(v: Vraag): Rijtje {
  if (v.thema === "schilderij") {
    const [kl, gr] = [v.kaarten!.find((k) => k.label === "kleinst" && v.goed.split(",").includes(k.id))!, v.kaarten!.find((k) => k.label === "grootst")!];
    return rij(
      [`Ja, ${kl.naam} bedekt de minste tegels.`, `Ja, ${gr.naam} bedekt de meeste tegels.`, `${Hoofd(kl.naam)} is het kleinst, ${gr.naam} het grootst.`, `${Hoofd(gr.naam)} bedekt de meeste tegels.`, `Zie je, ${gr.naam} is groter dan ${kl.naam}.`, `Precies, ${kl.naam} bedekt de minste tegels.`, `Dat klopt, ${gr.naam} is het grootst.`],
      [4],
    );
  }
  if (v.thema === "ruitjes") return rij([`Ja, ze zijn allebei ${g(8, "wit")} hokjes groot.`, "Ja, een andere vorm, maar even groot.", `Allebei ${g(8, "wit")} hokjes.`, "Een andere vorm, maar even groot.", "Zie je, de ene vorm is niet groter dan de andere.", `Precies, blauw en geel hebben allebei ${g(8, "wit")} hokjes.`, "Dat klopt, de vormen zijn even groot."], [4]);
  if (v.thema === "tafels") return rij(["Ja, van klein naar groot.", "Ja, de tafels worden steeds groter.", "Op de grootste tafel is nog plek over.", "De tafels worden steeds groter.", "Zie je, elke tafel is groter dan de vorige.", "Precies, de kleinste tafel ligt vooraan.", "Dat klopt, zo liggen ze van klein naar groot."], [4]);
  if (v.thema === "muurtjes") return rij(["Ja, van smal naar breed.", "Ja, elk muurtje is breder dan het vorige.", "Elk muurtje is breder dan het vorige.", "Van smal naar breed.", "Zie je, het breedste muurtje ligt achteraan.", "Precies, het smalste muurtje ligt vooraan.", "Dat klopt, zo liggen ze van smal naar breed."], [4]);
  if (v.thema === "vellen") return rij(["Ja, ze zijn allebei even groot.", "Ja, draaien maakt het kaartje niet groter.", `Kaartje ${g(2, "oranje")} is alleen gedraaid.`, "Draaien maakt het kaartje niet groter.", "Zie je, het kaartje is niet groter of kleiner geworden.", "Precies, het kaartje is alleen gedraaid.", "Dat klopt, de kaartjes zijn even groot."], [4]);
  if (v.thema === "matten") {
    const n = g(v.stukken!, "wit");
    return rij([`Ja, allebei ${n} stukken.`, "Ja, ze zijn even groot.", `Allebei ${n} stukken.`, "Ze zien er anders uit, maar ze zijn even groot.", "Zie je, geen mat is groter dan de andere.", `Precies, elke mat heeft ${n} stukken.`, "Dat klopt, de matten zijn even groot."], [4]);
  }
  const n = g(v.k! * v.r!, v.kleur!);
  return rij([`Ja, de tafel is ${n} blaadjes groot.`, `Ja, je telde ze allemaal: ${n}.`, `De tafel is ${n} blaadjes groot.`, `Je telde ${n} blaadjes.`, "Zie je, je hebt geen blaadje overgeslagen.", `Precies, het zijn ${n} blaadjes.`, `Dat klopt, er liggen ${n} blaadjes op de tafel.`], [4]);
}
export const REACTIE_JA = [0, 1];
export const REACTIE_ROBOT = 4;
/** "Dat heb je goed gezien" alleen bij kijkvragen: kiezen en kies er 2 (niet bij tellen en op volgorde leggen). */
export const isKijkvraag = (v: Vraag) => v.soort === "twee" || v.soort === "kies";

/* ---------- denkfouten (draaiboek Meten §7, plus eigen namen voor de Squla-vragen) ---------- */

export const DENKFOUTEN = [
  "een-rij-geteld",
  "rij-gemist",
  "een-ernaast",
  "rij-en-rijen-opgeteld",
  "twee-keer-kleinst",
  "verkeerde-kleinste",
  "even-en-niet-samen",
  "vorm-verandert-grootte",
  "draaien-verandert-grootte",
  "lang-lijkt-groter",
  "hoog-lijkt-groter",
  "volgorde-omgedraaid",
  "kleinste-niet-vooraan",
  "kleiner-erna",
  "overgeslagen",
  "plek-over-niet-gezien",
  "onduidelijk",
] as const;
export type Denkfoutnaam = (typeof DENKFOUTEN)[number];

/** Wat het rode rondje bij de hint aanwijst (alleen wat Bliepo noemt, nooit het antwoord; 7.8, 15.17). */
export type Licht = { soort: "rij"; rij: number } | { soort: "mat"; mat: 1 | 2 } | { soort: "vel" } | { soort: "vak"; i: number } | null;

/** De varianten van 1 rij uit de fouttabel (18 november 2026). De les kiest er steeds 1; het script keurt ze ALLEMAAL. */
export type Varianten = {
  /** Bliepo's eerste zin: wat het kind koos of deed (leeg bij "onduidelijk": dan een zin uit BLIEPO-KARAKTER.md §10). */
  eerste: string[];
  hint: string[];
  /** Uitleg bij de 2e keer (daarna meteen samen voordoen; dan mag het antwoord in beeld, 15.11). Uitleg, geen opdracht. */
  uitleg: string[];
  /** Dezelfde denkfout 2 keer (en de 1e keer zei Bliepo al wat er mis was): "weer …" en een andere uitleg. */
  weerEerste: string[];
  weerUitleg: string[];
};

export type Fout = {
  code: Denkfoutnaam;
  /** Welke uitleg bij de 2e fout hoort (dezelfde soort 2 keer = "weer"). */
  soort: string;
  denkfout: string;
  /** Alle varianten; `eerste`, `hint`, `uitleg` en `weer` hieronder zijn steeds de eerste variant (voor de tabel). */
  v: Varianten;
  eerste: string;
  hint: string;
  uitleg: string;
  weer: string[];
  licht: Licht;
  /** Bij de schilderijen: de tegels achter de schilderijen worden zichtbaar (de hint in beeld). */
  zien?: boolean;
  scherm: string;
  /** Welke antwoorden de eerste zin en de hint nog toelaten (verklapcontrole van het script, 15.17). Leeg = niet uit te rekenen (typen, op volgorde). */
  over: string[];
  /** Eigen invulling, niet van Synthesis (15.22 punt 5). */
  eigen: boolean;
  /** Waar Synthesis deze reactie heeft (draaiboek). */
  bron: string;
  /** Waarom er na de eerste zin maar 1 keuze over is (alleen bij 2 keuzes). */
  noot?: string;
};

/** Varianten → de velden van een rij (de eerste variant is de vaste zin in de tabel). */
const metV = (v: Partial<Varianten> & Pick<Varianten, "eerste" | "hint" | "uitleg">) => {
  const vol: Varianten = { weerEerste: [], weerUitleg: [], ...v };
  return { v: vol, eerste: vol.eerste[0] ?? "", hint: vol.hint[0], uitleg: vol.uitleg[0], weer: vol.weerEerste.length ? [vol.weerEerste[0], vol.weerUitleg[0]] : [] };
};

const SCHERM_KIES = "Bliepo's scherm 1,5 s rood (geen fout-geluidje); de knoppen weg; een rood rondje om wat Bliepo noemt (nooit om het antwoord); dan de vraag in andere woorden en dezelfde keuzes terug (geen pijl)";
const SCHERM_TWEE = "Bliepo's scherm 1,5 s rood (geen fout-geluidje); de vinkjes gaan weg; de tegels achter de schilderijen worden zichtbaar (gestippeld); dan de vraag in andere woorden";
const SCHERM_RUITJES = "Bliepo's scherm 1,5 s rood (geen fout-geluidje); de vinkjes gaan weg; dan de vraag in andere woorden";
const SCHERM_ORDEN = "Bliepo's scherm 1,5 s rood (geen fout-geluidje); de plaatjes blijven even liggen, met een rood rondje om het vak dat Bliepo noemt (nooit om het antwoord); daarna glijden ze allemaal terug (geen schudden, geen rood) en komt de opdracht opnieuw";
const SCHERM_TYP = "Bliepo's scherm 1,5 s rood (geen fout-geluidje); het invulvak wordt leeg; de blaadjes die het kind aantikte houden hun nummer (draaiboek §3 C.3); dan de vraag in andere woorden";

/* --- kies er 2 (schilderijen, ruitjes): eigen invulling --- */

/** Alle paren van 2 kaartjes (op naam gesorteerd). */
export function paren(v: Vraag): string[] {
  const ids = v.kaarten!.map((k) => k.id);
  const uit: string[] = [];
  for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) uit.push(twee(ids[i], ids[j]));
  return uit;
}
const deelt = (a: string, b: string) => a.split(",").filter((x) => b.split(",").includes(x)).length;

/** "1 van je 2 kaartjes klopt": Bliepo zegt niet welke (anders blijft er maar 1 paar over, 15.17). */
const EEN_KLOPT = [`${g(1, "wit")} van je ${g(2, "wit")} kaartjes klopt.`, `${g(1, "wit")} kaartje klopt al. Het andere nog niet.`, `Bijna! ${g(1, "wit")} van de ${g(2, "wit")} klopt al.`];

function tweeFout(x: string, v: Vraag): Fout {
  const andere = paren(v).filter((p) => p !== x);
  const ids = x.split(",");
  if (v.thema === "schilderij") {
    const labels = ids.map((id) => v.kaarten!.find((k) => k.id === id)!.label);
    if (labels.every((l) => l === "kleinst"))
      return {
        code: "twee-keer-kleinst",
        soort: "twee-kleinst",
        denkfout: "koos 2 keer 'het kleinst' (er kan maar 1 schilderij het kleinst zijn)",
        ...metV({
          eerste: ["Je koos 2 keer 'het kleinst'.", "Op allebei je kaartjes staat 'kleinst'.", "Je tikte 2 kaartjes aan met 'kleinst'."],
          hint: ["Maar 1 schilderij kan het kleinst zijn. Kijk hoeveel tegels elk schilderij bedekt.", "Er is maar 1 kleinste schilderij. Kijk welk schilderij de minste tegels bedekt.", "Dat kan niet allebei. Tel de tegels achter elk schilderij."],
          uitleg: ["Er is maar 1 kleinste schilderij: dat bedekt de minste tegels.", "Maar 1 schilderij kan het kleinst zijn. Dat bedekt de minste tegels.", "Het kleinste schilderij bedekt de minste tegels. Dat is er maar 1."],
          weerEerste: ["Je koos weer 2 keer 'het kleinst'.", "Weer 2 keer 'kleinst', zie ik."],
          weerUitleg: ["Maar 1 schilderij bedekt de minste tegels.", "Er kan er maar 1 het kleinst zijn."],
        }),
        licht: null,
        zien: true,
        scherm: SCHERM_TWEE,
        over: andere.filter((p) => p.split(",").filter((id) => v.kaarten!.find((k) => k.id === id)!.label === "kleinst").length < 2),
        eigen: true,
        bron: "eigen invulling (draaiboek §8: kies er 2 zit niet in Cover It Up); het tellen van de tegels die het bedekt komt uit §3 C en F",
      };
    return {
      code: "verkeerde-kleinste",
      soort: "verkeerde-kleinste",
      denkfout: `koos het verkeerde schilderij als het kleinste (${naamVan(v, ids.find((id) => !v.goed.split(",").includes(id))!)})`,
      ...metV({
        eerste: EEN_KLOPT,
        /* De hint zegt alleen HOE je het ziet (de tegels), niet welk kaartje niet klopt (15.17). */
        hint: ["Kijk hoeveel tegels elk schilderij bedekt. Hoe minder tegels, hoe kleiner.", "Tel de tegels achter elk schilderij. Veel tegels is groot, weinig tegels is klein.", "Kijk goed naar de tegels achter de schilderijen. Tel ze maar."],
        uitleg: ["Het kleinste schilderij bedekt de minste tegels.", "Hoe minder tegels een schilderij bedekt, hoe kleiner het is.", "Het schilderij met de minste tegels is het kleinst."],
        weerEerste: ["Je koos weer een schilderij dat niet het kleinst is.", "Weer een schilderij dat niet het kleinst is, zie ik."],
        weerUitleg: ["Het kleinste bedekt de minste tegels.", "Aan de tegels zie je welk schilderij het kleinst is."],
      }),
      licht: null,
      zien: true,
      scherm: SCHERM_TWEE,
      over: andere.filter((p) => deelt(p, x) === 1),
      eigen: true,
      bron: "eigen invulling (draaiboek §8); \"1 van je 2 klopt\" noemt niet welke (anders blijft er maar 1 paar over, 15.17)",
    };
  }
  /* ruitjes */
  if (ids.includes("even") && ids.includes("niet"))
    return {
      code: "even-en-niet-samen",
      soort: "even-en-niet",
      denkfout: "koos 'even groot' én 'niet even groot' (die kunnen niet allebei kloppen)",
      ...metV({
        eerste: ["Je koos 'even groot' én 'niet even groot'.", "Op je kaartjes staat 'even groot' én 'niet even groot'.", "Je tikte op 'even groot' én op 'niet even groot'."],
        hint: [`Die ${g(2, "wit")} kunnen niet allebei kloppen. Tel de blauwe en de gele hokjes.`, "Dat kan niet allebei waar zijn. Tel de hokjes van blauw en van geel.", "Ze zijn even groot, of niet. Allebei kan niet. Tel de hokjes."],
        uitleg: ["Even groot en niet even groot kan niet allebei waar zijn.", "Iets is even groot, of niet even groot. Allebei kan niet.", `Maar ${g(1, "wit")} van die ${g(2, "wit")} kaartjes kan kloppen.`],
        weerEerste: ["Je koos weer allebei.", "Weer allebei, zie ik."],
        weerUitleg: [`Die ${g(2, "wit")} kaartjes zeggen iets anders. Er kan er maar ${g(1, "wit")} kloppen.`, "Even groot of niet even groot: allebei kan niet."],
      }),
      licht: null,
      scherm: SCHERM_RUITJES,
      over: andere.filter((p) => !(p.includes("even") && p.includes("niet"))),
      eigen: true,
      bron: "eigen invulling (draaiboek §8)",
    };
  return {
    code: "vorm-verandert-grootte",
    soort: "vorm",
    denkfout: "denkt dat de lange gele vorm een andere grootte heeft (koos 'niet even groot')",
    ...metV({
      eerste: EEN_KLOPT,
      hint: ["Tel de blauwe hokjes en de gele hokjes.", "Tel de hokjes van allebei de vormen.", "Hoeveel hokjes heeft blauw? En hoeveel heeft geel?"],
      uitleg: ["Een andere vorm kan toch even groot zijn. Het gaat om hoeveel hokjes het zijn.", "De vormen zien er anders uit. Maar het gaat om de hokjes.", "Lang of breed maakt niet uit. Het gaat om hoeveel hokjes het zijn."],
      weerEerste: ["Je koos weer 'niet even groot'.", "Weer 'niet even groot', zie ik."],
      weerUitleg: ["De vorm is anders, maar de hokjes zeggen hoe groot hij is.", "Aan de hokjes zie je hoe groot een vorm is."],
    }),
    licht: null,
    scherm: SCHERM_RUITJES,
    over: andere.filter((p) => deelt(p, x) === 1),
    eigen: false,
    bron: "draaiboek §7 `vorm-verandert-grootte` (trap: andere vorm, zelfde oppervlakte); de zin \"1 van je 2 klopt\" is eigen invulling",
  };
}

/* --- op volgorde (tafels, muurtjes): eigen invulling --- */

/** Alle volgordes die een kind kan leggen. */
export function volgordes(v: Vraag): string[] {
  const uit: string[] = [];
  const perm = (rest: string[], pad: string[]) => {
    if (!rest.length) uit.push(pad.join(","));
    rest.forEach((n, i) => perm([...rest.slice(0, i), ...rest.slice(i + 1)], [...pad, n]));
  };
  perm(v.juist!, []);
  return uit;
}

function ordenFout(x: string, v: Vraag): Fout {
  const xs = x.split(",");
  const juist = v.juist!;
  const p = xs.findIndex((id, i) => id !== juist[i]);
  const m = (id: string) => MAAT[id];
  const t = v.thema === "tafels";
  const basis = { scherm: SCHERM_ORDEN, over: [] as string[], eigen: true, bron: "eigen invulling (draaiboek §8: op volgorde zetten zit niet in Cover It Up)" };
  if (xs.every((id, i) => i === 0 || m(xs[i - 1]) > m(id)))
    return {
      ...basis,
      code: "volgorde-omgedraaid",
      soort: "omgedraaid",
      denkfout: `legde ze van ${groot(v)} naar ${klein(v)}`,
      ...metV({
        eerste: [`Je legde ze van ${groot(v)} naar ${klein(v)}.`, `Ze liggen nu van ${groot(v)} naar ${klein(v)}.`, `Je begon met ${grootste(v)}.`],
        hint: [`Van ${klein(v)} naar ${groot(v)}: ${kleinste(v)} komt vooraan.`, `Draai het om: ${kleinste(v)} komt vooraan.`, `We beginnen juist met ${kleinste(v)}.`],
        uitleg: [`${Hoofd(kleinste(v))} hoort vooraan, ${t ? "de grootste" : "het breedste"} achteraan.`, `Vooraan hoort ${kleinste(v)}. Achteraan ${t ? "de grootste" : "het breedste"}.`],
        weerEerste: [`Je legde ze weer van ${groot(v)} naar ${klein(v)}.`, `Weer van ${groot(v)} naar ${klein(v)}, zie ik.`],
        weerUitleg: [`${Hoofd(kleinste(v))} hoort vooraan.`, `We beginnen met ${kleinste(v)}.`],
      }),
      licht: { soort: "vak", i: 0 },
    };
  if (t && x === "a,b,d,c")
    return {
      ...basis,
      code: "plek-over-niet-gezien",
      soort: "plek-over",
      denkfout: "zag niet dat op de tafel met plek over meer borden passen (c en d hebben allebei 6 borden)",
      ...metV({
        eerste: [`Op ${g(2, "wit")} tafels staan ${g(6, "wit")} borden.`, `Er zijn ${g(2, "wit")} tafels met ${g(6, "wit")} borden.`, `${g(2, "wit")} tafels hebben allebei ${g(6, "wit")} borden.`],
        hint: ["Kijk ook hoeveel borden er op een tafel passen.", "Kijk ook naar de lege plekken op een tafel.", "Hoeveel borden passen er op elke tafel?"],
        uitleg: ["Op de tafel met plek over passen nog meer borden. Die tafel is dus het grootst.", "Een tafel met lege plekken is groter: er passen meer borden op."],
        weerEerste: ["Je legde ze weer zo neer.", "Weer dezelfde volgorde, zie ik."],
        weerUitleg: ["Op de tafel met plek over passen meer borden.", "De tafel met lege plekken is het grootst."],
      }),
      licht: null,
    };
  if (p === 0)
    return {
      ...basis,
      code: "kleinste-niet-vooraan",
      soort: "vooraan",
      denkfout: `legde vooraan niet ${kleinste(v)} (${naamVan(v, xs[0])})`,
      ...metV({
        eerste: [`Vooraan ligt nog niet ${kleinste(v)}.`, `${Hoofd(kleinste(v))} ligt nog niet vooraan.`, `Je begon niet met ${kleinste(v)}.`],
        hint: t
          ? ["Begin met de tafel waar de minste borden op passen.", "Welke tafel is het kleinst? Die komt vooraan.", "Zoek eerst de tafel waar de minste borden op passen."]
          : ["Begin met het muurtje met de minste stenen naast elkaar.", "Welk muurtje is het smalst? Dat komt vooraan.", "Zoek eerst het muurtje met de minste stenen naast elkaar."],
        uitleg: [`${Hoofd(kleinste(v))} hoort vooraan.`, `Vooraan hoort ${kleinste(v)}.`],
        weerEerste: [`Vooraan lag weer niet ${kleinste(v)}.`, `${Hoofd(kleinste(v))} lag weer niet vooraan.`],
        weerUitleg: t ? ["Op de kleinste tafel passen de minste borden.", "De tafel waar de minste borden op passen, is het kleinst."] : ["Het smalste muurtje heeft de minste stenen naast elkaar.", "Het muurtje met de minste stenen naast elkaar is het smalst."],
      }),
      licht: { soort: "vak", i: 0 },
    };
  if (m(xs[p]) < m(xs[p - 1])) {
    const kleiner = t ? "een kleinere tafel" : "een smaller muurtje";
    return {
      ...basis,
      code: "kleiner-erna",
      soort: "kleiner-erna",
      denkfout: `legde na ${naamVan(v, xs[p - 1])} ${kleiner}`,
      ...metV({
        eerste: [`Na ${naamK(v, xs[p - 1])} legde je ${kleiner}.`, `Achter ${naamK(v, xs[p - 1])} ligt ${kleiner}.`, `Na ${naamK(v, xs[p - 1])} komt nu ${kleiner}.`],
        hint: t ? ["Elke tafel is groter dan de tafel ervoor.", "De tafels worden steeds groter. Nooit kleiner.", "Na een tafel komt altijd een grotere tafel."] : ["Elk muurtje is breder dan het muurtje ervoor.", "De muurtjes worden steeds breder. Nooit smaller.", "Na een muurtje komt altijd een breder muurtje."],
        uitleg: t ? ["Van klein naar groot: elke tafel is groter dan de tafel ervoor.", "De tafels worden steeds groter, van voor naar achter."] : ["Van smal naar breed: elk muurtje is breder dan het muurtje ervoor.", "De muurtjes worden steeds breder, van voor naar achter."],
        weerEerste: [`Je legde weer ${kleiner} erachter.`, `Weer ${kleiner} erachter, zie ik.`],
        weerUitleg: t ? ["Elke volgende tafel is groter.", "Steeds komt er een grotere tafel achter."] : ["Elk volgend muurtje is breder.", "Steeds komt er een breder muurtje achter."],
      }),
      licht: { soort: "vak", i: p },
    };
  }
  return {
    ...basis,
    code: "overgeslagen",
    soort: "overgeslagen",
    denkfout: `sloeg na ${naamVan(v, xs[p - 1])} ${t ? "een tafel" : "een muurtje"} over (${naamVan(v, xs[p])})`,
    ...metV({
      eerste: [`Na ${naamK(v, xs[p - 1])} legde je ${naamK(v, xs[p])}.`, `Achter ${naamK(v, xs[p - 1])} ligt ${naamK(v, xs[p])}.`, `Na ${naamK(v, xs[p - 1])} komt nu ${naamK(v, xs[p])}.`],
      /* Een hint over HOE je zoekt; niet "er hoort er nog 1 tussen" (bij 3 muurtjes is dat het antwoord, 15.17). */
      hint: t ? ["Zoek steeds de kleinste tafel die nog over is.", "Zoek steeds de kleinste die nog over is.", "Pak steeds de kleinste tafel die er nog ligt."] : ["Zoek steeds het smalste muurtje dat nog over is.", "Zoek steeds het smalste dat nog over is.", "Pak steeds het smalste muurtje dat er nog ligt."],
      uitleg: t ? ["Na elke tafel komt de tafel die net iets groter is.", "Steeds komt de tafel die net iets groter is."] : ["Na elk muurtje komt het muurtje dat net iets breder is.", "Steeds komt het muurtje dat net iets breder is."],
      weerEerste: [`Je sloeg weer ${t ? "een tafel" : "een muurtje"} over.`, `Weer ${t ? "een tafel" : "een muurtje"} overgeslagen, zie ik.`],
      weerUitleg: t ? ["Na elke tafel komt de tafel die net iets groter is.", "Elke tafel krijgt een plek, van klein naar groot."] : ["Na elk muurtje komt het muurtje dat net iets breder is.", "Elk muurtje krijgt een plek, van smal naar breed."],
    }),
    licht: { soort: "vak", i: p },
  };
}

/* --- kiezen bij Bliepo (het gedraaide kaartje, speelmatten) --- */

function kiesFout(x: string, v: Vraag): Fout {
  const andere = v.opties!.filter((o) => o !== x);
  if (v.thema === "vellen")
    return {
      code: "draaien-verandert-grootte",
      soort: "draaien",
      denkfout: "denkt dat een gedraaid kaartje een andere grootte heeft",
      ...metV({
        eerste: [`Kaartje ${g(2, "oranje")} ligt op zijn kant. Daardoor lijkt het anders.`, `Kaartje ${g(2, "oranje")} is gedraaid. Dan lijkt het anders.`, `Het lijkt anders, want kaartje ${g(2, "oranje")} ligt op zijn kant.`],
        hint: ["Maar draaien maakt iets niet groter of kleiner.", "Wordt een kaartje groter als je het draait?", "Draai het in je hoofd maar eens terug."],
        uitleg: ["Een kaartje wordt niet groter of kleiner als je het draait.", "Draaien verandert niet hoe groot een kaartje is."],
        weerEerste: ["Je koos weer 'niet even groot'.", "Weer 'niet even groot', zie ik."],
        weerUitleg: ["Gedraaid is het kaartje nog net zo groot.", "Een gedraaid kaartje blijft even groot."],
      }),
      licht: { soort: "vel" },
      scherm: SCHERM_KIES,
      over: andere,
      eigen: false,
      bron: "draaiboek §7 `vorm-verandert-grootte` (een andere stand of vorm verandert de grootte niet); de zinnen zijn eigen invulling",
      noot: "2 keuzes: na 1 fout blijft er altijd 1 over; Bliepo noemt de regel van de oude les, niet het antwoord",
    };
  if (x === "Mat 1 is groter." || x === "Mat 2 is groter.") {
    const een = x === "Mat 1 is groter.";
    const nr = g(een ? 1 : 2, "wit");
    const hoger = een ? "hoger" : "langer";
    return {
      code: een ? "hoog-lijkt-groter" : "lang-lijkt-groter",
      soort: een ? "mat1" : "mat2",
      denkfout: een ? "vindt de hogere mat groter (2 rijen tegen 1), zonder de stukken te tellen" : "vindt de langere mat groter, zonder de stukken te tellen",
      ...metV({
        eerste: [`Mat ${nr} is ${hoger}. Dan lijkt hij groter.`, `Mat ${nr} lijkt groter, want hij is ${hoger}.`, `Je koos mat ${nr}. Die is ${hoger}, dus hij lijkt groter.`],
        hint: ["Tel de stukken van allebei de matten.", "Tel hoeveel stukken elke mat heeft.", "Hoeveel stukken heeft elke mat? Tel ze maar."],
        uitleg: [`Een mat is niet groter omdat hij ${hoger} is. Het gaat om de stukken.`, `${Hoofd(hoger)} is niet altijd groter. Het gaat om hoeveel stukken het zijn.`],
        weerEerste: [`Je koos weer mat ${nr}.`, `Weer mat ${nr}, zie ik.`],
        weerUitleg: ["Aan de stukken zie je hoe groot een mat is.", `Het gaat om de stukken, niet om hoe ${een ? "hoog" : "lang"} de mat is.`],
      }),
      licht: { soort: "mat", mat: een ? 1 : 2 },
      scherm: SCHERM_KIES,
      over: andere,
      eigen: false,
      bron: een ? "draaiboek §7 `groot-vierkant-lijkt-groter` (kiest de vorm die er dik uitziet; gezien bij de gok, R2)" : "draaiboek §7 `lang-lijkt-groter` (gezien: gok R1, R3 en vergelijken R1)",
    };
  }
  return onduidelijk(v, andere);
}

/* --- typen: hoeveel blaadjes? (draaiboek §3 C, gezien bij Synthesis) --- */

/** De meest voorkomende foute getallen bij een tafel (fouttabel); elk ander getal valt onder `typFout` (algemeen). */
export function typGetallen(v: Vraag): number[] {
  const n = v.k! * v.r!;
  return [...new Set([v.k!, n - v.k!, n - 1, n + 1, v.k! + v.r!])].filter((x) => x !== n && x >= 0).sort((a, b) => a - b);
}

/** De fout bij elk getal dat een kind kan typen (0 tot 99). Twee denkfouten bij hetzelfde getal = niet duidelijk (15.9). */
export function typFout(x: number, v: Vraag): Fout {
  const k = v.k!;
  const r = v.r!;
  const n = k * r;
  const kl = v.kleur!;
  const X = g(x, "wit");
  const passen: Denkfoutnaam[] = [];
  if (x === k) passen.push("een-rij-geteld");
  if (x === n - k && r > 2) passen.push("rij-gemist");
  if (Math.abs(x - n) === 1) passen.push("een-ernaast");
  if (x === k + r) passen.push("rij-en-rijen-opgeteld");
  const code = passen.length === 1 ? passen[0] : "onduidelijk";
  const basis = { scherm: SCHERM_TYP, over: [] as string[], eigen: false };
  if (code === "een-rij-geteld")
    return {
      ...basis,
      code,
      soort: "een-rij",
      denkfout: `telde alleen de bovenste rij (${x} van de ${n})`,
      ...metV({
        eerste: [`${g(k, kl)} is de bovenste rij.`, `Je typte ${g(k, kl)}. Dat is de bovenste rij.`, `${g(k, kl)}? Zoveel blaadjes liggen er in de bovenste rij.`],
        /* Bij 2 rijen ligt er maar 1 rij onder: dan geen meervoud (keuring Meten, 10 nov: wat Bliepo zegt is waar voor déze tafel). */
        hint: [r === 2 ? "Er ligt nog een rij onder. Tel die ook mee." : "Er liggen nog meer rijen onder. Tel ze allemaal mee.", "Onder de bovenste rij liggen nog meer blaadjes. Tel ze ook.", r === 2 ? "De rij eronder hoort er ook bij. Tel alle blaadjes." : "De rijen eronder horen er ook bij. Tel alle blaadjes."],
        uitleg: [r === 2 ? "De rij eronder telt ook mee." : "De rijen eronder tellen ook mee.", "Alle rijen horen erbij, niet alleen de bovenste.", "Onder de bovenste rij liggen ook blaadjes. Die horen erbij."],
        weerEerste: ["Je telde weer alleen de bovenste rij.", "Weer alleen de bovenste rij, zie ik."],
        weerUitleg: [r === 2 ? "De rij eronder hoort er ook bij." : "De rijen eronder horen er ook bij.", "Elke rij telt mee, ook de onderste."],
      }),
      licht: { soort: "rij", rij: 0 },
      bron: "draaiboek §3 C.3 en §7 `een-rij-geteld` (\"dat is de bovenste rij; er liggen meer rijen onder\")",
    };
  if (code === "rij-gemist")
    return {
      ...basis,
      code,
      soort: "rij-gemist",
      denkfout: `sloeg een hele rij over (${x} van de ${n})`,
      ...metV({
        eerste: ["Dan heb je een rij overgeslagen.", `Je typte ${X}. Dan mis je nog een hele rij.`, `${X}? Dan heb je een rij overgeslagen.`],
        hint: ["Tel rij voor rij. Tik elk blaadje aan als je telt.", "Tel elke rij. Tik de blaadjes aan, dan zie je wat je al telde.", "Probeer het nog eens. Tel alle rijen, van boven naar beneden."],
        uitleg: ["Elke rij telt mee.", "Alle rijen horen erbij.", "We slaan geen rij over."],
        weerEerste: ["Je sloeg weer een rij over.", "Weer een rij overgeslagen, zie ik."],
        weerUitleg: ["Elke rij telt mee.", "Alle rijen horen erbij, van boven tot onder."],
      }),
      licht: null,
      bron: "draaiboek §3 C.3 en §7 `rij-gemist` (\"dan mis je een hele rij\")",
    };
  if (code === "een-ernaast")
    return {
      ...basis,
      code,
      soort: "ernaast",
      denkfout: `telde er 1 te veel of 1 te weinig (${x} voor ${n})`,
      ...metV({
        eerste: ["Dat is dichtbij.", "Je zit er vlak naast.", "Bijna goed geteld.", `Je typte ${X}. Je zit er dichtbij.`, `Bijna! ${X} is het net niet.`, `${X}? Dat is heel dichtbij.`],
        hint: [`Tik elk blaadje ${g(1, "wit")} keer aan als je telt.`, `Geef elk blaadje ${g(1, "wit")} tik. Dan tel je niets ${g(2, "wit")} keer en sla je niets over.`, "Probeer het nog eens. Tel rustig, stuk voor stuk."],
        uitleg: [`Elk blaadje telt precies ${g(1, "wit")} keer mee.`, `Elk blaadje hoort er ${g(1, "wit")} keer bij.`, `Elk blaadje krijgt precies ${g(1, "wit")} getal.`],
      }),
      licht: null,
      bron: "draaiboek §3 C.3 en §7 `een-te-veel` (\"tik elke tegel maar 1 keer\"); de richting (te veel of te weinig) zegt Bliepo niet, want dan is het antwoord verklapt (15.17)",
      noot: "geen richting genoemd: \"1 te veel\" zou het antwoord verklappen",
    };
  if (code === "rij-en-rijen-opgeteld")
    return {
      ...basis,
      code,
      soort: "rij-en-rijen",
      denkfout: `deed de blaadjes van 1 rij en het aantal rijen bij elkaar (${k} en ${r})`,
      ...metV({
        eerste: [`Je deed ${g(k, kl)} en ${g(r, "wit")} bij elkaar.`, `Je telde ${g(k, kl)} en ${g(r, "wit")} bij elkaar op.`],
        hint: ["Tel niet de rijen, maar alle blaadjes.", "We tellen geen rijen. Tel alle blaadjes, stuk voor stuk.", "Tel elk blaadje. De rijen zelf tel je niet mee."],
        uitleg: ["We tellen de blaadjes, niet de rijen.", "Het gaat om de blaadjes. De rijen tellen we niet."],
        weerEerste: ["Je deed weer de rijen erbij.", "Weer de rijen erbij, zie ik."],
        weerUitleg: ["Alleen de blaadjes tellen mee.", "We tellen alleen blaadjes."],
      }),
      licht: null,
      bron: "de oude les (Squla-reactie \"je hebt … en … bij elkaar gedaan\"); niet gezien bij Synthesis",
      eigen: true,
    };
  return onduidelijk(v, []);
}

/** Niet duidelijk: een eerste zin uit BLIEPO-KARAKTER.md §10 en een algemene hint (geen verzonnen reden). */
function onduidelijk(v: Vraag, over: string[]): Fout {
  return {
    code: "onduidelijk",
    soort: "onduidelijk",
    denkfout: "niet duidelijk (geen reden verzonnen)",
    ...metV(
      v.soort === "typ"
        ? {
            eerste: [],
            hint: ["Tik elk blaadje aan als je telt. Het laatste getal is je antwoord.", "Tel de blaadjes rij voor rij, en tik ze aan.", "Probeer het nog eens. Tel de blaadjes en typ het getal."],
            uitleg: ["Elk blaadje telt mee.", "We tellen alle blaadjes, stuk voor stuk."],
          }
        : { eerste: [], hint: ["Tel wat elk ding bedekt."], uitleg: ["We kijken het samen na."] },
    ),
    licht: null,
    scherm: v.soort === "typ" ? SCHERM_TYP : SCHERM_KIES,
    over,
    eigen: false,
    bron: "BLIEPO-KARAKTER.md §10",
  };
}

/** De fout bij een antwoord (alle soorten vragen). */
export function metenFout(x: string, v: Vraag): Fout {
  if (v.soort === "twee") return tweeFout(x, v);
  if (v.soort === "orden") return ordenFout(x, v);
  if (v.soort === "kies") return kiesFout(x, v);
  return typFout(Number(x), v);
}

/** De fouttabel van een vraag: elk fout antwoord (op volgorde: elke foute volgorde; typen: de meest voorkomende getallen). */
export function foutenVan(v: Vraag): Record<string, Fout> {
  const lijst = v.soort === "twee" ? paren(v) : v.soort === "orden" ? volgordes(v) : v.soort === "kies" ? v.opties! : typGetallen(v).map(String);
  return Object.fromEntries(lijst.filter((k) => k !== v.goed).map((k) => [k, metenFout(k, v)]));
}

/**
 * WAT BLIEPO ZEGT NA EEN ANTWOORD DAT NIET GOED IS (zuiver, zodat het fouttabel-script precies hetzelfde naspeelt).
 *   1e keer: eerste zin (wat het kind koos of deed) + hint. Daarna stelt de les de vraag opnieuw (ZIN.opnieuw).
 *   2e keer: eerste zin + uitleg; of "weer …" + een andere uitleg bij 2 keer dezelfde denkfout (alleen als Bliepo de 1e
 *   keer al zei wat er mis was); of "Je koos weer …" bij 2 keer hetzelfde antwoord; of "Je zit er weer vlak naast." bij 2
 *   keer een getal vlak naast het antwoord. Daarna doet Bliepo het samen met het kind voor.
 * `onduidelijk` = een zin uit het vaste rijtje (BLIEPO-KARAKTER.md §10) voor als de denkfout niet duidelijk is.
 */
export function foutReactie(k: Kiezer, o: { f: Fout; v: Vraag; x: string; poging: 1 | 2; eerder: Fout | null; eersteX: string | null; onduidelijk: string }): string[] {
  const { f, v, x, poging, eerder } = o;
  const eigenEerste = () => (f.v.eerste.length ? k.kies("eerste", f.v.eerste) : o.onduidelijk);
  if (poging === 1) {
    const eerste = eigenEerste();
    return [eerste, k.kies("hint", passend(f.v.hint, MAX_HINT, eerste), pastBij(eerste))];
  }
  /* "Weer" alleen als Bliepo de 1e keer al zei wat er mis was. */
  if (eerder !== null && eerder.soort === f.soort && !eerder.noot && !f.noot && f.v.weerEerste.length > 0 && f.code !== "onduidelijk") {
    const weer = k.kies("weer", f.v.weerEerste);
    return [weer, k.kies("weerUitleg", passend(f.v.weerUitleg, MAX_UITLEG, weer), pastBij(weer))];
  }
  const eerste =
    x === o.eersteX
      ? k.kies("weerGekozen", ZIN.weerGekozen(x, v))
      : eerder !== null && eerder.code === "een-ernaast" && f.code === "een-ernaast"
        ? k.kies("weerDichtbij", ZIN.weerDichtbij)
        : eigenEerste();
  return [eerste, k.kies("uitleg", passend(f.v.uitleg, MAX_UITLEG, eerste), pastBij(eerste))];
}
