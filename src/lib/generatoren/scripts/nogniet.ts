/**
 * Tijdelijke uitlegbron voor types waar de animatie nog niet voor gemaakt is.
 *
 * Het veld is verplicht, dus elk type moet iets leveren. Deze bron geeft voor
 * elke groepsvorm `null` terug: de uitlegspeler valt dan terug op de bestaande
 * stappenlijst, en de beheeromgeving laat zien dat dit type nog niet af is.
 * Zo werkt het oefenen gewoon door terwijl de animaties er één voor één bij
 * komen.
 */

import type { Uitlegbron } from "@/lib/generatoren/uitlegscript";

export function nogGeenUitleg(modellen: string[]): Uitlegbron {
  return {
    modellen,
    strategieen: [],
    standaardStrategie: () => "standaard",
    script: () => null,
    vergelijkbaar: () => null,
  };
}
