/**
 * Vos in de bioscoop: een plek vinden in het twintigveld.
 *
 * Twee rijen van tien stoelen. Bij een paar stoelen staat het nummer, de rest
 * is leeg. Vos heeft een kaartje met een getal; het kind tikt de stoel aan die
 * daarbij hoort.
 *
 * ---------------------------------------------------------------------------
 * Wat hier geoefend wordt
 * ---------------------------------------------------------------------------
 * Niet tellen vanaf één, maar springen vanaf een houvast: 17 is 15 en nog
 * twee. De zichtbare nummers zijn de steunpunten, en hoe minder er staan, hoe
 * groter de sprong die het kind zelf moet maken. Daarom is instelbaar wélke
 * nummers er staan — alle vijftallen is makkelijk, alleen 1, 10 en 20 is een
 * stuk moeilijker.
 *
 * ---------------------------------------------------------------------------
 * Later ook een honderdveld
 * ---------------------------------------------------------------------------
 * Het aantal stoelen en het aantal per rij staan los in te stellen. Tien rijen
 * van tien geeft het honderdveld, zonder dat hier iets voor hoeft te veranderen.
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
import { bioscoopPatronen } from "@/lib/generatoren/patronen/bioscoop";
import { bioscoopAanpak } from "@/lib/generatoren/aanpak/bioscoop";
import { bioscoopUitleg } from "@/lib/generatoren/scripts/bioscoop";

/** De standaardzinnen. Kort: het kaartje zegt al welk getal het is. */
const STANDAARDZINNEN: Record<Leeftijdsgroep, string> = {
  "34": "Waar hoort Vos te zitten?",
  "56": "Welke stoel hoort bij het kaartje?",
  "78": "Op welke stoel hoort dit nummer?",
};

const MIN_STOELEN = 10;
const MAX_STOELEN = 100;

export function grenzen(inst: Instellingen) {
  const stoelen = Math.max(MIN_STOELEN, Math.min(MAX_STOELEN, getal(inst, "stoelen", 20)));
  const perRij = Math.max(5, Math.min(10, getal(inst, "perRij", 10)));
  return {
    stoelen,
    perRij,
    nummers: tekst(inst, "nummers", "vijftallen"),
  };
}

/**
 * Welke stoelnummers hun nummer laten zien.
 *
 * Altijd de eerste: zonder startpunt is er niets om vanaf te tellen. Verder om
 * de vijf of om de tien, afhankelijk van hoeveel houvast er mag zijn.
 */
export function zichtbareNummers(stoelen: number, stap: number): number[] {
  const uit = [1];
  for (let n = stap; n <= stoelen; n += stap) if (!uit.includes(n)) uit.push(n);
  return uit;
}

/** Het dichtstbijzijnde zichtbare nummer: daar begint het tellen. */
export function dichtstbijzijnde(zichtbaar: number[], doel: number): number {
  return zichtbaar.reduce((beste, n) =>
    Math.abs(n - doel) < Math.abs(beste - doel) ? n : beste,
  );
}

