"use client";

/**
 * Twee lantaarnpalen met lampjes (27 oktober 2026, LESSENPLAN.md A1, A3 en
 * A7; wereld Aarde), als hologram in Bliepo's ruimte. Vervangt in die lessen
 * de twee torens met ruimteschepen (`aftrekken-torens.tsx`, blijft bestaan
 * voor "Hetzelfde verschil"), met dezelfde bediening als Synthesis
 * "Difference Dimension":
 *
 * - elke paal heeft 10 plekken voor een lampje (een kolom van 10);
 * - de plusknop bij een paal zet er een lampje bij, de minknop doet het
 *   bovenste lampje uit;
 * - de schuif laat de palen tegen elkaar schuiven: lampjes op dezelfde
 *   hoogte doven tegen elkaar uit (met een zacht lichtje); wat blijft
 *   branden, is het verschil;
 * - Klaar (vinkje) en Hulp (vraagteken), en een scorebord met sommen.
 *
 * Meldingen: `{ soort: "erbij" | "eraf", kant, links, rechts }` bij elke tik,
 * `{ soort: "klaar" | "hulp", links, rechts }` bij de knoppen en
 * `{ soort: "gebotst", links, rechts }` als het tegen elkaar schuiven klaar
 * is. Nieuwe hoogtes neerzetten gaat met `links`/`rechts` en een nieuwe `zet`.
 */

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import type { Vlakbasis } from "../soort";
import { holoBasis, TX } from "../holo/basis";
import { HOLO_CANVAS, useHoloMotor } from "../holo/motor";
import { IkoonKnop } from "../ikonen";
import s from "./aftrekken-holo.module.css";

export type Kant = "links" | "rechts";

export type PalenProps = {
  links: number;
  rechts: number;
  /** Verhoog dit om `links` en `rechts` opnieuw neer te zetten (en het schuiven terug te draaien). */
  zet: number;
  /** Bij welke paal de plusknop staat. */
  erbij?: { links?: boolean; rechts?: boolean };
  /** Bij welke paal de minknop staat. */
  eraf?: { links?: boolean; rechts?: boolean };
  /** Hoger dan dit gaat een paal niet (standaard 10). */
  max?: { links?: number; rechts?: number };
  /** De getallen 1 tot en met 10 naast de lampjes. */
  cijfers?: boolean;
  /** De knoppen Klaar en Hulp in het midden. */
  knoppen?: { klaar?: boolean; hulp?: boolean } | null;
  /**
   * Teken Klaar en Hulp in het vlak zelf (de oude plek). Standaard uit: ze
   * staan op de vaste plek onder de zin van Bliepo (28 oktober 2026).
   */
  knoppenInVlak?: boolean;
  /** Meldt de stand (hoogtes) aan het lesscherm, voor het vinkje op de vaste plek. */
  standBron?: (geef: () => Record<string, unknown>) => void;
  /** De schuif waarmee de palen tegen elkaar schuiven. */
  schuif?: boolean;
  /** Een scorebord met sommen in het midden; `null` is een leeg vakje. */
  lijst?: (string | null)[] | null;
  /** Of Bliepo de palen tevoorschijn tovert (alleen de eerste keer). */
  binnen?: boolean;
};

/** De kleuren van de twee palen (de lampjes en hun gloed). */
export const ORANJE_LAMP = "#ffab4a";
export const PAARS_LAMP = "#c99bff";
const KLEUR: Record<Kant, number> = { links: 0xffab4a, rechts: 0xc99bff };
const KLEURTEKST: Record<Kant, string> = { links: ORANJE_LAMP, rechts: PAARS_LAMP };

const X: Record<Kant, number> = { links: 300, rechts: 680 };
const ONDER = 606; // midden van het onderste lampje
const STAP = 46;
const NAAR_BINNEN = 135;
const PLUS_Y = 252;
const MIN_Y = 396;
const KNOP_X: Record<Kant, number> = { links: 148, rechts: 832 };
/* De schuif staat onderaan tussen de palen; groot genoeg om op de telefoon te pakken. */
const SCHUIF = { x: 345, y: 668, b: 290, knop: 92 };

