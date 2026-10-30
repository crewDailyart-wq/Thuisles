"use client";

/**
 * De sterrenmachine als hologram (27 oktober 2026, LESSENPLAN.md G12, O17,
 * O18, O20; wereld Universum). Vervangt in die lessen de bundelmachine
 * (`tientallen-bundelmachine.tsx`) en de tienenmachine
 * (`optellen100-machine.tsx`); die bestanden blijven bestaan.
 *
 * Onderaan de machine: een knop met een ster (1 erbij) en/of een knop met een
 * lichtbol (10 erbij), en eventueel wissen, het handje (hulp) en het vinkje
 * (klaar). Elke tik tovert een ster (of lichtbol) in de ruimte. Bij de tiende
 * losse ster kruipen de tien sterren vanzelf samen tot één lichtbol (het
 * "wauw"-moment); bij tien lichtbollen worden die samen één grote lichtbol van
 * honderd. Het draaiboek zet alleen `aantal`; het vlak rekent zelf uit
 * hoeveel lichtbollen en losse sterren dat zijn.
 *
 * Meldingen (alleen als `actief` aan staat): `{ soort: "plus", waarde }`,
 * `{ soort: "wis" }`, `{ soort: "hand" }`, `{ soort: "klaar" }`.
 */

import { useEffect } from "react";
import type { Vlakbasis } from "../soort";
import { holoBasis, WARM } from "../holo/basis";
import { HOLO_CANVAS, useHoloMotor } from "../holo/motor";
import { IkoonKnop } from "../ikonen";
import { lossePlekken, maakSterPlaatjes, testHaak } from "./tientallen-holo-basis";
import s from "./tientallen-holo.module.css";

export type SterMachineProps = {
  /** Hoeveel sterren er in totaal zijn (0 tot en met 100). */
  aantal: number;
  /** Welke plusknoppen er zijn (leeg = geen machine). */
  knoppen: (1 | 10)[];
  actief?: boolean;
  wissen?: boolean;
  /** Het handje: "laat me een makkelijkere manier zien" / hulp. */
  hand?: boolean;
  /** Het vinkje: klaar met bouwen. */
  klaar?: boolean;
  /** Teken het handje en het vinkje in het vlak zelf (de oude plek). Standaard uit: ze staan op de vaste plek onder de zin van Bliepo (28 oktober 2026). */
  knoppenInVlak?: boolean;
  /** Een warme ring om deze knop. */
  wijs?: 1 | 10 | null;
  /** De machine staat op slot (dof, met een slotje). */
  slot?: boolean;
};

export type SterMachineMelding = { soort: "plus"; waarde: 1 | 10 } | { soort: "wis" } | { soort: "hand" } | { soort: "klaar" };

/* ---------- plekken (punten van het vlak) ---------- */

/** Lichtbollen: twee rijen van vijf, een klein beetje los (vaste verschuiving). */
const BOLLEN = Array.from({ length: 10 }, (_, i) => {
  const jx = [6, -8, 4, -5, 9, -6, 7, -4, 5, -9][i];
  const jy = [-6, 8, -9, 5, -4, 7, -5, 9, -7, 4][i];
  return { x: 175 + (i % 5) * 118 + jx, y: 228 + Math.floor(i / 5) * 138 + jy };
});
/** Losse sterren: rechts, los over elkaar heen verspreid (nooit overlappend). */
const LOSSE = lossePlekken(10, { x: 750, y: 175, b: 175, h: 330 }, 64, 17);
const GROOT = { x: 330, y: 330 };

/* ---------- de scène ---------- */

interface MachineScene {
  toon(aantal: number): void;
}

