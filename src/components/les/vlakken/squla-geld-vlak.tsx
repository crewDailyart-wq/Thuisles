"use client";

/**
 * Het speelvlak van de lessen Geld naar Squla (31 oktober 2026), in Phaser
 * (HARDE REGEL 7), in de vlakke, vriendelijke stijl van Bliepo
 * (bliepo-voorwerpen.ts: geen gloed).
 *
 * MUNTEN EN BRIEFJES zijn altijd de officiële afbeeldingen uit public/geld/
 * (ECB; zie BRON.md daar): niet bewerkt, niet vergroot, nooit op ware grootte.
 * Een munt wordt rond afgesneden (zoals in oefenen/Geld.tsx), zodat het witte
 * vlak eromheen niet als vierkant in beeld staat. Alleen wat nodig is wordt
 * geladen, en pas als het vlak al in beeld staat.
 *
 * Wat het draaiboek zet:
 * - `groot`: bovenaan een tafereel uit delen naast elkaar: een tekening (met of
 *   zonder prijskaartje), geld (met of zonder kruisje erdoor), een pijl, een plus;
 * - `kaarten`: kaartjes om aan te tikken, met geld, een tekening of een woord;
 *   `bubbels`: de kaartjes zijn bellen die zacht dobberen;
 *   `uit` (vaag), `goed` (groene rand), `fout` (rode rand), `licht` (gele rand);
 * - `verbind`: twee vakken links en twee rechts met een bolletje; het kind
 *   trekt een lijn (of tikt het ene en dan het andere vak);
 * - `geteld`: Bliepo telt het geld in een kaartje of deel: een gele ring om
 *   wat hij nu telt en bovenaan het bedrag tot nu toe.
 *
 * Meldingen: `kaart` {id}, `links` {id}, `rechts` {id}, `lijn` {links, rechts}.
 *
 * Voor het toetsenbord en de automatische test ligt over elk tikbaar ding een
 * onzichtbare knop (`data-ding`), die precies hetzelfde meldt. Kaartjes met
 * geld worden NIET voorgelezen (dat zou het antwoord verklappen); kaartjes met
 * een tekening of woord wel, als ze een `zeg` hebben.
 */

import { useEffect, useRef } from "react";
import type { Vlakbasis, Vlakgebeurtenis } from "../soort";
import { TX, VLAK_B, VLAK_H } from "../holo/basis";
import { HOLO_CANVAS, useHoloMotor } from "../holo/motor";
import { bliepoBasis, PALET, RAND_DUN, blok, cirkel, tekenVormen } from "./bliepo-voorwerpen";
import { TEKENINGEN } from "./squla-geld-tekeningen";
import { WAARDE, isBriefje, type GeldSoort } from "./squla-geld-soorten";
import { haalKeuzesAlvast, zegKeuze } from "@/lib/stem";
import s from "./squla-geld.module.css";

/* ---------- het geld ---------- */

const BESTAND: Record<GeldSoort, string> = {
  c50: "/geld/munt-50-cent.jpg",
  m1: "/geld/munt-1-euro.jpg",
  m2: "/geld/munt-2-euro.jpg",
  b5: "/geld/briefje-5-euro.jpg",
  b10: "/geld/briefje-10-euro.jpg",
  b20: "/geld/briefje-20-euro.jpg",
  b50: "/geld/briefje-50-euro.jpg",
  b100: "/geld/briefje-100-euro.jpg",
};

const BEELD = new Map<GeldSoort, HTMLImageElement>();
const LADEN = new Map<GeldSoort, Promise<void>>();

/** De officiële afbeeldingen laden (elk één keer). */
export function laadGeld(soorten: GeldSoort[]): Promise<void> {
  return Promise.all(
    [...new Set(soorten)].map((g) => {
      let p = LADEN.get(g);
      if (!p) {
        p = new Promise<void>((klaar) => {
          const img = new Image();
          img.decoding = "async";
          img.onload = () => {
            BEELD.set(g, img);
            klaar();
          };
          img.onerror = () => klaar();
          img.src = BESTAND[g];
        });
        LADEN.set(g, p);
      }
      return p;
    }),
  ).then(() => undefined);
}

/* ---------- wat het draaiboek zet ---------- */

export type GKaart = { id: string; geld?: GeldSoort[]; tekening?: string; label?: string; zeg?: string };

export type GDeel =
  | { soort: "tekening"; id?: string; tekening: string; prijs?: number }
  | { soort: "geld"; id?: string; geld: GeldSoort[]; kruis?: number[] }
  | { soort: "pijl" }
  | { soort: "plus" };

export type GVerbind = {
  links: GKaart[];
  rechts: GKaart[];
  lijnen: [string, string][];
  /** Lijnen (op id links) die groen zijn of rood. */
  goed: string[];
  fout: string[];
  gekozen: string | null;
  actief: boolean;
};

export type GeldProps = {
  /** Een nieuw tafereel (nieuwe vraag): alles verschijnt opnieuw. */
  nr: number;
  groot?: GDeel[] | null;
  kaarten?: GKaart[];
  kaartenActief?: boolean;
  bubbels?: boolean;
  uit?: string[];
  goed?: string[];
  fout?: string[];
  licht?: string[];
  verbind?: GVerbind | null;
  /** `vanaf`: Bliepo telt verder vanaf dit bedrag (het geld van iemand anders erbij). */
  geteld?: { id: string; tot: number; vanaf?: number } | null;
  schud?: { id: string; n: number } | null;
  golf?: { id: string; n: number } | null;
  /** Een handje doet één keer voor hoe je een lijn trekt. */
  handje?: number;
  /** Geld dat de les straks nodig heeft: alvast laden. */
  vooraf?: GeldSoort[];
};

