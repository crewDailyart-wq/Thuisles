/**
 * Blokken tientallen en eenheden: hoeveel is dit samen?
 *
 * MAB-materiaal, het blokkenmateriaal dat op school in de kast staat. Losse
 * blokjes zijn eenheden; tien blokjes aan elkaar vormen een staaf van tien. Het
 * kind ziet staven en losse blokjes liggen en kiest uit vier getallen.
 *
 * ---------------------------------------------------------------------------
 * Waar het echt om gaat
 * ---------------------------------------------------------------------------
 * Niet om tellen. Een kind uit groep 4 telt die blokjes prima; het gaat erom
 * dat één voorwerp voor tíén kan staan. Wie bij 24 "vier" zegt of "zes", telt
 * goed en denkt verkeerd — en precies die twee antwoorden staan er daarom bij.
 *
 * ---------------------------------------------------------------------------
 * Twee standen nu, en ruimte voor een derde
 * ---------------------------------------------------------------------------
 *   tellen    de staven en blokjes liggen klaar
 *   vosbouwt  alles ligt eerst los; Vos schuift er staven van tien van, zodat
 *             het kind ziet ontstaan wat een staaf is
 *   slepen    (later) het kind legt zelf het getal neer
 *
 * De stand staat als naam in de vraag en niet als vinkje, zodat die derde er
 * later bij kan zonder dat de twee bestaande standen verbouwd hoeven te worden.
 */

