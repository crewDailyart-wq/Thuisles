/**
 * Splitsen in de tabel — en als splitshuis.
 *
 * Bovenaan staat het getal dat gesplitst wordt. Daaronder een paar rijen met
 * links een gegeven getal in een geel vakje en rechts een leeg wit vakje. Het
 * kind vult in wat er nog bij moet om aan het getal bovenaan te komen.
 *
 * ---------------------------------------------------------------------------
 * Twee uiterlijken, dezelfde som
 * ---------------------------------------------------------------------------
 * "Eenvoudig" is de rustige schooltabel. "Speels" is het splitshuis: het getal
 * staat op het dak, elke verdieping heeft twee raampjes, en in één raampje
 * staat al een getal. Vos kijkt uit het raam en zwaait als alles klopt.
 *
 * Het uiterlijk verandert niets aan de opgave en telt daarom ook niet mee voor
 * de moeilijkheid; het is precies dezelfde vraag in een ander jasje.
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
import { splitsopdrachtPatronen } from "@/lib/generatoren/patronen/splitsopdrachten";
import { splitstabelAanpak } from "@/lib/generatoren/aanpak/splitsopdrachten";
import { splitstabelUitleg } from "@/lib/generatoren/scripts/splitsopdrachten";

/* Zo kort mogelijk: wat er moet gebeuren is aan de tabel zelf te zien. */
const ZIN = "Vul in.";

const STANDAARDZINNEN: Record<Leeftijdsgroep, string> = {
  "34": ZIN,
  "56": ZIN,
  "78": ZIN,
};

const MIN_DOEL = 2;
const MAX_DOEL = 100;
const MIN_RIJEN = 2;
/** Vanaf hier gaat de splitsing over het tiental heen; die getallen gaan voor. */
const EERSTE_TIENTAL = 10;
const MAX_RIJEN = 5;

export function grenzen(inst: Instellingen) {
  const doel = Math.max(MIN_DOEL, Math.min(MAX_DOEL, getal(inst, "doel", 20)));
  /*
    Het grootste getal bovenaan.

    Staat dit niet ingevuld, dan is het gelijk aan het kleinste en is het getal
    bovenaan bij elke vraag hetzelfde — precies zoals de tabel en het splitshuis
    het altijd al deden. Vul je een groter getal in, dan wisselt het per vraag.
  */
  const doelTot = Math.max(doel, Math.min(MAX_DOEL, getal(inst, "doelTot", doel)));
  const rijen = Math.max(MIN_RIJEN, Math.min(MAX_RIJEN, getal(inst, "rijen", 3)));
  return {
    doel,
    doelTot,
    /* Meer rijen dan er verschillende getallen passen kan niet. */
    rijen: Math.max(1, Math.min(rijen, doelTot - 1)),
    leeg: tekst(inst, "leeg", "rechts"),
    uiterlijk: tekst(inst, "uiterlijk", "eenvoudig"),
  };
}

