"use client";

/**
 * Het splitsschema van Optellen tot 100 (oktober 2026), naar Synthesis
 * "Add up to 100 · Part Part Whole".
 *
 * Bovenaan een groot rondje (het totaal), met twee lijnen naar twee rondjes
 * eronder (de delen). Elk deel heeft links een min- en rechts een plusknop op
 * de rand. In de rondjes staan stippen, geen cijfers; elk aantal heeft de
 * kleur van zijn getaltegel, voor de stippen én de rand. Boven de 10 komt er
 * een roze blok van tien met de rest ernaast (12 = 10 + 2).
 *
 * Rechtsboven een lijstje met de gevonden splitsingen, in kleur.
 *
 * Daarnaast een losse stand `tegel`: een groene tegel van 5 die bij een tik
 * uit elkaar valt in vijf rode blokjes ("in hoeveel stukjes?").
 *
 * Het draaiboek bepaalt de aantallen; het vlak meldt `{ soort: "knop", knop }`,
 * `{ soort: "klaar" }` (het vinkje) en `{ soort: "tegel" }`.
 */

import type { Vlakbasis } from "../soort";
import { TEGELKLEUR, getalkleur, vorm } from "../tegels";
import { Gouden } from "./optellen100-machine";
import s from "./optellen100.module.css";

export type Splitsknop = "links-min" | "links-plus" | "rechts-min" | "rechts-plus";

export type SplitsProps = {
  links: number;
  rechts: number;
  /** Een vast totaal; zonder vult het totaal zich met de stippen van beide delen. */
  geheel?: number | null;
  /** De knoppen werken. */
  knoppen?: boolean;
  /** Alleen deze knop werkt, met een gouden ring eromheen. */
  alleen?: Splitsknop | null;
  /** Een vraagteken in dit rondje. */
  vraag?: "links" | "rechts" | null;
  /** Het blauwe vinkje onder het schema. */
  klaar?: boolean;
  /** Gevonden splitsingen: [deel, deel, totaal]. */
  lijst?: [number, number, number][];
  /** De losse tegel van 5 in plaats van het schema. */
  tegel?: null | "heel" | "los";
  /** Het hele schema even uit beeld (bij de woorduitleg). */
  verborgen?: boolean;
};

export type SplitsMelding = { soort: "knop"; knop: Splitsknop } | { soort: "klaar" } | { soort: "tegel" };

const GEHEEL = { x: 490, y: 205, r: 100 };
const LINKS = { x: 335, y: 485, r: 92 };
const RECHTS = { x: 645, y: 485, r: 92 };

function randkleur(n: number): string {
  if (n <= 0) return "#7d8496";
  return TEGELKLEUR[n] ?? "#ffffff";
}

/** Stippen in rijtjes van twee, zoals een getaltegel; een losse stip bovenaan in het midden. */
function stipplekken(n: number, cx: number, cy: number, afstand: number) {
  const rijen = Math.ceil(n / 2);
  const uit: { x: number; y: number }[] = [];
  const top = cy - ((rijen - 1) * afstand) / 2;
  let i = 0;
  for (let r = 0; r < rijen; r++) {
    const inRij = r === 0 && n % 2 === 1 ? 1 : 2;
    for (let k = 0; k < inRij; k++) {
      const x = inRij === 1 ? cx : cx + (k === 0 ? -afstand / 2 : afstand / 2);
      uit.push({ x, y: top + r * afstand });
      i++;
    }
  }
  return uit.slice(0, i);
}

function Stippen({ n, cx, cy }: { n: number; cx: number; cy: number }) {
  if (n <= 0) return null;
  if (n <= 10) {
    return (
      <g>
        {stipplekken(n, cx, cy, n > 8 ? 26 : 30).map((p, i) => (
          <circle key={i} className={s.plop} cx={p.x} cy={p.y} r={n > 8 ? 10.5 : 12} fill={randkleur(n)} />
        ))}
      </g>
    );
  }
  /* Meer dan 10: een roze blok van tien, en de rest ernaast in zijn eigen kleur. */
  const rest = n - 10;
  const bx = cx - 34;
  return (
    <g>
      <rect x={bx - 26} y={cy - 64} width={52} height={128} rx={8} fill="rgba(239,93,138,0.22)" stroke={TEGELKLEUR[10]} strokeWidth={2} />
      {stipplekken(10, bx, cy, 24).map((p, i) => (
        <circle key={`t${i}`} cx={p.x} cy={p.y} r={9} fill={TEGELKLEUR[10]} />
      ))}
      {stipplekken(rest, cx + 38, cy, 24).map((p, i) => (
        <circle key={`r${i}`} className={s.plop} cx={p.x} cy={p.y} r={9} fill={getalkleur(rest)} />
      ))}
    </g>
  );
}

function Rondje({ x, y, r, n, vraag }: { x: number; y: number; r: number; n: number; vraag?: boolean }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="rgba(10,16,32,0.55)" stroke={n > 10 ? "#ffffff" : randkleur(n)} strokeWidth={4} />
      <Stippen n={n} cx={x} cy={y} />
      {vraag && (
        <text x={x} y={y + 22} textAnchor="middle" fontSize={64} fontWeight={800} fill="#d6d8e1">
          ?
        </text>
      )}
    </g>
  );
}

function Rondknop({
  x,
  y,
  teken,
  aan,
  goud,
  onTik,
}: {
  x: number;
  y: number;
  teken: "−" | "+";
  aan: boolean;
  goud: boolean;
  onTik: () => void;
}) {
  return (
    <g
      className={aan ? s.knop : s.uit}
      role={aan ? "button" : undefined}
      aria-label={aan ? (teken === "+" ? "Plus" : "Min") : undefined}
      onPointerDown={(e) => {
        if (!aan) return;
        e.preventDefault();
        onTik();
      }}
    >
      {goud && <Gouden x={x} y={y} b={46} h={46} rond />}
      <circle className={s.knopvlak} cx={x} cy={y} r={23} fill="#3a4152" stroke="#59627a" strokeWidth={1.5} />
      <text x={x} y={y + 8} textAnchor="middle" fontSize={26} fontWeight={700} fill="#e6e8ee">
        {teken}
      </text>
    </g>
  );
}

