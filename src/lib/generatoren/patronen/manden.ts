/**
 * De denkfouten bij het herkennen van een aantal.
 *
 * Vier stuks, en ze staan alle vier ook echt als mand op het scherm: elke mand
 * is een knop, dus elk patroon is aan te tikken.
 *
 * De eerste twee zijn telfouten aan het eind van de telling — er eentje te veel
 * of te weinig. De derde is een luisterfout: er werd één méér gevraagd, en het
 * kind pakt het getal dat het hoort. De vierde is de omkering: 12 en 21.
 */

import type { Foutpatroon, Somgegevens } from "@/lib/generatoren/foutpatroon";

const gezocht = (som: Somgegevens) => som.goed;
/** Welk getal er groot boven de manden staat. */
const opKaart = (som: Somgegevens) => som.extra?.kaart ?? som.goed;

export const mandenPatronen: Foutpatroon[] = [
  {
    id: "een-te-veel",
    naam: "De mand met eentje te veel",
    herkent: (som, gegeven) => gegeven === gezocht(som) + 1,
    kindtekst: {
      "34": "Eentje te veel.",
      "56": "In die mand zit er eentje te veel. Tel nog eens rustig na.",
      "78": "Die mand bevat er één meer dan gevraagd. Tel opnieuw en raak elk voorwerp één keer aan.",
    },
    hint: "Tel ze één voor één aan, en raak elk ding maar één keer aan.",
    uitleg: (som) => [
      { tekst: "Tel rustig na.", som: "" },
      { tekst: "Raak elk ding één keer aan.", som: "" },
      { tekst: "Je zoekt er zoveel.", som: `${gezocht(som)}` },
    ],
    ouder: {
      uitleg:
        "Eén te veel geteld. Meestal is er één voorwerp twee keer aangewezen, of begint het kind te tellen voordat de vinger er is.",
      zinnen: [
        "Tel samen hardop en laat het kind bij elk ding even stilstaan.",
        "Vraag na afloop: welk getal zei je het laatst?",
      ],
      schoolwoord: "één-op-één-koppeling",
    },
  },
  {
    id: "een-te-weinig",
    naam: "De mand met eentje te weinig",
    herkent: (som, gegeven) => gegeven === gezocht(som) - 1,
    kindtekst: {
      "34": "Eentje te weinig.",
      "56": "In die mand zit er eentje te weinig. Kijk of je er geen hebt overgeslagen.",
      "78": "Die mand bevat er één minder dan gevraagd. Meestal is het laatste voorwerp niet meegeteld.",
    },
    hint: "Tel nog eens, en vergeet het laatste ding niet.",
    uitleg: (som) => [
      { tekst: "Tel nog eens.", som: "" },
      { tekst: "Sla er geen over.", som: "" },
      { tekst: "Je zoekt er zoveel.", som: `${gezocht(som)}` },
    ],
    ouder: {
      uitleg:
        "Eén te weinig. Bijna altijd raakt het aanwijzen uit de pas met het hardop tellen — het kind zegt het volgende getal terwijl de vinger al verder is.",
      zinnen: [
        "Laat het kind elk ding aanraken op het moment dat het het getal zegt.",
        "Tel samen terug om te controleren.",
      ],
      schoolwoord: "één-op-één-koppeling",
    },
  },
  {
    id: "kaartgetal",
    naam: "Precies het getal van de kaart gepakt",
    herkent: (som, gegeven) => opKaart(som) !== gezocht(som) && gegeven === opKaart(som),
    kindtekst: {
      "34": "Er werd eentje meer of minder gevraagd.",
      "56": "Je pakte precies het getal dat er staat. Maar er werd eentje meer of minder gevraagd.",
      "78": "Je hebt het getal van de kaart genomen zonder de opdracht erbij: er werd één meer of één minder gevraagd.",
    },
    hint: "Lees nog eens of je er eentje meer of minder moet hebben.",
    uitleg: (som) => [
      { tekst: "Kijk wat er gevraagd wordt.", som: `${opKaart(som)}` },
      {
        tekst: gezocht(som) > opKaart(som) ? "Er moet eentje bij." : "Er moet eentje af.",
        som: `${gezocht(som)}`,
      },
      { tekst: "Zoek die mand.", som: `${gezocht(som)}` },
    ],
    ouder: {
      uitleg:
        "Het kind ziet het getal en zoekt dat aantal, zonder de opdracht „eentje meer” mee te nemen. Het telt dus goed maar leest de vraag niet af.",
      zinnen: [
        "Lees samen hardop: zoveel, en dan nog eentje erbij.",
        "Laat het kind eerst zeggen welk getal het zoekt, vóór het kijkt.",
      ],
      schoolwoord: "één meer, één minder",
    },
  },
  {
    id: "omgedraaid",
    naam: "De cijfers omgedraaid",
    herkent: (som, gegeven) => {
      const g = gezocht(som);
      if (g < 10) return false;
      const om = (g % 10) * 10 + Math.floor(g / 10);
      return om !== g && gegeven === om;
    },
    kindtekst: {
      "34": "Je hebt de getallen omgedraaid.",
      "56": "Je hebt de cijfers verwisseld: 12 is niet hetzelfde als 21.",
      "78": "Je hebt de cijfers omgedraaid. Het eerste cijfer zegt hoeveel tientallen, het tweede hoeveel eenheden.",
    },
    hint: "Lees het getal hardop voordat je kiest.",
    uitleg: (som) => [
      { tekst: "Lees het getal hardop.", som: `${gezocht(som)}` },
      { tekst: "Tel dan pas.", som: "" },
      { tekst: "Zoek die mand.", som: `${gezocht(som)}` },
    ],
    ouder: {
      uitleg:
        "Het kind leest de cijfers in de verkeerde volgorde. In het Nederlands helpt de taal niet mee: we zeggen „vierentwintig”, dus de vier eerst, terwijl je 24 schrijft.",
      zinnen: [
        "Zeg het getal samen hardop en wijs de cijfers aan.",
        "Leg blokjes: eerst de tientallen, dan de losse.",
      ],
      schoolwoord: "plaatswaarde",
    },
  },
];
