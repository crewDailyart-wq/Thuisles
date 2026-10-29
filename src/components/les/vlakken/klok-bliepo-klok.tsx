"use client";

/**
 * De Bliepo-klok (28 oktober 2026): dezelfde klok als de sterrenklok
 * (`klok-holo-sterrenklok.tsx`, die blijft staan) met hetzelfde gedrag en
 * dezelfde meldingen, maar in de eigen voorwerpenstijl van Bliepo
 * (`bliepo-voorwerpen.ts`, VOORWERPEN-BRONNEN.md): een vlakke, dekkende klok
 * zonder gloed, glas of sterren.
 *
 * - warmwitte wijzerplaat met een donkerblauwe rand, donkerblauwe cijfers,
 *   streepjes en uurstreepjes;
 * - een korte koraalkleurige urenwijzer met een geel knopje als greep, en een
 *   lange petrolkleurige minutenwijzer, allebei met een donkerblauwe rand;
 * - het stuk dat de minutenwijzer veegt wordt licht petrol; de tijdboog
 *   wisselt geel en lichtgeel;
 * - wat gekozen is krijgt een vlakke gele rand; goed = de klok knikt even met
 *   een gele ring eromheen; verschijnen = rustig opploppen.
 *
 * Bediening en meldingen: precies als de sterrenklok (slepen of tikken op een
 * getal; `gezet`, `controle`, `hulp`, `getal`, `mis`).
 */

import { useEffect, useRef } from "react";
import type { Vlakbasis, Vlakgebeurtenis } from "../soort";
import { draaiduur, type KlokProps, type Wijzer } from "./klok-wijzerklok";
import { bliepoBasis, blok, cirkel, KLEUR, PALET, RAND, RAND_DUN, tekenVormen, type Vorm } from "./bliepo-voorwerpen";
import { TX } from "../holo/basis";
import { HOLO_CANVAS, useHoloMotor } from "../holo/motor";
import { IkoonKnop } from "../ikonen";
import s from "./klok-bliepo-klok.module.css";
import { speelLesgeluid } from "@/lib/lesgeluiden";

export type BliepoKlokProps = Omit<KlokProps, "tweede"> & {
  /**
   * Een tweede, kleinere klok rechts met een stippelrand (de klok van Sam).
   * `uurTijd`: waar de urenwijzer staat als dat niet bij de minutenwijzer past
   * (Sam laat de urenwijzer precies op de 4 staan, terwijl het half 5 moet zijn).
   */
  tweede?: { tijd: number; naam: string; uurTijd?: number } | null;
  /** Sam, het vriendje van Bliepo, staat bij de klok (boven de tweede klok, of rechts naast de klok). */
  sam?: boolean;
  /**
   * Teken het vraagteken en het vinkje in het vlak zelf (de oude plek).
   * Standaard uit: ze staan op de vaste plek onder de zin van Bliepo (28 oktober 2026).
   */
  knoppenInVlak?: boolean;
  /** Geeft het lesscherm een functie die de stand levert (de tijd op de klok) als het vinkje getikt wordt. */
  standBron?: (geef: () => Record<string, unknown>) => void;
  /** De tijd die het kind moet zetten, groot bovenaan ("5 uur", "half 9"). */
  doel?: string | null;
  /** Ophogen = een rustige lichtgolf over de klok (goed antwoord). */
  goed?: number;
  /*
    Gedrag zoals Synthesis (28 oktober 2026, nabouw kloklessen; LEGAL REVIEW
    REQUIRED: de momenten zijn overgenomen, de tekening is eigen werk).
  */
  /** Na 2× fout of een begeleide stap: dit getal krijgt de donkere kleur van zijn wijzer en blijft zo staan. */
  getalKleur?: { n: number; wijzer: Wijzer } | null;
  /** Een boogje op de rand, in uren (4 tot 5 = tussen de 4 en de 5). `puls`: het knippert zacht (2× fout); anders rustig (goed). */
  randboog?: { van: number; tot: number; puls?: boolean } | null;
  /** De ring hoort bij deze wijzer (zijn kleur); standaard de urenwijzer. */
  ringWijzer?: Wijzer;
  /** De ring pulseert licht (begeleide stap na 2× fout of het handje). */
  ringPuls?: boolean;
  /** Bij zetten met twee wijzers: deze wijzer is al gekozen (de urenwijzer, zoals Synthesis). */
  gekozen?: Wijzer | null;
  /** Ophogen = de minutenwijzer draait één keer rond, de tijd blijft gelijk (na een begeleide stap). */
  rondje?: number;
  /** De minuten in de digitale klok lichten op (bij een samenvatting). */
  digitaalLicht?: boolean;
  /** De digitale klok is vaag (bij zelf zetten: je moet het zelf bedenken). */
  digitaalVaag?: boolean;
  /** Voor het lesscherm: het handje (hulp) staat naast de opdracht, ook zonder vinkje. */
  hulpknop?: boolean;
};

