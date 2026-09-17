/**
 * Welk vak? — het getal bij een hoeveelheid zoeken.
 *
 * Vos houdt een kaartje vast met een getal. Daaronder staan drie of vier
 * vakken met spulletjes; het kind tikt het vak aan waar er precies zoveel in
 * zitten.
 *
 * ---------------------------------------------------------------------------
 * Andersom dan tellen
 * ---------------------------------------------------------------------------
 * Bij de teltypes ziet een kind een hoeveelheid en zoekt het het getal. Hier is
 * het omgekeerd: het getal staat er, en de hoeveelheid moet erbij gezocht. Dat
 * is een aparte stap — een kind dat vlot telt, kan nog steeds moeite hebben om
 * bij "zeven" meteen zeven dingen voor zich te zien.
 *
 * ---------------------------------------------------------------------------
 * Eén meer, één minder
 * ---------------------------------------------------------------------------
 * Er is een stand waarin niet het getal zelf gezocht wordt maar eentje meer of
 * minder. Dat maakt het een rekenstap in plaats van een zoekstap, en het legt
 * genadeloos bloot of een kind de opdracht leest of alleen het getal ziet.
 *
 * ---------------------------------------------------------------------------
 * Waarom de aantallen dicht bij elkaar liggen
 * ---------------------------------------------------------------------------
 * De aantallen verschillen maar één of twee. Zaten er in het ene vak drie en in
 * het andere twaalf, dan hoeft er niet geteld te worden — dan is het kijken
 * welke groep groter is, en dat is een ander (makkelijker) vraagstuk.
 *
 * ---------------------------------------------------------------------------
 * Rijen van vijf
 * ---------------------------------------------------------------------------
 * De spullen liggen standaard in rijen van vijf, zodat een kind in groepjes
 * kan tellen. Verspreid kan ook en is moeilijker: dan moet het zelf structuur
 * aanbrengen.
 */

import {
  getal,
  heelGetal,
  husselen,
  kansGenerator,
  kiesUit,
  tekst,
  type Generator,
  type Gegenereerd,
  type Instellingen,
  bepaalVraagtekst,
  vraagtekstVelden,
} from "@/lib/generatoren/soort";
import type { Leeftijdsgroep } from "@/lib/generatoren/foutpatroon";
import { TELPLAATJE_NAMEN } from "@/lib/telplaatjes";
import { vakkenPatronen } from "@/lib/generatoren/patronen/vakken";
import { vakkenAanpak } from "@/lib/generatoren/aanpak/vakken";
import { vakkenUitleg } from "@/lib/generatoren/scripts/vakken";

/**
 * De standaardzinnen, met het gezochte aantal erin.
 *
 * Groep 3-4 krijgt "Zoek het vak met:" en daaronder het kaartje met het getal.
 * Die kinderen lezen nog nauwelijks; een korte zin met een dubbele punt en een
 * kaartje eronder is wat ze wél volgen.
 *
 * Vanaf groep 5 staat het aantal gewoon in de zin. `{som}` wordt dan het aantal
 * met het woord erbij — "4 plaatjes", "4 kralen", "4 blokjes" — zodat de zin
 * ook klopt bij het gekozen materiaal.
 */
const STANDAARDZINNEN: Record<Leeftijdsgroep, string> = {
  "34": "Zoek het vak met:",
  "56": "In welk vak zitten er {som}?",
  "78": "Welk vak bevat {som}?",
};

/**
 * Hoe het materiaal in de vraagzin heet, enkelvoud en meervoud.
 *
 * "Welk vak heeft 1 plaatjes?" leest raar voor, en juist dit soort zinnen
 * worden voorgelezen. Bij één ding hoort dus het enkelvoud.
 */
const MATERIAALWOORD: Record<string, { een: string; meer: string }> = {
  telplaatjes: { een: "plaatje", meer: "plaatjes" },
  kralen: { een: "kraal", meer: "kralen" },
  blokken: { een: "blokje", meer: "blokjes" },
};

/** De codes waarmee het materiaal in de somgegevens past; daar mogen alleen getallen in. */
const MATERIAALCODES = ["telplaatjes", "kralen", "blokken"];

const MIN_GETAL = 1;
/** Boven de twintig valt er in een vakje niets meer te tellen. */
const MAX_GETAL = 20;

