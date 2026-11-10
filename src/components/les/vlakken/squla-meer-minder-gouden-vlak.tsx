"use client";

/**
 * Het speelvlak van de GOUDEN LES MEER-MINDER (squla-meer-minder-evenveel2-1-gouden, 10 november 2026; BOUWREGELS
 * hoofdstuk 15).
 *
 * Dit is het gewone meer-minder-vlak (SqulaMeerMinder, squla-meer-minder-vlak.tsx: de kralen en de kaarten met koekjes,
 * in Phaser) met een paar dingen erbovenop. Het vlak zelf en de oude les blijven precies zoals ze zijn; dit vlak geeft
 * alles door, maar zet de eigen tikknoppen van het oude vlak uit (`actief` blijft false), omdat die de kaart laten
 * oplichten (BOUWREGELS 6.5, 7.8a: een gekozen groep krijgt alleen een vinkje, geen gloed).
 *   - `kaarten`: de kaarten om op te tikken. `soort: "kies"`: een tik zet een VINKJE op die kaart (nog een tik haalt
 *     het weg, een andere kaart neemt het over); de les kijkt na met het vinkje van het lesscherm (draaiboek §2 stap 2:
 *     tik + vinkje). `soort: "samen"`: bij het samen tellen tikt het kind de kaart met het grootste getal (de kleine stap).
 *     Een tik meldt `{ soort: "kaartKies", vak }`.
 *   - `tellers`: het getal boven elke groep (draaiboek §3 A.5: "boven elk rooster een getal dat meetelt"), in de kleur
 *     van de voorwerpen (BOUWREGELS 2.2). Alleen bij het samen tellen (2e fout), nooit zolang de vraag nog open is.
 *   - `kraal`: bij het samen tellen van de kralen de knop op de VOLGENDE kraal die het kind moet tikken (de rest doet
 *     niets, zoals bij Synthesis: draaiboek §3 G). Meldt `{ soort: "kraalTik", index }`.
 *   - `hulphand`: het HULPHANDJE (15.19): komt vanzelf (de les zet het na ± 6 s stilte), is nooit een knop, en wijst alleen
 *     bij het samen tellen naar wat het kind moet doen; nooit bij een keuze (15.17).
 * De getallen die het oude vlak achter de rijen zet (geel) staan hier niet: het getal staat boven de groep, in de kleur
 * van de voorwerpen. Alles in HTML met een CSS-beweging: geen Phaser-werk elk beeld (HARDE REGEL 7). Maten in punten
 * van het vlak (980 × 720).
 */

import { useMemo } from "react";
import type { Vlakbasis } from "../soort";
import { SqulaMeerMinder, mmIndeling, type MMOpgave, type MMProps } from "./squla-meer-minder-vlak";
import s from "./squla-meer-minder-gouden.module.css";
import oud from "./squla-meer-minder.module.css";

export type Punt = { x: number; y: number };
export type Kaarten = { soort: "kies" | "samen"; gekozen: number | null; tikbaar: boolean };
export type Hand = { plek: Punt; sleutel: string };

export type GoudenMMProps = MMProps & {
  kaarten?: Kaarten | null;
  tellers?: (number | null)[] | null;
  tellerKleur?: string;
  kraal?: { volgende: number } | null;
  /** Het hulphandje (niet `hand`: dat is in het oude vlak het lichtje bij slepen). */
  hulphand?: Hand | null;
};

const staand = () => typeof window !== "undefined" && window.innerHeight > window.innerWidth;

