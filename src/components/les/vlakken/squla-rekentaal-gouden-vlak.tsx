"use client";

/**
 * Het speelvlak van de GOUDEN LES REKENTAAL (squla-rekentaal-gouden, "Groot en klein, vol en leeg", 11 november 2026;
 * BOUWREGELS hoofdstuk 15). Een nieuw vlak naast SqulaRekentaalKeuken (squla-rekentaal-keuken.tsx); dat vlak en de oude
 * les squla-rekentaal blijven precies zoals ze zijn.
 *
 * Dezelfde tekeningen als de oude les (pannenkoeken, bekers, glazen sap, manden, appels, een meloen, een aardbei, een zak
 * meel, broodjes en slierten spaghetti in de vlakke Bliepo-stijl, de tafel, het picknickkleed en de weegschaal), nu in
 * PHASER (HARDE REGEL 7): elke tekening wordt 1 keer in een plaatje getekend (zelfde vormen en kleuren als de SVG van het
 * oude vlak), daarna alleen nog neergezet. Alles staat links van het vaste tekstvak (x < 860 van de 980; 15.30): het midden
 * ligt op 420 in plaats van 480.
 *
 *   - `indeling` "rij" (naast elkaar, onderkant gelijk), "onder" (onder elkaar, links bij een startstreep), "weegschaal"
 *     (kantelt naar de zware kant) of "volgorde" (3 voorwerpen boven, 3 lege plekken op een plank eronder).
 *   - `beeld`: een nieuw beeld = Bliepo tovert alles tevoorschijn.
 *   - `geplaatst` (volgorde): welk voorwerp op plek 0, 1 en 2 staat; een voorwerp schuift erheen of terug.
 *   - `licht`: het RODE RONDJE om wat Bliepo noemt (7.8).
 *   - `kies`: welke voorwerpen het kind nu kan aantikken. Een tik meldt `{ soort: "rtTik", id }`; de les zet dan het
 *     VINKJE (6.5) of de nieuwe plek. Geen rand en geen gloed om een keuze (7.8a).
 *   - `hulphand`: het HULPHANDJE (15.19): komt vanzelf, is nooit een knop, alleen bij opdrachten.
 *   - `golf`: een rustige lichtgolf bij goed (7.6).
 * Maten in punten van het vlak (980 × 720).
 */

import { useEffect, useMemo, useRef } from "react";
import type { Vlakbasis } from "../soort";
import { holoBasis, type PhaserModule } from "../holo/basis";
import { HOLO_CANVAS, useHoloMotor } from "../holo/motor";
import { PALET } from "./bliepo-voorwerpen";
import type { RekenDing } from "./squla-rekentaal-keuken";
import s from "./squla-rekentaal-gouden.module.css";

export type Punt = { x: number; y: number };
export type Hand = { plek: Punt; sleutel: string };
export type Kies = { gekozen: string | null; tikbaar: string[] };
export type RTIndeling = "rij" | "onder" | "weegschaal" | "volgorde";

export type RTProps = {
  beeld: string;
  indeling: RTIndeling | null;
  dingen: RekenDing[];
  ondergrond: "tafel" | "kleed";
  zwaar?: string;
  geplaatst?: (string | null)[];
  licht?: string[];
  kies?: Kies | null;
  hulphand?: Hand | null;
  golf?: { id: string; n: number } | null;
  /** Alle voorwerpen van de les: hun plaatjes worden alvast getekend (geen hapering later). */
  voorbak?: RekenDing[];
};

const NAVY = PALET.navy;
const LIJN = 6;

/* ---------- de maten (zoals het oude vlak) ---------- */

export function maten(d: RekenDing): { b: number; h: number } {
  const m = d.maat ?? 1;
  switch (d.soort) {
    case "pannenkoek":
      return { b: 220 * m, h: 220 * m };
    case "beker":
      return { b: 180 * m, h: 180 * m };
    case "glas":
      return { b: 130 * m, h: 190 * m };
    case "mand":
      return { b: 230 * m, h: 190 * m };
    case "appel":
      return { b: 120 * m, h: 125 * m };
    case "meloen":
      return { b: 210 * m, h: 165 * m };
    case "aardbei":
      return { b: 80 * m, h: 90 * m };
    case "zak":
      return { b: 150 * m, h: 175 * m };
    case "broodje":
      return { b: d.lengte ?? 300, h: 70 };
    case "sliert":
      return { b: d.lengte ?? 300, h: 44 };
  }
}
/** De tekening zelf is zoveel punten groot (het "viewBox" van het oude vlak); de maat schaalt haar. */
function tekenVak(d: RekenDing): { b: number; h: number } {
  const { b } = maten(d);
  switch (d.soort) {
    case "pannenkoek":
      return { b: 220, h: 220 };
    case "beker":
      return { b: 180, h: 180 };
    case "glas":
      return { b: 130, h: 190 };
    case "mand":
      return { b: 230, h: 190 };
    case "appel":
      return { b: 120, h: 125 };
    case "meloen":
      return { b: 210, h: 165 };
    case "aardbei":
      return { b: 80, h: 90 };
    case "zak":
      return { b: 150, h: 175 };
    case "broodje":
      return { b, h: 70 };
    case "sliert":
      return { b, h: 44 };
  }
}

