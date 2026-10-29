"use client";

/**
 * Het kleurenrooster als hologram (27 oktober 2026, LESSENPLAN.md G2, G3 en
 * G6; Synthesis "Color Count"): 3 rijen van 7 lichtvisjes (of kwallen) in zes
 * kleuren, die Bliepo met één lichtstraal tevoorschijn tovert vóór de blauwe
 * ruimte. Zelfde eigenschappen en meldingen als het oude kleurenrooster
 * (`tellen-kleurrooster.tsx`, blijft bestaan), zodat het draaiboek hetzelfde
 * werkt:
 *
 * - telvraag: de cijfers 0–4 boven en 5–9 onder het rooster (`cijfers`,
 *   `modus: "cijfer"`); het gekozen cijfer kleurt mee met een driehoekje;
 * - samen tellen: de andere kleuren worden dof (`fel`) en de visjes krijgen
 *   om de beurt een nummer (`nummers`);
 * - een kleur kiezen: tik op een visje (`modus: "kleur"`); wat gekozen is
 *   krijgt een zacht pulserende lichtring (`rand`);
 * - zelf maken: lege plekken, verfbolletjes en het vinkje
 *   (`modus: "inkleuren"`).
 *
 * Meldingen: `kleur`, `cijfer`, `vakje`, `verf`, `klaar`. `golf` (een
 * teller): een rustige lichtgolf bij een goed antwoord.
 */

import { useEffect } from "react";
import type { Vlakbasis } from "../soort";
import { holoBasis, TX, GOED } from "../holo/basis";
import { HOLO_CANVAS, useHoloMotor } from "../holo/motor";
import { IkoonKnop } from "../ikonen";
import { HOLOKLEUR, maakDieren, type Kleur } from "./tellen-holo-tekenen";
import s from "./tellen-holo.module.css";

export type { Kleur };

export type TelRoosterProps = {
  /** 21 plekken, per rij van links naar rechts; `null` = lege plek. */
  vakjes: (Kleur | null)[];
  /** Lichtvisjes (Kleuren tellen) of kwallen (de toetsen). */
  voorwerp?: "visje" | "kwal";
  fel?: Kleur[] | null;
  rand?: Kleur[];
  nummers?: Record<number, number>;
  cijfers?: boolean;
  cijferMarkering?: { n: number; kleur: Kleur } | null;
  /** Cijfers die al gekozen zijn en niet klopten: dof. */
  cijfersUit?: number[];
  modus?: "kleur" | "cijfer" | "inkleuren" | null;
  verf?: Kleur[] | null;
  gekozenVerf?: Kleur | null;
  klaarKnop?: boolean;
  /** Teken het vinkje in het vlak zelf (de oude plek). Standaard uit: het staat op de vaste plek onder de zin van Bliepo (28 oktober 2026). */
  knoppenInVlak?: boolean;
  /** Ophogen = een lichtgolf over het rooster (goed antwoord). */
  golf?: number;
};

/* ---------- maten ---------- */

const CEL = 118;
const GAT = 12;
const X0 = (980 - (7 * CEL + 6 * GAT)) / 2;
const Y0 = 140;
const MIDDEN = 490;
const RMIDDEN_Y = Y0 + (3 * CEL + 2 * GAT) / 2;

const celMidden = (i: number) => ({ x: X0 + (i % 7) * (CEL + GAT) + CEL / 2, y: Y0 + Math.floor(i / 7) * (CEL + GAT) + CEL / 2 });
function cijferPlek(n: number) {
  return { x: MIDDEN + ((n % 5) - 2) * 140, y: n < 5 ? 22 : 548 };
}

/* ---------- de scène ---------- */

interface RoosterScene {
  zet(vakjes: (Kleur | null)[], voorwerp: "visje" | "kwal"): void;
  fel(vakjes: (Kleur | null)[], fel: Kleur[] | null): void;
  ringen(plekken: number[]): void;
  golfNu(): void;
}

