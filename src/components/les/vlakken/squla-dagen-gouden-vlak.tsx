"use client";

/**
 * Het speelvlak van de GOUDEN LES DAGEN (squla-dagen-van-de-week-gouden, 11 november 2026; BOUWREGELS hoofdstuk 15).
 * Een nieuw vlak naast SqulaDagenTrein (squla-dagen-trein.tsx); dat vlak en de oude les blijven precies zoals ze zijn.
 *
 * Dezelfde weektrein als de oude les (de gloeiende wagons en locomotief van public/squla/trein-glow/, elke dag zijn eigen
 * kleur met de naam op een bordje, rails eronder), maar nu in PHASER (HARDE REGEL 7; de oude trein was HTML en kon niet
 * met `npm run vloeiend` gemeten worden, zoals bij Huisnummers). De rails, de bordjes en de lege plek worden 1 keer
 * getekend ("gebakken"); daarna schuiven alleen plaatjes. Alles staat links van het vaste tekstvak (x < 860 van de 980;
 * 15.30), daarom zijn de wagons iets kleiner dan in de oude les.
 *
 *   - `wagons`: de trein van links (achter de locomotief) naar rechts; een dag (0 = maandag … 6 = zondag) of `null` = de
 *     lege plek (stippellijn). Een nieuw `beeld` = Bliepo tovert de trein tevoorschijn; verandert alleen 1 plek (de lege
 *     plek is gevuld), dan wipt die wagon even op.
 *   - `kaarten`: de dagkaarten onder de trein (dezelfde wagontekening, iets groter). `inGat` = de kaart die in de lege
 *     plek ligt (slepen).
 *   - `vandaag`: de gele pijl met het bordje "vandaag" boven die wagon (FOUTEN-VOORBEELDEN F3).
 *   - `weekend`: de gele haak onder zaterdag en zondag.
 *   - `licht`: het RODE RONDJE om wat Bliepo noemt (7.8): "w3" = de wagon van donderdag, "k3" = de kaart van donderdag.
 *     Wagons naast elkaar krijgen samen 1 rondje (zoals de oude les).
 *   - `kies`: wat het kind nu kan aantikken. Een tik op een wagon of kaart zet er een VINKJE op (6.5; nog een tik haalt het
 *     weg) en meldt `{ soort: "dagKies", dag }`. Bij `soort: "sleep"` sleept het kind een kaart naar de lege plek (tikken
 *     werkt ook) en meldt `{ soort: "gelegd", dag }`; een tik op de kaart in de lege plek meldt `{ soort: "terug", dag }`.
 *   - `hulphand`: het HULPHANDJE (15.19): komt vanzelf, is nooit een knop, alleen bij opdrachten.
 *   - `golf`: een rustige lichtgolf bij goed (7.6), bij een wagon ("w3"), een kaart ("k3") of de lege plek ("gat").
 * Maten in punten van het vlak (980 × 720).
 */

import { useEffect, useMemo, useRef, type CSSProperties, type PointerEvent as RPointerEvent } from "react";
import type { Vlakbasis } from "../soort";
import { holoBasis, type PhaserModule } from "../holo/basis";
import { HOLO_CANVAS, useHoloMotor } from "../holo/motor";
import { DAGEN } from "./squla-dagen-trein";
import s from "./squla-dagen-gouden.module.css";

export type Punt = { x: number; y: number };
export type Hand = { plek: Punt; naar?: Punt | null; sleutel: string };
export type Kies = { soort: "wagon" | "kaart" | "sleep"; gekozen: number | null; tikbaar: number[]; vinkjes: number[] };

export type DagenGoudenProps = {
  beeld: string;
  wagons: (number | null)[] | null;
  kaarten?: number[];
  inGat?: number | null;
  licht?: string[];
  vandaag?: number | null;
  weekend?: boolean;
  kies?: Kies | null;
  hulphand?: Hand | null;
  golf?: { id: string; n: number } | null;
};

/* ---------- de maten ---------- */

