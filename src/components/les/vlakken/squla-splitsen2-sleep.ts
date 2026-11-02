/**
 * Zelf slepen van tegels, sommen en een ster naar vakken (2 november 2026,
 * opdracht Sara: "het kind moet ACTIEF slepen of dingen DOEN"). Eigen laag
 * voor de lessen Splitsen 2 en Delen (voorvoegsel s2), naast het slepen van
 * de knikkers in squla-splitsen-vlak.tsx.
 *
 * - stukken: glanzende tegels (een getal of een som) of een ster, in glansstijl B
 *   (zacht verloop, lichtvlekje, dunne rand, zachte gloed);
 * - doelen: zachte, half doorzichtige vakken met ronde hoeken (geen harde rand);
 * - leven: stukken wiebelen en glinsteren zacht, oppakken geeft een schaduw en
 *   iets groter, neerleggen een stuiter, goed een hupje met vonkjes, fout schudt;
 * - geluiden (speelLesgeluid, klanken uit code): s2Pak, s2Leg (per stuk hoger),
 *   s2Terug, s2Vonk;
 * - tikken werkt ook: een los stuk gaat naar het eerste vrije vak, een stuk in
 *   een vak gaat terug.
 *
 * Alleen tekenen en slepen; de les bepaalt wat goed is.
 */

import { TX, VLAK_B, VLAK_H, GOED } from "../holo/basis";
import { speelLesgeluid } from "@/lib/lesgeluiden";

type Img = import("phaser").GameObjects.Image;
type Box = import("phaser").GameObjects.Container;
type Ptr = import("phaser").Input.Pointer;

export type S2Segment = { t: string; k?: string };
export type S2Stuk = {
  id: string;
  /** Hex van de tegel (of de ster). */
  kleur: string;
  vorm?: "tegel" | "ster";
  segm?: S2Segment[];
  x: number;
  y: number;
  /** Lettergrootte van de tegel. */
  grootte?: number;
  /** Alleen voor de automatische test: hier hoort dit stuk ("*" = elk vrij vak). Een stuk zonder doel is fout. */
  doel?: string;
};
export type S2Doel = { id: string; x: number; y: number; b: number; h: number; label?: string; snap?: { x: number; y: number } };
export type S2 = { nr: number; stukken: S2Stuk[]; doelen: S2Doel[]; vast?: [string, string][] };
export type S2Leg = { soort: "s2"; leg: [string, string][] };

export interface S2Scene {
  add: import("phaser").Scene["add"];
  tweens: import("phaser").Scene["tweens"];
  time: import("phaser").Scene["time"];
  input: import("phaser").Scene["input"];
  game: import("phaser").Scene["game"];
  rustig: boolean;
  canvasPlaatje(sleutel: string, b: number, h: number, teken: (c: CanvasRenderingContext2D) => void): void;
  plaats(sl: string, x: number, y: number): Img;
  golf(x: number, y: number, kleur?: number): void;
  schud(doel: import("phaser").GameObjects.Components.Transform & import("phaser").GameObjects.Components.AlphaSingle): void;
}

const PAD = 14;
const LETTER = '"Baloo 2", system-ui, -apple-system, sans-serif';

function rgb(hex: string, f: number) {
  const n = parseInt(hex.slice(1), 16);
  const k = (v: number) => Math.max(0, Math.min(255, Math.round(f >= 1 ? v + (255 - v) * (f - 1) : v * f)));
  return `rgb(${k((n >> 16) & 255)},${k((n >> 8) & 255)},${k(n & 255)})`;
}

let meet: CanvasRenderingContext2D | null = null;
function breedte(t: string, fs: number) {
  meet ??= document.createElement("canvas").getContext("2d")!;
  meet.font = `800 ${fs}px ${LETTER}`;
  return meet.measureText(t).width;
}

/** De maat (punten) van een stuk. */
export function s2Maat(s: S2Stuk) {
  if (s.vorm === "ster") return { b: 84, h: 84 };
  const fs = s.grootte ?? 46;
  const w = (s.segm ?? []).reduce((a, g) => a + breedte(g.t, fs), 0);
  return { b: Math.round(Math.max(fs * 2.2, w + fs * 1.1)), h: Math.round(fs * 1.9) };
}

