"use client";

/**
 * Het getallenveld als zwevend hologram van bubbels (27 oktober 2026,
 * LESSENPLAN.md G2, G5 en G6; Synthesis "Counting On"): rijen van 10
 * lichtgevende bubbels met een getal, elke kolom een eigen kleur (dezelfde
 * kleuren als Synthesis). Het veld groeit met een lichtstraal (eerst 1–20,
 * dan 1–50). Zelfde eigenschappen en meldingen als het oude getallenveld
 * (`tellen-getallenveld.tsx`, blijft bestaan):
 *
 * - `rand`: een warme, zacht pulserende lichtring (het startgetal);
 * - `pijl`: twee driehoekjes boven en onder (waar je nu bent);
 * - `licht`: alleen deze getallen helder, de rest dof (kleiner zoekgebied);
 * - `actief`: de bubbels zijn aan te tikken; `klaarKnop`: het vinkje.
 *
 * Meldt `{ soort: "getal", n }` en `{ soort: "klaar" }`. `golf` (teller):
 * rustige lichtgolf vanaf de bubbel met de rand.
 */

import { useEffect } from "react";
import type { Vlakbasis } from "../soort";
import { holoBasis, GOED, WARM } from "../holo/basis";
import { HOLO_CANVAS, useHoloMotor } from "../holo/motor";
import { IkoonKnop } from "../ikonen";
import { KOLOMKLEUR } from "./tellen-getallenveld";
import { hexNaarGetal, tekenBubbel } from "./tellen-holo-tekenen";
import s from "./tellen-holo.module.css";

export type TelVeldProps = {
  /** Het hoogste getal (een tiental, hoogstens 50). */
  tot: number;
  rand?: number[];
  pijl?: number | null;
  licht?: number[] | null;
  actief?: boolean;
  klaarKnop?: boolean;
  golf?: number;
};

/* ---------- maten ---------- */

const STAP = 94;
const D = 86;
const X0 = (980 - (10 * STAP - (STAP - D))) / 2;
const ONDER = 128;

function maten(tot: number) {
  const rijen = Math.ceil(tot / 10);
  const hoog = rijen * STAP - (STAP - D);
  const y0 = 24 + Math.max(0, (720 - 24 - ONDER - hoog) / 2);
  return { rijen, y0 };
}
const midden = (n: number, y0: number) => ({ x: X0 + ((n - 1) % 10) * STAP + D / 2, y: y0 + Math.floor((n - 1) / 10) * STAP + D / 2 });

/* ---------- de scène ---------- */

interface VeldScene {
  zet(tot: number): void;
  dof(licht: number[] | null): void;
  ringen(rand: number[]): void;
  golfBij(n: number | null): void;
}

function maakVeldScene(Phaser: typeof import("phaser"), rustig: boolean) {
  const Basis = holoBasis(Phaser, rustig);
  class Veld extends Basis implements VeldScene {
    bubbels: import("phaser").GameObjects.Image[] = [];
    rijen: import("phaser").GameObjects.Container[] = [];
    y0 = 0;
    ringLijst: import("phaser").GameObjects.Image[] = [];

    constructor() {
      super("tel-veld");
    }

    maak() {
      KOLOMKLEUR.forEach((k, i) => {
        this.canvasPlaatje(`tel-bubbel-${i}`, D, D, (c) => tekenBubbel(c, D, k));
        this.bak(`tel-bubbel-${i}`, `tel-bubbel-${i}-g`, hexNaarGetal(k));
      });
    }

    zet(tot: number) {
      const { rijen, y0 } = maten(tot);
      const verschoven = y0 !== this.y0;
      this.y0 = y0;
      /* Bestaande rijen schuiven mee als het veld groeit; nieuwe rijen worden tevoorschijn getoverd. */
      this.rijen.forEach((r, j) => {
        const y = y0 + j * STAP + D / 2;
        if (!verschoven) return;
        if (this.rustig) r.setY(y);
        else this.tweens.add({ targets: r, y, duration: 380, ease: "Cubic.easeInOut" });
      });
      while (this.rijen.length > rijen) this.rijen.pop()!.destroy();
      const nieuw = this.rijen.length;
      for (let j = nieuw; j < rijen; j++) {
        const rij = this.add.container(490, y0 + j * STAP + D / 2);
        for (let k = 0; k < 10; k++) rij.add(this.plaats(`tel-bubbel-${k}-g`, X0 + k * STAP + D / 2 - 490, 0));
        this.rijen.push(rij);
        this.tover(rij, { vertraging: (j - nieuw) * 90 + (nieuw > 0 ? 300 : 0) });
      }
      this.bubbels = this.rijen.flatMap((r) => r.list as import("phaser").GameObjects.Image[]);
    }

    dof(licht: number[] | null) {
      this.bubbels.forEach((b, i) => {
        const a = licht === null || licht.includes(i + 1) ? 1 : 0.22;
        if (this.rustig) b.setAlpha(a);
        else this.tweens.add({ targets: b, alpha: a, duration: 260 });
      });
    }

    ringen(rand: number[]) {
      this.ringLijst.forEach((r) => r.destroy());
      this.ringLijst = rand.map((n) => {
        const p = midden(n, this.y0);
        return this.selectieRing(p.x, p.y, D / 2 + 4, WARM);
      });
    }

    golfBij(n: number | null) {
      const p = n ? midden(n, this.y0) : { x: 490, y: this.y0 + 100 };
      this.golf(p.x, p.y, GOED);
    }

    demo(ms: number) {
      const eind = performance.now() + ms;
      let n = 0;
      const stap = () => {
        if (performance.now() > eind) return;
        n++;
        this.zet(n % 2 ? 50 : 20);
        this.ringen([(n * 7) % 20 + 1]);
        this.time.delayedCall(500, () => this.golfBij((n * 7) % 20 + 1));
        this.time.delayedCall(1000, stap);
      };
      stap();
    }
  }
  return Veld as unknown as new () => import("phaser").Scene;
}

