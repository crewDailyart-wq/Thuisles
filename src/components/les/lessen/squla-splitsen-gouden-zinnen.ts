/**
 * ALLE ZINNEN VAN BLIEPO in de gouden les Splitsen (squla-splits-splitsen1-1-gouden, 9 november 2026), op één plek,
 * met de FOUTTABEL. De les zelf (squla-splitsen-gouden.tsx) bevat geen eigen zinnen.
 *
 *   - De rijtjes (lof, momenten, naam, goed na een fout, einde, eerste zin als de denkfout niet duidelijk is,
 *     aanmoedigen, overgang) zijn dezelfde als in de gouden klokles en de gouden les Tellen (BLIEPO-KARAKTER.md). Hier
 *     alleen de reactie bij Splitsen (BLIEPO-KARAKTER.md §4, zin 21, 23 en 25, plus 2 zinnen zonder "Ja").
 *   - De inhoud (15 vragen, getallen, voorwerpen) is die van squla-splits-splitsen1-1 (BOUWREGELS 15.22).
 *   - De soort reactie volgt het draaiboek Splitsen (Part Part Whole, SYNTHESIS-ANALYSE/DRAAIBOEKEN-NIEUW/splitsen.md
 *     §3 en §7): Bliepo zegt wat er nu in het vak ligt en waar het kind moet kijken; bij de huisjes met een leeg vakje
 *     rekent hij voor ("4 en 3 is samen 7. We zoeken 6."). Het tienvak (doos van 10 met een doek) heeft Synthesis niet:
 *     daar zijn de hints EIGEN INVULLING, NIET VAN SYNTHESIS (15.22 punt 5).
 *
 * Leesbare versie: FOUTTABEL-squla-splits-splitsen1-1-gouden.md (maak hem opnieuw met
 * `npx tsx scripts/fouttabel-splitsen-gouden.ts`; dat script doet ook de verklapcontrole).
 * {3:paars} = een getal in de kleur van het paarse vak.
 */

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

/** Een getal in de zin, in de kleur van het vak of de voorwerpen waar het naar verwijst (BOUWREGELS 2.1, 2.2). */
export const g = (n: number, k = "wit") => `{${n}:${k}}`;
/** Het eerste deel (paarse vak) en het tweede deel (oranje vak of zak): dezelfde kleuren als de oude les. */
export const KA = "paars";
export const KB = "oranje";

/* ---------- de voorwerpen ---------- */

const NAAM: Record<string, [string, string]> = {
  pion: ["pion", "pionnen"],
  voetbal: ["bal", "ballen"],
  tennisbal: ["bal", "ballen"],
  pingpongbal: ["pingpongbal", "pingpongballen"],
};
/** "{3} pionnen", "{1} pion". */
export const aantal = (n: number, vw: string, k = "wit") => `${g(n, k)} ${n === 1 ? NAAM[vw][0] : NAAM[vw][1]}`;
export const meervoud = (vw: string) => NAAM[vw][1];
export const enkel = (vw: string) => NAAM[vw][0];
/** "ligt er {1}" / "liggen er {3}". */
const ligt = (n: number, k: string) => `${n === 1 ? "ligt" : "liggen"} er ${g(n, k)}`;
/** "ligt 1 pion" / "liggen 4 pionnen" (kind-test punt 11: "liggen er 4" klonk stroef). */
export const ligtDing = (n: number, vw: string, k: string) => `${n === 1 ? "ligt" : "liggen"} ${aantal(n, vw, k)}`;

/* ---------- de 15 vragen van squla-splits-splitsen1-1 (zelfde volgorde, getallen en voorwerpen) ---------- */

export type HuisVraag = { soort: "huis"; nr: number; id: string; tot: number; deel: number; vw: string; zak: boolean; links: boolean };
export type ParenVraag = { soort: "paren"; nr: number; id: string; paren: [number, number][] };
export type TienVraag = { soort: "tienvak"; nr: number; id: string; zicht: number };
export type Sleepvraag = HuisVraag | ParenVraag | TienVraag;

