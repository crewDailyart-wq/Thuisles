"use client";

/**
 * Getallen tot 20 schrijven, als hologram (27 oktober 2026, LESSENPLAN.md G4b;
 * Synthesis "Color Count · Writing Numbers to 20", INSPIRATIE.md R3).
 *
 * Links één of twee staande schelpen met 10 parelplekken (de tienstrook; bij
 * 10–20 is de eerste vol). Rechts één of twee zwevende schrijfborden met
 * schrijflijnen (bovenlijn, gestippelde middellijn, onderlijn). Onderaan de
 * cijferkaarten 0–9 als kleine schelpjes.
 *
 * - `modus: "kies"`: het kind tikt een cijferkaart, of typt het cijfer in
 *   het oplichtende vak op het bord (een echt invoerveld, HARDE REGEL 5).
 *   Meldt `{ soort: "cijfer", n }`.
 * - `modus: "schrijf"`: het kind trekt het cijfer over met vinger of muis,
 *   in Phaser. Het begint bij de groene lichtstip; een pijltje wijst de
 *   richting. Met `spoor` staat er een stippelspoor; zonder alleen de stip en
 *   het pijltje (minder hulp). Het lichtspoor volgt alleen de vorm: naast de
 *   vorm tekent hij niet verder. Een tik op de groene stip (zonder te slepen)
 *   laat het cijfer zichzelf schrijven. Meldt `{ soort: "geschreven",
 *   zelf: boolean }` (zelf = de stip schreef het).
 *
 * `schrijfZelf` (teller): het cijfer schrijft zichzelf (Bliepo doet het voor).
 * `opgave` (teller): een nieuwe opgave; de borden worden leeg.
 */

import { useEffect, useRef, useState } from "react";
import type { Vlakbasis } from "../soort";
import { holoBasis, TX, GOED, WARM, WERELDKLEUR } from "../holo/basis";
import { HOLO_CANVAS, useHoloMotor } from "../holo/motor";
import { useInBeeld } from "@/components/oefenen/toetsenbordruimte";
import { hexNaarGetal, maakParels, tekenSchelp } from "./tellen-holo-tekenen";
import { parelKleur } from "./tellen-holo-schelpen";
import s from "./tellen-holo.module.css";

export type TelSchrijvenProps = {
  /** Hoeveel parels er liggen (0–20). */
  aantal: number;
  /** Wat er in de vakken op de borden staat (één vak, of twee bij 10–20). */
  vakken: string[];
  modus?: "kies" | "schrijf" | null;
  /** Welk vak nu aan de beurt is. */
  actiefVak?: number;
  /** Welk cijfer het kind in het actieve vak schrijft. */
  schrijfCijfer?: number | null;
  /** Het stippelspoor zichtbaar (meer hulp). */
  spoor?: boolean;
  kaartenUit?: number[];
  /** De gekozen kaart groot op het bord, met een rode rand (1× fout). */
  groteKaart?: number | null;
  /** Bliepo telt voor: de nummers 1 … `nummers` in de losse parels. */
  nummers?: number;
  /** Een warme rand om deze schelp. */
  gloei?: 1 | 2 | null;
  golf?: number;
  schrijfZelf?: number;
  opgave?: number;
};

/* ---------- maten ---------- */

const SB = 170;
const SH = 404;
const S_TOP = 40;
const PITCH = 70;
const BORD = { top: 40, h: 404, lijnBoven: 112, lijnOnder: 372 };
const CIJFER_H = BORD.lijnOnder - BORD.lijnBoven;
const CIJFER_B = CIJFER_H * 0.6;

const twee = (aantal: number) => aantal >= 10;
const schelpX = (nr: 1 | 2, aantal: number) => (twee(aantal) ? (nr === 1 ? 108 : 298) : 190);
function bordPlek(vak: number, aantal: number) {
  return twee(aantal) ? { x: vak === 0 ? 545 : 790, b: 230 } : { x: 650, b: 300 };
}
function parelPlek(i: number) {
  const rij = Math.floor(i / 2);
  return { dx: i % 2 ? 38 : -38, y: S_TOP + 72 + (4 - rij) * PITCH };
}
const kaartPlek = (n: number) => ({ x: 490 + ((n % 5) - 2) * 128, y: n < 5 ? 470 : 590 });
const KAART = { b: 108, h: 104 };

