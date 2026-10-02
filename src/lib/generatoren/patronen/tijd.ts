/**
 * Foutpatronen bij het domein Tijd.
 *
 * ---------------------------------------------------------------------------
 * Waar deze patronen wél en niet over gaan
 * ---------------------------------------------------------------------------
 * Bij de opdrachten waar het kind een getal typt — hoe lang iets duurt, hoeveel
 * minuten er in een uur gaan, hoeveel nachtjes nog — is aan het antwoord te
 * zien wát er misging: de minuten vergeten, de verkeerde kant op gerekend, een
 * uur ernaast. Die vier staan hieronder.
 *
 * Bij de opdrachten waar het kind uit vier antwoorden kiest, is dat niet zo:
 * het antwoord is dan het nummer van een knop, en uit "knop 3" valt geen
 * denkfout af te leiden. Daar valt het scherm terug op "zo los je het op", en
 * dat is precies waar die uitleg voor is. Elke opdracht heeft er een; zie
 * `aanpak/tijd.ts`.
 *
 * De somgegevens zijn overal gelijk opgebouwd: `getallen[0]` en `getallen[1]`
 * zijn het uur en de minuut waar de opgave over gaat, `goed` is het antwoord
 * als getal, en `extra` bevat wat er verder nodig is — bij een antwoord van
 * twee vakjes staat daar `antwoordUur` en `antwoordMinuut`, en wat het kind
 * heeft ingevuld komt er als `gegeven0` en `gegeven1` bij.
 */

import type { Foutpatroon, Somgegevens } from "@/lib/generatoren/foutpatroon";

/** De types waarbij het antwoord uit uren én minuten bestaat. */
const DUURTYPES = ["klokduur", "digitaalverschil"];

function ingevuld(som: Somgegevens): { uren?: number; minuten?: number } {
  return { uren: som.extra?.gegeven0, minuten: som.extra?.gegeven1 };
}

function hoort(som: Somgegevens): { uren: number; minuten: number } {
  return { uren: som.extra?.antwoordUur ?? som.goed, minuten: som.extra?.antwoordMinuut ?? 0 };
}

