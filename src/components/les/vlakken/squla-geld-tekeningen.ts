/**
 * Tekeningen voor de lessen Geld naar Squla (31 oktober 2026): de spaarpot,
 * de portemonnee, speelgoed, de klusjes en de marktkraam. Alleen DINGEN:
 * geen mensen, geen dieren, niets met een gezichtje (besluit Sara 31 okt).
 * Dit zijn simpele placeholders, eigen werk in code; geen AI, geen emoji,
 * niets van Squla. Elk ding heeft één sleutel (de naam uit
 * public/proef-plaatjes/zinnen.html): staat er later een
 * public/proef-plaatjes/<sleutel>.png, dan gebruikt het vlak die PNG.
 *
 * Munten en briefjes zijn hier NOOIT getekend: die komen altijd uit de
 * officiële afbeeldingen in public/geld/ (zie BRON.md daar).
 *
 * Elke tekening is een lijst SVG-vormen in een ontwerpvak (b × h), zodat
 * dezelfde tekening op een canvas (Phaser) en als SVG (de kaart aan het eind)
 * gebruikt kan worden.
 */

import { PALET, RAND, RAND_DUN, blok, cirkel, type Vorm } from "./bliepo-voorwerpen";

const N: string = PALET.navy;
const ROZE = "#f9bfd3";
const HOUT = "#d79a62";
const HOUT_LICHT = "#efc796";
const HOUT_DONKER = "#8a5a33";
const GROEN = "#55c26f";
const LUCHT = "#9fd8ff";

const ovaal = (x: number, y: number, rx: number, ry: number) => `M ${x - rx} ${y} a ${rx} ${ry} 0 1 0 ${2 * rx} 0 a ${rx} ${ry} 0 1 0 ${-2 * rx} 0 Z`;
const lijn = (d: string, kleur: string = N, dik = RAND_DUN): Vorm => ({ d, rand: kleur, dik });
const vlak = (d: string, vul: string, dik = RAND_DUN): Vorm => ({ d, vul, rand: N, dik });

export type Tekening = { b: number; h: number; vormen: Vorm[] };


/* ---------- speelgoed (ontwerpvak 160 × 160) ---------- */

const bal: Tekening = {
  b: 160,
  h: 160,
  vormen: [
    vlak(cirkel(80, 82, 62), PALET.koraal, RAND),
    { d: "M 22 66 Q 80 104 138 66 L 141 86 Q 80 124 19 86 Z", vul: PALET.warmwit },
    lijn("M 22 66 Q 80 104 138 66 M 19 86 Q 80 124 141 86"),
    { d: cirkel(80, 82, 62), rand: N, dik: RAND },
    lijn("M 46 46 Q 54 36 66 32", PALET.warmwit, 5),
  ],
};

const springtouw: Tekening = {
  b: 160,
  h: 160,
  vormen: [
    lijn("M 34 62 C 22 118 52 152 82 146 C 112 140 150 120 126 62", N, 11),
    lijn("M 34 62 C 22 118 52 152 82 146 C 112 140 150 120 126 62", PALET.petrol, 6),
    vlak("M 20 14 L 40 10 L 44 62 L 28 64 Z", PALET.geel, RAND),
    vlak("M 120 10 L 140 14 L 132 64 L 116 62 Z", PALET.koraal, RAND),
  ],
};

const speelgoedauto: Tekening = {
  b: 160,
  h: 160,
  vormen: [
    vlak("M 12 112 V 90 Q 12 78 26 76 L 46 74 L 64 48 Q 68 42 78 42 H 112 Q 122 42 126 50 L 140 74 Q 150 78 150 90 V 112 Z", PALET.koraal, RAND),
    vlak("M 70 72 L 80 54 H 96 V 72 Z", LUCHT),
    vlak("M 104 72 V 54 H 112 Q 116 54 118 58 L 126 72 Z", LUCHT),
    vlak(cirkel(44, 114, 17), N),
    { d: cirkel(44, 114, 6), vul: PALET.warmwit },
    vlak(cirkel(120, 114, 17), N),
    { d: cirkel(120, 114, 6), vul: PALET.warmwit },
    vlak(blok(138, 86, 12, 9, 3), PALET.geel, 2.5),
  ],
};

