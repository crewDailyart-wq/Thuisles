/** "Zo los je het op" bij tellen en slepen. */

import type { Aanpak } from "@/lib/generatoren/foutpatroon";

export const tellenslepenAanpak: Aanpak = {
  zin: (som) => {
    const reeks = som.getallen.join(", ");
    return {
      "34": `Tel bij elke afbeelding. Dat zijn er ${reeks}.`,
      "56": `Tel de onderdelen van elke afbeelding apart: ${reeks}. Leg elk getal onder de afbeelding waar je het geteld hebt.`,
      "78": `Tel per afbeelding, van links naar rechts: ${reeks}. Het gaat er niet alleen om dát je goed telt, maar ook dat elk getal onder de juiste afbeelding komt.`,
    };
  },

  stappen: (som) => [
    { tekst: "Begin bij de linkerafbeelding." },
    { tekst: "Raak elk onderdeel één keer aan terwijl je telt." },
    { tekst: "Leg dat getal in het vakje eronder." },
    { tekst: "Doe daarna de volgende.", som: som.getallen.join(" · ") },
  ],

  controle: (som) =>
    `De goede antwoorden zijn ${som.getallen.join(", ")}, van links naar rechts.`,
};
