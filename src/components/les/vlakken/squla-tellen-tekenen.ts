/**
 * Plaatjes voor de lessen "Tellen" naar Squla groep 3 (30 oktober 2026,
 * opdracht eigenaar). Sinds 31 oktober 2026 zijn alle dingen vaste plaatjes
 * (src/lib/voorwerpen, zie WISSELEN.md); hier staan alleen nog de kleuren,
 * het tekenen in een vak en het bordje op de zak.
 *
 * Elk voorwerp past in een vak van 96 × 96 punten. De scène tekent het één
 * keer (canvasPlaatje); gloed alleen op het moment dat het iets betekent
 * (meetellen, goed). Geen live filters (HARDE REGEL 7).
 */

import { tekenVoorwerp } from "../voorwerpen";

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

/**
 * Wat er geteld wordt: de naam van een vast plaatje (src/lib/voorwerpen,
 * public/voorwerpen/<naam>.png). Sinds 31 oktober 2026 (besluit eigenaar)
 * tekenen de lessen geen eigen fruit, auto's of dieren meer: elk ding is één
 * vast plaatje, en monsters, spookjes en dieren zijn vervangen door dingen.
 */
export type Soort =
  | "appel"
  | "peer"
  | "pruim"
  | "citroen"
  | "aardbei"
  | "banaan"
  | "speelgoedauto"
  | "bus"
  | "huis"
  | "boom"
  | "raketje"
  | "ster"
  | "planeet"
  | "satelliet"
  | "ufo"
  | "komeet"
  | "ballon"
  | "bootje"
  | "treintje"
  | "bal"
  | "speelblok"
  | "knikker";

/** De vaste kleur van elk ding: zo kleurt het getal in de zin van Bliepo mee ({12:rood}). */
export const VASTE_KLEUR: Record<Soort, Kleurnaam> = {
  appel: "rood",
  peer: "groen",
  pruim: "paars",
  citroen: "geel",
  aardbei: "rood",
  banaan: "geel",
  speelgoedauto: "rood",
  bus: "geel",
  huis: "blauw",
  boom: "groen",
  raketje: "rood",
  ster: "geel",
  planeet: "paars",
  satelliet: "groen",
  ufo: "paars",
  komeet: "oranje",
  ballon: "roze",
  bootje: "rood",
  treintje: "groen",
  bal: "rood",
  speelblok: "blauw",
  knikker: "blauw",
};

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

/**
 * Proef (31 oktober 2026, Sara): echte plaatjes uit /proef-plaatjes in plaats
 * van de vaste voorwerpen: altijd gloed, nooit gloed, of alleen gloed op het
 * moment dat het iets betekent (meetellen, goed). Alleen de proeflessen zetten
 * eigen plaatjes; elke andere telles gebruikt de vaste voorwerpen met gloed
 * "op het moment" (de stijl die Sara koos).
 */
export const FOTO: { plaatjes: Partial<Record<Soort, HTMLImageElement>>; gloed: "altijd" | "nooit" | "moment" } = { plaatjes: {}, gloed: "moment" };

/** Teken een voorwerp in een vak van 96 × 96: het proefplaatje als dat er is, anders het vaste voorwerp. */
export function teken(c: CanvasRenderingContext2D, soort: Soort) {
  const rand = 6;
  const foto = FOTO.plaatjes[soort];
  /* De knikker is sinds 7 november de herkenbare glazen knikker (de oude leek op een blauw krulletje). */
  /* De bal is sinds herstel ronde 2 (7 november) de strandbal "speelbal" (de oude bal.png leek op een verbodsbord). */
  if (!foto) return tekenVoorwerp(c, soort === "knikker" ? "knikker-glas" : soort === "bal" ? "speelbal" : soort, rand, rand, MAAT - rand * 2, MAAT - rand * 2);
  const f = Math.min((MAAT - rand * 2) / foto.naturalWidth, (MAAT - rand * 2) / foto.naturalHeight);
  const b = foto.naturalWidth * f;
  const h = foto.naturalHeight * f;
  c.drawImage(foto, (MAAT - b) / 2, (MAAT - h) / 2, b, h);
}

/**
 * Een dichte zak (200 × 240 punten): het vaste plaatje "zak", met een wit
 * bordje erop voor het getal. Het getal staat er los op (tekenZakgetal),
 * zodat de zak zelf maar één keer getekend hoeft te worden.
 */
export function tekenZak(c: CanvasRenderingContext2D) {
  tekenVoorwerp(c, "zak", 0, 10, 200, 230);
  c.beginPath();
  c.roundRect(42, 112, 116, 84, 18);
  c.fillStyle = "#ffffff";
  c.fill();
  c.strokeStyle = "#8a5a2b";
  c.lineWidth = 3;
  c.stroke();
}

/** Het tiental op het bordje van de zak (116 × 84 punten, het midden van het bordje). */
export function tekenZakgetal(c: CanvasRenderingContext2D, getal: number) {
  c.fillStyle = "#1d2540";
  c.font = `800 52px "Work Sans", system-ui, sans-serif`;
  c.textAlign = "center";
  c.textBaseline = "middle";
  /* Herstel 7 november: het getal in het midden, bovenaan het bordje; het knikkertje staat eronder (niet meer tegen het getal aan). */
  c.fillText(String(getal), 58, 30);
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
