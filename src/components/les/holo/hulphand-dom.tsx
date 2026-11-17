"use client";

/**
 * Het hulphandje (Magnific, public/hulphand/hulphand-wijs.png) voor de DOM-vlakken van de gouden lessen (Sara, 17 november 2026).
 * De vingertop staat op (left, top) van het vlak; de hand ligt schuin rechtsonder en wijst schuin omhoog naar links (geen draaiing).
 * Laadt het plaatje niet, dan blijft de oude getekende hand (`reserve`, met de eigen klassen van het vlak) staan.
 *   - `animatie`: de klasse van het vlak voor de beweging (alleen `transform`), zoals voorheen `s.pak`, `s.tikGebaar` of `s.sleepGebaar`.
 *   - `handKlasse`: de klasse `.hand` van het vlak, alleen voor de reserve.
 *   - `schaal`: 1 = ± 58 x 65 punten; pas per les aan als het doel groter of kleiner is.
 *   - `versch`: verschuif alleen het plaatje (niet de reserve) over x en y punten, als het doel van de reserve-hand anders ligt.
 *   - `spiegel`: spiegel het plaatje om de vingertop (voor een doel dat rechts of boven de hand ligt).
 */
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { HULPHAND_ANKER, HULPHAND_SCHAAL, HULPHAND_URL, laadHulphand } from "./hulphand";

const BREEDTE = 432;
const HOOGTE = 480;

let bekend: boolean | null = null;

export function HulphandDom({
  left,
  top,
  animatie = "",
  handKlasse = "",
  reserve,
  schaal = 1,
  spiegel = false,
  versch,
  stijl,
}: {
  left: number;
  top: number;
  animatie?: string;
  handKlasse?: string;
  reserve: ReactNode;
  schaal?: number;
  spiegel?: boolean;
  versch?: { x: number; y: number };
  stijl?: CSSProperties;
}) {
  const [ok, setOk] = useState<boolean | null>(bekend);
  useEffect(() => {
    if (bekend !== null) return;
    let weg = false;
    void laadHulphand().then((img) => {
      bekend = !!img;
      if (!weg) setOk(bekend);
    });
    return () => {
      weg = true;
    };
  }, []);

  if (!ok) {
    return (
      <div className={`${handKlasse} ${animatie}`} style={{ left, top, ...stijl }} aria-hidden data-hulphand="">
        {reserve}
      </div>
    );
  }
  const b = BREEDTE * HULPHAND_SCHAAL * schaal;
  const h = HOOGTE * HULPHAND_SCHAAL * schaal;
  return (
    <div
      className={animatie}
      style={{ position: "absolute", left, top, width: b, height: h, margin: `${-HULPHAND_ANKER.y * h + (versch?.y ?? 0)}px 0 0 ${-HULPHAND_ANKER.x * b + (versch?.x ?? 0)}px`, pointerEvents: "none", zIndex: 7, willChange: "transform", ...stijl }}
      aria-hidden
      data-hulphand=""
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={HULPHAND_URL} alt="" draggable={false} width={b} height={h} style={{ display: "block", width: "100%", height: "100%", transformOrigin: `${HULPHAND_ANKER.x * 100}% ${HULPHAND_ANKER.y * 100}%`, transform: spiegel ? "scaleX(-1)" : undefined }} />
    </div>
  );
}
