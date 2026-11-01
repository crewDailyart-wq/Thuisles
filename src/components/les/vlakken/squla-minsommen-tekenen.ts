/**
 * Rekenmateriaal en woorden voor de lessen "Minsommen" naar Squla groep 3
 * (30-31 oktober 2026, opdracht eigenaar). Echte dingen (raketjes, de bus,
 * pakjes, bekers …) zijn GEEN tekening meer: dat zijn vaste plaatjes uit
 * public/voorwerpen (src/lib/voorwerpen/lijst-minsommen.ts, WISSELEN.md). Hier
 * staat alleen wat rekenmateriaal is en in code getekend blijft: de stippen,
 * de min-machine met band en blokken, de pijlen en het luidsprekertje. Geld komt
 * uit public/geld/ (zie BRON.md daar).
 */

/** Wat er weggaat in de ruimte-sommen (in plaats van de dieren van Squla); de naam is ook het voorwerp. */
export type Ding = "raketje" | "ballon" | "zeepbel" | "ufo" | "satelliet" | "ster" | "komeet";
/** Wat je kunt kopen (namen van voorwerpen). */
export type Speelgoed = "ijsje" | "bal" | "boek" | "ballon" | "vlieger";
/** Bekers of bordjes (het woord in de zin; de plaatjes heten beker-vol, beker-leeg, bord en koekje). */
export type Bakje = "beker" | "bordje";

/** Kleurnamen zoals in de zinnen van Bliepo ({6:geel}). */
export type Kleurnaam = "rood" | "oranje" | "geel" | "groen" | "blauw" | "paars" | "roze" | "wit";

/** Per ding: de kleur (voor de getallen in de zin en de gloed) en de woorden. */
export const DING: Record<Ding, { vul: string; kleur: Kleurnaam; een: string; veel: string }> = {
  raketje: { vul: "#ff6b6b", kleur: "rood", een: "raketje", veel: "raketjes" },
  ballon: { vul: "#ff9fd2", kleur: "roze", een: "ballon", veel: "ballonnen" },
  zeepbel: { vul: "#8fc4ff", kleur: "blauw", een: "bel", veel: "bellen" },
  ufo: { vul: "#c9a2ff", kleur: "paars", een: "ufo", veel: "ufo's" },
  satelliet: { vul: "#7ee0a0", kleur: "groen", een: "satelliet", veel: "satellieten" },
  ster: { vul: "#ffe066", kleur: "geel", een: "ster", veel: "sterren" },
  komeet: { vul: "#ffad5c", kleur: "oranje", een: "komeet", veel: "kometen" },
};

export const hexGetal = (h: string) => parseInt(h.slice(1), 16);

type C = CanvasRenderingContext2D;

function lijn(c: C, kleur: string, breed: number) {
  c.strokeStyle = kleur;
  c.lineWidth = breed;
  c.lineJoin = "round";
  c.lineCap = "round";
}

/** Een stip voor de uitleg van Bliepo (rond, warm geel). */
export function tekenStip(c: C, d: number) {
  const g = c.createRadialGradient(d * 0.38, d * 0.35, 1, d / 2, d / 2, d / 2 - 2);
  g.addColorStop(0, "#fff6c4");
  g.addColorStop(1, "#ffc93d");
  c.fillStyle = g;
  c.beginPath();
  c.arc(d / 2, d / 2, d / 2 - 3, 0, Math.PI * 2);
  c.fill();
  lijn(c, "#e8962a", 2.5);
  c.stroke();
}


/** Een rode gebogen pijl van de deur naar buiten (130 × 110). */
export function tekenPijl(c: C) {
  lijn(c, "#ff5a5a", 9);
  c.beginPath();
  c.moveTo(14, 96);
  c.quadraticCurveTo(40, 14, 104, 40);
  c.stroke();
  c.fillStyle = "#ff5a5a";
  c.beginPath();
  c.moveTo(124, 50);
  c.lineTo(92, 56);
  c.lineTo(104, 24);
  c.closePath();
  c.fill();
}

/* ======================= machine, bord, bakjes, speelgoed ======================= */

export function tekenBand(c: C, b: number, bulten = true) {
  c.fillStyle = "#4a5578";
  c.beginPath();
  c.roundRect(4, 8, b - 8, 26, 13);
  c.fill();
  c.fillStyle = "#6b7aa6";
  for (let x = 24; bulten && x < b - 20; x += 46) {
    c.beginPath();
    c.arc(x, 21, 8, 0, Math.PI * 2);
    c.fill();
  }
  lijn(c, "#2f3756", 3);
  c.beginPath();
  c.roundRect(4, 8, b - 8, 26, 13);
  c.stroke();
}

/* Mengt een kleur (#rrggbb) met wit (f > 0) of zwart (f < 0). */
function meng(hex: string, f: number) {
  const n = parseInt(hex.slice(1), 16);
  const kan = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(f >= 0 ? v + (255 - v) * f : v * (1 + f)));
  return `rgb(${kan[0]},${kan[1]},${kan[2]})`;
}

/**
 * Een stukje voor de min-machine (m × m): een glimmend, afgerond blokje in de kleur van zijn getal
 * (glansstijl B: kleurverloop, dunne rand in een donkere tint, lichtvlekje, zachte schaduw), apart te tellen.
 */
