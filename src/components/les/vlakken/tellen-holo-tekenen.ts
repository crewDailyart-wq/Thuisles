/**
 * Plaatjes voor de hologramlessen van "Tellen" (27 oktober 2026, LESSENPLAN.md
 * G2–G6, wereld Oceaan): lichtvisjes en kwallen in zes kleuren, parels, een
 * lege parelplek, een staande schelp met 10 plekken (de tienstrook) en
 * bubbels voor het getallenveld.
 *
 * Alles wordt één keer getekend (canvasPlaatje) en de gloed één keer gebakken
 * (bak, centrale sterkte). Geen live filters (HARDE REGEL 7).
 */

import type { Holo } from "../holo/basis";

export type Kleur = "rood" | "oranje" | "geel" | "groen" | "blauw" | "paars";
export const KLEUREN: Kleur[] = ["rood", "oranje", "geel", "groen", "blauw", "paars"];

/** De kleuren van Synthesis (Color Count), iets lichter zodat ze als hologram gloeien. */
export const HOLOKLEUR: Record<Kleur, string> = {
  rood: "#ff5c7f",
  oranje: "#ffa25a",
  geel: "#ffe24a",
  groen: "#5fd877",
  blauw: "#6f8cff",
  paars: "#c46bff",
};

export const hexNaarGetal = (h: string) => parseInt(h.slice(1), 16);

/** Een kleur lichter maken (0 = zelfde, 1 = wit). */
function lichter(hex: string, f: number): string {
  const n = hexNaarGetal(hex);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const m = (x: number) => Math.round(x + (255 - x) * f);
  return `rgb(${m(r)},${m(g)},${m(b)})`;
}

/* ---------- lichtvisje ---------- */