type Stuk = { spec: S2Stuk; im: Img; schaduw: Img; thuis: { x: number; y: number }; doel: string | null; vast: boolean; b: number; h: number };
type Doel = { spec: S2Doel; basis: Img; hover: Img; label: Img | null; stuk: number };

export class S2Laag {
  private sc: S2Scene;
  private waar: (p: Ptr) => { x: number; y: number };
  private melder: () => (g: S2Leg) => void;
  private spec: S2 | null = null;
  private actief = false;
  private box: Box | null = null;
  private laagDoel: Box | null = null;
  private laagStuk: Box | null = null;
  private laagSleep: Box | null = null;
  private stukken: Stuk[] = [];
  private doelen: Doel[] = [];
  private druk: { i: number; x0: number; y0: number; dx: number; dy: number; sleept: boolean } | null = null;
  private glinster: import("phaser").Time.TimerEvent | null = null;

  constructor(sc: S2Scene, waar: (p: Ptr) => { x: number; y: number }, melder: () => (g: S2Leg) => void) {
    this.sc = sc;
    this.waar = waar;
    this.melder = melder;
  }

  get aan() {
    return this.spec !== null;
  }

  /* ---------- plaatjes (één keer getekend) ---------- */

  private stukTex(s: S2Stuk, b: number, h: number) {
    const sleutel = `s2-st-${s.vorm ?? "tegel"}-${s.kleur}-${b}x${h}-${(s.segm ?? []).map((g) => g.t + (g.k ?? "")).join("|")}-${s.grootte ?? 0}`;
    this.sc.canvasPlaatje(sleutel, b + PAD * 2, h + PAD * 2, (c) => {
      c.translate(PAD, PAD);
      const r = Math.min(h * 0.32, 26);
      /* zachte gloed in de eigen kleur */
      c.save();
      c.shadowColor = rgb(s.kleur, 1.15);
      c.shadowBlur = 12;
      c.fillStyle = rgb(s.kleur, 0.9);
      if (s.vorm === "ster") ster(c, b / 2, h / 2 + 2, b * 0.5, b * 0.22);
      else {
        c.beginPath();
        c.roundRect(0, 0, b, h, r);
      }
      c.fill();
      c.restore();
      /* zacht verloop: licht linksboven, donkerder rechtsonder */
      const g = c.createLinearGradient(0, 0, b, h);
      g.addColorStop(0, rgb(s.kleur, 1.45));
      g.addColorStop(0.55, rgb(s.kleur, 1));
      g.addColorStop(1, rgb(s.kleur, 0.72));
      c.fillStyle = g;
      if (s.vorm === "ster") ster(c, b / 2, h / 2 + 2, b * 0.5, b * 0.22);
      else {
        c.beginPath();
        c.roundRect(0, 0, b, h, r);
      }
      c.fill();
      /* dunne rand in een donkere tint van de eigen kleur */
      c.lineWidth = 2.5;
      c.strokeStyle = rgb(s.kleur, 0.5);
      c.stroke();
      /* glimmend lichtvlak en lichtvlekje */
      if (s.vorm !== "ster") {
        const hl = c.createLinearGradient(0, 4, 0, h * 0.5);
        hl.addColorStop(0, "rgba(255,255,255,0.6)");
        hl.addColorStop(1, "rgba(255,255,255,0)");
        c.fillStyle = hl;
        c.beginPath();
        c.roundRect(7, 5, b - 14, h * 0.42, r * 0.8);
        c.fill();
      }
      c.fillStyle = "rgba(255,255,255,0.9)";
      c.beginPath();
      c.ellipse(Math.min(b * 0.12, 18), h * 0.2, 7, 4, -0.5, 0, Math.PI * 2);
      c.fill();
      /* de tekst: wit (of in zijn eigen kleur) met een donkere rand */
      if (s.vorm !== "ster") {
        const fs = s.grootte ?? 46;
        c.font = `800 ${fs}px ${LETTER}`;
        c.textBaseline = "middle";
        c.lineJoin = "round";
        c.lineWidth = Math.max(6, fs * 0.16);
        c.strokeStyle = "#14204a";
        let x = (b - (s.segm ?? []).reduce((a, q) => a + breedte(q.t, fs), 0)) / 2;
        for (const q of s.segm ?? []) {
          c.strokeText(q.t, x, h / 2 + fs * 0.06);
          c.fillStyle = q.k ?? "#ffffff";
          c.fillText(q.t, x, h / 2 + fs * 0.06);
          x += breedte(q.t, fs);
        }
      }
    });
    return sleutel;
  }

