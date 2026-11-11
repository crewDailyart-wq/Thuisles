/**
 * ALLE ZINNEN VAN BLIEPO in de gouden les Geld (squla-geld-geldmachine-1-gouden, "Munten en briefjes", 11 november 2026),
 * op één plek, met de FOUTTABEL. De les zelf (squla-geld-gouden.tsx) bevat geen eigen zinnen.
 *
 *   - De rijtjes (lof, momenten, naam, goed na een fout, einde, eerste zin als de denkfout niet duidelijk is, overgang)
 *     zijn dezelfde als in de andere gouden lessen (BLIEPO-KARAKTER.md). Hier alleen de reactie bij Geld
 *     (BLIEPO-KARAKTER.md §4 Geld, zin 36, 38 en 40), met zinnen zonder "Ja" voor na een lofzin met "Ja".
 *   - De inhoud (12 vragen + 3 die terugkomen, het geld en de keuzes) is die van squla-geld-geldmachine-1 "Munten en
 *     briefjes" (BOUWREGELS 15.22): 6 keer "Waar zie je …?" (3 kaartjes met elk 1 munt of briefje), 5 keer "Wat is dit?"
 *     (1 munt of briefje groot in beeld, 3 knoppen bij Bliepo) en 1 keer de zwevende munten (tik op alle munten van
 *     1 euro). De vraagzinnen zijn die van de oude les; alleen waar dat nodig was zijn ze verbeterd (KEUZES-VOOR-SARA.md,
 *     Ronde 34).
 *   - GEEN SYNTHESIS-LES: Synthesis heeft geen les over geld (KOPPELING.md §8). Het skelet is exact dat van de andere
 *     gouden lessen (laag 1: LESRECEPT.md en BLIEPO-KARAKTER.md). Alles wat per onderwerp anders is (de uitleg, de hulp in
 *     beeld, de denkfouten, de eerste zinnen, de hints en het samen voordoen) is "EIGEN INVULLING, NIET VAN SYNTHESIS"
 *     (BOUWREGELS 15.22 punt 5, 15.25).
 *
 * Leesbare versie: FOUTTABEL-squla-geld-geldmachine-1-gouden.md (maak hem opnieuw met
 * `npx tsx scripts/fouttabel-geld-gouden.ts`; dat script doet ook de reken-, verklap- en waarheidscontrole).
 *
 * Getalkleur (BOUWREGELS 2.1, 2.2, 14.22, 14.27): een getal dat naar geld in beeld verwijst heeft de kleur van dat geld
 * (munten geel, briefje van 5 grijs-wit, 10 rood, 20 blauw, 50 oranje, 100 groen). Het getal dat het kind moet ZOEKEN
 * (in de vraag en in de hint) is wit: in de kleur van het goede geld zou de kleur het antwoord verklappen (14.22).
 */

import type { GeldSoort } from "../vlakken/squla-geld-soorten";
import { isBriefje } from "../vlakken/squla-geld-soorten";
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

/* ---------- het geld: namen, getallen en kleuren ---------- */

export type Ding = GeldSoort | "knoop";

/** Het getal dat op het geld staat (50 cent: 50). */
export const getal = (g: GeldSoort) => ({ c50: 50, m1: 1, m2: 2, b5: 5, b10: 10, b20: 20, b50: 50, b100: 100 })[g];
export const eenheid = (g: GeldSoort) => (g === "c50" ? "cent" : "euro");
/** De kleur van het getal op het geld (zoals de oude les; ECB: 5 grijs, 10 rood, 20 blauw, 50 oranje, 100 groen). */
export const KLEUR: Record<GeldSoort, string> = { c50: "geel", m1: "geel", m2: "geel", b5: "wit", b10: "rood", b20: "blauw", b50: "oranje", b100: "groen" };
/** Een getal in de zin, in de kleur van het geld waar het naar verwijst. */
export const g = (n: number, k: string) => `{${n}:${k}}`;
const kn = (x: GeldSoort) => g(getal(x), KLEUR[x]);
/** Wit: het bedrag dat het kind moet zoeken (kleur zou het antwoord verklappen, 14.22). */
const wit = (x: GeldSoort) => g(getal(x), "wit");

