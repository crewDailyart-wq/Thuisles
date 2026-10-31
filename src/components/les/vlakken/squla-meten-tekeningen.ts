/**
 * Tekeningen voor de lessen Meten en maten naar Squla (31 oktober 2026):
 * Pizza's vergelijken, Hoeveelheden en Oppervlakte. Eigen werk, vlak en
 * vriendelijk in de stijl van bliepo-voorwerpen.ts (donkerblauwe rand,
 * petrol, koraal, warmgeel, warmwit); geen plaatjes van buiten, geen AI,
 * geen emoji, niets van Squla.
 *
 * Elke tekening heeft een ontwerpvak (b × h). Belangrijk: de maten zijn
 * onderling "echt" (een kleine pizza heeft een kleiner vak dan een grote),
 * zodat de scène een hele rij met dezelfde schaal kan tekenen en het verschil
 * in grootte blijft kloppen.
 *
 * Sleutels: "naam|optie=waarde|…", bijvoorbeeld "pizza|m=0.6|top=salami".
 */

import { PALET, RAND_DUN, blok, cirkel, tekenVormen } from "./bliepo-voorwerpen";

const N: string = PALET.navy;
const GROEN = "#55c26f";
const GROEN_DONKER = "#2f8a4a";
const LUCHT = "#cfeaff";
const HOUT = "#d39b62";
const HOUT_LICHT = "#e9c48f";
const KARTON = "#d9a86c";
const ROOD = "#e8453c";
const PAARS = "#a986ec";
const ROZE = "#f594c6";
const KORST = "#f0b15c";
const SAUS = "#e2563f";
const KAAS = "#ffe08a";
const SALAMI = "#b8332b";
const BLAUW = "#4b8af5";
const ORANJE = "#ff9a3c";
const GRIJS = "#b9c0cc";
const HUID = ["#f7d2b4", "#d9a07a", "#a8714f", "#f2c7a0"];

/** De kleuren die in de zinnen voorkomen (gele blaadjes, rode tegels…). */
export const MKLEUR: Record<string, string> = { geel: PALET.geel, rood: ROOD, groen: GROEN, blauw: BLAUW, oranje: ORANJE, paars: PAARS, roze: ROZE };

let LETTER = "system-ui, sans-serif";
/** Het lettertype van de les (voor tekst in de tekeningen). */
export function zetLettertype(f: string) {
  if (f) LETTER = f;
}

type C = CanvasRenderingContext2D;
type O = Record<string, string>;
type Punt = { x: number; y: number };

function vorm(c: C, d: string, vul?: string, dik: number = RAND_DUN, rand: string | null = N) {
  tekenVormen(c, [{ d, vul, rand: rand ?? undefined, dik }]);
}
const ovaal = (x: number, y: number, rx: number, ry: number) => `M ${x - rx} ${y} a ${rx} ${ry} 0 1 0 ${2 * rx} 0 a ${rx} ${ry} 0 1 0 ${-2 * rx} 0 Z`;

function tekst(c: C, t: string, x: number, y: number, maat: number, kleur: string = N, gewicht = 800) {
  c.font = `${gewicht} ${maat}px ${LETTER}`;
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.fillStyle = kleur;
  c.fillText(t, x, y);
}

const getal = (o: O, k: string, std: number) => (o[k] !== undefined && o[k] !== "" ? Number(o[k]) : std);

/* =====================================================================
   PIZZA'S
   ===================================================================== */

/** Een hele pizza van bovenaf; ontwerpvak 200·m. */
function pizza(c: C, m: number, top = "kaas") {
  const s = m;
  const k = 100 * s;
  vorm(c, cirkel(k, k, 94 * s), KORST);
  vorm(c, cirkel(k, k, 78 * s), SAUS, 0, null);
  const kaas = [
    [-30, -28],
    [26, -36],
    [38, 18],
    [-22, 32],
    [2, 0],
    [-48, 8],
    [12, 46],
    [50, -10],
  ];
  for (const [x, y] of kaas) vorm(c, cirkel(k + x * s, k + y * s, 15 * s), KAAS, 0, null);
  if (top === "salami") {
    for (const [x, y] of [[-36, -6], [20, -22], [4, 30], [42, 20], [-18, 50], [-8, -46], [52, -34]]) {
      vorm(c, cirkel(k + x * s, k + y * s, 13 * s), SALAMI, 2);
    }
  }
  if (top === "olijf") {
    for (const [x, y] of [[-36, -6], [20, -22], [4, 30], [42, 20], [-18, 50]]) {
      vorm(c, cirkel(k + x * s, k + y * s, 7 * s), N, 0, null);
      vorm(c, cirkel(k + x * s, k + y * s, 3 * s), SAUS, 0, null);
    }
  }
  c.save();
  c.strokeStyle = "rgba(29,43,94,0.45)";
  c.lineWidth = 2.5;
  for (const a of [0, Math.PI / 3, (2 * Math.PI) / 3]) {
    c.beginPath();
    c.moveTo(k - Math.cos(a) * 80 * s, k - Math.sin(a) * 80 * s);
    c.lineTo(k + Math.cos(a) * 80 * s, k + Math.sin(a) * 80 * s);
    c.stroke();
  }
  c.restore();
  vorm(c, cirkel(k, k, 94 * s), undefined);
}

/** Eén punt pizza (ontwerpvak 100 × 120). */
function punt(c: C) {
  vorm(c, "M 50 116 L 8 26 Q 50 4 92 26 Z", KAAS);
  vorm(c, "M 8 26 Q 50 4 92 26 L 86 38 Q 50 18 14 38 Z", KORST, 2.5);
  vorm(c, cirkel(42, 56, 9), SALAMI, 2);
  vorm(c, cirkel(60, 78, 8), SALAMI, 2);
  vorm(c, cirkel(48, 96, 5), SALAMI, 2);
}

const puntenMaat = (n: number) => ({ b: Math.max(1, n) * 110 + 30, h: 168 });
function puntenPunten(n: number): Punt[] {
  return Array.from({ length: n }, (_, i) => ({ x: 15 + i * 110 + 55, y: 84 }));
}
function punten(c: C, n: number) {
  const { b } = puntenMaat(n);
  vorm(c, blok(4, 34, b - 8, 120, 22), HOUT_LICHT);
  for (let i = 0; i < n; i++) {
    c.save();
    c.translate(15 + i * 110 + 5, 24);
    punt(c);
    c.restore();
  }
}

/** Een ijsje; `bol` bolletjes, `m` = hoe groot, `kers`. */
const IJS = [ROZE, KAAS, PALET.petrolLicht, PALET.koraalLicht, "#c9a27a"];
function ijsMaat(o: O) {
  const m = getal(o, "m", 1);
  const n = getal(o, "bol", 1);
  return { b: 130 * m, h: (112 + n * 46 + 34 + (o.kers ? 24 : 0)) * m };
}
function ijsPunten(o: O): Punt[] {
  const m = getal(o, "m", 1);
  const n = getal(o, "bol", 1);
  const { h } = ijsMaat(o);
  const topY = h - 108 * m;
  return Array.from({ length: n }, (_, i) => ({ x: 65 * m, y: topY - 16 * m - i * 46 * m }));
}
function ijsje(c: C, o: O) {
  const m = getal(o, "m", 1);
  const n = getal(o, "bol", 1);
  const { h } = ijsMaat(o);
  const tip = h - 4;
  const topY = h - 108 * m;
  const pts = ijsPunten(o);
  vorm(c, `M ${30 * m} ${topY} L ${65 * m} ${tip} L ${100 * m} ${topY} Z`, "#e8b26a");
  c.save();
  c.strokeStyle = "rgba(29,43,94,0.5)";
  c.lineWidth = 2;
  for (let i = 1; i < 4; i++) {
    c.beginPath();
    c.moveTo((30 + i * 9) * m, topY);
    c.lineTo((56 + i * 9) * m, topY + 60 * m);
    c.moveTo((100 - i * 9) * m, topY);
    c.lineTo((74 - i * 9) * m, topY + 60 * m);
    c.stroke();
  }
  c.restore();
  for (let i = 0; i < n; i++) {
    const p = pts[i];
    vorm(c, cirkel(p.x, p.y, 38 * m), IJS[i % IJS.length]);
  }
  if (o.kers) {
    const y = pts[n - 1].y - 38 * m - 10 * m;
    vorm(c, `M ${65 * m} ${y} Q ${72 * m} ${y - 18 * m} ${84 * m} ${y - 22 * m}`, undefined, 3);
    vorm(c, cirkel(65 * m, y, 11 * m), ROOD, 2.5);
  }
}

