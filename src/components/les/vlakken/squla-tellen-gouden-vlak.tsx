"use client";

/**
 * Het speelvlak van de GOUDEN LES TELLEN (squla-tellen-fruit-1-gouden, 9 november 2026; BOUWREGELS hoofdstuk 15).
 * Een nieuw vlak naast SqulaTelVlak (squla-tellen-holo.tsx); dat vlak en de oude les blijven zoals ze zijn.
 *
 * Het fruit staat in rijen van 5 (dezelfde plekken als in de oude les: `indeling` uit squla-tellen-holo). Wat dit vlak
 * erbij heeft, komt uit het draaiboek Tellen (Color Count, SYNTHESIS-ANALYSE/DRAAIBOEKEN-NIEUW/tellen.md):
 *   - `nummers`: per stuk fruit het nummer dat erbij staat (0 = geen). Na goed staan alle nummers er tegelijk, in
 *     leesvolgorde; bij samen natellen komt er steeds 1 bij; bij samen tellen na de 2e fout in de volgorde van het tikken.
 *     Het nummer staat in de kleur van het fruit (BOUWREGELS 2.1, 2.2).
 *   - `tikbaar`: elk stuk fruit zonder nummer is een (onzichtbare) knop; een tik meldt `{ soort: "telTik", index }`.
 *     Een stuk fruit met een nummer telt niet nog een keer (draaiboek §3 A.3: dubbel tellen kan niet).
 *   - `hand`: het hulphandje (BOUWREGELS 15.19) wijst naar dit stuk fruit; het komt vanzelf, nooit als knop.
 *   - `goed` / `fout`: tellers; ophogen = lichtgolf of zacht schudden.
 * Geen rondjes (het draaiboek heeft ze niet; BOUWREGELS 7.8d: wat al genoemd is blijft zichtbaar als nummer).
 * Alle plaatjes worden 1 keer getekend (geen live filters; HARDE REGEL 7).
 */

import { useEffect, useMemo, useRef } from "react";
import type { Vlakbasis } from "../soort";
import { holoBasis, TX, type PhaserModule } from "../holo/basis";
import { HOLO_CANVAS, useHoloMotor } from "../holo/motor";
import { indeling, type Plaatje, type Telopgave } from "./squla-tellen-holo";
import { KLEUR, MAAT, teken, type Kleurnaam } from "./squla-tellen-tekenen";
import s from "./squla-tellen-gouden.module.css";

export type GoudenTelProps = {
  opgave: Telopgave | null;
  /** Per stuk fruit (index in de opgave) het nummer erbij; 0 of ontbrekend = geen nummer. */
  nummers?: number[];
  /** De kleur van de nummers (de kleur van het fruit). */
  kleur?: Kleurnaam;
  tikbaar?: boolean;
  hand?: number | null;
  goed?: number;
  fout?: number;
  /** Alle plaatjes van de les: vooruit tekenen (geen hapering later). */
  voorraad?: Plaatje[];
};

type Ind = ReturnType<typeof indeling>;

/** Hoe groot het fruit is ten opzichte van de oude les (het vak blijft gelijk). */
const FRUIT_SCHAAL = 0.85;
/** Hoe hoog het nummer boven het midden van het fruit staat (punten van het vlak). */
const NUMMER_BOVEN = 52;

interface Scene {
  zetIndeling(o: Ind | null): void;
  pop(i: number): void;
  zetHand(i: number | null): void;
  goed(): void;
  fout(): void;
  bakVooruit(p: Plaatje[]): void;
}

