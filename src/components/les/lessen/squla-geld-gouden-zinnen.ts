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
 * WARME ZINNEN IN VARIANTEN (Sara, 18 november 2026; zelfde aanpak als de proefles Tellen en de lessen Splitsen,
 * Plussommen, Minsommen, Meer-minder, Huisnummers en Meten). Waar een zin in de les terugkomt, staat hier een rijtje; de
 * les kiest met de gedeelde kiezer (nooit-dubbel.ts): nooit 2 keer achter elkaar dezelfde zin, ook niet over vragen heen.
 * Een getal klinkt nooit 2 keer in 1 stuk. Oud naast nieuw: WIJZIGINGEN-ZINNEN-GELD.md.
 *
 * Getalkleur (BOUWREGELS 2.1, 2.2, 14.22, 14.27): een getal dat naar geld in beeld verwijst heeft de kleur van dat geld
 * (munten geel, briefje van 5 grijs-wit, 10 rood, 20 blauw, 50 oranje, 100 groen). Het getal dat het kind moet ZOEKEN
 * (in de vraag en in de hint) is wit: in de kleur van het goede geld zou de kleur het antwoord verklappen (14.22).
 */

import type { GeldSoort } from "../vlakken/squla-geld-soorten";
import { isBriefje } from "../vlakken/squla-geld-soorten";
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

/* ---------- hulp voor de varianten (zuiver; de les en het fouttabel-script gebruiken precies dit) ---------- */

/** Zonder kleurcode: {12:wit} wordt 12. */
export const kaal = (z: string) => z.replace(/\{([^}:]+):[a-zA-Z]+\}/g, "$1");
/** De getallen in een zin. */
export const getallenIn = (z: string) => (kaal(z).match(/\d+/g) ?? []).map(Number);
/** Noemen 2 zinnen hetzelfde getal? (Sara, 18 nov 2026: een getal klinkt nooit 2 keer vlak achter elkaar.) */
export const deeltGetal = (a: string, b: string) => getallenIn(a).some((n) => getallenIn(b).includes(n));
/** Past zin `z` achter de zinnen `eerder`: geen getal en geen stuk van 4 woorden dat er net al was. */
export const pastNa =
  (...eerder: string[]) =>
  (z: string) =>
    eerder.every((a) => !deeltGetal(a, z) && !deeltStuk(a, z, 4));
/** Woorden die per vraag wisselen: "Je koos weer een munt." en "Je koos weer een briefje." tellen als dezelfde zin. */
export const WISSEL = ["munt", "briefje", "munten", "briefjes", "euro", "cent", "grijs", "rood", "blauw", "oranje", "groen", "zilver", "goud"];
/**
 * Zo lang mag 1 stuk tekst van Bliepo hooguit zijn (tekens, zonder kleurcodes), anders past het niet in het vaste
 * tekstvak (BOUWREGELS 15.30). Een harde eis: wat te lang is gaat vooraf uit de lijst, niet als wens aan de kiezer.
 */
export const MAX_STUK = 123;
const past = (...delen: string[]) => kaal(delen.filter(Boolean).join(" ")).length <= MAX_STUK;

const ditVorm = (x: GeldSoort) => (isBriefje(x) ? "dit briefje" : "deze munt");
const deVorm = (x: GeldSoort) => (isBriefje(x) ? "het briefje" : "de munt");
const hijHet = (x: GeldSoort) => (isBriefje(x) ? "het" : "hij");
const Knop = (x: Ding) => (x === "knoop" ? "Een knoop" : `${wit(x)} ${eenheid(x)}`);
/** Wat waar is over geld dat NIET in beeld ligt (het kind koos een knop): "Die munt is goud in het midden." */
export const dieIs = (x: GeldSoort) =>
  ({
    m1: "Die munt is zilver in het midden.",
    m2: "Die munt is goud in het midden.",
    c50: "Die munt is helemaal goud.",
    b5: "Dat briefje is grijs.",
    b10: "Dat briefje is rood.",
    b20: "Dat briefje is blauw.",
    b50: "Dat briefje is oranje.",
    b100: "Dat briefje is groen.",
  })[x];
/** Wat waar is over het uiterlijk (voor het script): midden van munten, kleur van briefjes. */
export const FEIT = { midden: { m1: "zilver", m2: "goud", c50: "goud" } as Record<string, string>, kleur: { b5: "grijs", b10: "rood", b20: "blauw", b50: "oranje", b100: "groen" } as Record<string, string> };

/* ---------- vaste zinnen van het verloop (laag 1 van de gouden lessen; eigen woorden) ---------- */

