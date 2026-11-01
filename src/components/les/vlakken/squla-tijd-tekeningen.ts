/**
 * Tekeningen voor de lessen Tijd naar Squla (30 oktober 2026): De kalender en
 * Tijden. Eigen werk, vlak en vriendelijk in de stijl van bliepo-voorwerpen.ts
 * (donkerblauwe rand, petrol, koraal, warmgeel, warmwit); geen plaatjes van
 * buiten, geen AI, geen emoji, niets van Squla.
 *
 * Elke tekening heeft een ontwerpvak (b × h) en wordt op een canvas getekend;
 * de scène schaalt hem passend in een kaartje of bovenaan in beeld.
 * Kalenders hebben instellingen in de sleutel, bijvoorbeeld
 * "maand|rood=9|hoed=13|boog=9-13".
 */

import { PALET, RAND, RAND_DUN, blok, cirkel, tekenVormen } from "./bliepo-voorwerpen";
import { tekenVoorwerp } from "../voorwerpen";

const N: string = PALET.navy;
const GROEN = "#55c26f";
const LUCHT = "#9fd8ff";
const GRIJS = "#cfd4de";
const ROOD = "#e8453c";
const PAARS = "#a986ec";

let LETTER = "system-ui, sans-serif";
/** Het lettertype van de les (voor tekst in de tekeningen). */
export function zetLettertype(f: string) {
  if (f) LETTER = f;
}

type C = CanvasRenderingContext2D;

const v = (c: C, d: string, vul?: string, dik = RAND_DUN, rand: string | undefined = N) => tekenVormen(c, [{ d, vul, rand, dik }]);

function tekst(c: C, t: string, x: number, y: number, maat: number, kleur: string = N, gewicht = 800, uitlijn: CanvasTextAlign = "center") {
  c.font = `${gewicht} ${maat}px ${LETTER}`;
  c.textAlign = uitlijn;
  c.textBaseline = "middle";
  c.fillStyle = kleur;
  c.fillText(t, x, y);
}

/* ---------- de maand juni (eigen kalender: 1 juni is een dinsdag) ---------- */

export const MAAND = { naam: "juni", dagen: 30, start: 1 /* 0 = maandag */ };
export const KOP = ["ma", "di", "wo", "do", "vr", "za", "zo"];
/** Kolom (0 = maandag) en rij van een datum in juni. */
export const plekInMaand = (n: number) => ({ kol: (MAAND.start + n - 1) % 7, rij: Math.floor((MAAND.start + n - 1) / 7) });
export const dagVanDatum = (n: number) => (MAAND.start + n - 1) % 7;

/* ---------- kleine voorwerpen (ontwerpvak 120 × 120) ---------- */

/** Een vinkje (waar) of een kruisje (niet waar) op een rondje: een teken, geen ding (ontwerpvak 120 × 120). */
function waarTeken(c: C, waar: boolean) {
  v(c, cirkel(60, 60, 50), waar ? GROEN : ROOD, RAND);
  v(c, waar ? "M 36 62 L 54 80 L 86 40" : "M 40 40 L 80 80 M 80 40 L 40 80", undefined, 12, PALET.warmwit);
}

/** Een vast plaatje (src/lib/voorwerpen) in een ontwerpvak. */
const vw = (naam: string, b = 120, h = 120) => (c: C) => tekenVoorwerp(c, naam, 0, 0, b, h);
const feesthoed = vw("feesthoed", 120, 130);

/* Activiteiten op school (dagritme en dagkalender). */
function rekenen(c: C) {
  v(c, blok(18, 14, 84, 96, 8), PALET.warmwit, RAND);
  tekst(c, "1+2", 60, 46, 30, N);
  tekst(c, "3+1", 60, 84, 30, PALET.petrol);
}

/*
  Sinds 31 oktober 2026 zijn de activiteiten vaste plaatjes (geen mensen: de
  kring is een kring van lege stoeltjes). Alleen "rekenen" blijft in code: dat
  is een blaadje met sommen.
*/
const kring = vw("stoelenkring");
const gym = vw("hoepel");
const buiten = vw("schommel");
const eten = vw("boterham");
const lezen = vw("boek");
const fruit = vw("banaan");

