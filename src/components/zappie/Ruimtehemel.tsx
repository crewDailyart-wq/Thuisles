"use client";

/**
 * De ruimtehemel achter alle Zappie-schermen, helemaal in code (15 oktober 2026).
 *
 * Vervangt de ruimtefoto (`space-earth-background-*`) in de achterste laag van
 * het heelal, op verzoek van de eigenaar: de foto zag er herkenbaar door AI
 * gemaakt uit. De bestanden van de foto blijven staan.
 *
 * Drie delen:
 *   1. de lucht: een verloop van donker naar blauw met zachte nevelvlekken die
 *      bij het scrollen langzaam omhoog schuiven;
 *   2. planeten als vlakke pictogrammen, alleen in de zijranden zodat ze nooit
 *      achter de vakken staan. Ze schuiven bij het scrollen langzamer mee dan de
 *      inhoud (diepte). Er staat er ongeveer één per 300 pixels, dus hoe langer
 *      de pagina, hoe meer planeten er langskomen;
 *   3. de aarde onderaan, die langzaam draait en groter wordt naarmate je
 *      verder naar beneden scrolt: je vliegt er naartoe.
 *
 * De voortgang van het scrollen (0 bovenaan, 1 onderaan) staat als
 * `--rh-voortgang` op `.zp-rh`; de CSS doet de rest. De sterren komen nog steeds
 * uit `Sterrenveld`. Bij "minder beweging" en tijdens een missie (`rustig`)
 * draait en schuift er niets.
 */

import { useEffect, useMemo, useRef, useState } from "react";

const DIEPTE = 0.5;
const AFSTAND = 300;

type Ontwerp = {
  maat: number;
  kleur: string;
  donker: string;
  band?: string;
  banden?: [number, number][];
  kraters?: [number, number, number][];
  vlek?: string;
  ring?: string;
};

/** De planeten in de volgorde waarin ze langskomen; daarna begint de rij opnieuw. */
const ONTWERPEN: Ontwerp[] = [
  { maat: 150, kleur: "#A78BFA", donker: "#4C3A9E", band: "#C4B5FD", banden: [[34, 5], [46, 3], [58, 6]], ring: "#FDE68A" },
  { maat: 180, kleur: "#FBBF24", donker: "#92400E", band: "#FDE68A", banden: [[30, 5], [42, 8], [60, 4]], ring: "#E0F2FE" },
  { maat: 90, kleur: "#22D3EE", donker: "#0E6C8C", band: "#67E8F9", banden: [[40, 4], [54, 6]] },
  { maat: 105, kleur: "#4ADE80", donker: "#166534", kraters: [[38, 44, 5], [56, 34, 3], [48, 60, 4]] },
  { maat: 130, kleur: "#F59E0B", donker: "#78350F", band: "#FCD34D", banden: [[28, 4], [38, 6], [52, 4], [64, 5]], vlek: "#DC2626" },
  { maat: 55, kleur: "#EF4444", donker: "#7F1D1D", kraters: [[42, 44, 4], [58, 56, 3]] },
  { maat: 70, kleur: "#CBD5E1", donker: "#475569", kraters: [[40, 40, 6], [58, 52, 4], [44, 62, 3], [60, 36, 2.5]] },
  { maat: 110, kleur: "#3B82F6", donker: "#1E3A8A", band: "#93C5FD", banden: [[36, 3], [50, 5], [62, 3]] },
  { maat: 48, kleur: "#F472B6", donker: "#9D174D" },
  { maat: 120, kleur: "#38BDF8", donker: "#075985", band: "#7DD3FC", banden: [[44, 5]], ring: "#C4B5FD" },
  { maat: 60, kleur: "#FB923C", donker: "#9A3412", kraters: [[44, 46, 4], [56, 58, 3]] },
  { maat: 85, kleur: "#2DD4BF", donker: "#115E59", band: "#99F6E4", banden: [[42, 6]], ring: "#F9A8D4" },
  { maat: 75, kleur: "#C084FC", donker: "#581C87", kraters: [[42, 42, 5], [58, 56, 4]] },
  { maat: 140, kleur: "#E9D5A6", donker: "#8B6B3A", band: "#F5E6C4", banden: [[32, 4], [46, 7], [60, 4]], ring: "#FDE68A" },
];

