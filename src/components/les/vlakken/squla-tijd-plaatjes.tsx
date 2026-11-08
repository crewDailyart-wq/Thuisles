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
 *   `uit` (vaag: al fout gekozen), `goed` (groene rand), `fout` (dof en schudden, geen rode rand),
 *   `licht` (gele rand: Bliepo wijst het aan);
 * - `orden`: lege vakken op een rij en losse kaartjes eronder, om op volgorde
 *   te slepen (of aan te tikken: dan gaat het naar het eerste lege vak);
 *   `vast` = vakken die al gevuld zijn; `uitslag` per vak goed (groen) of niet goed (dof);
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

import { useEffect, useRef, useState } from "react";
import type { Vlakbasis, Vlakgebeurtenis } from "../soort";
import { TX, VLAK_B, VLAK_H } from "../holo/basis";
import { HOLO_CANVAS, useHoloMotor } from "../holo/motor";
import { maakRondjes } from "../holo/rondje";
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
  /** Een tekening als kleine, zachte sfeer-achtergrond linksboven (BOUWREGELS 1.22): niet tikbaar, doet niet mee. */
  sfeer?: string | null;
  /**
   * Alleen op een staand scherm (telefoon rechtop; BOUWREGELS 1.24, keuring herstel AB2): het vlak is `hs` punten hoog
   * (meer dan 720). Gewone kaartjes met plaatjes worden dan groter in rijen gezet; al het andere staat zoals eerst,
   * `dy` punten lager (in het midden). Dit zet het vlak zelf; de lessen geven het niet mee.
   */
  staand?: { hs: number; dy: number } | null;
};

export type Rect = { x: number; y: number; b: number; h: number };

/* ---------- waar staat wat (punten van het vlak, 980 × 720) ---------- */

export function rij(n: number, b: number, tussen: number, y: number, h: number): Rect[] {
  const breed = n * b + (n - 1) * tussen;
  const x0 = (VLAK_B - breed) / 2 + b / 2;
  return Array.from({ length: n }, (_, i) => ({ x: x0 + i * (b + tussen), y, b, h }));
}

const isWeek = (d: PDing) => /^(rooster|weekblad)(\||$)/.test(d.tekening ?? "");

type Indeling = { groot: (Rect & { k: number }) | null; kaarten: Rect[]; vakken: Rect[]; losse: Rect[]; links: Rect[]; rechts: Rect[] };

/** Een tekening die veel breder is dan hoog (de plaatjes aan het lijntje). */
const isBreed = (d: PDing) => {
  if (!d.tekening) return false;
  const m = tekeningMaat(d.tekening);
  return m.b / m.h > 2;
};

export function indeling(p: PlaatjesProps): Indeling {
  const st = p.staand;
  if (!st || st.hs <= 720) return indeling720(p);
  const staand = indelingStaand(p, st.hs);
  if (staand) return staand;
  /* niet de kaartjes-vraag: dezelfde indeling als op de laptop, iets lager in het hogere vlak */
  const ind = indeling720(p);
  const om = (r: Rect): Rect => ({ ...r, y: r.y + st.dy });
  return {
    groot: ind.groot && { ...ind.groot, y: ind.groot.y + st.dy },
    kaarten: ind.kaarten.map(om),
    vakken: ind.vakken.map(om),
    losse: ind.losse.map(om),
    links: ind.links.map(om),
    rechts: ind.rechts.map(om),
  };
}

/**
 * Staand scherm (keuring herstel AB2, N1): 2 tot 4 kaartjes met een plaatje (bv. maandkalender, weekkalender, klok)
 * waren naast elkaar piepklein, met de helft van het vlak leeg. Nu krijgt een brede tekening (weekkalender, plaatjes aan
 * het lijntje) een eigen rij over de hele breedte en staan de andere kaartjes met 2 naast elkaar; de rijen verdelen de
 * hoogte. De volgorde van de keuzes blijft zoals de les ze zet (de plek van het goede antwoord wisselt dus nog steeds).
 */
