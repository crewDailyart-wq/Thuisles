"use client";

/**
 * Het speelvlak van de GOUDEN LES REKENMIX (squla-rekenmix-mix1-1-gouden, 11 november 2026; BOUWREGELS 15.25).
 * Een nieuw vlak naast SqulaRekenmix (squla-rekenmix-vlak.tsx); dat vlak en de oude les blijven zoals ze zijn.
 *
 * Alle vragen van deze les zijn telvragen; het vlak doet daarom precies wat het vlak van de gouden les Tellen doet
 * (squla-tellen-gouden-vlak.tsx), maar met de dingen van de Rekenmix (appels, ballen, potloden, auto's, bloemen,
 * knikkers, sterren; de vaste plaatjes uit public/voorwerpen, getekend zoals in de oude Rekenmix-les) en met hun eigen
 * plek (door elkaar, in rijen of 2 aan 2):
 *   - `nummers`: per ding het nummer dat erbij staat (0 = geen), in de kleur van het ding (BOUWREGELS 2.1, 2.2);
 *   - `tikbaar`: elk ding zonder nummer is een (onzichtbare) knop; een tik meldt `{ soort: "telTik", index }`;
 *   - `hand`: het hulphandje (15.19) wijst naar dit ding, schuin vanuit de lege ruimte rechtsonder;
 *   - `goed` / `fout`: tellers; ophogen = lichtgolf of zacht schudden (zoals Tellen).
 * Vaste zone (15.30): alles past in x 60–820 en y 40–660 van het vlak (980 × 720), links van het tekstvak.
 * Alle plaatjes worden 1 keer getekend (geen live filters; HARDE REGEL 7).
 */

import { useEffect, useMemo, useRef } from "react";
import type { Vlakbasis } from "../soort";
import { holoBasis, TX, type PhaserModule } from "../holo/basis";
import { HOLO_CANVAS, useHoloMotor } from "../holo/motor";
import { LABELKLEUR, RM_MAAT, tekenDing } from "./squla-rekenmix-tekenen";
import s from "./squla-tellen-gouden.module.css";

export { KaartRekenmix as KaartRekenmixGouden } from "./squla-rekenmix-vlak";

/** 1 ding: het plaatje (naam in public/voorwerpen) en zijn plek, in punten ten opzichte van het midden van de tekening. */
export type RmgDing = { beeld: string; x: number; y: number; m: number; boven: number };
export type RmgOpgave = { id: string; dingen: RmgDing[] };

export type GoudenRekenmixProps = {
  opgave: RmgOpgave | null;
  nummers?: number[];
  /** De kleur van de nummers: de kleurnaam van het ding (dezelfde namen als in Bliepo's zinnen). */
  kleur?: string;
  tikbaar?: boolean;
  hand?: number | null;
  goed?: number;
  fout?: number;
  /** Alle plaatjes van de les: vooruit tekenen (geen hapering later). */
  voorraad?: string[];
};

/** Waar de dingen mogen staan (vaste zone, links van het tekstvak; 15.30). */
const ZONE = { x0: 60, x1: 820, y0: 40, y1: 660 };
/** Hoe groot een ding hooguit getoond wordt ten opzichte van zijn eigen maat (niet te groot bij weinig dingen). */
const MAX_SCHAAL = 1.25;

