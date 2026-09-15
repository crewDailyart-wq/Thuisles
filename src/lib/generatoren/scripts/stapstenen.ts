/**
 * De uitleg-animaties bij "Telrij stapstenen".
 *
 * Eén strategie: lees de sprong af en tel van links naar rechts door.
 *
 *   groep 3-4  De vos springt van steen naar steen. Bij elke sprong staat het
 *              boogje met "+1" (of de ingestelde sprong) erboven, en Vos telt
 *              hardop mee.
 *   groep 5-6  Dezelfde sprongen, met de som erbij in de zin.
 *   groep 7-8  Geen animatie maar een leeslijst met de rij op een rij.
 *
 * ---------------------------------------------------------------------------
 * Dezelfde stenen als in de vraag
 * ---------------------------------------------------------------------------
 * De uitleg gebruikt hetzelfde figuur als de vraag: dezelfde stenen, dezelfde
 * afstanden, dezelfde mascotte. Zou de uitleg blokjes of een andere weergave
 * tonen, dan moet een kind zelf bedenken dat die iets met de stenen te maken
 * hebben — en dat is precies de stap die hier lastig is.
 */

import type { Somgegevens } from "@/lib/generatoren/foutpatroon";
import { MANIER_VAN_VORM } from "@/lib/generatoren/uitlegscript";
import type { Groepsvorm, Model, Uitlegbron, Uitlegscript } from "@/lib/generatoren/uitlegscript";

function sprongVan(som: Somgegevens): number {
  return som.extra?.sprong ?? 1;
}

function legePlekken(som: Somgegevens): number[] {
  const hoeveel = som.extra?.aantalLeeg ?? 0;
  return Array.from({ length: hoeveel }, (_, k) => som.extra?.[`leeg${k}`] ?? -1).filter(
    (p) => p >= 0,
  );
}

/**
 * De stenen zoals ze in de uitleg staan.
 *
 * `tot` zegt tot en met welke steen de getallen al zichtbaar zijn; daarachter
 * blijven de lege stenen leeg. Zo vult de rij zich terwijl de vos vordert.
 */
function beeld(som: Somgegevens, tot: number, vosOp: number, boogVan: number | null): Model {
  const lege = legePlekken(som);
  return {
    soort: "stapstenen",
    stenen: som.getallen.map((n, i) => (lege.includes(i) && i > tot ? null : n)),
    sprong: sprongVan(som),
    richting: som.variant === "terug" ? "terug" : "vooruit",
    /* De speler vult de mascotte aan; zie het Model in `uitlegscript.ts`. */
    mascotte: null,
    vosOp,
    boogVan,
  };
}

// --- Groep 3-4 -------------------------------------------------------------

/**
 * Wat Vos zegt bij één sprong.
 *
 * Niet "3 springt naar 4": een getal springt niet, de vos springt. En het moet
 * de sprong zélf benoemen, want dat is wat een kind moet leren zien. Vandaar
 * "3 en nog 1 is 4" vooruit, en "5 en 1 terug is 4" bij terugtellen — bij elke
 * sprongmaat dezelfde zin, met alleen een ander getal erin.
 */
function sprongzin(van: number, sprong: number, naar: number, terug: boolean): string {
  return terug ? `${van} en ${sprong} terug is ${naar}.` : `${van} en nog ${sprong} is ${naar}.`;
}

function sprongen34(som: Somgegevens, vorm: Groepsvorm): Uitlegscript {
  const r = som.getallen;
  const sprong = sprongVan(som);
  const terug = som.variant === "terug";
  const teken = terug ? "eraf" : "erbij";

  const stappen: Uitlegscript["stappen"] = [
    {
      model: beeld(som, 0, 0, null),
      zin: "Kijk, we gaan springen.",
      houding: "blij",
      kant: "links",
    },
    {
      model: beeld(som, 0, 0, 0),
      /* Hoogstens zes woorden; `controleerUitleg` bewaakt dat voor groep 3-4. */
      zin: `Elke sprong is ${sprong} ${teken}.`,
      houding: "wijzend",
      beweging: "wijzen",
      kant: "links",
    },
  ];

  for (let i = 1; i < r.length; i++) {
    stappen.push({
      model: beeld(som, i, i, i < r.length - 1 ? i : null),
      zin: sprongzin(r[i - 1], sprong, r[i], terug),
      houding: "wijzend",
      kant: i % 2 === 0 ? "links" : "rechts",
    });
  }

  stappen.push({
    model: beeld(som, r.length - 1, r.length - 1, null),
    zin: "Klaar! De rij is vol.",
    feest: true,
    houding: "juichend",
    beweging: "juichen",
    kant: "rechts",
  });

  return { vorm, strategie: "sprong-doortellen", strategieNaam: "doortellen met sprongen", stappen };
}

