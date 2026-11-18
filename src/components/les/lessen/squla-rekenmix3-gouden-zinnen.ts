/**
 * ALLE ZINNEN VAN BLIEPO in de gouden les Rekenmix 3 "heel moeilijk" (squla-rekenmix-mix3-4-gouden, 12 november 2026), op
 * één plek, met de FOUTTABEL. De les zelf (squla-rekenmix3-gouden.tsx) bevat geen eigen zinnen.
 *
 * Alle 15 vragen van Rekenmix 3 level 4 (squla-rekenmix-mix3-4) zijn splitsvragen: "Er zijn 6 ballen. Hoeveel zitten er in
 * de doos?" (een deel ligt buiten, de rest zit verstopt). Ze volgen de GOUDEN LES SPLITSEN (het totaal, het deel dat je
 * ziet, het deel dat je zoekt) in het verloop van de gouden Rekenmix: vraag met 3 keuzes, 1e fout = eerste zin + hint,
 * 2e fout = uitleg en samen tellen (de ballen komen uit de doos; het kind tikt ze aan, Bliepo telt verder vanaf het deel
 * dat buiten ligt), goed = lof, einde met slotzin en kaart. De rijtjes en de zinnen van het telverloop komen uit
 * squla-rekenmix4-gouden-zinnen.ts en squla-rekenmix-gouden-zinnen.ts (zelf geladen, niet gekopieerd).
 * EIGEN INVULLING, NIET VAN SYNTHESIS: de fouttabel, de hints en de zinnen bij het samen tellen.
 * Inhoud (BOUWREGELS 15.22): dezelfde 15 vragen als squla-rekenmix-mix3-4, in dezelfde volgorde, met dezelfde dingen
 * (ballen bij een doos, knikkers bij een zak), totalen, delen buiten en 3 keuzes.
 *
 * Leesbare versie: FOUTTABEL-squla-rekenmix-mix3-4-gouden.md (maak hem opnieuw met
 * `npx tsx scripts/fouttabel-rekenmix3-gouden.ts`). {7:rood} = een getal in de kleur van het ding.
 */

import { ZIN as ZIN4, BAL, KNIKKER, gk, type Ding, type Variant, deeltGetal4, eindigtMetOpdracht4, hard4, herhaling4, past4, woordenVan4 } from "./squla-rekenmix4-gouden-zinnen";
import { deeltStuk } from "./nooit-dubbel";
export { deeltStuk as deeltStuk3 };

export {
  AANMOEDIG_TIKKEN,
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
  RICHTINGWOORDEN,
  TELREACTIE_JA,
  TELREACTIE_ROBOT,
  gk,
  metNaam,
  type Ding,
  type Rijtje,
  type Variant,
  kaal4,
  past4,
  herhaling4,
  hard4,
  deeltGetal4,
  eindigtMetOpdracht4,
  woordenVan4,
  zinnenIn4,
  MAX_STUK_4,
} from "./squla-rekenmix4-gouden-zinnen";

/** Wisselwoorden voor de kiezer ("Je koos weer 3 ballen" = "Je koos weer 3 knikkers"). */
export const WISSEL_3 = ["bal", "ballen", "knikker", "knikkers", "doos", "zak", "elke", "elk"];

export type Houder = "doos" | "zak";
export type Vraag3 = { nr: number; id: string; ding: Ding; houder: Houder; tot: number; buiten: number; binnen: number; keuzes: number[] };
const V = (nr: number, d: Ding, houder: Houder, tot: number, buiten: number, keuzes: number[]): Vraag3 => ({
  nr,
  id: `vraag${nr}-${tot}-${buiten}-${d.naam.replace(/'/g, "")}`,
  ding: d,
  houder,
  tot,
  buiten,
  binnen: tot - buiten,
  keuzes,
});

/* Squla level 4 van Rekenmix 3 (oude les: squla-rekenmix.tsx mix3_4): een splitsbeen met het totaal, het deel dat je ziet en een
   vraagteken; alleen wat buiten ligt zie je, de rest zit in de doos (zak). Totalen 5 t/m 10. */
