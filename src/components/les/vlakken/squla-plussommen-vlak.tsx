"use client";

/**
 * Het speelvlak van de lessen "Plussommen" naar Squla groep 3 (30 oktober
 * 2026, opdracht eigenaar). Alles wordt in Phaser getekend (eigen tekenwerk,
 * squla-plussommen-tekenen.ts); getallen zijn scherpe HTML-tekst erbovenop.
 *
 * Wat er in beeld staat (`beeld.soort`):
 * - `bakkerij`: één of twee groepjes lekkers op een bord, een bakplaat, in een
 *   mand of een zak (eventueel met het aantal eronder);
 * - `etalage`: alleen een taart als versiering (bij "typ het antwoord");
 * - `disco`: discobal, luidsprekers en een draaitafel met 3 kaartjes (één of
 *   twee getallen) of 4 grammofoonplaten met een getal, om aan te tikken;
 * - `bus`: een bus met kinderen achter de ramen (bij 10 of meer: een
 *   dubbeldekker, de bovenste rij vol = 10) en de kinderen die instappen,
 *   als poppetjes of als getal in een rondje;
 * - `kaal`: een sierplaatje (plusteken met cijfers), zonder telhulp;
 * - `verbind`: 3 sommen links en 3 antwoorden rechts; lijnen ertussen.
 * `sommen`: kaartjes met een som onderaan, om aan te tikken.
 *
 * Wat het draaiboek verder zet: `actief` (tikken mag), `gekozen`, `uit`,
 * `goedIds` (ids van kaartjes), `lijnen`, `licht` (groepjes), `rek` (de rij
 * van 10 of 20 met stippen voor Bliepo's uitleg), `busLicht`, `busTel`,
 * `busLos`, en de tellers `goed` (lichtgolf, bij disco ook de spots) en
 * `fout` (zacht schudden). Tikken meldt `{ soort: "tik", id }`.
 *
 * Stijl: `plat` (vriendelijke platte tekeningen, geen gloed), `nacht` (donker,
 * met gebakken gloed) of `holo` (hologram, gebakken gloed).
 */

import { useEffect, useMemo } from "react";
import type { Vlakbasis } from "../soort";
import { holoBasis, TX, WARM, GOED, WERELDKLEUR, type PhaserModule } from "../holo/basis";
import { HOLO_CANVAS, useHoloMotor } from "../holo/motor";
import { speelLesgeluid } from "@/lib/lesgeluiden";
import {
  BUS,
  BUS_PLAATJE,
  DING,
  KLEUREN_DISCO,
  busBoven,
  hex,
  rekMaat,
  rekVakje,
  ruitX,
  tekenBak,
  tekenBundel,
  tekenBus,
  tekenCijfer,
  tekenDing,
  tekenDiscobal,
  tekenDraaitafel,
  tekenEtalage,
  tekenHoofd,
  tekenKaartje,
  tekenKind,
  tekenLuidspreker,
  tekenPlaat,
  tekenPlus,
  tekenRek,
  tekenRondje,
  tekenSomkaart,
  tekenStip,
  type Bak,
  type Ding,
} from "./squla-plussommen-tekenen";
import s from "./squla-plussommen.module.css";

export type { Bak, Ding };

/* ---------- soorten ---------- */

export type Groep = { n: number; ding: Ding; bak: Bak; label?: boolean };
/** Iets om aan te tikken. `tekst`: één of twee getallen, of een som. */
export type Kaart = { id: string; tekst: string[]; aria: string };

export type PlusBeeld =
  | { soort: "bakkerij"; id: string; groepen: Groep[] }
  | { soort: "etalage"; id: string }
  | { soort: "disco"; id: string; kaarten: Kaart[]; vorm: "kaartje" | "plaat" }
  | { soort: "bus"; id: string; inBus: number; instap: number; alsGetal: boolean }
  | { soort: "kaal"; id: string; level: number }
  | { soort: "verbind"; id: string; links: Kaart[]; rechts: Kaart[] };

export type Rek = { rijen: 1 | 2; a: number; b: number; bZicht?: number; labels?: { k: number; t: string }[]; vol?: boolean };
export type Lijn = { van: string; naar: string; stand: "nu" | "goed" | "fout" };
export type Stijl = "plat" | "nacht" | "holo";

