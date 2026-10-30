/**
 * Tekeningen voor de lessen "Getallenlijn" naar Squla (30 oktober 2026,
 * opdracht eigenaar; eigen tekeningen, niets van Squla). Alles wordt één keer
 * getekend (canvasPlaatje) en de gloed één keer gebakken (bak, met de
 * centrale sterkte): nooit een gloed die elk beeld opnieuw wordt uitgerekend
 * (HARDE REGEL 7).
 *
 * Hologramstijl (holo/basis.ts): een doorschijnende vulling met een heldere,
 * dunne rand in de kleur van het voorwerp. Geen plaatjes van buiten, geen
 * emoji.
 */

import type { Holo } from "../holo/basis";

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

function rondje(c: C, x: number, y: number, r: number) {
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
}

function oog(c: C, x: number, y: number, r: number) {
  rondje(c, x, y, r);
  c.fillStyle = "rgba(255,255,255,0.95)";
  c.fill();
  rondje(c, x + r * 0.15, y + r * 0.1, r * 0.5);
  c.fillStyle = "#14204a";
  c.fill();
}

/* ---------- dingen in een rij ---------- */

/** Een lampje van een lichtslinger (100 × 116): een klein kapje en een ronde bol. */
function lampje(kleur: string) {
  return (c: C) => {
    c.beginPath();
    c.roundRect(38, 6, 24, 18, 5);
    holo(c, "#dfe9ff", 0.35, 3);
    rondje(c, 50, 66, 42);
    holo(c, kleur, 0.3);
  };
}

/** Een planeetje met een ring (120 × 120). */
function planeet(kleur: string) {
  return (c: C) => {
    rondje(c, 60, 60, 40);
    holo(c, kleur, 0.3);
    c.save();
    c.translate(60, 60);
    c.rotate(-0.28);
    c.beginPath();
    c.ellipse(0, 0, 57, 15, 0, Math.PI * 0.06, Math.PI * 0.94);
    lijn(c, kleur, 3.5);
    c.restore();
  };
}

/** Een kristal (100 × 120). */
function kristal(kleur: string) {
  return (c: C) => {
    c.beginPath();
    c.moveTo(50, 6);
    c.lineTo(88, 40);
    c.lineTo(50, 114);
    c.lineTo(12, 40);
    c.closePath();
    holo(c, kleur, 0.3);
    c.beginPath();
    c.moveTo(12, 40);
    c.lineTo(88, 40);
    c.moveTo(32, 40);
    c.lineTo(50, 6);
    c.lineTo(68, 40);
    lijn(c, rgba(kleur, 0.7), 2);
  };
}

/** Een ster (120 × 120). */
function ster(kleur: string) {
  return (c: C) => {
    c.beginPath();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? 54 : 25;
      const h = -Math.PI / 2 + (i * Math.PI) / 5;
      const x = 60 + Math.cos(h) * r;
      const y = 64 + Math.sin(h) * r;
      if (i === 0) c.moveTo(x, y);
      else c.lineTo(x, y);
    }
    c.closePath();
    holo(c, kleur, 0.3);
  };
}

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

/** Een raket (110 × 200), voor het aftellen. */
function raket(c: C) {
  const k = KLEUREN.raket;
  c.beginPath();
  c.moveTo(55, 8);
  c.bezierCurveTo(88, 40, 84, 110, 78, 150);
  c.lineTo(32, 150);
  c.bezierCurveTo(26, 110, 22, 40, 55, 8);
  c.closePath();
  holo(c, "#e8f2ff", 0.22);
  rondje(c, 55, 70, 15);
  holo(c, KLEUREN.kristal, 0.35, 3);
  for (const k2 of [-1, 1]) {
    c.beginPath();
    c.moveTo(55 + k2 * 24, 112);
    c.lineTo(55 + k2 * 46, 160);
    c.lineTo(55 + k2 * 23, 150);
    c.closePath();
    holo(c, k, 0.35, 3);
  }
  c.beginPath();
  c.moveTo(42, 152);
  c.lineTo(55, 190);
  c.lineTo(68, 152);
  holo(c, KLEUREN.lampje, 0.4, 3);
}

