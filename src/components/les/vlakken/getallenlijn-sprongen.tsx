"use client";

/**
 * Getallenlijn met sprongen (oktober 2026), naar Synthesis "Subtract on the
 * Number Line · Difference Dash: Count the Jumps".
 *
 * Een witte lijn met streepjes en getallen. Aangetikte getallen worden groter
 * en koraalrood, met een rood streepje; zodra er twee zijn, wordt de rest van
 * de lijn grijzer. Een sterretje (de springer) staat op een getal en springt
 * één getal per keer; elke sprong laat een gloeiende boog achter (geel, wit,
 * rood; springt hij terug, dan loopt de kleur andersom). Bovenaan kunnen vijf
 * kristallen staan die één voor één oplichten.
 *
 * Meldt `{ soort: "getal", n }` als het kind op een getal tikt (als `actief`).
 */

import { useId } from "react";
import type { Vlakbasis } from "../soort";
import s from "./getallenlijn-sprongen.module.css";

/** Een sprong; `label` staat boven de top van de boog (bijvoorbeeld "1"). */
export type Boog = { van: number; naar: number; label?: string };

export type GetallenlijnSprongenProps = {
  van: number;
  tot: number;
  gemarkeerd?: number[];
  springer?: number | null;
  bogen?: Boog[];
  actief?: boolean;
  /** Vijf kristallen bovenaan; `aantal` = hoeveel er al oplichten. */
  kristallen?: number | null;
};

const LINKS = 55;
const RECHTS = 925;
const KORAAL = "#ef7a5f";

