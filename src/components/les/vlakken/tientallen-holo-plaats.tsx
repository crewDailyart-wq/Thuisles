"use client";

/**
 * De plaatsmachine als hologram (27 oktober 2026, LESSENPLAN.md G13 "De plek
 * van de tientallen", wereld Universum). Vervangt in die les de oude
 * plaatsmachine (`tientallen-plaatsmachine.tsx`, blijft bestaan voor de
 * andere lessen); zelfde props en meldingen.
 *
 * Eén hoog kristallen vak (de eenheden) met groot het cijfer eronder. Tik in
 * het vak en er valt een ster in. Bij de tiende ster past het niet meer: het
 * vak kleurt warm rood en in plaats van een cijfer staat er een verbodsteken.
 * Dan komt er links een tweede kristallen vak bij (de tientallen). Sleep je
 * een ster daarheen, dan vliegen alle tien mee en worden ze samen één
 * lichtbol; sleep je de lichtbol terug, dan valt hij weer uiteen in tien
 * sterren. Tikken werkt ook.
 *
 * Meldingen: `{ soort: "tik" }`, `{ soort: "uit" }` (een ster uit het vak),
 * `{ soort: "naarTien" }` en `{ soort: "naarEen" }`, alleen als dat aan staat.
 */

import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import type { Vlakbasis } from "../soort";
import { holoBasis, WARM } from "../holo/basis";
import { HOLO_CANVAS, useHoloMotor } from "../holo/motor";
import { maakSterPlaatjes, PAARS, testHaak } from "./tientallen-holo-basis";
import { Slotje } from "./tientallen-holo-machine";
import s from "./tientallen-holo.module.css";

export type HoloPlaatsProps = {
  kolommen: 1 | 2;
  /** Sterren in het vak van de eenheden (10 = vol, past niet). */
  enen: number;
  /** Lichtbollen in het vak van de tientallen (0 of 1). */
  tienen: number;
  /** Het totaal bovenaan. */
  totaal?: boolean;
  tik?: boolean;
  sleepUit?: boolean;
  sleepNaarTien?: boolean;
  sleepNaarEen?: boolean;
  /** Een slotje op het vak van de eenheden. */
  slotEen?: boolean;
  /** De cijfers 0 tot en met 9 onderaan; deze lichten op. */
  cijferrij?: number[] | null;
};

export type HoloPlaatsMelding = { soort: "tik" } | { soort: "uit" } | { soort: "naarTien" } | { soort: "naarEen" };

/* ---------- maten (punten van het vlak) ---------- */

const VAK = { b: 176, h: 300, y: 168 };
const EEN_X = 560;
const TIEN_X = 360;
const vakVan = (x: number) => ({ x: x - VAK.b / 2, y: VAK.y, b: VAK.b, h: VAK.h });
const binnen = (p: { x: number; y: number }, x: number, marge = 20) => {
  const v = vakVan(x);
  return p.x >= v.x - marge && p.x <= v.x + v.b + marge && p.y >= v.y - marge && p.y <= v.y + v.h + marge;
};

/** Tien plekken in het vak, gestapeld als knikkers: 3, 2, 3, 2 van onder naar boven. */
const STERPLEK = (() => {
  const uit: { x: number; y: number }[] = [];
  [3, 2, 3, 2].forEach((aantal, r) => {
    for (let i = 0; i < aantal; i++) {
      const x = aantal === 3 ? EEN_X - 52 + i * 52 : EEN_X - 26 + i * 52;
      uit.push({ x, y: VAK.y + VAK.h - 40 - r * 50 });
    }
  });
  return uit;
})();
const BOLPLEK = { x: TIEN_X, y: VAK.y + VAK.h - 70 };

/* ---------- de scène ---------- */

interface PlaatsScene {
  toon(p: { kolommen: number; enen: number; tienen: number; slotEen: boolean }): void;
  /** Slepen: pak het bovenste voorwerp uit een vak, volg de vinger, laat los. */
  pak(uit: "een" | "tien"): boolean;
  volg(x: number, y: number): void;
  terug(): void;
}