/* ---------- de vormen van de cijfers (zoals op school), in eenheden van het cijfervak ---------- */

type Punt = [number, number];
function boog(cx: number, cy: number, rx: number, ry: number, a0: number, a1: number): Punt[] {
  const n = Math.max(8, Math.round(Math.abs(a1 - a0) * 14));
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / n;
    return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)] as Punt;
  });
}
const PI = Math.PI;
const VORMEN: Record<number, Punt[][]> = {
  0: [boog(0.5, 0.5, 0.48, 0.5, -PI / 2, -PI / 2 - 2 * PI)],
  1: [[[0.12, 0.28], [0.6, 0], [0.6, 1]]],
  2: [[...boog(0.5, 0.27, 0.42, 0.27, PI * 1.08, PI * 2.25), [0.04, 1], [0.96, 1]]],
  3: [[...boog(0.46, 0.25, 0.4, 0.25, PI * 1.1, PI * 2.5), ...boog(0.46, 0.74, 0.46, 0.26, -PI / 2, PI * 0.85)]],
  4: [
    [[0.58, 0], [0.04, 0.68], [0.96, 0.68]],
    [[0.72, 0.32], [0.72, 1]],
  ],
  5: [
    [[0.24, 0], [0.16, 0.45], ...boog(0.5, 0.7, 0.44, 0.3, -PI * 0.78, PI * 0.82)],
    [[0.24, 0], [0.9, 0]],
  ],
  6: [[...boog(0.9, 0.64, 0.82, 0.62, -PI * 0.56, -PI), ...boog(0.5, 0.71, 0.42, 0.29, PI, -PI * 0.98)]],
  7: [[[0.04, 0], [0.96, 0], [0.36, 1]]],
  8: [[...boog(0.5, 0.24, 0.34, 0.24, -PI / 2, -1.5 * PI), ...boog(0.5, 0.73, 0.42, 0.27, -PI / 2, 1.5 * PI), ...boog(0.5, 0.24, 0.34, 0.24, PI / 2, -PI / 2)]],
  9: [[...boog(0.48, 0.27, 0.42, 0.27, 0, -2 * PI), [0.86, 1]]],
};

/** De vorm van een cijfer in punten van het vlak, fijn verdeeld (om de 4 punten). */
function lijnen(cijfer: number, cx: number): Punt[][] {
  const x0 = cx - CIJFER_B / 2;
  return (VORMEN[cijfer] ?? []).map((streek) => {
    const pts = streek.map(([x, y]) => [x0 + x * CIJFER_B, BORD.lijnBoven + y * CIJFER_H] as Punt);
    const fijn: Punt[] = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      const [ax, ay] = pts[i - 1];
      const [bx, by] = pts[i];
      const d = Math.hypot(bx - ax, by - ay);
      const n = Math.max(1, Math.round(d / 4));
      for (let k = 1; k <= n; k++) fijn.push([ax + ((bx - ax) * k) / n, ay + ((by - ay) * k) / n]);
    }
    return fijn;
  });
}

/* ---------- de scène ---------- */

interface SchrijfScene {
  zetSchelpen(aantal: number): void;
  gloeiOm(nr: 1 | 2 | null, aantal: number): void;
  zetBorden(aantal: number): void;
  schrijf(cijfer: number | null, vak: number, aantal: number, spoor: boolean, klaar: (zelf: boolean) => void): void;
  zelf(): void;
  leeg(): void;
  golfNu(aantal: number): void;
}

