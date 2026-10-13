/**
 * De achtergrond van de kinderkant: het sterrenhemelplaatje van de eigenaar.
 *
 * Bron: ontwerp/achtergrond-breed.png (1672 x 941). De lichte bestanden in
 * public/hemel/ maak je opnieuw met `node scripts/maak-hemel.mjs`.
 *
 * Wat hier gebeurt:
 *   - het plaatje vult altijd het hele scherm, zonder randen, en staat vast
 *     terwijl de inhoud eroverheen scrolt;
 *   - liggend: het brede plaatje, in de maat die bij het scherm past;
 *   - staand (telefoon): het rechterdeel van het plaatje, met de planeet en
 *     de wolken. Er is nog geen echte staande versie;
 *   - staande tablet (vanaf 600 breed): hetzelfde deel, iets ingezoomd en
 *     bovenaan wat eraf, zodat de planeet tussen het Hoi-vakje en de tegels
 *     valt en niet achter de tegel Taal;
 *   - de sterren in het plaatje twinkelen zachtjes: over elke ster ligt een
 *     gloeiend lichtje dat rustig aan- en uitgaat. Bij "minder beweging" staat
 *     dat stil;
 *   - een lichte donkere rand aan de zijkanten, zodat het midden oplicht.
 *
 * De getekende sterren en wolkjes van eerst (`Sterrenhemel`) staan uit, maar
 * zijn er nog: zet `GETEKENDE_HEMEL_AAN` in Sterrenhemel.tsx op true.
 */

import { GETEKENDE_HEMEL_AAN, Sterrenhemel } from "@/components/avontuur/Sterrenhemel";

/** De uitsneden voor staand en staande tablet (zie maak-hemel.mjs). */
const STAAND_X = 966;
const TABLET = { x: 1007, y: 54, b: 665, h: 887 };
/** Vanaf deze breedte geldt een staand scherm als tablet. */
const TABLET_VANAF = "(orientation: portrait) and (min-width: 600px)";
const B = 1672;
const H = 941;

/*
  De sterren in het plaatje, in pixels van het origineel: x, y, grootte van de
  gloed. Gemeten uit het plaatje zelf (de heldere plekjes).
*/
const STERREN: [number, number, number][] = [
  [1253, 104, 30], [119, 273, 30], [1542, 345, 24], [173, 343, 16],
  [1472, 708, 18], [520, 842, 16], [1625, 489, 12], [1226, 686, 14],
  [193, 621, 12], [1485, 60, 8], [1406, 342, 8], [286, 188, 7],
  [380, 38, 6], [57, 630, 7], [1591, 385, 6], [1335, 553, 6],
  [127, 458, 6], [261, 493, 6], [56, 207, 6], [834, 869, 6], [1499, 300, 6],
];

function Twinkels({ viewBox, uitlijnen, className }: { viewBox: string; uitlijnen: string; className: string }) {
  return (
    <svg viewBox={viewBox} preserveAspectRatio={uitlijnen} className={className}>
      <defs>
        <radialGradient id="av-twinkel">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="35%" stopColor="#dfe8ff" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#9fb6ff" stopOpacity="0" />
        </radialGradient>
      </defs>
      {STERREN.map(([x, y, r], i) => (
        <g
          key={i}
          className="av-twinkel"
          style={{
            transformOrigin: `${x}px ${y}px`,
            animationDuration: `${3.2 + (i % 5) * 0.7}s`,
            animationDelay: `${(i * 0.83) % 4}s`,
          }}
        >
          <circle cx={x} cy={y} r={r * 1.6} fill="url(#av-twinkel)" />
          {r >= 12 && (
            <path
              d={`M${x} ${y - r} L${x + r * 0.18} ${y - r * 0.18} L${x + r} ${y} L${x + r * 0.18} ${y + r * 0.18} L${x} ${y + r} L${x - r * 0.18} ${y + r * 0.18} L${x - r} ${y} L${x - r * 0.18} ${y - r * 0.18} Z`}
              fill="#ffffff"
              opacity="0.9"
            />
          )}
        </g>
      ))}
    </svg>
  );
}

export function Hemel() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <picture>
        <source media={TABLET_VANAF} type="image/avif" srcSet="/hemel/tablet-665.avif" />
        <source media={TABLET_VANAF} type="image/webp" srcSet="/hemel/tablet-665.webp" />
        <source media="(orientation: portrait)" type="image/avif" srcSet="/hemel/staand-530.avif 530w, /hemel/staand-706.avif 706w" sizes="100vw" />
        <source media="(orientation: portrait)" type="image/webp" srcSet="/hemel/staand-530.webp 530w, /hemel/staand-706.webp 706w" sizes="100vw" />
        <source type="image/avif" srcSet="/hemel/breed-828.avif 828w, /hemel/breed-1280.avif 1280w, /hemel/breed-1672.avif 1672w" sizes="100vw" />
        <source type="image/webp" srcSet="/hemel/breed-828.webp 828w, /hemel/breed-1280.webp 1280w, /hemel/breed-1672.webp 1672w" sizes="100vw" />
        {/* Gewone <img> in <picture>: next/image kan geen aparte uitsnede per stand. */}
        <img
          src="/hemel/breed-1672.webp"
          alt=""
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover object-center portrait:object-right"
        />
      </picture>

      {/* twinkelende sterren, precies op de sterren van het plaatje */}
      <Twinkels viewBox={`0 0 ${B} ${H}`} uitlijnen="xMidYMid slice" className="absolute inset-0 h-full w-full portrait:hidden" />
      <Twinkels viewBox={`${STAAND_X} 0 ${B - STAAND_X} ${H}`} uitlijnen="xMaxYMid slice" className="absolute inset-0 hidden h-full w-full portrait:block portrait:min-[600px]:hidden" />
      <Twinkels viewBox={`${TABLET.x} ${TABLET.y} ${TABLET.b} ${TABLET.h}`} uitlijnen="xMaxYMid slice" className="absolute inset-0 hidden h-full w-full portrait:min-[600px]:block" />

      {/* donkere rand aan de zijkanten, zodat het midden oplicht */}
      <div className="av-vignet absolute inset-0" />

      {GETEKENDE_HEMEL_AAN && <Sterrenhemel />}
    </div>
  );
}
