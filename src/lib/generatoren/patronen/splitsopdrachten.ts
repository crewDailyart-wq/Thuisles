/**
 * Foutpatronen bij de opdrachten van het domein Splitsen.
 *
 * De vijf opdrachtsoorten — tabel, aanvullen, schema, verdelen en driehoek —
 * vragen dezelfde denkstap: twee delen zijn samen het hele getal. De fouten die
 * een kind maakt zijn daarom ook dezelfde, en ze staan hier één keer.
 *
 * De somgegevens zijn bij alle vijf gelijk opgebouwd: `getallen[0]` is het hele
 * getal, `getallen[1]` het deel dat al gegeven is, en `goed` is het getal dat
 * gevraagd wordt. Staan er meer vakjes leeg, dan gaat het hier over het eerste.
 */

import type { Foutpatroon } from "@/lib/generatoren/foutpatroon";

export const splitsopdrachtPatronen: Foutpatroon[] = [
  {
    id: "opgeteld",
    naam: "Opgeteld in plaats van aangevuld",
    herkent: (som, gegeven) =>
      som.getallen.length >= 2 && gegeven === som.getallen[0] + som.getallen[1],
    kindtekst: {
      "34": "Ik denk dat je de twee getallen bij elkaar hebt gedaan.",
      "56": "Je hebt opgeteld. De twee delen samen zijn juist het getal dat er al staat.",
      "78": "Je hebt de twee getallen opgeteld. De twee delen zijn samen het hele getal, dus het ontbrekende deel is het hele getal min het deel dat er al staat.",
    },
    hint: "De twee vakjes samen zijn het hele getal.",
    uitleg: (som) => {
      const [geheel, deel] = som.getallen;
      return [
        { tekst: "Dit is het hele getal.", som: String(geheel) },
        { tekst: "Dit deel heb je al.", som: String(deel) },
        { tekst: "Wat er nog bij moet:", som: `${geheel} − ${deel} = ${som.goed}` },
      ];
    },
    ouder: {
      uitleg:
        "De twee delen zijn samen het hele getal. Er is opgeteld in plaats van aangevuld tot dat getal.",
      zinnen: [
        "Hoeveel heb je al? En hoeveel moet er samen zijn?",
        "Tel maar hardop door tot je bij het hele getal bent.",
      ],
      schoolwoord: "splitsen",
    },
  },
  {
    id: "geheel-ingevuld",
    naam: "Het hele getal ingevuld",
    herkent: (som, gegeven) => gegeven === som.getallen[0] && gegeven !== som.goed,
    kindtekst: {
      "34": "Dat is het hele getal. In het vakje hoort een stukje.",
      "56": "Je hebt het hele getal ingevuld. In het lege vakje hoort maar een deel.",
      "78": "Je hebt het hele getal overgenomen. De twee delen samen zijn dat getal, dus elk deel is kleiner.",
    },
    hint: "Kijk eerst hoeveel er al gegeven is.",
    uitleg: (som) => {
      const [geheel, deel] = som.getallen;
      return [
        { tekst: "Zoveel moet het samen zijn.", som: String(geheel) },
        { tekst: "Zoveel staat er al.", som: String(deel) },
        { tekst: "Dus in het lege vakje:", som: `${geheel} − ${deel} = ${som.goed}` },
      ];
    },
    ouder: {
      uitleg: "Het hele getal is in het lege vakje gezet, in plaats van het ontbrekende deel.",
      zinnen: ["Wat staat er al? Hoeveel is er dan nog nodig?", "Leg het maar met blokjes neer."],
      schoolwoord: "splitsen",
    },
  },
  {
    id: "eentje-ernaast",
    naam: "Eén te veel of te weinig",
    herkent: (som, gegeven) =>
      Number.isFinite(gegeven) && Math.abs(gegeven - som.goed) === 1,
    kindtekst: {
      "34": "Je zit er eentje naast. Tel nog eens rustig.",
      "56": "Je zit er één naast. Dat gebeurt makkelijk bij doortellen; begin bij het getal dat er al staat.",
      "78": "Je antwoord zit er één naast. Waarschijnlijk is het startgetal meegeteld; tel het eerste getal niet mee als je doortelt.",
    },
    hint: "Tel vanaf het getal dat er staat, en tel dat zelf niet mee.",
    uitleg: (som) => {
      const [geheel, deel] = som.getallen;
      return [
        { tekst: "Begin bij dit getal.", som: String(deel) },
        { tekst: "Tel door tot het hele getal.", som: `${deel} → ${geheel}` },
        { tekst: "Zoveel kwam erbij:", som: String(som.goed) },
      ];
    },
    ouder: {
      uitleg:
        "Het antwoord zit er één naast. Bij doortellen wordt het startgetal vaak per ongeluk meegeteld.",
      zinnen: [
        "Begin bij het getal dat er staat en tel dat zelf niet mee.",
        "Doe het samen met blokjes; dan zie je precies hoeveel erbij komt.",
      ],
      schoolwoord: "aanvullen",
    },
  },
];
