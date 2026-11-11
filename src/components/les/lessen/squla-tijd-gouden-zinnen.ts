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
 *
 * Leesbare versie: FOUTTABEL-squla-tijd-dagen-1-gouden.md (maak hem opnieuw met `npx tsx scripts/fouttabel-tijd-gouden.ts`;
 * dat script doet ook de verklap- en waarheidscontrole).
 *
 * Getalkleur (BOUWREGELS 2.1, 2.2, 14.20, 14.27): "2 dagen", "7 dagen", "5 dagen" verwijzen naar wagons van verschillende
 * kleuren of naar niets in beeld (de getallen op de knoppen): wit (zoals bij de gouden les Dagen).
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
  /** Een vraag die aan het eind terugkomt (andere hint-versie, eigen id). */
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
/** Een vraag die aan het eind terugkomt: eigen id, de andere hint-versie. */
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

/* ---------- vaste zinnen van het verloop (laag 1 van de gouden lessen; eigen woorden) ---------- */

export const ZIN = {
  /** Het begin (geen startvraag: er is geen draaiboek met een startvraag). Samen met de groet 1 stuk; in beeld de hele
      weektrein. */
  start: "In deze les leer je hoe een week in elkaar zit. Elke dag is een wagon van de weektrein.",
  /** De vraag (de vraagzinnen van de oude les). De eerste kaartvraag zegt wat het kind doet (3.15). */
  vraag: (v: Vraag, eersteKaart: boolean): string[] => {
    const tik = eersteKaart ? ["Tik op de goede kaart."] : [];
    if (v.soort === "eerste") return ["Wat is de eerste dag van de week?", ...tik];
    if (v.soort === "laatste") return ["Wat is de laatste dag van de week?", ...tik];
    if (v.soort === "weekendHoeveel") return ["In het weekend ga je niet naar school.", "Hoeveel dagen heeft het weekend?"];
    if (v.soort === "weekendWelke") return ["Op welke dagen is het weekend?", ...tik];
    if (v.soort === "na") return [`Welke dag komt meteen na ${naam(v.dag)}?`, ...tik];
    return ["Hoeveel dagen heeft een week?"];
  },
  /** 2e fout: Bliepo doet het samen voor (eigen invulling, niet van Synthesis). 3 versies, om de beurt. */
  samen: ["Kom, we kijken samen.", "We zoeken het samen.", "Kom, samen lukt het."],
  /** De hele weektrein komt in beeld. */
  samenTrein: "Hier is de hele weektrein.",
  /** De eerste en de laatste dag. */
  samenEerste: "Vooraan, vlak achter de locomotief, hangt maandag. Daar begint de week.",
  samenLaatste: "Helemaal achteraan hangt zondag. Daar eindigt de week.",
  samenKaartJij: (s: string) => `Tik jij op de kaart van ${kaartNaam(s)}?`,
  samenEersteKlaar: "Ja, maandag is de eerste dag van de week.",
  samenEersteZelf: "Kijk, maandag is de eerste dag van de week.",
  samenLaatsteKlaar: "Ja, zondag is de laatste dag van de week.",
  samenLaatsteZelf: "Kijk, zondag is de laatste dag van de week.",
  /** Het weekend: eerst de schooldagen (1 rondje), dan zaterdag en zondag (1 rondje). */
  samenSchool: "Van maandag tot en met vrijdag ga je naar school.",
  samenWeekendDagen: "Op zaterdag en zondag is er geen school. Dat is het weekend.",
  samenWeekendTel: `Daarna komen zaterdag en zondag. Dat zijn ${g(2)} dagen zonder school.`,
  samenWelkeKlaar: "Ja, zaterdag en zondag zijn het weekend.",
  samenWelkeZelf: "Kijk, zaterdag en zondag zijn het weekend.",
  /** Meteen na: de hele trein, rondje om de dag van de vraag en dan om de goede dag. */
  samenHier: (d: number) => `Hier is ${naam(d)} in de weektrein.`,
  samenNa: (d: number) => (d === 6 ? "Zondag is de laatste wagon. Daarna begint de week weer met maandag." : `Erachter hangt ${naam(na(d))}.`),
  samenNaKlaar: (d: number) => `Ja, meteen na ${naam(d)} komt ${naam(na(d))}.`,
  samenNaZelf: (d: number) => `Kijk, meteen na ${naam(d)} komt ${naam(na(d))}.`,
  /** Hoeveel dagen heeft een week: Bliepo loopt met het rondje langs de wagons (vast tempo, de pijl slaat het over). */
  samenTelBegin: "We lopen langs de wagons, vanaf maandag.",
  samenTelDag: (d: number) => `${Naam(d)}.`,
  samenWeekTel: `Dat zijn ${g(7)} wagons: ${g(7)} dagen.`,
  /** De kleine stap bij een getal: het kind tikt het getal (de enige knop). */
  samenGetalJij: (n: string) => `Tik jij op de ${g(Number(n))}?`,
  samenWeekendKlaar: `Ja, het weekend heeft ${g(2)} dagen.`,
  samenWeekKlaar: `Ja, een week heeft ${g(7)} dagen.`,
  /** Het hulphandje bij de kleine stap. */
  handKaart: "Tik op de kaart in het rondje.",
  /** Hetzelfde foute antwoord 2 keer: niet 2 keer dezelfde eerste zin (geleerd bij Tellen). */
  weerGekozen: (v: Vraag, x: string) => (v.invoer === "getal" ? `Je koos weer ${g(Number(x))}.` : `Je koos weer ${kaartNaam(x)}.`),
  /** De vragen die terugkomen (de oude les: eerst wat niet meteen goed was, aangevuld met vaste vragen). */
  terug1: `Er komt nog ${g(1)} vraag van net terug.`,
  terugN: (n: number) => `Nu komen er nog ${g(n)} vragen van net terug.`,
  extra1: `Nog ${g(1)} vraag om te oefenen.`,
  extraN: (n: number) => `We oefenen er nog ${g(n)} van net.`,
  terugLastig: "Die oefenen we een andere keer nog eens.",
  /** Het einde. */
  slot: "Nu weet je hoe een week in elkaar zit.",
  kaartTik: "Tik op de kaart.",
};

