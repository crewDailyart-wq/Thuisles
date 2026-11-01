"use client";

/**
 * Het speelvlak van de lessen "Splitsen" (Splitsen 1, Splitsen 2, Delen) en
 * de schattenjacht ("Rekenen met getallen") naar Squla groep 3 (31 oktober
 * 2026, opdracht eigenaar). Eén algemeen vlak: de les geeft een lijst
 * onderdelen (`Deel`) met vaste plekken in punten van het vlak (980 × 720).
 *
 * - echte dingen (pionnen, ballen, munten …) zijn vaste plaatjes uit
 *   public/voorwerpen (via `tekenVoorwerp`); de les zet ze in `voorwerpen`;
 * - rekenmateriaal (splitshuisje, splitspaal, het tienvak, staafjes, lijnen)
 *   wordt strak in code getekend;
 * - geld: de uitgeknipte munt uit public/geld/los/ en het briefje met
 *   "specimen" uit public/geld/ (nooit vergroot, geen kader);
 * - getallen en letters zijn scherpe HTML-tekst erbovenop.
 *
 * Stijl (besluit Sara, 31 oktober 2026): donker (`nacht: true`), plaatjes
 * zonder vaste gloed en zonder kaders. Iets licht alleen op als het iets
 * betekent: `licht` (Bliepo wijst aan of telt mee, of het kind kiest het),
 * `goedIds` en de tellers `goed` (alles even groen + lichtgolf) en `fout`
 * (zacht schudden). `uit` = grijs en half doorzichtig (wat eraf gaat);
 * `toon` = onderdelen met `verborgen` laten zien. Tikken op een onderdeel
 * met `s: "tik"` meldt `{ soort: "tik", id }`.
 */

import { useEffect } from "react";
import type { Vlakbasis } from "../soort";
import { holoBasis, TX, WARM, GOED, type PhaserModule } from "../holo/basis";
import { HOLO_CANVAS, useHoloMotor } from "../holo/motor";
import { tekenVoorwerp, voorwerpBeeld } from "../voorwerpen";
import { speelLesgeluid } from "@/lib/lesgeluiden";
import s from "./squla-splitsen.module.css";

/* ---------- soorten ---------- */

export type Deel =
  /** Een groepje dingen in rijen (`per` op een rij), of los door elkaar (`los` = breedte en hoogte van het gebied). */
  | { s: "groep"; id: string; vw: string; n: number; x: number; y: number; per?: number; cel?: number; maat?: number; los?: [number, number]; verborgen?: boolean; label?: string; kl?: string; kleuren?: string[] }
  /** Eén ding (`maat` = breedte en hoogte in punten). */
  | { s: "ding"; id: string; vw: string; x: number; y: number; maat: number; verborgen?: boolean; kl?: string }
  | { s: "geld"; id: string; soort: "briefje-10" | "munt-1"; x: number; y: number; maat: number }
  | { s: "tekst"; id: string; t: string; x: number; y: number; grootte?: number; kleur?: string; verborgen?: boolean }
  /** Het splitshuisje: bovenaan het totaal (onder het dak), onder twee kamers. Leeg = lege kamer. */
  | { s: "huisje"; id: string; x: number; y: number; b?: number; top: string; links: string; rechts: string; dak?: boolean; stippen?: boolean; kleuren?: GetalKleuren }
  /** De splitspaal: een rondje met het totaal, een lijn naar beneden en twee takken. */
  | { s: "paal"; id: string; x: number; y: number; top: string; links: string; rechts: string; kleuren?: GetalKleuren }
  /** Het tienvak (eierdoos, 2 rijen van 5): `n` ballen te zien, `doek` vakjes onder een doek. */
  | { s: "tienvak"; id: string; x: number; y: number; vw: string; n: number; doek: number; kl?: string; kl2?: string }
  /** Een staafje van `n` blokjes (links beginnend bij x). */
  | { s: "staaf"; id: string; x: number; y: number; n: number; kleur: number; blok?: number }
  /** Een rij letters: de eerste `tot` letters van het woord staan er, de rest is een streepje. */
  | { s: "letters"; id: string; x: number; y: number; woord: string; tot: number }
  | { s: "lijn"; id: string; x1: number; y1: number; x2: number; y2: number; goed?: boolean }
  /** Iets om op te tikken (onzichtbaar; de tekening staat eronder). */
  | { s: "tik"; id: string; x: number; y: number; b: number; h: number; aria: string };

