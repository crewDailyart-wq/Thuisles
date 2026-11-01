"use client";

/**
 * Het speelvlak van de lessen "Minsommen" naar Squla groep 3 (30-31 oktober
 * 2026, opdracht eigenaar). Eén Phaser-scène (holo/basis.ts) met een "toneel"
 * per soort vraag. Stijl (besluit Sara, 31 oktober): donker (nacht), plaatjes
 * ZONDER vaste gloed en zonder kaders; gloed alleen op het moment dat het iets
 * betekent (meetellen = een ring, goed = even oplichten). Geen mensen en geen
 * dieren: de dieren van Squla zijn dingen uit de ruimte geworden, de kinderen
 * in de bus pakjes die bezorgd worden.
 *
 *   ruimte    dingen (raketjes, bellen, sterren …) in rijtjes van 5 (eerste
 *             tien boven, de rest eronder), soms met een ufo die er een paar
 *             meeneemt;
 *   som       alleen een grote som (disco en typen), met een ding als
 *             versiering of een luidspreker (de som wordt alleen gezegd);
 *   verbind   drie groepjes raketjes met een som, drie antwoorden; het kind
 *             verbindt ze met lijnen;
 *   bubbels   bellen met sommen; het kind tikt de sommen met uitkomst 0 aan
 *             (zonder tijdsdruk: de bellen zweven op hun plek);
 *   bus       een bezorgbus met pakjes; wat bezorgd is, staat buiten (of: een
 *             rood rondje met het getal);
 *   machine   de min-machine op de band: 10 → −5 → ?;
 *   bord      een schoolbord met de som in krijt;
 *   bakjes    bekers of borden, een deel leeg;
 *   geld      een portemonnee met geld en iets om te kopen (officiële plaatjes
 *             uit public/geld/ en public/geld/los/, klein).
 *
 * Elk echt ding is een vast plaatje uit public/voorwerpen/<naam>.png
 * (src/lib/voorwerpen, WISSELEN.md), getekend met tekenVoorwerp. De les zet al
 * die namen in `voorwerpen` (zie VOORWERPEN_ALLE hieronder). In code getekend
 * blijft alleen rekenmateriaal: stippen, de min-machine, pijlen.
 *
 * Bliepo's uitleg zie je in beeld: `grijs` = zoveel dingen of stippen worden
 * grijs en half doorzichtig (van achteren af: eerst de rij onder de tien, dan
 * de rest), bij de bus gaan er zoveel pakjes de bus uit; `licht` zet een ring
 * om wat geteld moet worden; `stippen` = een rij stippen (rijtjes van 5).
 *
 * Tikken gaat via onzichtbare knoppen boven de tekening (data-ding, ook voor
 * de automatische test); meldt `{ soort: "verbonden", paren }` en
 * `{ soort: "bubbel", i }`.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import type { Vlakbasis } from "../soort";
import { holoBasis, TX, WARM, GOED, type PhaserModule } from "../holo/basis";
import { HOLO_CANVAS, useHoloMotor } from "../holo/motor";
import { speelLesgeluid } from "@/lib/lesgeluiden";
import { tekenVoorwerp, voorwerpKleurbaar } from "../voorwerpen";
import { KLEURHEX, ringRuimte, somKleuren, tekenMetRing } from "./squla-getalring";

/** De twee kleuren (hex) van de som a − b: het eerste getal en wat overblijft, en het tweede getal en wat weggaat (BOUWREGELS 2.1, 14.24). */
const somHex = (a: number, b: number): [string, string] => {
  const [ka, kb] = somKleuren(a, b);
  return [KLEURHEX[ka], KLEURHEX[kb]];
};
import {
  DING,
  hexGetal,
  tekenBak,
  tekenBand,
  tekenBlok,
  tekenKlep,
  tekenLichtje,
  tekenLuister,
  tekenMachine,
  tekenPijl,
  tekenPijlRechts,
  tekenStip,
  tekenStuk,
  type Bakje,
  type Ding,
  type Speelgoed,
} from "./squla-minsommen-tekenen";
import s from "./squla-minsommen.module.css";

export type { Bakje, Ding, Speelgoed };
/** Geld in euro: munt van 1 of 2, briefje van 5 of 10. */
export type Geld = 1 | 2 | 5 | 10;

export type Toneel =
  | { soort: "ruimte"; id: string; ding: Ding; n: number; /** Hoeveel er weggaan (die krijgen de kleur van dat getal). */ b?: number; ufo?: boolean }
  | { soort: "som"; id: string; deco?: Ding | "luidspreker" | null }
  | { soort: "verbind"; id: string; sommen: [number, number][]; uitkomsten: number[] }
  | { soort: "bubbels"; id: string; sommen: [number, number][] }
  | { soort: "bus"; id: string; in: number; /** Hoeveel er bezorgd worden (die krijgen de kleur van dat getal). */ b?: number; rondje: boolean }
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
  /** Bij de uitleg: bij som `kaart` worden er `n` raketjes grijs. */
  kaartGrijs?: { kaart: number; n: number } | null;
};

export type BubbelStand = { actief: boolean; weg: number[]; fout: { i: number; keer: number } | null };

export type MinVlakProps = {
  toneel: Toneel | null;
  /** De som in beeld ("7 − 4", "8 − 3 = ?"); bij het bord op het bord. */
  som?: string | null;
  /** Zoveel dingen worden grijs; bij de bus: zoveel pakjes zijn de bus uit. */
  grijs?: number;
  licht?: Licht;
  /** Stippen voor de uitleg (rijtjes van 5), met zoveel grijs. */
  stippen?: { n: number; grijs: number } | null;
  /** Machine: wat er uit de machine komt (anders "?"). */
  uitkomst?: number | null;
  verbind?: VerbindStand | null;
  bubbels?: BubbelStand | null;
  goed?: number;
  fout?: number;
};

/* ---------- waar staat wat (punten van het vlak, 980 × 720) ---------- */

type Plek = { x: number; y: number };

