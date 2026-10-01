/**
 * Koppel de minsom aan de uitkomst.
 *
 * Links een rijtje minsommen onder elkaar, rechts dezelfde uitkomsten door
 * elkaar. Het kind sleept elke uitkomst naar de som waar hij bij hoort —
 * dezelfde bediening als bij "Verdelen in twee groepen" en bij het koppelen
 * van plussommen, dus slepen én tikken werkt.
 *
 * Alle uitkomsten zijn verschillend. Dat is niet alleen makkelijker te
 * begrijpen, het maakt de opgave ook eerlijk: er is precies één goede
 * indeling.
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
import { erafPatronen } from "@/lib/generatoren/patronen/erafsommen";
import { minkoppelenAanpak } from "@/lib/generatoren/aanpak/erafsommen";
import { minkoppelenUitleg } from "@/lib/generatoren/scripts/erafsommen";

const ZIN = "Sleep de uitkomst naar de som.";

const STANDAARDZINNEN: Record<Leeftijdsgroep, string> = { "34": ZIN, "56": ZIN, "78": ZIN };

const MAX_GETAL = 20;

export function grenzen(inst: Instellingen) {
  const van = Math.max(0, Math.min(MAX_GETAL, getal(inst, "van", 1)));
  const tot = Math.max(van, Math.min(MAX_GETAL, getal(inst, "tot", 10)));
  const grootste = Math.max(tot, Math.min(MAX_GETAL, getal(inst, "grootste", 15)));
  const rijen = Math.max(3, Math.min(6, getal(inst, "rijen", 5)));
  return { van, tot, grootste, rijen: Math.min(rijen, tot - van + 1) };
}

export const minkoppelenGenerator: Generator = {
  id: "minkoppelen",
  naam: "Koppel de minsom aan de uitkomst",
  uitleg:
    "Links een rijtje minsommen, rechts de uitkomsten door elkaar. Het kind sleept elke uitkomst naar de goede som; tikken werkt ook.",
  suggestie: "Groep 4: uitkomsten 1 tot en met 10, getallen tot en met 15, vijf sommen",
  velden: [
    { soort: "getal", sleutel: "van", label: "Kleinste uitkomst", min: 0, max: MAX_GETAL },
    { soort: "getal", sleutel: "tot", label: "Grootste uitkomst", min: 0, max: MAX_GETAL },
    {
      soort: "getal",
      sleutel: "grootste",
      label: "Grootste getal in een som",
      min: 2,
      max: MAX_GETAL,
      hulp: "Het getal waar de som mee begint blijft hieronder; de uitkomst komt nooit onder nul.",
    },
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
  standaard: { van: 1, tot: 10, grootste: 15, rijen: 5 },
  foutpatronen: erafPatronen,
  aanpak: minkoppelenAanpak,
  uitleganimatie: minkoppelenUitleg,

  maximum: (inst) => {
    const { van, tot, rijen } = grenzen(inst);
    return Math.max(0, (tot - van + 1 - rijen + 1) * 50);
  },

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const { van, tot, grootste, rijen } = grenzen(inst);

    const uit: Gegenereerd[] = [];
    for (let poging = 0; poging < aantal * 400 && uit.length < aantal; poging++) {
      /* Verschillende uitkomsten, elk met een eigen minsom erbij. */
      const uitkomsten: number[] = [];
      for (let ronde = 0; ronde < 80 && uitkomsten.length < rijen; ronde++) {
        const n = heelGetal(kans, van, tot);
        if (!uitkomsten.includes(n)) uitkomsten.push(n);
      }
      if (uitkomsten.length < rijen) break;

      /* Het getal om vanaf te tellen blijft binnen het bereik. */
      const sommen = uitkomsten.map((n) => {
        const eerste = heelGetal(kans, Math.min(n + 1, grootste), grootste);
        return { eerste, tweede: eerste - n };
      });
      if (sommen.some((s) => s.tweede < 1 || s.eerste - s.tweede < 0)) continue;

      const handtekening = `minkoppelen:${sommen.map((s) => `${s.eerste}-${s.tweede}`).join("|")}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const gegevens = {
        soort: "minkoppelen",
        variant: "slepen",
        getallen: [sommen[0].eerste, sommen[0].tweede],
        goed: uitkomsten[0],
        extra: { rijen },
      };

      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(minkoppelenGenerator, inst, groep, gegevens),
        /* Per rij de uitkomst, van boven naar beneden. */
        antwoord: uitkomsten.join(","),
        figuur: { soort: "minkoppelen", sommen, keuzes: husselen(kans, uitkomsten) },
        somgegevens: gegevens,
      });
    }

    return uit;
  },
};
