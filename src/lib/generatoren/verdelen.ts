/**
 * Verdelen in twee groepen.
 *
 * Een groepje kralen en twee lege vakken. In één korte zin staat wat er moet
 * gebeuren: "Verdeel 9 kralen. Links 1 kraal meer dan rechts." Het kind sleept
 * de kralen naar links en naar rechts.
 *
 * ---------------------------------------------------------------------------
 * De voorwaarde volgt uit het aantal
 * ---------------------------------------------------------------------------
 * Bij een oneven aantal kan het nooit gelijk op gaan, dus daar is de voorwaarde
 * altijd "links 1 meer". Bij een even aantal kan het wél eerlijk, en dan is de
 * voorwaarde "allebei evenveel" of "links 2 meer". Zo is er bij elke opgave
 * precies één goede verdeling en hoeft de beheerder niets in te stellen wat
 * daarna toch niet uitkomt.
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
import type { Leeftijdsgroep, Somgegevens } from "@/lib/generatoren/foutpatroon";
import { splitsopdrachtPatronen } from "@/lib/generatoren/patronen/splitsopdrachten";
import { verdelenAanpak } from "@/lib/generatoren/aanpak/splitsopdrachten";
import { verdelenUitleg } from "@/lib/generatoren/scripts/splitsopdrachten";

/* De opdracht ís de vraagzin; die komt op de plek van {som} te staan. */
const ZIN = "{som}";

const STANDAARDZINNEN: Record<Leeftijdsgroep, string> = {
  "34": ZIN,
  "56": ZIN,
  "78": ZIN,
};

const MIN_AANTAL = 4;
const MAX_AANTAL = 20;

export function grenzen(inst: Instellingen) {
  const van = Math.max(MIN_AANTAL, Math.min(MAX_AANTAL, getal(inst, "van", 5)));
  const tot = Math.max(van, Math.min(MAX_AANTAL, getal(inst, "tot", 20)));
  return { van, tot };
}

/**
 * Hoe de opdracht in woorden heet, bij een verschil van 0, 1 of 2.
 *
 * Voluit, met het woord "kralen" erbij en met "dan rechts" erachter: "links 1
 * meer" laat in het midden waar dat ene meer dan is, en dat is precies wat een
 * kind bij deze opdracht moet begrijpen.
 */
function eis(verschil: number): string {
  if (verschil === 0) return "Links en rechts evenveel.";
  return `Links ${verschil} ${verschil === 1 ? "kraal" : "kralen"} meer dan rechts.`;
}

/** De opdrachtzin van één som: het aantal en de voorwaarde. */
function opdrachtzin(s: Somgegevens): string {
  const aantal = s.getallen[0] ?? 0;
  const links = s.getallen[1] ?? 0;
  const rechts = s.goed;
  return `Verdeel ${aantal} ${aantal === 1 ? "kraal" : "kralen"}. ${eis(links - rechts)}`;
}

export const verdelenGenerator: Generator = {
  id: "verdelen",
  naam: "Verdelen in twee groepen",
  uitleg:
    "Een groepje kralen en twee lege vakken. In één korte zin staat hoeveel er in elk vak moet; het kind sleept de kralen ernaartoe.",
  suggestie: "Groep 4: 5 tot en met 20 kralen",
  velden: [
    {
      soort: "getal",
      sleutel: "van",
      label: "Minste kralen",
      min: MIN_AANTAL,
      max: MAX_AANTAL,
    },
    {
      soort: "getal",
      sleutel: "tot",
      label: "Meeste kralen",
      min: MIN_AANTAL,
      max: MAX_AANTAL,
      hulp: "De voorwaarde kiest de generator zelf bij het aantal: bij een oneven aantal links één meer, bij een even aantal evenveel of links twee meer.",
    },
    ...vraagtekstVelden(STANDAARDZINNEN, {
      voorbeeldzinnen: {
        "34": "Verdeel 9 kralen. Links 1 kraal meer dan rechts.",
        "56": "Verdeel 9 kralen. Links 1 kraal meer dan rechts.",
        "78": "Verdeel 9 kralen. Links 1 kraal meer dan rechts.",
      },
      extraHulp:
        "Leeg laten geeft de opdracht zelf, met het aantal en de voorwaarde erin. Vul je hier iets in, zet dan {som} op de plek waar de opdracht moet komen.",
    }),
  ],
  vraagteksten: {
    standaard: STANDAARDZINNEN,
    som: opdrachtzin,
  },
  standaard: { van: 5, tot: 20 },
  foutpatronen: splitsopdrachtPatronen,
  aanpak: verdelenAanpak,
  uitleganimatie: verdelenUitleg,

  /* Even aantallen leveren twee opdrachten op, oneven aantallen één. */
  maximum: (inst) => {
    const { van, tot } = grenzen(inst);
    let totaal = 0;
    for (let n = van; n <= tot; n++) totaal += n % 2 === 0 ? 2 : 1;
    return totaal;
  },

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const { van, tot } = grenzen(inst);

    const uit: Gegenereerd[] = [];
    for (let poging = 0; poging < aantal * 300 && uit.length < aantal; poging++) {
      const hoeveel = heelGetal(kans, van, tot);

      /*
        Het verschil tussen links en rechts. Oneven kan alleen met één ernaast;
        even kan eerlijk of met twee ernaast — en twee ernaast alleen als er
        rechts nog iets overblijft.
      */
      const even = hoeveel % 2 === 0;
      const verschil = even ? (hoeveel >= 6 && kans() < 0.5 ? 2 : 0) : 1;

      const links = (hoeveel + verschil) / 2;
      const rechts = hoeveel - links;
      if (!Number.isInteger(links) || rechts < 1) continue;

      const handtekening = `verdelen:${hoeveel}:${verschil}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const gegevens = {
        soort: "verdelen",
        variant: verschil === 0 ? "gelijk" : `links${verschil}`,
        getallen: [hoeveel, links],
        goed: rechts,
        extra: { verschil },
      };

      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(verdelenGenerator, inst, groep, gegevens),
        /* Eerst links, dan rechts — dezelfde volgorde als op het scherm. */
        antwoord: `${links},${rechts}`,
        figuur: { soort: "verdelen", aantal: hoeveel, verschil },
        somgegevens: gegevens,
      });
    }

    return uit;
  },
};