const ACTIVITEIT: Record<string, (c: C) => void> = { kring, rekenen, gym, buiten, eten, lezen, fruit };
export const ACTIVITEITNAAM: Record<string, string> = {
  kring: "in de kring",
  rekenen: "rekenen",
  gym: "gym",
  buiten: "buiten spelen",
  eten: "eten",
  lezen: "lezen",
  fruit: "fruit eten",
};

/** Een activiteit op een wit kaartje (ontwerpvak 120 × 120). */
function activiteitKaartje(c: C, a: string) {
  v(c, blok(4, 4, 112, 112, 14), PALET.warmwit, RAND_DUN);
  c.save();
  c.translate(14, 14);
  c.scale(92 / 120, 92 / 120);
  ACTIVITEIT[a]?.(c);
  c.restore();
}

/* ---------- kalenders ---------- */

function papier(c: C, b: number, h: number, kopKleur: string = PALET.koraal, kopH = 34) {
  v(c, blok(6, 6, b - 12, h - 12, 14), PALET.warmwit, RAND);
  c.save();
  c.beginPath();
  c.roundRect(9, 9, b - 18, kopH, [11, 11, 0, 0]);
  c.fillStyle = kopKleur;
  c.fill();
  c.restore();
  v(c, `M 9 ${9 + kopH} H ${b - 9}`, undefined, 3);
}

/** Een maandkalender van juni (ontwerpvak 560 × 380). Opties: rood, hoed, boog (van-tot), pijl (naar de kolomkop). */
function maand(c: C, o: Record<string, string>) {
  const b = 560;
  const h = 380;
  const rood = o.rood ? Number(o.rood) : null;
  const hoed = o.hoed ? Number(o.hoed) : null;
  const [bv, bt] = o.boog ? o.boog.split("-").map(Number) : [0, 0];
  const pijl = o.pijl ? Number(o.pijl) : null;
  papier(c, b, h, PALET.koraal, 42);
  tekst(c, "juni", b / 2, 30, 28, PALET.warmwit);
  const x0 = 24;
  const kopY = 70;
  const cb = (b - 48) / 7;
  const ch = 54;
  const y0 = 90;
  KOP.forEach((k, i) => tekst(c, k, x0 + i * cb + cb / 2, kopY, 20, i >= 5 ? PALET.koraal : N));
  for (let r = 0; r <= 5; r++) v(c, `M ${x0} ${y0 + r * ch} H ${x0 + 7 * cb}`, undefined, 1.5, GRIJS);
  for (let k = 0; k <= 7; k++) v(c, `M ${x0 + k * cb} ${y0} V ${y0 + 5 * ch}`, undefined, 1.5, GRIJS);
  for (let n = 1; n <= MAAND.dagen; n++) {
    const { kol, rij } = plekInMaand(n);
    const cx = x0 + kol * cb + cb / 2;
    const cy = y0 + rij * ch + ch / 2;
    if (n === rood) {
      c.fillStyle = "#ffd9d4";
      c.fillRect(x0 + kol * cb + 2, y0 + rij * ch + 2, cb - 4, ch - 4);
      v(c, blok(x0 + kol * cb + 3, y0 + rij * ch + 3, cb - 6, ch - 6, 8), undefined, 5, ROOD);
    }
    if (n === hoed) {
      c.save();
      c.translate(cx + 6, cy - 24);
      c.scale(0.3, 0.3);
      feesthoed(c);
      c.restore();
      tekst(c, String(n), cx - 14, cy + 6, 22, N);
    } else tekst(c, String(n), cx, cy + 1, 24, n === rood ? ROOD : N);
  }
  if (bv && bt) {
    for (let n = bv; n < bt; n++) {
      const a = plekInMaand(n);
      const z = plekInMaand(n + 1);
      if (a.rij !== z.rij) continue;
      const xa = x0 + a.kol * cb + cb / 2;
      const xz = x0 + z.kol * cb + cb / 2;
      const y = y0 + a.rij * ch + 10;
      v(c, `M ${xa + 6} ${y} Q ${(xa + xz) / 2} ${y - 30} ${xz - 6} ${y}`, undefined, 4.5, ROOD);
      v(c, `M ${xz - 6} ${y} l -9 -3 M ${xz - 6} ${y} l -2 -9`, undefined, 4, ROOD);
    }
  }
  if (pijl) {
    const { kol, rij } = plekInMaand(pijl);
    const x = x0 + kol * cb + cb / 2;
    const yv = y0 + rij * ch + 8;
    v(c, `M ${x} ${yv} V ${kopY + 16}`, undefined, 5, ROOD);
    v(c, `M ${x - 10} ${kopY + 28} L ${x} ${kopY + 12} L ${x + 10} ${kopY + 28} Z`, ROOD, 2, ROOD);
  }
}