export type PlusProps = {
  stijl: Stijl;
  beeld: PlusBeeld | null;
  sommen?: Kaart[];
  actief?: boolean;
  gekozen?: string[];
  uit?: string[];
  goedIds?: string[];
  lijnen?: Lijn[];
  licht?: number[];
  rek?: Rek | null;
  busLicht?: boolean;
  busTel?: number;
  busLos?: boolean;
  goed?: number;
  fout?: number;
};

/* ---------- waar staat wat (punten van het vlak, 980 × 720) ---------- */

type Rect = { x: number; y: number; b: number; h: number };
type Vak = Rect & { id: string; kaart: Kaart; soort: "kaartje" | "plaat" | "som" };
type GroepPlek = { box: Rect; items: { x: number; y: number }[]; schaal: number; label: { x: number; y: number } | null };

const MIDDEN = { x: 490, y: 400 };
const SOM = { b: 220, h: 84, y: 632, gat: 22 };

function bakkerijIndeling(groepen: Groep[], metSommen: boolean): GroepPlek[] {
  const groot = Math.max(...groepen.map((g) => g.n)) > 10;
  const cel = groot ? 60 : 72;
  const maten = groepen.map((g) => {
    const kol = Math.max(1, Math.min(5, g.n));
    const rij = Math.ceil(g.n / 5);
    const pad = g.bak === "bord" ? 26 : 20;
    const boven = g.bak === "mand" ? 34 : g.bak === "zak" ? 30 : 0;
    const b = Math.max(150, kol * cel + 2 * pad);
    const h = rij * cel + 2 * pad + boven;
    return { kol, rij, pad, boven, b, h };
  });
  const gat = 70;
  const breed = maten.reduce((t, m) => t + m.b, 0) + gat * (groepen.length - 1);
  const cy = metSommen ? 330 : 390;
  let x = MIDDEN.x - breed / 2;
  return groepen.map((g, i) => {
    const m = maten[i];
    const box = { x: x + m.b / 2, y: cy, b: m.b, h: m.h };
    const links = x + (m.b - m.kol * cel) / 2;
    const top = cy - m.h / 2 + m.boven + m.pad;
    const items = Array.from({ length: g.n }, (_, k) => ({ x: links + ((k % 5) + 0.5) * cel, y: top + (Math.floor(k / 5) + 0.5) * cel }));
    x += m.b + gat;
    return { box, items, schaal: cel / (DING + 6), label: g.label ? { x: box.x, y: cy + m.h / 2 + 34 } : null };
  });
}

function somVakken(sommen: Kaart[]): Vak[] {
  const n = sommen.length;
  const breed = n * SOM.b + (n - 1) * SOM.gat;
  return sommen.map((k, i) => ({ id: k.id, kaart: k, soort: "som", x: MIDDEN.x - breed / 2 + SOM.b / 2 + i * (SOM.b + SOM.gat), y: SOM.y, b: SOM.b, h: SOM.h }));
}

const DISCO = { bal: { x: 490, y: 220 }, speakers: [70, 910], tafel: { x: 490, y: 650 } };

function discoVakken(beeld: Extract<PlusBeeld, { soort: "disco" }>): Vak[] {
  if (beeld.vorm === "plaat")
    return beeld.kaarten.map((k, i) => ({ id: k.id, kaart: k, soort: "plaat", x: 490 + (i - (beeld.kaarten.length - 1) / 2) * 180, y: 470, b: 150, h: 150 }));
  return beeld.kaarten.map((k, i) => ({ id: k.id, kaart: k, soort: "kaartje", x: 490 + (i - (beeld.kaarten.length - 1) / 2) * 220, y: 548, b: 190, h: 112 }));
}

function verbindVakken(beeld: Extract<PlusBeeld, { soort: "verbind" }>): Vak[] {
  const rij = (kaarten: Kaart[], x: number) => kaarten.map((k, i): Vak => ({ id: k.id, kaart: k, soort: "som", x, y: 260 + i * 150, b: 230, h: 100 }));
  return [...rij(beeld.links, 260), ...rij(beeld.rechts, 720)];
}

function vakkenVan(beeld: PlusBeeld | null, sommen: Kaart[]): Vak[] {
  const v: Vak[] = [];
  if (beeld?.soort === "disco") v.push(...discoVakken(beeld));
  if (beeld?.soort === "verbind") v.push(...verbindVakken(beeld));
  v.push(...somVakken(sommen));
  return v;
}

