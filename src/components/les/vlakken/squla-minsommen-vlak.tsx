"use client";

/**
 * Het speelvlak van de lessen "Minsommen" naar Squla groep 3 (30 oktober 2026,
 * opdracht eigenaar). Eén Phaser-scène (holo/basis.ts, gebakken gloed) met een
 * "toneel" per soort vraag:
 *
 *   zee       dieren in de zee in rijtjes van 5 (eerste tien boven, de rest
 *             eronder), soms met een walvis of inktvis die er een paar opeet
 *             (hologramstijl);
 *   som       alleen een grote som (disco en typen), met een dier als versiering
 *             of een luidspreker (de som wordt alleen gezegd);
 *   verbind   drie kaartjes met visjes en een som, drie antwoorden; het kind
 *             verbindt ze met lijnen;
 *   bubbels   bubbels met sommen; het kind tikt de sommen met uitkomst 0 aan
 *             (zonder tijdsdruk: de bubbels zweven op hun plek);
 *   bus       een dubbeldekker met kinderen achter de ramen; wie uitstapt, staat
 *             buiten (of: een rood rondje met het getal);
 *   machine   de min-machine op de band: 10 → −5 → …;
 *   bord      een schoolbord met de som in krijt;
 *   bakjes    bekers of bordjes, een deel leeg;
 *   geld      een portemonnee met geld en iets om te kopen (officiële plaatjes
 *             uit public/geld/, rond afgesneden zoals in Geld.tsx, klein).
 *
 * Bliepo's uitleg zie je in beeld: `grijs` = zoveel dieren of stippen worden
 * grijs en half doorzichtig (van achteren af: eerst de rij onder de tien, dan
 * de rest), bij de bus stappen er zoveel kinderen uit; `licht` zet een ring om
 * de dieren of kinderen die geteld moeten worden; `stippen` = een rij stippen
 * (rijtjes van 5) onder de som.
 *
 * Tikken gaat via onzichtbare knoppen boven de tekening (data-ding, ook voor
 * de automatische test); meldt `{ soort: "verbonden", paren }` en
 * `{ soort: "bubbel", i }`.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import type { Vlakbasis } from "../soort";
import { holoBasis, TX, WARM, WERELDKLEUR, GOED, type PhaserModule } from "../holo/basis";
import { HOLO_CANVAS, useHoloMotor } from "../holo/motor";
import { speelLesgeluid } from "@/lib/lesgeluiden";
import {
  BUS,
  DIER,
  DIERMAAT,
  ETERMAAT,
  hexGetal,
  tekenBand,
  tekenBeker,
  tekenBlok,
  tekenBord,
  tekenBordje,
  tekenBubbel,
  tekenBus,
  tekenDier,
  tekenEter,
  tekenHoofd,
  tekenKaart,
  tekenKind,
  tekenLuister,
  tekenMachine,
  tekenPijl,
  tekenPijlRechts,
  tekenPortemonnee,
  tekenSpeelgoed,
  tekenStip,
  type Bakje,
  type Dier,
  type Eter,
  type Speelgoed,
} from "./squla-minsommen-tekenen";
import s from "./squla-minsommen.module.css";

export type { Bakje, Dier, Eter, Speelgoed };
/** Geld in euro: munt van 1 of 2, briefje van 5 of 10. */
export type Geld = 1 | 2 | 5 | 10;

export type Toneel =
  | { soort: "zee"; id: string; dier: Dier; n: number; eter?: Eter | null }
  | { soort: "som"; id: string; deco?: Dier | Eter | "luister" | null }
  | { soort: "verbind"; id: string; sommen: [number, number][]; uitkomsten: number[] }
  | { soort: "bubbels"; id: string; sommen: [number, number][] }
  | { soort: "bus"; id: string; in: number; rondje: boolean }
  | { soort: "machine"; id: string; start: number; eraf: number }
  | { soort: "bord"; id: string }
  | { soort: "bakjes"; id: string; ding: Bakje; vol: number; leeg: number }
  | { soort: "geld"; id: string; heb: Geld[]; prijs: Geld[]; ding: Speelgoed };

export type Licht = "alle" | "over" | "eraf" | "leeg" | null;

export type VerbindStand = {
  actief: boolean;
  /** De lijnen die blijven staan (per som links: het antwoord rechts, of null). Nieuw `keer` = opnieuw beginnen vanaf `vast`. */
  vast: (number | null)[];
  keer: number;
  /** Alles goed: de lijnen worden groen. */
  goed?: boolean;
  /** Bij de uitleg: op kaartje `kaart` worden er `n` visjes grijs. */
  kaartGrijs?: { kaart: number; n: number } | null;
};

export type BubbelStand = { actief: boolean; weg: number[]; fout: { i: number; keer: number } | null };

export type MinVlakProps = {
  toneel: Toneel | null;
  /** De som in beeld ("7 − 4", "8 − 3 = ?"); bij het bord op het bord. */
  som?: string | null;
  /** Zoveel dieren (zee) worden grijs; bij de bus: zoveel kinderen zijn uitgestapt. */
  grijs?: number;
  licht?: Licht;
  /** Stippen voor de uitleg (rijtjes van 5), met zoveel grijs. */
  stippen?: { n: number; grijs: number } | null;
  /** Machine: wat er uit de machine komt (anders "…"). */
  uitkomst?: number | null;
  verbind?: VerbindStand | null;
  bubbels?: BubbelStand | null;
  goed?: number;
  fout?: number;
};

/* ---------- waar staat wat (punten van het vlak, 980 × 720) ---------- */

type Plek = { x: number; y: number };

/** Dieren: tot 10 in twee rijtjes van 5; meer dan 10: de eerste tien boven, de rest eronder. */
function zeePlekken(n: number, metEter: boolean): { plekken: Plek[]; schaal: number } {
  const cx = metEter ? 380 : 490;
  if (n <= 10) {
    const cel = 108;
    const rijen = Math.ceil(n / 5);
    const y0 = 400 - ((rijen - 1) * cel) / 2;
    return { plekken: Array.from({ length: n }, (_, i) => ({ x: cx + ((i % 5) - 2) * cel, y: y0 + Math.floor(i / 5) * cel })), schaal: 0.92 };
  }
  const cel = 84;
  const rijen = Math.ceil(n / 5);
  const hoog = (rijen - 1) * cel + 34;
  const y0 = 410 - hoog / 2;
  return {
    plekken: Array.from({ length: n }, (_, i) => {
      const r = Math.floor(i / 5);
      return { x: cx + ((i % 5) - 2) * cel, y: y0 + r * cel + (r >= 2 ? 34 : 0) };
    }),
    schaal: 0.76,
  };
}

