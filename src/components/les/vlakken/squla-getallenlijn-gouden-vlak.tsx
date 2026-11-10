"use client";

/**
 * Het speelvlak van de GOUDEN LES GETALLENLIJN (squla-getallenlijn-kat-1-gouden, 10 november 2026; BOUWREGELS
 * hoofdstuk 15). Een nieuw vlak naast SqulaGetallenlijn (squla-getallenlijn-vlak.tsx); dat vlak en de oude les blijven
 * precies zoals ze zijn. Dezelfde plaatjes (raketje, ufo, satelliet, kaarten, vakken, bordjes uit
 * squla-getallenlijn-teken.ts, alleen gelezen), in PHASER (HARDE REGEL 7). Alles staat links van het vaste tekstvak
 * (x < 850 van de 980; keuring Meer-minder, BOUWREGELS 15.30), zodat een lange hint nooit over de lijn valt.
 *
 *   - `beeld`: een getallenlijn, 3 bordjes of de vakken met kaarten. Een nieuw `id` = Bliepo tovert het beeld
 *     tevoorschijn; zelfde id = alleen wat verandert beweegt.
 *   - `raketje`: waar het raketje staat. Verandert het getal bij hetzelfde beeld, dan SPRINGT het (draaiboek §3 B:
 *     het figuurtje springt per 1, met een boog).
 *   - `bogen`: de bogen van de sprongen (draaiboek §0: elke sprong krijgt een boog die blijft staan tot de som klaar is).
 *   - `extra`: getallen die er op de lijn bij komen (het antwoord, pas na het antwoord of bij het samen voordoen, 15.11).
 *   - `tik` + `grijs`: de getallen die het kind mag aantikken (meldt `{ soort: "getalTik", n }`); met `grijs` zijn de
 *     andere getallen dof (draaiboek §0: tikbare getallen wit, de rest grijs).
 *   - `wezens`: tikken op het raketje, de ufo of de satelliet (meldt `{ soort: "wezenTik", naam }`); het gekozen ding
 *     krijgt alleen een vinkje (6.5, 7.8a).
 *   - `orden`: de kaarten slepen of aantikken naar de vakken (meldt `{ soort: "ordenStand", vakken }`); `terug` ophogen
 *     = alle kaarten glijden terug; `zet` = Bliepo legt een kaart in een vak (samen voordoen).
 *   - `licht`: het RODE RONDJE om wat Bliepo noemt (7.8; alleen als hij het noemt). Nooit om het antwoord.
 *   - `hulphand`: het HULPHANDJE (15.19): de les zet het na ± 6 s stilte bij een opdracht; nooit een knop.
 *   - `golf` ophogen = een rustige lichtgolf (7.6) op een plek.
 * Maten in punten van het vlak (980 × 720).
 */

import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as RPointerEvent } from "react";
import type { Vlakbasis } from "../soort";
import { holoBasis, TX, type PhaserModule } from "../holo/basis";
import { HOLO_CANVAS, useHoloMotor } from "../holo/motor";
import { maakPlaatjes } from "./squla-getallenlijn-teken";
import s from "./squla-getallenlijn-gouden.module.css";

export type Punt = { x: number; y: number };
export type GLWezen = "raketje" | "ufo" | "satelliet";

export type GLBeeld =
  | { soort: "leeg"; id: string }
  | {
      soort: "lijn";
      id: string;
      van: number;
      tot: number;
      /** Alleen deze streepjes (anders elk stapje). */
      streepjes?: number[];
      /** Bij deze streepjes staat het getal. */
      labels: number[];
      /** De lijn loopt na `tot` nog een stukje door (zonder getallen, vervagend). */
      door?: boolean;
      /** Andere dingen op de lijn. */
      wezens?: { soort: Exclude<GLWezen, "raketje">; n: number }[];
    }
  | { soort: "bordjes"; id: string; getallen: number[] }
  | { soort: "orden"; id: string; vakken: (number | null)[]; kaarten: number[] };

export type GLLicht = { soort: "getal"; n: number } | { soort: "bordje"; n: number } | { soort: "vak"; i: number } | { soort: "wezen"; naam: GLWezen } | null;
export type GLHand = { plek: Punt; naar?: Punt | null; sleutel: string };

