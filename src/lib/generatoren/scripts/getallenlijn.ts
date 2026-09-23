/**
 * De uitleg-animatie bij "Getallenlijn".
 *
 * Dezelfde lijn als in de vraag. Het dichtstbijzijnde getal dat er wél staat
 * licht op, en Vos telt van daaruit streepje voor streepje verder — hardop,
 * één getal per stap. Bij 13 met zichtbare vijftallen licht dus eerst de 10 op,
 * en dan klinkt het: elf, twaalf, dertien.
 *
 * Aan het eind staat Vos op het goede streepje met zijn vlaggetje erbij,
 * precies zoals het eruitziet als het kind het zelf goed doet.
 */

import type { Somgegevens } from "@/lib/generatoren/foutpatroon";
import { MANIER_VAN_VORM } from "@/lib/generatoren/uitlegscript";
import type { Groepsvorm, Model, Uitlegbron, Uitlegscript } from "@/lib/generatoren/uitlegscript";
import {
  ankerVoor,
  isSchatten,
  middenVan,
  stapVan,
  vasteGetallen,
} from "@/lib/generatoren/aanpak/getallenlijn";

/** Het getal op het wijzertje; alleen de tussenstand heeft er een. */
function wijzerVan(som: Somgegevens): number | null {
  const w = som.extra?.wijzer;
  return typeof w === "number" ? w : null;
}

/** Welk getal er gezocht wordt. */
function doelVan(som: Somgegevens): number {
  return som.getallen[0];
}

/**
 * Eén beeld van de getallenlijn.
 *
 * `telTot` is het streepje waar Vos nu staat; `vlag` zet het vlaggetje neer.
 * De speler vult de mascotte aan, net als bij de andere types.
 */
function beeld(som: Somgegevens, telTot: number, vlag: boolean, nadruk: number | null): Model {
  return {
    soort: "getallenlijn",
    start: som.extra?.start ?? 0,
    eind: som.extra?.eind ?? 20,
    stap: stapVan(som),
    zichtbaar: vasteGetallen(som),
    doel: doelVan(som),
    telTot,
    vlag,
    nadruk,
  };
}

/**
 * Eén beeld van de tussenstand.
 *
 * Dezelfde lijn met het wijzertje erboven, en de twee vakjes op de streepjes
 * ernaast. `gevuld` zegt hoeveel van die vakjes er al een getal in hebben — zo
 * verschijnen ze één voor één terwijl Vos ernaartoe loopt.
 */
function tussenbeeld(som: Somgegevens, telTot: number, gevuld: number, nadruk: number | null): Model {
  const [onder, boven] = som.getallen;
  return {
    soort: "getallenlijn",
    start: som.extra?.start ?? 0,
    eind: som.extra?.eind ?? 100,
    stap: stapVan(som),
    zichtbaar: vasteGetallen(som),
    doel: onder,
    telTot,
    vlag: false,
    nadruk,
    wijzer: wijzerVan(som) ?? onder,
    vakjes: [onder, boven],
    getypt: [gevuld >= 1 ? String(onder) : "", gevuld >= 2 ? String(boven) : ""],
  };
}

/**
 * Eén beeld van de schatstand.
 *
 * De lijn krijgt in de uitleg wél hulpstreepjes — bij de tientallen en het
 * midden — want dat is precies wat er uit te leggen valt: waar je op mikt als
 * je schat. `telTot` is de plek van Vos, `nadruk` het getal dat oplicht.
 */
function schatbeeld(
  som: Somgegevens,
  telTot: number,
  nadruk: number | null,
  vlag: boolean,
): Model {
  const start = som.extra?.start ?? 0;
  const eind = som.extra?.eind ?? 100;
  const hulplijnen: number[] = [];
  for (let n = Math.ceil(start / 10) * 10; n < eind; n += 10) {
    if (n > start) hulplijnen.push(n);
  }
  const midden = middenVan(som);
  if (!hulplijnen.includes(midden)) hulplijnen.push(midden);
  hulplijnen.sort((a, b) => a - b);

  return {
    soort: "getallenlijn",
    start,
    eind,
    stap: 1,
    zichtbaar: [start, eind],
    doel: som.getallen[0],
    telTot,
    vlag,
    nadruk,
    vrij: true,
    hulplijnen,
  };
}

