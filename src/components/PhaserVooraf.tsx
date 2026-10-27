"use client";

import { useEffect } from "react";
import { laadPhaserVooraf } from "@/lib/phaser/laden";

/**
 * Laadt Phaser alvast als de browser niets te doen heeft (27 oktober 2026,
 * opdracht eigenaar): onzichtbaar, de startpagina verandert niet. Zo opent de
 * eerste les daarna ook op een trage telefoon meteen.
 */
export function PhaserVooraf() {
  useEffect(() => {
    laadPhaserVooraf();
  }, []);
  return null;
}