/** Een open pizzadoos met een pizza erin (`p` = hoe groot de pizza is, 0–1). */
function pizzadoos(c: C, o: O) {
  const p = getal(o, "p", 1);
  vorm(c, blok(24, 0, 192, 96, 10), HOUT_LICHT);
  vorm(c, blok(36, 12, 168, 72, 8), "#f3dbb0", 2);
  vorm(c, blok(0, 84, 240, 166, 12), KARTON);
  vorm(c, blok(16, 100, 208, 134, 8), "#f3dbb0", 2);
  const r = 62 * p;
  const m = r / 94;
  c.save();
  c.translate(120 - 100 * m, 167 - 100 * m);
  pizza(c, m);
  c.restore();
}

/** Een stapel dichte pizzadozen (`n` hoog). */
function dozen(c: C, o: O) {
  const n = getal(o, "n", 1);
  const kleur = o.kleur ? (MKLEUR[o.kleur] ?? KARTON) : KARTON;
  const h = n * 40 + 8;
  for (let i = 0; i < n; i++) {
    const y = h - 4 - (i + 1) * 40;
    vorm(c, blok(4, y, 212, 40, 8), kleur);
    vorm(c, `M 14 ${y + 12} H 206`, undefined, 2);
    vorm(c, cirkel(110, y + 26, 7), SAUS, 2);
  }
}

/** Heel veel stapels dozen (`s` stapels van `n`). */
function stapels(c: C, o: O) {
  const s = getal(o, "s", 6);
  const n = getal(o, "n", 7);
  const h = n * 26 + 8;
  for (let j = 0; j < s; j++) {
    for (let i = 0; i < n; i++) {
      const y = h - 4 - (i + 1) * 26;
      vorm(c, blok(6 + j * 80, y, 72, 26, 5), KARTON, 2.5);
      vorm(c, cirkel(42 + j * 80, y + 14, 4), SAUS, 1.5);
    }
  }
}

/** Een bol deeg. */
function deeg(c: C, m: number) {
  vorm(c, `M ${8 * m} ${104 * m} Q ${4 * m} ${14 * m} ${85 * m} ${12 * m} Q ${166 * m} ${14 * m} ${162 * m} ${104 * m} Z`, "#f6e3c4");
  vorm(c, `M ${40 * m} ${44 * m} Q ${60 * m} ${26 * m} ${88 * m} ${26 * m}`, undefined, 3, PALET.warmwit);
}

/** Een blok kaas. */
function kaas(c: C, m: number) {
  vorm(c, `M ${10 * m} ${40 * m} L ${40 * m} ${12 * m} L ${180 * m} ${12 * m} L ${170 * m} ${40 * m} Z`, KAAS);
  vorm(c, `M ${170 * m} ${40 * m} L ${180 * m} ${12 * m} L ${180 * m} ${84 * m} L ${170 * m} ${112 * m} Z`, "#e8a92a");
  vorm(c, blok(10 * m, 40 * m, 160 * m, 72 * m, 4), PALET.geel);
  for (const [x, y, r] of [[40, 70, 9], [90, 88, 7], [130, 62, 10], [70, 54, 5]]) vorm(c, cirkel(x * m, y * m, r * m), "#e8a92a", 2);
}

function tomaat(c: C, x: number, y: number, r: number) {
  vorm(c, cirkel(x, y, r), ROOD);
  vorm(c, `M ${x - r * 0.45} ${y - r * 0.8} L ${x} ${y - r * 0.55} L ${x + r * 0.45} ${y - r * 0.8} M ${x} ${y - r * 0.55} V ${y - r * 1.05}`, undefined, 3, GROEN_DONKER);
}

function olijf(c: C) {
  vorm(c, ovaal(22, 19, 18, 14), "#6b8e3a");
  vorm(c, ovaal(27, 16, 5, 4), "#3d5a1f", 0, null);
}

/** Een zak meel (ontwerpvak 140 × 170, met `k` kleiner). */
function meel(c: C, x = 0, y = 0, k = 1) {
  c.save();
  c.translate(x, y);
  c.scale(k, k);
  vorm(c, "M 30 34 Q 18 100 22 150 Q 70 168 118 150 Q 122 100 110 34 Z", PALET.warmwit);
  vorm(c, "M 38 34 Q 70 14 102 34", undefined, RAND_DUN);
  vorm(c, "M 56 22 L 70 34 L 84 22", undefined, RAND_DUN);
  vorm(c, "M 70 136 V 72", undefined, 3, PALET.petrol);
  for (let i = 0; i < 3; i++) {
    vorm(c, ovaal(62, 84 + i * 16, 7, 4), PALET.geel, 2);
    vorm(c, ovaal(78, 84 + i * 16, 7, 4), PALET.geel, 2);
  }
  c.restore();
}

function meelberg(c: C) {
  const rijen = [5, 4, 3, 2];
  rijen.forEach((n, r) => {
    for (let i = 0; i < n; i++) meel(c, 8 + r * 42 + i * 84, 196 - r * 64, 0.62);
  });
}

/* =====================================================================
   MENSEN
   ===================================================================== */

type Mens = { huid: string; haar: string; soort: "kort" | "lang" | "knot" | "krul" | "kaal"; shirt: string; broek: string; muts?: boolean; buik?: boolean; armen?: "neer" | "buik" | "voor" };

/** Een mens, onderaan midden op (x, y), `s` = schaal (volwassene 1 = 280 hoog). */
function mens(c: C, x: number, y: number, s: number, m: Mens) {
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  /* benen */
  vorm(c, blok(-34, -96, 28, 96, 12), m.broek);
  vorm(c, blok(6, -96, 28, 96, 12), m.broek);
  vorm(c, ovaal(-22, -4, 20, 9), N, 0, null);
  vorm(c, ovaal(22, -4, 20, 9), N, 0, null);
  /* lijf */
  const bb = m.buik ? 96 : 84;
  vorm(c, blok(-bb / 2, -196, bb, 110, 30), m.shirt);
  if (m.buik) vorm(c, ovaal(0, -120, 40, 30), m.shirt);
  /* armen */
  if (m.armen === "buik") {
    vorm(c, `M ${-bb / 2 + 6} -176 Q ${-bb / 2 - 20} -130 -14 -118`, undefined, 20, N);
    vorm(c, `M ${-bb / 2 + 6} -176 Q ${-bb / 2 - 20} -130 -14 -118`, undefined, 13, m.shirt);
    vorm(c, `M ${bb / 2 - 6} -176 Q ${bb / 2 + 20} -130 14 -118`, undefined, 20, N);
    vorm(c, `M ${bb / 2 - 6} -176 Q ${bb / 2 + 20} -130 14 -118`, undefined, 13, m.shirt);
    vorm(c, cirkel(-12, -118, 11), m.huid);
    vorm(c, cirkel(12, -118, 11), m.huid);
  } else if (m.armen === "voor") {
    for (const k of [-1, 1]) {
      vorm(c, `M ${k * (bb / 2 - 6)} -176 Q ${k * (bb / 2 + 8)} -120 ${k * 22} -96`, undefined, 20, N);
      vorm(c, `M ${k * (bb / 2 - 6)} -176 Q ${k * (bb / 2 + 8)} -120 ${k * 22} -96`, undefined, 13, m.shirt);
      vorm(c, cirkel(k * 22, -94, 11), m.huid);
    }
  } else {
    for (const k of [-1, 1]) {
      vorm(c, `M ${k * (bb / 2 - 4)} -180 L ${k * (bb / 2 + 10)} -106`, undefined, 20, N);
      vorm(c, `M ${k * (bb / 2 - 4)} -180 L ${k * (bb / 2 + 10)} -106`, undefined, 13, m.shirt);
      vorm(c, cirkel(k * (bb / 2 + 10), -100, 11), m.huid);
    }
  }
  hoofd(c, 0, -236, m);
  c.restore();
}

