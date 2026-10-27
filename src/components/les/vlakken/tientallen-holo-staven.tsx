"use client";

/**
 * Sterrenbeelden van tien als hologram (27 oktober 2026, LESSENPLAN.md G14
 * "Tiental plus eenheden" en O19 "Aanvullen tot het tiental", wereld
 * Universum). Vervangt in die lessen het tientallenbord
 * (`optellen100-tientallen.tsx`) en de stippen in groepen van tien
 * (`optellen100-kaders.tsx`); die bestanden blijven bestaan.
 *
 * Vier beelden in één vlak:
 * - `staven`: sterrenbeelden van tien (2 × 5 sterren in een dun lichtkader).
 *   Volle groepen en één groep die nog niet vol is, met lege plekjes die zacht
 *   oplichten. Bovenaan een palet met gekleurde sterrengroepjes 1 t/m 9. Kiest
 *   het kind een groepje, dan vliegen die sterren in de lege plekjes; wat niet
 *   past komt in een nieuwe groep. Zo zie je zonder woorden of het te weinig,
 *   precies goed of te veel is.
 * - `pijlen`: alleen de som groot, met twee pijlen op het cijfer van de
 *   tientallen vóór en ná: dat blijft hetzelfde.
 * - `kaart`: twee kristallen kolommen, links de tientallen (kleine
 *   sterrenbeelden), rechts de eenheden (losse sterren), met het cijfer groot
 *   erboven. Tik in de kolom van de eenheden en er komt een ster bij.
 * - `leeg`: niets (de snelle vragen zonder sterren).
 *
 * De som zelf staat bovenaan in het lesscherm (`l.som`).
 *
 * Meldingen (alleen als `actief` aan staat): `{ soort: "kies", n }`,
 * `{ soort: "klaar" }` (het vinkje), `{ soort: "hulp" }` (het vraagteken),
 * `{ soort: "eenheid" }` (een tik in de kolom van de eenheden),
 * `{ soort: "kolom", kolom }` (een tik op een kolom, om te kiezen).
 */

import { useEffect, useRef } from "react";
import type { Vlakbasis } from "../soort";
import { holoBasis, GOED, WARM } from "../holo/basis";
import { HOLO_CANVAS, useHoloMotor } from "../holo/motor";
import { IkoonKnop } from "../ikonen";
import { TEGELKLEUR, getalkleur, vorm } from "../tegels";
import { maakSterPlaatjes, PAARS, tekenSter, testHaak } from "./tientallen-holo-basis";
import s from "./tientallen-holo.module.css";

export type StavenProps = {
  modus: "staven" | "pijlen" | "kaart" | "leeg";
  /* staven */
  /** Volle groepen van tien (witte sterren). */
  tienen?: number;
  /** Witte sterren in de groep die nog niet vol is (0 t/m 9). */
  los?: number;
  /** Gekleurde groepjes die erbij zijn gedaan, in volgorde (bv. [3, 2]). */
  bij?: number[];
  /** Lege plekjes in de groep die niet vol is laten zien (standaard aan). */
  lege?: boolean;
  /** Een ring om de groep die nog niet vol is ("hoeveel zitten erin?"). */
  omlijnLos?: boolean;
  palet?: boolean;
  paletSlot?: number[];
  actief?: boolean;
  /** Het vinkje: het kind is tevreden met zijn keuze. */
  vinkje?: boolean;
  /** Het vraagteken: weet ik niet. */
  hulp?: boolean;
  /** Elke keer dat dit getal verandert: een rustige lichtgolf (goed). */
  golf?: number;
  /* pijlen */
  pijlen?: { a: number; b: number; c: number } | null;
  /* kaart */
  kaartTienen?: number;
  kaartEnen?: number;
  /** In de kaart: tik op een kolom om hem te kiezen. */
  kolomKiezen?: boolean;
};

export type StavenMelding = { soort: "kies"; n: number } | { soort: "klaar" } | { soort: "hulp" } | { soort: "eenheid" } | { soort: "kolom"; kolom: "tien" | "een" };

/* ---------- maten (punten van het vlak) ---------- */

