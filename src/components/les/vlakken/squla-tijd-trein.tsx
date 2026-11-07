"use client";

/**
 * De weektrein in Phaser (30 oktober 2026) voor de lessen "Dagen van de week"
 * naar Squla (level 1, 2 en 3). Dezelfde Kenney-weektrein als de voorbeeldles
 * (public/squla/trein-glow, CC0, zie public/squla/trein/BRON.md), maar hier als
 * Phaser-plaatjes, donker met "glow in the dark" (nacht: true). De gloed zit al
 * in de plaatjes (één keer gebakken), dus vloeiend. De voorbeeldles en haar vlak
 * (squla-dagen-trein.tsx) blijven zoals ze zijn.
 *
 * Wat het draaiboek zet:
 * - `trein`: de wagons achter de locomotief (0 = maandag … 6 = zondag), `null`
 *   = een lege plek; `treinKlein`: kleiner, bovenaan; `licht`: wagons die
 *   oplichten; `vandaag`: de gele pijl; `stappen`: boogjes van dag naar dag;
 * - `plaatje` en `vandaagKaart`: bij een verhaaltje een tekening en de dag van
 *   vandaag met de pijl erboven;
 * - `kaarten`: dagkaarten (één wagon, of twee naast elkaar) om aan te tikken,
 *   met `uit`, `goed`, `fout`, `kaartLicht`;
 * - `orden`: vier lege vakken en vier dagkaarten om op volgorde te slepen (of
 *   aan te tikken: dan gaat de kaart naar het eerste lege vak).
 *
 * Meldingen: `kaart` {id}, `leg` {id, vak|null} (id = de naam van de dag).
 */

import { useEffect, useRef, useState } from "react";
import type { Vlakbasis, Vlakgebeurtenis } from "../soort";
import { holoBasis, GOED, TX, VLAK_B, VLAK_H, WARM } from "../holo/basis";
import { HOLO_CANVAS, useHoloMotor } from "../holo/motor";
import { maakRondjes } from "../holo/rondje";
import { DAGEN } from "./squla-dagen-trein";
import { binnen, rij, type Rect } from "./squla-tijd-plaatjes";
import { tekenTekening, tekeningMaat } from "./squla-tijd-tekeningen";
import { tekenVormen } from "./bliepo-voorwerpen";
import { haalKeuzesAlvast, zegKeuze } from "@/lib/stem";
import s from "./squla-tijd.module.css";

export type DagKaart = { id: string; dagen: number[] };
export type TreinOrden = { vakken: (number | null)[]; losse: number[]; uitslag?: (boolean | null)[]; actief: boolean };

export type TreinProps = {
  nr: number;
  /** Verandert dit getal, dan rijdt de trein het beeld in. */
  rit?: number;
  trein?: (number | null)[] | null;
  treinKlein?: boolean;
  licht?: number[];
  vandaag?: number | null;
  stappen?: number[] | null;
  plaatje?: string | null;
  vandaagKaart?: number | null;
  kaarten?: DagKaart[];
  kaartenActief?: boolean;
  uit?: string[];
  goed?: string[];
  fout?: string[];
  kaartLicht?: string[];
  orden?: TreinOrden | null;
  schud?: { id: string; n: number } | null;
  golf?: { id: string; n: number } | null;
  /** Een handje doet één keer voor hoe je sleept (verandert het getal, dan nog eens). */
  handje?: number;
  /**
   * Wat het plaatje bij een verhaaltje doet (BOUWREGELS 1.22, 7 november 2026). Zonder: groot naast de dag van vandaag
   * (zoals eerst). "sfeer": klein en zacht linksboven, als achtergrond. "verte": klein en zacht op zijn plek (nog ver weg);
   * "komt": van "verte" naar groot, met een sprongetje en wolkjes (pas NA het antwoord).
   */
  plaatjeStand?: "sfeer" | "verte" | "komt" | null;
  /**
   * Staand scherm (telefoon rechtop; BOUWREGELS 1.24, 7 november 2026). Zet het vlak zelf, niet het draaiboek: de trein
   * in 2 rijen met veel grotere wagons, en grotere dagkaarten. Op een liggend scherm verandert er niets.
   */
  staand?: boolean;
};

export const dagNaam = (d: number) => DAGEN[d].naam;
export const kaartId = (dagen: number[]) => dagen.map(dagNaam).join(" en ");

/* ---------- maten (punten van het vlak, 980 × 720) ---------- */

/** Een wagon: de maten van het plaatje (glow) bij een wagonbreedte van 150. */
const BASIS_W = 150;
const PLAATJE_B = 224;
const PLAATJE_H = 150;
const LOC_B = 191;
const LOC_H = 145;
const WAGON_H = (w: number) => (w * 163) / 324;

/** `ry(i)`: hoeveel lager wagon i staat dan de eerste rij (staand: 2 rijen); `rijen`: de y van elke rij (t.o.v. `y`). */
type TreinMaat = { w: number; loc: number; y: number; x: (i: number) => number; ry: (i: number) => number; rijen: number[]; locX: number; tussen: number };

