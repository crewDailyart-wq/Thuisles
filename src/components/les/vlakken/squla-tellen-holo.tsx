"use client";

/**
 * Tellen als hologrammen (30 oktober 2026, opdracht eigenaar): het speelvlak
 * van de lessen "Tellen" naar Squla groep 3 (Tellen met fruit, Resultatief
 * tellen 1, 2 en 3). Bliepo tovert een groep voorwerpen tevoorschijn vóór de
 * blauwe ruimte; het kind telt en kiest het getal (dat gebeurt bij Bliepo,
 * met `l.kies`).
 *
 * Vier manieren om de voorwerpen neer te zetten (`opgave.vorm`):
 * - `rijen5`: rijen van 5, links uitgelijnd; de rijen kunnen om en om een
 *   ander plaatje of een andere kleur hebben;
 * - `rijen10`: rijen van 10 (tot 50), ook om en om;
 * - `verspreid`: los door elkaar, nooit over elkaar heen;
 * - `zak`: een dichte zak met een tiental erop, en een paar losse.
 *
 * Samen tellen (`geteld`): Bliepo telt mee en de getelde voorwerpen lichten
 * één voor één op en worden dan dof. Bij rijen komt achter elke volle rij
 * het getal tot dan toe (5, 10, 15 …); bij verspreide voorwerpen zet Bliepo
 * voor elk voorwerp een streepje (turven, in groepjes van 5); bij de zak
 * staat boven elk geteld los voorwerp het getal.
 *
 * Een tussendoortje (`memory`): 10 kaartjes, 5 paren. Eerst even open, dan
 * dicht; het kind zoekt twee dezelfde. Meldt `{ soort: "memoryKlaar" }`.
 *
 * `goed` en `fout` zijn tellers: ophogen = lichtgolf of zacht schudden.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import type { Vlakbasis } from "../soort";
import { holoBasis, TX, WARM, WERELDKLEUR, type PhaserModule } from "../holo/basis";
import { HOLO_CANVAS, useHoloMotor } from "../holo/motor";
import { speelLesgeluid } from "@/lib/lesgeluiden";
import { hexGetal, KLEUR, MAAT, teken, tekenZak, tekenZakgetal, type Kleurnaam, type Soort } from "./squla-tellen-tekenen";
import s from "./squla-tellen.module.css";

export type { Kleurnaam, Soort };

export type Plaatje = { soort: Soort; kleur: Kleurnaam };
export type Telvorm = "rijen5" | "rijen10" | "verspreid" | "zak";

export type Telopgave = {
  id: string;
  vorm: Telvorm;
  /** Hoeveel voorwerpen er los in beeld staan (bij de zak: de losse). */
  n: number;
  /** Het tiental op de zak (alleen bij `zak`). */
  zak?: number;
  /** Het plaatje per rij, om en om (bij verspreid en zak alleen het eerste). */
  plaatjes: Plaatje[];
};

export type Memorykaartjes = { id: string; paren: Plaatje[] };

export type TelVlakProps = {
  opgave: Telopgave | null;
  /** Hoeveel er samen geteld zijn (in de telvolgorde). */
  geteld?: number;
  /** De zak licht op (samen tellen bij de zak). */
  zakLicht?: boolean;
  goed?: number;
  fout?: number;
  memory?: Memorykaartjes | null;
  /** Alle plaatjes en zakken van de les: worden vooruit gebakken (geen hapering later). */
  voorraad?: { plaatjes: Plaatje[]; zakken: number[] };
};

/* ---------- waar staat wat (punten van het vlak, 980 × 720) ---------- */

type Plek = { x: number; y: number; p: Plaatje };
type Indeling = {
  id: string;
  vorm: Telvorm;
  schaal: number;
  plekken: Plek[];
  /** De volgorde waarin Bliepo telt: indexen in `plekken`. */
  volgorde: number[];
  /** Per rij (alleen bij rijen): de indexen en waar het getal achter de rij komt. */
  rijen: { idx: number[]; x: number; y: number }[];
  zak: { x: number; y: number; getal: number } | null;
  /** Hoe snel Bliepo telt: ms per voorwerp. */
  stap: number;
};