/** De plekken in punten van het vlak: alles (met de nummers erboven) zo groot mogelijk in de zone, in het midden. */
export function indeling(o: RmgOpgave) {
  const links = Math.min(...o.dingen.map((d) => d.x - d.m / 2));
  const rechts = Math.max(...o.dingen.map((d) => d.x + d.m / 2));
  const boven = Math.min(...o.dingen.map((d) => d.y - d.boven - 22));
  const onder = Math.max(...o.dingen.map((d) => d.y + d.m / 2));
  const f = Math.min(MAX_SCHAAL, (ZONE.x1 - ZONE.x0) / (rechts - links), (ZONE.y1 - ZONE.y0) / (onder - boven));
  const cx = (ZONE.x0 + ZONE.x1) / 2 - ((links + rechts) / 2) * f;
  const cy = (ZONE.y0 + ZONE.y1) / 2 - ((boven + onder) / 2) * f;
  return { id: o.id, f, plekken: o.dingen.map((d) => ({ beeld: d.beeld, x: cx + d.x * f, y: cy + d.y * f, m: d.m * f, boven: d.boven * f })) };
}
type Ind = ReturnType<typeof indeling>;

interface Scene {
  zetIndeling(o: Ind | null): void;
  pop(i: number): void;
  zetHand(i: number | null): void;
  goed(): void;
  fout(): void;
  bakVooruit(namen: string[]): void;
}

