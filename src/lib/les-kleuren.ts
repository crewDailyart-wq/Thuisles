/**
 * De kleur van de kaart na een les (besluit Sara, 26 november 2026; KEUZES-VOOR-SARA.md, "Kleurregels").
 *
 * Gebaseerd op het onderzoek bij Junior Einstein (SYNTHESIS-ANALYSE/JUNIOR-EINSTEIN-KLEUREN.md): de kleur hangt af van het
 * PERCENTAGE goed (goed in 1 keer, over alle vragen van de les), niet van het aantal fouten en niet van de volgorde.
 * Alleen de kleuren en grenzen zijn overgenomen, geen teksten, plaatjes of vormgeving.
 * Zuivere functies zonder React of database: ook voor scripts en tests.
 */

export type LesKleur = {
  /** Vaste naam voor in de database en in tests. De kleur wordt nooit hardop genoemd of getoond als woord. */
  naam: string;
  /** Vanaf dit percentage (inclusief). */
  vanaf: number;
  rgb: [number, number, number];
};

/** Van hoog naar laag. */
export const KLEURTRAP: LesKleur[] = [
  { naam: "donkergroen", vanaf: 95, rgb: [80, 168, 44] },
  { naam: "groen", vanaf: 90, rgb: [98, 178, 47] },
  { naam: "lichtgroen", vanaf: 85, rgb: [139, 189, 41] },
  { naam: "geelgroen", vanaf: 80, rgb: [165, 197, 37] },
  { naam: "geel-groen", vanaf: 75, rgb: [195, 205, 32] },
  { naam: "geel", vanaf: 70, rgb: [237, 216, 25] },
  { naam: "oranje", vanaf: 60, rgb: [249, 186, 13] },
  { naam: "donkeroranje", vanaf: 50, rgb: [244, 152, 28] },
  { naam: "roodoranje", vanaf: 40, rgb: [239, 113, 34] },
  { naam: "bijna-rood", vanaf: 30, rgb: [235, 89, 37] },
  { naam: "rood", vanaf: 0, rgb: [229, 41, 44] },
];

/** De beste kleur: vanaf hier telt een herhaling als "gehaald" (de tweede ster). */
export const BESTE_VANAF = 95;

export function kleurVoorPercentage(procent: number): LesKleur {
  const p = Number.isFinite(procent) ? Math.max(0, Math.min(100, procent)) : 0;
  return KLEURTRAP.find((k) => p >= k.vanaf) ?? KLEURTRAP[KLEURTRAP.length - 1];
}

export function kleurOpNaam(naam: string): LesKleur | undefined {
  return KLEURTRAP.find((k) => k.naam === naam);
}

export function kleurCss(k: LesKleur): string {
  return `rgb(${k.rgb[0]}, ${k.rgb[1]}, ${k.rgb[2]})`;
}

/** Percentage goed in 1 keer, afgerond; geen vragen = 0. */
export function percentageGoed(goedInEenKeer: number, totaal: number): number {
  if (!(totaal > 0)) return 0;
  return Math.round((Math.max(0, goedInEenKeer) / totaal) * 100);
}

/** Na hoeveel dagen een kaart zonder beste kleur een herhaal-teken krijgt (Sara: "na 1 tot 3 dagen"; hier het midden). */
export const HERHAAL_NA_DAGEN = 2;

export function herhaalTekenNodig(kleurNaam: string, datumIso: string, nu: Date = new Date()): boolean {
  const k = kleurOpNaam(kleurNaam);
  if (!k || k.vanaf >= BESTE_VANAF) return false;
  const t = Date.parse(datumIso);
  if (!Number.isFinite(t)) return false;
  return nu.getTime() - t >= HERHAAL_NA_DAGEN * 24 * 3600 * 1000;
}
