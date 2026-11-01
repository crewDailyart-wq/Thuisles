/**
 * Het rekenmateriaal van de lessen "Vormen en figuren" naar Squla (31 oktober
 * 2026), strak in code getekend: kralen, platte en ruimtelijke vormen, een
 * grasveld, een plattegrond, een hinkelbaan, een huisje van boven/voren/onder,
 * een bouwsel van blokken en de puzzelplaatjes. Echte dingen (fruit, ballen,
 * boeken …) zijn GEEN tekening hier: die komen uit public/voorwerpen (zie
 * src/components/les/voorwerpen.ts), ook in de puzzelplaatjes.
 *
 * Alles tekent in een vak van (0, 0) tot (b, h), vlak, met dezelfde donkere
 * rand als de voorwerpen.
 */

import { tekenVoorwerp } from "../voorwerpen";

export type Kleur = "rood" | "oranje" | "geel" | "groen" | "blauw" | "paars" | "roze" | "lichtblauw" | "bruin";

export const KLEUR: Record<Kleur, string> = {
  rood: "#e8453c",
  oranje: "#ff9a3c",
  geel: "#ffd93b",
  groen: "#55c26f",
  blauw: "#4b8af5",
  paars: "#9b6be0",
  roze: "#f48fb1",
  lichtblauw: "#7fd3f5",
  bruin: "#a86b3c",
};

/** Hoe Bliepo de kleur noemt: "rood", en vóór een woord: "rode". */
export const KLEURWOORD: Record<Kleur, [string, string]> = {
  rood: ["rood", "rode"],
  oranje: ["oranje", "oranje"],
  geel: ["geel", "gele"],
  groen: ["groen", "groene"],
  blauw: ["blauw", "blauwe"],
  paars: ["paars", "paarse"],
  roze: ["roze", "roze"],
  lichtblauw: ["lichtblauw", "lichtblauwe"],
  bruin: ["bruin", "bruine"],
};

export type Platvorm = "cirkel" | "driehoek" | "vierkant" | "rechthoek" | "ster" | "zeshoek" | "halfring";
export type Ruimtevorm = "bol" | "cilinder" | "kegel" | "kubus" | "piramide";
export type VormNaam = Platvorm | Ruimtevorm;

export const RAND_KLEUR = "#1d2b5e";
const LEEG_RAND = "rgba(220,236,255,0.85)";

/** Een kleur lichter (f > 0) of donkerder (f < 0). */
export function tint(hex: string, f: number): string {
  const n = parseInt(hex.slice(1), 16);
  const kanaal = (v: number) => Math.round(f >= 0 ? v + (255 - v) * f : v * (1 + f));
  const r = kanaal((n >> 16) & 255);
  const g = kanaal((n >> 8) & 255);
  const b = kanaal(n & 255);
  return `rgb(${r},${g},${b})`;
}

function vulRand(c: CanvasRenderingContext2D, vul: string | null, dik = 4) {
  c.lineJoin = "round";
  c.lineCap = "round";
  if (vul) {
    c.fillStyle = vul;
    c.fill();
    c.strokeStyle = RAND_KLEUR;
    c.lineWidth = dik;
    c.stroke();
  } else {
    c.setLineDash([9, 8]);
    c.strokeStyle = LEEG_RAND;
    c.lineWidth = 4;
    c.stroke();
    c.setLineDash([]);
  }
}

/* ---------- kralen ---------- */

/** Een kraal (met een gaatje), of een lege plek (stippellijn) als `kleur` null is. */
export function tekenKraal(c: CanvasRenderingContext2D, x: number, y: number, r: number, kleur: Kleur | null) {
  c.beginPath();
  c.arc(x, y, r - 3, 0, Math.PI * 2);
  vulRand(c, kleur ? KLEUR[kleur] : null);
  if (!kleur) return;
  c.beginPath();
  c.ellipse(x - r * 0.32, y - r * 0.36, r * 0.22, r * 0.14, -0.6, 0, Math.PI * 2);
  c.fillStyle = "rgba(255,255,255,0.55)";
  c.fill();
}

/* ---------- vormen ---------- */

function sterPad(c: CanvasRenderingContext2D, x: number, y: number, R: number, r: number) {
  c.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const s = i % 2 ? r : R;
    if (i) c.lineTo(x + s * Math.cos(a), y + s * Math.sin(a));
    else c.moveTo(x + s * Math.cos(a), y + s * Math.sin(a));
  }
  c.closePath();
}

