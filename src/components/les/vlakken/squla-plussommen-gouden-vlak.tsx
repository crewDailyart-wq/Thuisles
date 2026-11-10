"use client";

/**
 * Het speelvlak van de GOUDEN LES PLUSSOMMEN (squla-plus-bakkerij-1-gouden, 9 november 2026; BOUWREGELS hoofdstuk 15).
 *
 * Dit is het gewone plusvlak (SqulaPlusVlak, squla-plussommen-vlak.tsx: de bakkerij, de disco, het verbinden en de rij
 * van 10 met stippen) met drie dingen erbij. Het plusvlak zelf en de oude les blijven precies zoals ze zijn; dit vlak
 * geeft alles gewoon door.
 *   - `tel`: samen verder tellen na de 2e fout (draaiboek Plussommen §3 D en de hulproute §3 C.5: het kind doet elke
 *     stap zelf). Op elke plek (een stuk lekkers of een blauwe stip) ligt een onzichtbare knop; een tik meldt
 *     `{ soort: "telTik", index }`. Wat al geteld is, krijgt zijn getal erop (in de kleur van wat er geteld wordt) en
 *     telt niet nog een keer.
 *   - `hand`: het HULPHANDJE (BOUWREGELS 15.19). Het komt vanzelf (de les zet het na ± 6 s stilte), is nooit een knop en
 *     doet niets met muis of vinger. Het wijst naar een plek die ECHT nog geteld moet worden, of naar een som die nog
 *     geen lijn heeft; nooit naar een antwoord (15.17).
 *   - `vinkjes`: bij het verbinden krijgt de gekozen som alleen een vinkje, geen gloed en geen rand (BOUWREGELS 6.5, 7.8a,
 *     T16). Nog een tik haalt het weg.
 * Alles in HTML met een CSS-beweging: geen Phaser-werk elk beeld, dus licht (HARDE REGEL 7).
 */

import type { Vlakbasis } from "../soort";
import { SqulaPlusVlak, type Groep, type PlusProps } from "./squla-plussommen-vlak";
import { rekVakje } from "./squla-plussommen-tekenen";
import s from "./squla-plussommen-gouden.module.css";

export type Punt = { x: number; y: number };
/** Samen tellen: per plek het getal dat erop staat (0 = nog niet geteld). */
export type Tel = { plekken: Punt[]; nummers: number[]; kleur: string; tikbaar: boolean; maat?: number };
/** Het hulphandje: de vingertop staat op `plek` (punten van het vlak, 980 × 720). */
export type Hand = { plek: Punt; sleutel: string };

export type GoudenPlusProps = PlusProps & { tel?: Tel | null; hand?: Hand | null; vinkjes?: Punt[] };

/* ---------- waar staat wat (zelfde rekensom als het plusvlak; daar niet uitgevoerd, dus hier overgenomen) ---------- */

const MIDDEN = { x: 490, y: 400 };
const perRij = (g: Groep) => (g.ding === "croissant" ? 4 : 5);

/**
 * Waar elk stuk lekkers van een groepje ligt (punten van het vlak), en hoe groot een plek is. Zelfde indeling als
 * `bakkerijIndeling` in squla-plussommen-vlak.tsx (zonder sommen eronder). Verandert die indeling, dan ook hier.
 */
export function lekkersPlekken(groepen: Groep[]): { plekken: Punt[][]; cel: number } {
  const sumKol = groepen.reduce((t, g) => t + Math.max(1, Math.min(perRij(g), g.n)), 0);
  const maxRij = Math.max(...groepen.map((g) => Math.ceil(g.n / perRij(g))));
  const cel = Math.max(46, Math.min(100, (900 - 110 * (groepen.length - 1) - 32 * groepen.length) / sumKol, 300 / maxRij));
  const maten = groepen.map((g) => {
    const kol = Math.max(1, Math.min(perRij(g), g.n));
    const rij = Math.ceil(g.n / perRij(g));
    const pad = 16;
    return { kol, rij, pad, b: Math.max(150, kol * cel + 2 * pad), h: rij * cel + 2 * pad };
  });
  const gat = 110;
  const breed = maten.reduce((t, m) => t + m.b, 0) + gat * (groepen.length - 1);
  const cy = 390;
  let x = MIDDEN.x - breed / 2;
  const plekken = groepen.map((g, i) => {
    const m = maten[i];
    const links = x + (m.b - m.kol * cel) / 2;
    const top = cy - m.h / 2 + m.pad;
    const pr = perRij(g);
    x += m.b + gat;
    return Array.from({ length: g.n }, (_, k) => ({ x: links + ((k % pr) + 0.5) * cel, y: top + (Math.floor(k / pr) + 0.5) * cel }));
  });
  return { plekken, cel };
}

/** De plek van stip `k` in de rij van 10 (1 rij), in punten van het vlak. */
export const stipPlek = (k: number): Punt => {
  const q = rekVakje(k, 1);
  return { x: MIDDEN.x + q.x, y: MIDDEN.y + q.y };
};

/** De plek van een somkaart bij het verbinden (zelfde rekensom als `verbindVakken` in het plusvlak). */
export const verbindPlek = (kant: "links" | "rechts", i: number): Punt => ({ x: kant === "links" ? 260 : 720, y: 260 + i * 150 });

/* ---------- het vlak ---------- */

export function GoudenPlusVlak({ tel = null, hand = null, vinkjes = [], ...rest }: GoudenPlusProps & Vlakbasis) {
  const maat = tel?.maat ?? 60;
  return (
    <>
      <SqulaPlusVlak {...rest} />
      {tel &&
        tel.plekken.map((p, i) =>
          tel.nummers[i] > 0 ? (
            <div key={`n${i}`} className={s.nummer} style={{ left: p.x, top: p.y, color: tel.kleur }} aria-hidden data-telnummer={tel.nummers[i]}>
              {tel.nummers[i]}
            </div>
          ) : tel.tikbaar ? (
            <button
              key={`k${i}`}
              type="button"
              className={s.telknop}
              style={{ left: p.x - maat / 2, top: p.y - maat / 2, width: maat, height: maat }}
              aria-label="tel deze"
              data-telplek={i}
              data-ding={`tel-${i}`}
              onClick={() => rest.meld({ soort: "telTik", index: i })}
            />
          ) : null,
        )}
      {vinkjes.map((p, i) => (
        <div key={`v${i}`} className={s.vinkje} style={{ left: p.x + 100, top: p.y - 44 }} aria-hidden>
          <svg viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="18" />
            <path d="M11 21l6 6 12-14" />
          </svg>
        </div>
      ))}
      {hand && (
        <div key={hand.sleutel} className={`${s.hand} ${s.pak}`} style={{ left: hand.plek.x, top: hand.plek.y }} aria-hidden data-hulphand="">
          <svg viewBox="0 0 90 120" className={s.handTekening}>
            <g>
              <rect x="34" y="6" width="20" height="62" rx="10" />
              <rect x="16" y="52" width="60" height="56" rx="18" />
              <rect x="52" y="50" width="17" height="30" rx="8" />
              <rect x="64" y="58" width="15" height="28" rx="7" />
              <rect x="8" y="66" width="18" height="30" rx="9" />
            </g>
            <path d="M54 66v12M66 70v14" className={s.lijn} />
          </svg>
        </div>
      )}
    </>
  );
}
