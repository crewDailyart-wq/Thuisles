/**
 * Geknipt papier voor de reis door de drie werelden.
 *
 * Alles is uit vlakke stukjes papier geknipt: een paar matte kleuren, randjes
 * die net niet recht zijn, en een korte papierschaduw (in de CSS, op .wr-p).
 * Elk stuk heeft een vast zaadgetal, zodat het er bij elk bezoek hetzelfde
 * uitziet.
 */

import { maakToeval, vloeiend } from "@/components/zappie/bouwtekening/pen";

type Punt = [number, number];

/** Een veelhoek met randjes die net niet recht zijn, zoals met een schaar geknipt. */
function geknipt(punten: Punt[], zaad: number, speling = 0.8) {
  const r = maakToeval(zaad);
  return (
    "M" +
    punten.map(([x, y]) => `${(x + (r() - 0.5) * speling * 2).toFixed(1)} ${(y + (r() - 0.5) * speling * 2).toFixed(1)}`).join(" L") +
    " Z"
  );
}

/** Een golvende rand over de hele breedte, voor heuvels, golven en zand. */
function rand(breedte: number, hoogte: number, basis: number, toppen: number, golf: number, zaad: number) {
  const r = maakToeval(zaad);
  const fase = r() * Math.PI * 2;
  const stappen = Math.max(24, Math.round(breedte / 24));
  const punten: Punt[] = [];
  for (let i = 0; i <= stappen; i++) {
    const t = i / stappen;
    punten.push([t * breedte, basis - Math.sin(t * Math.PI * toppen + fase) * golf - (r() - 0.5) * 3]);
  }
  return `${vloeiend(punten)} L${breedte} ${hoogte} L0 ${hoogte} Z`;
}

/* ------------------------------------------------------------------------- */
/* Universum                                                                  */
/* ------------------------------------------------------------------------- */

export function Maan() {
  return (
    <svg viewBox="0 0 100 100" className="wr-p" aria-hidden="true">
      <path d="M62 8 A44 44 0 1 0 92 66 A36 36 0 1 1 62 8 Z" fill="#f4e7c2" />
      <circle cx="38" cy="60" r="5" fill="#e6d3a1" />
      <circle cx="30" cy="38" r="3.4" fill="#e6d3a1" />
      <circle cx="52" cy="80" r="3" fill="#e6d3a1" />
    </svg>
  );
}

export function Planeet() {
  return (
    <svg viewBox="0 0 160 112" className="wr-p" aria-hidden="true">
      <ellipse cx="80" cy="58" rx="76" ry="16" fill="none" stroke="#f2c94c" strokeWidth="7" transform="rotate(-12 80 58)" />
      <circle cx="80" cy="56" r="38" fill="#8a72d8" />
      <path d="M46 46 Q80 36 114 46" stroke="#a892ea" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M44 64 Q80 74 116 62" stroke="#715bc2" strokeWidth="6" fill="none" strokeLinecap="round" />
      {/* De voorkant van de ring, over de planeet heen. */}
      <path d="M4 58 A76 16 0 0 0 156 58" fill="none" stroke="#f2c94c" strokeWidth="7" transform="rotate(-12 80 58)" />
    </svg>
  );
}

/** Een ster met vijf punten, uitgeknipt uit geel papier. */
export function Ster({ zaad }: { zaad: number }) {
  const punten: Punt[] = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const s = i % 2 === 0 ? 46 : 20;
    punten.push([50 + Math.cos(a) * s, 52 + Math.sin(a) * s]);
  }
  return (
    <svg viewBox="0 0 100 100" className="wr-p" aria-hidden="true">
      <path d={geknipt(punten, zaad + 3, 1.2)} fill="#f2c94c" />
    </svg>
  );
}

/* ------------------------------------------------------------------------- */
/* Aarde                                                                      */
/* ------------------------------------------------------------------------- */

/** Een papieren wolk: twee lagen, wit en lichtblauw. */
export function Wolk({ zaad }: { zaad: number }) {
  const r = maakToeval(zaad + 30);
  const bollen = Array.from({ length: 5 }, (_, i) => ({ cx: 50 + i * 50 + r() * 14, cy: 70 - Math.sin((i / 4) * Math.PI) * 26 - r() * 8, r: 28 + Math.sin((i / 4) * Math.PI) * 18 }));
  return (
    <svg viewBox="0 0 300 126" className="wr-p" aria-hidden="true">
      <g fill="#d8ecfb" transform="translate(10 10)">
        {bollen.map((b, i) => (
          <circle key={i} cx={b.cx} cy={b.cy} r={b.r} />
        ))}
        <rect x="22" y="70" width="260" height="34" rx="17" />
      </g>
      <g fill="#ffffff">
        {bollen.map((b, i) => (
          <circle key={i} cx={b.cx} cy={b.cy} r={b.r} />
        ))}
        <rect x="22" y="70" width="260" height="34" rx="17" />
      </g>
    </svg>
  );
}

