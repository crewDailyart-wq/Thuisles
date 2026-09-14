/**
 * Kralen tellen: op de hoeveelste plek staat de kraal waar de pijl naar wijst?
 *
 * Een ketting waarvan de kleur om de vijf kralen wisselt. Daardoor hoeft een
 * kind niet kraal voor kraal te tellen, maar kan het met sprongen mee: 5, 10,
 * 15, en dan de losse kralen erbij. Precies de vijfstructuur waar dit leerdoel
 * over gaat.
 *
 * De tekening zit als gegevens in de vraag (`figuur`), niet als plaatje. De
 * kinderkant tekent hem met code, zodat hij op elk scherm scherp blijft.
 */

import {
  getal,
  heelGetal,
  kansGenerator,
  kiesUit,
  tekst,
  vinkje,
  type Generator,
  type Gegenereerd,
  type Instellingen,
  bepaalVraagtekst,
  vraagtekstVelden,
} from "@/lib/generatoren/soort";
import type { Leeftijdsgroep } from "@/lib/generatoren/foutpatroon";
import { kralenPatronen } from "@/lib/generatoren/patronen/kralen";
import { kralenAanpak } from "@/lib/generatoren/aanpak/kralen";
import { kralenUitleg } from "@/lib/generatoren/scripts/kralen";

/**
 * Welke rijlengtes mogen voorkomen bij deze instellingen.
 *
 * Alleen hele groepjes. Een rij van 12 met groepjes van 5 zou eindigen op een
 * afgekapt groepje van 2, en juist die halve groep haalt de vijfstructuur
 * onderuit: het kind kan dan niet meer met sprongen meetellen. Daarom wordt
 * het ingestelde bereik afgerond op veelvouden van de groepsgrootte.
 *
 * Past er binnen het bereik geen enkel heel groepje, dan valt het terug op één
 * groepje. Zo levert het scherm nooit een lege lijst op.
 */
function mogelijkeLengtes(inst: Instellingen): { lengtes: number[]; perGroep: number } {
  const perGroep = Math.max(2, getal(inst, "perGroep", 5));
  const van = Math.max(perGroep, getal(inst, "van", 12));
  const tot = Math.max(van, getal(inst, "tot", 25));

  const eerste = Math.ceil(van / perGroep) * perGroep;
  const lengtes: number[] = [];
  for (let n = eerste; n <= tot; n += perGroep) lengtes.push(n);

  return { lengtes: lengtes.length > 0 ? lengtes : [perGroep], perGroep };
}

/** De standaardzinnen van dit type. Per sjabloon aan te passen in het beheer. */
const STANDAARDZINNEN: Record<Leeftijdsgroep, string> = {
  "34": "Welke plek heeft deze kraal?",
  "56": "Op welke plek staat de kraal met de pijl?",
  "78": "Op de hoeveelste plek staat de kraal waar de pijl naar wijst?",
};

export const kralenGenerator: Generator = {
  id: "kralen",
  naam: "Kralen tellen (hoeveelste kraal)",
  uitleg:
    "Een kralenketting waarvan de kleur om de vijf wisselt. De pijl wijst één kraal aan; het kind telt met de vijfstructuur mee en typt de plek.",
  suggestie: "Groep 3: 10 tot 20 kralen · groep 4: 15 tot 30 kralen",
  velden: [
    {
      soort: "getal",
      sleutel: "van",
      label: "Minste kralen",
      min: 5,
      max: 40,
      hulp: "Wordt afgerond op hele groepjes: bij groepjes van 5 dus 5, 10, 15, 20…",
    },
    { soort: "getal", sleutel: "tot", label: "Meeste kralen", min: 5, max: 40 },
    {
      soort: "getal",
      sleutel: "perGroep",
      label: "Groepjes van hoeveel kralen",
      min: 2,
      max: 10,
      hulp: "Vijf hoort bij de vijfstructuur. Elk groepje is altijd compleet; er komt nooit een half groepje in beeld.",
    },
    {
      soort: "vinkje",
      sleutel: "alleenRond",
      label: "Pijl alleen aan het einde van een groepje",
      hulp: "Aan: de pijl staat altijd op het einde van een groepje (5, 10, 15). Uit: overal.",
    },
    {
      soort: "keuze",
      sleutel: "palet",
      label: "Kleuren van de kralen",
      opties: [
        { waarde: "viool-oranje", label: "Paars en oranje" },
        { waarde: "groen-lucht", label: "Groen en blauw" },
        { waarde: "roze-geel", label: "Roze en geel" },
      ],
    },
    /* Overal dezelfde velden om de vraagzin aan te passen, per groep. */
    ...vraagtekstVelden(STANDAARDZINNEN),
  ],
  vraagteksten: {
    standaard: STANDAARDZINNEN,
  },
  standaard: { van: 12, tot: 25, perGroep: 5, alleenRond: false, palet: "viool-oranje" },
  foutpatronen: kralenPatronen,
  aanpak: kralenAanpak,
  uitleganimatie: kralenUitleg,

  maximum: (inst) => {
    const { lengtes, perGroep } = mogelijkeLengtes(inst);
    const alleenRond = vinkje(inst, "alleenRond");

    /*
      Voor elke rijlengte kan de pijl op elke kraal staan. Staat hij alleen op
      ronde punten, dan zijn dat er zoveel als er groepjes zijn.
    */
    return lengtes.reduce((som, n) => som + (alleenRond ? n / perGroep : n), 0);
  },

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const { lengtes, perGroep } = mogelijkeLengtes(inst);
    const alleenRond = vinkje(inst, "alleenRond");
    const palet = tekst(inst, "palet", "viool-oranje");

    const uit: Gegenereerd[] = [];
    for (let poging = 0; poging < aantal * 200 && uit.length < aantal; poging++) {
      const totaal = kiesUit(kans, lengtes);

      let pijlOp: number;
      if (alleenRond) {
        const groepjes = Math.floor(totaal / perGroep);
        if (groepjes === 0) continue;
        pijlOp = heelGetal(kans, 1, groepjes) * perGroep;
      } else {
        pijlOp = heelGetal(kans, 1, totaal);
        /*
          De eerste kraal is te makkelijk en zegt niets over de vijfstructuur;
          bij een rij van enige lengte slaan we hem over.
        */
        if (pijlOp === 1 && totaal > 6) continue;
      }

      const gegevens = {
        soort: "kralen",
        variant: alleenRond ? "rond" : "vrij",
        getallen: [totaal, perGroep],
        goed: pijlOp,
      };
      const handtekening = `kralen:${perGroep}:${totaal}:${pijlOp}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(kralenGenerator, inst, groep, gegevens),
        antwoord: String(pijlOp),
        figuur: { soort: "kralenrij", totaal, perGroep, pijlOp, palet },
        somgegevens: gegevens,
      });
    }

    return uit;
  },
};
