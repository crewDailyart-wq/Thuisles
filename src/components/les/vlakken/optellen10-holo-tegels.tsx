"use client";

/**
 * Het tegelvlak van Optellen tot 10 als hologrammen in Phaser (27 oktober
 * 2026, BOUWEN-PHASER.md; LESSENPLAN.md O1–O6 en S4). Eén gedeeld vlak voor
 * alle lessen van dit onderdeel met getaltegels; het vervangt zowel het oude
 * tegelvlak (`optellen-tegelvlak.tsx`, blijft staan) als het ingebouwde
 * tegelraster van het lesscherm (`l.bak/l.pak/l.leg/l.tel/l.draai`).
 *
 * Wat er in beeld staat, vóór de blauwe ruimte (geen bord, geen eigen
 * achtergrond):
 * - een dun hologram-rooster van lichtlijnen als werkvlak (links/midden);
 * - de getaltegels in een rij rechts ("de bak", in rijtjes van drie), om uit
 *   te slepen of aan te tikken en dan in het rooster te tikken;
 * - torens van tegels in het rooster, met wat de oude tegelvlakken ook
 *   konden: bedekken (`onder`), een lege vorm vullen (`omtrek`), een rand om
 *   de toren, samen tellen (nummers op de hokjes), een schaduw van de tegel
 *   als hulp (`hint`) en omdraaien (`draai`);
 * - de som groot bovenaan in het midden, met een oplichtend vakje (`somAan`).
 *   Het kind typt het getal in het echte invulvak van het lesscherm
 *   (`l.getal()`, HARDE REGEL 5); het vakje vult zich daarna.
 *
 * De getaltegels zijn voorlopig die van Synthesis (twee hokjes breed, een gat
 * in elk hokje, de kleuren uit `tegels.ts`) — LATER VERVANGEN door
 * parelplanken (vragen-voor-later/later-vervangen/optellen10.md).
 *
 * Gloed: alleen via `bak()` en de effecten van `holo/basis.ts` (één keer
 * gebakken, centrale sterkte). Gekozen tegel: `selectieRing`. Goed: `golf`.
 *
 * Meldt `{ soort: "tegel", n }` als het kind een tegel in het rooster zet
 * (alleen als `actief` aan staat; anders glijdt hij terug), `{ soort: "leeg" }`
 * bij de knop Leegmaken en `{ soort: "hulp" }` bij het handje.
 * Schrijft niets naar de database.
 */

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { Somdeel, Vlakbasis, Vlakgebeurtenis } from "../soort";
import { getalkleur, hoogte, stapel, TEGELKLEUR, vorm, type Hokje } from "../tegels";
import { holoBasis, TX, VLAK_B, VLAK_H, type PhaserModule } from "../holo/basis";
import { HOLO_CANVAS, useHoloMotor } from "../holo/motor";
import s from "./optellen10-holo.module.css";

/* ---------- maten (punten van het vlak, 980 × 720) ---------- */

export const CEL = 60;
const KOL = 10;
const RX = 20;
const KOLOM_VAN_TOREN = [4, 7, 1];
const BAK = { x: 650, b: 310 };
/** Zo groot is een tegelplaatje getekend; in de bak wordt hij kleiner gezet. */
const TEKEN_C = CEL;

function rasterMaat(boven: boolean) {
  return boven ? { y: 122, rijen: 9 } : { y: 46, rijen: 10 };
}

/* ---------- soorten ---------- */

export type Tegeltoren = {
  /** Tegels die onderop liggen en bedekt kunnen worden (van onder naar boven). */
  onder?: number[];
  /** Een lege vorm van dit getal, om te vullen. */
  omtrek?: number;
  /** De tegels die erop of erin liggen, van onder naar boven. */
  stukken: number[];
  /** Een lichtblauwe rand om de hele toren (één geheel). */
  rand?: boolean;
  /** De bovenste tegel van `stukken` verdwijnt (animatie). */
  wegLaatste?: boolean;
  /** Een andere kolom dan de vaste volgorde (4, 7, 1). */
  kolom?: number;
};

