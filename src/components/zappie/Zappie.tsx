"use client";

/**
 * Zappie, de mascotte: een vriendelijke robot op twee wielen.
 *
 * Getekend als SVG met losse onderdelen, zodat elk onderdeel apart kan
 * bewegen: de wielen, de armen, de ogen, de antenne en de spraaklijn op het
 * scherm. De beweging zelf zit in `zappie.css`; dit bestand tekent en zet
 * alleen de stand. Bij "minder beweging" staat alles stil.
 *
 * - `stemming`: hoe zijn ogen staan. "kijk" (grote open ogen), "blij"
 *   (gesloten boogjes) of "juich" (blij, en hij springt even op).
 * - `houding`: "zwaai" (hand omhoog, zwaaiend) of "wijs" (arm naar rechts, met
 *   een wijsvinger naar de missieknop).
 * - `praat`: de spraaklijn wordt een bewegende golf. Later kan die op echte
 *   audio reageren; dan hoeft alleen de schaal van `.zp-golf` uit het geluid
 *   te komen.
 * - `tik`: verhoog dit getal en Zappie maakt een sprongetje.
 * - `binnenrollen`: hij rolt bij het laden het beeld in, met draaiende wielen.
 * - `kijkMee`: zijn ogen en hoofd volgen de muis een klein beetje. Niet op een
 *   aanraakscherm en niet bij "minder beweging".
 */

import { useEffect, useId, useRef } from "react";

export type Stemming = "blij" | "kijk" | "juich";
export type Houding = "zwaai" | "wijs";

