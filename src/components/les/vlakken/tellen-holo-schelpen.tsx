"use client";

/**
 * Twee staande schelpen met 10 parelplekken als hologram (27 oktober 2026,
 * LESSENPLAN.md G4; Synthesis "The Next 10"): de schelp is de tienstrook
 * (2 × 5), de parels de gevulde vakjes. Zelfde eigenschappen en meldingen
 * als de oude tienstroken (`tellen-tienstroken.tsx`, blijft bestaan):
 *
 * - boven elke schelp een groot getal (hoeveel parels erin liggen);
 * - parels vullen van onder naar boven; een volle schelp is zacht roze, in
 *   de tweede schelp krijgt elke stand een eigen kleur (zoals Synthesis);
 * - rechts groeit een lijstje met getal en getalwoord;
 * - `modus`: "links"/"rechts" = tik ergens op die schelp, "bouw" = tik een
 *   parel weg of een lege plek vol in de tweede schelp.
 *
 * Meldt `{ soort: "tik", strook: 1 | 2, gevuld }` en `{ soort: "klaar" }`.
 * `golf` (teller): rustige lichtgolf bij goed.
 */

import { useEffect } from "react";
import type { Vlakbasis } from "../soort";
import { holoBasis, TX, GOED, WARM, WERELDKLEUR } from "../holo/basis";
import { HOLO_CANVAS, useHoloMotor } from "../holo/motor";
import { IkoonKnop } from "../ikonen";
import { TEGELKLEUR } from "../tegels";
import { GETALWOORD } from "./tellen-tienstroken";
import { hexNaarGetal, maakParels, tekenSchelp } from "./tellen-holo-tekenen";
import s from "./tellen-holo.module.css";

export type TelSchelpenProps = {
  links: number;
  rechts: number;
  tweede?: boolean;
  lijst?: number[];
  onderstreept?: number | null;
  nummersLinks?: boolean;
  modus?: "links" | "rechts" | "bouw" | null;
  klaarKnop?: boolean;
  /** Teken het vinkje in het vlak zelf (de oude plek). Standaard uit: het staat op de vaste plek onder de zin van Bliepo (28 oktober 2026). */
  knoppenInVlak?: boolean;
  /** Een warme rand om deze schelp (hulp: "kijk hier"). */
  gloei?: 1 | 2 | null;
  golf?: number;
  /** Zonder lijstje rechts (de toetsen): de schelpen staan dan meer in het midden. */
  zonderLijst?: boolean;
};

/* ---------- maten ---------- */

const SB = 230;
const SH = 480;
const S_TOP = 150;
const PITCH = 84;
const ROZE = "#f5c2d3";

const schelpX = (nr: 1 | 2, zonderLijst: boolean) => (zonderLijst ? (nr === 1 ? 330 : 650) : nr === 1 ? 200 : 460);
/** Plek i (0–9): van onder naar boven, per rij eerst links. */
function plek(i: number) {
  const rij = Math.floor(i / 2);
  return { dx: i % 2 ? 50 : -50, y: S_TOP + 82 + (4 - rij) * PITCH };
}
export const parelKleur = (n: number) => (n >= 10 ? ROZE : (TEGELKLEUR[n] ?? ROZE));
const lichtKleur = (hex: string) => {
  /* Een tint voor een witte parel: helft wit, zodat hij een parel blijft. */
  const n = hexNaarGetal(hex);
  const m = (x: number) => Math.round(x + (255 - x) * 0.35);
  return (m((n >> 16) & 255) << 16) | (m((n >> 8) & 255) << 8) | m(n & 255);
};

/* ---------- de scène ---------- */

interface SchelpenScene {
  zet(links: number, rechts: number, tweede: boolean, zonderLijst: boolean): void;
  gloeiOm(nr: 1 | 2 | null): void;
  golfNu(): void;
}

