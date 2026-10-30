"use client";

/**
 * De weektrein in Phaser (30 oktober 2026) voor de lessen "Dagen van de week"
 * naar Squla (level 1, 2 en 3). Dezelfde Kenney-weektrein als de voorbeeldles
 * (public/squla/trein-glow, CC0, zie public/squla/trein/BRON.md), maar hier als
 * Phaser-plaatjes, donker met "glow in the dark" (nacht: true). De gloed zit al
 * in de plaatjes (één keer gebakken), dus vloeiend. De voorbeeldles en haar vlak
 * (squla-dagen-trein.tsx) blijven zoals ze zijn.
 *
 * Wat het draaiboek zet:
 * - `trein`: de wagons achter de locomotief (0 = maandag … 6 = zondag), `null`
 *   = een lege plek; `treinKlein`: kleiner, bovenaan; `licht`: wagons die
 *   oplichten; `vandaag`: de gele pijl; `stappen`: boogjes van dag naar dag;
 * - `plaatje` en `vandaagKaart`: bij een verhaaltje een tekening en de dag van
 *   vandaag met de pijl erboven;
 * - `kaarten`: dagkaarten (één wagon, of twee naast elkaar) om aan te tikken,
 *   met `uit`, `goed`, `fout`, `kaartLicht`;
 * - `orden`: vier lege vakken en vier dagkaarten om op volgorde te slepen (of
 *   aan te tikken: dan gaat de kaart naar het eerste lege vak).
 *
 * Meldingen: `kaart` {id}, `leg` {id, vak|null} (id = de naam van de dag).
 */

import { useEffect, useRef } from "react";
import type { Vlakbasis, Vlakgebeurtenis } from "../soort";
import { holoBasis, GOED, TX, VLAK_B, VLAK_H, WARM } from "../holo/basis";
import { HOLO_CANVAS, useHoloMotor } from "../holo/motor";
import { DAGEN } from "./squla-dagen-trein";
import { binnen, rij, type Rect } from "./squla-tijd-plaatjes";
import { tekenTekening, tekeningMaat } from "./squla-tijd-tekeningen";
import { tekenVormen } from "./bliepo-voorwerpen";
import { haalKeuzesAlvast, zegKeuze } from "@/lib/stem";
import s from "./squla-tijd.module.css";

export type DagKaart = { id: string; dagen: number[] };
export type TreinOrden = { vakken: (number | null)[]; losse: number[]; uitslag?: (boolean | null)[]; actief: boolean };

export type TreinProps = {
  nr: number;
  /** Verandert dit getal, dan rijdt de trein het beeld in. */
  rit?: number;
  trein?: (number | null)[] | null;
  treinKlein?: boolean;
  licht?: number[];
  vandaag?: number | null;
  stappen?: number[] | null;
  plaatje?: string | null;
  vandaagKaart?: number | null;
  kaarten?: DagKaart[];
  kaartenActief?: boolean;
  uit?: string[];
  goed?: string[];
  fout?: string[];
  kaartLicht?: string[];
  orden?: TreinOrden | null;
  schud?: { id: string; n: number } | null;
  golf?: { id: string; n: number } | null;
  /** Een handje doet één keer voor hoe je sleept (verandert het getal, dan nog eens). */
  handje?: number;
};

export const dagNaam = (d: number) => DAGEN[d].naam;
export const kaartId = (dagen: number[]) => dagen.map(dagNaam).join(" en ");

/* ---------- maten (punten van het vlak, 980 × 720) ---------- */

/** Een wagon: de maten van het plaatje (glow) bij een wagonbreedte van 150. */
const BASIS_W = 150;
const PLAATJE_B = 224;
const PLAATJE_H = 150;
const LOC_B = 191;
const LOC_H = 145;
const WAGON_H = (w: number) => (w * 163) / 324;

type TreinMaat = { w: number; loc: number; y: number; x: (i: number) => number; locX: number; tussen: number };

function treinMaat(n: number, klein: boolean): TreinMaat {
  const w = klein ? 84 : 108;
  const loc = klein ? 100 : 128;
  const tussen = klein ? 6 : 8;
  const y = klein ? 92 : 250;
  const breed = loc + n * (w + tussen);
  const x0 = (VLAK_B - breed) / 2;
  return { w, loc, y, tussen, locX: x0 + loc / 2, x: (i) => x0 + loc + tussen + i * (w + tussen) + w / 2 };
}