/** Een hoofd met het midden op (x, y), straal 40. */
function hoofd(c: C, x: number, y: number, m: Pick<Mens, "huid" | "haar" | "soort" | "muts">) {
  if (m.soort === "lang") vorm(c, `M ${x - 44} ${y + 46} Q ${x - 52} ${y - 40} ${x} ${y - 46} Q ${x + 52} ${y - 40} ${x + 44} ${y + 46} Z`, m.haar);
  vorm(c, cirkel(x, y, 40), m.huid);
  if (m.soort === "kort" || m.soort === "lang") vorm(c, `M ${x - 41} ${y - 4} Q ${x - 40} ${y - 46} ${x} ${y - 44} Q ${x + 40} ${y - 46} ${x + 41} ${y - 4} Q ${x + 18} ${y - 26} ${x - 41} ${y - 4} Z`, m.haar);
  if (m.soort === "knot") {
    vorm(c, cirkel(x, y - 50, 16), m.haar);
    vorm(c, `M ${x - 41} ${y - 2} Q ${x - 40} ${y - 46} ${x} ${y - 44} Q ${x + 40} ${y - 46} ${x + 41} ${y - 2} Q ${x} ${y - 30} ${x - 41} ${y - 2} Z`, m.haar);
  }
  if (m.soort === "krul") for (let i = 0; i < 7; i++) vorm(c, cirkel(x - 36 + i * 12, y - 34 - Math.sin((i / 6) * Math.PI) * 10, 11), m.haar, 2.5);
  if (m.muts) {
    vorm(c, `M ${x - 34} ${y - 26} L ${x - 34} ${y - 48} Q ${x - 52} ${y - 70} ${x - 26} ${y - 82} Q ${x} ${y - 104} ${x + 26} ${y - 82} Q ${x + 52} ${y - 70} ${x + 34} ${y - 48} L ${x + 34} ${y - 26} Z`, PALET.warmwit);
    vorm(c, `M ${x - 34} ${y - 40} H ${x + 34}`, undefined, 2.5);
  }
  vorm(c, cirkel(x - 14, y + 2, 4.5), N, 0, null);
  vorm(c, cirkel(x + 14, y + 2, 4.5), N, 0, null);
  vorm(c, `M ${x - 14} ${y + 18} Q ${x} ${y + 30} ${x + 14} ${y + 18}`, undefined, 3);
  vorm(c, cirkel(x - 26, y + 14, 6), "rgba(242,113,94,0.35)", 0, null);
  vorm(c, cirkel(x + 26, y + 14, 6), "rgba(242,113,94,0.35)", 0, null);
}

const MENSEN: Record<string, Mens> = {
  sem: { huid: HUID[1], haar: "#3b2a20", soort: "krul", shirt: PALET.petrol, broek: N },
  mila: { huid: HUID[0], haar: "#c9792b", soort: "lang", shirt: PALET.koraal, broek: "#3d5a9a" },
  joep: { huid: HUID[0], haar: "#c9792b", soort: "kort", shirt: PALET.geel, broek: N },
  rosa: { huid: HUID[2], haar: "#2b1d16", soort: "knot", shirt: PALET.warmwit, broek: N, muts: true },
  jip: { huid: HUID[3], haar: "#6b4a2b", soort: "kort", shirt: PAARS, broek: "#3d5a9a" },
  oma: { huid: HUID[0], haar: "#d9dde6", soort: "knot", shirt: PALET.petrolLicht, broek: PALET.petrol },
  mama: { huid: HUID[3], haar: "#6b4a2b", soort: "lang", shirt: PALET.koraal, broek: N },
  kim: { huid: HUID[2], haar: "#2b1d16", soort: "krul", shirt: GROEN, broek: N },
  daan: { huid: HUID[0], haar: "#e8c15a", soort: "kort", shirt: BLAUW, broek: N },
  noor: { huid: HUID[1], haar: "#3b2a20", soort: "lang", shirt: ROZE, broek: N },
};

/** Volwassene of kind (alleen de schaal verschilt). */
const GROOT_MENS = new Set(["rosa", "oma", "mama", "joep"]);
const mensSchaal = (wie: string) => (wie === "joep" ? 0.86 : GROOT_MENS.has(wie) ? 1 : 0.72);

function mier(c: C) {
  vorm(c, "M 14 40 L 6 54 M 30 40 L 30 56 M 46 40 L 54 54 M 20 30 L 8 22 M 40 30 L 52 22", undefined, 2.5);
  vorm(c, ovaal(16, 34, 11, 9), "#5b3a2a", 2.5);
  vorm(c, ovaal(32, 34, 7, 6), "#5b3a2a", 2.5);
  vorm(c, cirkel(46, 30, 9), "#5b3a2a", 2.5);
  vorm(c, "M 50 22 Q 54 10 60 8 M 46 22 Q 46 10 50 6", undefined, 2);
}

/* =====================================================================
   PICKNICK EN HOEVEELHEDEN
   ===================================================================== */

function appel(c: C, x: number, y: number, r: number, kleur = ROOD) {
  vorm(c, cirkel(x, y, r), kleur);
  vorm(c, `M ${x} ${y - r} Q ${x + 2} ${y - r - 10} ${x + 6} ${y - r - 12}`, undefined, 3);
  vorm(c, `M ${x + 4} ${y - r - 6} Q ${x + 16} ${y - r - 14} ${x + 20} ${y - r - 4} Q ${x + 10} ${y - r} ${x + 4} ${y - r - 6} Z`, GROEN, 2);
}

/** Een picknickmand: `vul` 0 = leeg, 1 = een beetje, 2 = helemaal vol. */
function mand(c: C, o: O) {
  const vul = getal(o, "vul", 0);
  vorm(c, "M 40 70 Q 110 -6 180 70", undefined, 12, N);
  vorm(c, "M 40 70 Q 110 -6 180 70", undefined, 6, HOUT);
  vorm(c, ovaal(110, 74, 92, 20), "#7a4e2b");
  if (vul === 1) {
    appel(c, 84, 70, 16);
    appel(c, 126, 72, 15, GROEN);
  }
  if (vul === 2) {
    vorm(c, blok(52, 24, 42, 50, 10), PALET.warmwit);
    appel(c, 110, 52, 20);
    appel(c, 146, 58, 18, GROEN);
    appel(c, 78, 62, 16, PALET.geel);
    vorm(c, blok(122, 20, 18, 42, 6), PALET.petrolLicht, 2.5);
    appel(c, 168, 66, 13);
    appel(c, 54, 70, 13, ROOD);
  }
  vorm(c, "M 18 74 L 38 164 H 182 L 202 74 Z", HOUT);
  for (let i = 0; i < 3; i++) vorm(c, `M ${26 + i * 2} ${100 + i * 24} H ${194 - i * 2}`, undefined, 2.5);
  for (let i = 1; i < 6; i++) vorm(c, `M ${18 + i * 31} 76 L ${38 + i * 24} 162`, undefined, 2.5);
  vorm(c, blok(12, 66, 196, 18, 9), HOUT_LICHT);
}

/** Een stokje met `n` stukjes fruit (staand). */
function stokje(c: C, o: O) {
  const n = getal(o, "n", 0);
  vorm(c, "M 45 16 V 226", undefined, 8, N);
  vorm(c, "M 45 16 V 226", undefined, 4, HOUT_LICHT);
  const fruit = [
    (y: number) => vorm(c, `M 45 ${y + 20} Q 20 ${y} 30 ${y - 16} Q 45 ${y - 24} 60 ${y - 16} Q 70 ${y} 45 ${y + 20} Z`, ROOD),
    (y: number) => vorm(c, cirkel(45, y, 16), PAARS),
    (y: number) => vorm(c, blok(27, y - 16, 36, 32, 8), PALET.geel),
    (y: number) => vorm(c, cirkel(45, y, 16), GROEN),
  ];
  for (let i = 0; i < n; i++) fruit[i % fruit.length](198 - i * 32);
}

/** Een boterham met `n` plakjes kaas (`n` = 1: één klein plakje). */
function broodje(c: C, o: O) {
  const n = getal(o, "n", 1);
  vorm(c, "M 20 160 V 66 Q 20 22 60 26 Q 90 4 120 26 Q 160 22 160 66 V 160 Z", "#e9b877");
  vorm(c, "M 34 150 V 70 Q 34 38 62 40 Q 90 20 118 40 Q 146 38 146 70 V 150 Z", "#f8e2b8", 0, null);
  if (n === 1) vorm(c, blok(70, 84, 40, 34, 4), PALET.geel, 2.5);
  else {
    const plekken = [
      [42, 60],
      [92, 60],
      [42, 104],
      [92, 104],
      [66, 80],
      [56, 40],
      [70, 116],
    ];
    for (let i = 0; i < n && i < plekken.length; i++) vorm(c, blok(plekken[i][0], plekken[i][1], 48, 40, 4), i % 2 ? KAAS : PALET.geel, 2.5);
  }
}

const INHOUD: Record<string, string> = { water: "#9fd8ff", melk: PALET.warmwit, sap: ORANJE, groente: "#7cc26b", jam: PALET.koraal };

