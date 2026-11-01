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
 * - `bus`: een bezorgbus met pakjes in de laadruimte (rijen van 10; bij meer
 *   dan 10 een tweede rij bovenop) en de pakjes die erbij komen, als plaatjes
 *   of als getal in een rondje (geen mensen, besluit Sara 31 oktober 2026);
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
 * Stijl (besluit Sara, 31 oktober 2026): voor alle lessen hetzelfde, donker
 * (`nacht: true`), plaatjes zonder vaste gloed en zonder kaders eromheen. Een
 * plaatje licht alleen op als het iets betekent: Bliepo wijst het aan of telt
 * het mee, het kind kiest het, of het antwoord is goed. Elk ding heeft één
 * sleutel (squla-plussommen-tekenen.ts, PLUS_FOTOS), zodat het later door een
 * echt plaatje te vervangen is. Geen mensen: bij de bus zijn het pakjes.
 */

import { useEffect, useMemo } from "react";
import type { Vlakbasis } from "../soort";
import { holoBasis, TX, WARM, GOED, type PhaserModule } from "../holo/basis";
import { HOLO_CANVAS, useHoloMotor } from "../holo/motor";
import { speelLesgeluid } from "@/lib/lesgeluiden";
import {
  KLEUREN_DISCO,
  rekMaat,
  rekVakje,
  tekenBundel,
  tekenCijfer,
  tekenKaartje,
  tekenPlaat,
  tekenPlus,
  tekenRek,
  tekenRondje,
  tekenSomkaart,
  tekenStip,
} from "./squla-plussommen-tekenen";
import { tekenVoorwerp, voorwerpKleurbaar } from "../voorwerpen";
import { ringKleur, ringRuimte, tekenMetRing } from "./squla-getalring";
import s from "./squla-plussommen.module.css";

/** Het lekkers van de bakkerij: vaste plaatjes uit src/lib/voorwerpen. */
export type Ding = "broodje" | "brood" | "bruin-brood" | "stokbrood" | "koekje" | "taart" | "cupcake" | "krentenbol" | "croissant" | "donut";
/** Een voorwerp is DING × DING punten. */
const DING = 72;

/* ---------- soorten ---------- */

/** Een groepje lekkers, los in de ruimte (zonder bord, mand of plaat: geen kaders). */
export type Groep = { n: number; ding: Ding; label?: boolean };
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

export type PlusProps = {
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
    const pad = 16;
    const boven = 0;
    const b = Math.max(150, kol * cel + 2 * pad);
    const h = rij * cel + 2 * pad + boven;
    return { kol, rij, pad, boven, b, h };
  });
  const gat = 110;
  /* De bordjes met het aantal staan allemaal op dezelfde hoogte. */
  const hoogst = Math.max(...maten.map((m) => m.h));
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
    return { box, items, schaal: cel / (DING + 6), label: g.label ? { x: box.x, y: cy + hoogst / 2 + 34 } : null };
  });
}

function somVakken(sommen: Kaart[]): Vak[] {
  const n = sommen.length;
  /* Vier kaartjes: iets smaller, zodat ze niet tot bij de microfoon van Bliepo lopen. */
  const b = n >= 4 ? 192 : SOM.b;
  const gat = n >= 4 ? 16 : SOM.gat;
  const breed = n * b + (n - 1) * gat;
  return sommen.map((k, i) => ({ id: k.id, kaart: k, soort: "som", x: MIDDEN.x - breed / 2 + b / 2 + i * (b + gat), y: SOM.y, b, h: SOM.h }));
}

const DISCO = { bal: { x: 490, y: 220 }, speakers: [66, 914], tafel: { x: 490, y: 600 } };

