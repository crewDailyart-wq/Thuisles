/**
 * De grote witte iconen op de domeintegels van het rekenscherm, zelf
 * getekend in dezelfde stijl als de vaktegels (zie VakIconen.tsx): wit, rond,
 * met een lichte schaduwkant. Details krijgen de kleur van de tegelrand, via
 * `currentColor`.
 *
 * Elk domein heeft een eigen icoon, op de slug. Een domein dat hier (nog)
 * niet staat, krijgt de ster.
 */

const WIT = "#ffffff";
const SCHADUW = "#e4e8ff";
const GLITTER = "var(--av-glitter)";
const LETTERS = "var(--font-fredoka), var(--font-lexend), sans-serif";

function Svg({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className="h-full w-full">
      {children}
    </svg>
  );
}

/** Een vorm twee keer: eerst de schaduwkant iets lager, dan wit erover. */
function Dik({ d, dy = 3.5 }: { d: string; dy?: number }) {
  return (
    <>
      <path d={d} fill={SCHADUW} transform={`translate(0 ${dy})`} />
      <path d={d} fill={WIT} />
    </>
  );
}

function Tekst({ children, x, y, grootte }: { children: string; x: number; y: number; grootte: number }) {
  return (
    <g fontFamily={LETTERS} fontWeight="700" textAnchor="middle" fontSize={grootte}>
      <text x={x} y={y + 3.5} fill={SCHADUW}>{children}</text>
      <text x={x} y={y} fill={WIT}>{children}</text>
    </g>
  );
}

function Streepjes({ x = 80, y = 6 }: { x?: number; y?: number }) {
  return (
    <g stroke={GLITTER} strokeWidth="4" strokeLinecap="round" transform={`translate(${x} ${y})`}>
      <path d="M0 10 L4 0" />
      <path d="M8 15 L17 9" />
    </g>
  );
}

/** Getallen: 1 2 3, op en neer. */
function Getallen() {
  return (
    <Svg>
      <Streepjes x={78} y={8} />
      <Tekst x={22} y={74} grootte={52}>1</Tekst>
      <Tekst x={51} y={66} grootte={56}>2</Tekst>
      <Tekst x={80} y={78} grootte={52}>3</Tekst>
    </Svg>
  );
}

/** Splitsen: een splitshuisje met een dak en twee vakjes. */
function Splitsen() {
  const huis = "M50 8 L90 38 L90 86 Q90 92 84 92 L16 92 Q10 92 10 86 L10 38 Z";
  return (
    <Svg>
      <Dik d={huis} />
      <g stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.55">
        <path d="M14 46 H86" />
        <path d="M50 46 V88" />
      </g>
      <g fontFamily={LETTERS} fontWeight="700" textAnchor="middle" fill="currentColor">
        <text x="50" y="40" fontSize="22">8</text>
        <text x="31" y="78" fontSize="24">5</text>
        <text x="69" y="78" fontSize="24">3</text>
      </g>
    </Svg>
  );
}

/** Optellen: een dik plusteken met twee bolletjes die erbij komen. */
function Optellen() {
  const plus =
    "M40 14 Q40 8 46 8 L54 8 Q60 8 60 14 L60 40 L86 40 Q92 40 92 46 L92 54 Q92 60 86 60 L60 60 L60 86 Q60 92 54 92 L46 92 Q40 92 40 86 L40 60 L14 60 Q8 60 8 54 L8 46 Q8 40 14 40 L40 40 Z";
  return (
    <Svg>
      <Dik d={plus} />
      <Streepjes x={74} y={4} />
    </Svg>
  );
}

/** Aftrekken: een dik minteken, en drie bolletjes waarvan er één weg is. */
function Aftrekken() {
  const min = "M14 22 L86 22 Q92 22 92 28 L92 36 Q92 42 86 42 L14 42 Q8 42 8 36 L8 28 Q8 22 14 22 Z";
  return (
    <Svg>
      <Dik d={min} />
      <circle cx="22" cy="74" r="13" fill={SCHADUW} transform="translate(0 3)" />
      <circle cx="22" cy="74" r="13" fill={WIT} />
      <circle cx="52" cy="74" r="13" fill={SCHADUW} transform="translate(0 3)" />
      <circle cx="52" cy="74" r="13" fill={WIT} />
      <circle cx="82" cy="74" r="11.5" fill="none" stroke={WIT} strokeWidth="3" strokeDasharray="4 4" opacity="0.8" />
    </Svg>
  );
}

/** Tafels: een raster van negen blokjes met een keerteken in het midden. */
function Tafels() {
  const blokken = [];
  for (let r = 0; r < 3; r++)
    for (let k = 0; k < 3; k++) {
      const x = 10 + k * 28;
      const y = 10 + r * 28;
      blokken.push(
        <g key={`${r}${k}`}>
          <rect x={x} y={y + 3} width="24" height="24" rx="6" fill={SCHADUW} />
          <rect x={x} y={y} width="24" height="24" rx="6" fill={WIT} />
        </g>,
      );
    }
  return (
    <Svg>
      {blokken}
      <path d="M44 44 L56 56 M56 44 L44 56" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
    </Svg>
  );
}

/** Delen: het deelteken, met een taart in vier stukken. */
function Delen() {
  return (
    <Svg>
      <circle cx="50" cy="53" r="40" fill={SCHADUW} />
      <circle cx="50" cy="50" r="40" fill={WIT} />
      <g stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.5">
        <path d="M50 12 V88 M12 50 H88" />
      </g>
      <Streepjes x={78} y={2} />
    </Svg>
  );
}

