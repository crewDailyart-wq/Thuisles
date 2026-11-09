/**
 * ALLE ZINNEN VAN BLIEPO in de gouden les Tellen (squla-tellen-fruit-1-gouden, 9 november 2026), op één plek, met de
 * FOUTTABEL. De les zelf (squla-tellen-gouden.tsx) bevat geen eigen zinnen.
 *
 *   - De rijtjes (lof, speciale momenten, naam, goed na een fout, begin en einde, eerste zin als de denkfout niet
 *     duidelijk is, aanmoedigen, overgang) zijn dezelfde als in de gouden klokles: ze komen uit BLIEPO-KARAKTER.md en
 *     staan in squla-klok-gouden-zinnen.ts. Hier alleen de reactie bij Tellen (BLIEPO-KARAKTER.md §4, zin 6, 7 en 10).
 *   - De inhoud (15 vragen, getallen en 3 keuzes per vraag) is die van squla-tellen-fruit-1 (BOUWREGELS 15.22).
 *   - De FOUTTABEL is EIGEN INVULLING, NIET VAN SYNTHESIS: alle vragen gaan over 11 t/m 17 en het draaiboek Tellen
 *     (Color Count) gaat tot 10 (BOUWREGELS 15.22 punt 5). De soort reactie (richting noemen, opnieuw tellen) volgt wel
 *     het draaiboek §3 A en §7.
 *
 * Leesbare versie: FOUTTABEL-squla-tellen-fruit-1-gouden.md (maak hem opnieuw met
 * `npx tsx scripts/fouttabel-tellen-gouden.ts`). {12:rood} = een getal in de kleur van het fruit.
 */

import type { Kleurnaam, Soort } from "../vlakken/squla-tellen-tekenen";
import { VASTE_KLEUR } from "../vlakken/squla-tellen-tekenen";
import type { Rijtje } from "./squla-klok-gouden-zinnen";

export {
  AANMOEDIG,
  AANMOEDIG_KIEST,
  BEVESTIG,
  EINDE,
  EINDE_VEEL_FOUTEN,
  LOF,
  LOF_KIJK_INDEX,
  MOMENT,
  NAAM_GROET,
  NAAM_LOF,
  ONDUIDELIJK,
  ONDUIDELIJK_ANDERE,
  ONDUIDELIJK_NOG_1_KEER,
  OVERGANG,
  metNaam,
  type Rijtje,
} from "./squla-klok-gouden-zinnen";

const rij = (zinnen: string[], robot: number[] = []): Rijtje => ({ zinnen, robot });

/* ---------- het fruit ---------- */

export type Fruit = { soort: Soort; een: string; naam: string; kleur: Kleurnaam };
const fruit = (soort: Soort, een: string, naam: string): Fruit => ({ soort, een, naam, kleur: VASTE_KLEUR[soort] });
export const APPEL = fruit("appel", "appel", "appels");
export const PEER = fruit("peer", "peer", "peren");
export const PRUIM = fruit("pruim", "pruim", "pruimen");

/** Een getal in de kleur van het fruit waar het naar verwijst (BOUWREGELS 2.1, 2.2). */
export const gk = (n: number, f: Fruit) => `{${n}:${f.kleur}}`;

/* ---------- de 15 vragen van squla-tellen-fruit-1 (zelfde volgorde, getallen en keuzes) ---------- */

export type Telvraag = { nr: number; id: string; fruit: Fruit; n: number; keuzes: number[] };
const V = (nr: number, f: Fruit, n: number, keuzes: number[]): Telvraag => ({ nr, id: `vraag${nr}-${n}-${f.naam}`, fruit: f, n, keuzes });