/* ---------- het vlak ---------- */

function Driehoek({ x, y, omlaag }: { x: number; y: number; omlaag: boolean }) {
  return (
    <svg
      width={30}
      height={20}
      viewBox="0 0 26 18"
      style={{ position: "absolute", left: x - 15, top: y, transform: omlaag ? "rotate(180deg)" : undefined, pointerEvents: "none", filter: "drop-shadow(0 0 4px rgba(4,18,60,0.9))" }}
      aria-hidden
    >
      <path d="M13 1L25 17H1z" fill="#ffffff" />
    </svg>
  );
}

export function TelVeld({ tot, rand = [], pijl = null, licht = null, actief = false, klaarKnop = false, golf = 0, meld, schaal }: TelVeldProps & Vlakbasis) {
  const { plek, scene } = useHoloMotor<VeldScene>(schaal, maakVeldScene);
  const { y0 } = maten(tot);

  useEffect(() => {
    if (!scene) return;
    scene.zet(tot);
  }, [scene, tot]);
  const lichtKey = licht ? licht.join(",") : "";
  const randKey = rand.join(",");
  useEffect(() => {
    scene?.dof(lichtKey ? lichtKey.split(",").map(Number) : null);
  }, [scene, lichtKey, tot]);
  useEffect(() => {
    scene?.ringen(randKey ? randKey.split(",").map(Number) : []);
  }, [scene, randKey, tot]);
  useEffect(() => {
    if (scene && golf > 0) scene.golfBij(randKey ? Number(randKey.split(",").pop()) : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, golf]);

  return (
    <div className={s.vlak}>
      <div ref={plek} style={HOLO_CANVAS} aria-hidden />
      {Array.from({ length: tot }, (_, i) => {
        const n = i + 1;
        const p = midden(n, y0);
        const dof = licht !== null && !licht.includes(n);
        return (
          <button
            key={n}
            type="button"
            data-getal={n}
            disabled={!actief}
            className={`${s.bubbelgetal} ${actief ? s.aan : ""} ${dof ? s.dof : ""}`}
            style={{ left: p.x - D / 2, top: p.y - D / 2, width: D, height: D, fontSize: 36, transition: "top 0.38s, opacity 0.25s" }}
            aria-label={`${n}`}
            onClick={() => meld({ soort: "getal", n })}
          >
            {n}
          </button>
        );
      })}
      {pijl !== null && pijl <= tot && (
        <>
          <Driehoek x={midden(pijl, y0).x} y={midden(pijl, y0).y - D / 2 - 22} omlaag />
          <Driehoek x={midden(pijl, y0).x} y={midden(pijl, y0).y + D / 2 + 2} omlaag={false} />
        </>
      )}
      {klaarKnop && (
        <div className={s.vinkje} style={{ left: 490 - 60, top: 720 - ONDER + 6 }}>
          <IkoonKnop ikoon="vink" label="Klaar" knop="vinkje" kleur="blauw" style={{ width: 120, height: 116 }} onClick={() => meld({ soort: "klaar" })} />
        </div>
      )}
    </div>
  );
}