export const VRAGEN: Vraag3[] = [
  V(1, BAL, "doos", 6, 2, [4, 5, 3]),
  V(2, BAL, "doos", 5, 3, [2, 1, 3]),
  V(3, BAL, "doos", 8, 5, [4, 3, 2]),
  V(4, KNIKKER, "zak", 10, 7, [3, 4, 2]),
  V(5, KNIKKER, "zak", 9, 4, [5, 6, 4]),
  V(6, BAL, "doos", 7, 4, [2, 3, 4]),
  V(7, BAL, "doos", 9, 2, [7, 6, 8]),
  V(8, BAL, "doos", 10, 4, [6, 5, 7]),
  V(9, KNIKKER, "zak", 7, 2, [4, 5, 6]),
  V(10, KNIKKER, "zak", 8, 7, [2, 1, 3]),
  V(11, KNIKKER, "zak", 6, 5, [1, 2, 3]),
  V(12, BAL, "doos", 10, 2, [8, 9, 7]),
  V(13, KNIKKER, "zak", 5, 1, [3, 4, 5]),
  V(14, BAL, "doos", 9, 5, [4, 3, 5]),
  V(15, BAL, "doos", 8, 4, [5, 4, 3]),
];

/* ---------- de plek van de dingen ---------- */

export type Plek3 = { beeld: string; x: number; y: number; m: number; boven: number; rol: "houder" | "buiten" | "binnen" };
const CEL = 96;
const M = 80;

/** Eerst de doos (of zak), dan wat buiten ligt (rijen van 5, links), dan wat erin zit (boven de doos, pas zichtbaar bij het samen tellen). */
export function plekken(v: Vraag3): Plek3[] {
  const p: Plek3[] = [{ beeld: v.houder, x: 250, y: 150, m: 270, boven: 0, rol: "houder" }];
  for (let i = 0; i < v.buiten; i++) p.push({ beeld: v.ding.beeld, x: -400 + ((i % 5) + 0.5) * CEL, y: 100 + Math.floor(i / 5) * 128, m: M, boven: M / 2 + 18, rol: "buiten" });
  for (let i = 0; i < v.binnen; i++) p.push({ beeld: v.ding.beeld, x: 250 + ((i % 4) - 1.5) * CEL, y: -20 - Math.floor(i / 4) * 128, m: M, boven: M / 2 + 18, rol: "binnen" });
  return p;
}
export const buitenIdx = (v: Vraag3) => Array.from({ length: v.buiten }, (_, i) => 1 + i);
export const binnenIdx = (v: Vraag3) => Array.from({ length: v.binnen }, (_, i) => 1 + v.buiten + i);

/* ---------- vaste zinnen van het verloop ---------- */

/** "er zat 1" maar "er zaten 4". */
const zat = (v: Vraag3) => (v.binnen === 1 ? "zat" : "zaten");
const de = (h: Houder) => (h === "doos" ? "de doos" : "de zak");
export const ZIN = {
  begin: "In deze les zoek je wat er verstopt zit.",
  /** De vraag (zoals de oude les): het totaal, en wat je zoekt. De eerste keer met wat het kind moet doen (3.15). */
  vraag: (v: Vraag3, eerste = false): string[] => [`Er zijn ${gk(v.tot, v.ding)} ${v.ding.naam}.`, `Hoeveel zitten er in ${de(v.houder)}?`, ...(eerste ? ["Tik op het goede getal."] : [])],
  /**
   * Na de hint bij de 1e fout komt de vraag terug (F16, Sara 18 november 2026; BOUWREGELS 15.37 en 14.32): een hint als
   * "Het gaat om wat je niet ziet." zegt niet wat het kind moet doen. Niet als de hint zelf al een vraag is.
   */
  opnieuw: (v: Vraag3): string => `Hoeveel zitten er in ${de(v.houder)}?`,
  samenHelp: ZIN4.samenHelp,
  /** Samen tellen na de 2e fout (in delen, zodat de les er rustig tussen kan wachten). */
  samenBuiten: (v: Vraag3) => `Buiten ${de(v.houder)} liggen er ${gk(v.buiten, v.ding)}.`,
  samenKomen: (v: Vraag3) => `Nu komen de ${v.ding.naam} uit ${de(v.houder)}.`,
  samenTik: (v: Vraag3) => `Tik op elke ${v.ding.een} uit ${de(v.houder)}. Ik tel verder.`,
  samenHand: (v: Vraag3) => `Tik op een ${v.ding.een} zonder nummer.`,
  samenKlaar: (v: Vraag3) => `${gk(v.binnen, v.ding)}. In ${de(v.houder)} ${zat(v)} er ${gk(v.binnen, v.ding)}.`,
  samenZelf: (v: Vraag3) => `Kijk, ik tel de rest. In ${de(v.houder)} ${zat(v)} er ${gk(v.binnen, v.ding)}.`,
  /** Bij de eerste vraag goed in 1 keer: samen controleren (zoals natellen bij Tellen). */
  natellen: "Laten we samen kijken wat er verstopt zit.",
  natellenKlaar: (v: Vraag3) => `Zie je? In ${de(v.houder)} ${zat(v)} er ${gk(v.binnen, v.ding)}. Je had het precies goed.`,
  slot: "Je vond alles wat er verstopt zat.",
  kaartTik: ZIN4.kaartTik,
  weerGekozen: (x: number, d: Ding) => ZIN4.weerGekozen(x, d),
};

