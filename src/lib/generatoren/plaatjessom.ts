/**
 * Optellen met plaatjes.
 *
 * Twee groepjes voorwerpen naast elkaar, in rijtjes van hooguit vijf. Het zijn
 * dezelfde getekende voorwerpen als bij Plaatjes tellen — de appel, het eendje,
 * het muisje — zodat een kind ze in beide oefeningen herkent. Dat de groepjes
 * uit elkaar te houden zijn, doet niet de kleur van de voorwerpen maar het
 * gekleurde vlak eronder: lichtoranje achter het eerste, lichtpaars achter het
 * tweede.
 *
 * ---------------------------------------------------------------------------
 * Twee standen
 * ---------------------------------------------------------------------------
 * "Hele som": onder de plaatjes staan drie lege vakjes, ▢ + ▢ = ▢. Het kind
 * telt zelf beide groepjes én de uitkomst. "Uitkomst": onder elk groepje staat
 * het getal al in een geel vakje en hoeft alleen de uitkomst nog.
 */

import {
  getal,
  heelGetal,
  husselen,
  kansGenerator,
  tekst,
  type Generator,
  type Gegenereerd,
  type Instellingen,
  bepaalVraagtekst,
  vraagtekstVelden,
} from "@/lib/generatoren/soort";
import type { Leeftijdsgroep } from "@/lib/generatoren/foutpatroon";
import { TELPLAATJE_OPTIES } from "@/lib/telplaatjes";
import { optelPatronen } from "@/lib/generatoren/patronen/optelopdrachten";
import { plaatjessomAanpak } from "@/lib/generatoren/aanpak/optelopdrachten";
import { plaatjessomUitleg } from "@/lib/generatoren/scripts/optelopdrachten";
import { optelwerking, werkingVeld } from "@/lib/generatoren/optelwerking";

/**
 * De voorwerpen waaruit „door elkaar” kiest: alle plaatjes van Plaatjes tellen.
 *
 * Eén soort per vraag, en per vraag een andere: de lijst wordt gehusseld en dan
 * op een rij afgelopen. Zo komt bij vijftien vragen elk voorwerp één keer voor
 * in plaats van drie keer de ster en nooit het eendje.
 */
const GEMENGD = TELPLAATJE_OPTIES.map((o) => o.waarde);

/**
 * De vier vormpjes die dit type eerder zelf tekende.
 *
 * Blijft staan: er zijn vragen gemaakt met „blaadje”, en dat blaadje bestaat
 * alleen hier. Het scherm valt op deze tekeningen terug zodra de naam geen
 * plaatje van Plaatjes tellen is, zodat die vragen gewoon blijven werken.
 */
export const VOORWERPEN = ["appel", "eikel", "blaadje", "ster"] as const;

const ZIN_SOM = "Maak de som.";
const ZIN_UITKOMST = "Hoeveel samen?";

const STANDAARDZINNEN: Record<Leeftijdsgroep, string> = {
  "34": ZIN_UITKOMST,
  "56": ZIN_UITKOMST,
  "78": ZIN_UITKOMST,
};

function zinnen(stand: string): Record<Leeftijdsgroep, string> {
  const zin = stand === "som" ? ZIN_SOM : ZIN_UITKOMST;
  return { "34": zin, "56": zin, "78": zin };
}

/* Meer dan tien in een groepje wordt een tweede rij en telt niet fijn meer. */
const MAX_GROEP = 10;

export function grenzen(inst: Instellingen) {
  const van = Math.max(2, Math.min(20, getal(inst, "van", 2)));
  const tot = Math.max(van, Math.min(20, getal(inst, "tot", 10)));
  return {
    van,
    tot,
    stand: tekst(inst, "stand", "uitkomst"),
    voorwerp: tekst(inst, "voorwerp", "gemengd"),
  };
}

/** Alle paren die bij deze grenzen passen: allebei de groepjes hoogstens tien. */
function paren(van: number, tot: number): [number, number][] {
  const uit: [number, number][] = [];
  for (let n = van; n <= tot; n++) {
    for (let a = Math.max(1, n - MAX_GROEP); a <= Math.min(MAX_GROEP, n - 1); a++) {
      uit.push([a, n - a]);
    }
  }
  return uit;
}

