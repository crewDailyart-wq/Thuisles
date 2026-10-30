/**
 * Plaatjes voor de lessen "Meer, minder, evenveel" naar Squla groep 3
 * (30 oktober 2026, opdracht eigenaar). Alles eigen tekenwerk in code (geen
 * plaatjes van Squla, geen AI-plaatjes, geen emoji's): appels, sterren,
 * bloemen, vissen, ballen, kralen, koekjes, eieren in een doosje,
 * lieveheersbeestjes, vlinders, en de potjes en vliegers met een getal voor
 * het op volgorde zetten.
 *
 * Een voorwerp past in een vak van 64 × 64 punten. De scène tekent het één
 * keer (canvasPlaatje) en bakt er één keer een zachte gloed omheen (bak, met
 * de centrale sterkte). Geen live filters (HARDE REGEL 7).
 */

export type MMKleur = "rood" | "oranje" | "geel" | "groen" | "blauw" | "paars" | "roze" | "bruin" | "wit";

/** De kleur van een voorwerp; de namen zijn dezelfde als in de zinnen van Bliepo ({12:rood}). */
export const MM_KLEUR: Record<MMKleur, string> = {
  rood: "#ff5c6e",
  oranje: "#ffa04d",
  geel: "#ffd93d",
  groen: "#5fd877",
  blauw: "#5f9dff",
  paars: "#b47bff",
  roze: "#ff86cc",
  bruin: "#c98a4b",
  wit: "#f3efe4",
};

export type MMSoort = "appel" | "ster" | "bloem" | "vis" | "bal" | "kraal" | "koekje" | "ei" | "lieveheersbeestje" | "vlinder";

export const MM_MAAT = 64;

export const mmHex = (h: string) => parseInt(h.slice(1), 16);

function rgb(hex: string) {
  const n = mmHex(hex);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
/** Lichter (f naar 1 = wit) of donkerder (f negatief, naar -1 = zwart). */
export function mmTint(hex: string, f: number): string {
  const [r, g, b] = rgb(hex);
  const m = (x: number) => Math.round(f >= 0 ? x + (255 - x) * f : x * (1 + f));
  return `rgb(${m(r)},${m(g)},${m(b)})`;
}

type C = CanvasRenderingContext2D;

function rand(c: C, kleur: string, breed = 2.2) {
  c.strokeStyle = mmTint(kleur, -0.45);
  c.lineWidth = breed;
  c.lineJoin = "round";
  c.lineCap = "round";
  c.stroke();
}

function stip(c: C, x: number, y: number, r: number) {
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.fill();
}

function glans(c: C, x: number, y: number, r: number) {
  c.beginPath();
  c.ellipse(x, y, r, r * 0.6, -0.6, 0, Math.PI * 2);
  c.fillStyle = "rgba(255,255,255,0.55)";
  c.fill();
}

function appel(c: C, k: string) {
  c.beginPath();
  c.moveTo(32, 18);
  c.bezierCurveTo(22, 10, 8, 16, 9, 32);
  c.bezierCurveTo(10, 48, 22, 58, 32, 54);
  c.bezierCurveTo(42, 58, 54, 48, 55, 32);
  c.bezierCurveTo(56, 16, 42, 10, 32, 18);
  c.closePath();
  c.fillStyle = k;
  c.fill();
  rand(c, k);
  glans(c, 21, 28, 5);
  /* steeltje en blaadje */
  c.beginPath();
  c.moveTo(32, 19);
  c.quadraticCurveTo(31, 11, 35, 6);
  c.strokeStyle = "#7a4a22";
  c.lineWidth = 3;
  c.lineCap = "round";
  c.stroke();
  c.beginPath();
  c.ellipse(41, 11, 7, 3.6, -0.5, 0, Math.PI * 2);
  c.fillStyle = "#4fc35e";
  c.fill();
}

function ster(c: C, k: string) {
  c.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? 11 : 26;
    const h = -Math.PI / 2 + (i * Math.PI) / 5;
    const x = 32 + r * Math.cos(h);
    const y = 34 + r * Math.sin(h);
    if (i) c.lineTo(x, y);
    else c.moveTo(x, y);
  }
  c.closePath();
  c.fillStyle = k;
  c.fill();
  rand(c, k);
  glans(c, 27, 27, 4);
}

