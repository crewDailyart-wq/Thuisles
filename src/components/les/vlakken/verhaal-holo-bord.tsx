"use client";

/**
 * Verhaaltjessommen als hologrammen in Bliepo's ruimte (27 oktober 2026,
 * LESSENPLAN.md § 2.6, V1–V5; BOUWEN-PHASER.md). Zelfde verloop en dezelfde
 * meldingen als het oude krijtbord (`verhaal-bord.tsx`, blijft bestaan voor
 * "Meer verhaaltjes"), naar Synthesis "Word Problems":
 *
 * - geen bord: de blauwe ruimte blijft de achtergrond;
 * - de som groot en rustig bovenaan in het midden, met een oplichtend vakje;
 * - daaronder het verhaal zin voor zin (Bliepo leest het voor; de tekst in
 *   beeld is om mee te lezen, het kind hoeft niet te kunnen lezen);
 * - daaronder de voorwerpen als hologrammen uit de Aarde-wereld, één soort
 *   per verhaal: vuurvliegjes, bloemen, lantaarntjes, paddenstoelen of
 *   lichtjes (Phaser, gloed één keer gebakken via holo/basis.ts);
 * - onderaan grote keuzeknoppen (cijfers, een plus of min, of een som) en
 *   het vraagteken "Weet ik niet".
 *
 * Schrijfwijze van een zin (zoals het oude bord):
 * - een getal ("7") kan omcirkeld en doorgestreept worden;
 * - "[weg]" hoort bij de woorden die zeggen of het erbij of eraf is;
 * - "_wat_" is het onbekende getal (kleur van het vraagteken in de som).
 *
 * Meldingen: `getal` (n, sleutel), `zin` (i), `woord` (signaal, tekst),
 * `plaatje` (i), `keuze` (waarde), `weetniet` en `klaar`.
 */

import { useEffect, useMemo, useRef, type ReactNode } from "react";
import type { Vlakbasis } from "../soort";
import type { Plekstaat, Somstuk } from "./verhaal-bord";
import { holoBasis, GOED, TX, VLAK_B } from "../holo/basis";
import { HOLO_CANVAS, useHoloMotor } from "../holo/motor";
import { KeuzeKnoppen } from "../holo/keuzes";
import { IkoonKnop } from "../ikonen";
import s from "./verhaal-holo-bord.module.css";

export type HoloSoort = "vuurvlieg" | "bloem" | "lantaarn" | "paddenstoel" | "lichtje";

export type HoloPlaatjes = {
  soort: HoloSoort;
  plekken: Plekstaat[];
  /** "plek": een lege plek is een zacht rondje (planten, erbij); anders de eigen "uit"-vorm (knopje, gedoofde lantaarn). */
  leeg?: "plek" | "eigen";
};

export type VerhaalHoloProps = {
  zinnen: string[];
  zichtbaar?: number;
  stippelVoor?: number | null;
  /** Alleen de tekst, groot in het midden (bij het uitpluizen). */
  midden?: boolean;
  omcirkeld?: string[];
  doorgestreept?: string[];
  vraagZin?: number | null;
  flitsZin?: number | null;
  signaalGroen?: boolean;
  groeneZin?: number | null;
  /** Een zin met een warme rand: "hier staat het" (hint). */
  hintZin?: number | null;
  /** Het vraagteken aan het eind van de vraagzin licht op (hint). */
  hintVraagteken?: boolean;
  onbekendKleur?: string | null;
  tik?: null | "getal" | "zin" | "woord" | "plaatje";
  plaatjes?: null | HoloPlaatjes;
  tikPlaatje?: "weg" | "erbij";
  geteld?: number[];
  tel?: null | { op: Plekstaat; tot: number };
  som?: Somstuk[] | null;
  somActief?: number | null;
  /** Keuzeknoppen onderaan: cijfers, "+"/"−" of sommen. */
  keuzes?: null | { opties: (number | string)[]; uit?: (number | string)[]; som?: boolean };
  weetNiet?: boolean;
  klaarKnop?: boolean;
  /** Ophogen = een lichtgolf (goed) of zacht schudden (niet goed). */
  golfNr?: number;
  schudNr?: number;
};

