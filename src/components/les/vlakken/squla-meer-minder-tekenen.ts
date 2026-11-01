/**
 * Plaatjes voor de lessen "Meer, minder, evenveel" naar Squla groep 3
 * (30 oktober 2026, opdracht eigenaar). Sinds 31 oktober 2026 zijn alle
 * dingen vaste plaatjes (src/lib/voorwerpen, zie WISSELEN.md): appels, peren,
 * sterren, bloemen, ballonnen, ballen, kralen, koekjes, eieren, aardbeien,
 * knikkers, en de potjes en vliegers met een getal voor het op volgorde
 * zetten. In code blijven alleen het eierdoosje (een doos met 6 vakjes, als
 * rekenhulp) en de getallen.
 *
 * Een voorwerp past in een vak van 64 × 64 punten. De scène tekent het één
 * keer (canvasPlaatje), zonder vaste gloed. Geen live filters (HARDE REGEL 7).
 */

import { tekenVoorwerp } from "../voorwerpen";

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

/**
 * Wat er in een groep ligt: de naam van een vast plaatje (src/lib/voorwerpen).
 * Sinds 31 oktober 2026 (besluit eigenaar) geen eigen tekeningen en geen
 * dieren meer: de vissen zijn ballonnen, de lieveheersbeestjes aardbeien en
 * de vlinders knikkers geworden. Elk ding heeft één vaste kleur.
 */
export type MMSoort = "appel" | "peer" | "ster" | "bloem" | "ballon" | "bal" | "kraal" | "koekje" | "ei" | "aardbei" | "knikker";

/** De vaste kleur van elk ding (ook de kleur van het getal in de zin). */
export const MM_VASTE_KLEUR: Record<MMSoort, MMKleur> = {
  appel: "rood",
  peer: "groen",
  ster: "geel",
  bloem: "rood",
  ballon: "roze",
  bal: "rood",
  kraal: "paars",
  koekje: "bruin",
  ei: "wit",
  aardbei: "rood",
  knikker: "blauw",
};

export const MM_MAAT = 64;

export const mmHex = (h: string) => parseInt(h.slice(1), 16);

type C = CanvasRenderingContext2D;

/** Teken een voorwerp in een vak van 64 × 64. */
export function mmTeken(c: C, soort: MMSoort) {
  tekenVoorwerp(c, soort, 2, 2, MM_MAAT - 4, MM_MAAT - 4);
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

/** Een potje (vast plaatje) met het getal op het etiket (150 × 170). */
function potje(c: C, n: number) {
  tekenVoorwerp(c, "potje", 0, 10, DING_B, DING_H - 10);
  getalTekst(c, n, 75, 104, 46, "#1e2a5c");
}

/** Een vlieger (vast plaatje) met het getal op een rondje (150 × 170). */
function vlieger(c: C, n: number) {
  tekenVoorwerp(c, "vlieger", 0, 0, DING_B, DING_H);
  c.beginPath();
  c.arc(75, 70, 25, 0, Math.PI * 2);
  c.fillStyle = "#fff8e8";
  c.fill();
  c.strokeStyle = "#1e2a5c";
  c.lineWidth = 3;
  c.stroke();
  getalTekst(c, n, 75, 72, 30, "#1e2a5c");
}

/** Alle vaste plaatjes die dit vlak kan tekenen: elke les laadt ze vooraf. */
export const MM_VOORWERPEN = ["appel", "peer", "ster", "bloem", "ballon", "bal", "kraal", "koekje", "ei", "aardbei", "knikker", "potje", "vlieger"];

export function mmTekenDing(c: C, ding: MMDing, n: number) {
  if (ding === "potje") potje(c, n);
  else vlieger(c, n);
}