/** Een klein stukje van juni (ontwerpvak 360 × 150): drie dagen naast elkaar. */
function stukje(c: C, o: Record<string, string>) {
  const van = Number(o.van ?? 8);
  const rood = o.rood ? Number(o.rood) : null;
  const hoed = o.hoed ? Number(o.hoed) : null;
  v(c, blok(6, 6, 348, 138, 14), PALET.warmwit, RAND);
  for (let i = 0; i < 3; i++) {
    const n = van + i;
    const x = 20 + i * 110;
    tekst(c, KOP[dagVanDatum(n)], x + 50, 30, 20, N);
    v(c, blok(x, 46, 100, 86, 10), n === rood ? "#ffd9d4" : PALET.warmwit, n === rood ? 5 : 2, n === rood ? ROOD : GRIJS);
    if (n === hoed) {
      c.save();
      c.translate(x + 52, 52);
      c.scale(0.32, 0.32);
      feesthoed(c);
      c.restore();
      tekst(c, String(n), x + 30, 100, 32, N);
    } else tekst(c, String(n), x + 50, 90, 38, n === rood ? ROOD : N);
  }
}

/** Een kleine maandkalender als plaatje op een kaartje (ontwerpvak 200 × 170). */
function maandKlein(c: C) {
  papier(c, 200, 170, PALET.koraal, 26);
  tekst(c, "juni", 100, 23, 17, PALET.warmwit);
  for (let n = 1; n <= MAAND.dagen; n++) {
    const { kol, rij } = plekInMaand(n);
    const x = 18 + kol * 24 + 12;
    const y = 52 + rij * 22 + 10;
    if (n === 8) v(c, blok(x - 11, y - 10, 22, 20, 5), "#ffd9d4", 3, ROOD);
    if (n === 13) {
      c.save();
      c.translate(x - 9, y - 12);
      c.scale(0.17, 0.17);
      feesthoed(c);
      c.restore();
    } else tekst(c, String(n), x, y + 1, 11, n === 8 ? ROOD : N, 700);
  }
}

/** Het dagritme: kaartjes aan een lijntje (ontwerpvak 380 × 150). */
function dagritme(c: C, o: Record<string, string>) {
  const lijst = (o.a ?? "kring,rekenen,buiten,gym").split(",");
  const b = 380;
  v(c, `M 6 22 Q ${b / 2} 40 ${b - 6} 22`, undefined, 3);
  const stap = (b - 20) / lijst.length;
  lijst.forEach((a, i) => {
    const x = 10 + i * stap + stap / 2;
    c.save();
    c.translate(x - 44, 34);
    c.scale(88 / 120, 88 / 120);
    activiteitKaartje(c, a);
    c.restore();
    v(c, blok(x - 5, 22, 10, 22, 3), PALET.koraal, 2.5);
  });
}

/** De dagkalender: de dag van boven naar beneden (ontwerpvak 150 × 330). */
function dagkalender(c: C, o: Record<string, string>) {
  const lijst = (o.a ?? "rekenen,fruit,gym").split(",");
  v(c, blok(6, 6, 138, 318, 14), PALET.petrolLicht, RAND);
  lijst.forEach((a, i) => {
    c.save();
    c.translate(25, 20 + i * 102);
    c.scale(100 / 120, 92 / 120);
    activiteitKaartje(c, a);
    c.restore();
  });
}

