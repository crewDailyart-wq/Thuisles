/**
 * De denkfouten bij vergelijken.
 *
 * Drie stuks, en het zijn alle drie keuzes die ook echt op het scherm zwemmen:
 * elke vis is een knop, dus elk patroon is aan te tikken.
 *
 * Ze gaan over drie verschillende dingen die misgaan bij vergelijken. Het
 * eerste is de vraag verkeerd lezen — grootste of kleinste. Het tweede is niet
 * kijken maar pakken wat het dichtst bij is. Het derde is het bekendste:
 * alleen naar het eerste cijfer kijken, waardoor 9 groter lijkt dan 12.
 */

import type { Foutpatroon, Somgegevens } from "@/lib/generatoren/foutpatroon";

const zoektGrootste = (som: Somgegevens) => (som.extra?.grootste ?? 1) === 1;
const andersom = (som: Somgegevens) => som.extra?.andersom ?? som.goed;
const dichtbij = (som: Somgegevens) => som.extra?.dichtbij ?? som.goed;
const eersteCijfer = (som: Somgegevens) => som.extra?.eersteCijfer ?? som.goed;

export const vissenPatronen: Foutpatroon[] = [
  {
    id: "andersom",
    naam: "De kleinste gekozen in plaats van de grootste",
    herkent: (som, gegeven) => gegeven === andersom(som) && gegeven !== som.goed,
    kindtekst: {
      "34": zinPerGroep("34"),
      "56": zinPerGroep("56"),
      "78": zinPerGroep("78"),
    },
    hint: "Lees nog eens of je de grootste of de kleinste moet vangen.",
    uitleg: (som) => [
      { tekst: zoektGrootste(som) ? "Je zoekt de grootste." : "Je zoekt de kleinste.", som: "" },
      { tekst: "Leg ze op volgorde.", som: "" },
      { tekst: "Deze moet je hebben.", som: `${som.goed}` },
    ],
    ouder: {
      uitleg:
        "Het kind kiest precies het andere uiterste: de kleinste waar de grootste gevraagd werd, of andersom. Het vergelijkt dus goed, maar heeft de vraag niet goed gelezen of onthouden.",
      zinnen: [
        "Zeg samen hardop wat er gezocht wordt vóór het kind kiest.",
        "Wijs de twee uitersten aan: welke is de grootste, welke de kleinste?",
      ],
      schoolwoord: "vergelijken",
    },
  },
  {
    id: "dichtbij",
    naam: "De dichtstbijzijnde vis gepakt",
    herkent: (som, gegeven) => gegeven === dichtbij(som) && gegeven !== som.goed,
    kindtekst: {
      "34": "Je pakte de vis die het dichtst bij was.",
      "56": "Je koos de vis die het dichtst bij Vos zwemt. Kijk eerst naar alle getallen.",
      "78": "Je hebt de dichtstbijzijnde gekozen in plaats van de gevraagde. Vergelijk eerst alle getallen met elkaar.",
    },
    hint: "Kijk eerst naar alle vissen, ook die verderop zwemmen.",
    uitleg: (som) => [
      { tekst: "Kijk eerst naar alle vissen.", som: "" },
      { tekst: "Lees elk getal hardop.", som: "" },
      { tekst: "Kies dan pas.", som: `${som.goed}` },
    ],
    ouder: {
      uitleg:
        "Het kind pakt wat het eerst ziet in plaats van te vergelijken. Dat is geen rekenprobleem maar een werkhoudingsprobleem: kiezen gaat sneller dan kijken.",
      zinnen: [
        "Laat het kind eerst alle getallen hardop lezen, en pas daarna kiezen.",
        "Vraag: heb je ze allemaal bekeken?",
      ],
      schoolwoord: "vergelijken",
    },
  },
  {
    id: "eerste-cijfer",
    naam: "Alleen naar het eerste cijfer gekeken",
    herkent: (som, gegeven) => gegeven === eersteCijfer(som) && gegeven !== som.goed,
    kindtekst: {
      "34": "Kijk naar het hele getal.",
      "56": "Je keek naar het eerste cijfer. Maar 9 is kleiner dan 12.",
      "78": "Je hebt de getallen op hun eerste cijfer vergeleken. Een getal met twee cijfers is altijd groter dan een getal met één cijfer.",
    },
    hint: "Tel eerst de cijfers: twee cijfers is meer dan één cijfer.",
    uitleg: (som) => [
      { tekst: "Kijk hoeveel cijfers er staan.", som: "" },
      { tekst: "Twee cijfers is meer dan één.", som: "" },
      { tekst: "Deze is het.", som: `${som.goed}` },
    ],
    ouder: {
      uitleg:
        "Het kind vergelijkt cijfer voor cijfer van links naar rechts, zoals bij woorden in een woordenboek. Bij 9 en 12 gaat dat mis: de 9 lijkt dan groter. Het getal als geheel zien komt pas met het tientallig stelsel.",
      zinnen: [
        "Leg samen blokjes of vingers neer bij beide getallen; dan is te zien welke stapel hoger is.",
        "Zeg: 12 is tien en nog twee, dus meer dan negen.",
      ],
      schoolwoord: "plaatswaarde",
    },
  },
];

/** De zin hangt af van wat er gevraagd werd, en dat weet alleen de som. */
function zinPerGroep(groep: "34" | "56" | "78"): string {
  if (groep === "34") return "Je zocht de andere.";
  if (groep === "56") return "Je koos precies de andere: kijk of je de grootste of de kleinste moet hebben.";
  return "Je hebt het andere uiterste gekozen. Lees terug wat er gevraagd wordt.";
}
