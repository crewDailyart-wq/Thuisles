/**
 * Tekeningen voor de lessen Klokkijken naar Squla groep 3 (31 oktober 2026).
 *
 * De klokken zijn rekenmateriaal en worden hier strak in code getekend
 * (ONTWERPREGELS.md: "Alle klokken zien er hetzelfde uit": donkere wijzers,
 * de grote tot bij de streepjes, de kleine korter en dikker, één klein rondje
 * in het midden). Echte dingen (oven, bus, taart …) komen NIET hier vandaan:
 * die zijn vaste plaatjes uit public/voorwerpen (tekenVoorwerp).
 *
 * Elk "ding" heeft een vaste maat in punten; het vlak schaalt het.
 */

import { createElement } from "react";
import { tekenVoorwerp } from "../voorwerpen";
import { Klokje } from "./klok-wijzerklok";

export type Kl = "roze" | "oranje" | "blauw" | "rood" | "groen" | "paars" | "geel" | "turkoois";

export const RAND: Record<Kl, string> = {
  roze: "#ff7fbf",
  oranje: "#ff9a3c",
  blauw: "#4b8af5",
  rood: "#ef4f5a",
  groen: "#3fbf6a",
  paars: "#9b6cf0",
  geel: "#f5c518",
  turkoois: "#22b8c8",
};

/** Waar op een voorwerp het schermpje zit (deel van het plaatje: x, y, breedte van het klokje). */
export const SCHERM: Record<string, { x: number; y: number; b: number }> = {
  /* gemeten op de plaatjes van Sara (31 oktober 2026); een ander plaatje = deze maten opnieuw nakijken */
  telefoon: { x: 0.5, y: 0.5, b: 0.36 },
  laptop: { x: 0.5, y: 0.41, b: 0.34 },
  oven: { x: 0.504, y: 0.15, b: 0.27 },
};

export type Ding =
  /** Een wijzerklok; `u` 1–12, `m` 0–59. `nadruk`: die wijzer even oranje (samen kijken). */
  | { t: "wijzer"; u: number; m: number; kleur: Kl; nadruk?: "uur" | "min" }
  /** Een digitale klok met deze tijd ("07:00"). */
  | { t: "digi"; tekst: string; kleur: Kl }
  /** Een echt ding (vast plaatje); `scherm`: een wijzerklok op het schermpje (telefoon, laptop, oven). */
  | { t: "vw"; naam: string; scherm?: { u: number; m: number } }
  /** Een tijd in woorden, groot ("6 uur"). */
  | { t: "tekst"; tekst: string }
  /** Een los teken of getal (":" "?" "!" "10"). */
  | { t: "teken"; tekst: string }
  | { t: "vink" }
  | { t: "kruis" }
  /** Een tegeltje met klokcijfers (slepen: "06", ":", "00"). */
  | { t: "tegel"; tekst: string }
  /** Een memorykaartje dat nog dicht is: een bolletje licht met een ster. */
  | { t: "dicht" };

/** De maat van een ding in punten. */
export function maatVan(d: Ding): { b: number; h: number } {
  switch (d.t) {
    case "wijzer":
      return { b: 220, h: 220 };
    case "digi":
      return { b: 280, h: 140 };
    case "vw":
      return { b: 220, h: 220 };
    case "tekst":
      return { b: Math.min(340, 50 + d.tekst.length * 36), h: 110 };
    case "teken":
      return { b: 150, h: 150 };
    case "vink":
    case "kruis":
      return { b: 150, h: 150 };
    case "tegel":
      return d.tekst === ":" ? { b: 70, h: 110 } : { b: 130, h: 110 };
    case "dicht":
      return { b: 170, h: 170 };
  }
}

/** Een vaste sleutel per ding (Phaser-textuur). */
export const dingSleutel = (d: Ding) => `kk:${JSON.stringify(d)}`;

/** De kleur van het oplichten (gloed op het moment). */
export function gloedVan(d: Ding): number {
  if (d.t === "wijzer" || d.t === "digi") return parseInt(RAND[d.kleur].slice(1), 16);
  if (d.t === "vink") return 0x8ff0c0;
  if (d.t === "kruis") return 0xff9eab;
  return 0xffd36e;
}

type C = CanvasRenderingContext2D;
const LETTER = `"Fredoka", "Work Sans", system-ui, sans-serif`;

/* ---------- de wijzerklok (de klok van de Synthesis-kloklessen) ---------- */

/*
  Klokkijken, 1 november 2026 (BOUWREGELS 8.1): alleen de gewone wijzerklok, en
  wel de klok die al in de Synthesis-kloklessen staat (`Klokje` uit
  klok-wijzerklok.tsx: witte wijzerplaat, paarse minutenwijzer, oranje
  urenwijzer). We maken geen nieuwe klok: die klok wordt één keer als plaatje
  gemaakt (`laadKlokken`) en hier getekend. De wijzers lichten op met een
  zachte pil, zoals bij Synthesis.
*/

