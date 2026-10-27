"use client";

/**
 * De sterrenklok: de wijzerklok van de groep 3-lessen Klokkijken als
 * hologram in Phaser (27 oktober 2026; LESSENPLAN.md § 2.5 en § 3.3, HARDE
 * REGEL 7). Wereld: Universum.
 *
 * Hetzelfde gedrag en dezelfde meldingen als de oude wijzerklok
 * (`klok-wijzerklok.tsx`, die blijft staan voor de andere klokkenlessen), dus
 * het draaiboek werkt er ongewijzigd mee. Wat anders is:
 *
 * - geen witte wijzerplaat: een zwevende, doorzichtige klok van licht vóór de
 *   blauwe ruimte, met 12 sterren in een kring en grote witte getallen;
 * - de urenwijzer is een warme oranje lichtstraal met een sterretje als greep,
 *   de minutenwijzer een lange paarse lichtstraal;
 * - de klok verschijnt uit een lichtstraal uit de vloer (Bliepo tovert hem);
 * - het stuk dat de minutenwijzer veegt, licht op als een zachte waaier;
 * - de knoppen onder de klok hebben een icoon (vraagteken = hulp, vinkje =
 *   klaar), want groep 3 leest nog niet;
 * - nieuw: `doel` (de tijd die het kind moet zetten, groot bovenaan) en
 *   `goed` (een teller: elke ophoging geeft een rustige lichtgolf).
 *
 * Bediening (in Phaser): sleep een wijzer rond, of tik op een getal. Op een
 * getal tikken is ruim: de hele taartpunt rond het getal (buiten het midden)
 * telt, zodat het ook op een telefoon met een kinderduim lukt.
 *
 * Meldingen: `gezet`, `controle`, `hulp`, `getal`, `mis` (elk met `tijd`),
 * net als de oude klok. Schrijft niets naar de database.
 */

import { useEffect, useRef } from "react";
import type { Vlakbasis, Vlakgebeurtenis } from "../soort";
import { draaiduur, type KlokProps, type Wijzer } from "./klok-wijzerklok";
import { holoBasis, GOED, TX, WARM, WERELDKLEUR } from "../holo/basis";
import { HOLO_CANVAS, useHoloMotor } from "../holo/motor";
import { IkoonKnop } from "../ikonen";
import s from "./klok-holo-sterrenklok.module.css";

export type SterrenklokProps = KlokProps & {
  /** De tijd die het kind moet zetten, groot bovenaan ("5 uur", "half 9"). */
  doel?: string | null;
  /** Ophogen = een rustige lichtgolf over de klok (goed antwoord). */
  goed?: number;
};

/* ---------- maten (punten van het vlak, 980 × 720) ---------- */

const R = 245;
const CIJFER = 0.75 * R;
const STER = 0.93 * R;
const MIN_LANG = 0.8 * R;
const UUR_LANG = 0.5 * R;
/* Het grijpvlak van een wijzer houdt op vóór de cijfers: daarbuiten is elke tik een tik op een getal. */
const GRIJP = 0.6 * R;
const LIJN_Y = 0;

type Geo = { x: number; y: number; k: number };
const ENKEL: Geo = { x: 490, y: 336, k: 1 };
const LINKS: Geo = { x: 280, y: 320, k: 0.76 };
const RECHTS: Geo = { x: 735, y: 320, k: 0.6 };

const UURKLEUR = 0xffa24a;
const MINKLEUR = 0xb48cff;
const PIJLKLEUR = 0x7fe9ff;
const MISKLEUR = 0xff9eab;

const graad = (g: number) => (g * Math.PI) / 180;
const mod = (n: number, m: number) => ((n % m) + m) % m;
/** Een punt op de klok: `hoek` in graden vanaf de 12, met de klok mee. */
const op = (hoek: number, r: number) => ({ x: Math.sin(graad(hoek)) * r, y: -Math.cos(graad(hoek)) * r });
/** De kortste draai van hoek `van` naar hoek `naar`, tussen -180 en 180. */
const kortst = (van: number, naar: number) => ((((naar - van) % 360) + 540) % 360) - 180;
const lijnplek = (n: number) => ({ x: -400 + ((n - 1) * 800) / 11, y: LIJN_Y });

/* ---------- de scène ---------- */

type Regels = Pick<KlokProps, "actief" | "beweegbaar" | "alleenGetal" | "grens" | "klem" | "tikGetal"> & { vorm: "klok" | "lijn" };

type Beeld = {
  wijzers: boolean;
  uurwijzer: "fel" | "flets" | "weg";
  minuutwijzer: "fel" | "flets" | "weg";
  pil: Wijzer | null;
  ring: number | null;
  driehoek: number | null;
  pijl: KlokProps["pijl"];
  inkleur: boolean;
  boog: KlokProps["boog"];
  vlag: number | null;
};

export interface KlokScene {
  /** Waar de meldingen heen gaan, en de regels voor tikken en slepen (bij elke render opnieuw). */
  zetBediening(meld: (g: Vlakgebeurtenis) => void, regels: Regels): void;
  /** Wordt bij elk beeld aangeroepen met de tijd op de klok (voor de digitale tijd). */
  zetOpTijd(f: ((tijd: number) => void) | null): void;
  naar(tijd: number, draai: boolean): void;
  zetVorm(vorm: "klok" | "lijn"): void;
  zetBeeld(b: Beeld): void;
  zetTweede(t: { tijd: number } | null): void;
  goedGolf(): void;
  /** De tijd die de klok nu aanwijst (minuten vanaf 12 uur). */
  tijdNu(): number;
  /** Punten van het vlak → voor de automatische test. */
  getalPunt(n: number): { x: number; y: number };
  wijzerPunt(w: Wijzer): { x: number; y: number };
}

type Img = import("phaser").GameObjects.Image;
type Gfx = import("phaser").GameObjects.Graphics;
type Box = import("phaser").GameObjects.Container;

