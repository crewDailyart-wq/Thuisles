/**
 * Vaste maten van het hologramvlak van Optellen tot 20 (27 oktober 2026),
 * apart van het vlak zelf (dat is een clientbestand), zodat het draaiboek ze
 * ook kan gebruiken. Punten van het vlak (980 × 720).
 */

/** Eén hokje van een tegel. */
export const CEL = 60;
/** Linksboven van het (onzichtbare) plaatsingsraster. Rij 0 begint onder de som. */
export const OX = 40;
export const OY = 100;
/** Het midden van de som bovenaan (lesscherm: 322 + 792 / 2 − 300), in hokjes. */
export const MIDDEN_KOLOM = (418 - OX) / CEL;