/** Een beker of glas met `v` (0–1) gevuld. */
function beker(c: C, o: O) {
  const v = getal(o, "v", 0.5);
  const kleur = INHOUD[o.in ?? "water"] ?? INHOUD.water;
  const top = 14;
  const bodem = 166;
  const y = bodem - (bodem - top - 8) * v;
  const xL = (yy: number) => 14 + ((yy - top) / (bodem - top)) * 14;
  if (o.rietje) vorm(c, "M 82 150 L 100 2 L 112 4", undefined, 7, PALET.koraal);
  if (v > 0) {
    vorm(c, `M ${xL(y)} ${y} L ${120 - xL(y)} ${y} L ${120 - xL(bodem)} ${bodem} L ${xL(bodem)} ${bodem} Z`, kleur, 0, null);
    if (o.in === "groente") for (let i = 0; i < 4; i++) vorm(c, blok(28 + i * 16, y - 26, 10, 40, 4), i % 2 ? GROEN : "#f29a3c", 2);
  }
  vorm(c, `M 14 ${top} L 120 ${top} L 106 ${bodem} Q 67 ${bodem + 6} 28 ${bodem} Z`, "rgba(255,255,255,0.18)");
  if (v > 0) vorm(c, `M ${xL(y)} ${y} L ${120 - xL(y)} ${y}`, undefined, 2.5);
}

/** Een potje (jam) met `v` gevuld. */
function potje(c: C, o: O) {
  const v = getal(o, "v", 0.5);
  const top = 40;
  const bodem = 168;
  const y = bodem - (bodem - top - 6) * v;
  vorm(c, blok(16, top, 108, bodem - top, 18), "rgba(255,255,255,0.25)");
  if (v > 0) {
    c.save();
    const p = new Path2D(blok(16, top, 108, bodem - top, 18));
    c.clip(p);
    vorm(c, `M 10 ${y} H 130 V 180 H 10 Z`, INHOUD.jam, 0, null);
    c.restore();
    vorm(c, `M 18 ${y} H 122`, undefined, 2.5);
  }
  vorm(c, blok(16, top, 108, bodem - top, 18), undefined);
  vorm(c, blok(22, 14, 96, 30, 8), PALET.geel);
}

/** Een flesje met `v` gevuld. */
function flesje(c: C, o: O) {
  const v = getal(o, "v", 0.5);
  const omtrek = "M 34 6 H 62 V 40 Q 86 54 86 80 V 196 Q 86 206 76 206 H 20 Q 10 206 10 196 V 80 Q 10 54 34 40 Z";
  vorm(c, omtrek, "rgba(255,255,255,0.25)");
  const top = 64;
  const bodem = 204;
  const y = bodem - (bodem - top) * v;
  c.save();
  c.clip(new Path2D(omtrek));
  vorm(c, `M 0 ${y} H 100 V 220 H 0 Z`, INHOUD.water, 0, null);
  c.restore();
  vorm(c, `M 12 ${y} H 84`, undefined, 2.5);
  vorm(c, omtrek, undefined);
  vorm(c, blok(30, 0, 36, 16, 5), PALET.petrol);
}

/** Een schaal met tomaten: `n` tomaten; `berg` = er ligt een hoge berg op. */
function schaal(c: C, o: O) {
  const n = getal(o, "n", 4);
  const r = 17;
  const rijen: number[] = n <= 4 ? [n] : n <= 7 ? [4, n - 4] : [5, 4, n - 9 > 0 ? n - 9 : 0].filter((x) => x > 0);
  const basis = 92;
  rijen.forEach((aantal, j) => {
    const breed = aantal * r * 2;
    for (let i = 0; i < aantal; i++) tomaat(c, 110 - breed / 2 + r + i * r * 2, basis - j * 28, r);
  });
  vorm(c, "M 14 92 Q 18 156 110 158 Q 202 156 206 92 Z", PALET.petrolLicht);
  vorm(c, "M 14 92 H 206", undefined, RAND_DUN);
}

/** Een maatbeker van 1 liter of een halve liter (even breed; de halve is half zo hoog). */
function maatbekerMaat(o: O) {
  return { b: 170, h: o.l === "half" ? 150 : 270 };
}
function maatbeker(c: C, o: O) {
  const v = getal(o, "v", 1);
  const { h } = maatbekerMaat(o);
  const bodem = h - 6;
  const binnen = o.l === "half" ? 120 : 240;
  const top = bodem - binnen;
  const y = bodem - binnen * v;
  vorm(c, `M 130 ${top + 30} Q 168 ${top + 34} 160 ${top + 70} Q 154 ${top + 96} 130 ${top + 92}`, undefined, 9, N);
  if (v > 0) {
    vorm(c, `M 20 ${y} H 130 V ${bodem} H 20 Z`, INHOUD.water, 0, null);
    for (const [x, dy, k] of [[44, 18, ROOD], [80, 40, ORANJE], [104, 14, GROEN], [62, 56, PALET.geel]] as [number, number, string][]) {
      if (y + dy < bodem - 8) vorm(c, cirkel(x, y + dy, 7), k, 2);
    }
    vorm(c, `M 20 ${y} H 130`, undefined, 2.5);
  }
  vorm(c, `M 20 ${top - 4} V ${bodem} H 130 V ${top - 4}`, undefined, RAND_DUN);
  vorm(c, `M 20 ${top - 4} L 8 ${top - 14}`, undefined, RAND_DUN);
  /* streepjes en het etiket */
  for (let i = 1; i < 4; i++) vorm(c, `M 112 ${bodem - (binnen * i) / 4} H 128`, undefined, 2.5);
  vorm(c, blok(30, top + 6, 74, 34, 8), PALET.warmwit, 2.5);
  tekst(c, o.l === "half" ? "½ liter" : "1 liter", 67, top + 24, 19);
}

/* --- licht en zwaar --- */

function ballon(c: C) {
  vorm(c, "M 55 112 Q 48 132 58 146 Q 66 158 54 170", undefined, 3);
  vorm(c, "M 55 112 C 12 98 10 20 55 14 C 100 20 98 98 55 112 Z", PAARS);
  vorm(c, "M 48 112 L 62 112 L 55 120 Z", PAARS, 3);
  vorm(c, "M 34 40 Q 38 30 48 28", undefined, 4, PALET.warmwit);
}
function steen(c: C) {
  vorm(c, "M 10 88 Q 4 50 30 30 Q 60 8 96 24 Q 126 40 122 76 Q 118 96 70 96 Q 24 98 10 88 Z", GRIJS);
  vorm(c, "M 40 50 Q 50 44 60 48 M 80 66 Q 90 62 98 68", undefined, 2.5);
}
function voetbal(c: C) {
  vorm(c, cirkel(55, 55, 48), PALET.warmwit);
  vorm(c, "M 55 38 L 71 50 L 65 69 L 45 69 L 39 50 Z", N, 2);
  for (const [x1, y1, x2, y2] of [[55, 38, 55, 10], [71, 50, 98, 42], [65, 69, 82, 92], [45, 69, 28, 92], [39, 50, 12, 42]]) vorm(c, `M ${x1} ${y1} L ${x2} ${y2}`, undefined, 2.5);
}
function veer(c: C) {
  vorm(c, "M 40 150 Q 30 80 52 12 Q 82 60 60 120 Q 52 140 40 150 Z", PALET.petrolLicht);
  vorm(c, "M 40 150 Q 46 80 52 12", undefined, 2.5);
  for (let i = 0; i < 5; i++) vorm(c, `M ${46 + i * 1.2} ${120 - i * 20} L ${62 - i * 0} ${108 - i * 20}`, undefined, 2);
}
function watermeloen(c: C) {
  vorm(c, ovaal(90, 62, 82, 56), GROEN);
  for (let i = -2; i <= 2; i++) vorm(c, `M ${90 + i * 26} 10 Q ${90 + i * 34} 62 ${90 + i * 26} 114`, undefined, 4, GROEN_DONKER);
  vorm(c, ovaal(90, 62, 82, 56), undefined);
}

/** Een rugtas (`vol` = dik en zwaar). */
function rugtas(c: C, x: number, y: number, k = 1) {
  c.save();
  c.translate(x, y);
  c.scale(k, k);
  vorm(c, "M 30 20 Q 30 -10 60 -10 Q 90 -10 90 20", undefined, 9, N);
  vorm(c, blok(10, 14, 100, 130, 26), PAARS);
  vorm(c, blok(26, 70, 68, 52, 14), "#8c69d6");
  vorm(c, "M 26 86 H 94", undefined, 2.5);
  c.restore();
}