/** Een lichtvisje naar rechts, 96 × 64 punten. */
export function tekenVisje(c: CanvasRenderingContext2D, kleur: string) {
  const g = c.createLinearGradient(0, 8, 0, 58);
  g.addColorStop(0, lichter(kleur, 0.55));
  g.addColorStop(0.55, kleur);
  g.addColorStop(1, lichter(kleur, 0.1));
  /* staart */
  c.fillStyle = lichter(kleur, 0.2);
  c.beginPath();
  c.moveTo(26, 32);
  c.quadraticCurveTo(12, 18, 4, 12);
  c.quadraticCurveTo(10, 32, 4, 52);
  c.quadraticCurveTo(12, 46, 26, 32);
  c.fill();
  /* lijf */
  c.fillStyle = g;
  c.beginPath();
  c.ellipse(54, 32, 34, 22, 0, 0, Math.PI * 2);
  c.fill();
  /* rugvin */
  c.fillStyle = lichter(kleur, 0.35);
  c.beginPath();
  c.moveTo(42, 12);
  c.quadraticCurveTo(56, 0, 66, 11);
  c.closePath();
  c.fill();
  /* hologramlijntjes */
  c.save();
  c.beginPath();
  c.ellipse(54, 32, 34, 22, 0, 0, Math.PI * 2);
  c.clip();
  c.strokeStyle = "rgba(255,255,255,0.18)";
  c.lineWidth = 1;
  for (let y = 12; y < 56; y += 5) {
    c.beginPath();
    c.moveTo(18, y);
    c.lineTo(92, y);
    c.stroke();
  }
  c.restore();
  /* rand en oog */
  c.strokeStyle = "rgba(255,255,255,0.85)";
  c.lineWidth = 2;
  c.beginPath();
  c.ellipse(54, 32, 34, 22, 0, 0, Math.PI * 2);
  c.stroke();
  c.fillStyle = "#ffffff";
  c.beginPath();
  c.arc(72, 27, 6, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "#13204a";
  c.beginPath();
  c.arc(73.5, 27, 3, 0, Math.PI * 2);
  c.fill();
}

/* ---------- kwal ---------- */

/** Een kwal, 80 × 92 punten. */
export function tekenKwal(c: CanvasRenderingContext2D, kleur: string) {
  /* tentakels */
  c.strokeStyle = lichter(kleur, 0.3);
  c.lineWidth = 3.2;
  c.lineCap = "round";
  for (const x of [22, 34, 46, 58]) {
    c.beginPath();
    c.moveTo(x, 44);
    c.bezierCurveTo(x - 7, 58, x + 7, 70, x - 2, 86);
    c.stroke();
  }
  /* hoed */
  const g = c.createRadialGradient(32, 18, 3, 40, 30, 40);
  g.addColorStop(0, lichter(kleur, 0.7));
  g.addColorStop(0.6, kleur);
  g.addColorStop(1, lichter(kleur, 0.05));
  c.fillStyle = g;
  c.beginPath();
  c.moveTo(6, 46);
  c.bezierCurveTo(4, 8, 76, 8, 74, 46);
  c.quadraticCurveTo(67, 52, 60, 46);
  c.quadraticCurveTo(53, 52, 47, 46);
  c.quadraticCurveTo(40, 52, 33, 46);
  c.quadraticCurveTo(26, 52, 20, 46);
  c.quadraticCurveTo(13, 52, 6, 46);
  c.closePath();
  c.fill();
  c.strokeStyle = "rgba(255,255,255,0.85)";
  c.lineWidth = 2;
  c.stroke();
  /* glans */
  c.strokeStyle = "rgba(255,255,255,0.7)";
  c.lineWidth = 3;
  c.beginPath();
  c.arc(40, 40, 26, Math.PI * 1.15, Math.PI * 1.45);
  c.stroke();
}

/* ---------- parels en plekken ---------- */

/**
 * Een parel: rond, parelmoerwit met een zachte roze/blauwe glans, een wit
 * glimpuntje linksboven en een iets donkerder rand. Eén tekening voor alle
 * lessen (zelfde ding = zelfde plaatje). Standaard 64 × 64 punten (straal 27);
 * `d` = de maat van het plaatje. Met `tint` krijgt de parel die kleur (voor
 * parels die per getal gekleurd zijn), mét dezelfde glans en het glimpuntje.
 */
export function tekenParel(c: CanvasRenderingContext2D, d = 64, tint?: string) {
  const m = d / 2;
  const r = d * 0.42;
  /* lijf: licht linksboven, naar de rand toe iets dieper */
  const g = c.createRadialGradient(m - r * 0.3, m - r * 0.35, r * 0.08, m, m, r);
  if (tint) {
    g.addColorStop(0, "#ffffff");
    g.addColorStop(0.4, lichter(tint, 0.6));
    g.addColorStop(0.85, tint);
    g.addColorStop(1, lichter(tint, 0.15));
  } else {
    g.addColorStop(0, "#ffffff");
    g.addColorStop(0.4, "#f7f3f5");
    g.addColorStop(0.8, "#e2dde8");
    g.addColorStop(1, "#c9c3d6");
  }
  c.fillStyle = g;
  c.beginPath();
  c.arc(m, m, r, 0, Math.PI * 2);
  c.fill();
  /* parelmoerglans: blauw linksonder, roze rechtsonder */
  c.save();
  c.beginPath();
  c.arc(m, m, r, 0, Math.PI * 2);
  c.clip();
  const a = tint ? 0.22 : 0.35;
  const blauw = c.createRadialGradient(m - r * 0.55, m + r * 0.35, 0, m - r * 0.55, m + r * 0.35, r * 0.75);
  blauw.addColorStop(0, `rgba(160,205,255,${a})`);
  blauw.addColorStop(1, "rgba(160,205,255,0)");
  c.fillStyle = blauw;
  c.fillRect(0, 0, d, d);
  const roze = c.createRadialGradient(m + r * 0.45, m + r * 0.5, 0, m + r * 0.45, m + r * 0.5, r * 0.8);
  roze.addColorStop(0, `rgba(255,185,215,${a})`);
  roze.addColorStop(1, "rgba(255,185,215,0)");
  c.fillStyle = roze;
  c.fillRect(0, 0, d, d);
  c.restore();
  /* iets donkerder rand */
  c.strokeStyle = tint ? "rgba(20,20,50,0.28)" : "rgba(110,100,140,0.45)";
  c.lineWidth = Math.max(1, d * 0.025);
  c.beginPath();
  c.arc(m, m, r - c.lineWidth / 2, 0, Math.PI * 2);
  c.stroke();
  /* glimpuntje linksboven, met een zacht randje */
  const hx = m - r * 0.36;
  const hy = m - r * 0.4;
  const hg = c.createRadialGradient(hx, hy, 0, hx, hy, r * 0.32);
  hg.addColorStop(0, "rgba(255,255,255,1)");
  hg.addColorStop(0.45, "rgba(255,255,255,0.95)");
  hg.addColorStop(1, "rgba(255,255,255,0)");
  c.fillStyle = hg;
  c.beginPath();
  c.arc(hx, hy, r * 0.32, 0, Math.PI * 2);
  c.fill();
}

/** Een lege parelplek: een gestippeld rondje, 64 × 64 punten. */
export function tekenPlek(c: CanvasRenderingContext2D) {
  c.fillStyle = "rgba(20,60,120,0.4)";
  c.beginPath();
  c.arc(32, 32, 26, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = "rgba(190,240,255,0.75)";
  c.lineWidth = 2.5;
  c.setLineDash([5, 4]);
  c.beginPath();
  c.arc(32, 32, 26, 0, Math.PI * 2);
  c.stroke();
  c.setLineDash([]);
}

/* ---------- de staande schelp (tienstrook) ---------- */

/**
 * Een open oesterschelp met ruimte voor 2 × 5 parels. `b` × `h` punten.
 * 30 oktober 2026 (opdracht eigenaar: het moet op een schelp lijken, niet op een
 * bakje of vaas): een ronde, golvende, ruwe buitenrand met groeiringen, en binnenin
 * glanzend parelmoer (roze, lila, lichtblauw) waar de parels in liggen. De parels
 * liggen nog op dezelfde plekken.
 */
export function tekenSchelp(c: CanvasRenderingContext2D, b: number, h: number, kleur = "#7fe9ff") {
  const mx = b / 2;
  const my = h / 2;
  /* een "afgeronde rechthoek-ovaal" (superellips), met een golvende rand */
  const vorm = (schaal: number, golf: number) => {
    const a = (b / 2 - 4) * schaal;
    const r = (h / 2 - 4) * schaal;
    c.beginPath();
    const n = 3.4;
    for (let i = 0; i <= 160; i++) {
      const t = (i / 160) * Math.PI * 2;
      const ct = Math.cos(t);
      const st = Math.sin(t);
      const w = 1 + golf * Math.sin(t * 14) + golf * 0.6 * Math.sin(t * 5 + 1);
      const x = mx + a * w * Math.sign(ct) * Math.pow(Math.abs(ct), 2 / n);
      const y = my + r * w * Math.sign(st) * Math.pow(Math.abs(st), 2 / n);
      if (i === 0) c.moveTo(x, y);
      else c.lineTo(x, y);
    }
    c.closePath();
  };
  /* de ruwe buitenkant */
  vorm(1, 0.022);
  c.fillStyle = "rgba(20,50,110,0.62)";
  c.fill();
  c.save();
  vorm(1, 0.022);
  c.clip();
  c.strokeStyle = "rgba(190,240,255,0.16)";
  c.lineWidth = 2;
  for (let k = 0.98; k > 0.91; k -= 0.025) {
    vorm(k, 0.02);
    c.stroke();
  }
  c.restore();
  vorm(1, 0.022);
  c.strokeStyle = kleur;
  c.lineWidth = 3;
  c.stroke();
  /* het parelmoer binnenin */
  vorm(0.9, 0.008);
  const moer = c.createLinearGradient(0, 0, b, h);
  moer.addColorStop(0, "rgba(255,200,235,0.42)");
  moer.addColorStop(0.35, "rgba(200,180,255,0.34)");
  moer.addColorStop(0.7, "rgba(160,230,255,0.36)");
  moer.addColorStop(1, "rgba(255,215,240,0.4)");
  c.fillStyle = "rgba(15,45,105,0.7)";
  c.fill();
  c.fillStyle = moer;
  c.fill();
  /* glans: een zachte lichte streep */
  c.save();
  vorm(0.9, 0.008);
  c.clip();
  const glans = c.createRadialGradient(mx - b * 0.18, h * 0.22, 4, mx - b * 0.18, h * 0.22, b * 0.6);
  glans.addColorStop(0, "rgba(255,255,255,0.35)");
  glans.addColorStop(1, "rgba(255,255,255,0)");
  c.fillStyle = glans;
  c.fillRect(0, 0, b, h);
  c.restore();
  vorm(0.9, 0.008);
  c.strokeStyle = "rgba(255,230,250,0.65)";
  c.lineWidth = 2;
  c.stroke();
}

/* ---------- bubbels (getallenveld) ---------- */

/** Een lichtgevende bubbel, `d` × `d` punten, met een rand in `kleur`. */
export function tekenBubbel(c: CanvasRenderingContext2D, d: number, kleur: string) {
  const m = d / 2;
  const g = c.createRadialGradient(m * 0.7, m * 0.6, 2, m, m, m - 2);
  g.addColorStop(0, lichter(kleur, 0.55));
  g.addColorStop(0.7, kleur);
  g.addColorStop(1, lichter(kleur, 0.2));
  c.globalAlpha = 0.92;
  c.fillStyle = g;
  c.beginPath();
  c.arc(m, m, m - 3, 0, Math.PI * 2);
  c.fill();
  c.globalAlpha = 1;
  c.strokeStyle = "rgba(255,255,255,0.8)";
  c.lineWidth = 2;
  c.stroke();
  c.strokeStyle = "rgba(255,255,255,0.75)";
  c.lineWidth = 3;
  c.beginPath();
  c.arc(m, m, m - 10, Math.PI * 1.1, Math.PI * 1.4);
  c.stroke();
}

/* ---------- gedeeld: alles één keer maken ---------- */

export function maakParels(sc: Holo) {
  sc.canvasPlaatje("tel-parel", 64, 64, (c) => tekenParel(c));
  sc.bak("tel-parel", "tel-parel-g", 0xbff4ff);
  sc.canvasPlaatje("tel-plek", 64, 64, tekenPlek);
}

export function maakDieren(sc: Holo, soort: "visje" | "kwal") {
  for (const k of KLEUREN) {
    const sl = `tel-${soort}-${k}`;
    if (soort === "visje") sc.canvasPlaatje(sl, 96, 64, (c) => tekenVisje(c, HOLOKLEUR[k]));
    else sc.canvasPlaatje(sl, 80, 92, (c) => tekenKwal(c, HOLOKLEUR[k]));
    sc.bak(sl, `${sl}-g`, hexNaarGetal(HOLOKLEUR[k]));
  }
}