const STAP = 50;
const GROEP_B = STAP * 2 + 18;
const GROEP_H = STAP * 5 + 18;
const TUSSEN = 34;
const KOLOM = { b: 300, h: 360, y: 250, tienX: 330, eenX: 650 };

type Stuk = { sleutel: string; tex: string; x: number; y: number; van?: { x: number; y: number } };

/** De sterren van de staven: witte groepen, dan de groep die niet vol is, dan de gekleurde groepjes. */
function stukkenVan(p: StavenProps, metPalet: boolean): { stukken: Stuk[]; groepen: { x: number; y: number; nietVol: boolean }[] } {
  const tienen = p.tienen ?? 0;
  const los = p.los ?? 0;
  const bij = p.bij ?? [];
  const lege = p.lege ?? true;
  /* Elke plek: welke groep, welk vakje (0–9), wat erin. */
  type Plek = { g: number; i: number; tex: string; sleutel: string; groepje?: number };
  const plekken: Plek[] = [];
  for (let g = 0; g < tienen; g++) for (let i = 0; i < 10; i++) plekken.push({ g, i, tex: "ster-g", sleutel: `w${g}-${i}` });
  let g = tienen;
  let i = 0;
  for (let k = 0; k < los; k++) plekken.push({ g, i: i++, tex: "ster-g", sleutel: `w${g}-${k}` });
  bij.forEach((n, bi) => {
    for (let k = 0; k < n; k++) {
      if (i >= 10) {
        g++;
        i = 0;
      }
      plekken.push({ g, i: i++, tex: `ster-k${n}-g`, sleutel: `b${bi}-${n}-${k}`, groepje: bi });
    }
  });
  const aantalGroepen = los > 0 || bij.length > 0 ? g + 1 : g;
  const nietVol = i > 0 && i < 10 ? g : -1;
  const breed = aantalGroepen * GROEP_B + Math.max(0, aantalGroepen - 1) * TUSSEN;
  const x0 = 470 - breed / 2;
  const onder = metPalet ? 640 : 560;
  const groepen = Array.from({ length: aantalGroepen }, (_, k) => ({ x: x0 + k * (GROEP_B + TUSSEN) + GROEP_B / 2, y: onder - GROEP_H / 2, nietVol: k === nietVol }));
  const vakjes = vorm(10);
  const plekXY = (gg: number, ii: number) => {
    const v = vakjes[ii];
    return { x: groepen[gg].x + (v.k === 0 ? -STAP / 2 : STAP / 2), y: onder - 9 - STAP / 2 - v.r * STAP };
  };
  const stukken: Stuk[] = plekken.map((q) => ({ sleutel: q.sleutel, tex: q.tex, ...plekXY(q.g, q.i) }));
  /* Lege plekjes in de groep die nog niet vol is. */
  if (lege && nietVol >= 0) for (let k = i; k < 10; k++) stukken.push({ sleutel: `leeg${nietVol}-${k}`, tex: "plek", ...plekXY(nietVol, k) });
  return { stukken, groepen };
}

/* ---------- de scène ---------- */

interface StavenScene {
  toon(stukken: Stuk[], groepen: { x: number; y: number; nietVol: boolean }[], omlijn: boolean): void;
  kaart(tienen: number, enen: number, aan: boolean): void;
  goed(x: number, y: number): void;
}

