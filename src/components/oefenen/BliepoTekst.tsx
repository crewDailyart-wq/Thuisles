"use client";

/**
 * De tekst boven Bliepo, met oplichtende woorden (23 oktober 2026, akkoord
 * eigenaar op het voorbeeld "Tekst boven Bliepo"). Eén gedeeld onderdeel voor
 * alle opdrachten (Maatje), lessen en "Zo werkt het", zodat nieuwe opdrachten
 * het vanzelf gebruiken.
 *
 * - Vrij boven Bliepo, zonder ballon of kader: groot, dik en wit (ronde
 *   letters), met een zachte schaduw (opdracht-nieuw.css, .bliepo-tekst).
 * - Elk woord licht op op het moment dat Bliepo het zegt (lib/voorlezen.ts:
 *   de stem meldt wanneer de zin begint, de tijden per woord worden geschat
 *   uit het geluid zelf). Staat standaard aan; uit bij Profiel ("Woorden
 *   oplichten bij voorlezen").
 *
 * `woorden`: de woorden zoals ze in beeld staan (mag opmaak hebben, zoals een
 * gekleurd getal); `gesproken`: dezelfde zin zoals de stem hem kreeg. Klopt
 * dat met de zin die nu klinkt, dan lichten de woorden op.
 */

import { useEffect, useState, useSyncExternalStore } from "react";
import { abonneerVoorlees, huidigeVoorlees, vergelijkbaar } from "@/lib/voorlezen";
import { leesVoorkeuren } from "@/components/les/voorkeuren";

const geen = () => () => {};

/** Mogen de woorden oplichten? (standaard ja; bij Profiel om te zetten) */
export function useOplichten(): boolean {
  return useSyncExternalStore(geen, () => leesVoorkeuren().oplichten, () => true);
}

/** Het woord (index) dat Bliepo nu zegt in deze zin, of -1. */
export function useWoordNu(gesproken: string | null | undefined): number {
  const v = useSyncExternalStore(abonneerVoorlees, huidigeVoorlees, () => null);
  const past = Boolean(v && gesproken && vergelijkbaar(v.zin) === vergelijkbaar(gesproken));
  const [nu, zetNu] = useState(-1);
  useEffect(() => {
    if (!past || !v) return;
    let frame = 0;
    const loop = () => {
      const t = (performance.now() - v.start) / 1000;
      let i = -1;
      for (let k = 0; k < v.tijden.length; k++) if (v.tijden[k].begin <= t) i = k;
      zetNu(i);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [past, v]);
  return past ? nu : -1;
}

export function BliepoTekst({
  woorden,
  gesproken,
  className = "",
}: {
  woorden: React.ReactNode[];
  gesproken?: string | null;
  className?: string;
}) {
  const oplichten = useOplichten();
  const nu = useWoordNu(oplichten ? gesproken : null);
  return (
    <p className={`bliepo-tekst ${className}`}>
      {woorden.map((w, i) => (
        <span key={i} className={`bliepo-tekst-woord${nu >= i ? " bliepo-tekst-gezegd" : ""}${nu === i ? " bliepo-tekst-nu" : ""}`}>
          {w}
          {i < woorden.length - 1 ? " " : ""}
        </span>
      ))}
    </p>
  );
}

/** Een gewone zin in woorden. */
export function inWoorden(zin: string): string[] {
  return zin.trim().split(/\s+/).filter(Boolean);
}
