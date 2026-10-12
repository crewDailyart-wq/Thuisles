"use client";

/**
 * Zappie, de mascotte: een vriendelijke robot op twee wielen.
 *
 * Getekend als SVG met losse onderdelen, zodat elk onderdeel apart kan
 * bewegen: de wielen, de armen (de rechterarm zwaait), de ogen, de antennes en
 * de geluidsgolf op het scherm. Alle beweging zit in `zappie.css`; dit bestand
 * tekent alleen. Bij "minder beweging" staat alles stil.
 *
 * - `stemming`: hoe zijn ogen staan. "blij" (gesloten boogjes), "kijk" (open
 *   ogen) of "juich" (blij, en hij springt even op).
 * - `praat`: de geluidsgolf beweegt, zoals wanneer hij iets zegt. Later kan die
 *   golf op echte audio reageren; dan hoeft alleen de schaal van `.zp-golf`
 *   uit het geluid te komen.
 * - `tik`: verhoog dit getal en Zappie maakt een sprongetje. Zo reageert hij
 *   op een klik ergens anders op het scherm.
 */

import { useId } from "react";

export type Stemming = "blij" | "kijk" | "juich";

export function Zappie({
  stemming = "blij",
  praat = false,
  tik = 0,
  className,
}: {
  stemming?: Stemming;
  praat?: boolean;
  tik?: number;
  className?: string;
}) {
  const id = useId().replace(/:/g, "");
  const u = (naam: string) => `url(#${id}-${naam})`;

  return (
    <svg
      viewBox="0 0 252 296"
      className={`zp-robot ${className ?? ""}`}
      data-stemming={stemming}
      data-praat={praat ? "ja" : "nee"}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`${id}-wit`} cx="36%" cy="28%" r="80%">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.5" stopColor="#f1f6fd" />
          <stop offset="0.8" stopColor="#cfdcef" />
          <stop offset="1" stopColor="#9fb4d6" />
        </radialGradient>
        <linearGradient id={`${id}-arm`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#c3d2ea" />
        </linearGradient>
        <linearGradient id={`${id}-scherm`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1e2f5c" />
          <stop offset="0.55" stopColor="#0c1734" />
          <stop offset="1" stopColor="#050b1f" />
        </linearGradient>
        <radialGradient id={`${id}-band`} cx="40%" cy="35%" r="70%">
          <stop offset="0" stopColor="#3a4870" />
          <stop offset="0.7" stopColor="#151f3d" />
          <stop offset="1" stopColor="#0a1027" />
        </radialGradient>
        <radialGradient id={`${id}-bol`} cx="35%" cy="35%" r="65%">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.35" stopColor="#b8f1ff" />
          <stop offset="1" stopColor="#3cc8f5" />
        </radialGradient>
        <filter id={`${id}-gloed`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.4" result="vaag" />
          <feMerge>
            <feMergeNode in="vaag" />
            <feMergeNode in="vaag" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={`${id}-zacht`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>

      {/* Schaduw op de grond: blijft liggen terwijl Zappie dobbert. */}
      <ellipse className="zp-robot-schaduw" cx="120" cy="285" rx="88" ry="9" fill="#020b2a" opacity="0.5" filter={u("zacht")} />

      <g key={tik} className={tik > 0 && stemming === "juich" ? "zp-robot-lijf zp-hop" : tik > 0 ? "zp-robot-lijf zp-wip" : "zp-robot-lijf"}>
        {/* Rechterwiel, achter het lijf. */}
        <g className="zp-wiel">
          <circle cx="170" cy="250" r="29" fill={u("band")} />
          <circle cx="170" cy="250" r="29" fill="none" stroke="#2c3a63" strokeWidth="2" strokeDasharray="5 6" />
          <circle cx="170" cy="250" r="17.5" fill="#0b1533" stroke="#52d9ff" strokeWidth="4" filter={u("gloed")} />
          <circle cx="170" cy="250" r="8" fill="#22335f" />
          <path d="M170 236v6M170 258v6M156 250h6M178 250h6" stroke="#52d9ff" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
        </g>

        {/* Lijf. */}
        <path d="M74 178c0-18 92-18 92 0l6 46c4 34-108 34-104 0z" fill={u("wit")} />
        <path d="M160 176c4 10 6 28 8 48 2 16-10 26-26 30" fill="none" stroke="#7fe3ff" strokeWidth="2.5" opacity="0.55" strokeLinecap="round" />
        <ellipse cx="104" cy="186" rx="20" ry="8" fill="#fff" opacity="0.8" />

        {/* De Z op zijn buik. */}
        <circle cx="120" cy="214" r="18" fill="#0d2a5c" stroke="#52d9ff" strokeWidth="4" filter={u("gloed")} />
        <path d="M112.5 206.5h15l-15 15h15" fill="none" stroke="#ffffff" strokeWidth="4.4" strokeLinecap="round" strokeLinejoin="round" />

        {/* Linkerwiel, vóór het lijf. */}
        <g className="zp-wiel">
          <circle cx="72" cy="252" r="32" fill={u("band")} />
          <circle cx="72" cy="252" r="32" fill="none" stroke="#2c3a63" strokeWidth="2" strokeDasharray="5 6" />
          <circle cx="72" cy="252" r="19.5" fill="#0b1533" stroke="#52d9ff" strokeWidth="4.5" filter={u("gloed")} />
          <circle cx="72" cy="252" r="9" fill="#22335f" />
          <path d="M72 236v7M72 261v7M56 252h7M81 252h7" stroke="#52d9ff" strokeWidth="2.2" strokeLinecap="round" opacity="0.7" />
          <path d="M50 236a28 28 0 0 1 22-14" fill="none" stroke="#6d7fae" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
        </g>

        {/* Linkerarm, naar beneden. */}
        <g className="zp-arm-links">
          <path d="M80 186c-16 6-26 18-28 36" fill="none" stroke="#8ea5c9" strokeWidth="19" strokeLinecap="round" />
          <path d="M80 186c-16 6-26 18-28 36" fill="none" stroke={u("arm")} strokeWidth="15" strokeLinecap="round" />
          <path d="M44 226c0-8 15-10 17-2l1 10c1 7-6 11-11 9l-5-3c-3-3-3-9-2-14z" fill="#18213b" />
          <path d="M45 232c-4 1-6 5-3 8" fill="none" stroke="#18213b" strokeWidth="5" strokeLinecap="round" />
        </g>

        {/* Nek. */}
        <ellipse cx="120" cy="168" rx="32" ry="9" fill="#14224a" />

        {/* Hoofd. */}
        <g className="zp-hoofd">
          {/* Antennes. */}
          <path d="M64 60 50 22" stroke="#d8e4f5" strokeWidth="4" strokeLinecap="round" />
          <path d="M176 60l14-38" stroke="#d8e4f5" strokeWidth="4" strokeLinecap="round" />
          <circle className="zp-antennebol" cx="49" cy="19" r="8" fill={u("bol")} filter={u("gloed")} />
          <circle className="zp-antennebol" cx="191" cy="19" r="8" fill={u("bol")} filter={u("gloed")} />

          {/* Oren. */}
          <circle cx="36" cy="104" r="20" fill={u("wit")} />
          <circle cx="36" cy="104" r="12.5" fill="#0b1533" stroke="#52d9ff" strokeWidth="4" filter={u("gloed")} />
          <circle cx="204" cy="104" r="20" fill={u("wit")} />
          <circle cx="204" cy="104" r="12.5" fill="#0b1533" stroke="#52d9ff" strokeWidth="4" filter={u("gloed")} />

          <rect x="34" y="40" width="172" height="126" rx="56" fill={u("wit")} />
          <path d="M196 84c4 18 3 40-4 58" fill="none" stroke="#7fe3ff" strokeWidth="3" opacity="0.55" strokeLinecap="round" />
          <ellipse cx="86" cy="56" rx="34" ry="9" fill="#fff" opacity="0.9" />

          {/* Het scherm. */}
          <rect x="50" y="60" width="140" height="90" rx="38" fill={u("scherm")} stroke="#0a1430" strokeWidth="3" />
          <path d="M66 82c6-12 18-17 36-18" fill="none" stroke="#fff" strokeWidth="5" opacity="0.12" strokeLinecap="round" />

          <g className="zp-ogen" filter={u("gloed")}>
            <g className="zp-ogen-blij">
              <path d="M78 110c3-15 23-15 26 0" fill="none" stroke="#7ee8ff" strokeWidth="7.5" strokeLinecap="round" />
              <path d="M136 110c3-15 23-15 26 0" fill="none" stroke="#7ee8ff" strokeWidth="7.5" strokeLinecap="round" />
            </g>
            <g className="zp-ogen-open">
              <rect x="80" y="88" width="20" height="26" rx="10" fill="#7ee8ff" />
              <rect x="140" y="88" width="20" height="26" rx="10" fill="#7ee8ff" />
              <circle cx="94" cy="95" r="3.5" fill="#fff" />
              <circle cx="154" cy="95" r="3.5" fill="#fff" />
            </g>
          </g>

          {/* De geluidsgolf: plat als hij luistert, beweeglijk als hij praat. */}
          <g filter={u("gloed")}>
            <path
              className="zp-golf"
              d="M74 130h24l4-7 5 14 5-20 5 24 5-17 4 10 3-4h37"
              fill="none"
              stroke="#52d9ff"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </g>

        {/* Rechterarm, omhoog en vóór het hoofd: de onderarm met de hand zwaait. */}
        <g className="zp-arm-rechts">
          <path d="M158 188c22 0 36-8 46-24" fill="none" stroke="#8ea5c9" strokeWidth="19" strokeLinecap="round" />
          <path d="M158 188c22 0 36-8 46-24" fill="none" stroke={u("arm")} strokeWidth="15" strokeLinecap="round" />
          <g className="zp-onderarm">
            <path d="M204 164c10-8 20-18 24-30" fill="none" stroke="#8ea5c9" strokeWidth="18" strokeLinecap="round" />
            <path d="M204 164c10-8 20-18 24-30" fill="none" stroke={u("arm")} strokeWidth="14" strokeLinecap="round" />
            <circle cx="204" cy="164" r="5" fill="#9fb4d6" />
            <path transform="translate(24 -8)" d="M193 128c-2-6 0-10 4-10l2-12c1-4 6-4 6 0v10l2-13c1-4 6-4 6 0l-1 14 4-9c2-4 7-2 6 2l-4 13c4-4 9-1 7 3l-6 9c-3 5-9 7-15 6-7-1-11-7-11-13z" fill="#18213b" />
          </g>
        </g>
      </g>
    </svg>
  );
}
