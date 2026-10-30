"use client";

/**
 * Het speelvlak van de lessen "Getallenlijn" naar Squla (30 oktober 2026,
 * opdracht eigenaar; eigen tekeningen en eigen inhoud, alleen het leerdoel en
 * de soort vragen komen van Squla). Eén Phaser-scène als hologram vóór de
 * blauwe ruimte (holo/basis.ts, HARDE REGEL 7), met vijf soorten beeld:
 *
 *   rij      een rij dingen met getallen (een lichtslinger, planeetjes,
 *            kristallen, sterren, aftellichtjes bij een raket, of tegels met
 *            een dier op een lege plek); één plek is leeg, "…" of "?";
 *   lijn     een getallenlijn (van–tot, streepjes per 1 of 2, of alleen een
 *            paar), met getallen waar ze gegeven zijn, een vlaggetje met "?",
 *            en Floep de kikker of andere beestjes op de lijn;
 *   orden    lege vakken (soms één al gevuld) en kaarten om er op volgorde in
 *            te slepen of te tikken;
 *   bordjes  drie bordjes met een getal, met een beestje erbij;
 *   floep    Floep de kikker op een blad, eventueel met een getal.
 *
 * Meldingen:
 *   - `orden` (volgorde): alle vakken zijn vol (pas dan wordt nagekeken);
 *   - `wezen` (naam): het kind tikt op een beestje op de lijn (als `actief`).
 *
 * Elk ding om op te tikken heeft ook een onzichtbare knop met `data-ding`
 * (toetsenbord, voorleesprogramma en de automatische test).
 */

import { useEffect, useRef, useState } from "react";
import type { Vlakbasis, Vlakgebeurtenis } from "../soort";
import { holoBasis, TX, VLAK_B, VLAK_H, WARM } from "../holo/basis";
import { HOLO_CANVAS, useHoloMotor } from "../holo/motor";
import { maakPlaatjes, type Dier } from "./squla-getallenlijn-teken";
import s from "./squla-getallenlijn.module.css";

/* ---------- wat er in beeld kan staan ---------- */

export type Rijding = "lampje" | "planeet" | "kristal" | "ster" | "aftel" | "tegel";
export type RijItem = {
  /** Wat er op (of onder) het ding staat: een getal, "…", "?" of "" (leeg). */
  t?: string;
  /** Dit ding heeft een andere kleur (het rode lampje). */
  rood?: boolean;
  /** Een dier op deze plek, in plaats van het ding (de olifant neemt twee plekken). */
  dier?: Dier;
};
export type Wezen = "kikker" | "vlinder" | "slak";

export type Beeld =
  | { soort: "leeg" }
  | {
      soort: "rij";
      ding: Rijding;
      items: RijItem[];
      /** De getallen onder het ding in plaats van erop. */
      onder?: boolean;
      /** De lampjes hangen aan een draad (een slinger). */
      slinger?: boolean;
    }
  | {
      soort: "lijn";
      van: number;
      tot: number;
      /** Streepjes per 1 (standaard) of per 2. */
      stap?: number;
      /** Alleen deze streepjes (anders elk stapje). */
      streepjes?: number[];
      /** Bij deze streepjes staat het getal. */
      labels: number[];
      /** De lijn loopt na `tot` nog een stukje door (zonder getallen, vervagend). */
      door?: boolean;
      /** Een vlaggetje met tekst ("?" of "") bij een getal. */
      vlag?: { n: number; t: string };
      /** Floep de kikker op de lijn (n mag een kommagetal zijn: ergens tussenin); `wijs` = Floep wijst het aan met een pijl. */
      kikker?: { n: number; wijs?: boolean };
      /** Andere beestjes op de lijn. */
      wezens?: { soort: Exclude<Wezen, "kikker">; n: number }[];
    }
  | { soort: "orden"; vakken: (number | null)[]; kaarten: number[]; hokjes?: boolean }
  | { soort: "bordjes"; getallen: number[]; wezens: Wezen[] }
  | { soort: "floep"; blad?: number | null };