const vorm = (x: GeldSoort) => (isBriefje(x) ? "briefje" : "munt");
/** "een munt van 1 euro", "een briefje van 10 euro" (getal in de kleur van het geld, of wit). */
export const een = (x: GeldSoort, k: "kleur" | "wit" = "kleur") => `een ${vorm(x)} van ${k === "wit" ? wit(x) : kn(x)} ${eenheid(x)}`;
/** "de munt van 1 euro", "het briefje van 10 euro". */
export const de = (x: GeldSoort, k: "kleur" | "wit" = "kleur") => `${isBriefje(x) ? "het" : "de"} ${vorm(x)} van ${k === "wit" ? wit(x) : kn(x)} ${eenheid(x)}`;
/** Het woord op een knop bij Bliepo (zonder kleurtekens): "1 euro", "50 cent", "knoop". */
export const knop = (x: Ding) => (x === "knoop" ? "knoop" : `${getal(x)} ${eenheid(x)}`);
/** Hetzelfde in een zin, wit (een keuze, geen geld in beeld): "1 euro", "een knoop". */
const knopZin = (x: Ding) => (x === "knoop" ? "een knoop" : `${wit(x)} ${eenheid(x)}`);
/** Hoe het geld eruitziet (waar, voor de waarheidscontrole: alleen dingen die op het plaatje te zien zijn). Wit: het geld
    ligt niet in beeld (het kind koos een knop). */
export const uiterlijk = (x: GeldSoort, k: "kleur" | "wit" = "kleur") => {
  const n = k === "wit" ? wit(x) : kn(x);
  return {
    m1: `De munt van ${n} euro is zilver in het midden.`,
    m2: `De munt van ${n} euro is goud in het midden.`,
    c50: `Op de munt van ${n} cent staat een ${n}.`,
    b5: `Het briefje van ${n} euro is grijs.`,
    b10: `Het briefje van ${n} euro is rood.`,
    b20: `Het briefje van ${n} euro is blauw.`,
    b50: `Het briefje van ${n} euro is oranje.`,
    b100: `Het briefje van ${n} euro is groen.`,
  }[x];
};
/** Wat waar is over het uiterlijk (voor het script): midden van munten, kleur van briefjes. */
export const FEIT = { midden: { m1: "zilver", m2: "goud", c50: "goud" } as Record<string, string>, kleur: { b5: "grijs", b10: "rood", b20: "blauw", b50: "oranje", b100: "groen" } as Record<string, string> };

/* ---------- de 12 vragen van squla-geld-geldmachine-1 (zelfde volgorde, zelfde geld, zelfde keuzes) ---------- */

/** "Waar zie je …?": 3 kaartjes met elk 1 munt of briefje; het kind tikt een kaartje aan (vinkje) en tikt op het vinkje. */
export type Waarvraag = { nr: number; id: string; soort: "waar"; doel: GeldSoort; keuzes: GeldSoort[]; begin: string };
/** "Wat is dit?": 1 munt of briefje groot in beeld; 3 knoppen bij Bliepo (woorden: "10 euro", "knoop"). */
export type Watvraag = { nr: number; id: string; soort: "wat"; ding: GeldSoort; opties: Ding[]; vraag: string[] };
/** De zwevende munten: tik op alle munten van 1 euro (een opdracht). */
export type Bellenvraag = { nr: number; id: string; soort: "bellen"; zoek: GeldSoort; bellen: Ding[] };
export type Vraag = Waarvraag | Watvraag | Bellenvraag;

const waar = (nr: number, doel: GeldSoort, keuzes: GeldSoort[], begin: string): Waarvraag => ({ nr, id: `vraag${nr}-waar-${doel}`, soort: "waar", doel, keuzes, begin });
const wat = (nr: number, ding: GeldSoort, opties: Ding[], vraag: string[]): Watvraag => ({ nr, id: `vraag${nr}-wat-${ding}`, soort: "wat", ding, opties, vraag });
/** "Is het 1 euro, een knoop of 2 euro?" (de keuzes in de volgorde van de oude les; het getal wit: het is een keuze). */
const isHet = (o: Ding[]) => `Is het ${o.slice(0, -1).map(knopZin).join(", ")} of ${knopZin(o[o.length - 1])}?`;

