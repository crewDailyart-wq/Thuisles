"use client";

/**
 * De bloementuin (28 oktober 2026): kopie van `verhaal-holo-bord.tsx` (die
 * blijft staan) met hetzelfde verloop en dezelfde meldingen, maar de
 * voorwerpen in de eigen vlakke Bliepo-stijl (`bliepo-voorwerpen.ts`,
 * VOORWERPEN-BRONNEN.md): dekkende vormen met een donkerblauwe rand, geen
 * gloed of doorzichtige vleugels, zelf getekend als SVG-paddata.
 *
 * Oorspronkelijk: verhaaltjessommen als hologrammen in Bliepo's ruimte (27 oktober 2026,
 * LESSENPLAN.md § 2.6, V1–V5; BOUWEN-PHASER.md). Zelfde verloop en dezelfde
 * meldingen als het oude krijtbord (`verhaal-bord.tsx`, blijft bestaan voor
 * "Meer verhaaltjes"), naar Synthesis "Word Problems":
 *
 * - geen bord: de blauwe ruimte blijft de achtergrond;
 * - de som groot en rustig bovenaan in het midden, met een oplichtend vakje;
 * - daaronder het verhaal zin voor zin (Bliepo leest het voor; de tekst in
 *   beeld is om mee te lezen, het kind hoeft niet te kunnen lezen);
 * - daaronder de voorwerpen als hologrammen uit de Aarde-wereld, één soort
 *   per verhaal: vuurvliegjes, bloemen, lantaarntjes, paddenstoelen of
 *   lichtjes (Phaser, gloed één keer gebakken via holo/basis.ts);
 * - onderaan grote keuzeknoppen (cijfers, een plus of min, of een som) en
 *   het vraagteken "Weet ik niet".
 *
 * Schrijfwijze van een zin (zoals het oude bord):
 * - een getal ("7") kan omcirkeld en doorgestreept worden;
 * - "[weg]" hoort bij de woorden die zeggen of het erbij of eraf is;
 * - "_wat_" is het onbekende getal (kleur van het vraagteken in de som).
 *
 * Meldingen: `getal` (n, sleutel), `zin` (i), `woord` (signaal, tekst),
 * `plaatje` (i), `keuze` (waarde), `weetniet` en `klaar`.
 */

import { useEffect, useMemo, useRef, type ReactNode } from "react";
import type { Vlakbasis } from "../soort";
import type { Plekstaat, Somstuk } from "./verhaal-bord";
import { TX, VLAK_B } from "../holo/basis";
import { bliepoBasis, blok, cirkel, KLEUR, PALET, RAND, RAND_DUN, tekenVormen, type Vorm } from "./bliepo-voorwerpen";
import { HOLO_CANVAS, useHoloMotor } from "../holo/motor";
import { KeuzeKnoppen } from "../holo/keuzes";
import { IkoonKnop } from "../ikonen";
import s from "./verhaal-bliepo-tuin.module.css";

export type HoloSoort = "vuurvlieg" | "bloem" | "lantaarn" | "paddenstoel" | "lichtje" | "vogel" | "pot" | "ballon" | "lamp" | "munt";

export type HoloPlaatjes = {
  soort: HoloSoort;
  plekken: Plekstaat[];
  /** "plek": een lege plek is een zacht rondje (planten, erbij); anders de eigen "uit"-vorm (knopje, gedoofde lantaarn). */
  leeg?: "plek" | "eigen";
  /** Voorwerpen per rij (vogels op een draad: allemaal op één rij); anders de standaardindeling. */
  rij?: number;
  /** Bloempotten: de potten met een plantje laten bloeien. */
  bloeit?: boolean;
  /** Ophogen = alle voorwerpen zweven van onderen omhoog naar hun plek (ballonnen bij het voorlezen, zoals Synthesis Bigger Problems). */
  zweefNr?: number;
};

export type VerhaalHoloProps = {
  zinnen: string[];
  zichtbaar?: number;
  stippelVoor?: number | null;
  /** Alleen de tekst, groot in het midden (bij het uitpluizen). */
  midden?: boolean;
  omcirkeld?: string[];
  doorgestreept?: string[];
  vraagZin?: number | null;
  flitsZin?: number | null;
  signaalGroen?: boolean;
  groeneZin?: number | null;
  /** Een zin met een warme rand: "hier staat het" (hint). */
  hintZin?: number | null;
  /** Het vraagteken aan het eind van de vraagzin licht op (hint). */
  hintVraagteken?: boolean;
  onbekendKleur?: string | null;
  tik?: null | "getal" | "zin" | "woord" | "plaatje";
  plaatjes?: null | HoloPlaatjes;
  tikPlaatje?: "weg" | "erbij";
  geteld?: number[];
  tel?: null | { op: Plekstaat; tot: number };
  som?: Somstuk[] | null;
  somActief?: number | null;
  /** Keuzeknoppen onderaan: cijfers, "+"/"−" of sommen. */
  keuzes?: null | { opties: (number | string)[]; uit?: (number | string)[]; som?: boolean; tegels?: boolean };
  weetNiet?: boolean;
  klaarKnop?: boolean;
  /** Teken het vinkje en "weet ik niet" in het vlak zelf (de oude plek). Standaard uit: ze staan op de vaste plek onder de zin van Bliepo (28 oktober 2026). */
  knoppenInVlak?: boolean;
  /** De zin die Bliepo nu voorleest (accentkleur, zoals Synthesis bij het voorlezen). */
  leesZin?: number | null;
  /** Losse aangetikte woorden in een accentkleur ("i-j" → r roze, g groen, b blauw), zoals Synthesis bij een verkeerde tik. */
  woordKleur?: Record<string, "r" | "g" | "b">;
  /** Ophogen = een lichtgolf (goed) of zacht schudden (niet goed). */
  golfNr?: number;
  schudNr?: number;
  /* ---- 28 oktober 2026, nabouw gedrag Synthesis V3/V4/toetsen ---- */
  /** De som blijft ook staan als het verhaal groot in het midden staat (Synthesis Bigger Problems: de gekozen som blijft tijdens het uitpluizen). */
  somBijMidden?: boolean;
  /** Alleen deze zin staat er nog (het verhaal "krimpt" tot de zin met het antwoord); de ringen zijn dan even weg. */
  alleenZin?: number | null;
  /** Alleen deze voorwerpen zijn aan te tikken (bijvoorbeeld alleen de bloemen die erbij kwamen). */
  tikAlleen?: number[] | null;
  /** Een verticale stippellijn na zoveel voorwerpen (grens tussen "het begin" en "erbij"). */
  scheidingNa?: number | null;
  /** Het handje in de toets: "ik wil liever de les" (meldt `handje`). */
  handje?: boolean;
  /**
   * Zoals Synthesis (vergelijking 28 okt 2026): wat je kunt aantikken krijgt geen gouden streepje
   * (het kind zoekt zelf), en een doorgestreept getal blijft even fel (ring blijft geel).
   */
  kaal?: boolean;
};

