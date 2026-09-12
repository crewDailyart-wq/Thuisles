"use client";

/**
 * De groep wisselen vanaf het profielbolletje rechtsboven.
 *
 * "Groep 5" stond er al als tekst; nu is het een knop die een lijstje opent
 * met groep 3 tot en met 8. Kiezen schrijft meteen door naar het profiel van
 * het kind — dezelfde instelling die een ouder in de ouderomgeving aanpast,
 * alleen sneller bereikbaar. Er is geen aparte testmodus en geen tijdelijke
 * weergave: de groep ís veranderd.
 *
 * `router.refresh()` na afloop haalt de serverschermen opnieuw op, zodat de
 * leerdoelen van de nieuwe groep meteen in beeld staan zonder herladen.
 *
 * Toetsenbord en voorleesprogramma: het is een echte knop met `aria-expanded`,
 * de lijst is een `listbox` met de huidige groep als `aria-selected`, en Escape
 * sluit hem. Een klik buiten het menu sluit het ook.
 */

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { wisselGroep } from "@/app/groepacties";

const GROEPEN = [3, 4, 5, 6, 7, 8];

export function Groepwisselaar({ groep }: { groep: number }) {
  const [open, setOpen] = useState(false);
  const [bezig, start] = useTransition();
  const router = useRouter();
  const omhulsel = useRef<HTMLDivElement>(null);

  // Klik ergens anders, of Escape: dichtklappen.
  useEffect(() => {
    if (!open) return;

    function buiten(e: MouseEvent) {
      if (!omhulsel.current?.contains(e.target as Node)) setOpen(false);
    }
    function toets(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", buiten);
    document.addEventListener("keydown", toets);
    return () => {
      document.removeEventListener("mousedown", buiten);
      document.removeEventListener("keydown", toets);
    };
  }, [open]);

  function kies(nieuw: number) {
    setOpen(false);
    if (nieuw === groep) return;

    start(async () => {
      await wisselGroep(nieuw);
      // De schermen hangen aan de groep; haal ze opnieuw op.
      router.refresh();
    });
  }

  return (
    <div ref={omhulsel} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={bezig}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Groep ${groep}. Klik om een andere groep te kiezen.`}
        className="flex items-center gap-1 rounded text-xs font-bold text-inkt-zacht transition hover:text-viool disabled:opacity-60"
      >
        {bezig ? "Bezig…" : `Groep ${groep}`}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={`size-3 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Kies een groep"
          className="absolute right-0 z-50 mt-2 w-36 overflow-hidden rounded-kaart border border-rand bg-kaart py-1 shadow-op"
        >
          {GROEPEN.map((g) => (
            <li key={g}>
              <button
                type="button"
                role="option"
                aria-selected={g === groep}
                onClick={() => kies(g)}
                className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm font-bold transition ${
                  g === groep
                    ? "bg-viool-zacht text-viool-diep"
                    : "text-inkt hover:bg-room"
                }`}
              >
                Groep {g}
                {g === groep && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="size-3.5">
                    <path d="m5 12.5 4.5 4.5L19 7.5" />
                  </svg>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