export const plaatjessomGenerator: Generator = {
  id: "plaatjessom",
  naam: "Optellen met plaatjes",
  uitleg:
    "Twee groepjes voorwerpjes in rijtjes van vijf, met een andere kleur per groepje. Het kind telt en telt op. In de stand „hele som” vult het alle drie de vakjes in, in de stand „uitkomst” alleen het antwoord.",
  suggestie: "Groep 4: uitkomst 2 tot en met 10, daarna 11 tot en met 20",
  velden: [
    {
      soort: "keuze",
      sleutel: "stand",
      label: "Wat het kind invult",
      opties: [
        { waarde: "som", label: "De hele som — ▢ + ▢ = ▢" },
        { waarde: "uitkomst", label: "Alleen de uitkomst — de getallen staan er al" },
      ],
      hulp: "Bij de hele som telt het kind zelf beide groepjes; dat is de eerste stap. Bij alleen de uitkomst staan de twee getallen er al en gaat het puur om het optellen.",
    },
    { soort: "getal", sleutel: "van", label: "Kleinste uitkomst", min: 2, max: 20 },
    { soort: "getal", sleutel: "tot", label: "Grootste uitkomst", min: 2, max: 20 },
    {
      soort: "keuze",
      sleutel: "voorwerp",
      label: "Welke voorwerpjes",
      opties: [
        { waarde: "gemengd", label: "Door elkaar" },
        ...TELPLAATJE_OPTIES.map((o) => ({ waarde: o.waarde, label: o.meervoud })),
        { waarde: "blaadje", label: "Blaadjes" },
      ],
      hulp: "Per vraag staat er altijd één soort; „door elkaar” loopt alle soorten langs, elke vraag een andere. Het zijn dezelfde voorwerpen als bij Plaatjes tellen.",
    },
    werkingVeld("Elk plaatje in de tienstrook tikken, dan typen (alleen bij „alleen de uitkomst”)", false),
    ...vraagtekstVelden(STANDAARDZINNEN, {
      voorbeeldzinnen: { "34": ZIN_UITKOMST, "56": ZIN_UITKOMST, "78": ZIN_UITKOMST },
      extraHulp: `Leeg laten geeft „${ZIN_UITKOMST}”, en bij de hele som „${ZIN_SOM}”.`,
    }),
  ],
  vraagteksten: { standaard: STANDAARDZINNEN },
  standaard: { stand: "uitkomst", van: 2, tot: 10, voorwerp: "gemengd" },
  foutpatronen: optelPatronen,
  aanpak: plaatjessomAanpak,
  uitleganimatie: plaatjessomUitleg,

  maximum: (inst) => {
    const { van, tot } = grenzen(inst);
    return paren(van, tot).length;
  },

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const { van, tot, stand, voorwerp } = grenzen(inst);
    const mogelijk = paren(van, tot);
    if (mogelijk.length === 0) return [];
    const reeks = husselen(kans, GEMENGD);

    const uit: Gegenereerd[] = [];
    for (let poging = 0; poging < aantal * 300 && uit.length < aantal; poging++) {
      const [a, b] = mogelijk[heelGetal(kans, 0, mogelijk.length - 1)];

      const handtekening = `plaatjessom:${stand}:${a}+${b}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      /* Bij „door elkaar” de gehusselde lijst aflopen: elke vraag een andere. */
      const soort = voorwerp === "gemengd" ? reeks[uit.length % reeks.length] : voorwerp;

      const gegevens = {
        soort: "plaatjessom",
        variant: stand,
        getallen: [a, b],
        goed: a + b,
        extra: { stand: stand === "som" ? 1 : 0 },
      };

      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst({ vraagteksten: { standaard: zinnen(stand) } }, inst, groep, gegevens),
        /* Bij de hele som drie getallen, anders alleen de uitkomst. */
        antwoord: stand === "som" ? `${a},${b},${a + b}` : String(a + b),
        figuur: { soort: "plaatjessom", eerste: a, tweede: b, stand, voorwerp: soort },
        somgegevens: gegevens,
      });
    }

    /*
      Zelf bouwen: elk plaatje gaat met een tik naar de tienstrook. Alleen bij
      "alleen de uitkomst"; bij de hele som telt het kind zelf beide groepjes.
      Van klein naar groot, met een vaste plek.
    */
    if (optelwerking(inst) === "bouwen" && stand !== "som") {
      const totaal = (v: Gegenereerd) => v.somgegevens.goed * 100 + (v.somgegevens.getallen[0] ?? 0);
      return [...uit]
        .sort((x, y) => totaal(x) - totaal(y))
        .map((v, i) =>
          v.figuur?.soort === "plaatjessom"
            ? { ...v, figuur: { ...v.figuur, bouw: "strook" as const, hulpBijFout: "strook" as const, volgnummer: i + 1 } }
            : v,
        );
    }

    return uit;
  },
};
