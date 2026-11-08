"use client";

/**
 * Rekenmix als hologrammen (31 oktober 2026, opdracht eigenaar): het speelvlak
 * van de lessen naar Squla groep 3 "Rekenmix" (vier oefeningen met elk vier
 * levels). Alles in Phaser (HARDE REGEL 7), vóór de donkere ruimte van het
 * lesscherm. Geen kaders of kaartjes om plaatjes: de dingen staan los.
 *
 * Een opgave bestaat uit TEKENINGEN: een lijstje stukken (een voorwerp, een
 * platte vorm, een getaltegel, een rondje met een getal, een lijn) met
 * plekken ten opzichte van het midden van de tekening. Drie soorten:
 *
 * - `kijk`: een tekening bovenaan (`boven`) en/of tekeningen om op te tikken
 *   (`keuzes`). Zonder keuzes antwoordt het kind met de knoppen bij Bliepo
 *   (`l.kies`, `l.getal`). Een tik meldt `{ soort: "keuze", i }`.
 * - `volgorde`: kaarten (tekeningen) die het kind naar de plekjes sleept
 *   (tikken mag ook: naar het eerste lege plekje). `vast` staat al in de
 *   eerste plekjes. Alle plekjes vol: `{ soort: "volgorde", rij }`.
 * - `verbind`: drie tekeningen links en drie rechts, met een stip ernaast.
 *   Het kind trekt een lijn van stip naar stip (of tikt links en dan rechts).
 *   Liggen er drie lijnen: `{ soort: "verbind", paren }` (per links het
 *   nummer rechts). `uitslag` kleurt ze: goed blijft groen liggen, fout wordt
 *   grijs en dof (geen rood) en verdwijnt.
 *
 * Wat het draaiboek verder zet: `licht` (in één tekening lichten deze stukken
 * op en de rest wordt dof: samen tellen), `labels` (getallen of woordjes bij
 * een plek in een tekening), `goed` en `fout` (een tekening licht op of
 * schudt), `plekGoed`, `ronde` (kaarten terug), `hand` (een lichtje doet één
 * keer voor hoe je sleept) en `test` (voor de automatische test).
 *
 * Gloed: de plaatjes hebben geen vaste gloed; ze lichten alleen op op het
 * moment dat het iets betekent (meetellen, goed antwoord). De gloed is één
 * keer gebakken (holo/basis.ts), nooit live.
 */

import { useEffect, useMemo } from "react";
import type { Vlakbasis, Vlakgebeurtenis } from "../soort";
import { holoBasis, TX, VLAK_B, VLAK_H, WARM, GOED, type PhaserModule } from "../holo/basis";
import { maakRondjes, vakOm, type RondjeVak } from "../holo/rondje";
/** Een groot geheel (veel dingen): het rondje sluit er strak omheen (ongeveer 30 punten ruimte) in plaats van een enorm ovaal; `maakRondjes` rekent zelf nog ruimte bij. */
function strak(v: RondjeVak): RondjeVak {
  if (v.b <= 240 && v.h <= 240) return v;
  return { x: v.x, y: v.y, b: Math.max(60, (v.b + 60 - 44) / 1.15), h: Math.max(60, (v.h + 60 - 50) / 1.4) };
}

import { HOLO_CANVAS, useHoloMotor } from "../holo/motor";
import { speelLesgeluid } from "@/lib/lesgeluiden";
import { RM_MAAT, RING_MAAT, RING_BINNEN, rmHex, tekenDing, tekenDingMetRing, tekenTegel, tekenVorm, type RMKleur, type RMVorm } from "./squla-rekenmix-tekenen";
import s from "./squla-rekenmix.module.css";

export type { RMKleur, RMVorm };

/* ---------- tekeningen en opgaven ---------- */

export type RMStuk =
  /** Een voorwerp (vast plaatje) in een vak van m × m; sx/sy rekken het op (dik, hoog); `snij` = welk deel van boven zichtbaar is. */
  | { t: "vw"; naam: string; x: number; y: number; m: number; sx?: number; sy?: number; snij?: number; ring?: string }
  | { t: "vorm"; vorm: RMVorm; kleur: RMKleur; x: number; y: number; m: number }
  | { t: "tegel"; n: number; x: number; y: number; m: number }
  /** Een rondje met een getal of een vraagteken (het splitsbeen). */
  | { t: "rondje"; tekst: string; x: number; y: number; r: number; licht?: boolean; kleur?: string }
  | { t: "lijn"; x1: number; y1: number; x2: number; y2: number };

export type RMTekening = { stukken: RMStuk[]; b: number; h: number };

export type RMOpgave =
  /**
   * `plek` (herstel 7 november, BOUWREGELS 1.23): op welke plek (van links) keuze i staat; de keuzes houden hun nummer
   * (en dus de beoordeling), alleen de plek wisselt. `ruimteOnder`: de tekening bovenaan laat onderaan ruimte vrij voor de
   * grote antwoordknoppen in het midden (Kiesinstel `midden`).
   * `vakken` (ronde 7, 7 november 2026, BOUWREGELS 1.4): de keuzes onder de rij staan elk in een eigen zacht vak, netjes in het
   * midden met ruimte ertussen: de rij bovenaan is de vraag, de vakken zijn het antwoord (zoals de munten in de geldles).
   */
  | { id: string; soort: "kijk"; boven?: RMTekening; keuzes?: RMTekening[]; namen?: string[]; plek?: number[]; ruimteOnder?: boolean; vakken?: boolean }
  | { id: string; soort: "volgorde"; kaarten: RMTekening[]; vast?: RMTekening[]; namen?: string[] }
  | { id: string; soort: "verbind"; links: RMTekening[]; rechts: RMTekening[] };

export type RMLabel = { deel: string; x: number; y: number; tekst: string; klein?: boolean; kleur?: string };

export type RMProps = {
  opgave: RMOpgave | null;
  actief?: boolean;
  /** In tekening `deel` lichten de stukken `aan` op; de rest is dof (als `dof` niet false is). */
  licht?: { deel: string; aan: number[]; dof?: boolean } | null;
  labels?: RMLabel[] | null;
  goed?: { deel: string; keer: number } | null;
  fout?: { deel: string; keer: number } | null;
  plekGoed?: boolean[] | null;
  ronde?: number;
  hand?: boolean;
  /** Verbinden: per lijn links of hij goed is (na nakijken), met een teller. */
  uitslag?: { goed: boolean[]; keer: number } | null;
  /** Voor de automatische test: bij volgorde de goede kaart per vrij plekje, bij verbind per links het goede nummer rechts. */
  test?: number[] | null;
  /** Alle vaste plaatjes van de les (vooraf getekend, ook met gloed). */
  namen?: readonly string[];
  /** Alle opgaven van de les: vormen en tegels worden vooraf getekend, vóór het eerste beeld. */
  vooraf?: RMOpgave[];
};

