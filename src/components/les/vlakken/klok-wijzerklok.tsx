"use client";

/**
 * De wijzerklok van de uitleglessen Klokkijken (oktober 2026), zoals bij
 * Synthesis (Telling Time): een grote witte wijzerplaat op de sterrenhemel,
 * een lange paarse minutenwijzer en een korte oranje urenwijzer.
 *
 * Wat het vlak kan:
 * - de tijd laten zien en de wijzers langzaam laten meedraaien
 *   (`stand: { tijd, draai: true }`: de minutenwijzer draait rond en de
 *   urenwijzer schuift mee, zoals bij een echte klok);
 * - een getallenlijn 1–12 die zich oprolt tot een klok (`vorm`);
 * - het kind een wijzer laten zetten: tik op de wijzer en tik op de plek, tik
 *   meteen op een getal, of sleep de wijzer (`beweegbaar`);
 * - aanwijzen: een "pil" om een wijzer, een oranje ringetje om een getal, een
 *   blauw driehoekje, een gebogen pijl in de draairichting, een lila taartpunt
 *   achter de minutenwijzer (`inkleur`), en een tweede klok met een rode
 *   stippelrand (de klok van Vos, met een fout erin).
 *
 * Tweede bouwronde (10 oktober 2026), voor "tellen in vijven" en "minuten
 * later": minuutgetallen buiten de klok (`labels`), paarse minuutstreepjes
 * (`streepjes`), een tijdboog langs de rand met een blauw vlaggetje bij het
 * begin (`boog`, `vlag`), de digitale tijd onder de klok (`digitaal`), de
 * minutenwijzer die niet verder kan dan de grens (`klem`) en een getallenlijn
 * die bij de 12 begint met de minuten erboven (`lijnMinuten`). `Klokje` is
 * een kleine klok zonder bediening (voor de wekkerrace).
 *
 * Tijden zijn minuten vanaf 12 uur (3 uur = 180, half 4 = 210). Een tijd mag
 * boven de 720 komen: zo draait de klok bij `draai` altijd vooruit.
 *
 * Wat het meldt: `gezet` (het kind heeft een wijzer verzet; na het draaien),
 * `controle` (het blauwe vinkje), `hulp` (het handje), `getal` (tik op een
 * getal van de getallenlijn) en `mis` (tik op een getal dat nu niet mag).
 * Elke melding heeft `tijd`, de tijd die de klok op dat moment aanwijst.
 *
 * Schrijft niets naar de database.
 */

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import type { Vlakbasis } from "../soort";
import s from "./klok-wijzerklok.module.css";

/* ---------- kleuren, gemeten op de screenshots van Synthesis ---------- */

export const UURKLEUR = "#c0620d";
const UUR_FLETS = "#f2d4b6";
export const MINUUTKLEUR = "#7c3fd6";
const MINUUT_FLETS = "#dccdf1";
const PIL_UUR = "rgba(222, 150, 95, 0.42)";
const PIL_MINUUT = "rgba(160, 120, 230, 0.32)";
const TAARTPUNT = "#dfccf2";
const RING = "#ef8a2a";
const BLAUW = "#4b9af5";
const ROOD = "#e5484d";
const BOOG_LICHT = "#e6d8fa";
const BOOG_DONKER = "#c7aef0";
const LABELGRIJS = "#a9adbd";
const LABELPAARS = "#b48cf0";

/* ---------- maten: de klok tekent op straal 215, het vlak is 980 × 720 ---------- */

const B = 980;
const H = 720;
const R = 215;
const CIJFER = 0.76 * R;
const MIN_LANG = 0.8 * R;
const UUR_LANG = 0.48 * R;
/* Het grijpvlak van een wijzer houdt op vóór de cijfers: een tik op een cijfer is altijd een tik op dat cijfer. */
const GRIJP_MIN = 0.6 * R;
const GRIJP_UUR = 0.55 * R;

export type Wijzerstand = "fel" | "flets" | "weg";
export type Wijzer = "uur" | "minuut";