/* ---------- maten (punten van het vlak, 980 × 720) ---------- */

const R = 222;
/* De maten van de wijzerplaat, als deel van de straal R (zoals de klok van Synthesis: slank, lichte plaat, dunne streepjes). */
const CIJFER = 0.74 * R;
const STER = 0.9425 * R; /* het midden van een uurstreepje: van 0,90R tot 0,985R */
const MIN_LANG = 0.64 * R;
const UUR_LANG = 0.42 * R;
const UUR_VAN = 0.08 * R;
const STREEP_GRIJS = "#b9bfcc";
const PLAATRAND = "#d8dce6";
const PIL_PETROL = "#c9e8ea";
const PIL_KORAAL = "#ffd9d1";
/* Een getal in de kleur van zijn wijzer, donker genoeg om op de witte plaat te lezen. */
const GETAL_UUR = "#c4432d";
const GETAL_MIN = "#0b5e66";
/* Het grijpvlak van een wijzer houdt op vóór de cijfers: daarbuiten is elke tik een tik op een getal. */
const GRIJP = 0.6 * R;
const LIJN_Y = 0;

type Geo = { x: number; y: number; k: number };
/* Zoals bij Synthesis: de klok staat groot, rechts van het midden; links is de kolom van het lesscherm. */
const ENKEL: Geo = { x: 640, y: 300, k: 1 };
const LINKS: Geo = { x: 505, y: 330, k: 0.76 };
const RECHTS: Geo = { x: 830, y: 330, k: 0.6 };

const MISKLEUR = KLEUR.koraal;
/* Synthesis: de pijl "met de klok mee" is lichtblauw (de verkeerde kant op: rood). Eigen tint die goed leest op de warmwitte plaat (29 oktober 2026). */
const PIJLKLEUR = 0x2f9be0;
/* Blijft staan (regel 1): de oude donkerblauwe pijlkleur. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PIJLKLEUR_OUD = KLEUR.navy;

const graad = (g: number) => (g * Math.PI) / 180;
const mod = (n: number, m: number) => ((n % m) + m) % m;
/** Een punt op de klok: `hoek` in graden vanaf de 12, met de klok mee. */
const op = (hoek: number, r: number) => ({ x: Math.sin(graad(hoek)) * r, y: -Math.cos(graad(hoek)) * r });
/** Waar de getallen bij de boog staan: buiten de klok, maar onderaan iets dichterbij, zodat ze niet over het digitale klokje vallen. */
const boogStraal = (hoek: number) => R + 38 - 8 * Math.max(0, -Math.cos(graad(hoek)));
/** De kortste draai van hoek `van` naar hoek `naar`, tussen -180 en 180. */
const kortst = (van: number, naar: number) => ((((naar - van) % 360) + 540) % 360) - 180;
const lijnplek = (n: number) => ({ x: -310 + ((n - 1) * 620) / 11, y: LIJN_Y });

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
  getalKleur: { n: number; wijzer: Wijzer } | null;
  randboog: { van: number; tot: number; puls?: boolean } | null;
  ringWijzer: Wijzer;
  ringPuls: boolean;
};

export interface KlokScene {
  /** Waar de meldingen heen gaan, en de regels voor tikken en slepen (bij elke render opnieuw). */
  zetBediening(meld: (g: Vlakgebeurtenis) => void, regels: Regels): void;
  /** Wordt bij elk beeld aangeroepen met de tijd op de klok (voor de digitale tijd). */
  zetOpTijd(f: ((tijd: number) => void) | null): void;
  naar(tijd: number, draai: boolean): void;
  zetVorm(vorm: "klok" | "lijn"): void;
  zetBeeld(b: Beeld): void;
  zetTweede(t: { tijd: number; uurTijd?: number } | null): void;
  goedGolf(): void;
  /** De minutenwijzer draait één keer rond; de tijd blijft gelijk. */
  rondje(): void;
  /** Bij twee wijzers: deze wijzer is gekozen. */
  kiesWijzer(w: Wijzer | null): void;
  /** De tijd die de klok nu aanwijst (minuten vanaf 12 uur). */
  tijdNu(): number;
  /** Punten van het vlak → voor de automatische test. */
  getalPunt(n: number): { x: number; y: number };
  wijzerPunt(w: Wijzer): { x: number; y: number };
  /** Voor de automatische test: de klok zetten alsof het kind een wijzer sleepte (meldt "gezet"). */
  gezet(naar: number, soort: "draai" | "spring", wijzer: Wijzer): void;
}