/** De reactie met wat er in de doos zat (zelfde soort als de reactie met het aantal bij Tellen). */
export const SPLITSREACTIE = (v: Vraag3) => ({
  zinnen: [
    `Ja, er ${zat(v)} er ${gk(v.binnen, v.ding)} in ${de(v.houder)}.`,
    `Ja, ${gk(v.buiten, v.ding)} en ${gk(v.binnen, v.ding)} is samen ${gk(v.tot, v.ding)}.`,
    `Dat past: er ${zat(v)} er ${gk(v.binnen, v.ding)} in ${de(v.houder)}.`,
    `In ${de(v.houder)} ${zat(v)} er ${gk(v.binnen, v.ding)}.`,
    v.binnen === 1 ? `Er ${zat(v)} er ${gk(1, v.ding)} verstopt.` : `${gk(v.binnen, v.ding)} ${v.ding.naam} ${zat(v)} er verstopt.`,
  ],
  robot: [] as number[],
});
/** Zinnen die met "Ja" beginnen (niet na een lof met "Ja"). */
export const SPLITSREACTIE_JA = [0, 1];

/* ---------- denkfouten ---------- */

export const DENKFOUTEN = ["buiten-genoemd", "totaal-genoemd", "te-veel", "te-weinig", "onduidelijk"] as const;
export type Denkfoutnaam = (typeof DENKFOUTEN)[number];

export type Fout = {
  code: Denkfoutnaam;
  soort: string;
  denkfout: string;
  eerste: string;
  hint: string;
  uitleg: string;
  weer: string[];
  scherm: string;
  noot?: string;
};

const SCHERM = "vraag en knoppen even weg; de dingen blijven staan (wat in de doos zit, blijft verstopt); Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl)";

/**
 * De fouttabel van 1 fout antwoord. Drie soorten denkfout: het kind noemt het deel dat je ziet (buiten), het totaal, of
 * een ander getal waar buiten + gekozen getal niet het totaal geeft (te veel of te weinig). Bliepo noemt wat er klopt
 * ("Met 5 in de doos zijn er 7 ballen") en wijst niet naar het goede getal; de hint zegt hoe je het zoekt.
 */
export function splitsFout(x: number, v: Vraag3): Fout {
  const d = v.ding;
  const X = gk(x, d);
  const T = gk(v.tot, d);
  const B = gk(v.buiten, d);
  const s = v.buiten + x;
  const S = gk(s, d);
  const i = v.nr % 3;
  const h = de(v.houder);
  if (x === v.buiten) {
    return {
      code: "buiten-genoemd",
      soort: "buiten-genoemd",
      denkfout: "noemde het deel dat je ziet (buiten) in plaats van wat verstopt zit",
      eerste: [`${X} liggen er buiten.`, `Die ${X} zie je al.`, `${X} ${d.naam} liggen er buiten ${h}.`][i],
      hint: ["Zoek wat er in " + h + " zit.", "Het gaat om wat je niet ziet.", "Denk aan wat verstopt zit."][i],
      uitleg: `De rest zit verstopt in ${h}.`,
      weer: [`Dat zijn weer de ${d.naam} die buiten liggen.`, `De ${d.naam} in ${h} zie je niet.`],
      scherm: SCHERM,
    };
  }
  if (x === v.tot) {
    return {
      code: "totaal-genoemd",
      soort: "totaal-genoemd",
      denkfout: "noemde het totaal in plaats van wat verstopt zit",
      eerste: [`${X} is het totaal.`, `${X} zijn er samen.`, `Je koos ${X}. Dat zijn ze allemaal.`][i],
      hint: ["Een deel ligt buiten.", "Zoek alleen wat verstopt zit.", "Niet alle " + d.naam + " zitten in " + h + "."][i],
      uitleg: `Een deel van de ${d.naam} ligt buiten ${h}.`,
      weer: [`Dat zijn weer alle ${d.naam} samen.`, `Een deel ligt aan de buitenkant.`],
      scherm: SCHERM,
    };
  }
  const groot = x > v.binnen;
  return {
    code: groot ? "te-veel" : "te-weinig",
    soort: groot ? "te-veel" : "te-weinig",
    denkfout: groot ? "koos te veel: buiten en gekozen getal samen komt boven het totaal" : "koos te weinig: buiten en gekozen getal samen komt onder het totaal",
    eerste: [`Je koos ${X}. Samen met de ${d.naam} buiten is dat ${S}.`, `Met ${X} in ${h} zijn er ${S} ${d.naam}.`, `${X} in ${h} maakt samen ${S}.`][i],
    hint: [`Hoeveel moet erbij tot ${T}?`, `Begin bij ${B} en tel door tot ${T}.`, `Tel verder vanaf ${B}.`][i],
    uitleg: groot ? `Dan zijn het er meer dan ${T}.` : `Dan zijn het er minder dan ${T}.`,
    weer: groot ? ["Je zat weer te hoog.", `Het moeten er ${T} zijn.`] : ["Je zat weer te laag.", `Het moeten er ${T} zijn.`],
    scherm: SCHERM,
  };
}