function maakSchrijfScene(Phaser: typeof import("phaser"), rustig: boolean) {
  const Basis = holoBasis(Phaser, rustig);
  class Schrijven extends Basis implements SchrijfScene {
    schelpen: import("phaser").GameObjects.Container[] = [];
    parels: import("phaser").GameObjects.Image[][] = [];
    standSchelpen = -1;
    borden: import("phaser").GameObjects.Image[] = [];
    standBorden = -1;
    ring: import("phaser").GameObjects.Image | null = null;
    /* het schrijven */
    vorm: Punt[][] = [];
    streek = 0;
    voort = 0;
    actief = false;
    beweegAfstand = 0;
    klaarMeld: ((zelf: boolean) => void) | null = null;
    spoorG: import("phaser").GameObjects.Graphics | null = null;
    lichtG: import("phaser").GameObjects.Graphics | null = null;
    oud: import("phaser").GameObjects.Graphics | null = null;
    stip: import("phaser").GameObjects.Image | null = null;
    pijltje: import("phaser").GameObjects.Image | null = null;
    zelfBezig = false;

    constructor() {
      super("tel-schrijven");
    }

    maak() {
      maakParels(this);
      this.canvasPlaatje("tel-strook", SB, SH, (c) => tekenSchelp(c, SB, SH));
      this.bak("tel-strook", "tel-strook-g", WERELDKLEUR.oceaan);
      this.canvasPlaatje("tel-strook-warm", SB + 20, SH + 20, (c) => {
        c.strokeStyle = "rgba(255,211,110,0.95)";
        c.lineWidth = 5;
        c.beginPath();
        c.roundRect(6, 6, SB + 8, SH + 8, 34);
        c.stroke();
      });
      this.bak("tel-strook-warm", "tel-strook-warm-g", WARM);
      for (const b of [230, 300]) {
        this.canvasPlaatje(`tel-bord-${b}`, b, BORD.h, (c) => {
          c.beginPath();
          c.roundRect(3, 3, b - 6, BORD.h - 6, 24);
          c.fillStyle = "rgba(10,40,95,0.5)";
          c.fill();
          c.strokeStyle = "#7fe9ff";
          c.lineWidth = 3;
          c.stroke();
          const lijn = (y: number, streep: boolean) => {
            c.setLineDash(streep ? [10, 9] : []);
            c.beginPath();
            c.moveTo(18, y);
            c.lineTo(b - 18, y);
            c.stroke();
          };
          c.strokeStyle = "rgba(190,240,255,0.55)";
          c.lineWidth = 2.5;
          lijn(BORD.lijnBoven - BORD.top, false);
          lijn((BORD.lijnBoven + BORD.lijnOnder) / 2 - BORD.top, true);
          lijn(BORD.lijnOnder - BORD.top, false);
          c.setLineDash([]);
        });
        this.bak(`tel-bord-${b}`, `tel-bord-${b}-g`, WERELDKLEUR.oceaan);
      }
      /* De cijferkaart: een klein schelpje. */
      this.canvasPlaatje("tel-kaart", KAART.b, KAART.h, (c) => {
        const pad = () => {
          c.beginPath();
          const w = (KAART.b - 8) / 4;
          c.moveTo(4, 18);
          for (let i = 0; i < 4; i++) c.quadraticCurveTo(4 + w * i + w / 2, 4, 4 + w * (i + 1), 18);
          c.lineTo(KAART.b - 4, KAART.h - 22);
          c.quadraticCurveTo(KAART.b - 4, KAART.h - 4, KAART.b - 22, KAART.h - 4);
          c.lineTo(22, KAART.h - 4);
          c.quadraticCurveTo(4, KAART.h - 4, 4, KAART.h - 22);
          c.closePath();
        };
        pad();
        c.fillStyle = "rgba(10,40,95,0.55)";
        c.fill();
        c.strokeStyle = "#bff4ff";
        c.lineWidth = 2.5;
        c.stroke();
      });
      this.bak("tel-kaart", "tel-kaart-g", WERELDKLEUR.oceaan);
      const kaarten = this.add.container(0, 0);
      for (let n = 0; n < 10; n++) {
        const p = kaartPlek(n);
        kaarten.add(this.plaats("tel-kaart-g", p.x, p.y + KAART.h / 2));
      }
      /* De groene startstip en het pijltje. */
      this.canvasPlaatje("tel-stip", 44, 44, (c) => {
        const g = c.createRadialGradient(18, 16, 2, 22, 22, 20);
        g.addColorStop(0, "#ffffff");
        g.addColorStop(0.45, "#9dffbf");
        g.addColorStop(1, "#2fcf72");
        c.fillStyle = g;
        c.beginPath();
        c.arc(22, 22, 19, 0, Math.PI * 2);
        c.fill();
      });
      this.bak("tel-stip", "tel-stip-g", 0x5fe08a);
      this.canvasPlaatje("tel-pijltje", 30, 30, (c) => {
        c.fillStyle = "#9dffbf";
        c.beginPath();
        c.moveTo(28, 15);
        c.lineTo(4, 3);
        c.lineTo(10, 15);
        c.lineTo(4, 27);
        c.closePath();
        c.fill();
      });

      this.spoorG = this.add.graphics();
      this.oud = this.add.graphics();
      this.lichtG = this.add.graphics();

      /*
        Waar de vinger of muis is, in punten van het vlak: rechtstreeks uit de
        gebeurtenis en de plek van het canvas op het scherm (Phaser onthoudt
        de maat van het canvas van vóór het lesscherm het vlak schaalde).
      */
      const punt = (p: import("phaser").Input.Pointer) => {
        const e = p.event as MouseEvent | TouchEvent | undefined;
        let cx: number | undefined;
        let cy: number | undefined;
        if (e && "changedTouches" in e && e.changedTouches.length > 0) {
          const t = [...e.changedTouches].find((x) => x.identifier === p.identifier) ?? e.changedTouches[0];
          cx = t.clientX;
          cy = t.clientY;
        } else if (e && "clientX" in e) {
          cx = e.clientX;
          cy = e.clientY;
        }
        if (cx === undefined || cy === undefined) return { x: p.worldX, y: p.worldY };
        const r = this.game.canvas.getBoundingClientRect();
        return { x: ((cx - r.left) * 980) / r.width, y: ((cy - r.top) * 720) / r.height };
      };
      this.input.on("pointerdown", (p: import("phaser").Input.Pointer) => {
        const q = punt(p);
        this.neer(q.x, q.y);
      });
      this.input.on("pointermove", (p: import("phaser").Input.Pointer) => {
        if (!p.isDown) return;
        const q = punt(p);
        this.beweeg(q.x, q.y);
      });
      this.input.on("pointerup", () => this.op());
      this.input.on("pointerupoutside", () => this.op());
    }

    /* ---------- schelpen en borden ---------- */

    zetSchelpen(aantal: number) {
      const nodig = twee(aantal) ? 2 : 1;
      if (this.standSchelpen !== nodig) {
        this.schelpen.forEach((g) => g.destroy());
        this.schelpen = [];
        this.parels = [];
        for (let nr = 1; nr <= nodig; nr++) {
          const x = schelpX(nr as 1 | 2, aantal);
          const g = this.add.container(x, S_TOP + SH / 2);
          g.add(this.plaats("tel-strook-g", 0, 0));
          const rij: import("phaser").GameObjects.Image[] = [];
          for (let i = 0; i < 10; i++) {
            const p = parelPlek(i);
            g.add(this.plaats("tel-plek", p.dx, p.y - (S_TOP + SH / 2)).setScale(0.92 / TX));
            const parel = this.plaats("tel-parel-g", p.dx, p.y - (S_TOP + SH / 2)).setScale(0.92 / TX).setVisible(false);
            g.add(parel);
            rij.push(parel);
          }
          this.schelpen.push(g);
          this.parels.push(rij);
          this.tover(g, { vertraging: (nr - 1) * 100 });
        }
        this.standSchelpen = nodig;
      }
      const los = twee(aantal) ? aantal - 10 : aantal;
      const kleur = hexNaarGetal(parelKleur(aantal >= 10 ? (aantal - 10 || 10) : aantal || 10));
      const m = (x: number) => Math.round(x + (255 - x) * 0.4);
      const tint = (m((kleur >> 16) & 255) << 16) | (m((kleur >> 8) & 255) << 8) | m(kleur & 255);
      this.parels.forEach((rij, j) => {
        const n = twee(aantal) ? (j === 0 ? 10 : los) : los;
        rij.forEach((p, i) => {
          const zicht = i < n;
          if (zicht && !p.visible && !this.rustig) {
            p.setScale(0.5 / TX).setAlpha(0);
            this.tweens.add({ targets: p, scale: 0.92 / TX, alpha: 1, duration: 220, delay: i * 40, ease: "Back.easeOut" });
          }
          p.setVisible(zicht).setTint(j === 0 && twee(aantal) ? 0xfbe0ea : tint);
        });
      });
    }

    gloeiOm(nr: 1 | 2 | null, aantal: number) {
      this.ring?.destroy();
      this.ring = null;
      if (!nr || nr > this.schelpen.length) return;
      this.ring = this.plaats("tel-strook-warm-g", schelpX(nr, aantal), S_TOP + SH / 2);
      if (!this.rustig) this.tweens.add({ targets: this.ring, alpha: 0.45, duration: 700, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    }

    zetBorden(aantal: number) {
      const nodig = twee(aantal) ? 2 : 1;
      if (this.standBorden === nodig) return;
      this.borden.forEach((b) => b.destroy());
      this.borden = Array.from({ length: nodig }, (_, v) => {
        const p = bordPlek(v, aantal);
        const b = this.plaats(`tel-bord-${p.b}-g`, p.x, BORD.top + BORD.h / 2);
        b.setDepth(-1);
        this.tover(b, { vertraging: 120 + v * 100 });
        return b;
      });
      this.standBorden = nodig;
    }

    golfNu(aantal: number) {
      const p = bordPlek(twee(aantal) ? 1 : 0, aantal);
      this.golf(twee(aantal) ? 667 : p.x, BORD.top + BORD.h / 2, GOED);
    }

    /* ---------- het schrijven ---------- */

    leeg() {
      this.oud?.clear();
      this.lichtG?.clear();
      this.spoorG?.clear();
      this.stip?.destroy();
      this.pijltje?.destroy();
      this.stip = null;
      this.pijltje = null;
      this.vorm = [];
      this.klaarMeld = null;
      this.zelfBezig = false;
    }

    schrijf(cijfer: number | null, vak: number, aantal: number, spoor: boolean, klaar: (zelf: boolean) => void) {
      this.lichtG?.clear();
      this.spoorG?.clear();
      this.stip?.destroy();
      this.pijltje?.destroy();
      this.stip = null;
      this.pijltje = null;
      this.zelfBezig = false;
      if (cijfer === null) {
        this.vorm = [];
        this.klaarMeld = null;
        return;
      }
      this.vorm = lijnen(cijfer, bordPlek(vak, aantal).x);
      this.streek = 0;
      this.voort = 0;
      this.klaarMeld = klaar;
      if (spoor) {
        const g = this.spoorG!;
        g.fillStyle(0xdff8ff, 0.6);
        for (const streek of this.vorm) for (let i = 0; i < streek.length; i += 4) g.fillCircle(streek[i][0], streek[i][1], 4);
      }
      this.zetStip();
      this.teken();
    }

    zetStip() {
      this.stip?.destroy();
      this.pijltje?.destroy();
      this.stip = null;
      this.pijltje = null;
      const streek = this.vorm[this.streek];
      if (!streek || this.voort > 0) return;
      const [x, y] = streek[0];
      const [x2, y2] = streek[Math.min(streek.length - 1, 9)];
      const hoek = Math.atan2(y2 - y, x2 - x);
      this.stip = this.plaats("tel-stip-g", x, y).setDepth(3);
      this.pijltje = this.plaats("tel-pijltje", x + Math.cos(hoek) * 40, y + Math.sin(hoek) * 40).setRotation(hoek).setDepth(3);
      if (!this.rustig) this.tweens.add({ targets: this.stip, scale: 1.25 / TX, duration: 600, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    }

    teken() {
      const g = this.lichtG!;
      g.clear();
      const delen = this.vorm.map((streek, j) => (j < this.streek ? streek : j === this.streek ? streek.slice(0, this.voort + 1) : []));
      for (const [breed, kleur, a] of [
        [18, 0x7fe9ff, 0.22],
        [9, 0xffffff, 0.95],
      ] as const) {
        g.lineStyle(breed, kleur, a);
        for (const d of delen) {
          if (d.length < 2) continue;
          g.beginPath();
          g.moveTo(d[0][0], d[0][1]);
          for (let i = 1; i < d.length; i++) g.lineTo(d[i][0], d[i][1]);
          g.strokePath();
        }
      }
    }

    neer(x: number, y: number) {
      const streek = this.vorm[this.streek];
      if (!streek || this.zelfBezig) return;
      const [px, py] = streek[this.voort];
      if (Math.hypot(x - px, y - py) > 56) return;
      this.actief = true;
      this.beweegAfstand = 0;
    }

    beweeg(x: number, y: number) {
      if (!this.actief) return;
      const streek = this.vorm[this.streek];
      if (!streek) return;
      this.beweegAfstand += 1;
      /* Alleen een stukje vooruit langs de vorm; naast de vorm gebeurt niets. */
      let beste = -1;
      let besteD = 48;
      for (let i = this.voort; i < Math.min(streek.length, this.voort + 30); i++) {
        const d = Math.hypot(x - streek[i][0], y - streek[i][1]);
        if (d < besteD) {
          besteD = d;
          beste = i;
        }
      }
      if (beste > this.voort) {
        this.voort = beste;
        if (this.stip) this.zetStip();
        this.teken();
        if (this.voort >= streek.length - 3) this.volgendeStreek(false);
      }
    }

    op() {
      if (!this.actief) return;
      this.actief = false;
      /* Een tik op de groene stip zonder te slepen: het cijfer schrijft zichzelf. */
      if (this.beweegAfstand < 3 && this.voort < 4) this.zelf();
    }

    volgendeStreek(zelf: boolean) {
      this.voort = this.vorm[this.streek].length - 1;
      this.streek++;
      this.voort = 0;
      this.actief = false;
      this.teken();
      if (this.streek >= this.vorm.length) {
        this.stip?.destroy();
        this.pijltje?.destroy();
        this.stip = null;
        this.pijltje = null;
        /* Wat geschreven is, blijft staan. */
        const g = this.oud!;
        for (const [breed, kleur, a] of [
          [18, 0x7fe9ff, 0.22],
          [9, 0xffffff, 0.95],
        ] as const) {
          g.lineStyle(breed, kleur, a);
          for (const d of this.vorm) {
            g.beginPath();
            g.moveTo(d[0][0], d[0][1]);
            for (let i = 1; i < d.length; i++) g.lineTo(d[i][0], d[i][1]);
            g.strokePath();
          }
        }
        this.lichtG?.clear();
        this.spoorG?.clear();
        this.vorm = [];
        const m = this.klaarMeld;
        this.klaarMeld = null;
        this.zelfBezig = false;
        m?.(zelf);
        return;
      }
      this.zetStip();
    }

    zelf() {
      if (!this.vorm.length || this.zelfBezig) return;
      this.zelfBezig = true;
      this.stip?.destroy();
      this.pijltje?.destroy();
      this.stip = null;
      this.pijltje = null;
      const stap = () => {
        const streek = this.vorm[this.streek];
        if (!streek) return;
        this.voort = Math.min(streek.length - 1, this.voort + (this.rustig ? streek.length : 3));
        this.teken();
        if (this.voort >= streek.length - 1) {
          this.volgendeStreek(true);
          if (this.vorm.length) {
            this.stip?.destroy();
            this.pijltje?.destroy();
            this.stip = null;
            this.pijltje = null;
            this.time.delayedCall(200, stap);
          }
          return;
        }
        this.time.delayedCall(16, stap);
      };
      stap();
    }

    demo(ms: number) {
      const eind = performance.now() + ms;
      let n = 0;
      const stap = () => {
        if (performance.now() > eind) return;
        n++;
        this.zetSchelpen(n % 2 ? 3 + (n % 7) : 13);
        this.zetBorden(n % 2 ? 3 : 13);
        this.oud?.clear();
        this.schrijf(n % 10, 0, n % 2 ? 3 : 13, true, () => {});
        this.zelf();
        this.time.delayedCall(1300, stap);
      };
      stap();
    }
  }
  return Schrijven as unknown as new () => import("phaser").Scene;
}

/* ---------- het vlak ---------- */

export function TelSchrijven({
  aantal,
  vakken,
  modus = null,
  actiefVak = 0,
  schrijfCijfer = null,
  spoor = true,
  kaartenUit = [],
  groteKaart = null,
  nummers = 0,
  gloei = null,
  golf = 0,
  schrijfZelf = 0,
  opgave = 0,
  meld,
  schaal,
}: TelSchrijvenProps & Vlakbasis) {
  const { plek, scene } = useHoloMotor<SchrijfScene>(schaal, maakSchrijfScene, { invoer: true });
  const [typ, setTyp] = useState("");
  const { bijAandacht, bijWeggaan } = useInBeeld();
  const meldRef = useRef(meld);
  useEffect(() => {
    meldRef.current = meld;
  }, [meld]);

  useEffect(() => {
    if (!scene) return;
    scene.zetSchelpen(aantal);
    scene.zetBorden(aantal);
  }, [scene, aantal]);
  useEffect(() => {
    scene?.gloeiOm(gloei, aantal);
  }, [scene, gloei, aantal]);
  useEffect(() => {
    scene?.leeg();
  }, [scene, opgave]);
  useEffect(() => {
    if (!scene) return;
    if (modus === "schrijf" && schrijfCijfer !== null) scene.schrijf(schrijfCijfer, actiefVak, aantal, spoor, (zelf) => meldRef.current({ soort: "geschreven", zelf }));
    else scene.schrijf(null, 0, aantal, false, () => {});
  }, [scene, modus, schrijfCijfer, actiefVak, aantal, spoor]);
  useEffect(() => {
    if (scene && schrijfZelf > 0) scene.zelf();
  }, [scene, schrijfZelf]);
  useEffect(() => {
    if (scene && golf > 0) scene.golfNu(aantal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, golf]);

  /* Voor de automatische test: waar de vorm begint en hoe hij loopt (punten van het vlak). */
  useEffect(() => {
    window.__phaser = {
      ...window.__phaser,
      schrijfVorm: modus === "schrijf" && schrijfCijfer !== null ? lijnen(schrijfCijfer, bordPlek(actiefVak, aantal).x) : null,
    };
  }, [modus, schrijfCijfer, actiefVak, aantal]);

  const kies = modus === "kies";
  const los = twee(aantal) ? aantal - 10 : aantal;
  const nummerStrook = twee(aantal) ? 2 : 1;

  return (
    <div className={s.vlak}>
      <div ref={plek} style={HOLO_CANVAS} aria-hidden />

      {nummers > 0 &&
        Array.from({ length: Math.min(nummers, los) }, (_, i) => {
          const p = parelPlek(i);
          const x = schelpX(nummerStrook as 1 | 2, aantal) + p.dx;
          return (
            <span key={i} className={s.nummer} style={{ left: x - 34, top: p.y - 34, width: 68, height: 68, fontSize: 34, color: "#13204a", textShadow: "none" }}>
              {i + 1}
            </span>
          );
        })}

      {/* De vakken op de borden: wat er al staat, of het invulvak dat oplicht. */}
      {vakken.map((v, i) => {
        const b = bordPlek(i, aantal);
        const hier = kies && i === actiefVak;
        if (hier)
          return (
            <input
              key={`vak-${i}-${opgave}`}
              className={s.invoer}
              style={{ left: b.x - 75, top: BORD.lijnBoven - 20, width: 150, height: CIJFER_H + 40 }}
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="off"
              maxLength={1}
              aria-label="Typ het cijfer"
              data-knop="vak"
              value={typ}
              onChange={(e) => {
                const c = e.target.value.replace(/\D/g, "").slice(-1);
                setTyp(c);
                if (c !== "") {
                  meld({ soort: "cijfer", n: Number(c) });
                  setTimeout(() => setTyp(""), 300);
                }
              }}
              onFocus={(e) => bijAandacht(e.currentTarget)}
              onBlur={bijWeggaan}
            />
          );
        if (modus === "schrijf" && i === actiefVak) return null;
        return v ? (
          <div key={`vak-${i}`} className={s.getal} style={{ left: b.x, top: BORD.lijnBoven + 20, fontSize: 200 }} aria-hidden>
            {v}
          </div>
        ) : null;
      })}

      {groteKaart !== null && (
        <div className={s.groot} style={{ left: bordPlek(actiefVak, aantal).x - 80, top: BORD.lijnBoven, width: 160, height: CIJFER_H }} aria-hidden>
          {groteKaart}
        </div>
      )}

      {Array.from({ length: 10 }, (_, n) => {
        const p = kaartPlek(n);
        const uit = kaartenUit.includes(n);
        return (
          <button
            key={n}
            type="button"
            data-kaart={n}
            className={`${s.kaartcijfer} ${kies && !uit ? s.aan : ""} ${uit ? s.uit : ""}`}
            style={{ left: p.x - KAART.b / 2, top: p.y + 4, width: KAART.b, height: KAART.h - 8, lineHeight: `${KAART.h + 4}px` }}
            disabled={!kies || uit}
            aria-label={`${n}`}
            onClick={() => meld({ soort: "cijfer", n })}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}
