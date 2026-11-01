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
import { holoBasis, GOED, TX, WARM, type PhaserModule } from "../holo/basis";
import { HOLO_CANVAS, useHoloMotor } from "../holo/motor";
import { speelLesgeluid } from "@/lib/lesgeluiden";
import { dingSleutel, gloedVan, maatVan, RAND, tekenDing, type Ding } from "./squla-klok-tekenen";
import s from "./squla-klok.module.css";

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
};

/* ---------- de scène ---------- */

type Staat = "gewoon" | "licht" | "goed" | "fout" | "uit";
type Item = { id: string; d: Ding; x: number; y: number; s: number; staat: Staat; draai?: boolean; sleept?: boolean };
type Lijn = { x1: number; y1: number; x2: number; y2: number; kleur: number };
type Vak = { x: number; y: number; b: number; h: number; rond: boolean };
type Beeld = { sleutel: string; items: Item[]; lijnen: Lijn[]; vakken: Vak[]; pijlen: { x1: number; x2: number; y: number }[] };

interface KlokScene {
  zet(b: Beeld): void;
  sleepNaar(id: string, x: number, y: number): void;
}

function maakKlokScene(Phaser: PhaserModule, rustig: boolean) {
  const Basis = holoBasis(Phaser, rustig);
  type Img = import("phaser").GameObjects.Image;
  type Gfx = import("phaser").GameObjects.Graphics;
  type Stuk = { img: Img; tex: string; staat: Staat; ring: Img | null; item: Item };

  class Klok extends Basis implements KlokScene {
    stukken = new Map<string, Stuk>();
    sleutel = "";
    lijnen: Gfx | null = null;
    vakGfx: Gfx | null = null;
    rij: (() => void)[] = [];
    drukTot = 0;
    laatste: Beeld | null = null;

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

    tex(d: Ding) {
      const sl = dingSleutel(d);
      const { b, h } = maatVan(d);
      this.canvasPlaatje(sl, b, h, (c) => tekenDing(c, d));
      return sl;
    }

    texGloed(d: Ding) {
      const sl = this.tex(d);
      this.bak(sl, `${sl}-g`, gloedVan(d));
      return `${sl}-g`;
    }

    texVoor(d: Ding, staat: Staat) {
      return staat === "licht" || staat === "goed" ? this.texGloed(d) : this.tex(d);
    }

    ringVoor(it: Item, staat: Staat) {
      if (staat !== "licht" && staat !== "goed") return null;
      const { b, h } = maatVan(it.d);
      /* een ring alleen om ronde of vierkante dingen; brede dingen lichten alleen op */
      if (Math.max(b, h) / Math.min(b, h) > 1.4) return null;
      const r = (Math.max(b, h) * it.s) / 2 + 10;
      return this.selectieRing(it.x, it.y, r, staat === "goed" ? GOED : WARM).setDepth(2);
    }

    zetStaat(st: Stuk, staat: Staat) {
      const oud = st.staat;
      st.staat = staat;
      const tex = this.texVoor(st.item.d, staat);
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
      if (b.sleutel !== this.sleutel) {
        this.sleutel = b.sleutel;
        for (const st of this.stukken.values()) {
          st.ring?.destroy();
          this.verdwijn(st.img);
        }
        this.stukken.clear();
        this.vakGfx?.clear();
        this.tekenVakken(b);
      }
      const nu = new Set(b.items.map((i) => i.id));
      for (const [id, st] of this.stukken) {
        if (nu.has(id)) continue;
        st.ring?.destroy();
        this.verdwijn(st.img);
        this.stukken.delete(id);
      }
      let n = 0;
      for (const it of b.items) {
        const st = this.stukken.get(it.id);
        if (!st) {
          const tex = this.texVoor(it.d, it.staat);
          const img = this.plaats(tex, it.x, it.y).setScale(it.s / TX).setDepth(it.sleept ? 4 : 3);
          const nieuw: Stuk = { img, tex, staat: "gewoon", ring: null, item: it };
          this.stukken.set(it.id, nieuw);
          this.tover(img, { vertraging: n++ * 70 });
          if (it.staat !== "gewoon") this.time.delayedCall(rustig ? 0 : 400, () => nieuw.img.active && this.zetStaat(nieuw, it.staat));
          continue;
        }
        const oudD = dingSleutel(st.item.d);
        const verplaatst = st.item.x !== it.x || st.item.y !== it.y;
        st.item = it;
        st.img.setDepth(it.sleept ? 4 : 3);
        if (oudD !== dingSleutel(it.d)) {
          /* een memorykaartje draait om */
          const wissel = () => {
            st.tex = this.texVoor(it.d, st.staat);
            st.img.setTexture(st.tex);
          };
          if (it.draai && !rustig) {
            this.tweens.add({
              targets: st.img,
              scaleX: 0,
              duration: 110,
              onComplete: () => {
                wissel();
                this.tweens.add({ targets: st.img, scaleX: it.s / TX, duration: 130 });
              },
            });
          } else wissel();
        }
        if (verplaatst) {
          if (it.sleept || rustig) st.img.setPosition(it.x, it.y);
          else this.tweens.add({ targets: st.img, x: it.x, y: it.y, duration: 220, ease: "Cubic.easeOut" });
        }
        st.img.setScale(it.s / TX);
        if (st.staat !== it.staat || (verplaatst && st.ring)) this.zetStaat(st, it.staat);
      }
      this.tekenLijnen(b);
      /* de gloed van alles in beeld vooruit bakken */
      if (!b.sleutel.includes("-demo-")) this.rij = b.items.map((it) => () => void this.texGloed(it.d));
    }

    sleepNaar(id: string, x: number, y: number) {
      const st = this.stukken.get(id);
      if (!st) return;
      st.img.setPosition(x, y).setDepth(4);
      st.ring?.setPosition(x, y);
    }

    tekenVakken(b: Beeld) {
      const g = this.vakGfx!;
      g.clear();
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

function rijX(n: number, gap: number) {
  return Array.from({ length: n }, (_, i) => MIDX + (i - (n - 1) / 2) * gap);
}

type Plek = { id: string; d: Ding; x: number; y: number; s: number };

function kiesIndeling(boven: Ding[], keuzes: Ding[], pijl: boolean) {
  const plekken: Plek[] = [];
  const pijlen: Beeld["pijlen"] = [];
  const klein = keuzes.every((k) => k.t === "vink" || k.t === "kruis");
  if (boven.length) {
    const bx = rijX(boven.length, boven.length === 1 ? 0 : pijl ? 420 : 380);
    const by = keuzes.length ? 215 : 340;
    boven.forEach((d, i) => plekken.push({ id: `b${i}`, d, x: bx[i], y: by, s: past(d, boven.length === 1 ? 440 : 330, keuzes.length ? 300 : 420) }));
    if (pijl && boven.length === 2) pijlen.push({ x1: MIDX - 50, x2: MIDX + 50, y: by });
    const gap = klein ? 260 : keuzes.length === 2 ? 380 : 310;
    const kx = rijX(keuzes.length, gap);
    keuzes.forEach((d, i) => plekken.push({ id: `k${i}`, d, x: kx[i], y: 548, s: past(d, klein ? 150 : keuzes.length === 2 ? 320 : 280, klein ? 150 : 230) }));
  } else {
    const gap = keuzes.length === 2 ? 430 : 310;
    const kx = rijX(keuzes.length, gap);
    keuzes.forEach((d, i) => plekken.push({ id: `k${i}`, d, x: kx[i], y: 370, s: past(d, keuzes.length === 2 ? 370 : 285, 340) }));
  }
  return { plekken, pijlen };
}

/* ---------- het vlak ---------- */

export function SqulaKlokVlak(p: KlokVlakProps & Vlakbasis) {
  const { plek, scene } = useHoloMotor<KlokScene>(p.schaal, maakKlokScene);
  const vlakRef = useRef<HTMLDivElement>(null);
  return (
    <div className={s.vlak} ref={vlakRef}>
      <div ref={plek} style={HOLO_CANVAS} aria-hidden />
      {p.modus === "kies" && <Kies {...p} scene={scene} />}
      {p.modus === "sleep" && <Sleep key={p.sleutel} {...p} scene={scene} vlak={vlakRef} />}
      {p.modus === "memory" && <Memory key={p.sleutel} {...p} scene={scene} />}
      {p.modus === "verbind" && <Verbind key={p.sleutel} {...p} scene={scene} />}
    </div>
  );
}

type Deel = KlokVlakProps & Vlakbasis & { scene: KlokScene | null };

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
  const ind = useMemo(() => kiesIndeling(p.boven ?? [], p.keuzes ?? [], !!p.pijl), [p.boven, p.keuzes, p.pijl]);
  const sleutelLijsten = JSON.stringify([p.licht, p.goed, p.fout, p.uit]);
  useEffect(() => {
    if (!scene) return;
    scene.zet({
      sleutel: p.sleutel,
      items: ind.plekken.map((q) => ({ ...q, staat: staatVan(p, q.id) })),
      lijnen: [],
      vakken: [],
      pijlen: ind.pijlen,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, p.sleutel, ind, sleutelLijsten]);
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
  const plekken = kaarten.map((_, i) => ({ x: MIDX + ((i % 3) - 1) * 240, y: 225 + Math.floor(i / 3) * 280 }));
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
      return { id: `m${i}`, d, x: plekken[i].x, y: plekken[i].y, s: past(d, 200, 200), staat: staatVan(p, `m${i}`, staat), draai: true };
    });
    scene.zet({ sleutel: p.sleutel, items, lijnen: [], vakken: [], pijlen: [] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, p.sleutel, kaarten, kijk, open, gevonden, net, mis]);

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
        speelLesgeluid("goed");
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
      speelLesgeluid("mis");
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
        <Knop key={i} id={`m${i}`} d={{ t: "dicht" }} x={plekken[i].x} y={plekken[i].y} sch={200 / 170} aan={!!p.actief && !kijk && !gevonden.includes(i)} label={`Bolletje ${i + 1}`} klik={() => tik(i)} />
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
  const gap = n >= 4 ? 150 : 180;
  const maat = n >= 4 ? 132 : 158;
  const yVan = (i: number) => 370 + (i - (n - 1) / 2) * gap;
  const LX = 300;
  const RX = 680;
  const [kies, setKies] = useState<string | null>(null);
  const [lijnen, setLijnen] = useState<[number, number][]>([]);
  const [fout, setFout] = useState<[number, number] | null>(null);
  const klaar = useRef(false);

  const items = useMemo(() => {
    const lijst: Plek[] = [];
    paren.forEach((pr, i) => lijst.push({ id: `l${i}`, d: pr[0], x: LX, y: yVan(i), s: past(pr[0], maat * 1.6, maat) }));
    rechts.forEach((k, j) => lijst.push({ id: `r${j}`, d: paren[k][1], x: RX, y: yVan(j), s: past(paren[k][1], maat * 1.6, maat) }));
    return lijst;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paren, rechts, maat]);
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
      lijnen: [...lijnen.map((l) => lijn(l, GOED)), ...(fout ? [lijn(fout, 0xff6b75)] : [])],
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
      setTimeout(() => speelLesgeluid("goed"), 150);
      if (nu.length === paren.length) {
        klaar.current = true;
        setTimeout(() => meld({ soort: "verbind" }), 800);
      }
      return;
    }
    setFout([l, r]);
    setTimeout(() => speelLesgeluid("mis"), 150);
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

/** Op de verzamelkaart: een wijzerklok en een digitale klok die even laat zijn (244 × 190). */
export function KaartKlok() {
  const wijzer = (h: number, lang: number, dik: number) => {
    const a = (h * Math.PI) / 180;
    return <line x1={78} y1={95} x2={78 + Math.sin(a) * lang} y2={95 - Math.cos(a) * lang} stroke="#1d2540" strokeWidth={dik} strokeLinecap="round" />;
  };
  return (
    <>
      <circle cx={78} cy={95} r={58} fill={RAND.blauw} />
      <circle cx={78} cy={95} r={50} fill="#fffdf6" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * Math.PI) / 6;
        return <line key={i} x1={78 + Math.sin(a) * 44} y1={95 - Math.cos(a) * 44} x2={78 + Math.sin(a) * 38} y2={95 - Math.cos(a) * 38} stroke="#1d2540" strokeWidth={2.5} />;
      })}
      {wijzer(90, 26, 7)}
      {wijzer(0, 38, 3.5)}
      <circle cx={78} cy={95} r={4} fill="#1d2540" />
      <rect x={148} y={70} width={88} height={50} rx={12} fill={RAND.oranje} />
      <rect x={155} y={77} width={74} height={36} rx={6} fill="#0b0f1a" />
      <text x={192} y={103} textAnchor="middle" fontSize={22} fontWeight={800} fill="#ff5b4a">03:00</text>
    </>
  );
}
