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
 *
 * Bij groep 3-4 staat er letterlijk wat er moet gebeuren: slepen. "Zet de
 * trein" zei wel wat het resultaat moest zijn, maar niet hoe je daar komt — en
 * het klopte ook niet helemaal, want het gaat om de wagons en niet om de hele
 * trein. Deze kinderen lezen bovendien nog nauwelijks, dus het handje dat het
 * voordoet is minstens zo belangrijk als de zin.
 *
 * Eén zin voor alle groepen, en met opzet dezelfde overal: onder één leerdoel
 * hangen meerdere oefeningen, en wisselende zinnen lopen dan door elkaar.
 *
 * `{som}` wordt "van klein naar groot" of "van groot naar klein", naar de
 * volgorde die in díé vraag zit. Zo klinkt het zoals op school; "laag" en
 * "hoog" gaan bij kinderen van deze leeftijd eerder over hoogte dan over
 * hoeveelheid. Staat de instelling op door elkaar, dan kiest elke vraag
 * vanzelf de zin die erbij hoort.
 */
const VASTE_ZIN = "Sleep de wagons {som}.";

/** Dezelfde zin met `{som}` ingevuld, als grijs voorbeeld in het beheer. */
const VOORBEELDZIN = "Sleep de wagons van klein naar groot.";

const STANDAARDZINNEN: Record<Leeftijdsgroep, string> = {
  "34": VASTE_ZIN,
  "56": VASTE_ZIN,
  "78": VASTE_ZIN,
};

const MIN_GETAL = 1;
const MAX_GETAL = 100;

/**
 * Het meeste aantal wagons.
 *
 * Tien past nog: de wagons delen de ruimte die de locomotief overlaat, en die
 * locomotief krimpt mee zodra de trein langer wordt — zie `Trein`. Meer dan
 * tien maakt de getallen onleesbaar op een telefoon.
 */
const MAX_WAGONS = 10;

/**
 * Vos als machinist, en waar hij in de locomotief komt te zitten.
 *
 * Dit is de ene plek waar het raampje vastligt. `raampje` staat in de eenheden
 * waarin de locomotief getekend wordt (120 breed, 150 hoog), precies hetzelfde
 * rechthoekje als dat in de tekening: verschuif of vergroot het hier, en het
 * glas én de afbeelding erin gaan samen mee. Staan ze los van elkaar, dan valt
 * Vos vroeg of laat half over de rand.
 *
 * De afbeelding is ook een instelling bij het sjabloon, zodat er een andere
 * machinist in kan zonder dat hier iets hoeft te veranderen. Past die anders in
 * het raampje, zeg het dan: het raampje zelf staat hier.
 */
export const MACHINIST = {
  afbeelding: "trein.png",
  raampje: { x: 40, y: 28, breedte: 72, hoogte: 72 },
};

export function grenzen(inst: Instellingen) {
  const van = Math.max(MIN_GETAL, Math.min(MAX_GETAL, getal(inst, "van", 1)));
  const tot = Math.max(van, Math.min(MAX_GETAL, getal(inst, "tot", 20)));
  return {
    van,
    tot,
    richting: tekst(inst, "richting", "oplopend"),
    aantal: Math.max(3, Math.min(MAX_WAGONS, getal(inst, "aantalWagons", 4))),
    machinist: machinistVan(inst),
  };
}

/**
 * De machinist zoals het sjabloon hem heeft staan.
 *
 * Staat er niets, dan geldt `MACHINIST` hierboven. Zo werkt een sjabloon van
 * vóór deze afbeelding gewoon mee.
 */
export function machinistVan(inst: Instellingen) {
  const afbeelding = tekst(inst, "vosMachinist", MACHINIST.afbeelding).trim();
  return { afbeelding: afbeelding === "" ? null : afbeelding };
}

export const treinGenerator: Generator = {
  id: "trein",
  naam: "Vos' trein (op volgorde zetten)",
  uitleg:
    "Vier of vijf wagons met getallen staan door elkaar; het kind sleept ze op volgorde achter de locomotief. Klopt het, dan rijdt de trein toeterend weg. Oefent ordenen, niet alleen vergelijken.",
  suggestie:
    "Groep 3: 1 tot 10, vier wagons, van klein naar groot · groep 4: 1 tot 20, vijf wagons, door elkaar",
  velden: [
    {
      soort: "keuze",
      sleutel: "richting",
      label: "Welke volgorde",
      opties: [
        { waarde: "oplopend", label: "Van klein naar groot" },
        { waarde: "aflopend", label: "Van groot naar klein" },
        { waarde: "beide", label: "Door elkaar" },
      ],
      hulp: "Van klein naar groot is de gewone volgorde en gaat het makkelijkst. Van groot naar klein is lastiger: kinderen vallen tijdens het werk terug op oplopend zonder het te merken. Door elkaar dwingt ze om eerst de vraag te lezen. Dezelfde woorden als in de vraagzin die het kind krijgt.",
    },
    {
      soort: "getal",
      sleutel: "aantalWagons",
      label: "Hoeveel wagons",
      min: 3,
      max: MAX_WAGONS,
      hulp: "Vier wagons past ruim op een telefoon. Vijf maakt het moeilijker: het kind moet dan meer getallen tegelijk overzien. Meer dan zes wordt een lange trein: de wagons worden smaller en de locomotief krimpt mee om ruimte te maken. Op een telefoon is acht het meeste dat nog prettig sleept; tien past, maar de getallen worden dan klein.",
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
    {
      soort: "afbeelding",
      sleutel: "vosMachinist",
      label: "Vos als machinist",
      hulp: "De vos die in het raampje van de locomotief komt te staan: kop, pet en zwaaiende poot, afgesneden op borsthoogte. Hij wordt passend in het raampje gezet, dus hij valt er nooit buiten. Leeg = geen machinist; dan kijkt de gewone vos mee vanaf de kant.",
    },
    /*
      Overal dezelfde velden om de vraagzin aan te passen, per groep.

      Het grijze voorbeeld toont de zin mét `{som}` al ingevuld, anders leest een
      beheerder "Sleep de wagons {som}." en ziet hij niet wat het kind krijgt.
    */
    ...vraagtekstVelden(STANDAARDZINNEN, {
      voorbeeldzinnen: {
        "34": VOORBEELDZIN,
        "56": VOORBEELDZIN,
        "78": VOORBEELDZIN,
      },
    }),
  ],
  vraagteksten: {
    standaard: STANDAARDZINNEN,
    som: (som) =>
      (som.extra?.aflopend ?? 0) === 1 ? "van groot naar klein" : "van klein naar groot",
  },
  standaard: {
    van: 1,
    tot: 20,
    richting: "oplopend",
    aantalWagons: 4,
    vosMachinist: MACHINIST.afbeelding,
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
    const { van, tot, richting, aantal: hoeveelWagons, machinist } = grenzen(inst);

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
          /*
            De machinist hoort bij het type en niet bij de som, dus hij wordt
            bij het tonen opnieuw uit het sjabloon gehaald — net als de vos.
          */
          machinist,
          /* De vos komt van de standaardvos; zie `haalStandaardvos`. */
          vos: { vangend: null, wachtend: null, blij: null },
        },
        somgegevens: gegevens,
      });
    }

    return uit;
  },
};