/* ---------- waar staat wat (punten van het vlak, 980 × 720) ---------- */

/** Een plek: het midden, de maat, en hoeveel de tekening verkleind is om te passen. */
export type RMPlek = { x: number; y: number; b: number; h: number; f: number };
export type RMIndeling = { delen: Record<string, RMPlek>; sloten: RMPlek[]; stippen: Record<string, { x: number; y: number }>; vakken?: RMPlek[] };

function past(t: RMTekening, x: number, y: number, maxB: number, maxH: number): RMPlek {
  const f = Math.min(1, maxB / t.b, maxH / t.h);
  return { x, y, b: t.b * f, h: t.h * f, f };
}

/** n plekken naast elkaar, gelijk verdeeld over het vlak. */
function naastElkaar(n: number, breed: number): number[] {
  const stap = Math.min(VLAK_B / n, breed);
  const x0 = VLAK_B / 2 - (stap * (n - 1)) / 2;
  return Array.from({ length: n }, (_, i) => x0 + i * stap);
}

export const VERBIND_Y = [125, 360, 595];
export const VERBIND_X = { l: 190, r: 790, sl: 395, sr: 585 };

export function rmIndeling(o: RMOpgave): RMIndeling {
  const delen: Record<string, RMPlek> = {};
  if (o.soort === "kijk") {
    const keuzes = o.keuzes ?? [];
    if (o.boven && keuzes.length && o.vakken) {
      /* Ronde 7: de rij (de vraag) bovenaan, de antwoordkeuzes elk in een eigen zacht vak eronder, in het midden. */
      const n = keuzes.length;
      const gat = n >= 5 ? 12 : 36;
      const vb = Math.min(260, (900 - (n - 1) * gat) / n);
      /* Ronde 9 (7 nov, Sara: vakken te hoog en smal, voorwerpen klein met veel lege ruimte): het vak is niet hoger dan
         breed, en het voorwerp vult het vak (groot, precies in het midden). Het voorwerp mag iets groter worden dan zijn
         tekening, maar blijft altijd binnen het vak (marge rondom), zodat er niets uitsteekt of wordt afgesneden. */
      const vh = n >= 5 ? Math.round(vb) : 250;
      const marge = n >= 5 ? 10 : 16;
      const bh = 250;
      delen.b = past(o.boven, VLAK_B / 2, 20 + bh / 2, 900, bh);
      /* Het midden van de vakken blijft op dezelfde hoogte als eerst (niet dichter bij de rand of de microfoon). */
      const cy = VLAK_H - 22 - (n >= 5 ? 200 : 250) / 2;
      const x0 = VLAK_B / 2 - ((vb + gat) * (n - 1)) / 2;
      const vakken: RMPlek[] = [];
      keuzes.forEach((k, i) => {
        const x = x0 + (o.plek?.[i] ?? i) * (vb + gat);
        const f = Math.min(1.2, (vb - 2 * marge) / k.b, (vh - 2 * marge) / k.h);
        delen[`k${i}`] = { x, y: cy, b: k.b * f, h: k.h * f, f };
        vakken.push({ x, y: cy, b: vb, h: vh, f: 1 });
      });
      return { delen, sloten: [], stippen: {}, vakken };
    }
    if (o.boven && keuzes.length) {
      /* Groepjes (meerdere voorwerpen) staan hoger, midden in beeld, niet geperst onderaan (BOUWREGELS 14.23). */
      const groepen = keuzes.some((k) => k.stukken.length > 1);
      /* Herstel 7 november (OVERZICHT-C mix4-4): bij een groepje bovenaan liepen dat groepje en de keuzes eronder in elkaar
         over. Nu is de tekening bovenaan lager begrensd en beginnen de keuzes altijd met ruimte eronder. */
      const bh = Math.min(o.boven.h, o.boven.stukken.length > 1 && groepen ? 240 : 330);
      delen.b = past(o.boven, VLAK_B / 2, 20 + bh / 2, 900, bh);
      const onderB = 20 + delen.b.h / 2 + bh / 2;
      const kh = Math.min(440, VLAK_H - 16 - (onderB + 40), Math.max(...keuzes.map((k) => k.h)));
      const xs = naastElkaar(keuzes.length, 320);
      const kb = Math.min(...xs.map((_, i) => (i ? xs[i] - xs[i - 1] : VLAK_B / keuzes.length))) - 16;
      const cy = Math.max(onderB + 40 + kh / 2, groepen ? Math.min(VLAK_H - 28 - kh / 2, 450) : VLAK_H - 28 - kh / 2);
      keuzes.forEach((k, i) => (delen[`k${i}`] = past(k, xs[o.plek?.[i] ?? i], cy, kb, kh)));
    } else if (o.boven) delen.b = o.ruimteOnder ? past(o.boven, VLAK_B / 2, 275, 920, 500) : past(o.boven, VLAK_B / 2, VLAK_H / 2, 920, 660);
    else {
      /* Herstel 7 november (mix3-2): een rij van 5 liep tot tegen de linkerrand; dan iets dichter bij elkaar, in het midden. */
      const xs = naastElkaar(keuzes.length, keuzes.length >= 5 ? 174 : 320);
      const kb = keuzes.length > 1 ? xs[1] - xs[0] - 20 : 600;
      keuzes.forEach((k, i) => (delen[`k${i}`] = past(k, xs[o.plek?.[i] ?? i], VLAK_H / 2, kb, 560)));
    }
    return { delen, sloten: [], stippen: {} };
  }
  if (o.soort === "volgorde") {
    const vast = o.vast ?? [];
    const n = vast.length + o.kaarten.length;
    const sb = Math.min(250, (920 - (n - 1) * 16) / n);
    const xs = naastElkaar(n, sb + 16);
    const sh = 290;
    const sloten = xs.map((x) => ({ x, y: 40 + sh / 2, b: sb, h: sh, f: 1 }));
    vast.forEach((t, i) => {
      const p = past(t, xs[i], sloten[i].y, sb, sh);
      delen[`v${i}`] = { ...p, y: opPlekje(sloten[i], p).y };
    });
    const hx = naastElkaar(o.kaarten.length, sb + 40);
    o.kaarten.forEach((t, i) => (delen[`k${i}`] = past(t, hx[i], VLAK_H - 40 - sh / 2, sb, sh)));
    return { delen, sloten, stippen: {} };
  }
  const stippen: Record<string, { x: number; y: number }> = {};
  o.links.forEach((t, i) => {
    delen[`l${i}`] = past(t, VERBIND_X.l, VERBIND_Y[i], 340, 210);
    stippen[`l${i}`] = { x: VERBIND_X.sl, y: VERBIND_Y[i] };
  });
  o.rechts.forEach((t, i) => {
    delen[`r${i}`] = past(t, VERBIND_X.r, VERBIND_Y[i], 340, 210);
    stippen[`r${i}`] = { x: VERBIND_X.sr, y: VERBIND_Y[i] };
  });
  return { delen, sloten: [], stippen };
}