/** Een weekrooster maandag tot en met vrijdag, met gym op sommige dagen (ontwerpvak 360 × 190). */
function rooster(c: C, o: Record<string, string>) {
  const gymDagen = (o.gym ?? "1,3,4").split(",").map(Number);
  papier(c, 360, 190, PALET.petrol, 0);
  const cb = (360 - 32) / 5;
  ["ma", "di", "wo", "do", "vr"].forEach((k, i) => {
    const x = 16 + i * cb;
    tekst(c, k, x + cb / 2, 34, 22, N);
    if (i > 0) v(c, `M ${x} 16 V 174`, undefined, 2, GRIJS);
    if (gymDagen.includes(i)) {
      c.save();
      c.translate(x + 6, 60);
      c.scale((cb - 12) / 120, (cb - 12) / 120);
      activiteitKaartje(c, "gym");
      c.restore();
    }
  });
  v(c, "M 16 54 H 344", undefined, 2, GRIJS);
}

/** Een weekkalender: één blad voor één week (ontwerpvak 190 × 230). */
function weekblad(c: C) {
  papier(c, 190, 230, PALET.petrol, 52);
  tekst(c, "23", 95, 36, 36, PALET.warmwit);
  KOP.forEach((k, i) => {
    tekst(c, k, 46, 82 + i * 21, 15, i >= 5 ? PALET.koraal : N, 700);
    tekst(c, String(7 + i), 132, 82 + i * 21, 15, N, 700);
    if (i < 6) v(c, `M 24 ${92 + i * 21} H 166`, undefined, 1, GRIJS);
  });
}

/** Een maand als lijst (ontwerpvak 200 × 230): de getallen in drie kolommen; eventueel een naam bij een datum. */
function lijst(c: C, o: Record<string, string>) {
  const naam = o.maand ?? "mei";
  const dagen = Number(o.dagen ?? 31);
  const bij = o.bij ? Number(o.bij) : null;
  papier(c, 200, 230, GROEN, 34);
  tekst(c, naam, 100, 27, 20, PALET.warmwit);
  const perKol = Math.ceil(dagen / 3);
  for (let n = 1; n <= dagen; n++) {
    const k = Math.floor((n - 1) / perKol);
    const r = (n - 1) % perKol;
    const x = 20 + k * 57;
    const y = 58 + r * 15.5;
    tekst(c, String(n), x + 8, y, 11, N, 700, "right");
    v(c, `M ${x + 12} ${y + 5} H ${x + 50}`, undefined, 1, GRIJS);
    if (n === bij && o.naam) tekst(c, o.naam, x + 13, y - 1, 11, ROOD, 800, "left");
  }
}

/** Een feestkalender als lijst, groot (ontwerpvak 420 × 380). */
function verjaardagGroot(c: C, o: Record<string, string>) {
  const naam = o.maand ?? "juni";
  const dagen = Number(o.dagen ?? 30);
  const bij = Number(o.bij ?? 13);
  papier(c, 420, 380, GROEN, 46);
  tekst(c, naam, 210, 33, 28, PALET.warmwit);
  const perKol = 10;
  for (let n = 1; n <= dagen; n++) {
    const k = Math.floor((n - 1) / perKol);
    const r = (n - 1) % perKol;
    const x = 24 + k * 130;
    const y = 82 + r * 28.5;
    tekst(c, String(n), x + 24, y, 19, N, 800, "right");
    v(c, `M ${x + 30} ${y + 9} H ${x + 122}`, undefined, 1.5, GRIJS);
    if (n === bij && o.naam) tekst(c, o.naam, x + 34, y - 1, 19, ROOD, 800, "left");
  }
}