const vlieger: Tekening = {
  b: 160,
  h: 170,
  vormen: [
    lijn("M 80 128 Q 66 140 80 150 Q 94 160 80 168", N, 3),
    vlak("M 72 140 L 66 134 L 66 146 Z M 88 158 L 94 152 L 94 164 Z", PALET.koraal, 2.5),
    vlak("M 80 10 L 134 64 L 80 128 L 26 64 Z", PALET.geel, RAND),
    vlak("M 80 10 L 134 64 L 80 64 Z", PALET.koraal, RAND_DUN),
    vlak("M 80 64 L 80 128 L 26 64 Z", PALET.koraal, RAND_DUN),
    lijn("M 80 10 V 128 M 26 64 H 134"),
  ],
};


const bootje: Tekening = {
  b: 160,
  h: 160,
  vormen: [
    lijn("M 80 112 V 18", N, RAND),
    vlak("M 86 24 L 86 100 L 138 100 Z", PALET.warmwit),
    vlak("M 74 34 L 74 100 L 30 100 Z", PALET.geel),
    vlak("M 80 18 L 100 24 L 80 30 Z", PALET.koraal, 2.5),
    vlak("M 14 106 H 146 L 126 138 H 34 Z", PALET.koraal, RAND),
    lijn("M 10 148 Q 30 140 50 148 Q 70 156 90 148 Q 110 140 130 148 Q 145 154 152 150", PALET.petrol, 5),
  ],
};

const treintje: Tekening = {
  b: 170,
  h: 150,
  vormen: [
    vlak(blok(34, 30, 22, 32, 4), N),
    vlak(blok(98, 34, 54, 54, 8), PALET.petrol, RAND),
    vlak(blok(110, 46, 30, 22, 4), LUCHT),
    vlak(blok(18, 60, 134, 52, 10), PALET.petrol, RAND),
    vlak(blok(10, 98, 18, 14, 4), PALET.geel, 2.5),
    lijn("M 30 78 H 92", PALET.geel, 6),
    vlak(cirkel(46, 118, 17), N),
    { d: cirkel(46, 118, 6), vul: PALET.warmwit },
    vlak(cirkel(86, 118, 17), N),
    { d: cirkel(86, 118, 6), vul: PALET.warmwit },
    vlak(cirkel(128, 118, 17), N),
    { d: cirkel(128, 118, 6), vul: PALET.warmwit },
  ],
};


const skateboard: Tekening = {
  b: 210,
  h: 110,
  vormen: [
    vlak(blok(56, 60, 12, 14, 3), N),
    vlak(blok(142, 60, 12, 14, 3), N),
    vlak("M 14 48 Q 14 32 32 34 L 60 40 H 150 L 178 34 Q 196 32 196 48 Q 196 62 178 62 H 32 Q 14 62 14 48 Z", PALET.koraal, RAND),
    lijn("M 50 50 H 160", PALET.geel, 6),
    vlak(cirkel(62, 82, 14), PALET.geel),
    vlak(cirkel(148, 82, 14), PALET.geel),
    { d: cirkel(62, 82, 4.5), vul: N },
    { d: cirkel(148, 82, 4.5), vul: N },
  ],
};

/* ---------- geen geld (om mee te grappen) ---------- */


const knoop: Tekening = {
  b: 120,
  h: 120,
  vormen: [
    vlak(cirkel(60, 60, 44), PALET.petrol, RAND),
    { d: cirkel(60, 60, 32), rand: PALET.petrolLicht, dik: 3 },
    { d: cirkel(50, 50, 6), vul: N },
    { d: cirkel(70, 50, 6), vul: N },
    { d: cirkel(50, 70, 6), vul: N },
    { d: cirkel(70, 70, 6), vul: N },
  ],
};


/* ---------- klusjes (ontwerpvak 160 × 160) ---------- */


const gieter: Tekening = {
  b: 170,
  h: 150,
  vormen: [
    lijn("M 40 64 Q 64 22 92 64", N, RAND),
    lijn("M 104 92 L 144 56", N, 13),
    lijn("M 104 92 L 144 56", PALET.petrol, 7),
    vlak(blok(138, 46, 22, 16, 5), PALET.petrol),
    vlak(blok(22, 62, 88, 70, 12), PALET.petrol, RAND),
    lijn("M 34 82 H 98", PALET.petrolLicht, 5),
    vlak(ovaal(152, 82, 4, 6), LUCHT, 2),
    vlak(ovaal(162, 100, 4, 6), LUCHT, 2),
    vlak(ovaal(148, 112, 4, 6), LUCHT, 2),
  ],
};


