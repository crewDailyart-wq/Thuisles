"use client";

/**
 * Het speelvlak van de GOUDEN LES TIJD (squla-tijd-dagen-1-gouden, "Dagen van de week", 11 november 2026; BOUWREGELS
 * hoofdstuk 15). Een nieuw vlak naast SqulaTijdTrein (squla-tijd-trein.tsx) en naast het vlak van de gouden les Dagen
 * (squla-dagen-gouden-vlak.tsx); die vlakken en de oude lessen blijven precies zoals ze zijn.
 *
 * Dezelfde weektrein als de oude les (de gloeiende wagons en locomotief van public/squla/trein-glow/, elke dag zijn eigen
 * kleur met de naam op een bordje, rails eronder), in PHASER (HARDE REGEL 7). Gemaakt naar het vlak van de gouden les
 * Dagen, met 2 verschillen: een dagkaart kan 1 of 2 dagen hebben (bij "Op welke dagen is het weekend?"), en er wordt
 * niet gesleept (de oude les squla-tijd-dagen-1 heeft geen sleepvraag). Alles staat links van het vaste tekstvak
 * (x < 860 van de 980; 15.30).
 *
 *   - `wagons`: de trein van links (achter de locomotief) naar rechts; een dag (0 = maandag … 6 = zondag) of `null` = een
 *     lege plek (stippellijn). `[]` = alleen de locomotief. Een nieuw `beeld` = Bliepo tovert de trein tevoorschijn;
 *     verandert alleen een lege plek (die is gevuld), dan wipt die wagon even op.
 *   - `kaarten`: de dagkaarten onder de trein, als sleutel: "3" (donderdag) of "5-6" (zaterdag en zondag).
 *   - `weekend`: de gele haak onder zaterdag en zondag.
 *   - `licht`: het RODE RONDJE om wat Bliepo noemt (7.8): "w3" = de wagon van donderdag, "k5-6" = de kaart van zaterdag
 *     en zondag. Wagons naast elkaar krijgen samen 1 rondje.
 *   - `kies`: welke kaarten het kind nu kan aantikken. Een tik zet er een VINKJE op (6.5; nog een tik haalt het weg) en
 *     meldt `{ soort: "dagKies", id }`.
 *   - `hulphand`: het HULPHANDJE (15.19): komt vanzelf, is nooit een knop, alleen bij opdrachten.
 *   - `golf`: een rustige lichtgolf bij goed (7.6), bij een wagon ("w3") of een kaart ("k3").
 * Maten in punten van het vlak (980 × 720).
 */

import { useEffect, useMemo, useRef } from "react";
import type { Vlakbasis } from "../soort";
import { holoBasis, type PhaserModule } from "../holo/basis";
import { HOLO_CANVAS, useHoloMotor } from "../holo/motor";
import { DAGEN } from "./squla-dagen-trein";
import s from "./squla-tijd-gouden.module.css";

export type Punt = { x: number; y: number };
export type Hand = { plek: Punt; naar?: Punt | null; sleutel: string };
export type Kies = { gekozen: string | null; tikbaar: string[]; vinkjes: string[] };

export type TijdGoudenProps = {
  beeld: string;
  wagons: (number | null)[] | null;
  kaarten?: string[];
  licht?: string[];
  weekend?: boolean;
  kies?: Kies | null;
  hulphand?: Hand | null;
  golf?: { id: string; n: number } | null;
};

/** De dagen van een kaart ("5-6" → [5, 6]). */
export const dagenVan = (sleutel: string) => sleutel.split("-").map(Number);
/** De naam van een kaart voor de knop en de test ("zaterdag en zondag"). */
export const kaartNaam = (sleutel: string) => dagenVan(sleutel).map((d) => DAGEN[d].naam).join(" en ");

/* ---------- de maten ---------- */

/** Het midden van de trein en de kaarten: links van het vaste tekstvak (15.30). */
const MIDDEN = 417;
export const W = 96;
const TUS = 6;
const LOC = 112;
export const RAIL_Y = 320;
/** Een kaart met 1 dag is 120 breed; met 2 dagen staan er 2 kleinere wagons naast elkaar. */
const WK = 120;
const S2 = 0.92;
const KT = 44;
export const KBODEM = 560;
const KK = W / 108;
/** De wagon zelf (zonder gloed) is 324 × 163 in het plaatje, met 80 rondom voor de gloed. */
const BEELD_H = (W * 163) / 324;
const GLOED = 80 / 324;