export type KlokProps = {
  /** De tijd op de klok. Een nieuw object = de klok gaat erheen; `draai`: rustig vooruit meedraaien. */
  stand: { tijd: number; draai?: boolean };
  /** "lijn": de getallen staan op een rechte getallenlijn; terug naar "klok" rolt hij op. */
  vorm?: "klok" | "lijn";
  /** `false`: een lege wijzerplaat. */
  wijzers?: boolean;
  uurwijzer?: Wijzerstand;
  minuutwijzer?: Wijzerstand;
  /** Een zachte pil om deze wijzer: daar gaat het nu om. */
  pil?: Wijzer | null;
  /** Een oranje ringetje om dit getal. */
  ring?: number | null;
  /** Een blauw driehoekje dat naar dit getal wijst. */
  driehoek?: number | null;
  /** Een gebogen pijl van getal naar getal (rood = de verkeerde kant op). */
  pijl?: { van: number; naar: number; rood?: boolean } | null;
  /** Het stuk dat de minutenwijzer vanaf de 12 heeft geveegd, lila. */
  inkleur?: boolean;
  /** Een tweede, kleinere klok rechts met een rode stippelrand. */
  tweede?: { tijd: number; naam: string } | null;
  /** Het kind mag nu iets doen. */
  actief?: boolean;
  /** Welke wijzer het kind mag verzetten. Bij "beide" kiest het eerst een wijzer. */
  beweegbaar?: "uur" | "minuut" | "beide" | null;
  /** Alleen een tik op dit getal werkt (zoals "ga naar de 2" bij Synthesis). */
  alleenGetal?: number | null;
  /** De minutenwijzer komt niet buiten deze tijden (bijvoorbeeld: één keer rond, niet verder). */
  grens?: { van: number; tot: number } | null;
  /** Het handje en het blauwe vinkje onder de klok. */
  controle?: boolean;
  /** Een tik op een getal meldt `getal` (bij de getallenlijn). */
  tikGetal?: boolean;
  /** Bij een tik voorbij de grens blijft de minutenwijzer óp de grens staan (in plaats van een rondje terug). */
  klem?: boolean;
  /** Kleine minuutgetallen buiten de klok: 5 → "05", 0 → "00". */
  labels?: number[];
  /** Deze minuutstreepjes worden paars (minuten binnen het uur, 0 tot en met 60). */
  streepjes?: { van: number; tot: number } | null;
  /**
   * De tijdboog langs de rand: vanaf tijd `van` tot waar de minutenwijzer nu staat.
   * Met `stap` wisselt de kleur elke `stap` minuten en staan de getallen 0, 5, 10 … erbij;
   * met `delen` (bijvoorbeeld [25]) wisselt de kleur na elk deel en staat het aantal minuten van elk deel erbij.
   */
  boog?: { van: number; stap?: number; delen?: number[] } | null;
  /** Een blauw vlaggetje op de rand bij deze tijd: hier begon het. */
  vlag?: number | null;
  /** De digitale tijd onder de klok: het uur oranje, de minuten paars. */
  digitaal?: boolean;
  /** Bij `vorm: "lijn"`: de lijn begint bij de 12, met de minuten (00, 05, 10 …) erboven. */
  lijnMinuten?: boolean;
};

/** Hoe lang het meedraaien duurt, zodat het draaiboek erop kan wachten. */
export function draaiduur(minuten: number): number {
  return Math.min(4000, 700 + Math.abs(minuten) * 25);
}

const SPRING = 450;

const rond = (n: number) => Math.round(n * 100) / 100;
const graad = (g: number) => (g * Math.PI) / 180;
/** Een punt op de klok: `hoek` in graden vanaf de 12, met de klok mee. */
const op = (hoek: number, r: number) => ({ x: rond(Math.sin(graad(hoek)) * r), y: rond(-Math.cos(graad(hoek)) * r) });
/** De kortste draai van hoek `van` naar hoek `naar`, tussen -180 en 180. */
const kortst = (van: number, naar: number) => ((((naar - van) % 360) + 540) % 360) - 180;
const mod = (n: number, m: number) => ((n % m) + m) % m;

function lijnplek(n: number, vanaf12 = false) {
  const plek = vanaf12 ? n % 12 : n - 1;
  return { x: -400 + (plek * 800) / 11, y: 46 };
}

const tweeCijfers = (n: number) => String(n).padStart(2, "0");

/* ---------- de tekening ---------- */

type Plaatprops = {
  vorm: "klok" | "lijn";
  uur: number; // graden
  minuut: number; // graden
  wijzers: boolean;
  uurwijzer: Wijzerstand;
  minuutwijzer: Wijzerstand;
  pil: Wijzer | null;
  gekozen: Wijzer | null;
  ring: number | null;
  driehoek: number | null;
  pijl: KlokProps["pijl"];
  inkleur: boolean;
  por: number;
  zacht?: boolean;
  grijp?: { uur: boolean; minuut: boolean };
  opGrijp?: (e: ReactPointerEvent, w: Wijzer) => void;
  opGetal?: (n: number) => void;
  labels?: number[];
  streepjes?: { van: number; tot: number } | null;
  boog?: KlokProps["boog"];
  vlag?: number | null;
  lijnMinuten?: boolean;
};