export const VRAGEN: Vraag[] = [
  waar(1, "m1", ["m2", "b5", "m1"], "Hier ligt wat geld."),
  waar(2, "m2", ["m1", "m2", "b20"], "Kijk, nog meer geld."),
  waar(3, "b5", ["b50", "c50", "b5"], "Kijk, weer ander geld."),
  /* Oude les: alleen "Hoeveel euro is dit?" (zonder de keuzes in de vraag). */
  wat(4, "b10", ["b100", "m1", "b10"], ["Hoeveel euro is dit?"]),
  waar(5, "b20", ["b10", "m2", "b20"], "Kijk, weer ander geld."),
  /* Oude les: "Kijk goed naar deze munt. Wat is het?" Het woord "munt" sloot de knoop al uit (KEUZES Ronde 34). */
  wat(6, "m1", ["m1", "knoop", "m2"], ["Kijk goed.", `Wat is dit? ${isHet(["m1", "knoop", "m2"])}`]),
  wat(7, "b5", ["b5", "b50", "c50"], ["Kijk nu naar dit geld.", `Wat is het? ${isHet(["b5", "b50", "c50"])}`]),
  { nr: 8, id: "vraag8-bellen-m1", soort: "bellen", zoek: "m1", bellen: ["m1", "m2", "m1", "c50", "knoop", "m1"] },
  waar(9, "b10", ["b20", "b100", "b10"], "Hier liggen weer {3:wit} briefjes."),
  wat(10, "b20", ["b20", "b10", "b50"], ["Kijk, nog een briefje.", `Wat is het? ${isHet(["b20", "b10", "b50"])}`]),
  wat(11, "m2", ["m1", "m2", "c50"], ["Kijk, nog een munt.", `Wat is het? ${isHet(["m1", "m2", "c50"])}`]),
  waar(12, "b5", ["b10", "b5", "b20"], "Hier liggen nog {3:wit} briefjes."),
];

/** Welke vragen terugkomen als het kind niets miste (de reserve van de oude les: vraag 1, 4 en 5). */
export const RESERVE = [0, 3, 4];

/** Het goede antwoord als tekst (waar: de soort; wat: het woord op de knop; bellen: "klaar"). */
export const goedVan = (v: Vraag) => (v.soort === "waar" ? v.doel : v.soort === "wat" ? knop(v.ding) : "klaar");
/** Het geld in het tafereel van de vraag (voor het vooraf laden). */
export const GELD_VOORAF: GeldSoort[] = ["m1", "m2", "c50", "b5", "b10", "b20", "b50", "b100"];

/* ---------- vaste zinnen van het verloop (laag 1 van de gouden lessen; eigen woorden) ---------- */