/* ---------- tekst ---------- */

type Stuk = { soort: "woord" | "getal" | "signaal" | "onbekend"; tekst: string; na: string; n?: number };

function knip(zin: string): Stuk[] {
  return zin
    .split(" ")
    .filter(Boolean)
    .map((w) => {
      let m = /^(\d+)([.,?!]?)$/.exec(w);
      if (m) return { soort: "getal", tekst: m[1], na: m[2], n: Number(m[1]) };
      m = /^\[([^\]]+)\]([.,?!]?)$/.exec(w);
      if (m) return { soort: "signaal", tekst: m[1], na: m[2] };
      m = /^_([^_]+)_([.,?!]?)$/.exec(w);
      if (m) return { soort: "onbekend", tekst: m[1], na: m[2] };
      const n = /^(.*?)([.,?!]?)$/.exec(w)!;
      return { soort: "woord", tekst: n[1], na: n[2] };
    });
}

/* ---------- indeling (punten van het vlak, 980 × 720) ---------- */

/** De som staat bovenaan; het verhaal begint daaronder. */
const TEKST_Y = 112;
const REGEL = 46;
/** Onderkant van het voorwerpenveld; daaronder de keuzeknoppen. */
const VELD_ONDER = 604;

export type Plaats = { x: number; y: number; maat: number; b: number; h: number };

/** Waar elk voorwerp staat: hoogstens 5 op een rij; boven de 10 twee rijen van 10 (5 + 5, zoals een tienstrook). */
export function indeling(n: number, boven: number): Plaats[] {
  if (n <= 0) return [];
  const breed = n > 10;
  const perRij = breed ? 10 : 5;
  const rijen = Math.ceil(n / perRij);
  const b = breed ? 84 : 128;
  const gat = breed ? 30 : 0;
  const h = Math.min(126, (VELD_ONDER - boven) / rijen);
  const maat = breed ? 76 : Math.min(104, h - 14);
  const kol = Math.min(n, perRij);
  const w = (kol - 1) * b + (kol > 5 ? gat : 0);
  const x0 = VLAK_B / 2 - w / 2;
  const y0 = (boven + VELD_ONDER) / 2 - ((rijen - 1) * h) / 2;
  return Array.from({ length: n }, (_, i) => {
    const r = Math.floor(i / perRij);
    const k = i % perRij;
    return { x: x0 + k * b + (k >= 5 ? gat : 0), y: y0 + r * h, maat, b, h };
  });
}

/** Bovenkant van het voorwerpenveld: onder het verhaal (of hoog als er geen verhaal staat). */
function veldBoven(zinnen: string[], stippel: boolean) {
  if (zinnen.length === 0) return 150;
  return TEKST_Y + zinnen.length * REGEL + (stippel ? 14 : 0) + 22;
}

/* ---------- de scène ---------- */

type Img = import("phaser").GameObjects.Image;

interface VerhaalScene {
  toon(pl: HoloPlaatjes | null, boven: number, zichtbaar: boolean): void;
  goed(): void;
  fout(): void;
}

const VLIEGT = (s: HoloSoort) => s === "vuurvlieg" || s === "lichtje";
const GLOED: Record<HoloSoort, number> = {
  vuurvlieg: 0xd8ff6a,
  bloem: 0xff9ad5,
  lantaarn: 0xffc94a,
  paddenstoel: 0x7ff0e2,
  lichtje: 0xffd36e,
};

