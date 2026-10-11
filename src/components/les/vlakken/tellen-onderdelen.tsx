"use client";

/**
 * Kleine onderdelen die de vlakken van "Tellen tot 120" delen: de knop met het
 * vinkje waarmee het kind zegt dat het klaar is met tikken.
 */

import type { CSSProperties } from "react";
import s from "./tellen-stijl.module.css";

export function Vinkje({ maat = 24 }: { maat?: number }) {
  return (
    <svg width={maat} height={maat} viewBox="0 0 24 24" aria-hidden>
      <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** De blauwe knop met het vinkje; meldt `{ soort: "klaar" }`. */
export function Klaarknop({ x, y, onKlaar }: { x: number; y: number; onKlaar: () => void }) {
  const stijl: CSSProperties = { left: x - 28, top: y };
  return (
    <button type="button" className={s.klaar} style={stijl} aria-label="Klaar, controleer" onClick={onKlaar}>
      <Vinkje maat={28} />
    </button>
  );
}
