"use client";

/**
 * De brug naar een Godot-bouwsteen (oktober 2026).
 *
 * Elke bouwsteen staat als losse webexport in `public/godot/<naam>/` en draait
 * in een iframe. Thuisles en Godot praten met postMessage, met een stukje
 * JSON-tekst per bericht:
 *
 *   Thuisles → Godot   { type: "opgave", ... }   welke som er nu is
 *                      { type: "fase", fase }    "goed" of "fout" na Controleer;
 *                                                bij "fout" laat het speelveld
 *                                                de goede manier zien
 *   Godot → Thuisles   { type: "geladen" }       klaar om te beginnen
 *                      { type: "bouw", ... }     wat het kind nu gebouwd heeft
 *                      { type: "gebouwd", ... }  de bouw is af (of niet meer)
 *                      { type: "zeg", sleutels } het maatje mag iets zeggen
 *
 * Thuisles is de baas: Godot kijkt niets na. Elk bericht staat in de console,
 * met "[brug]" ervoor, zodat je kunt zien wat er heen en weer gaat.
 */

import { useCallback, useEffect, useRef, useState } from "react";

export type GodotBericht = { type: string; bron?: string; [sleutel: string]: unknown };

export function useGodot(naam: string, opBericht: (b: GodotBericht) => void) {
  const frame = useRef<HTMLIFrameElement | null>(null);
  const [geladen, setGeladen] = useState(false);
  const [laadtijd, setLaadtijd] = useState<number | null>(null);
  const start = useRef(0);
  const opBerichtRef = useRef(opBericht);
  useEffect(() => {
    opBerichtRef.current = opBericht;
  }, [opBericht]);

  useEffect(() => {
    start.current = performance.now();
    function luister(e: MessageEvent) {
      if (e.origin !== window.location.origin || e.source !== frame.current?.contentWindow) return;
      if (typeof e.data !== "string") return;
      let b: GodotBericht;
      try {
        b = JSON.parse(e.data);
      } catch {
        return;
      }
      if (b?.bron !== "godot") return;
      console.log(`[brug] van Godot (${naam}):`, b);
      if (b.type === "geladen") {
        const ms = Math.round(performance.now() - start.current);
        console.log(`[brug] ${naam} geladen na ${ms} ms`);
        setLaadtijd(ms);
        setGeladen(true);
      }
      opBerichtRef.current(b);
    }
    window.addEventListener("message", luister);
    return () => window.removeEventListener("message", luister);
  }, [naam]);

  /*
    Het adres van het iframe wordt pas in de browser gezet (zelfde tekening op
    server en browser). ?stijl=thuisles achter het adres van de oefening gaat
    mee naar Godot: dan de lichte stijl in plaats van de standaard (donker).
  */
  useEffect(() => {
    if (!frame.current || frame.current.src) return;
    const stijl = new URLSearchParams(window.location.search).get("stijl");
    const bron = `/godot/${naam}/index.html`;
    frame.current.src = stijl ? `${bron}?stijl=${encodeURIComponent(stijl)}` : bron;
  }, [naam]);

  const stuur = useCallback(
    (bericht: GodotBericht) => {
      const metBron = { ...bericht, bron: "thuisles" };
      console.log(`[brug] naar Godot (${naam}):`, metBron);
      frame.current?.contentWindow?.postMessage(JSON.stringify(metBron), window.location.origin);
    },
    [naam],
  );

  return { frame, geladen, laadtijd, stuur };
}
