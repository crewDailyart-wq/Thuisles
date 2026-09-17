/**
 * De uitleg-animatie bij "Vos gaat vissen".
 *
 * De vissen gaan op een rij liggen, van klein naar groot. Dat is de uitleg:
 * vergelijken is ordenen, en zodra ze op volgorde liggen hoeft er niets meer
 * uitgerekend te worden — je ziet het.
 *
 * Dezelfde vissen met dezelfde getallen als in de vraag, zodat het kind
 * herkent waar het net naar keek.
 */

import type { Somgegevens } from "@/lib/generatoren/foutpatroon";
import { MANIER_VAN_VORM } from "@/lib/generatoren/uitlegscript";
import type { Groepsvorm, Model, Uitlegbron, Uitlegscript } from "@/lib/generatoren/uitlegscript";

const zoektGrootste = (som: Somgegevens) => (som.extra?.grootste ?? 1) === 1;

/** De getallen van de vissen staan in `getallen`, in de volgorde van het water. */
function vissenVan(som: Somgegevens): { getal: number }[] {
  return som.getallen.map((getal) => ({ getal }));
}

function beeld(som: Somgegevens, nadruk: number | null, bijschrift?: string): Model {
  return { soort: "visvijver", vissen: vissenVan(som), nadruk, bijschrift };
}

function stapVoorStap(som: Somgegevens, vorm: Groepsvorm): Uitlegscript {
  const opVolgorde = [...som.getallen].sort((a, b) => a - b);
  const plek = zoektGrootste(som) ? opVolgorde.length - 1 : 0;

  return {
    vorm,
    strategie: "op-volgorde",
    strategieNaam: "op volgorde leggen",
    stappen: [
      {
        model: beeld(som, null),
        zin: "Leg ze op volgorde.",
        houding: "wijzend",
        kant: "links",
      },
      {
        model: beeld(som, plek, String(som.goed)),
        zin: zoektGrootste(som) ? "Deze is de grootste." : "Deze is de kleinste.",
        feest: true,
        houding: "juichend",
        beweging: "juichen",
        kant: "rechts",
      },
    ],
  };
}

/** Groep 7-8: kort en zakelijk, sommen op één regel. */
function lijst78(som: Somgegevens, vorm: Groepsvorm): Uitlegscript {
  const opVolgorde = [...som.getallen].sort((a, b) => a - b);
  return {
    vorm,
    strategie: "op-volgorde",
    strategieNaam: "op volgorde leggen",
    stappen: [
      {
        model: { soort: "som", tekst: opVolgorde.join(" < ") },
        zin: "Zet de getallen op volgorde.",
      },
      {
        model: { soort: "som", tekst: `${som.goed}`, nadruk: `${som.goed}` },
        zin: zoektGrootste(som) ? "De laatste is de grootste." : "De eerste is de kleinste.",
      },
    ],
  };
}

export const vissenUitleg: Uitlegbron = {
  modellen: ["visvijver", "som"],
  strategieen: [
    {
      waarde: "op-volgorde",
      label: "Op volgorde leggen",
      uitleg:
        "Lees eerst alle getallen en leg ze in gedachten op volgorde van klein naar groot. Dan staat de grootste vanzelf achteraan en de kleinste vooraan; er valt niets meer te raden.",
    },
  ],
  standaardStrategie: () => "op-volgorde",

  script: (som, vorm: Groepsvorm) => {
    if (som.getallen.length < 2) return null;
    return MANIER_VAN_VORM[vorm] === "78" ? lijst78(som, vorm) : stapVoorStap(som, vorm);
  },

  vergelijkbaar: (som) => {
    if (som.getallen.length < 2) return null;
    /* Dezelfde vissen, maar nu de andere kant op gevraagd. */
    const grootste = Math.max(...som.getallen);
    const kleinste = Math.min(...som.getallen);
    const nuGrootste = zoektGrootste(som);
    return {
      ...som,
      goed: nuGrootste ? kleinste : grootste,
      extra: {
        ...som.extra,
        grootste: nuGrootste ? 0 : 1,
        andersom: nuGrootste ? grootste : kleinste,
      },
    };
  },
};
