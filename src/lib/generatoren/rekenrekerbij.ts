/**
 * Optellen met het rekenrek (oktober 2026).
 *
 * Het eerste getal staat al links op het rek. Het kind schuift het tweede
 * getal erbij, in één beweging per keer, en eerst de bovenste rij vol. Pas als
 * alle kralen van het tweede getal geschoven zijn, werkt het antwoordvakje.
 *
 * "Om en om": opgave 1, 3, 5, 7 en 9 met het rekenrek; 2, 4, 6, 8 en 10 zo'n
 * zelfde som zonder; 11 tot en met 15 alleen de som. Na een fout antwoord
 * schuiven de kralen rustig zelf zoals het hoort. Vijftien vaste opgaven, van
 * makkelijk naar moeilijk.
 *
 * Vijf standen, één per oefening:
 *   tot10      3 + 4
 *   zonder     12 + 5: de bovenste rij staat al vol, 2 op de onderste
 *   aanvullen  7 + ▢ = 10: het kind schuift de bovenste rij vol
 *   over10     8 + 5: eerst de 10 vol, dan de rest
 *   pootjes    6 + 5 met de pootjes onder de 5, en het rekenrek erbij
 */

import {
  husselen,
  kansGenerator,
  tekst,
  type Generator,
  type Gegenereerd,
  type Instellingen,
  bepaalVraagtekst,
  vraagtekstVelden,
} from "@/lib/generatoren/soort";
import type { Aanpak, Leeftijdsgroep, Somgegevens } from "@/lib/generatoren/foutpatroon";
import { optelPatronen } from "@/lib/generatoren/patronen/optelopdrachten";
import { plussomUitleg } from "@/lib/generatoren/scripts/optelopdrachten";
import { omEnOm, optelwerking } from "@/lib/generatoren/optelwerking";

type Stand = "tot10" | "zonder" | "aanvullen" | "over10" | "pootjes";
const STANDEN: Stand[] = ["tot10", "zonder", "aanvullen", "over10", "pootjes"];

function standVan(inst: Instellingen): Stand {
  const s = tekst(inst, "stand", "tot10") as Stand;
  return STANDEN.includes(s) ? s : "tot10";
}

const ZIN = "Vul in.";
const ZINNEN: Record<Leeftijdsgroep, string> = { "34": ZIN, "56": ZIN, "78": ZIN };

/**
 * De opdrachtzin (ronde 2): staat er alleen een leeg vakje achter het =-teken
 * (3 + 4 = ▢), dan "Reken uit."; ontbreekt er een getal ergens anders (7 + ▢ =
 * 10, of de pootjes), dan "Vul in.".
 */
function zinnenVoor(stand: Stand): Record<Leeftijdsgroep, string> {
  const zin = stand === "aanvullen" || stand === "pootjes" ? "Vul in." : "Reken uit.";
  return { "34": zin, "56": zin, "78": zin };
}

/** De doelsom van "aanvullen": tot 10, of tot 20 als het eerste getal boven de 10 ligt. */
function doelVan(eerste: number): number {
  return eerste < 10 ? 10 : 20;
}

/** Alle sommen die bij een stand passen, als [eerste, tweede]. */
function sommen(stand: Stand): [number, number][] {
  const uit: [number, number][] = [];
  if (stand === "tot10") {
    for (let a = 1; a <= 9; a++) for (let b = 1; a + b <= 10; b++) if (a + b >= 3) uit.push([a, b]);
  } else if (stand === "zonder") {
    for (let a = 10; a <= 18; a++) for (let b = 1; b <= 9; b++) if ((a % 10) + b <= 10 && a + b <= 20) uit.push([a, b]);
  } else if (stand === "aanvullen") {
    /* Altijd over 10 (ronde 2); de twee vormen komen in `maak`. */
    for (let a = 9; a >= 1; a--) uit.push([a, 10 - a]);
  } else {
    /* Over de 10: het eerste getal 5 tot en met 9, zoals bij aanvullen tot 10 op school. */
    for (let a = 5; a <= 9; a++) for (let b = 2; b <= 9; b++) if (a + b > 10) uit.push([a, b]);
  }
  return uit;
}

