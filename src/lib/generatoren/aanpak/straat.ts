/**
 * Zo vind je het buurgetal.
 *
 * Dit is wat een kind ziet als er geen denkfout wordt herkend: geen gok over
 * wat er misging, maar de werkwijze zelf.
 *
 * En die werkwijze is hier bewust concreet: kijk waar Vos staat, kijk welke
 * kant je op moet, en doe één stap. Bij even en oneven is die stap er twee,
 * want het huis aan dezelfde kant staat er twee verder.
 */

import type { Aanpak, Somgegevens } from "@/lib/generatoren/foutpatroon";

const basisVan = (som: Somgegevens) => som.extra?.basis ?? som.goed;
const stapVan = (som: Somgegevens) => som.extra?.stap ?? 1;
const vooruit = (som: Somgegevens) => (som.extra?.vooruit ?? 1) === 1;
const isEven = (som: Somgegevens) => (som.extra?.even ?? 0) === 1;

export const straatAanpak: Aanpak = {
  zin: (som) => {
    const richting = vooruit(som) ? "verder" : "terug";
    if (isEven(som)) {
      return {
        "34": `Zelfde kant: twee ${richting}.`,
        "56": `Aan dezelfde kant van de straat ga je met twee tegelijk ${richting}.`,
        "78": `Even nummers staan tegenover oneven, dus het volgende huis aan dezelfde kant ligt twee ${richting}.`,
      };
    }
    return {
      "34": `Doe één huis ${richting}.`,
      "56": `Het buurhuis is één ${richting}: tel één stap vanaf het nummer van Vos.`,
      "78": `Het buurgetal ligt één stap ${richting} op de telrij.`,
    };
  },

  stappen: (som) => {
    const basis = basisVan(som);
    const stap = stapVan(som);
    const teken = vooruit(som) ? "+" : "−";
    return [
      { tekst: "Kijk waar Vos staat.", som: `${basis}` },
      {
        tekst: vooruit(som) ? "Ga naar rechts." : "Ga naar links.",
        som: `${basis} ${teken} ${stap}`,
      },
      { tekst: "Dat is het buurhuis.", som: `${som.goed}` },
    ];
  },

  controle: (som) => {
    const basis = basisVan(som);
    const stap = stapVan(som);
    const woord = vooruit(som) ? "erbij" : "eraf";
    return isEven(som)
      ? `Het goede antwoord is ${som.goed}: aan dezelfde kant van de straat gaat er twee ${woord} bij ${basis}.`
      : `Het goede antwoord is ${som.goed}: vanaf ${basis} is dat ${stap} ${woord}.`;
  },
};