export const ZIN = {
  /** Het begin (geen startvraag: er is geen Synthesis-draaiboek met een startvraag). Het uitlegdeel is de zin die Sara
      voor deze geldles goedkeurde (BOUWREGELS 4.4), zonder de vraag erachter. Samen met de groet 1 stuk. */
  /* Ingekort (KEUZES Ronde 34): met "en kiest het juiste bedrag" erbij was het stuk te lang voor het vaste tekstvak en
     werd Bliepo kleiner (15.30, zoals bij Splitsen). */
  start: "In deze les ontdek je hoeveel munten en briefjes waard zijn. Je kijkt naar het getal op het geld.",
  /** Waar zie je …? De eerste keer met wat het kind doet (tikken), daarna alleen de vraag. */
  waarVraag: (v: Waarvraag, eerste: boolean) => [v.begin, `Waar zie je ${een(v.doel, "wit")}?`, ...(eerste ? ["Tik erop."] : [])],
  /** Wat is dit? (de vraag van de oude les). */
  watVraag: (v: Watvraag) => v.vraag,
  /** Na de hint van de 1e fout: de vraag kort, zodat het kind weet waar het over gaat (F1; een nieuwe poging mag de
      vraag opnieuw stellen, 3.23; de vraag komt maar 1 keer vóór deze poging). */
  opnieuwWaar: (v: Waarvraag) => `Waar zie je ${een(v.doel, "wit")}?`,
  opnieuwWat: "Wat is het?",
  /** De zwevende munten: eerst wat er gebeurt (1 stuk), dan de opdracht. */
  /* Het aantal (3) verwijst naar de munten: in hun kleur (14.20, keuring Geld); het gezochte bedrag (1) blijft wit. */
  bellenIntro: (v: Bellenvraag) => `Oei, het geld zweeft! Er zweven ${g(v.bellen.filter((b) => b === v.zoek).length, KLEUR[v.zoek])} munten van ${wit(v.zoek)} euro.`,
  bellenOpdracht: (v: Bellenvraag) => `Tik op alle munten van ${wit(v.zoek)} euro.`,
  bellenHand: (v: Bellenvraag) => `Tik op een munt van ${wit(v.zoek)} euro.`,
  /** 2e fout: Bliepo doet het samen voor (eigen invulling, niet van Synthesis). 3 versies, zodat het niet steeds hetzelfde is. */
  samen: ["Kom, we kijken samen.", "We zoeken het samen.", "Kom, samen lukt het."],
  /** Waar zie je …: het rondje om het goede kaartje; Bliepo zegt wat het is en waarom; het kind tikt het aan. */
  samenWaar: (d: GeldSoort) => (isBriefje(d) ? `Hier is ${de(d)}. Het is een rechthoek, met ${kn(d)} erop.` : `Hier is ${de(d)}. Hij is rond, met een ${kn(d)} erop.`),
  samenWaarJij: (d: GeldSoort) => `Tik jij op ${de(d)}?`,
  samenWaarHand: "Tik op het geld in het rondje.",
  samenWaarKlaar: (d: GeldSoort) => `Ja, dat is ${de(d)}.`,
  samenWaarZelf: (d: GeldSoort) => `Kijk, hier is ${de(d)}.`,
  /** Wat is dit?: het rondje om het geld; eerst de vorm, dan het getal; het kind tikt het geld aan. */
  samenWatVorm: (d: GeldSoort) => (isBriefje(d) ? "Dit geld is een rechthoek van papier. Het is een briefje." : "Dit geld is rond. Het is een munt."),
  samenWatGetal: (d: GeldSoort) => `Er staat ${isBriefje(d) ? "" : "een "}${kn(d)} op. Het is ${de(d)}.`,
  samenWatJij: (d: GeldSoort) => `Tik jij op ${de(d)}?`,
  samenWatHand: (d: GeldSoort) => `Tik op ${isBriefje(d) ? "het briefje" : "de munt"}.`,
  samenWatKlaar: (d: GeldSoort) => `Ja, dit is ${kn(d)} euro.`,
  samenWatZelf: (d: GeldSoort) => `Kijk, dit is ${kn(d)} euro.`,
  /** De zwevende munten: Bliepo wijst de munten van 1 euro aan die nog niet gevonden zijn; het kind tikt de laatste. */
  samenBelEen: "Hier is een munt van {1:geel} euro.",
  samenBelNog: "En hier nog een.",
  samenBelJij: "Er is er nog {1:geel}. Tik jij erop?",
  samenBelHand: "Tik op de munt in het rondje.",
  samenBelKlaar: (n: number) => `Ja, nu heb je alle ${g(n, "geel")} munten van {1:geel} euro.`,
  samenBelZelf: "Kijk, dit is de laatste munt van {1:geel} euro.",
  /** Hetzelfde foute antwoord 2 keer: niet 2 keer dezelfde eerste zin (geleerd bij Tellen). */
  weerGekozen: (x: Ding, v: Vraag) => (v.soort === "wat" ? `Je koos weer ${x === "knoop" ? "de knoop" : `${wit(x as GeldSoort)} ${eenheid(x as GeldSoort)}`}.` : v.soort === "bellen" ? `Je tikte weer op ${x === "knoop" ? "de knoop" : de(x)}.` : `Je koos weer ${x === "knoop" ? "de knoop" : de(x)}.`),
  /** De vragen die terugkomen (de oude les: eerst wat niet meteen goed was, aangevuld met vaste vragen). */
  terug1: "Er komt nog {1:wit} vraag van net terug.",
  terugN: (n: number) => `Nu komen er nog ${g(n, "wit")} vragen van net terug.`,
  extra1: "Nog {1:wit} vraag om te oefenen.",
  extraN: (n: number) => `We oefenen er nog ${g(n, "wit")} van net.`,
  terugLastig: "Die oefenen we een andere keer nog eens.",
  /** Het einde. */
  slot: "Nu ken je de munten en de briefjes.",
  kaartTik: "Tik op de kaart.",
};

