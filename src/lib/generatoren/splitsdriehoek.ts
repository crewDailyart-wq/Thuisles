/**
 * De splitsdriehoek.
 *
 * Een driehoek met drie vakken erin en drie vakjes eromheen. Elk vakje buiten
 * de driehoek is de som van de twee vakken ernaast:
 *
 *              boven
 *        links   ▲   rechts
 *      linksonder   rechtsonder
 *              onder
 *
 *   links  = boven + linksonder
 *   rechts = boven + rechtsonder
 *   onder  = linksonder + rechtsonder
 *
 * ---------------------------------------------------------------------------
 * Altijd drie gegeven en drie in te vullen
 * ---------------------------------------------------------------------------
 * Gegeven zijn: boven, rechtsonder en het vakje onder de driehoek. Daarmee kan
 * het kind eerst linksonder uitrekenen (onder min rechtsonder) en daarna de
 * twee zijkanten optellen. Er is dus altijd precies één weg naar binnen, en
 * elke stap bouwt voort op de vorige — dat is wat deze opdracht oefent.
 *
 * Het antwoord is drie getallen: eerst linksonder, dan links, dan rechts.
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
import { splitsopdrachtPatronen } from "@/lib/generatoren/patronen/splitsopdrachten";
import { splitsdriehoekAanpak } from "@/lib/generatoren/aanpak/splitsopdrachten";
import { splitsdriehoekUitleg } from "@/lib/generatoren/scripts/splitsopdrachten";

/*
  Zo kort mogelijk, en bij alle invulopdrachten van dit domein dezelfde zin:
  wát er moet gebeuren is aan de tekening zelf te zien, en een kind van zeven
  leest de regel erboven toch maar één keer.
*/
/* Hier hoort wél een woord bij: optellen is de handeling van deze opdracht. */
const ZIN = "Tel op en vul in.";

const STANDAARDZINNEN: Record<Leeftijdsgroep, string> = {
  "34": ZIN,
  "56": ZIN,
  "78": ZIN,
};

const MIN_TOT = 6;
const MAX_TOT = 100;

export function grenzen(inst: Instellingen) {
  const tot = Math.max(MIN_TOT, Math.min(MAX_TOT, getal(inst, "tot", 20)));
  const van = Math.max(MIN_TOT, Math.min(tot, getal(inst, "van", 6)));
  return { van, tot };
}

export const splitsdriehoekGenerator: Generator = {
  id: "splitsdriehoek",
  naam: "Splitsdriehoek",
  uitleg:
    "Een driehoek met drie vakken en drie vakjes eromheen. Elk vakje buiten de driehoek is de som van de twee vakken ernaast. Drie getallen zijn gegeven, drie vult het kind in.",
  suggestie: "Groep 4: zijden tot en met 20",
  velden: [
    {
      soort: "getal",
      sleutel: "van",
      label: "Kleinste zijde",
      min: MIN_TOT,
      max: MAX_TOT,
      hulp: "De kleinste som die buiten de driehoek mag staan.",
    },
    {
      soort: "getal",
      sleutel: "tot",
      label: "Grootste zijde",
      min: MIN_TOT,
      max: MAX_TOT,
      hulp: "Geen van de drie sommen buiten de driehoek komt hierboven.",
    },
    ...vraagtekstVelden(STANDAARDZINNEN),
  ],
  vraagteksten: {
    standaard: STANDAARDZINNEN,
    som: (s) => String(s.getallen[0] ?? s.goed),
  },
  standaard: { van: 6, tot: 20 },
  foutpatronen: splitsopdrachtPatronen,
  aanpak: splitsdriehoekAanpak,
  uitleganimatie: splitsdriehoekUitleg,

  /*
    Hoeveel verschillende driehoeken er passen: elk drietal vakken waarvan alle
    drie de sommen binnen het bereik vallen. Dat telt hier gewoon uit.
  */
  maximum: (inst) => {
    const { van, tot } = grenzen(inst);
    let totaal = 0;
    for (let a = 1; a <= tot; a++) {
      for (let b = 1; b <= tot; b++) {
        for (let c = 1; c <= tot; c++) {
          const zijden = [a + b, a + c, b + c];
          if (zijden.every((z) => z >= van && z <= tot)) totaal++;
        }
      }
    }
    return totaal;
  },

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const { van, tot } = grenzen(inst);

    const uit: Gegenereerd[] = [];
    for (let poging = 0; poging < aantal * 400 && uit.length < aantal; poging++) {
      /* De drie vakken binnen de driehoek. */
      const boven = heelGetal(kans, 1, Math.floor(tot / 2));
      const linksonder = heelGetal(kans, 1, Math.floor(tot / 2));
      const rechtsonder = heelGetal(kans, 1, Math.floor(tot / 2));

      const links = boven + linksonder;
      const rechts = boven + rechtsonder;
      const onder = linksonder + rechtsonder;
      if ([links, rechts, onder].some((z) => z < van || z > tot)) continue;

      const handtekening = `splitsdriehoek:${boven}-${linksonder}-${rechtsonder}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const gegevens = {
        soort: "splitsdriehoek",
        variant: "eenvoudig",
        /* De zijde waar twee van de drie bekend zijn, en het bekende vak. */
        getallen: [onder, rechtsonder],
        goed: linksonder,
        extra: { boven, links, rechts },
      };

      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(splitsdriehoekGenerator, inst, groep, gegevens),
        /* Eerst linksonder, dan links, dan rechts. */
        antwoord: `${linksonder},${links},${rechts}`,
        figuur: {
          soort: "splitsdriehoek",
          boven,
          rechtsonder,
          onder,
          linksonder: null,
          links: null,
          rechts: null,
        },
        somgegevens: gegevens,
      });
    }

    return uit;
  },
};