/** Een ring-stuk langs de rand, van hoek a1 tot a2 (graden, met de klok mee). */
function ringstuk(a1: number, a2: number, ri: number, ro: number) {
  const p1 = op(a1, ro);
  const p2 = op(a2, ro);
  const p3 = op(a2, ri);
  const p4 = op(a1, ri);
  const groot = a2 - a1 > 180 ? 1 : 0;
  return `M${p1.x} ${p1.y} A${ro} ${ro} 0 ${groot} 1 ${p2.x} ${p2.y} L${p3.x} ${p3.y} A${ri} ${ri} 0 ${groot} 0 ${p4.x} ${p4.y} Z`;
}

/** De tijdboog: van tijd `van` tot `nu` (allebei in minuten, `nu` mag een kommagetal zijn). */
function Tijdboog({ van, nu, stap, delen }: { van: number; nu: number; stap?: number; delen?: number[] }) {
  const lang = Math.max(0, nu - van);
  const grenzen: number[] = [0];
  if (delen && delen.length) {
    let som = 0;
    for (const d of delen) {
      som += d;
      if (som < lang - 0.01) grenzen.push(som);
    }
  } else {
    const st = stap ?? 5;
    for (let g = st; g < lang - 0.01; g += st) grenzen.push(g);
  }
  grenzen.push(lang);
  const stukken: { a: number; b: number; kleur: string }[] = [];
  for (let i = 0; i + 1 < grenzen.length; i++) {
    const a = grenzen[i];
    const b = grenzen[i + 1];
    if (b - a < 0.05) continue;
    stukken.push({ a, b, kleur: i % 2 === 0 ? BOOG_LICHT : BOOG_DONKER });
  }
  const ri = 0.885 * R;
  const ro = R - 1;
  return (
    <g pointerEvents="none">
      {stukken.map(({ a, b, kleur }, i) => {
        /* Stukken van meer dan een halve cirkel in tweeën, anders tekent de boog verkeerd. */
        const h1 = (van + a) * 6;
        const h2 = (van + b) * 6;
        const midden = h2 - h1 > 180 ? (h1 + h2) / 2 : null;
        return midden === null ? (
          <path key={i} d={ringstuk(h1, h2, ri, ro)} fill={kleur} />
        ) : (
          <g key={i}>
            <path d={ringstuk(h1, midden, ri, ro)} fill={kleur} />
            <path d={ringstuk(midden, h2, ri, ro)} fill={kleur} />
          </g>
        );
      })}
    </g>
  );
}

/** De getallen bij de tijdboog, buiten de klok. */
function Boogtekst({ van, nu, stap, delen }: { van: number; nu: number; stap?: number; delen?: number[] }) {
  const lang = Math.max(0, nu - van);
  const teksten: { m: number; t: string; kleur: string }[] = [];
  if (delen && delen.length) {
    let begin = 0;
    for (const d of delen.concat([Infinity])) {
      const eind = Math.min(begin + d, lang);
      if (eind - begin >= 0.99) teksten.push({ m: van + (begin + eind) / 2, t: String(Math.round(eind - begin)), kleur: "#ffffff" });
      begin += d;
      if (begin >= lang) break;
    }
  } else {
    const st = stap ?? 5;
    for (let g = 0; g <= lang + 0.01; g += st) teksten.push({ m: van + g, t: String(g), kleur: LABELPAARS });
  }
  return (
    <g pointerEvents="none">
      {teksten.map(({ m, t, kleur }, i) => {
        const p = op(m * 6, R + 34);
        return (
          <text
            key={i}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={23}
            fontWeight={700}
            fill={kleur}
            style={{ fontFamily: "var(--font-les), 'Work Sans', system-ui, sans-serif" }}
          >
            {t}
          </text>
        );
      })}
    </g>
  );
}

function Vlaggetje({ tijd }: { tijd: number }) {
  return (
    <g transform={`rotate(${rond(mod(tijd, 60) * 6)})`} pointerEvents="none">
      <line x1={0} y1={-0.86 * R} x2={0} y2={-(R + 24)} stroke={BLAUW} strokeWidth={5} strokeLinecap="round" />
      <path d={`M0 ${-(R + 26)} L-17 ${-(R + 18)} L0 ${-(R + 9)} Z`} fill={BLAUW} stroke={BLAUW} strokeWidth={2} strokeLinejoin="round" />
    </g>
  );
}

function Taartpunt({ hoek }: { hoek: number }) {
  const veeg = mod(hoek, 360);
  const r = 0.9 * R;
  if (veeg < 0.5) return null;
  if (veeg > 359.5) return <circle r={r} fill={TAARTPUNT} />;
  const eind = op(veeg, r);
  return <path d={`M0 0 L0 ${-r} A${r} ${r} 0 ${veeg > 180 ? 1 : 0} 1 ${eind.x} ${eind.y} Z`} fill={TAARTPUNT} />;
}

