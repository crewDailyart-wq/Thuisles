"use client";

/**
 * De digitale wekker van de les "De digitale klok" (tweede bouwronde,
 * 10 oktober 2026), naar Synthesis "Telling Time · The Counting Clock".
 *
 * Eerst staan er vier kleine wekkers naast elkaar (met konijnenoren,
 * kattenoren, een gewei en een mandarijntje), allemaal op 7:00; het kind kiest
 * er zelf een (`kiezen`). Daarna staat alleen die wekker groot in beeld: het
 * uur in oranje, de minuten in paars, zoals de wijzers van de wijzerklok.
 * Een kader om het uur of de minuten (`rand`) wijst aan waar het om gaat.
 * Onder de wekker een ronde oranje knop (`uurknop`): elke druk telt er een
 * heel uur bij. Ingedrukt houden gaat steeds sneller en stopt vanzelf bij `tot`.
 *
 * Eigen tekeningen; niets van Synthesis overgenomen.
 *
 * Meldt `gekozen` ({ keuze: 0–3 }) en `uur` ({ tijd }) na elke druk.
 * Schrijft niets naar de database.
 */

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Vlakbasis } from "../soort";
import s from "./klok-wekker.module.css";

const B = 980;
const H = 720;

export const WEKKERNAMEN = ["De wekker met konijnenoren", "De wekker met kattenoren", "De wekker met een gewei", "De wekker met een mandarijntje"];

const KAST = ["#f4a9c4", "#6fd3be", "#eba37c", "#f5cd6c"];
const KAST_DONKER = ["#d9809f", "#3fae98", "#c97b55", "#d6a843"];
const UURKLEUR = "#f59a2c";
/* Een cijfer is ongeveer 0,6 keer zo breed als hoog (cijferklok-lettertype van 76). */
const CIJFERBREED = 46;
const MINUUTKLEUR = "#b98cf5";

export type WekkerProps = {
  /** De tijd in minuten vanaf 12 uur. Een nieuw object = de wekker springt erheen. */
  stand: { tijd: number };
  /** De vier wekkers om uit te kiezen. */
  kiezen?: boolean;
  /** Welke wekker het kind koos (0–3). */
  keuze?: number;
  /** Een kader om het uur of om de minuten. */
  rand?: "uur" | "minuut" | null;
  /** De ronde oranje knop: elke druk een heel uur erbij. */
  uurknop?: boolean;
  /** Verder dan deze tijd gaat de knop niet. */
  tot?: number | null;
  actief?: boolean;
};

const mod = (n: number, m: number) => ((n % m) + m) % m;
const uurVan = (t: number) => Math.floor(mod(t, 720) / 60) || 12;
const tweeCijfers = (n: number) => String(n).padStart(2, "0");

/** Wat er bovenop de wekker zit. */
function Versiering({ keuze }: { keuze: number }) {
  if (keuze === 0) {
    return (
      <g>
        <ellipse cx={-52} cy={-112} rx={19} ry={44} fill={KAST[0]} stroke={KAST_DONKER[0]} strokeWidth={3} />
        <ellipse cx={-52} cy={-110} rx={8} ry={30} fill="#fde3ee" />
        <ellipse cx={52} cy={-112} rx={19} ry={44} fill={KAST[0]} stroke={KAST_DONKER[0]} strokeWidth={3} />
        <ellipse cx={52} cy={-110} rx={8} ry={30} fill="#fde3ee" />
      </g>
    );
  }
  if (keuze === 1) {
    return (
      <g strokeLinejoin="round">
        <path d="M-96 -66 L-74 -118 L-40 -70 Z" fill={KAST[1]} stroke={KAST_DONKER[1]} strokeWidth={3} />
        <path d="M-84 -72 L-73 -100 L-55 -74 Z" fill="#fbe0e6" />
        <path d="M96 -66 L74 -118 L40 -70 Z" fill={KAST[1]} stroke={KAST_DONKER[1]} strokeWidth={3} />
        <path d="M84 -72 L73 -100 L55 -74 Z" fill="#fbe0e6" />
      </g>
    );
  }
  if (keuze === 2) {
    return (
      <g fill="none" stroke="#7b5034" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round">
        <path d="M-46 -72 L-50 -132 M-49 -108 L-70 -126 M-50 -122 L-34 -140" />
        <path d="M46 -72 L50 -132 M49 -108 L70 -126 M50 -122 L34 -140" />
        <ellipse cx={-66} cy={-74} rx={14} ry={9} fill={KAST[2]} stroke={KAST_DONKER[2]} strokeWidth={3} />
        <ellipse cx={66} cy={-74} rx={14} ry={9} fill={KAST[2]} stroke={KAST_DONKER[2]} strokeWidth={3} />
      </g>
    );
  }
  return (
    <g>
      <circle cx={-70} cy={-76} r={15} fill={KAST_DONKER[3]} />
      <circle cx={70} cy={-76} r={15} fill={KAST_DONKER[3]} />
      <circle cx={0} cy={-92} r={22} fill="#f28a1c" stroke="#d66f0c" strokeWidth={3} />
      <path d="M2 -113 C10 -126 24 -126 28 -118 C18 -112 10 -112 2 -113 Z" fill="#4fae4a" />
    </g>
  );
}