const huis = (nr: number, tot: number, deel: number, vw = "pion", o: { zak?: boolean; links?: boolean } = {}): HuisVraag => ({
  soort: "huis",
  nr,
  id: `vraag${nr}-${tot}-${deel}-${vw}${o.zak ? "-zak" : ""}`,
  tot,
  deel,
  vw,
  zak: !!o.zak,
  links: o.links ?? true,
});
const paren = (nr: number, p: [number, number][]): ParenVraag => ({ soort: "paren", nr, id: `vraag${nr}-paren-${p.flat().join("")}`, paren: p });
const tien = (nr: number, zicht: number): TienVraag => ({ soort: "tienvak", nr, id: `vraag${nr}-tienvak-${zicht}`, zicht });

export const VRAGEN: Sleepvraag[] = [
  huis(1, 5, 2),
  huis(2, 9, 6),
  huis(3, 7, 3),
  huis(4, 6, 4),
  huis(5, 10, 8),
  huis(6, 7, 4, "voetbal", { zak: true }),
  huis(7, 6, 5, "voetbal", { zak: true }),
  huis(8, 9, 6, "voetbal", { zak: true, links: false }),
  huis(9, 8, 3, "voetbal", { zak: true, links: false }),
  paren(10, [[5, 1], [6, 4], [8, 5]]),
  tien(11, 7),
  tien(12, 9),
  tien(13, 4),
  tien(14, 5),
  tien(15, 3),
];

/** Waar het tweede deel heen gaat: het oranje vak, of de zak. */
export const tweedeVak = (v: HuisVraag) => (v.zak ? "de zak" : "het oranje vak");
export const eersteVak = (v: HuisVraag) => (v.zak ? "het paarse vak naast de zak" : "het paarse vak");

/**
 * De opdracht (inhoud van Squla; 15.26: "stuk" → "vakje", "leg" → "sleep", "de zak, in het oranje vak"; zie
 * KEUZES-VOOR-SARA.md Ronde 21). `keer` = hoeveelste opdracht van deze soort (0 = de eerste). De eerste keer(en) de hele
 * opdracht; daarna korter en afwisselend (kind-test Splitsen punt 17: 9 keer dezelfde lange zin). Getallen en wat het
 * kind moet doen blijven gelijk.
 */
export function opdracht(v: Sleepvraag, keer = 0): string[] {
  if (v.soort === "huis") {
    const T = aantal(v.tot, v.vw);
    const D = aantal(v.deel, v.vw, KA);
    const rest = v.zak ? "de rest in de zak" : "de rest naar het oranje vak";
    if (v.zak && keer === 0) return [`Er zijn ${T}.`, `Sleep ${D} naar het paarse vak naast de zak.`, `De andere ${meervoud(v.vw)} sleep je in de zak, in het oranje vak.`];
    if (keer < 2 && !v.zak) return [`Er zijn ${T}.`, `Sleep ${D} naar het paarse vak.`, `De andere ${meervoud(v.vw)} sleep je naar het oranje vak.`];
    return [[`Nu ${T}. Sleep er ${g(v.deel, KA)} naar het paarse vak, ${rest}.`, `Hier zijn ${T}. ${g(v.deel, KA)} gaan naar het paarse vak, ${rest}.`, `${T} deze keer. Sleep ${D} naar het paarse vak en ${rest}.`][keer % 3]];
  }
  if (v.soort === "paren") return ["Elk huisje heeft nog een leeg vakje.", "Sleep in elk leeg vakje de ballen die nog missen."];
  if (keer === 0) return [`In de doos liggen ${g(10)} pingpongballen.`, `Je ziet er ${g(v.zicht, KA)}.`, "De andere liggen onder de doek.", "Sleep die ballen naar het vak."];
  return [[`Nu zie je er ${g(v.zicht, KA)}. Sleep de ballen onder de doek naar het vak.`, `Je ziet er ${g(v.zicht, KA)}. Hoeveel liggen er onder de doek? Sleep ze naar het vak.`][keer % 2]];
}
/** Na de 1e fout (draaiboek §3 F.2: na de pijl worden de vakken leeg en zegt de tutor de opdracht kort opnieuw). */
export function opnieuw(v: Sleepvraag, keer: number): string {
  const begin = ["Probeer het nog eens.", "Nog 1 keer.", "Kom, nog een keer."][keer % 3];
  if (v.soort === "huis") return `${begin} Sleep ${aantal(v.deel, v.vw, KA)} naar het paarse vak. De andere gaan ${v.zak ? "in de zak" : "naar het oranje vak"}.`;
  if (v.soort === "paren") return `${begin} Sleep in elk leeg vakje de ballen die nog missen.`;
  return `${begin} Sleep de ballen die onder de doek liggen naar het vak.`;
}