const KAART_W = 150;
const PAAR_W = 112;

type Indeling = { kaarten: Rect[]; vakken: Rect[]; losse: Rect[] };

export function treinIndeling(p: TreinProps): Indeling {
  const n = p.kaarten?.length ?? 0;
  const paar = (p.kaarten ?? []).some((k) => k.dagen.length > 1);
  const kb = paar ? 2 * PAAR_W + 10 : KAART_W;
  const kaarten = n ? rij(n, kb, paar ? 64 : n === 4 ? 40 : 60, 566, WAGON_H(paar ? PAAR_W : KAART_W) + 30) : [];
  let vakken: Rect[] = [];
  let losse: Rect[] = [];
  if (p.orden) {
    const h = WAGON_H(KAART_W) + 30;
    vakken = rij(p.orden.vakken.length, KAART_W + 12, 30, p.trein ? 330 : 290, h);
    losse = rij(p.orden.losse.length, KAART_W, 46, 566, h);
  }
  return { kaarten, vakken, losse };
}

/* ---------- de scène ---------- */

type Ptr = import("phaser").Input.Pointer;
type Box = import("phaser").GameObjects.Container;
type Img = import("phaser").GameObjects.Image;

interface TreinScene {
  verbind(meld: (g: Vlakgebeurtenis) => void): void;
  zet(p: TreinProps): void;
  schudDing(id: string): void;
  golfDing(id: string): void;
  rijIn(): void;
  speelHandje(): void;
}

type Ding = { box: Box; ring: Img; r: Rect; id: string; soort: "kaart" | "los" };