function maakScene() {
  return (Phaser: typeof import("phaser"), rustig: boolean) => {
    const Basis = holoBasis(Phaser, rustig);
    type Img = import("phaser").GameObjects.Image;
    class Machine extends Basis implements MachineScene {
      huidig = 0;
      losse: Img[] = [];
      bollen: Img[] = [];
      groot: Img | null = null;
      /** Sterren of lichtbollen die net samenkruipen. */
      vliegend: Img[] = [];
      bezig = false;
      /** Wat het draaiboek het laatst vroeg (wordt na een animatie bijgewerkt). */
      gevraagd = 0;

      constructor() {
        super("sterrenmachine");
      }

      maak() {
        maakSterPlaatjes(this);
      }

      /** Alles in één keer goed neerzetten (geen animatie). */
      opnieuw(n: number) {
        const weg = [...this.losse, ...this.bollen, ...this.vliegend, ...(this.groot ? [this.groot] : [])];
        this.tweens.killTweensOf(weg);
        weg.forEach((o) => o.destroy());
        this.losse = [];
        this.bollen = [];
        this.vliegend = [];
        this.groot = null;
        const h = Math.floor(n / 100);
        const t = Math.floor((n % 100) / 10);
        const e = n % 10;
        if (h > 0) this.groot = this.plaats("bol100-g", GROOT.x, GROOT.y);
        for (let i = 0; i < t; i++) this.bollen.push(this.plaats("bol-g", BOLLEN[i].x + (h ? 260 : 0), BOLLEN[i].y));
        for (let i = 0; i < e; i++) this.losse.push(this.plaats("ster-g", LOSSE[i].x, LOSSE[i].y));
        this.huidig = n;
        this.bezig = false;
      }

      /** Rustig laten verschijnen; één voorwerp met de lichtstraal, meer tegelijk met een korte vervaging. */
      verschijn(o: Img, een: boolean, k = 0) {
        if (een) this.tover(o);
        else {
          const sc = o.scaleX;
          o.setAlpha(0).setScale(sc * 0.6);
          this.tweens.add({ targets: o, alpha: 1, scale: sc, delay: k * 35, duration: rustig ? 1 : 200, ease: "Back.easeOut" });
        }
      }

      toon(n: number) {
        this.gevraagd = Math.max(0, Math.min(100, Math.round(n)));
        /* Tijdens het samenkruipen wachten; daarna wordt het bijgewerkt. */
        if (!this.bezig) this.verwerk();
      }

      /** Klaar met samenkruipen: verder met wat er intussen gevraagd is. */
      klaarMet(n: number) {
        this.huidig = n;
        this.bezig = false;
        this.vliegend = [];
        this.verwerk();
      }

      verwerk() {
        const n = this.gevraagd;
        const oud = this.huidig;
        if (n === oud) return;
        const h = Math.floor(n / 100);
        const t = Math.floor((n % 100) / 10);
        const e = n % 10;

        /* Het wauw-moment: de tiende losse ster, en de tien kruipen samen tot één lichtbol. */
        if (n === oud + 1 && e === 0 && h === 0 && this.losse.length === 9 && !rustig) {
          this.bezig = true;
          const tiende = this.plaats("ster-g", LOSSE[9].x, LOSSE[9].y);
          this.tover(tiende);
          const alle = [...this.losse, tiende];
          this.losse = [];
          this.vliegend = alle;
          const doel = BOLLEN[t - 1];
          this.time.delayedCall(520, () => {
            this.tweens.add({
              targets: alle,
              x: doel.x,
              y: doel.y,
              scale: 0.35 / 2,
              duration: 620,
              ease: "Cubic.easeInOut",
              onComplete: () => {
                alle.forEach((o) => o.destroy());
                const bol = this.plaats("bol-g", doel.x, doel.y);
                const sc = bol.scaleX;
                bol.setScale(sc * 0.4);
                this.tweens.add({ targets: bol, scale: sc, duration: 300, ease: "Back.easeOut" });
                this.golf(doel.x, doel.y, WARM);
                this.bollen.push(bol);
                this.klaarMet(n);
              },
            });
          });
          return;
        }

        /* Tien lichtbollen worden samen één grote lichtbol van honderd. */
        if (n === oud + 10 && n === 100 && this.bollen.length === 9 && !rustig) {
          this.bezig = true;
          const tiende = this.plaats("bol-g", BOLLEN[9].x, BOLLEN[9].y);
          this.tover(tiende);
          const alle = [...this.bollen, tiende];
          this.bollen = [];
          this.vliegend = alle;
          this.time.delayedCall(560, () => {
            this.tweens.add({
              targets: alle,
              x: GROOT.x,
              y: GROOT.y,
              scale: 0.3 / 2,
              duration: 700,
              ease: "Cubic.easeInOut",
              onComplete: () => {
                alle.forEach((o) => o.destroy());
                this.groot = this.plaats("bol100-g", GROOT.x, GROOT.y);
                const sc = this.groot.scaleX;
                this.groot.setScale(sc * 0.4);
                this.tweens.add({ targets: this.groot, scale: sc, duration: 360, ease: "Back.easeOut" });
                this.golf(GROOT.x, GROOT.y, WARM);
                this.klaarMet(n);
              },
            });
          });
          return;
        }

        /* Erbij: alleen wat nieuw is verschijnt; minder of een sprong: opnieuw neerzetten. */
        const oudH = Math.floor(oud / 100);
        const oudT = Math.floor((oud % 100) / 10);
        const oudE = oud % 10;
        if (n > oud && h === oudH && t >= oudT && e >= oudE) {
          const nieuweBollen = t - oudT;
          const nieuweSterren = e - oudE;
          const een = nieuweBollen + nieuweSterren === 1;
          for (let i = oudT; i < t; i++) {
            const o = this.plaats("bol-g", BOLLEN[i].x + (h ? 260 : 0), BOLLEN[i].y);
            this.bollen.push(o);
            this.verschijn(o, een, i - oudT);
          }
          for (let i = oudE; i < e; i++) {
            const o = this.plaats("ster-g", LOSSE[i].x, LOSSE[i].y);
            this.losse.push(o);
            this.verschijn(o, een, i - oudE);
          }
          this.huidig = n;
          return;
        }
        this.opnieuw(n);
      }

      demo(ms: number) {
        const eind = performance.now() + ms;
        let n = this.huidig >= 99 ? 0 : this.huidig;
        const stap = () => {
          if (performance.now() > eind) return;
          n = n >= 99 ? 0 : n + 1;
          this.toon(n);
          this.time.delayedCall(n % 10 === 0 ? 1300 : 160, stap);
        };
        stap();
      }
    }
    return Machine as unknown as new () => import("phaser").Scene;
  };
}

