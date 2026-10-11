"use client";

/**
 * Twee tienstroken van Synthesis "Count to 120 · The Next 10" (oktober 2026):
 * elk 2 × 5 vakken, met erboven een groot getal (hoeveel er in die strook
 * gekleurd zijn). Een strook krijgt de kleur van zijn aantal (1 rood, 2
 * oranje, … zoals de tegels); een volle strook wordt lichtroze. Vakken vullen
 * van onder naar boven. Rechts groeit een lijstje met getal en getalwoord.
 *
 * Meldt `{ soort: "tik", strook: 1 | 2, gevuld }` en `{ soort: "klaar" }`.
 */

import type { CSSProperties } from "react";
import type { Vlakbasis } from "../soort";
import { TEGELKLEUR } from "../tegels";
import { Klaarknop } from "./tellen-onderdelen";
import s from "./tellen-stijl.module.css";

export const GETALWOORD: Record<number, string> = {
  10: "tien",
  11: "elf",
  12: "twaalf",
  13: "dertien",
  14: "veertien",
  15: "vijftien",
  16: "zestien",
  17: "zeventien",
  18: "achttien",
  19: "negentien",
  20: "twintig",
};

const ROZE = "#f5c2d3";

export function strookkleur(n: number): string {
  return n >= 10 ? ROZE : (TEGELKLEUR[n] ?? ROZE);
}

export type TienstrokenProps = {
  /** Gekleurde vakken in de eerste strook (0–10). */
  links: number;
  /** Gekleurde vakken in de tweede strook (0–10). */
  rechts: number;
  /** Of de tweede strook er al staat. */
  tweede?: boolean;
  /** Getallen in het lijstje rechts. */
  lijst?: number[];
  /** Dit getal in het lijstje is onderstreept (het getal dat je bouwt). */
  onderstreept?: number | null;
  /** Nummers 1–10 in de eerste strook (bij samen tellen). */
  nummersLinks?: boolean;
  /** Welke strook je kunt aantikken; "bouw" = de tweede, aan en uit. */
  modus?: "links" | "rechts" | "bouw" | null;
  klaarKnop?: boolean;
};

const CEL = 96;
const GAT = 14;
const STROOK_X = [162, 407];
const Y0 = 112;

/** Vak i (0–9): van onder naar boven, per rij eerst links. */
function plek(i: number) {
  const rij = Math.floor(i / 2);
  return { x: (i % 2) * (CEL + GAT), y: (4 - rij) * (CEL + GAT) };
}

function Strook({
  nr,
  aantal,
  tikbaar,
  nummers,
  onTik,
}: {
  nr: 1 | 2;
  aantal: number;
  tikbaar: boolean;
  nummers: boolean;
  onTik: (gevuld: boolean) => void;
}) {
  const kleur = strookkleur(aantal);
  return (
    <>
      <div
        className={s.mono}
        style={{ position: "absolute", left: STROOK_X[nr - 1], top: 6, width: 2 * CEL + GAT, textAlign: "center", fontSize: 84, lineHeight: "96px" }}
        aria-live="polite"
      >
        {aantal}
      </div>
      {Array.from({ length: 10 }, (_, i) => {
        const p = plek(i);
        const gevuld = i < aantal;
        const stijl: CSSProperties = {
          left: STROOK_X[nr - 1] + p.x,
          top: Y0 + p.y,
          width: CEL,
          height: CEL,
          background: gevuld ? kleur : undefined,
        };
        return (
          <button
            key={i}
            type="button"
            disabled={!tikbaar}
            className={`${s.vak} ${gevuld ? "" : s.leeg} ${tikbaar ? s.tikbaar : ""}`}
            style={stijl}
            aria-label={gevuld ? "Gekleurd vak" : "Leeg vak"}
            onClick={() => onTik(gevuld)}
          >
            {nummers && gevuld && (
              <span className={s.nummer} style={{ fontSize: 38, color: "#7a3150", textShadow: "none" }}>
                {i + 1}
              </span>
            )}
          </button>
        );
      })}
    </>
  );
}

export function Tienstroken({
  links,
  rechts,
  tweede = false,
  lijst = [],
  onderstreept = null,
  nummersLinks = false,
  modus = null,
  klaarKnop = false,
  meld,
}: TienstrokenProps & Vlakbasis) {
  return (
    <div className={s.vlak}>
      <Strook nr={1} aantal={links} tikbaar={modus === "links"} nummers={nummersLinks} onTik={(gevuld) => meld({ soort: "tik", strook: 1, gevuld })} />
      {tweede && (
        <div className={s.in}>
          <Strook
            nr={2}
            aantal={rechts}
            tikbaar={modus === "rechts" || modus === "bouw"}
            nummers={false}
            onTik={(gevuld) => meld({ soort: "tik", strook: 2, gevuld })}
          />
        </div>
      )}

      {lijst.length > 0 && (
        <div style={{ position: "absolute", left: 650, top: Y0, width: 230 }}>
          <div style={{ position: "absolute", left: 10, top: 0, width: 2, height: lijst.length * 52 - 12, background: "rgba(200,210,235,0.35)" }} />
          {lijst.map((n, i) => (
            <div key={n} className={s.in} style={{ position: "absolute", left: 0, top: i * 52, height: 40, display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: ROZE, marginLeft: 2 }} />
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: strookkleur(n - 10 || 10) }} />
              <span
                style={{
                  fontSize: 19,
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  borderBottom: onderstreept === n ? "3px solid #ef8d45" : "3px solid transparent",
                  paddingBottom: 2,
                }}
              >
                <span className={s.mono}>{n}</span> – {GETALWOORD[n] ?? ""}
              </span>
            </div>
          ))}
        </div>
      )}

      {klaarKnop && <Klaarknop x={918} y={600} onKlaar={() => meld({ soort: "klaar" })} />}
    </div>
  );
}
