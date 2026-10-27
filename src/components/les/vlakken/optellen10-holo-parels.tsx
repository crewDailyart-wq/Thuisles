"use client";

/**
 * Parels om te splitsen, als hologrammen in Phaser (27 oktober 2026,
 * BOUWEN-PHASER.md; LESSENPLAN.md S1 "Splitsen in delen", Synthesis "Add
 * within 10 · Splitting Sums"). Zelfde props en meldingen als het oude
 * stippenvlak (`optellen-stippen.tsx`, blijft staan), maar dan in Bliepo's
 * ruimte: de stippen zijn parels die zweven, per groepje in twee kolommen,
 * met het getal van het groepje erboven als hologram-getal en plustekens
 * ertussen, zodat de som vanzelf ontstaat.
 *
 * Wat het kind kan doen (alleen als `actief` aan staat):
 * - tikken op een groepje: bij `tik: "breek"` valt het helemaal uit elkaar in
 *   losse parels; bij `tik: "eraf"` springt er één parel af;
 * - een groepje op een ander groepje slepen: ze worden samen één groepje
 *   (het groepje eronder krijgt een warme lichtring);
 * - met `knoppen`: "Alles los" en "Alles samen" (icoonknoppen, `data-knop`
 *   "los" en "samen", zodat Bliepo ze kan aanwijzen).
 *
 * Meldt `{ soort: "verander", groepen }` na elke verandering, en
 * `{ soort: "past" }` zodra de groepjes (in welke volgorde ook) gelijk zijn
 * aan `doel`. Een nieuwe `sleutel` zet de parels terug op `start`.
 * Schrijft niets naar de database.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { Vlakbasis } from "../soort";
import { TEGELKLEUR } from "../tegels";
import { holoBasis, TX, VLAK_B, VLAK_H, WARM, WERELDKLEUR, type PhaserModule } from "../holo/basis";
import { HOLO_CANVAS, useHoloMotor } from "../holo/motor";
import s from "./optellen10-holo.module.css";

export type Parelprops = {
  /** De groepjes waarmee het vlak begint. */
  start: number[];
  /** Verander dit getal om opnieuw bij `start` te beginnen. */
  sleutel: number;
  actief?: boolean;
  tik?: "breek" | "eraf";
  /** Het getal boven elk groepje. */
  getallen?: boolean;
  /** De knoppen "Alles los" en "Alles samen". */
  knoppen?: boolean;
  /** Meldt "past" zodra de groepjes hierop lijken. */
  doel?: number[] | null;
  /** Zoveel parels krijgen een nummer (samen tellen). */
  tel?: number;
  /** Een lijstje sommen linksboven, met een vinkje of kruisje ervoor. */
  lijst?: { som: string; teken?: "goed" | "fout" }[];
};

/** Zijn deze groepjes (in welke volgorde ook) hetzelfde? */
export function zelfdeGroepen(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  const x = [...a].sort((p, q) => p - q);
  const y = [...b].sort((p, q) => p - q);
  return x.every((v, i) => v === y[i]);
}

/* ---------- maten ---------- */

const STAP = 60; // afstand tussen parels
const PLUS = 52; // ruimte voor een plusteken
const ONDER_Y = 500; // onderkant van de groepjes

type Groeplaag = { cx: number; b: number; h: number; top: number; plekken: { x: number; y: number }[] };

