"use client";

/**
 * De robot: de mascotte en tutor van Thuisles (oktober 2026).
 *
 * Bron: ontwerp/mascotte/mascotte.png van de eigenaar. De lichte bestanden in
 * public/mascotte/ maak je opnieuw met `node scripts/maak-mascotte.mjs`. Daarin
 * is de vaste lach van het schermpje gehaald: de ogen en de mond tekent dit
 * bestand er zelf overheen, zodat ze kunnen bewegen.
 *
 * Wat hij doet:
 *   rustig  wiebelt zachtjes heen en weer en knippert af en toe
 *   praat   de mond gaat open en dicht (ook vanzelf zodra de stem klinkt)
 *   blij    juicht: springt op, lachende ogen, sterretjes (bij goed)
 *   denkt   kijkt omhoog, met drie puntjes
 *   troost  leunt naar je toe met zachte ogen
 *
 * Bij "minder beweging" staat hij stil; alleen de mond en ogen veranderen nog.
 * De stijl staat in app/avontuur.css onder "De robot".
 */

import { useSyncExternalStore } from "react";
import type { MaatjeHouding } from "@/lib/maatje/poppetje";
import { abonneerPraten, praatOpServer, praatVos } from "@/lib/stem";

/*
  Het schermpje in het bijgesneden plaatje (953 x 1249), in procenten. Het
  gezicht wordt daar precies overheen gelegd, met een eigen tekenvlak van
  490 x 355 (de pixels van het schermpje).
*/
const SCHERM = { links: 35.4, boven: 17.9, breed: 51.4, hoog: 28.4 };

const GLOED = "#7ff6ff";

export function Robot({
  houding = "rustig",
  praat = false,
  className = "",
}: {
  houding?: MaatjeHouding;
  /** praat hij nu? (de mond beweegt ook vanzelf zodra de stem klinkt) */
  praat?: boolean;
  className?: string;
}) {
  const stemKlinkt = useSyncExternalStore(abonneerPraten, praatVos, praatOpServer);
  const mondBeweegt = praat || houding === "praat" || stemKlinkt;
  const blij = houding === "blij";
  const denkt = houding === "denkt";
  const troost = houding === "troost";

  return (
    <div
      className={`robot robot--${houding} ${mondBeweegt ? "robot--praat" : ""} ${className}`}
      role="img"
      aria-label="De robot"
    >
      <div className="robot__lijf">
        {/* eslint-disable-next-line @next/next/no-img-element -- een plaatje met doorzichtigheid in drie maten; next/image voegt hier niets toe */}
        <img
          src="/mascotte/robot-480.webp"
          srcSet="/mascotte/robot-300.webp 229w, /mascotte/robot-480.webp 366w, /mascotte/robot-720.webp 549w"
          sizes="(min-width: 1024px) 15vw, 30vw"
          alt=""
          draggable={false}
          className="robot__plaatje"
        />

        <svg
          viewBox="0 0 490 355"
          className="robot__gezicht"
          style={{
            left: `${SCHERM.links}%`,
            top: `${SCHERM.boven}%`,
            width: `${SCHERM.breed}%`,
            height: `${SCHERM.hoog}%`,
          }}
          aria-hidden="true"
        >
          <defs>
            <filter id="robot-gloed" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="7" result="w" />
              <feMerge>
                <feMergeNode in="w" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g filter="url(#robot-gloed)" fill={GLOED} stroke={GLOED} strokeLinecap="round" strokeLinejoin="round">
            {/* ogen */}
            {blij ? (
              <g fill="none" strokeWidth="17">
                <path d="M118 158 Q160 108 202 158" />
                <path d="M288 158 Q330 108 372 158" />
              </g>
            ) : troost ? (
              <g fill="none" strokeWidth="17">
                <path d="M120 140 Q160 168 200 140" />
                <path d="M290 140 Q330 168 370 140" />
              </g>
            ) : (
              <g className="robot__ogen" stroke="none">
                <rect x={denkt ? 150 : 132} y={denkt ? 92 : 112} width="56" height="74" rx="26" />
                <rect x={denkt ? 320 : 302} y={denkt ? 92 : 112} width="56" height="74" rx="26" />
              </g>
            )}

            {/* mond */}
            {mondBeweegt ? (
              <g className="robot__mond">
                <path d="M190 220 Q245 210 300 220 Q300 290 245 292 Q190 290 190 220 Z" strokeWidth="6" fillOpacity="0.85" />
              </g>
            ) : blij ? (
              <path d="M170 212 L320 212 Q316 296 245 298 Q174 296 170 212 Z" strokeWidth="6" fillOpacity="0.9" />
            ) : denkt ? (
              <path d="M215 248 L282 240" fill="none" strokeWidth="15" />
            ) : (
              <path d="M180 226 Q245 284 310 226" fill="none" strokeWidth="16" />
            )}
          </g>
        </svg>
      </div>

      {/* nadenken: drie puntjes */}
      {denkt && (
        <span className="robot__puntjes" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      )}

      {/* juichen: sterretjes eromheen */}
      {blij && (
        <span className="robot__sterren" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </span>
      )}
    </div>
  );
}
