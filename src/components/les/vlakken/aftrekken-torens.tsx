"use client";

/**
 * Twee torens met elk een ruimteschip erboven (Aftrekken tot 10), naar
 * Synthesis "Difference Dimension".
 *
 * Elke toren heeft 10 vakjes. Tik op een ruimteschip: er komt een blok bij.
 * Staat de groene straal aan, tik er dan op: het bovenste blok gaat weg. Met
 * de schuif botsen de torens tegen elkaar: blokken op dezelfde hoogte heffen
 * elkaar op, wat overblijft is het verschil.
 *
 * Het vlak houdt de hoogtes zelf bij en meldt elke verandering:
 * `{ soort: "erbij" | "eraf", kant, links, rechts }`. Verder
 * `{ soort: "klaar" | "hulp", links, rechts }` voor de knoppen en
 * `{ soort: "gebotst", links, rechts }` als de botsing klaar is. Het draaiboek
 * zet nieuwe hoogtes neer met `links`/`rechts` en een nieuwe `zet`.
 */

import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import type { Vlakbasis } from "../soort";
import s from "./aftrekken.module.css";

export type Kant = "links" | "rechts";

export type TorensProps = {
  links: number;
  rechts: number;
  /** Verhoog dit om `links` en `rechts` opnieuw neer te zetten (en een botsing terug te draaien). */
  zet: number;
  /** Op welk ruimteschip het kind mag tikken. */
  ufo?: { links?: boolean; rechts?: boolean };
  /** Hoger dan dit gaat een toren niet (standaard 10). */
  max?: { links?: number; rechts?: number };
  /** Bij welk ruimteschip de groene straal aan staat. */
  straal?: { links?: boolean; rechts?: boolean };
  /** De getallen 1 tot en met 10 naast de torens. */
  cijfers?: boolean;
  /** Knoppen in het midden. */
  knoppen?: { klaar?: string; hulp?: string } | null;
  /** De schuif waarmee de torens botsen. */
  schuif?: boolean;
  /** Een lijst met sommen in het midden; `null` is een leeg vakje. */
  lijst?: (string | null)[] | null;
  /** Of de schepen binnenvliegen (alleen de eerste keer). */
  binnen?: boolean;
  /**
   * De gekoppelde knop tussen de ruimteschepen (naar Synthesis "Same
   * Difference"): één tik doet bij allebei de torens één blok erbij (plus) of
   * eraf (min). Meldt `{ soort: "knoop", links, rechts }`.
   */
  knoop?: "plus" | "min" | null;
  /** Of het kind op de knoop mag tikken. */
  knoopAan?: boolean;
  /** De knoop doet niets meer zodra de oranje toren deze hoogte heeft. */
  knoopTot?: number | null;
  /** Twee kolommen van 10 per toren (tot 20); de volle kolom staat aan de binnenkant. */
  kolommen?: 1 | 2;
};

export const ORANJE = "#ffa41b";
export const PAARS = "#c400ff";

const X: Record<Kant, number> = { links: 300, rechts: 680 };
const KLEUR: Record<Kant, string> = { links: ORANJE, rechts: PAARS };
const BREED = 100;
const HOOG = 43;
const STAP = 49;
const ONDER = 628; // onderkant van het onderste vakje
const SCHUIF = { x: 380, y: 650, b: 220 };
const KNOOP = { x: 490, y: 60, r: 26 };
/** Bij twee kolommen: smallere blokken, de eerste kolom aan de binnenkant. */
const SMAL = 84;
const KOLOMAFSTAND = 46;

function kolomX(kant: Kant, kolom: number, kolommen: 1 | 2) {
  if (kolommen === 1) return X[kant];
  const naarBinnen = kant === "links" ? 1 : -1;
  return X[kant] + (kolom === 0 ? naarBinnen : -naarBinnen) * KOLOMAFSTAND;
}

function vakTop(laag: number) {
  return ONDER - (laag + 1) * STAP + (STAP - HOOG);
}

/** Een eigen ruimteschip: koepel, schotel met lampjes, twee pootjes. */
function Ruimteschip({ kleur }: { kleur: string }) {
  return (
    <svg width="140" height="64" viewBox="0 0 140 64" aria-hidden>
      <ellipse cx="70" cy="24" rx="24" ry="17" fill="#9cc8f0" stroke="#0d1222" strokeWidth="3" />
      <circle cx="70" cy="17" r="6" fill={kleur} />
      <ellipse cx="70" cy="38" rx="64" ry="13" fill="#9aa1ad" stroke="#0d1222" strokeWidth="3" />
      {[-48, -32, -16, 0, 16, 32, 48].map((d) => (
        <circle key={d} cx={70 + d} cy="38" r="3.4" fill={kleur} />
      ))}
      <rect x="44" y="49" width="10" height="9" rx="2" fill="#3a4050" stroke="#0d1222" strokeWidth="2" />
      <rect x="86" y="49" width="10" height="9" rx="2" fill="#3a4050" stroke="#0d1222" strokeWidth="2" />
    </svg>
  );
}

