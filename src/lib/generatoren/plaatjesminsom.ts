/**
 * Aftrekken met plaatjes: groep voorwerpen − groep voorwerpen = ▢.
 *
 * ---------------------------------------------------------------------------
 * Twee standen
 * ---------------------------------------------------------------------------
 * "Alleen plaatjes": er staan nergens getallen, dus het kind moet echt tellen.
 * "Met getallen erbij": onder elk groepje staat het getal in een geel vakje,
 * zodat het kind de plaatjes en de som naast elkaar ziet staan.
 *
 * ---------------------------------------------------------------------------
 * Eerst zien, dan rekenen
 * ---------------------------------------------------------------------------
 * De eerste sommen van de oefening zijn visueel: daar streept het kind in het
 * grote groepje zelf weg wat eraf gaat. Daarna rekent het zelf. Hoeveel sommen
 * dat zijn staat in de instelling "Hoeveel sommen met wegstrepen".
 */

import {
  getal,
  heelGetal,
  kansGenerator,
  lijst,
  tekst,
  type Generator,
  type Gegenereerd,
  type Instellingen,
  bepaalVraagtekst,
  vraagtekstVelden,
} from "@/lib/generatoren/soort";
import type { Leeftijdsgroep } from "@/lib/generatoren/foutpatroon";
import { plaatjesReeks, plaatjesVeld } from "@/lib/generatoren/plaatjeskeuze";
import { heelGetalBovenaan } from "@/lib/generatoren/bovenaan";
import { erafPatronen } from "@/lib/generatoren/patronen/erafsommen";
import { plaatjesminsomAanpak } from "@/lib/generatoren/aanpak/erafsommen";
import { plaatjesminsomUitleg } from "@/lib/generatoren/scripts/erafsommen";
import { paren } from "@/lib/generatoren/wegstrepen";
import { VISUEEL_VELD, visueleSommen } from "@/lib/generatoren/visueel";
import { meervoudVanTelplaatje } from "@/lib/telplaatjes";

/*
  Twee zinnen, want de twee standen laten iets anders zien.

  Zonder getallen staat de som eronder in gewone cijfers en is "Hoeveel
  blijven er over?" genoeg: korter kan niet en het beeld zegt de rest. Met de
  getallen erbij noemt de zin het voorwerp, zodat duidelijk is waar de labels
  over gaan.
*/
const ZIN_KAAL = "Hoeveel blijven er over?";
const ZIN_MET_NAAM = "Hoeveel {plaatjes} blijven er over?";

/** De zin als het voorwerp geen naam heeft; dan blijft het bij "hoeveel". */
const ZONDER_NAAM: Record<Leeftijdsgroep, string> = {
  "34": ZIN_KAAL,
  "56": ZIN_KAAL,
  "78": ZIN_KAAL,
};

/** Welke standaardzin bij deze stand hoort. */
function zinnen(metGetallen: boolean): Record<Leeftijdsgroep, string> {
  const zin = metGetallen ? ZIN_MET_NAAM : ZIN_KAAL;
  return { "34": zin, "56": zin, "78": zin };
}

const STANDAARDZINNEN: Record<Leeftijdsgroep, string> = zinnen(false);

const MAX_TOTAAL = 20;

export function grenzen(inst: Instellingen) {
  const van = Math.max(2, Math.min(MAX_TOTAAL, getal(inst, "van", 6)));
  const tot = Math.max(van, Math.min(MAX_TOTAAL, getal(inst, "tot", 15)));
  const afTot = Math.max(1, Math.min(10, getal(inst, "afTot", 5)));
  return {
    van,
    tot,
    afTot,
    metGetallen: tekst(inst, "getallen", "nee") === "ja",
    visueel: visueleSommen(inst),
    plaatjes: lijst(inst, "plaatjes", []),
  };
}