function discoVakken(beeld: Extract<PlusBeeld, { soort: "disco" }>): Vak[] {
  if (beeld.vorm === "plaat")
    return beeld.kaarten.map((k, i) => ({ id: k.id, kaart: k, soort: "plaat", x: 490 + (i - (beeld.kaarten.length - 1) / 2) * 172, y: 470, b: 150, h: 150 }));
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

/* De bezorgbus (vast plaatje "bezorgbus", vierkant getekend). Het grote
   zijraam van de laadruimte ligt in het plaatje ongeveer tussen x 27–116 en
   y 78–116 (van 200). De pakjes staan op de bodem daarvan, in rijen van 10
   (5 + 5); bij meer dan 10 staat er een tweede rij bovenop. Wordt het
   plaatje vervangen, dan blijven de pakjes binnen dat raam. */
const BUSVAK = { x: 10, y: 80, s: 680 };
const busF = BUSVAK.s / 200;
/* Het lichtblauwe zijraam van de bezorgbus (nieuw plaatje): x 26–118, y 68–112 in het vierkante vak van 200. */
const LAAD = { x0: BUSVAK.x + 26 * busF, x1: BUSVAK.x + 118 * busF, top: BUSVAK.y + 68 * busF, bodem: BUSVAK.y + 112 * busF };
/** Zo groot als kan zonder overlap: 10 naast elkaar (5 + 5) in het raam van 313 punten. */
const PAKJE = 30;
const INSTAP = { x0: 700, dx: 50, voet: 652, rij: 64 };
function instapPlek(i: number) {
  const r = Math.floor(i / 5);
  const k = i % 5;
  const sch = 1 - r * 0.06;
  return { x: INSTAP.x0 + k * INSTAP.dx + (r % 2) * 10, y: INSTAP.voet - r * INSTAP.rij, schaal: sch };
}
function pakjePlek(k: number) {
  const i = k % 10;
  const rij = Math.floor(k / 10);
  return { x: LAAD.x0 + 2 + PAKJE / 2 + i * PAKJE + (i >= 5 ? 8 : 0), y: LAAD.bodem - PAKJE / 2 - 4 - rij * (PAKJE + 3) };
}
const RONDJE = { x: 830, y: 540 };

/* ---------- de scène ---------- */

type Staat = {
  gekozen: string[];
  uit: string[];
  goedIds: string[];
  lijnen: Lijn[];
  licht: number[];
  busLicht: boolean;
  busTel: number;
  dim: boolean;
};

interface PlusScene {
  zetBeeld(beeld: PlusBeeld | null, sommen: Kaart[]): void;
  zetStaat(st: Staat): void;
  zetRek(rek: Rek | null): void;
  zetBus(los: boolean): void;
  goed(): void;
  fout(): void;
}

/** Gloed alleen op het moment dat het iets betekent (besluit Sara, 31 oktober 2026). */
const LICHT = WARM;

function maakPlusScene(Phaser: PhaserModule, rustig: boolean) {
  const Basis = holoBasis(Phaser, rustig);
  type Img = import("phaser").GameObjects.Image;
  type Box = import("phaser").GameObjects.Container;
  type Gfx = import("phaser").GameObjects.Graphics;

  class Plus extends Basis implements PlusScene {
    hoofd: Box | null = null;
    sleutel = "";
    beeld: PlusBeeld | null = null;
    vakken: Vak[] = [];
    vakImg = new Map<string, Img>();
    groepen: GroepPlek[] = [];
    groepImg: Img[][] = [];
    busImg: Img[] = [];
    instapImg: Img[] = [];
    lijnLaag: Gfx | null = null;
    rekBox: Box | null = null;
    rekSleutel = "";
    rekStippen: Img[] = [];
    rekZicht = 0;
    instappers: Box | null = null;
    rondje: Img | null = null;
    bal: Img | null = null;
    flitsTot = 0;
    zweven: import("phaser").Tweens.Tween[] = [];
    staat: Staat = { gekozen: [], uit: [], goedIds: [], lijnen: [], licht: [], busLicht: false, busTel: 0, dim: false };

    constructor() {
      super("squla-plussommen");
    }

    maak() {
      this.lijnLaag = this.add.graphics().setDepth(4);
    }

    /** Een plaatje zonder gloed: één keer tekenen. */
    tex(sl: string, b: number, h: number, teken: (c: CanvasRenderingContext2D) => void) {
      const naam = `sqp-${sl}`;
      this.canvasPlaatje(naam, b, h, teken);
      return naam;
    }

    /** Een vast plaatje (src/lib/voorwerpen) op maat b × h, zonder gloed. */
    vw(naam: string, b: number, h: number) {
      return this.tex(`vw-${naam}-${b}x${h}`, b, h, (c) => tekenVoorwerp(c, naam, 0, 0, b, h));
    }

    /** Een vast plaatje met een ring in de kleur van zijn getal (één keer getekend). */
    vwK(naam: string, b: number, h: number, kleur: string) {
      return this.tex(`vwk-${naam}-${b}x${h}-${kleur.slice(1)}`, b + 2 * ringRuimte(b, h), h + 2 * ringRuimte(b, h), (c) => tekenMetRing(c, b, h, kleur, (cc, x, y, bb, hh) => tekenVoorwerp(cc, naam, x, y, bb, hh), voorwerpKleurbaar(naam)));
    }

    /** Hetzelfde plaatje mét gloed (één keer gebakken), voor het moment dat het oplicht. */
    texG(basis: string, kleur: number) {
      const naam = `${basis}-g${kleur.toString(16)}`;
      this.bak(basis, naam, kleur);
      return naam;
    }

    /** Licht aan of uit op een plaatje. */
    gloei(im: Img, kleur: number | null) {
      const basis = im.getData("basis") as string | undefined;
      if (!basis || !im.active) return;
      const doel = kleur === null ? basis : this.texG(basis, kleur);
      if (im.texture.key !== doel) im.setTexture(doel);
    }

    plek(box: Box, sl: string, x: number, y: number) {
      const im = this.plaats(sl, x - MIDDEN.x, y - MIDDEN.y);
      im.setData("basis", sl);
      box.add(im);
      return im;
    }

    /** De gloed-plaatjes van dit beeld alvast bakken, één per keer (geen hapering later). */
    bakVooruit(imgs: Img[]) {
      const sleutels = [...new Set(imgs.map((im) => im.getData("basis") as string))];
      sleutels.forEach((sl, i) => {
        this.time.delayedCall(250 + i * 90, () => {
          this.texG(sl, LICHT);
          this.texG(sl, GOED);
        });
      });
    }

    zetBeeld(beeld: PlusBeeld | null, sommen: Kaart[]) {
      const sleutel = beeld ? `${beeld.id}|${sommen.map((k) => k.id).join(",")}` : "";
      if (sleutel === this.sleutel) return;
      this.sleutel = sleutel;
      /* De zwevende cijfers van het vorige beeld stoppen (die tweens lopen anders eindeloos door). */
      this.zweven.forEach((tw) => tw.remove());
      this.zweven = [];
      if (this.hoofd) this.verdwijn(this.hoofd);
      this.hoofd = null;
      this.vakImg.clear();
      this.groepen = [];
      this.groepImg = [];
      this.busImg = [];
      this.instapImg = [];
      this.instappers = null;
      this.rondje = null;
      this.bal = null;
      this.beeld = beeld;
      this.lijnLaag?.clear();
      if (!beeld) return;
      const box = this.add.container(MIDDEN.x, MIDDEN.y);
      this.hoofd = box;

      if (beeld.soort === "bakkerij") {
        /* Los in de ruimte: geen bord, mand of plaat eromheen. */
        this.groepen = bakkerijIndeling(beeld.groepen, sommen.length > 0);
        beeld.groepen.forEach((g, i) => {
          const p = this.groepen[i];
          const ding = this.vwK(g.ding, DING, DING, ringKleur(g.n));
          this.groepImg.push(p.items.map((q) => this.plek(box, ding, q.x, q.y).setScale(p.schaal / TX)));
        });
      } else if (beeld.soort === "etalage") {
        this.plek(box, this.vw("taart", 300, 300), 490, 420);
      } else if (beeld.soort === "disco") {
        const spk = this.vw("luidspreker", 120, 220);
        DISCO.speakers.forEach((x) => this.plek(box, spk, x, 470));
        this.bal = this.plek(box, this.vw("discobal", 170, 170), DISCO.bal.x, DISCO.bal.y);
        this.plek(box, this.vw("draaitafel", 260, 260), DISCO.tafel.x, DISCO.tafel.y);
        /* De lichtbundels van de spots alvast tekenen (anders hapert het eerste goede antwoord). */
        KLEUREN_DISCO.slice(0, 4).forEach((k, i) => this.time.delayedCall(300 + i * 80, () => this.tex(`bundel-${i}`, 60, 300, (c) => tekenBundel(c, k))));
      } else if (beeld.soort === "bus") {
        this.plek(box, this.vw("bezorgbus", BUSVAK.s, BUSVAK.s), BUSVAK.x + BUSVAK.s / 2, BUSVAK.y + BUSVAK.s / 2);
        const pakje = this.vwK("pakje", PAKJE, PAKJE, ringKleur(beeld.inBus));
        for (let k = 0; k < beeld.inBus; k++) {
          const q = pakjePlek(k);
          this.busImg.push(this.plek(box, pakje, q.x, q.y));
        }
        /* De pijl naar de laadruimte. */
        const pijl = this.add.graphics();
        const van = beeld.alsGetal ? { x: RONDJE.x - 40, y: RONDJE.y - 70 } : { x: 800, y: instapPlek(Math.max(0, beeld.instap - 1)).y - 90 };
        const naar = { x: LAAD.x1 - 20, y: LAAD.top - 6 };
        const ctrl = { x: (van.x + naar.x) / 2, y: Math.min(van.y, naar.y) - 70 };
        const pad = new Phaser.Curves.QuadraticBezier(new Phaser.Math.Vector2(van.x - MIDDEN.x, van.y - MIDDEN.y), new Phaser.Math.Vector2(ctrl.x - MIDDEN.x, ctrl.y - MIDDEN.y), new Phaser.Math.Vector2(naar.x - MIDDEN.x, naar.y - MIDDEN.y));
        pijl.lineStyle(9, 0x5aa8ff, 1);
        pad.draw(pijl, 24);
        const eind = pad.getPoint(1);
        const voor = pad.getPoint(0.9);
        const hoek = Math.atan2(eind.y - voor.y, eind.x - voor.x);
        pijl.fillStyle(0x5aa8ff, 1);
        pijl.fillTriangle(
          eind.x + Math.cos(hoek) * 14,
          eind.y + Math.sin(hoek) * 14,
          eind.x + Math.cos(hoek + 2.4) * 22,
          eind.y + Math.sin(hoek + 2.4) * 22,
          eind.x + Math.cos(hoek - 2.4) * 22,
          eind.y + Math.sin(hoek - 2.4) * 22,
        );
        box.add(pijl);
        if (beeld.alsGetal) this.rondje = this.plek(box, this.tex(`rondje-${ringKleur(beeld.instap).slice(1)}`, 130, 130, (c) => tekenRondje(c, ringKleur(beeld.instap))), RONDJE.x, RONDJE.y);
        else this.instappers = this.maakInstappers(box, beeld.instap);
      } else if (beeld.soort === "kaal") {
        const kleur = ["#7fe9ff", "#ffd36e", "#c9b6ff"][(beeld.level - 1) % 3];
        this.plek(box, this.tex(`plus-${beeld.level}`, 200, 200, (c) => tekenPlus(c, kleur)), 490, 410);
        const cijfers = ["3", "7", "1", "9", "5", "2", "8", "4"];
        const plekken = [[220, 230], [760, 220], [170, 470], [810, 470], [330, 610], [650, 610], [300, 380], [690, 360]];
        cijfers.forEach((cf, i) => {
          const im = this.plek(box, this.tex(`cijfer-${cf}-${beeld.level}`, 80, 88, (c) => tekenCijfer(c, cf, kleur)), plekken[i][0], plekken[i][1]);
          im.setAlpha(0.45).setScale(0.8 / TX);
          if (!this.rustig) this.zweven.push(this.tweens.add({ targets: im, y: im.y - 14, duration: 1400 + i * 170, yoyo: true, repeat: -1, ease: "Sine.easeInOut" }));
        });
      }

      /* De kaartjes, platen en sommen om aan te tikken (rekenmateriaal: een getal op een kaartje). */
      this.vakken = vakkenVan(beeld, sommen);
      this.vakken.forEach((v, i) => {
        let sl: string;
        if (v.soort === "plaat") {
          /* Het midden van de plaat heeft de kleur van zijn getal (dezelfde als in de zin van Bliepo, BOUWREGELS 2.1); 0 krijgt een rustige grijsblauwe kleur. */
          const n = Number(v.kaart.tekst[0]);
          const kleur = n >= 1 && n <= 10 ? ringKleur(n) : "#6d7699";
          sl = this.tex(`plaat-${kleur.slice(1)}`, v.b, v.h, (c) => tekenPlaat(c, v.b, kleur));
        } else if (v.soort === "kaartje") {
          const kleur = KLEUREN_DISCO[(i * 2 + 1) % KLEUREN_DISCO.length];
          const n = v.kaart.tekst.length;
          sl = this.tex(`kaartje-${n}-${kleur}`, v.b, v.h, (c) => tekenKaartje(c, v.b, v.h, kleur, n));
        } else sl = this.tex(`som-${v.b}-${v.h}`, v.b, v.h, (c) => tekenSomkaart(c, v.b, v.h, true));
        this.vakImg.set(v.id, this.plek(box, sl, v.x, v.y));
      });

      this.tover(box);
      this.bakVooruit([...this.groepImg.flat(), ...this.busImg, ...this.instapImg, ...this.vakImg.values()]);
      this.tekenStaat();
    }

    maakInstappers(box: Box, n: number) {
      const groep = this.add.container(0, 0);
      this.instapImg = [];
      /* Achterste rij eerst, dan staan de voorste ervoor. */
      for (let i = n - 1; i >= 0; i--) {
        const q = instapPlek(i);
        const sl = this.vwK("pakje", 46, 46, ringKleur(n));
        const im = this.plaats(sl, q.x - MIDDEN.x, q.y - MIDDEN.y).setOrigin(0.5, 1);
        im.setData("basis", sl);
        im.setScale(q.schaal / TX);
        groep.add(im);
        this.instapImg[i] = im;
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
        this.tekenStaat();
      } else if (!los && this.instappers) {
        this.instappers.destroy();
        this.instappers = null;
        this.instapImg = [];
        this.rondje?.setVisible(true);
      }
    }

    zetStaat(st: Staat) {
      this.staat = st;
      this.tekenStaat();
    }

    /** Wat er nu oplicht: wat Bliepo aanwijst of meetelt, wat gekozen is, wat goed is. Verder geen gloed. */
    tekenStaat() {
      const st = this.staat;
      const flits = performance.now() < this.flitsTot;
      for (const [id, im] of this.vakImg) {
        im.setAlpha(st.uit.includes(id) ? 0.35 : 1);
        this.gloei(im, st.goedIds.includes(id) ? GOED : st.gekozen.includes(id) ? LICHT : null);
      }
      this.groepImg.forEach((items, g) => items.forEach((im) => this.gloei(im, flits ? GOED : st.licht.includes(g) ? LICHT : null)));
      this.busImg.forEach((im) => this.gloei(im, flits ? GOED : st.busLicht ? LICHT : null));
      this.instapImg.forEach((im, i) => im && this.gloei(im, flits ? GOED : i < st.busTel ? LICHT : null));
      if (this.hoofd) this.hoofd.setAlpha(st.dim ? 0.12 : 1);
      /* De lijnen tussen sommen en antwoorden. */
      const l = this.lijnLaag;
      if (!l) return;
      l.clear();
      if (st.dim) return;
      for (const ln of st.lijnen) {
        const a = this.vakken.find((v) => v.id === ln.van);
        const z = this.vakken.find((v) => v.id === ln.naar);
        if (!a || !z) continue;
        const kleur = ln.stand === "goed" ? GOED : ln.stand === "fout" ? 0xff7b7b : 0xffffff;
        l.lineStyle(8, kleur, 1);
        l.lineBetween(a.x + a.b / 2, a.y, z.x - z.b / 2, z.y);
        l.fillStyle(kleur, 1);
        l.fillCircle(a.x + a.b / 2, a.y, 9);
        l.fillCircle(z.x - z.b / 2, z.y, 9);
      }
    }

    zetRek(rek: Rek | null) {
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
        box.add(this.plaats(this.tex(`rek-${rek.rijen}`, maat.b, maat.h, (c) => tekenRek(c, rek.rijen, true)), 0, 0));
        const oranje = this.tex("stip-oranje", 50, 50, (c) => tekenStip(c, "#ffad5c"));
        const blauw = this.tex("stip-blauw", 50, 50, (c) => tekenStip(c, "#5aa8ff"));
        for (let k = 0; k < rek.a + rek.b && k < rek.rijen * 10; k++) {
          const q = rekVakje(k, rek.rijen);
          const im = this.plaats(k < rek.a ? oranje : blauw, q.x, q.y);
          im.setData("basis", k < rek.a ? oranje : blauw);
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
          /* Een stip die erbij komt, licht even op. */
          this.gloei(im, LICHT);
          this.time.delayedCall(700, () => this.gloei(im, null));
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
      /* Goed: alles van de vraag licht even op. */
      this.flitsTot = performance.now() + 900;
      this.tekenStaat();
      this.time.delayedCall(950, () => this.tekenStaat());
      if (this.rustig || b?.soort !== "disco") return;
      /* De spots gaan aan en de discobal draait even. */
      KLEUREN_DISCO.slice(0, 4).forEach((k, i) => {
        const bundel = this.plaats(this.tex(`bundel-${i}`, 60, 300, (c) => tekenBundel(c, k)), DISCO.bal.x, DISCO.bal.y).setOrigin(0.5, 0);
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
      const sommen = beeld?.soort === "verbind" ? [] : this.vakken.filter((v) => v.soort === "som").map((v) => v.kaart);
      let k = 0;
      const stap = () => {
        if (performance.now() > eind) return;
        if (beeld) {
          this.sleutel = "";
          this.zetBeeld({ ...beeld, id: `${beeld.id}-demo-${k++}` } as PlusBeeld, sommen);
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
    scene?.zetBeeld(JSON.parse(beeldSleutel) as PlusBeeld | null, JSON.parse(sommenSleutel) as Kaart[]);
  }, [scene, beeldSleutel, sommenSleutel]);

  const dim = Boolean(rek);
  const staatSleutel = JSON.stringify({ gekozen, uit, goedIds, lijnen, licht, busLicht, busTel, dim });
  useEffect(() => {
    scene?.zetStaat(JSON.parse(staatSleutel) as Staat);
  }, [scene, staatSleutel, beeldSleutel]);

  const rekSleutel = JSON.stringify(rek);
  useEffect(() => {
    scene?.zetRek(JSON.parse(rekSleutel) as Rek | null);
  }, [scene, rekSleutel]);

  useEffect(() => {
    scene?.zetBus(busLos);
  }, [scene, busLos, beeldSleutel]);

  useEffect(() => {
    if (scene && goed > 0) scene.goed();
  }, [scene, goed]);
  useEffect(() => {
    if (scene && fout > 0) scene.fout();
  }, [scene, fout]);

  const groepen = beeld?.soort === "bakkerij" ? bakkerijIndeling(beeld.groepen, sommen.length > 0) : [];

  /* Getallen bij de bus: in de bus (bij het samen tellen) en boven elk geteld kind. */
  const busLabels: { k: string; x: number; y: number; t: string }[] = [];
  if (beeld?.soort === "bus") {
    if (busLicht) busLabels.push({ k: "bus", x: (LAAD.x0 + LAAD.x1) / 2, y: LAAD.top - 40, t: beeld.inBus > 10 ? `10 + ${beeld.inBus - 10}` : String(beeld.inBus) });
    for (let i = 0; i < busTel && i < beeld.instap; i++) {
      const q = instapPlek(i);
      busLabels.push({ k: `t${i}`, x: q.x, y: q.y - 50 * q.schaal - 20, t: String(beeld.inBus + i + 1) });
    }
  }

  return (
    <div className={s.vlak}>
      <div ref={plek} style={HOLO_CANVAS} aria-hidden />
      {!dim &&
        groepen.map((g, i) =>
          g.label && beeld?.soort === "bakkerij" ? (
            <div key={`l${i}`} className={s.label} style={{ left: g.label.x, top: g.label.y, color: ringKleur(beeld.groepen[i].n) }} aria-hidden>
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
              className={`${s.vak} ${s[v.soort]} ${v.soort === "som" && v.b < 200 ? s.smal : ""} ${uit.includes(v.id) ? s.uit : ""}`}
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

/* ---------- tekeningen voor de kaart aan het eind (244 × 190): rekenmateriaal, geen plaatjes ---------- */

function Stippen({ a, b, y }: { a: number; b: number; y: number }) {
  return (
    <>
      {Array.from({ length: a + b }, (_, i) => (
        <circle key={i} cx={58 + i * 32 + (i >= 5 ? 8 : 0)} cy={y} r={12} fill={i < a ? "#ffad5c" : "#5aa8ff"} stroke="#ffffff" strokeWidth={2.5} />
      ))}
    </>
  );
}

export function KaartBakkerij() {
  return (
    <>
      <Stippen a={3} b={2} y={120} />
      <text x={122} y={70} textAnchor="middle" fontSize={40} fontWeight={800} fill="#ffffff">
        3 + 2
      </text>
    </>
  );
}

export function KaartDisco() {
  return (
    <>
      <Stippen a={5} b={0} y={104} />
      <Stippen a={2} b={3} y={140} />
      <text x={122} y={64} textAnchor="middle" fontSize={40} fontWeight={800} fill="#ffffff">
        10
      </text>
    </>
  );
}

export function KaartBus() {
  return (
    <>
      <Stippen a={4} b={2} y={120} />
      <text x={122} y={70} textAnchor="middle" fontSize={40} fontWeight={800} fill="#ffffff">
        4 + 2
      </text>
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