export const VRAGEN: Telvraag[] = [
  V(1, APPEL, 12, [10, 11, 12]),
  V(2, PEER, 11, [11, 12, 13]),
  V(3, PRUIM, 13, [12, 13, 14]),
  V(4, APPEL, 14, [14, 15, 16]),
  V(5, PEER, 12, [11, 12, 13]),
  V(6, PRUIM, 15, [13, 14, 15]),
  V(7, APPEL, 16, [15, 16, 17]),
  V(8, PEER, 13, [13, 14, 15]),
  V(9, PRUIM, 17, [15, 16, 17]),
  V(10, PEER, 14, [13, 14, 15]),
  V(11, APPEL, 13, [12, 13, 14]),
  V(12, PRUIM, 16, [16, 17, 18]),
  V(13, PEER, 15, [14, 15, 16]),
  V(14, APPEL, 17, [16, 17, 18]),
  V(15, PRUIM, 11, [9, 10, 11]),
];

/* ---------- vaste zinnen van het verloop (draaiboek Tellen §2; eigen woorden) ---------- */

export const ZIN = {
  /** Stap 1: openen (eigen beginzin van de les, BOUWREGELS 4.3). */
  begin: ["In deze les tel je fruit.", `Kijk, de appels liggen in rijen van ${gk(5, APPEL)}.`],
  pijlUitleg: "Klaar met kijken? Tik dan op de blauwe pijl.",
  /** De vraag (Squla: "Hoeveel … zie je?"); de eerste keer met wat het kind moet doen (de knoppen 1 keer uitleggen, 3.15). */
  vraag: (f: Fruit) => `Hoeveel ${f.naam} zie je?`,
  vraagEerste: "Tel ze en tik op het goede getal.",
  /** Draaiboek §3 A.1 (b): bij de eerste telvraag samen natellen. */
  natellen: "Laten we ze samen natellen.",
  natellenKlaar: (n: number, f: Fruit) => [`Zie je? Het zijn er ${gk(n, f)}.`, "Je had het precies goed."],
  /** Draaiboek §3 A.3: na de 2e fout samen tellen. */
  samenHelp: "Kom, we tellen ze samen.",
  samenTik: (f: Fruit) => `Tik op elke ${f.een}. Ik tel mee.`,
  samenHand: (f: Fruit) => `Tik op een ${f.een} zonder nummer.`,
  samenKlaar: (n: number, f: Fruit) => [`${gk(n, f)}.`, `Samen telden we ${gk(n, f)} ${f.naam}.`],
  /** Stap 10: einde. */
  slot: "Je telde fruit tot wel 17.",
};

/** BLIEPO-KARAKTER.md §4 Tellen: zin 6, 7 en 10 (met het aantal, zoals de lof in het draaiboek). */
export const TELREACTIE = (n: number, f: Fruit) => rij([`Ja, er zijn er ${gk(n, f)}.`, `Ja, je telde ze allemaal: ${gk(n, f)}.`, `Ik heb ze nagekeken: het zijn er ${gk(n, f)}.`], [2]);

/* ---------- denkfouten (draaiboek Tellen §7; namen voor de voortgang) ---------- */

export const DENKFOUTEN = ["te-weinig", "te-veel", "alleen-volle-rijen", "onduidelijk"] as const;
export type Denkfoutnaam = (typeof DENKFOUTEN)[number];

export type Fout = {
  code: Denkfoutnaam;
  /** Welke uitleg bij de 2e fout hoort (sleutel in UITLEG). */
  soort: string;
  denkfout: string;
  /** Bliepo's eerste zin (leeg bij "onduidelijk": dan een zin uit BLIEPO-KARAKTER.md §10). */
  eerste: string;
  hint: string;
  /** Wat er op het scherm gebeurt. */
  scherm: string;
  /** Waarom de richting niet genoemd wordt (zou het antwoord verklappen, BOUWREGELS 15.17). */
  noot?: string;
};