const doos: Tekening = {
  b: 170,
  h: 150,
  vormen: [
    vlak("M 22 62 L 8 38 H 72 L 85 62 Z", HOUT_LICHT),
    vlak("M 148 62 L 162 38 H 98 L 85 62 Z", HOUT_LICHT),
    vlak(blok(22, 60, 126, 82, 6), HOUT, RAND),
    lijn("M 60 82 H 110", HOUT_DONKER, 6),
  ],
};

const emmer: Tekening = {
  b: 170,
  h: 150,
  vormen: [
    lijn("M 40 58 Q 85 4 130 58", N, RAND),
    vlak(cirkel(60, 50, 16), PALET.warmwit, 2.5),
    vlak(cirkel(86, 42, 18), PALET.warmwit, 2.5),
    vlak(cirkel(112, 50, 15), PALET.warmwit, 2.5),
    vlak("M 30 56 H 140 L 126 142 H 44 Z", PALET.petrolLicht, RAND),
    lijn("M 38 80 H 132", PALET.petrol, 5),
  ],
};


/* ---------- de rommelmarkt: een kraam (ontwerpvak 260 × 200) ---------- */

const marktkraam: Tekening = {
  b: 260,
  h: 200,
  vormen: [
    lijn("M 34 60 V 188 M 226 60 V 188", N, RAND),
    vlak(blok(20, 118, 220, 26, 6), HOUT, RAND),
    vlak(blok(40, 144, 12, 44, 3), HOUT_DONKER),
    vlak(blok(208, 144, 12, 44, 3), HOUT_DONKER),
    vlak(blok(54, 96, 30, 22, 3), PALET.petrol),
    vlak(blok(58, 80, 26, 16, 3), PALET.geel),
    vlak(cirkel(122, 102, 16), PALET.koraal),
    vlak("M 158 118 L 172 86 L 186 118 Z", GROEN),
    vlak(blok(194, 92, 28, 26, 4), ROZE),
    vlak("M 14 60 L 30 18 H 230 L 246 60 Z", PALET.warmwit, RAND),
    ...[0, 1, 2, 3, 4].map((i) => {
      /* Een rode baan van het zeil: boven 20 breed, onder even breed naar verhouding. */
      const onder = (t: number) => 14 + (t - 30) * 1.16;
      const a = 30 + i * 40;
      return vlak(`M ${a} 18 H ${a + 20} L ${onder(a + 20)} 60 H ${onder(a)} Z`, PALET.koraal, 2.5);
    }),
    vlak("M 14 60 Q 27 76 40 60 Q 53 76 66 60 Q 79 76 92 60 Q 105 76 118 60 Q 131 76 144 60 Q 157 76 170 60 Q 183 76 196 60 Q 209 76 222 60 Q 235 76 246 60 Z", PALET.koraal, RAND_DUN),
  ],
};

/** Een plant (bij de gieter). */
const plant: Tekening = {
  b: 120,
  h: 150,
  vormen: [
    lijn("M 60 96 V 40", HOUT_DONKER, 5),
    vlak("M 60 70 Q 30 70 22 44 Q 50 40 60 66 Z", GROEN),
    vlak("M 60 58 Q 88 56 98 30 Q 70 26 60 54 Z", GROEN),
    vlak(cirkel(60, 30, 12), PALET.geel),
    vlak("M 30 96 H 90 L 82 144 H 38 Z", PALET.koraal, RAND),
    lijn("M 34 110 H 86", PALET.koraalLicht, 4),
  ],
};

/* ---------- geld bewaren ---------- */

/** Een ronde glazen pot met een gleuf in het deksel. */
const spaarpot: Tekening = {
  b: 180,
  h: 200,
  vormen: [
    vlak("M 34 60 Q 14 80 14 120 Q 14 190 90 192 Q 166 190 166 120 Q 166 80 146 60 Z", "#cfeaf7", RAND),
    lijn("M 34 100 Q 30 150 52 170", "#ffffff", 7),
    vlak(blok(28, 34, 124, 30, 10), PALET.koraal, RAND),
    { d: blok(66, 44, 48, 9, 4.5), vul: N },
  ],
};

const portemonnee: Tekening = {
  b: 180,
  h: 140,
  vormen: [
    vlak(blok(12, 30, 156, 100, 18), PALET.koraal, RAND),
    vlak("M 12 52 Q 12 30 34 30 H 146 Q 168 30 168 52 V 72 H 12 Z", "#d95a49"),
    vlak(blok(118, 58, 40, 30, 10), PALET.geel),
    { d: cirkel(138, 73, 5), vul: N },
  ],
};

/* ---------- meer speelgoed ---------- */