export type GLProps = {
  beeld: GLBeeld;
  raketje?: number | null;
  bogen?: [number, number][];
  extra?: number[];
  tik?: number[] | null;
  grijs?: boolean;
  wezens?: { gekozen: string | null; tikbaar: boolean; alleen?: string | null } | null;
  orden?: { actief: boolean; terug: number; zet?: { kaarten: { n: number; vak: number }[]; k: number } | null } | null;
  licht?: GLLicht;
  hulphand?: GLHand | null;
  golf?: { plek: Punt; keer: number } | null;
};

/* ---------- de maten (links van het tekstvak) ---------- */

export const LIJN_Y = 400;
const LABEL_DY = 46;
const VAK_Y = 250;
const KAART_Y = 500;
const BORD_Y = 300;

export function lijnX(b: { van: number; tot: number; door?: boolean }) {
  const links = 90;
  const rechts = b.door ? 690 : 790;
  const eenheid = (rechts - links) / Math.max(1, b.tot - b.van);
  return { x: (n: number) => links + (n - b.van) * eenheid, eenheid };
}
/** Het midden van een getal onder de lijn. */
export const getalPlek = (b: { van: number; tot: number; door?: boolean }, n: number): Punt => ({ x: lijnX(b).x(n), y: LIJN_Y + LABEL_DY });
export const vakX = (i: number, k: number) => 430 + (i - (k - 1) / 2) * 140;
export const kaartX = (i: number, k: number) => 430 + (i - (k - 1) / 2) * 150;
export const vakPlek = (i: number, k: number): Punt => ({ x: vakX(i, k), y: VAK_Y });
export const kaartThuis = (i: number, k: number): Punt => ({ x: kaartX(i, k), y: KAART_Y });
export const bordX = (i: number, k: number) => 430 + (i - (k - 1) / 2) * 230;
export const bordPlek = (i: number, k: number): Punt => ({ x: bordX(i, k), y: BORD_Y - 34 });
/** Waar een ding op de lijn staat (midden van het plaatje) en hoe groot. */
export function wezenPlek(soort: GLWezen, x: number) {
  if (soort === "raketje") return { x, y: LIJN_Y - 62, b: 104, h: 104 };
  return { x, y: LIJN_Y - 52, b: 92, h: 92 };
}

/* ---------- Phaser ---------- */

interface Scene {
  zetFont(font: string): void;
  zetBeeld(b: GLBeeld): void;
  zetRaketje(n: number | null): void;
  zetBogen(bogen: [number, number][]): void;
  zetExtra(extra: number[]): void;
  zetGrijs(tik: number[] | null): void;
  zetLicht(l: GLLicht): void;
  legKaart(n: number, plek: Punt, snel?: boolean): void;
  golfOp(p: Punt): void;
}