function bloem(c: C, k: string) {
  for (let i = 0; i < 5; i++) {
    const h = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    c.beginPath();
    c.arc(32 + 14 * Math.cos(h), 32 + 14 * Math.sin(h), 11, 0, Math.PI * 2);
    c.fillStyle = k;
    c.fill();
    rand(c, k, 1.8);
  }
  c.beginPath();
  c.arc(32, 32, 9, 0, Math.PI * 2);
  c.fillStyle = "#ffd93d";
  c.fill();
  rand(c, "#ffd93d", 1.8);
}

function vis(c: C, k: string) {
  /* staart */
  c.beginPath();
  c.moveTo(14, 32);
  c.lineTo(3, 20);
  c.lineTo(5, 44);
  c.closePath();
  c.fillStyle = mmTint(k, -0.15);
  c.fill();
  rand(c, k, 1.8);
  /* lijf */
  c.beginPath();
  c.ellipse(34, 32, 23, 15, 0, 0, Math.PI * 2);
  c.fillStyle = k;
  c.fill();
  rand(c, k);
  /* vinnetje en oog */
  c.beginPath();
  c.moveTo(30, 18);
  c.quadraticCurveTo(36, 10, 42, 19);
  c.fillStyle = mmTint(k, -0.15);
  c.fill();
  c.beginPath();
  c.arc(46, 28, 4.2, 0, Math.PI * 2);
  c.fillStyle = "#ffffff";
  c.fill();
  c.beginPath();
  c.arc(47, 28, 2.2, 0, Math.PI * 2);
  c.fillStyle = "#1b2140";
  c.fill();
}

function bal(c: C, k: string) {
  c.beginPath();
  c.arc(32, 32, 24, 0, Math.PI * 2);
  c.fillStyle = k;
  c.fill();
  c.save();
  c.clip();
  c.fillStyle = "#ffffff";
  c.fillRect(8, 26, 48, 12);
  c.restore();
  c.beginPath();
  c.arc(32, 32, 24, 0, Math.PI * 2);
  rand(c, k);
  glans(c, 23, 21, 5);
}

function kraal(c: C, k: string) {
  c.beginPath();
  c.arc(32, 32, 23, 0, Math.PI * 2);
  const g = c.createRadialGradient(25, 24, 3, 32, 32, 24);
  g.addColorStop(0, mmTint(k, 0.55));
  g.addColorStop(1, k);
  c.fillStyle = g;
  c.fill();
  rand(c, k);
  /* het gaatje */
  c.beginPath();
  c.arc(32, 32, 5, 0, Math.PI * 2);
  c.fillStyle = mmTint(k, -0.55);
  c.fill();
}

function koekje(c: C, k: string) {
  c.beginPath();
  c.arc(32, 32, 24, 0, Math.PI * 2);
  c.fillStyle = k;
  c.fill();
  rand(c, k);
  c.fillStyle = "#5a321a";
  for (const [x, y, r] of [
    [24, 22, 3.6],
    [40, 26, 3.2],
    [30, 38, 3.4],
    [43, 41, 2.8],
    [19, 38, 2.6],
  ])
    stip(c, x, y, r);
}

function ei(c: C, k: string) {
  c.beginPath();
  c.moveTo(32, 8);
  c.bezierCurveTo(48, 8, 54, 34, 52, 42);
  c.bezierCurveTo(50, 54, 40, 58, 32, 58);
  c.bezierCurveTo(24, 58, 14, 54, 12, 42);
  c.bezierCurveTo(10, 34, 16, 8, 32, 8);
  c.closePath();
  c.fillStyle = k;
  c.fill();
  rand(c, k);
  glans(c, 24, 24, 5);
}

