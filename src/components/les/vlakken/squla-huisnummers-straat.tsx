"use client";

/**
 * Een straat in de avond met huizen en huisnummers (les "Huisnummers: wat komt
 * erna?", 30 oktober 2026). Eigen tekening, plat en vriendelijk, zonder gloed:
 * goed te zien op de donkerblauwe achtergrond.
 *
 * Alle huisnummers staan in één kleur: wit op een donker bordje. In de zinnen
 * van Bliepo staan ze daarom als {n:wit}.
 *
 * Wat het draaiboek zet:
 * - `huizen`: de rij van links naar rechts. Een getal = huis met dat nummer,
 *   "?" = huis met een vraagteken op het bordje, `null` = lege plek (geen huis).
 * - `licht`: welk huis oplicht (samen langs de straat lopen).
 * - `goed`: welk huis even opspringt (net goed).
 * - `losse`: huizen onder de straat om naar de lege plek te slepen (of aan te
 *   tikken). Meldt `{ soort: "gelegd", n }`; het draaiboek zet het huis neer.
 * - `fout`: een los huis dat even schudt en terugschuift ({ n, keer }).
 * - `hand`: een handje doet één keer voor hoe je sleept.
 */

import { useRef, useState, type CSSProperties, type PointerEvent as RPointerEvent } from "react";
import type { Vlakbasis } from "../soort";
import s from "./squla-huisnummers.module.css";

export type Huisplek = number | "?" | null;

export type StraatProps = {
  huizen: Huisplek[];
  licht?: number | null;
  goed?: number | null;
  losse?: number[];
  actief?: boolean;
  fout?: { n: number; keer: number } | null;
  hand?: boolean;
};

const B = 980;
const H = 720;
const W = 136; // breedte van een huis
const TUSSEN = 10;
const GROND = 410; // onderkant van de huizen in de straat
const LOSGROND = 690; // onderkant van de losse huizen
const LETTER = "var(--font-les), 'Work Sans', system-ui, sans-serif";

/* Warme avondkleuren: muur en dak. */
const KLEUREN: [string, string][] = [
  ["#e07a5f", "#9c4a3a"],
  ["#f2c14e", "#b07f22"],
  ["#81b29a", "#4f7d67"],
  ["#7fa7d9", "#46679a"],
  ["#e5989b", "#a85d63"],
];
const kleurVan = (n: number) => KLEUREN[((n % 5) + 5) % 5];
const RAAM = "#ffd36b";
const BORDJE = "#1d2540";
const GEEL = "#ffd36b";

const rijX = (aantal: number) => {
  const breed = aantal * W + (aantal - 1) * TUSSEN;
  const x0 = (B - breed) / 2;
  return (i: number) => x0 + i * (W + TUSSEN);
};

/*
 * De huizen zijn platte 2D-plaatjes van Kenney (CC0), 's nachts met een warme
 * gloed (keuze eigenaar, 30 oktober 2026): zie public/squla/huizen-2d/BRON.md.
 * Het bordje met het huisnummer tekenen we er zelf overheen. Het oude getekende
 * huis staat hieronder nog als `HuisOud`.
 */
const HUISPLAATJES: { naam: string; b: number; h: number }[] = [
  { naam: "house1", b: 415, h: 448 },
  { naam: "houseAlt2", b: 482, h: 434 },
  { naam: "houseAlt1", b: 335, h: 448 },
  { naam: "house2", b: 562, h: 434 },
];
const GLOED = 80; /* extra ruimte rondom in het plaatje, voor de gloed */
const plaatjeVan = (n: number | "?") => HUISPLAATJES[n === "?" ? 0 : ((n % 4) + 4) % 4];

