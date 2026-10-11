"use client";

/**
 * Het tegelvlak van het onderdeel Optellen tot 10 (oktober 2026), zoals bij
 * Synthesis: hetzelfde raster en dezelfde getaltegels als het lesscherm, maar
 * met drie dingen die het gewone raster niet kan:
 *
 * - **Bedekken**: een tegel ligt als onderlaag (`onder`, bijvoorbeeld de 10)
 *   en de stukken die het kind erop legt, bedekken hem van onderaf. Wat er
 *   van de onderlaag zichtbaar blijft, is het ontbrekende getal.
 * - **Omtrek**: een lege vorm van een getal (`omtrek`) die het kind met
 *   tegels vult.
 * - **Elke toren apart**: de les bepaalt op welke toren een tegel komt, zodat
 *   er links een totaal en rechts de delen kunnen staan.
 *
 * Daarnaast tekent het vlak zijn eigen som bovenaan (`som`, met een
 * oplichtend vakje `somAan`), zodat er nooit iets over de som heen ligt. Het
 * kind typt het getal in het invulvak links (`l.getal()`, HARDE REGEL 5).
 *
 * Meldt `{ soort: "tegel", n }` als het kind een tegel in het vak zet, en
 * `{ soort: "leeg" }` bij de knop Maak leeg. Alleen als `actief` aan staat.
 * Schrijft niets naar de database.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { Somdeel, Vlakbasis } from "../soort";
import { getalkleur, hoogte, stapel, TEGELKLEUR, vorm, type Hokje } from "../tegels";
import s from "./optellen.module.css";

const CEL = 66;
const KOLOMMEN = 12;
const RASTER_X = 22;
const BAK_X = 900;
const KOLOM_VAN_TOREN = [5, 8, 2];

export type Tegeltoren = {
  /** Tegels die onderop liggen en bedekt kunnen worden (van onder naar boven). */
  onder?: number[];
  /** Een lege vorm van dit getal, om te vullen. */
  omtrek?: number;
  /** De tegels die erop of erin liggen, van onder naar boven. */
  stukken: number[];
  /** Een lichtblauwe rand om de hele toren (één geheel). */
  rand?: boolean;
  /** De bovenste tegel van `stukken` verdwijnt (animatie). */
  wegLaatste?: boolean;
  /** Een andere kolom dan de vaste volgorde (5, 8, 2). */
  kolom?: number;
};

export type Tegelvlakprops = {
  torens: Tegeltoren[];
  bak?: number[];
  /** Alle tegels in de bak omgedraaid, zodat ze in de inham van een oneven tegel passen. */
  om?: boolean;
  slot?: number[];
  /** Het kind mag een tegel pakken. */
  actief?: boolean;
  som?: Somdeel[] | null;
  /** Dit vakje van de som licht op: hier hoort het getal dat het kind nu typt. */
  somAan?: number | null;
  /** `false`: geen raster, alleen de som groot in het midden. */
  raster?: boolean;
  /** De hokjes van één toren worden geteld, tot en met `tot`. `onbedekt`: alleen wat van de onderlaag te zien is. */
  tel?: { toren: number; tot: number; onbedekt?: boolean } | null;
  /** De rode knop Maak leeg onder het raster. */
  leegKnop?: boolean;
  /**
   * Hulp (het handje bij Synthesis): op toren `toren` licht geel omrand op
   * waar tegel `n` zou komen te liggen.
   */
  hint?: { toren: number; n: number } | null;
  /** Het handje links (zoals Synthesis): meldt `{ soort: "hulp" }`. */
  hulpKnop?: boolean;
};

/**
 * Een nieuwe tegel bij de stukken, zonder gat: eerst alle even tegels, dan
 * de oneven. Twee oneven tegels vallen zo in elkaars inham, en de toren heeft
 * dezelfde vorm als de tegel van zijn totaal (4 + 3 ziet eruit als de 7).
 */
export function zetIn(stukken: number[], n: number): number[] {
  const alle = [...stukken, n];
  return [...alle.filter((t) => t % 2 === 0), ...alle.filter((t) => t % 2 === 1)];
}

const sleutel = (h: Hokje) => `${h.k}-${h.r}`;

type Geplaatst = Hokje & { n: number };

function geplaatst(stukken: number[]): Geplaatst[][] {
  return stapel(stukken).map((hokjes, i) => hokjes.map((h) => ({ ...h, n: stukken[i] })));
}

function torenHoogte(t: Tegeltoren): number {
  const rijen = [
    ...stapel(t.onder ?? []).flat(),
    ...(t.omtrek ? vorm(t.omtrek) : []),
    ...stapel(t.stukken).flat(),
  ].map((h) => h.r + 1);
  return Math.max(1, ...rijen);
}