/** Een jaarkalender: twaalf maanden (ontwerpvak 240 × 220). */
function jaar(c: C) {
  papier(c, 240, 220, PAARS, 40);
  tekst(c, "2027", 120, 30, 26, PALET.warmwit);
  for (let m = 0; m < 12; m++) {
    const x = 20 + (m % 4) * 52;
    const y = 62 + Math.floor(m / 4) * 50;
    v(c, blok(x, y, 44, 42, 5), PALET.warmwit, 2, GRIJS);
    c.fillStyle = PALET.koraalLicht;
    c.fillRect(x + 2, y + 2, 40, 8);
    for (let r = 0; r < 4; r++) for (let k = 0; k < 5; k++) {
      c.fillStyle = GRIJS;
      c.fillRect(x + 5 + k * 7.4, y + 15 + r * 6.4, 4.4, 3.6);
    }
  }
}

/** Een boek met een naam op het etiket (ontwerpvak 170 × 200). */
function boekNaam(c: C, o: Record<string, string>) {
  v(c, blok(24, 12, 122, 176, 10), PAARS, RAND);
  v(c, "M 38 12 V 188", undefined, 3);
  v(c, blok(54, 60, 78, 40, 6), PALET.warmwit, 3);
  tekst(c, o.naam ?? "boek", 93, 81, 20, N);
}

/** Een gedachtewolk met een stukje kalender erin (ontwerpvak 420 × 260). */
function droom(c: C, o: Record<string, string>) {
  v(c, "M 70 216 a 16 12 0 1 0 32 0 a 16 12 0 1 0 -32 0 Z M 34 244 a 10 8 0 1 0 20 0 a 10 8 0 1 0 -20 0 Z", PALET.warmwit, 3);
  v(c, "M 110 190 C 40 200 30 120 84 110 C 76 50 160 30 190 66 C 220 20 320 30 320 86 C 390 86 400 170 340 184 C 330 220 250 222 230 196 C 200 226 130 220 110 190 Z", PALET.warmwit, RAND);
  c.save();
  c.translate(84, 64);
  c.scale(0.72, 0.72);
  stukje(c, o);
  c.restore();
}

/* ---------- Tijden: dagdelen, dieren, de bakkerij ---------- */

function dagdeel(c: C, d: string) {
  const lucht = d === "ochtend" ? "#ffe8a8" : d === "middag" ? LUCHT : d === "avond" ? "#b98ad6" : "#26306b";
  c.save();
  c.beginPath();
  c.roundRect(6, 6, 168, 128, 14);
  c.clip();
  c.fillStyle = lucht;
  c.fillRect(0, 0, 180, 140);
  if (d === "ochtend") v(c, cirkel(46, 96, 22), "#ffb23f", 3);
  if (d === "middag") {
    v(c, cirkel(90, 42, 22), PALET.geel, 3);
    v(c, "M 90 8 v 6 M 90 70 v 6 M 56 42 h 6 M 118 42 h 6", undefined, 3);
  }
  if (d === "avond") {
    v(c, cirkel(130, 104, 24), "#ff8a3d", 3);
    c.fillStyle = "#e58bb5";
    c.fillRect(0, 70, 180, 14);
  }
  if (d === "nacht") {
    v(c, "M 120 22 a 24 24 0 1 0 22 38 a 20 20 0 1 1 -22 -38 Z", PALET.geelLicht, 3);
    for (const [x, y] of [[30, 30], [62, 54], [44, 80], [92, 24]]) v(c, `M ${x} ${y - 6} V ${y + 6} M ${x - 6} ${y} H ${x + 6}`, undefined, 3, PALET.warmwit);
  }
  v(c, "M 0 112 Q 60 96 110 108 T 180 104 V 140 H 0 Z", d === "nacht" ? "#2f6a4a" : GROEN, 3);
  c.restore();
  v(c, blok(6, 6, 168, 128, 14), undefined, RAND);
}

function vraagteken(c: C) {
  v(c, cirkel(60, 60, 52), PALET.geel, RAND);
  v(c, "M 42 46 C 42 26 78 24 78 44 C 78 58 60 58 60 72", undefined, 10);
  v(c, cirkel(60, 92, 6), N, 0);
}

const WEEKNAAM = ["maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag", "zondag"];
const WEEKKLEUR = ["#ef5b4f", "#f7953b", "#ffd23f", "#55c26f", "#5aaaf7", "#a986ec", "#f594c6"];

