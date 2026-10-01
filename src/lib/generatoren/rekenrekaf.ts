/**
 * Aftrekken met het rekenrek: de som bovenaan, het rek eronder.
 *
 * Het kind leest de som, schuift zelf de kralen weg en vult het antwoord in.
 * Zo horen het beeld en de som bij elkaar: wat je wegschuift is precies wat er
 * in de som vanaf gaat.
 *
 * ---------------------------------------------------------------------------
 * Drie standen, de leerlijn van groep 4
 * ---------------------------------------------------------------------------
 *   vanaf10   10 − 3. De splitsingen van tien, het ankerpunt van het rek.
 *   klein     17 − 4. Binnen het tiental: de bovenste rij blijft staan en je
 *             rekent alleen met de losse kralen. Na een goed antwoord laat het
 *             scherm zien waarom: 7 − 4 = 3, dus 17 − 4 = 13.
 *   via10     15 − 7. Over de tien heen, en dus in twee stappen: eerst naar de
 *             tien, dan de rest. Na een goed antwoord staan die twee stappen
 *             eronder; het kind hoeft ze niet in te vullen.
 *
 * De getallen komen uit de instellingen; de stand bepaalt alleen welke sommen
 * eruit mogen komen.
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
import { rekenrekPatronen } from "@/lib/generatoren/patronen/rekenrek";
import {
  kleineSomAanpak,
  vanafTienAanpak,
  viaTienAanpak,
} from "@/lib/generatoren/aanpak/rekenrek";
import {
  kleineSomUitleg,
  vanafTienUitleg,
  viaTienUitleg,
} from "@/lib/generatoren/scripts/rekenrek";

const ZIN = "Hoeveel blijft er over?";

const STANDAARDZINNEN: Record<Leeftijdsgroep, string> = { "34": ZIN, "56": ZIN, "78": ZIN };

/** Meer dan twintig kralen passen er niet op een rekenrek. */
const MAX_KRALEN = 20;

export function grenzen(inst: Instellingen) {
  const van = Math.max(2, Math.min(MAX_KRALEN, getal(inst, "van", 11)));
  const tot = Math.max(van, Math.min(MAX_KRALEN, getal(inst, "tot", 20)));
  const afVan = Math.max(1, Math.min(9, getal(inst, "afVan", 1)));
  const afTot = Math.max(afVan, Math.min(9, getal(inst, "afTot", 9)));
  return { van, tot, afVan, afTot, stand: tekst(inst, "stand", "via10") };
}

/**
 * Past deze som bij deze stand?
 *
 * Vanaf tien: alles mag, want het begingetal ís tien. Binnen het tiental: er
 * moeten genoeg losse kralen zijn om er zoveel af te halen. Over de tien: er
 * moeten er juist te weinig zijn, zodat je eerst naar de tien moet.
 */
export function pastBijStand(stand: string, van: number, af: number): boolean {
  if (af >= van) return false;
  const eenheden = van % 10;
  if (stand === "vanaf10") return van === 10;
  if (stand === "klein") return van > 10 && eenheden >= af;
  /* via10 */
  return van > 10 && eenheden < af && van - af < 10;
}

/** Alle sommen die bij deze instellingen en deze stand kunnen. */
export function sommen(
  stand: string,
  van: number,
  tot: number,
  afVan: number,
  afTot: number,
): [number, number][] {
  const uit: [number, number][] = [];
  for (let a = van; a <= tot; a++) {
    for (let af = afVan; af <= afTot; af++) {
      if (pastBijStand(stand, a, af)) uit.push([a, af]);
    }
  }
  return uit;
}

