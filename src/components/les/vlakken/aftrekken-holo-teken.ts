/**
 * Gedeelde tekeningen voor de Aftrekken-hologrammen (27 oktober 2026,
 * wereld Aarde, LESSENPLAN.md § 2.4): het vuurvliegje, het lantaarntje en
 * de knop-iconen. Alles wordt één keer getekend (canvasPlaatje) en de gloed
 * één keer gebakken (bak, met de centrale sterkte); nooit een gloed die elk
 * beeld opnieuw wordt uitgerekend (HARDE REGEL 7).
 */

import type { Holo } from "../holo/basis";

/** De kleur van het licht van een vuurvliegje (warm geelgroen). */
export const VUURVLIEG = 0xf6ff9a;
/** De warme kleur van de Aarde-hologrammen. */
export const AARDE = 0xffd36e;

/** Hoe het lichtje van een vuurvliegje kleurt (van het witte hart naar de rand). */
export type VliegLicht = {
  /** De naam van het plaatje (standaard "vlieg"); de gloed heet `${sleutel}-gloed`. */
  sleutel?: string;
  /** De kleur halverwege het lichtje (standaard "#fbffc8"). */
  midden?: string;
  /** De kleur aan de rand van het lichtje (standaard "#d8ee4a"). */
  rand?: string;
  /** De kleur van de gebakken gloed (standaard VUURVLIEG). */
  gloed?: number;
};

/**
 * Een vuurvliegje: twee doorschijnende vleugeltjes, een donker kopje en
 * lijfje, en een helder lichtje als achterlijf. Het lichtje is wat je telt,
 * dus groot en egaal. Zonder `licht` is het het warme geelgroene vuurvliegje
 * van Aftrekken; met `licht` krijgt alleen het lichtje een andere kleur
 * (Vergelijken: blauw, geel, groen), zodat het overal hetzelfde beestje is.
 * Plaatje "vlieg" (60 × 54), met gloed "vlieg-gloed".
 */
export function maakVuurvliegje(sc: Holo, licht: VliegLicht = {}) {
  const sleutel = licht.sleutel ?? "vlieg";
  sc.canvasPlaatje(sleutel, 60, 54, (c) => {
    /* vleugels */
    c.fillStyle = "rgba(220,245,255,0.42)";
    c.strokeStyle = "rgba(235,250,255,0.75)";
    c.lineWidth = 1.5;
    for (const k of [-1, 1]) {
      c.beginPath();
      c.ellipse(30 + k * 13, 15, 13, 8, k * -0.55, 0, Math.PI * 2);
      c.fill();
      c.stroke();
    }
    /* kopje en lijfje */
    c.fillStyle = "#3b3a2a";
    c.beginPath();
    c.ellipse(30, 19, 6, 8, 0, 0, Math.PI * 2);
    c.fill();
    /* het lichtje */
    const g = c.createRadialGradient(28, 31, 2, 30, 35, 17);
    g.addColorStop(0, "#ffffff");
    g.addColorStop(0.45, licht.midden ?? "#fbffc8");
    g.addColorStop(1, licht.rand ?? "#d8ee4a");
    c.fillStyle = g;
    c.beginPath();
    c.arc(30, 35, 15, 0, Math.PI * 2);
    c.fill();
  });
  sc.bak(sleutel, `${sleutel}-gloed`, licht.gloed ?? VUURVLIEG);
}

/**
 * De vorm van het glazen potje: een bolle buik met schoudertjes, een hals en
 * een deksel. Alle maten in punten van het plaatje.
 */
export type PotVorm = {
  /** Links en rechts van de buik. */
  links: number;
  rechts: number;
  /** Bovenkant van de buik (waar de hals begint) en de bodem. */
  buikBoven: number;
  onder: number;
  /** Waar de hals op de buik staat (links en rechts). */
  halsLinks: number;
  halsRechts: number;
  /** Hoe hoog de schoudertjes zijn, en hoe rond de hoeken onderaan. */
  schouder: number;
  hoek: number;
  /** De hals: boven en hoogte, met de ronding. */
  halsY: number;
  halsH: number;
  halsR: number;
  /** Het deksel: links, rechts, boven, hoogte en ronding. */
  dekselLinks: number;
  dekselRechts: number;
  dekselY: number;
  dekselH: number;
  dekselR: number;
  /** Het glanslijntje links: x, van, tot. */
  glansX: number;
  glansVan: number;
  glansTot: number;
};

/** Het potje van Aftrekken (400 × 470). */
export const POT_AFTREKKEN: PotVorm = {
  links: 30,
  rechts: 370,
  buikBoven: 80,
  onder: 462,
  halsLinks: 92,
  halsRechts: 308,
  schouder: 70,
  hoek: 52,
  halsY: 50,
  halsH: 32,
  halsR: 8,
  dekselLinks: 80,
  dekselRechts: 320,
  dekselY: 22,
  dekselH: 30,
  dekselR: 10,
  glansX: 56,
  glansVan: 170,
  glansTot: 380,
};