/** Waar elk groepje en elke parel staat (in punten van het vlak); `f` = hoe klein, als het niet past. */
function legGroepen(groepen: number[]) {
  const breedte = (n: number) => (n === 1 ? 1 : 2) * STAP;
  const totaal = groepen.reduce((a, n) => a + breedte(n), 0) + Math.max(0, groepen.length - 1) * PLUS;
  const f = Math.min(1, 900 / Math.max(1, totaal));
  let x = VLAK_B / 2 - (totaal * f) / 2;
  const lagen: Groeplaag[] = groepen.map((n) => {
    const b = breedte(n) * f;
    const rijen = n === 1 ? 1 : Math.ceil(n / 2);
    const h = rijen * STAP * f;
    const cx = x + b / 2;
    const plekken = Array.from({ length: n }, (_, j) => {
      const kol = n === 1 ? 0 : j % 2;
      const rij = n === 1 ? 0 : Math.floor(j / 2);
      return { x: n === 1 ? cx : cx + (kol - 0.5) * STAP * f, y: ONDER_Y - (rij + 0.5) * STAP * f };
    });
    x += b + PLUS * f;
    return { cx, b, h, top: ONDER_Y - h, plekken };
  });
  return { lagen, f };
}

/* ---------- de scène ---------- */

type Actie = { t: "start" } | { t: "tik"; i: number; breek: boolean } | { t: "samen"; van: number; naar: number } | { t: "los" } | { t: "alles" };

interface ParelScene {
  toon(groepen: number[], actie: Actie, getallen: boolean, tel: number): void;
  zetActief(aan: boolean): void;
  sleepPunt(): { x: number; y: number } | null;
  /** Het midden van groepje `i`, in pixels van de pagina. */
  groepPunt(i: number): { x: number; y: number } | null;
  /** Wat het kind doet; de React-kant rekent de nieuwe groepjes uit. */
  verbind(opTik: (i: number) => void, opSamen: (van: number, naar: number) => void): void;
}

