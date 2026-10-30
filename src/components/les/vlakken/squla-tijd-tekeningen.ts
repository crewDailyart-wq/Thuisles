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

const N: string = PALET.navy;
const GROEN = "#55c26f";
const GROEN_LICHT = "#c9efd2";
const LUCHT = "#9fd8ff";
const HOUT = "#c98b55";
const HOUT_DONKER = "#8a5a33";
const GRIJS = "#cfd4de";
const ROOD = "#e8453c";
const PAARS = "#a986ec";
const ROZE = "#f594c6";

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

function feesthoed(c: C) {
  v(c, "M 60 10 L 96 104 Q 60 118 24 104 Z", PALET.koraal, RAND);
  v(c, "M 42 60 L 78 52 M 34 84 L 88 76", undefined, RAND_DUN, PALET.geel);
  v(c, cirkel(60, 12, 9), PALET.geel);
  v(c, cirkel(52, 40, 4), PALET.warmwit, 2);
  v(c, cirkel(70, 96, 4), PALET.warmwit, 2);
}

function ballon(c: C) {
  v(c, "M 60 92 Q 54 104 62 114 Q 68 122 58 130", undefined, 3);
  v(c, "M 60 92 C 24 80 22 18 60 14 C 98 18 96 80 60 92 Z", ROOD, RAND);
  v(c, "M 54 92 L 66 92 L 60 100 Z", ROOD, 3);
  v(c, "M 44 34 Q 48 26 56 24", undefined, 4, PALET.warmwit);
}

function thermometer(c: C) {
  v(c, blok(48, 10, 24, 80, 12), PALET.warmwit, RAND);
  v(c, cirkel(60, 96, 18), ROOD, RAND);
  v(c, blok(55, 40, 10, 50, 5), ROOD, 0, undefined);
  for (let i = 0; i < 4; i++) v(c, `M 72 ${24 + i * 14} h 10`, undefined, 3);
}

function tand(c: C) {
  v(c, "M 30 30 C 30 10 52 12 60 20 C 68 12 90 10 90 30 C 90 52 84 62 82 82 C 80 104 70 108 66 92 C 64 82 56 82 54 92 C 50 108 40 104 38 82 C 36 62 30 52 30 30 Z", PALET.warmwit, RAND);
  v(c, "M 42 30 Q 46 22 54 24", undefined, 3, PALET.petrolLicht);
}

function duim(c: C, op: boolean) {
  c.save();
  if (!op) {
    c.translate(120, 120);
    c.rotate(Math.PI);
  }
  v(c, "M 34 58 h 18 v 46 h -18 Z", PALET.petrol, RAND);
  v(c, "M 52 60 L 66 24 C 70 14 84 16 82 30 L 78 52 H 98 C 108 52 110 62 104 68 C 110 72 108 82 101 84 C 106 89 103 98 96 99 C 99 104 95 110 88 110 H 52 Z", PALET.geel, RAND);
  v(c, "M 80 68 H 102 M 80 84 H 99 M 80 99 H 94", undefined, 3);
  c.restore();
}

/* Activiteiten op school (dagritme en dagkalender). */
function kring(c: C) {
  v(c, "M 14 82 a 46 22 0 1 0 92 0 a 46 22 0 1 0 -92 0 Z", PALET.petrolLicht, RAND_DUN);
  const plekken: [number, number, string][] = [
    [60, 50, PALET.koraal],
    [24, 66, PALET.geel],
    [96, 66, GROEN],
    [36, 96, PAARS],
    [84, 96, LUCHT],
  ];
  for (const [x, y, k] of plekken) {
    v(c, blok(x - 11, y, 22, 18, 8), k, 3);
    v(c, cirkel(x, y - 6, 10), PALET.warmwit, 3);
  }
}

function rekenen(c: C) {
  v(c, blok(18, 14, 84, 96, 8), PALET.warmwit, RAND);
  tekst(c, "1+2", 60, 46, 30, N);
  tekst(c, "3+1", 60, 84, 30, PALET.petrol);
}

