/**
 * Een voorwerp met een ring in de kleur van zijn getal (1 november 2026,
 * BOUWREGELS 2.1): in een som als 4 + 3 hoort elk getal bij zijn eigen
 * voorwerpen. De plaatjes uit Magnific hebben zelf geen kleur, dus krijgen ze
 * een duidelijk randje in de kleur van het getal, met een zachte gloed.
 *
 * Eén keer getekend (de aanroeper bewaart het in een textuur), nooit elk
 * beeld opnieuw. Het voorwerp zelf wordt er stevig bovenop getekend en is
 * dus nooit doorzichtig of onduidelijk (BOUWREGELS 7.2). De ring is een vast randje in de kleur van het getal.
 *
 * `heel` (1 november 2026, besluit Sara): bij speelgoed en dingen krijgt het HELE
 * voorwerp de kleur van zijn getal (de schaduw en glans blijven, alleen de
 * kleur verandert), zonder ring. Bij fruit en eten blijft de echte kleur en de
 * ring; daar kiest de les een getalkleur die bij het fruit past. Of een
 * voorwerp heel gekleurd mag worden: `voorwerpKleurbaar(naam)`.
 */

import { getalkleur } from "../tegels";
import { TX } from "../holo/basis";

type C = CanvasRenderingContext2D;

/** De kleurnamen van Bliepo's zin ({14:blauw}) met hun kleur; dezelfde als KLEURNAAM in Lesscherm.tsx. */
export const KLEURHEX: Record<string, string> = {
  rood: "#ff7b7b",
  oranje: "#ffad5c",
  geel: "#ffe066",
  groen: "#7ee0a0",
  blauw: "#8fc4ff",
  paars: "#c9a2ff",
  roze: "#ff9fd2",
  wit: "#ffffff",
  bruin: "#d9a066",
};

/**
 * Getallen boven de 10 hebben in de tegels geen kleur (wit), maar wit is in de Squla-lessen de kleur van "weg" en
 * van een voorwerp zonder kleur (BOUWREGELS 14.22/14.23). Daarom krijgt elk getal van 11 t/m 20 hier een ECHTE kleur
 * (geen wit, geen grijs): in de som, in de zin en op de voorwerpen.
 */
const BOVEN_TIEN = ["oranje", "roze", "paars", "blauw", "groen", "rood", "oranje", "paars", "roze", "blauw"];

/** De kleurnaam voor Bliepo's zin bij een getal boven de 10; anders undefined (dan geldt de tegelkleur). */
export const getalNaam = (n: number): string | undefined => (n > 10 ? BOVEN_TIEN[(n - 11) % BOVEN_TIEN.length] : undefined);

/** De kleur van een getal, zoals in de som en in Bliepo's zin (boven de 10: een echte kleur, zie getalNaam). */
export const ringKleur = (n: number) => (n > 10 ? KLEURHEX[getalNaam(n)!] : getalkleur(n));

/** De ruimte rond het voorwerp voor de ring, in punten. */
export const ringRuimte = (b: number, h: number) => Math.max(5, Math.round(Math.min(b, h) * 0.14));

/**
 * Tekent het voorwerp (`teken` krijgt x, y, b, h van het vak waar het in past)
 * met een ring in `kleur`. De tekening is (b + 2·ruimte) × (h + 2·ruimte).
 */
export function tekenMetRing(c: C, b: number, h: number, kleur: string, teken: (c: C, x: number, y: number, b: number, h: number) => void, heel = false) {
  const m = ringRuimte(b, h);
  const W = b + 2 * m;
  const H = h + 2 * m;

  if (heel) {
    /* Het hele voorwerp in de kleur van het getal: de kleur wordt vervangen, licht en donker (glans, rand) blijven. */
    const laag = document.createElement("canvas");
    laag.width = Math.ceil(W * TX);
    laag.height = Math.ceil(H * TX);
    const l = laag.getContext("2d")!;
    l.scale(TX, TX);
    teken(l, m, m, b, h);
    l.globalCompositeOperation = "color";
    l.fillStyle = kleur;
    l.fillRect(0, 0, W, H);
    l.globalCompositeOperation = "destination-in";
    teken(l, m, m, b, h);
    /* een zachte gloed in dezelfde kleur, dan het gekleurde voorwerp vol erop */
    c.save();
    c.shadowColor = kleur;
    c.shadowBlur = m * 0.8 * TX;
    c.drawImage(laag, 0, 0, W, H);
    c.restore();
    c.drawImage(laag, 0, 0, W, H);
    return;
  }

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