  private basisPlaatjes() {
    this.sc.canvasPlaatje("s2-schaduw", 140, 60, (c) => {
      const g = c.createRadialGradient(70, 30, 2, 70, 30, 66);
      g.addColorStop(0, "rgba(5,10,40,0.55)");
      g.addColorStop(1, "rgba(5,10,40,0)");
      c.save();
      c.scale(1, 0.45);
      c.fillStyle = g;
      c.beginPath();
      c.arc(70, 66, 66, 0, Math.PI * 2);
      c.fill();
      c.restore();
    });
    this.sc.canvasPlaatje("s2-vonk", 40, 40, (c) => {
      const g = c.createRadialGradient(20, 20, 0, 20, 20, 18);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(0.35, "rgba(255,240,170,0.9)");
      g.addColorStop(1, "rgba(255,230,140,0)");
      c.fillStyle = g;
      c.fillRect(0, 0, 40, 40);
      c.fillStyle = "rgba(255,255,255,0.95)";
      c.beginPath();
      c.moveTo(20, 1);
      c.quadraticCurveTo(22, 18, 39, 20);
      c.quadraticCurveTo(22, 22, 20, 39);
      c.quadraticCurveTo(18, 22, 1, 20);
      c.quadraticCurveTo(18, 18, 20, 1);
      c.fill();
    });
  }

  private doelTex(b: number, h: number, warm: boolean) {
    const sleutel = `s2-doel-${b}x${h}-${warm ? "w" : "z"}`;
    this.sc.canvasPlaatje(sleutel, b + 24, h + 24, (c) => {
      const r = Math.min(h * 0.38, 40);
      c.fillStyle = warm ? "rgba(255,214,120,0.16)" : "rgba(188,216,255,0.07)";
      c.beginPath();
      c.roundRect(0, 0, b + 24, h + 24, r + 8);
      c.fill();
      c.fillStyle = warm ? "rgba(255,226,150,0.34)" : "rgba(207,227,255,0.15)";
      c.beginPath();
      c.roundRect(12, 12, b, h, r);
      c.fill();
    });
    return sleutel;
  }

  private labelTex(t: string) {
    const sleutel = `s2-label-${t}`;
    this.sc.canvasPlaatje(sleutel, 90, 90, (c) => {
      c.font = `800 64px ${LETTER}`;
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.lineJoin = "round";
      c.lineWidth = 8;
      c.strokeStyle = "rgba(20,32,74,0.6)";
      c.strokeText(t, 45, 48);
      c.fillStyle = "rgba(255,255,255,0.75)";
      c.fillText(t, 45, 48);
    });
    return sleutel;
  }

  /* ---------- bouwen en weghalen ---------- */

  zet(spec: S2 | null, actief: boolean) {
    this.actief = actief;
    if (!spec) {
      if (this.spec) this.weg();
      return;
    }
    if (!this.spec || this.spec.nr !== spec.nr) {
      this.weg();
      this.bouw(spec);
    } else {
      this.spec = spec;
      this.past(spec);
    }
    this.druk = null;
  }

  private weg() {
    const box = this.box;
    this.box = null;
    this.spec = null;
    this.druk = null;
    this.stukken = [];
    this.doelen = [];
    this.glinster?.remove();
    this.glinster = null;
    this.sc.input.setDefaultCursor("default");
    this.wis();
    if (!box) return;
    if (this.sc.rustig) box.destroy();
    else this.sc.tweens.add({ targets: box, alpha: 0, duration: 140, onComplete: () => box.destroy() });
  }

