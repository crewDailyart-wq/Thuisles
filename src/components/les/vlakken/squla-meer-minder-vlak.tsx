"use client";

/**
 * Meer, minder, evenveel als hologrammen (30 oktober 2026, opdracht
 * eigenaar): het speelvlak van de lessen naar Squla groep 3 "Meer, minder,
 * evenveel 1, 2 en 3". Bliepo tovert groepen voorwerpen tevoorschijn vóór
 * de blauwe ruimte (eigen tekenwerk, gebakken gloed, alles in Phaser).
 *
 * Vier soorten opgaven (`opgave.soort`):
 * - `tel`: één groep voorwerpen; het kind telt en kiest het getal bij
 *   Bliepo (`l.kies`). Samen tellen: `tel` licht rij voor rij op, met het
 *   getal tot dan toe achter elke rij.
 * - `kaarten`: twee of drie kaarten met een groep; soms een voorbeeldgroep
 *   erboven of een getalkaart. Het kind tikt op een kaart: meldt
 *   `{ soort: "kaart", vak }`.
 * - `volgorde`: vier kaarten met groepen; het kind sleept ze naar de vakjes
 *   (tikken mag ook: dan gaat de kaart naar het eerste lege vakje; tik op
 *   een kaart in een vakje en hij gaat terug). Zijn alle vakjes vol, dan
 *   meldt het vlak `{ soort: "volgorde", rij }` (de nummers van de kaarten).
 * - `getallen`: hetzelfde met potjes of vliegers met een getal. Bij de hulp
 *   (`staven`) staan onder elk getal de tientallen als staven en de losse
 *   als stippen.
 *
 * Wat het draaiboek verder zet: `actief`, `tel` (vak = nummer in de
 * vakken van het vlak, de voorbeeldgroep eerst), `bordjes` (hoeveel er op
 * elke kaart staan, na samen tellen; ook per vak, de voorbeeldgroep eerst;
 * het bordje beweegt mee met de kaart), `goed` en `fout` (tellers met het
 * nummer van de kaart om op te tikken, zonder de voorbeeldgroep; `goed` met
 * vak -1 = alle kaarten in de vakjes), `plekGoed` (welke vakjes goed zijn na een volgorde), `ronde`
 * (ophogen = alles terug naar beneden), `hand` (een lichtje doet één keer
 * voor hoe je sleept) en `test` (de goede volgorde, voor de automatische
 * test: window.__phaser.antwoord is steeds het volgende goede ding).
 */

import { useEffect, useMemo } from "react";
import type { Vlakbasis, Vlakgebeurtenis } from "../soort";
import { holoBasis, TX, VLAK_B, VLAK_H, WARM, GOED, WERELDKLEUR, type PhaserModule } from "../holo/basis";
import { HOLO_CANVAS, useHoloMotor } from "../holo/motor";
import { speelLesgeluid } from "@/lib/lesgeluiden";
import { maakRondjes, vakOm, type RondjeVak } from "../holo/rondje";
import { DING_B, DING_H, MM_KLEUR, MM_MAAT, MM_VASTE_KLEUR, mmDoos, mmHex, mmTeken, mmTekenDing, type MMDing, type MMKleur, type MMSoort } from "./squla-meer-minder-tekenen";
import s from "./squla-meer-minder.module.css";

export type { MMDing, MMKleur, MMSoort };

/* ---------- opgaven ---------- */

/** Een blok voorwerpen: rijen (lengtes), de kleur per rij om en om, of "bont" (elk voorwerp een andere kleur). */
export type MMBlok = { rijen: number[]; kleuren: MMKleur[] | "bont"; doos?: boolean };
export type MMGroep = { soort: MMSoort; blokken: MMBlok[] };

export type MMOpgave =
  | { id: string; soort: "tel"; groep: MMGroep }
  | { id: string; soort: "kaarten"; kaarten: MMGroep[]; voorbeeld?: MMGroep; getal?: number }
  | { id: string; soort: "volgorde"; kaarten: MMGroep[] }
  | { id: string; soort: "getallen"; ding: MMDing; getallen: number[] };

export type MMProps = {
  opgave: MMOpgave | null;
  actief?: boolean;
  tel?: { vak: number; geteld: number } | null;
  bordjes?: (number | null)[] | null;
  goed?: { vak: number; keer: number } | null;
  fout?: { vak: number; keer: number } | null;
  plekGoed?: boolean[] | null;
  /** Het goede antwoord laten zien: de kaarten (of potjes) komen in deze volgorde in de vakjes (na de tweede fout). */
  zetOp?: number[] | null;
  ronde?: number;
  staven?: boolean;
  /** Het rode rondje (BOUWREGELS 7.8) om wat Bliepo noemt bij de staven: "staaf" (1 staaf) of "staven-<nummer>" (alles onder dat potje). */
  wijs?: string | null;
  hand?: boolean;
  test?: string[] | null;
  /** Alle opgaven van de les: de plaatjes worden vooraf gebakken, vóór het eerste beeld (alleen bij het begin gelezen). */
  vooraf?: MMOpgave[];
};

/** Hoeveel voorwerpen er in een groep staan. */
export const aantalIn = (g: MMGroep) => g.blokken.reduce((t, b) => t + b.rijen.reduce((a, r) => a + r, 0), 0);

/* ---------- waar staat wat (punten van het vlak, 980 × 720) ---------- */

type Rect = { x: number; y: number; b: number; h: number };
type Plek = { x: number; y: number; kleur: string };
/** Een telstap: een rij (of een doosje), met de indexen en waar het getal erachter komt. */
type Telrij = { eind: number; x: number; y: number };
type GroepPlek = { cel: number; plekken: Plek[]; rijen: Telrij[]; dozen: Rect[] };
/** Een vak: een kaart (of de hele groep bij `tel`), met de plekken van de voorwerpen ten opzichte van het midden. */
export type Vak = Rect & { soort: "groep" | "voorbeeld" | "kaart" | "ding"; groep: GroepPlek | null; getal?: number };
export type MMIndeling = { vakken: Vak[]; sloten: Rect[]; getalkaart: (Rect & { getal: number }) | null };

const BONT: MMKleur[] = ["rood", "blauw", "geel", "groen", "paars", "oranje", "roze"];

/** Elk voorwerp een andere kleur, en nooit twee dezelfde naast of onder elkaar. */
function bonteKleur(i: number, per: number) {
  const r = Math.floor(i / per);
  return BONT[(i + r * 3) % BONT.length];
}

/**
 * Waar de voorwerpen van een groep staan, gecentreerd in `vak` (plekken ten opzichte van het midden van het vak).
 * `kolom` (herstel ronde 2, 7 november; alleen op volgorde zetten op een staand scherm): de groepjes van 5 staan dan
 * onder elkaar in plaats van naast elkaar, zodat een smalle, hoge kaart veel grotere voorwerpen kan hebben.
 */
