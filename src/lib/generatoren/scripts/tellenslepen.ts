/**
 * De uitleg-animaties bij "Tellen en slepen".
 *
 * Eén strategie: tel per afbeelding, en leg het getal meteen onder díe
 * afbeelding. Het koppelen is hier net zo goed de les als het tellen.
 *
 *   groep 3-4  De onderdelen lichten één voor één op terwijl Vos meetelt, eerst
 *              bij de linkerafbeelding, dan bij de volgende.
 *   groep 5-6  Per afbeelding in één keer, met het getal erbij.
 *   groep 7-8  Geen animatie maar een leeslijst met de aantallen op een rij.
 */

import type { Somgegevens } from "@/lib/generatoren/foutpatroon";
import { MANIER_VAN_VORM } from "@/lib/generatoren/uitlegscript";
import type { Groepsvorm, Uitlegbron, Uitlegscript } from "@/lib/generatoren/uitlegscript";

/**
 * De figuursoorten staan niet in `somgegevens` — daar passen alleen getallen in.
 * Voor de animatie is dat geen bezwaar: die laat blokjes zien, net als bij de
 * andere types die met losse onderdelen werken.
 */
function aantallen(som: Somgegevens): number[] {
  return som.getallen.filter((n) => Number.isFinite(n) && n > 0);
}

/** Blokjes voor één afbeelding: `geteld` ervan zijn al aangeraakt. */
function blokjes(totaal: number, geteld: number, bijschrift?: string) {
  return {
    soort: "blokjes" as const,
    blokjes: Array.from({ length: totaal }, (_, i) =>
      i < geteld ? ("geteld" as const) : ("normaal" as const),
    ),
    perRij: Math.min(5, Math.max(2, Math.ceil(Math.sqrt(totaal)))),
    bijschrift,
  };
}

// --- Groep 3-4 -------------------------------------------------------------

function stapVoorStap34(reeks: number[], vorm: Groepsvorm): Uitlegscript {
  const stappen: Uitlegscript["stappen"] = [
    {
      model: blokjes(reeks[0], 0),
      zin: "Kijk, we gaan tellen.",
      houding: "blij",
      kant: "links",
    },
  ];

  reeks.forEach((n, i) => {
    stappen.push({
      model: blokjes(n, 0),
      zin: i === 0 ? "Begin bij de eerste." : "Nu de volgende.",
      meetellen: { aantal: n, aansporing: "Tik ze maar aan!" },
      houding: "wijzend",
      kant: i % 2 === 0 ? "links" : "rechts",
    });
    stappen.push({
      model: blokjes(n, n, String(n)),
      zin: `Dat zijn er ${n}.`,
      houding: "blij",
      kant: i % 2 === 0 ? "links" : "rechts",
    });
  });

  stappen.push({
    model: blokjes(reeks[reeks.length - 1], reeks[reeks.length - 1], reeks.join(" · ")),
    zin: "Klaar! Goed geteld.",
    feest: true,
    houding: "juichend",
    beweging: "juichen",
    kant: "rechts",
  });

  return { vorm, strategie: "tel-en-koppel", strategieNaam: "tellen en koppelen", stappen };
}

// --- Groep 5-6 -------------------------------------------------------------

function stapVoorStap56(reeks: number[], vorm: Groepsvorm): Uitlegscript {
  const stappen: Uitlegscript["stappen"] = reeks.map((n, i) => ({
    model: blokjes(n, n, String(n)),
    zin: `Afbeelding ${i + 1}: dat zijn er ${n}.`,
    houding: "wijzend",
    beweging: "wijzen",
    kant: i % 2 === 0 ? ("links" as const) : ("rechts" as const),
  }));

  stappen.push({
    model: blokjes(reeks[reeks.length - 1], reeks[reeks.length - 1], reeks.join(" · ")),
    zin: `Elk getal hoort onder de afbeelding waar je het geteld hebt: ${reeks.join(", ")}.`,
    feest: true,
    houding: "juichend",
    beweging: "juichen",
    kant: "rechts",
  });

  return { vorm, strategie: "tel-en-koppel", strategieNaam: "tellen en koppelen", stappen };
}

// --- Groep 7-8 -------------------------------------------------------------

function lijst78(reeks: number[], vorm: Groepsvorm): Uitlegscript {
  return {
    vorm,
    strategie: "tel-en-koppel",
    strategieNaam: "tellen en koppelen",
    stappen: [
      {
        model: { soort: "som", tekst: `${reeks.length} afbeeldingen` },
        zin: "Tel per afbeelding, van links naar rechts.",
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
  modellen: ["blokjes", "som"],
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

    const manier = MANIER_VAN_VORM[vorm];
    if (manier === "34") return stapVoorStap34(reeks, vorm);
    if (manier === "56") return stapVoorStap56(reeks, vorm);
    return lijst78(reeks, vorm);
  },

  vergelijkbaar: (som) => {
    const reeks = aantallen(som);
    if (reeks.length === 0) return null;
    /* Eén erbij op elke afbeelding: zelfde soort vraag, andere antwoorden. */
    const nieuw = reeks.map((n) => n + 1);
    return { ...som, getallen: nieuw, goed: nieuw[0] };
  },
};