export type Rect = { x: number; y: number; b: number; h: number };

/* ---------- geld neerleggen (in punten, rond het midden) ---------- */

const NOOT_B = 150;
const NOOT_H = 79;
const MUNT_D = 66;
const TUSSEN = 10;
const muntMaat = (g: GeldSoort) => (g === "m2" ? 1 : g === "c50" ? 0.96 : 0.93);

export type Plek = { g: GeldSoort; x: number; y: number; b: number; h: number };

/**
 * Munten en briefjes netjes neerleggen: eerst de briefjes, dan de munten,
 * hoogstens 5 op een rij, elke rij links uitgelijnd en het groepje als geheel
 * in het midden; niets overlapt. Zo groot als past (tot `maxS`).
 */
export function legGeld(items: GeldSoort[], maxB: number, maxH: number, maxS = 1.3): { plekken: Plek[]; b: number; h: number } {
  const noten = items.map((g, i) => ({ g, i })).filter((x) => isBriefje(x.g));
  const munten = items.map((g, i) => ({ g, i })).filter((x) => !isBriefje(x.g));
  let beste: { sc: number; pn: number; pm: number; rijen: number; W: number; H: number } | null = null;
  for (let pn = 1; pn <= Math.max(1, Math.min(4, noten.length)); pn++) {
    for (let pm = 1; pm <= Math.max(1, Math.min(5, munten.length)); pm++) {
      const rn = noten.length ? Math.ceil(noten.length / pn) : 0;
      const rm = munten.length ? Math.ceil(munten.length / pm) : 0;
      const W = Math.max(noten.length ? Math.min(pn, noten.length) * (NOOT_B + TUSSEN) - TUSSEN : 0, munten.length ? Math.min(pm, munten.length) * (MUNT_D + TUSSEN) - TUSSEN : 0, 1);
      const H = Math.max(rn * NOOT_H + rm * MUNT_D + Math.max(0, rn + rm - 1) * TUSSEN, 1);
      const sc = Math.min(maxS, maxB / W, maxH / H);
      const rijen = rn + rm;
      if (!beste || sc > beste.sc + 0.03 || (Math.abs(sc - beste.sc) <= 0.03 && rijen < beste.rijen)) beste = { sc, pn, pm, rijen, W, H };
    }
  }
  const b = beste!;
  const plekken: Plek[] = new Array(items.length);
  const x0 = (-b.W * b.sc) / 2;
  let y = (-b.H * b.sc) / 2;
  noten.forEach((n, j) => {
    const kol = j % b.pn;
    if (j > 0 && kol === 0) y += (NOOT_H + TUSSEN) * b.sc;
    plekken[n.i] = { g: n.g, x: x0 + (kol * (NOOT_B + TUSSEN) + NOOT_B / 2) * b.sc, y: y + (NOOT_H / 2) * b.sc, b: NOOT_B * b.sc, h: NOOT_H * b.sc };
  });
  if (noten.length) y += (NOOT_H + TUSSEN) * b.sc;
  munten.forEach((m, j) => {
    const kol = j % b.pm;
    if (j > 0 && kol === 0) y += (MUNT_D + TUSSEN) * b.sc;
    const d = MUNT_D * b.sc * muntMaat(m.g);
    plekken[m.i] = { g: m.g, x: x0 + (kol * (MUNT_D + TUSSEN) + MUNT_D / 2) * b.sc, y: y + (MUNT_D / 2) * b.sc, b: d, h: d };
  });
  return { plekken, b: b.W * b.sc, h: b.H * b.sc };
}

/* ---------- waar staat wat (punten van het vlak, 980 × 720) ---------- */

export function rij(n: number, b: number, tussen: number, y: number, h: number): Rect[] {
  const breed = n * b + (n - 1) * tussen;
  const x0 = (VLAK_B - breed) / 2 + b / 2;
  return Array.from({ length: n }, (_, i) => ({ x: x0 + i * (b + tussen), y, b, h }));
}

/** Hoeveel groter geld in het tafereel bovenaan staat dan zijn basismaat. */
const GROOT_GELD = 1.3;
const PRIJS_B = 104;
const PRIJS_H = 58;

type GrootPlek = { deel: GDeel; r: Rect; k: number; id: string };
type Indeling = { groot: GrootPlek[]; kaarten: Rect[]; links: Rect[]; rechts: Rect[] };

function deelMaat(d: GDeel): { b: number; h: number } {
  if (d.soort === "tekening") {
    const t = TEKENINGEN[d.tekening];
    const b = t?.b ?? 120;
    const h = t?.h ?? 120;
    return d.prijs != null ? { b: b + PRIJS_B * 0.8, h: Math.max(h, PRIJS_H) } : { b, h };
  }
  if (d.soort === "geld") {
    /* Geld in het tafereel iets groter dan in een kaartje: het is het onderwerp van de vraag. */
    const l = legGeld(d.geld, 99999, 99999, GROOT_GELD);
    return { b: l.b, h: l.h };
  }
  return d.soort === "pijl" ? { b: 84, h: 60 } : { b: 56, h: 56 };
}

