/**
 * Foutpatronen bij "Kralen tellen (hoeveelste kraal)".
 *
 * getallen = [totaal aantal kralen, groepsgrootte]; goed = de plek van de
 * kraal waar de pijl naar wijst. In `extra` staat hoeveel hele groepjes er
 * vóór die kraal liggen en hoeveel losse kralen er daarna nog bij komen.
 */

import type { Foutpatroon } from "@/lib/generatoren/foutpatroon";

/** Hele groepjes vóór de aangewezen kraal, en de rest erna. */
function delen(som: { goed: number; getallen: number[] }) {
  const perGroep = som.getallen[1] || 5;
  const heleGroepjes = Math.floor((som.goed - 1) / perGroep);
  const rest = som.goed - heleGroepjes * perGroep;
  return { perGroep, heleGroepjes, rest };
}

export const kralenPatronen: Foutpatroon[] = [
  {
    id: "een-ernaast",
    naam: "Eén ernaast geteld",
    herkent: (som, gegeven) => Math.abs(gegeven - som.goed) === 1,
    kindtekst: {
      "34": "Je zit er eentje naast. Bijna goed!",
      "56": "Je zit er één naast. Begin bij de eerste kraal met tellen: die is nummer 1.",
      "78": "Je zit er precies één naast. Dat komt meestal doordat de eerste kraal als 0 wordt geteld, of doordat de kraal van de pijl niet wordt meegeteld.",
    },
    hint: "De allereerste kraal links is nummer 1, niet nummer 0.",
    uitleg: (som) => {
      const { perGroep, heleGroepjes, rest } = delen(som);
      return [
        { tekst: "Tel eerst de hele groepjes.", som: `${heleGroepjes} × ${perGroep} = ${heleGroepjes * perGroep}` },
        { tekst: "Tel daarna de losse kralen erbij.", som: `${heleGroepjes * perGroep} + ${rest} = ${som.goed}` },
      ];
    },
    ouder: {
      uitleg:
        "Het antwoord zit één ernaast. Vaak wordt de eerste kraal als 0 geteld, of de aangewezen kraal zelf vergeten.",
      zinnen: [
        "Welke kraal is nummer 1? Wijs hem eens aan.",
        "Tel samen hardop mee tot je bij de pijl bent.",
      ],
      schoolwoord: "tellen",
    },
  },
  {
    id: "groepjes-geteld",
    naam: "Alleen de groepjes geteld",
    herkent: (som, gegeven) => {
      const { heleGroepjes, rest } = delen(som);
      return rest > 0 && gegeven === heleGroepjes;
    },
    kindtekst: {
      "34": "Je telde de groepjes. Tel de losse kralen er nog bij.",
      "56": "Je hebt geteld hoeveel groepjes er zijn. Elk groepje is er vijf, dus je moet nog verder.",
      "78": "Je hebt het aantal groepjes gegeven in plaats van het aantal kralen. Elk groepje telt voor de groepsgrootte, dus vermenigvuldig eerst en tel dan de losse kralen erbij.",
    },
    hint: "Eén groepje is niet één kraal, maar vijf.",
    uitleg: (som) => {
      const { perGroep, heleGroepjes, rest } = delen(som);
      return [
        { tekst: "Zoveel hele groepjes liggen er vóór de pijl.", som: String(heleGroepjes) },
        { tekst: "Elk groepje is er zoveel.", som: `${heleGroepjes} × ${perGroep} = ${heleGroepjes * perGroep}` },
        { tekst: "En dan de losse kralen erbij.", som: `${heleGroepjes * perGroep} + ${rest} = ${som.goed}` },
      ];
    },
    ouder: {
      uitleg: "Het aantal groepjes is gegeven in plaats van het aantal kralen.",
      zinnen: ["Hoeveel kralen zitten er in één groepje?", "Hoeveel zijn dat er dan samen?"],
      schoolwoord: "groepjes van vijf",
    },
  },
  {
    id: "groepje-te-veel",
    naam: "Een groepje te veel of te weinig",
    herkent: (som, gegeven) => {
      const { perGroep } = delen(som);
      return Math.abs(gegeven - som.goed) === perGroep;
    },
    kindtekst: {
      "34": "Je telde een groepje te veel of te weinig.",
      "56": "Je zit er precies één groepje naast. Tel de gekleurde groepjes nog eens na.",
      "78": "Je zit er precies één groepsgrootte naast. Waarschijnlijk is er een gekleurd groepje dubbel geteld of juist overgeslagen.",
    },
    hint: "Tel de gekleurde groepjes: 5, 10, 15…",
    uitleg: (som) => {
      const { perGroep, heleGroepjes, rest } = delen(som);
      const reeks = Array.from({ length: heleGroepjes }, (_, i) => (i + 1) * perGroep).join(", ");
      return [
        { tekst: "Tel per groepje mee.", som: reeks || String(perGroep) },
        { tekst: "Daarna de losse kralen erbij.", som: `${heleGroepjes * perGroep} + ${rest} = ${som.goed}` },
      ];
    },
    ouder: {
      uitleg: "Er is een gekleurd groepje dubbel geteld of overgeslagen.",
      zinnen: ["Wijs elk gekleurd groepje aan en tel hardop: 5, 10, 15…", "Waar bleef je steken?"],
      schoolwoord: "vijfstructuur",
    },
  },
  {
    id: "van-rechts-geteld",
    naam: "Vanaf de andere kant geteld",
    herkent: (som, gegeven) => {
      const totaal = som.getallen[0];
      return gegeven === totaal - som.goed + 1 && gegeven !== som.goed;
    },
    kindtekst: {
      "34": "Je telde vanaf de andere kant.",
      "56": "Je bent van rechts naar links geteld. Begin links, bij de eerste kraal.",
      "78": "Je hebt vanaf de rechterkant geteld. De vraag telt vanaf links: de kraal helemaal links is nummer 1.",
    },
    hint: "Begin bij de kraal helemaal links.",
    uitleg: (som) => [
      { tekst: "Begin links, bij kraal nummer 1." },
      { tekst: "Tel dan naar rechts tot de pijl.", som: String(som.goed) },
    ],
    ouder: {
      uitleg: "Er is vanaf rechts geteld in plaats van vanaf links.",
      zinnen: ["Waar begint het tellen?", "Leg je vinger op de eerste kraal links."],
      schoolwoord: "van links naar rechts tellen",
    },
  },
];