/** Er is geen "dichtbij" bij splitsen; deze twee bestaan alleen omdat de les ze van Tellen kent. */
export const dichtbijAnders = (_x: number, v: Vraag3) => splitsFout(v.keuzes.find((k) => k !== v.binnen) ?? 0, v).eerste;
export const zonderDichtbij = (x: number, v: Vraag3) => splitsFout(x, v).eerste;

export const foutenVan = (v: Vraag3): Record<string, Fout> => Object.fromEntries(v.keuzes.filter((k) => k !== v.binnen).map((k) => [String(k), splitsFout(k, v)]));

/* =====================================================================================================================
 * DE ZINNEN VAN 18 NOVEMBER 2026: Bliepo als warme juf, in varianten (Sara; zelfde aanpak als de proefles Tellen, de les
 * Splitsen en de andere gouden lessen). Oud naast nieuw: WIJZIGINGEN-ZINNEN-REKENMIX34.md.
 *
 * Alleen voor de gouden les Rekenmix 3 (squla-rekenmix3-gouden.tsx) en het fouttabel-script. Alles hierboven (ZIN,
 * SPLITSREACTIE, splitsFout, foutenVan, plekken) blijft zoals het was; de denkfout (code, soort) komt nog uit splitsFout.
 * De oude zinnen zijn telkens 1 van de varianten. De les kiest met de gedeelde kiezer (nooit-dubbel.ts): nooit dezelfde
 * zin 2 keer achter elkaar, ook niet over vragen heen. Getallen, antwoorden, keuzes en de betekenis zijn niet veranderd.
 * De vraag ("Er zijn 6 ballen. Hoeveel zitten er in de doos?") blijft gelijk (3.11, 15.36). Na de hint komt de vraag terug
 * (logica-controle, F16): "Hoeveel zitten er in de doos?" is daar nog steeds 1 van de versies.
 * EIGEN INVULLING, NIET VAN SYNTHESIS (Synthesis heeft geen les "wat zit er in de doos"); alleen de algemene zinnen
 * "Ik help je even", "Precies" en "Kijk, daar …" komen van Synthesis, in het Nederlands.
 * ===================================================================================================================== */

/** "1 bal", maar "4 ballen". */
const n3 = (n: number, d: Ding) => `${gk(n, d)} ${n === 1 ? d.een : d.naam}`;
/** "er ligt 1", maar "er liggen 3". */
const ligt = (n: number) => (n === 1 ? "ligt" : "liggen");
/** "zit" of "zitten" (nu), "zat" of "zaten" (toen). */
const zitNu = (n: number) => (n === 1 ? "zit" : "zitten");
const Hoofd3 = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