export const ZIN = {
  /** Het begin (geen startvraag: er is geen Synthesis-draaiboek met een startvraag). De eerste versie is de zin die Sara
      voor deze geldles goedkeurde (BOUWREGELS 4.4), zonder de vraag erachter. Samen met de groet 1 stuk. */
  /* Ingekort (KEUZES Ronde 34): met "en kiest het juiste bedrag" erbij was het stuk te lang voor het vaste tekstvak en
     werd Bliepo kleiner (15.30, zoals bij Splitsen). Geen versie is langer dan de eerste. */
  start: [
    "In deze les ontdek je hoeveel munten en briefjes waard zijn. Je kijkt naar het getal op het geld.",
    "Vandaag kijken we naar munten en briefjes. Het getal op het geld zegt hoeveel het waard is.",
    "We gaan samen geld bekijken: munten en briefjes. Op het geld staat een getal.",
  ],
  /** Waar zie je …? De eerste keer met wat het kind doet (tikken), daarna alleen de vraag. */
  waarVraag: (v: Waarvraag, eerste: boolean) => [v.begin, `Waar zie je ${een(v.doel, "wit")}?`, ...(eerste ? ["Tik erop."] : [])],
  /** Wat is dit? (de vraag van de oude les). */
  watVraag: (v: Watvraag) => v.vraag,
  /** Na de hint van de 1e keer: de vraag kort, zodat het kind weet wat het doet (F1, F16; een nieuwe poging mag de vraag
      opnieuw stellen, 3.23; de vraag komt maar 1 keer vóór deze poging). Elke versie is een vraag of een opdracht. */
  opnieuwWaar: (v: Waarvraag) => [`Waar zie je ${een(v.doel, "wit")}?`, `Waar ligt ${de(v.doel, "wit")}? Tik erop.`, `Zoek nog eens ${de(v.doel, "wit")}. Tik erop.`],
  /** Vraag 4 vraagt "Hoeveel euro is dit?"; de andere vragen "Wat is het?". Dezelfde vraag houdt dezelfde woorden (3.11). */
  opnieuwWat: (v: Watvraag) => (v.vraag.some((z) => /^Wat is/.test(z)) ? ["Wat is het?", "Wat is het, denk je?", "Kies nog een keer. Wat is het?"] : ["Hoeveel euro is dit?", "Hoeveel euro is dit, denk je?", "Kies nog een keer. Hoeveel euro is dit?"]),
  /** De zwevende munten: eerst wat er gebeurt (1 stuk), dan de opdracht. */
  /* Het aantal (3) verwijst naar de munten: in hun kleur (14.20, keuring Geld); het gezochte bedrag (1) blijft wit. */
  bellenIntro: (v: Bellenvraag) => {
    const n = g(v.bellen.filter((b) => b === v.zoek).length, KLEUR[v.zoek]);
    return [`Oei, het geld zweeft! Er zweven ${n} munten van ${wit(v.zoek)} euro.`, `Oei, kijk nou! Het geld zweeft. Er zijn ${n} munten van ${wit(v.zoek)} euro bij.`];
  },
  bellenOpdracht: (v: Bellenvraag) => [`Tik op alle munten van ${wit(v.zoek)} euro.`, `Zoek ze allemaal. Tik op elke munt van ${wit(v.zoek)} euro.`],
  bellenHand: (v: Bellenvraag) => [`Tik op een munt van ${wit(v.zoek)} euro.`, `Tik maar op een munt van ${wit(v.zoek)} euro.`],
  /** 2e keer mis: Bliepo doet het samen voor (eigen invulling, niet van Synthesis). "Geeft niks" zegt Synthesis hier ook. */
  samen: (v: Vraag) =>
    v.soort === "wat"
      ? ["Kom, we kijken samen.", "Weet je wat? We kijken samen naar het geld.", "Geeft niks. We kijken samen.", "Ik help je even. We lezen het getal samen.", "Kom, samen lukt het."]
      : ["Kom, we kijken samen.", "Weet je wat? We zoeken het samen.", "Geeft niks. We zoeken het samen.", "Ik help je even. We kijken samen.", "Kom, samen lukt het."],
  /** Waar zie je …: het rondje om het goede kaartje; Bliepo zegt wat het is en waarom; het kind tikt het aan. Het getal
      klinkt 1 keer per stuk. */
  samenWaar: (d: GeldSoort) =>
    isBriefje(d)
      ? [`Hier is ${de(d)}. Het is van papier, en het getal staat erop.`, `Kijk, dit briefje is een rechthoek. Er staat ${kn(d)} op.`, `Hier ligt ${de(d)}. Kijk maar naar het getal.`]
      : [`Hier is ${de(d)}. Hij is rond, en het getal staat erop.`, `Kijk, deze munt is rond. Er staat een ${kn(d)} op.`, `Hier ligt ${de(d)}. Kijk maar naar het getal.`],
  samenWaarJij: (d: GeldSoort) => ["Tik jij op het geld in het rondje?", `Nu jij! Tik op ${deVorm(d)} in het rondje.`],
  samenWaarHand: ["Tik op het geld in het rondje.", "Tik maar op het geld in het rondje."],
  samenWaarKlaar: (d: GeldSoort) => [`Ja, dat is ${de(d)}.`, `Goed zo! Dat is ${de(d)}.`, `Precies, daar ligt ${de(d)}.`],
  /* Na het vangnet (Bliepo deed de stap zelf): "Kijk, …", nooit "Ja" alsof het kind het deed (keuring Meer-minder). */
  samenWaarZelf: (d: GeldSoort) => [`Kijk, hier is ${de(d)}.`, `Kijk, ik tik ${isBriefje(d) ? "het" : "hem"} aan. Dit is ${de(d)}.`],
  /** Wat is dit?: het rondje om het geld; eerst de vorm, dan het getal; het kind tikt het geld aan. */
  samenWatVorm: (d: GeldSoort) =>
    isBriefje(d)
      ? ["Dit geld is een rechthoek van papier. Het is een briefje.", "Kijk naar de vorm. Dit geld heeft {4:wit} hoeken. Het is een briefje.", "Dit is een briefje. Het is plat en van papier."]
      : ["Dit geld is rond. Het is een munt.", "Kijk naar de vorm. Dit geld is rond, dus het is een munt.", "Dit is een munt. Dat zie je, want hij is rond."],
  samenWatGetal: (d: GeldSoort) => [
    `Er staat ${isBriefje(d) ? "" : "een "}${kn(d)} op. Zoveel ${eenheid(d)} is ${hijHet(d)} waard.`,
    `Kijk naar het getal: ${kn(d)}. Zoveel ${eenheid(d)} is dit.`,
    `Het getal op ${ditVorm(d)} is ${kn(d)}. Zoveel ${eenheid(d)} is het.`,
  ],
  samenWatJij: (d: GeldSoort) => [`Tik jij op ${deVorm(d)}?`, `Nu jij! Tik op ${deVorm(d)}.`],
  samenWatHand: (d: GeldSoort) => [`Tik op ${deVorm(d)}.`, `Tik maar op ${deVorm(d)}.`],
  samenWatKlaar: (d: GeldSoort) => [`Ja, dit is ${kn(d)} ${eenheid(d)}.`, `Goed zo! Dit is ${kn(d)} ${eenheid(d)}.`, `Precies! Het is ${kn(d)} ${eenheid(d)}.`],
  samenWatZelf: (d: GeldSoort) => [`Kijk, dit is ${kn(d)} ${eenheid(d)}.`, `Kijk, ik tik erop. Dit is ${kn(d)} ${eenheid(d)}.`],
  /** De zwevende munten: Bliepo wijst de munten van 1 euro aan die nog niet gevonden zijn; het kind tikt de laatste. */
  samenBelEen: ["Hier is een munt van {1:geel} euro.", "Kijk, dit is een munt van {1:geel} euro.", "Deze munt is {1:geel} euro."],
  samenBelNog: ["En hier nog een.", "En deze ook.", "En kijk, hier ligt er ook een."],
  samenBelJij: ["Er is er nog {1:geel}. Tik jij erop?", "Nu jij! Tik op de laatste munt, in het rondje.", "Nog {1:geel} munt. Tik jij op de munt in het rondje?"],
  samenBelHand: ["Tik op de munt in het rondje.", "Tik maar op de munt in het rondje."],
  samenBelKlaar: (n: number) => [`Ja, nu heb je alle ${g(n, "geel")} munten van {1:geel} euro.`, `Goed zo! Dat zijn alle ${g(n, "geel")} munten van {1:geel} euro.`, `Precies, nu zijn ze er alle ${g(n, "geel")}.`],
  samenBelZelf: ["Kijk, dit is de laatste munt van {1:geel} euro.", "Kijk, ik tik hem aan. Dit is de laatste munt van {1:geel} euro."],
  /** Hetzelfde antwoord 2 keer: niet 2 keer dezelfde eerste zin (geleerd bij Tellen). Bliepo zegt wat hij ziet. */
  weerGekozen: (x: Ding, v: Vraag) => {
    const wat = v.soort === "wat" ? (x === "knoop" ? "de knoop" : `${wit(x)} ${eenheid(x)}`) : x === "knoop" ? "de knoop" : de(x);
    return v.soort === "bellen" ? [`Je tikte weer op ${wat}.`, `Weer ${wat}, zie ik.`, `Dat is weer ${wat}.`] : [`Je koos weer ${wat}.`, `Je tikte weer op ${wat}.`, `Weer ${wat}, zie ik.`];
  },
  /** De vragen die terugkomen (de oude les: eerst wat niet meteen goed was, aangevuld met vaste vragen). */
  terug1: ["Er komt nog {1:wit} vraag van net terug.", "We doen nog {1:wit} vraag van net.", "Nog {1:wit} vraag van net. Die oefenen we nog even."],
  terugN: (n: number) => [`Nu komen er nog ${g(n, "wit")} vragen van net terug.`, `We doen nog ${g(n, "wit")} vragen van net.`, `Nog ${g(n, "wit")} vragen van net. Die oefenen we nog even.`],
  extra1: ["Nog {1:wit} vraag om te oefenen.", "We oefenen nog {1:wit} vraag."],
  extraN: (n: number) => [`We oefenen er nog ${g(n, "wit")} van net.`, `Nog ${g(n, "wit")} vragen om te oefenen.`],
  terugLastig: ["Die oefenen we een andere keer nog eens.", "Dit oefenen we een andere keer nog eens. Dat komt goed."],
  /** Het einde. */
  slot: ["Nu ken je de munten en de briefjes.", "Je hebt goed gewerkt vandaag! Je kent nu de munten en de briefjes.", "Mooi gewerkt! Je weet nu hoe je ziet hoeveel geld het is."],
  kaartTik: ["Tik op de kaart.", "Tik maar op de kaart.", "Kijk, een kaart voor jou! Tik erop."],
};

