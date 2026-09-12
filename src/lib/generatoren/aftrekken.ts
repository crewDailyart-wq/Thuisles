/**
 * Aftreksommen. Standaard nooit een uitkomst onder nul; dat kun je aanzetten.
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
import { BEREIKEN } from "@/lib/generatoren/optellen";
import { aftrekkenPatronen } from "@/lib/generatoren/patronen/aftrekken";
import { aftrekkenAanpak } from "@/lib/generatoren/aanpak/aftrekken";
import { nogGeenUitleg } from "@/lib/generatoren/scripts/nogniet";

/** Gaat de som over een tiental heen? 23 − 5 wel, 23 − 2 niet. */
function overHetTiental(van: number, af: number): boolean {
  return van % 10 < af % 10 || Math.floor((van - af) / 10) !== Math.floor(van / 10);
}

/** De standaardzinnen van dit type. Per sjabloon aan te passen in het beheer. */
const STANDAARDZINNEN: Record<Leeftijdsgroep, string> = {
  "34": "Hoeveel is {som}?",
  "56": "Hoeveel is {som}?",
  "78": "Reken uit: {som}",
};

export const aftrekkenGenerator: Generator = {
  id: "aftrekken",
  naam: "Aftrekken",
  uitleg: "Aftreksommen binnen een bereik dat je kiest.",
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
      hulp: "23 − 5 gaat over het tiental heen, 23 − 2 niet.",
    },
    { soort: "vinkje", sleutel: "drie", label: "Drie getallen in plaats van twee" },
    {
      soort: "vinkje",
      sleutel: "negatief",
      label: "Uitkomst onder nul toestaan",
      hulp: "Staat uit: een som als 3 − 8 komt er dan niet uit.",
    },
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
    som: (s) => `${s.getallen[0]} − ${s.getallen.slice(1).join(" − ")}`,
  },
  standaard: {
    bereik: "20",
    tiental: "beide",
    drie: false,
    negatief: false,
    antwoordvorm: "open",
  },
  foutpatronen: aftrekkenPatronen,
  aanpak: aftrekkenAanpak,
  uitleganimatie: nogGeenUitleg(["twintigveld", "lege getallenlijn"]),

  maximum: () => null,

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const leeftijd = leeftijdsgroepVanGroep(groep);
    const kans = kansGenerator(zaad);
    const grens = Number(tekst(inst, "bereik", "20"));
    const eis = tekst(inst, "tiental", "beide");
    const drie = vinkje(inst, "drie");
    const magNegatief = vinkje(inst, "negatief");
    const meerkeuzeVorm = inst.antwoordvorm === "meerkeuze";

    const uit: Gegenereerd[] = [];
    for (let poging = 0; poging < aantal * 200 && uit.length < aantal; poging++) {
      const van = heelGetal(kans, 2, grens);
      const aantalAf = drie ? 2 : 1;
      const af: number[] = [];
      let rest = van;

      for (let i = 0; i < aantalAf; i++) {
        const bovengrens = magNegatief ? grens : Math.max(1, rest);
        const n = heelGetal(kans, 1, bovengrens);
        af.push(n);
        rest -= n;
      }

      if (!magNegatief && rest < 0) continue;
      if (af.some((n) => n === 0)) continue;

      const gaatOver = overHetTiental(van, af[0]);
      if (eis === "wel" && !gaatOver) continue;
      if (eis === "niet" && gaatOver) continue;

      const handtekening = `aftrekken:${van}-${af.join("-")}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      uit.push({
        handtekening,
        vraagtekst: bepaalVraagtekst(aftrekkenGenerator, inst, leeftijd, {
          soort: "aftrekken",
          getallen: [van, ...af],
          goed: rest,
        }),
        somgegevens: { soort: "aftrekken", getallen: [van, ...af], goed: rest },
        ...(meerkeuzeVorm
          ? { vorm: "meerkeuze" as const, ...meerkeuze(rest, kans, 4, magNegatief) }
          : { vorm: "open" as const, antwoord: String(rest) }),
      });
    }

    return uit;
  },
};