/**
 * De uitleg van de schatstand.
 *
 * Eerst het midden, dan het dichtstbijzijnde kwart, en dan pas het getal zelf:
 * dat is de helft-strategie zoals hij op school wordt aangeleerd. Bij 74 licht
 * eerst de 50 op, daarna de 75, en dan blijkt 74 net daarvoor te liggen.
 */
function schatten(som: Somgegevens, vorm: Groepsvorm, kort: boolean): Uitlegscript {
  const start = som.extra?.start ?? 0;
  const eind = som.extra?.eind ?? 100;
  const doel = som.getallen[0];
  const midden = middenVan(som);
  const deel = (doel - start) / Math.max(1, eind - start);
  const kwart =
    deel < 0.375
      ? Math.round(start + (eind - start) / 4)
      : deel > 0.625
        ? Math.round(start + ((eind - start) * 3) / 4)
        : midden;
  const kwartnaam = kwart === midden ? "de helft" : deel < 0.5 ? "een kwart" : "driekwart";

  const stappen: Uitlegscript["stappen"] = [
    {
      model: schatbeeld(som, midden, midden, false),
      zin: kort ? `In het midden ligt ${midden}.` : `De helft van de lijn is ${midden}.`,
      houding: "wijzend",
      beweging: "wijzen",
      kant: "links",
    },
  ];

  if (kwart !== midden) {
    stappen.push({
      model: schatbeeld(som, kwart, kwart, false),
      zin: kort ? `${kwart} is ${kwartnaam}.` : `Op ${kwartnaam} ligt ${kwart}.`,
      houding: "wijzend",
      kant: deel < 0.5 ? "links" : "rechts",
    });
  }

  stappen.push({
    model: schatbeeld(som, doel, doel, true),
    zin:
      doel < kwart
        ? `${doel} ligt net daarvoor.`
        : doel > kwart
          ? `${doel} ligt net daarna.`
          : `${doel} ligt daar precies.`,
    feest: true,
    houding: "juichend",
    beweging: "juichen",
    kant: deel < 0.5 ? "links" : "rechts",
  });

  return {
    vorm,
    strategie: "schatten-met-ankers",
    strategieNaam: "schatten met ankerpunten",
    stappen,
  };
}

/** Groep 7-8 bij de schatstand: dezelfde redenering op één regel. */
function schatLijst78(som: Somgegevens, vorm: Groepsvorm): Uitlegscript {
  const start = som.extra?.start ?? 0;
  const eind = som.extra?.eind ?? 100;
  const doel = som.getallen[0];
  const midden = middenVan(som);
  const deel = Math.round(((doel - start) / Math.max(1, eind - start)) * 100);
  return {
    vorm,
    strategie: "schatten-met-ankers",
    strategieNaam: "schatten met ankerpunten",
    stappen: [
      {
        model: { soort: "som", tekst: `${start} … ${midden} … ${eind}`, nadruk: String(midden) },
        zin: `De helft van deze lijn is ${midden}.`,
      },
      {
        model: { soort: "som", tekst: `${doel} = ${deel}%`, nadruk: String(doel) },
        zin: `${doel} ligt op ongeveer ${deel} procent van de lijn.`,
      },
      {
        model: { soort: "som", tekst: `${doel}` },
        zin: "Daar zet je Vos neer; precies hoeft niet.",
      },
    ],
  };
}

/**
 * De uitleg van de tussenstand.
 *
 * Het wijzertje licht op, Vos loopt eerst naar het streepje links ervan en dan
 * naar het streepje rechts, en in allebei de vakjes verschijnt het getal. Zo
 * ziet het kind waar de twee getallen vandaan komen.
 */