export const RM3 = {
  /** Stap 1: openen (samen met de groet 1 stuk). Vraag 1 is een doos met ballen. De eerste versie is de oude zin. */
  begin: ["In deze les zoek je wat er verstopt zit.", "Vandaag zoeken we wat er in de doos verstopt zit.", "Kijk, we gaan zoeken wat er in de doos verstopt zit."],
  /** De vraag, zoals de oude les (overal gelijk; 3.11). De eerste keer met wat het kind moet doen (3.15). */
  vraag: (v: Vraag3, eerste = false): string[] => ZIN.vraag(v, eerste),
  /**
   * De vraag terug na de hint (F16, 15.37): "Hoeveel zitten er in de doos?" (de oude zin van de logica-controle) of een
   * andere versie. Noemt nooit een getal. Niet als de hint zelf al een vraag is.
   */
  opnieuw: (v: Vraag3): string[] => [`Hoeveel zitten er in ${de(v.houder)}?`, `Hoeveel zitten er dan in ${de(v.houder)}?`, `Hoeveel ${v.ding.naam} zijn er verstopt, denk je?`],
  /** Na de 2e keer: samen tellen. */
  samenHelp: (v: Vraag3) => ["Kom, we tellen ze samen.", "Geeft niks. We tellen ze samen.", "Ik help je even. We tellen samen.", `Weet je wat? We kijken samen in ${de(v.houder)}.`],
  /** Samen tellen na de 2e fout (in delen, zodat de les er rustig tussen kan wachten). */
  samenBuiten: (v: Vraag3) => [`Buiten ${de(v.houder)} ${ligt(v.buiten)} er ${n3(v.buiten, v.ding)}.`, `Kijk, buiten ${de(v.houder)} ${ligt(v.buiten)} ${n3(v.buiten, v.ding)}.`],
  /** Bij 1 ding in de doos: enkelvoud ("Nu komt de knikker uit de zak."). */
  samenKomen: (v: Vraag3) =>
    v.binnen === 1
      ? [`Nu komt de ${v.ding.een} uit ${de(v.houder)}.`, `Kijk, de ${v.ding.een} komt uit ${de(v.houder)}.`, `${Hoofd3(de(v.houder))} gaat open. Daar is hij!`]
      : [`Nu komen de ${v.ding.naam} uit ${de(v.houder)}.`, `Kijk, de ${v.ding.naam} komen uit ${de(v.houder)}.`, `${Hoofd3(de(v.houder))} gaat open. Daar zijn ze!`],
  samenTik: (v: Vraag3) =>
    v.binnen === 1
      ? [`Tik op de ${v.ding.een} uit ${de(v.houder)}. Ik tel verder.`, `Tik de nieuwe ${v.ding.een} aan. Ik tel door.`]
      : [`Tik op elke ${v.ding.een} uit ${de(v.houder)}. Ik tel verder.`, `Tik de ${v.ding.naam} uit ${de(v.houder)} aan. Ik tel door.`, `Tik op de nieuwe ${v.ding.naam}. Ik tel verder.`],
  samenHand: (v: Vraag3) => [`Tik op een ${v.ding.een} zonder nummer.`, `Zoek een ${v.ding.een} zonder nummer en tik erop.`, `Welke ${v.ding.een} heeft nog geen nummer? Tik erop.`],
  /**
   * Klaar met samen tellen. Het laatste getal (het totaal) zegt Bliepo hier, niet ook nog los ervoor; daarna wat er in de
   * doos zat (keuring K3: niet meer "4. In de doos zaten er 4.", het getal 2 keer achter elkaar).
   */
  samenKlaar: (v: Vraag3) => [`En ${gk(v.tot, v.ding)}! Er ${zat(v)} ${n3(v.binnen, v.ding)} in ${de(v.houder)}.`, `En de laatste is ${gk(v.tot, v.ding)}. In ${de(v.houder)} ${zat(v)} er ${gk(v.binnen, v.ding)}.`, `En ${gk(v.tot, v.ding)}! Dus in ${de(v.houder)} ${zat(v)} er ${gk(v.binnen, v.ding)}.`],
  /** Vangnet: 20 s geen tik, dan telt Bliepo de rest zelf (geen "Ja", geen "samen"; begint met "Kijk,"). */
  samenZelf: (v: Vraag3) => [`Kijk, ik tel de rest. In ${de(v.houder)} ${zat(v)} er ${gk(v.binnen, v.ding)}.`, `Kijk, ik tel even verder. Er ${zat(v)} ${n3(v.binnen, v.ding)} in ${de(v.houder)}.`],
  /** Bij de eerste vraag goed in 1 keer: samen nakijken (zoals natellen bij Tellen). */
  natellen: (v: Vraag3) => ["Laten we samen kijken wat er verstopt zit.", `Kom, we kijken samen in ${de(v.houder)}.`, "Ik tel hardop verder. Tel maar mee!"],
  /** Na het hardop tellen: het laatste getal (het totaal) zegt Bliepo hier, niet ook nog los ervoor. */
  natellenKlaar: (v: Vraag3) => [`En ${gk(v.tot, v.ding)}! In ${de(v.houder)} ${zat(v)} er ${gk(v.binnen, v.ding)}. Je had het precies goed.`, `En ${gk(v.tot, v.ding)}! Er ${zat(v)} ${n3(v.binnen, v.ding)} verstopt. Jij had het goed.`],
  /** Als het kind op de pijl tikte (alle nummers staan er meteen): Bliepo noemde nog geen getal. De eerste is de oude zin. */
  natellenKlaarSnel: (v: Vraag3) => [`Zie je? In ${de(v.houder)} ${zat(v)} er ${gk(v.binnen, v.ding)}. Je had het precies goed.`, `Kijk, daar ${zat(v) === "zat" ? "is" : "zijn"} ze: ${n3(v.binnen, v.ding)}. Jij had het goed.`],
  /** Stap 10: einde. De eerste versie is de oude zin. */
  slot: ["Je vond alles wat er verstopt zat.", "Knap, hoor! Je vond alles wat er verstopt zat.", "Wat goed gezocht! Niets bleef verstopt voor jou."],
  kaartTik: ["Tik op de kaart.", "Tik maar op de kaart.", "Kijk, een kaart voor jou! Tik erop."],
  /** Hetzelfde getal 2 keer gekozen: niet 2 keer dezelfde eerste zin. */
  weerGekozen: (x: number, d: Ding) => [`Je koos weer ${gk(x, d)}.`, `Je tikte weer op ${gk(x, d)}.`, `Weer ${gk(x, d)}, zie ik.`],
  aanmoedigTikken: ["Je bent goed bezig.", "Jij kunt dit.", "Het gaat goed zo.", "Probeer het maar.", "Toe maar, je doet het goed."],
};