/** Het midden van alles: links van het vaste tekstvak (15.30). */
const MIDDEN = 420;
/* De weegschaal (zoals het oude vlak, 60 punten naar links). */
const DX = MIDDEN;
const DY = 210;
const ARM = 230;
const HANG = 170;
const KANTEL = 10;
const ZAK = Math.round(ARM * Math.sin((KANTEL * Math.PI) / 180));
/* Op volgorde: boven de voorwerpen, onder de plank met 3 plekken. */
const VOLG_BOVEN = 400;
const VOLG_ONDER = 668;
const VOLG_X = [160, 420, 680];
const PLEK_X = [200, 420, 640];

/** Waar een voorwerp staat: `x` = midden, `y` = onderkant, `b` en `h` = de maat. Bij de weegschaal: na het kantelen. */
export type Plek = { x: number; y: number; b: number; h: number };
export function plekVan(p: Pick<RTProps, "indeling" | "dingen" | "zwaar" | "geplaatst">, id: string): Plek | null {
  const i = p.dingen.findIndex((d) => d.id === id);
  if (i < 0 || !p.indeling) return null;
  const d = p.dingen[i];
  const { b, h } = maten(d);
  const n = p.dingen.length;
  if (p.indeling === "rij") {
    const xs = n === 2 ? [270, 570] : n === 3 ? [160, 420, 680] : p.dingen.map((_, k) => 120 + (k * 600) / Math.max(1, n - 1));
    return { x: xs[i], y: 540, b, h };
  }
  if (p.indeling === "onder") {
    const ys = n === 2 ? [330, 470] : [270, 400, 530];
    return { x: 120 + b / 2, y: ys[i] + h / 2, b, h };
  }
  if (p.indeling === "weegschaal") {
    const links = i === 0;
    const linksZwaar = p.zwaar === p.dingen[0]?.id;
    const dl = linksZwaar ? ZAK : -ZAK;
    return { x: links ? DX - ARM : DX + ARM, y: DY + HANG - 4 + (links ? dl : -dl), b, h };
  }
  const k = (p.geplaatst ?? []).indexOf(id);
  return k >= 0 ? { x: PLEK_X[k], y: VOLG_ONDER - 4, b, h } : { x: VOLG_X[i], y: VOLG_BOVEN, b, h };
}
/** De plek van de lege plaats `k` op de plank (voor het hulphandje). */
export const plankPlek = (k: number): Punt => ({ x: PLEK_X[k], y: VOLG_ONDER - 40 });

/* ---------- de tekeningen (zelfde vormen en kleuren als de SVG van het oude vlak) ---------- */

type C = CanvasRenderingContext2D;
function pad(c: C, d: string, o: { vul?: string; lijn?: string; dik?: number; rond?: boolean; hoek?: boolean; alfa?: number }) {
  const p = new Path2D(d);
  c.save();
  if (o.alfa !== undefined) c.globalAlpha = o.alfa;
  if (o.vul) {
    c.fillStyle = o.vul;
    c.fill(p);
  }
  if (o.lijn) {
    c.strokeStyle = o.lijn;
    c.lineWidth = o.dik ?? LIJN;
    c.lineCap = o.rond ? "round" : "butt";
    c.lineJoin = o.hoek || o.rond ? "round" : "miter";
    c.stroke(p);
  }
  c.restore();
}
function ovaal(c: C, x: number, y: number, rx: number, ry: number, vul?: string, lijn?: string, dik = LIJN) {
  c.beginPath();
  c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  if (vul) {
    c.fillStyle = vul;
    c.fill();
  }
  if (lijn) {
    c.strokeStyle = lijn;
    c.lineWidth = dik;
    c.stroke();
  }
}

