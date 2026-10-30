"use client";

/**
 * Het splitshuis als hologram (27 oktober 2026, LESSENPLAN.md S2 "Splitsen met
 * de splitsmachine", wereld Oceaan). Vervangt in die les het splitsschema
 * (`optellen100-splitsen.tsx`) en de piano (`optellen100-piano.tsx`); die
 * bestanden blijven bestaan.
 *
 * - Het splitshuis: drie luchtbellen, bovenaan het geheel en onderaan de twee
 *   delen, met parels erin (in de kleur van hun getal, zoals de getaltegels).
 *   Onder elke onderste bel een min- en een plusknop. Een bel met een vraag
 *   gloeit warm. Rechtsboven de gevonden splitsingen als gekleurde sommen.
 * - De parelplank van 5: tik erop en hij valt uiteen in 5 losse parels.
 * - Het parelsnoer (samenstellen = bouwen uit kleine delen): tik op de parels
 *   onderaan en ze schuiven één voor één aan het snoer; tik op het snoer en
 *   het gaat dicht.
 *
 * Meldingen: `{ soort: "knop", knop }`, `{ soort: "klaar" }`, `{ soort: "tegel" }`,
 * `{ soort: "parel" }` en `{ soort: "sluit" }`.
 */

import { useEffect } from "react";
import type { Vlakbasis } from "../soort";
import { holoBasis, GOED, WARM, WERELDKLEUR } from "../holo/basis";
import { HOLO_CANVAS, useHoloMotor } from "../holo/motor";
import { IkoonKnop } from "../ikonen";
import { TEGELKLEUR, getalkleur, vorm } from "../tegels";
import type { Splitsknop } from "./optellen100-splitsen";
import { hexNaarGetal, maakSterPlaatjes, PAARS, testHaak } from "./tientallen-holo-basis";
import { tekenParel } from "./tellen-holo-tekenen";
import s from "./tientallen-holo.module.css";

export type { Splitsknop };

export type HoloSplitsProps = {
  links: number;
  rechts: number;
  /** Vast totaal bovenaan; `null` = de som van de delen. */
  geheel?: number | null;
  knoppen?: boolean;
  /** Alleen deze knop werkt (en gloeit). */
  alleen?: Splitsknop | null;
  /** Deze bel heeft een vraag (gloeit warm). */
  vraag?: "links" | "rechts" | null;
  /** Het vinkje. */
  klaar?: boolean;
  lijst?: [number, number, number][];
  tegel?: null | "heel" | "los";
  /** Het splitshuis even weg (bij de woorden). */
  verborgen?: boolean;
  /** Het parelsnoer: hoeveel parels er al aan zitten (`null` = geen snoer). */
  snoer?: number | null;
  snoerActief?: boolean;
  snoerDicht?: boolean;
  /** Elke keer dat dit getal verandert: een rustige lichtgolf. */
  golf?: number;
  /** Het vraagteken (weet ik niet) naast het vinkje. */
  hulp?: boolean;
  /** Teken het vinkje en het vraagteken in het vlak zelf (de oude plek). Standaard uit: ze staan op de vaste plek onder de zin van Bliepo (28 oktober 2026). */
  knoppenInVlak?: boolean;
  /** In het Universum (de toetsen van Optellen tot 100): sterren in lichtbellen in plaats van parels. */
  sterren?: boolean;
};

export type HoloSplitsMelding = { soort: "knop"; knop: Splitsknop } | { soort: "klaar" } | { soort: "hulp" } | { soort: "tegel" } | { soort: "parel" } | { soort: "sluit" };

/* ---------- maten (punten van het vlak) ---------- */

const GEHEEL = { x: 420, y: 230, r: 112 };
const LINKS = { x: 230, y: 500, r: 104 };
const RECHTS = { x: 610, y: 500, r: 104 };
const PAREL = 32;
const SNOER = { x0: 230, x1: 690, y: 300, zak: 70 };
const BAK_Y = 560;

/** Plekken van n parels in een bel: rijen van 5 (zoals een tienveld), daarna een derde rij. */
function parelPlekken(n: number, cx: number, cy: number) {
  const uit: { x: number; y: number }[] = [];
  const stap = 36;
  const rijen = Math.ceil(n / 5);
  for (let i = 0; i < n; i++) {
    const rij = Math.floor(i / 5);
    const inRij = Math.min(5, n - rij * 5);
    const k = i % 5;
    uit.push({ x: cx + (k - (inRij - 1) / 2) * stap, y: cy + (rij - (rijen - 1) / 2) * stap });
  }
  return uit;
}