const lampY = (i: number) => ONDER - i * STAP;

/* ---------- de scène ---------- */

interface PalenScene {
  zetHoogtes(h: Record<Kant, number>, zacht: boolean): void;
  bots(): void;
  terug(): void;
  toverPalen(): void;
}

function maakPalenScene(Phaser: typeof import("phaser"), rustig: boolean) {
  const Basis = holoBasis(Phaser, rustig);
  class Palen extends Basis implements PalenScene {
    groep: Record<Kant, import("phaser").GameObjects.Container | null> = { links: null, rechts: null };
    lampen: Record<Kant, import("phaser").GameObjects.Image[]> = { links: [], rechts: [] };
    hoog: Record<Kant, number> = { links: 0, rechts: 0 };
    gebotst = false;

    constructor() {
      super("palen");
    }

    maak() {
      for (const kant of ["links", "rechts"] as Kant[]) {
        const hex = KLEURTEKST[kant];
        /* De paal: een slanke lichtstreep met een lantaarnkapje bovenop en een voet. */
        this.canvasPlaatje(`paal-${kant}`, 70, 540, (c) => {
          const g = c.createLinearGradient(0, 60, 0, 520);
          g.addColorStop(0, "rgba(255,240,210,0.55)");
          g.addColorStop(1, "rgba(255,240,210,0.2)");
          c.fillStyle = g;
          c.fillRect(32, 58, 6, 456);
          c.strokeStyle = hex;
          c.lineWidth = 3;
          c.lineJoin = "round";
          /* kapje */
          c.fillStyle = "rgba(255,230,180,0.18)";
          c.beginPath();
          c.moveTo(12, 40);
          c.lineTo(35, 16);
          c.lineTo(58, 40);
          c.closePath();
          c.fill();
          c.stroke();
          c.beginPath();
          c.roundRect(18, 40, 34, 18, 5);
          c.fill();
          c.stroke();
          c.beginPath();
          c.arc(35, 12, 5, 0, Math.PI * 2);
          c.stroke();
          /* voet */
          c.beginPath();
          c.roundRect(12, 514, 46, 12, 6);
          c.fill();
          c.stroke();
        });
        this.bak(`paal-${kant}`, `paal-${kant}-gloed`, KLEUR[kant]);
        /* Een brandend lampje: helder en egaal, goed te tellen. */
        this.canvasPlaatje(`lamp-${kant}`, 40, 40, (c) => {
          const g = c.createRadialGradient(16, 15, 2, 20, 20, 19);
          g.addColorStop(0, "#ffffff");
          g.addColorStop(0.45, kant === "links" ? "#ffe2b8" : "#eadcff");
          g.addColorStop(1, hex);
          c.fillStyle = g;
          c.beginPath();
          c.arc(20, 20, 18, 0, Math.PI * 2);
          c.fill();
        });
        this.bak(`lamp-${kant}`, `lamp-${kant}-gloed`, KLEUR[kant]);
      }
      /* Een lege plek: een gestippeld rondje. */
      this.canvasPlaatje("lamp-leeg", 40, 40, (c) => {
        c.strokeStyle = "rgba(255,236,200,0.45)";
        c.lineWidth = 2;
        c.setLineDash([4, 4]);
        c.beginPath();
        c.arc(20, 20, 16, 0, Math.PI * 2);
        c.stroke();
      });
      for (const kant of ["links", "rechts"] as Kant[]) {
        const gr = this.add.container(X[kant], 0);
        gr.add(this.plaats(`paal-${kant}-gloed`, 0, ONDER - 224));
        for (let i = 0; i < 10; i++) gr.add(this.plaats("lamp-leeg", 0, lampY(i)));
        this.groep[kant] = gr;
      }
    }

    toverPalen() {
      for (const kant of ["links", "rechts"] as Kant[]) {
        const gr = this.groep[kant];
        if (gr) this.tover(gr, { vertraging: kant === "links" ? 0 : 120 });
      }
    }

    lampAan(kant: Kant, i: number, zacht: boolean) {
      const gr = this.groep[kant]!;
      const l = this.plaats(`lamp-${kant}-gloed`, 0, lampY(i));
      gr.add(l);
      this.lampen[kant][i] = l;
      if (zacht && !this.rustig) {
        l.setScale(0.3 / TX).setAlpha(0.3);
        this.tweens.add({ targets: l, scale: 1 / TX, alpha: 1, duration: 220, ease: "Back.easeOut" });
      }
    }

    lampUit(kant: Kant, i: number, zacht: boolean) {
      const l = this.lampen[kant][i];
      if (!l) return;
      delete this.lampen[kant][i];
      if (zacht && !this.rustig) this.tweens.add({ targets: l, alpha: 0, scale: 0.4 / TX, duration: 220, onComplete: () => l.destroy() });
      else l.destroy();
    }

    zetHoogtes(h: Record<Kant, number>, zacht: boolean) {
      for (const kant of ["links", "rechts"] as Kant[]) {
        const was = this.hoog[kant];
        for (let i = was; i < h[kant]; i++) this.lampAan(kant, i, zacht);
        for (let i = was - 1; i >= h[kant]; i--) this.lampUit(kant, i, zacht);
        this.hoog[kant] = h[kant];
      }
    }

    /** De palen schuiven tegen elkaar; lampjes op dezelfde hoogte doven tegen elkaar uit. */
    bots() {
      this.gebotst = true;
      const laag = Math.min(this.hoog.links, this.hoog.rechts);
      const duur = this.rustig ? 1 : 520;
      this.tweens.add({ targets: this.groep.links, x: X.links + NAAR_BINNEN, duration: duur, ease: "Cubic.easeIn" });
      this.tweens.add({ targets: this.groep.rechts, x: X.rechts - NAAR_BINNEN, duration: duur, ease: "Cubic.easeIn" });
      this.time.delayedCall(duur + 60, () => {
        for (let i = 0; i < laag; i++) {
          const wacht = this.rustig ? 0 : i * 55;
          this.time.delayedCall(wacht, () => {
            for (const kant of ["links", "rechts"] as Kant[]) {
              const l = this.lampen[kant][i];
              if (!l) continue;
              delete this.lampen[kant][i];
              this.tweens.add({ targets: l, alpha: 0, duration: this.rustig ? 1 : 260, onComplete: () => l.destroy() });
            }
            /* Een zacht lichtje waar ze elkaar raakten. */
            if (!this.rustig) {
              const flits = this.plaats("holo-ring", 490, lampY(i)).setScale(0.15 / TX).setTint(0xfff2c8);
              this.tweens.add({ targets: flits, scale: 0.55 / TX, alpha: { from: this.gloed.flits, to: 0 }, duration: 380, onComplete: () => flits.destroy() });
            }
          });
        }
        /* Wat blijft branden, krijgt een rustige lichtgolf. */
        const meer: Kant | null = this.hoog.links > this.hoog.rechts ? "links" : this.hoog.rechts > this.hoog.links ? "rechts" : null;
        if (meer)
          this.time.delayedCall(this.rustig ? 0 : laag * 55 + 300, () => {
            const x = meer === "links" ? X.links + NAAR_BINNEN : X.rechts - NAAR_BINNEN;
            this.golf(x, lampY((laag + this.hoog[meer] - 1) / 2), KLEUR[meer]);
          });
      });
    }

    /** Terug naar de beginplek (een nieuwe `zet`). */
    terug() {
      if (!this.gebotst) return;
      this.gebotst = false;
      this.groep.links?.setX(X.links);
      this.groep.rechts?.setX(X.rechts);
    }

    /** Opnieuw opbouwen: alle lampjes weg, dan de nieuwe hoogtes. */
    nieuw(h: Record<Kant, number>) {
      for (const kant of ["links", "rechts"] as Kant[]) {
        this.lampen[kant].forEach((l) => l?.destroy());
        this.lampen[kant] = [];
        this.hoog[kant] = 0;
      }
      this.terug();
      this.zetHoogtes(h, false);
    }

    demo(ms: number) {
      const eind = performance.now() + ms;
      let k = 0;
      const stap = () => {
        if (performance.now() > eind) return;
        if (k % 3 === 2) {
          this.bots();
        } else {
          this.nieuw({ links: 0, rechts: 0 });
          this.zetHoogtes({ links: 3 + (k % 5), rechts: 2 + (k % 4) }, true);
        }
        k++;
        this.time.delayedCall(900, stap);
      };
      stap();
    }
  }
  return Palen as unknown as new () => import("phaser").Scene;
}

