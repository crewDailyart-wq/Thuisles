/**
 * ALLE ZINNEN VAN BLIEPO in de gouden les Minsommen (squla-min-machine-1-gouden, 10 november 2026), op één plek, met de
 * FOUTTABEL. De les zelf (squla-minsommen-gouden.tsx) bevat geen eigen zinnen.
 *
 *   - De rijtjes (lof, momenten, naam, goed na een fout, einde, eerste zin als de denkfout niet duidelijk is, aanmoedigen,
 *     overgang) zijn dezelfde als in de gouden lessen klok, Tellen, Splitsen en Plussommen (BLIEPO-KARAKTER.md). Hier
 *     alleen de reactie bij Aftrekken (BLIEPO-KARAKTER.md §4, zin 17 t/m 20, plus zinnen zonder "Ja").
 *   - De inhoud (15 vragen, getallen en keuzes) is die van squla-min-machine-1 "Minsommen: hoeveel over?" (BOUWREGELS
 *     15.22): 5 keer de min-machine (10 min 1 t/m 5), 6 keer het schoolbord en 4 keer een kale som in het midden. De
 *     vraagzinnen zijn die van de oude les; alleen waar LESRECEPT.md het vraagt (dezelfde lange zin niet steeds
 *     herhalen) is de machinevraag later korter (KEUZES-VOOR-SARA.md, Ronde 24).
 *   - De soort reactie volgt het draaiboek Minsommen (Dot Destruction, SYNTHESIS-ANALYSE/DRAAIBOEKEN-NIEUW/minsommen.md
 *     §3 E en G, §6 en §7). Synthesis noemt bij een som de denkfout niet en laat de machine het voordoen; Bliepo reageert
 *     wel op de denkfout (BOUWREGELS 15.9), maar alleen met wat zeker is: het gekozen getal is het begingetal, het getal
 *     dat eraf gaat, of meer/minder dan het goede antwoord. Zou "meer" of "minder" maar 1 keuze overlaten, dan noemt hij
 *     de richting niet (15.17); het fouttabel-script rekent dat na.
 *
 * Leesbare versie: FOUTTABEL-squla-min-machine-1-gouden.md (maak hem opnieuw met
 * `npx tsx scripts/fouttabel-minsommen-gouden.ts`; dat script doet ook de reken- en verklapcontrole).
 * {7:roze} = een getal in de kleur van de blokjes of stippen waar het naar verwijst; {7:wit} = een getal zonder voorwerp
 * (een kale som op het bord of in het midden, BOUWREGELS 2.1, 14.27).
 */

import { somKleuren } from "../vlakken/squla-getalring";
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
/** Het echte minteken, zoals in de oude les. */
export const MIN = "−";

/* ---------- de 15 vragen van squla-min-machine-1 (zelfde volgorde, getallen en keuzes) ---------- */

export type Soort = "machine" | "bord" | "midden";
export type Minvraag = { nr: number; id: string; soort: Soort; a: number; b: number; keuzes: number[] };

const machine = (nr: number, b: number, keuzes: number[]): Minvraag => ({ nr, id: `vraag${nr}-machine-10-${b}`, soort: "machine", a: 10, b, keuzes });
const bord = (nr: number, a: number, b: number, keuzes: number[]): Minvraag => ({ nr, id: `vraag${nr}-bord-${a}-${b}`, soort: "bord", a, b, keuzes });
/** In de oude les heet dit type anders: een kale som groot in het midden, kiezen uit 3. */
const midden = (nr: number, a: number, b: number, keuzes: number[]): Minvraag => ({ nr, id: `vraag${nr}-som-${a}-${b}`, soort: "midden", a, b, keuzes });

export const VRAGEN: Minvraag[] = [
  machine(1, 3, [6, 7, 8]),
  machine(2, 5, [4, 5, 6]),
  machine(3, 1, [8, 9, 10]),
  machine(4, 4, [5, 6, 7]),
  machine(5, 2, [7, 8, 9]),
  bord(6, 8, 5, [2, 3, 4]),
  midden(7, 9, 3, [6, 7, 8]),
  bord(8, 7, 3, [3, 4, 5]),
  bord(9, 10, 6, [4, 5, 6]),
  midden(10, 6, 4, [1, 2, 3]),
  bord(11, 9, 6, [2, 3, 4]),
  midden(12, 8, 4, [3, 4, 5]),
  bord(13, 6, 5, [1, 2, 3]),
  bord(14, 10, 5, [4, 5, 6]),
  midden(15, 7, 5, [2, 3, 4]),
];