/** Alle voorwerpen, getekend in een vak van 100 × 100. */
function tekenAlles(sc: { canvasPlaatje: (k: string, b: number, h: number, f: (c: CanvasRenderingContext2D) => void) => void }) {
  const ell = (c: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, rot = 0) => {
    c.beginPath();
    c.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
  };

  /* Vuurvliegje: twee doorzichtige vleugels, een donker kopje en een lichtgevend achterlijf. */
  sc.canvasPlaatje("vuurvlieg-aan", 100, 100, (c) => {
    c.fillStyle = "rgba(225,250,255,0.42)";
    c.strokeStyle = "rgba(255,255,255,0.75)";
    c.lineWidth = 1.6;
    ell(c, 33, 38, 17, 10, -0.55);
    c.fill();
    c.stroke();
    ell(c, 67, 38, 17, 10, 0.55);
    c.fill();
    c.stroke();
    const g = c.createRadialGradient(50, 64, 2, 50, 64, 22);
    g.addColorStop(0, "#fbffd8");
    g.addColorStop(0.45, "#e6ff7a");
    g.addColorStop(1, "#9fd83a");
    c.fillStyle = g;
    ell(c, 50, 63, 15, 21);
    c.fill();
    c.fillStyle = "#4b5a33";
    ell(c, 50, 38, 9, 10);
    c.fill();
    c.fillStyle = "#33401f";
    ell(c, 50, 26, 7, 7);
    c.fill();
    c.strokeStyle = "#33401f";
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(47, 21);
    c.quadraticCurveTo(42, 12, 36, 10);
    c.moveTo(53, 21);
    c.quadraticCurveTo(58, 12, 64, 10);
    c.stroke();
  });

  /* Bloem: vijf roze blaadjes met een geel hartje op een steeltje. */
  sc.canvasPlaatje("bloem-aan", 100, 100, (c) => {
    c.strokeStyle = "#5fd08a";
    c.lineWidth = 4;
    c.lineCap = "round";
    c.beginPath();
    c.moveTo(50, 96);
    c.lineTo(50, 52);
    c.stroke();
    c.fillStyle = "#5fd08a";
    ell(c, 62, 78, 11, 5, -0.5);
    c.fill();
    for (let k = 0; k < 5; k++) {
      const h = (k * 2 * Math.PI) / 5 - Math.PI / 2;
      const x = 50 + 16 * Math.cos(h);
      const y = 38 + 16 * Math.sin(h);
      const g = c.createRadialGradient(x, y, 2, x, y, 14);
      g.addColorStop(0, "#ffd1ec");
      g.addColorStop(1, "#ef6fb2");
      c.fillStyle = g;
      ell(c, x, y, 13, 13);
      c.fill();
    }
    c.fillStyle = "#ffe36e";
    ell(c, 50, 38, 9, 9);
    c.fill();
  });
  /* Een gesloten knopje. */
  sc.canvasPlaatje("bloem-uit", 100, 100, (c) => {
    c.strokeStyle = "rgba(95,208,138,0.75)";
    c.lineWidth = 4;
    c.lineCap = "round";
    c.beginPath();
    c.moveTo(50, 96);
    c.lineTo(50, 58);
    c.stroke();
    c.fillStyle = "rgba(95,208,138,0.75)";
    ell(c, 62, 80, 10, 4.5, -0.5);
    c.fill();
    c.fillStyle = "rgba(239,111,178,0.6)";
    c.beginPath();
    c.moveTo(50, 30);
    c.quadraticCurveTo(64, 46, 50, 60);
    c.quadraticCurveTo(36, 46, 50, 30);
    c.fill();
    c.fillStyle = "rgba(95,208,138,0.8)";
    c.beginPath();
    c.moveTo(40, 52);
    c.quadraticCurveTo(50, 64, 60, 52);
    c.quadraticCurveTo(50, 58, 40, 52);
    c.fill();
  });

  /* Lantaarntje: warm licht achter glas, met een hengsel. */
  const lantaarn = (aan: boolean) => (c: CanvasRenderingContext2D) => {
    c.strokeStyle = aan ? "#ffe3a0" : "rgba(200,210,230,0.6)";
    c.lineWidth = 3;
    c.beginPath();
    c.arc(50, 18, 8, Math.PI, 0);
    c.stroke();
    c.fillStyle = aan ? "#d99a3a" : "rgba(120,130,150,0.7)";
    c.beginPath();
    c.moveTo(34, 30);
    c.lineTo(66, 30);
    c.lineTo(60, 20);
    c.lineTo(40, 20);
    c.closePath();
    c.fill();
    if (aan) {
      const g = c.createRadialGradient(50, 56, 3, 50, 56, 26);
      g.addColorStop(0, "#fffbe0");
      g.addColorStop(0.5, "#ffd56a");
      g.addColorStop(1, "#f09a2a");
      c.fillStyle = g;
    } else c.fillStyle = "rgba(40,60,100,0.55)";
    c.beginPath();
    c.roundRect(32, 30, 36, 52, 8);
    c.fill();
    c.strokeStyle = aan ? "#c98a2e" : "rgba(200,210,230,0.55)";
    c.lineWidth = 2.5;
    c.stroke();
    c.beginPath();
    c.moveTo(50, 30);
    c.lineTo(50, 82);
    c.stroke();
    c.fillStyle = aan ? "#d99a3a" : "rgba(120,130,150,0.7)";
    c.beginPath();
    c.roundRect(30, 82, 40, 8, 3);
    c.fill();
  };
  sc.canvasPlaatje("lantaarn-aan", 100, 100, lantaarn(true));
  sc.canvasPlaatje("lantaarn-uit", 100, 100, lantaarn(false));

  /* Paddenstoel: een gloeiende hoed met stippen op een witte steel. */
  const padde = (aan: boolean) => (c: CanvasRenderingContext2D) => {
    c.fillStyle = aan ? "#eafcff" : "rgba(170,185,205,0.55)";
    c.beginPath();
    c.roundRect(41, 52, 18, 40, 7);
    c.fill();
    if (aan) {
      const g = c.createRadialGradient(46, 34, 3, 50, 46, 38);
      g.addColorStop(0, "#d8fff9");
      g.addColorStop(0.5, "#7ff0e2");
      g.addColorStop(1, "#22a99c");
      c.fillStyle = g;
    } else c.fillStyle = "rgba(40,90,110,0.6)";
    c.beginPath();
    c.moveTo(14, 56);
    c.quadraticCurveTo(14, 16, 50, 16);
    c.quadraticCurveTo(86, 16, 86, 56);
    c.closePath();
    c.fill();
    c.fillStyle = aan ? "rgba(255,255,255,0.9)" : "rgba(200,215,230,0.35)";
    for (const [x, y, r] of [
      [34, 38, 5],
      [52, 28, 4.5],
      [68, 42, 5],
      [48, 48, 3.5],
    ]) {
      ell(c, x, y, r, r);
      c.fill();
    }
  };
  sc.canvasPlaatje("paddenstoel-aan", 100, 100, padde(true));
  sc.canvasPlaatje("paddenstoel-uit", 100, 100, padde(false));

  /* Lichtje: een warm lichtbolletje met vier straaltjes. */
  sc.canvasPlaatje("lichtje-aan", 100, 100, (c) => {
    const g = c.createRadialGradient(46, 46, 2, 50, 50, 26);
    g.addColorStop(0, "#fffdf0");
    g.addColorStop(0.5, "#ffe08a");
    g.addColorStop(1, "#f2a640");
    c.fillStyle = g;
    ell(c, 50, 50, 24, 24);
    c.fill();
    c.strokeStyle = "rgba(255,240,200,0.85)";
    c.lineWidth = 3;
    c.lineCap = "round";
    for (let k = 0; k < 4; k++) {
      const h = (k * Math.PI) / 2 + Math.PI / 4;
      c.beginPath();
      c.moveTo(50 + 30 * Math.cos(h), 50 + 30 * Math.sin(h));
      c.lineTo(50 + 40 * Math.cos(h), 50 + 40 * Math.sin(h));
      c.stroke();
    }
  });

  /* Een lege plek: een zacht stippelrondje (waar iets bij kan komen, of waar iets was). */
  sc.canvasPlaatje("plek", 100, 100, (c) => {
    c.fillStyle = "rgba(255,226,150,0.07)";
    ell(c, 50, 54, 28, 28);
    c.fill();
    c.strokeStyle = "rgba(255,232,170,0.6)";
    c.lineWidth = 3;
    c.setLineDash([6, 6]);
    ell(c, 50, 54, 28, 28);
    c.stroke();
  });
}

