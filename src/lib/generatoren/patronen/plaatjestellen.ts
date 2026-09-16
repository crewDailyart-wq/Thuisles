/**
 * De denkfouten bij het tellen van plaatjes.
 *
 * Vier stuks, en ze komen alle vier ook echt als keuze op het scherm — zie
 * `keuzes` in `plaatjestellen.ts`. Een patroon dat nooit aan te klikken is,
 * zou nooit afgaan.
 *
 * De volgorde telt: specifieke patronen eerst. De structuurfout — een heel
 * groepje overgeslagen of dubbel geteld — staat daarom bovenaan. Bij rijen van
 * twee zou die namelijk samenvallen met "eentje te veel", en dan is de uitleg
 * over het kwijtraken van een rij de nuttigere van de twee.
 */

import type { Foutpatroon, Somgegevens } from "@/lib/generatoren/foutpatroon";

const aantalVan = (som: Somgegevens) => som.goed;
const groepVan = (som: Somgegevens) => som.extra?.groep ?? 2;
const perRijVan = (som: Somgegevens) => som.extra?.perRij ?? 0;
const inRijen = (som: Somgegevens) => perRijVan(som) >= 2;

/** Het woord voor wat er op een rij staat, of losjes verspreid ligt. */
function groepswoord(som: Somgegevens): string {
  return inRijen(som) ? "rij" : "groepje";
}

export const plaatjestellenPatronen: Foutpatroon[] = [
  {
    id: "groepje-overgeslagen",
    naam: "Een heel groepje overgeslagen",
    herkent: (som, gegeven) => gegeven === aantalVan(som) - groepVan(som),
    kindtekst: {
      "34": "Je bent een rijtje vergeten.",
      "56": "Je hebt een heel groepje overgeslagen. Tel ze nog eens, op volgorde.",
      "78": "Je telling mist precies één groepje. Dat gebeurt als je niet meer weet welk deel je al had; ga daarom altijd dezelfde kant op.",
    },
    hint: "Wijs elk rijtje aan terwijl je telt, dan sla je er geen over.",
    uitleg: (som) => {
      const groep = groepVan(som);
      const w = groepswoord(som);
      return [
        { tekst: `Tel per ${w}.`, som: `${groep}` },
        {
          tekst: `Doe er elke ${w} ${groep} bij.`,
          som: `${groep} + ${groep} = ${groep * 2}`,
        },
        { tekst: "Sla er geen over. Tik ze aan terwijl je telt.", som: `${aantalVan(som)}` },
      ];
    },
    ouder: {
      uitleg:
        "Het antwoord is precies één groepje te laag. Het kind telt op zich goed, maar raakt kwijt welk deel het al had — een typisch overzichtsprobleem, geen telprobleem.",
      zinnen: [
        "Laat het kind elk rijtje aanwijzen of aantikken terwijl het telt.",
        "Tel samen hardop per rij: vijf, tien, vijftien.",
      ],
      schoolwoord: "gestructureerd tellen",
    },
  },
  {
    id: "groepje-dubbel",
    naam: "Een heel groepje dubbel geteld",
    herkent: (som, gegeven) => gegeven === aantalVan(som) + groepVan(som),
    kindtekst: {
      "34": "Je hebt een rijtje twee keer geteld.",
      "56": "Je hebt een heel groepje dubbel geteld. Begin opnieuw en tik ze aan.",
      "78": "Je telling heeft er precies één groepje te veel in. Dat komt doordat je een deel opnieuw begon te tellen; markeer wat je al gehad hebt.",
    },
    hint: "Tik elk plaatje aan als je het geteld hebt, dan tel je niets dubbel.",
    uitleg: (som) => {
      const groep = groepVan(som);
      const w = groepswoord(som);
      return [
        { tekst: `Elke ${w} tel je één keer.`, som: `${groep}` },
        { tekst: "Tik aan wat je al geteld hebt.", som: "" },
        { tekst: "Zo weet je waar je gebleven was.", som: `${aantalVan(som)}` },
      ];
    },
    ouder: {
      uitleg:
        "Het antwoord is precies één groepje te hoog: een deel is twee keer meegeteld. Het kind verliest het overzicht en begint ergens opnieuw, zonder te merken dat het dat stuk al had.",
      zinnen: [
        "Laat het kind aantikken wat het geteld heeft; dat maakt zichtbaar waar het was.",
        "Tel altijd dezelfde kant op, van linksboven naar rechtsonder.",
      ],
      schoolwoord: "gestructureerd tellen",
    },
  },
  {
    id: "een-te-weinig",
    naam: "Eentje te weinig geteld",
    herkent: (som, gegeven) => gegeven === aantalVan(som) - 1,
    kindtekst: {
      "34": "Bijna! Je hebt er eentje gemist.",
      "56": "Je telde er eentje te weinig. Kijk of je er echt geen hebt overgeslagen.",
      "78": "Je zit er één onder. Meestal is dat het laatste plaatje: het telwoord en het aanwijzen lopen dan niet meer gelijk.",
    },
    hint: "Tel nog eens, en tik elk plaatje aan terwijl je het telt.",
    uitleg: (som) => [
      { tekst: "Tel nog eens, rustig.", som: "" },
      { tekst: "Tik elk plaatje aan dat je telt.", som: "" },
      { tekst: "Het laatste telwoord is het antwoord.", som: `${aantalVan(som)}` },
    ],
    ouder: {
      uitleg:
        "Eén te weinig. Bijna altijd raakt het aanwijzen uit de pas met het hardop tellen — het kind zegt het volgende getal terwijl de vinger al verder is, of andersom.",
      zinnen: [
        "Laat het kind elk plaatje aanraken op het moment dat het het getal zegt.",
        "Vraag na afloop: welk getal zei je het laatst? Dat is het antwoord.",
      ],
      schoolwoord: "één-op-één-koppeling",
    },
  },
  {
    id: "een-te-veel",
    naam: "Eentje te veel geteld",
    herkent: (som, gegeven) => gegeven === aantalVan(som) + 1,
    kindtekst: {
      "34": "Bijna! Je telde er eentje te veel.",
      "56": "Je zit er eentje boven. Misschien heb je er één dubbel geteld.",
      "78": "Je zit er één boven. Vaak is er één plaatje twee keer meegeteld, of is het tellen al begonnen voordat de vinger er was.",
    },
    hint: "Tik elk plaatje aan als je het telt, dan zie je wat je al had.",
    uitleg: (som) => [
      { tekst: "Begin bij één, niet bij twee.", som: "1" },
      { tekst: "Elk plaatje telt één keer.", som: "" },
      { tekst: "Het laatste telwoord is het antwoord.", som: `${aantalVan(som)}` },
    ],
    ouder: {
      uitleg:
        "Eén te veel. Meestal is er één plaatje twee keer aangewezen, of begint het kind te tellen voordat het het eerste plaatje aanraakt.",
      zinnen: [
        "Tel samen en laat het kind bij elk plaatje even stilstaan.",
        "Laat het aantikken: wat al een vinkje heeft, tel je niet nog eens.",
      ],
      schoolwoord: "één-op-één-koppeling",
    },
  },
];
