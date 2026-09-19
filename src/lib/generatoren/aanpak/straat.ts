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
/* Bij "allebei de buren" worden er twee gevraagd: eentje terug en eentje verder. */
const allebei = (som: Somgegevens) => (som.extra?.allebei ?? 0) === 1;
const linksVan = (som: Somgegevens) => som.extra?.links ?? 0;
const rechtsVan = (som: Somgegevens) => som.extra?.rechts ?? 0;

export const straatAanpak: Aanpak = {
  zin: (som) => {
    if (allebei(som)) {
      const stap = stapVan(som);
      return {
        "34": `Links eraf, rechts erbij.`,
        "56": `Ga vanaf het middelste nummer één keer ${stap} terug en één keer ${stap} verder.`,
        "78": `De buurgetallen liggen aan weerskanten: trek ${stap} af voor links en tel ${stap} op voor rechts.`,
      };
    }
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
    if (allebei(som)) {
      return [
        { tekst: "Kijk naar het middelste huis.", som: `${basis}` },
        { tekst: "Ga naar links: eraf.", som: `${basis} − ${stap} = ${linksVan(som)}` },
        { tekst: "Ga naar rechts: erbij.", som: `${basis} + ${stap} = ${rechtsVan(som)}` },
      ];
    }
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
    if (allebei(som)) {
      return `De goede antwoorden zijn ${linksVan(som)} en ${rechtsVan(som)}: vanaf ${basis} is dat ${stap} eraf en ${stap} erbij.`;
    }
    const woord = vooruit(som) ? "erbij" : "eraf";
    return isEven(som)
      ? `Het goede antwoord is ${som.goed}: aan dezelfde kant van de straat gaat er twee ${woord} bij ${basis}.`
      : `Het goede antwoord is ${som.goed}: vanaf ${basis} is dat ${stap} ${woord}.`;
  },
};