const raketje: Tekening = {
  b: 140,
  h: 180,
  vormen: [
    vlak("M 44 120 L 22 160 L 50 150 Z", PALET.koraal),
    vlak("M 96 120 L 118 160 L 90 150 Z", PALET.koraal),
    vlak("M 70 10 C 100 34 104 90 96 150 H 44 C 36 90 40 34 70 10 Z", PALET.warmwit, RAND),
    vlak("M 70 10 C 86 22 94 40 97 56 H 43 C 46 40 54 22 70 10 Z", PALET.koraal),
    vlak(cirkel(70, 86, 15), LUCHT),
    vlak("M 56 150 L 70 176 L 84 150 Z", PALET.geel, 2.5),
  ],
};

const voetbal: Tekening = {
  b: 150,
  h: 150,
  vormen: [
    vlak(cirkel(75, 75, 62), "#ffffff", RAND),
    { d: "M 75 52 L 97 68 L 89 94 H 61 L 53 68 Z", vul: N },
    lijn("M 75 52 V 16 M 97 68 L 132 56 M 89 94 L 110 124 M 61 94 L 40 124 M 53 68 L 18 56", N, 3),
  ],
};

const boek: Tekening = {
  b: 160,
  h: 140,
  vormen: [
    vlak(blok(22, 14, 116, 112, 8), "#4b7be0", RAND),
    vlak(blok(22, 14, 18, 112, 6), "#3560c0"),
    lijn("M 136 20 V 122", PALET.warmwit, 5),
  ],
};

const schelp: Tekening = {
  b: 100,
  h: 90,
  vormen: [
    vlak("M 16 54 Q 14 12 50 10 Q 86 12 84 54 L 60 76 H 40 Z", PALET.koraalLicht),
    lijn("M 50 74 V 16 M 43 74 L 28 20 M 57 74 L 72 20", N, 2.5),
  ],
};

/* ---------- meer klusjes ---------- */

const bezem: Tekening = {
  b: 120,
  h: 190,
  vormen: [
    lijn("M 60 10 V 122", HOUT_DONKER, 9),
    vlak("M 40 120 H 80 L 100 182 H 20 Z", PALET.geel, RAND),
    lijn("M 40 150 L 36 180 M 60 150 V 180 M 80 150 L 84 180", N, 2.5),
  ],
};

const bord: Tekening = {
  b: 150,
  h: 150,
  vormen: [vlak(cirkel(75, 75, 64), PALET.warmwit, RAND), { d: cirkel(75, 75, 40), rand: PALET.petrolLicht, dik: 5 }],
};

const bed: Tekening = {
  b: 200,
  h: 140,
  vormen: [
    vlak(blok(14, 20, 22, 110, 6), HOUT, RAND),
    vlak(blok(164, 56, 22, 74, 6), HOUT, RAND),
    vlak(blok(30, 66, 140, 40, 8), "#4b7be0", RAND),
    vlak(blok(38, 46, 50, 24, 10), PALET.warmwit),
  ],
};

const jas: Tekening = {
  b: 150,
  h: 170,
  vormen: [
    vlak("M 52 16 L 20 40 L 10 110 L 32 112 L 38 64 V 158 H 112 V 64 L 118 112 L 140 110 L 130 40 L 98 16 Q 75 34 52 16 Z", PALET.petrol, RAND),
    lijn("M 75 30 V 156", N, 3),
    { d: cirkel(86, 70, 4), vul: PALET.geel },
    { d: cirkel(86, 100, 4), vul: PALET.geel },
  ],
};

const schoen: Tekening = {
  b: 170,
  h: 110,
  vormen: [vlak("M 20 20 H 70 L 82 52 Q 150 58 156 84 V 96 H 20 Z", PALET.koraal, RAND), lijn("M 20 84 H 156", PALET.warmwit, 5), lijn("M 56 30 L 74 40 M 54 44 L 76 52", PALET.warmwit, 3)],
};

/** Elke sleutel: dezelfde naam als in public/proef-plaatjes/zinnen.html. */
export const TEKENINGEN: Record<string, Tekening> = {
  spaarpot,
  portemonnee,
  skateboard,
  bal,
  voetbal,
  springtouw,
  speelgoedauto,
  vlieger,
  bootje,
  treintje,
  raketje,
  boek,
  knoop,
  schelp,
  bezem,
  gieter,
  plant,
  emmer,
  doos,
  bord,
  bed,
  jas,
  schoen,
  marktkraam,
};
