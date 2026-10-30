"use client";

/**
 * Het potje met vuurvliegjes (27 oktober 2026, LESSENPLAN.md A1, A2 en A7;
 * wereld Aarde), als hologram in Bliepo's ruimte. Vervangt in die lessen de
 * stippenmachine (`aftrekken-stippen.tsx`, blijft bestaan), met precies
 * dezelfde bediening als Synthesis "Dot Destruction":
 *
 * - een glazen potje (het doel, warme gloed) met losse vuurvliegjes erin;
 * - rechts een plusknop: er vliegt een vuurvliegje het potje in;
 * - daaronder de wegvliegknop: er vliegt er één weg (geen "vernietigen" of
 *   "zappen": wegvliegen is vriendelijker en past bij de wereld);
 * - rechtsboven een lantaarntje met het totaal (de teller);
 * - `cirkel`: een zacht pulserende lichtring rond een knop of de teller.
 *
 * Zelfde eigenschappen en meldingen als de stippenmachine, zodat het
 * draaiboek hetzelfde blijft: elke tik meldt `{ soort: "plus" | "zap", aantal }`
 * met het nieuwe aantal; een nieuw aantal neerzetten gaat met `aantal` én een
 * nieuwe `zet` (een teller).
 *
 * Phaser (HARDE REGEL 7): de gloed is één keer gebakken; per beeld bewegen
 * alleen een paar tweens.
 */

import { useEffect, useRef, useState } from "react";
import type { Vlakbasis } from "../soort";
import { holoBasis, TX, WARM } from "../holo/basis";
import { HOLO_CANVAS, useHoloMotor } from "../holo/motor";
import { AARDE, maakLantaarntje, maakVuurvliegje, POT_AFTREKKEN, tekenPot } from "./aftrekken-holo-teken";
import s from "./aftrekken-holo.module.css";

export type Knopstand = "weg" | "dof" | "aan";

export type PotjeProps = {
  aantal: number;
  /** Verhoog dit om `aantal` opnieuw neer te zetten. */
  zet: number;
  plus?: Knopstand;
  /** De wegvliegknop (heette bij de stippenmachine "zapper"). */
  zapper?: Knopstand;
  /** Het lantaarntje met het totaal. */
  teller?: boolean;
  /** Een lichtring rond een knop of de teller. */
  cirkel?: "plus" | "zapper" | "teller" | null;
  /** Verder dan dit gaat de plusknop niet (standaard 20). */
  plusTot?: number;
  /** Lager dan dit gaat de wegvliegknop niet (standaard 0). */
  zapTot?: number;
};

const MAX = 20;
/* Het potje (midden van het plaatje) en de knoppen rechts. */
const POT = { x: 390, y: 418, b: 400, h: 470 };
const TELLER = { x: 808, y: 196 };
const PLUS = { x: 808, y: 360 };
const WEG = { x: 808, y: 520 };

/**
 * Twintig vaste, losse plekken in het potje (een rooster van 4 × 5 met een
 * beetje speling, zodat ze los lijken maar nooit overlappen); de eerste
 * dicht bij het midden, zodat een paar vuurvliegjes mooi verdeeld staan.
 */
const PLEKKEN: { x: number; y: number }[] = (() => {
  let zaad = 11;
  const kans = () => {
    zaad = (zaad * 16807) % 2147483647;
    return zaad / 2147483647 - 0.5;
  };
  const uit: { x: number; y: number }[] = [];
  for (let r = 0; r < 5; r++)
    for (let k = 0; k < 4; k++)
      uit.push({ x: POT.x - 120 + k * 80 + (r % 2 ? 14 : -14) + kans() * 14, y: POT.y - 100 + r * 70 + kans() * 12 });
  const midden = { x: POT.x, y: POT.y + 40 };
  return uit.sort((a, b) => Math.hypot(a.x - midden.x, a.y - midden.y) - Math.hypot(b.x - midden.x, b.y - midden.y));
})();

/* ---------- de scène ---------- */

interface PotjeScene {
  zetAantal(n: number, zacht: boolean): void;
  toonTeller(aan: boolean): void;
  ring(waar: "plus" | "zapper" | "teller" | null): void;
}