/* ---------- de kikker en de beestjes bij de getallenlijn ---------- */

/** Floep, de kikker (130 × 120): zittend, van voren. */
function kikker(c: C) {
  const k = KLEUREN.kikker;
  /* pootjes */
  for (const s of [-1, 1]) {
    c.beginPath();
    c.ellipse(65 + s * 40, 106, 20, 9, 0, 0, Math.PI * 2);
    holo(c, k, 0.3, 3);
  }
  /* lijf */
  c.beginPath();
  c.ellipse(65, 80, 44, 32, 0, 0, Math.PI * 2);
  holo(c, k, 0.3);
  /* buik */
  c.beginPath();
  c.ellipse(65, 88, 26, 18, 0, 0, Math.PI * 2);
  c.fillStyle = "rgba(255,255,255,0.18)";
  c.fill();
  /* kop */
  c.beginPath();
  c.ellipse(65, 48, 46, 26, 0, 0, Math.PI * 2);
  holo(c, k, 0.32);
  /* ogen bovenop */
  for (const s of [-1, 1]) {
    rondje(c, 65 + s * 26, 24, 15);
    holo(c, k, 0.35, 3);
    oog(c, 65 + s * 26, 24, 9);
  }
  /* mond */
  c.beginPath();
  c.arc(65, 48, 22, Math.PI * 0.2, Math.PI * 0.8);
  lijn(c, "#eafff0", 3);
}

/** Een vlinder (110 × 100). */
function vlinder(c: C) {
  const k = KLEUREN.vlinder;
  for (const s of [-1, 1]) {
    c.beginPath();
    c.ellipse(55 + s * 25, 36, 24, 28, s * 0.45, 0, Math.PI * 2);
    holo(c, k, 0.3);
    c.beginPath();
    c.ellipse(55 + s * 20, 72, 16, 18, s * -0.4, 0, Math.PI * 2);
    holo(c, k, 0.3);
  }
  c.beginPath();
  c.ellipse(55, 56, 6, 30, 0, 0, Math.PI * 2);
  holo(c, "#e8f2ff", 0.5, 3);
  c.beginPath();
  c.moveTo(52, 28);
  c.quadraticCurveTo(44, 10, 36, 8);
  c.moveTo(58, 28);
  c.quadraticCurveTo(66, 10, 74, 8);
  lijn(c, "#e8f2ff", 2.5);
}

/** Een slak (120 × 90). */
function slak(c: C) {
  const k = KLEUREN.slak;
  c.beginPath();
  c.moveTo(10, 80);
  c.lineTo(100, 80);
  c.quadraticCurveTo(114, 80, 112, 62);
  c.lineTo(108, 44);
  c.quadraticCurveTo(96, 50, 96, 64);
  c.lineTo(20, 70);
  c.quadraticCurveTo(8, 72, 10, 80);
  holo(c, "#ffe2b0", 0.3, 3);
  rondje(c, 52, 46, 32);
  holo(c, k, 0.32);
  c.beginPath();
  for (let i = 0; i <= 40; i++) {
    const h = i * 0.42;
    const r = 3 + i * 0.6;
    const x = 52 + Math.cos(h) * r;
    const y = 46 + Math.sin(h) * r;
    if (i === 0) c.moveTo(x, y);
    else c.lineTo(x, y);
  }
  lijn(c, k, 2.5);
  c.beginPath();
  c.moveTo(104, 46);
  c.lineTo(100, 20);
  c.moveTo(110, 46);
  c.lineTo(114, 22);
  lijn(c, "#ffe2b0", 2.5);
  rondje(c, 100, 18, 4);
  rondje(c, 114, 20, 4);
  c.fillStyle = "#ffe2b0";
  c.fill();
}