/* ---------- vaste zinnen van het verloop (draaiboek Splitsen §2; eigen woorden) ---------- */

export const ZIN = {
  /** Stap 1: eerst wat je in deze les doet (BOUWREGELS 4.3; kind-test punt 12), dan de startvraag (Ja / Nee). */
  begin: "In deze les verdeel je pionnen en ballen over 2 vakken.",
  start: `Kun jij een getal al in 2 delen splitsen? Bijvoorbeeld deze ${aantal(5, "pion")}.`,
  /** Stap 2a: Ja → de proef. Knop-uitleg: hoe je sleept (1 keer per les, 3.15). */
  proefBegin: "Fijn! Laat maar zien wat je kunt.",
  sleepUitleg: "Pak een pion met je vinger of de muis en sleep hem naar een vak.",
  proefGoed: "Je kunt het al. We gaan verder oefenen.",
  /** Stap 2a: 2 fouten in de proef → de hele les (draaiboek §3 A.4; het antwoord wordt niet gezegd). */
  /** Na de 1e fout in de proef blijven de dingen liggen (draaiboek §3 A.2): het kind schuift ze zelf goed. */
  proefOpnieuw: (v: HuisVraag) => `Schuif de ${meervoud(v.vw)} goed. In het paarse vak horen ${aantal(v.deel, v.vw, KA)}.`,
  proefLastig: "Dat is nog lastig. We kijken eerst samen hoe splitsen werkt.",
  /** Stap 2b: Nee. */
  nee: "Geen probleem. We kijken eerst samen hoe splitsen werkt.",
  pijlUitleg: "Klaar met kijken? Tik dan op de blauwe pijl.",
  /** De eerste pijl komt na een fout: dan past "klaar met kijken" niet (kind-test punt 14). */
  pijlUitlegNaFout: "Tik op de blauwe pijl als je het nog eens wilt proberen.",
  /** Het vinkje 1 keer uitleggen (3.15; kind-test punt 8). Zonder het woord "vinkje": dat haalt het lesscherm uit elke zin
      (besluit 30 oktober); de knop licht op terwijl Bliepo dit zegt. */
  vinkjeUitleg: "Ben je klaar met slepen? Tik dan op deze knop. Dan kijk ik het na.",

  /* Uitleg na Nee (draaiboek stap 7 t/m 10) met de 5 pionnen van het beginscherm (BOUWREGELS 14.21), maar als 1 en 4:
     vraag 1 is 2 en 3, en een afgerond uitlegvoorbeeld komt niet meteen terug als eerste opgave (3.23; kind-test punt 6). */
  uitlegHuis: `Dit is een splitshuisje. Onder zijn 2 vakken. Daar komen de 2 delen in.`,
  uitlegEen: "Sleep 1 pion naar het paarse vak.",
  uitlegEenKlaar: `Mooi, er ligt er ${g(1, KA)}.`,
  uitlegRest: "Sleep nu de andere pionnen naar het oranje vak.",
  /* Als iets op de verkeerde plek ligt (kind-test punt 2): zeggen wat er mis ligt; tikken op een pion in een vak legt hem terug. */
  uitlegAlInOranje: (n: number) => (n === 1 ? "Er ligt al een pion in het oranje vak. Tik erop, dan gaat hij terug naar boven." : "Er liggen al pionnen in het oranje vak. Tik erop, dan gaan ze terug naar boven."),
  uitlegTeVeelPaars: `In het paarse vak hoort er maar ${g(1, KA)}. Tik op een pion in het paarse vak, dan gaat hij terug.`,
  uitlegPaarsLeeg: `Het paarse vak is leeg. Daar hoort ${g(1, KA)} pion in.`,
  uitlegVoordoen: "Kijk, ik doe het even voor.",
  uitlegRestKlaar: `Je splitste ${g(5)} in ${g(1, KA)} en ${g(4, KB)}.`,
  /** Stap 7 (de vraag naar het totaal) en stap 8 (het totaal staat boven). */
  totaalVraag: "Hoeveel pionnen zijn er samen?",
  totaalGoed: "Natuurlijk.",
  totaalSamen: `Kijk: ${g(1, KA)} en ${g(4, KB)}. Samen zijn dat ${g(5)} pionnen.`,
  totaalUitleg: `De 2 delen zijn ${g(1, KA)} en ${g(4, KB)}. Samen maken ze ${g(5)}. Alles samen heet het totaal. Dat staat boven in het dak.`,
  /** Stap 10: kun je 5 ook anders splitsen? (zelf 2 delen zoeken) */
  andersVraag: `Maar ${g(1, KA)} en ${g(4, KB)} is maar 1 manier. Splits ${g(5)} nu zelf op een andere manier.`,
  andersAlGevonden: `Klopt, maar zo had je hem al: ${g(1, KA)} en ${g(4, KB)}. Probeer een andere manier.`,
  andersLeegVak: "Sleep in allebei de vakken pionnen. Dan heb je 2 delen.",
  andersHelp: `Ik help je. Ik leg ${g(3, KA)} pionnen in het paarse vak. Sleep de andere naar het oranje vak.`,
  /** Na de hulp lukt het nog niet: Bliepo maakt het af en de les gaat door (geen eindeloze lus; kind-test punt 5). */
  andersAfmaken: `Kijk, ik maak het af: ${g(3, KA)} en ${g(2, KB)}. Dat is ook ${g(5)}.`,
  andersOmgedraaid: (a: number, b: number) => `Ja, je draaide de delen om: ${g(a, KA)} en ${g(b, KB)}. Dat is ook ${g(5)}.`,
  andersGoed: (a: number, b: number) => `Ja, ${g(5)} kun je ook splitsen in ${g(a, KA)} en ${g(b, KB)}.`,
  andersKlaar: "Zo kun je een getal splitsen. Nu ga je zelf oefenen.",

  /* Hulphandje (15.19): 1 korte zin, de eerste keer per opdracht, met een aanmoediging ervoor. */
  hand: (vw: string) => `Pak een ${enkel(vw)} en sleep hem naar een vak.`,
  handTien: "Pak een bal en sleep hem naar het vak.",
  handRest: (v: HuisVraag) => `Sleep de andere ${meervoud(v.vw)} naar ${tweedeVak(v)}.`,

  /* Samen voordoen na de 2e fout (15.11; draaiboek §3 F.6: de tutor zet 1 deel klaar, het kind zoekt het andere). */
  samenHelp: "Kom, we doen het samen.",
  samenHuisDeel: (v: HuisVraag) => `Ik leg er ${g(v.deel, KA)} in het paarse vak.`,
  samenHuisRest: (v: HuisVraag) => `Sleep jij de andere ${meervoud(v.vw)} naar ${tweedeVak(v)}.`,
  samenHuisKlaar: (v: HuisVraag) => `Samen splitsten we ${g(v.tot)} in ${g(v.deel, KA)} en ${g(v.tot - v.deel, KB)}.`,
  samenTienDoek: (v: TienVraag) => `Ik til de doek op. Daaronder ${ligt(10 - v.zicht, KB).replace(" er ", " ")} ${10 - v.zicht === 1 ? "bal" : "ballen"}.`,
  samenTienRest: "Ik leg ze bijna allemaal in het vak. Sleep jij de laatste erbij.",
  samenTienKlaar: (v: TienVraag) => `Samen: ${g(10)} is ${g(v.zicht, KA)} en ${g(10 - v.zicht, KB)}.`,
  samenParenHuis: (t: number, d: number) => `In dit huisje: ${g(t)} is ${g(d, KA)} en nog een deel.`,
  samenParenRest: "Sleep jij de laatste bal erbij.",
  samenParenKlaar: "Samen hebben we elk huisje vol gemaakt.",

  /* Einde (draaiboek stap 16). */
  slot: `Je splitste getallen tot ${g(10)}.`,
  kaartTik: "Tik op de kaart.",
};