export function GetallenlijnSprongen({
  van,
  tot,
  gemarkeerd = [],
  springer = null,
  bogen = [],
  actief = false,
  kristallen = null,
  meld,
  metSom,
}: GetallenlijnSprongenProps & Vlakbasis) {
  const id = useId().replace(/:/g, "");
  const Y = metSom ? 420 : 360;
  const stap = (RECHTS - LINKS) / Math.max(1, tot - van);
  const x = (n: number) => LINKS + (n - van) * stap;
  const getallen = Array.from({ length: tot - van + 1 }, (_, i) => van + i);
  const twee = gemarkeerd.length >= 2;

  return (
    <div className={s.vlak}>
      <svg width={980} height={720} style={{ position: "absolute", inset: 0, overflow: "visible" }} aria-hidden>
        <defs>
          <filter id={`gloed-${id}`} x="-20%" y="-40%" width="140%" height="180%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
          {bogen.map((b, i) => (
            <linearGradient key={i} id={`boog-${id}-${i}`} gradientUnits="userSpaceOnUse" x1={x(b.van)} y1={0} x2={x(b.naar)} y2={0}>
              <stop offset="0" stopColor="#ffcf5a" />
              <stop offset="0.5" stopColor="#fff3dc" />
              <stop offset="1" stopColor="#ff5a46" />
            </linearGradient>
          ))}
        </defs>

        {/* de lijn */}
        <line x1={LINKS} y1={Y} x2={RECHTS} y2={Y} stroke="rgba(200,206,222,0.75)" strokeWidth="2.5" />
        {getallen.map((n) => {
          const aan = gemarkeerd.includes(n);
          return (
            <line
              key={n}
              x1={x(n)}
              y1={Y - (aan ? 12 : 9)}
              x2={x(n)}
              y2={Y + (aan ? 12 : 9)}
              stroke={aan ? KORAAL : "rgba(200,206,222,0.75)"}
              strokeWidth={aan ? 3.5 : 2.5}
            />
          );
        })}

        {/* de bogen */}
        {bogen.map((b, i) => {
          const x1 = x(b.van);
          const x2 = x(b.naar);
          const h = Math.min(110, Math.abs(x2 - x1) * 0.62);
          const d = `M ${x1} ${Y} C ${x1} ${Y - h * 1.33}, ${x2} ${Y - h * 1.33}, ${x2} ${Y}`;
          return (
            <g key={`${i}-${b.van}-${b.naar}`}>
              <path d={d} fill="none" stroke="#ff6a3c" strokeOpacity="0.55" strokeWidth="12" filter={`url(#gloed-${id})`} pathLength={1} className={s.boog} />
              <path d={d} fill="none" stroke={`url(#boog-${id}-${i})`} strokeWidth="5" strokeLinecap="round" pathLength={1} className={s.boog} />
              {b.label && (
                <text x={(x1 + x2) / 2} y={Y - h - 14} textAnchor="middle" fill="#ffffff" fontSize="22" fontWeight="700" className={s.boogLabel}>
                  {b.label}
                </text>
              )}
            </g>
          );
        })}

        {/* de kristallen */}
        {kristallen !== null && (
          <g transform={`translate(${490 - 2 * 62} ${metSom ? 160 : 90})`}>
            {Array.from({ length: 5 }, (_, i) => {
              const aan = i < kristallen;
              return (
                <g key={`${i}-${aan}`} transform={`translate(${i * 62} 0)`}>
                  <polygon
                    points="0,-22 16,-6 0,22 -16,-6"
                    className={`${s.kristal} ${aan ? s.kristalAan : ""}`}
                    fill={aan ? "#3fe3ff" : "#4a5266"}
                    stroke={aan ? "#c9f8ff" : "#626b80"}
                    strokeWidth="2"
                    style={{ transformBox: "fill-box", transformOrigin: "center", filter: aan ? "drop-shadow(0 0 8px rgba(63,227,255,0.8))" : undefined }}
                  />
                  <polyline points="-16,-6 16,-6" stroke={aan ? "#c9f8ff" : "#626b80"} strokeWidth="1.5" fill="none" />
                </g>
              );
            })}
            {kristallen >= 5 && (
              <text x={2 * 62} y={58} textAnchor="middle" fill="#3fe3ff" fontSize="22" fontWeight="700">
                5 kristallen verzameld
              </text>
            )}
          </g>
        )}
      </svg>

      {/* de getallen (en waar je op kunt tikken) */}
      {getallen.map((n) => {
        const aan = gemarkeerd.includes(n);
        return (
          <div
            key={n}
            className={s.label}
            style={{
              left: x(n) - 30,
              top: Y + (aan ? 20 : 22),
              fontSize: aan ? 26 : 17,
              color: aan ? KORAAL : "#aab2c4",
              opacity: twee && !aan ? 0.55 : 1,
            }}
          >
            {n}
          </div>
        );
      })}
      {getallen.map((n) => (
        <button
          key={`tik-${n}`}
          type="button"
          className={s.tik}
          disabled={!actief}
          style={{ left: x(n) - Math.min(stap, 120) / 2, top: Y - 120, width: Math.min(stap, 120), height: 180 }}
          aria-label={`Getal ${n}`}
          onClick={() => meld({ soort: "getal", n })}
        />
      ))}

      {/* het sterretje */}
      {springer !== null && (
        <div className={s.springer} style={{ left: x(springer) - 27, top: Y - 62 }}>
          <div key={springer} className={s.hop}>
            <Sterretje />
          </div>
        </div>
      )}
    </div>
  );
}

/** Het sterretje dat over de lijn springt (eigen tekening). */
export function Sterretje({ maat = 54 }: { maat?: number }) {
  return (
    <svg width={maat} height={maat * (60 / 54)} viewBox="0 0 54 60" aria-hidden>
      <ellipse cx="27" cy="57" rx="13" ry="3" fill="rgba(0,0,0,0.35)" />
      <path
        d="M27 3l6.6 13.6 15 2.1-10.9 10.5 2.6 14.9L27 37l-13.3 7.1 2.6-14.9L5.4 18.7l15-2.1z"
        fill="#ffd84a"
        stroke="#f29b22"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <circle cx="22.5" cy="23" r="2.4" fill="#2a2140" />
      <circle cx="31.5" cy="23" r="2.4" fill="#2a2140" />
      <path d="M22.5 29c2.6 2.4 6.4 2.4 9 0" fill="none" stroke="#2a2140" strokeWidth="2" strokeLinecap="round" />
      <path d="M21 44l-2 10M33 44l2 10" stroke="#f29b22" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
