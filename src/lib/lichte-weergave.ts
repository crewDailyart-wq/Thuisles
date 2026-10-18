"use client";

/**
 * Lichte weergave (19 oktober 2026, opdracht eigenaar): op telefoon en tablet,
 * en op elk apparaat dat traag blijkt, geen echte 3D. De 3D-motor (Three.js)
 * wordt dan helemaal niet geladen; Bliepo en het atelier zijn dan vooraf
 * gemaakte plaatjes en filmpjes die er hetzelfde uitzien. Op laptop en
 * computer blijft alles zoals het was.
 *
 * Wanneer licht:
 *   - telefoon of tablet: het belangrijkste aanwijsapparaat is een vinger
 *     (pointer: coarse). Een laptop met aanraakscherm heeft een muis of
 *     touchpad als belangrijkste en blijft dus 3D;
 *   - traag apparaat: 4 of minder rekenkernen, of 4 GB geheugen of minder
 *     (voor zover de browser dat vertelt).
 * Uitproberen kan met ?weergave=licht of ?weergave=vol in het adres; dat
 * geldt dan voor de rest van het bezoek (sessionStorage).
 */

import { useSyncExternalStore } from "react";

const SLEUTEL = "thuisles:weergave";

export function isLichteWeergave(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const keuze = new URLSearchParams(location.search).get("weergave");
    if (keuze === "licht" || keuze === "vol") sessionStorage.setItem(SLEUTEL, keuze);
    const bewaard = sessionStorage.getItem(SLEUTEL);
    if (bewaard === "licht") return true;
    if (bewaard === "vol") return false;
  } catch {
    /* Privémodus: dan beslist het apparaat. */
  }
  if (window.matchMedia("(pointer: coarse)").matches) return true;
  const kernen = navigator.hardwareConcurrency || 0;
  const geheugen = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  return (kernen > 0 && kernen <= 4) || (geheugen !== undefined && geheugen <= 4);
}

const geenAbonnement = () => () => {};

/**
 * Op de server en bij de allereerste weergave: null (nog onbekend). Wie
 * 3D wil starten, wacht tot dit false is; wie licht is, krijgt true.
 */
export function useLichteWeergave(): boolean | null {
  return useSyncExternalStore(geenAbonnement, isLichteWeergave, () => null);
}