/** Verhoudingen: een taartje waar een punt uit is. */
function Verhoudingen() {
  return (
    <Svg>
      <path d="M46 54 L46 14 A40 40 0 1 0 86 54 Z" fill={SCHADUW} transform="translate(0 3.5)" />
      <path d="M46 54 L46 14 A40 40 0 1 0 86 54 Z" fill={WIT} />
      <path d="M56 44 L56 6 A38 38 0 0 1 94 44 Z" fill={WIT} opacity="0.8" />
      <path d="M46 54 L46 14" stroke="currentColor" strokeWidth="3" opacity="0.4" />
    </Svg>
  );
}

/** Meten: een liniaal met streepjes. */
function Meten() {
  const lat = "M8 58 L70 8 Q74 5 77 9 L92 28 Q95 32 91 35 L29 85 Q25 88 22 84 L7 65 Q4 61 8 58 Z";
  return (
    <Svg>
      <Dik d={lat} />
      <g stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" opacity="0.6">
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const x = 20 + i * 10.5;
          const y = 58 - i * 8.5;
          const l = i % 2 === 0 ? 12 : 7;
          return <path key={i} d={`M${x} ${y} l${l * 0.6} ${l * 0.78}`} />;
        })}
      </g>
    </Svg>
  );
}

/** Tijd: een wijzerklok. */
function Tijd() {
  return (
    <Svg>
      <circle cx="50" cy="53" r="42" fill={SCHADUW} />
      <circle cx="50" cy="50" r="42" fill={WIT} />
      <g stroke="currentColor" strokeLinecap="round">
        {[0, 1, 2, 3].map((i) => {
          const h = (i * Math.PI) / 2;
          return (
            <path
              key={i}
              d={`M${50 + Math.sin(h) * 31} ${50 - Math.cos(h) * 31} L${50 + Math.sin(h) * 36} ${50 - Math.cos(h) * 36}`}
              strokeWidth="4.5"
              opacity="0.55"
            />
          );
        })}
        <path d="M50 50 L50 24" strokeWidth="6" />
        <path d="M50 50 L68 60" strokeWidth="6" />
      </g>
      <circle cx="50" cy="50" r="5" fill="currentColor" />
    </Svg>
  );
}

/** Geld: twee munten op elkaar. */
function Geld() {
  return (
    <Svg>
      <circle cx="36" cy="62" r="28" fill={SCHADUW} />
      <circle cx="36" cy="58" r="28" fill={WIT} opacity="0.85" />
      <circle cx="60" cy="47" r="32" fill={SCHADUW} />
      <circle cx="60" cy="43" r="32" fill={WIT} />
      <circle cx="60" cy="43" r="24" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.35" />
      <text x="60" y="56" textAnchor="middle" fontFamily={LETTERS} fontWeight="700" fontSize="36" fill="currentColor">€</text>
    </Svg>
  );
}

/** Meetkunde: een driehoek, een vierkant en een rondje. */
function Meetkunde() {
  return (
    <Svg>
      <Dik d="M30 8 L54 48 Q56 52 52 52 L8 52 Q4 52 6 48 Z" />
      <rect x="52" y="54" width="38" height="38" rx="8" fill={SCHADUW} />
      <rect x="52" y="50" width="38" height="38" rx="8" fill={WIT} />
      <circle cx="28" cy="75" r="18" fill={SCHADUW} />
      <circle cx="28" cy="72" r="18" fill={WIT} />
      <Streepjes x={74} y={10} />
    </Svg>
  );
}

/** Tabellen & grafieken: een staafgrafiek. */
function Grafieken() {
  return (
    <Svg>
      {[
        [12, 52],
        [38, 28],
        [64, 10],
      ].map(([x, y]) => (
        <g key={x}>
          <rect x={x} y={y + 3.5} width="22" height={86 - y} rx="6" fill={SCHADUW} />
          <rect x={x} y={y} width="22" height={86 - y} rx="6" fill={WIT} />
        </g>
      ))}
      <path d="M8 90 H92" stroke={WIT} strokeWidth="5" strokeLinecap="round" />
    </Svg>
  );
}

/** Verhaaltjessommen: een blaadje met regels en een plus en min erop. */
function Verhaaltjes() {
  const blad = "M18 8 L70 8 L86 24 L86 86 Q86 92 80 92 L18 92 Q12 92 12 86 L12 14 Q12 8 18 8 Z";
  return (
    <Svg>
      <Dik d={blad} />
      <path d="M70 8 L70 24 L86 24 Z" fill={SCHADUW} />
      <g stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.5">
        <path d="M24 30 H58" />
        <path d="M24 44 H72" />
        <path d="M24 58 H66" />
      </g>
      <g stroke="currentColor" strokeWidth="5" strokeLinecap="round">
        <path d="M30 70 V84 M23 77 H37" />
        <path d="M50 77 H64" />
      </g>
    </Svg>
  );
}

/** Voor een domein zonder eigen icoon. */
function Ster() {
  return (
    <Svg>
      <Dik d="M50 8 L61 36 L91 38 L68 57 L76 87 L50 70 L24 87 L32 57 L9 38 L39 36 Z" />
    </Svg>
  );
}

const ICONEN: Record<string, () => React.ReactElement> = {
  getallen: Getallen,
  splitsen: Splitsen,
  optellen: Optellen,
  aftrekken: Aftrekken,
  tafels: Tafels,
  delen: Delen,
  verhoudingen: Verhoudingen,
  meten: Meten,
  tijd: Tijd,
  geld: Geld,
  meetkunde: Meetkunde,
  "tabellen-grafieken": Grafieken,
  verhaaltjessommen: Verhaaltjes,
};

export function DomeinIcoon({ slug }: { slug: string }) {
  const Icoon = ICONEN[slug] ?? Ster;
  return <Icoon />;
}