function groepPlek(g: MMGroep, vak: Rect, maxCel: number, kolom = false): GroepPlek {
  if (kolom && !g.blokken.some((b) => b.doos)) return kolomPlek(g, vak, maxCel);
  const maten = g.blokken.map((b) => (b.doos ? { k: 3, r: 2 } : { k: Math.max(...b.rijen), r: b.rijen.length }));
  const gat = g.blokken.some((b) => b.doos) ? 0.45 : 0.75;
  const kolommen = maten.reduce((t, m) => t + m.k, 0) + gat * (maten.length - 1);
  const rijen = Math.max(...maten.map((m) => m.r));
  const cel = Math.min(maxCel, vak.b / kolommen, vak.h / rijen);
  const x0 = -(kolommen * cel) / 2;
  const y0 = -(rijen * cel) / 2;
  const plekken: Plek[] = [];
  const telrijen: Telrij[] = [];
  const dozen: Rect[] = [];
  let kx = x0;
  g.blokken.forEach((b, bi) => {
    const m = maten[bi];
    if (b.doos) dozen.push({ x: kx - cel * 0.12, y: y0 - cel * 0.12, b: m.k * cel + cel * 0.24, h: m.r * cel + cel * 0.24 });
    const per = Math.max(...b.rijen);
    b.rijen.forEach((lengte, r) => {
      for (let k = 0; k < lengte; k++) {
        const kleur = b.kleuren === "bont" ? bonteKleur(plekken.length, per) : b.kleuren[r % b.kleuren.length];
        plekken.push({ x: kx + (k + 0.5) * cel, y: y0 + (r + 0.5) * cel, kleur: MM_KLEUR[kleur] });
      }
      if (!b.doos) telrijen.push({ eind: plekken.length, x: kx + lengte * cel + cel * 0.62, y: y0 + (r + 0.5) * cel });
    });
    if (b.doos) telrijen.push({ eind: plekken.length, x: kx + (m.k * cel) / 2, y: y0 - cel * 0.55 });
    kx += (m.k + gat) * cel;
  });
  return { cel, plekken, rijen: telrijen, dozen };
}

/** Zoals `groepPlek`, maar elk groepje van 5 is een kolom (van boven naar beneden), de kolommen naast elkaar. */
function kolomPlek(g: MMGroep, vak: Rect, maxCel: number): GroepPlek {
  const maten = g.blokken.map((b) => ({ k: b.rijen.length, r: Math.max(...b.rijen) }));
  const gat = 0.75;
  const kolommen = maten.reduce((t, m) => t + m.k, 0) + gat * (maten.length - 1);
  const rijen = Math.max(...maten.map((m) => m.r));
  const cel = Math.min(maxCel, vak.b / kolommen, vak.h / rijen);
  const x0 = -(kolommen * cel) / 2;
  const y0 = -(rijen * cel) / 2;
  const plekken: Plek[] = [];
  const telrijen: Telrij[] = [];
  let kx = x0;
  g.blokken.forEach((b, bi) => {
    const per = Math.max(...b.rijen);
    b.rijen.forEach((lengte, r) => {
      for (let k = 0; k < lengte; k++) {
        const kleur = b.kleuren === "bont" ? bonteKleur(plekken.length, per) : b.kleuren[r % b.kleuren.length];
        plekken.push({ x: kx + (r + 0.5) * cel, y: y0 + (k + 0.5) * cel, kleur: MM_KLEUR[kleur] });
      }
      telrijen.push({ eind: plekken.length, x: kx + (r + 0.5) * cel, y: y0 + lengte * cel + cel * 0.62 });
    });
    kx += (maten[bi].k + gat) * cel;
  });
  return { cel, plekken, rijen: telrijen, dozen: [] };
}

/** Hoe hoog de voorwerpen van een groep samen zijn (met de doos eromheen), voor een kaart die niet hoger is dan nodig. */
function groepHoogte(g: GroepPlek): number {
  const ys = g.plekken.flatMap((p) => [p.y - g.cel / 2, p.y + g.cel / 2]).concat(g.dozen.flatMap((d) => [d.y, d.y + d.h]));
  return ys.length ? Math.max(...ys) - Math.min(...ys) : 0;
}

const binnen = (r: Rect, f: number): Rect =>({ x: r.x, y: r.y, b: r.b * f, h: r.h * f });

/** Vakken naast elkaar, gecentreerd. */
function rij(n: number, b: number, h: number, y: number, tussen: number): Rect[] {
  const x0 = VLAK_B / 2 - (n * b + (n - 1) * tussen) / 2;
  return Array.from({ length: n }, (_, i) => ({ x: x0 + i * (b + tussen), y, b, h }));
}

/**
 * `staand`: een staand scherm (telefoon rechtop). Alleen bij op volgorde zetten anders (herstel ronde 2, 7 november, BOUWREGELS 1.24):
 * daar waren de voorwerpen op een telefoon te klein om te tellen.
 */