export type HoloTegelProps = {
  torens: Tegeltoren[];
  bak?: number[];
  /** Alle tegels in de bak omgedraaid, zodat ze in de inham van een oneven tegel passen. */
  om?: boolean;
  slot?: number[];
  /** Het kind mag een tegel neerzetten. */
  actief?: boolean;
  som?: Somdeel[] | null;
  /** Dit vakje van de som licht op: hier hoort het getal dat het kind nu typt. */
  somAan?: number | null;
  /** `false`: geen rooster, alleen de som groot in het midden. */
  raster?: boolean;
  /**
   * Samen tellen: de hokjes van toren `toren` (of van alle torens achter
   * elkaar) krijgen een nummer, tot en met `tot`. `onbedekt`: alleen wat van
   * de onderlaag nog te zien is.
   */
  tel?: { toren: number | "alle"; tot: number; onbedekt?: boolean } | null;
  /** De knop Leegmaken. */
  leegKnop?: boolean;
  /** Hulp: een doorschijnende schaduw van tegel `n` op de plek waar hij op toren `toren` hoort. */
  hint?: { toren: number; n: number } | null;
  /** Het handje (hulp vragen): meldt `{ soort: "hulp" }`. */
  hulpKnop?: boolean;
  /**
   * Teken het handje in het vlak zelf (de oude plek). Standaard uit: het
   * staat als vraagteken op de vaste plek onder de zin van Bliepo (28 oktober 2026).
   */
  knoppenInVlak?: boolean;
  /**
   * Uitzondering: het handje blijft in het vlak als er tegelijk een vraag met
   * een eigen vraagteken ("Weet ik niet") of Ja/Nee op de vaste plek staat;
   * daar kan het handje er niet naast. Zie het verslag van 28 oktober 2026.
   */
  hulpInVlak?: boolean;
  /** Toren `toren` draait om (de bovenste tegel komt onder). Een nieuw `nr` = nog een keer. */
  draai?: { toren: number; nr: number } | null;
  /** Een lichtgolf over toren `toren` (goed). Een nieuw `nr` = nog een keer. */
  golf?: { toren: number; nr: number } | null;
  /** Het handje dat laat zien hoe je een tegel naar het rooster sleept. */
  hand?: boolean;
};

/**
 * Een nieuwe tegel bij de stukken, zonder gat: eerst alle even tegels, dan
 * de oneven. Twee oneven tegels vallen zo in elkaars inham, en de toren heeft
 * dezelfde vorm als de tegel van zijn totaal (4 + 3 ziet eruit als de 7).
 * (Zelfde regel als in het oude tegelvlak.)
 */
export function zetIn(stukken: number[], n: number): number[] {
  const alle = [...stukken, n];
  return [...alle.filter((t) => t % 2 === 0), ...alle.filter((t) => t % 2 === 1)];
}

const sleutel = (h: Hokje) => `${h.k}-${h.r}`;
type Geplaatst = Hokje & { n: number };
const geplaatst = (stukken: number[]): Geplaatst[][] => stapel(stukken).map((hokjes, i) => hokjes.map((h) => ({ ...h, n: stukken[i] })));

function torenHoogte(t: Tegeltoren): number {
  const rijen = [...stapel(t.onder ?? []).flat(), ...(t.omtrek ? vorm(t.omtrek) : []), ...stapel(t.stukken).flat()].map((h) => h.r + 1);
  return Math.max(1, ...rijen);
}

/* ---------- de bak: tegels in rijtjes van drie, onderkant gelijk ---------- */

type Bakplek = { n: number; x: number; y: number; b: number; h: number; vak: { x: number; y: number; b: number; h: number } };

export function legBak(tegels: number[], boven: boolean) {
  const rijen: number[][] = [];
  for (let i = 0; i < tegels.length; i += 3) rijen.push(tegels.slice(i, i + 3));
  const top = boven ? 122 : 46;
  const onder = 684;
  const gat = 22;
  const hokRijen = rijen.reduce((a, r) => a + Math.max(...r.map(hoogte)), 0);
  const c = Math.max(18, Math.min(44, Math.floor((onder - top - gat * Math.max(0, rijen.length - 1)) / Math.max(1, hokRijen))));
  const totaal = hokRijen * c + gat * Math.max(0, rijen.length - 1);
  let y = top + (onder - top - totaal) / 2;
  const kolB = BAK.b / 3;
  const plekken: Bakplek[] = [];
  for (const rij of rijen) {
    const rh = Math.max(...rij.map(hoogte)) * c;
    rij.forEach((n, j) => {
      const cx = BAK.x + BAK.b / 2 + (j - (rij.length - 1) / 2) * kolB;
      const h = hoogte(n) * c;
      plekken.push({ n, x: cx, y: y + rh - h / 2, b: 2 * c, h, vak: { x: cx - kolB / 2, y: y - gat / 2, b: kolB, h: rh + gat } });
    });
    y += rh + gat;
  }
  return { c, plekken, midden: { x: BAK.x + BAK.b / 2, y: top + (onder - top) / 2 } };
}

/* ---------- tekenen op canvas (één keer) ---------- */

function hex(n: number) {
  return TEGELKLEUR[n] ?? "#cccccc";
}

function tekenHokje(c: CanvasRenderingContext2D, x: number, y: number, m: number, kleur: string) {
  const i = 2.5;
  c.save();
  c.beginPath();
  c.roundRect(x + i, y + i, m - 2 * i, m - 2 * i, m * 0.12);
  c.globalAlpha = 0.84;
  c.fillStyle = kleur;
  c.fill();
  c.globalAlpha = 1;
  const g = c.createLinearGradient(0, y, 0, y + m);
  g.addColorStop(0, "rgba(255,255,255,0.34)");
  g.addColorStop(0.45, "rgba(255,255,255,0.05)");
  g.addColorStop(1, "rgba(0,0,0,0.14)");
  c.fillStyle = g;
  c.fill();
  c.lineWidth = 2;
  c.strokeStyle = "rgba(255,255,255,0.6)";
  c.stroke();
  /* het gat in het midden, zoals op de getaltegel */
  c.beginPath();
  c.arc(x + m / 2, y + m / 2, m * 0.18, 0, Math.PI * 2);
  c.fillStyle = "rgba(6,16,44,0.8)";
  c.fill();
  c.lineWidth = 1.5;
  c.strokeStyle = "rgba(220,245,255,0.65)";
  c.stroke();
  c.restore();
}

