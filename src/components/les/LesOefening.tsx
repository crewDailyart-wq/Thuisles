"use client";

/**
 * Een uitleg-les als oefening op de kinderkant (oktober 2026).
 *
 * De les speelt schermvullend, over de gewone kinderpagina heen. Is hij af,
 * dan telt hij als één goed gemaakte vraag: zo komt hij in de voortgang en bij
 * de ouder terecht, net als elke andere oefening. Fouten tijdens de les worden
 * niet apart bewaard; die horen bij het leren en de les helpt er zelf mee.
 */

import { useCallback, useEffect, useRef } from "react";
import { rondAf } from "@/app/oefenacties";
import { Lesspeler } from "./Lesscherm";
import { zoekDraaiboek } from "./lessen";
import { zetGeluidjesVanOuder } from "@/lib/lesgeluiden";

export function LesOefening({
  lesId,
  vraagId,
  leerdoelId,
  naam,
  pad,
  terugHref,
  tutor = null,
  geluidjes = true,
}: {
  lesId: string;
  vraagId: string;
  leerdoelId: string;
  naam: string;
  pad: string;
  terugHref: string;
  /** Praten met Bliepo (22 oktober 2026): alleen als de ouder het aanzette. */
  tutor?: { groep: number } | null;
  /** Geluidjes in de lessen (29 oktober 2026): de instelling van de ouder, standaard aan. */
  geluidjes?: boolean;
}) {
  const les = zoekDraaiboek(lesId);
  const begin = useRef(0);
  useEffect(() => {
    begin.current = performance.now();
  }, []);
  useEffect(() => {
    zetGeluidjesVanOuder(geluidjes);
    return () => zetGeluidjesVanOuder(true);
  }, [geluidjes]);

  const klaar = useCallback(() => {
    const seconden = Math.round((performance.now() - begin.current) / 1000);
    begin.current = performance.now();
    const rondeId = `les-${Date.now().toString(36)}`;
    void rondAf(pad, [leerdoelId], [
      {
        leerdoelId,
        vraagId,
        goed: true,
        uitkomst: "direct_goed",
        foutpatroon: null,
        hintGebruikt: false,
        uitlegGebruikt: false,
        seconden: Math.min(seconden, 3600),
        gegokt: false,
        beloningsbron: `${rondeId}:${vraagId}`,
      },
    ]);
  }, [pad, leerdoelId, vraagId]);

  if (!les) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60 }}>
      <Lesspeler les={les} naam={naam} onKlaar={klaar} terugHref={terugHref} tutor={tutor} />
    </div>
  );
}
