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

export const straatPatronen: Foutpatroon[] = [
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
