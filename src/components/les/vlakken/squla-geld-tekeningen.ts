/**
 * Tekeningen voor de lessen Geld naar Squla (31 oktober 2026): de spaarpot,
 * speelgoed met een prijskaartje, Sam en Noor, hun klusjes en de rommelmarkt.
 * Eigen werk, vlak en vriendelijk in de stijl van bliepo-voorwerpen.ts
 * (donkerblauwe rand, petrol, koraal, warmgeel, warmwit); geen plaatjes van
 * buiten, geen AI, geen emoji, niets van Squla.
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
const ROZE_DONKER = "#f08fb0";
const HOUT = "#d79a62";
const HOUT_LICHT = "#efc796";
const HOUT_DONKER = "#8a5a33";
const GROEN = "#55c26f";
const HUID_1 = "#f3cba8";
const HUID_2 = "#b8825d";
const HAAR_1 = "#8a5a33";
const HAAR_2 = "#3a2a22";
const LUCHT = "#9fd8ff";

const ovaal = (x: number, y: number, rx: number, ry: number) => `M ${x - rx} ${y} a ${rx} ${ry} 0 1 0 ${2 * rx} 0 a ${rx} ${ry} 0 1 0 ${-2 * rx} 0 Z`;
const lijn = (d: string, kleur: string = N, dik = RAND_DUN): Vorm => ({ d, rand: kleur, dik });
const vlak = (d: string, vul: string, dik = RAND_DUN): Vorm => ({ d, vul, rand: N, dik });

export type Tekening = { b: number; h: number; vormen: Vorm[] };

/* ---------- de spaarpot (een varken) ---------- */

const spaarpot: Tekening = {
  b: 230,
  h: 190,
  vormen: [
    vlak(blok(54, 136, 26, 38, 10), ROZE_DONKER),
    vlak(blok(138, 136, 26, 38, 10), ROZE_DONKER),
    lijn("M 30 98 C 12 96 10 76 22 74 C 32 72 32 88 20 90"),
    vlak("M 146 56 L 160 22 L 180 62 Z", ROZE_DONKER),
    vlak(ovaal(108, 104, 84, 62), ROZE, RAND),
    vlak(blok(76, 152, 26, 26, 10), ROZE_DONKER),
    vlak(blok(116, 152, 26, 26, 10), ROZE_DONKER),
    vlak(ovaal(196, 110, 18, 22), ROZE_DONKER, RAND),
    { d: ovaal(191, 104, 3.5, 5), vul: N },
    { d: ovaal(202, 104, 3.5, 5), vul: N },
    { d: cirkel(164, 88, 6.5), vul: N },
    lijn("M 150 128 Q 160 134 170 128"),
    { d: blok(84, 44, 46, 10, 5), vul: N },
    lijn("M 62 78 Q 70 66 84 62", PALET.warmwit, 5),
  ],
};

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