export function grenzen(inst: Instellingen) {
  const van = Math.max(MIN_GETAL, Math.min(MAX_GETAL, getal(inst, "van", 1)));
  const tot = Math.max(van, Math.min(MAX_GETAL, getal(inst, "tot", 12)));
  return {
    van,
    tot,
    materiaal: tekst(inst, "materiaal", "telplaatjes"),
    opstelling: tekst(inst, "opstelling", "rijen"),
    zoek: tekst(inst, "zoek", "precies"),
    aantal: Math.max(2, Math.min(4, getal(inst, "aantalVakken", 3))),
  };
}

export const vakkenGenerator: Generator = {
  id: "vakken",
  naam: "Welk vak? (getal herkennen)",
  uitleg:
    "Vos houdt een kaartje vast met een getal, en daaronder staan drie of vier vakken met spulletjes. Het kind tikt het vak aan met dat aantal. Kan ook als „eentje meer” of „eentje minder”, en dan is het een rekenstap in plaats van een zoekstap.",
  suggestie:
    "Groep 3: 1 tot 10, drie vakken, precies dit aantal · groep 4: 1 tot 20, vier vakken, eentje meer",
  velden: [
    {
      soort: "keuze",
      sleutel: "materiaal",
      label: "Wat er in de vakken zit",
      opties: [
        { waarde: "telplaatjes", label: "Telplaatjes — eendjes, ballen, appels" },
        { waarde: "kralen", label: "Kralen" },
        { waarde: "blokken", label: "Blokjes" },
      ],
      hulp: "Telplaatjes zijn het vrolijkst en het herkenbaarst voor groep 3. Kralen en blokjes zijn neutraler: ze leiden minder af, en blokjes sluiten aan bij het MAB-materiaal van school.",
    },
    {
      soort: "keuze",
      sleutel: "opstelling",
      label: "Hoe de spullen liggen",
      opties: [
        { waarde: "rijen", label: "In rijen van vijf" },
        { waarde: "verspreid", label: "Verspreid door elkaar" },
      ],
      hulp: "Rijen van vijf laten een kind in groepjes tellen: vijf, en nog vier, dat is negen. Dat is precies wat school wil bereiken. Verspreid is duidelijk moeilijker — dan moet het kind zelf structuur aanbrengen of stuk voor stuk tellen, en dat laatste is juist wat het moet afleren.",
    },
    {
      soort: "keuze",
      sleutel: "zoek",
      label: "Wat er gezocht wordt",
      opties: [
        { waarde: "precies", label: "Precies dit aantal" },
        { waarde: "meer", label: "Eentje meer" },
        { waarde: "minder", label: "Eentje minder" },
        { waarde: "beide", label: "Meer en minder door elkaar" },
      ],
      hulp: "Precies dit aantal oefent het koppelen van cijfer en hoeveelheid. Eentje meer of minder maakt er een rekenstap van: het kind moet eerst uitrekenen wát het zoekt. Dat is duidelijk moeilijker, en laat meteen zien of het de opdracht leest of alleen het getal ziet.",
    },
    {
      soort: "getal",
      sleutel: "aantalVakken",
      label: "Hoeveel vakken",
      min: 2,
      max: 4,
      hulp: "Drie vakken is genoeg om te moeten tellen. Vier maakt het lastiger, want er moet dan vaker geteld worden voordat het kind zeker is.",
    },
    {
      soort: "getal",
      sleutel: "van",
      label: "Kleinste aantal",
      min: MIN_GETAL,
      max: MAX_GETAL,
    },
    {
      soort: "getal",
      sleutel: "tot",
      label: "Grootste aantal",
      min: MIN_GETAL,
      max: MAX_GETAL,
      hulp: "Alle aantallen in de vakken blijven hierbinnen, en het getal op de kaart ook. Boven de twintig wordt een vak te vol om te tellen.",
    },
    /* Overal dezelfde velden om de vraagzin aan te passen, per groep. */
    ...vraagtekstVelden(STANDAARDZINNEN),
  ],
  vraagteksten: {
    standaard: STANDAARDZINNEN,
    /*
      In de somgegevens passen alleen getallen, dus het materiaal staat er als
      code in. Hier wordt daar weer een woord van gemaakt: "4 plaatjes".
    */
    som: (som) => {
      const code = som.extra?.materiaal ?? 0;
      const woord = MATERIAALWOORD[MATERIAALCODES[code] ?? "telplaatjes"];
      return `${som.goed} ${som.goed === 1 ? woord.een : woord.meer}`;
    },
  },
  standaard: {
    van: 1,
    tot: 12,
    materiaal: "telplaatjes",
    opstelling: "rijen",
    zoek: "precies",
    aantalVakken: 3,
  },
  foutpatronen: vakkenPatronen,
  aanpak: vakkenAanpak,
  uitleganimatie: vakkenUitleg,

  maximum: (inst) => {
    const { van, tot, zoek } = grenzen(inst);
    const ruimte = Math.max(0, tot - van + 1);
    return Math.min(200, ruimte * (zoek === "beide" ? 2 : 1) * 2);
  },

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const { van, tot, materiaal, opstelling, zoek, aantal: hoeveelVakken } = grenzen(inst);

    /* Vijf op een rij, of verspreid: 0 betekent geen rijen. */
    const perRij = opstelling === "verspreid" ? 0 : 5;

    /* Elke vraag een ander plaatje, zodat het niet elke keer hetzelfde is. */
    let vorigPlaatje = "";

    const uit: Gegenereerd[] = [];
    for (let poging = 0; poging < aantal * 300 && uit.length < aantal; poging++) {
      /*
        Eerst het gezochte aantal, dan pas wat er op de kaart komt te staan.
        Bij "eentje meer" staat er dus één minder op de kaart dan er in de goede
        vak zit.
      */
      const gezocht = heelGetal(kans, van, tot);

      const meer = zoek === "beide" ? kans() < 0.5 : zoek === "meer";
      const kaart =
        zoek === "precies" ? gezocht : meer ? gezocht - 1 : gezocht + 1;
      if (kaart < MIN_GETAL || kaart > MAX_GETAL) continue;

      /*
        De andere vakken liggen er vlak omheen: eentje meer, eentje minder, en
        bij "meer" of "minder" ook het getal van de kaart zelf — dat is precies
        het vak dat een kind pakt dat de opdracht niet leest.
      */
      const buren = [gezocht + 1, gezocht - 1, kaart, gezocht + 2, gezocht - 2];
      const inhoud = [gezocht];
      for (const n of buren) {
        if (inhoud.length === hoeveelVakken) break;
        if (n < 1 || n > MAX_GETAL || inhoud.includes(n)) continue;
        inhoud.push(n);
      }
      if (inhoud.length < hoeveelVakken) continue;

      const vakken = husselen(kans, inhoud);

      const handtekening = `vakken:${zoek}:${kaart}:${[...vakken].sort((a, b) => a - b).join("-")}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const anders = TELPLAATJE_NAMEN.filter((n) => n !== vorigPlaatje);
      const plaatje = kiesUit(kans, anders.length > 0 ? anders : TELPLAATJE_NAMEN);
      vorigPlaatje = plaatje;

      const gegevens = {
        soort: "vakken",
        variant: zoek === "precies" ? "precies" : meer ? "meer" : "minder",
        getallen: [gezocht],
        goed: gezocht,
        extra: {
          kaart,
          vakken: hoeveelVakken,
          perRij,
          materiaal: Math.max(0, MATERIAALCODES.indexOf(materiaal)),
        },
      };

      uit.push({
        handtekening,
        vorm: "meerkeuze",
        vraagtekst: bepaalVraagtekst(vakkenGenerator, inst, groep, gegevens),
        /*
          De opties staan in dezelfde volgorde als de vakken; het antwoord is de
          plek van het goede vak. Zo hoeft de tekening niets van antwoorden te
          weten: hij geeft door welk vak is aangetikt.
        */
        opties: vakken.map((n) => ({ tekst: String(n), afbeelding: null })),
        antwoord: String(vakken.indexOf(gezocht)),
        figuur: {
          soort: "vakken",
          vakken,
          materiaal,
          plaatje,
          kaart,
          perRij,
          /* De vos komt van de standaardvos; zie `haalStandaardvos`. */
          vos: { vangend: null, wachtend: null, blij: null },
        },
        somgegevens: gegevens,
      });
    }

    return uit;
  },
};