/** Waar een kaart in een plekje staat: met zijn onderkant net op het lichtvlak. */
export function opPlekje(sl: RMPlek, kaart: RMPlek) {
  return { x: sl.x, y: sl.y + sl.h / 2 - 16 - kaart.h / 2 };
}

function tekeningVan(o: RMOpgave, deel: string): RMTekening | undefined {
  const nr = Number(deel.slice(1));
  if (o.soort === "kijk") return deel === "b" ? o.boven : o.keuzes?.[nr];
  if (o.soort === "volgorde") return deel[0] === "v" ? o.vast?.[nr] : o.kaarten[nr];
  return deel[0] === "l" ? o.links[nr] : o.rechts[nr];
}

/* ---------- de scène ---------- */

type Melder = (g: Vlakgebeurtenis) => void;

interface RMScene {
  verbind(m: Melder): void;
  zetOpgave(o: RMOpgave | null): void;
  zetActief(aan: boolean): void;
  zetLicht(l: RMProps["licht"]): void;
  goed(deel: string): void;
  fout(deel: string): void;
  plekGoed(lijst: boolean[] | null): void;
  terugNaarHuis(): void;
  hand(aan: boolean): void;
  uitslag(goed: boolean[]): void;
  zetTest(t: number[] | null): void;
  tik(deel: string): void;
  sleepPunt(): { x: number; y: number } | null;
}