/* =====================================================================
   OPPERVLAKTE
   ===================================================================== */

/** Een onderwerp op een schilderij, in een vak van 100 × 100. */
function onderwerp(c: C, wat: string) {
  if (wat === "zon") {
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      vorm(c, `M ${50 + Math.cos(a) * 30} ${50 + Math.sin(a) * 30} L ${50 + Math.cos(a) * 44} ${50 + Math.sin(a) * 44}`, undefined, 5, PALET.geel);
    }
    vorm(c, cirkel(50, 50, 22), PALET.geel);
  } else if (wat === "bloem") {
    vorm(c, "M 50 54 V 96", undefined, 5, GROEN_DONKER);
    vorm(c, "M 50 80 Q 66 66 76 74 Q 66 86 50 82", GROEN, 2.5);
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      vorm(c, cirkel(50 + Math.cos(a) * 16, 38 + Math.sin(a) * 16, 12), PALET.koraal, 2.5);
    }
    vorm(c, cirkel(50, 38, 10), PALET.geel, 2.5);
  } else if (wat === "huis") {
    vorm(c, blok(22, 46, 56, 48, 4), PALET.warmwit);
    vorm(c, "M 14 50 L 50 14 L 86 50 Z", PALET.koraal);
    vorm(c, blok(42, 66, 16, 28, 3), HOUT);
    vorm(c, blok(28, 56, 12, 12, 2), LUCHT, 2.5);
  } else if (wat === "boot") {
    vorm(c, "M 50 16 V 68", undefined, 4);
    vorm(c, "M 54 20 L 82 62 H 54 Z", PALET.warmwit);
    vorm(c, "M 12 70 H 88 L 76 88 H 24 Z", PALET.koraal);
    vorm(c, "M 6 94 Q 20 88 34 94 Q 48 100 62 94 Q 76 88 94 94", undefined, 3, BLAUW);
  } else if (wat === "boom") {
    vorm(c, blok(42, 56, 16, 40, 4), HOUT);
    vorm(c, cirkel(50, 38, 30), GROEN);
  } else if (wat === "vis") {
    vorm(c, "M 78 50 L 96 32 V 68 Z", PALET.petrol);
    vorm(c, ovaal(46, 50, 36, 24), PALET.petrolLicht);
    vorm(c, cirkel(28, 46, 4), N, 0, null);
    vorm(c, "M 52 30 Q 60 50 52 70", undefined, 2.5);
  }
}

type Schilderij = { wat: string; k: number; r: number; b: number; h: number };
/** De tegelmuren met drie schilderijen (14 × 8 tegels van 36). */
export const MUREN: Record<string, Schilderij[]> = {
  "1": [
    { wat: "zon", k: 1, r: 2, b: 3, h: 3 },
    { wat: "bloem", k: 5, r: 2, b: 4, h: 4 },
    { wat: "huis", k: 10, r: 1, b: 4, h: 5 },
  ],
  "2": [
    { wat: "boot", k: 1, r: 3, b: 3, h: 2 },
    { wat: "boom", k: 5, r: 1, b: 2, h: 6 },
    { wat: "vis", k: 8, r: 2, b: 5, h: 4 },
  ],
};
const TG = 36;
function muur(c: C, o: O) {
  const lijst = MUREN[o.v ?? "1"] ?? [];
  vorm(c, blok(2, 2, 14 * TG + 12, 8 * TG + 12, 10), "#ffe7a3");
  c.save();
  c.strokeStyle = "#e2c27a";
  c.lineWidth = 2;
  for (let i = 1; i < 14; i++) {
    c.beginPath();
    c.moveTo(8 + i * TG, 8);
    c.lineTo(8 + i * TG, 8 + 8 * TG);
    c.stroke();
  }
  for (let j = 1; j < 8; j++) {
    c.beginPath();
    c.moveTo(8, 8 + j * TG);
    c.lineTo(8 + 14 * TG, 8 + j * TG);
    c.stroke();
  }
  c.restore();
  for (const s of lijst) {
    const x = 8 + s.k * TG;
    const y = 8 + s.r * TG;
    const b = s.b * TG;
    const h = s.h * TG;
    vorm(c, `M ${x} ${y} h ${b} v ${h} h ${-b} Z`, HOUT, RAND_DUN);
    vorm(c, `M ${x + 9} ${y + 9} h ${b - 18} v ${h - 18} h ${-(b - 18)} Z`, PALET.warmwit, 2.5);
    const kk = Math.min((b - 22) / 100, (h - 22) / 100);
    c.save();
    c.translate(x + b / 2 - 50 * kk, y + h / 2 - 50 * kk);
    c.scale(kk, kk);
    onderwerp(c, s.wat);
    c.restore();
    if (o.zien) {
      /* De tegels achter het schilderij: gestippeld erdoorheen. */
      c.save();
      c.setLineDash([6, 5]);
      c.strokeStyle = N;
      c.lineWidth = 2.5;
      for (let i = 1; i < s.b; i++) {
        c.beginPath();
        c.moveTo(x + i * TG, y);
        c.lineTo(x + i * TG, y + h);
        c.stroke();
      }
      for (let j = 1; j < s.h; j++) {
        c.beginPath();
        c.moveTo(x, y + j * TG);
        c.lineTo(x + b, y + j * TG);
        c.stroke();
      }
      c.restore();
    }
  }
}

/** Een tafel van bovenaf (`k` × `r` plekken) met `n` borden. */
function tafelBorden(c: C, o: O) {
  const k = getal(o, "k", 2);
  const r = getal(o, "r", 1);
  const n = getal(o, "n", k * r);
  vorm(c, blok(3, 3, k * 50 + 18, r * 50 + 18, 10), HOUT);
  for (let i = 0; i < n; i++) {
    const x = 12 + (i % k) * 50 + 25;
    const y = 12 + Math.floor(i / k) * 50 + 25;
    vorm(c, cirkel(x, y, 19), PALET.warmwit, 2.5);
    vorm(c, cirkel(x, y, 11), undefined, 2, PALET.petrolLicht);
  }
}

/** Een muurtje van `n` stenen breed en 3 hoog. */
function muurtje(c: C, o: O) {
  const n = getal(o, "n", 3);
  for (let j = 0; j < 3; j++) for (let i = 0; i < n; i++) vorm(c, blok(4 + i * 44, 4 + j * 30, 44, 30, 4), j % 2 ? "#d9694f" : "#e07a5f", 2.5);
}

/** Twee kaartjes papier: allebei 4 × 6; `draai` = het tweede ligt op zijn kant. */
function vellen(c: C, o: O) {
  vorm(c, blok(40, 30, 140, 210, 10), "#ffb36b");
  const draai = o.draai === "1";
  if (draai) vorm(c, blok(240, 65, 210, 140, 10), "#ffb36b");
  else vorm(c, blok(275, 30, 140, 210, 10), "#ffb36b");
  vorm(c, cirkel(40, 30, 20), PALET.warmwit);
  tekst(c, "1", 40, 31, 24);
  const x2 = draai ? 240 : 275;
  const y2 = draai ? 65 : 30;
  vorm(c, cirkel(x2, y2, 20), PALET.warmwit);
  tekst(c, "2", x2, y2 + 1, 24);
}