/* De kleuren van de som-vraagtekens (MINT/BLAUW uit het oude bord) als accent uit het Bliepo-palet. */
function accentVoor(kleur: string) {
  const k = kleur.toLowerCase();
  if (k === "#8fdcb5") return "#7ee0b3";
  if (k === "#7fa9ee") return "#8fc4ff";
  return kleur;
}

/* Lichtblauw is op de blauwe achtergrond slecht leesbaar (keurder, 28 okt 2026): dan warmgeel. */
function leesbaar(kleur: string) {
  return kleur.toLowerCase() === "#7fa9ee" ? "#ffc845" : kleur;
}

/* ---------- tekst ---------- */

type Stuk = { soort: "woord" | "getal" | "signaal" | "onbekend"; tekst: string; na: string; n?: number };

function knip(zin: string): Stuk[] {
  return zin
    .split(" ")
    .filter(Boolean)
    .map((w) => {
      let m = /^(\d+)([.,?!]?)$/.exec(w);
      if (m) return { soort: "getal", tekst: m[1], na: m[2], n: Number(m[1]) };
      m = /^\[([^\]]+)\]([.,?!]?)$/.exec(w);
      if (m) return { soort: "signaal", tekst: m[1], na: m[2] };
      m = /^_([^_]+)_([.,?!]?)$/.exec(w);
      if (m) return { soort: "onbekend", tekst: m[1], na: m[2] };
      const n = /^(.*?)([.,?!]?)$/.exec(w)!;
      return { soort: "woord", tekst: n[1], na: n[2] };
    });
}

/* ---------- indeling (punten van het vlak, 980 × 720) ---------- */

/** De som staat bovenaan; het verhaal begint daaronder. */
const TEKST_Y = 44;
const REGEL = 44;
/** Hoeveel tekens er ongeveer op een regel passen (het verhaal staat rechtsboven, zoals bij Synthesis). */
const TEKENS_PER_REGEL = 36;
/** De strook x 0–300 blijft vrij (het lesscherm zet daar de zin en de knoppen); alles staat rond x = 620. */
const MIDDEN_X = 620;
/** Onderkant van het voorwerpenveld; daaronder de keuzeknoppen. */
const VELD_ONDER = 604;

export type Plaats = { x: number; y: number; maat: number; b: number; h: number };

/** Waar elk voorwerp staat: hoogstens 5 op een rij; boven de 10 twee rijen van 10 (5 + 5, zoals een tienstrook). `rij` zet het aantal per rij vast. */
export function indeling(n: number, boven: number, rij?: number): Plaats[] {
  if (n <= 0) return [];
  const breed = rij ? rij > 5 : n > 10;
  const perRij = rij ?? (breed ? 10 : 5);
  const rijen = Math.ceil(n / perRij);
  const b = rij && rij > 5 ? Math.min(80, Math.floor(600 / rij)) : breed ? 64 : 104;
  const gat = breed && n > 10 ? 22 : 0;
  const h = Math.min(120, (VELD_ONDER - boven) / rijen);
  const maat = rij && rij > 5 ? Math.min(80, b - 6, h - 6) : breed ? Math.min(60, h - 6) : Math.min(88, h - 14);
  const kol = Math.min(n, perRij);
  const w = (kol - 1) * b + (kol > 5 ? gat : 0);
  const x0 = MIDDEN_X - w / 2;
  const y0 = (boven + VELD_ONDER) / 2 - ((rijen - 1) * h) / 2;
  return Array.from({ length: n }, (_, i) => {
    const r = Math.floor(i / perRij);
    const k = i % perRij;
    return { x: x0 + k * b + (k >= 5 ? gat : 0), y: y0 + r * h, maat, b, h };
  });
}

/** Bovenkant van het voorwerpenveld: onder het verhaal (of hoog als er geen verhaal staat). */
function veldBoven(zinnen: string[], stippel: boolean) {
  if (zinnen.length === 0) return 150;
  const regels = zinnen.reduce((a, z) => a + Math.max(1, Math.ceil(z.replace(/[[\]_]/g, "").length / TEKENS_PER_REGEL)), 0);
  return TEKST_Y + regels * REGEL + (stippel ? 14 : 0) + 40;
}

/** Vogeltjes op een draad: in groepjes van twee, klein, de draad over de hele breedte (zoals Synthesis). */
export function vogelIndeling(n: number, boven: number): Plaats[] {
  const groepen: number[] = [];
  if (n % 2 === 1) groepen.push(1);
  for (let i = 0; i < Math.floor(n / 2); i++) groepen.push(2);
  /* Zo groot als bij Synthesis (±70 punten breed); bij veel vogeltjes iets kleiner zodat alles op de draad past (620 breed). */
  const breedte0 = (stap: number, gat: number) => groepen.reduce((a, g) => a + (g - 1) * stap, 0) + (groepen.length - 1) * (stap + gat);
  const f = Math.min(1, 610 / breedte0(80, 40));
  const stap = 80 * f;
  const gat = 40 * f;
  const breedte = breedte0(stap, gat);
  let x = MIDDEN_X - breedte / 2;
  const y = (boven + VELD_ONDER) / 2;
  const uit: Plaats[] = [];
  for (const g of groepen) {
    for (let k = 0; k < g; k++) uit.push({ x: x + k * stap, y, maat: 84 * f, b: stap, h: 100 });
    x += (g - 1) * stap + stap + gat;
  }
  return uit;
}

/* ---------- de scène ---------- */

type Img = import("phaser").GameObjects.Image;

interface VerhaalScene {
  toon(pl: HoloPlaatjes | null, boven: number, zichtbaar: boolean): void;
  goed(): void;
  fout(): void;
}

const ZWEEFT = (s: HoloSoort) => s === "vuurvlieg" || s === "lichtje";
/** Wat wegvliegt of erbij komt aanvliegen (vogels op een draad zweven niet). */
const VLIEGT = (s: HoloSoort) => ZWEEFT(s) || s === "vogel";
/** Aantal kleuren per soort voorwerp (nu één: alle vogels, ballonnen en bloemen hebben dezelfde kleur). */
/* Zoals Synthesis heeft elk voorwerp een eigen kleur (besluit eigenaar 28 okt 2026: "één kleur per soort" ingetrokken); eigen kleuren uit het Bliepo-palet. */
const VARIANTEN = 7;
const KLEUREN_RIJ = ["#f2715e", "#ffc845", "#7ee0b3", "#8fc4ff", "#b9a3ff", "#ff9ec4", "#ffb070"];
const GLOED: Partial<Record<HoloSoort, number>> = {
  vuurvlieg: 0xd8ff6a,
  bloem: 0xff9ad5,
  lantaarn: 0xffc94a,
  paddenstoel: 0x7ff0e2,
  lichtje: 0xffd36e,
};

/**
 * Alle voorwerpen in de Bliepo-stijl, getekend in een vak van 100 × 100: zelf
 * ontworpen SVG-paddata, vlakke dekkende kleuren uit het palet en overal
 * dezelfde donkerblauwe rand (zie VOORWERPEN-BRONNEN.md).
 */
