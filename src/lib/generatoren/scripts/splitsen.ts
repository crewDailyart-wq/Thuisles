/**
 * De uitleg-animaties bij splitsen.
 *
 * Groep 3-4: blokjes. Het kind ziet het hele getal, ziet het ene deel apart
 * gaan, en telt zelf de rest mee. Eén strategie tegelijk — nooit een mix.
 *
 * Groep 5-6 volgt hierna, met de splitsboom en de getallenlijn in plaats van
 * blokjes. Groep 7-8 krijgt de compacte stappenlijst.
 */

import type { Somgegevens } from "@/lib/generatoren/foutpatroon";
import { MANIER_VAN_VORM } from "@/lib/generatoren/uitlegscript";
import type {
  Bloktoestand,
  Groepsvorm,
  Uitlegbron,
  Uitlegscript,
} from "@/lib/generatoren/uitlegscript";

/** Bij grotere getallen tien op een rij, bij kleine vijf. */
function perRij(geheel: number): number {
  return geheel > 10 ? 10 : 5;
}

function rij(geheel: number, maak: (i: number) => Bloktoestand): Bloktoestand[] {
  return Array.from({ length: geheel }, (_, i) => maak(i));
}

/**
 * Strategie "eraf halen": je begint bij het hele getal en haalt het gegeven
 * deel eraf. Wat overblijft is het antwoord.
 */
function erafHalenMetBlokjes(geheel: number, deel: number, antwoord: number, vorm: Groepsvorm): Uitlegscript {
  const kolommen = perRij(geheel);

  return {
    vorm,
    strategie: "eraf-halen",
    strategieNaam: "eerst eraf halen",
    stappen: [
      {
        model: {
          soort: "blokjes",
          blokjes: rij(geheel, () => "normaal"),
          perRij: kolommen,
          bijschrift: String(geheel),
        },
        zin: `Hier zijn ${geheel} blokjes.`,
        houding: "blij",
        kant: "links",
      },
      {
        model: {
          soort: "blokjes",
          blokjes: rij(geheel, (i) => (i < deel ? "deel" : "normaal")),
          perRij: kolommen,
        },
        zin: `Deze ${deel} zijn één deel.`,
        houding: "wijzend",
        beweging: "wijzen",
        kant: "links",
      },
      {
        model: {
          soort: "blokjes",
          blokjes: rij(geheel, (i) => (i < deel ? "weg" : "normaal")),
          perRij: kolommen,
        },
        zin: "Die halen we eraf.",
        houding: "denkend",
        kant: "rechts",
      },
      {
        model: {
          soort: "blokjes",
          blokjes: rij(geheel, (i) => (i < deel ? "weg" : "rest")),
          perRij: kolommen,
        },
        zin: "Tel de rest maar mee.",
        meetellen: { aantal: antwoord, aansporing: "Tik de blokjes aan!" },
        houding: "wijzend",
        beweging: "wijzen",
        kant: "links",
      },
      {
        model: {
          soort: "blokjes",
          blokjes: rij(geheel, (i) => (i < deel ? "weg" : "geteld")),
          perRij: kolommen,
          bijschrift: String(antwoord),
        },
        zin: `Er blijven er ${antwoord} over.`,
        feest: true,
        houding: "juichend",
        beweging: "juichen",
        kant: "rechts",
      },
    ],
  };
}

/**
 * Strategie "aanvullen": je begint bij het gegeven deel en telt door tot het
 * hele getal. Wat je erbij doet is het antwoord.
 */
function aanvullenMetBlokjes(geheel: number, deel: number, antwoord: number, vorm: Groepsvorm): Uitlegscript {
  const kolommen = perRij(geheel);

  return {
    vorm,
    strategie: "aanvullen",
    strategieNaam: "aanvullen tot het geheel",
    stappen: [
      {
        model: {
          soort: "blokjes",
          blokjes: rij(deel, () => "deel"),
          perRij: kolommen,
          bijschrift: String(deel),
        },
        zin: `We beginnen met ${deel} blokjes.`,
        houding: "blij",
      },
      {
        model: {
          soort: "blokjes",
          blokjes: rij(geheel, (i) => (i < deel ? "deel" : "weg")),
          perRij: kolommen,
          bijschrift: String(geheel),
        },
        zin: `We willen er ${geheel} hebben.`,
        houding: "denkend",
      },
      {
        model: {
          soort: "blokjes",
          blokjes: rij(geheel, (i) => (i < deel ? "deel" : "rest")),
          perRij: kolommen,
        },
        zin: "Tel maar mee hoeveel erbij komt.",
        meetellen: { aantal: antwoord, aansporing: "Tik de blokjes aan!" },
        houding: "wijzend",
        beweging: "wijzen",
      },
      {
        model: {
          soort: "blokjes",
          blokjes: rij(geheel, (i) => (i < deel ? "deel" : "geteld")),
          perRij: kolommen,
          bijschrift: String(antwoord),
        },
        zin: `Er kwamen er ${antwoord} bij.`,
        feest: true,
        houding: "juichend",
        beweging: "juichen",
      },
    ],
  };
}

