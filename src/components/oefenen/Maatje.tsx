"use client";

/**
 * Het maatje op het oefenscherm: Vos met een tekstwolkje.
 *
 * Krijgt een bericht (een paar zinnen) en zegt die één voor één. Het wolkje
 * loopt mee: de zin die nu klinkt staat er vet, de zinnen ervoor gewoon. Staat
 * de stem uit, dan verschijnen de zinnen in hetzelfde tempo, zonder geluid.
 *
 * Bij elke zin gaat de plaatje-stap mee naar `zetMaatjeStap`, zodat een plaatje
 * dat wil meelopen weet wat het maatje op dat moment uitlegt.
 *
 * Er zit met opzet geen knop "Hulp" op (MAATJE-HANDLEIDING.md, wachtrij 02).
 * Alleen de knop om de stem uit en aan te zetten.
 */

import { useEffect, useRef, useState } from "react";
import { VosFiguur } from "@/components/oefenen/VosFiguur";
import { Luidspreker, LuidsprekerUit } from "@/components/oefenen/Symbolen";
import { POPPETJE, type MaatjeHouding } from "@/lib/maatje/poppetje";
import { zetMaatjeStap } from "@/lib/maatje/stap";
import { spreekbaar } from "@/lib/maatje/taal";
import type { Zin } from "@/lib/maatje/types";
import { stopPraten, zegNaElkaar } from "@/lib/stem";

export type MaatjeBericht = {
  /** Uniek per bericht; een nieuw id laat het maatje opnieuw beginnen. */
  id: string;
  zinnen: Zin[];
  houding: MaatjeHouding;
};

export function Maatje({
  bericht,
  geluid,
  onGeluid,
  onKlaar,
}: {
  bericht: MaatjeBericht | null;
  geluid: boolean;
  onGeluid: (aan: boolean) => void;
  /** Na de laatste zin van een bericht, met het id erbij. */
  onKlaar?: (id: string) => void;
}) {
  /* Hoeveel zinnen er al te zien zijn, bij welk bericht. */
  const [stand, setStand] = useState<{ id: string; tot: number; klaar: boolean }>({ id: "", tot: 0, klaar: false });
  const klaarRef = useRef(onKlaar);
  useEffect(() => {
    klaarRef.current = onKlaar;
  }, [onKlaar]);

  useEffect(() => {
    if (!bericht) return;
    const stop = zegNaElkaar(
      bericht.zinnen.map((z) => spreekbaar(z.tekst)),
      (i) => {
        setStand({ id: bericht.id, tot: i + 1, klaar: false });
        zetMaatjeStap(bericht.zinnen[i]?.stap ?? null);
      },
      () => {
        setStand({ id: bericht.id, tot: bericht.zinnen.length, klaar: true });
        zetMaatjeStap(null);
        klaarRef.current?.(bericht.id);
      },
      geluid,
    );
    return () => {
      stop();
      stopPraten();
      zetMaatjeStap(null);
    };
    /*
      Opnieuw beginnen bij een nieuw bericht, of als de stem aan of uit gaat —
      niet bij elke nieuwe render.
    */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bericht?.id, geluid]);

  if (!bericht) return null;

  const tot = stand.id === bericht.id ? stand.tot : 0;
  const bezig = stand.id === bericht.id && !stand.klaar;
  const zichtbaar = bericht.zinnen.slice(0, Math.max(1, tot));
  const pop = POPPETJE.houdingen[bezig && bericht.houding === "rustig" ? "praat" : bericht.houding];

  function wisselGeluid() {
    const aan = !geluid;
    if (!aan) stopPraten();
    onGeluid(aan);
  }

  return (
    <div className="mt-6 flex items-end gap-2 sm:gap-3" data-maatje="">
      <VosFiguur houding={pop.houding} beweging={pop.beweging} className="size-16 shrink-0 sm:size-20" />
      <div
        className="relative min-w-0 flex-1 rounded-2xl border-2 border-rand bg-white px-4 py-3 text-base font-semibold leading-snug text-inkt shadow-op"
        aria-live="polite"
      >
        {/* Het puntje van het wolkje, naar Vos toe. */}
        <span
          aria-hidden="true"
          className="absolute -left-2 bottom-4 size-4 rotate-45 border-b-2 border-l-2 border-rand bg-white"
        />
        <p className="relative">
          {zichtbaar.map((z, i) => (
            <span key={i} className={bezig && i === tot - 1 ? "font-extrabold" : ""}>
              {i > 0 ? " " : ""}
              {z.tekst}
            </span>
          ))}
        </p>
      </div>
      <button
        type="button"
        onClick={wisselGeluid}
        aria-pressed={geluid}
        aria-label={geluid ? `Stem van ${POPPETJE.naam} uitzetten` : `Stem van ${POPPETJE.naam} aanzetten`}
        title={geluid ? `Stem van ${POPPETJE.naam} uit` : `Stem van ${POPPETJE.naam} aan`}
        className="grid size-11 shrink-0 place-items-center self-center rounded-full border border-rand bg-white/80 text-inkt-zacht transition hover:text-huisstijl"
      >
        {geluid ? <Luidspreker className="size-6" /> : <LuidsprekerUit className="size-6" />}
      </button>
    </div>
  );
}
