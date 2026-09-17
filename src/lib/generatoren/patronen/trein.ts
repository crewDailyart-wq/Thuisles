/**
 * De denkfouten bij ordenen.
 *
 * Bij dit type bestaat één antwoord uit meerdere getallen — één per wagon —
 * dus de patronen lezen niet één getal maar de hele rij. Die staat in `extra`
 * als `gegeven0`, `gegeven1`, enzovoort; zie `metGegevenGetallen` in het
 * antwoordscherm. Dezelfde afspraak als bij "Tellen en slepen".
 *
 * Drie fouten, en het zijn er drie van heel verschillende aard: de volgorde
 * omdraaien is een misverstand over de vraag, twee buren verwisselen is een
 * slordigheidje, en sorteren op het eerste cijfer is een echt rekenmisverstand.
 */

import type { Foutpatroon, Somgegevens } from "@/lib/generatoren/foutpatroon";

/** Wat het kind heeft neergezet, in de volgorde van de wagons. */
function gegevenRij(som: Somgegevens): number[] {
  const extra = som.extra ?? {};
  const uit: number[] = [];
  for (let i = 0; extra[`gegeven${i}`] !== undefined; i++) uit.push(extra[`gegeven${i}`]);
  return uit;
}

/** De goede volgorde, zoals hij in de som is vastgelegd. */
function goedeRij(som: Somgegevens): number[] {
  const oplopend = [...som.getallen].sort((a, b) => a - b);
  return (som.extra?.aflopend ?? 0) === 1 ? oplopend.reverse() : oplopend;
}

const gelijk = (a: number[], b: number[]) =>
  a.length > 0 && a.length === b.length && a.every((w, i) => w === b[i]);

export const treinPatronen: Foutpatroon[] = [
  {
    id: "omgekeerd",
    naam: "De volgorde omgedraaid",
    herkent: (som) => gelijk(gegevenRij(som), [...goedeRij(som)].reverse()),
    kindtekst: {
      "34": "Je zette ze andersom.",
      "56": "Je volgorde klopt, maar hij staat omgekeerd. Kijk of het van laag naar hoog moet of andersom.",
      "78": "De rij is precies omgekeerd. Je hebt goed geordend, alleen de gevraagde richting gemist.",
    },
    hint: "Kijk of de trein van klein naar groot moet, of van groot naar klein.",
    uitleg: (som) => {
      const rij = goedeRij(som);
      return [
        { tekst: "Kijk welke kant op gevraagd wordt.", som: "" },
        { tekst: "Begin met deze.", som: `${rij[0]}` },
        { tekst: "En zo verder.", som: rij.join(" → ") },
      ];
    },
    ouder: {
      uitleg:
        "Het kind kan prima ordenen — het heeft alleen de richting omgedraaid. Meestal is het gewoon begonnen zonder de vraag helemaal te lezen.",
      zinnen: [
        "Lees samen hardop wat er gevraagd wordt vóór het eerste wagonnetje.",
        "Vraag: begint de trein met de kleinste of met de grootste?",
      ],
      schoolwoord: "ordenen",
    },
  },
  {
    id: "buren-gewisseld",
    naam: "Twee wagons verwisseld",
    herkent: (som) => {
      const gegeven = gegevenRij(som);
      const goed = goedeRij(som);
      if (gegeven.length !== goed.length || gegeven.length < 2) return false;
      const anders = gegeven.map((w, i) => (w === goed[i] ? -1 : i)).filter((i) => i >= 0);
      if (anders.length !== 2) return false;
      const [a, b] = anders;
      return gegeven[a] === goed[b] && gegeven[b] === goed[a];
    },
    kindtekst: {
      "34": "Twee wagons staan omgewisseld.",
      "56": "Bijna! Twee wagons staan op elkaars plek.",
      "78": "De rij klopt op twee wagons na: die staan verwisseld. Loop hem nog eens na van voor naar achter.",
    },
    hint: "Loop de trein na van voor naar achter en vergelijk elk tweetal.",
    uitleg: (som) => {
      const rij = goedeRij(som);
      return [
        { tekst: "Ga van voor naar achter.", som: "" },
        { tekst: "Elke wagon is groter dan de vorige.", som: rij.join(" → ") },
        { tekst: "Zo hoort hij te staan.", som: "" },
      ];
    },
    ouder: {
      uitleg:
        "Eén paar staat verwisseld. Het kind heeft geordend maar niet gecontroleerd; bij twee getallen die dicht bij elkaar liggen gaat dat snel mis.",
      zinnen: [
        "Laat het kind de rij hardop voorlezen als controle.",
        "Vraag bij elk tweetal: is deze groter dan die ervoor?",
      ],
      schoolwoord: "ordenen",
    },
  },
  {
    id: "eerste-cijfer",
    naam: "Gesorteerd op het eerste cijfer",
    herkent: (som) => {
      const gegeven = gegevenRij(som);
      const goed = goedeRij(som);
      if (gegeven.length !== goed.length || gelijk(gegeven, goed)) return false;
      const cijfer = (n: number) => Number(String(n)[0]);
      const aflopend = (som.extra?.aflopend ?? 0) === 1;
      const opCijfer = [...som.getallen].sort((a, b) =>
        aflopend ? cijfer(b) - cijfer(a) || b - a : cijfer(a) - cijfer(b) || a - b,
      );
      return gelijk(gegeven, opCijfer);
    },
    kindtekst: {
      "34": "Kijk naar het hele getal.",
      "56": "Je hebt op het eerste cijfer gesorteerd. Maar 9 is kleiner dan 12.",
      "78": "Je hebt de getallen als woorden gesorteerd, op het eerste cijfer. Een getal met twee cijfers is altijd groter dan een getal met één cijfer.",
    },
    hint: "Tel eerst de cijfers: twee cijfers is meer dan één cijfer.",
    uitleg: (som) => {
      const rij = goedeRij(som);
      return [
        { tekst: "Kijk hoeveel cijfers er staan.", som: "" },
        { tekst: "Twee cijfers is meer dan één.", som: "" },
        { tekst: "Zo hoort de trein.", som: rij.join(" → ") },
      ];
    },
    ouder: {
      uitleg:
        "Het kind sorteert van links naar rechts per cijfer, zoals woorden in een woordenboek. Bij 9 en 12 gaat dat mis. Het getal als geheel zien komt pas met het tientallig stelsel.",
      zinnen: [
        "Leg bij twee getallen blokjes of vingers neer; dan is te zien welke stapel hoger is.",
        "Zeg: twaalf is tien en nog twee, dus meer dan negen.",
      ],
      schoolwoord: "plaatswaarde",
    },
  },
];