/**
 * Glansstijl B (1 november 2026, goedgekeurd door Sara na de proef in squla-vormen-kleuren-2): platte vormen met een zacht
 * kleurverloop, een glimmend lichtvlekje en een zachte schaduw eronder, zodat
 * ze meer diepte krijgen, met een dunne rand en een zachte vaste gloed. Geldt voor alle vormenlessen. Wordt één keer in
 * een plaatje gebakken, dus kost niets aan snelheid. Oude versie: plaatjes-backup/proef-glans/.
 */
export const VORMSTIJL = { glans: true, gloed: true };

const PLATTE = new Set<VormNaam>(["cirkel", "vierkant", "rechthoek", "driehoek", "ster", "zeshoek"]);

/** De omtrek van een platte vorm, als Path2D (voor vullen, rand en het lichtvlekje binnen de vorm). */
function plattePad(vorm: VormNaam, m: number): Path2D {
  const p = new Path2D();
  const x = m / 2;
  const y = m / 2;
  const r = (x0: number, y0: number, b: number, h: number, k: number) => p.roundRect(x0, y0, b, h, k);
  switch (vorm) {
    case "cirkel":
      p.arc(x, y, m * 0.42, 0, Math.PI * 2);
      break;
    case "vierkant":
      r(m * 0.11, m * 0.09, m * 0.78, m * 0.78, m * 0.05);
      break;
    case "rechthoek":
      r(m * 0.25, m * 0.05, m * 0.5, m * 0.84, m * 0.05);
      break;
    case "driehoek":
      p.moveTo(x, m * 0.08);
      p.lineTo(m * 0.93, m * 0.84);
      p.lineTo(m * 0.07, m * 0.84);
      p.closePath();
      break;
    case "ster":
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        const s = i % 2 ? m * 0.2 : m * 0.46;
        if (i) p.lineTo(x + s * Math.cos(a), y + m * 0.02 + s * Math.sin(a));
        else p.moveTo(x + s * Math.cos(a), y + m * 0.02 + s * Math.sin(a));
      }
      p.closePath();
      break;
    default:
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i;
        if (i) p.lineTo(x + m * 0.45 * Math.cos(a), y + m * 0.45 * Math.sin(a));
        else p.moveTo(x + m * 0.45 * Math.cos(a), y + m * 0.45 * Math.sin(a));
      }
      p.closePath();
  }
  return p;
}

function tekenGlansVorm(c: CanvasRenderingContext2D, vorm: VormNaam, m: number, hex: string, dik: number) {
  const pad = plattePad(vorm, m);
  /* zachte schaduw eronder */
  const sch = c.createRadialGradient(m / 2, m * 0.93, 0, m / 2, m * 0.93, m * 0.36);
  sch.addColorStop(0, "rgba(0,0,20,0.42)");
  sch.addColorStop(1, "rgba(0,0,20,0)");
  c.save();
  c.translate(m / 2, m * 0.93);
  c.scale(1, 0.16);
  c.translate(-m / 2, -m * 0.93);
  c.fillStyle = sch;
  c.fillRect(0, m * 0.5, m, m * 0.86);
  c.restore();
  /* zacht kleurverloop: licht linksboven, donkerder rechtsonder */
  const g = c.createLinearGradient(m * 0.2, m * 0.08, m * 0.8, m * 0.92);
  g.addColorStop(0, tint(hex, 0.38));
  g.addColorStop(0.5, hex);
  g.addColorStop(1, tint(hex, -0.24));
  c.fillStyle = g;
  if (VORMSTIJL.gloed) {
    /* zachte vaste gloed in de eigen kleur (één keer gebakken); de vorm zelf blijft vol en stevig */
    c.save();
    c.shadowColor = tint(hex, 0.25);
    c.shadowBlur = m * 0.09;
    c.fill(pad);
    c.fill(pad);
    c.restore();
  }
  c.fill(pad);
  /* glimmend lichtvlekje, binnen de vorm */
  c.save();
  c.clip(pad);
  const lx = vorm === "rechthoek" ? m * 0.38 : vorm === "driehoek" ? m * 0.42 : m * 0.32;
  const ly = vorm === "driehoek" ? m * 0.38 : vorm === "ster" ? m * 0.36 : m * 0.27;
  const vlek = c.createRadialGradient(lx, ly, 0, lx, ly, m * 0.2);
  vlek.addColorStop(0, "rgba(255,255,255,0.85)");
  vlek.addColorStop(0.35, "rgba(255,255,255,0.35)");
  vlek.addColorStop(1, "rgba(255,255,255,0)");
  c.fillStyle = vlek;
  c.beginPath();
  c.ellipse(lx, ly, m * 0.2, m * 0.13, -0.6, 0, Math.PI * 2);
  c.fill();
  c.restore();
  /* één dunne rand in een donkere tint van de eigen kleur (Sara 1 nov: de dikke donkere rand was te dik) */
  c.lineJoin = "round";
  c.strokeStyle = tint(hex, -0.45);
  c.lineWidth = Math.max(1.5, dik * 0.45);
  c.stroke(pad);
}