/* ---------- iconen op de knoppen ---------- */

function SterIcoon() {
  const punten = Array.from({ length: 10 }, (_, i) => {
    const hoek = -Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 === 0 ? 22 : 10;
    return `${(26 + r * Math.cos(hoek)).toFixed(1)},${(27 + r * Math.sin(hoek)).toFixed(1)}`;
  }).join(" ");
  return (
    <svg viewBox="0 0 52 52" aria-hidden>
      <polygon points={punten} fill="#ffe79a" stroke="#ffffff" strokeWidth={2} strokeLinejoin="round" />
    </svg>
  );
}

function BolIcoon() {
  return (
    <svg viewBox="0 0 52 52" aria-hidden>
      <circle cx={26} cy={26} r={23} fill="rgba(110,90,230,0.85)" stroke="#e6deff" strokeWidth={2.5} />
      {Array.from({ length: 10 }, (_, i) => (
        <polygon key={i} points={sterPunten(26 + ((i % 5) - 2) * 8, i < 5 ? 21 : 31, 3.8)} fill="#fff3c0" strokeLinejoin="round" />
      ))}
    </svg>
  );
}

function HandIcoon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path
        d="M8 11V5.5a1.5 1.5 0 0 1 3 0V10m0-5.5V4a1.5 1.5 0 0 1 3 0v6m0-4.5a1.5 1.5 0 0 1 3 0V12m0-3a1.5 1.5 0 0 1 3 0v5.5c0 4-2.6 7-6.6 7H12c-2.3 0-3.6-1-4.8-2.6L4.4 14.6a1.6 1.6 0 0 1 2.4-2.1L8 13.8"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Slotje() {
  return (
    <span className={s.slotje} aria-hidden>
      <svg viewBox="0 0 24 24">
        <rect x={5} y={11} width={14} height={10} rx={2} fill="#ffd36e" />
        <path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="#ffd36e" strokeWidth={2.4} />
      </svg>
    </span>
  );
}

/* ---------- het vlak ---------- */