const { navy, petrol, petrolLicht, koraal, koraalLicht, geel, geelLicht, warmwit } = PALET;

/** Een steeltje met een blaadje (bloem en knopje). */
const steel = (tot: number): Vorm[] => [
  { d: `M 50 95 L 50 ${tot}`, rand: navy, dik: 9 },
  { d: `M 50 95 L 50 ${tot}`, rand: petrol, dik: 4 },
  { d: "M 50 82 C 56 70 70 68 77 72 C 72 83 60 87 50 82 Z", vul: petrol, rand: navy, dik: RAND_DUN },
];

const VOORWERPEN: Record<string, Vorm[]> = {
  /* Bloem: vijf koraalkleurige blaadjes met een geel hartje op een petrol steeltje. */
  "bloem-aan": [
    ...steel(52),
    ...[0, 1, 2, 3, 4].map((k) => {
      const h = (k * 2 * Math.PI) / 5 - Math.PI / 2;
      return { d: cirkel(50 + 17 * Math.cos(h), 37 + 17 * Math.sin(h), 13), vul: koraal, rand: navy, dik: RAND_DUN };
    }),
    { d: cirkel(50, 37, 10), vul: geel, rand: navy, dik: RAND_DUN },
  ],
  /* Een gesloten knopje: lichtkoraal, met een petrol kelkje. */
  "bloem-uit": [
    ...steel(58),
    { d: "M 50 28 C 63 40 64 54 50 61 C 36 54 37 40 50 28 Z", vul: koraalLicht, rand: navy, dik: RAND_DUN },
    { d: "M 38 52 Q 50 68 62 52 Q 50 59 38 52 Z", vul: petrol, rand: navy, dik: RAND_DUN },
  ],
  /* Vuurvliegje: dekkende warmwitte vleugels, een donkerblauw lijfje en een geel achterlijf (aan). */
  "vuurvlieg-aan": [
    { d: "M 47 40 C 34 22 14 24 16 36 C 18 46 36 48 47 44 Z", vul: warmwit, rand: navy, dik: RAND_DUN },
    { d: "M 53 40 C 66 22 86 24 84 36 C 82 46 64 48 53 44 Z", vul: warmwit, rand: navy, dik: RAND_DUN },
    { d: "M 50 42 C 64 42 66 62 62 74 C 58 86 42 86 38 74 C 34 62 36 42 50 42 Z", vul: geel, rand: navy, dik: RAND_DUN },
    { d: "M 39 58 L 61 58 M 38 68 L 62 68", rand: navy, dik: RAND_DUN },
    { d: cirkel(50, 34, 9), vul: navy },
    { d: "M 46 27 Q 41 16 34 13 M 54 27 Q 59 16 66 13", rand: navy, dik: RAND_DUN },
  ],
  /* Lantaarntje: aan = geel glas, uit = licht petrol glas; dak en voet koraal. */
  "lantaarn-aan": lantaarn(geel),
  "lantaarn-uit": lantaarn(petrolLicht),
  /* Paddenstoel: koraal hoedje met warmwitte stippen (uit = lichtkoraal). */
  "paddenstoel-aan": padde(koraal),
  "paddenstoel-uit": padde(koraalLicht),
  /* Lichtje: een geel bolletje met vier korte straaltjes. */
  "lichtje-aan": [
    ...[0, 1, 2, 3].map((k) => {
      const h = (k * Math.PI) / 2 + Math.PI / 4;
      return { d: `M ${50 + 31 * Math.cos(h)} ${50 + 31 * Math.sin(h)} L ${50 + 41 * Math.cos(h)} ${50 + 41 * Math.sin(h)}`, rand: navy, dik: RAND };
    }),
    { d: cirkel(50, 50, 23), vul: geel, rand: navy, dik: RAND },
    { d: cirkel(50, 50, 11), vul: geelLicht },
  ],
};

function lantaarn(glas: string): Vorm[] {
  return [
    { d: "M 41 21 A 9 9 0 0 1 59 21", rand: navy, dik: RAND_DUN },
    { d: "M 33 31 L 67 31 L 60 19 L 40 19 Z", vul: koraal, rand: navy, dik: RAND_DUN },
    { d: blok(31, 31, 38, 51, 9), vul: glas, rand: navy, dik: RAND_DUN },
    { d: "M 50 31 L 50 82", rand: navy, dik: RAND_DUN },
    { d: blok(28, 82, 44, 10, 4), vul: koraal, rand: navy, dik: RAND_DUN },
  ];
}

function padde(hoed: string): Vorm[] {
  return [
    { d: blok(40, 50, 20, 42, 8), vul: warmwit, rand: navy, dik: RAND_DUN },
    { d: "M 13 57 Q 13 15 50 15 Q 87 15 87 57 Z", vul: hoed, rand: navy, dik: RAND_DUN },
    { d: cirkel(33, 39, 6), vul: warmwit },
    { d: cirkel(53, 27, 5), vul: warmwit },
    { d: cirkel(69, 43, 6), vul: warmwit },
    { d: cirkel(49, 48, 4), vul: warmwit },
  ];
}

/* ---------- de voorwerpen van de verhaaltjessommen (28 oktober 2026, nabouw Synthesis) ---------- */

/** Eén kleur per soort voorwerp (alle vogeltjes geel, alle ballonnen koraal, alle bloemen roze), goed te zien op blauw. */
const KLEUR_VOGEL = geel;
const KLEUR_BALLON = koraal;
const KLEUR_BLOEM = "#f6a9c8";
const GRIJS = "#c3c9d8";
const GRIJS_DONKER = "#8a93ab";
const AARDE = "#8a5a44";

function vogel(kleur: string): Vorm[] {
  const snavel = kleur === geel ? koraal : geel;
  return [
    { d: "M 68 52 L 94 40 L 90 66 Z", vul: kleur, rand: navy, dik: RAND_DUN },
    { d: "M 46 74 L 46 88 M 60 74 L 60 88", rand: navy, dik: RAND_DUN },
    { d: "M 22 52 C 22 30 46 26 62 36 C 78 46 80 66 64 74 C 48 82 24 74 22 52 Z", vul: kleur, rand: navy, dik: RAND_DUN },
    { d: "M 40 54 C 50 46 64 52 66 62 C 56 70 44 66 40 54 Z", vul: warmwit, rand: navy, dik: RAND_DUN },
    { d: "M 24 46 L 8 52 L 24 57 Z", vul: snavel, rand: navy, dik: RAND_DUN },
    { d: cirkel(35, 44, 3.5), vul: navy },
  ];
}