export function indeling(p: GeldProps): Indeling {
  const n = p.kaarten?.length ?? 0;
  const metGroot = !!p.groot?.length && !p.verbind;
  let kaarten: Rect[] = [];
  let onder = 700;
  if (n && p.bubbels) {
    const xs = [190, 490, 790];
    const dx = [-14, 18, -6, 10, -18, 14];
    const dy = [-8, 26, -18, 18, -10, 24];
    kaarten = Array.from({ length: n }, (_, i) => ({ x: xs[i % 3] + dx[i], y: (i < 3 ? 200 : 490) + dy[i], b: 214, h: 214 }));
  } else if (n && metGroot) {
    if (n <= 3) {
      kaarten = rij(n, 270, 40, 574, 236);
      onder = 438;
    } else {
      kaarten = rij(n, 214, 22, 590, 220);
      onder = 462;
    }
  } else if (n) {
    if (n === 4) kaarten = [0, 1, 2, 3].map((i) => ({ x: i % 2 === 0 ? 270 : 710, y: i < 2 ? 200 : 510, b: 400, h: 280 }));
    else if (n === 2) kaarten = rij(2, 360, 60, 370, 340);
    else kaarten = rij(n, 290, 34, 370, 340);
  }
  const groot: GrootPlek[] = [];
  if (metGroot && p.groot) {
    const maten = p.groot.map(deelMaat);
    const tussen = 30;
    const somB = maten.reduce((a, m) => a + m.b, 0) + tussen * (maten.length - 1);
    const maxH = Math.max(...maten.map((m) => m.h));
    const top = 14;
    const kMax = p.groot.some((d) => d.soort === "geld") ? 1.3 : 1.7;
    const k = Math.min(kMax, 920 / somB, (onder - top) / maxH);
    let x = VLAK_B / 2 - (somB * k) / 2;
    const yMidden = top + (onder - top) / 2;
    p.groot.forEach((d, i) => {
      const m = maten[i];
      groot.push({ deel: d, r: { x: x + (m.b * k) / 2, y: yMidden, b: m.b * k, h: m.h * k }, k, id: ("id" in d && d.id) || `g${i}` });
      x += (m.b + tussen) * k;
    });
  }
  let links: Rect[] = [];
  let rechts: Rect[] = [];
  if (p.verbind) {
    links = p.verbind.links.map((_, i) => ({ x: 230, y: i === 0 ? 200 : 520, b: 370, h: 270 }));
    rechts = p.verbind.rechts.map((k, i) => (k.geld ? { x: 750, y: i === 0 ? 200 : 520, b: 370, h: 270 } : { x: 790, y: i === 0 ? 200 : 520, b: 260, h: 160 }));
  }
  return { groot, kaarten, links, rechts };
}

export const binnen = (r: Rect, x: number, y: number, marge = 0) => Math.abs(x - r.x) <= r.b / 2 + marge && Math.abs(y - r.y) <= r.h / 2 + marge;

/** Het bolletje van een verbind-vak: aan de binnenkant, halverwege. */
const bolLinks = (r: Rect) => ({ x: r.x + r.b / 2 + 24, y: r.y });
const bolRechts = (r: Rect) => ({ x: r.x - r.b / 2 - 24, y: r.y });

/* ---------- de scène ---------- */

type Ptr = import("phaser").Input.Pointer;
type Box = import("phaser").GameObjects.Container;
type Img = import("phaser").GameObjects.Image;

interface GeldScene {
  verbind(meld: (g: Vlakgebeurtenis) => void): void;
  zet(p: GeldProps): void;
  schudDing(id: string): void;
  golfDing(id: string): void;
  speelHandje(): void;
}

type Soort = "kaart" | "links" | "rechts" | "groot";
type Ding = { box: Box; ring: Img; r: Rect; rond: boolean; zeg: string | null; soort: Soort; id: string; plekken: Plek[]; geldBeelden: Img[] };

const RING = { geel: PALET.geel, groen: "#3fbf6a", rood: "#e8453c" } as const;
const BEL = "#dff3ff";

let LETTER = "system-ui, sans-serif";

