/**
 * Aanvullen in de tabel.
 *
 * Bovenaan vier getallen die met één oplopen, elk in een geel vakje. Eronder
 * een leeg vakje: wat moet erbij om aan het doelgetal te komen? Omdat de
 * getallen bovenin met één oplopen, lopen de antwoorden met één af — dat is
 * voor een kind meteen de controle op zijn eigen werk.
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
import { aanvultabelAanpak } from "@/lib/generatoren/aanpak/optelopdrachten";
import { aanvultabelUitleg } from "@/lib/generatoren/scripts/optelopdrachten";

const ZIN = "Vul aan tot {som}.";

const STANDAARDZINNEN: Record<Leeftijdsgroep, string> = { "34": ZIN, "56": ZIN, "78": ZIN };

const KOLOMMEN = 4;

export function grenzen(inst: Instellingen) {
  const van = Math.max(KOLOMMEN + 1, Math.min(20, getal(inst, "van", 11)));
  const tot = Math.max(van, Math.min(20, getal(inst, "tot", 20)));
  return { van, tot };
}

export const aanvultabelGenerator: Generator = {
  id: "aanvultabel",
  naam: "Aanvullen in de tabel",
  uitleg:
    "Vier opeenvolgende getallen op een rij, met onder elk getal een leeg vakje. Het kind vult aan tot het doelgetal.",
  suggestie: "Groep 4: doelgetal 11 tot en met 20",
  velden: [
    { soort: "getal", sleutel: "van", label: "Kleinste doelgetal", min: KOLOMMEN + 1, max: 20 },
    { soort: "getal", sleutel: "tot", label: "Grootste doelgetal", min: KOLOMMEN + 1, max: 20 },
    ...vraagtekstVelden(STANDAARDZINNEN, {
      voorbeeldzinnen: { "34": "Vul aan tot 16.", "56": "Vul aan tot 16.", "78": "Vul aan tot 16." },
      extraHulp: "Op de plek van {som} komt het doelgetal van die vraag.",
    }),
  ],
  vraagteksten: {
    standaard: STANDAARDZINNEN,
    som: (s) => String(s.getallen[0] ?? s.goed),
  },
  standaard: { van: 11, tot: 20 },
  foutpatronen: optelPatronen,
  aanpak: aanvultabelAanpak,
  uitleganimatie: aanvultabelUitleg,

  /* Per doelgetal alle startgetallen waarbij de vier kolommen eronder blijven. */
  maximum: (inst) => {
    const { van, tot } = grenzen(inst);
    let totaal = 0;
    for (let d = van; d <= tot; d++) totaal += Math.max(0, d - KOLOMMEN);
    return totaal;
  },

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const { van, tot } = grenzen(inst);

    const uit: Gegenereerd[] = [];
    for (let poging = 0; poging < aantal * 300 && uit.length < aantal; poging++) {
      const doel = heelGetal(kans, van, tot);
      /* Het laatste getal moet nog onder het doelgetal blijven. */
      const eerste = heelGetal(kans, 0, doel - KOLOMMEN);
      const getallen = Array.from({ length: KOLOMMEN }, (_, i) => eerste + i);

      const handtekening = `aanvultabel:${doel}:${eerste}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const gegevens = {
        soort: "aanvultabel",
        variant: "tabel",
        getallen: [doel, eerste],
        goed: doel - eerste,
        extra: { kolommen: KOLOMMEN },
      };

      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(aanvultabelGenerator, inst, groep, gegevens),
        /* Eén getal per kolom, van links naar rechts. */
        antwoord: getallen.map((n) => doel - n).join(","),
        figuur: { soort: "aanvultabel", doel, getallen },
        somgegevens: gegevens,
      });
    }

    return uit;
  },
};
