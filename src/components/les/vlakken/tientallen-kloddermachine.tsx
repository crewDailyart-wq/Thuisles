"use client";

/**
 * De kloddermachine van Tientallen (oktober 2026), naar Synthesis "Grouping
 * 10s · Read Splodges", "Add and Subtract Splodges", de toetsen van die unit
 * en "Expanding Numbers · Expanding Splodges" (INSPIRATIE.md, blok C en
 * ronde 2).
 *
 * In het midden liggen klodders: een groepje van 10 is een wolkje met een
 * witte, golvende rand en tien groene stippen erin; losse stippen zijn blauw.
 * Ze liggen als een trosje bij elkaar, of netjes: de klodders in een kolom en
 * de losse stippen ernaast (de knop "Netjes" / "Door elkaar").
 *
 * Bovenaan kan een vakje TOTAAL staan dat meerekent, en een vakje GEKOZEN
 * STIPPEN als één soort is uitgekozen (de rest wordt dan donker). Onderaan
 * per plek een teller (− getal +) met erboven de waarde in de eigen kleur. De
 * teller voor de losse stippen stopt bij 9, net als die voor de klodders.
 *
 * Het draaiboek zet de aantallen; het vlak meldt alleen wat het kind doet:
 * `{ soort: "teller", waarde, stap }`, `{ soort: "klaar" }`, `{ soort: "reset" }`,
 * `{ soort: "sorteer" }` en `{ soort: "hand" }` (hulp), alleen als `actief` aan staat.
 *
 * Staat de som bovenaan (`metSom`), dan schuiven de vakjes TOTAAL en GEKOZEN
 * STIPPEN naar de zijkanten.
 */

import type { Vlakbasis } from "../soort";
import { BLAUW, GROEN, Klodder } from "./optellen100-machine";
import s from "./optellen100.module.css";

export type KloddermachineProps = {
  tienen: number;
  enen: number;
  /** De tellers onderaan; leeg = geen tellers. */
  tellers?: (10 | 1)[];
  /** Het vakje TOTAAL bovenaan. */
  totaal?: boolean;
  /** "tros": dicht bij elkaar; "netjes": klodders in een kolom, losse stippen ernaast. */
  ligging?: "tros" | "netjes";
  actief?: boolean;
  /** Het blauwe vinkje: klaar met bouwen. */
  klaar?: boolean;
  /** De knop Opnieuw: alles terug naar 0. */
  reset?: boolean;
  /** De knop Netjes / Door elkaar. */
  sorteer?: boolean;
  /** Alleen deze soort blijft fel, met het vakje GEKOZEN STIPPEN. */
  gekozen?: 10 | 1 | null;
  /** Een gouden ring om een teller, het totaal of het gekozen vakje. */
  wijs?: 10 | 1 | "totaal" | "gekozen" | null;
  /** Het handje: hulp vragen. */
  hand?: boolean;
};

export type KlodderMelding =
  | { soort: "teller"; waarde: 10 | 1; stap: 1 | -1 }
  | { soort: "klaar" }
  | { soort: "reset" }
  | { soort: "sorteer" }
  | { soort: "hand" };

const MIDDEN = { x: 490, y: 335 };
const MAX = 9;
const LETTER = "ui-monospace, Menlo, monospace";

type Punt = { x: number; y: number };

/** Een vast trosje: het midden, een ring van zes en daarbuiten de rest. */
const TROS: Punt[] = (() => {
  const a = 76;
  const uit: Punt[] = [{ x: 0, y: 0 }];
  for (let i = 0; i < 6; i++) uit.push({ x: a * Math.cos((i * Math.PI) / 3 - Math.PI / 6), y: a * Math.sin((i * Math.PI) / 3 - Math.PI / 6) });
  for (let i = 0; i < 6; i++) uit.push({ x: 2 * a * Math.cos((i * Math.PI) / 3), y: 1.75 * a * Math.sin((i * Math.PI) / 3) });
  /* een beetje rommelig, maar altijd hetzelfde */
  return uit.map((p, i) => ({ x: p.x + Math.sin(i * 2.7) * 6, y: p.y + Math.cos(i * 1.9) * 6 }));
})();

function liggingTros(tienen: number, enen: number): { klodders: Punt[]; stippen: Punt[] } {
  const ruw = TROS.slice(0, tienen);
  const mx = ruw.length ? ruw.reduce((a, p) => a + p.x, 0) / ruw.length : 0;
  const my = ruw.length ? ruw.reduce((a, p) => a + p.y, 0) / ruw.length : 0;
  const breedte = ruw.length ? Math.max(...ruw.map((p) => p.x - mx)) : -60;
  const schuif = enen > 0 ? -50 : 0;
  const klodders = ruw.map((p) => ({ x: MIDDEN.x + schuif + p.x - mx, y: MIDDEN.y + p.y - my }));
  const x0 = MIDDEN.x + schuif + breedte + 80;
  const stippen = Array.from({ length: enen }, (_, i) => ({
    x: x0 + (i % 3) * 30 + Math.sin(i * 3.1) * 5,
    y: MIDDEN.y - 30 + Math.floor(i / 3) * 30 + Math.cos(i * 2.3) * 5,
  }));
  return { klodders, stippen };
}