/** De zeven dagen op een rij, in hun eigen kleur (ontwerpvak 700 × 110); `licht` = één dag met een dikke rand. */
function week(c: C, o: Record<string, string>) {
  const licht = o.licht !== undefined ? Number(o.licht) : -1;
  for (let i = 0; i < 7; i++) {
    const x = 6 + i * 98;
    const aan = i === licht;
    v(c, blok(x, aan ? 8 : 20, 92, 82, 12), WEEKKLEUR[i], aan ? 7 : RAND_DUN);
    v(c, blok(x + 6, aan ? 36 : 48, 80, 26, 8), PALET.warmwit, 2);
    tekst(c, WEEKNAAM[i], x + 46, aan ? 50 : 62, i === 3 ? 13 : 14, N);
  }
}

/** Alle vaste plaatjes die deze tekeningen gebruiken: elke Tijd-les laadt ze vooraf. */
export const TIJD_VOORWERPEN = [
  "feesthoed",
  "stoelenkring",
  "hoepel",
  "schommel",
  "banaan",
  "bakkerij",
  "ballon",
  "bed",
  "beslagkom",
  "bezem",
  "boek",
  "boek-groen",
  "boek-rood",
  "bord",
  "boterham",
  "brood",
  "deegkom",
  "ei",
  "fiets",
  "glas-water",
  "huis",
  "jas",
  "kampvuur",
  "kers",
  "koekje",
  "oven-brood",
  "oven-taart",
  "schaar",
  "schoen",
  "sleutel",
  "suikerstrooier",
  "taart",
  "taart-kaarsje",
  "tand",
  "tent",
  "thermometer",
  "zwembad",
];

/* ---------- het register ---------- */

type Tekening = { b: number; h: number; teken: (c: C, o: Record<string, string>) => void };

const ENKEL: Record<string, Tekening> = {
  feesthoed: { b: 120, h: 130, teken: feesthoed },
  ballon: { b: 120, h: 134, teken: vw("ballon", 120, 134) },
  thermometer: { b: 120, h: 120, teken: vw("thermometer", 120, 120) },
  tand: { b: 120, h: 120, teken: vw("tand", 120, 120) },
  duimop: { b: 120, h: 120, teken: (c) => waarTeken(c, true) },
  duimneer: { b: 120, h: 120, teken: (c) => waarTeken(c, false) },
  klok: {
    b: 160,
    h: 160,
    teken: (c) => {
      v(c, cirkel(80, 80, 70), PALET.warmwit, RAND);
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        v(c, `M ${80 + Math.sin(a) * 56} ${80 - Math.cos(a) * 56} L ${80 + Math.sin(a) * 64} ${80 - Math.cos(a) * 64}`, undefined, i % 3 === 0 ? 5 : 3);
      }
      v(c, "M 80 80 L 112 80", undefined, 8);
      v(c, "M 80 80 L 80 28", undefined, 5);
      v(c, cirkel(80, 80, 6), N, 0);
    },
  },
  maandklein: { b: 200, h: 170, teken: maandKlein },
  weekblad: { b: 190, h: 230, teken: weekblad },
  jaar: { b: 240, h: 220, teken: jaar },
  kampvuur: { b: 320, h: 220, teken: vw("kampvuur", 320, 220) },
  bed: { b: 120, h: 110, teken: vw("bed", 120, 110) },
  boterham: { b: 120, h: 120, teken: vw("boterham", 120, 120) },
  bakkerij: { b: 120, h: 120, teken: vw("bakkerij", 120, 120) },
  schoen: { b: 120, h: 112, teken: vw("schoen", 120, 112) },
  deegkom: { b: 120, h: 120, teken: vw("deegkom", 120, 120) },
  strooibus: { b: 120, h: 120, teken: vw("suikerstrooier", 120, 120) },
  taart: { b: 120, h: 112, teken: vw("taart", 120, 112) },
  kers: { b: 120, h: 112, teken: vw("kers", 120, 112) },
  oven: { b: 120, h: 120, teken: vw("oven-brood", 120, 120) },
  koekje: { b: 120, h: 120, teken: vw("koekje", 120, 120) },
  sleutel: { b: 120, h: 120, teken: vw("sleutel", 120, 120) },
  bezem: { b: 120, h: 120, teken: vw("bezem", 120, 120) },
  glas: { b: 120, h: 120, teken: vw("glas-water", 120, 120) },
  fiets: { b: 120, h: 110, teken: vw("fiets", 120, 110) },
  ei: { b: 120, h: 120, teken: vw("ei", 120, 120) },
  jas: { b: 120, h: 120, teken: vw("jas", 120, 120) },
  brood: { b: 120, h: 100, teken: vw("brood", 120, 100) },
  tent: { b: 120, h: 112, teken: vw("tent", 120, 112) },
  bord: { b: 120, h: 112, teken: vw("bord", 120, 112) },
  beslag: { b: 120, h: 120, teken: vw("beslagkom", 120, 120) },
  taartoven: { b: 120, h: 120, teken: vw("oven-taart", 120, 120) },
  taartkaars: { b: 120, h: 112, teken: vw("taart-kaarsje", 120, 112) },
  schaar: { b: 120, h: 112, teken: vw("schaar", 120, 112) },
  vraag: { b: 120, h: 120, teken: vraagteken },
  zwemmen: { b: 120, h: 112, teken: vw("zwembad", 120, 112) },
  huis: { b: 120, h: 112, teken: vw("huis", 120, 112) },
  boekrood: { b: 120, h: 120, teken: vw("boek-rood") },
  boekblauw: { b: 120, h: 120, teken: vw("boek") },
  boekgroen: { b: 120, h: 120, teken: vw("boek-groen") },
};