function maakScene() {
  return (Phaser: typeof import("phaser"), rustig: boolean) => {
    const Basis = holoBasis(Phaser, rustig);
    type Img = import("phaser").GameObjects.Image;
    class Staven extends Basis implements StavenScene {
      sprites = new Map<string, Img>();
      kaders: Img[] = [];
      ring: Img | null = null;
      kaartDelen: Img[] = [];

      constructor() {
        super("sterrenbeelden");
      }

      maak() {
        maakSterPlaatjes(this);
        /* Het kader van een sterrenbeeld: dun en licht, met afgeronde hoeken. */
        this.canvasPlaatje("kader", GROEP_B, GROEP_H, (c) => {
          c.beginPath();
          c.roundRect(3, 3, GROEP_B - 6, GROEP_H - 6, 18);
          c.fillStyle = "rgba(60,40,150,0.22)";
          c.fill();
          c.lineWidth = 2.5;
          c.strokeStyle = "rgba(215,205,255,0.7)";
          c.stroke();
        });
        this.bak("kader", "kader-g", PAARS);
        /* Een kristallen kolom voor de kaart. */
        this.canvasPlaatje("kolom", KOLOM.b, KOLOM.h, (c) => {
          const b = KOLOM.b;
          const h = KOLOM.h;
          c.beginPath();
          c.moveTo(18, 4);
          c.lineTo(b - 18, 4);
          c.lineTo(b - 4, 20);
          c.lineTo(b - 4, h - 20);
          c.lineTo(b - 18, h - 4);
          c.lineTo(18, h - 4);
          c.lineTo(4, h - 20);
          c.lineTo(4, 20);
          c.closePath();
          const g = c.createLinearGradient(0, 0, b, h);
          g.addColorStop(0, "rgba(120,100,240,0.3)");
          g.addColorStop(0.5, "rgba(40,30,120,0.2)");
          g.addColorStop(1, "rgba(120,100,240,0.3)");
          c.fillStyle = g;
          c.fill();
          c.lineWidth = 3;
          c.strokeStyle = "rgba(225,215,255,0.95)";
          c.stroke();
        });
        this.bak("kolom", "kolom-g", PAARS);
        /* Een klein sterrenbeeld van tien (voor de kolom van de tientallen). */
        this.canvasPlaatje("mini10", 56, 132, (c) => {
          c.beginPath();
          c.roundRect(2, 2, 52, 128, 10);
          c.fillStyle = "rgba(60,40,150,0.3)";
          c.fill();
          c.lineWidth = 2;
          c.strokeStyle = "rgba(215,205,255,0.8)";
          c.stroke();
          for (let i = 0; i < 10; i++) tekenSter(c, 16 + (i % 2) * 24, 116 - Math.floor(i / 2) * 24, 10);
        });
        this.bak("mini10", "mini10-g", PAARS);
        /* Een ring om de groep die niet vol is. */
        this.canvasPlaatje("ringkader", GROEP_B + 24, GROEP_H + 24, (c) => {
          c.beginPath();
          c.roundRect(4, 4, GROEP_B + 16, GROEP_H + 16, 24);
          c.lineWidth = 4;
          c.strokeStyle = "rgba(255,255,255,0.95)";
          c.stroke();
        });
      }

      toon(stukken: Stuk[], groepen: { x: number; y: number; nietVol: boolean }[], omlijn: boolean) {
        /* Kaders: opnieuw (goedkoop), op hun plek. */
        this.kaders.forEach((k) => k.destroy());
        this.kaders = groepen.map((gp) => this.plaats("kader-g", gp.x, gp.y).setDepth(0));
        this.ring?.destroy();
        this.ring = null;
        const nv = groepen.find((gp) => gp.nietVol);
        if (omlijn && nv) {
          this.ring = this.plaats("ringkader", nv.x, nv.y).setTint(WARM).setDepth(1);
          if (!rustig) this.tweens.add({ targets: this.ring, alpha: 0.45, duration: 700, yoyo: true, repeat: -1 });
        }
        const nieuw = new Set(stukken.map((st) => st.sleutel));
        for (const [k, o] of this.sprites) {
          if (!nieuw.has(k)) {
            this.sprites.delete(k);
            if (o.texture.key === "plek") o.destroy();
            else this.verdwijn(o);
          }
        }
        let n = 0;
        for (const st of stukken) {
          const o = this.sprites.get(st.sleutel);
          if (o) {
            if (o.x !== st.x || o.y !== st.y) this.tweens.add({ targets: o, x: st.x, y: st.y, duration: rustig ? 1 : 300, ease: "Cubic.easeOut" });
            continue;
          }
          const m = this.plaats(st.tex, st.van?.x ?? st.x, st.van?.y ?? st.y).setDepth(st.tex === "plek" ? 1 : 2);
          if (st.tex === "plek") {
            m.setAlpha(0.95).setTint(0xffe6a8);
            if (!rustig) this.tweens.add({ targets: m, alpha: 0.55, duration: 900, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
          } else if (st.van) {
            this.tweens.add({ targets: m, x: st.x, y: st.y, delay: n * 45, duration: rustig ? 1 : 420, ease: "Cubic.easeOut" });
          } else {
            const sc = m.scaleX;
            m.setAlpha(0).setScale(sc * 0.6);
            this.tweens.add({ targets: m, alpha: 1, scale: sc, delay: n * 12, duration: rustig ? 1 : 220, ease: "Back.easeOut" });
          }
          n++;
          this.sprites.set(st.sleutel, m);
        }
      }

      kaart(tienen: number, enen: number, aan: boolean) {
        this.kaartDelen.forEach((o) => o.destroy());
        this.kaartDelen = [];
        if (!aan) return;
        this.kaartDelen.push(this.plaats("kolom-g", KOLOM.tienX, KOLOM.y + KOLOM.h / 2), this.plaats("kolom-g", KOLOM.eenX, KOLOM.y + KOLOM.h / 2));
        for (let k = 0; k < tienen; k++) {
          const x = KOLOM.tienX - ((Math.min(tienen, 4) - 1) * 66) / 2 + (k % 4) * 66;
          const y = KOLOM.y + KOLOM.h - 90 - Math.floor(k / 4) * 150;
          this.kaartDelen.push(this.plaats("mini10-g", x, y));
        }
        for (let k = 0; k < enen; k++) {
          const x = KOLOM.eenX - 70 + (k % 3) * 70;
          const y = KOLOM.y + KOLOM.h - 50 - Math.floor(k / 3) * 64;
          const o = this.plaats("ster-g", x, y);
          this.kaartDelen.push(o);
        }
      }

      goed(x: number, y: number) {
        this.golf(x, y, GOED);
      }

      demo(ms: number) {
        const eind = performance.now() + ms;
        let n = 0;
        const stap = () => {
          if (performance.now() > eind) return;
          n = (n % 9) + 1;
          const { stukken, groepen } = stukkenVan({ modus: "staven", tienen: 2, los: 4, bij: [n] }, true);
          this.toon(stukken, groepen, false);
          this.time.delayedCall(700, stap);
        };
        stap();
      }
    }
    return Staven as unknown as new () => import("phaser").Scene;
  };
}

/* ---------- HTML-delen ---------- */

/** Een groepje gekleurde sterren in de vorm van een getaltegel (rijtjes van twee, van onder naar boven). */
export function Sterrengroepje({ n, maat = 96 }: { n: number; maat?: number }) {
  const kleur = TEGELKLEUR[n];
  const r = 9.5;
  const stap = 21;
  return (
    <svg width={maat} height={maat * 1.08} viewBox="0 0 96 104" aria-hidden>
      {vorm(n).map((hk, i) => {
        const cx = 48 + (hk.k === 0 ? -stap / 2 : stap / 2);
        const cy = 92 - hk.r * stap;
        const punten = Array.from({ length: 10 }, (_, j) => {
          const hoek = -Math.PI / 2 + (j * Math.PI) / 5;
          const rr = j % 2 === 0 ? r : r * 0.46;
          return `${(cx + rr * Math.cos(hoek)).toFixed(1)},${(cy + rr * Math.sin(hoek)).toFixed(1)}`;
        }).join(" ");
        return <polygon key={i} points={punten} fill={kleur} stroke="#ffffff" strokeWidth={1.3} strokeLinejoin="round" />;
      })}
    </svg>
  );
}

/** Waar elk palet-groepje staat (2 rijen: 5 en 4), voor de knoppen en voor waar de sterren vandaan vliegen. */
function paletPlek(n: number) {
  const rij = n <= 5 ? 0 : 1;
  const inRij = rij === 0 ? 5 : 4;
  const k = rij === 0 ? n - 1 : n - 6;
  const b = 116;
  const x = 470 - ((inRij - 1) * b) / 2 + k * b;
  return { x, y: 186 + rij * 118 };
}

/** Een getal met één of meer cijfers, cijfer voor cijfer op een vaste breedte (voor de pijlen). */
function Cijfers({ n, x, kleur, maat }: { n: number; x: number; kleur: (i: number) => string; maat: number }) {
  return (
    <>
      {String(n)
        .split("")
        .map((d, i) => (
          <span key={i} className={s.tekst} style={{ position: "absolute", left: x + i * maat * 0.62, top: 300, width: maat * 0.62, textAlign: "center", fontSize: maat, fontWeight: 800, color: kleur(i), lineHeight: 1 }}>
            {d}
          </span>
        ))}
    </>
  );
}

function PijlenBeeld({ a, b, c }: { a: number; b: number; c: number }) {
  /* "a + b = c", met de cijfers op vaste plekken zodat de pijlen precies op de tientallen staan. */
  const M = 110;
  const w = M * 0.62;
  const delen = [String(a).length * w, w * 1.2, String(b).length * w, w * 1.2, String(c).length * w];
  const totaal = delen.reduce((x, y) => x + y, 0) + 4 * 24;
  let x = 470 - totaal / 2;
  const pos: number[] = [];
  for (const d of delen) {
    pos.push(x);
    x += d + 24;
  }
  const tA = pos[0] + w / 2;
  const tC = pos[4] + w / 2;
  const boven = 282;
  return (
    <>
      <Cijfers n={a} x={pos[0]} maat={M} kleur={(i) => (i === 0 ? "#ffd36e" : "#ffffff")} />
      <span className={s.tekst} style={{ position: "absolute", left: pos[1], width: delen[1], top: 300, textAlign: "center", fontSize: M, fontWeight: 800, lineHeight: 1 }}>
        +
      </span>
      <Cijfers n={b} x={pos[2]} maat={M} kleur={() => getalkleur(b)} />
      <span className={s.tekst} style={{ position: "absolute", left: pos[3], width: delen[3], top: 300, textAlign: "center", fontSize: M, fontWeight: 800, lineHeight: 1 }}>
        =
      </span>
      <Cijfers n={c} x={pos[4]} maat={M} kleur={(i) => (i === 0 ? "#ffd36e" : getalkleur(b))} />
      <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={980} height={720} aria-hidden>
        <defs>
          <marker id="tt-pijlpunt" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0 0L10 5L0 10z" fill="#ffd36e" />
          </marker>
        </defs>
        <path d={`M ${tA} ${boven} V 236`} stroke="#ffd36e" strokeWidth={7} fill="none" strokeLinecap="round" markerStart="url(#tt-pijlpunt)" />
        <path d={`M ${tC} ${boven} V 236`} stroke="#ffd36e" strokeWidth={7} fill="none" strokeLinecap="round" markerStart="url(#tt-pijlpunt)" />
      </svg>
    </>
  );
}

/* ---------- het vlak ---------- */

export function HoloStaven(p: StavenProps & Vlakbasis) {
  const { modus, palet = false, paletSlot = [], actief = false, vinkje = false, hulp = false, golf = 0, pijlen = null, kaartTienen = 0, kaartEnen = 0, kolomKiezen = false, meld, schaal } = p;
  const { plek, scene } = useHoloMotor<StavenScene>(schaal, maakScene());
  const vorigBij = useRef<number[]>([]);
  const groepenRef = useRef<{ x: number; y: number; nietVol: boolean }[]>([]);

  const staven = modus === "staven";
  const bijSleutel = (p.bij ?? []).join(",");

  useEffect(() => {
    if (!scene) return;
    if (!staven) {
      scene.toon([], [], false);
      return;
    }
    const { stukken, groepen } = stukkenVan(p, palet);
    groepenRef.current = groepen;
    /* Nieuwe gekleurde sterren vliegen vanuit hun groepje in het palet. */
    const bij = p.bij ?? [];
    const oud = vorigBij.current;
    const nieuweIndex = bij.length > 0 && (bij.length !== oud.length || bij[bij.length - 1] !== oud[oud.length - 1]) ? bij.length - 1 : -1;
    if (nieuweIndex >= 0) {
      const van = paletPlek(bij[nieuweIndex]);
      for (const st of stukken) if (st.sleutel.startsWith(`b${nieuweIndex}-`)) st.van = palet ? van : { x: st.x, y: st.y - 120 };
    }
    vorigBij.current = bij;
    scene.toon(stukken, groepen, !!p.omlijnLos);
    testHaak({ tienen: p.tienen ?? 0, los: p.los ?? 0, bij });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, staven, p.tienen, p.los, bijSleutel, p.lege, p.omlijnLos, palet]);

  useEffect(() => {
    scene?.kaart(kaartTienen, kaartEnen, modus === "kaart");
    testHaak({ kaartEnen });
  }, [scene, modus, kaartTienen, kaartEnen]);

  useEffect(() => {
    if (!scene || golf === 0) return;
    const gp = groepenRef.current;
    const laatste = gp[gp.length - 1];
    if (modus === "staven" && laatste) scene.goed(laatste.x, laatste.y);
    else if (modus === "kaart") scene.goed(KOLOM.eenX, KOLOM.y + KOLOM.h / 2);
    else scene.goed(470, 360);
  }, [scene, golf, modus]);

  const k = KOLOM;

  return (
    <div className={s.vlak}>
      <div ref={plek} style={HOLO_CANVAS} aria-hidden />

      {staven && palet && (
        <>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
            const pl = paletPlek(n);
            const slot = paletSlot.includes(n);
            const gekozen = (p.bij ?? []).length > 0 && (p.bij ?? [])[(p.bij ?? []).length - 1] === n && vinkje;
            return (
              <button
                key={n}
                type="button"
                data-knop={`groepje${n}`}
                aria-label={`Een groepje van ${n}`}
                className={`${s.groepje} ${slot ? s.opslot : ""} ${gekozen ? s.gekozen : ""}`}
                style={{ position: "absolute", left: pl.x - 52, top: pl.y - 56, width: 104, height: 112 }}
                disabled={!actief || slot}
                onClick={() => meld({ soort: "kies", n })}
              >
                <Sterrengroepje n={n} maat={84} />
              </button>
            );
          })}
        </>
      )}

      {(vinkje || hulp) && (
        <div style={{ position: "absolute", left: 846, top: palet ? 420 : 300, display: "flex", flexDirection: "column", gap: 18 }}>
          {hulp && <IkoonKnop ikoon="vraag" label="Weet ik niet" knop="hulpvlak" className={s.ikoon} disabled={!actief} onClick={() => meld({ soort: "hulp" })} />}
          {vinkje && <IkoonKnop ikoon="vink" label="Klaar" knop="klaar" kleur="blauw" className={s.ikoon} disabled={!actief} onClick={() => meld({ soort: "klaar" })} />}
        </div>
      )}

      {modus === "pijlen" && pijlen && <PijlenBeeld {...pijlen} />}

      {modus === "kaart" && (
        <>
          <div className={`${s.cijfer} ${s.tekst}`} style={{ left: k.tienX - 100, width: 200, top: k.y - 96, color: "#e6deff" }}>
            {kaartTienen}
          </div>
          <div className={`${s.cijfer} ${s.tekst}`} style={{ left: k.eenX - 100, width: 200, top: k.y - 96, color: "#fff3c0" }}>
            {kaartEnen}
          </div>
          <button
            type="button"
            data-knop="kolomtien"
            aria-label="De tientallen"
            className={s.tikplek}
            style={{ left: k.tienX - k.b / 2, top: k.y, width: k.b, height: k.h }}
            disabled={!(actief && kolomKiezen)}
            onClick={() => meld({ soort: "kolom", kolom: "tien" })}
          />
          <button
            type="button"
            data-knop="kolomeen"
            aria-label="De eenheden"
            className={s.tikplek}
            style={{ left: k.eenX - k.b / 2, top: k.y, width: k.b, height: k.h }}
            disabled={!actief}
            onClick={() => meld(kolomKiezen ? { soort: "kolom", kolom: "een" } : { soort: "eenheid" })}
          />
        </>
      )}
    </div>
  );
}