/** Een vogeltje van gevouwen papier. */
export function Vogel() {
  return (
    <svg viewBox="0 0 80 50" className="wr-p" aria-hidden="true">
      <path className="wr-vleugel-l" d="M40 30 L6 10 L28 34 Z" fill="#ffffff" />
      <path className="wr-vleugel-r" d="M40 30 L74 6 L52 34 Z" fill="#e7f1fb" />
      <path d="M28 34 L40 30 L52 34 L40 42 Z" fill="#cfe2f5" />
    </svg>
  );
}

/** Drie lagen heuvels met boompjes, over de hele breedte. */
export function Heuvels({ breedte }: { breedte: number }) {
  const b = Math.max(320, breedte);
  const bomen = Array.from({ length: Math.round(b / 160) }, (_, i) => 60 + i * 160 + ((i * 37) % 50));
  return (
    <svg viewBox={`0 0 ${b} 240`} preserveAspectRatio="none" className="wr-p" aria-hidden="true">
      <path d={rand(b, 240, 110, 3, 38, 1)} fill="#4f9a9a" />
      <path d={rand(b, 240, 150, 5, 26, 2)} fill="#3f8d7e" />
      {bomen.map((x, i) => (
        <g key={x} transform={`translate(${x} ${146 - (i % 3) * 8})`}>
          <rect x="-2" y="0" width="4" height="16" fill="#2c5f55" />
          <path d={geknipt([[-14, 4], [0, -34], [14, 4]], 40 + i)} fill={i % 2 ? "#2f7a63" : "#367f6c"} />
        </g>
      ))}
      <path d={rand(b, 240, 196, 4, 16, 3)} fill="#5aa97f" />
      <path d={rand(b, 240, 226, 2, 6, 4)} fill="#e6cf98" />
    </svg>
  );
}