function treinMaat(n: number, klein: boolean, staand = false): TreinMaat {
  if (staand) {
    /* Staand scherm: de locomotief met de eerste dagen bovenaan, de rest eronder; zo worden de wagons bijna 2 keer zo
       breed en zijn de dagnamen zonder inzoomen te lezen (BOUWREGELS 1.24, keuring herstel A). Een korte trein (tot 4
       wagons) blijft 1 rij, zo groot als past. */
    const een = n <= 4;
    const r0 = een ? n : Math.floor(n / 2);
    const r1 = n - r0;
    const tussen = 12;
    const w = een ? Math.min(klein ? 150 : 210, Math.floor((940 - n * tussen) / (128 / 108 + n))) : klein ? 150 : 210;
    const loc = (w * 128) / 108;
    const y = klein ? 62 : 150;
    const rijH = WAGON_H(w) + (klein ? 46 : 74);
    const b0 = loc + r0 * (w + tussen);
    const b1 = Math.max(0, r1 * (w + tussen) - tussen);
    const x0 = (VLAK_B - b0) / 2;
    const x1 = (VLAK_B - b1) / 2;
    return {
      w,
      loc,
      y,
      tussen,
      rijen: een ? [0] : [0, rijH],
      locX: x0 + loc / 2,
      x: (i) => (i < r0 ? x0 + loc + tussen + i * (w + tussen) + w / 2 : x1 + (i - r0) * (w + tussen) + w / 2),
      ry: (i) => (i < r0 ? 0 : rijH),
    };
  }
  const w = klein ? 84 : 108;
  const loc = klein ? 100 : 128;
  const tussen = klein ? 6 : 8;
  const y = klein ? 92 : 250;
  const breed = loc + n * (w + tussen);
  const x0 = (VLAK_B - breed) / 2;
  return { w, loc, y, tussen, rijen: [0], ry: () => 0, locX: x0 + loc / 2, x: (i) => x0 + loc + tussen + i * (w + tussen) + w / 2 };
}

const KAART_W = 150;
const PAAR_W = 112;

/** De breedte van een dagkaart (één wagon) en van een wagon in een kaart met 2 dagen; staand groter (BOUWREGELS 1.24). */
function kaartMaat(p: TreinProps): { kw: number; pw: number } {
  if (!p.staand) return { kw: KAART_W, pw: PAAR_W };
  const n = Math.max(p.kaarten?.length ?? 0, p.orden?.losse.length ?? 0, p.orden?.vakken.length ?? 0, 1);
  const paar = (p.kaarten ?? []).some((k) => k.dagen.length > 1);
  /* kaarten met 2 dagen: hooguit 2 naast elkaar, de rest op een rij eronder (zie treinIndeling) */
  if (paar) return { kw: KAART_W, pw: Math.min(185, ((940 - (Math.min(n, 2) - 1) * 40) / Math.min(n, 2) - 10) / 2) };
  return { kw: Math.min(260, (930 - (n - 1) * 34) / n - (p.orden ? 12 : 0)), pw: PAAR_W };
}

type Indeling = { kaarten: Rect[]; vakken: Rect[]; losse: Rect[] };

export function treinIndeling(p: TreinProps): Indeling {
  const n = p.kaarten?.length ?? 0;
  const paar = (p.kaarten ?? []).some((k) => k.dagen.length > 1);
  const { kw, pw } = kaartMaat(p);
  const st = !!p.staand;
  const kb = paar ? 2 * pw + 10 : kw;
  const kh = WAGON_H(paar ? pw : kw) + 30;
  const kaarten = !n
    ? []
    : st && paar && n > 2
      ? /* elk paar in een eigen zacht vak, met meer ruimte ertussen (keuring herstel AB2, N4) */
        [...rij(2, kb, 76, 480, kh), ...rij(n - 2, kb, 76, 480 + kh + 30, kh)]
      : rij(n, kb, st ? (paar ? 40 : 34) : paar ? 64 : n === 4 ? 40 : 60, st ? 580 : 566, kh);
  let vakken: Rect[] = [];
  let losse: Rect[] = [];
  if (p.orden) {
    const h = WAGON_H(kw) + 30;
    vakken = rij(p.orden.vakken.length, kw + 12, st ? 22 : 30, st ? (p.trein ? 380 : 300) : p.trein ? 330 : 290, h);
    losse = rij(p.orden.losse.length, kw, st ? 34 : 46, st ? 590 : 566, h);
  }
  return { kaarten, vakken, losse };
}

/* ---------- de scène ---------- */

type Ptr = import("phaser").Input.Pointer;
type Box = import("phaser").GameObjects.Container;
type Img = import("phaser").GameObjects.Image;

interface TreinScene {
  verbind(meld: (g: Vlakgebeurtenis) => void): void;
  zet(p: TreinProps): void;
  schudDing(id: string): void;
  golfDing(id: string): void;
  rijIn(): void;
  speelHandje(): void;
}

type Ding = { box: Box; ring: Img; r: Rect; id: string; soort: "kaart" | "los"; rondjes?: ReturnType<typeof maakRondjes> };