function maakRoosterScene(Phaser: typeof import("phaser"), rustig: boolean) {
  const Basis = holoBasis(Phaser, rustig);
  class Rooster extends Basis implements RoosterScene {
    groep: import("phaser").GameObjects.Container | null = null;
    dieren: (import("phaser").GameObjects.Image | null)[] = Array(21).fill(null);
    plekken: import("phaser").GameObjects.Image[] = [];
    huidig: (Kleur | null)[] = Array(21).fill(null);
    soort: "visje" | "kwal" = "visje";
    ringLijst: import("phaser").GameObjects.Image[] = [];

    constructor() {
      super("tel-rooster");
    }

    maak() {
      maakDieren(this, "visje");
      maakDieren(this, "kwal");
      /* Een lege plek: een zacht gestippeld vierkantje. */
      this.canvasPlaatje("tel-leeg", CEL, CEL, (c) => {
        c.fillStyle = "rgba(20,60,120,0.32)";
        c.strokeStyle = "rgba(190,240,255,0.6)";
        c.lineWidth = 2.5;
        c.setLineDash([7, 6]);
        c.beginPath();
        c.roundRect(8, 8, CEL - 16, CEL - 16, 20);
        c.fill();
        c.stroke();
      });
      for (let i = 0; i < 21; i++) {
        const p = celMidden(i);
        this.plekken.push(this.plaats("tel-leeg", p.x, p.y).setVisible(false));
      }
    }

    dier(k: Kleur, x: number, y: number) {
      return this.plaats(`tel-${this.soort}-${k}-g`, x, y);
    }

    zet(vakjes: (Kleur | null)[], voorwerp: "visje" | "kwal") {
      const anders = vakjes.reduce((n, k, i) => n + (k !== this.huidig[i] ? 1 : 0), 0);
      const nieuweSoort = voorwerp !== this.soort;
      this.soort = voorwerp;
      vakjes.forEach((k, i) => this.plekken[i].setVisible(k === null));
      if (anders === 0 && !nieuweSoort) return;
      if (anders > 3 || nieuweSoort) {
        /* Een heel nieuw rooster: één brede lichtstraal tovert alles tegelijk tevoorschijn. */
        const oud = this.groep;
        if (oud) this.verdwijn(oud);
        const groep = this.add.container(MIDDEN, RMIDDEN_Y);
        this.dieren = vakjes.map((k, i) => {
          if (!k) return null;
          const p = celMidden(i);
          const d = this.dier(k, p.x - MIDDEN, p.y - RMIDDEN_Y);
          groep.add(d);
          return d;
        });
        this.groep = groep;
        if (vakjes.some(Boolean)) this.tover(groep, { vertraging: oud ? 120 : 0 });
      } else {
        /* Eén of een paar plekken: dat visje verschijnt of verdwijnt los. */
        if (!this.groep) this.groep = this.add.container(MIDDEN, RMIDDEN_Y);
        vakjes.forEach((k, i) => {
          if (k === this.huidig[i]) return;
          this.dieren[i]?.destroy();
          this.dieren[i] = null;
          if (!k) return;
          const p = celMidden(i);
          const d = this.dier(k, p.x - MIDDEN, p.y - RMIDDEN_Y);
          this.groep!.add(d);
          this.dieren[i] = d;
          if (!this.rustig) {
            d.setScale(0.45 / TX).setAlpha(0);
            this.tweens.add({ targets: d, scale: 1 / TX, alpha: 1, duration: 220, ease: "Back.easeOut" });
          }
        });
      }
      this.huidig = [...vakjes];
    }

    fel(vakjes: (Kleur | null)[], fel: Kleur[] | null) {
      vakjes.forEach((k, i) => {
        const d = this.dieren[i];
        if (!d || !k) return;
        const a = fel === null || fel.includes(k) ? 1 : 0.2;
        if (this.rustig) d.setAlpha(a);
        else this.tweens.add({ targets: d, alpha: a, duration: 260 });
      });
    }

    ringen(plekken: number[]) {
      this.ringLijst.forEach((r) => r.destroy());
      this.ringLijst = plekken.map((i) => {
        const p = celMidden(i);
        return this.selectieRing(p.x, p.y, 54);
      });
    }

    golfNu() {
      this.golf(MIDDEN, RMIDDEN_Y, GOED);
    }

    demo(ms: number) {
      const eind = performance.now() + ms;
      const kl: Kleur[] = ["rood", "blauw", "groen", "geel", "paars", "oranje"];
      let n = 0;
      const stap = () => {
        if (performance.now() > eind) return;
        n++;
        this.zet(Array.from({ length: 21 }, (_, i) => kl[(i + n) % 6]), n % 2 ? "visje" : "kwal");
        this.time.delayedCall(450, () => this.golfNu());
        this.time.delayedCall(900, stap);
      };
      stap();
    }
  }
  return Rooster as unknown as new () => import("phaser").Scene;
}

/* ---------- het vlak ---------- */

function Driehoek({ kleur, omlaag }: { kleur: string; omlaag: boolean }) {
  return (
    <svg className={s.driehoek} style={omlaag ? { top: 98, transform: "rotate(180deg)" } : { top: -20 }} viewBox="0 0 26 18" aria-hidden>
      <path d="M13 1L25 17H1z" fill={kleur} />
    </svg>
  );
}