export const plaatjesminsomGenerator: Generator = {
  id: "plaatjesminsom",
  naam: "Aftrekken met plaatjes",
  uitleg:
    "Een groepje voorwerpen min een groepje voorwerpen, met een leeg vakje voor de uitkomst. Met de getallen erbij of alleen de plaatjes. Bij de eerste sommen streept het kind zelf weg.",
  suggestie: "Groep 4: 6 tot en met 15 voorwerpen, hoogstens 5 eraf",
  velden: [
    {
      soort: "keuze",
      sleutel: "getallen",
      label: "Getallen onder de groepjes",
      opties: [
        { waarde: "nee", label: "Alleen plaatjes" },
        { waarde: "ja", label: "Met het getal onder elk groepje" },
      ],
      hulp: "Alleen plaatjes is de eerste stap: het kind moet zelf tellen. Met de getallen erbij ziet het de plaatjes en de som naast elkaar.",
    },
    { soort: "getal", sleutel: "van", label: "Minste voorwerpen", min: 2, max: MAX_TOTAAL },
    { soort: "getal", sleutel: "tot", label: "Meeste voorwerpen", min: 2, max: MAX_TOTAAL },
    {
      soort: "getal",
      sleutel: "afTot",
      label: "Hoogstens hoeveel eraf",
      min: 1,
      max: 10,
      hulp: "Er gaat er altijd minstens één af, en nooit meer dan er staan.",
    },
    VISUEEL_VELD,
    plaatjesVeld,
    ...vraagtekstVelden(STANDAARDZINNEN, {
      voorbeeldzinnen: { "34": ZIN_KAAL, "56": ZIN_KAAL, "78": ZIN_KAAL },
      extraHulp:
        "Zonder getallen is de zin kort, want de som staat eronder. Met de getallen erbij noemt hij het voorwerp. {plaatjes} wordt vervangen door de naam van het voorwerp in die vraag, in het meervoud: appels, muisjes, vlinders.",
    }),
  ],
  vraagteksten: { standaard: STANDAARDZINNEN },
  standaard: { getallen: "nee", van: 6, tot: 15, afTot: 5, visueel: 3, plaatjes: [] },
  foutpatronen: erafPatronen,
  aanpak: plaatjesminsomAanpak,
  uitleganimatie: plaatjesminsomUitleg,

  maximum: (inst) => {
    const { van, tot, afTot } = grenzen(inst);
    return paren(van, tot, afTot).length;
  },

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const { van, tot, afTot, metGetallen, visueel, plaatjes } = grenzen(inst);
    const mogelijk = paren(van, tot, afTot);
    if (mogelijk.length === 0) return [];
    const reeks = plaatjesReeks(kans, plaatjes);

    const uit: Gegenereerd[] = [];
    for (let poging = 0; poging < aantal * 300 && uit.length < aantal; poging++) {
      /* Vooral grote getallen; zie `heelGetalBovenaan`. */
      const totaal = heelGetalBovenaan(kans, van, tot);
      const eraf = heelGetal(kans, 1, Math.min(afTot, totaal));

      const handtekening = `plaatjesminsom:${metGetallen ? "getallen" : "plaatjes"}:${totaal}-${eraf}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const gegevens = {
        soort: "plaatjesminsom",
        variant: metGetallen ? "getallen" : "plaatjes",
        getallen: [totaal, eraf],
        goed: totaal - eraf,
      };

      const voorwerp = reeks[uit.length % reeks.length];
      const meervoud = meervoudVanTelplaatje(voorwerp);

      uit.push({
        handtekening,
        vorm: "open",
        /* Zonder naam valt de zin terug op "Hoeveel blijven er over?". */
        vraagtekst: bepaalVraagtekst(
          {
            vraagteksten: {
              standaard: meervoud === "" ? ZONDER_NAAM : zinnen(metGetallen),
            },
          },
          inst,
          groep,
          gegevens,
          { plaatjes: meervoud },
        ),
        antwoord: String(totaal - eraf),
        figuur: {
          soort: "plaatjesminsom",
          totaal,
          eraf,
          voorwerp,
          metGetallen,
          /* De eerste sommen van de oefening zijn die met wegstrepen. */
          visueel: uit.length < visueel,
        },
        somgegevens: gegevens,
      });
    }

    return uit;
  },
};