function tussen(som: Somgegevens, vorm: Groepsvorm, kort: boolean): Uitlegscript {
  const [onder, boven] = som.getallen;
  const wijzer = wijzerVan(som) ?? onder;
  return {
    vorm,
    strategie: "tussen-welke",
    strategieNaam: "kijken tussen welke twee streepjes het ligt",
    stappen: [
      {
        model: tussenbeeld(som, onder, 0, null),
        zin: kort ? `Kijk waar ${wijzer} staat.` : `Kijk waar ${wijzer} op de lijn staat.`,
        houding: "wijzend",
        beweging: "wijzen",
        kant: "links",
      },
      {
        model: tussenbeeld(som, onder, 1, onder),
        zin: kort ? `Links staat ${onder}.` : `Het streepje links ervan is ${onder}.`,
        houding: "wijzend",
        kant: "links",
      },
      {
        model: tussenbeeld(som, boven, 2, boven),
        zin: kort ? `Rechts staat ${boven}.` : `Het streepje rechts ervan is ${boven}.`,
        houding: "wijzend",
        kant: "rechts",
      },
      {
        model: tussenbeeld(som, boven, 2, null),
        zin: `${wijzer} ligt tussen ${onder} en ${boven}.`,
        feest: true,
        houding: "juichend",
        beweging: "juichen",
        kant: "rechts",
      },
    ],
  };
}

/** Groep 7-8 bij de tussenstand: dezelfde redenering op één regel. */
function tussenLijst78(som: Somgegevens, vorm: Groepsvorm): Uitlegscript {
  const [onder, boven] = som.getallen;
  const wijzer = wijzerVan(som) ?? onder;
  return {
    vorm,
    strategie: "tussen-welke",
    strategieNaam: "kijken tussen welke twee streepjes het ligt",
    stappen: [
      {
        model: { soort: "som", tekst: `${wijzer}`, nadruk: String(wijzer) },
        zin: "Zoek het getal op de lijn.",
      },
      {
        model: { soort: "som", tekst: `${onder} < ${wijzer} < ${boven}`, nadruk: String(wijzer) },
        zin: `Het streepje ervoor is ${onder}, het streepje erna ${boven}.`,
      },
      {
        model: { soort: "som", tekst: `${onder} en ${boven}` },
        zin: "Die twee horen in de vakjes.",
      },
    ],
  };
}

/** De telstappen van het anker naar het doel, inclusief het doel zelf. */
function telstappen(anker: number, doel: number, stap: number): number[] {
  const uit: number[] = [];
  const richting = doel >= anker ? stap : -stap;
  for (let n = anker + richting; richting > 0 ? n <= doel : n >= doel; n += richting) {
    uit.push(n);
  }
  return uit;
}

function tellen(som: Somgegevens, vorm: Groepsvorm, kort: boolean): Uitlegscript {
  const doel = doelVan(som);
  const anker = ankerVoor(som, doel);
  const stappen: Uitlegscript["stappen"] = [
    {
      model: beeld(som, anker, false, anker),
      zin: kort
        ? `Hier staat ${anker}.`
        : `Zoek eerst een getal dat er wél staat: hier is dat ${anker}.`,
      houding: "wijzend",
      beweging: "wijzen",
      kant: "links",
    },
  ];

  for (const n of telstappen(anker, doel, stapVan(som))) {
    stappen.push({
      model: beeld(som, n, false, n === doel ? null : n),
      zin: `${n}.`,
      houding: "wijzend",
      kant: n % 2 === 0 ? "links" : "rechts",
    });
  }

  stappen.push({
    model: beeld(som, doel, true, doel),
    zin: kort ? `Daar staat de ${doel}.` : `Daar hoort de ${doel}, en daar zet Vos zijn vlag.`,
    feest: true,
    houding: "juichend",
    beweging: "juichen",
    kant: "rechts",
  });

  return {
    vorm,
    strategie: "tellen-vanaf-anker",
    strategieNaam: "tellen vanaf een getal dat er staat",
    stappen,
  };
}