function maakParelScene(Phaser: PhaserModule, rustig: boolean) {
  const Basis = holoBasis(Phaser, rustig);
  type Img = import("phaser").GameObjects.Image;
  type Ptr = import("phaser").Input.Pointer;

  class Parels extends Basis implements ParelScene {
    opTik: (i: number) => void = () => {};
    opSamen: (van: number, naar: number) => void = () => {};
    actief = false;
    groepIds: number[][] = [];
    parels = new Map<number, Img>();
    nummers = new Map<number, Img>();
    teksten: Img[] = [];
    lagen: Groeplaag[] = [];
    volgendeId = 1;
    sleep: null | { i: number; x0: number; y0: number; bewogen: boolean; doel: number | null } = null;
    ring: Img | null = null;
    groepen: number[] = [];

    constructor() {
      super("optellen10-parels");
    }

    verbind(opTik: (i: number) => void, opSamen: (van: number, naar: number) => void) {
      this.opTik = opTik;
      this.opSamen = opSamen;
    }

    maak() {
      /* Een parel: een lichte bol met een glansje; de kleur van zijn groepje komt erbij als tint. */
      this.canvasPlaatje("parel", 52, 52, (c) => {
        const g = c.createRadialGradient(19, 17, 2, 26, 26, 24);
        g.addColorStop(0, "#ffffff");
        g.addColorStop(0.45, "#eef6ff");
        g.addColorStop(1, "#b8c6dc");
        c.fillStyle = g;
        c.beginPath();
        c.arc(26, 26, 22, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = "rgba(255,255,255,0.95)";
        c.beginPath();
        c.arc(19, 17, 4.5, 0, Math.PI * 2);
        c.fill();
      });
      this.bak("parel", "parel-gloed", 0xffffff);
      for (let i = 1; i <= 20; i++) {
        this.canvasPlaatje(`pnr-${i}`, 40, 40, (c) => {
          c.beginPath();
          c.arc(20, 20, 17, 0, Math.PI * 2);
          c.fillStyle = "rgba(255,255,255,0.97)";
          c.fill();
          c.fillStyle = "#0a1a3a";
          c.font = `800 ${i >= 10 ? 19 : 22}px "Work Sans", system-ui, sans-serif`;
          c.textAlign = "center";
          c.textBaseline = "middle";
          c.fillText(String(i), 20, 21.5);
        });
      }
      /* Hologram-getallen boven de groepjes, en het plusteken. */
      const tekst = (sl: string, t: string, maat: number) =>
        this.canvasPlaatje(sl, 90, 70, (c) => {
          c.fillStyle = "#ffffff";
          c.font = `800 ${maat}px "Work Sans", system-ui, sans-serif`;
          c.textAlign = "center";
          c.textBaseline = "middle";
          c.fillText(t, 45, 37);
        });
      for (let n = 1; n <= 10; n++) {
        tekst(`getal-${n}`, String(n), 50);
        this.bak(`getal-${n}`, `getalg-${n}`, WERELDKLEUR.oceaan);
      }
      tekst("plus", "+", 46);
      this.bak("plus", "plusg", WERELDKLEUR.oceaan);

      this.input.on("pointerdown", (p: Ptr) => this.neer(p));
      this.input.on("pointermove", (p: Ptr) => this.beweeg(p));
      this.input.on("pointerup", (p: Ptr) => this.los(p));
      this.input.on("pointerupoutside", (p: Ptr) => this.los(p));
    }

    zetActief(aan: boolean) {
      this.actief = aan;
    }

    /* ---------- de stand ---------- */

    pasToe(groepen: number[], actie: Actie) {
      const g = this.groepIds.map((x) => [...x]);
      const nieuw = (n: number) => Array.from({ length: n }, () => this.volgendeId++);
      let uit: number[][];
      if (actie.t === "start" || g.length === 0) uit = groepen.map(nieuw);
      else if (actie.t === "tik") {
        const ids = g[actie.i] ?? [];
        const stuk = actie.breek ? ids.map((id) => [id]) : [ids.slice(0, -1), ids.slice(-1)];
        uit = [...g.slice(0, actie.i), ...stuk, ...g.slice(actie.i + 1)];
      } else if (actie.t === "samen") {
        uit = g.map((x) => [...x]);
        uit[actie.naar] = [...uit[actie.naar], ...uit[actie.van]];
        uit.splice(actie.van, 1);
      } else if (actie.t === "los") uit = g.flat().map((id) => [id]);
      else uit = [g.flat()];
      /* Klopt het niet meer met wat de les zegt: opnieuw beginnen. */
      if (uit.length !== groepen.length || uit.some((x, i) => x.length !== groepen[i])) return { ids: groepen.map(nieuw), opnieuw: true };
      return { ids: uit, opnieuw: actie.t === "start" };
    }

    toon(groepen: number[], actie: Actie, getallen: boolean, tel: number) {
      this.groepen = groepen;
      const { ids, opnieuw } = this.pasToe(groepen, actie);
      if (opnieuw) {
        this.parels.forEach((p) => p.destroy());
        this.parels.clear();
      }
      this.groepIds = ids;
      const { lagen, f } = legGroepen(groepen);
      this.lagen = lagen;
      const levend = new Set(ids.flat());
      for (const [id, p] of this.parels) {
        if (!levend.has(id)) {
          p.destroy();
          this.parels.delete(id);
        }
      }
      const nieuweParels: Img[] = [];
      let teller = 0;
      this.nummers.forEach((n) => n.destroy());
      this.nummers.clear();
      ids.forEach((groep, gi) => {
        const kleur = Phaser.Display.Color.HexStringToColor(TEGELKLEUR[groep.length] ?? "#3bbfe6").color;
        groep.forEach((id, j) => {
          const plek = lagen[gi].plekken[j];
          let p = this.parels.get(id);
          if (!p) {
            p = this.plaats("parel-gloed", plek.x, plek.y).setDepth(2);
            this.parels.set(id, p);
            nieuweParels.push(p);
          } else {
            this.tweens.killTweensOf(p);
            this.tweens.add({ targets: p, x: plek.x, y: plek.y, duration: this.rustig ? 1 : 280, ease: "Cubic.easeOut" });
          }
          p.setScale((f * 1.04) / TX).setTint(kleur);
          teller++;
          if (tel >= teller && teller <= 20) {
            const nr = this.plaats(`pnr-${teller}`, plek.x, plek.y).setDepth(3).setScale((f * 0.95) / TX);
            this.nummers.set(id, nr);
          }
        });
      });
      /* Nieuwe parels: één lichtstraal voor de hele groep (niet één per parel). */
      if (nieuweParels.length > 0 && !this.rustig) {
        const mx = nieuweParels.reduce((s, p) => s + p.x, 0) / nieuweParels.length;
        const my = nieuweParels.reduce((s, p) => s + p.y, 0) / nieuweParels.length;
        /* De straal en de flits (een onzichtbaar puntje als doel), de parels groeien erin mee. */
        const punt = this.plaats("holo-ring", mx, my).setScale(0);
        this.tover(punt);
        this.time.delayedCall(900, () => punt.destroy());
        for (const p of nieuweParels) {
          const sc = p.scaleX;
          p.setAlpha(0).setScale(sc * 0.5);
          this.tweens.add({ targets: p, alpha: 1, scale: sc, delay: 110, duration: 240, ease: "Back.easeOut" });
        }
      }
      /* Getallen en plustekens: de som ontstaat vanzelf. */
      this.teksten.forEach((t) => t.destroy());
      this.teksten = [];
      lagen.forEach((laag, gi) => {
        const n = groepen[gi];
        if (getallen && n <= 10) {
          const kleur = Phaser.Display.Color.HexStringToColor(TEGELKLEUR[n] ?? "#ffffff").color;
          this.teksten.push(this.plaats(`getalg-${n}`, laag.cx, laag.top - 36 * f).setTint(kleur).setScale(Math.max(0.7, f) / TX).setDepth(2));
        }
        if (gi > 0) this.teksten.push(this.plaats("plusg", laag.cx - laag.b / 2 - (PLUS * f) / 2, ONDER_Y - STAP * f * 0.5).setScale(Math.max(0.7, f) / TX).setDepth(1));
      });
    }

    /* ---------- tikken en slepen ---------- */

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


    groepOp(x: number, y: number, behalve = -1): number | null {
      const r = 18;
      const i = this.lagen.findIndex((l, gi) => gi !== behalve && x >= l.cx - l.b / 2 - r && x <= l.cx + l.b / 2 + r && y >= l.top - r && y <= ONDER_Y + r);
      return i >= 0 ? i : null;
    }

    neer(p: Ptr) {
      const w = this.waar(p);
      const i = this.groepOp(w.x, w.y);
      if (i === null) return;
      this.sleep = { i, x0: w.x, y0: w.y, bewogen: false, doel: null };
    }

    verschuif(i: number, dx: number, dy: number) {
      const laag = this.lagen[i];
      this.groepIds[i]?.forEach((id, j) => {
        const plek = laag.plekken[j];
        const x = plek.x + dx;
        const y = plek.y + dy;
        this.parels.get(id)?.setPosition(x, y);
        this.nummers.get(id)?.setPosition(x, y);
      });
    }

    beweeg(p: Ptr) {
      const w = this.waar(p);
      const sl = this.sleep;
      if (!sl) return;
      const dx = w.x - sl.x0;
      const dy = w.y - sl.y0;
      if (!sl.bewogen && Math.hypot(dx, dy) < 10) return;
      sl.bewogen = true;
      this.verschuif(sl.i, dx, dy);
      const doel = this.groepOp(w.x, w.y, sl.i);
      if (doel !== sl.doel) {
        sl.doel = doel;
        this.ring?.destroy();
        this.ring = null;
        if (doel !== null && this.actief) {
          const l = this.lagen[doel];
          this.ring = this.selectieRing(l.cx, l.top + l.h / 2, Math.max(l.b, l.h) / 2 + 16, WARM).setDepth(1);
        }
      }
    }

    los(p: Ptr) {
      const w = this.waar(p);
      const sl = this.sleep;
      if (!sl) return;
      this.sleep = null;
      this.ring?.destroy();
      this.ring = null;
      if (!sl.bewogen) {
        if (this.actief) this.opTik(sl.i);
        return;
      }
      const doel = this.groepOp(w.x, w.y, sl.i);
      if (doel !== null && this.actief) {
        this.opSamen(sl.i, doel);
        return;
      }
      /* Nergens op: het groepje zweeft terug. */
      const laag = this.lagen[sl.i];
      this.groepIds[sl.i]?.forEach((id, j) => {
        const plek = laag.plekken[j];
        const doelen = [this.parels.get(id), this.nummers.get(id)].filter(Boolean);
        this.tweens.add({ targets: doelen, x: plek.x, y: plek.y, duration: this.rustig ? 1 : 260, ease: "Cubic.easeOut" });
      });
    }

    groepPunt(i: number) {
      const r = this.game.canvas.getBoundingClientRect();
      const f = r.width / VLAK_B;
      const l = this.lagen[i];
      return l ? { x: r.left + l.cx * f, y: r.top + (l.top + l.h / 2) * f } : null;
    }

    sleepPunt() {
      const r = this.game.canvas.getBoundingClientRect();
      const f = r.width / VLAK_B;
      const laag = this.lagen[0];
      if (!laag) return null;
      const id = this.groepIds[0]?.[0];
      const p = id !== undefined ? this.parels.get(id) : undefined;
      /* Tijdens het slepen: het punt waar de vinger het groepje vastpakte (dat volgt de vinger precies). */
      const sl = this.sleep;
      if (sl?.bewogen) {
        const sid = this.groepIds[sl.i]?.[0];
        const sp = sid !== undefined ? this.parels.get(sid) : undefined;
        const splek = this.lagen[sl.i]?.plekken[0];
        if (sp && splek) return { x: r.left + (sl.x0 + sp.x - splek.x) * f, y: r.top + (sl.y0 + sp.y - splek.y) * f };
      }
      const plek = laag.plekken[0];
      if (p) return { x: r.left + p.x * f, y: r.top + p.y * f };
      return { x: r.left + plek.x * f, y: r.top + plek.y * f };
    }

    demo(ms: number) {
      const eind = performance.now() + ms;
      const stap = () => {
        if (performance.now() > eind || this.groepen.length === 0) return;
        const g = this.groepen;
        const losse = g.every((n) => n === 1);
        const nieuw = losse ? [g.length] : g.flatMap((n) => Array<number>(n).fill(1));
        this.toon(nieuw, losse ? { t: "alles" } : { t: "los" }, true, 0);
        this.time.delayedCall(300, () => this.golf(VLAK_B / 2, ONDER_Y - 80));
        this.time.delayedCall(700, stap);
      };
      stap();
    }
  }
  return Parels as unknown as new () => import("phaser").Scene;
}

/* ---------- iconen ---------- */

function IkoonLos() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      {[
        [5, 6],
        [19, 6],
        [12, 12],
        [5, 18],
        [19, 18],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="2.6" fill="currentColor" />
      ))}
    </svg>
  );
}