/** BLIEPO-KARAKTER.md §4 Splitsen: zin 21, 23 en 25, plus 2 zinnen zonder "Ja" (voor na een lofzin die al met "Ja" begint). */
export const SPLITSREACTIE = (tot: number, a: number, b: number) =>
  rij([`Ja, ${g(tot)} kun je splitsen in ${g(a, KA)} en ${g(b, KB)}.`, `Ja, alle ${g(tot)} zijn verdeeld.`, `${g(tot)} kun je splitsen in ${g(a, KA)} en ${g(b, KB)}.`, `${g(a, KA)} en ${g(b, KB)} maken samen ${g(tot)}.`, `Nagekeken: ${g(a, KA)} en ${g(b, KB)} maken samen ${g(tot)}.`], [4]);
export const SPLITSREACTIE_JA = [0, 1];
export const SPLITSREACTIE_ROBOT = 4;
/** Bij de 3 huisjes (vraag 10). */
export const PARENREACTIE = rij(["Ja, alle 3 huisjes kloppen.", "In elk huisje klopt het.", "Nagekeken: alle huisjes kloppen."], [2]);
export const PARENREACTIE_JA = [0];
/** Aanmoediging bij het hulphandje (het kind moet slepen, niet nadenken; 14.35). */
export const AANMOEDIG_SLEPEN = ["Je bent goed bezig.", "Jij kunt dit.", "Geen haast, hoor."];