function maakScene(Phaser: typeof import("phaser"), rustig: boolean) {
  const Basis = holoBasis(Phaser, rustig);
  class Trein extends Basis implements TreinScene {
    melder: (g: Vlakgebeurtenis) => void = () => {};
    p: TreinProps | null = null;
    sig = { trein: "", rest: "" };
    nr = -1;
    treinGroep: Box | null = null;
    wagons = new Map<number, Img>();
    pijl: Img | null = null;
    bogen: import("phaser").GameObjects.Graphics | null = null;
    rest: import("phaser").GameObjects.GameObject[] = [];
    dingen = new Map<string, Ding>();
    druk: { d: Ding; x0: number; y0: number; dx: number; dy: number; sleept: boolean; lang: boolean } | null = null;
    zweef: string | null = null;
    stemKlok: ReturnType<typeof setTimeout> | undefined;
    terugKlok: ReturnType<typeof setTimeout> | undefined;

    constructor() {
      super("squla-tijd-trein");
    }

    preload() {
      for (const d of DAGEN) this.load.image(`png-${d.naam}`, `/squla/trein-glow/${d.naam}.png`);
      this.load.image("png-loc", "/squla/trein-glow/locomotief.png");
    }

    verbind(meld: (g: Vlakgebeurtenis) => void) {
      this.melder = meld;
    }

    maak() {
      const font = letter();
      /* Elke wagon één keer: het Kenney-plaatje met de gloed, en de naam op een bordje. */
      DAGEN.forEach((d, i) => {
        const bron = this.textures.get(`png-${d.naam}`).getSourceImage() as HTMLImageElement;
        this.canvasPlaatje(`wg-${i}`, PLAATJE_B, PLAATJE_H, (c) => {
          c.drawImage(bron, 0, 0, PLAATJE_B, PLAATJE_H);
          c.font = `800 ${i === 3 ? 18 : 19.5}px ${font}`;
          const tb = c.measureText(d.naam).width + 14;
          const x = PLAATJE_B / 2 - tb / 2;
          const y = 64 - 13;
          c.save();
          c.shadowColor = d.hex;
          c.shadowBlur = 12;
          c.fillStyle = "#fff7ea";
          c.beginPath();
          c.roundRect(x, y, tb, 26, 8);
          c.fill();
          c.restore();
          c.strokeStyle = d.hex;
          c.lineWidth = 2.5;
          c.beginPath();
          c.roundRect(x, y, tb, 26, 8);
          c.stroke();
          c.fillStyle = "#1d2b5e";
          c.textAlign = "center";
          c.textBaseline = "middle";
          c.fillText(d.naam, PLAATJE_B / 2, 64 + 1);
        });
      });
      const loc = this.textures.get("png-loc").getSourceImage() as HTMLImageElement;
      this.canvasPlaatje("wg-loc", LOC_B, LOC_H, (c) => c.drawImage(loc, 0, 0, LOC_B, LOC_H));
      /* Een lege plek, de pijl van vandaag, en de randen (wit = aanwijzen, groen = goed, rood = niet goed). */
      this.canvasPlaatje("leeg", 160, 84, (c) => {
        c.fillStyle = "rgba(255,247,234,0.07)";
        c.beginPath();
        c.roundRect(4, 4, 152, 76, 14);
        c.fill();
        c.setLineDash([10, 7]);
        c.strokeStyle = "rgba(255,247,234,0.75)";
        c.lineWidth = 4;
        c.stroke();
      });
      this.canvasPlaatje("pijl", 44, 50, (c) =>
        tekenVormen(c, [{ d: "M 14 4 H 30 V 24 H 40 L 22 44 L 4 24 H 14 Z", vul: "#ffc845", rand: "#1d2b5e", dik: 3.5 }]),
      );
      this.bak("pijl", "pijl-g", WARM);
      /* Het handje dat voordoet hoe je sleept. */
      this.canvasPlaatje("handje", 48, 56, (c) =>
        tekenVormen(c, [
          {
            d: "M16 30 V8 a5 5 0 0 1 10 0 V26 V20 a5 5 0 0 1 10 0 V28 a5 5 0 0 1 9 2 V40 c0 9 -7 14 -15 14 h-4 c-6 0 -10 -3 -13 -8 L4 34 a5 5 0 0 1 8 -5 Z",
            vul: "#fff7ea",
            rand: "#1d2b5e",
            dik: 3.5,
          },
        ]),
      );

      this.input.on("pointerdown", (p: Ptr) => this.neer(p));
      this.input.on("pointermove", (p: Ptr) => this.beweeg(p));
      this.input.on("pointerup", () => this.los());
      this.input.on("pointerupoutside", () => this.los());
    }

    /** Een rand om een kaart (wit = aanwijzen of niet goed, groen = goed, rood = fout, geel = Bliepo wijst), met een gebakken gloed. */
    randPlaatje(k: "wit" | "groen" | "rood" | "geel", b: number, h: number) {
      const sl = `rand-${k}-${Math.round(b)}x${Math.round(h)}`;
      if (!this.textures.exists(`${sl}-g`)) {
        const kleur = { wit: "rgba(255,255,255,0.95)", groen: "#5ee39a", rood: "#ff7a6e", geel: "#ffd36e" }[k];
        this.canvasPlaatje(sl, b + 10, h + 10, (c) => {
          c.strokeStyle = kleur;
          c.lineWidth = 5;
          c.beginPath();
          c.roundRect(5, 5, b, h, 16);
          c.stroke();
        });
        this.bak(sl, `${sl}-g`, { wit: 0xffffff, groen: GOED, rood: 0xff7a6e, geel: WARM }[k]);
      }
      return `${sl}-g`;
    }

    /** De tekening bij een verhaaltje, met een zachte gloed (één keer gebakken). */
    plaatjeVan(sleutel: string) {
      const sl = `vt-${sleutel}`;
      if (!this.textures.exists(`${sl}-g`)) {
        const m = tekeningMaat(sleutel);
        const k = 170 / Math.max(m.b, m.h);
        this.canvasPlaatje(sl, m.b * k, m.h * k, (c) => {
          c.scale(k, k);
          tekenTekening(c, sleutel);
        });
        this.bak(sl, `${sl}-g`, WARM);
      }
      return `${sl}-g`;
    }

    /** Een wagon met zijn breedte `w` (het plaatje heeft rondom ruimte voor de gloed). */
    wagon(dag: number, x: number, y: number, w: number) {
      return this.plaats(`wg-${dag}`, x, y).setScale(w / BASIS_W / TX);
    }

    /* ---------- de trein ---------- */

    bouwTrein(p: TreinProps) {
      this.treinGroep?.destroy();
      this.treinGroep = null;
      this.wagons.clear();
      this.pijl = null;
      this.bogen = null;
      if (!p.trein) return;
      const m = treinMaat(p.trein.length, !!p.treinKlein);
      /* De groep staat in het midden van de trein, zodat hij vanuit het midden verschijnt. */
      const ox = VLAK_B / 2;
      const g = this.add.container(ox, m.y);
      const rails = this.add.graphics();
      const railY = WAGON_H(m.w) / 2 + (p.treinKlein ? 6 : 8);
      rails.fillStyle(0x8fa3c9, 1).fillRoundedRect(-ox, railY, VLAK_B, p.treinKlein ? 4 : 6, 3);
      rails.fillStyle(0x5d6f9a, 1);
      for (let x = 6; x < VLAK_B; x += 30) rails.fillRoundedRect(x - ox, railY + (p.treinKlein ? 4 : 6), 14, p.treinKlein ? 5 : 7, 2);
      g.add(rails);
      const locH = (m.loc * 207) / 324;
      g.add(this.plaats("wg-loc", m.locX - ox, WAGON_H(m.w) / 2 - locH / 2).setScale(m.loc / 128 / TX));
      p.trein.forEach((d, i) => {
        if (d === null) {
          g.add(this.vak(m.x(i) - ox, 0, m.w + 6, WAGON_H(m.w) + 8));
          return;
        }
        const w = this.wagon(d, m.x(i) - ox, 0, m.w);
        this.wagons.set(d, w);
        g.add(w);
      });
      this.bogen = this.add.graphics();
      g.add(this.bogen);
      this.pijl = this.plaats("pijl-g", 0, 0).setVisible(false);
      g.add(this.pijl);
      this.treinGroep = g;
    }

    /** Een lege plek (gestippeld) van b × h punten. */
    vak(x: number, y: number, b: number, h: number) {
      return this.plaats("leeg", x, y).setScale(b / 160 / TX, h / 84 / TX);
    }

    pasTreinToe(p: TreinProps) {
      if (!p.trein) return;
      const m = treinMaat(p.trein.length, !!p.treinKlein);
      const ox = VLAK_B / 2;
      for (const [d, w] of this.wagons) {
        const aan = !!p.licht?.includes(d);
        const y = aan ? -10 : 0;
        if (w.y !== y) this.tweens.add({ targets: w, y, duration: rustig ? 1 : 160, ease: "Cubic.easeOut" });
        w.setAlpha(p.licht?.length && !aan ? 0.5 : 1);
      }
      if (this.pijl) {
        const i = p.vandaag != null ? p.trein.indexOf(p.vandaag) : -1;
        this.pijl.setVisible(i >= 0);
        this.tweens.killTweensOf(this.pijl);
        if (i >= 0) {
          this.pijl.setPosition(m.x(i) - ox, -WAGON_H(m.w) / 2 - (p.treinKlein ? 30 : 44));
          if (!rustig) this.tweens.add({ targets: this.pijl, y: this.pijl.y + 7, duration: 600, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
        }
      }
      if (this.bogen) {
        const g = this.bogen;
        g.clear();
        const st = p.stappen ?? [];
        for (let k = 0; k + 1 < st.length; k++) {
          const a = p.trein.indexOf(st[k]);
          const b = p.trein.indexOf(st[k + 1]);
          if (a < 0 || b < 0) continue;
          const r = b > a ? 1 : -1;
          const x1 = m.x(a) - ox + 8 * r;
          const x2 = m.x(b) - ox - 8 * r;
          const y = WAGON_H(m.w) / 2 + 24;
          const curve = new Phaser.Curves.QuadraticBezier(new Phaser.Math.Vector2(x1, y), new Phaser.Math.Vector2((x1 + x2) / 2, y + 36), new Phaser.Math.Vector2(x2, y));
          g.lineStyle(9, 0x1d2b5e, 1);
          curve.draw(g, 24);
          g.lineStyle(5, 0xffd36e, 1);
          curve.draw(g, 24);
          g.fillStyle(0xffd36e, 1);
          g.fillTriangle(x2 + 2 * r, y - 4, x2 - 14 * r, y + 2, x2 - 4 * r, y + 14);
        }
      }
    }

    rijIn() {
      if (!this.treinGroep || rustig) return;
      this.tweens.killTweensOf(this.treinGroep);
      this.treinGroep.setAlpha(1).setScale(1);
      this.treinGroep.x = VLAK_B / 2 + 1000;
      this.tweens.add({ targets: this.treinGroep, x: VLAK_B / 2, duration: 2200, ease: "Cubic.easeOut" });
    }

    /* ---------- kaarten en vakken ---------- */

    leegRest() {
      for (const o of this.rest) o.destroy();
      this.rest = [];
      this.dingen.clear();
      this.druk = null;
    }

    nieuwDing(id: string, dagen: number[], r: Rect, soort: Ding["soort"]) {
      const box = this.add.container(r.x, r.y);
      const ringB = (dagen.length > 1 ? 2 * PAAR_W + 10 : KAART_W) + 22;
      const ringH = WAGON_H(dagen.length > 1 ? PAAR_W : KAART_W) + 26;
      const ring = this.plaats(this.randPlaatje("wit", ringB, ringH), 0, 0).setVisible(false);
      box.add(ring);
      if (dagen.length > 1) {
        box.add(this.wagon(dagen[0], -(PAAR_W + 10) / 2, 0, PAAR_W));
        box.add(this.wagon(dagen[1], (PAAR_W + 10) / 2, 0, PAAR_W));
      } else box.add(this.wagon(dagen[0], 0, 0, KAART_W));
      this.rest.push(box);
      const d: Ding = { box, ring, r, id, soort };
      this.dingen.set(id, d);
      return d;
    }

    bouwRest(p: TreinProps, verschijn: boolean) {
      this.leegRest();
      const ind = treinIndeling(p);
      const nieuw: Box[] = [];
      if (p.plaatje) {
        const x = p.vandaagKaart != null ? 330 : VLAK_B / 2;
        const pl = this.plaats(this.plaatjeVan(p.plaatje), x, 230);
        this.rest.push(pl);
        if (verschijn) this.tover(pl);
      }
      if (p.vandaagKaart != null) {
        const box = this.add.container(650, 250);
        box.add(this.wagon(p.vandaagKaart, 0, 0, KAART_W));
        const pijl = this.plaats("pijl-g", 0, -WAGON_H(KAART_W) / 2 - 48);
        box.add(pijl);
        if (!rustig) this.tweens.add({ targets: pijl, y: pijl.y + 7, duration: 600, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
        this.rest.push(box);
        if (verschijn) this.tover(box);
      }
      (p.kaarten ?? []).forEach((k, i) => nieuw.push(this.nieuwDing(k.id, k.dagen, ind.kaarten[i], "kaart").box));
      if (p.orden) {
        ind.vakken.forEach((r) => {
          this.rest.push(this.vak(r.x, r.y, r.b, WAGON_H(KAART_W) + 18));
        });
        p.orden.losse.forEach((dag, i) => nieuw.push(this.nieuwDing(dagNaam(dag), [dag], ind.losse[i], "los").box));
      }
      if (verschijn) nieuw.forEach((b, i) => this.tover(b, { vertraging: i * 80 }));
    }

    zet(p: TreinProps) {
      this.p = p;
      const treinSig = JSON.stringify([p.nr, p.trein ?? null, !!p.treinKlein]);
      const restSig = JSON.stringify([p.nr, p.plaatje ?? null, p.vandaagKaart ?? null, p.kaarten ?? [], p.orden ? [p.orden.vakken.length, p.orden.losse] : null, p.trein ? 1 : 0]);
      const verschijn = p.nr !== this.nr;
      if (treinSig !== this.sig.trein) {
        const wasEr = !!this.treinGroep;
        this.bouwTrein(p);
        if (this.treinGroep && (verschijn || !wasEr)) this.tover(this.treinGroep);
        this.sig.trein = treinSig;
      }
      if (restSig !== this.sig.rest) {
        this.bouwRest(p, true);
        this.sig.rest = restSig;
      }
      this.nr = p.nr;
      this.pasTreinToe(p);
      this.pasRestToe(p);
    }

    pasRestToe(p: TreinProps) {
      const ind = treinIndeling(p);
      const rand = (k: "wit" | "groen" | "rood" | "geel" | null, d: Ding) => {
        if (!k) return void d.ring.setVisible(false);
        const ringB = (d.id.includes(" en ") ? 2 * PAAR_W + 10 : KAART_W) + 22;
        const ringH = WAGON_H(d.id.includes(" en ") ? PAAR_W : KAART_W) + 26;
        d.ring.setTexture(this.randPlaatje(k, ringB, ringH)).setVisible(true);
      };
      for (const d of this.dingen.values()) {
        if (d.soort === "kaart") {
          rand(p.goed?.includes(d.id) ? "groen" : p.fout?.includes(d.id) ? "rood" : p.kaartLicht?.includes(d.id) ? "geel" : null, d);
          d.box.setAlpha(p.uit?.includes(d.id) ? 0.25 : 1);
        } else if (p.orden) {
          const vak = p.orden.vakken.findIndex((x) => x !== null && dagNaam(x) === d.id);
          const doel = vak >= 0 ? ind.vakken[vak] : d.r;
          if (this.druk?.d !== d && (d.box.x !== doel.x || d.box.y !== doel.y)) this.tweens.add({ targets: d.box, x: doel.x, y: doel.y, duration: rustig ? 1 : 220, ease: "Cubic.easeOut" });
          const u = vak >= 0 ? p.orden.uitslag?.[vak] : null;
          rand(u === true ? "groen" : u === false ? "wit" : p.kaartLicht?.includes(d.id) ? "geel" : null, d);
          d.box.setDepth(vak >= 0 ? 1 : 2);
        }
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
      if (!p?.orden || rustig) return;
      const ind = treinIndeling(p);
      const van = ind.losse[0];
      const naar = ind.vakken[p.orden.vakken.findIndex((x) => x === null)];
      if (!van || !naar) return;
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
      for (const d of [...this.dingen.values()].reverse()) {
        if (!binnen({ ...d.r, x: d.box.x, y: d.box.y }, x, y, 10)) continue;
        if (!alleenActief) return d;
        if (d.soort === "kaart" && p.kaartenActief && !p.uit?.includes(d.id)) return d;
        if (d.soort === "los" && p.orden?.actief && !p.orden.vakken.some((v) => v !== null && dagNaam(v) === d.id)) return d;
      }
      return null;
    }

    /** Ook de wagons in de trein lezen hun naam voor. */
    raakWagon(x: number, y: number): string | null {
      const p = this.p;
      if (!p?.trein || !this.treinGroep) return null;
      const m = treinMaat(p.trein.length, !!p.treinKlein);
      const dx = this.treinGroep.x - VLAK_B / 2;
      const i = p.trein.findIndex((d, j) => d !== null && binnen({ x: m.x(j) + dx, y: m.y, b: m.w, h: WAGON_H(m.w) }, x, y, 6));
      const d = i >= 0 ? p.trein[i] : null;
      return d === null ? null : dagNaam(d);
    }

    neer(p: Ptr) {
      const w = this.waar(p);
      clearTimeout(this.stemKlok);
      const d = this.raak(w.x, w.y, true);
      if (!d) {
        /* Lang drukken op een wagon of kaart die nu niet te tikken is: alleen voorlezen. */
        const naam = this.raak(w.x, w.y, false)?.id ?? this.raakWagon(w.x, w.y);
        if (naam && p.wasTouch) this.stemKlok = setTimeout(() => zegKeuze(naam), 500);
        return;
      }
      this.druk = { d, x0: w.x, y0: w.y, dx: d.box.x - w.x, dy: d.box.y - w.y, sleept: false, lang: false };
      if (p.wasTouch) {
        const druk = this.druk;
        this.stemKlok = setTimeout(() => {
          if (this.druk === druk && !druk.sleept) {
            druk.lang = true;
            zegKeuze(d.id);
          }
        }, 500);
      }
    }

    beweeg(p: Ptr) {
      const w = this.waar(p);
      const druk = this.druk;
      if (!druk) {
        if (!p.isDown && !p.wasTouch) {
          const naam = this.raak(w.x, w.y, false)?.id ?? this.raakWagon(w.x, w.y);
          if (naam !== this.zweef) {
            this.zweef = naam;
            clearTimeout(this.stemKlok);
            if (naam) this.stemKlok = setTimeout(() => zegKeuze(naam), 300);
          }
          const actief = this.raak(w.x, w.y, true);
          this.input.setDefaultCursor(actief ? (actief.soort === "los" ? "grab" : "pointer") : "default");
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
      if (druk.sleept && druk.d.soort === "los") druk.d.box.setPosition(w.x + druk.dx, w.y + druk.dy);
    }

    los() {
      const druk = this.druk;
      this.druk = null;
      clearTimeout(this.stemKlok);
      if (!druk) return;
      this.input.setDefaultCursor("default");
      const d = druk.d;
      if (druk.lang && !druk.sleept) return;
      if (d.soort === "kaart") {
        if (!druk.sleept) this.melder({ soort: "kaart", id: d.id });
        return;
      }
      if (!this.p?.orden) return;
      if (!druk.sleept) return void this.melder({ soort: "leg", id: d.id, vak: null });
      const ind = treinIndeling(this.p);
      const vak = ind.vakken.findIndex((r, i) => this.p!.orden!.vakken[i] === null && binnen(r, d.box.x, d.box.y, 34));
      if (vak >= 0) this.melder({ soort: "leg", id: d.id, vak });
      clearTimeout(this.terugKlok);
      this.terugKlok = setTimeout(() => {
        if (this.p) this.pasRestToe(this.p);
      }, vak >= 0 ? 260 : 0);
    }

    sleepPunt() {
      return null;
    }

    /** Voor de vloeiendheidscontrole: wagons lichten op zoals bij Bliepo's uitleg, met een lichtgolf. */
    demo(ms: number) {
      const eind = performance.now() + ms;
      const lijst = [...this.wagons.values()];
      let i = 0;
      const stap = () => {
        if (performance.now() > eind || !lijst.length) return;
        const w = lijst[i++ % lijst.length];
        this.tweens.add({ targets: w, y: -10, duration: 160, yoyo: true, hold: 200, ease: "Cubic.easeOut" });
        if (this.treinGroep) this.golf(this.treinGroep.x + w.x, this.treinGroep.y + w.y);
        this.time.delayedCall(450, stap);
      };
      stap();
    }
  }
  return Trein as unknown as new () => import("phaser").Scene;
}

function letter() {
  const el = document.querySelector("[data-squla-tijd]");
  return el ? getComputedStyle(el).fontFamily : "system-ui, sans-serif";
}

/* ---------- het vlak ---------- */

export function SqulaTijdTrein(props: TreinProps & Vlakbasis) {
  const { meld, schaal } = props;
  const { plek, scene } = useHoloMotor<TreinScene>(schaal, maakScene, { invoer: true });
  const meldRef = useRef(meld);
  useEffect(() => {
    meldRef.current = meld;
  }, [meld]);

  useEffect(() => {
    scene?.verbind((g) => meldRef.current(g));
  }, [scene]);

  const { nr, trein, treinKlein, licht, vandaag, stappen, plaatje, vandaagKaart, kaarten, kaartenActief, uit, goed, fout, kaartLicht, orden } = props;
  const stand = JSON.stringify({ nr, trein, treinKlein, licht, vandaag, stappen, plaatje, vandaagKaart, kaarten, kaartenActief, uit, goed, fout, kaartLicht, orden });
  useEffect(() => {
    if (scene) scene.zet(JSON.parse(stand) as TreinProps);
  }, [scene, stand]);

  const rit = props.rit;
  useEffect(() => {
    if (scene && rit) scene.rijIn();
  }, [scene, rit]);
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

  useEffect(() => {
    haalKeuzesAlvast(DAGEN.map((d) => d.naam));
  }, []);

  const ind = treinIndeling(props);
  const knoppen: { id: string; r: Rect; doe: () => void }[] = [];
  if (kaartenActief) (kaarten ?? []).forEach((k, i) => !uit?.includes(k.id) && knoppen.push({ id: k.id, r: ind.kaarten[i], doe: () => meld({ soort: "kaart", id: k.id }) }));
  if (orden?.actief)
    orden.losse.forEach((dag, i) => !orden.vakken.includes(dag) && knoppen.push({ id: dagNaam(dag), r: ind.losse[i], doe: () => meld({ soort: "leg", id: dagNaam(dag), vak: null }) }));

  return (
    <div className={s.vlak} data-squla-tijd="">
      <div ref={plek} style={{ ...HOLO_CANVAS, touchAction: "none" }} aria-hidden />
      <div data-knop="keuzes" className={s.knoppen}>
        {knoppen.map((k) => (
          <button
            key={k.id}
            type="button"
            className={s.ding}
            data-ding={k.id}
            aria-label={k.id}
            style={{ left: k.r.x - k.r.b / 2, top: k.r.y - k.r.h / 2, width: k.r.b, height: k.r.h }}
            onFocus={(e) => {
              if (e.currentTarget.matches(":focus-visible")) zegKeuze(k.id);
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

/** De tekening op de kaart aan het eind: dezelfde weektrein als de voorbeeldles. */
export { KaartWeektrein } from "./squla-dagen-trein";