function maakPotjeScene(Phaser: typeof import("phaser"), rustig: boolean) {
  const Basis = holoBasis(Phaser, rustig);
  class Potje extends Basis implements PotjeScene {
    vliegen: (import("phaser").GameObjects.Image | null)[] = Array(MAX).fill(null);
    zweef: (import("phaser").Tweens.Tween | null)[] = Array(MAX).fill(null);
    n = 0;
    lichtring: import("phaser").GameObjects.Image | null = null;

    constructor() {
      super("potje");
    }

    maak() {
      maakVuurvliegje(this);
      maakLantaarntje(this);
      /* Het glazen potje: deksel, hals en een bolle buik, met een paar lichtlijntjes. */
      this.canvasPlaatje("pot", POT.b, POT.h, (c) => tekenPot(c, POT_AFTREKKEN));
      this.bak("pot", "pot-gloed", WARM);
      this.plaats("pot-gloed", POT.x, POT.y);
      /* Het lantaarntje achter de teller (het getal zelf is HTML, scherp). */
      this.canvasPlaatje("teller", 130, 120, (c) => {
        c.strokeStyle = "rgba(255,222,150,0.95)";
        c.lineWidth = 3;
        c.beginPath();
        c.arc(65, 14, 8, Math.PI, 0);
        c.stroke();
        c.fillStyle = "rgba(255,211,110,0.3)";
        c.beginPath();
        c.moveTo(22, 30);
        c.lineTo(65, 14);
        c.lineTo(108, 30);
        c.closePath();
        c.fill();
        c.stroke();
        c.beginPath();
        c.roundRect(20, 31, 90, 72, 14);
        c.fillStyle = "rgba(80,50,10,0.35)";
        c.fill();
        c.stroke();
        c.beginPath();
        c.moveTo(16, 110);
        c.lineTo(114, 110);
        c.stroke();
      });
      this.bak("teller", "teller-gloed", AARDE);
    }

    tellerBeeld: import("phaser").GameObjects.Image | null = null;
    toonTeller(aan: boolean) {
      if (aan && !this.tellerBeeld) this.tellerBeeld = this.plaats("teller-gloed", TELLER.x, TELLER.y + 6);
      if (!aan && this.tellerBeeld) {
        this.tellerBeeld.destroy();
        this.tellerBeeld = null;
      }
    }

    /** Zacht zweven: elk vuurvliegje een eigen, rustig tempo. */
    zweven(i: number) {
      const v = this.vliegen[i];
      if (!v || this.rustig) return;
      this.zweef[i]?.remove();
      const p = PLEKKEN[i];
      this.zweef[i] = this.tweens.add({ targets: v, y: p.y - 4, x: p.x + ((i % 3) - 1) * 2, duration: 1100 + (i % 5) * 170, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    }

    erbij(i: number, zacht: boolean, vertraging: number) {
      const p = PLEKKEN[i];
      const v = this.plaats("vlieg-gloed", p.x, p.y);
      this.vliegen[i] = v;
      if (this.rustig || !zacht) {
        v.setAlpha(0);
        this.tweens.add({ targets: v, alpha: 1, delay: vertraging, duration: this.rustig ? 1 : 180, onComplete: () => this.zweven(i) });
        return;
      }
      /* Het vuurvliegje vliegt van rechtsboven door de hals het potje in. */
      v.setPosition(POT.x + 260, POT.y - 330).setScale(0.55 / TX).setAlpha(0.2);
      this.tweens.add({ targets: v, x: POT.x + 10, y: POT.y - 230, scale: 0.8 / TX, alpha: 1, delay: vertraging, duration: 260, ease: "Sine.easeIn" });
      this.tweens.add({
        targets: v,
        x: p.x,
        y: p.y,
        scale: 1 / TX,
        delay: vertraging + 260,
        duration: 300,
        ease: "Sine.easeOut",
        onComplete: () => this.zweven(i),
      });
    }

    eraf(i: number, zacht: boolean, vertraging: number) {
      const v = this.vliegen[i];
      this.vliegen[i] = null;
      this.zweef[i]?.remove();
      this.zweef[i] = null;
      if (!v) return;
      if (this.rustig || !zacht) {
        this.tweens.add({ targets: v, alpha: 0, delay: vertraging, duration: this.rustig ? 1 : 200, onComplete: () => v.destroy() });
        return;
      }
      /* Omhoog, door de hals naar buiten, en weg (een vriendelijk "wegvliegen"). */
      const dx = (i % 2 ? 1 : -1) * (120 + (i % 4) * 30);
      this.tweens.add({ targets: v, x: POT.x + dx * 0.15, y: POT.y - 240, delay: vertraging, duration: 320, ease: "Sine.easeIn" });
      this.tweens.add({
        targets: v,
        x: POT.x + dx,
        y: POT.y - 420,
        alpha: 0,
        scale: 0.6 / TX,
        delay: vertraging + 320,
        duration: 420,
        ease: "Sine.easeOut",
        onComplete: () => v.destroy(),
      });
    }

    zetAantal(n: number, zacht: boolean) {
      const was = this.n;
      this.n = n;
      const veel = Math.abs(n - was) > 1;
      if (n > was) for (let i = was; i < n; i++) this.erbij(i, zacht, veel ? (i - was) * 40 : 0);
      if (n < was) for (let i = was - 1; i >= n; i--) this.eraf(i, zacht, veel ? (was - 1 - i) * 40 : 0);
    }

    ring(waar: "plus" | "zapper" | "teller" | null) {
      this.lichtring?.destroy();
      this.lichtring = null;
      if (!waar) return;
      const p = waar === "plus" ? PLUS : waar === "zapper" ? WEG : TELLER;
      this.lichtring = this.selectieRing(p.x, p.y, waar === "teller" ? 78 : 76, WARM);
    }

    demo(ms: number) {
      const eind = performance.now() + ms;
      let k = 0;
      const stap = () => {
        if (performance.now() > eind) return;
        this.zetAantal(k % 2 === 0 ? Math.min(MAX, this.n + 3) : Math.max(0, this.n - 2), true);
        k++;
        this.time.delayedCall(450, stap);
      };
      stap();
    }
  }
  return Potje as unknown as new () => import("phaser").Scene;
}

/* ---------- iconen op de knoppen ---------- */

function PlusTeken() {
  return (
    <svg viewBox="0 0 44 44" aria-hidden>
      <path d="M22 7v30M7 22h30" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

/** Een vuurvliegje dat wegvliegt: een lichtje met een pijl schuin omhoog. */
function WegTeken() {
  return (
    <svg viewBox="0 0 44 44" aria-hidden>
      <circle cx="14" cy="30" r="8" fill="#f6ff9a" />
      <path d="M20 24 35 9M24 9h11v11" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

/* ---------- het vlak ---------- */

export function AftrekkenHoloPotje({ aantal, zet, plus = "aan", zapper = "weg", teller = true, cirkel = null, plusTot = MAX, zapTot = 0, meld, schaal }: PotjeProps & Vlakbasis) {
  const { plek, scene } = useHoloMotor<PotjeScene>(schaal, maakPotjeScene);
  const [n, setN] = useState(aantal);
  const [vorigeZet, setVorigeZet] = useState(zet);
  /* Of de volgende verandering vliegt (een tik) of rustig verschijnt (het draaiboek zet een nieuw aantal neer). */
  const doorTik = useRef(false);
  const vorigeN = useRef(0);

  if (zet !== vorigeZet) {
    setVorigeZet(zet);
    setN(aantal);
  }

  useEffect(() => {
    if (!scene) return;
    scene.zetAantal(n, doorTik.current || Math.abs(n - vorigeN.current) <= 6);
    vorigeN.current = n;
    doorTik.current = false;
    window.__phaser = { ...window.__phaser, aantal: n };
  }, [scene, n]);

  const tellerZichtbaar = teller && plus !== "weg";
  useEffect(() => {
    scene?.toonTeller(tellerZichtbaar);
  }, [scene, tellerZichtbaar]);

  useEffect(() => {
    scene?.ring(cirkel);
  }, [scene, cirkel]);

  const tik = (soort: "plus" | "zap") => {
    const nieuw = soort === "plus" ? Math.min(plusTot, MAX, n + 1) : Math.max(zapTot, 0, n - 1);
    if (nieuw === n) return;
    doorTik.current = true;
    setN(nieuw);
    meld({ soort, aantal: nieuw });
  };

  return (
    <div className={s.vlak}>
      <div ref={plek} style={HOLO_CANVAS} aria-hidden />
      <span className="sr-only" aria-live="polite">
        {n === 1 ? "1 vuurvliegje" : `${n} vuurvliegjes`}
      </span>

      {tellerZichtbaar && (
        <div className={`${s.teller} ${s.schaduw}`} style={{ left: TELLER.x, top: TELLER.y - 12 }} aria-hidden>
          {n}
        </div>
      )}
      {plus !== "weg" && (
        <button
          type="button"
          className={`${s.rond} ${s.groot}`}
          data-knop="erbij"
          style={{ left: PLUS.x, top: PLUS.y }}
          disabled={plus !== "aan"}
          aria-label="Vuurvliegje erbij"
          onClick={() => tik("plus")}
        >
          <PlusTeken />
        </button>
      )}
      {zapper !== "weg" && (
        <button
          type="button"
          className={`${s.rond} ${s.groot}`}
          data-knop="wegvliegen"
          style={{ left: WEG.x, top: WEG.y, ["--kleur" as string]: "#f6ff9a" }}
          disabled={zapper !== "aan"}
          aria-label="Vuurvliegje laten wegvliegen"
          onClick={() => tik("zap")}
        >
          <WegTeken />
        </button>
      )}
    </div>
  );
}
