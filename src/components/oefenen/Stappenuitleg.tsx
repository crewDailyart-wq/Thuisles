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

import { Icoon } from "@/components/kind/Icoon";
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
  titel,
  onSluit,
}: {
  stappen: Lijstregel[];
  /** Bijvoorbeeld de naam van de strategie. */
  titel?: string;
  onSluit: () => void;
}) {
  return (
    <div className="mt-5 rounded-2xl border-2 border-lucht/40 bg-lucht-zacht/60 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-extrabold text-lucht">
          <Icoon naam="gloeilamp" className="size-5" />
          Zo doe je het{titel ? ` — ${titel}` : ""}
        </p>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() =>
              zeg(stappen.map((s) => `${s.tekst} ${s.som ?? ""}`).join(". "))
            }
            className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-inkt-zacht transition hover:text-viool"
          >
            🔊 Voorlezen
          </button>
          <button
            type="button"
            onClick={onSluit}
            className="rounded-full px-3 py-1 text-xs font-bold text-inkt-zacht transition hover:bg-white/70"
          >
            Sluiten
          </button>
        </div>
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
