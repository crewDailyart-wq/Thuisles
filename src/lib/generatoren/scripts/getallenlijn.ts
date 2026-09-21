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
import { ankerVoor, stapVan, vasteGetallen } from "@/lib/generatoren/aanpak/getallenlijn";

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
  ],
  standaardStrategie: () => "tellen-vanaf-anker",

  script: (som, vorm: Groepsvorm) => {
    if (som.getallen.length === 0) return null;

    const manier = MANIER_VAN_VORM[vorm];
    if (manier === "78") return lijst78(som, vorm);
    return tellen(som, vorm, manier === "34");
  },

  vergelijkbaar: (som) => {
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
