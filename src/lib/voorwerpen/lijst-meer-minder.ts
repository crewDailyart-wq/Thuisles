/**
 * Voorwerpen voor de lessen "Meer, minder, evenveel" (Squla groep 3). De
 * meeste dingen (appel, peer, ster, bloem, ballon, bal, koekje, ei, aardbei,
 * knikker, vlieger) staan al in een ander lijstbestand.
 */
import type { Voorwerp } from "./soort";

export const MEER_MINDER: Voorwerp[] = [
  {
    naam: "kraal",
    titel: "Kraal",
    groep: "speelgoed",
    onderwerp: "one round purple wooden bead with a hole through the middle, seen from the side",
    schets: `<circle class="r" cx="100" cy="100" r="66" fill="#b47bff"/><ellipse class="r" cx="100" cy="100" rx="14" ry="18" fill="#1d2340"/>`,
  },
  {
    naam: "potje",
    titel: "Leeg potje",
    groep: "huis",
    onderwerp: "an empty clear glass jar with an orange lid and a plain white label without text, front view",
    schets: `<rect class="r" x="40" y="46" width="120" height="140" rx="26" fill="#d9f0ff"/><rect class="r" x="50" y="18" width="100" height="34" rx="10" fill="#ff8f5a"/><rect class="r" x="54" y="86" width="92" height="70" rx="14" fill="#ffffff"/>`,
  },
];
