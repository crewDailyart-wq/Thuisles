/**
 * Zelf slepen bij Splitsen 1 (2 november 2026, opdracht Sara: "alle splitsopdrachten: het kind sleept of doet
 * zelf, en het ziet er aantrekkelijk uit"). Naar het voorbeeld van de knikkers in squla-splits-delen-1, maar
 * algemeen: een hoopje dingen (of getallentegels) dat het kind sleept naar vakken (de kamers van een huisje,
 * de takken van een splitspaal, een vak onder het tienvak). Het vlak (squla-splitsen-vlak.tsx) geeft de scène
 * en de muis/vinger door; de les (squla-splitsen.tsx) bepaalt wat goed is.
 *
 * - Dingen: glanzend (glansstijl B), elk een eigen vrolijke kleur, apart te zien en te tellen.
 * - Vakken: zacht, half doorzichtig, met ronde hoeken en zonder harde rand, in de kleur van het getal (2.1).
 * - Loslaten bij een vak = erin; ver van elk vak = terug naar boven; tikken werkt ook.
 * - Alles wordt één keer getekend (gebakken), er wordt niets elk beeld opnieuw uitgerekend.
 */

import { TX, VLAK_B, VLAK_H, type Holo } from "../holo/basis";
import { speelLesgeluid } from "@/lib/lesgeluiden";
import { tekenVoorwerp, tekenVoorwerpRechthoek, tekenVoorwerpStuk } from "../voorwerpen";
import type { Vlakgebeurtenis } from "../soort";

export type S1Zone = {
  id: string;
  x: number;
  y: number;
  b: number;
  h: number;
  /** Kleurnaam (zelfde als de getallen in de zin). */
  kl?: string;
  /** Hoeveel dingen naast elkaar, en hoe groot. */
  per: number;
  dia: number;
  /** Hoeveel er hoogstens in kunnen (een tegel-vak: 1). */
  max?: number;
  /** Een teken dat in een leeg vak staat, bijvoorbeeld "?". */
  leeg?: string;
};

export type S1Spec = {
  /** Verandert = opnieuw beginnen. */
  nr: number;
  soort: "dingen" | "tegels";
  /** Dingen: het voorwerp. Alle dingen in één kleur als `kleur` is gezet, anders afwisselend vrolijk. */
  vw?: string;
  kleur?: string;
  /** Het voorwerp houdt zijn eigen kleuren en glans (goudstuk, koperen munt): het wordt niet in `kleur` omgekleurd. */
  echt?: boolean;
  /** Bij goed worden de dingen die buiten de vakken blijven grijs en dof (een minsom: wat weggaat). */
  restWeg?: boolean;
  /** Per ding een eigen kleur (kleurnaam); gaat voor `kleur`. */
  kleuren?: string[];
  /** Tegels: het getal op elke tegel. */
  waarden?: number[];
  n: number;
  tray: { x: number; y: number; per: number; dia: number; stap?: number };
  zones: S1Zone[];
  /** Wat goed is (de test en de les kijken hiernaar): per vak een aantal (dingen) of een getal (tegels, -1 = geen eis). */
  oplossing: number[];
  /** Een verkeerd antwoord voor de automatische test. */
  fout: number[];
  /** Hoe de uitleg het doet: [ding of tegel, vak]. */
  route: [number, number][];
  /** Een voorwerp (de splitsmachine) dat boven de dingen staat: de dingen komen er onderuit; het schudt bij elke stap van `auto`. */
  deco?: { vw: string; x: number; y: number; maat: number };
  /**
   * Een schatkist waar de dingen uit springen (BOUWREGELS 1.22): de gesloten kist staat eerst op `van` (waar het verhaalbegin
   * hem liet zien), schuift naar `x, y, maat` (midden en breedte), de deksel gaat open en de dingen springen met een boogje
   * in het hoopje. De kist blijft open en leeg staan. De dingen verklappen niets: ze zijn de opgave zelf.
   */
  kist?: { x: number; y: number; maat: number; van: { x: number; y: number; maat: number } };
  /** Alleen kijken: de dingen kunnen niet gepakt worden (de ballen vallen zelf). */
  vast?: boolean;
  /** Tegels die alvast getekend worden (één per beeld, zodat het volgende spel niet hapert). */
  voorbak?: number[];
  /** Zoveel stappen van `route` doet het vlak zelf (uitleg en hulp); de rest ligt in het hoopje. */
  auto?: number;
};

/** Wat het vlak meldt na elke verandering. */
export type S1Stand = { soort: "s1stand"; tel: number[]; waarden: number[][]; los: number };

const PALET = ["#ff3b5c", "#ff9a1f", "#ffd21f", "#2fd16b", "#2e9bff", "#a35cff", "#ff4fb0", "#18c8c8"];
const VW = 96;

type Dep = {
  KLEUR: Record<string, string>;
  kleurPixels: (c: CanvasRenderingContext2D, hex: string) => void;
  meld: () => (g: Vlakgebeurtenis) => void;
};

type Ding = { im: import("phaser").GameObjects.Image; thuis: { x: number; y: number }; zone: number; waarde: number; /** Springt nog uit de kist: nog niet te pakken. */ vlucht?: boolean };

