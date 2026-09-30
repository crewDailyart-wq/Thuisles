/**
 * Zoek de som die evenveel is.
 *
 * Bovenaan staat één som. Daaronder vier kaartjes: precies één daarvan heeft
 * dezelfde uitkomst, maar het is nooit dezelfde som — het kind moet dus echt
 * uitrekenen en kan niet op het beeld afgaan. De andere drie zitten er één of
 * twee naast.
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
import { evenveelsomAanpak } from "@/lib/generatoren/aanpak/optelopdrachten";
import { evenveelsomUitleg } from "@/lib/generatoren/scripts/optelopdrachten";

const ZIN = "Welke som is evenveel?";

const STANDAARDZINNEN: Record<Leeftijdsgroep, string> = { "34": ZIN, "56": ZIN, "78": ZIN };

const KAARTEN = 4;

export function grenzen(inst: Instellingen) {
  const van = Math.max(3, Math.min(20, getal(inst, "van", 4)));
  const tot = Math.max(van, Math.min(20, getal(inst, "tot", 20)));
  return { van, tot };
}

export const evenveelsomGenerator: Generator = {
  id: "evenveelsom",
  naam: "Zoek de som die evenveel is",
  uitleg:
    "Eén som bovenaan en vier kaartjes eronder. Precies één kaartje heeft dezelfde uitkomst, maar het is een andere som.",
  suggestie: "Groep 4: uitkomst 4 tot en met 20",
  velden: [
    { soort: "getal", sleutel: "van", label: "Kleinste uitkomst", min: 3, max: 20 },
    { soort: "getal", sleutel: "tot", label: "Grootste uitkomst", min: 3, max: 20 },
    ...vraagtekstVelden(STANDAARDZINNEN),
  ],
  vraagteksten: { standaard: STANDAARDZINNEN },
  standaard: { van: 4, tot: 20 },
  foutpatronen: optelPatronen,
  aanpak: evenveelsomAanpak,
  uitleganimatie: evenveelsomUitleg,

  maximum: (inst) => {
    const { van, tot } = grenzen(inst);
    return (tot - van + 1) * 30;
  },

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const { van, tot } = grenzen(inst);

    const uit: Gegenereerd[] = [];
    for (let poging = 0; poging < aantal * 400 && uit.length < aantal; poging++) {
      /* Een uitkomst waar minstens twee verschillende splitsingen bij passen. */
      const n = heelGetal(kans, Math.max(van, 3), tot);
      const eerste = heelGetal(kans, 1, n - 1);
      const tweede = n - eerste;

      /* Het goede kaartje: dezelfde uitkomst, maar een andere splitsing. */
      let ander = heelGetal(kans, 1, n - 1);
      for (let ronde = 0; ronde < 20 && (ander === eerste || ander === tweede); ronde++) {
        ander = heelGetal(kans, 1, n - 1);
      }
      if (ander === eerste || ander === tweede) continue;

      const kaarten = [{ eerste: ander, tweede: n - ander }];
      const gebruikt = new Set([`${eerste}+${tweede}`, `${ander}+${n - ander}`]);

      /* En drie kaartjes die er net naast zitten. */
      for (let ronde = 0; ronde < 80 && kaarten.length < KAARTEN; ronde++) {
        const mis = heelGetal(kans, 1, 2) * (kans() < 0.5 ? -1 : 1);
        const doel = n + mis;
        if (doel < 2 || doel > 20) continue;
        const a = heelGetal(kans, 1, doel - 1);
        const sleutel = `${a}+${doel - a}`;
        if (gebruikt.has(sleutel)) continue;
        gebruikt.add(sleutel);
        kaarten.push({ eerste: a, tweede: doel - a });
      }
      if (kaarten.length < KAARTEN) continue;

      const gehusseld = husselen(kans, kaarten);
      const goedeKaart = gehusseld.findIndex((k) => k.eerste + k.tweede === n);

      const handtekening = `evenveelsom:${eerste}+${tweede}:${gehusseld
        .map((k) => `${k.eerste}+${k.tweede}`)
        .join("|")}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const gegevens = {
        soort: "evenveelsom",
        variant: "kaartjes",
        getallen: [eerste, tweede],
        goed: goedeKaart,
      };

      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(evenveelsomGenerator, inst, groep, gegevens),
        antwoord: String(goedeKaart),
        figuur: { soort: "evenveelsom", eerste, tweede, kaarten: gehusseld },
        somgegevens: gegevens,
      });
    }

    return uit;
  },
};