function Boogpijl({ van, naar, rood }: { van: number; naar: number; rood?: boolean }) {
  const stappen = mod(naar - van, 12);
  const kant = stappen <= 6 ? 1 : -1;
  const r = 0.6 * R;
  const a1 = van * 30 + kant * 7;
  const a2 = naar * 30 - kant * 7;
  const p1 = op(a1, r);
  const p2 = op(a2, r);
  const groot = Math.abs(kortst(a1, a2)) > 180 ? 1 : 0;
  /* De richting van de pijl aan het eind: langs de cirkel, in de draairichting. */
  const t = { x: Math.cos(graad(a2)) * kant, y: Math.sin(graad(a2)) * kant };
  const n = { x: -t.y, y: t.x };
  const punt = { x: p2.x + t.x * 10, y: p2.y + t.y * 10 };
  const kleur = rood ? ROOD : BLAUW;
  return (
    <g pointerEvents="none">
      <path
        d={`M${p1.x} ${p1.y} A${r} ${r} 0 ${groot} ${kant === 1 ? 1 : 0} ${p2.x} ${p2.y}`}
        fill="none"
        stroke={kleur}
        strokeWidth={6}
        strokeLinecap="round"
      />
      <path
        d={`M${rond(punt.x)} ${rond(punt.y)} L${rond(p2.x - t.x * 6 + n.x * 10)} ${rond(p2.y - t.y * 6 + n.y * 10)} L${rond(p2.x - t.x * 6 - n.x * 10)} ${rond(p2.y - t.y * 6 - n.y * 10)} Z`}
        fill={kleur}
        stroke={kleur}
        strokeWidth={2}
        strokeLinejoin="round"
      />
    </g>
  );
}

function Handwijzer({
  hoek,
  lengte,
  dik,
  kleur,
  pil,
  pilkleur,
  zacht,
  por,
}: {
  hoek: number;
  lengte: number;
  dik: number;
  kleur: string;
  pil: boolean;
  pilkleur: string;
  zacht?: boolean;
  por: number;
}) {
  const pb = dik * 2.6;
  const begin = lengte * 0.22;
  const binnen = (
    <>
      {pil && <rect x={-pb / 2} y={-(lengte + 0.05 * R)} width={pb} height={lengte + 0.15 * R} rx={pb / 2} fill={pilkleur} />}
      {por > 0 && (
        <rect key={por} className={s.por} x={-pb / 2} y={-(lengte + 0.05 * R)} width={pb} height={lengte + 0.15 * R} rx={pb / 2} fill={pilkleur} opacity={0} />
      )}
      <line x1={0} y1={0} x2={0} y2={-begin} stroke={kleur} strokeWidth={dik * 0.35} strokeLinecap="round" />
      <line x1={0} y1={-begin} x2={0} y2={-lengte} stroke={kleur} strokeWidth={dik} strokeLinecap="round" />
    </>
  );
  if (zacht) {
    return (
      <g className={s.zacht} style={{ transform: `rotate(${rond(hoek)}deg)`, pointerEvents: "none" }}>
        {binnen}
      </g>
    );
  }
  return (
    <g transform={`rotate(${rond(hoek)})`} pointerEvents="none">
      {binnen}
    </g>
  );
}