/** Ruitjespapier met twee vormen: a = blauw, b = geel ("2x4" = 2 hoog, 4 breed). */
const RH = 32;
function rx(s: string | undefined, std: [number, number]): [number, number] {
  const m = /^(\d+)x(\d+)$/.exec(s ?? "");
  return m ? [Number(m[1]), Number(m[2])] : std;
}
function ruitjesPunten(o: O): Punt[] {
  const [ah, ab] = rx(o.a, [2, 4]);
  const [bh, bb] = rx(o.b, [1, 8]);
  const pts: Punt[] = [];
  for (let j = 0; j < ah; j++) for (let i = 0; i < ab; i++) pts.push({ x: 8 + (1 + i) * RH + RH / 2, y: 8 + (1 + j) * RH + RH / 2 });
  for (let j = 0; j < bh; j++) for (let i = 0; i < bb; i++) pts.push({ x: 8 + (1 + i) * RH + RH / 2, y: 8 + (ah + 2 + j) * RH + RH / 2 });
  return pts;
}
function ruitjesMaat(o: O) {
  const [ah, ab] = rx(o.a, [2, 4]);
  const [bh, bb] = rx(o.b, [1, 8]);
  return { b: (Math.max(ab, bb) + 2) * RH + 16, h: (ah + bh + 3) * RH + 16 };
}
function ruitjes(c: C, o: O) {
  const [ah, ab] = rx(o.a, [2, 4]);
  const [bh, bb] = rx(o.b, [1, 8]);
  const { b, h } = ruitjesMaat(o);
  vorm(c, blok(2, 2, b - 4, h - 4, 8), PALET.warmwit);
  c.save();
  c.strokeStyle = "#a9cbe8";
  c.lineWidth = 1.5;
  for (let x = 8 + RH; x < b - 8; x += RH) {
    c.beginPath();
    c.moveTo(x, 8);
    c.lineTo(x, h - 8);
    c.stroke();
  }
  for (let y = 8 + RH; y < h - 8; y += RH) {
    c.beginPath();
    c.moveTo(8, y);
    c.lineTo(b - 8, y);
    c.stroke();
  }
  c.restore();
  const vak = (k: number, r: number, bb2: number, hh: number, kleur: string) => {
    vorm(c, `M ${8 + k * RH} ${8 + r * RH} h ${bb2 * RH} v ${hh * RH} h ${-bb2 * RH} Z`, kleur, RAND_DUN);
    c.save();
    c.strokeStyle = "rgba(29,43,94,0.55)";
    c.lineWidth = 2;
    for (let i = 1; i < bb2; i++) {
      c.beginPath();
      c.moveTo(8 + (k + i) * RH, 8 + r * RH);
      c.lineTo(8 + (k + i) * RH, 8 + (r + hh) * RH);
      c.stroke();
    }
    for (let j = 1; j < hh; j++) {
      c.beginPath();
      c.moveTo(8 + k * RH, 8 + (r + j) * RH);
      c.lineTo(8 + (k + bb2) * RH, 8 + (r + j) * RH);
      c.stroke();
    }
    c.restore();
  };
  vak(1, 1, ab, ah, BLAUW);
  vak(1, ah + 2, bb, bh, PALET.geel);
}

/** Twee speelmatten van puzzelstukken, mat 1 boven, mat 2 onder ("2x3" = 2 rijen van 3). */
const PS = 48;
function mattenMaat(o: O) {
  const [ah, ab] = rx(o.a, [2, 2]);
  const [bh, bb] = rx(o.b, [1, 4]);
  return { b: Math.max(ab, bb) * PS + 80, h: (ah + bh) * PS + 50 };
}
function mattenPunten(o: O): Punt[] {
  const [ah, ab] = rx(o.a, [2, 2]);
  const [bh, bb] = rx(o.b, [1, 4]);
  const pts: Punt[] = [];
  for (let j = 0; j < ah; j++) for (let i = 0; i < ab; i++) pts.push({ x: 70 + i * PS + PS / 2, y: 6 + j * PS + PS / 2 });
  for (let j = 0; j < bh; j++) for (let i = 0; i < bb; i++) pts.push({ x: 70 + i * PS + PS / 2, y: 6 + ah * PS + 40 + j * PS + PS / 2 });
  return pts;
}
function matten(c: C, o: O) {
  const [ah, ab] = rx(o.a, [2, 2]);
  const [bh, bb] = rx(o.b, [1, 4]);
  const kleuren = [PALET.koraal, PALET.geel, PALET.petrolLicht, GROEN];
  const mat = (y0: number, h: number, b: number, nr: string, start: number) => {
    for (let j = 0; j < h; j++)
      for (let i = 0; i < b; i++) {
        const x = 70 + i * PS;
        const y = y0 + j * PS;
        vorm(c, blok(x, y, PS, PS, 4), kleuren[(i + j + start) % kleuren.length], 2.5);
        vorm(c, cirkel(x + PS / 2, y + PS / 2, 6), "rgba(255,255,255,0.6)", 2);
      }
    vorm(c, cirkel(30, y0 + (h * PS) / 2, 22), PALET.warmwit);
    tekst(c, nr, 30, y0 + (h * PS) / 2 + 1, 26);
  };
  mat(6, ah, ab, "1", 0);
  mat(6 + ah * PS + 40, bh, bb, "2", 1);
}

/** Een blaadje papier (vierkant of rechthoek) met een omgevouwen hoekje. */
function blaadje(c: C, x: number, y: number, b: number, h: number, kleur: string, tegel: boolean) {
  if (tegel) {
    vorm(c, blok(x + 2, y + 2, b - 4, h - 4, 4), kleur, 2.5);
    return;
  }
  vorm(c, `M ${x + 3} ${y + 3} H ${x + b - 3} V ${y + h - 14} L ${x + b - 14} ${y + h - 3} H ${x + 3} Z`, kleur, 2.5);
  vorm(c, `M ${x + b - 3} ${y + h - 14} H ${x + b - 14} V ${y + h - 3} Z`, "rgba(255,255,255,0.65)", 2);
}

/** Een tafel (of muur) van bovenaf, bedekt met blaadjes (of tegels). */
const BC = 44;
type Tafel = { k: number; r: number; cw: number; ch: number };
function tafelMaat(t: Tafel) {
  return { b: t.k * t.cw + 28, h: t.r * t.ch + 28 };
}
function tafelPunten(t: Tafel, x0 = 0): Punt[] {
  const pts: Punt[] = [];
  for (let j = 0; j < t.r; j++) for (let i = 0; i < t.k; i++) pts.push({ x: x0 + 14 + i * t.cw + t.cw / 2, y: 14 + j * t.ch + t.ch / 2 });
  return pts;
}
function tafelTekenen(c: C, t: Tafel, kleur: string, tegel: boolean, x0 = 0) {
  const { b, h } = tafelMaat(t);
  vorm(c, blok(x0 + 3, 3, b - 6, h - 6, tegel ? 4 : 12), tegel ? GRIJS : HOUT);
  for (let j = 0; j < t.r; j++) for (let i = 0; i < t.k; i++) blaadje(c, x0 + 14 + i * t.cw, 14 + j * t.ch, t.cw, t.ch, kleur, tegel);
}
const enkeleTafel = (o: O): Tafel => ({ k: getal(o, "k", 4), r: getal(o, "r", 3), cw: BC, ch: BC });

/** Twee keer dezelfde tafel: links kleine blaadjes (k × r), rechts blaadjes die twee keer zo groot zijn. */
function tweeTafels(o: O): [Tafel, Tafel] {
  const k = getal(o, "k", 6);
  const r = getal(o, "r", 2);
  const a: Tafel = { k, r, cw: BC, ch: BC };
  const b: Tafel = o.d === "b" ? { k: k / 2, r, cw: BC * 2, ch: BC } : { k, r: r / 2, cw: BC, ch: BC * 2 };
  return [a, b];
}
const TUSSEN = 70;
function tweeMaat(o: O) {
  const [a] = tweeTafels(o);
  const m = tafelMaat(a);
  return { b: m.b * 2 + TUSSEN, h: m.h };
}

/* =====================================================================
   WEEGSCHAAL EN WIP
   ===================================================================== */

/** Hoe groot een voorwerp op de weegschaal mag (gedeelde schaal voor beide kanten). */
export function schaalVoorwerpen(links: string, rechts: string, maxB = 110, maxH = 96) {
  const fit = (s: string) => {
    const m = tekeningMaat(s);
    return Math.min(maxB / m.b, maxH / m.h);
  };
  return Math.min(fit(links), fit(rechts), 1.2);
}

/** Eén schaal met wat erop ligt; het ophangpunt is (70, 4); ontwerpvak 140 × 160. */
export function tekenSchaal(c: C, wat: string, k: number) {
  vorm(c, "M 70 4 L 12 124 M 70 4 L 128 124", undefined, 3);
  const m = tekeningMaat(wat);
  c.save();
  c.translate(70 - (m.b * k) / 2, 126 - m.h * k);
  c.scale(k, k);
  tekenTekening(c, wat);
  c.restore();
  vorm(c, "M 4 122 Q 70 160 136 122 Z", PALET.petrolLicht);
  vorm(c, cirkel(70, 4, 5), PALET.geel, 2.5);
}
/** De voet van de weegschaal: het draaipunt is (90, 20); ontwerpvak 180 × 220. */
export function tekenVoet(c: C) {
  vorm(c, "M 80 20 L 72 200 H 108 L 100 20 Z", PALET.petrol);
  vorm(c, blok(20, 196, 140, 20, 10), PALET.navy, 0, null);
  vorm(c, blok(24, 196, 132, 18, 9), PALET.petrol, 2.5);
}
/** De balk: ontwerpvak 300 × 24, het midden is het draaipunt. */
export function tekenBalk(c: C) {
  vorm(c, blok(4, 4, 292, 16, 8), PALET.geel);
  vorm(c, cirkel(150, 12, 9), PALET.warmwit, 2.5);
}
export const BALK_HALF = 130;

