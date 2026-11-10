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
 *     vol blaadjes (typen). De vraagzinnen zijn die van de oude les.
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
 * Getalkleur (BOUWREGELS 2.1, 2.2, 14.27): een getal heeft de kleur van de dingen waar het naar verwijst: de blaadjes
 * (groen, blauw, oranje), de blauwe en gele hokjes, de tegels op de muur (geel), de stenen (rood). Puzzelstukken in
 * allerlei kleuren, borden en kale getallen: wit.
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
    vraag: ["Weer een muur met schilderijen.", "Welke 2 zinnen kloppen?"],
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
  { nr: 11, id: "vraag11-tafel-12", soort: "typ", thema: "tafel", beeld: "tafel|k=4|r=3|kl=oranje", k: 4, r: 3, kleur: "oranje", goed: "12", vraag: ["Nog een tafel vol blaadjes.", "Hoe groot is deze tafel?"] },
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

const kies3 = <T,>(lijst: T[], v: Vraag) => lijst[v.nr % lijst.length];
export const naamVan = (v: Vraag, id: string) => [...(v.kaarten ?? []), ...(v.losse ?? [])].find((k) => k.id === id)?.naam ?? id;
const Hoofd = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const klein = (v: Vraag) => (v.thema === "tafels" ? "klein" : "smal");
const groot = (v: Vraag) => (v.thema === "tafels" ? "groot" : "breed");
/** "de kleinste tafel" / "het smalste muurtje" */
const kleinste = (v: Vraag) => (v.thema === "tafels" ? "de kleinste tafel" : "het smalste muurtje");
/** De stenen van een muurtje zijn rood; de getallen in de naam dus ook (2.2). Borden zijn wit. */
const metKleur = (v: Vraag, naam: string) => naam.replace(/(\d+) (stenen|borden)/, (_, n: string, w: string) => `${g(Number(n), w === "stenen" ? "rood" : "wit")} ${w}`);
export const naamK = (v: Vraag, id: string) => metKleur(v, naamVan(v, id));

/* ---------- vaste zinnen van het verloop (draaiboek Meten §2; eigen woorden) ---------- */

