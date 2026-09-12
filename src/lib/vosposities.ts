/**
 * Waar de mond en de ogen van Vos zitten, per houding.
 *
 * Dit bestand bevat alleen getallen, geen code. Lever je nieuwe plaatjes aan,
 * dan stel je hier de posities bij tot ze goed staan — je hoeft nergens anders
 * iets te veranderen.
 *
 * Alle waarden zijn percentages van de afbeelding:
 *   x, y      = het midden van de mond of de ogen
 *   breedte   = hoe breed de mond of het oog is
 *   hoogte    = hoe hoog de mond is als hij helemaal open staat
 *
 * De plaatjes moeten een DICHTE mond hebben; de mond wordt eroverheen
 * getekend.
 */

export type Houding = "blij" | "wijzend" | "denkend" | "juichend" | "verrast";

export const HOUDINGEN: Houding[] = ["blij", "wijzend", "denkend", "juichend", "verrast"];

export type Vospositie = {
  mond: { x: number; y: number; breedte: number; hoogte: number };
  ogen: { links: { x: number; y: number }; rechts: { x: number; y: number }; straal: number };
};

/**
 * Startwaarden. Ze gaan ervan uit dat Vos ongeveer in het midden van het
 * plaatje staat en dat zijn kop in de bovenste helft zit. Stel ze bij zodra de
 * echte plaatjes er zijn.
 */
export const VOSPOSITIES: Record<Houding, Vospositie> = {
  blij: {
    mond: { x: 50, y: 41, breedte: 11, hoogte: 8 },
    ogen: { links: { x: 44, y: 31 }, rechts: { x: 57, y: 31 }, straal: 3.1 },
  },
  wijzend: {
    mond: { x: 48, y: 41, breedte: 11, hoogte: 8 },
    ogen: { links: { x: 42, y: 31 }, rechts: { x: 55, y: 31 }, straal: 3.1 },
  },
  denkend: {
    mond: { x: 50, y: 42, breedte: 9, hoogte: 6 },
    ogen: { links: { x: 44, y: 31 }, rechts: { x: 57, y: 31 }, straal: 3.1 },
  },
  juichend: {
    mond: { x: 50, y: 40, breedte: 12, hoogte: 10 },
    ogen: { links: { x: 44, y: 30 }, rechts: { x: 57, y: 30 }, straal: 3.1 },
  },
  verrast: {
    mond: { x: 50, y: 42, breedte: 9, hoogte: 10 },
    ogen: { links: { x: 44, y: 30 }, rechts: { x: 57, y: 30 }, straal: 3.4 },
  },
};

/** In welke map de plaatjes staan, en hoe ze heten. */
export const VOS_MAP = "/vos";
export function vosBestand(houding: Houding): string {
  return `${VOS_MAP}/${houding}.png`;
}