export const bioscoopGenerator: Generator = {
  id: "bioscoop",
  naam: "Vos in de bioscoop (plek in het twintigveld)",
  uitleg:
    "Twee rijen van tien bioscoopstoelen, waarvan er maar een paar een nummer hebben. Vos heeft een kaartje; het kind tikt de goede stoel aan. Oefent springen vanaf de vijf- en tienstructuur in plaats van tellen vanaf één.",
  suggestie:
    "Groep 3: 20 stoelen, alle vijftallen zichtbaar · groep 4: 20 stoelen, alleen 1, 10 en 20 · later: 100 stoelen voor het honderdveld",
  velden: [
    {
      soort: "keuze",
      sleutel: "nummers",
      label: "Welke nummers staan er",
      opties: [
        { waarde: "vijftallen", label: "Alle vijftallen — 1, 5, 10, 15, 20" },
        { waarde: "tientallen", label: "Alleen de tientallen — 1, 10, 20" },
        { waarde: "alleen-eerste", label: "Alleen de eerste — 1" },
      ],
      hulp: "Hoe minder nummers er staan, hoe groter de sprong die het kind zelf moet maken. Vijftallen geeft veel houvast en is het startpunt. Tientallen vraagt sprongen van hoogstens vijf. Alleen de eerste is het moeilijkst: dan valt er weinig anders te doen dan doortellen, en dat is meestal te veel gevraagd.",
    },
    {
      soort: "getal",
      sleutel: "stoelen",
      label: "Hoeveel stoelen",
      min: MIN_STOELEN,
      max: MAX_STOELEN,
      hulp: "Twintig is het twintigveld van school: twee rijen van tien. Honderd maakt er het honderdveld van; dat is voor later, als tellen tot honderd aan de beurt is.",
    },
    {
      soort: "getal",
      sleutel: "perRij",
      label: "Stoelen per rij",
      min: 5,
      max: 10,
      hulp: "Tien per rij hoort bij de tienstructuur: de tweede rij begint dan bij elf, en zeventien zit op dezelfde plek als zeven. Vijf per rij maakt de vijfstructuur zichtbaar.",
    },
    /* Overal dezelfde velden om de vraagzin aan te passen, per groep. */
    ...vraagtekstVelden(STANDAARDZINNEN),
  ],
  vraagteksten: { standaard: STANDAARDZINNEN },
  standaard: {
    stoelen: 20,
    perRij: 10,
    nummers: "vijftallen",
  },
  foutpatronen: bioscoopPatronen,
  aanpak: bioscoopAanpak,
  uitleganimatie: bioscoopUitleg,

  /* Eén vraag per stoel die niet al een nummer draagt. */
  maximum: (inst) => {
    const { stoelen, nummers } = grenzen(inst);
    const stap = nummers === "vijftallen" ? 5 : nummers === "tientallen" ? 10 : stoelen + 1;
    return Math.max(0, stoelen - zichtbareNummers(stoelen, stap).length);
  },

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const { stoelen, perRij, nummers } = grenzen(inst);

    const stap = nummers === "vijftallen" ? 5 : nummers === "tientallen" ? 10 : stoelen + 1;
    const zichtbaar = zichtbareNummers(stoelen, stap);

    const uit: Gegenereerd[] = [];
    for (let poging = 0; poging < aantal * 300 && uit.length < aantal; poging++) {
      const doel = heelGetal(kans, 1, stoelen);
      /* Een stoel waar het nummer al op staat, is geen vraag. */
      if (zichtbaar.includes(doel)) continue;

      const handtekening = `bioscoop:${stoelen}:${doel}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const houvast = dichtstbijzijnde(zichtbaar, doel);

      const gegevens = {
        soort: "bioscoop",
        variant: nummers,
        getallen: [doel],
        goed: doel,
        extra: {
          perRij,
          stoelen,
          houvast,
          zichtbaarStap: stap,
        },
      };

      uit.push({
        handtekening,
        vorm: "meerkeuze",
        vraagtekst: bepaalVraagtekst(bioscoopGenerator, inst, groep, gegevens),
        /*
          Elke stoel is een keuze, maar ze staan niet als knoppen onder de
          vraag: de zaal zelf is het antwoordveld. De opties staan hier zodat
          het nakijken en de foutpatronen met echte getallen werken — het
          antwoord is het stoelnummer, niet een plek in een rijtje.
        */
        opties: Array.from({ length: stoelen }, (_, i) => ({
          tekst: String(i + 1),
          afbeelding: null,
        })),
        /* De plek in de lijst hierboven: stoel 1 is keuze 0. */
        antwoord: String(doel - 1),
        figuur: {
          soort: "bioscoop",
          aantal: stoelen,
          perRij,
          zichtbaar,
          gezocht: doel,
          /* De vos komt van de standaardvos; zie `haalStandaardvos`. */
          vos: { vangend: null, wachtend: null, blij: null },
        },
        somgegevens: gegevens,
      });
    }

    return uit;
  },
};
