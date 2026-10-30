"use client";

/**
 * Het speelvlak van de lessen "De kalender" en "Tijden" naar Squla (30 oktober
 * 2026), in Phaser (HARDE REGEL 7), in de vlakke, vriendelijke stijl van
 * Bliepo (bliepo-voorwerpen.ts: geen gloed). De tekeningen staan in
 * squla-tijd-tekeningen.ts.
 *
 * Wat het draaiboek zet:
 * - `groot`: een tekening bovenaan (een kalender, een tafereel);
 * - `kaarten`: kaartjes om aan te tikken (een plaatje, met of zonder woord);
 *   `uit` (vaag: al fout gekozen), `goed` (groene rand), `fout` (rode rand),
 *   `licht` (gele rand: Bliepo wijst het aan);
 * - `orden`: lege vakken op een rij en losse kaartjes eronder, om op volgorde
 *   te slepen (of aan te tikken: dan gaat het naar het eerste lege vak);
 *   `vast` = vakken die al gevuld zijn; `uitslag` per vak groen of rood;
 * - `verbind`: plaatjes links en woorden rechts; het kind trekt een lijn (of
 *   tikt links en dan rechts).
 *
 * Meldingen: `kaart` {id}, `leg` {id, vak|null}, `links` {id}, `rechts` {id},
 * `lijn` {links, rechts}.
 *
 * Groep 3 leest nog niet: bij elk kaartje leest Bliepo de naam voor als de muis
 * erop blijft staan of als het kind lang drukt. Voor het toetsenbord en de
 * automatische test ligt over elk tikbaar ding een onzichtbare knop
 * (`data-ding`), die precies hetzelfde meldt.
 */

import { useEffect, useRef } from "react";
import type { Vlakbasis, Vlakgebeurtenis } from "../soort";
import { TX, VLAK_B, VLAK_H } from "../holo/basis";
import { HOLO_CANVAS, useHoloMotor } from "../holo/motor";
import { bliepoBasis, PALET, RAND_DUN, blok, tekenVormen } from "./bliepo-voorwerpen";
import { tekenTekening, tekeningMaat, zetLettertype } from "./squla-tijd-tekeningen";
import { haalKeuzesAlvast, zegKeuze } from "@/lib/stem";
import s from "./squla-tijd.module.css";

export type PDing = {
  id: string;
  /** Sleutel uit squla-tijd-tekeningen.ts; zonder: alleen het woord. */
  tekening?: string;
  /** Het woord op het kaartje. */
  label?: string;
  /** Wat Bliepo zegt bij aanwijzen (standaard het woord). */
  zeg?: string;
};

export type POrden = { vakken: (string | null)[]; vast?: number[]; vastDingen?: PDing[]; losse: PDing[]; uitslag?: (boolean | null)[]; actief: boolean };
export type PVerbind = { links: PDing[]; rechts: PDing[]; lijnen: [string, string][]; vast: string[]; gekozen: string | null; actief: boolean };

export type PlaatjesProps = {
  /** Een nieuw tafereel (nieuwe vraag): alles verschijnt opnieuw. */
  nr: number;
  groot?: string | null;
  kaarten?: PDing[];
  kaartenActief?: boolean;
  uit?: string[];
  goed?: string[];
  fout?: string[];
  licht?: string[];
  orden?: POrden | null;
  verbind?: PVerbind | null;
  /** Even schudden (fout) of een lichtring (goed) bij een ding. */
  schud?: { id: string; n: number } | null;
  golf?: { id: string; n: number } | null;
  /** Een handje doet één keer voor hoe je sleept (verandert het getal, dan nog eens). */
  handje?: number;
};

export type Rect = { x: number; y: number; b: number; h: number };

/* ---------- waar staat wat (punten van het vlak, 980 × 720) ---------- */

export function rij(n: number, b: number, tussen: number, y: number, h: number): Rect[] {
  const breed = n * b + (n - 1) * tussen;
  const x0 = (VLAK_B - breed) / 2 + b / 2;
  return Array.from({ length: n }, (_, i) => ({ x: x0 + i * (b + tussen), y, b, h }));
}

type Indeling = { groot: (Rect & { k: number }) | null; kaarten: Rect[]; vakken: Rect[]; losse: Rect[]; links: Rect[]; rechts: Rect[] };

