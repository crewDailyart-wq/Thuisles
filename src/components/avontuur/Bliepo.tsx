"use client";

/**
 * Bliepo: de robot, mascotte en tutor (oktober 2026). Zo heet hij sinds
 * 18 oktober 2026 (keuze eigenaar).
 *
 * Bron: ontwerp/mascotte/bliepo.png van de eigenaar. De lichte bestanden in
 * public/mascotte/ maak je opnieuw met `node scripts/maak-bliepo.mjs`. Daarin
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
 *
 * Sinds 18 oktober 2026 (keuze eigenaar) is Bliepo in de lessen en oefeningen
 * de witte robot uit het 3D-model, als plaatje zonder lijntje op zijn scherm
 * (soort="lijn"). Alleen het lijntje wordt live getekend (BliepoLijn): het
 * springt mee op elk geluid dat Bliepo afspeelt (lib/bliepo-geluid.ts) en is
 * een rustig hartslaglijntje als hij stil is. De getekende ogen en mond horen
 * bij de oude blauwe robot en staan er dan niet op; juichen (opspringen,
 * sterretjes), nadenken (puntjes) en troosten (naar je toe leunen) blijven.
 * Bij "Beweging uit" blijft het lijntje een rustige lijn. Er even tussenin
 * was het het filmpje (soort="filmpje"); de oude blauwe robot met ogen en mond
 * is soort="plaatje". Beide staan er nog.
 */

import { useSyncExternalStore } from "react";
import type { MaatjeHouding } from "@/lib/maatje/poppetje";
import { abonneerPraten, praatOpServer, praatVos } from "@/lib/stem";
import { BliepoFilmpje } from "@/components/zappie/bliepo/BliepoFilmpje";
import { BliepoFilm, type Filmhouding } from "@/components/zappie/bliepo/BliepoFilm";
import { BliepoLijn } from "@/components/avontuur/BliepoLijn";
import { useBewegingsstand } from "@/components/zappie/reis/beweging";

/*
  Het schermpje in het bijgesneden plaatje (953 x 1249), in procenten. Het
  gezicht wordt daar precies overheen gelegd, met een eigen tekenvlak van
  490 x 355 (de pixels van het schermpje).
*/
const SCHERM = { links: 35.4, boven: 17.9, breed: 51.4, hoog: 28.4 };

const GLOED = "#7ff6ff";