function maakKlokScene(lettertype: () => string, begintijd: number) {
  return (Phaser: typeof import("phaser"), rustig: boolean) => {
    const Basis = holoBasis(Phaser, rustig);
    const LILA = WERELDKLEUR.universum;

    /** Eén klok van licht: de grote (met bediening) of de tweede (de klok van Bliepo). */
    class Plaat {
      box: Box;
      plaat: Img;
      lijn: Img;
      waaier: Gfx;
      boog: Gfx;
      boogTekst: Img[] = [];
      sterren: Img[] = [];
      getallen: Img[] = [];
      pijl: Gfx;
      driehoek: Img;
      vlag: Img;
      ring: Img | null = null;
      ringN: number | null = null;
      pilMin: Img;
      pilUur: Img;
      min: Img;
      uur: Img;
      greep: Img;
      midden: Img;
      u = 0;
      m = 0;
      inkleur = false;
      boogStand: KlokProps["boog"] = null;
      vorm: "klok" | "lijn" = "klok";

      constructor(
        private sc: InstanceType<typeof Basis>,
        geo: Geo,
        rand?: number,
      ) {
        const p = (sl: string, x = 0, y = 0) => sc.plaats(sl, x, y);
        this.box = sc.add.container(geo.x, geo.y).setScale(geo.k);
        this.plaat = p("sk-plaat-g");
        this.lijn = p("sk-lijn-g").setAlpha(0);
        this.waaier = sc.add.graphics();
        this.boog = sc.add.graphics();
        this.box.add([this.plaat, this.lijn, this.waaier, this.boog]);
        if (rand) {
          /* De klok van Bliepo: een zachte stippelrand (geen rood: niets is "fout" in rood). */
          const r = sc.add.graphics();
          r.lineStyle(6, rand, 0.9);
          for (let a = 0; a < 360; a += 10) {
            r.beginPath();
            r.arc(0, 0, R + 14, graad(a - 90), graad(a - 90 + 6));
            r.strokePath();
          }
          this.box.add(r);
        }
        for (let n = 1; n <= 12; n++) {
          const q = op(n * 30, STER);
          const g = op(n * 30, CIJFER);
          this.sterren.push(p("sk-ster-g", q.x, q.y));
          this.getallen.push(p(`sk-n${n}-g`, g.x, g.y));
        }
        this.box.add([...this.sterren, ...this.getallen]);
        this.pijl = sc.add.graphics();
        this.vlag = p("sk-vlag-g").setVisible(false);
        this.driehoek = p("sk-driehoek-g").setVisible(false);
        this.pilMin = p("sk-pil-min").setTint(MINKLEUR).setAlpha(0);
        this.min = p("sk-min-g");
        this.pilUur = p("sk-pil-uur").setTint(UURKLEUR).setAlpha(0);
        this.uur = p("sk-uur-g");
        this.greep = p("sk-greep-g").setVisible(false);
        this.midden = p("sk-midden-g");
        this.box.add([this.pijl, this.vlag, this.driehoek, this.pilMin, this.min, this.pilUur, this.uur, this.greep, this.midden]);
      }

      /** De wijzers op deze hoeken (graden vanaf de 12). */
      hoeken(u: number, m: number) {
        this.u = u;
        this.m = m;
        this.uur.setRotation(graad(u));
        this.pilUur.setRotation(graad(u));
        this.min.setRotation(graad(m));
        this.pilMin.setRotation(graad(m));
        const t = op(u, UUR_LANG - 6);
        this.greep.setPosition(t.x, t.y);
        if (this.inkleur) this.tekenWaaier();
        if (this.boogStand) this.tekenBoog();
      }

      tekenWaaier() {
        const w = this.waaier;
        w.clear();
        if (!this.inkleur || this.vorm !== "klok") return;
        const veeg = mod(this.m, 360);
        if (veeg < 0.5) return;
        const r = 0.9 * R;
        w.fillStyle(MINKLEUR, 0.26);
        if (veeg > 359.5) w.fillCircle(0, 0, r);
        else {
          w.slice(0, 0, r, graad(-90), graad(-90 + veeg), false);
          w.fillPath();
          w.lineStyle(3, 0xe6d8ff, 0.7);
          w.beginPath();
          w.arc(0, 0, r, graad(-90), graad(-90 + veeg), false);
          w.strokePath();
        }
      }

      /** De tijdboog langs de rand: van `van` tot waar de minutenwijzer nu staat, per `stap` minuten een andere tint. */
      tekenBoog() {
        const g = this.boog;
        g.clear();
        this.boogTekst.forEach((t) => t.destroy());
        this.boogTekst = [];
        const b = this.boogStand;
        if (!b || this.vorm !== "klok") return;
        const nu = this.m / 6;
        const lang = Math.max(0, nu - b.van);
        const grenzen = [0];
        if (b.delen?.length) {
          let som = 0;
          for (const d of b.delen) {
            som += d;
            if (som < lang - 0.01) grenzen.push(som);
          }
        } else for (let x = b.stap ?? 5; x < lang - 0.01; x += b.stap ?? 5) grenzen.push(x);
        grenzen.push(lang);
        const ri = 0.885 * R;
        const ro = R - 2;
        for (let i = 0; i + 1 < grenzen.length; i++) {
          const a1 = graad((b.van + grenzen[i]) * 6 - 90);
          const a2 = graad((b.van + grenzen[i + 1]) * 6 - 90);
          if (a2 - a1 < 0.001) continue;
          g.fillStyle(i % 2 === 0 ? 0xe6d8fa : 0xb48cff, i % 2 === 0 ? 0.55 : 0.7);
          g.beginPath();
          g.arc(0, 0, ro, a1, a2, false);
          g.arc(0, 0, ri, a2, a1, true);
          g.closePath();
          g.fillPath();
        }
        /* De getallen 0, 5, 10 … buiten de klok (of het aantal minuten per deel). */
        if (b.delen?.length) {
          let begin = 0;
          for (const d of b.delen.concat([Infinity])) {
            const eind = Math.min(begin + d, lang);
            const n = Math.round(eind - begin);
            if (eind - begin >= 0.99 && this.sc.textures.exists(`sk-b${n}-g`)) {
              const q = op((b.van + (begin + eind) / 2) * 6, R + 36);
              this.boogTekst.push(this.sc.plaats(`sk-b${n}-g`, q.x, q.y));
            }
            begin += d;
            if (begin >= lang) break;
          }
        } else {
          for (let x = 0; x <= lang + 0.01; x += b.stap ?? 5) {
            if (!this.sc.textures.exists(`sk-b${x}-g`)) continue;
            const q = op((b.van + x) * 6, R + 36);
            this.boogTekst.push(this.sc.plaats(`sk-b${x}-g`, q.x, q.y));
          }
        }
        this.box.addAt(this.boogTekst, this.box.getIndex(this.pijl));
      }

      /** Van een rechte getallenlijn naar een klok (of terug), rustig in ruim een seconde. */
      zetVorm(vorm: "klok" | "lijn", meteen = false) {
        if (vorm === this.vorm && !meteen) return;
        this.vorm = vorm;
        const klok = vorm === "klok";
        const duur = meteen || rustig ? 0 : 1100;
        const zet = (o: Img, x: number, y: number) =>
          duur ? this.sc.tweens.add({ targets: o, x, y, duration: duur, ease: "Cubic.easeInOut" }) : o.setPosition(x, y);
        for (let n = 1; n <= 12; n++) {
          const ster = klok ? op(n * 30, STER) : lijnplek(n);
          const getal = klok ? op(n * 30, CIJFER) : { x: lijnplek(n).x, y: LIJN_Y + 52 };
          zet(this.sterren[n - 1], ster.x, ster.y);
          zet(this.getallen[n - 1], getal.x, getal.y);
        }
        const vervaag = (o: Img | Gfx, a: number) => (duur ? this.sc.tweens.add({ targets: o, alpha: a, duration: 800 }) : o.setAlpha(a));
        vervaag(this.plaat, klok ? 1 : 0);
        vervaag(this.lijn, klok ? 0 : 1);
        this.tekenWaaier();
        this.tekenBoog();
      }

      zetRing(n: number | null) {
        if (n === this.ringN) return;
        this.ringN = n;
        this.ring?.destroy();
        this.ring = null;
        if (n == null || this.vorm !== "klok") return;
        const q = op(n * 30, CIJFER);
        this.ring = this.sc.selectieRing(q.x, q.y, 36, WARM);
        this.box.addAt(this.ring, this.box.getIndex(this.pijl));
      }

      zetDriehoek(n: number | null) {
        if (n == null) {
          this.driehoek.setVisible(false);
          return;
        }
        const q = op(n * 30, R + 34);
        this.driehoek.setVisible(true).setPosition(q.x, q.y).setRotation(graad(n * 30));
      }

      zetVlag(t: number | null) {
        if (t == null) {
          this.vlag.setVisible(false);
          return;
        }
        const h = mod(t, 60) * 6;
        const q = op(h, R + 2);
        this.vlag.setVisible(true).setPosition(q.x, q.y).setRotation(graad(h));
      }

      /** Een gebogen lichtpijl van getal naar getal, in de draairichting (zacht roze = de verkeerde kant op). */
      zetPijl(p: KlokProps["pijl"]) {
        const g = this.pijl;
        g.clear();
        if (!p || this.vorm !== "klok") return;
        const stappen = mod(p.naar - p.van, 12);
        const kant = stappen <= 6 ? 1 : -1;
        const r = 0.58 * R;
        const a1 = p.van * 30 + kant * 8;
        const a2 = p.naar * 30 - kant * 8;
        const kleur = p.rood ? MISKLEUR : PIJLKLEUR;
        g.lineStyle(8, kleur, 1);
        g.beginPath();
        g.arc(0, 0, r, graad(a1 - 90), graad(a2 - 90), kant === -1);
        g.strokePath();
        /* De volle pijlpunt aan het eind, langs de cirkel in de draairichting. */
        const eind = op(a2, r);
        const t = { x: Math.cos(graad(a2)) * kant, y: Math.sin(graad(a2)) * kant };
        const n = { x: -t.y, y: t.x };
        g.fillStyle(kleur, 1);
        g.fillTriangle(
          eind.x + t.x * 16,
          eind.y + t.y * 16,
          eind.x - t.x * 6 + n.x * 14,
          eind.y - t.y * 6 + n.y * 14,
          eind.x - t.x * 6 - n.x * 14,
          eind.y - t.y * 6 - n.y * 14,
        );
      }

      wijzerStand(w: Img, pil: Img, stand: "fel" | "flets" | "weg", zichtbaar: boolean, gemarkeerd: boolean) {
        const a = !zichtbaar || stand === "weg" ? 0 : stand === "flets" ? 0.32 : 1;
        this.sc.tweens.add({ targets: w, alpha: a, duration: rustig ? 1 : 350 });
        this.sc.tweens.add({ targets: pil, alpha: gemarkeerd && a > 0 ? 0.55 : 0, duration: rustig ? 1 : 300 });
      }
    }

    class Klok extends Basis implements KlokScene {
      meldNaar: (g: Vlakgebeurtenis) => void = () => {};
      opTijd: ((tijd: number) => void) | null = null;
      regels: Regels = { vorm: "klok" };
      plaat!: Plaat;
      tweede: Plaat | null = null;
      totaal = begintijd;
      tweedeTijd = 0;
      anim: import("phaser").Tweens.Tween | null = null;
      gekozen: Wijzer | null = null;
      beeld: Beeld | null = null;
      sleep: { wijzer: Wijzer; x: number; y: number; bewogen: boolean; id: number } | null = null;
      tik: { n: number; x: number; y: number; id: number } | null = null;

      constructor() {
        super("sterrenklok");
      }

      zetBediening(meld: (g: Vlakgebeurtenis) => void, regels: Regels) {
        this.meldNaar = meld;
        this.regels = regels;
      }

      zetOpTijd(f: ((tijd: number) => void) | null) {
        this.opTijd = f;
        f?.(this.totaal);
      }

      /* ---------- plaatjes, één keer getekend en gebakken ---------- */

      maak() {
        const S = 2 * R + 20;
        this.canvasPlaatje("sk-plaat", S, S, (c) => {
          const m = S / 2;
          const g = c.createRadialGradient(m, m, R * 0.1, m, m, R);
          g.addColorStop(0, "rgba(70,50,160,0.22)");
          g.addColorStop(1, "rgba(40,24,110,0.42)");
          c.fillStyle = g;
          c.beginPath();
          c.arc(m, m, R, 0, Math.PI * 2);
          c.fill();
          c.strokeStyle = "rgba(225,210,255,0.95)";
          c.lineWidth = 3.5;
          c.stroke();
          c.strokeStyle = "rgba(200,180,255,0.22)";
          c.lineWidth = 2;
          c.beginPath();
          c.arc(m, m, 0.86 * R, 0, Math.PI * 2);
          c.stroke();
          /* De minuutstreepjes: 4 tussen elke twee sterren, goed te tellen. */
          c.strokeStyle = "rgba(230,220,255,0.75)";
          c.lineWidth = 2.4;
          c.lineCap = "round";
          for (let i = 0; i < 60; i++) {
            if (i % 5 === 0) continue;
            const a = op(i * 6, 0.955 * R);
            const b = op(i * 6, 0.9 * R);
            c.beginPath();
            c.moveTo(m + a.x, m + a.y);
            c.lineTo(m + b.x, m + b.y);
            c.stroke();
          }
        });
        this.bak("sk-plaat", "sk-plaat-g", LILA);

        this.canvasPlaatje("sk-lijn", 880, 16, (c) => {
          c.strokeStyle = "rgba(235,225,255,0.95)";
          c.lineWidth = 4;
          c.lineCap = "round";
          c.beginPath();
          c.moveTo(6, 8);
          c.lineTo(874, 8);
          c.stroke();
        });
        this.bak("sk-lijn", "sk-lijn-g", LILA);

        const ster = (c: CanvasRenderingContext2D, m: number, ro: number, ri: number, binnen: string, buiten: string) => {
          const g = c.createRadialGradient(m, m, 1, m, m, ro);
          g.addColorStop(0, binnen);
          g.addColorStop(1, buiten);
          c.fillStyle = g;
          c.beginPath();
          for (let i = 0; i < 10; i++) {
            const r = i % 2 === 0 ? ro : ri;
            const a = (i * Math.PI) / 5 - Math.PI / 2;
            c.lineTo(m + Math.cos(a) * r, m + Math.sin(a) * r);
          }
          c.closePath();
          c.fill();
        };
        this.canvasPlaatje("sk-ster", 32, 32, (c) => ster(c, 16, 14, 6, "#ffffff", "#cdb8ff"));
        this.bak("sk-ster", "sk-ster-g", LILA);
        this.canvasPlaatje("sk-greep", 46, 46, (c) => ster(c, 23, 21, 9, "#ffffff", "#ffc06a"));
        this.bak("sk-greep", "sk-greep-g", WARM);

        this.canvasPlaatje("sk-midden", 30, 30, (c) => {
          c.fillStyle = "#ffffff";
          c.beginPath();
          c.arc(15, 15, 9, 0, Math.PI * 2);
          c.fill();
          c.strokeStyle = "#cdb8ff";
          c.lineWidth = 3;
          c.stroke();
        });
        this.bak("sk-midden", "sk-midden-g", LILA);

        /* De wijzers: een lichtstraal vanuit het midden naar boven (het plaatje is symmetrisch, het draaipunt is het midden). */
        const straal = (sl: string, lang: number, dik: number, punt: number, kern: string, rand: string) => {
          const b = dik + 8;
          const h = 2 * lang + 8;
          this.canvasPlaatje(sl, b, h, (c) => {
            const m = b / 2;
            const v = h / 2;
            const g = c.createLinearGradient(0, v, 0, v - lang);
            g.addColorStop(0, rand);
            g.addColorStop(0.5, kern);
            g.addColorStop(1, rand);
            c.fillStyle = g;
            c.beginPath();
            c.moveTo(m - dik / 2, v + dik * 0.3);
            c.lineTo(m - punt / 2, v - lang + punt / 2);
            c.arc(m, v - lang + punt / 2, punt / 2, Math.PI, 0);
            c.lineTo(m + dik / 2, v + dik * 0.3);
            c.closePath();
            c.fill();
            /* Een dun licht lijntje in het midden: de hologram-glans. */
            c.strokeStyle = "rgba(255,255,255,0.7)";
            c.lineWidth = 2;
            c.lineCap = "round";
            c.beginPath();
            c.moveTo(m, v - 4);
            c.lineTo(m, v - lang + punt);
            c.stroke();
          });
        };
        straal("sk-uur", UUR_LANG, 24, 15, "#ffd09a", "#ff8f2e");
        this.bak("sk-uur", "sk-uur-g", UURKLEUR);
        straal("sk-min", MIN_LANG, 14, 9, "#e3d4ff", "#9a6bff");
        this.bak("sk-min", "sk-min-g", MINKLEUR);

        /* De "pil" om een wijzer: daar gaat het nu om (kleur via tint). */
        const pil = (sl: string, lang: number, dik: number) => {
          const b = dik + 4;
          const h = 2 * lang + 4;
          this.canvasPlaatje(sl, b, h, (c) => {
            const m = b / 2;
            const v = h / 2;
            c.fillStyle = "rgba(255,255,255,0.32)";
            c.strokeStyle = "rgba(255,255,255,0.9)";
            c.lineWidth = 2.5;
            c.beginPath();
            c.roundRect(m - dik / 2, v - lang, dik, lang + dik * 0.6, dik / 2);
            c.fill();
            c.stroke();
          });
        };
        pil("sk-pil-uur", UUR_LANG + 16, 54);
        pil("sk-pil-min", MIN_LANG + 14, 40);

        this.canvasPlaatje("sk-driehoek", 40, 36, (c) => {
          c.fillStyle = "#9ff0ff";
          c.beginPath();
          c.moveTo(20, 32);
          c.lineTo(3, 4);
          c.lineTo(37, 4);
          c.closePath();
          c.fill();
        });
        this.bak("sk-driehoek", "sk-driehoek-g", PIJLKLEUR);

        /* Het vlaggetje: hier begon het. De stok van de rand naar buiten (symmetrisch plaatje, het midden = de rand). */
        this.canvasPlaatje("sk-vlag", 44, 96, (c) => {
          c.strokeStyle = "#8fc4ff";
          c.lineWidth = 5;
          c.lineCap = "round";
          c.beginPath();
          c.moveTo(22, 60);
          c.lineTo(22, 6);
          c.stroke();
          c.fillStyle = "#8fc4ff";
          c.beginPath();
          c.moveTo(22, 4);
          c.lineTo(4, 12);
          c.lineTo(22, 21);
          c.closePath();
          c.fill();
        });
        this.bak("sk-vlag", "sk-vlag-g", 0x8fc4ff);

        this.tekenGetallen();

        this.plaat = new Plaat(this, ENKEL);
        this.plaat.hoeken(begintijd * 0.5, begintijd * 6);
        this.tover(this.plaat.box);

        this.input.on("pointerdown", (p: import("phaser").Input.Pointer) => this.neer(p));
        this.input.on("pointermove", (p: import("phaser").Input.Pointer) => this.beweegMuis(p));
        this.input.on("pointerup", (p: import("phaser").Input.Pointer) => this.los(p));
        this.input.on("pointerupoutside", (p: import("phaser").Input.Pointer) => this.los(p));
      }

      /** De getallen 1–12 en de boogtekst (0, 5, 10 …) als scherpe plaatjes in het lettertype van de les. */
      tekenGetallen() {
        const font = lettertype();
        const teken = (sl: string, tekst: string, maat: number, kleur: string) => {
          this.canvasPlaatje(sl, 76, 60, (c) => {
            c.font = `700 ${maat}px ${font}`;
            c.textAlign = "center";
            c.textBaseline = "middle";
            c.fillStyle = kleur;
            c.fillText(tekst, 38, 32);
          });
          this.bak(sl, `${sl}-g`, LILA);
        };
        for (let n = 1; n <= 12; n++) teken(`sk-n${n}`, String(n), 44, "#ffffff");
        for (let x = 0; x <= 60; x += 5) teken(`sk-b${x}`, String(x), 26, "#e3d4ff");
      }

      /* ---------- de tijd ---------- */

      tijdNu() {
        return this.totaal;
      }

      naar(tijd: number, draai: boolean) {
        this.sleep = null;
        this.animeer(tijd, draai ? "draai" : "spring");
      }

      animeer(naar: number, soort: "draai" | "spring", klaar?: () => void) {
        this.anim?.stop();
        this.anim = null;
        const pl = this.plaat;
        const van = { u: pl.u, m: pl.m };
        const verschil = naar - this.totaal;
        const eind =
          soort === "draai"
            ? { u: van.u + verschil * 0.5, m: van.m + verschil * 6 }
            : { u: van.u + kortst(van.u, naar * 0.5), m: van.m + kortst(van.m, naar * 6) };
        this.totaal = naar;
        const stil = Math.abs(eind.u - van.u) < 0.01 && Math.abs(eind.m - van.m) < 0.01;
        const duur = rustig || stil ? 0 : soort === "draai" ? draaiduur(verschil) : 450;
        const af = () => {
          /* Na een sprong staan de wijzers goed, maar soms een rondje verschoven; recht zetten (je ziet geen verschil). */
          if (soort === "spring") pl.hoeken(naar * 0.5, naar * 6);
          this.opTijd?.(naar);
          klaar?.();
        };
        if (!duur) {
          pl.hoeken(eind.u, eind.m);
          af();
          return;
        }
        this.anim = this.tweens.addCounter({
          from: 0,
          to: 1,
          duration: duur,
          ease: "Quad.easeInOut",
          onUpdate: (tw) => {
            const e = tw.getValue() ?? 0;
            pl.hoeken(van.u + (eind.u - van.u) * e, van.m + (eind.m - van.m) * e);
            this.opTijd?.(van.m / 6 + ((eind.m - van.m) / 6) * e);
          },
          onComplete: () => {
            this.anim = null;
            af();
          },
        });
      }

      gezet(naar: number, soort: "draai" | "spring", wijzer: Wijzer) {
        this.animeer(naar, soort, () => this.meldNaar({ soort: "gezet", tijd: naar, wijzer }));
      }

      binnenGrens(t: number) {
        const g = this.regels.grens;
        return g ? Math.max(g.van, Math.min(g.tot, t)) : t;
      }

      /* ---------- wat er te zien is ---------- */

      zetVorm(vorm: "klok" | "lijn") {
        this.plaat.zetVorm(vorm);
        if (this.beeld) this.zetBeeld(this.beeld);
      }

      zetBeeld(b: Beeld) {
        this.beeld = b;
        const pl = this.plaat;
        const klok = pl.vorm === "klok";
        const metWijzers = klok && b.wijzers;
        const r = this.regels;
        const gekozen = r.actief && r.beweegbaar ? this.gekozen : null;
        pl.wijzerStand(pl.uur, pl.pilUur, b.uurwijzer, metWijzers, b.pil === "uur" || gekozen === "uur");
        pl.wijzerStand(pl.min, pl.pilMin, b.minuutwijzer, metWijzers, b.pil === "minuut" || gekozen === "minuut");
        this.tweens.add({ targets: pl.midden, alpha: metWijzers ? 1 : 0, duration: rustig ? 1 : 500 });
        /* Het sterretje aan de punt van de urenwijzer: hier kun je hem pakken. */
        const greep = metWijzers && b.uurwijzer !== "weg" && !!r.actief && (r.beweegbaar === "uur" || r.beweegbaar === "beide");
        pl.greep.setVisible(greep);
        pl.zetRing(klok ? b.ring : null);
        pl.zetDriehoek(klok ? b.driehoek : null);
        pl.zetPijl(b.pijl);
        pl.zetVlag(klok ? b.vlag : null);
        if (pl.inkleur !== b.inkleur) {
          pl.inkleur = b.inkleur;
          pl.tekenWaaier();
        }
        if (JSON.stringify(pl.boogStand) !== JSON.stringify(b.boog)) {
          pl.boogStand = b.boog;
          pl.tekenBoog();
        }
      }

      zetTweede(t: { tijd: number } | null) {
        const doel = t ? LINKS : ENKEL;
        const pl = this.plaat;
        if (pl.box.x !== doel.x || pl.box.scaleX !== doel.k) {
          this.tweens.add({ targets: pl.box, x: doel.x, y: doel.y, scale: doel.k, duration: rustig ? 1 : 600, ease: "Cubic.easeInOut" });
        }
        if (!t) {
          const weg = this.tweede;
          this.tweede = null;
          if (weg) this.verdwijn(weg.box);
          return;
        }
        if (!this.tweede) {
          this.tweede = new Plaat(this, RECHTS, MISKLEUR);
          this.tweede.hoeken(mod(t.tijd * 0.5, 360), mod(t.tijd * 6, 360));
          this.tweedeTijd = t.tijd;
          this.tover(this.tweede.box, { vertraging: 300 });
          return;
        }
        if (t.tijd === this.tweedeTijd) return;
        /* Bliepo zet zijn wijzers rustig goed. */
        const tw = this.tweede;
        const van = { u: tw.u, m: tw.m };
        const eind = { u: van.u + kortst(van.u, t.tijd * 0.5), m: van.m + kortst(van.m, t.tijd * 6) };
        this.tweedeTijd = t.tijd;
        this.tweens.addCounter({
          from: 0,
          to: 1,
          duration: rustig ? 1 : 1200,
          ease: "Sine.easeInOut",
          onUpdate: (x) => {
            const e = x.getValue() ?? 0;
            tw.hoeken(van.u + (eind.u - van.u) * e, van.m + (eind.m - van.m) * e);
          },
        });
      }

      goedGolf() {
        const b = this.plaat.box;
        this.golf(b.x, b.y, GOED);
        /* Een kring van licht loopt één keer rond de klok. */
        const kring = this.plaats("holo-ring", b.x, b.y).setScale((R * b.scaleX) / 98 / TX).setTint(GOED).setAlpha(0);
        this.tweens.add({
          targets: kring,
          alpha: { from: this.gloed.flits, to: 0 },
          scale: ((R + 40) * b.scaleX) / 98 / TX,
          duration: rustig ? 1 : 700,
          ease: "Cubic.easeOut",
          onComplete: () => kring.destroy(),
        });
      }

      /* ---------- bediening ---------- */

      /**
       * Waar de vinger is, in punten van het vlak. Zelf uitgerekend uit de
       * plek van het canvas op de pagina: het lesscherm schaalt het hele vlak
       * met CSS, en dat ziet Phaser zelf niet altijd.
       */
      vlakpunt(p: import("phaser").Input.Pointer) {
        const e = p.event as { clientX?: number; clientY?: number; changedTouches?: TouchList } | undefined;
        const aanraking = e?.changedTouches?.[0];
        const cx = aanraking?.clientX ?? e?.clientX;
        const cy = aanraking?.clientY ?? e?.clientY;
        const r = this.game.canvas.getBoundingClientRect();
        if (cx === undefined || cy === undefined || !r.width) return { x: p.worldX, y: p.worldY, sx: p.x, sy: p.y };
        return { x: ((cx - r.left) * 980) / r.width, y: ((cy - r.top) * 720) / r.height, sx: cx, sy: cy };
      }

      lokaal(p: import("phaser").Input.Pointer) {
        const b = this.plaat.box;
        const q = this.vlakpunt(p);
        return { x: (q.x - b.x) / b.scaleX, y: (q.y - b.y) / b.scaleY };
      }

      /** Welk getal hoort bij deze plek: op de klok de taartpunt (buiten het grijpvlak), op de lijn het dichtstbijzijnde getal. */
      getalBij(x: number, y: number): number | null {
        if (this.plaat.vorm === "lijn") {
          if (Math.abs(y - LIJN_Y - 26) > 70 || Math.abs(x) > 450) return null;
          return Math.max(1, Math.min(12, Math.round(((x + 400) * 11) / 800) + 1));
        }
        const r = Math.hypot(x, y);
        if (r < GRIJP || r > R + 40) return null;
        const hoek = mod((Math.atan2(x, -y) * 180) / Math.PI, 360);
        return mod(Math.round(hoek / 30), 12) || 12;
      }

      magGrijpen(w: Wijzer) {
        const r = this.regels;
        const b = this.beeld;
        if (!r.actief || !b || this.plaat.vorm !== "klok" || !b.wijzers) return false;
        if ((w === "uur" ? b.uurwijzer : b.minuutwijzer) === "weg") return false;
        return r.beweegbaar === "beide" || r.beweegbaar === w;
      }

      /** Welke wijzer je hier pakt (binnen het grijpvlak, de wijzer het dichtst bij je vinger). */
      wijzerBij(x: number, y: number): Wijzer | null {
        const r = Math.hypot(x, y);
        if (r > GRIJP + 6) return null;
        const hoek = mod((Math.atan2(x, -y) * 180) / Math.PI, 360);
        const kandidaten = (["uur", "minuut"] as Wijzer[])
          .filter((w) => this.magGrijpen(w))
          .map((w) => ({ w, af: Math.abs(kortst(hoek, w === "uur" ? this.plaat.u : this.plaat.m)) }))
          .filter((k) => k.af < (r < 40 ? 180 : 28))
          .sort((a, b) => a.af - b.af);
        return kandidaten[0]?.w ?? null;
      }

      neer(p: import("phaser").Input.Pointer) {
        const { x, y } = this.lokaal(p);
        const w = this.wijzerBij(x, y);
        if (w) {
          this.anim?.stop();
          this.anim = null;
          const q = this.vlakpunt(p);
          this.sleep = { wijzer: w, x: q.sx, y: q.sy, bewogen: false, id: p.id };
          this.zetCursor("grabbing");
          return;
        }
        const n = this.getalBij(x, y);
        if (n !== null && this.getallenTikbaar()) {
          const q = this.vlakpunt(p);
          this.tik = { n, x: q.sx, y: q.sy, id: p.id };
        }
      }

      getallenTikbaar() {
        const r = this.regels;
        return !!r.actief && (!!r.tikGetal || !!r.beweegbaar);
      }

      beweegMuis(p: import("phaser").Input.Pointer) {
        const sl = this.sleep;
        if (!sl || sl.id !== p.id) {
          if (!p.isDown) {
            const { x, y } = this.lokaal(p);
            this.zetCursor(this.wijzerBij(x, y) ? "grab" : this.getallenTikbaar() && this.getalBij(x, y) !== null ? "pointer" : "default");
          }
          return;
        }
        const q = this.vlakpunt(p);
        if (!sl.bewogen && Math.hypot(q.sx - sl.x, q.sy - sl.y) < 8) return;
        sl.bewogen = true;
        const { x, y } = this.lokaal(p);
        const a = mod((Math.atan2(x, -y) * 180) / Math.PI, 360);
        const pl = this.plaat;
        if (sl.wijzer === "minuut") {
          const nu = this.totaal;
          const naar = this.binnenGrens(nu + kortst(mod(nu * 6, 360), a) / 6);
          this.totaal = naar;
          pl.hoeken(naar * 0.5, naar * 6);
          this.opTijd?.(naar);
        } else pl.hoeken(a, pl.m);
      }

      los(p: import("phaser").Input.Pointer) {
        const tik = this.tik;
        this.tik = null;
        const q = this.vlakpunt(p);
        if (tik && tik.id === p.id && Math.hypot(q.sx - tik.x, q.sy - tik.y) < 14) {
          this.opGetal(tik.n);
          return;
        }
        const sl = this.sleep;
        if (!sl || sl.id !== p.id) return;
        this.sleep = null;
        this.zetCursor("grab");
        this.gekozen = sl.wijzer;
        if (this.beeld) this.zetBeeld(this.beeld);
        if (!sl.bewogen) return; /* Een tik op een wijzer kiest hem; daarna tikt het kind op de plek. */
        const nu = this.totaal;
        if (sl.wijzer === "minuut") {
          /* Op het dichtstbijzijnde getal: hele vijf minuten. */
          this.gezet(this.binnenGrens(Math.round(nu / 5) * 5), "spring", "minuut");
        } else {
          const minuut = this.regels.beweegbaar === "uur" ? 0 : mod(nu, 60);
          const uur = mod(Math.round(this.plaat.u / 30 - minuut / 60), 12);
          this.gezet(uur * 60 + minuut, "spring", "uur");
        }
      }

      opGetal(n: number) {
        const r = this.regels;
        if (!r.actief) return;
        if (r.tikGetal) {
          this.meldNaar({ soort: "getal", n, tijd: this.totaal });
          return;
        }
        if (!r.beweegbaar) return;
        if (r.alleenGetal != null && n !== r.alleenGetal) {
          this.meldNaar({ soort: "mis", n, tijd: this.totaal });
          return;
        }
        const nu = this.totaal;
        const uur = Math.floor(mod(nu, 720) / 60);
        const minuut = mod(nu, 60);
        const wijzer: Wijzer | null = r.beweegbaar === "beide" ? this.gekozen : r.beweegbaar;
        if (!wijzer) {
          this.por();
          return;
        }
        /* Het getal licht even op waar de wijzer heen gaat. */
        const q = op(n * 30, CIJFER);
        const b = this.plaat.box;
        this.golf(b.x + q.x * b.scaleX, b.y + q.y * b.scaleY, WARM);
        if (wijzer === "uur") {
          this.gezet((n % 12) * 60 + (r.beweegbaar === "uur" ? 0 : minuut), "spring", "uur");
        } else if (r.beweegbaar === "beide") {
          /* Het uur blijft hetzelfde; de urenwijzer schuift binnen zijn uur mee. */
          this.gezet(uur * 60 + (n % 12) * 5, "spring", "minuut");
        } else {
          /* Alleen de minutenwijzer: altijd vooruit, zoals een echte klok, en de urenwijzer draait mee. */
          let naar = Math.floor(nu / 60) * 60 + (n % 12) * 5;
          if (naar <= nu) naar += 60;
          const g = r.grens;
          if (r.klem && naar - nu >= 60) naar = nu;
          else if (g && naar > g.tot) naar = r.klem ? g.tot : naar - 60;
          this.gezet(this.binnenGrens(naar), "draai", "minuut");
        }
      }

      /** Op een getal getikt zonder dat er een wijzer gekozen is: beide wijzers lichten even op. */
      por() {
        const pl = this.plaat;
        for (const pil of [pl.pilUur, pl.pilMin]) {
          this.tweens.add({ targets: pil, alpha: { from: 0, to: 0.6 }, duration: rustig ? 1 : 300, yoyo: true, hold: 300 });
        }
      }

      zetCursor(c: string) {
        const el = this.game.canvas;
        if (el && el.style.cursor !== c) el.style.cursor = c;
      }

      /* ---------- voor de test en de vloeiendheidscontrole ---------- */

      getalPunt(n: number) {
        const b = this.plaat.box;
        const q = this.plaat.vorm === "lijn" ? { x: lijnplek(n).x, y: LIJN_Y + 52 } : op(n * 30, CIJFER);
        return { x: b.x + q.x * b.scaleX, y: b.y + q.y * b.scaleY };
      }

      wijzerPunt(w: Wijzer) {
        const b = this.plaat.box;
        const q = op(w === "uur" ? this.plaat.u : this.plaat.m, w === "uur" ? UUR_LANG - 10 : GRIJP - 20);
        return { x: b.x + q.x * b.scaleX, y: b.y + q.y * b.scaleY };
      }

      demo(ms: number) {
        const eind = performance.now() + ms;
        this.plaat.inkleur = true;
        let t = this.totaal;
        const stap = () => {
          if (performance.now() > eind) {
            this.plaat.inkleur = false;
            this.plaat.tekenWaaier();
            return;
          }
          t += 15;
          this.animeer(t, "draai");
          this.time.delayedCall(500, () => this.goedGolf());
          this.time.delayedCall(950, stap);
        };
        stap();
      }
    }
    return Klok as unknown as new () => import("phaser").Scene;
  };
}

