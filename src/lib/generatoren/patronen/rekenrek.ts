/**
 * Foutpatronen bij de opdrachten met het rekenrek.
 *
 * De gewone erafsom-fouten gelden hier ook — opgeteld in plaats van
 * afgetrokken, eentje ernaast, de getallen omgedraaid — en die staan al in
 * `patronen/erafsommen.ts`. Hier komen de fouten bij die juist bij het
 * rekenrek horen:
 *
 *   - bij de eenheden het kleine van het grote afgehaald: 15 − 7 wordt 12,
 *     omdat 7 − 5 makkelijker voelt dan over de tien heen gaan;
 *   - bij het flitsen er vijf naast zitten: dan is de vijfstructuur niet
 *     gezien en is er kraal voor kraal geteld, met een hele rij mis.
 *
 * De somgegevens zijn overal gelijk opgebouwd: `getallen[0]` is waar je mee
 * begint, `getallen[1]` is wat eraf gaat en `goed` is wat gevraagd wordt. Bij
 * het flitsen staat het aantal kralen in `getallen[0]`.
 */

import type { Foutpatroon } from "@/lib/generatoren/foutpatroon";
import { erafPatronen } from "@/lib/generatoren/patronen/erafsommen";

/** 15 − 7: eerst 7 − 5 = 2 bij de eenheden, en dan 12 als antwoord. */
function kleinVanGroot(van: number, af: number): number | null {
  const eenheden = van % 10;
  if (eenheden >= af) return null;
  return van - eenheden + (af - eenheden);
}

const kleinVanGrootPatroon: Foutpatroon = {
  id: "klein-van-groot",
  naam: "Bij de eenheden het kleine van het grote afgehaald",
  herkent: (som, gegeven) => {
    if (som.getallen.length < 2) return false;
    const fout = kleinVanGroot(som.getallen[0], som.getallen[1]);
    return fout !== null && fout === gegeven && fout !== som.goed;
  },
  kindtekst: {
    "34": "Je hebt de kleine van de grote afgehaald. Ga eerst naar de 10.",
    "56": "Bij de eenheden heb je het kleinste van het grootste afgehaald. Haal er eerst zoveel af dat je op 10 uitkomt, en daarna de rest.",
    "78": "Je hebt bij de eenheden het kleine getal van het grote afgetrokken. Dat mag niet: splits het aftrekgetal en ga eerst naar de tien, dan de rest eraf.",
  },
  hint: "Ga eerst naar de 10. Hoeveel moet er dan nog af?",
  uitleg: (som) => {
    const [van, af] = som.getallen;
    const eenheden = van % 10;
    const rest = af - eenheden;
    return [
      { tekst: "Haal er eerst zoveel af tot 10.", som: `${van} − ${eenheden} = 10` },
      { tekst: "En dan de rest eraf.", som: `10 − ${rest} = ${van - af}` },
    ];
  },
  ouder: {
    uitleg:
      "Bij de eenheden is het kleine getal van het grote afgetrokken: 15 − 7 wordt dan 12. Over de tien heen gaan voelt moeilijker dan het omdraaien.",
    zinnen: [
      "Doe het samen op het rekenrek: eerst terug naar de tien, dan de rest.",
      "Vraag: hoeveel moet er af om precies op tien te komen?",
    ],
    schoolwoord: "aftrekken via de tien",
  },
};

const vijfErnaastPatroon: Foutpatroon = {
  id: "vijf-ernaast",
  naam: "Vijf ernaast: de vijfstructuur niet gezien",
  herkent: (som, gegeven) =>
    Number.isFinite(gegeven) && gegeven !== som.goed && Math.abs(gegeven - som.goed) === 5,
  kindtekst: {
    "34": "Je zit er vijf naast. Kijk naar de rode en de witte kralen.",
    "56": "Je zit er vijf naast. Op het rekenrek zijn er vijf rood en vijf wit; tel eerst met die groepjes van vijf.",
    "78": "Je antwoord zit er precies vijf naast. Waarschijnlijk is er kraal voor kraal geteld in plaats van met de groepjes van vijf; één groepje raak je dan makkelijk kwijt.",
  },
  hint: "Vijf rode en vijf witte. Tel eerst de vijftallen.",
  uitleg: (som) => {
    const aantal = som.getallen[0];
    return [
      { tekst: "Tel eerst de vijftallen.", som: "5, 10, 15" },
      { tekst: "En dan de losse kralen.", som: String(aantal) },
    ];
  },
  ouder: {
    uitleg:
      "Het antwoord zit er vijf naast: er is kraal voor kraal geteld in plaats van met de vijfstructuur van het rekenrek.",
    zinnen: [
      "Wijs de rode en de witte kralen aan: vijf en vijf is tien.",
      "Laat eerst de vijftallen hardop tellen: vijf, tien, vijftien.",
    ],
    schoolwoord: "vijfstructuur",
  },
};

/**
 * Voor de aftrekopdrachten met het rekenrek.
 *
 * De specifieke fout staat voorop: "klein van groot" zegt meer dan "eentje
 * ernaast", en het eerste patroon dat past wordt getoond.
 */
export const rekenrekPatronen: Foutpatroon[] = [kleinVanGrootPatroon, ...erafPatronen];

/** Voor het flitsen: daar gaat het om tellen, niet om aftrekken. */
export const flitsPatronen: Foutpatroon[] = [vijfErnaastPatroon, ...erafPatronen];
