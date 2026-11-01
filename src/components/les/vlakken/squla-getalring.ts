/**
 * Een voorwerp met een ring in de kleur van zijn getal (1 november 2026,
 * BOUWREGELS 2.1): in een som als 4 + 3 hoort elk getal bij zijn eigen
 * voorwerpen. De plaatjes uit Magnific hebben zelf geen kleur, dus krijgen ze
 * een duidelijk randje in de kleur van het getal, met een zachte gloed.
 *
 * Eén keer getekend (de aanroeper bewaart het in een textuur), nooit elk
 * beeld opnieuw. Het voorwerp zelf wordt er stevig bovenop getekend en is
 * dus nooit doorzichtig of onduidelijk (BOUWREGELS 7.2). De ring is een vast randje in de kleur van het getal.
 */

import { getalkleur } from "../tegels";
import { TX } from "../holo/basis";

type C = CanvasRenderingContext2D;

/** De kleur van een getal, zoals in de som en in Bliepo's zin (boven de 10: wit). */
export const ringKleur = (n: number) => getalkleur(n);

/** De ruimte rond het voorwerp voor de ring, in punten. */
export const ringRuimte = (b: number, h: number) => Math.max(5, Math.round(Math.min(b, h) * 0.14));

/**
 * Tekent het voorwerp (`teken` krijgt x, y, b, h van het vak waar het in past)
 * met een ring in `kleur`. De tekening is (b + 2·ruimte) × (h + 2·ruimte).
 */
export function tekenMetRing(c: C, b: number, h: number, kleur: string, teken: (c: C, x: number, y: number, b: number, h: number) => void) {
  const m = ringRuimte(b, h);
  const W = b + 2 * m;
  const H = h + 2 * m;

  /* Het voorwerp als egale vlek in de kleur van het getal. */
  const vlek = document.createElement("canvas");
  vlek.width = Math.ceil(W * TX);
  vlek.height = Math.ceil(H * TX);
  const v = vlek.getContext("2d")!;
  v.scale(TX, TX);
  teken(v, m, m, b, h);
  v.globalCompositeOperation = "source-in";
  v.fillStyle = kleur;
  v.fillRect(0, 0, W, H);

  /* Zachte gloed in dezelfde kleur. */
  c.save();
  c.shadowColor = kleur;
  c.shadowBlur = m * 1.1 * TX;
  c.globalAlpha = 1;
  c.drawImage(vlek, 0, 0, W, H);
  c.drawImage(vlek, 0, 0, W, H);
  c.restore();

  /* Het randje: de vlek een klein stukje naar alle kanten. */
  const r = Math.max(2.4, m * 0.42);
  for (let i = 0; i < 16; i++) {
    const hoek = (i / 16) * Math.PI * 2;
    c.drawImage(vlek, Math.cos(hoek) * r, Math.sin(hoek) * r, W, H);
  }

  /* Het voorwerp zelf, vol en stevig. */
  teken(c, m, m, b, h);
}
