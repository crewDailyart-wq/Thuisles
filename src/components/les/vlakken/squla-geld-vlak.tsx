"use client";

/**
 * Het speelvlak van de lessen Geld naar Squla (31 oktober 2026), in Phaser
 * (HARDE REGEL 7), in de stijl van Synthesis (besluit Sara 31 okt): donkere
 * ruimte (de les staat op `nacht`), alles staat LOS in de ruimte, zonder
 * kaders, kaartjes of vakken eromheen. Gloed alleen op het moment dat het iets
 * betekent: Bliepo telt mee of wijst aan (warm), goed (groen), fout (rood).
 * De gloed wordt één keer gebakken (holo/basis.ts `bak`), nooit elk beeld.
 *
 * Munten: de bestaande afbeeldingen, of de getekende munten in het concept.
 * Briefjes: de door de gebruiker gekozen illustraties uit public/geld/getekend/.
 * De vervanging raakt uitsluitend de afbeeldingen, niet de opgaven of waarden.
 *
 * Andere dingen (spaarpot, speelgoed, klusjes) zijn vaste voorwerpen
 * (src/lib/voorwerpen, public/voorwerpen/<naam>.png; zie WISSELEN.md). Het
 * lesscherm laadt ze vooraf via `voorwerpen` in het draaiboek; dit vlak tekent
 * ze met tekenVoorwerp. Nooit een eigen getekende versie van een ding.
 *
 * Wat het draaiboek zet:
 * - `groot`: bovenaan een tafereel uit delen naast elkaar: een ding (met of
 *   zonder prijsbordje), geld (met of zonder kruis erdoor), een pijl, een plus;
 * - `kaarten`: dingen om aan te tikken: een groepje geld, of een ding (`aantal`
 *   keer); `zweven` = ze dobberen zacht door de ruimte;
 *   `uit` (vaag), `goed` (groene gloed), `fout` (rode gloed), `licht` (warme gloed);
 * - `verbind`: links twee groepjes geld, rechts twee bedragen of groepjes, elk
 *   met een bolletje; het kind trekt een lijn (of tikt het ene en dan het andere);
 * - `geteld`: Bliepo telt het geld: wat hij telt licht op, en erboven staat
 *   het bedrag tot nu toe.
 *
 * Meldingen: `kaart` {id}, `links` {id}, `rechts` {id}, `lijn` {links, rechts}.
 *
 * Voor het toetsenbord en de automatische test ligt over elk tikbaar ding een
 * onzichtbare knop (`data-ding`), die precies hetzelfde meldt. Geld wordt NIET
 * voorgelezen (dat zou het antwoord verklappen); dingen wel, als ze een `zeg` hebben.
 */

import { useContext, useEffect, useRef, useState } from "react";
import { GetekendeMuntenContext, MUNTENBLAD, MUNTUITSNEDE } from "./geld-muntstijl";
import type { Vlakbasis, Vlakgebeurtenis } from "../soort";
import { GOED, holoBasis, TX, VLAK_B, VLAK_H, WARM } from "../holo/basis";
import { HOLO_CANVAS, useHoloMotor } from "../holo/motor";
import { PALET, RAND_DUN, blok, cirkel, tekenVormen } from "./bliepo-voorwerpen";
import { tekenVoorwerp, voorwerpUrl } from "../voorwerpen";
import { WAARDE, isBriefje, type GeldSoort } from "./squla-geld-soorten";
import { haalKeuzesAlvast, zegKeuze } from "@/lib/stem";
import s from "./squla-geld.module.css";

/* ---------- het geld en de plaatjes ---------- */

const BESTAND: Record<GeldSoort, string> = {
  c50: "/geld/los/munt-50-cent.png",
  m1: "/geld/los/munt-1-euro.png",
  m2: "/geld/los/munt-2-euro.png",
  b5: "/geld/getekend/briefje-5-euro.svg",
  b10: "/geld/getekend/briefje-10-euro.svg",
  b20: "/geld/getekend/briefje-20-euro.svg",
  b50: "/geld/getekend/briefje-50-euro.svg",
  b100: "/geld/getekend/briefje-100-euro.svg",
};

/**
 * Opt-in `herstelBriefje` (gouden lessen, besluit Sara 12 november 2026): het briefje van 10 euro zonder de losse '8'
 * (een KOPIE; het origineel hierboven blijft ongewijzigd en de oude lessen gebruiken dat). Een eigen sleutel in de
 * cache en in de texturen, zodat oude en gouden lessen elkaar nooit de afbeelding afpakken.
 */
const B10_HERSTELD = "/geld/getekend/briefje-10-euro-hersteld.svg";
export const beeldSleutel = (g: GeldSoort, herstel?: boolean) => (herstel && g === "b10" ? "b10h" : g);

/** Geladen afbeeldingen: geld op zijn soort, proefplaatjes als "p:<sleutel>" (null = er is (nog) geen PNG). */
const BEELD = new Map<string, HTMLImageElement | null>();
const LADEN = new Map<string, Promise<void>>();

function laad(sleutel: string, pad: string): Promise<void> {
  let p = LADEN.get(sleutel);
  if (!p) {
    p = new Promise<void>((klaar) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        BEELD.set(sleutel, img);
        klaar();
      };
      img.onerror = () => {
        BEELD.set(sleutel, null);
        klaar();
      };
      img.src = pad;
    });
    LADEN.set(sleutel, p);
  }
  return p;
}

/** De officiële afbeeldingen laden (elk één keer). */
export function laadGeld(soorten: GeldSoort[], getekendeMunten = false, herstelBriefje = false): Promise<void> {
  return Promise.all([
    ...[...new Set(soorten)].map((g) => laad(beeldSleutel(g, herstelBriefje), herstelBriefje && g === "b10" ? B10_HERSTELD : BESTAND[g])),
    ...(getekendeMunten ? [laad("munten-concept", MUNTENBLAD)] : []),
  ]).then(() => undefined);
}

/** De maat waarin een voorwerp getekend wordt (de plaatjes zijn vierkant). */
const DING = { b: 170, h: 170 };

/* ---------- wat het draaiboek zet ---------- */