  private wis() {
    if (typeof window === "undefined" || !window.__phaser) return;
    const w = { ...window.__phaser };
    delete w.s2Stap;
    delete w.s2Punt;
    window.__phaser = w;
  }

  private bouw(spec: S2) {
    this.spec = spec;
    this.basisPlaatjes();
    const box = this.sc.add.container(0, 0);
    const laagDoel = this.sc.add.container(0, 0);
    const laagStuk = this.sc.add.container(0, 0);
    const laagSleep = this.sc.add.container(0, 0);
    box.add([laagDoel, laagStuk, laagSleep]);
    this.box = box;
    this.laagDoel = laagDoel;
    this.laagStuk = laagStuk;
    this.laagSleep = laagSleep;
    const rustig = this.sc.rustig;

    this.doelen = spec.doelen.map((d) => {
      const basis = this.sc.plaats(this.doelTex(d.b, d.h, false), d.x, d.y);
      const hover = this.sc.plaats(this.doelTex(d.b, d.h, true), d.x, d.y).setAlpha(0);
      const label = d.label ? this.sc.plaats(this.labelTex(d.label), d.snap?.x ?? d.x, d.snap?.y ?? d.y) : null;
      laagDoel.add([basis, hover]);
      if (label) laagDoel.add(label);
      return { spec: d, basis, hover, label, stuk: -1 };
    });

    this.stukken = spec.stukken.map((s, i) => {
      const { b, h } = s2Maat(s);
      const im = this.sc.plaats(this.stukTex(s, b, h), s.x, s.y);
      const schaduw = this.sc.plaats("s2-schaduw", s.x, s.y).setAlpha(0);
      laagStuk.add(im);
      laagSleep.add(schaduw);
      const st: Stuk = { spec: s, im, schaduw, thuis: { x: s.x, y: s.y }, doel: null, vast: false, b, h };
      if (!rustig) {
        im.setAlpha(0).setScale(0.2 / TX);
        this.sc.tweens.add({ targets: im, alpha: 1, scale: 1 / TX, delay: 60 + i * 80, duration: 300, ease: "Back.easeOut", onComplete: () => this.wiebel(st, i) });
      }
      return st;
    });
    if (!rustig) {
      box.setAlpha(0);
      this.sc.tweens.add({ targets: box, alpha: 1, duration: 240 });
      /* af en toe glinstert er een stukje */
      this.glinster = this.sc.time.addEvent({ delay: 1400, loop: true, callback: () => this.glinsterNu() });
    }
    this.past(spec);

    window.__phaser = {
      ...window.__phaser,
      /* Voor de automatische test: de eerstvolgende sleep ("goed", "fout"), in pixels van de pagina. */
      s2Stap: (soort: string) => this.testStap(soort),
      s2Punt: () => {
        const q = this.stukken.find((x) => !x.doel) ?? this.stukken[0];
        return q ? this.scherm(q.im.x, q.im.y) : null;
      },
      sleepPunt: () => {
        const q = this.stukken.find((x) => !x.doel) ?? this.stukken[0];
        return q ? this.scherm(q.im.x, q.im.y) : { x: 0, y: 0 };
      },
    };
  }

  /** De vaste plekken (goed beantwoord) bijwerken zonder opnieuw te beginnen. */
  private past(spec: S2) {
    for (const [sid, did] of spec.vast ?? []) {
      const i = this.stukken.findIndex((q) => q.spec.id === sid);
      const dj = this.doelen.findIndex((q) => q.spec.id === did);
      if (i < 0 || dj < 0) continue;
      const st = this.stukken[i];
      if (st.vast) continue;
      this.plaatsIn(i, dj, true);
      st.vast = true;
      this.doelen[dj].basis.setTint(GOED);
    }
  }

  /* ---------- leven: wiebelen en glinsteren ---------- */