/* De bus */
const INSTAP = { x0: 712, dx: 52, voet: 650, rij: 82 };
function instapPlek(i: number) {
  const r = Math.floor(i / 5);
  const k = i % 5;
  const sch = 1 - r * 0.07;
  return { x: INSTAP.x0 + k * INSTAP.dx + (r % 2) * 10, y: INSTAP.voet - r * INSTAP.rij, schaal: sch };
}
function hoofdPlek(k: number, dubbel: boolean) {
  const rijTop = dubbel ? (k < 10 ? BUS.rijBoven : BUS.rijOnder) : BUS.rijEnkel;
  const i = dubbel ? k % 10 : k;
  return { x: ruitX(i), y: rijTop + BUS.ruit.h - 25 };
}
const RONDJE = { x: 820, y: 520 };

/* ---------- de scène ---------- */

type Staat = {
  gekozen: string[];
  uit: string[];
  goedIds: string[];
  lijnen: Lijn[];
  licht: number[];
  busLicht: boolean;
  dim: boolean;
};

interface PlusScene {
  zetBeeld(beeld: PlusBeeld | null, sommen: Kaart[], stijl: Stijl): void;
  zetStaat(st: Staat): void;
  zetRek(rek: Rek | null, stijl: Stijl): void;
  zetBus(los: boolean): void;
  goed(): void;
  fout(): void;
}