/** Wat er in de vakjes hoort, in de volgorde van het antwoord. */
export function rekenrekAntwoord(stand: Stand, eerste: number, tweede: number): number[] {
  if (stand === "aanvullen") return [tweede];
  if (stand === "pootjes") return [10 - eerste, tweede - (10 - eerste), eerste + tweede];
  return [eerste + tweede];
}

/**
 * De zin bij goed en fout, in gewone taal:
 *   "3 en 4 is 7."
 *   "7 en 3 is 10."
 *   "8 + 2 = 10, en dan nog 3 erbij: 13."
 *   "6 en 4 is samen 10. En nog 1 erbij: 11."
 */
export function rekenrekZin(stand: Stand, eerste: number, tweede: number): string {
  const n = eerste + tweede;
  if (stand === "over10") return `${eerste} + ${10 - eerste} = 10, en dan nog ${n - 10} erbij: ${n}.`;
  if (stand === "pootjes") return `${eerste} en ${10 - eerste} is samen 10. En nog ${n - 10} erbij: ${n}.`;
  return `${eerste} en ${tweede} is ${n}.`;
}

function delen(som: Somgegevens) {
  const [eerste, tweede] = som.getallen;
  const stand = (STANDEN[som.extra?.stand ?? 0] ?? "tot10") as Stand;
  return { eerste, tweede, stand };
}

export const rekenrekerbijAanpak: Aanpak = {
  zin: (som) => {
    const { eerste, tweede, stand } = delen(som);
    const zin =
      stand === "over10" || stand === "pootjes"
        ? `Maak eerst de 10 vol: ${eerste} + ${10 - eerste} = 10. Dan de rest erbij.`
        : stand === "aanvullen"
          ? `Hoeveel kralen moeten erbij tot ${doelVan(eerste)}?`
          : `Begin bij ${eerste} en schuif er ${tweede} bij.`;
    return { "34": zin, "56": zin, "78": zin };
  },
  stappen: (som) => {
    const { eerste, tweede, stand } = delen(som);
    return [
      { tekst: "Dit staat er al.", som: String(eerste) },
      { tekst: "Schuif de kralen erbij.", som: stand === "aanvullen" ? `${eerste} + ▢ = ${eerste + tweede}` : `${eerste} + ${tweede}` },
      { tekst: "Dat is samen:", som: String(eerste + tweede) },
    ];
  },
  controle: (som) => {
    const { eerste, tweede, stand } = delen(som);
    return rekenrekZin(stand, eerste, tweede);
  },
};