const breedte = (n: number) => LOC + n * (W + TUS);
const x0 = (n: number) => Math.round(MIDDEN - breedte(n) / 2);
/** De linkerkant van wagon i in een trein van n. */
export const plekX = (n: number, i: number) => x0(n) + LOC + TUS + i * (W + TUS);
/** Hoe breed een kaart is (1 of 2 dagen). */
export const kaartB = (sleutel: string) => (dagenVan(sleutel).length === 1 ? WK : 2 * W * S2 + TUS);
/** Het midden van kaart i (alle kaarten even ver uit elkaar, gemeten met de breedste). */
export const kaartX = (kaarten: string[], i: number) => {
  const b = Math.max(...kaarten.map(kaartB));
  return MIDDEN + (i - (kaarten.length - 1) / 2) * (b + KT);
};
/** De knop over een kaart. */
export const kaartRect = (kaarten: string[], i: number) => {
  const b = kaartB(kaarten[i]);
  return { x: kaartX(kaarten, i) - b / 2 - 6, y: KBODEM - 84, b: b + 12, h: 92 };
};

/* ---------- Phaser ---------- */

interface Scene {
  zetFont(font: string): void;
  zetTrein(wagons: (number | null)[] | null, beeld: string): void;
  zetWeekend(aan: boolean): void;
  zetKaarten(kaarten: string[], beeld: string): void;
  zetLicht(ids: string[]): void;
  golfBij(id: string): void;
}

type Box = import("phaser").GameObjects.Container;
type Img = import("phaser").GameObjects.Image;