/**
 * De kleuren van een som: [kleur van het eerste getal en van wat overblijft, kleur van wat eraf gaat]. Bij de machine
 * horen de getallen bij de blokjes (dezelfde kleuren als de oude machine: somKleuren). Bij een kale som (bord, midden)
 * verwijst geen getal naar een voorwerp: wit (14.27). Bij het samen voordoen met de stippen krijgen ook de kale sommen
 * de kleuren van de stippen (`metStippen`).
 */
export function kleurenVan(v: Minvraag, metStippen = false): [string, string] {
  if (v.soort !== "machine" && !metStippen) return ["wit", "wit"];
  return somKleuren(v.a, v.b);
}

const blijft = (n: number) => (n === 1 ? "blijft" : "blijven");
const blokjes = (n: number) => (n === 1 ? "blokje" : "blokjes");
const stippen = (n: number) => (n === 1 ? "stip" : "stippen");

/* ---------- vaste zinnen van het verloop (draaiboek Minsommen §2) ----------
 *
 * Sara, 18 november 2026 (zoals de proefles Tellen): Bliepo klinkt als een warme juf. Elke zin is nagelopen (kort, gewone
 * woorden, lief, nooit "fout", een getal nooit 2 keer achter elkaar) en elke situatie die terugkomt heeft varianten.
 * Een lijst = varianten: de les kiest er 1 met de gedeelde kiezer (nooit-dubbel.ts), nooit 2 keer achter elkaar
 * dezelfde, ook niet over vragen heen. Getal, antwoord en betekenis zijn niet veranderd. De vraagzinnen ("Hoeveel
 * blokjes komen eruit?", "Hoeveel is 8 − 5?") zijn gelijk gebleven (3.11). Oud naast nieuw: WIJZIGINGEN-ZINNEN-MINSOMMEN.md.
 * Een deel is de tekst van Synthesis (Dot Destruction) in het Nederlands, passend gemaakt voor groep 3 (besluit Sara
 * 17 november 2026, BOUWREGELS 15.2): "We begonnen met 10 en haalden er 4 weg.", "Deze is best lastig.", "Je hebt goed
 * gewerkt vandaag!", "Precies, …", "Dat klopt: …".
 */