function lieveheersbeestje(c: C, k: string) {
  /* kopje */
  c.beginPath();
  c.arc(32, 15, 9, 0, Math.PI * 2);
  c.fillStyle = "#1b2140";
  c.fill();
  /* schild */
  c.beginPath();
  c.ellipse(32, 36, 21, 20, 0, 0, Math.PI * 2);
  c.fillStyle = k;
  c.fill();
  rand(c, k);
  c.beginPath();
  c.moveTo(32, 17);
  c.lineTo(32, 56);
  c.strokeStyle = "#1b2140";
  c.lineWidth = 2.4;
  c.stroke();
  c.fillStyle = "#1b2140";
  for (const [x, y] of [
    [23, 29],
    [41, 29],
    [21, 42],
    [43, 42],
    [32, 47],
  ])
    stip(c, x, y, 3.6);
  /* oogjes */
  c.fillStyle = "#ffffff";
  c.beginPath();
  c.arc(28.5, 13, 2, 0, Math.PI * 2);
  c.arc(35.5, 13, 2, 0, Math.PI * 2);
  c.fill();
}

function vlinder(c: C, k: string) {
  const vleugel = (x: number, y: number, rx: number, ry: number, h: number) => {
    c.beginPath();
    c.ellipse(x, y, rx, ry, h, 0, Math.PI * 2);
    c.fillStyle = k;
    c.fill();
    rand(c, k, 1.8);
  };
  vleugel(20, 23, 14, 11, -0.5);
  vleugel(44, 23, 14, 11, 0.5);
  vleugel(22, 43, 10, 9, 0.4);
  vleugel(42, 43, 10, 9, -0.4);
  c.fillStyle = "rgba(255,255,255,0.6)";
  for (const [x, y] of [
    [18, 22],
    [46, 22],
  ])
    stip(c, x, y, 4);
  /* lijfje en sprieten */
  c.beginPath();
  c.ellipse(32, 34, 3.6, 17, 0, 0, Math.PI * 2);
  c.fillStyle = "#1b2140";
  c.fill();
  c.beginPath();
  c.moveTo(31, 18);
  c.quadraticCurveTo(26, 9, 22, 8);
  c.moveTo(33, 18);
  c.quadraticCurveTo(38, 9, 42, 8);
  c.strokeStyle = "#1b2140";
  c.lineWidth = 2;
  c.stroke();
}

const TEKEN: Record<MMSoort, (c: C, k: string) => void> = {
  appel,
  ster,
  bloem,
  vis,
  bal,
  kraal,
  koekje,
  ei,
  lieveheersbeestje,
  vlinder,
};

/** Teken een voorwerp in een vak van 64 × 64. */
export function mmTeken(c: C, soort: MMSoort, kleur: string) {
  TEKEN[soort](c, kleur);
}

/** Een eierdoosje voor 6 eieren (3 × 2), in een vak van `b` × `h`. */
export function mmDoos(c: C, b: number, h: number) {
  c.beginPath();
  c.roundRect(3, 3, b - 6, h - 6, 14);
  c.fillStyle = "#b9895a";
  c.fill();
  c.strokeStyle = "#6e4a2a";
  c.lineWidth = 3;
  c.stroke();
  c.fillStyle = "rgba(110,74,42,0.35)";
  const cw = (b - 6) / 3;
  const ch = (h - 6) / 2;
  for (let r = 0; r < 2; r++)
    for (let k = 0; k < 3; k++) {
      c.beginPath();
      c.ellipse(3 + cw * (k + 0.5), 3 + ch * (r + 0.5), cw * 0.38, ch * 0.38, 0, 0, Math.PI * 2);
      c.fill();
    }
}

