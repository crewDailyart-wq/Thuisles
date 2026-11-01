"use client";

/**
 * De telrij (30 oktober 2026, opdracht eigenaar; les "Telrij" naar Squla
 * groep 3): een rij huizen met huisnummers, of een rij kaartjes met getallen,
 * met één lege plek. Onderaan staan drie losse huizen of kaartjes; het kind
 * sleept het goede naar de lege plek (tikken mag ook).
 *
 * Stijl: 's nachts (nacht: true in de les), gloed alleen als het iets
 * betekent. De huizen zijn het vaste plaatje "huis" (src/lib/voorwerpen,
 * sinds 31 oktober 2026; daarvoor de 2D-huizen van Kenney) met een eigen
 * bordje met het nummer; de kaartjes zijn eigen tekenwerk. Alles in Phaser
 * (HARDE REGEL 7); slepen gaat in Phaser.
 *
 * Wat het draaiboek zet:
 * - `opgave`: `soort: "na"` = huizen, lege plek rechts (welk nummer komt
 *   erna?); `soort: "voor"` = kaartjes, lege plek links (welk getal komt
 *   ervoor?). `rij` = de getallen die er al staan, `losse` = de drie keuzes.
 * - `actief`: het kind mag slepen of tikken. Meldt `{ soort: "gelegd", n }`.
 * - `fout`: { n, keer } — dat losse ding schudt en gaat terug.
 * - `ingevuld`: het goede getal staat op de lege plek (lichtgolf).
 * - `licht`: welke plek in de rij oplicht (samen langs de rij lopen).
 * - `hand`: een lichtje doet één keer voor hoe je sleept.
 */

import { useEffect } from "react";
import type { Vlakbasis, Vlakgebeurtenis } from "../soort";
import { holoBasis, VLAK_B, VLAK_H, WARM, GOED, type PhaserModule } from "../holo/basis";
import { HOLO_CANVAS, useHoloMotor } from "../holo/motor";
import { speelLesgeluid } from "@/lib/lesgeluiden";
import { hexGetal, type Kleurnaam } from "./squla-tellen-tekenen";
import { voorwerpTextuur } from "../voorwerpen";
import s from "./squla-tellen.module.css";

export type Rijopgave = { id: string; soort: "na" | "voor"; rij: number[]; losse: number[] };

export type TelrijProps = {
  opgave: Rijopgave | null;
  actief?: boolean;
  licht?: number | null;
  ingevuld?: number | null;
  fout?: { n: number; keer: number } | null;
  hand?: boolean;
  /** Alle huisnummers en kaartjes van de les: worden vooruit gemaakt (geen hapering later). */
  voorraad?: { huizen: number[]; kaarten: number[] };
};

/* ---------- kleuren van de kaartjes ---------- */

const KAARTKLEUREN: Kleurnaam[] = ["blauw", "paars", "rood", "groen", "oranje", "roze"];
/** De kleur van het getal op een kaartje (ook in de zin van Bliepo: {17:paars}). */
export const kaartKleur = (n: number): Kleurnaam => KAARTKLEUREN[n % KAARTKLEUREN.length];
const KAARTINKT: Record<string, string> = { blauw: "#2f63e0", paars: "#8a3fd6", rood: "#e0344f", groen: "#1f9a4c", oranje: "#e06d12", roze: "#d23f97" };

/* ---------- maten (punten van het vlak) ---------- */

/*
  Het huis is het vaste, vierkante plaatje "huis" (160 × 160 punten). In het
  plaatje staat het huis op 6% boven de onderrand en is het ongeveer 82% hoog;
  de grond van het huis is het ankerpunt.
*/
const HUIS_B = 160;
const HUIS_ONDER = HUIS_B * 0.06;
const HUIS_HOOG = HUIS_B * 0.82;

const RIJ_Y = { huis: 345, kaart: 240 };
const LOS_Y = { huis: 660, kaart: 555 };
const STAP = { huis: 176, kaart: 152, losHuis: 210, losKaart: 176 };
const KRT = { b: 120, h: 150 };

type Soortding = "huis" | "kaart";
const dingVan = (o: Rijopgave): Soortding => (o.soort === "na" ? "huis" : "kaart");

