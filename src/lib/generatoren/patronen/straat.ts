/**
 * De denkfouten bij buurgetallen.
 *
 * Vier stuks, en ze komen alle vier ook echt als keuze op het scherm — zie
 * `keuzes` in `straat.ts`. Een patroon dat nooit aan te klikken is, zou nooit
 * afgaan.
 *
 * Ze gaan allemaal over hetzelfde: weten wat "naast" betekent in een rij
 * getallen. Dat is bij jonge kinderen geen rekenwerk maar richtingwerk — ze
 * kennen de telrij wel, maar raken kwijt welke kant ze op moeten.
 */

import type { Foutpatroon, Somgegevens } from "@/lib/generatoren/foutpatroon";

const basisVan = (som: Somgegevens) => som.extra?.basis ?? som.goed;
const stapVan = (som: Somgegevens) => som.extra?.stap ?? 1;
/** 1 = het huis erna, -1 = het huis ervoor. */
const kantVan = (som: Somgegevens) => (som.extra?.vooruit === 0 ? -1 : 1);
const isEven = (som: Somgegevens) => (som.extra?.even ?? 0) === 1;

/* Bij "allebei de buren": wat het kind links en rechts heeft ingevuld. */
const allebei = (som: Somgegevens) => (som.extra?.allebei ?? 0) === 1;
const linksVan = (som: Somgegevens) => som.extra?.links ?? 0;
const rechtsVan = (som: Somgegevens) => som.extra?.rechts ?? 0;
const gegevenLinks = (som: Somgegevens) => som.extra?.gegeven0;
const gegevenRechts = (som: Somgegevens) => som.extra?.gegeven1;

/**
 * De denkfouten bij "allebei de buren".
 *
 * Ze staan vooraan, want ze zijn scherper dan de patronen daaronder: die
 * kijken naar één getal, en hier zijn er twee. De volgorde onderling is niet
 * willekeurig — twee keer hetzelfde en omgedraaid zijn bijzondere gevallen van
 * "aan één kant de verkeerde kant op", dus die moeten er eerder uit.
 */
