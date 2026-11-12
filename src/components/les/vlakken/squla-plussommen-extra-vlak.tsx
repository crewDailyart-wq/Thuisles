"use client";

/**
 * Het speelvlak van de EXTRA les Plussommen (squla-plus-bakkerij-1-gouden-extra, 12 november 2026; besluit Sara 22.3):
 * het tegelvlak van Optellen tot 10 (optellen10-holo-tegels.tsx, ongewijzigd), iets kleiner vanaf links.
 *
 * Reden (BOUWREGELS 15.30, vaste zones): in de gouden indeling staat het tekstvak van Bliepo rechts. Het tegelvlak loopt van
 * links tot 980 punten en de bak met tegels staat helemaal rechts; zonder deze verkleining lag de bak voor een deel onder
 * het tekstvak en was de tegel van 3 niet aan te tikken (gemeten in de test: elementFromPoint gaf het tekstvak). Net als
 * bij de gouden les Splitsen (KLEINER in squla-splitsen-gouden-vlak.tsx) staat het hele vlak daarom iets kleiner vanaf links.
 */

import type { Vlakbasis } from "../soort";
import { HoloTegelvlak, type HoloTegelProps } from "./optellen10-holo-tegels";

export const KLEINER_TEGELS = 0.86;

export function KleinTegelVlak(props: HoloTegelProps & Vlakbasis) {
  return (
    <div style={{ position: "absolute", inset: 0, transform: `scale(${KLEINER_TEGELS})`, transformOrigin: "0 50%" }} data-tegels-extra="">
      <HoloTegelvlak {...props} />
    </div>
  );
}