/* ---------- de scène ---------- */

type Stand = Required<Pick<HoloTegelProps, "torens" | "bak" | "om" | "slot" | "actief" | "raster">> & {
  boven: boolean;
  tel: HoloTegelProps["tel"];
  hint: HoloTegelProps["hint"];
};

interface TegelScene {
  zetStand(st: Stand): void;
  draaiToren(i: number): void;
  golfToren(i: number): void;
  sleepPunt(): { x: number; y: number } | null;
  /** Waar tegel `n` in de bak ligt (of, met null, het midden van het rooster), in pixels van de pagina. */
  punt(n: number | null): { x: number; y: number } | null;
  /** Wat de scène meldt, en wat er gebeurt als het kind het vlak aanraakt. */
  verbind(melder: (g: Vlakgebeurtenis) => void, aangeraakt: () => void): void;
}

function maakTegelScene(Phaser: PhaserModule, rustig: boolean) {
  const Basis = holoBasis(Phaser, rustig);
  type Img = import("phaser").GameObjects.Image;
  type Box = import("phaser").GameObjects.Container;
  type Ptr = import("phaser").Input.Pointer;

  class Tegels extends Basis implements TegelScene {
    melder: (g: Vlakgebeurtenis) => void = () => {};
    aangeraakt: () => void = () => {};
    st: Stand | null = null;
    rooster: Img | null = null;
    roosterRijen = 0;
    bakBox: Box | null = null;
    bakPlekken: Bakplek[] = [];
    bakC = 44;
    bakSleutel = "";
    bakOm = false;
    torenBoxen: Box[] = [];
    torenMidden: { x: number; y: number }[] = [];
    vorigeStukken: number[][] = [];
    vorigeOnder: string[] = [];
    gekozen: number | null = null;
    ring: Img | null = null;
    sleep: null | { n: number; x0: number; y0: number; spook: Img | null } = null;
    laatsteDrop: null | { n: number; x: number; y: number; t: number } = null;

    constructor() {
      super("optellen10-tegels");
    }

    verbind(melder: (g: Vlakgebeurtenis) => void, aangeraakt: () => void) {
      this.melder = melder;
      this.aangeraakt = aangeraakt;
    }

    maak() {
      for (let n = 1; n <= 10; n++) {
        const kl = hex(n);
        const kleur = Phaser.Display.Color.HexStringToColor(kl).color;
        /* één hokje (voor de torens) */
        this.canvasPlaatje(`hk-${n}`, CEL, CEL, (c) => tekenHokje(c, 0, 0, CEL, kl));
        this.bak(`hk-${n}`, `hkg-${n}`, kleur);
        /* een hele tegel (voor de bak en onder de vinger) */
        const h = hoogte(n);
        this.canvasPlaatje(`tg-${n}`, 2 * TEKEN_C, h * TEKEN_C, (c) => {
          for (const hk of vorm(n)) tekenHokje(c, hk.k * TEKEN_C, (h - 1 - hk.r) * TEKEN_C, TEKEN_C, kl);
        });
        this.bak(`tg-${n}`, `tgg-${n}`, kleur);
      }
      /* nummers bij het samen tellen: een lichte schijf met het getal */
      for (let i = 1; i <= 20; i++) {
        this.canvasPlaatje(`nr-${i}`, 40, 40, (c) => {
          c.beginPath();
          c.arc(20, 20, 17, 0, Math.PI * 2);
          c.fillStyle = "rgba(255,255,255,0.96)";
          c.fill();
          c.fillStyle = "#0a1a3a";
          c.font = `800 ${i >= 10 ? 19 : 22}px "Work Sans", system-ui, sans-serif`;
          c.textAlign = "center";
          c.textBaseline = "middle";
          c.fillText(String(i), 20, 21.5);
        });
        this.bak(`nr-${i}`, `nrg-${i}`, 0xffffff);
      }
      /* de rooster-plaatjes (9 en 10 rijen): stippellijnen van licht */
      for (const rijen of [9, 10]) {
        const b = KOL * CEL + 4;
        const h = rijen * CEL + 4;
        this.canvasPlaatje(`rooster-${rijen}`, b, h, (c) => {
          c.strokeStyle = "rgba(127,233,255,0.2)";
          c.lineWidth = 1;
          c.setLineDash([3, 4]);
          for (let i = 1; i < KOL; i++) {
            c.beginPath();
            c.moveTo(2 + i * CEL, 2);
            c.lineTo(2 + i * CEL, h - 2);
            c.stroke();
          }
          for (let i = 1; i < rijen; i++) {
            c.beginPath();
            c.moveTo(2, 2 + i * CEL);
            c.lineTo(b - 2, 2 + i * CEL);
            c.stroke();
          }
          /* de buitenste lijnen even licht als de rest: geen kader */
          for (const [x1, y1, x2, y2] of [
            [2, 2, b - 2, 2],
            [2, h - 2, b - 2, h - 2],
            [2, 2, 2, h - 2],
            [b - 2, 2, b - 2, h - 2],
          ]) {
            c.beginPath();
            c.moveTo(x1, y1);
            c.lineTo(x2, y2);
            c.stroke();
          }
        });
      }

      this.input.on("pointerdown", (p: Ptr) => this.neer(p));
      this.input.on("pointermove", (p: Ptr) => this.beweeg(p));
      this.input.on("pointerup", (p: Ptr) => this.los(p));
      this.input.on("pointerupoutside", (p: Ptr) => this.los(p));
    }

    /* ---------- waar is wat ---------- */

    rasterRect() {
      const { y, rijen } = rasterMaat(this.st?.boven ?? false);
      return { x: RX, y, b: KOL * CEL, h: rijen * CEL };
    }

    opRaster(x: number, y: number) {
      if (!this.st?.raster) return false;
      const r = this.rasterRect();
      return x >= r.x && x <= r.x + r.b && y >= r.y && y <= r.y + r.h;
    }

    bakplekOp(x: number, y: number): Bakplek | null {
      const st = this.st;
      if (!st) return null;
      return this.bakPlekken.find((p) => !st.slot.includes(p.n) && x >= p.vak.x && x <= p.vak.x + p.vak.b && y >= p.vak.y && y <= p.vak.y + p.vak.h) ?? null;
    }

    sleepPunt() {
      const r = this.game.canvas.getBoundingClientRect();
      const f = r.width / VLAK_B;
      const naar = (x: number, y: number) => ({ x: r.left + x * f, y: r.top + y * f });
      if (this.sleep?.spook) return naar(this.sleep.spook.x, this.sleep.spook.y);
      const p = this.bakPlekken.find((q) => !(this.st?.slot ?? []).includes(q.n));
      return p ? naar(p.x, p.y) : null;
    }

    punt(n: number | null) {
      const r = this.game.canvas.getBoundingClientRect();
      const f = r.width / VLAK_B;
      if (n === null) {
        const q = this.rasterRect();
        return { x: r.left + (q.x + q.b / 2) * f, y: r.top + (q.y + q.h / 2) * f };
      }
      const p = this.bakPlekken.find((q) => q.n === n);
      return p ? { x: r.left + p.x * f, y: r.top + p.y * f } : null;
    }

    /* ---------- slepen en tikken ---------- */

    /**
     * Waar de vinger is, in punten van het vlak. Rechtstreeks uit de echte
     * gebeurtenis en de plek van het canvas op dit moment: het lesscherm
     * schaalt en verschuift het vlak, en Phaser weet dat niet altijd meteen.
     */
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
      const w = this.waar(p);
      this.aangeraakt();
      const plek = this.bakplekOp(w.x, w.y);
      if (plek) {
        this.sleep = { n: plek.n, x0: w.x, y0: w.y, spook: null };
        return;
      }
      /* Eerst een tegel gekozen, dan in het rooster getikt. */
      if (this.gekozen !== null && this.opRaster(w.x, w.y) && this.st?.actief) {
        const n = this.gekozen;
        this.kies(null);
        this.laatsteDrop = { n, x: w.x, y: w.y, t: performance.now() };
        this.melder({ soort: "tegel", n });
      }
    }

    beweeg(p: Ptr) {
      const w = this.waar(p);
      const sl = this.sleep;
      if (!sl) return;
      if (!sl.spook) {
        if (Math.hypot(w.x - sl.x0, w.y - sl.y0) < 8) return;
        this.kies(null);
        sl.spook = this.plaats(`tgg-${sl.n}`, w.x, w.y).setDepth(20);
        if (this.st?.om) sl.spook.setAngle(180);
        this.bakTegel(sl.n)?.setAlpha(0.3);
      }
      sl.spook.setPosition(w.x, w.y);
    }

    los(p: Ptr) {
      const w = this.waar(p);
      const sl = this.sleep;
      if (!sl) return;
      this.sleep = null;
      if (!sl.spook) {
        /* Een tik: de tegel is gekozen (nog eens tikken = niet meer). */
        this.kies(this.gekozen === sl.n ? null : sl.n);
        return;
      }
      const spook = sl.spook;
      if (this.opRaster(w.x, w.y) && this.st?.actief) {
        this.laatsteDrop = { n: sl.n, x: w.x, y: w.y, t: performance.now() };
        this.bakTegel(sl.n)?.setAlpha(1);
        this.tweens.add({ targets: spook, alpha: 0, duration: 160, onComplete: () => spook.destroy() });
        this.melder({ soort: "tegel", n: sl.n });
        return;
      }
      /* Niet aangenomen: hij glijdt terug naar zijn plek. */
      const plek = this.bakPlekken.find((q) => q.n === sl.n);
      if (!plek) {
        spook.destroy();
        return;
      }
      const sc = this.bakC / TEKEN_C / TX;
      this.tweens.add({
        targets: spook,
        x: plek.x,
        y: plek.y,
        scale: sc,
        duration: this.rustig ? 1 : 280,
        ease: "Cubic.easeOut",
        onComplete: () => {
          spook.destroy();
          this.zetBakAlpha();
        },
      });
    }

    /** Weg met een groep, en met de animaties die er nog op lopen. */
    ruimOp(box: Box | null) {
      if (!box) return;
      const alles: import("phaser").GameObjects.GameObject[] = [];
      const loop = (b: Box) => {
        alles.push(b);
        for (const k of b.list) {
          if (k instanceof Phaser.GameObjects.Container) loop(k);
          else alles.push(k);
        }
      };
      loop(box);
      this.tweens.killTweensOf(alles);
      box.destroy();
    }

    kies(n: number | null) {
      this.gekozen = n;
      this.ring?.destroy();
      this.ring = null;
      if (n === null) return;
      const plek = this.bakPlekken.find((q) => q.n === n);
      if (plek) this.ring = this.selectieRing(plek.x, plek.y, Math.max(plek.b, plek.h) / 2 + 12).setDepth(5);
    }

    bakTegel(n: number): Img | null {
      const i = this.bakPlekken.findIndex((q) => q.n === n);
      return i >= 0 && this.bakBox ? ((this.bakBox.list[i] as Img) ?? null) : null;
    }

    zetBakAlpha() {
      const st = this.st;
      if (!st || !this.bakBox) return;
      this.bakPlekken.forEach((q, i) => {
        const img = this.bakBox!.list[i] as Img | undefined;
        img?.setAlpha(st.slot.includes(q.n) ? 0.16 : st.actief ? 1 : 0.6);
      });
    }

    /* ---------- de stand ---------- */

    zetStand(st: Stand) {
      const vorige = this.st;
      this.st = st;
      this.zetRooster();
      this.zetBak(vorige);
      this.zetTorens();
    }

    zetRooster() {
      const st = this.st!;
      const { rijen } = rasterMaat(st.boven);
      if (!st.raster) {
        this.rooster?.setVisible(false);
        return;
      }
      if (!this.rooster || this.roosterRijen !== rijen) {
        this.rooster?.destroy();
        const r = this.rasterRect();
        this.rooster = this.plaats(`rooster-${rijen}`, r.x + r.b / 2, r.y + r.h / 2).setDepth(0);
        this.roosterRijen = rijen;
      }
      this.rooster.setVisible(true);
    }

    zetBak(vorige: Stand | null) {
      const st = this.st!;
      const sl = `${st.bak.join(",")}|${st.boven}`;
      const omVeranderd = !!vorige && vorige.om !== st.om;
      if (sl !== this.bakSleutel) {
        const oud = this.bakSleutel ? this.bakSleutel.split("|")[0].split(",").filter(Boolean).map(Number) : [];
        this.bakSleutel = sl;
        this.ruimOp(this.bakBox);
        this.kies(null);
        const lay = legBak(st.bak, st.boven);
        this.bakPlekken = lay.plekken;
        this.bakC = lay.c;
        const box = this.add.container(lay.midden.x, lay.midden.y).setDepth(2);
        for (const q of lay.plekken) {
          const img = this.plaats(`tgg-${q.n}`, q.x - lay.midden.x, q.y - lay.midden.y).setScale(lay.c / TEKEN_C / TX);
          if (st.om) img.setAngle(180);
          box.add(img);
        }
        this.bakBox = box;
        this.bakOm = st.om;
        /* Een hele nieuwe rij tegels: één lichtstraal voor de hele bak. */
        if (st.bak.length > 0 && !st.bak.some((n) => oud.includes(n))) this.tover(box);
      } else if (omVeranderd && this.bakBox) {
        this.bakOm = st.om;
        for (const img of this.bakBox.list as Img[]) {
          this.tweens.add({ targets: img, angle: st.om ? 180 : 0, duration: this.rustig ? 1 : 600, ease: "Sine.easeInOut" });
        }
      }
      if (this.gekozen !== null && (st.slot.includes(this.gekozen) || !st.bak.includes(this.gekozen))) this.kies(null);
      this.zetBakAlpha();
    }

    zetTorens() {
      const st = this.st!;
      this.torenBoxen.forEach((b) => this.ruimOp(b));
      this.torenBoxen = [];
      this.torenMidden = [];
      if (!st.raster) {
        this.vorigeStukken = [];
        this.vorigeOnder = [];
        return;
      }
      const { y: rasterY, rijen } = rasterMaat(st.boven);
      const hoogst = Math.max(1, ...st.torens.map(torenHoogte));
      const onderRij = Math.min(rijen - 1, Math.floor((rijen + hoogst) / 2) - 1);
      const plekY = (r: number) => rasterY + (onderRij - r) * CEL;
      const nu = performance.now();

      /* Samen tellen: welke hokjes, in welke volgorde, met welk nummer. */
      const nummers = new Map<string, number>();
      if (st.tel) {
        let teller = 0;
        const welke = st.tel.toren === "alle" ? st.torens.map((_, i) => i) : [st.tel.toren];
        for (const ti of welke) {
          const t = st.torens[ti];
          if (!t) continue;
          const onder = geplaatst(t.onder ?? []).flat();
          const stukken = geplaatst(t.stukken).flat();
          const bedekt = new Set(stukken.map(sleutel));
          const zicht = st.tel.onbedekt ? onder.filter((hk) => !bedekt.has(sleutel(hk))) : [...onder.filter((hk) => !bedekt.has(sleutel(hk))), ...stukken];
          for (const hk of zicht.sort((a, b) => a.r - b.r || a.k - b.k)) nummers.set(`${ti}:${sleutel(hk)}`, ++teller);
        }
      }

      st.torens.forEach((t, ti) => {
        const kolom = t.kolom ?? KOLOM_VAN_TOREN[ti] ?? 4;
        const x0 = RX + kolom * CEL;
        const h = torenHoogte(t);
        const cx = x0 + CEL;
        const cy = (plekY(h - 1) + plekY(0) + CEL) / 2;
        this.torenMidden[ti] = { x: cx, y: cy };
        const box = this.add.container(cx, cy).setDepth(3);
        const rel = (hk: Hokje) => ({ x: x0 + hk.k * CEL + CEL / 2 - cx, y: plekY(hk.r) + CEL / 2 - cy });

        /* de lege vorm: donkere hokjes met een lichtblauwe lijn eromheen */
        if (t.omtrek) {
          const vak = vorm(t.omtrek);
          const set = new Set(vak.map(sleutel));
          const g = this.add.graphics();
          g.fillStyle(0x040916, 0.55);
          for (const hk of vak) {
            const p = rel(hk);
            g.fillRect(p.x - CEL / 2, p.y - CEL / 2, CEL, CEL);
          }
          g.lineStyle(3, 0x7fe9ff, 0.95);
          for (const hk of vak) {
            const p = rel(hk);
            const [l, r, o, b] = [p.x - CEL / 2, p.x + CEL / 2, p.y - CEL / 2, p.y + CEL / 2];
            if (!set.has(`${hk.k}-${hk.r + 1}`)) g.lineBetween(l, o, r, o);
            if (!set.has(`${hk.k}-${hk.r - 1}`)) g.lineBetween(l, b, r, b);
            if (!set.has(`${hk.k - 1}-${hk.r}`)) g.lineBetween(l, o, l, b);
            if (!set.has(`${hk.k + 1}-${hk.r}`)) g.lineBetween(r, o, r, b);
          }
          box.add(g);
        }

        /* de onderlaag: alleen wat er nog van te zien is */
        const stukken = geplaatst(t.stukken);
        const bedekt = new Set(stukken.flat().map(sleutel));
        for (const hk of geplaatst(t.onder ?? []).flat()) {
          if (bedekt.has(sleutel(hk))) continue;
          const p = rel(hk);
          box.add(this.plaats(`hkg-${hk.n}`, p.x, p.y));
        }

        /* de stukken erop; een nieuw stuk komt van waar het kind hem losliet */
        const vorig = this.vorigeStukken[ti] ?? [];
        const nieuwVan = new Map<number, number>();
        for (const n of new Set(t.stukken)) {
          const erbij = t.stukken.filter((x) => x === n).length - vorig.filter((x) => x === n).length;
          if (erbij > 0) nieuwVan.set(n, erbij);
        }
        stukken.forEach((hokjes, i) => {
          if (hokjes.length === 0) return;
          const n = t.stukken[i];
          const ps = hokjes.map(rel);
          const mx = ps.reduce((a, p) => a + p.x, 0) / ps.length;
          const my = ps.reduce((a, p) => a + p.y, 0) / ps.length;
          const stuk = this.add.container(mx, my);
          ps.forEach((p) => stuk.add(this.plaats(`hkg-${n}`, p.x - mx, p.y - my)));
          box.add(stuk);
          const laatsteVanN = t.stukken.lastIndexOf(n) === i;
          if (laatsteVanN && nieuwVan.has(n) && !this.rustig) {
            const d = this.laatsteDrop;
            if (d && d.n === n && nu - d.t < 1500) {
              stuk.setPosition(d.x - cx, d.y - cy);
              this.tweens.add({ targets: stuk, x: mx, y: my, duration: 240, ease: "Cubic.easeOut" });
              this.laatsteDrop = null;
            } else {
              stuk.setScale(0.75).setAlpha(0);
              this.tweens.add({ targets: stuk, scale: 1, alpha: 1, duration: 260, ease: "Back.easeOut" });
            }
          }
          if (t.wegLaatste && i === stukken.length - 1) {
            this.tweens.add({ targets: stuk, alpha: 0, y: my + 24, scaleY: 0.8, delay: 60, duration: this.rustig ? 1 : 360, ease: "Cubic.easeIn" });
          }
        });

        /* nummers bij het samen tellen */
        if (st.tel) {
          const alle = [...geplaatst(t.onder ?? []).flat(), ...stukken.flat()];
          for (const hk of alle) {
            const nr = nummers.get(`${ti}:${sleutel(hk)}`);
            if (!nr || nr > st.tel.tot || nr > 20) continue;
            const p = rel(hk);
            box.add(this.plaats(`nrg-${nr}`, p.x, p.y));
          }
        }

        /* hulp: een doorschijnende schaduw van de tegel, op de plek waar hij hoort */
        if (st.hint && st.hint.toren === ti) {
          const nieuw = zetIn(t.stukken, st.hint.n);
          const plek = stapel(nieuw)[nieuw.lastIndexOf(st.hint.n)] ?? [];
          const schaduw = this.add.container(0, 0);
          for (const hk of plek) {
            const p = rel(hk);
            schaduw.add(this.plaats(`hkg-${st.hint.n}`, p.x, p.y));
          }
          schaduw.setAlpha(0.4);
          if (!this.rustig) this.tweens.add({ targets: schaduw, alpha: 0.15, duration: 700, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
          box.add(schaduw);
        }

        /* een lichtblauwe rand om de toren (één geheel) */
        if (t.rand) {
          const g = this.add.graphics();
          g.lineStyle(3, 0x9fe6ff, 0.95);
          g.strokeRoundedRect(-CEL - 5, -(h * CEL) / 2 - 5, 2 * CEL + 10, h * CEL + 10, 10);
          box.add(g);
        }

        /* een nieuwe toren met een onderlaag of vorm: Bliepo tovert hem tevoorschijn */
        const onderSleutel = `${(t.onder ?? []).join(",")}|${t.omtrek ?? ""}`;
        if (onderSleutel !== "|" && this.vorigeOnder[ti] !== onderSleutel) this.tover(box);

        this.torenBoxen[ti] = box;
      });
      this.vorigeStukken = st.torens.map((t) => [...t.stukken.slice(0, t.wegLaatste ? -1 : undefined)]);
      this.vorigeOnder = st.torens.map((t) => `${(t.onder ?? []).join(",")}|${t.omtrek ?? ""}`);
    }

    draaiToren(i: number) {
      const box = this.torenBoxen[i];
      if (!box) return;
      this.tweens.add({ targets: box, angle: 180, duration: this.rustig ? 1 : 900, ease: "Sine.easeInOut" });
    }

    golfToren(i: number) {
      const m = this.torenMidden[i];
      if (m) this.golf(m.x, m.y);
    }

    demo(ms: number) {
      const eind = performance.now() + ms;
      const stap = () => {
        if (performance.now() > eind || !this.bakBox) return;
        this.tover(this.bakBox);
        const m = this.torenMidden[0] ?? { x: RX + 5 * CEL, y: 400 };
        this.time.delayedCall(380, () => this.golf(m.x, m.y));
        this.time.delayedCall(800, stap);
      };
      stap();
    }
  }
  return Tegels as unknown as new () => import("phaser").Scene;
}

/* ---------- de som, scherp in HTML ---------- */

function Som({ delen, aan, groot }: { delen: Somdeel[]; aan?: number | null; groot: boolean }) {
  const maat = groot ? 84 : 58;
  return (
    <div className={s.som} style={{ top: groot ? 270 : 26, height: groot ? 120 : 84, gap: groot ? 40 : 28, fontSize: maat }} aria-hidden>
      {delen.map((d, i) =>
        d.t === "getal" ? (
          <span key={i} style={{ color: getalkleur(d.n) }}>
            {d.n}
          </span>
        ) : d.t === "teken" ? (
          <span key={i} className={s.somteken}>
            {d.s}
          </span>
        ) : (
          <span
            key={i}
            className={`${s.somvak} ${aan === i ? s.aan : ""} ${d.waarde && !/^\d+$/.test(d.waarde) ? s.leeg : ""}`}
            style={{
              width: groot ? 124 : 92,
              height: groot ? 116 : 80,
              fontSize: maat * 0.92,
              color: d.waarde && /^\d+$/.test(d.waarde) ? getalkleur(Number(d.waarde)) : undefined,
            }}
          >
            {d.waarde ?? ""}
          </span>
        ),
      )}
    </div>
  );
}

/* ---------- iconen voor de knoppen in het vlak ---------- */

const lijn = { fill: "none", stroke: "currentColor", strokeWidth: 2.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

/** Leegmaken: een veeg met lichtpuntjes. */
function IkoonLeeg() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M4 19h16" {...lijn} />
      <path d="M7 15l9-9 3 3-9 9H7z" {...lijn} />
      <circle cx="5" cy="7" r="1.3" fill="currentColor" />
      <circle cx="9" cy="4" r="1" fill="currentColor" />
    </svg>
  );
}