export function tekenStuk(c: C, hex: string, m: number) {
  const r = m * 0.24;
  const z = m * 0.08;
  /* schaduw */
  c.fillStyle = "rgba(0,0,0,0.28)";
  c.beginPath();
  c.ellipse(m / 2, m - z * 0.9, m * 0.36, z * 0.8, 0, 0, Math.PI * 2);
  c.fill();
  const gr = c.createLinearGradient(0, z, m, m - z);
  gr.addColorStop(0, meng(hex, 0.45));
  gr.addColorStop(0.5, hex);
  gr.addColorStop(1, meng(hex, -0.3));
  c.fillStyle = gr;
  c.beginPath();
  c.roundRect(z, z, m - 2 * z, m - 3 * z, r);
  c.fill();
  lijn(c, meng(hex, -0.55), 2);
  c.stroke();
  /* lichtvlekje */
  c.fillStyle = "rgba(255,255,255,0.6)";
  c.beginPath();
  c.roundRect(m * 0.2, m * 0.17, m * 0.34, m * 0.1, m * 0.05);
  c.fill();
}

/** Het bakje onder de machine (voorkant), w × h; de stukjes die erin vallen steken erboven uit. */
export function tekenBak(c: C, w: number, h: number) {
  const gr = c.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, "#8b9bd0");
  gr.addColorStop(1, "#4a5885");
  c.fillStyle = gr;
  c.beginPath();
  c.moveTo(2, 4);
  c.lineTo(w - 2, 4);
  c.lineTo(w - 22, h - 4);
  c.lineTo(22, h - 4);
  c.closePath();
  c.fill();
  lijn(c, "#2f3756", 3);
  c.stroke();
  c.fillStyle = "rgba(255,255,255,0.35)";
  c.beginPath();
  c.roundRect(12, 8, w - 24, 6, 3);
  c.fill();
}

/** Het luikje onderaan de machine waar de stukjes uitvallen (w × h). */
export function tekenKlep(c: C, w: number, h: number) {
  c.fillStyle = "#2c2466";
  c.beginPath();
  c.roundRect(2, 2, w - 4, h - 4, h / 2);
  c.fill();
  lijn(c, "#4a3aa0", 2);
  c.stroke();
}

/** Een zacht rond lichtje (lampjes, stoom, vonkjes), d × d, in wit; de kleur komt er als tint op. */
export function tekenLichtje(c: C, d: number) {
  const g = c.createRadialGradient(d / 2, d / 2, 0, d / 2, d / 2, d / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.45, "rgba(255,255,255,0.55)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  c.fillStyle = g;
  c.fillRect(0, 0, d, d);
}

/** De min-machine (240 × 250); het venster (getal) komt er los op. */
export function tekenMachine(c: C) {
  /* trechter */
  c.fillStyle = "#9aa7c9";
  c.beginPath();
  c.moveTo(80, 8);
  c.lineTo(160, 8);
  c.lineTo(140, 40);
  c.lineTo(100, 40);
  c.closePath();
  c.fill();
  lijn(c, "#4a5578", 3);
  c.stroke();
  /* kast */
  c.fillStyle = "#7d6bd6";
  c.beginPath();
  c.roundRect(14, 38, 212, 200, 24);
  c.fill();
  lijn(c, "#4a3aa0", 4);
  c.stroke();
  /* venster */
  c.fillStyle = "#f4f7ff";
  c.beginPath();
  c.roundRect(48, 70, 144, 96, 16);
  c.fill();
  lijn(c, "#4a3aa0", 4);
  c.stroke();
  /* lampjes en knop */
  for (const [x, k] of [
    [58, "#ff7b7b"],
    [86, "#ffe066"],
    [114, "#7ee0a0"],
  ] as const) {
    c.fillStyle = k;
    c.beginPath();
    c.arc(x, 196, 9, 0, Math.PI * 2);
    c.fill();
  }
  c.fillStyle = "#ffad5c";
  c.beginPath();
  c.roundRect(150, 184, 46, 26, 10);
  c.fill();
  /* opening links en rechts */
  c.fillStyle = "#2f2366";
  c.beginPath();
  c.roundRect(4, 186, 20, 40, 6);
  c.roundRect(216, 186, 20, 40, 6);
  c.fill();
}

/** Een blok op de band (130 × 110); het getal komt er los op. */
export function tekenBlok(c: C) {
  c.fillStyle = "#ffad5c";
  c.beginPath();
  c.roundRect(4, 4, 122, 102, 18);
  c.fill();
  lijn(c, "#d9701e", 4);
  c.stroke();
  c.fillStyle = "rgba(255,255,255,0.35)";
  c.beginPath();
  c.roundRect(14, 12, 60, 12, 6);
  c.fill();
}

/** Een dikke pijl naar rechts (70 × 40). */
export function tekenPijlRechts(c: C) {
  c.fillStyle = "#ffffff";
  c.beginPath();
  c.moveTo(4, 14);
  c.lineTo(44, 14);
  c.lineTo(44, 4);
  c.lineTo(66, 20);
  c.lineTo(44, 36);
  c.lineTo(44, 26);
  c.lineTo(4, 26);
  c.closePath();
  c.fill();
}

/** Een luidspreker (luistervraag zonder som in beeld), 160 × 140. */
export function tekenLuister(c: C) {
  c.fillStyle = "#ffffff";
  c.beginPath();
  c.moveTo(20, 50);
  c.lineTo(52, 50);
  c.lineTo(92, 16);
  c.lineTo(92, 124);
  c.lineTo(52, 90);
  c.lineTo(20, 90);
  c.closePath();
  c.fill();
  lijn(c, "#ffffff", 9);
  for (const r of [26, 50]) {
    c.beginPath();
    c.arc(96, 70, r, -0.7, 0.7);
    c.stroke();
  }
}
