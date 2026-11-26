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

/** Twee nieuwe ontwerpen (26 nov 2026, Sara vond "te veel op het scherm"): "1" = ster en sleutel blijven klein bovenaan staan, "2" = ster en sleutel verdwijnen en alleen leerzin en kaart blijven over. */
export type Eindversie = "1" | "2";

export const STER_PLAATJE = "/beloning/ster-goud-400.png";
export const SLEUTEL_PLAATJE = "/beloning/sleutel-goud-160.png";
/** De kleur van het sleutelgetal: de kleur van de sleutel zelf (getal in de kleur van het voorwerp, BOUWREGELS 2.1). */
export const SLEUTELKLEUR = "#ffd75e";
const FONKEL = "M0-10 C1.2-3.2 3.2-1.2 10 0 C3.2 1.2 1.2 3.2 0 10 C-1.2 3.2 -3.2 1.2 -10 0 C-3.2-1.2 -1.2-3.2 0-10Z";

/** Versie uit de adresbalk (`?eind=2`); zonder of met iets anders: 1. */
export function leesEindversie(): Eindversie {
  if (typeof window === "undefined") return "1";
  try {
    return new URLSearchParams(window.location.search).get("eind") === "2" ? "2" : "1";
  } catch {
    return "1";
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

/* ---------- het eindscherm (nieuw ontwerp 26 november 2026) ---------- */

/*
  Alles 1 voor 1, geen paneel:
    0 s        de ster komt in het midden, groot, draait 3 keer (geluid ster-draai), een lichtflits en stralen
    0,9 s      feest-1 en confetti als de ster landt
    2,2 s      de sleutel erbij naast de ster, het getal telt op (pling per sleutel)
    daarna     versie 1: ster en sleutel schuiven klein naar boven; versie 2: ze verdwijnen
    +0,7 s     de leerzin
    +1,0 s     de kaart met het onderwerp (licht op, tikken)
*/
function Fonkels() {
  return (
    <div className={s.fonkels} aria-hidden="true">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <svg key={i} className={`${s.fonkel} ${s[`f${i}`]}`} viewBox="-12 -12 24 24">
          <path d="M0-10 C1.2-3.2 3.2-1.2 10 0 C3.2 1.2 1.2 3.2 0 10 C-1.2 3.2 -3.2 1.2 -10 0 C-3.2-1.2 -1.2-3.2 0-10Z" fill="#ffffff" />
        </svg>
      ))}
    </div>
  );
}

const STER_MS = 1;
const FEEST_MS = 900;
const SLEUTEL_MS = 2300;
const SLEUTEL_STAP_MS = 320;

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
  /** De kaart met het onderwerp van de les: licht zacht op tot het kind erop tikt. */
  onderwerp?: string;
  /** Percentage goed in 1 keer; bepaalt de kleur van de kaart na de tik (les-kleuren.ts). */
  percentage?: number;
  /** Na de tik op de kaart (de kaart heeft dan vinkje en kleur). */
  opAfgevinkt?: () => void;
}) {
  /* fase: 1 ster, 2 sleutel, 3 ster en sleutel klein of weg, 4 leerzin, 5 kaart */
  const [fase, setFase] = useState(0);
  const [geteld, setGeteld] = useState(0);
  const [afgevinkt, setAfgevinkt] = useState(false);
  const kleur = kleurVoorPercentage(percentage ?? 0);
  const sleutelKlaarMs = sleutels > 0 ? SLEUTEL_MS + 600 + sleutels * SLEUTEL_STAP_MS : SLEUTEL_MS - 300;
  const settleMs = sleutelKlaarMs + 900;
  useEffect(() => {
    const t: ReturnType<typeof setTimeout>[] = [];
    speelLesgeluid("sterDraai");
    t.push(setTimeout(() => setFase(1), STER_MS));
    /* Sara koos feest-1 (25 nov 2026); feest-2 en feest-3 blijven in de map staan maar worden niet gebruikt. */
    t.push(setTimeout(() => speelLesgeluid("feest1"), FEEST_MS));
    if (sleutels > 0) t.push(setTimeout(() => setFase(2), SLEUTEL_MS));
    for (let i = 0; i < sleutels; i++)
      t.push(
        setTimeout(() => {
          setGeteld(i + 1);
          speelLesgeluid("sleutel");
        }, SLEUTEL_MS + 600 + i * SLEUTEL_STAP_MS),
      );
    t.push(setTimeout(() => setFase(3), settleMs));
    t.push(setTimeout(() => setFase(4), settleMs + 700));
    t.push(setTimeout(() => setFase(5), settleMs + 1700));
    if (typeof window !== "undefined") (window as unknown as { __eindscherm?: unknown }).__eindscherm = { versie, sleutels, start: Math.round(performance.now()) };
    return () => t.forEach(clearTimeout);
  }, [versie, sleutels, settleMs]);

  const v2 = versie === "2";
  const groepStand = fase >= 3 ? (v2 ? s.groepWeg : s.groepKlein) : s.groepGroot;
  const sterGroep = fase >= 1 && (
    <div className={`${s.groep} ${groepStand}`} data-eind-groep="">
      <div className={s.groepRij}>
        <div className={s.sterWrap} data-eind-ster="">
          <div className={s.stralen} aria-hidden="true" />
          <div className={s.lichtstoot} aria-hidden="true" />
          <Fonkels />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={STER_PLAATJE} alt="" className={s.sterDraai} draggable={false} />
        {fase >= 2 && sleutels > 0 && (
          <div className={s.sleutelNaast} data-eind-sleutels={sleutels} aria-label={`${sleutels} sleutels verdiend`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img key={geteld} src={SLEUTEL_PLAATJE} alt="" className={geteld > 0 ? `${s.sleutelGroot2} ${s.sleutelPuls}` : s.sleutelGroot2} draggable={false} />
            <span className={s.sleutelGetal2} style={{ color: SLEUTELKLEUR }} data-eind-sleutelgetal={geteld}>
              {geteld}
            </span>
          </div>
        )}
        </div>
      </div>
      <p className={s.lesAf2} data-eind-lesaf="">
        Les af!
      </p>
    </div>
  );
  const leer = fase >= 4 && leerzin && (
    <div className={v2 ? `${s.leer2} ${s.leer2Midden}` : s.leer2} data-eind-leerzin="">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {plaatje && <img src={plaatje} alt="" className={v2 ? `${s.leer2Plaatje} ${s.leer2PlaatjeGroot}` : s.leer2Plaatje} draggable={false} />}
      <p>{leerzin}</p>
    </div>
  );
  const kaart = fase >= 5 && onderwerp && (
    <button
      type="button"
      className={`${afgevinkt ? `${s.kaart} ${s.kaartKlaar}` : `${s.kaart} ${s.kaartLicht}`} ${v2 ? s.kaartV2 : s.kaartV1}`}
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
      {fase >= 1 && <ConfettiLater aantal={v2 ? 90 : 90} wacht={FEEST_MS - STER_MS} />}
      {sterGroep}
      {leer}
      {kaart}
    </div>
  );
}

/** Confetti pas als de ster landt (de feestklank begint dan ook). */
function ConfettiLater({ aantal, wacht }: { aantal: number; wacht: number }) {
  const [aan, setAan] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAan(true), wacht);
    return () => clearTimeout(t);
  }, [wacht]);
  return aan ? <Confetti aantal={aantal} duur={2000} /> : null;
}
