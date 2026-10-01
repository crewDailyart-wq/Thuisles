/**
 * Een minsom bij een plaatje: er schuiven er vanzelf een paar weg.
 *
 * Het kind ziet bijvoorbeeld negen vogels, en daarna vliegen er drie weg. Het
 * kijkt alleen — de computer doet het voor — en schrijft daarna op wat het
 * zag: ▢ − ▢ = ▢.
 *
 * Dat opschrijven is de stap van zien naar rekenen: het kind leert dat wat er
 * op het scherm gebeurt precies die ene som is. Elke som van dit type is
 * daarom visueel.
 */

import {
  heelGetal,
  kansGenerator,
  type Generator,
  type Gegenereerd,
  type Instellingen,
  bepaalVraagtekst,
  vraagtekstVelden,
} from "@/lib/generatoren/soort";
import type { Leeftijdsgroep } from "@/lib/generatoren/foutpatroon";
import { plaatjesReeks, plaatjesVeld } from "@/lib/generatoren/plaatjeskeuze";
import { heelGetalBovenaan } from "@/lib/generatoren/bovenaan";
import { erafPatronen } from "@/lib/generatoren/patronen/erafsommen";
import { minsomplaatjeAanpak } from "@/lib/generatoren/aanpak/erafsommen";
import { minsomplaatjeUitleg } from "@/lib/generatoren/scripts/erafsommen";
import { grenzen as wegstrepenGrenzen, paren } from "@/lib/generatoren/wegstrepen";

const ZIN = "Vul de som in.";

const STANDAARDZINNEN: Record<Leeftijdsgroep, string> = { "34": ZIN, "56": ZIN, "78": ZIN };

const MAX_TOTAAL = 20;

/** Dezelfde grenzen als bij Wegstrepen; de opdracht verschilt, de getallen niet. */
export function grenzen(inst: Instellingen) {
  return wegstrepenGrenzen(inst);
}

export const minsomplaatjeGenerator: Generator = {
  id: "minsomplaatje",
  naam: "Een minsom bij een plaatje",
  uitleg:
    "Een groep voorwerpen waar er een paar vanzelf wegschuiven. Het kind kijkt en vult daarna de hele som in: ▢ − ▢ = ▢. Elke som is visueel.",
  suggestie: "Groep 4: 6 tot en met 15 voorwerpen, hoogstens 5 eraf",
  velden: [
    { soort: "getal", sleutel: "van", label: "Minste voorwerpen", min: 2, max: MAX_TOTAAL },
    { soort: "getal", sleutel: "tot", label: "Meeste voorwerpen", min: 2, max: MAX_TOTAAL },
    {
      soort: "getal",
      sleutel: "afTot",
      label: "Hoogstens hoeveel eraf",
      min: 1,
      max: 10,
      hulp: "Er gaat er altijd minstens één weg, en nooit meer dan er staan.",
    },
    plaatjesVeld,
    ...vraagtekstVelden(STANDAARDZINNEN, {
      voorbeeldzinnen: { "34": ZIN, "56": ZIN, "78": ZIN },
      extraHulp: "De getallen staan in het plaatje; de zin hoeft ze niet te herhalen.",
    }),
  ],
  vraagteksten: { standaard: STANDAARDZINNEN },
  standaard: { van: 6, tot: 15, afTot: 5, plaatjes: [] },
  foutpatronen: erafPatronen,
  aanpak: minsomplaatjeAanpak,
  uitleganimatie: minsomplaatjeUitleg,

  maximum: (inst) => {
    const { van, tot, afTot } = grenzen(inst);
    return paren(van, tot, afTot).length;
  },

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const { van, tot, afTot, plaatjes } = grenzen(inst);
    const mogelijk = paren(van, tot, afTot);
    if (mogelijk.length === 0) return [];
    const reeks = plaatjesReeks(kans, plaatjes);

    const uit: Gegenereerd[] = [];
    for (let poging = 0; poging < aantal * 300 && uit.length < aantal; poging++) {
      /* Vooral grote getallen; zie `heelGetalBovenaan`. */
      const totaal = heelGetalBovenaan(kans, van, tot);
      const eraf = heelGetal(kans, 1, Math.min(afTot, totaal));

      const handtekening = `minsomplaatje:${totaal}-${eraf}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const gegevens = {
        soort: "minsomplaatje",
        variant: "plaatjes",
        getallen: [totaal, eraf],
        goed: totaal - eraf,
      };

      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(minsomplaatjeGenerator, inst, groep, gegevens),
        /* De hele som, in de volgorde waarin de vakjes op het scherm staan. */
        antwoord: `${totaal},${eraf},${totaal - eraf}`,
        figuur: {
          soort: "minsomplaatje",
          totaal,
          eraf,
          voorwerp: reeks[uit.length % reeks.length],
        },
        somgegevens: gegevens,
      });
    }

    return uit;
  },
};