export function SterMachine({ aantal, knoppen, actief = false, wissen = false, hand = false, klaar = false, knoppenInVlak = false, wijs = null, slot = false, meld, schaal }: SterMachineProps & Vlakbasis) {
  const { plek, scene } = useHoloMotor<MachineScene>(schaal, maakScene());

  useEffect(() => {
    scene?.toon(aantal);
    testHaak({ aantal });
  }, [scene, aantal]);

  const kan = actief && !slot;

  return (
    <div className={s.vlak}>
      <div ref={plek} style={HOLO_CANVAS} aria-hidden />

      {(knoppen.length > 0 || wissen || (knoppenInVlak && (hand || klaar))) && (
        <div className={s.machine}>
          {wissen && <IkoonKnop ikoon="opnieuw" label="Wissen" knop="wis" className={s.ikoon} disabled={!actief} onClick={() => meld({ soort: "wis" })} />}
          {knoppen.map((k) => (
            <button
              key={k}
              type="button"
              data-knop={`plus${k}`}
              aria-label={k === 1 ? "Eén ster erbij" : "Een lichtbol van tien erbij"}
              className={`${s.plus} ${wijs === k ? s.wijs : ""} ${slot ? s.dof : ""}`}
              disabled={!kan}
              onClick={() => meld({ soort: "plus", waarde: k })}
            >
              {k === 1 ? <SterIcoon /> : <BolIcoon />}
              <span>+{k}</span>
              {slot && <Slotje />}
            </button>
          ))}
          {knoppenInVlak && hand && (
            <button type="button" data-knop="hand" aria-label="Hulp" className={`${s.plus} ${s.ikoon}`} disabled={!actief} onClick={() => meld({ soort: "hand" })} style={{ color: "#ffe9b0" }}>
              <HandIcoon />
            </button>
          )}
          {knoppenInVlak && klaar && <IkoonKnop ikoon="vink" label="Klaar" knop="klaar" kleur="blauw" className={s.ikoon} disabled={!actief} onClick={() => meld({ soort: "klaar" })} />}
        </div>
      )}
    </div>
  );
}

/** De punten van een ster met vijf punten (zelfde vorm als `sterPad`), voor SVG. */
function sterPunten(cx: number, cy: number, r: number) {
  return Array.from({ length: 10 }, (_, j) => {
    const hoek = -Math.PI / 2 + (j * Math.PI) / 5;
    const rr = j % 2 === 0 ? r : r * 0.46;
    return `${(cx + rr * Math.cos(hoek)).toFixed(1)},${(cy + rr * Math.sin(hoek)).toFixed(1)}`;
  }).join(" ");
}

/** Voor de kaart aan het eind: één ster als SVG (zoals `tekenSter`: licht hart, witte rand). */
export function KaartSter({ x, y, r, kleur = "#ffd76e" }: { x: number; y: number; r: number; kleur?: string }) {
  return <polygon points={sterPunten(x, y, r)} fill={kleur} stroke="#ffffff" strokeWidth={Math.max(1, r * 0.12)} strokeLinejoin="round" />;
}

/** Voor de kaart aan het eind: een lichtbol als SVG (244 × 190), met tien sterren zoals in de les. */
export function KaartLichtbol({ x = 122, y = 95, r = 60 }: { x?: number; y?: number; r?: number }) {
  const stap = r * 0.36;
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="rgba(110,90,230,0.85)" stroke="#e6deff" strokeWidth={Math.max(2, r * 0.05)} />
      {Array.from({ length: 10 }, (_, i) => (
        <KaartSter key={i} x={x + ((i % 5) - 2) * stap} y={y + (i < 5 ? -1 : 1) * stap * 0.62} r={r * 0.17} kleur="#ffe79a" />
      ))}
    </g>
  );
}

/** Voor de kaart aan het eind: een sterrenbeeld van tien (2 × 5 sterren in een dun lichtkader), `x`/`onder` = linkerkolom, onderste rij. */
export function KaartSterrenbeeld({ x, onder, stap = 24, aantal = 10, kleur = "#ffe79a", kader = true }: { x: number; onder: number; stap?: number; aantal?: number; kleur?: string; kader?: boolean }) {
  const r = stap * 0.42;
  return (
    <g>
      {kader && (
        <rect x={x - stap * 0.6} y={onder - stap * 4.6} width={stap * 2.2} height={stap * 5.2} rx={stap * 0.4} fill="rgba(60,40,150,0.3)" stroke="rgba(215,205,255,0.8)" strokeWidth={2} />
      )}
      {Array.from({ length: aantal }, (_, i) => (
        <KaartSter key={i} x={x + (i % 2) * stap} y={onder - Math.floor(i / 2) * stap} r={r} kleur={kleur} />
      ))}
    </g>
  );
}
