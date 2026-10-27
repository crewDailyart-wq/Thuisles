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

/** Een parel, 64 × 64 punten (straal 27). */
export function tekenParel(c: CanvasRenderingContext2D) {
  const g = c.createRadialGradient(24, 22, 3, 32, 32, 29);
  g.addColorStop(0, "#ffffff");
  g.addColorStop(0.45, "#e9fbff");
  g.addColorStop(1, "#8fd8ef");
  c.fillStyle = g;
  c.beginPath();
  c.arc(32, 32, 27, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = "rgba(255,255,255,0.9)";
  c.lineWidth = 1.5;
  c.stroke();
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
 * Een staande, open schelp met ruimte voor 2 × 5 parels. `b` × `h` punten.
 * Bovenaan de golvende rand van een sint-jakobsschelp, binnenin zachte ribbels.
 */
export function tekenSchelp(c: CanvasRenderingContext2D, b: number, h: number, kleur = "#7fe9ff") {
  const r = 34;
  const pad = () => {
    c.beginPath();
    const golven = 6;
    const w = (b - 8) / golven;
    c.moveTo(4, 30);
    for (let i = 0; i < golven; i++) c.quadraticCurveTo(4 + w * i + w / 2, 4, 4 + w * (i + 1), 30);
    c.lineTo(b - 4, h - r);
    c.quadraticCurveTo(b - 4, h - 4, b - r, h - 4);
    c.lineTo(r, h - 4);
    c.quadraticCurveTo(4, h - 4, 4, h - r);
    c.closePath();
  };
  pad();
  c.fillStyle = "rgba(10,40,95,0.5)";
  c.fill();
  c.save();
  pad();
  c.clip();
  /* ribbels vanuit de onderkant */
  c.strokeStyle = "rgba(190,240,255,0.08)";
  c.lineWidth = 2;
  for (let i = 0; i <= 8; i++) {
    c.beginPath();
    c.moveTo(b / 2, h + 40);
    c.lineTo((b / 8) * i, 0);
    c.stroke();
  }
  /* scanlijntjes */
  c.strokeStyle = "rgba(190,240,255,0.05)";
  c.lineWidth = 1;
  for (let y = 0; y < h; y += 6) {
    c.beginPath();
    c.moveTo(0, y);
    c.lineTo(b, y);
    c.stroke();
  }
  c.restore();
  pad();
  c.strokeStyle = kleur;
  c.lineWidth = 3;
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
  sc.canvasPlaatje("tel-parel", 64, 64, tekenParel);
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