import {
  getal,
  heelGetal,
  husselen,
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
import type { AntwoordOptie } from "@/lib/vraagtypes";
import { blokkenPatronen } from "@/lib/generatoren/patronen/blokken";
import { blokkenAanpak } from "@/lib/generatoren/aanpak/blokken";
import { blokkenUitleg } from "@/lib/generatoren/scripts/blokken";

/**
 * De standaardzinnen van dit type. Per sjabloon aan te passen in het beheer.
 *
 * Kort gehouden: wat er te zien is, ziet het kind zelf. De zin zegt alleen wat
 * het ermee moet doen.
 */
const STANDAARDZINNEN: Record<Leeftijdsgroep, string> = {
  "34": "Hoeveel is dit samen?",
  "56": "Hoeveel blokken zie je in totaal?",
  "78": "Welk getal hoort bij deze staven en blokjes?",
};

/** Onder de tien is er geen staaf, boven de honderd past het vak niet meer. */
const MIN_GETAL = 10;
const MAX_GETAL = 100;

export function grenzen(inst: Instellingen) {
  const van = Math.max(MIN_GETAL, Math.min(MAX_GETAL, getal(inst, "van", 10)));
  const tot = Math.max(van, Math.min(MAX_GETAL, getal(inst, "tot", 50)));
  return {
    van,
    tot,
    stand: tekst(inst, "stand", "tellen"),
    open: tekst(inst, "vraagvorm", "meerkeuze") === "open",
    rondeTientallen: vinkje(inst, "rondeTientallen"),
    vosVangend: tekst(inst, "vosVangend", ""),
    vosWachtend: tekst(inst, "vosWachtend", ""),
    vosBlij: tekst(inst, "vosBlij", ""),
  };
}

/** De cijfers omgedraaid: 24 wordt 42. */
export function omgedraaid(n: number): number {
  return (n % 10) * 10 + Math.floor(n / 10);
}

/**
 * De vier keuzes: het goede getal en drie andere getallen.
 *
 * ---------------------------------------------------------------------------
 * Alles blijft binnen het ingestelde bereik
 * ---------------------------------------------------------------------------
 * Staat het sjabloon op 10 tot en met 20, dan staan er ook alleen getallen uit
 * 10 tot en met 20 onder de vraag. Een 81 tussen de keuzes is geen som maar een
 * weggever: dat getal kán niet, dus het kind hoeft het niet eens te bekijken.
 * En andersom leert het er ook niets van, want het is geen fout die het zelf
 * zou maken binnen dit bereik.
 *
 * ---------------------------------------------------------------------------
 * Welke fouten er dan overblijven
 * ---------------------------------------------------------------------------
 * De denkfouten gaan vóór, in volgorde van leerwaarde:
 *
 *   alleen de losse geteld      bij 24 → 4
 *   één staaf vergeten          bij 24 → 14
 *   de cijfers omgedraaid       bij 24 → 42
 *   elke staaf als één geteld   bij 24 → 6
 *   er één staaf bij            bij 24 → 34
 *
 * Wat daarvan buiten het bereik valt, doet niet mee. Bij een smal bereik als
 * 10 tot en met 20 blijft er van die vijf weinig over — 8 en 81 liggen er
 * allebei buiten — en dan wordt er aangevuld met de buurgetallen: er eentje te
 * veel of te weinig geteld. Ook dat is een echte telfout, en hij past wél.
 *
 * Wie de sterkste fouten wil laten zien, kiest dus een ruimer bereik: vanaf
 * 10 tot 50 passen "alleen de losse" en "omgedraaid" er gewoon in.
 *
 * Gehusseld, zodat het juiste antwoord niet steeds op dezelfde plek staat. Dat
 * is geen detail: staat het goede antwoord er altijd als tweede, dan heeft een
 * kind dat door en hoeft het niet meer te kijken.
 */
export function keuzes(
  goed: number,
  van: number,
  tot: number,
  kans: () => number,
): { opties: AntwoordOptie[]; antwoord: string } {
  const t = Math.floor(goed / 10);
  const e = goed % 10;

  const denkfouten = [e, goed - 10, omgedraaid(goed), t + e, goed + 10];

  /* De buren, van dichtbij naar verder weg: eentje te veel of te weinig. */
  const buren: number[] = [];
  for (let stap = 1; stap <= 12; stap++) buren.push(goed - stap, goed + stap);

  const fout: number[] = [];
  function pak(lijst: number[], binnenBereik: boolean) {
    for (const n of lijst) {
      if (fout.length === 3) return;
      if (n === goed || n < 0 || n > 999 || fout.includes(n)) continue;
      if (binnenBereik && (n < van || n > tot)) continue;
      fout.push(n);
    }
  }

  pak(denkfouten, true);
  pak(buren, true);
  /*
    Laatste redmiddel, voor een heel smal bereik: bij "van 24 tot 24" zijn er
    binnen het bereik geen drie andere getallen te vinden. Dan mogen de
    dichtstbijzijnde buren er alsnog bij — vier keuzes met één goede is beter
    dan twee keuzes waaruit je zomaar kunt gokken.
  */
  pak(buren, false);

  const alles = husselen(kans, [goed, ...fout]);
  return {
    opties: alles.map((n) => ({ tekst: String(n), afbeelding: null })),
    antwoord: String(alles.indexOf(goed)),
  };
}

export const blokkenGenerator: Generator = {
  id: "blokken",
  naam: "Blokken tientallen en eenheden",
  uitleg:
    "MAB-blokken zoals ze op school in de kast staan: staven van tien links, losse blokjes rechts. Het kind kiest uit vier getallen of vult het getal zelf in. Oefent dat één staaf voor tien telt — niet voor één.",
  suggestie:
    "Groep 4: 10 tot 50, stand „Vos bouwt de staven” · groep 4 gevorderd: 20 tot 100, stand „Tellen”",
  velden: [
    {
      soort: "keuze",
      sleutel: "stand",
      label: "Wat er met de blokken gebeurt",
      opties: [
        { waarde: "tellen", label: "Tellen — alles ligt klaar" },
        { waarde: "vosbouwt", label: "Vos bouwt de staven" },
      ],
      hulp: "Tellen oefent het aflezen: het kind ziet staven en losse blokjes liggen en zegt welk getal dat is. Vos bouwt de staven oefent waar een tiental vandaan komt: alles ligt eerst los, Vos schuift er tien tegen elkaar aan en die klikken vast tot één staaf. Wat overblijft blijft los liggen. Kies dat als een kind nog denkt dat een staaf één ding is.",
    },
    {
      soort: "keuze",
      sleutel: "vraagvorm",
      label: "Hoe het kind antwoordt",
      opties: [
        { waarde: "meerkeuze", label: "Meerkeuze — vier knoppen met getallen" },
        { waarde: "open", label: "Open vraag — zelf het getal invullen" },
      ],
      hulp: "Meerkeuze is makkelijker: het juiste antwoord staat ertussen, dus het kind hoeft het te herkennen. Het tikt op een getal en ziet meteen of het goed is; er is geen knop Controleer. Open vraag is moeilijker: er staan geen getallen voor, het kind moet het zelf bedenken en intikken op het cijfertoetsenbord op het scherm. Daar blijft de knop Controleer wel staan, want het moet eerst klaar zijn met invullen.",
    },
    {
      soort: "getal",
      sleutel: "van",
      label: "Kleinste getal",
      min: MIN_GETAL,
      max: MAX_GETAL,
      hulp: "Minstens tien: onder de tien is er geen staaf en valt er niets te oefenen.",
    },
    {
      soort: "getal",
      sleutel: "tot",
      label: "Grootste getal",
      min: MIN_GETAL,
      max: MAX_GETAL,
      hulp: "Tot 50 blijft het overzichtelijk voor groep 4. Tot 100 komen er tien staven onder elkaar te liggen; die worden dan kleiner, maar de streepjes blijven te tellen. Let op: de vier keuzes onder de vraag blijven altijd binnen dit bereik. Bij een smal bereik als 10 tot 20 vallen de sterkste denkfouten — alleen de losse geteld, de cijfers omgedraaid — er buiten, en komen er buurgetallen voor in de plaats. Vanaf 10 tot 50 passen ze wel.",
    },
    {
      soort: "vinkje",
      sleutel: "rondeTientallen",
      label: "Ronde tientallen toestaan (30, 40)",
      hulp: "Aan: er kunnen getallen komen zonder losse blokjes. Dat oefent dat nul eenheden ook een antwoord is — kinderen zeggen dan vaak „drie” in plaats van „dertig”. Uit: er ligt altijd minstens één los blokje, zodat de twee soorten allebei in beeld zijn.",
    },
    {
      soort: "afbeelding",
      sleutel: "vosVangend",
      label: "Vos — bouwend",
      hulp: "Te zien terwijl Vos de staven in elkaar schuift. Leeg = de standaardvos van dit soort oefening; die staat bij Afbeeldingen en wordt hieronder getoond. Alleen nodig bij de stand „Vos bouwt de staven”.",
    },
    {
      soort: "afbeelding",
      sleutel: "vosWachtend",
      label: "Vos — wachtend",
      hulp: "Te zien zodra alles klaarligt en het kind aan de beurt is. Leeg = de standaardvos van dit soort oefening.",
    },
    {
      soort: "afbeelding",
      sleutel: "vosBlij",
      label: "Vos — blij",
      hulp: "Te zien na een goed antwoord. Leeg = de standaardvos van dit soort oefening.",
    },
    /* Overal dezelfde velden om de vraagzin aan te passen, per groep. */
    ...vraagtekstVelden(STANDAARDZINNEN),
  ],
  vraagteksten: { standaard: STANDAARDZINNEN },
  standaard: {
    van: 10,
    tot: 50,
    vraagvorm: "meerkeuze",
    stand: "tellen",
    rondeTientallen: false,
    vosVangend: "",
    vosWachtend: "",
    vosBlij: "",
  },
  foutpatronen: blokkenPatronen,
  aanpak: blokkenAanpak,
  uitleganimatie: blokkenUitleg,

  /*
    Er is er precies één per getal. Staan ronde tientallen uit, dan vallen die
    getallen weg — anders zou het beheer een aantal beloven dat er niet is.
  */
  maximum: (inst) => {
    const { van, tot, rondeTientallen } = grenzen(inst);
    let n = 0;
    for (let g = van; g <= tot; g++) {
      if (!rondeTientallen && g % 10 === 0) continue;
      n++;
    }
    return n;
  },

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const { van, tot, stand, open, rondeTientallen, vosVangend, vosWachtend, vosBlij } =
      grenzen(inst);

    const uit: Gegenereerd[] = [];
    for (let poging = 0; poging < aantal * 200 && uit.length < aantal; poging++) {
      const waarde = heelGetal(kans, van, tot);
      if (!rondeTientallen && waarde % 10 === 0) continue;

      const handtekening = `blokken:${waarde}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const tientallen = Math.floor(waarde / 10);
      const eenheden = waarde % 10;
      /* Alleen nodig bij meerkeuze; bij een open vraag typt het kind het zelf. */
      const { opties, antwoord } = keuzes(waarde, van, tot, kans);

      /*
        In `extra` staat waar de foutpatronen op werken: hoeveel staven en
        hoeveel losse. Zonder die twee is "alleen de losse geteld" niet van
        "elke staaf als één geteld" te onderscheiden.
      */
      const gegevens = {
        soort: "blokken",
        variant: stand,
        getallen: [waarde],
        goed: waarde,
        extra: { tientallen, eenheden },
      };

      const vraagtekst = bepaalVraagtekst(blokkenGenerator, inst, groep, gegevens);
      const figuur = {
        soort: "mabblokken" as const,
        tientallen,
        eenheden,
        stand,
        vos: {
          vangend: vosVangend || null,
          wachtend: vosWachtend || null,
          blij: vosBlij || null,
        },
      };

      /*
        De twee vormen staan hier met zoveel woorden uit elkaar geschreven, en
        niet als één regel met een keuze erin. Zo is in de code te zien wélke
        vraagvormen dit type kan opleveren — en dat is precies waar de bewaking
        in `scripts/oefentypes.mjs` naar kijkt.

        Bij een open vraag is het antwoord het getal zelf; bij meerkeuze is het
        de plek van het goede getal tussen de vier keuzes.
      */
      uit.push(
        open
          ? {
              handtekening,
              vorm: "open",
              vraagtekst,
              antwoord: String(waarde),
              figuur,
              somgegevens: gegevens,
            }
          : {
              handtekening,
              vorm: "meerkeuze",
              vraagtekst,
              opties,
              antwoord,
              figuur,
              somgegevens: gegevens,
            },
      );
    }

    return uit;
  },
};
