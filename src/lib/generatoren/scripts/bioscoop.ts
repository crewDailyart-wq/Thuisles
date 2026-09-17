/**
 * De uitleg-animatie bij "Vos in de bioscoop".
 *
 * Het dichtstbijzijnde zichtbare nummer licht op, en daarna springen de stoelen
 * ertussen één voor één op met hun nummer, tot de gezochte stoel. Zo ziet een
 * kind wat er bedoeld wordt met "vijftien, en dan nog twee".
 */

import type { Somgegevens } from "@/lib/generatoren/foutpatroon";
import { MANIER_VAN_VORM } from "@/lib/generatoren/uitlegscript";
import type { Groepsvorm, Model, Uitlegbron, Uitlegscript } from "@/lib/generatoren/uitlegscript";
import { inWoorden } from "@/lib/getalwoorden";

const perRij = (som: Somgegevens) => som.extra?.perRij ?? 10;
const aantalVan = (som: Somgegevens) => som.extra?.stoelen ?? 20;
const houvast = (som: Somgegevens) => som.extra?.houvast ?? som.goed;

/** Welke stoelnummers hun nummer laten zien; staat als reeks in de som. */
function zichtbaarVan(som: Somgegevens): number[] {
  const stap = som.extra?.zichtbaarStap ?? 5;
  const uit: number[] = [1];
  for (let n = stap; n <= aantalVan(som); n += stap) uit.push(n);
  return uit;
}

function beeld(som: Somgegevens, tot: number, bijschrift?: string): Model {
  return {
    soort: "bioscoop",
    aantal: aantalVan(som),
    perRij: perRij(som),
    zichtbaar: zichtbaarVan(som),
    vanaf: houvast(som),
    tot,
    bijschrift,
  };
}

function stapVoorStap(som: Somgegevens, vorm: Groepsvorm): Uitlegscript {
  const h = houvast(som);
  const heen = som.goed >= h;
  const stappen: Uitlegscript["stappen"] = [
    {
      model: beeld(som, h, String(h)),
      zin: `Begin bij ${inWoorden(h)}.`,
      houding: "wijzend",
      kant: "links",
    },
  ];

  const aantalStappen = Math.abs(som.goed - h);
  for (let i = 1; i <= aantalStappen; i++) {
    const nu = heen ? h + i : h - i;
    stappen.push({
      model: beeld(som, nu, String(nu)),
      zin: inWoorden(nu),
      houding: "blij",
      beweging: "wijzen",
      kant: i % 2 === 0 ? "links" : "rechts",
    });
  }

  stappen.push({
    model: beeld(som, som.goed, String(som.goed)),
    zin: "Hier zit Vos!",
    feest: true,
    houding: "juichend",
    beweging: "juichen",
    kant: "rechts",
  });

  return { vorm, strategie: "springen", strategieNaam: "springen vanaf een nummer", stappen };
}

/** Groep 7-8: kort en zakelijk, sommen op één regel. */
function lijst78(som: Somgegevens, vorm: Groepsvorm): Uitlegscript {
  const h = houvast(som);
  const verschil = som.goed - h;
  return {
    vorm,
    strategie: "springen",
    strategieNaam: "springen vanaf een nummer",
    stappen: [
      {
        model: { soort: "som", tekst: `${h}`, nadruk: `${h}` },
        zin: "Neem het dichtstbijzijnde zichtbare nummer.",
      },
      {
        model: {
          soort: "som",
          tekst: `${h} ${verschil >= 0 ? "+" : "−"} ${Math.abs(verschil)} = ${som.goed}`,
        },
        zin: "Tel van daaruit verder.",
      },
    ],
  };
}

export const bioscoopUitleg: Uitlegbron = {
  modellen: ["bioscoop", "som"],
  strategieen: [
    {
      waarde: "springen",
      label: "Springen vanaf een nummer",
      uitleg:
        "Tel niet vanaf één, maar zoek het dichtstbijzijnde nummer dat er staat en tel van daaruit verder. Bij vijftallen en tientallen zijn dat nooit meer dan een paar stapjes, en dat is precies waarvoor die nummers er staan.",
    },
  ],
  standaardStrategie: () => "springen",

  script: (som, vorm: Groepsvorm) => {
    if (!Number.isFinite(som.goed) || som.goed < 1) return null;
    return MANIER_VAN_VORM[vorm] === "78" ? lijst78(som, vorm) : stapVoorStap(som, vorm);
  },

  vergelijkbaar: (som) => {
    if (!Number.isFinite(som.goed)) return null;
    const nieuw = som.goed < aantalVan(som) ? som.goed + 1 : som.goed - 1;
    return { ...som, getallen: [nieuw], goed: nieuw };
  },
};