function gym(c: C) {
  v(c, "M 18 70 a 42 42 0 1 0 84 0 a 42 42 0 1 0 -84 0 Z", undefined, 8, PALET.koraal);
  v(c, cirkel(60, 70, 22), PALET.geel, RAND);
  v(c, "M 40 66 Q 60 56 80 66 M 44 82 Q 60 90 76 82", undefined, 3);
}

function buiten(c: C) {
  v(c, "M 14 112 L 34 14 L 86 14 L 106 112", undefined, RAND, HOUT_DONKER);
  v(c, "M 30 14 H 90", undefined, RAND, HOUT_DONKER);
  v(c, "M 48 16 V 78 M 72 16 V 78", undefined, 3);
  v(c, blok(40, 76, 40, 10, 4), PALET.koraal, 3);
}

function eten(c: C) {
  v(c, "M 60 36 C 40 22 16 34 20 62 C 24 92 46 106 60 98 C 74 106 96 92 100 62 C 104 34 80 22 60 36 Z", ROOD, RAND);
  v(c, "M 60 36 Q 58 22 64 14", undefined, 4, HOUT_DONKER);
  v(c, "M 64 22 Q 78 10 88 20 Q 76 30 64 22 Z", GROEN, 3);
}

function lezen(c: C) {
  v(c, "M 60 30 C 46 20 24 20 10 26 V 96 C 24 90 46 90 60 100 Z", PALET.petrolLicht, RAND_DUN);
  v(c, "M 60 30 C 74 20 96 20 110 26 V 96 C 96 90 74 90 60 100 Z", PALET.petrolLicht, RAND_DUN);
  v(c, "M 22 44 h 26 M 22 58 h 26 M 22 72 h 26 M 72 44 h 26 M 72 58 h 26 M 72 72 h 26", undefined, 3);
}

function fruit(c: C) {
  v(c, "M 26 34 C 20 70 44 104 92 96 C 96 92 94 88 90 88 C 54 90 40 64 40 34 Z", PALET.geel, RAND);
  v(c, "M 30 28 L 38 30", undefined, 5, HOUT_DONKER);
  v(c, cirkel(80, 50, 20), ROOD, RAND);
  v(c, "M 80 30 Q 82 22 88 18", undefined, 3, HOUT_DONKER);
}

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

/** Een verjaardagskalender als lijst, groot (ontwerpvak 420 × 380). */
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
  tekst(c, o.naam ?? "Ravi", 93, 81, 20, N);
}

