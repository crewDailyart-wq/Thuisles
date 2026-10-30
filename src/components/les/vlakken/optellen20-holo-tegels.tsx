"use client";

/**
 * Optellen tot 20 als hologrammen (27 oktober 2026, LESSENPLAN.md O11–O15;
 * BOUWEN-PHASER.md). Eén Phaser-vlak voor de vijf lessen van het onderdeel,
 * in plaats van het tegelraster van het lesscherm en het oude tegelbord
 * (`optellen20-tegelbord.tsx`, blijft bestaan):
 *
 * - geen raster en geen bord: de getaltegels zweven als gloeiende hologrammen
 *   vóór de blauwe ruimte en verschijnen met een lichtstraal uit de vloer;
 * - tegels staan als toren (rechtop) of liggen als strook van twee rijen
 *   (9 + 4 boven een liggende 10, zoals Synthesis "Add Across 10"); een oneven
 *   tegel na een oneven tegel valt precies in de inham (../tegels.ts);
 * - een oplichtend leeg plekje waar één blokje moet komen ("maak van de 5 een 6");
 * - de bak rechts (links van Bliepo): tik op een tegel, of sleep hem naar
 *   links; het doel licht warm op zolang het kind een tegel moet kiezen; een
 *   tegel die je naast het doel loslaat, glijdt terug;
 * - grote cijferknoppen onderaan met het vraagteken (weet ik niet) en het
 *   vinkje (controleer): eerst kiezen, dan het vinkje (zoals Synthesis);
 * - Bliepo telt samen: getallen verschijnen één voor één in de hokjes.
 *
 * De getaltegels zijn voorlopig die van Synthesis (LATER VERVANGEN door de
 * parelplanken uit LESSENPLAN.md, zie vragen-voor-later/later-vervangen/optellen20.md).
 *
 * Meldingen: `{ soort: "tegel", n }` (een tegel gekozen, alleen als `actief`) en
 * `{ soort: "antwoord", waarde }` (`null` = weet ik niet).
 */

import { useEffect, useRef, useState } from "react";
import type { Vlakbasis } from "../soort";
import { TEGELKLEUR, hoogte, stapel, vorm } from "../tegels";
import { holoBasis, TX, VLAK_B, VLAK_H, WARM } from "../holo/basis";
import { HOLO_CANVAS, useHoloMotor } from "../holo/motor";
import { IkoonKnop } from "../ikonen";
import { keuzeStem, useKeuzesAlvast } from "../keuzestem";
import { CEL, MIDDEN_KOLOM, OX, OY } from "./optellen20-holo-maten";
import s from "./optellen20-holo.module.css";

/* ---------- maten (punten van het vlak, 980 × 720) ---------- */

/** De bak: rechts in het vlak, links van Bliepo. */
const BAK = { x0: 696, x1: 952, y0: 112, y1: 560 };
/** Alles links van de bak en boven de knoppen is "het vak": daar mag een tegel neer. */
const VAK_RECHTS = BAK.x0 - 16;
const VAK_ONDER = 576;

/* ---------- soorten ---------- */

/** Een rij tegels: staand als toren, of liggend als strook van twee rijen. */
export type HoloStrook = {
  /** Vaste sleutel, zodat een nieuw stuk netjes verschijnt en een oud stuk blijft staan. */
  id: string;
  stukken: number[];
  /** De linkerkolom (in hokjes, mag een half hokje zijn). */
  kolom: number;
  /** Staand: de onderste rij van de toren. Liggend: de bovenste van de twee rijen. */
  rij: number;
  liggend?: boolean;
  /** Een oplichtend leeg hokje waar een losse 1 precies in zou passen. */
  plekje?: boolean;
  /** Het laatste stuk lost op (een tegel die niet past, gaat weer weg). */
  wegLaatste?: boolean;
};

/** Waar de gekozen tegel komt: licht warm op zolang het kind moet kiezen. In hokjes. */
export type HoloDoel = { kolom: number; rij: number; b: number; h: number };