function indelingStaand(p: PlaatjesProps, hs: number): Indeling | null {
  const k = p.kaarten ?? [];
  if (p.groot || p.orden || p.verbind || k.length < 2 || k.length > 4 || !k.every((d) => d.tekening)) return null;
  const rijen: number[][] = [];
  let open: number[] | null = null;
  k.forEach((d, i) => {
    if (isBreed(d) || isWeek(d)) rijen.push([i]);
    else if (open && open.length < 2) open.push(i);
    else {
      open = [i];
      rijen.push(open);
    }
  });
  const boven = 20;
  const tussen = 34;
  const rijH = Math.min(460, (hs - 2 * boven - (rijen.length - 1) * tussen) / rijen.length);
  const totaal = rijen.length * rijH + (rijen.length - 1) * tussen;
  const y0 = (hs - totaal) / 2 + rijH / 2;
  const kaarten: Rect[] = [];
  rijen.forEach((rij, r) => {
    const y = y0 + r * (rijH + tussen);
    const b = rij.length === 1 ? (isBreed(k[rij[0]]) || isWeek(k[rij[0]]) ? 900 : Math.min(460, rijH)) : 440;
    rijX2(rij.length, b, 30).forEach((x, j) => (kaarten[rij[j]] = { x, y, b, h: rijH - 10 }));
  });
  return { groot: null, kaarten, vakken: [], losse: [], links: [], rechts: [] };
}

function rijX2(n: number, b: number, tussen: number): number[] {
  return rij(n, b, tussen, 0, 0).map((r) => r.x);
}

function indeling720(p: PlaatjesProps): Indeling {
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
    } else if (n === 2 && p.kaarten!.some(isWeek)) {
      /* De weekkalender is breed en heeft kleine hoepels: hij krijgt een eigen rij over bijna de hele breedte, de andere kaartjes staan eronder (2 nov 2026, keuring r6: te klein, op de telefoon onleesbaar). */
      const wi = p.kaarten!.findIndex(isWeek);
      const rest = n - 1;
      const onder = rij(rest, rest === 1 ? 380 : 290, 40, 520, 300);
      const boven: Rect = { x: VLAK_B / 2, y: 170, b: 900, h: 300 };
      let o = 0;
      kaarten = p.kaarten!.map((_, i) => (i === wi ? boven : onder[o++]));
    } else if (n === 3 && p.kaarten!.some(isBreed)) {
      /* Een brede tekening (de plaatjes aan het lijntje) krijgt meer ruimte, zodat alle keuzes even groot lijken (Sara, 7 november 2026).
         Herstel A ronde 2: ook een weekkalender staat zo gewoon in de rij, even hoog als de andere keuzes (eerst stond hij
         als groot vak bovenaan en viel het goede antwoord op). Twee brede tekeningen: samen passend in de breedte. */
      const nBreed = p.kaarten!.filter(isBreed).length;
      const wijd = Math.min(370, (950 - 2 * 34 - (n - nBreed) * 235) / nBreed);
      const breedte = p.kaarten!.map((k) => (isBreed(k) ? wijd : 235));
      const totaal = breedte.reduce((a, b) => a + b, 0) + 2 * 34;
      let x = (VLAK_B - totaal) / 2;
      kaarten = breedte.map((b) => {
        const r = { x: x + b / 2, y: 370, b, h: 300 };
        x += b + 34;
        return r;
      });
    } else {
      const [b, h] = n === 2 ? [320, 320] : n === 3 ? [280, 300] : [210, 260];
      kaarten = rij(n, b, 44, 370, h);
    }
    if (!groot && !(n === 2 && p.kaarten!.some(isWeek))) kaarten = pasHoogte(kaarten, p.kaarten!);
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
    /* de kalenders groter (BOUWREGELS 1.24, 7 november 2026), de woorden iets smaller */
    links = verbind.links.map((_, i) => ({ x: 232, y: 122 + i * 238, b: 440, h: 230 }));
    rechts = verbind.rechts.map((_, i) => ({ x: 760, y: 122 + i * 238, b: 250, h: 104 }));
  }
  return { groot, kaarten, vakken, losse, links, rechts };
}

