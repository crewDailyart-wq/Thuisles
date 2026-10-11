"use client";

/**
 * Het tegelbord van Optellen tot 20 (oktober 2026), naar Synthesis
 * "Add up to 20 · Add Across 10" en "Close To Doubles".
 *
 * Hetzelfde gestippelde raster als het gewone lesscherm, met rechts een eigen
 * bak. Het verschil met het gewone raster: tegels kunnen hier ook *liggen*
 * (twee rijen hoog, zoals de stroken van "9 + 4" boven een liggende 10), en
 * een toren kan een oplichtend leeg plekje krijgen waar het volgende blokje
 * moet komen ("maak van de 5 een 6").
 *
 * Het draaiboek bepaalt wat er ligt (`stroken`, `bak`, `slot`); het vlak meldt
 * alleen `{ soort: "tegel", n }` als het kind een tegel kiest. Een tegel kies je
 * door erop te tikken of hem naar het bord te slepen; meldingen gaan alleen
 * door als `actief` aan staat.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { Vlakbasis } from "../soort";
import { TEGELKLEUR, hoogte, stapel, vorm } from "../tegels";
import s from "./optellen20.module.css";

/** Een rij tegels op het bord: staand als toren, of liggend als strook van twee rijen. */
export type Strook = {
  /** Vaste sleutel, zodat een nieuw stuk netjes verschijnt. */
  id: string;
  stukken: number[];
  /** De linkerkolom op het bord (0 tot 11). */
  kolom: number;
  /** Staand: de onderste rij van de toren. Liggend: de bovenste van de twee rijen. Rij 0 is bovenaan. */
  rij: number;
  liggend?: boolean;
  /** Een oplichtend leeg hokje waar een losse 1 precies in zou passen. */
  plekje?: boolean;
  /** Het laatste stuk vervaagt (een tegel die niet past, gaat weer weg). */
  wegLaatste?: boolean;
};

export type TegelbordProps = {
  stroken: Strook[];
  bak: number[];
  /** Tegels in de bak die dof zijn en niet te pakken. */
  slot?: number[];
  /** De tegels in de bak liggen (na de eerste liggende strook). */
  bakLiggend?: boolean;
  actief?: boolean;
  /** Het logboekje linksboven: de sommen van het trucje onder elkaar ("5 + 5 = 10", "5 + 6 = ?"). */
  logboek?: { a: number; b: number; c: number | null }[];
};

export type TegelbordMelding = { soort: "tegel"; n: number };

const CEL = 66;
const KOLOMMEN = 12;
const RASTER_X = 22;
const BAK_X = 900;
const LIJN = "rgba(160,180,220,0.3)";

function rasterMaat(metSom: boolean) {
  return metSom ? { y: 118, rijen: 8 } : { y: 63, rijen: 9 };
}

/** De hokjes van één losse tegel, als (x, y) binnen de tegel, linksboven = 0. */
function losseHokjes(n: number, liggend: boolean): { x: number; y: number }[] {
  const h = hoogte(n);
  return vorm(n).map((hk) => (liggend ? { x: hk.r, y: hk.k === 1 ? 1 : 0 } : { x: hk.k, y: h - 1 - hk.r }));
}

/**
 * De hokjes van een strook op het bord, per stuk. Liggend is een gedraaide
 * toren: rij r van de toren wordt kolom r, en het rechter hokje (k = 1) komt
 * onderaan. Zo valt een oneven tegel na een oneven tegel precies in de inham.
 */
function strookHokjes(st: Strook): { x: number; y: number }[][] {
  return stapel(st.stukken).map((stuk) =>
    stuk.map((hk) =>
      st.liggend ? { x: st.kolom + hk.r, y: st.rij + (hk.k === 1 ? 1 : 0) } : { x: st.kolom + hk.k, y: st.rij - hk.r },
    ),
  );
}

function plekjeVan(st: Strook): { x: number; y: number } | null {
  const stukken = strookHokjes({ ...st, stukken: [...st.stukken, 1] });
  return stukken[stukken.length - 1]?.[0] ?? null;
}

/** Eén hokje met een gaatje, zoals de getaltegels van het lesscherm. */
function Hokje({ x, y, c, kleur }: { x: number; y: number; c: number; kleur: string }) {
  return (
    <g>
      <rect x={x + 0.5} y={y + 0.5} width={c - 1} height={c - 1} rx={c * 0.07} fill={kleur} />
      <rect x={x + 2} y={y + 1.5} width={c - 4} height={Math.max(1.5, c * 0.03)} rx={1} fill="rgba(255,255,255,0.2)" />
      <rect x={x + 1} y={y + c - 1 - c * 0.05} width={c - 2} height={c * 0.05} fill="rgba(0,0,0,0.16)" />
      <circle cx={x + c / 2} cy={y + c / 2} r={c * 0.18} fill="#0a1020" />
    </g>
  );
}

