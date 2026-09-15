/**
 * De uitleg-animaties bij "Tellen en slepen".
 *
 * Eén strategie: tel per afbeelding, en leg het getal meteen onder díe
 * afbeelding. Het koppelen is hier net zo goed de les als het tellen.
 *
 *   groep 3-4  De onderdelen lichten één voor één op terwijl Vos meetelt, eerst
 *              bij de linkerafbeelding, dan bij de volgende. Het kind mag ze
 *              zelf aantikken.
 *   groep 5-6  Per afbeelding in één keer, met het getal erbij.
 *   groep 7-8  Geen animatie maar een leeslijst met de aantallen op een rij.
 *
 * ---------------------------------------------------------------------------
 * Waarom het echte figuur en geen blokjes
 * ---------------------------------------------------------------------------
 * Deze uitleg liet eerst rijen blokjes zien. Dat klopte niet: een kind dat de
 * stippen op een lieveheersbeestje moet tellen, ziet dan ineens paarse vlakken
 * en moet zelf bedenken dat die de stippen voorstellen. Juist dat verband is
 * wat hier geoefend wordt, dus toont de uitleg hetzelfde figuur als de vraag —
 * met de onderdelen die één voor één oplichten.
 */

import type { Somgegevens } from "@/lib/generatoren/foutpatroon";
import { MANIER_VAN_VORM } from "@/lib/generatoren/uitlegscript";
import type { Groepsvorm, Model, Uitlegbron, Uitlegscript } from "@/lib/generatoren/uitlegscript";
import { telsoortWoorden } from "@/lib/telsoorten";

/** De aantallen van de afbeeldingen in deze vraag. */
function aantallen(som: Somgegevens): number[] {
  return som.getallen.filter((n) => Number.isFinite(n) && n > 0);
}

/**
 * Welk figuur erbij hoort.
 *
 * Binnen één vraag is dat er altijd één; de generator zet hem in `variant`.
 * Ontbreekt hij — bij het voorbeeld in het beheer bijvoorbeeld — dan is de
 * bloem de terugval, net als bij de tekening zelf.
 */
function figuurvan(som: Somgegevens): string {
  return som.variant ?? "bloem";
}

function beeld(soort: string, aantal: number, opgelicht: number, bijschrift?: string): Model {
  return { soort: "telfiguur", telsoort: soort, aantal, opgelicht, bijschrift };
}

// --- Groep 3-4 -------------------------------------------------------------

function stapVoorStap34(reeks: number[], soort: string, vorm: Groepsvorm): Uitlegscript {
  const woorden = telsoortWoorden(soort);
  /* De aansporing noemt waarop je tikt; dat scheelt een kind het raden. */
  const tikzin = `Tik de ${woorden.meervoud} maar aan!`;

  const stappen: Uitlegscript["stappen"] = [
    {
      model: beeld(soort, reeks[0], 0),
      zin: "Kijk, we gaan tellen.",
      houding: "blij",
      kant: "links",
    },
  ];

  reeks.forEach((n, i) => {
    stappen.push({
      model: beeld(soort, n, 0),
      zin: i === 0 ? "Begin bij de eerste." : "Nu de volgende.",
      meetellen: { aantal: n, aansporing: tikzin },
      houding: "wijzend",
      kant: i % 2 === 0 ? "links" : "rechts",
    });
    stappen.push({
      model: beeld(soort, n, n, String(n)),
      zin: `Dat zijn er ${n}.`,
      houding: "blij",
      kant: i % 2 === 0 ? "links" : "rechts",
    });
  });

  /*
    De slotstap toont het laatst getelde figuur, zonder bijschrift.

    Hier stond eerst het rijtje van álle antwoorden ("4 · 5"). Dat sloeg nergens
    op: in beeld staat één figuur met vijf ballonnen, en er stond "4 · 5" onder.
    Dit is geen splitsing maar een telling, dus hoort er onder een afbeelding
    hoogstens één getal te staan — en op deze stap is dat al te zien aan de
    opgelichte onderdelen zelf.
  */
  const laatste = reeks[reeks.length - 1];
  stappen.push({
    model: beeld(soort, laatste, laatste),
    zin: "Klaar! Goed geteld.",
    feest: true,
    houding: "juichend",
    beweging: "juichen",
    kant: "rechts",
  });

  return { vorm, strategie: "tel-en-koppel", strategieNaam: "tellen en koppelen", stappen };
}

// --- Groep 5-6 -------------------------------------------------------------

function stapVoorStap56(reeks: number[], soort: string, vorm: Groepsvorm): Uitlegscript {
  const stappen: Uitlegscript["stappen"] = reeks.map((n, i) => ({
    model: beeld(soort, n, n, String(n)),
    zin: `Afbeelding ${i + 1}: dat zijn er ${n}.`,
    houding: "wijzend" as const,
    beweging: "wijzen" as const,
    kant: i % 2 === 0 ? ("links" as const) : ("rechts" as const),
  }));

  /* Zonder bijschrift; de zin noemt de getallen al. Zie groep 3-4 hierboven. */
  const laatste = reeks[reeks.length - 1];
  stappen.push({
    model: beeld(soort, laatste, laatste),
    zin: `Elk getal hoort onder de afbeelding waar je het geteld hebt: ${reeks.join(", ")}.`,
    feest: true,
    houding: "juichend",
    beweging: "juichen",
    kant: "rechts",
  });

  return { vorm, strategie: "tel-en-koppel", strategieNaam: "tellen en koppelen", stappen };
}

// --- Groep 7-8 -------------------------------------------------------------

function lijst78(reeks: number[], soort: string, vorm: Groepsvorm): Uitlegscript {
  const woorden = telsoortWoorden(soort);
  return {
    vorm,
    strategie: "tel-en-koppel",
    strategieNaam: "tellen en koppelen",
    stappen: [
      {
        model: { soort: "som", tekst: `${reeks.length} afbeeldingen` },
        zin: `Tel de ${woorden.meervoud} per afbeelding, van links naar rechts.`,
      },
      {
        model: { soort: "som", tekst: reeks.join(" · "), nadruk: reeks.join(" · ") },
        zin: "Dit zijn de aantallen, in dezelfde volgorde als de afbeeldingen.",
      },
      {
        model: { soort: "som", tekst: "elk getal onder zijn eigen afbeelding" },
        zin: "Twee verwisselde getallen is fout, ook als je goed geteld hebt.",
      },
    ],
  };
}

export const tellenslepenUitleg: Uitlegbron = {
  modellen: ["telfiguur", "som"],
  strategieen: [
    {
      waarde: "tel-en-koppel",
      label: "Tellen en koppelen",
      uitleg:
        "Tel de onderdelen van één afbeelding, leg dat getal er meteen onder, en ga dan pas naar de volgende.",
    },
  ],
  standaardStrategie: () => "tel-en-koppel",

  script: (som, vorm: Groepsvorm) => {
    const reeks = aantallen(som);
    if (reeks.length === 0) return null;
    const soort = figuurvan(som);

    const manier = MANIER_VAN_VORM[vorm];
    if (manier === "34") return stapVoorStap34(reeks, soort, vorm);
    if (manier === "56") return stapVoorStap56(reeks, soort, vorm);
    return lijst78(reeks, soort, vorm);
  },

  vergelijkbaar: (som) => {
    const reeks = aantallen(som);
    if (reeks.length === 0) return null;
    /* Eén erbij op elke afbeelding: zelfde soort vraag, andere antwoorden. */
    const nieuw = reeks.map((n) => n + 1);
    return { ...som, getallen: nieuw, goed: nieuw[0] };
  },
};
