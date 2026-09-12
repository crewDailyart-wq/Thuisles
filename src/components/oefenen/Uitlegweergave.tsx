"use client";

/**
 * Wie krijgt welke uitleg te zien.
 *
 * Dit is de ENIGE plek waar die keuze wordt gemaakt. Zowel de kinderkant als
 * de voorvertoning in het beheer gebruiken dit onderdeel, zodat wat je in de
 * admin ziet precies is wat een kind ziet.
 *
 *   groep 3-4 en 5-6 -> de uitlegspeler: één stap tegelijk, Vos praat mee, het
 *                       kind bepaalt het tempo en tikt zelf mee;
 *   groep 7-8        -> de compacte stappenlijst: alles tegelijk in beeld, één
 *                       regel per stap, geen Vos, hooguit een voorleesknop.
 *
 * Bestaat de animatie voor een som nog niet, dan valt het terug op diezelfde
 * stappenlijst. Nieuwe generator-types volgen deze regel automatisch: ze
 * leveren alleen een script, de verdeling gebeurt hier.
 */

import { Stappenuitleg, type Lijstregel } from "@/components/oefenen/Stappenuitleg";
import { Uitlegspeler } from "@/components/oefenen/Uitlegspeler";
import type { Groepsvorm, Uitlegscript } from "@/lib/generatoren/uitlegscript";

/** Zet een script om naar regels voor de compacte lijst. */
export function naarLijst(script: Uitlegscript): Lijstregel[] {
  return script.stappen.map((stap) => ({
    tekst: stap.zin,
    som: stap.model.soort === "som" ? stap.model.tekst : undefined,
  }));
}

export function Uitlegweergave({
  vorm,
  script,
  terugval,
  onSluit,
  onNogEen,
}: {
  vorm: Groepsvorm;
  /** Het script van het generator-type, of null als het er nog niet is. */
  script: Uitlegscript | null;
  /** Stappen om te tonen als er geen script is. */
  terugval?: Lijstregel[];
  onSluit: () => void;
  onNogEen?: () => void;
}) {
  // Groep 7-8 leest, en kijkt niet naar een animatie.
  if (vorm === "78") {
    const regels = script ? naarLijst(script) : (terugval ?? []);
    if (regels.length === 0) return null;
    return (
      <Stappenuitleg stappen={regels} titel={script?.strategieNaam} onSluit={onSluit} />
    );
  }

  // Groep 3-4 en 5-6: de animatie, zodra die er voor deze som is.
  if (script) {
    return <Uitlegspeler script={script} onSluit={onSluit} onNogEen={onNogEen} />;
  }

  if (!terugval?.length) return null;
  return <Stappenuitleg stappen={terugval} onSluit={onSluit} />;
}