export type GKaart = { id: string; geld?: GeldSoort[]; tekening?: string; aantal?: number; label?: string; zeg?: string };

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
  /** Houd de introductieillustratie vast totdat een voorbeeld of opgave wordt getoond. */
  introductie?: boolean;
  /** Uitsluitend presentatie; alleen aangezet in het muntconcept. */
  getekendeMunten?: boolean;
  /** Opt-in (gouden lessen): het briefje van 10 euro zonder de losse '8' (kopie van het plaatje, zie boven). */
  herstelBriefje?: boolean;
  /** Opt-in (gouden lessen): bij 1 geld groot in beeld ("Wat is dit?") geen zacht vak met dunne rand eromheen. */
  zonderPaneelVak?: boolean;
  /** Een nieuw tafereel (nieuwe vraag): alles verschijnt opnieuw. */
  nr: number;
  groot?: GDeel[] | null;
  kaarten?: GKaart[];
  kaartenActief?: boolean;
  /** De dingen zweven los door de ruimte en dobberen zacht (de munten om aan te tikken). */
  zweven?: boolean;
  uit?: string[];
  goed?: string[];
  fout?: string[];
  licht?: string[];
  /** Wat het kind net aantikte: een zachte gloed (geen rondje; Sara 8 november 2026, besluit 1). */
  gekozen?: string[];
  /** Wat in `licht` staat (en wat Bliepo telt) krijgt een rood, getekend rondje in plaats van een gloed. */
  rondje?: boolean;
  verbind?: GVerbind | null;
  /** `vanaf`: Bliepo telt verder vanaf dit bedrag (het geld van iemand anders erbij). */
  geteld?: { id: string; tot: number; vanaf?: number } | null;
  schud?: { id: string; n: number } | null;
  golf?: { id: string; n: number } | null;
  /** Een handje doet één keer voor hoe je een lijn trekt. */
  handje?: number;
  /** Geld dat de les straks nodig heeft: alvast laden. */
  vooraf?: GeldSoort[];
  /**
   * Opt-in (2 november 2026, proef geldmachine-1): de keuzes liggen naast elkaar, even groot, op een
   * half doorzichtig zacht vlak (zonder rand), onder de vraag die bovenaan in het midden staat.
   * Zonder: alles zoals het was.
   */
  paneel?: boolean;
  /** Bij `paneel`: waar het midden van het scherm in het vlak ligt (laptop 640, staand scherm 490); het vlak zelf is 980 breed. */
  midden?: number;
  /**
   * Opt-in (Sara, 7 november 2026): elk groepje geld in een eigen zacht vak (zoals bij `paneel`), 4 groepjes netjes 2 × 2
   * in het midden. Zo zie je waar het ene groepje ophoudt en het volgende begint. Zonder: alles zoals het was.
   */
  vakken?: boolean;
  /** Een voorwerp als kleine, zachte sfeer-achtergrond linksboven (BOUWREGELS 1.22): niet tikbaar, doet niet mee. */
  sfeer?: string | null;
  /** Het verhaal naspelen (BOUWREGELS 1.22): het groepje `id` vliegt in het ding `naar` (bv. het geld in de spaarpot). */
  vlieg?: { id: string; naar: string; n: number } | null;
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
  /* Een briefje nooit breder dan 170 punten: op elk scherm veel kleiner dan een echt briefje. */
  if (items.some(isBriefje)) maxS = Math.min(maxS, 170 / NOOT_B);
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
    /* Ronde 9 (7 november): een rij die niet vol is (bv. het derde briefje), staat in het midden in plaats van links. */
    const inRij = Math.min(b.pn, noten.length - (j - kol));
    const rijB = Math.min(b.pn, noten.length) * (NOOT_B + TUSSEN) - TUSSEN;
    const opschuif = ((b.W - rijB) * b.sc) / 2 + ((Math.min(b.pn, noten.length) - inRij) * (NOOT_B + TUSSEN) * b.sc) / 2;
    plekken[n.i] = { g: n.g, x: x0 + opschuif + (kol * (NOOT_B + TUSSEN) + NOOT_B / 2) * b.sc, y: y + (NOOT_H / 2) * b.sc, b: NOOT_B * b.sc, h: NOOT_H * b.sc };
  });
  if (noten.length) y += (NOOT_H + TUSSEN) * b.sc;
  munten.forEach((m, j) => {
    const kol = j % b.pm;
    if (j > 0 && kol === 0) y += (MUNT_D + TUSSEN) * b.sc;
    const d = MUNT_D * b.sc * muntMaat(m.g);
    const inRij = Math.min(b.pm, munten.length - (j - kol));
    const rijB = Math.min(b.pm, munten.length) * (MUNT_D + TUSSEN) - TUSSEN;
    const opschuif = ((b.W - rijB) * b.sc) / 2 + ((Math.min(b.pm, munten.length) - inRij) * (MUNT_D + TUSSEN) * b.sc) / 2;
    plekken[m.i] = { g: m.g, x: x0 + opschuif + (kol * (MUNT_D + TUSSEN) + MUNT_D / 2) * b.sc, y: y + (MUNT_D / 2) * b.sc, b: d, h: d };
  });
  return { plekken, b: b.W * b.sc, h: b.H * b.sc };
}

/* ---------- waar staat wat (punten van het vlak, 980 × 720) ---------- */

export function rij(n: number, b: number, tussen: number, y: number, h: number, midden = VLAK_B / 2): Rect[] {
  const breed = n * b + (n - 1) * tussen;
  const x0 = midden - breed / 2 + b / 2;
  return Array.from({ length: n }, (_, i) => ({ x: x0 + i * (b + tussen), y, b, h }));
}

/** Hoeveel groter geld in het tafereel bovenaan staat dan zijn basismaat. */
const GROOT_GELD = 1.3;
const PRIJS_B = 124;
const PRIJS_H = 58;

type GrootPlek = { deel: GDeel; r: Rect; k: number; id: string };
type Indeling = { groot: GrootPlek[]; kaarten: Rect[]; links: Rect[]; rechts: Rect[] };

function deelMaat(d: GDeel): { b: number; h: number } {
  if (d.soort === "tekening") {
    const { b, h } = DING;
    return d.prijs != null ? { b: b + PRIJS_B * 0.8 + 10, h: Math.max(h, PRIJS_H) } : { b, h };
  }
  if (d.soort === "geld") {
    /* Geld in het tafereel iets groter dan in een kaartje: het is het onderwerp van de vraag. */
    const l = legGeld(d.geld, 99999, 99999, GROOT_GELD);
    return { b: l.b, h: l.h };
  }
  return d.soort === "pijl" ? { b: 84, h: 60 } : { b: 56, h: 56 };
}