export type GetallenlijnProps = {
  beeld: Beeld;
  /** Een nieuwe ronde tekent alles opnieuw, ook als het beeld hetzelfde is (de kaarten terug). */
  ronde?: number;
  /** Wat oplicht: bij een rij de plekken (0, 1, …), bij een lijn of de kaarten de getallen, bij bordjes de plekken. */
  licht?: number[];
  /** Een lichtgolf (goed): bij een rij een plek, bij een lijn een getal; `keer` ophogen voor een nieuwe golf. */
  golf?: { op: number; keer: number } | null;
  /** Tikken en slepen mag. */
  actief?: boolean;
  /** Bij ordenen: een handje doet één keer voor hoe je sleept. */
  handje?: boolean;
  /** Het goede antwoord in beeld zetten: bij een rij op plek `op`, bij een lijn bij getal `op` (of op het vlaggetje). */
  invul?: { op: number; t: string } | null;
};

/* ---------- maten (punten van het vlak, 980 × 720) ---------- */

const RIJ_Y = 360;
const LIJN_Y = 430;
const VAK_Y = 240;
const KAART_Y = 480;
const BORD_Y = 290;

export function rijMaten(items: RijItem[], ding: Rijding) {
  const eenheden = items.map((it) => (it.dier === "olifant" ? 2 : 1));
  const totaal = eenheden.reduce((a, b) => a + b, 0);
  const raket = ding === "aftel";
  const ruimte = raket ? 740 : 860;
  const sp = Math.min(170, ruimte / totaal);
  const breed = totaal * sp;
  const x0 = raket ? 60 + (ruimte - breed) / 2 : VLAK_B / 2 - breed / 2;
  let tel = 0;
  const xs = eenheden.map((e) => {
    const x = x0 + (tel + e / 2) * sp;
    tel += e;
    return x;
  });
  return { xs, sp, schaal: Math.min(1.2, (sp - 16) / 110), y: RIJ_Y };
}

export function lijnMaten(van: number, tot: number, door = false) {
  const links = 80;
  const rechts = door ? 740 : 900;
  const eenheid = (rechts - links) / Math.max(1, tot - van);
  return { x: (n: number) => links + (n - van) * eenheid, eenheid, Y: LIJN_Y };
}

export const vakX = (i: number, k: number) => VLAK_B / 2 + (i - (k - 1) / 2) * 140;
export const kaartX = (i: number, k: number) => VLAK_B / 2 + (i - (k - 1) / 2) * 150;
const bordX = (i: number, k: number) => VLAK_B / 2 + (i - (k - 1) / 2) * 250;

/** Waar een beestje op de lijn staat (midden van het plaatje) en hoe groot. */
function wezenPlek(soort: Wezen, x: number) {
  if (soort === "kikker") return { x, y: LIJN_Y - 52, b: 120, h: 110 };
  if (soort === "vlinder") return { x, y: LIJN_Y - 44, b: 96, h: 88 };
  return { x, y: LIJN_Y - 32, b: 104, h: 78 };
}

/* ---------- de scène ---------- */

type Staat = Required<Omit<GetallenlijnProps, "golf" | "invul">> & { golf: GetallenlijnProps["golf"]; invul: GetallenlijnProps["invul"] };
type Ptr = import("phaser").Input.Pointer;
type Obj = import("phaser").GameObjects.GameObject;
type Kaart = { n: number; cont: import("phaser").GameObjects.Container; thuis: { x: number; y: number }; vak: number | null };
type Vakplek = { x: number; y: number; vast: number | null; kaart: Kaart | null };

interface LijnScene {
  teken(st: Staat): void;
  tik(n: number): void;
  koppel(melder: (g: Vlakgebeurtenis) => void, opWijzig: (inVak: number[]) => void): void;
}