function maakScene(Phaser: PhaserModule, rustig: boolean, namen: readonly string[], vooraf: RMOpgave[]) {
  const Basis = holoBasis(Phaser, rustig);
  type Img = import("phaser").GameObjects.Image;
  type Box = import("phaser").GameObjects.Container;
  type Gfx = import("phaser").GameObjects.Graphics;
  type Ptr = import("phaser").Input.Pointer;
  /** Een tekening in beeld: de container, de beelden per stuk (null bij lijn/rondje), en de sleutel van elk plaatje. */
  type Deel = { naam: string; box: Box; items: (Img | null)[]; tex: (string | null)[]; plek: RMPlek; slot: number | null; rondjes?: ReturnType<typeof maakRondjes>; rondjeTok?: number };

  class RM extends Basis implements RMScene {
    o: RMOpgave | null = null;
    ind: RMIndeling | null = null;
    delen: Deel[] = [];
    overig: (Img | Gfx | Box)[] = [];
    melder: Melder = () => {};
    actief = false;
    bezig = false;
    test: number[] | null = null;
    vinger: Img | null = null;
    sleep: { d: Deel; dx: number; dy: number; x0: number; y0: number; bewogen: boolean } | null = null;
    /* Verbinden. */
    lijnen = new Map<number, number>();
    vast = new Set<number>();
    lijnGfx: Gfx | null = null;
    trek: { kant: "l" | "r"; i: number; x0: number; y0: number; bewogen: boolean; x: number; y: number } | null = null;
    gekozen: { kant: "l" | "r"; i: number } | null = null;
    keuzeRing: Img | null = null;
    vorigLicht = new Set<string>();

    constructor() {
      super("squla-rekenmix");
    }

    verbind(m: Melder) {
      this.melder = m;
    }

    maak() {
      this.canvasPlaatje("rm-vinger", 60, 60, (c) => {
        const g = c.createRadialGradient(30, 30, 4, 30, 30, 28);
        g.addColorStop(0, "rgba(255,255,255,1)");
        g.addColorStop(0.45, "rgba(255,240,190,0.9)");
        g.addColorStop(1, "rgba(255,211,110,0)");
        c.fillStyle = g;
        c.beginPath();
        c.arc(30, 30, 28, 0, Math.PI * 2);
        c.fill();
      });
      /* Een plekje om iets neer te zetten: een zacht lichtvlak op de vloer, geen kader. */
      this.canvasPlaatje("rm-plekje", 220, 50, (c) => {
        c.save();
        c.translate(110, 25);
        c.scale(1, 0.2);
        const g = c.createRadialGradient(0, 0, 10, 0, 0, 104);
        g.addColorStop(0, "rgba(190,240,255,0.55)");
        g.addColorStop(1, "rgba(127,233,255,0)");
        c.fillStyle = g;
        c.beginPath();
        c.arc(0, 0, 104, 0, Math.PI * 2);
        c.fill();
        c.setLineDash([16, 12]);
        c.lineWidth = 9;
        c.strokeStyle = "rgba(190,240,255,0.85)";
        c.beginPath();
        c.arc(0, 0, 100, 0, Math.PI * 2);
        c.stroke();
        c.restore();
      });
      this.canvasPlaatje("rm-stip", 40, 40, (c) => {
        c.beginPath();
        c.arc(20, 20, 13, 0, Math.PI * 2);
        c.fillStyle = "#ffffff";
        c.fill();
        c.strokeStyle = "#9fe9ff";
        c.lineWidth = 4;
        c.stroke();
      });
      for (const n of new Set(namen)) this.texVw(n, true);
      this.voorbereid(vooraf);
      this.input.on("pointerdown", (p: Ptr) => this.neer(p));
      this.input.on("pointermove", (p: Ptr) => this.beweeg(p));
      this.input.on("pointerup", (p: Ptr) => this.los(p));
      this.input.on("pointerupoutside", (p: Ptr) => this.los(p));
    }

    /* ---------- plaatjes (één keer getekend; de gloed één keer gebakken) ---------- */

    texVw(naam: string, gloed = false, ring?: string) {
      /* Met `ring`: het voorwerp met een randje in de kleur van zijn groepje (BOUWREGELS 2.1). */
      const sl = ring ? `rm-v-${naam}-ring-${ring.slice(1)}` : `rm-v-${naam}`;
      if (ring) this.canvasPlaatje(sl, RING_MAAT, RING_MAAT, (c) => tekenDingMetRing(c, naam, ring));
      else this.canvasPlaatje(sl, RM_MAAT, RM_MAAT, (c) => tekenDing(c, naam, RM_MAAT));
      if (gloed) this.bak(sl, `${sl}-g`, WARM);
      return sl;
    }

    texVorm(vorm: RMVorm, kleur: RMKleur, gloed = false) {
      const sl = `rm-f-${vorm}-${kleur}`;
      this.canvasPlaatje(sl, RM_MAAT, RM_MAAT, (c) => tekenVorm(c, vorm, kleur, RM_MAAT));
      if (gloed) this.bak(sl, `${sl}-g`, rmHex(kleur === "licht" ? "licht" : kleur));
      return sl;
    }

    texTegel(n: number, gloed = false) {
      const sl = `rm-t-${n}`;
      this.canvasPlaatje(sl, 120, 120, (c) => tekenTegel(c, n, 120));
      if (gloed) this.bak(sl, `${sl}-g`, WARM);
      return sl;
    }

    voorbereid(lijst: RMOpgave[]) {
      const tekeningen = (o: RMOpgave): RMTekening[] =>
        o.soort === "kijk" ? [...(o.boven ? [o.boven] : []), ...(o.keuzes ?? [])] : o.soort === "volgorde" ? [...(o.vast ?? []), ...o.kaarten] : [...o.links, ...o.rechts];
      for (const o of lijst)
        for (const t of tekeningen(o))
          for (const st of t.stukken) {
            if (st.t === "vorm") this.texVorm(st.vorm, st.kleur, true);
            else if (st.t === "tegel") this.texTegel(st.n, true);
            else if (st.t === "vw") this.texVw(st.naam, true, st.ring);
          }
    }

    /* ---------- een tekening in beeld ---------- */

    maakDeel(naam: string, t: RMTekening, plek: RMPlek, vertraging: number): Deel {
      const box = this.add.container(plek.x, plek.y);
      const items: (Img | null)[] = [];
      const tex: (string | null)[] = [];
      for (const st of t.stukken) {
        if (st.t === "lijn") {
          const g = this.add.graphics();
          g.lineStyle(5, 0xdff6ff, 0.95);
          g.lineBetween(st.x1, st.y1, st.x2, st.y2);
          box.add(g);
          items.push(null);
          tex.push(null);
          continue;
        }
        if (st.t === "rondje") {
          const g = this.add.graphics();
          g.fillStyle(st.licht ? 0x3a2f6e : 0x1d2a66, 1);
          g.fillCircle(st.x, st.y, st.r);
          g.lineStyle(5, st.kleur ? parseInt(st.kleur.slice(1), 16) : st.licht ? 0xffe27a : 0x9fe9ff, 1);
          g.strokeCircle(st.x, st.y, st.r);
          const tx = this.add
            .text(st.x, st.y + 1, st.tekst, { fontFamily: '"Work Sans", system-ui, sans-serif', fontSize: `${Math.round(st.r * 1.15)}px`, fontStyle: "800", color: st.kleur ?? (st.licht ? "#ffe27a" : "#ffffff") })
            .setOrigin(0.5)
            .setResolution(2);
          box.add([g, tx]);
          items.push(null);
          tex.push(null);
          continue;
        }
        const sl = st.t === "vw" ? this.texVw(st.naam, false, st.ring) : st.t === "vorm" ? this.texVorm(st.vorm, st.kleur) : this.texTegel(st.n);
        const ring = st.t === "vw" && !!st.ring;
        const basis = st.t === "tegel" ? 120 : ring ? RING_MAAT : RM_MAAT;
        const img = this.add.image(st.x, st.y, sl);
        /* Met ring is het plaatje groter dan het voorwerp: het voorwerp zelf houdt dezelfde maat. */
        const sc = (ring ? (st.m * RING_MAAT) / RING_BINNEN : st.m) / basis / TX;
        const sx = st.t === "vw" ? (st.sx ?? 1) : 1;
        const sy = st.t === "vw" ? (st.sy ?? 1) : 1;
        img.setScale(sc * sx, sc * sy);
        if (st.t === "vw" && st.snij !== undefined && st.snij < 1) img.setCrop(0, 0, RM_MAAT * TX, RM_MAAT * TX * st.snij);
        box.add(img);
        items.push(img);
        tex.push(sl);
      }
      box.setScale(plek.f);
      const d: Deel = { naam, box, items, tex, plek, slot: null };
      this.tover(box, { vertraging });
      return d;
    }

    leeg() {
      for (const d of this.delen) {
        d.rondjes?.vergeet();
        this.verdwijn(d.box);
      }
      for (const x of this.overig) x.destroy();
      this.delen = [];
      this.overig = [];
      this.vinger?.destroy();
      this.vinger = null;
      this.keuzeRing?.destroy();
      this.keuzeRing = null;
      this.lijnGfx = null;
      this.lijnen.clear();
      this.vast.clear();
      this.trek = null;
      this.gekozen = null;
      this.sleep = null;
      this.bezig = false;
      this.vorigLicht.clear();
    }

    zetOpgave(o: RMOpgave | null) {
      if (o && this.o && o.id === this.o.id) return;
      this.leeg();
      this.o = o;
      this.ind = o ? rmIndeling(o) : null;
      const ind = this.ind;
      if (!o || !ind) return;
      /* Plekjes om iets neer te zetten, en onder elke keuze een zacht lichtvlak: zo zie je wat bij elkaar hoort (geen kader). */
      for (const sl of ind.sloten) this.overig.push(this.plaats("rm-plekje", sl.x, sl.y + sl.h / 2 - 12).setDepth(-2).setScale(Math.min(1, sl.b / 230) / TX, 1 / TX));
      for (const v of ind.vakken ?? []) {
        const sl = `rm-vak|${Math.round(v.b)}|${Math.round(v.h)}`;
        this.canvasPlaatje(sl, v.b, v.h, (c) => {
          c.fillStyle = "rgba(207,227,255,0.16)";
          c.beginPath();
          c.roundRect(2, 2, v.b - 4, v.h - 4, 34);
          c.fill();
          c.lineWidth = 3;
          c.strokeStyle = "rgba(190,240,255,0.42)";
          c.stroke();
        });
        this.overig.push(this.plaats(sl, v.x, v.y).setDepth(-3));
      }
      if (o.soort === "kijk" && !ind.vakken)
        for (const [naam, p] of Object.entries(ind.delen))
          if (naam[0] === "k") this.overig.push(this.plaats("rm-plekje", p.x, p.y + p.h / 2 + 4).setDepth(-2).setScale(Math.min(1.2, Math.max(0.6, p.b / 220)) / TX, 1 / TX).setAlpha(0.55));
      let k = 0;
      for (const [naam, plek] of Object.entries(ind.delen)) {
        const t = tekeningVan(o, naam);
        if (!t) continue;
        const d = this.maakDeel(naam, t, plek, k++ * 80);
        if (naam[0] === "v") d.slot = Number(naam.slice(1));
        this.delen.push(d);
      }
      if (o.soort === "verbind") {
        for (const [, p] of Object.entries(ind.stippen)) this.overig.push(this.plaats("rm-stip", p.x, p.y).setDepth(3));
        this.lijnGfx = this.add.graphics().setDepth(2);
        this.overig.push(this.lijnGfx);
      }
      speelLesgeluid("verschijn");
      this.meldTest();
    }

    deel(naam: string) {
      return this.delen.find((d) => d.naam === naam);
    }

    /** Gloed op het moment: even oplichten en dan weer gewoon. */
    flits(d: Deel, i: number, ms: number) {
      const img = d.items[i];
      const sl = d.tex[i];
      /* Herstel 7 november (OVERZICHT-C mix4-2 vraag 2): een uitgestelde flits kon nog lopen als de volgende opgave de
         plaatjes al had opgeruimd; setTexture op een opgeruimd plaatje gaf een fout en dan liep het vlak vast. */
      if (!img || !sl || !img.scene || !img.active) return;
      if (!this.textures.exists(`${sl}-g`)) return;
      img.setTexture(`${sl}-g`);
      if (!this.rustig) {
        const sx = img.scaleX;
        const sy = img.scaleY;
        this.tweens.add({ targets: img, scaleX: sx * 1.14, scaleY: sy * 1.14, duration: 120, yoyo: true, onComplete: () => img.setScale(sx, sy) });
      }
      this.time.delayedCall(ms, () => img.active && img.scene && img.setTexture(sl));
    }

    zetLicht(l: RMProps["licht"]) {
      const nieuw = new Set<string>();
      for (const d of this.delen) {
        const hier = l && l.deel === d.naam;
        d.items.forEach((img, i) => {
          if (!img) return;
          const aan = !!hier && l!.aan.includes(i);
          img.setAlpha(!hier || aan || l!.dof === false ? 1 : 0.3);
          if (aan) nieuw.add(`${d.naam}-${i}`);
        });
        /* Het rondje komt precies waar de gloed kwam (Sara, 6 november 2026): om wat nu NIEUW oplicht, 450 ms, en dan weg.
           Wat al aan stond (zelfde aanroep nog eens) krijgt niets, net als de gloed. Meer dingen tegelijk: één rondje om het geheel. */
        const nieuwIdx = hier ? l!.aan.filter((i) => !this.vorigLicht.has(`${d.naam}-${i}`)) : [];
        const wijs = d.items.filter((im, i): im is Img => !!im && nieuwIdx.includes(i));
        const vak = wijs.length ? vakOm(wijs) : null;
        if (vak) {
          d.rondjes ??= maakRondjes(this, d.box, this.rustig);
          const rj = d.rondjes;
          const tok = (d.rondjeTok ?? 0) + 1;
          d.rondjeTok = tok;
          rj.zet(new Map([[`licht-${nieuwIdx.join(",")}-${tok}`, strak(vak)]]));
          this.time.delayedCall(450, () => {
            if (d.rondjeTok === tok && this.delen.includes(d)) rj.zet(new Map());
          });
        }
      }
      this.vorigLicht = nieuw;
    }

    zetActief(aan: boolean) {
      this.actief = aan;
      if (aan) this.bezig = false;
      if (aan && this.o?.soort === "verbind") {
        /* Wat niet vast ligt, is weg: het kind trekt de rest opnieuw. */
        for (const l of [...this.lijnen.keys()]) if (!this.vast.has(l)) this.lijnen.delete(l);
        this.tekenLijnen();
      }
      this.meldTest();
    }

    goed(naam: string) {
      const lijst = naam === "*" ? this.delen.filter((d) => d.slot !== null && d.naam[0] === "k") : [this.deel(naam)].filter((d): d is Deel => !!d);
      lijst.forEach((d, k) =>
        this.time.delayedCall(this.rustig ? 0 : k * 160, () => {
          d.items.forEach((_, i) => this.flits(d, i, 1100));
          this.golf(d.box.x, d.box.y, GOED);
        }),
      );
      /* Bij een keuze: de andere keuzes worden dof. */
      if (naam !== "*" && this.o?.soort === "kijk" && naam[0] === "k") for (const d of this.delen) if (d.naam[0] === "k" && d.naam !== naam) d.box.setAlpha(0.35);
    }

    fout(naam: string) {
      const d = this.deel(naam);
      if (d) this.schud(d.box);
    }

    plekGoed(lijst: boolean[] | null) {
      if (!lijst) return;
      for (const d of this.delen)
        if (d.slot !== null && d.naam[0] === "k") {
          if (lijst[d.slot]) {
            d.items.forEach((_, i) => this.flits(d, i, 900));
            this.golf(d.box.x, d.box.y, GOED);
          } else this.schud(d.box);
        }
    }

    terugNaarHuis() {
      for (const d of this.delen) {
        d.box.setAlpha(1);
        if (d.naam[0] !== "k" || this.o?.soort !== "volgorde") continue;
        d.slot = null;
        d.box.setDepth(0);
        this.tweens.add({ targets: d.box, x: d.plek.x, y: d.plek.y, duration: this.rustig ? 1 : 260, ease: "Cubic.easeOut" });
      }
      this.bezig = false;
      this.meldTest();
    }

    hand(aan: boolean) {
      this.vinger?.destroy();
      this.vinger = null;
      const ind = this.ind;
      if (!aan || !ind || this.rustig) return;
      let van: { x: number; y: number } | null = null;
      let naar: { x: number; y: number } | null = null;
      if (this.o?.soort === "volgorde") {
        const k0 = this.deel("k0");
        const vrij = ind.sloten.findIndex((_, p) => !this.delen.some((d) => d.slot === p));
        if (k0 && vrij >= 0) {
          van = { x: k0.plek.x, y: k0.plek.y };
          naar = opPlekje(ind.sloten[vrij], k0.plek);
        }
      } else if (this.o?.soort === "verbind") {
        van = ind.stippen.l0;
        naar = ind.stippen.r1 ?? ind.stippen.r0;
      }
      if (!van || !naar) return;
      const v = this.plaats("rm-vinger", van.x, van.y).setDepth(20).setAlpha(0);
      this.vinger = v;
      this.tweens.chain({
        targets: v,
        tweens: [
          { alpha: 1, duration: 200, delay: 400 },
          { x: naar.x, y: naar.y, duration: 900, ease: "Sine.easeInOut" },
          { alpha: 0, duration: 250 },
          { x: van.x, y: van.y, duration: 1 },
          { alpha: 1, duration: 200, delay: 300 },
          { x: naar.x, y: naar.y, duration: 900, ease: "Sine.easeInOut" },
          { alpha: 0, duration: 250 },
        ],
      });
    }

    /* ---------- test ---------- */

    zetTest(t: number[] | null) {
      this.test = t;
      this.meldTest();
    }

    /** Voor de automatische test: wat er nu getikt moet worden (window.__phaser.antwoord). */
    meldTest() {
      const t = this.test;
      const ind = this.ind;
      if (!t || !ind || typeof window === "undefined" || !this.o) return;
      let antwoord: string | null = null;
      if (this.o.soort === "volgorde") {
        const vast = this.o.vast?.length ?? 0;
        const vrij = ind.sloten.map((_, p) => p).filter((p) => p >= vast);
        const k = vrij.findIndex((p, j) => this.deel(`k${t[j]}`)?.slot !== p);
        antwoord = k < 0 ? null : `kaart-${t[k]}`;
      } else if (this.o.soort === "verbind") {
        if (this.gekozen?.kant === "l") antwoord = `r-${t[this.gekozen.i]}`;
        else {
          const l = t.findIndex((r, i) => this.lijnen.get(i) !== r);
          antwoord = l < 0 ? null : `l-${l}`;
        }
      }
      window.__phaser = { ...window.__phaser, antwoord };
    }

    /* ---------- op volgorde zetten ---------- */

    legIn(d: Deel, p: number | null): void {
      const ind = this.ind;
      if (!ind) return;
      if (p !== null) {
        const oud = this.delen.find((x) => x !== d && x.slot === p);
        if (oud) {
          if (oud.naam[0] === "v") {
            this.legIn(d, null);
            return;
          }
          this.legIn(oud, null);
        }
      }
      d.slot = p;
      const doel = p === null ? d.plek : opPlekje(ind.sloten[p], d.plek);
      d.box.setDepth(p === null ? 0 : 5);
      this.tweens.add({ targets: d.box, x: doel.x, y: doel.y, duration: this.rustig ? 1 : 180, ease: "Cubic.easeOut" });
    }

    naZet() {
      speelLesgeluid("tik");
      this.meldTest();
      const ind = this.ind;
      if (!ind || this.o?.soort !== "volgorde") return;
      const vast = this.o.vast?.length ?? 0;
      const rij = ind.sloten.map((_, p) => p).filter((p) => p >= vast).map((p) => {
        const d = this.delen.find((x) => x.slot === p && x.naam[0] === "k");
        return d ? Number(d.naam.slice(1)) : -1;
      });
      if (rij.every((i) => i >= 0)) {
        this.bezig = true;
        this.time.delayedCall(this.rustig ? 1 : 260, () => this.melder({ soort: "volgorde", rij }));
      }
    }

    tik(naam: string) {
      if (!this.actief || this.bezig) return;
      if (this.o?.soort === "verbind") {
        const kant = naam[0] as "l" | "r";
        this.tikKant(kant, Number(naam.slice(2)));
        return;
      }
      const d = this.deel(naam);
      const ind = this.ind;
      if (!d || !ind || this.o?.soort !== "volgorde") return;
      this.hand(false);
      if (d.slot !== null) this.legIn(d, null);
      else {
        const vrij = ind.sloten.findIndex((_, p) => !this.delen.some((x) => x.slot === p));
        if (vrij < 0) return;
        this.legIn(d, vrij);
      }
      this.naZet();
    }

    /* ---------- verbinden ---------- */

    tekenLijnen(extra?: { x1: number; y1: number; x2: number; y2: number }) {
      const g = this.lijnGfx;
      const ind = this.ind;
      if (!g || !ind) return;
      g.clear();
      for (const [l, r] of this.lijnen) {
        const a = ind.stippen[`l${l}`];
        const b = ind.stippen[`r${r}`];
        g.lineStyle(7, this.vast.has(l) ? GOED : WARM, 1);
        g.lineBetween(a.x, a.y, b.x, b.y);
      }
      if (extra) {
        g.lineStyle(6, WARM, 0.8);
        g.lineBetween(extra.x1, extra.y1, extra.x2, extra.y2);
      }
    }

    kies(kant: "l" | "r", i: number) {
      this.keuzeRing?.destroy();
      this.keuzeRing = null;
      this.gekozen = { kant, i };
      const p = this.ind?.stippen[`${kant}${i}`];
      if (p) this.keuzeRing = this.selectieRing(p.x, p.y, 26).setDepth(4);
      this.meldTest();
    }

    koppel(l: number, r: number) {
      this.keuzeRing?.destroy();
      this.keuzeRing = null;
      this.gekozen = null;
      if (this.vast.has(l)) return this.meldTest();
      for (const [ll, rr] of [...this.lijnen]) if (rr === r && ll !== l) {
        if (this.vast.has(ll)) return this.meldTest();
        this.lijnen.delete(ll);
      }
      this.lijnen.set(l, r);
      this.tekenLijnen();
      speelLesgeluid("tik");
      this.meldTest();
      const o = this.o;
      if (o?.soort === "verbind" && this.lijnen.size === o.links.length) {
        this.bezig = true;
        const paren = o.links.map((_, i) => this.lijnen.get(i) ?? -1);
        this.time.delayedCall(this.rustig ? 1 : 300, () => this.melder({ soort: "verbind", paren }));
      }
    }

    tikKant(kant: "l" | "r", i: number) {
      if (!this.actief || this.bezig) return;
      this.hand(false);
      const g = this.gekozen;
      if (g && g.kant !== kant) {
        const l = kant === "l" ? i : g.i;
        const r = kant === "r" ? i : g.i;
        this.koppel(l, r);
        return;
      }
      if (kant === "l" && this.vast.has(i)) return;
      this.kies(kant, i);
    }

    uitslag(goed: boolean[]) {
      this.bezig = true;
      const g = this.lijnGfx;
      const ind = this.ind;
      if (!g || !ind) return;
      goed.forEach((ok, l) => ok && this.vast.add(l));
      g.clear();
      for (const [l, r] of this.lijnen) {
        const a = ind.stippen[`l${l}`];
        const b = ind.stippen[`r${r}`];
        /* Een foute lijn wordt grijs en dof, niet rood (BOUWREGELS 5.3). */
        g.lineStyle(7, goed[l] ? GOED : 0x8a94b8, goed[l] ? 1 : 0.6);
        g.lineBetween(a.x, a.y, b.x, b.y);
        if (goed[l]) this.golf((a.x + b.x) / 2, (a.y + b.y) / 2, GOED);
      }
      /* Foute lijnen verdwijnen even later. */
      this.time.delayedCall(this.rustig ? 1 : 900, () => {
        for (const l of [...this.lijnen.keys()]) if (!this.vast.has(l)) this.lijnen.delete(l);
        this.tekenLijnen();
        this.meldTest();
      });
    }

    /** Welke kant en welk nummer op deze plek (bij de tekening of bij de stip). */
    kantOp(x: number, y: number): { kant: "l" | "r"; i: number } | null {
      const ind = this.ind;
      if (!ind) return null;
      for (const [naam, p] of Object.entries(ind.stippen)) if (Math.hypot(x - p.x, y - p.y) < 46) return { kant: naam[0] as "l" | "r", i: Number(naam.slice(1)) };
      for (const [naam, p] of Object.entries(ind.delen)) if (Math.abs(x - p.x) <= Math.max(p.b, 160) / 2 && Math.abs(y - p.y) <= Math.max(p.h, 120) / 2) return { kant: naam[0] as "l" | "r", i: Number(naam.slice(1)) };
      return null;
    }

    /* ---------- vinger ---------- */

    /** Waar de vinger is, in punten van het vlak. */
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

    neer(p: Ptr) {
      if (!this.actief || this.bezig) return;
      const w = this.waar(p);
      if (this.o?.soort === "verbind") {
        const k = this.kantOp(w.x, w.y);
        if (!k) return;
        const st = this.ind!.stippen[`${k.kant}${k.i}`];
        this.trek = { ...k, x0: w.x, y0: w.y, bewogen: false, x: st.x, y: st.y };
        return;
      }
      if (this.o?.soort !== "volgorde") return;
      const d = [...this.delen].reverse().find((x) => x.naam[0] === "k" && Math.abs(w.x - x.box.x) <= x.plek.b / 2 && Math.abs(w.y - x.box.y) <= x.plek.h / 2);
      if (!d) return;
      this.sleep = { d, dx: w.x - d.box.x, dy: w.y - d.box.y, x0: w.x, y0: w.y, bewogen: false };
      d.box.setDepth(10);
    }

    beweeg(p: Ptr) {
      const w = this.waar(p);
      const t = this.trek;
      if (t) {
        if (!t.bewogen && Math.hypot(w.x - t.x0, w.y - t.y0) < 10) return;
        if (!t.bewogen) {
          t.bewogen = true;
          this.hand(false);
          if (t.kant === "l" && this.vast.has(t.i)) {
            this.trek = null;
            return;
          }
        }
        this.tekenLijnen({ x1: t.x, y1: t.y, x2: w.x, y2: w.y });
        return;
      }
      const sl = this.sleep;
      if (!sl) return;
      if (!sl.bewogen) {
        if (Math.hypot(w.x - sl.x0, w.y - sl.y0) < 8) return;
        sl.bewogen = true;
        this.hand(false);
      }
      sl.d.box.setPosition(w.x - sl.dx, w.y - sl.dy);
    }

    los(p: Ptr) {
      const t = this.trek;
      if (t) {
        this.trek = null;
        if (!t.bewogen) return this.tikKant(t.kant, t.i);
        const w = this.waar(p);
        const k = this.kantOp(w.x, w.y);
        this.tekenLijnen();
        if (k && k.kant !== t.kant) this.koppel(t.kant === "l" ? t.i : k.i, t.kant === "r" ? t.i : k.i);
        return;
      }
      const sl = this.sleep;
      const ind = this.ind;
      if (!sl || !ind) return;
      this.sleep = null;
      const d = sl.d;
      if (!sl.bewogen) return this.tik(d.naam);
      let beste = -1;
      let afstand = Infinity;
      ind.sloten.forEach((r, q) => {
        const m = opPlekje(r, d.plek);
        const dd = Math.hypot(d.box.x - m.x, d.box.y - m.y);
        if (dd < afstand) {
          afstand = dd;
          beste = q;
        }
      });
      const vrijPlek = beste >= 0 && !this.delen.some((x) => x.slot === beste && x.naam[0] === "v");
      this.legIn(d, afstand < Math.max(d.plek.b, d.plek.h) * 0.7 && vrijPlek ? beste : null);
      this.naZet();
    }

    sleepPunt() {
      if (!this.actief || this.o?.soort !== "volgorde") return null;
      const r = this.game.canvas.getBoundingClientRect();
      const f = r.width / VLAK_B;
      if (this.sleep) return { x: r.left + (this.sleep.d.box.x + this.sleep.dx) * f, y: r.top + (this.sleep.d.box.y + this.sleep.dy) * f };
      const d = this.delen.find((x) => x.slot === null && x.naam[0] === "k");
      if (!d) return null;
      return { x: r.left + d.box.x * f, y: r.top + d.box.y * f };
    }

    /** Voor `npm run vloeiend`: alles verschijnt opnieuw, schuift heen en weer en licht op (zonder nieuwe plaatjes). */
    demo(ms: number) {
      const eind = performance.now() + ms;
      let k = 0;
      const stap = () => {
        if (performance.now() > eind || !this.delen.length) return;
        const d = this.delen[k++ % this.delen.length];
        this.tover(d.box);
        this.time.delayedCall(450, () => this.tweens.add({ targets: d.box, y: d.box.y - 30, duration: 350, yoyo: true, ease: "Sine.easeInOut" }));
        this.time.delayedCall(900, () => {
          d.items.forEach((_, i) => this.flits(d, i, 400));
          this.golf(d.box.x, d.box.y, GOED);
        });
        this.time.delayedCall(1100, stap);
      };
      stap();
    }
  }
  return RM as unknown as new () => import("phaser").Scene;
}