const autootje: Tekening = {
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

const beer: Tekening = {
  b: 160,
  h: 170,
  vormen: [
    vlak(cirkel(52, 30, 15), HOUT),
    vlak(cirkel(108, 30, 15), HOUT),
    { d: cirkel(52, 30, 7), vul: HOUT_LICHT },
    { d: cirkel(108, 30, 7), vul: HOUT_LICHT },
    vlak(ovaal(80, 122, 42, 42), HOUT, RAND),
    vlak(ovaal(80, 128, 22, 24), HOUT_LICHT),
    vlak(ovaal(38, 112, 13, 22), HOUT),
    vlak(ovaal(122, 112, 13, 22), HOUT),
    vlak(ovaal(56, 160, 18, 10), HOUT),
    vlak(ovaal(104, 160, 18, 10), HOUT),
    vlak(cirkel(80, 58, 36), HOUT, RAND),
    vlak(ovaal(80, 70, 16, 12), HOUT_LICHT),
    { d: ovaal(80, 64, 6, 4.5), vul: N },
    lijn("M 80 68 V 74 M 72 76 Q 80 82 88 76"),
    { d: cirkel(66, 50, 4.5), vul: N },
    { d: cirkel(94, 50, 4.5), vul: N },
    lijn("M 62 96 L 80 104 L 98 96", PALET.koraal, 6),
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

const puzzel: Tekening = {
  b: 160,
  h: 150,
  vormen: [
    vlak(blok(12, 18, 136, 116, 12), PALET.warmwit, RAND),
    vlak(blok(26, 32, 52, 42, 4), PALET.koraal),
    vlak(blok(82, 32, 52, 42, 4), PALET.geel),
    vlak(blok(26, 78, 52, 42, 4), PALET.petrol),
    vlak(blok(82, 78, 52, 42, 4), ROZE),
    vlak(cirkel(80, 53, 8), PALET.koraal, 2.5),
    vlak(cirkel(52, 76, 8), PALET.petrol, 2.5),
    vlak(cirkel(108, 76, 8), PALET.geel, 2.5),
    vlak(cirkel(80, 99, 8), ROZE, 2.5),
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

const schelpen: Tekening = {
  b: 180,
  h: 120,
  vormen: [
    ...[
      [44, 70, PALET.warmwit],
      [94, 52, PALET.koraalLicht],
      [140, 76, PALET.geelLicht],
    ].flatMap(([x, y, k]) => {
      const cx = x as number;
      const cy = y as number;
      return [
        vlak(`M ${cx - 30} ${cy + 4} Q ${cx - 32} ${cy - 30} ${cx} ${cy - 32} Q ${cx + 32} ${cy - 30} ${cx + 30} ${cy + 4} L ${cx + 8} ${cy + 22} H ${cx - 8} Z`, k as string),
        lijn(`M ${cx} ${cy + 20} V ${cy - 28} M ${cx - 6} ${cy + 20} L ${cx - 20} ${cy - 22} M ${cx + 6} ${cy + 20} L ${cx + 20} ${cy - 22}`, N, 2.5),
      ];
    }),
  ],
};

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

const puzzelstukjes: Tekening = {
  b: 180,
  h: 120,
  vormen: [
    ...[
      [20, 18, PALET.koraal],
      [96, 14, PALET.geel],
      [26, 66, PALET.petrol],
      [104, 64, ROZE],
    ].flatMap(([x, y, k]) => {
      const a = x as number;
      const b = y as number;
      return [vlak(`M ${a} ${b} H ${a + 18} a 8 8 0 1 1 16 0 H ${a + 52} V ${b + 36} H ${a} Z`, k as string)];
    }),
  ],
};

/* ---------- Sam en Noor (ontwerpvak 130 × 180) ---------- */

function kind(huid: string, haar: string, shirt: string, staartjes: boolean): Tekening {
  return {
    b: 130,
    h: 180,
    vormen: [
      ...(staartjes ? [vlak(ovaal(26, 60, 13, 18), haar), vlak(ovaal(104, 60, 13, 18), haar)] : []),
      vlak("M 22 180 V 132 Q 22 100 65 100 Q 108 100 108 132 V 180 Z", shirt, RAND),
      vlak(cirkel(65, 58, 34), huid, RAND),
      vlak(staartjes ? "M 31 56 Q 30 22 65 22 Q 100 22 99 56 Q 92 38 65 38 Q 38 38 31 56 Z" : "M 31 54 Q 28 20 65 20 Q 102 20 99 54 Q 88 34 70 40 Q 50 30 31 54 Z", haar),
      { d: cirkel(53, 60, 4.5), vul: N },
      { d: cirkel(77, 60, 4.5), vul: N },
      lijn("M 53 74 Q 65 84 77 74"),
    ],
  };
}

const sam = kind(HUID_1, HAAR_1, PALET.petrol, false);
const noor = kind(HUID_2, HAAR_2, PALET.koraal, true);

/* ---------- klusjes (ontwerpvak 160 × 160) ---------- */

const hond: Tekening = {
  b: 170,
  h: 150,
  vormen: [
    lijn("M 34 72 Q 14 60 22 36", N, RAND),
    vlak(blok(40, 108, 14, 32, 6), HOUT),
    vlak(blok(104, 108, 14, 32, 6), HOUT),
    vlak(blok(26, 62, 100, 54, 26), HOUT, RAND),
    vlak(blok(56, 108, 14, 32, 6), HOUT),
    vlak(blok(88, 108, 14, 32, 6), HOUT),
    vlak(cirkel(126, 56, 28), HOUT, RAND),
    vlak("M 112 34 Q 98 44 104 72 Q 114 66 118 40 Z", HOUT_DONKER),
    { d: cirkel(132, 50, 4.5), vul: N },
    { d: ovaal(152, 60, 6, 5), vul: N },
    lijn("M 130 82 L 146 84", PALET.koraal, 6),
    lijn("M 146 84 Q 166 110 160 140", PALET.petrol, 4),
  ],
};

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

const afwas: Tekening = {
  b: 170,
  h: 150,
  vormen: [
    vlak(cirkel(70, 82, 54), PALET.warmwit, RAND),
    { d: cirkel(70, 82, 34), rand: PALET.petrolLicht, dik: 4 },
    vlak(blok(108, 22, 52, 34, 8), PALET.geel, RAND),
    lijn("M 108 44 H 160", GROEN, 6),
    vlak(cirkel(126, 82, 10), LUCHT, 2.5),
    vlak(cirkel(146, 70, 7), LUCHT, 2.5),
    vlak(cirkel(140, 100, 6), LUCHT, 2.5),
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

const tas: Tekening = {
  b: 170,
  h: 150,
  vormen: [
    vlak(blok(46, 22, 20, 52, 9), PALET.geel),
    vlak(ovaal(104, 40, 18, 22), GROEN),
    lijn("M 54 64 Q 54 30 85 30 Q 116 30 116 64", N, RAND),
    vlak("M 30 58 H 140 L 130 144 H 40 Z", PALET.koraal, RAND),
    lijn("M 60 96 H 110", PALET.koraalLicht, 6),
  ],
};

/* ---------- de rommelmarkt: een kraam (ontwerpvak 260 × 200) ---------- */

const kraam: Tekening = {
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

export const TEKENINGEN: Record<string, Tekening> = {
  spaarpot,
  bal,
  springtouw,
  autootje,
  vlieger,
  beer,
  bootje,
  treintje,
  puzzel,
  skateboard,
  schelpen,
  knoop,
  puzzelstukjes,
  sam,
  noor,
  hond,
  gieter,
  afwas,
  doos,
  emmer,
  tas,
  kraam,
  plant,
};