type Plek = { ontwerp: Ontwerp; x: number; y: number; duur: number; wacht: number };

/** Vaste plekken, elke keer hetzelfde: afwisselend links en rechts, met een beetje speling. */
function plekken(hoogte: number): Plek[] {
  let zaad = 17;
  const toeval = () => {
    zaad = (zaad * 16807) % 2147483647;
    return (zaad - 1) / 2147483646;
  };
  const lijst: Plek[] = [];
  const aantal = Math.max(4, Math.ceil((hoogte - 130) / AFSTAND));
  for (let i = 0; i < aantal; i++) {
    const links = i % 2 === 1;
    const x = links ? 2 + toeval() * 6 : 92 + toeval() * 6;
    const y = Math.min(hoogte - 60, 150 + i * AFSTAND + (toeval() - 0.5) * 120);
    lijst.push({ ontwerp: ONTWERPEN[i % ONTWERPEN.length], x, y, duur: 6 + (i % 4), wacht: -i });
  }
  return lijst;
}

function PlaneetBeeld({ p, id }: { p: Ontwerp; id: string }) {
  const ring = p.ring ? { cx: 50, cy: 50, rx: 48, ry: 12, fill: "none", stroke: p.ring, strokeWidth: 5, transform: "rotate(-18 50 50)" } : null;
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id={`${id}-bol`}>
          <circle cx="50" cy="50" r="30" />
        </clipPath>
        {ring && (
          <clipPath id={`${id}-voor`}>
            <rect x="0" y="50" width="100" height="50" transform="rotate(-18 50 50)" />
          </clipPath>
        )}
      </defs>
      <circle cx="50" cy="50" r="36" fill={p.kleur} opacity="0.15" />
      {ring && <ellipse {...ring} opacity="0.55" />}
      <g clipPath={`url(#${id}-bol)`}>
        <circle cx="50" cy="50" r="30" fill={p.kleur} />
        {p.banden?.map(([y, h]) => <rect key={y} x="0" y={y} width="100" height={h} fill={p.band} />)}
        {p.vlek && <ellipse cx="58" cy="56" rx="7" ry="4.5" fill={p.vlek} opacity="0.85" />}
        {p.kraters?.map(([cx, cy, r]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill={p.donker} opacity="0.6" />)}
        <circle cx="66" cy="62" r="34" fill={p.donker} opacity="0.45" />
        <circle cx="40" cy="38" r="7" fill="#fff" opacity="0.18" />
      </g>
      {ring && (
        <g clipPath={`url(#${id}-voor)`}>
          <ellipse {...ring} />
        </g>
      )}
    </svg>
  );
}

/*
  De aarde (16 oktober 2026, naar het voorbeeld van de eigenaar): een vlakkere
  horizon met een felle blauwe gloed erboven en dikke witte wolken die op de
  rand liggen. De bol is een cirkel met straal STRAAL; de bovenkant ligt in
  het midden op y = TOP van het 2000 × 300-vlak.
*/
const STRAAL = 5600;
const TOP = 50;
const MIDDEN_Y = TOP + STRAAL;

/** Hoogte van de rand van de aarde op plek x. */
function rand(x: number) {
  return MIDDEN_Y - Math.sqrt(STRAAL * STRAAL - (x - 1000) * (x - 1000));
}

/** Wolken op de horizon: plek, grootte en of hij gespiegeld is. */
const HORIZONWOLKEN: [number, number, boolean][] = [
  [140, 0.85, false],
  [330, 0.55, true],
  [740, 0.62, false],
  [1060, 0.42, true],
  [1580, 0.6, false],
  [1770, 0.85, true],
  [1940, 0.55, false],
];

/** Eén wolk: overlappende bollen met een platte onderkant. */
const BOLLEN: [number, number, number][] = [
  [-112, -6, 34],
  [-72, -26, 46],
  [-22, -44, 58],
  [34, -34, 50],
  [80, -16, 38],
  [114, -4, 26],
];

function Horizonwolk({ x, maat, spiegel }: { x: number; maat: number; spiegel: boolean }) {
  const y = rand(x) + 10 * maat;
  return (
    <g transform={`translate(${x} ${y}) scale(${spiegel ? -maat : maat} ${maat})`}>
      {BOLLEN.map(([bx, by, r]) => (
        <circle key={bx} cx={bx} cy={by} r={r} fill="url(#zp-rh-wolkkleur)" />
      ))}
      <rect x="-130" y="-22" width="260" height="28" rx="14" fill="url(#zp-rh-wolkkleur)" />
    </g>
  );
}

