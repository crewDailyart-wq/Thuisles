"use client";

/**
 * De lantaarntjeslijn (27 oktober 2026, LESSENPLAN.md A8 en A9; wereld
 * Aarde), als hologram in Bliepo's ruimte. Vervangt in die lessen de
 * getallenlijn met het sterretje (`getallenlijn-sprongen.tsx`, blijft bestaan
 * voor de andere getallenlijnlessen), met dezelfde bediening als Synthesis
 * "Difference Dash":
 *
 * - een rij lantaarntjes, met onder elk een getal; tik op een getal;
 * - aangetikte getallen: het lantaarntje gaat aan, het getal wordt groter en
 *   warm; zodra er twee zijn, worden de andere getallen dof;
 * - een vuurvliegje (de springer) springt van lantaarntje naar lantaarntje;
 *   elke sprong laat een warm lichtboogje achter, eventueel met een "1";
 * - bovenaan een rijtje lampjes dat aangaat bij elk goed antwoord.
 *
 * Zelfde eigenschappen en meldingen als de getallenlijn met het sterretje,
 * zodat het draaiboek hetzelfde blijft: `{ soort: "getal", n }` als het kind
 * op een getal tikt (als `actief`).
 */

import { useEffect } from "react";
import type { Vlakbasis } from "../soort";
import type { Boog, GetallenlijnSprongenProps } from "./getallenlijn-sprongen";
import { holoBasis, WARM } from "../holo/basis";
import { HOLO_CANVAS, useHoloMotor } from "../holo/motor";
import { maakLantaarntje, maakVuurvliegje } from "./aftrekken-holo-teken";
import s from "./aftrekken-holo.module.css";

export type { Boog };

export type LantaarnlijnProps = GetallenlijnSprongenProps & {
  /** Hoeveel lampjes er bovenaan staan (standaard 5). */
  lampjesTotaal?: number;
};

const LINKS = 60;
const RECHTS = 920;

function maten(van: number, tot: number, metSom: boolean) {
  const stap = (RECHTS - LINKS) / Math.max(1, tot - van);
  return { Y: metSom ? 470 : 420, stap, x: (n: number) => LINKS + (n - van) * stap };
}

/* ---------- de scène ---------- */

type Staat = {
  van: number;
  tot: number;
  Y: number;
  gemarkeerd: number[];
  springer: number | null;
  bogen: Boog[];
  lampjes: number | null;
  lampjesTotaal: number;
  lampjesY: number;
};

interface LijnScene {
  teken(st: Staat): void;
}

function boogPunten(x1: number, x2: number, Y: number, tot = 1) {
  const h = Math.min(120, Math.abs(x2 - x1) * 0.62);
  const punten: { x: number; y: number }[] = [];
  const n = 28;
  for (let k = 0; k <= n * tot; k++) {
    const t = k / n;
    const u = 1 - t;
    /* kubische bezier met controlepunten recht boven de uiteinden */
    const y0 = Y - 34;
    const cy = y0 - h * 1.33;
    const x = u * u * u * x1 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x2;
    const y = u * u * u * y0 + 3 * u * u * t * cy + 3 * u * t * t * cy + t * t * t * y0;
    punten.push({ x, y });
  }
  return { punten, top: Y - 34 - h };
}