function IkoonSamen() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" strokeWidth="2" />
      {[
        [9, 9],
        [15, 9],
        [12, 12.5],
        [9, 16],
        [15, 16],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="2.1" fill="currentColor" />
      ))}
    </svg>
  );
}

export function Teken({ soort }: { soort: "goed" | "fout" }) {
  return soort === "goed" ? (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#8ff0c0" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M7 7l10 10M17 7L7 17" fill="none" stroke="#ff9eab" strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  );
}

/* ---------- het vlak ---------- */

export function HoloParels(props: Parelprops & Vlakbasis) {
  const { schaal } = props;
  const { plek, scene } = useHoloMotor<ParelScene>(schaal, maakParelScene, { invoer: true });
  return (
    <div className={s.vlak}>
      <div ref={plek} style={{ ...HOLO_CANVAS, touchAction: "none" }} aria-hidden />
      <Parelstand key={props.sleutel} {...props} scene={scene} />
    </div>
  );
}

function Parelstand({
  start,
  actief = false,
  tik = "breek",
  getallen = true,
  knoppen = false,
  doel = null,
  tel = 0,
  lijst = [],
  meld,
  scene,
}: Parelprops & Vlakbasis & { scene: ParelScene | null }) {
  const [groepen, setGroepen] = useState<number[]>(start);
  const [actie, setActie] = useState<Actie>({ t: "start" });
  const groepenRef = useRef(groepen);

  const verander = useCallback(
    (nieuw: number[], a: Actie) => {
      groepenRef.current = nieuw;
      setGroepen(nieuw);
      setActie(a);
      meld({ soort: "verander", groepen: nieuw });
    },
    [meld],
  );

  /* De scène tekent wat er nu is. */
  useEffect(() => {
    scene?.toon(groepen, actie, getallen, tel);
  }, [scene, groepen, actie, getallen, tel]);

  useEffect(() => {
    scene?.zetActief(actief);
  }, [scene, actief]);

  /* Wat het kind in de scène doet. */
  useEffect(() => {
    if (!scene) return;
    scene.verbind(
      (i) => {
      const g = groepenRef.current;
      const n = g[i];
      if (n === undefined || n < 2) return;
      if (tik === "breek") verander([...g.slice(0, i), ...Array<number>(n).fill(1), ...g.slice(i + 1)], { t: "tik", i, breek: true });
      else verander([...g.slice(0, i), n - 1, 1, ...g.slice(i + 1)], { t: "tik", i, breek: false });
      },
      (van, naar) => {
        const g = groepenRef.current;
        const nieuw = [...g];
        nieuw[naar] = g[naar] + g[van];
        nieuw.splice(van, 1);
        verander(nieuw, { t: "samen", van, naar });
      },
    );
    window.__phaser = { ...window.__phaser, sleepPunt: () => scene.sleepPunt() as { x: number; y: number } };
  }, [scene, tik, verander]);

  /* Voor de automatische test: de groepjes, en waar ze staan. */
  useEffect(() => {
    if (!scene) return;
    window.__phaser = { ...window.__phaser, parelstand: { groepen, doel, actief, knoppen }, groepPunt: (i: number) => scene.groepPunt(i) };
  }, [scene, groepen, doel, actief, knoppen]);

  /* Zodra de groepjes bij het doel passen, ook als het doel net is gezet. */
  useEffect(() => {
    if (doel && zelfdeGroepen(groepen, doel)) meld({ soort: "past" });
  }, [doel, groepen, meld]);

  const totaal = groepen.reduce((a, b) => a + b, 0);

  return (
    <>
      {lijst.length > 0 && (
        <div className={s.lijst} aria-hidden>
          {lijst.map((r, i) => (
            <div key={i}>
              <span className={s.teken}>{r.teken ? <Teken soort={r.teken} /> : null}</span>
              {r.som}
            </div>
          ))}
        </div>
      )}
      {knoppen && (
        <>
          <button
            type="button"
            className={s.knop}
            data-knop="los"
            aria-label="Alles los"
            style={{ left: VLAK_B / 2 - 92, top: 590 }}
            disabled={!actief || groepen.every((n) => n === 1)}
            onClick={() => verander(Array<number>(totaal).fill(1), { t: "los" })}
          >
            <IkoonLos />
            <span className={s.knopwoord}>Alles los</span>
          </button>
          <button
            type="button"
            className={s.knop}
            data-knop="samen"
            aria-label="Alles samen"
            style={{ left: VLAK_B / 2 + 14, top: 590 }}
            disabled={!actief || groepen.length === 1}
            onClick={() => verander([totaal], { t: "alles" })}
          >
            <IkoonSamen />
            <span className={s.knopwoord}>Alles samen</span>
          </button>
        </>
      )}
    </>
  );
}