/** Het midden van de trein en de kaarten: links van het vaste tekstvak (15.30). */
const MIDDEN = 417;
export const W = 96;
const TUS = 6;
const LOC = 112;
export const RAIL_Y = 320;
const WK = 120;
const KT = 44;
export const KBODEM = 560;
const KK = W / 108;
/** De wagon zelf (zonder gloed) is 324 × 163 in het plaatje, met 80 rondom voor de gloed. */
const BEELD_H = (W * 163) / 324;
const GLOED = 80 / 324;

const breedte = (n: number) => LOC + n * (W + TUS);
const x0 = (n: number) => Math.round(MIDDEN - breedte(n) / 2);
/** De linkerkant van wagon i in een trein van n. */
export const plekX = (n: number, i: number) => x0(n) + LOC + TUS + i * (W + TUS);
/** Het midden van kaart i van n. */
export const kaartX = (n: number, i: number) => MIDDEN + (i - (n - 1) / 2) * (WK + KT);
/** De knop over een wagon (punten van het vlak). */
export const wagonRect = (n: number, i: number) => ({ x: plekX(n, i) - 4, y: RAIL_Y - 74, b: W + 8, h: 80 });
/** De knop over een kaart (thuis). */
export const kaartRect = (n: number, i: number) => ({ x: kaartX(n, i) - WK / 2 - 6, y: KBODEM - 84, b: WK + 12, h: 92 });
/** Het midden van de lege plek. */
export const gatMidden = (wagons: (number | null)[]): Punt | null => {
  const i = wagons.indexOf(null);
  return i < 0 ? null : { x: plekX(wagons.length, i) + W / 2, y: RAIL_Y - 28 };
};

/* ---------- Phaser ---------- */

interface Scene {
  zetFont(font: string): void;
  zetTrein(wagons: (number | null)[] | null, beeld: string): void;
  zetVandaag(v: number | null): void;
  zetWeekend(aan: boolean): void;
  zetKaarten(kaarten: number[], beeld: string, inGat: number | null): void;
  zetLicht(ids: string[]): void;
  sleep(dag: number, x: number, y: number): boolean;
  laatLos(dag: number, raak: boolean): void;
  golfBij(id: string): void;
}

type Box = import("phaser").GameObjects.Container;
type Img = import("phaser").GameObjects.Image;

