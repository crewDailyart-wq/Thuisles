"use client";

/**
 * Vloeiend scrollen op de startpagina (19 oktober 2026, opdracht eigenaar).
 *
 * Met Lenis (lenis 1.3.26) glijdt de pagina bij muis en touchpad zacht mee in
 * plaats van met schokjes. De pijltjestoetsen, de knoppen in de bovenbalk,
 * "Mijn leerpad" en links naar een plek op de pagina blijven gewoon werken;
 * de bovenbalk staat vast en blijft dus bovenaan.
 *
 * Alleen op laptop en computer. Gewoon scrollen blijft het:
 *   - op telefoon en tablet (en trage apparaten): daar is het scrollen van het
 *     apparaat zelf al vloeiend (lib/lichte-weergave.ts);
 *   - bij "Beweging uit" en als het apparaat "minder beweging" heeft
 *     ingesteld (useBewegingsstand geeft dan "rustig" of "systeem").
 */

import { useEffect } from "react";
import type Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useBewegingsstand } from "@/components/zappie/reis/beweging";
import { useLichteWeergave } from "@/lib/lichte-weergave";

let actief: Lenis | null = null;

/** Het vloeiende scrollen dat nu aanstaat (of null), bijvoorbeeld voor "Terug naar de sterren". */
export function haalZachtScrollen(): Lenis | null {
  return actief;
}

export function ZachtScrollen() {
  const stand = useBewegingsstand();
  const licht = useLichteWeergave();

  useEffect(() => {
    if (stand !== "aan" || licht !== false) return;
    let weg = false;
    let lenis: Lenis | null = null;
    void import("lenis").then(({ default: L }) => {
      if (weg) return;
      lenis = new L({ autoRaf: true, anchors: true, allowNestedScroll: true, lerp: 0.1, smoothWheel: true });
      actief = lenis;
    });
    return () => {
      weg = true;
      if (actief === lenis) actief = null;
      lenis?.destroy();
    };
  }, [stand, licht]);

  return null;
}
