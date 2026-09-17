/**
 * Vos gaat vissen: welk getal is het grootste of het kleinste?
 *
 * Drie of vier vissen zwemmen met een getal op hun buik. Het kind tikt de vis
 * aan die het zoekt. De vissen zijn tegelijk de antwoordknoppen: er staat geen
 * rijtje getallen onder de vraag.
 *
 * ---------------------------------------------------------------------------
 * Waarom de foute keuzes geen willekeurige getallen zijn
 * ---------------------------------------------------------------------------
 * Ze zwemmen er alle drie sowieso, want elke vis is aan te tikken. Maar welke
 * vis wélke fout is, wordt hier vastgelegd: het andere uiterste, de vis die het
 * dichtst bij Vos zwemt, en de vis met het grootste eerste cijfer. Die laatste
 * is de bekendste denkfout van deze leeftijd: 9 lijkt groter dan 12, omdat er
 * van links naar rechts wordt vergeleken.
 *
 * Valt zo'n fout samen met het goede antwoord — bij drie vissen van één cijfer
 * is de grootste ook die met het grootste eerste cijfer — dan gaat dat patroon
 * gewoon niet af. Beter geen uitleg dan de verkeerde.
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
import { vissenPatronen } from "@/lib/generatoren/patronen/vissen";
import { vissenAanpak } from "@/lib/generatoren/aanpak/vissen";
import { vissenUitleg } from "@/lib/generatoren/scripts/vissen";

/**
 * De standaardzinnen van dit type.
 *
 * Bij dit type verschilt de zin per vraag: soms wordt de grootste gevraagd en
 * soms de kleinste. Dat staat dus in de zin zelf, met `{som}` als plek waar het
 * woord komt — anders zou het kind moeten raden wat er gezocht wordt.
 */
const STANDAARDZINNEN: Record<Leeftijdsgroep, string> = {
  "34": "Vang de {som} vis!",
  "56": "Tik de vis aan met het {som} getal.",
  "78": "Welke vis heeft het {som} getal?",
};

const MIN_GETAL = 1;
const MAX_GETAL = 100;

/**
 * De vissende vos, en waar zijn hengelpuntje op dat plaatje zit.
 *
 * Dit is de ene plek in de code waar het staat. Het touw wordt in code
 * getekend en moet precies aan het ringetje bovenaan de hengel vastzitten;
 * daarom is dat punt geen getal in de tekening maar een gegeven van de
 * afbeelding: `x` procent van de breedte, `y` procent van de hoogte, gerekend
 * vanaf linksboven. Omdat het percentages zijn, blijft het touw eraan vast op
 * elk schermformaat.
 *
 * Opgemeten in de pixels van `vissen.png` (1254 bij 1254): het hart van het
 * ringetje ligt op x 1195, y 51. Dat is 95,3 % en 4,1 %.
 *
 * Alle drie zijn ze hieronder ook een instelling bij het sjabloon, zodat een
 * andere vos met de hengel op een andere plek erin kan zonder dat hier iets
 * hoeft te veranderen.
 */
export const HENGELVOS = {
  afbeelding: "vissen.png",
  x: 95.3,
  y: 4.1,
};

export function grenzen(inst: Instellingen) {
  const van = Math.max(MIN_GETAL, Math.min(MAX_GETAL, getal(inst, "van", 1)));
  const tot = Math.max(van, Math.min(MAX_GETAL, getal(inst, "tot", 20)));
  return {
    van,
    tot,
    zoek: tekst(inst, "zoek", "grootste"),
    aantal: Math.max(2, Math.min(4, getal(inst, "aantalVissen", 3))),
    hengel: hengelVan(inst),
  };
}

/**
 * De hengelvos zoals het sjabloon hem heeft staan.
 *
 * Staat er niets, dan geldt `HENGELVOS` hierboven. Zo werkt een sjabloon dat
 * van vóór deze afbeelding is gewoon mee, en kan een nieuwe afbeelding met de
 * hengel op een andere plek er los in.
 */