export function mmIndeling(o: MMOpgave, staand = false): MMIndeling {
  /* Herstel 7 november: alles in het midden van het vlak, niet tegen de linkerrand; elke kaart in een eigen vak. */
  if (o.soort === "tel") {
    const r = { x: 110, y: 40, b: 760, h: 640 };
    const vak: Vak = { ...r, soort: "groep", groep: groepPlek(o.groep, r, 92) };
    return { vakken: [vak], sloten: [], getalkaart: null };
  }
  if (o.soort === "kaarten") {
    const n = o.kaarten.length;
    const vakken: Vak[] = [];
    let kaarten: Rect[];
    let maxCel: number;
    let getalkaart: MMIndeling["getalkaart"] = null;
    if (o.voorbeeld) {
      const vb = { x: 260, y: 14, b: 460, h: 290 };
      vakken.push({ ...vb, soort: "voorbeeld", groep: groepPlek(o.voorbeeld, binnen(vb, 0.84), 52) });
      kaarten = rij(n, 350, 360, 334, 60);
      maxCel = 56;
    } else if (o.getal !== undefined) {
      getalkaart = { x: 400, y: 14, b: 180, h: 166, getal: o.getal };
      kaarten = rij(n, 370, 486, 212, 60);
      maxCel = 62;
    } else if (n === 2) {
      /* Ronde 9 (7 november, Sara): de 2 kaarten waren hoog en smal (380 × 540) met kleine voorwerpen en veel leegte;
         nu breder, de voorwerpen groter, en de hoogte past zich hieronder aan wat er op de kaart staat. */
      kaarten = rij(n, 440, 540, 90, 60);
      maxCel = 80;
    } else {
      /* Drie kaarten naast elkaar, met ruimte ertussen zodat je ziet waar een groepje ophoudt. */
      kaarten = rij(n, 290, 360, 170, 34);
      maxCel = 64;
    }
    const groepen = kaarten.map((k, i) => groepPlek(o.kaarten[i], binnen(k, 0.86), maxCel));
    /* Ronde 9: de kaarten zijn niet hoger dan nodig (alle kaarten even hoog), met een nette rand boven en onder de voorwerpen. */
    const hoog = Math.max(...groepen.map(groepHoogte));
    const cel = Math.max(...groepen.map((g) => g.cel));
    const pasH = Math.min(kaarten[0].h, Math.max(hoog + 2 * Math.max(34, cel * 0.7), 220));
    kaarten = kaarten.map((k) => ({ ...k, h: pasH, y: o.voorbeeld || o.getal !== undefined ? k.y : k.y + (k.h - pasH) / 2 }));
    kaarten.forEach((k, i) => vakken.push({ ...k, soort: "kaart", groep: groepen[i] }));
    /* Met een voorbeeld of getal erboven: het geheel netjes in het midden van de hoogte. */
    if (o.voorbeeld || getalkaart) {
      const boven = Math.min(...vakken.map((v) => v.y), getalkaart ? getalkaart.y : Infinity);
      const onder = Math.max(...vakken.map((v) => v.y + v.h));
      const schuif = Math.max(0, (VLAK_H - (onder - boven)) / 2 - boven);
      if (schuif > 0) {
        vakken.forEach((v) => (v.y += schuif));
        if (getalkaart) getalkaart = { ...getalkaart, y: getalkaart.y + schuif };
      }
    }
    return { vakken, sloten: [], getalkaart };
  }
  if (o.soort === "volgorde" && staand && o.kaarten.length <= 4) {
    /* Staand: hoge kaarten (de groepjes van 5 onder elkaar) die bijna de hele hoogte gebruiken; de bordjes passen er nog boven. */
    const n = o.kaarten.length;
    const sloten = rij(n, 222, 318, 38, 10);
    const thuis = rij(n, 214, 306, 384, 18);
    return { vakken: thuis.map((k, i) => ({ ...k, soort: "kaart", groep: groepPlek(o.kaarten[i], binnen(k, 0.9), 60, true) })), sloten, getalkaart: null };
  }
  if (o.soort === "volgorde") {
    const n = o.kaarten.length;
    /* Ronde 9 (7 november): de kaarten iets breder en de voorwerpen groter (ze waren klein met veel rand eromheen). */
    const thuis = rij(n, 226, 222, 410, 12);
    const sloten = rij(n, 234, 232, 52, 8);
    return { vakken: thuis.map((k, i) => ({ ...k, soort: "kaart", groep: groepPlek(o.kaarten[i], binnen(k, 0.9), 46) })), sloten, getalkaart: null };
  }
  const n = o.getallen.length;
  const thuis = rij(n, DING_B, DING_H, 380, 110);
  const sloten = rij(n, DING_B + 30, DING_H + 30, 70, 80);
  return { vakken: thuis.map((k, i) => ({ ...k, soort: "ding", groep: null, getal: o.getallen[i] })), sloten, getalkaart: null };
}

const midden = (r: Rect) => ({ x: r.x + r.b / 2, y: r.y + r.h / 2 });

/* ---------- de scène ---------- */

type Melder = (g: Vlakgebeurtenis) => void;

interface MMScene {
  verbind(m: Melder): void;
  zetOpgave(o: MMOpgave | null): void;
  zetTel(t: { vak: number; geteld: number } | null): void;
  zetActief(aan: boolean): void;
  goed(vak: number): void;
  fout(vak: number): void;
  wisMarken(): void;
  plekGoed(lijst: boolean[] | null): void;
  zetOp(lijst: number[] | null): void;
  terugNaarHuis(): void;
  bordjes(lijst: (number | null)[] | null): void;
  staven(aan: boolean): void;
  wijs(w: string | null): void;
  hand(aan: boolean): void;
  zetTest(lijst: string[] | null): void;
  zetStaand(staand: boolean): void;
  tik(i: number): void;
  lichtOp(vak: number): void;
  sleepPunt(): { x: number; y: number } | null;
}

