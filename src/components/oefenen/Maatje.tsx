"use client";

/**
 * Het maatje op het oefenscherm: Vos of de robot, met een tekstwolkje.
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
import { POPPETJE, POPPETJE_GODOT, type MaatjeHouding } from "@/lib/maatje/poppetje";
import { TijdelijkMaatje } from "@/components/oefenen/TijdelijkMaatje";
import { BliepoVloer } from "@/components/oefenen/BliepoVloer";
import { BliepoTekst, inWoorden } from "@/components/oefenen/BliepoTekst";
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
  poppetje = "vos",
  vloer = false,
}: {
  /**
   * Nieuw ontwerp van de opdrachten (23 oktober 2026): Bliepo staat rechts op
   * de ronde cirkel op de vloer, met zijn tekstballon naast zijn hoofd; op een
   * staand scherm kleiner onder het bord (zie opdracht-nieuw.css).
   */
  vloer?: boolean;
  bericht: MaatjeBericht | null;
  /**
   * "tijdelijk": het bolletje, geen vos. "geen": alleen het wolkje, omdat het
   * maatje al in de Godot-bouwsteen zelf staat (één maatje in beeld).
   */
  poppetje?: "vos" | "tijdelijk" | "geen";
  geluid: boolean;
  onGeluid: (aan: boolean) => void;
  /** Na de laatste zin van een bericht, met het id erbij. */
  onKlaar?: (id: string) => void;
}) {
  /* Hoeveel zinnen er al te zien zijn, bij welk bericht. */
  const [stand, setStand] = useState<{ id: string; tot: number; klaar: boolean }>({ id: "", tot: 0, klaar: false });
  /* "Nog eens horen" (23 oktober 2026): hetzelfde bericht nog een keer voorlezen. */
  const [herhaal, setHerhaal] = useState(0);
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
  }, [bericht?.id, geluid, herhaal]);

  if (!bericht) return null;

  const tot = stand.id === bericht.id ? stand.tot : 0;
  const bezig = stand.id === bericht.id && !stand.klaar;
  const zichtbaar = bericht.zinnen.slice(0, Math.max(1, tot));
  const pop = POPPETJE.houdingen[bezig && bericht.houding === "rustig" ? "praat" : bericht.houding];

  const naam = poppetje === "vos" ? POPPETJE.naam : POPPETJE_GODOT.naam;

  function wisselGeluid() {
    const aan = !geluid;
    if (!aan) stopPraten();
    onGeluid(aan);
  }

  if (vloer) {
    /* De zin die hij nu zegt (of de laatste als hij klaar is). */
    const huidigeZin = Math.max(0, Math.min(bericht.zinnen.length - 1, (bezig ? tot : zichtbaar.length) - 1));
    /* Juichen bij goed, bemoedigend knikken bij fout, nadenken bij een tip. */
    const kaart: Partial<Record<MaatjeHouding, string>> = { blij: "correct", troost: "incorrect", denkt: "think" };
    const naam = kaart[bericht.houding];
    return (
      <BliepoVloer
        gebaar={naam ? { naam, n: bericht.id } : null}
        onNogEens={() => setHerhaal((n) => n + 1)}
        geluid={geluid}
        onGeluid={(aan) => {
          if (!aan) stopPraten();
          onGeluid(aan);
        }}
      >
        {/*
          Tekst boven Bliepo (23 oktober 2026): steeds de zin die hij nu zegt,
          in stukjes na elkaar, met oplichtende woorden (BliepoTekst).
        */}
        <BliepoTekst
          key={`${bericht.id}:${huidigeZin}`}
          woorden={inWoorden(bericht.zinnen[huidigeZin]?.tekst ?? "")}
          gesproken={spreekbaar(bericht.zinnen[huidigeZin]?.tekst ?? "")}
        />
      </BliepoVloer>
    );
  }

  return (
    <div className="mt-6 flex items-end gap-2 sm:gap-3" data-maatje="">
      {poppetje === "geen" ? null : poppetje === "tijdelijk" ? (
        <TijdelijkMaatje houding={bericht.houding} praat={bezig} className="h-28 shrink-0 sm:h-36" />
      ) : (
        <VosFiguur houding={pop.houding} beweging={pop.beweging} className="size-16 shrink-0 sm:size-20" />
      )}
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
        aria-label={geluid ? `Stem van ${naam} uitzetten` : `Stem van ${naam} aanzetten`}
        title={geluid ? `Stem van ${naam} uit` : `Stem van ${naam} aan`}
        className="grid size-11 shrink-0 place-items-center self-center rounded-full border border-rand bg-white/80 text-inkt-zacht transition hover:text-huisstijl"
      >
        {geluid ? <Luidspreker className="size-6" /> : <LuidsprekerUit className="size-6" />}
      </button>
    </div>
  );
}
