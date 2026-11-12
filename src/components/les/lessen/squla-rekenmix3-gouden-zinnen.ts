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

import { ZIN as ZIN4, BAL, KNIKKER, gk, type Ding } from "./squla-rekenmix4-gouden-zinnen";

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
} from "./squla-rekenmix4-gouden-zinnen";

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
