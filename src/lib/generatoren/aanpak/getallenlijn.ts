/**
 * Zo zet je een getal op de goede plek.
 *
 * Niet raden waar het ongeveer zit, maar: zoek een getal dat er wél staat en
 * tel van daaraf streepje voor streepje verder. Dat is dezelfde werkwijze die
 * een kind op de getallenlijn in de klas gebruikt, en hij blijft werken als er
 * straks alleen nog tientallen onder staan.
 */

import type { Aanpak, Somgegevens } from "@/lib/generatoren/foutpatroon";

/** Gaat het om schatten op een lege lijn? */
export function isSchatten(som: Somgegevens): boolean {
  return som.extra?.schatten === 1;
}

/** Het midden van de lijn, als rond getal. */
export function middenVan(som: Somgegevens): number {
  const start = som.extra?.start ?? 0;
  const eind = som.extra?.eind ?? 100;
  return Math.round((start + eind) / 2);
}

/** Hoeveel één streepje verder is: 1, 5 of 10. */
export function stapVan(som: Somgegevens): number {
  const stap = som.extra?.stap;
  return stap && stap > 0 ? stap : 1;
}

/** De getallen die onder de streepjes staan, uit de somgegevens. */
export function vasteGetallen(som: Somgegevens): number[] {
  const hoeveel = som.extra?.aantalVast ?? 0;
  return Array.from({ length: hoeveel }, (_, k) => som.extra?.[`vast${k}`] ?? -1).filter(
    (n) => n >= 0,
  );
}

/**
 * Het zichtbare getal waar je het handigst vandaan telt: het dichtstbijzijnde,
 * en bij gelijke afstand het getal ervóór — vooruit tellen gaat makkelijker
 * dan terug.
 */
export function ankerVoor(som: Somgegevens, doel: number): number {
  /*
    Het gevraagde getal staat tegenwoordig zelf ook onder de lijn als de
    instelling dat zegt. Als anker is het dan waardeloos — "tel vanaf 10 naar
    10" legt niets uit — dus dat slaan we hier over en zoeken we het
    dichtstbijzijnde ándere getal.
  */
  const vast = vasteGetallen(som).filter((n) => n !== doel);
  if (vast.length === 0) return doel;
  return vast.reduce((beste, n) => {
    const verschil = Math.abs(n - doel) - Math.abs(beste - doel);
    if (verschil < 0) return n;
    if (verschil === 0 && n < beste) return n;
    return beste;
  }, vast[0]);
}

export const getallenlijnAanpak: Aanpak = {
  zin: (som) =>
    isSchatten(som)
      ? {
          "34": "Waar is het midden? Kijk vanaf daar.",
          "56": "Zoek eerst het midden van de lijn en kijk of je getal daarvoor of daarna ligt.",
          "78": "Gebruik ankerpunten: eerst de helft, dan een kwart of driekwart, en schat van daaruit hoe ver je getal nog komt.",
        }
      : {
    "34": "Zoek een getal dat er staat. Tel verder.",
    "56": "Zoek het dichtstbijzijnde getal dat er wél staat en tel van daaraf streepje voor streepje verder.",
    "78": "Bepaal eerst het dichtstbijzijnde zichtbare getal en tel van daaraf door; zo hoef je de lijn niet in één keer te overzien.",
  },

  stappen: (som) => {
    const doel = som.getallen[0];
    if (isSchatten(som)) {
      const start = som.extra?.start ?? 0;
      const eind = som.extra?.eind ?? 100;
      const midden = middenVan(som);
      const deel = (doel - start) / Math.max(1, eind - start);
      const kwart =
        deel < 0.375
          ? Math.round(start + (eind - start) / 4)
          : deel > 0.625
            ? Math.round(start + ((eind - start) * 3) / 4)
            : midden;
      return [
        { tekst: "Zoek het midden van de lijn.", som: `${midden}` },
        {
          tekst: deel > 0.5 ? "Jouw getal ligt daarna." : "Jouw getal ligt daarvoor.",
          som: `${doel}`,
        },
        { tekst: "Kijk naar het dichtstbijzijnde hulpgetal.", som: `${kwart}` },
        { tekst: "Daar vlakbij zet je Vos neer.", som: `${doel}` },
      ];
    }
    const anker = ankerVoor(som, doel);
    /* Eén streepje verder is vijf verder als er een streepje per vijf staat. */
    const stappen = Math.abs(doel - anker) / stapVan(som);
    const kant = doel >= anker ? "verder" : "terug";
    return [
      { tekst: "Kijk welk getal er onder een streepje staat.", som: `${anker}` },
      {
        tekst: `Tel van daaraf ${kant}, streepje voor streepje.`,
        som: stappen === 0 ? `${doel}` : `${anker} → ${doel}`,
      },
      {
        tekst: `Dat zijn ${stappen} ${stappen === 1 ? "stap" : "stappen"}.`,
        som: `${doel}`,
      },
      { tekst: "Daar zet je Vos neer.", som: `${doel}` },
    ];
  },

  controle: (som) => {
    if (isSchatten(som)) {
      const midden = middenVan(som);
      const doel = som.getallen[0];
      return `${doel} ligt ${doel > midden ? "na" : "voor"} het midden (${midden}). Zet Vos daar ongeveer neer; precies hoeft niet.`;
    }
    const doelen = som.getallen;
    if (doelen.length === 1) {
      const anker = ankerVoor(som, doelen[0]);
      const streepjes = Math.abs(doelen[0] - anker) / stapVan(som);
      return `Het getal ${doelen[0]} hoort ${streepjes} ${
        streepjes === 1 ? "streepje" : "streepjes"
      } ${doelen[0] >= anker ? "na" : "voor"} de ${anker}.`;
    }
    return `Elk getal hoort bij het streepje met hetzelfde getal: ${doelen.join(", ")}. Tel steeds vanaf het dichtstbijzijnde getal dat er wél staat.`;
  },
};