function maakScene() {
  return (Phaser: typeof import("phaser"), rustig: boolean) => {
    const Basis = holoBasis(Phaser, rustig);
    type Img = import("phaser").GameObjects.Image;
    class Plaats extends Basis implements PlaatsScene {
      vakEen: Img | null = null;
      vakTien: Img | null = null;
      vakVol: Img | null = null;
      sterren: Img[] = [];
      bol: Img | null = null;
      stand = { kolommen: 1, enen: 0, tienen: 0, slotEen: false };
      gepakt: Img | null = null;
      gepaktVan: { x: number; y: number } | null = null;

      constructor() {
        super("plaatsmachine");
      }

      maak() {
        maakSterPlaatjes(this);
        /* Een hoog kristallen vak: dunne lichte wanden, een zacht facet, doorzichtig. */
        const tekenVak = (rand: string, vul: string) => (c: CanvasRenderingContext2D) => {
          const b = VAK.b;
          const h = VAK.h;
          c.beginPath();
          c.moveTo(14, 4);
          c.lineTo(b - 14, 4);
          c.lineTo(b - 4, 18);
          c.lineTo(b - 4, h - 18);
          c.lineTo(b - 14, h - 4);
          c.lineTo(14, h - 4);
          c.lineTo(4, h - 18);
          c.lineTo(4, 18);
          c.closePath();
          const g = c.createLinearGradient(0, 0, b, h);
          g.addColorStop(0, vul);
          g.addColorStop(0.5, "rgba(40,30,120,0.18)");
          g.addColorStop(1, vul);
          c.fillStyle = g;
          c.fill();
          c.lineWidth = 3;
          c.strokeStyle = rand;
          c.stroke();
          c.strokeStyle = "rgba(255,255,255,0.25)";
          c.lineWidth = 1.5;
          c.beginPath();
          c.moveTo(26, 20);
          c.lineTo(26, h - 30);
          c.stroke();
        };
        this.canvasPlaatje("vak", VAK.b, VAK.h, tekenVak("rgba(225,215,255,0.95)", "rgba(120,100,240,0.28)"));
        this.bak("vak", "vak-g", PAARS);
        this.canvasPlaatje("vak-vol", VAK.b, VAK.h, tekenVak("rgba(255,170,150,0.95)", "rgba(230,80,80,0.35)"));
        this.bak("vak-vol", "vak-vol-g", 0xff9c8a);
      }

      toon(p: { kolommen: number; enen: number; tienen: number; slotEen: boolean }) {
        const oud = this.stand;
        this.stand = { ...p };
        /* De vakken. */
        if (!this.vakEen) {
          this.vakEen = this.plaats("vak-g", EEN_X, VAK.y + VAK.h / 2);
          this.tover(this.vakEen);
        }
        if (p.kolommen === 2 && !this.vakTien) {
          this.vakTien = this.plaats("vak-g", TIEN_X, VAK.y + VAK.h / 2);
          this.tover(this.vakTien);
        }
        if (p.kolommen === 1 && this.vakTien) {
          this.vakTien.destroy();
          this.vakTien = null;
        }
        const vol = p.enen >= 10 && p.kolommen === 1;
        if (vol && !this.vakVol) {
          this.vakVol = this.plaats("vak-vol-g", EEN_X, VAK.y + VAK.h / 2).setAlpha(0);
          this.tweens.add({ targets: this.vakVol, alpha: 1, duration: 300 });
        }
        if (!vol && this.vakVol) {
          this.vakVol.destroy();
          this.vakVol = null;
        }
        this.vakEen.setAlpha(p.slotEen ? 0.45 : 1);

        /* Tien sterren worden samen één lichtbol in het vak van de tientallen. */
        if (oud.tienen === 0 && p.tienen === 1 && p.enen === 0 && !this.bol && this.sterren.length + (this.gepakt ? 1 : 0) >= 1) {
          const alle = this.sterren;
          if (this.gepakt) alle.push(this.gepakt);
          this.gepakt = null;
          this.sterren = [];
          this.tweens.add({
            targets: alle,
            x: BOLPLEK.x,
            y: BOLPLEK.y,
            scale: 0.4 / 2,
            duration: rustig ? 1 : 520,
            ease: "Cubic.easeInOut",
            onComplete: () => {
              alle.forEach((o) => o.destroy());
              this.bol?.destroy();
              this.bol = this.plaats("bol-g", BOLPLEK.x, BOLPLEK.y);
              const sc = this.bol.scaleX;
              this.bol.setScale(sc * 0.4);
              this.tweens.add({ targets: this.bol, scale: sc, duration: 280, ease: "Back.easeOut" });
              this.golf(BOLPLEK.x, BOLPLEK.y, WARM);
            },
          });
          return;
        }
        /* De lichtbol valt uiteen in tien sterren. */
        if (oud.tienen === 1 && p.tienen === 0 && p.enen === 10) {
          const van = this.gepakt ?? this.bol;
          const x0 = van?.x ?? BOLPLEK.x;
          const y0 = van?.y ?? BOLPLEK.y;
          this.gepakt?.destroy();
          this.bol?.destroy();
          this.gepakt = null;
          this.bol = null;
          this.sterren.forEach((o) => o.destroy());
          this.sterren = STERPLEK.map((q, i) => {
            const o = this.plaats("ster-g", x0, y0);
            this.tweens.add({ targets: o, x: q.x, y: q.y, delay: i * 25, duration: rustig ? 1 : 460, ease: "Back.easeOut" });
            return o;
          });
          this.golf(x0, y0, WARM);
          return;
        }

        /* De lichtbol. */
        if (p.tienen > 0 && !this.bol) this.bol = this.plaats("bol-g", BOLPLEK.x, BOLPLEK.y);
        if (p.tienen === 0 && this.bol) {
          this.bol.destroy();
          this.bol = null;
        }
        /* De sterren: erbij vallen ze van boven in het vak; minder lossen ze op. */
        const n = Math.min(10, p.enen) - (this.gepakt && !this.gepakt.texture.key.startsWith("bol") ? 1 : 0);
        while (this.sterren.length > n) {
          const o = this.sterren.pop()!;
          this.verdwijn(o);
        }
        while (this.sterren.length < n) {
          const q = STERPLEK[this.sterren.length];
          const o = this.plaats("ster-g", q.x, rustig ? q.y : VAK.y - 30);
          if (!rustig) this.tweens.add({ targets: o, y: q.y, duration: 380, ease: "Bounce.easeOut" });
          this.sterren.push(o);
        }
      }

      pak(uit: "een" | "tien") {
        if (this.gepakt) return true;
        if (uit === "een") {
          const o = this.sterren.pop();
          if (!o) return false;
          this.gepakt = o;
        } else {
          if (!this.bol) return false;
          this.gepakt = this.bol;
          this.bol = null;
        }
        this.gepaktVan = { x: this.gepakt.x, y: this.gepakt.y };
        this.gepakt.setDepth(10);
        return true;
      }

      volg(x: number, y: number) {
        this.gepakt?.setPosition(x, y);
      }

      terug() {
        const o = this.gepakt;
        const van = this.gepaktVan;
        this.gepakt = null;
        if (!o || !van) return;
        this.tweens.add({ targets: o, x: van.x, y: van.y, duration: rustig ? 1 : 220, ease: "Cubic.easeOut" });
        if (o.texture.key.startsWith("bol")) this.bol = o;
        else this.sterren.push(o);
      }

      /** Wat er bij loslaten met het gepakte voorwerp gebeurt als de les het aanneemt. */
      laatLos() {
        const o = this.gepakt;
        this.gepakt = null;
        if (o) this.verdwijn(o);
      }

      demo(ms: number) {
        const eind = performance.now() + ms;
        let n = 0;
        const stap = () => {
          if (performance.now() > eind) return;
          n = (n + 1) % 11;
          this.toon({ kolommen: 1, enen: n, tienen: 0, slotEen: false });
          this.time.delayedCall(260, stap);
        };
        stap();
      }
    }
    return Plaats as unknown as new () => import("phaser").Scene;
  };
}

