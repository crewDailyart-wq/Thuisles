/**
 * De uitleg-animaties bij "Plaatjes tellen meerkeuze".
 *
 * Dezelfde plaatjes in dezelfde opstelling als in de vraag. Geen blokjes en
 * geen andere weergave: een kind dat net eendjes zat te tellen, moet in de
 * uitleg diezelfde eendjes terugzien. Zou daar ineens een rij paarse vlakjes
 * staan, dan moet het zelf bedenken dat die de eendjes voorstellen — en juist
 * dat verband is wat hier geoefend wordt.
 *
 * ---------------------------------------------------------------------------
 * Twee manieren, want de opstelling is de les
 * ---------------------------------------------------------------------------
 * Staan de plaatjes in rijen, dan licht eerst een hele rij tegelijk op: "dit
 * zijn er vijf", dan de volgende: "en nog vijf, samen tien", en daarna de
 * losse plaatjes die overblijven. Zo hoort en ziet een kind de structuur waar
 * het zelf op had kunnen leunen.
 *
 * Staan ze verspreid, dan valt er niets te groeperen en wordt er één voor één
 * geteld, met een vinkje bij elk geteld plaatje. Dat vinkje is precies het
 * gereedschap dat het kind bij de vraag zelf ook had.
 */

import type { Somgegevens } from "@/lib/generatoren/foutpatroon";
import { MANIER_VAN_VORM } from "@/lib/generatoren/uitlegscript";
import type { Groepsvorm, Model, Uitlegbron, Uitlegscript } from "@/lib/generatoren/uitlegscript";

const perRijVan = (som: Somgegevens) => som.extra?.perRij ?? 0;
const inRijen = (som: Somgegevens) => perRijVan(som) >= 2;

/** Eén beeld: het raster zoals het erbij staat, met wat er nu oplicht. */
function beeld(
  som: Somgegevens,
  opgelicht: number,
  rijNadruk: number | null,
  bijschrift?: string,
): Model {
  return {
    soort: "plaatjesraster",
    aantal: som.goed,
    /*
      Welk plaatje het is, komt van de vraag en niet van hier: in de
      somgegevens passen alleen getallen. De speler vult het aan met wat het
      kind net zat te tellen, zodat het in de uitleg dezelfde eendjes ziet.
    */
    plaatje: null,
    afbeelding: null,
    perRij: perRijVan(som),
    groepsruimte: (som.extra?.groepsruimte ?? 0) === 1,
    opgelicht,
    rijNadruk,
    bijschrift,
  };
}

// --- In rijen ---------------------------------------------------------------

/**
 * Rij voor rij, met de tussenstand erbij.
 *
 * De zinnen lopen mee met wat er oplicht: "dit zijn er vijf", "en nog vijf,
 * samen tien". Het getal in het bijschrift is de tussenstand, zodat een kind
 * het meetellen ook ziet staan.
 */
function perRijStappen(som: Somgegevens, vorm: Groepsvorm, metTikken: boolean): Uitlegscript {
  const totaal = som.goed;
  const n = perRijVan(som);
  const helerijen = Math.floor(totaal / n);
  const rest = totaal - helerijen * n;

  const stappen: Uitlegscript["stappen"] = [
    {
      model: beeld(som, 0, null),
      zin: "Tel niet één voor één. Tel per rij.",
      houding: "wijzend",
      kant: "links",
    },
  ];

  for (let r = 0; r < helerijen; r++) {
    const tot = (r + 1) * n;
    stappen.push({
      model: beeld(som, tot, r, String(tot)),
      zin: r === 0 ? `Dit zijn er ${n}.` : `En nog ${n}, samen ${tot}.`,
      houding: r === 0 ? "wijzend" : "blij",
      beweging: "wijzen",
      kant: r % 2 === 0 ? "links" : "rechts",
    });
  }

  if (rest > 0) {
    stappen.push({
      model: beeld(som, totaal, helerijen, String(totaal)),
      zin: `En nog ${rest} erbij, samen ${totaal}.`,
      meetellen: metTikken ? { aantal: rest, aansporing: "Tik de laatste plaatjes aan!" } : undefined,
      houding: "wijzend",
      beweging: "wijzen",
      kant: "rechts",
    });
  }

  stappen.push({
    model: beeld(som, totaal, null, String(totaal)),
    zin: `Samen zijn het er ${totaal}.`,
    feest: true,
    houding: "juichend",
    beweging: "juichen",
    kant: "rechts",
  });

  return { vorm, strategie: "per-rij", strategieNaam: "per rij tellen", stappen };
}

// --- Verspreid --------------------------------------------------------------

/**
 * Eén voor één, met een vinkje bij elk geteld plaatje.
 *
 * Bij groep 3-4 tikt het kind zelf mee; dat is hetzelfde gebaar als bij de
 * vraag en houdt het meetellen echt. Vanaf groep 5 gaat het vanzelf, want daar
 * is het aanwijzen geen probleem meer en zou het tikwerk alleen ophouden.
 */
