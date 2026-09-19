/**
 * De uitleg-animatie bij "Vos' straat".
 *
 * Dezelfde straat als in de vraag. Vos loopt stap voor stap over de stoep van
 * het ene huis naar het andere, en de nummers worden één voor één zichtbaar.
 * Dat lopen ís de uitleg: een buurgetal vinden is een stap zetten, niet een
 * som uitrekenen.
 *
 * Bij even en oneven loopt hij langs de overkant heen: het huis er pal naast
 * hoort bij de andere kant van de straat, dus dat slaat hij over. Precies dat
 * moet het kind zien gebeuren.
 */

import type { Somgegevens } from "@/lib/generatoren/foutpatroon";
import { MANIER_VAN_VORM } from "@/lib/generatoren/uitlegscript";
import type { Groepsvorm, Model, Uitlegbron, Uitlegscript } from "@/lib/generatoren/uitlegscript";

const basisVan = (som: Somgegevens) => som.extra?.basis ?? som.goed;
const stapVan = (som: Somgegevens) => som.extra?.stap ?? 1;
const vooruit = (som: Somgegevens) => (som.extra?.vooruit ?? 1) === 1;
const isEven = (som: Somgegevens) => (som.extra?.even ?? 0) === 1;
const aantalVan = (som: Somgegevens) => som.extra?.aantal ?? 5;
const vosVan = (som: Somgegevens) => som.extra?.vosIndex ?? 0;
const eersteVan = (som: Somgegevens) => som.extra?.eerste ?? som.goed;

/**
 * De hele rij huisnummers opnieuw opbouwen.
 *
 * In de somgegevens passen alleen getallen, dus staat de straat er niet in;
 * hij wordt hier uit dezelfde vier getallen teruggerekend als waarmee hij is
 * gemaakt. Zo ziet het kind in de uitleg exact de straat van de vraag.
 */
function straatVan(som: Somgegevens): { nummer: number; kant: "boven" | "onder" }[] {
  const aantal = aantalVan(som);
  const eerste = eersteVan(som);

  if (!isEven(som)) {
    return Array.from({ length: aantal }, (_, i) => ({
      nummer: eerste + i,
      kant: "boven" as const,
    }));
  }

  /* Even boven, oneven onder: het huis ernaast staat aan de overkant. */
  const perKant = Math.round(aantal / 2);
  const boven = Array.from({ length: perKant }, (_, i) => ({
    nummer: eerste + i * 2,
    kant: "boven" as const,
  }));
  const onder = Array.from({ length: aantal - perKant }, (_, i) => ({
    nummer: eerste + 1 + i * 2,
    kant: "onder" as const,
  }));
  return [...boven, ...onder];
}

function beeld(
  som: Somgegevens,
  zichtbaar: number[],
  nadruk: number | null,
  bijschrift?: string,
): Model {
  return {
    soort: "huizenrij",
    huizen: straatVan(som),
    vosBij: vosVan(som),
    zichtbaar,
    nadruk,
    bijschrift,
  };
}

/** Van welk huis naar welk huis: de plekken in de rij. */
function doelIndex(som: Somgegevens): number {
  const huizen = straatVan(som);
  const gevonden = huizen.findIndex((h) => h.nummer === som.goed);
  return gevonden >= 0 ? gevonden : vosVan(som);
}

function stapVoorStap(som: Somgegevens, vorm: Groepsvorm): Uitlegscript {
  const basis = basisVan(som);
  const vos = vosVan(som);
  const doel = doelIndex(som);

  const stappen: Uitlegscript["stappen"] = [
    {
      model: beeld(som, [vos], vos, String(basis)),
      zin: "Hier woont Vos.",
      houding: "wijzend",
      kant: "links",
    },
    {
      model: beeld(som, [vos], doel),
      zin: vooruit(som) ? "Hij loopt naar rechts." : "Hij loopt naar links.",
      houding: "wijzend",
      beweging: "wijzen",
      kant: vooruit(som) ? "rechts" : "links",
    },
  ];

  if (isEven(som)) {
    stappen.push({
      model: beeld(som, [vos], doel),
      zin: "De overkant slaat hij over.",
      houding: "denkend",
      kant: "links",
    });
  }

  stappen.push({
    model: beeld(som, [vos, doel], doel, String(som.goed)),
    zin: `Hier woont nummer ${som.goed}.`,
    feest: true,
    houding: "juichend",
    beweging: "juichen",
    kant: "rechts",
  });

  return { vorm, strategie: "stap", strategieNaam: "één huis verder", stappen };
}