/* ---------- het vlak ---------- */

function Verbod() {
  return (
    <svg width={72} height={72} viewBox="0 0 24 24" aria-hidden>
      <circle cx={12} cy={12} r={9.5} fill="none" stroke="#ff9c8a" strokeWidth={2.6} />
      <path d="M5.5 18.5l13-13" stroke="#ff9c8a" strokeWidth={2.6} strokeLinecap="round" />
    </svg>
  );
}

export function HoloPlaatsmachine(p: HoloPlaatsProps & Vlakbasis) {
  const { kolommen, enen, tienen, totaal = false, tik = false, sleepUit = false, sleepNaarTien = false, sleepNaarEen = false, slotEen = false, cijferrij = null, meld, schaal } = p;
  const { plek, scene } = useHoloMotor<PlaatsScene & { laatLos(): void }>(schaal, maakScene());
  const vlak = useRef<HTMLDivElement>(null);
  const sleep = useRef<{ van: "een" | "tien"; x0: number; y0: number; bewogen: boolean } | null>(null);
  const [, setTik] = useState(0);

  useEffect(() => {
    scene?.toon({ kolommen, enen, tienen, slotEen });
    testHaak({ enen, tienen });
  }, [scene, kolommen, enen, tienen, slotEen]);

  /* Voor de automatische test: wat het kind nu kan doen. */
  useEffect(() => {
    testHaak({ plaatsActie: tik ? "tik" : sleepUit ? "uit" : sleepNaarTien ? "naarTien" : sleepNaarEen ? "naarEen" : null });
  }, [tik, sleepUit, sleepNaarTien, sleepNaarEen]);

  const punt = (e: RPointerEvent) => {
    const r = vlak.current!.getBoundingClientRect();
    return { x: (e.clientX - r.left) / schaal, y: (e.clientY - r.top) / schaal };
  };

  const omlaag = (e: RPointerEvent<HTMLDivElement>) => {
    if (!scene) return;
    const q = punt(e);
    if (tik && binnen(q, EEN_X)) {
      meld({ soort: "tik" });
      return;
    }
    const van = (sleepUit || sleepNaarTien) && binnen(q, EEN_X) ? "een" : sleepNaarEen && kolommen === 2 && binnen(q, TIEN_X) ? "tien" : null;
    if (!van) return;
    if (!scene.pak(van)) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    sleep.current = { van, x0: q.x, y0: q.y, bewogen: false };
    scene.volg(q.x, q.y);
    setTik((x) => x + 1);
  };
  const beweeg = (e: RPointerEvent<HTMLDivElement>) => {
    const sl = sleep.current;
    if (!sl || !scene) return;
    const q = punt(e);
    if (Math.hypot(q.x - sl.x0, q.y - sl.y0) > 10) sl.bewogen = true;
    scene.volg(q.x, q.y);
  };
  const los = (e: RPointerEvent<HTMLDivElement>) => {
    const sl = sleep.current;
    sleep.current = null;
    if (!sl || !scene) return;
    const q = punt(e);
    /* Tikken werkt ook: een tik zonder slepen telt als de beweging die nu gevraagd wordt. */
    const tikje = !sl.bewogen;
    if (sl.van === "een" && sleepUit && (tikje || !binnen(q, EEN_X, 0))) {
      scene.laatLos();
      meld({ soort: "uit" });
    } else if (sl.van === "een" && sleepNaarTien && (tikje || binnen(q, TIEN_X))) {
      meld({ soort: "naarTien" });
    } else if (sl.van === "tien" && sleepNaarEen && (tikje || binnen(q, EEN_X))) {
      meld({ soort: "naarEen" });
    } else scene.terug();
  };

  const cijferStijl = (x: number, kleur: string) => ({ left: x - 90, width: 180, top: VAK.y + VAK.h + 20, color: kleur });
  const vol = enen >= 10 && kolommen === 1;
  const actief = tik || sleepUit || sleepNaarTien || sleepNaarEen;

  return (
    <div ref={vlak} className={s.vlak} onPointerDown={omlaag} onPointerMove={beweeg} onPointerUp={los} onPointerCancel={los} style={{ cursor: actief ? "pointer" : "default" }}>
      <div ref={plek} style={HOLO_CANVAS} aria-hidden />

      {/* Klein boven elk vak wat één voorwerp waard is. */}
      <div className={`${s.cijfer} ${s.tekst}`} style={{ left: EEN_X - 60, width: 120, top: VAK.y - 52, fontSize: 36, opacity: 0.9 }}>
        1
      </div>
      {kolommen === 2 && (
        <div className={`${s.cijfer} ${s.tekst}`} style={{ left: TIEN_X - 60, width: 120, top: VAK.y - 52, fontSize: 36, opacity: 0.9 }}>
          10
        </div>
      )}

      {/* Het cijfer onder het vak; bij tien in één vak een verbodsteken. */}
      <div className={`${s.cijfer} ${s.tekst}`} style={cijferStijl(EEN_X, "#fff3c0")}>
        {vol ? <Verbod /> : Math.min(enen, 9)}
      </div>
      {kolommen === 2 && (
        <div className={`${s.cijfer} ${s.tekst}`} style={cijferStijl(TIEN_X, "#e6deff")}>
          {tienen}
        </div>
      )}
      {slotEen && (
        <div style={{ position: "absolute", left: EEN_X + VAK.b / 2 - 30, top: VAK.y - 14 }}>
          <Slotje />
        </div>
      )}

      {/* Het totaal, rechts naast de vakken. */}
      {totaal && (
        <div className={`${s.cijfer} ${s.tekst}`} style={{ left: 700, width: 220, top: VAK.y + 90, fontSize: 96, color: "#ffffff" }}>
          {tienen * 10 + enen}
        </div>
      )}

      {/* De cijfers 0 t/m 9 onderaan. */}
      {cijferrij && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 600, display: "flex", justifyContent: "center", gap: 18 }}>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
            <span
              key={d}
              className={s.tekst}
              style={{ fontSize: 54, fontWeight: 800, width: 52, textAlign: "center", color: cijferrij.includes(d) ? "#ffd36e" : "rgba(255,255,255,0.3)", transition: "color 0.2s" }}
            >
              {d}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
