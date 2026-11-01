"use client";

/**
 * Het speelvlak van de lessen "Vormen en figuren" naar Squla (31 oktober
 * 2026): patronen, opruimen, links/rechts/boven/onder en de puzzels. In
 * Phaser (HARDE REGEL 7), in de stijl van de andere Squla-lessen: geen
 * kaders, de dingen staan los in de ruimte, gloed alleen op het moment dat
 * het iets betekent (aanwijzen = geel, goed = groen).
 *
 * Wat het draaiboek zet:
 * - `beeld`: losse delen (kralen, vormen, voorwerpen, een veld, een huisje,
 *   blokken, een pijl) en tikbare plekken (`tik`). Een deel met `groep`
 *   licht op als de groep (de keuze) oplicht.
 * - `licht`, `goedIds`, `uit`: welke delen of groepen oplichten (geel),
 *   groen zijn, of dof.
 * - `ketting`: losse kralen om naar lege plekken te slepen (of te tikken:
 *   dan gaan ze naar de eerste lege plek). Meldt `{ soort: "ketting", ids }`
 *   als alle plekken vol zijn.
 * - `puzzel`: een legpuzzel. Eerst even het hele plaatje, dan vallen de
 *   stukjes uit elkaar. Een stukje klikt alleen vast op zijn eigen plek; op
 *   een verkeerde plek blijft het los liggen (meldt `puzzelMis`). Slepen, of
 *   tikken op een stukje en dan op een plek. Meldt `puzzelKlaar`.
 *
 * Voor het toetsenbord en de automatische test ligt over elk tikbaar ding een
 * onzichtbare knop (`data-ding`) die precies hetzelfde doet; de vinger en de
 * muis gaan erdoorheen naar Phaser.
 */

import { useEffect, useRef } from "react";
import type { Vlakbasis, Vlakgebeurtenis } from "../soort";
import { GOED, TX, VLAK_B, VLAK_H, WARM, holoBasis, type PhaserModule } from "../holo/basis";
import { HOLO_CANVAS, useHoloMotor } from "../holo/motor";
import { tekenVoorwerp, voorwerpBeeld } from "../voorwerpen";
import { speelLesgeluid } from "@/lib/lesgeluiden";
import { blokkenMaat, tekenBlokken, tekenHuis, tekenKraal, tekenPijl, tekenPuzzel, tekenVeld, tekenVorm, VORMSTIJL, type Kleur, type PuzzelPlaatje, type Veldsoort, type VormNaam, type Zicht } from "./squla-vormen-tekenen";
import s from "./squla-vormen.module.css";

export type Deel =
  | { s: "kraal"; id: string; groep?: string; x: number; y: number; r: number; kleur: Kleur | null }
  | { s: "vorm"; id: string; groep?: string; x: number; y: number; maat: number; vorm: VormNaam; kleur: Kleur | null; draai?: number }
  /** `rek`: het plaatje vult het vak helemaal (uitgerekt), voor een lange bak. */
  | { s: "vw"; id: string; groep?: string; naam: string; x: number; y: number; maat: number; hoog?: number; rek?: boolean }
  | { s: "touw"; id: string; punten: number[] }
  | { s: "pijl"; id: string; x: number; y: number; lang?: number; omhoog?: boolean }
  | { s: "veld"; id: string; soort: Veldsoort; x: number; y: number; b: number; h: number }
  | { s: "huis"; id: string; groep?: string; zicht: Zicht; x: number; y: number; maat: number }
  | { s: "blokken"; id: string; groep?: string; kolommen: Kleur[][]; x: number; y: number; z: number }
  | { s: "tik"; id: string; x: number; y: number; b: number; h: number; aria: string };

export type Beeld = { id: string; delen: Deel[] };

export type Puzzel = { id: string; plaatje: PuzzelPlaatje; n: number };

export type Ketting = {
  /** Nieuw id (ook bij "nog een keer") = alles terug op zijn plek. */
  id: string;
  plekken: { x: number; y: number }[];
  losse: { id: string; kleur: Kleur; x: number; y: number }[];
  r: number;
  /** Voor de automatische test: de goede volgorde (ids). */
  doel: string[];
};

export type VormenProps = {
  beeld: Beeld | null;
  licht?: string[];
  goedIds?: string[];
  uit?: string[];
  actief?: boolean;
  goed?: number;
  fout?: number;
  ketting?: Ketting | null;
  puzzel?: Puzzel | null;
  /** Ophogen = Bliepo laat zien waar een stukje hoort. */
  hint?: number;
};

type Staat = { licht: string[]; goedIds: string[]; uit: string[]; actief: boolean };

/* ---------- maten ---------- */