type Img = import("phaser").GameObjects.Image;
type Gfx = import("phaser").GameObjects.Graphics;
type Box = import("phaser").GameObjects.Container;

function maakKlokScene(lettertype: () => string, begintijd: number) {
  return (Phaser: typeof import("phaser"), rustig: boolean) => {
    const Basis = bliepoBasis(Phaser, rustig);
    const LILA = KLEUR.navy;

    /** Eén klok van licht: de grote (met bediening) of de tweede (de klok van Bliepo). */
    class Plaat {
      box: Box;
      plaat: Img;
      streepjes: Img;
      lijn: Img;
      waaier: Gfx;
      boog: Gfx;
      boogTekst: Img[] = [];
      sterren: Img[] = [];
      getallen: Img[] = [];
      pijl: Gfx;
      driehoek: Img;
      vlag: Img;
      ring: Gfx | null = null;
      ringN: number | null = null;
      ringSleutel = "";
      randboog: Gfx;
      randSleutel = "";
      kleurN: { n: number; wijzer: Wijzer } | null = null;
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
        this.lijn = p("sk-lijn-g", 0, 28).setAlpha(0);
        this.waaier = sc.add.graphics();
        this.boog = sc.add.graphics();
        /* De streepjes boven het geveegde stuk, zodat ze te tellen blijven. */
        this.streepjes = p("sk-streepjes-g");
        this.box.add([this.plaat, this.lijn, this.waaier, this.boog, this.streepjes]);
        if (rand) {
          /* De klok van Bliepo: een zachte stippelrand (geen rood: niets is "fout" in rood). */
          const r = sc.add.graphics();
          r.lineStyle(RAND, rand, 1);
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
          this.sterren.push(p("sk-ster-g", q.x, q.y).setRotation(graad(n * 30)));
          this.getallen.push(p(`sk-n${n}-g`, g.x, g.y));
        }
        this.box.add([...this.sterren, ...this.getallen]);
        this.pijl = sc.add.graphics();
        this.randboog = sc.add.graphics();
        this.box.add(this.randboog);
        this.vlag = p("sk-vlag-g").setVisible(false);
        this.driehoek = p("sk-driehoek-g").setVisible(false);
        this.pilMin = p("sk-pil-min").setAlpha(0);
        this.min = p("sk-min-g");
        this.pilUur = p("sk-pil-uur").setAlpha(0);
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
        w.fillStyle(KLEUR.petrolLicht, 1);
        if (veeg > 359.5) w.fillCircle(0, 0, r);
        else {
          w.slice(0, 0, r, graad(-90), graad(-90 + veeg), false);
          w.fillPath();
          w.lineStyle(RAND_DUN, KLEUR.petrol, 1);
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
          g.fillStyle(i % 2 === 0 ? KLEUR.geelLicht : KLEUR.geel, 1);
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
              const q = op((b.van + (begin + eind) / 2) * 6, boogStraal((b.van + (begin + eind) / 2) * 6));
              this.boogTekst.push(this.sc.plaats(`sk-b${n}-g`, q.x, q.y));
            }
            begin += d;
            if (begin >= lang) break;
          }
        } else {
          for (let x = 0; x <= lang + 0.01; x += b.stap ?? 5) {
            if (!this.sc.textures.exists(`sk-b${x}-g`)) continue;
            /* De 0 staat iets vóór het vlaggetje, anders valt hij erachter (Synthesis toont de 0 naast het vlaggetje). */
            const plek = x === 0 && this.vlag.visible ? b.van - 2 : b.van + x;
            const q = op(plek * 6, boogStraal(plek * 6));
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
          this.sterren[n - 1].setRotation(klok ? graad(n * 30) : 0);
          zet(this.getallen[n - 1], getal.x, getal.y);
          this.getallen[n - 1].setScale((klok ? 1 : 0.85) / TX);
        }
        const vervaag = (o: Img | Gfx, a: number) => (duur ? this.sc.tweens.add({ targets: o, alpha: a, duration: 800 }) : o.setAlpha(a));
        vervaag(this.plaat, klok ? 1 : 0);
        vervaag(this.streepjes, klok ? 1 : 0);
        vervaag(this.lijn, klok ? 0 : 1);
        this.tekenWaaier();
        this.tekenBoog();
      }

      zetRing(n: number | null, wijzer: Wijzer = "uur", puls = false) {
        const sleutel = `${n}|${wijzer}|${puls}`;
        if (sleutel === this.ringSleutel) return;
        this.ringSleutel = sleutel;
        this.ringN = n;
        if (this.ring) this.sc.tweens.killTweensOf(this.ring);
        this.ring?.destroy();
        this.ring = null;
        if (n == null || this.vorm !== "klok") return;
        const q = op(n * 30, CIJFER);
        /* Een dunne ring van 3 punten om het getal, in de kleur van zijn wijzer; hij komt zacht in beeld (zoals Synthesis). */
        const g = this.sc.add.graphics({ x: q.x, y: q.y });
        g.lineStyle(3, wijzer === "minuut" ? KLEUR.petrol : KLEUR.koraal, 1);
        g.strokeCircle(0, 0, 0.115 * R);
        this.ring = g;
        this.box.addAt(this.ring, this.box.getIndex(this.pijl));
        if (rustig) return;
        g.setAlpha(0);
        if (puls) this.sc.tweens.add({ targets: g, alpha: { from: 0.35, to: 1 }, duration: 650, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
        else this.sc.tweens.add({ targets: g, alpha: 1, duration: 350 });
      }

      /** Een getal in de donkere kleur van zijn wijzer (na 2× fout of een begeleide stap), of weer gewoon. */
      zetGetalKleur(k: { n: number; wijzer: Wijzer } | null) {
        const oud = this.kleurN;
        if (oud?.n === k?.n && oud?.wijzer === k?.wijzer) return;
        if (oud) this.getallen[oud.n - 1]?.setTexture(`sk-n${oud.n}-g`);
        this.kleurN = k;
        const soort = k?.wijzer === "minuut" ? "m" : "u";
        if (k) this.getallen[k.n - 1]?.setTexture(`sk-n${k.n}-${soort}-g`);
      }

      /** Een boogje op de rand tussen twee plekken (in uren); pulserend bij 2× fout, rustig bij goed. */
      zetRandboog(b: { van: number; tot: number; puls?: boolean } | null) {
        const sleutel = JSON.stringify(b);
        if (sleutel === this.randSleutel) return;
        this.randSleutel = sleutel;
        const g = this.randboog;
        this.sc.tweens.killTweensOf(g);
        g.clear();
        if (!b || this.vorm !== "klok") return;
        const r = R + 9;
        g.lineStyle(9, KLEUR.koraal, 1);
        g.beginPath();
        g.arc(0, 0, r, graad(b.van * 30 - 90), graad(b.tot * 30 - 90), false);
        g.strokePath();
        if (rustig) return g.setAlpha(1);
        g.setAlpha(0);
        if (b.puls) this.sc.tweens.add({ targets: g, alpha: { from: 0.3, to: 0.95 }, duration: 600, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
        else this.sc.tweens.add({ targets: g, alpha: 1, duration: 350 });
      }

      zetDriehoek(n: number | null) {
        if (n == null) {
          this.driehoek.setVisible(false);
          return;
        }
        const q = op(n * 30, R + 34);
        const nieuw = !this.driehoek.visible || this.driehoek.x !== q.x || this.driehoek.y !== q.y;
        this.driehoek.setVisible(true).setPosition(q.x, q.y).setRotation(graad(n * 30));
        /* Het driehoekje komt zacht in beeld (zoals Synthesis, ±0,5 s). */
        if (nieuw && !rustig) {
          this.driehoek.setAlpha(0);
          this.sc.tweens.add({ targets: this.driehoek, alpha: 1, duration: 500 });
        }
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
        /* Synthesis: een langere, licht gebogen pijl dichter bij de rand (was 0.58 R en ±8°). */
        const r = 0.64 * R;
        const a1 = p.van * 30 + kant * 3;
        const a2 = p.naar * 30 - kant * 5;
        const kleur = p.rood ? MISKLEUR : PIJLKLEUR;
        /* Dun, zoals Synthesis (was 8). */
        g.lineStyle(4, kleur, 1);
        g.beginPath();
        g.arc(0, 0, r, graad(a1 - 90), graad(a2 - 90), kant === -1);
        g.strokePath();
        /* De volle pijlpunt aan het eind, langs de cirkel in de draairichting. */
        const eind = op(a2, r);
        const t = { x: Math.cos(graad(a2)) * kant, y: Math.sin(graad(a2)) * kant };
        const n = { x: -t.y, y: t.x };
        g.fillStyle(kleur, 1);
        g.fillTriangle(
          eind.x + t.x * 13,
          eind.y + t.y * 13,
          eind.x - t.x * 5 + n.x * 10,
          eind.y - t.y * 5 + n.y * 10,
          eind.x - t.x * 5 - n.x * 10,
          eind.y - t.y * 5 - n.y * 10,
        );
      }

      wijzerStand(w: Img, pil: Img, stand: "fel" | "flets" | "weg", zichtbaar: boolean, gemarkeerd: boolean) {
        const a = !zichtbaar || stand === "weg" ? 0 : stand === "flets" ? 0.32 : 1;
        this.sc.tweens.add({ targets: w, alpha: a, duration: rustig ? 1 : 350 });
        this.sc.tweens.add({ targets: pil, alpha: gemarkeerd && a > 0 ? 1 : 0, duration: rustig ? 1 : 300 });
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
      tweedeUur = 0;
      anim: import("phaser").Tweens.Tween | null = null;
      gekozen: Wijzer | null = null;
      beeld: Beeld | null = null;
      sleep: { wijzer: Wijzer; x: number; y: number; bewogen: boolean; id: number } | null = null;
      tik: { n: number; x: number; y: number; id: number } | null = null;

      constructor() {
        super("bliepoklok");
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
        const m = S / 2;
        /* De wijzerplaat: een egaal warmwitte cirkel met alleen een heel dun rondje (zoals Synthesis). */
        this.canvasPlaatje("sk-plaat", S, S, (c) => tekenVormen(c, [{ d: cirkel(m, m, R - 1), vul: PALET.warmwit, rand: PLAATRAND, dik: 1.5 }]));
        this.bak("sk-plaat", "sk-plaat-g", LILA);
        /* De 60 minuutstreepjes: dun en lichtgrijs, van 0,94R tot 0,985R, met ronde uiteinden. */
        this.canvasPlaatje("sk-streepjes", S, S, (c) => {
          const d: string[] = [];
          for (let i = 0; i < 60; i++) {
            const a = op(i * 6, 0.985 * R);
            const b = op(i * 6, 0.94 * R);
            d.push(`M ${m + a.x} ${m + a.y} L ${m + b.x} ${m + b.y}`);
          }
          tekenVormen(c, [{ d: d.join(" "), rand: STREEP_GRIJS, dik: 2 }]);
        });
        this.bak("sk-streepjes", "sk-streepjes-g", LILA);

        this.canvasPlaatje("sk-lijn", 692, 136, (c) =>
          tekenVormen(c, [
            { d: blok(6, 6, 680, 124, 30), vul: PALET.warmwit, rand: PLAATRAND, dik: 3 },
            { d: "M 36 40 L 656 40", rand: PALET.navy, dik: 3 },
          ]),
        );
        this.bak("sk-lijn", "sk-lijn-g", LILA);

        /* De 12 uurstreepjes: dik (5), donkerblauw, van 0,90R tot 0,985R, ronde uiteinden; naar het midden gedraaid. */
        const sl = 0.085 * R;
        this.canvasPlaatje("sk-ster", 16, Math.ceil(sl + 10), (c) => tekenVormen(c, [{ d: `M 8 5 L 8 ${5 + sl}`, rand: PALET.navy, dik: 5 }]));
        this.bak("sk-ster", "sk-ster-g", LILA);
        /* Een greep is er niet meer (geen geel sterretje); het plaatje blijft bestaan maar is nooit te zien. */
        this.canvasPlaatje("sk-greep", 4, 4, () => {});
        this.bak("sk-greep", "sk-greep-g", LILA);
        /* Het midden: een klein wit rondje (r 0,035R) met een donkerblauwe ring van 3. */
        const mr = 0.035 * R;
        this.canvasPlaatje("sk-midden", Math.ceil(2 * mr + 10), Math.ceil(2 * mr + 10), (c) =>
          tekenVormen(c, [{ d: cirkel(mr + 5, mr + 5, mr), vul: "#ffffff", rand: PALET.navy, dik: 3 }]),
        );
        this.bak("sk-midden", "sk-midden-g", LILA);

        /*
         * De wijzers: een slanke staaf zonder rand, met ronde uiteinden (symmetrisch plaatje, draaipunt = het midden).
         * `van`: waar de staaf begint (de urenwijzer begint een stukje van het midden, met een dun lijntje ernaartoe).
         */
        const wijzer = (sl: string, van: number, lang: number, dik: number, vul: string) => {
          const b = dik + 8;
          const h = 2 * lang + 8;
          this.canvasPlaatje(sl, b, h, (c) => {
            const x = b / 2 - dik / 2;
            const vormen: Vorm[] = [{ d: blok(x, h / 2 - lang, dik, lang - van, dik / 2), vul }];
            if (van > 0) vormen.push({ d: `M ${b / 2} ${h / 2} L ${b / 2} ${h / 2 - van - 2}`, rand: vul, dik: 4 });
            tekenVormen(c, vormen);
          });
        };
        wijzer("sk-uur", UUR_VAN, UUR_LANG, 0.07 * R, PALET.koraal);
        this.bak("sk-uur", "sk-uur-g", LILA);
        wijzer("sk-min", 0, MIN_LANG, 0.05 * R, PALET.petrol);
        this.bak("sk-min", "sk-min-g", LILA);

        /* Wat nu telt: een lichte, vlakke vulling in de kleur van de wijzer, net breder dan de wijzer, zonder rand. */
        const pil = (sl: string, van: number, lang: number, dik: number, vul: string) => {
          const b = dik + 8;
          const h = 2 * lang + 8;
          this.canvasPlaatje(sl, b, h, (c) => tekenVormen(c, [{ d: blok(b / 2 - dik / 2, h / 2 - lang, dik, lang - van, dik / 2), vul }]));
        };
        pil("sk-pil-uur", 0, UUR_LANG + 12, 0.07 * R + 20, PIL_KORAAL);
        pil("sk-pil-min", 0, MIN_LANG + 12, 0.05 * R + 20, PIL_PETROL);

        this.canvasPlaatje("sk-driehoek", 44, 40, (c) =>
          tekenVormen(c, [{ d: "M 22 34 L 6 7 L 38 7 Z", vul: PALET.geel, rand: PALET.navy, dik: RAND_DUN }]),
        );
        this.bak("sk-driehoek", "sk-driehoek-g", LILA);

        /* Het vlaggetje: hier begon het. Een donkerblauwe stok met een koraalkleurig vlaggetje (symmetrisch plaatje, het midden = de rand). */
        this.canvasPlaatje("sk-vlag", 48, 96, (c) =>
          tekenVormen(c, [
            { d: "M 24 58 L 24 8", rand: PALET.navy, dik: RAND },
            { d: "M 24 6 L 5 13 L 24 22 Z", vul: PALET.koraal, rand: PALET.navy, dik: RAND_DUN },
          ]),
        );
        this.bak("sk-vlag", "sk-vlag-g", LILA);

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
            c.font = `500 ${maat}px ${font}`;
            c.textAlign = "center";
            c.textBaseline = "middle";
            c.fillStyle = kleur;
            c.fillText(tekst, 38, 32);
          });
          this.bak(sl, `${sl}-g`, LILA);
        };
        for (let n = 1; n <= 12; n++) {
          teken(`sk-n${n}`, String(n), Math.round(0.17 * R), PALET.navy);
          /* Na 2× fout of een begeleide stap: het getal in de donkere kleur van de wijzer (Synthesis: bruin-oranje of donkerpaars). */
          teken(`sk-n${n}-u`, String(n), Math.round(0.17 * R), GETAL_UUR);
          teken(`sk-n${n}-m`, String(n), Math.round(0.17 * R), GETAL_MIN);
        }
        /* De boogtekst staat buiten de klok, op de blauwe achtergrond: warmwit. */
        for (let x = 0; x <= 60; x += 5) teken(`sk-b${x}`, String(x), 36, PALET.warmwit);
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
        /* Geen gele greep op de urenwijzer: de wijzer pak je gewoon vast. */
        pl.greep.setVisible(false);
        pl.zetRing(klok ? b.ring : null, b.ringWijzer, b.ringPuls);
        pl.zetGetalKleur(klok ? b.getalKleur : null);
        pl.zetRandboog(klok ? b.randboog : null);
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

      zetTweede(t: { tijd: number; uurTijd?: number } | null) {
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
          this.tweede.hoeken(mod((t.uurTijd ?? t.tijd) * 0.5, 360), mod(t.tijd * 6, 360));
          this.tweedeTijd = t.tijd;
          this.tweedeUur = t.uurTijd ?? t.tijd;
          this.tover(this.tweede.box, { vertraging: 300 });
          return;
        }
        const uurNu = t.uurTijd ?? t.tijd;
        if (t.tijd === this.tweedeTijd && uurNu === this.tweedeUur) return;
        /* Sam zet zijn wijzers rustig goed. */
        const tw = this.tweede;
        const van = { u: tw.u, m: tw.m };
        const eind = { u: van.u + kortst(van.u, uurNu * 0.5), m: van.m + kortst(van.m, t.tijd * 6) };
        this.tweedeTijd = t.tijd;
        this.tweedeUur = uurNu;
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
        if (rustig) return;
        const b = this.plaat.box;
        /* De klok knikt even, en een vlakke gele ring loopt één keer om hem heen. */
        const k = b.scaleX;
        this.tweens.add({ targets: b, scale: k * 1.04, duration: 160, yoyo: true, ease: "Sine.easeInOut" });
        const ring = this.add.graphics({ x: b.x, y: b.y });
        ring.lineStyle(4, KLEUR.geel, 1);
        ring.strokeCircle(0, 0, (R + 14) * k);
        ring.setScale(0.97);
        this.tweens.add({ targets: ring, scale: 1.05, duration: 420, ease: "Cubic.easeOut", onComplete: () => ring.destroy() });
      }

      rondje() {
        if (rustig) return;
        const pl = this.plaat;
        const m = pl.m;
        this.anim?.stop();
        this.anim = this.tweens.addCounter({
          from: -360,
          to: 0,
          duration: 1100,
          ease: "Sine.easeInOut",
          onUpdate: (tw) => pl.hoeken(pl.u, m + (tw.getValue() ?? 0)),
          onComplete: () => {
            this.anim = null;
            pl.hoeken(pl.u, m);
          },
        });
      }

      kiesWijzer(w: Wijzer | null) {
        this.gekozen = w;
        if (this.beeld) this.zetBeeld(this.beeld);
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
          if (Math.abs(y - LIJN_Y - 26) > 70 || Math.abs(x) > 345) return null;
          return Math.max(1, Math.min(12, Math.round(((x + 310) * 11) / 620) + 1));
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
        if (!sl.bewogen) {
          /* Een tik op een wijzer kiest hem; daarna tikt het kind op de plek. */
          speelLesgeluid("wijzerTik");
          return;
        }
        speelLesgeluid("wijzerKlik");
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
        const wijzer: Wijzer | null = r.beweegbaar === "beide" ? this.gekozen : r.beweegbaar;
        if (!wijzer) {
          this.por();
          return;
        }
        /*
          Alleen de minutenwijzer met `klem` (Synthesis: "Tik op het volgende getal"):
          een getal voorbij het doel doet niets, zonder geluid of tekst.
        */
        let vooruit = 0;
        if (wijzer === "minuut" && r.beweegbaar !== "beide") {
          vooruit = Math.floor(nu / 60) * 60 + (n % 12) * 5;
          if (vooruit <= nu) vooruit += 60;
          const g = r.grens;
          if (r.klem && (vooruit - nu >= 60 || (g && vooruit > g.tot))) {
            this.meldNaar({ soort: "mis", n, tijd: nu });
            return;
          }
        }
        speelLesgeluid("wijzerTik");
        /* Het getal licht even op waar de wijzer heen gaat. */
        const q = op(n * 30, CIJFER);
        const b = this.plaat.box;
        this.golf(b.x + q.x * b.scaleX, b.y + q.y * b.scaleY);
        if (wijzer === "uur") {
          /* Synthesis: tik je met de urenwijzer op een getal, dan springt de minutenwijzer naar de 12 (ook bij twee wijzers). */
          this.gezet((n % 12) * 60, "spring", "uur");
        } else if (r.beweegbaar === "beide") {
          /* Het uur blijft hetzelfde; de urenwijzer schuift binnen zijn uur mee. */
          this.gezet(uur * 60 + (n % 12) * 5, "spring", "minuut");
        } else {
          /* Alleen de minutenwijzer: altijd vooruit, zoals een echte klok, en de urenwijzer draait mee. */
          let naar = vooruit;
          const g = r.grens;
          if (g && naar > g.tot) naar -= 60;
          this.gezet(this.binnenGrens(naar), "draai", "minuut");
        }
      }

      /** Op een getal getikt zonder dat er een wijzer gekozen is: beide wijzers lichten even op. */
      por() {
        const pl = this.plaat;
        for (const pil of [pl.pilUur, pl.pilMin]) {
          this.tweens.add({ targets: pil, alpha: { from: 0, to: 1 }, duration: rustig ? 1 : 300, yoyo: true, hold: 300 });
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

/**
 * Sam, het vriendje van Bliepo: een eenvoudig poppetje, zelf getekend (SVG-paden,
 * Bliepo-palet, donkerblauwe rand). Een geel hemd, een petrolkleurige broek en
 * een hand in de lucht.
 */
function SamTekening() {
  const rand = { stroke: PALET.navy, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  return (
    <svg viewBox="0 0 120 150" width={132} height={165} role="img" aria-label="Sam">
      <path d="M40 80 L21 99" fill="none" {...rand} strokeWidth={16} />
      <path d="M40 80 L21 99" fill="none" stroke={PALET.koraalLicht} strokeLinecap="round" strokeWidth={7} />
      <path d="M80 80 L99 52" fill="none" {...rand} strokeWidth={16} />
      <path d="M80 80 L99 52" fill="none" stroke={PALET.koraalLicht} strokeLinecap="round" strokeWidth={7} />
      <path d={blok(46, 112, 12, 32, 6)} fill={PALET.petrol} {...rand} strokeWidth={4} />
      <path d={blok(62, 112, 12, 32, 6)} fill={PALET.petrol} {...rand} strokeWidth={4} />
      <path d={blok(38, 66, 44, 52, 14)} fill={PALET.geel} {...rand} strokeWidth={5} />
      <path d={cirkel(60, 38, 26)} fill={PALET.koraalLicht} {...rand} strokeWidth={5} />
      <path d="M36 32 Q38 10 60 10 Q82 10 84 32 Q72 20 60 22 Q48 20 36 32 Z" fill={PALET.navy} {...rand} strokeWidth={3} />
      <path d={cirkel(51, 41, 3.2)} fill={PALET.navy} />
      <path d={cirkel(69, 41, 3.2)} fill={PALET.navy} />
      <path d="M50 51 Q60 60 70 51" fill="none" {...rand} strokeWidth={4} />
    </svg>
  );
}

export function BliepoKlok(props: BliepoKlokProps & Vlakbasis) {
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
    sam = false,
    actief = false,
    beweegbaar = null,
    alleenGetal = null,
    grens = null,
    controle = false,
    knoppenInVlak = false,
    standBron,
    tikGetal = false,
    klem = false,
    boog = null,
    vlag = null,
    digitaal = false,
    doel = null,
    goed = 0,
    getalKleur = null,
    randboog = null,
    ringWijzer = "uur",
    ringPuls = false,
    gekozen = null,
    rondje = 0,
    digitaalLicht = false,
    digitaalVaag = false,
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
  useEffect(() => {
    standBron?.(() => ({ tijd: scene?.tijdNu() ?? stand.tijd }));
  }, [standBron, scene, stand.tijd]);
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
    scene?.zetBeeld({ wijzers, uurwijzer, minuutwijzer, pil, ring, driehoek, pijl, inkleur, boog, vlag, getalKleur, randboog, ringWijzer, ringPuls });
  }, [scene, wijzers, uurwijzer, minuutwijzer, pil, ring, driehoek, pijl, inkleur, boog, vlag, actief, beweegbaar, getalKleur, randboog, ringWijzer, ringPuls]);

  useEffect(() => {
    scene?.kiesWijzer(gekozen);
  }, [scene, gekozen]);

  const vorigRondje = useRef(rondje);
  useEffect(() => {
    if (!scene || rondje === vorigRondje.current) return;
    vorigRondje.current = rondje;
    scene.rondje();
  }, [scene, rondje]);

  useEffect(() => {
    scene?.zetTweede(tweede ? { tijd: tweede.tijd, uurTijd: tweede.uurTijd } : null);
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
      /* Alleen voor de speelcontrole: de klok in één keer op een tijd zetten, alsof het kind de wijzer daarheen sleepte. */
      klokZet: (t: number, w: Wijzer = "uur") => scene.gezet(t, "spring", w),
    };
  }, [scene]);

  const geo = tweede ? LINKS : ENKEL;
  const onder = geo.y + R * geo.k;

  return (
    <div ref={vlak} className={s.vlak} data-sterrenklok>
      <div ref={plek} style={HOLO_CANVAS} aria-hidden />

      {doel && (
        /* Een lange kop ("Zet de minutenwijzer 5 minuten verder.") kleiner en in het midden, zodat hij niet over de balk rechtsboven loopt (29 oktober 2026). */
        <div
          className={s.doel}
          style={doel.length > 24 ? { left: 490, fontSize: Math.min(54, Math.round(700 / (doel.length * 0.56))) } : { left: geo.x }}
          aria-live="polite"
        >
          {doel}
        </div>
      )}

      {sam && (
        <div className={s.sam} style={tweede ? { left: RECHTS.x, top: 18 } : { left: 858, top: 545 }} aria-hidden>
          <SamTekening />
        </div>
      )}

      {tweede && (
        <div className={s.naam} style={{ left: RECHTS.x, top: RECHTS.y + R * RECHTS.k + 26 }}>
          {tweede.naam}
        </div>
      )}

      {digitaal && vorm === "klok" && (
        <div className={`${s.digitaal} ${digitaalVaag ? s.vaag : ""}`} style={{ left: geo.x, top: onder + 50 }} aria-hidden>
          <span ref={uurVak} className={s.uur} />
          <span className={s.dubbelpunt}>
            <i />
            <i />
          </span>
          <span ref={minVak} className={`${s.min} ${digitaalLicht ? s.licht : ""}`} />
        </div>
      )}

      {knoppenInVlak && actief && controle && (
        <div className={s.knoppen}>
          <IkoonKnop ikoon="vraag" label="Weet ik niet" knop="klokhulp" onClick={() => meld({ soort: "hulp", tijd: scene?.tijdNu() ?? stand.tijd })} />
          <IkoonKnop ikoon="vink" label="Klaar" knop="klokcontrole" kleur="blauw" onClick={() => meld({ soort: "controle", tijd: scene?.tijdNu() ?? stand.tijd })} />
        </div>
      )}
    </div>
  );
}