/** De tegel van 5 die uit elkaar valt. */
function TegelVijf({ los, onTik }: { los: boolean; onTik: () => void }) {
  const c = 74;
  const hokjes = vorm(5);
  const ox = 490 - c;
  const oy = 360 - (3 * c) / 2;
  return (
    <g
      className={los ? undefined : s.knop}
      role={los ? undefined : "button"}
      aria-label={los ? undefined : "Tegel van 5"}
      onPointerDown={(e) => {
        if (los) return;
        e.preventDefault();
        onTik();
      }}
    >
      {hokjes.map((hk, i) => {
        const hx = ox + hk.k * c;
        const hy = oy + (2 - hk.r) * c;
        const lx = 490 - c / 2 + (i - 2) * 118;
        const ly = 360 - c / 2;
        const dx = los ? lx - hx : 0;
        const dy = los ? ly - hy : 0;
        const kleur = los ? TEGELKLEUR[1] : TEGELKLEUR[5];
        return (
          <g key={i} className={s.beweeg} style={{ transform: `translate(${dx}px, ${dy}px)` }}>
            <rect x={hx + 1} y={hy + 1} width={c - 2} height={c - 2} rx={6} fill={kleur} style={{ transition: "fill 0.5s" }} />
            <rect x={hx + 4} y={hy + 3} width={c - 8} height={3} rx={1.5} fill="rgba(255,255,255,0.2)" />
            <circle cx={hx + c / 2} cy={hy + c / 2} r={c * 0.18} fill="#0a1020" />
          </g>
        );
      })}
    </g>
  );
}

export function Splitsschema({
  links,
  rechts,
  geheel = null,
  knoppen = false,
  alleen = null,
  vraag = null,
  klaar = false,
  lijst = [],
  tegel = null,
  verborgen = false,
  meld,
}: SplitsProps & Vlakbasis) {
  const totaal = geheel ?? links + rechts;
  const werkt = (k: Splitsknop) => knoppen && (alleen === null || alleen === k);
  const knop = (k: Splitsknop) => () => meld({ soort: "knop", knop: k });

  /* Een lijn van de rand van het totaal naar de rand van een deel. */
  const lijn = (deel: { x: number; y: number; r: number }) => {
    const dx = deel.x - GEHEEL.x;
    const dy = deel.y - GEHEEL.y;
    const l = Math.hypot(dx, dy);
    return {
      x1: GEHEEL.x + (dx / l) * GEHEEL.r,
      y1: GEHEEL.y + (dy / l) * GEHEEL.r,
      x2: deel.x - (dx / l) * deel.r,
      y2: deel.y - (dy / l) * deel.r,
    };
  };

  return (
    <div className={s.wortel}>
      <svg width={980} height={720} viewBox="0 0 980 720" style={{ position: "absolute", inset: 0 }}>
        {tegel && <TegelVijf los={tegel === "los"} onTik={() => meld({ soort: "tegel" })} />}

        {!tegel && !verborgen && (
          <g>
            <line {...lijn(LINKS)} stroke="#9aa0ad" strokeWidth={3} />
            <line {...lijn(RECHTS)} stroke="#9aa0ad" strokeWidth={3} />
            <Rondje {...GEHEEL} n={totaal} />
            <Rondje {...LINKS} n={links} vraag={vraag === "links"} />
            <Rondje {...RECHTS} n={rechts} vraag={vraag === "rechts"} />
            <Rondknop x={LINKS.x - LINKS.r} y={LINKS.y} teken="−" aan={werkt("links-min")} goud={alleen === "links-min"} onTik={knop("links-min")} />
            <Rondknop x={LINKS.x + LINKS.r} y={LINKS.y} teken="+" aan={werkt("links-plus")} goud={alleen === "links-plus"} onTik={knop("links-plus")} />
            <Rondknop x={RECHTS.x - RECHTS.r} y={RECHTS.y} teken="−" aan={werkt("rechts-min")} goud={alleen === "rechts-min"} onTik={knop("rechts-min")} />
            <Rondknop x={RECHTS.x + RECHTS.r} y={RECHTS.y} teken="+" aan={werkt("rechts-plus")} goud={alleen === "rechts-plus"} onTik={knop("rechts-plus")} />

            {klaar && (
              <g
                className={s.vinkje}
                role="button"
                aria-label="Klaar"
                onPointerDown={(e) => {
                  e.preventDefault();
                  meld({ soort: "klaar" });
                }}
              >
                <circle cx={490} cy={650} r={26} fill="#4b8af5" />
                <path d="M478 651 l8 8 l15 -17" fill="none" stroke="#ffffff" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
              </g>
            )}

            {/* het lijstje met gevonden splitsingen */}
            {lijst.map(([a, b, c], i) => (
              <text key={`${a}-${b}-${i}`} className={s.plop} x={770} y={70 + i * 44} fontSize={30} fontWeight={800} fill="#ffffff">
                <tspan fill={getalkleur(a)}>{a}</tspan>
                <tspan fill="#c3c7d0"> + </tspan>
                <tspan fill={getalkleur(b)}>{b}</tspan>
                <tspan fill="#c3c7d0"> = </tspan>
                <tspan fill={getalkleur(c)}>{c}</tspan>
              </text>
            ))}
          </g>
        )}
      </svg>
    </div>
  );
}