/** Dingen: tot 10 in twee rijtjes van 5; meer dan 10: de eerste tien boven, de rest eronder. */
function ruimtePlekken(n: number, metUfo: boolean): { plekken: Plek[]; schaal: number } {
  const cx = metUfo ? 400 : 490;
  if (n <= 10) {
    const cel = 108;
    const rijen = Math.ceil(n / 5);
    const y0 = 400 - ((rijen - 1) * cel) / 2;
    return { plekken: Array.from({ length: n }, (_, i) => ({ x: cx + ((i % 5) - 2) * cel, y: y0 + Math.floor(i / 5) * cel })), schaal: 0.92 };
  }
  const cel = 84;
  const rijen = Math.ceil(n / 5);
  const hoog = (rijen - 1) * cel + 30;
  const y0 = 400 - hoog / 2;
  return {
    plekken: Array.from({ length: n }, (_, i) => {
      const r = Math.floor(i / 5);
      return { x: cx + ((i % 5) - 2) * cel, y: y0 + r * cel + (r >= 2 ? 30 : 0) };
    }),
    schaal: 0.76,
  };
}

const UFO_PLEK: Plek = { x: 830, y: 300 };

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
  if (!t || t.soort === "som") return 460;
  if (t.soort === "geld") return 604;
  /* Bij de machine staat het bakje op 586; de stippen van de uitleg staan eronder. */
  if (t.soort === "machine") return 656;
  return 586;
}

/* Bus: het plaatje "bezorgbus" (vierkant) links; de pakjes liggen in de laadruimte. */
const BUS = { x: 330, y: 380, maat: 640 };
/** De laadruimte als deel van het (vierkante) plaatje: links, boven, breed, hoog. */
const LAAD = { x: 0.13, y: 0.34, b: 0.46, h: 0.22 };
/** Het pakje is als plaatje PAKJE groot; in de bus krijgt het zijn maat uit busMaat (BOUWREGELS 14.23). */
const PAKJE = 56;
/** Zo groot als past in het raam, in rijen van 5 zoals een tienrek (10 = twee rijen van 5): tot 10 pakjes ±58, meer pakjes kleiner. */
const busMaat = (n: number) => Math.min(58, (LAAD.h * BUS.maat) / Math.max(1, Math.ceil(n / 5)));
/** Plek van pakje i van n in de bus: rijen van 5, de onderste rij eerst. */
function busPlek(i: number, n: number): Plek {
  const m = busMaat(n);
  const links = BUS.x - BUS.maat / 2 + LAAD.x * BUS.maat;
  const boven = BUS.y - BUS.maat / 2 + LAAD.y * BUS.maat;
  return { x: links + (LAAD.b * BUS.maat) / 2 + ((i % 5) - 2) * m, y: boven + LAAD.h * BUS.maat - m / 2 - 2 - Math.floor(i / 5) * m };
}
/** Bezorgd: buiten de bus op een stapeltje van 3 breed. */
function buitenPlek(i: number): Plek {
  return { x: 790 + (i % 3) * 62, y: 484 - Math.floor(i / 3) * 58 };
}
const RONDJE: Plek = { x: 860, y: 400 };
const PIJL: Plek = { x: 700, y: 400 };

/* Verbinden (geen kaartjes: de raketjes en de som staan los) */
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
/* De stukjes (BOUWREGELS 14.23: groot, apart te zien, vrolijk): links op de band, uit de machine in het bakje, de rest naar het vraagteken. */
const STUK = 56;
const STUK_ZIT = 52;
const MACH_T0 = 700;
/** Plek van stukje i van n links op de band: rijen van 5, de onderste rij ligt op de band. */
const stukBand = (i: number): Plek => ({ x: 70 + (i % 5) * 56, y: 394 - Math.floor(i / 5) * 52 });
/** Plek van uitgevallen stukje j in het bakje onder de machine. */
const stukBak = (j: number, b: number): Plek => ({ x: 490 + ((j % 5) - (Math.min(5, b) - 1) / 2) * 50, y: 528 - Math.floor(j / 5) * 48 });
/** Plek van stukje k van n boven het vraagteken (het goede antwoord, na het goede antwoord). */
const stukUitkomst = (k: number, n: number): Plek => ({ x: MACH.rechts.x + ((k % 5) - (Math.min(5, n) - 1) / 2) * 56, y: 222 - Math.floor(k / 5) * 54 });

/* Bakjes */
function bakjePlekken(n: number): Plek[] {
  const cel = 132;
  const rijen = Math.ceil(n / 5);
  const y0 = 380 - ((rijen - 1) * 150) / 2;
  return Array.from({ length: n }, (_, i) => ({ x: 490 + ((i % 5) - 2) * cel, y: y0 + Math.floor(i / 5) * 150 }));
}

/* Geld: munten zonder wit vierkant (public/geld/los/), briefjes met "specimen" (public/geld/). Klein, nooit ware grootte. */
const GELD_MAAT: Record<Geld, { b: number; h: number }> = { 1: { b: 62, h: 62 }, 2: { b: 68, h: 68 }, 5: { b: 140, h: 71 }, 10: { b: 146, h: 77 } };
const GELD_BESTAND: Record<Geld, string> = { 1: "/geld/los/munt-1-euro.png", 2: "/geld/los/munt-2-euro.png", 5: "/geld/briefje-5-euro.jpg", 10: "/geld/briefje-10-euro.jpg" };
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
/* Het geld ligt vóór de portemonnee (eruit gehaald), niet in de lucht erboven (BOUWREGELS 14.23). */
const GELD = { heb: { x: 260, y: 560 }, beurs: { x: 260, y: 400 }, ding: { x: 730, y: 260 }, prijs: { x: 730, y: 440 } };

/* ---------- de plaatjes: vaste voorwerpen ---------- */

