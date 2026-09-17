"use client";

/**
 * De standaardvos: één plek voor de mascotte van álle oefeningstypes.
 *
 * Zonder dit moest bij elk nieuw type dezelfde drie afbeeldingen opnieuw
 * gekozen worden, en moest een andere vos overal apart aangepast. Nu staat hij
 * hier één keer, en gebruikt elk type hem vanzelf.
 *
 * Per sjabloon blijft het mogelijk om er een andere te kiezen; wat daar leeg
 * blijft, valt terug op wat hier staat.
 */

import { useState, useTransition } from "react";
import { AfbeeldingKiezer } from "@/components/beheer/AfbeeldingKiezer";
import { bewaarStandaardvos } from "@/app/admin/vosacties";

const HOUDINGEN = [
  {
    sleutel: "vangend" as const,
    label: "Vos — bezig",
    hulp: "Te zien terwijl hij iets doet: plaatjes opvangen, blokken neerleggen, staven bouwen.",
  },
  {
    sleutel: "wachtend" as const,
    label: "Vos — wachtend",
    hulp: "Te zien zolang het kind nadenkt. Leeg = dezelfde als bezig.",
  },
  {
    sleutel: "blij" as const,
    label: "Vos — blij",
    hulp: "Te zien na een goed antwoord. Leeg = dezelfde als bezig.",
  },
];

export function Standaardvos({
  begin,
  beschikbaar,
  afgeleid,
}: {
  begin: { vangend: string; wachtend: string; blij: string };
  beschikbaar: string[];
  /**
   * Staat er nog niets vast en komen deze afbeeldingen uit een sjabloon?
   *
   * Dan is het goed om te weten dát het zo werkt: het is geen keuze die hier
   * ooit gemaakt is, maar de vos die het laatst bij een sjabloon is gezet.
   */
  afgeleid: boolean;
}) {
  const [waarden, setWaarden] = useState(begin);
  const [erbij, setErbij] = useState<string[]>([]);
  const [bezig, start] = useTransition();
  const [bewaard, setBewaard] = useState(false);

  const lijst = [...beschikbaar, ...erbij];

  function zet(sleutel: keyof typeof waarden, waarde: string) {
    setWaarden((vorig) => ({ ...vorig, [sleutel]: waarde }));
    setBewaard(false);
  }

  function opslaan() {
    start(async () => {
      await bewaarStandaardvos(waarden);
      setBewaard(true);
    });
  }

  return (
    <section className="rounded-xl border border-beheer-rand bg-white p-4">
      <h2 className="text-sm font-semibold text-beheer-inkt">De vos van de oefeningen</h2>
      <p className="mt-1 text-xs text-beheer-zacht">
        Deze drie afbeeldingen gebruikt elk oefeningstype vanzelf. Laat je ze bij een sjabloon
        leeg, dan pakt dat sjabloon wat hier staat. Zo hoef je ze maar één keer te kiezen.
        {afgeleid && (
          <>
            {" "}
            Er staat hier nog niets vast: nu geldt de vos van het laatste sjabloon waar er een in
            stond. Sla hem op om hem echt vast te zetten.
          </>
        )}
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {HOUDINGEN.map((h) => (
          <div key={h.sleutel}>
            <span className="mb-1 block text-[0.68rem] font-semibold uppercase tracking-wide text-beheer-zacht">
              {h.label}
            </span>
            <AfbeeldingKiezer
              naam={`standaardvos-${h.sleutel}`}
              waarde={waarden[h.sleutel]}
              beschikbaar={lijst}
              onWijzig={(w) => zet(h.sleutel, w)}
              onNieuw={(bestandsnaam) => {
                setErbij((l) => [...l, bestandsnaam]);
                zet(h.sleutel, bestandsnaam);
              }}
              compact
            />
            <span className="mt-1 block text-xs text-beheer-zacht">{h.hulp}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={opslaan}
          disabled={bezig}
          className="inline-flex h-9 items-center rounded-md bg-viool px-4 text-sm font-semibold text-white transition hover:bg-viool-diep disabled:opacity-60"
        >
          {bezig ? "Bezig…" : "Vos opslaan"}
        </button>
        {bewaard && <span className="text-xs text-beheer-zacht">Opgeslagen.</span>}
      </div>
    </section>
  );
}