function Aarde() {
  const bol = { cx: 1000, cy: MIDDEN_Y };
  return (
    <div className="zp-rh-aarde">
      <div className="zp-rh-gloed" />
      <svg viewBox="0 0 2000 300" preserveAspectRatio="xMidYMin slice" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id="zp-rh-aardebol">
            <circle {...bol} r={STRAAL} />
          </clipPath>
          <linearGradient id="zp-rh-nacht" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#0A1438" stopOpacity="0.25" />
            <stop offset="0.5" stopColor="#0A1438" stopOpacity="0" />
            <stop offset="1" stopColor="#0A1438" stopOpacity="0.25" />
          </linearGradient>
          <linearGradient id="zp-rh-diepte" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#BFE9FF" stopOpacity="0.45" />
            <stop offset="0.25" stopColor="#FFFFFF" stopOpacity="0.05" />
            <stop offset="1" stopColor="#0A1438" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="zp-rh-wolkkleur" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="0.55" stopColor="#F4FAFF" />
            <stop offset="1" stopColor="#BFDDF7" />
          </linearGradient>
          <filter id="zp-rh-zacht" x="-10%" y="-200%" width="120%" height="500%">
            <feGaussianBlur stdDeviation="9" />
          </filter>
          <g id="zp-rh-land">
            <path fill="#3FAE5A" d="M60 120 C120 90 210 95 250 130 C290 165 260 210 200 220 C150 228 130 260 90 250 C50 240 70 200 40 180 C10 160 20 140 60 120 Z" />
            <path fill="#3FAE5A" d="M420 90 C480 70 560 85 590 110 C620 135 600 160 640 175 C690 195 680 240 620 250 C560 260 520 230 500 200 C480 170 430 175 410 145 C395 120 400 100 420 90 Z" />
            <path fill="#3FAE5A" d="M780 140 C820 120 880 125 900 150 C920 175 890 200 850 205 C810 210 770 190 765 168 C760 152 770 145 780 140 Z" />
            <path fill="#3FAE5A" d="M330 200 C345 192 365 195 368 208 C370 220 352 226 340 222 C328 218 322 206 330 200 Z" />
            <path fill="#E9D8A6" d="M560 130 C585 125 605 140 598 158 C590 172 565 170 555 158 C546 146 548 134 560 130 Z" />
            <ellipse cx="130" cy="150" rx="40" ry="18" fill="#2E8A47" />
            <ellipse cx="470" cy="115" rx="30" ry="12" fill="#2E8A47" />
            <ellipse cx="620" cy="215" rx="34" ry="14" fill="#2E8A47" />
            <ellipse cx="840" cy="165" rx="26" ry="10" fill="#2E8A47" />
          </g>
          <g id="zp-rh-wolken" fill="#FFFFFF">
            <ellipse cx="150" cy="105" rx="70" ry="12" opacity="0.75" />
            <ellipse cx="190" cy="118" rx="40" ry="8" opacity="0.6" />
            <ellipse cx="500" cy="150" rx="90" ry="11" opacity="0.7" />
            <ellipse cx="720" cy="96" rx="60" ry="9" opacity="0.65" />
            <ellipse cx="880" cy="225" rx="80" ry="12" opacity="0.7" />
            <ellipse cx="300" cy="250" rx="100" ry="12" opacity="0.6" />
          </g>
        </defs>
        {/* De dampkring: lagen licht boven de rand, de binnenste het felst. */}
        <circle {...bol} r={STRAAL + 70} fill="#3FA9F5" opacity="0.08" />
        <circle {...bol} r={STRAAL + 40} fill="#5BBEF7" opacity="0.12" />
        <circle {...bol} r={STRAAL + 20} fill="#8FD3FF" opacity="0.2" />
        <circle {...bol} r={STRAAL + 8} fill="#BFE6FF" opacity="0.3" />
        <g clipPath="url(#zp-rh-aardebol)">
          <rect x="0" y="0" width="2000" height="300" fill="#2A7BE0" />
          <g className="zp-rh-draai zp-rh-draai-land">
            <use href="#zp-rh-land" />
            <use href="#zp-rh-land" x="1000" />
            <use href="#zp-rh-land" x="2000" />
          </g>
          <g className="zp-rh-draai zp-rh-draai-wolken">
            <use href="#zp-rh-wolken" />
            <use href="#zp-rh-wolken" x="1000" />
            <use href="#zp-rh-wolken" x="2000" />
          </g>
          <rect x="0" y="0" width="2000" height="300" fill="url(#zp-rh-diepte)" />
          <rect x="0" y="0" width="2000" height="300" fill="url(#zp-rh-nacht)" />
        </g>
        {/* De felle rand van de dampkring. */}
        <circle {...bol} r={STRAAL + 2} fill="none" stroke="#A8E4FF" strokeWidth="16" opacity="0.8" filter="url(#zp-rh-zacht)" />
        <circle {...bol} r={STRAAL} fill="none" stroke="#E6F7FF" strokeWidth="3" />
        <g className="zp-rh-horizonwolken">
          {HORIZONWOLKEN.map(([x, maat, spiegel]) => (
            <Horizonwolk key={x} x={x} maat={maat} spiegel={spiegel} />
          ))}
        </g>
      </svg>
    </div>
  );
}