/* ---------- denkfouten (draaiboek Splitsen §7; namen voor de voortgang) ---------- */

export const DENKFOUTEN = ["een-te-veel", "een-te-weinig", "te-veel", "te-weinig", "omgedraaid", "alles-in-1-vak", "som-klopt-niet", "zichtbaar-gelegd", "totaal-als-deel", "deel-voor-totaal", "onduidelijk"] as const;
export type Denkfoutnaam = (typeof DENKFOUTEN)[number];

export type Fout = {
  code: Denkfoutnaam;
  /** Welke "weer"-zin erbij hoort, als die per geval verschilt (alles in het paarse vak / alles in het andere vak). */
  soort?: string;
  denkfout: string;
  /** Bliepo's eerste zin (leeg bij "onduidelijk": dan een zin uit BLIEPO-KARAKTER.md §10). */
  eerste: string;
  hint: string;
  /** Uitleg na de 2e fout (daarna meteen samen voordoen). */
  uitleg: string;
  /** Dezelfde denkfout 2 keer (en Bliepo zei de 1e keer echt wat er mis was): "weer" + een andere uitleg. */
  weer: string[];
  scherm: string;
  /** Waarom Bliepo de denkfout niet hardop noemt (zou het antwoord verklappen, 15.17). */
  noot?: string;
  /** Eigen invulling, niet van Synthesis (15.22 punt 5). */
  eigen?: boolean;
};

const SCHERM_HUIS = "Bliepo's scherm 1,5 s rood (geen fout-geluidje); de pionnen schudden even en blijven liggen; na de pijl gaan de vakken leeg en zegt Bliepo de opdracht kort opnieuw";
const SCHERM_PROEF = "in de proef blijven de pionnen liggen (draaiboek §3 A.2): het kind schuift ze zelf goed";

