/**
 * De munten en briefjes van de lessen Geld naar Squla (31 oktober 2026): welke
 * soorten er zijn en wat ze waard zijn. Los van het vlak (dat een
 * client-bestand is), zodat het draaiboek er ook bij het laden mee kan rekenen.
 * De afbeeldingen zelf staan in public/geld/ (officieel, ECB; zie BRON.md).
 */

export type GeldSoort = "c50" | "m1" | "m2" | "b5" | "b10" | "b20" | "b50" | "b100";

export const WAARDE: Record<GeldSoort, number> = { c50: 0.5, m1: 1, m2: 2, b5: 5, b10: 10, b20: 20, b50: 50, b100: 100 };

export const isBriefje = (g: GeldSoort) => g.startsWith("b");