  private wiebel(st: Stuk, i: number) {
    if (this.sc.rustig || st.doel || st.vast || !st.im.active) return;
    this.sc.tweens.add({ targets: st.im, angle: { from: -2.2, to: 2.2 }, duration: 1100 + (i % 3) * 170, yoyo: true, repeat: -1, ease: "Sine.easeInOut", delay: i * 90 });
    this.sc.tweens.add({ targets: st.im, y: { from: st.thuis.y - 3, to: st.thuis.y + 3 }, duration: 1500 + (i % 4) * 130, yoyo: true, repeat: -1, ease: "Sine.easeInOut", delay: i * 130 });
  }

  private glinsterNu() {
    const lijst = this.stukken.filter((q) => q.im.active && (!q.doel || q.vast || true));
    if (!lijst.length || !this.laagSleep) return;
    const q = lijst[Math.floor(Math.random() * lijst.length)];
    this.vonk(q.im.x - q.b * 0.28, q.im.y - q.h * 0.26, 0.9);
  }

  /** Eén glinstering die groeit en weer verdwijnt. */
  private vonk(x: number, y: number, maat: number) {
    if (!this.laagSleep) return;
    const v = this.sc.plaats("s2-vonk", x, y).setScale(0.1 / TX).setAlpha(0.95);
    this.laagSleep.add(v);
    this.sc.tweens.add({ targets: v, scale: (maat * 1) / TX, angle: 90, duration: 260, yoyo: true, ease: "Sine.easeOut", onComplete: () => v.destroy() });
  }

  /** Vonkjes die uit een stuk vliegen (goed). */
  private vonken(x: number, y: number, aantal: number) {
    if (!this.laagSleep || this.sc.rustig) return;
    for (let i = 0; i < aantal; i++) {
      const hoek = (i / aantal) * Math.PI * 2 + 0.3;
      const v = this.sc.plaats("s2-vonk", x, y).setScale(0.5 / TX);
      this.laagSleep.add(v);
      this.sc.tweens.add({ targets: v, x: x + Math.cos(hoek) * 70, y: y + Math.sin(hoek) * 55 - 10, alpha: 0, scale: 0.15 / TX, duration: 560, ease: "Cubic.easeOut", onComplete: () => v.destroy() });
    }
  }

  /* ---------- plaatsen ---------- */

  private snap(d: Doel) {
    return d.spec.snap ?? { x: d.spec.x, y: d.spec.y };
  }

  /** Stuk `i` in vak `j` leggen (of terug naar huis bij -1). */
  private plaatsIn(i: number, j: number, direct = false) {
    const st = this.stukken[i];
    this.doelen.forEach((d) => {
      if (d.stuk === i) {
        d.stuk = -1;
        d.label?.setVisible(true);
      }
    });
    this.sc.tweens.killTweensOf(st.im);
    st.im.setAngle(0).setAlpha(1);
    this.laagStuk?.add(st.im);
    st.schaduw.setAlpha(0);
    if (j < 0) {
      st.doel = null;
      const dur = direct || this.sc.rustig ? 1 : 210;
      this.sc.tweens.add({ targets: st.im, x: st.thuis.x, y: st.thuis.y, scale: 1 / TX, duration: dur, ease: "Cubic.easeOut", onComplete: () => this.wiebel(st, i) });
      return;
    }
    const d = this.doelen[j];
    const p = this.snap(d);
    st.doel = d.spec.id;
    d.stuk = i;
    d.label?.setVisible(false);
    if (direct || this.sc.rustig) {
      st.im.setPosition(p.x, p.y).setScale(1 / TX);
      return;
    }
    /* Neerleggen met een stuiter: iets te groot, dan een tikje kleiner, dan goed. */
    this.sc.tweens.add({ targets: st.im, x: p.x, y: p.y, scale: 1.12 / TX, duration: 130, ease: "Cubic.easeOut", onComplete: () => this.sc.tweens.add({ targets: st.im, scale: { from: 0.94 / TX, to: 1 / TX }, duration: 190, ease: "Back.easeOut" }) });
  }

  private meldStand() {
    const leg: [string, string][] = this.stukken.filter((q) => q.doel).map((q) => [q.spec.id, q.doel as string]);
    this.melder()({ soort: "s2", leg });
  }

