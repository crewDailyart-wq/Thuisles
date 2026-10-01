/**
 * De kale minsom: 13 − 5 = ▢.
 *
 * Bij de eerste sommen van de oefening staat het rekenrek erbij en schuift het
 * kind daar zelf de kralen weg; daarna staat alleen de som er nog. Hoeveel
 * sommen dat zijn staat in de instelling "Hoeveel sommen met het rekenrek".
 *
 * Nooit een uitkomst onder nul: er gaat er altijd minstens één af en nooit
 * meer dan er staan.
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
import { heelGetalBovenaan } from "@/lib/generatoren/bovenaan";
import { erafPatronen } from "@/lib/generatoren/patronen/erafsommen";
import { minsomAanpak } from "@/lib/generatoren/aanpak/erafsommen";
import { minsomUitleg } from "@/lib/generatoren/scripts/erafsommen";
import { VISUEEL_VELD, visueleSommen } from "@/lib/generatoren/visueel";

/*
  Hoeveel kralen er op het rekenrek zitten. Staat hier als getal en niet als
  import uit het tekenwerk: generatoren draaien ook in de controlescripts, en
  die laden geen schermonderdelen.
*/
const REKENREK_KRALEN = 20;

const ZIN = "Hoeveel is {som}?";

const STANDAARDZINNEN: Record<Leeftijdsgroep, string> = { "34": ZIN, "56": ZIN, "78": ZIN };

export function grenzen(inst: Instellingen) {
  const van = Math.max(2, Math.min(REKENREK_KRALEN, getal(inst, "van", 6)));
  const tot = Math.max(van, Math.min(REKENREK_KRALEN, getal(inst, "tot", 15)));
  const afTot = Math.max(1, Math.min(10, getal(inst, "afTot", 9)));
  return { van, tot, afTot, visueel: visueleSommen(inst) };
}

/** Alle sommen die bij deze instellingen kunnen. */
export function sommen(van: number, tot: number, afTot: number): [number, number][] {
  const uit: [number, number][] = [];
  for (let a = van; a <= tot; a++) {
    for (let af = 1; af <= Math.min(afTot, a); af++) uit.push([a, af]);
  }
  return uit;
}

export const minsomGenerator: Generator = {
  id: "minsom",
  naam: "Aftrekken (kale som)",
  uitleg:
    "De som staat er kaal: 13 − 5 = ▢. Bij de eerste sommen staat het rekenrek erbij en schuift het kind zelf de kralen weg; daarna rekent het uit het hoofd.",
  suggestie: "Groep 4: 6 tot en met 15, hoogstens 9 eraf, drie sommen met het rekenrek",
  velden: [
    {
      soort: "getal",
      sleutel: "van",
      label: "Kleinste getal om vanaf te tellen",
      min: 2,
      max: REKENREK_KRALEN,
    },
    {
      soort: "getal",
      sleutel: "tot",
      label: "Grootste getal om vanaf te tellen",
      min: 2,
      max: REKENREK_KRALEN,
      hulp: "Niet hoger dan twintig: meer kralen passen er niet op het rekenrek.",
    },
    {
      soort: "getal",
      sleutel: "afTot",
      label: "Hoogstens hoeveel eraf",
      min: 1,
      max: 10,
      hulp: "Er gaat er altijd minstens één af, en nooit meer dan er staan: de uitkomst komt dus nooit onder nul.",
    },
    { ...VISUEEL_VELD, label: "Hoeveel sommen met het rekenrek erbij" },
    ...vraagtekstVelden(STANDAARDZINNEN, {
      voorbeeldzinnen: {
        "34": "Hoeveel is 13 − 5?",
        "56": "Hoeveel is 13 − 5?",
        "78": "Hoeveel is 13 − 5?",
      },
      extraHulp: "Op de plek van {som} komt de som zelf te staan.",
    }),
  ],
  vraagteksten: {
    standaard: STANDAARDZINNEN,
    som: (s) => `${s.getallen[0]} − ${s.getallen[1]}`,
  },
  standaard: { van: 6, tot: 15, afTot: 9, visueel: 3 },
  foutpatronen: erafPatronen,
  aanpak: minsomAanpak,
  uitleganimatie: minsomUitleg,

  maximum: (inst) => {
    const { van, tot, afTot } = grenzen(inst);
    return sommen(van, tot, afTot).length;
  },

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const { van, tot, afTot, visueel } = grenzen(inst);
    const mogelijk = sommen(van, tot, afTot);
    if (mogelijk.length === 0) return [];

    const uit: Gegenereerd[] = [];
    for (let poging = 0; poging < aantal * 300 && uit.length < aantal; poging++) {
      /* Vooral grote getallen; zie `heelGetalBovenaan`. */
      const begin = heelGetalBovenaan(kans, van, tot);
      const af = heelGetal(kans, 1, Math.min(afTot, begin));

      const handtekening = `minsom:${begin}-${af}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const gegevens = {
        soort: "minsom",
        variant: "kaal",
        getallen: [begin, af],
        goed: begin - af,
      };

      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(minsomGenerator, inst, groep, gegevens),
        antwoord: String(begin - af),
        figuur: {
          soort: "minsom",
          van: begin,
          af,
          /* De eerste sommen van de oefening zijn die met het rekenrek. */
          visueel: uit.length < visueel,
        },
        somgegevens: gegevens,
      });
    }

    return uit;
  },
};