/** Eén huis, met de linkeronderhoek op (x, y onder). */
function Huis({ x, grond, n, licht }: { x: number; grond: number; n: number | "?"; licht?: boolean; kleur?: [string, string] }) {
  const p = plaatjeVan(n);
  const schaal = W / p.b;
  const hoog = p.h * schaal;
  const bordY = grond - hoog * 0.52;
  return (
    <g>
      {licht && <ellipse cx={x + W / 2} cy={grond + 8} rx={W / 2 + 14} ry={12} fill={GEEL} opacity={0.55} />}
      <image
        href={`/squla/huizen-2d/${p.naam}.png`}
        x={x - GLOED * schaal}
        y={grond - hoog - GLOED * schaal}
        width={(p.b + 2 * GLOED) * schaal}
        height={(p.h + 2 * GLOED) * schaal}
        style={n === "?" ? { filter: "grayscale(0.6) brightness(0.85)" } : undefined}
      />
      {/* het bordje met het huisnummer */}
      <rect
        x={x + W / 2 - 38}
        y={bordY - 23}
        width={76}
        height={46}
        rx={10}
        fill={BORDJE}
        stroke={licht ? GEEL : "#ffffff"}
        strokeWidth={licht ? 5 : 2.5}
      />
      <text x={x + W / 2} y={bordY + 12} textAnchor="middle" fontSize={34} fontWeight={800} fill="#ffffff" style={{ fontFamily: LETTER }}>
        {n}
      </text>
    </g>
  );
}

/** Eén huis, met de linkeronderhoek op (x, y onder). */
export function HuisOud({ x, grond, n, licht, kleur }: { x: number; grond: number; n: number | "?"; licht?: boolean; kleur: [string, string] }) {
  const top = grond - 150;
  return (
    <g>
      {licht && <ellipse cx={x + W / 2} cy={grond + 8} rx={W / 2 + 14} ry={12} fill={GEEL} opacity={0.55} />}
      <polygon points={`${x - 8},${top + 4} ${x + W / 2},${top - 66} ${x + W + 8},${top + 4}`} fill={kleur[1]} />
      <rect x={x + W - 34} y={top - 52} width={16} height={34} fill={kleur[1]} />
      <rect x={x} y={top} width={W} height={150} rx={4} fill={kleur[0]} />
      {/* het bordje met het huisnummer */}
      <rect
        x={x + 18}
        y={top + 12}
        width={W - 36}
        height={46}
        rx={9}
        fill={BORDJE}
        stroke={licht ? GEEL : "#ffffff"}
        strokeWidth={licht ? 5 : 2.5}
      />
      <text
        x={x + W / 2}
        y={top + 47}
        textAnchor="middle"
        fontSize={34}
        fontWeight={800}
        fill="#ffffff"
        style={{ fontFamily: LETTER }}
      >
        {n}
      </text>
      {/* raam met licht aan, en de deur */}
      <rect x={x + 12} y={top + 74} width={34} height={34} rx={3} fill={RAAM} />
      <line x1={x + 29} y1={top + 74} x2={x + 29} y2={top + 108} stroke={kleur[1]} strokeWidth={3} />
      <line x1={x + 12} y1={top + 91} x2={x + 46} y2={top + 91} stroke={kleur[1]} strokeWidth={3} />
      <path d={`M${x + 62} ${grond} v-58 a18 18 0 0 1 36 0 v58 z`} fill={kleur[1]} />
      <circle cx={x + 90} cy={grond - 30} r={3} fill={RAAM} />
    </g>
  );
}

/** Een lege plek in de straat: de omtrek van een huis in stippellijn. */
function LegePlek({ x, grond, aan }: { x: number; grond: number; aan: boolean }) {
  const top = grond - 150;
  const d = `M${x} ${grond} V${top + 4} L${x + W / 2} ${top - 66} L${x + W} ${top + 4} V${grond} Z`;
  return (
    <path
      d={d}
      fill={aan ? "rgba(255,211,107,0.22)" : "rgba(255,255,255,0.06)"}
      stroke={aan ? GEEL : "rgba(255,255,255,0.7)"}
      strokeWidth={aan ? 5 : 3}
      strokeDasharray="12 9"
      strokeLinejoin="round"
    />
  );
}

