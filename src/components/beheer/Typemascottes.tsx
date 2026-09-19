"use client";

/**
 * De standaardmascotte per oefeningstype.
 *
 * ---------------------------------------------------------------------------
 * Waarom dit naast de vos hierboven staat
 * ---------------------------------------------------------------------------
 * De vos hierboven geldt voor alles. Dat werkt zolang elk type dezelfde drie
 * houdingen gebruikt, en dat is niet zo: de stapstenen willen een springende
 * vos, de trein een machinist met een pet, het vissen een vos met een hengel.
 * Wie die per sjabloon moest invullen, was bij elk nieuw sjabloon opnieuw bezig
 * — en vergat het.
 *
 * Hier staat per type één keer wat er geldt. Een sjabloon dat zijn eigen veld
 * leeg laat, pakt dit; wie het bij één sjabloon anders wil, vult daar gewoon
 * iets in. De volgorde is: sjabloon → dit → de vos hierboven.
 */

import { useState, useTransition } from "react";
import { AfbeeldingKiezer } from "@/components/beheer/AfbeeldingKiezer";
import { bewaarTypemascotte } from "@/app/admin/vosacties";
import { MASCOTTESETS } from "@/lib/mascottesets";

export function Typemascottes({
  begin,
  beschikbaar,
}: {
  /** Per type de huidige waarden, per veldsleutel. */
  begin: Record<string, Record<string, string>>;
  beschikbaar: string[];
}) {
  const [waarden, setWaarden] = useState(begin);
  const [erbij, setErbij] = useState<string[]>([]);
  const [bezig, start] = useTransition();
  const [bewaard, setBewaard] = useState<string | null>(null);

  const lijst = [...beschikbaar, ...erbij];

  function zet(type: string, sleutel: string, waarde: string) {
    setWaarden((vorig) => ({
      ...vorig,
      [type]: { ...(vorig[type] ?? {}), [sleutel]: waarde },
    }));
    setBewaard(null);
  }

  function opslaan(type: string) {
    start(async () => {
      await bewaarTypemascotte(type, waarden[type] ?? {});
      setBewaard(type);
    });
  }

  return (
    <section className="rounded-xl border border-beheer-rand bg-white p-4">
      <h2 className="text-sm font-semibold text-beheer-inkt">
        De vos per soort oefening
      </h2>
      <p className="mt-1 text-xs text-beheer-zacht">
        Elk soort oefening laat zijn eigen houdingen zien. Wat je hier per soort
        kiest, gebruiken alle sjablonen van dat soort vanzelf — ook de sjablonen
        die je later nog maakt. Bij een sjabloon kun je er altijd iets anders
        voor in de plaats zetten. Laat je hier iets leeg, dan geldt de vos
        hierboven.
      </p>

      <div className="mt-4 flex flex-col gap-5">
        {MASCOTTESETS.map((set) => (
          <div key={set.type} className="border-t border-beheer-rand pt-4 first:border-t-0 first:pt-0">
            <span className="block text-xs font-semibold uppercase tracking-wide text-beheer-inkt">
              {set.naam}
            </span>

            <div className="mt-2 grid gap-3 sm:grid-cols-3">
              {set.velden.map((veld) => (
                <div key={veld.sleutel}>
                  <span className="mb-1 block text-[0.68rem] font-semibold uppercase tracking-wide text-beheer-zacht">
                    {veld.label}
                  </span>
                  <AfbeeldingKiezer
                    naam={`mascotte-${set.type}-${veld.sleutel}`}
                    waarde={waarden[set.type]?.[veld.sleutel] ?? ""}
                    beschikbaar={lijst}
                    onWijzig={(w) => zet(set.type, veld.sleutel, w)}
                    onNieuw={(bestandsnaam) => {
                      setErbij((l) => [...l, bestandsnaam]);
                      zet(set.type, veld.sleutel, bestandsnaam);
                    }}
                    compact
                  />
                  <span className="mt-1 block text-xs text-beheer-zacht">{veld.hulp}</span>
                </div>
              ))}
            </div>

            <div className="mt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => opslaan(set.type)}
                disabled={bezig}
                className="inline-flex h-8 items-center rounded-md border border-beheer-rand px-3 text-xs font-semibold text-beheer-inkt transition hover:bg-beheer-vlak disabled:opacity-60"
              >
                {bezig ? "Bezig…" : `Opslaan voor ${set.naam}`}
              </button>
              {bewaard === set.type && (
                <span className="text-xs text-beheer-zacht">Opgeslagen.</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