export function indeling(p: PlaatjesProps): Indeling {
  const n = p.kaarten?.length ?? 0;
  const orden = p.orden ?? null;
  const verbind = p.verbind ?? null;
  let groot: Indeling["groot"] = null;
  if (p.groot && !verbind) {
    const onder = orden ? 262 : n ? 400 : 700;
    const top = 14;
    const m = tekeningMaat(p.groot);
    const k = Math.min((onder - top) / m.h, 900 / m.b, 1.6);
    groot = { x: VLAK_B / 2, y: top + (onder - top) / 2, b: m.b * k, h: m.h * k, k };
  }
  let kaarten: Rect[] = [];
  if (n) {
    if (groot) {
      const [b, h] = n === 1 ? [260, 230] : n === 2 ? [270, 240] : n === 3 ? [250, 236] : [205, 210];
      kaarten = rij(n, b, 40, 562, h);
    } else {
      const [b, h] = n === 2 ? [320, 320] : n === 3 ? [280, 300] : [210, 260];
      kaarten = rij(n, b, 44, 370, h);
    }
  }
  let vakken: Rect[] = [];
  let losse: Rect[] = [];
  if (orden) {
    const m = orden.vakken.length;
    const [b, h] = m <= 3 ? [210, 180] : [196, 170];
    vakken = rij(m, b, 30, groot ? 380 : 240, h);
    losse = rij(orden.losse.length, b, 40, groot ? 592 : 520, h);
  }
  let links: Rect[] = [];
  let rechts: Rect[] = [];
  if (verbind) {
    links = verbind.links.map((_, i) => ({ x: 250, y: 130 + i * 230, b: 250, h: 200 }));
    rechts = verbind.rechts.map((_, i) => ({ x: 730, y: 130 + i * 230, b: 270, h: 104 }));
  }
  return { groot, kaarten, vakken, losse, links, rechts };
}

export const binnen = (r: Rect, x: number, y: number, marge = 0) => Math.abs(x - r.x) <= r.b / 2 + marge && Math.abs(y - r.y) <= r.h / 2 + marge;

/* ---------- de scène ---------- */

type Ptr = import("phaser").Input.Pointer;
type Box = import("phaser").GameObjects.Container;
type Img = import("phaser").GameObjects.Image;

interface PlaatjesScene {
  verbind(meld: (g: Vlakgebeurtenis) => void): void;
  zet(p: PlaatjesProps): void;
  schudDing(id: string): void;
  golfDing(id: string): void;
  speelHandje(): void;
}

type Ding = { box: Box; ring: Img; r: Rect; zeg: string; soort: "kaart" | "los" | "vast" | "links" | "rechts"; id: string };

const RING = { geel: PALET.geel, groen: "#3fbf6a", rood: "#e8453c" } as const;