function maakScene(Phaser: PhaserModule, rustig: boolean) {
  const Basis = holoBasis(Phaser, rustig);

  class GoudenTijdTrein extends Basis implements Scene {
    font = "system-ui, sans-serif";
    rij: (number | null)[] = [];
    beeld = "";
    loc: Box | null = null;
    dozen: Box[] = [];
    kaartBeeld = "";
    kaarten: { sleutel: string; doos: Box; thuis: Punt }[] = [];
    haak: Img | null = null;
    weekend = false;
    rondjes: Img[] = [];
    licht: string[] = [];

    constructor() {
      super("squla-tijd-gouden");
    }

    zetFont(font: string) {
      if (font) this.font = font;
    }

    preload() {
      for (const d of DAGEN) this.load.image(`tg-${d.naam}`, `/squla/trein-glow/${d.naam}.png`);
      this.load.image("tg-loc", "/squla/trein-glow/locomotief.png");
      this.load.image("tg-rondje", "/rondje/rondje-rood-2.png");
    }

    maak() {
      /* De rails 1 keer bakken (zoals de oude trein), links van het tekstvak. */
      this.canvasPlaatje("tg-rails", 860, 22, (c) => {
        c.fillStyle = "#8fa3c9";
        c.beginPath();
        c.roundRect(0, 4, 860, 6, 3);
        c.fill();
        c.fillStyle = "#5d6f9a";
        for (let i = 0; i < 29; i++) {
          c.beginPath();
          c.roundRect(i * 30 + 6, 10, 14, 7, 2);
          c.fill();
        }
      });
      this.plaats("tg-rails", 430, RAIL_Y + 5).setDepth(0);
      /* De koppeling tussen 2 wagons. */
      this.canvasPlaatje("tg-kop", TUS + 12, 8 * KK, (c) => {
        c.fillStyle = "#1d2b5e";
        c.beginPath();
        c.roundRect(0, 0, TUS + 12, 8 * KK, 3);
        c.fill();
      });
      /* Een lege plek: een stippelrand. */
      this.canvasPlaatje("tg-leeg", W + 8, 60, (c) => {
        c.setLineDash([10, 8]);
        c.lineWidth = 4;
        c.strokeStyle = "rgba(255,247,234,0.7)";
        c.fillStyle = "rgba(255,247,234,0.06)";
        c.beginPath();
        c.roundRect(4, 4, W, 52, 14);
        c.fill();
        c.stroke();
      });
      /* De haak onder het weekend. */
      const hb = 2 * W + TUS + 8;
      this.canvasPlaatje("tg-haak", hb, 26, (c) => {
        c.strokeStyle = "#ffc845";
        c.lineWidth = 6;
        c.lineCap = "round";
        c.lineJoin = "round";
        c.beginPath();
        c.moveTo(4, 4);
        c.lineTo(4, 20);
        c.lineTo(hb - 4, 20);
        c.lineTo(hb - 4, 4);
        c.stroke();
      });
    }

    /** Een bordje met de naam van de dag; 1 keer getekend per woord. */
    bordje(woord: string, rand: string, groot = 19) {
      const sl = `tg-bord-${woord}-${groot}`;
      if (this.textures.exists(sl)) return sl;
      const meet = document.createElement("canvas").getContext("2d")!;
      meet.font = `800 ${groot}px ${this.font}`;
      const b = Math.ceil(meet.measureText(woord).width) + 14 + 16;
      const h = Math.round(groot * 1.25) + 4 + 16;
      this.canvasPlaatje(sl, b, h, (c) => {
        c.shadowColor = rand;
        c.shadowBlur = 10;
        c.fillStyle = "#fff7ea";
        c.strokeStyle = rand;
        c.lineWidth = 2;
        c.beginPath();
        c.roundRect(8, 8, b - 16, h - 16, 7);
        c.fill();
        c.shadowBlur = 0;
        c.stroke();
        c.fillStyle = "#1d2b5e";
        c.font = `800 ${groot}px ${this.font}`;
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillText(woord, b / 2, h / 2 + 1);
      });
      return sl;
    }

    /** Eén wagon als groep, met het punt onderaan in het midden op (0, 0) (de rails). */
    maakWagon(dag: number, koppeling: boolean): Box {
      const d = DAGEN[dag];
      const doos = this.add.container(0, 0);
      if (koppeling) doos.add(this.plaats("tg-kop", -W / 2 - TUS / 2, -18 * KK));
      doos.add(this.add.image(0, -2 - BEELD_H / 2, `tg-${d.naam}`).setDisplaySize(W * (1 + 2 * GLOED), BEELD_H + 2 * W * GLOED));
      doos.add(this.plaats(this.bordje(d.naam, d.hex, dag === 3 ? 15.5 : 16.5), 0, -2 - BEELD_H * 0.62));
      return doos;
    }

    /** Een dagkaart: 1 wagon (iets groter), of 2 wagons aan elkaar (iets kleiner), met het punt onderaan in het midden. */
    maakKaart(sleutel: string): Box {
      const dagen = dagenVan(sleutel);
      const doos = this.add.container(0, 0);
      if (dagen.length === 1) {
        doos.add(this.maakWagon(dagen[0], false).setScale(WK / W));
        return doos;
      }
      const stap = (W + TUS) * S2;
      dagen.forEach((dag, i) => doos.add(this.maakWagon(dag, i > 0).setScale(S2).setPosition((i - (dagen.length - 1) / 2) * stap, 0)));
      return doos;
    }

    maakLeeg(): Box {
      const doos = this.add.container(0, 0);
      doos.add(this.plaats("tg-leeg", 0, -4 - 26));
      doos.setData("leeg", true);
      return doos;
    }

    maakLoc(): Box {
      const doos = this.add.container(0, 0);
      const bh = (LOC * 207) / 324;
      doos.add(this.add.image(0, -2 - bh / 2, "tg-loc").setDisplaySize(LOC * (1 + 2 * GLOED), bh + 2 * LOC * GLOED));
      return doos;
    }

    zetTrein(wagons: (number | null)[] | null, beeld: string) {
      const nieuw = beeld !== this.beeld;
      if (!wagons) {
        for (const d of this.dozen) this.verdwijn(d);
        if (this.loc) this.verdwijn(this.loc);
        this.loc = null;
        this.dozen = [];
        this.rij = [];
        this.beeld = beeld;
        return;
      }
      const n = wagons.length;
      if (nieuw || n !== this.rij.length || !this.loc) {
        for (const d of this.dozen) this.verdwijn(d);
        if (this.loc) this.verdwijn(this.loc);
        this.loc = this.maakLoc().setPosition(x0(n) + LOC / 2, RAIL_Y).setDepth(2);
        this.tover(this.loc);
        this.dozen = wagons.map((dag, i) => {
          const doos = dag === null ? this.maakLeeg() : this.maakWagon(dag, true);
          doos.setPosition(plekX(n, i) + W / 2, RAIL_Y).setDepth(2);
          this.tover(doos, { vertraging: 40 + i * 40 });
          return doos;
        });
      } else {
        wagons.forEach((dag, i) => {
          if (this.rij[i] === dag) return;
          this.dozen[i].destroy();
          const doos = dag === null ? this.maakLeeg() : this.maakWagon(dag, true);
          doos.setPosition(plekX(n, i) + W / 2, RAIL_Y).setDepth(2);
          this.dozen[i] = doos;
          /* Een lege plek is gevuld: de wagon wipt even op. */
          if (dag !== null && !this.rustig) {
            doos.setScale(0.9);
            this.tweens.add({ targets: doos, scale: 1, duration: 260, ease: "Back.easeOut" });
            this.tweens.add({ targets: doos, y: RAIL_Y - 14, duration: 130, yoyo: true, ease: "Sine.easeOut" });
          }
        });
      }
      this.rij = [...wagons];
      this.beeld = beeld;
      this.zetWeekend(this.weekend);
      this.zetLicht(this.licht);
    }

    zetWeekend(aan: boolean) {
      this.weekend = aan;
      const i = this.rij.indexOf(5);
      const j = this.rij.indexOf(6);
      if (!aan || i < 0 || j !== i + 1) {
        this.haak?.destroy();
        this.haak = null;
        return;
      }
      if (!this.haak) this.haak = this.plaats("tg-haak", 0, 0).setDepth(3);
      this.haak.setPosition(plekX(this.rij.length, i) + W + TUS / 2, RAIL_Y + 26);
    }

    zetKaarten(kaarten: string[], beeld: string) {
      const zelfde = beeld === this.kaartBeeld && kaarten.join(",") === this.kaarten.map((k) => k.sleutel).join(",");
      if (zelfde) return;
      for (const k of this.kaarten) this.verdwijn(k.doos);
      this.kaartBeeld = beeld;
      this.kaarten = kaarten.map((sleutel, i) => {
        const thuis = { x: kaartX(kaarten, i), y: KBODEM };
        const doos = this.maakKaart(sleutel).setPosition(thuis.x, thuis.y).setDepth(3);
        this.tover(doos, { vertraging: 120 + i * 60 });
        return { sleutel, doos, thuis };
      });
      this.zetLicht(this.licht);
    }

    /** Waar iets staat voor het rondje en de golf: het midden, en hoe breed en hoog het rondje wordt. */
    plekVan(id: string): { x: number; y: number; b: number; h: number } | null {
      if (id[0] === "w") {
        const i = this.rij.indexOf(Number(id.slice(1)));
        return i < 0 ? null : { x: plekX(this.rij.length, i) + W / 2, y: RAIL_Y - 29 * KK, b: W, h: 56 * KK };
      }
      const k = this.kaarten.find((q) => q.sleutel === id.slice(1));
      if (!k) return null;
      return { x: k.thuis.x, y: KBODEM - 32, b: kaartB(k.sleutel), h: 60 };
    }

    zetLicht(ids: string[]) {
      this.licht = [...ids];
      /* Wagons naast elkaar in de trein: samen 1 rondje (zoals de oude les). */
      const plekken = ids.filter((x) => x[0] === "w").map((x) => this.rij.indexOf(Number(x.slice(1)))).filter((i) => i >= 0).sort((a, b) => a - b);
      const vakken: { x: number; y: number; b: number; h: number }[] = [];
      let start = 0;
      for (let k = 0; k < plekken.length; k++) {
        if (k + 1 < plekken.length && plekken[k + 1] === plekken[k] + 1) continue;
        const a = plekken[start];
        const b = plekken[k];
        const bb = (b - a) * (W + TUS) + W;
        vakken.push({ x: plekX(this.rij.length, a) + bb / 2, y: RAIL_Y - 29 * KK, b: bb, h: 56 * KK });
        start = k + 1;
      }
      for (const id of ids.filter((x) => x[0] !== "w")) {
        const p = this.plekVan(id);
        if (p) vakken.push(p);
      }
      while (this.rondjes.length < vakken.length) this.rondjes.push(this.add.image(0, 0, "tg-rondje").setDepth(7).setVisible(false));
      this.rondjes.forEach((r, i) => {
        const v = vakken[i];
        if (!v) {
          r.setVisible(false);
          return;
        }
        r.setPosition(v.x, v.y)
          .setDisplaySize(v.b * 1.12 + 36, v.h * 1.4 + 50)
          .setRotation((((i * 7) % 5) - 2) * 0.017)
          .setAlpha(1)
          .setVisible(true);
      });
    }

    golfBij(id: string) {
      const p = this.plekVan(id);
      if (p) this.golf(p.x, p.y);
    }

    /** Voor `npm run vloeiend`: steeds opnieuw de trein en de kaarten tevoorschijn toveren, het rondje laten lopen en een lichtgolf. */
    demo(ms: number) {
      const eind = performance.now() + ms;
      let k = 0;
      const stap = () => {
        if (performance.now() > eind) return;
        this.zetTrein([0, 1, 2, 3, 4, 5, 6], `demo-${k++}`);
        this.zetKaarten(["3-4", "5-6", "6-0"], `demo-${k}`);
        [0, 1, 2, 3].forEach((i) => this.time.delayedCall(300 + i * 160, () => this.zetLicht([`w${i}`])));
        this.time.delayedCall(300 + 4 * 160, () => {
          this.zetLicht(["k5-6"]);
          this.golfBij("w3");
        });
        this.time.delayedCall(500 + 4 * 160, stap);
      };
      stap();
    }
  }
  return GoudenTijdTrein as unknown as new () => import("phaser").Scene;
}