/** Hulp: een opgestoken hand. */
export function IkoonHand() {
  return (
    <svg viewBox="0 0 26 26" aria-hidden>
      <path
        d="M8 13V6.5a1.5 1.5 0 0 1 3 0V12M11 12V4.5a1.5 1.5 0 0 1 3 0V12M14 12V5.5a1.5 1.5 0 0 1 3 0V13M17 13V8.5a1.5 1.5 0 0 1 3 0V15c0 4.5-3 7.5-7 7.5-3 0-4.6-1.4-6.2-3.8L4.2 15a1.5 1.5 0 0 1 2.4-1.8L8 15"
        fill="#f2c79a"
        stroke="#8a5a32"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ---------- het vlak ---------- */

export function HoloTegelvlak({
  torens,
  bak = [],
  om = false,
  slot = [],
  actief = false,
  som = null,
  somAan = null,
  raster = true,
  tel = null,
  leegKnop = false,
  hint = null,
  hulpKnop = false,
  knoppenInVlak = false,
  hulpInVlak = false,
  draai = null,
  golf = null,
  hand = false,
  meld,
  schaal,
  metSom,
}: HoloTegelProps & Vlakbasis) {
  const { plek, scene } = useHoloMotor<TegelScene>(schaal, maakTegelScene, { invoer: true });
  const boven = !!som || metSom;
  const [handGezien, setHandGezien] = useState(false);
  const meldRef = useRef(meld);
  useEffect(() => {
    meldRef.current = meld;
  }, [meld]);

  /* De scène meldt via de nieuwste `meld`. */
  useEffect(() => {
    if (!scene) return;
    scene.verbind(
      (g) => meldRef.current(g),
      () => setHandGezien(true),
    );
    window.__phaser = { ...window.__phaser, sleepPunt: () => scene.sleepPunt() as { x: number; y: number } };
  }, [scene]);

  const standSleutel = JSON.stringify({ torens, bak, om, slot, actief, raster, boven, tel, hint });
  useEffect(() => {
    if (!scene) return;
    scene.zetStand(JSON.parse(standSleutel) as Stand);
  }, [scene, standSleutel]);

  /* Voor de automatische test (zoals `antwoord` bij de flitskaarten): wat er nu ligt, en waar je kunt tikken. */
  useEffect(() => {
    if (!scene) return;
    window.__phaser = {
      ...window.__phaser,
      tegelstand: { torens, bak, slot, som, somAan, actief, raster, hulpKnop, leegKnop },
      tegelPunt: (n: number) => scene.punt(n),
      roosterPunt: () => scene.punt(null),
    };
  }, [scene, torens, bak, slot, som, somAan, actief, raster, hulpKnop, leegKnop]);

  const draaiNr = draai?.nr;
  useEffect(() => {
    if (scene && draai) scene.draaiToren(draai.toren);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, draaiNr]);

  const golfNr = golf?.nr;
  useEffect(() => {
    if (scene && golf) scene.golfToren(golf.toren);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, golfNr]);

  /* Het handje: van de eerste tegel die je kunt pakken naar het midden van het rooster. */
  const handStijl = useMemo(() => {
    const eerste = legBak(bak, boven).plekken.find((p) => !slot.includes(p.n));
    if (!eerste) return null;
    const { y, rijen } = rasterMaat(boven);
    return {
      left: 0,
      top: 0,
      "--van-x": `${eerste.x - 20}px`,
      "--van-y": `${eerste.y - 10}px`,
      "--naar-x": `${RX + 5 * CEL - 20}px`,
      "--naar-y": `${y + (rijen / 2) * CEL - 10}px`,
    } as CSSProperties;
  }, [bak, slot, boven]);

  const { y: rasterY, rijen } = rasterMaat(boven);
  const onderRaster = rasterY + rijen * CEL;

  return (
    <div className={s.vlak}>
      <div ref={plek} style={{ ...HOLO_CANVAS, touchAction: "none" }} aria-hidden />
      {som && <Som delen={som} aan={somAan} groot={!raster} />}

      {raster && leegKnop && (
        <button type="button" className={s.knop} data-knop="leeg" aria-label="Leegmaken" style={{ left: 14, top: onderRaster - 84 }} onClick={() => actief && meld({ soort: "leeg" })}>
          <IkoonLeeg />
          <span className={s.knopwoord}>Leeg</span>
        </button>
      )}
      {hulpKnop && (knoppenInVlak || hulpInVlak) && (
        <button
          type="button"
          className={`${s.knop} ${s.warm}`}
          data-knop="hulp"
          aria-label="Hulp"
          style={{ left: 14, top: onderRaster - (raster && leegKnop ? 172 : 84) }}
          onClick={() => meld({ soort: "hulp" })}
        >
          <IkoonHand />
          <span className={s.knopwoord}>Hulp</span>
        </button>
      )}

      {hand && !handGezien && handStijl && (
        <svg className={s.hand} style={handStijl} viewBox="0 0 48 48" aria-hidden>
          <path
            d="M18 22V9.5a3 3 0 0 1 6 0V20l1-.2V17a3 3 0 0 1 6 0v3.5a3 3 0 0 1 5.5 1.6v2.7a3 3 0 0 1 5 2.2V33c0 7-5 12-12 12h-3c-4 0-6.5-1.7-9-5l-6-8a3.1 3.1 0 0 1 4.6-4.1L18 30z"
            fill="#ffffff"
            stroke="#1b2233"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
}
