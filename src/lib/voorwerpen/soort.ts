/**
 * Vaste plaatjes voor de lessen (31 oktober 2026, besluit eigenaar).
 *
 * Elk echt ding in een les (een appel, een bal, een raket) is één plaatje met
 * een vaste naam: public/voorwerpen/<naam>.png. De lessen laden het alleen via
 * die naam. Sara maakt de plaatjes zelf in Magnific; zolang dat nog niet is
 * gebeurd, staat er een simpel tijdelijk plaatje (placeholder). Vervangen is
 * dus alleen het bestand wisselen, zonder codewijziging. Zie WISSELEN.md.
 *
 * Rekendingen (stippen, blokjes, getallenlijn, klok, geld) zijn GEEN voorwerp:
 * die blijven in code getekend, zoals bij Synthesis.
 *
 * Regels: geen mensen, geen kaders, geen gezicht (alleen een dier mag twee
 * stipjes als ogen), liever geen dieren.
 */

/** De groepen, in de volgorde van MAGNIFIC-PROMPTS.md. */
export const GROEPEN = [
  { sleutel: "fruit", titel: "Fruit en groente" },
  { sleutel: "eten", titel: "Eten en drinken" },
  { sleutel: "speelgoed", titel: "Speelgoed en spelletjes" },
  { sleutel: "ruimte", titel: "Ruimte" },
  { sleutel: "vervoer", titel: "Vervoer" },
  { sleutel: "huis", titel: "In huis en op school" },
  { sleutel: "winkel", titel: "Winkel, zakken en dozen" },
  { sleutel: "feest", titel: "Feest" },
  { sleutel: "natuur", titel: "Natuur en buiten" },
  { sleutel: "dieren", titel: "Dieren (beperkt, alleen stipjes als ogen)" },
] as const;

export type Groep = (typeof GROEPEN)[number]["sleutel"];

export type Voorwerp = {
  /** Bestandsnaam zonder .png: kleine letters, cijfers en streepjes ("bal-rood"). */
  naam: string;
  /** Nederlandse naam voor Sara ("Rode bal"). */
  titel: string;
  groep: Groep;
  /** Wat er op het plaatje staat, in het Engels voor Magnific: alleen het ding, zonder stijl. */
  onderwerp: string;
  /**
   * De tijdelijke tekening: SVG-vormen op een vlak van 200 × 200, vlakke
   * kleuren, één donkere rand (zet zelf stroke="#1d2340" stroke-width="6"
   * of gebruik de klasse "r"), geen gezicht, geen verloop, geen schaduw.
   */
  schets: string;
  /** Dier: de prompt vraagt dan om twee stipjes als ogen (verder geen gezicht). */
  dier?: true;
};