export function Zappie({
  stemming = "kijk",
  houding = "zwaai",
  praat = false,
  tik = 0,
  binnenrollen = false,
  kijkMee = false,
  className,
}: {
  stemming?: Stemming;
  houding?: Houding;
  praat?: boolean;
  tik?: number;
  binnenrollen?: boolean;
  kijkMee?: boolean;
  className?: string;
}) {
  const id = useId().replace(/:/g, "");
  const u = (naam: string) => `url(#${id}-${naam})`;
  const svg = useRef<SVGSVGElement>(null);

  /* Meekijken met de muis: ogen een paar pixels, hoofd een paar graden. */
  useEffect(() => {
    const el = svg.current;
    if (!kijkMee || !el) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    let laatste: PointerEvent | null = null;
    const pas = () => {
      frame = 0;
      if (!laatste) return;
      const r = el.getBoundingClientRect();
      const dx = (laatste.clientX - (r.left + r.width / 2)) / window.innerWidth;
      const dy = (laatste.clientY - (r.top + r.height * 0.35)) / window.innerHeight;
      el.style.setProperty("--kijk-x", `${Math.max(-1, Math.min(1, dx * 2)) * 6}px`);
      el.style.setProperty("--kijk-y", `${Math.max(-1, Math.min(1, dy * 2)) * 4}px`);
      el.style.setProperty("--draai", `${Math.max(-1, Math.min(1, dx * 2)) * 4}deg`);
    };
    const beweeg = (e: PointerEvent) => {
      laatste = e;
      if (!frame) frame = requestAnimationFrame(pas);
    };
    window.addEventListener("pointermove", beweeg, { passive: true });
    return () => {
      window.removeEventListener("pointermove", beweeg);
      cancelAnimationFrame(frame);
    };
  }, [kijkMee]);

  return (
    <svg
      ref={svg}
      viewBox="0 0 252 296"
      className={`zp-robot${binnenrollen ? " zp-binnenrollen" : ""} ${className ?? ""}`}
      data-stemming={stemming}
      data-houding={houding}
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
        <radialGradient id={`${id}-lamp`} cx="40%" cy="35%" r="65%">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.4" stopColor="#fff3b0" />
          <stop offset="1" stopColor="#ffc93a" />
        </radialGradient>
        <radialGradient id={`${id}-oog`} cx="40%" cy="35%" r="70%">
          <stop offset="0" stopColor="#e8fdff" />
          <stop offset="0.45" stopColor="#7ee8ff" />
          <stop offset="1" stopColor="#2bb8f0" />
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

      <g className="zp-robot-rol">
        <g
          key={tik}
          className={tik > 0 && stemming === "juich" ? "zp-robot-lijf zp-hop" : tik > 0 ? "zp-robot-lijf zp-wip" : "zp-robot-lijf"}
        >
          {/* Rechterwiel, achter het lijf. */}
          <g className="zp-wiel">
            <circle cx="170" cy="250" r="29" fill={u("band")} />
            <circle cx="170" cy="250" r="29" fill="none" stroke="#2c3a63" strokeWidth="2" strokeDasharray="5 6" />
            <circle cx="170" cy="250" r="17.5" fill="#0b1533" stroke="#52d9ff" strokeWidth="4" filter={u("gloed")} />
            <path d="m170 240 2.9 6 6.6.9-4.8 4.6 1.2 6.5-5.9-3.1-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9z" fill="#ffd447" />
          </g>

          {/* Lijf. */}
          <path d="M74 178c0-18 92-18 92 0l6 46c4 34-108 34-104 0z" fill={u("wit")} />
          <path d="M160 176c4 10 6 28 8 48 2 16-10 26-26 30" fill="none" stroke="#7fe3ff" strokeWidth="2.5" opacity="0.55" strokeLinecap="round" />
          <ellipse cx="104" cy="186" rx="20" ry="8" fill="#fff" opacity="0.8" />

          {/* De Z op zijn buik, met twee gele sterretjes. */}
          <path d="M108 203h22l-22 24h22" fill="none" stroke="#1d3f8a" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
          <path d="m92 198 2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.5 5-.7z" fill="#ffd447" stroke="#e9a612" strokeWidth="1" />
          <path d="m146 214 1.8 3.7 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4-2.9-2.8 4-.6z" fill="#ffd447" stroke="#e9a612" strokeWidth="1" />

          {/* Linkerwiel, vóór het lijf. */}
          <g className="zp-wiel">
            <circle cx="72" cy="252" r="32" fill={u("band")} />
            <circle cx="72" cy="252" r="32" fill="none" stroke="#2c3a63" strokeWidth="2" strokeDasharray="5 6" />
            <circle cx="72" cy="252" r="19.5" fill="#0b1533" stroke="#52d9ff" strokeWidth="4.5" filter={u("gloed")} />
            <path d="m72 240.5 3.3 6.8 7.5 1.1-5.4 5.3 1.3 7.4-6.7-3.5-6.7 3.5 1.3-7.4-5.4-5.3 7.5-1.1z" fill="#ffd447" />
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
            <g className="zp-hoofd-draai">
              {/* Antenne met een lampje. */}
              <path d="M120 42V16" stroke="#d8e4f5" strokeWidth="4.5" strokeLinecap="round" />
              <circle className="zp-antennebol" cx="120" cy="11" r="9" fill={u("lamp")} filter={u("gloed")} />

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

              <g className="zp-blik">
                <g className="zp-ogen" filter={u("gloed")}>
                  <g className="zp-ogen-open">
                    <ellipse cx="92" cy="100" rx="13" ry="16" fill={u("oog")} />
                    <ellipse cx="148" cy="100" rx="13" ry="16" fill={u("oog")} />
                    <circle cx="96" cy="93" r="4" fill="#fff" />
                    <circle cx="152" cy="93" r="4" fill="#fff" />
                  </g>
                  <g className="zp-ogen-blij">
                    <path d="M79 106c3-15 23-15 26 0" fill="none" stroke="#7ee8ff" strokeWidth="7.5" strokeLinecap="round" />
                    <path d="M135 106c3-15 23-15 26 0" fill="none" stroke="#7ee8ff" strokeWidth="7.5" strokeLinecap="round" />
                  </g>
                </g>

                {/* De spraaklijn: een glimlach als hij luistert, een golf als hij praat. */}
                <g filter={u("gloed")}>
                  <path className="zp-glimlach" d="M106 126c8 8 20 8 28 0" fill="none" stroke="#b9a6ff" strokeWidth="4" strokeLinecap="round" />
                  <path
                    className="zp-golf"
                    d="M80 128h20l4-7 5 14 5-20 5 24 5-17 4 10 3-4h29"
                    fill="none"
                    stroke="#52d9ff"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
              </g>
            </g>
          </g>

          {/* Rechterarm, zwaaiend: omhoog, de onderarm met de hand zwaait. */}
          <g className="zp-arm-rechts zp-arm-zwaai">
            <path d="M158 188c22 0 36-8 46-24" fill="none" stroke="#8ea5c9" strokeWidth="19" strokeLinecap="round" />
            <path d="M158 188c22 0 36-8 46-24" fill="none" stroke={u("arm")} strokeWidth="15" strokeLinecap="round" />
            <g className="zp-onderarm">
              <path d="M204 164c10-8 20-18 24-30" fill="none" stroke="#8ea5c9" strokeWidth="18" strokeLinecap="round" />
              <path d="M204 164c10-8 20-18 24-30" fill="none" stroke={u("arm")} strokeWidth="14" strokeLinecap="round" />
              <circle cx="204" cy="164" r="5" fill="#9fb4d6" />
              <path transform="translate(24 -8)" d="M193 128c-2-6 0-10 4-10l2-12c1-4 6-4 6 0v10l2-13c1-4 6-4 6 0l-1 14 4-9c2-4 7-2 6 2l-4 13c4-4 9-1 7 3l-6 9c-3 5-9 7-15 6-7-1-11-7-11-13z" fill="#18213b" />
            </g>
          </g>

          {/* Rechterarm, wijzend: naar rechts, met de wijsvinger naar de missieknop. */}
          <g className="zp-arm-rechts zp-arm-wijs">
            <path d="M158 190c16 2 28-2 40-10" fill="none" stroke="#8ea5c9" strokeWidth="19" strokeLinecap="round" />
            <path d="M158 190c16 2 28-2 40-10" fill="none" stroke={u("arm")} strokeWidth="15" strokeLinecap="round" />
            <path d="M198 180c8-4 15-9 20-15" fill="none" stroke="#8ea5c9" strokeWidth="18" strokeLinecap="round" />
            <path d="M198 180c8-4 15-9 20-15" fill="none" stroke={u("arm")} strokeWidth="14" strokeLinecap="round" />
            <circle cx="198" cy="180" r="5" fill="#9fb4d6" />
            <g className="zp-wijshand">
              <path d="M214 170c-2-8 3-15 11-15h6c6 0 9 6 6 11l-4 6c-3 5-9 7-14 5-3-1-5-4-5-7z" fill="#18213b" />
              <path d="M228 157l17-9" stroke="#18213b" strokeWidth="7" strokeLinecap="round" />
              <path d="M226 157c-3-5-1-9 3-9" fill="none" stroke="#18213b" strokeWidth="5" strokeLinecap="round" />
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}
