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
 * De kleur van elk getal in de Squla-lessen (BOUWREGELS 2.1, 14.22, 14.24), als KLEURNAAM van Bliepo's zin, zodat de
 * som, de zin, de voorwerpen en de platen altijd dezelfde kleur hebben. Nooit wit of grijs (dat is "weg"), behalve
 * bij 0. De tegelkleuren die op elkaar lijken (4 en 5, 6 en 7, 9 en 10) vallen samen in één kleurfamilie; welke
 * twee getallen van een som er echt verschillend uitzien, bepaalt `somKleuren`.
 */
const BASIS = ["wit", "rood", "oranje", "geel", "groen", "groen", "blauw", "blauw", "paars", "roze", "roze"];
const BOVEN_TIEN = ["oranje", "roze", "paars", "blauw", "groen", "rood", "oranje", "paars", "roze", "blauw"];

/** De kleurnaam van één getal (0 en lager: wit). */
export const basisNaam = (n: number): string => (n > 10 ? BOVEN_TIEN[(n - 11) % BOVEN_TIEN.length] : (BASIS[Math.max(0, n)] ?? "wit"));

/** De kleurnaam voor Bliepo's zin bij een getal; undefined bij 0 (dan geldt wit). */
export const getalNaam = (n: number): string | undefined => (n >= 1 ? basisNaam(n) : undefined);

/** Kleuren die te veel op elkaar lijken (paars en roze, rood en roze, bruin en oranje). */
const LIJKT: string[][] = [["paars", "roze"], ["rood", "roze"], ["bruin", "oranje"]];
const lijkt = (x: string, y: string) => x === y || LIJKT.some((p) => p.includes(x) && p.includes(y));
/** De reservekleuren, in de volgorde waarin er een gekozen wordt: duidelijk verschillend van elkaar. */
const RESERVE = ["blauw", "oranje", "groen", "paars", "geel", "rood", "roze", "bruin"];

/** Een kleur die duidelijk anders is dan `eerste`: de voorkeur als die genoeg verschilt, anders de eerste reservekleur. */
export function kiesAnder(eerste: string, voorkeur?: string): string {
  if (voorkeur && !lijkt(eerste, voorkeur)) return voorkeur;
  return RESERVE.find((c) => !lijkt(eerste, c)) ?? "blauw";
}

/**
 * De twee kleuren van een som a ◦ b: het eerste getal houdt zijn eigen kleur, het tweede ook, tenzij die gelijk is
 * aan of lijkt op die van het eerste (7 + 7, 4 + 5, 14 − 7): dan krijgt het tweede een duidelijk andere kleur.
 * Het totaal is wit (plussom). ÉÉN functie voor de som, de zin, de voorwerpen en de platen.
 */
export function somKleuren(a: number, b: number): [string, string] {
  const ka = basisNaam(a);
  return [ka, kiesAnder(ka, basisNaam(b))];
}

/** De kleur van een getal, zoals in de som en in Bliepo's zin. */
export const ringKleur = (n: number) => KLEURHEX[basisNaam(n)];

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

/**
 * Bij eten (de bakkerij) blijft het lekkers zelf in zijn echte kleur en krijgt het alleen een randje (BOUWREGELS 2.1,
 * besluit Sara). Daarom krijgt elk groepje een getalkleur die bij het lekkers past (taartjes roze, koekjes bruin), in
 * de som, in de zin en als randje. [eerste groepje, tweede groepje als het hetzelfde soort lekkers is].
 */
const EET_KLEUR: Record<string, [string, string]> = {
  taart: ["roze", "geel"],
  cupcake: ["roze", "paars"],
  donut: ["roze", "geel"],
  croissant: ["oranje", "geel"],
  stokbrood: ["bruin", "geel"],
  brood: ["bruin", "geel"],
  "bruin-brood": ["bruin", "oranje"],
  broodje: ["bruin", "geel"],
  koekje: ["bruin", "geel"],
  krentenbol: ["bruin", "paars"],
};

/** De kleurnaam per groepje lekkers; het tweede groepje is altijd duidelijk anders dan het eerste, ook bij 4 + 4. */
export function etenKleuren(groepen: { n: number; ding: string }[]): string[] {
  const kies = (ding: string, i: 0 | 1) => (EET_KLEUR[ding] ?? ["oranje", "geel"])[i];
  const a = kies(groepen[0].ding, 0);
  if (groepen.length < 2) return [a];
  const eerste = kies(groepen[1].ding, 0);
  const voorkeur = groepen[1].ding === groepen[0].ding ? kies(groepen[1].ding, 1) : eerste;
  return [a, kiesAnder(a, voorkeur)];
}