export const ZIN = {
  /** Stap 1: openen. Eigen beginzin van de les (BOUWREGELS 4.3); geen startvraag (draaiboek §0). Samen met de groet 1 stuk. */
  begin: ["Vandaag gaan we minsommen maken. Er gaat steeds iets af, en jij kiest hoeveel er overblijft.", "We gaan samen minsommen maken. Er gaat steeds iets af, en jij kiest hoeveel er overblijft."],
  /** De vraag bij de machine: de eerste keer helemaal (de zinnen van de oude les), daarna korter (LESRECEPT.md). */
  machineVraag: (v: Minvraag, kort: boolean): string[] => {
    const [ka, kb] = kleurenVan(v);
    return kort
      ? [`Nu haalt de machine er ${g(v.b, kb)} af.`, "Hoeveel blokjes komen eruit?"]
      : [`${g(v.a, ka)} blokjes gaan de machine in.`, `De machine haalt er ${g(v.b, kb)} af.`, "Hoeveel blokjes komen eruit?"];
  },
  /** Bord en midden: de vraag van de oude les. */
  somVraag: (v: Minvraag) => [`Hoeveel is ${g(v.a)} ${MIN} ${g(v.b)}?`],
  /** Een nieuwe poging na de hint (een nieuwe antwoordpoging mag de vraag opnieuw stellen, 3.23), iets anders gezegd. Varianten. */
  opnieuw: (v: Minvraag): string[] =>
    v.soort === "machine"
      ? ["Hoeveel blokjes komen er dan uit?", "Hoeveel blokjes komen er dus uit?", "Kijk nog eens. Hoeveel blokjes komen er nu uit?"]
      : [`Wat is ${g(v.a)} ${MIN} ${g(v.b)}?`, `Hoeveel is ${g(v.a)} ${MIN} ${g(v.b)} dan?`, `Reken het nog eens uit. Wat is ${g(v.a)} ${MIN} ${g(v.b)}?`],
  /** Eerste keer het schoolbord: een korte overgang (wat het kind ziet verandert). */
  bordEerst: ["Nu staan de minsommen op het schoolbord.", "Kijk, nu staan de minsommen op het schoolbord."],
  /** 2e fout: Bliepo doet het samen voor (draaiboek §3 E: samen in de machine; het kind haalt zelf weg). */
  samen: ["Kom, we doen het samen.", "Weet je wat? We doen het samen.", "Geeft niks. We doen het samen.", "Ik help je even. We doen het samen.", "Deze is best lastig. We doen het samen."],
  samenStippen: (v: Minvraag): string[] => {
    const [ka] = kleurenVan(v, true);
    const A = g(v.a, ka);
    return v.soort === "machine"
      ? [`Kijk: ${A} stippen, net zoveel als de blokjes.`, `Kijk, hier zijn ${A} stippen. Net zoveel als de blokjes.`, `We beginnen met ${A} stippen. Net zoveel als de blokjes.`]
      : [`Kijk: ${A} stippen.`, `Kijk, hier zijn ${A} stippen.`, `We beginnen met ${A} stippen.`];
  },
  /** De opdracht bij het samen voordoen. Het getal staat er 1 keer (was: "Haal er 3 weg. Tik op 3 stippen."). */
  samenWeg: (v: Minvraag): string[] => {
    const [, kb] = kleurenVan(v, true);
    const B = g(v.b, kb);
    return v.b === 1 ? [`Haal er ${B} weg. Tik op een stip.`, `Nu halen we er ${B} weg. Tik maar op een stip.`, `Er gaat er ${B} af. Tik op een stip.`] : [`Haal er ${B} weg. Tik op de stippen.`, `Nu halen we er ${B} weg. Tik maar op de stippen.`, `Er gaan er ${B} af. Tik op de stippen.`];
  },
  samenHand: ["Tik op een stip om hem weg te halen.", "Tik op een stip. Dan gaat hij weg.", "Tik maar op een stip om hem weg te halen."],
  /** Bliepo telt hardop mee bij het weghalen (draaiboek §3 F). */
  samenTel: (v: Minvraag, k: number) => `${g(k, kleurenVan(v, true)[1])}.`,
  /** De uitkomst na het samen voordoen. De uitkomst staat er 1 keer (was: "Er blijven 6 stippen over. 10 − 4 = 6."); de hele som met de uitkomst staat bovenaan in beeld. */
  samenKlaar: (v: Minvraag): string[] => {
    const [ka, kb] = kleurenVan(v, true);
    const u = v.a - v.b;
    const A = g(v.a, ka);
    const B = g(v.b, kb);
    const U = g(u, ka);
    return [
      `${A} ${MIN} ${B} = ${U}. Kijk maar: zoveel ${blijft(u)} er over.`,
      `We begonnen met ${A} en haalden er ${B} weg. Er ${blijft(u)} er ${U} over.`,
      `Er ${blijft(u)} ${U} ${stippen(u)} over. Zoveel is ${A} ${MIN} ${B}.`,
    ];
  },
  /** Hetzelfde foute antwoord 2 keer: niet 2 keer dezelfde eerste zin (geleerd bij Tellen). */
  weerGekozen: (x: number, k: string) => [`Je koos weer ${g(x, k)}.`, `Je tikte weer op ${g(x, k)}.`, `Weer ${g(x, k)}, zie ik.`],
  /** Stap 19: einde. */
  slot: ["Je weet nu hoeveel er overblijft bij een minsom.", "Je hebt goed gewerkt vandaag! Nu weet je hoe een minsom gaat.", "Knap, hoor! Je hebt een heleboel minsommen gemaakt."],
  kaartTik: ["Tik op de kaart.", "Tik maar op de kaart.", "Kijk, een kaart voor jou! Tik erop."],
};

/* ---------- de uitleg aan het begin: de stippenmachine (draaiboek Minsommen stap 1 t/m 7; ronde 34, 12 november 2026) ---------- */

/** De stippen en de teller van de uitleg zijn paars; een getal in een zin die naar die stippen verwijst ook (2.1, 2.2). */
export const INTRO_KLEUR = "paars";
const K = INTRO_KLEUR;

export type IntroFout = {
  code: string;
  denkfout: string;
  /** Bliepo's eerste zin bij de 1e fout: zegt alleen wat het kind koos (de reden is niet zeker), nooit het woord "fout". */
  eerste: string;
  hint: string;
  /** Het rondje tijdens de hint: om de teller of de plusknop (Bliepo noemt die). */
  ring: "teller" | "plus";
  /** De uitleg bij de 2e fout (daarna samen voordoen; nu mag het antwoord, want het komt toch in beeld). */
  tweede: string[];
};
export type IntroVraag = {
  id: string;
  vraag: string[];
  /** De vraag na de hint: iets anders gezegd (3.23). */
  opnieuw: string[];
  keuzes: string[];
  goed: string;
  /** Wat Bliepo na de lof zegt als het goed is (een rijtje; hij wisselt af). */
  goedReactie: string[];
  fouten: Record<string, IntroFout>;
  /** Samen voordoen na de 2e fout: het kind tikt zelf 1 keer op de plus. */
  samen: { opdracht: string[]; klaar: string[] };
};