const KLOK_RAND = 227; /* Klokje: straal 215 + 12 rand */
const KLOK_R = 215;
const klokBeelden = new Map<string, HTMLImageElement>();
const klokSleutel = (u: number, m: number) => `${u % 12}:${m}`;

/** De tijden die in de lessen voorkomen: hele uren, halve uren en bijna half. */
const KLOK_MINUTEN = [0, 25, 30];

let klokKlaar: Promise<void> | null = null;

/** Maak (één keer) van elke klok die in de lessen voorkomt een plaatje. Wacht hierop voordat er getekend wordt. */
export function laadKlokken(): Promise<void> {
  if (typeof document === "undefined") return Promise.resolve();
  if (klokKlaar) return klokKlaar;
  klokKlaar = (async () => {
    /* pas hier laden: alleen in de browser nodig */
    const { flushSync } = await import("react-dom");
    const { createRoot } = await import("react-dom/client");
    const host = document.createElement("div");
    const root = createRoot(host);
    const alle: Promise<void>[] = [];
    for (let u = 0; u < 12; u++) {
      for (const m of KLOK_MINUTEN) {
        flushSync(() => root.render(createElement(Klokje, { tijd: u * 60 + m, maat: 440 })));
        const svg = host.querySelector("svg");
        if (!svg) continue;
        svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        /* een plaatje kent de lettertypevariabelen van de pagina niet: vaste lettertypes */
        const tekst = new XMLSerializer().serializeToString(svg).replace(/var\(--font-les\), /g, "");
        const img = new Image();
        img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(tekst)}`;
        klokBeelden.set(klokSleutel(u, m), img);
        alle.push(img.decode().catch(() => undefined));
      }
    }
    root.unmount();
    await Promise.all(alle);
  })();
  return klokKlaar;
}

/** De wijzerklok in een vak van `maat` × `maat` met het midden op (cx, cy). */
function klokPlaatje(c: C, u: number, m: number, cx: number, cy: number, maat: number) {
  const img = klokBeelden.get(klokSleutel(u, m));
  if (!img || !img.complete) return;
  c.drawImage(img, cx - maat / 2, cy - maat / 2, maat, maat);
}

function wijzerklok(c: C, d: Extract<Ding, { t: "wijzer" }>) {
  klokPlaatje(c, d.u, d.m, 110, 110, 220);
  if (!d.nadruk) return;
  /* de zachte pil van Synthesis om de wijzer waar het nu om gaat */
  const k = 110 / KLOK_RAND;
  const uur = d.nadruk === "uur";
  const hoek = uur ? ((d.u % 12) + d.m / 60) * 30 : d.m * 6;
  const lengte = (uur ? 0.48 : 0.8) * KLOK_R * k;
  const breed = (uur ? 0.076 : 0.046) * KLOK_R * k * 2.6;
  c.save();
  c.translate(110, 110);
  c.rotate((hoek * Math.PI) / 180);
  c.fillStyle = uur ? "rgba(222, 150, 95, 0.42)" : "rgba(160, 120, 230, 0.32)";
  c.beginPath();
  c.roundRect(-breed / 2, -(lengte + 0.05 * KLOK_R * k), breed, lengte + 0.15 * KLOK_R * k, breed / 2);
  c.fill();
  c.restore();
}

/* ---------- de digitale cijfers (zeven streepjes) ---------- */

const SEG: Record<string, string> = {
  "0": "abcdef",
  "1": "bc",
  "2": "abged",
  "3": "abgcd",
  "4": "fgbc",
  "5": "afgcd",
  "6": "afgedc",
  "7": "abc",
  "8": "abcdefg",
  "9": "abcdfg",
};

/** Eén cijfer in een vak van b × h vanaf (x, y). */
function cijfer(c: C, ch: string, x: number, y: number, b: number, h: number, kleur: string) {
  const dik = Math.max(4, b * 0.2);
  const half = h / 2;
  const lijn: Record<string, [number, number, number, number]> = {
    a: [x + dik / 2, y, x + b - dik / 2, y],
    b: [x + b, y + dik / 2, x + b, y + half - dik / 2],
    c: [x + b, y + half + dik / 2, x + b, y + h - dik / 2],
    d: [x + dik / 2, y + h, x + b - dik / 2, y + h],
    e: [x, y + half + dik / 2, x, y + h - dik / 2],
    f: [x, y + dik / 2, x, y + half - dik / 2],
    g: [x + dik / 2, y + half, x + b - dik / 2, y + half],
  };
  c.lineCap = "round";
  c.lineWidth = dik;
  /* de uitgeschakelde streepjes heel zwak, zoals op een echte klok */
  for (const s of "abcdefg") {
    const aan = (SEG[ch] ?? "").includes(s);
    c.strokeStyle = aan ? kleur : "rgba(255,255,255,0.06)";
    const [x1, y1, x2, y2] = lijn[s];
    c.beginPath();
    c.moveTo(x1, y1);
    c.lineTo(x2, y2);
    c.stroke();
  }
}

/** Een tijd ("07:00") in klokcijfers, gecentreerd rond (cx, cy), cijferhoogte h. */
export function klokcijfers(c: C, tekst: string, cx: number, cy: number, h: number, kleur = "#ff5b4a") {
  const b = h * 0.52;
  const tussen = h * 0.26;
  const dp = h * 0.36;
  const breed = [...tekst].reduce((s, ch) => s + (ch === ":" ? dp : b + tussen), 0) - tussen;
  let x = cx - breed / 2;
  for (const ch of tekst) {
    if (ch === ":") {
      c.fillStyle = kleur;
      const r = Math.max(2.5, h * 0.075);
      c.beginPath();
      c.arc(x + dp / 2 - tussen / 2, cy - h * 0.2, r, 0, Math.PI * 2);
      c.arc(x + dp / 2 - tussen / 2, cy + h * 0.2, r, 0, Math.PI * 2);
      c.fill();
      x += dp;
      continue;
    }
    cijfer(c, ch, x, cy - h / 2, b, h, kleur);
    x += b + tussen;
  }
}

function digitaal(c: C, d: Extract<Ding, { t: "digi" }>) {
  /* pootjes */
  c.fillStyle = "#2b2f3a";
  c.beginPath();
  c.roundRect(40, 118, 34, 16, 6);
  c.roundRect(206, 118, 34, 16, 6);
  c.fill();
  /* kastje in de kleur van de klok */
  c.beginPath();
  c.roundRect(6, 8, 268, 116, 26);
  c.fillStyle = RAND[d.kleur];
  c.fill();
  c.lineWidth = 4;
  c.strokeStyle = "rgba(0,0,0,0.25)";
  c.stroke();
  /* scherm */
  c.beginPath();
  c.roundRect(24, 24, 232, 84, 12);
  c.fillStyle = "#0b0f1a";
  c.fill();
  klokcijfers(c, d.tekst, 140, 66, 52);
}

/** Een kleine wijzerklok op het schermpje van een voorwerp (telefoon, laptop, oven). */
function schermpje(c: C, t: { u: number; m: number }, cx: number, cy: number, b: number) {
  klokPlaatje(c, t.u, t.m, cx, cy, b);
}

/* ---------- de rest ---------- */

function tekst(c: C, t: string, x: number, y: number, px: number) {
  c.font = `700 ${px}px ${LETTER}`;
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.lineJoin = "round";
  c.lineWidth = px * 0.12;
  c.strokeStyle = "rgba(10,20,60,0.9)";
  c.strokeText(t, x, y);
  c.fillStyle = "#ffffff";
  c.fillText(t, x, y);
}

/** Teken een ding in een vak van zijn eigen maat (maatVan). */
export function tekenDing(c: C, d: Ding) {
  c.save();
  switch (d.t) {
    case "wijzer":
      wijzerklok(c, d);
      break;
    case "digi":
      digitaal(c, d);
      break;
    case "vw": {
      tekenVoorwerp(c, d.naam, 0, 0, 220, 220);
      const s = SCHERM[d.naam];
      if (d.scherm && s) schermpje(c, d.scherm, s.x * 220, s.y * 220, s.b * 220);
      break;
    }
    case "tekst":
      tekst(c, d.tekst, maatVan(d).b / 2, 58, 70);
      break;
    case "teken":
      tekst(c, d.tekst, 75, 78, d.tekst.length > 1 ? 92 : 112);
      break;
    case "vink":
      c.strokeStyle = "#3fd07a";
      c.lineWidth = 22;
      c.lineCap = "round";
      c.lineJoin = "round";
      c.beginPath();
      c.moveTo(28, 80);
      c.lineTo(62, 116);
      c.lineTo(124, 36);
      c.stroke();
      break;
    case "kruis":
      c.strokeStyle = "#ff5b66";
      c.lineWidth = 22;
      c.lineCap = "round";
      c.beginPath();
      c.moveTo(36, 36);
      c.lineTo(114, 114);
      c.moveTo(114, 36);
      c.lineTo(36, 114);
      c.stroke();
      break;
    case "tegel": {
      const { b, h } = maatVan(d);
      c.beginPath();
      c.roundRect(4, 4, b - 8, h - 8, 12);
      c.fillStyle = "#0b0f1a";
      c.fill();
      c.lineWidth = 3;
      c.strokeStyle = "#7fe9ff";
      c.stroke();
      klokcijfers(c, d.tekst, b / 2, h / 2, 56);
      break;
    }
    case "dicht": {
      const g = c.createRadialGradient(85, 75, 8, 85, 85, 80);
      g.addColorStop(0, "rgba(140,200,255,0.95)");
      g.addColorStop(1, "rgba(40,80,190,0.85)");
      c.fillStyle = g;
      c.beginPath();
      c.arc(85, 85, 78, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "#ffffff";
      c.beginPath();
      for (let i = 0; i < 10; i++) {
        const r = i % 2 ? 12 : 30;
        const a = (i * Math.PI) / 5 - Math.PI / 2;
        c.lineTo(85 + Math.cos(a) * r, 85 + Math.sin(a) * r);
      }
      c.closePath();
      c.fill();
      break;
    }
  }
  c.restore();
}
