/**
 * Tekeningen voor de lessen "Getallenlijn" naar Squla (30 oktober 2026,
 * opdracht eigenaar; eigen tekeningen, niets van Squla). Alles wordt één keer
 * getekend (canvasPlaatje) en de gloed één keer gebakken (bak, met de
 * centrale sterkte): nooit een gloed die elk beeld opnieuw wordt uitgerekend
 * (HARDE REGEL 7).
 *
 * Hologramstijl (holo/basis.ts) voor het rekenmateriaal: een doorschijnende
 * vulling met een heldere, dunne rand. Echte dingen (lampjes, planeten,
 * diamanten, sterren, het raketje, de dingen op de getallen) zijn sinds 31
 * oktober 2026 de vaste plaatjes uit src/lib/voorwerpen (zie WISSELEN.md),
 * zonder vaste gloed. Geen emoji, geen dieren, geen mensen.
 */

import type { Holo } from "../holo/basis";
import { tekenVoorwerp } from "../voorwerpen";

type C = CanvasRenderingContext2D;

/** Kleuren van de voorwerpen (rand); de vulling is dezelfde kleur, doorschijnend. */
export const KLEUREN = {
  lampje: "#ffd36e",
  rood: "#ff7b7b",
  planeet: "#c9b6ff",
  kristal: "#7fe9ff",
  ster: "#ffe066",
  kaart: "#8fc4ff",
  vast: "#ffd36e",
  tegel: "#8fc4ff",
  kikker: "#8ff0a0",
  blad: "#7ee0a0",
  vlinder: "#ff9fd2",
  slak: "#ffad5c",
  bordje: "#bfe6ff",
  uil: "#ffcf8a",
  egel: "#e0b48a",
  schildpad: "#8ff0c0",
  pinguin: "#bfe6ff",
  konijn: "#ffd0e6",
  olifant: "#c9c6ff",
  raket: "#ffad5c",
} as const;

export const hexGetal = (h: string) => parseInt(h.slice(1), 16);

function rgba(hex: string, a: number) {
  const n = hexGetal(hex);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

/** Een vorm vullen (donker doorschijnend, met een zweem van de kleur) en omranden (helder). */
function holo(c: C, kleur: string, vul = 0.28, dik = 3.5) {
  c.fillStyle = "rgba(10,34,90,0.62)";
  c.fill();
  c.fillStyle = rgba(kleur, vul * 0.55);
  c.fill();
  c.strokeStyle = kleur;
  c.lineWidth = dik;
  c.lineJoin = "round";
  c.lineCap = "round";
  c.stroke();
}

function lijn(c: C, kleur: string, dik = 3) {
  c.strokeStyle = kleur;
  c.lineWidth = dik;
  c.lineJoin = "round";
  c.lineCap = "round";
  c.stroke();
}

/* ---------- dingen in een rij ---------- */

/** Een getalkaart of tegel (110 × 110). */
function kaart(kleur: string, vul = 0.26) {
  return (c: C) => {
    c.beginPath();
    c.roundRect(5, 5, 100, 100, 20);
    holo(c, kleur, vul);
  };
}

/** Een lege plek waar een kaart in moet (120 × 120): een stippellijn. */
function vak(c: C) {
  c.setLineDash([9, 7]);
  c.beginPath();
  c.roundRect(5, 5, 110, 110, 22);
  c.fillStyle = "rgba(20,60,120,0.35)";
  c.fill();
  c.strokeStyle = "rgba(190,240,255,0.85)";
  c.lineWidth = 3;
  c.stroke();
  c.setLineDash([]);
}

/** Een vlaggetje op een stokje (90 × 170), het doekje rechts bovenaan. */
function vlag(c: C) {
  c.beginPath();
  c.moveTo(12, 8);
  c.lineTo(12, 166);
  lijn(c, "#e8f2ff", 4);
  c.beginPath();
  c.moveTo(14, 10);
  c.lineTo(86, 10);
  c.lineTo(86, 74);
  c.lineTo(14, 74);
  c.closePath();
  holo(c, KLEUREN.lampje, 0.3);
}

/** Een bordje op een stokje (120 × 170). */
function bordje(c: C) {
  c.beginPath();
  c.moveTo(60, 90);
  c.lineTo(60, 166);
  lijn(c, "#e8f2ff", 4);
  c.beginPath();
  c.roundRect(8, 8, 104, 84, 16);
  holo(c, KLEUREN.bordje, 0.28);
}

/** Een pijl die omhoog wijst (40 × 90), de pijlpunt vol. */
function pijl(c: C) {
  c.beginPath();
  c.moveTo(20, 86);
  c.lineTo(20, 26);
  lijn(c, KLEUREN.lampje, 5);
  c.beginPath();
  c.moveTo(4, 30);
  c.lineTo(20, 4);
  c.lineTo(36, 30);
  c.closePath();
  c.fillStyle = KLEUREN.lampje;
  c.fill();
}

/**
 * Het lichtje dat voordoet hoe je sleept (80 × 90). Tot 31 oktober 2026 was
 * dit een handje; geen mensen (ook geen hand), dus nu een rond lichtje.
 */
function hand(c: C) {
  const g = c.createRadialGradient(40, 45, 2, 40, 45, 34);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.45, "rgba(255,240,190,0.9)");
  g.addColorStop(1, "rgba(255,211,110,0)");
  c.fillStyle = g;
  c.beginPath();
  c.arc(40, 45, 34, 0, Math.PI * 2);
  c.fill();
}

/* ---------- de dingen op de getallen (Getallenlijn met dieren) ---------- */

