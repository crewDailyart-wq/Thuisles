/**
 * Denk aan het rekenrek: de kale som over de tien, zonder rek erbij.
 *
 * 14 − 8 = ▢, en verder niets op het scherm. Het kind moet het rekenrek nu in
 * zijn hoofd hebben: eerst naar de tien, dan de rest. Gaat het mis, dan speelt
 * het rek de som alsnog voor in de uitleg, met de twee tussenstappen erbij.
 *
 * Dit is de laatste stap van het onderwerp: hetzelfde rekenen, maar zonder
 * materiaal.
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
import { rekenrekPatronen } from "@/lib/generatoren/patronen/rekenrek";
import { viaTienAanpak } from "@/lib/generatoren/aanpak/rekenrek";
import { viaTienUitleg } from "@/lib/generatoren/scripts/rekenrek";
import { pastBijStand } from "@/lib/generatoren/rekenrekaf";

const ZIN = "Hoeveel is {som}?";

const STANDAARDZINNEN: Record<Leeftijdsgroep, string> = { "34": ZIN, "56": ZIN, "78": ZIN };

const MAX_GETAL = 20;

export function grenzen(inst: Instellingen) {
  const van = Math.max(2, Math.min(MAX_GETAL, getal(inst, "van", 11)));
  const tot = Math.max(van, Math.min(MAX_GETAL, getal(inst, "tot", 19)));
  const afVan = Math.max(1, Math.min(9, getal(inst, "afVan", 2)));
  const afTot = Math.max(afVan, Math.min(9, getal(inst, "afTot", 9)));
  return { van, tot, afVan, afTot };
}

/** Alle sommen die over de tien heen gaan binnen deze grenzen. */
export function sommen(van: number, tot: number, afVan: number, afTot: number): [number, number][] {
  const uit: [number, number][] = [];
  for (let a = van; a <= tot; a++) {
    for (let af = afVan; af <= afTot; af++) {
      if (pastBijStand("via10", a, af)) uit.push([a, af]);
    }
  }
  return uit;
}

export const rekenrekhoofdGenerator: Generator = {
  id: "rekenrekhoofd",
  naam: "Denk aan het rekenrek",
  uitleg:
    "De kale som over de tien: 14 − 8 = ▢, zonder rekenrek erbij. Bij een fout antwoord speelt het rek de som alsnog voor, met de twee tussenstappen.",
  suggestie: "Groep 4: begingetal 11 tot en met 19, 2 tot en met 9 eraf",
  velden: [
    { soort: "getal", sleutel: "van", label: "Kleinste begingetal", min: 2, max: MAX_GETAL },
    { soort: "getal", sleutel: "tot", label: "Grootste begingetal", min: 2, max: MAX_GETAL },
    { soort: "getal", sleutel: "afVan", label: "Minste eraf", min: 1, max: 9 },
    {
      soort: "getal",
      sleutel: "afTot",
      label: "Meeste eraf",
      min: 1,
      max: 9,
      hulp: "Alleen sommen die over de tien heen gaan komen eruit; de uitkomst blijft onder tien en nooit onder nul.",
    },
    ...vraagtekstVelden(STANDAARDZINNEN, {
      voorbeeldzinnen: {
        "34": "Hoeveel is 14 − 8?",
        "56": "Hoeveel is 14 − 8?",
        "78": "Hoeveel is 14 − 8?",
      },
      extraHulp: "Op de plek van {som} komt de som zelf te staan.",
    }),
  ],
  vraagteksten: {
    standaard: STANDAARDZINNEN,
    som: (s) => `${s.getallen[0]} − ${s.getallen[1]}`,
  },
  standaard: { van: 11, tot: 19, afVan: 2, afTot: 9 },
  foutpatronen: rekenrekPatronen,
  aanpak: viaTienAanpak,
  uitleganimatie: viaTienUitleg,

  maximum: (inst) => {
    const { van, tot, afVan, afTot } = grenzen(inst);
    return sommen(van, tot, afVan, afTot).length;
  },

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const { van, tot, afVan, afTot } = grenzen(inst);
    const mogelijk = sommen(van, tot, afVan, afTot);
    if (mogelijk.length === 0) return [];

    const uit: Gegenereerd[] = [];
    for (let poging = 0; poging < aantal * 300 && uit.length < aantal; poging++) {
      const [begin, af] = mogelijk[heelGetal(kans, 0, mogelijk.length - 1)];

      const handtekening = `rekenrekhoofd:${begin}-${af}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const gegevens = {
        soort: "rekenrekhoofd",
        variant: "via10",
        getallen: [begin, af],
        goed: begin - af,
      };

      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(rekenrekhoofdGenerator, inst, groep, gegevens),
        antwoord: String(begin - af),
        figuur: { soort: "rekenrekhoofd", van: begin, af },
        somgegevens: gegevens,
      });
    }

    return uit;
  },
};
