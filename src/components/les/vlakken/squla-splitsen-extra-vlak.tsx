"use client";

/**
 * Het speelvlak van de EXTRA les Splitsen (squla-splits-splitsen1-1-gouden-extra, 12 november 2026; besluit Sara 21.7).
 * Een nieuw vlak naast de vlakken van de gouden les Splitsen; die blijven zoals ze zijn.
 *
 * De splitsmachine van het draaiboek Splitsen (Part Part Whole, SYNTHESIS-ANALYSE/DRAAIBOEKEN-NIEUW/splitsen.md §0 en stap 7):
 * 1 grote cirkel boven (het TOTAAL), 2 cirkels onder (de DELEN), met lijntjes ertussen. Bij elke cirkel onder een min links en
 * een plus rechts. Elk aantal heeft in de cirkel stippen in een vast patroon (2 kolommen), in de kleur van dat getal (zoals de
 * tegels; BOUWREGELS 2.1, 2.2). Wat het vlak kan:
 *   - `delen`: het aantal stippen in elk deel; `totaal`: een vast totaal, of `null` = het totaal groeit mee (a + b);
 *   - `actief`: welke van de 4 knoppen werken (min0, plus0, min1, plus1); een tik op een knop meldt
 *     `{ soort: "knop", deel, d }` (d = +1 of -1);
 *   - `ring`: een dubbele rand om een deel, het totaal of een knop, alleen als Bliepo het noemt (BOUWREGELS 7.8);
 *   - `kop`: de opdracht linksboven; `lijst`: de gevonden sommen rechtsboven ("5 + 3 = 8");
 *   - `telTotaal`: Bliepo telt de stippen van het totaal (nummers 1 t/m n);
 *   - `hand`: het hulphandje (15.19): wijst naar een knop; het komt vanzelf, nooit als knop;
 *   - `goed` / `fout`: tellers; ophogen = lichtgolf of zacht schudden.
 * Alles in HTML met een CSS-beweging: geen werk elk beeld, dus licht (HARDE REGEL 7). Geen kaders om plaatjes.
 */

import { useEffect, useRef, useState } from "react";
import type { Vlakbasis } from "../soort";
import { getalkleur } from "../tegels";
import s from "./squla-splitsen-extra.module.css";

export type Knop = "min0" | "plus0" | "min1" | "plus1";
export type Ring = "deel0" | "deel1" | "totaal" | Knop | null;
export type Som = { a: number; b: number; t: number };
export type Kop = { voor: string; n?: number; na?: string };

export type SplitsExtraProps = {
  id: string;
  delen: [number, number];
  totaal?: number | null;
  actief?: Knop[];
  ring?: Ring;
  kop?: Kop | null;
  lijst?: Som[];
  telTotaal?: number;
  hand?: Knop | null;
  goed?: number;
  fout?: number;
};

/* Waar alles staat (punten van het vlak, 980 × 720; links van het tekstvak, 15.30). */
const TOT = { x: 380, y: 175, r: 100 };
const DEEL = [{ x: 200, y: 470, r: 92 }, { x: 560, y: 470, r: 92 }];
const KNOP_R = 30;
const KNOPPEN: Record<Knop, { x: number; y: number; d: number; deel: 0 | 1; teken: string }> = {
  min0: { x: 62, y: 470, d: -1, deel: 0, teken: "−" },
  plus0: { x: 338, y: 470, d: 1, deel: 0, teken: "+" },
  min1: { x: 422, y: 470, d: -1, deel: 1, teken: "−" },
  plus1: { x: 698, y: 470, d: 1, deel: 1, teken: "+" },
};

/** Stippen in 2 kolommen, midden in de cirkel; de kleur is die van het aantal (zoals de tegels). */
export function stippen(n: number, r: number): { x: number; y: number }[] {
  const rijen = Math.ceil(n / 2);
  const stap = Math.min(30, (r * 1.5) / Math.max(rijen, 1));
  const uit: { x: number; y: number }[] = [];
  for (let i = 0; i < n; i++) {
    const rij = Math.floor(i / 2);
    const kol = i % 2;
    const inRij = rij === rijen - 1 && n % 2 === 1 ? 1 : 2;
    const dx = inRij === 1 ? 0 : kol === 0 ? -stap / 2 - 2 : stap / 2 + 2;
    uit.push({ x: dx, y: (rij - (rijen - 1) / 2) * stap });
  }
  return uit;
}

const kleurVan = (n: number) => (n === 0 ? "#9aa3c2" : getalkleur(n));

function Cirkel({ x, y, r, n, tel, ring, naam }: { x: number; y: number; r: number; n: number; tel?: number; ring: boolean; naam: string }) {
  const kleur = kleurVan(n);
  const pt = stippen(n, r);
  const d = Math.min(r * 0.3, 14);
  return (
    <g data-cirkel={naam} data-aantal={n}>
      {ring && <circle cx={x} cy={y} r={r + 14} fill="none" stroke="#ffffff" strokeWidth={4} opacity={0.9} data-ring="" />}
      {ring && <circle cx={x} cy={y} r={r + 24} fill="none" stroke="#ffffff" strokeWidth={2} opacity={0.55} />}
      <circle cx={x} cy={y} r={r} fill="rgba(10,25,80,0.45)" stroke={kleur} strokeWidth={6} />
      {pt.map((p, i) => (
        <g key={i}>
          <circle cx={x + p.x} cy={y + p.y} r={d} fill={kleur} stroke="rgba(4,18,60,0.8)" strokeWidth={2} />
          {tel && tel > i && (
            <text x={x + p.x} y={y + p.y + 8} textAnchor="middle" fontSize={22} fontWeight={800} fill="#ffffff" stroke="rgba(4,18,60,1)" strokeWidth={4} paintOrder="stroke" data-nummer="">
              {i + 1}
            </text>
          )}
        </g>
      ))}
    </g>
  );
}

