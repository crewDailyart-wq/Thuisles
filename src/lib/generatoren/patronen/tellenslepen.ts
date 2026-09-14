/**
 * Foutpatronen bij "Tellen en slepen".
 *
 * getallen = de juiste aantallen, in de volgorde van de afbeeldingen.
 *
 * Let op: het gegeven antwoord komt hier binnen als één getal, want zo werkt de
 * foutpatroon-laag. Bij dit type bestaat het antwoord uit meerdere getallen, en
 * die staan in `extra` onder `gegeven0`, `gegeven1`, enzovoort. Dat is de enige
 * manier om te kunnen zien of er twee verwisseld zijn.
 */

import type { Foutpatroon } from "@/lib/generatoren/foutpatroon";

/** Wat het kind per vakje heeft neergelegd, of een lege lijst. */
function gegevenLijst(som: { extra?: Record<string, number> }): number[] {
  const extra = som.extra ?? {};
  const uit: number[] = [];
  for (let i = 0; ; i++) {
    const w = extra[`gegeven${i}`];
    if (w === undefined) break;
    uit.push(w);
  }
  return uit;
}

export const tellenslepenPatronen: Foutpatroon[] = [
  {
    id: "verwisseld",
    naam: "Twee afbeeldingen verwisseld",
    herkent: (som) => {
      const gegeven = gegevenLijst(som);
      if (gegeven.length !== som.getallen.length) return false;
      const fout = gegeven.filter((w, i) => w !== som.getallen[i]);
      /* Precies twee mis, en het zijn elkaars getallen: dan is het verwisseld. */
      if (fout.length !== 2) return false;
      return [...fout].sort().join() === [...som.getallen].filter((w, i) => gegeven[i] !== w).sort().join();
    },
    kindtekst: {
      "34": "Je hebt er twee omgewisseld. Kijk nog eens!",
      "56": "De getallen kloppen, maar twee staan bij de verkeerde afbeelding.",
      "78": "Je hebt goed geteld, maar twee getallen staan onder de verkeerde afbeelding. Leg ze naast elkaar en vergelijk.",
    },
    hint: "Tel bij elke afbeelding opnieuw, van links naar rechts.",
    uitleg: (som) => [
      { tekst: "Tel bij elke afbeelding apart.", som: som.getallen.join(" · ") },
      { tekst: "Leg elk getal onder de afbeelding waar je het geteld hebt." },
    ],
    ouder: {
      uitleg: "De aantallen zijn goed geteld, maar bij de verkeerde afbeelding gelegd.",
      zinnen: ["Wijs de eerste afbeelding aan. Hoeveel tel je er?", "Welk getal hoort daar dan bij?"],
      schoolwoord: "koppelen",
    },
  },
  {
    id: "een-ernaast",
    naam: "Eén ernaast geteld",
    herkent: (som) => {
      const gegeven = gegevenLijst(som);
      if (gegeven.length !== som.getallen.length) return false;
      const afwijkingen = gegeven.map((w, i) => w - som.getallen[i]).filter((v) => v !== 0);
      return afwijkingen.length > 0 && afwijkingen.every((v) => Math.abs(v) === 1);
    },
    kindtekst: {
      "34": "Je zit er eentje naast. Tel nog eens rustig.",
      "56": "Je zit er bij minstens één afbeelding precies één naast.",
      "78": "Je zit er telkens één naast. Dat komt meestal doordat er één wordt overgeslagen of dubbel geteld.",
    },
    hint: "Leg je vinger op elk onderdeel terwijl je telt.",
    uitleg: (som) => [
      { tekst: "Raak elk onderdeel één keer aan terwijl je telt." },
      { tekst: "Zo hoort het te zijn.", som: som.getallen.join(" · ") },
    ],
    ouder: {
      uitleg: "Er is telkens één te veel of te weinig geteld; meestal wordt er één overgeslagen.",
      zinnen: ["Tel samen hardop, en raak elk onderdeel aan.", "Waar was je gebleven?"],
      schoolwoord: "één-op-één tellen",
    },
  },
  {
    id: "afleider-gekozen",
    naam: "Een afleidergetal gekozen",
    herkent: (som) => {
      const gegeven = gegevenLijst(som);
      if (gegeven.length === 0) return false;
      /*
        Een getal dat bij geen enkele afbeelding hoort én er ook niet vlak
        naast zit. Zonder die tweede eis zou elke telfout van één hier ook
        binnenvallen, en dat is iets anders: dan is er geteld, alleen verkeerd.
      */
      return gegeven.some(
        (w) => !som.getallen.includes(w) && !som.getallen.some((g) => Math.abs(g - w) === 1),
      );
    },
    kindtekst: {
      "34": "Dat getal hoort er niet bij. Tel nog eens!",
      "56": "Je hebt een getal gekozen dat bij geen enkele afbeelding hoort.",
      "78": "Er liggen meer getallen dan afbeeldingen; een paar horen er niet bij. Tel eerst, kies daarna pas een getal.",
    },
    hint: "Er liggen meer getallen dan je nodig hebt. Tel eerst.",
    uitleg: (som) => [
      { tekst: "Tel eerst, kies daarna pas." },
      { tekst: "Deze getallen hoorden erbij.", som: som.getallen.join(" · ") },
    ],
    ouder: {
      uitleg: "Er is een getal gekozen dat bij geen enkele afbeelding hoort.",
      zinnen: ["Tel eerst hardop. Welk getal heb je nodig?", "Zoek dat getal er daarna pas bij."],
      schoolwoord: "tellen voor kiezen",
    },
  },
];