export function hengelVan(inst: Instellingen) {
  const afbeelding = tekst(inst, "vosHengel", HENGELVOS.afbeelding).trim();
  return {
    afbeelding: afbeelding === "" ? null : afbeelding,
    x: Math.max(0, Math.min(100, getal(inst, "hengelX", HENGELVOS.x))),
    y: Math.max(0, Math.min(100, getal(inst, "hengelY", HENGELVOS.y))),
  };
}

/** Welk getal een kind kiest dat alleen naar het eerste cijfer kijkt. */
export function opEersteCijfer(getallen: number[], grootste: boolean): number {
  const cijfer = (n: number) => Number(String(n)[0]);
  return [...getallen].sort((a, b) =>
    grootste ? cijfer(b) - cijfer(a) || b - a : cijfer(a) - cijfer(b) || a - b,
  )[0];
}

export const vissenGenerator: Generator = {
  id: "vissen",
  naam: "Vos gaat vissen (vergelijken)",
  uitleg:
    "Drie of vier vissen zwemmen met een getal op hun buik; het kind tikt de vis met het grootste of het kleinste getal aan. De vissen zijn zelf de knoppen, dus er staat geen rijtje getallen onder de vraag.",
  suggestie:
    "Groep 3: 1 tot 10, drie vissen, alleen de grootste · groep 4: 1 tot 20, vier vissen, door elkaar",
  velden: [
    {
      soort: "keuze",
      sleutel: "zoek",
      label: "Wat het kind zoekt",
      opties: [
        { waarde: "grootste", label: "Het grootste getal" },
        { waarde: "kleinste", label: "Het kleinste getal" },
        { waarde: "beide", label: "Door elkaar" },
      ],
      hulp: "Alleen de grootste is het makkelijkst: het kind hoeft maar één ding te onthouden. Door elkaar is een stuk moeilijker, want dan moet het eerst de vraag lezen voordat het kijkt — en precies dat vergeten kinderen het vaakst.",
    },
    {
      soort: "getal",
      sleutel: "aantalVissen",
      label: "Hoeveel vissen",
      min: 2,
      max: 4,
      hulp: "Drie vissen is genoeg om te moeten vergelijken. Vier maakt het lastiger: het kind kan er dan niet meer twee tegelijk in één oogopslag bekijken.",
    },
    {
      soort: "getal",
      sleutel: "van",
      label: "Kleinste getal",
      min: MIN_GETAL,
      max: MAX_GETAL,
    },
    {
      soort: "getal",
      sleutel: "tot",
      label: "Grootste getal",
      min: MIN_GETAL,
      max: MAX_GETAL,
      hulp: "Alle getallen op de vissen blijven hierbinnen. Een bereik dat over de tien heen gaat — bijvoorbeeld 1 tot 20 — is juist nuttig: dan komt de vergissing „9 is groter dan 12” vanzelf langs.",
    },
    {
      soort: "afbeelding",
      sleutel: "vosHengel",
      label: "Vos met hengel",
      hulp: "De vos die op de steiger staat, met zijn hengel in zijn poten. Hij hoort rechtop te staan met de hengel schuin omhoog naar rechtsboven. Het touw wordt in code getekend en zit vast aan het puntje dat je hieronder opgeeft. Leeg = terug naar de gewone vos van het afbeeldingenbeheer, met een hengel die in code getekend wordt.",
    },
    {
      soort: "getal",
      sleutel: "hengelX",
      label: "Hengelpuntje — van links",
      min: 0,
      max: 100,
      stap: 0.1,
      hulp: "Hoe ver het puntje van de hengel vanaf de linkerkant van de afbeelding staat, in procenten van de breedte. Bij de meegeleverde vos is dat 95,3: het ringetje zit bijna helemaal rechts. Klopt het touw niet met een andere afbeelding, dan is dit het getal dat je bijstelt.",
    },
    {
      soort: "getal",
      sleutel: "hengelY",
      label: "Hengelpuntje — van boven",
      min: 0,
      max: 100,
      stap: 0.1,
      hulp: "Hoe ver het puntje van de hengel vanaf de bovenkant van de afbeelding staat, in procenten van de hoogte. Bij de meegeleverde vos is dat 4,1: het ringetje zit vlak onder de bovenrand.",
    },
    /* Overal dezelfde velden om de vraagzin aan te passen, per groep. */
    ...vraagtekstVelden(STANDAARDZINNEN),
  ],
  vraagteksten: {
    standaard: STANDAARDZINNEN,
    /*
      `{som}` is hier geen som maar een woord: grootste of kleinste. Dat wisselt
      per vraag, dus het moet in de zin staan — anders zou het kind moeten raden
      wat er gezocht wordt, en dat is precies de fout die dit type wil opsporen.
    */
    som: (som) => ((som.extra?.grootste ?? 1) === 1 ? "grootste" : "kleinste"),
  },
  standaard: {
    van: 1,
    tot: 20,
    zoek: "grootste",
    aantalVissen: 3,
    vosHengel: HENGELVOS.afbeelding,
    hengelX: HENGELVOS.x,
    hengelY: HENGELVOS.y,
  },
  foutpatronen: vissenPatronen,
  aanpak: vissenAanpak,
  uitleganimatie: vissenUitleg,

  /*
    Er zijn er veel meer mogelijk dan er ooit nodig zijn — elke combinatie van
    getallen is een eigen vraag. Begrensd op iets wat ruim genoeg is voor een
    hele reeks sessies zonder herhaling.
  */
  maximum: (inst) => {
    const { van, tot, zoek } = grenzen(inst);
    const ruimte = Math.max(0, tot - van + 1);
    return Math.min(200, ruimte * (zoek === "beide" ? 4 : 2));
  },

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const { van, tot, zoek, aantal: hoeveelVissen, hengel } = grenzen(inst);

    const uit: Gegenereerd[] = [];
    for (let poging = 0; poging < aantal * 300 && uit.length < aantal; poging++) {
      if (tot - van + 1 < hoeveelVissen) break;

      /* Allemaal verschillend: twee vissen met hetzelfde getal is geen keuze. */
      const getallen: number[] = [];
      for (let p = 0; p < 200 && getallen.length < hoeveelVissen; p++) {
        const n = heelGetal(kans, van, tot);
        if (!getallen.includes(n)) getallen.push(n);
      }
      if (getallen.length < hoeveelVissen) continue;

      const grootste = zoek === "beide" ? kans() < 0.5 : zoek === "grootste";
      const goed = grootste ? Math.max(...getallen) : Math.min(...getallen);
      const andersom = grootste ? Math.min(...getallen) : Math.max(...getallen);

      const handtekening = `vissen:${grootste ? "g" : "k"}:${[...getallen].sort((a, b) => a - b).join("-")}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      /*
        De vis die het dichtst bij Vos zwemt is de laatste in de rij: Vos zit
        rechtsonder aan de kant. Dat is geen detail — het is precies de vis die
        een kind pakt dat niet kijkt maar grijpt.
      */
      const dichtbij = getallen[getallen.length - 1];

      const gegevens = {
        soort: "vissen",
        variant: grootste ? "grootste" : "kleinste",
        getallen,
        goed,
        extra: {
          grootste: grootste ? 1 : 0,
          andersom,
          dichtbij,
          eersteCijfer: opEersteCijfer(getallen, grootste),
        },
      };

      uit.push({
        handtekening,
        vorm: "meerkeuze",
        vraagtekst: bepaalVraagtekst(vissenGenerator, inst, groep, gegevens),
        /*
          De opties staan in dezelfde volgorde als de vissen zwemmen; het
          antwoord is de plek van de goede vis. Zo hoeft het vijvertje niets te
          weten van antwoorden: het geeft door welke vis is aangetikt.
        */
        opties: getallen.map((n) => ({ tekst: String(n), afbeelding: null })),
        antwoord: String(getallen.indexOf(goed)),
        figuur: {
          soort: "visvijver",
          vissen: getallen.map((n) => ({ getal: n })),
          zoek: grootste ? "grootste" : "kleinste",
          /* De vos komt van de standaardvos; zie `haalStandaardvos`. */
          vos: { vangend: null, wachtend: null, blij: null },
          /*
            De vissende vos hoort bij dit type en niet bij de som, dus hij
            wordt bij het tonen opnieuw uit het sjabloon gehaald — net als de
            gewone vos. Wat hier staat is de terugval voor als het sjabloon
            weg is.
          */
          hengel,
        },
        somgegevens: gegevens,
      });
    }

    return uit;
  },
};
