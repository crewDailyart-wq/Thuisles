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

import { useEffect, useRef } from "react";
import type { Vlakbasis, Vlakgebeurtenis } from "../soort";
import { holoBasis, TX, WARM, GOED, VLAK_B, VLAK_H, type PhaserModule } from "../holo/basis";
import { HOLO_CANVAS, useHoloMotor } from "../holo/motor";
import { tekenVoorwerp, voorwerpBeeld } from "../voorwerpen";
import { speelLesgeluid } from "@/lib/lesgeluiden";
import { maakS1, type S1Motor, type S1Spec } from "./squla-splitsen-s1";
import { S2Laag, type S2, type S2Leg } from "./squla-splitsen2-sleep";
import s from "./squla-splitsen.module.css";

export type { S1Spec, S1Stand, S1Zone } from "./squla-splitsen-s1";

/* ---------- soorten ---------- */

export type Deel =
  /** Een groepje dingen in rijen (`per` op een rij), of los door elkaar (`los` = breedte en hoogte van het gebied). */
  | { s: "groep"; id: string; vw: string; n: number; x: number; y: number; per?: number; cel?: number; maat?: number; los?: [number, number]; verborgen?: boolean; label?: string; kl?: string; kleuren?: string[] }
  /** Eén ding (`maat` = breedte en hoogte in punten). */
  | { s: "ding"; id: string; vw: string; x: number; y: number; maat: number; verborgen?: boolean; kl?: string }
  /** Een beker met `n` potloden erin (gekleurd, licht uitgewaaierd, onderkant in de beker, bovenkant eruit); `x, y` = het midden van de tekening. */
  | { s: "potloden"; id: string; n: number; x: number; y: number }
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

/** Een tint van een kleur: `f` < 1 donkerder, > 1 lichter (naar wit). */
function tint(hex: string, f: number) {
  const v = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const w = v.map((x) => Math.round(f <= 1 ? x * f : x + (255 - x) * (f - 1)));
  return `rgb(${w[0]},${w[1]},${w[2]})`;
}

/**
 * Een muntje in glansstijl B (BOUWREGELS 7.7): zacht verloop (licht linksboven, donkerder rechtsonder), een
 * glimmend lichtvlekje, een dunne rand in een donkere tint van de eigen kleur, een ring en een zachte gloed.
 * Zonder kleur is het koper. Eén keer getekend (gebakken in een plaatje).
 */
function tekenMunt(c: CanvasRenderingContext2D, x: number, y: number, b: number, hex = "#d1814a") {
  const r = b / 2 - 5;
  const cx = x + b / 2;
  const cy = y + b / 2;
  c.save();
  /* zachte gloed in de eigen kleur */
  c.shadowColor = hex;
  c.shadowBlur = b * 0.09;
  c.beginPath();
  c.arc(cx, cy, r, 0, Math.PI * 2);
  c.fillStyle = hex;
  c.fill();
  c.restore();
  /* het verloop */
  const gr = c.createRadialGradient(cx - r * 0.4, cy - r * 0.45, r * 0.1, cx, cy, r * 1.05);
  gr.addColorStop(0, tint(hex, 1.45));
  gr.addColorStop(0.55, tint(hex, 1));
  gr.addColorStop(1, tint(hex, 0.72));
  c.beginPath();
  c.arc(cx, cy, r, 0, Math.PI * 2);
  c.fillStyle = gr;
  c.fill();
  c.lineWidth = Math.max(1.5, b * 0.022);
  c.strokeStyle = tint(hex, 0.45);
  c.stroke();
  /* de ring in het muntje */
  c.beginPath();
  c.arc(cx, cy, r * 0.66, 0, Math.PI * 2);
  c.lineWidth = Math.max(2, b * 0.05);
  c.strokeStyle = tint(hex, 0.62);
  c.stroke();
  c.beginPath();
  c.arc(cx, cy, r * 0.66 + c.lineWidth * 0.5 + 1, 0, Math.PI * 2);
  c.lineWidth = 1;
  c.strokeStyle = tint(hex, 1.3);
  c.stroke();
  /* het lichtvlekje */
  c.beginPath();
  c.arc(cx, cy, r * 0.82, Math.PI * 1.08, Math.PI * 1.5);
  c.lineWidth = Math.max(2, b * 0.05);
  c.lineCap = "round";
  c.strokeStyle = "rgba(255,255,255,0.75)";
  c.stroke();
}

