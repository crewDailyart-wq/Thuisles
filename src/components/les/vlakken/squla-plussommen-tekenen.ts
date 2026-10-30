/**
 * Tekeningen voor de lessen "Plussommen" naar Squla (30 oktober 2026): eigen
 * tekenwerk op een canvas (geen plaatjes van Squla, geen AI, geen emoji).
 * Alles wordt één keer getekend in een Phaser-plaatje (canvasPlaatje) en
 * daarna alleen nog neergezet; zo blijft het vloeiend.
 *
 * - bakkerij: broodjes, koekjes, taartjes … op een bord, een bakplaat, in een
 *   mand of in een zak (vriendelijke platte tekeningen);
 * - disco: discobal, luidsprekers, draaitafel, kaartjes en grammofoonplaten;
 * - bus: een bus (met één of twee rijen ramen), kinderhoofdjes achter de
 *   ramen en kinderen die bij de halte staan;
 * - rek: een rij van 10 (of twee rijen) met stippen, voor Bliepo's uitleg;
 * - kaal: een sierplaatje (plusteken en cijfers) zonder telhulp.
 * Maten in punten van het vlak (980 × 720).
 */

type C = CanvasRenderingContext2D;

export type Ding = "broodje" | "bruinbrood" | "stokbrood" | "koekje" | "taart" | "cupcake" | "krentenbol" | "croissant" | "donut";
export type Bak = "bord" | "plaat" | "mand" | "zak";

/** Meervoud en enkelvoud, voor de zinnen. */
export const DING_NAAM: Record<Ding, { een: string; veel: string; het: boolean }> = {
  broodje: { een: "broodje", veel: "broodjes", het: true },
  bruinbrood: { een: "bruin brood", veel: "bruine broden", het: true },
  stokbrood: { een: "stokbrood", veel: "stokbroden", het: true },
  koekje: { een: "koekje", veel: "koekjes", het: true },
  taart: { een: "taartje", veel: "taartjes", het: true },
  cupcake: { een: "cupcake", veel: "cupcakes", het: false },
  krentenbol: { een: "krentenbol", veel: "krentenbollen", het: false },
  croissant: { een: "croissant", veel: "croissants", het: false },
  donut: { een: "donut", veel: "donuts", het: false },
};

/** Een voorwerp is DING × DING punten. */
export const DING = 72;

function rondeRechthoek(c: C, x: number, y: number, b: number, h: number, r: number) {
  c.beginPath();
  c.roundRect(x, y, b, h, r);
}

const LIJN = "#5b3a1e";

/* ---------- bakkerij ---------- */