function maakScene(Phaser: PhaserModule, rustig: boolean) {
  const Basis = holoBasis(Phaser, rustig);

  class GoudenTrein extends Basis implements Scene {
    font = "system-ui, sans-serif";
    rij: (number | null)[] = [];
    beeld = "";
    loc: Box | null = null;
    dozen: Box[] = [];
    kaartBeeld = "";
    kaarten: { dag: number; doos: Box; thuis: Punt }[] = [];
    inGat: number | null = null;
    vandaag: number | null = null;
    pijl: Box | null = null;
    haak: Img | null = null;
    weekend = false;
    rondjes: Img[] = [];
    licht: string[] = [];

    constructor() {
      super("squla-dagen-gouden");
    }

    zetFont(font: string) {
      if (font) this.font = font;
    }

    preload() {
      for (const d of DAGEN) this.load.image(`dg-${d.naam}`, `/squla/trein-glow/${d.naam}.png`);
      this.load.image("dg-loc", "/squla/trein-glow/locomotief.png");
      this.load.image("dg-rondje", "/rondje/rondje-rood-2.png");
    }

    maak() {
      /* De rails 1 keer bakken (zoals de oude trein), links van het tekstvak. */
      this.canvasPlaatje("dg-rails", 860, 22, (c) => {
        c.fillStyle = "#8fa3c9";
        c.beginPath();
        c.roundRect(0, 4, 860, 6, 3);
        c.fill();
        c.fillStyle = "#5d6f9a";
        for (let i = 0; i < 29; i++) {
          c.beginPath();
          c.roundRect(i * 30 + 6, 10, 14, 7, 2);
          c.fill();
        }
      });
      this.plaats("dg-rails", 430, RAIL_Y + 5).setDepth(0);
      /* De koppeling tussen 2 wagons. */
      this.canvasPlaatje("dg-kop", TUS + 12, 8 * KK, (c) => {
        c.fillStyle = "#1d2b5e";
        c.beginPath();
        c.roundRect(0, 0, TUS + 12, 8 * KK, 3);
        c.fill();
      });
      /* De lege plek: een stippelrand (gewoon en "er hangt een kaart boven"). */
      for (const [sl, aan] of [["dg-leeg", false], ["dg-leeg-aan", true]] as const)
        this.canvasPlaatje(sl, W + 8, 60, (c) => {
          c.setLineDash([10, 8]);
          c.lineWidth = aan ? 5 : 4;
          c.strokeStyle = aan ? "#ffc845" : "rgba(255,247,234,0.7)";
          c.fillStyle = aan ? "rgba(255,200,69,0.35)" : "rgba(255,247,234,0.06)";
          c.beginPath();
          c.roundRect(4, 4, W, 52, 14);
          c.fill();
          c.stroke();
        });
      /* De gele pijl boven vandaag, met het bordje "vandaag" (F3). */
      this.canvasPlaatje("dg-pijl", 44, 48, (c) => {
        c.fillStyle = "#ffc845";
        c.strokeStyle = "#1d2b5e";
        c.lineWidth = 4;
        c.lineJoin = "round";
        c.beginPath();
        c.moveTo(14, 4);
        c.lineTo(30, 4);
        c.lineTo(30, 24);
        c.lineTo(40, 24);
        c.lineTo(22, 44);
        c.lineTo(4, 24);
        c.lineTo(14, 24);
        c.closePath();
        c.fill();
        c.stroke();
      });
      /* De haak onder het weekend. */
      const hb = 2 * W + TUS + 8;
      this.canvasPlaatje("dg-haak", hb, 26, (c) => {
        c.strokeStyle = "#ffc845";
        c.lineWidth = 6;
        c.lineCap = "round";
        c.lineJoin = "round";
        c.beginPath();
        c.moveTo(4, 4);
        c.lineTo(4, 20);
        c.lineTo(hb - 4, 20);
        c.lineTo(hb - 4, 4);
        c.stroke();
      });
    }

    /** Een bordje met een woord (de naam van de dag op de wagon, of "vandaag"); 1 keer getekend per woord. */
    bordje(woord: string, rand: string, groot = 19) {
      const sl = `dg-bord-${woord}-${groot}`;
      if (this.textures.exists(sl)) return sl;
      const meet = document.createElement("canvas").getContext("2d")!;
      meet.font = `800 ${groot}px ${this.font}`;
      const b = Math.ceil(meet.measureText(woord).width) + 14 + 16;
      const h = Math.round(groot * 1.25) + 4 + 16;
      this.canvasPlaatje(sl, b, h, (c) => {
        c.shadowColor = rand;
        c.shadowBlur = 10;
        c.fillStyle = "#fff7ea";
        c.strokeStyle = rand;
        c.lineWidth = 2;
        c.beginPath();
        c.roundRect(8, 8, b - 16, h - 16, 7);
        c.fill();
        c.shadowBlur = 0;
        c.stroke();
        c.fillStyle = "#1d2b5e";
        c.font = `800 ${groot}px ${this.font}`;
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillText(woord, b / 2, h / 2 + 1);
      });
      return sl;
    }

    /** Eén wagon als groep, met het punt onderaan in het midden op (0, 0) (de rails). */
    maakWagon(dag: number, koppeling: boolean): Box {
      const d = DAGEN[dag];
      const doos = this.add.container(0, 0);
      if (koppeling) doos.add(this.plaats("dg-kop", -W / 2 - TUS / 2, -18 * KK));
      const beeld = this.add.image(0, -2 - BEELD_H / 2, `dg-${d.naam}`).setDisplaySize(W * (1 + 2 * GLOED), BEELD_H + 2 * W * GLOED);
      doos.add(beeld);
      /* Het bordje met de naam, op de zijkant (iets groter dan in de oude les als verhouding, zodat het te lezen is). */
      doos.add(this.plaats(this.bordje(d.naam, d.hex, dag === 3 ? 15.5 : 16.5), 0, -2 - BEELD_H * 0.62));
      return doos;
    }

    maakLeeg(): Box {
      const doos = this.add.container(0, 0);
      doos.add(this.plaats("dg-leeg", 0, -4 - 26));
      doos.setData("leeg", true);
      return doos;
    }

    maakLoc(): Box {
      const doos = this.add.container(0, 0);
      const bh = (LOC * 207) / 324;
      doos.add(this.add.image(0, -2 - bh / 2, "dg-loc").setDisplaySize(LOC * (1 + 2 * GLOED), bh + 2 * LOC * GLOED));
      return doos;
    }

    zetTrein(wagons: (number | null)[] | null, beeld: string) {
      const nieuw = beeld !== this.beeld;
      if (!wagons) {
        for (const d of this.dozen) this.verdwijn(d);
        if (this.loc) this.verdwijn(this.loc);
        this.loc = null;
        this.dozen = [];
        this.rij = [];
        this.beeld = beeld;
        return;
      }
      const n = wagons.length;
      if (nieuw || n !== this.rij.length) {
        for (const d of this.dozen) this.verdwijn(d);
        if (this.loc) this.verdwijn(this.loc);
        this.loc = this.maakLoc().setPosition(x0(n) + LOC / 2, RAIL_Y).setDepth(2);
        this.tover(this.loc);
        this.dozen = wagons.map((dag, i) => {
          const doos = dag === null ? this.maakLeeg() : this.maakWagon(dag, true);
          doos.setPosition(plekX(n, i) + W / 2, RAIL_Y).setDepth(2);
          this.tover(doos, { vertraging: 40 + i * 40 });
          return doos;
        });
      } else {
        wagons.forEach((dag, i) => {
          if (this.rij[i] === dag) return;
          this.dozen[i].destroy();
          const doos = dag === null ? this.maakLeeg() : this.maakWagon(dag, true);
          doos.setPosition(plekX(n, i) + W / 2, RAIL_Y).setDepth(2);
          this.dozen[i] = doos;
          /* De lege plek is gevuld: de wagon wipt even op. */
          if (dag !== null && !this.rustig) {
            doos.setScale(0.9);
            this.tweens.add({ targets: doos, scale: 1, duration: 260, ease: "Back.easeOut" });
            this.tweens.add({ targets: doos, y: RAIL_Y - 14, duration: 130, yoyo: true, ease: "Sine.easeOut" });
          }
        });
      }
      this.rij = [...wagons];
      this.beeld = beeld;
      this.zetVandaag(this.vandaag);
      this.zetWeekend(this.weekend);
      this.legKaarten();
      this.zetLicht(this.licht);
    }

    zetVandaag(v: number | null) {
      this.vandaag = v;
      const i = v === null ? -1 : this.rij.indexOf(v);
      if (i < 0) {
        this.pijl?.destroy();
        this.pijl = null;
        return;
      }
      const x = plekX(this.rij.length, i) + W / 2;
      if (!this.pijl) {
        this.pijl = this.add.container(0, 0).setDepth(4);
        this.pijl.add(this.plaats(this.bordje("vandaag", "#ffc845", 17), 0, -48));
        this.pijl.add(this.plaats("dg-pijl", 0, 0));
        if (!this.rustig) this.tweens.add({ targets: this.pijl.list[1], y: 8, duration: 600, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
      }
      this.pijl.setPosition(x, RAIL_Y - 2 - BEELD_H - 34);
    }

    zetWeekend(aan: boolean) {
      this.weekend = aan;
      const i = this.rij.indexOf(5);
      const j = this.rij.indexOf(6);
      if (!aan || i < 0 || j !== i + 1) {
        this.haak?.destroy();
        this.haak = null;
        return;
      }
      if (!this.haak) this.haak = this.plaats("dg-haak", 0, 0).setDepth(3);
      this.haak.setPosition(plekX(this.rij.length, i) + W + TUS / 2, RAIL_Y + 26);
    }

    /** Waar de lege plek is (de onderkant in het midden), of null. */
    gat(): Punt | null {
      const i = this.rij.indexOf(null);
      return i < 0 ? null : { x: plekX(this.rij.length, i) + W / 2, y: RAIL_Y };
    }

    zetKaarten(kaarten: number[], beeld: string, inGat: number | null) {
      const zelfde = beeld === this.kaartBeeld && kaarten.join(",") === this.kaarten.map((k) => k.dag).join(",");
      if (!zelfde) {
        for (const k of this.kaarten) this.verdwijn(k.doos);
        this.kaartBeeld = beeld;
        this.kaarten = kaarten.map((dag, i) => {
          const thuis = { x: kaartX(kaarten.length, i), y: KBODEM };
          const doos = this.maakWagon(dag, false).setPosition(thuis.x, thuis.y).setScale(WK / W).setDepth(3);
          this.tover(doos, { vertraging: 120 + i * 60 });
          return { dag, doos, thuis };
        });
      }
      this.inGat = inGat;
      this.legKaarten();
    }

    /** Elke kaart naar zijn plek: thuis, of (de kaart `inGat`) in de lege plek. */
    legKaarten() {
      const gat = this.gat();
      for (const k of this.kaarten) {
        const naarGat = k.dag === this.inGat && gat;
        const doel = naarGat ? gat : k.thuis;
        const schaal = naarGat ? 1 : WK / W;
        if (Math.abs(k.doos.x - doel.x) < 0.5 && Math.abs(k.doos.y - doel.y) < 0.5 && Math.abs(k.doos.scaleX - schaal) < 0.01) continue;
        this.tweens.killTweensOf(k.doos);
        /* Na killTweensOf: zichtbaar en de eigen schaal terug (geleerd bij de keuring Getallenlijn, tover()). */
        k.doos.setAlpha(1);
        this.tweens.add({ targets: k.doos, x: doel.x, y: doel.y, scale: schaal, duration: this.rustig ? 1 : 260, ease: "Cubic.easeOut", onComplete: () => k.doos.setDepth(naarGat ? 3.5 : 3) });
      }
      this.leegAan(false);
    }

    leegAan(aan: boolean) {
      const i = this.rij.indexOf(null);
      const doos = i < 0 ? null : this.dozen[i];
      if (!doos || !doos.getData("leeg")) return;
      (doos.list[0] as Img).setTexture(aan ? "dg-leeg-aan" : "dg-leeg");
    }

    /** Slepen: de kaart volgt de vinger (punten van het vlak, onderkant midden). Geeft terug of hij boven de lege plek hangt. */
    sleep(dag: number, x: number, y: number) {
      const k = this.kaarten.find((q) => q.dag === dag);
      if (!k) return false;
      this.tweens.killTweensOf(k.doos);
      k.doos.setAlpha(1).setScale(WK / W).setPosition(x, y).setDepth(6);
      const raak = this.boven(x, y);
      this.leegAan(raak);
      return raak;
    }

    boven(x: number, y: number) {
      const gat = this.gat();
      return !!gat && Math.abs(x - gat.x) < W / 2 + 34 && Math.abs(y - gat.y) < 90;
    }

    laatLos(dag: number, raak: boolean) {
      const k = this.kaarten.find((q) => q.dag === dag);
      if (!k) return;
      this.leegAan(false);
      const gat = this.gat();
      const doel = raak && gat ? gat : k.thuis;
      this.tweens.add({ targets: k.doos, x: doel.x, y: doel.y, scale: raak && gat ? 1 : WK / W, duration: this.rustig ? 1 : raak ? 140 : 300, ease: "Cubic.easeOut", onComplete: () => k.doos.setDepth(3) });
    }

    /** Waar iets staat voor het rondje en de golf: het midden, en hoe breed en hoog het rondje wordt. */
    plekVan(id: string): { x: number; y: number; b: number; h: number } | null {
      const dag = Number(id.slice(1));
      if (id === "gat") {
        const g = this.gat();
        return g ? { x: g.x, y: g.y - 28, b: W, h: 56 * KK } : null;
      }
      if (id[0] === "w") {
        const i = this.rij.indexOf(dag);
        return i < 0 ? null : { x: plekX(this.rij.length, i) + W / 2, y: RAIL_Y - 29 * KK, b: W, h: 56 * KK };
      }
      const k = this.kaarten.find((q) => q.dag === dag);
      if (!k) return null;
      const inGat = dag === this.inGat ? this.gat() : null;
      if (inGat) return { x: inGat.x, y: RAIL_Y - 29 * KK, b: W, h: 56 * KK };
      return { x: k.thuis.x, y: KBODEM - 32, b: WK, h: 60 };
    }

    zetLicht(ids: string[]) {
      this.licht = [...ids];
      /* Wagons naast elkaar in de trein: samen 1 rondje (zoals de oude les). */
      const plekken = ids.filter((x) => x[0] === "w").map((x) => this.rij.indexOf(Number(x.slice(1)))).filter((i) => i >= 0).sort((a, b) => a - b);
      const vakken: { x: number; y: number; b: number; h: number }[] = [];
      let start = 0;
      for (let k = 0; k < plekken.length; k++) {
        if (k + 1 < plekken.length && plekken[k + 1] === plekken[k] + 1) continue;
        const a = plekken[start];
        const b = plekken[k];
        const bb = (b - a) * (W + TUS) + W;
        vakken.push({ x: plekX(this.rij.length, a) + bb / 2, y: RAIL_Y - 29 * KK, b: bb, h: 56 * KK });
        start = k + 1;
      }
      for (const id of ids.filter((x) => x[0] !== "w")) {
        const p = this.plekVan(id);
        if (p) vakken.push(p);
      }
      while (this.rondjes.length < vakken.length) this.rondjes.push(this.add.image(0, 0, "dg-rondje").setDepth(7).setVisible(false));
      this.rondjes.forEach((r, i) => {
        const v = vakken[i];
        if (!v) {
          r.setVisible(false);
          return;
        }
        r.setPosition(v.x, v.y)
          .setDisplaySize(v.b * 1.12 + 36, v.h * 1.4 + 50)
          .setRotation((((i * 7) % 5) - 2) * 0.017)
          .setAlpha(1)
          .setVisible(true);
      });
    }

    golfBij(id: string) {
      const p = this.plekVan(id);
      if (p) this.golf(p.x, p.y);
    }

    /** Voor `npm run vloeiend`: steeds opnieuw de trein tevoorschijn toveren, het rondje laten lopen en een lichtgolf. */
    demo(ms: number) {
      const eind = performance.now() + ms;
      let k = 0;
      const stap = () => {
        if (performance.now() > eind) return;
        this.zetTrein([0, 1, 2, 3, 4, 5, 6], `demo-${k++}`);
        this.zetKaarten([4, 2, 0], `demo-${k}`, null);
        [0, 1, 2, 3].forEach((i) => this.time.delayedCall(300 + i * 160, () => this.zetLicht([`w${i}`])));
        this.time.delayedCall(300 + 4 * 160, () => {
          this.zetLicht([]);
          this.golfBij("w3");
        });
        this.time.delayedCall(500 + 4 * 160, stap);
      };
      stap();
    }
  }
  return GoudenTrein as unknown as new () => import("phaser").Scene;
}

/* ---------- het vlak ---------- */

export function DagenGoudenVlak({ beeld, wagons, kaarten = [], inGat = null, licht = [], vandaag = null, weekend = false, kies = null, hulphand = null, golf = null, meld, schaal }: DagenGoudenProps & Vlakbasis) {
  const { plek, scene } = useHoloMotor<Scene>(schaal, maakScene);
  const wortel = useRef<HTMLDivElement>(null);
  const treinSleutel = wagons ? JSON.stringify(wagons) : "";
  const rij = useMemo(() => (treinSleutel ? (JSON.parse(treinSleutel) as (number | null)[]) : null), [treinSleutel]);
  const kaartSleutel = kaarten.join(",");
  const lichtSleutel = licht.join(",");

  useEffect(() => {
    if (!scene) return;
    if (wortel.current) scene.zetFont(getComputedStyle(wortel.current).fontFamily);
    scene.zetTrein(rij, beeld);
  }, [scene, rij, beeld]);
  useEffect(() => {
    scene?.zetKaarten(kaartSleutel ? kaartSleutel.split(",").map(Number) : [], beeld, inGat);
  }, [scene, kaartSleutel, beeld, inGat]);
  useEffect(() => {
    scene?.zetVandaag(vandaag);
  }, [scene, vandaag, rij]);
  useEffect(() => {
    scene?.zetWeekend(weekend);
  }, [scene, weekend, rij]);
  useEffect(() => {
    scene?.zetLicht(lichtSleutel ? lichtSleutel.split(",") : []);
  }, [scene, lichtSleutel, rij, kaartSleutel, inGat]);
  const vorigGolf = useRef(golf?.n ?? 0);
  useEffect(() => {
    if (!scene || !golf || golf.n === vorigGolf.current) return;
    vorigGolf.current = golf.n;
    scene.golfBij(golf.id);
  }, [scene, golf]);

  /* Slepen: de knop ligt over de kaart; het plaatje in Phaser volgt de vinger. */
  const sleep = useRef<{ dag: number; id: number; vanX: number; vanY: number; startX: number; startY: number; bewogen: boolean; raak: boolean } | null>(null);
  const punt = (e: { clientX: number; clientY: number }) => {
    const r = wortel.current?.getBoundingClientRect();
    const k = r && r.width ? r.width / 980 : 1;
    return { x: (e.clientX - (r?.left ?? 0)) / k, y: (e.clientY - (r?.top ?? 0)) / k };
  };
  const sleepAan = kies?.soort === "sleep";
  const pak = (e: RPointerEvent<HTMLButtonElement>, dag: number, thuis: Punt) => {
    if (!sleepAan || !scene || !kies?.tikbaar.includes(dag)) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = punt(e);
    sleep.current = { dag, id: e.pointerId, vanX: p.x - thuis.x, vanY: p.y - thuis.y, startX: p.x, startY: p.y, bewogen: false, raak: false };
  };
  const beweeg = (e: RPointerEvent<HTMLButtonElement>) => {
    const sl = sleep.current;
    if (!sl || e.pointerId !== sl.id || !scene) return;
    const p = punt(e);
    sl.bewogen ||= Math.hypot(p.x - sl.startX, p.y - sl.startY) > 6;
    if (sl.bewogen) sl.raak = scene.sleep(sl.dag, p.x - sl.vanX, p.y - sl.vanY);
  };
  const los = (e: RPointerEvent<HTMLButtonElement>) => {
    const sl = sleep.current;
    if (!sl || e.pointerId !== sl.id) return;
    sleep.current = null;
    if (!sl.bewogen) {
      /* Een tik: de kaart gaat naar de lege plek, of (als hij er al ligt) terug. */
      meld({ soort: inGat === sl.dag ? "terug" : "gelegd", dag: sl.dag });
      return;
    }
    scene?.laatLos(sl.dag, sl.raak);
    if (sl.raak) meld({ soort: "gelegd", dag: sl.dag });
    else if (inGat === sl.dag) meld({ soort: "terug", dag: sl.dag });
  };

  const n = rij?.length ?? 0;
  const gatI = rij ? rij.indexOf(null) : -1;
  const knop = (dag: number, r: { x: number; y: number; b: number; h: number }, soort: "wagon" | "kaart", thuis?: Punt) => {
    if (!kies) return null;
    const vinkje = kies.gekozen === dag || kies.vinkjes.includes(dag);
    const mag = kies.tikbaar.includes(dag);
    const naam = DAGEN[dag].naam;
    const sleepKnop = soort === "kaart" && sleepAan;
    return (
      <button
        key={`${beeld}-${soort}-${dag}`}
        type="button"
        className={`${s.knop} ${sleepKnop && mag ? s.sleepbaar : ""}`}
        style={{ left: r.x, top: r.y, width: r.b, height: r.h }}
        data-ding={naam}
        /* Een gekozen wagon of kaart heeft geen data-plek: dan tikt de speelcontrole iets anders aan (geleerd bij Getallenlijn). */
        data-plek={mag && !vinkje ? soort : undefined}
        data-gekozen={vinkje ? "" : undefined}
        disabled={!mag}
        aria-label={naam}
        aria-pressed={vinkje}
        onPointerDown={sleepKnop ? (e) => pak(e, dag, thuis ?? { x: r.x + r.b / 2, y: r.y + r.h }) : undefined}
        onPointerMove={sleepKnop ? beweeg : undefined}
        onPointerUp={sleepKnop ? los : undefined}
        onPointerCancel={
          sleepKnop
            ? () => {
                const sl = sleep.current;
                sleep.current = null;
                if (sl) scene?.laatLos(sl.dag, false);
              }
            : undefined
        }
        onClick={(e) => {
          if (!mag) return;
          if (sleepKnop) {
            /* Toetsenbord (Enter of spatie) en de automatische test: zonder slepen. Een muis of vinger loopt via pak/los. */
            if (e.detail === 0) meld({ soort: inGat === dag ? "terug" : "gelegd", dag });
            return;
          }
          meld({ soort: "dagKies", dag });
        }}
      >
        {vinkje && <Vinkje />}
      </button>
    );
  };

  return (
    <div ref={wortel} className={s.vlak} data-dagen-gouden="">
      <div ref={plek} style={HOLO_CANVAS} aria-hidden />
      {/* De plek van de lege plek (voor de test en het handje). */}
      {rij && gatI >= 0 && <div className={s.punt} style={{ left: plekX(n, gatI) + W / 2, top: RAIL_Y - 28 }} data-gatplek="" aria-hidden />}
      {kies?.soort === "wagon" && rij && rij.map((dag, i) => (dag === null ? null : knop(dag, wagonRect(n, i), "wagon")))}
      {kies &&
        kies.soort !== "wagon" &&
        kaarten.map((dag, i) => {
          const inDeGat = inGat === dag && rij && gatI >= 0;
          const r = inDeGat ? wagonRect(n, gatI) : kaartRect(kaarten.length, i);
          return knop(dag, r, "kaart", inDeGat ? { x: plekX(n, gatI) + W / 2, y: RAIL_Y } : { x: kaartX(kaarten.length, i), y: KBODEM });
        })}
      {hulphand && (
        <div
          key={hulphand.sleutel}
          className={`${s.hand} ${hulphand.naar ? s.sleepGebaar : s.tikGebaar}`}
          style={{ left: hulphand.plek.x, top: hulphand.plek.y, ...(hulphand.naar ? ({ "--dx": `${hulphand.naar.x - hulphand.plek.x}px`, "--dy": `${hulphand.naar.y - hulphand.plek.y}px` } as CSSProperties) : {}) }}
          aria-hidden
          data-hulphand=""
        >
          <svg viewBox="0 0 90 120" className={s.handTekening}>
            <g>
              <rect x="34" y="6" width="20" height="62" rx="10" />
              <rect x="16" y="52" width="60" height="56" rx="18" />
              <rect x="52" y="50" width="17" height="30" rx="8" />
              <rect x="64" y="58" width="15" height="28" rx="7" />
              <rect x="8" y="66" width="18" height="30" rx="9" />
            </g>
            <path d="M54 66v12M66 70v14" className={s.lijn} />
          </svg>
        </div>
      )}
    </div>
  );
}

function Vinkje() {
  return (
    <span className={s.vinkje} aria-hidden data-vinkje="">
      <svg viewBox="0 0 24 24">
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    </span>
  );
}