export const ZIN = {
  /**
   * Het begin (draaiboek §1: geen startvraag, meteen de eerste vraag). De groet en het uitlegdeel zijn 1 stuk (Sara,
   * 10 nov; BOUWREGELS 4.3, 4.4).
   */
  start: "In deze les kijk je hoe groot iets is. Je telt hoeveel tegels of hokjes het bedekt.",

  /** De vraag van de oude les (3.11); niet 2 keer na elkaar precies hetzelfde (F7). */
  vraag: (v: Vraag): string[] => v.vraag,
  /** Op volgorde, de eerste keer: hoe het werkt (3.15: 1 keer per les uitleggen). */
  ordenHoe: "Sleep een plaatje naar een leeg vak. Tikken mag ook.",
  /** Kies er 2, de eerste keer: hoe het werkt (3.15). */
  tweeHoe: "Tik op 2 kaartjes.",
  /** Een nieuwe poging na de hint: de vraag in andere woorden (3.23). */
  opnieuw: (v: Vraag): string[] => {
    if (v.soort === "twee") return ["Welke 2 kaartjes kloppen?"];
    if (v.soort === "orden") return [`Leg ze nu van ${klein(v)} naar ${groot(v)}.`];
    if (v.thema === "vellen") return ["Zijn de 2 kaartjes even groot, of niet?"];
    if (v.thema === "matten") return ["Zijn de matten even groot, of is er 1 groter?"];
    return ["Hoeveel blaadjes liggen er op de tafel?"];
  },
  /** Op volgorde: het hulphandje wijst een leeg vak aan (nooit het goede plaatje, 15.17). */
  ordenHand: "Hier komt een plaatje.",

  /** 2e fout: samen voordoen (draaiboek §3 G: samen tellen; op volgorde en kiezen: eigen invulling). */
  samen: (v: Vraag) =>
    v.thema === "tafel" ? "Kom, we tellen samen." : v.thema === "schilderij" ? "Kom, we kijken samen naar de tegels." : v.thema === "ruitjes" ? "Kom, we tellen de hokjes samen." : v.thema === "matten" ? "Kom, we tellen de stukken samen." : v.thema === "vellen" ? `Kom, we draaien kaartje ${g(2, "oranje")} terug.` : "Kom, we leggen ze samen.",
  /** Samen tellen: het kind tikt (draaiboek §3 G.1: "tik elke tegel 1 keer"). */
  samenTelTafel: "Tik elk blaadje 1 keer aan.",
  samenTelHand: "Tik dit blaadje.",
  /** Bliepo zegt het getal bij elke tik (draaiboek §3 G.2). */
  telGetal: (n: number, kleur: string) => `${g(n, kleur)}.`,
  /** De schilderijen: Bliepo noemt per schilderij hoeveel tegels erachter zitten (de tegels zijn nu te zien). */
  samenSchilderij: (naam: string, n: number) => `${Hoofd(naam)} bedekt ${g(n, "geel")} tegels.`,
  samenSchilderijSlot: (klein: string, groot: string) => `${Hoofd(klein)} bedekt de minste tegels. ${Hoofd(groot)} de meeste.`,
  samenTweeStap: "Tik jij de 2 kaartjes aan die kloppen?",
  samenTweeHand: "Tik dit kaartje aan.",
  /** Ruitjes en matten: Bliepo telt de eerste vorm, het kind de tweede. */
  samenBlauwKlaar: `Blauw heeft ${g(8, "blauw")} hokjes.`,
  samenGeelStap: "Tel jij de gele hokjes? Tik elk hokje aan.",
  samenGeelHand: "Tik dit hokje.",
  samenMat1Klaar: (n: number) => `Mat ${g(1, "wit")} heeft ${g(n, "wit")} stukken.`,
  samenMat2Stap: `Tel jij de stukken van mat ${g(2, "wit")}? Tik elk stuk aan.`,
  samenMatHand: "Tik dit stuk.",
  /** Het gedraaide kaartje: het kind tikt kaartje 2 en het draait terug. */
  samenVelStap: `Tik jij op kaartje ${g(2, "oranje")}?`,
  samenVelHand: "Tik hier.",
  /** Op volgorde: Bliepo legt ze, het kind sleept de laatste. */
  samenOrden: (v: Vraag, i: number, id: string) => (i === 0 ? `Vooraan ${naamK(v, id)}.` : `Dan ${naamK(v, id)}.`),
  samenOrdenStap: (v: Vraag, id: string) => `Sleep jij ${naamK(v, id)} naar het laatste vak?`,
  samenOrdenHand: "Sleep het hierheen.",
  /** Klaar met samen voordoen; het kind deed de laatste stap (geen "Ja" van een lofzin: dat was samen, 3.4). */
  samenKlaar: (v: Vraag): string => {
    if (v.thema === "tafel") return `Samen geteld: de tafel is ${g(v.k! * v.r!, v.kleur!)} blaadjes groot.`;
    if (v.thema === "schilderij") return `${Hoofd(v.kaarten!.find((k) => k.label === "kleinst" && v.goed.split(",").includes(k.id))!.naam)} is het kleinst, en ${v.kaarten!.find((k) => k.label === "grootst")!.naam} is het grootst.`;
    if (v.thema === "ruitjes") return `Geel heeft ook ${g(8, "geel")} hokjes. Dus ze zijn even groot, en blauw is ${g(8, "blauw")} hokjes groot.`;
    if (v.thema === "matten") return `Mat ${g(2, "wit")} heeft ook ${g(v.stukken!, "wit")} stukken. De matten zijn even groot.`;
    if (v.thema === "vellen") return "Nu liggen ze allebei rechtop. Ze zijn even groot.";
    return `Nu liggen ze van ${klein(v)} naar ${groot(v)}.`;
  },
  /** Na het vangnet (Bliepo deed de stap zelf): geen "Ja" en geen "samen geteld" (keuring Meer-minder, 10 nov). */
  samenZelf: (v: Vraag): string => {
    if (v.thema === "tafel") return `Kijk, de tafel is ${g(v.k! * v.r!, v.kleur!)} blaadjes groot.`;
    if (v.thema === "schilderij") return "Kijk, deze 2 kaartjes kloppen.";
    if (v.thema === "ruitjes") return `Kijk, geel heeft ook ${g(8, "geel")} hokjes. Ze zijn even groot.`;
    if (v.thema === "matten") return `Kijk, mat ${g(2, "wit")} heeft ook ${g(v.stukken!, "wit")} stukken. De matten zijn even groot.`;
    if (v.thema === "vellen") return "Kijk, nu liggen ze allebei rechtop. Ze zijn even groot.";
    return `Kijk, nu liggen ze van ${klein(v)} naar ${groot(v)}.`;
  },
  /** Hetzelfde foute antwoord 2 keer: niet 2 keer dezelfde eerste zin (geleerd bij Tellen). */
  weerGekozen: (x: string, v: Vraag) => (v.soort === "orden" ? "Je legde ze weer zo neer." : v.soort === "twee" ? "Je koos weer dezelfde 2 kaartjes." : v.soort === "typ" ? `Je typte weer ${g(Number(x), "wit")}.` : "Je koos weer dezelfde zin."),
  /** Na goed bij typen: het getal naast de tafel, in de kleur van de blaadjes (draaiboek §3 C.4: "14 tegels"). */
  label: (n: number) => `${n} blaadjes`,

  /** De vragen die terugkomen (de oude les: eerst wat niet meteen goed was, aangevuld met vaste vragen). */
  terug1: "Er komt nog 1 vraag van net terug.",
  terugN: (n: number) => `Er komen nog ${n} vragen van net terug.`,
  extra1: "Nog 1 vraag om te oefenen.",
  extraN: (n: number) => `Nog ${n} vragen om te oefenen.`,
  terugLastig: "Deze vragen oefen je een andere keer nog eens.",
  /** Einde. */
  slot: "Je weet nu hoe je kunt zien hoe groot iets is.",
  kaartTik: "Tik op de kaart.",
};

