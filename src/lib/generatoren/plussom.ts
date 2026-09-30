/**
 * De kale plussom: 4 + 3 = ▢.
 *
 * Geen plaatjes meer, alleen de getallen. Dit is de stap na het tellen: het
 * kind moet het antwoord nu uit zijn hoofd of met doortellen vinden.
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
import { optelPatronen } from "@/lib/generatoren/patronen/optelopdrachten";
import { plussomAanpak } from "@/lib/generatoren/aanpak/optelopdrachten";
import { plussomUitleg } from "@/lib/generatoren/scripts/optelopdrachten";

const ZIN = "Vul in.";

const STANDAARDZINNEN: Record<Leeftijdsgroep, string> = { "34": ZIN, "56": ZIN, "78": ZIN };

export function grenzen(inst: Instellingen) {
  const van = Math.max(2, Math.min(20, getal(inst, "van", 2)));
  const tot = Math.max(van, Math.min(20, getal(inst, "tot", 10)));
  return { van, tot };
}

export const plussomGenerator: Generator = {
  id: "plussom",
  naam: "Optellen — kale som",
  uitleg: "De som zonder plaatjes: twee getallen en een leeg vakje voor de uitkomst.",
  suggestie: "Groep 4: uitkomst 2 tot en met 10, daarna 11 tot en met 20",
  velden: [
    { soort: "getal", sleutel: "van", label: "Kleinste uitkomst", min: 2, max: 20 },
    { soort: "getal", sleutel: "tot", label: "Grootste uitkomst", min: 2, max: 20 },
    ...vraagtekstVelden(STANDAARDZINNEN),
  ],
  vraagteksten: { standaard: STANDAARDZINNEN },
  standaard: { van: 2, tot: 10 },
  foutpatronen: optelPatronen,
  aanpak: plussomAanpak,
  uitleganimatie: plussomUitleg,

  maximum: (inst) => {
    const { van, tot } = grenzen(inst);
    let totaal = 0;
    for (let n = van; n <= tot; n++) totaal += n - 1;
    return totaal;
  },

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const { van, tot } = grenzen(inst);

    const uit: Gegenereerd[] = [];
    for (let poging = 0; poging < aantal * 300 && uit.length < aantal; poging++) {
      const n = heelGetal(kans, van, tot);
      const a = heelGetal(kans, 1, n - 1);
      const b = n - a;

      const handtekening = `plussom:${a}+${b}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const gegevens = { soort: "plussom", variant: "kaal", getallen: [a, b], goed: n };

      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(plussomGenerator, inst, groep, gegevens),
        antwoord: String(n),
        figuur: { soort: "plussom", eerste: a, tweede: b },
        somgegevens: gegevens,
      });
    }

    return uit;
  },
};