/** Groep 7-8: dezelfde weg, maar kort en zakelijk op één regel per stap. */
function compacteLijst(geheel: number, deel: number, antwoord: number, strategie: string, vorm: Groepsvorm): Uitlegscript {
  const erafHalen = strategie === "eraf-halen";

  return {
    vorm,
    strategie,
    strategieNaam: erafHalen ? "eerst eraf halen" : "aanvullen tot het geheel",
    stappen: erafHalen
      ? [
          { model: { soort: "som", tekst: `${geheel} = ${deel} + ?` }, zin: "Het hele getal bestaat uit twee delen." },
          { model: { soort: "som", tekst: `${geheel} − ${deel} = ${antwoord}` }, zin: "Haal het bekende deel eraf." },
          { model: { soort: "som", tekst: `${deel} + ${antwoord} = ${geheel}` }, zin: "Controleer: samen weer het hele getal.", feest: true },
        ]
      : [
          { model: { soort: "som", tekst: `${deel} + ? = ${geheel}` }, zin: "Begin bij het deel dat je al hebt." },
          { model: { soort: "som", tekst: `${deel} + ${antwoord} = ${geheel}` }, zin: `Vul aan tot ${geheel}.` },
          { model: { soort: "som", tekst: `${geheel} − ${deel} = ${antwoord}` }, zin: "Controleer met de aftreksom.", feest: true },
        ],
  };
}

export const splitsenUitleg: Uitlegbron = {
  modellen: ["blokjes", "splitsboom", "som"],
  strategieen: [
    {
      waarde: "eraf-halen",
      label: "Eraf halen",
      uitleg: "Begin bij het hele getal en haal het bekende deel eraf.",
    },
    {
      waarde: "aanvullen",
      label: "Aanvullen",
      uitleg: "Begin bij het bekende deel en tel door tot het hele getal.",
    },
  ],
  standaardStrategie: () => "eraf-halen",

  script(som: Somgegevens, vorm: Groepsvorm, strategie: string) {
    const [geheel, deel] = som.getallen;
    const antwoord = som.goed;
    if (!Number.isFinite(geheel) || !Number.isFinite(deel)) return null;

    /* De losse groep bepaalt welke manier van uitleggen erbij hoort. */
    const manier = MANIER_VAN_VORM[vorm];

    if (manier === "34") {
      // Bij hele grote getallen zijn losse blokjes niet meer te overzien.
      if (geheel > 30) return null;
      return strategie === "aanvullen"
        ? aanvullenMetBlokjes(geheel, deel, antwoord, vorm)
        : erafHalenMetBlokjes(geheel, deel, antwoord, vorm);
    }

    if (manier === "78") return compacteLijst(geheel, deel, antwoord, strategie, vorm);

    // Groep 5-6 volgt hierna.
    return null;
  },

  vergelijkbaar(som) {
    const [geheel, deel] = som.getallen;
    if (!Number.isFinite(geheel)) return null;

    // Een nieuwe som van dezelfde soort en grootte, maar met andere getallen.
    const kleinste = Math.max(1, Math.floor(geheel / 10));
    for (let poging = 0; poging < 40; poging++) {
      const nieuwGeheel = Math.max(3, geheel + (poging % 5) - 2);
      const nieuwDeel =
        kleinste + Math.floor(Math.random() * Math.max(1, nieuwGeheel - kleinste * 2 + 1));
      if (nieuwDeel === deel && nieuwGeheel === geheel) continue;
      if (nieuwDeel < 1 || nieuwDeel >= nieuwGeheel) continue;
      return {
        soort: "splitsen",
        variant: som.variant,
        getallen: [nieuwGeheel, nieuwDeel],
        goed: nieuwGeheel - nieuwDeel,
      };
    }
    return null;
  },
};