  private aantalGelegd() {
    return this.stukken.filter((q) => q.doel).length;
  }

  /** In welk vak ligt dit punt (het dichtstbijzijnde, ook net ernaast)? */
  private vakBij(x: number, y: number): number {
    let best = -1;
    let bd = 1e9;
    this.doelen.forEach((d, j) => {
      const inb = Math.abs(x - d.spec.x) <= d.spec.b / 2 + 26 && Math.abs(y - d.spec.y) <= d.spec.h / 2 + 26;
      const afst = Math.hypot(x - d.spec.x, y - d.spec.y);
      const dichtbij = afst <= Math.max(d.spec.b, d.spec.h) / 2 + 50;
      if ((inb || dichtbij) && afst < bd) {
        bd = afst;
        best = j;
      }
    });
    return best;
  }

  /** Stuk `i` in vak `j` leggen; ligt er al iets, dan gaat dat terug naar huis. */
  private leg(i: number, j: number) {
    const d = this.doelen[j];
    if (d.stuk >= 0 && d.stuk !== i) {
      const q = this.stukken[d.stuk];
      if (q.vast) {
        this.plaatsIn(i, -1);
        speelLesgeluid("s2Terug");
        return;
      }
      this.plaatsIn(d.stuk, -1);
    }
    this.plaatsIn(i, j);
    speelLesgeluid("s2Leg", Math.max(0, this.aantalGelegd() - 1));
    this.vonk(this.snap(d).x - this.stukken[i].b * 0.28, this.snap(d).y - this.stukken[i].h * 0.26, 0.8);
  }

  /* ---------- muis en vinger ---------- */

  private raak(x: number, y: number) {
    let best = -1;
    let bd = 1e9;
    this.stukken.forEach((q, i) => {
      if (q.vast) return;
      const dx = Math.abs(q.im.x - x);
      const dy = Math.abs(q.im.y - y);
      if (dx <= q.b / 2 + 8 && dy <= q.h / 2 + 8) {
        const d = Math.hypot(dx, dy);
        if (d < bd) {
          bd = d;
          best = i;
        }
      }
    });
    return best;
  }

  neer(p: Ptr): boolean {
    if (!this.spec || !this.actief) return false;
    const w = this.waar(p);
    const i = this.raak(w.x, w.y);
    if (i < 0) return false;
    const im = this.stukken[i].im;
    this.druk = { i, x0: w.x, y0: w.y, dx: im.x - w.x, dy: im.y - w.y, sleept: false };
    return true;
  }

  beweeg(p: Ptr): boolean {
    if (!this.spec) return false;
    const w = this.waar(p);
    const d = this.druk;
    if (!d) {
      if (!p.isDown) this.sc.input.setDefaultCursor(this.actief && this.raak(w.x, w.y) >= 0 ? "grab" : "default");
      return false;
    }
    const st = this.stukken[d.i];
    if (!d.sleept && Math.hypot(w.x - d.x0, w.y - d.y0) > 8) {
      /* Pakken: het stuk wordt iets groter en krijgt een schaduw. */
      d.sleept = true;
      this.sc.input.setDefaultCursor("grabbing");
      const was = st.doel;
      this.sc.tweens.killTweensOf(st.im);
      st.im.setAngle(0);
      this.laagSleep?.add(st.im);
      this.doelen.forEach((q) => {
        if (q.stuk === d.i) {
          q.stuk = -1;
          q.label?.setVisible(true);
        }
      });
      st.doel = null;
      if (this.sc.rustig) st.im.setScale(1.1 / TX);
      else this.sc.tweens.add({ targets: st.im, scale: 1.14 / TX, duration: 110, ease: "Back.easeOut" });
      st.schaduw.setAlpha(0.7).setPosition(st.im.x + 7, st.im.y + st.h * 0.5 + 6);
      this.laagSleep?.bringToTop(st.im);
      speelLesgeluid("s2Pak");
      if (was) this.meldStand();
    }
    if (d.sleept) {
      const x = w.x + d.dx;
      const y = w.y + d.dy;
      st.im.setPosition(x, y);
      st.schaduw.setPosition(x + 7, y + st.h * 0.5 + 6);
      const j = this.vakBij(x, y);
      this.doelen.forEach((q, k) => q.hover.setAlpha(k === j ? 1 : 0));
    }
    return true;
  }

