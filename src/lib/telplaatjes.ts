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
 *   1. hier de naam, voor de keuzelijst in het beheer;
 *   2. in `components/oefenen/Telplaatjes.tsx` de tekening.
 *
 * De generator en het sjabloonscherm hebben alleen dit bestand nodig; de
 * tekening komt er pas aan te pas als het kind de vraag ziet.
 */

export const TELPLAATJE_OPTIES: { waarde: string; label: string }[] = [
  { waarde: "eend", label: "Eendje" },
  { waarde: "bal", label: "Bal" },
  { waarde: "appel", label: "Appel" },
  { waarde: "schildpad", label: "Schildpad" },
  { waarde: "auto", label: "Autootje" },
  { waarde: "ster", label: "Ster" },
  { waarde: "bloem", label: "Bloem" },
  { waarde: "vis", label: "Visje" },
];

export const TELPLAATJE_NAMEN = TELPLAATJE_OPTIES.map((o) => o.waarde);

/** Bestaat deze naam? "eigen" hoort er niet bij: dat is de geüploade foto. */
export function isTelplaatje(naam: string): boolean {
  return TELPLAATJE_NAMEN.includes(naam);
}