/** De plekken in de rij (met de lege plek) en van de losse; voor huizen is y de grond, voor kaartjes het midden. */
function plekken(o: Rijopgave) {
  const d = dingVan(o);
  const aantal = o.rij.length + 1;
  const stap = d === "huis" ? STAP.huis : STAP.kaart;
  const x0 = VLAK_B / 2 - ((aantal - 1) * stap) / 2;
  const gat = o.soort === "na" ? aantal - 1 : 0;
  const rij = Array.from({ length: aantal }, (_, i) => ({ x: x0 + i * stap, y: d === "huis" ? RIJ_Y.huis : RIJ_Y.kaart }));
  const losStap = d === "huis" ? STAP.losHuis : STAP.losKaart;
  const losse = o.losse.map((_, i) => ({ x: VLAK_B / 2 + (i - (o.losse.length - 1) / 2) * losStap, y: d === "huis" ? LOS_Y.huis : LOS_Y.kaart }));
  return { rij, gat, losse };
}

/** De rechthoek waar je een ding kunt pakken (ten opzichte van zijn ankerpunt). */
function vorm(d: Soortding) {
  if (d === "kaart") return { x: -KRT.b / 2, y: -KRT.h / 2, b: KRT.b, h: KRT.h };
  const h = HUIS_HOOG;
  return { x: -HUIS_B / 2, y: -h, b: HUIS_B, h };
}

/* ---------- de scène ---------- */

interface RijScene {
  zetOpgave(o: Rijopgave | null): void;
  zetActief(aan: boolean): void;
  zetLicht(i: number | null): void;
  zetIngevuld(n: number | null): void;
  fout(n: number): void;
  hand(aan: boolean): void;
  leg(n: number): void;
  sleepPunt(): { x: number; y: number } | null;
  verbind(melder: (g: Vlakgebeurtenis) => void): void;
  bakVooruit(huizen: number[], kaarten: number[]): void;
}

