"use client";

/**
 * Stippen om te splitsen (oktober 2026), naar Synthesis "Add within 10 ·
 * Splitting Sums".
 *
 * Een getal staat als één groepje stippen in beeld, met het getal erboven.
 * Wat het kind kan doen (alleen als `actief` aan staat):
 * - tikken op een groepje: bij `tik: "breek"` valt het helemaal uit elkaar in
 *   losse stippen; bij `tik: "eraf"` springt er één stip af;
 * - een groepje op een ander groepje slepen: ze worden samen één groepje;
 * - met `knoppen`: "Alles los" en "Alles samen".
 *
 * Elk groepje krijgt de kleur van zijn getal en zijn getal erboven, met
 * plustekens ertussen: de som ontstaat vanzelf.
 *
 * Synthesis gebruikt lang indrukken, dubbeltikken en een vak trekken. Dat is
 * lastig voor jonge kinderen; hier is het één tik en twee knoppen.
 *
 * Meldt `{ soort: "verander", groepen }` na elke verandering, en
 * `{ soort: "past" }` zodra de groepjes (in welke volgorde ook) gelijk zijn
 * aan `doel`. Een nieuwe `sleutel` zet de stippen terug op `start`.
 * Schrijft niets naar de database.
 */

import { useEffect, useState } from "react";
import type { Vlakbasis } from "../soort";
import { TEGELKLEUR } from "../tegels";
import s from "./optellen.module.css";

export type Stippenprops = {
  /** De groepjes waarmee het vlak begint. */
  start: number[];
  /** Verander dit getal om opnieuw bij `start` te beginnen. */
  sleutel: number;
  actief?: boolean;
  tik?: "breek" | "eraf";
  /** Het getal boven elk groepje. */
  getallen?: boolean;
  /** De knoppen "Alles los" en "Alles samen". */
  knoppen?: boolean;
  /** Meldt "past" zodra de groepjes hierop lijken. */
  doel?: number[] | null;
  /** Zoveel stippen krijgen een nummer (samen tellen). */
  tel?: number;
  /** Een lijstje sommen linksboven, met een vinkje of kruisje ervoor. */
  lijst?: { som: string; teken?: "goed" | "fout" }[];
};

/** Zijn deze groepjes (in welke volgorde ook) hetzelfde? */
export function zelfdeGroepen(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  const x = [...a].sort((p, q) => p - q);
  const y = [...b].sort((p, q) => p - q);
  return x.every((v, i) => v === y[i]);
}

export function Stippen(props: Stippenprops & Vlakbasis) {
  return <Stippenveld key={props.sleutel} {...props} />;
}