export const splitstabelGenerator: Generator = {
  id: "splitstabel",
  naam: "Splitsen in de tabel",
  uitleg:
    "Bovenaan het getal dat gesplitst wordt, daaronder een paar rijen met links een gegeven getal en rechts een leeg vakje. Het kind vult in wat erbij hoort. Als speels uiterlijk wordt het een splitshuis met raampjes en Vos.",
  suggestie: "Groep 4: doelgetal 20 met drie rijen",
  velden: [
    {
      soort: "getal",
      sleutel: "doel",
      label: "Het getal dat gesplitst wordt",
      min: MIN_DOEL,
      max: MAX_DOEL,
      hulp: "Dit getal staat bovenaan de tabel en is bij elke rij hetzelfde. Elke rij is een manier om het te splitsen.",
    },
    {
      soort: "getal",
      sleutel: "doelTot",
      label: "Grootste getal bovenaan",
      min: MIN_DOEL,
      max: MAX_DOEL,
      hulp: "Leeg of gelijk aan het getal hierboven: dan staat er bij elke vraag hetzelfde getal bovenaan. Vul je een groter getal in, dan wisselt het per vraag — en pakt de generator eerst de getallen vanaf tien, omdat die over het tiental heen gaan.",
    },
    {
      soort: "getal",
      sleutel: "rijen",
      label: "Hoeveel rijen",
      min: MIN_RIJEN,
      max: MAX_RIJEN,
      hulp: "Hoeveel splitsingen het kind per vraag invult. Drie past ruim op een telefoon.",
    },
    {
      soort: "keuze",
      sleutel: "leeg",
      label: "Leeg vakje",
      opties: [
        { waarde: "rechts", label: "Altijd rechts" },
        { waarde: "links", label: "Altijd links" },
        { waarde: "wissel", label: "Wisselend per rij" },
      ],
      hulp: "Aan welke kant van de tabel het kind invult. Wisselend is moeilijker: dan staat het gegeven getal de ene rij links en de volgende rechts, en moet het kind per rij kijken wat er gevraagd wordt.",
    },
    {
      soort: "keuze",
      sleutel: "uiterlijk",
      label: "Uiterlijk",
      opties: [
        { waarde: "eenvoudig", label: "Eenvoudig — een rustige tabel" },
        { waarde: "speels", label: "Speels — het splitshuis met Vos" },
        { waarde: "bloem", label: "Speels — de splitsbloem" },
      ],
      hulp: "De som is in allebei de gevallen precies dezelfde; alleen het beeld verschilt. Het uiterlijk telt daarom niet mee voor de moeilijkheid.",
    },
    {
      soort: "afbeelding",
      sleutel: "vosBlij",
      label: "Vos — blij",
      hulp: "Alleen bij het splitshuis: Vos kijkt uit het raam en zwaait als alles goed is ingevuld. Leeg = de standaardvos.",
    },
    ...vraagtekstVelden(STANDAARDZINNEN),
  ],
  vraagteksten: {
    standaard: STANDAARDZINNEN,
    /* Op de plek van {som} komt het getal dat gesplitst wordt. */
    som: (s) => String(s.getallen[0] ?? s.goed),
  },
  standaard: { doel: 20, doelTot: 20, rijen: 3, leeg: "rechts", uiterlijk: "eenvoudig", vosBlij: "" },
  foutpatronen: splitsopdrachtPatronen,
  aanpak: splitstabelAanpak,
  uitleganimatie: splitstabelUitleg,

  /*
    Hoeveel verschillende vragen er bestaan: hoeveel combinaties van `rijen`
    verschillende gegeven getallen je uit 1 tot en met doel-1 kunt kiezen. Dat
    loopt hard op, dus er komt een veilige bovengrens uit.
  */
  maximum: (inst) => {
    const { doel, doelTot, rijen } = grenzen(inst);
    let totaal = 0;
    for (let n = doel; n <= doelTot; n++) {
      const keuzes = n - 1;
      if (rijen > keuzes) continue;
      let combinaties = 1;
      for (let i = 0; i < rijen; i++) combinaties = (combinaties * (keuzes - i)) / (i + 1);
      totaal += combinaties;
    }
    return Math.min(9999, Math.round(totaal));
  },

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const { doel, doelTot, rijen, leeg, uiterlijk } = grenzen(inst);
    const vosBlij = tekst(inst, "vosBlij", "");

    const uit: Gegenereerd[] = [];

    /*
      Eén ronde zoeken met de getallen bovenaan uit een stuk van het bereik.

      Hij wordt twee keer aangeroepen: eerst met alleen de getallen vanaf tien,
      daarna met het hele bereik. Zo komen de kleinere pas aan bod als er met de
      grotere niets nieuws meer te maken valt.
    */
    const zoek = (kleinste: number) => {
    for (let poging = 0; poging < aantal * 300 && uit.length < aantal; poging++) {
      const doelNu = heelGetal(kans, kleinste, doelTot);
      if (doelNu - 1 < rijen) continue;
      /* Binnen één vraag nooit twee keer hetzelfde gegeven getal. */
      const gegeven: number[] = [];
      for (let ronde = 0; ronde < 200 && gegeven.length < rijen; ronde++) {
        const n = heelGetal(kans, 1, doelNu - 1);
        if (!gegeven.includes(n)) gegeven.push(n);
      }
      if (gegeven.length < rijen) continue;

      const antwoorden = gegeven.map((n) => doelNu - n);
      /* Per rij: staat het lege vakje rechts of links? */
      const leegRechts = gegeven.map(() =>
        leeg === "links" ? false : leeg === "rechts" ? true : kans() < 0.5,
      );

      /* Dezelfde drie getallen in een andere volgorde is dezelfde vraag. */
      const handtekening = `splitstabel:${doelNu}:${[...gegeven].sort((a, b) => a - b).join("-")}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const gegevens = {
        soort: "splitstabel",
        variant: uiterlijk,
        getallen: [doelNu, gegeven[0]],
        goed: antwoorden[0],
        extra: {
          rijen: gegeven.length,
          ...Object.fromEntries(gegeven.map((n, i) => [`rij${i}`, n])),
        },
      };

      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(splitstabelGenerator, inst, groep, gegevens),
        /* Eén getal per rij, van boven naar beneden, met komma's ertussen. */
        antwoord: antwoorden.join(","),
        figuur: {
          soort: "splitstabel",
          doel: doelNu,
          gegeven,
          leegRechts,
          uiterlijk,
          vos: { vangend: null, wachtend: null, blij: vosBlij || null },
        },
        somgegevens: gegevens,
      });
    }
    };

    if (doelTot >= EERSTE_TIENTAL) zoek(Math.max(doel, EERSTE_TIENTAL));
    if (uit.length < aantal) zoek(doel);

    return uit;
  },
};
