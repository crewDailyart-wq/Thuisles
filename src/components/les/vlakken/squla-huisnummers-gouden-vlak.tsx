"use client";

/**
 * Het speelvlak van de GOUDEN LES HUISNUMMERS (squla-huisnummers-gouden, 10 november 2026; BOUWREGELS hoofdstuk 15).
 * Een nieuw vlak naast SqulaStraat (squla-huisnummers-straat.tsx); dat vlak en de oude les blijven precies zoals ze zijn.
 *
 * Dezelfde straat in de avond als de oude les (dezelfde huisplaatjes van Kenney, public/squla/huizen-2d/, met een
 * donker bordje en een wit nummer), maar nu in PHASER (HARDE REGEL 7): de straat en de huizen worden 1 keer getekend
 * ("gebakken"), daarna schuiven alleen plaatjes. Alles staat links van het vaste tekstvak (x < 860 van de 980; keuring
 * Meer-minder, BOUWREGELS 15.30), zodat een lange hint nooit over een huis valt.
 *
 *   - `huizen`: de rij van links naar rechts. Een getal = huis met dat nummer, "?" = vraagteken op het bordje,
 *     null = lege plek (stippellijn). Een nieuw `beeld` = Bliepo tovert de straat tevoorschijn; verandert alleen het gat
 *     (het nummer komt erop), dan wipt dat huis even op.
 *   - `licht`: het ROODE RONDJE om het huis dat Bliepo noemt (7.8; alleen als hij het noemt). Nooit om het antwoord.
 *   - `typ`: een ECHT invulvak op het bordje van het gat (HARDE REGEL 5: geen getekend toetsenbord; inputMode numeric
 *     én pattern; het vak schuift mee met het toetsenbord via useInBeeld). Meldt `{ soort: "typVol", vol }` als het vak
 *     leeg of niet leeg wordt, en `{ soort: "typKlaar" }` bij Enter. Elke wijziging gaat naar `zetWaarde`.
 *   - `losse` + `sleepbaar`: de huizen onder de straat om naar de lege plek te slepen (of aan te tikken). Meldt
 *     `{ soort: "gelegd", n }`. `losTerug` ophogen = alle losse huizen glijden terug (na een fout; geen schudden, 5.3).
 *   - `tikHuis`: bij het samen voordoen (2e fout) het huis dat het kind mag aantikken (de kleine stap). Meldt
 *     `{ soort: "huisTik" }`.
 *   - `hulphand`: het HULPHANDJE (15.19): de les zet het na ± 6 s stilte bij een opdracht; nooit een knop.
 *   - `goed` ophogen = een rustige lichtgolf bij het gat (7.6).
 * Maten in punten van het vlak (980 × 720).
 */

import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as RPointerEvent } from "react";
import type { Vlakbasis } from "../soort";
import { holoBasis, type PhaserModule } from "../holo/basis";
import { HOLO_CANVAS, useHoloMotor } from "../holo/motor";
import { useInBeeld } from "@/components/oefenen/toetsenbordruimte";
import s from "./squla-huisnummers-gouden.module.css";

export type Huisplek = number | "?" | null;
export type Punt = { x: number; y: number };
export type HNHand = { plek: Punt; naar?: Punt | null; sleutel: string };

export type HNProps = {
  huizen: Huisplek[] | null;
  beeld: string;
  losse?: number[];
  losTerug?: number;
  licht?: number | null;
  typ?: { sleutel: string } | null;
  /** Het invulvak geeft elke wijziging door aan de les (de les leest het nummer bij het vinkje). */
  zetWaarde?: (waarde: string) => void;
  tikHuis?: number | null;
  sleepbaar?: boolean;
  hulphand?: HNHand | null;
  goed?: number;
};

/* ---------- de maten (zoals de oude straat, maar met het midden op x = 430: links van het tekstvak) ---------- */

const MIDDEN = 430;
const W = 136;
const TUSSEN = 10;
export const GROND = 400;
export const LOSGROND = 676;
const GLOED = 80; /* de ruimte rondom in de huisplaatjes */
const PLAATJES = [
  { naam: "house1", b: 415, h: 448 },
  { naam: "houseAlt2", b: 482, h: 434 },
  { naam: "houseAlt1", b: 335, h: 448 },
  { naam: "house2", b: 562, h: 434 },
];
const plaatjeVan = (n: number | "?") => PLAATJES[n === "?" ? 0 : ((n % 4) + 4) % 4];
const hoogVan = (n: number | "?") => {
  const p = plaatjeVan(n);
  return p.h * (W / p.b);
};