const HINT_PLUS = "Kijk wat de plusknop doet. Komen er stippen bij, of gaan ze eraf?";

export const INTRO = {
  /** Stap 1 van het draaiboek: waar de machine voor dient. Komt na de groet en de beginzin van de les. */
  begin: ["Kijk, dit is mijn stippenmachine. Hij helpt ons straks bij het aftrekken.", "Eerst laat ik je mijn stippenmachine zien. Hij helpt ons straks bij het aftrekken."],
  /** Stap 1: de eerste opdracht (knop 1 keer uitleggen, 3.15). */
  plusEerst: ["Tik op de plusknop onder de machine."],
  /** Het hulphandje bij de plusknop (na de aanmoediging). */
  plusHand: ["Tik op de plusknop.", "Tik maar op de plus.", "Probeer de plusknop maar."],
  /** Stap 2: de eerste stip en de teller. */
  eersteStip: `Je hebt er ${g(1, K)} stip bij gedaan. Bovenaan staat het totaal: zoveel stippen zijn er nu.`,
  /** Stap 3: meer stippen. De zin zegt waar het kind tikt (15.36, 15.37; was: "Doe er nog 2 stippen bij en kijk goed naar het totaal."). */
  meer: [`Tik nog ${g(2, K)} keer op de plusknop. Kijk goed naar het totaal.`],
  /** Na de uitleg, vóór de eerste minsom van de les. */
  einde: ["Nu doen we het andersom. We gaan aftrekken: dan gaat er iets af.", "Nu gaan we het andersom doen. Bij aftrekken gaat er iets af."],
};

/** Stap 4 (het totaal) en stap 7 (hoe heet dit): de 2 keuzevragen van het begin. */
export const INTRO_VRAGEN: IntroVraag[] = [
  {
    id: "intro-totaal",
    vraag: ["Wat gebeurt er met het totaal als er een stip bij komt?"],
    opnieuw: ["Wordt het totaal dan groter of kleiner?"],
    keuzes: ["Het wordt groter.", "Het wordt kleiner."],
    goed: "Het wordt groter.",
    goedReactie: [`Er komt steeds ${g(1, K)} stip bij, dus het totaal wordt groter.`, "Elke nieuwe stip maakt het totaal groter.", "Meer stippen geven een groter totaal."],
    fouten: {
      "Het wordt kleiner.": {
        code: "totaal-kleiner",
        denkfout: "koos dat het totaal kleiner wordt (de reden is niet zeker; misschien aan aftrekken gedacht of niet naar de teller gekeken)",
        eerste: "Je koos dat het kleiner wordt.",
        hint: "Kijk naar het totaal bovenaan. Wat stond daar eerst, en wat staat er nu?",
        ring: "teller",
        tweede: ["Er komen alleen stippen bij.", "Dan kan het totaal niet kleiner worden: het wordt groter."],
      },
    },
    samen: {
      opdracht: [`Tik nog ${g(1, K)} keer op de plusknop en kijk naar het totaal.`],
      klaar: [`Eerst was het ${g(3, K)}, nu is het ${g(4, K)}. Het totaal wordt groter.`],
    },
  },
  {
    id: "intro-optellen",
    vraag: ["Hoe heet het als je er steeds stippen bij doet?"],
    opnieuw: ["Hoe noem je dat, als je er stippen bij doet?"],
    keuzes: ["Optellen", "Aftrekken", "Delen"],
    goed: "Optellen",
    goedReactie: ["Erbij doen heet optellen.", "Stippen erbij doen is optellen.", "Met de plusknop tel je steeds op."],
    fouten: {
      Aftrekken: {
        code: "aftrekken-gekozen",
        denkfout: "koos aftrekken (plus en min verwisseld, of vooruitgedacht: de les gaat over aftrekken)",
        eerste: "Je koos aftrekken. Dat doen we straks.",
        hint: HINT_PLUS,
        ring: "plus",
        tweede: ["Bij aftrekken gaat er iets weg.", "De plusknop zet er juist stippen bij."],
      },
      Delen: {
        code: "delen-gekozen",
        denkfout: "koos delen (de reden is niet zeker; misschien het woord niet goed gekend)",
        eerste: "Je koos delen.",
        hint: HINT_PLUS,
        ring: "plus",
        tweede: ["Delen is eerlijk verdelen.", "De plusknop doet iets anders: hij zet er stippen bij."],
      },
    },
    samen: {
      opdracht: [`Tik nog ${g(1, K)} keer op de plusknop.`],
      klaar: [`Er komt ${g(1, K)} stip bij. Erbij doen heet optellen.`],
    },
  },
];

