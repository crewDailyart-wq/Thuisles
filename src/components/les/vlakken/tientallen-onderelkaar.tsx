"use client";

/**
 * Een som onder elkaar (oktober 2026), naar Synthesis "Subtract 2-Digit
 * Numbers · 2-Digit Subtraction" (INSPIRATIE.md; screenshot
 * 2-digit-subtraction-1): twee getallen van twee cijfers onder elkaar, groot,
 * de tientallen groen en de eenheden blauw, een minteken links en een witte
 * streep eronder.
 *
 * - `licht`: alleen de tientallen of alleen de eenheden fel (de rest donker).
 * - `uitleg`: onder het bovenste getal staat klein "8 tientallen · 7 eenheden".
 *
 * Alleen om naar te kijken; het vlak meldt niets.
 */

import type { Vlakbasis } from "../soort";
import s from "./optellen100.module.css";

export type OnderelkaarProps = {
  boven: number;
  onder: number;
  teken?: string;
  licht?: "tien" | "een" | null;
  uitleg?: boolean;
};

const GROEN = "#4cc38a";
const BLAUW = "#3d8ff0";
const X_TIEN = 430;
const X_EEN = 590;

export function Onderelkaar({ boven, onder, teken = "−", licht = null, uitleg = false, metSom }: OnderelkaarProps & Vlakbasis) {
  const y0 = metSom ? 300 : 260;
  const cijfer = (n: number, plek: "tien" | "een", y: number) => (
    <text
      x={plek === "tien" ? X_TIEN : X_EEN}
      y={y}
      textAnchor="middle"
      fontSize={130}
      fontWeight={400}
      fill={plek === "tien" ? GROEN : BLAUW}
      className={s.vaag}
      opacity={licht && licht !== plek ? 0.22 : 1}
    >
      {plek === "tien" ? Math.floor(n / 10) : n % 10}
    </text>
  );
  return (
    <div className={s.wortel}>
      <svg width={980} height={720} viewBox="0 0 980 720" style={{ position: "absolute", inset: 0 }}>
        {cijfer(boven, "tien", y0)}
        {cijfer(boven, "een", y0)}
        {uitleg && (
          <g className={s.plop}>
            <text x={X_TIEN} y={y0 + 40} textAnchor="middle" fontSize={24} fontWeight={700} fill={GROEN}>
              {Math.floor(boven / 10)} tientallen
            </text>
            <text x={X_EEN} y={y0 + 40} textAnchor="middle" fontSize={24} fontWeight={700} fill={BLAUW}>
              {boven % 10} eenheden
            </text>
          </g>
        )}
        <text x={X_TIEN - 112} y={y0 + 140} textAnchor="middle" fontSize={90} fill="#e6e8ee" opacity={licht ? 0.22 : 1} className={s.vaag}>
          {teken}
        </text>
        {cijfer(onder, "tien", y0 + 160)}
        {cijfer(onder, "een", y0 + 160)}
        <line x1={X_TIEN - 140} y1={y0 + 200} x2={X_EEN + 110} y2={y0 + 200} stroke="#d6d8e1" strokeWidth={4} />
      </svg>
    </div>
  );
}
