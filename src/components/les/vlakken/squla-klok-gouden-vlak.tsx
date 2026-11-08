"use client";

/**
 * Het speelvlak van de gouden klokles (squla-klok-hoelaat-1-gouden, 8 november 2026, BOUWREGELS hoofdstuk 15).
 *
 * Eén grote wijzerklok in Phaser (HARDE REGEL 7), in het uiterlijk van de klok uit de Squla-kloklessen (`Klokje` uit
 * klok-wijzerklok.tsx: witte plaat, zwarte getallen, oranje kleine wijzer, paarse grote wijzer, korte grote wijzer die de
 * getallen niet bedekt) met de glans en de zachte gloed van stijl B (BOUWREGELS 7.7). Het gedrag volgt het draaiboek
 * klokkijken (SYNTHESIS-ANALYSE/DRAAIBOEKEN.md §1.1): de klok rolt uit tot een getallenlijn en weer terug, een
 * driehoekje boven of onder, een blauwe pijl "met de klok mee", oplichten van een wijzer (een gloed langs zijn eigen
 * rand, BOUWREGELS 7.9; geen vlak of capsule eromheen), een ring om een getal (7.8e), een getal dat donker gekleurd
 * blijft staan (7.8d), getallen tikken en de kleine wijzer slepen.
 *
 * Opgebouwd naar het voorbeeld van de Bliepo-klok (klok-bliepo-klok.tsx), die zelf NIET is aangepast. Eigen tekening,
 * eigen code; niets van Synthesis overgenomen.
 *
 * Daarnaast het verhaal van de les (de bezorgbus, de zon, de maan, de bakkerij; uit squla-klok-hoelaat-1): een plaatje
 * links van de klok. Een ding dat het verhaal naspeelt staat stil tijdens de vraag en beweegt pas als `verhaal.speel`
 * omhoog gaat (na het antwoord, BOUWREGELS 1.22); zon, maan en bakkerij zijn een kleine, zachte sfeer-achtergrond.
 *
 * Meldingen: `getal` (tik op een getal, als `tikGetal`), `gezet` (de kleine wijzer is verzet, met `tijd`).
 * Schrijft niets naar de database.
 */

import { useEffect, useRef } from "react";
import type { Vlakbasis, Vlakgebeurtenis } from "../soort";
import { holoBasis } from "../holo/basis";
import { HOLO_CANVAS, useHoloMotor } from "../holo/motor";
import { voorwerpTextuur } from "../voorwerpen";
import s from "./klok-bliepo-klok.module.css";
import { speelLesgeluid } from "@/lib/lesgeluiden";

export type GoudenWijzer = "uur" | "minuut";
/** Hoe een ding het verhaal naspeelt (zelfde namen als in de oude les). */
export type GoudenNaspeel = "laden" | "rijden" | "wegrijden";

export type GoudenKlokProps = {
  /** De tijd in minuten vanaf 12 uur. Nieuw object = de klok gaat erheen; `draai`: rustig meedraaien. */
  stand: { tijd: number; draai?: boolean };
  vorm?: "klok" | "lijn";
  wijzers?: boolean;
  uurwijzer?: "fel" | "flets";
  minuutwijzer?: "fel" | "flets";
  /** Deze wijzer licht op (gloed langs zijn eigen rand, zacht pulserend). */
  licht?: GoudenWijzer | null;
  /** Een ring om dit getal, in de kleur van `ringWijzer`. */
  ring?: number | null;
  ringWijzer?: GoudenWijzer;
  ringPuls?: boolean;
  /** Dit getal blijft donker gekleurd staan (wat al genoemd is, BOUWREGELS 7.8d). */
  getalKleur?: { n: number; wijzer: GoudenWijzer } | null;
  /** Het blauwe driehoekje bij dit getal (buiten de klok). */
  driehoek?: number | null;
  /** Een blauwe pijl langs de klok, van getal naar getal. */
  pijl?: { van: number; naar: number } | null;
  /** Getallen tikken meldt `getal` (zonder dat er iets verzet wordt). */
  tikGetal?: boolean;
  /** De kleine wijzer verzetten met tikken op een getal of slepen. */
  beweegbaar?: boolean;
  /** Alleen dit getal doet iets (de kleine stap na de derde fout). */
  alleenGetal?: number | null;
  actief?: boolean;
  /** Ophogen = een rustige lichtgolf om de klok (goed). */
  goed?: number;
  /** Ophogen = de grote wijzer draait één keer rond, de tijd blijft gelijk. */
  rondje?: number;
  /** De opdracht groot bovenaan ("Ga naar de 2."). */
  doel?: string | null;
  /** Het verhaal: een plaatje links van de klok (`naast`) of een zachte sfeer-achtergrond. */
  verhaal?: { naam: string; plek: "naast" | "hoog" | "laag" | "sfeer"; naspeel?: GoudenNaspeel; speel: number } | null;
  /**
   * Het hulphandje (BOUWREGELS 5.10, 6.10b): een getekend handje dat naar dit getal wijst (op de klok of op de
   * getallenlijn). Het tikt niet zelf: het kind doet de laatste tik.
   */
  hand?: number | null;
};

