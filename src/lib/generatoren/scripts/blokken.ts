/**
 * De uitleg-animatie bij "Blokken tientallen en eenheden".
 *
 * Dezelfde blokken in hetzelfde vak als in de vraag. Geen getallenlijn, geen
 * ander materiaal: een kind dat net deze staven zat te tellen, moet in de
 * uitleg diezelfde staven terugzien. Zou daar ineens iets anders staan, dan
 * moet het zelf bedenken dat het hetzelfde voorstelt — en juist dat verband is
 * wat hier geoefend wordt.
 *
 * ---------------------------------------------------------------------------
 * Eerst de staven, dan de losse
 * ---------------------------------------------------------------------------
 * De staven lichten één voor één op, met het telwoord erbij: "tien", "twintig".
 * Daarna komen de losse blokjes erbij, en die worden verder geteld vanaf het
 * laatste tiental: "eenentwintig, tweeëntwintig". Dat doorgaan met tellen is de
 * hele les — het is het verschil tussen "twee en vier" en "vierentwintig".
 *
 * De getallen staan in woorden en niet in cijfers, omdat Vos ze voorleest. Een
 * stem die "21" moet uitspreken maakt er soms "twee één" van; het woord zelf
 * klinkt altijd zoals de juf het zegt. Zie `lib/getalwoorden.ts`.
 */

import type { Somgegevens } from "@/lib/generatoren/foutpatroon";
import { MANIER_VAN_VORM } from "@/lib/generatoren/uitlegscript";
import type { Groepsvorm, Model, Uitlegbron, Uitlegscript } from "@/lib/generatoren/uitlegscript";
import { inWoorden } from "@/lib/getalwoorden";

const tientallenVan = (som: Somgegevens) => som.extra?.tientallen ?? Math.floor(som.goed / 10);
const eenhedenVan = (som: Somgegevens) => som.extra?.eenheden ?? som.goed % 10;

/** Eén beeld: het vak zoals het erbij staat, met wat er nu oplicht. */
function beeld(
  som: Somgegevens,
  stavenOp: number,
  losseOp: number,
  nadruk: number | null,
  bijschrift?: string,
): Model {
  return {
    soort: "mabblokken",
    tientallen: tientallenVan(som),
    eenheden: eenhedenVan(som),
    stavenOp,
    losseOp,
    nadruk,
    bijschrift,
  };
}

/**
 * De uitleg voor groep 3 tot en met 6: stap voor stap, hardop meegeteld.
 *
 * Bij de jongste groep tikt het kind de losse blokjes zelf mee. Dat is hetzelfde
 * gebaar als aan de tafel in de klas en houdt het meetellen echt.
 */
function stapVoorStap(som: Somgegevens, vorm: Groepsvorm, metTikken: boolean): Uitlegscript {
  const t = tientallenVan(som);
  const e = eenhedenVan(som);
  const totaal = som.goed;

  const stappen: Uitlegscript["stappen"] = [
    {
      model: beeld(som, 0, 0, null),
      zin: "In één staaf zitten tien blokjes.",
      houding: "wijzend",
      kant: "links",
    },
  ];

  /* De staven, één voor één, met het telwoord erbij: tien, twintig. */
  for (let i = 0; i < t; i++) {
    const tot = (i + 1) * 10;
    stappen.push({
      model: beeld(som, i + 1, 0, i, String(tot)),
      zin: inWoorden(tot),
      houding: i === 0 ? "wijzend" : "blij",
      beweging: "wijzen",
      kant: i % 2 === 0 ? "links" : "rechts",
    });
  }

  if (e > 0 && metTikken) {
    /*
      Groep 3-4 telt de losse blokjes één voor één door, elk met zijn eigen
      telwoord: eenentwintig, tweeëntwintig. Eén woord per stap, en dat is hier
      geen bezuiniging — het is precies wat er hoorbaar moet zijn. Bovendien
      krijgt deze groep nooit een zin van meer dan zes woorden.
    */
    for (let i = 0; i < e; i++) {
      const tot = t * 10 + i + 1;
      stappen.push({
        model: beeld(som, t, i + 1, null, String(tot)),
        zin: inWoorden(tot),
        houding: "wijzend",
        beweging: "wijzen",
        kant: "rechts",
      });
    }
  } else if (e > 0) {
    /* Vanaf groep 5 in één zin: het doortellen gaat daar vanzelf. */
    const woorden = Array.from({ length: e }, (_, i) => inWoorden(t * 10 + i + 1)).join(", ");
    stappen.push({
      model: beeld(som, t, e, null, String(totaal)),
      zin: `En de losse erbij: ${woorden}.`,
      houding: "wijzend",
      beweging: "wijzen",
      kant: "rechts",
    });
  }

  stappen.push({
    model: beeld(som, t, e, null, String(totaal)),
    zin: `Samen: ${inWoorden(totaal)}.`,
    feest: true,
    houding: "juichend",
    beweging: "juichen",
    kant: "rechts",
  });

  return { vorm, strategie: "staven-eerst", strategieNaam: "eerst de staven", stappen };
}