/** Een molentje: de wieken draaien een kwartslag als je erbij komt. */
export function Molen() {
  return (
    <svg viewBox="0 0 74 110" className="wr-p" aria-hidden="true">
      <path d={geknipt([[26, 110], [30, 46], [44, 46], [48, 110]], 60)} fill="#f4ecd6" />
      <path d={geknipt([[24, 48], [37, 32], [50, 48]], 61)} fill="#2c5f55" />
      <rect x="32" y="92" width="10" height="18" rx="5" fill="#2c5f55" />
      <g className="wr-wieken">
        {[0, 90, 180, 270].map((h) => (
          <path key={h} d="M35 40 L39 40 L41 6 L33 6 Z" fill="#e5795f" transform={`rotate(${h} 37 40)`} />
        ))}
        <circle cx="37" cy="40" r="4" fill="#2c5f55" />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------------- */
/* Oceaan                                                                     */
/* ------------------------------------------------------------------------- */

/**
 * De golven aan de oppervlakte: twee lagen papier. De voorste laag loopt
 * onderaan uit in het water, zodat er geen harde rand onder de golven komt.
 */
export function Golven({ breedte }: { breedte: number }) {
  const b = Math.max(320, breedte);
  const golf = (y: number, hoogte: number, n: number, onder: number) => {
    let d = `M0 ${y}`;
    const w = b / n;
    for (let i = 0; i < n; i++) d += ` q${w / 2} ${-hoogte} ${w} 0`;
    return `${d} L${b} ${onder} L0 ${onder} Z`;
  };
  return (
    <svg viewBox={`0 0 ${b} 120`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="wr-golf-uitloop" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0.3" stopColor="#2f7fc4" />
          <stop offset="1" stopColor="#2f7fc4" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={golf(22, 16, Math.round(b / 90), 60)} fill="#4fa3d9" className="wr-golf-achter" />
      <path d={golf(36, 14, Math.round(b / 70), 120)} fill="url(#wr-golf-uitloop)" />
    </svg>
  );
}

/** Een papieren bootje, gevouwen. */
export function Boot() {
  return (
    <svg viewBox="0 0 86 64" className="wr-p" aria-hidden="true">
      <path d="M44 4 L44 44 L70 44 Z" fill="#ffffff" />
      <path d="M42 12 L42 44 L22 44 Z" fill="#e7f1fb" />
      <path d="M43 2 L43 46" stroke="#5a4b3a" strokeWidth="2" />
      <path d={geknipt([[6, 46], [80, 46], [66, 62], [18, 62]], 70, 0.5)} fill="#e5795f" />
      <path d="M12 46 L74 46 L70 51 L16 51 Z" fill="#cf6550" />
    </svg>
  );
}

/** Lichtstralen die schuin door het water vallen, als zachte waterverfbanen. */
export function Lichtstralen() {
  return (
    <svg viewBox="0 0 400 400" preserveAspectRatio="none" aria-hidden="true">
      <g filter="url(#wr-verf)" fill="#bfe8ff">
        <path d="M70 0 L110 0 L40 400 L-10 400 Z" opacity="0.1" />
        <path d="M170 0 L190 0 L150 400 L110 400 Z" opacity="0.08" />
        <path d="M260 0 L300 0 L290 400 L230 400 Z" opacity="0.09" />
      </g>
    </svg>
  );
}

const VISKLEUREN: [string, string][] = [
  ["#f2a65a", "#e5795f"],
  ["#f2c94c", "#e0a93a"],
  ["#7fd1c9", "#4fb0a8"],
  ["#e58aa6", "#cf6a8a"],
  ["#a892ea", "#8a72d8"],
];

/** Een visje van twee lagen papier. */
export function Vis({ zaad, kleur, naarLinks }: { zaad: number; kleur: number; naarLinks: boolean }) {
  const [licht, donker] = VISKLEUREN[kleur % VISKLEUREN.length];
  return (
    <svg viewBox="0 0 100 60" className="wr-p" aria-hidden="true" style={naarLinks ? { transform: "scaleX(-1)" } : undefined}>
      <path d={geknipt([[18, 30], [2, 12], [6, 30], [2, 48]], 80 + zaad, 0.6)} fill={donker} />
      <path d="M16 30 C30 8 70 6 96 30 C70 54 30 52 16 30 Z" fill={licht} />
      <path d="M44 14 C52 22 52 38 44 46" stroke={donker} strokeWidth="4" fill="none" strokeLinecap="round" />
      <circle cx="78" cy="26" r="4.5" fill="#1d2a44" />
      <circle cx="79.5" cy="24.6" r="1.4" fill="#ffffff" />
    </svg>
  );
}

export function Bel() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="10" cy="10" r="8" fill="none" stroke="rgb(220 244 255 / 0.65)" strokeWidth="1.6" />
      <circle cx="7" cy="7" r="2" fill="rgb(255 255 255 / 0.55)" />
    </svg>
  );
}

/** De zeebodem: zand met een golvende rand en wat steentjes. */
export function Zandbodem({ breedte }: { breedte: number }) {
  const b = Math.max(320, breedte);
  const r = maakToeval(91);
  const steentjes = Array.from({ length: Math.round(b / 70) }, () => ({ x: r() * b, y: 60 + r() * 40, s: 3 + r() * 5 }));
  return (
    <svg viewBox={`0 0 ${b} 110`} preserveAspectRatio="none" className="wr-p" aria-hidden="true">
      <path d={rand(b, 110, 34, 3, 10, 7)} fill="#c9a96c" />
      <path d={rand(b, 110, 50, 4, 8, 8)} fill="#ddc08a" />
      {steentjes.map((s, i) => (
        <ellipse key={i} cx={s.x} cy={s.y} rx={s.s} ry={s.s * 0.7} fill="#b8975c" />
      ))}
    </svg>
  );
}

/** Zeewier: een paar slingerende linten van papier. */
export function Zeewier({ zaad }: { zaad: number }) {
  const r = maakToeval(zaad + 100);
  const linten = [0, 1, 2].map((i) => {
    const x = 18 + i * 22 + r() * 6;
    const punten: Punt[] = Array.from({ length: 7 }, (_, k) => [x + Math.sin(k * 0.9 + i + r()) * 8, 250 - k * (36 - i * 6)]);
    return punten;
  });
  return (
    <svg viewBox="0 0 80 250" preserveAspectRatio="xMidYMax meet" className="wr-p" aria-hidden="true">
      {linten.map((p, i) => (
        <path key={i} d={vloeiend(p)} stroke={["#2f8f6a", "#3fa37a", "#277a5c"][i]} strokeWidth={10 - i * 2} fill="none" strokeLinecap="round" />
      ))}
    </svg>
  );
}

export function Schelp() {
  return (
    <svg viewBox="0 0 34 26" className="wr-p" aria-hidden="true">
      <path d="M2 24 Q17 -6 32 24 Z" fill="#f4d7c8" />
      {[8, 13, 17, 21, 26].map((x) => (
        <path key={x} d={`M17 22 L${x} 6`} stroke="#e0b6a2" strokeWidth="1.6" />
      ))}
    </svg>
  );
}

export function Zeester() {
  const punten: Punt[] = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const s = i % 2 === 0 ? 19 : 8;
    punten.push([20 + Math.cos(a) * s, 21 + Math.sin(a) * s]);
  }
  return (
    <svg viewBox="0 0 40 40" className="wr-p" aria-hidden="true">
      <path d={vloeiend(punten, true)} fill="#e5795f" />
      <circle cx="20" cy="21" r="2" fill="#f2a65a" />
    </svg>
  );
}