/* ---------- maten (punten van het vlak, 980 × 720) ---------- */

const R = 215;
const CIJFER = 0.76 * R;
const MIN_LANG = 0.62 * R; /* kort: de grote wijzer bedekt de getallen nooit (Sara, 6 november 2026) */
const UUR_LANG = 0.48 * R;
const MIN_DIK = 0.046 * R;
const UUR_DIK = 0.076 * R;
const GRIJP = 0.6 * R;
const KX = 610;
const KY = 330;
const LIJN_Y = 0;

const UURKLEUR = "#c0620d";
const MINKLEUR = "#7c3fd6";
const UUR_GLOED = "#ff8a1f";
const MIN_GLOED = "#a05cff";
const RING_UUR = 0xef8a2a;
const RING_MIN = 0x9b6cf0;
const GETAL_UUR = "#b4520a";
const GETAL_MIN = "#5b2bb0";
const BLAUW = 0x4b9af5;

const graad = (g: number) => (g * Math.PI) / 180;
const mod = (n: number, m: number) => ((n % m) + m) % m;
const op = (hoek: number, r: number) => ({ x: Math.sin(graad(hoek)) * r, y: -Math.cos(graad(hoek)) * r });
const kortst = (van: number, naar: number) => ((((naar - van) % 360) + 540) % 360) - 180;
const lijnplek = (n: number) => ({ x: -310 + ((n - 1) * 620) / 11, y: LIJN_Y });
const draaiduur = (minuten: number) => Math.min(2600, 500 + Math.abs(minuten) * 2.2);

type Beeld = Required<Pick<GoudenKlokProps, "wijzers" | "uurwijzer" | "minuutwijzer" | "licht" | "ring" | "ringWijzer" | "ringPuls" | "getalKleur" | "driehoek" | "pijl" | "hand">>;
type Regels = { actief: boolean; tikGetal: boolean; beweegbaar: boolean; alleenGetal: number | null };

interface Scene {
  zetBediening(meld: (g: Vlakgebeurtenis) => void, r: Regels): void;
  naar(tijd: number, draai: boolean): void;
  zetVorm(v: "klok" | "lijn"): void;
  zetBeeld(b: Beeld): void;
  goedGolf(): void;
  rondje(): void;
  zetVerhaal(v: GoudenKlokProps["verhaal"]): void;
  tijdNu(): number;
  getalPunt(n: number): { x: number; y: number };
  wijzerPunt(w: GoudenWijzer): { x: number; y: number };
  gezet(naar: number): void;
}

type Img = import("phaser").GameObjects.Image;
type Gfx = import("phaser").GameObjects.Graphics;