/** Het zachte vlak onder de keuzes (opt-in `paneel`): midden en maat. */
const PANEEL_Y = 318;
const PANEEL_CEL_H = 210;

export function indeling(p: GeldProps): Indeling {
  const n = p.kaarten?.length ?? 0;
  const metGroot = !!p.groot?.length && !p.verbind;
  let kaarten: Rect[] = [];
  let onder = 700;
  let boven = 14;
  if (n > 4 && p.paneel && !p.verbind) {
    /* Meer dan 4 keuzes (de zwevende munten): 2 rijen van 3 vierkante vakken, zodat de munten groot genoeg zijn om
       1 en 2 euro uit elkaar te houden (BOUWREGELS 1.24, 7 november 2026). Eerst stonden ze in 6 smalle, hoge vakken. */
    const tussen = 18;
    const m = p.midden ?? VLAK_B / 2;
    const per = Math.ceil(n / 2);
    const b = Math.min(200, (2 * Math.min(m, VLAK_B - m) - 30 - tussen * (per - 1)) / per);
    kaarten = [...rij(per, b, tussen, 300, b, m), ...rij(n - per, b, tussen, 300 + b + tussen, b, m)];
  } else if (n && p.paneel && !p.verbind) {
    /* Alle keuzes even groot, netjes op één rij, dicht bij elkaar, in het midden van het vlak. */
    const tussen = 16;
    const m = p.midden ?? VLAK_B / 2;
    const b = Math.min(240, (2 * Math.min(m, VLAK_B - m) - 30 - tussen * (n - 1)) / n);
    kaarten = rij(n, b, tussen, PANEEL_Y, PANEEL_CEL_H, m);
  } else if (n && p.zweven) {
    const xs = [190, 490, 790];
    const dx = [-14, 18, -6, 10, -18, 14];
    const dy = [-8, 26, -18, 18, -10, 24];
    kaarten = Array.from({ length: n }, (_, i) => ({ x: xs[i % 3] + dx[i], y: (i < 3 ? 200 : 490) + dy[i], b: 214, h: 214 }));
  } else if (n && metGroot) {
    if (n <= 3) {
      /* met vakken iets smaller, zodat het linkervak niet tegen de rand staat */
      kaarten = p.vakken ? rij(n, 250, 34, 574, 236) : rij(n, 270, 40, 574, 236);
      onder = 438;
    } else {
      /* Ronde 9: met vakken iets groter (4 groepjes geld zaten krap tegen de rand van hun vak). */
      kaarten = p.vakken ? rij(n, 214, 16, 588, 226) : rij(n, 214, 22, 590, 220);
      onder = 462;
    }
  } else if (n) {
    if (n === 4 && p.vakken) kaarten = [0, 1, 2, 3].map((i) => ({ x: i % 2 === 0 ? 300 : 680, y: i < 2 ? 210 : 500, b: 360, h: 270 }));
    else if (n === 4) kaarten = [0, 1, 2, 3].map((i) => ({ x: i % 2 === 0 ? 270 : 710, y: i < 2 ? 200 : 510, b: 400, h: 280 }));
    else if (n === 2) kaarten = rij(2, 360, 60, 370, 340);
    else kaarten = rij(n, 290, 34, 370, 340);
  }
  const groot: GrootPlek[] = [];
  if (metGroot && p.groot) {
    if (p.paneel) {
      boven = p.midden === VLAK_B / 2 ? 210 : 192;
      onder = p.midden === VLAK_B / 2 ? 560 : 472;
    }
    const maten = p.groot.map(deelMaat);
    const tussen = 30;
    const somB = maten.reduce((a, m) => a + m.b, 0) + tussen * (maten.length - 1);
    const maxH = Math.max(...maten.map((m) => m.h));
    const top = boven;
    const kMax = p.groot.some((d) => d.soort === "geld") ? 1.3 : 1.7;
    const k = Math.min(kMax, 920 / somB, (onder - top) / maxH);
    let x = (p.paneel ? (p.midden ?? VLAK_B / 2) : VLAK_B / 2) - (somB * k) / 2;
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
    /* het geld groter (BOUWREGELS 1.24): de vakken breder, zodat munten van 1 en 2 euro goed te zien zijn */
    links = p.verbind.links.map((_, i) => ({ x: 222, y: i === 0 ? 200 : 520, b: 420, h: 290 }));
    rechts = p.verbind.rechts.map((k, i) => (k.geld ? { x: 758, y: i === 0 ? 200 : 520, b: 420, h: 290 } : { x: 790, y: i === 0 ? 200 : 520, b: 260, h: 160 }));
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
  vliegNaar(id: string, naar: string): void;
}

type Gloed = "warm" | "goed" | "fout";
/* Fout = geen rood op de keuze van het kind (Sara, 8 november 2026, besluit 2): dezelfde zachte warme gloed als "gekozen". Alleen Bliepo's scherm kleurt rood. */
const GLOEDKLEUR: Record<Gloed, number> = { warm: WARM, goed: GOED, fout: WARM };
const LIJNKLEUR: Record<Gloed | "leeg", number> = { warm: 0xffd36e, goed: 0x8ff0c0, fout: 0xffd36e, leeg: 0xbfe6ff };

/** Eén plaatje in een ding (een munt, een briefje, een speelgoedje), met zijn gloed (alleen als hij aan is). */
type Stuk = { im: Img; tex: string; gloed: Img | null; kleur: Gloed | null };
type Soort = "kaart" | "links" | "rechts" | "groot";
/** Het eigen vak van een keuze (opt-in `paneel`): zacht, half doorzichtig, met ronde hoeken; bij goed/fout licht het hele vak op. */
type Vak = { im: Img; gloed: Img | null; kleur: Gloed | null; sl: string };
type Ding = { box: Box; r: Rect; zeg: string | null; soort: Soort; id: string; plekken: Plek[]; stukken: Stuk[]; geldStukken: Stuk[]; vak?: Vak };

let LETTER = "system-ui, sans-serif";

function maakScene(Phaser: typeof import("phaser"), rustig: boolean) {
  const Basis = holoBasis(Phaser, rustig);
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
    telStuk: Stuk | null = null;
    /** De rondjes die nu staan (per ding of voor wat Bliepo telt), met het ding waar ze in zitten. */
    rondjes = new Map<string, { im: Img; box: Box }>();
    rondjeLaadt = false;
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

    /** Een munt of briefje, één keer klaargezet (verkleind, nooit vergroot), zonder rand of kader. */
    geldPlaatje(g: GeldSoort) {
      /* In het paneel staan munten groter (tot 160 punten): daarvoor een scherper plaatje (de bron is 530 px). */
      const groter = !!this.p?.paneel;
      const uitsnede = this.p?.getekendeMunten && !isBriefje(g)
        ? MUNTUITSNEDE[g as "m1" | "m2" | "c50"] : undefined;
      const bs = beeldSleutel(g, this.p?.herstelBriefje);
      const sl = `${groter ? `geld|${bs}|L` : `geld|${bs}`}${uitsnede ? "|getekend-v2" : ""}`;
      if (this.textures.exists(sl)) return sl;
      const img = BEELD.get(uitsnede ? "munten-concept" : bs) ?? null;
      const brief = isBriefje(g);
      const verh = uitsnede ? 1 : img ? img.naturalWidth / img.naturalHeight : brief ? 1.9 : 1;
      const b = brief ? (groter ? 780 : 260) : groter ? 320 : 140;
      const h = Math.round(b / verh);
      this.canvasPlaatje(sl, b, h, (c) => {
        if (img && uitsnede) {
          c.save();
          c.beginPath();
          c.roundRect(0, 0, b, h, Math.min(b, h) * 0.35);
          c.clip();
          c.drawImage(img, uitsnede.x, uitsnede.y, uitsnede.b, uitsnede.h, 0, 0, b, h);
          c.restore();
        }
        else if (img) c.drawImage(img, 0, 0, b, h);
      });
      return sl;
    }

    /** Een voorwerp (vast plaatje uit public/voorwerpen), één keer op dubbele scherpte in een textuur. */
    dingPlaatje(naam: string) {
      const sl = `ding|${naam}`;
      if (this.textures.exists(sl)) return sl;
      this.canvasPlaatje(sl, DING.b, DING.h, (c) => tekenVoorwerp(c, naam, 0, 0, DING.b, DING.h));
      return sl;
    }

    tekstPlaatje(tekst: string) {
      const sl = `gtk|${tekst}`;
      this.canvasPlaatje(sl, 220, 110, (c) => {
        c.font = `800 72px ${LETTER}`;
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillStyle = "#ffffff";
        c.fillText(tekst, 110, 58, 210);
      });
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
        c.fillText(`€ ${prijs}`, (30 + PRIJS_B - 4) / 2, PRIJS_H / 2 + 2, PRIJS_B - 38);
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
          { d: "M 14 14 L 86 86 M 86 14 L 14 86", rand: "#e8453c", dik: 9 },
        ]),
      );
      return sl;
    }

    /* ---------- het vak van een keuze ---------- */

    /** Een afgerond vak (één keer getekend): zacht en half doorzichtig; met kleur als goed of fout. */
    vakPlaatje(b: number, h: number, kleur: Gloed | null) {
      const sl = `vak|${Math.round(b)}|${Math.round(h)}|${kleur ?? "leeg"}`;
      const vul = kleur === "goed" ? "rgba(143,240,192,0.34)" : kleur === "fout" ? "rgba(255,211,110,0.30)" : kleur === "warm" ? "rgba(255,211,110,0.30)" : "rgba(207,227,255,0.15)";
      this.canvasPlaatje(sl, b, h, (c) => {
        c.fillStyle = vul;
        c.beginPath();
        c.roundRect(0, 0, b, h, 38);
        c.fill();
      });
      return sl;
    }

    /** Het hele vak licht op (een gloed in de vorm van het vak, één keer gebakken) of is weer gewoon. */
    zetVak(d: Ding, kleur: Gloed | null) {
      const v = d.vak;
      if (!v || v.kleur === kleur) return;
      v.kleur = kleur;
      if (!kleur) {
        v.gloed?.setVisible(false);
        v.im.setVisible(true);
        return;
      }
      const bron = this.vakPlaatje(d.r.b, d.r.h, kleur);
      const doel = `${bron}|g`;
      this.bak(bron, doel, GLOEDKLEUR[kleur]);
      if (!v.gloed) {
        v.gloed = this.add.image(v.im.x, v.im.y, doel);
        d.box.addAt(v.gloed, 0);
      } else v.gloed.setTexture(doel);
      v.gloed.setScale(v.im.scaleX, v.im.scaleY).setVisible(true);
      v.im.setVisible(false);
    }

    /* ---------- gloed op het moment ---------- */

    /** Zet de gloed van een stuk aan (in een kleur) of uit. De gloed is één keer gebakken. */
    zetGloed(st: Stuk, kleur: Gloed | null) {
      if (st.kleur === kleur) return;
      st.kleur = kleur;
      if (!kleur) return void st.gloed?.setVisible(false);
      const doel = `${st.tex}|g|${kleur}`;
      this.bak(st.tex, doel, GLOEDKLEUR[kleur]);
      if (!st.gloed) {
        st.gloed = this.add.image(st.im.x, st.im.y, doel);
        const box = st.im.parentContainer;
        if (box) box.addAt(st.gloed, box.getIndex(st.im));
      } else st.gloed.setTexture(doel);
      /* Zelfde schaal als het plaatje: de gebakken gloed is groter (de rand eromheen), het midden valt samen. */
      st.gloed.setScale(st.im.scaleX, st.im.scaleY).setVisible(true);
    }

    /* ---------- opbouwen ---------- */

    leeg() {
      for (const o of this.alles) o.destroy();
      this.alles = [];
      this.dingen.clear();
      this.rondjes.clear();
      this.lijnen = null;
      this.trek = null;
      this.telStuk = null;
      this.telBadge = null;
      this.druk = null;
    }

    stuk(box: Box, tex: string, x: number, y: number, b: number, h: number): Stuk {
      const im = this.add.image(x, y, tex).setDisplaySize(b, h);
      box.add(im);
      return { im, tex, gloed: null, kleur: null };
    }

    /** Geld in een container leggen (binnen b × h rond het midden). */
    legInBox(box: Box, geld: GeldSoort[], b: number, h: number, maxS: number, kruis: number[] = []) {
      const l = legGeld(geld, b, h, maxS);
      const stukken: Stuk[] = [];
      l.plekken.forEach((pl, i) => {
        stukken.push(this.stuk(box, this.geldPlaatje(pl.g), pl.x, pl.y, pl.b, pl.h));
        if (kruis.includes(i)) {
          const m = Math.min(pl.b, pl.h) * 0.9;
          box.add(this.add.image(pl.x, pl.y, this.kruisPlaatje()).setDisplaySize(m, m));
        }
      });
      return { plekken: l.plekken, stukken };
    }

    /**
     * Eén munt of briefje (opt-in `paneel`): een briefje `u` punten breed, een munt
     * `munt` × de maat van zijn soort. Zo zijn alle keuzes even groot, ook munten naast briefjes.
     */
    legEen(box: Box, g: GeldSoort, u: number, munt: number) {
      const brief = isBriefje(g);
      const img = BEELD.get(beeldSleutel(g, this.p?.herstelBriefje)) ?? null;
      const verh = img ? img.naturalWidth / img.naturalHeight : brief ? 1.9 : 1;
      const b = brief ? u : munt * muntMaat(g);
      const h = brief ? b / verh : b;
      const pl: Plek = { g, x: 0, y: 0, b, h };
      return { plekken: [pl], stukken: [this.stuk(box, this.geldPlaatje(g), 0, 0, b, h)] };
    }

    /** Een ding `aantal` keer, in een rooster (hoogstens 3 naast elkaar), passend in b × h. */
    legDingen(box: Box, naam: string, aantal: number, b: number, h: number, maxK: number): Stuk[] {
      const t = DING;
      const tussen = 10;
      const kol = Math.min(3, Math.ceil(Math.sqrt(aantal)));
      const rijen = Math.ceil(aantal / kol);
      const k = Math.min(maxK, (b - tussen * (kol - 1)) / (t.b * kol), (h - tussen * (rijen - 1)) / (t.h * rijen));
      const breed = t.b * k * kol + tussen * (kol - 1);
      const hoog = t.h * k * rijen + tussen * (rijen - 1);
      const tex = this.dingPlaatje(naam);
      return Array.from({ length: aantal }, (_, i) =>
        this.stuk(box, tex, -breed / 2 + (t.b * k) / 2 + (i % kol) * (t.b * k + tussen), -hoog / 2 + (t.h * k) / 2 + Math.floor(i / kol) * (t.h * k + tussen), t.b * k, t.h * k),
      );
    }

    nieuwDing(d: GKaart, r: Rect, soort: Soort, zweeft: boolean) {
      const box = this.add.container(r.x, r.y);
      let plekken: Plek[] = [];
      let stukken: Stuk[] = [];
      let geldStukken: Stuk[] = [];
      if (d.geld?.length === 1 && this.p?.paneel) {
        const u = Math.min(170, r.b - 30);
        ({ plekken, stukken: geldStukken } = this.legEen(box, d.geld[0], u, u * 0.66));
        stukken = geldStukken;
      } else if (d.geld?.length) {
        ({ plekken, stukken: geldStukken } = this.legInBox(box, d.geld, r.b - 40, r.h - 40, zweeft ? 1.6 : soort === "links" || soort === "rechts" ? 1.95 : 1.45));
        stukken = geldStukken;
      } else if (d.tekening) stukken = this.legDingen(box, d.tekening, d.aantal ?? 1, r.b - 30, r.h - 30, 1.2);
      else if (d.label) stukken = [this.stuk(box, this.tekstPlaatje(d.label), 0, 0, 220, 110)];
      this.alles.push(box);
      let vak: Vak | undefined;
      if ((this.p?.paneel || this.p?.vakken) && soort === "kaart") {
        const sl = this.vakPlaatje(r.b, r.h, null);
        const im = this.add.image(0, 0, sl).setScale(1 / TX);
        box.addAt(im, 0);
        vak = { im, gloed: null, kleur: null, sl };
      }
      const ding: Ding = { box, r, zeg: d.zeg ?? null, soort, id: d.id, plekken, stukken, geldStukken, vak };
      this.dingen.set(d.id, ding);
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
          const tb = DING.b * g.k;
          const th = DING.h * g.k;
          const links = -g.r.b / 2;
          const st = this.stuk(box, this.dingPlaatje(d.tekening), links + tb / 2, 0, tb, th);
          if (d.prijs != null) {
            box.add(this.plaats(this.prijsPlaatje(d.prijs), links + tb + 10 * g.k + (PRIJS_B * 0.8 * g.k) / 2, -th / 2 + (PRIJS_H * g.k) / 2).setScale((g.k * 0.8) / TX));
          }
          this.dingen.set(g.id, { box, r: g.r, zeg: null, soort: "groot", id: g.id, plekken: [], stukken: [st], geldStukken: [] });
        } else if (d.soort === "geld") {
          /* Het goedgekeurde geldvlak onder de vraag, met ruimte voor de bestaande knoppen eronder. */
          const staandPaneel = p.midden === VLAK_B / 2;
          if (p.paneel && d.geld.length === 1 && !p.zonderPaneelVak) {
            const paneel = this.add.graphics();
            const breedte = staandPaneel ? 880 : 660;
            const hoogte = staandPaneel ? 350 : 280;
            paneel.fillStyle(0xc3dfff, 0.035);
            paneel.fillRoundedRect(-breedte / 2, -hoogte / 2, breedte, hoogte, 24);
            paneel.lineStyle(1, 0xc6dcff, 0.27);
            paneel.strokeRoundedRect(-breedte / 2, -hoogte / 2, breedte, hoogte, 24);
            box.add(paneel);
          }
          const { plekken, stukken } = p.paneel && d.geld.length === 1 ? this.legEen(box, d.geld[0], staandPaneel ? 620 : 390, staandPaneel ? 260 : 190) : this.legInBox(box, d.geld, g.r.b, g.r.h, g.k * GROOT_GELD, d.kruis);
          this.dingen.set(g.id, { box, r: g.r, zeg: null, soort: "groot", id: g.id, plekken, stukken, geldStukken: stukken });
        } else box.add(this.plaats(this.tekenPlaatje(d.soort), 0, 0).setScale(g.k / TX));
        nieuw.push(box);
      }
      if (p.sfeer) {
        /* klein en zacht linksboven, zacht deinend */
        const sf = this.add.image(110, 110, this.dingPlaatje(p.sfeer)).setScale(130 / DING.b / TX).setAlpha(0.45).setDepth(-1);
        this.alles.push(sf);
        if (!rustig) this.tweens.add({ targets: sf, y: 104, duration: 2600, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
      }
      (p.kaarten ?? []).forEach((d, i) => {
        const ding = this.nieuwDing(d, ind.kaarten[i], "kaart", !!p.zweven);
        nieuw.push(ding.box);
        if (p.zweven && !rustig) this.tweens.add({ targets: ding.box, y: ding.r.y - 12, duration: 1500 + i * 170, yoyo: true, repeat: -1, ease: "Sine.easeInOut", delay: i * 120 });
      });
      if (p.verbind) {
        this.lijnen = this.add.graphics().setDepth(4);
        this.alles.push(this.lijnen);
        p.verbind.links.forEach((d, i) => nieuw.push(this.nieuwDing(d, ind.links[i], "links", false).box));
        p.verbind.rechts.forEach((d, i) => nieuw.push(this.nieuwDing(d, ind.rechts[i], "rechts", false).box));
        this.trek = this.add.graphics().setDepth(5);
        this.alles.push(this.trek);
      }
      if (verschijn) nieuw.forEach((b, i) => this.tover(b, { vertraging: i * 70 }));
    }

    nodigGeld(p: GeldProps): GeldSoort[] {
      const lijst: GeldSoort[] = [];
      for (const d of p.groot ?? []) if (d.soort === "geld") lijst.push(...d.geld);
      for (const k of [...(p.kaarten ?? []), ...(p.verbind?.links ?? []), ...(p.verbind?.rechts ?? [])]) lijst.push(...(k.geld ?? []));
      return [...new Set(lijst)];
    }

    zet(p: GeldProps) {
      this.p = p;
      if (p.vooraf?.length) void laadGeld(p.vooraf, p.getekendeMunten, p.herstelBriefje);
      const sig = JSON.stringify([
        p.nr,
        p.groot ?? null,
        (p.kaarten ?? []).map((k) => [k.id, k.geld, k.tekening, k.aantal, k.label]),
        !!p.zweven,
        !!p.paneel,
        !!p.vakken,
        p.sfeer ?? null,
        !!p.getekendeMunten,
        p.midden ?? null,
        p.verbind ? [p.verbind.links.map((k) => [k.id, k.geld, k.label]), p.verbind.rechts.map((k) => [k.id, k.geld, k.label])] : null,
      ]);
      if (sig !== this.sig) {
        const geld = this.nodigGeld(p);
        const klaar = geld.every((g) => BEELD.has(beeldSleutel(g, p.herstelBriefje))) && (!p.getekendeMunten || BEELD.has("munten-concept"));
        if (!klaar) {
          /* Eerst de afbeeldingen; daarna pas opbouwen (als er intussen niets anders gevraagd is). */
          this.wacht = sig;
          void laadGeld(geld, p.getekendeMunten, p.herstelBriefje).then(() => {
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
      const kleur = (id: string): Gloed | null => (p.goed?.includes(id) ? "goed" : p.fout?.includes(id) ? "fout" : p.licht?.includes(id) || p.gekozen?.includes(id) ? "warm" : null);
      const v = p.verbind;
      const lijnKleur = (d: Ding): Gloed | null => {
        if (!v) return null;
        const lijn = v.lijnen.find(([a, b]) => (d.soort === "links" ? a : b) === d.id);
        return lijn && v.goed.includes(lijn[0]) ? "goed" : lijn && v.fout.includes(lijn[0]) ? "fout" : v.gekozen === d.id ? "warm" : kleur(d.id);
      };
      for (const d of this.dingen.values()) {
        let k = d.soort === "links" || d.soort === "rechts" ? lijnKleur(d) : kleur(d.id);
        /* Met een rondje licht niets op: Bliepo wijst aan met een rood rondje (goed en fout houden hun gloed). */
        if (p.rondje && k === "warm" && !p.gekozen?.includes(d.id) && d.soort !== "links" && d.soort !== "rechts") k = null;
        if (d.vak) {
          /* Eigen vak: bij goed of fout licht het hele vak op; de munt zelf alleen bij "licht". */
          this.zetVak(d, k === "goed" || k === "fout" ? k : null);
          for (const st of d.stukken) this.zetGloed(st, k === "warm" ? k : null);
        } else for (const st of d.stukken) this.zetGloed(st, k);
        if (d.soort === "kaart") d.box.setAlpha(p.uit?.includes(d.id) ? 0.35 : 1);
      }
      if (this.lijnen && v) {
        const g = this.lijnen;
        g.clear();
        for (const [l, r] of v.lijnen) {
          const a = this.dingen.get(l);
          const b = this.dingen.get(r);
          if (!a || !b) continue;
          const k = v.goed.includes(l) ? LIJNKLEUR.goed : v.fout.includes(l) ? LIJNKLEUR.fout : LIJNKLEUR.warm;
          const p1 = bolLinks(a.r);
          const p2 = bolRechts(b.r);
          g.lineStyle(7, k, 1);
          g.lineBetween(p1.x, p1.y, p2.x, p2.y);
        }
        /* De bolletjes: licht als er nog geen lijn is, in de kleur van de lijn als die er wel is. */
        for (const d of this.dingen.values()) {
          if (d.soort !== "links" && d.soort !== "rechts") continue;
          const pt = d.soort === "links" ? bolLinks(d.r) : bolRechts(d.r);
          const lijn = v.lijnen.find(([a, b]) => (d.soort === "links" ? a : b) === d.id);
          const k = !lijn ? LIJNKLEUR.leeg : v.goed.includes(lijn[0]) ? LIJNKLEUR.goed : v.fout.includes(lijn[0]) ? LIJNKLEUR.fout : LIJNKLEUR.warm;
          g.fillStyle(k, 1);
          g.fillCircle(pt.x, pt.y, 12);
          g.fillStyle(0x0b1440, 1);
          g.fillCircle(pt.x, pt.y, 5);
        }
      }
      this.zetGeteld(p);
      this.zetRondjes(p);
    }

    /** Het plaatje van het rondje (een met de hand getekend rood rondje, Magnific, gekozen door Sara); null zolang het nog laadt. */
    rondjeTex(): string | null {
      const sl = "geld-rondje-2";
      if (this.textures.exists(sl)) return sl;
      if (!this.rondjeLaadt) {
        this.rondjeLaadt = true;
        const img = new Image();
        img.src = "/rondje/rondje-rood-2.png";
        img
          .decode()
          .then(() => {
            if (!this.sys?.isActive() || this.textures.exists(sl)) return;
            this.textures.addImage(sl, img);
            if (this.p) this.zetRondjes(this.p);
          })
          .catch(() => console.error("[rondje] rondje-rood-2.png laadt niet"));
      }
      return null;
    }

    /** Het vierkant (in het ding zelf) om een groepje plaatjes. */
    omheen(stukken: Stuk[]): { x: number; y: number; b: number; h: number } | null {
      const lijst = stukken.filter((s) => s.im.active);
      if (!lijst.length) return null;
      const x0 = Math.min(...lijst.map((s) => s.im.x - s.im.displayWidth / 2));
      const x1 = Math.max(...lijst.map((s) => s.im.x + s.im.displayWidth / 2));
      const y0 = Math.min(...lijst.map((s) => s.im.y - s.im.displayHeight / 2));
      const y1 = Math.max(...lijst.map((s) => s.im.y + s.im.displayHeight / 2));
      return { x: (x0 + x1) / 2, y: (y0 + y1) / 2, b: x1 - x0, h: y1 - y0 };
    }

    /** Wat Bliepo aanwijst of telt: een rood rondje eromheen, dat zacht verschijnt. Alleen met `rondje`. */
    zetRondjes(p: GeldProps) {
      const wens = new Map<string, { box: Box; stukken: Stuk[]; zacht?: boolean }>();
      if (p.rondje) {
        for (const id of p.licht ?? []) {
          const d = this.dingen.get(id);
          if (d && !p.goed?.includes(id) && !p.fout?.includes(id) && d.soort !== "links" && d.soort !== "rechts") wens.set(`ding:${id}`, { box: d.box, stukken: d.stukken });
        }
        const t = p.geteld;
        const d = t ? this.dingen.get(t.id) : undefined;
        /* Tellen hoort bij elkaar (besluit 4): het stuk dat Bliepo nu telt is fel, wat hij al telde blijft zacht staan;
           bij "hier ligt X euro" (tot voorbij het laatste stuk) zijn ze allemaal weer fel. */
        if (t && d && t.tot > 0) {
          const alles = t.tot > d.plekken.length;
          const tot = Math.min(t.tot, d.plekken.length);
          for (let k = 1; k <= tot; k++) if (d.geldStukken[k - 1]) wens.set(`tel:${t.id}:${k}`, { box: d.box, stukken: [d.geldStukken[k - 1]], zacht: !alles && k < tot });
        }
      }
      for (const [sl, r] of this.rondjes) {
        if (wens.has(sl) && r.im.active) {
          const doel = wens.get(sl)!.zacht ? 0.45 : 1;
          if (r.im.alpha !== doel) this.tweens.add({ targets: r.im, alpha: doel, duration: this.rustig ? 0 : 180 });
          continue;
        }
        r.im.destroy();
        this.rondjes.delete(sl);
      }
      if (!wens.size) return;
      const tex = this.rondjeTex();
      if (!tex) return;
      for (const [sl, w] of wens) {
        if (this.rondjes.has(sl)) continue;
        const r = this.omheen(w.stukken);
        if (!r) continue;
        const im = this.add.image(r.x, r.y, tex).setDisplaySize(r.b * 1.15 + 44, r.h * 1.4 + 50);
        im.setAngle(((sl.length * 37) % 50) / 10 - 2.5);
        w.box.add(im);
        this.rondjes.set(sl, { im, box: w.box });
        const doel = w.zacht ? 0.45 : 1;
        if (this.rustig) {
          im.setAlpha(doel);
          continue;
        }
        const sx = im.scaleX;
        const sy = im.scaleY;
        im.setAlpha(0);
        this.tweens.add({ targets: im, alpha: doel, scaleX: { from: sx * 0.9, to: sx }, scaleY: { from: sy * 0.9, to: sy }, duration: 240, ease: "Back.easeOut" });
      }
    }

    /** Bliepo telt: wat hij nu telt licht op, en erboven staat het bedrag tot nu toe. */
    zetGeteld(p: GeldProps) {
      if (this.telStuk && !this.telStuk.im.active) this.telStuk = null;
      if (this.telStuk) {
        /* Terug naar de gloed van het ding zelf (meestal geen). */
        const st = this.telStuk;
        const ding = [...this.dingen.values()].find((d) => d.stukken.includes(st));
        st.kleur = st.kleur === "warm" ? "goed" : st.kleur;
        this.zetGloed(st, ding ? (p.goed?.includes(ding.id) ? "goed" : p.fout?.includes(ding.id) ? "fout" : p.licht?.includes(ding.id) && !p.rondje ? "warm" : null) : null);
        this.telStuk = null;
      }
      this.telBadge?.destroy();
      this.telBadge = null;
      const t = p.geteld;
      if (!t) return;
      const d = this.dingen.get(t.id);
      if (!d || !d.plekken.length) return;
      const tot = Math.max(0, Math.min(t.tot, d.plekken.length));
      const som = (t.vanaf ?? 0) + d.plekken.slice(0, tot).reduce((a, pl) => a + WAARDE[pl.g], 0);
      if (tot > 0 && t.tot <= d.plekken.length) {
        this.telStuk = d.geldStukken[tot - 1];
        this.telStuk.kleur = null;
        if (!p.rondje) this.zetGloed(this.telStuk, "warm");
      }
      if (tot > 0) {
        const tekst = `€ ${som}`;
        const geldH = Math.max(...d.plekken.map((pl) => Math.abs(pl.y) + pl.h / 2));
        const boven = d.box.y - geldH - 34;
        const y = boven >= 30 ? boven : d.box.y + geldH + 34;
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

    /** Het verhaal naspelen: het groepje `id` springt op en vliegt in het ding `naar` (het geld valt in de spaarpot). */
    vliegNaar(id: string, naar: string) {
      const d = this.dingen.get(id);
      const doel = this.dingen.get(naar);
      if (!d || !doel) return;
      const box = d.box;
      const tx = doel.box.x + (doel.stukken[0]?.im.x ?? 0);
      const ty = doel.box.y + (doel.stukken[0]?.im.y ?? 0) - 20;
      box.setDepth(20);
      if (rustig) {
        box.setVisible(false);
        return;
      }
      this.tweens.add({ targets: box, y: box.y - 40, duration: 220, ease: "Sine.easeOut" });
      this.tweens.add({ targets: box, x: tx, delay: 220, duration: 650, ease: "Sine.easeIn" });
      this.tweens.add({ targets: box, y: ty, delay: 220, duration: 650, ease: "Back.easeIn" });
      this.tweens.add({ targets: box, scale: 0.25, alpha: 0, delay: 600, duration: 300, ease: "Sine.easeIn" });
      this.time.delayedCall(880, () => {
        if (!doel.box.active) return;
        this.tweens.add({ targets: doel.box, scaleY: 0.93, duration: 100, yoyo: true, ease: "Sine.easeOut" });
        this.golf(tx, ty + 20);
      });
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
              spoor.lineStyle(6, 0xffd36e, 0.9);
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
      if (binnen({ ...d.r, x: d.box.x, y: d.box.y }, x, y, marge)) return true;
      /* Het bolletje van een verbind-groepje hoort er ook bij. */
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
        this.trek.lineStyle(7, LIJNKLEUR.warm, 1);
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

    /** Voor `npm run vloeiend`: om de beurt licht iets op (gloed op het moment), met een golf. */
    demo(ms: number) {
      const eind = performance.now() + ms;
      const lijst = [...this.dingen.values()];
      let i = 0;
      const stap = () => {
        if (performance.now() > eind) return;
        const d = lijst[i++ % Math.max(1, lijst.length)];
        if (d) {
          for (const st of d.stukken) this.zetGloed(st, "warm");
          this.time.delayedCall(400, () => d.stukken.forEach((st) => st.im.active && this.zetGloed(st, null)));
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
  const getekendeMunten = useContext(GetekendeMuntenContext);
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

  const { nr, groot, kaarten, kaartenActief, zweven, uit, goed, fout, licht, gekozen, rondje, verbind, geteld, vooraf, paneel, vakken, sfeer } = props;
  /* Met `paneel`: het midden van het scherm (laptop: het vlak staat 150 naar links; staand scherm: gecentreerd). */
  const [staand, setStaand] = useState(false);
  useEffect(() => {
    const meet = () => setStaand(window.innerHeight > window.innerWidth);
    meet();
    window.addEventListener("resize", meet);
    return () => window.removeEventListener("resize", meet);
  }, []);
  const midden = paneel ? (staand ? VLAK_B / 2 : 640) : undefined;
  const stand = JSON.stringify({ nr, groot, kaarten, kaartenActief, zweven, uit, goed, fout, licht, gekozen, rondje, verbind, geteld, vooraf, paneel, midden, getekendeMunten, vakken, sfeer, herstelBriefje: props.herstelBriefje, zonderPaneelVak: props.zonderPaneelVak });
  useEffect(() => {
    if (scene) scene.zet(JSON.parse(stand) as GeldProps);
  }, [scene, stand]);

  /* Het geld van de les alvast laden, ook voordat Phaser klaar is. */
  const voorafSleutel = (vooraf ?? []).join(",");
  useEffect(() => {
    if (voorafSleutel) void laadGeld(voorafSleutel.split(",") as GeldSoort[], getekendeMunten, props.herstelBriefje);
  }, [voorafSleutel, getekendeMunten, props.herstelBriefje]);

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
  const vliegNr = props.vlieg?.n;
  useEffect(() => {
    if (scene && props.vlieg) scene.vliegNaar(props.vlieg.id, props.vlieg.naar);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, vliegNr]);

  /* De namen van tekeningen en woorden alvast klaarzetten om voor te lezen (geld nooit). */
  const namen = [...(kaarten ?? []), ...(verbind?.links ?? []), ...(verbind?.rechts ?? [])].map((d) => d.zeg ?? "").filter(Boolean);
  const namenSleutel = namen.join("\n");
  useEffect(() => {
    if (namenSleutel) haalKeuzesAlvast(namenSleutel.split("\n"));
  }, [namenSleutel]);

  /* Onzichtbare knoppen over alles wat je kunt tikken: toetsenbord en automatische test. */
  const ind = indeling({ ...props, midden });
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

/** De tekening op de kaart aan het eind (244 × 190): het voorwerp spaarpot. */
export function KaartSpaarpot() {
  return (
    <svg viewBox="0 0 244 190" width={244} height={190} aria-hidden="true">
      <image href={voorwerpUrl("spaarpot")} x={32} y={5} width={180} height={180} />
    </svg>
  );
}

/** De kaart aan het eind van de les Munten en briefjes (244 × 190): een echte munt en een echt briefje (specimen). */
export function KaartMuntBriefje() {
  const getekend = useContext(GetekendeMuntenContext);
  const munt = (g: "m1" | "m2", x: number, y: number, maat: number) => {
    if (!getekend) return <image href={BESTAND[g]} x={x} y={y} width={maat} height={maat} />;
    const r = MUNTUITSNEDE[g];
    return <svg x={x} y={y} width={maat} height={maat} viewBox={`${r.x} ${r.y} ${r.b} ${r.h}`}>
      <defs><clipPath id={`kaart-munt-${g}`}><rect x={r.x} y={r.y} width={r.b} height={r.h} rx={Math.min(r.b, r.h) * 0.35} /></clipPath></defs>
      <image href={MUNTENBLAD} width={1679} height={937} clipPath={`url(#kaart-munt-${g})`} />
    </svg>;
  };
  return (
    <svg viewBox="0 0 244 190" width={244} height={190} aria-hidden="true">
      {munt("m2", 14, 46, 96)}
      <image href={BESTAND.b5} x={116} y={52} width={118} height={60} />
      {munt("m1", 150, 116, 70)}
    </svg>
  );
}

/** De tekening op de kaart aan het eind (244 × 190): het voorwerp skateboard. */
export function KaartSkateboard() {
  return (
    <svg viewBox="0 0 244 190" width={244} height={190} aria-hidden="true">
      <image href={voorwerpUrl("skateboard")} x={32} y={5} width={180} height={180} />
    </svg>
  );
}