/**
 * Glansstijl B voor de ruimtelijke vormen (bol, cilinder, kegel, kubus, piramide): zacht kleurverloop (licht
 * linksboven, donkerder rechtsonder), een zachte vaste gloed in de eigen kleur en één dunne rand in een
 * donkere tint van de eigen kleur (BOUWREGELS 7.7). Eén keer gebakken in het plaatje.
 */
function vulGlans(c: CanvasRenderingContext2D, kleur: string, dik: number, m: number) {
  c.lineJoin = "round";
  c.lineCap = "round";
  const g = c.createLinearGradient(m * 0.2, m * 0.08, m * 0.8, m * 0.92);
  g.addColorStop(0, tint(hexVan(kleur), 0.3));
  g.addColorStop(0.5, kleur);
  g.addColorStop(1, tint(hexVan(kleur), -0.22));
  if (VORMSTIJL.gloed) {
    c.save();
    c.shadowColor = tint(hexVan(kleur), 0.25);
    c.shadowBlur = m * 0.07;
    c.fillStyle = kleur;
    c.fill();
    c.restore();
  }
  c.fillStyle = g;
  c.fill();
  c.strokeStyle = tint(hexVan(kleur), -0.45);
  c.lineWidth = Math.max(1.5, dik * 0.45);
  c.stroke();
}

/** `tint` rekent met #rrggbb; een kleur als "rgb(…)" (al gemengd) wordt eerst teruggezet. */
function hexVan(k: string): string {
  if (k.startsWith("#")) return k;
  const m = /rgb\((\d+),(\d+),(\d+)\)/.exec(k);
  if (!m) return "#cccccc";
  return "#" + [m[1], m[2], m[3]].map((v) => Number(v).toString(16).padStart(2, "0")).join("");
}

/**
 * Een vorm in het vak (0, 0)–(m, m). `kleur` null = lege plek (stippellijn).
 * `draai` (alleen de halve ring): 0 = open aan de onderkant, 1 = open links,
 * 2 = open boven, 3 = open rechts.
 */