export function tekenDing(c: C, d: Ding) {
  const m = DING / 2;
  c.lineJoin = "round";
  c.lineCap = "round";
  c.lineWidth = 2.5;
  c.strokeStyle = LIJN;
  if (d === "broodje" || d === "bruinbrood") {
    c.fillStyle = d === "broodje" ? "#f2c27b" : "#a86a3a";
    c.beginPath();
    c.ellipse(m, m + 6, 30, 21, 0, 0, Math.PI * 2);
    c.fill();
    c.stroke();
    c.strokeStyle = d === "broodje" ? "#c98c45" : "#6e4022";
    c.lineWidth = 3;
    for (const dx of [-12, 0, 12]) {
      c.beginPath();
      c.moveTo(m + dx - 5, m - 4);
      c.lineTo(m + dx + 5, m + 14);
      c.stroke();
    }
    return;
  }
  if (d === "stokbrood") {
    c.save();
    c.translate(m, m);
    c.rotate(-0.75);
    c.fillStyle = "#e9b467";
    c.beginPath();
    c.ellipse(0, 0, 34, 11, 0, 0, Math.PI * 2);
    c.fill();
    c.stroke();
    c.strokeStyle = "#b47a35";
    c.lineWidth = 2.5;
    for (const dx of [-16, -4, 8, 20]) {
      c.beginPath();
      c.moveTo(dx - 5, -6);
      c.lineTo(dx + 3, 5);
      c.stroke();
    }
    c.restore();
    return;
  }
  if (d === "koekje") {
    c.fillStyle = "#e0a75c";
    c.beginPath();
    c.arc(m, m, 28, 0, Math.PI * 2);
    c.fill();
    c.stroke();
    c.fillStyle = "#5b3a1e";
    for (const [x, y] of [[-12, -10], [8, -14], [14, 4], [-4, 6], [-14, 12], [4, 18]]) {
      c.beginPath();
      c.arc(m + x, m + y, 3.6, 0, Math.PI * 2);
      c.fill();
    }
    return;
  }
  if (d === "taart") {
    c.fillStyle = "#f6d7a8";
    rondeRechthoek(c, m - 28, m - 4, 56, 30, 6);
    c.fill();
    c.stroke();
    c.fillStyle = "#ff9fc4";
    rondeRechthoek(c, m - 28, m - 14, 56, 14, 7);
    c.fill();
    c.stroke();
    c.fillStyle = "#ffffff";
    c.beginPath();
    c.arc(m, m - 18, 8, Math.PI, 0);
    c.fill();
    c.stroke();
    c.fillStyle = "#e23b4c";
    c.beginPath();
    c.arc(m, m - 26, 6, 0, Math.PI * 2);
    c.fill();
    c.stroke();
    return;
  }
  if (d === "cupcake") {
    c.fillStyle = "#7cc6ff";
    c.beginPath();
    c.moveTo(m - 22, m + 2);
    c.lineTo(m + 22, m + 2);
    c.lineTo(m + 16, m + 30);
    c.lineTo(m - 16, m + 30);
    c.closePath();
    c.fill();
    c.stroke();
    c.strokeStyle = "#4b8fc8";
    for (const dx of [-8, 0, 8]) {
      c.beginPath();
      c.moveTo(m + dx, m + 6);
      c.lineTo(m + dx * 0.8, m + 27);
      c.stroke();
    }
    c.strokeStyle = LIJN;
    c.fillStyle = "#fff0f6";
    c.beginPath();
    c.arc(m - 12, m - 2, 12, Math.PI, 0);
    c.arc(m + 12, m - 2, 12, Math.PI, 0);
    c.arc(m, m - 14, 13, Math.PI, 0);
    c.closePath();
    c.fill();
    c.stroke();
    c.fillStyle = "#e23b4c";
    c.beginPath();
    c.arc(m, m - 28, 5, 0, Math.PI * 2);
    c.fill();
    return;
  }
  if (d === "krentenbol") {
    c.fillStyle = "#e5a55a";
    c.beginPath();
    c.arc(m, m + 2, 28, 0, Math.PI * 2);
    c.fill();
    c.stroke();
    c.fillStyle = "#4a2a14";
    for (const [x, y] of [[-14, -6], [2, -14], [14, -2], [-4, 6], [10, 14], [-14, 14]]) {
      c.beginPath();
      c.ellipse(m + x, m + y, 4, 3, 0.5, 0, Math.PI * 2);
      c.fill();
    }
    return;
  }
  if (d === "croissant") {
    c.fillStyle = "#f0b85e";
    c.beginPath();
    c.moveTo(m - 32, m + 10);
    c.quadraticCurveTo(m, m - 40, m + 32, m + 10);
    c.quadraticCurveTo(m, m - 6, m - 32, m + 10);
    c.closePath();
    c.fill();
    c.stroke();
    c.strokeStyle = "#b47a35";
    for (const dx of [-14, 0, 14]) {
      c.beginPath();
      c.moveTo(m + dx, m - 14);
      c.lineTo(m + dx * 1.1, m + 2);
      c.stroke();
    }
    return;
  }
  /* donut */
  c.fillStyle = "#e3a55e";
  c.beginPath();
  c.arc(m, m, 28, 0, Math.PI * 2);
  c.arc(m, m, 9, 0, Math.PI * 2, true);
  c.fill("evenodd");
  c.stroke();
  c.fillStyle = "#ff8fbf";
  c.beginPath();
  c.arc(m, m, 23, 0, Math.PI * 2);
  c.arc(m, m, 11, 0, Math.PI * 2, true);
  c.fill("evenodd");
  c.beginPath();
  c.arc(m, m, 9, 0, Math.PI * 2);
  c.stroke();
  const spikkel = ["#ffffff", "#ffe066", "#7cc6ff"];
  [[-14, -8], [10, -14], [15, 6], [-6, 16], [-16, 6], [4, 15]].forEach(([x, y], i) => {
    c.fillStyle = spikkel[i % 3];
    c.fillRect(m + x - 1.5, m + y - 3, 3, 6);
  });
}