/** Een vaste "toevalsreeks" per opgave: elke keer dezelfde plekken. */
function zaad(tekst: string) {
  let h = 2166136261;
  for (const ch of tekst) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const RIJ5 = { cel: 122, schaal: 1, cx: 490, cy: 360 };
const RIJ10 = { cel: 84, schaal: 0.76, cx: 455, cy: 360 };
const VERSPREID = { x0: 90, x1: 890, y0: 125, y1: 625, schaal: 0.92 };

export function indeling(o: Telopgave): Indeling {
  if (o.vorm === "rijen5" || o.vorm === "rijen10") {
    const per = o.vorm === "rijen5" ? 5 : 10;
    const m = o.vorm === "rijen5" ? RIJ5 : RIJ10;
    const aantalRijen = Math.ceil(o.n / per);
    const x0 = m.cx - (per * m.cel) / 2 + m.cel / 2;
    const y0 = m.cy - (aantalRijen * m.cel) / 2 + m.cel / 2;
    const plekken = Array.from({ length: o.n }, (_, i) => {
      const r = Math.floor(i / per);
      return { x: x0 + (i % per) * m.cel, y: y0 + r * m.cel, p: o.plaatjes[r % o.plaatjes.length] };
    });
    const rijen = Array.from({ length: aantalRijen }, (_, r) => ({
      idx: Array.from({ length: Math.min(per, o.n - r * per) }, (_, k) => r * per + k),
      x: x0 + (per - 1) * m.cel + m.cel / 2 + (o.vorm === "rijen5" ? 46 : 36),
      y: y0 + r * m.cel,
    }));
    return { id: o.id, vorm: o.vorm, schaal: m.schaal, plekken, volgorde: plekken.map((_, i) => i), rijen, zak: null, stap: o.vorm === "rijen5" ? 150 : 90 };
  }
  if (o.vorm === "zak") {
    const per = 5;
    const cel = 104;
    const aantalRijen = Math.ceil(o.n / per);
    const y0 = 360 - (aantalRijen * cel) / 2 + cel / 2;
    const plekken = Array.from({ length: o.n }, (_, i) => ({ x: 480 + (i % per) * cel, y: y0 + Math.floor(i / per) * cel, p: o.plaatjes[0] }));
    return { id: o.id, vorm: o.vorm, schaal: 0.86, plekken, volgorde: plekken.map((_, i) => i), rijen: [], zak: { x: 250, y: 370, getal: o.zak ?? 0 }, stap: 260 };
  }
  /* Verspreid: willekeurig maar vast, met genoeg ruimte ertussen. */
  const V = VERSPREID;
  let punten: { x: number; y: number }[] = [];
  for (let d = 124; d >= 92 && punten.length < o.n; d -= 4) {
    const r = zaad(`${o.id}-${d}`);
    punten = [];
    for (let poging = 0; poging < 6000 && punten.length < o.n; poging++) {
      const x = V.x0 + r() * (V.x1 - V.x0);
      const y = V.y0 + r() * (V.y1 - V.y0);
      if (punten.every((q) => Math.hypot(q.x - x, q.y - y) >= d)) punten.push({ x, y });
    }
  }
  const plekken = punten.map((q) => ({ ...q, p: o.plaatjes[0] }));
  /* Tellen in banen van boven naar beneden, heen en weer (zoals je met je vinger zou gaan). */
  const baan = (y: number) => Math.floor((y - V.y0) / 125);
  const volgorde = plekken
    .map((_, i) => i)
    .sort((a, b) => {
      const ba = baan(plekken[a].y);
      const bb = baan(plekken[b].y);
      if (ba !== bb) return ba - bb;
      return ba % 2 ? plekken[b].x - plekken[a].x : plekken[a].x - plekken[b].x;
    });
  return { id: o.id, vorm: o.vorm, schaal: V.schaal, plekken, volgorde, rijen: [], zak: null, stap: 260 };
}

/* ---------- memory ---------- */

const KAART = { b: 128, h: 158, dx: 152, dy: 186, cx: 490, cy: 340 };
const kaartPlek = (i: number) => ({ x: KAART.cx + ((i % 5) - 2) * KAART.dx, y: KAART.cy + (Math.floor(i / 5) - 0.5) * KAART.dy });

/** De 10 kaartjes: elk plaatje twee keer, vast geschud per spel. */
export function memoryKaartjes(m: Memorykaartjes): Plaatje[] {
  const r = zaad(m.id);
  const lijst = [...m.paren, ...m.paren];
  for (let i = lijst.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [lijst[i], lijst[j]] = [lijst[j], lijst[i]];
  }
  return lijst;
}
const zelfde = (a: Plaatje, b: Plaatje) => a.soort === b.soort && a.kleur === b.kleur;

/* ---------- de scène ---------- */

type Kaartstand = { id: string; plaatjes: Plaatje[]; open: boolean[]; schud: number[]; schudKeer: number };

interface TelScene {
  zetIndeling(o: Indeling | null): void;
  zetGeteld(n: number): void;
  zakLicht(aan: boolean): void;
  goed(): void;
  fout(): void;
  kaarten(st: Kaartstand | null): void;
  bakVooruit(plaatjes: Plaatje[], zakken: number[]): void;
}

function maakTelScene(Phaser: PhaserModule, rustig: boolean) {
  const Basis = holoBasis(Phaser, rustig);
  type Img = import("phaser").GameObjects.Image;
  type Box = import("phaser").GameObjects.Container;
  type Klok = import("phaser").Time.TimerEvent;

  class Tel extends Basis implements TelScene {
    groep: Box | null = null;
    items: Img[] = [];
    zakBox: Box | null = null;
    zakRing: Img | null = null;
    ind: Indeling | null = null;
    geteld = 0;
    klokken: Klok[] = [];
    kaartBoxen: Box[] = [];
    kaartId = "";
    kaartOpen: boolean[] = [];
    schudKeer = 0;

    constructor() {
      super("squla-tellen");
    }

    maak() {
      const rond = (c: CanvasRenderingContext2D, vul: string, lijn: string) => {
        c.beginPath();
        c.roundRect(3, 3, KAART.b - 6, KAART.h - 6, 18);
        c.fillStyle = vul;
        c.fill();
        c.strokeStyle = lijn;
        c.lineWidth = 3;
        c.stroke();
      };
      /* De achterkant van een memorykaartje: een sterretje van licht. */
      this.canvasPlaatje("sqt-achter", KAART.b, KAART.h, (c) => {
        rond(c, "rgba(24,70,160,0.82)", "#9fe9ff");
        c.strokeStyle = "rgba(190,240,255,0.35)";
        c.lineWidth = 2;
        for (let r = 16; r <= 46; r += 15) {
          c.beginPath();
          c.arc(KAART.b / 2, KAART.h / 2, r, 0, Math.PI * 2);
          c.stroke();
        }
        c.beginPath();
        for (let i = 0; i < 8; i++) {
          const r = i % 2 ? 6 : 16;
          const h = -Math.PI / 2 + (i * Math.PI) / 4;
          const x = KAART.b / 2 + r * Math.cos(h);
          const y = KAART.h / 2 + r * Math.sin(h);
          if (i) c.lineTo(x, y);
          else c.moveTo(x, y);
        }
        c.closePath();
        c.fillStyle = "#ffffff";
        c.fill();
      });
      this.bak("sqt-achter", "sqt-achter-g", WERELDKLEUR.oceaan);
      this.canvasPlaatje("sqt-voor", KAART.b, KAART.h, (c) => rond(c, "rgba(12,40,100,0.7)", "#ffffff"));
      this.bak("sqt-voor", "sqt-voor-g", WERELDKLEUR.neutraal);
    }

    /** Het plaatje van een voorwerp, met gebakken gloed (één keer per soort en kleur). */
    tex(p: Plaatje) {
      const sl = `sqt-${p.soort}-${p.kleur}`;
      if (!this.textures.exists(`${sl}-g`)) {
        this.canvasPlaatje(sl, MAAT, MAAT, (c) => teken(c, p.soort, KLEUR[p.kleur]));
        this.bak(sl, `${sl}-g`, hexGetal(KLEUR[p.kleur]));
      }
      return `${sl}-g`;
    }

    /** De zak: één keer gebakken; het getal is een los, klein plaatje erop. */
    zakTex() {
      if (!this.textures.exists("sqt-zak-g")) {
        this.canvasPlaatje("sqt-zak", 200, 240, (c) => tekenZak(c));
        this.bak("sqt-zak", "sqt-zak-g", WARM);
      }
      return "sqt-zak-g";
    }

    zakGetal(getal: number) {
      const sl = `sqt-zakgetal-${getal}`;
      this.canvasPlaatje(sl, 116, 84, (c) => tekenZakgetal(c, getal));
      return sl;
    }

    stopKlokken() {
      this.klokken.forEach((k) => k.remove(false));
      this.klokken = [];
    }

    zetIndeling(o: Indeling | null) {
      this.stopKlokken();
      const oud = this.groep;
      this.groep = null;
      this.items = [];
      this.zakBox = null;
      this.zakRing?.destroy();
      this.zakRing = null;
      this.geteld = 0;
      this.ind = o;
      if (oud) this.verdwijn(oud);
      if (!o) return;
      const cx = 490;
      const cy = 380;
      const g = this.add.container(cx, cy);
      if (o.zak) {
        const z = this.add.container(o.zak.x - cx, o.zak.y - cy);
        z.add(this.plaats(this.zakTex(), 0, 0));
        /* het bordje zit in de zak op (42..158, 112..196): het midden is 37 punten onder het midden van de zak */
        z.add(this.plaats(this.zakGetal(o.zak.getal), 0, 34));
        /* Een voorbeeldje van wat erin zit, bovenop de zak. */
        if (o.plekken[0]) z.add(this.plaats(this.tex(o.plekken[0].p), 0, -48).setScale(0.62 / TX));
        g.add(z);
        this.zakBox = z;
      }
      for (const pl of o.plekken) {
        const im = this.plaats(this.tex(pl.p), pl.x - cx, pl.y - cy).setScale(o.schaal / TX);
        g.add(im);
        this.items.push(im);
      }
      this.groep = g;
      this.druk(900);
      this.tover(g);
    }

    zetGeteld(n: number) {
      const o = this.ind;
      if (!o) return;
      const van = this.geteld;
      this.geteld = n;
      if (n <= van) {
        this.stopKlokken();
        o.volgorde.forEach((idx, k) => this.items[idx]?.setAlpha(k < n ? 0.4 : 1));
        return;
      }
      this.druk((n - van) * o.stap + 500);
      for (let k = van; k < n; k++) {
        const im = this.items[o.volgorde[k]];
        if (!im) continue;
        const basis = o.schaal / TX;
        const doe = () => {
          if (this.rustig) {
            im.setAlpha(0.4);
            return;
          }
          this.tweens.add({ targets: im, scale: basis * 1.22, duration: 110, yoyo: true, ease: "Sine.easeOut", onComplete: () => im.setScale(basis) });
          this.tweens.add({ targets: im, alpha: 0.4, delay: 200, duration: 220 });
        };
        if (k === van) doe();
        else this.klokken.push(this.time.delayedCall((k - van) * o.stap, doe));
      }
    }

    zakLicht(aan: boolean) {
      this.zakRing?.destroy();
      this.zakRing = null;
      const o = this.ind;
      if (aan && o?.zak) this.zakRing = this.selectieRing(o.zak.x, o.zak.y, 128, WARM);
    }

    goed() {
      const g = this.groep;
      if (!g) return;
      this.druk(800);
      this.golf(490, 380);
      if (this.rustig) return;
      const o = this.ind;
      this.items.forEach((im, i) => {
        const basis = (o?.schaal ?? 1) / TX;
        this.tweens.add({ targets: im, scale: basis * 1.12, delay: i * 18, duration: 140, yoyo: true, onComplete: () => im.setScale(basis) });
      });
    }

    fout() {
      this.druk(500);
      if (this.groep) this.schud(this.groep);
    }

    /* ---------- memory ---------- */

    kaarten(st: Kaartstand | null) {
      this.druk(600);
      if (!st || st.id !== this.kaartId) {
        this.kaartBoxen.forEach((b) => this.verdwijn(b));
        this.kaartBoxen = [];
        this.kaartOpen = [];
        this.kaartId = st?.id ?? "";
        if (!st) return;
        st.plaatjes.forEach((p, i) => {
          const q = kaartPlek(i);
          const voor = this.add.container(0, 0, [this.plaats("sqt-voor-g", 0, 0), this.plaats(this.tex(p), 0, 0).setScale(1.05 / TX)]);
          const achter = this.plaats("sqt-achter-g", 0, 0);
          voor.setVisible(st.open[i]);
          achter.setVisible(!st.open[i]);
          const box = this.add.container(q.x, q.y, [voor, achter]);
          this.kaartBoxen.push(box);
          this.kaartOpen.push(st.open[i]);
          this.tover(box, { vertraging: i * 40 });
        });
        this.schudKeer = st.schudKeer;
        return;
      }
      st.open.forEach((open, i) => {
        if (open === this.kaartOpen[i]) return;
        this.kaartOpen[i] = open;
        const box = this.kaartBoxen[i];
        const [voor, achter] = box.list as [Box, Img];
        const wissel = () => {
          voor.setVisible(open);
          achter.setVisible(!open);
        };
        if (this.rustig) return wissel();
        this.tweens.add({
          targets: box,
          scaleX: 0,
          duration: 110,
          ease: "Sine.easeIn",
          onComplete: () => {
            wissel();
            this.tweens.add({ targets: box, scaleX: 1, duration: 130, ease: "Sine.easeOut" });
          },
        });
      });
      if (st.schudKeer !== this.schudKeer) {
        this.schudKeer = st.schudKeer;
        st.schud.forEach((i) => this.kaartBoxen[i] && this.schud(this.kaartBoxen[i]));
      }
    }

    /**
     * Alles wat de les nodig heeft vooruit bakken, maar alleen als er niets
     * beweegt (Bliepo praat, het beeld staat stil): één plaatje per keer. Een
     * gloed bakken kost even tijd; midden in een animatie zou dat haperen.
     */
    rij: (() => void)[] = [];
    drukTot = 0;
    druk(ms: number) {
      this.drukTot = Math.max(this.drukTot, performance.now() + ms);
    }
    bakVooruit(plaatjes: Plaatje[], zakken: number[]) {
      this.rij = [...plaatjes.map((p) => () => this.tex(p)), ...(zakken.length ? [() => this.zakTex()] : []), ...zakken.map((z) => () => this.zakGetal(z))];
      /* Eerst rustig het welkom (en de eerste tovering); daarna in de stille stukjes. */
      this.druk(2500);
      this.time.addEvent({
        delay: 150,
        loop: true,
        callback: () => {
          if (!this.rij.length || performance.now() < this.drukTot) return;
          this.rij.shift()!();
          this.druk(150);
        },
      });
    }

    /** Voor `npm run vloeiend`: de groep van nu steeds opnieuw tevoorschijn toveren en samen tellen (met plaatjes die er al zijn). */
    demo(ms: number) {
      const eind = performance.now() + ms;
      const p = this.ind?.plekken.map((q) => q.p) ?? [];
      const a = p[0] ?? { soort: "appel", kleur: "rood" };
      const b = p.find((q) => q.soort !== a.soort || q.kleur !== a.kleur) ?? a;
      const vormen: Telopgave[] = [
        { id: "demo-a", vorm: "verspreid", n: 18, plaatjes: [a] },
        { id: "demo-b", vorm: "rijen10", n: 46, plaatjes: [a, b] },
        { id: "demo-c", vorm: "rijen5", n: 17, plaatjes: [a, b] },
      ];
      let k = 0;
      const stap = () => {
        if (performance.now() > eind) return;
        this.zetIndeling(indeling(vormen[k++ % vormen.length]));
        this.time.delayedCall(450, () => this.zetGeteld(10));
        this.time.delayedCall(1100, () => this.goed());
        this.time.delayedCall(1400, stap);
      };
      stap();
    }
  }
  return Tel as unknown as new () => import("phaser").Scene;
}

/* ---------- het vlak ---------- */

/** Turven: elk voorwerp een streepje, in groepjes van 5 (vier rechtop, de vijfde schuin erdoor). */
function Turven({ aantal, van, stap }: { aantal: number; van: number; stap: number }) {
  if (aantal <= 0) return null;
  const groepen = Math.ceil(aantal / 5);
  const breed = groepen * 64 + (groepen - 1) * 22;
  return (
    <svg className={s.turven} style={{ left: 490 - breed / 2 - 8, top: 18, width: breed + 16, height: 70 }} viewBox={`-8 -6 ${breed + 16} 70`} aria-hidden>
      {Array.from({ length: aantal }, (_, i) => {
        const gx = Math.floor(i / 5) * 86;
        const j = i % 5;
        const d = Math.max(0, i - van) * stap;
        const stijl = { animationDelay: `${d}ms` };
        return j < 4 ? (
          <line key={i} className={s.streep} style={stijl} x1={gx + 8 + j * 14} y1={6} x2={gx + 8 + j * 14} y2={54} />
        ) : (
          <line key={i} className={s.streep} style={stijl} x1={gx - 2} y1={46} x2={gx + 62} y2={14} />
        );
      })}
    </svg>
  );
}

export function SqulaTelVlak({ opgave, geteld = 0, zakLicht = false, goed = 0, fout = 0, memory = null, voorraad, meld, schaal }: TelVlakProps & Vlakbasis) {
  const { plek, scene } = useHoloMotor<TelScene>(schaal, maakTelScene);
  const voorraadSleutel = voorraad ? JSON.stringify(voorraad) : "";
  useEffect(() => {
    if (!scene || !voorraadSleutel) return;
    const v = JSON.parse(voorraadSleutel) as { plaatjes: Plaatje[]; zakken: number[] };
    scene.bakVooruit(v.plaatjes, v.zakken);
  }, [scene, voorraadSleutel]);
  const opgaveSleutel = opgave ? JSON.stringify(opgave) : "";
  const ind = useMemo(() => (opgaveSleutel ? indeling(JSON.parse(opgaveSleutel) as Telopgave) : null), [opgaveSleutel]);

  /*
    Vanaf waar Bliepo nu meetelt: wat al geteld was, staat er meteen; wat erbij komt,
    verschijnt één voor één (zie de vertraging per getal en streepje).
  */
  const [tel, setTel] = useState({ id: "", geteld: 0, van: 0 });
  const id = ind?.id ?? "";
  if (tel.id !== id || tel.geteld !== geteld) setTel({ id, geteld, van: tel.id === id ? Math.min(tel.geteld, geteld) : 0 });
  const van = tel.id === id ? tel.van : 0;

  /* De opgave: Bliepo tovert hem tevoorschijn (alleen bij een nieuwe opgave). */
  useEffect(() => {
    scene?.zetIndeling(ind);
  }, [scene, ind]);

  useEffect(() => {
    if (scene && ind) scene.zetGeteld(geteld);
  }, [scene, ind, geteld]);

  useEffect(() => {
    scene?.zakLicht(zakLicht);
  }, [scene, ind, zakLicht]);

  useEffect(() => {
    if (scene && goed > 0) scene.goed();
  }, [scene, goed]);
  useEffect(() => {
    if (scene && fout > 0) scene.fout();
  }, [scene, fout]);

  /* De getallen bij het samen tellen. */
  const labels: { k: string; x: number; y: number; tekst: number; d: number; groot: boolean }[] = [];
  if (ind && geteld > 0 && ind.vorm !== "verspreid") {
    const plekVan = new Map(ind.volgorde.map((idx, k) => [idx, k]));
    const vol = new Set<number>();
    for (const [r, rij] of ind.rijen.entries()) {
      const per = ind.vorm === "rijen5" ? 5 : 10;
      const laatste = rij.idx[rij.idx.length - 1];
      if (rij.idx.length === per && geteld > laatste) {
        rij.idx.forEach((i) => vol.add(i));
        labels.push({ k: `r${r}`, x: rij.x, y: rij.y, tekst: laatste + 1, d: Math.max(0, laatste - van) * ind.stap, groot: true });
      }
    }
    ind.volgorde.slice(0, geteld).forEach((idx) => {
      if (vol.has(idx)) return;
      const k = plekVan.get(idx) ?? 0;
      const p = ind.plekken[idx];
      labels.push({ k: `i${idx}`, x: p.x, y: p.y - 56 * ind.schaal, tekst: (ind.zak?.getal ?? 0) + k + 1, d: Math.max(0, k - van) * ind.stap, groot: false });
    });
  }

  return (
    <div className={s.vlak}>
      <div ref={plek} style={HOLO_CANVAS} aria-hidden />
      {ind?.vorm === "verspreid" && <Turven aantal={geteld} van={van} stap={ind.stap} />}
      {labels.map((b) => (
        <div key={b.k} className={b.groot ? s.rijgetal : s.telgetal} style={{ left: b.x, top: b.y, animationDelay: `${b.d}ms` }} aria-hidden>
          {b.tekst}
        </div>
      ))}
      {memory && <Memory key={memory.id} memory={memory} scene={scene} meld={meld} />}
    </div>
  );
}

/* ---------- memory: twee dezelfde zoeken ---------- */

function Memory({ memory, scene, meld }: { memory: Memorykaartjes; scene: TelScene | null; meld: Vlakbasis["meld"] }) {
  const [plaatjes] = useState(() => memoryKaartjes(memory));
  const [kijk, setKijk] = useState(true);
  const [open, setOpen] = useState<number[]>([]);
  const [gevonden, setGevonden] = useState<number[]>([]);
  const [schud, setSchud] = useState<{ i: number[]; keer: number }>({ i: [], keer: 0 });
  const bezig = useRef(false);
  const klaar = useRef(false);

  /* Eerst even alles open om te onthouden. */
  useEffect(() => {
    if (!scene) return;
    const t = setTimeout(() => setKijk(false), 3200);
    return () => clearTimeout(t);
  }, [scene]);

  const isOpen = plaatjes.map((_, i) => kijk || open.includes(i) || gevonden.includes(i));
  const openSleutel = isOpen.join(",");

  useEffect(() => {
    scene?.kaarten({ id: memory.id, plaatjes, open: openSleutel.split(",").map((x) => x === "true"), schud: schud.i, schudKeer: schud.keer });
  }, [scene, memory.id, plaatjes, openSleutel, schud]);

  useEffect(
    () => () => {
      scene?.kaarten(null);
    },
    [scene],
  );

  /* Voor de automatische test: welk kaartje nu verder helpt. */
  useEffect(() => {
    if (kijk) return;
    const dicht = plaatjes.map((_, i) => i).filter((i) => !gevonden.includes(i) && !open.includes(i));
    const doel = open.length === 1 ? dicht.find((i) => zelfde(plaatjes[i], plaatjes[open[0]])) : dicht[0];
    window.__phaser = { ...window.__phaser, antwoord: doel === undefined ? null : `kaart-${doel}` };
  }, [kijk, open, gevonden, plaatjes]);

  function tik(i: number) {
    if (kijk || bezig.current || klaar.current || open.includes(i) || gevonden.includes(i)) return;
    speelLesgeluid("tik");
    const nu = [...open, i];
    if (nu.length < 2) {
      setOpen(nu);
      return;
    }
    if (zelfde(plaatjes[nu[0]], plaatjes[nu[1]])) {
      const alle = [...gevonden, ...nu];
      setGevonden(alle);
      setOpen([]);
      setTimeout(() => speelLesgeluid("goed"), 260);
      if (alle.length === plaatjes.length) {
        klaar.current = true;
        setTimeout(() => meld({ soort: "memoryKlaar" }), 900);
      }
      return;
    }
    setOpen(nu);
    bezig.current = true;
    setTimeout(() => {
      speelLesgeluid("mis");
      setSchud((x) => ({ i: nu, keer: x.keer + 1 }));
    }, 300);
    setTimeout(() => {
      setOpen([]);
      bezig.current = false;
    }, 1300);
  }

  return (
    <>
      {plaatjes.map((_, i) => {
        const q = kaartPlek(i);
        const weg = gevonden.includes(i);
        return (
          <button
            key={i}
            type="button"
            className={s.kaartje}
            style={{ left: q.x - KAART.b / 2, top: q.y - KAART.h / 2, width: KAART.b, height: KAART.h }}
            data-ding={`kaart-${i}`}
            disabled={kijk || weg}
            aria-label={`Kaartje ${i + 1}`}
            onClick={() => tik(i)}
          />
        );
      })}
    </>
  );
}

/* ---------- de kaart aan het eind ---------- */

/** Op de verzamelkaart: drie rijtjes van vijf rondjes met een vinger die telt (244 × 190). */
export function KaartTellen() {
  return (
    <>
      {[0, 1, 2].map((r) =>
        [0, 1, 2, 3, 4].map((k) => (
          <circle key={`${r}-${k}`} cx={52 + k * 34} cy={50 + r * 40} r={13} fill={r === 1 ? "#ffd36e" : "#7fe9ff"} stroke="#ffffff" strokeWidth={2.5} />
        )),
      )}
      <text x={212} y={58} fontSize={22} fontWeight={800} fill="#ffffff">5</text>
      <text x={204} y={98} fontSize={22} fontWeight={800} fill="#ffffff">10</text>
      <text x={204} y={138} fontSize={22} fontWeight={800} fill="#ffffff">15</text>
    </>
  );
}