export type HoloKeuzes = {
  /** Nummer van de vraag: bij een nieuw nummer is er nog niets gekozen. */
  vraag: number;
  opties: (number | string)[];
  /** Al fout gekozen: grijs (minder keuzes als hulp). */
  uit?: (number | string)[];
};

export type Holo20Props = {
  stroken: HoloStrook[];
  bak: number[];
  /** Tegels in de bak die dof zijn en niet te pakken. */
  slot?: number[];
  /** De tegels in de bak liggen. */
  bakLiggend?: boolean;
  /** Het kind mag een tegel kiezen. */
  actief?: boolean;
  /** Een handje laat zien hoe je een tegel naar het doel sleept. */
  hand?: boolean;
  doel?: HoloDoel | null;
  /** Bliepo telt: de hokjes 1 t/m `tel` krijgen een getal. */
  tel?: number;
  /** Het logboekje linksboven ("5 + 5 = 10", "5 + 6 = ?"). */
  logboek?: { a: number; b: number; c: number | null }[];
  keuzes?: HoloKeuzes | null;
  /**
   * Teken het vinkje en het vraagteken bij de keuzes in het vlak zelf (de oude
   * plek). Standaard uit: ze staan op de vaste plek onder de zin van Bliepo
   * (28 oktober 2026); het vlak meldt dan alleen `gekozen`.
   */
  knoppenInVlak?: boolean;
  /** Telt op bij elk goed antwoord: een rustige lichtgolf over de tegels. */
  golf?: number;
};

export type Holo20Melding =
  | { soort: "tegel"; n: number }
  | { soort: "antwoord"; waarde: number | string | null }
  /** Een keuze aangetikt (nog niet bevestigd), voor het vinkje op de vaste plek. */
  | { soort: "gekozen"; waarde: number | string };

/* ---------- vormen ---------- */

type Cel = { x: number; y: number };

/** De hokjes van een strook, per stuk, in hokjes (linksboven van elk hokje). */
function strookHokjes(st: HoloStrook): Cel[][] {
  return stapel(st.stukken).map((stuk) =>
    stuk.map((hk) => (st.liggend ? { x: st.kolom + hk.r, y: st.rij + (hk.k === 1 ? 1 : 0) } : { x: st.kolom + hk.k, y: st.rij - hk.r })),
  );
}

function plekjeVan(st: HoloStrook): Cel | null {
  const stukken = strookHokjes({ ...st, stukken: [...st.stukken, 1] });
  return stukken[stukken.length - 1]?.[0] ?? null;
}

/** De hokjes van één losse tegel (bak, sleepbeeld), linksboven = 0. */
function losseHokjes(n: number, liggend: boolean): Cel[] {
  const h = hoogte(n);
  return vorm(n).map((hk) => (liggend ? { x: hk.r, y: hk.k === 1 ? 1 : 0 } : { x: hk.k, y: h - 1 - hk.r }));
}

const px = (x: number) => OX + x * CEL;
const py = (y: number) => OY + y * CEL;

/** Alle hokjes in de volgorde waarin Bliepo telt: per strook, per stuk, van onder naar boven. */
export function telPlekken(stroken: HoloStrook[]): { x: number; y: number }[] {
  return stroken.flatMap((st) => strookHokjes(st).flat().map((c) => ({ x: px(c.x), y: py(c.y) })));
}