function maakScene(Phaser: PhaserModule, rustig: boolean) {
  const Basis = holoBasis(Phaser, rustig);
  type Obj = import("phaser").GameObjects.GameObject & { destroy(): void };
  type Img = import("phaser").GameObjects.Image;
  type Txt = import("phaser").GameObjects.Text;
  type Box = import("phaser").GameObjects.Container;
  type Gfx = import("phaser").GameObjects.Graphics;

  class GoudenLijn extends Basis implements Scene {
    font = "system-ui, sans-serif";
    beeld: GLBeeld = { soort: "leeg", id: "" };
    alles: Obj[] = [];
    labels = new Map<number, Txt>();
    extraTekst = new Map<number, Txt>();
    raket: Img | null = null;
    raketN: number | null = null;
    wezenImg = new Map<string, Img>();
    bogenGfx: Gfx | null = null;
    bogenSleutel = "";
    kaarten = new Map<number, Box>();
    bordT = new Map<number, number>();
    rondje!: Img;
    lichtSl = "";
    tikbaar: number[] | null = null;

    constructor() {
      super("squla-getallenlijn-gouden");
    }

    zetFont(font: string) {
      if (font) this.font = font;
    }

    preload() {
      this.load.image("gl-rondje", "/rondje/rondje-rood-2.png");
    }

    maak() {
      maakPlaatjes(this);
      this.rondje = this.add.image(0, 0, "gl-rondje").setVisible(false).setDepth(30);
    }

    tekst(x: number, y: number, t: string, grootte: number) {
      return this.add
        .text(x, y, t, { fontFamily: this.font, fontSize: `${Math.round(grootte)}px`, fontStyle: "bold", color: "#ffffff", stroke: "#0a1a4a", strokeThickness: Math.max(4, Math.round(grootte / 8)), align: "center" })
        .setOrigin(0.5)
        .setResolution(2);
    }

    bewaar<T extends Obj>(o: T): T {
      this.alles.push(o);
      return o;
    }

    ruimOp() {
      for (const o of this.alles) {
        this.tweens.killTweensOf(o);
        o.destroy();
      }
      this.alles = [];
      this.labels.clear();
      this.extraTekst.clear();
      this.wezenImg.clear();
      this.kaarten.clear();
      this.bordT.clear();
      this.raket = null;
      this.raketN = null;
      this.bogenGfx = null;
      this.bogenSleutel = "";
      this.rondje.setVisible(false);
      this.lichtSl = "";
    }

    lijn() {
      return this.beeld.soort === "lijn" ? this.beeld : null;
    }

    zetBeeld(b: GLBeeld) {
      if (b.id === this.beeld.id) return;
      this.ruimOp();
      this.beeld = b;
      if (b.soort === "lijn") this.bouwLijn(b);
      else if (b.soort === "bordjes") this.bouwBordjes(b);
      else if (b.soort === "orden") this.bouwOrden(b);
    }

    bouwLijn(b: Extract<GLBeeld, { soort: "lijn" }>) {
      const { x, eenheid } = lijnX(b);
      const g = this.bewaar(this.add.graphics().setDepth(1));
      g.lineStyle(4, 0xe8f2ff, 0.9);
      g.lineBetween(x(b.van) - 26, LIJN_Y, x(b.tot) + (b.door ? 0 : 26), LIJN_Y);
      const streepjes = b.streepjes ?? Array.from({ length: b.tot - b.van + 1 }, (_, i) => b.van + i);
      for (const n of streepjes) {
        const groot = b.labels.includes(n) || n === b.van || n === b.tot || n % 5 === 0;
        const h = groot ? 18 : 11;
        g.lineBetween(x(n), LIJN_Y - h, x(n), LIJN_Y + h);
      }
      if (b.door)
        for (let k = 1; k <= 4; k++) {
          g.lineStyle(4, 0xe8f2ff, 0.9 * (1 - k / 5));
          g.lineBetween(x(b.tot + k - 1), LIJN_Y, x(b.tot + k), LIJN_Y);
          g.lineBetween(x(b.tot + k), LIJN_Y - 11, x(b.tot + k), LIJN_Y + 11);
        }
      this.tover(g as unknown as Img);
      const grootte = Math.min(40, Math.max(30, eenheid * 0.78));
      for (const n of b.labels) {
        const t = this.bewaar(this.tekst(x(n), LIJN_Y + LABEL_DY, String(n), grootte).setDepth(2));
        this.labels.set(n, t);
      }
      for (const w of b.wezens ?? []) {
        const p = wezenPlek(w.soort, x(w.n));
        const im = this.bewaar(this.plaats(`${w.soort}-g`, p.x, p.y).setScale(0.78 / TX).setDepth(4));
        this.wezenImg.set(w.soort, im);
        this.tover(im, { vertraging: 80 });
      }
    }

    bouwBordjes(b: Extract<GLBeeld, { soort: "bordjes" }>) {
      b.getallen.forEach((n, i) => {
        const x = bordX(i, b.getallen.length);
        const bord = this.bewaar(this.plaats("bordje-g", x, BORD_Y).setDepth(1));
        this.tover(bord, { vertraging: i * 90 });
        const t = this.bewaar(this.tekst(x, BORD_Y - 34, String(n), 56).setDepth(2));
        this.tover(t, { vertraging: i * 90 });
        this.bordT.set(n, i);
      });
    }

    bouwOrden(b: Extract<GLBeeld, { soort: "orden" }>) {
      const k = b.vakken.length;
      b.vakken.forEach((v, i) => {
        const x = vakX(i, k);
        const im = this.bewaar(this.plaats("vak", x, VAK_Y).setDepth(1));
        this.tover(im, { vertraging: i * 50 });
        if (v !== null) {
          const c = this.bewaar(this.add.container(x, VAK_Y, [this.plaats("kaart-vast-g", 0, 0), this.tekst(0, 2, String(v), 54)]).setDepth(2));
          this.tover(c, { vertraging: i * 50 });
        }
      });
      b.kaarten.forEach((n, i) => {
        const p = kaartThuis(i, b.kaarten.length);
        const c = this.bewaar(this.add.container(p.x, p.y, [this.plaats("kaart-g", 0, 0), this.tekst(0, 2, String(n), 54)]).setDepth(5));
        this.kaarten.set(n, c);
        this.tover(c, { vertraging: 200 + i * 70 });
      });
    }

    /** Het raketje: verschijnt (tover), of springt naar een ander getal met een boogje (draaiboek §3 B). */
    zetRaketje(n: number | null) {
      const b = this.lijn();
      if (!b || n === null) {
        if (this.raket) {
          this.raket.destroy();
          this.raket = null;
        }
        this.raketN = null;
        return;
      }
      const { x } = lijnX(b);
      const p = wezenPlek("raketje", x(n));
      if (!this.raket) {
        this.raket = this.bewaar(this.plaats("raketje-g", p.x, p.y).setScale(0.9 / TX).setDepth(6));
        this.tover(this.raket, { vertraging: 120 });
        this.raketN = n;
        return;
      }
      if (this.raketN === n) return;
      const r = this.raket;
      this.tweens.killTweensOf(r);
      /* Zelfde als bij de kaarten: een afgebroken verschijn-animatie mag het raketje niet onzichtbaar laten. */
      r.setAlpha(1).setScale(0.9 / TX);
      this.raketN = n;
      if (this.rustig) {
        r.setPosition(p.x, p.y);
        return;
      }
      const x0 = r.x;
      const y0 = r.y;
      const top = Math.min(y0, p.y) - 46;
      this.tweens.addCounter({
        from: 0,
        to: 1,
        duration: 420,
        ease: "Sine.easeInOut",
        onUpdate: (tw) => {
          const t = tw.getValue() ?? 0;
          r.setPosition(x0 + (p.x - x0) * t, (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * top + t * t * p.y);
        },
      });
    }

    /** De bogen van de sprongen: een warme boog boven de lijn per sprong (1 keer getekend als ze veranderen, niet elk beeld). */
    zetBogen(bogen: [number, number][]) {
      const b = this.lijn();
      const sl = JSON.stringify(bogen);
      if (sl === this.bogenSleutel) return;
      const nieuw = bogen.length > (this.bogenSleutel ? (JSON.parse(this.bogenSleutel) as unknown[]).length : 0);
      this.bogenSleutel = sl;
      this.bogenGfx?.destroy();
      this.bogenGfx = null;
      if (!b || !bogen.length) return;
      const { x } = lijnX(b);
      const g = this.bewaar(this.add.graphics().setDepth(3));
      bogen.forEach(([a, c], i) => {
        const xa = x(a);
        const xc = x(c);
        const h = 26 + Math.min(24, Math.abs(xc - xa) * 0.25);
        const laatst = i === bogen.length - 1;
        g.lineStyle(10, 0xffad5c, 0.18);
        const pad = new Phaser.Curves.QuadraticBezier(new Phaser.Math.Vector2(xa, LIJN_Y - 6), new Phaser.Math.Vector2((xa + xc) / 2, LIJN_Y - 6 - h * 2), new Phaser.Math.Vector2(xc, LIJN_Y - 6));
        pad.draw(g, 24);
        g.lineStyle(4.5, laatst ? 0xffc27a : 0xff9a6b, 1);
        pad.draw(g, 24);
        /* Een klein pijlpuntje aan het eind: de kant op van de sprong. */
        const r = Math.sign(xc - xa) || 1;
        g.fillStyle(laatst ? 0xffc27a : 0xff9a6b, 1);
        g.fillTriangle(xc, LIJN_Y - 4, xc - 11 * r, LIJN_Y - 15, xc - 2 * r, LIJN_Y - 18);
      });
      this.bogenGfx = g;
      if (nieuw && !this.rustig) {
        g.setAlpha(0.2);
        this.tweens.add({ targets: g, alpha: 1, duration: 260, ease: "Sine.easeOut" });
      }
    }

    /** Getallen die erbij komen (het antwoord in beeld): ze verschijnen met een lichtgolf. */
    zetExtra(extra: number[]) {
      const b = this.lijn();
      if (!b) return;
      const { x, eenheid } = lijnX(b);
      const grootte = Math.min(40, Math.max(30, eenheid * 0.78));
      for (const [n, t] of this.extraTekst)
        if (!extra.includes(n)) {
          t.destroy();
          this.extraTekst.delete(n);
        }
      for (const n of extra) {
        if (this.extraTekst.has(n) || this.labels.has(n)) continue;
        const t = this.bewaar(this.tekst(x(n), LIJN_Y + LABEL_DY, String(n), grootte).setDepth(2));
        this.extraTekst.set(n, t);
        this.tover(t);
      }
    }

    /** Alleen de getallen die het kind mag tikken zijn wit; de rest is dof (draaiboek §0). */
    zetGrijs(tik: number[] | null) {
      this.tikbaar = tik;
      for (const [n, t] of this.labels) t.setAlpha(!tik || tik.includes(n) ? 1 : 0.4);
    }

    zetLicht(l: GLLicht) {
      const sl = JSON.stringify(l);
      if (sl === this.lichtSl) return;
      this.lichtSl = sl;
      let doel: { x: number; y: number; b: number; h: number } | null = null;
      const b = this.beeld;
      if (l?.soort === "getal" && b.soort === "lijn") {
        const t = this.labels.get(l.n) ?? this.extraTekst.get(l.n);
        const p = getalPlek(b, l.n);
        doel = { x: p.x, y: p.y, b: t ? Math.max(30, t.displayWidth) : 34, h: t ? t.displayHeight * 0.8 : 34 };
      } else if (l?.soort === "bordje" && b.soort === "bordjes") {
        const i = b.getallen.indexOf(l.n);
        if (i >= 0) doel = { x: bordX(i, b.getallen.length), y: BORD_Y - 34, b: 90, h: 70 };
      } else if (l?.soort === "vak" && b.soort === "orden") doel = { x: vakX(l.i, b.vakken.length), y: VAK_Y, b: 100, h: 100 };
      else if (l?.soort === "wezen" && b.soort === "lijn") {
        const { x } = lijnX(b);
        const n = l.naam === "raketje" ? this.raketN : (b.wezens ?? []).find((z) => z.soort === l.naam)?.n;
        if (n !== null && n !== undefined) {
          const p = wezenPlek(l.naam, x(n));
          doel = { x: p.x, y: p.y, b: p.b * 0.8, h: p.h * 0.7 };
        }
      }
      if (!doel) {
        this.rondje.setVisible(false);
        return;
      }
      this.rondje
        .setPosition(doel.x, doel.y)
        .setDisplaySize(doel.b * 1.15 + 44, doel.h * 1.4 + 50)
        .setRotation(-0.026)
        .setAlpha(1)
        .setVisible(true);
    }

    /** Een kaart naar een plek (in een vak of terug), of meteen (tijdens het slepen). */
    legKaart(n: number, plek: Punt, snel = false) {
      const c = this.kaarten.get(n);
      if (!c) return;
      this.tweens.killTweensOf(c);
      /* Keurder 10 nov: killTweensOf stopt ook het verschijnen (tover zet alpha 0 en een platte schaal); zonder dit bleven
         de kaarten onzichtbaar als de les ze meteen na het nieuwe beeld terugzette. */
      c.setAlpha(1).setScale(1);
      if (snel || this.rustig) {
        c.setPosition(plek.x, plek.y).setDepth(snel ? 20 : 5);
        return;
      }
      c.setDepth(8);
      this.tweens.add({ targets: c, x: plek.x, y: plek.y, duration: 220, ease: "Cubic.easeOut", onComplete: () => c.setDepth(5) });
    }

    golfOp(p: Punt) {
      super.golf(p.x, p.y);
    }

    /** Voor `npm run vloeiend`: steeds opnieuw een lijn tevoorschijn toveren, het raketje laten springen met bogen en een lichtgolf. */
    demo(ms: number) {
      const eind = performance.now() + ms;
      let k = 0;
      const stap = () => {
        if (performance.now() > eind) return;
        this.zetBeeld({ soort: "lijn", id: `demo-${k++}`, van: 0, tot: 10, labels: [0, 1, 2, 3, 4, 5, 7, 8, 9, 10] });
        this.zetRaketje(0);
        const bogen: [number, number][] = [];
        for (let i = 1; i <= 4; i++)
          this.time.delayedCall(250 + i * 300, () => {
            bogen.push([i - 1, i]);
            this.zetBogen([...bogen]);
            this.zetRaketje(i);
            this.zetLicht({ soort: "getal", n: i === 4 ? 5 : i });
          });
        this.time.delayedCall(1700, () => {
          this.zetLicht(null);
          this.golfOp({ x: lijnX({ van: 0, tot: 10 }).x(4), y: LIJN_Y - 50 });
        });
        this.time.delayedCall(2000, stap);
      };
      stap();
    }
  }
  return GoudenLijn as unknown as new () => import("phaser").Scene;
}

/* ---------- het vlak ---------- */

export function GetallenlijnGoudenVlak({ beeld, raketje = null, bogen = [], extra = [], tik = null, grijs = false, wezens = null, orden = null, licht = null, hulphand = null, golf = null, meld, schaal }: GLProps & Vlakbasis) {
  const { plek, scene } = useHoloMotor<Scene>(schaal, maakScene);
  const wortel = useRef<HTMLDivElement>(null);
  const beeldSl = JSON.stringify(beeld);
  const b = useMemo(() => JSON.parse(beeldSl) as GLBeeld, [beeldSl]);
  const bogenSl = JSON.stringify(bogen);
  const extraSl = extra.join(",");
  const tikSl = tik ? tik.join(",") : "";
  const lichtSl = JSON.stringify(licht);

  useEffect(() => {
    if (!scene) return;
    if (wortel.current) scene.zetFont(getComputedStyle(wortel.current).fontFamily);
    scene.zetBeeld(b);
  }, [scene, b]);
  useEffect(() => {
    scene?.zetRaketje(raketje);
  }, [scene, raketje, b]);
  useEffect(() => {
    scene?.zetBogen(JSON.parse(bogenSl) as [number, number][]);
  }, [scene, bogenSl, b]);
  useEffect(() => {
    scene?.zetExtra(extraSl ? extraSl.split(",").map(Number) : []);
  }, [scene, extraSl, b]);
  useEffect(() => {
    scene?.zetGrijs(grijs && tikSl ? tikSl.split(",").map(Number) : null);
  }, [scene, tikSl, grijs, b]);
  useEffect(() => {
    scene?.zetLicht(JSON.parse(lichtSl) as GLLicht);
  }, [scene, lichtSl, b, extraSl, raketje]);
  const golfKeer = useRef(golf?.keer ?? 0);
  useEffect(() => {
    if (!scene || !golf || golf.keer === golfKeer.current) return;
    golfKeer.current = golf.keer;
    scene.golfOp(golf.plek);
  }, [scene, golf]);

  /* ---------- op volgorde: welke kaart ligt in welk vak (de les hoort het via `ordenStand`) ---------- */
  const ordenBeeld = b.soort === "orden" ? b : null;
  const terug = orden?.terug ?? 0;
  const zetK = orden?.zet ?? null;
  /* Wat de les zelf neerlegt (samen voordoen) of terugzet; daarna houdt het vlak bij wat het kind verschuift. */
  const basisSl = `${beeldSl}|${terug}|${zetK ? zetK.k : ""}`;
  const basis = (): Record<number, number | null> => (zetK ? Object.fromEntries(zetK.kaarten.map((z) => [z.n, z.vak])) : {});
  const [eigen, setEigen] = useState<{ sl: string; inVak: Record<number, number | null> }>({ sl: "", inVak: {} });
  const inVak = eigen.sl === basisSl ? eigen.inVak : basis();
  const setInVak = (nieuw: Record<number, number | null>) => setEigen({ sl: basisSl, inVak: nieuw });
  const inVakSl = JSON.stringify(inVak);
  useEffect(() => {
    if (!scene || !ordenBeeld) return;
    const stand = JSON.parse(inVakSl) as Record<number, number | null>;
    ordenBeeld.kaarten.forEach((n, i) => {
      const v = stand[n];
      scene.legKaart(n, v === null || v === undefined ? kaartThuis(i, ordenBeeld.kaarten.length) : vakPlek(v, ordenBeeld.vakken.length));
    });
  }, [scene, ordenBeeld, inVakSl]);
  const meldStand = (nieuw: Record<number, number | null>) => {
    if (!ordenBeeld) return;
    const vakken = ordenBeeld.vakken.map((v, i) => (v !== null ? v : (ordenBeeld.kaarten.find((n) => nieuw[n] === i) ?? null)));
    meld({ soort: "ordenStand", vakken });
  };
  const vrijVak = (stand: Record<number, number | null>, zelf: number) => (ordenBeeld ? ordenBeeld.vakken.findIndex((v, i) => v === null && !ordenBeeld.kaarten.some((n) => n !== zelf && stand[n] === i)) : -1);
  const kaartPlek = (n: number): Punt => {
    if (!ordenBeeld) return { x: 0, y: 0 };
    const v = inVak[n];
    return v === null || v === undefined ? kaartThuis(ordenBeeld.kaarten.indexOf(n), ordenBeeld.kaarten.length) : vakPlek(v, ordenBeeld.vakken.length);
  };

  const sleep = useRef<{ n: number; id: number; dx: number; dy: number; x0: number; y0: number; bewogen: boolean } | null>(null);
  const punt = (e: { clientX: number; clientY: number }) => {
    const r = wortel.current?.getBoundingClientRect();
    const k = r && r.width ? r.width / 980 : 1;
    return { x: (e.clientX - (r?.left ?? 0)) / k, y: (e.clientY - (r?.top ?? 0)) / k };
  };
  const tikKaart = (n: number) => {
    if (!orden?.actief || !ordenBeeld) return;
    const nieuw = { ...inVak };
    if (inVak[n] !== null && inVak[n] !== undefined) nieuw[n] = null;
    else {
      const v = vrijVak(inVak, n);
      if (v < 0) return;
      nieuw[n] = v;
    }
    setInVak(nieuw);
    meldStand(nieuw);
  };
  const pak = (e: RPointerEvent<HTMLButtonElement>, n: number) => {
    if (!orden?.actief) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = punt(e);
    const k = kaartPlek(n);
    sleep.current = { n, id: e.pointerId, dx: k.x - p.x, dy: k.y - p.y, x0: p.x, y0: p.y, bewogen: false };
  };
  const beweeg = (e: RPointerEvent<HTMLButtonElement>) => {
    const sl = sleep.current;
    if (!sl || e.pointerId !== sl.id || !scene) return;
    const p = punt(e);
    sl.bewogen ||= Math.hypot(p.x - sl.x0, p.y - sl.y0) > 8;
    if (sl.bewogen) scene.legKaart(sl.n, { x: p.x + sl.dx, y: p.y + sl.dy }, true);
  };
  const los = (e: RPointerEvent<HTMLButtonElement>) => {
    const sl = sleep.current;
    if (!sl || e.pointerId !== sl.id || !ordenBeeld) return;
    sleep.current = null;
    if (!sl.bewogen) {
      tikKaart(sl.n);
      return;
    }
    const p = punt(e);
    const cx = p.x + sl.dx;
    const cy = p.y + sl.dy;
    let beste = -1;
    let afstand = 95;
    ordenBeeld.vakken.forEach((v, i) => {
      if (v !== null || ordenBeeld.kaarten.some((n) => n !== sl.n && inVak[n] === i)) return;
      const d = Math.hypot(vakX(i, ordenBeeld.vakken.length) - cx, VAK_Y - cy);
      if (d < afstand) {
        afstand = d;
        beste = i;
      }
    });
    const nieuw = { ...inVak, [sl.n]: beste >= 0 ? beste : null };
    /* Loslaten naast een vak: de kaart gaat terug (ook als hij eerst in een vak lag). */
    setInVak(nieuw);
    if (scene) scene.legKaart(sl.n, beste >= 0 ? vakPlek(beste, ordenBeeld.vakken.length) : kaartThuis(ordenBeeld.kaarten.indexOf(sl.n), ordenBeeld.kaarten.length));
    if (JSON.stringify(nieuw) !== JSON.stringify(inVak)) meldStand(nieuw);
  };

  const lijnB = b.soort === "lijn" ? b : null;
  const wezenLijst: { soort: GLWezen; n: number }[] = lijnB ? [...(lijnB.wezens ?? []), ...(raketje !== null ? [{ soort: "raketje" as const, n: raketje }] : [])] : [];

  return (
    <div ref={wortel} className={s.vlak} data-getallenlijn-gouden="">
      <div ref={plek} style={HOLO_CANVAS} aria-hidden />
      {lijnB &&
        tik?.map((n) => {
          const p = getalPlek(lijnB, n);
          return (
            <button
              key={`g-${b.id}-${n}`}
              type="button"
              className={s.tik}
              style={{ left: p.x - 32, top: LIJN_Y - 24, width: 64, height: 100 }}
              data-ding={String(n)}
              data-plek="getal"
              aria-label={`Getal ${n}`}
              onClick={() => meld({ soort: "getalTik", n })}
            />
          );
        })}
      {lijnB &&
        wezens &&
        wezenLijst
          .filter((z) => !wezens.alleen || z.soort === wezens.alleen)
          .map((z) => {
            const p = wezenPlek(z.soort, lijnX(lijnB).x(z.n));
            return (
              <button
                key={`w-${b.id}-${z.soort}`}
                type="button"
                className={s.tik}
                style={{ left: p.x - p.b / 2, top: p.y - p.h / 2, width: p.b, height: p.h }}
                data-ding={z.soort}
                data-plek="wezen"
                aria-label={z.soort === "raketje" ? "Het raketje" : z.soort === "ufo" ? "De ufo" : "De satelliet"}
                aria-pressed={wezens.gekozen === z.soort}
                disabled={!wezens.tikbaar}
                onClick={() => wezens.tikbaar && meld({ soort: "wezenTik", naam: z.soort })}
              >
                {wezens.gekozen === z.soort && (
                  <span className={s.vinkje} aria-hidden data-vinkje="">
                    <svg viewBox="0 0 24 24">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
      {ordenBeeld &&
        orden?.actief &&
        ordenBeeld.kaarten.map((n) => {
          const p = kaartPlek(n);
          return (
            <button
              key={`k-${b.id}-${n}`}
              type="button"
              className={s.kaart}
              style={{ left: p.x - 56, top: p.y - 56, width: 112, height: 112 }}
              data-ding={String(n)}
              /* Een kaart die al in een vak ligt, heeft geen data-plek: de automatische test tikt zo steeds een losse kaart. */
              {...(inVak[n] === null || inVak[n] === undefined ? { "data-plek": "kaart" } : { "data-vak": "" })}
              aria-label={`Kaart ${n}`}
              onPointerDown={(e) => pak(e, n)}
              onPointerMove={beweeg}
              onPointerUp={los}
              onPointerCancel={() => {
                const sl = sleep.current;
                sleep.current = null;
                if (sl && scene && ordenBeeld) scene.legKaart(sl.n, kaartPlek(sl.n));
              }}
              /* Toetsenbord (Enter of spatie) en de automatische test: tikken zonder slepen. */
              onClick={(e) => {
                if (e.detail === 0) tikKaart(n);
              }}
            />
          );
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

/** Lijntekening voor de kaart aan het eind (244 × 190): een getallenlijn met 3 bogen en een raketje (zonder gezichtje). */
export function KaartGetallenlijn() {
  const x = (n: number) => 22 + n * 40;
  return (
    <>
      <line x1={10} y1={150} x2={234} y2={150} stroke="#ffffff" strokeWidth={4} strokeLinecap="round" />
      {[0, 1, 2, 3, 4, 5].map((n) => (
        <g key={n}>
          <line x1={x(n)} y1={140} x2={x(n)} y2={160} stroke="#ffffff" strokeWidth={3} />
          <text x={x(n)} y={182} textAnchor="middle" fontSize={17} fontWeight={800} fill="#ffffff">
            {n}
          </text>
        </g>
      ))}
      {[0, 1, 2].map((n) => (
        <path key={`b${n}`} d={`M${x(n)} 146 Q ${x(n) + 20} 112 ${x(n + 1)} 146`} fill="none" stroke="#ffad5c" strokeWidth={4} strokeLinecap="round" />
      ))}
      <g transform={`translate(${x(3)} 96)`}>
        <path d="M0 -40 C 14 -26 14 0 10 20 L -10 20 C -14 0 -14 -26 0 -40 Z" fill="#f4f6ff" stroke="#e8505b" strokeWidth={3} />
        <circle cx={0} cy={-8} r={6} fill="#7fc8ff" stroke="#2b3a66" strokeWidth={2} />
        <path d="M-10 8 L-20 24 L-10 20 Z M10 8 L20 24 L10 20 Z" fill="#e8505b" />
        <path d="M-6 22 Q0 38 6 22 Z" fill="#ffad5c" />
      </g>
    </>
  );
}