/** 3 hints per soort, die afwisselen (per vraagnummer); ze wijzen naar het getal onder het paarse vak (de opdracht zelf), nooit naar het andere deel. */
const HINT_PAARS = [
  (v: HuisVraag) => `Kijk naar het getal onder het paarse vak. Zoveel ${meervoud(v.vw)} horen erin.`,
  (v: HuisVraag) => `Tel de ${meervoud(v.vw)} in het paarse vak nog eens. Kijk dan naar het getal eronder.`,
  (v: HuisVraag) => `Wijs de ${meervoud(v.vw)} in het paarse vak 1 voor 1 aan. Het getal eronder zegt hoeveel erin horen.`,
];

/**
 * De fouttabel van een huisje (vraag 1 t/m 9): wat ligt er in het paarse vak (`p`)? Alle dingen liggen in een vak,
 * dus in het andere vak ligt de rest. Het antwoord dat het kind zelf moet vinden is het andere deel (het "?").
 */
export function huisFout(v: HuisVraag, p: number): Fout {
  const { tot, deel, vw } = v;
  const rest = tot - deel;
  const hint = HINT_PAARS[v.nr % 3](v);
  if (p === tot)
    return {
      code: "alles-in-1-vak",
      soort: "alles-paars",
      denkfout: "alles in 1 vak gelegd; het andere vak bleef leeg",
      eerste: `Alle ${aantal(tot, vw)} liggen in het paarse vak.`,
      hint: `Er komen 2 delen. Kijk naar het getal onder het paarse vak. De andere ${meervoud(vw)} gaan naar ${tweedeVak(v)}.`,
      uitleg: `Splitsen is in 2 delen verdelen. In allebei de vakken komen ${meervoud(vw)}.`,
      weer: [`Weer liggen ze allemaal in het paarse vak.`, `In het paarse vak horen er maar ${g(deel, KA)}. De rest hoort in ${tweedeVak(v)}.`],
      scherm: SCHERM_HUIS,
    };
  if (p === 0)
    return {
      code: "alles-in-1-vak",
      soort: "alles-ander",
      denkfout: "alles in 1 vak gelegd; het paarse vak bleef leeg",
      eerste: v.zak ? `Alle ${meervoud(vw)} liggen in de zak. Het paarse vak is leeg.` : `Alle ${meervoud(vw)} liggen in het oranje vak. Het paarse vak is leeg.`,
      hint: "Begin bij het paarse vak. Kijk naar het getal eronder.",
      uitleg: `Splitsen is in 2 delen verdelen. In allebei de vakken komen ${meervoud(vw)}.`,
      weer: [`Weer is het paarse vak leeg.`, `Het getal onder het paarse vak zegt dat er ${g(deel, KA)} in horen.`],
      scherm: SCHERM_HUIS,
    };
  if (p === rest && rest !== deel)
    return {
      code: "omgedraaid",
      denkfout: "de 2 delen omgedraaid (het getal van het paarse vak in het andere vak)",
      eerste: `In het paarse vak ${ligtDing(p, vw, KA)}.`,
      hint,
      uitleg: `Het getal onder het paarse vak hoort bij het paarse vak. Daar horen ${aantal(deel, vw, KA)} in.`,
      weer: [],
      scherm: SCHERM_HUIS,
      noot: "Bliepo zegt niet dat de delen omgedraaid zijn: dan weet het kind meteen wat er in het andere vak moet",
    };
  const meer = p > deel;
  const een = Math.abs(p - deel) === 1;
  return {
    code: een ? (meer ? "een-te-veel" : "een-te-weinig") : meer ? "te-veel" : "te-weinig",
    denkfout: een ? `1 ${enkel(vw)} ${meer ? "te veel" : "te weinig"} in het paarse vak (verkeerd geteld)` : `${meer ? "te veel" : "te weinig"} ${meervoud(vw)} in het paarse vak`,
    eerste: `In het paarse vak ${ligtDing(p, vw, KA)}. ${een ? `Dat is er ${g(1)} te ${meer ? "veel" : "weinig"}.` : p === 1 ? "Dat is te weinig." : `Dat zijn er te ${meer ? "veel" : "weinig"}.`}`,
    hint,
    uitleg: `Het getal onder het paarse vak zegt hoeveel ${meervoud(vw)} erin horen: ${g(deel, KA)}.`,
    weer: [`Weer ${meer ? "te veel" : "te weinig"} in het paarse vak.`, `Er horen er precies ${g(deel, KA)} in. Dat is het getal eronder.`],
    scherm: SCHERM_HUIS,
  };
}
export const SCHERM_PROEF_NOOT = SCHERM_PROEF;