function maakRijScene(Phaser: PhaserModule, rustig: boolean) {
  const Basis = holoBasis(Phaser, rustig);
  type Img = import("phaser").GameObjects.Image;
  type Box = import("phaser").GameObjects.Container;
  type Gfx = import("phaser").GameObjects.Graphics;
  type Ptr = import("phaser").Input.Pointer;
  type Los = { n: number; box: Box; thuis: { x: number; y: number }; opGat: boolean };

  class Rij extends Basis implements RijScene {
    melder: (g: Vlakgebeurtenis) => void = () => {};
    o: Rijopgave | null = null;
    vast: Box[] = [];
    gatDing: Img | null = null;
    losse: Los[] = [];
    vulling: Box | null = null;
    lijn: Gfx | null = null;
    lichtG: Gfx | null = null;
    vinger: Img | null = null;
    actief = false;
    bezig = false;
    sleep: null | { los: Los; dx: number; dy: number; x0: number; y0: number; bewogen: boolean } = null;

    constructor() {
      super("squla-telrij");
    }

    verbind(melder: (g: Vlakgebeurtenis) => void) {
      this.melder = melder;
    }

    maak() {
      /* Een lege plek: een stippellijn met een vraagteken (huis of kaartje). */
      const gat = (sl: string, b: number, h: number, huis: boolean) =>
        this.canvasPlaatje(sl, b, h, (c) => {
          c.setLineDash([10, 8]);
          c.strokeStyle = "rgba(255,255,255,0.85)";
          c.lineWidth = 4;
          c.fillStyle = "rgba(20,40,90,0.35)";
          c.beginPath();
          if (huis) {
            c.moveTo(6, h - 4);
            c.lineTo(6, h * 0.42);
            c.lineTo(b / 2, 6);
            c.lineTo(b - 6, h * 0.42);
            c.lineTo(b - 6, h - 4);
            c.closePath();
          } else c.roundRect(4, 4, b - 8, h - 8, 16);
          c.fill();
          c.stroke();
          c.setLineDash([]);
          c.fillStyle = "#ffffff";
          c.font = `800 ${huis ? 64 : 70}px "Work Sans", system-ui, sans-serif`;
          c.textAlign = "center";
          c.textBaseline = "middle";
          c.fillText("?", b / 2, huis ? h * 0.62 : h / 2 + 3);
        });
      gat("sqr-gat-huis", HUIS_B, 160, true);
      gat("sqr-gat-kaart", KRT.b, KRT.h, false);
      /* Het lichtje dat voordoet hoe je sleept. */
      this.canvasPlaatje("sqr-vinger", 60, 60, (c) => {
        const g = c.createRadialGradient(30, 30, 4, 30, 30, 28);
        g.addColorStop(0, "rgba(255,255,255,1)");
        g.addColorStop(0.45, "rgba(255,240,190,0.9)");
        g.addColorStop(1, "rgba(255,211,110,0)");
        c.fillStyle = g;
        c.beginPath();
        c.arc(30, 30, 28, 0, Math.PI * 2);
        c.fill();
      });
      /* Het huisplaatje één keer tekenen (bijna onzichtbaar), zodat het al op de grafische kaart staat als het echt verschijnt. */
      const warm = this.add.image(-400, -400, voorwerpTextuur(this, "huis")).setAlpha(0.01).setScale(0.1);
      this.time.delayedCall(400, () => warm.destroy());
      this.input.on("pointerdown", (p: Ptr) => this.neer(p));
      this.input.on("pointermove", (p: Ptr) => this.beweeg(p));
      this.input.on("pointerup", () => this.los());
      this.input.on("pointerupoutside", () => this.los());
    }

    /* ---------- plaatjes ---------- */

    bordje(n: number) {
      const sl = `sqr-bord-${n}`;
      this.canvasPlaatje(sl, 96, 54, (c) => {
        c.beginPath();
        c.roundRect(3, 3, 90, 48, 11);
        c.fillStyle = "#1d2540";
        c.fill();
        c.strokeStyle = "#ffffff";
        c.lineWidth = 3;
        c.stroke();
        c.fillStyle = "#ffffff";
        c.font = `800 ${n >= 100 ? 30 : 36}px "Work Sans", system-ui, sans-serif`;
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillText(String(n), 48, 29);
      });
      return sl;
    }

    kaartTex(n: number) {
      const sl = `sqr-kaart-${n}`;
      if (!this.textures.exists(`${sl}-g`)) {
        const inkt = KAARTINKT[kaartKleur(n)];
        this.canvasPlaatje(sl, KRT.b, KRT.h, (c) => {
          c.beginPath();
          c.roundRect(3, 3, KRT.b - 6, KRT.h - 6, 16);
          c.fillStyle = "#f6f8ff";
          c.fill();
          c.strokeStyle = inkt;
          c.lineWidth = 4;
          c.stroke();
          c.fillStyle = inkt;
          c.font = `800 66px "Work Sans", system-ui, sans-serif`;
          c.textAlign = "center";
          c.textBaseline = "middle";
          c.fillText(String(n), KRT.b / 2, KRT.h / 2 + 4);
        });
        this.bak(sl, `${sl}-g`, hexGetal(inkt));
      }
      return `${sl}-g`;
    }

    /** Een huis of kaartje met nummer; het ankerpunt is de grond (huis) of het midden (kaartje). */
    maakDing(d: Soortding, n: number, x: number, y: number): Box {
      if (d === "kaart") return this.add.container(x, y, [this.plaats(this.kaartTex(n), 0, 0)]);
      const hoog = HUIS_HOOG;
      const beeld = this.add.image(0, HUIS_ONDER - HUIS_B / 2, voorwerpTextuur(this, "huis")).setDisplaySize(HUIS_B, HUIS_B);
      const bord = this.plaats(this.bordje(n), 0, -hoog * 0.52);
      return this.add.container(x, y, [beeld, bord]);
    }

    /* ---------- de opgave ---------- */

    zetOpgave(o: Rijopgave | null) {
      for (const b of [...this.vast, ...this.losse.map((l) => l.box), this.vulling]) if (b) this.verdwijn(b);
      this.gatDing?.destroy();
      this.lijn?.destroy();
      this.lichtG?.destroy();
      this.vinger?.destroy();
      this.vast = [];
      this.losse = [];
      this.vulling = null;
      this.gatDing = null;
      this.lijn = null;
      this.lichtG = null;
      this.vinger = null;
      this.sleep = null;
      this.bezig = false;
      this.o = o;
      if (!o) return;
      this.druk(1000);
      const d = dingVan(o);
      const p = plekken(o);
      /* De grond onder de huizen: een zachte lijn van licht. */
      if (d === "huis") {
        const l = this.add.graphics();
        l.lineStyle(4, 0x9fe9ff, 0.45);
        l.lineBetween(p.rij[0].x - 110, RIJ_Y.huis + 3, p.rij[p.rij.length - 1].x + 110, RIJ_Y.huis + 3);
        this.lijn = l;
      }
      let k = 0;
      p.rij.forEach((q, i) => {
        if (i === p.gat) {
          this.gatDing = this.plaats(d === "huis" ? "sqr-gat-huis" : "sqr-gat-kaart", q.x, d === "huis" ? q.y - 80 : q.y);
          return;
        }
        const box = this.maakDing(d, o.rij[k++], q.x, q.y);
        this.vast.push(box);
        this.tover(box, { vertraging: i * 60 });
      });
      o.losse.forEach((n, i) => {
        const q = p.losse[i];
        const box = this.maakDing(d, n, q.x, q.y);
        this.losse.push({ n, box, thuis: q, opGat: false });
        this.tover(box, { vertraging: 260 + i * 70 });
      });
    }

    gatPlek() {
      const o = this.o;
      if (!o) return null;
      const p = plekken(o);
      return p.rij[p.gat];
    }

    zetActief(aan: boolean) {
      this.actief = aan;
      if (aan) this.bezig = false;
    }

    zetLicht(i: number | null) {
      this.lichtG?.destroy();
      this.lichtG = null;
      const o = this.o;
      if (i === null || !o) return;
      const q = plekken(o).rij[i];
      if (!q) return;
      const g = this.add.graphics().setDepth(-1);
      if (dingVan(o) === "huis") {
        g.fillStyle(WARM, 0.55);
        g.fillEllipse(q.x, q.y + 6, HUIS_B + 40, 26);
      } else {
        g.lineStyle(6, WARM, 0.9);
        g.strokeRoundedRect(q.x - KRT.b / 2 - 10, q.y - KRT.h / 2 - 10, KRT.b + 20, KRT.h + 20, 22);
      }
      this.lichtG = g;
    }

    zetIngevuld(n: number | null) {
      const o = this.o;
      const q = this.gatPlek();
      if (n === null || !o || !q) return;
      const los = this.losse.find((l) => l.n === n);
      this.gatDing?.setVisible(false);
      const midY = dingVan(o) === "huis" ? q.y - HUIS_HOOG / 2 : q.y;
      if (los) {
        los.opGat = true;
        this.tweens.add({ targets: los.box, x: q.x, y: q.y, duration: this.rustig ? 1 : 180 });
      } else if (!this.vulling) {
        this.vulling = this.maakDing(dingVan(o), n, q.x, q.y);
        this.tover(this.vulling);
      }
      this.druk(700);
      this.golf(q.x, midY, GOED);
      /* De andere losse gaan weg. */
      this.losse.filter((l) => l.n !== n).forEach((l) => this.verdwijn(l.box));
      this.losse = this.losse.filter((l) => l.n === n);
    }

    fout(n: number) {
      const los = this.losse.find((l) => l.n === n);
      if (!los) return;
      this.druk(900);
      this.schud(los.box);
      this.time.delayedCall(this.rustig ? 1 : 520, () => this.terug(los));
    }

    terug(los: Los) {
      los.opGat = false;
      this.gatDing?.setVisible(true);
      this.tweens.add({ targets: los.box, x: los.thuis.x, y: los.thuis.y, duration: this.rustig ? 1 : 220, ease: "Cubic.easeOut", onComplete: () => los.box.setDepth(0) });
    }

    /** Leg een los ding op de lege plek en meld het (na slepen, tikken of de knop). */
    leg(n: number) {
      const los = this.losse.find((l) => l.n === n);
      const q = this.gatPlek();
      if (!los || !q || !this.actief || this.bezig) return;
      this.bezig = true;
      this.hand(false);
      los.opGat = true;
      los.box.setDepth(10);
      this.gatDing?.setVisible(false);
      speelLesgeluid("tik");
      this.tweens.add({
        targets: los.box,
        x: q.x,
        y: q.y,
        duration: this.rustig ? 1 : 180,
        ease: "Cubic.easeOut",
        onComplete: () => this.melder({ soort: "gelegd", n }),
      });
    }

    hand(aan: boolean) {
      this.vinger?.destroy();
      this.vinger = null;
      const o = this.o;
      const q = this.gatPlek();
      if (!aan || !o || !q || this.rustig || !this.losse.length) return;
      this.druk(3600);
      const van = this.losse[Math.floor(this.losse.length / 2)];
      const d = dingVan(o);
      const midden = (y: number) => (d === "huis" ? y - HUIS_HOOG / 2 : y);
      const v = this.plaats("sqr-vinger", van.thuis.x, midden(van.thuis.y)).setDepth(20).setAlpha(0);
      this.vinger = v;
      this.tweens.chain({
        targets: v,
        tweens: [
          { alpha: 1, duration: 200, delay: 500 },
          { x: q.x, y: midden(q.y), duration: 900, ease: "Sine.easeInOut" },
          { alpha: 0, duration: 250 },
          { x: van.thuis.x, y: midden(van.thuis.y), duration: 1 },
          { alpha: 1, duration: 200, delay: 300 },
          { x: q.x, y: midden(q.y), duration: 900, ease: "Sine.easeInOut" },
          { alpha: 0, duration: 250 },
        ],
      });
    }

    /* ---------- slepen en tikken ---------- */

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

    losOp(x: number, y: number): Los | null {
      const o = this.o;
      if (!o) return null;
      const d = dingVan(o);
      return (
        this.losse.find((l) => {
          const v = vorm(d);
          return !l.opGat && x >= l.box.x + v.x && x <= l.box.x + v.x + v.b && y >= l.box.y + v.y && y <= l.box.y + v.y + v.h;
        }) ?? null
      );
    }

    neer(p: Ptr) {
      if (!this.actief || this.bezig) return;
      const w = this.waar(p);
      const los = this.losOp(w.x, w.y);
      if (!los) return;
      this.sleep = { los, dx: w.x - los.box.x, dy: w.y - los.box.y, x0: w.x, y0: w.y, bewogen: false };
      los.box.setDepth(10);
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
      sl.los.box.setPosition(w.x - sl.dx, w.y - sl.dy);
    }

    los() {
      const sl = this.sleep;
      if (!sl) return;
      this.sleep = null;
      if (!sl.bewogen) return this.leg(sl.los.n);
      const q = this.gatPlek();
      if (q && Math.hypot(sl.los.box.x - q.x, sl.los.box.y - q.y) < 130) return this.leg(sl.los.n);
      this.terug(sl.los);
    }

    sleepPunt() {
      const o = this.o;
      if (!this.actief || !o) return null;
      const r = this.game.canvas.getBoundingClientRect();
      const f = r.width / VLAK_B;
      if (this.sleep) return { x: r.left + (this.sleep.los.box.x + this.sleep.dx) * f, y: r.top + (this.sleep.los.box.y + this.sleep.dy) * f };
      const los = this.losse.find((l) => !l.opGat);
      if (!los) return null;
      const v = vorm(dingVan(o));
      return { x: r.left + (los.box.x + v.x + v.b / 2) * f, y: r.top + (los.box.y + v.y + v.h / 2) * f };
    }

    /** Alle kaartjes en bordjes van de les vooruit maken, één per keer en alleen als er niets beweegt (geen hapering). */
    rijKlus: (() => void)[] = [];
    drukTot = 0;
    druk(ms: number) {
      this.drukTot = Math.max(this.drukTot, performance.now() + ms);
    }
    bakVooruit(huizen: number[], kaarten: number[]) {
      this.rijKlus = [...huizen.map((n) => () => void this.bordje(n)), ...kaarten.map((n) => () => void this.kaartTex(n))];
      /* Eerst rustig het welkom (en de eerste tovering); daarna in de stille stukjes. */
      this.druk(2500);
      this.time.addEvent({
        delay: 120,
        loop: true,
        callback: () => {
          if (!this.rijKlus.length || performance.now() < this.drukTot || this.sleep) return;
          this.rijKlus.shift()!();
          this.druk(120);
        },
      });
    }

    /** Voor `npm run vloeiend`: met wat er nu staat — de rij licht op en een huis schuift naar de lege plek en terug. */
    demo(ms: number) {
      const eind = performance.now() + ms;
      let k = 0;
      const stap = () => {
        if (performance.now() > eind || !this.o) return;
        this.druk(1000);
        const p = plekken(this.o);
        this.zetLicht(k++ % p.rij.length);
        const q = p.rij[p.gat];
        const ding = this.losse[0]?.box ?? this.vast[0];
        if (ding && q) {
          const x = ding.x;
          const y = ding.y;
          this.tweens.add({ targets: ding, x: q.x, y: q.y, duration: 450, yoyo: true, ease: "Sine.easeInOut", onComplete: () => ding.setPosition(x, y) });
        }
        this.golf(q.x, q.y - 80);
        this.time.delayedCall(1000, stap);
      };
      stap();
    }
  }
  return Rij as unknown as new () => import("phaser").Scene;
}