/** Aanmoediging bij het hulphandje (het kind moet tikken, niet nadenken; 14.35, geleerd bij Tellen). */
export const AANMOEDIG_TIKKEN = ["Je bent goed bezig.", "Jij kunt dit."];

/* ---------- reactie na de lof (BLIEPO-KARAKTER.md §4 Geld, zin 36, 38, 40, plus zinnen zonder "Ja") ---------- */

/** De robotzin (de laatste) hooguit 1 keer per les. Zin 0 en 1 beginnen met "Ja". */
export function geldReactie(v: Vraag): Rijtje {
  if (v.soort === "bellen") {
    const n = g(v.bellen.filter((b) => b === v.zoek).length, KLEUR[v.zoek]);
    return rij([`Ja, je vond ze alle ${n}.`, `Ja, dat zijn alle munten van ${kn(v.zoek)} euro.`, `Alle ${n} munten van ${kn(v.zoek)} euro gevonden.`, "En je tikte op geen andere munt.", `Nagekeken: alle ${n} zijn ${kn(v.zoek)} euro.`], [4]);
  }
  const d = v.soort === "waar" ? v.doel : v.ding;
  if (isBriefje(d)) return rij([`Ja, dit briefje is ${kn(d)} euro.`, `Ja, er staat ${kn(d)} op.`, `Dit is het briefje van ${kn(d)} euro.`, `${kn(d)} euro, op een rechthoek van papier.`, `Nagekeken: het is precies ${kn(d)} euro.`], [4]);
  return rij([`Ja, deze munt is ${kn(d)} euro waard.`, `Ja, er staat een ${kn(d)} op.`, `Dit is de munt van ${kn(d)} euro.`, `${kn(d)} euro, en hij is rond.`, `Nagekeken: het is precies ${kn(d)} euro.`], [4]);
}
export const REACTIE_JA = [0, 1];
export const REACTIE_ROBOT = 4;

/* ---------- denkfouten (eigen invulling, niet van Synthesis; namen voor de voortgang) ---------- */

export const DENKFOUTEN = ["munt-briefje-verwisseld", "zelfde-cijfer", "ander-getal", "geen-geld", "onduidelijk"] as const;
export type Denkfoutnaam = (typeof DENKFOUTEN)[number];

export const DENKFOUT_UITLEG: Record<Denkfoutnaam, string> = {
  "munt-briefje-verwisseld": "koos een briefje terwijl een munt gevraagd werd, of een munt terwijl een briefje gevraagd werd (niet op de vorm gelet: rond of rechthoek)",
  "zelfde-cijfer": "koos geld dat met hetzelfde cijfer begint, maar een ander bedrag is (5 en 50, 10 en 100): alleen naar het eerste cijfer gekeken",
  "ander-getal": "koos geld van dezelfde vorm met een ander getal (het getal niet goed gelezen, of 1 en 2 euro door elkaar)",
  "geen-geld": "koos de knoop: geen geld",
  onduidelijk: "niet duidelijk: geen reden verzonnen",
};

