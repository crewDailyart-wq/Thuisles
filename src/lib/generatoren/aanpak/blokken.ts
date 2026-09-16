/**
 * Zo pak je tientallen en eenheden aan.
 *
 * Dit is wat een kind ziet als er geen denkfout wordt herkend: geen gok over
 * wat er misging, maar de werkwijze zelf.
 *
 * Die werkwijze is bij dit materiaal altijd dezelfde en dat is precies de les:
 * eerst de staven met sprongen van tien, dan de losse erbij. Wie één voor één
 * begint te tellen, heeft het materiaal niet gebruikt.
 */

import type { Aanpak, Somgegevens } from "@/lib/generatoren/foutpatroon";

const tientallenVan = (som: Somgegevens) => som.extra?.tientallen ?? Math.floor(som.goed / 10);
const eenhedenVan = (som: Somgegevens) => som.extra?.eenheden ?? som.goed % 10;

export const blokkenAanpak: Aanpak = {
  zin: () => ({
    "34": "Tel eerst de staven: tien, twintig.",
    "56": "Tel eerst de staven met sprongen van tien, en tel dan de losse blokjes erbij.",
    "78": "Tel de staven als tientallen en de losse blokjes als eenheden; samen vormen ze het getal.",
  }),

  stappen: (som) => {
    const t = tientallenVan(som);
    const e = eenhedenVan(som);

    const stappen = [
      { tekst: "Eén staaf is tien blokjes.", som: "10" },
      {
        tekst: "Tel de staven met sprongen van tien.",
        som:
          t > 0
            ? Array.from({ length: t }, (_, i) => `${(i + 1) * 10}`).join(" → ")
            : "0",
      },
    ];

    if (e > 0) {
      stappen.push({
        tekst: "Tel de losse blokjes erbij.",
        som: `${t * 10} + ${e} = ${som.goed}`,
      });
    } else {
      stappen.push({ tekst: "Er liggen geen losse blokjes.", som: `${som.goed}` });
    }

    return stappen;
  },

  controle: (som) => {
    const t = tientallenVan(som);
    const e = eenhedenVan(som);
    return e > 0
      ? `Het goede antwoord is ${som.goed}: ${t} staven van tien is ${t * 10}, en dan nog ${e} losse blokjes.`
      : `Het goede antwoord is ${som.goed}: ${t} staven van tien, en geen losse blokjes.`;
  },
};
