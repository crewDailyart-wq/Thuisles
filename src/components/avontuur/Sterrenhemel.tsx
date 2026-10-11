/**
 * De sterrenhemel achter de schermen in de avontuurstijl.
 *
 * Een losse laag over het hele vlak, achter de inhoud: kleine witte sterretjes,
 * een paar grotere twinkelsterren, een planeet rechtsboven en zachte wolkjes
 * en heuvels onderaan. De blauwe gloed zelf zit in de achtergrond van
 * `[data-stijl="avontuur"]` (app/avontuur.css).
 *
 * Alles staat in procenten, zodat de hemel op elk scherm meeschaalt. De laag
 * vangt geen tikken op.
 */

/* Vaste plekken (x%, y%, grootte px), zodat server en browser hetzelfde tekenen. */
const STIPJES: [number, number, number][] = [
  [4, 12, 3], [9, 34, 2], [14, 8, 2], [19, 58, 3], [23, 22, 2], [29, 44, 2],
  [33, 6, 3], [38, 62, 2], [44, 16, 2], [52, 4, 2], [57, 56, 3], [61, 24, 2],
  [66, 8, 2], [71, 46, 2], [76, 18, 3], [81, 62, 2], [86, 10, 2], [92, 38, 3],
  [96, 22, 2], [6, 72, 2], [12, 86, 2], [48, 88, 3], [63, 80, 2], [88, 74, 2],
  [27, 80, 2], [40, 36, 2], [95, 56, 2], [2, 48, 2], [70, 66, 2], [35, 92, 2],
];

/* Grotere sterren met vier punten. */
const STERREN: [number, number, number][] = [
  [7, 29, 26], [11, 45, 14], [58, 29, 26], [92, 37, 20], [31, 90, 14],
];

function Twinkel({ x, y, maat }: { x: number; y: number; maat: number }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className="absolute"
      style={{ left: `${x}%`, top: `${y}%`, width: maat, height: maat }}
    >
      <path
        d="M10 0 C11 7 13 9 20 10 C13 11 11 13 10 20 C9 13 7 11 0 10 C7 9 9 7 10 0 Z"
        fill="#cfe0ff"
        opacity="0.85"
      />
    </svg>
  );
}

export function Sterrenhemel() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* zachte boog linksboven, zoals een melkweg */}
      <div className="absolute -left-[20%] -top-[30%] h-[60%] w-[70%] rounded-[50%] border-[3rem] border-white/[0.04]" />

      {STIPJES.map(([x, y, m], i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white"
          style={{ left: `${x}%`, top: `${y}%`, width: m + 1, height: m + 1, opacity: 0.55 + (i % 3) * 0.15 }}
        />
      ))}
      {STERREN.map(([x, y, m], i) => (
        <Twinkel key={i} x={x} y={y} maat={m} />
      ))}

      {/* planeet met ring, rechtsboven onder het begroetingsvakje */}
      <svg viewBox="0 0 140 100" className="absolute right-[3%] top-[21%] w-[clamp(4.5rem,9vw,8.5rem)] opacity-90">
        <defs>
          <radialGradient id="av-planeet" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#8fa2ff" />
            <stop offset="100%" stopColor="#3f4fd8" />
          </radialGradient>
        </defs>
        <ellipse cx="70" cy="58" rx="64" ry="14" fill="none" stroke="#6f83ff" strokeWidth="5" opacity="0.6" transform="rotate(-14 70 58)" />
        <circle cx="76" cy="46" r="34" fill="url(#av-planeet)" />
        <path d="M8 74 C40 64 100 46 134 40" fill="none" stroke="#7d90ff" strokeWidth="5" strokeLinecap="round" opacity="0.85" />
      </svg>

      {/* heuvels en wolkjes onderaan */}
      <svg
        viewBox="0 0 1600 220"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 h-[clamp(5rem,20vh,12rem)] w-full"
      >
        <path d="M0 150 C 200 90 380 120 560 150 C 760 180 900 110 1100 120 C 1300 130 1450 80 1600 100 L1600 220 L0 220 Z" fill="#2a3fd2" opacity="0.7" />
        <g fill="#5068f2" opacity="0.55">
          <circle cx="120" cy="190" r="70" />
          <circle cx="220" cy="175" r="58" />
          <circle cx="300" cy="200" r="50" />
          <circle cx="640" cy="200" r="60" />
          <circle cx="730" cy="180" r="70" />
          <circle cx="830" cy="205" r="55" />
          <circle cx="1350" cy="185" r="66" />
          <circle cx="1450" cy="165" r="78" />
          <circle cx="1560" cy="190" r="64" />
        </g>
        <path d="M0 190 C 300 160 520 200 800 196 C 1080 192 1300 160 1600 180 L1600 220 L0 220 Z" fill="#1d2db4" />
      </svg>
    </div>
  );
}
