/**
 * Wat er verder op Tesla's werktafel ligt (16 oktober 2026, keuze eigenaar).
 *
 * Losse spullen die op de blauwdruk liggen: een koffiekring van zijn mok,
 * een potlood, een gum, een paperclip, een liniaal, een inktvlekje en een
 * ezelsoor in de hoek van het vel. Ze liggen óp het papier, dus ze schuiven
 * bij het scrollen net iets sneller dan de tekening (Bouwtekening.tsx zet
 * --diepte); dat geeft diepte. De plakbandjes op de bladen staan in de CSS.
 *
 * Mat en rustig: gedempte kleuren, een korte schaduw en geen glans.
 */

import { maakToeval, vloeiend } from "@/components/zappie/bouwtekening/pen";

type Punt = [number, number];

/** Een koffiekring: een ring die niet helemaal rond is en ergens dunner wordt. */
export function Koffiekring({ zaad }: { zaad: number }) {
  const r = maakToeval(zaad);
  const ring = (straal: number, n = 40): Punt[] =>
    Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      const w = straal * (1 + (r() - 0.5) * 0.04);
      return [60 + Math.cos(a) * w, 60 + Math.sin(a) * w];
    });
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <path d={vloeiend(ring(46), true)} className="bt-koffie" strokeWidth={5} />
      <path d={vloeiend(ring(43), true)} className="bt-koffie" strokeWidth={1.4} opacity={0.6} />
      <path d={vloeiend(ring(49, 18).slice(2, 9))} className="bt-koffie" strokeWidth={2} opacity={0.5} />
      <circle cx={104} cy={86} r={3} className="bt-koffie-druppel" />
      <circle cx={110} cy={95} r={1.6} className="bt-koffie-druppel" />
    </svg>
  );
}

/** Een geslepen potlood, schuin. */
export function Potlood() {
  return (
    <svg viewBox="0 0 260 40" aria-hidden="true">
      <path d="M40 8 H236 a6 6 0 0 1 6 6 V26 a6 6 0 0 1 -6 6 H40 Z" fill="#d6ad55" />
      <path d="M40 8 H236 a6 6 0 0 1 6 6 V14 H40 Z" fill="#e6c477" />
      <path d="M40 26 H242 V26 a6 6 0 0 1 -6 6 H40 Z" fill="#b98f3e" />
      <path d="M226 8 h10 a6 6 0 0 1 6 6 V26 a6 6 0 0 1 -6 6 h-10 Z" fill="#c98a8a" />
      <path d="M216 8 h10 v24 h-10 Z" fill="#b8b8b0" />
      <path d="M40 8 L8 20 L40 32 Z" fill="#ead9b4" />
      <path d="M17 16.6 L8 20 L17 23.4 Z" fill="#3a3f4f" />
      <text x={120} y={24} className="bt-potlood-tekst">HB · TESLA</text>
    </svg>
  );
}

/** Een gum die al vaak gebruikt is: afgeronde hoek aan één kant. */
export function Gum() {
  return (
    <svg viewBox="0 0 90 50" aria-hidden="true">
      <path d="M8 10 H70 Q84 10 84 24 V40 H8 Z" fill="#d99a9a" />
      <path d="M8 10 H70 Q84 10 84 24 V24 H8 Z" fill="#e6b2b2" />
      <path d="M8 10 H34 V40 H8 Z" fill="#8fa9c9" />
      <path d="M90 44 l-5 -2 M86 47 l-4 -1 M80 48 l-3 0" stroke="#c98a8a" strokeWidth={1.6} strokeLinecap="round" />
    </svg>
  );
}

/** Een paperclip, twee keer omgebogen draad. */
export function Paperclip() {
  return (
    <svg viewBox="0 0 30 80" aria-hidden="true">
      <path
        d="M10 62 V18 a8 8 0 0 1 16 0 V66 a11 11 0 0 1 -22 0 V24"
        fill="none"
        stroke="#c4cbd6"
        strokeWidth={2.6}
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Een stukje liniaal met centimeters. */
export function Liniaal() {
  return (
    <svg viewBox="0 0 320 44" aria-hidden="true">
      <rect x={2} y={4} width={316} height={36} rx={3} fill="rgb(235 244 255 / 0.18)" stroke="rgb(235 244 255 / 0.5)" strokeWidth={1.2} />
      {Array.from({ length: 31 }, (_, i) => (
        <path key={i} d={`M${12 + i * 10} 4 V${i % 5 === 0 ? 20 : 12}`} stroke="rgb(240 248 255 / 0.75)" strokeWidth={1} />
      ))}
      {[0, 5, 10, 15, 20, 25, 30].map((n) => (
        <text key={n} x={12 + n * 10} y={33} className="bt-liniaal-tekst">
          {n / 5}
        </text>
      ))}
    </svg>
  );
}

/** Een klein inktvlekje met spatjes. */
export function Inktvlek({ zaad }: { zaad: number }) {
  const r = maakToeval(zaad);
  const rand: Punt[] = Array.from({ length: 14 }, (_, i) => {
    const a = (i / 14) * Math.PI * 2;
    const w = 15 + r() * 9;
    return [40 + Math.cos(a) * w, 40 + Math.sin(a) * w];
  });
  return (
    <svg viewBox="0 0 80 80" aria-hidden="true">
      <path d={vloeiend(rand, true)} className="bt-inkt" />
      <circle cx={68} cy={22} r={3.2} className="bt-inkt" />
      <circle cx={12} cy={60} r={2.2} className="bt-inkt" />
      <circle cx={70} cy={60} r={1.6} className="bt-inkt" />
    </svg>
  );
}
