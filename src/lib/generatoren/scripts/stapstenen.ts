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
 * Twee stenen die het kind ook echt ingevuld ziet staan, zo dicht mogelijk bij
 * elkaar.
 *
 * De uitleg voor groep 5-6 en 7-8 begint met "lees de sprong af uit twee stenen
 * die al ingevuld zijn". Dat waren altijd de eerste twee van de rij, maar die
 * staan er niet altijd: bij "om en om" is de tweede steen juist leeg, en bij
 * "vooraan" en "willekeurig" kan dat ook. Liggen de twee gevonden stenen niet
 * naast elkaar, dan zit er een lege tussen en is het verschil een veelvoud van
 * de sprong; de zin zegt dat er dan bij.
 */
function ingevuldPaar(som: Somgegevens): { a: number; b: number } {
  const lege = legePlekken(som);
  const staan = som.getallen.map((_, i) => i).filter((i) => !lege.includes(i));
  let beste = { a: 0, b: Math.min(1, som.getallen.length - 1) };
  let afstand = Infinity;
  for (let k = 1; k < staan.length; k++) {
    const d = staan[k] - staan[k - 1];
    if (d < afstand) {
      afstand = d;
      beste = { a: staan[k - 1], b: staan[k] };
    }
  }
  return beste;
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

/**
 * Is de eerste steen leeg, en welke steen heeft dan het eerste getal?
 *
 * Levert `null` zolang de eerste steen gewoon een getal heeft; dan verandert er
 * hieronder niets en blijft de uitleg precies zoals hij was.
 */
function beginLeeg(som: Somgegevens): { eersteGevuld: number; stap: number } | null {
  const lege = legePlekken(som);
  if (!lege.includes(0)) return null;
  const eersteGevuld = som.getallen.findIndex((_, i) => i > 0 && !lege.includes(i));
  if (eersteGevuld < 1) return null;
  return { eersteGevuld, stap: eersteGevuld * sprongVan(som) };
}

/**
 * De twee stappen waarmee de uitleg begint als de eerste steen leeg is.
 *
 * Zonder deze stappen zou de uitleg bij de tweede steen beginnen en het eerste
 * antwoord overslaan: de lus hieronder loopt van links naar rechts en heeft
 * geen stap voor de steen waar hij vandaan komt. Hier staat Vos dus eerst op de
 * eerste steen mét een getal — nooit op een lege — en rekent van daar terug
 * naar het begin van de rij.
 *
 * Naar links toe draait de richting om: in een oplopende rij ga je terug, in
 * een aflopende rij juist omhoog.
 */
function terugNaarHetBegin(som: Somgegevens, kort: boolean): Uitlegscript["stappen"] {
  const begin = beginLeeg(som);
  if (!begin) return [];

  const r = som.getallen;
  const omhoog = r[0] > r[begin.eersteGevuld];

  return [
    {
      /* `tot` op -1: elke lege steen blijft leeg, dus precies wat het kind zag. */
      model: beeld(som, -1, begin.eersteGevuld, null),
      zin: kort
        ? "De eerste steen is leeg."
        : "De eerste steen is nog leeg. Vos begint bij de eerste steen met een getal.",
      houding: "wijzend",
      beweging: "wijzen",
      kant: "links",
    },
    {
      model: beeld(som, 0, 0, null),
      zin: omhoog
        ? `${r[begin.eersteGevuld]} en ${begin.stap} erbij is ${r[0]}.`
        : `${r[begin.eersteGevuld]} en ${begin.stap} terug is ${r[0]}.`,
      houding: "wijzend",
      kant: "links",
    },
  ];
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
  /* Vos staat nooit op een lege steen, ook niet in de allereerste stap. */
  const vosStart = beginLeeg(som)?.eersteGevuld ?? 0;

  const stappen: Uitlegscript["stappen"] = [
    {
      model: beeld(som, -1, vosStart, null),
      zin: "Kijk, we gaan springen.",
      houding: "blij",
      kant: "links",
    },
    /* Is de eerste steen leeg, dan eerst terugrekenen naar het begin. */
    ...terugNaarHetBegin(som, true),
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

  const { a, b } = ingevuldPaar(som);
  const verschil = Math.abs(r[b] - r[a]);

  const stappen: Uitlegscript["stappen"] = [
    ...terugNaarHetBegin(som, false),
    {
      model: beeld(som, 0, 0, 0),
      zin:
        b - a === 1
          ? `Twee stenen die al ingevuld zijn, staan ${sprong} uit elkaar. Dat is de sprong.`
          : `${r[a]} en ${r[b]} staan ${verschil} uit elkaar, met ${b - a - 1 === 1 ? "een lege steen" : `${b - a - 1} lege stenen`} ertussen. Elke sprong is dus ${sprong}.`,
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
  const { a, b } = ingevuldPaar(som);
  const naastElkaar = b - a === 1;
  const begin = beginLeeg(som);
  return {
    vorm,
    strategie: "sprong-doortellen",
    strategieNaam: "doortellen met sprongen",
    stappen: [
      {
        model: {
          soort: "som",
          tekst: naastElkaar
            ? `${r[a]} → ${r[b]}`
            : `${r[a]} → ${Array.from({ length: b - a - 1 }, () => "?").join(" → ")} → ${r[b]}`,
          nadruk: String(sprong),
        },
        zin: naastElkaar
          ? "Lees de sprong af uit twee stenen die al ingevuld zijn."
          : `Tussen twee ingevulde stenen ligt hier nog een lege steen: verdeel het verschil van ${Math.abs(r[b] - r[a])} over ${b - a} sprongen.`,
      },
      /*
        Staat de eerste steen niet ingevuld, dan is er niets om vanaf door te
        tellen; dan hoort de rij eerst naar links te worden afgemaakt. Die stap
        valt weg zodra de eerste steen wél een getal heeft.
      */
      ...(begin
        ? [
            {
              model: {
                soort: "som" as const,
                tekst: `${r[begin.eersteGevuld]} ${r[0] > r[begin.eersteGevuld] ? "+" : "−"} ${
                  begin.stap
                } = ${r[0]}`,
                nadruk: String(r[0]),
              },
              zin: "De eerste steen staat er niet bij: reken vanaf de eerste ingevulde steen terug naar het begin van de rij.",
            },
          ]
        : []),
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
