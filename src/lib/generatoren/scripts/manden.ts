/**
 * De uitleg-animatie bij "Welke mand?".
 *
 * De goede mand komt in beeld en de inhoud wordt één voor één meegeteld — met
 * dezelfde spulletjes als in de vraag. Zo ziet het kind niet alleen wélke mand
 * het was, maar ook waaróm: het telt mee.
 */

import type { Somgegevens } from "@/lib/generatoren/foutpatroon";
import { MANIER_VAN_VORM } from "@/lib/generatoren/uitlegscript";
import type { Groepsvorm, Model, Uitlegbron, Uitlegscript } from "@/lib/generatoren/uitlegscript";
import { inWoorden } from "@/lib/getalwoorden";

const opKaart = (som: Somgegevens) => som.extra?.kaart ?? som.goed;

function beeld(som: Somgegevens, geteld: number, bijschrift?: string): Model {
  return {
    soort: "mand",
    aantal: som.goed,
    /* Welk materiaal en welk plaatje komt van de vraag; zie de speler. */
    materiaal: null,
    plaatje: null,
    geteld,
    bijschrift,
  };
}

function stapVoorStap(som: Somgegevens, vorm: Groepsvorm, metTikken: boolean): Uitlegscript {
  const kaart = opKaart(som);
  const stappen: Uitlegscript["stappen"] = [];

  if (kaart !== som.goed) {
    stappen.push({
      model: beeld(som, 0, String(kaart)),
      zin: som.goed > kaart ? "Eentje meer dan dit." : "Eentje minder dan dit.",
      houding: "denkend",
      kant: "links",
    });
  }

  stappen.push({
    model: beeld(som, 0),
    zin: "Tel maar mee.",
    meetellen: metTikken ? { aantal: som.goed, aansporing: "Tik ze één voor één aan!" } : undefined,
    houding: "wijzend",
    beweging: "wijzen",
    kant: "links",
  });

  stappen.push({
    model: beeld(som, som.goed, String(som.goed)),
    zin: `Samen ${inWoorden(som.goed)}.`,
    feest: true,
    houding: "juichend",
    beweging: "juichen",
    kant: "rechts",
  });

  return { vorm, strategie: "meetellen", strategieNaam: "meetellen", stappen };
}

/** Groep 7-8: kort en zakelijk, sommen op één regel. */
function lijst78(som: Somgegevens, vorm: Groepsvorm): Uitlegscript {
  const kaart = opKaart(som);
  return {
    vorm,
    strategie: "meetellen",
    strategieNaam: "meetellen",
    stappen: [
      {
        model: {
          soort: "som",
          tekst:
            kaart === som.goed
              ? `${som.goed}`
              : `${kaart} ${som.goed > kaart ? "+" : "−"} 1 = ${som.goed}`,
          nadruk: `${som.goed}`,
        },
        zin: "Bepaal eerst welk aantal je zoekt.",
      },
      {
        model: { soort: "som", tekst: `${som.goed}` },
        zin: "Tel daarna de manden tot je dat aantal vindt.",
      },
    ],
  };
}

export const mandenUitleg: Uitlegbron = {
  modellen: ["mand", "som"],
  strategieen: [
    {
      waarde: "meetellen",
      label: "Eerst het getal, dan tellen",
      uitleg:
        "Bepaal eerst welk aantal je zoekt — dat is niet altijd het getal dat er staat — en tel daarna pas de manden. Wie eerst telt en dan kijkt, komt uit bij de mand die toevallig het eerst geteld is.",
    },
  ],
  standaardStrategie: () => "meetellen",

  script: (som, vorm: Groepsvorm) => {
    if (!Number.isFinite(som.goed) || som.goed < 1) return null;
    const manier = MANIER_VAN_VORM[vorm];
    if (manier === "78") return lijst78(som, vorm);
    return stapVoorStap(som, vorm, manier === "34");
  },

  vergelijkbaar: (som) => {
    if (!Number.isFinite(som.goed)) return null;
    const nieuw = som.goed + 1;
    return { ...som, getallen: [nieuw], goed: nieuw, extra: { ...som.extra, kaart: nieuw } };
  },
};