export type Fout = {
  code: Denkfoutnaam;
  /** Welke uitleg bij de 2e fout hoort (dezelfde soort 2 keer = "weer"). */
  soort: string;
  denkfout: string;
  /** Bliepo's eerste zin (leeg bij "onduidelijk": dan een zin uit BLIEPO-KARAKTER.md §10). */
  eerste: string;
  hint: string;
  /** Uitleg na de 2e fout (daarna meteen samen voordoen; dan mag het antwoord in beeld). */
  uitleg: string;
  /** Dezelfde denkfout 2 keer (en de 1e keer zei Bliepo al wat er mis was): anders uitleggen. */
  weer: string[];
  scherm: string;
  /** Rondje om het gekozen geld bij de eerste zin (waar en bellen), of om het geld in beeld bij de hint (wat). */
  rondje: "gekozen" | "geld" | null;
  /** Welke keuzes de eerste zin en de hint nog toelaten (voor de verklapcontrole van het script, 15.17). */
  over: string[];
};

/** Welke denkfout bij een fout antwoord hoort (vaste regel, zodat het script elke combinatie kan nalopen). */
export function denkfoutVan(doel: GeldSoort, x: Ding): Denkfoutnaam {
  if (x === "knoop") return "geen-geld";
  if (isBriefje(doel) !== isBriefje(x)) return "munt-briefje-verwisseld";
  const a = String(getal(doel));
  const b = String(getal(x));
  if (eenheid(doel) === eenheid(x) && a !== b && (b.startsWith(a) || a.startsWith(b))) return "zelfde-cijfer";
  return "ander-getal";
}

/* 2 à 3 versies per hint, zodat het kind niet steeds dezelfde zin hoort (LESRECEPT, geleerd bij Tellen). */
const HINT = {
  zoekMunt: ["We zoeken een munt. Een munt is rond.", "Een munt is rond en van metaal.", "Kijk naar de vorm. Een munt is rond."],
  zoekBriefje: ["We zoeken een briefje. Een briefje is een rechthoek.", "Een briefje is van papier, met 4 hoeken.", "Kijk naar de vorm. Een briefje is een rechthoek."],
  getalMunten: ["Kijk naar het getal op elke munt.", "Het getal op een munt zegt hoeveel hij waard is.", "Lees het getal op de munten."],
  getalBriefjes: ["Kijk naar het getal op elk briefje.", "Het getal op een briefje zegt hoeveel euro het is.", "Lees het getal op de briefjes."],
  heelGetal: ["Lees het hele getal op elk briefje.", "Kijk naar alle cijfers van het getal."],
  /* Bij "Wat is dit?" (er is maar 1 geld in beeld; het rondje staat erom). */
  ditBriefje: ["Dit geld is een rechthoek van papier: een briefje. Lees het getal erop.", "Kijk naar de vorm: dit is een briefje. Lees het getal erop."],
  heelGetalDit: ["Lees het hele getal op dit briefje.", "Kijk naar alle cijfers op dit briefje."],
  middenDit: ["Kijk naar het midden van deze munt. Lees ook het getal.", "Lees het getal op deze munt."],
  kleurDit: ["Kijk naar de kleur van dit briefje. Lees ook het getal.", "Lees het getal op dit briefje."],
  getalDitMunt: ["Lees het getal op deze munt.", "Kijk welk getal er op deze munt staat."],
  geldDit: ["Dit is geld: een munt. Lees het getal erop."],
  /* De zwevende munten (een opdracht: de hint is de nieuwe opdrachtzin). */
  bellen: (z: GeldSoort) => [`Tik alleen op munten met een ${wit(z)} erop.`, `Zoek de munten met een ${wit(z)}. Die zijn zilver in het midden.`],
};
/** Dezelfde denkfout 2 keer: op een andere manier uitleggen dan UITLEG (15.9 punt 2), zonder opdracht. */
const ANDERS = {
  munten: `De munt van ${kn("m1")} euro is zilver in het midden, die van ${kn("m2")} euro is goud.`,
  briefjes: "Elk briefje heeft een eigen kleur en een eigen getal.",
};
const UITLEG = {
  munt: ["Een munt is rond. Een briefje is een rechthoek van papier.", "Munten zijn rond en van metaal. Briefjes zijn van papier."],
  briefje: ["Een briefje is een rechthoek van papier. Een munt is rond.", "Briefjes zijn van papier. Munten zijn rond en van metaal."],
  getal: ["Het getal op het geld zegt hoeveel het waard is.", "Elk geld heeft een eigen getal."],
  cijfer: ["Een {0:wit} erachter maakt het getal groter.", "Elk cijfer hoort bij het getal, ook de {0:wit}."],
  knoop: ["Een knoop is geen geld."],
};
const SCHERM = {
  waar: "Bliepo's scherm 1,5 s rood (geen fout-geluidje); het vinkje gaat van het kaartje; een rood rondje om het gekozen geld zolang Bliepo het noemt (nooit om het antwoord); dan de hint en het kind mag opnieuw kiezen (alle 3 kaartjes blijven, geen pijl)",
  wat: "Bliepo's scherm 1,5 s rood (geen fout-geluidje); de knoppen weg; Bliepo zegt wat het kind koos; dan komen dezelfde 3 knoppen terug met de hint, met een rood rondje om het geld in beeld (het enige geld; het antwoord is een knop)",
  bellen: "Bliepo's scherm 1,5 s rood (geen fout-geluidje); een rood rondje om de munt of knoop die het kind aantikte zolang Bliepo hem noemt; de gevonden munten houden hun vinkje; de hint is de nieuwe opdrachtzin (geen pijl)",
};

