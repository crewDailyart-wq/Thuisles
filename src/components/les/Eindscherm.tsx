"use client";

/**
 * PROEF: HET NIEUWE EINDSCHERM EN DE SLEUTELTELLER (Sara, 24 november 2026; EINDSCHERM-ONTWERP.md).
 *
 * Alleen in lessen met `eindscherm: true` in het draaiboek (nu alleen Tellen extra). Alle andere lessen houden de kaart.
 * Volgorde op het eindscherm:
 *   1. feest (±2 s): Bliepo juicht (het lesscherm), confetti in code, het feestgeluid (versie A feest2, versie B feest1);
 *   2. de gouden ster groot met een zachte pop en fonkelingen, met "Les af!";
 *   3. de sleutels van deze les: kleine sleuteltjes vliegen naar de teller, het getal telt mee;
 *   4. 1 korte zin over wat het kind geleerd heeft, met een plaatje uit de les;
 *   5. geen knoppen meer (Sara, 25 nov 2026): na het voorlezen van de leerzin gaat het kind vanzelf terug naar de onderwerpen.
 * Versie A (`?eind=a`, ook zonder parameter): rustig en groot, alles in 1 kolom in het midden van het speelvlak.
 * Versie B (standaard sinds 25 nov 2026): een breed paneel, links de ster, rechts sleutels en leerzin, meer confetti.
 *
 * Alles in punten van het vaste speelvlak (1280 × 720). Het speelvlak voor de les loopt van x = 0 tot 980; rechts staat
 * Bliepo met zijn tekstvak. Het eindscherm blijft links van x = 960, zodat het Bliepo en zijn zin niet raakt.
 */

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { speelLesgeluid } from "@/lib/lesgeluiden";
import { kleurCss, kleurVoorPercentage } from "@/lib/les-kleuren";
import s from "./Eindscherm.module.css";

export type Eindversie = "a" | "b";

export const STER_PLAATJE = "/beloning/ster-goud-400.png";
export const SLEUTEL_PLAATJE = "/beloning/sleutel-goud-160.png";
/** De kleur van het sleutelgetal: de kleur van de sleutel zelf (getal in de kleur van het voorwerp, BOUWREGELS 2.1). */
export const SLEUTELKLEUR = "#ffd75e";
const FONKEL = "M0-10 C1.2-3.2 3.2-1.2 10 0 C3.2 1.2 1.2 3.2 0 10 C-1.2 3.2 -3.2 1.2 -10 0 C-3.2-1.2 -1.2-3.2 0-10Z";

/** Sara koos versie B (25 nov 2026): dat is nu de standaard; `?eind=a` toont nog de oude proefversie. */
export function leesEindversie(): Eindversie {
  if (typeof window === "undefined") return "b";
  try {
    return new URLSearchParams(window.location.search).get("eind") === "a" ? "a" : "b";
  } catch {
    return "b";
  }
}

/* ---------- de sleutelteller rechtsboven (tijdens de les) ---------- */

/**
 * Waar de teller staat (punten van het speelvlak): rechts naast de (iets smallere en iets hogere) voortgangsbalk, links
 * van naam en pauze, boven Bliepo's tekstvak (dat begint op y = 58).
 */
export const TELLER = { x: 770, y: 4, b: 210, h: 48 };
/** Het midden van het sleuteltje in de teller: daar landt een vliegend sleuteltje. */
const TELLER_DOEL = { x: TELLER.x + 28, y: TELLER.y + TELLER.h / 2 };
/**
 * De route van een sleuteltje (gemeten in alle scènes van Tellen extra, speelcontrole): het verschijnt boven in het
 * midden van het speelvlak (boven het fruit, rechts van het lijstje), vliegt onder de balk door naar rechts tot vlak
 * voor Bliepo's tekstvak (x < 880) en gaat dan schuin omhoog de teller in, boven de tekst langs.
 */
const VLIEG_START = { x: 520, y: 150 };
const VLIEG_BOCHT = { x: 812, y: 118 };