/** Plek en grootte van de tegels in de bak (1 tot 3 kolommen, zo groot mogelijk). */
function legBak(tegels: number[], liggend: boolean) {
  const maat = (n: number) => (liggend ? { b: hoogte(n), h: 2 } : { b: 2, h: hoogte(n) });
  const W = BAK.x1 - BAK.x0;
  const H = BAK.y1 - BAK.y0;
  const gat = 14;
  const max = liggend ? 36 : 44;
  let beste = { c: 0, k: 1 };
  for (let k = 1; k <= 3; k++) {
    const kol = Array.from({ length: k }, (_, j) => tegels.filter((_, i) => i % k === j));
    const breed = Math.max(1, ...tegels.map((n) => maat(n).b));
    const hoog = Math.max(1, ...kol.map((ts) => ts.reduce((a, n) => a + maat(n).h, 0)));
    const meesteGaten = Math.max(0, ...kol.map((ts) => ts.length - 1));
    const c = Math.min(max, (W - gat * (k - 1)) / (k * breed), (H - gat * meesteGaten) / hoog);
    if (c > beste.c + 0.5) beste = { c, k };
  }
  const c = Math.floor(beste.c);
  const k = beste.k;
  const kolB = (W - gat * (k - 1)) / k;
  const plekken: { n: number; x: number; y: number; b: number; h: number }[] = [];
  for (let j = 0; j < k; j++) {
    const ts = tegels.filter((_, i) => i % k === j);
    const totaal = ts.reduce((a, n) => a + maat(n).h * c, 0) + gat * Math.max(0, ts.length - 1);
    let y = (BAK.y0 + BAK.y1) / 2 - totaal / 2;
    const midX = BAK.x0 + j * (kolB + gat) + kolB / 2;
    for (const n of ts) {
      const m = maat(n);
      plekken.push({ n, x: midX - (m.b * c) / 2, y, b: m.b * c, h: m.h * c });
      y += m.h * c + gat;
    }
  }
  return { c, plekken };
}

/* ---------- plaatjes ---------- */

function kleurGetal(hex: string) {
  return parseInt(hex.slice(1), 16);
}

function mengWit(hex: string, f: number) {
  const n = kleurGetal(hex);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const m = (x: number) => Math.round(x + (255 - x) * f);
  return `rgb(${m(r)},${m(g)},${m(b)})`;
}

function mengDonker(hex: string, f: number) {
  const n = kleurGetal(hex);
  const m = (x: number) => Math.round(x * (1 - f));
  return `rgb(${m((n >> 16) & 255)},${m((n >> 8) & 255)},${m(n & 255)})`;
}

/** Eén hokje als hologram: de kleur van de tegel, een licht randje, lichtlijntjes en het gaatje. */
function tekenHokje(c: CanvasRenderingContext2D, hex: string) {
  const m = 2;
  const z = CEL - 2 * m;
  const pad = () => {
    c.beginPath();
    c.roundRect(m, m, z, z, 7);
  };
  const g = c.createLinearGradient(0, m, 0, m + z);
  g.addColorStop(0, mengWit(hex, 0.28));
  g.addColorStop(0.45, hex);
  g.addColorStop(1, mengDonker(hex, 0.12));
  pad();
  c.globalAlpha = 0.94;
  c.fillStyle = g;
  c.fill();
  c.globalAlpha = 1;
  /* Een paar dunne lichtlijntjes (hologram), heel zacht. */
  c.save();
  pad();
  c.clip();
  c.strokeStyle = "rgba(255,255,255,0.08)";
  c.lineWidth = 1;
  for (let y = m + 4; y < m + z; y += 6) {
    c.beginPath();
    c.moveTo(m, y);
    c.lineTo(m + z, y);
    c.stroke();
  }
  c.restore();
  pad();
  c.strokeStyle = mengWit(hex, 0.6);
  c.lineWidth = 1.6;
  c.stroke();
  /* het gaatje */
  c.beginPath();
  c.arc(CEL / 2, CEL / 2, 10.5, 0, Math.PI * 2);
  c.fillStyle = "#0a1430";
  c.fill();
  c.strokeStyle = "rgba(255,255,255,0.22)";
  c.lineWidth = 1.4;
  c.stroke();
}

function tekenStippelvlak(c: CanvasRenderingContext2D, b: number, h: number, vulling: number) {
  c.beginPath();
  c.roundRect(4, 4, b - 8, h - 8, 10);
  c.fillStyle = `rgba(255,211,110,${vulling})`;
  c.fill();
  c.setLineDash([10, 8]);
  c.lineWidth = 3;
  c.strokeStyle = "rgba(255,221,140,0.95)";
  c.stroke();
}

/** Het handje (zelfde vorm als in het lesscherm). */
const HAND =
  "M18 22V9.5a3 3 0 0 1 6 0V20l1-.2V17a3 3 0 0 1 6 0v3.5a3 3 0 0 1 5.5 1.6v2.7a3 3 0 0 1 5 2.2V33c0 7-5 12-12 12h-3c-4 0-6.5-1.7-9-5l-6-8a3.1 3.1 0 0 1 4.6-4.1L18 30z";