/** Een stilstaande weegschaal (voor op een kaartje): `kant` -1 = links zwaarder, 1 = rechts. */
function weeg(c: C, o: O) {
  const kant = getal(o, "kant", 0);
  const links = (o.l ?? "").replace(/~/g, "|").replace(/:/g, "=");
  const rechts = (o.r ?? "").replace(/~/g, "|").replace(/:/g, "=");
  const a = kant * 0.2;
  const cx = 190;
  const cy = 60;
  c.save();
  c.translate(cx - 90, cy - 20);
  tekenVoet(c);
  c.restore();
  const k = schaalVoorwerpen(links, rechts);
  const eind = (z: number) => ({ x: cx + z * BALK_HALF * Math.cos(a), y: cy + z * BALK_HALF * Math.sin(a) });
  for (const [z, wat] of [[-1, links], [1, rechts]] as [number, string][]) {
    const e = eind(z);
    c.save();
    c.translate(e.x - 70, e.y - 4);
    tekenSchaal(c, wat, k);
    c.restore();
  }
  c.save();
  c.translate(cx, cy);
  c.rotate(a);
  c.translate(-150, -12);
  tekenBalk(c);
  c.restore();
}

/** Een wip met twee kinderen; `kant` -1 = links omlaag, 0 = recht. */
function wip(c: C, o: O) {
  const kant = getal(o, "kant", 0);
  const a = kant * 0.22;
  const cx = 200;
  const cy = 150;
  vorm(c, `M ${cx - 34} 206 L ${cx} ${cy} L ${cx + 34} 206 Z`, PALET.koraal);
  c.save();
  c.translate(cx, cy);
  c.rotate(a);
  const kind = (x: number, m: Mens) => {
    vorm(c, blok(x - 26, -70, 52, 64, 20), m.shirt);
    hoofd(c, x, -104, m);
  };
  kind(-140, MENSEN.jip);
  kind(140, MENSEN.daan);
  vorm(c, blok(-180, -8, 360, 16, 8), PALET.geel);
  c.restore();
}

/* =====================================================================
   VERHAALSCHERMEN (ontwerpvak 640 × 380)
   ===================================================================== */

function achtergrond(c: C, binnen: boolean) {
  vorm(c, blok(4, 4, 632, 372, 26), binnen ? "#fdebd3" : LUCHT);
  if (binnen) vorm(c, "M 6 290 H 634 V 350 Q 634 374 610 374 H 30 Q 6 374 6 350 Z", "#f3d0a7", 0, null);
  else vorm(c, "M 6 290 H 634 V 350 Q 634 374 610 374 H 30 Q 6 374 6 350 Z", "#a6dc8e", 0, null);
  vorm(c, blok(4, 4, 632, 372, 26), undefined);
}
function tafel(c: C, x: number, b: number) {
  vorm(c, blok(x + 14, 270, 18, 80, 6), HOUT);
  vorm(c, blok(x + b - 32, 270, 18, 80, 6), HOUT);
  vorm(c, blok(x, 250, b, 26, 8), HOUT_LICHT);
}
function bord(c: C, x: number) {
  vorm(c, ovaal(x, 248, 52, 11), PALET.warmwit, 2.5);
}
function boom(c: C, x: number, y: number) {
  vorm(c, blok(x - 10, y - 70, 20, 74, 6), HOUT);
  vorm(c, cirkel(x, y - 100, 46), GROEN);
}

function verhaal(c: C, o: O) {
  const s = o.s ?? "";
  achtergrond(c, !["picknick2"].includes(s));
  if (s === "pizza1") {
    mens(c, 230, 300, 0.72 * 1.1, MENSEN.sem);
    tafel(c, 90, 460);
    bord(c, 230);
    c.save();
    c.translate(390, 210);
    vorm(c, blok(0, 0, 150, 40, 8), KARTON);
    vorm(c, "M 10 12 H 140", undefined, 2);
    vorm(c, cirkel(75, 26, 7), SAUS, 2);
    c.restore();
  } else if (s === "pizza2") {
    mens(c, 210, 300, 0.72 * 1.1, MENSEN.mila);
    mens(c, 430, 300, 0.86 * 1.1, MENSEN.joep);
    tafel(c, 80, 480);
    bord(c, 210);
    bord(c, 430);
  } else if (s === "pizza3") {
    mens(c, 200, 300, 1.0, MENSEN.rosa);
    tafel(c, 70, 500);
    c.save();
    c.translate(330, 196);
    deeg(c, 0.55);
    c.restore();
    c.save();
    c.translate(450, 150);
    c.scale(0.4, 0.4);
    weeg(c, { kant: "0", l: "deeg~m:0.5", r: "deeg~m:0.5" });
    c.restore();
  } else if (s === "picknick1") {
    mens(c, 170, 320, 0.72 * 1.1, MENSEN.jip);
    mens(c, 500, 320, 1.0, MENSEN.oma);
    tafel(c, 240, 200);
    c.save();
    c.translate(270, 176);
    c.scale(0.65, 0.65);
    mand(c, { vul: "0" });
    c.restore();
  } else if (s === "picknick2") {
    boom(c, 90, 300);
    boom(c, 560, 290);
    mens(c, 260, 330, 0.72 * 1.1, { ...MENSEN.jip, armen: "voor" });
    c.save();
    c.translate(224, 236);
    c.scale(0.38, 0.38);
    mand(c, { vul: "2" });
    c.restore();
    mens(c, 420, 330, 1.0, MENSEN.mama);
  }
}

/** Een groot plaatje bij een vraag (ontwerpvak 360 × 300): een kind met iets. */
function tafereel(c: C, o: O) {
  const s = o.s ?? "";
  vorm(c, blok(4, 4, 352, 292, 22), s === "buik" ? "#fdebd3" : LUCHT);
  vorm(c, "M 6 236 H 354 V 274 Q 354 294 334 294 H 26 Q 6 294 6 274 Z", s === "buik" ? "#f3d0a7" : "#a6dc8e", 0, null);
  vorm(c, blok(4, 4, 352, 292, 22), undefined);
  if (s === "mand") {
    mens(c, 180, 276, 0.8, { ...MENSEN.jip, armen: "voor" });
    c.save();
    c.translate(124, 166);
    c.scale(0.5, 0.5);
    mand(c, { vul: "2" });
    c.restore();
  } else if (s === "tas") {
    rugtas(c, 120, 92, 1.05);
    mens(c, 180, 276, 0.8, MENSEN.jip);
    vorm(c, "M 152 112 L 146 150 M 208 112 L 214 150", undefined, 9, PAARS);
  } else if (s === "speelgoed") {
    rugtas(c, 30, 104, 1.1);
    c.save();
    c.translate(170, 150);
    c.scale(0.8, 0.8);
    voetbal(c);
    c.restore();
    vorm(c, "M 290 70 L 330 120 L 290 170 L 250 120 Z", PALET.koraal);
    vorm(c, "M 290 70 V 170 M 250 120 H 330", undefined, 2.5);
    vorm(c, "M 290 170 Q 280 200 296 226", undefined, 3);
    vorm(c, "M 170 250 Q 230 210 300 250", undefined, 5, PALET.petrol);
    vorm(c, blok(160, 240, 14, 26, 5), PALET.geel, 2.5);
    vorm(c, blok(296, 240, 14, 26, 5), PALET.geel, 2.5);
  } else if (s === "buik") {
    mens(c, 180, 276, 0.8, { ...MENSEN.jip, buik: true, armen: "buik" });
  } else if (s === "fles") {
    mens(c, 150, 276, 0.8, MENSEN.noor);
    c.save();
    c.translate(214, 108);
    c.scale(0.55, 0.55);
    flesje(c, { v: o.v ?? "0.8" });
    c.restore();
    vorm(c, cirkel(214, 186, 11), MENSEN.noor.huid);
  }
}

/* =====================================================================
   DE LIJST
   ===================================================================== */

type Tek = { maat: (o: O) => { b: number; h: number }; teken: (c: C, o: O) => void; punten?: (o: O) => Punt[] };