function Plaat(p: Plaatprops) {
  const klok = p.vorm === "klok";
  const metWijzers = klok && p.wijzers;
  const uurKleur = p.uurwijzer === "flets" ? UUR_FLETS : UURKLEUR;
  const minKleur = p.minuutwijzer === "flets" ? MINUUT_FLETS : MINUUTKLEUR;
  return (
    <>
      {/* de wijzerplaat */}
      <g className={s.vervaag} style={{ opacity: klok ? 1 : 0 }}>
        <circle r={R} fill="#ffffff" style={{ filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.45))" }} />
        {klok && p.inkleur && metWijzers && <Taartpunt hoek={p.minuut} />}
        {klok && p.boog && <Tijdboog van={p.boog.van} nu={p.minuut / 6} stap={p.boog.stap} delen={p.boog.delen} />}
        {Array.from({ length: 60 }, (_, i) => {
          const uurstreep = i % 5 === 0;
          const a = op(i * 6, 0.955 * R);
          const b = op(i * 6, (uurstreep ? 0.87 : 0.915) * R);
          const paars = !uurstreep && p.streepjes && i >= p.streepjes.van && i <= p.streepjes.tot;
          if (paars) {
            return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={MINUUTKLEUR} strokeWidth={3.6} strokeLinecap="round" />;
          }
          return (
            <line
              key={i}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={uurstreep ? "#161616" : "#b8b8b8"}
              strokeWidth={uurstreep ? 4.6 : 1.8}
              strokeLinecap="round"
            />
          );
        })}
      </g>

      {/* minuutgetallen, de getallen bij de boog en het vlaggetje */}
      {klok && p.labels && (
        <g pointerEvents="none">
          {p.labels.map((m) => {
            const q = op(mod(m, 60) * 6, R + 30);
            return (
              <text
                key={m}
                x={q.x}
                y={q.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={19}
                fontWeight={700}
                fill={LABELGRIJS}
                style={{ fontFamily: "var(--font-les), 'Work Sans', system-ui, sans-serif" }}
              >
                {tweeCijfers(mod(m, 60))}
              </text>
            );
          })}
        </g>
      )}
      {klok && p.boog && <Boogtekst van={p.boog.van} nu={p.minuut / 6} stap={p.boog.stap} delen={p.boog.delen} />}
      {klok && p.vlag != null && <Vlaggetje tijd={p.vlag} />}

      {/* de getallenlijn */}
      <g className={s.vervaag} style={{ opacity: klok ? 0 : 1 }}>
        <line x1={-430} y1={0} x2={430} y2={0} stroke="#ffffff" strokeWidth={3} strokeLinecap="round" />
        {Array.from({ length: 12 }, (_, i) => {
          const { x } = lijnplek(i + 1);
          return <line key={i} x1={x} y1={-10} x2={x} y2={10} stroke="#ffffff" strokeWidth={3} strokeLinecap="round" />;
        })}
        {p.lijnMinuten &&
          Array.from({ length: 12 }, (_, i) => {
            const { x } = lijnplek(i + 1);
            return (
              <text
                key={`m${i}`}
                x={x}
                y={-38}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={24}
                fontWeight={700}
                fill={LABELPAARS}
                style={{ fontFamily: "var(--font-les), 'Work Sans', system-ui, sans-serif" }}
              >
                {tweeCijfers(i * 5)}
              </text>
            );
          })}
      </g>

      {/* het blauwe driehoekje */}
      {klok && p.driehoek != null && (
        <g transform={`rotate(${p.driehoek * 30})`} pointerEvents="none">
          <path d={`M0 ${-(R + 12)} L-15 ${-(R + 40)} L15 ${-(R + 40)} Z`} fill={BLAUW} stroke={BLAUW} strokeWidth={3} strokeLinejoin="round" />
        </g>
      )}

      {/* de getallen: op de lijn of op de klok */}
      {Array.from({ length: 12 }, (_, i) => {
        const n = i + 1;
        const plek = klok ? op(n * 30, CIJFER) : lijnplek(n, p.lijnMinuten);
        return (
          <g key={n} className={s.getal} style={{ transform: `translate(${plek.x}px, ${plek.y}px)`, fill: klok ? "#1b1b1d" : "#ffffff" }}>
            {p.ring === n && klok && <circle r={0.115 * R} fill="none" stroke={RING} strokeWidth={4.5} />}
            <text textAnchor="middle" dominantBaseline="central" fontSize={33} fontWeight={500} style={{ fontFamily: "var(--font-les), 'Work Sans', system-ui, sans-serif" }}>
              {n}
            </text>
            {p.opGetal && (
              <circle
                r={0.12 * R}
                fill="rgba(0,0,0,0)"
                role="button"
                aria-label={`Getal ${n}`}
                style={{ cursor: "pointer" }}
                onClick={() => p.opGetal?.(n)}
              />
            )}
          </g>
        );
      })}

      {/* de pijl in de draairichting */}
      {klok && p.pijl && <Boogpijl {...p.pijl} />}

      {/* de wijzers */}
      {metWijzers && p.minuutwijzer !== "weg" && (
        <Handwijzer
          hoek={p.minuut}
          lengte={MIN_LANG}
          dik={0.046 * R}
          kleur={minKleur}
          pil={p.pil === "minuut" || p.gekozen === "minuut"}
          pilkleur={PIL_MINUUT}
          zacht={p.zacht}
          por={p.por}
        />
      )}
      {metWijzers && p.uurwijzer !== "weg" && (
        <Handwijzer
          hoek={p.uur}
          lengte={UUR_LANG}
          dik={0.076 * R}
          kleur={uurKleur}
          pil={p.pil === "uur" || p.gekozen === "uur"}
          pilkleur={PIL_UUR}
          zacht={p.zacht}
          por={p.por}
        />
      )}
      {klok && (
        <g className={s.vervaag} style={{ opacity: p.wijzers ? 1 : 0 }} pointerEvents="none">
          <circle r={0.05 * R} fill="#141414" />
          <circle r={0.021 * R} fill="#ffffff" />
        </g>
      )}

      {/* de grijpvlakken: breder dan de wijzer, en niet over de cijfers */}
      {metWijzers && p.grijp?.minuut && p.minuutwijzer !== "weg" && (
        <g transform={`rotate(${rond(p.minuut)})`}>
          <line
            x1={0}
            y1={-0.08 * R}
            x2={0}
            y2={-GRIJP_MIN}
            stroke="rgba(0,0,0,0)"
            strokeWidth={0.17 * R}
            strokeLinecap="round"
            style={{ cursor: "grab" }}
            onPointerDown={(e) => p.opGrijp?.(e, "minuut")}
          />
        </g>
      )}
      {metWijzers && p.grijp?.uur && p.uurwijzer !== "weg" && (
        <g transform={`rotate(${rond(p.uur)})`}>
          <line
            x1={0}
            y1={0}
            x2={0}
            y2={-GRIJP_UUR}
            stroke="rgba(0,0,0,0)"
            strokeWidth={0.2 * R}
            strokeLinecap="round"
            style={{ cursor: "grab" }}
            onPointerDown={(e) => p.opGrijp?.(e, "uur")}
          />
        </g>
      )}
    </>
  );
}

/* ---------- het vlak ---------- */

type Sleep = { wijzer: Wijzer; vanX: number; vanY: number; bewogen: boolean; id: number };

export function Wijzerklok(props: KlokProps & Vlakbasis) {
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
    labels,
    streepjes = null,
    boog = null,
    vlag = null,
    digitaal = false,
    lijnMinuten = false,
    meld,
    metSom,
  } = props;

  const [toon, setToon] = useState(() => ({ u: stand.tijd * 0.5, m: stand.tijd * 6 }));
  const [gekozen, setGekozen] = useState<Wijzer | null>(null);
  const [por, setPor] = useState(0);
  const toonRef = useRef(toon);
  const totaal = useRef(stand.tijd);
  const anim = useRef<number | null>(null);
  const sleep = useRef<Sleep | null>(null);
  const svg = useRef<SVGSVGElement>(null);
  const meldRef = useRef(meld);
  const vorigeStand = useRef(stand);
  const grensRef = useRef(grens);

  useEffect(() => {
    meldRef.current = meld;
    grensRef.current = grens;
  });

  const zetToon = useCallback((t: { u: number; m: number }) => {
    toonRef.current = t;
    setToon(t);
  }, []);

  /** De wijzers naar tijd `naar`: rustig meedraaien, of elke wijzer de kortste weg. */
  const animeer = useCallback(
    (naar: number, soort: "draai" | "spring", klaar?: () => void) => {
      if (anim.current !== null) cancelAnimationFrame(anim.current);
      const van = { ...toonRef.current };
      const verschil = naar - totaal.current;
      const eind =
        soort === "draai"
          ? { u: van.u + verschil * 0.5, m: van.m + verschil * 6 }
          : { u: van.u + kortst(van.u, naar * 0.5), m: van.m + kortst(van.m, naar * 6) };
      totaal.current = naar;
      const rustig = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      const stil = Math.abs(eind.u - van.u) < 0.01 && Math.abs(eind.m - van.m) < 0.01;
      const duur = rustig || stil ? 0 : soort === "draai" ? draaiduur(verschil) : SPRING;
      const begin = performance.now();
      const stap = (nu: number) => {
        const f = duur ? Math.min(1, (nu - begin) / duur) : 1;
        const e = f < 0.5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2;
        zetToon({ u: van.u + (eind.u - van.u) * e, m: van.m + (eind.m - van.m) * e });
        if (f < 1) anim.current = requestAnimationFrame(stap);
        else {
          anim.current = null;
          /* Na een sprong staan de wijzers goed, maar soms een rondje verschoven; recht zetten (je ziet geen verschil). */
          if (soort === "spring") zetToon({ u: naar * 0.5, m: naar * 6 });
          klaar?.();
        }
      };
      anim.current = requestAnimationFrame(stap);
    },
    [zetToon],
  );

  /* Het draaiboek zet een nieuwe tijd. */
  useEffect(() => {
    if (stand === vorigeStand.current) return;
    vorigeStand.current = stand;
    sleep.current = null;
    animeer(stand.tijd, stand.draai ? "draai" : "spring");
  }, [stand, animeer]);

  useEffect(
    () => () => {
      if (anim.current !== null) cancelAnimationFrame(anim.current);
    },
    [],
  );

  const gezet = useCallback(
    (naar: number, soort: "draai" | "spring", wijzer: Wijzer) =>
      animeer(naar, soort, () => meldRef.current({ soort: "gezet", tijd: naar, wijzer })),
    [animeer],
  );

  const binnenGrens = (t: number) => {
    const g = grensRef.current;
    return g ? Math.max(g.van, Math.min(g.tot, t)) : t;
  };

  /* ---------- tikken op een getal ---------- */

  const opGetal = (n: number) => {
    if (!actief) return;
    if (tikGetal) {
      meld({ soort: "getal", n, tijd: totaal.current });
      return;
    }
    if (!beweegbaar) return;
    if (alleenGetal != null && n !== alleenGetal) {
      meld({ soort: "mis", n, tijd: totaal.current });
      return;
    }
    const nu = totaal.current;
    const uur = Math.floor(mod(nu, 720) / 60);
    const minuut = mod(nu, 60);
    const wijzer: Wijzer | null = beweegbaar === "beide" ? gekozen : beweegbaar;
    if (!wijzer) {
      setPor((p) => p + 1);
      return;
    }
    if (wijzer === "uur") {
      gezet((n % 12) * 60 + (beweegbaar === "uur" ? 0 : minuut), "spring", "uur");
    } else if (beweegbaar === "beide") {
      /* Het uur blijft hetzelfde; de urenwijzer schuift binnen zijn uur mee. */
      gezet(uur * 60 + (n % 12) * 5, "spring", "minuut");
    } else {
      /* Alleen de minutenwijzer: altijd vooruit, zoals een echte klok, en de urenwijzer draait mee. */
      let naar = Math.floor(nu / 60) * 60 + (n % 12) * 5;
      if (naar <= nu) naar += 60;
      const g = grensRef.current;
      /* Met `klem`: een tik op het getal waar hij al staat doet niets; voorbij de grens blijft hij op de grens. */
      if (klem && naar - nu >= 60) naar = nu;
      else if (g && naar > g.tot) naar = klem ? g.tot : naar - 60;
      gezet(binnenGrens(naar), "draai", "minuut");
    }
  };

  /* ---------- slepen ---------- */

  const geo = tweede ? { cx: 300, cy: 300, k: 150 / R } : metSom ? { cx: 490, cy: 410, k: 0.84 } : { cx: 490, cy: 330, k: 1 };

  const hoekBij = (e: { clientX: number; clientY: number }) => {
    const r = svg.current?.getBoundingClientRect();
    if (!r) return 0;
    const x = ((e.clientX - r.left) * B) / r.width - geo.cx;
    const y = ((e.clientY - r.top) * H) / r.height - geo.cy;
    return mod((Math.atan2(x, -y) * 180) / Math.PI, 360);
  };

  const magGrijpen = (w: Wijzer) => actief && (beweegbaar === "beide" || beweegbaar === w);

  const opGrijp = (e: ReactPointerEvent, w: Wijzer) => {
    if (!magGrijpen(w)) return;
    e.preventDefault();
    e.stopPropagation();
    svg.current?.setPointerCapture(e.pointerId);
    if (anim.current !== null) {
      cancelAnimationFrame(anim.current);
      anim.current = null;
    }
    sleep.current = { wijzer: w, vanX: e.clientX, vanY: e.clientY, bewogen: false, id: e.pointerId };
  };

  const opBeweeg = (e: ReactPointerEvent) => {
    const sl = sleep.current;
    if (!sl || sl.id !== e.pointerId) return;
    if (!sl.bewogen && Math.hypot(e.clientX - sl.vanX, e.clientY - sl.vanY) < 8) return;
    sl.bewogen = true;
    const a = hoekBij(e);
    if (sl.wijzer === "minuut") {
      const nu = totaal.current;
      const naar = binnenGrens(nu + kortst(mod(nu * 6, 360), a) / 6);
      totaal.current = naar;
      zetToon({ u: naar * 0.5, m: naar * 6 });
    } else {
      zetToon({ u: a, m: toonRef.current.m });
    }
  };

  const opLos = (e: ReactPointerEvent) => {
    const sl = sleep.current;
    if (!sl || sl.id !== e.pointerId) return;
    sleep.current = null;
    if (!sl.bewogen) {
      /* Een tik op een wijzer kiest hem; daarna tikt het kind op de plek. */
      setGekozen(sl.wijzer);
      return;
    }
    setGekozen(sl.wijzer);
    const nu = totaal.current;
    if (sl.wijzer === "minuut") {
      /* Op het dichtstbijzijnde getal: hele vijf minuten. */
      gezet(binnenGrens(Math.round(nu / 5) * 5), "spring", "minuut");
    } else {
      const minuut = beweegbaar === "uur" ? 0 : mod(nu, 60);
      const uur = mod(Math.round(toonRef.current.u / 30 - minuut / 60), 12);
      gezet(uur * 60 + minuut, "spring", "uur");
    }
  };

  const zichtbaarGekozen = actief && beweegbaar ? gekozen : null;
  const getallenTikbaar = actief && (tikGetal || !!beweegbaar);

  return (
    <>
      <svg
        ref={svg}
        width={B}
        height={H}
        viewBox={`0 0 ${B} ${H}`}
        style={{ position: "absolute", left: 0, top: 0, overflow: "visible", touchAction: "none" }}
        onPointerMove={opBeweeg}
        onPointerUp={opLos}
        onPointerCancel={opLos}
        aria-label={vorm === "lijn" ? "Een getallenlijn van 1 tot en met 12" : "Een klok met wijzers"}
      >
        <g className={s.klok} style={{ transform: `translate(${geo.cx}px, ${geo.cy}px) scale(${geo.k})` }}>
          <Plaat
            vorm={vorm}
            uur={toon.u}
            minuut={toon.m}
            wijzers={wijzers}
            uurwijzer={uurwijzer}
            minuutwijzer={minuutwijzer}
            pil={pil}
            gekozen={zichtbaarGekozen}
            ring={ring}
            driehoek={driehoek}
            pijl={pijl}
            inkleur={inkleur}
            por={actief ? por : 0}
            grijp={{ uur: magGrijpen("uur"), minuut: magGrijpen("minuut") }}
            opGrijp={opGrijp}
            opGetal={getallenTikbaar ? opGetal : undefined}
            labels={labels}
            streepjes={streepjes}
            boog={boog}
            vlag={vlag}
            lijnMinuten={lijnMinuten}
          />
        </g>

        {tweede && (
          <g transform={`translate(690 290) scale(${rond(150 / R)})`}>
            <circle r={R + 8} fill="none" stroke={ROOD} strokeWidth={7} strokeDasharray="14 10" />
            <Plaat
              vorm="klok"
              uur={tweede.tijd * 0.5}
              minuut={tweede.tijd * 6}
              wijzers
              uurwijzer="fel"
              minuutwijzer="fel"
              pil={null}
              gekozen={null}
              ring={null}
              driehoek={null}
              pijl={null}
              inkleur={false}
              por={0}
              zacht
            />
          </g>
        )}
      </svg>

      {tweede && (
        <div className={s.naam} style={{ left: 690, top: 290 + 150 + 22 }}>
          {tweede.naam}
        </div>
      )}

      {digitaal && vorm === "klok" && <Digitaal uur={toon.u} minuut={toon.m} left={geo.cx} top={geo.cy + R * geo.k + 26} />}

      {actief && controle && (
        <div className={s.knoppen} style={{ left: digitaal ? geo.cx + 215 : geo.cx, top: geo.cy + R * geo.k + 28 }}>
          <button type="button" className={s.hulp} aria-label="Hulp" onClick={() => meld({ soort: "hulp", tijd: totaal.current })}>
            <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden>
              <path
                d="M8 13V6.5a1.5 1.5 0 0 1 3 0V12M11 11V4.5a1.5 1.5 0 0 1 3 0V11M14 11V5.5a1.5 1.5 0 0 1 3 0V12M17 12V8.5a1.5 1.5 0 0 1 3 0V15c0 4-3 7-7 7h-1c-2.5 0-4-1-5.5-3L3 14.5a1.6 1.6 0 0 1 2.5-2L8 15v-2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            className={s.controle}
            aria-label="Controleer"
            onClick={() => meld({ soort: "controle", tijd: totaal.current })}
          >
            <svg width="24" height="24" viewBox="0 0 20 20" aria-hidden>
              <path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}

/** De digitale tijd onder de klok, zoals een wekkerscherm: het uur oranje, de minuten paars. */
function Digitaal({ uur, minuut, left, top }: { uur: number; minuut: number; left: number; top: number }) {
  const m = mod(Math.round(minuut / 6), 60);
  const u = mod(Math.round(uur / 30 - m / 60), 12) || 12;
  return (
    <div className={s.digitaal} style={{ left, top }} aria-label={`${u}:${tweeCijfers(m)}`}>
      <span style={{ color: "#f08a24" }}>{u}</span>
      <span className={s.dubbelpunt} aria-hidden>
        <i />
        <i />
      </span>
      <span style={{ color: "#b98cf5" }}>{tweeCijfers(m)}</span>
    </div>
  );
}

/** Een kleine klok zonder bediening, bijvoorbeeld om uit te kiezen. `maat` in punten. */
export function Klokje({ tijd, maat }: { tijd: number; maat: number }) {
  const rand = R + 12;
  return (
    <svg width={maat} height={maat} viewBox={`${-rand} ${-rand} ${2 * rand} ${2 * rand}`} aria-hidden style={{ overflow: "visible" }}>
      <Plaat
        vorm="klok"
        uur={tijd * 0.5}
        minuut={tijd * 6}
        wijzers
        uurwijzer="fel"
        minuutwijzer="fel"
        pil={null}
        gekozen={null}
        ring={null}
        driehoek={null}
        pijl={null}
        inkleur={false}
        por={0}
      />
    </svg>
  );
}
