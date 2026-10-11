"use client";

/**
 * De tienenmachine van Optellen tot 100 (oktober 2026), naar Synthesis
 * "Add up to 100 · Add 10s" en de checks van die unit.
 *
 * Tussen twee dunne lijnen liggen de groepjes van 10: een klodder met een
 * witte, golvende rand en tien groene stippen erin. Losse eenheden zijn
 * blauwe stippen ernaast, steeds twee naast elkaar. Onderaan één vierkante
 * plusknop met eronder het getal dat erbij komt: een groene 10 of een blauwe 1.
 *
 * Het draaiboek zet de aantallen (`tienen`, `enen`) en kiest de knop; het vlak
 * meldt alleen `{ soort: "plus", waarde }` als het kind op de knop tikt, en
 * alleen als `actief` aan staat.
 *
 * `Klodder` en `Stippenplus` worden ook gebruikt door de bundelmachine van
 * Tientallen (tientallen-bundelmachine.tsx).
 */

import type { Vlakbasis } from "../soort";
import s from "./optellen100.module.css";

export type MachineProps = {
  tienen: number;
  enen: number;
  /** Eén grote oranje klodder van 100 stippen (het beginbeeld van de toets). */
  honderd?: boolean;
  /** Welke plusknop er onderaan staat; `null` = geen knop. */
  knop?: 10 | 1 | null;
  actief?: boolean;
  /** De machine staat op slot: de knop is dof, met een slotje. */
  slot?: boolean;
  /** Een gouden ring om de knop ("zie je de plusknop daar beneden?"). */
  wijs?: boolean;
};

export type MachineMelding = { soort: "plus"; waarde: 10 | 1 };

export const GROEN = "#4cc38a";
export const BLAUW = "#4b8af5";
export const ORANJE = "#f08a2c";
const LIJN = "rgba(190,200,225,0.35)";

/* ---------- tekenstukjes ---------- */