const ETER_PLEK: Plek = { x: 820, y: 420 };

/** Stippen: rijtjes van 5, tien per blok; meer dan tien: tweede blok ernaast. */
function stipPlekken(n: number, y: number): Plek[] {
  const cel = 46;
  const blokB = 5 * cel;
  const totaal = n > 10 ? blokB * 2 + 40 : blokB;
  const x0 = 490 - totaal / 2 + cel / 2;
  return Array.from({ length: n }, (_, i) => {
    const blok = Math.floor(i / 10);
    const j = i % 10;
    return { x: x0 + blok * (blokB + 40) + (j % 5) * cel, y: y - cel / 2 + Math.floor(j / 5) * cel };
  });
}

function stipY(t: Toneel | null) {
  if (!t || t.soort === "som") return 490;
  if (t.soort === "geld") return 620;
  return 610;
}

/* Bus */
const BUS_X = 30;
const BUS_Y = 210;
function zitPlek(i: number): Plek {
  const R = BUS.ramen;
  const onder = i < 10;
  return { x: BUS_X + R.xs[i % 10], y: BUS_Y + (onder ? R.onder : R.boven) + 8 };
}
function buitenPlek(i: number): Plek {
  return { x: 820 + (i % 3) * 52, y: 520 - Math.floor(i / 3) * 92 };
}
const RONDJE: Plek = { x: 878, y: 440 };
const PIJL: Plek = { x: 735, y: 452 };

/* Verbinden */
const KAART_L = { x: 250, b: 300, h: 190, ys: [140, 360, 580] };
const KAART_R = { x: 770, b: 130, h: 130 };
function verbindCorrect(t: Extract<Toneel, { soort: "verbind" }>) {
  return t.sommen.map(([a, b]) => t.uitkomsten.indexOf(a - b));
}

/* Bubbels */
const BUBBEL_D = 172;
const BUBBEL_PLEK: Plek[] = [
  { x: 210, y: 230 },
  { x: 490, y: 196 },
  { x: 770, y: 230 },
  { x: 280, y: 486 },
  { x: 560, y: 506 },
  { x: 840, y: 470 },
];

/* Machine */
const MACH = { links: { x: 140, y: 330 }, machine: { x: 490, y: 300 }, rechts: { x: 840, y: 330 }, band: 420 };

/* Bakjes */
function bakjePlekken(n: number): Plek[] {
  const cel = 132;
  const rijen = Math.ceil(n / 5);
  const y0 = 380 - ((rijen - 1) * 150) / 2;
  return Array.from({ length: n }, (_, i) => ({ x: 490 + ((i % 5) - 2) * cel, y: y0 + Math.floor(i / 5) * 150 }));
}

/* Geld */
const GELD_MAAT: Record<Geld, { b: number; h: number }> = { 1: { b: 62, h: 62 }, 2: { b: 68, h: 68 }, 5: { b: 140, h: 71 }, 10: { b: 146, h: 77 } };
const GELD_BESTAND: Record<Geld, string> = { 1: "/geld/munt-1-euro.jpg", 2: "/geld/munt-2-euro.jpg", 5: "/geld/briefje-5-euro.jpg", 10: "/geld/briefje-10-euro.jpg" };
function geldRij(lijst: Geld[], cx: number, y: number): Plek[] {
  const ruimte = 10;
  const breed = lijst.reduce((t, g) => t + GELD_MAAT[g].b, 0) + ruimte * (lijst.length - 1);
  let x = cx - breed / 2;
  return lijst.map((g) => {
    const p = { x: x + GELD_MAAT[g].b / 2, y };
    x += GELD_MAAT[g].b + ruimte;
    return p;
  });
}
const GELD = { heb: { x: 260, y: 270 }, beurs: { x: 260, y: 420 }, ding: { x: 730, y: 250 }, prijs: { x: 730, y: 440 } };

/* ---------- de scène ---------- */

interface MinScene {
  zetLetter(f: string): void;
  zetToneel(t: Toneel | null): void;
  zetGrijs(n: number): void;
  zetLicht(l: Licht): void;
  zetStippen(st: { n: number; grijs: number } | null): void;
  zetUitkomst(n: number | null): void;
  zetLijnen(lijnen: (number | null)[], gekozen: { kant: "l" | "r"; i: number } | null, goed: boolean): void;
  zetKaartGrijs(g: { kaart: number; n: number } | null): void;
  zetBubbels(weg: number[]): void;
  bubbelFout(i: number): void;
  goed(): void;
  fout(): void;
}