function eenVoorEen(som: Somgegevens, vorm: Groepsvorm, metTikken: boolean): Uitlegscript {
  const totaal = som.goed;

  const stappen: Uitlegscript["stappen"] = [
    {
      model: beeld(som, 0, null),
      zin: "Ze liggen door elkaar. Begin linksboven.",
      houding: "wijzend",
      kant: "links",
    },
  ];

  if (metTikken) {
    stappen.push({
      model: beeld(som, 0, null),
      zin: "Tik ze één voor één aan.",
      meetellen: { aantal: totaal, aansporing: "Tik de plaatjes aan!" },
      houding: "wijzend",
      beweging: "wijzen",
      kant: "links",
    });
  } else {
    /* Halverwege stilstaan laat zien dat het vinkje bijhoudt waar je was. */
    const halverwege = Math.max(1, Math.round(totaal / 2));
    stappen.push({
      model: beeld(som, halverwege, null, String(halverwege)),
      zin: `Wat je geteld hebt, krijgt een vinkje. Nu ${halverwege}.`,
      houding: "wijzend",
      beweging: "wijzen",
      kant: "links",
    });
  }

  stappen.push({
    model: beeld(som, totaal, null, String(totaal)),
    zin: `Het laatste getal is het antwoord: ${totaal}.`,
    feest: true,
    houding: "juichend",
    beweging: "juichen",
    kant: "rechts",
  });

  return { vorm, strategie: "aftikken", strategieNaam: "aantikken en tellen", stappen };
}

// --- Groep 7-8 --------------------------------------------------------------

/** Kort en zakelijk: op deze leeftijd gaat het om de werkwijze, niet om de show. */
function lijst78(som: Somgegevens, vorm: Groepsvorm): Uitlegscript {
  const totaal = som.goed;

  if (!inRijen(som)) {
    return {
      vorm,
      strategie: "aftikken",
      strategieNaam: "aantikken en tellen",
      stappen: [
        {
          model: beeld(som, 0, null),
          zin: "Breng zelf structuur aan: maak groepjes van vijf.",
        },
        {
          model: beeld(som, totaal, null, String(totaal)),
          zin: `Tel de groepjes en tel de rest erbij: ${totaal}.`,
        },
      ],
    };
  }

  const n = perRijVan(som);
  const helerijen = Math.floor(totaal / n);
  const rest = totaal - helerijen * n;

  return {
    vorm,
    strategie: "per-rij",
    strategieNaam: "per rij tellen",
    stappen: [
      { model: beeld(som, 0, null), zin: `Elke volle rij heeft er ${n}.` },
      {
        model: beeld(som, helerijen * n, null, String(helerijen * n)),
        zin: `${helerijen} rijen van ${n} is ${helerijen * n}.`,
      },
      {
        model: beeld(som, totaal, null, String(totaal)),
        zin:
          rest > 0
            ? `En nog ${rest} los erbij: ${totaal}.`
            : `Dat is het antwoord: ${totaal}.`,
      },
    ],
  };
}

export const plaatjestellenUitleg: Uitlegbron = {
  modellen: ["plaatjesraster"],
  strategieen: [
    {
      waarde: "per-rij",
      label: "Per rij tellen",
      uitleg:
        "Tel niet stuk voor stuk maar per rij. Bij rijen van vijf of tien zie je de structuur al voordat je begint, en sla je er minder snel een over.",
    },
    {
      waarde: "aftikken",
      label: "Aantikken en tellen",
      uitleg:
        "Liggen de plaatjes door elkaar, dan is er geen groep om op te leunen. Ga een vaste kant op en tik aan wat je geteld hebt, zodat je niets overslaat of dubbel telt.",
    },
  ],
  /*
    De keuze hangt af van de opstelling, en die staat in de som — maar hier komt
    alleen de groepsvorm binnen. Daarom staat "per rij" als standaard in het
    beheer, en kiest `script` hieronder alsnog de juiste van de twee: bij
    verspreide plaatjes valt er immers niets per rij te tellen.
  */
  standaardStrategie: () => "per-rij",

  script: (som, vorm: Groepsvorm) => {
    if (!Number.isFinite(som.goed) || som.goed < 1) return null;

    const manier = MANIER_VAN_VORM[vorm];
    if (manier === "78") return lijst78(som, vorm);

    const metTikken = manier === "34";
    return inRijen(som)
      ? perRijStappen(som, vorm, metTikken)
      : eenVoorEen(som, vorm, metTikken);
  },

  vergelijkbaar: (som) => {
    if (!Number.isFinite(som.goed)) return null;
    /* Eentje erbij: dezelfde soort vraag, een ander antwoord. */
    const nieuw = som.goed + 1;
    return { ...som, getallen: [nieuw], goed: nieuw };
  },
};
