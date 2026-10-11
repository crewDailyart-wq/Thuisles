"use client";

/**
 * Het kleurenrooster van Synthesis "Count to 120 · Color Count" (oktober 2026):
 * 3 rijen van 7 grote vierkanten in zes kleuren, met een schaduw eronder.
 *
 * - Bij een telvraag staan de cijfers 0–4 boven en 5–9 onder het rooster; het
 *   kind tikt het goede cijfer aan (`modus: "cijfer"`).
 * - Bij samen tellen worden de andere kleuren donker (`fel`) en krijgen de
 *   vakken om de beurt een nummer (`nummers`).
 * - Bij zelf maken is het rooster leeg, staan er verfpotjes boven en kleurt
 *   een tik een vak (`modus: "inkleuren"`).
 *
 * Het vlak bewaart zelf niets: het draaiboek zegt wat er staat, het vlak meldt
 * alleen tikken: `kleur` (een vak in modus "kleur"), `cijfer`, `vakje`, `verf`
 * en `klaar`.
 */

import type { CSSProperties } from "react";
import type { Vlakbasis } from "../soort";
import { Klaarknop } from "./tellen-onderdelen";
import s from "./tellen-stijl.module.css";

export type Kleur = "rood" | "oranje" | "geel" | "groen" | "blauw" | "paars";

/** Gemeten op de screenshots van Synthesis. */
export const KLEURCODE: Record<Kleur, string> = {
  rood: "#e3325c",
  oranje: "#ef8d45",
  geel: "#fcdc33",
  groen: "#55b85d",
  blauw: "#5c75d8",
  paars: "#9d3bb7",
};

export type KleurroosterProps = {
  /** 21 vakken, per rij van links naar rechts; `null` = leeg vak. */
  vakjes: (Kleur | null)[];
  /** Alleen deze kleuren fel, de rest donker; `null` = alles fel. */
  fel?: Kleur[] | null;
  /** Een witte rand om de vakken van deze kleuren. */
  rand?: Kleur[];
  /** Nummer per vak (index → nummer), bij samen tellen. */
  nummers?: Record<number, number>;
  /** De cijfers 0–9 boven en onder het rooster. */
  cijfers?: boolean;
  /** Eén cijfer gekleurd, met een driehoekje. */
  cijferMarkering?: { n: number; kleur: Kleur } | null;
  /** Wat een tik doet; `null` = niets. */
  modus?: "kleur" | "cijfer" | "inkleuren" | null;
  /** Verfpotjes boven het rooster. */
  verf?: Kleur[] | null;
  gekozenVerf?: Kleur | null;
  klaarKnop?: boolean;
};

const CEL = 96;
const GAT = 14;
const X0 = (980 - (7 * CEL + 6 * GAT)) / 2;
const Y0 = 170;
const MIDDEN = 490;

function cijferPlek(n: number) {
  const kolom = n % 5;
  return { x: MIDDEN + (kolom - 2) * 152, y: n < 5 ? 26 : 556 };
}

export function Kleurrooster({
  vakjes,
  fel = null,
  rand = [],
  nummers = {},
  cijfers = false,
  cijferMarkering = null,
  modus = null,
  verf = null,
  gekozenVerf = null,
  klaarKnop = false,
  meld,
}: KleurroosterProps & Vlakbasis) {
  return (
    <div className={s.vlak}>
      {vakjes.map((k, i) => {
        const r = Math.floor(i / 7);
        const c = i % 7;
        const tikbaar = (modus === "kleur" && k !== null) || modus === "inkleuren";
        const dof = k !== null && fel !== null && !fel.includes(k);
        const stijl: CSSProperties = {
          left: X0 + c * (CEL + GAT),
          top: Y0 + r * (CEL + GAT),
          width: CEL,
          height: CEL,
          background: k ? KLEURCODE[k] : undefined,
        };
        const nr = nummers[i];
        return (
          <button
            key={i}
            type="button"
            disabled={!tikbaar}
            className={`${s.vak} ${k ? "" : s.leeg} ${dof ? s.dof : ""} ${tikbaar ? s.tikbaar : ""} ${k && rand.includes(k) ? s.rand : ""}`}
            style={stijl}
            aria-label={k ? `Vak, ${k}` : "Leeg vak"}
            onClick={() => {
              if (modus === "kleur" && k) meld({ soort: "kleur", kleur: k, index: i });
              else if (modus === "inkleuren") meld({ soort: "vakje", index: i });
            }}
          >
            {nr !== undefined && (
              <span key={nr} className={s.nummer}>
                {nr}
              </span>
            )}
          </button>
        );
      })}

      {cijfers &&
        Array.from({ length: 10 }, (_, n) => {
          const p = cijferPlek(n);
          const gemarkeerd = cijferMarkering?.n === n;
          const kleur = gemarkeerd ? KLEURCODE[cijferMarkering.kleur] : "#ffffff";
          return (
            <button
              key={n}
              type="button"
              disabled={modus !== "cijfer"}
              className={`${s.cijfer} ${modus === "cijfer" ? s.tikbaar : ""}`}
              style={{ left: p.x - 45, top: p.y, color: kleur }}
              aria-label={`${n}`}
              onClick={() => meld({ soort: "cijfer", n })}
            >
              {n}
              {gemarkeerd && (
                <svg
                  width="22"
                  height="14"
                  viewBox="0 0 22 14"
                  style={{ position: "absolute", left: 34, top: n < 5 ? 88 : -14, transform: n < 5 ? "rotate(180deg)" : undefined }}
                  aria-hidden
                >
                  <path d="M11 1L21 13H1z" fill={kleur} />
                </svg>
              )}
            </button>
          );
        })}

      {verf &&
        verf.map((k, i) => (
          <button
            key={k}
            type="button"
            className={`${s.verf} ${gekozenVerf === k ? s.verfGekozen : ""}`}
            style={{ left: MIDDEN + (i - (verf.length - 1) / 2) * 130 - 34, top: 50, background: KLEURCODE[k] }}
            aria-label={`Verf, ${k}`}
            aria-pressed={gekozenVerf === k}
            onClick={() => meld({ soort: "verf", kleur: k })}
          />
        ))}

      {klaarKnop && <Klaarknop x={MIDDEN} y={540} onKlaar={() => meld({ soort: "klaar" })} />}
    </div>
  );
}
