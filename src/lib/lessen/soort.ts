/**
 * Uitleglessen (oktober 2026), naar de lessen van Synthesis.
 *
 * Een les is een vaste reeks stappen, altijd in dezelfde volgorde. Bij elke
 * stap legt de mascotte eerst iets uit (`uitleg`, zin voor zin, hoogstens tien
 * woorden per zin) en stelt dan een kleine vraag over wat er in het spel te
 * zien is. Het kind doet eerst, en de som komt daarna — zoals bij Synthesis.
 *
 * Elke stap wordt een gewone vraag (figuur `godotspel`, zie
 * `components/oefenen/GodotSpel.tsx`), met een volgnummer zodat de les op
 * volgorde blijft. Het aantal vragen per oefensessie is het aantal stappen.
 */

export type Lesstap = {
  /** Wat de mascotte eerst zegt. Korte zinnen, die passen bij wat er in beeld staat. */
  uitleg: string[];
  /** De vraag zelf, groot bovenaan. */
  vraag: string;
  /** De som of zin onder de vraag; "?" is het invulvak (typen) of de keuze (kiezen). */
  kop: string;
  invoer: "typen" | "kiezen";
  /** Welk Godot-spel en wat het laat zien. */
  spel: string;
  opgave: Record<string, unknown>;
  antwoord: string;
  goedZin: string;
  foutZin: string;
  /** Een kleine hint, zonder het antwoord. */
  tip: string;
};

export type Les = {
  id: string;
  /** Naam voor het kind. */
  titel: string;
  /** De Synthesis-les waar hij op lijkt, alleen voor in beheer. */
  synthesis: string;
  stappen: Lesstap[];
};