function maakScene(Phaser: PhaserModule, rustig: boolean) {
  const Basis = holoBasis(Phaser, rustig);
  type Img = import("phaser").GameObjects.Image;
  type Box = import("phaser").GameObjects.Container;

  class GoudenTel extends Basis implements Scene {
    groep: Box | null = null;
    items: Img[] = [];
    ind: Ind | null = null;
    hand!: Img;
    handI: number | null = null;

    constructor() {
      super("squla-tellen-gouden");
    }

    maak() {
      /* Het hulphandje: dezelfde simpele witte hand als in de gouden klokles (stijl B). */
      this.canvasPlaatje("stg-hand", 90, 120, (c) => {
        const vorm = () => {
          c.beginPath();
          c.roundRect(34, 6, 20, 62, 10);
          c.roundRect(16, 52, 60, 56, 18);
          c.roundRect(52, 50, 17, 30, 8);
          c.roundRect(64, 58, 15, 28, 7);
          c.roundRect(8, 66, 18, 30, 9);
        };
        c.save();
        c.shadowColor = "rgba(0,0,20,0.45)";
        c.shadowBlur = 10;
        c.shadowOffsetY = 4;
        c.fillStyle = "#ffffff";
        vorm();
        c.fill();
        c.restore();
        c.strokeStyle = "#2b3a66";
        c.lineWidth = 3;
        vorm();
        c.stroke();
        c.fillStyle = "#ffffff";
        vorm();
        c.fill();
        c.strokeStyle = "rgba(43,58,102,0.55)";
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(54, 66);
        c.lineTo(54, 78);
        c.moveTo(66, 70);
        c.lineTo(66, 84);
        c.stroke();
      });
      this.hand = this.plaats("stg-hand", 0, 0).setOrigin(0.48, 0.03).setVisible(false).setDepth(10);
    }

    tex(p: Plaatje) {
      const sl = `stg-${p.soort}`;
      this.canvasPlaatje(sl, MAAT, MAAT, (c) => teken(c, p.soort));
      return sl;
    }

    bakVooruit(p: Plaatje[]) {
      p.forEach((x) => this.tex(x));
    }

    zetIndeling(o: Ind | null) {
      const oud = this.groep;
      this.groep = null;
      this.items = [];
      this.ind = o;
      this.zetHand(null);
      if (oud) this.verdwijn(oud);
      if (!o) return;
      const cx = 490;
      const cy = 380;
      const g = this.add.container(cx, cy);
      for (const pl of o.plekken) {
        /* Het fruit iets kleiner dan in de oude les (0,85), zodat het nummer boven het fruit niet tegen de rij erboven
           komt (kind-test 9 nov). In punten van het vlak, net als de rest. */
        const sc = (o.schaal * FRUIT_SCHAAL) / TX;
        const im = this.plaats(this.tex(pl.p), pl.x - cx, pl.y - cy).setScale(sc).setData("sc", sc);
        g.add(im);
        this.items.push(im);
      }
      this.groep = g;
      this.tover(g);
    }

    /** Een stuk fruit wipt even op als het een nummer krijgt. */
    pop(i: number) {
      const im = this.items[i];
      if (!im || this.rustig) return;
      const basis = (im.getData("sc") as number | undefined) ?? 1 / TX;
      this.tweens.killTweensOf(im);
      im.setScale(basis);
      this.tweens.add({ targets: im, scale: basis * 1.16, duration: 110, yoyo: true, ease: "Sine.easeOut", onComplete: () => im.setScale(basis) });
    }

    /** Het handje wijst van onderen met de vingertop naar het stuk fruit en beweegt zacht heen en weer. */
    zetHand(i: number | null) {
      if (i === this.handI) return;
      this.handI = i;
      this.tweens.killTweensOf(this.hand);
      const pl = i == null ? null : this.ind?.plekken[i];
      if (!pl) {
        this.hand.setVisible(false);
        return;
      }
      /* De vingertop raakt het fruit rechtsonder; de hand ligt schuin in de ruimte rechtsonder, niet over het fruit eronder
         (kind-test 9 nov). Hij beweegt zacht heen en weer in de richting van de vinger. */
      const tip = { x: pl.x + 24, y: pl.y + 26 };
      const hoek = -0.65;
      const stap = { x: -Math.sin(hoek) * 8, y: Math.cos(hoek) * 8 };
      this.hand.setScale(0.55 / TX).setRotation(hoek).setPosition(tip.x, tip.y).setAlpha(1).setVisible(true);
      if (this.rustig) return;
      this.hand.setAlpha(0);
      this.tweens.add({ targets: this.hand, alpha: 1, duration: 300 });
      this.tweens.add({ targets: this.hand, x: tip.x + stap.x, y: tip.y + stap.y, duration: 520, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    }

    goed() {
      this.golf(490, 380);
      if (this.rustig) return;
      this.items.forEach((im, i) => {
        const basis = (im.getData("sc") as number | undefined) ?? 1 / TX;
        this.tweens.add({ targets: im, scale: basis * 1.1, delay: i * 18, duration: 140, yoyo: true, onComplete: () => im.setScale(basis) });
      });
    }

    fout() {
      if (this.groep) this.schud(this.groep);
    }

    /** Voor `npm run vloeiend`: steeds opnieuw tevoorschijn toveren, een paar keer laten opwippen en goed. */
    demo(ms: number) {
      const eind = performance.now() + ms;
      const nu = this.ind;
      if (!nu) return super.demo(ms);
      let k = 0;
      const stap = () => {
        if (performance.now() > eind) return;
        this.zetIndeling({ ...nu, id: `${nu.id}-demo-${k++}` });
        for (let i = 0; i < nu.plekken.length; i++) this.time.delayedCall(350 + i * 40, () => this.pop(i));
        this.time.delayedCall(450, () => this.zetHand(0));
        this.time.delayedCall(1000, () => this.goed());
        this.time.delayedCall(1300, () => this.zetHand(null));
        this.time.delayedCall(1400, stap);
      };
      stap();
    }
  }
  return GoudenTel as unknown as new () => import("phaser").Scene;
}

export function GoudenTelVlak({ opgave, nummers = [], kleur = "wit", tikbaar = false, hand = null, goed = 0, fout = 0, voorraad, meld, schaal }: GoudenTelProps & Vlakbasis) {
  const { plek, scene } = useHoloMotor<Scene>(schaal, maakScene);
  const opgaveSleutel = opgave ? JSON.stringify(opgave) : "";
  const ind = useMemo(() => (opgaveSleutel ? indeling(JSON.parse(opgaveSleutel) as Telopgave) : null), [opgaveSleutel]);
  const voorraadSleutel = voorraad ? JSON.stringify(voorraad) : "";

  useEffect(() => {
    if (scene && voorraadSleutel) scene.bakVooruit(JSON.parse(voorraadSleutel) as Plaatje[]);
  }, [scene, voorraadSleutel]);

  useEffect(() => {
    scene?.zetIndeling(ind);
  }, [scene, ind]);

  /* Een stuk fruit dat net een nummer kreeg, wipt even op. */
  const vorige = useRef<{ id: string; n: number[] }>({ id: "", n: [] });
  const nummerSleutel = nummers.join(",");
  useEffect(() => {
    if (!scene || !ind) return;
    const v = vorige.current;
    const nu = nummerSleutel ? nummerSleutel.split(",").map(Number) : [];
    if (v.id === ind.id) nu.forEach((x, i) => x > 0 && !(v.n[i] > 0) && scene.pop(i));
    vorige.current = { id: ind.id, n: nu };
  }, [scene, ind, nummerSleutel]);

  useEffect(() => {
    scene?.zetHand(hand);
  }, [scene, ind, hand]);

  const vorigGoed = useRef(goed);
  useEffect(() => {
    if (!scene || goed === vorigGoed.current) return;
    vorigGoed.current = goed;
    scene.goed();
  }, [scene, goed]);
  const vorigFout = useRef(fout);
  useEffect(() => {
    if (!scene || fout === vorigFout.current) return;
    vorigFout.current = fout;
    scene.fout();
  }, [scene, fout]);

  const kleurHex = KLEUR[kleur];
  return (
    <div className={s.vlak}>
      <div ref={plek} style={HOLO_CANVAS} aria-hidden />
      {ind?.plekken.map((p, i) =>
        nummers[i] > 0 ? (
          <div key={`${ind.id}-n${i}`} className={s.nummer} style={{ left: p.x, top: p.y - NUMMER_BOVEN * ind.schaal, color: kleurHex }} aria-hidden>
            {nummers[i]}
          </div>
        ) : null,
      )}
      {tikbaar &&
        ind?.plekken.map((p, i) => {
          if (nummers[i] > 0) return null;
          const maat = Math.max(100 * ind.schaal, 44 / schaal);
          return (
            <button
              key={`${ind.id}-t${i}`}
              type="button"
              className={s.tik}
              style={{ left: p.x - maat / 2, top: p.y - maat / 2, width: maat, height: maat }}
              aria-label={`Tel dit stuk fruit`}
              data-ding={`tel-${i}`}
              onClick={() => meld({ soort: "telTik", index: i })}
            />
          );
        })}
    </div>
  );
}

/** Op de verzamelkaart: 3 rijtjes fruitrondjes (rood, groen, paars) met de nummers 5, 10, 15 (244 × 190). */
export function KaartTellenGouden() {
  const kleuren = [KLEUR.rood, KLEUR.groen, KLEUR.paars];
  return (
    <>
      {[0, 1, 2].map((r) =>
        [0, 1, 2, 3, 4].map((k) => <circle key={`${r}-${k}`} cx={44 + k * 34} cy={50 + r * 40} r={13} fill={kleuren[r]} stroke="#ffffff" strokeWidth={2.5} />),
      )}
      <text x={214} y={58} fontSize={22} fontWeight={800} fill={KLEUR.rood}>5</text>
      <text x={210} y={98} fontSize={22} fontWeight={800} fill={KLEUR.groen}>10</text>
      <text x={210} y={138} fontSize={22} fontWeight={800} fill={KLEUR.paars}>15</text>
    </>
  );
}
