/**
 * De denkfouten bij het vinden van een plek in het twintigveld.
 *
 * Vier stuks, en het zijn alle vier stoelen die er echt staan: elke stoel is
 * een knop, dus elk patroon is aan te tikken.
 *
 * Ze lopen op in ernst. De stoel ernaast is een klein misje. Vanaf één tellen
 * en de tel kwijtraken levert een grotere afwijking op. De verkeerde rij
 * betekent dat het kind de tienstructuur niet gebruikt. En 7 in plaats van 17
 * is de klassieker: het hoort het laatste stuk van het woord en pakt dat.
 */

import type { Foutpatroon, Somgegevens } from "@/lib/generatoren/foutpatroon";

const perRij = (som: Somgegevens) => som.extra?.perRij ?? 10;

export const bioscoopPatronen: Foutpatroon[] = [
  {
    id: "zonder-tien",
    naam: "Het tiental weggelaten",
    herkent: (som, gegeven) => som.goed > perRij(som) && gegeven === som.goed - perRij(som),
    kindtekst: {
      "34": "Dat is de stoel in de eerste rij.",
      "56": "Je koos zeventien's buurman: de zeven in de eerste rij. Kijk in welke rij je moet zijn.",
      "78": "Je hebt het tiental weggelaten: 7 in plaats van 17. De tweede rij begint bij elf.",
    },
    hint: "Zeventien zit in de tweede rij, niet in de eerste.",
    uitleg: (som) => {
      const n = perRij(som);
      return [
        { tekst: "De eerste rij loopt tot tien.", som: `${n}` },
        { tekst: "Daarna begint de tweede rij.", som: `${n + 1}` },
        { tekst: "Daar zit jouw stoel.", som: `${som.goed}` },
      ];
    },
    ouder: {
      uitleg:
        "Het kind hoort „zeventien” en pakt de zeven. Het laatste stuk van het telwoord is het opvallendst, en het tiental valt weg. Dat is normaal rond deze leeftijd en verdwijnt met het twintigveld.",
      zinnen: [
        "Zeg samen: zeventien is tien en nog zeven.",
        "Wijs in de tweede rij mee: elf, twaalf, dertien…",
      ],
      schoolwoord: "tienstructuur",
    },
  },
  {
    id: "ernaast",
    naam: "De stoel ernaast",
    herkent: (som, gegeven) => gegeven === som.goed - 1 || gegeven === som.goed + 1,
    kindtekst: {
      "34": "Eentje ernaast!",
      "56": "Je zit er eentje naast. Tel nog eens vanaf het dichtstbijzijnde nummer.",
      "78": "Je zit er één naast. Tel vanaf het dichtstbijzijnde zichtbare nummer verder, niet vanaf het begin.",
    },
    hint: "Begin bij een stoel met een nummer en tel van daaraf verder.",
    uitleg: (som) => [
      { tekst: "Zoek een stoel met een nummer.", som: "" },
      { tekst: "Tel van daaraf verder.", som: "" },
      { tekst: "Daar zit jouw stoel.", som: `${som.goed}` },
    ],
    ouder: {
      uitleg:
        "Eén stoel ernaast. Het kind telt goed, maar begint mee te tellen op de stoel waar het al staat — dan schuift alles één op.",
      zinnen: [
        "Tik samen op het bekende nummer en zeg: dit is nul stappen.",
        "Tel dan verder: de volgende stoel is één stap.",
      ],
      schoolwoord: "doortellen",
    },
  },
  {
    id: "verkeerde-rij",
    naam: "In de verkeerde rij gezocht",
    herkent: (som, gegeven) => {
      const n = perRij(som);
      const rijGoed = Math.ceil(som.goed / n);
      const rijGegeven = Math.ceil(gegeven / n);
      return (
        Number.isFinite(gegeven) &&
        gegeven >= 1 &&
        rijGegeven !== rijGoed &&
        gegeven % n === som.goed % n
      );
    },
    kindtekst: {
      "34": "Goede plek, verkeerde rij.",
      "56": "Je stoel staat op de goede plek, maar in de verkeerde rij.",
      "78": "De plek binnen de rij klopt, de rij zelf niet. Kijk eerst in welke rij het getal valt.",
    },
    hint: "Kijk eerst in welke rij je moet zijn, en zoek dan de plek.",
    uitleg: (som) => {
      const n = perRij(som);
      const rij = Math.ceil(som.goed / n);
      return [
        { tekst: "Kijk eerst welke rij.", som: `rij ${rij}` },
        { tekst: "Zoek daar de plek.", som: `${som.goed}` },
        { tekst: "Daar zit jouw stoel.", som: `${som.goed}` },
      ];
    },
    ouder: {
      uitleg:
        "Het kind telt de plek binnen de rij goed maar zit in de verkeerde rij. Het gebruikt het patroon van de eerste rij zonder het tiental mee te nemen.",
      zinnen: [
        "Vraag eerst: zit dit getal in de eerste of de tweede rij?",
        "Zeg samen: alles boven de tien zit in de tweede rij.",
      ],
      schoolwoord: "tienstructuur",
    },
  },
  {
    id: "de-tel-kwijt",
    naam: "Vanaf één geteld en de tel kwijtgeraakt",
    herkent: (som, gegeven) => {
      const verschil = Math.abs(gegeven - som.goed);
      return Number.isFinite(gegeven) && gegeven >= 1 && verschil >= 2 && verschil <= 4;
    },
    kindtekst: {
      "34": "Tel vanaf een nummer dat je ziet.",
      "56": "Je bent de tel kwijtgeraakt. Begin bij een stoel die al een nummer heeft.",
      "78": "Je telling loopt een paar stoelen mis. Tel niet vanaf één, maar vanaf het dichtstbijzijnde zichtbare nummer.",
    },
    hint: "Niet vanaf één tellen: begin bij het dichtstbijzijnde nummer.",
    uitleg: (som) => [
      { tekst: "Niet vanaf één tellen.", som: "" },
      { tekst: "Begin bij een nummer dat je ziet.", som: "" },
      { tekst: "Doe dan kleine stapjes.", som: `${som.goed}` },
    ],
    ouder: {
      uitleg:
        "Het kind telt vanaf de eerste stoel en raakt onderweg de tel kwijt. Dat is precies waarom er nummers bij de vijftallen staan: die zijn bedoeld als startpunt.",
      zinnen: [
        "Wijs samen het dichtstbijzijnde nummer aan en tel van daaraf verder.",
        "Zeg: vijftien, en dan nog twee — zestien, zeventien.",
      ],
      schoolwoord: "verkort tellen",
    },
  },
];