export const rekenrekafGenerator: Generator = {
  id: "rekenrekaf",
  naam: "Aftrekken met het rekenrek",
  uitleg:
    "De som staat bovenaan met een leeg vakje erin, het rekenrek staat eronder. Het kind schuift zelf de kralen weg en vult het antwoord in. De stand bepaalt het soort som: vanaf tien, binnen het tiental of over de tien heen.",
  suggestie: "Groep 4: eerst vanaf 10, daarna binnen het tiental, daarna over de tien",
  velden: [
    {
      soort: "keuze",
      sleutel: "stand",
      label: "Soort som",
      opties: [
        { waarde: "vanaf10", label: "Vanaf tien — 10 − 3" },
        { waarde: "klein", label: "Binnen het tiental — 17 − 4" },
        { waarde: "via10", label: "Over de tien heen — 15 − 7" },
      ],
      hulp: "Vanaf tien oefent de splitsingen van tien. Binnen het tiental blijft de bovenste rij staan. Over de tien heen gaat in twee stappen: eerst naar de tien, dan de rest.",
    },
    { soort: "getal", sleutel: "van", label: "Kleinste begingetal", min: 2, max: MAX_KRALEN },
    { soort: "getal", sleutel: "tot", label: "Grootste begingetal", min: 2, max: MAX_KRALEN },
    { soort: "getal", sleutel: "afVan", label: "Minste eraf", min: 1, max: 9 },
    {
      soort: "getal",
      sleutel: "afTot",
      label: "Meeste eraf",
      min: 1,
      max: 9,
      hulp: "De uitkomst komt nooit onder nul: sommen die niet bij de gekozen stand passen vallen vanzelf af.",
    },
    ...vraagtekstVelden(STANDAARDZINNEN, {
      voorbeeldzinnen: { "34": ZIN, "56": ZIN, "78": ZIN },
      extraHulp: "De som staat al in beeld, dus de zin hoeft hem niet te herhalen.",
    }),
  ],
  vraagteksten: { standaard: STANDAARDZINNEN },
  standaard: { stand: "via10", van: 11, tot: 19, afVan: 2, afTot: 9 },
  foutpatronen: rekenrekPatronen,

  /* Per stand een eigen weg naar het antwoord en een eigen uitleg. */
  aanpak: {
    zin: (som) => kiesAanpak(som).zin(som),
    stappen: (som) => kiesAanpak(som).stappen(som),
    controle: (som) => kiesAanpak(som).controle(som),
  },
  uitleganimatie: {
    modellen: ["rekenrek"],
    strategieen: [
      ...vanafTienUitleg.strategieen,
      ...kleineSomUitleg.strategieen,
      ...viaTienUitleg.strategieen,
    ],
    /*
      Welke strategie het wordt hangt van de som af, en die kent deze functie
      niet. Dat geeft niet: het script kiest zelf de weg die bij de stand
      hoort, en de naam die hier uit komt is alleen de voorselectie in beheer.
    */
    standaardStrategie: (vorm) => viaTienUitleg.standaardStrategie(vorm),
    script: (som, vorm, strategie) => kiesUitleg(som).script(som, vorm, strategie),
    vergelijkbaar: (som) => kiesUitleg(som).vergelijkbaar(som),
  },

  maximum: (inst) => {
    const { stand, van, tot, afVan, afTot } = grenzen(inst);
    return sommen(stand, van, tot, afVan, afTot).length;
  },

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const { stand, van, tot, afVan, afTot } = grenzen(inst);
    const mogelijk = sommen(stand, van, tot, afVan, afTot);
    if (mogelijk.length === 0) return [];

    const uit: Gegenereerd[] = [];
    for (let poging = 0; poging < aantal * 300 && uit.length < aantal; poging++) {
      const [begin, af] = mogelijk[heelGetal(kans, 0, mogelijk.length - 1)];

      const handtekening = `rekenrekaf:${stand}:${begin}-${af}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const gegevens = {
        soort: "rekenrekaf",
        variant: stand,
        getallen: [begin, af],
        goed: begin - af,
      };

      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(rekenrekafGenerator, inst, groep, gegevens),
        antwoord: String(begin - af),
        figuur: { soort: "rekenrekaf", van: begin, af, stand },
        somgegevens: gegevens,
      });
    }

    return uit;
  },
};

/** Welke aanpak bij deze som hoort; de stand staat in de variant. */
function kiesAanpak(som: { variant?: string }) {
  if (som.variant === "vanaf10") return vanafTienAanpak;
  if (som.variant === "klein") return kleineSomAanpak;
  return viaTienAanpak;
}

/** Hetzelfde voor de uitleg-animatie. */
function kiesUitleg(som: { variant?: string }) {
  if (som.variant === "vanaf10") return vanafTienUitleg;
  if (som.variant === "klein") return kleineSomUitleg;
  return viaTienUitleg;
}