/* ---------- het vlak ---------- */

const tweeCijfers = (n: number) => String(n).padStart(2, "0");

/** Het lettertype van de les (voor de getallen op de klok, die als plaatje getekend worden). */
function lettertypeVanVlak() {
  const el = document.querySelector("[data-sterrenklok]");
  return el ? getComputedStyle(el).fontFamily : "system-ui, sans-serif";
}

export function Sterrenklok(props: SterrenklokProps & Vlakbasis) {
  const {
    stand,
    vorm = "klok",
    wijzers = true,
    uurwijzer = "fel",
    minuutwijzer = "fel",
    pil = null,
    ring = null,
    driehoek = null,
    pijl = null,
    inkleur = false,
    tweede = null,
    actief = false,
    beweegbaar = null,
    alleenGetal = null,
    grens = null,
    controle = false,
    tikGetal = false,
    klem = false,
    boog = null,
    vlag = null,
    digitaal = false,
    doel = null,
    goed = 0,
    meld,
    schaal,
  } = props;

  const vlak = useRef<HTMLDivElement>(null);
  const { plek, scene } = useHoloMotor<KlokScene>(
    schaal,
    maakKlokScene(lettertypeVanVlak, stand.tijd),
    { invoer: true },
  );
  const meldRef = useRef(meld);
  const uurVak = useRef<HTMLSpanElement>(null);
  const minVak = useRef<HTMLSpanElement>(null);
  const vorigeStand = useRef<typeof stand | null>(null);
  const vorigGoed = useRef(goed);

  useEffect(() => {
    meldRef.current = meld;
  });

  /* De regels voor tikken en slepen, en waar de scène haar meldingen heen stuurt. */
  useEffect(() => {
    scene?.zetBediening((g) => meldRef.current(g), { actief, beweegbaar, alleenGetal, grens, klem, tikGetal, vorm });
  });

  /* De digitale tijd onder de klok loopt mee met de wijzers (zonder React bij elk beeld). */
  useEffect(() => {
    scene?.zetOpTijd(
      digitaal
        ? (t) => {
            const m = mod(Math.round(t), 60);
            const u = Math.floor(mod(Math.round(t), 720) / 60) || 12;
            if (uurVak.current) uurVak.current.textContent = String(u);
            if (minVak.current) minVak.current.textContent = tweeCijfers(m);
          }
        : null,
    );
  }, [scene, digitaal]);

  useEffect(() => {
    if (!scene || stand === vorigeStand.current) return;
    const eerste = vorigeStand.current === null;
    vorigeStand.current = stand;
    /* De eerste keer meteen op de tijd (die kan al veranderd zijn terwijl Phaser nog laadde). */
    scene.naar(stand.tijd, !eerste && !!stand.draai);
  }, [scene, stand]);

  useEffect(() => {
    scene?.zetVorm(vorm);
  }, [scene, vorm]);

  useEffect(() => {
    scene?.zetBeeld({ wijzers, uurwijzer, minuutwijzer, pil, ring, driehoek, pijl, inkleur, boog, vlag });
  }, [scene, wijzers, uurwijzer, minuutwijzer, pil, ring, driehoek, pijl, inkleur, boog, vlag, actief, beweegbaar]);

  useEffect(() => {
    scene?.zetTweede(tweede ? { tijd: tweede.tijd } : null);
  }, [scene, tweede]);

  useEffect(() => {
    if (!scene || goed === vorigGoed.current) return;
    vorigGoed.current = goed;
    scene.goedGolf();
  }, [scene, goed]);

  /* Voor de automatische test: waar de getallen en wijzers op de pagina staan. */
  useEffect(() => {
    if (!scene) return;
    const naarPagina = (q: { x: number; y: number }) => {
      const r = vlak.current?.getBoundingClientRect();
      if (!r) return q;
      return { x: r.left + (q.x * r.width) / 980, y: r.top + (q.y * r.height) / 720 };
    };
    window.__phaser = {
      ...window.__phaser,
      klokGetal: (n: number) => naarPagina(scene.getalPunt(n)),
      klokWijzer: (w: Wijzer) => naarPagina(scene.wijzerPunt(w)),
      klokTijd: () => scene.tijdNu(),
    };
  }, [scene]);

  const geo = tweede ? LINKS : ENKEL;
  const onder = geo.y + R * geo.k;

  return (
    <div ref={vlak} className={s.vlak} data-sterrenklok>
      <div ref={plek} style={HOLO_CANVAS} aria-hidden />

      {doel && (
        <div className={s.doel} aria-live="polite">
          {doel}
        </div>
      )}

      {tweede && (
        <div className={s.naam} style={{ left: RECHTS.x, top: RECHTS.y + R * RECHTS.k + 26 }}>
          {tweede.naam}
        </div>
      )}

      {digitaal && vorm === "klok" && (
        <div className={s.digitaal} style={{ left: geo.x, top: onder + 22 }} aria-hidden>
          <span ref={uurVak} className={s.uur} />
          <span className={s.dubbelpunt}>
            <i />
            <i />
          </span>
          <span ref={minVak} className={s.min} />
        </div>
      )}

      {actief && controle && (
        <div className={s.knoppen} style={{ left: digitaal ? geo.x + 230 : geo.x, top: onder + 16 }}>
          <IkoonKnop ikoon="vraag" label="Hulp" knop="klokhulp" onClick={() => meld({ soort: "hulp", tijd: scene?.tijdNu() ?? stand.tijd })} />
          <IkoonKnop ikoon="vink" label="Klaar" knop="klokcontrole" kleur="blauw" onClick={() => meld({ soort: "controle", tijd: scene?.tijdNu() ?? stand.tijd })} />
        </div>
      )}
    </div>
  );
}
