/**
 * Optellen via tien.
 *
 * De som staat er in twee stappen: 7 + 7 = 10 + ▢ = ▢. Het kind vult eerst in
 * hoeveel er na de tien nog overblijft en daarna de uitkomst. Dat is de manier
 * waarop op school over het tiental heen wordt gerekend: eerst aanvullen tot
 * tien, dan de rest erbij.
 *
 * Het eerste getal is daarom altijd 6 tot en met 9 — bij kleinere getallen valt
 * er niets aan te vullen — en de som gaat altijd echt over de tien heen.
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
import { viatienAanpak } from "@/lib/generatoren/aanpak/optelopdrachten";
import { viatienUitleg } from "@/lib/generatoren/scripts/optelopdrachten";
import { omEnOm, optelwerking, werkingVeld } from "@/lib/generatoren/optelwerking";

const ZIN = "Reken via 10.";

const STANDAARDZINNEN: Record<Leeftijdsgroep, string> = { "34": ZIN, "56": ZIN, "78": ZIN };

export function grenzen(inst: Instellingen) {
  const van = Math.max(11, Math.min(20, getal(inst, "van", 11)));
  const tot = Math.max(van, Math.min(20, getal(inst, "tot", 18)));
  return { van, tot };
}

/** Alle sommen die echt over de tien heen gaan, binnen het bereik. */
function sommen(van: number, tot: number): [number, number][] {
  const uit: [number, number][] = [];
  for (let a = 6; a <= 9; a++) {
    for (let b = 2; b <= 9; b++) {
      const n = a + b;
      if (n <= 10 || n < van || n > tot) continue;
      uit.push([a, b]);
    }
  }
  return uit;
}

export const viatienGenerator: Generator = {
  id: "viatien",
  naam: "Optellen via tien",
  uitleg:
    "De som in twee stappen: 7 + 7 = 10 + ▢ = ▢. Eerst aanvullen tot tien, dan de rest erbij — de manier waarop op school over het tiental wordt gerekend.",
  suggestie: "Groep 4: uitkomst 11 tot en met 18",
  velden: [
    { soort: "getal", sleutel: "van", label: "Kleinste uitkomst", min: 11, max: 20 },
    { soort: "getal", sleutel: "tot", label: "Grootste uitkomst", min: 11, max: 20 },
    werkingVeld("Om en om zelf bouwen met de tienstrook"),
    ...vraagtekstVelden(STANDAARDZINNEN),
  ],
  vraagteksten: { standaard: STANDAARDZINNEN },
  standaard: { van: 11, tot: 18 },
  foutpatronen: optelPatronen,
  aanpak: viatienAanpak,
  uitleganimatie: viatienUitleg,

  maximum: (inst) => {
    const { van, tot } = grenzen(inst);
    return sommen(van, tot).length;
  },

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const { van, tot } = grenzen(inst);
    const mogelijk = sommen(van, tot);
    if (mogelijk.length === 0) return [];
    const werking = optelwerking(inst);

    /*
      Om en om: vijf sommen met de tienstrook, vijf zulke sommen zonder, en dan
      nog vijf. Binnen elk deel van klein naar groot.
    */
    if (werking === "bouwen") {
      const opTotaal = (x: [number, number], y: [number, number]) => x[0] + x[1] - (y[0] + y[1]) || x[0] - y[0];
      const gehusseld = husselen(kans, mogelijk);
      const tien = gehusseld.slice(0, 10).sort(opTotaal);
      const reeks = omEnOm(
        tien.filter((_, i) => i % 2 === 0),
        tien.filter((_, i) => i % 2 === 1),
        gehusseld.slice(10, 15).sort(opTotaal),
      );
      const uit: Gegenereerd[] = [];
      for (const { som: [a, b], bouwen } of reeks) {
        if (uit.length >= aantal) break;
        const handtekening = `viatien:${a}+${b}`;
        if (alGebruikt.has(handtekening)) continue;
        alGebruikt.add(handtekening);
        const gegevens = { soort: "viatien", variant: "over-tien", getallen: [a, b], goed: a + b };
        uit.push({
          handtekening,
          vorm: "open",
          vraagtekst: bepaalVraagtekst(viatienGenerator, inst, groep, gegevens),
          antwoord: `${a + b - 10},${a + b}`,
          figuur: {
            soort: "viatien",
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

    const uit: Gegenereerd[] = [];
    for (let poging = 0; poging < aantal * 300 && uit.length < aantal; poging++) {
      const [a, b] = mogelijk[heelGetal(kans, 0, mogelijk.length - 1)];

      const handtekening = `viatien:${a}+${b}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const gegevens = { soort: "viatien", variant: "over-tien", getallen: [a, b], goed: a + b };

      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(viatienGenerator, inst, groep, gegevens),
        /* Eerst wat er na de tien overblijft, dan de uitkomst. */
        antwoord: `${a + b - 10},${a + b}`,
        figuur: { soort: "viatien", eerste: a, tweede: b, ...(werking === "hulp" ? { hulpBijFout: "strook" as const } : {}) },
        somgegevens: gegevens,
      });
    }

    return uit;
  },
};