/** Aanmoediging bij het hulphandje (het kind moet tikken, niet nadenken; 14.35, geleerd bij Tellen). */
export const AANMOEDIG_DOEN = ["Je bent goed bezig.", "Jij kunt dit."];

/* ---------- reactie na de lof (BLIEPO-KARAKTER.md §4 Dagen en tijd, plus zinnen zonder "Ja") ---------- */

/** De robotzin (de laatste) hooguit 1 keer per les. Zin 0 en 1 beginnen met "Ja". */
export function tijdReactie(v: Vraag): Rijtje {
  const d = v.dag;
  if (v.soort === "eerste") return rij(["Ja, maandag is de eerste dag van de week.", "Ja, de week begint met maandag.", "Op maandag begint de school weer.", "Maandag hangt vooraan in de trein.", "Nagekeken: de week begint echt met maandag."], [4]);
  if (v.soort === "laatste") return rij(["Ja, zondag is de laatste dag van de week.", "Ja, de week eindigt met zondag.", "Na zondag begint er een nieuwe week.", "Zondag hangt achteraan in de trein.", "Nagekeken: zondag is echt de laatste dag."], [4]);
  if (v.soort === "weekendHoeveel") return rij([`Ja, het weekend heeft ${g(2)} dagen: zaterdag en zondag.`, "Ja, zaterdag en zondag zijn samen het weekend.", `Zaterdag en zondag: dat zijn ${g(2)} dagen.`, "Op zaterdag en zondag is er geen school.", `Nagekeken: zaterdag en zondag, ${g(2)} dagen.`], [4]);
  if (v.soort === "weekendWelke") return rij(["Ja, zaterdag en zondag zijn het weekend.", "Ja, op die dagen is er geen school.", "Zaterdag en zondag horen bij het weekend.", "Dan is er geen school.", "Nagekeken: dit is echt het weekend."], [4]);
  if (v.soort === "na")
    return d === 6
      ? rij(["Ja, na zondag begint de week weer met maandag.", "Ja, meteen na zondag komt maandag.", "Na de laatste dag begint de week opnieuw.", "Maandag komt direct na zondag.", "Nagekeken: na zondag komt echt maandag."], [4])
      : rij([`Ja, meteen na ${naam(d)} komt ${naam(na(d))}.`, `Ja, ${naam(na(d))} hangt achter ${naam(d)}.`, `${Naam(na(d))} komt direct na ${naam(d)}.`, `Na ${naam(d)} is het ${naam(na(d))}.`, `Nagekeken: na ${naam(d)} komt echt ${naam(na(d))}.`], [4]);
  return rij([`Ja, een week heeft ${g(7)} dagen.`, "Ja, van maandag tot en met zondag.", `Dat zijn ${g(7)} wagons, van maandag tot en met zondag.`, "Elke dag heeft een eigen wagon.", `Nagekeken: de week heeft echt ${g(7)} dagen.`], [4]);
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
  "voor-na-verwisseld": "koos bij \"meteen na\" de dag ervóór",
  schooldagen: "koos de schooldagen (5 dagen, of donderdag en vrijdag) in plaats van het weekend",
  "schooldag-erbij": "koos 1 dag van het weekend met een schooldag erbij (zondag en maandag)",
  "een-te-weinig": "koos een getal dat te klein is (1 dag weekend, 6 dagen in een week)",
  "een-te-veel": "koos een getal dat te groot is (8 dagen in een week)",
  onduidelijk: "niet duidelijk: geen reden verzonnen",
};