type Fase = "rust" | "schuift" | "op" | "klaar";

export function AftrekkenTorens({
  links,
  rechts,
  zet,
  ufo = {},
  max = {},
  straal = {},
  cijfers = false,
  knoppen = null,
  schuif = false,
  lijst = null,
  binnen = false,
  knoop = null,
  knoopAan = false,
  knoopTot = null,
  kolommen = 1,
  meld,
  schaal,
}: TorensProps & Vlakbasis) {
  const [hoogte, setHoogte] = useState({ links, rechts });
  const [vorigeZet, setVorigeZet] = useState(zet);
  const [fase, setFase] = useState<Fase>("rust");
  const [knop, setKnop] = useState(0); // plek van de schuifknop, 0 tot 1
  const [sleept, setSleept] = useState(false);
  const spoor = useRef<HTMLDivElement>(null);

  if (zet !== vorigeZet) {
    setVorigeZet(zet);
    setHoogte({ links, rechts });
    setFase("rust");
    setKnop(0);
  }

  const bezig = fase !== "rust";
  const grens = kolommen === 2 ? 20 : 10;
  const breed = kolommen === 2 ? SMAL : BREED;

  const verander = (kant: Kant, d: 1 | -1) => {
    if (bezig) return;
    const nu = hoogte[kant] + d;
    if (nu < 0 || nu > Math.min(grens, max[kant] ?? grens)) return;
    const nieuw = { ...hoogte, [kant]: nu };
    setHoogte(nieuw);
    meld({ soort: d > 0 ? "erbij" : "eraf", kant, ...nieuw });
  };

  const knoopTik = () => {
    if (bezig || !knoop || !knoopAan) return;
    const d = knoop === "plus" ? 1 : -1;
    if (knoopTot !== null && (d > 0 ? hoogte.links >= knoopTot : hoogte.links <= knoopTot)) return;
    const nieuw = { links: hoogte.links + d, rechts: hoogte.rechts + d };
    if (Math.min(nieuw.links, nieuw.rechts) < 0 || Math.max(nieuw.links, nieuw.rechts) > grens) return;
    setHoogte(nieuw);
    meld({ soort: "knoop", ...nieuw });
  };

  const bots = () => {
    if (bezig) return;
    setKnop(1);
    setFase("schuift");
    const stand = { ...hoogte };
    setTimeout(() => setFase("op"), 600);
    setTimeout(() => setFase("klaar"), 1300);
    setTimeout(() => meld({ soort: "gebotst", ...stand }), 1700);
  };

  const plekKnop = (e: ReactPointerEvent) => {
    const r = spoor.current?.getBoundingClientRect();
    if (!r) return 0;
    const b = (SCHUIF.b - 44) * schaal;
    return Math.max(0, Math.min(1, (e.clientX - r.left - 22 * schaal) / b));
  };

  const laag = Math.min(hoogte.links, hoogte.rechts);
  const opgeheven = fase === "op" || fase === "klaar";
  const naarBinnen = fase === "schuift" || fase === "op" ? 135 : 0;

  return (
    <div className={s.vlak}>
      {(["links", "rechts"] as Kant[]).map((kant) => {
        const x = X[kant];
        const aantal = hoogte[kant];
        const kantFactor = kant === "links" ? 1 : -1;
        return (
          <div key={kant}>
            {/* het ruimteschip */}
            <button
              type="button"
              className={s.ufo}
              style={{ left: x - 70, top: 28, animation: binnen ? undefined : "none" }}
              data-aan={!!ufo[kant] && !bezig}
              aria-label={ufo[kant] ? `Blok erbij in de ${kant === "links" ? "oranje" : "paarse"} toren` : undefined}
              aria-hidden={ufo[kant] ? undefined : true}
              tabIndex={ufo[kant] ? 0 : -1}
              onClick={() => ufo[kant] && verander(kant, 1)}
            >
              <Ruimteschip kleur={KLEUR[kant]} />
            </button>

            {/* de groene straal: tikken haalt het bovenste blok weg */}
            {straal[kant] && !bezig && (
              <button
                type="button"
                className={s.straal}
                style={{ left: x - 66, top: 86, width: 132, height: 110 }}
                aria-label={`Blok weg uit de ${kant === "links" ? "oranje" : "paarse"} toren`}
                onClick={() => verander(kant, -1)}
              />
            )}

            <div className={s.toren} style={{ transform: `translateX(${naarBinnen * kantFactor}px)` }}>
              {/* lege vakjes (niet tijdens de botsing, zoals bij Synthesis) */}
              {!schuif &&
                Array.from({ length: grens }, (_, i) => (
                  <div
                    key={`v${i}`}
                    className={s.vakje}
                    style={{ left: kolomX(kant, Math.floor(i / 10), kolommen) - breed / 2, top: vakTop(i % 10), width: breed, height: HOOG }}
                  />
                ))}
              {/* de blokken */}
              {Array.from({ length: aantal }, (_, i) => {
                const op = opgeheven && i < laag;
                const rest = fase === "klaar" && i >= laag;
                return (
                  <div
                    key={`b${i}`}
                    className={`${s.blok} ${op ? s.blokop : ""} ${rest ? s.blokrest : ""}`}
                    style={{
                      left: kolomX(kant, Math.floor(i / 10), kolommen) - breed / 2,
                      top: vakTop(i % 10),
                      width: breed,
                      height: HOOG,
                      background: KLEUR[kant],
                    }}
                  />
                );
              })}
              {/* de getallen naast de toren */}
              {cijfers &&
                kolommen === 1 &&
                Array.from({ length: 10 }, (_, i) => (
                  <div
                    key={`c${i}`}
                    className={s.cijfer}
                    style={{
                      left: kant === "links" ? x - BREED / 2 - 40 : x + BREED / 2 + 12,
                      top: vakTop(i) + HOOG / 2,
                      color: KLEUR[kant],
                      opacity: i < aantal ? 1 : 0.45,
                    }}
                  >
                    {i + 1}
                  </div>
                ))}
            </div>
          </div>
        );
      })}

      {/* de gekoppelde knop tussen de ruimteschepen */}
      {knoop && (
        <>
          <svg className={s.knooplijnen} width={980} height={720} aria-hidden>
            <line x1={X.links + 72} y1={KNOOP.y} x2={KNOOP.x - KNOOP.r - 6} y2={KNOOP.y} />
            <line x1={KNOOP.x + KNOOP.r + 6} y1={KNOOP.y} x2={X.rechts - 72} y2={KNOOP.y} />
          </svg>
          <button
            type="button"
            className={s.knoop}
            data-aan={knoopAan && !bezig}
            style={{ left: KNOOP.x - KNOOP.r, top: KNOOP.y - KNOOP.r, width: KNOOP.r * 2, height: KNOOP.r * 2 }}
            disabled={!knoopAan || bezig}
            aria-label={knoop === "plus" ? "Bij allebei een blok erbij" : "Bij allebei een blok eraf"}
            onClick={knoopTik}
          >
            <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden>
              <path d={knoop === "plus" ? "M13 4v18M4 13h18" : "M4 13h18"} stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </button>
        </>
      )}

      <span className="sr-only" aria-live="polite">
        Oranje toren {hoogte.links}, paarse toren {hoogte.rechts}
      </span>

      {/* de lijst met sommen */}
      {lijst && (
        <div className={s.lijst} style={{ left: 490 - 85, top: 150, width: 170 }}>
          {lijst.map((som, i) => (
            <div key={`${i}-${som ?? ""}`} className={s.lijstvak} data-vol={!!som}>
              {som ?? ""}
            </div>
          ))}
        </div>
      )}

      {/* klaar en hulp */}
      {knoppen && !bezig && (
        <div className={s.knoppen} style={{ left: 490, top: lijst ? 560 : 520, flexDirection: "column" }}>
          {knoppen.klaar && (
            <button type="button" className={`${s.knop} ${s.knopblauw}`} onClick={() => meld({ soort: "klaar", ...hoogte })}>
              {knoppen.klaar}
            </button>
          )}
          {knoppen.hulp && (
            <button type="button" className={s.knop} onClick={() => meld({ soort: "hulp", ...hoogte })}>
              {knoppen.hulp}
            </button>
          )}
        </div>
      )}

      {/* de schuif */}
      {schuif && (
        <div ref={spoor} className={s.schuif} style={{ left: SCHUIF.x, top: SCHUIF.y, width: SCHUIF.b }}>
          <div
            role="slider"
            tabIndex={0}
            aria-label="Laat de torens botsen"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(knop * 100)}
            className={`${s.schuifknop} ${sleept ? "" : s.terug}`}
            style={{ left: 3 + knop * (SCHUIF.b - 44) }}
            onPointerDown={(e) => {
              if (bezig) return;
              e.currentTarget.setPointerCapture(e.pointerId);
              setSleept(true);
            }}
            onPointerMove={(e) => {
              if (sleept) setKnop(plekKnop(e));
            }}
            onPointerUp={(e) => {
              if (!sleept) return;
              setSleept(false);
              if (plekKnop(e) > 0.85) bots();
              else setKnop(0);
            }}
            onPointerCancel={() => {
              setSleept(false);
              if (!bezig) setKnop(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "Enter" || e.key === " " || e.key === "End") {
                e.preventDefault();
                bots();
              }
            }}
          />
        </div>
      )}
    </div>
  );
}