/* ---------- het vlak ---------- */

export function SqulaTelrij({ opgave, actief = false, licht = null, ingevuld = null, fout = null, hand = false, voorraad, meld, schaal }: TelrijProps & Vlakbasis) {
  const { plek, scene } = useHoloMotor<RijScene>(schaal, maakRijScene, { invoer: true });
  const voorraadSleutel = voorraad ? JSON.stringify(voorraad) : "";
  useEffect(() => {
    if (!scene || !voorraadSleutel) return;
    const v = JSON.parse(voorraadSleutel) as { huizen: number[]; kaarten: number[] };
    scene.bakVooruit(v.huizen, v.kaarten);
  }, [scene, voorraadSleutel]);
  const sleutel = opgave ? JSON.stringify(opgave) : "";

  useEffect(() => {
    scene?.verbind(meld);
  }, [scene, meld]);

  useEffect(() => {
    scene?.zetOpgave(sleutel ? (JSON.parse(sleutel) as Rijopgave) : null);
  }, [scene, sleutel]);

  useEffect(() => {
    scene?.zetActief(actief);
    if (!scene) return;
    /* Voor `npm run vloeiend`: alleen slepen als er iets te slepen is. */
    if (actief) window.__phaser = { ...window.__phaser, sleepPunt: () => scene.sleepPunt() as { x: number; y: number } };
    else if (window.__phaser) delete window.__phaser.sleepPunt;
  }, [scene, actief, sleutel]);

  useEffect(() => {
    scene?.zetLicht(licht);
  }, [scene, licht, sleutel]);

  useEffect(() => {
    scene?.zetIngevuld(ingevuld);
  }, [scene, ingevuld, sleutel]);

  const foutKeer = fout?.keer ?? 0;
  const foutN = fout?.n ?? null;
  useEffect(() => {
    if (scene && foutN !== null && foutKeer > 0) scene.fout(foutN);
  }, [scene, foutN, foutKeer]);

  useEffect(() => {
    scene?.hand(hand);
  }, [scene, hand, sleutel]);

  /* Een onzichtbare knop per los ding: met het toetsenbord te kiezen, en voor de automatische test. */
  const knoppen = opgave && ingevuld === null ? opgave.losse : [];
  const p = opgave ? plekken(opgave) : null;
  const d = opgave ? dingVan(opgave) : "huis";

  return (
    <div className={s.vlak}>
      <div ref={plek} style={HOLO_CANVAS} aria-hidden />
      {p &&
        knoppen.map((n, i) => {
          const v = vorm(d);
          const q = p.losse[i];
          return (
            <button
              key={n}
              type="button"
              className={s.los}
              style={{ left: q.x + v.x, top: q.y + v.y, width: v.b, height: v.h }}
              data-ding={String(n)}
              disabled={!actief}
              aria-label={String(n)}
              onClick={() => scene?.leg(n)}
            />
          );
        })}
    </div>
  );
}

/* ---------- de kaart aan het eind ---------- */

/** Op de verzamelkaart: drie huisjes met nummers op een rij (244 × 190). */
export function KaartTelrij() {
  const huis = (x: number, n: number, kleur: string) => (
    <g key={n}>
      <polygon points={`${x - 4},92 ${x + 32},58 ${x + 68},92`} fill={kleur} stroke="#ffffff" strokeWidth={2} />
      <rect x={x} y={90} width={64} height={70} rx={3} fill="#2a3b78" stroke="#ffffff" strokeWidth={2} />
      <rect x={x + 10} y={98} width={44} height={26} rx={6} fill="#1d2540" stroke="#ffffff" strokeWidth={2} />
      <text x={x + 32} y={118} textAnchor="middle" fontSize={19} fontWeight={800} fill="#ffffff">
        {n}
      </text>
      <rect x={x + 24} y={138} width={16} height={22} rx={3} fill="#ffd36e" />
    </g>
  );
  return (
    <>
      <rect x={4} y={160} width={236} height={6} rx={3} fill="#9fe9ff" opacity={0.6} />
      {huis(10, 38, "#e07a5f")}
      {huis(90, 39, "#81b29a")}
      {huis(170, 40, "#7fa7d9")}
    </>
  );
}