export function tekenVorm(c: CanvasRenderingContext2D, vorm: VormNaam, m: number, kleur: Kleur | null, draai = 0) {
  const x = m / 2;
  const y = m / 2;
  const hex = kleur ? KLEUR[kleur] : null;
  const dik = Math.max(3, m / 40);
  if (VORMSTIJL.glans && hex && PLATTE.has(vorm)) return tekenGlansVorm(c, vorm, m, hex, dik);
  switch (vorm) {
    case "cirkel":
      c.beginPath();
      c.arc(x, y, m * 0.44, 0, Math.PI * 2);
      vulRand(c, hex, dik);
      return;
    case "vierkant":
      c.beginPath();
      c.rect(m * 0.1, m * 0.1, m * 0.8, m * 0.8);
      vulRand(c, hex, dik);
      return;
    case "rechthoek":
      c.beginPath();
      c.rect(m * 0.24, m * 0.06, m * 0.52, m * 0.88);
      vulRand(c, hex, dik);
      return;
    case "driehoek":
      c.beginPath();
      c.moveTo(x, m * 0.08);
      c.lineTo(m * 0.94, m * 0.86);
      c.lineTo(m * 0.06, m * 0.86);
      c.closePath();
      vulRand(c, hex, dik);
      return;
    case "ster":
      sterPad(c, x, y + m * 0.03, m * 0.47, m * 0.2);
      vulRand(c, hex, dik);
      return;
    case "zeshoek":
      c.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i;
        const px = x + m * 0.47 * Math.cos(a);
        const py = y + m * 0.47 * Math.sin(a);
        if (i) c.lineTo(px, py);
        else c.moveTo(px, py);
      }
      c.closePath();
      vulRand(c, hex, dik);
      return;
    case "halfring": {
      c.save();
      c.translate(x, y);
      c.rotate((draai * Math.PI) / 2);
      /* open aan de onderkant: de boog zit boven */
      c.beginPath();
      c.arc(0, m * 0.12, m * 0.4, Math.PI, 0);
      c.lineTo(m * 0.22, m * 0.12);
      c.arc(0, m * 0.12, m * 0.22, 0, Math.PI, true);
      c.closePath();
      vulRand(c, hex, dik);
      c.restore();
      return;
    }
    case "bol": {
      const k = hex ?? "#cccccc";
      c.beginPath();
      c.arc(x, y, m * 0.42, 0, Math.PI * 2);
      vulGlans(c, k, dik, m);
      c.beginPath();
      c.ellipse(x, y, m * 0.4, m * 0.12, 0, 0, Math.PI);
      c.strokeStyle = tint(k, -0.3);
      c.lineWidth = dik * 0.8;
      c.stroke();
      c.beginPath();
      c.ellipse(x - m * 0.15, y - m * 0.17, m * 0.09, m * 0.05, -0.7, 0, Math.PI * 2);
      c.fillStyle = "rgba(255,255,255,0.7)";
      c.fill();
      return;
    }
    case "cilinder": {
      const k = hex ?? "#cccccc";
      const l = m * 0.2;
      const r = m * 0.8;
      const top = m * 0.18;
      const onder = m * 0.82;
      const ry = m * 0.09;
      c.beginPath();
      c.moveTo(l, top);
      c.lineTo(l, onder);
      c.ellipse((l + r) / 2, onder, (r - l) / 2, ry, 0, Math.PI, 0, true);
      c.lineTo(r, top);
      c.closePath();
      vulGlans(c, k, dik, m);
      c.beginPath();
      c.ellipse((l + r) / 2, top, (r - l) / 2, ry, 0, 0, Math.PI * 2);
      vulGlans(c, tint(k, 0.35), dik, m);
      return;
    }
    case "kegel": {
      const k = hex ?? "#cccccc";
      const ry = m * 0.09;
      c.beginPath();
      c.moveTo(x, m * 0.08);
      c.lineTo(m * 0.84, m * 0.8);
      c.ellipse(x, m * 0.8, m * 0.34, ry, 0, 0, Math.PI);
      c.closePath();
      vulGlans(c, k, dik, m);
      c.beginPath();
      c.ellipse(x, m * 0.8, m * 0.34, ry, 0, Math.PI, Math.PI * 2);
      c.strokeStyle = tint(k, -0.35);
      c.lineWidth = dik * 0.8;
      c.stroke();
      return;
    }
    case "kubus": {
      const k = hex ?? "#cccccc";
      const z = m * 0.5;
      const dx = m * 0.22;
      const dy = m * 0.16;
      const x0 = m * 0.12;
      const y0 = m * 0.12 + dy;
      /* voorkant */
      c.beginPath();
      c.rect(x0, y0, z, z);
      vulGlans(c, k, dik, m);
      /* bovenkant */
      c.beginPath();
      c.moveTo(x0, y0);
      c.lineTo(x0 + dx, y0 - dy);
      c.lineTo(x0 + dx + z, y0 - dy);
      c.lineTo(x0 + z, y0);
      c.closePath();
      vulGlans(c, tint(k, 0.35), dik, m);
      /* zijkant */
      c.beginPath();
      c.moveTo(x0 + z, y0);
      c.lineTo(x0 + z + dx, y0 - dy);
      c.lineTo(x0 + z + dx, y0 - dy + z);
      c.lineTo(x0 + z, y0 + z);
      c.closePath();
      vulGlans(c, tint(k, -0.25), dik, m);
      return;
    }
    case "piramide": {
      const k = hex ?? "#cccccc";
      const top = { x: m * 0.5, y: m * 0.08 };
      const l = { x: m * 0.1, y: m * 0.8 };
      const mid = { x: m * 0.58, y: m * 0.9 };
      const r = { x: m * 0.92, y: m * 0.74 };
      c.beginPath();
      c.moveTo(top.x, top.y);
      c.lineTo(l.x, l.y);
      c.lineTo(mid.x, mid.y);
      c.closePath();
      vulGlans(c, k, dik, m);
      c.beginPath();
      c.moveTo(top.x, top.y);
      c.lineTo(mid.x, mid.y);
      c.lineTo(r.x, r.y);
      c.closePath();
      vulGlans(c, tint(k, -0.25), dik, m);
      return;
    }
  }
}

/* ---------- pijl ---------- */

/** Een gele pijl met een volle punt; de punt wijst naar beneden en zit onderaan in het midden van het vak (b × h). */
export function tekenPijl(c: CanvasRenderingContext2D, b: number, h: number) {
  const x = b / 2;
  c.beginPath();
  c.moveTo(x - 9, 4);
  c.lineTo(x + 9, 4);
  c.lineTo(x + 9, h - 30);
  c.lineTo(x + 22, h - 30);
  c.lineTo(x, h - 4);
  c.lineTo(x - 22, h - 30);
  c.lineTo(x - 9, h - 30);
  c.closePath();
  c.fillStyle = "#ffd36e";
  c.fill();
  c.strokeStyle = RAND_KLEUR;
  c.lineWidth = 3.5;
  c.lineJoin = "round";
  c.stroke();
}