function maakScene(Phaser: typeof import("phaser"), rustig: boolean) {
  const Basis = holoBasis(Phaser, rustig);
  class Trein extends Basis implements TreinScene {
    melder: (g: Vlakgebeurtenis) => void = () => {};
    p: TreinProps | null = null;
    sig = { trein: "", rest: "" };
    nr = -1;
    treinGroep: Box | null = null;
    /** Het rode rondje om de wagon(s) die Bliepo aanwijst; hoort bij de treingroep (rijdt mee). */
    treinRondjes: ReturnType<typeof maakRondjes> | null = null;
    wagons = new Map<number, Img>();
    pijl: Img | null = null;
    bogen: import("phaser").GameObjects.Graphics | null = null;
    rest: import("phaser").GameObjects.GameObject[] = [];
    dingen = new Map<string, Ding>();
    plaatjeBeeld: { img: Img; stand: string } | null = null;
    druk: { d: Ding; x0: number; y0: number; dx: number; dy: number; sleept: boolean; lang: boolean } | null = null;
    zweef: string | null = null;
    stemKlok: ReturnType<typeof setTimeout> | undefined;
    terugKlok: ReturnType<typeof setTimeout> | undefined;
    /** De maat van de dagkaarten (staand groter). */
    km = { kw: KAART_W, pw: PAAR_W };

    constructor() {
      super("squla-tijd-trein");
    }

    preload() {
      for (const d of DAGEN) this.load.image(`png-${d.naam}`, `/squla/trein-glow/${d.naam}.png`);
      this.load.image("png-loc", "/squla/trein-glow/locomotief.png");
    }

    verbind(meld: (g: Vlakgebeurtenis) => void) {
      this.melder = meld;
    }

    maak() {
      const font = letter();
      /* Elke wagon één keer: het Kenney-plaatje met de gloed, en de naam op een bordje. */
      DAGEN.forEach((d, i) => {
        const bron = this.textures.get(`png-${d.naam}`).getSourceImage() as HTMLImageElement;
        this.canvasPlaatje(`wg-${i}`, PLAATJE_B, PLAATJE_H, (c) => {
          c.drawImage(bron, 0, 0, PLAATJE_B, PLAATJE_H);
          /* De dagnaam groter, zodat een kind hem zonder inzoomen kan lezen (BOUWREGELS 1.24, 7 november 2026). */
          c.font = `800 ${i === 3 ? 26 : 28}px ${font}`;
          const tb = c.measureText(d.naam).width + 14;
          const x = PLAATJE_B / 2 - tb / 2;
          const y = 64 - 18;
          c.save();
          c.shadowColor = d.hex;
          c.shadowBlur = 12;
          c.fillStyle = "#fff7ea";
          c.beginPath();
          c.roundRect(x, y, tb, 36, 9);
          c.fill();
          c.restore();
          c.strokeStyle = d.hex;
          c.lineWidth = 2.5;
          c.beginPath();
          c.roundRect(x, y, tb, 36, 9);
          c.stroke();
          c.fillStyle = "#1d2b5e";
          c.textAlign = "center";
          c.textBaseline = "middle";
          c.fillText(d.naam, PLAATJE_B / 2, 64 + 1);
        });
      });
      const loc = this.textures.get("png-loc").getSourceImage() as HTMLImageElement;
      this.canvasPlaatje("wg-loc", LOC_B, LOC_H, (c) => c.drawImage(loc, 0, 0, LOC_B, LOC_H));
      /* Een lege plek, de pijl van vandaag, en de randen (wit = aanwijzen, groen = goed, rood = niet goed). */
      this.canvasPlaatje("leeg", 160, 84, (c) => {
        c.fillStyle = "rgba(255,247,234,0.07)";
        c.beginPath();
        c.roundRect(4, 4, 152, 76, 14);
        c.fill();
        c.setLineDash([10, 7]);
        c.strokeStyle = "rgba(255,247,234,0.75)";
        c.lineWidth = 4;
        c.stroke();
      });
      this.canvasPlaatje("pijl", 44, 50, (c) =>
        tekenVormen(c, [{ d: "M 14 4 H 30 V 24 H 40 L 22 44 L 4 24 H 14 Z", vul: "#ffc845", rand: "#1d2b5e", dik: 3.5 }]),
      );
      this.bak("pijl", "pijl-g", WARM);
      /* Het handje dat voordoet hoe je sleept. */
      this.canvasPlaatje("handje", 48, 56, (c) => {
        /* Een lichtje dat voordoet hoe je sleept (tot 31 oktober 2026 een handje; geen mensen, ook geen hand). */
        const g = c.createRadialGradient(24, 28, 2, 24, 28, 22);
        g.addColorStop(0, "rgba(255,255,255,1)");
        g.addColorStop(0.45, "rgba(255,240,190,0.9)");
        g.addColorStop(1, "rgba(255,211,110,0)");
        c.fillStyle = g;
        c.beginPath();
        c.arc(24, 28, 22, 0, Math.PI * 2);
        c.fill();
      });

      this.input.on("pointerdown", (p: Ptr) => this.neer(p));
      this.input.on("pointermove", (p: Ptr) => this.beweeg(p));
      this.input.on("pointerup", () => this.los());
      this.input.on("pointerupoutside", () => this.los());
    }

    /** Een rand om een kaart (wit = aanwijzen of niet goed, groen = goed, rood = fout, geel = Bliepo wijst), met een gebakken gloed. */
    randPlaatje(k: "wit" | "groen" | "rood" | "geel", b: number, h: number) {
      const sl = `rand-${k}-${Math.round(b)}x${Math.round(h)}`;
      if (!this.textures.exists(`${sl}-g`)) {
        const kleur = { wit: "rgba(255,255,255,0.95)", groen: "#5ee39a", rood: "#ff7a6e", geel: "#ffd36e" }[k];
        this.canvasPlaatje(sl, b + 10, h + 10, (c) => {
          c.strokeStyle = kleur;
          c.lineWidth = 5;
          c.beginPath();
          c.roundRect(5, 5, b, h, 16);
          c.stroke();
        });
        this.bak(sl, `${sl}-g`, { wit: 0xffffff, groen: GOED, rood: 0xff7a6e, geel: WARM }[k]);
      }
      return `${sl}-g`;
    }

    /** Het zachte vak achter een kaart met 2 dagen (staand), zoals de keuzevakken bij de geldles: één keer getekend. */
    paarVak(b: number, h: number) {
      const sl = `paarvak|${Math.round(b)}x${Math.round(h)}`;
      this.canvasPlaatje(sl, b, h, (c) => {
        c.fillStyle = "rgba(207,227,255,0.13)";
        c.beginPath();
        c.roundRect(0, 0, b, h, 30);
        c.fill();
      });
      return sl;
    }

    /** De tekening bij een verhaaltje, met een zachte gloed (één keer gebakken). */
    plaatjeVan(sleutel: string) {
      const sl = `vt-${sleutel}`;
      if (!this.textures.exists(`${sl}-g`)) {
        const m = tekeningMaat(sleutel);
        const k = 170 / Math.max(m.b, m.h);
        this.canvasPlaatje(sl, m.b * k, m.h * k, (c) => {
          c.scale(k, k);
          tekenTekening(c, sleutel);
        });
        this.bak(sl, `${sl}-g`, WARM);
      }
      return `${sl}-g`;
    }

    /** Een wagon met zijn breedte `w` (het plaatje heeft rondom ruimte voor de gloed). */
    wagon(dag: number, x: number, y: number, w: number) {
      return this.plaats(`wg-${dag}`, x, y).setScale(w / BASIS_W / TX);
    }

    /* ---------- de trein ---------- */

    bouwTrein(p: TreinProps) {
      this.treinRondjes?.vergeet();
      this.treinRondjes = null;
      this.treinGroep?.destroy();
      this.treinGroep = null;
      this.wagons.clear();
      this.pijl = null;
      this.bogen = null;
      if (!p.trein) return;
      const m = treinMaat(p.trein.length, !!p.treinKlein, !!p.staand);
      /* De groep staat in het midden van de trein, zodat hij vanuit het midden verschijnt. */
      const ox = VLAK_B / 2;
      const g = this.add.container(ox, m.y);
      const rails = this.add.graphics();
      const dun = p.treinKlein && !p.staand;
      for (const ry of m.rijen) {
        const railY = ry + WAGON_H(m.w) / 2 + (dun ? 6 : 8);
        rails.fillStyle(0x8fa3c9, 1).fillRoundedRect(-ox, railY, VLAK_B, dun ? 4 : 6, 3);
        rails.fillStyle(0x5d6f9a, 1);
        for (let x = 6; x < VLAK_B; x += 30) rails.fillRoundedRect(x - ox, railY + (dun ? 4 : 6), 14, dun ? 5 : 7, 2);
      }
      g.add(rails);
      const locH = (m.loc * 207) / 324;
      g.add(this.plaats("wg-loc", m.locX - ox, WAGON_H(m.w) / 2 - locH / 2).setScale(m.loc / 128 / TX));
      p.trein.forEach((d, i) => {
        if (d === null) {
          g.add(this.vak(m.x(i) - ox, m.ry(i), m.w + 6, WAGON_H(m.w) + 8));
          return;
        }
        const w = this.wagon(d, m.x(i) - ox, m.ry(i), m.w);
        this.wagons.set(d, w);
        g.add(w);
      });
      this.bogen = this.add.graphics();
      g.add(this.bogen);
      this.pijl = this.plaats("pijl-g", 0, 0).setVisible(false);
      g.add(this.pijl);
      this.treinGroep = g;
      this.treinRondjes = maakRondjes(this, g, rustig);
    }

    /** Een lege plek (gestippeld) van b × h punten. */
    vak(x: number, y: number, b: number, h: number) {
      return this.plaats("leeg", x, y).setScale(b / 160 / TX, h / 84 / TX);
    }

    /** Wat Bliepo aanwijst krijgt een rood rondje: wagons die naast elkaar staan samen, de rest apart. */
    rondjeVakken(p: TreinProps, m: TreinMaat) {
      const wens = new Map<string, { x: number; y: number; b: number; h: number }>();
      if (!p.trein || !p.licht?.length) return wens;
      const ox = VLAK_B / 2;
      const plekken = p.licht.map((d) => p.trein!.indexOf(d)).filter((i) => i >= 0).sort((a, b) => a - b);
      let start = 0;
      for (let k = 0; k < plekken.length; k++) {
        /* naast elkaar én in dezelfde rij: één rondje samen */
        if (k + 1 < plekken.length && plekken[k + 1] === plekken[k] + 1 && m.ry(plekken[k + 1]) === m.ry(plekken[k])) continue;
        const a = plekken[start];
        const b = plekken[k];
        const x0 = m.x(a) - ox - m.w / 2;
        const x1 = m.x(b) - ox + m.w / 2;
        /* Het rondje mag niet buiten het vlak vallen (keuring herstel AB2, N3: zaterdag en zondag staan aan de rand).
           Het rondje is b × 1,15 + 44 breed (zie rondje.ts); steekt het uit, dan wordt die kant ingetrokken. */
        let cx = (x0 + x1) / 2;
        let bb = x1 - x0;
        const W = bb * 1.15 + 44;
        const rechts = ox + cx + W / 2 - (VLAK_B - 8);
        const links = 8 - (ox + cx - W / 2);
        if (rechts > 0) {
          bb = (W - rechts - 44) / 1.15;
          cx -= rechts / 2;
        } else if (links > 0) {
          bb = (W - links - 44) / 1.15;
          cx += links / 2;
        }
        wens.set(`w${a}-${b}`, { x: cx, y: m.ry(a), b: bb, h: WAGON_H(m.w) });
        start = k + 1;
      }
      return wens;
    }

    pasTreinToe(p: TreinProps) {
      if (!p.trein) return;
      const m = treinMaat(p.trein.length, !!p.treinKlein, !!p.staand);
      const ox = VLAK_B / 2;
      for (const [d, w] of this.wagons) {
        const aan = !!p.licht?.includes(d);
        w.setAlpha(p.licht?.length && !aan ? 0.5 : 1);
      }
      this.treinRondjes?.zet(this.rondjeVakken(p, m));
      if (this.pijl) {
        const i = p.vandaag != null ? p.trein.indexOf(p.vandaag) : -1;
        this.pijl.setVisible(i >= 0);
        this.tweens.killTweensOf(this.pijl);
        if (i >= 0) {
          this.pijl.setPosition(m.x(i) - ox, m.ry(i) - WAGON_H(m.w) / 2 - (p.treinKlein && !p.staand ? 30 : 44));
          if (!rustig) this.tweens.add({ targets: this.pijl, y: this.pijl.y + 7, duration: 600, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
        }
      }
      if (this.bogen) {
        const g = this.bogen;
        g.clear();
        const st = p.stappen ?? [];
        for (let k = 0; k + 1 < st.length; k++) {
          const a = p.trein.indexOf(st[k]);
          const b = p.trein.indexOf(st[k + 1]);
          if (a < 0 || b < 0) continue;
          const r = b > a ? 1 : -1;
          if (m.ry(a) !== m.ry(b)) {
            /* staand: de stap gaat naar de andere rij; een boogje van onder de ene wagon naar boven de andere */
            const van = new Phaser.Math.Vector2(m.x(a) - ox, m.ry(a) + WAGON_H(m.w) / 2 + 16);
            const naar = new Phaser.Math.Vector2(m.x(b) - ox, m.ry(b) - WAGON_H(m.w) / 2 - 12);
            const boog = new Phaser.Curves.QuadraticBezier(van, new Phaser.Math.Vector2((van.x + naar.x) / 2, (van.y + naar.y) / 2 + 20 * (naar.y > van.y ? -1 : 1)), naar);
            g.lineStyle(9, 0x1d2b5e, 1);
            boog.draw(g, 24);
            g.lineStyle(5, 0xffd36e, 1);
            boog.draw(g, 24);
            const t = boog.getTangent(1);
            const hoek = Math.atan2(t.y, t.x);
            const punt = (d: number, zij: number) => [naar.x + Math.cos(hoek) * d - Math.sin(hoek) * zij, naar.y + Math.sin(hoek) * d + Math.cos(hoek) * zij] as const;
            const [ax, ay] = punt(4, 0);
            const [bx, by] = punt(-14, -9);
            const [cx, cy] = punt(-14, 9);
            g.fillStyle(0xffd36e, 1);
            g.fillTriangle(ax, ay, bx, by, cx, cy);
            continue;
          }
          const x1 = m.x(a) - ox + 8 * r;
          const x2 = m.x(b) - ox - 8 * r;
          const y = m.ry(a) + WAGON_H(m.w) / 2 + 24;
          const curve = new Phaser.Curves.QuadraticBezier(new Phaser.Math.Vector2(x1, y), new Phaser.Math.Vector2((x1 + x2) / 2, y + 36), new Phaser.Math.Vector2(x2, y));
          g.lineStyle(9, 0x1d2b5e, 1);
          curve.draw(g, 24);
          g.lineStyle(5, 0xffd36e, 1);
          curve.draw(g, 24);
          g.fillStyle(0xffd36e, 1);
          g.fillTriangle(x2 + 2 * r, y - 4, x2 - 14 * r, y + 2, x2 - 4 * r, y + 14);
        }
      }
    }

    rijIn() {
      if (!this.treinGroep || rustig) return;
      this.tweens.killTweensOf(this.treinGroep);
      this.treinGroep.setAlpha(1).setScale(1);
      this.treinGroep.x = VLAK_B / 2 + 1000;
      this.tweens.add({ targets: this.treinGroep, x: VLAK_B / 2, duration: 2200, ease: "Cubic.easeOut" });
    }

    /* ---------- kaarten en vakken ---------- */

    leegRest() {
      for (const o of this.rest) o.destroy();
      this.rest = [];
      this.dingen.clear();
      this.druk = null;
    }

    nieuwDing(id: string, dagen: number[], r: Rect, soort: Ding["soort"]) {
      const box = this.add.container(r.x, r.y);
      const { kw, pw } = this.km;
      const ringB = (dagen.length > 1 ? 2 * pw + 10 : kw) + 22;
      const ringH = WAGON_H(dagen.length > 1 ? pw : kw) + 26;
      const ring = this.plaats(this.randPlaatje("wit", ringB, ringH), 0, 0).setVisible(false);
      /* staand: een kaart met 2 dagen in een eigen zacht vak, zodat de paren niet één lange rij lijken (keuring herstel AB2, N4) */
      if (this.p?.staand && soort === "kaart" && dagen.length > 1) box.add(this.plaats(this.paarVak(2 * pw + 10 + 36, WAGON_H(pw) + 30), 0, 0));
      box.add(ring);
      if (dagen.length > 1) {
        box.add(this.wagon(dagen[0], -(pw + 10) / 2, 0, pw));
        box.add(this.wagon(dagen[1], (pw + 10) / 2, 0, pw));
      } else box.add(this.wagon(dagen[0], 0, 0, kw));
      this.rest.push(box);
      const d: Ding = { box, ring, r, id, soort };
      this.dingen.set(id, d);
      return d;
    }

    bouwRest(p: TreinProps, verschijn: boolean) {
      this.leegRest();
      const ind = treinIndeling(p);
      const nieuw: Box[] = [];
      this.plaatjeBeeld = null;
      if (p.plaatje) {
        const x = p.vandaagKaart != null ? 330 : VLAK_B / 2;
        const stand = p.plaatjeStand ?? "";
        const pl = this.plaats(this.plaatjeVan(p.plaatje), x, 230);
        if (stand === "sfeer") pl.setPosition(120, 110).setScale(0.55 / TX).setAlpha(0.45);
        if (stand === "verte") pl.setScale(0.45 / TX).setAlpha(0.45);
        this.rest.push(pl);
        this.plaatjeBeeld = { img: pl, stand };
        if (verschijn && !stand) this.tover(pl);
      }
      if (p.vandaagKaart != null) {
        /* zonder groot plaatje staat de dag van vandaag in het midden */
        const box = this.add.container(p.plaatje && p.plaatjeStand !== "sfeer" ? 650 : VLAK_B / 2, 250);
        box.add(this.wagon(p.vandaagKaart, 0, 0, KAART_W));
        const pijl = this.plaats("pijl-g", 0, -WAGON_H(KAART_W) / 2 - 48);
        box.add(pijl);
        if (!rustig) this.tweens.add({ targets: pijl, y: pijl.y + 7, duration: 600, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
        this.rest.push(box);
        if (verschijn) this.tover(box);
      }
      (p.kaarten ?? []).forEach((k, i) => nieuw.push(this.nieuwDing(k.id, k.dagen, ind.kaarten[i], "kaart").box));
      if (p.orden) {
        ind.vakken.forEach((r) => {
          this.rest.push(this.vak(r.x, r.y, r.b, WAGON_H(this.km.kw) + 18));
        });
        p.orden.losse.forEach((dag, i) => nieuw.push(this.nieuwDing(dagNaam(dag), [dag], ind.losse[i], "los").box));
      }
      if (verschijn) nieuw.forEach((b, i) => this.tover(b, { vertraging: i * 80 }));
    }

    zet(p: TreinProps) {
      this.p = p;
      this.km = kaartMaat(p);
      const treinSig = JSON.stringify([p.nr, p.trein ?? null, !!p.treinKlein, !!p.staand]);
      const restSig = JSON.stringify([p.nr, p.plaatje ?? null, p.plaatjeStand === "sfeer", p.vandaagKaart ?? null, p.kaarten ?? [], p.orden ? [p.orden.vakken.length, p.orden.losse] : null, p.trein ? 1 : 0, !!p.staand]);
      const verschijn = p.nr !== this.nr;
      if (treinSig !== this.sig.trein) {
        const wasEr = !!this.treinGroep;
        this.bouwTrein(p);
        if (this.treinGroep && (verschijn || !wasEr)) this.tover(this.treinGroep);
        this.sig.trein = treinSig;
      }
      if (restSig !== this.sig.rest) {
        this.bouwRest(p, true);
        this.sig.rest = restSig;
      }
      this.nr = p.nr;
      this.pasTreinToe(p);
      this.pasRestToe(p);
    }

    pasRestToe(p: TreinProps) {
      const pb = this.plaatjeBeeld;
      if (pb && pb.img.active && p.plaatjeStand === "komt" && pb.stand !== "komt") {
        /* het verhaal naspelen: het plaatje komt dichtbij, springt even op, en er komen wolkjes */
        pb.stand = "komt";
        const img = pb.img;
        if (rustig) img.setScale(1 / TX).setAlpha(1);
        else {
          this.tweens.add({ targets: img, scale: 1 / TX, alpha: 1, duration: 650, ease: "Back.easeOut" });
          this.tweens.add({ targets: img, y: img.y - 26, delay: 650, duration: 160, yoyo: true, ease: "Sine.easeOut" });
          this.time.delayedCall(820, () => img.active && this.golf(img.x, img.y + 40, WARM));
        }
      }
      const ind = treinIndeling(p);
      const rand = (k: "wit" | "groen" | "rood" | "geel" | null, d: Ding) => {
        if (!k) return void d.ring.setVisible(false);
        const ringB = (d.id.includes(" en ") ? 2 * this.km.pw + 10 : this.km.kw) + 22;
        const ringH = WAGON_H(d.id.includes(" en ") ? this.km.pw : this.km.kw) + 26;
        d.ring.setTexture(this.randPlaatje(k, ringB, ringH)).setVisible(true);
      };
      for (const d of this.dingen.values()) {
        if (d.soort === "kaart") {
          /* Bij een fout geen rode rand (BOUWREGELS 5.3): het kaartje wordt dof en schudt. */
          rand(p.goed?.includes(d.id) ? "groen" : null, d);
          this.rondjeKaart(d, !!p.kaartLicht?.includes(d.id) && !p.goed?.includes(d.id));
          d.box.setAlpha(p.uit?.includes(d.id) || p.fout?.includes(d.id) ? 0.25 : 1);
        } else if (p.orden) {
          const vak = p.orden.vakken.findIndex((x) => x !== null && dagNaam(x) === d.id);
          const doel = vak >= 0 ? ind.vakken[vak] : d.r;
          if (this.druk?.d !== d && (d.box.x !== doel.x || d.box.y !== doel.y)) this.tweens.add({ targets: d.box, x: doel.x, y: doel.y, duration: rustig ? 1 : 220, ease: "Cubic.easeOut" });
          const u = vak >= 0 ? p.orden.uitslag?.[vak] : null;
          rand(u === true ? "groen" : u === false ? "wit" : null, d);
          this.rondjeKaart(d, u == null && !!p.kaartLicht?.includes(d.id));
          d.box.setDepth(vak >= 0 ? 1 : 2);
        }
      }
    }

    /** Het rode rondje om een kaart die Bliepo aanwijst (hoort bij de kaart, beweegt mee). */
    rondjeKaart(d: Ding, aan: boolean) {
      if (!aan && !d.rondjes) return;
      d.rondjes ??= maakRondjes(this, d.box, rustig);
      const paar = d.id.includes(" en ");
      const b = paar ? 2 * this.km.pw + 10 : this.km.kw;
      const h = WAGON_H(paar ? this.km.pw : this.km.kw);
      d.rondjes.zet(aan ? new Map([["kaart", { x: 0, y: 0, b, h }]]) : new Map());
    }

    schudDing(id: string) {
      const d = this.dingen.get(id);
      if (d) this.schud(d.box);
    }

    golfDing(id: string) {
      const d = this.dingen.get(id);
      if (d) this.golf(d.box.x, d.box.y);
    }

    speelHandje() {
      const p = this.p;
      if (!p?.orden || rustig) return;
      const ind = treinIndeling(p);
      const van = ind.losse[0];
      const naar = ind.vakken[p.orden.vakken.findIndex((x) => x === null)];
      if (!van || !naar) return;
      const h = this.plaats("handje", van.x + 10, van.y + 20).setDepth(30).setAlpha(0);
      this.tweens.chain({
        targets: h,
        tweens: [
          { alpha: 1, duration: 250 },
          { x: naar.x + 10, y: naar.y + 20, duration: 1100, ease: "Sine.easeInOut" },
          { alpha: 0, duration: 300, onComplete: () => h.destroy() },
        ],
      });
    }

    /* ---------- tikken, slepen, voorlezen ---------- */

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

    raak(x: number, y: number, alleenActief: boolean): Ding | null {
      const p = this.p;
      if (!p) return null;
      for (const d of [...this.dingen.values()].reverse()) {
        if (!binnen({ ...d.r, x: d.box.x, y: d.box.y }, x, y, 10)) continue;
        if (!alleenActief) return d;
        if (d.soort === "kaart" && p.kaartenActief && !p.uit?.includes(d.id)) return d;
        if (d.soort === "los" && p.orden?.actief && !p.orden.vakken.some((v) => v !== null && dagNaam(v) === d.id)) return d;
      }
      return null;
    }

    /** Ook de wagons in de trein lezen hun naam voor. */
    raakWagon(x: number, y: number): string | null {
      const p = this.p;
      if (!p?.trein || !this.treinGroep) return null;
      const m = treinMaat(p.trein.length, !!p.treinKlein, !!p.staand);
      const dx = this.treinGroep.x - VLAK_B / 2;
      const i = p.trein.findIndex((d, j) => d !== null && binnen({ x: m.x(j) + dx, y: m.y + m.ry(j), b: m.w, h: WAGON_H(m.w) }, x, y, 6));
      const d = i >= 0 ? p.trein[i] : null;
      return d === null ? null : dagNaam(d);
    }

    neer(p: Ptr) {
      const w = this.waar(p);
      clearTimeout(this.stemKlok);
      const d = this.raak(w.x, w.y, true);
      if (!d) {
        /* Lang drukken op een wagon of kaart die nu niet te tikken is: alleen voorlezen. */
        const naam = this.raak(w.x, w.y, false)?.id ?? this.raakWagon(w.x, w.y);
        if (naam && p.wasTouch) this.stemKlok = setTimeout(() => zegKeuze(naam), 500);
        return;
      }
      this.druk = { d, x0: w.x, y0: w.y, dx: d.box.x - w.x, dy: d.box.y - w.y, sleept: false, lang: false };
      if (p.wasTouch) {
        const druk = this.druk;
        this.stemKlok = setTimeout(() => {
          if (this.druk === druk && !druk.sleept) {
            druk.lang = true;
            zegKeuze(d.id);
          }
        }, 500);
      }
    }

    beweeg(p: Ptr) {
      const w = this.waar(p);
      const druk = this.druk;
      if (!druk) {
        if (!p.isDown && !p.wasTouch) {
          const naam = this.raak(w.x, w.y, false)?.id ?? this.raakWagon(w.x, w.y);
          if (naam !== this.zweef) {
            this.zweef = naam;
            clearTimeout(this.stemKlok);
            if (naam) this.stemKlok = setTimeout(() => zegKeuze(naam), 300);
          }
          const actief = this.raak(w.x, w.y, true);
          this.input.setDefaultCursor(actief ? (actief.soort === "los" ? "grab" : "pointer") : "default");
        }
        return;
      }
      if (!druk.sleept && Math.hypot(w.x - druk.x0, w.y - druk.y0) > 9) {
        druk.sleept = true;
        clearTimeout(this.stemKlok);
        if (druk.d.soort === "los") {
          druk.d.box.setDepth(10);
          this.input.setDefaultCursor("grabbing");
        }
      }
      if (druk.sleept && druk.d.soort === "los") druk.d.box.setPosition(w.x + druk.dx, w.y + druk.dy);
    }

    los() {
      const druk = this.druk;
      this.druk = null;
      clearTimeout(this.stemKlok);
      if (!druk) return;
      this.input.setDefaultCursor("default");
      const d = druk.d;
      if (druk.lang && !druk.sleept) return;
      if (d.soort === "kaart") {
        if (!druk.sleept) this.melder({ soort: "kaart", id: d.id });
        return;
      }
      if (!this.p?.orden) return;
      if (!druk.sleept) return void this.melder({ soort: "leg", id: d.id, vak: null });
      const ind = treinIndeling(this.p);
      const vak = ind.vakken.findIndex((r, i) => this.p!.orden!.vakken[i] === null && binnen(r, d.box.x, d.box.y, 34));
      if (vak >= 0) this.melder({ soort: "leg", id: d.id, vak });
      clearTimeout(this.terugKlok);
      this.terugKlok = setTimeout(() => {
        if (this.p) this.pasRestToe(this.p);
      }, vak >= 0 ? 260 : 0);
    }

    sleepPunt() {
      return null;
    }

    /** Voor de vloeiendheidscontrole: wagons lichten op zoals bij Bliepo's uitleg, met een lichtgolf. */
    demo(ms: number) {
      const eind = performance.now() + ms;
      const lijst = [...this.wagons.values()];
      let i = 0;
      const stap = () => {
        if (performance.now() > eind || !lijst.length) return;
        const w = lijst[i++ % lijst.length];
        const m = this.p?.trein ? treinMaat(this.p.trein.length, !!this.p.treinKlein, !!this.p.staand) : null;
        if (m && this.p?.trein && this.treinRondjes) {
          const idx = this.p.trein.findIndex((dg) => dg !== null && this.wagons.get(dg) === w);
          if (idx >= 0) this.treinRondjes.zet(this.rondjeVakken({ ...this.p, licht: [this.p.trein[idx] as number] }, m));
        }
        if (this.treinGroep) this.golf(this.treinGroep.x + w.x, this.treinGroep.y + w.y);
        this.time.delayedCall(450, stap);
      };
      stap();
    }
  }
  return Trein as unknown as new () => import("phaser").Scene;
}

function letter() {
  const el = document.querySelector("[data-squla-tijd]");
  return el ? getComputedStyle(el).fontFamily : "system-ui, sans-serif";
}

/* ---------- het vlak ---------- */

export function SqulaTijdTrein(alle: TreinProps & Vlakbasis) {
  /* Staand scherm (telefoon rechtop): de trein in 2 rijen en grotere kaarten (BOUWREGELS 1.24). Eén keer bij het begin. */
  const [staand] = useState(() => typeof window !== "undefined" && window.innerHeight > window.innerWidth);
  const props = { ...alle, staand };
  const { meld, schaal } = props;
  const { plek, scene } = useHoloMotor<TreinScene>(schaal, maakScene, { invoer: true });
  const meldRef = useRef(meld);
  useEffect(() => {
    meldRef.current = meld;
  }, [meld]);

  useEffect(() => {
    scene?.verbind((g) => meldRef.current(g));
  }, [scene]);

  const { nr, trein, treinKlein, licht, vandaag, stappen, plaatje, vandaagKaart, kaarten, kaartenActief, uit, goed, fout, kaartLicht, orden, plaatjeStand } = props;
  const stand = JSON.stringify({ nr, trein, treinKlein, licht, vandaag, stappen, plaatje, vandaagKaart, kaarten, kaartenActief, uit, goed, fout, kaartLicht, orden, plaatjeStand, staand });
  useEffect(() => {
    if (scene) scene.zet(JSON.parse(stand) as TreinProps);
  }, [scene, stand]);

  const rit = props.rit;
  useEffect(() => {
    if (scene && rit) scene.rijIn();
  }, [scene, rit]);
  const schudNr = props.schud?.n;
  useEffect(() => {
    if (scene && props.schud) scene.schudDing(props.schud.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, schudNr]);
  const golfNr = props.golf?.n;
  useEffect(() => {
    if (scene && props.golf) scene.golfDing(props.golf.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, golfNr]);
  const handje = props.handje;
  useEffect(() => {
    if (scene && handje) scene.speelHandje();
  }, [scene, handje]);

  useEffect(() => {
    haalKeuzesAlvast(DAGEN.map((d) => d.naam));
  }, []);

  const ind = treinIndeling(props);
  const knoppen: { id: string; r: Rect; doe: () => void }[] = [];
  if (kaartenActief) (kaarten ?? []).forEach((k, i) => !uit?.includes(k.id) && knoppen.push({ id: k.id, r: ind.kaarten[i], doe: () => meld({ soort: "kaart", id: k.id }) }));
  if (orden?.actief)
    orden.losse.forEach((dag, i) => !orden.vakken.includes(dag) && knoppen.push({ id: dagNaam(dag), r: ind.losse[i], doe: () => meld({ soort: "leg", id: dagNaam(dag), vak: null }) }));

  return (
    <div className={s.vlak} data-squla-tijd="">
      <div ref={plek} style={{ ...HOLO_CANVAS, touchAction: "none" }} aria-hidden />
      <div data-knop="keuzes" className={s.knoppen}>
        {knoppen.map((k) => (
          <button
            key={k.id}
            type="button"
            className={s.ding}
            data-ding={k.id}
            aria-label={k.id}
            style={{ left: k.r.x - k.r.b / 2, top: k.r.y - k.r.h / 2, width: k.r.b, height: k.r.h }}
            onFocus={(e) => {
              if (e.currentTarget.matches(":focus-visible")) zegKeuze(k.id);
            }}
            onClick={k.doe}
          >
            <span className={s.verborgen}>{k.id}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/** De tekening op de kaart aan het eind: dezelfde weektrein als de voorbeeldles. */
export { KaartWeektrein } from "./squla-dagen-trein";