/**
 * Gekoppelde kleuren (BOUWREGELS 2.1): elk getal in een splitsing heeft een eigen
 * kleur (een kleurnaam uit KLEUR), en de dingen die erbij horen hebben precies
 * die kleur.
 */
export type GetalKleuren = { top?: string; links?: string; rechts?: string };

/** Dezelfde kleuren als de getallen in de zinnen van Bliepo (KLEURNAAM in Lesscherm.tsx). */
export const KLEUR: Record<string, string> = {
  rood: "#ff7b7b",
  oranje: "#ffad5c",
  geel: "#ffe066",
  groen: "#7ee0a0",
  blauw: "#8fc4ff",
  paars: "#c9a2ff",
  roze: "#ff9fd2",
  wit: "#ffffff",
};

/** Een voorwerp in een andere kleur: elk gekleurd stukje krijgt de tint van `hex`, donkere randen en glans blijven. Eén keer gedaan (gebakken). */
function kleurPixels(c: CanvasRenderingContext2D, hex: string) {
  const cv = c.canvas;
  const im = c.getImageData(0, 0, cv.width, cv.height);
  const d = im.data;
  const doel = [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
  const hsl = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
    if (mx === mn) return [0, 0, l];
    const dd = mx - mn, sat = l > 0.5 ? dd / (2 - mx - mn) : dd / (mx + mn);
    const h = mx === r ? (g - b) / dd + (g < b ? 6 : 0) : mx === g ? (b - r) / dd + 2 : (r - g) / dd + 4;
    return [h / 6, sat, l];
  };
  const rgb = (h: number, sat: number, l: number) => {
    const q = l < 0.5 ? l * (1 + sat) : l + sat - l * sat, p = 2 * l - q;
    const f = (t: number) => {
      t = (t + 1) % 1;
      return 255 * (t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p);
    };
    return [f(h + 1 / 3), f(h), f(h - 1 / 3)];
  };
  const [th, ts, tl] = hsl(doel[0], doel[1], doel[2]);
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] === 0) continue;
    const [, sat, l] = hsl(d[i], d[i + 1], d[i + 2]);
    if (l < 0.22) continue; /* donkere randen blijven */
    if (sat < 0.25 && l < 0.55) continue; /* grijze schaduw en zwarte vlakken blijven */
    /* gekleurd (of wit) stuk: de tint van het doel, met de lichtval van het plaatje */
    const nl = Math.min(0.78, Math.max(0.35, tl + (l - 0.5) * 0.3));
    const [r, g, b] = rgb(th, Math.min(1, ts * (sat < 0.25 ? 1 : 1.1)), nl);
    d[i] = r; d[i + 1] = g; d[i + 2] = b;
  }
  c.putImageData(im, 0, 0);
}

export type Beeld = { id: string; delen: Deel[] };

export type SplitsProps = {
  beeld: Beeld | null;
  licht?: string[];
  goedIds?: string[];
  uit?: string[];
  toon?: string[];
  actief?: boolean;
  goed?: number;
  fout?: number;
};

/* ---------- maten ---------- */

const MIDDEN = { x: 490, y: 380 };
const VW = 96;
const TIEN = { cel: 84 };
const HUIS = { b: 240, kamer: 92, dak: 62 };