export function Sleutelteller({ aantal, tik, sterren, sterTik }: { aantal: number; tik: number; sterren: number; sterTik: number }) {
  return (
    <div className={s.teller} style={{ left: TELLER.x, top: TELLER.y, width: TELLER.b, height: TELLER.h }} data-sleutelteller="" data-sleutels={aantal} data-sterren={sterren} role="status" aria-label={`${aantal} sleutels, ${sterren} sterren`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img key={`s${tik}`} src={SLEUTEL_PLAATJE} alt="" className={tik > 0 ? `${s.tellerSleutel} ${s.tellerPuls}` : s.tellerSleutel} draggable={false} />
      <span key={`g${tik}`} className={tik > 0 ? `${s.tellerGetal} ${s.tellerPuls}` : s.tellerGetal} style={{ color: SLEUTELKLEUR }}>
        {aantal}
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img key={`t${sterTik}`} src={STER_PLAATJE} alt="" className={sterTik > 0 ? `${s.tellerSter} ${s.tellerPuls}` : s.tellerSter} draggable={false} />
      <span key={`n${sterTik}`} className={sterTik > 0 ? `${s.tellerGetal} ${s.tellerPuls}` : s.tellerGetal} style={{ color: SLEUTELKLEUR }}>
        {sterren}
      </span>
    </div>
  );
}

/** Eén sleuteltje dat met een zachte gloed en een paar fonkelingen naar de teller vliegt (±0,9 s). */
export function VliegendeSleutel() {
  const stijl = {
    left: TELLER_DOEL.x - 28,
    top: TELLER_DOEL.y - 28,
    "--vx": `${VLIEG_START.x - TELLER_DOEL.x}px`,
    "--vy": `${VLIEG_START.y - TELLER_DOEL.y}px`,
    "--bx": `${VLIEG_BOCHT.x - TELLER_DOEL.x}px`,
    "--by": `${VLIEG_BOCHT.y - TELLER_DOEL.y}px`,
  } as CSSProperties;
  return (
    <div className={s.vlieger} style={stijl} data-vliegende-sleutel="" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={SLEUTEL_PLAATJE} alt="" draggable={false} />
      {[0, 1, 2].map((i) => (
        <svg key={i} className={`${s.vliegFonkel} ${s[`vf${i}`]}`} viewBox="-12 -12 24 24">
          <path d={FONKEL} fill="#fff6d0" />
        </svg>
      ))}
    </div>
  );
}

/* ---------- confetti (canvas, ±1,5 s, niet druk) ---------- */

const CONFETTI_KLEUREN = ["#2fedfe", "#1cddfd", "#8fe3ff", "#ffffff", "#ffd75e", "#a9b8ff"];

function Confetti({ aantal, duur }: { aantal: number; duur: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    const stukken = Array.from({ length: aantal }, (_, i) => {
      /* 2 zachte wolkjes links en rechts van het midden van het speelvlak, schuin omhoog en dan vallen. */
      const links = i % 2 === 0;
      return {
        x: links ? 250 + Math.random() * 120 : 610 + Math.random() * 120,
        y: 300 + Math.random() * 60,
        vx: (links ? -1 : 1) * (40 + Math.random() * 160) + (Math.random() - 0.5) * 80,
        vy: -(380 + Math.random() * 300),
        draai: Math.random() * Math.PI,
        vd: (Math.random() - 0.5) * 9,
        b: 7 + Math.random() * 6,
        h: 4 + Math.random() * 5,
        rond: Math.random() < 0.3,
        kleur: CONFETTI_KLEUREN[i % CONFETTI_KLEUREN.length],
      };
    });
    const begin = performance.now();
    let vorige = begin;
    let raf = 0;
    const stap = (nu: number) => {
      const dt = Math.min(0.05, (nu - vorige) / 1000);
      vorige = nu;
      const t = nu - begin;
      ctx.clearRect(0, 0, c.width, c.height);
      if (t > duur) return;
      const alfa = t > duur - 450 ? Math.max(0, (duur - t) / 450) : 1;
      for (const p of stukken) {
        p.vy += 900 * dt;
        p.vx *= 0.985;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.draai += p.vd * dt;
        ctx.save();
        ctx.globalAlpha = alfa;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.draai);
        ctx.fillStyle = p.kleur;
        if (p.rond) {
          ctx.beginPath();
          ctx.arc(0, 0, p.h * 0.7, 0, Math.PI * 2);
          ctx.fill();
        } else ctx.fillRect(-p.b / 2, -p.h / 2, p.b, p.h);
        ctx.restore();
      }
      raf = requestAnimationFrame(stap);
    };
    raf = requestAnimationFrame(stap);
    return () => cancelAnimationFrame(raf);
  }, [aantal, duur]);
  return <canvas ref={ref} className={s.confetti} width={980} height={720} aria-hidden="true" data-confetti="" />;
}