function tekenPannenkoek(c: C) {
  ovaal(c, 110, 110, 100, 100, "#f6c768", NAVY);
  ovaal(c, 110, 110, 76, 76, "#f9d98f");
  for (const [x, y, rx, ry] of [
    [80, 85, 14, 9],
    [140, 100, 11, 7],
    [105, 145, 16, 9],
    [150, 150, 7, 5],
    [65, 130, 8, 5],
  ])
    ovaal(c, x, y, rx, ry, "#d99a45");
}
function tekenBeker(c: C) {
  const oor = "M136 62 h16 a24 24 0 0 1 0 48 h-16";
  pad(c, oor, { lijn: NAVY, dik: 18, rond: true });
  pad(c, oor, { lijn: PALET.koraal, dik: 7, rond: true });
  pad(c, "M30 30 h108 v118 a22 22 0 0 1 -22 22 h-64 a22 22 0 0 1 -22 -22 Z", { vul: PALET.koraal, lijn: NAVY, hoek: true });
  c.fillStyle = PALET.warmwit;
  c.fillRect(33, 78, 102, 24);
  pad(c, "M30 78 h108 M30 102 h108", { lijn: NAVY, dik: 3 });
}
function tekenGlas(c: C, vul: number) {
  const links = (y: number) => 12 + ((y - 12) / 168) * 14;
  const rechts = (y: number) => 118 - ((y - 12) / 168) * 14;
  const bodem = 174;
  const top = bodem - Math.max(0, Math.min(1, vul)) * 150;
  pad(c, "M12 12 H118 L104 180 H26 Z", { vul: "#dff1f7" });
  if (vul > 0) {
    pad(c, `M${links(top) + 4} ${top} H${rechts(top) - 4} L${rechts(bodem) - 4} ${bodem} H${links(bodem) + 4} Z`, { vul: "#ffa63d" });
    pad(c, `M${links(top) + 4} ${top} H${rechts(top) - 4}`, { lijn: "#e07f12", dik: 4 });
  }
  pad(c, "M12 12 H118 L104 180 H26 Z", { lijn: NAVY, hoek: true });
  pad(c, "M30 30 L38 150", { lijn: "#ffffff", dik: 5, rond: true, alfa: 0.8 });
}
function tekenMand(c: C) {
  const hengsel = "M48 92 C48 8, 182 8, 182 92";
  pad(c, hengsel, { lijn: NAVY, dik: 18, rond: true });
  pad(c, hengsel, { lijn: "#d9a066", dik: 7, rond: true });
  pad(c, "M14 86 H216 L194 182 H36 Z", { vul: "#d9a066", lijn: NAVY, hoek: true });
  pad(c, "M24 118 H206 M31 150 H199", { lijn: "#a8693a", dik: 5 });
  pad(c, "M66 90 L72 178 M115 90 V178 M164 90 L158 178", { lijn: "#a8693a", dik: 5 });
  c.beginPath();
  c.roundRect(14, 80, 202, 16, 6);
  c.fillStyle = PALET.koraal;
  c.fill();
  c.strokeStyle = NAVY;
  c.lineWidth = 4;
  c.stroke();
}
function tekenAppel(c: C) {
  pad(c, "M60 30 Q62 14 72 6", { lijn: NAVY, dik: 6, rond: true });
  pad(c, "M66 22 C78 6, 100 8, 104 18 C92 28, 76 30, 66 22 Z", { vul: "#5fbf6a", lijn: NAVY, dik: 4, hoek: true });
  pad(c, "M60 34 C30 16, 4 40, 11 76 C17 106, 40 124, 60 113 C80 124, 103 106, 109 76 C116 40, 90 16, 60 34 Z", { vul: "#e8504a", lijn: NAVY, hoek: true });
  pad(c, "M32 54 C26 64, 26 76, 30 86", { lijn: "#ffb3a6", dik: 6, rond: true });
}
function tekenMeloen(c: C) {
  ovaal(c, 105, 86, 98, 74, "#5cbf6e", NAVY);
  pad(c, "M40 40 C70 70, 70 110, 42 136 M85 16 C110 60, 110 116, 86 158 M140 18 C160 60, 160 116, 138 156 M178 42 C190 70, 190 104, 176 132", { lijn: "#2f7d44", dik: 7, rond: true });
  ovaal(c, 105, 86, 98, 74, undefined, NAVY);
}
function tekenAardbei(c: C) {
  pad(c, "M40 86 C12 62, 4 34, 14 24 C24 14, 56 14, 66 24 C76 34, 68 62, 40 86 Z", { vul: "#e8504a", lijn: NAVY, dik: 5, hoek: true });
  pad(c, "M18 22 L30 8 L40 20 L50 8 L62 22 Q40 30 18 22 Z", { vul: "#5fbf6a", lijn: NAVY, dik: 4, hoek: true });
  for (const [x, y] of [
    [28, 38],
    [44, 36],
    [56, 46],
    [36, 52],
    [48, 62],
    [26, 50],
    [40, 72],
  ])
    ovaal(c, x, y, 2.6, 3.6, PALET.geelLicht);
}
function tekenZak(c: C) {
  pad(c, "M36 50 C18 84, 14 140, 30 168 H120 C136 140, 132 84, 114 50 Z", { vul: PALET.warmwit, lijn: NAVY, hoek: true });
  pad(c, "M48 50 L38 14 H112 L102 50 Z", { vul: PALET.warmwit, lijn: NAVY, hoek: true });
  c.beginPath();
  c.roundRect(40, 42, 70, 14, 6);
  c.fillStyle = PALET.koraal;
  c.fill();
  c.strokeStyle = NAVY;
  c.lineWidth = 4;
  c.stroke();
  pad(c, "M75 150 V86", { lijn: "#c98b32", dik: 5, rond: true });
  for (const y of [94, 110, 126])
    for (const [x, hoek] of [
      [66, -30],
      [84, 30],
    ]) {
      c.save();
      c.translate(x, y);
      c.rotate((hoek * Math.PI) / 180);
      ovaal(c, 0, 0, 7, 11, PALET.geel, "#c98b32", 2);
      c.restore();
    }
}
function tekenBroodje(c: C, b: number) {
  c.beginPath();
  c.roundRect(4, 8, b - 8, 54, 27);
  c.fillStyle = "#e3a557";
  c.fill();
  c.strokeStyle = NAVY;
  c.lineWidth = LIJN;
  c.stroke();
  for (let x = 60; x < b - 40; x += 62) pad(c, `M${x - 12} 46 L${x + 12} 22`, { lijn: "#b97832", dik: 6, rond: true });
}
function tekenSliert(c: C, b: number) {
  const y = 22;
  let d = `M12 ${y}`;
  let omhoog = true;
  for (let x = 12; x < b - 12; x += 24) {
    const naar = Math.min(x + 24, b - 12);
    d += ` Q${(x + naar) / 2} ${omhoog ? y - 14 : y + 14} ${naar} ${y}`;
    omhoog = !omhoog;
  }
  pad(c, d, { lijn: NAVY, dik: 17, rond: true });
  pad(c, d, { lijn: "#ffd36b", dik: 8, rond: true });
}
function tekenDing(c: C, d: RekenDing) {
  switch (d.soort) {
    case "pannenkoek":
      return tekenPannenkoek(c);
    case "beker":
      return tekenBeker(c);
    case "glas":
      return tekenGlas(c, d.vul ?? 0);
    case "mand":
      return tekenMand(c);
    case "appel":
      return tekenAppel(c);
    case "meloen":
      return tekenMeloen(c);
    case "aardbei":
      return tekenAardbei(c);
    case "zak":
      return tekenZak(c);
    case "broodje":
      return tekenBroodje(c, maten(d).b);
    case "sliert":
      return tekenSliert(c, maten(d).b);
  }
}
/** Rand om een tekening (lijnen mogen iets buiten het vak, zoals in de SVG). */
const RAND = 10;