export function Tegel({ n, x, y, c, liggend = false }: { n: number; x: number; y: number; c: number; liggend?: boolean }) {
  const kleur = TEGELKLEUR[n] ?? "#cccccc";
  return (
    <g>
      {losseHokjes(n, liggend).map((h) => (
        <Hokje key={`${h.x}-${h.y}`} x={x + h.x * c} y={y + h.y * c} c={c} kleur={kleur} />
      ))}
    </g>
  );
}

function tegelMaat(n: number, liggend: boolean) {
  return liggend ? { b: hoogte(n), h: 2 } : { b: 2, h: hoogte(n) };
}

/** Plek en grootte van de tegels in de bak, van boven naar beneden. */
function legBak(tegels: number[], liggend: boolean) {
  const ruimte = 14;
  const rijen = tegels.reduce((a, n) => a + tegelMaat(n, liggend).h, 0);
  const max = liggend ? 26 : 40;
  const c = Math.max(14, Math.min(max, Math.floor((620 - ruimte * Math.max(0, tegels.length - 1)) / Math.max(1, rijen))));
  const totaal = rijen * c + ruimte * Math.max(0, tegels.length - 1);
  let y = 360 - totaal / 2;
  return {
    c,
    plekken: tegels.map((n) => {
      const m = tegelMaat(n, liggend);
      const plek = { n, x: BAK_X - (m.b * c) / 2, y, b: m.b * c, h: m.h * c };
      y += m.h * c + ruimte;
      return plek;
    }),
  };
}