/** Een gedachtewolk: Noa droomt van een stukje kalender (ontwerpvak 420 × 260). */
function droom(c: C, o: Record<string, string>) {
  v(c, "M 70 216 a 16 12 0 1 0 32 0 a 16 12 0 1 0 -32 0 Z M 34 244 a 10 8 0 1 0 20 0 a 10 8 0 1 0 -20 0 Z", PALET.warmwit, 3);
  v(c, "M 110 190 C 40 200 30 120 84 110 C 76 50 160 30 190 66 C 220 20 320 30 320 86 C 390 86 400 170 340 184 C 330 220 250 222 230 196 C 200 226 130 220 110 190 Z", PALET.warmwit, RAND);
  c.save();
  c.translate(84, 64);
  c.scale(0.72, 0.72);
  stukje(c, o);
  c.restore();
  tekst(c, "z", 380, 40, 30, PALET.warmwit);
  tekst(c, "z", 400, 14, 22, PALET.warmwit);
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

function uil(c: C) {
  v(c, "M 30 110 C 18 70 26 26 60 22 C 94 26 102 70 90 110 Z", HOUT, RAND);
  v(c, "M 34 26 L 38 8 L 50 22 M 86 26 L 82 8 L 70 22", HOUT, RAND_DUN);
  v(c, "M 42 76 C 46 100 74 100 78 76 C 74 66 46 66 42 76 Z", PALET.koraalLicht, 3);
  v(c, cirkel(46, 50, 14), PALET.warmwit, 3);
  v(c, cirkel(74, 50, 14), PALET.warmwit, 3);
  v(c, cirkel(46, 50, 6), N, 0);
  v(c, cirkel(74, 50, 6), N, 0);
  v(c, "M 54 62 L 60 72 L 66 62 Z", PALET.geel, 2.5);
}

function vos(c: C) {
  v(c, "M 24 22 L 40 54 L 80 54 L 96 22 L 70 40 L 50 40 Z", PALET.koraal, RAND);
  v(c, "M 20 52 C 22 30 98 30 100 52 C 98 76 76 100 60 108 C 44 100 22 76 20 52 Z", "#f28a3d", RAND);
  v(c, "M 36 70 C 46 92 74 92 84 70 C 74 82 46 82 36 70 Z", PALET.warmwit, 3);
  v(c, cirkel(44, 56, 5), N, 0);
  v(c, cirkel(76, 56, 5), N, 0);
  v(c, cirkel(60, 98, 6), N, 0);
}

function egel(c: C) {
  v(c, "M 14 92 L 20 60 L 10 46 L 30 40 L 28 20 L 48 30 L 60 12 L 70 30 L 90 22 L 88 42 L 108 48 L 98 62 L 106 92 Z", HOUT_DONKER, RAND);
  v(c, "M 30 96 C 30 70 90 70 90 96 Z", "#f0d1a8", RAND_DUN);
  v(c, "M 44 66 C 52 52 68 52 76 66 L 60 74 Z", "#f0d1a8", 3);
  v(c, cirkel(52, 62, 4), N, 0);
  v(c, cirkel(68, 62, 4), N, 0);
  v(c, cirkel(60, 72, 5), N, 0);
}

function kikker(c: C) {
  v(c, "M 18 72 C 18 40 102 40 102 72 C 102 104 18 104 18 72 Z", GROEN, RAND);
  v(c, cirkel(38, 40, 16), GROEN, RAND);
  v(c, cirkel(82, 40, 16), GROEN, RAND);
  v(c, cirkel(38, 40, 8), PALET.warmwit, 2.5);
  v(c, cirkel(82, 40, 8), PALET.warmwit, 2.5);
  v(c, cirkel(39, 41, 4), N, 0);
  v(c, cirkel(83, 41, 4), N, 0);
  v(c, "M 40 78 Q 60 92 80 78", undefined, 4);
}

function kampvuur(c: C) {
  v(c, "M 40 200 L 280 160 M 40 160 L 280 200", undefined, 22, HOUT_DONKER);
  v(c, "M 40 200 L 280 160 M 40 160 L 280 200", undefined, 14, HOUT);
  v(c, "M 160 30 C 210 80 240 120 220 160 C 205 186 115 186 100 160 C 80 120 110 80 130 60 C 132 90 146 100 152 96 C 150 70 150 50 160 30 Z", "#ff8a3d", RAND);
  v(c, "M 160 90 C 190 120 196 150 180 166 C 170 176 150 176 140 166 C 128 150 138 124 150 110 C 154 126 162 128 164 124 C 162 112 160 100 160 90 Z", PALET.geel, 3);
}

/* De bakkerij en wat er gebeurt. */
function bed(c: C) {
  v(c, "M 10 98 V 30 M 110 98 V 58", undefined, RAND, HOUT_DONKER);
  v(c, blok(10, 62, 100, 26, 6), PALET.petrolLicht, RAND);
  v(c, blok(14, 48, 30, 18, 8), PALET.warmwit, 3);
  v(c, "M 44 62 C 50 46 104 46 110 62 Z", PALET.koraal, RAND_DUN);
  tekst(c, "z", 76, 22, 22, N);
  tekst(c, "z", 92, 10, 16, N);
}

function boterham(c: C) {
  v(c, "M 22 104 V 44 C 10 40 10 14 34 14 H 86 C 110 14 110 40 98 44 V 104 Z", "#e9b979", RAND);
  v(c, "M 32 94 V 48 C 22 44 24 26 38 26 H 82 C 96 26 98 44 88 48 V 94 Z", "#fbe2b8", 3);
  v(c, "M 36 58 C 50 50 70 66 84 56", undefined, 5, ROOD);
}

function bakkerij(c: C) {
  v(c, blok(14, 40, 92, 72, 4), PALET.warmwit, RAND);
  v(c, "M 8 40 L 20 18 H 100 L 112 40 Z", PALET.koraal, RAND);
  v(c, "M 32 18 L 26 40 M 52 18 L 50 40 M 68 18 L 70 40 M 88 18 L 94 40", undefined, 3);
  v(c, blok(24, 60, 34, 52, 3), PALET.petrol, 3);
  v(c, blok(66, 58, 32, 26, 3), LUCHT, 3);
  v(c, "M 70 78 C 72 68 92 68 94 78 Z", "#e9b979", 2.5);
}

function schoen(c: C) {
  v(c, "M 14 92 V 44 C 30 40 40 44 46 54 L 70 66 C 98 70 108 78 108 92 Z", PALET.koraal, RAND);
  v(c, "M 14 92 H 108 V 102 H 14 Z", N, 3);
  v(c, "M 46 56 l 10 -6 M 54 60 l 10 -6", undefined, 3, PALET.warmwit);
}

function deegkom(c: C) {
  v(c, "M 26 58 C 26 50 94 50 94 58 C 92 78 82 96 60 96 C 38 96 28 78 26 58 Z", "#f0d1a8", RAND_DUN);
  v(c, "M 14 58 H 106 C 104 92 86 108 60 108 C 34 108 16 92 14 58 Z", PALET.petrol, RAND);
  v(c, "M 70 14 L 82 54", undefined, 6, HOUT);
}

function strooibus(c: C) {
  v(c, blok(38, 40, 44, 66, 8), PALET.warmwit, RAND);
  v(c, "M 36 40 C 36 22 84 22 84 40 Z", GRIJS, RAND);
  for (const [x, y] of [[50, 32], [60, 30], [70, 32]]) v(c, cirkel(x, y, 2), N, 0);
  for (const [x, y] of [[20, 20], [28, 12], [92, 16], [100, 26], [96, 8]]) v(c, cirkel(x, y, 3), PALET.warmwit, 1.5);
}

function taart(c: C) {
  v(c, "M 16 64 H 104 V 104 H 16 Z", "#f6c9a0", RAND);
  v(c, "M 16 64 C 16 48 104 48 104 64 C 104 76 96 70 90 76 C 84 82 76 70 66 76 C 58 82 50 70 42 76 C 34 82 28 70 16 76 Z", PALET.warmwit, RAND_DUN);
  v(c, "M 16 88 H 104", undefined, 3, PALET.koraal);
}

function kers(c: C) {
  v(c, "M 54 60 Q 58 30 80 14", undefined, 4, HOUT_DONKER);
  v(c, "M 80 14 Q 96 10 100 22 Q 88 28 80 14 Z", GROEN, 2.5);
  v(c, cirkel(52, 80, 24), ROOD, RAND);
  v(c, "M 40 72 Q 44 64 52 64", undefined, 4, PALET.warmwit);
}

function oven(c: C, inhoud?: string) {
  v(c, blok(12, 12, 96, 96, 8), GRIJS, RAND);
  v(c, blok(22, 34, 76, 62, 6), "#3a3f5c", RAND_DUN);
  for (const x of [32, 52, 72, 92]) v(c, cirkel(x - 4, 23, 4), N, 0);
  if (inhoud === "brood") v(c, "M 32 86 C 30 60 90 60 88 86 Z", "#e9b979", 3);
  if (inhoud === "taart") v(c, "M 34 88 V 70 H 86 V 88 Z", "#f6c9a0", 3);
  v(c, "M 30 42 H 90", undefined, 3, "#ff8a3d");
}

function koekje(c: C) {
  v(c, cirkel(60, 60, 40), "#e9b979", RAND);
  for (const [x, y] of [[44, 46], [70, 40], [58, 66], [80, 70], [40, 76]]) v(c, cirkel(x, y, 5), HOUT_DONKER, 0);
}

function sleutel(c: C) {
  v(c, cirkel(36, 60, 22), PALET.geel, RAND);
  v(c, cirkel(36, 60, 8), PALET.warmwit, 3);
  v(c, "M 58 54 H 108 V 66 H 98 V 78 H 88 V 66 H 78 V 74 H 68 V 66 H 58 Z", PALET.geel, RAND_DUN);
}

function bezem(c: C) {
  v(c, "M 88 10 L 52 70", undefined, 7, HOUT_DONKER);
  v(c, "M 40 62 L 66 78 L 54 112 L 14 92 Z", PALET.geel, RAND);
  v(c, "M 26 96 L 42 72 M 38 102 L 52 76 M 48 108 L 60 82", undefined, 2.5);
}

function glas(c: C) {
  v(c, "M 34 14 H 86 L 78 108 H 42 Z", PALET.warmwit, RAND);
  v(c, "M 38 46 H 82 L 77 104 H 43 Z", LUCHT, 0, undefined);
  v(c, "M 34 14 H 86 L 78 108 H 42 Z", undefined, RAND);
}

function fiets(c: C) {
  v(c, cirkel(30, 80, 22), undefined, RAND);
  v(c, cirkel(90, 80, 22), undefined, RAND);
  v(c, "M 30 80 L 52 50 L 82 50 L 90 80 M 52 50 L 60 80 L 82 50 M 60 80 L 30 80", undefined, RAND_DUN, PALET.koraal);
  v(c, "M 46 40 H 60 M 82 50 L 78 36 H 90", undefined, 4);
}

function ei(c: C) {
  v(c, "M 60 14 C 90 14 104 70 92 92 C 82 110 38 110 28 92 C 16 70 30 14 60 14 Z", PALET.warmwit, RAND);
  v(c, "M 44 40 Q 48 30 56 28", undefined, 3, GRIJS);
}

function jas(c: C) {
  v(c, "M 40 16 L 22 26 L 10 70 L 26 74 L 30 56 V 108 H 90 V 56 L 94 74 L 110 70 L 98 26 L 80 16 C 72 28 48 28 40 16 Z", PALET.petrol, RAND);
  v(c, "M 60 26 V 108", undefined, 3);
  for (const y of [48, 66, 84]) v(c, cirkel(66, y, 3), PALET.geel, 1.5);
}

function brood(c: C) {
  v(c, "M 12 84 C 8 40 112 40 108 84 C 108 96 12 96 12 84 Z", "#e9b979", RAND);
  v(c, "M 34 58 L 44 74 M 56 54 L 66 72 M 78 56 L 88 72", undefined, 3, HOUT_DONKER);
}

function tent(c: C) {
  v(c, "M 10 104 L 60 18 L 110 104 Z", GROEN, RAND);
  v(c, "M 60 18 L 46 104 H 74 Z", GROEN_LICHT, RAND_DUN);
  v(c, "M 4 104 H 116", undefined, RAND);
}

function bord(c: C) {
  v(c, cirkel(60, 64, 44), PALET.warmwit, RAND);
  v(c, cirkel(60, 64, 28), undefined, 3, GRIJS);
  for (const [x, y] of [[96, 22], [106, 34], [88, 12]]) v(c, cirkel(x, y, 6), LUCHT, 2);
}

function beslag(c: C) {
  deegkom(c);
  v(c, "M 74 10 C 64 30 80 44 72 56 M 84 12 C 78 30 90 44 80 56", undefined, 3, GRIJS);
}

function taartKaars(c: C) {
  taart(c);
  v(c, blok(56, 26, 8, 26, 2), ROZE, 2.5);
  v(c, "M 60 8 C 66 16 66 22 60 24 C 54 22 54 16 60 8 Z", "#ff8a3d", 2);
}

function schaar(c: C) {
  v(c, "M 40 20 L 78 86 M 80 20 L 42 86", undefined, 7, GRIJS);
  v(c, "M 40 20 L 78 86 M 80 20 L 42 86", undefined, RAND_DUN);
  v(c, cirkel(36, 94, 14), PALET.koraal, RAND);
  v(c, cirkel(84, 94, 14), PALET.koraal, RAND);
  v(c, cirkel(60, 58, 4), N, 0);
}

function zwemmen(c: C) {
  v(c, "M 6 60 Q 21 48 36 60 T 66 60 T 96 60 T 114 56 V 110 H 6 Z", LUCHT, RAND_DUN);
  v(c, "M 6 84 Q 21 72 36 84 T 66 84 T 96 84 T 114 80", undefined, RAND_DUN, PALET.warmwit);
  v(c, cirkel(60, 34, 18), PALET.koraal, RAND);
  v(c, "M 44 30 H 76", undefined, 4, PALET.warmwit);
}

function huis(c: C) {
  v(c, blok(22, 52, 76, 58, 4), PALET.warmwit, RAND);
  v(c, "M 12 56 L 60 14 L 108 56 Z", PALET.koraal, RAND);
  v(c, blok(50, 76, 22, 34, 3), PALET.petrol, 3);
  v(c, blok(30, 64, 14, 14, 2), PALET.geel, 2.5);
  v(c, blok(78, 64, 14, 14, 2), PALET.geel, 2.5);
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

/* ---------- het register ---------- */

type Tekening = { b: number; h: number; teken: (c: C, o: Record<string, string>) => void };

const ENKEL: Record<string, Tekening> = {
  feesthoed: { b: 120, h: 130, teken: feesthoed },
  ballon: { b: 120, h: 134, teken: ballon },
  thermometer: { b: 120, h: 120, teken: thermometer },
  tand: { b: 120, h: 120, teken: tand },
  duimop: { b: 120, h: 120, teken: (c) => duim(c, true) },
  duimneer: { b: 120, h: 120, teken: (c) => duim(c, false) },
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
  uil: { b: 120, h: 120, teken: uil },
  vos: { b: 120, h: 120, teken: vos },
  egel: { b: 120, h: 120, teken: egel },
  kikker: { b: 120, h: 120, teken: kikker },
  kampvuur: { b: 320, h: 220, teken: kampvuur },
  bed: { b: 120, h: 110, teken: bed },
  boterham: { b: 120, h: 120, teken: boterham },
  bakkerij: { b: 120, h: 120, teken: bakkerij },
  schoen: { b: 120, h: 112, teken: schoen },
  deegkom: { b: 120, h: 120, teken: deegkom },
  strooibus: { b: 120, h: 120, teken: strooibus },
  taart: { b: 120, h: 112, teken: taart },
  kers: { b: 120, h: 112, teken: kers },
  oven: { b: 120, h: 120, teken: (c) => oven(c, "brood") },
  koekje: { b: 120, h: 120, teken: koekje },
  sleutel: { b: 120, h: 120, teken: sleutel },
  bezem: { b: 120, h: 120, teken: bezem },
  glas: { b: 120, h: 120, teken: glas },
  fiets: { b: 120, h: 110, teken: fiets },
  ei: { b: 120, h: 120, teken: ei },
  jas: { b: 120, h: 120, teken: jas },
  brood: { b: 120, h: 100, teken: brood },
  tent: { b: 120, h: 112, teken: tent },
  bord: { b: 120, h: 112, teken: bord },
  beslag: { b: 120, h: 120, teken: beslag },
  taartoven: { b: 120, h: 120, teken: (c) => oven(c, "taart") },
  taartkaars: { b: 120, h: 112, teken: taartKaars },
  schaar: { b: 120, h: 112, teken: schaar },
  vraag: { b: 120, h: 120, teken: vraagteken },
  zwemmen: { b: 120, h: 112, teken: zwemmen },
  huis: { b: 120, h: 112, teken: huis },
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