const MET_OPTIES: Record<string, Tekening> = {
  maand: { b: 560, h: 380, teken: maand },
  stukje: { b: 360, h: 150, teken: stukje },
  dagritme: { b: 380, h: 150, teken: dagritme },
  dagkalender: { b: 150, h: 330, teken: dagkalender },
  rooster: { b: 360, h: 190, teken: rooster },
  lijst: { b: 200, h: 230, teken: lijst },
  verjaardag: { b: 420, h: 380, teken: verjaardagGroot },
  boeknaam: { b: 170, h: 200, teken: boekNaam },
  droom: { b: 420, h: 260, teken: droom },
  week: { b: 700, h: 100, teken: week },
};

/** Ontleed "naam|a=1|b=2" in een naam en opties. */
function ontleed(sleutel: string): { naam: string; o: Record<string, string> } {
  const [naam, ...rest] = sleutel.split("|");
  const o: Record<string, string> = {};
  for (const deel of rest) {
    const [k, w] = deel.split("=");
    o[k] = w ?? "";
  }
  return { naam, o };
}

/** De maat van een tekening (ontwerpvak). */
export function tekeningMaat(sleutel: string): { b: number; h: number } {
  const { naam } = ontleed(sleutel);
  if (naam === "activiteit") return { b: 120, h: 120 };
  if (naam === "dagdeel") return { b: 180, h: 140 };
  if (naam === "woord") return { b: 220, h: 90 };
  const t = ENKEL[naam] ?? MET_OPTIES[naam];
  return t ? { b: t.b, h: t.h } : { b: 120, h: 120 };
}

/** Teken de tekening in haar ontwerpvak (de aanroeper schaalt). */
export function tekenTekening(c: C, sleutel: string) {
  const { naam, o } = ontleed(sleutel);
  if (naam === "activiteit") return ACTIVITEIT[o.a] ? (ACTIVITEIT[o.a](c), undefined) : undefined;
  if (naam === "dagdeel") return dagdeel(c, o.d);
  if (naam === "woord") return tekst(c, o.t ?? "", 110, 46, 40, N);
  const t = ENKEL[naam] ?? MET_OPTIES[naam];
  t?.teken(c, o);
}

/** Waar in de grote maandkalender een datum staat (in punten van het ontwerpvak 560 × 380). */
export function plekInGroteMaand(n: number) {
  const { kol, rij } = plekInMaand(n);
  const cb = (560 - 48) / 7;
  return { x: 24 + kol * cb + cb / 2, y: 90 + rij * 54 + 27, b: cb, h: 54 };
}