export function Tegelbord({ stroken, bak, slot = [], bakLiggend = false, actief = false, logboek = [], meld, schaal, metSom }: TegelbordProps & Vlakbasis) {
  const wortel = useRef<HTMLDivElement>(null);
  const [sleep, setSleep] = useState<null | { n: number; x: number; y: number; vanX: number; vanY: number }>(null);
  const { y: rasterY, rijen } = rasterMaat(metSom);

  const inVlak = useCallback(
    (cx: number, cy: number) => {
      const r = wortel.current?.getBoundingClientRect();
      if (!r) return { x: 0, y: 0 };
      return { x: (cx - r.left) / (schaal || 1), y: (cy - r.top) / (schaal || 1) };
    },
    [schaal],
  );

  useEffect(() => {
    if (!sleep) return;
    const beweeg = (e: PointerEvent) => {
      const p = inVlak(e.clientX, e.clientY);
      setSleep((v) => (v ? { ...v, x: p.x, y: p.y } : v));
    };
    const los = (e: PointerEvent) => {
      const p = inVlak(e.clientX, e.clientY);
      const bewogen = Math.hypot(p.x - sleep.vanX, p.y - sleep.vanY) > 8;
      const opBord = p.x >= RASTER_X - 10 && p.x <= RASTER_X + KOLOMMEN * CEL + 10 && p.y >= rasterY - 10 && p.y <= rasterY + rijen * CEL + 10;
      if (actief && (!bewogen || opBord)) meld({ soort: "tegel", n: sleep.n });
      setSleep(null);
    };
    window.addEventListener("pointermove", beweeg);
    window.addEventListener("pointerup", los);
    return () => {
      window.removeEventListener("pointermove", beweeg);
      window.removeEventListener("pointerup", los);
    };
  }, [sleep, inVlak, actief, meld, rasterY, rijen]);

  const bakLeg = legBak(bak, bakLiggend);
  const sleepGezien = sleep && Math.hypot(sleep.x - sleep.vanX, sleep.y - sleep.vanY) > 8;

  return (
    <div ref={wortel} className={s.bord}>
      <svg width={980} height={720} viewBox="0 0 980 720" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {/* het gestippelde raster */}
        <g transform={`translate(${RASTER_X} ${rasterY})`}>
          {Array.from({ length: KOLOMMEN + 1 }, (_, i) => (
            <line key={`k${i}`} x1={i * CEL + 0.5} y1={0} x2={i * CEL + 0.5} y2={rijen * CEL} stroke={LIJN} strokeDasharray="2 3" />
          ))}
          {Array.from({ length: rijen + 1 }, (_, i) => (
            <line key={`r${i}`} x1={0} y1={i * CEL + 0.5} x2={KOLOMMEN * CEL} y2={i * CEL + 0.5} stroke={LIJN} strokeDasharray="2 3" />
          ))}

          {/* de stroken en torens */}
          {stroken.map((st) => {
            const per = strookHokjes(st);
            const plek = st.plekje ? plekjeVan(st) : null;
            return (
              <g key={st.id}>
                {per.map((hokjes, i) => {
                  const n = st.stukken[i];
                  const weg = st.wegLaatste && i === per.length - 1;
                  return (
                    <g key={`${st.id}-${i}-${n}`} className={`${s.stuk} ${weg ? s.weg : ""}`}>
                      {hokjes.map((h) => (
                        <Hokje key={`${h.x}-${h.y}`} x={h.x * CEL} y={h.y * CEL} c={CEL} kleur={TEGELKLEUR[n] ?? "#ccc"} />
                      ))}
                    </g>
                  );
                })}
                {plek && (
                  <rect
                    className={s.plekje}
                    x={plek.x * CEL + 3}
                    y={plek.y * CEL + 3}
                    width={CEL - 6}
                    height={CEL - 6}
                    rx={6}
                    fill="rgba(253,224,26,0.16)"
                    stroke="#fde01a"
                    strokeWidth={2.5}
                    strokeDasharray="6 5"
                  />
                )}
              </g>
            );
          })}
        </g>

        {/* het logboekje: de sommen van het trucje onder elkaar, in de kleuren van de tegels */}
        {logboek.map((r, i) => (
          <text key={`${r.a}-${r.b}-${r.c}-${i}`} className={s.stuk} x={RASTER_X + 14} y={rasterY + 44 + i * 44} fontSize={30} fontWeight={800} fill="#ffffff">
            <tspan fill={TEGELKLEUR[r.a] ?? "#ffffff"}>{r.a}</tspan>
            <tspan fill="#c3c7d0"> + </tspan>
            <tspan fill={TEGELKLEUR[r.b] ?? "#ffffff"}>{r.b}</tspan>
            <tspan fill="#c3c7d0"> = </tspan>
            <tspan fill={r.c === null ? "#c3c7d0" : TEGELKLEUR[r.c] ?? "#ffffff"}>{r.c === null ? "?" : r.c}</tspan>
          </text>
        ))}

        {/* de bak */}
        {bakLeg.plekken.map((p) => {
          const opSlot = slot.includes(p.n);
          const pakbaar = actief && !opSlot;
          return (
            <g
              key={p.n}
              className={`${s.baktegel} ${pakbaar ? s.pakbaar : ""} ${opSlot || !actief ? s.dof : ""}`}
              role={pakbaar ? "button" : undefined}
              aria-label={pakbaar ? `Tegel ${p.n}` : undefined}
              onPointerDown={(e) => {
                if (!pakbaar) return;
                e.preventDefault();
                const q = inVlak(e.clientX, e.clientY);
                setSleep({ n: p.n, x: q.x, y: q.y, vanX: q.x, vanY: q.y });
              }}
            >
              {/* een onzichtbaar vlak, zodat ook de inham van een tegel te pakken is */}
              <rect x={p.x - 4} y={p.y - 4} width={p.b + 8} height={p.h + 8} fill="transparent" />
              <Tegel n={p.n} x={p.x} y={p.y} c={bakLeg.c} liggend={bakLiggend} />
            </g>
          );
        })}

        {/* de tegel onder de vinger */}
        {sleep && sleepGezien && (
          <g style={{ pointerEvents: "none", opacity: 0.9 }}>
            <Tegel
              n={sleep.n}
              x={sleep.x - (tegelMaat(sleep.n, bakLiggend).b * CEL * 0.6) / 2}
              y={sleep.y - (tegelMaat(sleep.n, bakLiggend).h * CEL * 0.6) / 2}
              c={CEL * 0.6}
              liggend={bakLiggend}
            />
          </g>
        )}
      </svg>
    </div>
  );
}

/** Een tegel als lijntekening, voor de kaart aan het eind (SVG van 244 × 190). */
export function Lijntegel({ n, x, y, c, liggend = false, kleur }: { n: number; x: number; y: number; c: number; liggend?: boolean; kleur?: string }) {
  const k = kleur ?? TEGELKLEUR[n] ?? "#ffffff";
  return (
    <g transform={`translate(${x} ${y})`} stroke={k} strokeWidth="3" fill="none" strokeLinejoin="round" strokeLinecap="round">
      {losseHokjes(n, liggend).map((h) => (
        <g key={`${h.x}-${h.y}`}>
          <rect x={h.x * c + 1} y={h.y * c + 1} width={c - 2} height={c - 2} rx="3" />
          <ellipse cx={h.x * c + c / 2} cy={h.y * c + c / 2} rx={c * 0.2} ry={c * 0.22} />
        </g>
      ))}
    </g>
  );
}
