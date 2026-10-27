"use client";

/**
 * Grote keuzeknoppen voor hologramlessen (27 oktober 2026): cijfers (of een
 * plaatje), nooit woorden (ONTWERPREGELS.md, groep 3 leest nog niet). Een
 * foute keuze wordt grijs en kan niet nog eens; het kind kiest opnieuw.
 * Cijfers worden niet voorgelezen; staat er toch een woord op, dan leest
 * Bliepo het voor als het kind erop tikt.
 */

import { zeg } from "@/lib/stem";
import s from "./keuzes.module.css";

export function KeuzeKnoppen({
  opties,
  uit,
  goed,
  actief = true,
  kies,
  className = "",
}: {
  opties: (number | string)[];
  /** Al fout gekozen: grijs. */
  uit: (number | string)[];
  /** Het goede antwoord, als het gevonden is (groen). */
  goed?: number | string | null;
  actief?: boolean;
  kies: (o: number | string) => void;
  className?: string;
}) {
  return (
    <div className={`${s.rij} ${className}`} data-knop="keuzes">
      {opties.map((o) => {
        const isUit = uit.includes(o);
        const isGoed = goed === o;
        return (
          <button
            key={String(o)}
            type="button"
            className={`${s.knop} ${isUit ? s.uit : ""} ${isGoed ? s.goed : ""}`}
            disabled={!actief || isUit || (goed !== undefined && goed !== null)}
            aria-label={String(o)}
            onClick={() => {
              if (typeof o === "string" && /[a-z]/i.test(o)) zeg(o);
              kies(o);
            }}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

/** Vier keuzes rond het goede antwoord: dichtbij (±1, ±2), zonder dubbele, binnen [min, max]. */
export function vierKeuzes(antwoord: number, min = 0, max = 20): number[] {
  const set = new Set<number>([antwoord]);
  const kandidaten = [antwoord - 1, antwoord + 1, antwoord - 2, antwoord + 2, antwoord + 3, antwoord - 3, antwoord + 10, antwoord - 10].filter((n) => n >= min && n <= max);
  for (const k of kandidaten.sort(() => Math.random() - 0.5)) {
    if (set.size >= 4) break;
    set.add(k);
  }
  for (let n = min; set.size < 4 && n <= max; n++) set.add(n);
  return [...set].sort((a, b) => a - b);
}