/* ---------- het vlak ---------- */

export function TijdGoudenVlak({ beeld, wagons, kaarten = [], licht = [], weekend = false, kies = null, hulphand = null, golf = null, meld, schaal }: TijdGoudenProps & Vlakbasis) {
  const { plek, scene } = useHoloMotor<Scene>(schaal, maakScene);
  const wortel = useRef<HTMLDivElement>(null);
  const treinSleutel = wagons ? JSON.stringify(wagons) : "";
  const rij = useMemo(() => (treinSleutel ? (JSON.parse(treinSleutel) as (number | null)[]) : null), [treinSleutel]);
  const kaartSleutel = kaarten.join(",");
  const lichtSleutel = licht.join(",");

  useEffect(() => {
    if (!scene) return;
    if (wortel.current) scene.zetFont(getComputedStyle(wortel.current).fontFamily);
    scene.zetTrein(rij, beeld);
  }, [scene, rij, beeld]);
  useEffect(() => {
    scene?.zetKaarten(kaartSleutel ? kaartSleutel.split(",") : [], beeld);
  }, [scene, kaartSleutel, beeld]);
  useEffect(() => {
    scene?.zetWeekend(weekend);
  }, [scene, weekend, rij]);
  useEffect(() => {
    scene?.zetLicht(lichtSleutel ? lichtSleutel.split(",") : []);
  }, [scene, lichtSleutel, rij, kaartSleutel]);
  const vorigGolf = useRef(golf?.n ?? 0);
  useEffect(() => {
    if (!scene || !golf || golf.n === vorigGolf.current) return;
    vorigGolf.current = golf.n;
    scene.golfBij(golf.id);
  }, [scene, golf]);

  return (
    <div ref={wortel} className={s.vlak} data-tijd-gouden="">
      <div ref={plek} style={HOLO_CANVAS} aria-hidden />
      {kies &&
        kaarten.map((sleutel, i) => {
          const r = kaartRect(kaarten, i);
          const vinkje = kies.gekozen === sleutel || kies.vinkjes.includes(sleutel);
          const mag = kies.tikbaar.includes(sleutel);
          const naam = kaartNaam(sleutel);
          return (
            <button
              key={`${beeld}-kaart-${sleutel}`}
              type="button"
              className={s.knop}
              style={{ left: r.x, top: r.y, width: r.b, height: r.h }}
              data-ding={naam}
              /* Een gekozen kaart heeft geen data-plek: dan tikt de speelcontrole iets anders aan (geleerd bij Getallenlijn). */
              data-plek={mag && !vinkje ? "kaart" : undefined}
              data-gekozen={vinkje ? "" : undefined}
              disabled={!mag}
              aria-label={naam}
              aria-pressed={vinkje}
              onClick={() => {
                if (mag) meld({ soort: "dagKies", id: sleutel });
              }}
            >
              {vinkje && <Vinkje />}
            </button>
          );
        })}
      {hulphand && (
        <div key={hulphand.sleutel} className={`${s.hand} ${s.tikGebaar}`} style={{ left: hulphand.plek.x, top: hulphand.plek.y }} aria-hidden data-hulphand="">
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

function Vinkje() {
  return (
    <span className={s.vinkje} aria-hidden data-vinkje="">
      <svg viewBox="0 0 24 24">
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    </span>
  );
}