/*
  Squla zet hier dieren op de getallen; sinds 31 oktober 2026 (besluit
  eigenaar: geen dieren als het niet hoeft) zijn het dingen. De olifant, die
  op twee getallen tegelijk zat, is een lange bus geworden.
*/
export type Ding = "bal" | "pakje" | "speelblok" | "speelgoedauto" | "ster" | "bus";
/** Hoe Bliepo het ding noemt (met lidwoord). */
export const DINGNAAM: Record<Ding, string> = {
  bal: "de bal",
  pakje: "het pakje",
  speelblok: "het blok",
  speelgoedauto: "de auto",
  ster: "de ster",
  bus: "de bus",
};
/** De sleutel van het plaatje van een ding op een getal. */
export const opGetal = (d: Ding) => `op-${d}`;

/** Wat er over de getallenlijn beweegt (bij Squla een kat; tot 31 oktober 2026 Floep de kikker, een vlinder en een slak). */
export type Wezen = "raketje" | "ufo" | "satelliet";

/** Alle vaste plaatjes die het getallenlijnvlak tekent: elke getallenlijnles laadt ze vooraf. */
export const GETALLENLIJN_VOORWERPEN = [
  "slingerlampje-geel",
  "slingerlampje-rood",
  "planeet-ring",
  "diamant",
  "ster",
  "raketje",
  "ufo",
  "satelliet",
  "planeet",
  "bal",
  "speelbal",
  "pakje",
  "speelblok",
  "speelgoedauto",
  "bus",
];

/* ---------- alles één keer tekenen en bakken ---------- */

/** De maten (in punten) van elk plaatje. */
export const MAAT = {
  lampje: { b: 100, h: 116 },
  planeet: { b: 120, h: 120 },
  kristal: { b: 100, h: 120 },
  ster: { b: 120, h: 120 },
  kaart: { b: 110, h: 110 },
  vak: { b: 120, h: 120 },
  vlag: { b: 90, h: 170 },
  raket: { b: 200, h: 200 },
  wezen: { b: 120, h: 120 },
  planeetGroot: { b: 260, h: 260 },
  bordje: { b: 120, h: 170 },
  pijl: { b: 40, h: 90 },
  hand: { b: 80, h: 90 },
  dier: { b: 120, h: 120 },
  bus: { b: 260, h: 160 },
} as const;

/**
 * Alle plaatjes van de getallenlijnlessen, één keer per scène. Rekendingen
 * (kaarten, tegels, vakjes, het vlaggetje, het bordje, de pijl) krijgen hun
 * gebakken gloed (`<naam>-g`). Echte dingen zijn de vaste plaatjes uit
 * src/lib/voorwerpen, zonder vaste gloed (de gloed komt alleen bij oplichten
 * en de lichtgolf); hun sleutels blijven `<naam>-g`, zodat de rest van het
 * vlak niet verandert.
 */
export function maakPlaatjes(sc: Holo) {
  const een = (naam: string, b: number, h: number, kleur: string, teken: (c: C) => void) => {
    sc.canvasPlaatje(naam, b, h, teken);
    sc.bak(naam, `${naam}-g`, hexGetal(kleur));
  };
  /* Herstel ronde 2 (7 november): "bal" wordt de strandbal "speelbal"; de oude bal.png leek op een verbodsbord. Het woord blijft "bal". */
  const ding = (sleutel: string, voorwerp: string, b: number, h: number) =>
    sc.canvasPlaatje(sleutel, b, h, (c) => tekenVoorwerp(c, voorwerp === "bal" ? "speelbal" : voorwerp, 0, 0, b, h));
  ding("lampje-g", "slingerlampje-geel", MAAT.lampje.b, MAAT.lampje.h);
  ding("lampje-rood-g", "slingerlampje-rood", MAAT.lampje.b, MAAT.lampje.h);
  ding("planeet-g", "planeet-ring", MAAT.planeet.b, MAAT.planeet.h);
  ding("kristal-g", "diamant", MAAT.kristal.b, MAAT.kristal.h);
  ding("ster-g", "ster", MAAT.ster.b, MAAT.ster.h);
  een("kaart", MAAT.kaart.b, MAAT.kaart.h, KLEUREN.kaart, kaart(KLEUREN.kaart));
  een("kaart-vast", MAAT.kaart.b, MAAT.kaart.h, KLEUREN.vast, kaart(KLEUREN.vast, 0.3));
  een("tegel", MAAT.kaart.b, MAAT.kaart.h, KLEUREN.tegel, kaart(KLEUREN.tegel, 0.2));
  een("hokje", MAAT.kaart.b, MAAT.kaart.h, KLEUREN.rood, kaart(KLEUREN.rood, 0.24));
  sc.canvasPlaatje("vak", MAAT.vak.b, MAAT.vak.h, vak);
  een("vlag", MAAT.vlag.b, MAAT.vlag.h, KLEUREN.lampje, vlag);
  ding("raket-g", "raketje", MAAT.raket.b, MAAT.raket.h);
  ding("raketje-g", "raketje", MAAT.wezen.b, MAAT.wezen.h);
  ding("ufo-g", "ufo", MAAT.wezen.b, MAAT.wezen.h);
  ding("satelliet-g", "satelliet", MAAT.wezen.b, MAAT.wezen.h);
  ding("planeet-groot-g", "planeet", MAAT.planeetGroot.b, MAAT.planeetGroot.h);
  een("bordje", MAAT.bordje.b, MAAT.bordje.h, KLEUREN.bordje, bordje);
  sc.canvasPlaatje("pijl", MAAT.pijl.b, MAAT.pijl.h, pijl);
  sc.canvasPlaatje("hand", MAAT.hand.b, MAAT.hand.h, hand);
  for (const d of Object.keys(DINGNAAM) as Ding[]) ding(opGetal(d), d, d === "bus" ? MAAT.bus.b : MAAT.dier.b, d === "bus" ? MAAT.bus.h : MAAT.dier.h);
}
