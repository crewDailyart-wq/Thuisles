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
import { tekenVoorwerp } from "../voorwerpen";

const N: string = PALET.navy;
const GROEN = "#55c26f";
const HOUT = "#d39b62";
const ROOD = "#e8453c";
const PAARS = "#a986ec";
const ROZE = "#f594c6";
const BLAUW = "#4b8af5";
const ORANJE = "#ff9a3c";
const GRIJS = "#b9c0cc";

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

function tekst(c: C, t: string, x: number, y: number, maat: number, kleur: string = N, gewicht = 800) {
  c.font = `${gewicht} ${maat}px ${LETTER}`;
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.fillStyle = kleur;
  c.fillText(t, x, y);
}

const getal = (o: O, k: string, std: number) => (o[k] !== undefined && o[k] !== "" ? Number(o[k]) : std);

/* =====================================================================
   ECHTE DINGEN: vaste plaatjes uit public/voorwerpen (src/lib/voorwerpen,
   lijst-meten.ts). Hier staat alleen waar en hoe groot ze komen; nooit een
   eigen getekende versie van een ding.
   ===================================================================== */

/** Een voorwerp passend in een vierkant met het midden op (x, y). */
function vw(c: C, naam: string, x: number, y: number, maat: number) {
  tekenVoorwerp(c, naam, x - maat / 2, y - maat / 2, maat, maat);
}

/** Alle voorwerpen die deze lessen kunnen tekenen (het lesscherm laadt ze vooraf). */
export const METEN_VOORWERPEN = [
  "pizza-kaas", "pizza-salami", "pizza-olijven", "pizzapunt", "ijsje-twee-bollen", "hoorntje", "bolletje-ijs", "bolletje-deeg", "kaas",
  "tomaat", "olijf", "zak-meel", "boterham-weinig-kaas", "boterham-veel-kaas", "boterham-heel-veel-kaas", "pizzadoos-open", "doos-rood",
  "doos-blauw", "pizzaoven", "schaal", "mand", "mand-half", "mand-vol", "spies-leeg", "spies-twee", "spies-vol", "ballon", "steen",
  "voetbal", "veer", "appel", "watermeloen", "knikker", "boek", "rugtas", "vlieger", "springtouw", "bal", "speelblok", "zon", "bloem",
  "huis", "bootje", "boom", "planeet-ring", "picknickkleed", "bord", "broodje", "mandarijn",
];

const PIZZA: Record<string, string> = { kaas: "pizza-kaas", salami: "pizza-salami", olijf: "pizza-olijven" };

const puntenMaat = (n: number) => ({ b: Math.max(1, n) * 110 + 30, h: 140 });
function puntenPunten(n: number): Punt[] {
  return Array.from({ length: n }, (_, i) => ({ x: 15 + i * 110 + 55, y: 70 }));
}

/** Een ijsje: met `kers` het vaste plaatje (twee bolletjes); anders een hoorntje met `bol` losse bolletjes om te tellen. */
function ijsMaat(o: O) {
  const m = getal(o, "m", 1);
  const n = o.kers ? 2 : getal(o, "bol", 1);
  return o.kers ? { b: 170 * m, h: 170 * m } : { b: 130 * m, h: (112 + n * 46 + 34) * m };
}
function ijsPunten(o: O): Punt[] {
  if (o.kers) return [];
  const m = getal(o, "m", 1);
  const n = getal(o, "bol", 1);
  const { h } = ijsMaat(o);
  const topY = h - 108 * m;
  return Array.from({ length: n }, (_, i) => ({ x: 65 * m, y: topY - 16 * m - i * 46 * m }));
}
function ijsje(c: C, o: O) {
  const m = getal(o, "m", 1);
  if (o.kers) return vw(c, "ijsje-twee-bollen", 85 * m, 85 * m, 170 * m);
  const { h } = ijsMaat(o);
  const pts = ijsPunten(o);
  for (const p of pts) vw(c, "bolletje-ijs", p.x, p.y, 84 * m);
  vw(c, "hoorntje", 65 * m, h - 58 * m, 116 * m);
}