/* ---------- plekken van bovenaf ---------- */

export type Veldsoort = "gras" | "stad" | "hinkel" | "lucht";

function rondRect(c: CanvasRenderingContext2D, x: number, y: number, b: number, h: number, r: number) {
  c.beginPath();
  c.roundRect(x, y, b, h, r);
}

/** Een grasveld, een plattegrond, een hinkelbaan (van bovenaf) of een stukje lucht met grond (op ooghoogte). */
export function tekenVeld(c: CanvasRenderingContext2D, soort: Veldsoort, b: number, h: number) {
  c.lineJoin = "round";
  if (soort === "gras") {
    rondRect(c, 3, 3, b - 6, h - 6, 10);
    c.fillStyle = "#4fae5f";
    c.fill();
    c.strokeStyle = "rgba(255,255,255,0.9)";
    c.lineWidth = 5;
    c.stroke();
    c.beginPath();
    c.moveTo(b / 2, 8);
    c.lineTo(b / 2, h - 8);
    c.stroke();
    c.beginPath();
    c.arc(b / 2, h / 2, Math.min(b, h) * 0.14, 0, Math.PI * 2);
    c.stroke();
    return;
  }
  if (soort === "stad") {
    /* groene blokken met witte straten ertussen */
    c.fillStyle = "#e9eef7";
    rondRect(c, 0, 0, b, h, 10);
    c.fill();
    const kol = 3;
    const rij = 3;
    const straat = 26;
    const bw = (b - straat * (kol + 1)) / kol;
    const bh = (h - straat * (rij + 1)) / rij;
    for (let i = 0; i < kol; i++)
      for (let j = 0; j < rij; j++) {
        rondRect(c, straat + i * (bw + straat), straat + j * (bh + straat), bw, bh, 8);
        c.fillStyle = (i + j) % 2 ? "#6cc07a" : "#58b26a";
        c.fill();
      }
    return;
  }
  if (soort === "hinkel") {
    rondRect(c, 0, 0, b, h, 10);
    c.fillStyle = "#9aa6b8";
    c.fill();
    /* de stoeptegels */
    c.strokeStyle = "rgba(255,255,255,0.18)";
    c.lineWidth = 2;
    for (let x = 60; x < b; x += 60) {
      c.beginPath();
      c.moveTo(x, 0);
      c.lineTo(x, h);
      c.stroke();
    }
    for (let y = 60; y < h; y += 60) {
      c.beginPath();
      c.moveTo(0, y);
      c.lineTo(b, y);
      c.stroke();
    }
    /* de hinkelbaan van krijt: 1, 2, 3 op een rij, 4-5 naast elkaar, 6, 7-8 naast elkaar */
    const v = 64;
    const x0 = b / 2;
    const vakken: [number, number, number][] = [
      [x0 - v / 2, h - 30 - v, 1],
      [x0 - v / 2, h - 30 - 2 * v, 2],
      [x0 - v / 2, h - 30 - 3 * v, 3],
      [x0 - v, h - 30 - 4 * v, 4],
      [x0, h - 30 - 4 * v, 5],
      [x0 - v / 2, h - 30 - 5 * v, 6],
    ];
    c.strokeStyle = "#ffffff";
    c.lineWidth = 4;
    c.fillStyle = "#ffffff";
    c.font = "bold 30px sans-serif";
    c.textAlign = "center";
    c.textBaseline = "middle";
    for (const [x, y, n] of vakken) {
      if (y < 4) continue;
      c.strokeRect(x, y, v, v);
      c.fillText(String(n), x + v / 2, y + v / 2 + 1);
    }
    return;
  }
  /* lucht: een horizon in het midden (je kijkt recht vooruit) */
  c.fillStyle = "#9fd8f5";
  rondRect(c, 0, 0, b, h, 10);
  c.fill();
  c.fillStyle = "#6cc07a";
  c.beginPath();
  c.roundRect(0, h * 0.62, b, h * 0.38, [0, 0, 10, 10]);
  c.fill();
}

/* ---------- het huisje van boven, van voren en van onder ---------- */

export type Zicht = "boven" | "voren" | "onder";

