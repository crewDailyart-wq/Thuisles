"use client";

/**
 * De compacte stappenlijst.
 *
 * Dit is de uitleg voor groep 7-8: alle stappen tegelijk in beeld, elke stap
 * op één regel met de som erachter. Geen tik-voor-tik afspelen, geen Vos —
 * oudere kinderen lezen liever in één oogopslag.
 *
 * Wordt ook gebruikt als terugval bij groep 3-4 en 5-6 zolang de animatie voor
 * een som nog niet bestaat.
 */

import { Kruisje, Luidspreker } from "@/components/oefenen/Symbolen";
import { Figuurtekening } from "@/components/oefenen/Figuurtekening";
import type { Figuur } from "@/lib/generatoren/soort";
import { zeg } from "@/lib/stem";

/** Eén regel: een zin, en daarachter de som. */
export type Lijstregel = {
  tekst: string;
  som?: string;
  figuur?: Figuur;
};

export function Stappenuitleg({
  stappen,
  onSluit,
}: {
  stappen: Lijstregel[];
  onSluit: () => void;
}) {
  return (
    <div className="mt-5 rounded-2xl border-2 border-lucht/40 bg-lucht-zacht/60 p-4">
      {/*
        Kop met alleen knopjes, net als bij de animatie. De titel is weg; de
        stappen eronder zeggen zelf al wat er staat.

        Voorlezen is hier een handeling en geen schakelaar — hij start het
        voorlezen — dus er is geen doorgestreepte stand. Het blijft dezelfde
        luidspreker, zodat het teken door de hele uitleg hetzelfde betekent.
      */}
      <div className="mb-3 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() =>
            zeg(stappen.map((s) => `${s.tekst} ${s.som ?? ""}`).join(". "))
          }
          aria-label="Voorlezen"
          title="Voorlezen"
          className="grid size-11 place-items-center rounded-full bg-white/80 text-inkt-zacht transition hover:text-viool"
        >
          <Luidspreker className="size-6" />
        </button>
        <button
          type="button"
          onClick={onSluit}
          aria-label="Sluiten"
          title="Sluiten"
          className="grid size-11 place-items-center rounded-full bg-white/80 text-inkt-zacht transition hover:text-viool"
        >
          <Kruisje className="size-6" />
        </button>
      </div>

      <ol className="flex flex-col gap-1.5">
        {stappen.map((stap, i) => (
          <li
            key={`${stap.tekst}-${i}`}
            className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-xl bg-white/80 px-3 py-2"
          >
            <span className="grid size-5 shrink-0 place-items-center rounded-full bg-lucht text-[0.66rem] font-extrabold text-white">
              {i + 1}
            </span>
            <span className="min-w-0 flex-1 text-sm font-bold text-inkt-zacht">
              {stap.tekst}
            </span>
            {stap.som && (
              <span className="shrink-0 text-base font-extrabold tabular-nums">
                {stap.som}
              </span>
            )}
            {stap.figuur && (
              <span className="mt-1 block w-24 basis-full">
                <Figuurtekening figuur={stap.figuur} />
              </span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