/** Aanmoediging bij het hulphandje (het kind moet slepen of tikken, niet nadenken; 14.35, geleerd bij Tellen). */
export const AANMOEDIG_TIKKEN = ["Je bent goed bezig.", "Jij kunt dit."];

/**
 * Reactie na de lof (BLIEPO-KARAKTER.md §4 Meten, eigen zinnen per vraag). Index 0 en 1 beginnen met "Ja", 2 en 3 niet,
 * 4 is de robotzin (hooguit 1 keer per les).
 */
export function metenReactie(v: Vraag): Rijtje {
  if (v.thema === "schilderij") {
    const [kl, gr] = [v.kaarten!.find((k) => k.label === "kleinst" && v.goed.split(",").includes(k.id))!, v.kaarten!.find((k) => k.label === "grootst")!];
    return rij([`Ja, ${kl.naam} bedekt de minste tegels.`, `Ja, ${gr.naam} bedekt de meeste tegels.`, `${Hoofd(kl.naam)} is het kleinst, ${gr.naam} het grootst.`, `${Hoofd(gr.naam)} bedekt de meeste tegels.`, `Nagekeken: ${kl.naam} het kleinst, ${gr.naam} het grootst.`], [4]);
  }
  if (v.thema === "ruitjes") return rij([`Ja, ze zijn allebei ${g(8, "wit")} hokjes groot.`, "Ja, een andere vorm, maar even groot.", `Allebei ${g(8, "wit")} hokjes.`, "Een andere vorm, maar even groot.", `Nagekeken: allebei ${g(8, "wit")} hokjes. Klopt!`], [4]);
  if (v.thema === "tafels") return rij(["Ja, van klein naar groot.", "Ja, de tafels worden steeds groter.", "Op de grootste tafel is nog plek over.", "De tafels worden steeds groter.", "Nagekeken: van klein naar groot!"], [4]);
  if (v.thema === "muurtjes") return rij(["Ja, van smal naar breed.", "Ja, elk muurtje is breder dan het vorige.", "Elk muurtje is breder dan het vorige.", "Van smal naar breed.", "Nagekeken: van smal naar breed!"], [4]);
  if (v.thema === "vellen") return rij(["Ja, ze zijn allebei even groot.", "Ja, draaien maakt het kaartje niet groter.", `Kaartje ${g(2, "oranje")} is alleen gedraaid.`, "Draaien maakt het kaartje niet groter.", "Nagekeken: even groot!"], [4]);
  if (v.thema === "matten") {
    const n = g(v.stukken!, "wit");
    return rij([`Ja, allebei ${n} stukken.`, "Ja, ze zijn even groot.", `Allebei ${n} stukken.`, "Ze zien er anders uit, maar ze zijn even groot.", `Nagekeken: allebei ${n} stukken.`], [4]);
  }
  const n = g(v.k! * v.r!, v.kleur!);
  return rij([`Ja, de tafel is ${n} blaadjes groot.`, `Ja, je telde ze allemaal: ${n}.`, `De tafel is ${n} blaadjes groot.`, `Je telde ${n} blaadjes.`, `Nagekeken: ${n} blaadjes. Klopt!`], [4]);
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

export type Fout = {
  code: Denkfoutnaam;
  /** Welke uitleg bij de 2e fout hoort (dezelfde soort 2 keer = "weer"). */
  soort: string;
  denkfout: string;
  /** Bliepo's eerste zin (leeg bij "onduidelijk": dan een zin uit BLIEPO-KARAKTER.md §10). */
  eerste: string;
  hint: string;
  /** Uitleg na de 2e fout (daarna meteen samen voordoen; dan mag het antwoord in beeld, 15.11). Uitleg, geen opdracht. */
  uitleg: string;
  /** Dezelfde denkfout 2 keer (en de 1e keer zei Bliepo al wat er mis was): anders uitleggen. */
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
        eerste: "Je koos 2 keer 'het kleinst'.",
        hint: kies3(["Maar 1 schilderij kan het kleinst zijn. Kijk hoeveel tegels elk schilderij bedekt.", "Er is maar 1 kleinste schilderij. Kijk welk schilderij de minste tegels bedekt."], v),
        uitleg: "Er is maar 1 kleinste schilderij: dat bedekt de minste tegels.",
        weer: ["Je koos weer 2 keer 'het kleinst'.", "Maar 1 schilderij bedekt de minste tegels."],
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
      eerste: "1 van je 2 kaartjes klopt.",
      hint: kies3(["Kijk hoeveel tegels elk schilderij bedekt. Hoe minder tegels, hoe kleiner.", "Het kleinste schilderij bedekt de minste tegels. Kijk goed naar de tegels."], v),
      uitleg: "Het kleinste schilderij bedekt de minste tegels.",
      weer: ["Je koos weer een schilderij dat niet het kleinst is.", "Het kleinste bedekt de minste tegels."],
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
      eerste: "Je koos 'even groot' én 'niet even groot'.",
      hint: "Die 2 kunnen niet allebei kloppen. Tel de blauwe en de gele hokjes.",
      uitleg: "Even groot en niet even groot kan niet allebei waar zijn.",
      weer: ["Je koos weer allebei.", "Maar 1 van die 2 zinnen kan kloppen."],
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
    eerste: "1 van je 2 kaartjes klopt.",
    hint: kies3(["Tel de blauwe hokjes en de gele hokjes.", "Tel de hokjes van allebei de vormen."], v),
    uitleg: "Een andere vorm kan toch even groot zijn. Het aantal hokjes telt.",
    weer: ["Je koos weer 'niet even groot'.", "De vorm is anders, maar het aantal hokjes zegt hoe groot hij is."],
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
      eerste: `Je legde ze van ${groot(v)} naar ${klein(v)}.`,
      hint: `Van ${klein(v)} naar ${groot(v)}: ${kleinste(v)} komt vooraan.`,
      uitleg: `${Hoofd(kleinste(v))} hoort vooraan, ${t ? "de grootste" : "het breedste"} achteraan.`,
      weer: [`Je legde ze weer van ${groot(v)} naar ${klein(v)}.`, `${Hoofd(kleinste(v))} hoort vooraan.`],
      licht: { soort: "vak", i: 0 },
    };
  if (t && x === "a,b,d,c")
    return {
      ...basis,
      code: "plek-over-niet-gezien",
      soort: "plek-over",
      denkfout: "zag niet dat op de tafel met plek over meer borden passen (c en d hebben allebei 6 borden)",
      eerste: `Op 2 tafels staan ${g(6, "wit")} borden.`,
      hint: "Kijk ook hoeveel borden er op een tafel passen.",
      uitleg: "Op de tafel met plek over passen nog meer borden. Die tafel is dus het grootst.",
      weer: ["Je zag de lege plekken weer niet.", "Op de tafel met plek over passen meer borden."],
      licht: null,
    };
  if (p === 0)
    return {
      ...basis,
      code: "kleinste-niet-vooraan",
      soort: "vooraan",
      denkfout: `legde vooraan niet ${kleinste(v)} (${naamVan(v, xs[0])})`,
      eerste: `Vooraan ligt nog niet ${kleinste(v)}.`,
      hint: t ? "Begin met de tafel waar de minste borden op passen." : "Begin met het muurtje met de minste stenen naast elkaar.",
      uitleg: `${Hoofd(kleinste(v))} hoort vooraan.`,
      weer: [`Vooraan lag weer niet ${kleinste(v)}.`, t ? "Op de kleinste tafel passen de minste borden." : "Het smalste muurtje heeft de minste stenen naast elkaar."],
      licht: { soort: "vak", i: 0 },
    };
  if (m(xs[p]) < m(xs[p - 1]))
    return {
      ...basis,
      code: "kleiner-erna",
      soort: "kleiner-erna",
      denkfout: `legde na ${naamVan(v, xs[p - 1])} een ${t ? "kleinere tafel" : "smaller muurtje"}`,
      eerste: `Na ${naamK(v, xs[p - 1])} legde je ${t ? "een kleinere tafel" : "een smaller muurtje"}.`,
      hint: t ? "Elke tafel is groter dan de tafel ervoor." : "Elk muurtje is breder dan het muurtje ervoor.",
      uitleg: t ? "Van klein naar groot: elke tafel is groter dan de tafel ervoor." : "Van smal naar breed: elk muurtje is breder dan het muurtje ervoor.",
      weer: [`Je legde weer ${t ? "een kleinere tafel" : "een smaller muurtje"} erachter.`, t ? "Elke volgende tafel is groter." : "Elk volgend muurtje is breder."],
      licht: { soort: "vak", i: p },
    };
  return {
    ...basis,
    code: "overgeslagen",
    soort: "overgeslagen",
    denkfout: `sloeg na ${naamVan(v, xs[p - 1])} ${t ? "een tafel" : "een muurtje"} over (${naamVan(v, xs[p])})`,
    eerste: `Na ${naamK(v, xs[p - 1])} legde je ${naamK(v, xs[p])}.`,
    hint: t ? "Zoek steeds de kleinste tafel die nog over is." : "Zoek steeds het smalste muurtje dat nog over is.",
    uitleg: t ? "Na elke tafel komt de tafel die net iets groter is." : "Na elk muurtje komt het muurtje dat net iets breder is.",
    weer: [`Je sloeg weer ${t ? "een tafel" : "een muurtje"} over.`, t ? "Na elke tafel komt de tafel die net iets groter is." : "Na elk muurtje komt het muurtje dat net iets breder is."],
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
      eerste: `Kaartje ${g(2, "oranje")} ligt op zijn kant. Daardoor lijkt het anders.`,
      hint: "Maar draaien maakt iets niet groter of kleiner.",
      uitleg: "Een kaartje wordt niet groter of kleiner als je het draait.",
      weer: ["Je koos weer 'niet even groot'.", "Gedraaid is het kaartje nog net zo groot."],
      licht: { soort: "vel" },
      scherm: SCHERM_KIES,
      over: andere,
      eigen: false,
      bron: "draaiboek §7 `vorm-verandert-grootte` (een andere stand of vorm verandert de grootte niet); de zinnen zijn eigen invulling",
      noot: "2 keuzes: na 1 fout blijft er altijd 1 over; Bliepo noemt de regel van de oude les, niet het antwoord",
    };
  if (x === "Mat 1 is groter.")
    return {
      code: "hoog-lijkt-groter",
      soort: "mat1",
      denkfout: "vindt de hogere mat groter (2 rijen tegen 1), zonder de stukken te tellen",
      eerste: `Mat ${g(1, "wit")} is hoger. Dan lijkt hij groter.`,
      hint: kies3(["Tel de stukken van allebei de matten.", "Tel hoeveel stukken elke mat heeft."], v),
      uitleg: "Een mat is niet groter omdat hij hoger is. Het aantal stukken telt.",
      weer: ["Je koos weer mat 1.", "Hoger is niet altijd groter. Het aantal stukken telt."],
      licht: { soort: "mat", mat: 1 },
      scherm: SCHERM_KIES,
      over: andere,
      eigen: false,
      bron: "draaiboek §7 `groot-vierkant-lijkt-groter` (kiest de vorm die er dik uitziet; gezien bij de gok, R2)",
    };
  if (x === "Mat 2 is groter.")
    return {
      code: "lang-lijkt-groter",
      soort: "mat2",
      denkfout: "vindt de langere mat groter, zonder de stukken te tellen",
      eerste: `Mat ${g(2, "wit")} is langer. Dan lijkt hij groter.`,
      hint: kies3(["Tel de stukken van allebei de matten.", "Tel hoeveel stukken elke mat heeft."], v),
      uitleg: "Een mat is niet groter omdat hij langer is. Het aantal stukken telt.",
      weer: ["Je koos weer mat 2.", "Langer is niet altijd groter. Het aantal stukken telt."],
      licht: { soort: "mat", mat: 2 },
      scherm: SCHERM_KIES,
      over: andere,
      eigen: false,
      bron: "draaiboek §7 `lang-lijkt-groter` (gezien: gok R1, R3 en vergelijken R1)",
    };
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
      eerste: `${g(k, kl)} is de bovenste rij.`,
      hint: kies3(["Er liggen nog meer rijen onder. Tel ze allemaal mee.", "Onder de bovenste rij liggen nog meer blaadjes. Tel ze ook."], v),
      uitleg: kies3(["De rijen eronder tellen ook mee.", "Alle rijen horen erbij, niet alleen de bovenste."], v),
      weer: ["Je telde weer alleen de bovenste rij.", "De rijen eronder horen er ook bij."],
      licht: { soort: "rij", rij: 0 },
      bron: "draaiboek §3 C.3 en §7 `een-rij-geteld` (\"dat is de bovenste rij; er liggen meer rijen onder\")",
    };
  if (code === "rij-gemist")
    return {
      ...basis,
      code,
      soort: "rij-gemist",
      denkfout: `sloeg een hele rij over (${x} van de ${n})`,
      eerste: "Dan heb je een rij overgeslagen.",
      hint: kies3(["Tel rij voor rij. Tik elk blaadje aan als je telt.", "Tel elke rij. Tik de blaadjes aan, dan zie je wat je al telde."], v),
      uitleg: kies3(["Elke rij telt mee.", "Alle rijen horen erbij."], v),
      weer: ["Je sloeg weer een rij over.", "Elke rij telt mee."],
      licht: null,
      bron: "draaiboek §3 C.3 en §7 `rij-gemist` (\"dan mis je een hele rij\")",
    };
  if (code === "een-ernaast")
    return {
      ...basis,
      code,
      soort: "ernaast",
      denkfout: `telde er 1 te veel of 1 te weinig (${x} voor ${n})`,
      eerste: kies3(["Dat is dichtbij.", "Je zit er vlak naast.", "Bijna goed geteld."], v),
      hint: kies3(["Tik elk blaadje 1 keer aan als je telt.", "Geef elk blaadje 1 tik. Dan tel je niets 2 keer en sla je niets over."], v),
      uitleg: kies3(["Elk blaadje telt precies 1 keer mee.", "Elk blaadje hoort er 1 keer bij."], v),
      weer: [],
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
      eerste: `Je deed ${g(k, kl)} en ${g(r, "wit")} bij elkaar.`,
      hint: "Tel niet de rijen, maar alle blaadjes.",
      uitleg: "We tellen de blaadjes, niet de rijen.",
      weer: ["Je deed weer de rijen erbij.", "Alleen de blaadjes tellen mee."],
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
    eerste: "",
    hint: v.soort === "typ" ? kies3(["Tik elk blaadje aan als je telt. Het laatste getal is je antwoord.", "Tel de blaadjes rij voor rij, en tik ze aan."], v) : "Tel wat elk ding bedekt.",
    uitleg: v.soort === "typ" ? "Elk blaadje telt mee." : "We kijken het samen na.",
    weer: [],
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
