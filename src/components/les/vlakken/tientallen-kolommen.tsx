"use client";

/**
 * De twee kolommen van de plaatswaardetoets (oktober 2026), naar Synthesis
 * "Power of Place · Assessment" en "Mastery Check" (INSPIRATIE.md, ronde 1 en
 * 2; screenshot power-of-place-assessment-1).
 *
 * Links de kolom TIENTALLEN (blauw), rechts EENHEDEN (groen), gescheiden door
 * dunne lijnen. In elke kolom staat vaag de waarde (10 en 1). Tik in een
 * kolom en er komt een blauwe staaf van tien of een groen blokje bij; staven
 * staan netjes naast elkaar, blokjes zigzaggend onder elkaar. Tik op een staaf
 * of blokje om hem weer weg te halen. Onder elke kolom staat het aantal.
 *
 * Het draaiboek zet de aantallen; het vlak meldt `{ soort: "zet", kolom }`,
 * `{ soort: "weg", kolom }` en `{ soort: "klaar" }`, alleen als `actief` aan staat.
 */

import type { PointerEvent as Wijzer } from "react";
import type { Vlakbasis } from "../soort";
import s from "./optellen100.module.css";

export type KolommenProps = {
  tienen: number;
  enen: number;
  actief?: boolean;
  /** Het blauwe vinkje. */
  klaar?: boolean;
};

export type KolomMelding = { soort: "zet"; kolom: "tien" | "een" } | { soort: "weg"; kolom: "tien" | "een" } | { soort: "klaar" };

const BLAUW = "#3d8ff0";
const GROEN = "#4cc38a";
const LIJN = "rgba(170,190,230,0.55)";
const BOVEN = 140;
const ONDER = 520;
const TIEN = { x: 110, b: 380 };
const EEN = { x: 490, b: 380 };
const MAX = 9;

function Staaf({ x }: { x: number }) {
  const h = ONDER - BOVEN - 16;
  return (
    <g className={s.plop}>
      <rect x={x} y={BOVEN + 8} width={34} height={h} rx={4} fill={BLAUW} />
      <rect x={x + 3} y={BOVEN + 11} width={10} height={h - 6} rx={3} fill="rgba(255,255,255,0.16)" />
      {Array.from({ length: 9 }, (_, i) => (
        <line key={i} x1={x} y1={BOVEN + 8 + ((i + 1) * h) / 10} x2={x + 34} y2={BOVEN + 8 + ((i + 1) * h) / 10} stroke="rgba(20,40,90,0.35)" strokeWidth={1.2} />
      ))}
      <rect x={x + 6} y={BOVEN + 13} width={18} height={4} rx={2} fill="rgba(255,255,255,0.45)" />
    </g>
  );
}

function Blokje({ x, y }: { x: number; y: number }) {
  return (
    <g className={s.plop}>
      <rect x={x} y={y} width={36} height={36} rx={5} fill={GROEN} />
      <rect x={x + 5} y={y + 5} width={14} height={4} rx={2} fill="rgba(255,255,255,0.45)" />
    </g>
  );
}

export function Kolommen({ tienen, enen, actief = false, klaar = false, meld }: KolommenProps & Vlakbasis) {
  const t = Math.max(0, Math.min(MAX, tienen));
  const e = Math.max(0, Math.min(MAX, enen));
  const staafX = (i: number) => TIEN.x + 14 + i * 40;
  const blokje = (i: number) => ({ x: EEN.x + EEN.b / 2 - 40 + (i % 2) * 44, y: BOVEN + 30 + i * 38 });

  const tikVlak = (kolom: "tien" | "een", v: { x: number; b: number }) => (
    <rect
      x={v.x}
      y={BOVEN - 20}
      width={v.b}
      height={ONDER - BOVEN + 40}
      fill="transparent"
      className={actief ? s.knop : undefined}
      role={actief ? "button" : undefined}
      aria-label={actief ? (kolom === "tien" ? "Zet een staaf bij de tientallen" : "Zet een blokje bij de eenheden") : undefined}
      onPointerDown={(ev) => {
        if (!actief) return;
        ev.preventDefault();
        meld({ soort: "zet", kolom });
      }}
    />
  );
  const weg = (kolom: "tien" | "een") => (ev: Wijzer) => {
    if (!actief) return;
    ev.preventDefault();
    ev.stopPropagation();
    meld({ soort: "weg", kolom });
  };

  return (
    <div className={s.wortel}>
      <svg width={980} height={720} viewBox="0 0 980 720" style={{ position: "absolute", inset: 0 }}>
        <text x={TIEN.x + TIEN.b / 2} y={BOVEN - 26} textAnchor="middle" fontSize={24} fontWeight={800} letterSpacing={4} fill={BLAUW}>
          TIENTALLEN
        </text>
        <text x={EEN.x + EEN.b / 2} y={BOVEN - 26} textAnchor="middle" fontSize={24} fontWeight={800} letterSpacing={4} fill={GROEN}>
          EENHEDEN
        </text>
        {[TIEN.x, EEN.x, EEN.x + EEN.b].map((x) => (
          <line key={x} x1={x} y1={BOVEN - 10} x2={x} y2={ONDER} stroke={LIJN} strokeWidth={2} />
        ))}
        <text x={TIEN.x + TIEN.b / 2} y={(BOVEN + ONDER) / 2 + 22} textAnchor="middle" fontFamily="ui-monospace, Menlo, monospace" fontSize={64} fontWeight={700} fill="rgba(160,180,220,0.12)">
          10
        </text>
        <text x={EEN.x + EEN.b / 2} y={(BOVEN + ONDER) / 2 + 22} textAnchor="middle" fontFamily="ui-monospace, Menlo, monospace" fontSize={64} fontWeight={700} fill="rgba(160,180,220,0.12)">
          1
        </text>

        {tikVlak("tien", TIEN)}
        {tikVlak("een", EEN)}

        {Array.from({ length: t }, (_, i) => (
          <g key={`t${i}`} style={{ cursor: actief ? "pointer" : undefined }} onPointerDown={weg("tien")}>
            <Staaf x={staafX(i)} />
          </g>
        ))}
        {Array.from({ length: e }, (_, i) => (
          <g key={`e${i}`} style={{ cursor: actief ? "pointer" : undefined }} onPointerDown={weg("een")}>
            <Blokje {...blokje(i)} />
          </g>
        ))}

        <text key={`nt${t}`} className={s.plop} x={TIEN.x + TIEN.b / 2} y={ONDER + 58} textAnchor="middle" fontSize={40} fontWeight={700} fill="#ffffff">
          {t}
        </text>
        <text key={`ne${e}`} className={s.plop} x={EEN.x + EEN.b / 2} y={ONDER + 58} textAnchor="middle" fontSize={40} fontWeight={700} fill="#ffffff">
          {e}
        </text>

        {klaar && (
          <g
            className={actief ? s.vinkje : s.uit}
            role={actief ? "button" : undefined}
            aria-label={actief ? "Klaar" : undefined}
            onPointerDown={(ev) => {
              if (!actief) return;
              ev.preventDefault();
              meld({ soort: "klaar" });
            }}
          >
            <circle cx={930} cy={640} r={30} fill="#4b8af5" />
            <path d="M916 641 l10 10 l17 -19" fill="none" stroke="#ffffff" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}
      </svg>
    </div>
  );
}
