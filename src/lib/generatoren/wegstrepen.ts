/**
 * Wegstrepen: een groep plaatjes waarvan er al een paar zijn doorgestreept.
 *
 * Het kind ziet bijvoorbeeld dertien appels in rijtjes van vijf, waarvan er
 * vijf een rood kruis hebben, en typt hoeveel er overblijven. Het streept zelf
 * niets weg; het kruis staat er al.
 *
 * Eraf is hier nog te zien in plaats van alleen uit te rekenen, en dat maakt
 * het de eerste stap van het domein.
 */

import {
  getal,
  heelGetal,
  kansGenerator,
  lijst,
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
import { wegstrepenAanpak } from "@/lib/generatoren/aanpak/erafsommen";
import { wegstrepenUitleg } from "@/lib/generatoren/scripts/erafsommen";

const ZIN = "Hoeveel blijven er over?";

const STANDAARDZINNEN: Record<Leeftijdsgroep, string> = { "34": ZIN, "56": ZIN, "78": ZIN };

/** Meer dan twintig plaatjes wordt een muur; dan valt er niets meer te zien. */
const MAX_TOTAAL = 20;

export function grenzen(inst: Instellingen) {
  const van = Math.max(2, Math.min(MAX_TOTAAL, getal(inst, "van", 6)));
  const tot = Math.max(van, Math.min(MAX_TOTAAL, getal(inst, "tot", 15)));
  const afTot = Math.max(1, Math.min(10, getal(inst, "afTot", 5)));
  return { van, tot, afTot, plaatjes: lijst(inst, "plaatjes", []) };
}

/** Alle paren die bij deze instellingen kunnen: nooit een uitkomst onder nul. */
export function paren(van: number, tot: number, afTot: number): [number, number][] {
  const uit: [number, number][] = [];
  for (let totaal = van; totaal <= tot; totaal++) {
    for (let eraf = 1; eraf <= Math.min(afTot, totaal); eraf++) uit.push([totaal, eraf]);
  }
  return uit;
}

export const wegstrepenGenerator: Generator = {
  id: "wegstrepen",
  naam: "Wegstrepen",
  uitleg:
    "Een groep voorwerpen in rijtjes van vijf, waarvan er al een paar zijn doorgestreept met een rood kruis. Het kind telt wat er overblijft en typt dat in.",
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
      hulp: "Er gaat er altijd minstens één af, en nooit meer dan er staan: de uitkomst komt dus nooit onder nul.",
    },
    plaatjesVeld,
    ...vraagtekstVelden(STANDAARDZINNEN, {
      voorbeeldzinnen: { "34": ZIN, "56": ZIN, "78": ZIN },
      extraHulp: "Hoeveel er doorgestreept zijn staat in het plaatje; de zin hoeft dat niet te herhalen.",
    }),
  ],
  vraagteksten: { standaard: STANDAARDZINNEN },
  standaard: { van: 6, tot: 15, afTot: 5, plaatjes: [] },
  foutpatronen: erafPatronen,
  aanpak: wegstrepenAanpak,
  uitleganimatie: wegstrepenUitleg,

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

      const handtekening = `wegstrepen:${totaal}-${eraf}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const gegevens = {
        soort: "wegstrepen",
        variant: "plaatjes",
        getallen: [totaal, eraf],
        goed: totaal - eraf,
      };

      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(wegstrepenGenerator, inst, groep, gegevens),
        antwoord: String(totaal - eraf),
        figuur: {
          soort: "wegstrepen",
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