/** Groep 7-8: kort en zakelijk, want hier gaat het om de werkwijze. */
function lijst78(som: Somgegevens, vorm: Groepsvorm): Uitlegscript {
  const t = tientallenVan(som);
  const e = eenhedenVan(som);

  /*
    Geen blokkenvak maar sommen op één regel. Dat is hoe groep 7-8 het overal
    in deze app krijgt: een lijst die je in één keer leest. Het materiaal heeft
    hier zijn werk al gedaan — wie op deze leeftijd nog met staven moet kijken,
    heeft een ander soort hulp nodig dan een filmpje.
  */
  return {
    vorm,
    strategie: "staven-eerst",
    strategieNaam: "eerst de staven",
    stappen: [
      {
        model: { soort: "som", tekst: `${t} staven × 10 = ${t * 10}`, nadruk: `${t * 10}` },
        zin: "Elke staaf is een tiental.",
      },
      {
        model: {
          soort: "som",
          tekst: e > 0 ? `${t * 10} + ${e} = ${som.goed}` : `${t * 10} = ${som.goed}`,
        },
        zin:
          e > 0
            ? `En ${e} losse eenheden erbij: ${som.goed}.`
            : `Er zijn geen eenheden: ${som.goed}.`,
      },
    ],
  };
}

export const blokkenUitleg: Uitlegbron = {
  modellen: ["mabblokken", "som"],
  strategieen: [
    {
      waarde: "staven-eerst",
      label: "Eerst de staven, dan de losse",
      uitleg:
        "Tel de staven met sprongen van tien en tel daarna de losse blokjes verder: tien, twintig, eenentwintig, tweeëntwintig. Zo wordt hoorbaar dat een staaf tien waard is.",
    },
  ],
  standaardStrategie: () => "staven-eerst",

  script: (som, vorm: Groepsvorm) => {
    if (!Number.isFinite(som.goed) || som.goed < 1) return null;

    const manier = MANIER_VAN_VORM[vorm];
    if (manier === "78") return lijst78(som, vorm);
    return stapVoorStap(som, vorm, manier === "34");
  },

  vergelijkbaar: (som) => {
    if (!Number.isFinite(som.goed)) return null;
    /*
      Eentje erbij, maar wel met dezelfde staven: van 24 naar 25 en niet naar
      een heel ander getal. Zo oefent het kind hetzelfde nog een keer.
    */
    const e = eenhedenVan(som);
    const nieuw = e < 9 ? som.goed + 1 : som.goed - 1;
    return {
      ...som,
      getallen: [nieuw],
      goed: nieuw,
      extra: {
        ...som.extra,
        tientallen: Math.floor(nieuw / 10),
        eenheden: nieuw % 10,
      },
    };
  },
};