// --- Groep 5-6 -------------------------------------------------------------

function sprongen56(som: Somgegevens, vorm: Groepsvorm): Uitlegscript {
  const r = som.getallen;
  const sprong = sprongVan(som);
  const terug = som.variant === "terug";

  const stappen: Uitlegscript["stappen"] = [
    {
      model: beeld(som, 0, 0, 0),
      zin: `Twee stenen die al ingevuld zijn, staan ${sprong} uit elkaar. Dat is de sprong.`,
      houding: "wijzend",
      beweging: "wijzen",
      kant: "links",
    },
  ];

  for (let i = 1; i < r.length; i++) {
    stappen.push({
      model: beeld(som, i, i, i < r.length - 1 ? i : null),
      zin: sprongzin(r[i - 1], sprong, r[i], terug),
      houding: "wijzend",
      kant: i % 2 === 0 ? "links" : "rechts",
    });
  }

  stappen.push({
    model: beeld(som, r.length - 1, r.length - 1, null),
    zin: `De hele rij: ${r.join(" → ")}.`,
    feest: true,
    houding: "juichend",
    beweging: "juichen",
    kant: "rechts",
  });

  return { vorm, strategie: "sprong-doortellen", strategieNaam: "doortellen met sprongen", stappen };
}

// --- Groep 7-8 -------------------------------------------------------------

function lijst78(som: Somgegevens, vorm: Groepsvorm): Uitlegscript {
  const r = som.getallen;
  const sprong = sprongVan(som);
  const terug = som.variant === "terug";
  return {
    vorm,
    strategie: "sprong-doortellen",
    strategieNaam: "doortellen met sprongen",
    stappen: [
      {
        model: { soort: "som", tekst: `${r[0]} → ${r[1]}`, nadruk: String(sprong) },
        zin: "Lees de sprong af uit twee stenen die al ingevuld zijn.",
      },
      {
        model: { soort: "som", tekst: `${terug ? "−" : "+"} ${sprong} per steen` },
        zin: terug
          ? "De rij loopt terug, dus haal de sprong er elke steen af."
          : "De rij loopt vooruit, dus doe de sprong er elke steen bij.",
      },
      {
        model: { soort: "som", tekst: r.join(" · "), nadruk: r.join(" · ") },
        zin: "Loop de rij van links naar rechts na; let op waar je over een tiental gaat.",
      },
    ],
  };
}

export const stapstenenUitleg: Uitlegbron = {
  modellen: ["stapstenen", "som"],
  strategieen: [
    {
      waarde: "sprong-doortellen",
      label: "Doortellen met sprongen",
      uitleg:
        "Lees de sprong af uit twee stenen die al ingevuld zijn, en tel daarmee van links naar rechts door.",
    },
  ],
  standaardStrategie: () => "sprong-doortellen",

  script: (som, vorm: Groepsvorm) => {
    if (som.getallen.length < 2) return null;

    const manier = MANIER_VAN_VORM[vorm];
    if (manier === "34") return sprongen34(som, vorm);
    if (manier === "56") return sprongen56(som, vorm);
    return lijst78(som, vorm);
  },

  vergelijkbaar: (som) => {
    const sprong = sprongVan(som);
    if (som.getallen.length < 2) return null;
    /* Dezelfde rij, één sprong verder begonnen: zelfde soort vraag, ander antwoord. */
    const nieuw = som.getallen.map((n) => n + (som.variant === "terug" ? -sprong : sprong));
    if (nieuw.some((n) => n < 0)) return null;
    const lege = legePlekken(som);
    return { ...som, getallen: nieuw, goed: nieuw[lege[0] ?? 0] };
  },
};