/** Hoe groot een voorwerp getekend wordt (een vak in punten; het plaatje past erin zonder vervormen). */
const MAAT: Record<string, number> = {
  raketje: 100,
  ballon: 100,
  zeepbel: 100,
  ufo: 100,
  satelliet: 100,
  ster: 100,
  komeet: 100,
  bezorgbus: BUS.maat,
  pakje: PAKJE,
  schoolbord: 660,
  "beker-vol": 120,
  "beker-leeg": 120,
  bord: 130,
  koekje: 70,
  portemonnee: 230,
  ijsje: 170,
  bal: 170,
  boek: 170,
  vlieger: 170,
};

/** Alle voorwerpen die dit vlak kan tekenen (voor `voorwerpen` in de les). */
export const VOORWERPEN_ALLE = Object.keys(MAAT);

/** De gloedkleur van een voorwerp (alleen voor de momenten: goed, meetellen). */
function gloedKleur(naam: string) {
  return naam in DING ? hexGetal(DING[naam as Ding].vul) : WARM;
}

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
    /** Wat grijs kan worden of een ring kan krijgen (dingen, pakjes in de bus, bakjes). */
    items: Img[] = [];
    /** De naam van elk item (voor even oplichten bij goed). */
    itemSleutel: string[] = [];
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
    machDoos: Box | null = null;
    machVoor: Box | null = null;
    machAchter: Box | null = null;
    machLampen: Img[] = [];
    machBulten: Img[] = [];
    machInn: Img[] = [];
    machDrop: Img[] = [];
    machRest: Img[] = [];
    machLos: Img[] = [];
    machUit: Img[] = [];
    machTw: import("phaser").Tweens.Tween[] = [];
    machKl: Klok[] = [];
    machOff = 0;
    machKlaar = true;
    machUitN = -1;
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
    }

    zetLetter(f: string) {
      this.letter = f || this.letter;
    }

    /* ---------- plaatjes: zonder vaste gloed; de gloed alleen voor even ---------- */

    /** Het voorwerp als plaatje in zijn vak (één keer getekend, op dubbele scherpte). */
    tex(naam: string, kleur?: string) {
      const m = MAAT[naam] ?? 100;
      if (kleur) {
        /* Met een ring in de kleur van zijn getal (BOUWREGELS 2.1), één keer getekend. */
        const sl = `sqm-vwk-${naam}-${kleur.slice(1)}`;
        const r = ringRuimte(m, m);
        this.canvasPlaatje(sl, m + 2 * r, m + 2 * r, (c) => tekenMetRing(c, m, m, kleur, (cc, x, y, b, h) => tekenVoorwerp(cc, naam, x, y, b, h), voorwerpKleurbaar(naam)));
        return sl;
      }
      const sl = `sqm-vw-${naam}`;
      this.canvasPlaatje(sl, m, m, (c) => tekenVoorwerp(c, naam, 0, 0, m, m));
      return sl;
    }

    /** Een sleutel van een item: "naam" of "naam|#kleur". */
    texSleutel(k: string) {
      const [naam, kleur] = k.split("|");
      return this.tex(naam, kleur);
    }

    /** Hetzelfde plaatje mét een zachte gloed (gebakken), voor het moment dat het iets betekent. */
    texGloed(k: string) {
      const [naam, kleur] = k.split("|");
      const sl = `sqm-vw-${naam}${kleur ? `-${kleur.slice(1)}` : ""}-gloed`;
      if (!this.textures.exists(sl)) this.bak(this.tex(naam, kleur), sl, kleur ? hexGetal(kleur) : gloedKleur(naam));
      return sl;
    }

    /** Even oplichten en dan weer gewoon. */
    flits(im: Img, k: string, ms = 700) {
      if (!im.active) return;
      const gewoon = this.texSleutel(k);
      im.setTexture(this.texGloed(k));
      this.time.delayedCall(ms, () => im.active && im.setTexture(gewoon));
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

    /** Een som als losse stukjes, elk getal in zijn eigen kleur (BOUWREGELS 2.1): "7 − 4 =" of "7 − 4". */
    somRij(x: number, y: number, a: number, b: number, grootte: number, metIs: boolean) {
      const [hexA, hexB] = somHex(a, b);
      const delen: [string, string][] = [[String(a), hexA], [" − ", "#ffffff"], [String(b), hexB], ...(metIs ? ([[" =", "#ffffff"]] as [string, string][]) : [])];
      const meet = document.createElement("canvas").getContext("2d")!;
      meet.font = `800 ${grootte}px ${this.letter}`;
      const br = delen.map(([t]) => meet.measureText(t).width);
      const tot = br.reduce((u, w) => u + w, 0);
      let cx = x - tot / 2;
      return delen.map(([t, k], i) => {
        const im = this.plaats(this.tekstTex(t, grootte, k), cx + br[i] / 2, y).setScale(1 / TX);
        cx += br[i];
        return im;
      });
    }

    stopKlokken() {
      this.klokken.forEach((k) => k.remove(false));
      this.klokken = [];
    }

    /** Een item dat grijs kan worden en mee kan lichten. */
    item(g: Box, k: string, x: number, y: number, schaal = 1, kleur?: string) {
      const im = this.plaats(this.tex(k, kleur), x, y).setScale(schaal / TX);
      g.add(im);
      this.items.push(im);
      this.itemSleutel.push(kleur ? `${k}|${kleur}` : k);
      return im;
    }

    /* ---------- een nieuw toneel ---------- */

    zetToneel(t: Toneel | null) {
      this.stopKlokken();
      this.machStop();
      const oud = this.groep;
      this.groep = null;
      this.items = [];
      this.itemSleutel = [];
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
      if (t.soort === "ruimte") this.maakRuimte(g, t);
      else if (t.soort === "som") this.maakSom(g, t);
      else if (t.soort === "verbind") this.maakVerbind(g, t);
      else if (t.soort === "bubbels") this.maakBubbels(g, t);
      else if (t.soort === "bus") this.maakBus(g, t);
      else if (t.soort === "machine") this.maakMachine(g, t);
      else if (t.soort === "bord") g.add(this.plaats(this.tex("schoolbord"), 490, 300).setScale(1 / TX));
      else if (t.soort === "bakjes") this.maakBakjes(g, t);
      else this.maakGeld(g, t);
      if (!this.rustig) {
        g.setAlpha(0);
        this.tweens.add({ targets: g, alpha: 1, duration: 260 });
      }
    }

    maakRuimte(g: Box, t: Extract<Toneel, { soort: "ruimte" }>) {
      const { plekken, schaal } = ruimtePlekken(t.n, !!t.ufo);
      this.itemSchaal = schaal;
      plekken.forEach((p, i) => {
        const im = this.item(g, t.ding, p.x, p.y, schaal, somHex(t.n, t.b ?? 0)[0]);
        if (!this.rustig) this.tweens.add({ targets: im, y: p.y - 5, duration: 1300 + (i % 4) * 170, yoyo: true, repeat: -1, ease: "Sine.easeInOut", delay: (i * 97) % 600 });
      });
      if (t.ufo) {
        const ufo = this.plaats(this.tex("ufo"), UFO_PLEK.x, UFO_PLEK.y).setScale(1.7 / TX);
        g.add(ufo);
        if (!this.rustig) this.tweens.add({ targets: ufo, y: UFO_PLEK.y - 10, duration: 1600, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
      }
    }

    maakSom(g: Box, t: Extract<Toneel, { soort: "som" }>) {
      if (!t.deco) return;
      if (t.deco === "luidspreker") {
        this.canvasPlaatje("sqm-luister", 160, 140, tekenLuister);
        g.add(this.plaats("sqm-luister", 490, 350));
      }
      else g.add(this.plaats(this.tex(t.deco), 850, 590).setScale(1.2 / TX));
    }

    maakVerbind(g: Box, t: Extract<Toneel, { soort: "verbind" }>) {
      t.sommen.forEach(([a, b], k) => {
        const y = KAART_L.ys[k];
        const rij: Img[] = [];
        for (let i = 0; i < a; i++) {
          const im = this.plaats(this.tex("raketje", somHex(a, b)[0]), KAART_L.x + ((i % 5) - 2) * 50, y - 52 + Math.floor(i / 5) * 46).setScale(0.44 / TX);
          g.add(im);
          rij.push(im);
        }
        this.kaartVisjes.push(rij);
        this.somRij(KAART_L.x, y + 58, a, b, 44, true).forEach((im) => g.add(im));
      });
      t.uitkomsten.forEach((u, j) => g.add(this.plaats(this.tekstTex(String(u), 72), KAART_R.x, KAART_L.ys[j]).setScale(1 / TX)));
      this.lijnGfx = this.add.graphics();
      g.add(this.lijnGfx);
    }

    maakBubbels(g: Box, t: Extract<Toneel, { soort: "bubbels" }>) {
      t.sommen.forEach(([a, b], i) => {
        const p = BUBBEL_PLEK[i];
        const box = this.add.container(p.x, p.y, [this.plaats(this.tex("zeepbel"), 0, 0).setScale(BUBBEL_D / 100 / TX), ...this.somRij(0, 0, a, b, 46, false)]);
        if (!this.rustig) this.tweens.add({ targets: box, y: p.y - 9, duration: 1500 + i * 180, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
        g.add(box);
        this.bubbelBoxen.push(box);
      });
    }

    maakBus(g: Box, t: Extract<Toneel, { soort: "bus" }>) {
      g.add(this.plaats(this.tex("bezorgbus"), BUS.x, BUS.y));
      for (let i = 0; i < t.in; i++) {
        const p = busPlek(i, t.in);
        this.item(g, "pakje", p.x, p.y, (busMaat(t.in) * 0.9) / PAKJE, somHex(t.in, t.b ?? 0)[0]);
      }
      this.itemSchaal = 1;
    }

    /* ---------- de min-machine: alles beweegt mee met wat Bliepo zegt ---------- */

    stukTex(hex: string) {
      const sl = `sqm-stuk-${hex.slice(1)}`;
      this.canvasPlaatje(sl, STUK, STUK, (c) => tekenStuk(c, hex, STUK));
      return sl;
    }

    stuk(box: Box, hex: string, p: Plek, maat = STUK_ZIT) {
      const im = this.plaats(this.stukTex(hex), p.x, p.y).setScale(maat / STUK / TX);
      box.add(im);
      return im;
    }

    mt(config: Record<string, unknown>) {
      const tw = this.tweens.add(config as never);
      this.machTw.push(tw);
      return tw;
    }

    /** Stopt alles wat de machine bewoog (voor een ander toneel of bij het eind). */
    machStop() {
      this.machKl.forEach((k) => k.remove(false));
      this.machKl = [];
      this.machTw.forEach((tw) => tw.stop());
      this.machTw = [];
      [this.machInn, this.machRest, this.machLos, this.machUit].forEach((lijst) => lijst.forEach((im) => im.active && im.destroy()));
      this.machInn = [];
      this.machRest = [];
      this.machLos = [];
      this.machUit = [];
      this.machDrop = [];
      this.machLampen = [];
      this.machBulten = [];
      this.machDoos = null;
      this.machVoor = null;
      this.machAchter = null;
      this.machKlaar = true;
      this.machUitN = -1;
    }

    zetBulten(off: number) {
      this.machBulten.forEach((im, n) => {
        const x = 40 + 24 - 46 + n * 46 + off;
        im.setX(x).setAlpha(x < 52 || x > 924 ? 0 : 1);
      });
    }

    /** De machine staat stil: alle stukjes die eruit vielen liggen in het bakje, de rest is naar het vraagteken. */
    machineEind() {
      const t = this.toneel;
      if (this.machKlaar || !t || t.soort !== "machine" || !this.machVoor) return;
      this.machKl.forEach((k) => k.remove(false));
      this.machKl = [];
      this.machTw.forEach((tw) => tw.stop());
      this.machTw = [];
      [this.machInn, this.machRest, this.machLos].forEach((lijst) => lijst.forEach((im) => im.active && im.destroy()));
      this.machInn = [];
      this.machRest = [];
      this.machLos = [];
      this.machKlaar = true;
      this.machDoos?.setPosition(MACH.machine.x, MACH.machine.y).setAngle(0).setScale(1);
      this.machLampen.forEach((l) => l.setAlpha(0));
      this.zetBulten(0);
      const hexB = somHex(t.start, t.eraf)[1];
      for (let j = 0; j < t.eraf; j++) {
        const p = stukBak(j, t.eraf);
        const im = this.machDrop[j];
        if (im?.active) im.setPosition(p.x, p.y).setScale(STUK_ZIT / STUK / TX).setAlpha(1);
        else this.machDrop[j] = this.stuk(this.machVoor, hexB, p);
      }
    }

    startMachine(t: Extract<Toneel, { soort: "machine" }>) {
      const a = t.start;
      const b = t.eraf;
      const r = a - b;
      const [hexA, hexB] = somHex(a, b);
      const voor = this.machVoor!;
      const achter = this.machAchter!;
      const box = this.machDoos!;
      const vol = (ms: number, f: () => void) => this.machKl.push(this.time.delayedCall(ms, f));
      /* 1. De stukjes rollen de machine in, de dichtstbijzijnde eerst, met een klein sprongetje en een rolgeluid. */
      const volgorde = Array.from({ length: a }, (_, i) => i).sort((x, y) => (y % 5) - (x % 5) || x - y);
      volgorde.forEach((i, n) => {
        const im = this.machInn[i];
        const p = stukBand(i);
        vol(MACH_T0 + n * 130, () => {
          if (!im.active) return;
          speelLesgeluid("bandRol");
          this.mt({ targets: im, y: p.y - 9, duration: 110, yoyo: true, ease: "Quad.easeOut" });
          this.mt({ targets: im, x: 500, duration: 650, ease: "Sine.easeIn", onComplete: () => im.active && im.destroy() });
        });
      });
      const aankomst = MACH_T0 + (a - 1) * 130 + 650;
      /* De band loopt zolang de stukjes rollen. */
      const bandTot = aankomst + 100;
      this.mt({
        targets: { v: 0 },
        v: 46,
        duration: 600,
        repeat: Math.ceil(bandTot / 600),
        onUpdate: (tw: import("phaser").Tweens.Tween) => this.zetBulten(Number(tw.getValue(0))),
      });
      /* 2. De machine slaat aan: zoemen, schudden, lampjes knipperen, stoom. */
      const D0 = MACH_T0 + 620;
      const stap = b > 5 ? 300 : 340;
      const R0 = D0 + b * stap + 350;
      const eind = R0 + r * 130 + 450;
      vol(D0 - 300, () => speelLesgeluid("machineAan"));
      const schudTijd = eind - (D0 - 300);
      this.mt({ targets: box, angle: { from: -0.9, to: 0.9 }, x: MACH.machine.x + 2, duration: 75, yoyo: true, repeat: Math.round(schudTijd / 150), delay: D0 - 300, ease: "Sine.easeInOut", onComplete: () => box.setAngle(0).setX(MACH.machine.x) });
      this.machLampen.forEach((l, i) => this.mt({ targets: l, alpha: { from: 0.1, to: 0.95 }, duration: 210, yoyo: true, repeat: Math.round(schudTijd / 420), delay: D0 - 300 + i * 120, onComplete: () => l.setAlpha(0) }));
      this.machKl.push(
        this.time.addEvent({
          delay: 260,
          repeat: Math.round(schudTijd / 260),
          startAt: -(D0 - 300),
          callback: () => {
            const puf = this.plaats("sqm-licht", MACH.machine.x - 14 + Math.random() * 28, MACH.machine.y - 128).setTint(0xdbe8ff).setScale(0.8 / TX).setAlpha(0.6);
            voor.add(puf);
            this.machLos.push(puf);
            this.mt({ targets: puf, y: puf.y - 70, scale: 2.2 / TX, alpha: 0, duration: 800, ease: "Sine.easeOut", onComplete: () => puf.active && puf.destroy() });
          },
        }),
      );
      /* 3. Eraf: per stukje een tik en een plop (steeds hoger, zodat je meetelt); het valt in het bakje en wipt even. */
      for (let j = 0; j < b; j++) {
        vol(D0 + j * stap, () => {
          const p = stukBak(j, b);
          const im = this.stuk(voor, hexB, { x: MACH.machine.x, y: MACH.machine.y + 108 });
          im.setScale(0.4 / TX);
          this.machDrop[j] = im;
          this.mt({ targets: im, scale: STUK_ZIT / STUK / TX, duration: 160, ease: "Back.easeOut" });
          this.mt({ targets: im, y: p.y, duration: 540, ease: "Bounce.easeOut" });
          this.mt({ targets: im, x: p.x, duration: 380, ease: "Sine.easeOut" });
          this.mt({ targets: box, scaleY: 1.035, scaleX: 0.99, duration: 70, yoyo: true, ease: "Quad.easeOut" });
          for (let q = 0; q < 5; q++) {
            const vonk = this.plaats("sqm-licht", MACH.machine.x, MACH.machine.y + 108).setTint(0xffe066).setScale(0.35 / TX);
            voor.add(vonk);
            this.machLos.push(vonk);
            const hoek = -Math.PI * (0.15 + 0.7 * (q / 4));
            this.mt({ targets: vonk, x: vonk.x + Math.cos(hoek) * 38, y: vonk.y + Math.sin(hoek) * 30 + 8, alpha: 0, duration: 330, ease: "Quad.easeOut", onComplete: () => vonk.active && vonk.destroy() });
          }
          speelLesgeluid("stukPlop", j);
        });
      }
      /* 4. De rest komt uit de machine, rolt naar rechts en verdwijnt in het vraagteken (het getal blijft verborgen). */
      if (r > 0) vol(R0 - 60, () => speelLesgeluid("restKlik"));
      for (let k = 0; k < r; k++) {
        vol(R0 + k * 130, () => {
          const y0 = 394 - (k % 2) * 52;
          const im = this.stuk(achter, hexA, { x: 500, y: y0 });
          this.machRest.push(im);
          speelLesgeluid("bandRol");
          this.mt({ targets: im, y: y0 - 8, duration: 110, yoyo: true, ease: "Quad.easeOut" });
          this.mt({ targets: im, x: MACH.rechts.x, duration: 820, ease: "Sine.easeInOut" });
          this.mt({ targets: im, y: MACH.rechts.y, delay: 420, duration: 400, ease: "Sine.easeInOut", onComplete: () => im.active && im.destroy() });
        });
      }
      vol(eind, () => this.machineEind());
    }

    maakMachine(g: Box, t: Extract<Toneel, { soort: "machine" }>) {
      this.canvasPlaatje("sqm-band", 900, 44, (c) => tekenBand(c, 900, false));
      this.canvasPlaatje("sqm-blok", 130, 110, tekenBlok);
      this.canvasPlaatje("sqm-pijlR", 70, 40, tekenPijlRechts);
      this.canvasPlaatje("sqm-licht", 40, 40, (c) => tekenLichtje(c, 40));
      this.canvasPlaatje("sqm-bak", 330, 56, (c) => tekenBak(c, 330, 56));
      this.canvasPlaatje("sqm-klep", 84, 16, (c) => tekenKlep(c, 84, 16));
      this.canvasPlaatje("sqm-machine", 240, 250, tekenMachine);
      const [hexA, hexB] = somHex(t.start, t.eraf);
      g.add(this.plaats("sqm-band", 490, MACH.band));
      /* De bultjes op de band lopen mee zolang de stukjes rollen. */
      this.canvasPlaatje("sqm-bult", 16, 16, (c) => {
        c.fillStyle = "#6b7aa6";
        c.beginPath();
        c.arc(8, 8, 8, 0, Math.PI * 2);
        c.fill();
      });
      this.machBulten = Array.from({ length: 20 }, () => {
        const im = this.plaats("sqm-bult", 0, 419);
        g.add(im);
        return im;
      });
      this.zetBulten(0);
      g.add(this.plaats("sqm-pijlR", 330, 250));
      g.add(this.plaats("sqm-pijlR", 708, MACH.rechts.y));
      /* Links: het getal en de stukjes in de kleur van het getal, apart te tellen. */
      const hoog = Math.ceil(t.start / 5);
      g.add(this.plaats(this.tekstTex(String(t.start), 64, hexA, "rgba(10,20,50,0.9)"), 182, 394 - (hoog - 1) * 52 - 56));
      const achter = this.add.container(0, 0);
      this.machAchter = achter;
      g.add(achter);
      this.machInn = Array.from({ length: t.start }, (_, i) => this.stuk(achter, hexA, stukBand(i)));
      /* De machine zelf (schudt), met lampjes die knipperen en een luikje waar de stukjes uitvallen. */
      const doos = this.add.container(MACH.machine.x, MACH.machine.y, [
        this.plaats("sqm-machine", 0, 0),
        this.plaats(this.tekstTex(`−${t.eraf}`, 70, hexB, "rgba(10,20,50,0.9)"), 0, -7),
        this.plaats("sqm-klep", 0, 108),
      ]);
      this.machLampen = [
        [-62, "#ff7b7b"],
        [-34, "#ffe066"],
        [-6, "#7ee0a0"],
      ].map(([x, k]) => {
        const l = this.plaats("sqm-licht", x as number, 71).setTint(hexGetal(k as string)).setScale(1.5 / TX).setAlpha(0).setBlendMode(Phaser.BlendModes.ADD);
        doos.add(l);
        return l;
      });
      this.machDoos = doos;
      g.add(doos);
      const voor = this.add.container(0, 0);
      this.machVoor = voor;
      g.add(voor);
      g.add(this.plaats("sqm-bak", 490, 568));
      this.rechtsBlok = this.add.container(MACH.rechts.x, MACH.rechts.y, [this.plaats("sqm-blok", 0, 0)]);
      this.rechtsLabel = this.plaats(this.tekstTex("?", 64, "#ffffff", "rgba(150,70,10,0.7)"), 0, 0);
      this.rechtsBlok.add(this.rechtsLabel);
      g.add(this.rechtsBlok);
      this.machKlaar = false;
      if (this.rustig) this.machineEind();
      else this.startMachine(t);
    }

    maakBakjes(g: Box, t: Extract<Toneel, { soort: "bakjes" }>) {
      /* Een houten plank onder elke rij, zodat de bekers erop staan en niet zweven (BOUWREGELS 14.23); geen kader. */
      this.canvasPlaatje("sqm-plank", 720, 34, (c) => {
        const blad = c.createLinearGradient(0, 0, 0, 34);
        blad.addColorStop(0, "#e0b070");
        blad.addColorStop(0.45, "#c68a4a");
        blad.addColorStop(0.5, "#9a6330");
        blad.addColorStop(1, "#734517");
        c.fillStyle = blad;
        c.beginPath();
        c.roundRect(0, 0, 720, 34, 6);
        c.fill();
        c.fillStyle = "rgba(255,236,200,0.5)";
        c.fillRect(6, 2, 708, 3);
      });
      const kolommen = Math.min(5, t.vol + t.leeg);
      const rijenN = Math.ceil((t.vol + t.leeg) / 5);
      const y0 = 380 - ((rijenN - 1) * 150) / 2;
      for (let r = 0; r < rijenN; r++) g.add(this.plaats("sqm-plank", 490, y0 + r * 150 + 66).setScale(((Math.max(3, kolommen) * 132 + 40) / 720) / TX, 1 / TX));
      bakjePlekken(t.vol + t.leeg).forEach((p, i) => {
        const vol = i < t.vol;
        const [hxV, hxL] = somHex(t.vol + t.leeg, t.leeg);
        const kl = vol ? hxV : hxL;
        if (t.ding === "beker") this.item(g, vol ? "beker-vol" : "beker-leeg", p.x, p.y, 1, kl);
        else {
          this.item(g, "bord", p.x, p.y + 10, 1, kl);
          /* Een vol bord: een koekje erop (eigen sleutel). */
          if (vol) g.add(this.plaats(this.tex("koekje"), p.x, p.y - 4));
        }
      });
      this.itemSchaal = 1;
    }

    maakGeld(g: Box, t: Extract<Toneel, { soort: "geld" }>) {
      g.add(this.plaats(this.tex("portemonnee"), GELD.beurs.x, GELD.beurs.y));
      this.item(g, t.ding, GELD.ding.x, GELD.ding.y);
      const prijsPlek = geldRij(t.prijs, GELD.prijs.x, GELD.prijs.y);
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

    /** Munt of briefje, klein (nooit ware grootte), niet bewerkt: alleen verkleind getekend. */
    geldTex(w: Geld) {
      const bron = `sqm-geld-${w}`;
      if (!this.textures.exists(bron)) return null;
      const m = GELD_MAAT[w];
      const sl = `sqm-geld-${w}-klein`;
      this.canvasPlaatje(sl, m.b, m.h, (c) => {
        const img = this.textures.get(bron).getSourceImage() as HTMLImageElement;
        const f = Math.min(m.b / img.width, m.h / img.height);
        c.drawImage(img, (m.b - img.width * f) / 2, (m.h - img.height * f) / 2, img.width * f, img.height * f);
      });
      return sl;
    }

    /* ---------- grijs worden, de bus uit, ringen ---------- */

    zetGrijs(n: number) {
      const t = this.toneel;
      if (!t || (t.soort !== "ruimte" && t.soort !== "bus")) return;
      const van = this.grijsNu;
      this.grijsNu = n;
      const totaal = this.items.length;
      const doe = (k: number, aan: boolean, direct: boolean) => {
        const idx = totaal - 1 - k;
        const im = this.items[idx];
        if (!im) return;
        if (t.soort === "ruimte") {
          /* Eerst staan ALLE dingen in de kleur van het eerste getal (BOUWREGELS 2.1); wat weggaat krijgt op dat moment
             de kleur van het tweede getal en wordt dof. Wat overblijft houdt de kleur van het eerste getal. */
          const oud = this.itemSleutel[idx];
          const [naam] = oud.split("|");
          if (aan) {
            if (t.b !== undefined) im.setTexture(this.tex(naam, somHex(t.n, t.b)[1]));
            else im.setTint(0x8a96a8);
            if (direct || this.rustig) im.setAlpha(0.35);
            else this.tweens.add({ targets: im, alpha: 0.35, duration: 220 });
          } else {
            im.clearTint().setAlpha(1);
            im.setTexture(this.texSleutel(oud));
          }
          return;
        }
        /* bus: het pakje gaat de bus uit (of komt terug bij opnieuw) */
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

    /** Bus: pakje `k` (van achteren af geteld) staat nu buiten. */
    uitstappen(k: number, direct: boolean) {
      const t = this.toneel;
      const g = this.groep;
      if (!t || t.soort !== "bus" || !g) return;
      if (!this.pijl) {
        this.canvasPlaatje("sqm-pijl", 130, 110, tekenPijl);
        this.pijl = this.plaats("sqm-pijl", PIJL.x, PIJL.y);
        g.add(this.pijl);
      }
      if (t.rondje) return this.busBuiten(k + 1, direct);
      const p = buitenPlek(k);
      const pakje = this.plaats(this.tex("pakje", t.b !== undefined ? somHex(t.in, t.b)[1] : undefined), p.x, p.y).setScale(54 / PAKJE / TX);
      g.add(pakje);
      this.buiten[k]?.destroy();
      this.buiten[k] = pakje;
      if (!direct && !this.rustig) {
        pakje.setAlpha(0).setY(p.y - 24);
        this.tweens.add({ targets: pakje, alpha: 1, y: p.y, duration: 240, ease: "Back.easeOut" });
      }
    }

    /** Bus: wat er buiten staat bij `n` bezorgd (opnieuw opbouwen; ook het rode rondje). */
    busBuiten(n: number, direct: boolean) {
      const t = this.toneel;
      const g = this.groep;
      if (!t || t.soort !== "bus" || !g) return;
      if (t.rondje) {
        this.rondje?.destroy();
        this.rondje = null;
        if (n > 0) {
          const rond = this.add.graphics();
          /* Het rondje heeft de kleur van het getal (BOUWREGELS 2.1); de tekst is donker, dat leest op elke kleur. */
          rond.fillStyle(t.b !== undefined ? hexGetal(somHex(t.in, t.b)[1]) : 0xff5a5a, 1);
          rond.fillCircle(0, 0, 56);
          this.rondje = this.add.container(RONDJE.x, RONDJE.y, [rond, this.plaats(this.tekstTex(String(n), 64, t.b !== undefined ? "#10163a" : "#ffffff", ""), 0, 0)]);
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
        this.canvasPlaatje("sqm-pijl", 130, 110, tekenPijl);
        this.pijl = this.plaats("sqm-pijl", PIJL.x, PIJL.y);
        g.add(this.pijl);
      }
    }

    /** Ringen (meetellen, aanwijzen): de enige gloed die blijft staan zolang Bliepo erover praat. */
    zetLicht(l: Licht) {
      this.lichtNu = l;
      this.ringen.forEach((r) => r.destroy());
      this.ringen = [];
      const t = this.toneel;
      if (!t || !l) return;
      const kleur = WARM;
      if (t.soort === "ruimte") {
        const totaal = this.items.length;
        const r = 44 * this.itemSchaal + 2;
        this.items.forEach((im, i) => {
          const isGrijs = i >= totaal - this.grijsNu;
          if (l === "alle" || (l === "over" && !isGrijs) || (l === "eraf" && isGrijs)) this.ringen.push(this.selectieRing(im.x, im.y, r, kleur));
        });
      } else if (t.soort === "bus") {
        /* Op de gele bus valt een gele ring weg: blauw. */
        const blauw = 0x2f6bff;
        if (l === "over" || l === "alle") this.items.forEach((im, i) => (l === "alle" || i < this.items.length - this.grijsNu) && this.ringen.push(this.selectieRing(im.x, im.y, 25, blauw)));
        if (l === "eraf") {
          if (t.rondje) this.ringen.push(this.selectieRing(RONDJE.x, RONDJE.y, 68, kleur));
          else this.buiten.forEach((b) => b && this.ringen.push(this.selectieRing(b.x, b.y, 28, kleur)));
        }
      } else if (t.soort === "bakjes") {
        this.items.forEach((im, i) => {
          if (l === "alle" || (l === "leeg" && i >= t.vol)) this.ringen.push(this.selectieRing(im.x, im.y - 10, 62, kleur));
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
          const im = this.plaats("sqm-stip", p.x, p.y);
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
      const t = this.toneel;
      if (t?.soort === "machine") {
        /* Het goede antwoord: de machine is klaar en de stukjes die overblijven komen tevoorschijn (een voor een). */
        if (n === null) {
          this.machUit.forEach((im) => im.active && im.destroy());
          this.machUit = [];
          this.machUitN = -1;
        } else if (n !== this.machUitN && this.machVoor) {
          this.machineEind();
          this.machUit.forEach((im) => im.active && im.destroy());
          this.machUit = [];
          this.machUitN = n;
          const hexA = somHex(t.start, t.eraf)[0];
          for (let k = 0; k < n; k++) {
            const p = stukUitkomst(k, n);
            const im = this.stuk(this.machVoor, hexA, p);
            this.machUit.push(im);
            if (!this.rustig) {
              im.setScale(0);
              this.tweens.add({ targets: im, scale: STUK_ZIT / STUK / TX, delay: k * 70, duration: 260, ease: "Back.easeOut" });
              this.tweens.add({ targets: im, y: p.y - 10, delay: k * 70 + 120, duration: 160, yoyo: true, ease: "Quad.easeOut" });
            }
          }
        }
      }
      this.rechtsLabel?.destroy();
      this.rechtsLabel = this.plaats(this.tekstTex(n === null ? "?" : String(n), 64, "#ffffff", "rgba(150,70,10,0.7)"), 0, 0);
      box.add(this.rechtsLabel);
      if (n !== null && !this.rustig) this.tweens.add({ targets: box, scale: 1.12, duration: 140, yoyo: true });
    }

    /* ---------- verbinden ---------- */

    zetLijnen(lijnen: (number | null)[], gekozen: { kant: "l" | "r"; i: number } | null, goed: boolean) {
      const gfx = this.lijnGfx;
      if (!gfx) return;
      gfx.clear();
      const x1 = KAART_L.x + KAART_L.b / 2 - 4;
      const x2 = KAART_R.x - 56;
      lijnen.forEach((j, i) => {
        if (j === null) return;
        gfx.lineStyle(7, goed ? GOED : 0xffffff, 1);
        gfx.lineBetween(x1, KAART_L.ys[i], x2, KAART_L.ys[j]);
        gfx.fillStyle(goed ? GOED : 0xffffff, 1);
        gfx.fillCircle(x1, KAART_L.ys[i], 9);
        gfx.fillCircle(x2, KAART_L.ys[j], 9);
      });
      this.kaartRing?.destroy();
      this.kaartRing = null;
      if (gekozen) {
        const x = gekozen.kant === "l" ? KAART_L.x : KAART_R.x;
        const r = gekozen.kant === "l" ? 140 : 66;
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

    /** Goed: een rustige lichtgolf en wat overblijft licht even op. */
    goed() {
      const t = this.toneel;
      const midden = t?.soort === "bus" ? { x: 330, y: 400 } : t?.soort === "machine" ? MACH.rechts : t?.soort === "geld" ? GELD.ding : { x: 490, y: 380 };
      this.golf(midden.x, midden.y);
      this.items.forEach((im, i) => {
        if (im.alpha < 0.5) return;
        this.flits(im, this.itemSleutel[i], 800);
        if (this.rustig) return;
        const basis = im.scaleX;
        this.tweens.add({ targets: im, scaleX: basis * 1.12, scaleY: basis * 1.12, delay: i * 20, duration: 130, yoyo: true, onComplete: () => im.setScale(basis) });
      });
    }

    fout() {
      if (this.groep) this.schud(this.groep);
    }

    /** Voor `npm run vloeiend`: dingen tevoorschijn, een paar vliegen weg, de bus, de bellen. */
    demo(ms: number) {
      const eind = performance.now() + ms;
      let k = 0;
      const tonelen: Toneel[] = [
        { soort: "ruimte", id: "demo-ruimte", ding: "raketje", n: 16 },
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
  /* De getallen van de som in volgorde: het eerste en wat overblijft in de ene kleur, het tweede in een duidelijk andere. */
  const getallen = delen.filter((d) => /^\d+$/.test(d)).map(Number);
  const [hexA, hexB] = getallen.length >= 2 ? somHex(getallen[0], getallen[1]) : [KLEURHEX[somKleuren(getallen[0] ?? 0, 0)[0]], ""];
  let nr = 0;
  return (
    <div className={`${s.som} ${plek === "boven" ? s.somBoven : plek === "midden" ? s.somMidden : s.somBord}`} aria-hidden>
      {delen.map((d, i) =>
        d === "?" ? (
          <span key={i} className={s.vak}>
            ?
          </span>
        ) : /^\d+$/.test(d) ? (
          /* Elk getal in de som heeft de kleur van zijn voorwerpen (BOUWREGELS 2.1), met een dunne donkere rand voor de leesbaarheid. */
          <span key={i} style={{ color: nr++ === 1 ? hexB : hexA, WebkitTextStroke: "2px #0b1028", paintOrder: "stroke fill" }}>
            {d}
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