export function Ruimtehemel({ rustig }: { rustig: boolean }) {
  const hemel = useRef<HTMLDivElement>(null);
  const laag = useRef<HTMLDivElement>(null);
  const [hoogte, zetHoogte] = useState<number | null>(null);

  /* Hoe hoog de planetenlaag moet zijn: één scherm plus het deel van de pagina dat je met de diepte doorloopt. */
  useEffect(() => {
    const meet = () => {
      const vh = window.innerHeight;
      const pagina = document.documentElement.scrollHeight;
      zetHoogte(Math.round(vh + Math.max(0, pagina - vh) * DIEPTE));
    };
    meet();
    const waarnemer = new ResizeObserver(meet);
    waarnemer.observe(document.body);
    window.addEventListener("resize", meet);
    return () => {
      waarnemer.disconnect();
      window.removeEventListener("resize", meet);
    };
  }, []);

  /* Bij scrollen: planeten langzamer mee dan de inhoud, en de voortgang voor de lucht en de aarde. */
  useEffect(() => {
    const el = laag.current;
    const root = hemel.current;
    if (!el || !root) return;
    if (rustig) {
      el.style.transform = "";
      root.style.setProperty("--rh-voortgang", "0");
      return;
    }
    let frame = 0;
    const teken = () => {
      frame = 0;
      const y = window.scrollY;
      /* Op een korte pagina verandert de aarde maar een beetje; pas na twee schermen scrollen is hij op zijn grootst. */
      const max = Math.max(window.innerHeight * 2, document.documentElement.scrollHeight - window.innerHeight);
      el.style.transform = `translate3d(0, ${(-y * DIEPTE).toFixed(1)}px, 0)`;
      root.style.setProperty("--rh-voortgang", Math.min(1, y / max).toFixed(4));
    };
    const scroll = () => {
      if (!frame) frame = requestAnimationFrame(teken);
    };
    teken();
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", scroll);
    return () => {
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("resize", scroll);
      cancelAnimationFrame(frame);
    };
  }, [rustig]);

  const lijst = useMemo(() => (hoogte ? plekken(hoogte) : []), [hoogte]);

  return (
    <div ref={hemel} className="zp-rh" data-rustig={rustig ? "ja" : "nee"}>
      <div className="zp-rh-lucht" />
      <div ref={laag} className="zp-rh-planeten" style={hoogte ? { height: `${hoogte}px` } : undefined}>
        {lijst.map((plek, i) => (
          <div
            key={i}
            className="zp-rh-planeet"
            style={
              {
                left: `${plek.x}%`,
                top: `${plek.y}px`,
                width: `${plek.ontwerp.maat}px`,
                "--duur": `${plek.duur}s`,
                "--wacht": `${plek.wacht}s`,
              } as React.CSSProperties
            }
          >
            <PlaneetBeeld p={plek.ontwerp} id={`zp-rh-p${i}`} />
          </div>
        ))}
      </div>
      <Aarde />
    </div>
  );
}