/**
 * De fouttabel van het tienvak (vraag 11 t/m 15): hoeveel ballen legde het kind in het vak (`n`)? EIGEN INVULLING, NIET
 * VAN SYNTHESIS (Part Part Whole heeft geen doos met een doek). Het antwoord is het aantal onder de doek: "1 te veel"
 * of "1 te weinig" zou dat verklappen, dus dan zegt Bliepo alleen "… is dichtbij." (zoals de gouden les Tellen).
 */
export function tienFout(v: TienVraag, n: number): Fout {
  const z = v.zicht;
  const r = 10 - z;
  const N = g(n, KB);
  const SCHERM = "Bliepo's scherm 1,5 s rood (geen fout-geluidje); de ballen schudden even; na de pijl gaat het vak leeg en zegt Bliepo de opdracht kort opnieuw";
  /* De doek is 1 lap: de plekken eronder zie je niet apart. Daarom: aanvullen tot 10 (zonder het antwoord). */
  const tel = [`In de doos passen er ${g(10)}. Tel door vanaf ${g(z, KA)} tot ${g(10)}.`, `Tel de ballen die je ziet. Tel dan door tot ${g(10)}.`, `Een volle doos heeft 2 rijen van ${g(5)}. Hoeveel ballen zie je niet?`][r === 5 ? v.nr % 2 : r <= 2 ? 1 : v.nr % 3];
  const basis = { scherm: SCHERM, eigen: true as const };
  if (n === 10)
    return { ...basis, code: "totaal-als-deel", denkfout: "legde alle 10 ballen (het totaal) in plaats van alleen de ballen onder de doek", eerste: `Je legde er ${N}. Zoveel passen er in de hele doos.`, hint: "Een paar ballen zie je al. Sleep alleen de ballen die onder de doek liggen.", uitleg: `In de doos passen er ${g(10)}. ${g(z, KA)} zie je al. Alleen de ballen onder de doek gaan naar het vak.`, weer: ["Weer de hele doos.", `${g(z, KA)} ballen zie je al. In het vak horen alleen de ballen die nog missen tot ${g(10)}.`] };
  if (n === z)
    return { ...basis, code: "zichtbaar-gelegd", denkfout: "legde net zoveel als hij al zag (de ballen boven de doek)", eerste: `Je legde er ${N}. Zoveel ballen zie je al in de doos.`, hint: "Sleep de ballen die je niet ziet. Die liggen onder de doek.", uitleg: "De ballen die je ziet, liggen al in de doos. Het vak is voor de ballen onder de doek.", weer: ["Weer net zoveel als je ziet.", `Onder de doek liggen de ballen die nog missen tot ${g(10)}.`] };
  if (Math.abs(n - r) === 1)
    return { ...basis, code: n > r ? "een-te-veel" : "een-te-weinig", denkfout: `1 bal ${n > r ? "te veel" : "te weinig"} (de plekken onder de doek verkeerd geteld)`, eerste: `${N} is dichtbij.`, hint: tel, uitleg: `In de doos passen er ${g(10)}. Onder de doek liggen de ballen die nog missen tot ${g(10)}.`, weer: [], noot: "richting niet genoemd: \"1 te veel\" of \"1 te weinig\" verklapt het antwoord" };
  const meer = n > r;
  return { ...basis, code: meer ? "te-veel" : "te-weinig", denkfout: `${meer ? "te veel" : "te weinig"} ballen in het vak`, eerste: `Je legde er ${N}. Dat zijn er te ${meer ? "veel" : "weinig"}.`, hint: tel, uitleg: `In de doos passen er ${g(10)}. Onder de doek liggen de ballen die nog missen tot ${g(10)}.`, weer: [`Weer te ${meer ? "veel" : "weinig"}.`, `Je ziet er ${g(z, KA)}. Onder de doek liggen de ballen die nog missen tot ${g(10)}.`] };
}