/** Een punt op het (doorhangende) snoer, t van 0 tot 1. */
function snoerPunt(t: number) {
  return { x: SNOER.x0 + (SNOER.x1 - SNOER.x0) * t, y: SNOER.y + Math.sin(Math.PI * t) * SNOER.zak };
}

/* ---------- de scène ---------- */

type Huis = { links: number; rechts: number; geheel: number; zichtbaar: boolean; vraag: "links" | "rechts" | null; sterren: boolean };

interface SplitsScene {
  huis(p: Huis): void;
  tegel(stand: null | "heel" | "los"): void;
  snoer(n: number | null, dicht: boolean): void;
  goed(x: number, y: number): void;
}

function maakScene() {
  return (Phaser: typeof import("phaser"), rustig: boolean) => {
    const Basis = holoBasis(Phaser, rustig);
    type Img = import("phaser").GameObjects.Image;
    type Gfx = import("phaser").GameObjects.Graphics;
    const OCEAAN = WERELDKLEUR.oceaan;
    class Splits extends Basis implements SplitsScene {
      bellen: Img[] = [];
      lijnen: Gfx | null = null;
      parels: Img[] = [];
      vraagGloed: Img | null = null;
      tegelDelen: Img[] = [];
      plank: Img | null = null;
      snoerDelen: (Img | Gfx)[] = [];
      vorigHuis = "";

      constructor() {
        super("splitshuis");
      }

      maak() {
        /* Een luchtbel: doorzichtig, dunne lichte rand, een glimmertje. */
        const bel = (sl: string, r: number) =>
          this.canvasPlaatje(sl, r * 2 + 8, r * 2 + 8, (c) => {
            const m = r + 4;
            const g = c.createRadialGradient(m - r * 0.35, m - r * 0.4, r * 0.1, m, m, r);
            g.addColorStop(0, "rgba(200,250,255,0.28)");
            g.addColorStop(0.75, "rgba(40,140,200,0.18)");
            g.addColorStop(1, "rgba(127,233,255,0.42)");
            c.fillStyle = g;
            c.beginPath();
            c.arc(m, m, r, 0, Math.PI * 2);
            c.fill();
            c.lineWidth = 3;
            c.strokeStyle = "rgba(200,250,255,0.95)";
            c.stroke();
            c.strokeStyle = "rgba(255,255,255,0.7)";
            c.lineWidth = 4;
            c.lineCap = "round";
            c.beginPath();
            c.arc(m, m, r * 0.78, Math.PI * 1.1, Math.PI * 1.35);
            c.stroke();
          });
        bel("bel-groot", GEHEEL.r);
        this.bak("bel-groot", "bel-groot-g", OCEAAN);
        bel("bel", LINKS.r);
        this.bak("bel", "bel-g", OCEAAN);
        this.bak("bel-groot", "bel-groot-u", PAARS);
        this.bak("bel", "bel-u", PAARS);
        maakSterPlaatjes(this);
        /* Parels in elke getalkleur en wit: dezelfde parel als in alle lessen. */
        const parel = (sl: string, kleur?: string) => this.canvasPlaatje(sl, PAREL, PAREL, (c) => tekenParel(c, PAREL, kleur));
        for (let n = 1; n <= 10; n++) {
          parel(`parel${n}`, TEGELKLEUR[n]);
          this.bak(`parel${n}`, `parel${n}-g`, hexNaarGetal(TEGELKLEUR[n]));
        }
        parel("parel-wit");
        this.bak("parel-wit", "parel-wit-g", OCEAAN);
        /* De parelplank van 5: twee kolommen, zoals de getaltegel. */
        const c0 = 66;
        this.canvasPlaatje("plank5", c0 * 2 + 8, c0 * 3 + 8, (c) => {
          c.fillStyle = "rgba(40,160,120,0.55)";
          c.strokeStyle = "rgba(200,255,230,0.95)";
          c.lineWidth = 3;
          for (const hk of vorm(5)) {
            c.beginPath();
            c.roundRect(4 + hk.k * c0 + 2, 4 + (2 - hk.r) * c0 + 2, c0 - 4, c0 - 4, 12);
            c.fill();
            c.stroke();
          }
        });
        this.bak("plank5", "plank5-g", OCEAAN);
        /* Warme gloed achter een bel met een vraag. */
        this.canvasPlaatje("vraaggloed", LINKS.r * 2 + 40, LINKS.r * 2 + 40, (c) => {
          const m = LINKS.r + 20;
          const g = c.createRadialGradient(m, m, LINKS.r - 6, m, m, LINKS.r + 18);
          g.addColorStop(0, "rgba(255,211,110,0)");
          g.addColorStop(0.5, "rgba(255,211,110,0.7)");
          g.addColorStop(1, "rgba(255,211,110,0)");
          c.fillStyle = g;
          c.beginPath();
          c.arc(m, m, LINKS.r + 18, 0, Math.PI * 2);
          c.fill();
        });
      }

      huis(p: Huis) {
        const sleutel = JSON.stringify(p);
        if (sleutel === this.vorigHuis) return;
        const eerst = this.vorigHuis === "" || !JSON.parse(this.vorigHuis).zichtbaar;
        this.vorigHuis = sleutel;
        this.parels.forEach((o) => o.destroy());
        this.parels = [];
        this.vraagGloed?.destroy();
        this.vraagGloed = null;
        if (!p.zichtbaar) {
          this.bellen.forEach((o) => o.destroy());
          this.bellen = [];
          this.lijnen?.destroy();
          this.lijnen = null;
          return;
        }
        if (this.bellen.length === 0) {
          this.lijnen = this.add.graphics();
          this.lijnen.lineStyle(3, 0xc8f4ff, 0.7);
          for (const d of [LINKS, RECHTS]) {
            const dx = d.x - GEHEEL.x;
            const dy = d.y - GEHEEL.y;
            const l = Math.hypot(dx, dy);
            this.lijnen.lineBetween(GEHEEL.x + (dx / l) * GEHEEL.r, GEHEEL.y + (dy / l) * GEHEEL.r, d.x - (dx / l) * d.r, d.y - (dy / l) * d.r);
          }
          const sl = p.sterren ? "u" : "g";
          this.bellen = [this.plaats(`bel-groot-${sl}`, GEHEEL.x, GEHEEL.y), this.plaats(`bel-${sl}`, LINKS.x, LINKS.y), this.plaats(`bel-${sl}`, RECHTS.x, RECHTS.y)];
          if (eerst) this.bellen.forEach((b) => this.tover(b));
        }
        if (p.vraag) {
          const d = p.vraag === "links" ? LINKS : RECHTS;
          this.vraagGloed = this.plaats("vraaggloed", d.x, d.y).setDepth(-1);
          if (!rustig) this.tweens.add({ targets: this.vraagGloed, alpha: 0.4, duration: 800, yoyo: true, repeat: -1 });
        }
        const zet = (n: number, d: { x: number; y: number }) => {
          if (n <= 0) return;
          /* In het Universum sterren (kleur van het getal; 10 = de gewone ster). */
          const tx = (k: number) => (p.sterren ? (k >= 10 ? "ster-g" : `ster-k${k}-g`) : `parel${k}-g`);
          const sl = tx(Math.min(n, 10));
          parelPlekken(n, d.x, d.y).forEach((q, i) => {
            /* Boven de 10: de eerste tien in de kleur van 10, de rest in de kleur van de rest (12 = 10 + 2). */
            const tex = n > 10 && i >= 10 ? tx(n - 10) : sl;
            const o = this.plaats(tex, q.x, q.y).setDepth(2);
            if (p.sterren) o.setScale(0.7 / 2);
            this.parels.push(o);
          });
        };
        zet(p.geheel, GEHEEL);
        zet(p.links, LINKS);
        zet(p.rechts, RECHTS);
      }

      tegel(stand: null | "heel" | "los") {
        if (stand === null) {
          this.plank?.destroy();
          this.plank = null;
          this.tegelDelen.forEach((o) => o.destroy());
          this.tegelDelen = [];
          return;
        }
        const c0 = 66;
        const ox = 420 - c0;
        const oy = 360 - (3 * c0) / 2;
        const plekken = vorm(5).map((hk) => ({ x: ox + hk.k * c0 + c0 / 2, y: oy + (2 - hk.r) * c0 + c0 / 2 }));
        if (stand === "heel") {
          if (!this.plank) {
            this.plank = this.plaats("plank5-g", 420, 360);
            this.tover(this.plank);
            this.tegelDelen = plekken.map((q) => this.plaats("parel5-g", q.x, q.y).setScale(1.4 / 2).setDepth(2));
          }
          return;
        }
        /* Los: de plank lost op, de vijf parels gaan los naast elkaar liggen, elk in de kleur van 1. */
        if (this.plank) this.verdwijn(this.plank);
        this.plank = null;
        this.tegelDelen.forEach((o, i) => {
          this.tweens.add({
            targets: o,
            x: 420 + (i - 2) * 110,
            y: 360,
            duration: rustig ? 1 : 520,
            delay: i * 40,
            ease: "Back.easeOut",
            onComplete: () => o.setTexture("parel1-g"),
          });
        });
      }

      snoer(n: number | null, dicht: boolean) {
        this.snoerDelen.forEach((o) => o.destroy());
        this.snoerDelen = [];
        if (n === null) return;
        const g = this.add.graphics();
        g.lineStyle(3, 0xc8f4ff, 0.85);
        if (dicht) {
          g.strokeCircle(460, 300, 120);
        } else {
          g.beginPath();
          const p0 = snoerPunt(0);
          g.moveTo(p0.x, p0.y);
          for (let t = 0.02; t <= 1.001; t += 0.02) {
            const q = snoerPunt(t);
            g.lineTo(q.x, q.y);
          }
          g.strokePath();
        }
        this.snoerDelen.push(g);
        const op = (i: number) => (dicht ? { x: 460 + 120 * Math.cos(-Math.PI / 2 + (i * Math.PI * 2) / Math.max(n, 1)), y: 300 + 120 * Math.sin(-Math.PI / 2 + (i * Math.PI * 2) / Math.max(n, 1)) } : snoerPunt(0.08 + i * 0.12));
        for (let i = 0; i < n; i++) {
          const q = op(i);
          const kleur = (i % 9) + 1;
          const o = this.plaats(`parel${kleur}-g`, q.x, q.y).setScale(1.3 / 2).setDepth(2);
          this.snoerDelen.push(o);
          if (i === n - 1 && !dicht && !rustig) {
            o.setPosition(460, BAK_Y);
            this.tweens.add({ targets: o, x: q.x, y: q.y, duration: 360, ease: "Cubic.easeOut" });
          }
        }
        /* Onderaan de losse parels om aan het snoer te doen. */
        if (!dicht)
          for (let i = 0; i < Math.max(0, 7 - n); i++) {
            const kleur = ((n + i) % 9) + 1;
            this.snoerDelen.push(this.plaats(`parel${kleur}-g`, 460 + (i - (6 - n) / 2) * 56, BAK_Y).setScale(1.3 / 2));
          }
        if (dicht) this.golf(460, 300, WARM);
      }

      goed(x: number, y: number) {
        this.golf(x, y, GOED);
      }

      demo(ms: number) {
        const eind = performance.now() + ms;
        let n = 0;
        const stap = () => {
          if (performance.now() > eind) return;
          n = (n + 1) % 8;
          this.huis({ links: n, rechts: 7 - n, geheel: 7, zichtbaar: true, vraag: null, sterren: false });
          this.goed(GEHEEL.x, GEHEEL.y);
          this.time.delayedCall(400, stap);
        };
        stap();
      }
    }
    return Splits as unknown as new () => import("phaser").Scene;
  };
}

