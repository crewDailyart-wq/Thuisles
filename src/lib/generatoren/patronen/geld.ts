/**
 * Foutpatronen bij het domein Geld.
 *
 * Bij een getypt bedrag is aan het antwoord te zien wat er misging: een euro
 * ernaast, tien cent ernaast, de centen vergeten, of opgeteld waar er
 * afgetrokken moest worden. Een bedrag komt binnen als "euro's,centen", dus
 * staan de twee delen los in `extra.gegeven0` en `extra.gegeven1`; zie
 * `antwoordVan` in `lib/geld.ts`.
 *
 * Bij een keuze is dat niet te zien — "knop 3" zegt niets over een denkfout —
 * en dan valt het scherm terug op "zo los je het op" (`aanpak/geld.ts`).
 *
 * De generator zet `extra.bedrag = 1` bij elke opgave waar het antwoord één
 * getypt bedrag is. Alleen daar kijken de bedrag-patronen; bij drie vakjes
 * naast elkaar (schatten stap voor stap) zou "een euro ernaast" niets zeggen.
 */

import type { Foutpatroon, Somgegevens } from "@/lib/generatoren/foutpatroon";
import { bedrag } from "@/lib/geld";

/** Het getypte bedrag in centen, of null als het geen bedrag-opgave is. */
function getypt(som: Somgegevens): number | null {
  if (som.extra?.bedrag !== 1) return null;
  const euro = som.extra?.gegeven0;
  if (euro === undefined) return null;
  return euro * 100 + (som.extra?.gegeven1 ?? 0);
}

/** De soorten waar het antwoord een verschil is: wisselgeld, wat er overblijft. */
function isVerschil(som: Somgegevens): boolean {
  if (som.soort === "geldsom") return som.extra?.teken === -1;
  if (som.soort === "geldverhaal") return (som.extra?.stand ?? 0) !== 2;
  return som.soort === "geldontbreekt" || som.soort === "geldkorting";
}

