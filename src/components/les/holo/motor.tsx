"use client";

/**
 * Het Phaser-canvas van een les (27 oktober 2026, HARDE REGEL 7). Eén
 * doorzichtig canvas over het speelvlak (980 × 720 punten); de blauwe ruimte
 * van het lesscherm blijft erachter zichtbaar. Phaser zelf is één keer
 * geladen (lib/phaser/laden.ts, op de startpagina al vooraf).
 *
 *   const { plek, scene } = useHoloMotor<MijnScene>(schaal, (Phaser, rustig) => …klasse…);
 *   return <div className="…"><div ref={plek} style={HOLO_CANVAS} />…knoppen…</div>;
 *
 * Zet bij het eerste beeld `window.__phaser.klaarOp` en `beweeg` (voor
 * `npm run vloeiend`).
 */

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { laadPhaser } from "@/lib/phaser/laden";
import { VLAK_B, VLAK_H, type PhaserModule } from "./basis";

/** Stijl voor de plek van het canvas: over het hele vlak, klikken gaan erdoorheen naar de knoppen. */
export const HOLO_CANVAS: CSSProperties = { position: "absolute", inset: 0, pointerEvents: "none" };

type SceneMetDemo = import("phaser").Scene & { klaar: boolean; demo(ms: number): void };

export function useHoloMotor<S>(
  schaal: number,
  maakKlasse: (Phaser: PhaserModule, rustig: boolean) => new () => import("phaser").Scene,
  opties: { invoer?: boolean } = {},
) {
  const plek = useRef<HTMLDivElement>(null);
  const [scene, setScene] = useState<S | null>(null);
  const maak = useRef(maakKlasse);

  useEffect(() => {
    let spel: import("phaser").Game | null = null;
    let weg = false;
    const rustig = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    void laadPhaser().then((Phaser) => {
      if (weg || !plek.current) return;
      /* Scherp tekenen: zoveel echte pixels als het vlak op het scherm groot is (hooguit 2×). */
      const k = Math.max(1, Math.min(2, schaal * (window.devicePixelRatio || 1)));
      const Klasse = maak.current(Phaser, rustig);
      spel = new Phaser.Game({
        type: Phaser.WEBGL,
        parent: plek.current,
        width: Math.round(VLAK_B * k),
        height: Math.round(VLAK_H * k),
        transparent: true,
        banner: false,
        scale: { mode: Phaser.Scale.NONE },
        input: opties.invoer ? { mouse: true, touch: true, keyboard: false } : { mouse: false, touch: false, keyboard: false },
        scene: Klasse,
        callbacks: {
          postBoot: (g) => {
            g.canvas.style.width = `${VLAK_B}px`;
            g.canvas.style.height = `${VLAK_H}px`;
            if (opties.invoer) plek.current?.style.setProperty("pointer-events", "auto");
          },
        },
      });
      spel.events.once("ready", () => {
        const sc = spel!.scene.getScenes(false)[0] as SceneMetDemo;
        const start = () => {
          sc.cameras.main.setZoom(k).centerOn(VLAK_B / 2, VLAK_H / 2);
          setScene(sc as unknown as S);
          spel!.events.once("postrender", () => {
            window.__phaser = { ...window.__phaser, klaarOp: performance.now(), beweeg: (ms: number) => sc.demo(ms) };
          });
        };
        if (sc.klaar) start();
        else sc.events.once("klaar", start);
      });
    });
    return () => {
      weg = true;
      spel?.destroy(true);
      window.__phaser = {};
    };
    /* Eén motor per keer dat het vlak verschijnt; de schaal staat bij het begin vast. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { plek, scene };
}