function maakSchelpenScene(Phaser: typeof import("phaser"), rustig: boolean) {
  const Basis = holoBasis(Phaser, rustig);
  class Schelpen extends Basis implements SchelpenScene {
    groepen: (import("phaser").GameObjects.Container | null)[] = [null, null];
    parels: import("phaser").GameObjects.Image[][] = [[], []];
    stand = [-1, -1];
    plekX = [0, 0];
    ring: import("phaser").GameObjects.Image | null = null;

    constructor() {
      super("tel-schelpen");
    }

    maak() {
      maakParels(this);
      this.canvasPlaatje("tel-schelp", SB, SH, (c) => tekenSchelp(c, SB, SH));
      this.bak("tel-schelp", "tel-schelp-g", WERELDKLEUR.oceaan);
      this.canvasPlaatje("tel-schelp-warm", SB + 24, SH + 24, (c) => {
        c.translate(12, 12);
        c.strokeStyle = "rgba(255,211,110,0.95)";
        c.lineWidth = 5;
        c.beginPath();
        c.roundRect(-4, -4, SB + 8, SH + 8, 40);
        c.stroke();
      });
      this.bak("tel-schelp-warm", "tel-schelp-warm-g", WARM);
    }

    maakSchelp(nr: 0 | 1, x: number, toveren: boolean) {
      this.groepen[nr]?.destroy();
      const g = this.add.container(x, S_TOP + SH / 2);
      g.add(this.plaats("tel-schelp-g", 0, 0));
      const parels: import("phaser").GameObjects.Image[] = [];
      for (let i = 0; i < 10; i++) {
        const p = plek(i);
        g.add(this.plaats("tel-plek", p.dx, p.y - (S_TOP + SH / 2)).setScale(1.1 / TX));
        const parel = this.plaats("tel-parel-g", p.dx, p.y - (S_TOP + SH / 2)).setScale(1.1 / TX).setVisible(false);
        g.add(parel);
        parels.push(parel);
      }
      this.groepen[nr] = g;
      this.parels[nr] = parels;
      this.stand[nr] = 0;
      this.plekX[nr] = x;
      if (toveren) this.tover(g);
    }

    vul(nr: 0 | 1, n: number) {
      const tint = lichtKleur(parelKleur(n));
      this.parels[nr].forEach((p, i) => {
        const zicht = i < n;
        if (zicht && !p.visible && !this.rustig) {
          p.setScale(0.5 / TX).setAlpha(0);
          this.tweens.add({ targets: p, scale: 1.1 / TX, alpha: 1, duration: 220, ease: "Back.easeOut" });
        }
        p.setVisible(zicht).setTint(tint);
      });
      this.stand[nr] = n;
    }

    zet(links: number, rechts: number, tweede: boolean, zonderLijst: boolean) {
      const x1 = schelpX(1, zonderLijst);
      const x2 = schelpX(2, zonderLijst);
      if (!this.groepen[0] || this.plekX[0] !== x1) this.maakSchelp(0, x1, true);
      if (tweede && (!this.groepen[1] || this.plekX[1] !== x2)) this.maakSchelp(1, x2, true);
      if (!tweede && this.groepen[1]) {
        const g = this.groepen[1];
        this.groepen[1] = null;
        this.parels[1] = [];
        this.verdwijn(g);
      }
      this.vul(0, links);
      if (tweede) this.vul(1, rechts);
    }

    gloeiOm(nr: 1 | 2 | null) {
      this.ring?.destroy();
      this.ring = null;
      const x = nr ? this.plekX[nr - 1] : 0;
      if (!nr || !x) return;
      this.ring = this.plaats("tel-schelp-warm-g", x, S_TOP + SH / 2);
      if (!this.rustig) this.tweens.add({ targets: this.ring, alpha: 0.45, duration: 700, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    }

    golfNu() {
      const x = this.groepen[1] ? (this.plekX[0] + this.plekX[1]) / 2 : this.plekX[0];
      this.golf(x, S_TOP + SH / 2, GOED);
    }

    demo(ms: number) {
      const eind = performance.now() + ms;
      let n = 0;
      const stap = () => {
        if (performance.now() > eind) return;
        n = (n + 1) % 11;
        this.zet(10, n, true, false);
        if (n === 10) this.golfNu();
        this.time.delayedCall(260, stap);
      };
      stap();
    }
  }
  return Schelpen as unknown as new () => import("phaser").Scene;
}

/* ---------- het vlak ---------- */

export function TelSchelpen({
  links,
  rechts,
  tweede = false,
  lijst = [],
  onderstreept = null,
  nummersLinks = false,
  modus = null,
  klaarKnop = false,
  knoppenInVlak = false,
  gloei = null,
  golf = 0,
  zonderLijst = false,
  meld,
  schaal,
}: TelSchelpenProps & Vlakbasis) {
  const { plek: canvas, scene } = useHoloMotor<SchelpenScene>(schaal, maakSchelpenScene);

  useEffect(() => {
    scene?.zet(links, rechts, tweede, zonderLijst);
  }, [scene, links, rechts, tweede, zonderLijst]);
  useEffect(() => {
    scene?.gloeiOm(gloei);
  }, [scene, gloei, tweede, zonderLijst]);
  useEffect(() => {
    if (scene && golf > 0) scene.golfNu();
  }, [scene, golf]);

  const schelp = (nr: 1 | 2) => {
    const x = schelpX(nr, zonderLijst);
    const aantal = nr === 1 ? links : rechts;
    const heel = (nr === 1 && modus === "links") || (nr === 2 && modus === "rechts");
    const bouw = nr === 2 && modus === "bouw";
    return (
      <div key={nr}>
        <div className={s.getal} style={{ left: x, top: 52, color: aantal > 0 ? parelKleur(aantal) : "#ffffff" }}>
          {aantal}
        </div>
        {heel && (
          <button
            type="button"
            className={s.tik}
            data-schelp={nr}
            style={{ left: x - SB / 2, top: S_TOP, width: SB, height: SH }}
            aria-label={`Schelp ${nr}, tik om een parel te leggen`}
            onClick={() => meld({ soort: "tik", strook: nr, gevuld: false })}
          />
        )}
        {bouw &&
          Array.from({ length: 10 }, (_, i) => {
            const p = plek(i);
            const gevuld = i < aantal;
            return (
              <button
                key={i}
                type="button"
                className={s.tik}
                data-plek={i}
                data-gevuld={gevuld ? "ja" : "nee"}
                style={{ left: x + p.dx - 44, top: p.y - 42, width: 88, height: 84, borderRadius: "50%" }}
                aria-label={gevuld ? "Parel, tik om weg te halen" : "Lege plek, tik om een parel te leggen"}
                onClick={() => meld({ soort: "tik", strook: 2, gevuld })}
              />
            );
          })}
        {nr === 1 &&
          nummersLinks &&
          Array.from({ length: Math.min(10, links) }, (_, i) => {
            const p = plek(i);
            return (
              <span key={i} className={s.nummer} style={{ left: x + p.dx - 40, top: p.y - 40, width: 80, height: 80, fontSize: 38, color: "#13204a", textShadow: "none" }}>
                {i + 1}
              </span>
            );
          })}
      </div>
    );
  };

  return (
    <div className={s.vlak}>
      <div ref={canvas} style={HOLO_CANVAS} aria-hidden />
      {schelp(1)}
      {tweede && schelp(2)}

      {!zonderLijst && lijst.length > 0 && (
        <ol className={s.lijst} aria-label="Getallen">
          {lijst.map((n) => (
            <li key={n}>
              <span className={s.stip} style={{ background: parelKleur(n - 10 || 10), color: parelKleur(n - 10 || 10) }} />
              <span className={onderstreept === n ? s.doel : undefined}>
                {n} – {GETALWOORD[n] ?? ""}
              </span>
            </li>
          ))}
        </ol>
      )}

      {knoppenInVlak && klaarKnop && (
        <div className={s.vinkje} style={zonderLijst ? { left: 430, top: 600 } : { left: 578, top: 516 }}>
          <IkoonKnop ikoon="vink" label="Klaar" knop="vinkje" kleur="blauw" style={{ width: 112, height: 112 }} onClick={() => meld({ soort: "klaar" })} />
        </div>
      )}
    </div>
  );
}
