"use client";

/**
 * Keuzes onder elkaar die je ook met de pijltjestoetsen kiest (oktober 2026),
 * naar Synthesis "Getting Started · Inputs": met pijltje omhoog en omlaag
 * wissel je tussen de keuzes, met Enter (of het blauwe vinkje) bevestig je.
 * Tikken mag ook. Het lesscherm kent geen pijltjestoetsen bij zijn eigen
 * knoppen, daarom staat dit in een eigen vlak.
 *
 * Melding: `keuze` (keuze: de tekst, toetsen: of er een pijltje gebruikt is).
 */

import { useEffect, useRef, useState } from "react";
import type { Vlakbasis } from "../soort";
import s from "./intro.module.css";

export type KeuzesProps = { opties: string[]; actief: boolean };

const Vink = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" aria-hidden>
    <path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function IntroKeuzes({ opties, actief, meld }: KeuzesProps & Vlakbasis) {
  const [gekozen, setGekozenState] = useState<number | null>(null);
  const gekozenRef = useRef<number | null>(null);
  const toetsen = useRef(false);
  const knoppen = useRef<(HTMLButtonElement | null)[]>([]);
  const setGekozen = (g: number | null) => {
    gekozenRef.current = g;
    setGekozenState(g);
  };

  useEffect(() => {
    if (!actief) return;
    const bijToets = (e: KeyboardEvent) => {
      const g = gekozenRef.current;
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        toetsen.current = true;
        const stap = e.key === "ArrowDown" ? 1 : -1;
        const nieuw = g === null ? (stap === 1 ? 0 : opties.length - 1) : (g + stap + opties.length) % opties.length;
        gekozenRef.current = nieuw;
        setGekozenState(nieuw);
        knoppen.current[nieuw]?.focus();
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (g !== null) meld({ soort: "keuze", keuze: opties[g], toetsen: toetsen.current });
      }
    };
    window.addEventListener("keydown", bijToets);
    return () => window.removeEventListener("keydown", bijToets);
  }, [actief, opties, meld]);

  return (
    <div className={s.keuzes}>
      {opties.map((o, i) => (
        <button
          key={o}
          ref={(el) => {
            knoppen.current[i] = el;
          }}
          type="button"
          className={s.knop}
          style={{ textAlign: "left" }}
          aria-pressed={gekozen === i}
          disabled={!actief}
          onClick={(e) => {
            /* Enter op een knop met focus komt hier ook binnen; dat regelt de toetsenluisteraar al. */
            if (e.detail === 0) return;
            setGekozen(i);
          }}
        >
          {o}
        </button>
      ))}
      <div className={s.toetsen}>
        <button
          type="button"
          className={s.rond}
          aria-label="Bevestig"
          disabled={!actief || gekozen === null}
          onClick={() => gekozen !== null && meld({ soort: "keuze", keuze: opties[gekozen], toetsen: toetsen.current })}
        >
          <Vink />
        </button>
        <span className={s.toets}>↑</span>
        <span className={s.toets}>↓</span>
        <span>kiezen</span>
        <span className={s.toets}>Enter</span>
        <span>klaar</span>
      </div>
    </div>
  );
}
