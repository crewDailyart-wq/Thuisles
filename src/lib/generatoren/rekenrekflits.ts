/**
 * Flitsen met het rekenrek: even kijken, dan gaat er een kaart overheen.
 *
 * Het kind ziet een aantal kralen en typt daarna hoeveel het er zag. Daar gaat
 * het om: niet kraal voor kraal tellen, maar in één oogopslag zien dat het er
 * vijftien zijn — tien boven en vijf onder, vijf rood en vijf wit.
 *
 * Hoelang het rek te zien is staat per sjabloon in de database, zodat het
 * korter kan als het te makkelijk wordt.
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
import { flitsPatronen } from "@/lib/generatoren/patronen/rekenrek";
import { rekenrekflitsAanpak } from "@/lib/generatoren/aanpak/rekenrek";
import { rekenrekflitsUitleg } from "@/lib/generatoren/scripts/rekenrek";

const ZIN = "Hoeveel kralen zag je?";

const STANDAARDZINNEN: Record<Leeftijdsgroep, string> = { "34": ZIN, "56": ZIN, "78": ZIN };

/** Meer dan twintig kralen passen er niet op een rekenrek. */
const MAX_KRALEN = 20;

export function grenzen(inst: Instellingen) {
  const van = Math.max(1, Math.min(MAX_KRALEN, getal(inst, "van", 6)));
  const tot = Math.max(van, Math.min(MAX_KRALEN, getal(inst, "tot", 20)));
  const seconden = Math.max(1, Math.min(10, getal(inst, "seconden", 2)));
  return { van, tot, seconden };
}

export const rekenrekflitsGenerator: Generator = {
  id: "rekenrekflits",
  naam: "Flitsen met het rekenrek",
  uitleg:
    "Het rekenrek staat een paar tellen in beeld en gaat dan onder een kaart. Het kind typt hoeveel kralen het zag. Oefent het kijken met de vijfstructuur.",
  suggestie: "Groep 4: 6 tot en met 20 kralen, twee tellen",
  velden: [
    { soort: "getal", sleutel: "van", label: "Minste kralen", min: 1, max: MAX_KRALEN },
    { soort: "getal", sleutel: "tot", label: "Meeste kralen", min: 1, max: MAX_KRALEN },
    {
      soort: "getal",
      sleutel: "seconden",
      label: "Hoeveel tellen is het rek te zien",
      min: 1,
      max: 10,
      hulp: "Daarna gaat er een kaart overheen. Korter maakt het moeilijker: dan moet het kind het echt in één oogopslag zien.",
    },
    ...vraagtekstVelden(STANDAARDZINNEN, {
      voorbeeldzinnen: { "34": ZIN, "56": ZIN, "78": ZIN },
    }),
  ],
  vraagteksten: { standaard: STANDAARDZINNEN },
  standaard: { van: 6, tot: 20, seconden: 2 },
  foutpatronen: flitsPatronen,
  aanpak: rekenrekflitsAanpak,
  uitleganimatie: rekenrekflitsUitleg,

  maximum: (inst) => {
    const { van, tot } = grenzen(inst);
    return tot - van + 1;
  },

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const { van, tot, seconden } = grenzen(inst);

    const uit: Gegenereerd[] = [];
    for (let poging = 0; poging < aantal * 300 && uit.length < aantal; poging++) {
      const hoeveel = heelGetal(kans, van, tot);

      const handtekening = `rekenrekflits:${hoeveel}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const gegevens = {
        soort: "rekenrekflits",
        variant: "flitsen",
        getallen: [hoeveel],
        goed: hoeveel,
      };

      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(rekenrekflitsGenerator, inst, groep, gegevens),
        antwoord: String(hoeveel),
        figuur: { soort: "rekenrekflits", aantal: hoeveel, seconden },
        somgegevens: gegevens,
      });
    }

    return uit;
  },
};