function maakLijnScene(Phaser: typeof import("phaser"), rustig: boolean) {
  const Basis = holoBasis(Phaser, rustig);
  class Lijn extends Basis implements LijnScene {
    vorige: Staat | null = null;
    lantaarns: import("phaser").GameObjects.Image[] = [];
    lijn: import("phaser").GameObjects.Graphics | null = null;
    bogen: { sleutel: string; g: import("phaser").GameObjects.Graphics }[] = [];
    vlieg: import("phaser").GameObjects.Image | null = null;
    lampjes: import("phaser").GameObjects.Image[] = [];

    constructor() {
      super("lijn");
    }

    maak() {
      maakVuurvliegje(this);
      maakLantaarntje(this);
      this.canvasPlaatje("lampje-uit", 44, 44, (c) => {
        c.strokeStyle = "rgba(255,226,170,0.55)";
        c.lineWidth = 2.5;
        c.fillStyle = "rgba(255,211,110,0.1)";
        c.beginPath();
        c.arc(22, 22, 17, 0, Math.PI * 2);
        c.fill();
        c.stroke();
      });
      this.canvasPlaatje("lampje-aan", 44, 44, (c) => {
        const g = c.createRadialGradient(18, 17, 2, 22, 22, 19);
        g.addColorStop(0, "#ffffff");
        g.addColorStop(0.5, "#ffe9a6");
        g.addColorStop(1, "#ffc24a");
        c.fillStyle = g;
        c.beginPath();
        c.arc(22, 22, 18, 0, Math.PI * 2);
        c.fill();
      });
      this.bak("lampje-aan", "lampje-aan-gloed", WARM);
    }

    tekenLijn(st: Staat) {
      const { x } = maten(st.van, st.tot, st.Y === 470);
      this.lijn?.destroy();
      this.lantaarns.forEach((l) => l.destroy());
      this.lantaarns = [];
      const g = this.add.graphics();
      g.lineStyle(3, 0xffe6b0, 0.5);
      g.lineBetween(LINKS - 20, st.Y, RECHTS + 20, st.Y);
      this.lijn = g;
      for (let n = st.van; n <= st.tot; n++) {
        const aan = st.gemarkeerd.includes(n);
        const l = this.plaats(aan ? "lantaarn-aan-gloed" : "lantaarn-uit", x(n), st.Y - 24);
        if (st.gemarkeerd.length >= 2 && !aan) l.setAlpha(0.5);
        this.lantaarns.push(l);
      }
    }

    tekenBoog(g: import("phaser").GameObjects.Graphics, x1: number, x2: number, Y: number, tot: number) {
      const punten = boogPunten(x1, x2, Y, tot).punten as unknown as import("phaser").Math.Vector2[];
      g.clear();
      if (punten.length < 2) return;
      g.lineStyle(10, 0xffc24a, 0.22);
      g.strokePoints(punten);
      g.lineStyle(4, 0xfff0c0, 0.95);
      g.strokePoints(punten);
    }

    teken(st: Staat) {
      const v = this.vorige;
      const { x } = maten(st.van, st.tot, st.Y === 470);
      /* De lijn en de lantaarntjes: alleen opnieuw als er iets aan veranderd is. */
      if (!v || v.van !== st.van || v.tot !== st.tot || v.Y !== st.Y || v.gemarkeerd.join() !== st.gemarkeerd.join()) {
        this.tekenLijn(st);
        if (v && v.van === st.van && v.tot === st.tot) {
          for (const n of st.gemarkeerd) if (!v.gemarkeerd.includes(n)) this.golf(x(n), st.Y - 24, WARM);
        }
      }
      /* De bogen: nieuwe bogen worden getekend van begin naar eind, oude blijven staan. */
      const sleutels = st.bogen.map((b, i) => `${i}:${b.van}>${b.naar}:${st.van}-${st.tot}:${st.Y}`);
      this.bogen = this.bogen.filter((b) => {
        if (sleutels.includes(b.sleutel)) return true;
        b.g.destroy();
        return false;
      });
      st.bogen.forEach((b, i) => {
        if (this.bogen.some((o) => o.sleutel === sleutels[i])) return;
        const g = this.add.graphics();
        this.bogen.push({ sleutel: sleutels[i], g });
        const x1 = x(b.van);
        const x2 = x(b.naar);
        if (this.rustig) {
          this.tekenBoog(g, x1, x2, st.Y, 1);
          return;
        }
        const voortgang = { t: 0 };
        this.tweens.add({ targets: voortgang, t: 1, duration: 420, ease: "Sine.easeOut", onUpdate: () => this.tekenBoog(g, x1, x2, st.Y, voortgang.t) });
      });
      /* Het vuurvliegje: springt in een boogje naar zijn nieuwe plek. */
      if (st.springer === null) {
        this.vlieg?.destroy();
        this.vlieg = null;
      } else {
        const doelX = x(st.springer);
        const doelY = st.Y - 84;
        if (!this.vlieg || !v || v.van !== st.van || v.tot !== st.tot) {
          this.vlieg?.destroy();
          this.vlieg = this.plaats("vlieg-gloed", doelX, doelY);
          this.tover(this.vlieg);
        } else if (Math.abs(this.vlieg.x - doelX) > 1) {
          const vlieg = this.vlieg;
          const vanX = vlieg.x;
          const h = Math.min(130, Math.abs(doelX - vanX) * 0.6) + 20;
          this.tweens.killTweensOf(vlieg);
          const p = { t: 0 };
          this.tweens.add({
            targets: p,
            t: 1,
            duration: this.rustig ? 1 : 430,
            ease: "Sine.easeInOut",
            onUpdate: () => vlieg.setPosition(vanX + (doelX - vanX) * p.t, doelY - h * 4 * p.t * (1 - p.t)),
            onComplete: () => vlieg.setPosition(doelX, doelY),
          });
        }
      }
      /* De lampjes bovenaan. */
      const telWas = v?.lampjes ?? null;
      if (st.lampjes === null) {
        this.lampjes.forEach((l) => l.destroy());
        this.lampjes = [];
      } else if (telWas === null || this.lampjes.length !== st.lampjesTotaal || st.lampjes !== telWas) {
        this.lampjes.forEach((l) => l.destroy());
        this.lampjes = [];
        const stap = 64;
        const x0 = 490 - ((st.lampjesTotaal - 1) * stap) / 2;
        for (let i = 0; i < st.lampjesTotaal; i++) {
          const aan = i < st.lampjes;
          const l = this.plaats(aan ? "lampje-aan-gloed" : "lampje-uit", x0 + i * stap, st.lampjesY);
          this.lampjes.push(l);
          if (aan && telWas !== null && i >= telWas) this.golf(x0 + i * stap, st.lampjesY, WARM);
        }
      }
      this.vorige = { ...st, gemarkeerd: [...st.gemarkeerd], bogen: [...st.bogen] };
    }

    demo(ms: number) {
      const eind = performance.now() + ms;
      let n = 0;
      const stap = () => {
        if (performance.now() > eind) return;
        const van = n % 6;
        const naar = van + 1 + (n % 3);
        const bogen: Boog[] = [];
        for (let k = van; k < naar; k++) bogen.push({ van: k, naar: k + 1 });
        this.teken({ van: 0, tot: 10, Y: 420, gemarkeerd: [van, naar], springer: naar, bogen, lampjes: n % 6, lampjesTotaal: 5, lampjesY: 120 });
        n++;
        this.time.delayedCall(600, stap);
      };
      stap();
    }
  }
  return Lijn as unknown as new () => import("phaser").Scene;
}