/* ---------- het vlak ---------- */

export function SqulaRekenmix({
  opgave,
  actief = false,
  licht = null,
  labels = null,
  goed = null,
  fout = null,
  plekGoed = null,
  ronde = 0,
  hand = false,
  uitslag = null,
  test = null,
  namen,
  vooraf,
  meld,
  schaal,
}: RMProps & Vlakbasis) {
  const { plek, scene } = useHoloMotor<RMScene>(schaal, (Phaser, rustig) => maakScene(Phaser, rustig, namen ?? [], vooraf ?? []), { invoer: true });
  const sleutel = opgave ? JSON.stringify(opgave) : "";
  const o = useMemo(() => (sleutel ? (JSON.parse(sleutel) as RMOpgave) : null), [sleutel]);
  const ind = useMemo(() => (o ? rmIndeling(o) : null), [o]);

  useEffect(() => {
    scene?.verbind(meld);
  }, [scene, meld]);

  useEffect(() => {
    scene?.zetOpgave(o);
  }, [scene, o]);

  const lichtSleutel = licht ? `${licht.deel}|${licht.aan.join(",")}|${licht.dof === false ? 0 : 1}` : "";
  useEffect(() => {
    if (!scene) return;
    if (!lichtSleutel) return scene.zetLicht(null);
    const [deel, aan, dof] = lichtSleutel.split("|");
    scene.zetLicht({ deel, aan: aan ? aan.split(",").map(Number) : [], dof: dof === "1" });
  }, [scene, lichtSleutel, o]);

  useEffect(() => {
    scene?.zetActief(actief);
    if (!scene) return;
    if (actief && o?.soort === "volgorde") window.__phaser = { ...window.__phaser, sleepPunt: () => scene.sleepPunt() as { x: number; y: number } };
    else if (window.__phaser) delete window.__phaser.sleepPunt;
  }, [scene, actief, o]);

  const goedKeer = goed?.keer ?? 0;
  const goedDeel = goed?.deel ?? "";
  useEffect(() => {
    if (scene && goedKeer > 0) scene.goed(goedDeel);
  }, [scene, goedKeer, goedDeel]);

  const foutKeer = fout?.keer ?? 0;
  const foutDeel = fout?.deel ?? "";
  useEffect(() => {
    if (scene && foutKeer > 0) scene.fout(foutDeel);
  }, [scene, foutKeer, foutDeel]);

  const plekSleutel = plekGoed ? plekGoed.join(",") : "";
  useEffect(() => {
    scene?.plekGoed(plekSleutel ? plekSleutel.split(",").map((x) => x === "true") : null);
  }, [scene, plekSleutel]);

  useEffect(() => {
    if (scene && ronde > 0) scene.terugNaarHuis();
  }, [scene, ronde]);

  useEffect(() => {
    scene?.hand(hand);
  }, [scene, hand, o]);

  const uitslagKeer = uitslag?.keer ?? 0;
  const uitslagSleutel = uitslag ? uitslag.goed.join(",") : "";
  useEffect(() => {
    if (scene && uitslagKeer > 0) scene.uitslag(uitslagSleutel.split(",").map((x) => x === "true"));
  }, [scene, uitslagKeer, uitslagSleutel]);

  const testSleutel = test ? test.join(",") : "";
  useEffect(() => {
    scene?.zetTest(testSleutel ? testSleutel.split(",").map(Number) : null);
  }, [scene, testSleutel, o]);

  const delen = ind ? Object.entries(ind.delen) : [];
  const namenVan = o && o.soort !== "verbind" ? o.namen : undefined;

  return (
    <div className={s.vlak}>
      <div ref={plek} style={HOLO_CANVAS} aria-hidden />
      {o?.soort === "kijk" &&
        delen
          .filter(([naam]) => naam[0] === "k")
          .map(([naam, p], i) => (
            <button
              key={`${sleutel}-${naam}`}
              type="button"
              className={s.keuze}
              /* Ronde 9: bij vakken is het hele vak de tikplek (vak i hoort bij keuze i). */
              style={ind?.vakken?.[i] ? { left: ind.vakken[i].x - ind.vakken[i].b / 2, top: ind.vakken[i].y - ind.vakken[i].h / 2, width: ind.vakken[i].b, height: ind.vakken[i].h } : { left: p.x - Math.max(p.b, 120) / 2, top: p.y - Math.max(p.h, 120) / 2, width: Math.max(p.b, 120), height: Math.max(p.h, 120) }}
              data-ding={`keuze-${i}`}
              disabled={!actief}
              aria-label={namenVan?.[i] ?? `Keuze ${i + 1}`}
              onClick={() => {
                if (!actief) return;
                speelLesgeluid("tik");
                meld({ soort: "keuze", i });
              }}
            />
          ))}
      {o?.soort === "volgorde" &&
        delen
          .filter(([naam]) => naam[0] === "k")
          .map(([naam, p], i) => (
            <button
              key={`${sleutel}-${naam}`}
              type="button"
              className={s.ding}
              style={{ left: p.x - p.b / 2, top: p.y - p.h / 2, width: p.b, height: p.h }}
              data-ding={`kaart-${i}`}
              disabled={!actief}
              aria-label={namenVan?.[i] ?? `Kaart ${i + 1}`}
              onClick={() => scene?.tik(naam)}
            />
          ))}
      {o?.soort === "verbind" &&
        delen.map(([naam, p]) => (
          <button
            key={`${sleutel}-${naam}`}
            type="button"
            className={s.ding}
            style={{ left: p.x - p.b / 2, top: p.y - p.h / 2, width: p.b, height: p.h }}
            data-ding={`${naam[0]}-${naam.slice(1)}`}
            disabled={!actief}
            aria-label={`${naam[0] === "l" ? "Links" : "Rechts"} ${Number(naam.slice(1)) + 1}`}
            onClick={() => scene?.tik(`${naam[0]}-${naam.slice(1)}`)}
          />
        ))}
      {ind &&
        (labels ?? []).map((lb, i) => {
          /* "s0", "s1" …: bij een plekje (op volgorde); anders bij een tekening. */
          const p = lb.deel[0] === "s" ? ind.sloten[Number(lb.deel.slice(1))] : ind.delen[lb.deel];
          if (!p) return null;
          return (
            <div key={`${lb.deel}-${i}-${lb.tekst}`} className={lb.klein ? s.labelKlein : s.label} style={{ left: p.x + lb.x * p.f, top: p.y + lb.y * p.f, ...(lb.kleur ? { color: lb.kleur } : {}) }}>
              {lb.tekst}
            </div>
          );
        })}
    </div>
  );
}

/* ---------- de kaart aan het eind ---------- */

/** Op de verzamelkaart: een cirkel, een driehoek en een vierkant, met een getal (244 × 190). */
export function KaartRekenmix() {
  return (
    <>
      <rect x={4} y={168} width={236} height={6} rx={3} fill="#9fe9ff" opacity={0.6} />
      <circle cx={52} cy={118} r={34} fill="#ffd93d" stroke="#ffffff" strokeWidth={3} />
      <path d="M122 82 L160 152 L84 152 Z" fill="#ff5c6e" stroke="#ffffff" strokeWidth={3} strokeLinejoin="round" />
      <rect x={168} y={92} width={60} height={60} fill="#5f9dff" stroke="#ffffff" strokeWidth={3} />
      <text x={122} y={58} textAnchor="middle" fontSize={44} fontWeight={800} fill="#ffe27a" fontFamily="Work Sans, system-ui, sans-serif">
        1 2 3
      </text>
    </>
  );
}
