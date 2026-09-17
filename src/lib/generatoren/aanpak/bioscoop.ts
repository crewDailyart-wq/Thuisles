/**
 * Zo vind je een plek in het twintigveld.
 *
 * Niet tellen vanaf één, maar springen vanaf een nummer dat er staat. Dat is
 * de hele les: de zichtbare nummers zijn er om op te leunen, en wie ze
 * gebruikt hoeft nooit meer dan een paar stapjes te doen.
 */

import type { Aanpak, Somgegevens } from "@/lib/generatoren/foutpatroon";

const perRij = (som: Somgegevens) => som.extra?.perRij ?? 10;
const houvast = (som: Somgegevens) => som.extra?.houvast ?? som.goed;

export const bioscoopAanpak: Aanpak = {
  zin: (som) => {
    const h = houvast(som);
    const stappen = Math.abs(som.goed - h);
    if (stappen === 0) {
      return {
        "34": "Het nummer staat er al.",
        "56": "Dit nummer staat gewoon op een stoel.",
        "78": "Dit nummer is zichtbaar; je hoeft niet te tellen.",
      };
    }
    return {
      "34": `Begin bij ${h} en tel ${stappen} verder.`,
      "56": `Zoek ${h}, dat staat er, en tel daarvandaan ${stappen} verder.`,
      "78": `Gebruik ${h} als steunpunt en doe van daaruit ${stappen} stap${stappen === 1 ? "" : "pen"}.`,
    };
  },

  stappen: (som) => {
    const h = houvast(som);
    const rij = Math.ceil(som.goed / perRij(som));
    return [
      { tekst: "Kijk in welke rij het zit.", som: `rij ${rij}` },
      { tekst: "Zoek het dichtstbijzijnde nummer.", som: `${h}` },
      { tekst: "Tel van daaraf verder.", som: `${som.goed}` },
    ];
  },

  controle: (som) => {
    const h = houvast(som);
    const stappen = Math.abs(som.goed - h);
    return stappen === 0
      ? `Het goede antwoord is stoel ${som.goed}: dat nummer staat er gewoon.`
      : `Het goede antwoord is stoel ${som.goed}: vanaf ${h} zijn dat ${stappen} stapjes.`;
  },
};
