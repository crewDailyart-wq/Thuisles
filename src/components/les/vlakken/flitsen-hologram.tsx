"use client";

/**
 * Flitskaarten als hologrammen in Bliepo's ruimte (27 oktober 2026, opdracht
 * eigenaar; LESSENPLAN.md G1, de voorbeeldles). Zelfde verloop en zelfde
 * meldingen als het oude flitskaartvenster (`flitsen-kaart.tsx`, blijft
 * bestaan), maar:
 *
 * - geen donker bord: de bestaande blauwe ruimte blijft de achtergrond, en de
 *   voorwerpen zweven er los voor;
 * - Bliepo tovert de voorwerpen tevoorschijn: een lichtstraal uit de vloer en
 *   een flits, dan staat er een gloeiende hologramschelp met parels (Oceaan);
 * - goed = een lichtgolf uit de schelp; fout = de schelp schudt even;
 * - getekend in Phaser (HARDE REGEL 7): alle gloed is één keer "gebakken" in
 *   een plaatje, dus het blijft ook op een trage telefoon vloeiend.
 *
 * Het kind typt het antwoord in een echt invulvak (HARDE REGEL 5), net als in
 * de oude versie. Meldingen: `keuze`, `oefenKlaar`, `raceKlaar`.
 * `window.__phaser` geeft de meetpunten voor `npm run vloeiend`.
 */

import { useEffect, useRef, useState } from "react";
import { useInBeeld } from "@/components/oefenen/toetsenbordruimte";
import { laadPhaser } from "@/lib/phaser/laden";
import type { Vlakbasis } from "../soort";
import { antwoordVan, RACE_STAPPEN, tijdTekst, type Flitskaart, type FlitsProps, type Flitsknop } from "./flitsen-kaart";
import s from "./flitsen-hologram.module.css";

export type HologramProps = FlitsProps & {
  /** Waar het kind tegen racet (Oceaan: een lichtvisje). */
  tegenstander?: string;
};

/* ---------- maten (punten van het vlak, 980 × 720) ---------- */

const B = 980;
const H = 720;
const SCHELP = { x: 490, y: 288 };
/* Hoe groot de schelp met parels staat (1 = de getekende maat); groter is beter te tellen, ook op een telefoon. */
const GROOT = 1.15;
const VLOER_Y = 690;
const BAAN = { y: 642, van: 150, tot: 800 };
const TX = 2; /* plaatjes op dubbele scherpte, zodat ze ook op een scherp scherm niet wazig zijn */
const OCEAAN = 0x7fe9ff;
const WARM = 0xffd36e;

/** Plekken van de parels in de schelp: als een dobbelsteen (1–6) of twee rijen van vijf (7–10). */
function parelPlekken(n: number): { x: number; y: number; vol: boolean }[] {
  const dob: Record<number, [number, number][]> = {
    1: [[0, 0]],
    2: [[-48, 44], [48, -44]],
    3: [[-58, 48], [0, 0], [58, -48]],
    4: [[-44, -42], [44, -42], [-44, 42], [44, 42]],
    5: [[-50, -46], [50, -46], [0, 0], [-50, 46], [50, 46]],
    6: [[-46, -52], [46, -52], [-46, 0], [46, 0], [-46, 52], [46, 52]],
  };
  if (n <= 6) return (dob[n] ?? []).map(([x, y]) => ({ x, y, vol: true }));
  return Array.from({ length: 10 }, (_, i) => ({ x: -128 + (i % 5) * 64, y: i < 5 ? -34 : 34, vol: i < n }));
}

/* ---------- de Phaser-scène ---------- */

type PhaserModule = typeof import("phaser");
type Scene = import("phaser").Scene;
type GameObj = import("phaser").GameObjects.Image;

export interface HoloScene {
  toonSchelp(kaart: Flitskaart | null, opties?: { stil?: boolean }): void;
  goed(): void;
  fout(): void;
  verdwijn(): void;
  voortgang(lijst: ("goed" | "fout" | null)[] | null): void;
  race(zichtbaar: boolean, kind?: number, tegen?: number): void;
  demo(ms: number): void;
}