export const rekenrekerbijGenerator: Generator = {
  id: "rekenrekerbij",
  naam: "Optellen met het rekenrek",
  uitleg:
    "Het eerste getal staat al links op het rekenrek; het kind schuift het tweede getal erbij, eerst de bovenste rij vol. Om en om met en zonder rekenrek; na een fout antwoord schuiven de kralen zelf.",
  suggestie: "Groep 4: tot 10, zonder over de 10, aanvullen tot 10, over de 10, splitsen via 10",
  velden: [
    {
      soort: "keuze",
      sleutel: "stand",
      label: "Soort som",
      opties: [
        { waarde: "tot10", label: "Optellen tot en met 10 (3 + 4)" },
        { waarde: "zonder", label: "Tot en met 20 zonder over de 10 (12 + 5)" },
        { waarde: "aanvullen", label: "Aanvullen tot 10 (7 + ▢ = 10)" },
        { waarde: "over10", label: "Over de 10 (8 + 5)" },
        { waarde: "pootjes", label: "Splitsen via 10 met pootjes (6 + 5)" },
      ],
    },
    {
      soort: "keuze",
      sleutel: "werking",
      label: "Werking",
      opties: [
        { waarde: "typen", label: "Alleen typen (zonder rekenrek)" },
        { waarde: "bouwen", label: "Om en om met het rekenrek" },
        { waarde: "alles", label: "Bij alle 15 opgaven met het rekenrek" },
      ],
      hulp: "Alleen typen geldt meteen, ook voor de opgaven die er al liggen.",
    },
    { soort: "getal", sleutel: "niveau", label: "Bolletjes", min: 1, max: 5 },
    ...vraagtekstVelden(ZINNEN),
  ],
  vraagteksten: { standaard: ZINNEN },
  standaard: { stand: "tot10", werking: "bouwen", niveau: 1 },
  foutpatronen: optelPatronen,
  aanpak: rekenrekerbijAanpak,
  uitleganimatie: plussomUitleg,

  /* Bij aanvullen telt elke som twee keer: 7 + ▢ = 10 en 10 = 7 + ▢. */
  maximum: (inst) => sommen(standVan(inst)).length * (standVan(inst) === "aanvullen" ? 2 : 1),

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const stand = standVan(inst);
    /*
      "alles" (oktober 2026): bij elke opgave het rekenrek, van makkelijk naar
      moeilijk. "bouwen": om en om. Bij allebei schuiven de kralen na een fout
      antwoord zelf.
    */
    const werking = tekst(inst, "werking", "typen");
    const alleRek = werking === "alles";
    const metRek = alleRek || optelwerking(inst) === "bouwen";
    const opMoeite = (x: [number, number], y: [number, number]) => x[0] + x[1] - (y[0] + y[1]) || x[0] - y[0];
    const alle = sommen(stand);
    /*
      Aanvullen tot 10 (ronde 2): de negen sommen in twee vormen om en om,
      7 + ▢ = 10 en 10 = 7 + ▢. Eerst alle negen, dan nog zes in de andere vorm:
      vijftien verschillende opgaven, allemaal over 10.
    */
    const vormen: [number, number, boolean][] =
      stand === "aanvullen"
        ? [
            ...alle.map(([a, b], i): [number, number, boolean] => [a, b, i % 2 === 1]),
            ...alle.slice(0, 6).map(([a, b], i): [number, number, boolean] => [a, b, i % 2 === 0]),
          ]
        : husselen(kans, alle)
            .slice(0, 15)
            .sort(opMoeite)
            .map(([a, b]): [number, number, boolean] => [a, b, false]);
    const gekozen = vormen.slice(0, 15);
    /* De eerste tien om en om, van makkelijk naar moeilijk; dan nog vijf. */
    const tien = gekozen.slice(0, 10);
    const reeks = alleRek
      ? gekozen.map((som) => ({ som, bouwen: true }))
      : omEnOm(
          tien.filter((_, i) => i % 2 === 0),
          tien.filter((_, i) => i % 2 === 1),
          gekozen.slice(10),
        );

    const uit: Gegenereerd[] = [];
    for (const { som: [eerste, tweede, omgekeerd], bouwen } of reeks) {
      if (uit.length >= aantal) break;
      const handtekening = `rekenrekerbij:${stand}:${omgekeerd ? "om:" : ""}${eerste}+${tweede}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);
      const gegevens = {
        soort: "rekenrekerbij",
        variant: stand,
        getallen: [eerste, tweede],
        goed: stand === "aanvullen" ? tweede : eerste + tweede,
        extra: { stand: STANDEN.indexOf(stand) },
      };
      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst({ vraagteksten: { standaard: zinnenVoor(stand) } }, inst, groep, gegevens),
        antwoord: rekenrekAntwoord(stand, eerste, tweede).join(","),
        figuur: {
          soort: "rekenrekerbij",
          stand,
          eerste,
          tweede,
          ...(omgekeerd ? { omgekeerd: true } : {}),
          ...(metRek && bouwen ? { rekenrek: true } : {}),
          ...(metRek ? { hulpBijFout: true } : {}),
          volgnummer: uit.length + 1,
        },
        somgegevens: gegevens,
      });
    }
    return uit;
  },
};

