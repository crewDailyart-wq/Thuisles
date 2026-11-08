"use client";

/**
 * Het speelvlak van de lessen Klokkijken naar Squla groep 3 (31 oktober
 * 2026), in Phaser (HARDE REGEL 7). Bliepo tovert klokken en dingen
 * tevoorschijn vóór de donkere ruimte; zonder kader, los in de ruimte.
 *
 * Vier manieren van spelen (`modus`):
 * - `kies`: bovenaan wat er te zien is (`boven`), daaronder de dingen om op
 *   te tikken (`keuzes`): klokken, dingen, tekens, vinkje en kruisje.
 *   Meldt `{ soort: "kies", id: "k<i>" }`.
 * - `sleep`: tegeltjes (klokcijfers of klokjes) naar de vakken slepen, of
 *   tikken (dan gaat het tegeltje naar het eerste lege vak). Meldt
 *   `{ soort: "sleep", volgorde }` als alle vakken vol zijn.
 * - `memory`: zes bolletjes, drie paren. Eerst even open. Meldt
 *   `{ soort: "memory" }` als alles gevonden is.
 * - `verbind`: links en rechts wat bij elkaar hoort; tik links en dan
 *   rechts, dan komt er een lijntje. Meldt `{ soort: "verbind" }`.
 *
 * Gloed alleen op het moment dat het iets betekent (besluit Sara, 31
 * oktober): de dingen zijn gewoon, en lichten op bij aanwijzen (`licht`),
 * bij een goed antwoord (`goed`) en bij een gevonden paar.
 *
 * Elk tikbaar ding heeft een onzichtbare knop met `data-ding`; de
 * automatische test leest het goede ding uit `window.__phaser.antwoord`.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import type { Vlakbasis } from "../soort";
import { holoBasis, GOED, TX, VLAK_B, WARM, type PhaserModule } from "../holo/basis";
import { HOLO_CANVAS, useHoloMotor } from "../holo/motor";
import { speelLesgeluid } from "@/lib/lesgeluiden";
import { bliepoScherm } from "@/lib/bliepo-scherm";
import { dingSleutel, gloedVan, heeftWijzerGloed, laadKlokken, laadKlokTussen, maatVan, tekenDing, tekenReisTekst, tekenStof, tekenVraagKlok, tekenWijzerGloed, type Ding } from "./squla-klok-tekenen";
import { Klokje } from "./klok-wijzerklok";
import s from "./squla-klok.module.css";

/** Het zachte geluidje bij het oplichten van een wijzer staat voorlopig uit (BOUWREGELS 7.9). */
const OPLICHT_GELUID = false;


export type { Ding };

export type KlokVlakProps = {
  /** Nieuwe sleutel = nieuw beeld (Bliepo tovert alles opnieuw). */
  sleutel: string;
  modus: "kies" | "sleep" | "memory" | "verbind";
  boven?: Ding[];
  /** Een pijl tussen de twee dingen bovenaan (van … tot …). */
  pijl?: boolean;
  /** Kies: de dingen om op te tikken. Sleep: de tegeltjes (in de volgorde waarin ze klaarliggen). */
  keuzes?: Ding[];
  /** Memory en verbinden: de paren. */
  paren?: [Ding, Ding][];
  /** Verbinden: de volgorde van de rechterkant (indexen in `paren`). */
  rechts?: number[];
  /** Sleep met klokjes: het eerste vak, dat al vast staat. */
  vast?: Ding | null;
  sleepSoort?: "digi" | "klok";
  /** Sleep: per open vak het goede tegeltje (alleen voor de automatische test). */
  goedVolgorde?: number[];
  actief?: boolean;
  /** Ids die even oplichten (aanwijzen, samen kijken). */
  licht?: string[];
  goed?: string[];
  fout?: string[];
  uit?: string[];
  /**
   * Het verhaal naspelen (BOUWREGELS 1.22), bv. "de bus rijdt een uur naar school". Tijdens de vraag staat alleen het begin
   * in beeld: de klok bij de halte (`nu`), de weg met `label` en bij school een klok met een vraagteken. `speel` hoger
   * zetten (pas NA het antwoord) laat de bus rijden en de klok bij school `min` minuten verder draaien; dan meldt het vlak
   * `{ soort: "reis" }`. Zonder `reis` verandert er niets.
   */
  reis?: { naam: string; nu: { u: number; m: number }; min: number; label: string; speel: number };
  /**
   * Een ding bovenaan speelt het verhaal na (BOUWREGELS 1.22, 7 november 2026). Tijdens de vraag staat het ding stil (de
   * beginsituatie); pas als `speel` omhoog gaat (NA het antwoord) beweegt het: de bus rijdt weg, de oven gaat aan … Daarna
   * meldt het vlak `{ soort: "naspeel" }`. Zonder `naspeel` verandert er niets.
   */
  naspeel?: { soort: Naspeel; speel: number };
  /** Een ding als kleine, zachte sfeer-achtergrond (BOUWREGELS 1.22, oplossing 2): niet tikbaar, doet niet mee in de vraag. */
  sfeer?: { naam: string; plek?: "hoog" | "laag" };
  /** De vraagklok bovenaan krijgt een eigen vak met dit woord erboven (bv. "nu"), zodat vraag en antwoorden niet op elkaar lijken. */
  vraagLabel?: string;
};

/** Hoe een ding het verhaal naspeelt. */
export type Naspeel = "rijden" | "wegrijden" | "laden" | "aan" | "uit" | "uitDeOven" | "opstijgen" | "rijzen" | "op";

/* ---------- de scène ---------- */

type Staat = "gewoon" | "licht" | "goed" | "fout" | "uit";
type Item = { id: string; d: Ding; x: number; y: number; s: number; staat: Staat; draai?: boolean; sleept?: boolean };
type Lijn = { x1: number; y1: number; x2: number; y2: number; kleur: number };
type Vak = { x: number; y: number; b: number; h: number; rond: boolean };
type Kader = { x: number; y: number; b: number; h: number; warm?: boolean; label?: string; labelS?: number };
type Beeld = { sleutel: string; items: Item[]; lijnen: Lijn[]; vakken: Vak[]; pijlen: { x1: number; x2: number; y: number }[]; kaders?: Kader[] };

type ReisBeeld = { sleutel: string; naam: string; nu: { u: number; m: number }; min: number; label: string; maat?: ReisMaat };

interface KlokScene {
  zet(b: Beeld): void;
  sleepNaar(id: string, x: number, y: number): void;
  /** Het verhaal in de beginstand zetten (of weghalen met null). */
  reis(r: ReisBeeld | null): void;
  /** De tussenstanden van de klok bij school vooraf in plaatjes zetten (stil, een voor een). */
  bakReis(): void;
  /** Het verhaal nuspelen; `klaar` komt als alles stilstaat. */
  speelReis(klaar: () => void): void;
  /** Het ding met dit id speelt het verhaal na; `klaar` komt als het stilstaat. */
  naspeel(id: string, soort: Naspeel, klaar: () => void): void;
  /** Een kleine, zachte sfeer-achtergrond (of weg met null). */
  sfeer(s: { naam: string; plek?: "hoog" | "laag" } | null): void;
}

/** De stappen van de klok bij school: elke 5 minuten, van nu tot nu + min. */
export function reisStappen(nu: { u: number; m: number }, min: number): { u: number; m: number }[] {
  const begin = (nu.u % 12) * 60 + nu.m;
  return Array.from({ length: Math.round(min / 5) + 1 }, (_, k) => {
    const t = (begin + k * 5) % 720;
    return { u: Math.floor(t / 60), m: t % 60 };
  });
}

/* Indeling van het verhaal (punten van het vlak). */
type ReisMaat = { klokL: number; klokR: number; klokY: number; wegY: number; wegVan: number; wegTot: number; busVan: number; busNaar: number; busY: number; klokS: number; busS: number; labelS: number };
const REIS: ReisMaat = { klokL: 135, klokR: 845, klokY: 205, wegY: 352, wegVan: 240, wegTot: 745, busVan: 330, busNaar: 640, busY: 312, klokS: 0.9, busS: 0.8, labelS: 0.8 };

/**
 * Het verhaal op een staand scherm (BOUWREGELS 1.24, 7 november 2026): de klokken bij de halte en bij school veel groter,
 * bovenaan links en rechts; de weg met de bus eronder. Alles past tussen 0 en `bodem` (punten van het vlak).
 */
function reisStaand(bodem: number): ReisMaat {
  const k = Math.max(0.55, Math.min(1.2, bodem / 640));
  const klokS = 1.7 * k;
  const r = 110 * klokS;
  const klokY = Math.max(r + 16, (bodem - 640 * k) / 2 + r + 16);
  const wegY = klokY + r + 120 * k;
  return { klokL: 20 + r, klokR: 960 - r, klokY, wegY, wegVan: 40, wegTot: 940, busVan: 20 + r, busNaar: 960 - r, busY: wegY - 40 * Math.min(1.4, k * 1.4), klokS, busS: 1.1 * k, labelS: 1.2 * k };
}