/**
 * Hetzelfde huisje op drie manieren (vak m × m):
 * - van bovenaf (je vliegt erboven): een groot dak en maar een klein stukje muur;
 * - van voren: muur en dak gewoon;
 * - van onderaf (je ligt in het gras): een hoge muur die naar boven smaller wordt, en maar een klein randje dak.
 */
export function tekenHuis(c: CanvasRenderingContext2D, zicht: Zicht, m: number) {
  const muur = "#fff7ea";
  const dak = "#f2715e";
  const deur = "#d39b62";
  const raam = "#9fd8f5";
  c.lineJoin = "round";
  const vorm = (punten: [number, number][], vul: string) => {
    c.beginPath();
    punten.forEach(([x, y], i) => (i ? c.lineTo(x * m, y * m) : c.moveTo(x * m, y * m)));
    c.closePath();
    vulRand(c, vul, Math.max(3, m / 50));
  };
  if (zicht === "voren") {
    vorm([[0.2, 0.5], [0.8, 0.5], [0.8, 0.92], [0.2, 0.92]], muur);
    vorm([[0.1, 0.52], [0.5, 0.12], [0.9, 0.52]], dak);
    vorm([[0.44, 0.68], [0.56, 0.68], [0.56, 0.92], [0.44, 0.92]], deur);
    vorm([[0.27, 0.6], [0.37, 0.6], [0.37, 0.7], [0.27, 0.7]], raam);
    vorm([[0.63, 0.6], [0.73, 0.6], [0.73, 0.7], [0.63, 0.7]], raam);
    return;
  }
  if (zicht === "boven") {
    /* het dak van bovenaf: twee grote dakvlakken met de nok in het midden */
    vorm([[0.12, 0.1], [0.88, 0.1], [0.88, 0.44], [0.12, 0.44]], dak);
    vorm([[0.12, 0.44], [0.88, 0.44], [0.88, 0.76], [0.12, 0.76]], tint(dak, -0.18));
    vorm([[0.18, 0.76], [0.82, 0.76], [0.82, 0.92], [0.18, 0.92]], muur);
    vorm([[0.46, 0.8], [0.54, 0.8], [0.54, 0.92], [0.46, 0.92]], deur);
    return;
  }
  /* van onderaf: de muur wordt naar boven smaller, het dak is maar een randje */
  vorm([[0.06, 0.94], [0.94, 0.94], [0.8, 0.24], [0.2, 0.24]], muur);
  vorm([[0.18, 0.26], [0.82, 0.26], [0.7, 0.1], [0.3, 0.1]], dak);
  vorm([[0.4, 0.62], [0.6, 0.62], [0.62, 0.94], [0.38, 0.94]], deur);
  vorm([[0.22, 0.44], [0.33, 0.44], [0.32, 0.56], [0.2, 0.56]], raam);
  vorm([[0.67, 0.44], [0.78, 0.44], [0.8, 0.56], [0.68, 0.56]], raam);
}

/* ---------- een bouwsel van blokken (schuin van voren) ---------- */

/** Een trapje van blokken: `kolommen[i]` = de kleuren van onder naar boven. Vak b × h, blok `z` groot. */
export function blokkenMaat(kolommen: Kleur[][], z: number) {
  const hoog = Math.max(...kolommen.map((k) => k.length));
  return { b: kolommen.length * z + z * 0.45 + 10, h: hoog * z + z * 0.32 + 10 };
}

export function tekenBlokken(c: CanvasRenderingContext2D, kolommen: Kleur[][], z: number) {
  const { h } = blokkenMaat(kolommen, z);
  const dx = z * 0.45;
  const dy = z * 0.32;
  const kubus = (x: number, y: number, k: Kleur, boven: boolean, zij: boolean) => {
    const hex = KLEUR[k];
    c.beginPath();
    c.rect(x, y, z, z);
    vulRand(c, hex, 3);
    if (boven) {
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x + dx, y - dy);
      c.lineTo(x + dx + z, y - dy);
      c.lineTo(x + z, y);
      c.closePath();
      vulRand(c, tint(hex, 0.4), 3);
    }
    if (zij) {
      c.beginPath();
      c.moveTo(x + z, y);
      c.lineTo(x + z + dx, y - dy);
      c.lineTo(x + z + dx, y - dy + z);
      c.lineTo(x + z, y + z);
      c.closePath();
      vulRand(c, tint(hex, -0.25), 3);
    }
  };
  kolommen.forEach((kol, i) => {
    kol.forEach((k, j) => {
      const x = 5 + i * z;
      const y = h - 5 - (j + 1) * z;
      const rechts = kolommen[i + 1]?.length ?? 0;
      kubus(x, y, k, j === kol.length - 1, j >= rechts);
    });
  });
}

