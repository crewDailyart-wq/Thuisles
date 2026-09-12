/** Foutpatronen bij splitsen. */

import { cijfersOmgedraaid, type Foutpatroon } from "@/lib/generatoren/foutpatroon";

/** getallen = [geheel, het gegeven deel]; goed = het ontbrekende deel. */
export const splitsenPatronen: Foutpatroon[] = [
  {
    id: "opgeteld",
    naam: "Delen opgeteld in plaats van afgehaald",
    herkent: (som, gegeven) =>
      som.getallen.length >= 2 && gegeven === som.getallen[0] + som.getallen[1],
    kindtekst: {
      "34": "Ik denk dat je de getallen bij elkaar hebt gedaan.",
      "56": "Het lijkt erop dat je hebt opgeteld. Bij splitsen haal je het deel juist eraf.",
      "78": "Je hebt de twee getallen opgeteld. Bij splitsen zijn de twee vakjes samen het hele getal, dus het ontbrekende deel is het hele getal min het deel dat er al staat.",
    },
    hint: "De twee vakjes samen zijn het hele getal bovenaan.",
    uitleg: (som) => {
      const [geheel, deel] = som.getallen;
      return [
        { tekst: "De twee vakjes samen zijn het hele getal.", som: `${geheel}` },
        { tekst: "Eén vakje is al ingevuld.", som: `${deel}` },
        { tekst: "Wat er nog bij moet:", som: `${geheel} − ${deel} = ${som.goed}` },
      ];
    },
    ouder: {
      uitleg:
        "Bij splitsen zijn de twee delen samen het hele getal. Er is opgeteld in plaats van afgehaald.",
      zinnen: [
        "De twee vakjes samen zijn het getal bovenaan. Hoeveel moet er nog bij?",
        "Zullen we met blokjes of vingers samen tot dat getal komen?",
      ],
      schoolwoord: "splitsen",
    },
  },
  {
    id: "geheel-herhaald",
    naam: "Het hele getal ingevuld",
    herkent: (som, gegeven) => gegeven === som.getallen[0] && gegeven !== som.goed,
    kindtekst: {
      "34": "Dat is het hele getal. In het vakje hoort maar een stukje.",
      "56": "Je hebt het hele getal ingevuld. In het lege vakje hoort maar een deel.",
      "78": "Je hebt het getal van bovenaan ingevuld. De twee vakjes eronder zijn samen dat getal, dus elk vakje is kleiner.",
    },
    hint: "Kijk hoeveel er al in het andere vakje staat.",
    uitleg: (som) => {
      const [geheel, deel] = som.getallen;
      return [
        { tekst: "Bovenaan staat het hele getal.", som: `${geheel}` },
        { tekst: "Onderin staat al een deel.", som: `${deel}` },
        { tekst: "Er moet nog bij:", som: `${geheel} − ${deel} = ${som.goed}` },
      ];
    },
    ouder: {
      uitleg: "Het hele getal is in het lege vakje gezet, in plaats van het ontbrekende deel.",
      zinnen: ["Wat staat er al in het andere vakje?", "Hoeveel is er dan nog nodig?"],
      schoolwoord: "splitsen",
    },
  },
  {
    id: "telfout",
    naam: "Eén ernaast",
    herkent: (som, gegeven) => Math.abs(gegeven - som.goed) === 1,
    kindtekst: {
      "34": "Je zit er maar eentje naast. Bijna goed!",
      "56": "Je zit er één naast. Tel nog eens rustig na.",
      "78": "Je zit er precies één naast. Dat komt vaak door één stap te veel of te weinig te tellen.",
    },
    hint: "Tel vanaf het ingevulde vakje door tot het hele getal.",
    uitleg: (som) => {
      const [geheel, deel] = som.getallen;
      return [
        { tekst: "Tel door vanaf het ingevulde vakje.", som: `${deel} → ${geheel}` },
        { tekst: "Dat zijn er:", som: String(som.goed) },
      ];
    },
    ouder: {
      uitleg: "Het antwoord zit één ernaast, meestal door één stap te veel of te weinig te tellen.",
      zinnen: ["Zullen we samen doortellen?", "Bij welk getal begon je?"],
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
      "78": "Je hebt de cijfers omgedraaid. Let op welk cijfer de tientallen zijn.",
    },
    hint: "Kijk goed welk cijfer voor de tientallen staat.",
    uitleg: (som) => [
      { tekst: "Het goede antwoord is:", som: String(som.goed) },
      {
        tekst: "Dat zijn de tientallen en de eenheden:",
        som: `${Math.floor(som.goed / 10)} tientallen en ${som.goed % 10} eenheden`,
      },
    ],
    ouder: {
      uitleg: "De cijfers van het antwoord staan omgedraaid.",
      zinnen: ["Welk cijfer zijn de tientallen?", "Zeg het getal eens hardop."],
      schoolwoord: "tientallen en eenheden",
    },
  },
];
