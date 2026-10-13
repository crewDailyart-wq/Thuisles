/**
 * De grote witte iconen op de vaktegels, zelf getekend.
 *
 * Elk icoon staat op een vierkant van 100 bij 100: wit, rond, met een lichte
 * schaduwkant en kleine gele glitter-streepjes rechtsboven. Details (de tekens
 * op de rekenblokjes, de regels in het boek) krijgen de kleur van de tegel,
 * via `currentColor`.
 */

const WIT = "#ffffff";
const SCHADUW = "#e4e8ff";
const GLITTER = "var(--av-glitter)";

/** Drie gele streepjes rechtsboven in het icoon. */
function Streepjes({ x = 80, y = 8 }: { x?: number; y?: number }) {
  return (
    <g stroke={GLITTER} strokeWidth="4" strokeLinecap="round" transform={`translate(${x} ${y})`}>
      <path d="M0 10 L4 0" />
      <path d="M8 15 L17 9" />
    </g>
  );
}

export function IcoonRekenen() {
  // Vier blokjes in een raster van twee bij twee: + − × =
  const blok = (x: number, y: number) => (
    <>
      <rect x={x} y={y + 3} width="36" height="36" rx="9" fill={SCHADUW} />
      <rect x={x} y={y} width="36" height="36" rx="9" fill={WIT} />
    </>
  );
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className="h-full w-full">
      <g transform="rotate(-4 50 52)">
        {blok(12, 12)}
        {blok(52, 12)}
        {blok(12, 52)}
        {blok(52, 52)}
        <g stroke="currentColor" strokeWidth="6.5" strokeLinecap="round">
          {/* + */}
          <path d="M30 21 V39 M21 30 H39" />
          {/* − */}
          <path d="M61 30 H79" />
          {/* × */}
          <path d="M23.5 63.5 L36.5 76.5 M36.5 63.5 L23.5 76.5" />
          {/* = */}
          <path d="M61 65 H79 M61 75 H79" />
        </g>
      </g>
    </svg>
  );
}

export function IcoonTaal() {
  // Twee tekstwolkjes: een grote links, een kleinere rechtsonder.
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className="h-full w-full">
      <Streepjes x={78} y={6} />
      {/* rechter wolkje, iets achter */}
      <path
        d="M62 40 C80 40 92 50 92 63 C92 72 87 79 79 83 L82 94 L69 86 C66 87 64 87 62 87 C44 87 34 76 34 63 C34 50 46 40 62 40 Z"
        fill={SCHADUW}
      />
      <path
        d="M62 37 C80 37 92 47 92 60 C92 69 87 76 79 80 L82 91 L69 83 C66 84 64 84 62 84 C44 84 34 73 34 60 C34 47 46 37 62 37 Z"
        fill={WIT}
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="2"
      />
      {/* linker wolkje, voor */}
      <path
        d="M40 13 C60 13 74 25 74 40 C74 55 60 67 40 67 C37 67 34 67 31 66 L15 76 L19 62 C11 56 6 49 6 40 C6 25 20 13 40 13 Z"
        fill={SCHADUW}
        transform="translate(0 3)"
      />
      <path
        d="M40 13 C60 13 74 25 74 40 C74 55 60 67 40 67 C37 67 34 67 31 66 L15 76 L19 62 C11 56 6 49 6 40 C6 25 20 13 40 13 Z"
        fill={WIT}
      />
    </svg>
  );
}

export function IcoonSpelling() {
  // De letters a b c, dik en rond, iets op en neer.
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className="h-full w-full">
      <Streepjes x={76} y={10} />
      <g
        fontFamily="var(--font-figtree), system-ui, sans-serif"
        fontWeight="700"
        textAnchor="middle"
      >
        <g fill={SCHADUW} transform="translate(0 3)">
          <text x="20" y="76" fontSize="54">a</text>
          <text x="50" y="68" fontSize="58">b</text>
          <text x="80" y="80" fontSize="54">c</text>
        </g>
        <g fill={WIT}>
          <text x="20" y="76" fontSize="54">a</text>
          <text x="50" y="68" fontSize="58">b</text>
          <text x="80" y="80" fontSize="54">c</text>
        </g>
      </g>
    </svg>
  );
}

export function IcoonLezen() {
  // Een open boek met regels, en lichtstraaltjes erboven.
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className="h-full w-full">
      <g stroke={GLITTER} strokeWidth="4" strokeLinecap="round">
        <path d="M50 6 V15" />
        <path d="M34 10 L38 18" />
        <path d="M66 10 L62 18" />
      </g>
      {/* dikte van het boek */}
      <path d="M8 34 L8 82 C24 78 38 80 50 88 C62 80 76 78 92 82 L92 34 Z" fill={SCHADUW} />
      {/* linker bladzijde */}
      <path d="M12 28 C26 24 40 26 50 34 L50 82 C40 75 26 73 12 77 Z" fill={WIT} />
      {/* rechter bladzijde */}
      <path d="M88 28 C74 24 60 26 50 34 L50 82 C60 75 74 73 88 77 Z" fill={WIT} />
      <path d="M50 34 L50 82" stroke="currentColor" strokeOpacity="0.35" strokeWidth="2" />
      {/* regels */}
      <g stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" opacity="0.55">
        <path d="M20 40 C27 38 34 39 42 42" />
        <path d="M20 50 C27 48 34 49 42 52" />
        <path d="M20 60 C27 58 34 59 42 62" />
        <path d="M58 42 C66 39 73 38 80 40" />
        <path d="M58 52 C66 49 73 48 80 50" />
      </g>
    </svg>
  );
}