/** Het handje dat voordoet hoe je sleept. */
function Handje() {
  return (
    <g>
      <path
        d="M0 0 c0-8 10-8 10 0 v20 c0-7 10-7 10 0 v4 c0-7 10-7 10 0 v4 c0-7 10-7 10 0 v20 c0 16-10 26-24 26 h-6 c-12 0-18-8-22-16 l-12-22 c-4-7 4-12 9-6 l5 7 z"
        fill="#ffffff"
        stroke="#1b2233"
        strokeWidth={3}
        strokeLinejoin="round"
      />
    </g>
  );
}

type Sleep = { n: number; x: number; y: number; vanX: number; vanY: number; bewogen: boolean; id: number };

export function SqulaStraat({ huizen, licht = null, goed = null, losse = [], actief = false, fout = null, hand = false, meld }: StraatProps & Vlakbasis) {
  const svg = useRef<SVGSVGElement>(null);
  const [sleep, zetSleep] = useState<Sleep | null>(null);

  const x = rijX(huizen.length);
  const lx = rijX(losse.length);
  const legeIndex = huizen.indexOf(null);
  const doelX = legeIndex >= 0 ? x(legeIndex) + W / 2 : null;
  const doelY = GROND - 100;

  const punt = (e: { clientX: number; clientY: number }) => {
    const r = svg.current?.getBoundingClientRect();
    if (!r || !r.width) return { x: 0, y: 0 };
    return { x: ((e.clientX - r.left) * B) / r.width, y: ((e.clientY - r.top) * H) / r.height };
  };
  /* Het hele doelvak telt: het midden van het gesleepte huis binnen de lege plek. */
  const boven = (sl: Sleep | null) =>
    !!sl && doelX !== null && Math.abs(sl.x - doelX) < W / 2 + 30 && Math.abs(sl.y - doelY) < 130;

  const pak = (e: RPointerEvent<SVGGElement>, n: number, i: number) => {
    if (!actief || legeIndex < 0) return;
    e.preventDefault();
    svg.current?.setPointerCapture(e.pointerId);
    const p = punt(e);
    const midX = lx(i) + W / 2;
    const midY = LOSGROND - 100;
    zetSleep({ n, x: midX, y: midY, vanX: p.x - midX, vanY: p.y - midY, bewogen: false, id: e.pointerId });
  };
  const beweeg = (e: RPointerEvent<SVGSVGElement>) => {
    if (!sleep || e.pointerId !== sleep.id) return;
    const p = punt(e);
    const nx = p.x - sleep.vanX;
    const ny = p.y - sleep.vanY;
    const bewogen = sleep.bewogen || Math.hypot(nx - sleep.x, ny - sleep.y) > 6;
    zetSleep({ ...sleep, x: nx, y: ny, bewogen });
  };
  const los = (e: RPointerEvent<SVGSVGElement>) => {
    if (!sleep || e.pointerId !== sleep.id) return;
    const n = sleep.n;
    /* Tikken werkt ook; loslaten naast de plek brengt het huis terug. */
    const raak = !sleep.bewogen || boven(sleep);
    zetSleep(null);
    if (raak && actief) meld({ soort: "gelegd", n });
  };

  const handStart = losse.length ? { x: lx(0) + W / 2, y: LOSGROND - 80 } : null;

  return (
    <svg
      ref={svg}
      width={B}
      height={H}
      viewBox={`0 0 ${B} ${H}`}
      style={{ position: "absolute", left: 0, top: 0, overflow: "visible", touchAction: "none", userSelect: "none" }}
      onPointerMove={beweeg}
      onPointerUp={los}
      onPointerCancel={() => zetSleep(null)}
      aria-label="Een straat met huizen en huisnummers"
    >
      {/* maan en een paar sterren */}
      <circle cx={880} cy={78} r={34} fill="#f5e6b8" />
      <circle cx={868} cy={70} r={6} fill="#e6d29c" />
      <circle cx={890} cy={92} r={4} fill="#e6d29c" />
      {[
        [90, 60],
        [200, 110],
        [420, 50],
        [640, 96],
        [760, 40],
      ].map(([a, b2]) => (
        <circle key={`${a}-${b2}`} cx={a} cy={b2} r={2.5} fill="#ffffff" opacity={0.7} />
      ))}

      {/* stoep en straat */}
      <rect x={0} y={GROND} width={B} height={24} fill="#59607e" />
      <rect x={0} y={GROND + 24} width={B} height={36} fill="#353b57" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <rect key={i} x={40 + i * 140} y={GROND + 40} width={70} height={5} rx={2} fill="#c9cfe3" opacity={0.6} />
      ))}

      {/* lantaarnpalen */}
      {[24, B - 24].map((px) => (
        <g key={px}>
          <rect x={px - 4} y={GROND - 190} width={8} height={190} fill="#2a2f45" />
          <rect x={px - 14} y={GROND - 206} width={28} height={22} rx={6} fill={RAAM} />
        </g>
      ))}

      {/* de huizen in de straat */}
      {huizen.map((h, i) =>
        h === null ? (
          <LegePlek key={`leeg-${i}`} x={x(i)} grond={GROND} aan={boven(sleep)} />
        ) : (
          <g key={`${i}-${h}`} className={`${s.huis} ${goed === i ? s.pop : ""}`}>
            <Huis x={x(i)} grond={GROND} n={h} licht={licht === i} kleur={h === "?" ? ["#b8bfd6", "#7a829e"] : kleurVan(h)} />
          </g>
        ),
      )}

      {/* losse huizen om te slepen */}
      {losse.map((n, i) => {
        const dit = sleep?.n === n;
        const dx = dit ? sleep.x - (lx(i) + W / 2) : 0;
        const dy = dit ? sleep.y - (LOSGROND - 100) : 0;
        return (
          <g
            key={`los-${n}-${fout?.n === n ? fout.keer : 0}`}
            className={`${s.huis} ${s.verschijn} ${fout?.n === n ? s.schud : ""}`}
          >
            <g
              className={actief ? (dit ? s.sleept : s.los) : undefined}
              transform={`translate(${dx} ${dy})`}
              onPointerDown={(e) => pak(e, n, i)}
              /* Toetsenbord (Enter of spatie) en de automatische test: kiezen zonder slepen. Een muis of vinger loopt via pak/los. */
              onClick={(e) => {
                if (e.detail === 0 && actief) meld({ soort: "gelegd", n });
              }}
              onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === " ") && actief) {
                  e.preventDefault();
                  meld({ soort: "gelegd", n });
                }
              }}
              tabIndex={actief ? 0 : -1}
              role="button"
              aria-label={`Huis ${n}`}
              data-ding={n}
            >
              <Huis x={lx(i)} grond={LOSGROND} n={n} kleur={kleurVan(n)} />
            </g>
          </g>
        );
      })}

      {hand && actief && handStart && doelX !== null && !sleep && (
        <g
          className={s.hand}
          style={{ "--dx": `${doelX - handStart.x}px`, "--dy": `${doelY - handStart.y}px` } as CSSProperties}
        >
          <g transform={`translate(${handStart.x} ${handStart.y})`}>
            <Handje />
          </g>
        </g>
      )}
    </svg>
  );
}

/** Lijntekening voor de kaart aan het eind (244 × 190): drie huizen op een rij. */
export function KaartHuisnummers() {
  const huis = (x: number, n: number, k: [string, string]) => (
    <g key={n}>
      <polygon points={`${x - 4},${92} ${x + 32},${58} ${x + 68},${92}`} fill={k[1]} />
      <rect x={x} y={90} width={64} height={70} rx={3} fill={k[0]} />
      <rect x={x + 10} y={98} width={44} height={26} rx={6} fill={BORDJE} stroke="#ffffff" strokeWidth={2} />
      <text x={x + 32} y={118} textAnchor="middle" fontSize={19} fontWeight={800} fill="#ffffff" style={{ fontFamily: LETTER }}>
        {n}
      </text>
      <path d={`M${x + 24} 160 v-20 a8 8 0 0 1 16 0 v20 z`} fill={k[1]} />
    </g>
  );
  return (
    <>
      <rect x={4} y={160} width={236} height={8} rx={4} fill="#59607e" />
      {huis(10, 23, kleurVan(23))}
      {huis(90, 24, kleurVan(24))}
      {huis(170, 25, kleurVan(25))}
    </>
  );
}
