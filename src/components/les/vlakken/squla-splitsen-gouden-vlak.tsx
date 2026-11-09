"use client";

/**
 * Het speelvlak van de GOUDEN LES SPLITSEN (squla-splits-splitsen1-1-gouden, 9 november 2026; BOUWREGELS hoofdstuk 15).
 *
 * Dit is het gewone splitsvlak (SqulaSplitsVlak, squla-splitsen-vlak.tsx: het huisje, de zak, het tienvak en het
 * slepen) met één ding erbij: het HULPHANDJE (BOUWREGELS 15.19). Het splitsvlak zelf en de oude les blijven precies zoals
 * ze zijn; dit vlak geeft alles gewoon door.
 *
 * Het handje komt vanzelf (de les zet `hand` na ± 6 s stilte), is nooit een knop en doet niets met muis of vinger
 * (pointer-events: none). Het laat het sleepgebaar zien: van het hoopje naar een vak (`naar`), of alleen "pak er een"
 * (zonder `naar`: het wipt zacht op en neer bij het hoopje). Het wijst nooit naar een antwoord (15.17): de les kiest
 * alleen een leeg vak als doel.
 * Een HTML-laagje met een CSS-beweging (transform): geen Phaser-werk elk beeld, dus licht (HARDE REGEL 7).
 */

import type { Vlakbasis } from "../soort";
import { SqulaSplitsVlak, type SplitsProps } from "./squla-splitsen-vlak";
import s from "./squla-splitsen-gouden.module.css";

export type Punt = { x: number; y: number };
/** Het hulphandje: de vingertop begint bij `van` (punten van het vlak, 980 × 720) en schuift naar `naar`. */
export type Hand = { van: Punt; naar?: Punt | null; sleutel: string };

export type GoudenSplitsProps = SplitsProps & { hand?: Hand | null };

export function GoudenSplitsVlak({ hand = null, ...rest }: GoudenSplitsProps & Vlakbasis) {
  return (
    <>
      <SqulaSplitsVlak {...rest} />
      {hand && (
        <div
          key={hand.sleutel}
          className={`${s.hand} ${hand.naar ? s.sleep : s.pak}`}
          style={{ left: hand.van.x, top: hand.van.y, ["--dx" as string]: `${hand.naar ? hand.naar.x - hand.van.x : 0}px`, ["--dy" as string]: `${hand.naar ? hand.naar.y - hand.van.y : 0}px` }}
          aria-hidden
          data-hulphand=""
        >
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

/**
 * De eindkaart (244 × 190): het huisje zoals in de les, met het totaal WIT in het dak en de delen paars en oranje
 * (kind-test punt 20: op de oude kaart was het totaal geel, in de les wit). De oude kaart (KaartSplitsen) blijft staan.
 */
export function KaartSplitsenGouden() {
  return (
    <>
      <path d="M62 70 L122 26 L182 70 Z" fill="none" stroke="#ffffff" strokeWidth={5} strokeLinejoin="round" />
      <rect x={62} y={70} width={120} height={70} fill="none" stroke="#ffffff" strokeWidth={5} />
      <line x1={122} y1={70} x2={122} y2={140} stroke="#ffffff" strokeWidth={5} />
      <text x={122} y={64} textAnchor="middle" fontSize={26} fontWeight={800} fill="#ffffff">7</text>
      <text x={92} y={116} textAnchor="middle" fontSize={30} fontWeight={800} fill="#c9a2ff">4</text>
      <text x={152} y={116} textAnchor="middle" fontSize={30} fontWeight={800} fill="#ffad5c">3</text>
    </>
  );
}
