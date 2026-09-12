/**
 * Optelsommen binnen een gekozen bereik, met of zonder tientaloverschrijding,
 * en met twee of drie getallen.
 */

import {
  heelGetal,
  kansGenerator,
  meerkeuze,
  tekst,
  vinkje,
  type Generator,
  type Gegenereerd,
  bepaalVraagtekst,
  vraagtekstVelden,
  leeftijdsgroepVanGroep,
} from "@/lib/generatoren/soort";
import type { Leeftijdsgroep } from "@/lib/generatoren/foutpatroon";
import { optellenPatronen } from "@/lib/generatoren/patronen/optellen";
import { optellenAanpak } from "@/lib/generatoren/aanpak/optellen";
import { nogGeenUitleg } from "@/lib/generatoren/scripts/nogniet";

export const BEREIKEN = [
  { waarde: "10", label: "tot 10" },
  { waarde: "20", label: "tot 20" },
  { waarde: "100", label: "tot 100" },
  { waarde: "1000", label: "tot 1000" },
];

/** Gaat de som over een tiental heen? 8 + 5 wel, 8 + 1 niet. */
export function overHetTiental(getallen: number[]): boolean {
  let tot = 0;
  for (const n of getallen) {
    const vorig = tot;
    tot += n;
    if (Math.floor(vorig / 10) !== Math.floor(tot / 10) && vorig % 10 !== 0) return true;
  }
  return false;
}

/** De standaardzinnen van dit type. Per sjabloon aan te passen in het beheer. */
const STANDAARDZINNEN: Record<Leeftijdsgroep, string> = {
  "34": "Hoeveel is {som}?",
  "56": "Hoeveel is {som}?",
  "78": "Reken uit: {som}",
};

export const optellenGenerator: Generator = {
  id: "optellen",
  naam: "Optellen",
  uitleg: "Optelsommen binnen een bereik dat je kiest.",
  suggestie: "Groep 3: tot 10 of 20 · groep 4: tot 100 · groep 6: tot 1000",
  velden: [
    { soort: "keuze", sleutel: "bereik", label: "Bereik", opties: BEREIKEN },
    {
      soort: "keuze",
      sleutel: "tiental",
      label: "Over het tiental",
      opties: [
        { waarde: "beide", label: "Maakt niet uit" },
        { waarde: "wel", label: "Alleen sommen die eroverheen gaan" },
        { waarde: "niet", label: "Alleen sommen die eronder blijven" },
      ],
      hulp: "8 + 5 gaat over het tiental heen, 8 + 1 niet.",
    },
    { soort: "vinkje", sleutel: "drie", label: "Drie getallen in plaats van twee" },
    {
      soort: "keuze",
      sleutel: "antwoordvorm",
      label: "Antwoordvorm",
      opties: [
        { waarde: "open", label: "Zelf intypen" },
        { waarde: "meerkeuze", label: "Meerkeuze (vier antwoorden)" },
      ],
    },
    /* Overal dezelfde vier velden om de vraagzin aan te passen. */
    ...vraagtekstVelden(STANDAARDZINNEN),
  ],
  vraagteksten: {
    standaard: STANDAARDZINNEN,
    som: (s) => s.getallen.join(" + "),
  },
  standaard: { bereik: "20", tiental: "beide", drie: false, antwoordvorm: "open" },
  foutpatronen: optellenPatronen,
  aanpak: optellenAanpak,
  uitleganimatie: nogGeenUitleg(["twintigveld", "lege getallenlijn"]),

  maximum: () => null,

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const leeftijd = leeftijdsgroepVanGroep(groep);
    const kans = kansGenerator(zaad);
    const grens = Number(tekst(inst, "bereik", "20"));
    const eis = tekst(inst, "tiental", "beide");
    const drie = vinkje(inst, "drie");
    const meerkeuzeVorm = inst.antwoordvorm === "meerkeuze";

    const aantalGetallen = drie ? 3 : 2;
    /*
      Vanaf bereik 20 is elk getal minstens 2. Anders komen er sommen uit als
      "97 + 1 + 1": rekenkundig kloppend, maar er valt niets te oefenen.
    */
    const kleinste = grens >= 20 ? 2 : 1;

    const uit: Gegenereerd[] = [];
    // Ruime marge aan pogingen: sommige combinaties vallen af door de eisen.
    for (let poging = 0; poging < aantal * 200 && uit.length < aantal; poging++) {
      /*
        Eerst de uitkomst kiezen en die daarna verdelen. Dat geeft veel meer
        evenwichtige sommen dan getal voor getal trekken, waarbij het eerste
        getal bijna het hele bereik opsnoept.
      */
      /*
        De uitkomst ligt in de bovenste twee derde van het bereik. Kies je
        "tot 100", dan wil je geen sommen als 2 + 2 + 3 — die horen bij een
        kleiner bereik.
      */
      const laagste = Math.max(kleinste * aantalGetallen, Math.floor(grens / 3));
      const som = heelGetal(kans, laagste, grens);
      const getallen: number[] = [];
      let rest = som;

      for (let i = 0; i < aantalGetallen - 1; i++) {
        const nogNodig = kleinste * (aantalGetallen - i - 1);
        const n = heelGetal(kans, kleinste, rest - nogNodig);
        getallen.push(n);
        rest -= n;
      }
      getallen.push(rest);

      if (getallen.some((n) => n < kleinste)) continue;

      const gaatOver = overHetTiental(getallen);
      if (eis === "wel" && !gaatOver) continue;
      if (eis === "niet" && gaatOver) continue;

      const handtekening = `optellen:${getallen.join("+")}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      uit.push({
        handtekening,
        vraagtekst: bepaalVraagtekst(optellenGenerator, inst, leeftijd, {
          soort: "optellen",
          getallen,
          goed: som,
        }),
        somgegevens: { soort: "optellen", getallen, goed: som },
        ...(meerkeuzeVorm
          ? { vorm: "meerkeuze" as const, ...meerkeuze(som, kans) }
          : { vorm: "open" as const, antwoord: String(som) }),
      });
    }

    return uit;
  },
};
