"use client";

/**
 * Getallen en tekens groot in beeld (Vergelijken), naar Synthesis "Comparison
 * Symbols" en "Comparing Numbers": "6 ? 3", "8 < ?", drie vraagtekens.
 *
 * - Een getal met `rol` heeft een lichte pijl eronder; tikken telt het op
 *   (1 tot en met 9, dan weer 1). Meldt `{ soort: "rol", index, n, delen }`.
 * - Een teken met `tik` wisselt bij elke tik: = → > → <. Meldt
 *   `{ soort: "teken", index, s, delen }` (delen = alles zoals het nu staat).
 * - `klaar` zet het blauwe vinkje eronder: `{ soort: "klaar", delen }`.
 *
 * Het draaiboek zet nieuwe delen neer met een nieuwe `zet`.
 */

import { useState } from "react";
import type { Vlakbasis } from "../soort";
import { getalkleur } from "../tegels";
import s from "./vergelijken.module.css";

export type Teken = "=" | "<" | ">" | "?";

export type Deel =
  | { t: "getal"; n: number; rol?: boolean; maat?: number }
  | { t: "teken"; s: Teken; tik?: boolean }
  | { t: "vraag" };

export type GetallenProps = {
  delen: Deel[];
  zet: number;
  naam?: string | null;
  /** Een geel stipje bij de punt van het teken ("klein") of twee bij de open kant ("groot"). */
  stip?: "klein" | "groot" | null;
  klaar?: boolean;
};

const CREME = "#f3ecdf";