function Hokjevak({ n, x, y, c, nr, extra = "" }: { n: number; x: number; y: number; c: number; nr?: number; extra?: string }) {
  return (
    <div className={`${s.hokje} ${extra}`} style={{ left: x, top: y, width: c, height: c, background: TEGELKLEUR[n] ?? "#cccccc" }}>
      <div className={`${s.gat} ${nr ? s.geteld : ""}`} style={nr ? { fontSize: c * 0.32 } : undefined}>
        {nr ?? ""}
      </div>
    </div>
  );
}

function Tegel({ n, c, om = false }: { n: number; c: number; om?: boolean }) {
  const h = hoogte(n);
  return (
    <div style={{ position: "relative", width: 2 * c, height: h * c }}>
      {vorm(n, om).map((hk) => (
        <Hokjevak key={sleutel(hk)} n={n} x={hk.k * c} y={(h - 1 - hk.r) * c} c={c} />
      ))}
    </div>
  );
}

function legBak(tegels: number[]) {
  const ruimte = 14;
  const rijen = tegels.reduce((a, n) => a + hoogte(n), 0);
  const c = Math.max(14, Math.min(40, Math.floor((620 - ruimte * Math.max(0, tegels.length - 1)) / Math.max(1, rijen))));
  const totaal = rijen * c + ruimte * Math.max(0, tegels.length - 1);
  let y = 360 - totaal / 2;
  return {
    c,
    plekken: tegels.map((n) => {
      const plek = { n, x: BAK_X - c, y, h: hoogte(n) * c };
      y += hoogte(n) * c + ruimte;
      return plek;
    }),
  };
}

/** De som, door het vlak zelf getekend. */
function Som({ delen, aan, groot }: { delen: Somdeel[]; aan?: number | null; groot: boolean }) {
  const maat = groot ? 80 : 54;
  return (
    <div className={s.som} style={{ top: groot ? 300 : 28, height: groot ? 110 : 76, gap: groot ? 64 : 52, fontSize: maat }}>
      {delen.map((d, i) =>
        d.t === "getal" ? (
          <span key={i} style={{ color: getalkleur(d.n) }}>
            {d.n}
          </span>
        ) : d.t === "teken" ? (
          <span key={i} className={s.somteken}>
            {d.s}
          </span>
        ) : (
          <span
            key={i}
            className={`${s.somvak} ${aan === i ? s.somaan : ""}`}
            style={{
              width: groot ? 120 : 90,
              height: groot ? 110 : 76,
              fontSize: maat * 0.9,
              color: d.waarde && /^\d+$/.test(d.waarde) ? getalkleur(Number(d.waarde)) : undefined,
            }}
          >
            {d.waarde ?? ""}
          </span>
        ),
      )}
    </div>
  );
}