export function Bliepo({
  houding = "rustig",
  praat = false,
  kijkt,
  className = "",
  soort = "film",
}: {
  houding?: MaatjeHouding;
  /** praat hij nu? (de mond beweegt ook vanzelf zodra de stem klinkt) */
  praat?: boolean;
  /** kijkt hij opzij? Dan schuiven ogen en mond die kant op (bijv. naar de vakken). */
  kijkt?: "links" | "rechts";
  className?: string;
  /**
   * film (sinds 23 oktober 2026, standaard): filmpjes met losse bewegingen die
   * wisselen met wat hij doet, met het live lijntje erover; lijn: het plaatje
   * met het live lijntje; filmpje: het zweef-filmpje; plaatje: de oude blauwe robot.
   */
  soort?: "film" | "lijn" | "filmpje" | "plaatje";
}) {
  const rustig = useBewegingsstand() !== "aan";
  const stemKlinkt = useSyncExternalStore(
    abonneerPraten,
    praatVos,
    praatOpServer,
  );
  const mondBeweegt = praat || houding === "praat" || stemKlinkt;
  const blij = houding === "blij";
  const denkt = houding === "denkt";
  const troost = houding === "troost";
  const filmhouding: Filmhouding = blij ? "juichen" : denkt ? "nadenken" : troost ? "troost" : mondBeweegt ? "praten" : "rust";

  return (
    <div
      className={`bliepo bliepo--${houding} ${mondBeweegt ? "bliepo--praat" : ""} ${soort === "filmpje" ? "bliepo--filmpje" : ""} ${soort === "film" ? "bliepo--film" : ""} ${className}`}
      role="img"
      aria-label="Bliepo"
    >
      <div className="bliepo__lijf">
        {soort === "film" ? (
          <div className="bliepo__beeld">
            <BliepoFilm houding={filmhouding} rustig={rustig} praat={mondBeweegt} className="bliepo__film" />
          </div>
        ) : soort === "lijn" ? (
          <div className="bliepo__beeld">
            {/* eslint-disable-next-line @next/next/no-img-element -- een doorzichtig plaatje in vier maten; next/image voegt hier niets toe */}
            <img
              src="/assets/zappie/bliepo/bliepo-leeg-290.webp"
              srcSet="/assets/zappie/bliepo/bliepo-leeg-200.webp 200w, /assets/zappie/bliepo/bliepo-leeg-290.webp 290w, /assets/zappie/bliepo/bliepo-leeg-435.webp 435w, /assets/zappie/bliepo/bliepo-leeg-580.webp 580w"
              sizes="(min-width: 1024px) 15vw, 30vw"
              alt=""
              draggable={false}
              className="bliepo__plaatje"
            />
            <BliepoLijn rustig={rustig} praat={mondBeweegt} />
          </div>
        ) : soort === "filmpje" ? (
          <BliepoFilmpje rustig={rustig} className="bliepo__plaatje" />
        ) : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- een plaatje met doorzichtigheid in drie maten; next/image voegt hier niets toe */}
            <img
              src="/mascotte/bliepo-480.webp"
              srcSet="/mascotte/bliepo-300.webp 229w, /mascotte/bliepo-480.webp 366w, /mascotte/bliepo-720.webp 549w"
              sizes="(min-width: 1024px) 15vw, 30vw"
              alt=""
              draggable={false}
              className="bliepo__plaatje"
            />

            <svg
              viewBox="0 0 490 355"
              className="bliepo__gezicht"
              style={{
                left: `${SCHERM.links}%`,
                top: `${SCHERM.boven}%`,
                width: `${SCHERM.breed}%`,
                height: `${SCHERM.hoog}%`,
              }}
              aria-hidden="true"
            >
              <defs>
                <filter
                  id="bliepo-gloed"
                  x="-50%"
                  y="-50%"
                  width="200%"
                  height="200%"
                >
                  <feGaussianBlur stdDeviation="7" result="w" />
                  <feMerge>
                    <feMergeNode in="w" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <g
                filter="url(#bliepo-gloed)"
                transform={
                  kijkt === "rechts"
                    ? "translate(34 4)"
                    : kijkt === "links"
                      ? "translate(-34 4)"
                      : undefined
                }
                fill={GLOED}
                stroke={GLOED}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
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
                  <g className="bliepo__ogen" stroke="none">
                    <rect
                      x={denkt ? 150 : 132}
                      y={denkt ? 92 : 112}
                      width="56"
                      height="74"
                      rx="26"
                    />
                    <rect
                      x={denkt ? 320 : 302}
                      y={denkt ? 92 : 112}
                      width="56"
                      height="74"
                      rx="26"
                    />
                  </g>
                )}

                {/* mond */}
                {mondBeweegt ? (
                  <g className="bliepo__mond">
                    <path
                      d="M190 220 Q245 210 300 220 Q300 290 245 292 Q190 290 190 220 Z"
                      strokeWidth="6"
                      fillOpacity="0.85"
                    />
                  </g>
                ) : blij ? (
                  <path
                    d="M170 212 L320 212 Q316 296 245 298 Q174 296 170 212 Z"
                    strokeWidth="6"
                    fillOpacity="0.9"
                  />
                ) : denkt ? (
                  <path d="M215 248 L282 240" fill="none" strokeWidth="15" />
                ) : (
                  <path
                    d="M180 226 Q245 284 310 226"
                    fill="none"
                    strokeWidth="16"
                  />
                )}
              </g>
            </svg>
          </>
        )}
      </div>

      {/* nadenken: drie puntjes */}
      {denkt && (
        <span className="bliepo__puntjes" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      )}

      {/* juichen: sterretjes eromheen */}
      {blij && (
        <span className="bliepo__sterren" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </span>
      )}
    </div>
  );
}
