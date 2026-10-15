"use client";

/**
 * De ruimtehemel achter alle Zappie-schermen, helemaal in code (15 oktober 2026).
 *
 * Vervangt de ruimtefoto (`space-earth-background-*`) in de achterste laag van
 * het heelal, op verzoek van de eigenaar: de foto zag er herkenbaar door AI
 * gemaakt uit. De bestanden van de foto blijven staan.
 *
 * Drie delen:
 *   1. de lucht: een verloop van donker naar blauw met zachte nevelvlekken;
 *   2. planeten als vlakke pictogrammen in de wereldkleuren, alleen in de
 *      zijranden zodat ze nooit achter de vakken staan. Ze schuiven bij het
 *      scrollen langzamer mee dan de inhoud (diepte), en hoe langer de pagina,
 *      hoe meer planeten er langskomen;
 *   3. de aarde onderaan, in dezelfde vlakke stijl, die heel langzaam draait.
 *
 * De sterren komen nog steeds uit `Sterrenveld`. Bij "minder beweging" en
 * tijdens een missie (`rustig`) draait en schuift er niets.
 */

import { useEffect, useRef, useState } from "react";

const DIEPTE = 0.35;

type Planeet = {
  x: number;
  y: number;
  maat: number;
  kleur: string;
  donker: string;
  band?: string;
  banden?: [number, number][];
  kraters?: [number, number, number][];
  ring?: string;
};

/** x in procenten van de breedte, y in procenten van de hoogte van de laag. */
const PLANETEN: Planeet[] = [
  { x: 88, y: 5, maat: 130, kleur: "#A78BFA", donker: "#4C3A9E", band: "#C4B5FD", banden: [[34, 5], [46, 3], [58, 6]], ring: "#FDE68A" },
  { x: 7, y: 13, maat: 72, kleur: "#22D3EE", donker: "#0E6C8C", band: "#67E8F9", banden: [[40, 4], [54, 6]] },
  { x: 93, y: 27, maat: 88, kleur: "#4ADE80", donker: "#166534", kraters: [[38, 44, 5], [56, 34, 3], [48, 60, 4]] },
  { x: 9, y: 37, maat: 42, kleur: "#FB923C", donker: "#9A3412", kraters: [[44, 46, 4], [56, 58, 3]] },
  { x: 86, y: 50, maat: 56, kleur: "#CBD5E1", donker: "#475569", kraters: [[40, 40, 6], [58, 52, 4], [44, 62, 3], [60, 36, 2.5]] },
  { x: 5, y: 62, maat: 150, kleur: "#FBBF24", donker: "#92400E", band: "#FDE68A", banden: [[30, 5], [42, 8], [60, 4]], ring: "#E0F2FE" },
  { x: 94, y: 74, maat: 36, kleur: "#F472B6", donker: "#9D174D" },
  { x: 8, y: 87, maat: 84, kleur: "#38BDF8", donker: "#075985", band: "#7DD3FC", banden: [[44, 5]], ring: "#C4B5FD" },
  { x: 90, y: 95, maat: 64, kleur: "#A78BFA", donker: "#4C3A9E", kraters: [[42, 42, 5], [58, 56, 4]] },
];

function PlaneetBeeld({ p, id }: { p: Planeet; id: string }) {
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

function Aarde() {
  return (
    <div className="zp-rh-aarde">
      <svg viewBox="0 0 2000 300" preserveAspectRatio="xMidYMin slice" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id="zp-rh-aardebol">
            <circle cx="1000" cy="2700" r="2640" />
          </clipPath>
          <linearGradient id="zp-rh-nacht" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#0A1438" stopOpacity="0" />
            <stop offset="0.6" stopColor="#0A1438" stopOpacity="0.05" />
            <stop offset="1" stopColor="#0A1438" stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id="zp-rh-diepte" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.12" />
            <stop offset="0.5" stopColor="#0A1438" stopOpacity="0" />
            <stop offset="1" stopColor="#0A1438" stopOpacity="0.35" />
          </linearGradient>
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
        <circle cx="1000" cy="2700" r="2700" fill="#3FA9F5" opacity="0.06" />
        <circle cx="1000" cy="2700" r="2680" fill="#5BBEF7" opacity="0.10" />
        <circle cx="1000" cy="2700" r="2662" fill="#8FD3FF" opacity="0.18" />
        <circle cx="1000" cy="2700" r="2650" fill="#A8DDFF" opacity="0.25" />
        <g clipPath="url(#zp-rh-aardebol)">
          <rect x="0" y="0" width="2000" height="300" fill="#1D5FC4" />
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
        <circle cx="1000" cy="2700" r="2640" fill="none" stroke="#BFE6FF" strokeWidth="3" opacity="0.8" />
      </svg>
    </div>
  );
}

export function Ruimtehemel({ rustig }: { rustig: boolean }) {
  const laag = useRef<HTMLDivElement>(null);
  const [hoogte, zetHoogte] = useState<number | null>(null);

  /* Hoe hoog de planetenlaag moet zijn: één scherm plus het deel van de pagina dat je met de diepte doorloopt. */
  useEffect(() => {
    const meet = () => {
      const vh = window.innerHeight;
      const pagina = document.documentElement.scrollHeight;
      zetHoogte(vh + Math.max(0, pagina - vh) * DIEPTE);
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

  /* Bij scrollen schuiven de planeten langzamer mee dan de inhoud. */
  useEffect(() => {
    const el = laag.current;
    if (!el) return;
    if (rustig) {
      el.style.transform = "";
      return;
    }
    let frame = 0;
    const teken = () => {
      frame = 0;
      el.style.transform = `translate3d(0, ${(-window.scrollY * DIEPTE).toFixed(1)}px, 0)`;
    };
    const scroll = () => {
      if (!frame) frame = requestAnimationFrame(teken);
    };
    teken();
    window.addEventListener("scroll", scroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", scroll);
      cancelAnimationFrame(frame);
    };
  }, [rustig]);

  return (
    <div className="zp-rh" data-rustig={rustig ? "ja" : "nee"}>
      <div className="zp-rh-lucht" />
      <div ref={laag} className="zp-rh-planeten" style={hoogte ? { height: `${hoogte}px` } : undefined}>
        {PLANETEN.map((p, i) => (
          <div
            key={i}
            className="zp-rh-planeet"
            style={
              {
                left: `${p.x}%`,
                top: hoogte ? `${Math.max(150, Math.min((p.y / 100) * hoogte, hoogte - 80))}px` : `${p.y}%`,
                width: `${p.maat}px`,
                "--duur": `${6 + (i % 4)}s`,
                "--wacht": `${-i}s`,
              } as React.CSSProperties
            }
          >
            <PlaneetBeeld p={p} id={`zp-rh-p${i}`} />
          </div>
        ))}
      </div>
      <Aarde />
    </div>
  );
}