function liggingNetjes(tienen: number, enen: number): { klodders: Punt[]; stippen: Punt[] } {
  const twee = tienen > 5;
  const rijen = twee ? Math.ceil(tienen / 2) : tienen;
  const kolomX = twee ? [MIDDEN.x - 80, MIDDEN.x] : [MIDDEN.x - 40];
  const y0 = MIDDEN.y - ((rijen - 1) * 76) / 2;
  const klodders = Array.from({ length: tienen }, (_, i) => ({
    x: kolomX[twee ? i % 2 : 0],
    y: y0 + (twee ? Math.floor(i / 2) : i) * 76,
  }));
  const ex = (twee ? MIDDEN.x + 80 : MIDDEN.x + 60) + (tienen === 0 ? -60 : 0);
  const erijen = Math.ceil(enen / 2);
  const ey0 = MIDDEN.y - ((erijen - 1) * 32) / 2;
  const stippen = Array.from({ length: enen }, (_, i) => ({ x: ex + (i % 2) * 32, y: ey0 + Math.floor(i / 2) * 32 }));
  return { klodders, stippen };
}

function Knopje({
  x,
  y,
  b,
  h,
  tekst,
  aan,
  rood = false,
  onTik,
}: {
  x: number;
  y: number;
  b: number;
  h: number;
  tekst: string;
  aan: boolean;
  rood?: boolean;
  onTik: () => void;
}) {
  return (
    <g
      className={aan ? s.knop : s.uit}
      role={aan ? "button" : undefined}
      aria-label={aan ? tekst : undefined}
      onPointerDown={(e) => {
        if (!aan) return;
        e.preventDefault();
        onTik();
      }}
    >
      <rect className={s.knopvlak} x={x} y={y} width={b} height={h} rx={10} fill="#232838" stroke={rood ? "#e2506f" : "rgba(190,200,225,0.45)"} strokeWidth={2} />
      <text x={x + b / 2} y={y + h / 2 + 7} textAnchor="middle" fontFamily={LETTER} fontWeight={700} fontSize={19} fill={rood ? "#ff7b93" : "#d6d8e1"}>
        {tekst}
      </text>
    </g>
  );
}

/** Een teller: − getal +, met de waarde van de plek erboven. */
function Teller({
  x,
  y,
  waarde,
  n,
  aan,
  wijs,
  meld,
}: {
  x: number;
  y: number;
  waarde: 10 | 1;
  n: number;
  aan: boolean;
  wijs: boolean;
  meld: (stap: 1 | -1) => void;
}) {
  const vak = 58;
  const kleur = waarde === 10 ? GROEN : BLAUW;
  const deel = (dx: number, teken: string, kan: boolean, stap: 1 | -1) => (
    <g
      className={aan && kan ? s.knop : undefined}
      role={aan && kan ? "button" : undefined}
      aria-label={aan && kan ? `${stap > 0 ? "Plus" : "Min"} ${waarde}` : undefined}
      opacity={kan ? 1 : 0.35}
      onPointerDown={(e) => {
        if (!aan || !kan) return;
        e.preventDefault();
        meld(stap);
      }}
    >
      <rect className={s.knopvlak} x={x + dx} y={y} width={vak} height={52} fill="#2b3550" />
      <text x={x + dx + vak / 2} y={y + 36} textAnchor="middle" fontSize={34} fontWeight={500} fill="#e6e8ee">
        {teken}
      </text>
    </g>
  );
  return (
    <g opacity={aan ? 1 : 0.6}>
      <text x={x + vak * 1.5} y={y - 12} textAnchor="middle" fontFamily={LETTER} fontWeight={700} fontSize={22} fill={kleur}>
        {waarde}
      </text>
      {wijs && <rect className={s.ring} x={x - 7} y={y - 7} width={vak * 3 + 14} height={66} rx={14} fill="none" stroke="#f5c84b" strokeWidth={3} />}
      <rect x={x - 1} y={y - 1} width={vak * 3 + 2} height={54} rx={10} fill="none" stroke="rgba(190,200,225,0.6)" strokeWidth={2} />
      {deel(0, "−", n > 0, -1)}
      <rect x={x + vak} y={y} width={vak} height={52} fill="#202941" />
      <text x={x + vak * 1.5} y={y + 37} textAnchor="middle" fontSize={30} fontWeight={600} fill="#ffffff">
        {n}
      </text>
      {deel(vak * 2, "+", n < MAX, 1)}
    </g>
  );
}