function maakMinScene(Phaser: PhaserModule, rustig: boolean) {
  const Basis = holoBasis(Phaser, rustig);
  type Img = import("phaser").GameObjects.Image;
  type Box = import("phaser").GameObjects.Container;
  type Gfx = import("phaser").GameObjects.Graphics;
  type Klok = import("phaser").Time.TimerEvent;

  class Min extends Basis implements MinScene {
    letter = "system-ui, sans-serif";
    toneel: Toneel | null = null;
    groep: Box | null = null;
    /** Wat grijs kan worden of een ring kan krijgen (dieren, kinderen in de bus, bakjes). */
    items: Img[] = [];
    itemSchaal = 1;
    grijsNu = 0;
    klokken: Klok[] = [];
    ringen: Img[] = [];
    lichtNu: Licht = null;
    /* bus */
    buiten: Img[] = [];
    pijl: Img | null = null;
    rondje: Box | null = null;
    /* stippen */
    stipBox: Box | null = null;
    stipItems: Img[] = [];
    stipN = 0;
    stipGrijsNu = 0;
    /* machine */
    rechtsLabel: Img | null = null;
    rechtsBlok: Box | null = null;
    /* verbinden */
    lijnGfx: Gfx | null = null;
    kaartVisjes: Img[][] = [];
    kaartRing: Img | null = null;
    /* bubbels */
    bubbelBoxen: Box[] = [];
    bubbelWeg = new Set<number>();

    constructor() {
      super("squla-minsommen");
    }

    maak() {
      this.canvasPlaatje("sqm-stip", 40, 40, (c) => tekenStip(c, 40));
      this.bak("sqm-stip", "sqm-stip-g", WARM);
    }

    zetLetter(f: string) {
      this.letter = f || this.letter;
    }

    /* ---------- plaatjes (één keer per soort, met gebakken gloed) ---------- */

    tex(sl: string, b: number, h: number, teken: (c: CanvasRenderingContext2D) => void, gloed: number | null) {
      if (gloed === null) {
        this.canvasPlaatje(sl, b, h, teken);
        return sl;
      }
      if (!this.textures.exists(`${sl}-g`)) {
        this.canvasPlaatje(sl, b, h, teken);
        this.bak(sl, `${sl}-g`, gloed);
      }
      return `${sl}-g`;
    }

    dierTex(d: Dier) {
      return this.tex(`sqm-${d}`, DIERMAAT, DIERMAAT, (c) => tekenDier(c, d), hexGetal(DIER[d].vul));
    }
    eterTex(e: Eter) {
      return this.tex(`sqm-${e}`, ETERMAAT[e].b, ETERMAAT[e].h, (c) => tekenEter(c, e), e === "walvis" ? 0x6fa8ff : 0xff8fb6);
    }

    /** Een tekst als plaatje (scherp, met de letter van de les). */
    tekstTex(tekst: string, grootte: number, kleur = "#ffffff", rand = "rgba(4,18,60,0.85)") {
      const sl = `sqm-t-${tekst}-${grootte}-${kleur}`;
      if (this.textures.exists(sl)) return sl;
      const meet = document.createElement("canvas").getContext("2d")!;
      meet.font = `800 ${grootte}px ${this.letter}`;
      const b = Math.ceil(meet.measureText(tekst).width + grootte * 0.5);
      const h = Math.ceil(grootte * 1.35);
      this.canvasPlaatje(sl, b, h, (c) => {
        c.font = `800 ${grootte}px ${this.letter}`;
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.lineJoin = "round";
        if (rand) {
          c.strokeStyle = rand;
          c.lineWidth = grootte * 0.14;
          c.strokeText(tekst, b / 2, h / 2 + grootte * 0.04);
        }
        c.fillStyle = kleur;
        c.fillText(tekst, b / 2, h / 2 + grootte * 0.04);
      });
      return sl;
    }

    stopKlokken() {
      this.klokken.forEach((k) => k.remove(false));
      this.klokken = [];
    }

    /* ---------- een nieuw toneel ---------- */

    zetToneel(t: Toneel | null) {
      this.stopKlokken();
      const oud = this.groep;
      this.groep = null;
      this.items = [];
      this.buiten = [];
      this.pijl = null;
      this.rondje = null;
      this.rechtsLabel = null;
      this.rechtsBlok = null;
      this.lijnGfx = null;
      this.kaartVisjes = [];
      this.kaartRing = null;
      this.bubbelBoxen = [];
      this.bubbelWeg = new Set();
      this.grijsNu = 0;
      this.ringen.forEach((r) => r.destroy());
      this.ringen = [];
      this.lichtNu = null;
      this.toneel = t;
      if (oud) this.verdwijn(oud);
      if (!t) return;
      const g = this.add.container(0, 0);
      this.groep = g;
      if (t.soort === "zee") this.maakZee(g, t);
      else if (t.soort === "som") this.maakSom(g, t);
      else if (t.soort === "verbind") this.maakVerbind(g, t);
      else if (t.soort === "bubbels") this.maakBubbels(g, t);
      else if (t.soort === "bus") this.maakBus(g, t);
      else if (t.soort === "machine") this.maakMachine(g, t);
      else if (t.soort === "bord") g.add(this.plaats(this.tex("sqm-bord", 640, 350, tekenBord, null), 490, 300));
      else if (t.soort === "bakjes") this.maakBakjes(g, t);
      else this.maakGeld(g, t);
      if (t.soort === "zee" || t.soort === "som" || t.soort === "verbind" || t.soort === "bubbels") this.tover(g, { x: 490 });
      else if (!this.rustig) {
        /* Platte tekeningen: zacht tevoorschijn. */
        g.setAlpha(0);
        this.tweens.add({ targets: g, alpha: 1, duration: 260 });
      }
    }

    maakZee(g: Box, t: Extract<Toneel, { soort: "zee" }>) {
      const { plekken, schaal } = zeePlekken(t.n, !!t.eter);
      this.itemSchaal = schaal;
      const sl = this.dierTex(t.dier);
      plekken.forEach((p, i) => {
        const im = this.plaats(sl, p.x, p.y).setScale(schaal / TX);
        if (!this.rustig) this.tweens.add({ targets: im, y: p.y - 5, duration: 1300 + (i % 4) * 170, yoyo: true, repeat: -1, ease: "Sine.easeInOut", delay: (i * 97) % 600 });
        g.add(im);
        this.items.push(im);
      });
      if (t.eter) g.add(this.plaats(this.eterTex(t.eter), ETER_PLEK.x, ETER_PLEK.y).setScale(0.9 / TX));
    }

    maakSom(g: Box, t: Extract<Toneel, { soort: "som" }>) {
      if (!t.deco) return;
      if (t.deco === "luister") {
        g.add(this.plaats(this.tex("sqm-luister", 160, 140, tekenLuister, WERELDKLEUR.oceaan), 490, 350));
        return;
      }
      if (t.deco === "walvis" || t.deco === "inktvis") g.add(this.plaats(this.eterTex(t.deco), 840, 600).setScale(0.75 / TX));
      else g.add(this.plaats(this.dierTex(t.deco), 860, 590).setScale(1.2 / TX));
    }

    maakVerbind(g: Box, t: Extract<Toneel, { soort: "verbind" }>) {
      const kaartL = this.tex("sqm-kaartL", KAART_L.b, KAART_L.h, (c) => tekenKaart(c, KAART_L.b, KAART_L.h), WERELDKLEUR.oceaan);
      const kaartR = this.tex("sqm-kaartR", KAART_R.b, KAART_R.h, (c) => tekenKaart(c, KAART_R.b, KAART_R.h), WERELDKLEUR.oceaan);
      const vis = this.dierTex("visje");
      t.sommen.forEach(([a, b], k) => {
        const y = KAART_L.ys[k];
        g.add(this.plaats(kaartL, KAART_L.x, y));
        const rij: Img[] = [];
        for (let i = 0; i < a; i++) {
          const im = this.plaats(vis, KAART_L.x + ((i % 5) - 2) * 50, y - 56 + Math.floor(i / 5) * 44).setScale(0.42 / TX);
          g.add(im);
          rij.push(im);
        }
        this.kaartVisjes.push(rij);
        g.add(this.plaats(this.tekstTex(`${a} − ${b} =`, 44), KAART_L.x, y + 58).setScale(1 / TX));
      });
      t.uitkomsten.forEach((u, j) => {
        const y = KAART_L.ys[j];
        g.add(this.plaats(kaartR, KAART_R.x, y));
        g.add(this.plaats(this.tekstTex(String(u), 64), KAART_R.x, y).setScale(1 / TX));
      });
      this.lijnGfx = this.add.graphics();
      g.add(this.lijnGfx);
    }

    maakBubbels(g: Box, t: Extract<Toneel, { soort: "bubbels" }>) {
      const bubbel = this.tex("sqm-bubbel", BUBBEL_D, BUBBEL_D, (c) => tekenBubbel(c, BUBBEL_D), WERELDKLEUR.oceaan);
      t.sommen.forEach(([a, b], i) => {
        const p = BUBBEL_PLEK[i];
        const box = this.add.container(p.x, p.y, [this.plaats(bubbel, 0, 0), this.plaats(this.tekstTex(`${a} − ${b}`, 46), 0, 0).setScale(1 / TX)]);
        if (!this.rustig) this.tweens.add({ targets: box, y: p.y - 9, duration: 1500 + i * 180, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
        g.add(box);
        this.bubbelBoxen.push(box);
      });
    }

    maakBus(g: Box, t: Extract<Toneel, { soort: "bus" }>) {
      const bus = this.tex("sqm-bus", BUS.b, BUS.h, tekenBus, null);
      g.add(this.plaats(bus, BUS_X + BUS.b / 2, BUS_Y + BUS.h / 2));
      for (let i = 0; i < t.in; i++) {
        const p = zitPlek(i);
        const im = this.plaats(this.tex(`sqm-hoofd-${i % 4}`, 40, 46, (c) => tekenHoofd(c, i % 4), null), p.x, p.y);
        g.add(im);
        this.items.push(im);
      }
      this.itemSchaal = 1;
    }

    maakMachine(g: Box, t: Extract<Toneel, { soort: "machine" }>) {
      g.add(this.plaats(this.tex("sqm-band", 900, 44, (c) => tekenBand(c, 900), null), 490, MACH.band));
      const blok = this.tex("sqm-blok", 130, 110, tekenBlok, null);
      const pijl = this.tex("sqm-pijlR", 70, 40, tekenPijlRechts, null);
      g.add(this.plaats(pijl, 272, MACH.links.y));
      g.add(this.plaats(pijl, 708, MACH.rechts.y));
      g.add(this.add.container(MACH.links.x, MACH.links.y, [this.plaats(blok, 0, 0), this.plaats(this.tekstTex(String(t.start), 64, "#ffffff", "rgba(150,70,10,0.7)"), 0, 0)]));
      g.add(this.plaats(this.tex("sqm-machine", 240, 250, tekenMachine, null), MACH.machine.x, MACH.machine.y));
      g.add(this.plaats(this.tekstTex(`−${t.eraf}`, 70, "#4a3aa0", ""), MACH.machine.x, MACH.machine.y - 7));
      this.rechtsBlok = this.add.container(MACH.rechts.x, MACH.rechts.y, [this.plaats(blok, 0, 0)]);
      this.rechtsLabel = this.plaats(this.tekstTex("…", 64, "#ffffff", "rgba(150,70,10,0.7)"), 0, 0);
      this.rechtsBlok.add(this.rechtsLabel);
      g.add(this.rechtsBlok);
    }

    maakBakjes(g: Box, t: Extract<Toneel, { soort: "bakjes" }>) {
      const n = t.vol + t.leeg;
      const plek = bakjePlekken(n);
      const [b, h] = t.ding === "beker" ? [80, 110] : [110, 80];
      const tekenVol = (c: CanvasRenderingContext2D) => (t.ding === "beker" ? tekenBeker(c, true) : tekenBordje(c, true));
      const tekenLeeg = (c: CanvasRenderingContext2D) => (t.ding === "beker" ? tekenBeker(c, false) : tekenBordje(c, false));
      const vol = this.tex(`sqm-${t.ding}-vol`, b, h, tekenVol, null);
      const leeg = this.tex(`sqm-${t.ding}-leeg`, b, h, tekenLeeg, null);
      plek.forEach((p, i) => {
        const im = this.plaats(i < t.vol ? vol : leeg, p.x, p.y);
        g.add(im);
        this.items.push(im);
      });
      this.itemSchaal = 1;
    }

    maakGeld(g: Box, t: Extract<Toneel, { soort: "geld" }>) {
      g.add(this.plaats(this.tex("sqm-beurs", 240, 150, tekenPortemonnee, null), GELD.beurs.x, GELD.beurs.y));
      g.add(this.plaats(this.tex(`sqm-${t.ding}`, 160, 160, (c) => tekenSpeelgoed(c, t.ding), null), GELD.ding.x, GELD.ding.y));
      /* Het prijskaartje. */
      const prijsPlek = geldRij(t.prijs, GELD.prijs.x, GELD.prijs.y);
      const breed = prijsPlek.length ? prijsPlek[prijsPlek.length - 1].x - prijsPlek[0].x + 110 : 110;
      const kaart = this.add.graphics();
      kaart.fillStyle(0xffffff, 0.92);
      kaart.fillRoundedRect(GELD.prijs.x - breed / 2, GELD.prijs.y - 52, breed, 104, 18);
      kaart.lineStyle(4, 0xffad5c, 1);
      kaart.strokeRoundedRect(GELD.prijs.x - breed / 2, GELD.prijs.y - 52, breed, 104, 18);
      g.add(kaart);
      const nodig = [...new Set([...t.heb, ...t.prijs])];
      const zet = () => {
        if (this.groep !== g) return;
        const leg = (lijst: Geld[], plekken: Plek[]) =>
          lijst.forEach((w, i) => {
            const sl = this.geldTex(w);
            if (sl) g.add(this.plaats(sl, plekken[i].x, plekken[i].y));
          });
        leg(t.heb, geldRij(t.heb, GELD.heb.x, GELD.heb.y));
        leg(t.prijs, prijsPlek);
      };
      const ontbreekt = nodig.filter((w) => !this.textures.exists(`sqm-geld-${w}`));
      if (!ontbreekt.length) return zet();
      ontbreekt.forEach((w) => this.load.image(`sqm-geld-${w}`, GELD_BESTAND[w]));
      this.load.once("complete", zet);
      this.load.start();
    }

    /** Een munt rond afgesneden (zoals Geld.tsx), een briefje gewoon; klein, nooit ware grootte. */
    geldTex(w: Geld) {
      const bron = `sqm-geld-${w}`;
      if (!this.textures.exists(bron)) return null;
      const m = GELD_MAAT[w];
      const sl = `sqm-geld-${w}-klein`;
      this.canvasPlaatje(sl, m.b, m.h, (c) => {
        const img = this.textures.get(bron).getSourceImage() as CanvasImageSource;
        c.save();
        if (w <= 2) {
          c.beginPath();
          c.arc(m.b / 2, m.h / 2, m.b / 2 - 1, 0, Math.PI * 2);
          c.clip();
          c.drawImage(img, 0, 0, m.b, m.h);
        } else {
          c.beginPath();
          c.roundRect(0, 0, m.b, m.h, 3);
          c.clip();
          c.drawImage(img, 0, 0, m.b, m.h);
        }
        c.restore();
      });
      return sl;
    }

    /* ---------- grijs worden, uitstappen, ringen ---------- */

    zetGrijs(n: number) {
      const t = this.toneel;
      if (!t || (t.soort !== "zee" && t.soort !== "bus")) return;
      const van = this.grijsNu;
      this.grijsNu = n;
      const totaal = this.items.length;
      const doe = (k: number, aan: boolean, direct: boolean) => {
        const idx = totaal - 1 - k;
        const im = this.items[idx];
        if (!im) return;
        if (t.soort === "zee") {
          if (aan) {
            im.setTint(0x8a96a8);
            if (direct || this.rustig) im.setAlpha(0.35);
            else this.tweens.add({ targets: im, alpha: 0.35, duration: 220 });
          } else im.clearTint().setAlpha(1);
          return;
        }
        /* bus: het kind stapt uit (of komt terug bij opnieuw) */
        if (aan) {
          if (direct || this.rustig) im.setAlpha(0);
          else this.tweens.add({ targets: im, alpha: 0, duration: 200 });
          this.uitstappen(k, direct);
        } else im.setAlpha(1);
      };
      if (n <= van) {
        this.stopKlokken();
        for (let k = 0; k < totaal; k++) doe(k, k < n, true);
        if (t.soort === "bus") this.busBuiten(n, true);
        this.zetLicht(this.lichtNu);
        return;
      }
      for (let k = van; k < n; k++) {
        if (k === van) doe(k, true, false);
        else this.klokken.push(this.time.delayedCall((k - van) * 260, () => doe(k, true, false)));
      }
      this.klokken.push(this.time.delayedCall((n - van) * 260 + 60, () => this.zetLicht(this.lichtNu)));
    }

    /** Bus: kind `k` (van achteren af geteld) staat nu buiten. */
    uitstappen(k: number, direct: boolean) {
      const t = this.toneel;
      const g = this.groep;
      if (!t || t.soort !== "bus" || !g) return;
      if (!this.pijl) {
        this.pijl = this.plaats(this.tex("sqm-pijl", 130, 110, tekenPijl, null), PIJL.x, PIJL.y);
        g.add(this.pijl);
      }
      if (t.rondje) return this.busBuiten(k + 1, direct);
      const p = buitenPlek(k);
      const kind = this.plaats(this.tex(`sqm-kind-${(t.in - 1 - k) % 4}`, 50, 90, (c) => tekenKind(c, (t.in - 1 - k) % 4), null), p.x, p.y);
      g.add(kind);
      this.buiten[k]?.destroy();
      this.buiten[k] = kind;
      if (!direct && !this.rustig) {
        kind.setAlpha(0).setY(p.y - 24);
        this.tweens.add({ targets: kind, alpha: 1, y: p.y, duration: 240, ease: "Back.easeOut" });
      }
    }

    /** Bus: wat er buiten staat bij `n` uitgestapt (opnieuw opbouwen; ook het rode rondje). */
    busBuiten(n: number, direct: boolean) {
      const t = this.toneel;
      const g = this.groep;
      if (!t || t.soort !== "bus" || !g) return;
      if (t.rondje) {
        this.rondje?.destroy();
        this.rondje = null;
        if (n > 0) {
          const rond = this.add.graphics();
          rond.fillStyle(0xff5a5a, 1);
          rond.fillCircle(0, 0, 56);
          rond.lineStyle(5, 0xffffff, 1);
          rond.strokeCircle(0, 0, 56);
          this.rondje = this.add.container(RONDJE.x, RONDJE.y, [rond, this.plaats(this.tekstTex(String(n), 64, "#ffffff", ""), 0, 0)]);
          g.add(this.rondje);
          if (!direct && !this.rustig) {
            this.rondje.setScale(0.6);
            this.tweens.add({ targets: this.rondje, scale: 1, duration: 200, ease: "Back.easeOut" });
          }
        }
      } else if (direct) {
        this.buiten.forEach((b) => b?.destroy());
        this.buiten = [];
        for (let k = 0; k < n; k++) this.uitstappen(k, true);
      }
      if (n === 0) {
        this.pijl?.destroy();
        this.pijl = null;
      } else if (!this.pijl) {
        this.pijl = this.plaats(this.tex("sqm-pijl", 130, 110, tekenPijl, null), PIJL.x, PIJL.y);
        g.add(this.pijl);
      }
    }

    zetLicht(l: Licht) {
      this.lichtNu = l;
      this.ringen.forEach((r) => r.destroy());
      this.ringen = [];
      const t = this.toneel;
      if (!t || !l) return;
      const kleur = WARM;
      if (t.soort === "zee") {
        const totaal = this.items.length;
        const r = 50 * this.itemSchaal + 4;
        this.items.forEach((im, i) => {
          const isGrijs = i >= totaal - this.grijsNu;
          if (l === "alle" || (l === "over" && !isGrijs) || (l === "eraf" && isGrijs)) this.ringen.push(this.selectieRing(im.x, im.y, r, kleur));
        });
      } else if (t.soort === "bus") {
        if (l === "over" || l === "alle") this.items.forEach((im, i) => (l === "alle" || i < this.items.length - this.grijsNu) && this.ringen.push(this.selectieRing(im.x, im.y - 4, 28, kleur)));
        if (l === "eraf") {
          if (t.rondje) this.ringen.push(this.selectieRing(RONDJE.x, RONDJE.y, 68, kleur));
          else this.buiten.forEach((b) => b && this.ringen.push(this.selectieRing(b.x, b.y, 44, kleur)));
        }
      } else if (t.soort === "bakjes") {
        this.items.forEach((im, i) => {
          if (l === "alle" || (l === "leeg" && i >= t.vol)) this.ringen.push(this.selectieRing(im.x, im.y, 62, kleur));
        });
      }
    }

    /* ---------- stippen (de uitleg van Bliepo) ---------- */

    zetStippen(st: { n: number; grijs: number } | null) {
      if (!st || st.n !== this.stipN) {
        this.stipBox?.destroy();
        this.stipBox = null;
        this.stipItems = [];
        this.stipN = 0;
        this.stipGrijsNu = 0;
        if (!st) return;
        this.stipN = st.n;
        const box = this.add.container(0, 0);
        stipPlekken(st.n, stipY(this.toneel)).forEach((p, i) => {
          const im = this.plaats("sqm-stip-g", p.x, p.y);
          box.add(im);
          this.stipItems.push(im);
          if (!this.rustig) {
            im.setScale(0);
            this.tweens.add({ targets: im, scale: 1 / TX, delay: i * 25, duration: 180, ease: "Back.easeOut" });
          }
        });
        this.stipBox = box;
      }
      const van = this.stipGrijsNu;
      this.stipGrijsNu = st.grijs;
      const n = this.stipItems.length;
      const zet = (k: number, aan: boolean) => {
        const im = this.stipItems[n - 1 - k];
        if (!im) return;
        if (aan) im.setTint(0x8a96a8).setAlpha(0.35);
        else im.clearTint().setAlpha(1);
      };
      if (st.grijs <= van) {
        for (let k = 0; k < n; k++) zet(k, k < st.grijs);
        return;
      }
      for (let k = van; k < st.grijs; k++) this.klokken.push(this.time.delayedCall((k - van) * 200 + 150, () => zet(k, true)));
    }

    zetUitkomst(n: number | null) {
      const box = this.rechtsBlok;
      if (!box) return;
      this.rechtsLabel?.destroy();
      this.rechtsLabel = this.plaats(this.tekstTex(n === null ? "…" : String(n), 64, "#ffffff", "rgba(150,70,10,0.7)"), 0, 0);
      box.add(this.rechtsLabel);
      if (n !== null && !this.rustig) this.tweens.add({ targets: box, scale: 1.12, duration: 140, yoyo: true });
    }

    /* ---------- verbinden ---------- */

    zetLijnen(lijnen: (number | null)[], gekozen: { kant: "l" | "r"; i: number } | null, goed: boolean) {
      const gfx = this.lijnGfx;
      if (!gfx) return;
      gfx.clear();
      lijnen.forEach((j, i) => {
        if (j === null) return;
        const y1 = KAART_L.ys[i];
        const y2 = KAART_L.ys[j];
        gfx.lineStyle(7, goed ? GOED : 0xffffff, 1);
        gfx.lineBetween(KAART_L.x + KAART_L.b / 2 - 4, y1, KAART_R.x - KAART_R.b / 2 + 4, y2);
        gfx.fillStyle(goed ? GOED : 0xffffff, 1);
        gfx.fillCircle(KAART_L.x + KAART_L.b / 2 - 4, y1, 9);
        gfx.fillCircle(KAART_R.x - KAART_R.b / 2 + 4, y2, 9);
      });
      this.kaartRing?.destroy();
      this.kaartRing = null;
      if (gekozen) {
        const x = gekozen.kant === "l" ? KAART_L.x : KAART_R.x;
        const r = gekozen.kant === "l" ? 150 : 76;
        this.kaartRing = this.selectieRing(x, KAART_L.ys[gekozen.i], r, WARM);
      }
    }

    zetKaartGrijs(gr: { kaart: number; n: number } | null) {
      this.kaartVisjes.forEach((rij, k) =>
        rij.forEach((im, i) => {
          if (gr && gr.kaart === k && i >= rij.length - gr.n) im.setTint(0x8a96a8).setAlpha(0.35);
          else im.clearTint().setAlpha(1);
        }),
      );
    }

    /* ---------- bubbels ---------- */

    zetBubbels(weg: number[]) {
      weg.forEach((i) => {
        if (this.bubbelWeg.has(i)) return;
        this.bubbelWeg.add(i);
        const box = this.bubbelBoxen[i];
        if (!box) return;
        this.tweens.killTweensOf(box);
        this.golf(box.x, box.y);
        if (this.rustig) return box.setVisible(false);
        this.tweens.add({ targets: box, scale: 1.3, alpha: 0, duration: 260, ease: "Cubic.easeOut", onComplete: () => box.setVisible(false) });
      });
    }

    bubbelFout(i: number) {
      const box = this.bubbelBoxen[i];
      const t = this.toneel;
      if (!box || !t || t.soort !== "bubbels") return;
      this.schud(box);
      const [a, b] = t.sommen[i];
      const label = this.plaats(this.tekstTex(`${a} − ${b} = ${a - b}`, 40, "#ff8f8f"), BUBBEL_PLEK[i].x, BUBBEL_PLEK[i].y - BUBBEL_D / 2 - 18).setScale(1 / TX);
      this.groep?.add(label);
      this.time.delayedCall(1800, () => (this.rustig ? label.destroy() : this.tweens.add({ targets: label, alpha: 0, duration: 300, onComplete: () => label.destroy() })));
    }

    /* ---------- goed en fout ---------- */

    goed() {
      const t = this.toneel;
      const midden = t?.soort === "bus" ? { x: 400, y: 400 } : t?.soort === "machine" ? MACH.rechts : t?.soort === "geld" ? GELD.ding : { x: 490, y: 380 };
      this.golf(midden.x, midden.y);
      if (this.rustig) return;
      this.items.forEach((im, i) => {
        if (im.alpha < 0.5) return;
        const basis = im.scaleX;
        this.tweens.add({ targets: im, scaleX: basis * 1.12, scaleY: basis * 1.12, delay: i * 20, duration: 130, yoyo: true, onComplete: () => im.setScale(basis) });
      });
    }

    fout() {
      if (this.groep) this.schud(this.groep);
    }

    /** Voor `npm run vloeiend`: dieren tevoorschijn, een paar zwemmen weg, de bus, de bubbels. */
    demo(ms: number) {
      const eind = performance.now() + ms;
      let k = 0;
      const tonelen: Toneel[] = [
        { soort: "zee", id: "demo-zee", dier: "visje", n: 16 },
        { soort: "bus", id: "demo-bus", in: 14, rondje: false },
        { soort: "bubbels", id: "demo-bubbels", sommen: [[7, 7], [9, 4], [12, 12], [8, 0], [15, 15], [11, 6]] },
      ];
      const stap = () => {
        if (performance.now() > eind) return;
        const t = tonelen[k++ % tonelen.length];
        this.zetToneel(t);
        this.zetStippen({ n: 13, grijs: 0 });
        this.time.delayedCall(350, () => {
          this.zetGrijs(5);
          this.zetStippen({ n: 13, grijs: 5 });
          if (t.soort === "bubbels") this.zetBubbels([0, 2]);
        });
        this.time.delayedCall(1300, () => this.goed());
        this.time.delayedCall(1700, () => this.zetStippen(null));
        this.time.delayedCall(1800, stap);
      };
      stap();
    }
  }
  return Min as unknown as new () => import("phaser").Scene;
}

/* ---------- het vlak ---------- */

/** De som als tekst: "?" wordt een oplichtend vakje. */
function Som({ tekst, plek }: { tekst: string; plek: "boven" | "midden" | "bord" }) {
  const delen = tekst.split(" ");
  return (
    <div className={`${s.som} ${plek === "boven" ? s.somBoven : plek === "midden" ? s.somMidden : s.somBord}`} aria-hidden>
      {delen.map((d, i) =>
        d === "?" ? (
          <span key={i} className={s.vak}>
            ?
          </span>
        ) : (
          <span key={i}>{d}</span>
        ),
      )}
    </div>
  );
}

export function SqulaMinVlak({
  toneel,
  som = null,
  grijs = 0,
  licht = null,
  stippen = null,
  uitkomst = null,
  verbind = null,
  bubbels = null,
  goed = 0,
  fout = 0,
  meld,
  schaal,
}: MinVlakProps & Vlakbasis) {
  const { plek, scene } = useHoloMotor<MinScene>(schaal, maakMinScene);
  const letterPlek = useRef<HTMLDivElement>(null);
  const sleutel = toneel ? JSON.stringify(toneel) : "";
  const t = useMemo(() => (sleutel ? (JSON.parse(sleutel) as Toneel) : null), [sleutel]);

  useEffect(() => {
    if (!scene) return;
    if (letterPlek.current) scene.zetLetter(getComputedStyle(letterPlek.current).fontFamily);
    scene.zetToneel(t);
  }, [scene, t]);
  useEffect(() => {
    scene?.zetGrijs(grijs);
  }, [scene, t, grijs]);
  useEffect(() => {
    scene?.zetLicht(licht);
  }, [scene, t, licht]);
  const stipSleutel = stippen ? `${stippen.n}-${stippen.grijs}` : "";
  useEffect(() => {
    scene?.zetStippen(stipSleutel ? { n: Number(stipSleutel.split("-")[0]), grijs: Number(stipSleutel.split("-")[1]) } : null);
  }, [scene, t, stipSleutel]);
  useEffect(() => {
    scene?.zetUitkomst(uitkomst);
  }, [scene, t, uitkomst]);
  useEffect(() => {
    if (scene && goed > 0) scene.goed();
  }, [scene, goed]);
  useEffect(() => {
    if (scene && fout > 0) scene.fout();
  }, [scene, fout]);

  const somPlek = !t ? "boven" : t.soort === "som" ? "midden" : t.soort === "bord" ? "bord" : "boven";

  return (
    <div className={s.vlak} ref={letterPlek}>
      <div ref={plek} style={HOLO_CANVAS} aria-hidden />
      {som && t?.soort !== "verbind" && t?.soort !== "bubbels" && <Som tekst={som} plek={somPlek} />}
      {t?.soort === "verbind" && verbind && <Verbinden key={`${t.id}-${verbind.keer}`} toneel={t} stand={verbind} scene={scene} meld={meld} />}
      {t?.soort === "bubbels" && bubbels && <Bubbels toneel={t} stand={bubbels} scene={scene} meld={meld} />}
    </div>
  );
}

/* ---------- verbinden: tik een som en dan een antwoord ---------- */

function Verbinden({
  toneel,
  stand,
  scene,
  meld,
}: {
  toneel: Extract<Toneel, { soort: "verbind" }>;
  stand: VerbindStand;
  scene: MinScene | null;
  meld: Vlakbasis["meld"];
}) {
  const [lijnen, setLijnen] = useState<(number | null)[]>(() => toneel.sommen.map((_, i) => stand.vast[i] ?? null));
  const [gekozen, setGekozen] = useState<{ kant: "l" | "r"; i: number } | null>(null);
  const correct = useMemo(() => verbindCorrect(toneel), [toneel]);
  const gemeld = useRef(false);

  useEffect(() => {
    scene?.zetLijnen(lijnen, gekozen, !!stand.goed);
  }, [scene, lijnen, gekozen, stand.goed]);
  useEffect(() => {
    scene?.zetKaartGrijs(stand.kaartGrijs ?? null);
  }, [scene, stand.kaartGrijs]);

  /* Alle drie verbonden: melden (één keer per ronde). */
  useEffect(() => {
    if (!stand.actief || gemeld.current || lijnen.some((j) => j === null)) return;
    gemeld.current = true;
    meld({ soort: "verbonden", paren: lijnen });
  }, [lijnen, stand.actief, meld]);
  /* Weer actief na een fout (zelfde ronde): opnieuw kunnen melden. */
  useEffect(() => {
    if (stand.actief && lijnen.some((j) => j === null)) gemeld.current = false;
  }, [stand.actief, lijnen]);

  /* Voor de automatische test: wat nu verder helpt. */
  useEffect(() => {
    if (!stand.actief) return;
    const zet = () => {
      let doel: string | null = null;
      if (gekozen?.kant === "l") doel = `r${correct[gekozen.i]}`;
      else if (gekozen?.kant === "r") {
        const i = correct.indexOf(gekozen.i);
        doel = `l${i}`;
      } else {
        const i = lijnen.findIndex((j, k) => j !== correct[k]);
        doel = i >= 0 ? `l${i}` : null;
      }
      window.__phaser = { ...window.__phaser, antwoord: doel };
    };
    zet();
    const klok = setInterval(zet, 250);
    return () => clearInterval(klok);
  }, [stand.actief, gekozen, lijnen, correct]);

  function tik(kant: "l" | "r", i: number) {
    if (!stand.actief) return;
    speelLesgeluid("tik");
    if (!gekozen || gekozen.kant === kant) {
      if (gekozen && gekozen.kant === kant && gekozen.i === i) return setGekozen(null);
      /* Een som die al een lijn had: die lijn gaat weg, de som is gekozen. */
      if (kant === "l" && lijnen[i] !== null) setLijnen((oud) => oud.map((j, k) => (k === i ? null : j)));
      if (kant === "r" && lijnen.includes(i)) setLijnen((oud) => oud.map((j) => (j === i ? null : j)));
      return setGekozen({ kant, i });
    }
    const links = kant === "l" ? i : gekozen.i;
    const rechts = kant === "r" ? i : gekozen.i;
    setLijnen((oud) => oud.map((j, k) => (k === links ? rechts : j === rechts ? null : j)));
    setGekozen(null);
  }

  return (
    <div data-knop="keuzes">
      {toneel.sommen.map(([a, b], i) => (
        <button
          key={`l${i}`}
          type="button"
          className={s.ding}
          style={{ left: KAART_L.x - KAART_L.b / 2, top: KAART_L.ys[i] - KAART_L.h / 2, width: KAART_L.b, height: KAART_L.h }}
          data-ding={`l${i}`}
          aria-label={`${a} min ${b}`}
          aria-pressed={gekozen?.kant === "l" && gekozen.i === i}
          disabled={!stand.actief}
          onClick={() => tik("l", i)}
        />
      ))}
      {toneel.uitkomsten.map((u, j) => (
        <button
          key={`r${j}`}
          type="button"
          className={s.ding}
          style={{ left: KAART_R.x - KAART_R.b / 2, top: KAART_L.ys[j] - KAART_R.h / 2, width: KAART_R.b, height: KAART_R.h }}
          data-ding={`r${j}`}
          aria-label={String(u)}
          aria-pressed={gekozen?.kant === "r" && gekozen.i === j}
          disabled={!stand.actief}
          onClick={() => tik("r", j)}
        />
      ))}
    </div>
  );
}

/* ---------- bubbels: tik de sommen met uitkomst 0 ---------- */

function Bubbels({
  toneel,
  stand,
  scene,
  meld,
}: {
  toneel: Extract<Toneel, { soort: "bubbels" }>;
  stand: BubbelStand;
  scene: MinScene | null;
  meld: Vlakbasis["meld"];
}) {
  const wegSleutel = stand.weg.join(",");
  useEffect(() => {
    scene?.zetBubbels(wegSleutel ? wegSleutel.split(",").map(Number) : []);
  }, [scene, wegSleutel]);
  const foutKeer = stand.fout?.keer ?? 0;
  const foutI = stand.fout?.i ?? -1;
  useEffect(() => {
    if (scene && foutKeer > 0 && foutI >= 0) scene.bubbelFout(foutI);
  }, [scene, foutKeer, foutI]);

  /* Voor de automatische test: een som met 0 die nog niet getikt is. */
  useEffect(() => {
    if (!stand.actief) return;
    const doel = toneel.sommen.findIndex(([a, b], i) => a === b && !stand.weg.includes(i));
    const zet = () => (window.__phaser = { ...window.__phaser, antwoord: doel >= 0 ? `b${doel}` : null });
    zet();
    const klok = setInterval(zet, 250);
    return () => clearInterval(klok);
  }, [stand.actief, stand.weg, toneel]);

  return (
    <div data-knop="keuzes">
      {toneel.sommen.map(([a, b], i) =>
        stand.weg.includes(i) ? null : (
          <button
            key={i}
            type="button"
            className={`${s.ding} ${s.rond}`}
            style={{ left: BUBBEL_PLEK[i].x - 76, top: BUBBEL_PLEK[i].y - 80, width: 152, height: 152 }}
            data-ding={`b${i}`}
            aria-label={`${a} min ${b}`}
            disabled={!stand.actief}
            onClick={() => {
              if (!stand.actief) return;
              speelLesgeluid("tik");
              meld({ soort: "bubbel", i });
            }}
          />
        ),
      )}
    </div>
  );
}

/** Kaarttekening voor aan het eind: een visje en een min-teken (SVG 244 × 190). */
export function KaartMinsommen() {
  return (
    <>
      {[0, 1, 2, 3, 4].map((k) => (
        <circle key={k} cx={42 + k * 34} cy={70} r={13} fill={k < 3 ? "#ffd36e" : "rgba(138,150,168,0.45)"} stroke="#ffffff" strokeWidth={2.5} />
      ))}
      <text x={122} y={150} fontSize={40} fontWeight={800} fill="#ffffff" textAnchor="middle">
        5 − 2 = 3
      </text>
    </>
  );
}