const allebeiPatronen: Foutpatroon[] = [
  {
    id: "allebei-zelfde",
    naam: "Twee keer hetzelfde getal",
    herkent: (som) =>
      allebei(som) &&
      gegevenLinks(som) !== undefined &&
      gegevenLinks(som) === gegevenRechts(som),
    kindtekst: {
      "34": "Links en rechts staat hetzelfde. Ze zijn allebei anders.",
      "56": "Je hebt twee keer hetzelfde nummer ingevuld. Het huis links en het huis rechts hebben elk een eigen nummer.",
      "78": "Beide buurgetallen zijn gelijk ingevuld. Het getal ervóór en het getal erná liggen aan weerskanten van het middelste getal en zijn dus nooit hetzelfde.",
    },
    hint: "Links wordt kleiner, rechts wordt groter.",
    uitleg: (som) => [
      { tekst: "In het midden staat dit.", som: `${som.extra?.basis ?? ""}` },
      { tekst: "Links ga je terug.", som: `${som.extra?.basis} − ${stapVan(som)} = ${linksVan(som)}` },
      { tekst: "Rechts ga je verder.", som: `${som.extra?.basis} + ${stapVan(som)} = ${rechtsVan(som)}` },
    ],
    ouder: {
      uitleg:
        "Het kind vult aan beide kanten hetzelfde in. Meestal is maar één kant echt uitgerekend en is de andere overgeschreven — het weet nog niet dat de twee buren aan weerskanten liggen.",
      zinnen: [
        "Leg drie vingers naast elkaar en noem het middelste getal.",
        "Vraag: welke komt daarvóór? En welke daarná?",
      ],
      schoolwoord: "buurgetallen",
    },
  },
  {
    id: "allebei-omgedraaid",
    naam: "De twee antwoorden omgedraaid",
    herkent: (som) =>
      allebei(som) &&
      gegevenLinks(som) === rechtsVan(som) &&
      gegevenRechts(som) === linksVan(som),
    kindtekst: {
      "34": "Je hebt ze omgedraaid. Het kleinste hoort links.",
      "56": "De twee nummers staan verwisseld. Links van het middelste huis staat het kleinere nummer.",
      "78": "Je hebt de goede getallen gevonden maar ze omgewisseld. Links ligt het kleinere buurgetal, rechts het grotere.",
    },
    hint: "Links is kleiner dan het middelste getal, rechts is groter.",
    uitleg: (som) => [
      { tekst: "Deze twee kloppen.", som: `${linksVan(som)} en ${rechtsVan(som)}` },
      { tekst: "Maar links hoort de kleinste.", som: `${linksVan(som)}` },
      { tekst: "En rechts de grootste.", som: `${rechtsVan(som)}` },
    ],
    ouder: {
      uitleg:
        "Het rekenen klopt; alleen de plek niet. Het kind weet welke twee getallen erbij horen, maar niet welke kant van de rij welke is.",
      zinnen: [
        "Loop samen de getallen op van klein naar groot.",
        "Vraag: welke kant gaat omhoog, links of rechts?",
      ],
      schoolwoord: "volgorde",
    },
  },
  {
    id: "allebei-eenkant",
    naam: "Aan één kant de verkeerde kant op",
    herkent: (som) => {
      if (!allebei(som)) return false;
      const l = gegevenLinks(som);
      const r = gegevenRechts(som);
      const basis = som.extra?.basis ?? 0;
      if (l === undefined || r === undefined) return false;
      /* De ene kant klopt, de andere ligt aan de verkeerde kant van het midden. */
      if (l === linksVan(som) && r < basis) return true;
      if (r === rechtsVan(som) && l > basis) return true;
      return false;
    },
    kindtekst: {
      "34": "Eén kant ging de verkeerde kant op.",
      "56": "Aan één kant ben je de verkeerde richting op gegaan. Links wordt kleiner, rechts wordt groter.",
      "78": "Eén van de twee ligt aan de verkeerde kant van het middelste getal. Controleer per kant of je moet optellen of aftrekken.",
    },
    hint: "Naar links tel je terug, naar rechts tel je verder.",
    uitleg: (som) => [
      { tekst: "In het midden staat dit.", som: `${som.extra?.basis ?? ""}` },
      { tekst: "Naar links: eraf.", som: `${som.extra?.basis} − ${stapVan(som)} = ${linksVan(som)}` },
      { tekst: "Naar rechts: erbij.", som: `${som.extra?.basis} + ${stapVan(som)} = ${rechtsVan(som)}` },
    ],
    ouder: {
      uitleg:
        "Eén kant gaat goed, de andere niet. Het kind past dezelfde bewerking twee keer toe in plaats van één keer aftrekken en één keer optellen.",
      zinnen: [
        "Wijs het middelste huis aan en loop met je vinger naar links.",
        "Vraag: worden de nummers dan groter of kleiner?",
      ],
      schoolwoord: "terugtellen",
    },
  },
  {
    id: "allebei-ernaast",
    naam: "Eentje te veel of te weinig",
    herkent: (som) => {
      if (!allebei(som)) return false;
      const l = gegevenLinks(som);
      const r = gegevenRechts(som);
      const mis = (gegeven: number | undefined, hoort: number) =>
        gegeven !== undefined && gegeven !== hoort && Math.abs(gegeven - hoort) <= 1;
      return mis(l, linksVan(som)) || mis(r, rechtsVan(som));
    },
    kindtekst: {
      "34": "Eentje zit er net naast.",
      "56": "Je zit er bij één van de twee eentje naast. Tel nog eens rustig vanaf het middelste nummer.",
      "78": "Eén van de buurgetallen ligt er precies één naast. Tel de sprong nog eens na vanaf het middelste getal.",
    },
    hint: "Tel vanaf het middelste huis, en let op hoe groot de sprong is.",
    uitleg: (som) => [
      { tekst: "Begin in het midden.", som: `${som.extra?.basis ?? ""}` },
      { tekst: "De sprong is zo groot.", som: `${stapVan(som)}` },
      { tekst: "Dus dit hoort er.", som: `${linksVan(som)} en ${rechtsVan(som)}` },
    ],
    ouder: {
      uitleg:
        "Het kind telt wel de goede kant op, maar één te ver of één te kort. Vaak wordt het middelste huis zelf meegeteld als eerste stap.",
      zinnen: [
        "Tel samen hardop: het middelste getal is nul stappen.",
        "Zet daarna één stap en kijk waar je uitkomt.",
      ],
      schoolwoord: "sprong",
    },
  },
];

