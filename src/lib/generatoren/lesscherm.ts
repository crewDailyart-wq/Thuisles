/**
 * Een uitleg-les op het nieuwe lesscherm (oktober 2026), zoals Synthesis.
 *
 * Anders dan de oudere generator `les` is de hele les hier één vraag: het kind
 * speelt de les van begin tot eind op een eigen scherm (zie
 * `components/les/Lesscherm.tsx`), en aan het eind telt hij als gemaakt. Wat
 * er bij een fout gebeurt, staat in het draaiboek van de les zelf.
 */

import { tekst, type Generator } from "@/lib/generatoren/soort";
import type { Aanpak, Foutpatroon, Leeftijdsgroep } from "@/lib/generatoren/foutpatroon";
import type { Uitlegbron } from "@/lib/generatoren/uitlegscript";
import { LESCATALOGUS, zoekLesregel } from "@/lib/lessen/catalogus";

const PATRONEN: Foutpatroon[] = [
  {
    id: "lesscherm",
    naam: "Een fout in een les",
    herkent: () => false,
    kindtekst: {
      "34": "Kijk nog eens goed.",
      "56": "Kijk nog eens goed.",
      "78": "Kijk nog eens goed.",
    },
    hint: "De les helpt zelf verder.",
    uitleg: () => [{ tekst: "De les helpt zelf verder.", som: "" }],
    ouder: {
      uitleg: "In een les leert het kind iets nieuws. Bij een fout legt de mascotte meteen uit hoe het zit.",
      zinnen: ["Doe de les samen nog een keer.", "Laat het kind vertellen wat het ziet."],
      schoolwoord: "uitleg",
    },
  },
];

const AANPAK: Aanpak = {
  zin: (): Record<Leeftijdsgroep, string> => ({
    "34": "Luister naar de uitleg.",
    "56": "Luister naar de uitleg.",
    "78": "Luister naar de uitleg.",
  }),
  stappen: () => [{ tekst: "Luister naar de uitleg.", som: "" }],
  controle: () => "De les is af.",
};

const UITLEG: Uitlegbron = {
  modellen: ["som"],
  strategieen: [{ waarde: "les", label: "De les", uitleg: "De uitleg staat in de les zelf." }],
  standaardStrategie: () => "les",
  script: () => null,
  vergelijkbaar: () => null,
};

export const lesschermGenerator: Generator = {
  id: "lesscherm",
  naam: "Uitleg-les op eigen scherm (zoals Synthesis)",
  uitleg:
    "Een hele les als één oefening: de mascotte legt uit, het kind doet mee, en bij een fout helpt de les zelf verder. Eén vraag per les; zet het aantal vragen per oefensessie op 1.",
  suggestie: "Groep 3: één les per leerdoel",
  velden: [
    {
      soort: "keuze",
      sleutel: "les",
      label: "Welke les",
      opties: LESCATALOGUS.map((l) => ({ waarde: l.id, label: `${l.titel} (${l.synthesis})` })),
    },
  ],
  vraagteksten: { standaard: { "34": "", "56": "", "78": "" } },
  standaard: { les: LESCATALOGUS[0]?.id ?? "" },
  foutpatronen: PATRONEN,
  aanpak: AANPAK,
  uitleganimatie: UITLEG,
  maximum: (inst) => (zoekLesregel(tekst(inst, "les", "")) ? 1 : 0),

  maak(inst, _aantal, alGebruikt) {
    const les = zoekLesregel(tekst(inst, "les", ""));
    if (!les) return [];
    const handtekening = `lesscherm:${les.id}`;
    if (alGebruikt.has(handtekening)) return [];
    alGebruikt.add(handtekening);
    return [
      {
        handtekening,
        vorm: "open",
        vraagtekst: les.titel,
        antwoord: "klaar",
        figuur: { soort: "lesscherm", les: les.id },
        somgegevens: { soort: "lesscherm", variant: les.id, getallen: [], goed: 0 },
      },
    ];
  },
};