/** Een vergelijkingsteken als dikke, ronde lijnen; `?` als groot vraagteken. */
export function Tekenbeeld({ teken, maat, kleur = CREME }: { teken: Teken; maat: number; kleur?: string }) {
  const d = maat;
  const w = d * 0.13;
  if (teken === "?") {
    return (
      <span style={{ fontSize: d * 1.25, fontWeight: 800, lineHeight: 1, color: kleur }} aria-hidden>
        ?
      </span>
    );
  }
  return (
    <svg width={d} height={d} viewBox={`0 0 ${d} ${d}`} aria-hidden style={{ overflow: "visible" }}>
      {teken === "=" && (
        <g stroke={kleur} strokeWidth={w} strokeLinecap="round">
          <line x1={d * 0.15} y1={d * 0.36} x2={d * 0.85} y2={d * 0.36} />
          <line x1={d * 0.15} y1={d * 0.64} x2={d * 0.85} y2={d * 0.64} />
        </g>
      )}
      {teken === "<" && (
        <polyline points={`${d * 0.8},${d * 0.18} ${d * 0.2},${d * 0.5} ${d * 0.8},${d * 0.82}`} fill="none" stroke={kleur} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
      )}
      {teken === ">" && (
        <polyline points={`${d * 0.2},${d * 0.18} ${d * 0.8},${d * 0.5} ${d * 0.2},${d * 0.82}`} fill="none" stroke={kleur} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

/** Waar de gele stipjes komen bij een teken met midden (x, y) en maat d. */
export function stipPlekken(teken: Teken, stip: "klein" | "groot", x: number, y: number, d: number): { x: number; y: number }[] {
  if (teken !== "<" && teken !== ">") return [];
  const punt = teken === "<" ? -1 : 1; // aan welke kant de punt zit
  if (stip === "klein") return [{ x: x + punt * (d * 0.3 + 22), y }];
  return [
    { x: x - punt * (d * 0.3 + 18), y: y - d * 0.42 },
    { x: x - punt * (d * 0.3 + 18), y: y + d * 0.42 },
  ];
}

export const WISSEL: Record<Teken, Teken> = { "?": "=", "=": ">", ">": "<", "<": "=" };

export function Vinkje() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden>
      <path d="M5 12.5 10 17l9-10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function VergelijkenGetallen({ delen, zet, naam = null, stip = null, klaar = false, meld, metSom }: GetallenProps & Vlakbasis) {
  const [nu, setNu] = useState<Deel[]>(delen);
  const [vorigeZet, setVorigeZet] = useState(zet);
  const [tikken, setTikken] = useState(0);
  if (zet !== vorigeZet) {
    setVorigeZet(zet);
    setNu(delen);
  }

  const midden = metSom ? 400 : 360;
  const stap = 190;
  const start = 490 - ((nu.length - 1) * stap) / 2;
  const tekenIndex = nu.findIndex((d) => d.t === "teken");

  const tik = (i: number) => {
    const d = nu[i];
    if (d.t === "getal" && d.rol) {
      const n = (d.n % 9) + 1;
      const nieuw = nu.map((x, j) => (j === i ? { ...d, n } : x));
      setNu(nieuw);
      setTikken((t) => t + 1);
      meld({ soort: "rol", index: i, n, delen: nieuw });
    } else if (d.t === "teken" && d.tik) {
      const s2 = WISSEL[d.s];
      const nieuw = nu.map((x, j) => (j === i ? { ...d, s: s2 } : x));
      setNu(nieuw);
      setTikken((t) => t + 1);
      meld({ soort: "teken", index: i, s: s2, delen: nieuw });
    }
  };

  const voorlezen = nu
    .map((d) => (d.t === "getal" ? String(d.n) : d.t === "vraag" ? "vraagteken" : d.s === "?" ? "vraagteken" : d.s === "=" ? "is gelijk aan" : d.s === "<" ? "is kleiner dan" : "is groter dan"))
    .join(" ");

  return (
    <div className={s.vlak}>
      {naam && (
        <div key={naam} className={s.naam}>
          {naam}
        </div>
      )}
      <span className="sr-only" aria-live="polite">
        {voorlezen}
      </span>
      {nu.map((d, i) => {
        const x = start + i * stap;
        const kanTik = (d.t === "getal" && !!d.rol) || (d.t === "teken" && !!d.tik);
        return (
          <button
            key={i}
            type="button"
            className={s.deel}
            data-tik={kanTik}
            tabIndex={kanTik ? 0 : -1}
            aria-label={kanTik ? (d.t === "getal" ? `Getal ${d.n}, tik om te veranderen` : "Teken, tik om te wisselen") : undefined}
            aria-hidden={kanTik ? undefined : true}
            style={{ left: x, top: midden, cursor: kanTik ? "pointer" : "default" }}
            onClick={() => kanTik && tik(i)}
          >
            {d.t === "getal" && (
              <span key={`${d.n}-${tikken}`} className={`${s.getal} ${d.rol ? s.wissel : ""}`} style={{ color: getalkleur(d.n), fontSize: 150 * (d.maat ?? 1) }}>
                {d.n}
              </span>
            )}
            {d.t === "teken" && (
              <span key={`${d.s}-${tikken}`} className={d.tik ? s.wissel : undefined} style={{ display: "grid", placeItems: "center", height: 150 }}>
                <Tekenbeeld teken={d.s} maat={110} />
              </span>
            )}
            {d.t === "vraag" && <Tekenbeeld teken="?" maat={110} kleur="#fde01a" />}
          </button>
        );
      })}
      {/* de lichte pijl onder een getal dat je mag veranderen */}
      {nu.map((d, i) =>
        d.t === "getal" && d.rol ? (
          <svg key={`p${i}`} className={s.pijl} style={{ left: start + i * stap, top: midden + 100 }} width="40" height="44" viewBox="0 0 40 44" aria-hidden>
            <path d="M20 4 6 20h9v20h10V20h9z" fill="rgba(214,216,225,0.55)" />
          </svg>
        ) : null,
      )}
      {stip &&
        tekenIndex >= 0 &&
        nu[tekenIndex].t === "teken" &&
        stipPlekken((nu[tekenIndex] as { s: Teken }).s, stip, start + tekenIndex * stap, midden, 110).map((p, k) => (
          <div key={`${stip}-${k}`} className={s.stip} style={{ left: p.x, top: p.y }} />
        ))}
      {klaar && (
        <button type="button" className={s.klaar} style={{ left: 490, top: midden + 150 }} aria-label="Controleer" onClick={() => meld({ soort: "klaar", delen: nu })}>
          <Vinkje />
        </button>
      )}
    </div>
  );
}