function maakScene(letter: () => string) {
  return (Phaser: typeof import("phaser"), rustig: boolean) => {
    const Basis = holoBasis(Phaser, rustig);
    class Scene extends Basis implements LijnScene {
      st: Staat | null = null;
      sleutel = "";
      alles: Obj[] = [];
      lichtjes: Obj[] = [];
      labels = new Map<number, import("phaser").GameObjects.Text>();
      rijTekst = new Map<number, import("phaser").GameObjects.Text>();
      vlagTekst: import("phaser").GameObjects.Text | null = null;
      invulSleutel = "";
      wezens: { naam: string; x: number; y: number; b: number; h: number }[] = [];
      vakken: Vakplek[] = [];
      kaarten: Kaart[] = [];
      sleep: { kaart: Kaart; x0: number; y0: number; dx: number; dy: number; bewogen: boolean } | null = null;
      klaarGemeld = false;
      golfKeer = -1;
      handjeLoopt: Obj | null = null;
      melder: (g: Vlakgebeurtenis) => void = () => {};
      opWijzig: (inVak: number[]) => void = () => {};

      constructor() {
        super("squla-getallenlijn");
      }

      koppel(melder: (g: Vlakgebeurtenis) => void, opWijzig: (inVak: number[]) => void) {
        this.melder = melder;
        this.opWijzig = opWijzig;
      }

      maak() {
        maakPlaatjes(this);
        this.canvasPlaatje("stip", 26, 26, (c) => {
          const g = c.createRadialGradient(11, 10, 1, 13, 13, 12);
          g.addColorStop(0, "#ffffff");
          g.addColorStop(0.5, "#ffe9a6");
          g.addColorStop(1, "#ffc24a");
          c.fillStyle = g;
          c.beginPath();
          c.arc(13, 13, 11, 0, Math.PI * 2);
          c.fill();
        });
        this.bak("stip", "stip-g", WARM);
        this.input.on("pointerdown", (p: Ptr) => this.neer(p));
        this.input.on("pointermove", (p: Ptr) => this.beweeg(p));
        this.input.on("pointerup", (p: Ptr) => this.los(p));
        this.input.on("pointerupoutside", (p: Ptr) => this.los(p));
      }

      /* ---------- hulpjes ---------- */

      tekst(x: number, y: number, t: string, grootte: number, kleur = "#ffffff") {
        return this.add
          .text(x, y, t, {
            fontFamily: letter(),
            fontSize: `${Math.round(grootte)}px`,
            fontStyle: "bold",
            color: kleur,
            stroke: "#0a1a4a",
            strokeThickness: Math.max(4, Math.round(grootte / 8)),
            align: "center",
          })
          .setOrigin(0.5)
          .setResolution(2);
      }

      bewaar<T extends Obj>(o: T): T {
        this.alles.push(o);
        return o;
      }

      ruimOp() {
        this.alles.forEach((o) => {
          this.tweens.killTweensOf(o);
          o.destroy();
        });
        this.alles = [];
        this.lichtjes.forEach((o) => o.destroy());
        this.lichtjes = [];
        this.handjeLoopt?.destroy();
        this.handjeLoopt = null;
        this.labels.clear();
        this.rijTekst.clear();
        this.vlagTekst = null;
        this.invulSleutel = "";
        this.wezens = [];
        this.vakken = [];
        this.kaarten = [];
        this.sleep = null;
        this.klaarGemeld = false;
      }

      /* ---------- tekenen ---------- */

      teken(st: Staat) {
        const sleutel = JSON.stringify([st.beeld, st.ronde]);
        const nieuw = sleutel !== this.sleutel;
        const handjeWas = this.st?.handje ?? false;
        this.st = st;
        if (nieuw) {
          this.sleutel = sleutel;
          this.ruimOp();
          this.bouw(st.beeld);
          this.opWijzig([]);
        }
        const invul = JSON.stringify(st.invul ?? null);
        if (st.invul && invul !== this.invulSleutel) this.vulIn(st.invul.op, st.invul.t);
        this.invulSleutel = invul;
        this.tekenLicht(st);
        if (st.golf && st.golf.keer !== this.golfKeer) {
          this.doeGolf(st.golf.op);
          this.golfKeer = st.golf.keer;
        }
        if (st.handje && (nieuw || !handjeWas)) this.speelHandje();
        if (!st.handje && this.handjeLoopt) {
          this.handjeLoopt.destroy();
          this.handjeLoopt = null;
        }
      }

      bouw(b: Beeld) {
        if (b.soort === "rij") this.bouwRij(b);
        else if (b.soort === "lijn") this.bouwLijn(b);
        else if (b.soort === "orden") this.bouwOrden(b);
        else if (b.soort === "bordjes") this.bouwBordjes(b);
        else if (b.soort === "floep") this.bouwFloep(b);
      }

      bouwRij(b: Extract<Beeld, { soort: "rij" }>) {
        const { xs, sp, schaal, y } = rijMaten(b.items, b.ding);
        if (b.slinger) {
          const g = this.bewaar(this.add.graphics());
          g.lineStyle(3, 0xe8f2ff, 0.55);
          const top = y - 58 * schaal;
          const pad = new Phaser.Curves.Path(xs[0] - sp * 0.55, top - 26);
          pad.quadraticBezierTo(xs[0], top, xs[0] - sp * 0.3, top - 6);
          for (let i = 0; i < xs.length - 1; i++) pad.quadraticBezierTo(xs[i + 1], top, (xs[i] + xs[i + 1]) / 2, top + 22);
          pad.quadraticBezierTo(xs[xs.length - 1] + sp * 0.55, top - 26, xs[xs.length - 1] + sp * 0.3, top - 6);
          pad.draw(g, 64);
        }
        if (b.ding === "aftel") {
          const r = this.bewaar(this.plaats("raket-g", 880, y - 40));
          r.setScale(0.85 / TX);
          this.tover(r, { vertraging: 60 * b.items.length });
        }
        b.items.forEach((it, i) => {
          const c = this.bewaar(this.add.container(xs[i], y));
          if (it.dier) {
            /* Het dier zit op een lege tegel (de olifant op twee). */
            const tegels = it.dier === "olifant" ? [-sp / 2, sp / 2] : [0];
            for (const dx of tegels) c.add(this.plaats("tegel-g", dx, 0).setScale(schaal / TX).setAlpha(0.5));
            const im = this.plaats(`${it.dier}-g`, 0, -14).setScale((it.dier === "olifant" ? 1.05 : 1.15) / TX);
            c.add(im);
          } else {
            const plaatje = b.ding === "aftel" ? "lampje" : b.ding;
            const im = this.plaats(`${plaatje}${it.rood ? "-rood" : ""}-g`, 0, 0).setScale(schaal / TX);
            c.add(im);
            if (it.t) {
              const onder = b.onder ?? false;
              const ty = onder ? 60 * schaal + 34 : b.ding === "lampje" || b.ding === "aftel" ? 8 * schaal : b.ding === "kristal" ? 4 * schaal : b.ding === "ster" ? 6 * schaal : 0;
              const t = this.tekst(0, ty, it.t, onder ? 44 : Math.max(36, 50 * schaal), it.t === "?" ? "#ffe066" : "#ffffff");
              c.add(t);
              this.rijTekst.set(i, t);
            }
          }
          this.tover(c, { vertraging: i * 60 });
        });
      }

      bouwLijn(b: Extract<Beeld, { soort: "lijn" }>) {
        const { x, eenheid, Y } = lijnMaten(b.van, b.tot, b.door);
        const g = this.bewaar(this.add.graphics());
        g.lineStyle(4, 0xe8f2ff, 0.9);
        g.lineBetween(x(b.van) - 26, Y, x(b.tot) + (b.door ? 0 : 26), Y);
        const stap = b.stap ?? 1;
        const streepjes = b.streepjes ?? Array.from({ length: Math.floor((b.tot - b.van) / stap) + 1 }, (_, i) => b.van + i * stap);
        for (const n of streepjes) {
          const groot = b.labels.includes(n) || n === b.van || n === b.tot || (stap === 1 && n % 5 === 0);
          const h = groot ? 18 : 11;
          g.lineBetween(x(n), Y - h, x(n), Y + h);
        }
        if (b.door) {
          /* de lijn loopt door, steeds vager */
          for (let k = 1; k <= 4; k++) {
            const a = 0.9 * (1 - k / 5);
            g.lineStyle(4, 0xe8f2ff, a);
            g.lineBetween(x(b.tot + k - 1), Y, x(b.tot + k), Y);
            g.lineBetween(x(b.tot + k), Y - 11, x(b.tot + k), Y + 11);
          }
        }
        const verborgen = b.kikker && !b.kikker.wijs && Number.isInteger(b.kikker.n) ? b.kikker.n : null;
        const grootte = Math.min(40, Math.max(30, eenheid * 0.78));
        for (const n of b.labels) {
          if (n === verborgen) continue;
          const t = this.bewaar(this.tekst(x(n), Y + 46, String(n), grootte));
          this.labels.set(n, t);
        }
        if (b.vlag) {
          const v = this.bewaar(this.plaats("vlag-g", x(b.vlag.n) + 33, Y - 81));
          this.tover(v);
          if (b.vlag.t) {
            const t = this.bewaar(this.tekst(x(b.vlag.n) + 38, Y - 124, b.vlag.t, 44, b.vlag.t === "?" ? "#ffe066" : "#ffffff"));
            this.tover(t);
            this.vlagTekst = t;
          }
        }
        for (const w of b.wezens ?? []) {
          const p = wezenPlek(w.soort, x(w.n));
          const im = this.bewaar(this.plaats(`${w.soort}-g`, p.x, p.y).setScale(0.8 / TX));
          this.wezens.push({ naam: w.soort, ...p });
          this.tover(im, { vertraging: 80 });
        }
        if (b.kikker) {
          if (b.kikker.wijs) {
            const k = this.bewaar(this.plaats("kikker-g", x(b.kikker.n) + 78, Y + 150).setScale(0.85 / TX));
            this.tover(k);
            const pijl = this.bewaar(this.plaats("pijl", x(b.kikker.n), Y + 62).setScale(1 / TX));
            this.tover(pijl, { vertraging: 160 });
          } else {
            const p = wezenPlek("kikker", x(b.kikker.n));
            const k = this.bewaar(this.plaats("kikker-g", p.x, p.y).setScale(0.92 / TX));
            this.wezens.push({ naam: "kikker", ...p });
            this.tover(k, { vertraging: 120 });
          }
        }
      }

      bouwOrden(b: Extract<Beeld, { soort: "orden" }>) {
        const k = b.vakken.length;
        b.vakken.forEach((v, i) => {
          const x = vakX(i, k);
          const im = this.bewaar(this.plaats("vak", x, VAK_Y));
          this.tover(im, { vertraging: i * 50 });
          this.vakken.push({ x, y: VAK_Y, vast: v, kaart: null });
          if (v !== null) {
            const c = this.bewaar(this.add.container(x, VAK_Y, [this.plaats("kaart-vast-g", 0, 0), this.tekst(0, 2, String(v), 54)]));
            this.tover(c, { vertraging: i * 50 });
          }
        });
        b.kaarten.forEach((n, i) => {
          const x = kaartX(i, b.kaarten.length);
          const c = this.bewaar(this.add.container(x, KAART_Y, [this.plaats(b.hokjes ? "hokje-g" : "kaart-g", 0, 0), this.tekst(0, 2, String(n), 54)]));
          c.setDepth(5);
          this.kaarten.push({ n, cont: c, thuis: { x, y: KAART_Y }, vak: null });
          this.tover(c, { vertraging: 200 + i * 70 });
        });
      }

      bouwBordjes(b: Extract<Beeld, { soort: "bordjes" }>) {
        b.getallen.forEach((n, i) => {
          const x = bordX(i, b.getallen.length);
          const bord = this.bewaar(this.plaats("bordje-g", x, BORD_Y));
          this.tover(bord, { vertraging: i * 90 });
          const t = this.bewaar(this.tekst(x, BORD_Y - 34, String(n), 56));
          this.tover(t, { vertraging: i * 90 });
          const w = b.wezens[i];
          if (w) {
            const im = this.bewaar(this.plaats(`${w}-g`, x - 82, BORD_Y + 62).setScale(0.62 / TX));
            this.tover(im, { vertraging: i * 90 + 60 });
          }
        });
      }

      bouwFloep(b: Extract<Beeld, { soort: "floep" }>) {
        const blad = this.bewaar(this.plaats("blad-g", 480, 470).setScale(1.6 / TX));
        this.tover(blad);
        if (b.blad !== undefined && b.blad !== null) {
          const t = this.bewaar(this.tekst(400, 478, String(b.blad), 56));
          this.tover(t, { vertraging: 120 });
        }
        const k = this.bewaar(this.plaats("kikker-g", b.blad != null ? 545 : 480, 400).setScale(1.25 / TX));
        this.tover(k, { vertraging: 200 });
      }

      /* ---------- het goede antwoord in beeld ---------- */

      vulIn(op: number, t: string) {
        const b = this.st?.beeld;
        const groen = "#8ff0c0";
        if (b?.soort === "rij") {
          const bestaand = this.rijTekst.get(op);
          if (bestaand) {
            bestaand.setText(t).setColor(groen);
            return;
          }
          const { xs, schaal, y } = rijMaten(b.items, b.ding);
          const it = b.items[op];
          if (!it || xs[op] === undefined) return;
          const ty = it.dier ? y - (it.dier === "olifant" ? 108 : 104) : b.onder ? y + 60 * schaal + 34 : y;
          const tekst = this.bewaar(this.tekst(xs[op], ty, t, it.dier ? 50 : 46, groen));
          this.rijTekst.set(op, tekst);
          this.tover(tekst);
        } else if (b?.soort === "lijn") {
          const { x, eenheid, Y } = lijnMaten(b.van, b.tot, b.door);
          if (b.vlag && b.vlag.n === op) {
            if (this.vlagTekst) this.vlagTekst.setText(t).setColor(groen);
            else this.vlagTekst = this.bewaar(this.tekst(x(op) + 38, Y - 124, t, 44, groen));
            return;
          }
          const label = this.labels.get(op);
          if (label) {
            label.setText(t).setColor(groen);
            return;
          }
          const grootte = Math.min(40, Math.max(30, eenheid * 0.78));
          const nieuw = this.bewaar(this.tekst(x(op), Y + 46, t, grootte, groen));
          this.labels.set(op, nieuw);
          this.tover(nieuw);
        }
      }

      /* ---------- oplichten en de lichtgolf ---------- */

      tekenLicht(st: Staat) {
        this.lichtjes.forEach((o) => o.destroy());
        this.lichtjes = [];
        const ingevuld = this.st?.invul?.op;
        this.labels.forEach((t, n) => t.setColor(n === ingevuld ? "#8ff0c0" : "#ffffff").setScale(1));
        const b = st.beeld;
        for (const n of st.licht) {
          if (b.soort === "rij") {
            const { xs, schaal, y } = rijMaten(b.items, b.ding);
            if (xs[n] !== undefined) this.lichtjes.push(this.selectieRing(xs[n], y + (b.onder ? 20 : 0), (b.onder ? 78 : 62) * schaal));
          } else if (b.soort === "lijn") {
            const { x, eenheid, Y } = lijnMaten(b.van, b.tot, b.door);
            const label = this.labels.get(n);
            if (label) {
              label.setColor("#ffe066").setScale(1.15);
              this.lichtjes.push(this.selectieRing(x(n), Y + 46, Math.min(34, eenheid * 0.5 + 8)));
            } else this.lichtjes.push(this.plaats("stip-g", x(n), Y));
          } else if (b.soort === "orden") {
            const vak = this.vakken.find((v) => v.vast === n);
            const kaart = this.kaarten.find((k) => k.n === n);
            const p = vak ?? (kaart ? kaart.cont : null);
            if (p) this.lichtjes.push(this.selectieRing(p.x, p.y, 70));
          } else if (b.soort === "bordjes") {
            const x = bordX(n, b.getallen.length);
            this.lichtjes.push(this.selectieRing(x, BORD_Y - 34, 70));
          }
        }
      }

      doeGolf(op: number) {
        const b = this.st?.beeld;
        if (!b) return;
        if (b.soort === "rij") {
          const { xs, y } = rijMaten(b.items, b.ding);
          if (xs[op] !== undefined) this.golf(xs[op], y);
        } else if (b.soort === "lijn") {
          const { x, Y } = lijnMaten(b.van, b.tot, b.door);
          this.golf(x(op), Y - 50);
        } else if (b.soort === "orden") {
          this.vakken.forEach((v, i) => this.time.delayedCall(i * 90, () => this.golf(v.x, v.y)));
        } else if (b.soort === "bordjes") {
          this.golf(bordX(op, b.getallen.length), BORD_Y - 34);
        } else this.golf(480, 420);
      }

      /* ---------- ordenen: slepen en tikken ---------- */

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
        const st = this.st;
        if (!st?.actief) return;
        const w = this.waar(p);
        if (st.beeld.soort === "orden" && !this.klaarGemeld) {
          const kaart = [...this.kaarten].reverse().find((k) => Math.abs(k.cont.x - w.x) < 58 && Math.abs(k.cont.y - w.y) < 58);
          if (kaart) {
            this.sleep = { kaart, x0: w.x, y0: w.y, dx: kaart.cont.x - w.x, dy: kaart.cont.y - w.y, bewogen: false };
            kaart.cont.setDepth(20);
            this.input.manager.canvas.style.cursor = "grabbing";
          }
          return;
        }
        if (st.beeld.soort === "lijn") {
          const wezen = this.wezens.find((z) => Math.abs(z.x - w.x) < z.b / 2 + 8 && Math.abs(z.y - w.y) < z.h / 2 + 8);
          if (wezen) this.melder({ soort: "wezen", naam: wezen.naam });
        }
      }

      beweeg(p: Ptr) {
        const w = this.waar(p);
        const sl = this.sleep;
        if (!sl) {
          /* een open handje boven iets wat je kunt slepen of tikken */
          const st = this.st;
          let boven = false;
          if (st?.actief && st.beeld.soort === "orden" && !this.klaarGemeld) boven = this.kaarten.some((k) => Math.abs(k.cont.x - w.x) < 58 && Math.abs(k.cont.y - w.y) < 58);
          else if (st?.actief && st.beeld.soort === "lijn") boven = this.wezens.some((z) => Math.abs(z.x - w.x) < z.b / 2 && Math.abs(z.y - w.y) < z.h / 2);
          this.input.manager.canvas.style.cursor = boven ? (st?.beeld.soort === "orden" ? "grab" : "pointer") : "default";
          return;
        }
        if (!sl.bewogen && Math.hypot(w.x - sl.x0, w.y - sl.y0) < 10) return;
        sl.bewogen = true;
        sl.kaart.cont.setPosition(w.x + sl.dx, w.y + sl.dy);
      }

      los(p: Ptr) {
        const sl = this.sleep;
        if (!sl) return;
        this.sleep = null;
        this.input.manager.canvas.style.cursor = "grab";
        const w = this.waar(p);
        if (!sl.bewogen) {
          this.tik(sl.kaart.n);
          return;
        }
        const cx = w.x + sl.dx;
        const cy = w.y + sl.dy;
        let beste = -1;
        let afstand = 90;
        this.vakken.forEach((v, i) => {
          const d = Math.hypot(v.x - cx, v.y - cy);
          if (d < afstand && v.vast === null && (v.kaart === null || v.kaart === sl.kaart)) {
            afstand = d;
            beste = i;
          }
        });
        if (beste >= 0) this.zetInVak(sl.kaart, beste);
        else this.terug(sl.kaart);
      }

      /** Een kaart aantikken: in het eerste lege vak, of (als hij al in een vak zit) terug. */
      tik(n: number) {
        if (!this.st?.actief || this.klaarGemeld) return;
        const kaart = this.kaarten.find((k) => k.n === n);
        if (!kaart) return;
        if (kaart.vak !== null) {
          this.vakken[kaart.vak].kaart = null;
          kaart.vak = null;
          this.schuif(kaart, kaart.thuis.x, kaart.thuis.y);
          this.gewijzigd();
          return;
        }
        const leeg = this.vakken.findIndex((v) => v.vast === null && v.kaart === null);
        if (leeg >= 0) this.zetInVak(kaart, leeg);
      }

      zetInVak(kaart: Kaart, i: number) {
        if (kaart.vak !== null) this.vakken[kaart.vak].kaart = null;
        kaart.vak = i;
        this.vakken[i].kaart = kaart;
        this.schuif(kaart, this.vakken[i].x, this.vakken[i].y);
        this.gewijzigd();
      }

      terug(kaart: Kaart) {
        if (kaart.vak !== null) this.schuif(kaart, this.vakken[kaart.vak].x, this.vakken[kaart.vak].y);
        else this.schuif(kaart, kaart.thuis.x, kaart.thuis.y);
      }

      schuif(kaart: Kaart, x: number, y: number) {
        kaart.cont.setDepth(kaart.vak !== null ? 6 : 5);
        this.tweens.add({ targets: kaart.cont, x, y, duration: this.rustig ? 1 : 180, ease: "Cubic.easeOut" });
      }

      gewijzigd() {
        this.handjeLoopt?.destroy();
        this.handjeLoopt = null;
        this.opWijzig(this.kaarten.filter((k) => k.vak !== null).map((k) => k.n));
        if (this.vakken.length && this.vakken.every((v) => v.vast !== null || v.kaart !== null)) {
          this.klaarGemeld = true;
          const volgorde = this.vakken.map((v) => (v.vast !== null ? v.vast : v.kaart!.n));
          this.time.delayedCall(this.rustig ? 1 : 260, () => this.melder({ soort: "orden", volgorde }));
        }
      }

      /** Het handje doet voor: van de goede kaart naar het eerste lege vak (twee keer). */
      speelHandje() {
        if (this.rustig || this.st?.beeld.soort !== "orden") return;
        const alles = [...this.vakken.map((v) => v.vast).filter((v): v is number => v !== null), ...this.kaarten.map((k) => k.n)].sort((a, b) => a - b);
        const leeg = this.vakken.findIndex((v) => v.vast === null && v.kaart === null);
        if (leeg < 0) return;
        const kaart = this.kaarten.find((k) => k.n === alles[leeg] && k.vak === null);
        if (!kaart) return;
        const vak = this.vakken[leeg];
        this.handjeLoopt?.destroy();
        const hand = this.plaats("hand", kaart.thuis.x + 18, kaart.thuis.y + 30).setDepth(30).setAlpha(0);
        this.handjeLoopt = hand;
        this.tweens.chain({
          targets: hand,
          tweens: [
            { alpha: 0.95, duration: 250, delay: 500 },
            { x: vak.x + 18, y: vak.y + 30, duration: 900, ease: "Sine.easeInOut" },
            { alpha: 0, duration: 250 },
            { x: kaart.thuis.x + 18, y: kaart.thuis.y + 30, duration: 1 },
            { alpha: 0.95, duration: 250 },
            { x: vak.x + 18, y: vak.y + 30, duration: 900, ease: "Sine.easeInOut" },
            { alpha: 0, duration: 250 },
          ],
          onComplete: () => {
            if (this.handjeLoopt === hand) this.handjeLoopt = null;
            hand.destroy();
          },
        });
      }
    }
    return Scene as unknown as new () => import("phaser").Scene;
  };
}

