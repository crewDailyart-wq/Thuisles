/**
 * Vos' trein: zet de wagons op volgorde.
 *
 * Vier of vijf wagons met getallen staan door elkaar op het rangeerspoor. Het
 * kind sleept ze op volgorde achter de locomotief. Klopt het, dan rijdt de
 * trein weg.
 *
 * ---------------------------------------------------------------------------
 * Waarom slepen en niet aanwijzen
 * ---------------------------------------------------------------------------
 * Ordenen is een handeling: iets op de goede plek leggen. Wie alleen mag
 * aanwijzen welke de kleinste is, oefent vergelijken — dat is het type
 * hiervoor. Hier gaat het erom dat een kind een hele rij tot stand brengt, en
 * daarvoor moet het de dingen echt kunnen verplaatsen.
 *
 * Het slepen is hetzelfde als bij "Tellen en slepen": oppakken met een tik of
 * met een sleep, neerzetten op een lege plek, en wat er staat kun je weer
 * oppakken.
 *
 * ---------------------------------------------------------------------------
 * Het antwoord
 * ---------------------------------------------------------------------------
 * Eén getal per plek, met komma's ertussen, in de volgorde van voor naar
 * achter. Dezelfde vorm als bij "Tellen en slepen", zodat het nakijken, het
 * opslaan en de foutpatronen precies zo werken als daar.
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
import { treinPatronen } from "@/lib/generatoren/patronen/trein";
import { treinAanpak } from "@/lib/generatoren/aanpak/trein";
import { treinUitleg } from "@/lib/generatoren/scripts/trein";

/**
 * De standaardzinnen van dit type.
 *
 * `{som}` wordt "van klein naar groot" of andersom: dat wisselt per vraag, dus
 * het moet in de zin staan. Zonder dat zou het kind moeten raden welke kant op.
 */
const STANDAARDZINNEN: Record<Leeftijdsgroep, string> = {
  "34": "Zet de trein {som}.",
  "56": "Sleep de wagons {som} achter de locomotief.",
  "78": "Zet de wagons in de goede volgorde: {som}.",
};

const MIN_GETAL = 1;
const MAX_GETAL = 100;

export function grenzen(inst: Instellingen) {
  const van = Math.max(MIN_GETAL, Math.min(MAX_GETAL, getal(inst, "van", 1)));
  const tot = Math.max(van, Math.min(MAX_GETAL, getal(inst, "tot", 20)));
  return {
    van,
    tot,
    richting: tekst(inst, "richting", "oplopend"),
    aantal: Math.max(3, Math.min(5, getal(inst, "aantalWagons", 4))),
  };
}

export const treinGenerator: Generator = {
  id: "trein",
  naam: "Vos' trein (op volgorde zetten)",
  uitleg:
    "Vier of vijf wagons met getallen staan door elkaar; het kind sleept ze op volgorde achter de locomotief. Klopt het, dan rijdt de trein toeterend weg. Oefent ordenen, niet alleen vergelijken.",
  suggestie:
    "Groep 3: 1 tot 10, vier wagons, van laag naar hoog · groep 4: 1 tot 20, vijf wagons, door elkaar",
  velden: [
    {
      soort: "keuze",
      sleutel: "richting",
      label: "Welke volgorde",
      opties: [
        { waarde: "oplopend", label: "Van laag naar hoog" },
        { waarde: "aflopend", label: "Van hoog naar laag" },
        { waarde: "beide", label: "Door elkaar" },
      ],
      hulp: "Van laag naar hoog is de gewone volgorde en gaat het makkelijkst. Van hoog naar laag is lastiger: kinderen vallen tijdens het werk terug op oplopend zonder het te merken. Door elkaar dwingt ze om eerst de vraag te lezen.",
    },
    {
      soort: "getal",
      sleutel: "aantalWagons",
      label: "Hoeveel wagons",
      min: 3,
      max: 5,
      hulp: "Vier wagons past ruim op een telefoon. Vijf maakt het moeilijker: het kind moet dan meer getallen tegelijk overzien.",
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
      hulp: "Alle getallen op de wagons blijven hierbinnen. Een bereik dat over de tien heen gaat, is juist nuttig: dan komt de vergissing „9 hoort na 12” vanzelf langs.",
    },
    /* Overal dezelfde velden om de vraagzin aan te passen, per groep. */
    ...vraagtekstVelden(STANDAARDZINNEN),
  ],
  vraagteksten: {
    standaard: STANDAARDZINNEN,
    som: (som) =>
      (som.extra?.aflopend ?? 0) === 1 ? "van hoog naar laag" : "van laag naar hoog",
  },
  standaard: {
    van: 1,
    tot: 20,
    richting: "oplopend",
    aantalWagons: 4,
  },
  foutpatronen: treinPatronen,
  aanpak: treinAanpak,
  uitleganimatie: treinUitleg,

  maximum: (inst) => {
    const { van, tot, richting } = grenzen(inst);
    const ruimte = Math.max(0, tot - van + 1);
    return Math.min(200, ruimte * (richting === "beide" ? 4 : 2));
  },

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const { van, tot, richting, aantal: hoeveelWagons } = grenzen(inst);

    const uit: Gegenereerd[] = [];
    for (let poging = 0; poging < aantal * 300 && uit.length < aantal; poging++) {
      if (tot - van + 1 < hoeveelWagons) break;

      /* Allemaal verschillend: twee wagons met hetzelfde getal is geen volgorde. */
      const getallen: number[] = [];
      for (let p = 0; p < 200 && getallen.length < hoeveelWagons; p++) {
        const n = heelGetal(kans, van, tot);
        if (!getallen.includes(n)) getallen.push(n);
      }
      if (getallen.length < hoeveelWagons) continue;

      const aflopend =
        richting === "beide" ? kans() < 0.5 : richting === "aflopend";

      const volgorde = [...getallen].sort((a, b) => (aflopend ? b - a : a - b));

      /*
        De wagons staan door elkaar op het spoor, en nooit al goed: dan zou er
        niets te ordenen zijn. Bij toeval toch goed? Dan draaien we de eerste
        twee om.
      */
      const opSpoor = husselen(kans, getallen);
      if (opSpoor.every((w, i) => w === volgorde[i]) && opSpoor.length >= 2) {
        [opSpoor[0], opSpoor[1]] = [opSpoor[1], opSpoor[0]];
      }

      const handtekening = `trein:${aflopend ? "af" : "op"}:${[...getallen]
        .sort((a, b) => a - b)
        .join("-")}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const gegevens = {
        soort: "trein",
        variant: aflopend ? "aflopend" : "oplopend",
        getallen,
        /* Eén getal kan het antwoord niet vatten; `goed` is hier het eerste. */
        goed: volgorde[0],
        extra: { aflopend: aflopend ? 1 : 0, wagons: hoeveelWagons },
      };

      uit.push({
        handtekening,
        vorm: "sleepgetallen",
        vraagtekst: bepaalVraagtekst(treinGenerator, inst, groep, gegevens),
        /* De losse wagons, in de volgorde waarin ze op het spoor staan. */
        opties: opSpoor.map((n) => ({ tekst: String(n), afbeelding: null })),
        antwoord: volgorde.join(","),
        figuur: {
          soort: "trein",
          wagons: opSpoor,
          aflopend,
          /* De vos komt van de standaardvos; zie `haalStandaardvos`. */
          vos: { vangend: null, wachtend: null, blij: null },
        },
        somgegevens: gegevens,
      });
    }

    return uit;
  },
};
