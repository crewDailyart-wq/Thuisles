/**
 * Aanvullen tot een vast getal.
 *
 * Eén gegeven getal in een geel vakje, een leeg wit vakje ernaast, en klein
 * erboven staat waar het samen op uit moet komen: "samen 20". Het kind vult in
 * wat er nog bij moet.
 *
 * Waarom dit los staat van de tabel: hier is er geen rij eronder of erboven om
 * op te leunen. Het kind moet in één keer zien hoeveel er nog bij moet, en dat
 * is precies de stap die later bij het optellen over het tiental terugkomt.
 */

import {
  getal,
  heelGetal,
  kansGenerator,
  type Generator,
  type Gegenereerd,
  type Instellingen,
  bepaalVraagtekst,
  vraagtekstVelden,
} from "@/lib/generatoren/soort";
import type { Leeftijdsgroep } from "@/lib/generatoren/foutpatroon";
import { splitsopdrachtPatronen } from "@/lib/generatoren/patronen/splitsopdrachten";
import { aanvullenAanpak } from "@/lib/generatoren/aanpak/splitsopdrachten";
import { aanvullenUitleg } from "@/lib/generatoren/scripts/splitsopdrachten";

/*
  De opdracht zelf is de zin.

  Op de plek van {som} komt het getal waar het samen op uit moet komen; dat
  stond eerst klein boven de vakjes, maar daar las een kind het niet. Nu staat
  het in de vraagzin, groot en op de plek waar de vraag altijd staat.
*/
const ZIN = "Maak samen {som}.";

const STANDAARDZINNEN: Record<Leeftijdsgroep, string> = {
  "34": ZIN,
  "56": ZIN,
  "78": ZIN,
};

const MIN_DOEL = 5;
const MAX_DOEL = 100;

export function grenzen(inst: Instellingen) {
  const doel = Math.max(MIN_DOEL, Math.min(MAX_DOEL, getal(inst, "doel", 20)));
  const van = Math.max(0, Math.min(doel - 1, getal(inst, "van", 1)));
  const tot = Math.max(van, Math.min(doel - 1, getal(inst, "tot", doel - 1)));
  return { doel, van, tot };
}

export const aanvullenGenerator: Generator = {
  id: "aanvullen",
  naam: "Aanvullen tot een getal",
  uitleg:
    "Eén gegeven getal en een leeg vakje ernaast, met klein erboven waar het samen op uit moet komen. Het kind vult aan tot dat getal.",
  suggestie: "Groep 4: aanvullen tot 20",
  velden: [
    {
      soort: "getal",
      sleutel: "doel",
      label: "Samen hoeveel",
      min: MIN_DOEL,
      max: MAX_DOEL,
      hulp: "Dit getal staat in de vraagzin erboven — \u201eMaak samen 20.\u201d — en is bij elke vraag hetzelfde.",
    },
    {
      soort: "getal",
      sleutel: "van",
      label: "Kleinste gegeven getal",
      min: 0,
      max: MAX_DOEL,
    },
    {
      soort: "getal",
      sleutel: "tot",
      label: "Grootste gegeven getal",
      min: 0,
      max: MAX_DOEL,
      hulp: "Wordt nooit groter dan één minder dan het getal hierboven; anders valt er niets aan te vullen.",
    },
    ...vraagtekstVelden(STANDAARDZINNEN),
  ],
  vraagteksten: {
    standaard: STANDAARDZINNEN,
    som: (s) => String(s.getallen[0] ?? s.goed),
  },
  standaard: { doel: 20, van: 1, tot: 19 },
  foutpatronen: splitsopdrachtPatronen,
  aanpak: aanvullenAanpak,
  uitleganimatie: aanvullenUitleg,

  /* Eén vraag per gegeven getal binnen het bereik. */
  maximum: (inst) => {
    const { van, tot } = grenzen(inst);
    return Math.max(0, tot - van + 1);
  },

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const { doel, van, tot } = grenzen(inst);

    const uit: Gegenereerd[] = [];
    for (let poging = 0; poging < aantal * 300 && uit.length < aantal; poging++) {
      const gegeven = heelGetal(kans, van, tot);
      const antwoord = doel - gegeven;
      if (antwoord <= 0) continue;

      const handtekening = `aanvullen:${doel}:${gegeven}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const gegevens = {
        soort: "aanvullen",
        variant: "eenvoudig",
        getallen: [doel, gegeven],
        goed: antwoord,
      };

      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(aanvullenGenerator, inst, groep, gegevens),
        antwoord: String(antwoord),
        figuur: { soort: "aanvullen", doel, gegeven },
        somgegevens: gegevens,
      });
    }

    return uit;
  },
};