/** Hoe groot het plaatje van een deel is (b × h, in punten). */
function maatVan(d: Deel): { b: number; h: number } {
  switch (d.s) {
    case "kraal":
      return { b: d.r * 2, h: d.r * 2 };
    case "vorm":
    case "vw":
    case "huis":
      return { b: d.maat, h: d.s === "vw" ? (d.hoog ?? d.maat) : d.maat };
    case "pijl":
      return { b: 50, h: d.lang ?? 70 };
    case "veld":
      return { b: d.b, h: d.h };
    case "blokken":
      return blokkenMaat(d.kolommen, d.z);
    default:
      return { b: 0, h: 0 };
  }
}

/** De sleutel van het plaatje: alles wat het uiterlijk bepaalt (niet het id of de plek). */
function sleutelVan(d: Deel): string {
  const { id, x, y, groep, ...rest } = d as Deel & { x: number; y: number; groep?: string };
  void id;
  void x;
  void y;
  void groep;
  return `sv|${VORMSTIJL.glans ? "glans|" : ""}${JSON.stringify(rest)}`;
}

function teken(c: CanvasRenderingContext2D, d: Deel) {
  const { b, h } = maatVan(d);
  switch (d.s) {
    case "kraal":
      return tekenKraal(c, d.r, d.r, d.r, d.kleur);
    case "vorm":
      return tekenVorm(c, d.vorm, d.maat, d.kleur, d.draai ?? 0);
    case "vw":
      if (d.rek) return void c.drawImage(voorwerpBeeld(d.naam), 0, 0, b, h);
      return tekenVoorwerp(c, d.naam, 0, 0, b, h);
    case "pijl":
      return tekenPijl(c, b, h);
    case "veld":
      return tekenVeld(c, d.soort, b, h);
    case "huis":
      return tekenHuis(c, d.zicht, d.maat);
    case "blokken":
      return tekenBlokken(c, d.kolommen, d.z);
  }
}

/* ---------- de puzzel: waar alles ligt ---------- */

const BORD = { x: 480, y: 360, S: 390 };

function bordPlek(n: number, i: number) {
  const w = BORD.S / n;
  return { x: BORD.x - BORD.S / 2 + (i % n) * w + w / 2, y: BORD.y - BORD.S / 2 + Math.floor(i / n) * w + w / 2, w };
}

