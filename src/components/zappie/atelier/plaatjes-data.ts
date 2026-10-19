/**
 * Bij de plaatjes van het atelier (AtelierPlaatjes.tsx): per knop hoe groot het
 * plaatje is en waar Bliepo staat (x en y = zijn voeten, h = zijn hoogte, in procenten
 * van het plaatje; null = niet in beeld). Gemaakt door
 * scripts/maak-atelier-plaatjes.mjs uit het echte 3D-atelier.
 */
import type { StudyView } from './study-scene';

export type Vorm = 'breed' | 'smal';
type Plek = { x: number; y: number; h: number } | null;
export const PLAATJES: Record<Vorm, Record<StudyView, { breedte: number; hoogte: number; mascot: Plek }>> = {
  breed: {
    samen: { breedte: 2109, hoogte: 1347, mascot: {"x":52.91,"y":62.8,"h":16.86} },
    podium: { breedte: 2109, hoogte: 1347, mascot: {"x":50,"y":43.77,"h":33.23} },
    vitrine: { breedte: 2109, hoogte: 1347, mascot: null },
    koepel: { breedte: 2109, hoogte: 1347, mascot: {"x":55.91,"y":67.2,"h":12.4} },
    lintjes: { breedte: 2109, hoogte: 1347, mascot: null },
  },
  smal: {
    samen: { breedte: 552, hoogte: 1137, mascot: {"x":54.82,"y":56.56,"h":8.65} },
    podium: { breedte: 552, hoogte: 1137, mascot: {"x":50,"y":45.21,"h":25.56} },
    vitrine: { breedte: 552, hoogte: 1137, mascot: null },
    koepel: { breedte: 552, hoogte: 1137, mascot: {"x":61.22,"y":60.12,"h":7.29} },
    lintjes: { breedte: 552, hoogte: 747, mascot: null },
  },
};

/** Waar elk lintje staat in het plaatje van de lintjeskast (x, y, breedte, hoogte in procenten); zie scripts/maak-atelier-lintjes.mjs. */
export const LINTJES: Record<Vorm, number[][]> = {"breed":[[35.156,22.692,13.126,19.394],[49.903,22.054,13.198,20.102],[35.311,44.198,12.987,19.273],[49.904,44.334,13.053,19.972],[35.464,64.136,12.851,20.276],[49.905,64.935,12.911,21.044]],"smal":[[30.938,33.45,16.855,11.754],[49.875,33.063,16.948,12.183],[31.138,46.484,16.677,11.681],[49.877,46.566,16.762,12.104],[31.334,58.567,16.503,12.289],[49.878,59.051,16.58,12.754]]};
