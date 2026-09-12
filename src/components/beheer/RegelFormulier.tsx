"use client";

/**
 * Twee kleine, herbruikbare formulieren die op elk detailscherm terugkomen:
 *
 *   - `Bewerkblok`: klapt open onder de gegevens, om die gegevens aan te passen
 *     of het onderdeel te verwijderen;
 *   - `ToevoegBlok`: onderaan de tabel, om er direct iets aan toe te voegen.
 *
 * Overal dezelfde vorm, dezelfde plek, dezelfde sneltoets (Cmd/Ctrl + Enter).
 */

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { stijl } from "@/components/beheer/Bouwstenen";

export function opSneltoets(e: React.KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
    e.currentTarget.closest("form")?.requestSubmit();
  }
}

export function Fout({ tekst }: { tekst: string }) {
  if (!tekst) return null;
  return (
    <p className="mt-2 rounded border border-roze/40 bg-roze-zacht px-2 py-1 text-xs font-medium text-roze">
      {tekst}
    </p>
  );
}

/** Voert een actie uit, toont een fout of ververst het scherm. */
export function useActie() {
  const router = useRouter();
  const [bezig, start] = useTransition();
  const [fout, setFout] = useState("");

  /*
    `na` krijgt de uitslag mee, zodat een scherm iets kan doen met wat de actie
    teruggaf ("12 sommen bijgewerkt"). Aanroepers die daar niets mee hoeven,
    laten de parameter gewoon weg.
  */
  function doe<T extends { ok: boolean; fout?: string }>(
    actie: () => Promise<T>,
    na?: (uitslag: T) => void,
  ) {
    setFout("");
    start(async () => {
      const u = await actie();
      if (!u.ok) {
        setFout(u.fout ?? "Er ging iets mis.");
        return;
      }
      na?.(u);
      router.refresh();
    });
  }

  return { doe, bezig, fout, setFout, router };
}

export function Bewerkknop({
  open,
  onWissel,
}: {
  open: boolean;
  onWissel: () => void;
}) {
  return (
    <button type="button" onClick={onWissel} className={stijl.knopStil}>
      {open ? "Sluiten" : "Bewerken"}
    </button>
  );
}
