/**
 * De telplaatjes: welke er zijn en hoe ze heten.
 *
 * Bewust een gewoon bestand zonder "use client", net als `telsoorten.ts`. De
 * generator draait namelijk óók op de server, en een gewone export uit een
 * clientcomponent komt daar niet als echte waarde binnen — die loopt via een
 * proxy en is dan geen lijst meer. Precies daarop liep het beheerscherm ooit
 * stuk toen zo'n lijst nog in een tekencomponent stond.
 *
 * ---------------------------------------------------------------------------
 * Eentje erbij
 * ---------------------------------------------------------------------------
 * Twee plekken, allebei op dezelfde naam:
 *   1. hier de naam én het meervoud, voor de keuzelijst in het beheer en voor
 *      de vraagzin ("Hoeveel eendjes tel je?");
 *   2. in `components/oefenen/Telplaatjes.tsx` de tekening.
 *
 * De generator en het sjabloonscherm hebben alleen dit bestand nodig; de
 * tekening komt er pas aan te pas als het kind de vraag ziet.
 */

/**
 * Het meervoud staat erbij en wordt niet uitgerekend.
 *
 * Nederlandse meervouden zijn niet met een regel te vangen: bal wordt ballen,
 * appel wordt appels, ster wordt sterren en schildpad wordt schildpadden. Eén
 * woord per plaatje opschrijven is korter dan elke uitzondering programmeren,
 * en het blijft kloppen als er een plaatje bij komt.
 */
export const TELPLAATJE_OPTIES: { waarde: string; label: string; meervoud: string }[] = [
  { waarde: "eend", label: "Eendje", meervoud: "eendjes" },
  { waarde: "bal", label: "Bal", meervoud: "ballen" },
  { waarde: "appel", label: "Appel", meervoud: "appels" },
  { waarde: "schildpad", label: "Schildpad", meervoud: "schildpadden" },
  { waarde: "auto", label: "Autootje", meervoud: "autootjes" },
  { waarde: "ster", label: "Ster", meervoud: "sterren" },
  { waarde: "bloem", label: "Bloem", meervoud: "bloemen" },
  { waarde: "vis", label: "Visje", meervoud: "visjes" },
];

export const TELPLAATJE_NAMEN = TELPLAATJE_OPTIES.map((o) => o.waarde);

/**
 * Het meervoud van een plaatje, voor in de vraagzin.
 *
 * Leeg bij een onbekende naam en bij een eigen geüploade afbeelding: die heeft
 * geen naam die je in een zin kunt zetten. De vraagzin valt dan terug op een
 * zin zonder naam erin; zie `plaatjestellen.ts`.
 */
export function meervoudVanTelplaatje(naam: string | null): string {
  if (!naam) return "";
  return TELPLAATJE_OPTIES.find((o) => o.waarde === naam)?.meervoud ?? "";
}

/** Bestaat deze naam? "eigen" hoort er niet bij: dat is de geüploade foto. */
export function isTelplaatje(naam: string): boolean {
  return TELPLAATJE_NAMEN.includes(naam);
}
