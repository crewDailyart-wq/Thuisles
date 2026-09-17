/**
 * De uitleg-animatie bij "Vos' trein".
 *
 * De wagons springen één voor één op hun plek, met het getal dat oplicht. Dat
 * is de werkwijze zelf: ordenen doe je niet in één keer, maar door steeds de
 * kleinste van wat er nog staat naar voren te halen.
 */

import type { Somgegevens } from "@/lib/generatoren/foutpatroon";
import { MANIER_VAN_VORM } from "@/lib/generatoren/uitlegscript";
import type { Groepsvorm, Model, Uitlegbron, Uitlegscript } from "@/lib/generatoren/uitlegscript";

const aflopend = (som: Somgegevens) => (som.extra?.aflopend ?? 0) === 1;

function volgordeVan(som: Somgegevens): number[] {
  const oplopend = [...som.getallen].sort((a, b) => a - b);
  return aflopend(som) ? oplopend.reverse() : oplopend;
}

function beeld(som: Somgegevens, klaar: number, nadruk: number | null, bijschrift?: string): Model {
  return { soort: "trein", volgorde: volgordeVan(som), klaar, nadruk, bijschrift };
}

function stapVoorStap(som: Somgegevens, vorm: Groepsvorm): Uitlegscript {
  const volgorde = volgordeVan(som);

  const stappen: Uitlegscript["stappen"] = [
    {
      model: beeld(som, 0, null),
      zin: aflopend(som) ? "Begin met de grootste." : "Begin met de kleinste.",
      houding: "wijzend",
      kant: "links",
    },
  ];

  volgorde.forEach((waarde, i) => {
    stappen.push({
      model: beeld(som, i + 1, i, String(waarde)),
      zin: String(waarde),
      houding: i === 0 ? "wijzend" : "blij",
      beweging: "wijzen",
      kant: i % 2 === 0 ? "links" : "rechts",
    });
  });

  stappen.push({
    model: beeld(som, volgorde.length, null),
    zin: "De trein kan rijden!",
    feest: true,
    houding: "juichend",
    beweging: "juichen",
    kant: "rechts",
  });

  return { vorm, strategie: "kleinste-eerst", strategieNaam: "steeds de kleinste", stappen };
}

/** Groep 7-8: kort en zakelijk, sommen op één regel. */
function lijst78(som: Somgegevens, vorm: Groepsvorm): Uitlegscript {
  const volgorde = volgordeVan(som);
  return {
    vorm,
    strategie: "kleinste-eerst",
    strategieNaam: "steeds de kleinste",
    stappen: [
      {
        model: { soort: "som", tekst: som.getallen.join("  ") },
        zin: "Bekijk eerst alle getallen.",
      },
      {
        model: { soort: "som", tekst: volgorde.join(" → "), nadruk: `${volgorde[0]}` },
        zin: aflopend(som) ? "Sorteer van groot naar klein." : "Sorteer van klein naar groot.",
      },
    ],
  };
}

export const treinUitleg: Uitlegbron = {
  modellen: ["trein", "som"],
  strategieen: [
    {
      waarde: "kleinste-eerst",
      label: "Steeds de kleinste erbij",
      uitleg:
        "Zoek telkens het kleinste getal van wat er nog op het spoor staat en koppel dat erachter. Zo hoeft een kind nooit de hele rij tegelijk te overzien, en werkt dezelfde aanpak ook bij grotere rijtjes.",
    },
  ],
  standaardStrategie: () => "kleinste-eerst",

  script: (som, vorm: Groepsvorm) => {
    if (som.getallen.length < 2) return null;
    return MANIER_VAN_VORM[vorm] === "78" ? lijst78(som, vorm) : stapVoorStap(som, vorm);
  },

  vergelijkbaar: (som) => {
    if (som.getallen.length < 2) return null;
    /* Dezelfde wagons, de andere kant op gevraagd. */
    return { ...som, extra: { ...som.extra, aflopend: aflopend(som) ? 0 : 1 } };
  },
};