/** Groep 7-8: geen animatie maar een leeslijst met de som op één regel. */
function lijst78(som: Somgegevens, vorm: Groepsvorm): Uitlegscript {
  const doel = doelVan(som);
  const anker = ankerVoor(som, doel);
  const stap = stapVan(som);
  const stappen = Math.abs(doel - anker) / stap;
  return {
    vorm,
    strategie: "tellen-vanaf-anker",
    strategieNaam: "tellen vanaf een getal dat er staat",
    stappen: [
      {
        model: { soort: "som", tekst: `${anker}`, nadruk: String(anker) },
        zin: "Neem het dichtstbijzijnde getal dat onder een streepje staat.",
      },
      {
        model: {
          soort: "som",
          tekst: `${anker} ${doel >= anker ? "+" : "−"} ${Math.abs(doel - anker)} = ${doel}`,
          nadruk: String(doel),
        },
        zin: `Tel van daaraf ${stappen} ${stappen === 1 ? "streepje" : "streepjes"} ${
          doel >= anker ? "verder" : "terug"
        }.`,
      },
      {
        model: { soort: "som", tekst: `${doel}` },
        zin: "Daar zet je Vos neer: het gezochte getal wijst het streepje aan.",
      },
    ],
  };
}

export const getallenlijnUitleg: Uitlegbron = {
  modellen: ["getallenlijn", "som"],
  strategieen: [
    {
      waarde: "tellen-vanaf-anker",
      label: "Tellen vanaf een getal dat er staat",
      uitleg:
        "Zoek het dichtstbijzijnde getal dat onder een streepje staat en tel van daaraf streepje voor streepje verder.",
    },
    {
      waarde: "schatten-met-ankers",
      label: "Schatten met ankerpunten",
      uitleg:
        "Zoek eerst de helft van de lijn, dan het dichtstbijzijnde kwart, en schat van daaruit waar het getal ligt. Voor de schatstand.",
    },
    {
      waarde: "tussen-welke",
      label: "Kijken tussen welke twee streepjes het ligt",
      uitleg:
        "Zoek het getal op de lijn en lees af welk streepje er links van staat en welk rechts. Voor de tussenstand.",
    },
  ],
  standaardStrategie: () => "tellen-vanaf-anker",

  script: (som, vorm: Groepsvorm) => {
    if (som.getallen.length === 0) return null;

    const manier = MANIER_VAN_VORM[vorm];
    /* De schatstand heeft zijn eigen uitleg met ankerpunten. */
    if (isSchatten(som)) {
      if (manier === "78") return schatLijst78(som, vorm);
      return schatten(som, vorm, manier === "34");
    }
    /* De tussenstand heeft zijn eigen uitleg; herkenbaar aan het wijzertje. */
    if (wijzerVan(som) !== null && som.getallen.length === 2) {
      if (manier === "78") return tussenLijst78(som, vorm);
      return tussen(som, vorm, manier === "34");
    }
    if (manier === "78") return lijst78(som, vorm);
    return tellen(som, vorm, manier === "34");
  },

  vergelijkbaar: (som) => {
    /* Schatten: een ander getal op dezelfde lijn. */
    if (isSchatten(som)) {
      const start = som.extra?.start ?? 0;
      const eind = som.extra?.eind ?? 100;
      const nieuw = som.getallen[0] + 1 < eind ? som.getallen[0] + 1 : som.getallen[0] - 1;
      if (nieuw <= start || nieuw >= eind) return null;
      return { ...som, getallen: [nieuw], goed: nieuw };
    }

    /* De tussenstand: hetzelfde vak, maar een ander getal ertussenin. */
    const wijzer = wijzerVan(som);
    if (wijzer !== null && som.getallen.length === 2) {
      const [onder, boven] = som.getallen;
      const nieuw = wijzer + 1 < boven ? wijzer + 1 : wijzer - 1;
      if (nieuw <= onder || nieuw >= boven) return null;
      return { ...som, extra: { ...som.extra, wijzer: nieuw } };
    }

    /* Dezelfde lijn, maar één streepje opgeschoven: zelfde vraag, ander antwoord. */
    const stap = stapVan(som);
    const eind = som.extra?.eind ?? 20;
    const start = som.extra?.start ?? 0;
    const doel = doelVan(som);
    const nieuw = doel + stap < eind ? doel + stap : doel - stap;
    if (nieuw <= start || nieuw >= eind) return null;
    return { ...som, getallen: [nieuw], goed: nieuw };
  },
};
