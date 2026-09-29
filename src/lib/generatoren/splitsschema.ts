/**
 * Splitsen met het splitsschema — en met de kersen.
 *
 * Bovenaan het hele getal, twee pijlen naar beneden naar twee vakjes. In één
 * vakje staat een getal, het andere is leeg. Samen zijn ze het getal bovenaan.
 *
 * ---------------------------------------------------------------------------
 * Twee uiterlijken, dezelfde som
 * ---------------------------------------------------------------------------
 * "Eenvoudig" is het rustige schema met pijltjes. "Speels" zijn de kersen: een
 * grote kers bovenaan met twee steeltjes naar twee kleine kersen; bij een goed
 * antwoord plukt Vos ze. De som is in allebei de gevallen dezelfde, dus het
 * uiterlijk telt niet mee voor de moeilijkheid.
 *
 * ---------------------------------------------------------------------------
 * Eerst de getallen vanaf tien
 * ---------------------------------------------------------------------------
 * Splitsen van 14 oefent iets anders dan splitsen van 6: pas boven het tiental
 * moet een kind echt over de tien heen denken. Daarom pakt de generator eerst
 * alleen de hoofdgetallen vanaf een grens die je zelf kiest, en gaat hij pas
 * lager zoeken als daar geen nieuwe som meer bij te maken valt. Standaard ligt
 * die grens op tien; bij een onderwerp tot en met 30 zet je hem op 20, zodat de
 * sommen daar in het bovenste stuk van het bereik blijven.
 *
 * ---------------------------------------------------------------------------
 * Nul mag meedoen
 * ---------------------------------------------------------------------------
 * Met het vinkje aan hoort 10 = 0 + 10 er gewoon bij. Dat is voor een kind een
 * echte splitsing en juist een leerzame: er gaat niets naar de ene kant. Staat
 * het vinkje uit, dan krijgt elk vakje minstens 1.
 */

import {
  getal,
  heelGetal,
  kansGenerator,
  tekst,
  vinkje,
  type Generator,
  type Gegenereerd,
  type Instellingen,
  bepaalVraagtekst,
  vraagtekstVelden,
} from "@/lib/generatoren/soort";
import type { Leeftijdsgroep } from "@/lib/generatoren/foutpatroon";
import { splitsopdrachtPatronen } from "@/lib/generatoren/patronen/splitsopdrachten";
import { splitsschemaAanpak } from "@/lib/generatoren/aanpak/splitsopdrachten";
import { splitsschemaUitleg } from "@/lib/generatoren/scripts/splitsopdrachten";

/*
  Zo kort mogelijk, en bij alle invulopdrachten van dit domein dezelfde zin:
  wát er moet gebeuren is aan de tekening zelf te zien, en een kind van zeven
  leest de regel erboven toch maar één keer.
*/
const ZIN = "Vul in.";

const STANDAARDZINNEN: Record<Leeftijdsgroep, string> = {
  "34": ZIN,
  "56": ZIN,
  "78": ZIN,
};

const MIN_GETAL = 2;
const MAX_GETAL = 100;
/** Vanaf hier komt de splitsing over het tiental heen; die gaan voor. */
const EERSTE_TIENTAL = 10;

export function grenzen(inst: Instellingen) {
  const van = Math.max(MIN_GETAL, Math.min(MAX_GETAL, getal(inst, "van", 3)));
  const tot = Math.max(van, Math.min(MAX_GETAL, getal(inst, "tot", 20)));
  return {
    van,
    tot,
    /* Vanaf welk hoofdgetal de generator bij voorkeur zoekt. */
    vanaf: Math.max(MIN_GETAL, Math.min(MAX_GETAL, getal(inst, "vanaf", EERSTE_TIENTAL))),
    leeg: tekst(inst, "leeg", "wissel"),
    nul: vinkje(inst, "nul"),
    uiterlijk: tekst(inst, "uiterlijk", "eenvoudig"),
  };
}