/** Een groot waterlelieblad (170 × 90), waar Floep op zit. */
function blad(c: C) {
  const k = KLEUREN.blad;
  c.beginPath();
  c.ellipse(85, 50, 80, 34, 0, Math.PI * 1.62, Math.PI * 1.38);
  c.lineTo(85, 50);
  c.closePath();
  holo(c, k, 0.26);
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

/** Een handje dat voordoet hoe je sleept (80 × 90). */
function hand(c: C) {
  c.beginPath();
  c.moveTo(30, 8);
  c.quadraticCurveTo(38, 2, 42, 10);
  c.lineTo(42, 40);
  c.lineTo(62, 44);
  c.quadraticCurveTo(74, 48, 70, 62);
  c.lineTo(62, 84);
  c.lineTo(28, 84);
  c.lineTo(12, 56);
  c.quadraticCurveTo(10, 46, 20, 48);
  c.lineTo(30, 58);
  c.closePath();
  holo(c, "#ffffff", 0.55, 3.5);
}

/* ---------- de dieren (Getallenlijn met dieren) ---------- */

export type Dier = "uil" | "egel" | "schildpad" | "pinguin" | "konijn" | "olifant";
export const DIEREN: Dier[] = ["uil", "egel", "schildpad", "pinguin", "konijn"];
/** Hoe Bliepo het dier noemt (met lidwoord). */
export const DIERNAAM: Record<Dier, string> = {
  uil: "de uil",
  egel: "de egel",
  schildpad: "de schildpad",
  pinguin: "de pinguïn",
  konijn: "het konijn",
  olifant: "de olifant",
};

function uil(c: C) {
  const k = KLEUREN.uil;
  c.beginPath();
  c.moveTo(24, 30);
  c.lineTo(30, 6);
  c.lineTo(46, 22);
  c.lineTo(74, 22);
  c.lineTo(90, 6);
  c.lineTo(96, 30);
  c.quadraticCurveTo(110, 70, 96, 100);
  c.quadraticCurveTo(60, 124, 24, 100);
  c.quadraticCurveTo(10, 70, 24, 30);
  holo(c, k, 0.3);
  for (const s of [-1, 1]) {
    rondje(c, 60 + s * 19, 46, 16);
    holo(c, k, 0.2, 3);
    oog(c, 60 + s * 19, 46, 11);
  }
  c.beginPath();
  c.moveTo(54, 62);
  c.lineTo(66, 62);
  c.lineTo(60, 74);
  c.closePath();
  c.fillStyle = KLEUREN.lampje;
  c.fill();
  c.beginPath();
  c.moveTo(42, 90);
  c.quadraticCurveTo(60, 98, 78, 90);
  lijn(c, k, 2.5);
}

function egel(c: C) {
  const k = KLEUREN.egel;
  /* pootjes */
  for (const x of [38, 72]) {
    c.beginPath();
    c.ellipse(x, 104, 10, 6, 0, 0, Math.PI * 2);
    holo(c, "#ffe2c4", 0.3, 2.5);
  }
  /* de stekels: een zigzag over de rug */
  c.beginPath();
  const n = 13;
  for (let i = 0; i <= n; i++) {
    const h = Math.PI * 0.92 + (i * Math.PI * 1.0) / n;
    const r = i % 2 === 0 ? 40 : 54;
    const x = 54 + Math.cos(h) * r * 1.1;
    const y = 80 + Math.sin(h) * r;
    if (i === 0) c.moveTo(x, y);
    else c.lineTo(x, y);
  }
  c.lineTo(84, 98);
  c.lineTo(18, 98);
  c.closePath();
  holo(c, k, 0.36);
  /* het snuitje */
  c.beginPath();
  c.ellipse(90, 84, 22, 16, -0.15, 0, Math.PI * 2);
  holo(c, "#ffe2c4", 0.3, 3);
  rondje(c, 110, 82, 5);
  c.fillStyle = "#ffe2c4";
  c.fill();
  oog(c, 90, 77, 5.5);
}

function schildpad(c: C) {
  const k = KLEUREN.schildpad;
  for (const x of [34, 86]) {
    c.beginPath();
    c.roundRect(x - 9, 82, 18, 22, 6);
    holo(c, k, 0.3, 3);
  }
  c.beginPath();
  c.ellipse(104, 74, 14, 12, 0, 0, Math.PI * 2);
  holo(c, k, 0.3, 3);
  oog(c, 108, 70, 4.5);
  c.beginPath();
  c.moveTo(12, 88);
  c.quadraticCurveTo(14, 30, 60, 28);
  c.quadraticCurveTo(106, 30, 108, 88);
  c.closePath();
  holo(c, k, 0.3);
  c.beginPath();
  c.moveTo(40, 88);
  c.lineTo(46, 54);
  c.lineTo(74, 54);
  c.lineTo(80, 88);
  c.moveTo(46, 54);
  c.lineTo(36, 40);
  c.moveTo(74, 54);
  c.lineTo(84, 40);
  lijn(c, rgba(k, 0.75), 2.5);
}

function pinguin(c: C) {
  const k = KLEUREN.pinguin;
  c.beginPath();
  c.ellipse(60, 64, 36, 50, 0, 0, Math.PI * 2);
  holo(c, k, 0.28);
  c.beginPath();
  c.ellipse(60, 74, 22, 36, 0, 0, Math.PI * 2);
  c.fillStyle = "rgba(255,255,255,0.3)";
  c.fill();
  for (const s of [-1, 1]) oog(c, 60 + s * 12, 38, 6);
  c.beginPath();
  c.moveTo(53, 48);
  c.lineTo(67, 48);
  c.lineTo(60, 58);
  c.closePath();
  c.fillStyle = KLEUREN.lampje;
  c.fill();
  for (const s of [-1, 1]) {
    c.beginPath();
    c.ellipse(60 + s * 15, 114, 12, 5, 0, 0, Math.PI * 2);
    c.fillStyle = KLEUREN.lampje;
    c.fill();
  }
}

function konijn(c: C) {
  const k = KLEUREN.konijn;
  for (const s of [-1, 1]) {
    c.beginPath();
    c.ellipse(60 + s * 16, 28, 10, 28, s * 0.15, 0, Math.PI * 2);
    holo(c, k, 0.3, 3);
  }
  c.beginPath();
  c.ellipse(60, 92, 34, 26, 0, 0, Math.PI * 2);
  holo(c, k, 0.28);
  rondje(c, 60, 66, 26);
  holo(c, k, 0.32);
  for (const s of [-1, 1]) oog(c, 60 + s * 10, 62, 5.5);
  rondje(c, 60, 74, 4);
  c.fillStyle = "#ff9fd2";
  c.fill();
}

function olifant(c: C) {
  const k = KLEUREN.olifant;
  /* poten */
  for (const x of [60, 96, 150, 186]) {
    c.beginPath();
    c.roundRect(x - 13, 92, 26, 36, 8);
    holo(c, k, 0.3, 3);
  }
  /* lijf */
  c.beginPath();
  c.ellipse(124, 78, 82, 46, 0, 0, Math.PI * 2);
  holo(c, k, 0.3);
  /* kop */
  rondje(c, 216, 60, 34);
  holo(c, k, 0.32);
  /* oor */
  c.beginPath();
  c.ellipse(196, 64, 20, 28, 0.2, 0, Math.PI * 2);
  holo(c, k, 0.22, 3);
  /* slurf */
  c.beginPath();
  c.moveTo(240, 74);
  c.quadraticCurveTo(254, 104, 238, 124);
  lijn(c, k, 9);
  oog(c, 226, 50, 5.5);
  /* staartje */
  c.beginPath();
  c.moveTo(43, 70);
  c.quadraticCurveTo(32, 84, 36, 96);
  lijn(c, k, 3);
}

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
  raket: { b: 110, h: 200 },
  kikker: { b: 130, h: 120 },
  vlinder: { b: 110, h: 100 },
  slak: { b: 120, h: 90 },
  blad: { b: 170, h: 90 },
  bordje: { b: 120, h: 170 },
  pijl: { b: 40, h: 90 },
  hand: { b: 80, h: 90 },
  dier: { b: 120, h: 120 },
  olifant: { b: 260, h: 132 },
} as const;

