/**
 * Waterverf voor de reis door de drie werelden.
 *
 * Een vlek waterverf: een paar over elkaar liggende vormen, met een rafelige
 * rand (vervormd door ruis) en een iets donkerder randje, zoals verf die op
 * papier opdroogt. De filters staan één keer op de pagina (WaterverfFilters);
 * elke vlek gebruikt ze. Alles staat stil: verf beweegt niet.
 */

import { maakToeval } from "@/components/zappie/bouwtekening/pen";

export function WaterverfFilters() {
  return (
    <svg className="wr-filters" width="0" height="0" aria-hidden="true">
      {/* De rafelige, uitgelopen rand van de verf. */}
      <filter id="wr-verf" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.011" numOctaves={3} seed={4} result="ruis" />
        <feDisplacementMap in="SourceGraphic" in2="ruis" scale="46" xChannelSelector="R" yChannelSelector="G" result="rafel" />
        <feGaussianBlur in="rafel" stdDeviation="5" />
      </filter>
      {/* Het donkere randje waar de verf opdroogt. */}
      <filter id="wr-rand" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.011" numOctaves={3} seed={4} result="ruis" />
        <feDisplacementMap in="SourceGraphic" in2="ruis" scale="46" xChannelSelector="R" yChannelSelector="G" result="rafel" />
        <feMorphology in="rafel" operator="erode" radius="5" result="binnen" />
        <feComposite in="rafel" in2="binnen" operator="out" result="randje" />
        <feGaussianBlur in="randje" stdDeviation="2.5" />
      </filter>
      {/* Korrel van het papier: verf hoopt zich op in de putjes. */}
      <filter id="wr-korrelverf" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves={2} seed={9} result="korrel" />
        <feColorMatrix in="korrel" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.9 0.75" result="putjes" />
        <feComposite in="SourceGraphic" in2="putjes" operator="in" />
      </filter>
    </svg>
  );
}

/** Een vlek waterverf die het hele vak vult, met een eigen vaste vorm per zaadgetal. */
export function Vlek({ kleur, zaad, dekking = 0.3 }: { kleur: string; zaad: number; dekking?: number }) {
  const r = maakToeval(zaad + 17);
  const vormen = Array.from({ length: 4 }, () => ({
    cx: 110 + r() * 180,
    cy: 80 + r() * 100,
    rx: 80 + r() * 90,
    ry: 50 + r() * 50,
    o: 0.45 + r() * 0.4,
  }));
  return (
    <svg viewBox="0 0 400 260" preserveAspectRatio="none" aria-hidden="true">
      <g opacity={dekking}>
        <g filter="url(#wr-verf)">
          {vormen.map((v, i) => (
            <ellipse key={i} cx={v.cx} cy={v.cy} rx={v.rx} ry={v.ry} fill={kleur} opacity={v.o} />
          ))}
        </g>
        <g filter="url(#wr-korrelverf)">
          {vormen.slice(0, 2).map((v, i) => (
            <ellipse key={i} cx={v.cx + 10} cy={v.cy - 6} rx={v.rx * 0.7} ry={v.ry * 0.7} fill={kleur} opacity={0.8} />
          ))}
        </g>
        <g filter="url(#wr-rand)" opacity={0.9}>
          {vormen.map((v, i) => (
            <ellipse key={i} cx={v.cx} cy={v.cy} rx={v.rx} ry={v.ry} fill={kleur} />
          ))}
        </g>
      </g>
    </svg>
  );
}
