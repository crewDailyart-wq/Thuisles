/**
 * Plaatjes voor de lessen "Tellen" naar Squla groep 3 (30 oktober 2026,
 * opdracht eigenaar). Alles eigen tekenwerk in code (geen plaatjes van Squla,
 * geen AI-plaatjes): fruit, voertuigen, speelgoed, dieren, monsters,
 * spookjes, knikkers, sterren en een zak met een tiental.
 *
 * Elk voorwerp past in een vak van 96 × 96 punten. De scène tekent het één
 * keer (canvasPlaatje) en bakt er één keer een zachte gloed omheen (bak, met
 * de centrale sterkte). Geen live filters (HARDE REGEL 7).
 */

import { tekenKwal, tekenVisje } from "./tellen-holo-tekenen";

export type Kleurnaam = "rood" | "oranje" | "geel" | "groen" | "blauw" | "paars" | "roze" | "wit";

/** De kleur van een voorwerp; de namen zijn dezelfde als in de zinnen van Bliepo ({12:rood}). */
export const KLEUR: Record<Kleurnaam, string> = {
  rood: "#ff5c7f",
  oranje: "#ffa25a",
  geel: "#ffe24a",
  groen: "#5fd877",
  blauw: "#6f9cff",
  paars: "#c46bff",
  roze: "#ff8fd0",
  wit: "#d8f3ff",
};

export type Soort =
  | "appel"
  | "peer"
  | "pruim"
  | "citroen"
  | "aardbei"
  | "banaan"
  | "auto"
  | "huisje"
  | "raket"
  | "bootje"
  | "bal"
  | "blok"
  | "visje"
  | "kwal"
  | "schildpad"
  | "vogel"
  | "vlinder"
  | "monster"
  | "spookje"
  | "knikker"
  | "ster";

export const MAAT = 96;

export const hexGetal = (h: string) => parseInt(h.slice(1), 16);

