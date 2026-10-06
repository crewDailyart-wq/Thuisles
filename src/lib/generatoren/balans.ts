/**
 * Maak beide kanten gelijk: 5 + ▢ = 1 + 7.
 *
 * Aan één kant staan twee getallen, aan de andere kant één getal en een leeg
 * vakje. Het kind rekent eerst de volle kant uit en zoekt dan wat er aan de
 * andere kant nog bij moet.
 *
 * Met de instelling "wisselend" staat het lege vakje de ene keer links en de
 * andere keer rechts. Dat is een stap moeilijker: het kind moet eerst kijken
 * welke kant compleet is.
 */

import {
  getal,
  heelGetal,
  kansGenerator,
  tekst,
  type Generator,
  type Gegenereerd,
  type Instellingen,
  bepaalVraagtekst,
  vraagtekstVelden,
} from "@/lib/generatoren/soort";
import type { Leeftijdsgroep } from "@/lib/generatoren/foutpatroon";
import { optelPatronen } from "@/lib/generatoren/patronen/optelopdrachten";
import { balansAanpak } from "@/lib/generatoren/aanpak/optelopdrachten";
import { balansUitleg } from "@/lib/generatoren/scripts/optelopdrachten";
import { omEnOm, optelwerking, werkingVeld } from "@/lib/generatoren/optelwerking";

const ZIN = "Maak beide kanten gelijk.";

const STANDAARDZINNEN: Record<Leeftijdsgroep, string> = { "34": ZIN, "56": ZIN, "78": ZIN };

export function grenzen(inst: Instellingen) {
  const van = Math.max(3, Math.min(20, getal(inst, "van", 3)));
  const tot = Math.max(van, Math.min(20, getal(inst, "tot", 10)));
  return { van, tot, leeg: tekst(inst, "leeg", "links") };
}

export const balansGenerator: Generator = {
  id: "balans",
  naam: "Maak beide kanten gelijk",
  uitleg:
    "Twee plussommen met een isgelijkteken ertussen, waarvan er één een leeg vakje heeft. Het kind maakt beide kanten even groot.",
  suggestie: "Groep 4: eerst tot en met 10 met het vakje links, daarna 11 tot en met 20 wisselend",
  velden: [
    { soort: "getal", sleutel: "van", label: "Kleinste totaal per kant", min: 3, max: 20 },
    { soort: "getal", sleutel: "tot", label: "Grootste totaal per kant", min: 3, max: 20 },
    {
      soort: "keuze",
      sleutel: "leeg",
      label: "Waar staat het lege vakje",
      opties: [
        { waarde: "links", label: "Altijd links" },
        { waarde: "rechts", label: "Altijd rechts" },
        { waarde: "wissel", label: "Wisselend" },
      ],
      hulp: "Wisselend is een stap moeilijker: het kind moet eerst kijken welke kant al compleet is.",
    },
    werkingVeld("Om en om zelf blokjes op de weegschaal leggen"),
    ...vraagtekstVelden(STANDAARDZINNEN),
  ],
  vraagteksten: { standaard: STANDAARDZINNEN },
  standaard: { van: 3, tot: 10, leeg: "links" },
  foutpatronen: optelPatronen,
  aanpak: balansAanpak,
  uitleganimatie: balansUitleg,

  /* Per totaal: het bekende getal links maal de splitsing van de volle kant. */
  maximum: (inst) => {
    const { van, tot, leeg } = grenzen(inst);
    let totaal = 0;
    for (let t = van; t <= tot; t++) totaal += (t - 1) * (t - 1);
    return leeg === "wissel" ? totaal * 2 : totaal;
  },

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const { van, tot, leeg } = grenzen(inst);

    const werking = optelwerking(inst);
    const uit: Gegenereerd[] = [];
    for (let poging = 0; poging < aantal * 400 && uit.length < aantal; poging++) {
      const totaalPerKant = heelGetal(kans, van, tot);
      /* De volle kant: twee getallen die samen het totaal zijn. */
      const vol1 = heelGetal(kans, 1, totaalPerKant - 1);
      const vol2 = totaalPerKant - vol1;
      /* En de kant met het lege vakje: één bekend getal, de rest is het antwoord. */
      const bekend = heelGetal(kans, 1, totaalPerKant - 1);
      const antwoord = totaalPerKant - bekend;

      /* Dezelfde som aan beide kanten is geen opgave maar een spiegel. */
      if (bekend === vol1 && antwoord === vol2) continue;
      if (bekend === vol2 && antwoord === vol1) continue;

      const leegLinks = leeg === "rechts" ? false : leeg === "links" ? true : kans() < 0.5;

      const handtekening = `balans:${leegLinks ? "l" : "r"}:${bekend}:${vol1}+${vol2}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const gegevens = {
        soort: "balans",
        variant: leeg,
        getallen: [bekend, totaalPerKant],
        goed: antwoord,
        extra: { leegLinks: leegLinks ? 1 : 0 },
      };

      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(balansGenerator, inst, groep, gegevens),
        antwoord: String(antwoord),
        figuur: {
          soort: "balans",
          links: leegLinks ? [bekend, null] : [vol1, vol2],
          rechts: leegLinks ? [vol1, vol2] : [bekend, null],
          ...(werking === "typen" ? {} : { hulpBijFout: "weegschaal" as const }),
        },
        somgegevens: gegevens,
      });
    }

    /*
      Om en om met de weegschaal: opgave 1, 3, 5, 7 en 9 legt het kind zelf
      blokjes op de schaal, 2, 4, 6, 8 en 10 zijn zulke sommen zonder, en dan
      nog vijf. Binnen elk deel van klein naar groot.
    */
    if (werking === "bouwen") {
      const totaal = (v: Gegenereerd) => (v.somgegevens.getallen[1] ?? 0) * 100 + v.somgegevens.goed;
      const tien = uit.slice(0, 10).sort((a, b) => totaal(a) - totaal(b));
      const reeks = omEnOm(
        tien.filter((_, i) => i % 2 === 0),
        tien.filter((_, i) => i % 2 === 1),
        uit.slice(10).sort((a, b) => totaal(a) - totaal(b)),
      );
      return reeks.map(({ som, bouwen }, i) =>
        som.figuur?.soort === "balans"
          ? { ...som, figuur: { ...som.figuur, ...(bouwen ? { bouw: "weegschaal" as const } : {}), volgnummer: i + 1 } }
          : som,
      );
    }

    return uit;
  },
};
