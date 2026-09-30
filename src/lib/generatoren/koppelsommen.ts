/**
 * Koppel de som aan de uitkomst.
 *
 * Links vijf sommen onder elkaar, rechts dezelfde vijf uitkomsten door elkaar.
 * Het kind sleept elke uitkomst naar de som waar hij bij hoort — dezelfde
 * bediening als bij "Verdelen in twee groepen", dus slepen én tikken werkt.
 *
 * Alle vijf de uitkomsten zijn verschillend. Dat is niet alleen makkelijker te
 * begrijpen, het maakt de opgave ook eerlijk: er is precies één goede indeling.
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
import { koppelsommenAanpak } from "@/lib/generatoren/aanpak/optelopdrachten";
import { koppelsommenUitleg } from "@/lib/generatoren/scripts/optelopdrachten";

const ZIN = "Sleep de uitkomst naar de som.";

const STANDAARDZINNEN: Record<Leeftijdsgroep, string> = { "34": ZIN, "56": ZIN, "78": ZIN };

export function grenzen(inst: Instellingen) {
  const van = Math.max(2, Math.min(20, getal(inst, "van", 5)));
  const tot = Math.max(van, Math.min(20, getal(inst, "tot", 20)));
  const rijen = Math.max(3, Math.min(6, getal(inst, "rijen", 5)));
  return { van, tot, rijen: Math.min(rijen, tot - van + 1) };
}

export const koppelsommenGenerator: Generator = {
  id: "koppelsommen",
  naam: "Koppel de som aan de uitkomst",
  uitleg:
    "Links een rijtje sommen, rechts de uitkomsten door elkaar. Het kind sleept elke uitkomst naar de goede som; tikken werkt ook.",
  suggestie: "Groep 4: uitkomsten 5 tot en met 20, vijf rijen",
  velden: [
    { soort: "getal", sleutel: "van", label: "Kleinste uitkomst", min: 2, max: 20 },
    { soort: "getal", sleutel: "tot", label: "Grootste uitkomst", min: 2, max: 20 },
    {
      soort: "getal",
      sleutel: "rijen",
      label: "Hoeveel sommen",
      min: 3,
      max: 6,
      hulp: "Alle uitkomsten zijn verschillend, dus er passen er nooit meer dan er uitkomsten in het bereik zitten.",
    },
    ...vraagtekstVelden(STANDAARDZINNEN),
  ],
  vraagteksten: { standaard: STANDAARDZINNEN },
  standaard: { van: 5, tot: 20, rijen: 5 },
  foutpatronen: optelPatronen,
  aanpak: koppelsommenAanpak,
  uitleganimatie: koppelsommenUitleg,

  maximum: (inst) => {
    const { van, tot, rijen } = grenzen(inst);
    return Math.max(0, (tot - van + 1 - rijen + 1) * 50);
  },

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const { van, tot, rijen } = grenzen(inst);

    const uit: Gegenereerd[] = [];
    for (let poging = 0; poging < aantal * 400 && uit.length < aantal; poging++) {
      /* Vijf verschillende uitkomsten, elk met een eigen som erbij. */
      const uitkomsten: number[] = [];
      for (let ronde = 0; ronde < 80 && uitkomsten.length < rijen; ronde++) {
        const n = heelGetal(kans, van, tot);
        if (!uitkomsten.includes(n)) uitkomsten.push(n);
      }
      if (uitkomsten.length < rijen) break;

      const sommen = uitkomsten.map((n) => {
        const eerste = heelGetal(kans, 1, n - 1);
        return { eerste, tweede: n - eerste };
      });

      const handtekening = `koppelsommen:${sommen.map((s) => `${s.eerste}+${s.tweede}`).join("|")}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const gegevens = {
        soort: "koppelsommen",
        variant: "slepen",
        getallen: [sommen[0].eerste, sommen[0].tweede],
        goed: uitkomsten[0],
        extra: { rijen },
      };

      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(koppelsommenGenerator, inst, groep, gegevens),
        /* Per rij de uitkomst, van boven naar beneden. */
        antwoord: uitkomsten.join(","),
        figuur: { soort: "koppelsommen", sommen, keuzes: husselen(kans, uitkomsten) },
        somgegevens: gegevens,
      });
    }

    return uit;
  },
};