export function Tegelvlak({
  torens,
  bak = [],
  om = false,
  slot = [],
  actief = false,
  som = null,
  somAan = null,
  raster = true,
  tel = null,
  leegKnop = false,
  hint = null,
  hulpKnop = false,
  meld,
  schaal,
  metSom,
}: Tegelvlakprops & Vlakbasis) {
  const wortel = useRef<HTMLDivElement>(null);
  const rasterRef = useRef<HTMLDivElement>(null);
  /* x/y: de vinger in punten van het vlak; vanX/vanY: waar het slepen begon, in schermpixels. */
  const [sleep, setSleep] = useState<null | { n: number; x: number; y: number; vanX: number; vanY: number; bewogen: boolean }>(null);
  const [gekozen, setGekozen] = useState<number | null>(null);

  const metBovenSom = !!som || metSom;
  const rasterY = metBovenSom ? 118 : 63;
  const rijen = metBovenSom ? 8 : 9;

  const zetNeer = useCallback(
    (n: number) => {
      setGekozen(null);
      if (actief) meld({ soort: "tegel", n });
    },
    [actief, meld],
  );

  const opRaster = useCallback((x: number, y: number) => {
    const r = rasterRef.current?.getBoundingClientRect();
    return !!r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  }, []);

  useEffect(() => {
    if (!sleep) return;
    const beweeg = (e: PointerEvent) => {
      const r = wortel.current?.getBoundingClientRect();
      const x = r ? (e.clientX - r.left) / schaal : 0;
      const y = r ? (e.clientY - r.top) / schaal : 0;
      const bewogen = Math.hypot(e.clientX - sleep.vanX, e.clientY - sleep.vanY) > 8;
      setSleep((v) => (v ? { ...v, x, y, bewogen: v.bewogen || bewogen } : v));
    };
    const los = (e: PointerEvent) => {
      const bewogen = Math.hypot(e.clientX - sleep.vanX, e.clientY - sleep.vanY) > 8;
      if (bewogen && opRaster(e.clientX, e.clientY)) zetNeer(sleep.n);
      else if (!bewogen) setGekozen((g) => (g === sleep.n ? null : sleep.n));
      setSleep(null);
    };
    window.addEventListener("pointermove", beweeg);
    window.addEventListener("pointerup", los);
    return () => {
      window.removeEventListener("pointermove", beweeg);
      window.removeEventListener("pointerup", los);
    };
  }, [sleep, opRaster, zetNeer, schaal]);

  /* Alle torens staan met hun onderkant op dezelfde rij, zoals op het lesscherm. */
  const hoogst = Math.max(1, ...torens.map(torenHoogte));
  const onderRij = Math.min(rijen - 1, Math.floor((rijen + hoogst) / 2) - 1);
  const bakplek = legBak(bak);
  const plekY = (r: number) => rasterY + (onderRij - r) * CEL;

  return (
    <div ref={wortel} className={s.vlak}>
      {som && <Som delen={som} aan={somAan} groot={!raster} />}

      {raster && (
        <div
          ref={rasterRef}
          style={{ position: "absolute", left: RASTER_X, top: rasterY, width: KOLOMMEN * CEL, height: rijen * CEL }}
          onPointerUp={() => {
            if (gekozen !== null && actief && !sleep) zetNeer(gekozen);
          }}
        >
          <svg width={KOLOMMEN * CEL} height={rijen * CEL} style={{ position: "absolute", inset: 0, overflow: "visible" }} aria-hidden>
            {Array.from({ length: KOLOMMEN + 1 }, (_, i) => (
              <line key={`k${i}`} x1={i * CEL + 0.5} y1={0} x2={i * CEL + 0.5} y2={rijen * CEL} stroke="rgba(160,180,220,0.3)" strokeDasharray="2 3" />
            ))}
            {Array.from({ length: rijen + 1 }, (_, i) => (
              <line key={`r${i}`} x1={0} y1={i * CEL + 0.5} x2={KOLOMMEN * CEL} y2={i * CEL + 0.5} stroke="rgba(160,180,220,0.3)" strokeDasharray="2 3" />
            ))}
          </svg>
        </div>
      )}

      {raster &&
        torens.map((t, ti) => {
          const kolom = t.kolom ?? KOLOM_VAN_TOREN[ti] ?? 5;
          const x0 = RASTER_X + kolom * CEL;
          const onder = geplaatst(t.onder ?? []).flat();
          const stukken = geplaatst(t.stukken);
          const bedekt = new Set(stukken.flat().map(sleutel));
          const omtrek = t.omtrek ? vorm(t.omtrek) : [];
          const omtrekSet = new Set(omtrek.map(sleutel));
          const h = torenHoogte(t);

          /* Welke hokjes geteld worden, van onder naar boven. */
          let telbaar: string[] = [];
          if (tel && tel.toren === ti) {
            const zicht = tel.onbedekt
              ? onder.filter((hk) => !bedekt.has(sleutel(hk)))
              : [...onder.filter((hk) => !bedekt.has(sleutel(hk))), ...stukken.flat()];
            telbaar = zicht.sort((a, b) => a.r - b.r || a.k - b.k).map(sleutel);
          }
          const nummer = (hk: Hokje) => {
            const i = telbaar.indexOf(sleutel(hk));
            return i >= 0 && tel && i < tel.tot ? i + 1 : undefined;
          };

          return (
            /* Doorklikbaar: wie een tegel kiest en dan óp een toren tikt, tikt in het vak. */
            <div key={ti} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
              {/* de lege vorm: donkere hokjes met een lichtblauwe lijn eromheen */}
              {omtrek.map((hk) => (
                <div key={`o${sleutel(hk)}`} className={s.leeghokje} style={{ left: x0 + hk.k * CEL, top: plekY(hk.r), width: CEL, height: CEL }} />
              ))}
              {omtrek.length > 0 && (
                <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }} width="1" height="1" aria-hidden>
                  {omtrek.flatMap((hk) => {
                    const x = x0 + hk.k * CEL;
                    const y = plekY(hk.r);
                    const zijden: [boolean, number, number, number, number][] = [
                      [!omtrekSet.has(`${hk.k}-${hk.r + 1}`), x, y, x + CEL, y],
                      [!omtrekSet.has(`${hk.k}-${hk.r - 1}`), x, y + CEL, x + CEL, y + CEL],
                      [!omtrekSet.has(`${hk.k - 1}-${hk.r}`), x, y, x, y + CEL],
                      [!omtrekSet.has(`${hk.k + 1}-${hk.r}`), x + CEL, y, x + CEL, y + CEL],
                    ];
                    return zijden
                      .filter((z) => z[0])
                      .map((z, i) => <line key={`${sleutel(hk)}-${i}`} x1={z[1]} y1={z[2]} x2={z[3]} y2={z[4]} stroke="#7cc4f0" strokeWidth="2.5" strokeLinecap="round" />);
                  })}
                </svg>
              )}
              {/* de onderlaag */}
              {onder.map((hk) => (
                <Hokjevak key={`u${sleutel(hk)}`} n={hk.n} x={x0 + hk.k * CEL} y={plekY(hk.r)} c={CEL} nr={nummer(hk)} />
              ))}
              {/* de stukken erop */}
              {stukken.map((hokjes, i) => {
                const weg = t.wegLaatste && i === stukken.length - 1;
                return (
                  <div key={`s${i}-${t.stukken[i]}`} className={weg ? s.weg : s.nieuw} style={{ position: "absolute", left: 0, top: 0 }}>
                    {hokjes.map((hk) => (
                      <Hokjevak key={sleutel(hk)} n={hk.n} x={x0 + hk.k * CEL} y={plekY(hk.r)} c={CEL} nr={tel?.onbedekt ? undefined : nummer(hk)} />
                    ))}
                  </div>
                );
              })}
              {hint &&
                hint.toren === ti &&
                (() => {
                  const nieuw = zetIn(t.stukken, hint.n);
                  const plek = stapel(nieuw)[nieuw.lastIndexOf(hint.n)] ?? [];
                  return plek.map((hk) => (
                    <div
                      key={`h${sleutel(hk)}`}
                      className={s.hint}
                      style={{ left: x0 + hk.k * CEL + 3, top: plekY(hk.r) + 3, width: CEL - 6, height: CEL - 6 }}
                    />
                  ));
                })()}
              {t.rand && (
                <div className={s.rand} style={{ left: x0 - 4, top: plekY(h - 1) - 4, width: 2 * CEL + 8, height: h * CEL + 8 }} />
              )}
            </div>
          );
        })}

      {raster && leegKnop && (
        <button
          type="button"
          className={s.knop}
          style={{ left: RASTER_X + (KOLOMMEN * CEL) / 2 - 60, top: rasterY + rijen * CEL + 6, width: 120 }}
          onClick={() => actief && meld({ soort: "leeg" })}
        >
          Maak leeg
        </button>
      )}

      {hulpKnop && (
        <button type="button" className={s.hulp} aria-label="Hulp" onClick={() => meld({ soort: "hulp" })}>
          <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden>
            <path
              d="M8 13V6.5a1.5 1.5 0 0 1 3 0V12M11 12V4.5a1.5 1.5 0 0 1 3 0V12M14 12V5.5a1.5 1.5 0 0 1 3 0V13M17 13V8.5a1.5 1.5 0 0 1 3 0V15c0 4.5-3 7.5-7 7.5-3 0-4.6-1.4-6.2-3.8L4.2 15a1.5 1.5 0 0 1 2.4-1.8L8 15"
              fill="#f2c79a"
              stroke="#8a5a32"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </svg>
          <span>Hulp</span>
        </button>
      )}

      {/* de bak */}
      {bakplek.plekken.map((p) => {
        const opSlot = slot.includes(p.n);
        const pakbaar = actief && !opSlot;
        return (
          <div
            key={p.n}
            className={`${s.baktegel} ${opSlot ? s.slot : !actief ? s.dof : ""} ${pakbaar ? s.pakbaar : ""} ${gekozen === p.n ? s.gekozen : ""}`}
            data-om={om}
            style={{ left: p.x, top: p.y }}
            role={pakbaar ? "button" : undefined}
            aria-label={pakbaar ? `Tegel ${p.n}` : undefined}
            onPointerDown={(e) => {
              if (!pakbaar) return;
              e.preventDefault();
              setSleep({ n: p.n, x: 0, y: 0, vanX: e.clientX, vanY: e.clientY, bewogen: false });
            }}
          >
            <Tegel n={p.n} c={bakplek.c} />
          </div>
        );
      })}

      {/* de tegel onder de vinger */}
      {sleep?.bewogen && (
        <div className={s.spook} style={{ left: sleep.x - CEL, top: sleep.y - (hoogte(sleep.n) * CEL) / 2 }}>
          <Tegel n={sleep.n} c={CEL} om={om} />
        </div>
      )}
    </div>
  );
}
