/**
 * De kale plussom: 4 + 3 = ▢.
 *
 * Geen plaatjes meer, alleen de getallen. Dit is de stap na het tellen: het
 * kind moet het antwoord nu uit zijn hoofd of met doortellen vinden.
 */

import {
  getal,
  heelGetal,
  husselen,
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
import { omEnOm, optelwerking, werkingVeld } from "@/lib/generatoren/optelwerking";

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
    werkingVeld("Om en om zelf bouwen met de tienstrook (sommen over het tiental)"),
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
    const werking = optelwerking(inst);
    if (werking === "bouwen") return maakOmEnOm(inst, aantal, alGebruikt, zaad, groep);
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
        figuur: { soort: "plussom", eerste: a, tweede: b, ...(werking === "hulp" ? { hulpBijFout: "strook" as const } : {}) },
        somgegevens: gegevens,
      });
    }

    return uit;
  },
};

/**
 * Om en om met de tienstrook. De bouwsommen en de sommen ernaast gaan over het
 * tiental (8 + 5): het eerste getal staat al in de strook, het kind zet het
 * tweede getal erbij, eerst de tien vol en dan de rest in de tweede rij. De
 * laatste vijf zijn gewone sommen uit het hele bereik. Elke opgave laat na een
 * fout antwoord de strook zien.
 */
function maakOmEnOm(
  inst: Instellingen,
  aantal: number,
  alGebruikt: Set<string>,
  zaad: number,
  groep: number,
): Gegenereerd[] {
  const kans = kansGenerator(zaad);
  const { van, tot } = grenzen(inst);
  const overTien: [number, number][] = [];
  const alle: [number, number][] = [];
  for (let n = van; n <= tot; n++) {
    for (let a = 1; a < n; a++) {
      alle.push([a, n - a]);
      if (n > 10 && a >= 2 && a <= 9 && n - a >= 2 && n - a <= 9) overTien.push([a, n - a]);
    }
  }
  const opTotaal = (x: [number, number], y: [number, number]) => x[0] + x[1] - (y[0] + y[1]) || x[0] - y[0];
  const tien = husselen(kans, overTien).slice(0, 10).sort(opTotaal);
  const gekozen = new Set(tien.map(([a, b]) => `${a}+${b}`));
  const rest = husselen(kans, alle.filter(([a, b]) => !gekozen.has(`${a}+${b}`))).slice(0, 5).sort(opTotaal);
  const reeks = omEnOm(
    tien.filter((_, i) => i % 2 === 0),
    tien.filter((_, i) => i % 2 === 1),
    rest,
  );

  const uit: Gegenereerd[] = [];
  for (const { som: [a, b], bouwen } of reeks) {
    if (uit.length >= aantal) break;
    const handtekening = `plussom:${a}+${b}`;
    if (alGebruikt.has(handtekening)) continue;
    alGebruikt.add(handtekening);
    const gegevens = { soort: "plussom", variant: "kaal", getallen: [a, b], goed: a + b };
    uit.push({
      handtekening,
      vorm: "open",
      vraagtekst: bepaalVraagtekst(plussomGenerator, inst, groep, gegevens),
      antwoord: String(a + b),
      figuur: {
        soort: "plussom",
        eerste: a,
        tweede: b,
        ...(bouwen ? { bouw: "strook" as const } : {}),
        hulpBijFout: "strook",
        volgnummer: uit.length + 1,
      },
      somgegevens: gegevens,
    });
  }
  return uit;
}
