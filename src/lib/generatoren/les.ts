/**
 * Een uitleg-les als oefening (oktober 2026). Zie `lib/lessen/soort.ts`.
 *
 * Het sjabloon kiest één les; de stappen worden vragen, op volgorde (via het
 * volgnummer) en altijd dezelfde. Het aantal vragen per oefensessie hoort het
 * aantal stappen te zijn, zodat het kind de hele les doorloopt.
 *
 * Een les heeft geen herkende denkfouten: de uitleg bij een fout staat per
 * stap in de les zelf (foutZin en tip).
 */

import { tekst, type Generator, type Gegenereerd } from "@/lib/generatoren/soort";
import type { Aanpak, Foutpatroon, Leeftijdsgroep } from "@/lib/generatoren/foutpatroon";
import type { Uitlegbron } from "@/lib/generatoren/uitlegscript";
import { ALLE_LESSEN, zoekLes } from "@/lib/lessen";

const LESPATRONEN: Foutpatroon[] = [
  {
    id: "les",
    naam: "Een fout in een les",
    herkent: () => false,
    kindtekst: {
      "34": "Kijk nog eens goed.",
      "56": "Kijk nog eens goed naar wat er in beeld staat.",
      "78": "Kijk nog eens goed naar wat er in beeld staat, en probeer het opnieuw.",
    },
    hint: "Kijk nog eens goed naar wat er in beeld staat.",
    uitleg: () => [{ tekst: "Kijk nog eens goed.", som: "" }],
    ouder: {
      uitleg: "In een les leert het kind iets nieuws; een fout hoort daarbij. De les laat meteen zien hoe het zit.",
      zinnen: ["Doe de les samen nog een keer.", "Laat het kind vertellen wat het ziet."],
      schoolwoord: "uitleg",
    },
  },
];

/* De zin met het goede antwoord staat in de somgegevens niet; daarom een algemene zin. */
const LESAANPAK: Aanpak = {
  zin: (): Record<Leeftijdsgroep, string> => ({
    "34": "Kijk goed naar het spel.",
    "56": "Kijk goed naar wat er in het spel gebeurt.",
    "78": "Kijk goed naar wat er in het spel gebeurt en wat de som zegt.",
  }),
  stappen: () => [{ tekst: "Kijk goed naar het spel.", som: "" }],
  controle: (som) => `Het goede antwoord is ${som.goed}.`,
};

const LESUITLEG: Uitlegbron = {
  modellen: ["som"],
  strategieen: [{ waarde: "les", label: "De les", uitleg: "De uitleg staat in de les zelf." }],
  standaardStrategie: () => "les",
  script: () => null,
  vergelijkbaar: () => null,
};

export const lesGenerator: Generator = {
  id: "les",
  naam: "Uitleg-les (zoals Synthesis)",
  uitleg:
    "Een vaste les: bij elke stap legt de mascotte iets uit en stelt dan een kleine vraag over het spel. Altijd dezelfde stappen, op volgorde. Zet het aantal vragen per oefensessie op het aantal stappen.",
  suggestie: "Groep 3 en 4: één les per leerdoel",
  velden: [
    {
      soort: "keuze",
      sleutel: "les",
      label: "Welke les",
      opties: ALLE_LESSEN.map((l) => ({ waarde: l.id, label: `${l.titel} (${l.synthesis})` })),
    },
  ],
  vraagteksten: { standaard: { "34": "", "56": "", "78": "" } },
  standaard: { les: ALLE_LESSEN[0]?.id ?? "" },
  foutpatronen: LESPATRONEN,
  aanpak: LESAANPAK,
  uitleganimatie: LESUITLEG,
  maximum: (inst) => zoekLes(tekst(inst, "les", ""))?.stappen.length ?? 0,

  maak(inst, _aantal, alGebruikt) {
    const les = zoekLes(tekst(inst, "les", ""));
    if (!les) return [];
    const uit: Gegenereerd[] = [];
    les.stappen.forEach((s, i) => {
      const handtekening = `les:${les.id}:${i + 1}`;
      if (alGebruikt.has(handtekening)) return;
      alGebruikt.add(handtekening);
      const getal = Number(s.antwoord);
      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: s.vraag,
        antwoord: s.antwoord,
        figuur: {
          soort: "godotspel",
          spel: s.spel,
          stand: "les",
          invoer: s.invoer,
          kop: s.kop,
          label: s.vraag,
          wacht: s.invoer === "typen",
          opgave: s.opgave,
          goedZin: s.goedZin,
          foutZin: s.foutZin,
          uitleg: s.uitleg,
          tip: s.tip,
          les: les.id,
          volgnummer: i + 1,
        },
        somgegevens: { soort: "les", variant: les.id, getallen: [i + 1], goed: Number.isFinite(getal) ? getal : 0 },
      });
    });
    return uit;
  },
};
