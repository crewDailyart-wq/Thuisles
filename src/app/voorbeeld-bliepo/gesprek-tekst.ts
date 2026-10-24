/**
 * De tekst van het voorbeeld "Gesprek met Bliepo" (24 oktober 2026): een kort
 * gesprek bij de start van een les. Vaste tekst in de code, niet in de
 * database. Los van het onderdeel, zodat de zinnen vooraf met Ruth gemaakt
 * kunnen worden.
 */

export type Knop = { label: string; naar: string };
/** Een stap in het gesprek: wat Bliepo zegt (een zin per alinea) en waarmee het kind kan antwoorden. */
export type Stap = { zinnen: string[]; knoppen: Knop[]; gebaar?: string };

const KEUZE = "Wil je eerst een korte check doen, of meteen beginnen met de les?";
const KEUZEKNOPPEN: Knop[] = [
  { label: "Eerst een korte check", naar: "check" },
  { label: "Begin met de les", naar: "les" },
];
const GROEPJES: Knop[] = [
  { label: "Het linker groepje", naar: "links" },
  { label: "Het rechter groepje", naar: "rechts" },
];

/* Het voorbeeldgesprek bij de start van een les (vaste tekst in de code, niet in de database). */
export const GESPREK: Record<string, Stap> = {
  start: {
    zinnen: ["Hoi! Fijn dat je er bent.", "In deze les gaan we groepjes en getallen vergelijken.", "Denk je dat je dit al goed kunt?"],
    knoppen: [
      { label: "Ja, dat kan ik al", naar: "ja" },
      { label: "Een beetje", naar: "beetje" },
      { label: "Nee, nog niet", naar: "nee" },
    ],
  },
  ja: {
    zinnen: ["Wat fijn om te horen!", KEUZE],
    knoppen: KEUZEKNOPPEN,
    gebaar: "thumbsUp",
  },
  beetje: {
    zinnen: ["Dat is al een mooi begin.", "Samen maken we het nog beter.", KEUZE],
    knoppen: KEUZEKNOPPEN,
    gebaar: "encourage",
  },
  nee: {
    zinnen: ["Dat geeft helemaal niets.", "We gaan het samen leren, stap voor stap.", KEUZE],
    knoppen: KEUZEKNOPPEN,
    gebaar: "encourage",
  },
  check: {
    zinnen: ["Goed plan!", "Ik stel je eerst drie korte vragen.", "Dan weet ik waar we samen kunnen beginnen."],
    knoppen: [{ label: "Ik ben er klaar voor", naar: "les" }],
    gebaar: "thumbsUp",
  },
  les: {
    zinnen: ["Daar gaan we!", "Kijk eens naar de twee groepjes op het bord.", "Welk groepje heeft de meeste stippen?"],
    knoppen: GROEPJES,
  },
  links: {
    zinnen: ["Goed gezien!", "Links zijn het er vijf en rechts maar drie.", "Vijf is meer dan drie."],
    knoppen: [{ label: "Nog een keer", naar: "start" }],
    gebaar: "thumbsUp",
  },
  rechts: {
    zinnen: ["Kijk nog eens goed.", "Tel de stippen in elk groepje maar.", "Welk groepje heeft er meer?"],
    knoppen: GROEPJES,
    gebaar: "encourage",
  },
};
/** Alle zinnen van het voorbeeld (om ze vooraf met Ruth te maken). */
export const GESPREK_ZINNEN = [...new Set(Object.values(GESPREK).flatMap((s) => s.zinnen))];
