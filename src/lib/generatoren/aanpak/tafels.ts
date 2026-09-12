/** "Zo los je het op" bij de tafels. */

import type { Aanpak, Somgegevens } from "@/lib/generatoren/foutpatroon";

function delen(som: Somgegevens) {
  const tafel = som.extra?.tafel ?? som.getallen[0] ?? 0;
  const mee = som.extra?.mee ?? som.getallen[1] ?? 0;
  const product = som.extra?.product ?? tafel * mee;
  return { tafel, mee, product, variant: som.variant ?? "keer" };
}

/** De tafel doortellen: 8, 16, 24 … 56 */
function rij(stap: number, aantal: number): string {
  const getallen = Array.from({ length: Math.min(Math.max(aantal, 1), 10) }, (_, i) => stap * (i + 1));
  return getallen.length > 4
    ? `${getallen.slice(0, 3).join(", ")} … ${getallen[getallen.length - 1]}`
    : getallen.join(", ");
}

export const tafelsAanpak: Aanpak = {
  zin: (som) => {
    const { tafel, mee, product, variant } = delen(som);

    if (variant === "keer") {
      return {
        "34": `${tafel} × ${mee} is ${tafel} keer ${mee} erbij: ${rij(mee, tafel)}.`,
        "56": `${tafel} × ${mee} betekent ${tafel} keer ${mee} erbij: ${rij(mee, tafel)}.`,
        "78": `${tafel} × ${mee} betekent ${tafel} keer ${mee} erbij: ${rij(mee, tafel)}. Je mag ook omdraaien: ${mee} × ${tafel} geeft hetzelfde.`,
      };
    }

    return {
      "34": `Hoe vaak past ${tafel} in ${product}? Tel de tafel op: ${rij(tafel, mee)}.`,
      "56": `Zoek hoe vaak ${tafel} in ${product} past. Tel de tafel door: ${rij(tafel, mee)}.`,
      "78": `Delen is de omgekeerde keersom: je zoekt het getal dat met ${tafel} vermenigvuldigd ${product} geeft. Tel de tafel door: ${rij(tafel, mee)}.`,
    };
  },

  stappen: (som) => {
    const { tafel, mee, product, variant } = delen(som);

    if (variant === "keer") {
      return [
        { tekst: `${tafel} × ${mee} betekent ${tafel} keer ${mee} erbij.`, som: `${tafel} × ${mee}` },
        { tekst: "Tel de tafel door:", som: rij(mee, tafel) },
        { tekst: "Je komt uit op:", som: String(product) },
      ];
    }

    return [
      { tekst: `Je zoekt hoe vaak ${tafel} in ${product} past.`, som: `${product} : ${tafel}` },
      { tekst: "Tel de tafel door tot je erbij bent:", som: rij(tafel, mee) },
      { tekst: `Dat zijn ${mee} stappen.`, som: `${tafel} × ${mee} = ${product}` },
    ];
  },

  controle: (som) => {
    const { tafel, mee, product, variant } = delen(som);
    return variant === "keer"
      ? `Het goede antwoord is ${product}, want ${tafel} × ${mee} = ${product}.`
      : `Het goede antwoord is ${mee}, want ${tafel} × ${mee} = ${product}.`;
  },
};
