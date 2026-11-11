"use client";

/**
 * Het speelvlak van de GOUDEN LES PATRONEN (squla-vormen-patronen-1-gouden, 11 november 2026; BOUWREGELS hoofdstuk 15).
 *
 * Dit is het gewone vormen-vlak (SqulaVormenVlak, squla-vormen-vlak.tsx: kralen, dingen, vormen, de ketting en de puzzel,
 * in Phaser) met een paar dingen erbovenop, zoals de gouden les Geld. Het oude vlak en de oude les blijven zoals ze zijn;
 * dit vlak geeft alles door, maar
 *   - er gaat geen `gekozen`, `goedIds`, `uit` of `fout` naar het oude vlak: daar zou een gloed om de keuze komen, de keuze
 *     vaag worden of alles schudden (BOUWREGELS 5.3, 6.5, 7.6, 7.8a). Bij goed alleen de lichtgolf (`goed`, 7.6). Het rode
 *     rondje om wat Bliepo noemt komt van het oude vlak zelf (`licht`);
 *   - `gouden: true` naar het oude vlak: de ketting gaat niet op slot als hij vol is (nakijken met het vinkje) en een
 *     puzzelstukje dat vastklikt wordt gemeld (alleen met die optie; de oude lessen geven hem niet mee);
 *   - `kies`: de keuzes om aan te tikken. Een tik zet een VINKJE op de keuze (nog een tik haalt het weg; een andere keuze
 *     neemt het over). Meldt `{ soort: "vormKies", id }`;
 *   - `hulphand`: het HULPHANDJE (15.19): komt vanzelf, is nooit een knop, alleen bij opdrachten.
 * Het hele vlak staat iets kleiner, vanaf de linkerkant (vaste zones, 15.30; keuring Meer-minder): zo blijft alles links
 * van het vaste tekstvak. Alles erbovenop in HTML met CSS: geen Phaser-werk elk beeld (HARDE REGEL 7). Maten in punten
 * van het vlak (980 × 720).
 */

import { useEffect, useRef } from "react";
import type { Vlakbasis } from "../soort";
import { SqulaVormenVlak, type VormenProps } from "./squla-vormen-vlak";
import { zegKeuze } from "@/lib/stem";
import s from "./squla-vormen-gouden.module.css";

export type Punt = { x: number; y: number };
export type Hand = { plek: Punt; sleutel: string };
/** Een keuze om aan te tikken: waar het vak staat (midden, breedte, hoogte) en wat er hardop bij mag (alleen een woord). */
export type Keuzeplek = { id: string; x: number; y: number; b: number; h: number; aria: string };

export type GoudenVormenProps = VormenProps & {
  kies?: { gekozen: string | null; tikbaar: string[]; plekken: Keuzeplek[] } | null;
  hulphand?: Hand | null;
};

/** Hoeveel kleiner het hele vlak staat, vanaf de linkerkant (zie boven). */
export const KLEINER = 0.84;

export function GoudenVormenVlak({ kies = null, hulphand = null, ...rest }: GoudenVormenProps & Vlakbasis) {
  const { meld } = rest;
  const klok = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(klok.current), []);
  return (
    <div className={s.wortel} style={{ transform: `scale(${KLEINER})`, transformOrigin: "0 50%" }} data-vormen-gouden="">
      <SqulaVormenVlak {...rest} gouden gekozen={[]} goedIds={[]} uit={[]} fout={0} />
      {kies &&
        kies.plekken.map((k, i) => {
          const aan = kies.gekozen === k.id;
          const mag = kies.tikbaar.includes(k.id);
          return (
            <button
              key={`k-${i}-${k.id}`}
              type="button"
              className={s.kaart}
              style={{ left: k.x - k.b / 2, top: k.y - k.h / 2, width: k.b, height: k.h }}
              data-ding={k.id}
              /* Een gekozen keuze heeft geen data-plek: dan tikt de speelcontrole de volgende aan (geleerd bij Getallenlijn). */
              data-plek={mag && !aan ? "keuze" : undefined}
              data-gekozen={aan ? "" : undefined}
              disabled={!mag}
              aria-label={k.aria}
              aria-pressed={aan}
              onMouseEnter={() => {
                clearTimeout(klok.current);
                /* Een keuze die een woord is, wordt bij aanwijzen voorgelezen (3.5); kleuren en vormen niet (dat zou het antwoord zeggen). */
                if (mag) klok.current = setTimeout(() => zegKeuze(k.aria), 300);
              }}
              onMouseLeave={() => clearTimeout(klok.current)}
              onClick={() => {
                clearTimeout(klok.current);
                if (mag) meld({ soort: "vormKies", id: k.id });
              }}
            >
              {aan && <Vinkje />}
            </button>
          );
        })}
      {hulphand && (
        <div key={hulphand.sleutel} className={`${s.hand} ${s.tikGebaar}`} style={{ left: hulphand.plek.x, top: hulphand.plek.y }} aria-hidden data-hulphand="">
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

function Vinkje() {
  return (
    <span className={s.vinkje} aria-hidden data-vinkje="">
      <svg viewBox="0 0 24 24">
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    </span>
  );
}