/** De linkerkant van huis i in een rij van `aantal`. */
export const huisX = (aantal: number, i: number) => MIDDEN - (aantal * W + (aantal - 1) * TUSSEN) / 2 + i * (W + TUSSEN);
/** Het midden van het bordje van huis i in de straat. */
export function bordVan(huizen: Huisplek[], i: number): Punt {
  const h = huizen[i];
  const hoog = hoogVan(h === null ? "?" : h);
  return { x: huisX(huizen.length, i) + W / 2, y: GROND - hoog * 0.52 };
}
/** Het midden van huis i in de straat (voor het handje en de tikknop). */
export const huisMidden = (huizen: Huisplek[], i: number): Punt => ({ x: huisX(huizen.length, i) + W / 2, y: GROND - 75 });
/** Het midden van los huis i. */
export const losMidden = (aantal: number, i: number): Punt => ({ x: huisX(aantal, i) + W / 2, y: LOSGROND - 75 });

/* ---------- Phaser ---------- */

interface Scene {
  zetFont(font: string): void;
  zetStraat(huizen: Huisplek[] | null, beeld: string, typ: boolean): void;
  zetLosse(losse: number[], beeld: string): void;
  losTerug(): void;
  zetLicht(i: number | null): void;
  sleep(i: number, x: number, y: number): boolean;
  laatLos(i: number, raak: boolean): void;
  golf(): void;
}

type Huisding = { doos: import("phaser").GameObjects.Container; waarde: Huisplek };

