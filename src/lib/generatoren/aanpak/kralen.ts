/** "Zo los je het op" bij kralen tellen. */

import type { Aanpak } from "@/lib/generatoren/foutpatroon";

/** "1 kraal" of "3 kralen" — enkelvoud klinkt anders dan meervoud. */
function kralen(n: number): string {
  return n === 1 ? "1 kraal" : `${n} kralen`;
}

function delen(goed: number, perGroep: number) {
  const heleGroepjes = Math.floor((goed - 1) / perGroep);
  return { heleGroepjes, rest: goed - heleGroepjes * perGroep };
}

export const kralenAanpak: Aanpak = {
  zin: (som) => {
    const perGroep = som.getallen[1] || 5;
    const { heleGroepjes, rest } = delen(som.goed, perGroep);
    const sprongen = Array.from({ length: heleGroepjes }, (_, i) => (i + 1) * perGroep).join("… ");
    return {
      "34": `Tel de groepjes: ${sprongen || perGroep}. En dan nog ${rest} erbij.`,
      "56": `Tel per groepje van ${perGroep}: ${sprongen || perGroep}. Daarna nog ${kralen(rest)} erbij: dat is ${som.goed}.`,
      "78": `De kralen liggen in groepjes van ${perGroep}, dus je hoeft niet één voor één te tellen. Vóór de pijl liggen ${heleGroepjes} hele groepjes: ${heleGroepjes} × ${perGroep} = ${heleGroepjes * perGroep}. Daar komt nog ${kralen(rest)} bij, dus ${heleGroepjes * perGroep} + ${rest} = ${som.goed}.`,
    };
  },

  stappen: (som) => {
    const perGroep = som.getallen[1] || 5;
    const { heleGroepjes, rest } = delen(som.goed, perGroep);
    const sprongen = Array.from({ length: heleGroepjes }, (_, i) => (i + 1) * perGroep).join(", ");
    return [
      { tekst: `De kleuren wisselen om de ${perGroep} kralen.` },
      { tekst: "Tel per groepje mee.", som: sprongen || `nog geen heel groepje` },
      { tekst: "Tel de losse kralen erbij.", som: `${heleGroepjes * perGroep} + ${rest} = ${som.goed}` },
      { tekst: "De pijl wijst dus naar kraal:", som: String(som.goed) },
    ];
  },

  controle: (som) => {
    const perGroep = som.getallen[1] || 5;
    const { heleGroepjes, rest } = delen(som.goed, perGroep);
    return `Het goede antwoord is ${som.goed}, want ${heleGroepjes} groepjes van ${perGroep} is ${heleGroepjes * perGroep}, en daar komt nog ${kralen(rest)} bij.`;
  },
};