/**
 * De zin met wat er in de doos zat, na de lof. 0 en 1 beginnen met "Ja" (SPLITSREACTIE_JA). De eerste 5 zijn de oude
 * zinnen, iets natuurlijker ("Ja, er zaten 4 ballen in de doos." in plaats van "Ja, er zaten er 4 in de doos.").
 */
export const SPLITSREACTIE_3 = (v: Vraag3): string[] => [
  `Ja, er ${zat(v)} ${n3(v.binnen, v.ding)} in ${de(v.houder)}.`,
  `Ja, ${gk(v.buiten, v.ding)} en ${gk(v.binnen, v.ding)} is samen ${gk(v.tot, v.ding)}.`,
  `Dat klopt: er ${zat(v)} ${n3(v.binnen, v.ding)} verstopt.`,
  `In ${de(v.houder)} ${zat(v)} er ${gk(v.binnen, v.ding)}.`,
  `Er ${zat(v)} ${n3(v.binnen, v.ding)} in ${de(v.houder)}.`,
  `Precies, ${gk(v.buiten, v.ding)} buiten en ${gk(v.binnen, v.ding)} in ${de(v.houder)}.`,
  `Precies, zoveel ${zat(v)} er verstopt.`,
  `Dat klopt: zoveel ${v.ding.naam} ${zat(v)} er in ${de(v.houder)}.`,
];

/* ---------- de fout-varianten (18 nov 2026) ---------- */

export type Varianten3 = { eerste: string[]; hint: string[]; uitleg: string[]; weerEerste: string[]; weerUitleg: string[] };
export type Fout3 = Fout & { v: Varianten3 };

/**
 * Alle varianten bij 1 antwoord dat niet goed is (dezelfde denkfout als splitsFout). Bliepo noemt wat het kind koos maar
 * 1 keer, noemt wat er klopt ("Met 5 in de doos zijn er 7 ballen") en wijst nooit naar het goede getal (15.17).
 */
