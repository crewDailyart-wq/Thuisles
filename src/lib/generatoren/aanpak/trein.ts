/**
 * Zo zet je de trein op volgorde.
 *
 * Niet alles tegelijk bekijken, maar steeds één wagon kiezen: welke is nu de
 * kleinste van wat er nog staat? Dat is de werkwijze die ook bij grotere
 * rijtjes blijft werken, en hij is uit te voeren zonder iets te onthouden.
 */

import type { Aanpak, Somgegevens } from "@/lib/generatoren/foutpatroon";

const aflopend = (som: Somgegevens) => (som.extra?.aflopend ?? 0) === 1;

function rij(som: Somgegevens): number[] {
  const oplopend = [...som.getallen].sort((a, b) => a - b);
  return aflopend(som) ? oplopend.reverse() : oplopend;
}

export const treinAanpak: Aanpak = {
  zin: (som) =>
    aflopend(som)
      ? {
          "34": "Begin met de grootste.",
          "56": "Zoek steeds de grootste van wat er nog staat, en koppel die erachter.",
          "78": "Sorteer aflopend: pak telkens het grootste getal dat nog op het spoor staat.",
        }
      : {
          "34": "Begin met de kleinste.",
          "56": "Zoek steeds de kleinste van wat er nog staat, en koppel die erachter.",
          "78": "Sorteer oplopend: pak telkens het kleinste getal dat nog op het spoor staat.",
        },

  stappen: (som) => {
    const volgorde = rij(som);
    return [
      {
        tekst: aflopend(som) ? "Zoek de grootste." : "Zoek de kleinste.",
        som: `${volgorde[0]}`,
      },
      { tekst: "Koppel hem achter de locomotief.", som: "" },
      { tekst: "Doe dat met de rest ook.", som: volgorde.join(" → ") },
    ];
  },

  controle: (som) =>
    `De goede volgorde is ${rij(som).join(", ")}: ${
      aflopend(som) ? "van groot naar klein" : "van klein naar groot"
    }.`,
};