export const tijdPatronen: Foutpatroon[] = [
  {
    id: "minuten-vergeten",
    naam: "Alleen de hele uren geteld",
    herkent: (som) => {
      if (!DUURTYPES.includes(som.soort)) return false;
      const gaf = ingevuld(som);
      const moet = hoort(som);
      return gaf.uren === moet.uren && moet.minuten !== 0 && (gaf.minuten ?? 0) === 0;
    },
    kindtekst: {
      "34": "De minuten tellen ook mee.",
      "56": "Je hebt de hele uren goed, maar de minuten erbij vergeten.",
      "78": "De uren kloppen; het stuk minuten is niet meegeteld. Reken eerst naar het hele uur en tel daarna de losse minuten erbij.",
    },
    hint: "Tel eerst de hele uren, en kijk dan hoeveel minuten er nog bij komen.",
    uitleg: (som) => {
      const moet = hoort(som);
      return [
        { tekst: "Zoveel hele uren zijn het.", som: `${moet.uren} uur` },
        { tekst: "En er komen minuten bij.", som: `${moet.minuten} minuten` },
        { tekst: "Samen is dat:", som: `${moet.uren} uur en ${moet.minuten} minuten` },
      ];
    },
    ouder: {
      uitleg:
        "De hele uren zijn goed geteld, maar het stukje minuten erbij is vergeten.",
      zinnen: [
        "Vraag: hoeveel hele uren zijn het? En hoeveel minuten komen er dan nog bij?",
        "Wijs samen de twee stappen aan op de klok.",
      ],
      schoolwoord: "tijdsduur",
    },
  },
  {
    id: "verkeerde-kant",
    naam: "De verkeerde kant op gerekend",
    herkent: (som) => {
      if (!DUURTYPES.includes(som.soort)) return false;
      const gaf = ingevuld(som);
      const moet = hoort(som);
      /* Vooruit en terug tellen samen altijd op tot een hele dag. */
      const andersom = (24 * 60 - (moet.uren * 60 + moet.minuten)) % (24 * 60);
      const gegeven = (gaf.uren ?? 0) * 60 + (gaf.minuten ?? 0);
      return gegeven === andersom && andersom !== moet.uren * 60 + moet.minuten;
    },
    kindtekst: {
      "34": "Je telde de andere kant op.",
      "56": "Je hebt de verkeerde kant op geteld. Kijk nog eens welke tijd eerst komt.",
      "78": "Je hebt vanaf de andere tijd geteld. Begin bij de tijd die het eerst komt en tel naar de latere tijd toe.",
    },
    hint: "Welke tijd komt het eerst? Daar begin je.",
    uitleg: (som) => {
      const moet = hoort(som);
      return [
        { tekst: "Begin bij de vroegste tijd.", som: `${som.getallen[0]}:${String(som.getallen[1]).padStart(2, "0")}` },
        { tekst: "Tel naar de andere tijd toe.", som: `${moet.uren} uur en ${moet.minuten} minuten` },
      ];
    },
    ouder: {
      uitleg: "Er is van de late tijd naar de vroege geteld in plaats van andersom.",
      zinnen: [
        "Vraag: welke tijd was er eerst?",
        "Tel samen vooruit op de klok, van de eerste tijd naar de tweede.",
      ],
      schoolwoord: "tijdsduur",
    },
  },
  {
    id: "uur-ernaast",
    naam: "Eén uur ernaast",
    herkent: (som) => {
      if (!DUURTYPES.includes(som.soort)) return false;
      const gaf = ingevuld(som);
      const moet = hoort(som);
      return (
        gaf.uren !== undefined &&
        Math.abs(gaf.uren - moet.uren) === 1 &&
        (gaf.minuten ?? 0) === moet.minuten
      );
    },
    kindtekst: {
      "34": "Je zit er één uur naast.",
      "56": "Je zit er één uur naast. Tel de uren nog eens rustig na op de klok.",
      "78": "Het antwoord ligt één uur naast het goede. Dat komt meestal doordat het beginuur wordt meegeteld; tel de sprongen van uur naar uur.",
    },
    hint: "Tel de uren één voor één: van 3 naar 4 is één uur.",
    uitleg: (som) => {
      const moet = hoort(som);
      return [
        { tekst: "Tel de uren één voor één.", som: `${moet.uren} uur` },
        { tekst: "En de minuten erbij.", som: `${moet.minuten} minuten` },
      ];
    },
    ouder: {
      uitleg: "Het antwoord zit er één uur naast, meestal door het beginuur mee te tellen.",
      zinnen: [
        "Tel samen hardop mee: van drie naar vier is één uur.",
        "Laat de sprongen op de klok aanwijzen.",
      ],
      schoolwoord: "tijdsduur",
    },
  },
  {
    id: "eentje-ernaast",
    naam: "Eén te veel of te weinig geteld",
    herkent: (som, gegeven) => {
      /* Alleen bij de opdrachten waar het antwoord één getal is. */
      if (DUURTYPES.includes(som.soort)) return false;
      if (som.extra?.keuze === 1) return false;
      return (
        Number.isFinite(gegeven) && gegeven !== som.goed && Math.abs(gegeven - som.goed) === 1
      );
    },
    kindtekst: {
      "34": "Je zit er eentje naast. Tel nog eens.",
      "56": "Je zit er één naast. Tel nog eens rustig na, en tel de dag waar je begint niet mee.",
      "78": "Je antwoord zit er één naast. Bij tellen op een kalender tel je de dag waar je begint niet mee — die is immers al voorbij.",
    },
    hint: "Tel de dag waar je begint niet mee.",
    uitleg: (som) => [
      { tekst: "Tel vanaf de dag erna.", som: String(som.goed) },
      { tekst: "Zoveel is het.", som: String(som.goed) },
    ],
    ouder: {
      uitleg: "Het antwoord zit er één naast, meestal door de dag van vandaag mee te tellen.",
      zinnen: [
        "Tel samen op de kalender: morgen is één, overmorgen is twee.",
        "Wijs elke dag aan terwijl je telt.",
      ],
      schoolwoord: "tellen",
    },
  },
];