/* ---------- dingen met een getal (op volgorde zetten) ---------- */

export type MMDing = "potje" | "vlieger";
export const DING_B = 150;
export const DING_H = 170;

function getalTekst(c: C, n: number, x: number, y: number, maat: number, kleur: string) {
  c.font = `800 ${maat}px "Work Sans", system-ui, sans-serif`;
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.lineWidth = 6;
  c.strokeStyle = "rgba(255,255,255,0.9)";
  c.strokeText(String(n), x, y);
  c.fillStyle = kleur;
  c.fillText(String(n), x, y);
}

/** Een potje met een deksel en een etiket met het getal (150 × 170). */
function potje(c: C, n: number) {
  const glas = "#9fd8ff";
  c.beginPath();
  c.roundRect(22, 34, 106, 126, 24);
  c.fillStyle = "rgba(159,216,255,0.35)";
  c.fill();
  c.strokeStyle = glas;
  c.lineWidth = 4;
  c.stroke();
  /* deksel */
  c.beginPath();
  c.roundRect(30, 12, 90, 28, 9);
  c.fillStyle = "#ff8f5a";
  c.fill();
  c.strokeStyle = "#b5532a";
  c.lineWidth = 3;
  c.stroke();
  /* etiket */
  c.beginPath();
  c.roundRect(32, 64, 86, 70, 14);
  c.fillStyle = "#fff8e8";
  c.fill();
  c.strokeStyle = "#d9b778";
  c.lineWidth = 3;
  c.stroke();
  getalTekst(c, n, 75, 100, 50, "#1e2a5c");
}

/** Een vlieger met een staartje en het getal (150 × 170). */
function vlieger(c: C, n: number) {
  /* staartje */
  c.beginPath();
  c.moveTo(75, 132);
  c.bezierCurveTo(60, 145, 92, 152, 76, 166);
  c.strokeStyle = "#ffd93d";
  c.lineWidth = 3;
  c.stroke();
  for (const [x, y] of [
    [68, 145],
    [80, 157],
  ]) {
    c.beginPath();
    c.moveTo(x - 7, y - 5);
    c.lineTo(x + 7, y + 5);
    c.lineTo(x + 7, y - 5);
    c.lineTo(x - 7, y + 5);
    c.closePath();
    c.fillStyle = "#ff86cc";
    c.fill();
  }
  /* de vlieger zelf: vier vlakken */
  const top = [75, 6];
  const l = [14, 62];
  const r = [136, 62];
  const o = [75, 134];
  const mid = [75, 62];
  const vlak = (a: number[], b: number[], kleur: string) => {
    c.beginPath();
    c.moveTo(a[0], a[1]);
    c.lineTo(b[0], b[1]);
    c.lineTo(mid[0], mid[1]);
    c.closePath();
    c.fillStyle = kleur;
    c.fill();
  };
  vlak(top, l, "#5f9dff");
  vlak(top, r, "#ff5c6e");
  vlak(l, o, "#ffd93d");
  vlak(r, o, "#5fd877");
  c.beginPath();
  c.moveTo(top[0], top[1]);
  c.lineTo(r[0], r[1]);
  c.lineTo(o[0], o[1]);
  c.lineTo(l[0], l[1]);
  c.closePath();
  c.strokeStyle = "#ffffff";
  c.lineWidth = 3;
  c.stroke();
  /* een rondje voor het getal */
  c.beginPath();
  c.arc(75, 66, 34, 0, Math.PI * 2);
  c.fillStyle = "#fff8e8";
  c.fill();
  c.strokeStyle = "#1e2a5c";
  c.lineWidth = 3;
  c.stroke();
  getalTekst(c, n, 75, 68, 42, "#1e2a5c");
}

export function mmTekenDing(c: C, ding: MMDing, n: number) {
  if (ding === "potje") potje(c, n);
  else vlieger(c, n);
}