  los(p: Ptr): boolean {
    const d = this.druk;
    this.druk = null;
    this.sc.input.setDefaultCursor("default");
    this.doelen.forEach((q) => q.hover.setAlpha(0));
    if (!d || !this.spec) return false;
    const st = this.stukken[d.i];
    if (!d.sleept) {
      /* Tikken werkt ook: los = naar het eerste vrije vak, in een vak = terug. */
      if (!this.actief) return true;
      if (st.doel) {
        this.plaatsIn(d.i, -1);
        speelLesgeluid("s2Terug");
      } else {
        const j = this.doelen.findIndex((q) => q.stuk < 0);
        if (j >= 0) this.leg(d.i, j);
      }
      this.meldStand();
      return true;
    }
    st.schaduw.setAlpha(0);
    const w = this.waar(p);
    const j = this.vakBij(w.x + d.dx, w.y + d.dy);
    if (j >= 0) this.leg(d.i, j);
    else {
      this.plaatsIn(d.i, -1);
      speelLesgeluid("s2Terug");
    }
    this.meldStand();
    return true;
  }

  /* ---------- goed en fout ---------- */

  goed() {
    if (!this.spec) return;
    speelLesgeluid("s2Vonk");
    this.stukken.forEach((q, i) => {
      if (!q.doel) return;
      this.sc.golf(q.im.x, q.im.y);
      this.vonken(q.im.x, q.im.y, 8);
      if (!this.sc.rustig) this.sc.tweens.add({ targets: q.im, y: q.im.y - 16, duration: 150, delay: i * 60, yoyo: true, ease: "Sine.easeOut" });
      const d = this.doelen.find((x) => x.spec.id === q.doel);
      d?.basis.setTint(GOED);
    });
  }

  fout() {
    if (!this.spec) return;
    const los = this.stukken.map((q, i) => ({ q, i })).filter((x) => x.q.doel && !x.q.vast);
    los.forEach((x) => this.sc.schud(x.q.im));
    if (!los.length) return;
    this.sc.time.delayedCall(this.sc.rustig ? 1 : 420, () => {
      los.forEach((x) => this.plaatsIn(x.i, -1));
      speelLesgeluid("s2Terug");
      this.meldStand();
    });
  }

  /* ---------- voor de automatische test ---------- */

  private scherm(x: number, y: number) {
    const r = this.sc.game.canvas.getBoundingClientRect();
    return { x: r.left + (x * r.width) / VLAK_B, y: r.top + (y * r.height) / VLAK_H };
  }

  private testStap(soort: string) {
    if (!this.spec || !this.actief) return null;
    const vrij = this.doelen.filter((q) => q.stuk < 0);
    if (!vrij.length) return null;
    const los = this.stukken.filter((q) => !q.doel && !q.vast);
    const naar = (q: Stuk, d: Doel) => ({ van: this.scherm(q.im.x, q.im.y), naar: this.scherm(this.snap(d).x, this.snap(d).y) });
    if (soort === "goed") {
      for (const q of los) {
        if (!q.spec.doel) continue;
        const d = q.spec.doel === "*" ? vrij[0] : vrij.find((x) => x.spec.id === q.spec.doel);
        if (d) return naar(q, d);
      }
      return null;
    }
    if (soort === "fout") {
      const fout = los.find((q) => !q.spec.doel);
      if (fout) return naar(fout, vrij[0]);
      for (const q of los) {
        const d = vrij.find((x) => x.spec.id !== q.spec.doel);
        if (d) return naar(q, d);
      }
    }
    return null;
  }
}

function ster(c: CanvasRenderingContext2D, x: number, y: number, ra: number, ri: number) {
  c.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? ra : ri;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const px = x + Math.cos(a) * r;
    const py = y + Math.sin(a) * r;
    if (i === 0) c.moveTo(px, py);
    else c.lineTo(px, py);
  }
  c.closePath();
}
