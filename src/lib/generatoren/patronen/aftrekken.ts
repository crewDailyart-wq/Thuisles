/** Foutpatronen bij aftrekken. */

import { cijfersOmgedraaid, type Foutpatroon } from "@/lib/generatoren/foutpatroon";

/**
 * De klassieke fout bij aftrekken onder elkaar: per cijfer het kleinste van
 * het grootste afhalen. 63 − 28 wordt dan 45, want 8 − 3 in plaats van 3 − 8.
 */
function kleinsteVanGrootste(van: number, af: number): number | null {
  if (van > 999 || af > 999) return null;
  const a = String(van).padStart(3, "0").split("").map(Number);
  const b = String(af).padStart(3, "0").split("").map(Number);
  const cijfers = a.map((cijfer, i) => Math.abs(cijfer - b[i]));
  return Number(cijfers.join(""));
}

/*
  De volgorde is die van specifiek naar algemeen: het eerste patroon dat past
  wordt getoond. "Kleinste van grootste" zegt meer dan "tiental vergeten",
  dus die staat voorop. Zo krijgt een kind de meest behulpzame uitleg.
*/
export const aftrekkenPatronen: Foutpatroon[] = [
  {
    id: "kleinste-van-grootste",
    naam: "Kleinste van grootste afgehaald",
    herkent: (som, gegeven) => {
      if (som.getallen.length !== 2) return false;
      const fout = kleinsteVanGrootste(som.getallen[0], som.getallen[1]);
      return fout !== null && fout === gegeven && fout !== som.goed;
    },
    kindtekst: {
      "34": "Misschien heb je het kleine getal van het grote afgehaald.",
      "56": "Het lijkt erop dat je per cijfer het kleinste van het grootste hebt afgehaald.",
      "78": "Per cijfer heb je het kleinste van het grootste afgetrokken. Als het bovenste cijfer kleiner is, moet je lenen van het tiental ernaast.",
    },
    hint: "Is het bovenste cijfer kleiner? Dan leen je er eentje bij van het tiental ernaast.",
    uitleg: (som) => {
      const [van, af] = som.getallen;
      return [
        { tekst: "Kijk naar de eenheden.", som: `${van % 10} − ${af % 10}` },
        { tekst: "Is dat te weinig? Leen dan een tiental.", som: `${(van % 10) + 10} − ${af % 10}` },
        { tekst: "Het goede antwoord is:", som: String(som.goed) },
      ];
    },
    ouder: {
      uitleg:
        "Bij aftrekken onder elkaar is per cijfer het kleinste van het grootste afgehaald. Als het bovenste cijfer kleiner is, moet er geleend worden van het tiental ernaast.",
      zinnen: [
        "Kun je van 3 er 8 afhalen? Wat doe je dan?",
        "Zullen we samen een tiental lenen?",
      ],
      schoolwoord: "lenen",
    },
  },
  {
    id: "opgeteld",
    naam: "Opgeteld in plaats van afgetrokken",
    herkent: (som, gegeven) =>
      som.getallen.length >= 2 && gegeven === som.getallen.reduce((a, b) => a + b, 0),
    kindtekst: {
      "34": "Ik denk dat je hebt opgeteld. Hier moet er iets af.",
      "56": "Het lijkt erop dat je hebt opgeteld. Bij een min gaat er iets af.",
      "78": "Je hebt de getallen bij elkaar opgeteld. Het minteken betekent dat er iets af gaat, dus het antwoord wordt kleiner.",
    },
    hint: "Let op het teken: een min betekent eraf.",
    uitleg: (som) => [
      { tekst: "Bij een min gaat er iets af.", som: som.getallen.join(" − ") },
      { tekst: "Dat wordt:", som: String(som.goed) },
    ],
    ouder: {
      uitleg: "Het antwoord past bij optellen in plaats van aftrekken. Het rekenteken is over het hoofd gezien.",
      zinnen: [
        "Wat staat er tussen de getallen: een plus of een min?",
        "Wordt het antwoord dan groter of kleiner?",
      ],
      schoolwoord: "aftrekken",
    },
  },
  {
    id: "tiental-vergeten",
    naam: "Tiental vergeten",
    herkent: (som, gegeven) => Math.abs(gegeven - som.goed) === 10,
    kindtekst: {
      "34": "Misschien ben je een tiental vergeten.",
      "56": "Het lijkt erop dat er een tiental is blijven liggen.",
      "78": "Je zit precies tien ernaast. Bij het lenen van een tiental is er waarschijnlijk één vergeten.",
    },
    hint: "Ga eerst terug naar het hele tiental, en haal daarna de rest eraf.",
    uitleg: (som) => {
      const [van, af] = som.getallen;
      const naarTiental = van % 10;
      const rest = af - naarTiental;
      return [
        { tekst: "Begin bij het grootste getal.", som: `${van}` },
        { tekst: "Ga eerst terug naar het hele tiental.", som: `${van} − ${naarTiental} = ${van - naarTiental}` },
        { tekst: "Haal daarna de rest eraf.", som: `${van - naarTiental} − ${rest} = ${som.goed}` },
      ];
    },
    ouder: {
      uitleg:
        "Bij aftrekken over een tiental heen blijft er soms een tiental liggen. Het antwoord zit dan precies tien ernaast.",
      zinnen: [
        "Zullen we eerst terugtellen naar het hele tiental?",
        "Hoeveel moet er dan nog af?",
      ],
      schoolwoord: "tiental",
    },
  },
  {
    id: "telfout",
    naam: "Eén ernaast",
    herkent: (som, gegeven) => Math.abs(gegeven - som.goed) === 1,
    kindtekst: {
      "34": "Je zit er maar eentje naast. Bijna goed!",
      "56": "Je zit er één naast. Misschien is er bij het terugtellen eentje overgeslagen.",
      "78": "Je zit er precies één naast. Dat komt vaak door één stap te veel of te weinig terug te tellen.",
    },
    hint: "Tel nog een keer rustig terug, en let op waar je begint.",
    uitleg: (som) => [
      { tekst: "Reken de som nog eens na.", som: som.getallen.join(" − ") },
      { tekst: "Het goede antwoord is:", som: String(som.goed) },
    ],
    ouder: {
      uitleg: "Het antwoord zit één ernaast, meestal door één stap te veel of te weinig terug te tellen.",
      zinnen: ["Zullen we samen hardop terugtellen?", "Bij welk getal begon je?"],
      schoolwoord: "terugtellen",
    },
  },
  {
    id: "cijfers-omgedraaid",
    naam: "Cijfers omgedraaid",
    herkent: (som, gegeven) => cijfersOmgedraaid(som.goed) === gegeven,
    kindtekst: {
      "34": "Misschien staan de cijfers omgedraaid.",
      "56": "Het lijkt erop dat je de cijfers hebt omgedraaid.",
      "78": "Je hebt de cijfers omgedraaid. Let op welk cijfer de tientallen zijn en welk de eenheden.",
    },
    hint: "Kijk goed welk cijfer voor de tientallen staat en welk voor de eenheden.",
    uitleg: (som) => [
      { tekst: "Het goede antwoord is:", som: String(som.goed) },
      {
        tekst: "Dat zijn de tientallen en de eenheden:",
        som: `${Math.floor(som.goed / 10)} tientallen en ${som.goed % 10} eenheden`,
      },
    ],
    ouder: {
      uitleg: "De cijfers van het antwoord staan omgedraaid. Het rekenen ging goed; het opschrijven niet.",
      zinnen: ["Welk cijfer zijn de tientallen?", "Zeg het getal eens hardop."],
      schoolwoord: "tientallen en eenheden",
    },
  },
];