function maakScene(Phaser: PhaserModule, rustig: boolean) {
  const Basis = holoBasis(Phaser, rustig);
  type Box = import("phaser").GameObjects.Container;
  type Img = import("phaser").GameObjects.Image;

  class GoudenStraat extends Basis implements Scene {
    font = "system-ui, sans-serif";

    zetFont(font: string) {
      if (font) this.font = font;
    }
    huizen: Huisding[] = [];
    rij: Huisplek[] = [];
    beeld = "";
    typ = false;
    losse: { doos: Box; n: number; thuis: Punt }[] = [];
    losBeeld = "";
    rondje!: Img;
    lichtI: number | null = null;
    gat: number = -1;

    constructor() {
      super("squla-huisnummers-gouden");
    }

    preload() {
      for (const p of PLAATJES) this.load.image(`hn-${p.naam}`, `/squla/huizen-2d/${p.naam}.png`);
      this.load.image("hn-rondje", "/rondje/rondje-rood-2.png");
    }

    maak() {
      /* De straat 1 keer bakken: sterren, maan, stoep, straat en 2 lantaarns (zoals de oude les), alles links van x = 860. */
      this.canvasPlaatje("hn-achter", 980, 720, (c) => {
        c.fillStyle = "#f5e6b8";
        c.beginPath();
        c.arc(790, 80, 32, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = "#e6d29c";
        c.beginPath();
        c.arc(779, 72, 6, 0, Math.PI * 2);
        c.arc(800, 93, 4, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = "rgba(255,255,255,0.7)";
        for (const [a, b] of [[90, 60], [200, 110], [420, 50], [640, 96], [560, 150]]) {
          c.beginPath();
          c.arc(a, b, 2.5, 0, Math.PI * 2);
          c.fill();
        }
        const stoep = (y: number, h: number, kleur: string) => {
          c.fillStyle = kleur;
          c.beginPath();
          c.roundRect(14, y, 832, h, 10);
          c.fill();
        };
        stoep(GROND, 24, "#59607e");
        stoep(GROND + 24, 36, "#353b57");
        c.fillStyle = "rgba(201,207,227,0.6)";
        for (let i = 0; i < 6; i++) {
          c.beginPath();
          c.roundRect(44 + i * 136, GROND + 40, 70, 5, 2);
          c.fill();
        }
        for (const px of [32, 826]) {
          c.fillStyle = "#2a2f45";
          c.fillRect(px - 4, GROND - 190, 8, 190);
          c.fillStyle = "#ffd36b";
          c.beginPath();
          c.roundRect(px - 14, GROND - 206, 28, 22, 6);
          c.fill();
        }
      });
      this.plaats("hn-achter", 490, 360).setDepth(0);
      /* De lege plek: de omtrek van een huis in stippellijn (gewoon en "er hangt een huis boven"). */
      for (const [sl, aan] of [["hn-leeg", false], ["hn-leeg-aan", true]] as const)
        this.canvasPlaatje(sl, W + 20, 240, (c) => {
          const x = 10;
          const grond = 230;
          const top = grond - 150;
          c.beginPath();
          c.moveTo(x, grond);
          c.lineTo(x, top + 4);
          c.lineTo(x + W / 2, top - 66);
          c.lineTo(x + W, top + 4);
          c.lineTo(x + W, grond);
          c.closePath();
          c.fillStyle = aan ? "rgba(255,211,107,0.22)" : "rgba(255,255,255,0.06)";
          c.fill();
          c.setLineDash([12, 9]);
          c.lineJoin = "round";
          c.lineWidth = aan ? 5 : 3;
          c.strokeStyle = aan ? "#ffd36b" : "rgba(255,255,255,0.7)";
          c.stroke();
        });
      this.rondje = this.add.image(0, 0, "hn-rondje").setVisible(false).setDepth(5);
    }

    /** Het bordje met een nummer (1 keer getekend per nummer). Leeg = een leeg bordje (daar staat het invulvak op). */
    bord(label: string) {
      const sl = `hn-bord-${label || "leeg"}`;
      this.canvasPlaatje(sl, 82, 52, (c) => {
        c.fillStyle = "#1d2540";
        c.strokeStyle = "#ffffff";
        c.lineWidth = 2.5;
        c.beginPath();
        c.roundRect(3, 3, 76, 46, 10);
        c.fill();
        c.stroke();
        if (!label) return;
        c.fillStyle = "#ffffff";
        c.font = `800 34px ${this.font}`;
        c.textAlign = "center";
        c.textBaseline = "alphabetic";
        c.fillText(label, 41, 41);
      });
      return sl;
    }

    /** Eén huis als groep, met het punt onderaan in het midden op (0, 0). */
    maakHuis(n: number | "?", leegBord = false): Box {
      const p = plaatjeVan(n);
      const sc = W / p.b;
      const hoog = p.h * sc;
      const doos = this.add.container(0, 0);
      const beeld = this.add.image(0, GLOED * sc, `hn-${p.naam}`).setOrigin(0.5, 1).setDisplaySize((p.b + 2 * GLOED) * sc, (p.h + 2 * GLOED) * sc);
      if (n === "?") beeld.setTint(0xa9aec2);
      doos.add(beeld);
      doos.add(this.plaats(this.bord(leegBord ? "" : String(n)), 0, -hoog * 0.52));
      return doos;
    }

    maakLeeg(): Box {
      const doos = this.add.container(0, 0);
      doos.add(this.plaats("hn-leeg", 0, -115));
      doos.setData("leeg", true);
      return doos;
    }

    zetStraat(huizen: Huisplek[] | null, beeld: string, typ: boolean) {
      const nieuw = beeld !== this.beeld;
      if (!huizen) {
        for (const h of this.huizen) this.verdwijn(h.doos);
        this.huizen = [];
        this.rij = [];
        this.beeld = beeld;
        this.zetLicht(null);
        return;
      }
      if (nieuw || huizen.length !== this.rij.length) {
        for (const h of this.huizen) this.verdwijn(h.doos);
        this.huizen = huizen.map((h, i) => {
          const doos = h === null ? this.maakLeeg() : this.maakHuis(h, typ && h === "?");
          doos.setPosition(huisX(huizen.length, i) + W / 2, GROND).setDepth(2);
          this.tover(doos, { vertraging: i * 40 });
          return { doos, waarde: h };
        });
      } else {
        huizen.forEach((h, i) => {
          const oud = this.huizen[i];
          if (oud.waarde === h && !(h === "?" && (oud.doos.getData("leegBord") as boolean) !== typ)) return;
          oud.doos.destroy();
          const doos = h === null ? this.maakLeeg() : this.maakHuis(h, typ && h === "?");
          doos.setPosition(huisX(huizen.length, i) + W / 2, GROND).setDepth(2);
          doos.setData("leegBord", typ && h === "?");
          this.huizen[i] = { doos, waarde: h };
          /* Het nummer komt op het gat: het huis wipt even op. */
          if (typeof h === "number" && !this.rustig) {
            doos.setScale(0.9);
            this.tweens.add({ targets: doos, scale: 1, y: GROND, duration: 260, ease: "Back.easeOut" });
            this.tweens.add({ targets: doos, y: GROND - 16, duration: 130, yoyo: true, ease: "Sine.easeOut" });
          }
        });
      }
      for (const [i, h] of this.huizen.entries()) h.doos.setData("leegBord", typ && huizen[i] === "?");
      this.rij = [...huizen];
      this.beeld = beeld;
      this.typ = typ;
      this.gat = huizen.findIndex((h) => h === "?" || h === null);
      this.zetLicht(this.lichtI);
    }

    zetLosse(losse: number[], beeld: string) {
      const zelfde = beeld === this.losBeeld && losse.join(",") === this.losse.map((l) => l.n).join(",");
      if (zelfde) return;
      for (const l of this.losse) {
        if (l.doos.getData("inGat")) l.doos.destroy();
        else this.verdwijn(l.doos);
      }
      this.losBeeld = beeld;
      this.losse = losse.map((n, i) => {
        const thuis = { x: huisX(losse.length, i) + W / 2, y: LOSGROND };
        const doos = this.maakHuis(n).setPosition(thuis.x, thuis.y).setDepth(3);
        this.tover(doos, { vertraging: 120 + i * 60 });
        return { doos, n, thuis };
      });
    }

    losTerug() {
      for (const l of this.losse) {
        l.doos.setData("inGat", false);
        this.tweens.killTweensOf(l.doos);
        this.tweens.add({ targets: l.doos, x: l.thuis.x, y: l.thuis.y, duration: this.rustig ? 1 : 320, ease: "Cubic.easeOut" });
      }
      this.leegAan(false);
    }

    leegAan(aan: boolean) {
      const g = this.gat >= 0 ? this.huizen[this.gat] : null;
      if (!g || !g.doos.getData("leeg")) return;
      const img = g.doos.list[0] as Img;
      img.setTexture(aan ? "hn-leeg-aan" : "hn-leeg");
    }

    /** Slepen: het huis volgt de vinger (punten van het vlak, onderkant midden). Geeft terug of het boven de lege plek hangt. */
    sleep(i: number, x: number, y: number) {
      const l = this.losse[i];
      if (!l) return false;
      this.tweens.killTweensOf(l.doos);
      l.doos.setPosition(x, y).setDepth(6);
      const raak = this.boven(x, y);
      this.leegAan(raak);
      return raak;
    }

    boven(x: number, y: number) {
      if (this.gat < 0 || this.rij[this.gat] !== null) return false;
      const gx = huisX(this.rij.length, this.gat) + W / 2;
      return Math.abs(x - gx) < W / 2 + 30 && Math.abs(y - GROND) < 130;
    }

    laatLos(i: number, raak: boolean) {
      const l = this.losse[i];
      if (!l) return;
      this.leegAan(false);
      if (raak && this.gat >= 0) {
        /* Boven de lege plek: het huis klikt op zijn plek (de les zegt daarna of het klopt). */
        l.doos.setData("inGat", true);
        this.tweens.add({ targets: l.doos, x: huisX(this.rij.length, this.gat) + W / 2, y: GROND, duration: this.rustig ? 1 : 140, ease: "Cubic.easeOut" });
      } else {
        this.tweens.add({ targets: l.doos, x: l.thuis.x, y: l.thuis.y, duration: this.rustig ? 1 : 320, ease: "Cubic.easeOut", onComplete: () => l.doos.setDepth(3) });
      }
    }

    zetLicht(i: number | null) {
      this.lichtI = i;
      const h = i === null ? null : this.huizen[i];
      if (!h || i === null) {
        this.rondje.setVisible(false);
        return;
      }
      const waarde = this.rij[i];
      const hoog = hoogVan(waarde === null ? "?" : waarde);
      const cx = huisX(this.rij.length, i) + W / 2;
      this.rondje
        .setPosition(cx, GROND - hoog / 2)
        .setDisplaySize(W * 1.15 + 44, hoog * 1.4 + 50)
        .setRotation(-0.026)
        .setAlpha(1)
        .setVisible(true);
    }

    golf() {
      if (this.gat < 0) return;
      super.golf(huisX(this.rij.length, this.gat) + W / 2, GROND - 80);
    }

    /** Voor `npm run vloeiend`: steeds opnieuw de straat tevoorschijn toveren, het rondje laten lopen en een lichtgolf. */
    demo(ms: number) {
      const eind = performance.now() + ms;
      const rij = this.rij.length ? this.rij : [6, 7, "?" as const];
      let k = 0;
      const stap = () => {
        if (performance.now() > eind) return;
        this.zetStraat(rij, `demo-${k++}`, false);
        rij.forEach((_, i) => this.time.delayedCall(300 + i * 180, () => this.zetLicht(i)));
        this.time.delayedCall(300 + rij.length * 180, () => {
          this.zetLicht(null);
          this.golf();
        });
        this.time.delayedCall(500 + rij.length * 180, stap);
      };
      stap();
    }
  }
  return GoudenStraat as unknown as new () => import("phaser").Scene;
}

/* ---------- het vlak ---------- */

export function HuisnummersGoudenVlak({ huizen, beeld, losse = [], losTerug = 0, licht = null, typ = null, zetWaarde, tikHuis = null, sleepbaar = false, hulphand = null, goed = 0, meld, schaal }: HNProps & Vlakbasis) {
  const { plek, scene } = useHoloMotor<Scene>(schaal, maakScene);
  const wortel = useRef<HTMLDivElement>(null);
  const huizenSleutel = huizen ? JSON.stringify(huizen) : "";
  const rij = useMemo(() => (huizenSleutel ? (JSON.parse(huizenSleutel) as Huisplek[]) : null), [huizenSleutel]);
  const losseSleutel = losse.join(",");
  const gat = rij ? rij.findIndex((h) => h === "?" || h === null) : -1;

  useEffect(() => {
    if (!scene) return;
    if (wortel.current) scene.zetFont(getComputedStyle(wortel.current).fontFamily);
    scene.zetStraat(rij, beeld, !!typ);
  }, [scene, rij, beeld, typ]);
  useEffect(() => {
    scene?.zetLosse(losseSleutel ? losseSleutel.split(",").map(Number) : [], beeld);
  }, [scene, losseSleutel, beeld]);
  const vorigTerug = useRef(losTerug);
  useEffect(() => {
    if (!scene || losTerug === vorigTerug.current) return;
    vorigTerug.current = losTerug;
    scene.losTerug();
  }, [scene, losTerug]);
  useEffect(() => {
    scene?.zetLicht(licht);
  }, [scene, licht, rij, beeld]);
  const vorigGoed = useRef(goed);
  useEffect(() => {
    if (!scene || goed === vorigGoed.current) return;
    vorigGoed.current = goed;
    scene.golf();
  }, [scene, goed]);

  /* Slepen: de knop ligt over het losse huis; het plaatje in Phaser volgt de vinger. */
  const sleep = useRef<{ i: number; n: number; id: number; vanX: number; vanY: number; startX: number; startY: number; bewogen: boolean; raak: boolean } | null>(null);
  const punt = (e: { clientX: number; clientY: number }) => {
    const r = wortel.current?.getBoundingClientRect();
    const k = r && r.width ? r.width / 980 : 1;
    return { x: (e.clientX - (r?.left ?? 0)) / k, y: (e.clientY - (r?.top ?? 0)) / k };
  };
  const pak = (e: RPointerEvent<HTMLButtonElement>, i: number, n: number) => {
    if (!sleepbaar || !scene) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = punt(e);
    const thuis = { x: huisX(losse.length, i) + W / 2, y: LOSGROND };
    sleep.current = { i, n, id: e.pointerId, vanX: p.x - thuis.x, vanY: p.y - thuis.y, startX: p.x, startY: p.y, bewogen: false, raak: false };
  };
  const beweeg = (e: RPointerEvent<HTMLButtonElement>) => {
    const sl = sleep.current;
    if (!sl || e.pointerId !== sl.id || !scene) return;
    const p = punt(e);
    sl.bewogen ||= Math.hypot(p.x - sl.startX, p.y - sl.startY) > 6;
    if (sl.bewogen) sl.raak = scene.sleep(sl.i, p.x - sl.vanX, p.y - sl.vanY);
  };
  const los = (e: RPointerEvent<HTMLButtonElement>) => {
    const sl = sleep.current;
    if (!sl || e.pointerId !== sl.id) return;
    sleep.current = null;
    /* Tikken werkt ook; loslaten naast de plek brengt het huis terug. */
    const raak = !sl.bewogen || sl.raak;
    scene?.laatLos(sl.i, sl.bewogen && sl.raak);
    if (raak && sleepbaar) meld({ soort: "gelegd", n: sl.n });
  };

  const bord = rij && gat >= 0 ? bordVan(rij, gat) : null;

  return (
    <div ref={wortel} className={s.vlak} data-huisnummers="">
      <div ref={plek} style={HOLO_CANVAS} aria-hidden />
      {/* De plek van het gat (voor de test en het handje). */}
      {rij && gat >= 0 && <div className={s.gatplek} style={{ left: huisMidden(rij, gat).x, top: huisMidden(rij, gat).y }} data-gatplek="" aria-hidden />}
      {typ && bord && <Invulvak key={typ.sleutel} plek={bord} zetWaarde={zetWaarde} meld={meld} />}
      {sleepbaar &&
        losse.map((n, i) => (
          <button
            key={`${beeld}-los-${n}`}
            type="button"
            className={s.los}
            style={{ left: huisX(losse.length, i) - 4, top: LOSGROND - 168, width: W + 8, height: 176 }}
            data-ding={n}
            data-plek="los"
            aria-label={`Huis ${n}`}
            onPointerDown={(e) => pak(e, i, n)}
            onPointerMove={beweeg}
            onPointerUp={los}
            onPointerCancel={() => {
              const sl = sleep.current;
              sleep.current = null;
              if (sl) scene?.laatLos(sl.i, false);
            }}
            /* Toetsenbord (Enter of spatie) en de automatische test: kiezen zonder slepen. Een muis of vinger loopt via pak/los. */
            onClick={(e) => {
              if (e.detail === 0 && sleepbaar) meld({ soort: "gelegd", n });
            }}
          />
        ))}
      {rij && tikHuis !== null && tikHuis >= 0 && (
        <button
          type="button"
          className={s.tik}
          style={{ left: huisX(rij.length, tikHuis) - 4, top: GROND - 170, width: W + 8, height: 178 }}
          data-ding={`huis-${rij[tikHuis]}`}
          data-plek="huis"
          aria-label={`Huis ${rij[tikHuis]}`}
          onClick={() => meld({ soort: "huisTik" })}
        />
      )}
      {hulphand && (
        <div
          key={hulphand.sleutel}
          className={`${s.hand} ${hulphand.naar ? s.sleepGebaar : s.tikGebaar}`}
          style={{ left: hulphand.plek.x, top: hulphand.plek.y, ...(hulphand.naar ? ({ "--dx": `${hulphand.naar.x - hulphand.plek.x}px`, "--dy": `${hulphand.naar.y - hulphand.plek.y}px` } as CSSProperties) : {}) }}
          aria-hidden
          data-hulphand=""
        >
          <svg viewBox="0 0 90 120" className={s.handTekening}>
            <g>
              <rect x="34" y="6" width="20" height="62" rx="10" />
              <rect x="16" y="52" width="60" height="56" rx="18" />
              <rect x="52" y="50" width="17" height="30" rx="8" />
              <rect x="64" y="58" width="15" height="28" rx="7" />
              <rect x="8" y="66" width="18" height="30" rx="9" />
            </g>
            <path d="M54 66v12M66 70v14" className={s.lijn} />
          </svg>
        </div>
      )}
    </div>
  );
}


/** Het echte invulvak op het bordje van het gat (HARDE REGEL 5): alleen cijfers, schuift mee met het toetsenbord. */
function Invulvak({ plek, zetWaarde, meld }: { plek: Punt; zetWaarde?: (waarde: string) => void; meld: Vlakbasis["meld"] }) {
  const [waarde, setWaarde] = useState("");
  const { bijAandacht, bijWeggaan } = useInBeeld();
  return (
    <input
      className={s.invul}
      style={{ left: plek.x - 38, top: plek.y - 23 }}
      autoFocus
      inputMode="numeric"
      pattern="[0-9]*"
      autoComplete="off"
      placeholder="?"
      aria-label="Typ het huisnummer"
      data-invul=""
      value={waarde}
      onChange={(e) => {
        const v = e.target.value.replace(/\D/g, "").slice(0, 3);
        zetWaarde?.(v);
        /* Alleen melden als het vak leeg of niet leeg wordt: dan komt of gaat het vinkje (niet bij elke toets). */
        if (!!v !== !!waarde) meld({ soort: "typVol", vol: !!v });
        setWaarde(v);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          if (waarde) meld({ soort: "typKlaar" });
        }
      }}
      onFocus={(e) => bijAandacht(e.currentTarget)}
      onBlur={bijWeggaan}
    />
  );
}
