/**
 * De ontdekkingswerelden van Zappie, in de volgorde waarin het kind ze opent.
 *
 * Een nieuwe wereld erbij is één regel in `WERELDEN` plus een beeld in
 * `public/assets/zappie/`. Wanneer een wereld opengaat, volgt uit de volgorde:
 * de volgende wereld gaat open zodra alle missies van de vorige klaar zijn.
 */

export type WereldId = "oceaan" | "aarde" | "heelal";

export type Wereld = {
  id: WereldId;
  /** Zoals het kind de wereld ziet. */
  naam: string;
  /** Bestandsnaam zonder extensie in public/assets/zappie (AVIF en WebP). */
  beeld: string;
  /** Hoeveel missies er in deze wereld zijn. */
  missies: number;
};

export const WERELDEN: readonly Wereld[] = [
  { id: "oceaan", naam: "Oceaan", beeld: "ocean-world", missies: 12 },
  { id: "aarde", naam: "Aarde", beeld: "earth-world", missies: 12 },
  { id: "heelal", naam: "Universum", beeld: "universe-world", missies: 12 },
];

export const ASSETS = "/assets/zappie";

export function vindWereld(id: string | undefined): Wereld | undefined {
  return WERELDEN.find((w) => w.id === id);
}
