/**
 * De uitleg-animaties bij "Kralen tellen (hoeveelste kraal)".
 *
 * Eén strategie, en die staat centraal in dit leerdoel: tel met de
 * vijfstructuur mee in plaats van kraal voor kraal.
 *
 *   groep 3-4  De kralen lichten groepje voor groepje op terwijl Vos hardop
 *              meetelt: "5… 10… 15… en dan nog 2, dat is 17." Bij het laatste
 *              stukje tikt het kind de losse kralen zelf mee.
 *   groep 5-6  Dezelfde beweging, maar korter: alle hele groepjes in één keer,
 *              daarna de rest erbij.
 *   groep 7-8  Geen animatie maar een leeslijst met de som op één regel.
 */

import type { Somgegevens } from "@/lib/generatoren/foutpatroon";
import type { Groepsvorm, Uitlegbron, Uitlegscript } from "@/lib/generatoren/uitlegscript";

type Kralensom = {
  totaal: number;
  perGroep: number;
  doel: number;
  palet: string;
};

function lees(som: Somgegevens): Kralensom {
  return {
    totaal: som.getallen[0] || 10,
    perGroep: som.getallen[1] || 5,
    doel: som.goed,
    palet: "viool-oranje",
  };
}

/** "1 kraal" of "3 kralen". */
function kralen(n: number): string {
  return n === 1 ? "1 kraal" : `${n} kralen`;
}

function delen({ perGroep, doel }: Kralensom) {
  const heleGroepjes = Math.floor((doel - 1) / perGroep);
  return { heleGroepjes, rest: doel - heleGroepjes * perGroep };
}

/** Het beeld: de ketting met de eerste `opgelicht` kralen al geteld. */
function beeld(s: Kralensom, opgelicht: number, bijschrift?: string) {
  return {
    soort: "kralen" as const,
    totaal: s.totaal,
    perGroep: s.perGroep,
    opgelicht,
    pijlOp: s.doel,
    palet: s.palet,
    bijschrift,
  };
}

// --- Groep 3-4 -------------------------------------------------------------

function metGroepjes34(s: Kralensom): Uitlegscript {
  const { heleGroepjes, rest } = delen(s);

  const stappen: Uitlegscript["stappen"] = [
    {
      model: beeld(s, 0),
      zin: "Kijk, een ketting met kralen.",
      houding: "blij",
      kant: "links",
    },
    {
      model: beeld(s, 0),
      zin: "De kleur wisselt om de vijf.",
      houding: "wijzend",
      beweging: "wijzen",
      kant: "links",
    },
  ];

  // Groepje voor groepje meetellen: 5… 10… 15…
  for (let g = 1; g <= heleGroepjes; g++) {
    stappen.push({
      model: beeld(s, g * s.perGroep, String(g * s.perGroep)),
      zin: `Dat zijn er ${g * s.perGroep}.`,
      houding: "wijzend",
      beweging: "wijzen",
      kant: "links",
    });
  }

  // En dan de losse kralen, die het kind zelf aantikt.
  if (rest > 0) {
    stappen.push({
      model: beeld(s, heleGroepjes * s.perGroep),
      zin: `En dan nog ${rest} erbij.`,
      meetellen: { aantal: rest, aansporing: "Tik de kralen aan!" },
      houding: "denkend",
      kant: "rechts",
    });
  }

  stappen.push({
    model: beeld(s, s.doel, String(s.doel)),
    zin: `Samen zijn dat er ${s.doel}!`,
    feest: true,
    houding: "juichend",
    beweging: "juichen",
    kant: "rechts",
  });

  return { vorm: "34", strategie: "vijfstructuur", strategieNaam: "tellen met vijven", stappen };
}

// --- Groep 5-6 -------------------------------------------------------------

function metGroepjes56(s: Kralensom): Uitlegscript {
  const { heleGroepjes, rest } = delen(s);
  const sprongen = Array.from({ length: heleGroepjes }, (_, i) => (i + 1) * s.perGroep).join(", ");

  return {
    vorm: "56",
    strategie: "vijfstructuur",
    strategieNaam: "tellen met vijven",
    stappen: [
      {
        model: beeld(s, 0),
        zin: `De kralen liggen in groepjes van ${s.perGroep}.`,
        houding: "blij",
        kant: "links",
      },
      {
        model: beeld(s, heleGroepjes * s.perGroep, String(heleGroepjes * s.perGroep)),
        zin: `Vóór de pijl liggen ${heleGroepjes} hele groepjes: ${sprongen || s.perGroep}.`,
        houding: "wijzend",
        beweging: "wijzen",
        kant: "links",
      },
      {
        model: beeld(s, s.doel, String(s.doel)),
        zin:
          rest > 0
            ? `Daar komt nog ${kralen(rest)} bij: ${heleGroepjes * s.perGroep} + ${rest} = ${s.doel}.`
            : `De pijl staat precies op het einde van een groepje: ${s.doel}.`,
        feest: true,
        houding: "juichend",
        beweging: "juichen",
        kant: "rechts",
      },
    ],
  };
}

// --- Groep 7-8 -------------------------------------------------------------

function metGroepjes78(s: Kralensom): Uitlegscript {
  const { heleGroepjes, rest } = delen(s);

  return {
    vorm: "78",
    strategie: "vijfstructuur",
    strategieNaam: "tellen met vijven",
    stappen: [
      {
        model: { soort: "som", tekst: `${s.totaal} kralen, groepjes van ${s.perGroep}` },
        zin: "De kleuren wisselen per groepje, dus tellen met sprongen kan.",
      },
      {
        model: {
          soort: "som",
          tekst: `${heleGroepjes} × ${s.perGroep} = ${heleGroepjes * s.perGroep}`,
          nadruk: String(heleGroepjes * s.perGroep),
        },
        zin: "Zoveel hele groepjes liggen er vóór de aangewezen kraal.",
      },
      {
        model: {
          soort: "som",
          tekst: `${heleGroepjes * s.perGroep} + ${rest} = ${s.doel}`,
          nadruk: String(s.doel),
        },
        zin: "De losse kralen erbij geven de plek van de kraal.",
      },
    ],
  };
}

export const kralenUitleg: Uitlegbron = {
  modellen: ["kralen", "som"],
  strategieen: [
    {
      waarde: "vijfstructuur",
      label: "Tellen met vijven",
      uitleg:
        "Tel de gekleurde groepjes met sprongen (5, 10, 15) en tel daarna de losse kralen erbij.",
    },
  ],
  standaardStrategie: () => "vijfstructuur",

  script: (som, vorm: Groepsvorm) => {
    const s = lees(som);
    if (s.doel < 1 || s.totaal < 1) return null;
    if (vorm === "34") return metGroepjes34(s);
    if (vorm === "56") return metGroepjes56(s);
    return metGroepjes78(s);
  },

  vergelijkbaar: (som) => {
    const s = lees(som);
    // Een andere kraal in dezelfde ketting: zelfde soort som, ander antwoord.
    const nieuw = s.doel + s.perGroep <= s.totaal ? s.doel + s.perGroep : Math.max(1, s.doel - s.perGroep);
    if (nieuw === s.doel) return null;
    return { ...som, goed: nieuw };
  },
};
