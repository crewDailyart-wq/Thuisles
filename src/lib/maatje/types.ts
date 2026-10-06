/**
 * De teksten van het maatje bij één opgave.
 *
 * Zo staan ze in de database (`maatje_teksten.teksten`, als JSON) en zo komen
 * ze bij de speler. De zes teksten zijn die uit hoofdstuk 4 van
 * MAATJE-HANDLEIDING.md:
 *
 *   1. voorlezen   als de opgave verschijnt
 *   2. bouw        alleen bij oefeningen waar het kind zelf bouwt
 *   3. goed        na Controleer, goed antwoord (opener + uitleg)
 *   4. fouten      na Controleer, één per bekende fout (opener + uitleg)
 *   5. uitleg      na Controleer, bij een fout die niet herkend wordt
 *   6. tip         na 30 seconden niets doen
 *
 * Elke zin heeft een plaatje-stap: wat het plaatje doet terwijl het maatje die
 * zin zegt, of "geen plaatje".
 */

export const GEEN_PLAATJE = "geen plaatje";

export type Zin = {
  tekst: string;
  /** Wat het plaatje voordoet bij deze zin, of `GEEN_PLAATJE`. */
  stap: string;
};

export type Fouttekst = {
  /** Korte naam van de fout, bijvoorbeeld "tien-vergeten". */
  code: string;
  /**
   * Antwoorden waaraan Thuisles deze fout herkent, zoals het kind ze geeft.
   * Bij meer vakjes met komma's ertussen; `*` is "maakt niet uit" en `!4` is
   * "alles behalve 4".
   */
  antwoorden: string[];
  /** De zinnen na de opener. */
  zinnen: Zin[];
};

export type MaatjeTeksten = {
  versie: number;
  /** Het antwoord waarvoor deze teksten geschreven zijn; klopt dat niet meer, dan zwijgt het maatje. */
  voor: string;
  voorlezen: Zin;
  bouw: Zin | null;
  goed: { openers: string[]; zinnen: Zin[] };
  fouten: { openers: string[]; lijst: Fouttekst[] };
  uitleg: Zin[];
  tip: Zin;
  /** "sommen" of "opdrachten", voor de zin aan het eind van de ronde. */
  rondewoord: "sommen" | "opdrachten";
};

/** Wat er bij het schrijven nodig is om de teksten te kunnen controleren. */
export type Controlegegevens = {
  /** Getallen die in de opgave zelf staan. */
  opgave: number[];
  /** Tussenstappen van de schoolstrategie, door Thuisles uitgerekend. */
  tussen: number[];
  /** Het goede antwoord, als getallen. Mag vóór Controleer nergens staan. */
  antwoord: number[];
  /** Per fout: de getallen die bij die fout horen (wat het kind typte, en wat daaruit volgt). */
  perFout: Record<string, number[]>;
  /** Bekende fouten van dit soort som; elk moet een eigen tekst 4 hebben. */
  bekend: string[];
};

export type Geschreven = { teksten: MaatjeTeksten; controle: Controlegegevens };