export function maakS1(sc: Holo, dep: Dep) {
  type Box = import("phaser").GameObjects.Container;
  type Gfx = import("phaser").GameObjects.Graphics;
  type Ptr = import("phaser").Input.Pointer;
  type Txt = import("phaser").GameObjects.Text;
  type Img = import("phaser").GameObjects.Image;

  type Staat = {
    sleutel: string;
    spec: S1Spec;
    dingen: Ding[];
    inhoud: number[][];
    box: Box;
    /** De schatkist (los van `box`, zodat hij meteen zichtbaar is) en wat de vliegende dingen nog moeten afmaken. */
    kist: Box | null;
    land: (() => void) | null;
    laagDing: Box;
    deco: Img | null;
    laagSleep: Box;
    licht: Gfx[];
    groen: Gfx[];
    leeg: (Txt | null)[];
  };

  let st: S1Staat | null = null;
  type S1Staat = Staat;
  let actief = false;
  let druk: { i: number; x0: number; y0: number; dx: number; dy: number; sleept: boolean } | null = null;
  let laatsteAuto: number | undefined;
  let schaduw: Gfx | null = null;
  let neerIdx = -1;
  let wiebel: (() => void) | null = null;

  const hexVan = (kl?: string) => (kl ? dep.KLEUR[kl] : undefined);

  /* ---------- plaatjes (één keer getekend) ---------- */

  function dingTex(vw: string, hex: string, echt = false) {
    const sl = `sps-s1-${vw}-${echt ? "echt" : hex}`;
    sc.canvasPlaatje(sl, VW, VW, (c) => {
      tekenVoorwerp(c, vw, 4, 4, VW - 8, VW - 8);
      if (!echt) dep.kleurPixels(c, hex);
    });
    return sl;
  }

  /** Een getallentegel: zacht verloop, lichtvlekje, dunne rand, het getal groot en donker. */
  function tegelTex(n: number) {
    const sl = `sps-s1-tegel-${n}`;
    sc.canvasPlaatje(sl, VW, VW, (c) => {
      const x = 6;
      const y = 6;
      const b = VW - 12;
      /* zachte gloed eromheen zonder dure schaduwfilter */
      for (const [u, al] of [[5, 0.12], [3, 0.2], [1.5, 0.3]] as const) {
        c.beginPath();
        c.roundRect(x - u, y - u, b + u * 2, b + u * 2, 24 + u);
        c.fillStyle = `rgba(160,200,255,${al})`;
        c.fill();
      }
      const gr = c.createLinearGradient(x, y, x + b, y + b);
      gr.addColorStop(0, "#ffffff");
      gr.addColorStop(0.6, "#e3ecff");
      gr.addColorStop(1, "#b9cdf5");
      c.beginPath();
      c.roundRect(x, y, b, b, 24);
      c.fillStyle = gr;
      c.fill();
      c.lineWidth = 2;
      c.strokeStyle = "#7d95d4";
      c.stroke();
      c.beginPath();
      c.roundRect(x + 9, y + 8, b * 0.55, 9, 5);
      c.fillStyle = "rgba(255,255,255,0.9)";
      c.fill();
      c.fillStyle = "#17224f";
      c.font = `800 ${n >= 10 ? 44 : 56}px "Work Sans", system-ui, sans-serif`;
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillText(String(n), VW / 2, VW / 2 + 4);
    });
    return sl;
  }

  /** Een klein vierpuntig sterretje (glinstering). */
  function vonkTex() {
    sc.canvasPlaatje("sps-s1-vonk", 48, 48, (c) => {
      c.fillStyle = "#ffffff";
      c.shadowColor = "rgba(255,240,180,0.9)";
      c.shadowBlur = 6;
      c.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        const r = i % 2 === 0 ? 20 : 5;
        c.lineTo(24 + Math.cos(a) * r, 24 + Math.sin(a) * r);
      }
      c.closePath();
      c.fill();
    });
    return "sps-s1-vonk";
  }

  /* ---------- opbouwen en opruimen ---------- */

  function weg() {
    const oud = st;
    st = null;
    druk = null;
    schaduw = null;
    if (wiebel) sc.events.off("update", wiebel);
    wiebel = null;
    laatsteAuto = undefined;
    sc.input.setDefaultCursor("default");
    if (typeof window !== "undefined" && window.__phaser) {
      const w = { ...window.__phaser };
      delete w.s1Stap;
      delete w.s1Punt;
      delete w.sleepPunt;
      window.__phaser = w;
    }
    if (!oud) return;
    oud.dingen.forEach((d) => (d.vlucht = false));
    if (sc.rustig) {
      oud.box.destroy();
      oud.kist?.destroy();
    } else {
      sc.tweens.add({ targets: oud.box, alpha: 0, duration: 140, onComplete: () => oud.box.destroy() });
      if (oud.kist) {
        const k = oud.kist;
        sc.tweens.add({ targets: k, alpha: 0, duration: 140, onComplete: () => k.destroy() });
      }
    }
  }

  const scherm = (x: number, y: number) => {
    const r = sc.game.canvas.getBoundingClientRect();
    return { x: r.left + (x * r.width) / VLAK_B, y: r.top + (y * r.height) / VLAK_H };
  };

  /** Waar het hoopje staat: rijtjes, het eerste dingetje links boven. */
  function trayPlek(spec: S1Spec, i: number) {
    const t = spec.tray;
    const stap = t.stap ?? t.dia * 1.14;
    const rij = Math.floor(i / t.per);
    const inRij = Math.min(t.per, spec.n - rij * t.per);
    const col = i % t.per;
    return { x: t.x + (col - (inRij - 1) / 2) * stap, y: t.y + rij * stap * 0.96 + (i % 2 === 0 ? -3 : 3) };
  }

  /**
   * De schatkist (BOUWREGELS 1.22). Het deksel en de kist zijn twee plaatjes uit hetzelfde kistje als in het verhaalbegin
   * (één keer getekend); alles beweegt met tweens, er wordt niets elk beeld uitgerekend. Het deksel klapt open door lager
   * te worden (we zien het van voren), daarna springen de dingen één voor één met een boogje naar hun plek in het hoopje.
   */
  function bouwKist(spec: S1Spec, dingen: Ding[], laagDing: Box) {
    const k = spec.kist!;
    const SPLIT = 0.41;
    const B = 256;
    sc.canvasPlaatje("sps-kist-lid", B, Math.round(B * (448 / 512) * SPLIT), (c) => tekenVoorwerpStuk(c, "kistje", 0, SPLIT, B));
    /* De kist zonder hangslot: de plek van het slot (x 205-295, y 185-335 van het plaatje) wordt gevuld met hout ernaast. */
    const SY = SPLIT * 448;
    sc.canvasPlaatje("sps-kist-bak", B, Math.round(B * (448 / 512) * (1 - SPLIT)), (c) => {
      tekenVoorwerpStuk(c, "kistje", SPLIT, 1, B);
      const f = B / 512;
      tekenVoorwerpRechthoek(c, "kistje", 110, 185, 90, 150, 205 * f, (185 - SY) * f, 90 * f, 150 * f);
    });
    sc.canvasPlaatje("sps-kist-slot", 90, 150, (c) => tekenVoorwerpRechthoek(c, "kistje", 205, 185, 90, 150, 0, 0, 90, 150));
    const H = k.maat * (448 / 512);
    const hLid = H * SPLIT;
    const hBak = H - hLid;
    const onder = k.y + H / 2;
    const kist = sc.add.container(k.x, onder);
    kist.setDepth(9);
    const binnen = sc.add.graphics();
    binnen.fillStyle(0x3b2418, 1);
    binnen.fillEllipse(0, -hBak, k.maat * 0.8, hBak * 0.36);
    binnen.setAlpha(0);
    const bak = sc.plaats("sps-kist-bak", 0, 0).setOrigin(0.5, 1).setDisplaySize(k.maat, hBak);
    const lid = sc.plaats("sps-kist-lid", 0, -hBak).setOrigin(0.5, 1).setDisplaySize(k.maat, hLid);
    const fk = k.maat / 512;
    const slot = sc.plaats("sps-kist-slot", (250 - 256) * fk, -hBak + (185 - SY) * fk).setOrigin(0.5, 0).setDisplaySize(90 * fk, 150 * fk);
    kist.add([bak, binnen, slot, lid]);
    /* De open mond van de kist: hier komen de dingen uit. */
    const mond = { x: k.x, y: onder - hBak - hLid * 0.2 };
    const open = () => {
      lid.setTint(0x9a6a48).setFlipY(true);
      lid.setDisplaySize(k.maat, hLid * 0.75);
      binnen.setAlpha(1);
      slot.destroy();
    };

    const eindig = (d: Ding) => {
      d.vlucht = false;
      if (d.im.active) d.im.setPosition(d.thuis.x, d.thuis.y).setAlpha(1);
    };
    if (sc.rustig) {
      open();
      kist.setPosition(k.x, onder);
      return { kist, land: null };
    }

    const s0 = k.van.maat / k.maat;
    kist.setScale(s0).setPosition(k.van.x, k.van.y + (k.van.maat * (448 / 512)) / 2);
    const diaEind = spec.tray.dia;
    dingen.forEach((d) => {
      d.vlucht = true;
      d.im.setAlpha(0).setPosition(mond.x, mond.y).setDisplaySize(diaEind * 0.4, diaEind * 0.4);
    });
    let klaar = false;
    const spring = () => {
      if (klaar) return;
      dingen.forEach((d, i) => {
        sc.time.delayedCall(i * 32, () => {
          if (!d.vlucht || !d.im.active) return;
          d.im.setAlpha(1);
          const x0 = mond.x;
          const y0 = mond.y;
          const hoogte = 70 + (i % 3) * 22;
          const teller = sc.tweens.addCounter({
            from: 0,
            to: 1,
            duration: 520,
            onUpdate: (t) => {
              if (!d.vlucht || !d.im.active) {
                teller.stop();
                return;
              }
              const p = t.getValue() ?? 0;
              d.im.setPosition(x0 + (d.thuis.x - x0) * p, y0 + (d.thuis.y - y0) * p - 4 * hoogte * p * (1 - p));
              const w = diaEind * (0.4 + 0.6 * Math.min(1, p * 1.6));
              d.im.setDisplaySize(w, w);
            },
            onComplete: () => {
              if (!d.vlucht || !d.im.active) return;
              d.vlucht = false;
              d.im.setPosition(d.thuis.x, d.thuis.y).setDisplaySize(diaEind, diaEind);
              /* zacht stuiteren, en bij een paar een glinsterstipje */
              sc.tweens.add({ targets: d.im, y: d.thuis.y - 9, duration: 110, yoyo: true, ease: "Sine.easeOut" });
              if (i % 4 === 0) {
                const v = sc.plaats(vonkTex(), d.thuis.x + 12, d.thuis.y - 16).setAlpha(0).setScale(0.1 / TX);
                laagDing.add(v);
                sc.tweens.add({ targets: v, alpha: 1, scale: 0.7 / TX, angle: 70, duration: 220, yoyo: true, onComplete: () => v.destroy() });
              }
            },
          });
        });
      });
    };
    /* 1 de kist schuift naar zijn plek, 2 hij wiebelt even, 3 het deksel gaat open (met een stuiter), 4 de schatten springen eruit. */
    sc.tweens.add({
      targets: kist,
      x: k.x,
      y: onder,
      scaleX: 1,
      scaleY: 1,
      duration: 380,
      delay: 120,
      ease: "Cubic.easeInOut",
      onComplete: () => {
        sc.tweens.add({
          targets: kist,
          angle: { from: -3, to: 3 },
          duration: 90,
          yoyo: true,
          repeat: 1,
          onComplete: () => {
            kist.setAngle(0);
            /* Het hangslot springt eraf en valt weg. */
            sc.tweens.add({ targets: slot, y: slot.y + 150, angle: 50, alpha: 0, duration: 420, ease: "Quad.easeIn", onComplete: () => slot.destroy() });
            sc.tweens.add({ targets: binnen, alpha: 1, duration: 200, delay: 160 });
            /* Het deksel klapt achterover: eerst plat (van opzij), dan omhoog met de onderkant naar ons toe, met een stuiter. */
            sc.tweens.add({
              targets: lid,
              displayHeight: 2,
              duration: 150,
              ease: "Sine.easeIn",
              onComplete: () => {
                lid.setFlipY(true).setTint(0x9a6a48);
                sc.tweens.add({ targets: lid, displayHeight: hLid * 0.75, duration: 300, ease: "Back.easeOut" });
              },
            });
            sc.time.delayedCall(250, spring);
          },
        });
      },
    });
    /* Wordt er meteen gesleept of getest, dan landen alle dingen nu. */
    const land = () => {
      if (klaar) return;
      klaar = true;
      sc.tweens.killTweensOf(kist);
      kist.setAngle(0).setScale(1).setPosition(k.x, onder);
      open();
      dingen.forEach(eindig);
    };
    return { kist, land };
  }

  function bouw(spec: S1Spec, sleutel: string) {
    const box = sc.add.container(0, 0);
    const laagVak = sc.add.container(0, 0);
    const laagDing = sc.add.container(0, 0);
    const laagDeco = sc.add.container(0, 0);
    const laagSleep = sc.add.container(0, 0);
    box.setDepth(10);
    box.add([laagVak, laagDing, laagDeco, laagSleep]);

    const licht: Gfx[] = [];
    const groen: Gfx[] = [];
    const leeg: (Txt | null)[] = [];
    spec.zones.forEach((z) => {
      const hex = hexVan(z.kl);
      const kleur = hex ? parseInt(hex.slice(1), 16) : 0xcfe3ff;
      const licht1 = hex ? (((kleur >> 16) + 255) >> 1 << 16) | ((((kleur >> 8) & 255) + 255) >> 1 << 8) | (((kleur & 255) + 255) >> 1) : kleur;
      /* Herstel 7 november (OVERZICHT-C splitsen1-1): het oranje vak zag er beige/bruin uit (licht oranje, half doorzichtig op
         blauw), terwijl Bliepo "het oranje vak" zegt. Nu een stevige, iets donkerdere tint van de kleur (niet doorzichtig) met
         een lichte rand in de kleur: duidelijk oranje (of paars), en de lichte ballen erin blijven goed te zien. */
      /* Voller van kleur (niet grijzer): het sterkste kanaal blijft bijna gelijk, de andere twee zakken. Oranje blijft zo oranje (geen bruin). */
      const kan = [kleur >> 16, (kleur >> 8) & 255, kleur & 255];
      const top = Math.max(...kan);
      const [dr, dg, db] = kan.map((c) => Math.round(c === top ? c * 0.94 : c * 0.7));
      const donker = hex ? (dr << 16) | (dg << 8) | db : kleur;
      const g = sc.add.graphics();
      g.fillStyle(kleur, 0.1);
      g.fillRoundedRect(z.x - z.b / 2 - 6, z.y - z.h / 2 - 6, z.b + 12, z.h + 12, 30);
      g.fillStyle(hex ? donker : licht1, hex ? 0.9 : 0.62);
      g.fillRoundedRect(z.x - z.b / 2, z.y - z.h / 2, z.b, z.h, 24);
      if (hex) {
        g.lineStyle(4, licht1, 0.95);
        g.strokeRoundedRect(z.x - z.b / 2 + 2, z.y - z.h / 2 + 2, z.b - 4, z.h - 4, 22);
      }
      g.fillStyle(0xffffff, 0.07);
      g.fillRoundedRect(z.x - z.b / 2 + 6, z.y - z.h / 2 + 5, z.b - 12, z.h * 0.3, 18);
      laagVak.add(g);
      const l = sc.add.graphics().setAlpha(0);
      l.fillStyle(0xffffff, 0.2);
      l.fillRoundedRect(z.x - z.b / 2, z.y - z.h / 2, z.b, z.h, 24);
      laagVak.add(l);
      licht.push(l);
      const gr = sc.add.graphics().setAlpha(0);
      gr.fillStyle(0x8ff0c0, 0.4);
      gr.fillRoundedRect(z.x - z.b / 2, z.y - z.h / 2, z.b, z.h, 24);
      laagVak.add(gr);
      groen.push(gr);
      if (z.leeg) {
        const t = sc.add
          .text(z.x, z.y, z.leeg, { fontFamily: '"Work Sans", system-ui, sans-serif', fontSize: `${Math.round(Math.min(z.h * 0.55, 70))}px`, fontStyle: "800", color: hex ?? "#ffffff" })
          .setOrigin(0.5)
          .setAlpha(0.6)
          .setResolution(TX);
        laagVak.add(t);
        leeg.push(t);
      } else leeg.push(null);
    });

    spec.voorbak?.forEach((w, k) => sc.time.delayedCall(150 + k * 130, () => tegelTex(w)));
    const dingen: Ding[] = [];
    for (let i = 0; i < spec.n; i++) {
      const hex = spec.kleuren ? hexVan(spec.kleuren[i])! : spec.kleur ? hexVan(spec.kleur)! : PALET[(i * 3) % PALET.length];
      const sl = spec.soort === "tegels" ? tegelTex(spec.waarden![i]) : dingTex(spec.vw!, hex, spec.echt);
      const thuis = trayPlek(spec, i);
      const im = sc.plaats(sl, thuis.x, thuis.y);
      im.setDisplaySize(spec.tray.dia, spec.tray.dia);
      laagDing.add(im);
      dingen.push({ im, thuis, zone: -1, waarde: spec.soort === "tegels" ? spec.waarden![i] : 0 });
      if (spec.kist && !sc.rustig) im.setAlpha(0);
      else if (!sc.rustig) {
        im.setAlpha(0).setScale(0.2 / TX);
        sc.tweens.add({ targets: im, alpha: 1, displayWidth: spec.tray.dia, displayHeight: spec.tray.dia, delay: 40 + i * 35, duration: 260, ease: "Back.easeOut" });
      }
    }
    if (!sc.rustig) {
      box.setAlpha(0);
      sc.tweens.add({ targets: box, alpha: 1, duration: 260 });
    }
    /* Het hoopje van de dingen die uit de kist komen: pas zichtbaar als ze eruit springen (bouwKist). */
    let deco: Img | null = null;
    if (spec.deco) {
      const sl = `sps-s1-deco-${spec.deco.vw}`;
      sc.canvasPlaatje(sl, 192, 192, (c) => tekenVoorwerp(c, spec.deco!.vw, 0, 0, 192, 192));
      deco = sc.plaats(sl, spec.deco.x, spec.deco.y);
      deco.setDisplaySize(spec.deco.maat, spec.deco.maat);
      laagDeco.add(deco);
    }
    const kistDeel = spec.kist ? bouwKist(spec, dingen, laagDing) : null;
    const staat: S1Staat = { sleutel, spec, dingen, inhoud: spec.zones.map(() => []), deco, kist: kistDeel?.kist ?? null, land: kistDeel?.land ?? null, box, laagDing, laagSleep, licht, groen, leeg };
    st = staat;

    /* Zacht wiebelen van wat in het hoopje ligt, en af en toe een glinstering (één keer per beeld bijgewerkt, geen filters). */
    if (!sc.rustig) {
      let volgende = 0;
      const sp = vonkTex();
      wiebel = () => {
        if (!st || st !== staat) return;
        const nu = sc.time.now;
        st.dingen.forEach((d, i) => {
          if (d.zone === -1 && !d.vlucht && !sc.tweens.isTweening(d.im)) d.im.setAngle(Math.sin(nu / 520 + i * 1.7) * 3.2);
          else if (d.zone !== -1 && d.zone !== -2) d.im.setAngle(0);
        });
        if (nu > volgende && actief) {
          volgende = nu + 900 + Math.random() * 900;
          const los = st.dingen.filter((d) => d.zone === -1);
          const d = los[Math.floor(Math.random() * los.length)];
          if (d) {
            const v = sc.plaats(sp, d.im.x - 10 + Math.random() * 20, d.im.y - 14).setAlpha(0).setScale(0.1 / TX);
            st.laagSleep.add(v);
            sc.tweens.add({ targets: v, alpha: 1, scale: 0.8 / TX, angle: 70, duration: 260, yoyo: true, onComplete: () => v.destroy() });
          }
        }
      };
      sc.events.on("update", wiebel);
    }
    window.__phaser = {
      ...window.__phaser,
      /* Voor de automatische test: de volgende sleepbeweging (pixels van de pagina), of niets als het klaar is. */
      s1Stap: (soort: string) => { st?.land?.(); return testStap(soort === "fout" ? "fout" : "goed"); },
      sleepPunt: () => {
        if (!actief) return null as unknown as { x: number; y: number };
        const d = st?.dingen.find((x) => x.zone === -1) ?? st?.dingen[0];
        return scherm(d?.im.x ?? 490, d?.im.y ?? 150);
      },
      s1Punt: () => {
        const d = st?.dingen.find((x) => x.zone === -1) ?? st?.dingen[0];
        return scherm(d?.im.x ?? 490, d?.im.y ?? 150);
      },
    };
  }

  /* ---------- plekken ---------- */

  function vakPlek(z: S1Zone, k: number, c: number) {
    const stap = z.dia * 1.08;
    if (z.max === 1) return { x: z.x, y: z.y };
    const rijen = Math.ceil(c / z.per);
    const rij = Math.floor(k / z.per);
    const inRij = Math.min(z.per, c - rij * z.per);
    const col = k % z.per;
    return { x: z.x + (col - (inRij - 1) / 2) * stap, y: z.y + (rij - (rijen - 1) / 2) * stap * 0.98 };
  }

  /** Alles op zijn plek zetten (glijdend): het hoopje boven, de dingen in hun vak. */
  function legHerein(snel = false, duur = 190) {
    if (!st) return;
    const s = st;
    const dur = snel || sc.rustig ? 1 : duur;
    const zet = (d: Ding, x: number, y: number, dia: number) => {
      sc.tweens.killTweensOf(d.im);
      d.vlucht = false;
      const stuit = s.dingen[neerIdx] === d && !snel && !sc.rustig;
      sc.tweens.add({ targets: d.im, x, y, alpha: 1, displayWidth: dia, displayHeight: dia, duration: stuit ? 300 : dur, ease: stuit ? "Back.easeOut" : "Cubic.easeOut" });
    };
    s.dingen.forEach((d) => {
      if (d.zone === -1) zet(d, d.thuis.x, d.thuis.y, s.spec.tray.dia);
    });
    s.inhoud.forEach((lijst, j) =>
      lijst.forEach((i, k) => {
        const p = vakPlek(s.spec.zones[j], k, lijst.length);
        zet(s.dingen[i], p.x, p.y, s.spec.zones[j].dia);
      }),
    );
    s.leeg.forEach((t, j) => t?.setVisible(s.inhoud[j].length === 0));
    neerIdx = -1;
  }

  function stand() {
    if (!st) return;
    const s = st;
    const tel = s.inhoud.map((l) => l.length);
    const waarden = s.inhoud.map((l) => l.map((i) => s.dingen[i].waarde));
    dep.meld()({ soort: "s1stand", tel, waarden, los: s.spec.n - tel.reduce((a, b) => a + b, 0) } satisfies S1Stand);
  }

  /** Zet ding `i` in vak `j` (of terug naar het hoopje bij -1). Een vol tegel-vak geeft zijn tegel terug. */
  function plaats(i: number, j: number) {
    if (!st) return;
    const s = st;
    s.inhoud.forEach((l) => {
      const x = l.indexOf(i);
      if (x >= 0) l.splice(x, 1);
    });
    if (j >= 0) {
      const max = s.spec.zones[j].max;
      if (max !== undefined)
        while (s.inhoud[j].length >= max) {
          const eruit = s.inhoud[j].shift()!;
          s.dingen[eruit].zone = -1;
        }
      s.inhoud[j].push(i);
    }
    s.dingen[i].zone = j;
    s.laagDing.add(s.dingen[i].im);
  }

  /** Dichtstbijzijnde vak bij een punt (binnen 70 punten van de rand), of -1. */
  function vakBij(x: number, y: number) {
    if (!st) return -1;
    let best = -1;
    let bd = 70;
    st.spec.zones.forEach((z, j) => {
      const dx = Math.max(Math.abs(x - z.x) - z.b / 2, 0);
      const dy = Math.max(Math.abs(y - z.y) - z.h / 2, 0);
      const d = Math.hypot(dx, dy);
      if (d < bd) {
        bd = d;
        best = j;
      }
    });
    return best;
  }

  /* ---------- muis en vinger ---------- */

  function waar(p: Ptr): { x: number; y: number } {
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
    const r = sc.game.canvas.getBoundingClientRect();
    return { x: ((cx - r.left) * VLAK_B) / r.width, y: ((cy - r.top) * VLAK_H) / r.height };
  }

  function raak(x: number, y: number) {
    if (!st) return -1;
    let best = -1;
    let bd = 1e9;
    st.dingen.forEach((d, i) => {
      if (d.zone === -2) return;
      const dia = d.zone === -1 ? st!.spec.tray.dia : st!.spec.zones[d.zone].dia;
      const dd = Math.hypot(d.im.x - x, d.im.y - y);
      if (dd <= dia / 2 + 10 && dd < bd) {
        bd = dd;
        best = i;
      }
    });
    return best;
  }

  function neer(p: Ptr) {
    if (!st || !actief || st.spec.vast) return;
    const w = waar(p);
    const i = raak(w.x, w.y);
    if (i < 0) return;
    if (st.dingen[i].vlucht) return;
    const im = st.dingen[i].im;
    druk = { i, x0: w.x, y0: w.y, dx: im.x - w.x, dy: im.y - w.y, sleept: false };
  }

  function lichtOp(j: number) {
    if (!st) return;
    st.licht.forEach((l, x) => {
      const doel = x === j ? 1 : 0;
      if (l.alpha !== doel) l.setAlpha(doel);
    });
  }

  function beweeg(p: Ptr) {
    if (!st) return;
    const s = st;
    const w = waar(p);
    const d = druk;
    if (!d) {
      if (!p.isDown && actief) sc.input.setDefaultCursor(raak(w.x, w.y) >= 0 ? "grab" : "default");
      return;
    }
    if (!d.sleept && Math.hypot(w.x - d.x0, w.y - d.y0) > 9) {
      /* Pakken: het ding komt los en hangt onder de vinger. */
      d.sleept = true;
      sc.input.setDefaultCursor("grabbing");
      const q = s.dingen[d.i];
      plaats(d.i, -2);
      s.laagSleep.add(q.im);
      sc.tweens.killTweensOf(q.im);
      const g = s.spec.tray.dia * 1.12;
      q.im.setDisplaySize(g, g);
      speelLesgeluid("s1Pak");
      schaduw = sc.add.graphics();
      s.laagSleep.addAt(schaduw, 0);
      legHerein();
      stand();
    }
    if (d.sleept) {
      s.dingen[d.i].im.setPosition(w.x + d.dx, w.y + d.dy);
      lichtOp(vakBij(w.x + d.dx, w.y + d.dy));
      if (schaduw) {
        const im = s.dingen[d.i].im;
        schaduw.clear().fillStyle(0x020a24, 0.28).fillEllipse(im.x + 5, im.y + im.displayHeight * 0.5 + 6, im.displayWidth * 0.8, im.displayHeight * 0.22);
      }
    }
  }

  function los(p: Ptr) {
    const d = druk;
    druk = null;
    sc.input.setDefaultCursor("default");
    if (!st) return;
    const s = st;
    lichtOp(-1);
    schaduw?.destroy();
    schaduw = null;
    if (!d) return;
    const q = s.dingen[d.i];
    const totaal = () => s.inhoud.reduce((a, l) => a + l.length, 0);
    if (!d.sleept) {
      /* Tikken werkt ook: in het hoopje = naar het vak met de minste, in een vak = terug. */
      if (!actief) return;
      if (q.zone === -1) {
        let j = 0;
        s.inhoud.forEach((l, x) => {
          const vol = s.spec.zones[x].max !== undefined && l.length >= s.spec.zones[x].max!;
          const volJ = s.spec.zones[j].max !== undefined && s.inhoud[j].length >= s.spec.zones[j].max!;
          if ((volJ && !vol) || (!vol && l.length < s.inhoud[j].length)) j = x;
        });
        plaats(d.i, j);
        speelLesgeluid("s1Leg", Math.max(0, totaal() - 1));
        neerIdx = d.i;
      } else {
        plaats(d.i, -1);
        speelLesgeluid("s1Terug");
      }
      legHerein();
      stand();
      return;
    }
    /* Loslaten: bij een vak = erin; anders terug naar het hoopje. */
    const w = waar(p);
    const j = vakBij(w.x + d.dx, w.y + d.dy);
    plaats(d.i, j);
    speelLesgeluid(j >= 0 ? "s1Leg" : "s1Terug", Math.max(0, totaal() - 1));
    neerIdx = j >= 0 ? d.i : -1;
    if (j >= 0 && s.spec.soort === "dingen" && s.spec.zones.every((z, x) => (s.inhoud[x].length > 0) || z.max !== undefined) && totaal() === s.spec.n) sc.time.delayedCall(160, () => speelLesgeluid("s1Klaar"));
    legHerein();
    stand();
  }

  /* ---------- uitleg en test ---------- */

  function auto(t: number) {
    if (!st) return;
    const s = st;
    laatsteAuto = t;
    s.inhoud.forEach((l) => (l.length = 0));
    s.dingen.forEach((d) => (d.zone = -1));
    s.spec.route.slice(0, t).forEach(([i, j]) => plaats(i, j));
    if (t > 0) speelLesgeluid("s1Leg", t - 1);
    if (s.deco && t > 0) {
      if (t === 1) speelLesgeluid("machineAan");
      if (!sc.rustig) {
        sc.tweens.killTweensOf(s.deco);
        const d0 = s.spec.deco!.maat;
        s.deco.setAngle(0).setDisplaySize(d0, d0);
        sc.tweens.add({ targets: s.deco, angle: { from: -3, to: 3 }, displayHeight: d0 * 1.05, duration: 90, yoyo: true, repeat: 1, onComplete: () => s.deco?.setAngle(0).setDisplaySize(d0, d0) });
      }
    }
    legHerein(false, s.deco ? 380 : 190);
  }

  /** De volgende sleepbeweging voor de automatische test. `doel` = oplossing (goed) of fout. */
  function testStap(soort: "goed" | "fout") {
    if (!st || !actief) return null;
    const s = st;
    const doel = soort === "fout" ? s.spec.fout : s.spec.oplossing;
    const naarVak = (j: number) => scherm(s.spec.zones[j].x, s.spec.zones[j].y);
    const vanDing = (i: number) => scherm(s.dingen[i].im.x, s.dingen[i].im.y);
    if (s.spec.soort === "dingen") {
      const tel = s.inhoud.map((l) => l.length);
      const tekort = doel.findIndex((g, j) => tel[j] < g);
      if (tekort < 0) return null;
      const teveel = tel.findIndex((c, j) => c > doel[j]);
      const bron = teveel >= 0 ? s.inhoud[teveel][s.inhoud[teveel].length - 1] : s.dingen.findIndex((d) => d.zone === -1);
      if (bron < 0) return null;
      return { van: vanDing(bron), naar: naarVak(tekort) };
    }
    for (let j = 0; j < doel.length; j++) {
      if (doel[j] < 0) continue;
      const nu = s.inhoud[j].map((i) => s.dingen[i].waarde);
      if (nu.length === 1 && nu[0] === doel[j]) continue;
      const i = s.dingen.findIndex((d) => d.waarde === doel[j] && !(d.zone >= 0 && doel[d.zone] === d.waarde));
      if (i < 0) continue;
      return { van: vanDing(i), naar: naarVak(j) };
    }
    return null;
  }

  return {
    zet(spec: S1Spec | null, ac: boolean) {
      actief = ac;
      if (!spec) {
        if (st) weg();
        return;
      }
      const sleutel = `${spec.nr}`;
      if (!st || st.sleutel !== sleutel) {
        weg();
        bouw(spec, sleutel);
      }
      if (st && spec.auto !== undefined && spec.auto !== laatsteAuto) auto(spec.auto);
    },
    neer,
    beweeg,
    los,
    /** Goed: lichtgolf boven elk vak, de dingen huppelen even, de vakken kleuren zacht groen. */
    goed() {
      if (!st) return;
      const s = st;
      s.spec.zones.forEach((z) => sc.golf(z.x, z.y));
      speelLesgeluid("s1Vonk");
      /* Minsom: wat niet in het vak ligt, gaat weg (grijs en dof). */
      if (s.spec.restWeg) s.dingen.forEach((d) => d.zone === -1 && d.im.setTint(0x8a93a8).setAlpha(0.4));
      if (sc.rustig) return;
      const sp = vonkTex();
      s.dingen.forEach((d, i) => {
        if (d.zone < 0 || i % 2) return;
        const v = sc.plaats(sp, d.im.x, d.im.y).setAlpha(0).setScale(0.3 / TX).setTint(i % 4 === 0 ? 0xffe066 : 0xffffff);
        s.laagSleep.add(v);
        sc.tweens.add({ targets: v, alpha: 1, scale: 0.9 / TX, x: v.x + (Math.random() - 0.5) * 70, y: v.y - 30 - Math.random() * 40, duration: 560, delay: i * 25, yoyo: false, onComplete: () => v.destroy() });
        sc.tweens.add({ targets: v, alpha: 0, delay: i * 25 + 300, duration: 260 });
      });
      s.dingen.forEach((d, i) => sc.tweens.add({ targets: d.im, y: d.im.y - 14, duration: 150, delay: i * 25, yoyo: true, ease: "Sine.easeOut" }));
      s.groen.forEach((gr) => sc.tweens.add({ targets: gr, alpha: 1, duration: 200, yoyo: true, hold: 500 }));
    },
    fout() {
      if (st) sc.schud(st.box);
      if (st) st.dingen.forEach((d) => d.zone >= 0 && sc.tweens.add({ targets: d.im, angle: 8, duration: 60, yoyo: true, repeat: 2, onComplete: () => d.im.setAngle(0) }));
    },
    /** Voor `npm run vloeiend`: de dingen rollen steeds één voor één naar hun vak en weer terug. */
    demo(ms: number) {
      if (!st) return false;
      const eind = performance.now() + ms;
      let t = 0;
      const rol = () => {
        if (performance.now() > eind || !st) return;
        auto(t++ % (st.spec.route.length + 1));
        sc.time.delayedCall(240, rol);
      };
      rol();
      return true;
    },
    /** Het rondje (BOUWREGELS 7.8): waar ligt ding `i` in het hoopje? In de coordinaten van de pagina; null als het er niet (meer) ligt. */
    rondjeVak(i: number) {
      const d = st?.dingen[i];
      if (!st || !d || d.zone >= 0) return null;
      const h = st.spec.tray.dia / 2;
      return { x0: d.thuis.x - h, y0: d.thuis.y - h, x1: d.thuis.x + h, y1: d.thuis.y + h };
    },
    weg,
  };
}

export type S1Motor = ReturnType<typeof maakS1>;