function maakScene(lettertype: () => string, begintijd: number) {
  return (Phaser: typeof import("phaser"), rustig: boolean) => {
    const Basis = holoBasis(Phaser, rustig);

    class GoudenKlok extends Basis implements Scene {
      meldNaar: (g: Vlakgebeurtenis) => void = () => {};
      regels: Regels = { actief: false, tikGetal: false, beweegbaar: false, alleenGetal: null };
      box!: import("phaser").GameObjects.Container;
      plaat!: Img;
      streepjes!: Img;
      lijn!: Img;
      getallen: Img[] = [];
      uur!: Img;
      min!: Img;
      lichtUur!: Img;
      lichtMin!: Img;
      midden!: Img;
      driehoek!: Img;
      pijl!: Gfx;
      ring: Gfx | null = null;
      ringSleutel = "";
      kleurN: { n: number; wijzer: GoudenWijzer } | null = null;
      vorm: "klok" | "lijn" = "klok";
      u = 0;
      m = 0;
      totaal = begintijd;
      anim: import("phaser").Tweens.Tween | null = null;
      beeld: Beeld | null = null;
      sleep: { x: number; y: number; bewogen: boolean; id: number } | null = null;
      tik: { n: number; x: number; y: number; id: number } | null = null;
      verhaalBeeld: Img | null = null;
      verhaalSleutel = "";
      verhaalSpeel = 0;
      lichtTween: import("phaser").Tweens.Tween | null = null;
      lichtNu: GoudenWijzer | null = null;
      hand!: Img;
      handN: number | null = null;
      handVorm: "klok" | "lijn" = "klok";

      constructor() {
        super("goudenklok");
      }

      zetBediening(meld: (g: Vlakgebeurtenis) => void, r: Regels) {
        this.meldNaar = meld;
        this.regels = r;
      }

      /* ---------- plaatjes, één keer getekend ---------- */

      maak() {
        const S = 2 * R + 80;
        const m = S / 2;
        /* De plaat: wit, met een zachte schaduw eronder, de zachte gloed van stijl B en een glimmend lichtvlekje linksboven. */
        this.canvasPlaatje("gk-plaat", S, S, (c) => {
          c.save();
          c.shadowColor = "rgba(0,0,20,0.45)";
          c.shadowBlur = 22;
          c.shadowOffsetY = 8;
          c.fillStyle = "#ffffff";
          c.beginPath();
          c.arc(m, m, R, 0, Math.PI * 2);
          c.fill();
          c.restore();
          c.save();
          c.shadowColor = "rgba(210,235,255,0.9)";
          c.shadowBlur = 16;
          c.strokeStyle = "rgba(225,235,250,1)";
          c.lineWidth = 2;
          c.beginPath();
          c.arc(m, m, R - 1, 0, Math.PI * 2);
          c.stroke();
          c.restore();
          const glans = c.createLinearGradient(m - R, m - R, m + R, m + R);
          glans.addColorStop(0, "rgba(255,255,255,0)");
          glans.addColorStop(0.55, "rgba(255,255,255,0)");
          glans.addColorStop(1, "rgba(20,30,80,0.07)");
          c.fillStyle = glans;
          c.beginPath();
          c.arc(m, m, R, 0, Math.PI * 2);
          c.fill();
          const vlek = c.createRadialGradient(m - R * 0.45, m - R * 0.5, 0, m - R * 0.45, m - R * 0.5, R * 0.45);
          vlek.addColorStop(0, "rgba(235,245,255,0.55)");
          vlek.addColorStop(1, "rgba(235,245,255,0)");
          c.fillStyle = vlek;
          c.beginPath();
          c.arc(m, m, R, 0, Math.PI * 2);
          c.fill();
        });
        this.canvasPlaatje("gk-streepjes", S, S, (c) => {
          c.lineCap = "round";
          for (let i = 0; i < 60; i++) {
            const uurstreep = i % 5 === 0;
            const a = op(i * 6, 0.955 * R);
            const b = op(i * 6, (uurstreep ? 0.87 : 0.915) * R);
            c.strokeStyle = uurstreep ? "#161616" : "#b8b8b8";
            c.lineWidth = uurstreep ? 4.6 : 1.8;
            c.beginPath();
            c.moveTo(m + a.x, m + a.y);
            c.lineTo(m + b.x, m + b.y);
            c.stroke();
          }
        });
        /* De getallenlijn: een witte balk met een lijn en streepjes; de getallen schuiven eronder. */
        this.canvasPlaatje("gk-lijn", 700, 140, (c) => {
          c.save();
          c.shadowColor = "rgba(0,0,20,0.35)";
          c.shadowBlur = 14;
          c.shadowOffsetY = 5;
          c.fillStyle = "#ffffff";
          c.beginPath();
          c.roundRect(10, 10, 680, 120, 30);
          c.fill();
          c.restore();
          c.strokeStyle = "#161616";
          c.lineCap = "round";
          c.lineWidth = 3;
          c.beginPath();
          c.moveTo(40, 42);
          c.lineTo(660, 42);
          c.stroke();
          for (let n = 1; n <= 12; n++) {
            const x = 350 + lijnplek(n).x;
            c.beginPath();
            c.moveTo(x, 32);
            c.lineTo(x, 52);
            c.stroke();
          }
        });
        /* De wijzers: een slanke staaf met ronde uiteinden (draaipunt = het midden van het plaatje). */
        const wijzer = (sl: string, lang: number, dik: number, kleur: string) => {
          const b = dik + 8;
          const h = 2 * lang + 8;
          this.canvasPlaatje(sl, b, h, (c) => {
            c.fillStyle = kleur;
            c.beginPath();
            c.roundRect(b / 2 - dik / 2, h / 2 - lang, dik, lang + dik * 0.3, dik / 2);
            c.fill();
          });
        };
        wijzer("gk-uur", UUR_LANG, UUR_DIK, UURKLEUR);
        wijzer("gk-min", MIN_LANG, MIN_DIK, MINKLEUR);
        /* Oplichten (BOUWREGELS 7.9): een sterke gloed langs de rand van de wijzer zelf, in zijn eigen kleur. Eén keer getekend; pulseren = alleen de doorzichtigheid. */
        const gloed = (sl: string, lang: number, dik: number, kleur: string) => {
          const rand = 60;
          const b = dik + 2 * rand;
          const h = 2 * lang + 2 * rand;
          this.canvasPlaatje(sl, b, h, (c) => {
            const sc = c.getTransform().a || 1;
            c.lineCap = "round";
            c.strokeStyle = kleur;
            c.shadowColor = kleur;
            for (const [blur, alfa] of [[40, 0.55], [26, 0.85], [15, 1], [7, 1]] as const) {
              c.shadowBlur = blur * sc;
              c.globalAlpha = alfa;
              c.lineWidth = dik;
              c.beginPath();
              c.moveTo(b / 2, h / 2);
              c.lineTo(b / 2, h / 2 - lang + dik / 2);
              c.stroke();
            }
          });
        };
        gloed("gk-licht-uur", UUR_LANG, UUR_DIK, UUR_GLOED);
        gloed("gk-licht-min", MIN_LANG, MIN_DIK, MIN_GLOED);
        this.canvasPlaatje("gk-midden", 30, 30, (c) => {
          c.fillStyle = "#141414";
          c.beginPath();
          c.arc(15, 15, 0.05 * R, 0, Math.PI * 2);
          c.fill();
          c.fillStyle = "#ffffff";
          c.beginPath();
          c.arc(15, 15, 0.021 * R, 0, Math.PI * 2);
          c.fill();
        });
        this.canvasPlaatje("gk-driehoek", 40, 36, (c) => {
          c.fillStyle = "#4b9af5";
          c.strokeStyle = "#4b9af5";
          c.lineJoin = "round";
          c.lineWidth = 3;
          c.beginPath();
          c.moveTo(20, 32);
          c.lineTo(5, 5);
          c.lineTo(35, 5);
          c.closePath();
          c.fill();
          c.stroke();
        });
        /* Het hulphandje: een simpele witte hand met de wijsvinger omhoog, dun donker randje, zachte schaduw (stijl B). */
        this.canvasPlaatje("gk-hand", 90, 120, (c) => {
          const vorm = () => {
            c.beginPath();
            c.roundRect(34, 6, 20, 62, 10);
            c.roundRect(16, 52, 60, 56, 18);
            c.roundRect(52, 50, 17, 30, 8);
            c.roundRect(64, 58, 15, 28, 7);
            c.roundRect(8, 66, 18, 30, 9);
          };
          c.save();
          c.shadowColor = "rgba(0,0,20,0.45)";
          c.shadowBlur = 10;
          c.shadowOffsetY = 4;
          c.fillStyle = "#ffffff";
          vorm();
          c.fill();
          c.restore();
          c.strokeStyle = "#2b3a66";
          c.lineWidth = 3;
          vorm();
          c.stroke();
          c.fillStyle = "#ffffff";
          vorm();
          c.fill();
          c.strokeStyle = "rgba(43,58,102,0.55)";
          c.lineWidth = 2;
          c.beginPath();
          c.moveTo(54, 66);
          c.lineTo(54, 78);
          c.moveTo(66, 70);
          c.lineTo(66, 84);
          c.stroke();
        });
        const font = lettertype();
        const getal = (sl: string, n: number, kleur: string, dik: number) =>
          this.canvasPlaatje(sl, 80, 64, (c) => {
            c.font = `${dik} ${Math.round(0.165 * R)}px ${font}`;
            c.textAlign = "center";
            c.textBaseline = "middle";
            c.fillStyle = kleur;
            c.fillText(String(n), 40, 34);
          });
        for (let n = 1; n <= 12; n++) {
          getal(`gk-n${n}`, n, "#1b1b1d", 500);
          getal(`gk-n${n}-u`, n, GETAL_UUR, 800);
          getal(`gk-n${n}-m`, n, GETAL_MIN, 800);
        }

        const p = (sl: string, x = 0, y = 0) => this.plaats(sl, x, y);
        this.box = this.add.container(KX, KY);
        this.plaat = p("gk-plaat");
        this.lijn = p("gk-lijn", 0, 30).setAlpha(0);
        this.streepjes = p("gk-streepjes");
        this.pijl = this.add.graphics();
        this.box.add([this.plaat, this.lijn, this.streepjes]);
        for (let n = 1; n <= 12; n++) {
          const g = op(n * 30, CIJFER);
          this.getallen.push(p(`gk-n${n}`, g.x, g.y));
        }
        this.box.add(this.getallen);
        this.driehoek = p("gk-driehoek").setVisible(false);
        this.lichtMin = p("gk-licht-min").setAlpha(0);
        this.min = p("gk-min");
        this.lichtUur = p("gk-licht-uur").setAlpha(0);
        this.uur = p("gk-uur");
        this.midden = p("gk-midden");
        this.hand = p("gk-hand").setOrigin(0.48, 0.03).setVisible(false);
        this.box.add([this.pijl, this.driehoek, this.lichtMin, this.min, this.lichtUur, this.uur, this.midden, this.hand]);
        this.hoeken(begintijd * 0.5, begintijd * 6);
        this.tover(this.box);

        this.input.on("pointerdown", (q: import("phaser").Input.Pointer) => this.neer(q));
        this.input.on("pointermove", (q: import("phaser").Input.Pointer) => this.beweegMuis(q));
        this.input.on("pointerup", (q: import("phaser").Input.Pointer) => this.los(q));
        this.input.on("pointerupoutside", (q: import("phaser").Input.Pointer) => this.los(q));
      }

      hoeken(u: number, m: number) {
        this.u = u;
        this.m = m;
        this.uur.setRotation(graad(u));
        this.lichtUur.setRotation(graad(u));
        this.min.setRotation(graad(m));
        this.lichtMin.setRotation(graad(m));
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
        const van = { u: this.u, m: this.m };
        const verschil = naar - this.totaal;
        const eind = soort === "draai" ? { u: van.u + verschil * 0.5, m: van.m + verschil * 6 } : { u: van.u + kortst(van.u, naar * 0.5), m: van.m + kortst(van.m, naar * 6) };
        this.totaal = naar;
        const stil = Math.abs(eind.u - van.u) < 0.01 && Math.abs(eind.m - van.m) < 0.01;
        const duur = rustig || stil ? 0 : soort === "draai" ? draaiduur(verschil) : 450;
        const af = () => {
          if (soort === "spring") this.hoeken(naar * 0.5, naar * 6);
          klaar?.();
        };
        if (!duur) {
          this.hoeken(eind.u, eind.m);
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
            this.hoeken(van.u + (eind.u - van.u) * e, van.m + (eind.m - van.m) * e);
          },
          onComplete: () => {
            this.anim = null;
            af();
          },
        });
      }

      gezet(naar: number) {
        this.animeer(naar, "spring", () => this.meldNaar({ soort: "gezet", tijd: naar } as Vlakgebeurtenis));
      }

      /* ---------- wat er te zien is ---------- */

      zetVorm(vorm: "klok" | "lijn") {
        if (vorm === this.vorm) return;
        this.vorm = vorm;
        const klok = vorm === "klok";
        const duur = rustig ? 0 : 1100;
        for (let n = 1; n <= 12; n++) {
          const doel = klok ? op(n * 30, CIJFER) : { x: lijnplek(n).x, y: LIJN_Y + 62 };
          const g = this.getallen[n - 1];
          if (duur) this.tweens.add({ targets: g, x: doel.x, y: doel.y, duration: duur, ease: "Cubic.easeInOut" });
          else g.setPosition(doel.x, doel.y);
        }
        const vervaag = (o: Img, a: number) => (duur ? this.tweens.add({ targets: o, alpha: a, duration: 800 }) : o.setAlpha(a));
        vervaag(this.plaat, klok ? 1 : 0);
        vervaag(this.streepjes, klok ? 1 : 0);
        vervaag(this.lijn, klok ? 0 : 1);
        if (this.beeld) this.zetBeeld({ ...this.beeld });
      }

      zetBeeld(b: Beeld) {
        this.beeld = b;
        const klok = this.vorm === "klok";
        const met = klok && b.wijzers;
        const stand = (w: Img, s: "fel" | "flets") => this.tweens.add({ targets: w, alpha: !met ? 0 : s === "flets" ? 0.28 : 1, duration: rustig ? 1 : 350 });
        stand(this.uur, b.uurwijzer);
        stand(this.min, b.minuutwijzer);
        this.tweens.add({ targets: this.midden, alpha: met ? 1 : 0, duration: rustig ? 1 : 350 });
        this.zetLicht(met ? b.licht : null);
        this.zetRing(klok ? b.ring : null, b.ringWijzer, b.ringPuls);
        this.zetGetalKleur(klok ? b.getalKleur : null);
        this.zetDriehoek(klok ? b.driehoek : null);
        this.zetPijl(klok ? b.pijl : null);
        this.zetHand(b.hand);
      }

      /**
       * Het handje wijst met de vingertop naar het getal: op de klok van buiten de rand naar binnen (dan bedekt het de
       * wijzers niet), op de getallenlijn van onderen. Het beweegt zacht heen en weer naar het getal toe.
       */
      zetHand(n: number | null) {
        if (n === this.handN && this.handVorm === this.vorm) return;
        this.handN = n;
        this.handVorm = this.vorm;
        this.tweens.killTweensOf(this.hand);
        if (n == null) {
          this.hand.setVisible(false);
          return;
        }
        const lijn = this.vorm === "lijn";
        const tip = lijn ? { x: lijnplek(n).x, y: LIJN_Y + 62 + 26 } : op(n * 30, 0.93 * R);
        const hoek = lijn ? 0 : n * 30 + 180;
        const stap = lijn ? { x: 0, y: -9 } : op(n * 30, -9);
        this.hand.setScale(0.85).setPosition(tip.x, tip.y).setRotation(graad(hoek)).setVisible(true);
        if (rustig) return;
        this.hand.setAlpha(0);
        this.tweens.add({ targets: this.hand, alpha: 1, duration: 300 });
        this.tweens.add({ targets: this.hand, x: tip.x + stap.x, y: tip.y + stap.y, duration: 520, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
      }

      zetLicht(w: GoudenWijzer | null) {
        if (w === this.lichtNu) return;
        this.lichtNu = w;
        this.lichtTween?.stop();
        this.lichtTween = null;
        this.tweens.killTweensOf([this.lichtUur, this.lichtMin]);
        const aan = w === "uur" ? this.lichtUur : w === "minuut" ? this.lichtMin : null;
        for (const g of [this.lichtUur, this.lichtMin]) if (g !== aan) this.tweens.add({ targets: g, alpha: 0, duration: rustig ? 1 : 300 });
        if (!aan) return;
        if (rustig) {
          aan.setAlpha(1);
          return;
        }
        this.tweens.add({
          targets: aan,
          alpha: 1,
          duration: 300,
          onComplete: () => {
            this.lichtTween = this.tweens.add({ targets: aan, alpha: { from: 1, to: 0.55 }, duration: 750, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
          },
        });
      }

      zetRing(n: number | null, wijzer: GoudenWijzer, puls: boolean) {
        const sleutel = `${n}|${wijzer}|${puls}`;
        if (sleutel === this.ringSleutel) return;
        this.ringSleutel = sleutel;
        if (this.ring) this.tweens.killTweensOf(this.ring);
        this.ring?.destroy();
        this.ring = null;
        if (n == null) return;
        const q = op(n * 30, CIJFER);
        const g = this.add.graphics({ x: q.x, y: q.y });
        g.lineStyle(4.5, wijzer === "minuut" ? RING_MIN : RING_UUR, 1);
        g.strokeCircle(0, 0, 0.12 * R);
        this.ring = g;
        this.box.addAt(g, this.box.getIndex(this.pijl));
        if (rustig) return;
        g.setAlpha(0);
        if (puls) this.tweens.add({ targets: g, alpha: { from: 0.4, to: 1 }, duration: 650, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
        else this.tweens.add({ targets: g, alpha: 1, duration: 350 });
      }

      zetGetalKleur(k: { n: number; wijzer: GoudenWijzer } | null) {
        const oud = this.kleurN;
        if (oud?.n === k?.n && oud?.wijzer === k?.wijzer) return;
        if (oud) this.getallen[oud.n - 1]?.setTexture(`gk-n${oud.n}`);
        this.kleurN = k;
        if (k) this.getallen[k.n - 1]?.setTexture(`gk-n${k.n}-${k.wijzer === "minuut" ? "m" : "u"}`);
      }

      zetDriehoek(n: number | null) {
        if (n == null) {
          this.driehoek.setVisible(false);
          return;
        }
        const q = op(n * 30, R + 28);
        const nieuw = !this.driehoek.visible || Math.abs(this.driehoek.x - q.x) > 1 || Math.abs(this.driehoek.y - q.y) > 1;
        this.driehoek.setVisible(true).setPosition(q.x, q.y).setRotation(graad(n * 30));
        if (nieuw && !rustig) {
          this.driehoek.setAlpha(0);
          this.tweens.add({ targets: this.driehoek, alpha: 1, duration: 500 });
        }
      }

      zetPijl(p: { van: number; naar: number } | null) {
        const g = this.pijl;
        g.clear();
        if (!p) return;
        const stappen = mod(p.naar - p.van, 12);
        const kant = stappen <= 6 ? 1 : -1;
        const r = 0.6 * R;
        const a1 = p.van * 30 + kant * 3;
        const a2 = p.naar * 30 - kant * 5;
        g.lineStyle(5, BLAUW, 1);
        g.beginPath();
        g.arc(0, 0, r, graad(a1 - 90), graad(a2 - 90), kant === -1);
        g.strokePath();
        const eind = op(a2, r);
        const t = { x: Math.cos(graad(a2)) * kant, y: Math.sin(graad(a2)) * kant };
        const nn = { x: -t.y, y: t.x };
        g.fillStyle(BLAUW, 1);
        g.fillTriangle(eind.x + t.x * 14, eind.y + t.y * 14, eind.x - t.x * 5 + nn.x * 11, eind.y - t.y * 5 + nn.y * 11, eind.x - t.x * 5 - nn.x * 11, eind.y - t.y * 5 - nn.y * 11);
      }

      goedGolf() {
        if (rustig) return;
        const b = this.box;
        this.tweens.add({ targets: b, scale: 1.035, duration: 160, yoyo: true, ease: "Sine.easeInOut" });
        this.golf(b.x, b.y);
      }

      rondje() {
        if (rustig) return;
        const m = this.m;
        this.anim?.stop();
        this.anim = this.tweens.addCounter({
          from: -360,
          to: 0,
          duration: 1100,
          ease: "Sine.easeInOut",
          onUpdate: (tw) => this.hoeken(this.u, m + (tw.getValue() ?? 0)),
          onComplete: () => {
            this.anim = null;
            this.hoeken(this.u, m);
          },
        });
      }

      /* ---------- het verhaal (bus, zon, maan, bakkerij) ---------- */

      zetVerhaal(v: GoudenKlokProps["verhaal"]) {
        const sleutel = v ? `${v.naam}|${v.plek}|${v.naspeel ?? ""}` : "";
        if (sleutel !== this.verhaalSleutel) {
          this.verhaalSleutel = sleutel;
          this.verhaalSpeel = v?.speel ?? 0;
          const oud = this.verhaalBeeld;
          this.verhaalBeeld = null;
          if (oud) {
            this.tweens.killTweensOf(oud);
            this.verdwijn(oud);
          }
          if (!v) return;
          const tex = voorwerpTextuur(this, v.naam);
          const img = this.add.image(0, 0, tex);
          const breed = v.plek === "naast" ? 250 : 150;
          const k = breed / Math.max(img.width, img.height);
          img.setScale(k);
          if (v.plek === "naast") img.setPosition(170, 430);
          else if (v.plek === "hoog") img.setPosition(150, 110);
          else if (v.plek === "laag") img.setPosition(150, 300).setTint(0xffd9a8);
          else img.setPosition(150, 140);
          if (v.plek !== "naast") img.setAlpha(0.6);
          this.verhaalBeeld = img;
          this.tover(img);
          return;
        }
        if (v && v.speel !== this.verhaalSpeel) {
          this.verhaalSpeel = v.speel;
          if (v.naspeel && this.verhaalBeeld) this.speelNa(this.verhaalBeeld, v.naspeel);
        }
      }

      /** Het verhaal naspelen (pas na het antwoord): de bus veert bij het laden, rijdt een stukje, of rijdt weg. */
      speelNa(img: Img, soort: GoudenNaspeel) {
        if (rustig) return;
        const x0 = img.x;
        const y0 = img.y;
        const sx = img.scaleX;
        const sy = img.scaleY;
        this.tweens.killTweensOf(img);
        if (soort === "laden") {
          this.tweens.add({ targets: img, scaleY: sy * 0.92, y: y0 + 6, duration: 140, yoyo: true, repeat: 2, ease: "Sine.easeInOut", onComplete: () => img.setPosition(x0, y0).setScale(sx, sy) });
          return;
        }
        const stuiter = this.tweens.add({ targets: img, y: y0 - 6, duration: 120, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
        this.stof(x0 - img.displayWidth * 0.45, y0 + img.displayHeight * 0.3);
        if (soort === "rijden") {
          img.setX(x0 - 60);
          this.tweens.add({
            targets: img,
            x: x0,
            duration: 900,
            ease: "Cubic.easeOut",
            onComplete: () => {
              stuiter.stop();
              img.setY(y0);
            },
          });
        } else {
          img.setFlipX(true);
          this.tweens.add({
            targets: img,
            x: -220,
            duration: 1300,
            ease: "Cubic.easeIn",
            onComplete: () => {
              stuiter.stop();
              img.setY(y0);
            },
          });
        }
      }

      stof(x: number, y: number) {
        for (let i = 0; i < 4; i++) {
          const g = this.add.graphics({ x: x - i * 12, y: y + (i % 2) * 6 });
          g.fillStyle(0xdfe6f2, 0.75);
          g.fillCircle(0, 0, 10 + i * 2);
          g.setAlpha(0);
          this.tweens.add({ targets: g, alpha: { from: 0.8, to: 0 }, x: g.x - 30, scale: 1.8, delay: i * 90, duration: 650, onComplete: () => g.destroy() });
        }
      }

      /* ---------- bediening ---------- */

      vlakpunt(p: import("phaser").Input.Pointer) {
        const e = p.event as { clientX?: number; clientY?: number; changedTouches?: TouchList } | undefined;
        const a = e?.changedTouches?.[0];
        const cx = a?.clientX ?? e?.clientX;
        const cy = a?.clientY ?? e?.clientY;
        const r = this.game.canvas.getBoundingClientRect();
        if (cx === undefined || cy === undefined || !r.width) return { x: p.worldX, y: p.worldY, sx: p.x, sy: p.y };
        return { x: ((cx - r.left) * 980) / r.width, y: ((cy - r.top) * 720) / r.height, sx: cx, sy: cy };
      }

      lokaal(p: import("phaser").Input.Pointer) {
        const q = this.vlakpunt(p);
        return { x: q.x - this.box.x, y: q.y - this.box.y };
      }

      getalBij(x: number, y: number): number | null {
        if (this.vorm === "lijn") {
          if (Math.abs(y - LIJN_Y - 40) > 70 || Math.abs(x) > 345) return null;
          return Math.max(1, Math.min(12, Math.round(((x + 310) * 11) / 620) + 1));
        }
        const r = Math.hypot(x, y);
        if (r < GRIJP || r > R + 40) return null;
        const hoek = mod((Math.atan2(x, -y) * 180) / Math.PI, 360);
        return mod(Math.round(hoek / 30), 12) || 12;
      }

      kanSlepen(x: number, y: number) {
        const r = this.regels;
        if (!r.actief || !r.beweegbaar || r.alleenGetal != null || this.vorm !== "klok") return false;
        if (Math.hypot(x, y) > GRIJP) return false;
        const hoek = mod((Math.atan2(x, -y) * 180) / Math.PI, 360);
        return Math.abs(kortst(hoek, this.u)) < (Math.hypot(x, y) < 40 ? 180 : 30);
      }

      neer(p: import("phaser").Input.Pointer) {
        const { x, y } = this.lokaal(p);
        const q = this.vlakpunt(p);
        if (this.kanSlepen(x, y)) {
          this.anim?.stop();
          this.anim = null;
          this.sleep = { x: q.sx, y: q.sy, bewogen: false, id: p.id };
          this.zetCursor("grabbing");
          return;
        }
        const n = this.getalBij(x, y);
        const r = this.regels;
        if (n !== null && r.actief && (r.tikGetal || r.beweegbaar)) this.tik = { n, x: q.sx, y: q.sy, id: p.id };
      }

      beweegMuis(p: import("phaser").Input.Pointer) {
        const sl = this.sleep;
        if (!sl || sl.id !== p.id) {
          if (!p.isDown) {
            const { x, y } = this.lokaal(p);
            const r = this.regels;
            this.zetCursor(this.kanSlepen(x, y) ? "grab" : r.actief && (r.tikGetal || r.beweegbaar) && this.getalBij(x, y) !== null ? "pointer" : "default");
          }
          return;
        }
        const q = this.vlakpunt(p);
        if (!sl.bewogen && Math.hypot(q.sx - sl.x, q.sy - sl.y) < 8) return;
        sl.bewogen = true;
        const { x, y } = this.lokaal(p);
        this.hoeken(mod((Math.atan2(x, -y) * 180) / Math.PI, 360), this.m);
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
        if (!sl.bewogen) return;
        speelLesgeluid("wijzerKlik");
        const uur = mod(Math.round(this.u / 30), 12);
        this.gezet(uur * 60);
      }

      opGetal(n: number) {
        const r = this.regels;
        if (!r.actief) return;
        if (r.tikGetal) {
          this.meldNaar({ soort: "getal", n, tijd: this.totaal } as Vlakgebeurtenis);
          return;
        }
        if (!r.beweegbaar) return;
        if (r.alleenGetal != null && n !== r.alleenGetal) return;
        speelLesgeluid("wijzerTik");
        const q = op(n * 30, CIJFER);
        this.golf(this.box.x + q.x, this.box.y + q.y);
        this.gezet((n % 12) * 60);
      }

      zetCursor(c: string) {
        const el = this.game.canvas;
        if (el && el.style.cursor !== c) el.style.cursor = c;
      }

      /* ---------- voor de test en de vloeiendheidscontrole ---------- */

      getalPunt(n: number) {
        const q = this.vorm === "lijn" ? { x: lijnplek(n).x, y: LIJN_Y + 62 } : op(n * 30, CIJFER);
        return { x: this.box.x + q.x, y: this.box.y + q.y };
      }

      wijzerPunt(w: GoudenWijzer) {
        const q = op(w === "uur" ? this.u : this.m, w === "uur" ? UUR_LANG - 10 : GRIJP - 20);
        return { x: this.box.x + q.x, y: this.box.y + q.y };
      }

      demo(ms: number) {
        const eind = performance.now() + ms;
        let t = this.totaal;
        let w: GoudenWijzer = "uur";
        const stap = () => {
          if (performance.now() > eind) {
            this.zetLicht(null);
            return;
          }
          t += 60;
          this.animeer(t, "draai");
          this.zetLicht(w);
          w = w === "uur" ? "minuut" : "uur";
          this.time.delayedCall(500, () => this.goedGolf());
          if (this.verhaalBeeld) this.speelNa(this.verhaalBeeld, "laden");
          this.time.delayedCall(950, stap);
        };
        stap();
      }
    }
    return GoudenKlok as unknown as new () => import("phaser").Scene;
  };
}

/* ---------- het vlak ---------- */

function lettertypeVanVlak() {
  const el = document.querySelector("[data-goudenklok]");
  return el ? getComputedStyle(el).fontFamily : "system-ui, sans-serif";
}

export function GoudenKlok(props: GoudenKlokProps & Vlakbasis) {
  const {
    stand,
    vorm = "klok",
    wijzers = true,
    uurwijzer = "fel",
    minuutwijzer = "fel",
    licht = null,
    ring = null,
    ringWijzer = "uur",
    ringPuls = false,
    getalKleur = null,
    driehoek = null,
    pijl = null,
    tikGetal = false,
    beweegbaar = false,
    alleenGetal = null,
    actief = false,
    goed = 0,
    rondje = 0,
    doel = null,
    verhaal = null,
    hand = null,
    meld,
    schaal,
  } = props;

  const vlak = useRef<HTMLDivElement>(null);
  const { plek, scene } = useHoloMotor<Scene>(schaal, maakScene(lettertypeVanVlak, stand.tijd), { invoer: true });
  const meldRef = useRef(meld);
  const vorigeStand = useRef<typeof stand | null>(null);
  const vorigGoed = useRef(goed);
  const vorigRondje = useRef(rondje);

  useEffect(() => {
    meldRef.current = meld;
  });

  useEffect(() => {
    scene?.zetBediening((g) => meldRef.current(g), { actief, tikGetal, beweegbaar, alleenGetal });
  });

  useEffect(() => {
    if (!scene || stand === vorigeStand.current) return;
    const eerste = vorigeStand.current === null;
    vorigeStand.current = stand;
    scene.naar(stand.tijd, !eerste && !!stand.draai);
  }, [scene, stand]);

  useEffect(() => {
    scene?.zetVorm(vorm);
  }, [scene, vorm]);

  useEffect(() => {
    scene?.zetBeeld({ wijzers, uurwijzer, minuutwijzer, licht, ring, ringWijzer, ringPuls, getalKleur, driehoek, pijl, hand });
  }, [scene, wijzers, uurwijzer, minuutwijzer, licht, ring, ringWijzer, ringPuls, getalKleur, driehoek, pijl, hand]);

  useEffect(() => {
    scene?.zetVerhaal(verhaal);
  }, [scene, verhaal]);

  useEffect(() => {
    if (!scene || rondje === vorigRondje.current) return;
    vorigRondje.current = rondje;
    scene.rondje();
  }, [scene, rondje]);

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
      klokWijzer: (w: GoudenWijzer) => naarPagina(scene.wijzerPunt(w)),
      klokTijd: () => scene.tijdNu(),
      klokZet: (t: number) => scene.gezet(t),
    };
  }, [scene]);

  return (
    <div ref={vlak} className={s.vlak} data-goudenklok>
      <div ref={plek} style={HOLO_CANVAS} aria-hidden />
      {doel && (
        <div className={s.doel} style={{ left: KX }} aria-live="polite">
          {doel}
        </div>
      )}
    </div>
  );
}

