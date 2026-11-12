"use client";

/**
 * Het speelvlak van de EXTRA les Tellen (squla-tellen-fruit-1-gouden-extra, 12 november 2026; besluit Sara 20.3).
 * Een nieuw vlak naast de vlakken van de gouden les Tellen; die blijven zoals ze zijn.
 *
 * Een rooster van fruit dat door elkaar ligt (het "kleurenrooster" van het draaiboek Tellen, stap 5 t/m 9, met fruit in
 * plaats van gekleurde vakjes). Wat dit vlak kan:
 *   - `cellen`: per plek een soort fruit, of leeg (`null`, een stippelrondje om in te tikken);
 *   - `nummers`: per plek het nummer dat erbij staat (0 = geen), in de kleur van het fruit (BOUWREGELS 2.1, 2.2);
 *   - `dof`: per plek gedimd (de rest van het fruit tijdens een telronde);
 *   - `stipjes`: de telhulp van het draaiboek: een tik zet een zwart stipje op een stuk fruit, nog een tik haalt het weg
 *     (blijft in dit vlak zelf; de les merkt er niets van);
 *   - `tikbaar`: per plek een (onzichtbare) knop; een tik meldt `{ soort: "celTik", index }`;
 *   - `lijst`: het lijstje (bij maken en bij het lijstje): per soort het aantal in de kleur van het fruit; een tik op een
 *     regel kiest de "verf" (meldt `{ soort: "verfTik", fruit }`); de gekozen regel heeft een witte rand;
 *   - `hand`: het hulphandje (15.19): wijst naar een plek; het komt vanzelf, nooit als knop;
 *   - `goed` / `fout`: tellers; ophogen = lichtgolf of zacht schudden.
 * Alles in HTML met een CSS-beweging: geen werk elk beeld, dus licht (HARDE REGEL 7). Geen kaders om plaatjes.
 */

import { useEffect, useRef, useState } from "react";
import type { Vlakbasis } from "../soort";
import { voorwerpUrl } from "../voorwerpen";
import { KLEUR, VASTE_KLEUR, type Soort } from "./squla-tellen-tekenen";
import s from "./squla-tellen-extra.module.css";

export type ExtraCel = Soort | null;
export type LijstRegel = { soort: Soort; n: number };

export type TelExtraProps = {
  id: string;
  kolommen: number;
  cellen: ExtraCel[];
  nummers?: number[];
  dof?: boolean[];
  stipjes?: boolean;
  tikbaar?: boolean[];
  lijst?: LijstRegel[] | null;
  /** De soort die nu "verf" is (witte rand om de regel in het lijstje). */
  verf?: Soort | null;
  /** Mag het kind een regel van het lijstje kiezen? */
  verfKiezen?: boolean;
  hand?: number | null;
  goed?: number;
  fout?: number;
};

/** Waar het rooster staat (punten van het vlak, 980 × 720; het fruit blijft links van het tekstvak, 15.30). */
const X_MIDDEN = 450;
const RASTER_TOP = 215;

export function maatVan(kolommen: number) {
  const b = Math.min(100, Math.floor(820 / kolommen));
  return { b, h: Math.round(b * 1.22), fruit: Math.round(b * 0.74) };
}

export function celPlek(i: number, kolommen: number) {
  const m = maatVan(kolommen);
  const x0 = X_MIDDEN - (kolommen * m.b) / 2;
  return { x: x0 + (i % kolommen) * m.b + m.b / 2, y: RASTER_TOP + Math.floor(i / kolommen) * m.h + m.h / 2 };
}