export function variantenVan3(x: number, v: Vraag3): Varianten3 {
  const d = v.ding;
  const X = gk(x, d);
  const T = gk(v.tot, d);
  const B = gk(v.buiten, d);
  const S = gk(v.buiten + x, d);
  const h = de(v.houder);
  const f = splitsFout(x, v);
  if (f.code === "buiten-genoemd")
    return {
      eerste: [`${X} ${ligt(x)} er buiten.`, `Die ${X} zie je al.`, `${n3(x, d)} ${ligt(x)} er buiten ${h}.`, `${X}? Die ${ligt(x)} buiten ${h}.`, `Je tikte op ${X}. Die zie je al buiten ${h}.`],
      hint: [`Zoek wat er in ${h} zit.`, "Het gaat om wat je niet ziet.", "Denk aan wat verstopt zit.", "Kijk naar het vraagteken. Dat deel zoeken we."],
      uitleg: [`De rest zit verstopt in ${h}.`, `In ${h} ${zitNu(v.binnen)} nog meer ${d.naam}.`, `Je zoekt de ${d.naam} die je niet ziet.`, "Er zit nog meer verstopt."],
      weerEerste: [`Dat zijn weer de ${d.naam} die buiten liggen.`, `Weer de ${d.naam} van buiten, zie ik.`],
      weerUitleg: [`De ${d.naam} in ${h} zie je niet.`, `We zoeken wat er in ${h} zit.`],
    };
  if (f.code === "totaal-genoemd")
    return {
      eerste: [`${X} is het totaal.`, `${X} zijn er samen.`, `Je koos ${X}. Dat zijn ze allemaal.`, `${X}? Dat zijn alle ${d.naam} samen.`, `Je tikte op ${X}. Zoveel zijn het er samen.`],
      hint: ["Een deel ligt buiten.", "Zoek alleen wat verstopt zit.", `Niet alle ${d.naam} zitten in ${h}.`, `Kijk ook naar de ${d.naam} buiten ${h}.`],
      uitleg: [`Een deel van de ${d.naam} ligt buiten ${h}.`, `Niet alle ${d.naam} zitten in ${h}. Een deel ligt ernaast.`, `De ${d.naam} buiten ${h} zitten er niet in.`],
      weerEerste: [`Dat zijn weer alle ${d.naam} samen.`, `Weer alle ${d.naam}, zie ik.`],
      weerUitleg: ["Een deel ligt aan de buitenkant.", `Alleen wat in ${h} zit, telt.`],
    };
  const groot = x > v.binnen;
  return {
    eerste: [`Je koos ${X}. Samen met de ${d.naam} buiten is dat ${S}.`, `Met ${X} in ${h} zijn er ${S} ${d.naam}.`, `${X} in ${h} maakt samen ${S}.`, `${X}? Dan heb je er samen ${S}.`, `Je tikte op ${X}. Met de ${d.naam} buiten erbij is dat ${S}.`],
    hint: [`Hoeveel moet erbij tot ${T}?`, `Begin bij ${B} en tel door tot ${T}.`, `Tel verder vanaf ${B}.`, `Buiten ${ligt(v.buiten)} er ${B}. Tel door tot ${T}.`],
    uitleg: groot
      ? [`Dan zijn het er meer dan ${T}.`, `Dan kom je boven de ${T} uit.`, `Dat zijn er te veel. Samen zijn het er ${T}.`, `Er zijn maar ${T} ${d.naam}.`]
      : [`Dan zijn het er minder dan ${T}.`, `Dan kom je niet tot ${T}.`, `Dat zijn er te weinig. Samen zijn het er ${T}.`, `Er zijn wel ${T} ${d.naam}.`],
    weerEerste: groot ? ["Je zat weer te hoog.", "Ook nu zijn het er samen te veel."] : ["Je zat weer te laag.", "Ook nu zijn het er samen te weinig."],
    weerUitleg: [`Het moeten er ${T} zijn.`, `Buiten en in ${h} samen is ${T}.`],
  };
}

/** De fouttabel van een vraag met alle varianten (splitsFout hierboven + `v`). */
export const fouten3 = (v: Vraag3): Record<string, Fout3> => Object.fromEntries(v.keuzes.filter((k) => k !== v.binnen).map((k) => [String(k), { ...splitsFout(k, v), v: variantenVan3(k, v) }]));