/** Aanmoediging bij het hulphandje (het kind moet tikken, niet nadenken; 14.35, geleerd bij Tellen). */
export const AANMOEDIG_TIKKEN = ["Je bent goed bezig.", "Jij kunt dit.", "Het gaat goed zo.", "Probeer het maar.", "Toe maar, je doet het goed."];

/**
 * Reactie na de lof (BLIEPO-KARAKTER.md §4 Aftrekken, zin 17 t/m 20, plus zinnen zonder "Ja" voor na een lofzin met
 * "Ja"). Bij de machine gaat het over blokjes die eruit komen; bij een kale som alleen over de som (er staat niets in
 * beeld om te tellen).
 */
export function minReactie(v: Minvraag): { rij: Rijtje; ja: number[]; robot: number } {
  const [ka, kb] = kleurenVan(v);
  const u = v.a - v.b;
  const A = g(v.a, ka);
  const B = g(v.b, kb);
  const U = g(u, ka);
  if (v.soort === "machine")
    return {
      rij: rij([`Ja, ${A} min ${B} is ${U}.`, `Ja, er ${v.b === 1 ? "gaat" : "gaan"} er ${B} af. Er komen er ${U} uit.`, `${A} ${MIN} ${B} = ${U}.`, `Er ${u === 1 ? "komt" : "komen"} ${U} ${blokjes(u)} uit.`, `Ik heb het nagekeken: ${A} min ${B} is ${U}.`, `Precies, ${A} ${MIN} ${B} = ${U}.`, `Dat klopt, er ${u === 1 ? "komt" : "komen"} ${U} ${blokjes(u)} uit.`], [4]),
      ja: [0, 1],
      robot: 4,
    };
  return {
    rij: rij([`Ja, ${A} min ${B} is ${U}.`, `Ja, van de ${A} ${blijft(u)} er ${U} over.`, `${A} ${MIN} ${B} = ${U}.`, `Van de ${A} ${blijft(u)} er ${U} over.`, `Ik heb het nagekeken: ${A} min ${B} is ${U}.`, `Precies, ${A} ${MIN} ${B} = ${U}.`, `Dat klopt: ${A} min ${B} is ${U}.`], [4]),
    ja: [0, 1],
    robot: 4,
  };
}

/* ---------- denkfouten (draaiboek Minsommen §7; namen voor de voortgang) ---------- */

export const DENKFOUTEN = ["begingetal-als-antwoord", "aftrekgetal-als-antwoord", "een-te-veel", "te-veel", "een-te-weinig", "te-weinig", "onduidelijk"] as const;
export type Denkfoutnaam = (typeof DENKFOUTEN)[number];

/** Wat de zinnen het kind vertellen; daarmee rekent het fouttabel-script na hoeveel keuzes er nog over zijn (15.17). */
export type Beperking = { meerDan?: number; minderDan?: number };

export type Fout = {
  code: Denkfoutnaam;
  /** Welke uitleg bij de 2e fout hoort (dezelfde soort 2 keer = "weer"). */
  soort: string;
  denkfout: string;
  /** Bliepo's eerste zin (leeg bij "onduidelijk": dan een zin uit BLIEPO-KARAKTER.md §10). */
  eerste: string;
  hint: string;
  /** Uitleg na de 2e fout (daarna meteen samen voordoen; dan mag de richting, want het antwoord komt toch in beeld). */
  uitleg: string;
  /** Dezelfde denkfout 2 keer (en de 1e keer zei Bliepo al wat er mis was): anders uitleggen. */
  weer: string[];
  /** Het rode rondje tijdens de hint: om het getal dat eraf gaat (machine: "− 3" op de machine; som: de 3). */
  rondje: "eraf" | null;
  scherm: string;
  beperking: Beperking;
  /** Waarom de richting niet genoemd wordt (zou het antwoord verklappen, BOUWREGELS 15.17). */
  noot?: string;
  /** De eerste zin bij de 2e fout, als die anders moet (eerste versie; sinds 18 november 2026 is `uitleg` de hele reactie). */
  kort?: string;
  /** Alle varianten (18 november 2026); `eerste`, `hint`, `uitleg` en `weer` hierboven zijn er 1 van (voor de fouttabel). */
  v?: Varianten;
};

