/**
 * Het vuurvliegje en het glazen potje als kleine SVG voor de lesknoppen
 * (kaarttekeningen van 244 × 190). Dezelfde vorm als in de lessen zelf
 * (`maakVuurvliegje` en `tekenPot` in aftrekken-holo-teken.ts): twee
 * vleugeltjes, een donker kopje en lijfje, een helder lichtje als
 * achterlijf; het potje met bolle buik, hals en deksel.
 */

/**
 * Een vuurvliegje rond het midden van zijn lichtje (`x`, `y`). `maat` 1 is
 * een lichtje met straal 8. `licht`: de kleur van het lichtje.
 */
export function SvgVlieg({ x, y, maat = 1, licht = "#f2f79a", rand = "#c9d84a" }: { x: number; y: number; maat?: number; licht?: string; rand?: string }) {
  /* Het vuurvliegje van de les is 60 × 54 met het lichtje (straal 15) op (30, 35). */
  const k = (8 / 15) * maat;
  return (
    <g transform={`translate(${x} ${y}) scale(${k}) translate(-30 -35)`}>
      <ellipse cx="17" cy="15" rx="13" ry="8" transform="rotate(31.5 17 15)" fill="rgba(220,245,255,0.42)" stroke="#cfe9ff" strokeWidth="2.4" />
      <ellipse cx="43" cy="15" rx="13" ry="8" transform="rotate(-31.5 43 15)" fill="rgba(220,245,255,0.42)" stroke="#cfe9ff" strokeWidth="2.4" />
      <ellipse cx="30" cy="19" rx="6" ry="8" fill="#3b3a2a" stroke="#cfe9ff" strokeWidth="1.6" />
      <circle cx="30" cy="35" r="15" fill={licht} stroke={rand} strokeWidth="3" />
      <circle cx="26" cy="31" r="5" fill="#ffffff" opacity="0.75" />
    </g>
  );
}

/**
 * Een glazen potje met bolle buik, hals en deksel. `x`, `y`: linksboven van
 * de buik; `b`, `h`: breedte en hoogte van de buik.
 */
export function SvgPot({ x, y, b, h, kleur = "#f2c94c" }: { x: number; y: number; b: number; h: number; kleur?: string }) {
  const r = x + b;
  const o = y + h;
  const hl = x + b * 0.25;
  const hr = x + b * 0.75;
  const sch = b * 0.2;
  const hoek = Math.min(14, b * 0.15);
  const knik = y + sch * (12 / 70);
  return (
    <g fill="none" stroke={kleur} strokeLinecap="round" strokeLinejoin="round">
      <path
        d={`M${hl} ${y} Q${x} ${knik} ${x} ${y + sch} L${x} ${o - hoek} Q${x} ${o} ${x + hoek} ${o} L${r - hoek} ${o} Q${r} ${o} ${r} ${o - hoek} L${r} ${y + sch} Q${r} ${knik} ${hr} ${y} Z`}
        fill="rgba(255,226,160,0.07)"
        strokeWidth="3.2"
      />
      <rect x={hl} y={y - 9} width={hr - hl} height="9" rx="3" strokeWidth="2.8" />
      <rect x={x + b * 0.21} y={y - 19} width={b * 0.58} height="10" rx="4" strokeWidth="2.8" fill="rgba(255,211,110,0.28)" />
      <line x1={x + b * 0.1} y1={y + sch + 6} x2={x + b * 0.1} y2={o - 16} stroke="rgba(255,255,255,0.28)" strokeWidth="3" />
    </g>
  );
}
