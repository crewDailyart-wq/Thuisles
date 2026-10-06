"use client";

/**
 * Splitsen via 10 in de schoolvorm, met "pootjes" (oktober 2026).
 *
 *        6 + 5 = ▢
 *           / \
 *          ▢   ▢
 *
 * Bovenaan de som met een leeg vakje voor de uitkomst. Onder het tweede getal
 * twee schuine lijntjes, met onder elk lijntje een leeg vakje: links hoeveel
 * er nodig is om de 10 vol te maken, rechts wat er daarna nog bij moet.
 *
 * De vakjes zelf komen van de opdracht die dit gebruikt, zodat typen, nakijken
 * en doorspringen hetzelfde blijven. De volgorde van het antwoord is links
 * pootje, rechts pootje, uitkomst; zo springt de cursor ook door.
 *
 * Uitlijnen (ONTWERPREGELS.md): de lijntjes beginnen precies onder het midden
 * van het tweede getal en eindigen op het midden van de bovenkant van hun eigen
 * vakje. Het blok met de pootjes neemt in het raster geen breedte in, zodat de
 * som bovenaan niet uit elkaar wordt getrokken.
 */

import type { ReactNode } from "react";
import { Gegeven } from "@/components/oefenen/Splitsopdracht";

/** Twee kleine vakjes van 48 pixels met ruimte ertussen. */
const BREED = 136;
const VAK = 48;
const HOOG = 34;

export function Pootjes({
  eerste,
  tweede,
  links,
  rechts,
  uitkomst,
}: {
  eerste: number;
  tweede: number;
  /** Het linker pootje: wat er bij het eerste getal moet tot 10. */
  links: ReactNode;
  /** Het rechter pootje: wat er daarna nog bij moet. */
  rechts: ReactNode;
  /** Het vakje voor de uitkomst, bovenaan in de som. */
  uitkomst: ReactNode;
}) {
  const teken = (t: string) => <span className="text-2xl font-extrabold text-inkt-zacht">{t}</span>;
  return (
    <div className="grid grid-cols-[auto_auto_auto_auto_auto] items-center justify-center gap-x-3">
      <Gegeven waarde={eerste} />
      {teken("+")}
      <Gegeven waarde={tweede} />
      {teken("=")}
      {uitkomst}

      {/* De pootjes onder het tweede getal. */}
      <div className="col-start-3 flex w-0 justify-center justify-self-center overflow-visible">
        <div className="flex flex-none flex-col items-stretch" style={{ width: BREED }}>
          <svg width={BREED} height={HOOG} viewBox={`0 0 ${BREED} ${HOOG}`} aria-hidden="true" className="block">
            <line x1={BREED / 2} y1={2} x2={VAK / 2} y2={HOOG} stroke="var(--color-inkt)" strokeWidth={3} strokeLinecap="round" />
            <line x1={BREED / 2} y1={2} x2={BREED - VAK / 2} y2={HOOG} stroke="var(--color-inkt)" strokeWidth={3} strokeLinecap="round" />
          </svg>
          <div className="flex justify-between">
            {links}
            {rechts}
          </div>
        </div>
      </div>
    </div>
  );
}

/** De zin bij goed en fout: "6 + 4 = 10, en 10 + 1 = 11." */
export function pootjesZin(eerste: number, tweede: number): string {
  const totTien = 10 - eerste;
  const rest = tweede - totTien;
  return `${eerste} + ${totTien} = 10, en 10 + ${rest} = ${eerste + tweede}.`;
}