export const geldPatronen: Foutpatroon[] = [
  {
    id: "opgeteld-in-plaats-van-eraf",
    naam: "Opgeteld in plaats van eraf gehaald",
    herkent: (som) => {
      const gaf = getypt(som);
      if (gaf === null || !isVerschil(som)) return false;
      return gaf === (som.getallen[0] ?? 0) + (som.getallen[1] ?? 0) && gaf !== som.goed;
    },
    kindtekst: {
      "34": "Hier haal je eraf. Niet erbij.",
      "56": "Je hebt de twee bedragen opgeteld. Hier moet het ene bedrag van het andere af.",
      "78": "Je hebt de bedragen bij elkaar opgeteld, maar gevraagd wordt het verschil: hoeveel er overblijft of terugkomt. Tel door van het kleine naar het grote bedrag.",
    },
    hint: "Wordt het meer of minder? Bij wisselgeld wordt het minder.",
    uitleg: (som) => [
      { tekst: "Het grote bedrag:", som: bedrag(Math.max(som.getallen[0] ?? 0, som.getallen[1] ?? 0)) },
      { tekst: "Haal het kleine eraf.", som: bedrag(som.goed) },
    ],
    ouder: {
      uitleg: "De bedragen zijn opgeteld, terwijl het verschil gevraagd werd.",
      zinnen: [
        "Speel winkeltje: geef wisselgeld terug door door te tellen vanaf de prijs.",
        "Vraag: krijg je meer of minder terug dan je gaf?",
      ],
      schoolwoord: "wisselgeld",
    },
  },
  {
    id: "centen-vergeten",
    naam: "De centen vergeten",
    herkent: (som) => {
      const gaf = getypt(som);
      if (gaf === null) return false;
      return Math.floor(gaf / 100) === Math.floor(som.goed / 100) && gaf % 100 === 0 && som.goed % 100 !== 0;
    },
    kindtekst: {
      "34": "De centen tellen ook mee.",
      "56": "De hele euro's kloppen, maar de centen ontbreken nog.",
      "78": "De euro's zijn goed; de centen zijn niet meegeteld. Tel eerst de briefjes en euromunten, en dan apart de centmunten.",
    },
    hint: "Tel eerst de euro's, dan de centen.",
    uitleg: (som) => [
      { tekst: "De hele euro's:", som: `${Math.floor(som.goed / 100)} euro` },
      { tekst: "En de centen:", som: `${som.goed % 100} cent` },
      { tekst: "Samen:", som: bedrag(som.goed) },
    ],
    ouder: {
      uitleg: "De euro's zijn goed geteld, maar de centen zijn vergeten.",
      zinnen: [
        "Leg de munten in twee hoopjes: euro's en centen. Tel ze apart.",
        "Schrijf het bedrag samen op met een komma ertussen.",
      ],
      schoolwoord: "geldbedrag",
    },
  },
  {
    id: "euro-ernaast",
    naam: "Eén euro ernaast",
    herkent: (som) => {
      const gaf = getypt(som);
      return gaf !== null && Math.abs(gaf - som.goed) === 100;
    },
    kindtekst: {
      "34": "Je zit er één euro naast.",
      "56": "Je zit er precies één euro naast. Tel de euro's nog eens rustig na.",
      "78": "Het antwoord ligt één euro naast het goede. Dat gebeurt vaak als je bij het doortellen een euro overslaat of dubbel telt.",
    },
    hint: "Tel de euro's één voor één, en wijs ze aan.",
    uitleg: (som) => [{ tekst: "Tel nog eens, euro voor euro.", som: bedrag(som.goed) }],
    ouder: {
      uitleg: "Het antwoord zit er één euro naast: ergens is een euro overgeslagen of dubbel geteld.",
      zinnen: ["Tel samen hardop, en wijs bij elke euro een munt aan.", "Leg de munten op een rij voordat je telt."],
      schoolwoord: "geld tellen",
    },
  },
  {
    id: "tien-cent-ernaast",
    naam: "Tien cent ernaast",
    herkent: (som) => {
      const gaf = getypt(som);
      return gaf !== null && Math.abs(gaf - som.goed) === 10;
    },
    kindtekst: {
      "34": "Je zit er tien cent naast.",
      "56": "Je zit er tien cent naast. Kijk nog eens goed naar de centen.",
      "78": "Het antwoord ligt tien cent naast het goede. Tel de centen nog eens in stappen van tien.",
    },
    hint: "Tel de centen in sprongen van tien: 10, 20, 30.",
    uitleg: (som) => [{ tekst: "Tel de centen nog eens.", som: bedrag(som.goed) }],
    ouder: {
      uitleg: "Het antwoord zit er tien cent naast.",
      zinnen: ["Tel samen munten van 10 cent: 10, 20, 30, ...", "Laat zien dat tien munten van 10 cent samen 1 euro zijn."],
      schoolwoord: "geld tellen",
    },
  },
  {
    id: "munten-geteld",
    naam: "De munten geteld in plaats van de euro's",
    herkent: (som, gegeven) => {
      if (som.soort === "muntenofeuros") {
        const munten = som.extra?.gegeven0;
        const euro = som.extra?.gegeven1;
        return euro !== undefined && munten !== undefined && euro === (som.getallen[1] ?? 0) && euro !== som.goed;
      }
      if (som.soort === "evenveel") {
        return Number.isFinite(gegeven) && gegeven === (som.getallen[0] ?? 0) && gegeven !== som.goed;
      }
      return false;
    },
    kindtekst: {
      "34": "Kijk wat er op de munt staat.",
      "56": "Je hebt de munten geteld. Kijk ook hoeveel elke munt waard is.",
      "78": "Het aantal munten is niet hetzelfde als het bedrag: een munt van 2 euro telt voor twee. Reken eerst uit hoeveel het samen waard is.",
    },
    hint: "Hoeveel is één munt waard?",
    uitleg: (som) => [{ tekst: "Kijk wat elke munt waard is.", som: String(som.goed) }],
    ouder: {
      uitleg: "Het aantal munten is genoemd in plaats van wat ze samen waard zijn.",
      zinnen: [
        "Leg twee munten van 2 euro neer: hoeveel munten? En hoeveel euro?",
        "Wissel samen: twee munten van 1 euro voor één van 2 euro.",
      ],
      schoolwoord: "waarde",
    },
  },
];
