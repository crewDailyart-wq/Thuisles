/**
 * Een getal uit het bereik, met de nadruk op het bovenste deel.
 *
 * Afspraak uit ONTWERPREGELS.md: de getallen liggen vooral in het bovenste
 * deel van het bereik. Bij "tot en met 15" moet een kind dus vooral sommen
 * rond de dertien en veertien tegenkomen en niet de helft van de tijd iets
 * onder de tien — dat laatste heeft het in een eerder onderwerp al gehad.
 *
 * Hoe: twee keer trekken en de grootste houden. Dat geeft een duidelijke
 * voorkeur voor boven zonder de onderkant helemaal uit te sluiten; met vijftien
 * vragen blijft er zo genoeg afwisseling over.
 */

import { heelGetal } from "@/lib/generatoren/soort";

export function heelGetalBovenaan(kans: () => number, van: number, tot: number): number {
  return Math.max(heelGetal(kans, van, tot), heelGetal(kans, van, tot));
}