/** Eén wekker, getekend rond (0, 0): kast 300 × 150. */
function Wekkertekening({ keuze, tijd, rand }: { keuze: number; tijd: number; rand?: "uur" | "minuut" | null }) {
  const uur = String(uurVan(tijd));
  const min = tweeCijfers(mod(tijd, 60));
  return (
    <g>
      <Versiering keuze={keuze} />
      <rect x={-112} y={62} width={50} height={26} rx={12} fill={KAST_DONKER[keuze]} />
      <rect x={62} y={62} width={50} height={26} rx={12} fill={KAST_DONKER[keuze]} />
      <rect x={-150} y={-75} width={300} height={150} rx={34} fill={KAST[keuze]} stroke={KAST_DONKER[keuze]} strokeWidth={4} />
      <rect x={-126} y={-54} width={252} height={108} rx={20} fill="#101a2c" />
      {rand === "uur" && (
        <rect x={-27 - CIJFERBREED * uur.length} y={-44} width={CIJFERBREED * uur.length + 16} height={88} rx={14} fill="rgba(245,154,44,0.16)" stroke={UURKLEUR} strokeWidth={3} />
      )}
      {rand === "minuut" && <rect x={9} y={-44} width={CIJFERBREED * 2 + 16} height={88} rx={14} fill="rgba(185,140,245,0.16)" stroke={MINUUTKLEUR} strokeWidth={3} />}
      <text x={-20} y={4} textAnchor="end" dominantBaseline="central" className={s.cijfers} fill={UURKLEUR}>
        {uur}
      </text>
      <circle cx={-2} cy={-16} r={6} fill="#c8d6f5" />
      <circle cx={-2} cy={20} r={6} fill="#c8d6f5" />
      <text x={16} y={4} textAnchor="start" dominantBaseline="central" className={s.cijfers} fill={MINUUTKLEUR}>
        {min}
      </text>
    </g>
  );
}

export function Wekker({ stand, kiezen = false, keuze = 1, rand = null, uurknop = false, tot = null, actief = false, meld }: WekkerProps & Vlakbasis) {
  /* De tijd die de knop heeft gemaakt; een nieuwe `stand` van het draaiboek gaat voor. */
  const [eigen, setEigen] = useState({ bron: stand, tijd: stand.tijd });
  const nu = eigen.bron === stand ? eigen.tijd : stand.tijd;
  const nuRef = useRef(nu);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const meldRef = useRef(meld);
  const standRef = useRef(stand);
  const totRef = useRef(tot);
  useEffect(() => {
    nuRef.current = nu;
    meldRef.current = meld;
    standRef.current = stand;
    totRef.current = tot;
  });
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const vol = tot != null && nu >= tot;

  const stop = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  /** Eén uur erbij; geeft terug of er nog meer bij kan. */
  const eenUur = () => {
    const grens = totRef.current;
    if (grens != null && nuRef.current >= grens) return false;
    const nieuw = nuRef.current + 60;
    nuRef.current = nieuw;
    setEigen({ bron: standRef.current, tijd: nieuw });
    meldRef.current({ soort: "uur", tijd: nieuw });
    return grens == null || nieuw < grens;
  };

  const druk = () => {
    if (!actief || vol) return;
    stop();
    if (!eenUur()) return;
    /* Ingedrukt houden: na een halve seconde steeds sneller. */
    let wacht = 520;
    const herhaal = () => {
      timer.current = setTimeout(() => {
        if (!eenUur()) {
          timer.current = null;
          return;
        }
        wacht = Math.max(140, wacht * 0.72);
        herhaal();
      }, wacht);
    };
    herhaal();
  };

  let inhoud: ReactNode;
  if (kiezen) {
    inhoud = (
      <svg width={B} height={H} viewBox={`0 0 ${B} ${H}`} style={{ position: "absolute", left: 0, top: 0 }} aria-label="Vier wekkers om uit te kiezen">
        {[0, 1, 2, 3].map((k) => (
          <g
            key={k}
            transform={`translate(${490 + (k - 1.5) * 190} 300) scale(0.5)`}
            role="button"
            aria-label={WEKKERNAMEN[k]}
            className={actief ? s.kiesbaar : undefined}
            onClick={() => actief && meld({ soort: "gekozen", keuze: k })}
          >
            <rect x={-170} y={-170} width={340} height={280} fill="rgba(0,0,0,0)" />
            <Wekkertekening keuze={k} tijd={stand.tijd} />
          </g>
        ))}
      </svg>
    );
  } else {
    inhoud = (
      <>
        <svg width={B} height={H} viewBox={`0 0 ${B} ${H}`} style={{ position: "absolute", left: 0, top: 0 }} aria-label={`Een digitale wekker: ${uurVan(nu)}:${tweeCijfers(mod(nu, 60))}`}>
          <g transform="translate(490 270) scale(1.3)" className={s.groot}>
            <Wekkertekening keuze={keuze} tijd={nu} rand={rand} />
          </g>
        </svg>
        {uurknop && (
          <button
            type="button"
            className={s.uurknop}
            style={{ left: 490, top: 500 }}
            aria-label="Een uur erbij"
            disabled={!actief || vol}
            onPointerDown={(e) => {
              e.preventDefault();
              druk();
            }}
            onPointerUp={stop}
            onPointerLeave={stop}
            onPointerCancel={stop}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === " ") && !e.repeat) {
                e.preventDefault();
                if (actief && !vol) eenUur();
              }
            }}
          >
            <svg width="40" height="34" viewBox="0 0 40 34" aria-hidden>
              <path d="M20 5 L36 29 L4 29 Z" fill="#ffffff" stroke="#ffffff" strokeWidth={4} strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </>
    );
  }
  return <>{inhoud}</>;
}