/* ---------- het vlak ---------- */

/** Het lettertype van de les (voor de getallen in de tekening). */
function lettertype() {
  const el = document.querySelector("[data-squla-getallenlijn]");
  return el ? getComputedStyle(el).fontFamily : "system-ui, sans-serif";
}

export function SqulaGetallenlijn({ beeld, ronde = 0, licht = [], golf = null, actief = false, handje = false, invul = null, meld, schaal }: GetallenlijnProps & Vlakbasis) {
  const { plek, scene } = useHoloMotor<LijnScene>(schaal, maakScene(lettertype), { invoer: true });
  const meldRef = useRef(meld);
  const [inVak, setInVak] = useState<number[]>([]);

  useEffect(() => {
    meldRef.current = meld;
  });

  useEffect(() => {
    if (!scene) return;
    scene.koppel(
      (g) => meldRef.current(g),
      (lijst) => setInVak(lijst),
    );
  }, [scene]);

  const sleutel = JSON.stringify({ beeld, ronde, licht, golf, actief, handje, invul });
  useEffect(() => {
    if (!scene) return;
    scene.teken(JSON.parse(sleutel) as Staat);
  }, [scene, sleutel]);

  /* Voor de automatische test: bij ordenen is de kleinste kaart die nog los ligt de volgende goede tik. */
  const volgende = actief && beeld.soort === "orden" ? ([...beeld.kaarten].filter((n) => !inVak.includes(n)).sort((a, b) => a - b)[0] ?? null) : undefined;
  useEffect(() => {
    if (volgende === undefined) return;
    window.__phaser = { ...window.__phaser, antwoord: volgende === null ? null : String(volgende) };
  }, [volgende]);

  /* De onzichtbare knoppen (toetsenbord, voorlezen, automatische test). */
  const knoppen: { ding: string; label: string; x: number; y: number; b: number; h: number; tik: () => void }[] = [];
  if (actief && beeld.soort === "orden") {
    beeld.kaarten.forEach((n, i) => {
      if (inVak.includes(n)) return;
      knoppen.push({ ding: String(n), label: `Kaart ${n}`, x: kaartX(i, beeld.kaarten.length), y: KAART_Y, b: 110, h: 110, tik: () => scene?.tik(n) });
    });
  }
  if (actief && beeld.soort === "lijn") {
    const { x } = lijnMaten(beeld.van, beeld.tot, beeld.door);
    const lijst: { soort: Wezen; n: number }[] = [...(beeld.wezens ?? []), ...(beeld.kikker && !beeld.kikker.wijs ? [{ soort: "kikker" as const, n: beeld.kikker.n }] : [])];
    for (const w of lijst) {
      const p = wezenPlek(w.soort, x(w.n));
      knoppen.push({ ding: w.soort, label: w.soort === "kikker" ? "Floep de kikker" : w.soort === "vlinder" ? "De vlinder" : "De slak", ...p, tik: () => meld({ soort: "wezen", naam: w.soort }) });
    }
  }

  return (
    <div className={s.vlak} data-squla-getallenlijn>
      <div ref={plek} style={HOLO_CANVAS} aria-hidden />
      {knoppen.map((k) => (
        <button
          key={k.ding}
          type="button"
          className={s.ding}
          data-ding={k.ding}
          aria-label={k.label}
          style={{ left: k.x - k.b / 2, top: k.y - k.h / 2, width: k.b, height: k.h }}
          onClick={k.tik}
        />
      ))}
    </div>
  );
}
