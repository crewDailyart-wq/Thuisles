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
import { MANIER_VAN_VORM } from "@/lib/generatoren/uitlegscript";
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
  mascotte = null,
  telplaatje = null,
  vakmateriaal = null,
  vakperRij = null,
}: {
  vorm: Groepsvorm;
  /** Het script van het generator-type, of null als het er nog niet is. */
  script: Uitlegscript | null;
  /** Stappen om te tonen als er geen script is. */
  terugval?: Lijstregel[];
  onSluit: () => void;
  onNogEen?: () => void;
  /** De mascotte van de vraag; gaat door naar de uitlegspeler. */
  mascotte?: string | null;
  /** Het getekende telplaatje van de vraag; gaat door naar de uitlegspeler. */
  telplaatje?: string | null;
  /** Het materiaal in de vakken van de vraag; gaat door naar de uitlegspeler. */
  vakmateriaal?: string | null;
  /** De opstelling in die vakken: rijen van vijf of verspreid. */
  vakperRij?: number | null;
}) {
  /*
    De hoogste groepen lezen en kijken niet naar een animatie. Dat hangt aan de
    MANIER van uitleggen, niet aan de losse groep: groep 7 en 8 delen dezelfde
    manier, maar zijn apart in te stellen.
  */
  if (MANIER_VAN_VORM[vorm] === "78") {
    const regels = script ? naarLijst(script) : (terugval ?? []);
    if (regels.length === 0) return null;
    return (
      <Stappenuitleg stappen={regels} onSluit={onSluit} />
    );
  }

  // Groep 3-4 en 5-6: de animatie, zodra die er voor deze som is.
  if (script) {
    return (
      <Uitlegspeler
        script={script}
        onSluit={onSluit}
        onNogEen={onNogEen}
        mascotte={mascotte}
        telplaatje={telplaatje}
        vakmateriaal={vakmateriaal}
        vakperRij={vakperRij}
      />
    );
  }

  if (!terugval?.length) return null;
  return <Stappenuitleg stappen={terugval} onSluit={onSluit} />;
}