function Stippenveld({
  start,
  actief = false,
  tik = "breek",
  getallen = true,
  knoppen = false,
  doel = null,
  tel = 0,
  lijst = [],
  meld,
  schaal,
  metSom,
}: Stippenprops & Vlakbasis) {
  const [groepen, setGroepen] = useState<number[]>(start);
  const [sleep, setSleep] = useState<null | { i: number; vanX: number; vanY: number; dx: number; dy: number; bewogen: boolean }>(null);
  const [onder, setOnder] = useState<number | null>(null);

  const verander = (nieuw: number[]) => {
    setGroepen(nieuw);
    meld({ soort: "verander", groepen: nieuw });
  };

  /* Zodra de groepjes bij het doel passen, ook als het doel net is gezet. */
  useEffect(() => {
    if (doel && zelfdeGroepen(groepen, doel)) meld({ soort: "past" });
  }, [doel, groepen, meld]);

  /** Welk groepje ligt er onder de vinger? */
  const groepOnder = (x: number, y: number, behalve: number): number | null => {
    for (const el of document.elementsFromPoint(x, y)) {
      const i = (el as HTMLElement).dataset?.groep;
      if (i !== undefined && Number(i) !== behalve) return Number(i);
    }
    return null;
  };

  const tikOp = (i: number) => {
    const n = groepen[i];
    if (n < 2) return;
    if (tik === "breek") verander([...groepen.slice(0, i), ...Array<number>(n).fill(1), ...groepen.slice(i + 1)]);
    else verander([...groepen.slice(0, i), n - 1, 1, ...groepen.slice(i + 1)]);
  };

  const voegSamen = (van: number, naar: number) => {
    const nieuw = [...groepen];
    nieuw[naar] = groepen[naar] + groepen[van];
    nieuw.splice(van, 1);
    verander(nieuw);
  };

  const totaal = groepen.reduce((a, b) => a + b, 0);
  const top = metSom ? 140 : 120;
  let teller = 0;

  return (
    <div className={s.vlak}>
      {lijst.length > 0 && (
        <div className={s.lijst}>
          {lijst.map((r, i) => (
            <div key={i}>
              <span style={{ color: r.teken === "goed" ? "#3fb34f" : "#e0485f" }}>{r.teken === "goed" ? "✓" : r.teken === "fout" ? "✗" : ""}</span>
              {r.som}
            </div>
          ))}
        </div>
      )}

      <div className={s.stippenveld} style={{ top, height: 420 }}>
        {groepen.map((n, i) => {
          const kleur = TEGELKLEUR[n] ?? "#3bbfe6";
          const verschuif = sleep?.i === i && sleep.bewogen ? { transform: `translate(${sleep.dx}px, ${sleep.dy}px)`, zIndex: 5, position: "relative" as const } : undefined;
          return (
            <div key={`${i}-${n}`} style={{ display: "flex", alignItems: "flex-end" }}>
              {i > 0 && <span className={s.plus}>+</span>}
              <div
                className={s.groep}
                data-groep={i}
                data-doel={onder === i}
                role={actief ? "button" : undefined}
                aria-label={actief ? `Groepje van ${n}` : undefined}
                style={verschuif}
                onPointerDown={(e) => {
                  if (!actief) return;
                  e.preventDefault();
                  (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
                  setSleep({ i, vanX: e.clientX, vanY: e.clientY, dx: 0, dy: 0, bewogen: false });
                }}
                onPointerMove={(e) => {
                  if (!sleep || sleep.i !== i) return;
                  const bewogen = sleep.bewogen || Math.hypot(e.clientX - sleep.vanX, e.clientY - sleep.vanY) > 10;
                  setSleep({ ...sleep, dx: (e.clientX - sleep.vanX) / schaal, dy: (e.clientY - sleep.vanY) / schaal, bewogen });
                  setOnder(bewogen ? groepOnder(e.clientX, e.clientY, i) : null);
                }}
                onPointerUp={(e) => {
                  if (!sleep || sleep.i !== i) return;
                  const doelGroep = sleep.bewogen ? groepOnder(e.clientX, e.clientY, i) : null;
                  setSleep(null);
                  setOnder(null);
                  if (!sleep.bewogen) tikOp(i);
                  else if (doelGroep !== null) voegSamen(i, doelGroep);
                }}
                onPointerCancel={() => {
                  setSleep(null);
                  setOnder(null);
                }}
              >
                {getallen && (
                  <span className={s.groepgetal}>{n}</span>
                )}
                <div className={s.stippen} data-een={n === 1}>
                  {Array.from({ length: n }, (_, j) => {
                    const nr = ++teller;
                    const geteld = tel >= nr;
                    return (
                      <span key={j} className={`${s.stip} ${geteld ? s.stipgeteld : ""}`} style={{ background: kleur }}>
                        {geteld ? nr : ""}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {knoppen && (
        <div className={s.knoppen} style={{ top: 600 }}>
          <button
            type="button"
            className={s.grijzeknop}
            disabled={!actief || groepen.every((n) => n === 1)}
            onClick={() => verander(Array<number>(totaal).fill(1))}
          >
            Alles los
          </button>
          <button type="button" className={s.grijzeknop} disabled={!actief || groepen.length === 1} onClick={() => verander([totaal])}>
            Alles samen
          </button>
        </div>
      )}
    </div>
  );
}