/** Een gesloten, golvende vorm door de punten (Catmull-Rom als bezierkrommen). */
function golfpad(cx: number, cy: number, straal: number, zaad: number): string {
  const n = 14;
  const p = Array.from({ length: n }, (_, i) => {
    const t = (i / n) * Math.PI * 2;
    const r = straal * (1 + 0.07 * Math.sin(3 * t + zaad) + 0.045 * Math.sin(5 * t + zaad * 1.7) + 0.03 * Math.sin(7 * t + zaad * 0.4));
    return { x: cx + r * Math.cos(t), y: cy + r * Math.sin(t) };
  });
  let d = `M ${p[0].x.toFixed(1)} ${p[0].y.toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const a = p[(i - 1 + n) % n];
    const b = p[i];
    const c = p[(i + 1) % n];
    const e = p[(i + 2) % n];
    const c1 = { x: b.x + (c.x - a.x) / 6, y: b.y + (c.y - a.y) / 6 };
    const c2 = { x: c.x - (e.x - b.x) / 6, y: c.y - (e.y - b.y) / 6 };
    d += ` C ${c1.x.toFixed(1)} ${c1.y.toFixed(1)} ${c2.x.toFixed(1)} ${c2.y.toFixed(1)} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`;
  }
  return `${d} Z`;
}

/** Tien stippen in rijtjes van 3, 4 en 3. */
const TIEN: { x: number; y: number }[] = [
  ...[-1, 0, 1].map((i) => ({ x: i, y: -1 })),
  ...[-1.5, -0.5, 0.5, 1.5].map((i) => ({ x: i, y: 0 })),
  ...[-1, 0, 1].map((i) => ({ x: i, y: 1 })),
];

/** Honderd stippen als een zonnebloem, netjes verdeeld over een rondje. */
const HONDERD = Array.from({ length: 100 }, (_, i) => {
  const r = Math.sqrt((i + 0.5) / 100);
  const t = i * 2.399963;
  return { x: r * Math.cos(t), y: r * Math.sin(t) };
});

/** Een klodder: een groepje van 10 (groen), 100 (oranje) of 1000 (roze). */
export function Klodder({
  x,
  y,
  soort = 10,
  zaad = 1,
  klasse,
}: {
  x: number;
  y: number;
  soort?: 10 | 100 | 1000;
  zaad?: number;
  klasse?: string;
}) {
  if (soort === 10) {
    const R = 33;
    return (
      <g className={klasse}>
        <path d={golfpad(x, y, R, zaad)} fill="#0f1a33" stroke="#ffffff" strokeWidth={3.2} strokeLinejoin="round" />
        {TIEN.map((p, i) => (
          <circle key={i} cx={x + p.x * 10.5} cy={y + p.y * 10.5} r={4.3} fill={GROEN} />
        ))}
      </g>
    );
  }
  const R = soort === 100 ? 58 : 92;
  const kleur = soort === 100 ? ORANJE : "#ef5d8a";
  const stip = soort === 100 ? 3.4 : 2.3;
  const stippen = soort === 100 ? HONDERD : Array.from({ length: 400 }, (_, i) => {
    const r = Math.sqrt((i + 0.5) / 400);
    const t = i * 2.399963;
    return { x: r * Math.cos(t), y: r * Math.sin(t) };
  });
  return (
    <g className={klasse}>
      <path d={golfpad(x, y, R, zaad)} fill="#0f1a33" stroke="#ffffff" strokeWidth={3.5} strokeLinejoin="round" />
      {stippen.map((p, i) => (
        <circle key={i} cx={x + p.x * (R - 9)} cy={y + p.y * (R - 9)} r={stip} fill={kleur} />
      ))}
    </g>
  );
}

/** Een grote klodder van 100 met een eigen maat (voor het beginbeeld). */
function GroteHonderd({ x, y, R }: { x: number; y: number; R: number }) {
  return (
    <g className={s.plop}>
      <path d={golfpad(x, y, R, 2.3)} fill="#0f1a33" stroke="#ffffff" strokeWidth={4} strokeLinejoin="round" />
      {HONDERD.map((p, i) => (
        <circle key={i} cx={x + p.x * (R - 16)} cy={y + p.y * (R - 16)} r={6.5} fill={ORANJE} />
      ))}
    </g>
  );
}

/** Het plusje van stippen op een knop. */
export function Stippenplus({ x, y, kleur = "#c9cfdb" }: { x: number; y: number; kleur?: string }) {
  const stip = (dx: number, dy: number, r: number) => <circle key={`${dx}-${dy}`} cx={x + dx} cy={y + dy} r={r} fill={kleur} />;
  return (
    <g>
      <circle cx={x} cy={y} r={26} fill="rgba(255,255,255,0.06)" />
      {[-16, -8, 8, 16].map((d) => stip(d, 0, 2.2))}
      {[-16, -8, 8, 16].map((d) => stip(0, d, 2.2))}
      {stip(0, 0, 3)}
    </g>
  );
}

/** Een gouden ring om een knop die het kind moet gebruiken. */
export function Gouden({ x, y, b, h, rond = false }: { x: number; y: number; b: number; h: number; rond?: boolean }) {
  return rond ? (
    <circle className={s.ring} cx={x} cy={y} r={b / 2 + 6} fill="none" stroke="#f5c84b" strokeWidth={3} />
  ) : (
    <rect className={s.ring} x={x - 6} y={y - 6} width={b + 12} height={h + 12} rx={14} fill="none" stroke="#f5c84b" strokeWidth={3} />
  );
}

/** Een plusknop van de machine met het getal eronder. */
export function Plusknop({
  x,
  y,
  waarde,
  aan,
  wijs,
  slot,
  onTik,
  b = 130,
  h = 130,
}: {
  x: number;
  y: number;
  waarde: number;
  aan: boolean;
  wijs?: boolean;
  slot?: boolean;
  onTik: () => void;
  b?: number;
  h?: number;
}) {
  const kleur = waarde === 1 ? BLAUW : waarde === 10 ? GROEN : waarde === 100 ? ORANJE : "#ef5d8a";
  return (
    <g
      className={aan ? s.knop : slot ? s.uit : undefined}
      role={aan ? "button" : undefined}
      aria-label={aan ? `Plus ${waarde}` : undefined}
      onPointerDown={(e) => {
        if (!aan) return;
        e.preventDefault();
        onTik();
      }}
    >
      {wijs && <Gouden x={x} y={y} b={b} h={h} />}
      <rect className={s.knopvlak} x={x} y={y} width={b} height={h} rx={10} fill="#232838" />
      <Stippenplus x={x + b / 2} y={y + h * 0.36} />
      <text x={x + b / 2} y={y + h * 0.84} textAnchor="middle" fontFamily="ui-monospace, Menlo, monospace" fontWeight={700} fontSize={h > 100 ? 34 : 26} fill={kleur}>
        {waarde}
      </text>
      {slot && (
        <g transform={`translate(${x + b - 30} ${y + 10})`}>
          <rect x={0} y={9} width={20} height={15} rx={3} fill="#c9cfdb" />
          <path d="M4 10 V6 a6 6 0 0 1 12 0 V10" fill="none" stroke="#c9cfdb" strokeWidth={3} />
        </g>
      )}
    </g>
  );
}

/* ---------- waar de groepjes liggen ---------- */

/** Groepjes van 10 in twee kolommen, van onder naar boven; enen ernaast in tweetallen. */
export function legMachine(tienen: number, enen: number, onder: number, midden = 490) {
  const metEnen = enen > 0;
  const kolomX = metEnen ? [midden - 125, midden - 45] : [midden - 42, midden + 42];
  const blokken = Array.from({ length: tienen }, (_, i) => ({
    x: kolomX[i % 2],
    y: onder - 40 - Math.floor(i / 2) * 78,
  }));
  const stippen = Array.from({ length: enen }, (_, i) => ({
    x: midden + 40 + (i % 2) * 30,
    y: onder - 16 - Math.floor(i / 2) * 30,
  }));
  return { blokken, stippen };
}

export function Tienenmachine({ tienen, enen, honderd = false, knop = 10, actief = false, slot = false, wijs = false, meld, metSom }: MachineProps & Vlakbasis) {
  const boven = metSom ? 128 : 70;
  const onder = 560;
  const { blokken, stippen } = legMachine(tienen, enen, onder - 10);

  return (
    <div className={s.wortel}>
      <svg width={980} height={720} viewBox="0 0 980 720" style={{ position: "absolute", inset: 0 }}>
        <line x1={140} y1={boven} x2={860} y2={boven} stroke={LIJN} strokeWidth={1.5} />
        <line x1={140} y1={onder} x2={860} y2={onder} stroke={LIJN} strokeWidth={1.5} />

        {honderd && <GroteHonderd x={490} y={(boven + onder) / 2} R={Math.min(165, (onder - boven) / 2 - 12)} />}

        {!honderd &&
          blokken.map((p, i) => <Klodder key={`t${i}`} x={p.x} y={p.y} zaad={i * 1.9 + 0.7} klasse={s.plop} />)}
        {!honderd &&
          stippen.map((p, i) => <circle key={`e${i}`} className={s.plop} cx={p.x} cy={p.y} r={11} fill={BLAUW} />)}

        {knop !== null && (
          <Plusknop
            x={425}
            y={576}
            waarde={knop}
            aan={actief && !slot}
            wijs={wijs}
            slot={slot}
            onTik={() => meld({ soort: "plus", waarde: knop })}
          />
        )}
      </svg>
    </div>
  );
}