/* ---------- Phaser ---------- */

interface Scene {
  bakVooruit(dingen: RekenDing[]): void;
  zetBeeld(p: RTProps): void;
  zetGeplaatst(geplaatst: (string | null)[]): void;
  zetLicht(ids: string[]): void;
  golfBij(id: string): void;
}

type Box = import("phaser").GameObjects.Container;
type Img = import("phaser").GameObjects.Image;

function maakScene(Phaser: PhaserModule, rustig: boolean) {
  const Basis = holoBasis(Phaser, rustig);

  class GoudenRekentaal extends Basis implements Scene {
    beeld = "";
    p: RTProps | null = null;
    dozen = new Map<string, Box>();
    achter: import("phaser").GameObjects.GameObject[] = [];
    balk: Img | null = null;
    rondjes: Img[] = [];
    licht: string[] = [];

    constructor() {
      super("squla-rekentaal-gouden");
    }

    preload() {
      this.load.image("rt-rondje", "/rondje/rondje-rood-2.png");
    }

    /** Het plaatje van een voorwerp (1 keer getekend per soort en maat). */
    plaatje(d: RekenDing): string {
      const { b, h } = maten(d);
      const sl = `rt-${d.soort}-${Math.round(b)}-${Math.round(h)}-${d.vul ?? ""}`;
      const vak = tekenVak(d);
      this.canvasPlaatje(sl, b + 2 * RAND, h + 2 * RAND, (c) => {
        c.translate(RAND, RAND);
        c.scale(b / vak.b, h / vak.h);
        tekenDing(c, d);
      });
      return sl;
    }

    /**
     * Alle plaatjes van de les alvast tekenen, verspreid over de eerste seconden (1 per 2 beeldjes), zodat het tekenen
     * van een groot plaatje (het kleed) later geen hapering geeft (HARDE REGEL 7). Het eerste beeld wacht hier niet op.
     */
    bakVooruit(dingen: RekenDing[]) {
      const taken: (() => void)[] = [
        () => this.weegPlaatjes(),
        ...(["tafel", "kleed"] as const).flatMap((g) => [
          [800, g === "kleed" ? 150 : 110],
          [740, 300],
          [740, 420],
          [620, g === "kleed" ? 110 : 80],
          [800, g === "kleed" ? 120 : 60],
        ].map(([b, h]) => () => void this.grondPlaatje(g, b, h))),
        ...dingen.map((d) => () => void this.plaatje(d)),
      ];
      taken.forEach((t, i) => this.time.delayedCall(300 + i * 34, t));
    }

    grondPlaatje(soort: "tafel" | "kleed", b: number, h: number): string {
      const sl = `rt-grond-${soort}-${b}-${h}`;
      this.canvasPlaatje(sl, b + 8, h + 8, (c) => {
        c.translate(4, 4);
        if (soort === "tafel") {
          c.beginPath();
          c.roundRect(0, 0, b, Math.min(h, 34), 10);
          c.fillStyle = "#c98b52";
          c.fill();
          c.strokeStyle = NAVY;
          c.lineWidth = LIJN;
          c.stroke();
          if (h > 34) {
            c.beginPath();
            c.roundRect(6, 34, b - 12, h - 34, 10);
            c.fillStyle = "#b5773f";
            c.fill();
          }
          return;
        }
        /* Het picknickkleed: geblokt, koraal en warmwit. */
        c.save();
        c.beginPath();
        c.roundRect(0, 0, b, h, 14);
        c.clip();
        c.fillStyle = PALET.warmwit;
        c.fillRect(0, 0, b, h);
        c.fillStyle = PALET.koraal;
        const cel = 46;
        for (let r = 0; r * cel < h; r++) for (let k = 0; k * cel < b; k++) if ((r + k) % 2 === 0) c.fillRect(k * cel, r * cel, cel, cel);
        c.restore();
        c.beginPath();
        c.roundRect(0, 0, b, h, 14);
        c.strokeStyle = NAVY;
        c.lineWidth = LIJN;
        c.stroke();
      });
      return sl;
    }

    ondergrond(soort: "tafel" | "kleed", x: number, y: number, b: number, h: number) {
      const sl = this.grondPlaatje(soort, b, h);
      const img = this.plaats(sl, x + b / 2, y + h / 2).setDepth(0);
      this.achter.push(img);
      this.tover(img);
    }

    weegPlaatjes() {
      /* De paal en de voet (vast). */
      this.canvasPlaatje("rt-paal", 200, 420, (c) => {
        c.translate(100 - DX, -200);
        pad(c, `M${DX - 14} ${DY} H${DX + 14} V590 H${DX - 14} Z`, { vul: PALET.petrol, lijn: NAVY });
        pad(c, `M${DX - 90} 616 L${DX - 64} 584 H${DX + 64} L${DX + 90} 616 Z`, { vul: PALET.petrol, lijn: NAVY, hoek: true });
      });
      /* Een schaal met de touwtjes; (0, 0) van de groep = de lijn bovenop de schaal. */
      this.canvasPlaatje("rt-schaal", 240, HANG + 50, (c) => {
        c.translate(120, HANG + 6);
        pad(c, `M-104 0 L0 ${-HANG} L104 0`, { lijn: "#d6d8e1", dik: 3 });
        pad(c, "M-112 0 A112 30 0 0 0 112 0 Z", { vul: PALET.warmwit, lijn: NAVY, hoek: true });
      });
      this.canvasPlaatje("rt-balk", 2 * ARM + 34, 28, (c) => {
        c.beginPath();
        c.roundRect(5, 5, 2 * ARM + 24, 18, 9);
        c.fillStyle = PALET.geel;
        c.fill();
        c.strokeStyle = NAVY;
        c.lineWidth = 5;
        c.stroke();
      });
      this.canvasPlaatje("rt-spil", 40, 40, (c) => ovaal(c, 20, 20, 15, 15, PALET.koraal, NAVY, 5));
    }

    weegschaal(p: RTProps) {
      this.weegPlaatjes();
      const paal = this.plaats("rt-paal", DX, 410).setDepth(1);
      this.achter.push(paal);
      this.tover(paal);
      const [a, b] = p.dingen;
      const linksZwaar = p.zwaar === a?.id;
      const dl = linksZwaar ? ZAK : -ZAK;
      const schalen: [number, number, RekenDing | undefined][] = [
        [DX - ARM, dl, a],
        [DX + ARM, -dl, b],
      ];
      const naar: { doos: Box; dy: number }[] = [];
      for (const [x, dy, d] of schalen) {
        const schaal = this.add.container(x, DY + HANG).setDepth(2);
        schaal.add(this.plaats("rt-schaal", 0, -HANG - 6 + (HANG + 50) / 2));
        this.achter.push(schaal);
        this.tover(schaal);
        naar.push({ doos: schaal, dy });
        if (d) {
          const doos = this.dozen.get(d.id);
          if (doos) naar.push({ doos, dy });
        }
      }
      this.balk = this.plaats("rt-balk", DX, DY).setDepth(3);
      const spil = this.plaats("rt-spil", DX, DY).setDepth(4);
      this.achter.push(this.balk, spil);
      this.tover(this.balk);
      this.tover(spil);
      /* Eerst recht, dan rustig naar de zware kant (zoals het oude vlak: na 0,45 s, 0,9 s lang). */
      const hoek = ((linksZwaar ? -KANTEL : KANTEL) * Math.PI) / 180;
      if (this.rustig) {
        this.balk.setRotation(hoek);
        for (const { doos, dy } of naar) doos.y += dy;
        return;
      }
      this.tweens.add({ targets: this.balk, rotation: hoek, delay: 450, duration: 900, ease: "Sine.easeInOut" });
      for (const { doos, dy } of naar) this.tweens.add({ targets: doos, y: doos.y + dy, delay: 450, duration: 900, ease: "Sine.easeInOut" });
    }

    zetBeeld(p: RTProps) {
      const nieuw = p.beeld !== this.beeld;
      this.p = p;
      if (!nieuw) return;
      this.beeld = p.beeld;
      for (const o of this.achter) this.verdwijn(o as Box);
      for (const d of this.dozen.values()) this.verdwijn(d);
      this.achter = [];
      this.dozen.clear();
      this.balk = null;
      if (!p.indeling) return;
      const n = p.dingen.length;
      /* De ondergrond (zoals het oude vlak, 60 punten naar links). */
      if (p.indeling === "rij") this.ondergrond(p.ondergrond, 20, p.ondergrond === "kleed" ? 510 : 540, 800, p.ondergrond === "kleed" ? 150 : 110);
      else if (p.indeling === "onder") {
        const ys = n === 2 ? [330, 470] : [270, 400, 530];
        const top = ys[0] - 80;
        const bodem = ys[ys.length - 1] + 80;
        this.ondergrond(p.ondergrond, 60, top, 740, bodem - top);
        /* De startstreep (gestippeld). */
        const sl = `rt-streep-${bodem - top}`;
        this.canvasPlaatje(sl, 12, bodem - top - 28, (c) => {
          c.setLineDash([12, 10]);
          c.lineCap = "round";
          c.strokeStyle = NAVY;
          c.lineWidth = 5;
          c.beginPath();
          c.moveTo(6, 3);
          c.lineTo(6, bodem - top - 31);
          c.stroke();
        });
        const streep = this.plaats(sl, 120, (top + bodem) / 2).setDepth(1);
        this.achter.push(streep);
        this.tover(streep);
      } else if (p.indeling === "weegschaal") this.ondergrond(p.ondergrond, 110, p.ondergrond === "kleed" ? 586 : 616, 620, p.ondergrond === "kleed" ? 110 : 80);
      else {
        this.ondergrond(p.ondergrond, 20, p.ondergrond === "kleed" ? VOLG_BOVEN - 30 : VOLG_BOVEN, 800, p.ondergrond === "kleed" ? 120 : 60);
        /* De plank met 3 lege plekken die van klein naar groot gaan (zoals het oude vlak). */
        this.canvasPlaatje("rt-plank", 770, 32, (c) => {
          c.beginPath();
          c.roundRect(4, 4, 760, 22, 8);
          c.fillStyle = "#c98b52";
          c.fill();
          c.strokeStyle = NAVY;
          c.lineWidth = LIJN;
          c.stroke();
        });
        const plank = this.plaats("rt-plank", 420, VOLG_ONDER + 11).setDepth(1);
        this.achter.push(plank);
        this.tover(plank);
        const opMaat = [...p.dingen].sort((x, y) => maten(x).b * maten(x).h - maten(y).b * maten(y).h);
        opMaat.forEach((d, i) => {
          const { b, h } = maten(d);
          const sl = `rt-plek-${Math.round(b)}-${Math.round(h)}`;
          this.canvasPlaatje(sl, b + 24, h + 18, (c) => {
            c.setLineDash([12, 9]);
            c.strokeStyle = "rgba(160,180,220,0.55)";
            c.lineWidth = 4;
            c.beginPath();
            c.roundRect(6, 6, b + 12, h + 6, 16);
            c.stroke();
          });
          const plek = this.plaats(sl, PLEK_X[i], VOLG_ONDER - h / 2 - 7).setDepth(1);
          this.achter.push(plek);
          this.tover(plek);
        });
      }
      /* De voorwerpen. */
      p.dingen.forEach((d, i) => {
        const pl = plekVan(p.indeling === "weegschaal" ? { ...p, zwaar: undefined, dingen: p.dingen } : p, d.id);
        if (!pl) return;
        /* Op de weegschaal: eerst recht (de schaal zakt of stijgt daarna mee). */
        const y = p.indeling === "weegschaal" ? DY + HANG - 4 : pl.y;
        const doos = this.add.container(pl.x, y).setDepth(5);
        doos.add(this.plaats(this.plaatje(d), 0, -pl.h / 2));
        doos.setData("h", pl.h);
        this.dozen.set(d.id, doos);
        this.tover(doos, { vertraging: 80 + i * 70 });
      });
      if (p.indeling === "weegschaal") this.weegschaal(p);
      this.zetLicht(this.licht);
    }

    zetGeplaatst(geplaatst: (string | null)[]) {
      const p = this.p;
      if (!p || p.indeling !== "volgorde") return;
      this.p = { ...p, geplaatst };
      for (const d of p.dingen) {
        const doos = this.dozen.get(d.id);
        const pl = plekVan(this.p, d.id);
        if (!doos || !pl || (Math.abs(doos.x - pl.x) < 1 && Math.abs(doos.y - pl.y) < 1)) continue;
        /* Alleen de beweeg-tween stoppen (nooit killTweensOf: dan blijft iets van tover() doorzichtig; keuring Getallenlijn). */
        (doos.getData("beweeg") as import("phaser").Tweens.Tween | undefined)?.stop();
        if (this.rustig) doos.setPosition(pl.x, pl.y);
        else doos.setData("beweeg", this.tweens.add({ targets: doos, x: pl.x, y: pl.y, duration: 380, ease: "Cubic.easeOut" }));
      }
      this.zetLicht(this.licht);
    }

    zetLicht(ids: string[]) {
      this.licht = [...ids];
      const p = this.p;
      const vakken = p ? ids.map((id) => plekVan(p, id)).filter((x): x is Plek => !!x) : [];
      while (this.rondjes.length < vakken.length) this.rondjes.push(this.add.image(0, 0, "rt-rondje").setDepth(8).setVisible(false));
      this.rondjes.forEach((r, i) => {
        const v = vakken[i];
        if (!v) {
          r.setVisible(false);
          return;
        }
        const rot = ((([...ids[i]].reduce((a, c) => a + c.charCodeAt(0), 0) * 37) % 50) / 10 - 2.5) * (Math.PI / 180);
        r.setPosition(v.x, v.y - v.h / 2)
          .setDisplaySize(v.b * 1.15 + 44, v.h * 1.4 + 50)
          .setRotation(rot)
          .setAlpha(1)
          .setVisible(true);
      });
    }

    golfBij(id: string) {
      const p = this.p;
      const pl = p ? plekVan(p, id) : null;
      if (pl) this.golf(pl.x, pl.y - pl.h / 2);
    }

    /** Voor `npm run vloeiend`: steeds een ander tafereel tevoorschijn toveren (ook de weegschaal), rondjes en een golf. */
    demo(ms: number) {
      const eind = performance.now() + ms;
      let k = 0;
      const beelden: Omit<RTProps, "beeld">[] = [
        { indeling: "weegschaal", ondergrond: "tafel", zwaar: "m", dingen: [{ id: "a", soort: "appel", naam: "a" }, { id: "m", soort: "meloen", naam: "m", maat: 0.8 }] },
        { indeling: "rij", ondergrond: "kleed", dingen: [{ id: "a", soort: "mand", naam: "a", maat: 0.85 }, { id: "b", soort: "mand", naam: "b", maat: 1.12 }, { id: "c", soort: "mand", naam: "c", maat: 0.6 }] },
        { indeling: "onder", ondergrond: "kleed", dingen: [{ id: "a", soort: "broodje", naam: "a", lengte: 300 }, { id: "b", soort: "broodje", naam: "b", lengte: 640 }, { id: "c", soort: "broodje", naam: "c", lengte: 470 }] },
        { indeling: "volgorde", ondergrond: "kleed", geplaatst: [null, null, null], dingen: [{ id: "a", soort: "appel", naam: "a", maat: 0.95 }, { id: "b", soort: "appel", naam: "b", maat: 1.3 }, { id: "c", soort: "appel", naam: "c", maat: 0.6 }] },
      ];
      const stap = () => {
        if (performance.now() > eind) return;
        const b = beelden[k % beelden.length];
        this.zetBeeld({ ...b, beeld: `demo-${k++}` });
        const ids = b.dingen.map((d) => d.id);
        ids.forEach((id, i) => this.time.delayedCall(250 + i * 180, () => this.zetLicht([id])));
        if (b.indeling === "volgorde") this.time.delayedCall(800, () => this.zetGeplaatst(["c", null, null]));
        this.time.delayedCall(900, () => {
          this.zetLicht([]);
          this.golfBij(ids[1]);
        });
        this.time.delayedCall(1300, stap);
      };
      stap();
    }
  }
  return GoudenRekentaal as unknown as new () => import("phaser").Scene;
}

