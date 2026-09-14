/**
 * Foutpatronen bij "Bus tellen (vijfstructuur)".
 *
 * getallen = [totaal aantal kinderen, aantal per raam]; goed = het totaal.
 *
 * De denkfouten hier gaan allemaal over hetzelfde: wél zien dat er groepjes
 * zijn, maar de sprong van "groepje" naar "aantal kinderen" nog niet maken.
 * Daarom staan ze op volgorde van hoe vaak ze voorkomen — het restje vergeten
 * is de meest gemaakte fout bij dit type.
 */

import type { Foutpatroon } from "@/lib/generatoren/foutpatroon";

/** De volle ramen en wat er in het laatste, half gevulde raam zit. */
function delen(som: { goed: number; getallen: number[] }) {
  const perGroep = som.getallen[1] || 5;
  const volleRamen = Math.floor(som.goed / perGroep);
  const rest = som.goed - volleRamen * perGroep;
  return { perGroep, volleRamen, rest };
}

/** "zit er 1 kind" of "zitten er 3 kinderen": het werkwoord buigt mee. */
function zittenEr(n: number): string {
  return n === 1 ? "zit er 1 kind" : `zitten er ${n} kinderen`;
}

export const busPatronen: Foutpatroon[] = [
  {
    id: "restje-vergeten",
    naam: "Alleen de volle ramen geteld",
    herkent: (som, gegeven) => {
      const { volleRamen, perGroep, rest } = delen(som);
      return rest > 0 && gegeven === volleRamen * perGroep;
    },
    kindtekst: {
      "34": "Je vergat het laatste raam. Kijk nog eens!",
      "56": "Je hebt de volle ramen goed geteld, maar in het laatste raam zitten er ook nog een paar.",
      "78": "Je bent gestopt na de volle ramen. Het laatste raam is niet vol, maar de kinderen die daar zitten tellen gewoon mee.",
    },
    hint: "In het laatste raam zitten er ook nog een paar.",
    uitleg: (som) => {
      const { perGroep, volleRamen, rest } = delen(som);
      return [
        {
          tekst: "De volle ramen samen.",
          som: `${volleRamen} × ${perGroep} = ${volleRamen * perGroep}`,
        },
        {
          tekst: "En dan het laatste raam erbij.",
          som: `${volleRamen * perGroep} + ${rest} = ${som.goed}`,
        },
      ];
    },
    ouder: {
      uitleg:
        "De volle ramen zijn geteld, maar het laatste raam met het restje is vergeten.",
      zinnen: [
        "Hoeveel ramen zitten er helemaal vol?",
        "En zitten er in het laatste raam ook nog kinderen?",
      ],
      schoolwoord: "vijfstructuur met een rest",
    },
  },
  {
    id: "ramen-geteld",
    naam: "De ramen geteld in plaats van de kinderen",
    herkent: (som, gegeven) => {
      const { perGroep, volleRamen, rest } = delen(som);
      const ramen = volleRamen + (rest > 0 ? 1 : 0);
      return gegeven === ramen && ramen !== som.goed && perGroep > 1;
    },
    kindtekst: {
      "34": "Dat zijn de ramen. Tel de kinderen!",
      "56": "Je hebt de ramen geteld. In elk raam zitten er meer dan één.",
      "78": "Je hebt het aantal ramen gegeven in plaats van het aantal kinderen. Elk vol raam telt voor de groepsgrootte.",
    },
    hint: "In één raam zit niet één kind, maar vijf.",
    uitleg: (som) => {
      const { perGroep, volleRamen, rest } = delen(som);
      return [
        { tekst: "Zoveel ramen zitten er vol.", som: String(volleRamen) },
        {
          tekst: "In elk raam zitten er zoveel.",
          som: `${volleRamen} × ${perGroep} = ${volleRamen * perGroep}`,
        },
        {
          tekst: rest > 0 ? "En het laatste raam erbij." : "Samen is dat:",
          som: rest > 0 ? `${volleRamen * perGroep} + ${rest} = ${som.goed}` : String(som.goed),
        },
      ];
    },
    ouder: {
      uitleg: "Het aantal ramen is gegeven in plaats van het aantal kinderen.",
      zinnen: ["Hoeveel kinderen zitten er in één raam?", "Hoeveel zijn dat er dan samen?"],
      schoolwoord: "groepjes van vijf",
    },
  },
  {
    id: "raam-te-veel",
    naam: "Een raam te veel of te weinig",
    herkent: (som, gegeven) => {
      const { perGroep } = delen(som);
      return Math.abs(gegeven - som.goed) === perGroep;
    },
    kindtekst: {
      "34": "Je telde een raam te veel of te weinig.",
      "56": "Je zit er precies één raam naast. Tel de ramen nog eens na.",
      "78": "Je zit er precies één groepsgrootte naast. Waarschijnlijk is er een raam dubbel geteld of juist overgeslagen.",
    },
    hint: "Tel de ramen met sprongen: 5, 10, 15…",
    uitleg: (som) => {
      const { perGroep, volleRamen, rest } = delen(som);
      const sprongen = Array.from({ length: volleRamen }, (_, i) => (i + 1) * perGroep).join(", ");
      return [
        { tekst: "Tel per raam mee.", som: sprongen || String(perGroep) },
        {
          tekst: rest > 0 ? "Daarna het restje erbij." : "Dat is samen:",
          som: rest > 0 ? `${volleRamen * perGroep} + ${rest} = ${som.goed}` : String(som.goed),
        },
      ];
    },
    ouder: {
      uitleg: "Er is een raam dubbel geteld of overgeslagen.",
      zinnen: ["Wijs elk raam aan en tel hardop: 5, 10, 15…", "Waar bleef je steken?"],
      schoolwoord: "vijfstructuur",
    },
  },
  {
    id: "een-ernaast",
    naam: "Eén ernaast geteld",
    herkent: (som, gegeven) => Math.abs(gegeven - som.goed) === 1,
    kindtekst: {
      "34": "Je zit er eentje naast. Bijna goed!",
      "56": "Je zit er één naast. Tel het laatste raam nog eens rustig na.",
      "78": "Je zit er precies één naast. Dat gebeurt meestal in het laatste raam, waar de plekken niet allemaal bezet zijn.",
    },
    hint: "Tel het laatste raam nog eens na: de lege plekken tellen niet mee.",
    uitleg: (som) => {
      const { perGroep, volleRamen, rest } = delen(som);
      return [
        {
          tekst: "De volle ramen zijn er zoveel.",
          som: `${volleRamen} × ${perGroep} = ${volleRamen * perGroep}`,
        },
        {
          tekst:
            rest > 0
              ? `In het laatste raam ${zittenEr(rest)}.`
              : "Alle ramen zitten helemaal vol.",
          som: String(som.goed),
        },
      ];
    },
    ouder: {
      uitleg:
        "Het antwoord zit één ernaast. Vaak wordt in het laatste raam een lege plek meegeteld, of juist een kind overgeslagen.",
      zinnen: [
        "Leg je vinger op elk kind in het laatste raam.",
        "Hoeveel plekken zijn daar leeg?",
      ],
      schoolwoord: "tellen",
    },
  },
];
