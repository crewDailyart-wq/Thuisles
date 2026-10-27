"use client";

/**
 * Proefje met Phaser (27 oktober 2026): een donkere achtergrond met drie
 * gloeiende parels die je met de muis of je vinger kunt slepen. De glow is
 * het ingebouwde Glow-filter van Phaser 4 (filters.external.addGlow).
 *
 * Phaser wordt pas geladen als de pagina er staat (import() in een effect),
 * zodat de pagina zelf meteen verschijnt; het spel komt er daarna in.
 * `window.__phaser` geeft de meetwaarden voor de laadtest.
 */

import { useEffect, useRef, useState } from "react";

const PARELS = [
  { kleur: 0x7fe9ff, x: 0.3, y: 0.45 },
  { kleur: 0xffd36e, x: 0.5, y: 0.6 },
  { kleur: 0xff8ad8, x: 0.7, y: 0.45 },
];

declare global {
  interface Window {
    __phaser?: { geladenMs?: number; eersteBeeldMs?: number; versie?: string; parels?: () => { x: number; y: number }[] };
  }
}

export function ParelsProef() {
  const plek = useRef<HTMLDivElement>(null);
  const [stand, zetStand] = useState("Phaser laden…");

  useEffect(() => {
    let spel: import("phaser").Game | null = null;
    let weg = false;
    const t0 = performance.now();
    void import("phaser").then((P) => {
      const Phaser = P.default ?? P;
      if (weg || !plek.current) return;
      window.__phaser = { geladenMs: Math.round(performance.now() - t0), versie: Phaser.VERSION };
      const host = plek.current;

      class Parels extends Phaser.Scene {
        parels: import("phaser").GameObjects.Image[] = [];
        create() {
          const { width: b, height: h } = this.scale;
          /* Eén parel-plaatje: een witte bol met een zacht lichtje, ingekleurd per parel. */
          const r = 34;
          const g = this.make.graphics({}, false);
          /* Van een grijze rand naar een wit midden (iets naar linksboven): zo lijkt hij rond, als een parel. */
          for (let i = r; i > 0; i--) {
            const t = i / r;
            const grijs = Math.round(165 + 90 * (1 - t * t));
            g.fillStyle((grijs << 16) | (grijs << 8) | grijs, 1);
            g.fillCircle(r - (1 - t) * r * 0.25, r - (1 - t) * r * 0.25, i);
          }
          g.fillStyle(0xffffff, 0.95);
          g.fillCircle(r * 0.66, r * 0.62, r * 0.16);
          g.generateTexture("parel", r * 2, r * 2);
          g.destroy();

          for (const p of PARELS) {
            const parel = this.add.image(b * p.x, h * p.y, "parel").setTint(p.kleur).setInteractive({ draggable: true, useHandCursor: true });
            parel.enableFilters();
            const gloed = parel.filters!.external.addGlow(p.kleur, 2.5, 0, 2.5, false, 12, 18);
            gloed.setPaddingOverride(null);
            this.parels.push(parel);
          }
          this.input.on("drag", (_w: unknown, obj: import("phaser").GameObjects.Image, x: number, y: number) => obj.setPosition(x, y));
          this.input.on("dragstart", (_w: unknown, obj: import("phaser").GameObjects.Image) => obj.setScale(1.12));
          this.input.on("dragend", (_w: unknown, obj: import("phaser").GameObjects.Image) => obj.setScale(1));
          this.game.events.once("postrender", () => {
            window.__phaser = { ...window.__phaser, eersteBeeldMs: Math.round(performance.now() - t0), parels: () => this.parels.map((q) => ({ x: Math.round(q.x), y: Math.round(q.y) })) };
            zetStand(`Phaser ${Phaser.VERSION}: sleep de parels`);
          });
        }
      }

      spel = new Phaser.Game({
        type: Phaser.WEBGL,
        parent: host,
        backgroundColor: "#0b1026",
        scale: { mode: Phaser.Scale.RESIZE, width: host.clientWidth, height: host.clientHeight },
        input: { activePointers: 2 },
        scene: Parels,
        banner: false,
      });
    });
    return () => {
      weg = true;
      spel?.destroy(true);
    };
  }, []);

  return (
    <main style={{ minHeight: "100dvh", background: "#0b1026", color: "#cfd8ff", display: "flex", flexDirection: "column" }}>
      <p style={{ margin: 0, padding: "12px 16px", fontSize: 14 }} data-phaser-stand="">
        {stand}
      </p>
      <div ref={plek} style={{ flex: 1, minHeight: 360, touchAction: "none" }} />
    </main>
  );
}