/* ---------- puzzelplaatjes ---------- */

export type PuzzelPlaatje =
  /** Eén grote vorm (plat of ruimtelijk). */
  | { soort: "vorm"; vorm: VormNaam; kleur: Kleur }
  /** Een rooster van gekleurde vierkantjes. */
  | { soort: "raster"; raster: Kleur[][] }
  /** Een rooster van vormen. */
  | { soort: "vormen"; raster: [Platvorm, Kleur][][] }
  /** Een kleurenplaatje (zie KLEURPLAATJES). */
  | { soort: "kleur"; nr: number };

const REGENBOOG: Kleur[] = ["rood", "oranje", "geel", "groen", "lichtblauw", "blauw", "paars", "roze"];

/** De voorwerpen die in de kleurenplaatjes zitten (de les zet ze in `voorwerpen`). */
export const PUZZEL_VOORWERPEN: Record<number, string[]> = {
  6: ["appel", "mandarijn", "citroen", "peer", "pruim", "aardbei", "banaan"],
  7: ["ballon-rood", "ballon-oranje", "ballon-geel", "ballon-groen", "ballon-blauw", "ballon-paars", "ballon"],
  9: ["aardbei", "mandarijn", "banaan", "peer", "pruim", "appel"],
  13: ["ballon-geel", "ballon-blauw", "ballon-rood", "ballon-groen", "ballon-paars", "ballon-oranje"],
};

/** Hoeveel kleurenplaatjes er zijn. */
export const KLEURPLAATJES = 15;

export function tekenPuzzel(c: CanvasRenderingContext2D, p: PuzzelPlaatje, S: number) {
  c.lineJoin = "round";
  if (p.soort === "vorm") {
    c.save();
    c.translate(S * 0.06, S * 0.06);
    tekenVorm(c, p.vorm, S * 0.88, p.kleur);
    c.restore();
    return;
  }
  if (p.soort === "raster") {
    const n = p.raster.length;
    const v = S / n;
    p.raster.forEach((rij, j) =>
      rij.forEach((k, i) => {
        c.beginPath();
        c.rect(i * v + 2, j * v + 2, v - 4, v - 4);
        vulRand(c, KLEUR[k], 3);
      }),
    );
    return;
  }
  if (p.soort === "vormen") {
    const n = p.raster.length;
    const v = S / n;
    p.raster.forEach((rij, j) =>
      rij.forEach(([vorm, k], i) => {
        c.save();
        c.translate(i * v + v * 0.1, j * v + v * 0.1);
        tekenVorm(c, vorm, v * 0.8, k);
        c.restore();
      }),
    );
    return;
  }
  tekenKleurplaatje(c, p.nr, S);
}