function maakScene(Phaser: PhaserModule, rustig: boolean, vooraf: MMOpgave[]) {
  const Basis = holoBasis(Phaser, rustig);
  type Img = import("phaser").GameObjects.Image;
  type Box = import("phaser").GameObjects.Container;
  type Gfx = import("phaser").GameObjects.Graphics;
  type Ptr = import("phaser").Input.Pointer;
  type Stuk = { box: Box; items: Img[]; vak: Vak; plek: number | null; mark: Gfx | null; bordje: Box | null };

  class MM extends Basis implements MMScene {
    o: MMOpgave | null = null;
    ind: MMIndeling | null = null;
    staand = false;
    stukken: Stuk[] = [];
    overig: (Img | Box | Gfx)[] = [];
    slotBeelden: Img[] = [];
    staafBeelden: (Img | Gfx | import("phaser").GameObjects.Text)[] = [];
    vinger: Img | null = null;
    /** De staven en blokjes per potje (zonder het getal), voor het rondje; en het rondje daarvoor. */
    staafGroepen: Img[][] = [];
    wijsRondje: ReturnType<typeof maakRondjes> | null = null;
    /** Het rode rondje (Sara, 6 november 2026) om de rij die Bliepo telt: één per kaart (de houder is de kaart zelf). */
    rondjes = new Map<Box, ReturnType<typeof maakRondjes>>();
    rondjeTok = new Map<Box, number>();
    melder: Melder = () => {};
    actief = false;
    bezig = false;
    test: string[] | null = null;
    sleep: { st: Stuk; dx: number; dy: number; x0: number; y0: number; bewogen: boolean } | null = null;

    constructor() {
      super("squla-meer-minder");
    }

    verbind(m: Melder) {
      this.melder = m;
    }

    maak() {
      this.canvasPlaatje("mm-vinger", 60, 60, (c) => {
        const g = c.createRadialGradient(30, 30, 4, 30, 30, 28);
        g.addColorStop(0, "rgba(255,255,255,1)");
        g.addColorStop(0.45, "rgba(255,240,190,0.9)");
        g.addColorStop(1, "rgba(255,211,110,0)");
        c.fillStyle = g;
        c.beginPath();
        c.arc(30, 30, 28, 0, Math.PI * 2);
        c.fill();
      });
      /* Een tiental als staaf van 10 hokjes, en een losse als stip (bij de hulp van de getallen). */
      this.canvasPlaatje("mm-staaf", 18, 92, (c) => {
        c.beginPath();
        c.roundRect(2, 2, 14, 88, 5);
        c.fillStyle = "#ffd93d";
        c.fill();
        c.strokeStyle = "#a7790a";
        c.lineWidth = 2;
        c.stroke();
        for (let i = 1; i < 10; i++) {
          c.beginPath();
          c.moveTo(3, 2 + i * 8.8);
          c.lineTo(15, 2 + i * 8.8);
          c.stroke();
        }
      });
      this.bak("mm-staaf", "mm-staaf-g", WARM);
      this.canvasPlaatje("mm-een", 18, 18, (c) => {
        c.beginPath();
        c.arc(9, 9, 7, 0, Math.PI * 2);
        c.fillStyle = "#ffd93d";
        c.fill();
        c.strokeStyle = "#a7790a";
        c.lineWidth = 2;
        c.stroke();
      });
      this.bak("mm-een", "mm-een-g", WARM);
      this.voorbereid(vooraf);
      this.input.on("pointerdown", (p: Ptr) => this.neer(p));
      this.input.on("pointermove", (p: Ptr) => this.beweeg(p));
      this.input.on("pointerup", () => this.los());
      this.input.on("pointerupoutside", () => this.los());
    }

    /* ---------- plaatjes ---------- */

    /** Het vaste plaatje van een ding, één keer per soort, zonder vaste gloed (31 oktober 2026). */
    voorwerp(soort: MMSoort) {
      const sl = `mm-vw-${soort}`;
      this.canvasPlaatje(sl, MM_MAAT, MM_MAAT, (c) => mmTeken(c, soort));
      return sl;
    }

    /** Hetzelfde plaatje mét gebakken gloed: alleen even, op het moment dat het geteld wordt. */
    voorwerpGloed(soort: MMSoort) {
      const sl = this.voorwerp(soort);
      this.bak(sl, `${sl}-g`, mmHex(MM_KLEUR[MM_VASTE_KLEUR[soort]]));
      return `${sl}-g`;
    }

    kaartTex(b: number, h: number, soort: Vak["soort"]) {
      const sl = `mm-kaart-${soort}-${Math.round(b)}x${Math.round(h)}`;
      if (!this.textures.exists(`${sl}-g`)) {
        const rand = soort === "voorbeeld" ? "#ffd36e" : "#9fe9ff";
        this.canvasPlaatje(sl, b, h, (c) => {
          const pad = () => {
            c.beginPath();
            c.roundRect(3, 3, b - 6, h - 6, 22);
          };
          pad();
          c.fillStyle = "rgba(10,40,95,0.55)";
          c.fill();
          c.save();
          pad();
          c.clip();
          c.strokeStyle = "rgba(190,240,255,0.07)";
          c.lineWidth = 1;
          for (let y = 0; y < h; y += 6) {
            c.beginPath();
            c.moveTo(0, y);
            c.lineTo(b, y);
            c.stroke();
          }
          c.restore();
          pad();
          c.strokeStyle = rand;
          c.lineWidth = 3;
          c.stroke();
        });
        this.bak(sl, `${sl}-g`, soort === "voorbeeld" ? WARM : WERELDKLEUR.oceaan);
      }
      return `${sl}-g`;
    }

    /** Een zacht vak achter een kaart (zoals de keuzevakken van de geldles); het voorbeeld bovenaan in een warm vak met een dun randje (herstel 7 november). */
    vakTex(b: number, h: number, soort: Vak["soort"]) {
      const sl = `mm-vak-${soort}-${Math.round(b)}x${Math.round(h)}`;
      this.canvasPlaatje(sl, b, h, (c) => {
        c.beginPath();
        c.roundRect(4, 4, b - 8, h - 8, 30);
        c.fillStyle = soort === "voorbeeld" ? "rgba(255,211,110,0.14)" : "rgba(207,227,255,0.15)";
        c.fill();
        if (soort === "voorbeeld") {
          c.strokeStyle = "rgba(255,211,110,0.75)";
          c.lineWidth = 3;
          c.stroke();
        }
      });
      return sl;
    }

    slotTex(b: number, h: number) {
      const sl = `mm-slot-${Math.round(b)}x${Math.round(h)}`;
      this.canvasPlaatje(sl, b, h, (c) => {
        c.beginPath();
        c.roundRect(4, 4, b - 8, h - 8, 22);
        c.fillStyle = "rgba(20,60,120,0.3)";
        c.fill();
        c.setLineDash([12, 9]);
        c.strokeStyle = "rgba(190,240,255,0.85)";
        c.lineWidth = 3;
        c.stroke();
      });
      return sl;
    }

    dingTex(ding: MMDing, n: number) {
      const sl = `mm-${ding}-${n}`;
      this.canvasPlaatje(sl, DING_B, DING_H, (c) => mmTekenDing(c, ding, n));
      return sl;
    }

    doosTex(b: number, h: number) {
      const sl = `mm-doos-${Math.round(b)}x${Math.round(h)}`;
      this.canvasPlaatje(sl, b, h, (c) => mmDoos(c, b, h));
      return sl;
    }

    /* ---------- de opgave ---------- */

    leeg() {
      for (const st of this.stukken) this.verdwijn(st.box);
      for (const x of this.overig) this.verdwijn(x as Box);
      for (const x of this.slotBeelden) x.destroy();
      this.staven(false);
      this.wijs(null);
      for (const rj of this.rondjes.values()) rj.vergeet();
      this.rondjes.clear();
      this.rondjeTok.clear();
      this.vinger?.destroy();
      this.vinger = null;
      this.stukken = [];
      this.overig = [];
      this.slotBeelden = [];
      this.sleep = null;
      this.bezig = false;
    }

    zetStaand(staand: boolean) {
      this.staand = staand;
    }

    zetOpgave(o: MMOpgave | null) {
      if (o && this.o && o.id === this.o.id) return;
      this.leeg();
      this.o = o;
      this.ind = o ? mmIndeling(o, this.staand) : null;
      const ind = this.ind;
      if (!o || !ind) return;
      ind.sloten.forEach((r) => {
        const m = midden(r);
        this.slotBeelden.push(this.plaats(this.slotTex(r.b, r.h), m.x, m.y).setDepth(-2));
      });
      if (ind.getalkaart) {
        const g = ind.getalkaart;
        const m = midden(g);
        const kaart = this.plaats(this.kaartTex(g.b, g.h, "voorbeeld"), m.x, m.y);
        this.overig.push(kaart);
        this.tover(kaart);
      }
      const groepen = o.soort === "tel" ? [o.groep] : o.soort === "kaarten" ? [...(o.voorbeeld ? [o.voorbeeld] : []), ...o.kaarten] : o.soort === "volgorde" ? o.kaarten : [];
      ind.vakken.forEach((vak, i) => {
        const m = midden(vak);
        const box = this.add.container(m.x, m.y);
        const items: Img[] = [];
        if (vak.soort === "ding") box.add(this.plaats(this.dingTex((o as { ding: MMDing }).ding, vak.getal ?? 0), 0, 0));
        else {
          /* Herstel 7 november (Sara): elke kaart in een eigen zacht vak, het voorbeeld in een warm vak; zo zie je wat de vraag is en wat de keuzes zijn. */
          if (vak.soort === "kaart" || vak.soort === "voorbeeld") box.add(this.plaats(this.vakTex(vak.b, vak.h, vak.soort), 0, 0));
          const gp = vak.groep!;
          const groep = groepen[i];
          for (const d of gp.dozen) {
            const doos = this.add.image(d.x + d.b / 2, d.y + d.h / 2, this.doosTex(d.b, d.h)).setScale(1 / TX);
            box.add(doos);
          }
          const sc = (gp.cel * 0.9) / MM_MAAT;
          for (const p of gp.plekken) {
            const img = this.plaats(this.voorwerp(groep.soort), p.x, p.y).setData("soort", groep.soort);
            img.setScale(img.scaleX * sc);
            items.push(img);
            box.add(img);
          }
        }
        this.stukken.push({ box, items, vak, plek: null, mark: null, bordje: null });
        this.tover(box, { vertraging: i * 90 });
      });
      speelLesgeluid("verschijn");
    }

    zetTel(t: { vak: number; geteld: number } | null) {
      this.stukken.forEach((st, i) => {
        st.items.forEach((img, k) => {
          const aan = !t || t.vak !== i || k < t.geteld;
          img.setAlpha(t && t.vak === i ? (aan ? 1 : 0.28) : 1);
          if (t && t.vak === i && k === t.geteld - 1 && !this.rustig) {
            const sx = img.scaleX;
            this.tweens.add({ targets: img, scaleX: sx * 1.18, scaleY: sx * 1.18, duration: 110, yoyo: true, onComplete: () => img.setScale(sx) });
          }
        });
        /* Het rondje komt precies waar de gloed kwam: om het ene voorwerp dat Bliepo nu telt, 420 ms (niet bij rustig, net als de gloed). */
        const telImg = t && t.vak === i && !this.rustig && t.geteld > 0 ? st.items[t.geteld - 1] : undefined;
        if (telImg) {
          const vak = vakOm([telImg]);
          let rj = this.rondjes.get(st.box);
          if (!rj && vak) {
            rj = maakRondjes(this, st.box, this.rustig);
            this.rondjes.set(st.box, rj);
          }
          const tok = (this.rondjeTok.get(st.box) ?? 0) + 1;
          this.rondjeTok.set(st.box, tok);
          if (vak && rj) {
            rj.zet(new Map<string, RondjeVak>([[`tel-${t!.geteld - 1}`, vak]]));
            this.time.delayedCall(420, () => {
              if (this.rondjeTok.get(st.box) === tok) rj!.zet(new Map());
            });
          }
        }
      });
    }

    zetActief(aan: boolean) {
      this.actief = aan;
      if (aan) this.bezig = false;
    }

    /** De voorwerpen van één kaart lichten op in `kleur` (gebakken gloed); `ms` = daarna weer gewoon. */
    lichtOpKaart(st: Stuk, kleur: number | null, ms = 0) {
      for (const img of st.items) {
        const soort = img.getData("soort") as MMSoort | undefined;
        if (!soort || !img.active) continue;
        const sl = this.voorwerp(soort);
        let doel = sl;
        if (kleur !== null) {
          doel = `${sl}-g${kleur.toString(16)}`;
          this.bak(sl, doel, kleur);
        }
        img.setTexture(doel);
      }
      if (kleur !== null && ms > 0) this.time.delayedCall(ms, () => this.lichtOpKaart(st, null));
    }

    /** Goed of fout: de voorwerpen lichten op (geen rand om de kaart). */
    rand(st: Stuk, kleur: number) {
      st.mark?.destroy();
      st.mark = null;
      this.lichtOpKaart(st, kleur);
    }

    /** Tikken op een kaart: even oplichten. */
    lichtOp(vak: number) {
      const st = this.kaartStuk(vak);
      if (st) this.lichtOpKaart(st, WARM, 450);
    }

    goed(vak: number) {
      const lijst = vak < 0 ? this.stukken.filter((st) => st.plek !== null) : [this.kaartStuk(vak)].filter((st): st is Stuk => !!st);
      lijst.forEach((st, k) => {
        /* De voorwerpen lichten meteen op (zoals bij fout); de lichtgolf volgt per kaart. */
        this.rand(st, GOED);
        this.time.delayedCall(this.rustig ? 0 : k * 160, () => this.golf(st.box.x, st.box.y, GOED));
      });
    }

    /** De k-de kaart om op te tikken (zonder de voorbeeldgroep). */
    kaartStuk(k: number): Stuk | undefined {
      return this.stukken.filter((st) => st.vak.soort !== "voorbeeld")[k];
    }

    fout(vak: number) {
      const st = this.kaartStuk(vak);
      if (!st) return;
      this.rand(st, 0xff7b8b);
      this.schud(st.box);
    }

    wisMarken() {
      for (const st of this.stukken) {
        st.mark?.destroy();
        st.mark = null;
        this.lichtOpKaart(st, null);
      }
    }

    /** Zet de kaarten in de goede volgorde in de vakjes (het goede antwoord laten zien). */
    zetOp(lijst: number[] | null) {
      if (!lijst || !this.ind) return;
      lijst.forEach((i, p) => {
        const st = this.stukken[i];
        if (st) this.leg(st, p);
      });
    }

    plekGoed(lijst: boolean[] | null) {
      if (!lijst) return;
      for (const st of this.stukken) if (st.plek !== null && lijst[st.plek]) this.rand(st, GOED);
    }

    /** Hoeveel er op elke kaart staan: een rond bordje op de hoek (beweegt mee met de kaart). */
    bordjes(lijst: (number | null)[] | null) {
      this.stukken.forEach((st, i) => {
        const n = lijst?.[i];
        if (st.bordje && st.bordje.getData("n") === n) return;
        st.bordje?.destroy();
        st.bordje = null;
        if (n === null || n === undefined) return;
        /* Op een kaart om op te tikken: op de hoek. Bij op volgorde zetten: midden boven, zodat het niet over de kaart ernaast valt. */
        const opVolgorde = !!this.ind?.sloten.length;
        const r = opVolgorde ? 30 : 36;
        const rondje = this.add.graphics();
        rondje.fillStyle(0x1d2a66, 1);
        rondje.fillCircle(0, 0, r);
        rondje.lineStyle(4, 0xffe27a, 1);
        rondje.strokeCircle(0, 0, r);
        const tekst = this.add
          .text(0, 1, String(n), { fontFamily: '"Work Sans", system-ui, sans-serif', fontSize: opVolgorde ? "34px" : "40px", fontStyle: "800", color: "#ffe27a" })
          .setOrigin(0.5)
          .setResolution(2);
        /* De voorbeeldgroep staat helemaal bovenaan: daar komt het bordje binnen de hoek. */
        const binnenHoek = st.vak.soort === "voorbeeld" ? 30 : 0;
        const b = this.add
          .container(opVolgorde ? 0 : st.vak.b / 2 - 14 - binnenHoek, opVolgorde ? -st.vak.h / 2 - 4 : -st.vak.h / 2 + 14 + binnenHoek, [rondje, tekst])
          .setData("n", n);
        st.box.add(b);
        st.bordje = b;
        if (!this.rustig) {
          b.setScale(0.4);
          this.tweens.add({ targets: b, scale: 1, duration: 260, ease: "Back.easeOut" });
        }
      });
    }

    terugNaarHuis() {
      this.wisMarken();
      for (const st of this.stukken) {
        st.plek = null;
        const m = midden(st.vak);
        st.box.setDepth(0);
        this.tweens.add({ targets: st.box, x: m.x, y: m.y, duration: this.rustig ? 1 : 260, ease: "Cubic.easeOut" });
      }
      this.bezig = false;
      this.meldTest();
    }

    staven(aan: boolean) {
      for (const x of this.staafBeelden) x.destroy();
      this.staafBeelden = [];
      this.staafGroepen = [];
      this.wijs(null);
      const o = this.o;
      if (!aan || !o || o.soort !== "getallen") return;
      this.stukken.forEach((st, i) => {
        const n = o.getallen[i];
        const tien = Math.floor(n / 10);
        const een = n % 10;
        const m = midden(st.vak);
        const y = st.vak.y + st.vak.h + 12;
        const eenKol = Math.ceil(een / 5);
        const breed = tien * 20 + (een ? 10 + eenKol * 20 : 0);
        let x = m.x - breed / 2 + 9;
        const groep: Img[] = [];
        this.staafGroepen[i] = groep;
        for (let k = 0; k < tien; k++, x += 20) {
          const b = this.plaats("mm-staaf-g", x, y + 46);
          groep.push(b);
          this.staafBeelden.push(b);
          this.tover(b, { vertraging: i * 300 + k * 60 });
        }
        if (een) x += 10;
        for (let k = 0; k < een; k++) {
          const b = this.plaats("mm-een-g", x + Math.floor(k / 5) * 20, y + 9 + (k % 5) * 18.5);
          groep.push(b);
          this.staafBeelden.push(b);
          this.tover(b, { vertraging: i * 300 + tien * 60 + k * 40 });
        }
        const getal = this.add
          .text(m.x, y + 124, String(n), { fontFamily: '"Work Sans", system-ui, sans-serif', fontSize: "30px", fontStyle: "800", color: "#ffffff" })
          .setOrigin(0.5)
          .setResolution(2);
        this.staafBeelden.push(getal);
      });
    }

    /** Het rondje om 1 staaf ("staaf") of om alle staven en blokjes onder één potje ("staven-<i>"); null = weg. Altijd maar één. */
    wijs(w: string | null) {
      if (!w) {
        this.wijsRondje?.zet(new Map());
        return;
      }
      let vak: RondjeVak | null = null;
      if (w === "staaf") {
        const eerste = this.staafGroepen.map((g) => g?.[0]).find((b) => b && Math.floor((this.o as { getallen?: number[] } | null)?.getallen?.[this.staafGroepen.findIndex((g) => g?.[0] === b)] ?? 0) >= 10);
        vak = eerste ? vakOm([eerste]) : null;
      } else if (w.startsWith("staven-")) {
        vak = vakOm(this.staafGroepen[Number(w.slice(7))] ?? []);
      }
      if (!vak) return;
      if (!this.wijsRondje) this.wijsRondje = maakRondjes(this, this.add.container(0, 0).setDepth(25), this.rustig);
      this.wijsRondje.zet(new Map<string, RondjeVak>([[w, vak]]));
    }

    hand(aan: boolean) {
      this.vinger?.destroy();
      this.vinger = null;
      const ind = this.ind;
      if (!aan || !ind || !ind.sloten.length || this.rustig) return;
      const van = midden(this.stukken[0].vak);
      const naar = midden(ind.sloten[0]);
      const v = this.plaats("mm-vinger", van.x, van.y).setDepth(20).setAlpha(0);
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

    /* ---------- op volgorde zetten ---------- */

    zetTest(lijst: string[] | null) {
      this.test = lijst;
      this.meldTest();
    }

    /** Voor de automatische test: het volgende goede ding (window.__phaser.antwoord). */
    meldTest() {
      const t = this.test;
      if (!t || typeof window === "undefined") return;
      const ind = this.ind;
      if (!ind) return;
      const inSlot = ind.sloten.map((_, p) => this.stukken.findIndex((st) => st.plek === p));
      const k = inSlot.findIndex((i, p) => i < 0 || `ding-${i}` !== t[p]);
      window.__phaser = { ...window.__phaser, antwoord: k < 0 ? null : t[k] };
    }

    leg(st: Stuk, p: number | null) {
      const ind = this.ind;
      if (!ind) return;
      if (p !== null) {
        /* Staat er al iets in dat vakje, dan gaat dat terug naar beneden. */
        const oud = this.stukken.find((x) => x !== st && x.plek === p);
        if (oud) this.leg(oud, null);
      }
      st.plek = p;
      const doel = p === null ? midden(st.vak) : midden(ind.sloten[p]);
      st.box.setDepth(p === null ? 0 : 5);
      this.tweens.add({ targets: st.box, x: doel.x, y: doel.y, duration: this.rustig ? 1 : 180, ease: "Cubic.easeOut" });
    }

    /** Na elke zet: alle vakjes vol? Dan melden. */
    naZet() {
      speelLesgeluid("tik");
      this.meldTest();
      const ind = this.ind;
      if (!ind) return;
      const rij = ind.sloten.map((_, p) => this.stukken.findIndex((st) => st.plek === p));
      if (rij.every((i) => i >= 0)) {
        this.bezig = true;
        this.time.delayedCall(this.rustig ? 1 : 260, () => this.melder({ soort: "volgorde", rij }));
      }
    }

    tik(i: number) {
      const st = this.stukken[i];
      const ind = this.ind;
      if (!st || !ind || !ind.sloten.length || !this.actief || this.bezig) return;
      this.hand(false);
      if (st.plek !== null) this.leg(st, null);
      else {
        const vrij = ind.sloten.findIndex((_, p) => !this.stukken.some((x) => x.plek === p));
        if (vrij < 0) return;
        this.leg(st, vrij);
      }
      this.naZet();
    }

    /** Waar de vinger is, in punten van het vlak (uit de echte gebeurtenis en de plek van het canvas nu). */
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

    stukOp(x: number, y: number): Stuk | null {
      if (!this.ind?.sloten.length) return null;
      return [...this.stukken].reverse().find((st) => Math.abs(x - st.box.x) <= st.vak.b / 2 && Math.abs(y - st.box.y) <= st.vak.h / 2) ?? null;
    }

    neer(p: Ptr) {
      if (!this.actief || this.bezig) return;
      const w = this.waar(p);
      const st = this.stukOp(w.x, w.y);
      if (!st) return;
      this.sleep = { st, dx: w.x - st.box.x, dy: w.y - st.box.y, x0: w.x, y0: w.y, bewogen: false };
      st.box.setDepth(10);
    }

    beweeg(p: Ptr) {
      const sl = this.sleep;
      if (!sl) return;
      const w = this.waar(p);
      if (!sl.bewogen) {
        if (Math.hypot(w.x - sl.x0, w.y - sl.y0) < 8) return;
        sl.bewogen = true;
        this.hand(false);
      }
      sl.st.box.setPosition(w.x - sl.dx, w.y - sl.dy);
    }

    los() {
      const sl = this.sleep;
      const ind = this.ind;
      if (!sl || !ind) return;
      this.sleep = null;
      const st = sl.st;
      if (!sl.bewogen) return this.tik(this.stukken.indexOf(st));
      /* Het dichtstbijzijnde vakje, als de kaart er ongeveer op ligt; anders terug naar beneden. */
      let beste = -1;
      let afstand = Infinity;
      ind.sloten.forEach((r, p) => {
        const m = midden(r);
        const d = Math.hypot(st.box.x - m.x, st.box.y - m.y);
        if (d < afstand) {
          afstand = d;
          beste = p;
        }
      });
      this.leg(st, afstand < Math.max(st.vak.b, st.vak.h) * 0.7 ? beste : null);
      this.naZet();
    }

    sleepPunt() {
      if (!this.actief || !this.ind?.sloten.length) return null;
      const r = this.game.canvas.getBoundingClientRect();
      const f = r.width / VLAK_B;
      if (this.sleep) return { x: r.left + (this.sleep.st.box.x + this.sleep.dx) * f, y: r.top + (this.sleep.st.box.y + this.sleep.dy) * f };
      const st = this.stukken.find((x) => x.plek === null);
      if (!st) return null;
      return { x: r.left + st.box.x * f, y: r.top + st.box.y * f };
    }

    /**
     * Voor `npm run vloeiend`: wat er nu in beeld staat verschijnt opnieuw, een
     * kaart schuift heen en weer en er komt een lichtgolf. Zonder nieuwe
     * plaatjes (die zijn vooraf gebakken).
     */
    demo(ms: number) {
      const eind = performance.now() + ms;
      let k = 0;
      const stap = () => {
        if (performance.now() > eind || !this.stukken.length) return;
        const st = this.stukken[k++ % this.stukken.length];
        this.tover(st.box);
        this.time.delayedCall(450, () => this.tweens.add({ targets: st.box, y: st.box.y - 40, duration: 350, yoyo: true, ease: "Sine.easeInOut" }));
        this.time.delayedCall(900, () => this.golf(st.box.x, st.box.y, GOED));
        this.time.delayedCall(1100, stap);
      };
      stap();
    }

    /* ---------- vooraf bakken ---------- */

    /**
     * Alle plaatjes van de les vooraf bakken, vóór het eerste beeld (in `maak`),
     * zodat er bij een nieuwe vraag niets gebakken hoeft te worden: geen
     * hapering terwijl er iets verschijnt of beweegt (HARDE REGEL 7).
     */
    voorbereid(lijst: MMOpgave[]) {
      const gepland = new Set<string>();
      const plan = (sl: string, f: () => void) => {
        if (gepland.has(sl)) return;
        gepland.add(sl);
        f();
      };
      for (const o of lijst)
        for (const ind of o.soort === "volgorde" ? [mmIndeling(o), mmIndeling(o, true)] : [mmIndeling(o)]) {
        for (const r of ind.sloten) plan(`slot-${r.b}x${r.h}`, () => this.slotTex(r.b, r.h));
        if (ind.getalkaart) {
          const g = ind.getalkaart;
          plan(`kaart-voorbeeld-${g.b}x${g.h}`, () => this.kaartTex(g.b, g.h, "voorbeeld"));
        }
        const groepen = o.soort === "tel" ? [o.groep] : o.soort === "kaarten" ? [...(o.voorbeeld ? [o.voorbeeld] : []), ...o.kaarten] : o.soort === "volgorde" ? o.kaarten : [];
        ind.vakken.forEach((vak, i) => {
          if (vak.soort === "ding" && o.soort === "getallen") plan(`ding-${o.ding}-${vak.getal}`, () => this.dingTex(o.ding, vak.getal ?? 0));
          if (vak.soort === "kaart" || vak.soort === "voorbeeld") plan(`kaart-${vak.soort}-${vak.b}x${vak.h}`, () => this.kaartTex(vak.b, vak.h, vak.soort));
          if (vak.soort === "kaart" || vak.soort === "voorbeeld") plan(`vak-${vak.soort}-${vak.b}x${vak.h}`, () => this.vakTex(vak.b, vak.h, vak.soort));
          const gp = vak.groep;
          if (!gp) return;
          for (const d of gp.dozen) plan(`doos-${Math.round(d.b)}x${Math.round(d.h)}`, () => this.doosTex(d.b, d.h));
          plan(`v-${groepen[i].soort}`, () => this.voorwerp(groepen[i].soort));
          plan(`vg-${groepen[i].soort}`, () => this.voorwerpGloed(groepen[i].soort));
        });
      }
    }
  }
  return MM as unknown as new () => import("phaser").Scene;
}

/* ---------- het vlak ---------- */

export function SqulaMeerMinder({
  opgave,
  actief = false,
  tel = null,
  bordjes = null,
  goed = null,
  fout = null,
  plekGoed = null,
  zetOp = null,
  ronde = 0,
  staven = false,
  wijs = null,
  hand = false,
  test = null,
  vooraf,
  meld,
  schaal,
}: MMProps & Vlakbasis) {
  /* De motor maakt de scène één keer, met alle opgaven van de les (die worden vooraf gebakken). */
  const { plek, scene } = useHoloMotor<MMScene>(schaal, (Phaser, rustig) => maakScene(Phaser, rustig, vooraf ?? []), { invoer: true });
  const sleutel = opgave ? JSON.stringify(opgave) : "";
  /* Een staand scherm (telefoon rechtop): op volgorde zetten krijgt dan hoge kaarten met grotere voorwerpen (herstel ronde 2, 7 november). */
  const staand = typeof window !== "undefined" && window.innerHeight > window.innerWidth;
  const ind = useMemo(() => (sleutel ? mmIndeling(JSON.parse(sleutel) as MMOpgave, staand) : null), [sleutel, staand]);

  useEffect(() => {
    scene?.verbind(meld);
  }, [scene, meld]);

  /* Vóór de opgave: de scène moet weten of het scherm staat als hij de kaarten neerzet. */
  useEffect(() => {
    scene?.zetStaand(staand);
  }, [scene, staand]);


  useEffect(() => {
    scene?.zetOpgave(sleutel ? (JSON.parse(sleutel) as MMOpgave) : null);
  }, [scene, sleutel]);

  const telVak = tel?.vak ?? -1;
  const telGeteld = tel?.geteld ?? 0;
  useEffect(() => {
    scene?.zetTel(telVak < 0 ? null : { vak: telVak, geteld: telGeteld });
  }, [scene, telVak, telGeteld, sleutel]);

  useEffect(() => {
    scene?.zetActief(actief);
    if (!scene) return;
    /* Voor `npm run vloeiend`: alleen slepen als er iets te slepen is. */
    if (actief && ind?.sloten.length) window.__phaser = { ...window.__phaser, sleepPunt: () => scene.sleepPunt() as { x: number; y: number } };
    else if (window.__phaser) delete window.__phaser.sleepPunt;
  }, [scene, actief, ind]);

  const goedKeer = goed?.keer ?? 0;
  const goedVak = goed?.vak ?? 0;
  useEffect(() => {
    if (scene && goedKeer > 0) scene.goed(goedVak);
  }, [scene, goedKeer, goedVak]);

  const foutKeer = fout?.keer ?? 0;
  const foutVak = fout?.vak ?? 0;
  useEffect(() => {
    if (scene && foutKeer > 0) scene.fout(foutVak);
  }, [scene, foutKeer, foutVak]);

  const plekSleutel = plekGoed ? plekGoed.join(",") : "";
  useEffect(() => {
    scene?.plekGoed(plekSleutel ? plekSleutel.split(",").map((x) => x === "true") : null);
  }, [scene, plekSleutel]);

  const zetOpSleutel = zetOp ? zetOp.join(",") : "";
  useEffect(() => {
    scene?.zetOp(zetOpSleutel ? zetOpSleutel.split(",").map(Number) : null);
  }, [scene, zetOpSleutel]);

  useEffect(() => {
    if (scene && ronde > 0) scene.terugNaarHuis();
  }, [scene, ronde]);

  const bordSleutel = bordjes ? bordjes.join(",") : "";
  useEffect(() => {
    scene?.bordjes(bordSleutel ? bordSleutel.split(",").map((x) => (x === "" ? null : Number(x))) : null);
  }, [scene, bordSleutel, sleutel]);

  useEffect(() => {
    scene?.staven(staven);
  }, [scene, staven, sleutel]);

  useEffect(() => {
    scene?.wijs(wijs);
  }, [scene, wijs, staven, sleutel]);

  useEffect(() => {
    scene?.hand(hand);
  }, [scene, hand, sleutel]);

  const testSleutel = test ? test.join("|") : "";
  useEffect(() => {
    scene?.zetTest(testSleutel ? testSleutel.split("|") : null);
  }, [scene, testSleutel, sleutel]);

  const o = sleutel ? (JSON.parse(sleutel) as MMOpgave) : null;
  const tikbaar = o?.soort === "kaarten" && ind ? ind.vakken.map((v, i) => ({ v, i })).filter((x) => x.v.soort === "kaart") : [];
  const sleepbaar = (o?.soort === "volgorde" || o?.soort === "getallen") && ind ? ind.vakken : [];

  /* Samen tellen bij één groep: het getal tot dan toe achter elke getelde rij. */
  const rijgetallen =
    o?.soort === "tel" && ind && tel && tel.vak === 0
      ? ind.vakken[0].groep!.rijen.filter((r) => r.eind <= tel.geteld).map((r) => ({ ...r, x: r.x + midden(ind.vakken[0]).x, y: r.y + midden(ind.vakken[0]).y }))
      : [];

  return (
    <div className={s.vlak}>
      <div ref={plek} style={HOLO_CANVAS} aria-hidden />
      {ind?.getalkaart && (
        <div className={s.groot} style={{ left: ind.getalkaart.x, top: ind.getalkaart.y, width: ind.getalkaart.b, height: ind.getalkaart.h, fontSize: 104 }}>
          {ind.getalkaart.getal}
        </div>
      )}
      {tikbaar.map(({ v, i }, k) => (
        <button
          key={`${sleutel}-${i}`}
          type="button"
          className={s.kaart}
          style={{ left: v.x, top: v.y, width: v.b, height: v.h }}
          data-ding={`kaart-${k}`}
          disabled={!actief}
          aria-label={`Kaart ${k + 1}`}
          onClick={() => {
            if (!actief) return;
            speelLesgeluid("tik");
            scene?.lichtOp(k);
            meld({ soort: "kaart", vak: k });
          }}
        />
      ))}
      {sleepbaar.map((v, i) => (
        <button
          key={`${sleutel}-${i}`}
          type="button"
          className={s.ding}
          style={{ left: v.x, top: v.y, width: v.b, height: v.h }}
          data-ding={`ding-${i}`}
          disabled={!actief}
          aria-label={v.getal !== undefined ? String(v.getal) : `Kaart ${i + 1}`}
          onClick={() => scene?.tik(i)}
        />
      ))}
      {rijgetallen.map((r) => (
        <div key={`r-${r.eind}`} className={s.rijgetal} style={{ left: r.x, top: r.y }}>
          {r.eind}
        </div>
      ))}
    </div>
  );
}

/* ---------- de kaart aan het eind ---------- */

/** Op de verzamelkaart: twee groepjes appels, een kleine en een grote (244 × 190). */
export function KaartMeerMinder() {
  const appel = (x: number, y: number, k: string) => (
    <g key={`${x}-${y}`}>
      <circle cx={x} cy={y} r={11} fill={k} stroke="#ffffff" strokeWidth={2} />
      <rect x={x - 1.5} y={y - 17} width={3} height={7} rx={1.5} fill="#7a4a22" />
    </g>
  );
  const groep = (x0: number, n: number, k: string) =>
    Array.from({ length: n }, (_, i) => appel(x0 + (i % 3) * 28, 152 - Math.floor(i / 3) * 30, k));
  return (
    <>
      <rect x={4} y={168} width={236} height={6} rx={3} fill="#9fe9ff" opacity={0.6} />
      {groep(22, 3, "#ff5c6e")}
      {groep(140, 9, "#5fd877")}
    </>
  );
}