export function SplitsExtraVlak({ id, delen, totaal = null, actief = [], ring = null, kop = null, lijst = [], telTotaal = 0, hand = null, goed = 0, fout = 0, meld }: SplitsExtraProps & Vlakbasis) {
  const [fx, setFx] = useState<"" | "goed" | "fout">("");
  const vorigGoed = useRef(goed);
  const vorigFout = useRef(fout);
  useEffect(() => {
    if (goed === vorigGoed.current) return;
    vorigGoed.current = goed;
    setFx("goed");
    const t = setTimeout(() => setFx(""), 900);
    return () => clearTimeout(t);
  }, [goed]);
  useEffect(() => {
    if (fout === vorigFout.current) return;
    vorigFout.current = fout;
    setFx("fout");
    const t = setTimeout(() => setFx(""), 600);
    return () => clearTimeout(t);
  }, [fout]);
  const t = totaal ?? delen[0] + delen[1];
  const h = hand ? KNOPPEN[hand] : null;
  return (
    <div className={s.vlak} data-splitsen-extra={id}>
      {kop && (
        <div className={s.kop} data-kop="">
          {kop.voor}
          {kop.n !== undefined && (
            <span className={s.kopGetal} style={{ color: kleurVan(kop.n) }}>
              {" "}
              {kop.n}
            </span>
          )}
          {kop.na ? ` ${kop.na}` : ""}
        </div>
      )}
      <svg className={`${s.schema} ${fx === "goed" ? s.golf : fx === "fout" ? s.schud : ""}`} viewBox="0 0 980 720" aria-hidden>
        <line x1={TOT.x} y1={TOT.y + TOT.r} x2={DEEL[0].x} y2={DEEL[0].y - DEEL[0].r} stroke="rgba(255,255,255,0.55)" strokeWidth={4} />
        <line x1={TOT.x} y1={TOT.y + TOT.r} x2={DEEL[1].x} y2={DEEL[1].y - DEEL[1].r} stroke="rgba(255,255,255,0.55)" strokeWidth={4} />
        <Cirkel {...TOT} n={t} tel={telTotaal} ring={ring === "totaal"} naam="totaal" />
        <Cirkel {...DEEL[0]} n={delen[0]} ring={ring === "deel0"} naam="deel0" />
        <Cirkel {...DEEL[1]} n={delen[1]} ring={ring === "deel1"} naam="deel1" />
      </svg>
      {(Object.keys(KNOPPEN) as Knop[]).map((k) => {
        const p = KNOPPEN[k];
        const aan = actief.includes(k);
        return (
          <div key={k} className={s.knopPlek} style={{ left: p.x - KNOP_R, top: p.y - KNOP_R, width: 2 * KNOP_R, height: 2 * KNOP_R }}>
            {ring === k && <span className={s.knopRing} aria-hidden />}
            <button type="button" className={`${s.knop} ${aan ? "" : s.uit}`} disabled={!aan} aria-label={p.d > 0 ? "Een stip erbij" : "Een stip eraf"} data-ding={`${p.d > 0 ? "plus" : "min"}-${p.deel}`} onClick={() => meld({ soort: "knop", deel: p.deel, d: p.d })}>
              {p.teken}
            </button>
          </div>
        );
      })}
      {lijst.length > 0 && (
        <div className={s.lijst} data-lijst="">
          {lijst.map((r, i) => (
            <div key={i} className={s.som}>
              <span style={{ color: kleurVan(r.a) }}>{r.a}</span> + <span style={{ color: kleurVan(r.b) }}>{r.b}</span> = <span style={{ color: kleurVan(r.t) }}>{r.t}</span>
            </div>
          ))}
        </div>
      )}
      {h && (
        <div key={`hand-${hand}`} className={s.hand} style={{ left: h.x + 14, top: h.y + 12 }} aria-hidden data-hulphand="">
          <svg viewBox="0 0 90 120" className={s.handTekening}>
            <g>
              <rect x="34" y="6" width="20" height="62" rx="10" />
              <rect x="16" y="52" width="60" height="56" rx="18" />
              <rect x="52" y="50" width="17" height="30" rx="8" />
              <rect x="64" y="58" width="15" height="28" rx="7" />
              <rect x="8" y="66" width="18" height="30" rx="9" />
            </g>
          </svg>
        </div>
      )}
    </div>
  );
}

/** Op de verzamelkaart: het splitsschema met 5 = 3 + 2 (244 × 190). */
export function KaartSplitsenExtra() {
  return (
    <>
      <line x1={122} y1={74} x2={74} y2={118} stroke="#ffffff" strokeWidth={3} opacity={0.7} />
      <line x1={122} y1={74} x2={170} y2={118} stroke="#ffffff" strokeWidth={3} opacity={0.7} />
      <circle cx={122} cy={52} r={26} fill="none" stroke={kleurVan(5)} strokeWidth={5} />
      <circle cx={74} cy={142} r={24} fill="none" stroke={kleurVan(3)} strokeWidth={5} />
      <circle cx={170} cy={142} r={24} fill="none" stroke={kleurVan(2)} strokeWidth={5} />
      <text x={122} y={61} textAnchor="middle" fontSize={26} fontWeight={800} fill={kleurVan(5)}>5</text>
      <text x={74} y={151} textAnchor="middle" fontSize={24} fontWeight={800} fill={kleurVan(3)}>3</text>
      <text x={170} y={151} textAnchor="middle" fontSize={24} fontWeight={800} fill={kleurVan(2)}>2</text>
    </>
  );
}