/**
 * De fouttabel van de 3 huisjes (vraag 10): wat ligt er in elk leeg vakje (`tel`)? Draaiboek §3 F.2 (`som-klopt-niet`):
 * Bliepo rekent het eerste huisje dat niet klopt voor ("4 en 3 is samen 7. We zoeken 6.") en noemt nooit het getal dat
 * erin moet.
 */
export function parenFout(v: ParenVraag, tel: number[]): Fout {
  const rests = v.paren.map(([t, d]) => t - d);
  const i = Math.max(0, tel.findIndex((c, j) => c !== rests[j]));
  const [t, d] = v.paren[i];
  const c = tel[i] ?? 0;
  const hint = ["Kijk ook naar de andere huisjes. Tel bij elk huisje door tot het getal in het dak.", "Begin bij het getal in het vakje ernaast en tel door tot het getal in het dak.", "Doe het huisje voor huisje. Het getal ernaast en de ballen samen zijn het getal in het dak."][v.nr % 3];
  return {
    code: "som-klopt-niet",
    denkfout: "in een huisje zijn het getal en de ballen samen niet het getal in het dak",
    eerste: c === 0 ? `Bij het huisje met ${g(t)} is het lege vakje nog leeg.` : `Bij het huisje met ${g(t)}: ${g(d, KA)} en ${g(c, KB)} is samen ${g(d + c)}. We zoeken ${g(t)}.`,
    hint,
    uitleg: "In elk huisje zijn het getal ernaast en de ballen samen het getal in het dak.",
    weer: [`Bij het huisje met ${g(t)} klopt het weer niet.`, `Het getal ernaast en de ballen samen moeten ${g(t)} zijn.`],
    scherm: "Bliepo's scherm 1,5 s rood (geen fout-geluidje); de ballen schudden even; na de pijl gaan de vakjes leeg en zegt Bliepo de opdracht kort opnieuw",
  };
}

/** De uitlegvraag "Hoeveel pionnen zijn er samen?" (draaiboek stap 7; de 2 delen en het totaal: 1 / 4 / 5). */
export const TOTAAL_KEUZES = [1, 4, 5];
export function totaalFout(x: number): Fout {
  const k = x === 1 ? KA : KB;
  const vak = x === 1 ? "paarse" : "oranje";
  return {
    code: "deel-voor-totaal",
    denkfout: "koos 1 van de delen in plaats van alles samen",
    eerste: `${g(x, k)} is het deel in het ${vak} vak.`,
    hint: "Ik bedoel alle pionnen samen. Tel de pionnen in allebei de vakken.",
    uitleg: "Het totaal is alles samen: de pionnen in allebei de vakken.",
    weer: ["Weer 1 van de delen.", "Het totaal zijn de pionnen in allebei de vakken samen."],
    scherm: "Bliepo's scherm 1,5 s rood; de knoppen gaan even weg en komen terug met de hint (draaiboek §3 B.2)",
  };
}

/* ---------- verklapcontrole (15.17), ook gebruikt door scripts/fouttabel-splitsen-gouden.ts ---------- */

/** Woorden die zeggen dat de delen omgedraaid zijn (dan weet het kind meteen het andere deel). */
export const OMDRAAIWOORDEN = /\b(omgedraaid|andersom|verwissel\w*|omgewisseld|wisselde|draaide|kanten)\b/i;
