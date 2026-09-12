/** Foutpatronen bij optellen. */

import {
  cijfersOmgedraaid,
  type Foutpatroon,
  type Somgegevens,
} from "@/lib/generatoren/foutpatroon";

/** Tot welk tiental moet je aanvullen? 48 -> 50 */
function volgendTiental(n: number): number {
  return Math.ceil((n + 1) / 10) * 10;
}

export const optellenPatronen: Foutpatroon[] = [
  {
    id: "tiental-vergeten",
    naam: "Tiental vergeten",
    herkent: (som, gegeven) => Math.abs(gegeven - som.goed) === 10,
    kindtekst: {
      "34": "Misschien ben je een tiental vergeten.",
      "56": "Het lijkt erop dat je een tiental bent vergeten mee te tellen.",
      "78": "Je zit precies tien ernaast. Waarschijnlijk is er bij het overschrijden van het tiental één tiental blijven liggen.",
    },
    hint: "Maak eerst het tiental vol, en tel dan de rest erbij.",
    uitleg: (som) => {
      const [a, b] = som.getallen;
      const naarTiental = volgendTiental(a) - a;
      const rest = b - naarTiental;
      return [
        { tekst: "Begin bij het eerste getal.", som: `${a}` },
        { tekst: "Maak eerst het tiental vol.", som: `${a} + ${naarTiental} = ${a + naarTiental}` },
        { tekst: "Tel daarna de rest erbij.", som: `${a + naarTiental} + ${rest} = ${som.goed}` },
      ];
    },
    ouder: {
      uitleg:
        "Bij optelsommen die over een tiental heen gaan, blijft er soms één tiental liggen. Het antwoord zit dan precies tien ernaast.",
      zinnen: [
        "Zullen we samen eerst het tiental vol maken?",
        "Hoeveel moet erbij om bij de volgende tien te komen?",
        "En hoeveel houd je dan nog over om erbij te tellen?",
      ],
      schoolwoord: "tiental",
    },
  },
  {
    id: "telfout",
    naam: "Eén ernaast",
    herkent: (som, gegeven) => Math.abs(gegeven - som.goed) === 1,
    kindtekst: {
      "34": "Je zit er maar eentje naast. Bijna goed!",
      "56": "Je zit er één naast. Misschien is er bij het tellen eentje overgeslagen.",
      "78": "Je zit er precies één naast. Dat komt vaak door één stap te veel of te weinig te tellen.",
    },
    hint: "Tel nog een keer rustig na, en let op waar je begint.",
    uitleg: (som) => [
      { tekst: "Reken de som nog eens na.", som: som.getallen.join(" + ") },
      { tekst: "Het goede antwoord is:", som: String(som.goed) },
    ],
    ouder: {
      uitleg:
        "Het antwoord zit één ernaast. Meestal is er bij het tellen één stap te veel of te weinig gedaan.",
      zinnen: [
        "Zullen we samen hardop meetellen?",
        "Waar begon je met tellen?",
      ],
      schoolwoord: "doortellen",
    },
  },
  {
    id: "cijfers-omgedraaid",
    naam: "Cijfers omgedraaid",
    herkent: (som, gegeven) => cijfersOmgedraaid(som.goed) === gegeven,
    kindtekst: {
      "34": "Misschien staan de cijfers omgedraaid.",
      "56": "Het lijkt erop dat je de cijfers hebt omgedraaid.",
      "78": "Je hebt de cijfers omgedraaid. Let op welk cijfer de tientallen zijn en welk de eenheden.",
    },
    hint: "Kijk goed welk cijfer voor de tientallen staat en welk voor de eenheden.",
    uitleg: (som) => [
      { tekst: "Het goede antwoord is:", som: String(som.goed) },
      {
        tekst: "Dat zijn de tientallen en de eenheden:",
        som: `${Math.floor(som.goed / 10)} tientallen en ${som.goed % 10} eenheden`,
      },
    ],
    ouder: {
      uitleg:
        "De cijfers van het antwoord staan omgedraaid, bijvoorbeeld 61 in plaats van 16. Het rekenen ging goed; het opschrijven niet.",
      zinnen: [
        "Welk cijfer zijn de tientallen en welk de eenheden?",
        "Zeg het getal eens hardop: zestien of eenenzestig?",
      ],
      schoolwoord: "tientallen en eenheden",
    },
  },
  {
    id: "afgetrokken",
    naam: "Afgetrokken in plaats van opgeteld",
    herkent: (som: Somgegevens, gegeven) => {
      if (som.getallen.length < 2) return false;
      const verschil = Math.abs(som.getallen[0] - som.getallen[1]);
      return gegeven === verschil && verschil !== som.goed;
    },
    kindtekst: {
      "34": "Ik denk dat je hebt afgetrokken. Hier moet je erbij doen.",
      "56": "Het lijkt erop dat je hebt afgetrokken. Bij een plus doe je erbij.",
      "78": "Je hebt de getallen van elkaar afgehaald. Het plusteken betekent dat de getallen bij elkaar komen.",
    },
    hint: "Let op het teken: een plus betekent erbij.",
    uitleg: (som) => [
      { tekst: "Bij een plus komen de getallen bij elkaar.", som: som.getallen.join(" + ") },
      { tekst: "Samen is dat:", som: String(som.goed) },
    ],
    ouder: {
      uitleg: "Het antwoord past bij aftrekken in plaats van optellen. Het rekenteken is over het hoofd gezien.",
      zinnen: [
        "Wat staat er tussen de getallen: een plus of een min?",
        "Wordt het antwoord dan groter of kleiner?",
      ],
      schoolwoord: "optellen",
    },
  },
];
