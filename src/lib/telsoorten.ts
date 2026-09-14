/**
 * De telfiguren: welke soorten er zijn en hoe ze heten.
 *
 * Bewust een gewoon bestand zonder "use client". De generator draait namelijk
 * óók op de server, en een gewone export uit een clientcomponent komt daar niet
 * als echte waarde binnen — die loopt via een proxy en is dan geen lijst meer.
 * Precies daarop liep het beheerscherm stuk toen dit nog in `Telfiguren.tsx`
 * stond.
 *
 * ---------------------------------------------------------------------------
 * Een soort erbij
 * ---------------------------------------------------------------------------
 * Twee plekken, allebei op dezelfde naam:
 *   1. hier de woorden — wat je telt, en hoe het geheel heet;
 *   2. in `components/oefenen/Telfiguren.tsx` de tekening.
 *
 * De generator en de vraagzin hebben alleen dit bestand nodig; de tekening komt
 * er pas aan te pas als het kind de vraag ziet.
 */

export type Telwoorden = {
  /** Wat je telt, enkelvoud en meervoud. Voor de vraagzin en het voorlezen. */
  enkel: string;
  meervoud: string;
  /** Waar het geheel naar heet: "bloem", "boom". */
  geheel: string;
};

export const TELSOORT_WOORDEN: Record<string, Telwoorden> = {
  bloem: { enkel: "blaadje", meervoud: "blaadjes", geheel: "bloem" },
  boom: { enkel: "appel", meervoud: "appels", geheel: "boom" },
  ballon: { enkel: "ballon", meervoud: "ballonnen", geheel: "tros" },
  slinger: { enkel: "ster", meervoud: "sterren", geheel: "slinger" },
  lieveheersbeestje: { enkel: "stip", meervoud: "stippen", geheel: "lieveheersbeestje" },
};

export const TELSOORT_NAMEN = Object.keys(TELSOORT_WOORDEN);

/** De woorden, met terugval zodat een onbekende naam nooit een lege zin geeft. */
export function telsoortWoorden(naam: string): Telwoorden {
  return TELSOORT_WOORDEN[naam] ?? TELSOORT_WOORDEN.bloem;
}