/** Het bord, de bakplaat, de mand of de zak onder een groepje (b × h punten). */
export function tekenBak(c: C, bak: Bak, b: number, h: number) {
  c.lineJoin = "round";
  c.lineWidth = 3;
  if (bak === "bord") {
    c.fillStyle = "#ffffff";
    c.strokeStyle = "#9db4c8";
    rondeRechthoek(c, 4, 4, b - 8, h - 8, Math.min(60, h / 2 - 4));
    c.fill();
    c.stroke();
    c.strokeStyle = "#d6e2ec";
    rondeRechthoek(c, 16, 16, b - 32, h - 32, Math.min(50, h / 2 - 16));
    c.stroke();
    return;
  }
  if (bak === "plaat") {
    c.fillStyle = "#c9ced6";
    c.strokeStyle = "#6c7684";
    rondeRechthoek(c, 4, 4, b - 8, h - 8, 12);
    c.fill();
    c.stroke();
    c.fillStyle = "#dfe3e8";
    rondeRechthoek(c, 14, 14, b - 28, h - 28, 8);
    c.fill();
    return;
  }
  if (bak === "mand") {
    c.fillStyle = "#c98b4e";
    c.strokeStyle = LIJN;
    c.beginPath();
    c.moveTo(4, 30);
    c.lineTo(b - 4, 30);
    c.lineTo(b - 24, h - 4);
    c.lineTo(24, h - 4);
    c.closePath();
    c.fill();
    c.stroke();
    c.strokeStyle = "rgba(91,58,30,0.45)";
    c.lineWidth = 2;
    for (let y = 48; y < h - 8; y += 18) {
      c.beginPath();
      c.moveTo(8 + (y - 30) * 0.25, y);
      c.lineTo(b - 8 - (y - 30) * 0.25, y);
      c.stroke();
    }
    c.lineWidth = 3;
    c.strokeStyle = LIJN;
    c.fillStyle = "#e0a865";
    rondeRechthoek(c, 0, 22, b, 16, 8);
    c.fill();
    c.stroke();
    return;
  }
  /* zak: doorzichtig, met een strikje bovenaan */
  c.fillStyle = "rgba(255,255,255,0.35)";
  c.strokeStyle = "#ffffff";
  rondeRechthoek(c, 6, 26, b - 12, h - 32, 26);
  c.fill();
  c.stroke();
  c.beginPath();
  c.moveTo(b / 2 - 30, 28);
  c.lineTo(b / 2 - 10, 6);
  c.lineTo(b / 2 + 10, 6);
  c.lineTo(b / 2 + 30, 28);
  c.stroke();
  c.fillStyle = "#ff7b7b";
  c.beginPath();
  c.ellipse(b / 2 - 10, 16, 10, 6, -0.4, 0, Math.PI * 2);
  c.ellipse(b / 2 + 10, 16, 10, 6, 0.4, 0, Math.PI * 2);
  c.fill();
}

/** Een grote taart op een standaard (alleen versiering bij "typ het antwoord"). */
export function tekenEtalage(c: C) {
  c.lineJoin = "round";
  c.lineWidth = 4;
  c.strokeStyle = LIJN;
  c.fillStyle = "#ffffff";
  rondeRechthoek(c, 40, 200, 240, 18, 9);
  c.fill();
  c.stroke();
  c.fillStyle = "#d6e2ec";
  rondeRechthoek(c, 145, 218, 30, 50, 6);
  c.fill();
  c.stroke();
  c.fillStyle = "#f6d7a8";
  rondeRechthoek(c, 70, 110, 180, 90, 14);
  c.fill();
  c.stroke();
  c.fillStyle = "#ff9fc4";
  rondeRechthoek(c, 70, 96, 180, 34, 14);
  c.fill();
  c.stroke();
  c.fillStyle = "#ffffff";
  for (let i = 0; i < 5; i++) {
    c.beginPath();
    c.arc(92 + i * 34, 96, 13, Math.PI, 0);
    c.fill();
    c.stroke();
  }
  c.fillStyle = "#e23b4c";
  for (let i = 0; i < 5; i++) {
    c.beginPath();
    c.arc(92 + i * 34, 76, 8, 0, Math.PI * 2);
    c.fill();
    c.stroke();
  }
}