/* ---------- het vlak ---------- */

function Rondknop({ x, y, teken, aan, goud, knop, onTik }: { x: number; y: number; teken: "−" | "+"; aan: boolean; goud: boolean; knop: string; onTik: () => void }) {
  return (
    <button
      type="button"
      data-knop={knop}
      aria-label={teken === "+" ? "Eén parel erbij" : "Eén parel eraf"}
      className={`${s.plus} ${goud ? s.wijs : ""}`}
      style={{ position: "absolute", left: x - 46, top: y - 46, width: 92, height: 92, borderRadius: "50%", fontSize: 52, lineHeight: 1, borderColor: "rgba(200,250,255,0.9)", background: "rgba(10,70,110,0.6)", boxShadow: "0 0 16px rgba(127,233,255,0.4)" }}
      disabled={!aan}
      onClick={onTik}
    >
      {teken}
    </button>
  );
}

export function HoloSplitshuis(p: HoloSplitsProps & Vlakbasis) {
  const { links, rechts, geheel = null, knoppen = false, alleen = null, vraag = null, klaar = false, hulp = false, knoppenInVlak = false, lijst = [], tegel = null, verborgen = false, snoer = null, snoerActief = false, snoerDicht = false, golf = 0, sterren = false, meld, schaal } = p;
  const { plek, scene } = useHoloMotor<SplitsScene>(schaal, maakScene());
  const totaal = geheel ?? links + rechts;
  const huisZichtbaar = !tegel && !verborgen && snoer === null;

  useEffect(() => {
    scene?.huis({ links, rechts, geheel: totaal, zichtbaar: huisZichtbaar, vraag, sterren });
    testHaak({ links, rechts, geheel: totaal });
  }, [scene, links, rechts, totaal, huisZichtbaar, vraag, sterren]);
  useEffect(() => {
    scene?.tegel(tegel);
  }, [scene, tegel]);
  useEffect(() => {
    scene?.snoer(snoer, snoerDicht);
  }, [scene, snoer, snoerDicht]);
  useEffect(() => {
    if (scene && golf) scene.goed(GEHEEL.x, GEHEEL.y);
  }, [scene, golf]);

  const werkt = (k: Splitsknop) => knoppen && (alleen === null || alleen === k);
  const knop = (k: Splitsknop) => () => meld({ soort: "knop", knop: k });

  return (
    <div className={s.vlak}>
      <div ref={plek} style={HOLO_CANVAS} aria-hidden />

      {huisZichtbaar && (
        <>
          <Rondknop x={LINKS.x - 58} y={LINKS.y + LINKS.r + 52} teken="−" knop="links-min" aan={werkt("links-min")} goud={alleen === "links-min"} onTik={knop("links-min")} />
          <Rondknop x={LINKS.x + 58} y={LINKS.y + LINKS.r + 52} teken="+" knop="links-plus" aan={werkt("links-plus")} goud={alleen === "links-plus"} onTik={knop("links-plus")} />
          <Rondknop x={RECHTS.x - 58} y={RECHTS.y + RECHTS.r + 52} teken="−" knop="rechts-min" aan={werkt("rechts-min")} goud={alleen === "rechts-min"} onTik={knop("rechts-min")} />
          <Rondknop x={RECHTS.x + 58} y={RECHTS.y + RECHTS.r + 52} teken="+" knop="rechts-plus" aan={werkt("rechts-plus")} goud={alleen === "rechts-plus"} onTik={knop("rechts-plus")} />
          {knoppenInVlak && (klaar || hulp) && (
            <div style={{ position: "absolute", left: 790, top: 440, display: "flex", flexDirection: "column", gap: 16 }}>
              {hulp && <IkoonKnop ikoon="vraag" label="Weet ik niet" knop="hulpvlak" className={s.ikoon} onClick={() => meld({ soort: "hulp" })} />}
              {klaar && <IkoonKnop ikoon="vink" label="Klaar" knop="klaar" kleur="blauw" className={s.ikoon} onClick={() => meld({ soort: "klaar" })} />}
            </div>
          )}
          {lijst.length > 0 && (
            <div className={`${s.lijst} ${s.tekst}`}>
              {lijst.map(([a, b, c], i) => (
                <div key={`${a}-${b}-${i}`}>
                  <span style={{ color: getalkleur(a) }}>{a}</span>
                  <span style={{ color: "#d6e6f5" }}> + </span>
                  <span style={{ color: getalkleur(b) }}>{b}</span>
                  <span style={{ color: "#d6e6f5" }}> = </span>
                  <span style={{ color: getalkleur(c) }}>{c}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tegel === "heel" && (
        <button type="button" data-knop="tegel" aria-label="De parelplank van 5" className={s.tikplek} style={{ left: 420 - 80, top: 360 - 110, width: 160, height: 220 }} onClick={() => meld({ soort: "tegel" })} />
      )}

      {snoer !== null && !snoerDicht && (
        <>
          <button type="button" data-knop="parels" aria-label="Een parel aan het snoer" className={s.tikplek} style={{ left: 200, top: BAK_Y - 60, width: 520, height: 120 }} disabled={!snoerActief} onClick={() => meld({ soort: "parel" })} />
          <button type="button" data-knop="snoer" aria-label="Het snoer dichtmaken" className={s.tikplek} style={{ left: SNOER.x0 - 30, top: SNOER.y - 60, width: SNOER.x1 - SNOER.x0 + 60, height: SNOER.zak + 120 }} disabled={!snoerActief} onClick={() => meld({ soort: "sluit" })} />
        </>
      )}
    </div>
  );
}