/** Een vaste "toevalsreeks" per puzzel: elke keer dezelfde plekken. */
function zaad(tekst: string) {
  let h = 2166136261;
  for (const ch of tekst) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Waar de losse stukjes liggen: links en rechts van het bord, door elkaar.
 * Niet rechtsonder in de hoek: daar staat op de laptop de microfoonknop.
 */
const LOS: Record<number, [number, number][]> = {
  2: [[140, 250], [140, 478], [828, 250], [828, 478]],
  3: [[78, 200], [200, 210], [78, 360], [200, 370], [78, 520], [200, 530], [762, 200], [884, 210], [762, 360], [884, 370], [762, 520]],
  4: [[64, 172], [172, 182], [64, 288], [172, 298], [64, 404], [172, 414], [64, 520], [172, 530], [752, 172], [862, 182], [752, 288], [862, 298], [752, 404], [862, 414], [752, 520], [862, 530]],
};

function losPlekken(p: Puzzel): { x: number; y: number; hoek: number }[] {
  const r = zaad(p.id);
  const plekken = LOS[p.n].map(([x, y]) => ({ x, y }));
  for (let i = plekken.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [plekken[i], plekken[j]] = [plekken[j], plekken[i]];
  }
  return plekken.slice(0, p.n * p.n).map((q) => ({ ...q, hoek: (r() - 0.5) * 0.16 }));
}

/* ---------- de scène ---------- */

type Ptr = import("phaser").Input.Pointer;
type Img = import("phaser").GameObjects.Image;
type Box = import("phaser").GameObjects.Container;
type Gfx = import("phaser").GameObjects.Graphics;

interface VormenScene {
  verbind(meld: (g: Vlakgebeurtenis) => void): void;
  zetBeeld(b: Beeld | null): void;
  zetStaat(st: Staat): void;
  goed(): void;
  fout(): void;
  zetKetting(k: Ketting | null): void;
  tikKraal(id: string): void;
  zetPuzzel(p: Puzzel | null): void;
  tikStuk(i: number): void;
  tikPlek(i: number): void;
  hint(): void;
}

type Stuk = { img: Img; i: number; vast: boolean; thuis: { x: number; y: number }; sl: string };
type Kraal = { img: Img; id: string; kleur: Kleur; thuis: { x: number; y: number }; plek: number | null; sl: string };

function maakScene(Phaser: PhaserModule, rustig: boolean) {
  const Basis = holoBasis(Phaser, rustig);

  class Vormen extends Basis implements VormenScene {
    melder: (g: Vlakgebeurtenis) => void = () => {};
    hoofd: Box | null = null;
    sleutel = "";
    beeld: Beeld | null = null;
    imgs: { im: Img; id: string; groep: string; sl: string }[] = [];
    staat: Staat = { licht: [], goedIds: [], uit: [], actief: false };
    flitsTot = 0;
    /* ketting */
    ketting: Ketting | null = null;
    kralen: Kraal[] = [];
    plekGfx: Gfx | null = null;
    kettingKlaar = false;
    /* puzzel */
    puzzel: Puzzel | null = null;
    stukken: Stuk[] = [];
    bordGfx: Gfx | null = null;
    heel: Img | null = null;
    pzBezig = false;
    pzKlaar = false;
    gekozen: number | null = null;
    keuzeRing: Gfx | null = null;
    /* slepen */
    druk: { soort: "stuk" | "kraal" | "tik"; nr: number; id: string; x0: number; y0: number; dx: number; dy: number; sleept: boolean } | null = null;
    diepte = 10;

    constructor() {
      super("squla-vormen");
    }

    verbind(meld: (g: Vlakgebeurtenis) => void) {
      this.melder = meld;
    }

    maak() {
      this.input.on("pointerdown", (p: Ptr) => this.neer(p));
      this.input.on("pointermove", (p: Ptr) => this.beweeg(p));
      this.input.on("pointerup", (p: Ptr) => this.los(p));
      this.input.on("pointerupoutside", (p: Ptr) => this.los(p));
    }

    /* ---------- plaatjes ---------- */

    tex(d: Deel) {
      const sl = sleutelVan(d);
      const { b, h } = maatVan(d);
      this.canvasPlaatje(sl, Math.ceil(b), Math.ceil(h), (c) => teken(c, d));
      return sl;
    }

    texG(basis: string, kleur: number) {
      const naam = `${basis}|g${kleur.toString(16)}`;
      this.bak(basis, naam, kleur);
      return naam;
    }

    /* ---------- het beeld ---------- */

    zetBeeld(b: Beeld | null) {
      this.beeld = b;
      const sleutel = b ? b.id : "";
      if (sleutel === this.sleutel) return this.tekenStaat();
      this.sleutel = sleutel;
      if (this.hoofd) this.verdwijn(this.hoofd);
      this.hoofd = null;
      this.imgs = [];
      if (b) this.bouw(b);
      this.tekenStaat();
    }

    bouw(b: Beeld) {
      const mx = VLAK_B / 2;
      const my = VLAK_H / 2;
      const box = this.add.container(mx, my);
      this.hoofd = box;
      for (const d of b.delen) {
        if (d.s === "tik") continue;
        if (d.s === "touw") {
          const g = this.add.graphics();
          g.lineStyle(4, 0xe9eef7, 0.9);
          g.beginPath();
          for (let i = 0; i < d.punten.length; i += 2) {
            if (i) g.lineTo(d.punten[i] - mx, d.punten[i + 1] - my);
            else g.moveTo(d.punten[i] - mx, d.punten[i + 1] - my);
          }
          g.strokePath();
          box.add(g);
          continue;
        }
        const sl = this.tex(d);
        const im = this.plaats(sl, d.x - mx, d.y - my);
        if (d.s === "pijl" && d.omhoog) im.setFlipY(true);
        box.add(im);
        this.imgs.push({ im, id: d.id, groep: "groep" in d && d.groep ? d.groep : d.id, sl });
      }
      this.tover(box);
      /* De gloed-plaatjes van alles wat kan oplichten alvast bakken, één per keer. */
      const sleutels = [...new Set(this.imgs.filter((x) => !x.sl.includes('"s":"veld"')).map((x) => x.sl))];
      sleutels.forEach((sl, i) =>
        this.time.delayedCall(1500 + i * 120, () => {
          if (!this.textures.exists(sl)) return;
          this.texG(sl, WARM);
          this.texG(sl, GOED);
        }),
      );
    }

    zetStaat(st: Staat) {
      this.staat = st;
      this.tekenStaat();
    }

    tekenStaat() {
      const st = this.staat;
      const flits = performance.now() < this.flitsTot;
      const in_ = (lijst: string[], id: string, groep: string) => lijst.includes(id) || lijst.includes(groep);
      for (const { im, id, groep, sl } of this.imgs) {
        if (!im.active) continue;
        const grijs = in_(st.uit, id, groep);
        im.setAlpha(grijs ? 0.3 : 1);
        const groen = in_(st.goedIds, id, groep) || (flits && in_(st.goedIds, id, groep));
        const k = grijs ? null : groen ? GOED : in_(st.licht, id, groep) ? WARM : null;
        const doel = k === null ? sl : this.texG(sl, k);
        if (im.texture.key !== doel) im.setTexture(doel);
      }
    }

    goed() {
      this.golf(VLAK_B / 2, VLAK_H / 2);
      this.flitsTot = performance.now() + 900;
      this.tekenStaat();
    }

    fout() {
      if (this.hoofd) this.schud(this.hoofd);
    }

    /* ---------- de ketting ---------- */

    zetKetting(k: Ketting | null) {
      if (k && this.ketting && k.id === this.ketting.id) return;
      this.kralen.forEach((x) => this.verdwijn(x.img));
      this.kralen = [];
      this.plekGfx?.destroy();
      this.plekGfx = null;
      this.ketting = k;
      this.kettingKlaar = false;
      if (!k) return;
      const g = this.add.graphics();
      this.plekGfx = g;
      this.tekenPlekken();
      for (const l of k.losse) {
        const d: Deel = { s: "kraal", id: l.id, x: 0, y: 0, r: k.r, kleur: l.kleur };
        const sl = this.tex(d);
        const img = this.plaats(sl, l.x, l.y).setDepth(5);
        this.tover(img);
        this.kralen.push({ img, id: l.id, kleur: l.kleur, thuis: { x: l.x, y: l.y }, plek: null, sl });
        this.time.delayedCall(400, () => this.texG(sl, WARM));
      }
      this.zetKettingTest();
    }

    tekenPlekken() {
      const k = this.ketting;
      const g = this.plekGfx;
      if (!k || !g) return;
      g.clear();
      k.plekken.forEach((p, i) => {
        if (this.kralen.some((x) => x.plek === i)) return;
        g.lineStyle(4, 0xdcecff, 0.85);
        const stukjes = 14;
        for (let s = 0; s < stukjes; s += 2) {
          g.beginPath();
          g.arc(p.x, p.y, k.r - 3, (s * Math.PI * 2) / stukjes, ((s + 1) * Math.PI * 2) / stukjes);
          g.strokePath();
        }
      });
    }

    zetKettingTest() {
      const k = this.ketting;
      if (!k) return;
      const gelegd = k.plekken.map((_, i) => this.kralen.find((x) => x.plek === i)?.id ?? null);
      let n = 0;
      while (n < gelegd.length && gelegd[n] === k.doel[n]) n++;
      const volgende = n < k.doel.length && gelegd[n] === null && gelegd.slice(n).every((x) => x === null) ? `k-${k.doel[n]}` : null;
      window.__phaser = { ...window.__phaser, antwoord: volgende };
    }

    legKraal(kr: Kraal, plek: number | null) {
      kr.plek = plek;
      const k = this.ketting!;
      const doel = plek === null ? kr.thuis : k.plekken[plek];
      kr.img.setDepth(++this.diepte);
      this.tweens.add({ targets: kr.img, x: doel.x, y: doel.y, duration: this.rustig ? 1 : 180, ease: "Cubic.easeOut" });
      this.tekenPlekken();
      this.zetKettingTest();
      speelLesgeluid("tik");
      if (k.plekken.every((_, i) => this.kralen.some((x) => x.plek === i)) && !this.kettingKlaar) {
        this.kettingKlaar = true;
        const ids = k.plekken.map((_, i) => this.kralen.find((x) => x.plek === i)!.id);
        this.time.delayedCall(350, () => this.melder({ soort: "ketting", ids }));
      }
    }

    tikKraal(id: string) {
      if (!this.ketting || this.kettingKlaar || !this.staat.actief) return;
      const kr = this.kralen.find((x) => x.id === id);
      if (!kr) return;
      if (kr.plek !== null) return this.legKraal(kr, null);
      const vrij = this.ketting.plekken.findIndex((_, i) => !this.kralen.some((x) => x.plek === i));
      if (vrij >= 0) this.legKraal(kr, vrij);
    }

    /* ---------- de puzzel ---------- */

    zetPuzzel(p: Puzzel | null) {
      if (p && this.puzzel && p.id === this.puzzel.id) return;
      this.stukken.forEach((x) => this.verdwijn(x.img));
      this.stukken = [];
      this.bordGfx?.destroy();
      this.bordGfx = null;
      if (this.heel) this.verdwijn(this.heel);
      this.heel = null;
      this.keuzeRing?.destroy();
      this.keuzeRing = null;
      this.gekozen = null;
      this.puzzel = p;
      this.pzBezig = false;
      this.pzKlaar = false;
      if (!p) return;
      const S = BORD.S;
      const bron = `pz|${JSON.stringify(p.plaatje)}`;
      this.canvasPlaatje(bron, S, S, (c) => tekenPuzzel(c, p.plaatje, S));
      const bronCanvas = this.textures.get(bron).getSourceImage() as HTMLCanvasElement;
      const n = p.n;
      const w = S / n;
      /* het bord: zachte lijntjes waar de stukjes komen */
      const g = this.add.graphics();
      g.lineStyle(2, 0xdcecff, 0.35);
      for (let i = 0; i <= n; i++) {
        g.lineBetween(BORD.x - S / 2 + i * w, BORD.y - S / 2, BORD.x - S / 2 + i * w, BORD.y + S / 2);
        g.lineBetween(BORD.x - S / 2, BORD.y - S / 2 + i * w, BORD.x + S / 2, BORD.y - S / 2 + i * w);
      }
      g.setAlpha(0);
      this.bordGfx = g;
      const los = losPlekken(p);
      for (let i = 0; i < n * n; i++) {
        const sl = `${bron}|${n}|${i}`;
        const sx = (i % n) * w;
        const sy = Math.floor(i / n) * w;
        this.canvasPlaatje(sl, Math.ceil(w), Math.ceil(w), (c) => {
          c.fillStyle = "rgba(160,205,255,0.13)";
          c.fillRect(0, 0, w, w);
          c.drawImage(bronCanvas, sx * TX, sy * TX, w * TX, w * TX, 0, 0, w, w);
          c.strokeStyle = "rgba(220,236,255,0.55)";
          c.lineWidth = 2;
          c.strokeRect(1, 1, w - 2, w - 2);
        });
        const thuis = bordPlek(n, i);
        const img = this.plaats(sl, thuis.x, thuis.y).setDepth(5);
        this.stukken.push({ img, i, vast: false, thuis: { x: thuis.x, y: thuis.y }, sl });
      }
      /* eerst even het hele plaatje, dan vallen de stukjes uit elkaar */
      const heel = this.plaats(bron, BORD.x, BORD.y).setDepth(4);
      this.heel = heel;
      this.tover(heel);
      this.stukken.forEach((st) => st.img.setVisible(false));
      this.zetPuzzelTest();
      this.time.delayedCall(2200, () => {
        if (this.puzzel !== p) return;
        heel.setVisible(false);
        this.tweens.add({ targets: g, alpha: 1, duration: 300 });
        this.stukken.forEach((st, k) => {
          st.img.setVisible(true);
          const doel = los[k];
          this.tweens.add({ targets: st.img, x: doel.x, y: doel.y, rotation: doel.hoek, duration: this.rustig ? 1 : 520, delay: this.rustig ? 0 : k * 25, ease: "Cubic.easeInOut" });
        });
        this.time.delayedCall(this.rustig ? 10 : 560 + n * n * 25, () => {
          if (this.puzzel !== p) return;
          this.pzBezig = true;
          this.zetPuzzelTest();
        });
        /* de gloed van de stukjes alvast bakken (voor oplichten en de hint) */
        this.stukken.forEach((st, k) => this.time.delayedCall(900 + k * 60, () => this.textures.exists(st.sl) && this.texG(st.sl, WARM)));
        this.time.delayedCall(1000 + n * n * 60, () => this.textures.exists(bron) && this.texG(bron, GOED));
      });
    }

    zetPuzzelTest() {
      if (!this.puzzel) return;
      const los = this.stukken.find((x) => !x.vast);
      const antwoord = !this.pzBezig || !los ? null : this.gekozen !== null ? `plek-${this.gekozen}` : `stuk-${los.i}`;
      window.__phaser = { ...window.__phaser, antwoord };
    }

    kies(i: number | null) {
      const oud = this.gekozen !== null ? this.stukken[this.gekozen] : null;
      if (oud && !oud.vast) oud.img.setTexture(oud.sl).setScale(1 / TX);
      this.gekozen = i;
      if (i !== null) {
        const st = this.stukken[i];
        st.img.setTexture(this.texG(st.sl, WARM)).setDepth(++this.diepte);
      }
      this.zetPuzzelTest();
    }

    /** Leg een stukje neer op (x, y). Op zijn eigen plek klikt het vast; anders blijft het los liggen. */
    legStuk(st: Stuk, x: number, y: number, metTween: boolean) {
      const w = BORD.S / this.puzzel!.n;
      const opBord = Math.abs(x - BORD.x) < BORD.S / 2 && Math.abs(y - BORD.y) < BORD.S / 2;
      if (Math.hypot(x - st.thuis.x, y - st.thuis.y) < w * 0.32) {
        st.vast = true;
        st.img.setDepth(3).setTexture(st.sl);
        this.tweens.add({ targets: st.img, x: st.thuis.x, y: st.thuis.y, rotation: 0, duration: this.rustig ? 1 : 140, ease: "Cubic.easeOut" });
        speelLesgeluid("tik");
        if (this.gekozen === st.i) this.gekozen = null;
        this.zetPuzzelTest();
        if (this.stukken.every((x) => x.vast)) this.puzzelAf();
        return;
      }
      const bx = Math.max(w / 2, Math.min(VLAK_B - w / 2, x));
      const by = Math.max(w / 2, Math.min(VLAK_H - w / 2, y));
      if (metTween) this.tweens.add({ targets: st.img, x: bx, y: by, duration: this.rustig ? 1 : 160 });
      else st.img.setPosition(bx, by);
      if (opBord) {
        this.schud(st.img);
        this.melder({ soort: "puzzelMis" });
      }
    }

    puzzelAf() {
      this.pzBezig = false;
      this.pzKlaar = true;
      this.zetPuzzelTest();
      this.time.delayedCall(220, () => {
        this.bordGfx?.setAlpha(0);
        this.stukken.forEach((x) => x.img.setVisible(false));
        if (this.heel) {
          this.heel.setVisible(true).setAlpha(1).setScale(1 / TX);
          this.heel.setTexture(this.texG(this.heel.texture.key, GOED));
        }
        this.golf(BORD.x, BORD.y);
      });
      /* Steeds opnieuw melden tot er een nieuwe puzzel komt: zo mist de les het nooit (ook niet als Bliepo net praat). */
      const p = this.puzzel;
      const meldKlaar = () => {
        if (this.puzzel !== p || !this.pzKlaar) return;
        this.melder({ soort: "puzzelKlaar" });
        this.time.delayedCall(1500, meldKlaar);
      };
      this.time.delayedCall(900, meldKlaar);
    }

    tikStuk(i: number) {
      if (!this.pzBezig) return;
      const st = this.stukken[i];
      if (!st || st.vast) return;
      speelLesgeluid("tik");
      this.kies(this.gekozen === i ? null : i);
    }

    tikPlek(j: number) {
      if (!this.pzBezig || this.gekozen === null) return;
      const st = this.stukken[this.gekozen];
      const plek = bordPlek(this.puzzel!.n, j);
      if (this.stukken.some((x) => x.vast && x.i === j)) return;
      if (j === st.i) return this.legStuk(st, plek.x, plek.y, true);
      /* verkeerde plek: het stukje blijft gekozen en schudt even */
      this.schud(st.img);
      this.melder({ soort: "puzzelMis" });
    }

    hint() {
      if (!this.pzBezig) return;
      const st = (this.gekozen !== null ? this.stukken[this.gekozen] : null) ?? this.stukken.find((x) => !x.vast);
      if (!st) return;
      this.kies(st.i);
      const w = BORD.S / this.puzzel!.n;
      const r = this.add.graphics().setDepth(2);
      r.lineStyle(5, WARM, 1);
      r.strokeRoundedRect(st.thuis.x - w / 2 + 4, st.thuis.y - w / 2 + 4, w - 8, w - 8, 10);
      this.tweens.add({ targets: r, alpha: { from: 1, to: 0.2 }, duration: 450, yoyo: true, repeat: 2, onComplete: () => r.destroy() });
    }

    /* ---------- tikken en slepen ---------- */

    waar(p: Ptr): { x: number; y: number } {
      const e = p.event as MouseEvent | TouchEvent | undefined;
      let cx: number | undefined;
      let cy: number | undefined;
      if (e && "changedTouches" in e && e.changedTouches.length > 0) {
        const t = [...e.changedTouches].find((x) => x.identifier === p.identifier) ?? e.changedTouches[0];
        cx = t.clientX;
        cy = t.clientY;
      } else if (e && "clientX" in e) {
        cx = e.clientX;
        cy = e.clientY;
      }
      if (cx === undefined || cy === undefined) return { x: p.worldX, y: p.worldY };
      const r = this.game.canvas.getBoundingClientRect();
      return { x: ((cx - r.left) * VLAK_B) / r.width, y: ((cy - r.top) * VLAK_H) / r.height };
    }

    raak(x: number, y: number) {
      if (this.puzzel && this.pzBezig) {
        const w = BORD.S / this.puzzel.n;
        const lijst = this.stukken.filter((st) => !st.vast).sort((a, b) => b.img.depth - a.img.depth);
        const st = lijst.find((q) => Math.abs(q.img.x - x) < w / 2 && Math.abs(q.img.y - y) < w / 2);
        if (st) return { soort: "stuk" as const, nr: st.i, id: "", bx: st.img.x, by: st.img.y };
        return null;
      }
      if (this.ketting && this.staat.actief && !this.kettingKlaar) {
        const r = this.ketting.r;
        const kr = [...this.kralen].sort((a, b) => b.img.depth - a.img.depth).find((q) => Math.hypot(q.img.x - x, q.img.y - y) < r + 6);
        if (kr) return { soort: "kraal" as const, nr: 0, id: kr.id, bx: kr.img.x, by: kr.img.y };
        return null;
      }
      if (this.staat.actief && this.beeld) {
        const tik = [...this.beeld.delen].reverse().find((d): d is Extract<Deel, { s: "tik" }> => d.s === "tik" && Math.abs(d.x - x) <= d.b / 2 && Math.abs(d.y - y) <= d.h / 2 && !this.staat.uit.includes(d.id));
        if (tik) return { soort: "tik" as const, nr: 0, id: tik.id, bx: x, by: y };
      }
      return null;
    }

    neer(p: Ptr) {
      const w = this.waar(p);
      const r = this.raak(w.x, w.y);
      if (!r) {
        /* tikken op een lege plek op het bord, met een gekozen stukje */
        if (this.puzzel && this.pzBezig && this.gekozen !== null) {
          const n = this.puzzel.n;
          const sw = BORD.S / n;
          const i = Math.floor((w.x - (BORD.x - BORD.S / 2)) / sw);
          const j = Math.floor((w.y - (BORD.y - BORD.S / 2)) / sw);
          if (i >= 0 && j >= 0 && i < n && j < n) this.tikPlek(j * n + i);
        }
        return;
      }
      this.druk = { soort: r.soort, nr: r.nr, id: r.id, x0: w.x, y0: w.y, dx: r.bx - w.x, dy: r.by - w.y, sleept: false };
    }

    beweeg(p: Ptr) {
      const w = this.waar(p);
      const d = this.druk;
      if (!d) {
        if (!p.isDown) this.input.setDefaultCursor(this.raak(w.x, w.y) ? "pointer" : "default");
        return;
      }
      if (d.soort === "tik") return;
      if (!d.sleept && Math.hypot(w.x - d.x0, w.y - d.y0) > 9) {
        d.sleept = true;
        this.input.setDefaultCursor("grabbing");
        if (d.soort === "stuk") {
          this.kies(d.nr);
          this.stukken[d.nr].img.setRotation(0);
        }
      }
      if (!d.sleept) return;
      const img = d.soort === "stuk" ? this.stukken[d.nr].img : this.kralen.find((k) => k.id === d.id)?.img;
      img?.setDepth(++this.diepte).setPosition(w.x + d.dx, w.y + d.dy);
    }

    los(p: Ptr) {
      const d = this.druk;
      this.druk = null;
      this.input.setDefaultCursor("default");
      if (!d) return;
      const w = this.waar(p);
      if (d.soort === "tik") {
        if (Math.hypot(w.x - d.x0, w.y - d.y0) < 30) {
          speelLesgeluid("tik");
          this.melder({ soort: "tik", id: d.id });
        }
        return;
      }
      if (d.soort === "stuk") {
        if (!d.sleept) return this.tikStuk(d.nr);
        const st = this.stukken[d.nr];
        this.legStuk(st, st.img.x, st.img.y, false);
        if (!st.vast) this.kies(null);
        return;
      }
      const kr = this.kralen.find((k) => k.id === d.id);
      if (!kr || !this.ketting) return;
      if (!d.sleept) return this.tikKraal(kr.id);
      const r = this.ketting.r;
      const plek = this.ketting.plekken.findIndex((q, i) => Math.hypot(q.x - kr.img.x, q.y - kr.img.y) < r * 1.6 && !this.kralen.some((x) => x !== kr && x.plek === i));
      this.legKraal(kr, plek >= 0 ? plek : null);
    }

    /** Voor `npm run vloeiend`: het beeld van nu opnieuw tevoorschijn toveren, met de lichtgolf; bij een puzzel schuiven de stukjes. */
    demo(ms: number) {
      const eind = performance.now() + ms;
      let k = 0;
      const stap = () => {
        if (performance.now() > eind) return;
        if (this.beeld && !this.puzzel) {
          const b = this.beeld;
          this.sleutel = "";
          this.zetBeeld({ ...b, id: `${b.id}-demo-${k++}` });
        }
        this.stukken.forEach((st, i) => {
          if (st.vast) return;
          this.tweens.add({ targets: st.img, x: st.img.x + (i % 2 ? 30 : -30), duration: 380, yoyo: true, ease: "Sine.easeInOut" });
        });
        this.time.delayedCall(420, () => this.golf(VLAK_B / 2, VLAK_H / 2));
        this.time.delayedCall(900, stap);
      };
      stap();
    }
  }
  return Vormen as unknown as new () => import("phaser").Scene;
}

/* ---------- het vlak ---------- */

export function SqulaVormenVlak({ beeld, licht = [], goedIds = [], uit = [], actief = false, goed = 0, fout = 0, ketting = null, puzzel = null, hint = 0, meld, schaal }: VormenProps & Vlakbasis) {
  const { plek, scene } = useHoloMotor<VormenScene>(schaal, maakScene, { invoer: true });
  const meldRef = useRef(meld);
  useEffect(() => {
    meldRef.current = meld;
  }, [meld]);
  useEffect(() => {
    scene?.verbind((g) => meldRef.current(g));
  }, [scene]);

  const beeldSleutel = JSON.stringify(beeld);
  useEffect(() => {
    scene?.zetBeeld(JSON.parse(beeldSleutel) as Beeld | null);
  }, [scene, beeldSleutel]);
  const staatSleutel = JSON.stringify({ licht, goedIds, uit, actief });
  useEffect(() => {
    scene?.zetStaat(JSON.parse(staatSleutel) as Staat);
  }, [scene, staatSleutel, beeldSleutel]);
  useEffect(() => {
    if (scene && goed > 0) scene.goed();
  }, [scene, goed]);
  useEffect(() => {
    if (scene && fout > 0) scene.fout();
  }, [scene, fout]);
  const kettingSleutel = JSON.stringify(ketting);
  useEffect(() => {
    scene?.zetKetting(JSON.parse(kettingSleutel) as Ketting | null);
  }, [scene, kettingSleutel]);
  const puzzelSleutel = JSON.stringify(puzzel);
  useEffect(() => {
    scene?.zetPuzzel(JSON.parse(puzzelSleutel) as Puzzel | null);
  }, [scene, puzzelSleutel]);
  useEffect(() => {
    if (scene && hint > 0) scene.hint();
  }, [scene, hint]);

  const tikken = actief ? (beeld?.delen ?? []).filter((d): d is Extract<Deel, { s: "tik" }> => d.s === "tik" && !uit.includes(d.id)) : [];
  const n = puzzel?.n ?? 0;

  return (
    <div className={s.vlak}>
      <div ref={plek} style={{ ...HOLO_CANVAS, touchAction: "none" }} aria-hidden />
      <div className={s.knoppen}>
        {tikken.map((t) => (
          <button
            key={t.id}
            type="button"
            className={s.ding}
            data-ding={t.id}
            aria-label={t.aria}
            style={{ left: t.x - t.b / 2, top: t.y - t.h / 2, width: t.b, height: t.h }}
            onClick={() => {
              speelLesgeluid("tik");
              meld({ soort: "tik", id: t.id });
            }}
          />
        ))}
        {ketting &&
          actief &&
          ketting.losse.map((k, i) => (
            <button
              key={k.id}
              type="button"
              className={s.ding}
              data-ding={`k-${k.id}`}
              aria-label={`kraal ${i + 1}`}
              style={{ left: k.x - ketting.r, top: k.y - ketting.r, width: ketting.r * 2, height: ketting.r * 2 }}
              onClick={() => scene?.tikKraal(k.id)}
            />
          ))}
        {puzzel &&
          Array.from({ length: n * n }, (_, i) => {
            const q = bordPlek(n, i);
            return (
              <span key={i}>
                <button type="button" className={s.ding} data-ding={`stuk-${i}`} aria-label={`stukje ${i + 1}`} style={{ left: q.x - q.w / 2, top: q.y - q.w / 2, width: q.w / 2, height: q.w }} onClick={() => scene?.tikStuk(i)} />
                <button type="button" className={s.ding} data-ding={`plek-${i}`} aria-label={`plek ${i + 1}`} style={{ left: q.x, top: q.y - q.w / 2, width: q.w / 2, height: q.w }} onClick={() => scene?.tikPlek(i)} />
              </span>
            );
          })}
      </div>
    </div>
  );
}

/* ---------- tekeningen voor de kaart aan het eind (244 × 190) ---------- */

const RANDK = "#ffffff";

export function KaartPatronen() {
  const kleuren = ["#ff9a3c", "#9b6be0", "#ffd93b", "#ff9a3c", "#9b6be0", "#ffd93b"];
  return (
    <>
      <path d="M22 96 Q122 60 222 96" fill="none" stroke={RANDK} strokeWidth={3} />
      {kleuren.map((k, i) => {
        const x = 34 + i * 35;
        const y = 96 - Math.sin((Math.PI * (x - 22)) / 200) * 18;
        return <circle key={i} cx={x} cy={y} r={15} fill={k} stroke={RANDK} strokeWidth={2.5} />;
      })}
      <circle cx={122} cy={150} r={15} fill="none" stroke="#ffd36e" strokeWidth={3} strokeDasharray="6 5" />
    </>
  );
}

export function KaartOpruimen() {
  return (
    <>
      <rect x={30} y={120} width={184} height={12} rx={4} fill="none" stroke={RANDK} strokeWidth={4} />
      <rect x={44} y={92} width={22} height={28} fill="#4b8af5" stroke={RANDK} strokeWidth={3} />
      <rect x={72} y={78} width={26} height={42} fill="#55c26f" stroke={RANDK} strokeWidth={3} />
      <rect x={104} y={62} width={30} height={58} fill="#e8453c" stroke={RANDK} strokeWidth={3} />
      <circle cx={170} cy={100} r={20} fill="#ffd93b" stroke={RANDK} strokeWidth={3} />
    </>
  );
}

export function KaartOrienteren() {
  return (
    <>
      <rect x={42} y={30} width={160} height={130} rx={10} fill="none" stroke={RANDK} strokeWidth={4} />
      <line x1={122} y1={30} x2={122} y2={160} stroke={RANDK} strokeWidth={2.5} strokeDasharray="6 6" />
      <line x1={42} y1={95} x2={202} y2={95} stroke={RANDK} strokeWidth={2.5} strokeDasharray="6 6" />
      <circle cx={170} cy={132} r={16} fill="#e8453c" stroke={RANDK} strokeWidth={3} />
    </>
  );
}

export function KaartPuzzel() {
  return (
    <>
      <rect x={62} y={30} width={60} height={60} fill="#e8453c" stroke={RANDK} strokeWidth={3} />
      <rect x={122} y={30} width={60} height={60} fill="#ffd93b" stroke={RANDK} strokeWidth={3} />
      <rect x={62} y={90} width={60} height={60} fill="#4b8af5" stroke={RANDK} strokeWidth={3} />
      <rect x={140} y={104} width={60} height={60} fill="#55c26f" stroke={RANDK} strokeWidth={3} transform="rotate(12 170 134)" />
    </>
  );
}