function maakVerhaalScene(Phaser: typeof import("phaser"), rustig: boolean) {
  const Basis = holoBasis(Phaser, rustig);
  class Verhaal extends Basis implements VerhaalScene {
    groep: import("phaser").GameObjects.Container | null = null;
    items: Img[] = [];
    staat: Plekstaat[] = [];
    sleutel = "";
    soort: HoloSoort = "vuurvlieg";
    leeg: "plek" | "eigen" = "eigen";
    plaatsen: Plaats[] = [];

    constructor() {
      super("verhaal");
    }

    maak() {
      tekenAlles(this);
      for (const so of Object.keys(GLOED) as HoloSoort[]) {
        this.bak(`${so}-aan`, `${so}-aan-g`, GLOED[so]);
        if (this.textures.exists(`${so}-uit`)) this.bak(`${so}-uit`, `${so}-uit-g`, GLOED[so], 0);
      }
      this.bak("plek", "plek-g", 0xffe3a0);
    }

    sl(staat: Plekstaat) {
      if (staat === "aan") return `${this.soort}-aan-g`;
      if (this.leeg === "plek" || VLIEGT(this.soort)) return "plek-g";
      return `${this.soort}-uit-g`;
    }

    schaal(p: Plaats) {
      return p.maat / 100 / TX;
    }

    toon(pl: HoloPlaatjes | null, boven: number, zichtbaar: boolean) {
      const sleutel = pl ? `${pl.soort}|${pl.plekken.length}|${boven}|${pl.leeg ?? "eigen"}` : "";
      if (sleutel !== this.sleutel) {
        this.items.forEach((x) => this.tweens.killTweensOf(x));
        this.groep?.destroy();
        this.groep = null;
        this.items = [];
        this.staat = [];
        this.sleutel = sleutel;
        if (!pl) return;
        this.soort = pl.soort;
        this.leeg = pl.leeg ?? "eigen";
        this.plaatsen = indeling(pl.plekken.length, boven);
        const midY = this.plaatsen.reduce((a, p) => a + p.y, 0) / Math.max(1, this.plaatsen.length);
        this.groep = this.add.container(VLAK_B / 2, midY);
        pl.plekken.forEach((st, i) => {
          const p = this.plaatsen[i];
          const img = this.add.image(p.x - VLAK_B / 2, p.y - midY, this.sl(st)).setScale(this.schaal(p));
          this.groep!.add(img);
          this.items.push(img);
          if (VLIEGT(this.soort) && !this.rustig) this.zweef(img, i);
        });
        this.staat = [...pl.plekken];
        this.groep.setVisible(zichtbaar);
        /* Eén brede straal voor alles tegelijk. */
        if (zichtbaar) this.tover(this.groep);
        return;
      }
      if (!pl || !this.groep) return;
      const wasZichtbaar = this.groep.visible;
      this.groep.setVisible(zichtbaar);
      if (zichtbaar && !wasZichtbaar) {
        this.groep.setScale(1).setAlpha(1);
        this.tover(this.groep);
      }
      pl.plekken.forEach((st, i) => {
        if (this.staat[i] !== st) this.wissel(i, st);
      });
      this.staat = [...pl.plekken];
    }

    /** Vuurvliegjes en lichtjes zweven heel zacht op en neer. */
    zweef(img: Img, i: number) {
      this.tweens.add({ targets: img, y: img.y - 5, duration: 1300 + (i % 5) * 140, yoyo: true, repeat: -1, ease: "Sine.easeInOut", delay: (i % 7) * 90 });
    }

    wissel(i: number, st: Plekstaat) {
      const img = this.items[i];
      if (!img || !this.groep) return;
      const p = this.plaatsen[i];
      const k = this.schaal(p);
      if (this.rustig) {
        img.setTexture(this.sl(st)).setScale(k).setAlpha(1);
        return;
      }
      if (VLIEGT(this.soort)) {
        if (st === "uit") {
          this.tweens.killTweensOf(img);
          img.setY(p.y - (this.groep.y as number));
          /* Wegvliegen: een kopie vliegt omhoog en vervaagt; op de plek blijft een zacht rondje. */
          const weg = this.add.image(img.x, img.y, `${this.soort}-aan-g`).setScale(k);
          this.groep.add(weg);
          const kant = i % 2 === 0 ? -1 : 1;
          this.tweens.add({ targets: weg, x: img.x + kant * 60, y: img.y - 190, alpha: 0, scale: k * 0.7, duration: 750, ease: "Cubic.easeIn", onComplete: () => weg.destroy() });
          img.setTexture("plek-g").setAlpha(0);
          this.tweens.add({ targets: img, alpha: 1, duration: 300, delay: 250 });
        } else {
          /* Erbij: het vliegt van boven naar zijn plek. */
          this.tweens.killTweensOf(img);
          const y = p.y - (this.groep.y as number);
          img.setTexture(`${this.soort}-aan-g`).setPosition(img.x, y - 150).setAlpha(0);
          this.tweens.add({ targets: img, y, alpha: 1, duration: 520, ease: "Cubic.easeOut", onComplete: () => {
              if (img.active) this.zweef(img, i);
            } });
        }
        return;
      }
      if (st === "aan") {
        /* Opengaan of aangaan: kort kleiner, dan met een veertje groot. */
        img.setTexture(this.sl(st)).setScale(k * 0.55).setAlpha(0.4);
        this.tweens.add({ targets: img, scale: k, alpha: 1, duration: 360, ease: "Back.easeOut" });
      } else {
        this.tweens.add({
          targets: img,
          alpha: 0.35,
          duration: 160,
          onComplete: () => {
            if (!img.active) return;
            img.setTexture(this.sl(st));
            this.tweens.add({ targets: img, alpha: 1, duration: 220 });
          },
        });
      }
    }

    goed() {
      if (!this.groep?.visible) return;
      this.golf(VLAK_B / 2, this.groep.y as number, GOED);
    }

    fout() {
      if (this.groep?.visible) this.schud(this.groep);
    }

    demo(ms: number) {
      const eind = performance.now() + ms;
      let n = 0;
      const stap = () => {
        if (performance.now() > eind) return;
        const soorten: HoloSoort[] = ["vuurvlieg", "lantaarn", "bloem", "lichtje", "paddenstoel"];
        const so = soorten[n % soorten.length];
        const aantal = n % 2 === 0 ? 10 : 17;
        this.sleutel = "";
        this.toon({ soort: so, plekken: Array(aantal).fill("aan") }, 300, true);
        this.time.delayedCall(450, () => this.toon({ soort: so, plekken: Array.from({ length: aantal }, (_, i) => (i >= aantal - 3 ? "uit" : "aan")) }, 300, true));
        this.time.delayedCall(800, () => this.goed());
        n++;
        this.time.delayedCall(1100, stap);
      };
      stap();
    }
  }
  return Verhaal as unknown as new () => import("phaser").Scene;
}

