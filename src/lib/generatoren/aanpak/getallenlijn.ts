/**
 * Zo zet je een getal op de goede plek.
 *
 * Niet raden waar het ongeveer zit, maar: zoek een getal dat er wél staat en
 * tel van daaraf streepje voor streepje verder. Dat is dezelfde werkwijze die
 * een kind op de getallenlijn in de klas gebruikt, en hij blijft werken als er
 * straks alleen nog tientallen onder staan.
 */

import type { Aanpak, Somgegevens } from "@/lib/generatoren/foutpatroon";

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
  zin: () => ({
    "34": "Zoek een getal dat er staat. Tel verder.",
    "56": "Zoek het dichtstbijzijnde getal dat er wél staat en tel van daaraf streepje voor streepje verder.",
    "78": "Bepaal eerst het dichtstbijzijnde zichtbare getal en tel van daaraf door; zo hoef je de lijn niet in één keer te overzien.",
  }),

  stappen: (som) => {
    const doel = som.getallen[0];
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