export function TelExtraVlak({ id, kolommen, cellen, nummers = [], dof = [], stipjes = false, tikbaar = [], lijst = null, verf = null, verfKiezen = false, hand = null, goed = 0, fout = 0, meld }: TelExtraProps & Vlakbasis) {
  const m = maatVan(kolommen);
  const [stip, setStip] = useState<Set<number>>(new Set());
  const [fx, setFx] = useState<"" | "goed" | "fout">("");
  const vorigId = useRef(id);
  const vorigGoed = useRef(goed);
  const vorigFout = useRef(fout);

  /* Een nieuw rooster: de stipjes van het vorige gaan weg. */
  useEffect(() => {
    if (vorigId.current !== id) {
      vorigId.current = id;
      setStip(new Set());
    }
  }, [id]);
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

  const rijen = Math.ceil(cellen.length / kolommen);
  const plekH = hand != null && hand >= 0 && hand < cellen.length ? celPlek(hand, kolommen) : null;

  return (
    <div className={s.vlak} data-tellen-extra="">
      {lijst && (
        <div className={s.lijst} data-lijst="">
          {lijst.map((r) => {
            const kleur = KLEUR[VASTE_KLEUR[r.soort]];
            const gekozen = verf === r.soort;
            const kop = (
              <>
                <span className={s.lijstGetal} style={{ color: kleur }}>
                  {r.n}
                </span>
                <span className={s.lijstKruis}>×</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className={s.lijstFruit} src={voorwerpUrl(r.soort)} alt="" draggable={false} />
              </>
            );
            return verfKiezen ? (
              <button key={r.soort} type="button" className={`${s.regel} ${s.regelKnop} ${gekozen ? s.gekozen : ""}`} data-ding={`verf-${r.soort}`} aria-label={`Kies ${r.soort}`} aria-pressed={gekozen} onClick={() => meld({ soort: "verfTik", fruit: r.soort })}>
                {kop}
                {gekozen && <span className={s.vink} aria-hidden>✓</span>}
              </button>
            ) : (
              <div key={r.soort} className={s.regel}>
                {kop}
              </div>
            );
          })}
        </div>
      )}
      <div className={`${s.rooster} ${fx === "goed" ? s.golf : fx === "fout" ? s.schud : ""}`} style={{ height: rijen * m.h }}>
        {cellen.map((c, i) => {
          const p = celPlek(i, kolommen);
          const kleur = c ? KLEUR[VASTE_KLEUR[c]] : "#ffffff";
          const nr = nummers[i] ?? 0;
          const knop = tikbaar[i];
          const stipt = stip.has(i);
          return (
            <div key={`${id}-${i}`} className={`${s.cel} ${dof[i] ? s.dof : ""}`} style={{ left: p.x - m.b / 2, top: p.y - m.h / 2 - RASTER_TOP, width: m.b, height: m.h }} data-cel={i} data-soort={c ?? "leeg"}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {c ? <img className={s.fruit} style={{ width: m.fruit, height: m.fruit }} src={voorwerpUrl(c)} alt="" draggable={false} /> : <span className={s.leeg} style={{ width: m.fruit * 0.82, height: m.fruit * 0.82 }} />}
              {nr > 0 && (
                <span className={s.nummer} style={{ color: kleur }} aria-hidden data-nummer="">
                  {nr}
                </span>
              )}
              {stipt && <span className={s.stip} aria-hidden data-stip="" />}
              {(knop || stipjes) && (
                <button
                  type="button"
                  className={s.tik}
                  aria-label={knop ? "Tik op dit vakje" : "Zet een stipje"}
                  data-ding={`cel-${i}`}
                  onClick={() => {
                    if (knop) meld({ soort: "celTik", index: i });
                    else
                      setStip((o) => {
                        const n = new Set(o);
                        if (n.has(i)) n.delete(i);
                        else n.add(i);
                        return n;
                      });
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
      {plekH && (
        <div key={`hand-${hand}`} className={s.hand} style={{ left: plekH.x + 18, top: plekH.y + 14 }} aria-hidden data-hulphand="">
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

/** Op de verzamelkaart: een rijtje van 4 soorten fruit in rondjes met de nummers 4, 7 en 10 (244 × 190). */
export function KaartTellenExtra() {
  const kleuren = [KLEUR.rood, KLEUR.groen, KLEUR.paars];
  const aantallen = [4, 7, 10];
  return (
    <>
      {aantallen.map((a, r) => (
        <g key={r}>
          {Array.from({ length: Math.min(a, 5) }, (_, k) => (
            <circle key={k} cx={34 + k * 30} cy={52 + r * 42} r={12} fill={kleuren[r]} stroke="#ffffff" strokeWidth={2.5} />
          ))}
          <text x={196} y={60 + r * 42} fontSize={24} fontWeight={800} fill={kleuren[r]}>
            {a}
          </text>
        </g>
      ))}
    </>
  );
}