/* ---------- het vlak ---------- */

export function RekentaalGoudenVlak(props: RTProps & Vlakbasis) {
  const { beeld, indeling, dingen, ondergrond, zwaar, geplaatst, licht = [], kies = null, hulphand = null, golf = null, voorbak, meld, schaal } = props;
  const { plek, scene } = useHoloMotor<Scene>(schaal, maakScene);
  const dingSleutel = JSON.stringify(dingen);
  const lijst = useMemo(() => JSON.parse(dingSleutel) as RekenDing[], [dingSleutel]);
  const plaatsSleutel = (geplaatst ?? []).join(",");
  const lichtSleutel = licht.join(",");
  const voorbakRef = useRef(voorbak);
  useEffect(() => {
    if (scene && voorbakRef.current) scene.bakVooruit(voorbakRef.current);
  }, [scene]);

  useEffect(() => {
    scene?.zetBeeld({ beeld, indeling, dingen: lijst, ondergrond, zwaar, geplaatst: plaatsSleutel ? plaatsSleutel.split(",").map((x) => x || null) : [] });
    /* Alleen bij een nieuw beeld (de rest gaat via de effecten hieronder). */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, beeld]);
  useEffect(() => {
    if (indeling === "volgorde") scene?.zetGeplaatst(plaatsSleutel ? plaatsSleutel.split(",").map((x) => x || null) : [null, null, null]);
  }, [scene, plaatsSleutel, indeling, beeld]);
  useEffect(() => {
    scene?.zetLicht(lichtSleutel ? lichtSleutel.split(",") : []);
  }, [scene, lichtSleutel, beeld, plaatsSleutel]);
  const vorigGolf = useRef(golf?.n ?? 0);
  useEffect(() => {
    if (!scene || !golf || golf.n === vorigGolf.current) return;
    vorigGolf.current = golf.n;
    scene.golfBij(golf.id);
  }, [scene, golf]);

  const p = { indeling, dingen: lijst, zwaar, geplaatst: plaatsSleutel ? plaatsSleutel.split(",").map((x) => x || null) : [] };
  return (
    <div className={s.vlak} data-rekentaal-gouden="">
      <div ref={plek} style={HOLO_CANVAS} aria-hidden />
      {kies &&
        lijst.map((d) => {
          const r = plekVan(p, d.id);
          if (!r) return null;
          const vinkje = kies.gekozen === d.id;
          const mag = kies.tikbaar.includes(d.id);
          const opPlank = indeling === "volgorde" && p.geplaatst.includes(d.id);
          return (
            <button
              key={`${beeld}-${d.id}`}
              type="button"
              className={s.knop}
              style={{ left: r.x - r.b / 2, top: r.y - r.h, width: r.b, height: r.h }}
              data-ding={d.naam}
              /* Wat al gekozen is of al op de plank staat, heeft geen data-plek: dan tikt de speelcontrole iets anders aan
                 (geleerd bij Getallenlijn). */
              data-plek={mag && !vinkje && !opPlank ? "ding" : undefined}
              data-gekozen={vinkje ? "" : undefined}
              disabled={!mag}
              aria-label={d.naam}
              aria-pressed={vinkje}
              onClick={() => {
                if (mag) meld({ soort: "rtTik", id: d.id });
              }}
            >
              {vinkje && <Vinkje />}
            </button>
          );
        })}
      {hulphand && (
        <div key={hulphand.sleutel} className={`${s.hand} ${s.tikGebaar}`} style={{ left: hulphand.plek.x, top: hulphand.plek.y }} aria-hidden data-hulphand="">
          <svg viewBox="0 0 90 120" className={s.handTekening}>
            <g>
              <rect x="34" y="6" width="20" height="62" rx="10" />
              <rect x="16" y="52" width="60" height="56" rx="18" />
              <rect x="52" y="50" width="17" height="30" rx="8" />
              <rect x="64" y="58" width="15" height="28" rx="7" />
              <rect x="8" y="66" width="18" height="30" rx="9" />
            </g>
            <path d="M54 66v12M66 70v14" className={s.lijn} />
          </svg>
        </div>
      )}
    </div>
  );
}

function Vinkje() {
  return (
    <span className={s.vinkje} aria-hidden data-vinkje="">
      <svg viewBox="0 0 24 24">
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    </span>
  );
}
