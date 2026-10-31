"use client";

/**
 * Het speelvlak van de lessen Meten en maten naar Squla (31 oktober 2026):
 * Pizza's vergelijken, Hoeveelheden en Oppervlakte. In Phaser (HARDE REGEL 7),
 * in de vlakke, vriendelijke stijl van Bliepo (bliepo-voorwerpen.ts: geen
 * gloed). De tekeningen staan in squla-meten-tekeningen.ts.
 *
 * Wat het draaiboek zet:
 * - `groot`: een tekening bovenaan (een verhaal, een tafel, een muur), met
 *   eventueel getallen erop (`tel`: Bliepo telt mee);
 * - `balans`: een weegschaal bovenaan; verandert `zak`, dan staat hij eerst
 *   recht en zakt hij daarna langzaam naar de zware kant;
 * - `vergelijk`: twee of drie dingen naast elkaar op één lijn, even groot
 *   getekend als op de kaartjes, met een stippellijn bij de bovenkant;
 * - `kaarten`: kaartjes om aan te tikken. Alle kaartjes van één vraag hebben
 *   dezelfde schaal, zodat een kleine pizza ook echt kleiner is;
 *   `uit` (vaag), `goed` (groen), `fout` (rood), `licht` (geel: Bliepo wijst
 *   het aan, of het kind koos het al);
 * - `orden`: lege vakken en losse kaartjes om te slepen (of aan te tikken: dan
 *   gaat het naar het eerste lege vak). `onderGroot`: de vakken staan onder
 *   de twee tafels van de grote tekening; `klein`: kleine getalkaartjes.
 *
 * Meldingen: `kaart` {id}, `leg` {id, vak|null}.
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
import { bliepoBasis, PALET, RAND_DUN, blok, cirkel, tekenVormen } from "./bliepo-voorwerpen";
import { BALK_HALF, schaalVoorwerpen, tafelMiddens, tekenBalk, tekenSchaal, tekenTekening, tekenVoet, tekeningMaat, tekeningPunten, zetLettertype } from "./squla-meten-tekeningen";
import { haalKeuzesAlvast, zegKeuze } from "@/lib/stem";
import s from "./squla-meten.module.css";

export type MDing = {
  id: string;
  /** Sleutel uit squla-meten-tekeningen.ts; zonder: alleen het woord. */
  tekening?: string;
  /** Het woord (of de zin) op het kaartje. */
  label?: string;
  /** Wat Bliepo zegt bij aanwijzen (standaard het woord). */
  zeg?: string;
};

export type MOrden = {
  vakken: (string | null)[];
  vast?: number[];
  vastDingen?: MDing[];
  losse: MDing[];
  uitslag?: (boolean | null)[];
  actief: boolean;
  /** De vakken staan onder de tafels van de grote tekening. */
  onderGroot?: boolean;
  /** Kleine kaartjes (getallen). */
  klein?: boolean;
};

export type MBalans = { links: string; rechts: string; kant: -1 | 0 | 1; zak: number };

export type MetenProps = {
  /** Een nieuw tafereel (nieuwe vraag): alles verschijnt opnieuw. */
  nr: number;
  groot?: string | null;
  tel?: { i: number; t: string }[];
  balans?: MBalans | null;
  vergelijk?: string[] | null;
  kaarten?: MDing[];
  kaartenActief?: boolean;
  uit?: string[];
  goed?: string[];
  fout?: string[];
  licht?: string[];
  orden?: MOrden | null;
  schud?: { id: string; n: number } | null;
  golf?: { id: string; n: number } | null;
  handje?: number;
};

export type Rect = { x: number; y: number; b: number; h: number };

/* ---------- waar staat wat (punten van het vlak, 980 × 720) ---------- */

export function rij(n: number, b: number, tussen: number, y: number, h: number): Rect[] {
  const breed = n * b + (n - 1) * tussen;
  const x0 = (VLAK_B - breed) / 2 + b / 2;
  return Array.from({ length: n }, (_, i) => ({ x: x0 + i * (b + tussen), y, b, h }));
}

