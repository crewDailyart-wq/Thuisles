/**
 * De uitleg-animaties bij "Bus tellen (vijfstructuur)".
 *
 * Eén strategie, en die staat centraal in dit leerdoel: tel per raam met
 * sprongen mee in plaats van kind voor kind.
 *
 *   groep 3-4  De ramen lichten één voor één op terwijl Vos hardop meetelt:
 *              "5… 10… 15… en dan nog 2, dat is 17." Het restje in het laatste
 *              raam tikt het kind zelf mee, zodat het die stap echt meemaakt.
 *   groep 5-6  Dezelfde beweging, maar korter: alle volle ramen in één keer,
 *              daarna het restje erbij.
 *   groep 7-8  Geen animatie maar een leeslijst met de som op één regel.
 */

import type { Somgegevens } from "@/lib/generatoren/foutpatroon";
import type { Groepsvorm, Uitlegbron, Uitlegscript } from "@/lib/generatoren/uitlegscript";

type Bussom = {
  totaal: number;
  perGroep: number;
  palet: string;
};

function lees(som: Somgegevens): Bussom {
  return {
    totaal: som.getallen[0] || som.goed,
    perGroep: som.getallen[1] || 5,
    palet: "viool-oranje",
  };
}

/** "zit er nog 1 kind" of "zitten er nog 3 kinderen": het werkwoord buigt mee. */
function zittenNog(n: number): string {
  return n === 1 ? "zit er nog 1 kind" : `zitten er nog ${n} kinderen`;
}

function delen({ totaal, perGroep }: Bussom) {
  const volleRamen = Math.floor(totaal / perGroep);
  return { volleRamen, rest: totaal - volleRamen * perGroep };
}

/** Het beeld: de bus met de eerste `opgelicht` kinderen al geteld. */
function beeld(s: Bussom, opgelicht: number, bijschrift?: string) {
  return {
    soort: "bus" as const,
    totaal: s.totaal,
    perGroep: s.perGroep,
    opgelicht,
    palet: s.palet,
    bijschrift,
  };
}

// --- Groep 3-4 -------------------------------------------------------------

function metRamen34(s: Bussom): Uitlegscript {
  const { volleRamen, rest } = delen(s);

  /*
    Zinnen van hoogstens zes woorden — dat bewaakt `controleerUitleg` ook. Op
    deze leeftijd is een langere zin voorbij voordat het beeld geland is.
  */
  const stappen: Uitlegscript["stappen"] = [
    {
      model: beeld(s, 0),
      zin: "Kijk, een bus vol kinderen.",
      houding: "blij",
      kant: "links",
    },
    {
      model: beeld(s, 0),
      zin: `In elk raam zitten er ${s.perGroep}.`,
      houding: "wijzend",
      beweging: "wijzen",
      kant: "links",
    },
  ];

  // Raam voor raam meetellen: 5… 10… 15…
  for (let raam = 1; raam <= volleRamen; raam++) {
    const tot = raam * s.perGroep;
    stappen.push({
      model: beeld(s, tot, String(tot)),
      zin: `Dat zijn er ${tot}.`,
      houding: "wijzend",
      beweging: "wijzen",
      kant: "links",
    });
  }

  // En dan het restje, dat het kind zelf aantikt.
  if (rest > 0) {
    stappen.push({
      model: beeld(s, volleRamen * s.perGroep, String(volleRamen * s.perGroep)),
      zin: `En dan nog ${rest} erbij.`,
      meetellen: { aantal: rest, aansporing: "Tik de kinderen aan!" },
      houding: "denkend",
      kant: "rechts",
    });
  }

  stappen.push({
    model: beeld(s, s.totaal, String(s.totaal)),
    zin: `Samen zijn dat er ${s.totaal}!`,
    feest: true,
    houding: "juichend",
    beweging: "juichen",
    kant: "rechts",
  });

  return { vorm: "34", strategie: "vijfstructuur", strategieNaam: "tellen met vijven", stappen };
}

// --- Groep 5-6 -------------------------------------------------------------

function metRamen56(s: Bussom): Uitlegscript {
  const { volleRamen, rest } = delen(s);
  const sprongen = Array.from({ length: volleRamen }, (_, i) => (i + 1) * s.perGroep).join(", ");

  return {
    vorm: "56",
    strategie: "vijfstructuur",
    strategieNaam: "tellen met vijven",
    stappen: [
      {
        model: beeld(s, 0),
        zin: `In elk raam zitten ${s.perGroep} kinderen.`,
        houding: "blij",
        kant: "links",
      },
      {
        model: beeld(s, volleRamen * s.perGroep, String(volleRamen * s.perGroep)),
        zin: `Er zijn ${volleRamen} volle ramen: ${sprongen || s.perGroep}.`,
        houding: "wijzend",
        beweging: "wijzen",
        kant: "links",
      },
      {
        model: beeld(s, s.totaal, String(s.totaal)),
        zin:
          rest > 0
            ? `In het laatste raam ${zittenNog(rest)}: ${volleRamen * s.perGroep} + ${rest} = ${s.totaal}.`
            : `Alle ramen zitten vol, dus dat zijn er ${s.totaal}.`,
        feest: true,
        houding: "juichend",
        beweging: "juichen",
        kant: "rechts",
      },
    ],
  };
}

// --- Groep 7-8 -------------------------------------------------------------

function metRamen78(s: Bussom): Uitlegscript {
  const { volleRamen, rest } = delen(s);

  const stappen: Uitlegscript["stappen"] = [
    {
      model: { soort: "som", tekst: `${volleRamen} volle ramen van ${s.perGroep}` },
      zin: "De kinderen zitten per raam gegroepeerd, dus tellen met sprongen kan.",
    },
    {
      model: {
        soort: "som",
        tekst: `${volleRamen} × ${s.perGroep} = ${volleRamen * s.perGroep}`,
        nadruk: String(volleRamen * s.perGroep),
      },
      zin: "Zoveel kinderen zitten er in de volle ramen.",
    },
  ];

  if (rest > 0) {
    stappen.push({
      model: {
        soort: "som",
        tekst: `${volleRamen * s.perGroep} + ${rest} = ${s.totaal}`,
        nadruk: String(s.totaal),
      },
      zin: "Het laatste raam is niet vol; die kinderen tellen gewoon mee.",
    });
  }

  return {
    vorm: "78",
    strategie: "vijfstructuur",
    strategieNaam: "tellen met vijven",
    stappen,
  };
}

export const busUitleg: Uitlegbron = {
  modellen: ["bus", "som"],
  strategieen: [
    {
      waarde: "vijfstructuur",
      label: "Tellen met vijven",
      uitleg:
        "Tel de volle ramen met sprongen (5, 10, 15) en tel daarna het restje in het laatste raam erbij.",
    },
  ],
  standaardStrategie: () => "vijfstructuur",

  script: (som, vorm: Groepsvorm) => {
    const s = lees(som);
    if (s.totaal < 1 || s.perGroep < 1) return null;
    if (vorm === "34") return metRamen34(s);
    if (vorm === "56") return metRamen56(s);
    return metRamen78(s);
  },

  vergelijkbaar: (som) => {
    const s = lees(som);
    /*
      Een bus met één raam erbij: dezelfde soort som, ander antwoord. Levert
      dat niets nieuws op, dan één raam eraf.
    */
    const nieuw = s.totaal + s.perGroep <= 40 ? s.totaal + s.perGroep : s.totaal - s.perGroep;
    if (nieuw < 1 || nieuw === s.totaal) return null;
    return { ...som, getallen: [nieuw, s.perGroep], goed: nieuw };
  },
};
