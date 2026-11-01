/**
 * Het rekenmateriaal van de lessen "Rekenmix" naar Squla groep 3 (31 oktober
 * 2026), strak in code getekend: platte vormen (cirkel, driehoek, vierkant,
 * rechthoek) in een kleur, blokjes, kleurvlekken en getaltegels. Echte dingen
 * (ballen, appels, raketjes …) zijn GEEN tekening hier: die komen uit
 * public/voorwerpen (src/components/les/voorwerpen.ts).
 *
 * Alles tekent in een vak van (0, 0) tot (m, m), vlak, met een donkere rand.
 * Geen live filters (HARDE REGEL 7): de scène tekent elk plaatje één keer.
 */

import { tekenVoorwerp, voorwerpKleurbaar } from "../voorwerpen";
import { tekenVorm as tekenGlansVorm, type Kleur as VormKleur } from "./squla-vormen-tekenen";
import { tekenMetRing, ringRuimte } from "./squla-getalring";

export type RMKleur = "rood" | "oranje" | "geel" | "groen" | "blauw" | "paars" | "roze" | "wit" | "licht";

export const RM_KLEUR: Record<RMKleur, string> = {
  rood: "#ff5c6e",
  oranje: "#ffa04d",
  geel: "#ffd93d",
  groen: "#5fd877",
  blauw: "#5f9dff",
  paars: "#b47bff",
  roze: "#ff86cc",
  wit: "#f3efe4",
  /* De vormen bij "welke vorm lijkt erop?": allemaal dezelfde lichte kleur, zodat de kleur niets verklapt. */
  licht: "#9fe9ff",
};

export const rmHex = (k: RMKleur) => parseInt(RM_KLEUR[k].slice(1), 16);

export type RMVorm = "cirkel" | "driehoek" | "vierkant" | "rechthoek" | "blokje" | "vlek";

const RAND = "#1d2b5e";

type C = CanvasRenderingContext2D;

/** De maat (in punten) waarin vormen en voorwerpen één keer getekend worden. */
export const RM_MAAT = 160;

/** Welke kleur van de vormenlessen (glansstijl B) bij welke Rekenmix-kleur hoort. */
const GLANSKLEUR: Partial<Record<RMKleur, VormKleur>> = {
  rood: "rood", oranje: "oranje", geel: "geel", groen: "groen", blauw: "blauw", paars: "paars", roze: "roze", licht: "lichtblauw",
};

/**
 * Een vorm, gecentreerd in een vak van m × m. De vier platte vormen krijgen
 * glansstijl B, precies zoals in de vormenlessen (BOUWREGELS 7.7: zelfde vorm =
 * zelfde uiterlijk); het blokje en de vlek blijven zoals ze waren.
 */
export function tekenVorm(c: C, vorm: RMVorm, kleur: RMKleur, m: number) {
  const glans = GLANSKLEUR[kleur];
  if (glans && (vorm === "cirkel" || vorm === "driehoek" || vorm === "vierkant" || vorm === "rechthoek")) {
    tekenGlansVorm(c, vorm, m, glans, 0);
    return;
  }
  const k = RM_KLEUR[kleur];
  const mid = m / 2;
  c.lineJoin = "round";
  c.beginPath();
  if (vorm === "cirkel" || vorm === "vlek") c.arc(mid, mid, m * 0.42, 0, Math.PI * 2);
  else if (vorm === "driehoek") {
    const h = m * 0.78;
    const b = m * 0.86;
    const top = mid - h / 2 + m * 0.02;
    c.moveTo(mid, top);
    c.lineTo(mid + b / 2, top + h);
    c.lineTo(mid - b / 2, top + h);
    c.closePath();
  } else if (vorm === "vierkant") c.rect(mid - m * 0.38, mid - m * 0.38, m * 0.76, m * 0.76);
  else if (vorm === "rechthoek") c.rect(mid - m * 0.45, mid - m * 0.25, m * 0.9, m * 0.5);
  else c.roundRect(m * 0.08, m * 0.08, m * 0.84, m * 0.84, m * 0.12);
  c.fillStyle = k;
  c.fill();
  c.strokeStyle = RAND;
  c.lineWidth = Math.max(3, m * 0.035);
  c.stroke();
}

/** Een getaltegel (een getal op een bordje mag): rond vierkant met een groot getal, in een vak van m × m. */
export function tekenTegel(c: C, n: number, m: number) {
  c.beginPath();
  c.roundRect(m * 0.06, m * 0.06, m * 0.88, m * 0.88, m * 0.16);
  c.fillStyle = "#fff8e8";
  c.fill();
  c.strokeStyle = RAND;
  c.lineWidth = Math.max(3, m * 0.035);
  c.stroke();
  c.font = `800 ${Math.round(m * (n >= 10 ? 0.5 : 0.58))}px "Work Sans", system-ui, sans-serif`;
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.fillStyle = "#1e2a5c";
  c.fillText(String(n), m / 2, m / 2 + m * 0.03);
}

/** Een voorwerp (vast plaatje) passend in een vak van m × m. */
export function tekenDing(c: C, naam: string, m: number) {
  tekenVoorwerp(c, naam, m * 0.03, m * 0.03, m * 0.94, m * 0.94);
}

/**
 * Een voorwerp met een ring in de kleur van zijn groepje (BOUWREGELS 2.1): bij
 * "samen" en splitsen hebben de twee groepjes elk hun eigen kleur. Het voorwerp
 * zelf is RING_BINNEN groot; met de ring eromheen is het plaatje RING_MAAT.
 */
export const RING_BINNEN = 140;
export const RING_MAAT = RING_BINNEN + 2 * ringRuimte(RING_BINNEN, RING_BINNEN);

export function tekenDingMetRing(c: C, naam: string, kleur: string) {
  tekenMetRing(c, RING_BINNEN, RING_BINNEN, kleur, (cc, x, y, b, h) => tekenVoorwerp(cc, naam, x, y, b, h), voorwerpKleurbaar(naam));
}

/** De kleuren van de getallen in het beeld, dezelfde als in de zin van Bliepo (Lesscherm KLEURNAAM). */
export const LABELKLEUR: Record<string, string> = {
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