const VW3 = new Map<string, Set<string>>();
/** De woorden van de vraag zelf (die mogen in een reactie terugkomen). */
export const vraagWoorden3 = (v: Vraag3) => VW3.get(v.id) ?? VW3.set(v.id, new Set(woordenVan4(ZIN.vraag(v).join(" ")))).get(v.id)!;
/** Een klein geheugen: dezelfde vraag + dezelfde zinnen geven altijd dezelfde lijst (sneller; verandert niets). */
const GEHEUGEN3 = new Map<string, string[]>();
const onthoud3 = (sleutel: string, maak: () => string[]) => GEHEUGEN3.get(sleutel) ?? GEHEUGEN3.set(sleutel, maak()).get(sleutel)!;
/** Past zin `z` achter `a` in 1 reactie? Geen getal, geen stuk van 2 woorden en geen woord 2 keer; als `stuk`: ook samen in het tekstvak. */
const na3 = (v: Vraag3, a: string, stuk: boolean) => (z: string) => !deeltGetal4(a, z) && !deeltStuk(a, z) && herhaling4([a, z], vraagWoorden3(v)) === null && (!stuk || past4(a, z));
/** De vragen die na eerste zin + hint passen (15.37, F16). */
export const opnieuwNa3 = (v: Vraag3, eerste: string, hint: string) => onthoud3(`o|${v.id}|${eerste}|${hint}`, () => RM3.opnieuw(v).filter((z) => past4(hint, z) && !deeltGetal4(`${eerste} ${hint}`, z) && herhaling4([eerste, hint, z], vraagWoorden3(v)) === null));
/** De hints die na deze eerste zin passen, en waarachter de vraag nog past (of die zelf al een vraag zijn). */
export const hintsNa3 = (f: Fout3, v: Vraag3, eerste: string) => onthoud3(`h|${v.id}|${f.v.hint.join("|")}|${eerste}`, () => f.v.hint.filter((h) => na3(v, eerste, false)(h) && (eindigtMetOpdracht4(h) || opnieuwNa3(v, eerste, h).length > 0)));
/** De uitleggen (of "weer"-uitleggen) die na deze eerste zin passen. */
export const uitlegNa3 = (lijst: readonly string[], v: Vraag3, eerste: string) => onthoud3(`u|${v.id}|${lijst.join("|")}|${eerste}`, () => lijst.filter(na3(v, eerste, true)));
const ofAlles3 = (l: string[], alles: readonly string[]) => (l.length ? l : [...alles]);

/**
 * Wat Bliepo zegt bij een antwoord dat niet goed is. De les en het fouttabel-script gebruiken precies deze functie.
 *   1e keer: eerste zin (wat het kind koos) + hint. Daarna komt de vraag terug (opnieuw3), als de hint geen vraag is.
 *   2e keer: hetzelfde getal: "Je koos weer …" + uitleg; dezelfde denkfout met een ander getal: "weer …" + een andere
 *   uitleg; anders een andere eerste zin + uitleg. Daarna tellen we samen.
 * Harde eisen (vooraf uit de lijst): het stuk past in het tekstvak, geen getal en geen woord 2 keer in 1 reactie.
 */
export function foutReactie3(variant: Variant, f: Fout3, v: Vraag3, o: { x: number; poging: 1 | 2; eerder: Fout | null; eersteX: number | null; eersteZin: string; onduidelijk: () => string }): string[] {
  if (f.code === "onduidelijk") {
    const e = o.onduidelijk();
    return o.poging === 1 ? [e, variant("hint", ofAlles3(hintsNa3(f, v, e), f.v.hint))] : [e, variant("uitleg", ofAlles3(uitlegNa3(f.v.uitleg, v, e), f.v.uitleg))];
  }
  if (o.poging === 1) {
    const e = variant("eerste", hard4(f.v.eerste, (z) => hintsNa3(f, v, z).length > 0));
    return [e, variant("hint", ofAlles3(hintsNa3(f, v, e), f.v.hint))];
  }
  if (o.x === o.eersteX) {
    const e = variant("weerGekozen", hard4(RM3.weerGekozen(o.x, v.ding), (z) => uitlegNa3(f.v.uitleg, v, z).length > 0));
    return [e, variant("uitleg", ofAlles3(uitlegNa3(f.v.uitleg, v, e), f.v.uitleg))];
  }
  if (o.eerder !== null && o.eerder.soort === f.soort && f.v.weerEerste.length) {
    const weer = variant("weer", hard4(f.v.weerEerste, (z) => uitlegNa3(f.v.weerUitleg, v, z).length > 0));
    return [weer, variant("weerUitleg", ofAlles3(uitlegNa3(f.v.weerUitleg, v, weer), f.v.weerUitleg))];
  }
  const e = variant("eerste", hard4(f.v.eerste, (z) => z !== o.eersteZin && uitlegNa3(f.v.uitleg, v, z).length > 0));
  return [e, variant("uitleg", ofAlles3(uitlegNa3(f.v.uitleg, v, e), f.v.uitleg))];
}

/**
 * De vraag terug na de hint (F16, 15.37): past samen met de hint in het tekstvak en herhaalt geen getal of woord uit de
 * eerste zin en de hint. Is de hint zelf al een vraag ("Hoeveel moet erbij tot 6?"), dan niets.
 */
export function opnieuw3(variant: Variant, v: Vraag3, eerste: string, hint: string): string {
  if (eindigtMetOpdracht4(hint)) return "";
  return variant("opnieuw", ofAlles3(opnieuwNa3(v, eerste, hint), RM3.opnieuw(v)));
}