function maakScene(Phaser: typeof import("phaser"), rustig: boolean) {
  const Basis = bliepoBasis(Phaser, rustig);
  class Geld extends Basis implements GeldScene {
    melder: (g: Vlakgebeurtenis) => void = () => {};
    p: GeldProps | null = null;
    sig = "";
    nr = -1;
    wacht = "";
    dingen = new Map<string, Ding>();
    alles: import("phaser").GameObjects.GameObject[] = [];
    lijnen: import("phaser").GameObjects.Graphics | null = null;
    trek: import("phaser").GameObjects.Graphics | null = null;
    telRing: Img | null = null;
    telBadge: Img | null = null;
    druk: { d: Ding; x0: number; y0: number; sleept: boolean; lang: boolean } | null = null;
    zweef: string | null = null;
    stemKlok: ReturnType<typeof setTimeout> | undefined;

    constructor() {
      super("squla-geld");
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

    /** Een munt of briefje, één keer klaargezet (verkleind, nooit vergroot). */
    geldPlaatje(g: GeldSoort) {
      const sl = `geld|${g}`;
      if (this.textures.exists(sl)) return sl;
      const img = BEELD.get(g);
      const brief = isBriefje(g);
      const verh = img && brief ? img.naturalWidth / img.naturalHeight : 1.9;
      const b = brief ? 260 : 140;
      const h = brief ? Math.round(b / verh) : 140;
      this.canvasPlaatje(sl, b, h, (c) => {
        c.save();
        c.beginPath();
        if (brief) c.roundRect(1, 1, b - 2, h - 2, 6);
        else c.arc(b / 2, h / 2, b / 2 - 2, 0, Math.PI * 2);
        c.clip();
        if (img) c.drawImage(img, 0, 0, b, h);
        else {
          c.fillStyle = "#d9dde6";
          c.fillRect(0, 0, b, h);
        }
        c.restore();
        c.strokeStyle = PALET.navy;
        c.lineWidth = 2.5;
        c.beginPath();
        if (brief) c.roundRect(1.5, 1.5, b - 3, h - 3, 6);
        else c.arc(b / 2, h / 2, b / 2 - 2, 0, Math.PI * 2);
        c.stroke();
      });
      return sl;
    }

    tekeningOp(c: CanvasRenderingContext2D, sl: string, x: number, y: number, b: number, h: number) {
      const t = TEKENINGEN[sl];
      if (!t) return;
      const k = Math.min(b / t.b, h / t.h);
      c.save();
      c.translate(x + (b - t.b * k) / 2, y + (h - t.h * k) / 2);
      c.scale(k, k);
      tekenVormen(c, t.vormen);
      c.restore();
    }

    kaartPlaatje(d: GKaart, b: number, h: number, bel: boolean) {
      const sl = `gk|${bel ? "bel" : "kaart"}|${d.tekening ?? ""}|${d.label ?? ""}|${Math.round(b)}x${Math.round(h)}`;
      this.canvasPlaatje(sl, b, h, (c) => {
        if (bel) {
          tekenVormen(c, [{ d: cirkel(b / 2, h / 2, b / 2 - 4), vul: BEL, rand: PALET.navy, dik: 4 }]);
          tekenVormen(c, [{ d: `M ${b * 0.22} ${h * 0.36} A ${b * 0.34} ${h * 0.34} 0 0 1 ${b * 0.42} ${h * 0.16}`, rand: "#ffffff", dik: 7 }]);
        } else tekenVormen(c, [{ d: blok(3, 3, b - 6, h - 6, 18), vul: PALET.warmwit, rand: PALET.navy, dik: 4 }]);
        if (d.tekening) {
          const m = bel ? b * 0.2 : 22;
          this.tekeningOp(c, d.tekening, m, m, b - m * 2, h - m * 2);
        }
        if (d.label) {
          c.font = `800 ${d.label.length > 6 ? 40 : 54}px ${LETTER}`;
          c.textAlign = "center";
          c.textBaseline = "middle";
          c.fillStyle = PALET.navy;
          c.fillText(d.label, b / 2, h / 2 + 2, b - 24);
        }
      });
      return sl;
    }

    grootPlaatje(sleutel: string, b: number, h: number) {
      const sl = `gg|${sleutel}|${Math.round(b)}x${Math.round(h)}`;
      this.canvasPlaatje(sl, Math.ceil(b), Math.ceil(h), (c) => this.tekeningOp(c, sleutel, 0, 0, b, h));
      return sl;
    }

    prijsPlaatje(prijs: number) {
      const sl = `gp|${prijs}`;
      this.canvasPlaatje(sl, PRIJS_B, PRIJS_H, (c) => {
        tekenVormen(c, [
          { d: `M 22 4 H ${PRIJS_B - 6} Q ${PRIJS_B - 2} 4 ${PRIJS_B - 2} 10 V ${PRIJS_H - 10} Q ${PRIJS_B - 2} ${PRIJS_H - 4} ${PRIJS_B - 8} ${PRIJS_H - 4} H 22 L 4 ${PRIJS_H / 2} Z`, vul: PALET.geel, rand: PALET.navy, dik: 3.5 },
          { d: cirkel(20, PRIJS_H / 2, 5), vul: PALET.warmwit, rand: PALET.navy, dik: 2.5 },
        ]);
        c.font = `800 30px ${LETTER}`;
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillStyle = PALET.navy;
        c.fillText(`€ ${prijs}`, 62, PRIJS_H / 2 + 2);
      });
      return sl;
    }

    tekenPlaatje(soort: "pijl" | "plus") {
      const sl = `gt|${soort}`;
      this.canvasPlaatje(sl, 84, 60, (c) =>
        tekenVormen(c, [
          soort === "pijl"
            ? { d: "M 6 22 H 50 V 8 L 80 30 L 50 52 V 38 H 6 Z", vul: PALET.warmwit, rand: PALET.navy, dik: 3.5 }
            : { d: "M 34 10 H 50 V 22 H 62 V 38 H 50 V 50 H 34 V 38 H 22 V 22 H 34 Z", vul: PALET.warmwit, rand: PALET.navy, dik: 3.5 },
        ]),
      );
      return sl;
    }

    ringPlaatje(kleur: keyof typeof RING, b: number, h: number, rond: boolean) {
      const sl = `gr|${kleur}|${rond ? "o" : "k"}|${Math.round(b)}x${Math.round(h)}`;
      this.canvasPlaatje(sl, b + 20, h + 20, (c) =>
        tekenVormen(c, [
          { d: rond ? cirkel(b / 2 + 10, h / 2 + 10, b / 2 + 4) : blok(5, 5, b + 10, h + 10, 22), rand: PALET.navy, dik: 10 },
          { d: rond ? cirkel(b / 2 + 10, h / 2 + 10, b / 2 + 4) : blok(5, 5, b + 10, h + 10, 22), rand: RING[kleur], dik: 6.5 },
        ]),
      );
      return sl;
    }

    badgePlaatje(tekst: string) {
      const sl = `gb|${tekst}`;
      const b = 40 + tekst.length * 18;
      this.canvasPlaatje(sl, b, 56, (c) => {
        tekenVormen(c, [{ d: blok(3, 3, b - 6, 50, 25), vul: PALET.geel, rand: PALET.navy, dik: 3.5 }]);
        c.font = `800 32px ${LETTER}`;
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillStyle = PALET.navy;
        c.fillText(tekst, b / 2, 30);
      });
      return sl;
    }

    kruisPlaatje() {
      const sl = "gx";
      this.canvasPlaatje(sl, 100, 100, (c) =>
        tekenVormen(c, [
          { d: "M 14 14 L 86 86 M 86 14 L 14 86", rand: PALET.navy, dik: 15 },
          { d: "M 14 14 L 86 86 M 86 14 L 14 86", rand: RING.rood, dik: 9 },
        ]),
      );
      return sl;
    }

    /* ---------- opbouwen ---------- */

    leeg() {
      for (const o of this.alles) o.destroy();
      this.alles = [];
      this.dingen.clear();
      this.lijnen = null;
      this.trek = null;
      this.telRing = null;
      this.telBadge = null;
      this.druk = null;
    }

    /** Geld in een container leggen (binnen b × h rond het midden). */
    legInBox(box: Box, geld: GeldSoort[], b: number, h: number, maxS: number, kruis: number[] = []) {
      const l = legGeld(geld, b, h, maxS);
      const beelden: Img[] = [];
      l.plekken.forEach((pl, i) => {
        const im = this.add.image(pl.x, pl.y, this.geldPlaatje(pl.g)).setDisplaySize(pl.b, pl.h);
        box.add(im);
        beelden.push(im);
        if (kruis.includes(i)) {
          const m = Math.min(pl.b, pl.h) * 0.9;
          box.add(this.add.image(pl.x, pl.y, this.kruisPlaatje()).setDisplaySize(m, m));
        }
      });
      return { plekken: l.plekken, beelden };
    }

    nieuwDing(d: GKaart, r: Rect, soort: Soort, sleutel: string, bel: boolean) {
      const box = this.add.container(r.x, r.y);
      const ring = this.plaats(this.ringPlaatje("geel", r.b, r.h, bel), 0, 0).setVisible(false);
      box.add([ring, this.plaats(this.kaartPlaatje(d, r.b, r.h, bel), 0, 0)]);
      let plekken: Plek[] = [];
      let geldBeelden: Img[] = [];
      if (d.geld?.length) {
        const m = bel ? r.b * 0.24 : 26;
        ({ plekken, beelden: geldBeelden } = this.legInBox(box, d.geld, r.b - m * 2, r.h - m * 2, 1.45));
      }
      this.alles.push(box);
      const ding: Ding = { box, ring, r, rond: bel, zeg: d.zeg ?? null, soort, id: d.id, plekken, geldBeelden };
      this.dingen.set(sleutel, ding);
      return ding;
    }

    bouw(p: GeldProps, verschijn: boolean) {
      this.leeg();
      const ind = indeling(p);
      const nieuw: Box[] = [];
      for (const g of ind.groot) {
        const box = this.add.container(g.r.x, g.r.y);
        this.alles.push(box);
        const d = g.deel;
        if (d.soort === "tekening") {
          const t = TEKENINGEN[d.tekening];
          const tb = (t?.b ?? 120) * g.k;
          const th = (t?.h ?? 120) * g.k;
          const links = -g.r.b / 2;
          box.add(this.plaats(this.grootPlaatje(d.tekening, tb, th), links + tb / 2, 0));
          if (d.prijs != null) {
            box.add(this.plaats(this.prijsPlaatje(d.prijs), links + tb + (PRIJS_B * 0.8 * g.k) / 2, -th / 2 + (PRIJS_H * g.k) / 2).setScale((g.k * 0.8) / TX));
          }
        } else if (d.soort === "geld") {
          const ring = this.plaats(this.ringPlaatje("geel", g.r.b + 20, g.r.h + 20, false), 0, 0).setVisible(false);
          box.add(ring);
          const { plekken, beelden } = this.legInBox(box, d.geld, g.r.b, g.r.h, g.k * GROOT_GELD, d.kruis);
          this.dingen.set(g.id, { box, ring, r: g.r, rond: false, zeg: null, soort: "groot", id: g.id, plekken, geldBeelden: beelden });
        } else box.add(this.plaats(this.tekenPlaatje(d.soort), 0, 0).setScale(g.k / TX));
        nieuw.push(box);
      }
      (p.kaarten ?? []).forEach((d, i) => {
        const ding = this.nieuwDing(d, ind.kaarten[i], "kaart", d.id, !!p.bubbels);
        nieuw.push(ding.box);
        if (p.bubbels && !rustig) this.tweens.add({ targets: ding.box, y: ding.r.y - 10, duration: 1500 + i * 170, yoyo: true, repeat: -1, ease: "Sine.easeInOut", delay: i * 120 });
      });
      if (p.verbind) {
        this.lijnen = this.add.graphics().setDepth(4);
        this.alles.push(this.lijnen);
        p.verbind.links.forEach((d, i) => nieuw.push(this.nieuwDing(d, ind.links[i], "links", d.id, false).box));
        p.verbind.rechts.forEach((d, i) => nieuw.push(this.nieuwDing(d, ind.rechts[i], "rechts", d.id, false).box));
        this.trek = this.add.graphics().setDepth(5);
        this.alles.push(this.trek);
      }
      if (verschijn) nieuw.forEach((b, i) => this.tover(b, { vertraging: i * 70 }));
    }

    nodig(p: GeldProps): GeldSoort[] {
      const lijst: GeldSoort[] = [];
      for (const d of p.groot ?? []) if (d.soort === "geld") lijst.push(...d.geld);
      for (const k of [...(p.kaarten ?? []), ...(p.verbind?.links ?? []), ...(p.verbind?.rechts ?? [])]) lijst.push(...(k.geld ?? []));
      return [...new Set(lijst)];
    }

    zet(p: GeldProps) {
      this.p = p;
      if (p.vooraf?.length) void laadGeld(p.vooraf);
      const sig = JSON.stringify([
        p.nr,
        p.groot ?? null,
        (p.kaarten ?? []).map((k) => [k.id, k.geld, k.tekening, k.label]),
        !!p.bubbels,
        p.verbind ? [p.verbind.links.map((k) => [k.id, k.geld, k.label]), p.verbind.rechts.map((k) => [k.id, k.geld, k.label])] : null,
      ]);
      if (sig !== this.sig) {
        const ontbreekt = this.nodig(p).filter((g) => !BEELD.has(g) && !LADEN.has(g));
        const nogBezig = this.nodig(p).some((g) => !BEELD.has(g));
        if (nogBezig || ontbreekt.length) {
          /* Eerst de afbeeldingen; daarna pas opbouwen (als er intussen niets anders gevraagd is). */
          this.wacht = sig;
          void laadGeld(this.nodig(p)).then(() => {
            if (this.wacht !== sig || !this.sys?.isActive()) return;
            this.wacht = "";
            this.bouw(this.p!, this.p!.nr !== this.nr);
            this.sig = sig;
            this.nr = this.p!.nr;
            this.pasToe(this.p!);
          });
          return;
        }
        this.wacht = "";
        this.bouw(p, p.nr !== this.nr);
        this.sig = sig;
        this.nr = p.nr;
      }
      if (!this.wacht) this.pasToe(p);
    }

    pasToe(p: GeldProps) {
      const kleur = (id: string): keyof typeof RING | null => (p.goed?.includes(id) ? "groen" : p.fout?.includes(id) ? "rood" : p.licht?.includes(id) ? "geel" : null);
      const zetRing = (d: Ding, k: keyof typeof RING | null) => {
        if (!k) return void d.ring.setVisible(false);
        const b = d.soort === "groot" ? d.r.b + 20 : d.r.b;
        const h = d.soort === "groot" ? d.r.h + 20 : d.r.h;
        d.ring.setTexture(this.ringPlaatje(k, b, h, d.rond)).setVisible(true);
      };
      const v = p.verbind;
      for (const d of this.dingen.values()) {
        if (d.soort === "kaart" || d.soort === "groot") {
          zetRing(d, kleur(d.id));
          if (d.soort === "kaart") d.box.setAlpha(p.uit?.includes(d.id) ? 0.35 : 1);
        }
        if (v && (d.soort === "links" || d.soort === "rechts")) {
          const lijn = v.lijnen.find(([a, b]) => (d.soort === "links" ? a : b) === d.id);
          const k: keyof typeof RING | null = lijn && v.goed.includes(lijn[0]) ? "groen" : lijn && v.fout.includes(lijn[0]) ? "rood" : v.gekozen === d.id ? "geel" : kleur(d.id);
          zetRing(d, k);
        }
      }
      if (this.lijnen && v) {
        const g = this.lijnen;
        g.clear();
        for (const [l, r] of v.lijnen) {
          const a = this.dingen.get(l);
          const b = this.dingen.get(r);
          if (!a || !b) continue;
          const k = v.goed.includes(l) ? 0x3fbf6a : v.fout.includes(l) ? 0xe8453c : 0xffc845;
          const p1 = bolLinks(a.r);
          const p2 = bolRechts(b.r);
          g.lineStyle(12, 0x1d2b5e, 1);
          g.lineBetween(p1.x, p1.y, p2.x, p2.y);
          g.lineStyle(7, k, 1);
          g.lineBetween(p1.x, p1.y, p2.x, p2.y);
        }
        /* De bolletjes: wit als er nog geen lijn is, in de kleur van de lijn als die er wel is. */
        for (const d of this.dingen.values()) {
          if (d.soort !== "links" && d.soort !== "rechts") continue;
          const pt = d.soort === "links" ? bolLinks(d.r) : bolRechts(d.r);
          const lijn = v.lijnen.find(([a, b]) => (d.soort === "links" ? a : b) === d.id);
          const k = !lijn ? 0xfff7ea : v.goed.includes(lijn[0]) ? 0x3fbf6a : v.fout.includes(lijn[0]) ? 0xe8453c : 0xffc845;
          g.fillStyle(0x1d2b5e, 1);
          g.fillCircle(pt.x, pt.y, 15);
          g.fillStyle(k, 1);
          g.fillCircle(pt.x, pt.y, 10.5);
        }
      }
      this.zetGeteld(p);
    }

    /** Bliepo telt: een ring om wat hij nu telt, en bovenaan het bedrag tot nu toe. */
    zetGeteld(p: GeldProps) {
      this.telRing?.destroy();
      this.telBadge?.destroy();
      this.telRing = null;
      this.telBadge = null;
      const t = p.geteld;
      if (!t) return;
      const d = this.dingen.get(t.id);
      if (!d || !d.plekken.length) return;
      const tot = Math.max(0, Math.min(t.tot, d.plekken.length));
      const som = (t.vanaf ?? 0) + d.plekken.slice(0, tot).reduce((a, pl) => a + WAARDE[pl.g], 0);
      if (tot > 0 && tot <= d.plekken.length && t.tot <= d.plekken.length) {
        const pl = d.plekken[tot - 1];
        const rond = !isBriefje(pl.g);
        const sl = this.ringPlaatje("geel", pl.b + 6, pl.h + 6, rond);
        this.telRing = this.plaats(sl, d.box.x + pl.x, d.box.y + pl.y).setDepth(8);
        this.alles.push(this.telRing);
      }
      if (tot > 0) {
        const tekst = `€ ${som}`;
        const boven = d.soort === "groot" ? d.r.y - d.r.h / 2 - 22 : d.box.y - d.r.h / 2 - 4;
        /* Geen plek boven het geld (bovenaan in beeld): dan eronder. */
        const y = boven >= 30 ? boven : d.r.y + d.r.h / 2 + 22;
        this.telBadge = this.plaats(this.badgePlaatje(tekst), d.box.x, y).setDepth(9);
        this.alles.push(this.telBadge);
      }
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
      if (!p?.verbind || rustig) return;
      const ind = indeling(p);
      if (!ind.links[0] || !ind.rechts[0]) return;
      const van = bolLinks(ind.links[0]);
      const naar = bolRechts(ind.rechts[1] ?? ind.rechts[0]);
      this.canvasPlaatje("handje", 48, 56, (c) =>
        tekenVormen(c, [
          {
            d: "M 16 30 V 8 a 5 5 0 0 1 10 0 V 26 V 20 a 5 5 0 0 1 10 0 V 28 a 5 5 0 0 1 9 2 V 40 c 0 9 -7 14 -15 14 h -4 c -6 0 -10 -3 -13 -8 L 4 34 a 5 5 0 0 1 8 -5 Z",
            vul: PALET.warmwit,
            rand: PALET.navy,
            dik: RAND_DUN,
          },
        ]),
      );
      const h = this.plaats("handje", van.x + 10, van.y + 22).setDepth(30).setAlpha(0);
      const spoor = this.add.graphics().setDepth(29);
      this.tweens.chain({
        targets: h,
        tweens: [
          { alpha: 1, duration: 250 },
          {
            x: naar.x + 10,
            y: naar.y + 22,
            duration: 1200,
            ease: "Sine.easeInOut",
            onUpdate: () => {
              spoor.clear();
              spoor.lineStyle(6, 0xffc845, 0.9);
              spoor.lineBetween(van.x, van.y, h.x - 10, h.y - 22);
            },
          },
          {
            alpha: 0,
            duration: 300,
            onComplete: () => {
              h.destroy();
              spoor.destroy();
            },
          },
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

    raakt(d: Ding, x: number, y: number, marge: number) {
      if (d.rond) return Math.hypot(x - d.box.x, y - d.box.y) <= d.r.b / 2 + marge;
      if (binnen({ ...d.r, x: d.box.x, y: d.box.y }, x, y, marge)) return true;
      /* Het bolletje van een verbind-vak hoort er ook bij. */
      if (d.soort === "links" || d.soort === "rechts") {
        const pt = d.soort === "links" ? bolLinks(d.r) : bolRechts(d.r);
        return Math.hypot(x - pt.x, y - pt.y) <= 34;
      }
      return false;
    }

    /** Het ding onder de vinger dat nu iets doet (of alleen voorgelezen kan worden). */
    raak(x: number, y: number, alleenActief: boolean): Ding | null {
      const p = this.p;
      if (!p) return null;
      for (const d of [...this.dingen.values()].reverse()) {
        if (d.soort === "groot" || !this.raakt(d, x, y, 6)) continue;
        if (!alleenActief) return d;
        if (d.soort === "kaart" && p.kaartenActief && !p.uit?.includes(d.id)) return d;
        if ((d.soort === "links" || d.soort === "rechts") && p.verbind?.actief) return d;
      }
      return null;
    }

    neer(p: Ptr) {
      const w = this.waar(p);
      const d = this.raak(w.x, w.y, true);
      clearTimeout(this.stemKlok);
      if (!d) return;
      this.druk = { d, x0: w.x, y0: w.y, sleept: false, lang: false };
      if (p.wasTouch && d.zeg) {
        const druk = this.druk;
        this.stemKlok = setTimeout(() => {
          if (this.druk === druk && !druk.sleept) {
            druk.lang = true;
            zegKeuze(d.zeg!);
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
            if (d?.zeg) this.stemKlok = setTimeout(() => zegKeuze(d.zeg!), 300);
          }
          this.input.setDefaultCursor(d && this.raak(w.x, w.y, true) ? "pointer" : "default");
        }
        return;
      }
      if (!druk.sleept && Math.hypot(w.x - druk.x0, w.y - druk.y0) > 9) {
        druk.sleept = true;
        clearTimeout(this.stemKlok);
      }
      if (!druk.sleept || !this.trek) return;
      if (druk.d.soort === "links" || druk.d.soort === "rechts") {
        const pt = druk.d.soort === "links" ? bolLinks(druk.d.r) : bolRechts(druk.d.r);
        this.trek.clear();
        this.trek.lineStyle(12, 0x1d2b5e, 1);
        this.trek.lineBetween(pt.x, pt.y, w.x, w.y);
        this.trek.lineStyle(7, 0xffc845, 1);
        this.trek.lineBetween(pt.x, pt.y, w.x, w.y);
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
      if (d.soort === "kaart" && druk.sleept && this.raakt(d, w.x, w.y, 6)) return void this.melder({ soort: "kaart", id: d.id });
      if (d.soort === "links" || d.soort === "rechts") {
        if (!druk.sleept) return void this.melder({ soort: d.soort, id: d.id });
        const ander = d.soort === "links" ? "rechts" : "links";
        const doel = [...this.dingen.values()].find((x) => x.soort === ander && this.raakt(x, w.x, w.y, 24));
        if (doel) this.melder({ soort: "lijn", links: d.soort === "links" ? d.id : doel.id, rechts: d.soort === "links" ? doel.id : d.id });
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
  return Geld as unknown as new () => import("phaser").Scene;
}

/* ---------- het vlak ---------- */

export function SqulaGeldVlak(props: GeldProps & Vlakbasis) {
  const { meld, schaal } = props;
  const { plek, scene } = useHoloMotor<GeldScene>(schaal, maakScene, { invoer: true });
  const meldRef = useRef(meld);
  const vlakRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    meldRef.current = meld;
  }, [meld]);

  useEffect(() => {
    if (vlakRef.current) {
      const f = getComputedStyle(vlakRef.current).fontFamily;
      if (f) LETTER = f;
    }
  }, []);

  useEffect(() => {
    scene?.verbind((g) => meldRef.current(g));
  }, [scene]);

  const { nr, groot, kaarten, kaartenActief, bubbels, uit, goed, fout, licht, verbind, geteld, vooraf } = props;
  const stand = JSON.stringify({ nr, groot, kaarten, kaartenActief, bubbels, uit, goed, fout, licht, verbind, geteld, vooraf });
  useEffect(() => {
    if (scene) scene.zet(JSON.parse(stand) as GeldProps);
  }, [scene, stand]);

  /* Het geld van de les alvast laden, ook voordat Phaser klaar is. */
  const voorafSleutel = (vooraf ?? []).join(",");
  useEffect(() => {
    if (voorafSleutel) void laadGeld(voorafSleutel.split(",") as GeldSoort[]);
  }, [voorafSleutel]);

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

  /* De namen van tekeningen en woorden alvast klaarzetten om voor te lezen (geld nooit). */
  const namen = [...(kaarten ?? []), ...(verbind?.links ?? []), ...(verbind?.rechts ?? [])].map((d) => d.zeg ?? "").filter(Boolean);
  const namenSleutel = namen.join("\n");
  useEffect(() => {
    if (namenSleutel) haalKeuzesAlvast(namenSleutel.split("\n"));
  }, [namenSleutel]);

  /* Onzichtbare knoppen over alles wat je kunt tikken: toetsenbord en automatische test. */
  const ind = indeling(props);
  const knoppen: { id: string; zeg: string | null; r: Rect; doe: () => void }[] = [];
  if (kaartenActief) (kaarten ?? []).forEach((d, i) => !uit?.includes(d.id) && knoppen.push({ id: d.id, zeg: d.zeg ?? null, r: ind.kaarten[i], doe: () => meld({ soort: "kaart", id: d.id }) }));
  if (verbind?.actief) {
    verbind.links.forEach((d, i) => knoppen.push({ id: d.id, zeg: d.zeg ?? null, r: ind.links[i], doe: () => meld({ soort: "links", id: d.id }) }));
    verbind.rechts.forEach((d, i) => knoppen.push({ id: d.id, zeg: d.zeg ?? null, r: ind.rechts[i], doe: () => meld({ soort: "rechts", id: d.id }) }));
  }

  return (
    <div className={s.vlak} ref={vlakRef}>
      <div ref={plek} style={{ ...HOLO_CANVAS, touchAction: "none" }} aria-hidden />
      <div data-knop="keuzes" className={s.knoppen}>
        {knoppen.map((k, i) => (
          <button
            key={k.id}
            type="button"
            className={s.ding}
            data-ding={k.id}
            aria-label={k.zeg ?? `Keuze ${i + 1}`}
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

/** De tekening op de kaart aan het eind (244 × 190): een spaarpot. */
export function KaartSpaarpot() {
  const t = TEKENINGEN.spaarpot;
  return (
    <svg viewBox={`-20 -10 ${t.b + 40} ${t.h + 20}`} width={244} height={190} aria-hidden="true">
      {t.vormen.map((v, i) => (
        <path key={i} d={v.d} fill={v.vul ?? "none"} stroke={v.rand ?? "none"} strokeWidth={v.rand ? (v.dik ?? 6) : 0} strokeLinejoin="round" strokeLinecap="round" />
      ))}
    </svg>
  );
}

/** De tekening op de kaart aan het eind (244 × 190): het skateboard van Sam en Noor. */
export function KaartSkateboard() {
  const t = TEKENINGEN.skateboard;
  return (
    <svg viewBox={`-20 -50 ${t.b + 40} ${t.h + 100}`} width={244} height={190} aria-hidden="true">
      {t.vormen.map((v, i) => (
        <path key={i} d={v.d} fill={v.vul ?? "none"} stroke={v.rand ?? "none"} strokeWidth={v.rand ? (v.dik ?? 6) : 0} strokeLinejoin="round" strokeLinecap="round" />
      ))}
    </svg>
  );
}