/* ---------- iconen ---------- */

function Teken({ min }: { min?: boolean }) {
  return (
    <svg viewBox="0 0 44 44" aria-hidden>
      <path d={min ? "M8 22h28" : "M22 8v28M8 22h28"} stroke="#ffffff" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

/* ---------- het vlak ---------- */

type Fase = "rust" | "schuift" | "klaar";

export function AftrekkenHoloPalen({
  links,
  rechts,
  zet,
  erbij = {},
  eraf = {},
  max = {},
  cijfers = false,
  knoppen = null,
  knoppenInVlak = false,
  standBron,
  schuif = false,
  lijst = null,
  binnen = false,
  meld,
  schaal,
}: PalenProps & Vlakbasis) {
  const { plek, scene } = useHoloMotor<PalenScene & { nieuw(h: Record<Kant, number>): void }>(schaal, maakPalenScene);
  const [hoogte, setHoogte] = useState({ links, rechts });
  useEffect(() => {
    standBron?.(() => ({ links: hoogte.links, rechts: hoogte.rechts }));
  }, [standBron, hoogte]);
  const [vorigeZet, setVorigeZet] = useState(zet);
  const [fase, setFase] = useState<Fase>("rust");
  const [knop, setKnop] = useState(0);
  const [sleept, setSleept] = useState(false);
  const spoor = useRef<HTMLDivElement>(null);
  /* Welke `zet` al in de scène staat; bij een nieuwe `zet` wordt alles opnieuw opgebouwd. */
  const toegepast = useRef<number | null>(null);
  const getoverd = useRef(false);

  if (zet !== vorigeZet) {
    setVorigeZet(zet);
    setHoogte({ links, rechts });
    setFase("rust");
    setKnop(0);
  }

  useEffect(() => {
    if (!scene) return;
    if (toegepast.current !== vorigeZet) {
      scene.nieuw(hoogte);
      toegepast.current = vorigeZet;
      if (binnen && !getoverd.current) {
        getoverd.current = true;
        scene.toverPalen();
      }
    } else {
      scene.zetHoogtes(hoogte, true);
    }
    window.__phaser = { ...window.__phaser, links: hoogte.links, rechts: hoogte.rechts };
  }, [scene, hoogte, binnen, vorigeZet]);

  const bezig = fase !== "rust";
  const verander = (kant: Kant, d: 1 | -1) => {
    if (bezig) return;
    const nu = hoogte[kant] + d;
    if (nu < 0 || nu > Math.min(10, max[kant] ?? 10)) return;
    const nieuw = { ...hoogte, [kant]: nu };
    setHoogte(nieuw);
    meld({ soort: d > 0 ? "erbij" : "eraf", kant, ...nieuw });
  };

  const bots = () => {
    if (bezig) return;
    setKnop(1);
    setFase("schuift");
    const stand = { ...hoogte };
    scene?.bots();
    const laag = Math.min(stand.links, stand.rechts);
    setTimeout(() => setFase("klaar"), 700);
    setTimeout(() => meld({ soort: "gebotst", ...stand }), 1100 + laag * 55);
  };

  const plekKnop = (e: ReactPointerEvent) => {
    const r = spoor.current?.getBoundingClientRect();
    if (!r) return 0;
    const b = (SCHUIF.b - SCHUIF.knop - 8) * schaal;
    return Math.max(0, Math.min(1, (e.clientX - r.left - (SCHUIF.knop / 2 + 4) * schaal) / b));
  };

  return (
    <div className={s.vlak}>
      <div ref={plek} style={HOLO_CANVAS} aria-hidden />

      {(["links", "rechts"] as Kant[]).map((kant) => (
        <div key={kant}>
          {erbij[kant] && !bezig && (
            <button
              type="button"
              className={`${s.rond} ${s.groot}`}
              data-knop={`erbij-${kant}`}
              style={{ left: KNOP_X[kant], top: PLUS_Y, ["--kleur" as string]: KLEURTEKST[kant] }}
              aria-label={`Lampje erbij bij de ${kant === "links" ? "oranje" : "paarse"} paal`}
              onClick={() => verander(kant, 1)}
            >
              <Teken />
            </button>
          )}
          {eraf[kant] && !bezig && (
            <button
              type="button"
              className={`${s.rond} ${s.groot}`}
              data-knop={`eraf-${kant}`}
              style={{ left: KNOP_X[kant], top: MIN_Y, ["--kleur" as string]: KLEURTEKST[kant] }}
              aria-label={`Lampje uit bij de ${kant === "links" ? "oranje" : "paarse"} paal`}
              onClick={() => verander(kant, -1)}
            >
              <Teken min />
            </button>
          )}
          {cijfers &&
            !bezig &&
            !schuif &&
            Array.from({ length: 10 }, (_, i) => (
              <div
                key={i}
                className={`${s.cijfer} ${s.schaduw}`}
                style={{ left: X[kant] + (kant === "links" ? 40 : -40), top: lampY(i), color: KLEURTEKST[kant], opacity: i < hoogte[kant] ? 1 : 0.4 }}
              >
                {i + 1}
              </div>
            ))}
        </div>
      ))}

      <span className="sr-only" aria-live="polite">
        Oranje paal {hoogte.links}, paarse paal {hoogte.rechts}
      </span>

      {lijst && (
        <div className={s.lijst} style={{ left: 490 - 82, top: 150, width: 164 }}>
          {lijst.map((som, i) => (
            <div key={`${i}-${som ?? ""}`} className={s.lijstvak} data-vol={!!som}>
              {som ?? ""}
            </div>
          ))}
        </div>
      )}

      {knoppenInVlak && knoppen && !bezig && (
        <div className={s.knoppen} style={{ left: 490, top: lijst ? 520 : 470 }}>
          {knoppen.klaar && <IkoonKnop ikoon="vink" label="Klaar" knop="klaar" kleur="blauw" className={s.ikoonGroot} onClick={() => meld({ soort: "klaar", ...hoogte })} />}
          {knoppen.hulp && <IkoonKnop ikoon="vraag" label="Hulp" knop="hulp" className={s.ikoonGroot} onClick={() => meld({ soort: "hulp", ...hoogte })} />}
        </div>
      )}

      {schuif && fase === "rust" && (
        <div
          ref={spoor}
          className={s.schuif}
          data-knop="schuif"
          style={{ left: SCHUIF.x, top: SCHUIF.y - 50, width: SCHUIF.b }}
          onClick={(e) => {
            /* Tikken op de schuif werkt ook (tikken mag altijd in plaats van slepen). */
            if (e.target === e.currentTarget) bots();
          }}
        >
          <svg className={s.schuifpijl} width="34" height="20" viewBox="0 0 34 20" aria-hidden>
            <path d="M2 10h28M22 3l8 7-8 7" stroke="#ffe6a8" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div
            role="slider"
            tabIndex={0}
            aria-label="Laat de palen tegen elkaar schuiven"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(knop * 100)}
            className={`${s.schuifknop} ${sleept ? "" : s.terug}`}
            style={{ left: 4 + knop * (SCHUIF.b - SCHUIF.knop - 8), width: SCHUIF.knop, height: SCHUIF.knop }}
            onPointerDown={(e) => {
              if (bezig) return;
              e.currentTarget.setPointerCapture(e.pointerId);
              setSleept(true);
            }}
            onPointerMove={(e) => {
              if (sleept) setKnop(plekKnop(e));
            }}
            onPointerUp={(e) => {
              if (!sleept) return;
              setSleept(false);
              if (plekKnop(e) > 0.8) bots();
              else setKnop(0);
            }}
            onPointerCancel={() => {
              setSleept(false);
              if (!bezig) setKnop(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "Enter" || e.key === " " || e.key === "End") {
                e.preventDefault();
                bots();
              }
            }}
          />
        </div>
      )}
    </div>
  );
}