/* ---------- het vlak ---------- */

export function AftrekkenHoloLijn({
  van,
  tot,
  gemarkeerd = [],
  springer = null,
  bogen = [],
  actief = false,
  kristallen = null,
  lampjesTotaal = 5,
  meld,
  metSom,
  schaal,
}: LantaarnlijnProps & Vlakbasis) {
  const { plek, scene } = useHoloMotor<LijnScene>(schaal, maakLijnScene);
  const { Y, stap, x } = maten(van, tot, metSom);
  const getallen = Array.from({ length: tot - van + 1 }, (_, i) => van + i);
  const twee = gemarkeerd.length >= 2;
  const lampjesY = metSom ? 160 : 110;

  const sleutel = JSON.stringify([van, tot, Y, gemarkeerd, springer, bogen, kristallen, lampjesTotaal]);
  useEffect(() => {
    if (!scene) return;
    const st = JSON.parse(sleutel) as [number, number, number, number[], number | null, Boog[], number | null, number];
    scene.teken({ van: st[0], tot: st[1], Y: st[2], gemarkeerd: st[3], springer: st[4], bogen: st[5], lampjes: st[6], lampjesTotaal: st[7], lampjesY });
  }, [scene, sleutel, lampjesY]);

  return (
    <div className={s.vlak}>
      <div ref={plek} style={HOLO_CANVAS} aria-hidden />

      {/* de getallen onder de lantaarntjes */}
      {getallen.map((n) => {
        const aan = gemarkeerd.includes(n);
        return (
          <div
            key={n}
            className={`${s.label} ${s.schaduw}`}
            style={{
              left: x(n),
              top: Y + (aan ? 10 : 14),
              fontSize: aan ? 34 : 26,
              color: aan ? "#ffd36e" : "#e6eeff",
              opacity: twee && !aan ? 0.5 : 1,
            }}
          >
            {n}
          </div>
        );
      })}
      {/* de getallen boven de bogen */}
      {bogen.map((b, i) =>
        b.label ? (
          <div
            key={`${i}-${b.van}-${b.naar}`}
            className={`${s.boogLabel} ${s.schaduw}`}
            style={{ left: (x(b.van) + x(b.naar)) / 2, top: Y - 34 - Math.min(120, Math.abs(x(b.naar) - x(b.van)) * 0.62) - 36 }}
          >
            {b.label}
          </div>
        ) : null,
      )}
      {/* waar je op kunt tikken: het hele stuk rond een lantaarntje en zijn getal */}
      {getallen.map((n) => (
        <button
          key={`tik-${n}`}
          type="button"
          className={s.tik}
          data-knop={`getal-${n}`}
          disabled={!actief}
          style={{ left: x(n) - Math.min(stap, 130) / 2, top: Y - 110, width: Math.min(stap, 130), height: 170 }}
          aria-label={`Getal ${n}`}
          onClick={() => meld({ soort: "getal", n })}
        />
      ))}
      {kristallen !== null && (
        <span className="sr-only" aria-live="polite">
          {kristallen} van de {lampjesTotaal} lampjes branden
        </span>
      )}
    </div>
  );
}