/** Waar de dingen staan (punten van het vlak), uit dezelfde indeling als het oude vlak. */
export function mmPlekken(o: MMOpgave | null) {
  if (!o) return { kaarten: [], items: [], boven: [] as Punt[] };
  const ind = mmIndeling(o, staand());
  const kaarten = ind.vakken.filter((v) => v.soort === "kaart");
  const items: (Punt & { cel: number })[] = [];
  const boven: Punt[] = [];
  for (const v of ind.vakken) {
    const mx = v.x + v.b / 2;
    const my = v.y + v.h / 2;
    const gp = v.groep;
    if (v.soort === "groep" && gp) {
      for (const p of gp.plekken) items.push({ x: mx + p.x, y: my + p.y, cel: gp.cel });
      const top = Math.min(...gp.plekken.map((p) => p.y)) - gp.cel / 2;
      boven.push({ x: mx, y: my + top - 44 });
    } else boven.push({ x: mx, y: v.y - 34 });
  }
  return { kaarten, items, boven };
}

export function GoudenMMVlak({ kaarten = null, tellers = null, tellerKleur = "#ffffff", kraal = null, hulphand = null, ...rest }: GoudenMMProps & Vlakbasis) {
  const sleutel = rest.opgave ? JSON.stringify(rest.opgave) : "";
  const plek = useMemo(() => mmPlekken(sleutel ? (JSON.parse(sleutel) as MMOpgave) : null), [sleutel]);
  return (
    <div className={s.wortel}>
      {/* De gele getallen achter de rijen van het oude vlak niet: hier staat het getal boven de groep, in de kleur van de voorwerpen. */}
      <style>{`.${s.wortel} .${oud.rijgetal}{display:none}`}</style>
      <SqulaMeerMinder {...rest} actief={false} bordjes={null} />
      {kaarten &&
        plek.kaarten.map((v, k) => (
          <button
            key={`${sleutel}-${k}`}
            type="button"
            className={s.kaart}
            style={{ left: v.x, top: v.y, width: v.b, height: v.h }}
            data-ding={`kaart-${k}`}
            data-plek={kaarten.soort}
            data-gekozen={kaarten.gekozen === k ? "" : undefined}
            disabled={!kaarten.tikbaar}
            aria-label={`Kaart ${k + 1}`}
            aria-pressed={kaarten.gekozen === k}
            onClick={() => kaarten.tikbaar && rest.meld({ soort: "kaartKies", vak: k })}
          >
            {kaarten.gekozen === k && (
              <span className={s.vinkje} aria-hidden data-vinkje="">
                <svg viewBox="0 0 24 24">
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              </span>
            )}
          </button>
        ))}
      {tellers?.map((n, i) =>
        n === null || n === undefined || !plek.boven[i] ? null : (
          <div key={`t-${i}`} className={s.teller} style={{ left: plek.boven[i].x, top: plek.boven[i].y, color: tellerKleur }} aria-hidden data-teller={n}>
            {n}
          </div>
        ),
      )}
      {kraal && plek.items[kraal.volgende] && (
        <button
          key={`k-${kraal.volgende}`}
          type="button"
          className={s.kraal}
          style={{ left: plek.items[kraal.volgende].x, top: plek.items[kraal.volgende].y, width: Math.max(56, plek.items[kraal.volgende].cel), height: Math.max(56, plek.items[kraal.volgende].cel) }}
          data-ding={`kraal-${kraal.volgende}`}
          aria-label="tel deze kraal"
          onClick={() => rest.meld({ soort: "kraalTik", index: kraal.volgende })}
        />
      )}
      {hulphand && (
        <div key={hulphand.sleutel} className={`${s.hand} ${s.pak}`} style={{ left: hulphand.plek.x, top: hulphand.plek.y }} aria-hidden data-hulphand="">
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
    </div>
  );
}

/** De plek van een kaart en van een kraal, voor het hulphandje (in de lege ruimte ernaast; geleerd bij Tellen). */
export function kaartPlek(o: MMOpgave, k: number): Punt | null {
  const v = mmPlekken(o).kaarten[k];
  return v ? { x: v.x + v.b * 0.78, y: v.y + v.h * 0.78 } : null;
}
export function kraalPlek(o: MMOpgave, i: number): Punt | null {
  const p = mmPlekken(o).items[i];
  return p ? { x: p.x + p.cel * 0.3, y: p.y + p.cel * 0.35 } : null;
}