function bloempot(plant: "geen" | "spruit" | { bloem: string }): Vorm[] {
  const pot: Vorm[] = [
    { d: "M 27 64 L 73 64 L 67 93 L 33 93 Z", vul: koraal, rand: navy, dik: RAND_DUN },
    { d: blok(21, 52, 58, 14, 5), vul: koraal, rand: navy, dik: RAND_DUN },
    { d: "M 27 53 L 73 53 L 73 56 L 27 56 Z", vul: AARDE },
  ];
  if (plant === "geen") return pot;
  if (plant === "spruit")
    return [
      { d: "M 50 54 L 50 34", rand: navy, dik: 9 },
      { d: "M 50 54 L 50 34", rand: petrol, dik: 4 },
      { d: "M 50 42 C 42 32 30 32 26 38 C 32 48 44 48 50 42 Z", vul: petrol, rand: navy, dik: RAND_DUN },
      { d: "M 50 36 C 58 24 70 24 74 30 C 68 40 56 40 50 36 Z", vul: petrol, rand: navy, dik: RAND_DUN },
      ...pot,
    ];
  return [
    { d: "M 50 54 L 50 26", rand: navy, dik: 9 },
    { d: "M 50 54 L 50 26", rand: petrol, dik: 4 },
    { d: "M 50 48 C 58 40 70 40 74 46 C 68 54 56 54 50 48 Z", vul: petrol, rand: navy, dik: RAND_DUN },
    ...[0, 1, 2, 3, 4].map((k) => {
      const h = (k * 2 * Math.PI) / 5 - Math.PI / 2;
      return { d: cirkel(50 + 11 * Math.cos(h), 24 + 11 * Math.sin(h), 10), vul: plant.bloem, rand: navy, dik: RAND_DUN };
    }),
    { d: cirkel(50, 24, 7), vul: geel, rand: navy, dik: RAND_DUN },
    ...pot,
  ];
}

function ballon(kleur: string): Vorm[] {
  return [
    { d: "M 50 74 C 44 82 56 88 50 97", rand: navy, dik: RAND_DUN },
    { d: "M 50 6 C 74 6 84 26 78 46 C 74 58 62 66 50 68 C 38 66 26 58 22 46 C 16 26 26 6 50 6 Z", vul: kleur, rand: navy, dik: RAND_DUN },
    { d: "M 50 66 L 43 75 L 57 75 Z", vul: kleur, rand: navy, dik: RAND_DUN },
  ];
}

/** Een geknapte ballon: een donker vlekje met een paar scherfjes en nog een stukje touw. */
const BALLON_GEKNAPT: Vorm[] = [
  { d: "M 50 78 C 46 84 54 88 50 95", rand: navy, dik: RAND_DUN },
  { d: "M 50 36 L 57 43 L 68 41 L 62 51 L 68 61 L 57 59 L 50 68 L 45 59 L 33 61 L 40 51 L 33 41 L 45 43 Z", vul: navy, rand: warmwit, dik: 2.5 },
  { d: "M 24 24 L 33 28 L 26 34 Z M 76 22 L 80 32 L 70 30 Z M 76 74 L 70 80 L 68 72 Z", vul: navy, rand: warmwit, dik: 2 },
];

function gloeilamp(aan: boolean): Vorm[] {
  const glas = aan ? geel : GRIJS;
  const draad = aan ? navy : GRIJS_DONKER;
  const straal: Vorm[] = aan
    ? [-150, -120, -90, -60, -30].map((g) => {
        const h = (g * Math.PI) / 180;
        return { d: `M ${50 + 32 * Math.cos(h)} ${34 + 32 * Math.sin(h)} L ${50 + 40 * Math.cos(h)} ${34 + 40 * Math.sin(h)}`, rand: navy, dik: RAND_DUN };
      })
    : [];
  return [
    ...straal,
    { d: "M 36 58 C 26 50 24 42 24 34 C 24 18 36 10 50 10 C 64 10 76 18 76 34 C 76 42 74 50 64 58 L 62 68 L 38 68 Z", vul: glas, rand: navy, dik: RAND_DUN },
    { d: "M 43 68 L 43 44 L 50 36 L 57 44 L 57 68", rand: draad, dik: RAND_DUN },
    { d: blok(35, 68, 30, 9, 3), vul: GRIJS_DONKER, rand: navy, dik: RAND_DUN },
    { d: blok(37, 77, 26, 9, 3), vul: GRIJS_DONKER, rand: navy, dik: RAND_DUN },
    { d: "M 44 86 L 56 86 L 54 93 L 46 93 Z", vul: navy },
  ];
}

/** Een eigen munt zonder teken of cijfer: een gele (of grijze) schijf met een ring. */
function munt(aan: boolean): Vorm[] {
  return [
    { d: cirkel(50, 52, 40), vul: aan ? geel : GRIJS, rand: navy, dik: RAND_DUN },
    { d: cirkel(50, 52, 28), rand: aan ? navy : GRIJS_DONKER, dik: RAND_DUN },
  ];
}

function tekenAlles(sc: { canvasPlaatje: (k: string, b: number, h: number, f: (c: CanvasRenderingContext2D) => void) => void }) {
  for (const [sl, vormen] of Object.entries(VOORWERPEN)) sc.canvasPlaatje(sl, 100, 100, (c) => tekenVormen(c, vormen));
  const teken = (sl: string, vormen: Vorm[]) => sc.canvasPlaatje(sl, 100, 100, (c) => tekenVormen(c, vormen));
  KLEUREN_RIJ.forEach((k, i) => {
    teken(`vogel-aan-${i}`, vogel(k));
    teken(`ballon-aan-${i}`, ballon(k));
    teken(`pot-bloem-${i}`, bloempot({ bloem: k }));
  });
  /* (vroeger één kleur per soort: KLEUR_VOGEL, KLEUR_BALLON, KLEUR_BLOEM) */
  void KLEUR_VOGEL;
  void KLEUR_BALLON;
  void KLEUR_BLOEM;
  teken("pot-aan", bloempot("spruit"));
  teken("ballon-uit", BALLON_GEKNAPT);
  /* 28 okt 2026 (zoals Synthesis): een geknapte ballon laat een klein stipje in zijn eigen kleur achter; bij het knappen vliegen er snippers in die kleur weg. */
  KLEUREN_RIJ.forEach((k, i) => {
    teken(`ballon-uit-${i}`, [
      { d: "M 50 80 C 47 86 53 90 50 96", rand: navy, dik: RAND_DUN },
      { d: cirkel(50, 72, 8), vul: k, rand: navy, dik: RAND_DUN },
    ]);
    teken(`snipper-${i}`, [{ d: "M 30 40 L 62 30 L 70 58 L 40 70 Z", vul: k, rand: navy, dik: RAND_DUN }]);
  });
  teken("lamp-aan", gloeilamp(true));
  teken("lamp-uit", gloeilamp(false));
  teken("munt-aan", munt(true));
  teken("munt-uit", munt(false));
  /* Een lege bloempot: alleen de omtrek, gestippeld (daar kan een plantje komen). */
  sc.canvasPlaatje("pot-uit", 100, 100, (c) => {
    c.strokeStyle = warmwit;
    c.lineWidth = RAND_DUN;
    c.lineCap = "round";
    c.lineJoin = "round";
    c.setLineDash([7, 8]);
    c.stroke(new Path2D("M 27 64 L 73 64 L 67 93 L 33 93 Z"));
    c.stroke(new Path2D(blok(21, 52, 58, 14, 5)));
  });
  /* Een lamp die er niet (meer) is: alleen de omtrek van de lamp, een dun warmwit lijntje zonder vulling (zoals Synthesis). */
  sc.canvasPlaatje("lamp-omtrek", 100, 100, (c) => {
    c.strokeStyle = warmwit;
    c.globalAlpha = 0.8;
    c.lineWidth = RAND_DUN - 1;
    c.lineCap = "round";
    c.lineJoin = "round";
    c.stroke(new Path2D("M 36 58 C 26 50 24 42 24 34 C 24 18 36 10 50 10 C 64 10 76 18 76 34 C 76 42 74 50 64 58 L 62 68 L 38 68 Z"));
    c.stroke(new Path2D(blok(35, 68, 30, 9, 3)));
    c.stroke(new Path2D(blok(37, 77, 26, 9, 3)));
  });
  /* Een plek waar niets (meer) staat, bijvoorbeeld een vogeltje dat is weggevlogen. */
  sc.canvasPlaatje("niets", 4, 4, () => {});
  /* Een lege plek: een warmwit stippelrondje, zonder vulling (waar iets bij kan komen, of waar iets was). */
  sc.canvasPlaatje("plek", 100, 100, (c) => {
    c.strokeStyle = warmwit;
    c.lineWidth = RAND_DUN;
    c.lineCap = "round";
    c.setLineDash([7, 8]);
    c.beginPath();
    c.arc(50, 54, 27, 0, Math.PI * 2);
    c.stroke();
  });
}

