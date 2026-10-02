/**
 * Wat er in de lege vakjes van een keersom of deelsom hoort.
 *
 * ---------------------------------------------------------------------------
 * Waarom dit naast het scherm staat en niet erin
 * ---------------------------------------------------------------------------
 * Bij de oudere domeinen staat deze lijst in het scherm zelf
 * (`Erafopdracht.tsx`, `Optelopdracht.tsx`). Dat werkt, maar het kan niet
 * nagerekend worden: een controlescript kan geen scherm inladen, want daar zit
 * JSX in.
 *
 * Hier staat het daarom in een gewoon bestand. Daardoor kan `npm run opgaven`
 * van élke gemaakte opgave nakijken dat het antwoord van de generator precies
 * past op de vakjes die het scherm tekent. Dat is de fout die je anders pas
 * merkt als een kind een goed antwoord rood ziet worden.
 *
 * Geen "use client" en geen React: alleen rekenwerk, zodat zowel het scherm, de
 * server als een script het kan gebruiken.
 */

import type { Figuur } from "@/lib/generatoren/soort";

/** De figuren van de domeinen Tafels en Delen. */
export type Keerfiguur = Extract<
  Figuur,
  {
    soort:
      | "deelsom"
      | "deelkoppelen"
      | "welkedeelsom"
      | "keersom"
      | "keerkoppelen"
      | "welkekeersom"
      | "keerraster"
      | "keerplaatjes"
      | "handigkeer"
      | "keernullen"
      | "keerdeelkoppelen"
      | "keerdeelsamen"
      | "marktkraam";
  }
>;

export const KEERSOORTEN = [
  "deelsom",
  "deelkoppelen",
  "welkedeelsom",
  "keersom",
  "keerkoppelen",
  "welkekeersom",
  "keerraster",
  "keerplaatjes",
  "handigkeer",
  "keernullen",
  "keerdeelkoppelen",
  "keerdeelsamen",
  "marktkraam",
];

export function isKeerfiguur(figuur: Figuur | null | undefined): figuur is Keerfiguur {
  return figuur !== null && figuur !== undefined && KEERSOORTEN.includes(figuur.soort);
}

/**
 * Hoeveel vakjes er in te vullen zijn, en wat er in hoort.
 *
 * Bij de twee types waar het kind zelf een som mag bedenken staat hier één
 * geldig antwoord: dat is wat het scherm als voorbeeld kan laten zien. Of wat er
 * getypt is klopt, bepaalt `paarKlopt` — niet een vergelijking met deze lijst.
 */
export function juisteAntwoorden(figuur: Keerfiguur): number[] {
  switch (figuur.soort) {
    case "deelsom":
      return [figuur.geheel / figuur.deler];
    case "keersom":
      return [figuur.eerste * figuur.tweede];
    case "deelkoppelen":
      return figuur.sommen.map((s) => s.eerste / s.tweede);
    case "keerkoppelen":
      return figuur.sommen.map((s) => s.eerste * s.tweede);
    case "welkedeelsom":
      /* Eén voorbeeld: delen door 1 kan altijd. */
      return [figuur.uitkomst, 1];
    case "welkekeersom":
      return [1, figuur.uitkomst];
    case "keerraster":
      return [figuur.rijen * figuur.kolommen];
    case "keerplaatjes":
      return [figuur.rijen, figuur.kolommen, figuur.rijen * figuur.kolommen];
    case "handigkeer": {
      const nieuw = figuur.stap === "tienkeer" ? figuur.mee * 10 : figuur.mee * 2;
      return [figuur.tafel * nieuw];
    }
    case "keernullen":
      return [figuur.mee, figuur.mee * 10, figuur.mee * 100];
    case "keerdeelkoppelen":
      /* Per rij het nummer van de keersom die erbij hoort. */
      return figuur.sommen.map((s) =>
        figuur.keuzes.findIndex(
          (k) => k.eerste === s.deler && k.tweede === s.geheel / s.deler,
        ),
      );
    case "keerdeelsamen": {
      const mee = figuur.geheel / figuur.deler;
      return [mee, mee];
    }
    default: {
      const totaal = figuur.waren.reduce((n, w) => n + w.prijs * w.aantal, 0);
      return [figuur.betaald === null ? totaal : figuur.betaald - totaal];
    }
  }
}

/** Mag het kind bij dit type zelf een som bedenken? Dan telt het paar als geheel. */
export function isZelfBedacht(figuur: Keerfiguur): boolean {
  return figuur.soort === "welkedeelsom" || figuur.soort === "welkekeersom";
}

/**
 * Bij de twee "maak zelf een som"-types: klopt het paar dat er getypt staat?
 *
 * Elke som die uitkomt is goed, dus er valt niet per vakje na te kijken. De
 * grens staat in de figuur zelf, zodat het scherm niets hoeft te weten over
 * welke tafels er bij de oefening horen.
 */
export function paarKlopt(figuur: Keerfiguur, getypt: string[]): boolean {
  const a = Number(getypt[0]);
  const b = Number(getypt[1]);
  if (!Number.isInteger(a) || !Number.isInteger(b)) return false;

  if (figuur.soort === "welkedeelsom") {
    return b >= 1 && b <= figuur.max && a === b * figuur.uitkomst;
  }
  if (figuur.soort === "welkekeersom") {
    return a >= 1 && a <= figuur.max && b >= 1 && b <= figuur.max && a * b === figuur.uitkomst;
  }
  return false;
}

/** Het grootste getal dat in een vakje kan komen; daarmee weet het scherm wanneer het vol is. */
export function grootsteAntwoord(figuur: Keerfiguur): number {
  if (figuur.soort === "welkedeelsom") return figuur.uitkomst * figuur.max;
  if (figuur.soort === "welkekeersom") return figuur.uitkomst;
  return Math.max(20, ...juisteAntwoorden(figuur));
}
