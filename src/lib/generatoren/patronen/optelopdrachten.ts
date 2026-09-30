/**
 * Foutpatronen bij de opdrachten van het domein Optellen.
 *
 * De negen opdrachtsoorten vragen allemaal dezelfde denkstap — twee getallen
 * bij elkaar — en de fouten die een kind daarbij maakt zijn ook dezelfde. Ze
 * staan hier één keer.
 *
 * De somgegevens zijn overal gelijk opgebouwd: `getallen[0]` en `getallen[1]`
 * zijn de twee getallen waar het om gaat, en `goed` is wat er gevraagd wordt.
 */

import type { Foutpatroon } from "@/lib/generatoren/foutpatroon";

export const optelPatronen: Foutpatroon[] = [
  {
    id: "afgetrokken",
    naam: "Afgetrokken in plaats van opgeteld",
    herkent: (som, gegeven) =>
      som.getallen.length >= 2 && gegeven === Math.abs(som.getallen[0] - som.getallen[1]),
    kindtekst: {
      "34": "Ik denk dat je de getallen van elkaar af hebt gehaald.",
      "56": "Je hebt afgetrokken. Bij een plussom komen de twee getallen juist bij elkaar.",
      "78": "Je hebt het verschil uitgerekend in plaats van de som. Bij optellen wordt het antwoord groter dan allebei de getallen.",
    },
    hint: "Bij plus wordt het samen méér.",
    uitleg: (som) => {
      const [a, b] = som.getallen;
      return [
        { tekst: "Deze twee horen bij elkaar.", som: `${a} en ${b}` },
        { tekst: "Samen is dat:", som: `${a} + ${b} = ${a + b}` },
      ];
    },
    ouder: {
      uitleg: "Er is afgetrokken in plaats van opgeteld; bij plus wordt het antwoord juist groter.",
      zinnen: [
        "Begin bij het grootste getal en tel het andere erbij op.",
        "Leg het met blokjes of vingers neer: eerst de ene stapel, dan de andere erbij.",
      ],
      schoolwoord: "optellen",
    },
  },
  {
    id: "eentje-ernaast",
    naam: "Eén te veel of te weinig",
    herkent: (som, gegeven) =>
      Number.isFinite(gegeven) && gegeven !== som.goed && Math.abs(gegeven - som.goed) === 1,
    kindtekst: {
      "34": "Je zit er eentje naast. Tel nog eens rustig.",
      "56": "Je zit er één naast. Dat gebeurt makkelijk bij doortellen; tel het eerste getal niet mee.",
      "78": "Je antwoord zit er één naast. Waarschijnlijk is het startgetal meegeteld; begin met doortellen bij het getal daarna.",
    },
    hint: "Tel vanaf het grootste getal verder, en tel dat zelf niet mee.",
    uitleg: (som) => {
      const [a, b] = som.getallen;
      const groot = Math.max(a, b);
      const klein = Math.min(a, b);
      return [
        { tekst: "Begin bij het grootste getal.", som: String(groot) },
        { tekst: "Tel de rest erbij.", som: `${groot} + ${klein}` },
        { tekst: "Samen:", som: String(a + b) },
      ];
    },
    ouder: {
      uitleg: "Het antwoord zit er één naast — meestal doordat het startgetal wordt meegeteld.",
      zinnen: [
        "Begin bij het grootste getal en tel dat zelf niet mee.",
        "Tel samen hardop door: zeven… acht, negen, tien.",
      ],
      schoolwoord: "doortellen",
    },
  },
  {
    id: "aan-elkaar-geplakt",
    naam: "De twee getallen achter elkaar gezet",
    herkent: (som, gegeven) => {
      if (som.getallen.length < 2) return false;
      const plak = Number(`${som.getallen[0]}${som.getallen[1]}`);
      return Number.isFinite(plak) && gegeven === plak;
    },
    kindtekst: {
      "34": "Je hebt de twee getallen achter elkaar gezet.",
      "56": "Je hebt de cijfers achter elkaar gezet. Bij optellen tel je ze bij elkaar op.",
      "78": "Je hebt de twee getallen aan elkaar geschreven in plaats van opgeteld; de uitkomst blijft onder de twintig.",
    },
    hint: "Tel de twee getallen bij elkaar op, zet ze niet naast elkaar.",
    uitleg: (som) => {
      const [a, b] = som.getallen;
      return [
        { tekst: "Niet achter elkaar zetten.", som: `${a} ${b}` },
        { tekst: "Maar bij elkaar optellen:", som: `${a} + ${b} = ${a + b}` },
      ];
    },
    ouder: {
      uitleg: "De twee getallen zijn achter elkaar geschreven in plaats van opgeteld.",
      zinnen: ["Wat krijg je als je ze samen neerlegt?", "Tel maar met blokjes: hoeveel zijn het er samen?"],
      schoolwoord: "optellen",
    },
  },
];
