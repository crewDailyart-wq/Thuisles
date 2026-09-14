/** "Zo los je het op" bij bus tellen. */

import type { Aanpak } from "@/lib/generatoren/foutpatroon";

/**
 * "zit er nog 1 kind" of "zitten er nog 3 kinderen".
 *
 * Het werkwoord moet meebuigen, anders staat er "zitten nog 1 kind". Vandaar
 * dat hier de hele zinsnede wordt opgebouwd en niet alleen het telwoord.
 */
function zittenNog(n: number): string {
  return n === 1 ? "zit er nog 1 kind" : `zitten er nog ${n} kinderen`;
}

function delen(totaal: number, perGroep: number) {
  const volleRamen = Math.floor(totaal / perGroep);
  return { volleRamen, rest: totaal - volleRamen * perGroep };
}

export const busAanpak: Aanpak = {
  zin: (som) => {
    const perGroep = som.getallen[1] || 5;
    const { volleRamen, rest } = delen(som.goed, perGroep);
    const sprongen = Array.from({ length: volleRamen }, (_, i) => (i + 1) * perGroep).join("… ");

    return {
      "34":
        rest > 0
          ? `Tel de ramen: ${sprongen || perGroep}. En dan nog ${rest} erbij.`
          : `Tel de ramen: ${sprongen || perGroep}. Dat zijn er ${som.goed}.`,
      "56":
        rest > 0
          ? `Tel per raam van ${perGroep}: ${sprongen || perGroep}. In het laatste raam ${zittenNog(rest)}, dus samen ${som.goed}.`
          : `Tel per raam van ${perGroep}: ${sprongen || perGroep}. Alle ramen zitten vol, dus dat zijn er ${som.goed}.`,
      "78":
        rest > 0
          ? `De kinderen zitten per ${perGroep} in een raam, dus je hoeft niet één voor één te tellen. Er zijn ${volleRamen} volle ramen: ${volleRamen} × ${perGroep} = ${volleRamen * perGroep}. In het laatste raam ${zittenNog(rest)}, dus ${volleRamen * perGroep} + ${rest} = ${som.goed}.`
          : `De kinderen zitten per ${perGroep} in een raam. Alle ${volleRamen} ramen zitten vol, dus ${volleRamen} × ${perGroep} = ${som.goed}.`,
    };
  },

  stappen: (som) => {
    const perGroep = som.getallen[1] || 5;
    const { volleRamen, rest } = delen(som.goed, perGroep);
    const sprongen = Array.from({ length: volleRamen }, (_, i) => (i + 1) * perGroep).join(", ");

    const stappen = [
      { tekst: `In elk raam zitten ${perGroep} kinderen.` },
      { tekst: "Tel per raam mee.", som: sprongen || "nog geen vol raam" },
    ];

    if (rest > 0) {
      stappen.push({
        tekst: `In het laatste raam ${zittenNog(rest)}.`,
        som: `${volleRamen * perGroep} + ${rest} = ${som.goed}`,
      });
    }

    stappen.push({ tekst: "In de bus zitten dus:", som: String(som.goed) });
    return stappen;
  },

  controle: (som) => {
    const perGroep = som.getallen[1] || 5;
    const { volleRamen, rest } = delen(som.goed, perGroep);
    return rest > 0
      ? `Het goede antwoord is ${som.goed}, want ${volleRamen} volle ramen van ${perGroep} is ${volleRamen * perGroep}, en in het laatste raam ${zittenNog(rest)}.`
      : `Het goede antwoord is ${som.goed}, want ${volleRamen} volle ramen van ${perGroep} is ${som.goed}.`;
  },
};