const kies3 = <T,>(lijst: T[], nr: number) => lijst[nr % lijst.length];

/** De fouttabel van 1 fout antwoord. `x` = het gekozen geld (of de knoop). */
export function geldFout(v: Vraag, x: Ding): Fout {
  const doel = v.soort === "waar" ? v.doel : v.soort === "wat" ? v.ding : v.zoek;
  const code = denkfoutVan(doel, x);
  const denkfout = DENKFOUT_UITLEG[code];
  const xs = x as GeldSoort;
  const andere = (v.soort === "waar" ? v.keuzes : v.soort === "wat" ? v.opties : v.bellen).filter((k) => k !== x).map(String);
  /* De zwevende munten: een opdracht met tikken. */
  if (v.soort === "bellen") {
    const hint = kies3(HINT.bellen(doel), v.nr);
    if (code === "geen-geld")
      return { code, soort: code, denkfout, eerste: "Je tikte op een knoop. Met een knoop kun je niet betalen.", hint, uitleg: UITLEG.knoop[0], weer: ["Je tikte weer op de knoop.", "Een knoop is geen geld."], scherm: SCHERM.bellen, rondje: "gekozen", over: andere };
    return { code, soort: code, denkfout, eerste: `Je tikte op ${de(xs)}.`, hint, uitleg: kies3(UITLEG.getal, v.nr), weer: ["Je tikte weer op een andere munt.", `Alleen een munt met een ${wit(doel)} is ${wit(doel)} euro.`], scherm: SCHERM.bellen, rondje: "gekozen", over: andere };
  }
  /* Wat is dit? (knoppen bij Bliepo; 1 geld in beeld). */
  if (v.soort === "wat") {
    if (code === "geen-geld") return { code, soort: code, denkfout, eerste: "Je koos een knoop. Een knoop heeft gaatjes.", hint: kies3(HINT.geldDit, v.nr), uitleg: UITLEG.knoop[0], weer: [], scherm: SCHERM.wat, rondje: "geld", over: andere };
    if (code === "munt-briefje-verwisseld") {
      const z = isBriefje(xs) ? "Dat is een briefje." : "Dat is een munt.";
      return { code, soort: `${code}-${vorm(doel)}`, denkfout, eerste: `Je koos ${knopZin(xs)}. ${z}`, hint: kies3(isBriefje(doel) ? HINT.ditBriefje : HINT.getalDitMunt, v.nr), uitleg: kies3(isBriefje(doel) ? UITLEG.briefje : UITLEG.munt, v.nr), weer: [`Je koos weer een ${vorm(xs)}.`, isBriefje(doel) ? "Dit geld is een rechthoek, geen rondje." : "Dit geld is rond, geen rechthoek."], scherm: SCHERM.wat, rondje: "geld", over: andere };
    }
    if (code === "zelfde-cijfer")
      return { code, soort: code, denkfout, eerste: `Je koos ${knopZin(xs)}. Op ${een(xs, "wit")} staan ${g(String(getal(xs)).length, "wit")} cijfers.`, hint: kies3(HINT.heelGetalDit, v.nr), uitleg: kies3(UITLEG.cijfer, v.nr), weer: ["Je keek weer alleen naar het eerste cijfer.", "Ook de {0:wit} hoort bij het getal."], scherm: SCHERM.wat, rondje: "geld", over: andere };
    /* ander-getal: wat waar is over het gekozen geld (kleur of midden), zonder het goede te noemen. */
    return { code, soort: code, denkfout, eerste: `Je koos ${knopZin(xs)}. ${uiterlijk(xs, "wit")}`, hint: kies3(isBriefje(doel) ? HINT.kleurDit : xs === "c50" ? HINT.getalDitMunt : HINT.middenDit, v.nr), uitleg: kies3(UITLEG.getal, v.nr), weer: [`Je koos weer een ${vorm(xs)} met een ander getal.`, isBriefje(doel) ? ANDERS.briefjes : ANDERS.munten], scherm: SCHERM.wat, rondje: "geld", over: andere };
  }
  /* Waar zie je …? (3 kaartjes in beeld; het kind koos er een met een vinkje). */
  if (code === "munt-briefje-verwisseld")
    return { code, soort: `${code}-${vorm(doel)}`, denkfout, eerste: `Je koos ${een(xs)}. Dat is geen ${vorm(doel)}.`, hint: kies3(isBriefje(doel) ? HINT.zoekBriefje : HINT.zoekMunt, v.nr), uitleg: kies3(isBriefje(doel) ? UITLEG.briefje : UITLEG.munt, v.nr), weer: [`Je koos weer een ${vorm(xs)}.`, isBriefje(doel) ? "Briefjes zijn rechthoeken, munten niet." : "Munten zijn rond, briefjes niet."], scherm: SCHERM.waar, rondje: "gekozen", over: andere };
  if (code === "zelfde-cijfer")
    return { code, soort: code, denkfout, eerste: `Je koos ${de(xs)}. Op dat ${vorm(xs)} staan ${g(String(getal(xs)).length, "wit")} cijfers.`, hint: kies3(HINT.heelGetal, v.nr), uitleg: kies3(UITLEG.cijfer, v.nr), weer: ["Je keek weer alleen naar het eerste cijfer.", "Ook de {0:wit} hoort bij het getal."], scherm: SCHERM.waar, rondje: "gekozen", over: andere };
  return {
    code,
    soort: code,
    denkfout,
    eerste: `Je koos ${de(xs)}. Daar staat ${isBriefje(xs) || getal(xs) > 9 ? "" : "een "}${kn(xs)} op.`,
    hint: kies3(isBriefje(doel) ? HINT.getalBriefjes : HINT.getalMunten, v.nr),
    uitleg: kies3(UITLEG.getal, v.nr),
    weer: [`Je koos weer een ${vorm(xs)} met een ander getal.`, isBriefje(doel) ? ANDERS.briefjes : ANDERS.munten],
    scherm: SCHERM.waar,
    rondje: "gekozen",
    over: andere,
  };
}

/** De fouttabel van een vraag: elk fout antwoord (bij de zwevende munten: elke munt of knoop die niet goed is). */
export function foutenVan(v: Vraag): Record<string, Fout> {
  if (v.soort === "waar") return Object.fromEntries(v.keuzes.filter((k) => k !== v.doel).map((k) => [k, geldFout(v, k)]));
  if (v.soort === "wat") return Object.fromEntries(v.opties.filter((k) => k !== v.ding).map((k) => [knop(k), geldFout(v, k)]));
  return Object.fromEntries([...new Set(v.bellen.filter((k) => k !== v.zoek))].map((k) => [k, geldFout(v, k)]));
}

/** Het woord bij een knop terug naar het geld ("10 euro" → b10). */
export function dingVanKnop(v: Watvraag, woord: string): Ding | null {
  return v.opties.find((o) => knop(o) === woord) ?? null;
}