function maakScene(Phaser: PhaserModule, rustig: boolean) {
  return class Holo extends Phaser.Scene implements HoloScene {
    schelp: import("phaser").GameObjects.Container | null = null;
    bollen: GameObj[] = [];
    baan: import("phaser").GameObjects.Container | null = null;
    kindPion: GameObj | null = null;
    tegenPion: GameObj | null = null;
    klaar = false;

    constructor() {
      super("flits-holo");
    }

    /* --- plaatjes, één keer getekend en met gloed gebakken --- */
    canvasPlaatje(sleutel: string, b: number, h: number, teken: (c: CanvasRenderingContext2D) => void) {
      const t = this.textures.createCanvas(sleutel, b * TX, h * TX)!;
      const c = t.getContext();
      c.scale(TX, TX);
      teken(c);
      t.refresh();
    }

    bak(bron: string, doel: string, kleur: number, sterkte: number, rand: number) {
      const los = this.add.image(0, 0, bron);
      los.enableFilters();
      los.filters!.external.addGlow(kleur, sterkte, 0, 2.5 * TX, false, 12, 18).setPaddingOverride(null);
      const b = los.width + rand * 2 * TX;
      const h = los.height + rand * 2 * TX;
      this.textures.addDynamicTexture(doel, b, h)!.draw(los, b / 2, h / 2).render();
      los.destroy();
    }

    create() {
      /* Een parel: wit met een zachte parelmoerglans en een lichtje. */
      this.canvasPlaatje("parel", 52, 52, (c) => {
        const g = c.createRadialGradient(19, 17, 2, 26, 26, 26);
        g.addColorStop(0, "#ffffff");
        g.addColorStop(0.55, "#e4f6ff");
        g.addColorStop(0.85, "#a9d8ef");
        g.addColorStop(1, "#7fb6d6");
        c.fillStyle = g;
        c.beginPath();
        c.arc(26, 26, 24, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = "rgba(255,255,255,0.95)";
        c.beginPath();
        c.arc(18, 16, 5, 0, Math.PI * 2);
        c.fill();
      });
      this.bak("parel", "parel-gloed", OCEAAN, 2.2, 22);

      /* Een lege plek: een zacht gestippeld rondje. */
      this.canvasPlaatje("plek", 52, 52, (c) => {
        /* Goed zichtbaar, zodat je ziet hoeveel er aan de 10 ontbreken (zoals op een rekenrek). */
        c.fillStyle = "rgba(20,60,120,0.45)";
        c.beginPath();
        c.arc(26, 26, 21, 0, Math.PI * 2);
        c.fill();
        c.strokeStyle = "rgba(190,240,255,0.85)";
        c.lineWidth = 2.5;
        c.setLineDash([5, 4]);
        c.beginPath();
        c.arc(26, 26, 21, 0, Math.PI * 2);
        c.stroke();
      });

      /*
        De hologramschelp: een open sint-jakobsschelp. Achter de parels de
        bovenste helft als waaier (ribben vanuit het scharnier, golvende rand),
        vóór/onder de parels de onderste helft als ondiep schaaltje. Dunne
        scanlijnen maken er zichtbaar een hologram van.
      */
      const SB = 460;
      const SH = 330;
      this.canvasPlaatje("schelp", SB, SH, (c) => {
        const cx = SB / 2;
        const hy = 250; /* het scharnier */
        const rx = 205;
        const ry = 205;
        const n = 11;
        const rand = (t: number) => {
          /* golvende rand: per rib een boogje naar buiten */
          const a = Math.PI + t * Math.PI;
          const golf = 1 + 0.06 * Math.abs(Math.sin(t * n * Math.PI));
          return [cx + Math.cos(a) * rx * golf, hy + Math.sin(a) * ry * golf] as const;
        };
        const waaier = () => {
          c.beginPath();
          c.moveTo(cx, hy);
          for (let k = 0; k <= 120; k++) {
            const [x, y] = rand(k / 120);
            c.lineTo(x, y);
          }
          c.closePath();
        };
        waaier();
        const vul = c.createRadialGradient(cx, hy, 10, cx, hy, rx);
        vul.addColorStop(0, "rgba(127,233,255,0.30)");
        vul.addColorStop(1, "rgba(80,170,235,0.12)");
        c.fillStyle = vul;
        c.fill();
        c.save();
        waaier();
        c.clip();
        c.strokeStyle = "rgba(170,240,255,0.10)";
        c.lineWidth = 1;
        for (let y = 0; y < SH; y += 6) {
          c.beginPath();
          c.moveTo(0, y);
          c.lineTo(SB, y);
          c.stroke();
        }
        c.strokeStyle = "rgba(180,245,255,0.38)";
        c.lineWidth = 2.5;
        for (let k = 1; k < n; k++) {
          const [x, y] = rand(k / n);
          c.beginPath();
          c.moveTo(cx, hy);
          c.lineTo(x, y);
          c.stroke();
        }
        c.restore();
        c.strokeStyle = "rgba(200,248,255,0.95)";
        c.lineWidth = 3;
        waaier();
        c.stroke();
        /* De onderste helft: een ondiep schaaltje onder het scharnier. */
        c.beginPath();
        c.moveTo(cx - rx, hy);
        c.quadraticCurveTo(cx, hy + 120, cx + rx, hy);
        c.quadraticCurveTo(cx, hy + 30, cx - rx, hy);
        c.closePath();
        const bak = c.createLinearGradient(0, hy, 0, hy + 70);
        bak.addColorStop(0, "rgba(127,233,255,0.32)");
        bak.addColorStop(1, "rgba(60,150,220,0.14)");
        c.fillStyle = bak;
        c.fill();
        c.stroke();
        /* Het scharnier: een klein blokje. */
        c.fillStyle = "rgba(200,248,255,0.9)";
        c.beginPath();
        c.ellipse(cx, hy + 8, 18, 9, 0, 0, Math.PI * 2);
        c.fill();
      });
      this.bak("schelp", "schelp-gloed", OCEAAN, 1.6, 30);

      /* De lichtstraal uit de vloer: van fel onderaan naar niets bovenaan, met zachte zijkanten (kolom voor kolom). */
      this.canvasPlaatje("straal", 120, 520, (c) => {
        for (let x = 0; x < 120; x++) {
          const zij = Math.sin((Math.PI * (x + 0.5)) / 120) ** 2;
          const g = c.createLinearGradient(0, 520, 0, 0);
          g.addColorStop(0, `rgba(170,245,255,${0.8 * zij})`);
          g.addColorStop(0.45, `rgba(127,233,255,${0.22 * zij})`);
          g.addColorStop(1, "rgba(127,233,255,0)");
          c.fillStyle = g;
          c.fillRect(x, 0, 1, 520);
        }
      });

      /* Een lichtring (flits en lichtgolf). */
      this.canvasPlaatje("ring", 200, 200, (c) => {
        const g = c.createRadialGradient(100, 100, 60, 100, 100, 98);
        g.addColorStop(0, "rgba(255,255,255,0)");
        g.addColorStop(0.7, "rgba(200,250,255,0.9)");
        g.addColorStop(1, "rgba(255,255,255,0)");
        c.fillStyle = g;
        c.beginPath();
        c.arc(100, 100, 98, 0, Math.PI * 2);
        c.fill();
      });

      /* Een gloeiend vloerplekje onder het hologram (waar het licht vandaan komt). */
      this.canvasPlaatje("vloerlicht", 260, 60, (c) => {
        const g = c.createRadialGradient(130, 30, 4, 130, 30, 128);
        g.addColorStop(0, "rgba(190,250,255,0.75)");
        g.addColorStop(1, "rgba(127,233,255,0)");
        c.fillStyle = g;
        c.save();
        c.scale(1, 0.23);
        c.beginPath();
        c.arc(130, 130, 128, 0, Math.PI * 2);
        c.fill();
        c.restore();
      });

      /* Een bolletje voor de voortgang, en een lichtvisje voor de race. */
      for (const [sl, kl] of [
        ["bol-leeg", "rgba(160,220,255,0.35)"],
        ["bol-goed", "#7ff0b8"],
        ["bol-fout", "#ff8f9e"],
      ] as const) {
        this.canvasPlaatje(sl, 30, 30, (c) => {
          c.beginPath();
          c.arc(15, 15, 11, 0, Math.PI * 2);
          if (sl === "bol-leeg") {
            c.strokeStyle = kl;
            c.lineWidth = 2;
            c.stroke();
          } else {
            c.fillStyle = kl;
            c.fill();
          }
        });
      }
      this.bak("bol-goed", "bol-goed-gloed", 0x7ff0b8, 2, 10);
      this.canvasPlaatje("visje", 70, 40, (c) => {
        c.fillStyle = "rgba(255,211,110,0.95)";
        c.beginPath();
        c.ellipse(30, 20, 22, 12, 0, 0, Math.PI * 2);
        c.fill();
        c.beginPath();
        c.moveTo(8, 20);
        c.lineTo(-2, 8);
        c.lineTo(-2, 32);
        c.closePath();
        c.translate(0, 0);
        c.fill();
        c.fillStyle = "#1b2a44";
        c.beginPath();
        c.arc(42, 17, 2.6, 0, Math.PI * 2);
        c.fill();
      });
      this.bak("visje", "visje-gloed", WARM, 2.2, 14);
      this.bak("parel", "parel-warm", WARM, 2.6, 22);

      this.klaar = true;
      this.events.emit("klaar");
    }

    plaats(sl: string, x: number, y: number) {
      return this.add.image(x, y, sl).setScale(1 / TX);
    }

    /* --- de schelp met parels, getoverd met een lichtstraal --- */
    toonSchelp(kaart: Flitskaart | null, opties: { stil?: boolean } = {}) {
      this.schelp?.destroy();
      this.schelp = null;
      if (!kaart || kaart.soort !== "stippen") return;
      const groep = this.add.container(SCHELP.x, SCHELP.y);
      groep.add(this.plaats("schelp-gloed", 0, 0));
      for (const p of parelPlekken(kaart.n)) groep.add(this.plaats(p.vol ? "parel-gloed" : "plek", p.x, p.y - 2));
      groep.setScale(GROOT);
      this.schelp = groep;
      if (rustig || opties.stil) return;

      /* De lichtstraal schiet omhoog uit de vloer, het hologram verschijnt met een flits. */
      const vloer = this.plaats("vloerlicht", SCHELP.x, VLOER_Y).setAlpha(0);
      const straal = this.plaats("straal", SCHELP.x, VLOER_Y).setOrigin(0.5, 1).setScale(1.6 / TX, 0);
      const flits = this.plaats("ring", SCHELP.x, SCHELP.y + 10).setScale(0.2 / TX).setAlpha(0);
      groep.setAlpha(0).setScale(0.86 * GROOT, 0.2 * GROOT);
      this.tweens.add({ targets: vloer, alpha: 1, duration: 120, yoyo: true, hold: 260, onComplete: () => vloer.destroy() });
      this.tweens.add({
        targets: straal,
        scaleY: 1.1 / TX,
        duration: 170,
        ease: "Cubic.easeOut",
        onComplete: () => this.tweens.add({ targets: straal, alpha: 0, duration: 260, onComplete: () => straal.destroy() }),
      });
      this.tweens.add({ targets: groep, alpha: 1, scaleX: GROOT, scaleY: GROOT, delay: 110, duration: 220, ease: "Back.easeOut" });
      this.tweens.add({
        targets: flits,
        alpha: { from: 0.9, to: 0 },
        scale: 3.2 / TX,
        delay: 140,
        duration: 380,
        ease: "Cubic.easeOut",
        onComplete: () => flits.destroy(),
      });
    }

    goed() {
      if (!this.schelp) return;
      const golf = this.plaats("ring", SCHELP.x, SCHELP.y + 10).setScale(0.6 / TX).setTint(0xc8ffe6);
      this.tweens.add({ targets: golf, scale: 4 / TX, alpha: { from: 1, to: 0 }, duration: rustig ? 1 : 520, ease: "Cubic.easeOut", onComplete: () => golf.destroy() });
      this.tweens.add({ targets: this.schelp, scale: GROOT * 1.05, duration: 120, yoyo: true });
    }

    fout() {
      if (!this.schelp || rustig) return;
      const x = this.schelp.x;
      this.tweens.add({ targets: this.schelp, x: x + 14, duration: 55, yoyo: true, repeat: 3, onComplete: () => this.schelp?.setX(x) });
      this.tweens.add({ targets: this.schelp, alpha: 0.55, duration: 110, yoyo: true });
    }

    verdwijn() {
      const g = this.schelp;
      this.schelp = null;
      if (!g) return;
      if (rustig) return void g.destroy();
      this.tweens.add({ targets: g, alpha: 0, scaleY: 0.15, y: g.y + 60, duration: 220, ease: "Cubic.easeIn", onComplete: () => g.destroy() });
    }

    voortgang(lijst: ("goed" | "fout" | null)[] | null) {
      this.bollen.forEach((b) => b.destroy());
      this.bollen = [];
      if (!lijst) return;
      lijst.forEach((u, k) => {
        const sl = u === "goed" ? "bol-goed-gloed" : u === "fout" ? "bol-fout" : "bol-leeg";
        const stap = lijst.length > 12 ? 34 : 44;
        this.bollen.push(this.plaats(sl, SCHELP.x - ((lijst.length - 1) * stap) / 2 + k * stap, 640));
      });
    }

    race(zichtbaar: boolean, kind = 0, tegen = 0) {
      if (!zichtbaar) {
        this.baan?.destroy();
        this.baan = null;
        this.kindPion = null;
        this.tegenPion = null;
        return;
      }
      if (!this.baan) {
        const lijn = this.add.graphics();
        lijn.lineStyle(3, OCEAAN, 0.55);
        for (let x = BAAN.van; x < BAAN.tot; x += 18) lijn.lineBetween(x, BAAN.y, x + 10, BAAN.y);
        const finish = this.plaats("schelp-gloed", BAAN.tot + 50, BAAN.y - 18).setScale(0.22 / TX);
        this.kindPion = this.plaats("parel-gloed", BAAN.van, BAAN.y - 16);
        this.tegenPion = this.plaats("visje-gloed", BAAN.van, BAAN.y + 26);
        this.baan = this.add.container(0, 0, [lijn, finish, this.kindPion, this.tegenPion]);
      }
      const x = (f: number) => BAAN.van + Math.min(1, f) * (BAAN.tot - BAAN.van);
      if (this.kindPion) this.tweens.add({ targets: this.kindPion, x: x(kind), duration: rustig ? 1 : 260, ease: "Cubic.easeOut" });
      this.tegenPion?.setX(x(tegen));
    }

    /* Voor de vloeiendheidscontrole: steeds een nieuwe schelp toveren, met goed-golven. */
    demo(ms: number) {
      const eind = performance.now() + ms;
      let n = 3;
      const stap = () => {
        if (performance.now() > eind) return;
        this.toonSchelp({ soort: "stippen", n: (n++ % 10) + 1 });
        this.time.delayedCall(420, () => this.goed());
        this.time.delayedCall(800, stap);
      };
      stap();
    }
  };
}

/* ---------- het canvas met de motor ---------- */

function useHologram(schaal: number) {
  const plek = useRef<HTMLDivElement>(null);
  const [scene, setScene] = useState<HoloScene | null>(null);

  useEffect(() => {
    let spel: import("phaser").Game | null = null;
    let weg = false;
    const rustig = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    void laadPhaser().then((Phaser) => {
      if (weg || !plek.current) return;
      /* Scherp tekenen: het vlak wordt met CSS geschaald, dus het canvas krijgt zoveel echte pixels als het op het scherm groot is (hooguit 2×). */
      const k = Math.max(1, Math.min(2, schaal * (window.devicePixelRatio || 1)));
      const Holo = maakScene(Phaser, rustig);
      spel = new Phaser.Game({
        type: Phaser.WEBGL,
        parent: plek.current,
        width: Math.round(B * k),
        height: Math.round(H * k),
        transparent: true,
        banner: false,
        scale: { mode: Phaser.Scale.NONE },
        input: { mouse: false, touch: false, keyboard: false },
        scene: Holo,
        callbacks: {
          postBoot: (g) => {
            g.canvas.style.width = `${B}px`;
            g.canvas.style.height = `${H}px`;
          },
        },
      });
      spel.events.once("ready", () => {
        const sc = spel!.scene.getScene("flits-holo") as Scene & HoloScene;
        const start = () => {
          sc.cameras.main.setZoom(k).centerOn(B / 2, H / 2);
          setScene(sc);
          spel!.events.once("postrender", () => {
            window.__phaser = { ...window.__phaser, klaarOp: performance.now(), beweeg: (ms: number) => sc.demo(ms) };
          });
        };
        if ((sc as unknown as { klaar: boolean }).klaar) start();
        else sc.events.once("klaar", start);
      });
    });
    return () => {
      weg = true;
      spel?.destroy(true);
      if (window.__phaser) window.__phaser = {};
    };
    /* Eén motor per keer dat dit vlak verschijnt; de schaal staat bij het begin vast. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { plek, scene };
}

/* ---------- oefenen of racen ---------- */

function Spel({
  race,
  stapel,
  haasTijd,
  meld,
  scene,
}: {
  race: boolean;
  stapel: Flitskaart[];
  haasTijd: number;
  meld: Vlakbasis["meld"];
  scene: HoloScene | null;
}) {
  const [aftel, setAftel] = useState(race ? 4 : 0);
  const [nu, setNu] = useState(0);
  const [i, setI] = useState(0);
  /* Oefenen: zoveel kaarten als de stapel heeft (de hologramles: 15); de race: 10 goede antwoorden. */
  const aantal = race ? RACE_STAPPEN : stapel.length;
  const [uitslagen, setUitslagen] = useState<("goed" | "fout" | null)[]>(() => Array(aantal).fill(null));
  const [stappen, setStappen] = useState(0);
  const [waarde, setWaarde] = useState("");
  const [toon, setToon] = useState(false);
  const [klaar, setKlaar] = useState(false);

  const invoer = useRef<HTMLInputElement>(null);
  const begin = useRef<number | null>(null);
  const bezig = useRef(false);
  const fouten = useRef(0);
  const stappenRef = useRef(0);
  const goedRef = useRef(0);
  const afgelopen = useRef(false);
  const { bijAandacht, bijWeggaan } = useInBeeld();

  const kaart = stapel[i % stapel.length];
  const speelt = !race || aftel === 0;

  /* De schelp met deze kaart toveren zodra hij aan de beurt is. */
  useEffect(() => {
    if (!scene || !speelt || afgelopen.current) return;
    scene.toonSchelp(kaart);
    /* Voor de automatische test: welk antwoord er nu hoort. */
    window.__phaser = { ...window.__phaser, antwoord: antwoordVan(kaart) };
  }, [scene, speelt, kaart, i]);

  useEffect(() => {
    if (!scene) return;
    scene.voortgang(race ? null : uitslagen);
  }, [scene, race, uitslagen]);

  useEffect(() => {
    if (!scene) return;
    scene.race(race, stappen / RACE_STAPPEN, race ? Math.min(1, nu / haasTijd) : 0);
  }, [scene, race, stappen, nu, haasTijd]);

  useEffect(
    () => () => {
      scene?.verdwijn();
      scene?.voortgang(null);
      scene?.race(false);
    },
    [scene],
  );

  useEffect(() => {
    if (!race || aftel === 0 || aftel === 4) return;
    const t = setTimeout(() => {
      if (aftel === 1) begin.current = performance.now();
      setAftel(aftel - 1);
    }, 850);
    return () => clearTimeout(t);
  }, [race, aftel]);

  useEffect(() => {
    if (!race || aftel > 0 || klaar) return;
    const t = setInterval(() => {
      if (begin.current === null || afgelopen.current) return;
      const sec = (performance.now() - begin.current) / 1000;
      setNu(sec);
      if (sec >= haasTijd) {
        afgelopen.current = true;
        setKlaar(true);
        meld({ soort: "raceKlaar", gewonnen: false, tijd: haasTijd });
      }
    }, 100);
    return () => clearInterval(t);
  }, [race, aftel, klaar, haasTijd, meld]);

  useEffect(() => {
    if (speelt && !klaar) invoer.current?.focus();
  }, [speelt, klaar, i]);

  function markeer(st: "goed" | "fout") {
    if (race) return;
    setUitslagen((u) => u.map((x, j) => (j === i ? (x === "fout" ? "fout" : st) : x)));
  }

  function volgende(goed: boolean) {
    bezig.current = true;
    if (goed && race) {
      stappenRef.current += 1;
      setStappen(stappenRef.current);
    }
    setTimeout(() => scene?.verdwijn(), goed ? 260 : 0);
    setTimeout(() => {
      if (afgelopen.current) return;
      const klaarNu = race ? stappenRef.current >= RACE_STAPPEN : i + 1 >= aantal;
      if (klaarNu) {
        afgelopen.current = true;
        setKlaar(true);
        if (race) {
          const tijd = begin.current === null ? 0 : (performance.now() - begin.current) / 1000;
          setNu(tijd);
          meld({ soort: "raceKlaar", gewonnen: tijd < haasTijd, tijd });
        } else {
          meld({ soort: "oefenKlaar", goed: goedRef.current, van: aantal });
        }
        return;
      }
      fouten.current = 0;
      setToon(false);
      setWaarde("");
      setI((x) => x + 1);
      bezig.current = false;
    }, goed ? 520 : 320);
  }

  function controleer(x: number | null) {
    if (bezig.current || !speelt || klaar) return;
    if (x === antwoordVan(kaart)) {
      if (fouten.current === 0) goedRef.current += 1;
      markeer("goed");
      scene?.goed();
      volgende(true);
      return;
    }
    markeer("fout");
    fouten.current += 1;
    setWaarde("");
    scene?.fout();
    if (x === null || fouten.current >= 2) {
      bezig.current = true;
      setToon(true);
      setTimeout(() => volgende(false), 1600);
    } else {
      invoer.current?.focus();
    }
  }

  return (
    <>
      {race && <div className={s.klok}>{tijdTekst(nu)} s</div>}
      {toon && <div className={s.antwoord}>Het zijn er {antwoordVan(kaart)}.</div>}

      {race && aftel === 4 && (
        <div className={s.midden}>
          <button type="button" className={`${s.knop} ${s.groen}`} autoFocus onClick={() => setAftel(3)}>
            Start
          </button>
        </div>
      )}
      {race && aftel > 0 && aftel < 4 && (
        <div key={aftel} className={s.aftellen}>
          {aftel}
        </div>
      )}

      {speelt && !klaar && (
        <form
          className={s.invoer}
          onSubmit={(e) => {
            e.preventDefault();
            if (waarde) controleer(Number(waarde));
          }}
        >
          <input
            ref={invoer}
            className={s.vak}
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
            aria-label="Hoeveel parels?"
            value={waarde}
            onChange={(e) => setWaarde(e.target.value.replace(/\D/g, "").slice(0, 2))}
            onFocus={(e) => bijAandacht(e.currentTarget)}
            onBlur={bijWeggaan}
          />
          <button type="submit" className={s.rond} aria-label="Controleer" data-controleer disabled={!waarde}>
            <svg width="24" height="24" viewBox="0 0 20 20" aria-hidden>
              <path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {!race && (
            <button type="button" className={s.weetniet} onClick={() => controleer(null)}>
              Weet ik niet
            </button>
          )}
        </form>
      )}
    </>
  );
}

/* ---------- het vlak ---------- */

const KNOP: Record<Flitsknop, { tekst: string; kleur: string }> = {
  race: { tekst: "Race", kleur: s.groen },
  oefenen: { tekst: "Oefenen", kleur: s.oranje },
  verder: { tekst: "Nog een keer oefenen", kleur: s.oranje },
  opnieuw: { tekst: "Nog een keer racen", kleur: s.groen },
  klaar: { tekst: "Klaar", kleur: s.roze },
};

export function FlitsHologram(p: HologramProps & Vlakbasis) {
  const { titel, stapel, voorbeeld, fase, ronde, actief, best, haasTijd, uitslag, knoppen, meld, schaal } = p;
  const { plek, scene } = useHologram(schaal);

  /* Op het startscherm en bij de uitslag zweeft de voorbeeldschelp rustig. */
  useEffect(() => {
    if (!scene) return;
    if (fase === "start") scene.toonSchelp(voorbeeld);
    if (fase === "uitslag") scene.toonSchelp(null);
  }, [scene, fase, voorbeeld]);

  const knop = (k: Flitsknop) => (
    <button key={k} type="button" className={`${s.knop} ${KNOP[k].kleur}`} disabled={!actief} onClick={() => meld({ soort: "keuze", keuze: k })}>
      {KNOP[k].tekst}
    </button>
  );

  return (
    <div className={s.vlak}>
      <div ref={plek} className={s.canvas} aria-hidden />

      {fase === "start" && (
        <div className={s.start}>
          <h2 className={s.titel}>{titel}</h2>
          <p className={s.best}>{best === null ? "Nog geen beste tijd" : `Beste tijd: ${tijdTekst(best)} s`}</p>
          <div className={s.knoppen}>{knoppen.map(knop)}</div>
        </div>
      )}

      {(fase === "oefenen" || fase === "race") && (
        <Spel key={`${fase}-${ronde}`} race={fase === "race"} stapel={stapel} haasTijd={haasTijd} meld={meld} scene={scene} />
      )}

      {fase === "uitslag" && uitslag && (
        <div className={s.uitslag}>
          <h2>{uitslag.kop}</h2>
          <p>{uitslag.tekst}</p>
          <div className={s.kolom}>{knoppen.map(knop)}</div>
        </div>
      )}
    </div>
  );
}
