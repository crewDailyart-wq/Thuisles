/**
 * Welke mand? — het getal bij een hoeveelheid zoeken.
 *
 * Boven staat een getal, eronder staan drie of vier manden met spulletjes. Het
 * kind tikt de mand aan waar er precies zoveel in zitten.
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
 * Waarom de manden dicht bij elkaar liggen
 * ---------------------------------------------------------------------------
 * De aantallen verschillen maar één of twee. Zaten er in de ene drie en in de
 * andere twaalf, dan hoeft er niet geteld te worden — dan is het kijken welke
 * stapel groter is, en dat is een ander (makkelijker) vraagstuk.
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
import { mandenPatronen } from "@/lib/generatoren/patronen/manden";
import { mandenAanpak } from "@/lib/generatoren/aanpak/manden";
import { mandenUitleg } from "@/lib/generatoren/scripts/manden";

/** De standaardzinnen. Kort: wat er moet gebeuren, zien ze aan het beeld. */
const STANDAARDZINNEN: Record<Leeftijdsgroep, string> = {
  "34": "Welke mand?",
  "56": "In welke mand zitten er zoveel?",
  "78": "Welke mand bevat het gevraagde aantal?",
};

const MIN_GETAL = 1;
/** Boven de twintig valt er in een mandje niets meer te tellen. */
const MAX_GETAL = 20;

export function grenzen(inst: Instellingen) {
  const van = Math.max(MIN_GETAL, Math.min(MAX_GETAL, getal(inst, "van", 1)));
  const tot = Math.max(van, Math.min(MAX_GETAL, getal(inst, "tot", 12)));
  return {
    van,
    tot,
    materiaal: tekst(inst, "materiaal", "telplaatjes"),
    zoek: tekst(inst, "zoek", "precies"),
    aantal: Math.max(2, Math.min(4, getal(inst, "aantalManden", 3))),
  };
}

export const mandenGenerator: Generator = {
  id: "manden",
  naam: "Welke mand? (getal herkennen)",
  uitleg:
    "Een getal groot in beeld, en daaronder drie of vier manden met spulletjes. Het kind tikt de mand aan met dat aantal. Kan ook als „eentje meer” of „eentje minder”, en dan is het een rekenstap in plaats van een zoekstap.",
  suggestie:
    "Groep 3: 1 tot 10, drie manden, precies dit aantal · groep 4: 1 tot 20, vier manden, eentje meer",
  velden: [
    {
      soort: "keuze",
      sleutel: "materiaal",
      label: "Wat er in de manden zit",
      opties: [
        { waarde: "telplaatjes", label: "Telplaatjes — eendjes, ballen, appels" },
        { waarde: "kralen", label: "Kralen" },
        { waarde: "blokken", label: "Blokjes" },
      ],
      hulp: "Telplaatjes zijn het vrolijkst en het herkenbaarst voor groep 3. Kralen en blokjes zijn neutraler: ze leiden minder af, en blokjes sluiten aan bij het MAB-materiaal van school.",
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
      sleutel: "aantalManden",
      label: "Hoeveel manden",
      min: 2,
      max: 4,
      hulp: "Drie manden is genoeg om te moeten tellen. Vier maakt het lastiger, want er moet dan vaker geteld worden voordat het kind zeker is.",
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
      hulp: "Alle aantallen in de manden blijven hierbinnen, en het getal op de kaart ook. Boven de twintig wordt een mandje te vol om te tellen.",
    },
    /* Overal dezelfde velden om de vraagzin aan te passen, per groep. */
    ...vraagtekstVelden(STANDAARDZINNEN),
  ],
  vraagteksten: { standaard: STANDAARDZINNEN },
  standaard: {
    van: 1,
    tot: 12,
    materiaal: "telplaatjes",
    zoek: "precies",
    aantalManden: 3,
  },
  foutpatronen: mandenPatronen,
  aanpak: mandenAanpak,
  uitleganimatie: mandenUitleg,

  maximum: (inst) => {
    const { van, tot, zoek } = grenzen(inst);
    const ruimte = Math.max(0, tot - van + 1);
    return Math.min(200, ruimte * (zoek === "beide" ? 2 : 1) * 2);
  },

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const { van, tot, materiaal, zoek, aantal: hoeveelManden } = grenzen(inst);

    /* Elke vraag een ander plaatje, zodat het niet elke keer hetzelfde is. */
    let vorigPlaatje = "";

    const uit: Gegenereerd[] = [];
    for (let poging = 0; poging < aantal * 300 && uit.length < aantal; poging++) {
      /*
        Eerst het gezochte aantal, dan pas wat er op de kaart komt te staan.
        Bij "eentje meer" staat er dus één minder op de kaart dan er in de goede
        mand zit.
      */
      const gezocht = heelGetal(kans, van, tot);

      const meer = zoek === "beide" ? kans() < 0.5 : zoek === "meer";
      const kaart =
        zoek === "precies" ? gezocht : meer ? gezocht - 1 : gezocht + 1;
      if (kaart < MIN_GETAL || kaart > MAX_GETAL) continue;

      /*
        De andere manden liggen er vlak omheen: eentje meer, eentje minder, en
        bij "meer" of "minder" ook het getal van de kaart zelf — dat is precies
        de mand die een kind pakt dat de opdracht niet leest.
      */
      const buren = [gezocht + 1, gezocht - 1, kaart, gezocht + 2, gezocht - 2];
      const inhoud = [gezocht];
      for (const n of buren) {
        if (inhoud.length === hoeveelManden) break;
        if (n < 1 || n > MAX_GETAL || inhoud.includes(n)) continue;
        inhoud.push(n);
      }
      if (inhoud.length < hoeveelManden) continue;

      const manden = husselen(kans, inhoud);

      const handtekening = `manden:${zoek}:${kaart}:${[...manden].sort((a, b) => a - b).join("-")}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const anders = TELPLAATJE_NAMEN.filter((n) => n !== vorigPlaatje);
      const plaatje = kiesUit(kans, anders.length > 0 ? anders : TELPLAATJE_NAMEN);
      vorigPlaatje = plaatje;

      const gegevens = {
        soort: "manden",
        variant: zoek === "precies" ? "precies" : meer ? "meer" : "minder",
        getallen: [gezocht],
        goed: gezocht,
        extra: { kaart, manden: hoeveelManden },
      };

      uit.push({
        handtekening,
        vorm: "meerkeuze",
        vraagtekst: bepaalVraagtekst(mandenGenerator, inst, groep, gegevens),
        /*
          De opties staan in dezelfde volgorde als de manden; het antwoord is de
          plek van de goede mand. Zo hoeft de tekening niets van antwoorden te
          weten: hij geeft door welke mand is aangetikt.
        */
        opties: manden.map((n) => ({ tekst: String(n), afbeelding: null })),
        antwoord: String(manden.indexOf(gezocht)),
        figuur: {
          soort: "manden",
          manden,
          materiaal,
          plaatje,
          kaart,
          /* De vos komt van de standaardvos; zie `haalStandaardvos`. */
          vos: { vangend: null, wachtend: null, blij: null },
        },
        somgegevens: gegevens,
      });
    }

    return uit;
  },
};
