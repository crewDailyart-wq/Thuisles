/**
 * Zo pak je een telrij op stapstenen aan.
 *
 * Dit is wat een kind ziet als er geen denkfout wordt herkend: geen gok over
 * wat er misging, maar gewoon de werkwijze. Eerst de sprong aflezen uit twee
 * stenen die al ingevuld zijn, dan van links naar rechts doortellen.
 */

import type { Aanpak, Somgegevens } from "@/lib/generatoren/foutpatroon";

function sprongVan(som: Somgegevens): number {
  return som.extra?.sprong ?? 1;
}

function legePlekken(som: Somgegevens): number[] {
  const hoeveel = som.extra?.aantalLeeg ?? 0;
  return Array.from({ length: hoeveel }, (_, k) => som.extra?.[`leeg${k}`] ?? -1).filter(
    (p) => p >= 0,
  );
}

/** Het woord dat bij de richting hoort, zodat de zinnen vanzelf kloppen. */
function woorden(som: Somgegevens) {
  const terug = som.variant === "terug";
  return {
    terug,
    erbij: terug ? "eraf" : "erbij",
    richting: terug ? "terug" : "vooruit",
    teken: terug ? "−" : "+",
  };
}

export const stapstenenAanpak: Aanpak = {
  zin: (som) => {
    const sprong = sprongVan(som);
    const w = woorden(som);
    return {
      "34": `Doe er elke steen ${sprong} ${w.erbij}.`,
      "56": `Elke steen gaat ${sprong} ${w.erbij}. Tel van links naar rechts door.`,
      "78": `De rij loopt met sprongen van ${sprong} ${w.richting}. Lees de sprong af uit twee stenen die al ingevuld zijn en tel van links naar rechts door.`,
    };
  },

  stappen: (som) => {
    const r = som.getallen;
    const sprong = sprongVan(som);
    const w = woorden(som);
    return [
      {
        tekst: "Kijk naar twee stenen die al ingevuld zijn.",
        som: `${r[0]} en ${r[1]}`,
      },
      { tekst: "Het verschil daartussen is de sprong.", som: `${sprong}` },
      {
        tekst: `Doe die sprong er bij elke volgende steen ${w.erbij}.`,
        som: `${r[0]} ${w.teken} ${sprong} = ${r[1]}`,
      },
      { tekst: "Zo loopt de hele rij af, van links naar rechts.", som: r.join(" → ") },
    ];
  },

  controle: (som) => {
    const r = som.getallen;
    const lege = legePlekken(som);
    const sprong = sprongVan(som);
    const w = woorden(som);
    const antwoorden = lege.map((p) => r[p]);

    if (antwoorden.length === 1) {
      const p = lege[0];
      const vorige = p > 0 ? r[p - 1] : r[0];
      return `Het goede antwoord is ${antwoorden[0]}, want ${vorige} ${w.teken} ${sprong} = ${antwoorden[0]}.`;
    }
    return `De goede antwoorden zijn ${antwoorden.join(" en ")}, want de rij gaat met sprongen van ${sprong} ${w.richting}: ${r.join(" → ")}.`;
  },
};