const T: Record<string, Tek> = {
  pizza: { maat: (o) => ({ b: 200 * getal(o, "m", 1), h: 200 * getal(o, "m", 1) }), teken: (c, o) => pizza(c, getal(o, "m", 1), o.top) },
  punt: { maat: () => ({ b: 100, h: 120 }), teken: (c) => punt(c) },
  punten: { maat: (o) => puntenMaat(getal(o, "n", 1)), teken: (c, o) => punten(c, getal(o, "n", 1)), punten: (o) => puntenPunten(getal(o, "n", 1)) },
  ijsje: { maat: ijsMaat, teken: ijsje, punten: ijsPunten },
  pizzadoos: { maat: () => ({ b: 240, h: 250 }), teken: pizzadoos },
  dozen: { maat: (o) => ({ b: 220, h: getal(o, "n", 1) * 40 + 8 }), teken: dozen },
  stapels: { maat: (o) => ({ b: getal(o, "s", 6) * 80 + 12, h: getal(o, "n", 7) * 26 + 8 }), teken: stapels },
  deeg: { maat: (o) => ({ b: 170 * getal(o, "m", 1), h: 110 * getal(o, "m", 1) }), teken: (c, o) => deeg(c, getal(o, "m", 1)) },
  kaas: { maat: (o) => ({ b: 190 * getal(o, "m", 1), h: 120 * getal(o, "m", 1) }), teken: (c, o) => kaas(c, getal(o, "m", 1)) },
  tomaat: {
    maat: (o) => (getal(o, "n", 1) === 3 ? { b: 112, h: 104 } : { b: 60, h: 66 }),
    teken: (c, o) => {
      if (getal(o, "n", 1) === 3) {
        tomaat(c, 30, 76, 24);
        tomaat(c, 82, 76, 24);
        tomaat(c, 56, 36, 24);
      } else tomaat(c, 30, 38, 25);
    },
  },
  olijf: { maat: () => ({ b: 44, h: 38 }), teken: (c) => olijf(c) },
  meel: { maat: () => ({ b: 140, h: 170 }), teken: (c) => meel(c) },
  meelberg: { maat: () => ({ b: 440, h: 310 }), teken: (c) => meelberg(c) },
  mens: { maat: (o) => ({ b: 170 * mensSchaal(o.wie ?? "jip"), h: 290 * mensSchaal(o.wie ?? "jip") }), teken: (c, o) => mens(c, 85 * mensSchaal(o.wie ?? "jip"), 286 * mensSchaal(o.wie ?? "jip"), mensSchaal(o.wie ?? "jip"), MENSEN[o.wie ?? "jip"] ?? MENSEN.jip) },
  hoofd: { maat: () => ({ b: 120, h: 120 }), teken: (c, o) => hoofd(c, 60, 66, MENSEN[o.wie ?? "kim"] ?? MENSEN.kim) },
  mier: { maat: () => ({ b: 64, h: 60 }), teken: (c) => mier(c) },
  mand: { maat: () => ({ b: 220, h: 170 }), teken: mand },
  stokje: { maat: () => ({ b: 90, h: 232 }), teken: stokje },
  broodje: { maat: () => ({ b: 180, h: 166 }), teken: broodje },
  beker: { maat: () => ({ b: 134, h: 176 }), teken: beker },
  potje: { maat: () => ({ b: 140, h: 174 }), teken: potje },
  flesje: { maat: () => ({ b: 96, h: 210 }), teken: flesje },
  schaal: { maat: () => ({ b: 220, h: 162 }), teken: schaal },
  maatbeker: { maat: maatbekerMaat, teken: maatbeker },
  ballon: { maat: () => ({ b: 110, h: 172 }), teken: (c) => ballon(c) },
  steen: { maat: () => ({ b: 130, h: 100 }), teken: (c) => steen(c) },
  voetbal: { maat: () => ({ b: 110, h: 110 }), teken: (c) => voetbal(c) },
  veer: { maat: () => ({ b: 90, h: 156 }), teken: (c) => veer(c) },
  appel: { maat: () => ({ b: 90, h: 100 }), teken: (c) => appel(c, 44, 58, 34) },
  watermeloen: { maat: () => ({ b: 180, h: 124 }), teken: (c) => watermeloen(c) },
  weeg: { maat: () => ({ b: 380, h: 280 }), teken: weeg },
  wip: { maat: () => ({ b: 400, h: 212 }), teken: wip },
  verhaal: { maat: () => ({ b: 640, h: 380 }), teken: verhaal },
  tafereel: { maat: () => ({ b: 360, h: 300 }), teken: tafereel },
  onderwerp: { maat: () => ({ b: 100, h: 100 }), teken: (c, o) => onderwerp(c, o.o ?? "zon") },
  muur: { maat: () => ({ b: 14 * TG + 16, h: 8 * TG + 16 }), teken: muur },
  tafelb: { maat: (o) => ({ b: getal(o, "k", 2) * 50 + 24, h: getal(o, "r", 1) * 50 + 24 }), teken: tafelBorden },
  muurtje: { maat: (o) => ({ b: getal(o, "n", 3) * 44 + 8, h: 3 * 30 + 8 }), teken: muurtje },
  vellen: { maat: () => ({ b: 470, h: 260 }), teken: vellen },
  ruitjes: { maat: ruitjesMaat, teken: ruitjes, punten: ruitjesPunten },
  matten: { maat: mattenMaat, teken: matten, punten: mattenPunten },
  tafel: {
    maat: (o) => tafelMaat(enkeleTafel(o)),
    teken: (c, o) => tafelTekenen(c, enkeleTafel(o), MKLEUR[o.kl ?? "groen"] ?? GROEN, o.tegel === "1"),
    punten: (o) => tafelPunten(enkeleTafel(o)),
  },
  twee: {
    maat: tweeMaat,
    teken: (c, o) => {
      const [a, b] = tweeTafels(o);
      const tegel = o.tegel === "1";
      tafelTekenen(c, a, MKLEUR[o.ka ?? "geel"] ?? PALET.geel, tegel);
      tafelTekenen(c, b, MKLEUR[o.kb ?? "rood"] ?? ROOD, tegel, tafelMaat(a).b + TUSSEN);
    },
    punten: (o) => {
      const [a, b] = tweeTafels(o);
      return [...tafelPunten(a), ...tafelPunten(b, tafelMaat(a).b + TUSSEN)];
    },
  },
  teken: {
    maat: () => ({ b: 120, h: 90 }),
    teken: (c, o) => {
      const t = o.t ?? "=";
      if (t === "tel") {
        for (let i = 0; i < 3; i++) {
          vorm(c, blok(6 + i * 38, 22, 34, 34, 4), BLAUW, 2.5);
          tekst(c, String(i + 1), 23 + i * 38, 40, 22, PALET.warmwit);
        }
        return;
      }
      vorm(c, blok(26, 26, 68, 12, 6), N, 0, null);
      vorm(c, blok(26, 52, 68, 12, 6), N, 0, null);
      if (t === "niet") vorm(c, "M 76 10 L 44 80", undefined, 10, ROOD);
    },
  },
};

/* ---------- sleutels ---------- */

function ontleed(sleutel: string): { naam: string; o: O } {
  const [naam, ...rest] = sleutel.split("|");
  const o: O = {};
  for (const r of rest) {
    const i = r.indexOf("=");
    if (i > 0) o[r.slice(0, i)] = r.slice(i + 1);
  }
  return { naam, o };
}

export function tekeningMaat(sleutel: string): { b: number; h: number } {
  const { naam, o } = ontleed(sleutel);
  const t = T[naam];
  return t ? t.maat(o) : { b: 100, h: 100 };
}

/** Teken de tekening in haar ontwerpvak (de aanroeper schaalt). */
export function tekenTekening(c: C, sleutel: string) {
  const { naam, o } = ontleed(sleutel);
  const t = T[naam];
  if (!t) return;
  c.save();
  c.lineJoin = "round";
  c.lineCap = "round";
  t.teken(c, o);
  c.restore();
}

/** De plekken van de dingen om te tellen (stukken, bolletjes, blaadjes, hokjes), in het ontwerpvak. */
export function tekeningPunten(sleutel: string): Punt[] {
  const { naam, o } = ontleed(sleutel);
  return T[naam]?.punten?.(o) ?? [];
}

/** Bij twee tafels: het midden van elke tafel (x) in het ontwerpvak. */
export function tafelMiddens(sleutel: string): number[] {
  const { naam, o } = ontleed(sleutel);
  if (naam !== "twee") return [];
  const [a] = tweeTafels(o);
  const b = tafelMaat(a).b;
  return [b / 2, b + TUSSEN + b / 2];
}