/** Een open pizzadoos met een pizza erin (`p` = hoe groot de pizza is, 0–1). */
function pizzadoos(c: C, o: O) {
  const p = getal(o, "p", 1);
  vw(c, "pizzadoos-open", 120, 125, 250);
  /* De pizza ligt plat IN de doos: de bodem van de doos (het plaatje is 512 × 470) heeft zijn midden op ± (134, 179); van schuin boven gezien is de ronde pizza een platte ovaal, binnen de randen. */
  c.save();
  c.translate(134, 179);
  c.scale(1, 0.52);
  vw(c, "pizza-kaas", 0, 0, 118 * p);
  c.restore();
}

const MEELBERG: [number, number][] = [];
[5, 4, 3, 2].forEach((n, r) => {
  for (let i = 0; i < n; i++) MEELBERG.push([50 + r * 42 + i * 84, 250 - r * 64]);
});

/* =====================================================================
   PICKNICK EN HOEVEELHEDEN
   ===================================================================== */

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

/** Een schaal met tomaten: `n` tomaten erop. */
function schaal(c: C, o: O) {
  const n = getal(o, "n", 4);
  const r = 15;
  const rijen: number[] = n <= 4 ? [n] : n <= 7 ? [4, n - 4] : [5, 4, n - 9 > 0 ? n - 9 : 0].filter((x) => x > 0);
  /* Eerst de schaal, dan de tomaten als een bergje dat boven de rand uitkomt (niet erachter): zo zie je vol, voller en volst (14.23). */
  vw(c, "schaal", 110, 106, 220);
  rijen.forEach((aantal, j) => {
    const breed = aantal * r * 2;
    for (let i = 0; i < aantal; i++) vw(c, "tomaat", 110 - breed / 2 + r + i * r * 2, 66 - j * 21, r * 2.4);
  });
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

/* =====================================================================
   OPPERVLAKTE
   ===================================================================== */

/** Een onderwerp op een schilderij, in een vak van 100 × 100. */
const ONDERWERP: Record<string, string> = { zon: "zon", bloem: "bloem", huis: "huis", boot: "bootje", boom: "boom", planeet: "planeet-ring" };
function onderwerp(c: C, wat: string) {
  vw(c, ONDERWERP[wat] ?? "zon", 50, 50, 100);
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
    { wat: "planeet", k: 8, r: 2, b: 5, h: 4 },
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

/** Een wip met een bal (links) en een speelblok (rechts); `kant` -1 = links omlaag, 0 = recht. */
function wip(c: C, o: O) {
  const kant = getal(o, "kant", 0);
  const a = kant * 0.22;
  const cx = 200;
  const cy = 150;
  vorm(c, `M ${cx - 34} 206 L ${cx} ${cy} L ${cx + 34} 206 Z`, PALET.koraal);
  c.save();
  c.translate(cx, cy);
  c.rotate(a);
  vw(c, "bal", -140, -50, 96);
  vw(c, "speelblok", 140, -50, 96);
  vorm(c, blok(-180, -8, 360, 16, 8), PALET.geel);
  c.restore();
}

/* =====================================================================
   BEGINPLAATJES (ontwerpvak 640 × 380; dingen los in de ruimte, geen achtergrond)
   ===================================================================== */

function verhaal(c: C, o: O) {
  const s = o.s ?? "";
  if (s === "pizza1") {
    c.save();
    c.translate(120, 70);
    pizzadoos(c, { p: "1" });
    c.restore();
    vw(c, "bord", 470, 250, 220);
  } else if (s === "pizza2") {
    c.save();
    c.translate(320 - puntenMaat(4).b / 2, 120);
    punten(c, 4);
    c.restore();
  } else if (s === "pizza3") {
    vw(c, "bolletje-deeg", 170, 250, 220);
    c.save();
    c.translate(330, 90);
    c.scale(0.75, 0.75);
    weeg(c, { kant: "0", l: "deeg~m:0.5", r: "deeg~m:0.5" });
    c.restore();
  } else if (s === "picknick1") {
    vw(c, "picknickkleed", 320, 260, 340);
    vw(c, "mand", 320, 190, 220);
  } else if (s === "picknick2") {
    vw(c, "boom", 110, 220, 230);
    vw(c, "boom", 540, 230, 210);
    vw(c, "mand-vol", 320, 230, 240);
  }
}

function punten(c: C, n: number) {
  for (const p of puntenPunten(n)) vw(c, "pizzapunt", p.x, p.y, 130);
}

/** Een groot plaatje bij een vraag (ontwerpvak 360 × 300). */
function tafereel(c: C, o: O) {
  const s = o.s ?? "";
  if (s === "tas") vw(c, "rugtas", 180, 150, 280);
  else if (s === "speelgoed") {
    vw(c, "rugtas", 90, 170, 190);
    vw(c, "voetbal", 220, 230, 100);
    vw(c, "vlieger", 300, 110, 120);
    vw(c, "springtouw", 230, 110, 110);
  } else if (s === "appels") {
    vw(c, "rugtas", 100, 160, 210);
    for (const [x, y] of [[230, 236], [280, 240], [330, 232], [255, 196], [305, 198]]) vw(c, "appel", x, y, 56);
  }
}

/* =====================================================================
   DE LIJST
   ===================================================================== */

type Tek = { maat: (o: O) => { b: number; h: number }; teken: (c: C, o: O) => void; punten?: (o: O) => Punt[] };

const T: Record<string, Tek> = {
  pizza: { maat: (o) => ({ b: 200 * getal(o, "m", 1), h: 200 * getal(o, "m", 1) }), teken: (c, o) => vw(c, PIZZA[o.top ?? "kaas"] ?? "pizza-kaas", 100 * getal(o, "m", 1), 100 * getal(o, "m", 1), 200 * getal(o, "m", 1)) },
  punten: { maat: (o) => puntenMaat(getal(o, "n", 1)), teken: (c, o) => punten(c, getal(o, "n", 1)), punten: (o) => puntenPunten(getal(o, "n", 1)) },
  ijsje: { maat: ijsMaat, teken: ijsje, punten: ijsPunten },
  pizzadoos: { maat: () => ({ b: 240, h: 250 }), teken: pizzadoos },
  doos: { maat: () => ({ b: 220, h: 90 }), teken: (c, o) => vw(c, o.kleur === "blauw" ? "doos-blauw" : "doos-rood", 110, 45, 220) },
  deeg: { maat: (o) => ({ b: 170 * getal(o, "m", 1), h: 170 * getal(o, "m", 1) }), teken: (c, o) => vw(c, "bolletje-deeg", 85.0 * getal(o, "m", 1), 85.0 * getal(o, "m", 1), 170 * getal(o, "m", 1)) },
  kaas: { maat: (o) => ({ b: 190 * getal(o, "m", 1), h: 190 * getal(o, "m", 1) }), teken: (c, o) => vw(c, "kaas", 95.0 * getal(o, "m", 1), 95.0 * getal(o, "m", 1), 190 * getal(o, "m", 1)) },
  tomaat: {
    maat: (o) => (getal(o, "n", 1) === 3 ? { b: 112, h: 104 } : { b: 64, h: 64 }),
    teken: (c, o) => {
      if (getal(o, "n", 1) === 3) {
        vw(c, "tomaat", 30, 76, 56);
        vw(c, "tomaat", 82, 76, 56);
        vw(c, "tomaat", 56, 32, 56);
      } else vw(c, "tomaat", 32, 32, 64);
    },
  },
  olijf: { maat: () => ({ b: 48, h: 48 }), teken: (c) => vw(c, "olijf", 24, 24, 48) },
  olijfschaal: {
    maat: () => ({ b: 260, h: 200 }),
    teken: (c) => {
      /* Eerst de schaal, dan de olijven erop: een berg die uit de schaal komt (niet erachter). */
      vw(c, "schaal", 130, 110, 250);
      for (let j = 0; j < 4; j++) {
        const n = 8 - j * 2;
        for (let i = 0; i < n; i++) vw(c, "olijf", 130 + (i - (n - 1) / 2) * 24, 84 - j * 18, 34);
      }
    },
  },
  meel: { maat: () => ({ b: 170, h: 170 }), teken: (c) => vw(c, "zak-meel", 85, 85, 170) },
  meelberg: { maat: () => ({ b: 440, h: 310 }), teken: (c) => MEELBERG.forEach(([x, y]) => vw(c, "zak-meel", x, y, 110)) },
  boeken: {
    /* Een boek is 176 breed en ongeveer 96 hoog; ze liggen op elkaar (stap 26), niet los in de lucht. */
    maat: (o) => ({ b: 176, h: 100 + (getal(o, "n", 4) - 1) * 26 }),
    teken: (c, o) => {
      const n = getal(o, "n", 4);
      const h = 100 + (n - 1) * 26;
      for (let i = 0; i < n; i++) vw(c, "boek", 88 + (i % 2) * 6 - 3, h - 50 - i * 26, 176);
    },
  },
  knikker: { maat: () => ({ b: 50, h: 50 }), teken: (c) => vw(c, "knikker", 25, 25, 50) },
  oven: { maat: () => ({ b: 260, h: 260 }), teken: (c) => vw(c, "pizzaoven", 130, 130, 260) },
  mand: { maat: () => ({ b: 220, h: 220 }), teken: (c, o) => vw(c, o.vul === "2" ? "mand-vol" : o.vul === "1" ? "mand-half" : "mand", 110, 110, 220) },
  stokje: { maat: () => ({ b: 220, h: 220 }), teken: (c, o) => vw(c, getal(o, "n", 0) >= 5 ? "spies-vol" : getal(o, "n", 0) > 0 ? "spies-twee" : "spies-leeg", 110, 110, 220) },
  broodje: { maat: () => ({ b: 190, h: 190 }), teken: (c, o) => vw(c, getal(o, "n", 1) >= 7 ? "boterham-heel-veel-kaas" : getal(o, "n", 1) > 1 ? "boterham-veel-kaas" : "boterham-weinig-kaas", 95, 95, 190) },
  beker: { maat: () => ({ b: 134, h: 176 }), teken: beker },
  potje: { maat: () => ({ b: 140, h: 174 }), teken: potje },
  flesje: { maat: () => ({ b: 96, h: 210 }), teken: flesje },
  schaal: { maat: () => ({ b: 220, h: 162 }), teken: schaal },
  maatbeker: { maat: maatbekerMaat, teken: maatbeker },
  ballon: { maat: () => ({ b: 170, h: 170 }), teken: (c) => vw(c, "ballon", 85.0, 85.0, 170) },
  steen: { maat: () => ({ b: 130, h: 130 }), teken: (c) => vw(c, "steen", 65.0, 65.0, 130) },
  voetbal: { maat: () => ({ b: 110, h: 110 }), teken: (c) => vw(c, "voetbal", 55.0, 55.0, 110) },
  veer: { maat: () => ({ b: 156, h: 156 }), teken: (c) => vw(c, "veer", 78.0, 78.0, 156) },
  appel: { maat: () => ({ b: 100, h: 100 }), teken: (c) => vw(c, "appel", 50.0, 50.0, 100) },
  watermeloen: { maat: () => ({ b: 180, h: 180 }), teken: (c) => vw(c, "watermeloen", 90.0, 90.0, 180) },
  rugtas: { maat: () => ({ b: 170, h: 170 }), teken: (c) => vw(c, "rugtas", 85.0, 85.0, 170) },
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
      vorm(c, blok(26, 26, 68, 12, 6), PALET.warmwit, 0, null);
      vorm(c, blok(26, 52, 68, 12, 6), PALET.warmwit, 0, null);
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

