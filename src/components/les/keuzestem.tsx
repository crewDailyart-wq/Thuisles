"use client";

/**
 * Antwoordkeuzes laten voorlezen (30 oktober 2026, opdracht eigenaar). Groep 3
 * leest nog niet: Bliepo leest alleen de vraag, en het kind kan elke keuze zelf
 * laten voorlezen:
 *   - computer: muis 300 ms op de keuze laten staan;
 *   - tablet en telefoon: de keuze lang indrukken (500 ms). Dat telt NIET als
 *     antwoord; een gewone korte tik kiest;
 *   - toetsenbord: de keuze krijgt focus (Tab);
 *   - het luidsprekertje: alle keuzes één voor één.
 * De stem is altijd die van Ruth (lib/stem.ts, zegKeuze).
 */

import { useEffect, type CSSProperties, type FocusEvent, type MouseEvent, type PointerEvent } from "react";
import { haalKeuzesAlvast, stopKeuzeStem, zegKeuze, zegKeuzesNaElkaar } from "@/lib/stem";

const HOVER_MS = 300;
const LANG_MS = 500;

let klok: ReturnType<typeof setTimeout> | undefined;
/** Net lang ingedrukt: de klik die daarna komt is geen antwoord. */
let langGedrukt = false;

/** De handlers voor één keuzeknop. `tekst` = wat Bliepo zegt (bijvoorbeeld "7 plus 2 is 9"). */
export function keuzeStem(tekst: string) {
  return {
    onPointerEnter: (e: PointerEvent<HTMLElement>) => {
      if (e.pointerType !== "mouse") return;
      clearTimeout(klok);
      klok = setTimeout(() => zegKeuze(tekst), HOVER_MS);
    },
    onPointerLeave: () => {
      clearTimeout(klok);
    },
    onPointerDown: (e: PointerEvent<HTMLElement>) => {
      if (e.pointerType === "mouse") return;
      langGedrukt = false;
      clearTimeout(klok);
      klok = setTimeout(() => {
        langGedrukt = true;
        zegKeuze(tekst);
      }, LANG_MS);
    },
    onPointerUp: () => {
      clearTimeout(klok);
    },
    onPointerCancel: () => {
      clearTimeout(klok);
    },
    onClickCapture: (e: MouseEvent<HTMLElement>) => {
      if (!langGedrukt) return;
      langGedrukt = false;
      e.preventDefault();
      e.stopPropagation();
    },
    /* Lang indrukken opent op een tablet anders een menuutje. */
    onContextMenu: (e: MouseEvent<HTMLElement>) => {
      e.preventDefault();
    },
    onFocus: (e: FocusEvent<HTMLElement>) => {
      /* Alleen bij focus met het toetsenbord, niet na een klik. */
      if (e.currentTarget.matches(":focus-visible")) zegKeuze(tekst);
    },
    style: { WebkitTouchCallout: "none", WebkitUserSelect: "none", userSelect: "none" } as CSSProperties,
  };
}

/** De keuzes alvast ophalen zodra ze in beeld komen; stoppen als ze weggaan. */
export function useKeuzesAlvast(teksten: string[]) {
  const sleutel = teksten.join("\n");
  useEffect(() => {
    haalKeuzesAlvast(sleutel.split("\n"));
    return () => {
      clearTimeout(klok);
      stopKeuzeStem();
    };
  }, [sleutel]);
}

/** Het luidsprekertje: alle keuzes één voor één voorlezen. */
export function KeuzesVoorlezen({ teksten, className, style }: { teksten: string[]; className?: string; style?: CSSProperties }) {
  return (
    <button
      type="button"
      className={className}
      style={style}
      aria-label="Lees de keuzes voor"
      data-knop="keuzesvoorlezen"
      onClick={() => void zegKeuzesNaElkaar(teksten)}
    >
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
        <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" />
        <path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </button>
  );
}