function maakKlokScene(Phaser: PhaserModule, rustig: boolean) {
  const Basis = holoBasis(Phaser, rustig);
  type Img = import("phaser").GameObjects.Image;
  type Gfx = import("phaser").GameObjects.Graphics;
  type Stuk = { img: Img; tex: string; staat: Staat; ring: Img | null; item: Item; wGloed: Img | null; wGloedSl: string };

  class Klok extends Basis implements KlokScene {
    stukken = new Map<string, Stuk>();
    sleutel = "";
    lijnen: Gfx | null = null;
    vakGfx: Gfx | null = null;
    rij: (() => void)[] = [];
    drukTot = 0;
    laatste: Beeld | null = null;
    verhaal: { r: ReisBeeld; weg: Gfx; label: Img; links: Img; rechts: Img; bus: Img; token: number } | null = null;
    verhaalTeller = 0;
    labels: Img[] = [];
    kaderSl = "";
    /** De indeling van het verhaal (bus, weg, klokken); op een staand scherm groter. */
    R: ReisMaat = REIS;
    sfeerBeeld: { sl: string; img: Img } | null = null;

    constructor() {
      super("squla-klok");
    }

    maak() {
      this.lijnen = this.add.graphics().setDepth(1);
      this.vakGfx = this.add.graphics().setDepth(0);
      /* Gloed vooruit bakken, alleen als er niets beweegt (geen hapering). */
      this.time.addEvent({
        delay: 120,
        loop: true,
        callback: () => {
          if (!this.rij.length || performance.now() < this.drukTot) return;
          this.rij.shift()!();
          this.druk(120);
        },
      });
    }

    druk(ms: number) {
      this.drukTot = Math.max(this.drukTot, performance.now() + ms);
    }

    /**
     * Een plaatje van een ding. `f` = 2: op dubbele maat (een heel grote klok op een staand scherm, BOUWREGELS 1.24),
     * zodat hij scherp blijft; zie `fVan`. Alle andere dingen houden hun gewone plaatje (f = 1).
     */
    tex(d: Ding, f = 1) {
      const sl = f > 1 ? `${dingSleutel(d)}@${f}` : dingSleutel(d);
      const { b, h } = maatVan(d);
      this.canvasPlaatje(sl, b * f, h * f, (c) => {
        if (f > 1) c.scale(f, f);
        tekenDing(c, d);
      });
      return sl;
    }

    texGloed(d: Ding, f = 1) {
      const sl = this.tex(d, f);
      this.bak(sl, `${sl}-g`, gloedVan(d));
      return `${sl}-g`;
    }

    texVoor(d: Ding, staat: Staat, f = 1) {
      /* Wijst Bliepo een wijzer aan, dan lichten alleen de randen van die wijzer op (aparte laag), niet de hele klok (Sara, 6 november 2026). */
      if (staat === "licht" && heeftWijzerGloed(d)) return this.tex(d, f);
      return staat === "licht" || staat === "goed" ? this.texGloed(d, f) : this.tex(d, f);
    }

    /** De glow langs de rand van de aangewezen wijzer: een aparte, transparante laag die zacht pulseert. */
    texWijzerGloed(d: Ding, f = 1) {
      const sl = f > 1 ? `kg:${dingSleutel(d)}@${f}` : `kg:${dingSleutel(d)}`;
      const { b, h } = maatVan(d);
      this.canvasPlaatje(sl, b * f, h * f, (c) => {
        if (f > 1) c.scale(f, f);
        if (d.t === "wijzer") tekenWijzerGloed(c, d);
      });
      return sl;
    }

    zetWijzerGloed(st: Stuk) {
      const d = st.item.d;
      const sl = heeftWijzerGloed(d) ? this.texWijzerGloed(d, fVan(st.item)) : "";
      if (st.wGloedSl === sl) {
        if (st.wGloed) st.wGloed.setPosition(st.img.x, st.img.y).setScale(st.img.scaleX, st.img.scaleY);
        return;
      }
      st.wGloed?.destroy();
      st.wGloed = null;
      st.wGloedSl = sl;
      if (!sl) return;
      const g = this.add.image(st.img.x, st.img.y, sl).setScale(st.img.scaleX, st.img.scaleY).setDepth(st.img.depth + 0.5);
      st.wGloed = g;
      if (rustig) return;
      g.setAlpha(0.6);
      this.tweens.add({ targets: g, alpha: 1, duration: 700, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    }

    ringVoor(it: Item, staat: Staat) {
      if (staat !== "licht" && staat !== "goed") return null;
      /* Bij de wijzerklok geen gouden ring (Sara, 6 november 2026): alleen de kleur achter de aangewezen wijzer. */
      if (it.d.t === "wijzer") return null;
      const { b, h } = maatVan(it.d);
      /* een ring alleen om ronde of vierkante dingen; brede dingen lichten alleen op */
      if (Math.max(b, h) / Math.min(b, h) > 1.4) return null;
      const r = (Math.max(b, h) * it.s) / 2 + 10;
      return this.selectieRing(it.x, it.y, r, staat === "goed" ? GOED : WARM).setDepth(2);
    }

    zetStaat(st: Stuk, staat: Staat) {
      const oud = st.staat;
      st.staat = staat;
      const tex = this.texVoor(st.item.d, staat, fVan(st.item));
      if (tex !== st.tex) {
        st.img.setTexture(tex);
        st.tex = tex;
      }
      st.ring?.destroy();
      st.ring = this.ringVoor(st.item, staat);
      if (staat === "goed" && oud !== "goed") this.golf(st.item.x, st.item.y);
      if (staat === "fout" && oud !== "fout") this.schud(st.img);
      st.img.setAlpha(staat === "uit" ? 0.3 : staat === "fout" ? 0.5 : 1);
    }

    zet(b: Beeld) {
      this.laatste = b;
      this.druk(600);
      /* Bij een nieuw beeld: eerst het oude weg, dan pas het nieuwe (ook de vakken), zodat er nooit 2 klokken in
         één vak staan (keuring herstel A, 7 november 2026). */
      let wacht = 0;
      if (b.sleutel !== this.sleutel) {
        this.sleutel = b.sleutel;
        this.events.emit("kk-sleutel");
        if (this.stukken.size && !rustig) wacht = 200;
        for (const st of this.stukken.values()) {
          st.ring?.destroy();
          st.wGloed?.destroy();
          /* ook een bus die nog naspeelt (stuiteren, rijden) moet echt weg */
          this.tweens.killTweensOf(st.img);
          this.verdwijn(st.img);
        }
        this.stukken.clear();
        this.wisselVakken(b, wacht);
      } else if (JSON.stringify(b.kaders ?? []) !== this.kaderSl) this.tekenVakken(b);
      const nu = new Set(b.items.map((i) => i.id));
      for (const [id, st] of this.stukken) {
        if (nu.has(id)) continue;
        st.ring?.destroy();
        st.wGloed?.destroy();
        this.verdwijn(st.img);
        this.stukken.delete(id);
      }
      let n = 0;
      for (const it of b.items) {
        const st = this.stukken.get(it.id);
        if (!st) {
          const tex = this.texVoor(it.d, it.staat, fVan(it));
          const img = this.plaats(tex, it.x, it.y).setScale(it.s / (TX * fVan(it))).setDepth(it.sleept ? 4 : 3);
          const nieuw: Stuk = { img, tex, staat: "gewoon", ring: null, item: it, wGloed: null, wGloedSl: "" };
          this.stukken.set(it.id, nieuw);
          this.time.delayedCall(rustig ? 0 : 300, () => nieuw.img.active && this.zetWijzerGloed(nieuw));
          this.tover(img, { vertraging: wacht + n++ * 70 });
          if (it.staat !== "gewoon") this.time.delayedCall(rustig ? 0 : 400, () => nieuw.img.active && this.zetStaat(nieuw, it.staat));
          continue;
        }
        /* Begint een wijzer nu op te lichten (nieuwe aanwijzing): één zacht geluidje en één keer kort pulseren (BOUWREGELS 7.9). */
        const nadrukNu = it.d.t === "wijzer" ? it.d.nadruk : undefined;
        const nadrukVoor = st.item.d.t === "wijzer" ? st.item.d.nadruk : undefined;
        if (nadrukNu && nadrukNu !== nadrukVoor) {
          /* Het oplicht-geluidje staat voorlopig uit (Sara, 6 november 2026: "misschien later"); `OPLICHT_GELUID = true` zet het weer aan. */
          if (OPLICHT_GELUID) speelLesgeluid("oplicht");
        }
        const oudD = `${dingSleutel(st.item.d)}@${fVan(st.item)}`;
        const verplaatst = st.item.x !== it.x || st.item.y !== it.y;
        st.item = it;
        st.img.setDepth(it.sleept ? 4 : 3);
        if (oudD !== `${dingSleutel(it.d)}@${fVan(it)}`) {
          /* een memorykaartje draait om */
          const wissel = () => {
            st.tex = this.texVoor(it.d, st.staat, fVan(it));
            st.img.setTexture(st.tex);
          };
          if (it.draai && !rustig) {
            this.tweens.add({
              targets: st.img,
              scaleX: 0,
              duration: 110,
              onComplete: () => {
                wissel();
                this.tweens.add({ targets: st.img, scaleX: it.s / (TX * fVan(it)), duration: 130 });
              },
            });
          } else wissel();
        }
        if (verplaatst) {
          if (it.sleept || rustig) st.img.setPosition(it.x, it.y);
          else this.tweens.add({ targets: st.img, x: it.x, y: it.y, duration: 220, ease: "Cubic.easeOut" });
        }
        st.img.setScale(it.s / (TX * fVan(it)));
        if (st.staat !== it.staat || (verplaatst && st.ring)) this.zetStaat(st, it.staat);
        this.zetWijzerGloed(st);
      }
      this.tekenLijnen(b);
      /* de gloed van alles in beeld vooruit bakken */
      if (!b.sleutel.includes("-demo-")) this.rij = b.items.map((it) => () => void this.texGloed(it.d, fVan(it)));
    }


    /* ---------- het verhaal naspelen (BOUWREGELS 1.22) ---------- */

    reisSl(t: { u: number; m: number }) {
      return `reis-f:${t.u % 12}:${t.m}`;
    }

    /** Een tussenstand van de klok bij school als textuur (één keer). */
    reisFrame(t: { u: number; m: number }) {
      const sl = this.reisSl(t);
      this.canvasPlaatje(sl, 220, 220, (c) => tekenDing(c, { t: "wijzer", u: t.u === 0 ? 12 : t.u, m: t.m, kleur: "blauw" }));
      return sl;
    }

    reis(r: ReisBeeld | null) {
      if (!r || this.verhaal?.r.sleutel !== r.sleutel) {
        const v = this.verhaal;
        if (v) {
          this.verhaalTeller++;
          this.tweens.killTweensOf([v.bus, v.rechts, v.links, v.label]);
          for (const o of [v.weg, v.label, v.links, v.rechts, v.bus]) o.destroy();
          this.verhaal = null;
        }
      }
      if (!r || this.verhaal) return;
      this.R = r.maat ?? REIS;
      const weg = this.add.graphics().setDepth(0.5);
      /* een platte weg-strook: donkergrijs wegdek met een onderbroken witte middenstreep, geen rand, geen capsule */
      weg.fillStyle(0x3a3f4a, 1);
      weg.fillRect(this.R.wegVan, this.R.wegY - 18, this.R.wegTot - this.R.wegVan, 36);
      weg.fillStyle(0xffffff, 0.9);
      for (let x = this.R.wegVan + 12; x < this.R.wegTot - 30; x += 56) weg.fillRect(x, this.R.wegY - 2, 30, 4);
      weg.setAlpha(0);
      this.tweens.add({ targets: weg, alpha: 1, duration: rustig ? 1 : 350 });
      const lsl = `reis-lbl:${r.label}`;
      this.canvasPlaatje(lsl, 200, 60, (c) => tekenReisTekst(c, r.label));
      const label = this.plaats(lsl, (this.R.wegVan + this.R.wegTot) / 2, this.R.wegY + 40).setScale(this.R.labelS / TX).setDepth(1);
      this.canvasPlaatje("reis-vraag", 220, 220, (c) => tekenVraagKlok(c));
      this.canvasPlaatje("reis-stof", 64, 64, (c) => tekenStof(c));
      const links = this.plaats(this.tex({ t: "wijzer", u: r.nu.u, m: r.nu.m, kleur: "blauw" }), this.R.klokL, this.R.klokY).setScale(this.R.klokS / TX).setDepth(3);
      const rechts = this.plaats("reis-vraag", this.R.klokR, this.R.klokY).setScale(this.R.klokS / TX).setDepth(3);
      const bus = this.plaats(this.tex({ t: "vw", naam: r.naam }), this.R.busVan, this.R.busY).setScale(this.R.busS / TX).setDepth(3);
      this.verhaal = { r, weg, label, links, rechts, bus, token: ++this.verhaalTeller };
      this.tover(links, { vertraging: 0 });
      this.tover(bus, { vertraging: 70 });
      this.tover(rechts, { vertraging: 140 });
    }

    bakReis() {
      const v = this.verhaal;
      if (!v) return;
      const stappen = reisStappen(v.r.nu, v.r.min);
      const token = v.token;
      let k = 0;
      /* een plaatje per 100 ms: stil, geen hapering */
      this.time.addEvent({
        delay: 100,
        repeat: stappen.length - 1,
        callback: () => {
          if (!this.verhaal || this.verhaal.token !== token) return;
          this.reisFrame(stappen[k++]);
        },
      });
    }

    speelReis(klaar: () => void) {
      const v = this.verhaal;
      if (!v) return klaar();
      const token = v.token;
      const stappen = reisStappen(v.r.nu, v.r.min);
      const leeft = () => !!this.verhaal && this.verhaal.token === token;
      const eind = () => leeft() && klaar();
      const frameOp = (k: number) => {
        /* een stand die (nog) niet bestaat: de dichtstbijzijnde die er wel is */
        for (let j = k; j >= 0; j--) if (this.textures.exists(this.reisSl(stappen[j]))) return this.reisSl(stappen[j]);
        return this.reisFrame(stappen[k]);
      };
      if (rustig) {
        v.rechts.setTexture(this.reisFrame(stappen[stappen.length - 1]));
        v.bus.setX(this.R.busNaar);
        this.time.delayedCall(400, eind);
        return;
      }
      const duur = 2400;
      const start = 450;
      /* 1. het vraagteken-klokje draait om en laat de klok van nu zien */
      this.tweens.add({
        targets: v.rechts,
        scaleX: 0,
        duration: 140,
        onComplete: () => {
          if (!leeft()) return;
          v.rechts.setTexture(frameOp(0));
          this.tweens.add({ targets: v.rechts, scaleX: this.R.klokS / TX, duration: 160, ease: "Back.easeOut" });
        },
      });
      /* 2. de bus rijdt, met een stuiterend busje */
      this.tweens.add({ targets: v.bus, x: this.R.busNaar, delay: start, duration: duur, ease: "Sine.easeInOut" });
      const hop = this.tweens.add({ targets: v.bus, y: this.R.busY - 7, angle: -1.2, delay: start, duration: 120, yoyo: true, repeat: Math.floor(duur / 240), ease: "Sine.easeInOut" });
      /* een stofwolkje achter de bus dat vervaagt */
      const stof = this.time.addEvent({
        delay: 110,
        startAt: 0,
        repeat: Math.floor(duur / 110),
        callback: () => {
          if (!leeft()) return;
          const wolk = this.plaats("reis-stof", v.bus.x - 80, this.R.wegY - 6).setScale(0.35 / TX).setAlpha(0.6).setDepth(2.5);
          this.tweens.add({ targets: wolk, scale: 1.1 / TX, alpha: 0, y: wolk.y - 22, x: wolk.x - 14, duration: 520, ease: "Cubic.easeOut", onComplete: () => wolk.destroy() });
        },
      });
      stof.paused = true;
      this.time.delayedCall(start, () => (stof.paused = false));
      /* 3. de wijzers bij school draaien mee: elke stap een nieuw plaatje van de klok (flipboek) */
      const n = stappen.length - 1;
      const stap = (duur - 200) / Math.max(1, n);
      for (let k = 1; k <= n; k++) {
        this.time.delayedCall(start + 100 + k * stap, () => {
          if (leeft()) v.rechts.setTexture(frameOp(k));
        });
      }
      /* 4. aangekomen: het busje komt tot rust, de klok springt even op */
      this.time.delayedCall(start + duur, () => {
        if (!leeft()) return;
        hop.stop();
        v.bus.setY(this.R.busY).setAngle(0);
        this.tweens.add({ targets: v.bus, scaleY: (this.R.busS / TX) * 0.94, duration: 90, yoyo: true, ease: "Sine.easeOut" });
        v.rechts.setTexture(frameOp(n));
        this.tweens.add({ targets: v.rechts, scale: (this.R.klokS / TX) * 1.07, duration: 140, yoyo: true, ease: "Sine.easeOut" });
        this.golf(this.R.klokR, this.R.klokY);
      });
      this.time.delayedCall(start + duur + 600, eind);
    }

    /* ---------- een ding speelt het verhaal na (BOUWREGELS 1.22) ---------- */

    /** Staat er niets anders op deze plek (midden x, y; halve breedte b, halve hoogte h)? */
    vrijOp(eigen: string, x: number, y: number, b: number, h: number) {
      for (const [id, st] of this.stukken) {
        if (id === eigen) continue;
        const m = maatVan(st.item.d);
        if (Math.abs(st.item.x - x) < b + (m.b * st.item.s) / 2 && Math.abs(st.item.y - y) < h + (m.h * st.item.s) / 2) return false;
      }
      return true;
    }

    /** Hoeveel punten er rechts van `x` vrij zijn (op de hoogte van y ± h), tot het eerstvolgende ding of de rand. */
    ruimteRechts(eigen: string, x: number, y: number, h: number) {
      let vrij = VLAK_B - 16 - x;
      for (const [id, st] of this.stukken) {
        if (id === eigen) continue;
        const m = maatVan(st.item.d);
        const l = st.item.x - (m.b * st.item.s) / 2;
        const boven = st.item.y - (m.h * st.item.s) / 2;
        const onder = st.item.y + (m.h * st.item.s) / 2;
        if (l < x || onder < y - h || boven > y + h) continue;
        vrij = Math.min(vrij, l - x);
      }
      return vrij;
    }

    naspeel(id: string, soort: Naspeel, klaar: () => void) {
      const st = this.stukken.get(id);
      if (!st) return klaar();
      const img = st.img;
      const x0 = st.item.x;
      const y0 = st.item.y;
      const s0 = st.item.s / (TX * fVan(st.item));
      /* de maat van het ding als gewoon plaatje (f = 1), voor een taart die eruit springt */
      const s1 = st.item.s / TX;
      const sl = this.sleutel;
      const leeft = () => this.sleutel === sl && img.active;
      const eind = (ms: number) => this.time.delayedCall(ms, () => klaar());
      this.tweens.killTweensOf(img);
      img.setPosition(x0, y0).setScale(s0).setAngle(0).setAlpha(1);
      this.canvasPlaatje("reis-stof", 64, 64, (c) => tekenStof(c));
      const wolkjes = (n: number, elke: number, waar: () => { x: number; y: number }, opties: { dx?: number; dy?: number } = {}) => {
        if (rustig) return;
        this.time.addEvent({
          delay: elke,
          repeat: n - 1,
          callback: () => {
            if (!leeft()) return;
            const p = waar();
            const wolk = this.plaats("reis-stof", p.x, p.y).setScale(0.35 / TX).setAlpha(0.6).setDepth(2.5);
            this.tweens.add({ targets: wolk, scale: 1.1 / TX, alpha: 0, y: wolk.y + (opties.dy ?? -22), x: wolk.x + (opties.dx ?? -14), duration: 520, ease: "Cubic.easeOut", onComplete: () => wolk.destroy() });
          },
        });
      };
      const half = (maatVan(st.item.d).h * st.item.s) / 2;
      const breed = (maatVan(st.item.d).b * st.item.s) / 2;
      if (rustig) {
        if (soort === "wegrijden" || soort === "opstijgen" || soort === "op") img.setAlpha(0);
        if (soort === "uit") img.setTint(0x6d7280).setAlpha(0.75);
        if (soort === "aan") img.setTexture(this.texGloed(st.item.d, fVan(st.item)));
        return eind(400);
      }
      switch (soort) {
        case "rijden":
        case "wegrijden": {
          /* een stuiterend busje met een stofwolkje erachter; bij wegrijden rijdt hij het beeld uit */
          const weg = soort === "wegrijden";
          const duur = weg ? 2000 : 1000;
          /* rijden = een stukje vooruit en netjes stoppen, nooit tegen of onder de klok ernaast (keuring herstel A) */
          const vooruit = Math.max(0, Math.min(70, this.ruimteRechts(id, x0 + breed, y0, half) - 24));
          /* wegrijden = de verte in (kleiner en hoger), achter de klok langs; rijden = een stukje vooruit en stoppen */
          img.setDepth(2.8);
          this.tweens.add({ targets: img, scaleY: s0 * 0.94, duration: 90, yoyo: true, repeat: 1 });
          this.tweens.add({ targets: img, x: weg ? x0 + 170 : x0 + vooruit, delay: 200, duration: duur, ease: weg ? "Sine.easeIn" : "Sine.easeInOut" });
          if (weg) this.tweens.add({ targets: img, scaleX: s0 * 0.45, scaleY: s0 * 0.45, y: y0 - 60, delay: 300, duration: duur, ease: "Sine.easeIn" });
          const hop = this.tweens.add({ targets: img, ...(weg ? {} : { y: y0 - 7 }), angle: -1.2, delay: 200, duration: 120, yoyo: true, repeat: Math.floor(duur / 240), ease: "Sine.easeInOut" });
          wolkjes(Math.floor(duur / 110), 110, () => ({ x: img.x - breed * 0.85, y: y0 + half * 0.55 }));
          if (weg) this.tweens.add({ targets: img, alpha: 0, delay: 200 + duur - 400, duration: 400 });
          this.time.delayedCall(200 + duur, () => {
            if (!leeft()) return;
            hop.stop();
            img.setAngle(0);
            if (!weg) img.setY(y0);
            if (!weg) this.tweens.add({ targets: img, scaleY: s0 * 0.94, duration: 90, yoyo: true, ease: "Sine.easeOut" });
          });
          return eind(200 + duur + 250);
        }
        case "laden": {
          /* de bus zakt bij elk pakje even in en veert terug */
          this.tweens.add({ targets: img, scaleY: s0 * 0.9, y: y0 + half * 0.08, duration: 160, yoyo: true, repeat: 2, hold: 120, ease: "Sine.easeOut" });
          this.time.delayedCall(1200, () => leeft() && this.golf(x0, y0, WARM));
          return eind(1500);
        }
        case "aan": {
          /* de oven gaat aan: hij gloeit warm op en pulseert zacht */
          img.setTexture(this.texGloed(st.item.d, fVan(st.item)));
          this.tweens.add({ targets: img, scale: s0 * 1.05, duration: 380, yoyo: true, repeat: 2, ease: "Sine.easeInOut" });
          this.golf(x0, y0, WARM);
          return eind(1500);
        }
        case "uit": {
          /* het lampje (of de oven) gaat uit: het wordt grijs en donker */
          this.tweens.add({ targets: img, scale: s0 * 0.96, duration: 120, yoyo: true });
          this.tweens.addCounter({
            from: 255,
            to: 110,
            delay: 150,
            duration: 900,
            onUpdate: (t) => {
              if (!leeft()) return;
              const v = Math.round(t.getValue() ?? 255);
              img.setTint(Phaser.Display.Color.GetColor(v, v, Math.min(255, v + 15)));
            },
          });
          return eind(1300);
        }
        case "uitDeOven": {
          /* de ovendeur springt open: de oven veert, en een taart springt eruit en landt ernaast */
          this.tweens.add({ targets: img, scaleY: s0 * 0.92, duration: 110, yoyo: true, repeat: 1 });
          const taart = this.plaats(this.tex({ t: "vw", naam: "taart" }), x0, y0 + half * 0.2).setScale(s1 * 0.25).setDepth(3.5).setAlpha(0);
          /* De taart landt netjes naast de oven, helemaal in beeld; is daar geen plek, dan bovenop de oven
             (keuring herstel A, 7 november 2026: niet half over de oven, niet tegen de rand). */
          const tb = (maatVan({ t: "vw", naam: "taart" }).b * st.item.s * 0.5) / 2;
          const th = (maatVan({ t: "vw", naam: "taart" }).h * st.item.s * 0.5) / 2;
          const linksX = x0 - breed - tb - 6;
          const rechtsX = x0 + breed + tb + 6;
          const vrijLinks = linksX - tb > 24 && this.vrijOp(id, linksX, y0 + half - th, tb, th);
          const vrijRechts = rechtsX + tb < VLAK_B - 24 && this.vrijOp(id, rechtsX, y0 + half - th, tb, th);
          const naast = vrijLinks || vrijRechts;
          const doelX = vrijLinks ? linksX : vrijRechts ? rechtsX : x0;
          const doelY = naast ? y0 + half - th * 0.9 : Math.max(th + 8, y0 - half - th * 0.55);
          this.tweens.add({ targets: taart, alpha: 1, scale: s1 * 0.5, delay: 250, duration: 260, ease: "Back.easeOut" });
          this.tweens.add({ targets: taart, x: doelX, delay: 250, duration: 700, ease: "Sine.easeOut" });
          this.tweens.add({ targets: taart, y: Math.min(y0 - half * 0.7, doelY - 60), delay: 250, duration: 350, ease: "Sine.easeOut", onComplete: () => leeft() && this.tweens.add({ targets: taart, y: doelY, duration: 350, ease: "Bounce.easeOut" }) });
          this.time.delayedCall(1000, () => {
            if (!leeft()) return taart.destroy();
            wolkjes(3, 60, () => ({ x: doelX + (Math.random() - 0.5) * 40, y: doelY + th * 0.7 }), { dy: -10, dx: 0 });
          });
          this.events.once("kk-sleutel", () => taart.destroy());
          this.time.delayedCall(6000, () => !leeft() && taart.active && taart.destroy());
          return eind(1500);
        }
        case "opstijgen": {
          /* het raketje trilt even, en schiet dan omhoog met wolkjes eronder */
          this.tweens.add({ targets: img, x: x0 + 4, duration: 50, yoyo: true, repeat: 5 });
          this.tweens.add({ targets: img, y: y0 - 520, delay: 450, duration: 1100, ease: "Cubic.easeIn" });
          this.tweens.add({ targets: img, alpha: 0, delay: 1250, duration: 300 });
          this.time.delayedCall(350, () => wolkjes(10, 80, () => ({ x: img.x, y: img.y + half * 0.9 }), { dy: 26, dx: 0 }));
          return eind(1700);
        }
        case "rijzen": {
          /* het deeg rijst: de kom wordt stap voor stap een beetje hoger */
          this.tweens.add({ targets: img, scaleY: s0 * 1.1, scaleX: s0 * 1.03, y: y0 - half * 0.08, duration: 900, ease: "Back.easeOut" });
          this.time.delayedCall(900, () => leeft() && this.golf(x0, y0, WARM));
          return eind(1300);
        }
        case "op": {
          /* de taart is op: hij wordt in 3 hapjes kleiner en is dan weg */
          for (let k = 1; k <= 3; k++) {
            this.time.delayedCall(k * 380, () => {
              if (!leeft()) return;
              this.tweens.add({ targets: img, scale: s0 * (1 - k * 0.3), duration: 140, ease: "Back.easeIn" });
              wolkjes(2, 50, () => ({ x: x0 + (Math.random() - 0.5) * breed, y: y0 }), { dy: -18, dx: 0 });
            });
          }
          this.tweens.add({ targets: img, alpha: 0, delay: 1300, duration: 250 });
          return eind(1700);
        }
      }
    }

    sfeer(s: { naam: string; plek?: "hoog" | "laag" } | null) {
      const sl = s ? `${s.naam}:${s.plek ?? ""}` : "";
      if (this.sfeerBeeld?.sl === sl) return;
      if (this.sfeerBeeld) {
        const oud = this.sfeerBeeld.img;
        this.tweens.killTweensOf(oud);
        this.tweens.add({ targets: oud, alpha: 0, duration: rustig ? 1 : 250, onComplete: () => oud.destroy() });
        this.sfeerBeeld = null;
      }
      if (!s) return;
      /* klein en zacht linksboven; "hoog" staat hoger, "laag" lager en warmer (een zon die zakt) */
      const plek = s.plek === "hoog" ? { x: 150, y: 95 } : s.plek === "laag" ? { x: 105, y: 330 } : { x: 120, y: 130 };
      const img = this.plaats(this.tex({ t: "vw", naam: s.naam }), plek.x, plek.y).setScale(0.62 / TX).setDepth(0.2).setAlpha(0);
      if (s.plek === "laag") img.setTint(0xffb27a);
      this.sfeerBeeld = { sl, img };
      this.tweens.add({ targets: img, alpha: 0.5, duration: rustig ? 1 : 500 });
      if (!rustig) this.tweens.add({ targets: img, y: plek.y - 5, duration: 2600, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    }

    sleepNaar(id: string, x: number, y: number) {
      const st = this.stukken.get(id);
      if (!st) return;
      st.img.setPosition(x, y).setDepth(4);
      st.ring?.setPosition(x, y);
    }

    /** Het nieuwe beeld: de oude vakken (en hun woord) vervagen, de nieuwe komen pas als het oude weg is. */
    wisselVakken(b: Beeld, wacht: number) {
      if (!wacht) return void this.tekenVakken(b);
      const oud = this.vakGfx;
      if (oud) this.tweens.add({ targets: oud, alpha: 0, duration: 180, onComplete: () => oud.destroy() });
      for (const l of this.labels) this.tweens.add({ targets: l, alpha: 0, duration: 180, onComplete: () => l.destroy() });
      this.labels = [];
      this.vakGfx = this.add.graphics().setDepth(0).setAlpha(0);
      this.tekenVakken(b);
      for (const l of this.labels) l.setAlpha(0);
      this.tweens.add({ targets: [this.vakGfx, ...this.labels], alpha: 1, delay: wacht, duration: 220 });
    }

    tekenVakken(b: Beeld) {
      this.kaderSl = JSON.stringify(b.kaders ?? []);
      const g = this.vakGfx!;
      g.clear();
      for (const l of this.labels) l.destroy();
      this.labels = [];
      /* de vakken van de keuzes (zacht, half doorzichtig, ronde hoeken, zoals bij de geldles; Sara, 7 november 2026) */
      for (const k of b.kaders ?? []) {
        g.fillStyle(k.warm ? 0xffd36e : 0xcfe3ff, k.warm ? 0.16 : 0.13);
        g.fillRoundedRect(k.x - k.b / 2, k.y - k.h / 2, k.b, k.h, 34);
        if (k.warm) {
          g.lineStyle(3, 0xffd36e, 0.55);
          g.strokeRoundedRect(k.x - k.b / 2, k.y - k.h / 2, k.b, k.h, 34);
        }
        if (k.label) {
          const sl = `reis-lbl:${k.label}`;
          this.canvasPlaatje(sl, 200, 60, (c) => tekenReisTekst(c, k.label!));
          const ls = k.labelS ?? 0.95;
          this.labels.push(this.plaats(sl, k.x, k.y - k.h / 2 - 20 * (ls / 0.95)).setScale(ls / TX).setDepth(1));
        }
      }
      g.lineStyle(4, 0xbfe6ff, 0.75);
      for (const v of b.vakken) {
        /* een stippellijn rond de plek waar iets moet komen */
        const stukjes = v.rond ? 36 : 0;
        if (v.rond) {
          const r = v.b / 2;
          for (let i = 0; i < stukjes; i += 2) {
            const a1 = (i / stukjes) * Math.PI * 2;
            const a2 = ((i + 1) / stukjes) * Math.PI * 2;
            g.beginPath();
            g.arc(v.x, v.y, r, a1, a2);
            g.strokePath();
          }
        } else {
          const x0 = v.x - v.b / 2;
          const y0 = v.y - v.h / 2;
          const streep = (x1: number, y1: number, x2: number, y2: number) => {
            const lang = Math.hypot(x2 - x1, y2 - y1);
            const k = Math.max(1, Math.round(lang / 14));
            for (let i = 0; i < k; i += 2) g.lineBetween(x1 + ((x2 - x1) * i) / k, y1 + ((y2 - y1) * i) / k, x1 + ((x2 - x1) * (i + 1)) / k, y1 + ((y2 - y1) * (i + 1)) / k);
          };
          streep(x0, y0, x0 + v.b, y0);
          streep(x0 + v.b, y0, x0 + v.b, y0 + v.h);
          streep(x0 + v.b, y0 + v.h, x0, y0 + v.h);
          streep(x0, y0 + v.h, x0, y0);
        }
      }
      /* pijlen: van vroeg naar laat, of van … tot … */
      g.lineStyle(6, 0xffffff, 0.9);
      g.fillStyle(0xffffff, 0.9);
      for (const p of b.pijlen) {
        g.lineBetween(p.x1, p.y, p.x2 - 14, p.y);
        g.fillTriangle(p.x2, p.y, p.x2 - 18, p.y - 12, p.x2 - 18, p.y + 12);
      }
    }

    tekenLijnen(b: Beeld) {
      const g = this.lijnen!;
      g.clear();
      for (const l of b.lijnen) {
        g.lineStyle(7, l.kleur, 0.95);
        g.lineBetween(l.x1, l.y1, l.x2, l.y2);
        g.fillStyle(l.kleur, 1);
        g.fillCircle(l.x1, l.y1, 7);
        g.fillCircle(l.x2, l.y2, 7);
      }
    }

    /** Voor `npm run vloeiend`: steeds opnieuw tevoorschijn toveren, aanwijzen en goed. */
    demo(ms: number) {
      const eind = performance.now() + ms;
      const b = this.laatste;
      if (!b) return;
      /* Tijdens het meten niets bakken (dat gebeurt in de les in de stille stukjes); oplichten alleen met een al gebakken gloed. */
      this.rij = [];
      this.druk(ms + 500);
      const kanGloeien = this.textures.exists(`${dingSleutel(b.items[0]?.d ?? { t: "dicht" })}-g`);
      let k = 0;
      const stap = () => {
        if (performance.now() > eind) return;
        const nieuw = { ...b, sleutel: `${b.sleutel}-demo-${k++}`, items: b.items.map((i) => ({ ...i, staat: "gewoon" as Staat })) };
        this.zet(nieuw);
        if (kanGloeien) {
          this.time.delayedCall(450, () => this.zet({ ...nieuw, items: nieuw.items.map((i, j) => ({ ...i, staat: j === 0 ? ("licht" as Staat) : "gewoon" })) }));
          this.time.delayedCall(900, () => this.zet({ ...nieuw, items: nieuw.items.map((i, j) => ({ ...i, staat: j === 0 ? ("goed" as Staat) : "gewoon" })) }));
        } else this.time.delayedCall(900, () => this.golf(MIDX, 360));
        this.time.delayedCall(1400, stap);
      };
      stap();
    }
  }
  return Klok as unknown as new () => import("phaser").Scene;
}

/* ---------- indeling ---------- */

const MIDX = 490;

/** Schaal zodat een ding in een vak van tb × th past (nooit groter dan `max`). */
function past(d: Ding, tb: number, th: number, max = 1.6) {
  const { b, h } = maatVan(d);
  return Math.min(tb / b, th / h, max);
}

/** Een heel groot ding (alleen op een staand scherm) krijgt een plaatje op dubbele maat, zodat het scherp blijft. */
function fVan(it: { s: number }) {
  return it.s > 1.75 ? 2 : 1;
}

function rijX(n: number, gap: number) {
  return Array.from({ length: n }, (_, i) => MIDX + (i - (n - 1) / 2) * gap);
}

type Plek = { id: string; d: Ding; x: number; y: number; s: number };

function kiesIndeling(boven: Ding[], keuzes: Ding[], pijl: boolean, reis = false, vraagLabel?: string, klokRechts = false) {
  const plekken: Plek[] = [];
  const pijlen: Beeld["pijlen"] = [];
  const kaders: Kader[] = [];
  const klein = keuzes.every((k) => k.t === "vink" || k.t === "kruis");
  if (vraagLabel && keuzes.length) {
    /* Rekenen met de klok (Sara, 7 november 2026): de vraagklok groot in een eigen warm vak met een woord erboven,
       de antwoorden kleiner in hun eigen vakken in het midden. Zo zie je meteen welke klok de vraag is. */
    const klokI = boven.findIndex((d) => d.t === "wijzer");
    /* het vak "nu" staat altijd op dezelfde plek, midden bovenaan, ook als er een ding naast staat (keuring herstel A) */
    const kx = MIDX;
    boven.forEach((d, i) => {
      if (i === klokI) plekken.push({ id: `b${i}`, d, x: kx, y: 205, s: past(d, 250, 250) });
      else plekken.push({ id: `b${i}`, d, x: kx - 330, y: 215, s: past(d, 220, 220) });
    });
    if (klokI >= 0) kaders.push({ x: kx, y: 205, b: 290, h: 280, warm: true, label: vraagLabel });
    const gap = keuzes.length === 2 ? 300 : 270;
    const xs = rijX(keuzes.length, gap);
    keuzes.forEach((d, i) => {
      plekken.push({ id: `k${i}`, d, x: xs[i], y: 535, s: past(d, 200, 200) });
      kaders.push({ x: xs[i], y: 535, b: 240, h: 240 });
    });
    return { plekken, pijlen, kaders };
  }
  if (boven.length || reis) {
    /* met een sfeer-achtergrond staat de klok op dezelfde plek als naast een ding, zodat het beeld niet verspringt */
    /* een bus of oven naast de klok staat iets verder naar links, zodat hij kan rijden zonder tegen de klok te komen
       (keuring herstel A); de klok staat dan op dezelfde plek en is even groot als bij een sfeer-achtergrond */
    const dingKlok = boven.length === 2 && boven[0].t === "vw" && boven[1].t === "wijzer" && !keuzes.length;
    const bx = klokRechts && boven.length === 1 && !keuzes.length ? [MIDX + 190] : dingKlok ? [MIDX - 240, MIDX + 190] : rijX(boven.length, boven.length === 1 ? 0 : pijl ? 420 : 380);
    const by = keuzes.length ? 215 : 340;
    const zelfde = klokRechts && boven.length === 1 && !keuzes.length;
    boven.forEach((d, i) => plekken.push({ id: `b${i}`, d, x: bx[i], y: by, s: past(d, boven.length === 1 && !zelfde ? 440 : 330, keuzes.length ? 300 : 420) }));
    if (pijl && boven.length === 2) pijlen.push({ x1: MIDX - 50, x2: MIDX + 50, y: by });
    /* elke keuze in een eigen vak (Sara, 7 november 2026), behalve vinkje en kruisje; iets kleiner en hoger, zodat de vakken niet tegen de rand staan */
    const gap = klein ? 260 : keuzes.length === 2 ? 340 : 290;
    const kx = rijX(keuzes.length, gap);
    const ky = klein ? 548 : 530;
    keuzes.forEach((d, i) => plekken.push({ id: `k${i}`, d, x: kx[i], y: ky, s: past(d, klein ? 150 : keuzes.length === 2 ? 280 : 250, klein ? 150 : 215) }));
    if (!klein) keuzes.forEach((d, i) => kaders.push({ x: kx[i], y: ky, b: Math.min(gap - 26, maatVan(d).b * plekken[plekken.length - keuzes.length + i].s + 40), h: Math.min(260, maatVan(d).h * plekken[plekken.length - keuzes.length + i].s + 30) }));
  } else {
    const gap = keuzes.length === 2 ? 430 : 310;
    const kx = rijX(keuzes.length, gap);
    keuzes.forEach((d, i) => plekken.push({ id: `k${i}`, d, x: kx[i], y: 370, s: past(d, keuzes.length === 2 ? 370 : 285, 340) }));
    if (!klein) keuzes.forEach((d, i) => kaders.push({ x: kx[i], y: 370, b: Math.min(gap - 26, maatVan(d).b * plekken[i].s + 40), h: maatVan(d).h * plekken[i].s + 40 }));
  }
  return { plekken, pijlen, kaders };
}

/**
 * Staand scherm (telefoon rechtop; BOUWREGELS 1.24, 7 november 2026): het vlak is 980 punten breed en `hs` punten hoog
 * (720 of meer, zie `Vlakbasis.staandHoogte`). Alles komt groter en onder elkaar: de vraag (klok, ding) bovenaan,
 * de antwoorden in hun vakken onderaan. Op een liggend scherm wordt deze indeling nooit gebruikt.
 */
function kiesIndelingStaand(boven: Ding[], keuzes: Ding[], pijl: boolean, reis: boolean, vraagLabel: string | undefined, hs: number, sfeer = false) {
  const plekken: Plek[] = [];
  const pijlen: Beeld["pijlen"] = [];
  const kaders: Kader[] = [];
  const n = keuzes.length;
  const klein = n > 0 && keuzes.every((k) => k.t === "vink" || k.t === "kruis");
  const alleen = n > 0 && !boven.length && !reis;
  /* 3 of 4 keuzeklokken (keuring herstel AB2): naast elkaar werden ze op een staand scherm maar ±100 px met cijfers van
     ±7 px, terwijl er in de hoogte nog veel ruimte was. Daarom staan ze dan in 2 rijen (2 + 1 of 2 + 2), elk vak ±1,5 × zo
     groot. Alleen als de vraag erboven dan nog groot genoeg blijft (een vraagklok met "nu" houdt voorrang); anders blijft
     het 1 rij zoals eerst. Met een zachte sfeer-achtergrond linksboven staat de losse klok bovenaan (1 + 2), zodat de
     sfeer niet achter een klok verdwijnt. */
  const nodigBoven = alleen ? 0 : vraagLabel ? 460 : boven.some((d) => d.t === "wijzer" || d.t === "digi") ? 380 : 170;
  const vak2 = Math.min(440, Math.floor(alleen ? (hs - 60) / 2 : (hs - 26 - 40 - 44 - nodigBoven) / 2));
  const tweeRijen = !klein && (n === 3 || n === 4) && !reis && vak2 >= 340;
  let kY: number;
  let band: number;
  if (tweeRijen) {
    band = 2 * vak2 + 40;
    const midden = alleen ? hs / 2 : hs - 26 - band / 2;
    kY = midden;
    const losBoven = n === 3 && sfeer;
    keuzes.forEach((d, i) => {
      /* rij 0 en 1; bij 1 + 2 staat keuze 0 alleen bovenaan */
      const rij = losBoven ? (i === 0 ? 0 : 1) : i < 2 ? 0 : 1;
      const inRij = losBoven ? (rij === 0 ? 1 : 2) : rij === 0 ? Math.min(2, n) : n - 2;
      const kol = losBoven ? (i === 0 ? 0 : i - 1) : i % 2;
      const x = MIDX + (kol - (inRij - 1) / 2) * (vak2 + 20);
      const y = midden + (rij - 0.5) * (vak2 + 20);
      const sc = past(d, vak2 - 40, vak2 - 40, 3.6);
      plekken.push({ id: `k${i}`, d, x, y, s: sc });
      const m = maatVan(d);
      kaders.push({ x, y, b: Math.min(vak2, m.b * sc + 40), h: Math.min(vak2, m.h * sc + 30) });
    });
  } else {
    /* de antwoorden: één rij onderaan (alleen antwoorden: in het midden), zo groot als de breedte toelaat */
    const gap = n === 2 ? 460 : n >= 4 ? 240 : 318;
    const vakB = klein ? 220 : gap - 26;
    const vakH = klein ? 220 : Math.min(alleen ? Math.max(300, Math.min(vakB, hs - 120)) : 300, vakB);
    band = n ? vakH + 20 : 0;
    kY = alleen ? hs / 2 : hs - 26 - band / 2;
    rijX(n, klein ? 300 : gap).forEach((x, i) => {
      const d = keuzes[i];
      const sc = klein ? past(d, 200, 200, 2) : past(d, vakB - 36, vakH - 36, 3.2);
      plekken.push({ id: `k${i}`, d, x, y: kY, s: sc });
      if (!klein) {
        const m = maatVan(d);
        kaders.push({ x, y: kY, b: Math.min(vakB, m.b * sc + 40), h: Math.min(vakH, m.h * sc + 30) });
      }
    });
  }
  /* de vraag: alles boven de antwoorden */
  const bodem = n && !alleen ? kY - band / 2 - 34 : hs - 20;
  const hoog = bodem - 10;
  if (vraagLabel && boven.length) {
    const klokI = boven.findIndex((d) => d.t === "wijzer");
    const K = Math.max(260, Math.min(600, hoog - 80));
    const cy = 10 + 70 + K / 2 + Math.max(0, (hoog - 80 - K) / 2);
    const zij = Math.max(150, Math.min(220, MIDX - K / 2 - 20));
    boven.forEach((d, i) => {
      if (i === klokI) plekken.push({ id: `b${i}`, d, x: MIDX, y: cy, s: past(d, K - 40, K - 40, 3.2) });
      else plekken.push({ id: `b${i}`, d, x: Math.max(zij / 2 + 6, (MIDX - K / 2) / 2), y: cy, s: past(d, zij, zij, 2) });
    });
    if (klokI >= 0) kaders.push({ x: MIDX, y: cy, b: K, h: K, warm: true, label: vraagLabel, labelS: 1.7 });
    return { plekken, pijlen, kaders, reis: undefined as ReisMaat | undefined };
  }
  if (reis) return { plekken, pijlen, kaders, reis: reisStaand(bodem) };
  const midY = 10 + hoog / 2;
  if (boven.length === 1) {
    const d = boven[0];
    const max = d.t === "wijzer" ? 760 : n ? 420 : 520;
    plekken.push({ id: "b0", d, x: MIDX, y: midY, s: past(d, Math.min(900, max), Math.min(hoog - 20, max), 3.6) });
  } else if (boven.length === 2 && boven[0].t === "vw" && boven[1].t === "wijzer") {
    /* een ding dat het verhaal naspeelt (bus, oven) boven de klok, links, zodat het kan rijden zonder tegen de klok te komen */
    const dingH = Math.max(150, Math.min(260, hoog * 0.3));
    const klokH = Math.min(720, hoog - dingH - 20);
    plekken.push({ id: "b0", d: boven[0], x: 300, y: 10 + dingH / 2, s: past(boven[0], dingH * 1.3, dingH, 2) });
    plekken.push({ id: "b1", d: boven[1], x: MIDX, y: 10 + dingH + 20 + klokH / 2, s: past(boven[1], klokH, klokH, 3.6) });
  } else if (boven.length) {
    const gapB = Math.min(490, 960 / boven.length);
    const xs = rijX(boven.length, gapB);
    boven.forEach((d, i) => plekken.push({ id: `b${i}`, d, x: xs[i], y: midY, s: past(d, gapB - 60, Math.min(hoog - 20, gapB - 60), 3.2) }));
    if (pijl && boven.length === 2) pijlen.push({ x1: MIDX - 26, x2: MIDX + 26, y: midY });
  }
  return { plekken, pijlen, kaders, reis: undefined as ReisMaat | undefined };
}

/* ---------- het vlak ---------- */

export function SqulaKlokVlak(p: KlokVlakProps & Vlakbasis) {
  /* Op een staand scherm mag het vlak hoger worden (BOUWREGELS 1.24): het canvas is dan meteen zo hoog als kan. */
  const [staandMax] = useState(() => (typeof window !== "undefined" && window.innerHeight > window.innerWidth ? Math.ceil(Math.min(2 * 720, window.innerHeight / (p.schaal || 1))) : 0));
  const { plek, scene: motor } = useHoloMotor<KlokScene>(p.schaal, maakKlokScene, staandMax > 720 ? { hoogte: staandMax } : {});
  const hs = staandMax > 720 && p.staandHoogte && p.staandHoogte > 720 ? Math.min(p.staandHoogte, staandMax) : 720;
  const staand = staandMax > 0;
  const vlakRef = useRef<HTMLDivElement>(null);
  /* de wijzerklokken (plaatjes van de Synthesis-klok) moeten er zijn voordat er iets getekend wordt */
  const [klokken, setKlokken] = useState(false);
  useEffect(() => {
    let weg = false;
    void laadKlokken().then(() => !weg && setKlokken(true));
    return () => {
      weg = true;
    };
  }, []);
  const scene = klokken ? motor : null;
  return (
    <div className={s.vlak} ref={vlakRef} style={hs > 720 ? { bottom: "auto", height: hs } : undefined}>
      <div ref={plek} style={staandMax > 720 ? { ...HOLO_CANVAS, overflow: "hidden" } : HOLO_CANVAS} aria-hidden />
      {p.modus === "kies" && <Kies {...p} scene={scene} staand={staand} hs={hs} />}
      {p.modus === "sleep" && <Sleep key={p.sleutel} {...p} scene={scene} vlak={vlakRef} staand={staand} hs={hs} />}
      {p.modus === "memory" && <Memory key={p.sleutel} {...p} scene={scene} staand={staand} hs={hs} />}
      {p.modus === "verbind" && <Verbind key={p.sleutel} {...p} scene={scene} staand={staand} hs={hs} />}
    </div>
  );
}

/* Op een staand scherm mag dit vlak hoger worden dan 720 punten (Lesscherm geeft dan `staandHoogte`; BOUWREGELS 1.24). */
SqulaKlokVlak.staandGroei = true;

type Deel = KlokVlakProps & Vlakbasis & { scene: KlokScene | null; staand: boolean; hs: number };

/** De staat van een id uit de lijsten van de les. */
function staatVan(p: KlokVlakProps, id: string, eigen?: Staat): Staat {
  if (p.goed?.includes(id)) return "goed";
  if (p.fout?.includes(id)) return "fout";
  if (p.licht?.includes(id)) return "licht";
  if (p.uit?.includes(id)) return "uit";
  return eigen ?? "gewoon";
}

function Knop({ id, d, x, y, sch, aan, label, klik, extra, sleep }: { id: string; d: Ding; x: number; y: number; sch: number; aan: boolean; label: string; klik?: () => void; extra?: React.HTMLAttributes<HTMLButtonElement>; sleep?: boolean }) {
  const { b, h } = maatVan(d);
  const w = Math.max(64, b * sch);
  const hh = Math.max(64, h * sch);
  return (
    <button
      type="button"
      className={`${s.ding} ${sleep ? s.sleep : ""}`}
      style={{ left: x - w / 2, top: y - hh / 2, width: w, height: hh }}
      data-ding={id}
      disabled={!aan}
      aria-label={label}
      onClick={klik}
      {...extra}
    />
  );
}

function labelVan(d: Ding, i: number): string {
  switch (d.t) {
    case "wijzer":
      return `Wijzerklok ${i + 1}`;
    case "digi":
      return `Digitale klok ${d.tekst}`;
    case "vw":
      return d.naam;
    case "tekst":
    case "teken":
    case "tegel":
      return d.tekst;
    case "vink":
      return "Vinkje: goed";
    case "kruis":
      return "Kruisje: fout";
    case "dicht":
      return `Bolletje ${i + 1}`;
  }
}

/* --- kies --- */

function Kies(p: Deel) {
  const { scene, meld } = p;
  const { staand, hs } = p;
  const ind = useMemo(
    () => (staand ? kiesIndelingStaand(p.boven ?? [], p.keuzes ?? [], !!p.pijl, !!p.reis, p.vraagLabel, hs, !!p.sfeer) : { ...kiesIndeling(p.boven ?? [], p.keuzes ?? [], !!p.pijl, !!p.reis, p.vraagLabel, !!p.sfeer), reis: undefined as ReisMaat | undefined }),
    [p.boven, p.keuzes, p.pijl, p.reis, p.vraagLabel, p.sfeer, staand, hs],
  );
  const sleutelLijsten = JSON.stringify([p.licht, p.goed, p.fout, p.uit]);
  useEffect(() => {
    if (!scene) return;
    scene.zet({
      sleutel: p.sleutel,
      items: ind.plekken.map((q) => ({ ...q, staat: staatVan(p, q.id) })),
      lijnen: [],
      vakken: [],
      pijlen: ind.pijlen,
      kaders: ind.kaders,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, p.sleutel, ind, sleutelLijsten]);
  /* het verhaal (bus, weg, klokken): tijdens de vraag alleen het begin; het naspelen komt pas als `speel` omhoog gaat */
  const reis = p.reis;
  const reisSleutel = reis ? `${p.sleutel}:${reis.naam}:${reis.nu.u}:${reis.nu.m}:${reis.min}${ind.reis ? `:${Math.round(ind.reis.klokY)}` : ""}` : "";
  const gespeeld = useRef(0);
  useEffect(() => {
    if (!scene) return;
    if (!reis) {
      scene.reis(null);
      return;
    }
    scene.reis({ sleutel: reisSleutel, naam: reis.naam, nu: reis.nu, min: reis.min, label: reis.label, ...(ind.reis ? { maat: ind.reis } : {}) });
    let weg = false;
    void laadKlokTussen(reisStappen(reis.nu, reis.min)).then(() => !weg && scene.bakReis());
    return () => {
      weg = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, reisSleutel]);
  useEffect(() => {
    if (!scene || !reis) return;
    if (reis.speel === 0 || reis.speel === gespeeld.current) return;
    gespeeld.current = reis.speel;
    let weg = false;
    void laadKlokTussen(reisStappen(reis.nu, reis.min)).then(() => {
      if (!weg) scene.speelReis(() => meld({ soort: "reis" }));
    });
    return () => {
      weg = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, reis?.speel]);
  useEffect(() => () => scene?.reis(null), [scene]);
  /* een ding speelt het verhaal na (pas als `speel` omhoog gaat, dus na het antwoord) */
  const naspeel = p.naspeel;
  const naspeelGespeeld = useRef(0);
  useEffect(() => {
    if (!scene || !naspeel) return;
    if (naspeel.speel === 0 || naspeel.speel === naspeelGespeeld.current) return;
    naspeelGespeeld.current = naspeel.speel;
    const i = (p.boven ?? []).findIndex((d) => d.t === "vw");
    if (i < 0) return void meld({ soort: "naspeel" });
    scene.naspeel(`b${i}`, naspeel.soort, () => meld({ soort: "naspeel" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, naspeel?.speel]);
  /* de sfeer-achtergrond */
  const sfeerSl = p.sfeer ? `${p.sfeer.naam}:${p.sfeer.plek ?? ""}` : "";
  useEffect(() => {
    if (!scene) return;
    scene.sfeer(p.sfeer ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, sfeerSl]);
  useEffect(() => () => scene?.sfeer(null), [scene]);
  const aan = !!p.actief;
  return (
    <>
      {ind.plekken
        .filter((q) => q.id.startsWith("k"))
        .map((q, i) => (
          <Knop
            key={q.id}
            id={q.id}
            d={q.d}
            x={q.x}
            y={q.y}
            sch={q.s}
            aan={aan && !p.uit?.includes(q.id) && !p.fout?.includes(q.id)}
            label={labelVan(q.d, i)}
            klik={() => {
              speelLesgeluid("tik");
              meld({ soort: "kies", id: q.id });
            }}
          />
        ))}
    </>
  );
}

/* --- slepen --- */

function Sleep(p: Deel & { vlak: React.RefObject<HTMLDivElement | null> }) {
  const { scene, meld, schaal } = p;
  const tegels = useMemo(() => p.keuzes ?? [], [p.keuzes]);
  const klok = p.sleepSoort === "klok";
  const vast = klok ? (p.vast ?? null) : null;
  /* de vakken */
  const vakken = useMemo(() => {
    if (klok) return [0, 1, 2, 3].map((i) => ({ x: MIDX + (i - 1.5) * 215, y: 230, b: 186, h: 186, rond: true }));
    return [
      { x: MIDX - 135, y: 240, b: 140, h: 120, rond: false },
      { x: MIDX, y: 240, b: 80, h: 120, rond: false },
      { x: MIDX + 135, y: 240, b: 140, h: 120, rond: false },
    ];
  }, [klok]);
  const open = useMemo(() => vakken.map((_, i) => i).filter((i) => !(klok && i === 0)), [vakken, klok]);
  const bak = useMemo(() => rijX(tegels.length, klok ? 240 : 210).map((x) => ({ x, y: 540 })), [tegels.length, klok]);
  const tegelS = (d: Ding) => (klok ? past(d, 170, 170) : 1);

  /* waar elk tegeltje ligt: -1 = in de bak, anders het vak */
  const [waar, setWaar] = useState<number[]>(() => tegels.map(() => -1));
  const [sleep, setSleep] = useState<{ i: number; x: number; y: number } | null>(null);
  const klaar = useRef(false);
  const vol = open.every((v) => waar.includes(v));

  useEffect(() => {
    if (!vol || klaar.current) return;
    klaar.current = true;
    const volgorde = open.map((v) => waar.indexOf(v));
    const t = setTimeout(() => meld({ soort: "sleep", volgorde }), 350);
    return () => clearTimeout(t);
  }, [vol, open, waar, meld]);

  /* de automatische test: welk tegeltje nu het goede is */
  useEffect(() => {
    if (!p.actief || vol) return;
    const eerste = open.findIndex((v) => !waar.includes(v));
    const t = p.goedVolgorde?.[eerste];
    window.__phaser = { ...window.__phaser, antwoord: t === undefined ? null : `t${t}` };
  }, [p.actief, p.goedVolgorde, open, waar, vol]);

  const plekVan = (i: number) => {
    if (sleep?.i === i) return { x: sleep.x, y: sleep.y };
    return waar[i] >= 0 ? vakken[waar[i]] : bak[i];
  };
  const sleutelLijsten = JSON.stringify([p.licht, p.goed, p.fout, p.uit]);
  useEffect(() => {
    if (!scene) return;
    const items: Item[] = tegels.map((d, i) => ({ id: `t${i}`, d, ...plekVan(i), s: tegelS(d), staat: staatVan(p, `t${i}`), sleept: sleep?.i === i }));
    if (vast) items.unshift({ id: "v", d: vast, x: vakken[0].x, y: vakken[0].y, s: tegelS(vast), staat: staatVan(p, "v") });
    const pijlen = klok ? [0, 1, 2].map((i) => ({ x1: vakken[i].x + 96, x2: vakken[i + 1].x - 96, y: 230 })) : [];
    scene.zet({ sleutel: p.sleutel, items, lijnen: [], vakken, pijlen });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, p.sleutel, tegels, waar, sleutelLijsten, vast, sleep === null]);

  const aan = !!p.actief && !vol;
  function leg(i: number, vak: number) {
    setWaar((w) => w.map((v, j) => (j === i ? vak : v === vak && vak >= 0 ? -1 : v)));
  }
  function tik(i: number) {
    if (!aan) return;
    speelLesgeluid("tik");
    if (waar[i] >= 0) return leg(i, -1);
    const leeg = open.find((v) => !waar.includes(v));
    if (leeg !== undefined) leg(i, leeg);
  }
  const punt = (e: React.PointerEvent) => {
    const r = p.vlak.current!.getBoundingClientRect();
    return { x: (e.clientX - r.left) / schaal, y: (e.clientY - r.top) / schaal };
  };
  const start = useRef<{ i: number; x: number; y: number; bewogen: boolean } | null>(null);

  return (
    <>
      {tegels.map((d, i) => {
        const q = plekVan(i);
        return (
          <Knop
            key={i}
            id={`t${i}`}
            d={d}
            x={q.x}
            y={q.y}
            sch={tegelS(d)}
            aan={aan}
            sleep
            label={labelVan(d, i)}
            klik={() => {
              if (start.current?.bewogen) return;
              tik(i);
            }}
            extra={{
              onPointerDown: (e) => {
                if (!aan) return;
                const q0 = punt(e);
                start.current = { i, x: q0.x, y: q0.y, bewogen: false };
                (e.target as HTMLElement).setPointerCapture(e.pointerId);
              },
              onPointerMove: (e) => {
                const st = start.current;
                if (!st || st.i !== i) return;
                const q1 = punt(e);
                if (!st.bewogen && Math.hypot(q1.x - st.x, q1.y - st.y) < 8) return;
                st.bewogen = true;
                setSleep({ i, x: q1.x, y: q1.y });
                scene?.sleepNaar(`t${i}`, q1.x, q1.y);
              },
              onPointerUp: (e) => {
                const st = start.current;
                if (!st || st.i !== i) return;
                if (st.bewogen) {
                  const q1 = punt(e);
                  const dichtst = open.map((v) => ({ v, a: Math.hypot(vakken[v].x - q1.x, vakken[v].y - q1.y) })).sort((a, b) => a.a - b.a)[0];
                  speelLesgeluid("tik");
                  leg(i, dichtst && dichtst.a < 120 ? dichtst.v : -1);
                  setSleep(null);
                  setTimeout(() => (start.current = null), 0);
                } else start.current = null;
              },
            }}
          />
        );
      })}
    </>
  );
}

/* --- memory --- */

function zaad(tekst: string) {
  let h = 2166136261;
  for (const ch of tekst) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function Memory(p: Deel) {
  const { scene, meld } = p;
  const kaarten = useMemo(() => {
    const lijst = (p.paren ?? []).flatMap((pr, k) => [
      { d: pr[0], paar: k },
      { d: pr[1], paar: k },
    ]);
    const r = zaad(p.sleutel);
    for (let i = lijst.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [lijst[i], lijst[j]] = [lijst[j], lijst[i]];
    }
    return lijst;
  }, [p.paren, p.sleutel]);
  /* staand scherm: 2 kolommen en 3 rijen, veel groter (BOUWREGELS 1.24) */
  const { staand, hs } = p;
  const rijG = Math.min(380, (hs - 40) / 3);
  const mm = staand ? Math.min(rijG - 40, 400) : 200;
  const plekken = kaarten.map((_, i) => (staand ? { x: MIDX + ((i % 2) * 2 - 1) * 235, y: hs / 2 + (Math.floor(i / 2) - 1) * rijG } : { x: MIDX + ((i % 3) - 1) * 240, y: 225 + Math.floor(i / 3) * 280 }));
  const [kijk, setKijk] = useState(true);
  const [open, setOpen] = useState<number[]>([]);
  const [gevonden, setGevonden] = useState<number[]>([]);
  const [net, setNet] = useState<number[]>([]);
  const [mis, setMis] = useState<number[]>([]);
  const bezig = useRef(false);
  const klaar = useRef(false);

  useEffect(() => {
    if (!scene || !p.actief) return;
    const t = setTimeout(() => setKijk(false), 3200);
    return () => clearTimeout(t);
  }, [scene, p.actief]);

  useEffect(() => {
    if (!scene) return;
    const items: Item[] = kaarten.map((k, i) => {
      const zicht = kijk || open.includes(i) || gevonden.includes(i);
      const d: Ding = zicht ? k.d : { t: "dicht" };
      const staat: Staat = net.includes(i) ? "goed" : mis.includes(i) ? "fout" : gevonden.includes(i) ? "uit" : "gewoon";
      return { id: `m${i}`, d, x: plekken[i].x, y: plekken[i].y, s: past(d, mm, mm, staand ? 3 : 1.6), staat: staatVan(p, `m${i}`, staat), draai: true };
    });
    scene.zet({ sleutel: p.sleutel, items, lijnen: [], vakken: [], pijlen: [] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, p.sleutel, kaarten, kijk, open, gevonden, net, mis, staand, hs]);

  /* de automatische test: welk bolletje nu verder helpt */
  useEffect(() => {
    if (kijk || !p.actief) return;
    const dicht = kaarten.map((_, i) => i).filter((i) => !gevonden.includes(i) && !open.includes(i));
    const doel = open.length === 1 ? dicht.find((i) => kaarten[i].paar === kaarten[open[0]].paar) : dicht[0];
    window.__phaser = { ...window.__phaser, antwoord: doel === undefined ? null : `m${doel}` };
  }, [kijk, open, gevonden, kaarten, p.actief]);

  function tik(i: number) {
    if (kijk || bezig.current || klaar.current || open.includes(i) || gevonden.includes(i)) return;
    speelLesgeluid("tik");
    const nu = [...open, i];
    if (nu.length < 2) return setOpen(nu);
    setOpen(nu);
    bezig.current = true;
    if (kaarten[nu[0]].paar === kaarten[nu[1]].paar) {
      setTimeout(() => {
        speelLesgeluid("goed"); bliepoScherm("goed");
        setNet(nu);
      }, 300);
      setTimeout(() => {
        const alle = [...gevonden, ...nu];
        setGevonden(alle);
        setOpen([]);
        setNet([]);
        bezig.current = false;
        if (alle.length === kaarten.length) {
          klaar.current = true;
          setTimeout(() => meld({ soort: "memory" }), 500);
        }
      }, 1100);
      return;
    }
    setTimeout(() => {
      bliepoScherm("fout"); /* Alleen Bliepo's scherm kleurt rood; geen fout-geluidje (Sara, 8 november 2026, besluit 2 en 3). */
      setMis(nu);
    }, 350);
    setTimeout(() => {
      setOpen([]);
      setMis([]);
      bezig.current = false;
    }, 1400);
  }

  return (
    <>
      {kaarten.map((k, i) => (
        <Knop key={i} id={`m${i}`} d={{ t: "dicht" }} x={plekken[i].x} y={plekken[i].y} sch={mm / 170} aan={!!p.actief && !kijk && !gevonden.includes(i)} label={`Bolletje ${i + 1}`} klik={() => tik(i)} />
      ))}
    </>
  );
}

/* --- verbinden --- */

function Verbind(p: Deel) {
  const { scene, meld } = p;
  const paren = useMemo(() => p.paren ?? [], [p.paren]);
  const rechts = useMemo(() => p.rechts ?? paren.map((_, i) => i), [p.rechts, paren]);
  const n = paren.length;
  /* groter dan eerst (BOUWREGELS 1.24, 7 november 2026): de klokjes moeten goed te lezen zijn */
  /* staand scherm: groter en hoger, over de hele hoogte van het vlak (BOUWREGELS 1.24) */
  const { staand, hs } = p;
  const gap = staand ? Math.min(330, (hs - 60) / Math.max(1, n)) : n >= 4 ? 158 : 200;
  const maat = staand ? Math.min(gap - 40, 270) : n >= 4 ? 150 : 180;
  const breedK = staand ? 1.45 : 1.6;
  const yVan = (i: number) => (staand ? hs / 2 : 370) + (i - (n - 1) / 2) * gap;
  const LX = staand ? 245 : 260;
  const RX = staand ? 735 : 720;
  const [kies, setKies] = useState<string | null>(null);
  const [lijnen, setLijnen] = useState<[number, number][]>([]);
  const [fout, setFout] = useState<[number, number] | null>(null);
  const klaar = useRef(false);

  const items = useMemo(() => {
    const lijst: Plek[] = [];
    paren.forEach((pr, i) => lijst.push({ id: `l${i}`, d: pr[0], x: LX, y: yVan(i), s: past(pr[0], maat * breedK, maat, staand ? 3 : 1.6) }));
    rechts.forEach((k, j) => lijst.push({ id: `r${j}`, d: paren[k][1], x: RX, y: yVan(j), s: past(paren[k][1], maat * breedK, maat, staand ? 3 : 1.6) }));
    return lijst;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paren, rechts, maat, staand, hs]);
  const breed = (id: string) => {
    const it = items.find((q) => q.id === id)!;
    return (maatVan(it.d).b * it.s) / 2;
  };

  useEffect(() => {
    if (!scene) return;
    const verbonden = new Set(lijnen.flatMap(([a, b]) => [`l${a}`, `r${b}`]));
    const lijn = ([a, b]: [number, number], kleur: number): Lijn => ({ x1: LX + breed(`l${a}`) + 12, y1: yVan(a), x2: RX - breed(`r${b}`) - 12, y2: yVan(b), kleur });
    scene.zet({
      sleutel: p.sleutel,
      items: items.map((q) => ({ ...q, staat: staatVan(p, q.id, kies === q.id ? "licht" : verbonden.has(q.id) ? "goed" : "gewoon") })),
      lijnen: [...lijnen.map((l) => lijn(l, GOED)), ...(fout ? [lijn(fout, 0xffd36e)] : [])],
      vakken: [],
      pijlen: [],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, p.sleutel, items, kies, lijnen, fout]);

  /* de automatische test */
  useEffect(() => {
    if (!p.actief) return;
    const vrij = paren.map((_, i) => i).filter((i) => !lijnen.some(([a]) => a === i));
    let doel: string | null = null;
    if (kies?.startsWith("l")) doel = `r${rechts.indexOf(Number(kies.slice(1)))}`;
    else if (vrij.length) doel = `l${vrij[0]}`;
    window.__phaser = { ...window.__phaser, antwoord: doel };
  }, [p.actief, kies, lijnen, paren, rechts]);

  function tik(id: string) {
    if (klaar.current || fout) return;
    speelLesgeluid("tik");
    if (!kies || kies[0] === id[0]) return setKies(kies === id ? null : id);
    const l = Number((id[0] === "l" ? id : kies).slice(1));
    const r = Number((id[0] === "r" ? id : kies).slice(1));
    setKies(null);
    if (rechts[r] === l) {
      const nu: [number, number][] = [...lijnen, [l, r]];
      setLijnen(nu);
      setTimeout(() => { speelLesgeluid("goed"); bliepoScherm("goed"); }, 150);
      if (nu.length === paren.length) {
        klaar.current = true;
        setTimeout(() => meld({ soort: "verbind" }), 800);
      }
      return;
    }
    setFout([l, r]);
    bliepoScherm("fout"); /* Alleen Bliepo's scherm kleurt rood; geen fout-geluidje (Sara, 8 november 2026, besluit 2 en 3). */
    setTimeout(() => setFout(null), 900);
  }

  const bezet = new Set(lijnen.flatMap(([a, b]) => [`l${a}`, `r${b}`]));
  return (
    <>
      {items.map((q, i) => (
        <Knop key={q.id} id={q.id} d={q.d} x={q.x} y={q.y} sch={q.s} aan={!!p.actief && !bezet.has(q.id)} label={labelVan(q.d, i)} klik={() => tik(q.id)} />
      ))}
    </>
  );
}

/* ---------- de kaart aan het eind ---------- */

/** Op de verzamelkaart: de wijzerklok van de Synthesis-kloklessen (244 × 190), met 3 uur. */
export function KaartKlok() {
  return (
    <g transform="translate(37, 5)">
      <Klokje tijd={180} maat={170} />
    </g>
  );
}