/**
 * Allebei de buren: Vos loopt eerst naar links en daarna naar rechts.
 *
 * De volgorde is geen toeval. Links eerst, want dat is de kant die het vaakst
 * misgaat: terugtellen. En de nummers komen één voor één in beeld, zodat het
 * kind ziet dat het twee losse stappen zijn vanaf hetzelfde huis — niet één
 * som met twee uitkomsten.
 */
function allebeiStappen(som: Somgegevens, vorm: Groepsvorm): Uitlegscript {
  const basis = basisVan(som);
  const stap = stapVan(som);
  const links = som.extra?.links ?? basis - stap;
  const rechts = som.extra?.rechts ?? basis + stap;
  /* De straat is hier drie huizen breed: links, midden, rechts. */
  const midden = 1;

  return {
    vorm,
    strategie: "stap",
    strategieNaam: "eerst links, dan rechts",
    stappen: [
      {
        model: beeld(som, [midden], midden, String(basis)),
        zin: "Hier woont Vos, in het middelste huis.",
        houding: "wijzend",
        kant: "links",
      },
      {
        model: beeld(som, [midden], 0),
        zin: "Eerst loopt hij naar links.",
        houding: "wijzend",
        beweging: "wijzen",
        kant: "links",
      },
      {
        model: beeld(som, [midden, 0], 0, String(links)),
        zin: `Daar woont nummer ${links}.`,
        houding: "wijzend",
        kant: "links",
      },
      {
        model: beeld(som, [midden, 0], 2),
        zin: "Dan loopt hij terug en naar rechts.",
        houding: "wijzend",
        beweging: "wijzen",
        kant: "rechts",
      },
      {
        model: beeld(som, [midden, 0, 2], 2, String(rechts)),
        zin: `En daar woont nummer ${rechts}.`,
        feest: true,
        houding: "juichend",
        beweging: "juichen",
        kant: "rechts",
      },
    ],
  };
}

/** Groep 7-8: kort en zakelijk, sommen op één regel. */
function lijst78(som: Somgegevens, vorm: Groepsvorm): Uitlegscript {
  const basis = basisVan(som);
  const stap = stapVan(som);
  const teken = vooruit(som) ? "+" : "−";

  return {
    vorm,
    strategie: "stap",
    strategieNaam: "één huis verder",
    stappen: [
      {
        model: { soort: "som", tekst: `${basis}`, nadruk: `${basis}` },
        zin: "Begin bij het nummer van Vos.",
      },
      {
        model: { soort: "som", tekst: `${basis} ${teken} ${stap} = ${som.goed}` },
        zin: isEven(som)
          ? "Aan dezelfde kant ligt het volgende huis twee verder."
          : "Het buurgetal ligt één stap verderop.",
      },
    ],
  };
}

export const straatUitleg: Uitlegbron = {
  modellen: ["huizenrij", "som"],
  strategieen: [
    {
      waarde: "stap",
      label: "Eén huis verder",
      uitleg:
        "Kijk waar Vos staat, kijk welke kant je op moet, en doe één stap. Bij even en oneven zijn het er twee, want het huis aan dezelfde kant staat er twee verder.",
    },
  ],
  standaardStrategie: () => "stap",

  script: (som, vorm: Groepsvorm) => {
    if (!Number.isFinite(som.goed)) return null;
    /*
      Bij allebei de buren loopt Vos twee kanten op; dat is een ander verhaal
      dan één stap zetten, ook voor groep 7-8 — daar valt niet één som van te
      maken.
    */
    if ((som.extra?.allebei ?? 0) === 1) return allebeiStappen(som, vorm);
    return MANIER_VAN_VORM[vorm] === "78" ? lijst78(som, vorm) : stapVoorStap(som, vorm);
  },

  vergelijkbaar: (som) => {
    if (!Number.isFinite(som.goed)) return null;
    /* Allebei de buren: dezelfde oefening, één huis verderop in de straat. */
    if ((som.extra?.allebei ?? 0) === 1) {
      const stap = stapVan(som);
      const nieuwMidden = basisVan(som) + stap;
      return {
        ...som,
        getallen: [nieuwMidden - stap, nieuwMidden, nieuwMidden + stap],
        goed: nieuwMidden - stap,
        extra: {
          ...(som.extra ?? {}),
          basis: nieuwMidden,
          links: nieuwMidden - stap,
          rechts: nieuwMidden + stap,
          eerste: nieuwMidden - stap,
        },
      };
    }
    /* Dezelfde straat, het huis aan de andere kant van Vos. */
    const basis = basisVan(som);
    const stap = stapVan(som);
    const nieuw = vooruit(som) ? basis - stap : basis + stap;
    return { ...som, getallen: [nieuw], goed: nieuw };
  },
};
