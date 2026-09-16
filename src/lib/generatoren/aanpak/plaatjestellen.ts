/**
 * Zo pak je het tellen van plaatjes aan.
 *
 * Dit is wat een kind ziet als er geen denkfout wordt herkend: geen gok over
 * wat er misging, maar de werkwijze zelf.
 *
 * En die werkwijze hangt af van hoe de plaatjes staan. Liggen ze in rijen, dan
 * is groepsgewijs tellen sneller én betrouwbaarder dan stuk voor stuk: vijf, en
 * nog vijf, dat is tien. Liggen ze verspreid, dan is er geen groep om op te
 * leunen en gaat het om het aantikken — één voor één, en niets overslaan.
 */

import type { Aanpak, Somgegevens } from "@/lib/generatoren/foutpatroon";

const perRijVan = (som: Somgegevens) => som.extra?.perRij ?? 0;
const inRijen = (som: Somgegevens) => perRijVan(som) >= 2;

export const plaatjestellenAanpak: Aanpak = {
  zin: (som) => {
    if (!inRijen(som)) {
      return {
        "34": "Tik ze één voor één aan.",
        "56": "Tel ze één voor één en tik elk plaatje aan dat je gehad hebt.",
        "78": "Breng zelf structuur aan: maak groepjes, of ga vaste kant op en tik aan wat je geteld hebt.",
      };
    }
    const n = perRijVan(som);
    return {
      "34": `Tel per rij van ${n}.`,
      "56": `Elke rij heeft er ${n}. Tel de rijen bij elkaar op.`,
      "78": `Tel niet stuk voor stuk maar per rij van ${n}; dat is sneller en je slaat er minder snel een over.`,
    };
  },

  stappen: (som) => {
    const totaal = som.goed;

    if (!inRijen(som)) {
      return [
        { tekst: "Begin linksboven.", som: "1" },
        { tekst: "Tik elk plaatje aan terwijl je telt.", som: "" },
        { tekst: "Het laatste telwoord is het antwoord.", som: `${totaal}` },
      ];
    }

    const n = perRijVan(som);
    const helerijen = Math.floor(totaal / n);
    const rest = totaal - helerijen * n;

    const stappen = [
      { tekst: `Kijk hoeveel er op één rij staan.`, som: `${n}` },
      {
        tekst: `Tel de rijen: steeds ${n} erbij.`,
        som: Array.from({ length: Math.max(1, helerijen) }, (_, i) => `${(i + 1) * n}`).join(
          " → ",
        ),
      },
    ];

    if (rest > 0) {
      stappen.push({
        tekst: "Tel de losse plaatjes erbij.",
        som: `${helerijen * n} + ${rest} = ${totaal}`,
      });
    } else {
      stappen.push({ tekst: "Dat is samen het antwoord.", som: `${totaal}` });
    }

    return stappen;
  },

  controle: (som) => {
    const totaal = som.goed;
    if (!inRijen(som)) {
      return `Het goede antwoord is ${totaal}: zoveel plaatjes staan er, één voor één geteld.`;
    }
    const n = perRijVan(som);
    const helerijen = Math.floor(totaal / n);
    const rest = totaal - helerijen * n;
    return rest > 0
      ? `Het goede antwoord is ${totaal}, want ${helerijen} rijen van ${n} is ${helerijen * n}, en dan nog ${rest} erbij.`
      : `Het goede antwoord is ${totaal}, want ${helerijen} rijen van ${n} is ${totaal}.`;
  },
};
