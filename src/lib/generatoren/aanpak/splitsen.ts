/** "Zo los je het op" bij splitsen. */

import type { Aanpak } from "@/lib/generatoren/foutpatroon";

export const splitsenAanpak: Aanpak = {
  zin: (som) => {
    const [geheel, deel] = som.getallen;
    return {
      "34": `${geheel} is het hele getal en ${deel} is één deel. Samen moeten ze ${geheel} zijn.`,
      "56": `${geheel} is het hele getal en ${deel} is één deel. Het andere deel is ${geheel} − ${deel} = ${som.goed}. Check: ${deel} + ${som.goed} = ${geheel}.`,
      "78": `Bij splitsen zijn de twee delen samen het hele getal. Je zoekt dus wat er nog bij ${deel} moet om aan ${geheel} te komen: ${geheel} − ${deel} = ${som.goed}. Controleer met ${deel} + ${som.goed} = ${geheel}.`,
    };
  },

  stappen: (som) => {
    const [geheel, deel] = som.getallen;
    return [
      { tekst: "Bovenaan staat het hele getal.", som: String(geheel) },
      { tekst: "Eén deel is al ingevuld.", som: String(deel) },
      { tekst: "Het andere deel haal je eraf.", som: `${geheel} − ${deel} = ${som.goed}` },
      { tekst: "Controleer: samen weer het hele getal.", som: `${deel} + ${som.goed} = ${geheel}` },
    ];
  },

  controle: (som) => {
    const [geheel, deel] = som.getallen;
    return `Het goede antwoord is ${som.goed}, want ${deel} + ${som.goed} = ${geheel}.`;
  },
};