export const splitsschemaGenerator: Generator = {
  id: "splitsschema",
  naam: "Splitsen met het splitsschema",
  uitleg:
    "Het hele getal bovenaan, twee pijlen naar beneden, één vakje gegeven en één leeg. Als speels uiterlijk worden het kersen aan twee steeltjes, met Vos die ze plukt.",
  suggestie:
    "Groep 4: 3 tot en met 20 met nul erbij — de sommen vanaf tien komen vanzelf eerst",
  velden: [
    { soort: "getal", sleutel: "van", label: "Kleinste hele getal", min: MIN_GETAL, max: MAX_GETAL },
    { soort: "getal", sleutel: "tot", label: "Grootste hele getal", min: MIN_GETAL, max: MAX_GETAL },
    {
      soort: "getal",
      sleutel: "vanaf",
      label: "Liefst vanaf",
      min: MIN_GETAL,
      max: MAX_GETAL,
      hulp: "De generator pakt eerst de hoofdgetallen vanaf dit getal, want daar gaat de splitsing over een tiental heen. Pas als daar geen nieuwe som meer bij te maken valt, zoekt hij lager. Tien is de gewone waarde; bij een onderwerp tot en met 30 zet je hem op 20, bij tot en met 100 op 50.",
    },
    {
      soort: "keuze",
      sleutel: "leeg",
      label: "Welk vakje is leeg",
      opties: [
        { waarde: "wissel", label: "Wisselend — links of rechts" },
        { waarde: "rechts", label: "Altijd het rechter vakje" },
        { waarde: "links", label: "Altijd het linker vakje" },
      ],
      hulp: "Wisselend is moeilijker: het kind moet eerst kijken wélk vakje leeg is voordat het gaat rekenen.",
    },
    {
      soort: "vinkje",
      sleutel: "nul",
      label: "Nul mag ook voorkomen",
      hulp: "Aan: splitsingen als 10 = 0 + 10 horen erbij. Uit: in elk vakje staat minstens 1.",
    },
    {
      soort: "keuze",
      sleutel: "uiterlijk",
      label: "Uiterlijk",
      opties: [
        { waarde: "eenvoudig", label: "Eenvoudig — het schema met pijltjes" },
        { waarde: "speels", label: "Speels — de kersen met Vos" },
      ],
      hulp: "De som is in allebei de gevallen precies dezelfde; alleen het beeld verschilt. Het uiterlijk telt daarom niet mee voor de moeilijkheid.",
    },
    {
      soort: "afbeelding",
      sleutel: "vosBlij",
      label: "Vos — blij",
      hulp: "Alleen bij de kersen: Vos plukt ze zodra het antwoord goed is. Leeg = de standaardvos.",
    },
    ...vraagtekstVelden(STANDAARDZINNEN),
  ],
  vraagteksten: {
    standaard: STANDAARDZINNEN,
    som: (s) => String(s.getallen[0] ?? s.goed),
  },
  standaard: {
    van: 3,
    tot: 20,
    leeg: "wissel",
    nul: false,
    uiterlijk: "eenvoudig",
    vosBlij: "",
  },
  foutpatronen: splitsopdrachtPatronen,
  aanpak: splitsschemaAanpak,
  uitleganimatie: splitsschemaUitleg,

  /* Per heel getal het aantal splitsingen, en twee keer zoveel bij wisselend. */
  maximum: (inst) => {
    const { van, tot, leeg, nul } = grenzen(inst);
    let totaal = 0;
    for (let n = van; n <= tot; n++) totaal += nul ? n + 1 : n - 1;
    /* Wisselend telt dubbel: elke splitsing kan links óf rechts leeg staan. */
    return leeg === "wissel" ? totaal * 2 : totaal;
  },

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const { van, tot, vanaf, leeg, nul, uiterlijk } = grenzen(inst);
    const vosBlij = tekst(inst, "vosBlij", "");

    const uit: Gegenereerd[] = [];

    /*
      Eén ronde zoeken binnen een stuk van het bereik.

      Hij wordt twee keer aangeroepen: eerst met alleen de hoofdgetallen vanaf
      tien, en daarna — als er nog vragen nodig zijn — met het hele bereik. Zo
      komen de kleinere getallen er pas bij als er met de grotere niets nieuws
      meer te maken valt.
    */
    const zoek = (kleinste: number) => {
      for (let poging = 0; poging < aantal * 300 && uit.length < aantal; poging++) {
        const geheel = heelGetal(kans, kleinste, tot);
        const ondergrens = nul ? 0 : 1;
        const links = heelGetal(kans, ondergrens, geheel - ondergrens);
        const rechts = geheel - links;

        const leegRechts = leeg === "rechts" ? true : leeg === "links" ? false : kans() < 0.5;
        const antwoord = leegRechts ? rechts : links;
        const gegeven = leegRechts ? links : rechts;

        const handtekening = `splitsschema:${geheel}:${gegeven}:${leegRechts ? "r" : "l"}`;
        if (alGebruikt.has(handtekening)) continue;
        alGebruikt.add(handtekening);

        const gegevens = {
          soort: "splitsschema",
          variant: uiterlijk,
          getallen: [geheel, gegeven],
          goed: antwoord,
          extra: { leegRechts: leegRechts ? 1 : 0 },
        };

        uit.push({
          handtekening,
          vorm: "open",
          vraagtekst: bepaalVraagtekst(splitsschemaGenerator, inst, groep, gegevens),
          antwoord: String(antwoord),
          figuur: {
            soort: "splitsschema",
            geheel,
            links: leegRechts ? links : null,
            rechts: leegRechts ? null : rechts,
            uiterlijk,
            vos: { vangend: null, wachtend: null, blij: vosBlij || null },
          },
          somgegevens: gegevens,
        });
      }
    };

    if (tot >= vanaf) zoek(Math.max(van, vanaf));
    if (uit.length < aantal) zoek(van);

    return uit;
  },
};