function maakVerhaalScene(Phaser: typeof import("phaser"), rustig: boolean) {
  const Basis = bliepoBasis(Phaser, rustig);
  class Verhaal extends Basis implements VerhaalScene {
    groep: import("phaser").GameObjects.Container | null = null;
    items: Img[] = [];
    staat: Plekstaat[] = [];
    sleutel = "";
    soort: HoloSoort = "vuurvlieg";
    leeg: "plek" | "eigen" = "eigen";
    bloeit = false;
    plaatsen: Plaats[] = [];
    zweefNr = 0;

    constructor() {
      super("verhaal");
    }

    maak() {
      tekenAlles(this);
      for (const so of Object.keys(GLOED) as HoloSoort[]) {
        this.bak(`${so}-aan`, `${so}-aan-g`, GLOED[so]);
        if (this.textures.exists(`${so}-uit`)) this.bak(`${so}-uit`, `${so}-uit-g`, GLOED[so], 0);
      }
      this.bak("plek", "plek-g", 0xffe3a0);
    }

    /** Welk plaatje bij dit voorwerp hoort (i = plek; vogels, ballonnen en bloemen hebben elk een eigen kleur). */
    sl(staat: Plekstaat, i = 0) {
      const so = this.soort;
      /* Een lege lampplek is de omtrek van een lamp (Synthesis); andere lege plekken een stippelrondje. */
      if (staat === "leeg") return so === "lamp" ? "lamp-omtrek" : "plek-g";
      const k = i % VARIANTEN;
      switch (so) {
        case "vogel":
          return staat === "aan" ? `vogel-aan-${k}` : "niets";
        case "ballon":
          return staat === "aan" ? `ballon-aan-${k}` : this.leeg === "plek" ? "plek-g" : `ballon-uit-${k}`;
        case "pot":
          /* Besluit eigenaar (28 okt): de tekst zegt "bloemen", dus altijd een hele bloem in de pot, nooit een kiemplantje. */
          return staat === "aan" ? `pot-bloem-${k}` : "pot-uit";
        case "lamp":
        case "munt":
          return staat === "aan" ? `${so}-aan` : this.leeg === "plek" ? "plek-g" : `${so}-uit`;
        default:
          if (staat === "aan") return `${so}-aan-g`;
          if (this.leeg === "plek" || VLIEGT(so)) return "plek-g";
          return `${so}-uit-g`;
      }
    }

    schaal(p: Plaats) {
      return p.maat / 100 / TX;
    }

    toon(pl: HoloPlaatjes | null, boven: number, zichtbaar: boolean) {
      const sleutel = pl ? `${pl.soort}|${pl.plekken.length}|${boven}|${pl.leeg ?? "eigen"}|${pl.rij ?? 0}` : "";
      if (sleutel !== this.sleutel) {
        this.items.forEach((x) => this.tweens.killTweensOf(x));
        this.groep?.destroy();
        this.groep = null;
        this.items = [];
        this.staat = [];
        this.sleutel = sleutel;
        if (!pl) return;
        this.soort = pl.soort;
        this.leeg = pl.leeg ?? "eigen";
        this.bloeit = !!pl.bloeit;
        this.plaatsen = pl.soort === "vogel" && pl.plekken.length <= 9 ? vogelIndeling(pl.plekken.length, boven) : indeling(pl.plekken.length, boven, pl.rij);
        const midY = this.plaatsen.reduce((a, p) => a + p.y, 0) / Math.max(1, this.plaatsen.length);
        this.groep = this.add.container(VLAK_B / 2, midY);
        if (pl.soort === "vogel") this.draad(midY);
        pl.plekken.forEach((st, i) => {
          const p = this.plaatsen[i];
          const img = this.add.image(p.x - VLAK_B / 2, p.y - midY, this.sl(st, i)).setScale(this.schaal(p));
          this.groep!.add(img);
          this.items.push(img);
          if (ZWEEFT(this.soort) && !this.rustig) this.zweef(img, i);
        });
        this.staat = [...pl.plekken];
        this.groep.setVisible(zichtbaar);
        /* Alleen bij een hoger nummer: het nummer telt op per les (HBord), een nieuw verhaal laat niet per ongeluk zweven. */
        const zweven = (pl.zweefNr ?? 0) > this.zweefNr;
        this.zweefNr = Math.max(this.zweefNr, pl.zweefNr ?? 0);
        /* Eén brede straal voor alles tegelijk; of (ballonnen) van onderen omhoog zweven. */
        if (zichtbaar && zweven) this.zweefOmhoog();
        else if (zichtbaar) this.tover(this.groep);
        return;
      }
      if (!pl || !this.groep) return;
      const wasZichtbaar = this.groep.visible;
      this.groep.setVisible(zichtbaar);
      if (zichtbaar && !wasZichtbaar) {
        this.groep.setScale(1).setAlpha(1);
        this.tover(this.groep);
      }
      if (!!pl.bloeit !== this.bloeit) this.bloei(!!pl.bloeit, pl.plekken);
      if ((pl.zweefNr ?? 0) > this.zweefNr) {
        this.zweefNr = pl.zweefNr ?? 0;
        if (zichtbaar) this.zweefOmhoog();
      }
      pl.plekken.forEach((st, i) => {
        if (this.staat[i] !== st) this.wissel(i, st);
      });
      this.staat = [...pl.plekken];
    }

    /** De draad waar de vogeltjes op zitten: één per rij, achter de vogels. */
    draad(midY: number) {
      const rijen = new Map<number, Plaats[]>();
      for (const p of this.plaatsen) rijen.set(p.y, [...(rijen.get(p.y) ?? []), p]);
      const g = this.add.graphics();
      for (const lijst of rijen.values()) {
        const x1 = 310 - VLAK_B / 2;
        const x2 = 930 - VLAK_B / 2;
        const y = lijst[0].y - midY + lijst[0].maat * 0.38;
        g.lineStyle(RAND + 4, KLEUR.navy, 1);
        g.lineBetween(x1, y, x2, y);
        g.lineStyle(RAND - 2, KLEUR.warmwit, 1);
        g.lineBetween(x1, y, x2, y);
      }
      this.groep!.add(g);
    }

    /** De potten met een plantje gaan bloeien (of weer terug naar een spruitje). */
    bloei(aan: boolean, plekken: Plekstaat[]) {
      this.bloeit = aan;
      plekken.forEach((st, i) => {
        const img = this.items[i];
        if (!img || st !== "aan" || this.staat[i] !== "aan") return;
        const k = this.schaal(this.plaatsen[i]);
        img.setTexture(this.sl("aan", i));
        if (!this.rustig) {
          img.setScale(k * 0.8);
          this.tweens.add({ targets: img, scale: k, duration: 380, ease: "Back.easeOut", delay: (i % 5) * 60 });
        }
      });
    }

    /** Alle voorwerpen zweven één voor één van onder het scherm omhoog naar hun plek (ballonnen, zoals Synthesis). */
    zweefOmhoog() {
      if (this.rustig || !this.groep) return;
      this.items.forEach((img, i) => {
        const y = this.plaatsen[i].y - (this.groep!.y as number);
        this.tweens.killTweensOf(img);
        img.setY(y + 520).setAlpha(1);
        this.tweens.add({ targets: img, y, duration: 1500, ease: "Sine.easeOut", delay: i * 110 });
      });
    }

    /** Vuurvliegjes en lichtjes zweven heel zacht op en neer. */
    zweef(img: Img, i: number) {
      this.tweens.add({ targets: img, y: img.y - 5, duration: 1300 + (i % 5) * 140, yoyo: true, repeat: -1, ease: "Sine.easeInOut", delay: (i % 7) * 90 });
    }

    wissel(i: number, st: Plekstaat) {
      const img = this.items[i];
      if (!img || !this.groep) return;
      const p = this.plaatsen[i];
      const k = this.schaal(p);
      if (this.rustig) {
        img.setTexture(this.sl(st, i)).setScale(k).setAlpha(1);
        return;
      }
      if (VLIEGT(this.soort)) {
        if (st === "uit") {
          this.tweens.killTweensOf(img);
          img.setY(p.y - (this.groep.y as number));
          /* Wegvliegen: een kopie vliegt omhoog en vervaagt; op de plek blijft een zacht rondje. */
          const weg = this.add.image(img.x, img.y, this.sl("aan", i)).setScale(k);
          this.groep.add(weg);
          const kant = i % 2 === 0 ? -1 : 1;
          this.tweens.add({ targets: weg, x: img.x + kant * 60, y: img.y - 190, alpha: 0, scale: k * 0.7, duration: 750, ease: "Cubic.easeIn", onComplete: () => weg.destroy() });
          img.setTexture(this.sl("uit", i)).setAlpha(0);
          this.tweens.add({ targets: img, alpha: 1, duration: 300, delay: 250 });
        } else {
          /* Erbij: het vliegt van boven naar zijn plek. */
          this.tweens.killTweensOf(img);
          const y = p.y - (this.groep.y as number);
          img.setTexture(this.sl("aan", i)).setPosition(img.x, y - 150).setAlpha(0);
          this.tweens.add({ targets: img, y, alpha: 1, duration: 520, ease: "Cubic.easeOut", onComplete: () => {
              if (img.active && ZWEEFT(this.soort)) this.zweef(img, i);
            } });
        }
        return;
      }
      if (this.soort === "ballon" && st === "uit") {
        /* Knappen: even groter, snippers in dezelfde kleur vliegen weg, dan een klein stipje (zoals Synthesis). */
        this.tweens.killTweensOf(img);
        const kl = i % VARIANTEN;
        for (let n = 0; n < 5; n++) {
          const h = (n / 5) * Math.PI * 2 + 0.4;
          const sn = this.add.image(img.x, img.y, `snipper-${kl}`).setScale(k * 0.35).setRotation(h);
          this.groep.add(sn);
          this.tweens.add({ targets: sn, x: img.x + Math.cos(h) * 70, y: img.y + Math.sin(h) * 70 + 30, alpha: 0, angle: 180, duration: 650, ease: "Cubic.easeOut", onComplete: () => sn.destroy() });
        }
        this.tweens.add({
          targets: img,
          scale: k * 1.25,
          duration: 90,
          ease: "Quad.easeOut",
          onComplete: () => {
            if (!img.active) return;
            img.setTexture(this.sl(st, i)).setScale(k * 0.7);
            this.tweens.add({ targets: img, scale: k, duration: 160, ease: "Back.easeOut" });
          },
        });
        return;
      }
      if (this.soort === "munt" && this.staat[i] === "aan" && st !== "aan") {
        /* Uitgeven: de munt draait om zijn as en verdwijnt (zoals Synthesis), daarna de lege plek. */
        this.tweens.killTweensOf(img);
        this.tweens.add({
          targets: img,
          scaleX: 0,
          duration: 220,
          yoyo: true,
          repeat: 1,
          ease: "Sine.easeInOut",
          onComplete: () => {
            if (!img.active) return;
            img.setTexture(this.sl(st, i)).setScale(k).setAlpha(0);
            this.tweens.add({ targets: img, alpha: 1, duration: 260 });
          },
        });
        return;
      }
      if (this.soort === "munt" && st === "aan") {
        /* Een nieuwe munt komt eerst grijs en kleurt dan goud (zoals Synthesis). */
        img.setTexture("munt-uit").setScale(k * 0.6).setAlpha(0.5);
        this.tweens.add({ targets: img, scale: k, alpha: 1, duration: 260, ease: "Back.easeOut" });
        this.time.delayedCall(320, () => {
          if (img.active && this.staat[i] === "aan") img.setTexture(this.sl("aan", i));
        });
        return;
      }
      if (st === "aan") {
        /* Opengaan of aangaan: kort kleiner, dan met een veertje groot. */
        img.setTexture(this.sl(st, i)).setScale(k * 0.55).setAlpha(0.4);
        this.tweens.add({ targets: img, scale: k, alpha: 1, duration: 360, ease: "Back.easeOut" });
      } else {
        this.tweens.add({
          targets: img,
          alpha: 0.35,
          duration: 160,
          onComplete: () => {
            if (!img.active) return;
            img.setTexture(this.sl(st, i));
            this.tweens.add({ targets: img, alpha: 1, duration: 220 });
          },
        });
      }
    }

    goed() {
      if (!this.groep?.visible) return;
      this.golf(MIDDEN_X, this.groep.y as number);
    }

    fout() {
      if (this.groep?.visible) this.schud(this.groep);
    }

    demo(ms: number) {
      const eind = performance.now() + ms;
      let n = 0;
      const stap = () => {
        if (performance.now() > eind) return;
        const soorten: HoloSoort[] = ["vuurvlieg", "lantaarn", "bloem", "lichtje", "paddenstoel"];
        const so = soorten[n % soorten.length];
        const aantal = n % 2 === 0 ? 10 : 17;
        this.sleutel = "";
        this.toon({ soort: so, plekken: Array(aantal).fill("aan") }, 300, true);
        this.time.delayedCall(450, () => this.toon({ soort: so, plekken: Array.from({ length: aantal }, (_, i) => (i >= aantal - 3 ? "uit" : "aan")) }, 300, true));
        this.time.delayedCall(800, () => this.goed());
        n++;
        this.time.delayedCall(1100, stap);
      };
      stap();
    }
  }
  return Verhaal as unknown as new () => import("phaser").Scene;
}