export type Beeld = { id: string; delen: Deel[] };

/** De maat van de tekening van een beker met potloden (punten). */
const POT = { b: 190, h: 226 };

/**
 * Zelf slepen (2 november 2026, proef squla-splits-delen-1): `n` knikkers die het kind over `k` bakjes
 * verdeelt, op een zacht, half doorzichtig vlak. `nr` verandert = opnieuw beginnen (alles weer boven);
 * `auto` = zoveel knikkers rollen vanzelf één voor één over de bakjes (uitleg van Bliepo).
 */
export type Sleep = { n: number; k: number; nr: number; auto?: number; /** Welk voorwerp (standaard de knikker). */ vw?: string };

/** De kleurnamen van de bakjes (zelfde kleuren als de getallen in de zin, BOUWREGELS 2.1). */
export const SLEEP_BAKKLEUR = ["paars", "oranje", "groen", "roze", "blauw"];

export type SplitsProps = {
  beeld: Beeld | null;
  sleep?: Sleep | null;
  /** Splitsen 1: dingen of tegels slepen naar vakken (squla-splitsen-s1.ts). */
  s1?: S1Spec | null;
  /** Splitsen 2 en Delen: tegels, sommen of een ster slepen naar vakken (squla-splitsen2-sleep.ts). */
  s2?: S2 | null;
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

/** Vrolijke, volle kleuren voor de knikkers (afwisselend, zodat elke knikker apart te zien is). */
const KNIKKERS = ["#ff3b5c", "#ff9a1f", "#ffd21f", "#2fd16b", "#2e9bff", "#a35cff", "#ff4fb0", "#18c8c8"];
const KNIK_BOVEN = 120;
const BAK_BODEM = 566;
const BAK_GRENS = 250;

interface SplitsScene {
  zetBeeld(b: Beeld | null): void;
  zetSleep(s: Sleep | null, actief: boolean): void;
  zetS1(s: S1Spec | null, actief: boolean): void;
  zetS2(s: S2 | null, actief: boolean): void;
  verbind(meld: (g: Vlakgebeurtenis) => void): void;
  zetStaat(st: Staat): void;
  goed(): void;
  fout(): void;
}

function maakScene(Phaser: PhaserModule, rustig: boolean) {
  const Basis = holoBasis(Phaser, rustig);
  type Img = import("phaser").GameObjects.Image;
  type Box = import("phaser").GameObjects.Container;
  type Gfx = import("phaser").GameObjects.Graphics;
  type Ptr = import("phaser").Input.Pointer;
  type Knik = { im: Img; thuis: { x: number; y: number }; bak: number; hex: string };
  type SleepStaat = {
    sleutel: string;
    n: number;
    k: number;
    cel: number;
    W: number;
    H: number;
    bakX: number[];
    top: number;
    dia: number;
    trayDia: number;
    kn: Knik[];
    inhoud: number[][];
    box: Box;
    laagKnik: Box;
    laagSleep: Box;
    groen: Gfx;
    laatsteAuto: number | undefined;
  };

  class Splits extends Basis implements SplitsScene {
    hoofd: Box | null = null;
    lijnen: Gfx | null = null;
    sleutel = "";
    beeld: Beeld | null = null;
    imgs: { im: Img; id: string; sub: string; verborgen: boolean }[] = [];
    flitsTot = 0;
    staat: Staat = { licht: [], goedIds: [], uit: [], toon: [] };
    melder: (g: Vlakgebeurtenis) => void = () => {};
    sl: SleepStaat | null = null;
    slActief = false;
    s1m: S1Motor | null = null;
    s2L = new S2Laag(this as never, (p) => this.waar(p), () => (g: S2Leg) => this.melder(g));
    slDruk: { i: number; x0: number; y0: number; dx: number; dy: number; sleept: boolean } | null = null;

    constructor() {
      super("squla-splitsen");
    }

    verbind(meld: (g: Vlakgebeurtenis) => void) {
      this.melder = meld;
    }

    maak() {
      this.input.on("pointerdown", (p: Ptr) => this.slNeer(p));
      this.input.on("pointermove", (p: Ptr) => this.slBeweeg(p));
      this.input.on("pointerdown", (p: Ptr) => this.s2L.neer(p));
      this.input.on("pointermove", (p: Ptr) => this.s2L.beweeg(p));
      this.input.on("pointerup", (p: Ptr) => this.s2L.los(p));
      this.input.on("pointerupoutside", (p: Ptr) => this.s2L.los(p));
      this.input.on("pointerdown", (p: Ptr) => this.s1m?.neer(p));
      this.input.on("pointermove", (p: Ptr) => this.s1m?.beweeg(p));
      this.input.on("pointerup", (p: Ptr) => this.s1m?.los(p));
      this.input.on("pointerupoutside", (p: Ptr) => this.s1m?.los(p));
      this.input.on("pointerup", (p: Ptr) => this.slLos(p));
      this.input.on("pointerupoutside", (p: Ptr) => this.slLos(p));
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
        /* het kopermuntje is een gewone schijf: eigen getekend met glans (ook in een andere kleur) */
        if (naam === "kopermunt") tekenMunt(c, 4, 4, VW - 8, hex);
        else {
          tekenVoorwerp(c, naam, 4, 4, VW - 8, VW - 8);
          if (hex) kleurPixels(c, hex);
        }
      });
      return sl;
    }

    /** Een voorwerp in een eigen kleur op een los canvas (voor samengestelde tekeningen). */
    gekleurd(naam: string, b: number, h: number, hex?: string) {
      const cv = document.createElement("canvas");
      cv.width = Math.ceil(b * TX);
      cv.height = Math.ceil(h * TX);
      const c = cv.getContext("2d")!;
      c.scale(TX, TX);
      tekenVoorwerp(c, naam, 0, 0, b, h);
      if (hex) kleurPixels(c, hex);
      return cv;
    }

    /** De beker met potloden: eerst de beker, dan de potloden (alleen boven de rand), dan de voorkant van de beker er weer overheen. */
    potlodenTex(n: number) {
      const sl = `sps-potloden-${n}`;
      if (this.textures.exists(sl)) return sl;
      /* vrolijke, volle kleuren (geen zachte pasteltinten, anders zie je de glans niet) */
      const kleuren = ["#e8394a", "#ffc21a", "#2f7cf0", "#2fb35a", "#9a4fe6", "#f0509c"];
      const cupB = 96;
      const cupH = 130;
      const beker = this.gekleurd("beker-leeg", cupB, cupH, "#1fb5b0");
      const potB = 34;
      const potH = 118;
      const pot = kleuren.map((k) => this.gekleurd("potlood", potB, potH, k));
      this.canvasPlaatje(sl, POT.b, POT.h, (c) => {
        const cupX = (POT.b - cupB) / 2;
        const cupY = POT.h - cupH;
        const rimY = cupY + cupH * 0.1;
        c.drawImage(beker, cupX, cupY, cupB, cupH);
        c.save();
        c.beginPath();
        c.rect(0, 0, POT.b, rimY + 4);
        c.clip();
        /* de potloden waaieren uit: van links schuin naar rechts schuin; de buitenste eerst */
        const hoek = (i: number) => (n === 1 ? 0 : ((i / (n - 1)) * 2 - 1) * 0.5);
        const volgorde = [...Array(n).keys()].sort((a, b) => Math.abs(hoek(b)) - Math.abs(hoek(a)));
        for (const i of volgorde) {
          const a = hoek(i);
          c.save();
          c.translate(POT.b / 2 + a * 30, rimY + 16);
          c.rotate(a);
          c.drawImage(pot[i % pot.length], -potB / 2, -potH, potB, potH);
          c.restore();
        }
        c.restore();
        /* de voorwand van de beker voor de onderkant van de potloden */
        c.save();
        c.beginPath();
        c.rect(0, rimY + 4, POT.b, POT.h);
        c.clip();
        c.drawImage(beker, cupX, cupY, cupB, cupH);
        c.restore();
        /* een glimmend lichtstreepje op de beker (glans B) */
        c.fillStyle = "rgba(255,255,255,0.45)";
        c.beginPath();
        c.roundRect(cupX + 14, cupY + 30, 9, cupH - 70, 5);
        c.fill();
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
        else if (d.s === "potloden") zet(this.potlodenTex(d.n), d.x, d.y, POT.b, d.id, d.id);
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
      if (b.delen.length) this.tover(box);
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


    /* ---------- zelf slepen: knikkers over bakjes ---------- */

    /** Een knikker in een eigen kleur: het plaatje van de knikker, één keer gekleurd (gebakken). */
    knikTex(hex: string, vw = "knikker") {
      const sl = `sps-kn-${vw}-${hex}`;
      this.canvasPlaatje(sl, VW, VW, (c) => {
        tekenVoorwerp(c, vw, 4, 4, VW - 8, VW - 8);
        kleurPixels(c, hex);
      });
      return sl;
    }

    /** Het bakje in een eigen kleur: heel (achter de knikkers) of alleen de voorkant (voor de knikkers, zodat ze erin liggen). De kleur gaat over het plaatje heen; rand en glans blijven. */
    bakTex(hex: string, W: number, H: number, voor: boolean) {
      const sl = `sps-bak-${hex}-${W}-${voor ? "v" : "a"}`;
      this.canvasPlaatje(sl, W, H, (c) => {
        const laag = document.createElement("canvas");
        laag.width = Math.ceil(W * TX);
        laag.height = Math.ceil(H * TX);
        const l = laag.getContext("2d")!;
        l.scale(TX, TX);
        tekenVoorwerp(l, "bakje", 0, 0, W, H);
        const vorm = document.createElement("canvas");
        vorm.width = laag.width;
        vorm.height = laag.height;
        vorm.getContext("2d")!.drawImage(laag, 0, 0);
        l.globalCompositeOperation = "color";
        l.fillStyle = hex;
        l.fillRect(0, 0, W, H);
        l.globalCompositeOperation = "destination-in";
        l.setTransform(1, 0, 0, 1, 0, 0);
        l.drawImage(vorm, 0, 0);
        c.drawImage(laag, 0, 0, W, H);
        if (voor) c.clearRect(0, 0, W, H * 0.3);
      });
      return sl;
    }

    slWeg() {
      const st = this.sl;
      this.sl = null;
      this.slDruk = null;
      this.input.setDefaultCursor("default");
      if (typeof window !== "undefined" && window.__phaser) {
        const w = { ...window.__phaser };
        delete w.sleepKlaar;
        delete w.sleepPunt;
        window.__phaser = w;
      }
      if (!st) return;
      if (this.rustig) st.box.destroy();
      else this.tweens.add({ targets: st.box, alpha: 0, duration: 140, onComplete: () => st.box.destroy() });
    }

    zetS2(sp: S2 | null, actief: boolean) {
      this.s2L.zet(sp, actief);
    }

    zetS1(sp: S1Spec | null, actief: boolean) {
      this.s1m ??= maakS1(this, { KLEUR, kleurPixels, meld: () => this.melder });
      this.s1m.zet(sp, actief);
    }

    zetSleep(s: Sleep | null, actief: boolean) {
      this.slActief = actief;
      if (!s) {
        if (this.sl) this.slWeg();
        return;
      }
      const sleutel = `${s.n}-${s.k}-${s.nr}`;
      if (!this.sl || this.sl.sleutel !== sleutel) {
        this.slWeg();
        this.slBouw(s, sleutel);
      }
      if (this.sl && s.auto !== undefined && s.auto !== this.sl.laatsteAuto) this.slAuto(s.auto);
    }

    /** Op het scherm (pixels van de pagina) waar een punt van het vlak ligt. */
    slScherm(x: number, y: number) {
      const r = this.game.canvas.getBoundingClientRect();
      return { x: r.left + (x * r.width) / VLAK_B, y: r.top + (y * r.height) / VLAK_H };
    }

    slBouw(s: Sleep, sleutel: string) {
      const { n, k } = s;
      const cel = Math.min(280, 880 / k);
      const W = Math.round(cel * 0.9);
      const bak = voorwerpBeeld("bakje");
      const H = Math.round((W * bak.naturalHeight) / bak.naturalWidth);
      const bakX = Array.from({ length: k }, (_, j) => 490 + (j - (k - 1) / 2) * cel);
      const top = BAK_BODEM - H;
      const dia = Math.min(56, W * 0.3);
      const trayDia = n <= 10 ? 66 : 58;
      const box = this.add.container(0, 0);
      const achter = this.add.container(0, 0);
      const laagKnik = this.add.container(0, 0);
      const voor = this.add.container(0, 0);
      const laagSleep = this.add.container(0, 0);
      box.add([achter, laagKnik, voor, laagSleep]);

      /* Het zachte, half doorzichtige vlak onder de bakjes: zonder rand, één keer getekend. */
      const px = 490 - (k * cel) / 2 - 34;
      const pb = k * cel + 68;
      const py = 300;
      const ph = 300;
      const vlak = this.add.graphics();
      vlak.fillStyle(0xbcd8ff, 0.06);
      vlak.fillRoundedRect(px - 10, py - 10, pb + 20, ph + 20, 52);
      vlak.fillStyle(0xcfe3ff, 0.13);
      vlak.fillRoundedRect(px, py, pb, ph, 44);
      achter.add(vlak);
      const groen = this.add.graphics().setAlpha(0);
      groen.fillStyle(0x8ff0c0, 0.4);
      groen.fillRoundedRect(px, py, pb, ph, 44);
      achter.add(groen);

      bakX.forEach((x, j) => {
        const hex = KLEUR[SLEEP_BAKKLEUR[j % SLEEP_BAKKLEUR.length]];
        achter.add(this.plaats(this.bakTex(hex, W, H, false), x, top + H / 2));
        voor.add(this.plaats(this.bakTex(hex, W, H, true), x, top + H / 2));
      });

      /* De knikkers boven, los door elkaar in (hooguit) twee rijen. */
      const rijen = n > 8 ? 2 : 1;
      const perRij = Math.ceil(n / rijen);
      const kn: Knik[] = [];
      for (let i = 0; i < n; i++) {
        const rij = Math.floor(i / perRij);
        const inRij = Math.min(perRij, n - rij * perRij);
        const col = i % perRij;
        const hex = KNIKKERS[(i * 3) % KNIKKERS.length];
        const thuis = {
          x: 490 + (col - (inRij - 1) / 2) * trayDia * 1.2,
          y: KNIK_BOVEN + rij * trayDia * 1.22 + Math.sin(i * 2.3) * 7,
        };
        const im = this.plaats(this.knikTex(hex, s.vw), thuis.x, thuis.y);
        im.setDisplaySize(trayDia, trayDia);
        laagKnik.add(im);
        kn.push({ im, thuis, bak: -1, hex });
        if (!this.rustig) {
          im.setAlpha(0).setScale(0.2 / TX);
          this.tweens.add({ targets: im, alpha: 1, displayWidth: trayDia, displayHeight: trayDia, delay: 40 + i * 35, duration: 260, ease: "Back.easeOut" });
        }
      }
      if (!this.rustig) {
        box.setAlpha(0);
        this.tweens.add({ targets: box, alpha: 1, duration: 260 });
      }
      this.sl = { sleutel, n, k, cel, W, H, bakX, top, dia, trayDia, kn, inhoud: Array.from({ length: k }, () => []), box, laagKnik, laagSleep, groen, laatsteAuto: undefined };

      /* Voor de automatische test en de vloeiendheidscontrole: waar je de knikkers kunt pakken en neerleggen (pixels van de pagina). */
      window.__phaser = {
        ...window.__phaser,
        sleepKlaar: () => {
          const st = this.sl;
          if (!st || !this.slActief) return null;
          return {
            los: st.kn.filter((q) => q.bak === -1).map((q) => this.slScherm(q.im.x, q.im.y)),
            bakken: st.bakX.map((x) => this.slScherm(x, st.top + st.H * 0.5)),
          };
        },
        sleepPunt: () => {
          const q = this.sl?.kn.find((m) => m.bak === -1) ?? this.sl?.kn[0];
          return this.slScherm(q?.im.x ?? 490, q?.im.y ?? KNIK_BOVEN);
        },
      };
    }

    /** Waar een knikker in een bakje ligt: een stapeltje, onderaan eerst, de onderste rij half achter de rand. */
    slBakPlek(st: SleepStaat, j: number, idx: number) {
      const c = st.inhoud[j].length;
      const perRij = c <= 3 ? Math.max(1, c) : c <= 8 ? 3 : 4;
      const rij = Math.floor(idx / perRij);
      const inRij = Math.min(perRij, c - rij * perRij);
      const col = idx % perRij;
      return { x: st.bakX[j] + (col - (inRij - 1) / 2) * st.dia * 1.04, y: st.top + st.H * 0.2 - rij * st.dia * 0.8, rij };
    }

    /** Alles op zijn plek zetten (glijdend): de knikkers boven, de knikkers in hun bakje. */
    slLegHerein(snel = false) {
      const st = this.sl;
      if (!st) return;
      const dur = snel || this.rustig ? 1 : 190;
      const zet = (q: Knik, x: number, y: number, d: number) => {
        this.tweens.killTweensOf(q.im);
        this.tweens.add({ targets: q.im, x, y, displayWidth: d, displayHeight: d, duration: dur, ease: "Cubic.easeOut" });
      };
      st.kn.forEach((q) => {
        if (q.bak === -1) zet(q, q.thuis.x, q.thuis.y, st.trayDia);
      });
      const volgorde: { im: Img; z: number }[] = [];
      st.inhoud.forEach((lijst, j) =>
        lijst.forEach((i, idx) => {
          const p = this.slBakPlek(st, j, idx);
          zet(st.kn[i], p.x, p.y, st.dia);
          volgorde.push({ im: st.kn[i].im, z: -p.rij });
        }),
      );
      /* Hogere rijen achter, lagere rijen ervoor. */
      volgorde.sort((a, b) => a.z - b.z).forEach((v) => st.laagKnik.bringToTop(v.im));
    }

    slStand() {
      const st = this.sl;
      if (!st) return;
      const tel = st.inhoud.map((l) => l.length);
      this.melder({ soort: "stand", tel, los: st.n - tel.reduce((a, b) => a + b, 0) });
    }

    /** Zet knikker `i` in bakje `j` (of terug naar boven bij -1). */
    slPlaats(i: number, j: number) {
      const st = this.sl;
      if (!st) return;
      st.inhoud.forEach((l) => {
        const x = l.indexOf(i);
        if (x >= 0) l.splice(x, 1);
      });
      st.kn[i].bak = j;
      if (j >= 0) st.inhoud[j].push(i);
      st.laagKnik.add(st.kn[i].im);
    }

    /** De eerste `t` knikkers rollen één voor één over de bakjes (uitleg), de rest ligt boven. */
    slAuto(t: number) {
      const st = this.sl;
      if (!st) return;
      st.laatsteAuto = t;
      st.inhoud.forEach((l) => (l.length = 0));
      st.kn.forEach((q, i) => {
        q.bak = i < t ? i % st.k : -1;
        if (i < t) st.inhoud[i % st.k].push(i);
        st.laagKnik.add(q.im);
      });
      if (t > 0) speelLesgeluid("stukPlop", t - 1);
      this.slLegHerein();
    }

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

    /** Welke knikker ligt hier (de dichtstbijzijnde onder je vinger)? */
    slRaak(x: number, y: number) {
      const st = this.sl;
      if (!st) return -1;
      let best = -1;
      let bd = 1e9;
      st.kn.forEach((q, i) => {
        if (q.bak === -2) return;
        const d = Math.hypot(q.im.x - x, q.im.y - y);
        const r = (q.bak === -1 ? st.trayDia : st.dia) / 2 + 10;
        if (d <= r && d < bd) {
          bd = d;
          best = i;
        }
      });
      return best;
    }

    slNeer(p: Ptr) {
      if (!this.sl || !this.slActief) return;
      const w = this.waar(p);
      const i = this.slRaak(w.x, w.y);
      if (i < 0) return;
      const im = this.sl.kn[i].im;
      this.slDruk = { i, x0: w.x, y0: w.y, dx: im.x - w.x, dy: im.y - w.y, sleept: false };
    }

    slBeweeg(p: Ptr) {
      const st = this.sl;
      if (!st) return;
      const w = this.waar(p);
      const d = this.slDruk;
      if (!d) {
        if (!p.isDown) this.input.setDefaultCursor(this.slActief && this.slRaak(w.x, w.y) >= 0 ? "grab" : "default");
        return;
      }
      if (!d.sleept && Math.hypot(w.x - d.x0, w.y - d.y0) > 9) {
        /* Pakken: de knikker komt los van zijn plek en hangt onder de vinger. */
        d.sleept = true;
        this.input.setDefaultCursor("grabbing");
        const q = st.kn[d.i];
        this.slPlaats(d.i, -2);
        st.laagSleep.add(q.im);
        this.tweens.killTweensOf(q.im);
        const g = st.trayDia * 1.12;
        q.im.setDisplaySize(g, g);
        speelLesgeluid("tik");
        this.slLegHerein();
        this.slStand();
      }
      if (d.sleept) st.kn[d.i].im.setPosition(w.x + d.dx, w.y + d.dy);
    }

    slLos(p: Ptr) {
      const st = this.sl;
      const d = this.slDruk;
      this.slDruk = null;
      this.input.setDefaultCursor("default");
      if (!st || !d) return;
      const q = st.kn[d.i];
      if (!d.sleept) {
        /* Tikken werkt ook: boven = naar het bakje met de minste knikkers, in een bakje = terug naar boven. */
        if (!this.slActief) return;
        if (q.bak === -1) {
          let j = 0;
          st.inhoud.forEach((l, x) => {
            if (l.length < st.inhoud[j].length) j = x;
          });
          this.slPlaats(d.i, j);
          speelLesgeluid("stukPlop", st.inhoud.reduce((a, l) => a + l.length, 0) - 1);
        } else {
          this.slPlaats(d.i, -1);
          speelLesgeluid("tik");
        }
        this.slLegHerein();
        this.slStand();
        return;
      }
      /* Loslaten: boven (of ver weg) = terug naar boven; anders glijdt de knikker naar het dichtstbijzijnde bakje. */
      const w = this.waar(p);
      const x = w.x + d.dx;
      const y = w.y + d.dy;
      let j = -1;
      if (y >= BAK_GRENS) {
        let bd = 1e9;
        st.bakX.forEach((bx, b) => {
          const dd = Math.abs(bx - x);
          if (dd < bd) {
            bd = dd;
            j = b;
          }
        });
      }
      this.slPlaats(d.i, j);
      speelLesgeluid(j >= 0 ? "stukPlop" : "tik", Math.max(0, st.inhoud.reduce((a, l) => a + l.length, 0) - 1));
      this.slLegHerein();
      this.slStand();
    }

    /** Goed: lichtgolf boven elk bakje, de knikkers huppelen even, het vlak kleurt zacht groen. */
    slGoed() {
      const st = this.sl;
      if (!st) return;
      st.bakX.forEach((x) => this.golf(x, st.top + st.H * 0.4));
      if (this.rustig) return;
      st.kn.forEach((q, i) => this.tweens.add({ targets: q.im, y: q.im.y - 14, duration: 150, delay: i * 30, yoyo: true, ease: "Sine.easeOut" }));
      this.tweens.add({ targets: st.groen, alpha: 1, duration: 200, yoyo: true, hold: 500 });
    }

    goed() {
      this.s1m?.goed();
      this.s2L.goed();
      this.slGoed();
      this.golf(MIDDEN.x, MIDDEN.y);
      this.flitsTot = performance.now() + 900;
      this.tekenStaat();
      this.time.delayedCall(950, () => this.tekenStaat());
    }

    fout() {
      this.s1m?.fout();
      this.s2L.fout();
      if (this.hoofd) this.schud(this.hoofd);
      if (this.sl) this.schud(this.sl.box);
    }

    /** Voor `npm run vloeiend`: het beeld van nu steeds opnieuw tevoorschijn toveren, met de lichtgolf. */
    demo(ms: number) {
      if (this.s1m?.demo(ms)) return;
      const eind = performance.now() + ms;
      if (this.sl) {
        /* Met knikkers: ze rollen steeds één voor één over de bakjes en weer terug. */
        let t = 0;
        const rol = () => {
          if (performance.now() > eind || !this.sl) return;
          this.slAuto(t++ % (this.sl.n + 1));
          if (t % (this.sl.n + 1) === 0) this.goed();
          this.time.delayedCall(240, rol);
        };
        rol();
        return;
      }
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

export function SqulaSplitsVlak({ beeld, sleep = null, s1 = null, s2 = null, licht = [], goedIds = [], uit = [], toon = [], actief = false, goed = 0, fout = 0, meld, schaal }: SplitsProps & Vlakbasis) {
  /* Het canvas neemt alleen muis en vinger aan zolang er knikkers te slepen zijn; anders gaat alles erdoorheen naar de knoppen. */
  const { plek, scene } = useHoloMotor<SplitsScene>(schaal, maakScene, { invoer: true });
  const meldRef = useRef(meld);
  useEffect(() => {
    meldRef.current = meld;
  }, [meld]);
  useEffect(() => {
    scene?.verbind((g) => meldRef.current(g));
  }, [scene]);
  const sleepSleutel = JSON.stringify({ sleep, actief });
  useEffect(() => {
    const { sleep: sl, actief: ac } = JSON.parse(sleepSleutel) as { sleep: Sleep | null; actief: boolean };
    scene?.zetSleep(sl, ac);
    plek.current?.style.setProperty("pointer-events", sl ? "auto" : "none");
  }, [scene, sleepSleutel, plek]);
  const s1Sleutel = JSON.stringify({ s1, actief });
  useEffect(() => {
    const { s1: sp, actief: ac } = JSON.parse(s1Sleutel) as { s1: S1Spec | null; actief: boolean };
    scene?.zetS1(sp, ac);
    if (sp) plek.current?.style.setProperty("pointer-events", "auto");
  }, [scene, s1Sleutel, plek]);
  const s2Sleutel = JSON.stringify({ s2, actief });
  useEffect(() => {
    const { s2: sp, actief: ac } = JSON.parse(s2Sleutel) as { s2: S2 | null; actief: boolean };
    scene?.zetS2(sp, ac);
    if (sp) plek.current?.style.setProperty("pointer-events", "auto");
  }, [scene, s2Sleutel, plek]);
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
      <div ref={plek} style={{ ...HOLO_CANVAS, touchAction: "none" }} aria-hidden />
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
