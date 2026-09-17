/**
 * Zo vergelijk je getallen.
 *
 * Dit is wat een kind ziet als er geen denkfout wordt herkend: eerst álle
 * getallen lezen, dan pas kiezen. Dat is bij vergelijken de hele kunst — wie
 * meteen pakt, pakt wat het dichtst bij ligt.
 */

import type { Aanpak, Somgegevens } from "@/lib/generatoren/foutpatroon";

const zoektGrootste = (som: Somgegevens) => (som.extra?.grootste ?? 1) === 1;

export const vissenAanpak: Aanpak = {
  zin: (som) =>
    zoektGrootste(som)
      ? {
          "34": "Zoek het grootste getal.",
          "56": "Lees alle getallen en kies daarna het grootste.",
          "78": "Vergelijk eerst alle getallen; het grootste heeft de meeste cijfers, of bij gelijk aantal het grootste eerste cijfer.",
        }
      : {
          "34": "Zoek het kleinste getal.",
          "56": "Lees alle getallen en kies daarna het kleinste.",
          "78": "Vergelijk eerst alle getallen; het kleinste heeft de minste cijfers, of bij gelijk aantal het kleinste eerste cijfer.",
        },

  stappen: (som) => [
    { tekst: "Lees alle getallen hardop.", som: "" },
    { tekst: "Zet ze op volgorde in je hoofd.", som: "" },
    {
      tekst: zoektGrootste(som) ? "De laatste is de grootste." : "De eerste is de kleinste.",
      som: `${som.goed}`,
    },
  ],

  controle: (som) =>
    zoektGrootste(som)
      ? `Het goede antwoord is ${som.goed}: dat is het grootste getal dat er zwemt.`
      : `Het goede antwoord is ${som.goed}: dat is het kleinste getal dat er zwemt.`,
};
