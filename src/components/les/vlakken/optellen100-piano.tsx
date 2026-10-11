"use client";

/**
 * Een kleine piano (oktober 2026), naar het muziekvoorbeeld in Synthesis
 * "Add up to 100 · Part Part Whole": je bouwt een liedje uit losse noten, zoals
 * je een getal samenvoegt uit kleine stukjes.
 *
 * Bovenaan een notenbalk, onderaan zeven witte toetsen (do tot en met si) en
 * vijf grijze. Elke tik op een witte toets laat een toon horen en zet een
 * gekleurde noot op de balk. Met `speelknop` verschijnt de afspeelknop; die
 * speelt het hele liedje.
 *
 * Het draaiboek houdt de noten bij (`noten`); het vlak meldt
 * `{ soort: "toets", n }` (0 = do … 6 = si) en `{ soort: "speel" }`, alleen als
 * `actief` aan staat.
 */

import { useRef } from "react";
import type { Vlakbasis } from "../soort";
import { TEGELKLEUR } from "../tegels";
import s from "./optellen100.module.css";

export type PianoProps = {
  noten: number[];
  actief?: boolean;
  speelknop?: boolean;
};

export type PianoMelding = { soort: "toets"; n: number } | { soort: "speel" };

const NAMEN = ["do", "re", "mi", "fa", "sol", "la", "si"];
const TOON = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88];
const LIJN = "rgba(220,226,240,0.7)";

const BALK_X = 140;
const BALK_B = 640;
/** y van de onderste lijn (mi); elke stap omhoog is een halve lijnafstand. */
const MI_Y = 270;
const HALF = 15;

const TOETS_X = 175;
const TOETS_B = 90;
const TOETS_Y = 400;
const TOETS_H = 250;

function noothoogte(n: number) {
  return MI_Y - (n - 2) * HALF;
}

export function Piano({ noten, actief = false, speelknop = false, meld }: PianoProps & Vlakbasis) {
  const geluid = useRef<AudioContext | null>(null);

  const speel = (n: number, wanneer = 0) => {
    try {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      geluid.current ??= new Ctx();
      const c = geluid.current;
      const t = c.currentTime + wanneer;
      const osc = c.createOscillator();
      const vol = c.createGain();
      osc.type = "triangle";
      osc.frequency.value = TOON[n];
      vol.gain.setValueAtTime(0.0001, t);
      vol.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
      vol.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
      osc.connect(vol).connect(c.destination);
      osc.start(t);
      osc.stop(t + 0.5);
    } catch {
      /* geen geluid: dan alleen de noten */
    }
  };

  return (
    <div className={s.wortel}>
      <svg width={980} height={720} viewBox="0 0 980 720" style={{ position: "absolute", inset: 0 }}>
        {/* de notenbalk */}
        {Array.from({ length: 5 }, (_, i) => (
          <line key={i} x1={BALK_X} y1={MI_Y - i * 2 * HALF} x2={BALK_X + BALK_B} y2={MI_Y - i * 2 * HALF} stroke={LIJN} strokeWidth={2} />
        ))}

        {/* de noten */}
        {noten.map((n, i) => {
          const x = BALK_X + 70 + i * 90;
          const y = noothoogte(n);
          const kleur = TEGELKLEUR[n + 1];
          return (
            <g key={`${i}-${n}`} className={s.plop}>
              {n === 0 && <line x1={x - 26} y1={y} x2={x + 26} y2={y} stroke={LIJN} strokeWidth={2} />}
              <ellipse cx={x} cy={y} rx={16} ry={12} transform={`rotate(-20 ${x} ${y})`} fill={kleur} />
              <line x1={x + 14} y1={y - 4} x2={x + 14} y2={y - 78} stroke={kleur} strokeWidth={4} />
            </g>
          );
        })}

        {/* de afspeelknop */}
        {speelknop && (
          <g
            className={actief ? s.vinkje : undefined}
            role={actief ? "button" : undefined}
            aria-label={actief ? "Speel het liedje af" : undefined}
            onPointerDown={(e) => {
              if (!actief) return;
              e.preventDefault();
              noten.forEach((n, i) => speel(n, i * 0.45));
              meld({ soort: "speel" });
            }}
          >
            {actief && <circle className={s.ring} cx={870} cy={210} r={42} fill="none" stroke="#f5c84b" strokeWidth={3} />}
            <circle cx={870} cy={210} r={36} fill="#8a2fb0" />
            <polygon points="858,190 858,230 892,210" fill="#ffffff" />
          </g>
        )}

        {/* de witte toetsen */}
        {NAMEN.map((naam, n) => {
          const x = TOETS_X + n * TOETS_B;
          return (
            <g
              key={naam}
              className={actief ? s.knop : undefined}
              role={actief ? "button" : undefined}
              aria-label={actief ? `Toets ${naam}` : undefined}
              onPointerDown={(e) => {
                if (!actief) return;
                e.preventDefault();
                speel(n);
                meld({ soort: "toets", n });
              }}
            >
              <rect x={x + 2} y={TOETS_Y} width={TOETS_B - 4} height={TOETS_H} rx={8} fill="#e9ecf3" />
              <rect x={x + 2} y={TOETS_Y + TOETS_H - 16} width={TOETS_B - 4} height={16} rx={6} fill={TEGELKLEUR[n + 1]} />
              <text x={x + TOETS_B / 2} y={TOETS_Y + TOETS_H - 30} textAnchor="middle" fontSize={22} fontWeight={800} fill="#2b2f3b">
                {naam}
              </text>
            </g>
          );
        })}

        {/* de grijze toetsen (alleen om te zien) */}
        {[1, 2, 4, 5, 6].map((i) => (
          <rect key={i} x={TOETS_X + i * TOETS_B - 24} y={TOETS_Y} width={48} height={150} rx={6} fill="#5d6272" style={{ pointerEvents: "none" }} />
        ))}
      </svg>
    </div>
  );
}