function tekenKleurplaatje(c: CanvasRenderingContext2D, nr: number, S: number) {
  const m = S / 2;
  const ring = (n: number, straal: number, teken: (x: number, y: number, i: number) => void) => {
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      teken(m + straal * Math.cos(a), m + straal * Math.sin(a), i);
    }
  };
  switch (nr) {
    case 0: /* kralen in een kring */
      ring(14, S * 0.38, (x, y, i) => tekenKraal(c, x, y, S * 0.085, REGENBOOG[i % REGENBOOG.length]));
      tekenKraal(c, m, m, S * 0.12, "geel");
      return;
    case 1: /* blokjes in een kring */
      ring(12, S * 0.36, (x, y, i) => {
        c.beginPath();
        c.rect(x - S * 0.07, y - S * 0.07, S * 0.14, S * 0.14);
        vulRand(c, KLEUR[REGENBOOG[i % REGENBOOG.length]], 3);
      });
      return;
    case 2: /* staven als een trap */
      REGENBOOG.forEach((k, i) => {
        const h = S * 0.1;
        c.beginPath();
        c.rect(S * 0.08, S * 0.06 + i * (h + S * 0.01), S * (0.2 + i * 0.1), h);
        vulRand(c, KLEUR[k], 3);
      });
      return;
    case 3: /* een kleurenwiel */
      REGENBOOG.forEach((k, i) => {
        const a0 = -Math.PI / 2 + (i * 2 * Math.PI) / 8;
        c.beginPath();
        c.moveTo(m, m);
        c.arc(m, m, S * 0.46, a0, a0 + (2 * Math.PI) / 8);
        c.closePath();
        vulRand(c, KLEUR[k], 3);
      });
      return;
    case 4: /* een regenboog van bogen */
      ["rood", "oranje", "geel", "groen", "blauw", "paars"].forEach((k, i) => {
        const r = S * (0.47 - i * 0.065);
        c.beginPath();
        c.arc(m, S * 0.82, r, Math.PI, 0);
        c.arc(m, S * 0.82, r - S * 0.065, 0, Math.PI, true);
        c.closePath();
        vulRand(c, KLEUR[k as Kleur], 3);
      });
      return;
    case 5: /* stippen in alle kleuren */
      for (let j = 0; j < 5; j++)
        for (let i = 0; i < 5; i++) {
          c.beginPath();
          c.arc(S * 0.1 + i * S * 0.2, S * 0.1 + j * S * 0.2, S * 0.075, 0, Math.PI * 2);
          vulRand(c, KLEUR[REGENBOOG[(i + j * 2) % REGENBOOG.length]], 3);
        }
      return;
    case 6: /* fruit in een kring */
      ring(6, S * 0.33, (x, y, i) => tekenVoorwerp(c, PUZZEL_VOORWERPEN[6][i], x - S * 0.14, y - S * 0.14, S * 0.28, S * 0.28));
      tekenVoorwerp(c, PUZZEL_VOORWERPEN[6][6], m - S * 0.15, m - S * 0.15, S * 0.3, S * 0.3);
      return;
    case 7: /* een tros ballonnen */
      PUZZEL_VOORWERPEN[7].forEach((naam, i) => {
        const x = S * (0.18 + (i % 4) * 0.21 + (i >= 4 ? 0.1 : 0));
        const y = S * (i >= 4 ? 0.62 : 0.3);
        tekenVoorwerp(c, naam, x - S * 0.14, y - S * 0.2, S * 0.28, S * 0.36);
      });
      return;
    case 8: /* vierkanten in elkaar */
      ["rood", "oranje", "geel", "groen", "blauw", "paars"].forEach((k, i) => {
        const d = S * (0.03 + i * 0.075);
        c.beginPath();
        c.rect(d, d, S - 2 * d, S - 2 * d);
        vulRand(c, KLEUR[k as Kleur], 3);
      });
      return;
    case 9: /* fruit op twee rijen */
      PUZZEL_VOORWERPEN[9].forEach((naam, i) => {
        const x = S * (0.18 + (i % 3) * 0.32);
        const y = S * (i < 3 ? 0.27 : 0.73);
        tekenVoorwerp(c, naam, x - S * 0.15, y - S * 0.15, S * 0.3, S * 0.3);
      });
      return;
    case 10: /* schuine strepen van blokjes */
      for (let j = 0; j < 4; j++)
        for (let i = 0; i < 4; i++) {
          c.beginPath();
          c.rect(i * S * 0.25 + 3, j * S * 0.25 + 3, S * 0.25 - 6, S * 0.25 - 6);
          vulRand(c, KLEUR[REGENBOOG[(i + j) % 7]], 3);
        }
      return;
    case 11: /* drie kettingen */
      ["rood", "geel", "blauw"].forEach((_, r) => {
        const y = S * (0.2 + r * 0.3);
        c.beginPath();
        c.moveTo(S * 0.04, y);
        c.lineTo(S * 0.96, y);
        c.strokeStyle = "#e9eef7";
        c.lineWidth = 3;
        c.stroke();
        for (let i = 0; i < 6; i++) tekenKraal(c, S * (0.1 + i * 0.16), y, S * 0.075, REGENBOOG[(i + r * 3) % REGENBOOG.length]);
      });
      return;
    case 12: /* sterren in kleuren */
      ["rood", "oranje", "geel", "groen", "blauw", "paars", "roze", "lichtblauw", "geel"].forEach((k, i) => {
        c.save();
        c.translate(S * (0.02 + (i % 3) * 0.33), S * (0.02 + Math.floor(i / 3) * 0.33));
        tekenVorm(c, "ster", S * 0.3, k as Kleur);
        c.restore();
      });
      return;
    case 13: /* ballonnen op een rij */
      PUZZEL_VOORWERPEN[13].forEach((naam, i) => {
        const x = S * (0.1 + (i % 3) * 0.34);
        const y = S * (i < 3 ? 0.04 : 0.52);
        tekenVoorwerp(c, naam, x - S * 0.04, y, S * 0.3, S * 0.44);
      });
      return;
    default: /* cirkels in elkaar */
      ["paars", "blauw", "lichtblauw", "groen", "geel", "oranje", "rood"].forEach((k, i) => {
        c.beginPath();
        c.arc(m, m, S * (0.48 - i * 0.065), 0, Math.PI * 2);
        vulRand(c, KLEUR[k as Kleur], 3);
      });
  }
}