function maakScene(Phaser: typeof import("phaser"), rustig: boolean) {
  const Basis = bliepoBasis(Phaser, rustig);
  class Plaatjes extends Basis implements PlaatjesScene {
    melder: (g: Vlakgebeurtenis) => void = () => {};
    p: PlaatjesProps | null = null;
    sig = "";
    nr = -1;
    dingen = new Map<string, Ding>();
    alles: import("phaser").GameObjects.GameObject[] = [];
    lijnen: import("phaser").GameObjects.Graphics | null = null;
    trek: import("phaser").GameObjects.Graphics | null = null;
    druk: { d: Ding; x0: number; y0: number; dx: number; dy: number; sleept: boolean; lang: boolean } | null = null;
    zweef: string | null = null;
    stemKlok: ReturnType<typeof setTimeout> | undefined;
    terugKlok: ReturnType<typeof setTimeout> | undefined;

    constructor() {
      super("squla-tijd-plaatjes");
    }

    verbind(meld: (g: Vlakgebeurtenis) => void) {
      this.melder = meld;
    }

    maak() {
      this.maakGolf();
      this.input.on("pointerdown", (p: Ptr) => this.neer(p));
      this.input.on("pointermove", (p: Ptr) => this.beweeg(p));
      this.input.on("pointerup", (p: Ptr) => this.los(p));
      this.input.on("pointerupoutside", (p: Ptr) => this.los(p));
    }

    /* ---------- plaatjes ---------- */

    kaartPlaatje(d: PDing, b: number, h: number) {
      const sl = `pk|${d.tekening ?? ""}|${d.label ?? ""}|${Math.round(b)}x${Math.round(h)}`;
      this.canvasPlaatje(sl, b, h, (c) => {
        tekenVormen(c, [{ d: blok(3, 3, b - 6, h - 6, 18), vul: PALET.warmwit, rand: PALET.navy, dik: 4 }]);
        const woordH = d.label && d.tekening ? 46 : 0;
        if (d.tekening) {
          const m = tekeningMaat(d.tekening);
          const k = Math.min((b - 34) / m.b, (h - 30 - woordH) / m.h);
          c.save();
          c.translate((b - m.b * k) / 2, 15 + (h - 30 - woordH - m.h * k) / 2);
          c.scale(k, k);
          tekenTekening(c, d.tekening);
          c.restore();
        }
        if (d.label) {
          const maat = d.tekening ? 26 : d.label.length > 11 ? 29 : d.label.length > 8 ? 32 : 40;
          c.font = `800 ${maat}px ${letter()}`;
          c.textAlign = "center";
          c.textBaseline = "middle";
          c.fillStyle = PALET.navy;
          c.fillText(d.label, b / 2, d.tekening ? h - 32 : h / 2 + 2, b - 20);
        }
      });
      return sl;
    }

    grootPlaatje(sleutel: string, k: number) {
      const m = tekeningMaat(sleutel);
      const sl = `pg|${sleutel}|${k.toFixed(3)}`;
      this.canvasPlaatje(sl, Math.ceil(m.b * k), Math.ceil(m.h * k), (c) => {
        c.scale(k, k);
        tekenTekening(c, sleutel);
      });
      return sl;
    }

    ringPlaatje(kleur: keyof typeof RING, b: number, h: number) {
      const sl = `pr|${kleur}|${Math.round(b)}x${Math.round(h)}`;
      this.canvasPlaatje(sl, b + 20, h + 20, (c) =>
        tekenVormen(c, [
          { d: blok(5, 5, b + 10, h + 10, 22), rand: PALET.navy, dik: 10 },
          { d: blok(5, 5, b + 10, h + 10, 22), rand: RING[kleur], dik: 6.5 },
        ]),
      );
      return sl;
    }

    vakPlaatje(b: number, h: number) {
      const sl = `pv|${Math.round(b)}x${Math.round(h)}`;
      this.canvasPlaatje(sl, b, h, (c) => {
        c.fillStyle = "rgba(255,247,234,0.12)";
        c.beginPath();
        c.roundRect(4, 4, b - 8, h - 8, 18);
        c.fill();
        c.setLineDash([12, 9]);
        c.strokeStyle = "rgba(255,247,234,0.85)";
        c.lineWidth = 4;
        c.stroke();
      });
      return sl;
    }

    /* ---------- opbouwen ---------- */

    leeg() {
      for (const o of this.alles) o.destroy();
      this.alles = [];
      this.dingen.clear();
      this.lijnen = null;
      this.trek = null;
      this.druk = null;
    }

    nieuwDing(d: PDing, r: Rect, soort: Ding["soort"], sleutel: string) {
      const box = this.add.container(r.x, r.y);
      const ring = this.plaats(this.ringPlaatje("geel", r.b, r.h), 0, 0).setVisible(false);
      box.add([ring, this.plaats(this.kaartPlaatje(d, r.b, r.h), 0, 0)]);
      this.alles.push(box);
      const ding: Ding = { box, ring, r, zeg: d.zeg ?? d.label ?? d.id, soort, id: d.id };
      this.dingen.set(sleutel, ding);
      return ding;
    }

    bouw(p: PlaatjesProps, verschijn: boolean) {
      this.leeg();
      const ind = indeling(p);
      const nieuw: Box[] = [];
      if (ind.groot && p.groot) {
        const g = this.plaats(this.grootPlaatje(p.groot, ind.groot.k), ind.groot.x, ind.groot.y);
        this.alles.push(g);
      }
      (p.kaarten ?? []).forEach((d, i) => nieuw.push(this.nieuwDing(d, ind.kaarten[i], "kaart", d.id).box));
      if (p.orden) {
        const o = p.orden;
        ind.vakken.forEach((r) => this.alles.push(this.plaats(this.vakPlaatje(r.b, r.h), r.x, r.y)));
        for (const i of o.vast ?? []) {
          const id = o.vakken[i];
          if (!id) continue;
          nieuw.push(this.nieuwDing({ id, ...this.vindDing(p, id) }, ind.vakken[i], "vast", `vast:${id}`).box);
        }
        o.losse.forEach((d, i) => nieuw.push(this.nieuwDing(d, ind.losse[i], "los", d.id).box));
      }
      if (p.verbind) {
        this.lijnen = this.add.graphics();
        this.alles.push(this.lijnen);
        p.verbind.links.forEach((d, i) => nieuw.push(this.nieuwDing(d, ind.links[i], "links", `L:${d.id}`).box));
        p.verbind.rechts.forEach((d, i) => nieuw.push(this.nieuwDing(d, ind.rechts[i], "rechts", `R:${d.id}`).box));
        this.trek = this.add.graphics().setDepth(5);
        this.alles.push(this.trek);
      }
      if (verschijn) nieuw.forEach((b, i) => this.tover(b, { vertraging: i * 70 }));
    }

    vindDing(p: PlaatjesProps, id: string): Omit<PDing, "id"> {
      const d = p.orden?.vastDingen?.find((x) => x.id === id) ?? p.orden?.losse.find((x) => x.id === id);
      return d ?? { label: id };
    }

    zet(p: PlaatjesProps) {
      this.p = p;
      const sig = JSON.stringify([
        p.nr,
        p.groot ?? null,
        (p.kaarten ?? []).map((k) => [k.id, k.tekening, k.label]),
        p.orden ? [p.orden.vakken.length, p.orden.vast ?? [], (p.orden.vast ?? []).map((i) => p.orden!.vakken[i]), p.orden.losse.map((k) => [k.id, k.tekening, k.label])] : null,
        p.verbind ? [p.verbind.links.map((k) => k.id), p.verbind.rechts.map((k) => k.id)] : null,
      ]);
      if (sig !== this.sig) {
        this.bouw(p, p.nr !== this.nr);
        this.sig = sig;
        this.nr = p.nr;
      }
      this.pasToe(p);
    }

    pasToe(p: PlaatjesProps) {
      const ind = indeling(p);
      const kleur = (id: string): keyof typeof RING | null => (p.goed?.includes(id) ? "groen" : p.fout?.includes(id) ? "rood" : p.licht?.includes(id) ? "geel" : null);
      const zetRing = (d: Ding, k: keyof typeof RING | null) => {
        if (!k) return void d.ring.setVisible(false);
        d.ring.setTexture(this.ringPlaatje(k, d.r.b, d.r.h)).setVisible(true);
      };
      for (const d of this.dingen.values()) {
        if (d.soort === "kaart") {
          zetRing(d, kleur(d.id));
          d.box.setAlpha(p.uit?.includes(d.id) ? 0.35 : 1);
        }
        if (d.soort === "los" && p.orden) {
          const vak = p.orden.vakken.indexOf(d.id);
          const doel = vak >= 0 ? ind.vakken[vak] : d.r;
          if (this.druk?.d !== d && (d.box.x !== doel.x || d.box.y !== doel.y)) {
            this.tweens.add({ targets: d.box, x: doel.x, y: doel.y, duration: rustig ? 1 : 220, ease: "Cubic.easeOut" });
          }
          const u = vak >= 0 ? p.orden.uitslag?.[vak] : null;
          zetRing(d, u === true ? "groen" : u === false ? "rood" : kleur(d.id));
          d.box.setDepth(vak >= 0 ? 1 : 2);
        }
        if (d.soort === "vast") zetRing(d, null);
        if (d.soort === "links" && p.verbind) zetRing(d, p.verbind.vast.includes(d.id) ? "groen" : p.verbind.gekozen === d.id ? "geel" : kleur(d.id));
        if (d.soort === "rechts" && p.verbind) {
          const vast = p.verbind.lijnen.some(([l, r]) => r === d.id && p.verbind!.vast.includes(l));
          zetRing(d, vast ? "groen" : kleur(d.id));
        }
      }
      if (this.lijnen && p.verbind) {
        const g = this.lijnen;
        g.clear();
        for (const [l, r] of p.verbind.lijnen) {
          const a = this.dingen.get(`L:${l}`);
          const b = this.dingen.get(`R:${r}`);
          if (!a || !b) continue;
          const goed = p.verbind.vast.includes(l);
          const x1 = a.r.x + a.r.b / 2;
          const x2 = b.r.x - b.r.b / 2;
          g.lineStyle(11, 0x1d2b5e, 1);
          g.lineBetween(x1, a.r.y, x2, b.r.y);
          g.lineStyle(6, goed ? 0x3fbf6a : 0xffc845, 1);
          g.lineBetween(x1, a.r.y, x2, b.r.y);
          for (const [x, y] of [[x1, a.r.y], [x2, b.r.y]]) {
            g.fillStyle(0x1d2b5e, 1);
            g.fillCircle(x, y, 10);
            g.fillStyle(goed ? 0x3fbf6a : 0xffc845, 1);
            g.fillCircle(x, y, 6.5);
          }
        }
      }
    }

    maakGolf() {
      this.canvasPlaatje("pg-golf", 80, 80, (c) =>
        tekenVormen(c, [
          { d: blok(7, 7, 66, 66, 33), rand: PALET.navy, dik: 9 },
          { d: blok(7, 7, 66, 66, 33), rand: PALET.geel, dik: 5.5 },
        ]),
      );
    }

    /** Goed: een vlakke gele ring die even groter wordt (als plaatje, één keer getekend: vloeiender dan een Graphics-ring). */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    golf(x: number, y: number, _kleur?: number) {
      if (rustig) return;
      this.maakGolf();
      const g = this.plaats("pg-golf", x, y).setScale(0.7 / TX).setDepth(20);
      this.tweens.add({ targets: g, scale: 1.5 / TX, alpha: { from: 1, to: 0.2 }, duration: 340, ease: "Cubic.easeOut", onComplete: () => g.destroy() });
    }

    schudDing(id: string) {
      const d = this.dingen.get(id) ?? this.dingen.get(`L:${id}`);
      if (d) this.schud(d.box);
    }

    golfDing(id: string) {
      const d = this.dingen.get(id) ?? this.dingen.get(`L:${id}`);
      if (d) this.golf(d.box.x, d.box.y);
    }

    speelHandje() {
      const p = this.p;
      if (!p || rustig) return;
      const ind = indeling(p);
      let van: Rect | undefined;
      let naar: Rect | undefined;
      if (p.orden) {
        van = ind.losse.find((_, i) => !p.orden!.vakken.includes(p.orden!.losse[i].id));
        naar = ind.vakken[p.orden.vakken.findIndex((x) => x === null)];
      } else if (p.verbind) {
        van = ind.links[0] && { ...ind.links[0], x: ind.links[0].x + ind.links[0].b / 2 - 20 };
        naar = ind.rechts[0] && { ...ind.rechts[0], x: ind.rechts[0].x - ind.rechts[0].b / 2 + 20 };
      }
      if (!van || !naar) return;
      this.canvasPlaatje("handje", 48, 56, (c) =>
        tekenVormen(c, [
          {
            d: "M16 30 V8 a5 5 0 0 1 10 0 V26 V20 a5 5 0 0 1 10 0 V28 a5 5 0 0 1 9 2 V40 c0 9 -7 14 -15 14 h-4 c-6 0 -10 -3 -13 -8 L4 34 a5 5 0 0 1 8 -5 Z",
            vul: PALET.warmwit,
            rand: PALET.navy,
            dik: 3.5,
          },
        ]),
      );
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

    /** Het ding onder de vinger dat nu iets doet (of alleen voorgelezen kan worden). */
    raak(x: number, y: number, alleenActief: boolean): Ding | null {
      const p = this.p;
      if (!p) return null;
      const lijst = [...this.dingen.values()].reverse();
      for (const d of lijst) {
        if (!binnen({ ...d.r, x: d.box.x, y: d.box.y }, x, y, 6)) continue;
        if (!alleenActief) return d;
        if (d.soort === "kaart" && p.kaartenActief && !p.uit?.includes(d.id)) return d;
        if (d.soort === "los" && p.orden?.actief && !p.orden.vakken.includes(d.id)) return d;
        if (d.soort === "links" && p.verbind?.actief && !p.verbind.vast.includes(d.id)) return d;
        if (d.soort === "rechts" && p.verbind?.actief) return d;
      }
      return null;
    }

    neer(p: Ptr) {
      const w = this.waar(p);
      const d = this.raak(w.x, w.y, true);
      clearTimeout(this.stemKlok);
      if (!d) return;
      this.druk = { d, x0: w.x, y0: w.y, dx: d.box.x - w.x, dy: d.box.y - w.y, sleept: false, lang: false };
      if (p.wasTouch) {
        const druk = this.druk;
        this.stemKlok = setTimeout(() => {
          if (this.druk === druk && !druk.sleept) {
            druk.lang = true;
            zegKeuze(d.zeg);
          }
        }, 500);
      }
    }

    beweeg(p: Ptr) {
      const w = this.waar(p);
      const druk = this.druk;
      if (!druk) {
        /* De muis blijft even op een kaartje: Bliepo leest het voor. */
        if (!p.isDown && (p.event as PointerEvent | undefined)?.pointerType === "mouse") {
          const d = this.raak(w.x, w.y, false);
          const id = d ? `${d.soort}:${d.id}` : null;
          if (id !== this.zweef) {
            this.zweef = id;
            clearTimeout(this.stemKlok);
            if (d) this.stemKlok = setTimeout(() => zegKeuze(d.zeg), 300);
          }
          this.input.setDefaultCursor(d && this.raak(w.x, w.y, true) ? (d.soort === "los" ? "grab" : "pointer") : "default");
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
      if (!druk.sleept) return;
      if (druk.d.soort === "los") druk.d.box.setPosition(w.x + druk.dx, w.y + druk.dy);
      if (druk.d.soort === "links" && this.trek) {
        const r = druk.d.r;
        this.trek.clear();
        this.trek.lineStyle(10, 0x1d2b5e, 1);
        this.trek.lineBetween(r.x + r.b / 2, r.y, w.x, w.y);
        this.trek.lineStyle(5, 0xffc845, 1);
        this.trek.lineBetween(r.x + r.b / 2, r.y, w.x, w.y);
      }
    }

    los(p: Ptr) {
      const druk = this.druk;
      this.druk = null;
      clearTimeout(this.stemKlok);
      if (!druk) return;
      const w = this.waar(p);
      const d = druk.d;
      this.trek?.clear();
      this.input.setDefaultCursor("default");
      if (druk.lang && !druk.sleept) return;
      if (d.soort === "kaart" && !druk.sleept) return void this.melder({ soort: "kaart", id: d.id });
      if (d.soort === "rechts" && !druk.sleept) return void this.melder({ soort: "rechts", id: d.id });
      if (d.soort === "links") {
        if (!druk.sleept) return void this.melder({ soort: "links", id: d.id });
        const doel = [...this.dingen.values()].find((x) => x.soort === "rechts" && binnen(x.r, w.x, w.y, 20));
        if (doel) this.melder({ soort: "lijn", links: d.id, rechts: doel.id });
        return;
      }
      if (d.soort === "los" && this.p?.orden) {
        if (!druk.sleept) return void this.melder({ soort: "leg", id: d.id, vak: null });
        const ind = indeling(this.p);
        const vak = ind.vakken.findIndex((r, i) => !this.p!.orden!.vakken[i] && binnen(r, d.box.x, d.box.y, 30));
        if (vak >= 0) this.melder({ soort: "leg", id: d.id, vak });
        /* Niet (goed) neergelegd: terug naar zijn plek. */
        clearTimeout(this.terugKlok);
        this.terugKlok = setTimeout(() => {
          if (this.p) this.pasToe(this.p);
        }, vak >= 0 ? 260 : 0);
      }
    }

    demo(ms: number) {
      const eind = performance.now() + ms;
      const lijst = [...this.dingen.values()];
      let i = 0;
      const stap = () => {
        if (performance.now() > eind) return;
        const d = lijst[i++ % Math.max(1, lijst.length)];
        if (d) {
          this.golf(d.box.x, d.box.y);
          this.schud(d.box);
        } else this.golf(VLAK_B / 2, VLAK_H / 2);
        this.time.delayedCall(450, stap);
      };
      stap();
    }
  }
  return Plaatjes as unknown as new () => import("phaser").Scene;
}

function letter() {
  const el = document.querySelector("[data-squla-tijd]");
  return el ? getComputedStyle(el).fontFamily : "system-ui, sans-serif";
}

/* ---------- het vlak ---------- */

export function SqulaTijdPlaatjes(props: PlaatjesProps & Vlakbasis) {
  const { meld, schaal } = props;
  const { plek, scene } = useHoloMotor<PlaatjesScene>(schaal, maakScene, { invoer: true });
  const meldRef = useRef(meld);
  useEffect(() => {
    meldRef.current = meld;
  }, [meld]);

  useEffect(() => {
    const el = document.querySelector("[data-squla-tijd]");
    if (el) zetLettertype(getComputedStyle(el).fontFamily);
  }, []);

  useEffect(() => {
    scene?.verbind((g) => meldRef.current(g));
  }, [scene]);

  const { nr, groot, kaarten, kaartenActief, uit, goed, fout, licht, orden, verbind } = props;
  const stand = JSON.stringify({ nr, groot, kaarten, kaartenActief, uit, goed, fout, licht, orden, verbind });
  useEffect(() => {
    if (scene) scene.zet(JSON.parse(stand) as PlaatjesProps);
  }, [scene, stand]);

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

  /* De namen alvast klaarzetten om voor te lezen. */
  const namen = [...(kaarten ?? []), ...(orden?.losse ?? []), ...(verbind?.links ?? []), ...(verbind?.rechts ?? [])].map((d) => d.zeg ?? d.label ?? "").filter(Boolean);
  const namenSleutel = namen.join("\n");
  useEffect(() => {
    if (namenSleutel) haalKeuzesAlvast(namenSleutel.split("\n"));
  }, [namenSleutel]);

  /* Onzichtbare knoppen over alles wat je kunt tikken: toetsenbord en automatische test. */
  const ind = indeling(props);
  const knoppen: { id: string; zeg: string; r: Rect; doe: () => void }[] = [];
  if (kaartenActief) (kaarten ?? []).forEach((d, i) => !uit?.includes(d.id) && knoppen.push({ id: d.id, zeg: d.zeg ?? d.label ?? d.id, r: ind.kaarten[i], doe: () => meld({ soort: "kaart", id: d.id }) }));
  if (orden?.actief) orden.losse.forEach((d, i) => !orden.vakken.includes(d.id) && knoppen.push({ id: d.id, zeg: d.zeg ?? d.label ?? d.id, r: ind.losse[i], doe: () => meld({ soort: "leg", id: d.id, vak: null }) }));
  if (verbind?.actief) {
    verbind.links.forEach((d, i) => !verbind.vast.includes(d.id) && knoppen.push({ id: d.id, zeg: d.zeg ?? d.label ?? d.id, r: ind.links[i], doe: () => meld({ soort: "links", id: d.id }) }));
    verbind.rechts.forEach((d, i) => knoppen.push({ id: d.id, zeg: d.zeg ?? d.label ?? d.id, r: ind.rechts[i], doe: () => meld({ soort: "rechts", id: d.id }) }));
  }

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
            aria-label={k.zeg}
            style={{ left: k.r.x - k.r.b / 2, top: k.r.y - k.r.h / 2, width: k.r.b, height: k.r.h }}
            onFocus={(e) => {
              if (e.currentTarget.matches(":focus-visible")) zegKeuze(k.zeg);
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

/** De tekening op de kaart aan het eind (244 × 190): een kalenderblaadje. */
export function KaartKalender() {
  return (
    <svg viewBox="0 0 244 190" width={244} height={190} aria-hidden="true">
      <rect x="52" y="22" width="140" height="150" rx="16" fill={PALET.warmwit} stroke={PALET.navy} strokeWidth={RAND_DUN * 1.4} />
      <path d="M 54 64 V 38 a 14 14 0 0 1 14 -14 H 176 a 14 14 0 0 1 14 14 V 64 Z" fill={PALET.koraal} stroke={PALET.navy} strokeWidth={RAND_DUN} />
      <text x="122" y="132" textAnchor="middle" fontSize="58" fontWeight="800" fill={PALET.navy} style={{ fontFamily: "var(--font-les), system-ui, sans-serif" }}>
        13
      </text>
    </svg>
  );
}

/** De tekening op de kaart aan het eind (244 × 190): de zon en de maan (dagdelen). */
export function KaartTijden() {
  return (
    <svg viewBox="0 0 244 190" width={244} height={190} aria-hidden="true">
      <circle cx="84" cy="96" r="38" fill={PALET.geel} stroke={PALET.navy} strokeWidth={RAND_DUN * 1.4} />
      <path d="M 84 40 v 10 M 84 142 v 10 M 28 96 h 10 M 130 96 h 10" stroke={PALET.navy} strokeWidth={RAND_DUN * 1.4} strokeLinecap="round" />
      <path d="M 178 58 a 40 40 0 1 0 30 66 a 32 32 0 1 1 -30 -66 Z" fill={PALET.geelLicht} stroke={PALET.navy} strokeWidth={RAND_DUN * 1.4} strokeLinejoin="round" />
    </svg>
  );
}
