/**
 * De gloed rond hologrammen in de lessen, op één plek (27 oktober 2026,
 * opdracht eigenaar: "de gloed is te veel; subtieler, een zacht smal randje
 * licht"; ONTWERPREGELS.md "Gloed").
 *
 * De sterkte komt uit de stijl (lib/stijl.ts, `gloed`, standaard 0,5) via de
 * CSS-variabele --stijl-gloed, zodat hij later in de stijlkiezer aan te passen
 * is. Alle Phaser-lessen gebruiken deze maten; niemand zet zelf een gloed.
 */

import { STANDAARD_STIJL } from "@/lib/stijl";

/** 0 tot 1 (0 = geen gloed). */
export function gloedSterkte(): number {
  if (typeof window === "undefined") return STANDAARD_STIJL.gloed;
  const ruw = getComputedStyle(document.documentElement).getPropertyValue("--stijl-gloed").trim();
  const n = ruw === "" ? NaN : Number(ruw);
  return Number.isFinite(n) && n >= 0 && n <= 1 ? n : STANDAARD_STIJL.gloed;
}

/**
 * De maten voor het Glow-filter van Phaser bij een sterkte (die van de eerste
 * voorbeeldles was buiten 2,2–2,6 en breed 2,5; nu standaard ongeveer de
 * helft zo sterk en smaller). `rand` = hoeveel ruimte de gebakken gloed om
 * het voorwerp nodig heeft.
 */
export function gloedMaten(sterkte = gloedSterkte()) {
  const s = Math.max(0, Math.min(1, sterkte));
  return {
    /** buitengloed van het Glow-filter */
    buiten: 2.4 * s,
    /** hoe breed (schaal van het filter) */
    breedte: 0.8 + 1.7 * s,
    /** ruimte rond het plaatje voor de gebakken gloed, in punten */
    rand: Math.round(6 + 18 * s),
    /** hoe fel lichtflitsen, -golven en selectieringen mogen zijn (0–1) */
    flits: 0.35 + 0.5 * s,
  };
}