/** Aanmoediging bij het hulphandje (het kind moet tikken, niet nadenken; 14.35, geleerd bij Tellen; dezelfde 5 als daar). */
export const AANMOEDIG_TIKKEN = ["Je bent goed bezig.", "Jij kunt dit.", "Het gaat goed zo.", "Probeer het maar.", "Toe maar, je doet het goed."];

/* ---------- reactie na de lof (BLIEPO-KARAKTER.md §4 Geld, zin 36, 38, 40, plus zinnen zonder "Ja") ---------- */

/** De robotzin (plek 4) hooguit 1 keer per les. Zin 0 en 1 beginnen met "Ja". Nieuwe versies komen achteraan. */
export function geldReactie(v: Vraag): Rijtje {
  if (v.soort === "bellen") {
    const n = g(v.bellen.filter((b) => b === v.zoek).length, KLEUR[v.zoek]);
    return rij(
      [`Ja, je vond ze alle ${n}.`, `Ja, dat zijn alle munten van ${kn(v.zoek)} euro.`, `Alle ${n} munten van ${kn(v.zoek)} euro gevonden.`, "En je tikte op geen andere munt.", `Nagekeken: alle ${n} zijn ${kn(v.zoek)} euro.`, `Precies, dat zijn ze alle ${n}.`, `Dat klopt, je hebt ze alle ${n}.`],
      [4],
    );
  }
  const d = v.soort === "waar" ? v.doel : v.ding;
  const e = eenheid(d);
  if (isBriefje(d)) return rij([`Ja, dit briefje is ${kn(d)} ${e}.`, `Ja, er staat ${kn(d)} op.`, `Dit is het briefje van ${kn(d)} ${e}.`, `${kn(d)} ${e}, op een rechthoek van papier.`, `Nagekeken: het is precies ${kn(d)} ${e}.`, `Precies, dit is ${kn(d)} ${e}.`, `Dat klopt, het is het briefje van ${kn(d)} ${e}.`], [4]);
  return rij([`Ja, deze munt is ${kn(d)} ${e} waard.`, `Ja, er staat een ${kn(d)} op.`, `Dit is de munt van ${kn(d)} ${e}.`, `${kn(d)} ${e}, en hij is rond.`, `Nagekeken: het is precies ${kn(d)} ${e}.`, `Precies, dit is ${kn(d)} ${e}.`, `Dat klopt, het is de munt van ${kn(d)} ${e}.`], [4]);
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

/** Alle versies van wat Bliepo bij 1 antwoord kan zeggen; de les kiest met de gedeelde kiezer (nooit-dubbel.ts). */
export type Varianten = {
  /** De eerste zin (wat het kind koos). */
  eerste: string[];
  /** De hint bij de 1e keer. Bij kiezen komt de vraag er meteen achteraan: geen hint eindigt met een vraag. Bij de
      zwevende munten is de hint de nieuwe opdracht. */
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
  /** De eerste versie van elke zin (voor de tabel). Bliepo's eerste zin is leeg bij "onduidelijk": dan een zin uit BLIEPO-KARAKTER.md §10. */
  eerste: string;
  hint: string;
  /** Uitleg na de 2e fout (daarna meteen samen voordoen; dan mag het antwoord in beeld). */
  uitleg: string;
  /** Dezelfde denkfout 2 keer (en de 1e keer zei Bliepo al wat er mis was): anders uitleggen. */
  weer: string[];
  /** Alle versies. */
  v: Varianten;
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

/* Hints in versies, zodat het kind niet steeds dezelfde zin hoort. Geen hint eindigt met een vraag (de vraag komt erachter). */
const HINT = {
  zoekMunt: ["We zoeken een munt. Een munt is rond.", "Een munt is rond en van metaal.", "Kijk naar de vorm. Een munt is rond.", "Een munt is rond. Een briefje niet."],
  zoekBriefje: ["We zoeken een briefje. Een briefje is een rechthoek.", "Een briefje is van papier, met {4:wit} hoeken.", "Kijk naar de vorm. Een briefje is een rechthoek.", "Een briefje is van papier. Een munt niet."],
  getalMunten: ["Kijk naar het getal op elke munt.", "Het getal op een munt zegt hoeveel hij waard is.", "Lees het getal op de munten.", "Op elke munt staat een getal. Lees ze maar."],
  getalBriefjes: ["Kijk naar het getal op elk briefje.", "Het getal op een briefje zegt hoeveel euro het is.", "Lees het getal op de briefjes.", "Op elk briefje staat een getal. Lees ze maar."],
  heelGetal: ["Lees het hele getal op elk briefje.", "Kijk naar alle cijfers van het getal.", "Een getal kan meer cijfers hebben. Lees ze allemaal."],
  /* Bij "Wat is dit?" (er is maar 1 geld in beeld; het rondje staat erom). */
  ditBriefje: ["Dit geld is een rechthoek van papier: een briefje. Lees het getal erop.", "Kijk naar de vorm: dit is een briefje. Lees het getal erop.", "Dit geld is niet rond. Het is een briefje. Lees het getal erop."],
  ditMunt: ["Lees het getal op deze munt.", "Kijk welk getal er op deze munt staat.", "Dit geld is rond: het is een munt. Lees het getal erop."],
  heelGetalDit: ["Lees het hele getal op dit briefje.", "Kijk naar alle cijfers op dit briefje.", "Tel de cijfers op dit briefje. Lees ze allemaal."],
  middenDit: ["Kijk naar het midden van deze munt. Lees ook het getal.", "Lees het getal op deze munt.", "Welke kleur heeft het midden van deze munt? Lees ook het getal."],
  kleurDit: ["Kijk naar de kleur van dit briefje. Lees ook het getal.", "Lees het getal op dit briefje.", "Welke kleur heeft dit briefje? Lees ook het getal."],
  getalDitMunt: ["Lees het getal op deze munt.", "Kijk welk getal er op deze munt staat.", "Op deze munt staat een getal. Lees het maar."],
  geldDit: ["Dit is geld: een munt. Lees het getal erop.", "Dit is een munt. Er staat een getal op. Lees het maar.", "Op een munt staat een getal. Lees het getal op deze munt."],
  /* De zwevende munten (een opdracht: de hint is de nieuwe opdrachtzin; elke versie zegt wat het kind doet, 15.37). */
  bellen: (z: GeldSoort) => [
    `Tik alleen op munten met een ${wit(z)} erop.`,
    `Zoek de munten met een ${wit(z)}. Die zijn zilver in het midden.`,
    `Lees het getal op elke munt. Tik op de munten met een ${wit(z)}.`,
    `Zoek de munten met een ${wit(z)} erop. Tik ze aan.`,
  ],
};
/** Dezelfde denkfout 2 keer: op een andere manier uitleggen dan UITLEG (15.9 punt 2), zonder opdracht. */
const ANDERS = {
  munten: [`De munt van ${kn("m1")} euro is zilver in het midden. Die van ${kn("m2")} euro is goud.`, "Niet elke munt is evenveel waard."],
  briefjes: ["Elk briefje heeft een eigen kleur en een eigen getal.", "Niet elk briefje is evenveel waard."],
  cijfer: ["Ook de {0:wit} hoort bij het getal.", "Een {0:wit} erachter maakt een ander getal."],
  knoop: ["Een knoop is geen geld.", "Met een knoop kun je niets kopen."],
};
const UITLEG = {
  munt: ["Een munt is rond. Een briefje is een rechthoek van papier.", "Munten zijn rond en van metaal. Briefjes zijn van papier.", "Geld dat rond is, is een munt."],
  briefje: ["Een briefje is een rechthoek van papier. Een munt is rond.", "Briefjes zijn van papier. Munten zijn rond en van metaal.", "Geld van papier is een briefje."],
  getal: ["Het getal op het geld zegt hoeveel het waard is.", "Elk geld heeft een eigen getal.", "Op geld staat altijd een getal. Zo weet je hoeveel het is."],
  cijfer: ["Een {0:wit} erachter maakt het getal groter.", "Elk cijfer hoort bij het getal, ook de {0:wit}.", "Met een {0:wit} erachter is het een ander getal."],
  knoop: ["Een knoop is geen geld.", "Een knoop zit aan je jas. Het is geen geld.", "Met een knoop kun je niets kopen."],
};
const SCHERM = {
  waar: "Bliepo's scherm 1,5 s rood (geen fout-geluidje); het vinkje gaat van het kaartje; een rood rondje om het gekozen geld zolang Bliepo het noemt (nooit om het antwoord); dan de hint en het kind mag opnieuw kiezen (alle 3 kaartjes blijven, geen pijl)",
  wat: "Bliepo's scherm 1,5 s rood (geen fout-geluidje); de knoppen weg; Bliepo zegt wat het kind koos; dan komen dezelfde 3 knoppen terug met de hint, met een rood rondje om het geld in beeld (het enige geld; het antwoord is een knop)",
  bellen: "Bliepo's scherm 1,5 s rood (geen fout-geluidje); een rood rondje om de munt of knoop die het kind aantikte zolang Bliepo hem noemt; de gevonden munten houden hun vinkje; de hint is de nieuwe opdrachtzin (geen pijl)",
};

/** "staan 2 cijfers" / "staat 1 cijfer". */
const cijfers = (x: GeldSoort) => {
  const n = String(getal(x)).length;
  return { n: g(n, "wit"), staan: n === 1 ? "staat" : "staan", woord: n === 1 ? "cijfer" : "cijfers" };
};

/** De fouttabel van 1 fout antwoord. `x` = het gekozen geld (of de knoop). */
export function geldFout(v: Vraag, x: Ding): Fout {
  const doel = v.soort === "waar" ? v.doel : v.soort === "wat" ? v.ding : v.zoek;
  const code = denkfoutVan(doel, x);
  const denkfout = DENKFOUT_UITLEG[code];
  const xs = x as GeldSoort;
  const andere = (v.soort === "waar" ? v.keuzes : v.soort === "wat" ? v.opties : v.bellen).filter((k) => k !== x).map(String);
  const maak = (o: { soort?: string; v: Varianten; scherm: string; rondje: Fout["rondje"]; over?: string[] }): Fout => ({ code, soort: o.soort ?? code, denkfout, eerste: o.v.eerste[0], hint: o.v.hint[0], uitleg: o.v.uitleg[0], weer: o.v.weerEerste.length ? [o.v.weerEerste[0], o.v.weerUitleg[0]] : [], v: o.v, scherm: o.scherm, rondje: o.rondje, over: o.over ?? andere });
  /* De zwevende munten: een opdracht met tikken. */
  if (v.soort === "bellen") {
    const hint = HINT.bellen(doel);
    if (code === "geen-geld")
      return maak({
        v: {
          eerste: ["Je tikte op een knoop. Met een knoop kun je niet betalen.", "Dat is een knoop. Daar kun je niet mee betalen.", "Je tikte op de knoop. Die heeft gaatjes, een munt niet."],
          hint,
          uitleg: UITLEG.knoop,
          weerEerste: ["Je tikte weer op de knoop.", "Weer de knoop, zie ik."],
          weerUitleg: ANDERS.knoop,
        },
        scherm: SCHERM.bellen,
        rondje: "gekozen",
      });
    return maak({
      v: {
        eerste: [`Je tikte op ${de(xs)}.`, `Kijk, dat is ${de(xs)}.`, `Dat is ${de(xs)}. Die zoeken we niet.`],
        hint,
        uitleg: UITLEG.getal,
        weerEerste: ["Je tikte weer op een andere munt.", "Weer een andere munt, zie ik."],
        weerUitleg: [`Op de munten die we zoeken staat een ${wit(doel)}.`, `We zoeken alleen de munten met een ${wit(doel)} erop.`],
      },
      scherm: SCHERM.bellen,
      rondje: "gekozen",
    });
  }
  /* Wat is dit? (knoppen bij Bliepo; 1 geld in beeld). */
  if (v.soort === "wat") {
    if (code === "geen-geld")
      return maak({
        v: { eerste: ["Je koos een knoop. Een knoop heeft gaatjes.", "Je tikte op de knoop. Maar een knoop heeft gaatjes.", "Een knoop? Daar zitten gaatjes in. Hier niet."], hint: HINT.geldDit, uitleg: UITLEG.knoop, weerEerste: [], weerUitleg: [] },
        scherm: SCHERM.wat,
        rondje: "geld",
      });
    if (code === "munt-briefje-verwisseld") {
      const X = vorm(xs);
      return maak({
        soort: `${code}-${vorm(doel)}`,
        v: {
          eerste: [`Je koos ${knopZin(xs)}. Dat is een ${X}.`, `${Knop(xs)}? Dat is een ${X}. ${isBriefje(xs) ? "Dat is van papier." : "Die is rond."}`, `Je tikte op ${knopZin(xs)}. Maar dat is een ${X}.`],
          hint: isBriefje(doel) ? HINT.ditBriefje : HINT.ditMunt,
          uitleg: isBriefje(doel) ? UITLEG.briefje : UITLEG.munt,
          weerEerste: [`Je koos weer een ${X}.`, `Weer een ${X}, zie ik.`, `Dat is ook weer een ${X}.`],
          weerUitleg: isBriefje(doel) ? ["Dit geld is een rechthoek, geen rondje.", "Dit geld is van papier. Het is geen munt."] : ["Dit geld is rond, geen rechthoek.", "Dit geld is rond. Het is geen briefje."],
        },
        scherm: SCHERM.wat,
        rondje: "geld",
        over: andere.filter((k) => k !== "knoop" && isBriefje(k as GeldSoort) === isBriefje(doel)),
      });
    }
    if (code === "zelfde-cijfer") {
      const c = cijfers(xs);
      return maak({
        v: {
          eerste: [`Je koos ${knopZin(xs)}. Dat getal heeft ${c.n} ${c.woord}.`, `${Knop(xs)}? Dat schrijf je met ${c.n} ${c.woord}.`, `Je tikte op ${knopZin(xs)}. In dat getal ${c.staan} ${c.n} ${c.woord}.`],
          hint: HINT.heelGetalDit,
          uitleg: UITLEG.cijfer,
          weerEerste: [`Je koos weer het getal met ${c.n} ${c.woord}.`, `Weer het getal met ${c.n} ${c.woord}, zie ik.`],
          weerUitleg: ANDERS.cijfer,
        },
        scherm: SCHERM.wat,
        rondje: "geld",
      });
    }
    /* ander-getal: wat waar is over het gekozen geld (kleur of midden), zonder het goede te noemen. */
    return maak({
      v: {
        eerste: [`Je koos ${knopZin(xs)}. ${dieIs(xs)}`, `${Knop(xs)}? ${dieIs(xs)}`, `Je tikte op ${knopZin(xs)}. Op dit geld staat een ander getal.`],
        hint: isBriefje(doel) ? HINT.kleurDit : xs === "c50" ? HINT.getalDitMunt : HINT.middenDit,
        uitleg: UITLEG.getal,
        weerEerste: [`Je koos weer een ${vorm(xs)} met een ander getal.`, `Weer een ${vorm(xs)} met een ander getal, zie ik.`],
        weerUitleg: isBriefje(doel) ? ANDERS.briefjes : ANDERS.munten,
      },
      scherm: SCHERM.wat,
      rondje: "geld",
    });
  }
  /* Waar zie je …? (3 kaartjes in beeld; het kind koos er een met een vinkje). */
  if (code === "munt-briefje-verwisseld") {
    const D = vorm(doel);
    const X = vorm(xs);
    return maak({
      soort: `${code}-${D}`,
      v: {
        eerste: [`Je koos ${een(xs)}. Dat is geen ${D}.`, `Je tikte op ${een(xs)}. Maar we zoeken een ${D}.`, `Dit is ${een(xs)}. Een ${D} ziet er anders uit.`],
        hint: isBriefje(doel) ? HINT.zoekBriefje : HINT.zoekMunt,
        uitleg: isBriefje(doel) ? UITLEG.briefje : UITLEG.munt,
        weerEerste: [`Je koos weer een ${X}.`, `Weer een ${X}, zie ik.`, `Dit is ook weer een ${X}.`],
        weerUitleg: isBriefje(doel) ? ["Briefjes zijn rechthoeken, munten niet.", "Een briefje is niet rond."] : ["Munten zijn rond, briefjes niet.", "Een munt is niet van papier."],
      },
      scherm: SCHERM.waar,
      rondje: "gekozen",
      over: andere.filter((k) => isBriefje(k as GeldSoort) === isBriefje(doel)),
    });
  }
  if (code === "zelfde-cijfer") {
    const c = cijfers(xs);
    return maak({
      v: {
        eerste: [`Je koos ${de(xs)}. Op dat ${vorm(xs)} ${c.staan} ${c.n} ${c.woord}.`, `Je tikte op ${de(xs)}. Dat getal heeft ${c.n} ${c.woord}.`, `Dit is ${de(xs)}. Dat getal schrijf je met ${c.n} ${c.woord}.`],
        hint: HINT.heelGetal,
        uitleg: UITLEG.cijfer,
        weerEerste: [`Je koos weer het getal met ${c.n} ${c.woord}.`, `Weer het getal met ${c.n} ${c.woord}, zie ik.`],
        weerUitleg: ANDERS.cijfer,
      },
      scherm: SCHERM.waar,
      rondje: "gekozen",
    });
  }
  return maak({
    v: {
      eerste: [`Je koos ${de(xs)}. Kijk maar, dat getal staat erop.`, `Je tikte op ${de(xs)}. Dat is ook een ${vorm(xs)}, maar een ${isBriefje(xs) ? "ander" : "andere"}.`, `Dit is ${de(xs)}. We zoeken een ander getal.`],
      hint: isBriefje(doel) ? HINT.getalBriefjes : HINT.getalMunten,
      uitleg: UITLEG.getal,
      weerEerste: [`Je koos weer een ${vorm(xs)} met een ander getal.`, `Weer een ${vorm(xs)} met een ander getal, zie ik.`],
      weerUitleg: isBriefje(doel) ? ANDERS.briefjes : ANDERS.munten,
    },
    scherm: SCHERM.waar,
    rondje: "gekozen",
  });
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

/* ---------- welke versie Bliepo zegt (zuiver: de les en het fouttabel-script gebruiken precies dit) ---------- */

/** De kiezer van de les (nooit-dubbel.ts): een zin uit `zinnen`, nooit 2 keer achter elkaar dezelfde binnen 1 `sleutel`. */
export type Variant = (sleutel: string, zinnen: readonly string[], mag?: (z: string) => boolean) => string;

/** Een ander antwoord bij de 2e keer: "Nu koos je …" in plaats van weer "Je koos …" (keuring Tellen en Splitsen). */
export const nuKoos = (z: string) => z.replace(/^Je koos /, "Nu koos je ").replace(/^Je tikte op /, "Nu tikte je op ");

/**
 * Wat Bliepo zegt bij een antwoord dat niet goed is.
 *   1e keer: eerste zin (wat het kind koos) + hint. De hint herhaalt geen getal en geen stuk uit de eerste zin.
 *   2e keer: eerste zin + uitleg; of, bij 2 keer dezelfde denkfout, "weer …" + een andere uitleg; of, bij hetzelfde
 *   antwoord 2 keer, "Je koos weer …" + uitleg. Daarna doet Bliepo het samen met het kind voor.
 * `onduidelijk` = een zin uit het vaste rijtje (BLIEPO-KARAKTER.md §10) als de denkfout niet duidelijk is.
 */
export function foutStuk(variant: Variant, f: Fout, v: Vraag, poging: 1 | 2, eerder: Fout | null, o: { x: Ding; zelfdeAntwoord: boolean; onduidelijk: () => string }): string[] {
  const hintSleutel = v.soort === "bellen" ? "hintOpdracht" : "hint";
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
  const e = o.zelfdeAntwoord ? variant("weerGekozen", ZIN.weerGekozen(o.x, v)) : variant("eerste", eerder ? [...f.v.eerste, nuKoos(f.v.eerste[0])] : f.v.eerste);
  return [e, variant("uitleg", f.v.uitleg, pastNa(e))];
}

/** De vraag opnieuw na de hint (bij kiezen): een vraag of opdracht die samen met de hint in het tekstvak past. */
export function opnieuwZin(variant: Variant, v: Waarvraag | Watvraag, hint: string): string {
  const alle = v.soort === "waar" ? ZIN.opnieuwWaar(v) : ZIN.opnieuwWat(v);
  const passend = alle.filter((z) => past(hint, z));
  return variant(`opnieuw-${v.soort}`, passend.length ? passend : alle);
}