export function TelRooster({
  vakjes,
  voorwerp = "visje",
  fel = null,
  rand = [],
  nummers = {},
  cijfers = false,
  cijferMarkering = null,
  cijfersUit = [],
  modus = null,
  verf = null,
  gekozenVerf = null,
  klaarKnop = false,
  knoppenInVlak = false,
  golf = 0,
  meld,
  schaal,
}: TelRoosterProps & Vlakbasis) {
  const { plek, scene } = useHoloMotor<RoosterScene>(schaal, maakRoosterScene);

  useEffect(() => {
    if (!scene) return;
    scene.zet(vakjes, voorwerp);
    scene.fel(vakjes, fel);
  }, [scene, vakjes, voorwerp, fel]);

  const randKey = rand.join(",");
  const vakKey = vakjes.join(",");
  useEffect(() => {
    if (!scene) return;
    const r = randKey ? randKey.split(",") : [];
    const v = vakKey.split(",");
    scene.ringen(v.flatMap((k, i) => (k && r.includes(k) ? [i] : [])));
  }, [scene, randKey, vakKey]);

  useEffect(() => {
    if (scene && golf > 0) scene.golfNu();
  }, [scene, golf]);

  /* Voor de automatische test: wat er in het rooster staat. */
  useEffect(() => {
    window.__phaser = { ...window.__phaser, rooster: vakjes } as typeof window.__phaser;
  }, [vakjes]);

  return (
    <div className={s.vlak}>
      <div ref={plek} style={HOLO_CANVAS} aria-hidden />

      {vakjes.map((k, i) => {
        const tikbaar = (modus === "kleur" && k !== null) || modus === "inkleuren";
        const p = celMidden(i);
        const nr = nummers[i];
        return (
          <button
            key={i}
            type="button"
            className={s.tik}
            data-plek={i}
            data-kleur={k ?? ""}
            disabled={!tikbaar}
            style={{ left: p.x - CEL / 2, top: p.y - CEL / 2, width: CEL, height: CEL, pointerEvents: tikbaar ? "auto" : "none" }}
            aria-label={k ? `${voorwerp === "kwal" ? "Kwal" : "Visje"}, ${k}` : "Lege plek"}
            onClick={() => {
              if (modus === "kleur" && k) meld({ soort: "kleur", kleur: k, index: i });
              else if (modus === "inkleuren") meld({ soort: "vakje", index: i });
            }}
          >
            {nr !== undefined && (
              <span key={nr} className={s.nummer} style={{ inset: 0 }}>
                {nr}
              </span>
            )}
          </button>
        );
      })}

      {cijfers &&
        Array.from({ length: 10 }, (_, n) => {
          const p = cijferPlek(n);
          const gemarkeerd = cijferMarkering?.n === n;
          const kleur = gemarkeerd ? HOLOKLEUR[cijferMarkering.kleur] : "#ffffff";
          const aan = modus === "cijfer" && !cijfersUit.includes(n);
          return (
            <button
              key={n}
              type="button"
              disabled={!aan}
              data-cijfer={n}
              className={`${s.cijfer} ${aan ? s.aan : ""} ${cijfersUit.includes(n) ? s.uit : ""}`}
              style={{ left: p.x - 65, top: p.y, color: kleur }}
              aria-label={`${n}`}
              onClick={() => meld({ soort: "cijfer", n })}
            >
              {n}
              {gemarkeerd && <Driehoek kleur={kleur} omlaag={n < 5} />}
            </button>
          );
        })}

      {verf &&
        verf.map((k, i) => (
          <button
            key={k}
            type="button"
            data-verf={k}
            className={`${s.verf} ${gekozenVerf === k ? s.verfGekozen : ""}`}
            style={{
              left: MIDDEN + (i - (verf.length - 1) / 2) * 140 - 42,
              top: 30,
              background: `radial-gradient(circle at 38% 34%, #ffffff 0 8%, ${HOLOKLEUR[k]} 45%, ${HOLOKLEUR[k]}cc 100%)`,
              boxShadow: gekozenVerf === k ? undefined : `0 0 16px ${HOLOKLEUR[k]}aa`,
            }}
            aria-label={`Verf, ${k}`}
            aria-pressed={gekozenVerf === k}
            onClick={() => meld({ soort: "verf", kleur: k })}
          />
        ))}

      {knoppenInVlak && klaarKnop && (
        <div className={s.vinkje} style={{ left: MIDDEN - 60, top: 556 }}>
          <IkoonKnop ikoon="vink" label="Klaar" knop="vinkje" kleur="blauw" style={{ width: 120, height: 120 }} onClick={() => meld({ soort: "klaar" })} />
        </div>
      )}
    </div>
  );
}
