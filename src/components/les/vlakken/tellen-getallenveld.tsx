"use client";

/**
 * Het gekleurde getallenveld van Synthesis "Count to 120" (oktober 2026):
 * rijen van 10 tegels met een donker cijfer, elke kolom een eigen kleur (rood,
 * oranje, geel, limoen, groen, lichtblauw, blauw, paars, magenta, roze). Zo
 * staat 10 verder altijd recht eronder. Het veld kan groeien: 20, 50, 100, 120.
 *
 * - `rand`: een witte rand (het startgetal).
 * - `pijl`: witte driehoekjes boven en onder (waar je nu bent).
 * - `licht`: alleen deze getallen fel, de rest donker (een hint: "in deze rij").
 *
 * Meldt `{ soort: "getal", n }` bij een tik (als `actief`) en `{ soort: "klaar" }`.
 */

import type { CSSProperties } from "react";
import type { Vlakbasis } from "../soort";
import { Klaarknop } from "./tellen-onderdelen";
import s from "./tellen-stijl.module.css";

/** Per kolom (1 t/m 10), gemeten op de screenshots. */
export const KOLOMKLEUR = ["#e2506f", "#e99a5c", "#f0d54c", "#cde46c", "#6cb870", "#6fd0e2", "#7b8bd8", "#a957ba", "#e15ad8", "#f2c6d6"];

export type GetallenveldProps = {
  /** Het hoogste getal (een tiental). */
  tot: number;
  rand?: number[];
  pijl?: number | null;
  licht?: number[] | null;
  actief?: boolean;
  klaarKnop?: boolean;
};

function Driehoek({ x, y, omlaag, maat }: { x: number; y: number; omlaag: boolean; maat: number }) {
  return (
    <svg
      width={maat}
      height={maat * 0.7}
      viewBox="0 0 20 14"
      style={{ position: "absolute", left: x - maat / 2, top: y, transform: omlaag ? "rotate(180deg)" : undefined, pointerEvents: "none" }}
      aria-hidden
    >
      <path d="M10 1L19 13H1z" fill="#ffffff" />
    </svg>
  );
}

export function Getallenveld({ tot, rand = [], pijl = null, licht = null, actief = false, klaarKnop = false, meld, metSom }: GetallenveldProps & Vlakbasis) {
  const rijen = Math.ceil(tot / 10);
  const boven = metSom ? 128 : 30;
  /* Altijd ruimte onder het veld voor de knop met het vinkje, zodat het veld niet verspringt. */
  const onder = 96;
  const stap = Math.min(93, Math.floor((720 - boven - onder) / rijen));
  const cel = Math.round(stap * 0.92);
  const breed = 10 * stap - (stap - cel);
  const x0 = (980 - breed) / 2;
  const hoog = rijen * stap - (stap - cel);
  const y0 = boven + Math.max(0, (720 - boven - onder - hoog) / 2);
  const letter = Math.max(14, Math.round(cel * 0.2));

  const plek = (n: number) => ({ x: x0 + ((n - 1) % 10) * stap, y: y0 + Math.floor((n - 1) / 10) * stap });

  return (
    <div className={s.vlak}>
      {Array.from({ length: tot }, (_, i) => {
        const n = i + 1;
        const p = plek(n);
        const dof = licht !== null && !licht.includes(n);
        const omrand = rand.includes(n) || pijl === n;
        const stijl: CSSProperties = {
          left: p.x,
          top: p.y,
          width: cel,
          height: cel,
          background: KOLOMKLEUR[(n - 1) % 10],
          color: "#1c2440",
          fontSize: letter,
          fontWeight: 700,
          boxShadow: `${Math.max(2, cel * 0.04)}px ${Math.max(3, cel * 0.05)}px 0 #8f8780`,
          borderRadius: Math.max(6, cel * 0.11),
          animationDelay: `${Math.min(600, (i % 50) * 12)}ms`,
        };
        return (
          <button
            key={n}
            type="button"
            disabled={!actief}
            className={`${s.vak} ${s.mono} ${s.in} ${dof ? s.dof : ""} ${actief ? s.tikbaar : ""} ${omrand ? s.rand : ""}`}
            style={stijl}
            aria-label={`${n}`}
            onClick={() => meld({ soort: "getal", n })}
          >
            {n}
          </button>
        );
      })}

      {pijl !== null && pijl >= 1 && pijl <= tot && (
        <>
          <Driehoek x={plek(pijl).x + cel / 2} y={plek(pijl).y - cel * 0.26} omlaag maat={Math.max(14, cel * 0.24)} />
          <Driehoek x={plek(pijl).x + cel / 2} y={plek(pijl).y + cel + cel * 0.1} omlaag={false} maat={Math.max(14, cel * 0.24)} />
        </>
      )}

      {klaarKnop && <Klaarknop x={490} y={720 - 80} onKlaar={() => meld({ soort: "klaar" })} />}
    </div>
  );
}