function maakScene(Phaser: PhaserModule, rustig: boolean) {
  const Basis = holoBasis(Phaser, rustig);
  type Img = import("phaser").GameObjects.Image;
  type Box = import("phaser").GameObjects.Container;

  class GoudenRekenmix extends Basis implements Scene {
    groep: Box | null = null;
    items: Img[] = [];
    ind: Ind | null = null;
    hand!: Img;
    handI: number | null = null;
    wachtrij: string[] = [];

    constructor() {
      super("squla-rekenmix-gouden");
    }

    maak() {
      /* Het hulphandje: dezelfde simpele witte hand als in de gouden les Tellen (stijl B). */
      this.canvasPlaatje("rmg-hand", 90, 120, (c) => {
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
      this.hand = this.plaats("rmg-hand", 0, 0).setOrigin(0.48, 0.03).setVisible(false).setDepth(10);
      /* Plaatjes die al gevraagd waren voor de scène klaar was, verspreid tekenen (1 per 2 beeldjes; geleerd bij Rekentaal). */
      this.bakStap();
    }

    tex(beeld: string) {
      const sl = `rmg-${beeld}`;
      this.canvasPlaatje(sl, RM_MAAT, RM_MAAT, (c) => tekenDing(c, beeld, RM_MAAT));
      return sl;
    }

    bakVooruit(namen: string[]) {
      this.wachtrij.push(...namen);
      if (this.klaar) this.bakStap();
    }

    bakStap() {
      const naam = this.wachtrij.shift();
      if (!naam) return;
      this.tex(naam);
      this.time.delayedCall(34, () => this.bakStap());
    }

    zetIndeling(o: Ind | null) {
      const oud = this.groep;
      this.groep = null;
      this.items = [];
      this.ind = o;
      this.zetHand(null);
      if (oud) this.verdwijn(oud);
      if (!o) return;
      /* De groep staat in het midden van de zone, zodat hij vanuit zijn midden tevoorschijn komt (tover). */
      const cx = (ZONE.x0 + ZONE.x1) / 2;
      const cy = (ZONE.y0 + ZONE.y1) / 2;
      const g = this.add.container(cx, cy);
      for (const pl of o.plekken) {
        const sc = pl.m / RM_MAAT / TX;
        const im = this.plaats(this.tex(pl.beeld), pl.x - cx, pl.y - cy).setScale(sc).setData("sc", sc);
        g.add(im);
        this.items.push(im);
      }
      this.groep = g;
      this.tover(g);
    }

    /** Een ding wipt even op als het een nummer krijgt. Na killTweensOf: alpha en schaal terug (LESRECEPT, keuring Getallenlijn). */
    pop(i: number) {
      const im = this.items[i];
      if (!im || this.rustig) return;
      const basis = (im.getData("sc") as number | undefined) ?? 1 / TX;
      this.tweens.killTweensOf(im);
      im.setScale(basis).setAlpha(1);
      this.tweens.add({ targets: im, scale: basis * 1.16, duration: 110, yoyo: true, ease: "Sine.easeOut", onComplete: () => im.setScale(basis) });
    }

    /** Het handje wijst met de vingertop naar het ding, vanuit de ruimte rechtsonder, en beweegt zacht heen en weer. */
    zetHand(i: number | null) {
      if (i === this.handI) return;
      this.handI = i;
      this.tweens.killTweensOf(this.hand);
      const pl = i == null ? null : this.ind?.plekken[i];
      if (!pl) {
        this.hand.setVisible(false);
        return;
      }
      const tip = { x: pl.x + pl.m * 0.26, y: pl.y + pl.m * 0.3 };
      const hoek = -0.65;
      const stap = { x: -Math.sin(hoek) * 8, y: Math.cos(hoek) * 8 };
      this.hand.setScale(0.55 / TX).setRotation(hoek).setPosition(tip.x, tip.y).setAlpha(1).setVisible(true);
      if (this.rustig) return;
      this.hand.setAlpha(0);
      this.tweens.add({ targets: this.hand, alpha: 1, duration: 300 });
      this.tweens.add({ targets: this.hand, x: tip.x + stap.x, y: tip.y + stap.y, duration: 520, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    }

    goed() {
      this.golf((ZONE.x0 + ZONE.x1) / 2, (ZONE.y0 + ZONE.y1) / 2);
      if (this.rustig) return;
      this.items.forEach((im, i) => {
        const basis = (im.getData("sc") as number | undefined) ?? 1 / TX;
        this.tweens.killTweensOf(im);
        im.setScale(basis).setAlpha(1);
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
  return GoudenRekenmix as unknown as new () => import("phaser").Scene;
}

export function GoudenRekenmixVlak({ opgave, nummers = [], kleur = "wit", tikbaar = false, hand = null, goed = 0, fout = 0, voorraad, meld, schaal }: GoudenRekenmixProps & Vlakbasis) {
  const { plek, scene } = useHoloMotor<Scene>(schaal, maakScene);
  const opgaveSleutel = opgave ? JSON.stringify(opgave) : "";
  const ind = useMemo(() => (opgaveSleutel ? indeling(JSON.parse(opgaveSleutel) as RmgOpgave) : null), [opgaveSleutel]);
  const voorraadSleutel = voorraad ? voorraad.join(",") : "";

  useEffect(() => {
    if (scene && voorraadSleutel) scene.bakVooruit(voorraadSleutel.split(","));
  }, [scene, voorraadSleutel]);

  useEffect(() => {
    scene?.zetIndeling(ind);
  }, [scene, ind]);

  /* Een ding dat net een nummer kreeg, wipt even op. */
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

  const kleurHex = LABELKLEUR[kleur] ?? "#ffffff";
  return (
    <div className={s.vlak} data-rekenmix-gouden="">
      <div ref={plek} style={HOLO_CANVAS} aria-hidden />
      {ind?.plekken.map((p, i) =>
        nummers[i] > 0 ? (
          <div key={`${ind.id}-n${i}`} className={s.nummer} style={{ left: p.x, top: p.y - p.boven, color: kleurHex }} aria-hidden data-nummer="">
            {nummers[i]}
          </div>
        ) : null,
      )}
      {tikbaar &&
        ind?.plekken.map((p, i) => {
          if (nummers[i] > 0) return null;
          const b = Math.max(p.beeld === "potlood" ? p.m * 0.42 : p.m, 44 / schaal);
          const h = Math.max(p.m, 44 / schaal);
          return (
            <button
              key={`${ind.id}-t${i}`}
              type="button"
              className={s.tik}
              style={{ left: p.x - b / 2, top: p.y - h / 2, width: b, height: h, borderRadius: p.beeld === "potlood" ? 18 : "50%" }}
              aria-label="Tel dit ding"
              data-ding={`tel-${i}`}
              onClick={() => meld({ soort: "telTik", index: i })}
            />
          );
        })}
    </div>
  );
}