export const straatPatronen: Foutpatroon[] = [
  ...allebeiPatronen,
  {
    id: "zelfde-getal",
    naam: "Het nummer van Vos zelf teruggegeven",
    herkent: (som, gegeven) => gegeven === basisVan(som),
    kindtekst: {
      "34": "Dat is het huis van Vos zelf.",
      "56": "Dat nummer staat al op de deur waar Vos voor staat. Je zoekt het buurhuis.",
      "78": "Je hebt het uitgangsgetal teruggegeven. Gevraagd is het buurgetal, dus één stap verder.",
    },
    hint: "Kijk naar het huis ernaast, niet naar het huis van Vos.",
    uitleg: (som) => {
      const basis = basisVan(som);
      const stap = stapVan(som);
      return [
        { tekst: "Vos staat hier.", som: `${basis}` },
        { tekst: "Ga één huis verder.", som: `${basis} → ${som.goed}` },
        { tekst: "Dat is het buurhuis.", som: `${som.goed}`, },
      ].concat(
        stap === 2
          ? [{ tekst: "Aan dezelfde kant sla je er steeds één over.", som: `+2` }]
          : [],
      );
    },
    ouder: {
      uitleg:
        "Het kind herhaalt het getal dat het ziet staan. Meestal is de vraag niet doorgekomen: het weet wel welk nummer er staat, maar niet dat er iets naast gevraagd wordt.",
      zinnen: [
        "Wijs samen het huis van Vos aan en daarna het huis ernaast.",
        "Vraag: welk nummer hoort bij dát huis?",
      ],
      schoolwoord: "buurgetal",
    },
  },
  {
    id: "verkeerde-kant",
    naam: "De verkeerde kant op",
    herkent: (som, gegeven) => gegeven === basisVan(som) - kantVan(som) * stapVan(som),
    kindtekst: {
      "34": "Je ging de verkeerde kant op.",
      "56": "Je bent de andere kant op gegaan. Kijk goed welk huis er gevraagd wordt.",
      "78": "Je hebt de goede stap gemaakt, maar de andere kant op. Let op of er naar het huis ervóór of erná wordt gevraagd.",
    },
    hint: "Kijk welke kant Vos op kijkt: naar links of naar rechts.",
    uitleg: (som) => {
      const basis = basisVan(som);
      return [
        { tekst: "Vos staat hier.", som: `${basis}` },
        {
          tekst: kantVan(som) === 1 ? "Je moet naar rechts." : "Je moet naar links.",
          som: kantVan(som) === 1 ? "→" : "←",
        },
        { tekst: "Daar staat dit nummer.", som: `${som.goed}` },
      ];
    },
    ouder: {
      uitleg:
        "Het kind telt goed, maar de andere kant op. Vooruit tellen gaat vanzelf; terugtellen is veel minder geoefend en komt er dan uit.",
      zinnen: [
        "Loop samen met je vinger over de rij: welke kant gaan we op?",
        "Zeg hardop: één erbij of één eraf?",
      ],
      schoolwoord: "richting in de telrij",
    },
  },
  {
    id: "overgeslagen",
    naam: "Een huis overgeslagen",
    herkent: (som, gegeven) => gegeven === basisVan(som) + kantVan(som) * stapVan(som) * 2,
    kindtekst: {
      "34": "Je sloeg een huis over.",
      "56": "Je bent één huis te ver gegaan. Het buurhuis staat er direct naast.",
      "78": "Je zit een stap te ver: dat is het huis ná het buurhuis.",
    },
    hint: "Het buurhuis staat er meteen naast, niet twee verder.",
    uitleg: (som) => {
      const basis = basisVan(som);
      return [
        { tekst: "Vos staat hier.", som: `${basis}` },
        { tekst: "Eén huis verder, niet twee.", som: `${basis} → ${som.goed}` },
        { tekst: "Dat is het buurhuis.", som: `${som.goed}` },
      ];
    },
    ouder: {
      uitleg:
        "Het antwoord ligt één huis te ver. Het kind telt de stap wel, maar begint bij het verkeerde huis mee te tellen — het telt het huis van Vos als eerste stap.",
      zinnen: [
        "Tik samen op het huis van Vos en zeg: dit is nul stappen.",
        "Tik dan op het volgende huis: dát is één stap.",
      ],
      schoolwoord: "doortellen",
    },
  },
  {
    id: "overkant",
    naam: "Het huis aan de overkant",
    herkent: (som, gegeven) => isEven(som) && gegeven === basisVan(som) + kantVan(som),
    kindtekst: {
      "34": "Dat huis staat aan de overkant.",
      "56": "Dat nummer staat aan de andere kant van de straat. Blijf aan dezelfde kant.",
      "78": "Je bent overgestoken: even nummers staan aan de ene kant, oneven aan de andere. Aan dezelfde kant ga je met twee tegelijk.",
    },
    hint: "Blijf aan dezelfde kant van de straat. Daar ga je met twee tegelijk.",
    uitleg: (som) => {
      const basis = basisVan(som);
      return [
        { tekst: "Deze kant is even.", som: `${basis}` },
        { tekst: "Aan dezelfde kant: twee erbij.", som: `${basis} + 2` },
        { tekst: "Dat is het buurhuis.", som: `${som.goed}` },
      ];
    },
    ouder: {
      uitleg:
        "Het kind pakt het eerstvolgende getal in plaats van het eerstvolgende húis aan dezelfde kant. In Nederland staan even en oneven nummers tegenover elkaar, dus het volgende huis aan dezelfde kant is er twee verder.",
      zinnen: [
        "Loop samen door jullie eigen straat en lees de nummers aan één kant hardop.",
        "Vraag: staan hier even of oneven nummers? En wat komt er dan na 12?",
      ],
      schoolwoord: "even en oneven",
    },
  },
];