/** Een vaste "toevalsreeks": elke keer dezelfde plekken. */
function zaad(tekst: string) {
  let h = 2166136261;
  for (const ch of tekst) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Waar de dingen van een groepje staan. */
export function groepPlekken(d: Extract<Deel, { s: "groep" }>) {
  const cel = d.cel ?? 70;
  if (d.los) {
    const [b, h] = d.los;
    const r = zaad(`${d.id}-${d.n}`);
    const pt: { x: number; y: number }[] = [];
    for (let afstand = cel * 1.05; pt.length < d.n && afstand > cel * 0.6; afstand -= 4) {
      pt.length = 0;
      for (let p = 0; p < 4000 && pt.length < d.n; p++) {
        const x = d.x - b / 2 + cel / 2 + r() * (b - cel);
        const y = d.y - h / 2 + cel / 2 + r() * (h - cel);
        if (pt.every((q) => Math.hypot(q.x - x, q.y - y) >= afstand)) pt.push({ x, y });
      }
    }
    return { cel, plekken: pt, onder: d.y + h / 2 };
  }
  const per = Math.max(1, Math.min(d.per ?? 5, d.n || 1));
  const rijen = Math.ceil(d.n / per);
  const x0 = d.x - (per * cel) / 2 + cel / 2;
  const y0 = d.y - (rijen * cel) / 2 + cel / 2;
  const plekken = Array.from({ length: d.n }, (_, i) => ({ x: x0 + (i % per) * cel, y: y0 + Math.floor(i / per) * cel }));
  return { cel, plekken, onder: d.y + (rijen * cel) / 2 };
}

const tienVak = (d: Extract<Deel, { s: "tienvak" }>, i: number) => ({ x: d.x + ((i % 5) - 2) * TIEN.cel, y: d.y + (Math.floor(i / 5) - 0.5) * TIEN.cel });

/** De teksten (scherpe HTML) bij een onderdeel. */
const kleurVan = (naam?: string) => (naam ? KLEUR[naam] : undefined);
type Tekst = { k: string; id: string; x: number; y: number; t: string; grootte: number; kleur?: string };
function tekstenVan(d: Deel): Tekst[] {
  if (d.s === "tekst") return [{ k: d.id, id: d.id, x: d.x, y: d.y, t: d.t, grootte: d.grootte ?? 56, kleur: d.kleur }];
  if (d.s === "groep" && d.label) {
    const p = groepPlekken(d);
    return [{ k: `${d.id}-l`, id: d.id, x: d.x, y: p.onder + 30, t: d.label, grootte: 46, kleur: kleurVan(d.kl) }];
  }
  if (d.s === "huisje") {
    const b = d.b ?? HUIS.b;
    const k = b / HUIS.b;
    const kamer = HUIS.kamer * k * (d.stippen ? 1.3 : 1);
    const ky = d.y + (d.stippen ? kamer * 0.3 : kamer / 2);
    const g = 52 * k;
    const lijst: Tekst[] = [
      { k: `${d.id}-l`, id: d.id, x: d.x - b / 4, y: ky, t: d.links, grootte: g, kleur: kleurVan(d.kleuren?.links) },
      { k: `${d.id}-r`, id: d.id, x: d.x + b / 4, y: ky, t: d.rechts, grootte: g, kleur: kleurVan(d.kleuren?.rechts) },
    ];
    if (d.dak !== false) lijst.push({ k: `${d.id}-t`, id: d.id, x: d.x, y: d.y - HUIS.dak * k * 0.42, t: d.top, grootte: g * 0.92, kleur: kleurVan(d.kleuren?.top) });
    return lijst.filter((t) => t.t !== "");
  }
  if (d.s === "paal")
    return [
      { k: `${d.id}-t`, id: d.id, x: d.x, y: d.y, t: d.top, grootte: 50, kleur: kleurVan(d.kleuren?.top) },
      { k: `${d.id}-l`, id: d.id, x: d.x - 100, y: d.y + 190, t: d.links, grootte: 54, kleur: kleurVan(d.kleuren?.links) },
      { k: `${d.id}-r`, id: d.id, x: d.x + 100, y: d.y + 190, t: d.rechts, grootte: 54, kleur: kleurVan(d.kleuren?.rechts) },
    ].filter((t) => t.t !== "");
  return [];
}

/** Rekenmateriaal in code: lijnen van huisje, paal, tienvak, staafjes en verbindingen. */
function tekenLijnen(gr: import("phaser").GameObjects.Graphics, delen: Deel[], kleur: (id: string) => number | null) {
  gr.clear();
  for (const d of delen) {
    const k = kleur(d.id);
    if (d.s === "huisje") {
      const b = d.b ?? HUIS.b;
      const f = b / HUIS.b;
      const kamer = HUIS.kamer * f * (d.stippen ? 1.3 : 1);
      const x0 = d.x - b / 2;
      gr.lineStyle(5 * Math.max(0.7, f), k ?? 0xdcecff, 1);
      gr.fillStyle(0x0b1d4a, 0.55);
      gr.fillRect(x0, d.y, b, kamer);
      gr.strokeRect(x0, d.y, b, kamer);
      gr.lineBetween(d.x, d.y, d.x, d.y + kamer);
      if (d.dak !== false) {
        gr.fillTriangle(x0 - 10 * f, d.y, d.x, d.y - HUIS.dak * f * 1.25, x0 + b + 10 * f, d.y);
        gr.strokeTriangle(x0 - 10 * f, d.y, d.x, d.y - HUIS.dak * f * 1.25, x0 + b + 10 * f, d.y);
      }
      if (d.stippen) {
        for (const [kant, tekst] of [[-1, d.links], [1, d.rechts]] as const) {
          const n = Number(tekst) || 0;
          const cx = d.x + (kant * b) / 4;
          const r = 7 * f;
          const per = Math.min(5, n);
          for (let i = 0; i < n; i++) {
            const rij = Math.floor(i / 5);
            const inRij = rij === Math.floor((n - 1) / 5) ? n - rij * 5 : per;
            gr.fillStyle(kant < 0 ? 0xc9a2ff : 0xffad5c, 1); /* links paars, rechts oranje (BOUWREGELS 2.1) */
            gr.fillCircle(cx + ((i % 5) - (inRij - 1) / 2) * r * 2.6, d.y + kamer * 0.66 + rij * r * 2.6, r);
          }
        }
      }
    } else if (d.s === "paal") {
      gr.lineStyle(6, k ?? 0xdcecff, 1);
      gr.fillStyle(0x0b1d4a, 0.7);
      gr.fillCircle(d.x, d.y, 44);
      gr.strokeCircle(d.x, d.y, 44);
      gr.lineBetween(d.x, d.y + 44, d.x, d.y + 100);
      gr.lineBetween(d.x, d.y + 100, d.x - 100, d.y + 150);
      gr.lineBetween(d.x, d.y + 100, d.x + 100, d.y + 150);
    } else if (d.s === "tienvak") {
      gr.lineStyle(4, k ?? 0xdcecff, 1);
      gr.fillStyle(0x0b1d4a, 0.5);
      const c = TIEN.cel;
      gr.fillRoundedRect(d.x - 2.5 * c - 10, d.y - c - 10, 5 * c + 20, 2 * c + 20, 18);
      gr.strokeRoundedRect(d.x - 2.5 * c - 10, d.y - c - 10, 5 * c + 20, 2 * c + 20, 18);
      for (let i = 0; i < 10; i++) {
        const q = tienVak(d, i);
        gr.strokeCircle(q.x, q.y, c * 0.4);
      }
    } else if (d.s === "staaf") {
      const bl = d.blok ?? 40;
      gr.fillStyle(d.kleur, 1);
      gr.fillRect(d.x, d.y - bl / 2, d.n * bl, bl);
      gr.lineStyle(3, k ?? 0x0b1d4a, 1);
      for (let i = 0; i < d.n; i++) gr.strokeRect(d.x + i * bl, d.y - bl / 2, bl, bl);
      if (k !== null) {
        gr.lineStyle(5, k, 1);
        gr.strokeRect(d.x, d.y - bl / 2, d.n * bl, bl);
      }
    } else if (d.s === "lijn") {
      const lk = d.goed ? GOED : (k ?? 0xffffff);
      gr.lineStyle(8, lk, 1);
      gr.lineBetween(d.x1, d.y1, d.x2, d.y2);
      gr.fillStyle(lk, 1);
      gr.fillCircle(d.x1, d.y1, 10);
      gr.fillCircle(d.x2, d.y2, 10);
    }
  }
}

/** Welke onderdelen Phaser tekent (bij een verandering hierin: opnieuw tevoorschijn toveren). */
const phaserSleutel = (b: Beeld | null) => (b ? `${b.id}|${JSON.stringify(b.delen.filter((d) => d.s === "groep" || d.s === "ding" || d.s === "geld" || d.s === "tienvak"))}` : "");

/* ---------- de scène ---------- */

type Staat = { licht: string[]; goedIds: string[]; uit: string[]; toon: string[] };

interface SplitsScene {
  zetBeeld(b: Beeld | null): void;
  zetStaat(st: Staat): void;
  goed(): void;
  fout(): void;
}

function maakScene(Phaser: PhaserModule, rustig: boolean) {
  const Basis = holoBasis(Phaser, rustig);
  type Img = import("phaser").GameObjects.Image;
  type Box = import("phaser").GameObjects.Container;
  type Gfx = import("phaser").GameObjects.Graphics;

  class Splits extends Basis implements SplitsScene {
    hoofd: Box | null = null;
    lijnen: Gfx | null = null;
    sleutel = "";
    beeld: Beeld | null = null;
    imgs: { im: Img; id: string; sub: string; verborgen: boolean }[] = [];
    flitsTot = 0;
    staat: Staat = { licht: [], goedIds: [], uit: [], toon: [] };

    constructor() {
      super("squla-splitsen");
    }

    preload() {
      this.load.image("sps-briefje-10", "/geld/briefje-10-euro.jpg");
      this.load.image("sps-munt-1", "/geld/los/munt-1-euro.png");
    }

    /** Een voorwerp als plaatje (zonder gloed), één keer getekend. */
    vw(naam: string, kl?: string) {
      const hex = kl ? KLEUR[kl] : undefined;
      const sl = hex ? `sps-vw-${naam}-${kl}` : `sps-vw-${naam}`;
      this.canvasPlaatje(sl, VW, VW, (c) => {
        tekenVoorwerp(c, naam, 4, 4, VW - 8, VW - 8);
        if (hex) kleurPixels(c, hex);
      });
      return sl;
    }

    /** Hetzelfde plaatje mét gloed (één keer gebakken), voor het moment dat het oplicht. */
    texG(basis: string, kleur: number) {
      const naam = `${basis}-g${kleur.toString(16)}`;
      this.bak(basis, naam, kleur);
      return naam;
    }

    zetBeeld(b: Beeld | null) {
      this.beeld = b;
      const sleutel = phaserSleutel(b);
      if (sleutel !== this.sleutel) {
        this.sleutel = sleutel;
        if (this.hoofd) this.verdwijn(this.hoofd);
        this.hoofd = null;
        this.lijnen = null;
        this.imgs = [];
        if (b) this.bouw(b);
      }
      this.tekenStaat();
    }

    bouw(b: Beeld) {
      const box = this.add.container(MIDDEN.x, MIDDEN.y);
      this.hoofd = box;
      const lijnen = this.add.graphics();
      lijnen.setPosition(-MIDDEN.x, -MIDDEN.y);
      box.add(lijnen);
      this.lijnen = lijnen;
      const zet = (sl: string, x: number, y: number, maat: number, id: string, sub: string, verborgen = false, hoog?: number) => {
        const im = this.plaats(sl, x - MIDDEN.x, y - MIDDEN.y);
        if (hoog !== undefined) im.setDisplaySize(maat, hoog);
        else im.setScale(maat / (im.width / TX) / TX);
        im.setData("basis", sl);
        box.add(im);
        this.imgs.push({ im, id, sub, verborgen });
        return im;
      };
      for (const d of b.delen) {
        if (d.s === "groep") {
          const p = groepPlekken(d);
          p.plekken.forEach((q, i) => zet(this.vw(d.vw, d.kleuren?.[i] ?? d.kl), q.x, q.y, d.maat ?? p.cel * 0.9, d.id, `${d.id}.${i}`, d.verborgen));
        } else if (d.s === "ding") zet(this.vw(d.vw, d.kl), d.x, d.y, d.maat, d.id, d.id, d.verborgen);
        else if (d.s === "geld") {
          const sl = `sps-${d.soort}`;
          const t = this.textures.get(sl).getSourceImage() as HTMLImageElement;
          const im = this.add.image(d.x - MIDDEN.x, d.y - MIDDEN.y, sl);
          im.setScale(d.maat / t.width);
          im.setData("basis", sl);
            box.add(im);
          this.imgs.push({ im, id: d.id, sub: d.id, verborgen: false });
        } else if (d.s === "tienvak") {
          for (let i = 0; i < d.n + d.doek; i++) {
            const q = tienVak(d, i);
            zet(this.vw(d.vw, i < d.n ? d.kl : d.kl2), q.x, q.y, TIEN.cel * 0.72, d.id, `${d.id}.${i}`);
          }
          /* De doek: over de vakjes die je niet ziet (per rij één stuk, op maat getekend). */
          for (const rij of [0, 1]) {
            const vakken = Array.from({ length: d.doek }, (_, k) => d.n + k).filter((i) => Math.floor(i / 5) === rij);
            if (!vakken.length) continue;
            const a = tienVak(d, vakken[0]);
            const z = tienVak(d, vakken[vakken.length - 1]);
            const b = Math.round(z.x - a.x + TIEN.cel + 4);
            const h = TIEN.cel + 4;
            const sl = `sps-doek-${b}x${h}`;
            this.canvasPlaatje(sl, b, h, (c) => c.drawImage(voorwerpBeeld("doek"), 0, 0, b, h));
            zet(sl, (a.x + z.x) / 2, a.y, b, `${d.id}-doek`, `${d.id}-doek`);
          }
        }
      }
      this.tover(box);
      /* De gloed-plaatjes alvast bakken, één per keer (geen hapering later). */
      const sleutels = [...new Set(this.imgs.map((x) => x.im.getData("basis") as string))];
      sleutels.forEach((sl, i) =>
        this.time.delayedCall(300 + i * 80, () => {
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
      const kleur = (id: string, sub = id) => (flits || st.goedIds.includes(id) || st.goedIds.includes(sub) ? GOED : st.licht.includes(id) || st.licht.includes(sub) ? WARM : null);
      for (const { im, id, sub, verborgen } of this.imgs) {
        if (!im.active) continue;
        im.setVisible(!verborgen || st.toon.includes(id));
        const grijs = st.uit.includes(id) || st.uit.includes(sub);
        im.setAlpha(grijs ? 0.3 : 1);
        if (grijs) im.setTint(0x9aa3b5);
        else im.clearTint();
        const k = grijs ? null : kleur(id, sub);
        const basis = im.getData("basis") as string;
        const doel = k === null ? basis : this.texG(basis, k);
        /* De gloed-versie heeft alleen een rand eromheen: de schaal blijft gelijk. */
        if (im.texture.key !== doel) im.setTexture(doel);
      }
      if (this.lijnen && this.beeld) tekenLijnen(this.lijnen, this.beeld.delen, (id) => (st.uit.includes(id) ? 0x56607a : kleur(id)));
    }

    goed() {
      this.golf(MIDDEN.x, MIDDEN.y);
      this.flitsTot = performance.now() + 900;
      this.tekenStaat();
      this.time.delayedCall(950, () => this.tekenStaat());
    }

    fout() {
      if (this.hoofd) this.schud(this.hoofd);
    }

    /** Voor `npm run vloeiend`: het beeld van nu steeds opnieuw tevoorschijn toveren, met de lichtgolf. */
    demo(ms: number) {
      const eind = performance.now() + ms;
      const b = this.beeld;
      let k = 0;
      const stap = () => {
        if (performance.now() > eind) return;
        if (b) this.zetBeeld({ ...b, id: `${b.id}-demo-${k++}` });
        this.time.delayedCall(420, () => this.goed());
        this.time.delayedCall(900, stap);
      };
      stap();
    }
  }
  return Splits as unknown as new () => import("phaser").Scene;
}

/* ---------- het vlak ---------- */

export function SqulaSplitsVlak({ beeld, licht = [], goedIds = [], uit = [], toon = [], actief = false, goed = 0, fout = 0, meld, schaal }: SplitsProps & Vlakbasis) {
  const { plek, scene } = useHoloMotor<SplitsScene>(schaal, maakScene, { invoer: false });
  const beeldSleutel = JSON.stringify(beeld);
  useEffect(() => {
    scene?.zetBeeld(JSON.parse(beeldSleutel) as Beeld | null);
  }, [scene, beeldSleutel]);
  const staatSleutel = JSON.stringify({ licht, goedIds, uit, toon });
  useEffect(() => {
    scene?.zetStaat(JSON.parse(staatSleutel) as Staat);
  }, [scene, staatSleutel, beeldSleutel]);
  useEffect(() => {
    if (scene && goed > 0) scene.goed();
  }, [scene, goed]);
  useEffect(() => {
    if (scene && fout > 0) scene.fout();
  }, [scene, fout]);

  const delen = beeld?.delen ?? [];
  const zicht = (d: Deel) => !("verborgen" in d && d.verborgen) || toon.includes(d.id);
  const teksten = delen.filter(zicht).flatMap(tekstenVan);
  const letters = delen.filter((d): d is Extract<Deel, { s: "letters" }> => d.s === "letters");
  const tikken = delen.filter((d): d is Extract<Deel, { s: "tik" }> => d.s === "tik");
  const stijlVan = (id: string) => (goedIds.includes(id) ? s.goed : licht.includes(id) ? s.licht : uit.includes(id) ? s.uit : "");

  return (
    <div className={s.vlak}>
      <div ref={plek} style={HOLO_CANVAS} aria-hidden />
      {teksten.map((t) => (
        <div
          key={`${beeld?.id}-${t.k}`}
          className={`${s.getal} ${t.t === "?" ? s.vraag : ""} ${stijlVan(t.id)}`}
          style={{ left: t.x, top: t.y, fontSize: t.grootte, color: t.kleur }}
          aria-hidden
        >
          {t.t}
        </div>
      ))}
      {letters.map((r) => (
        <div key={r.id} className={s.letters} style={{ left: r.x, top: r.y }} aria-hidden>
          {[...r.woord].map((ch, i) => {
            const nr = [...r.woord].slice(0, i + 1).filter((c) => c !== " ").length;
            if (ch === " ") return <span key={i} className={s.spatie} />;
            const er = nr <= r.tot;
            return (
              <span key={i} className={`${s.letter} ${er ? s.er : ""} ${er && nr === r.tot ? s.nieuw : ""}`}>
                {er ? ch : ""}
              </span>
            );
          })}
        </div>
      ))}
      {tikken.map((t) => (
        <button
          key={t.id}
          type="button"
          className={s.tik}
          style={{ left: t.x - t.b / 2, top: t.y - t.h / 2, width: t.b, height: t.h }}
          data-ding={t.id}
          aria-label={t.aria}
          disabled={!actief || uit.includes(t.id)}
          onClick={() => {
            speelLesgeluid("tik");
            meld({ soort: "tik", id: t.id });
          }}
        />
      ))}
    </div>
  );
}

/* ---------- tekeningen voor de kaart aan het eind (244 × 190) ---------- */

export function KaartSplitsen() {
  return (
    <>
      <path d="M62 70 L122 26 L182 70 Z" fill="none" stroke="#ffffff" strokeWidth={5} strokeLinejoin="round" />
      <rect x={62} y={70} width={120} height={70} fill="none" stroke="#ffffff" strokeWidth={5} />
      <line x1={122} y1={70} x2={122} y2={140} stroke="#ffffff" strokeWidth={5} />
      <text x={122} y={64} textAnchor="middle" fontSize={26} fontWeight={800} fill="#ffd36e">7</text>
      <text x={92} y={116} textAnchor="middle" fontSize={30} fontWeight={800} fill="#c9a2ff">4</text>
      <text x={152} y={116} textAnchor="middle" fontSize={30} fontWeight={800} fill="#ffad5c">3</text>
    </>
  );
}

export function KaartDelen() {
  return (
    <>
      {[62, 122, 182].map((x) => (
        <g key={x}>
          <path d={`M${x - 34} 120 h68 q-4 36 -34 38 q-30 -2 -34 -38z`} fill="#7cc6f0" stroke="#ffffff" strokeWidth={4} />
          {[-14, 0, 14].map((d) => (
            <circle key={d} cx={x + d} cy={104} r={8} fill="#4f8fe8" stroke="#ffffff" strokeWidth={2} />
          ))}
        </g>
      ))}
    </>
  );
}

export function KaartSchat() {
  return (
    <>
      <path d="M40 40 l54 -14 l56 14 l54 -14 v120 l-54 14 l-56 -14 l-54 14z" fill="none" stroke="#ffffff" strokeWidth={5} strokeLinejoin="round" />
      <path d="M64 130 q34 -44 70 -22 q34 22 46 -50" stroke="#ffd36e" strokeWidth={5} strokeDasharray="10 9" fill="none" />
      <path d="M168 50 l18 18 M186 50 l-18 18" stroke="#ff7b7b" strokeWidth={7} />
    </>
  );
}