/** Een vakje bovenaan met een klein woord en een groot getal. */
function Kader({ x, y, woord, getal, wijs }: { x: number; y: number; woord: string; getal: number; wijs: boolean }) {
  const b = Math.max(120, woord.length * 12 + 30);
  return (
    <g className={s.plop}>
      {wijs && <rect className={s.ring} x={x - b / 2 - 7} y={y - 7} width={b + 14} height={84} rx={18} fill="none" stroke="#f5c84b" strokeWidth={3} />}
      <rect x={x - b / 2} y={y} width={b} height={70} rx={14} fill="rgba(15,26,51,0.6)" stroke="rgba(190,200,225,0.55)" strokeWidth={2} />
      <text x={x} y={y + 22} textAnchor="middle" fontSize={13} fontWeight={700} letterSpacing={1.5} fill="#aab3c8">
        {woord}
      </text>
      <text x={x} y={y + 56} textAnchor="middle" fontSize={30} fontWeight={700} fill="#ffffff">
        {getal}
      </text>
    </g>
  );
}

export function Kloddermachine({
  tienen,
  enen,
  tellers = [],
  totaal = false,
  ligging = "tros",
  actief = false,
  klaar = false,
  reset = false,
  sorteer = false,
  gekozen = null,
  wijs = null,
  hand = false,
  meld,
  metSom,
}: KloddermachineProps & Vlakbasis) {
  const t = Math.max(0, Math.min(MAX, tienen));
  const e = Math.max(0, Math.min(MAX, enen));
  const { klodders, stippen } = ligging === "netjes" ? liggingNetjes(t, e) : liggingTros(t, e);

  const tellerB = 58 * 3;
  const rij = tellers.length * (tellerB + 28) - 28;
  const tellerX = (i: number) => MIDDEN.x - rij / 2 + i * (tellerB + 28);

  return (
    <div className={s.wortel}>
      <svg width={980} height={720} viewBox="0 0 980 720" style={{ position: "absolute", inset: 0 }}>
        {totaal && <Kader x={metSom ? 110 : MIDDEN.x} y={metSom ? 150 : 26} woord="TOTAAL" getal={t * 10 + e} wijs={wijs === "totaal"} />}
        {gekozen !== null && (
          <Kader x={metSom ? 860 : 790} y={metSom ? 150 : 26} woord="GEKOZEN STIPPEN" getal={gekozen === 10 ? t * 10 : e} wijs={wijs === "gekozen"} />
        )}

        {klodders.map((p, i) => (
          <g key={`t${i}`} className={s.beweeg} style={{ transform: `translate(${p.x}px, ${p.y}px)`, opacity: gekozen === 1 ? 0.22 : 1 }}>
            <Klodder x={0} y={0} zaad={i * 1.7 + 0.4} klasse={s.plop} />
          </g>
        ))}
        {stippen.map((p, i) => (
          <g key={`e${i}`} className={s.beweeg} style={{ transform: `translate(${p.x}px, ${p.y}px)`, opacity: gekozen === 10 ? 0.22 : 1 }}>
            <circle className={s.plop} cx={0} cy={0} r={10} fill={BLAUW} />
          </g>
        ))}

        {tellers.map((w, i) => (
          <Teller
            key={w}
            x={tellerX(i)}
            y={600}
            waarde={w}
            n={w === 10 ? t : e}
            aan={actief}
            wijs={wijs === w}
            meld={(stap) => meld({ soort: "teller", waarde: w, stap })}
          />
        ))}

        {sorteer && (
          <Knopje x={30} y={530} b={150} h={50} tekst={ligging === "netjes" ? "Door elkaar" : "Netjes"} aan={actief} onTik={() => meld({ soort: "sorteer" })} />
        )}
        {reset && <Knopje x={30} y={600} b={150} h={50} tekst="Opnieuw" rood aan={actief} onTik={() => meld({ soort: "reset" })} />}

        {hand && (
          <g
            className={actief ? s.knop : s.uit}
            role={actief ? "button" : undefined}
            aria-label={actief ? "Hulp" : undefined}
            onPointerDown={(ev) => {
              if (!actief) return;
              ev.preventDefault();
              meld({ soort: "hand" });
            }}
          >
            <circle className={s.knopvlak} cx={900} cy={548} r={30} fill="#2b2f3b" />
            <path
              transform="translate(882 529) scale(0.75)"
              d="M18 22V9.5a3 3 0 0 1 6 0V20l1-.2V17a3 3 0 0 1 6 0v3.5a3 3 0 0 1 5.5 1.6v2.7a3 3 0 0 1 5 2.2V33c0 7-5 12-12 12h-3c-4 0-6.5-1.7-9-5l-6-8a3.1 3.1 0 0 1 4.6-4.1L18 30z"
              fill="#d6d8e1"
            />
          </g>
        )}
        {klaar && (
          <g
            className={actief ? s.vinkje : s.uit}
            role={actief ? "button" : undefined}
            aria-label={actief ? "Klaar" : undefined}
            onPointerDown={(ev) => {
              if (!actief) return;
              ev.preventDefault();
              meld({ soort: "klaar" });
            }}
          >
            <circle cx={900} cy={626} r={30} fill="#4b8af5" />
            <path d="M886 627 l10 10 l17 -19" fill="none" stroke="#ffffff" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}
      </svg>
    </div>
  );
}