/* ---------- het vlak ---------- */

export function VerhaalTuin(p: VerhaalHoloProps & Vlakbasis) {
  const {
    zinnen,
    zichtbaar = zinnen.length,
    stippelVoor = null,
    midden = false,
    omcirkeld = [],
    doorgestreept = [],
    vraagZin = null,
    flitsZin = null,
    signaalGroen = false,
    groeneZin = null,
    hintZin = null,
    hintVraagteken = false,
    onbekendKleur = null,
    tik = null,
    plaatjes = null,
    tikPlaatje = "weg",
    geteld = [],
    tel = null,
    som = null,
    somActief = null,
    keuzes = null,
    weetNiet = false,
    klaarKnop = false,
    knoppenInVlak = false,
    golfNr = 0,
    schudNr = 0,
    leesZin = null,
    woordKleur = {},
    somBijMidden = false,
    alleenZin = null,
    tikAlleen = null,
    scheidingNa = null,
    handje = false,
    kaal = false,
    meld,
    schaal,
  } = p;

  const { plek, scene } = useHoloMotor<VerhaalScene>(schaal, maakVerhaalScene);
  const boven = veldBoven(zinnen, stippelVoor !== null);
  const aantalPlekken = plaatjes?.plekken.length ?? 0;
  const soortPlekken = plaatjes?.soort;
  const rijPlekken = plaatjes?.rij;
  const plaatsen = useMemo(
    () => (soortPlekken === "vogel" && aantalPlekken <= 9 ? vogelIndeling(aantalPlekken, boven) : indeling(aantalPlekken, boven, rijPlekken)),
    [soortPlekken, aantalPlekken, rijPlekken, boven],
  );

  useEffect(() => {
    scene?.toon(plaatjes, boven, !midden);
  }, [scene, plaatjes, boven, midden]);

  const golf = useRef(golfNr);
  useEffect(() => {
    if (golfNr !== golf.current) scene?.goed();
    golf.current = golfNr;
  }, [scene, golfNr]);
  const schud = useRef(schudNr);
  useEffect(() => {
    if (schudNr !== schud.current) scene?.fout();
    schud.current = schudNr;
  }, [scene, schudNr]);

  /* ---------- het verhaal ---------- */
  const regels: ReactNode[] = [];
  zinnen.slice(0, zichtbaar).forEach((zin, i) => {
    /* Het verhaal krimpt tot één zin (Synthesis, 2× fout getal): de rest is even weg. */
    if (alleenZin !== null && alleenZin !== i) return;
    /* Geen stippellijn meer tussen het verhaal en de vraag (30 oktober 2026, opdracht eigenaar). */
    const kleur = leesZin === i ? s.lezen : flitsZin === i || vraagZin === i ? s.roze : groeneZin === i ? s.groen : "";
    const delen = knip(zin);
    const stukken = delen.map((st, j) => {
      const sleutel = `${i}-${j}`;
      const spatie = j < delen.length - 1 ? " " : "";
      const laatste = j === delen.length - 1;
      const na =
        laatste && st.na === "?" && hintVraagteken ? (
          <span className={s.vraagHint}>?</span>
        ) : (
          st.na
        );
      if (st.soort === "getal") {
        /* Krimpt het verhaal tot één zin, dan zijn de ringen even weg (zoals Synthesis). */
        const rond = alleenZin === null && omcirkeld.includes(sleutel);
        const streep = alleenZin === null && doorgestreept.includes(sleutel);
        const inhoud = (
          <>
            {st.tekst}
            {(rond || streep) && (
              <svg className={s.cirkel} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
                {/* Eigen vorm (Bliepo-stijl): een nette gele ring die zich tekent na een tik; "gebruikt" = een rechte streep erdoor. */}
                {(rond || streep) && <ellipse className={s.ring} pathLength={100} cx="50" cy="52" rx="46" ry="44" fill="none" stroke="#ffc845" strokeWidth="4" vectorEffect="non-scaling-stroke" />}
                {streep && <line className={s.streep} pathLength={100} x1="18" y1="82" x2="82" y2="22" stroke="#ffc845" strokeWidth="4" vectorEffect="non-scaling-stroke" strokeLinecap="round" />}
              </svg>
            )}
          </>
        );
        return (
          <span key={j}>
            {tik === "getal" ? (
              <button type="button" className={`${s.getal} ${s.tikbaar} ${kaal ? s.kaal : ""}`} data-getal={st.n} onClick={() => meld({ soort: "getal", n: st.n, sleutel })}>
                {inhoud}
              </button>
            ) : (
              <span className={`${s.getal} ${kaal ? s.kaal : ""} ${streep && !kaal ? s.gebruikt : ""}`}>{inhoud}</span>
            )}
            {na}
            {spatie}
          </span>
        );
      }
      const los = woordKleur[sleutel];
      const woordKleurKlas = los === "r" ? s.roze : los === "g" ? s.signaal : los === "b" ? s.blauw : st.soort === "signaal" && signaalGroen ? s.signaal : "";
      const stijl = st.soort === "onbekend" && onbekendKleur ? { color: leesbaar(onbekendKleur) } : undefined;
      if (tik === "woord") {
        return (
          <span key={j}>
            <button
              type="button"
              className={`${s.woord} ${s.tikbaar} ${kaal ? s.kaal : ""} ${woordKleurKlas}`}
              style={stijl}
              data-signaal={st.soort === "signaal" ? "ja" : "nee"}
              onClick={() => meld({ soort: "woord", signaal: st.soort === "signaal", tekst: st.tekst, sleutel })}
            >
              {st.tekst}
              {/* Zonder streepje (kaal): de punt hoort in de knop, anders staat hij los ("draad ."). */}
              {kaal && na}
            </button>
            {!kaal && na}
            {spatie}
          </span>
        );
      }
      /* Bij "tik op de zin": elk woord is aan te tikken; de les krijgt ook welk woord (Synthesis kleurt bij een verkeerde zin alleen dat woord). */
      if (tik === "zin")
        return (
          <span key={j} className={woordKleurKlas} style={stijl} data-woord={j} onClick={(e) => (e.stopPropagation(), meld({ soort: "zin", i, j }))}>
            {st.tekst}
            {na}
            {spatie}
          </span>
        );
      return (
        <span key={j} className={woordKleurKlas} style={stijl}>
          {st.tekst}
          {na}
          {spatie}
        </span>
      );
    });
    const hint = hintZin === i ? s.hint : "";
    regels.push(
      tik === "zin" ? (
        <button key={i} type="button" className={`verhaal-zin ${leesZin === i ? "verhaal-zin-lezen" : ""} ${s.zin} ${s.zinTik} ${kleur} ${hint}`} data-zin={i} onClick={() => meld({ soort: "zin", i })}>
          {stukken}
        </button>
      ) : (
        <div key={i} className={`verhaal-zin ${leesZin === i ? "verhaal-zin-lezen" : ""} ${s.zin} ${kleur} ${hint}`}>
          {stukken}
        </div>
      ),
    );
  });

  /* ---------- nummers bij het tellen ---------- */
  const telNummer = new Map<number, number>();
  if (tel && plaatjes) {
    let n = 0;
    plaatjes.plekken.forEach((st, i) => {
      if (st === tel.op && n < tel.tot) telNummer.set(i, ++n);
    });
  }

  return (
    <div className={s.vlak}>
      <div ref={plek} style={HOLO_CANVAS} aria-hidden />

      {som && (!midden || somBijMidden) && (
        <div className={s.som} aria-label="De som">
          {som.map((d, i) => {
            const actief = somActief === i;
            /* Zoals Synthesis: de som is losse grote tekst, zonder vakjes. Een open plek is een vraagteken; aan de beurt = accentkleur. */
            if (d.t === "leeg") return <span key={`l${i}`} className={`${s.open} ${d.smal ? s.smal : ""}`} />;
            if (d.t === "vraag")
              return (
                <span key={`v${i}`} className={`${s.somvraag} ${actief ? s.actief : ""}`} style={{ color: d.kleur ? accentVoor(d.kleur) : undefined }}>
                  ?
                </span>
              );
            return (
              <span key={`${d.t}${i}-${d.t === "getal" ? d.n : d.s}`} className={d.t === "teken" ? s.teken : s.somgetal}>
                {d.t === "getal" ? d.n : d.s}
              </span>
            );
          })}
        </div>
      )}

      {regels.length > 0 && <div className={`verhaal-tekst ${s.verhaal} ${midden ? s.midden : ""}`}>{regels}</div>}

      {/* Bloemen met lege potjes (zoals Synthesis): een verticale stippellijn rechts naast de bovenste rij. */}
      {/* Een vaste grens na zoveel voorwerpen (bij de controle: wat er in het begin was | wat erbij komt). */}
      {plaatjes && !midden && scheidingNa !== null && scheidingNa > 0 && plaatsen[scheidingNa - 1] && (() => {
        const a = plaatsen[scheidingNa - 1];
        const b2 = plaatsen[scheidingNa];
        const x = b2 && Math.abs(b2.y - a.y) < 4 ? (a.x + b2.x) / 2 : a.x + a.b / 2;
        return <div className={s.stippelLijn} style={{ left: x, top: a.y - a.h / 2, height: a.h }} aria-hidden />;
      })()}

      {plaatjes && !midden && scheidingNa === null && plaatjes.soort === "pot" && plaatjes.plekken.some((st) => st !== "aan") && plaatsen.length > 0 && (() => {
        const boven = Math.min(...plaatsen.map((q) => q.y));
        const rij = plaatsen.filter((q) => Math.abs(q.y - boven) < 4);
        const laatste = rij.reduce((a2, q) => (q.x > a2.x ? q : a2), rij[0]);
        return <div className={s.stippelLijn} style={{ left: laatste.x + laatste.b / 2 + 10, top: laatste.y - laatste.h / 2, height: laatste.h }} aria-hidden />;
      })()}

      {/* Tikken op de voorwerpen: onzichtbare knoppen precies over de hologrammen. */}
      {plaatjes && !midden && (
        <div className={s.plekken}>
          {plaatjes.plekken.map((st, i) => {
            const pl = plaatsen[i];
            if (!pl) return null;
            const tikbaar = tik === "plaatje" && (!tikAlleen || tikAlleen.includes(i)) && ((tikPlaatje === "weg" && st === "aan") || (tikPlaatje === "erbij" && st === "uit"));
            const nr = geteld.includes(i) ? geteld.indexOf(i) + 1 : telNummer.get(i);
            const stijl = { left: pl.x - pl.b / 2, top: pl.y - pl.h / 2, width: pl.b, height: pl.h };
            return tikbaar ? (
              <button
                key={i}
                type="button"
                className={`${s.plek} ${s.plekTik}`}
                style={stijl}
                data-plek={i}
                aria-label={tikPlaatje === "weg" ? "Weghalen" : "Erbij doen"}
                onClick={() => meld({ soort: "plaatje", i })}
              >
                {nr !== undefined && <span className={s.nummer}>{nr}</span>}
              </button>
            ) : nr !== undefined ? (
              <div key={i} className={s.plek} style={stijl}>
                <span className={s.nummer}>{nr}</span>
              </div>
            ) : null;
          })}
        </div>
      )}

      {keuzes && (
        <KeuzeKnoppen
          className={`${s.keuzes} ${keuzes.som ? s.somKeuzes : ""} ${keuzes.tegels ? s.tegels : ""}`}
          opties={keuzes.opties}
          uit={keuzes.uit ?? []}
          kies={(o) => meld({ soort: "keuze", waarde: o })}
        />
      )}

      {/* Het handje (toets): een rond knopje rechtsboven, naast de vraag van Bliepo (eigen tekening). */}
      {handje && (
        <button type="button" className={s.handje} data-knop="handje" aria-label="Ik wil liever de les" onClick={() => meld({ soort: "handje" })}>
          <svg viewBox="0 0 48 48" aria-hidden>
            <path
              d="M17 26 V12 a3 3 0 0 1 6 0 V23 V9 a3 3 0 0 1 6 0 V23 V11 a3 3 0 0 1 6 0 V25 V17 a3 3 0 0 1 6 0 V30 c0 9 -6 14 -13 14 c-6 0 -9 -3 -12 -8 l-6 -9 a3 3 0 0 1 5 -3 Z"
              fill="#ffc845"
              stroke="#1d2b5e"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

      {knoppenInVlak && klaarKnop && (
        <div className={s.klaar}>
          <IkoonKnop ikoon="vink" label="Klaar" knop="klaar" kleur="blauw" className={s.grootIkoon} onClick={() => meld({ soort: "klaar" })} />
        </div>
      )}

      {knoppenInVlak && weetNiet && (
        <div className={s.weetniet}>
          <IkoonKnop ikoon="vraag" label="Weet ik niet" knop="weetniet" onClick={() => meld({ soort: "weetniet" })} />
        </div>
      )}
    </div>
  );
}