/* ---------- het vlak ---------- */

export function VerhaalHolo(p: VerhaalHoloProps & Vlakbasis) {
  const {
    zinnen,
    zichtbaar = zinnen.length,
    stippelVoor = null,
    midden = false,
    omcirkeld = [],
    doorgestreept = [],
    vraagZin = null,
    flitsZin = null,
    signaalGroen = false,
    groeneZin = null,
    hintZin = null,
    hintVraagteken = false,
    onbekendKleur = null,
    tik = null,
    plaatjes = null,
    tikPlaatje = "weg",
    geteld = [],
    tel = null,
    som = null,
    somActief = null,
    keuzes = null,
    weetNiet = false,
    klaarKnop = false,
    golfNr = 0,
    schudNr = 0,
    meld,
    schaal,
  } = p;

  const { plek, scene } = useHoloMotor<VerhaalScene>(schaal, maakVerhaalScene);
  const boven = veldBoven(zinnen, stippelVoor !== null);
  const plaatsen = useMemo(() => indeling(plaatjes?.plekken.length ?? 0, boven), [plaatjes?.plekken.length, boven]);

  useEffect(() => {
    scene?.toon(plaatjes, boven, !midden);
  }, [scene, plaatjes, boven, midden]);

  const golf = useRef(golfNr);
  useEffect(() => {
    if (golfNr !== golf.current) scene?.goed();
    golf.current = golfNr;
  }, [scene, golfNr]);
  const schud = useRef(schudNr);
  useEffect(() => {
    if (schudNr !== schud.current) scene?.fout();
    schud.current = schudNr;
  }, [scene, schudNr]);

  /* ---------- het verhaal ---------- */
  const regels: ReactNode[] = [];
  zinnen.slice(0, zichtbaar).forEach((zin, i) => {
    if (stippelVoor === i) regels.push(<div key={`stip-${i}`} className={s.stippel} />);
    const kleur = flitsZin === i || vraagZin === i ? s.roze : groeneZin === i ? s.groen : "";
    const delen = knip(zin);
    const stukken = delen.map((st, j) => {
      const sleutel = `${i}-${j}`;
      const spatie = j < delen.length - 1 ? " " : "";
      const laatste = j === delen.length - 1;
      const na =
        laatste && st.na === "?" && hintVraagteken ? (
          <span className={s.vraagHint}>?</span>
        ) : (
          st.na
        );
      if (st.soort === "getal") {
        const rond = omcirkeld.includes(sleutel);
        const streep = doorgestreept.includes(sleutel);
        const inhoud = (
          <>
            {st.tekst}
            {(rond || streep) && (
              <svg className={s.cirkel} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
                {rond && <ellipse cx="50" cy="52" rx="46" ry="43" fill="none" stroke="#ffd36e" strokeWidth="4" vectorEffect="non-scaling-stroke" transform="rotate(-4 50 50)" />}
                {streep && <line x1="14" y1="20" x2="86" y2="84" stroke="#ffd36e" strokeWidth="4" vectorEffect="non-scaling-stroke" strokeLinecap="round" />}
              </svg>
            )}
          </>
        );
        return (
          <span key={j}>
            {tik === "getal" ? (
              <button type="button" className={`${s.getal} ${s.tikbaar}`} data-getal={st.n} onClick={() => meld({ soort: "getal", n: st.n, sleutel })}>
                {inhoud}
              </button>
            ) : (
              <span className={s.getal}>{inhoud}</span>
            )}
            {na}
            {spatie}
          </span>
        );
      }
      const woordKleur = st.soort === "signaal" && signaalGroen ? s.signaal : "";
      const stijl = st.soort === "onbekend" && onbekendKleur ? { color: onbekendKleur } : undefined;
      if (tik === "woord") {
        return (
          <span key={j}>
            <button
              type="button"
              className={`${s.woord} ${s.tikbaar} ${woordKleur}`}
              style={stijl}
              data-signaal={st.soort === "signaal" ? "ja" : "nee"}
              onClick={() => meld({ soort: "woord", signaal: st.soort === "signaal", tekst: st.tekst })}
            >
              {st.tekst}
            </button>
            {na}
            {spatie}
          </span>
        );
      }
      return (
        <span key={j} className={woordKleur} style={stijl}>
          {st.tekst}
          {na}
          {spatie}
        </span>
      );
    });
    const hint = hintZin === i ? s.hint : "";
    regels.push(
      tik === "zin" ? (
        <button key={i} type="button" className={`${s.zin} ${s.zinTik} ${kleur} ${hint}`} data-zin={i} onClick={() => meld({ soort: "zin", i })}>
          {stukken}
        </button>
      ) : (
        <div key={i} className={`${s.zin} ${kleur} ${hint}`}>
          {stukken}
        </div>
      ),
    );
  });

  /* ---------- nummers bij het tellen ---------- */
  const telNummer = new Map<number, number>();
  if (tel && plaatjes) {
    let n = 0;
    plaatjes.plekken.forEach((st, i) => {
      if (st === tel.op && n < tel.tot) telNummer.set(i, ++n);
    });
  }

  return (
    <div className={s.vlak}>
      <div ref={plek} style={HOLO_CANVAS} aria-hidden />

      {som && !midden && (
        <div className={s.som} aria-label="De som">
          {som.map((d, i) => {
            const actief = somActief === i;
            if (d.t === "leeg") return <span key={`l${i}`} className={`${s.vak} ${d.smal ? s.smal : ""} ${actief ? s.actief : ""}`} />;
            if (d.t === "vraag")
              return (
                <span key={`v${i}`} className={`${s.vak} ${actief ? s.actief : ""}`} style={{ color: d.kleur ?? "#ffffff" }}>
                  ?
                </span>
              );
            return (
              <span key={`${d.t}${i}-${d.t === "getal" ? d.n : d.s}`} className={d.t === "teken" ? s.teken : s.somgetal}>
                {d.t === "getal" ? d.n : d.s}
              </span>
            );
          })}
        </div>
      )}

      {regels.length > 0 && <div className={`${s.verhaal} ${midden ? s.midden : ""}`}>{regels}</div>}

      {/* Tikken op de voorwerpen: onzichtbare knoppen precies over de hologrammen. */}
      {plaatjes && !midden && (
        <div className={s.plekken}>
          {plaatjes.plekken.map((st, i) => {
            const pl = plaatsen[i];
            if (!pl) return null;
            const tikbaar = tik === "plaatje" && ((tikPlaatje === "weg" && st === "aan") || (tikPlaatje === "erbij" && st === "uit"));
            const nr = geteld.includes(i) ? geteld.indexOf(i) + 1 : telNummer.get(i);
            const stijl = { left: pl.x - pl.b / 2, top: pl.y - pl.h / 2, width: pl.b, height: pl.h };
            return tikbaar ? (
              <button
                key={i}
                type="button"
                className={`${s.plek} ${s.plekTik}`}
                style={stijl}
                data-plek={i}
                aria-label={tikPlaatje === "weg" ? "Weghalen" : "Erbij doen"}
                onClick={() => meld({ soort: "plaatje", i })}
              >
                {nr !== undefined && <span className={s.nummer}>{nr}</span>}
              </button>
            ) : nr !== undefined ? (
              <div key={i} className={s.plek} style={stijl}>
                <span className={s.nummer}>{nr}</span>
              </div>
            ) : null;
          })}
        </div>
      )}

      {keuzes && (
        <KeuzeKnoppen
          className={`${s.keuzes} ${keuzes.som ? s.somKeuzes : ""}`}
          opties={keuzes.opties}
          uit={keuzes.uit ?? []}
          kies={(o) => meld({ soort: "keuze", waarde: o })}
        />
      )}

      {klaarKnop && (
        <div className={s.klaar}>
          <IkoonKnop ikoon="vink" label="Klaar" knop="klaar" kleur="blauw" className={s.grootIkoon} onClick={() => meld({ soort: "klaar" })} />
        </div>
      )}

      {weetNiet && (
        <div className={s.weetniet}>
          <IkoonKnop ikoon="vraag" label="Weet ik niet" knop="weetniet" onClick={() => meld({ soort: "weetniet" })} />
        </div>
      )}
    </div>
  );
}