/** Uitleg na de 2e fout per soort denkfout (zonder het antwoord), en een andere uitleg als dezelfde denkfout nog eens komt. */
export const UITLEG: Record<string, { uitleg: string[]; weer: string[] }> = {
  "te-weinig": {
    uitleg: ["Sla je er 1 over, dan kom je te laag uit."],
    weer: ["Je telde er weer te weinig.", "Krijgt elk stuk fruit een nummer, dan sla je er geen over."],
  },
  "te-veel": {
    uitleg: ["Tel je er 1 dubbel, dan kom je te hoog uit."],
    weer: ["Je telde er weer te veel.", "Krijgt elk stuk fruit 1 nummer, dan tel je er geen 2 keer."],
  },
  "alleen-volle-rijen": {
    uitleg: ["Alle rijen tellen mee, ook de rij die niet vol is."],
    weer: ["Je telde weer alleen de volle rijen.", "Ook het fruit in de laatste rij hoort erbij."],
  },
  onduidelijk: {
    uitleg: ["We tellen ze 1 voor 1."],
    weer: ["We tellen ze 1 voor 1."],
  },
};

const SCHERM = "vraag en knoppen even weg; het fruit blijft staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl)";

/**
 * De fouttabel van 1 fout antwoord. EIGEN INVULLING, NIET VAN SYNTHESIS (boven 10).
 * Het draaiboek noemt bij een fout het gekozen getal en de richting (te weinig / te veel). Zou de richting bij deze 3
 * keuzes maar 1 keuze overlaten, dan noemt Bliepo de richting NIET (anders verklapt de hint het antwoord, 15.17) en
 * wijst hij alleen naar de manier van tellen.
 */
export function telFout(x: number, v: Telvraag): Fout {
  const f = v.fruit;
  const X = gk(x, f);
  const goed = v.n;
  const vol = Math.floor(goed / 5) * 5;
  const kant = v.keuzes.filter((k) => k !== x && (x < goed ? k > x : k < x));
  const verklapt = kant.length === 1;
  const aanwijzen = `Wijs elke ${f.een} 1 keer aan en tel rustig mee.`;
  if (x < goed && x === vol)
    return {
      code: "alleen-volle-rijen",
      soort: "alleen-volle-rijen",
      denkfout: "telde alleen de volle rijen van 5, niet de rij die niet vol is",
      eerste: `Bij ${X} telde je de volle rijen.`,
      hint: "Kijk ook naar de laatste rij en tel opnieuw.",
      scherm: SCHERM,
    };
  if (x < goed)
    return verklapt
      ? { code: "te-weinig", soort: "te-weinig", denkfout: "telde er te weinig (sloeg er een over)", eerste: `${X} is dichtbij.`, hint: `Tel nog eens. ${aanwijzen}`, scherm: SCHERM, noot: "richting niet genoemd: dan bleef er maar 1 keuze over" }
      : { code: "te-weinig", soort: "te-weinig", denkfout: "telde er te weinig (sloeg er een over)", eerste: `${X} is dichtbij, maar je hebt ze nog niet allemaal geteld.`, hint: `Tel nog eens. ${aanwijzen}`, scherm: SCHERM };
  if (x > goed)
    return verklapt
      ? { code: "te-veel", soort: "te-veel", denkfout: "telde er te veel (telde er een 2 keer)", eerste: `${X} is dichtbij.`, hint: `Tel nog eens, rij voor rij. ${aanwijzen}`, scherm: SCHERM, noot: "richting niet genoemd: dan bleef er maar 1 keuze over" }
      : { code: "te-veel", soort: "te-veel", denkfout: "telde er te veel (telde er een 2 keer)", eerste: `${X} is dichtbij, maar dat zijn er te veel.`, hint: `Tel nog eens, rij voor rij. ${aanwijzen}`, scherm: SCHERM };
  return { code: "onduidelijk", soort: "onduidelijk", denkfout: "niet duidelijk (geen reden verzonnen)", eerste: "", hint: `Tel nog eens. ${aanwijzen}`, scherm: SCHERM };
}

/** De fouttabel van een vraag: elk fout antwoord. */
export const foutenVan = (v: Telvraag): Record<string, Fout> => Object.fromEntries(v.keuzes.filter((k) => k !== v.n).map((k) => [String(k), telFout(k, v)]));