/** Alleen de buik als pad (om te vullen, te knippen of te omlijnen). */
function potBuik(c: CanvasRenderingContext2D, v: PotVorm) {
  const knik = v.buikBoven + (v.schouder * 12) / 70;
  c.beginPath();
  c.moveTo(v.halsLinks, v.buikBoven);
  c.quadraticCurveTo(v.links, knik, v.links, v.buikBoven + v.schouder);
  c.lineTo(v.links, v.onder - v.hoek);
  c.quadraticCurveTo(v.links, v.onder, v.links + v.hoek, v.onder);
  c.lineTo(v.rechts - v.hoek, v.onder);
  c.quadraticCurveTo(v.rechts, v.onder, v.rechts, v.onder - v.hoek);
  c.lineTo(v.rechts, v.buikBoven + v.schouder);
  c.quadraticCurveTo(v.rechts, knik, v.halsRechts, v.buikBoven);
  c.closePath();
}

/**
 * Het glazen potje tekenen: deksel, hals en een bolle buik, met een paar
 * zachte lichtlijntjes en een glanslijn. Hetzelfde potje in elke les.
 */
export function tekenPot(c: CanvasRenderingContext2D, v: PotVorm) {
  const breed = v.rechts + v.links;
  potBuik(c, v);
  c.fillStyle = "rgba(255,226,160,0.07)";
  c.fill();
  c.save();
  potBuik(c, v);
  c.clip();
  c.strokeStyle = "rgba(255,230,170,0.06)";
  c.lineWidth = 1;
  for (let y = v.buikBoven; y < v.onder + 8; y += 7) {
    c.beginPath();
    c.moveTo(0, y);
    c.lineTo(breed, y);
    c.stroke();
  }
  c.restore();
  potBuik(c, v);
  c.strokeStyle = "#ffd36e";
  c.lineWidth = 3.5;
  c.stroke();
  /* de hals */
  c.beginPath();
  c.roundRect(v.halsLinks, v.halsY, v.halsRechts - v.halsLinks, v.halsH, v.halsR);
  c.fillStyle = "rgba(255,211,110,0.1)";
  c.fill();
  c.stroke();
  /* het deksel */
  c.beginPath();
  c.roundRect(v.dekselLinks, v.dekselY, v.dekselRechts - v.dekselLinks, v.dekselH, v.dekselR);
  c.fillStyle = "rgba(255,211,110,0.28)";
  c.fill();
  c.stroke();
  /* glans links */
  c.strokeStyle = "rgba(255,255,255,0.28)";
  c.lineWidth = 5;
  c.lineCap = "round";
  c.beginPath();
  c.moveTo(v.glansX, v.glansVan);
  c.lineTo(v.glansX, v.glansTot);
  c.stroke();
}

/**
 * Een lantaarntje (een kapje, een glazen huisje en een voetje). `aan`: het
 * huisje brandt warm; uit: alleen een lichte rand.
 * Plaatjes "lantaarn-aan" en "lantaarn-uit" (44 × 60), met gloed.
 */
export function maakLantaarntje(sc: Holo) {
  for (const aan of [true, false]) {
    const sl = aan ? "lantaarn-aan" : "lantaarn-uit";
    sc.canvasPlaatje(sl, 44, 60, (c) => {
      const rand = aan ? "rgba(255,222,150,1)" : "rgba(255,226,170,0.55)";
      c.strokeStyle = rand;
      c.lineWidth = 2.5;
      c.lineJoin = "round";
      /* hengsel */
      c.beginPath();
      c.arc(22, 8, 5, Math.PI, 0);
      c.stroke();
      /* kapje */
      c.fillStyle = aan ? "rgba(255,211,110,0.55)" : "rgba(255,211,110,0.12)";
      c.beginPath();
      c.moveTo(10, 18);
      c.lineTo(22, 9);
      c.lineTo(34, 18);
      c.closePath();
      c.fill();
      c.stroke();
      /* het huisje */
      c.beginPath();
      c.roundRect(11, 19, 22, 28, 5);
      if (aan) {
        const g = c.createRadialGradient(22, 33, 1, 22, 33, 15);
        g.addColorStop(0, "#fffbe6");
        g.addColorStop(0.5, "#ffe08a");
        g.addColorStop(1, "rgba(255,190,80,0.85)");
        c.fillStyle = g;
      } else {
        c.fillStyle = "rgba(255,211,110,0.08)";
      }
      c.fill();
      c.stroke();
      /* voetje */
      c.beginPath();
      c.moveTo(9, 50);
      c.lineTo(35, 50);
      c.stroke();
    });
    if (aan) sc.bak(sl, `${sl}-gloed`, AARDE);
  }
}