/** Wat een zin beweert over de keuzes (voor de verklapcontrole van het script, 15.17): welke keuzes erna nog kunnen. */
export type Bewering = { soort: "alleen-c" } | { soort: "groter-dan"; n: number } | { soort: "kleiner-dan"; n: number };

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
  /** Dezelfde denkfout 2 keer met een ander antwoord: komt in deze les niet voor (elke denkfout hoort bij 1 antwoord per vraag). */
  weer: string[];
  scherm: string;
  /** Rondje om de gekozen kaart (alleen bij een kaart; een getal is een knop bij Bliepo). */
  rondje: boolean;
  bewering: Bewering;
  /** Welke keuzes de eerste zin en de hint nog toelaten (voor de verklapcontrole van het script, 15.17). */
  over: string[];
};

const kies2 = <T,>(lijst: T[], nr: number) => lijst[nr % lijst.length];

const SCHERM = {
  kaart: "Bliepo's scherm 1,5 s rood (geen fout-geluidje); het vinkje gaat van de kaart; een rood rondje om de gekozen kaart zolang Bliepo hem noemt (nooit om het antwoord); dan de hint en het kind mag opnieuw kiezen (alle 3 kaarten blijven, geen pijl)",
  getal: "Bliepo's scherm 1,5 s rood (geen fout-geluidje); de knoppen weg; Bliepo zegt wat het kind koos (geen rondje: het antwoord is een knop, in beeld staat alleen de locomotief); dan komen dezelfde 3 knoppen terug met de hint (geen pijl)",
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

/** De fouttabel van 1 fout antwoord. `x` = de gekozen kaart (sleutel) of het gekozen getal. */
export function tijdFout(v: Vraag, x: string): Fout {
  const code = denkfoutVan(v, x);
  const denkfout = DENKFOUT_UITLEG[code];
  /* Een vraag die terugkomt krijgt de andere hint-versie (het kind hoort niet 2 keer dezelfde hint bij dezelfde vraag). */
  const nr = v.nr + (v.terug ? 1 : 0);
  const maak = (f: Omit<Fout, "code" | "denkfout" | "over" | "weer" | "scherm" | "rondje">): Fout => ({ ...f, code, denkfout, weer: [], scherm: v.invoer === "kaart" ? SCHERM.kaart : SCHERM.getal, rondje: v.invoer === "kaart", over: overNa(v, x, f.bewering) });
  const c = Number(x);

  /* Wat is de eerste dag van de week? */
  if (v.soort === "eerste") {
    const hint = kies2(["Zeg de dagen van de week op. Welke dag zeg je als eerste?", "Na het weekend begint een nieuwe week. Wat is de eerste dag van de week?"], nr);
    if (code === "eerste-laatste-verwisseld") return maak({ soort: code, eerste: "Je koos zondag. Dat is de laatste dag van de week.", hint, uitleg: "De eerste dag staat vooraan in de week, niet achteraan.", bewering: { soort: "alleen-c" } });
    return maak({ soort: code, eerste: `Je koos ${naam(c)}. Dat is niet de eerste dag.`, hint, uitleg: "De eerste dag hangt vooraan in de weektrein, vlak achter de locomotief.", bewering: { soort: "alleen-c" } });
  }

  /* Wat is de laatste dag van de week? */
  if (v.soort === "laatste") {
    const hint = kies2(["Zeg de dagen van de week op. Welke dag zeg je als laatste?", "Na de laatste dag begint een nieuwe week. Wat is de laatste dag van de week?"], nr);
    /* Niet "Na zaterdag komt nog een dag": dan blijft er maar 1 keuze over (15.17). */
    if (code === "dag-ernaast") return maak({ soort: code, eerste: "Je koos zaterdag. Die hoort bij het weekend, maar is niet de laatste dag.", hint, uitleg: "De laatste dag hangt helemaal achteraan in de weektrein.", bewering: { soort: "alleen-c" } });
    return maak({ soort: code, eerste: `Je koos ${naam(c)}. Dat is niet de laatste dag.`, hint, uitleg: "De laatste dag hangt helemaal achteraan in de weektrein.", bewering: { soort: "alleen-c" } });
  }

  /* In het weekend ga je niet naar school. Hoeveel dagen heeft het weekend? (1, 2, 5) */
  if (v.soort === "weekendHoeveel") {
    const hint = kies2(["Het weekend zijn de vrije dagen. Hoeveel dagen heeft het weekend?", "Denk aan de dagen waarop je vrij bent. Hoeveel dagen heeft het weekend?"], nr);
    if (code === "schooldagen") return maak({ soort: code, eerste: `Je koos ${g(5)}. Op zoveel dagen ga je naar school.`, hint, uitleg: "Het weekend zijn de vrije dagen aan het eind van de week.", bewering: { soort: "alleen-c" } });
    return maak({ soort: code, eerste: `Je koos ${g(c)}. Het weekend is langer dan dat.`, hint, uitleg: "Na vrijdag is er geen school meer, tot het maandag is.", bewering: { soort: "groter-dan", n: c } });
  }

  /* Op welke dagen is het weekend? (kaarten met 2 dagen) */
  if (v.soort === "weekendWelke") {
    const hint = kies2([`In het weekend ben je vrij. Welke kaart heeft ${g(2)} vrije dagen?`, "Het weekend komt aan het eind van de week. Op welke dagen is het weekend?"], nr);
    if (code === "schooldagen") return maak({ soort: code, eerste: `Je koos ${kaartNaam(x)}. Dat zijn schooldagen.`, hint, uitleg: "Het weekend zijn de vrije dagen aan het eind van de week.", bewering: { soort: "alleen-c" } });
    const school = dagenVan(x).find((d) => d < 5)!;
    return maak({ soort: code, eerste: `Je koos ${kaartNaam(x)}. Op ${naam(school)} ga je naar school.`, hint, uitleg: "Op allebei de dagen van het weekend ben je vrij.", bewering: { soort: "alleen-c" } });
  }

  /* Welke dag komt meteen na …? */
  if (v.soort === "na") {
    const d = v.dag;
    const hint =
      d === 6
        ? kies2(["Na zondag begint een nieuwe week. Welke dag komt dan?", "Na de laatste dag begint de week opnieuw. Welke dag komt meteen na zondag?"], nr)
        : kies2([`Zeg de dagen op, vanaf ${naam(d)}. Welke dag zeg je daarna?`, d === 0 ? "Begin bij maandag en zeg de dagen op. Welke dag zeg je daarna?" : `Zeg de dagen van de week op, vanaf maandag. Welke dag zeg je na ${naam(d)}?`], nr);
    if (code === "voor-na-verwisseld") return maak({ soort: code, eerste: `Je koos ${naam(c)}. Die komt vóór ${naam(d)}.`, hint, uitleg: "Meteen na is de dag erachter, niet de dag ervoor.", bewering: { soort: "alleen-c" } });
    return maak({ soort: code, eerste: `Je koos ${naam(c)}. Die komt niet meteen na ${naam(d)}.`, hint, uitleg: d === 6 ? "Na zondag begint de week opnieuw vooraan in de trein." : `Meteen na ${naam(d)} komt de dag die er direct achter hangt.`, bewering: { soort: "alleen-c" } });
  }

  /* Hoeveel dagen heeft een week? (6, 7, 8) */
  const hint = kies2(["Zeg de dagen op van maandag tot en met zondag. Hoeveel dagen zijn het?", "Denk aan alle dagen, van maandag tot en met zondag. Hoeveel dagen heeft een week?"], nr);
  if (code === "een-te-weinig") return maak({ soort: code, eerste: `Je koos ${g(c)}. Dat zijn te weinig dagen.`, hint, uitleg: "Elke dag van maandag tot en met zondag telt mee.", bewering: { soort: "groter-dan", n: c } });
  return maak({ soort: code, eerste: `Je koos ${g(c)}. Dat zijn te veel dagen.`, hint, uitleg: `Elke dag van de week telt maar ${g(1)} keer mee.`, bewering: { soort: "kleiner-dan", n: c } });
}

/** De fouttabel van een vraag: elk fout antwoord dat het kind kan kiezen. Sleutel = de kaart of het getal. */
export function foutenVan(v: Vraag): Record<string, Fout> {
  return Object.fromEntries(v.keuzes.filter((k) => k !== v.goed).map((k) => [k, tijdFout(v, k)]));
}