/* ---------- de scène ---------- */

type Stand = {
  stroken: HoloStrook[];
  bak: number[];
  slot: number[];
  bakLiggend: boolean;
  actief: boolean;
  hand: boolean;
  doel: HoloDoel | null;
  golf: number;
};

interface TegelScene {
  zet(st: Stand): void;
  /** Wat er gebeurt als het kind een tegel kiest. */
  koppel(opTegel: (n: number) => void): void;
}

type Container = import("phaser").GameObjects.Container;
type Img = import("phaser").GameObjects.Image;

function maakTegelScene() {
  return (Phaser: typeof import("phaser"), rustig: boolean) => {
    const Basis = holoBasis(Phaser, rustig);
    class Tegels extends Basis implements TegelScene {
      opTegel: ((n: number) => void) | null = null;
      stand: Stand | null = null;
      stukken = new Map<string, { c: Container; x: number; y: number }>();
      plekjes = new Map<string, Img>();
      bakDelen: { n: number; x: number; y: number; b: number; h: number; c: Container }[] = [];
      bakSleutel = "";
      doelBeeld: { sleutel: string; beeld: Img } | null = null;
      handBeeld: Img | null = null;
      handGezien = false;
      golfNr = 0;
      sleep: null | { n: number; ghost: Container; vanX: number; vanY: number; bewogen: boolean; deel: Container; terugX: number; terugY: number } = null;

      constructor() {
        super("optellen20");
      }

      koppel(opTegel: (n: number) => void) {
        this.opTegel = opTegel;
      }

      maak() {
        for (let n = 1; n <= 10; n++) {
          this.canvasPlaatje(`hok${n}`, CEL, CEL, (c) => tekenHokje(c, TEGELKLEUR[n]));
          this.bak(`hok${n}`, `hok${n}g`, kleurGetal(TEGELKLEUR[n]));
        }
        this.canvasPlaatje("plekje", CEL, CEL, (c) => tekenStippelvlak(c, CEL, CEL, 0.16));
        this.bak("plekje", "plekje-g", WARM);
        this.canvasPlaatje("hand", 48, 48, (c) => {
          const p = new Path2D(HAND);
          c.fillStyle = "#ffffff";
          c.fill(p);
          c.strokeStyle = "#1b2233";
          c.lineWidth = 2;
          c.lineJoin = "round";
          c.stroke(p);
        });

        /*
          Waar de vinger of muis is, in punten van het vlak. Rechtstreeks uit
          de gebeurtenis en de plek van het canvas op het scherm: Phaser
          onthoudt de maat van het canvas van vóór het lesscherm het vlak op
          schaal zette, waardoor pointer.worldX ernaast zat.
        */
        const punt = (p: import("phaser").Input.Pointer) => {
          const e = p.event as MouseEvent | TouchEvent | undefined;
          const r = this.game.canvas.getBoundingClientRect();
          let cx: number;
          let cy: number;
          if (e && "changedTouches" in e && e.changedTouches.length) {
            cx = e.changedTouches[0].clientX;
            cy = e.changedTouches[0].clientY;
          } else if (e && "clientX" in e) {
            cx = e.clientX;
            cy = e.clientY;
          } else {
            p.updateWorldPoint(this.cameras.main);
            return { x: p.worldX, y: p.worldY };
          }
          return { x: ((cx - r.left) / r.width) * VLAK_B, y: ((cy - r.top) / r.height) * VLAK_H };
        };
        this.input.on("pointerdown", (p: import("phaser").Input.Pointer) => this.neer(punt(p)));
        this.input.on("pointermove", (p: import("phaser").Input.Pointer) => this.beweeg(punt(p)));
        this.input.on("pointerup", (p: import("phaser").Input.Pointer) => this.los(punt(p)));
        this.input.on("pointerupoutside", (p: import("phaser").Input.Pointer) => this.los(punt(p)));
      }

      /* ---------- een tegel als groep hokjes, met het midden als oorsprong ---------- */

      maakStuk(n: number, cellen: Cel[], c = CEL) {
        const minX = Math.min(...cellen.map((h) => h.x));
        const maxX = Math.max(...cellen.map((h) => h.x));
        const minY = Math.min(...cellen.map((h) => h.y));
        const maxY = Math.max(...cellen.map((h) => h.y));
        const mx = ((minX + maxX + 1) / 2) * c;
        const my = ((minY + maxY + 1) / 2) * c;
        const groep = this.add.container(0, 0);
        for (const h of cellen) {
          const beeld = this.plaats(`hok${n}g`, h.x * c + c / 2 - mx, h.y * c + c / 2 - my);
          beeld.setScale((c / CEL) / TX);
          groep.add(beeld);
        }
        return { groep, b: (maxX - minX + 1) * c, h: (maxY - minY + 1) * c };
      }

      /* ---------- de stand van het vlak ---------- */

      zet(st: Stand) {
        this.stand = st;
        this.zetStukken(st);
        this.zetPlekjes(st);
        this.zetBak(st);
        this.zetDoel(st);
        this.zetHand(st);
        if (st.golf > this.golfNr) {
          this.golfNr = st.golf;
          const m = this.midden();
          this.golf(m.x, m.y);
        }
      }

      midden() {
        let x0 = Infinity;
        let x1 = -Infinity;
        let y0 = Infinity;
        let y1 = -Infinity;
        for (const { x, y } of this.stukken.values()) {
          x0 = Math.min(x0, x);
          x1 = Math.max(x1, x);
          y0 = Math.min(y0, y);
          y1 = Math.max(y1, y);
        }
        return x0 === Infinity ? { x: 418, y: 340 } : { x: (x0 + x1) / 2, y: (y0 + y1) / 2 };
      }

      zetStukken(st: Stand) {
        const gewenst = new Map<string, { n: number; cellen: Cel[]; x: number; y: number; weg: boolean }>();
        for (const strook of st.stroken) {
          const per = strookHokjes(strook);
          per.forEach((hok, i) => {
            if (!hok.length) return;
            const n = strook.stukken[i];
            const vorm = hok.map((h) => `${h.x - hok[0].x},${h.y - hok[0].y}`).join(";");
            const sleutel = `${strook.id}|${i}|${n}|${strook.liggend ? "l" : "s"}|${vorm}`;
            const minX = Math.min(...hok.map((h) => h.x));
            const maxX = Math.max(...hok.map((h) => h.x));
            const minY = Math.min(...hok.map((h) => h.y));
            const maxY = Math.max(...hok.map((h) => h.y));
            gewenst.set(sleutel, {
              n,
              cellen: hok.map((h) => ({ x: h.x - minX, y: h.y - minY })),
              x: px(minX) + ((maxX - minX + 1) * CEL) / 2,
              y: py(minY) + ((maxY - minY + 1) * CEL) / 2,
              weg: !!strook.wegLaatste && i === per.length - 1,
            });
          });
        }
        for (const [sleutel, stuk] of [...this.stukken]) {
          const w = gewenst.get(sleutel);
          if (!w || w.weg) {
            this.stukken.delete(sleutel);
            this.verdwijn(stuk.c);
          }
        }
        for (const [sleutel, w] of gewenst) {
          if (w.weg) continue;
          const er = this.stukken.get(sleutel);
          if (er) {
            if (er.x !== w.x || er.y !== w.y) {
              er.x = w.x;
              er.y = w.y;
              this.tweens.add({ targets: er.c, x: w.x, y: w.y, duration: this.rustig ? 1 : 320, ease: "Cubic.easeInOut" });
            }
            continue;
          }
          const { groep } = this.maakStuk(w.n, w.cellen);
          groep.setPosition(w.x, w.y);
          this.stukken.set(sleutel, { c: groep, x: w.x, y: w.y });
          this.tover(groep);
        }
      }

      zetPlekjes(st: Stand) {
        const gewenst = new Map<string, Cel>();
        for (const strook of st.stroken) {
          if (!strook.plekje) continue;
          const p = plekjeVan(strook);
          if (p) gewenst.set(`${strook.id}|${p.x},${p.y}`, p);
        }
        for (const [k, beeld] of [...this.plekjes]) {
          if (!gewenst.has(k)) {
            this.plekjes.delete(k);
            beeld.destroy();
          }
        }
        for (const [k, p] of gewenst) {
          if (this.plekjes.has(k)) continue;
          const beeld = this.plaats("plekje-g", px(p.x) + CEL / 2, py(p.y) + CEL / 2);
          if (!this.rustig) this.tweens.add({ targets: beeld, alpha: { from: 1, to: 0.45 }, duration: 700, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
          this.plekjes.set(k, beeld);
        }
      }

      zetBak(st: Stand) {
        const sleutel = `${st.bak.join(",")}|${st.bakLiggend}`;
        if (sleutel !== this.bakSleutel) {
          this.bakSleutel = sleutel;
          this.bakDelen.forEach((d) => d.c.destroy());
          const leg = legBak(st.bak, st.bakLiggend);
          this.bakDelen = leg.plekken.map((p) => {
            const { groep } = this.maakStuk(p.n, losseHokjes(p.n, st.bakLiggend), leg.c);
            groep.setPosition(p.x + p.b / 2, p.y + p.h / 2);
            if (!this.rustig) {
              groep.setAlpha(0);
              this.tweens.add({ targets: groep, alpha: 1, duration: 260 });
            }
            return { ...p, c: groep };
          });
        }
        /* Voor de automatische test: waar de pakbare tegels liggen (punten van het vlak). */
        window.__phaser = {
          ...window.__phaser,
          bak: this.bakDelen.filter((d) => st.actief && !st.slot.includes(d.n)).map((d) => ({ n: d.n, x: d.x + d.b / 2, y: d.y + d.h / 2 })),
        };
        for (const d of this.bakDelen) {
          const pakbaar = st.actief && !st.slot.includes(d.n);
          const doel = st.slot.includes(d.n) ? 0.28 : pakbaar ? 1 : 0.6;
          this.tweens.killTweensOf(d.c);
          d.c.setAlpha(doel);
        }
      }

      zetDoel(st: Stand) {
        const d = st.actief ? st.doel : null;
        const sleutel = d ? `${d.kolom},${d.rij},${d.b},${d.h}` : "";
        if (this.doelBeeld?.sleutel === sleutel) return;
        this.doelBeeld?.beeld.destroy();
        this.doelBeeld = null;
        if (!d) return;
        const b = d.b * CEL + 20;
        const h = d.h * CEL + 20;
        const naam = `doel-${d.b}-${d.h}`;
        this.canvasPlaatje(naam, b, h, (c) => tekenStippelvlak(c, b, h, 0.07));
        this.bak(naam, `${naam}-g`, WARM);
        const beeld = this.plaats(`${naam}-g`, px(d.kolom) + (d.b * CEL) / 2, py(d.rij) + (d.h * CEL) / 2);
        beeld.setDepth(-1);
        if (!this.rustig) this.tweens.add({ targets: beeld, alpha: { from: 1, to: 0.5 }, duration: 900, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
        this.doelBeeld = { sleutel, beeld };
      }

      zetHand(st: Stand) {
        const eerste = this.bakDelen.find((d) => !st.slot.includes(d.n));
        const aan = st.hand && st.actief && !this.handGezien && !!eerste && !this.rustig;
        if (!aan) {
          this.handBeeld?.destroy();
          this.handBeeld = null;
          return;
        }
        if (this.handBeeld || !eerste) return;
        const naar = st.doel
          ? { x: px(st.doel.kolom) + (st.doel.b * CEL) / 2, y: py(st.doel.rij) + (st.doel.h * CEL) / 2 }
          : { x: 418, y: 360 };
        const van = { x: eerste.x + eerste.b / 2 + 8, y: eerste.y + eerste.h / 2 + 10 };
        const hand = this.plaats("hand", van.x, van.y).setScale(1.5 / TX).setDepth(10).setAlpha(0);
        this.handBeeld = hand;
        this.tweens.chain({
          targets: hand,
          loop: -1,
          tweens: [
            { alpha: 1, x: van.x, y: van.y, duration: 300 },
            { x: naar.x, y: naar.y, duration: 1100, ease: "Sine.easeInOut", delay: 200 },
            { alpha: 0, duration: 300, delay: 250 },
          ],
        });
      }

      /* ---------- slepen en tikken ---------- */

      raak(x: number, y: number) {
        const st = this.stand;
        if (!st?.actief) return null;
        return this.bakDelen.find((d) => !st.slot.includes(d.n) && x >= d.x - 10 && x <= d.x + d.b + 10 && y >= d.y - 10 && y <= d.y + d.h + 10) ?? null;
      }

      neer(p: { x: number; y: number }) {
        const deel = this.raak(p.x, p.y);
        if (!deel || this.sleep) return;
        this.handGezien = true;
        this.handBeeld?.destroy();
        this.handBeeld = null;
        const liggend = !!this.stand?.bakLiggend;
        const { groep } = this.maakStuk(deel.n, losseHokjes(deel.n, liggend), CEL * 0.8);
        groep.setPosition(p.x, p.y).setAlpha(0).setDepth(20);
        deel.c.setAlpha(0.35);
        this.sleep = { n: deel.n, ghost: groep, vanX: p.x, vanY: p.y, bewogen: false, deel: deel.c, terugX: deel.x + deel.b / 2, terugY: deel.y + deel.h / 2 };
      }

      beweeg(p: { x: number; y: number }) {
        const sl = this.sleep;
        if (!sl) {
          this.input.setDefaultCursor(this.raak(p.x, p.y) ? "grab" : "default");
          return;
        }
        sl.ghost.setPosition(p.x, p.y);
        if (!sl.bewogen && Math.hypot(p.x - sl.vanX, p.y - sl.vanY) > 8) {
          sl.bewogen = true;
          sl.ghost.setAlpha(0.92);
          this.input.setDefaultCursor("grabbing");
        }
      }

      los(p: { x: number; y: number }) {
        const sl = this.sleep;
        if (!sl) return;
        this.sleep = null;
        this.input.setDefaultCursor("default");
        const opVak = p.x < VAK_RECHTS && p.y < VAK_ONDER && p.y > 60;
        if (!sl.bewogen || opVak) {
          sl.ghost.destroy();
          sl.deel.setAlpha(1);
          this.opTegel?.(sl.n);
          return;
        }
        /* Naast het doel losgelaten: de tegel glijdt terug naar de bak. */
        this.tweens.add({
          targets: sl.ghost,
          x: sl.terugX,
          y: sl.terugY,
          alpha: 0,
          duration: this.rustig ? 1 : 280,
          ease: "Cubic.easeOut",
          onComplete: () => {
            sl.ghost.destroy();
            if (this.stand) this.zetBak(this.stand);
          },
        });
      }

      /** Voor `npm run vloeiend`: een 10 en een kleine tegel verschijnen, een lichtgolf, en weer weg. */
      demo(ms: number) {
        const eind = performance.now() + ms;
        let n = 1;
        const basis: Stand = { stroken: [], bak: [2, 4, 6, 8, 10], slot: [], bakLiggend: false, actief: true, hand: false, doel: null, golf: this.golfNr };
        const stap = () => {
          if (performance.now() > eind) return;
          const k = (n++ % 9) + 1;
          this.zet({
            ...basis,
            stroken: [
              { id: "demo-a", stukken: [10], kolom: MIDDEN_KOLOM - 2.25, rij: 6 },
              { id: "demo-b", stukken: [k], kolom: MIDDEN_KOLOM + 0.25, rij: 6 },
            ],
          });
          this.time.delayedCall(450, () => this.zet({ ...basis, stroken: this.stand?.stroken ?? [], golf: this.golfNr + 1 }));
          this.time.delayedCall(800, () => this.zet({ ...basis, stroken: [{ id: "demo-a", stukken: [10], kolom: MIDDEN_KOLOM - 2.25, rij: 6 }] }));
          this.time.delayedCall(950, stap);
        };
        stap();
      }
    }
    return Tegels as unknown as new () => import("phaser").Scene;
  };
}

/* ---------- de keuzeknoppen ---------- */

function Keuzes({ k, meld, inVlak }: { k: HoloKeuzes; meld: Vlakbasis["meld"]; inVlak: boolean }) {
  const [gekozen, setGekozen] = useState<number | string | null>(null);
  const [klaar, setKlaar] = useState(false);
  const uit = k.uit ?? [];
  const stuur = (waarde: number | string | null) => {
    if (klaar) return;
    setKlaar(true);
    meld({ soort: "antwoord", waarde });
  };
  useKeuzesAlvast(k.opties.map(String));
  return (
    <div className={s.keuzerij}>
      <div className={s.opties} data-knop="keuzes">
        {k.opties.map((o) => {
          const isUit = uit.includes(o);
          return (
            <button
              key={String(o)}
              type="button"
              className={`${s.optie} ${typeof o === "string" ? s.woord : ""} ${gekozen === o ? s.gekozen : ""} ${isUit ? s.uit : ""}`}
              disabled={isUit || klaar}
              aria-pressed={gekozen === o}
              aria-label={String(o)}
              data-keuze={isUit ? "uit" : ""}
              {...keuzeStem(String(o))}
              onClick={() => {
                setGekozen(o);
                if (!inVlak) meld({ soort: "gekozen", waarde: o });
                /* Een tik kiest alleen; voorlezen via muis, lang indrukken of het luidsprekertje (30 oktober 2026). */
              }}
            >
              {o}
            </button>
          );
        })}
      </div>
      {inVlak && (
        <>
          <IkoonKnop ikoon="vraag" label="Weet ik niet" knop="weetniet" className={s.ikoon} disabled={klaar} onClick={() => stuur(null)} />
          <IkoonKnop
            ikoon="vink"
            label="Controleer"
            knop="controleer"
            kleur="blauw"
            className={s.ikoon}
            disabled={gekozen === null || klaar}
            onClick={() => stuur(gekozen)}
          />
        </>
      )}
    </div>
  );
}

/* ---------- het vlak ---------- */

export function Optellen20HoloTegels(p: Holo20Props & Vlakbasis) {
  const { stroken, bak, slot, bakLiggend = false, actief = false, hand = false, doel = null, tel = 0, logboek, keuzes = null, golf = 0, knoppenInVlak = false, meld, schaal } = p;
  const { plek, scene } = useHoloMotor<TegelScene>(schaal, maakTegelScene(), { invoer: true });
  const meldRef = useRef(meld);
  useEffect(() => {
    meldRef.current = meld;
  }, [meld]);

  useEffect(() => {
    scene?.koppel((n) => meldRef.current({ soort: "tegel", n }));
  }, [scene]);

  useEffect(() => {
    scene?.zet({ stroken, bak, slot: slot ?? [], bakLiggend, actief, hand, doel, golf });
  }, [scene, stroken, bak, slot, bakLiggend, actief, hand, doel, golf]);

  const telLijst = tel > 0 ? telPlekken(stroken).slice(0, tel) : [];

  return (
    <div className={s.vlak}>
      <div ref={plek} style={HOLO_CANVAS} data-holo="optellen20" aria-hidden />

      {telLijst.map((t, i) => (
        <span key={`${i}-${t.x}-${t.y}`} className={s.tel} style={{ left: t.x, top: t.y }}>
          {i + 1}
        </span>
      ))}

      {logboek && logboek.length > 0 && (
        <div className={s.logboek} aria-hidden>
          {logboek.map((r, i) => (
            <div key={`${r.a}-${r.b}-${r.c}-${i}`}>
              <span style={{ color: TEGELKLEUR[r.a] }}>{r.a}</span>
              <span className={s.grijs}> + </span>
              <span style={{ color: TEGELKLEUR[r.b] }}>{r.b}</span>
              <span className={s.grijs}> = </span>
              <span className={r.c === null ? s.grijs : undefined}>{r.c === null ? "?" : r.c}</span>
            </div>
          ))}
        </div>
      )}

      {keuzes && <Keuzes key={keuzes.vraag} k={keuzes} meld={meld} inVlak={knoppenInVlak} />}
    </div>
  );
}