type Indeling = { boven: { top: number; onder: number } | null; groot: (Rect & { k: number }) | null; kaarten: Rect[]; vakken: Rect[]; losse: Rect[] };

export function indeling(p: MetenProps): Indeling {
  const n = p.kaarten?.length ?? 0;
  const orden = p.orden ?? null;
  const vergelijk = (p.vergelijk ?? []).length > 0;
  const heeftBoven = !!(p.groot || p.balans || vergelijk);
  const onder = orden ? (orden.klein ? 336 : 262) : n ? 404 : 700;
  const boven = heeftBoven ? { top: 14, onder } : null;
  let groot: Indeling["groot"] = null;
  if (p.groot && !vergelijk && !p.balans) {
    const top = 14;
    const m = tekeningMaat(p.groot);
    const k = Math.min((onder - top) / m.h, 920 / m.b, 1.7);
    groot = { x: VLAK_B / 2, y: top + (onder - top) / 2, b: m.b * k, h: m.h * k, k };
  }
  let kaarten: Rect[] = [];
  if (n) {
    if (heeftBoven) {
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
    if (orden.klein) {
      const b = 104;
      vakken = rij(m, b, 40, heeftBoven ? 400 : 240, b);
      if (orden.onderGroot && groot && p.groot) {
        const midden = tafelMiddens(p.groot);
        if (midden.length === m) vakken = midden.map((x) => ({ x: groot!.x - groot!.b / 2 + x * groot!.k, y: 400, b, h: b }));
      }
      losse = rij(orden.losse.length, b, orden.losse.length > 6 ? 18 : 30, heeftBoven ? 590 : 520, b);
    } else {
      const [b, h] = m <= 3 ? [210, 180] : [196, 170];
      vakken = rij(m, b, 30, heeftBoven ? 380 : 240, h);
      losse = rij(orden.losse.length, b, 40, heeftBoven ? 592 : 520, h);
    }
  }
  return { boven, groot, kaarten, vakken, losse };
}

export const binnen = (r: Rect, x: number, y: number, marge = 0) => Math.abs(x - r.x) <= r.b / 2 + marge && Math.abs(y - r.y) <= r.h / 2 + marge;

const WOORD_H = (d: MDing) => (d.label && d.tekening ? (d.label.length > 16 ? 70 : 46) : 0);

/** Hoe groot de tekeningen op een rij kaartjes mogen: voor alle kaartjes dezelfde schaal, en hoe hoog de hoogste is. */
function gedeeldeSchaal(dingen: MDing[], b: number, h: number): { k: number; H: number } {
  let k = 1.6;
  for (const d of dingen) {
    if (!d.tekening) continue;
    const m = tekeningMaat(d.tekening);
    k = Math.min(k, (b - 34) / m.b, (h - 30 - WOORD_H(d)) / m.h);
  }
  let H = 0;
  for (const d of dingen) if (d.tekening) H = Math.max(H, tekeningMaat(d.tekening).h * k);
  return { k, H };
}

/** Zet een zin in regels die op het kaartje passen. */
function regels(c: CanvasRenderingContext2D, zin: string, breed: number): string[] {
  const woorden = zin.split(" ");
  const uit: string[] = [];
  let r = "";
  for (const w of woorden) {
    const t = r ? `${r} ${w}` : w;
    if (c.measureText(t).width > breed && r) {
      uit.push(r);
      r = w;
    } else r = t;
  }
  if (r) uit.push(r);
  return uit;
}

/* ---------- de scène ---------- */

type Ptr = import("phaser").Input.Pointer;
type Box = import("phaser").GameObjects.Container;
type Img = import("phaser").GameObjects.Image;

interface MetenScene {
  verbind(meld: (g: Vlakgebeurtenis) => void): void;
  zet(p: MetenProps): void;
  schudDing(id: string): void;
  golfDing(id: string): void;
  speelHandje(): void;
}

type Ding = { box: Box; ring: Img; r: Rect; zeg: string; soort: "kaart" | "los" | "vast"; id: string };

const RING = { geel: PALET.geel, groen: "#3fbf6a", rood: "#e8453c" } as const;
/** De weegschaal: hoe groot, en waar het draaipunt zit. */
const BS = 1.45;
const DRAAI = { x: VLAK_B / 2, y: 70 };

function letter() {
  const el = document.querySelector("[data-squla-meten]");
  return el ? getComputedStyle(el).fontFamily : "system-ui, sans-serif";
}

function maakScene(Phaser: typeof import("phaser"), rustig: boolean) {
  const Basis = bliepoBasis(Phaser, rustig);
  class Meten extends Basis implements MetenScene {
    melder: (g: Vlakgebeurtenis) => void = () => {};
    p: MetenProps | null = null;
    sig = "";
    nr = -1;
    dingen = new Map<string, Ding>();
    alles: import("phaser").GameObjects.GameObject[] = [];
    telLaag: import("phaser").GameObjects.GameObject[] = [];
    telSig = "";
    balk: Img | null = null;
    schalen: [Img, Img] | null = null;
    hoek = 0;
    zak = -1;
    zakTween: import("phaser").Tweens.Tween | null = null;
    druk: { d: Ding; x0: number; y0: number; dx: number; dy: number; sleept: boolean; lang: boolean } | null = null;
    zweef: string | null = null;
    stemKlok: ReturnType<typeof setTimeout> | undefined;
    terugKlok: ReturnType<typeof setTimeout> | undefined;

    constructor() {
      super("squla-meten");
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

    kaartPlaatje(d: MDing, b: number, h: number, maat: { k: number; H: number }, klein = false) {
      const { k, H } = maat;
      const sl = `mk|${d.tekening ?? ""}|${d.label ?? ""}|${Math.round(b)}x${Math.round(h)}|${k.toFixed(3)}|${Math.round(H)}`;
      this.canvasPlaatje(sl, b, h, (c) => {
        tekenVormen(c, [{ d: blok(3, 3, b - 6, h - 6, klein ? 14 : 18), vul: PALET.warmwit, rand: PALET.navy, dik: 4 }]);
        const woordH = WOORD_H(d);
        if (d.tekening) {
          const m = tekeningMaat(d.tekening);
          /* Alle kaartjes van een rij op één lijn onderaan, zodat je de hoogtes kunt vergelijken. */
          const vrij = h - 30 - woordH;
          c.save();
          c.translate((b - m.b * k) / 2, 15 + (vrij - H) / 2 + H - m.h * k);
          c.scale(k, k);
          tekenTekening(c, d.tekening);
          c.restore();
        }
        if (d.label) {
          c.textAlign = "center";
          c.textBaseline = "middle";
          c.fillStyle = PALET.navy;
          if (d.tekening) {
            const maat = d.label.length > 16 ? 21 : 26;
            c.font = `800 ${maat}px ${letter()}`;
            const lijst = regels(c, d.label, b - 26).slice(0, 3);
            const y0 = h - 14 - (lijst.length * (maat + 4)) / 2;
            lijst.forEach((r, i) => c.fillText(r, b / 2, y0 + i * (maat + 4) + (maat + 4) / 2 - 4));
          } else {
            let maat = klein ? 46 : d.label.length > 24 ? 26 : d.label.length > 11 ? 30 : 40;
            c.font = `800 ${maat}px ${letter()}`;
            let lijst = regels(c, d.label, b - 30);
            while (lijst.length * (maat + 6) > h - 30 && maat > 18) {
              maat -= 2;
              c.font = `800 ${maat}px ${letter()}`;
              lijst = regels(c, d.label, b - 30);
            }
            const y0 = h / 2 - (lijst.length * (maat + 6)) / 2;
            lijst.forEach((r, i) => c.fillText(r, b / 2, y0 + i * (maat + 6) + (maat + 6) / 2 + 2));
          }
        }
      });
      return sl;
    }

    grootPlaatje(sleutel: string, k: number) {
      const m = tekeningMaat(sleutel);
      const sl = `mg|${sleutel}|${k.toFixed(3)}`;
      this.canvasPlaatje(sl, Math.ceil(m.b * k), Math.ceil(m.h * k), (c) => {
        c.scale(k, k);
        tekenTekening(c, sleutel);
      });
      return sl;
    }

    ringPlaatje(kleur: keyof typeof RING, b: number, h: number) {
      const sl = `mr|${kleur}|${Math.round(b)}x${Math.round(h)}`;
      this.canvasPlaatje(sl, b + 20, h + 20, (c) =>
        tekenVormen(c, [
          { d: blok(5, 5, b + 10, h + 10, 22), rand: PALET.navy, dik: 10 },
          { d: blok(5, 5, b + 10, h + 10, 22), rand: RING[kleur], dik: 6.5 },
        ]),
      );
      return sl;
    }

    vakPlaatje(b: number, h: number) {
      const sl = `mv|${Math.round(b)}x${Math.round(h)}`;
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

    badgePlaatje(t: string) {
      const sl = `mb|${t}`;
      this.canvasPlaatje(sl, 52, 52, (c) => {
        tekenVormen(c, [{ d: cirkel(26, 26, 22), vul: PALET.geel, rand: PALET.navy, dik: RAND_DUN }]);
        c.font = `800 ${t.length > 1 ? 22 : 26}px ${letter()}`;
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillStyle = PALET.navy;
        c.fillText(t, 26, 28);
      });
      return sl;
    }

    /* ---------- opbouwen ---------- */

    leeg() {
      for (const o of this.alles) o.destroy();
      for (const o of this.telLaag) o.destroy();
      this.alles = [];
      this.telLaag = [];
      this.telSig = "";
      this.dingen.clear();
      this.druk = null;
      this.balk = null;
      this.schalen = null;
      this.zakTween?.stop();
      this.zakTween = null;
    }

    nieuwDing(d: MDing, r: Rect, soort: Ding["soort"], sleutel: string, k: { k: number; H: number }, klein = false) {
      const box = this.add.container(r.x, r.y);
      const ring = this.plaats(this.ringPlaatje("geel", r.b, r.h), 0, 0).setVisible(false);
      box.add([ring, this.plaats(this.kaartPlaatje(d, r.b, r.h, k, klein), 0, 0)]);
      this.alles.push(box);
      /* Een lege `zeg`: niets voorlezen (een plaatje zonder woord; de naam zou het antwoord verklappen). */
      const ding: Ding = { box, ring, r, zeg: d.zeg ?? d.label ?? "", soort, id: d.id };
      this.dingen.set(sleutel, ding);
      return ding;
    }

    bouwBalans(b: MBalans) {
      const k = schaalVoorwerpen(b.links, b.rechts);
      this.canvasPlaatje("mw-voet", 180 * BS, 220 * BS, (c) => {
        c.scale(BS, BS);
        tekenVoet(c);
      });
      this.canvasPlaatje("mw-balk", 300 * BS, 24 * BS, (c) => {
        c.scale(BS, BS);
        tekenBalk(c);
      });
      const schaal = (wat: string) => {
        const sl = `mw-schaal|${wat}|${k.toFixed(3)}`;
        this.canvasPlaatje(sl, 140 * BS, 160 * BS, (c) => {
          c.scale(BS, BS);
          tekenSchaal(c, wat, k);
        });
        return sl;
      };
      const voet = this.plaats("mw-voet", DRAAI.x, DRAAI.y).setOrigin(0.5, 20 / 220);
      const links = this.plaats(schaal(b.links), 0, 0).setOrigin(0.5, 4 / 160);
      const rechts = this.plaats(schaal(b.rechts), 0, 0).setOrigin(0.5, 4 / 160);
      const balk = this.plaats("mw-balk", DRAAI.x, DRAAI.y);
      this.alles.push(voet, links, rechts, balk);
      this.balk = balk;
      this.schalen = [links, rechts];
      this.zetHoek(b.kant * 0.2);
      this.zak = b.zak;
      return [voet, links, rechts, balk];
    }

    zetHoek(a: number) {
      this.hoek = a;
      if (!this.balk || !this.schalen) return;
      this.balk.setRotation(a);
      const L = BALK_HALF * BS;
      const [l, r] = this.schalen;
      l.setPosition(DRAAI.x - L * Math.cos(a), DRAAI.y - L * Math.sin(a));
      r.setPosition(DRAAI.x + L * Math.cos(a), DRAAI.y + L * Math.sin(a));
    }

    bouwVergelijk(lijst: string[], ind: Indeling) {
      const vak = ind.boven ?? { top: 14, onder: 400 };
      const n = lijst.length;
      const breed = 860 / n;
      let k = 1.8;
      for (const sl of lijst) {
        const m = tekeningMaat(sl);
        k = Math.min(k, (breed - 40) / m.b, (vak.onder - vak.top - 50) / m.h);
      }
      const lijn = vak.onder - 18;
      const g = this.add.graphics();
      const tops: number[] = [];
      const xs: number[] = [];
      lijst.forEach((sl, i) => {
        const m = tekeningMaat(sl);
        const x = VLAK_B / 2 - 430 + breed * i + breed / 2;
        const img = this.plaats(this.grootPlaatje(sl, k), x, lijn).setOrigin(0.5, 1);
        this.alles.push(img);
        tops.push(lijn - m.h * k);
        xs.push(x);
      });
      /* De vloer waar alles op staat, en een stippellijn bij elke bovenkant. */
      g.lineStyle(6, 0x1d2b5e, 1);
      g.lineBetween(VLAK_B / 2 - 440, lijn + 2, VLAK_B / 2 + 440, lijn + 2);
      const x0 = xs[0] - breed / 2 + 20;
      const x1 = xs[n - 1] + breed / 2 - 20;
      for (const t of tops) {
        for (let x = x0; x < x1; x += 26) {
          g.lineStyle(5, 0x1d2b5e, 1);
          g.lineBetween(x, t, Math.min(x + 14, x1), t);
          g.lineStyle(2.5, 0xffc845, 1);
          g.lineBetween(x, t, Math.min(x + 14, x1), t);
        }
      }
      this.alles.push(g);
    }

    bouw(p: MetenProps, verschijn: boolean) {
      this.leeg();
      const ind = indeling(p);
      const nieuw: (Box | Img)[] = [];
      if (p.vergelijk?.length) this.bouwVergelijk(p.vergelijk, ind);
      else if (p.balans) nieuw.push(...this.bouwBalans(p.balans));
      else if (ind.groot && p.groot) {
        const g = this.plaats(this.grootPlaatje(p.groot, ind.groot.k), ind.groot.x, ind.groot.y);
        this.alles.push(g);
      }
      const kaarten = p.kaarten ?? [];
      if (kaarten.length) {
        const k = gedeeldeSchaal(kaarten, ind.kaarten[0].b, ind.kaarten[0].h);
        kaarten.forEach((d, i) => nieuw.push(this.nieuwDing(d, ind.kaarten[i], "kaart", d.id, k).box));
      }
      if (p.orden) {
        const o = p.orden;
        ind.vakken.forEach((r) => this.alles.push(this.plaats(this.vakPlaatje(r.b, r.h), r.x, r.y)));
        const r0 = ind.losse[0] ?? ind.vakken[0];
        const k = gedeeldeSchaal([...o.losse, ...(o.vastDingen ?? [])], r0.b, r0.h);
        for (const i of o.vast ?? []) {
          const id = o.vakken[i];
          if (!id) continue;
          nieuw.push(this.nieuwDing({ id, ...this.vindDing(p, id) }, ind.vakken[i], "vast", `vast:${id}`, k, o.klein).box);
        }
        o.losse.forEach((d, i) => nieuw.push(this.nieuwDing(d, ind.losse[i], "los", d.id, k, o.klein).box));
      }
      if (verschijn) nieuw.forEach((b, i) => this.tover(b, { vertraging: i * 60 }));
    }

    vindDing(p: MetenProps, id: string): Omit<MDing, "id"> {
      const d = p.orden?.vastDingen?.find((x) => x.id === id) ?? p.orden?.losse.find((x) => x.id === id);
      return d ?? { label: id };
    }

    zet(p: MetenProps) {
      this.p = p;
      const sig = JSON.stringify([
        p.nr,
        p.groot ?? null,
        p.vergelijk ?? null,
        p.balans ? [p.balans.links, p.balans.rechts] : null,
        !!(p.groot || p.balans || p.vergelijk?.length),
        (p.kaarten ?? []).map((k) => [k.id, k.tekening, k.label]),
        p.orden ? [p.orden.vakken.length, p.orden.klein, p.orden.onderGroot, p.orden.vast ?? [], (p.orden.vast ?? []).map((i) => p.orden!.vakken[i]), p.orden.losse.map((k) => [k.id, k.tekening, k.label])] : null,
      ]);
      if (sig !== this.sig) {
        this.bouw(p, p.nr !== this.nr);
        this.sig = sig;
        this.nr = p.nr;
      }
      this.pasToe(p);
    }

    pasToe(p: MetenProps) {
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
      }
      /* De weegschaal: zakken (eerst recht, dan langzaam naar de zware kant). */
      if (p.balans && this.balk) {
        const doel = p.balans.kant * 0.2;
        if (p.balans.zak !== this.zak) {
          this.zak = p.balans.zak;
          this.zakTween?.stop();
          this.zetHoek(0);
          const t = { a: 0 };
          this.zakTween = this.tweens.add({ targets: t, a: doel, delay: rustig ? 0 : 900, duration: rustig ? 1 : 1400, ease: "Sine.easeInOut", onUpdate: () => this.zetHoek(t.a) });
        } else if (!this.zakTween?.isPlaying() && this.hoek !== doel) this.zetHoek(doel);
      }
      /* Getallen op de grote tekening (Bliepo telt mee). */
      const telSig = JSON.stringify([p.groot, p.tel ?? []]);
      if (telSig !== this.telSig) {
        for (const o of this.telLaag) o.destroy();
        this.telLaag = [];
        this.telSig = telSig;
        if (ind.groot && p.groot && p.tel?.length) {
          const pts = tekeningPunten(p.groot);
          const g = ind.groot;
          for (const { i, t } of p.tel) {
            const pt = pts[i];
            if (!pt) continue;
            const x = g.x - g.b / 2 + pt.x * g.k;
            const y = g.y - g.h / 2 + pt.y * g.k;
            const b = this.plaats(this.badgePlaatje(t), x, y).setDepth(15);
            b.setScale(Math.min(1, Math.max(0.6, g.k * 0.95)) / TX);
            this.telLaag.push(b);
          }
        }
      }
    }

    maakGolf() {
      this.canvasPlaatje("mg-golf", 80, 80, (c) =>
        tekenVormen(c, [
          { d: blok(7, 7, 66, 66, 33), rand: PALET.navy, dik: 9 },
          { d: blok(7, 7, 66, 66, 33), rand: PALET.geel, dik: 5.5 },
        ]),
      );
    }

    /** Goed: een vlakke gele ring die even groter wordt (één keer getekend). */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    golf(x: number, y: number, _kleur?: number) {
      if (rustig) return;
      this.maakGolf();
      const g = this.plaats("mg-golf", x, y).setScale(0.7 / TX).setDepth(20);
      this.tweens.add({ targets: g, scale: 1.5 / TX, alpha: { from: 1, to: 0.2 }, duration: 340, ease: "Cubic.easeOut", onComplete: () => g.destroy() });
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
      if (!p || rustig || !p.orden) return;
      const ind = indeling(p);
      const van = ind.losse.find((_, i) => !p.orden!.vakken.includes(p.orden!.losse[i].id));
      const naar = ind.vakken[p.orden.vakken.findIndex((x) => x === null)];
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

    raak(x: number, y: number, alleenActief: boolean): Ding | null {
      const p = this.p;
      if (!p) return null;
      const lijst = [...this.dingen.values()].reverse();
      for (const d of lijst) {
        if (!binnen({ ...d.r, x: d.box.x, y: d.box.y }, x, y, 6)) continue;
        if (!alleenActief) return d;
        if (d.soort === "kaart" && p.kaartenActief && !p.uit?.includes(d.id)) return d;
        if (d.soort === "los" && p.orden?.actief && !p.orden.vakken.includes(d.id)) return d;
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
            if (d.zeg) zegKeuze(d.zeg);
          }
        }, 500);
      }
    }

    beweeg(p: Ptr) {
      const w = this.waar(p);
      const druk = this.druk;
      if (!druk) {
        if (!p.isDown && (p.event as PointerEvent | undefined)?.pointerType === "mouse") {
          const d = this.raak(w.x, w.y, false);
          const id = d ? `${d.soort}:${d.id}` : null;
          if (id !== this.zweef) {
            this.zweef = id;
            clearTimeout(this.stemKlok);
            if (d?.zeg) this.stemKlok = setTimeout(() => zegKeuze(d.zeg), 300);
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
    }

    los(p: Ptr) {
      const druk = this.druk;
      this.druk = null;
      clearTimeout(this.stemKlok);
      if (!druk) return;
      const d = druk.d;
      this.input.setDefaultCursor("default");
      if (druk.lang && !druk.sleept) return;
      if (d.soort === "kaart" && !druk.sleept) return void this.melder({ soort: "kaart", id: d.id });
      if (d.soort === "los" && this.p?.orden) {
        if (!druk.sleept) return void this.melder({ soort: "leg", id: d.id, vak: null });
        const ind = indeling(this.p);
        const vak = ind.vakken.findIndex((r, i) => !this.p!.orden!.vakken[i] && binnen(r, d.box.x, d.box.y, 30));
        if (vak >= 0) this.melder({ soort: "leg", id: d.id, vak });
        clearTimeout(this.terugKlok);
        this.terugKlok = setTimeout(() => {
          if (this.p) this.pasToe(this.p);
        }, vak >= 0 ? 260 : 0);
      }
      void p;
    }

    demo(ms: number) {
      const eind = performance.now() + ms;
      const lijst = [...this.dingen.values()];
      let i = 0;
      let wissel = 0;
      const stap = () => {
        if (performance.now() > eind) return;
        const d = lijst[i++ % Math.max(1, lijst.length)];
        if (d) {
          this.golf(d.box.x, d.box.y);
          this.schud(d.box);
        } else this.golf(VLAK_B / 2, VLAK_H / 2);
        if (this.balk) {
          wissel = wissel ? 0 : 1;
          const t = { a: this.hoek };
          this.tweens.add({ targets: t, a: wissel ? -0.2 : 0.2, duration: 400, onUpdate: () => this.zetHoek(t.a) });
        }
        this.time.delayedCall(450, stap);
      };
      stap();
    }
  }
  return Meten as unknown as new () => import("phaser").Scene;
}

/* ---------- het vlak ---------- */

export function SqulaMetenVlak(props: MetenProps & Vlakbasis) {
  const { meld, schaal } = props;
  const { plek, scene } = useHoloMotor<MetenScene>(schaal, maakScene, { invoer: true });
  const meldRef = useRef(meld);
  useEffect(() => {
    meldRef.current = meld;
  }, [meld]);

  useEffect(() => {
    const el = document.querySelector("[data-squla-meten]");
    if (el) zetLettertype(getComputedStyle(el).fontFamily);
  }, []);

  useEffect(() => {
    scene?.verbind((g) => meldRef.current(g));
  }, [scene]);

  const { nr, groot, tel, balans, vergelijk, kaarten, kaartenActief, uit, goed, fout, licht, orden } = props;
  const stand = JSON.stringify({ nr, groot, tel, balans, vergelijk, kaarten, kaartenActief, uit, goed, fout, licht, orden });
  useEffect(() => {
    if (scene) scene.zet(JSON.parse(stand) as MetenProps);
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
  const namen = [...(kaarten ?? []), ...(orden?.losse ?? [])].map((d) => d.zeg ?? d.label ?? "").filter(Boolean);
  const namenSleutel = namen.join("\n");
  useEffect(() => {
    if (namenSleutel) haalKeuzesAlvast(namenSleutel.split("\n"));
  }, [namenSleutel]);

  /* Onzichtbare knoppen over alles wat je kunt tikken: toetsenbord en automatische test. */
  const ind = indeling(props);
  const knoppen: { id: string; zeg: string; r: Rect; doe: () => void }[] = [];
  if (kaartenActief) (kaarten ?? []).forEach((d, i) => !uit?.includes(d.id) && knoppen.push({ id: d.id, zeg: d.zeg ?? d.label ?? "", r: ind.kaarten[i], doe: () => meld({ soort: "kaart", id: d.id }) }));
  if (orden?.actief) orden.losse.forEach((d, i) => !orden.vakken.includes(d.id) && knoppen.push({ id: d.id, zeg: d.zeg ?? d.label ?? "", r: ind.losse[i], doe: () => meld({ soort: "leg", id: d.id, vak: null }) }));

  return (
    <div className={s.vlak} data-squla-meten="">
      <div ref={plek} style={{ ...HOLO_CANVAS, touchAction: "none" }} aria-hidden />
      <div data-knop="keuzes" className={s.knoppen}>
        {knoppen.map((k) => (
          <button
            key={k.id}
            type="button"
            className={s.ding}
            data-ding={k.id}
            aria-label={k.zeg || "plaatje"}
            style={{ left: k.r.x - k.r.b / 2, top: k.r.y - k.r.h / 2, width: k.r.b, height: k.r.h }}
            onFocus={(e) => {
              if (k.zeg && e.currentTarget.matches(":focus-visible")) zegKeuze(k.zeg);
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

/* ---------- de tekeningen op de kaart aan het eind (244 × 190) ---------- */

const N = PALET.navy;

export function KaartPizza() {
  return (
    <svg viewBox="0 0 244 190" width={244} height={190} aria-hidden="true">
      <circle cx="96" cy="100" r="62" fill="#f0b15c" stroke={N} strokeWidth={RAND_DUN * 1.4} />
      <circle cx="96" cy="100" r="50" fill="#e2563f" />
      <circle cx="80" cy="84" r="10" fill="#ffe08a" />
      <circle cx="112" cy="110" r="10" fill="#ffe08a" />
      <circle cx="88" cy="122" r="8" fill="#b8332b" />
      <circle cx="116" cy="80" r="8" fill="#b8332b" />
      <circle cx="196" cy="128" r="30" fill="#f0b15c" stroke={N} strokeWidth={RAND_DUN * 1.4} />
      <circle cx="196" cy="128" r="22" fill="#e2563f" />
      <circle cx="190" cy="122" r="6" fill="#ffe08a" />
    </svg>
  );
}

export function KaartHoeveelheden() {
  return (
    <svg viewBox="0 0 244 190" width={244} height={190} aria-hidden="true">
      <path d="M 70 84 Q 122 24 174 84" fill="none" stroke={N} strokeWidth={12} strokeLinecap="round" />
      <path d="M 70 84 Q 122 24 174 84" fill="none" stroke="#d39b62" strokeWidth={6} strokeLinecap="round" />
      <circle cx="104" cy="80" r="16" fill="#e8453c" stroke={N} strokeWidth={RAND_DUN} />
      <circle cx="138" cy="82" r="15" fill="#55c26f" stroke={N} strokeWidth={RAND_DUN} />
      <path d="M 48 88 L 66 166 H 178 L 196 88 Z" fill="#d39b62" stroke={N} strokeWidth={RAND_DUN * 1.4} strokeLinejoin="round" />
      <rect x="42" y="80" width="160" height="16" rx="8" fill="#e9c48f" stroke={N} strokeWidth={RAND_DUN} />
    </svg>
  );
}

export function KaartOppervlakte() {
  const vakjes = [];
  for (let j = 0; j < 3; j++) for (let i = 0; i < 4; i++) vakjes.push(<rect key={`${i}-${j}`} x={46 + i * 38} y={44 + j * 38} width={36} height={36} rx={4} fill={(i + j) % 2 ? PALET.geel : "#55c26f"} stroke={N} strokeWidth={2.5} />);
  return (
    <svg viewBox="0 0 244 190" width={244} height={190} aria-hidden="true">
      <rect x="34" y="32" width="176" height="138" rx="12" fill="#d39b62" stroke={N} strokeWidth={RAND_DUN * 1.4} />
      {vakjes}
    </svg>
  );
}
