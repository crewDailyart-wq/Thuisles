/**
 * Splitsen: een getal verdelen in twee delen.
 *
 * Twee weergaven:
 *   - lijst      — als tekstsom: "27 = 15 + ?"
 *   - splitsboom — een getekend schema: het hele getal bovenaan, twee vakjes
 *                  eronder met pijlen, waarvan er één leeg is.
 */

import {
  heelGetal,
  kansGenerator,
  meerkeuze,
  tekst,
  type Generator,
  type Gegenereerd,
  bepaalVraagtekst,
  vraagtekstVelden,
  leeftijdsgroepVanGroep,
} from "@/lib/generatoren/soort";
import type { Leeftijdsgroep } from "@/lib/generatoren/foutpatroon";
import { splitsenPatronen } from "@/lib/generatoren/patronen/splitsen";
import { splitsenAanpak } from "@/lib/generatoren/aanpak/splitsen";
import { splitsenUitleg } from "@/lib/generatoren/scripts/splitsen";

/** De standaardzinnen van dit type. Per sjabloon aan te passen in het beheer. */
const STANDAARDZINNEN: Record<Leeftijdsgroep, string> = {
  "34": "Welk getal hoort hier?",
  "56": "Welk getal hoort in het lege vakje?",
  "78": "Welk getal hoort in het lege vakje?",
};

export const splitsenGenerator: Generator = {
  id: "splitsen",
  naam: "Splitsen",
  uitleg: "Een getal splitsen in twee delen, als som of als getekende splitsboom.",
  suggestie: "Groep 3: tot 10 of 20 · groep 4: tot 100",
  velden: [
    {
      soort: "keuze",
      sleutel: "weergave",
      label: "Weergave",
      opties: [
        { waarde: "boom", label: "Splitsboom (getekend)" },
        { waarde: "lijst", label: "Als som (27 = 15 + ?)" },
      ],
    },
    { soort: "getal", sleutel: "van", label: "Laagste hoofdgetal", min: 3, max: 999 },
    { soort: "getal", sleutel: "tot", label: "Hoogste hoofdgetal", min: 3, max: 999 },
    {
      soort: "keuze",
      sleutel: "leeg",
      label: "Welk vakje is leeg",
      opties: [
        { waarde: "wissel", label: "Wisselend" },
        { waarde: "rechts", label: "Altijd het rechter vakje" },
        { waarde: "links", label: "Altijd het linker vakje" },
      ],
    },
    {
      soort: "keuze",
      sleutel: "antwoordvorm",
      label: "Antwoordvorm",
      opties: [
        { waarde: "open", label: "Zelf intypen" },
        { waarde: "meerkeuze", label: "Meerkeuze (vier antwoorden)" },
      ],
    },
    /* Overal dezelfde vier velden om de vraagzin aan te passen. */
    ...vraagtekstVelden(STANDAARDZINNEN),
  ],
  vraagteksten: {
    standaard: STANDAARDZINNEN,
    /* Bij de somvariant ís de vraag de som; die staat dan in {som}. */
    som: (s) => {
      const [geheel, gegeven] = s.getallen;
      return s.extra?.leegRechts === 0
        ? `${geheel} = ? + ${gegeven}`
        : `${geheel} = ${gegeven} + ?`;
    },
  },
  standaard: { weergave: "boom", van: 5, tot: 20, leeg: "wissel", antwoordvorm: "open" },
  /*
    Alleen bij de getekende boom valt er iets te herformuleren. Staat de som
    als tekst ("27 = 15 + ?"), dan ís de vraagtekst de som zelf.
  */
  foutpatronen: splitsenPatronen,
  aanpak: splitsenAanpak,
  uitleganimatie: splitsenUitleg,

  maximum: (inst) => {
    const van = Math.max(3, Number(inst.van) || 5);
    const tot = Math.max(van, Number(inst.tot) || 20);
    // Voor elk hoofdgetal n zijn er n-1 manieren om te splitsen (1..n-1).
    let totaal = 0;
    for (let n = van; n <= tot; n++) totaal += n - 1;
    return inst.leeg === "wissel" ? totaal * 2 : totaal;
  },

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const leeftijd = leeftijdsgroepVanGroep(groep);
    const kans = kansGenerator(zaad);
    const van = Math.max(3, Number(inst.van) || 5);
    const tot = Math.max(van, Number(inst.tot) || 20);
    const weergave = tekst(inst, "weergave", "boom");
    const leegKeuze = tekst(inst, "leeg", "wissel");
    const meerkeuzeVorm = inst.antwoordvorm === "meerkeuze";

    const uit: Gegenereerd[] = [];
    for (let poging = 0; poging < aantal * 200 && uit.length < aantal; poging++) {
      const geheel = heelGetal(kans, van, tot);
      /*
        Bij grotere getallen geen splitsingen als 35 = 1 + 34: dat is wel goed,
        maar er valt niets te oefenen. Bij kleine getallen (7 = 1 + 6) hoort
        het er juist wél bij, dus het kleinste deel schaalt mee.
      */
      const kleinsteDeel = Math.max(1, Math.floor(geheel / 10));
      if (geheel < kleinsteDeel * 2) continue;

      const links = heelGetal(kans, kleinsteDeel, geheel - kleinsteDeel);
      const rechts = geheel - links;

      const leegRechts =
        leegKeuze === "rechts" ? true : leegKeuze === "links" ? false : kans() < 0.5;
      const antwoordGetal = leegRechts ? rechts : links;
      const gegeven = leegRechts ? links : rechts;

      const handtekening = `splitsen:${weergave}:${geheel}:${gegeven}:${leegRechts ? "r" : "l"}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const gegevens = {
        soort: "splitsen",
        variant: weergave,
        getallen: [geheel, gegeven],
        goed: antwoordGetal,
        /* Welke kant leeg is; nodig om de som terug te kunnen schrijven. */
        extra: { leegRechts: leegRechts ? 1 : 0 },
      };

      /*
        Bij de getekende boom is de vraag een zin; bij de somvariant ÍS de som
        de vraag, en die komt via {som} in de zin terecht.
      */
      const vraagtekst =
        weergave === "boom"
          ? bepaalVraagtekst(splitsenGenerator, inst, leeftijd, gegevens)
          : bepaalVraagtekst(
              { vraagteksten: { ...splitsenGenerator.vraagteksten, standaard: { "34": "{som}", "56": "{som}", "78": "{som}" } } },
              inst,
              leeftijd,
              gegevens,
            );

      uit.push({
        handtekening,
        vraagtekst,
        somgegevens: gegevens,
        figuur:
          weergave === "boom"
            ? {
                soort: "splitsboom",
                geheel,
                links: leegRechts ? links : null,
                rechts: leegRechts ? null : rechts,
              }
            : null,
        ...(meerkeuzeVorm
          ? { vorm: "meerkeuze" as const, ...meerkeuze(antwoordGetal, kans) }
          : { vorm: "open" as const, antwoord: String(antwoordGetal) }),
      });
    }

    return uit;
  },
};
