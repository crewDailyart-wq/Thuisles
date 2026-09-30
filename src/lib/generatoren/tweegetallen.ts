/**
 * Kies twee getallen die samen het doelgetal maken.
 *
 * Zes gele kaartjes, en daaronder ▢ + ▢ = 19. Het kind sleept twee kaartjes
 * naar de lege vakjes; één tik doet hetzelfde.
 *
 * Er is altijd precies één paar dat samen het doelgetal maakt. Dat wordt hier
 * echt nagerekend: van alle vijftien paren die je uit zes getallen kunt maken
 * mag er maar één op het doelgetal uitkomen, anders wordt de vraag opnieuw
 * geprobeerd.
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
import { tweegetallenAanpak } from "@/lib/generatoren/aanpak/optelopdrachten";
import { tweegetallenUitleg } from "@/lib/generatoren/scripts/optelopdrachten";

const ZIN = "Welke twee maken samen {som}?";

const STANDAARDZINNEN: Record<Leeftijdsgroep, string> = { "34": ZIN, "56": ZIN, "78": ZIN };

const KAARTJES = 6;

export function grenzen(inst: Instellingen) {
  const van = Math.max(3, Math.min(20, getal(inst, "van", 11)));
  const tot = Math.max(van, Math.min(20, getal(inst, "tot", 20)));
  return { van, tot };
}

/** Hoeveel paren uit deze getallen samen het doelgetal maken. */
function paren(getallen: number[], doel: number): number {
  let aantal = 0;
  for (let i = 0; i < getallen.length; i++) {
    for (let j = i + 1; j < getallen.length; j++) {
      if (getallen[i] + getallen[j] === doel) aantal++;
    }
  }
  return aantal;
}

export const tweegetallenGenerator: Generator = {
  id: "tweegetallen",
  naam: "Kies twee getallen",
  uitleg:
    "Zes getallen op kaartjes en een som eronder met twee lege vakjes. Precies één paar maakt samen het doelgetal; het kind sleept twee kaartjes naar de vakjes, of tikt ze aan.",
  suggestie: "Groep 4: doelgetal 11 tot en met 20",
  velden: [
    { soort: "getal", sleutel: "van", label: "Kleinste doelgetal", min: 3, max: 20 },
    { soort: "getal", sleutel: "tot", label: "Grootste doelgetal", min: 3, max: 20 },
    ...vraagtekstVelden(STANDAARDZINNEN, {
      voorbeeldzinnen: {
        "34": "Welke twee maken samen 19?",
        "56": "Welke twee maken samen 19?",
        "78": "Welke twee maken samen 19?",
      },
      extraHulp: "Op de plek van {som} komt het doelgetal van die vraag.",
    }),
  ],
  vraagteksten: {
    standaard: STANDAARDZINNEN,
    som: (s) => String(s.getallen[0] ?? s.goed),
  },
  standaard: { van: 11, tot: 20 },
  foutpatronen: optelPatronen,
  aanpak: tweegetallenAanpak,
  uitleganimatie: tweegetallenUitleg,

  maximum: (inst) => {
    const { van, tot } = grenzen(inst);
    return (tot - van + 1) * 40;
  },

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const { van, tot } = grenzen(inst);

    const uit: Gegenereerd[] = [];
    for (let poging = 0; poging < aantal * 500 && uit.length < aantal; poging++) {
      const doel = heelGetal(kans, van, tot);
      const eerste = heelGetal(kans, 1, Math.floor((doel - 1) / 2));
      const tweede = doel - eerste;
      if (tweede > 20) continue;

      /* Vier vullers erbij, en daarna nakijken dat er maar één paar past. */
      const getallen = [eerste, tweede];
      for (let ronde = 0; ronde < 120 && getallen.length < KAARTJES; ronde++) {
        const n = heelGetal(kans, 0, 20);
        if (getallen.includes(n)) continue;
        if (paren([...getallen, n], doel) > 1) continue;
        getallen.push(n);
      }
      if (getallen.length < KAARTJES || paren(getallen, doel) !== 1) continue;

      const gehusseld = husselen(kans, getallen);
      const handtekening = `tweegetallen:${doel}:${[...gehusseld].sort((a, b) => a - b).join("-")}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const gegevens = {
        soort: "tweegetallen",
        variant: "kaartjes",
        getallen: [doel, eerste],
        goed: tweede,
        extra: { kaartjes: KAARTJES },
      };

      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(tweegetallenGenerator, inst, groep, gegevens),
        /* De twee getallen, altijd van klein naar groot. */
        antwoord: `${Math.min(eerste, tweede)},${Math.max(eerste, tweede)}`,
        figuur: { soort: "tweegetallen", doel, getallen: gehusseld },
        somgegevens: gegevens,
      });
    }

    return uit;
  },
};