/**
 * Alle varianten bij 1 fout antwoord; de les kiest er steeds 1 (nooit 2 keer achter elkaar dezelfde).
 *   eerste      1e fout: wat het kind koos (met de richting als dat niets verklapt);
 *   hint        1e fout: hoe je het uitrekent, nooit het antwoord;
 *   uitleg      2e fout met een ander getal: de hele reactie (het gekozen getal staat er hooguit 1 keer in);
 *   uitlegLos   2e fout met hetzelfde getal: komt na "Je koos weer …", dus zonder getal;
 *   weerEerste / weerUitleg   2 keer dezelfde denkfout (en Bliepo noemde hem de 1e keer al).
 */
export type Varianten = { eerste: string[]; hint: string[]; uitleg: string[]; uitlegLos: string[]; weerEerste: string[]; weerUitleg: string[] };

/** Woorden die een richting geven (meer of minder dan het gekozen getal); verboden als Bliepo de richting niet noemt (15.17). */
export const RICHTINGWOORDEN_MIN = /\bmeer\b|\bminder\b|te veel|te weinig|zo veel|niet verder|precies \{?\d/i;
/** Woorden waarmee Bliepo zegt dat het bijna goed was. Bij 1 vraag komt zo'n woord hooguit 1 keer (geleerd bij Tellen). */
const KERN = /dichtbij|bijna|scheelt/gi;
export const zelfdeKern = (a: string, b: string) => {
  const A = new Set((a.match(KERN) ?? []).map((w) => w.toLowerCase()));
  return (b.match(KERN) ?? []).some((w) => A.has(w.toLowerCase()));
};

const SCHERM = {
  machine: "Bliepo's scherm 1,5 s rood (geen fout-geluidje); de knoppen weg; de machine blijft staan; rood rondje om het getal dat de machine eraf haalt zolang Bliepo de hint zegt; daarna dezelfde 3 knoppen terug",
  bord: "Bliepo's scherm 1,5 s rood (geen fout-geluidje); de knoppen weg; de som blijft op het bord; rood rondje om het getal dat eraf gaat zolang Bliepo de hint zegt; daarna dezelfde 3 knoppen terug",
  midden: "Bliepo's scherm 1,5 s rood (geen fout-geluidje); de knoppen weg; de som blijft in het midden; rood rondje om het getal dat eraf gaat zolang Bliepo de hint zegt; daarna dezelfde 3 knoppen terug",
} as const;

/** Hoeveel keuzes er na de beperking over zijn (getallen). */
export const overNa = (keuzes: number[], x: number, b: Beperking) => keuzes.filter((k) => k !== x && (b.meerDan === undefined || k > b.meerDan) && (b.minderDan === undefined || k < b.minderDan));

/**
 * De fouttabel van 1 fout antwoord. Draaiboek §6 en §7: het begingetal, het getal dat eraf gaat, 1 te veel of te
 * weinig (gezien bij Synthesis). De hint zegt HOE je het uitrekent (terugtellen vanaf het begingetal), nooit het antwoord.
 * Sinds 18 november 2026 heeft elke zin varianten (`v`); de vaste velden (`eerste`, `hint`, …) zijn er 1 van.
 */
export function minFout(v: Minvraag, x: number): Fout {
  const { a, b, nr } = v;
  const u = a - b;
  const [ka, kb] = kleurenVan(v);
  const A = g(a, ka);
  const B = g(b, kb);
  const X = g(x, ka);
  const scherm = SCHERM[v.soort];
  const machine = v.soort === "machine";
  const gaan = b === 1 ? "gaat" : "gaan";
  const vast = <T,>(l: T[]): T => l[nr % l.length];
  /* Hints zonder richting (mogen altijd): alleen hoe je het uitrekent; het rondje staat om het getal dat eraf gaat. */
  const hint = machine
    ? [`Begin bij ${A} en tel ${B} terug.`, `Tel ${B} terug vanaf ${A}.`, `Denk aan ${A} blokjes. Haal er in je hoofd ${B} weg.`, `Probeer het nog eens. Tel ${B} terug vanaf ${A}.`]
    : [`Begin bij ${A} en tel ${B} terug.`, `Tel ${B} terug vanaf ${A}.`, `Steek ${A} vingers op. Doe er ${B} weg.`, "Probeer het nog eens. Je mag je vingers gebruiken."];
  /* ZONDER richting (als de richting maar 1 keuze zou overlaten, 15.17). Waar voor elk fout antwoord van deze les: alle
     foute keuzes liggen 1 of 2 naast het goede antwoord. */
  const dichtbij = [`Je koos ${X}. Je zit er dichtbij.`, `Je koos ${X}. Dat scheelt niet veel.`, `Bijna! ${X} is het net niet.`, `${X}? Dat is heel dichtbij.`, `Je tikte op ${X}. Het scheelt maar een klein beetje.`];
  const maak = (d: { code: Denkfoutnaam; soort: string; denkfout: string; beperking: Beperking } & Varianten): Fout => {
    const verklapt = overNa(v.keuzes, x, d.beperking).length <= 1;
    const eerste = verklapt ? dichtbij : d.eerste;
    return {
      code: d.code,
      soort: d.soort,
      denkfout: d.denkfout,
      eerste: vast(eerste),
      hint: vast(d.hint),
      uitleg: vast(d.uitleg),
      weer: verklapt ? [] : [vast(d.weerEerste), vast(d.weerUitleg)],
      rondje: "eraf",
      scherm,
      beperking: verklapt ? {} : d.beperking,
      ...(verklapt ? { noot: "richting niet genoemd: dan bleef er maar 1 keuze over" } : {}),
      v: { eerste, hint: d.hint, uitleg: d.uitleg, uitlegLos: d.uitlegLos, weerEerste: d.weerEerste, weerUitleg: d.weerUitleg },
    };
  };

  /* Het begingetal: alsof er niets af gaat (draaiboek §7 `begingetal-als-antwoord`, gezien: 5 bij 5 − 1). */
  if (x === a)
    return maak({
      code: "begingetal-als-antwoord",
      soort: "begin",
      denkfout: "koos het getal waarmee de som begint (alsof er niets af gaat)",
      beperking: { minderDan: a },
      eerste: machine
        ? [`Je koos ${X}: zoveel blokjes gaan erin. Er ${gaan} er nog ${B} af.`, `${X}? Zoveel blokjes gaan erin. Er ${gaan} er nog ${B} af.`, `Je tikte op ${X}. Zoveel gaan erin. Er ${gaan} er nog ${B} af.`]
        : [`Je koos ${X}: daar begint de som mee. Er ${gaan} er nog ${B} af.`, `${X}? Daar begint de som mee. Er ${gaan} er nog ${B} af.`, `Je tikte op ${X}. Daar begint de som mee. Er ${gaan} er nog ${B} af.`],
      hint,
      uitleg: machine
        ? [`Je koos ${X}: zoveel gaan erin. De machine haalt er ${B} af, dus er komen er minder uit.`, `${X} blokjes gaan erin. Er ${gaan} er nog ${B} af. Dan komen er minder uit.`]
        : [`Je koos ${X}: daar begint de som mee. Bij min gaat er iets af. Dan blijft er minder over.`, `${X} is het eerste getal van de som. Er ${gaan} er nog ${B} af. Dan blijft er minder over.`],
      uitlegLos: machine ? [`De machine haalt er ${B} af, dus er komen er minder uit.`, `Er ${gaan} er nog ${B} af. Dan komen er minder uit.`] : ["Bij min gaat er iets af. Dan blijft er minder over.", `Er ${gaan} er nog ${B} af. Dan blijft er minder over.`],
      weerEerste: ["Je koos weer het getal waar je mee begint.", "Dat is weer het getal waar we mee beginnen."],
      weerUitleg: [`Er ${gaan} er ${B} af, dus het wordt minder.`, `Er ${gaan} er nog ${B} af. Dan blijft er minder over.`],
    });
  /* Het getal dat eraf gaat (draaiboek §7 `aftrekgetal-als-antwoord`, gezien: 2 bij 5 − 2, 4 bij 10 − 4). */
  if (x === b)
    return maak({
      code: "aftrekgetal-als-antwoord",
      soort: "eraf",
      denkfout: "koos het getal dat eraf gaat in plaats van wat overblijft",
      beperking: {},
      eerste: machine
        ? [`Je koos ${X}: zoveel blokjes haalt de machine eraf.`, `${X}? Zoveel blokjes haalt de machine eraf.`, `Je tikte op ${X}. Dat zijn de blokjes die eraf gaan.`]
        : [`Je koos ${X}: dat getal gaat eraf.`, `${X}? Dat is het getal dat eraf gaat.`, `Je tikte op ${X}. Zoveel halen we eraf.`],
      hint,
      /* Ronde 33 punt 2 (Sara 12 nov): het getal staat er maar 1 keer in (niet "Je koos 3. 3 gaat eraf. …"). */
      uitleg: machine
        ? [`De machine haalt er ${B} af. De vraag is hoeveel er nog uit komen.`, `${X} blokjes gaan eraf. We zoeken hoeveel er uit komen.`]
        : [`${B} gaat eraf. De vraag is hoeveel er overblijft.`, `${X} is het getal dat eraf gaat. We zoeken wat er overblijft.`],
      uitlegLos: machine ? ["Zoveel blokjes gaan eraf. De vraag is hoeveel er nog uit komen.", "Zoveel haalt de machine eraf. We zoeken hoeveel er uit komen."] : ["Dat getal gaat eraf. De vraag is hoeveel er overblijft.", "Zoveel halen we eraf. We zoeken wat er overblijft."],
      weerEerste: ["Je koos weer het getal dat eraf gaat.", "Dat is weer het getal dat eraf gaat."],
      weerUitleg: ["We zoeken wat er overblijft.", "De vraag is hoeveel er overblijft."],
    });
  if (x > u)
    return maak({
      code: x === u + 1 ? "een-te-veel" : "te-veel",
      soort: "te-veel",
      denkfout: x === u + 1 ? "1 te veel (misschien het begingetal meegeteld bij het terugtellen)" : "te veel over (te weinig teruggeteld)",
      beperking: { minderDan: x },
      /* Bij de machine het woord van de vraag ("komen eruit", 3.11; keuring 10 nov). */
      eerste: machine
        ? [`Je koos ${X}. Dat is iets te veel.`, `Bijna! ${X} is iets te veel.`, `${X}? Er komen er minder uit.`, `${A} ${MIN} ${B} is minder dan ${X}.`, `Je tikte op ${X}. Zo veel blokjes komen er niet uit.`]
        : [`Je koos ${X}. Dat is iets te veel.`, `Bijna! ${X} is iets te veel.`, `${X}? Er blijft minder over.`, `${A} ${MIN} ${B} is minder dan ${X}.`, `Je tikte op ${X}. Zo veel blijft er niet over.`],
      hint,
      uitleg: machine
        ? [`Er komen minder blokjes uit dan ${X}.`, `Er komen er minder dan ${X} uit.`, `Je koos ${X}. Er komen minder blokjes uit.`, `${X}? Dat is te veel.`]
        : [`Er blijven minder over dan ${X}.`, `Er blijft minder dan ${X} over.`, `Je koos ${X}. Er blijft minder over.`, `${X}? Dat is te veel.`],
      uitlegLos: machine ? ["Er komen minder blokjes uit.", "Dat is te veel."] : ["Er blijft minder over.", "Dat is te veel."],
      weerEerste: ["Je koos weer te veel.", "Dat is weer iets te veel.", "Weer iets te veel, zie ik."],
      weerUitleg: [`Tel precies ${B} terug.`, `We tellen precies ${B} terug.`],
    });
  if (x < u)
    return maak({
      code: x === u - 1 ? "een-te-weinig" : "te-weinig",
      soort: "te-weinig",
      denkfout: x === u - 1 ? "1 te weinig (1 te ver teruggeteld)" : "te weinig over (te ver teruggeteld)",
      beperking: { meerDan: x },
      eerste: machine
        ? [`Je koos ${X}. Dat is iets te weinig.`, `Bijna! ${X} is nog iets te weinig.`, `${X}? Er komen er meer uit.`, `${A} ${MIN} ${B} is meer dan ${X}.`, `Je tikte op ${X}. Er komen meer blokjes uit.`]
        : [`Je koos ${X}. Dat is iets te weinig.`, `Bijna! ${X} is nog iets te weinig.`, `${X}? Er blijft meer over.`, `${A} ${MIN} ${B} is meer dan ${X}.`, `Je tikte op ${X}. Er blijft nog meer over.`],
      hint,
      uitleg: machine
        ? [`Er komen meer blokjes uit dan ${X}.`, `Er komen er meer dan ${X} uit.`, `Je koos ${X}. Er komen meer blokjes uit.`, `${X}? Dat is te weinig.`]
        : [`Er blijven meer over dan ${X}.`, `Er blijft meer dan ${X} over.`, `Je koos ${X}. Er blijft meer over.`, `${X}? Dat is te weinig.`],
      uitlegLos: machine ? ["Er komen meer blokjes uit.", "Dat is te weinig."] : ["Er blijft meer over.", "Dat is te weinig."],
      weerEerste: ["Je koos weer te weinig.", "Dat is weer iets te weinig.", "Weer iets te weinig, zie ik."],
      weerUitleg: [`Tel precies ${B} terug, niet verder.`, `We tellen ${B} terug, niet verder.`],
    });
  return { code: "onduidelijk", soort: "onduidelijk", denkfout: "niet duidelijk (geen reden verzonnen)", eerste: "", hint: hint[0], uitleg: "We rekenen het samen uit.", weer: [], rondje: "eraf", scherm, beperking: {} };
}

/** De fouttabel van een vraag: elk fout antwoord. */
export function foutenVan(v: Minvraag): Record<string, Fout> {
  return Object.fromEntries(v.keuzes.filter((k) => k !== v.a - v.b).map((k) => [String(k), minFout(v, k)]));
}