function rgb(hex: string) {
  const n = hexGetal(hex);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
/** Lichter (f naar 1 = wit) of donkerder (f negatief, naar -1 = zwart). */
export function tint(hex: string, f: number): string {
  const [r, g, b] = rgb(hex);
  const m = (x: number) => Math.round(f >= 0 ? x + (255 - x) * f : x * (1 + f));
  return `rgb(${m(r)},${m(g)},${m(b)})`;
}

/* ---------- hulpjes ---------- */

function vul(c: CanvasRenderingContext2D, kleur: string, x0 = 32, y0 = 30, r = 62) {
  const g = c.createRadialGradient(x0, y0, 3, 48, 52, r);
  g.addColorStop(0, tint(kleur, 0.62));
  g.addColorStop(0.5, kleur);
  g.addColorStop(1, tint(kleur, -0.18));
  c.fillStyle = g;
  c.fill();
}

function rand(c: CanvasRenderingContext2D, dik = 2.5) {
  c.strokeStyle = "rgba(255,255,255,0.92)";
  c.lineWidth = dik;
  c.lineJoin = "round";
  c.stroke();
}

function glans(c: CanvasRenderingContext2D, x: number, y: number, r: number, van = 1.1, tot = 1.5) {
  c.strokeStyle = "rgba(255,255,255,0.75)";
  c.lineWidth = 3.5;
  c.lineCap = "round";
  c.beginPath();
  c.arc(x, y, r, Math.PI * van, Math.PI * tot);
  c.stroke();
}

function blaadje(c: CanvasRenderingContext2D, x: number, y: number, hoek: number) {
  c.save();
  c.translate(x, y);
  c.rotate(hoek);
  c.beginPath();
  c.ellipse(0, 0, 12, 5.5, 0, 0, Math.PI * 2);
  c.fillStyle = "#5fd877";
  c.fill();
  c.strokeStyle = "rgba(255,255,255,0.85)";
  c.lineWidth = 1.6;
  c.stroke();
  c.restore();
}

function steeltje(c: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
  c.strokeStyle = "#b07a45";
  c.lineWidth = 5;
  c.lineCap = "round";
  c.beginPath();
  c.moveTo(x1, y1);
  c.quadraticCurveTo(x1, (y1 + y2) / 2, x2, y2);
  c.stroke();
}

function oog(c: CanvasRenderingContext2D, x: number, y: number, r: number, kijk = 0.3) {
  c.fillStyle = "#ffffff";
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "#13204a";
  c.beginPath();
  c.arc(x + r * kijk, y, r * 0.5, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "#ffffff";
  c.beginPath();
  c.arc(x + r * kijk - r * 0.18, y - r * 0.2, r * 0.17, 0, Math.PI * 2);
  c.fill();
}

/* ---------- fruit ---------- */

function appel(c: CanvasRenderingContext2D, k: string) {
  c.beginPath();
  c.moveTo(48, 30);
  c.bezierCurveTo(32, 16, 8, 26, 12, 54);
  c.bezierCurveTo(16, 80, 36, 92, 48, 85);
  c.bezierCurveTo(60, 92, 80, 80, 84, 54);
  c.bezierCurveTo(88, 26, 64, 16, 48, 30);
  c.closePath();
  vul(c, k);
  rand(c);
  glans(c, 46, 56, 26, 1.12, 1.38);
  steeltje(c, 48, 32, 54, 10);
  blaadje(c, 64, 17, -0.45);
}

function peer(c: CanvasRenderingContext2D, k: string) {
  c.beginPath();
  c.moveTo(48, 16);
  c.bezierCurveTo(37, 16, 35, 32, 33, 41);
  c.bezierCurveTo(14, 52, 16, 90, 48, 90);
  c.bezierCurveTo(80, 90, 82, 52, 63, 41);
  c.bezierCurveTo(61, 32, 59, 16, 48, 16);
  c.closePath();
  vul(c, k, 36, 40, 60);
  rand(c);
  glans(c, 46, 64, 22, 1.1, 1.38);
  steeltje(c, 48, 18, 52, 5);
  blaadje(c, 62, 11, -0.35);
}

function pruim(c: CanvasRenderingContext2D, k: string) {
  c.beginPath();
  c.ellipse(48, 54, 31, 35, 0.22, 0, Math.PI * 2);
  vul(c, k);
  rand(c);
  c.strokeStyle = "rgba(255,255,255,0.45)";
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(44, 22);
  c.bezierCurveTo(30, 44, 34, 70, 48, 88);
  c.stroke();
  glans(c, 54, 54, 22, 1.2, 1.45);
  steeltje(c, 50, 22, 54, 9);
  blaadje(c, 66, 14, -0.3);
}

function citroen(c: CanvasRenderingContext2D, k: string) {
  c.beginPath();
  c.moveTo(7, 52);
  c.quadraticCurveTo(12, 41, 21, 35);
  c.bezierCurveTo(38, 19, 58, 19, 75, 35);
  c.quadraticCurveTo(84, 41, 89, 52);
  c.quadraticCurveTo(84, 62, 75, 68);
  c.bezierCurveTo(58, 82, 38, 82, 21, 68);
  c.quadraticCurveTo(12, 62, 7, 52);
  c.closePath();
  vul(c, k, 34, 38, 58);
  rand(c);
  glans(c, 48, 54, 22, 1.15, 1.45);
  blaadje(c, 60, 24, -0.25);
}

function aardbei(c: CanvasRenderingContext2D, k: string) {
  c.beginPath();
  c.moveTo(48, 90);
  c.bezierCurveTo(28, 82, 10, 56, 15, 37);
  c.bezierCurveTo(20, 23, 38, 23, 48, 29);
  c.bezierCurveTo(58, 23, 76, 23, 81, 37);
  c.bezierCurveTo(86, 56, 68, 82, 48, 90);
  c.closePath();
  vul(c, k);
  rand(c);
  /* pitjes */
  c.fillStyle = "#fff3a0";
  for (const [x, y] of [
    [30, 42], [48, 40], [66, 42], [38, 54], [58, 54], [28, 60], [68, 60], [46, 66], [38, 76], [56, 75], [48, 54],
  ]) {
    c.beginPath();
    c.ellipse(x, y, 2, 3, 0, 0, Math.PI * 2);
    c.fill();
  }
  /* kroontje */
  c.fillStyle = "#5fd877";
  c.strokeStyle = "rgba(255,255,255,0.85)";
  c.lineWidth = 1.6;
  for (const h of [-1.1, -0.45, 0.2, 0.85, 1.5]) {
    c.save();
    c.translate(48, 28);
    c.rotate(h - Math.PI / 2 + 1.6);
    c.beginPath();
    c.ellipse(11, 0, 11, 4.5, 0, 0, Math.PI * 2);
    c.fill();
    c.stroke();
    c.restore();
  }
}

function banaan(c: CanvasRenderingContext2D, k: string) {
  c.beginPath();
  c.moveTo(16, 24);
  c.bezierCurveTo(14, 66, 54, 90, 86, 66);
  c.quadraticCurveTo(90, 58, 82, 57);
  c.bezierCurveTo(58, 70, 32, 58, 28, 26);
  c.quadraticCurveTo(24, 18, 16, 24);
  c.closePath();
  vul(c, k, 40, 60, 60);
  rand(c);
  c.strokeStyle = "rgba(255,255,255,0.55)";
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(22, 30);
  c.bezierCurveTo(24, 62, 54, 80, 82, 64);
  c.stroke();
  c.fillStyle = "#8a5a2b";
  c.beginPath();
  c.arc(19, 22, 4.5, 0, Math.PI * 2);
  c.fill();
}

/* ---------- voertuigen en speelgoed ---------- */

function auto(c: CanvasRenderingContext2D, k: string) {
  c.beginPath();
  c.moveTo(26, 46);
  c.lineTo(34, 26);
  c.lineTo(62, 26);
  c.lineTo(74, 46);
  c.closePath();
  vul(c, k);
  rand(c);
  c.beginPath();
  c.roundRect(7, 44, 82, 28, 11);
  vul(c, k, 30, 44, 60);
  rand(c);
  /* ramen */
  c.fillStyle = "rgba(200,240,255,0.9)";
  c.beginPath();
  c.moveTo(32, 44);
  c.lineTo(37, 31);
  c.lineTo(47, 31);
  c.lineTo(47, 44);
  c.closePath();
  c.fill();
  c.beginPath();
  c.moveTo(51, 44);
  c.lineTo(51, 31);
  c.lineTo(60, 31);
  c.lineTo(68, 44);
  c.closePath();
  c.fill();
  /* lampje */
  c.fillStyle = "#fff3a0";
  c.beginPath();
  c.arc(84, 53, 3.5, 0, Math.PI * 2);
  c.fill();
  /* wielen */
  for (const x of [28, 68]) {
    c.beginPath();
    c.arc(x, 73, 11.5, 0, Math.PI * 2);
    c.fillStyle = "#1d2540";
    c.fill();
    rand(c, 2.5);
    c.beginPath();
    c.arc(x, 73, 4.5, 0, Math.PI * 2);
    c.fillStyle = "#d8e6ff";
    c.fill();
  }
}

function huisje(c: CanvasRenderingContext2D, k: string) {
  /* muur */
  c.beginPath();
  c.rect(19, 44, 58, 44);
  const g = c.createLinearGradient(0, 44, 0, 88);
  g.addColorStop(0, "#f4fbff");
  g.addColorStop(1, "#bcd6ef");
  c.fillStyle = g;
  c.fill();
  rand(c);
  /* schoorsteen */
  c.beginPath();
  c.rect(62, 16, 9, 18);
  c.fillStyle = tint(k, -0.25);
  c.fill();
  rand(c, 2);
  /* dak */
  c.beginPath();
  c.moveTo(9, 47);
  c.lineTo(48, 12);
  c.lineTo(87, 47);
  c.closePath();
  vul(c, k, 40, 22, 50);
  rand(c);
  /* deur en raam */
  c.beginPath();
  c.roundRect(41, 62, 16, 26, [7, 7, 0, 0]);
  c.fillStyle = tint(k, -0.2);
  c.fill();
  c.beginPath();
  c.rect(25, 54, 12, 12);
  c.fillStyle = "#ffe27a";
  c.fill();
  c.strokeStyle = tint(k, -0.3);
  c.lineWidth = 1.5;
  c.stroke();
  c.beginPath();
  c.rect(61, 54, 12, 12);
  c.fillStyle = "#ffe27a";
  c.fill();
  c.stroke();
}

function raket(c: CanvasRenderingContext2D, k: string) {
  /* vlammetje */
  c.beginPath();
  c.moveTo(39, 72);
  c.quadraticCurveTo(48, 98, 57, 72);
  c.closePath();
  const v = c.createLinearGradient(0, 72, 0, 94);
  v.addColorStop(0, "#fff3a0");
  v.addColorStop(1, "#ff9a3d");
  c.fillStyle = v;
  c.fill();
  /* vinnen */
  c.fillStyle = tint(k, -0.22);
  for (const s of [-1, 1]) {
    c.beginPath();
    c.moveTo(48 + s * 14, 50);
    c.lineTo(48 + s * 29, 78);
    c.lineTo(48 + s * 14, 72);
    c.closePath();
    c.fill();
    rand(c, 2);
  }
  /* lijf */
  c.beginPath();
  c.moveTo(48, 5);
  c.bezierCurveTo(66, 19, 67, 50, 63, 73);
  c.lineTo(33, 73);
  c.bezierCurveTo(29, 50, 30, 19, 48, 5);
  c.closePath();
  vul(c, k, 40, 24, 56);
  rand(c);
  /* raampje */
  c.beginPath();
  c.arc(48, 38, 9.5, 0, Math.PI * 2);
  c.fillStyle = "rgba(200,240,255,0.95)";
  c.fill();
  rand(c, 2.5);
}

function bootje(c: CanvasRenderingContext2D, k: string) {
  /* mast en zeil */
  c.strokeStyle = "rgba(255,255,255,0.95)";
  c.lineWidth = 3;
  c.beginPath();
  c.moveTo(46, 62);
  c.lineTo(46, 10);
  c.stroke();
  c.beginPath();
  c.moveTo(50, 12);
  c.lineTo(50, 56);
  c.lineTo(80, 56);
  c.closePath();
  const z = c.createLinearGradient(50, 12, 80, 56);
  z.addColorStop(0, "#ffffff");
  z.addColorStop(1, "#cfe3ff");
  c.fillStyle = z;
  c.fill();
  rand(c, 2);
  c.beginPath();
  c.moveTo(42, 18);
  c.lineTo(42, 52);
  c.lineTo(20, 52);
  c.closePath();
  c.fillStyle = tint(k, 0.55);
  c.fill();
  rand(c, 2);
  /* romp */
  c.beginPath();
  c.moveTo(8, 61);
  c.lineTo(88, 61);
  c.lineTo(74, 84);
  c.lineTo(22, 84);
  c.closePath();
  vul(c, k, 40, 62, 50);
  rand(c);
  c.fillStyle = "rgba(255,255,255,0.85)";
  for (const x of [34, 48, 62]) {
    c.beginPath();
    c.arc(x, 71, 3.5, 0, Math.PI * 2);
    c.fill();
  }
}

function bal(c: CanvasRenderingContext2D, k: string) {
  c.beginPath();
  c.arc(48, 50, 36, 0, Math.PI * 2);
  vul(c, k);
  c.save();
  c.clip();
  c.fillStyle = "rgba(255,255,255,0.88)";
  c.beginPath();
  c.moveTo(4, 30);
  c.bezierCurveTo(30, 48, 66, 48, 92, 30);
  c.lineTo(92, 46);
  c.bezierCurveTo(66, 64, 30, 64, 4, 46);
  c.closePath();
  c.fill();
  c.restore();
  c.beginPath();
  c.arc(48, 50, 36, 0, Math.PI * 2);
  rand(c);
  glans(c, 48, 50, 27, 1.15, 1.4);
}

function blok(c: CanvasRenderingContext2D, k: string) {
  const vlak = (pts: number[][], kleur: string) => {
    c.beginPath();
    pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
    c.closePath();
    c.fillStyle = kleur;
    c.fill();
    rand(c);
  };
  vlak([[48, 12], [84, 29], [48, 46], [12, 29]], tint(k, 0.45));
  vlak([[12, 29], [48, 46], [48, 88], [12, 71]], k);
  vlak([[48, 46], [84, 29], [84, 71], [48, 88]], tint(k, -0.22));
  /* een stip op elke kant */
  c.fillStyle = "rgba(255,255,255,0.85)";
  for (const [x, y] of [[48, 29], [30, 60], [66, 60]]) {
    c.beginPath();
    c.arc(x, y, 5, 0, Math.PI * 2);
    c.fill();
  }
}

/* ---------- dieren ---------- */

function schildpad(c: CanvasRenderingContext2D, k: string) {
  const huid = tint(k, 0.45);
  /* pootjes en kop */
  c.fillStyle = huid;
  for (const [x, y] of [[24, 70], [64, 70]]) {
    c.beginPath();
    c.ellipse(x, y, 9, 7, 0, 0, Math.PI * 2);
    c.fill();
    rand(c, 2);
  }
  c.beginPath();
  c.ellipse(80, 56, 12, 10, 0, 0, Math.PI * 2);
  c.fillStyle = huid;
  c.fill();
  rand(c, 2);
  oog(c, 84, 53, 3.6, 0.2);
  /* schild */
  c.beginPath();
  c.moveTo(10, 66);
  c.bezierCurveTo(10, 22, 76, 22, 76, 66);
  c.closePath();
  vul(c, k, 34, 34, 50);
  rand(c);
  c.strokeStyle = tint(k, -0.3);
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(43, 34);
  c.lineTo(34, 46);
  c.lineTo(43, 58);
  c.lineTo(53, 58);
  c.lineTo(61, 46);
  c.lineTo(53, 34);
  c.closePath();
  c.stroke();
  c.beginPath();
  c.moveTo(10, 66);
  c.lineTo(76, 66);
  c.strokeStyle = "rgba(255,255,255,0.92)";
  c.lineWidth = 2.5;
  c.stroke();
}

function vogel(c: CanvasRenderingContext2D, k: string) {
  /* staart */
  c.beginPath();
  c.moveTo(22, 52);
  c.lineTo(5, 40);
  c.lineTo(9, 62);
  c.closePath();
  c.fillStyle = tint(k, -0.2);
  c.fill();
  rand(c, 2);
  /* pootjes */
  c.strokeStyle = "#ffb04a";
  c.lineWidth = 3;
  c.lineCap = "round";
  for (const x of [40, 52]) {
    c.beginPath();
    c.moveTo(x, 78);
    c.lineTo(x, 88);
    c.stroke();
  }
  /* lijf */
  c.beginPath();
  c.ellipse(46, 54, 28, 26, 0, 0, Math.PI * 2);
  vul(c, k);
  rand(c);
  /* vleugel */
  c.beginPath();
  c.ellipse(40, 60, 15, 10, -0.4, 0, Math.PI * 2);
  c.fillStyle = tint(k, -0.18);
  c.fill();
  rand(c, 2);
  /* snavel en oog */
  c.beginPath();
  c.moveTo(71, 45);
  c.lineTo(88, 51);
  c.lineTo(71, 57);
  c.closePath();
  c.fillStyle = "#ffb04a";
  c.fill();
  rand(c, 1.6);
  oog(c, 60, 44, 6.5);
}

function vlinder(c: CanvasRenderingContext2D, k: string) {
  const vleugel = (x: number, y: number, rx: number, ry: number, h: number) => {
    c.beginPath();
    c.ellipse(x, y, rx, ry, h, 0, Math.PI * 2);
    vul(c, k, x - 4, y - 4, 30);
    rand(c, 2.2);
    c.fillStyle = "rgba(255,255,255,0.8)";
    c.beginPath();
    c.arc(x, y, Math.min(rx, ry) * 0.32, 0, Math.PI * 2);
    c.fill();
  };
  vleugel(29, 36, 21, 17, -0.5);
  vleugel(67, 36, 21, 17, 0.5);
  vleugel(32, 66, 15, 12, 0.4);
  vleugel(64, 66, 15, 12, -0.4);
  /* lijfje en voelsprieten */
  c.beginPath();
  c.roundRect(44, 24, 8, 56, 4);
  c.fillStyle = "#2a3566";
  c.fill();
  rand(c, 1.8);
  c.strokeStyle = "rgba(255,255,255,0.9)";
  c.lineWidth = 2;
  for (const s of [-1, 1]) {
    c.beginPath();
    c.moveTo(48, 26);
    c.quadraticCurveTo(48 + s * 6, 12, 48 + s * 14, 8);
    c.stroke();
  }
}

/* ---------- monsters en spookjes ---------- */

function monster(c: CanvasRenderingContext2D, k: string) {
  /* hoorntjes */
  c.fillStyle = tint(k, 0.5);
  for (const s of [-1, 1]) {
    c.beginPath();
    c.moveTo(48 + s * 12, 22);
    c.lineTo(48 + s * 22, 5);
    c.lineTo(48 + s * 25, 26);
    c.closePath();
    c.fill();
    rand(c, 2);
  }
  /* voetjes */
  c.fillStyle = tint(k, -0.2);
  for (const x of [34, 62]) {
    c.beginPath();
    c.ellipse(x, 86, 10, 6, 0, 0, Math.PI * 2);
    c.fill();
    rand(c, 2);
  }
  /* lijf */
  c.beginPath();
  c.ellipse(48, 52, 31, 35, 0, 0, Math.PI * 2);
  vul(c, k);
  rand(c);
  /* één groot oog */
  oog(c, 48, 44, 13, 0.15);
  /* mondje met twee tandjes */
  c.beginPath();
  c.arc(48, 64, 11, 0.15 * Math.PI, 0.85 * Math.PI);
  c.strokeStyle = "#13204a";
  c.lineWidth = 3;
  c.stroke();
  c.fillStyle = "#ffffff";
  c.fillRect(42, 72, 5, 5);
  c.fillRect(50, 72, 5, 5);
}

function spookje(c: CanvasRenderingContext2D, k: string) {
  c.beginPath();
  c.moveTo(16, 86);
  c.lineTo(16, 46);
  c.bezierCurveTo(16, 10, 80, 10, 80, 46);
  c.lineTo(80, 86);
  c.quadraticCurveTo(73, 76, 64, 86);
  c.quadraticCurveTo(56, 76, 48, 86);
  c.quadraticCurveTo(40, 76, 32, 86);
  c.quadraticCurveTo(24, 76, 16, 86);
  c.closePath();
  const g = c.createLinearGradient(0, 14, 0, 86);
  g.addColorStop(0, "#ffffff");
  g.addColorStop(0.55, tint(k, 0.55));
  g.addColorStop(1, k);
  c.globalAlpha = 0.95;
  c.fillStyle = g;
  c.fill();
  c.globalAlpha = 1;
  rand(c);
  /* oogjes en mondje */
  c.fillStyle = "#13204a";
  for (const x of [38, 58]) {
    c.beginPath();
    c.ellipse(x, 44, 5, 7, 0, 0, Math.PI * 2);
    c.fill();
  }
  c.fillStyle = "#ffffff";
  for (const x of [36.5, 56.5]) {
    c.beginPath();
    c.arc(x, 41, 1.8, 0, Math.PI * 2);
    c.fill();
  }
  c.fillStyle = "#13204a";
  c.beginPath();
  c.ellipse(48, 60, 5, 6, 0, 0, Math.PI * 2);
  c.fill();
}

/* ---------- knikkers en sterren ---------- */

function knikker(c: CanvasRenderingContext2D, k: string) {
  c.beginPath();
  c.arc(48, 50, 30, 0, Math.PI * 2);
  vul(c, k, 38, 38, 40);
  rand(c);
  c.save();
  c.beginPath();
  c.arc(48, 50, 30, 0, Math.PI * 2);
  c.clip();
  c.strokeStyle = "rgba(255,255,255,0.6)";
  c.lineWidth = 4;
  c.beginPath();
  c.moveTo(22, 64);
  c.bezierCurveTo(38, 40, 56, 72, 76, 40);
  c.stroke();
  c.restore();
  c.fillStyle = "#ffffff";
  c.beginPath();
  c.arc(38, 38, 6, 0, Math.PI * 2);
  c.fill();
}

function ster(c: CanvasRenderingContext2D, k: string) {
  c.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? 17 : 40;
    const h = -Math.PI / 2 + (i * Math.PI) / 5;
    const x = 48 + r * Math.cos(h);
    const y = 52 + r * Math.sin(h);
    if (i) c.lineTo(x, y);
    else c.moveTo(x, y);
  }
  c.closePath();
  vul(c, k, 40, 36, 44);
  rand(c);
}

/* ---------- alles bij elkaar ---------- */

const TEKEN: Record<Soort, (c: CanvasRenderingContext2D, k: string) => void> = {
  appel,
  peer,
  pruim,
  citroen,
  aardbei,
  banaan,
  auto,
  huisje,
  raket,
  bootje,
  bal,
  blok,
  visje: (c, k) => {
    c.translate(0, 16);
    tekenVisje(c, k);
  },
  kwal: (c, k) => {
    c.translate(8, 2);
    tekenKwal(c, k);
  },
  schildpad,
  vogel,
  vlinder,
  monster,
  spookje,
  knikker,
  ster,
};

/** Teken een voorwerp in een vak van 96 × 96. */
export function teken(c: CanvasRenderingContext2D, soort: Soort, kleur: string) {
  c.save();
  TEKEN[soort](c, kleur);
  c.restore();
}

/**
 * Een dichte zak met een tiental erop (200 × 240 punten): een jute zak met
 * een touwtje, en op een wit bordje het getal.
 */
export function tekenZak(c: CanvasRenderingContext2D, getal: number) {
  const bruin = "#d9a866";
  /* lijf van de zak */
  c.beginPath();
  c.moveTo(70, 54);
  c.bezierCurveTo(20, 80, 10, 150, 20, 196);
  c.quadraticCurveTo(26, 228, 100, 230);
  c.quadraticCurveTo(174, 228, 180, 196);
  c.bezierCurveTo(190, 150, 180, 80, 130, 54);
  c.closePath();
  const g = c.createRadialGradient(80, 110, 10, 100, 150, 130);
  g.addColorStop(0, "#f3d39c");
  g.addColorStop(0.6, bruin);
  g.addColorStop(1, "#a4743a");
  c.fillStyle = g;
  c.fill();
  rand(c, 3);
  /* de rand bovenaan, dichtgeknoopt */
  c.beginPath();
  c.moveTo(66, 22);
  c.quadraticCurveTo(84, 36, 82, 54);
  c.lineTo(118, 54);
  c.quadraticCurveTo(116, 36, 134, 22);
  c.quadraticCurveTo(100, 30, 66, 22);
  c.closePath();
  c.fillStyle = "#e7c085";
  c.fill();
  rand(c, 2.5);
  c.beginPath();
  c.roundRect(72, 50, 56, 12, 6);
  c.fillStyle = "#8a5a2b";
  c.fill();
  rand(c, 2);
  /* het bordje met het getal */
  c.beginPath();
  c.roundRect(42, 112, 116, 84, 18);
  c.fillStyle = "#ffffff";
  c.fill();
  c.strokeStyle = "#8a5a2b";
  c.lineWidth = 3;
  c.stroke();
  c.fillStyle = "#1d2540";
  c.font = `800 64px "Work Sans", system-ui, sans-serif`;
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.fillText(String(getal), 100, 157);
}

/** Een getal op een klein donker schijfje (samen tellen), 64 × 44 punten. */
export function tekenNummer(c: CanvasRenderingContext2D, n: number) {
  c.beginPath();
  c.roundRect(2, 2, 60, 40, 20);
  c.fillStyle = "rgba(13,32,74,0.92)";
  c.fill();
  c.strokeStyle = "rgba(255,255,255,0.95)";
  c.lineWidth = 2.5;
  c.stroke();
  c.fillStyle = "#ffffff";
  c.font = `800 26px "Work Sans", system-ui, sans-serif`;
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.fillText(String(n), 32, 23.5);
}