/* ---------- het eindscherm ---------- */

/** Tijden in ms vanaf het begin van het eindscherm. */
const STER_MS = 1500;
const SLEUTELS_MS = 2500;
const SLEUTEL_STAP_MS = 240;
const SLEUTEL_VLIEG_MS = 700;

function Fonkels({ klein = false }: { klein?: boolean }) {
  return (
    <div className={klein ? `${s.fonkels} ${s.fonkelsKlein}` : s.fonkels} aria-hidden="true">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <svg key={i} className={`${s.fonkel} ${s[`f${i}`]}`} viewBox="-12 -12 24 24">
          <path d={FONKEL} fill="#ffffff" />
        </svg>
      ))}
    </div>
  );
}

export function Eindscherm({
  versie,
  sleutels,
  leerzin,
  plaatje,
  onderwerp,
  percentage,
  opAfgevinkt,
}: {
  versie: Eindversie;
  sleutels: number;
  leerzin?: string;
  plaatje?: string;
  /** De kaart met het onderwerp van de les (26 nov 2026): licht zacht op tot het kind erop tikt. */
  onderwerp?: string;
  /** Percentage goed in 1 keer; bepaalt de kleur van de kaart na de tik (les-kleuren.ts). */
  percentage?: number;
  /** Na de tik op de kaart (de kaart heeft dan vinkje en kleur). */
  opAfgevinkt?: () => void;
}) {
  const [afgevinkt, setAfgevinkt] = useState(false);
  const kleur = kleurVoorPercentage(percentage ?? 0);
  const [fase, setFase] = useState(0);
  const [geteld, setGeteld] = useState(0);
  const leerzinMs = SLEUTELS_MS + (sleutels > 0 ? SLEUTEL_VLIEG_MS + sleutels * SLEUTEL_STAP_MS + 300 : 0);
  useEffect(() => {
    /* Sara koos feest-1 (25 nov 2026); feest-2 en feest-3 blijven in de map staan maar worden niet gebruikt. */
    speelLesgeluid("feest1");
    const t: ReturnType<typeof setTimeout>[] = [];
    t.push(setTimeout(() => setFase(1), STER_MS));
    t.push(setTimeout(() => setFase(2), SLEUTELS_MS));
    for (let i = 0; i < sleutels; i++)
      t.push(
        setTimeout(() => {
          setGeteld(i + 1);
          /* 1 zacht sleutelgeluidje bij de eerste sleutel die aankomt (niet bij elke: dat wordt te druk). */
          if (i === 0) speelLesgeluid("sleutel");
        }, SLEUTELS_MS + SLEUTEL_VLIEG_MS + i * SLEUTEL_STAP_MS),
      );
    t.push(setTimeout(() => setFase(3), leerzinMs));
    t.push(setTimeout(() => setFase(4), leerzinMs + 700));
    if (typeof window !== "undefined") (window as unknown as { __eindscherm?: unknown }).__eindscherm = { versie, sleutels, start: Math.round(performance.now()) };
    return () => t.forEach(clearTimeout);
  }, [versie, sleutels, leerzinMs]);

  const b = versie === "b";
  const ster = fase >= 1 && (
    <div className={b ? s.sterB : s.sterA} data-eind-ster="">
      <Fonkels />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={STER_PLAATJE} alt="" className={s.sterPlaatje} draggable={false} />
    </div>
  );
  const lesAf = fase >= 1 && (
    <p className={b ? `${s.lesAf} ${s.lesAfB}` : s.lesAf} data-eind-lesaf="">
      Les af!
    </p>
  );
  const sleutelRij = fase >= 2 && sleutels > 0 && (
    <div className={b ? `${s.sleutels} ${s.sleutelsB}` : s.sleutels} data-eind-sleutels={sleutels} aria-label={`${sleutels} sleutels verdiend`}>
      <div className={s.sleutelDoel}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={geteld} src={SLEUTEL_PLAATJE} alt="" className={geteld > 0 ? `${s.sleutelGroot} ${s.sleutelPuls}` : s.sleutelGroot} draggable={false} />
        {Array.from({ length: sleutels }, (_, i) => {
          /* Elk sleuteltje komt van een eigen plek eronder en vliegt in een boogje naar de grote sleutel. */
          const hoek = (-150 + (i * 120) / Math.max(1, sleutels - 1)) * (Math.PI / 180);
          const r = 150;
          const stijl = { "--vx": `${Math.round(Math.cos(hoek) * r * 1.3)}px`, "--vy": `${Math.round(110 + Math.abs(Math.sin(hoek)) * 30)}px`, animationDelay: `${i * SLEUTEL_STAP_MS}ms` } as CSSProperties;
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={SLEUTEL_PLAATJE} alt="" className={s.eindVlieger} style={stijl} draggable={false} aria-hidden="true" />
          );
        })}
      </div>
      <span className={s.sleutelGetal} style={{ color: SLEUTELKLEUR }} data-eind-sleutelgetal={geteld}>
        {geteld}
      </span>
    </div>
  );
  const leer = fase >= 3 && leerzin && (
    <div className={b ? `${s.leer} ${s.leerB}` : s.leer} data-eind-leerzin="">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {plaatje && <img src={plaatje} alt="" className={b ? `${s.leerPlaatje} ${s.leerPlaatjeB}` : s.leerPlaatje} draggable={false} />}
      <p>{leerzin}</p>
    </div>
  );
  const kaart = fase >= 4 && onderwerp && (
    <button
      type="button"
      className={afgevinkt ? `${s.kaart} ${s.kaartKlaar}` : `${s.kaart} ${s.kaartLicht}`}
      style={afgevinkt ? ({ "--kaartkleur": kleurCss(kleur) } as CSSProperties) : undefined}
      data-eind-kaart=""
      data-afgevinkt={afgevinkt ? kleur.naam : ""}
      aria-label={`${onderwerp}, tik om af te vinken`}
      disabled={afgevinkt}
      onClick={() => {
        if (afgevinkt) return;
        setAfgevinkt(true);
        opAfgevinkt?.();
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {plaatje && <img src={plaatje} alt="" className={s.kaartPlaatje} draggable={false} />}
      <span className={s.kaartTitel}>{onderwerp}</span>
      <span className={s.kaartRing} aria-hidden="true">
        <svg viewBox="0 0 44 44" width="44" height="44">
          <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="6" />
          {afgevinkt && <circle cx="22" cy="22" r="18" fill="none" stroke="var(--kaartkleur)" strokeWidth="6" />}
          {afgevinkt && <path d="M13 23 L20 30 L32 15" fill="none" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" className={s.vinkje} />}
        </svg>
      </span>
    </button>
  );

  return (
    <div className={s.eind} data-eindscherm={versie} aria-live="polite">
      <Confetti aantal={b ? 110 : 60} duur={b ? 2000 : 1500} />
      {b ? (
        <div className={`${s.paneel} ${fase >= 1 ? s.paneelIn : ""}`}>
          <div className={s.paneelLinks}>
            {ster}
            {lesAf}
          </div>
          <div className={s.paneelRechts}>
            {sleutelRij}
            {leer}
          </div>
          {kaart}
        </div>
      ) : (
        <div className={s.kolom}>
          {ster}
          {lesAf}
          {sleutelRij}
          {leer}
          {kaart}
        </div>
      )}
    </div>
  );
}