/**
 * Ronde 9 (7 november, Sara): de vakken waren veel hoger dan de tekening erin (een platte kalender of de plaatjes aan
 * het lijntje in een vak van 300 hoog, met veel lege ruimte erboven en eronder). Nu zijn de vakken samen niet hoger dan
 * de hoogste tekening nodig heeft; de tekeningen zelf blijven even groot (ze worden door de breedte begrensd).
 */
function pasHoogte(kaarten: Rect[], dingen: PDing[]): Rect[] {
  if (!dingen.every((d) => d.tekening)) return kaarten;
  const nodig = kaarten.map((r, i) => {
    const d = dingen[i];
    const m = tekeningMaat(d.tekening!);
    const woordH = d.label ? 46 : 0;
    const k = Math.min((r.b - 34) / m.b, (r.h - 30 - woordH) / m.h);
    return m.h * k + 30 + woordH;
  });
  const h = Math.min(Math.max(...kaarten.map((r) => r.h)), Math.max(190, Math.ceil(Math.max(...nodig) + 24)));
  return kaarten.map((r) => ({ ...r, h: Math.min(r.h, h) }));
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

type Ding = { box: Box; ring: Img; r: Rect; d: PDing; kleur: keyof typeof RING | null; rondjes?: ReturnType<typeof maakRondjes>; zeg: string; soort: "kaart" | "los" | "vast" | "links" | "rechts"; id: string };

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
      this.canvasPlaatje(sl, b, h, (c) => this.tekenKaart(c, d, b, h));
      return sl;
    }

    tekenKaart(c: CanvasRenderingContext2D, d: PDing, b: number, h: number) {
      {
        /* Een kaartje met alleen een woord is een knop; een plaatje staat los, zonder kader (31 oktober 2026). */
        if (!d.tekening) tekenVormen(c, [{ d: blok(3, 3, b - 6, h - 6, 18), vul: PALET.warmwit, rand: PALET.navy, dik: 4 }]);
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
          c.fillStyle = d.tekening ? PALET.warmwit : PALET.navy;
          c.fillText(d.label, b / 2, d.tekening ? h - 32 : h / 2 + 2, b - 20);
        }
      }
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

    /**
     * Een zachte gloed in de VORM van het plaatje zelf (geen rechthoek, BOUWREGELS 1.4): het plaatje wordt één keer
     * getekend, alleen de schaduw ervan blijft over (in `kleur`), en dat wordt als plaatje bewaard.
     */
    ringPlaatje(kleur: keyof typeof RING, d: PDing, b: number, h: number) {
      const sl = `pr|${kleur}|${d.tekening ?? ""}|${d.label ?? ""}|${Math.round(b)}x${Math.round(h)}`;
      const P = 26;
      this.canvasPlaatje(sl, b + 2 * P, h + 2 * P, (c) => {
        const losPx = document.createElement("canvas");
        losPx.width = Math.ceil(b * TX);
        losPx.height = Math.ceil(h * TX);
        const lc = losPx.getContext("2d")!;
        lc.scale(TX, TX);
        this.tekenKaart(lc, d, b, h);
        const ver = 3000;
        c.shadowColor = RING[kleur];
        c.shadowBlur = 16 * TX;
        c.shadowOffsetX = ver;
        for (let i = 0; i < 3; i++) c.drawImage(losPx, P - ver / TX, P, b, h);
      });
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

    /** Het eigen vak van een keuze: zacht, half doorzichtig, ronde hoeken, zoals bij de geldles (Sara, 7 november 2026). */
    keuzeVak(b: number, h: number) {
      const sl = `pkv|${Math.round(b)}x${Math.round(h)}`;
      this.canvasPlaatje(sl, b, h, (c) => {
        c.fillStyle = "rgba(207,227,255,0.13)";
        c.beginPath();
        c.roundRect(0, 0, b, h, 34);
        c.fill();
      });
      return sl;
    }

    nieuwDing(d: PDing, r: Rect, soort: Ding["soort"], sleutel: string) {
      const box = this.add.container(r.x, r.y);
      const ring = this.plaats("pg-golf", 0, 0).setVisible(false);
      if (soort === "kaart" && d.tekening) box.add(this.plaats(this.keuzeVak(r.b + 16, r.h + 10), 0, 0));
      box.add([ring, this.plaats(this.kaartPlaatje(d, r.b, r.h), 0, 0)]);
      this.alles.push(box);
      const ding: Ding = { box, ring, r, d, kleur: null, zeg: d.zeg ?? d.label ?? d.id, soort, id: d.id };
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
      if (p.sfeer) {
        /* klein en zacht linksboven, zacht deinend (één keer getekend) */
        const m = tekeningMaat(p.sfeer);
        const k = 130 / Math.max(m.b, m.h);
        const sy = 105 + (p.staand && !indelingStaand(p, p.staand.hs) ? p.staand.dy : 0);
        const sf = this.plaats(this.grootPlaatje(p.sfeer, k), 110, sy).setAlpha(0.5).setDepth(-1);
        this.alles.push(sf);
        if (!rustig) this.tweens.add({ targets: sf, y: sy - 6, duration: 2600, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
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
        p.sfeer ?? null,
        (p.kaarten ?? []).map((k) => [k.id, k.tekening, k.label]),
        p.orden ? [p.orden.vakken.length, p.orden.vast ?? [], (p.orden.vast ?? []).map((i) => p.orden!.vakken[i]), p.orden.losse.map((k) => [k.id, k.tekening, k.label])] : null,
        p.verbind ? [p.verbind.links.map((k) => k.id), p.verbind.rechts.map((k) => k.id)] : null,
        p.staand ?? null,
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
      const kleur = (id: string): keyof typeof RING | null => (p.goed?.includes(id) ? "groen" : null);
      /* Wat Bliepo aanwijst (`licht`) krijgt een rood rondje in plaats van een gloed; goed houdt zijn groene gloed. */
      const rondje = (d: Ding, aan: boolean) => {
        if (!aan && !d.rondjes) return;
        d.rondjes ??= maakRondjes(this, d.box, rustig);
        d.rondjes.zet(aan ? new Map([["ding", { x: 0, y: 0, b: d.r.b, h: d.r.h }]]) : new Map());
      };
      const wijst = (id: string) => !!p.licht?.includes(id) && !p.goed?.includes(id);
      /* Een gloed in de vorm van het plaatje; bij goed een korte gloed die weer weggaat (geen blijvend kader, BOUWREGELS 1.4). */
      const zetRing = (d: Ding, k: keyof typeof RING | null) => {
        if (d.kleur === k) return;
        d.kleur = k;
        this.tweens.killTweensOf(d.ring);
        if (!k) return void d.ring.setVisible(false);
        d.ring.setTexture(this.ringPlaatje(k, d.d, d.r.b, d.r.h)).setVisible(true).setAlpha(1);
        if (k === "groen") this.tweens.add({ targets: d.ring, alpha: 0, delay: 900, duration: 600, onComplete: () => d.ring.setVisible(false) });
      };
      for (const d of this.dingen.values()) {
        if (d.soort === "kaart") {
          zetRing(d, kleur(d.id));
          rondje(d, wijst(d.id));
          /* Bij een fout geen rode rand (BOUWREGELS 5.3): het kaartje wordt dof en schudt. */
          d.box.setAlpha(p.uit?.includes(d.id) || p.fout?.includes(d.id) ? 0.35 : 1);
        }
        if (d.soort === "los" && p.orden) {
          const vak = p.orden.vakken.indexOf(d.id);
          const doel = vak >= 0 ? ind.vakken[vak] : d.r;
          if (this.druk?.d !== d && (d.box.x !== doel.x || d.box.y !== doel.y)) {
            this.tweens.add({ targets: d.box, x: doel.x, y: doel.y, duration: rustig ? 1 : 220, ease: "Cubic.easeOut" });
          }
          const u = vak >= 0 ? p.orden.uitslag?.[vak] : null;
          /* Niet goed gelegd: geen rode rand, het kaartje wordt dof (BOUWREGELS 5.3). */
          zetRing(d, u === true ? "groen" : u === false ? null : kleur(d.id));
          rondje(d, u !== true && wijst(d.id));
          d.box.setAlpha(u === false ? 0.35 : 1);
          d.box.setDepth(vak >= 0 ? 1 : 2);
        }
        if (d.soort === "vast") zetRing(d, null);
        if (d.soort === "links" && p.verbind) zetRing(d, p.verbind.vast.includes(d.id) ? null : p.verbind.gekozen === d.id ? "geel" : kleur(d.id));
        if (d.soort === "links" && p.verbind) rondje(d, !p.verbind.vast.includes(d.id) && wijst(d.id));
        if (d.soort === "rechts" && p.verbind) {
          const vast = p.verbind.lijnen.some(([l, r]) => r === d.id && p.verbind!.vast.includes(l));
          zetRing(d, vast ? null : kleur(d.id));
          rondje(d, !vast && wijst(d.id));
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
      /* de schaal is in beide richtingen gelijk; zo klopt het ook in een hoger vlak (staand scherm) */
      return { x: ((cx - r.left) * VLAK_B) / r.width, y: ((cy - r.top) * VLAK_B) / r.width };
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
        } else this.golf(VLAK_B / 2, (this.p?.staand?.hs ?? VLAK_H) / 2);
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
  /* Op een staand scherm mag het vlak hoger worden (BOUWREGELS 1.24, zoals het klokvlak): het canvas is dan meteen zo hoog als kan. */
  const [staandMax] = useState(() => (typeof window !== "undefined" && window.innerHeight > window.innerWidth ? Math.ceil(Math.min(2 * 720, window.innerHeight / (schaal || 1))) : 0));
  const { plek, scene } = useHoloMotor<PlaatjesScene>(schaal, maakScene, staandMax > 720 ? { invoer: true, hoogte: staandMax } : { invoer: true });
  const hs = staandMax > 720 && props.staandHoogte && props.staandHoogte > 720 ? Math.min(props.staandHoogte, staandMax) : 720;
  /* het oude vlak van 720 stond midden tussen naambalk en ballon; in het hogere vlak staat het op (bijna) dezelfde plek */
  const staand = hs > 720 ? { hs, dy: Math.max(0, Math.round((hs - 720) / 2 - 20 / (schaal || 1))) } : null;
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

  const { nr, groot, kaarten, kaartenActief, uit, goed, fout, licht, orden, verbind, sfeer } = props;
  const stand = JSON.stringify({ nr, groot, kaarten, kaartenActief, uit, goed, fout, licht, orden, verbind, sfeer, staand });
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
  const ind = indeling({ ...props, staand });
  const knoppen: { id: string; zeg: string; r: Rect; doe: () => void }[] = [];
  if (kaartenActief) (kaarten ?? []).forEach((d, i) => !uit?.includes(d.id) && knoppen.push({ id: d.id, zeg: d.zeg ?? d.label ?? d.id, r: ind.kaarten[i], doe: () => meld({ soort: "kaart", id: d.id }) }));
  if (orden?.actief) orden.losse.forEach((d, i) => !orden.vakken.includes(d.id) && knoppen.push({ id: d.id, zeg: d.zeg ?? d.label ?? d.id, r: ind.losse[i], doe: () => meld({ soort: "leg", id: d.id, vak: null }) }));
  if (verbind?.actief) {
    verbind.links.forEach((d, i) => !verbind.vast.includes(d.id) && knoppen.push({ id: d.id, zeg: d.zeg ?? d.label ?? d.id, r: ind.links[i], doe: () => meld({ soort: "links", id: d.id }) }));
    verbind.rechts.forEach((d, i) => knoppen.push({ id: d.id, zeg: d.zeg ?? d.label ?? d.id, r: ind.rechts[i], doe: () => meld({ soort: "rechts", id: d.id }) }));
  }

  return (
    <div className={s.vlak} data-squla-tijd="" style={hs > 720 ? { bottom: "auto", height: hs } : undefined}>
      <div ref={plek} style={staandMax > 720 ? { ...HOLO_CANVAS, touchAction: "none", overflow: "hidden" } : { ...HOLO_CANVAS, touchAction: "none" }} aria-hidden />
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

/* Op een staand scherm mag dit vlak hoger worden dan 720 punten (Lesscherm geeft dan `staandHoogte`; BOUWREGELS 1.24). */
SqulaTijdPlaatjes.staandGroei = true;

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