/* ---------- disco ---------- */

export const KLEUREN_DISCO = ["#ff6fae", "#7c8cff", "#3fd0c8", "#ffb347", "#b67cff", "#69d26a"];

export function tekenDiscobal(c: C) {
  const r = 70;
  c.save();
  c.translate(80, 80);
  c.beginPath();
  c.arc(0, 0, r, 0, Math.PI * 2);
  c.fillStyle = "#c8d3e6";
  c.fill();
  c.clip();
  for (let y = -r; y < r; y += 14)
    for (let x = -r; x < r; x += 14) {
      const licht = 0.55 + 0.45 * Math.sin((x * 3 + y * 7) * 0.05);
      c.fillStyle = `rgba(${Math.round(150 + 100 * licht)},${Math.round(170 + 80 * licht)},255,1)`;
      c.fillRect(x + 1, y + 1, 12, 12);
    }
  c.restore();
  c.strokeStyle = "#5d6a86";
  c.lineWidth = 3;
  c.beginPath();
  c.arc(80, 80, r, 0, Math.PI * 2);
  c.stroke();
  c.fillStyle = "#ffffff";
  c.beginPath();
  c.arc(56, 52, 9, 0, Math.PI * 2);
  c.fill();
}

export function tekenLuidspreker(c: C) {
  c.lineWidth = 4;
  c.strokeStyle = "#1b1f33";
  c.fillStyle = "#3a3f5c";
  rondeRechthoek(c, 6, 6, 128, 208, 16);
  c.fill();
  c.stroke();
  for (const [y, r] of [[62, 34], [152, 46]] as const) {
    c.fillStyle = "#1b1f33";
    c.beginPath();
    c.arc(70, y, r, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#7c8cff";
    c.beginPath();
    c.arc(70, y, r * 0.45, 0, Math.PI * 2);
    c.fill();
  }
}

/** De tafel met de draaitafel (560 × 130). */
export function tekenDraaitafel(c: C) {
  c.lineWidth = 4;
  c.strokeStyle = "#1b1f33";
  c.fillStyle = "#8a5cf0";
  rondeRechthoek(c, 6, 20, 548, 104, 18);
  c.fill();
  c.stroke();
  c.fillStyle = "#6b3fd1";
  rondeRechthoek(c, 6, 96, 548, 28, 14);
  c.fill();
  c.fillStyle = "#2b2f45";
  c.beginPath();
  c.ellipse(280, 26, 120, 22, 0, 0, Math.PI * 2);
  c.fill();
  c.stroke();
  c.fillStyle = "#ffb347";
  c.beginPath();
  c.ellipse(280, 26, 26, 6, 0, 0, Math.PI * 2);
  c.fill();
}

/** Een kaartje met één of twee rondjes voor de getallen (b × h). */
export function tekenKaartje(c: C, b: number, h: number, kleur: string, rondjes: number) {
  c.lineWidth = 4;
  c.strokeStyle = "#1b1f33";
  c.fillStyle = kleur;
  rondeRechthoek(c, 4, 4, b - 8, h - 8, 18);
  c.fill();
  c.stroke();
  c.fillStyle = "rgba(255,255,255,0.22)";
  rondeRechthoek(c, 10, 10, b - 20, (h - 20) / 2, 12);
  c.fill();
  c.fillStyle = "#ffffff";
  const r = Math.min(h / 2 - 16, rondjes === 2 ? b / 4 - 10 : b / 2 - 16);
  const xs = rondjes === 2 ? [b / 4 + 4, (3 * b) / 4 - 4] : [b / 2];
  for (const x of xs) {
    c.beginPath();
    c.arc(x, h / 2, r, 0, Math.PI * 2);
    c.fill();
    c.stroke();
  }
}

/** Een grammofoonplaat met een gekleurd midden voor het getal (d × d). */
export function tekenPlaat(c: C, d: number, kleur: string) {
  const m = d / 2;
  c.fillStyle = "#1b1f33";
  c.beginPath();
  c.arc(m, m, m - 3, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = "rgba(255,255,255,0.18)";
  c.lineWidth = 1.5;
  for (let r = m - 12; r > m * 0.5; r -= 7) {
    c.beginPath();
    c.arc(m, m, r, 0, Math.PI * 2);
    c.stroke();
  }
  c.fillStyle = kleur;
  c.beginPath();
  c.arc(m, m, m * 0.46, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = "#ffffff";
  c.lineWidth = 3;
  c.stroke();
}

/** Een lichtbundel van een spot (60 × 300), van fel bovenaan naar niets. */
export function tekenBundel(c: C, kleur: string) {
  const g = c.createLinearGradient(0, 0, 0, 300);
  g.addColorStop(0, kleur);
  g.addColorStop(1, "rgba(255,255,255,0)");
  c.fillStyle = g;
  c.globalAlpha = 0.5;
  c.beginPath();
  c.moveTo(24, 0);
  c.lineTo(36, 0);
  c.lineTo(60, 300);
  c.lineTo(0, 300);
  c.closePath();
  c.fill();
  c.globalAlpha = 1;
}

/** Een kaartje met een som (b × h), zoals een krijtbordje. */
export function tekenSomkaart(c: C, b: number, h: number, nacht: boolean) {
  c.lineWidth = 4;
  c.strokeStyle = nacht ? "#c9b6ff" : "#5b3a1e";
  c.fillStyle = nacht ? "rgba(30,24,70,0.92)" : "#2f5d50";
  rondeRechthoek(c, 4, 4, b - 8, h - 8, 16);
  c.fill();
  c.stroke();
  if (!nacht) {
    c.strokeStyle = "#c98b4e";
    c.lineWidth = 6;
    rondeRechthoek(c, 9, 9, b - 18, h - 18, 12);
    c.stroke();
  }
}

/* ---------- bus ---------- */

export const BUS = {
  x: 30,
  b: 650,
  /** Onderkant van de bus (zonder wielen). */
  onder: 620,
  ruit: { b: 46, h: 58, gat: 6, pilaar: 16, x0: 48 },
  deur: { x: 585, b: 52 },
  /** Boven- en onderkant van de rij ramen: enkel en dubbel. */
  rijEnkel: 400,
  rijBoven: 236,
  rijOnder: 416,
};

/** De x van het midden van ruitje i (0–9). */
export function ruitX(i: number) {
  const r = BUS.ruit;
  return r.x0 + i * (r.b + r.gat) + (i >= 5 ? r.pilaar - r.gat : 0) + r.b / 2;
}

export function busBoven(dubbel: boolean) {
  return dubbel ? 190 : 350;
}

/** De bus (rijdt naar rechts; de deur zit voorin, rechts). Het plaatje is 700 × 520, met (0,0) op (BUS.x - 20, 160). */
export const BUS_PLAATJE = { x0: BUS.x - 20, y0: 160, b: 700, h: 520 };

export function tekenBus(c: C, dubbel: boolean) {
  const o = BUS_PLAATJE;
  c.save();
  c.translate(-o.x0, -o.y0);
  const boven = busBoven(dubbel);
  const { x, b, onder } = BUS;
  c.lineJoin = "round";
  c.lineWidth = 5;
  c.strokeStyle = "#2b2f45";
  /* de bak */
  c.fillStyle = "#e8483f";
  rondeRechthoek(c, x, boven, b, onder - boven, 28);
  c.fill();
  c.stroke();
  /* een witte streep */
  c.fillStyle = "#ffffff";
  c.fillRect(x + 3, onder - 70, b - 6, 18);
  /* de ramen */
  const rijen = dubbel ? [BUS.rijBoven, BUS.rijOnder] : [BUS.rijEnkel];
  for (const y of rijen) {
    for (let i = 0; i < 10; i++) {
      c.fillStyle = "#cfefff";
      rondeRechthoek(c, ruitX(i) - BUS.ruit.b / 2, y, BUS.ruit.b, BUS.ruit.h, 8);
      c.fill();
      c.lineWidth = 3;
      c.stroke();
    }
  }
  /* de deur */
  const d = BUS.deur;
  const deurBoven = dubbel ? BUS.rijOnder - 6 : BUS.rijEnkel - 6;
  c.fillStyle = "#cfefff";
  c.lineWidth = 4;
  rondeRechthoek(c, d.x, deurBoven, d.b, onder - deurBoven - 8, 8);
  c.fill();
  c.stroke();
  c.beginPath();
  c.moveTo(d.x + d.b / 2, deurBoven);
  c.lineTo(d.x + d.b / 2, onder - 8);
  c.stroke();
  /* de voorruit */
  c.fillStyle = "#cfefff";
  rondeRechthoek(c, x + b - 36, (dubbel ? BUS.rijOnder : BUS.rijEnkel) - 6, 26, 90, 8);
  c.fill();
  c.stroke();
  if (dubbel) {
    rondeRechthoek(c, x + b - 36, BUS.rijBoven, 26, 70, 8);
    c.fill();
    c.stroke();
  }
  /* lampen */
  c.fillStyle = "#ffe066";
  c.beginPath();
  c.arc(x + b - 14, onder - 30, 9, 0, Math.PI * 2);
  c.fill();
  c.stroke();
  /* de wielen */
  for (const wx of [x + 120, x + b - 150]) {
    c.fillStyle = "#2b2f45";
    c.beginPath();
    c.arc(wx, onder + 6, 40, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#c9ced6";
    c.beginPath();
    c.arc(wx, onder + 6, 16, 0, Math.PI * 2);
    c.fill();
  }
  c.restore();
}

export const KIND_KLEUREN = ["#ffb347", "#7cc6ff", "#69d26a", "#ff6fae", "#b67cff", "#ffe066", "#3fd0c8"];
const HUID = ["#f5c9a0", "#d79b6a", "#8d5a3b", "#f0b98a", "#b97a4f"];
const HAAR = ["#4a2a14", "#1b1f33", "#e0a840", "#8a3b1e", "#2b2f45"];

/** Een kinderhoofdje met schouders achter het raam (40 × 50). */
export function tekenHoofd(c: C, nr: number) {
  c.lineWidth = 2.5;
  c.strokeStyle = "#2b2f45";
  c.fillStyle = KIND_KLEUREN[nr % KIND_KLEUREN.length];
  c.beginPath();
  c.ellipse(20, 52, 18, 16, 0, Math.PI, 0);
  c.fill();
  c.stroke();
  c.fillStyle = HUID[nr % HUID.length];
  c.beginPath();
  c.arc(20, 22, 13, 0, Math.PI * 2);
  c.fill();
  c.stroke();
  c.fillStyle = HAAR[(nr * 3) % HAAR.length];
  c.beginPath();
  c.arc(20, 19, 13, Math.PI * 1.05, Math.PI * 1.95);
  c.fill();
  c.fillStyle = "#2b2f45";
  c.beginPath();
  c.arc(15, 23, 1.8, 0, Math.PI * 2);
  c.arc(25, 23, 1.8, 0, Math.PI * 2);
  c.fill();
  c.beginPath();
  c.arc(20, 26, 4, 0.2, Math.PI - 0.2);
  c.stroke();
}

/** Een kind dat bij de halte staat (44 × 90). */
export function tekenKind(c: C, nr: number) {
  c.lineWidth = 2.5;
  c.lineJoin = "round";
  c.lineCap = "round";
  c.strokeStyle = "#2b2f45";
  /* benen */
  c.fillStyle = "#3a4a7a";
  rondeRechthoek(c, 12, 58, 8, 28, 3);
  c.fill();
  c.stroke();
  rondeRechthoek(c, 24, 58, 8, 28, 3);
  c.fill();
  c.stroke();
  /* lijf */
  c.fillStyle = KIND_KLEUREN[nr % KIND_KLEUREN.length];
  rondeRechthoek(c, 8, 32, 28, 32, 9);
  c.fill();
  c.stroke();
  /* hoofd */
  c.fillStyle = HUID[nr % HUID.length];
  c.beginPath();
  c.arc(22, 18, 13, 0, Math.PI * 2);
  c.fill();
  c.stroke();
  c.fillStyle = HAAR[(nr * 3) % HAAR.length];
  c.beginPath();
  c.arc(22, 15, 13, Math.PI * 1.05, Math.PI * 1.95);
  c.fill();
  c.fillStyle = "#2b2f45";
  c.beginPath();
  c.arc(17, 19, 1.8, 0, Math.PI * 2);
  c.arc(27, 19, 1.8, 0, Math.PI * 2);
  c.fill();
  c.beginPath();
  c.arc(22, 22, 4, 0.2, Math.PI - 0.2);
  c.stroke();
}

/** Een donkerblauw rondje (voor het getal van de instappers, 130 × 130). */
export function tekenRondje(c: C) {
  c.fillStyle = "#1f3f8f";
  c.strokeStyle = "#ffffff";
  c.lineWidth = 5;
  c.beginPath();
  c.arc(65, 65, 60, 0, Math.PI * 2);
  c.fill();
  c.stroke();
}

/* ---------- rek (de uitleg van Bliepo) ---------- */

export const REK = { vak: 58, gat5: 22, rijGat: 70 };

/** Het paneel van het rek (rijen van 10 vakjes). */
export function rekMaat(rijen: number) {
  return { b: 10 * REK.vak + REK.gat5 + 40, h: rijen * REK.rijGat + 30 };
}

export function tekenRek(c: C, rijen: number, nacht: boolean) {
  const { b, h } = rekMaat(rijen);
  c.fillStyle = nacht ? "rgba(20,16,50,0.9)" : "rgba(255,255,255,0.94)";
  c.strokeStyle = nacht ? "#c9b6ff" : "#5d6a86";
  c.lineWidth = 4;
  rondeRechthoek(c, 3, 3, b - 6, h - 6, 20);
  c.fill();
  c.stroke();
  c.lineWidth = 2.5;
  for (let r = 0; r < rijen; r++)
    for (let i = 0; i < 10; i++) {
      const { x, y } = rekVakje(r * 10 + i, rijen);
      c.strokeStyle = nacht ? "rgba(201,182,255,0.7)" : "#9db4c8";
      c.beginPath();
      c.arc(x + b / 2, y + h / 2, REK.vak / 2 - 6, 0, Math.PI * 2);
      c.stroke();
    }
}

/** Het midden van vakje k (0–19) ten opzichte van het midden van het rek. */
export function rekVakje(k: number, rijen: number) {
  const r = Math.floor(k / 10);
  const i = k % 10;
  const x = -(10 * REK.vak + REK.gat5) / 2 + i * REK.vak + (i >= 5 ? REK.gat5 : 0) + REK.vak / 2;
  const y = (r - (rijen - 1) / 2) * REK.rijGat;
  return { x, y };
}

export function tekenStip(c: C, kleur: string) {
  c.fillStyle = kleur;
  c.strokeStyle = "rgba(0,0,0,0.35)";
  c.lineWidth = 2;
  c.beginPath();
  c.arc(25, 25, 21, 0, Math.PI * 2);
  c.fill();
  c.stroke();
  c.fillStyle = "rgba(255,255,255,0.45)";
  c.beginPath();
  c.arc(18, 17, 6, 0, Math.PI * 2);
  c.fill();
}

/* ---------- kale sommen (sierplaatje) ---------- */

export function tekenPlus(c: C, kleur: string) {
  c.fillStyle = kleur;
  c.strokeStyle = "#ffffff";
  c.lineWidth = 5;
  rondeRechthoek(c, 70, 10, 60, 180, 22);
  c.fill();
  c.stroke();
  rondeRechthoek(c, 10, 70, 180, 60, 22);
  c.fill();
  c.stroke();
  c.fillStyle = kleur;
  c.fillRect(73, 73, 54, 54);
}

export function tekenCijfer(c: C, cijfer: string, kleur: string) {
  c.font = "bold 64px Fredoka, 'Work Sans', system-ui, sans-serif";
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.lineWidth = 6;
  c.strokeStyle = "rgba(255,255,255,0.9)";
  c.strokeText(cijfer, 40, 44);
  c.fillStyle = kleur;
  c.fillText(cijfer, 40, 44);
}

/** "#rrggbb" → 0xrrggbb */
export function hex(k: string) {
  return parseInt(k.slice(1), 16);
}
