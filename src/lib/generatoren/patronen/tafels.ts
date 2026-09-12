/** Foutpatronen bij de tafels. */

import type { Foutpatroon } from "@/lib/generatoren/foutpatroon";

/** De twee getallen van de keersom, ongeacht in welke vorm de vraag stond. */
function factoren(som: { getallen: number[]; extra?: Record<string, number> }) {
  const tafel = som.extra?.tafel ?? som.getallen[0] ?? 0;
  const mee = som.extra?.mee ?? som.getallen[1] ?? 0;
  return { tafel, mee };
}

/*
  Van specifiek naar algemeen: het eerste passende patroon wordt getoond.
  Wie op 7 x 8 antwoordt met 49 heeft waarschijnlijk 7 x 7 gedaan, en niet
  een tafelstap gemist — dus "verkeerde tafel" staat voorop.
*/
export const tafelsPatronen: Foutpatroon[] = [
  {
    id: "tafel-verwisseld",
    naam: "Verkeerde tafel gepakt",
    herkent: (som, gegeven) => {
      const { tafel, mee } = factoren(som);
      return (gegeven === tafel * tafel || gegeven === mee * mee) && gegeven !== som.goed;
    },
    kindtekst: {
      "34": "Misschien pakte je de verkeerde tafel.",
      "56": "Het lijkt erop dat je een andere tafel hebt gebruikt.",
      "78": "Je hebt waarschijnlijk hetzelfde getal twee keer genomen in plaats van de twee getallen uit de som.",
    },
    hint: "Kijk nog eens welke twee getallen er in de som staan.",
    uitleg: (som) => {
      const { tafel, mee } = factoren(som);
      return [
        { tekst: "In de som staan deze twee getallen:", som: `${tafel} en ${mee}` },
        { tekst: "Samen geeft dat:", som: `${tafel} × ${mee} = ${som.goed}` },
      ];
    },
    ouder: {
      uitleg: "Er is met een andere tafel gerekend dan in de som staat.",
      zinnen: ["Welke twee getallen staan er in de som?", "Welke tafel hebben we dan nodig?"],
      schoolwoord: "tafel",
    },
  },
  {
    id: "verdubbeld",
    naam: "Antwoord verdubbeld",
    herkent: (som, gegeven) => gegeven === som.goed * 2 && som.goed > 0,
    kindtekst: {
      "34": "Je antwoord is twee keer zo groot.",
      "56": "Het lijkt erop dat je het antwoord hebt verdubbeld.",
      "78": "Je antwoord is precies het dubbele. Misschien is de keersom een keer te vaak gedaan.",
    },
    hint: "Kijk nog eens hoe vaak je het getal moet nemen.",
    uitleg: (som) => {
      const { tafel, mee } = factoren(som);
      return [
        { tekst: `Je neemt ${tafel} precies ${mee} keer.`, som: `${tafel} × ${mee}` },
        { tekst: "Dat is samen:", som: String(som.goed) },
      ];
    },
    ouder: {
      uitleg: "Het antwoord is precies het dubbele van het goede antwoord.",
      zinnen: ["Hoe vaak moeten we dit getal nemen?", "Zullen we het samen natellen?"],
      schoolwoord: "keersom",
    },
  },
  {
    id: "opgeteld",
    naam: "Opgeteld in plaats van keer",
    herkent: (som, gegeven) => {
      const { tafel, mee } = factoren(som);
      return gegeven === tafel + mee && tafel + mee !== som.goed;
    },
    kindtekst: {
      "34": "Ik denk dat je hebt opgeteld. Hier moet je keer doen.",
      "56": "Het lijkt erop dat je hebt opgeteld in plaats van vermenigvuldigd.",
      "78": "Je hebt de getallen opgeteld. Bij een keersom neem je het getal een aantal keer, dus het antwoord wordt veel groter.",
    },
    hint: "Bij een keersom neem je het getal net zo vaak als er staat.",
    uitleg: (som) => {
      const { tafel, mee } = factoren(som);
      const rij = Array.from({ length: Math.min(mee, 8) }, () => tafel);
      return [
        { tekst: `${tafel} × ${mee} betekent: ${mee} keer ${tafel}.`, som: rij.join(" + ") + (mee > 8 ? " + …" : "") },
        { tekst: "Samen is dat:", som: String(som.goed) },
      ];
    },
    ouder: {
      uitleg: "De getallen zijn opgeteld in plaats van vermenigvuldigd.",
      zinnen: [
        "Wat staat er tussen de getallen: een plus of een keer?",
        "Hoe vaak moeten we dit getal neerleggen?",
      ],
      schoolwoord: "vermenigvuldigen",
    },
  },
  {
    id: "tafelstap-ernaast",
    naam: "Eén tafelstap ernaast",
    herkent: (som, gegeven) => {
      const { tafel, mee } = factoren(som);
      const stappen = [tafel, mee].filter((n) => n > 0);
      return stappen.some((stap) => Math.abs(gegeven - som.goed) === stap);
    },
    kindtekst: {
      "34": "Je zit één stapje ernaast in de tafel.",
      "56": "Het lijkt erop dat je één tafelstap te ver of te weinig bent gegaan.",
      "78": "Je antwoord ligt precies één tafelstap naast het goede antwoord. Waarschijnlijk is er één keer te veel of te weinig geteld.",
    },
    hint: "Zeg de tafel hardop op vanaf het begin, en tel de stappen mee.",
    uitleg: (som) => {
      const { tafel, mee } = factoren(som);
      const rij = Array.from({ length: Math.min(mee, 10) }, (_, i) => tafel * (i + 1));
      return [
        { tekst: `Zo loopt de tafel van ${tafel}:`, som: rij.join(" · ") },
        { tekst: `Tel de stappen: dat zijn er ${mee}.`, som: `${tafel} × ${mee}` },
        { tekst: "Het goede antwoord is:", som: String(som.goed) },
      ];
    },
    ouder: {
      uitleg:
        "Het antwoord ligt één tafelstap naast het goede antwoord, bijvoorbeeld 48 in plaats van 56 bij 7 × 8. Er is één keer te veel of te weinig geteld.",
      zinnen: [
        "Zullen we de tafel samen hardop opzeggen?",
        "Bij welke stap zijn we nu? Tel maar mee op je vingers.",
      ],
      schoolwoord: "tafel",
    },
  },
];