/**
 * Alle plaatjes van de getallenlijnlessen, met hun gebakken gloed
 * (`<naam>-g`). Eén keer per scène.
 */
export function maakPlaatjes(sc: Holo) {
  const een = (naam: string, b: number, h: number, kleur: string, teken: (c: C) => void) => {
    sc.canvasPlaatje(naam, b, h, teken);
    sc.bak(naam, `${naam}-g`, hexGetal(kleur));
  };
  een("lampje", MAAT.lampje.b, MAAT.lampje.h, KLEUREN.lampje, lampje(KLEUREN.lampje));
  een("lampje-rood", MAAT.lampje.b, MAAT.lampje.h, KLEUREN.rood, lampje(KLEUREN.rood));
  een("planeet", MAAT.planeet.b, MAAT.planeet.h, KLEUREN.planeet, planeet(KLEUREN.planeet));
  een("kristal", MAAT.kristal.b, MAAT.kristal.h, KLEUREN.kristal, kristal(KLEUREN.kristal));
  een("ster", MAAT.ster.b, MAAT.ster.h, KLEUREN.ster, ster(KLEUREN.ster));
  een("kaart", MAAT.kaart.b, MAAT.kaart.h, KLEUREN.kaart, kaart(KLEUREN.kaart));
  een("kaart-vast", MAAT.kaart.b, MAAT.kaart.h, KLEUREN.vast, kaart(KLEUREN.vast, 0.3));
  een("tegel", MAAT.kaart.b, MAAT.kaart.h, KLEUREN.tegel, kaart(KLEUREN.tegel, 0.2));
  een("hokje", MAAT.kaart.b, MAAT.kaart.h, KLEUREN.rood, kaart(KLEUREN.rood, 0.24));
  sc.canvasPlaatje("vak", MAAT.vak.b, MAAT.vak.h, vak);
  een("vlag", MAAT.vlag.b, MAAT.vlag.h, KLEUREN.lampje, vlag);
  een("raket", MAAT.raket.b, MAAT.raket.h, KLEUREN.raket, raket);
  een("kikker", MAAT.kikker.b, MAAT.kikker.h, KLEUREN.kikker, kikker);
  een("vlinder", MAAT.vlinder.b, MAAT.vlinder.h, KLEUREN.vlinder, vlinder);
  een("slak", MAAT.slak.b, MAAT.slak.h, KLEUREN.slak, slak);
  een("blad", MAAT.blad.b, MAAT.blad.h, KLEUREN.blad, blad);
  een("bordje", MAAT.bordje.b, MAAT.bordje.h, KLEUREN.bordje, bordje);
  sc.canvasPlaatje("pijl", MAAT.pijl.b, MAAT.pijl.h, pijl);
  sc.canvasPlaatje("hand", MAAT.hand.b, MAAT.hand.h, hand);
  een("uil", MAAT.dier.b, MAAT.dier.h, KLEUREN.uil, uil);
  een("egel", MAAT.dier.b, MAAT.dier.h, KLEUREN.egel, egel);
  een("schildpad", MAAT.dier.b, MAAT.dier.h, KLEUREN.schildpad, schildpad);
  een("pinguin", MAAT.dier.b, MAAT.dier.h, KLEUREN.pinguin, pinguin);
  een("konijn", MAAT.dier.b, MAAT.dier.h, KLEUREN.konijn, konijn);
  een("olifant", MAAT.olifant.b, MAAT.olifant.h, KLEUREN.olifant, olifant);
}