function maakPlusScene(Phaser: PhaserModule, rustig: boolean) {
  const Basis = holoBasis(Phaser, rustig);
  type Img = import("phaser").GameObjects.Image;
  type Box = import("phaser").GameObjects.Container;
  type Gfx = import("phaser").GameObjects.Graphics;

  class Plus extends Basis implements PlusScene {
    stijl: Stijl = "plat";
    hoofd: Box | null = null;
    sleutel = "";
    beeld: PlusBeeld | null = null;
    vakken: Vak[] = [];
    vakImg = new Map<string, Img>();
    groepen: GroepPlek[] = [];
    markering: Gfx | null = null;
    lijnLaag: Gfx | null = null;
    rekBox: Box | null = null;
    rekSleutel = "";
    rekStippen: Img[] = [];
    rekZicht = 0;
    instappers: Box | null = null;
    rondje: Img | null = null;
    bal: Img | null = null;
    staat: Staat = { gekozen: [], uit: [], goedIds: [], lijnen: [], licht: [], busLicht: false, dim: false };

    constructor() {
      super("squla-plussommen");
    }

    maak() {
      this.markering = this.add.graphics().setDepth(5);
      this.lijnLaag = this.add.graphics().setDepth(4);
    }

    /** Een plaatje: één keer tekenen, en in nacht of holo ook de gloed bakken. */
    tex(sl: string, b: number, h: number, teken: (c: CanvasRenderingContext2D) => void, gloed: number = WERELDKLEUR.neutraal) {
      const naam = `sqp-${sl}`;
      this.canvasPlaatje(naam, b, h, teken);
      if (this.stijl === "plat") return naam;
      this.bak(naam, `${naam}-g`, gloed);
      return `${naam}-g`;
    }

    plek(box: Box, sl: string, x: number, y: number) {
      const im = this.plaats(sl, x - MIDDEN.x, y - MIDDEN.y);
      box.add(im);
      return im;
    }

    zetBeeld(beeld: PlusBeeld | null, sommen: Kaart[], stijl: Stijl) {
      const sleutel = beeld ? `${beeld.id}|${sommen.map((k) => k.id).join(",")}` : "";
      if (sleutel === this.sleutel) return;
      this.sleutel = sleutel;
      this.stijl = stijl;
      if (this.hoofd) this.verdwijn(this.hoofd);
      this.hoofd = null;
      this.vakImg.clear();
      this.groepen = [];
      this.instappers = null;
      this.rondje = null;
      this.bal = null;
      this.beeld = beeld;
      this.markering?.clear();
      this.lijnLaag?.clear();
      if (!beeld) return;
      const box = this.add.container(MIDDEN.x, MIDDEN.y);
      this.hoofd = box;
      const nacht = stijl === "nacht";

      if (beeld.soort === "bakkerij") {
        this.groepen = bakkerijIndeling(beeld.groepen, sommen.length > 0);
        beeld.groepen.forEach((g, i) => {
          const p = this.groepen[i];
          const sl = this.tex(`bak-${g.bak}-${p.box.b}-${p.box.h}`, p.box.b, p.box.h, (c) => tekenBak(c, g.bak, p.box.b, p.box.h), WARM);
          this.plek(box, sl, p.box.x, p.box.y);
          const ding = this.tex(`ding-${g.ding}`, DING, DING, (c) => tekenDing(c, g.ding), WARM);
          for (const q of p.items) this.plek(box, ding, q.x, q.y).setScale(p.schaal / TX);
        });
      } else if (beeld.soort === "etalage") {
        this.plek(box, this.tex("etalage", 320, 280, tekenEtalage, WARM), 490, 420);
      } else if (beeld.soort === "disco") {
        const spk = this.tex("speaker", 140, 220, tekenLuidspreker, WERELDKLEUR.universum);
        DISCO.speakers.forEach((x) => this.plek(box, spk, x, 470));
        this.bal = this.plek(box, this.tex("bal", 160, 160, tekenDiscobal, WERELDKLEUR.oceaan), DISCO.bal.x, DISCO.bal.y);
        this.plek(box, this.tex("tafel", 560, 130, tekenDraaitafel, WERELDKLEUR.universum), DISCO.tafel.x, DISCO.tafel.y);
      } else if (beeld.soort === "bus") {
        const dubbel = beeld.inBus >= 10;
        this.plek(box, this.tex(`bus-${dubbel ? 2 : 1}`, BUS_PLAATJE.b, BUS_PLAATJE.h, (c) => tekenBus(c, dubbel), WARM), BUS_PLAATJE.x0 + BUS_PLAATJE.b / 2, BUS_PLAATJE.y0 + BUS_PLAATJE.h / 2);
        for (let k = 0; k < beeld.inBus; k++) {
          const q = hoofdPlek(k, dubbel);
          this.plek(box, this.tex(`hoofd-${k % 7}`, 40, 50, (c) => tekenHoofd(c, k), WARM), q.x, q.y);
        }
        /* De pijl naar de deur. */
        const pijl = this.add.graphics();
        const van = beeld.alsGetal ? { x: RONDJE.x - 70, y: RONDJE.y - 40 } : { x: 760, y: instapPlek(Math.max(0, beeld.instap - 1)).y - 110 };
        const naar = { x: BUS.deur.x + BUS.deur.b + 8, y: (dubbel ? BUS.rijOnder : BUS.rijEnkel) + 40 };
        const ctrl = { x: (van.x + naar.x) / 2, y: Math.min(van.y, naar.y) - 70 };
        const pad = new Phaser.Curves.QuadraticBezier(new Phaser.Math.Vector2(van.x - MIDDEN.x, van.y - MIDDEN.y), new Phaser.Math.Vector2(ctrl.x - MIDDEN.x, ctrl.y - MIDDEN.y), new Phaser.Math.Vector2(naar.x - MIDDEN.x, naar.y - MIDDEN.y));
        pijl.lineStyle(9, 0x2f6fe0, 1);
        pad.draw(pijl, 24);
        const eind = pad.getPoint(1);
        const voor = pad.getPoint(0.9);
        const hoek = Math.atan2(eind.y - voor.y, eind.x - voor.x);
        pijl.fillStyle(0x2f6fe0, 1);
        pijl.fillTriangle(
          eind.x + Math.cos(hoek) * 14,
          eind.y + Math.sin(hoek) * 14,
          eind.x + Math.cos(hoek + 2.4) * 22,
          eind.y + Math.sin(hoek + 2.4) * 22,
          eind.x + Math.cos(hoek - 2.4) * 22,
          eind.y + Math.sin(hoek - 2.4) * 22,
        );
        box.add(pijl);
        if (beeld.alsGetal) this.rondje = this.plek(box, this.tex("rondje", 130, 130, tekenRondje, WARM), RONDJE.x, RONDJE.y);
        else this.instappers = this.maakInstappers(box, beeld.instap);
      } else if (beeld.soort === "kaal") {
        const kleur = ["#7fe9ff", "#ffd36e", "#c9b6ff"][(beeld.level - 1) % 3];
        const gloed = [WERELDKLEUR.oceaan, WERELDKLEUR.aarde, WERELDKLEUR.universum][(beeld.level - 1) % 3];
        this.plek(box, this.tex(`plus-${beeld.level}`, 200, 200, (c) => tekenPlus(c, kleur), gloed), 490, 410);
        const cijfers = ["3", "7", "1", "9", "5", "2", "8", "4"];
        const plekken = [[220, 230], [760, 220], [170, 470], [810, 470], [330, 610], [650, 610], [300, 380], [690, 360]];
        cijfers.forEach((cf, i) => {
          const im = this.plek(box, this.tex(`cijfer-${cf}-${beeld.level}`, 80, 88, (c) => tekenCijfer(c, cf, kleur), gloed), plekken[i][0], plekken[i][1]);
          im.setAlpha(0.75).setScale(0.8 / TX);
          if (!this.rustig) this.tweens.add({ targets: im, y: im.y - 14, duration: 1400 + i * 170, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
        });
      }

      /* De kaartjes, platen en sommen om aan te tikken. */
      this.vakken = vakkenVan(beeld, sommen);
      this.vakken.forEach((v, i) => {
        let sl: string;
        if (v.soort === "plaat") {
          const kleur = KLEUREN_DISCO[i % KLEUREN_DISCO.length];
          sl = this.tex(`plaat-${i % KLEUREN_DISCO.length}`, v.b, v.h, (c) => tekenPlaat(c, v.b, kleur), hex(kleur));
        } else if (v.soort === "kaartje") {
          const kleur = KLEUREN_DISCO[(i * 2 + 1) % KLEUREN_DISCO.length];
          const n = v.kaart.tekst.length;
          sl = this.tex(`kaartje-${n}-${kleur}`, v.b, v.h, (c) => tekenKaartje(c, v.b, v.h, kleur, n), hex(kleur));
        } else sl = this.tex(`som-${v.b}-${v.h}-${nacht ? 1 : 0}`, v.b, v.h, (c) => tekenSomkaart(c, v.b, v.h, nacht), WARM);
        this.vakImg.set(v.id, this.plek(box, sl, v.x, v.y));
      });

      this.tover(box);
      this.tekenStaat();
    }

    maakInstappers(box: Box, n: number) {
      const groep = this.add.container(0, 0);
      /* Achterste rij eerst, dan staan de voorste ervoor. */
      for (let i = n - 1; i >= 0; i--) {
        const q = instapPlek(i);
        const im = this.plaats(this.tex(`kind-${i % 7}`, 44, 90, (c) => tekenKind(c, i + 3), WARM), q.x - MIDDEN.x, q.y - MIDDEN.y).setOrigin(0.5, 1);
        im.setScale(q.schaal / TX);
        groep.add(im);
      }
      box.add(groep);
      return groep;
    }

    zetBus(los: boolean) {
      const b = this.beeld;
      if (!b || b.soort !== "bus" || !b.alsGetal || !this.hoofd) return;
      if (los && !this.instappers) {
        this.rondje?.setVisible(false);
        this.instappers = this.maakInstappers(this.hoofd, b.instap);
        this.tover(this.instappers);
      } else if (!los && this.instappers) {
        this.instappers.destroy();
        this.instappers = null;
        this.rondje?.setVisible(true);
      }
    }

    zetStaat(st: Staat) {
      this.staat = st;
      this.tekenStaat();
    }

    tekenStaat() {
      const st = this.staat;
      const m = this.markering;
      if (!m) return;
      m.clear();
      for (const [id, im] of this.vakImg) im.setAlpha(st.uit.includes(id) ? 0.35 : 1);
      if (this.hoofd) this.hoofd.setAlpha(st.dim ? 0.12 : 1);
      if (st.dim) {
        this.lijnLaag?.clear();
        return;
      }
      const rand = (r: Rect, kleur: number, dik = 7, rond = 22) => {
        m.lineStyle(dik, kleur, 1);
        m.strokeRoundedRect(r.x - r.b / 2 - 8, r.y - r.h / 2 - 8, r.b + 16, r.h + 16, rond);
      };
      for (const v of this.vakken) {
        if (st.goedIds.includes(v.id)) {
          if (v.soort === "plaat") {
            m.lineStyle(8, GOED, 1);
            m.strokeCircle(v.x, v.y, v.b / 2 + 8);
          } else rand(v, GOED);
        } else if (st.gekozen.includes(v.id)) {
          if (v.soort === "plaat") {
            m.lineStyle(8, WARM, 1);
            m.strokeCircle(v.x, v.y, v.b / 2 + 8);
          } else rand(v, WARM);
        }
      }
      for (const g of st.licht) {
        const p = this.groepen[g];
        if (p) rand(p.box, WARM, 6, 30);
      }
      const b = this.beeld;
      if (st.busLicht && b?.soort === "bus") {
        const dubbel = b.inBus >= 10;
        const rijen = dubbel ? [{ y: BUS.rijBoven, n: 10 }, { y: BUS.rijOnder, n: b.inBus - 10 }] : [{ y: BUS.rijEnkel, n: b.inBus }];
        m.lineStyle(6, WARM, 1);
        for (const r of rijen) {
          if (r.n <= 0) continue;
          const x0 = ruitX(0) - BUS.ruit.b / 2 - 6;
          const x1 = ruitX(r.n - 1) + BUS.ruit.b / 2 + 6;
          m.strokeRoundedRect(x0, r.y - 6, x1 - x0, BUS.ruit.h + 12, 12);
        }
      }
      /* De lijnen tussen sommen en antwoorden. */
      const l = this.lijnLaag;
      if (!l) return;
      l.clear();
      for (const ln of st.lijnen) {
        const a = this.vakken.find((v) => v.id === ln.van);
        const z = this.vakken.find((v) => v.id === ln.naar);
        if (!a || !z) continue;
        const kleur = ln.stand === "goed" ? GOED : ln.stand === "fout" ? 0xff7b7b : this.stijl === "plat" ? 0x2b2f45 : 0xffffff;
        l.lineStyle(8, kleur, 1);
        l.lineBetween(a.x + a.b / 2, a.y, z.x - z.b / 2, z.y);
        l.fillStyle(kleur, 1);
        l.fillCircle(a.x + a.b / 2, a.y, 9);
        l.fillCircle(z.x - z.b / 2, z.y, 9);
      }
    }

    zetRek(rek: Rek | null, stijl: Stijl) {
      this.stijl = stijl;
      const sleutel = rek ? `${rek.rijen}|${rek.a}|${rek.b}` : "";
      if (sleutel !== this.rekSleutel) {
        this.rekSleutel = sleutel;
        if (this.rekBox) this.verdwijn(this.rekBox);
        this.rekBox = null;
        this.rekStippen = [];
        this.rekZicht = 0;
        if (!rek) return;
        const maat = rekMaat(rek.rijen);
        const box = this.add.container(MIDDEN.x, MIDDEN.y).setDepth(8);
        box.add(this.plaats(this.tex(`rek-${rek.rijen}`, maat.b, maat.h, (c) => tekenRek(c, rek.rijen, stijl !== "plat"), WERELDKLEUR.neutraal), 0, 0));
        const oranje = this.tex("stip-oranje", 50, 50, (c) => tekenStip(c, "#ffad5c"), 0xffad5c);
        const blauw = this.tex("stip-blauw", 50, 50, (c) => tekenStip(c, "#5aa8ff"), 0x8fc4ff);
        for (let k = 0; k < rek.a + rek.b && k < rek.rijen * 10; k++) {
          const q = rekVakje(k, rek.rijen);
          const im = this.plaats(k < rek.a ? oranje : blauw, q.x, q.y);
          if (k >= rek.a) im.setVisible(false);
          box.add(im);
          this.rekStippen.push(im);
        }
        this.rekBox = box;
        this.tover(box);
      }
      if (!rek || !this.rekBox) return;
      const zicht = rek.a + Math.min(rek.b, rek.bZicht ?? rek.b);
      this.rekStippen.forEach((im, k) => {
        const aan = k < zicht;
        if (aan && !im.visible) {
          im.setVisible(true);
          if (!this.rustig) {
            const sch = 1 / TX;
            im.setScale(sch * 0.3);
            this.tweens.add({ targets: im, scale: sch, duration: 200, delay: Math.max(0, k - Math.max(this.rekZicht, rek.a)) * 120, ease: "Back.easeOut" });
          }
        } else if (!aan) im.setVisible(false);
      });
      this.rekZicht = zicht;
    }

    goed() {
      const b = this.beeld;
      this.golf(MIDDEN.x, MIDDEN.y);
      if (this.rustig || b?.soort !== "disco") return;
      /* De spots gaan aan en de discobal draait even. */
      KLEUREN_DISCO.slice(0, 4).forEach((k, i) => {
        const bundel = this.plaats(this.tex(`bundel-${i}`, 60, 300, (c) => tekenBundel(c, k), hex(k)), DISCO.bal.x, DISCO.bal.y).setOrigin(0.5, 0);
        bundel.setAngle(-50 + i * 33).setAlpha(0).setDepth(3);
        this.tweens.add({ targets: bundel, alpha: 0.9, angle: bundel.angle + 22, duration: 600, yoyo: true, repeat: 1, onComplete: () => bundel.destroy() });
      });
      if (this.bal) this.tweens.add({ targets: this.bal, angle: 360, duration: 1400, onComplete: () => this.bal?.setAngle(0) });
    }

    fout() {
      if (this.hoofd) this.schud(this.hoofd);
    }

    /** Voor `npm run vloeiend`: het beeld van nu steeds opnieuw tevoorschijn toveren, met de lichtgolf. */
    demo(ms: number) {
      const eind = performance.now() + ms;
      const beeld = this.beeld;
      const sommen = this.vakken.filter((v) => v.soort === "som" && !(beeld?.soort === "verbind")).map((v) => v.kaart);
      let k = 0;
      const stap = () => {
        if (performance.now() > eind) return;
        if (beeld) {
          this.sleutel = "";
          this.zetBeeld({ ...beeld, id: `${beeld.id}-demo-${k++}` } as PlusBeeld, sommen, this.stijl);
        }
        this.time.delayedCall(420, () => this.goed());
        this.time.delayedCall(900, stap);
      };
      stap();
    }
  }
  return Plus as unknown as new () => import("phaser").Scene;
}

/* ---------- het vlak ---------- */

export function SqulaPlusVlak({
  stijl,
  beeld,
  sommen = [],
  actief = false,
  gekozen = [],
  uit = [],
  goedIds = [],
  lijnen = [],
  licht = [],
  rek = null,
  busLicht = false,
  busTel = 0,
  busLos = false,
  goed = 0,
  fout = 0,
  meld,
  schaal,
}: PlusProps & Vlakbasis) {
  const { plek, scene } = useHoloMotor<PlusScene>(schaal, maakPlusScene, { invoer: false });
  const sommenSleutel = JSON.stringify(sommen);
  const beeldSleutel = JSON.stringify(beeld);
  const vakken = useMemo(() => vakkenVan(JSON.parse(beeldSleutel) as PlusBeeld | null, JSON.parse(sommenSleutel) as Kaart[]), [beeldSleutel, sommenSleutel]);

  useEffect(() => {
    scene?.zetBeeld(JSON.parse(beeldSleutel) as PlusBeeld | null, JSON.parse(sommenSleutel) as Kaart[], stijl);
  }, [scene, beeldSleutel, sommenSleutel, stijl]);

  const dim = Boolean(rek);
  const staatSleutel = JSON.stringify({ gekozen, uit, goedIds, lijnen, licht, busLicht, dim });
  useEffect(() => {
    scene?.zetStaat(JSON.parse(staatSleutel) as Staat);
  }, [scene, staatSleutel, beeldSleutel]);

  const rekSleutel = JSON.stringify(rek);
  useEffect(() => {
    scene?.zetRek(JSON.parse(rekSleutel) as Rek | null, stijl);
  }, [scene, rekSleutel, stijl]);

  useEffect(() => {
    scene?.zetBus(busLos);
  }, [scene, busLos, beeldSleutel]);

  useEffect(() => {
    if (scene && goed > 0) scene.goed();
  }, [scene, goed]);
  useEffect(() => {
    if (scene && fout > 0) scene.fout();
  }, [scene, fout]);

  const nacht = stijl !== "plat";
  const groepen = beeld?.soort === "bakkerij" ? bakkerijIndeling(beeld.groepen, sommen.length > 0) : [];

  /* Getallen bij de bus: in de bus (bij het samen tellen) en boven elk geteld kind. */
  const busLabels: { k: string; x: number; y: number; t: string }[] = [];
  if (beeld?.soort === "bus") {
    if (busLicht) busLabels.push({ k: "bus", x: 330, y: busBoven(beeld.inBus >= 10) - 34, t: beeld.inBus >= 10 ? `10 + ${beeld.inBus - 10}` : String(beeld.inBus) });
    for (let i = 0; i < busTel && i < beeld.instap; i++) {
      const q = instapPlek(i);
      busLabels.push({ k: `t${i}`, x: q.x, y: q.y - 98 * q.schaal - 18, t: String(beeld.inBus + i + 1) });
    }
  }

  return (
    <div className={`${s.vlak} ${nacht ? s.nacht : ""}`}>
      <div ref={plek} style={HOLO_CANVAS} aria-hidden />
      {!dim &&
        groepen.map((g, i) =>
          g.label && beeld?.soort === "bakkerij" ? (
            <div key={`l${i}`} className={s.label} style={{ left: g.label.x, top: g.label.y }} aria-hidden>
              {beeld.groepen[i].n}
            </div>
          ) : null,
        )}
      {!dim && beeld?.soort === "bus" && beeld.alsGetal && !busLos && (
        <div className={s.rondgetal} style={{ left: RONDJE.x, top: RONDJE.y }} aria-hidden>
          {beeld.instap}
        </div>
      )}
      {!dim &&
        busLabels.map((b) => (
          <div key={b.k} className={b.k === "bus" ? s.busgetal : s.telgetal} style={{ left: b.x, top: b.y }} aria-hidden>
            {b.t}
          </div>
        ))}
      {!dim &&
        vakken.map((v) => {
          const twee = v.kaart.tekst.length === 2 && v.soort === "kaartje";
          return (
            <button
              key={v.id}
              type="button"
              className={`${s.vak} ${s[v.soort]} ${uit.includes(v.id) ? s.uit : ""}`}
              style={{ left: v.x - v.b / 2, top: v.y - v.h / 2, width: v.b, height: v.h }}
              data-ding={v.id}
              aria-label={v.kaart.aria}
              disabled={!actief || uit.includes(v.id)}
              onClick={() => {
                speelLesgeluid("tik");
                meld({ soort: "tik", id: v.id });
              }}
            >
              {twee ? (
                <>
                  <span className={s.links}>{v.kaart.tekst[0]}</span>
                  <span className={s.rechts}>{v.kaart.tekst[1]}</span>
                </>
              ) : (
                <span>{v.kaart.tekst[0]}</span>
              )}
            </button>
          );
        })}
      {rek &&
        (rek.labels ?? []).map((lb) => {
          const q = rekVakje(lb.k, rek.rijen);
          return (
            <div key={`r${lb.k}`} className={s.stipgetal} style={{ left: MIDDEN.x + q.x, top: MIDDEN.y + q.y }} aria-hidden>
              {lb.t}
            </div>
          );
        })}
    </div>
  );
}

/* ---------- tekeningen voor de kaart aan het eind (244 × 190) ---------- */

export function KaartBakkerij() {
  return (
    <>
      <ellipse cx={122} cy={130} rx={100} ry={34} fill="#ffffff" stroke="#9db4c8" strokeWidth={4} />
      {[70, 122, 174].map((x) => (
        <ellipse key={x} cx={x} cy={112} rx={26} ry={18} fill="#f2c27b" stroke="#5b3a1e" strokeWidth={3} />
      ))}
      <text x={122} y={58} textAnchor="middle" fontSize={44} fontWeight={800} fill="#ffffff">
        +
      </text>
    </>
  );
}

export function KaartDisco() {
  return (
    <>
      <circle cx={122} cy={70} r={46} fill="#c8d3e6" stroke="#5d6a86" strokeWidth={4} />
      {[-24, 0, 24].map((d) => (
        <line key={d} x1={86} y1={70 + d} x2={158} y2={70 + d} stroke="#8fa0c8" strokeWidth={3} />
      ))}
      <rect x={42} y={130} width={160} height={40} rx={12} fill="#8a5cf0" stroke="#1b1f33" strokeWidth={4} />
      <text x={122} y={160} textAnchor="middle" fontSize={26} fontWeight={800} fill="#ffffff">
        10
      </text>
    </>
  );
}

export function KaartBus() {
  return (
    <>
      <rect x={26} y={50} width={192} height={96} rx={18} fill="#e8483f" stroke="#2b2f45" strokeWidth={5} />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={40 + i * 36} y={64} width={28} height={32} rx={6} fill="#cfefff" stroke="#2b2f45" strokeWidth={3} />
      ))}
      <rect x={186} y={64} width={22} height={70} rx={5} fill="#cfefff" stroke="#2b2f45" strokeWidth={3} />
      <circle cx={70} cy={150} r={20} fill="#2b2f45" />
      <circle cx={174} cy={150} r={20} fill="#2b2f45" />
    </>
  );
}

export function KaartKaal() {
  return (
    <>
      <rect x={100} y={30} width={44} height={130} rx={16} fill="#7fe9ff" stroke="#ffffff" strokeWidth={4} />
      <rect x={57} y={73} width={130} height={44} rx={16} fill="#7fe9ff" stroke="#ffffff" strokeWidth={4} />
      <rect x={102} y={75} width={40} height={40} fill="#7fe9ff" />
    </>
  );
}
