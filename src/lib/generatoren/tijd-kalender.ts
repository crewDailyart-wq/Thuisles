/**
 * De opdrachten van onderwerp 5 en 6 van Tijd: maanden, dagen en de kalender.
 *
 *   dagvraag           een vraag over de dagen van de week; kies uit drie
 *   dagenaanvullen     typ de ontbrekende dagen
 *   maandvraag         een vraag over de maanden; kies uit drie
 *   maandenaanvullen   typ de ontbrekende maand, met of zonder jaarcirkel
 *   kalenderdag        op welke dag valt het? kies de weekdag uit vier
 *   kalenderzoek       tik de gevraagde dag aan in de kalender
 *   kalenderaantal     hoeveel dagen of zondagen heeft deze maand?
 *   kalenderdatum      welke datum is het dan? kies uit vier
 *   kalendernachtjes   hoeveel nachtjes nog slapen?
 *
 * ---------------------------------------------------------------------------
 * De afspraken van deze onderwerpen
 * ---------------------------------------------------------------------------
 * Uit WERKPLAN.md:
 *
 *   - de week begint op maandag;
 *   - bij de dagen en maanden kiest het kind uit drie antwoorden, bij de
 *     kalender uit vier;
 *   - bij typvragen maken hoofdletters en spaties niet uit; bij een fout ziet
 *     het kind de goede spelling;
 *   - rangtelwoorden lopen van eerste tot en met twaalfde;
 *   - de kalenders kloppen echt: de data vallen op de juiste weekdag. Daarvoor
 *     wordt met `Date` gerekend (zie `weekdagVan` in `tijd.ts`), niet met een
 *     eigen formule — dan klopt het ook in een schrikkeljaar;
 *   - in de antwoorden staan geen jaartallen;
 *   - typen is gewoon typen, geen getallenpad op het scherm (HARDE REGEL 5).
 */

import {
  getal,
  husselen,
  metTweedeVariant,
  doorgeschoven,
  kansGenerator,
  kiesUit,
  tekst,
  vinkje,
  type Generator,
  type Gegenereerd,
  type Instellingen,
  bepaalVraagtekst,
  vraagtekstVelden,
} from "@/lib/generatoren/soort";
import type { Leeftijdsgroep } from "@/lib/generatoren/foutpatroon";
import {
  DAGEN,
  MAANDEN,
  RANGTELWOORDEN,
  dagenInMaand,
  dagnaamVan,
  datumInWoorden,
  hoeveelKeerWeekdag,
  laatsteWeekdag,
  plusDagen,
  weekdagVan,
  zoveelsteWeekdag,
} from "@/lib/tijd";
import { tijdPatronen } from "@/lib/generatoren/patronen/tijd";
import {
  dagenAanpak,
  kalenderAanpak,
  kalendertellenAanpak,
  kalenderzoekAanpak,
  maandenAanpak,
} from "@/lib/generatoren/aanpak/tijd";
import {
  dagenUitleg,
  kalenderUitleg,
  kalendertellenUitleg,
  maandenUitleg,
} from "@/lib/generatoren/scripts/tijd";

/**
 * Welk jaar de kalenders gebruiken.
 *
 * Het huidige of het volgende jaar (WERKPLAN.md). Het jaartal komt nergens op
 * het scherm — in de antwoorden staan geen jaartallen — maar het bepaalt wél op
 * welke weekdag een datum valt, en dus moet het een echt jaar zijn.
 *
 * Bewust niet `new Date()` binnen de generator: dan zou dezelfde oefening met
 * hetzelfde zaad in januari andere opgaven geven dan in december, en dat is
 * precies wat een zaad hoort te voorkomen. Het jaar is daarom een instelling,
 * met het huidige jaar als stand waarmee een nieuw sjabloon begint.
 */
const STANDAARDJAAR = new Date().getFullYear();

function jaarVan(inst: Instellingen): number {
  return Math.max(2000, Math.min(2100, getal(inst, "jaar", STANDAARDJAAR)));
}

const JAARVELD = {
  soort: "getal" as const,
  sleutel: "jaar",
  label: "Welk jaar de kalenders volgen",
  min: 2000,
  max: 2100,
  hulp: "Het jaartal komt nergens op het scherm; het bepaalt alleen op welke weekdag een datum valt. Het huidige of het volgende jaar.",
};

/** Drie of vier antwoorden met precies één goede; dubbele vallen weg. */
function keuzelijst(
  kans: () => number,
  goedeTekst: string,
  valkuilen: string[],
  hoeveel: number,
): { keuzes: string[]; goed: number } {
  const uniek: string[] = [];
  for (const v of valkuilen) {
    if (v !== goedeTekst && !uniek.includes(v)) uniek.push(v);
  }
  const keuzes = husselen(kans, [goedeTekst, ...uniek.slice(0, hoeveel - 1)]);
  return { keuzes, goed: keuzes.indexOf(goedeTekst) };
}

// ---------------------------------------------------------------------------
// De dagen van de week
// ---------------------------------------------------------------------------

const DAGZIN = "{zin}";
const DAGZINNEN: Record<Leeftijdsgroep, string> = { "34": DAGZIN, "56": DAGZIN, "78": DAGZIN };

/** Alle vragen over de dagen die bij deze stand bestaan. */
function dagvragen(stand: string): { zin: string; goed: string; valkuilen: string[] }[] {
  const uit: { zin: string; goed: string; valkuilen: string[] }[] = [];

  if (stand === "volgorde") {
    DAGEN.forEach((dag, i) => {
      uit.push({
        zin: `Wat is de ${RANGTELWOORDEN[i]} dag van de week?`,
        goed: dag,
        /* De buren in de week: precies de dagen waar een kind in verdwaalt. */
        valkuilen: [DAGEN[(i + 1) % 7], DAGEN[(i + 6) % 7], DAGEN[(i + 2) % 7]],
      });
      uit.push({
        zin: `De hoeveelste dag van de week is ${dag}?`,
        goed: RANGTELWOORDEN[i],
        valkuilen: [
          RANGTELWOORDEN[(i + 1) % 7],
          RANGTELWOORDEN[(i + 6) % 7],
          RANGTELWOORDEN[(i + 2) % 7],
        ],
      });
    });
    return uit;
  }

  /* De dag ervoor en de dag erna, één tot en met twee dagen, over het weekend heen. */
  for (let i = 0; i < 7; i++) {
    for (const stap of [1, 2]) {
      for (const kant of ["voor", "na"] as const) {
        const doel = (i + (kant === "na" ? stap : -stap) + 14) % 7;
        uit.push({
          zin:
            stap === 1
              ? `Welke dag komt ${kant} ${DAGEN[i]}?`
              : `Welke dag is het ${stap} dagen ${kant} ${DAGEN[i]}?`,
          goed: DAGEN[doel],
          valkuilen: [
            /* De andere kant op, en eentje ernaast. */
            DAGEN[(i + (kant === "na" ? -stap : stap) + 14) % 7],
            DAGEN[(doel + 1) % 7],
            DAGEN[(doel + 6) % 7],
          ],
        });
      }
    }
  }
  return uit;
}

export const dagvraagGenerator: Generator = {
  id: "dagvraag",
  naam: "Vraag over de dagen van de week",
  uitleg:
    "Een vraag over de dagen, en het kind kiest uit drie antwoorden. In de stand \"op volgorde\" gaat het over de hoeveelste dag; in de stand \"ervoor en erna\" over één of twee dagen voor of na een dag, ook over het weekend heen.",
  suggestie: "Groep 4: op volgorde · groep 5: ervoor en erna",
  velden: [
    {
      soort: "keuze",
      sleutel: "stand",
      label: "Wat er gevraagd wordt",
      opties: [
        { waarde: "volgorde", label: "Op volgorde — \"Wat is de tweede dag van de week?\"" },
        { waarde: "ervoorerna", label: "Ervoor en erna — \"1 dag voor dinsdag?\"" },
      ],
    },
    ...vraagtekstVelden(DAGZINNEN, {
      voorbeeldzinnen: {
        "34": "Wat is de tweede dag van de week?",
        "56": "Wat is de tweede dag van de week?",
        "78": "Wat is de tweede dag van de week?",
      },
      extraHulp: "Op de plek van {zin} komt de vraag van deze opgave te staan.",
    }),
  ],
  vraagteksten: { standaard: DAGZINNEN },
  standaard: { stand: "volgorde" },
  foutpatronen: tijdPatronen,
  aanpak: dagenAanpak,
  uitleganimatie: dagenUitleg,

  /* Elke vraag twee keer: de tweede keer met andere foute keuzes. */
  maximum: (inst) => dagvragen(tekst(inst, "stand", "volgorde")).length * 2,

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const stand = tekst(inst, "stand", "volgorde");
    const uit: Gegenereerd[] = [];

    for (const { item: vraag, variant } of metTweedeVariant(kans, dagvragen(stand))) {
      if (uit.length >= aantal) break;
      const handtekening = `dagvraag:${stand}:${vraag.zin}${variant ? ":2" : ""}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const { keuzes, goed } = keuzelijst(
        kans,
        vraag.goed,
        doorgeschoven(vraag.valkuilen, variant),
        3,
      );
      const gegevens = {
        soort: "dagvraag",
        variant: stand,
        getallen: [DAGEN.indexOf(vraag.goed as (typeof DAGEN)[number]) + 1, 0],
        goed,
        extra: { keuze: 1, antwoordNummer: DAGEN.indexOf(vraag.goed as (typeof DAGEN)[number]) + 1 },
      };

      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(dagvraagGenerator, inst, groep, gegevens, { zin: vraag.zin }),
        antwoord: String(goed),
        figuur: { soort: "dagvraag", zin: vraag.zin, keuzes, goed },
        somgegevens: gegevens,
      });
    }
    return uit;
  },
};

// ---------------------------------------------------------------------------
// Dagen aanvullen
// ---------------------------------------------------------------------------

const AANVULZIN = "Vul de ontbrekende dagen in.";
const AANVULZINNEN: Record<Leeftijdsgroep, string> = {
  "34": AANVULZIN,
  "56": AANVULZIN,
  "78": AANVULZIN,
};

export const dagenaanvullenGenerator: Generator = {
  id: "dagenaanvullen",
  naam: "Dagen aanvullen",
  uitleg:
    "Een rij van vier dagen op volgorde met gaten erin, bijvoorbeeld dinsdag – ▢ – donderdag – ▢. Het kind typt de ontbrekende dagen; hoofdletters en spaties maken niet uit, en bij een fout komt de goede spelling eronder.",
  suggestie: "Groep 4: vier dagen met twee gaten",
  velden: [
    {
      soort: "getal",
      sleutel: "lengte",
      label: "Hoeveel dagen op een rij",
      min: 3,
      max: 5,
    },
    {
      soort: "getal",
      sleutel: "gaten",
      label: "Hoeveel gaten",
      min: 1,
      max: 2,
      hulp: "De eerste dag blijft altijd staan, zodat het kind weet waar de rij begint.",
    },
    ...vraagtekstVelden(AANVULZINNEN),
  ],
  vraagteksten: { standaard: AANVULZINNEN },
  standaard: { lengte: 4, gaten: 2 },
  foutpatronen: tijdPatronen,
  aanpak: dagenAanpak,
  uitleganimatie: dagenUitleg,

  maximum: (inst) => {
    const lengte = Math.max(3, Math.min(5, getal(inst, "lengte", 4)));
    const gaten = Math.max(1, Math.min(2, getal(inst, "gaten", 2)));
    /* Zeven startdagen, maal het aantal manieren om de gaten te kiezen. */
    const plekken = lengte - 1;
    const manieren = gaten === 1 ? plekken : (plekken * (plekken - 1)) / 2;
    return 7 * manieren;
  },

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const lengte = Math.max(3, Math.min(5, getal(inst, "lengte", 4)));
    const gaten = Math.max(1, Math.min(2, getal(inst, "gaten", 2)));

    /* Alle combinaties: welke dag vooraan, en welke plekken een gat worden. */
    const alles: { start: number; gaten: number[] }[] = [];
    for (let start = 0; start < 7; start++) {
      for (let a = 1; a < lengte; a++) {
        if (gaten === 1) {
          alles.push({ start, gaten: [a] });
          continue;
        }
        for (let b = a + 1; b < lengte; b++) alles.push({ start, gaten: [a, b] });
      }
    }

    const uit: Gegenereerd[] = [];
    for (const keuze of husselen(kans, alles)) {
      if (uit.length >= aantal) break;
      const handtekening = `dagenaanvullen:${keuze.start}:${keuze.gaten.join("-")}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const rij = Array.from({ length: lengte }, (_, i) =>
        keuze.gaten.includes(i) ? null : DAGEN[(keuze.start + i) % 7],
      );
      const ontbreekt = keuze.gaten.map((i) => DAGEN[(keuze.start + i) % 7]);

      const gegevens = {
        soort: "dagenaanvullen",
        variant: "typen",
        getallen: [keuze.start + 1, keuze.gaten.length],
        goed: keuze.gaten.length,
        extra: { antwoordNummer: ((keuze.start + keuze.gaten[0]) % 7) + 1 },
      };

      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(dagenaanvullenGenerator, inst, groep, gegevens),
        antwoord: ontbreekt.join(","),
        figuur: { soort: "dagenaanvullen", rij, ontbreekt },
        somgegevens: gegevens,
      });
    }
    return uit;
  },
};

// ---------------------------------------------------------------------------
// De maanden van het jaar
// ---------------------------------------------------------------------------

const MAANDZIN = "{zin}";
const MAANDZINNEN: Record<Leeftijdsgroep, string> = {
  "34": MAANDZIN,
  "56": MAANDZIN,
  "78": MAANDZIN,
};

const maandMetHoofdletter = (i: number) =>
  `${MAANDEN[i].charAt(0).toUpperCase()}${MAANDEN[i].slice(1)}`;

/** Alle vragen over de maanden die bij deze stand bestaan. */
function maandvragen(stand: string): { zin: string; goed: string; valkuilen: string[] }[] {
  const uit: { zin: string; goed: string; valkuilen: string[] }[] = [];
  const buren = (i: number) => [MAANDEN[(i + 1) % 12], MAANDEN[(i + 11) % 12], MAANDEN[(i + 2) % 12]];

  if (stand === "erna") {
    for (let i = 0; i < 12; i++) {
      uit.push({
        zin: `Welke maand komt na ${MAANDEN[i]}?`,
        goed: MAANDEN[(i + 1) % 12],
        valkuilen: [MAANDEN[(i + 11) % 12], MAANDEN[(i + 2) % 12], MAANDEN[(i + 10) % 12]],
      });
    }
    return uit;
  }

  if (stand === "volgorde") {
    for (let i = 0; i < 12; i++) {
      uit.push({
        zin: `Wat is de ${RANGTELWOORDEN[i]} maand van het jaar?`,
        goed: MAANDEN[i],
        valkuilen: buren(i),
      });
    }
    return uit;
  }

  if (stand === "nummer") {
    for (let i = 0; i < 12; i++) {
      uit.push({
        zin: `De hoeveelste maand van het jaar is ${MAANDEN[i]}?`,
        goed: RANGTELWOORDEN[i],
        valkuilen: [
          RANGTELWOORDEN[(i + 1) % 12],
          RANGTELWOORDEN[(i + 11) % 12],
          RANGTELWOORDEN[(i + 2) % 12],
        ],
      });
    }
    return uit;
  }

  /*
    Ervoor en erna, één tot en met drie maanden.

    Bij "binnen het jaar" vallen de vragen weg die over december of januari heen
    gaan; bij "over de jaargrens" blijven juist alleen die over. Zo is elke
    titel precies wat hij belooft.
  */
  const overGrens = stand === "jaargrens";
  for (let i = 0; i < 12; i++) {
    for (const stap of [1, 2, 3]) {
      for (const kant of ["voor", "na"] as const) {
        const rauw = kant === "na" ? i + stap : i - stap;
        const gaatOver = rauw < 0 || rauw > 11;
        if (gaatOver !== overGrens) continue;
        const doel = (rauw + 12) % 12;
        uit.push({
          zin:
            stap === 1
              ? `Welke maand komt ${kant} ${MAANDEN[i]}?`
              : `Welke maand is het ${stap} maanden ${kant} ${MAANDEN[i]}?`,
          goed: MAANDEN[doel],
          valkuilen: [
            /* De andere kant op, en eentje ernaast. */
            MAANDEN[((kant === "na" ? i - stap : i + stap) + 12) % 12],
            MAANDEN[(doel + 1) % 12],
            MAANDEN[(doel + 11) % 12],
          ],
        });
      }
    }
  }
  return uit;
}

export const maandvraagGenerator: Generator = {
  id: "maandvraag",
  naam: "Vraag over de maanden",
  uitleg:
    "Een vraag over de maanden, en het kind kiest uit drie antwoorden. Vijf standen: de maand erna, de maanden op volgorde, het nummer van de maand, ervoor en erna binnen het jaar, en ervoor en erna over de jaargrens.",
  suggestie: "Groep 4: de maand erna · groep 5: op volgorde · groep 6: over de jaargrens",
  velden: [
    {
      soort: "keuze",
      sleutel: "stand",
      label: "Wat er gevraagd wordt",
      opties: [
        { waarde: "erna", label: "De maand erna — \"Welke maand komt na mei?\"" },
        { waarde: "volgorde", label: "Op volgorde — \"Wat is de achtste maand?\"" },
        { waarde: "nummer", label: "Het nummer — \"De hoeveelste maand is maart?\"" },
        { waarde: "ervoorerna", label: "Ervoor en erna, binnen het jaar" },
        { waarde: "jaargrens", label: "Ervoor en erna, over de jaargrens" },
      ],
    },
    ...vraagtekstVelden(MAANDZINNEN, {
      voorbeeldzinnen: {
        "34": "Welke maand komt na mei?",
        "56": "Welke maand komt na mei?",
        "78": "Welke maand komt na mei?",
      },
      extraHulp: "Op de plek van {zin} komt de vraag van deze opgave te staan.",
    }),
  ],
  vraagteksten: { standaard: MAANDZINNEN },
  standaard: { stand: "erna" },
  foutpatronen: tijdPatronen,
  aanpak: maandenAanpak,
  uitleganimatie: maandenUitleg,

  /* Elke vraag twee keer: de tweede keer met andere foute keuzes. */
  maximum: (inst) => maandvragen(tekst(inst, "stand", "erna")).length * 2,

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const stand = tekst(inst, "stand", "erna");
    const uit: Gegenereerd[] = [];

    for (const { item: vraag, variant } of metTweedeVariant(kans, maandvragen(stand))) {
      if (uit.length >= aantal) break;
      const handtekening = `maandvraag:${stand}:${vraag.zin}${variant ? ":2" : ""}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const { keuzes, goed } = keuzelijst(
        kans,
        vraag.goed,
        doorgeschoven(vraag.valkuilen, variant),
        3,
      );
      const nummer = MAANDEN.indexOf(vraag.goed as (typeof MAANDEN)[number]) + 1;
      const gegevens = {
        soort: "maandvraag",
        variant: stand,
        getallen: [nummer > 0 ? nummer : 1, 0],
        goed,
        extra: { keuze: 1, ...(nummer > 0 ? { antwoordNummer: nummer } : {}) },
      };

      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(maandvraagGenerator, inst, groep, gegevens, { zin: vraag.zin }),
        antwoord: String(goed),
        figuur: { soort: "maandvraag", zin: vraag.zin, keuzes, goed },
        somgegevens: gegevens,
      });
    }
    return uit;
  },
};

// ---------------------------------------------------------------------------
// Maanden aanvullen
// ---------------------------------------------------------------------------

const MAANVULZIN = "Vul de ontbrekende maand in.";
const MAANVULZINNEN: Record<Leeftijdsgroep, string> = {
  "34": MAANVULZIN,
  "56": MAANVULZIN,
  "78": MAANVULZIN,
};

export const maandenaanvullenGenerator: Generator = {
  id: "maandenaanvullen",
  naam: "Maanden aanvullen",
  uitleg:
    "Een rij van vier maanden op volgorde met één gat, bijvoorbeeld juni – ▢ – augustus – september. Het kind typt de ontbrekende maand. Met de jaarcirkel erbij staat er een cirkel met twaalf genummerde vakjes als hulp, januari bovenaan.",
  suggestie: "Groep 5: met de jaarcirkel, daarna zonder",
  velden: [
    {
      soort: "getal",
      sleutel: "lengte",
      label: "Hoeveel maanden op een rij",
      min: 3,
      max: 5,
    },
    {
      soort: "vinkje",
      sleutel: "jaarcirkel",
      label: "Zet de jaarcirkel erbij als hulp",
    },
    ...vraagtekstVelden(MAANVULZINNEN),
  ],
  vraagteksten: { standaard: MAANVULZINNEN },
  standaard: { lengte: 4, jaarcirkel: true },
  foutpatronen: tijdPatronen,
  aanpak: maandenAanpak,
  uitleganimatie: maandenUitleg,

  maximum: (inst) => {
    const lengte = Math.max(3, Math.min(5, getal(inst, "lengte", 4)));
    /* Twaalf startmaanden, maal de plekken waar het gat kan vallen. */
    return 12 * (lengte - 1);
  },

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const lengte = Math.max(3, Math.min(5, getal(inst, "lengte", 4)));
    const cirkel = vinkje(inst, "jaarcirkel", true);

    const alles: { start: number; gat: number }[] = [];
    for (let start = 0; start < 12; start++) {
      for (let gat = 1; gat < lengte; gat++) alles.push({ start, gat });
    }

    const uit: Gegenereerd[] = [];
    for (const keuze of husselen(kans, alles)) {
      if (uit.length >= aantal) break;
      const handtekening = `maandenaanvullen:${keuze.start}:${keuze.gat}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const rij = Array.from({ length: lengte }, (_, i) =>
        i === keuze.gat ? null : MAANDEN[(keuze.start + i) % 12],
      );
      const ontbreekt = [MAANDEN[(keuze.start + keuze.gat) % 12]];

      const gegevens = {
        soort: "maandenaanvullen",
        variant: cirkel ? "metcirkel" : "zonder",
        getallen: [((keuze.start + keuze.gat) % 12) + 1, 0],
        goed: ((keuze.start + keuze.gat) % 12) + 1,
        extra: { antwoordNummer: ((keuze.start + keuze.gat) % 12) + 1 },
      };

      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(maandenaanvullenGenerator, inst, groep, gegevens),
        antwoord: ontbreekt.join(","),
        figuur: { soort: "maandenaanvullen", rij, ontbreekt, jaarcirkel: cirkel },
        somgegevens: gegevens,
      });
    }
    return uit;
  },
};

// ---------------------------------------------------------------------------
// Op welke dag valt het?
// ---------------------------------------------------------------------------

const KDAGZIN = "{zin}";
const KDAGZINNEN: Record<Leeftijdsgroep, string> = {
  "34": KDAGZIN,
  "56": KDAGZIN,
  "78": KDAGZIN,
};

export const kalenderdagGenerator: Generator = {
  id: "kalenderdag",
  naam: "Op welke dag valt het?",
  uitleg:
    "Een maandkalender, en het kind kiest de weekdag uit vier. Met een verschuiving erbij wordt het \"Welke dag is het 5 dagen voor 10 oktober?\" — twee tot en met zes dagen, voor of na, binnen dezelfde maand.",
  suggestie: "Groep 4: zonder verschuiving · groep 6: twee tot zes dagen voor of na",
  velden: [
    JAARVELD,
    {
      soort: "getal",
      sleutel: "maxSchuif",
      label: "Hoeveel dagen verder of terug",
      min: 0,
      max: 6,
      hulp: "Nul betekent: gewoon \"op welke dag valt 1 maart?\". Vanaf twee komt er \"5 dagen voor 10 oktober\" bij, altijd binnen dezelfde maand.",
    },
    ...vraagtekstVelden(KDAGZINNEN, {
      voorbeeldzinnen: {
        "34": "Op welke dag valt 1 maart?",
        "56": "Op welke dag valt 1 maart?",
        "78": "Op welke dag valt 1 maart?",
      },
      extraHulp: "Op de plek van {zin} komt de vraag van deze opgave te staan.",
    }),
  ],
  vraagteksten: { standaard: KDAGZINNEN },
  standaard: { jaar: STANDAARDJAAR, maxSchuif: 0 },
  foutpatronen: tijdPatronen,
  aanpak: kalenderAanpak,
  uitleganimatie: kalenderUitleg,

  maximum: (inst) => {
    const schuif = Math.max(0, Math.min(6, getal(inst, "maxSchuif", 0)));
    /* Twaalf maanden, elk met zijn dagen; bij een verschuiving ook de richting. */
    const perMaand = 28;
    return schuif === 0 ? 12 * perMaand : 12 * perMaand * 2;
  },

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const jaar = jaarVan(inst);
    const maxSchuif = Math.max(0, Math.min(6, getal(inst, "maxSchuif", 0)));
    const uit: Gegenereerd[] = [];

    for (let poging = 0; poging < aantal * 400 && uit.length < aantal; poging++) {
      const maand = 1 + Math.floor(kans() * 12);
      const dagen = dagenInMaand(jaar, maand);
      const dag = 1 + Math.floor(kans() * dagen);

      /* Twee tot en met zes dagen, voor of na, en altijd binnen de maand. */
      const stap = maxSchuif < 2 ? 0 : 2 + Math.floor(kans() * (maxSchuif - 1));
      const terug = stap > 0 && kans() < 0.5;
      const doel = dag + (terug ? -stap : stap);
      if (doel < 1 || doel > dagen) continue;

      const handtekening = `kalenderdag:${maand}-${dag}-${terug ? -stap : stap}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const dagnaam = dagnaamVan(jaar, maand, doel);
      const weekdag = weekdagVan(jaar, maand, doel);
      const { keuzes, goed } = keuzelijst(
        kans,
        dagnaam,
        [DAGEN[(weekdag + 1) % 7], DAGEN[(weekdag + 6) % 7], DAGEN[(weekdag + 2) % 7]],
        4,
      );

      const zin =
        stap === 0
          ? `Op welke dag valt ${datumInWoorden({ jaar, maand, dag })}?`
          : `Welke dag is het ${stap} ${stap === 1 ? "dag" : "dagen"} ${terug ? "voor" : "na"} ${datumInWoorden({ jaar, maand, dag })}?`;

      const gegevens = {
        soort: "kalenderdag",
        variant: stap === 0 ? "dag" : "schuiven",
        getallen: [dag, maand],
        goed,
        extra: { keuze: 1, antwoordDag: doel },
      };

      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(kalenderdagGenerator, inst, groep, gegevens, { zin }),
        antwoord: String(goed),
        figuur: {
          soort: "kalenderdag",
          jaar,
          maand,
          dag,
          schuif: terug ? -stap : stap,
          zin,
          keuzes,
          goed,
        },
        somgegevens: gegevens,
      });
    }
    return uit;
  },
};

// ---------------------------------------------------------------------------
// Zoek de datum
// ---------------------------------------------------------------------------

const ZOEKZIN = "{zin}";
const ZOEKZINNEN: Record<Leeftijdsgroep, string> = {
  "34": ZOEKZIN,
  "56": ZOEKZIN,
  "78": ZOEKZIN,
};

export const kalenderzoekGenerator: Generator = {
  id: "kalenderzoek",
  naam: "Zoek de datum",
  uitleg:
    "Een maandkalender met een opdracht als \"Tik op de eerste zaterdag van de maand\". Het kind tikt de juiste dag aan in de kalender; het antwoord is die datum.",
  suggestie: "Groep 4: eerste, tweede en laatste",
  velden: [JAARVELD, ...vraagtekstVelden(ZOEKZINNEN, {
    voorbeeldzinnen: {
      "34": "Tik op de eerste zaterdag van de maand.",
      "56": "Tik op de eerste zaterdag van de maand.",
      "78": "Tik op de eerste zaterdag van de maand.",
    },
    extraHulp: "Op de plek van {zin} komt de opdracht van deze opgave te staan.",
  })],
  vraagteksten: { standaard: ZOEKZINNEN },
  standaard: { jaar: STANDAARDJAAR },
  foutpatronen: tijdPatronen,
  aanpak: kalenderzoekAanpak,
  uitleganimatie: kalenderUitleg,

  /* Twaalf maanden, zeven weekdagen, drie manieren om te vragen. */
  maximum: () => 12 * 7 * 3,

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const jaar = jaarVan(inst);
    const uit: Gegenereerd[] = [];

    const alles: { maand: number; weekdag: number; welke: string }[] = [];
    for (let maand = 1; maand <= 12; maand++) {
      for (let weekdag = 0; weekdag < 7; weekdag++) {
        for (const welke of ["eerste", "tweede", "laatste"]) alles.push({ maand, weekdag, welke });
      }
    }

    for (const keuze of husselen(kans, alles)) {
      if (uit.length >= aantal) break;

      const dag =
        keuze.welke === "laatste"
          ? laatsteWeekdag(jaar, keuze.maand, keuze.weekdag)
          : zoveelsteWeekdag(jaar, keuze.maand, keuze.weekdag, keuze.welke === "eerste" ? 1 : 2);
      if (dag === null) continue;

      const handtekening = `kalenderzoek:${keuze.maand}-${keuze.weekdag}-${keuze.welke}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const zin = `Tik op de ${keuze.welke} ${DAGEN[keuze.weekdag]} van de maand.`;
      const gegevens = {
        soort: "kalenderzoek",
        variant: keuze.welke,
        getallen: [dag, keuze.maand],
        goed: dag,
        extra: { antwoordDag: dag },
      };

      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(kalenderzoekGenerator, inst, groep, gegevens, { zin }),
        antwoord: String(dag),
        figuur: { soort: "kalenderzoek", jaar, maand: keuze.maand, zin, juisteDag: dag },
        somgegevens: gegevens,
      });
    }
    return uit;
  },
};

// ---------------------------------------------------------------------------
// Dagen in een maand
// ---------------------------------------------------------------------------

const AANTALZIN = "{zin}";
const AANTALZINNEN: Record<Leeftijdsgroep, string> = {
  "34": AANTALZIN,
  "56": AANTALZIN,
  "78": AANTALZIN,
};

export const kalenderaantalGenerator: Generator = {
  id: "kalenderaantal",
  naam: "Dagen in een maand",
  uitleg:
    "Een maandkalender met de vraag \"Hoeveel dagen heeft deze maand?\" of \"Hoeveel zondagen zitten in deze maand?\". Het kind typt het getal.",
  suggestie: "Groep 4: allebei de vragen aan",
  velden: [
    JAARVELD,
    {
      soort: "vinkje",
      sleutel: "weekdagen",
      label: "Ook naar een weekdag vragen",
      hulp: "Dan komt er ook \"Hoeveel zondagen zitten in deze maand?\" voor.",
    },
    ...vraagtekstVelden(AANTALZINNEN, {
      voorbeeldzinnen: {
        "34": "Hoeveel dagen heeft deze maand?",
        "56": "Hoeveel dagen heeft deze maand?",
        "78": "Hoeveel dagen heeft deze maand?",
      },
      extraHulp: "Op de plek van {zin} komt de vraag van deze opgave te staan.",
    }),
  ],
  vraagteksten: { standaard: AANTALZINNEN },
  standaard: { jaar: STANDAARDJAAR, weekdagen: true },
  foutpatronen: tijdPatronen,
  aanpak: kalendertellenAanpak,
  uitleganimatie: kalendertellenUitleg,

  maximum: (inst) => (vinkje(inst, "weekdagen", true) ? 12 + 12 * 7 : 12),

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const jaar = jaarVan(inst);
    const metWeekdagen = vinkje(inst, "weekdagen", true);
    const uit: Gegenereerd[] = [];

    const alles: { maand: number; weekdag: number | null }[] = [];
    for (let maand = 1; maand <= 12; maand++) {
      alles.push({ maand, weekdag: null });
      if (!metWeekdagen) continue;
      for (let weekdag = 0; weekdag < 7; weekdag++) alles.push({ maand, weekdag });
    }

    for (const keuze of husselen(kans, alles)) {
      if (uit.length >= aantal) break;
      const handtekening = `kalenderaantal:${keuze.maand}-${keuze.weekdag ?? "dagen"}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const uitkomst =
        keuze.weekdag === null
          ? dagenInMaand(jaar, keuze.maand)
          : hoeveelKeerWeekdag(jaar, keuze.maand, keuze.weekdag);
      const zin =
        keuze.weekdag === null
          ? "Hoeveel dagen heeft deze maand?"
          : `Hoeveel ${DAGEN[keuze.weekdag]}en zitten er in deze maand?`;

      const gegevens = {
        soort: "kalenderaantal",
        variant: keuze.weekdag === null ? "dagen" : "weekdag",
        getallen: [uitkomst, keuze.maand],
        goed: uitkomst,
      };

      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(kalenderaantalGenerator, inst, groep, gegevens, { zin }),
        antwoord: String(uitkomst),
        figuur: { soort: "kalenderaantal", jaar, maand: keuze.maand, zin, uitkomst },
        somgegevens: gegevens,
      });
    }
    return uit;
  },
};

// ---------------------------------------------------------------------------
// Welke datum is het dan?
// ---------------------------------------------------------------------------

const DATUMZIN = "{zin}";
const DATUMZINNEN: Record<Leeftijdsgroep, string> = {
  "34": DATUMZIN,
  "56": DATUMZIN,
  "78": DATUMZIN,
};

export const kalenderdatumGenerator: Generator = {
  id: "kalenderdatum",
  naam: "Welke datum is het dan?",
  uitleg:
    "Een maandkalender met vandaag gemarkeerd, en een vraag als \"Vandaag is het 18 november. Welke datum is het morgen?\". Het kind kiest uit vier datums. Bij een stap over de maandgrens staan er twee kalenders naast elkaar.",
  suggestie: "Groep 4: gisteren en morgen · groep 5: twee dagen en een week · groep 6: maandgrens",
  velden: [
    JAARVELD,
    {
      soort: "keuze",
      sleutel: "stand",
      label: "Hoe groot de stap is",
      opties: [
        { waarde: "dag", label: "Gisteren en morgen — één dag" },
        { waarde: "tweedagen", label: "Eergisteren en overmorgen — twee dagen" },
        { waarde: "week", label: "Een week later of eerder" },
        { waarde: "maandgrens", label: "Over de maandgrens — twee kalenders" },
      ],
    },
    ...vraagtekstVelden(DATUMZINNEN, {
      voorbeeldzinnen: {
        "34": "Vandaag is het 18 november. Welke datum is het morgen?",
        "56": "Vandaag is het 18 november. Welke datum is het morgen?",
        "78": "Vandaag is het 18 november. Welke datum is het morgen?",
      },
      extraHulp: "Op de plek van {zin} komt de vraag van deze opgave te staan.",
    }),
  ],
  vraagteksten: { standaard: DATUMZINNEN },
  standaard: { jaar: STANDAARDJAAR, stand: "dag" },
  foutpatronen: tijdPatronen,
  aanpak: kalenderAanpak,
  uitleganimatie: kalenderUitleg,

  maximum: (inst) => {
    const stand = tekst(inst, "stand", "dag");
    /* Twaalf maanden, de dagen erin, en twee kanten. */
    return stand === "maandgrens" ? 12 * 4 : 12 * 25 * 2;
  },

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const jaar = jaarVan(inst);
    const stand = tekst(inst, "stand", "dag");
    const uit: Gegenereerd[] = [];

    const stapVan = (s: string) => (s === "week" ? 7 : s === "tweedagen" ? 2 : s === "maandgrens" ? 3 : 1);
    const woordVan = (s: string, vooruit: boolean) => {
      if (s === "week") return vooruit ? "over een week" : "een week geleden";
      if (s === "tweedagen") return vooruit ? "overmorgen" : "eergisteren";
      if (s === "maandgrens") return vooruit ? "over 3 dagen" : "3 dagen geleden";
      return vooruit ? "morgen" : "gisteren";
    };

    for (let poging = 0; poging < aantal * 400 && uit.length < aantal; poging++) {
      const maand = 1 + Math.floor(kans() * 12);
      const dagen = dagenInMaand(jaar, maand);
      const stap = stapVan(stand);
      const vooruit = kans() < 0.5;

      /*
        Bij de maandgrens moet de stap er juist overheen gaan; bij de andere
        standen moet hij er juist binnen blijven, want dan staat er één kalender.
      */
      const dag =
        stand === "maandgrens"
          ? vooruit
            ? dagen - (1 + Math.floor(kans() * stap))
            : 1 + Math.floor(kans() * stap)
          : 1 + stap + Math.floor(kans() * Math.max(1, dagen - 2 * stap));
      if (dag < 1 || dag > dagen) continue;

      const doel = plusDagen({ jaar, maand, dag }, vooruit ? stap : -stap);
      const binnenMaand = doel.maand === maand;
      if (stand === "maandgrens" ? binnenMaand : !binnenMaand) continue;

      const handtekening = `kalenderdatum:${stand}:${maand}-${dag}-${vooruit ? "na" : "voor"}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      /*
        De valkuilen: de andere kant op, en één dag ernaast. In de antwoorden
        staan geen jaartallen (WERKPLAN.md), dus alleen de dag en de maand.
      */
      const andersom = plusDagen({ jaar, maand, dag }, vooruit ? -stap : stap);
      const { keuzes, goed } = keuzelijst(
        kans,
        datumInWoorden(doel),
        [
          datumInWoorden(andersom),
          datumInWoorden(plusDagen(doel, 1)),
          datumInWoorden(plusDagen(doel, -1)),
        ],
        4,
      );

      /* Terug in de tijd in de verleden tijd: "Welke datum was het gisteren?" */
      const zin = `Vandaag is het ${datumInWoorden({ jaar, maand, dag })}. Welke datum ${vooruit ? "is" : "was"} het ${woordVan(stand, vooruit)}?`;

      const gegevens = {
        soort: "kalenderdatum",
        variant: stand,
        getallen: [dag, maand],
        goed,
        extra: { keuze: 1, antwoordDag: doel.dag },
      };

      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(kalenderdatumGenerator, inst, groep, gegevens, { zin }),
        antwoord: String(goed),
        figuur: {
          soort: "kalenderdatum",
          jaar,
          maand,
          dag,
          schuif: vooruit ? stap : -stap,
          zin,
          keuzes,
          goed,
          tweedeMaand: stand === "maandgrens",
        },
        somgegevens: gegevens,
      });
    }
    return uit;
  },
};

// ---------------------------------------------------------------------------
// Hoe lang nog?
// ---------------------------------------------------------------------------

const NACHTZIN = "{zin}";
const NACHTZINNEN: Record<Leeftijdsgroep, string> = {
  "34": NACHTZIN,
  "56": NACHTZIN,
  "78": NACHTZIN,
};

/**
 * Waar het feest over gaat.
 *
 * Een instelling en geen vaste lijst in de code: de eigenaar bepaalt waar het
 * over gaat, en de waarde staat per sjabloon in de database.
 */
const STANDAARD_FEESTEN = "is het feest, ga je op schoolreis, komt opa, begint de vakantie";

function feesten(inst: Instellingen): string[] {
  return tekst(inst, "feesten", STANDAARD_FEESTEN)
    .split(/[,\n;]+/)
    .map((f) => f.trim())
    .filter(Boolean);
}

export const kalendernachtjesGenerator: Generator = {
  id: "kalendernachtjes",
  naam: "Hoe lang nog?",
  uitleg:
    "Een maandkalender met vandaag en de feestdag erin, en een vraag als \"Vandaag is het 3 mei. Op 10 mei is het feest. Hoeveel nachtjes nog slapen?\". Het kind typt het getal, van 2 tot en met 14.",
  suggestie: "Groep 6: twee tot veertien nachtjes",
  velden: [
    JAARVELD,
    {
      soort: "getal",
      sleutel: "minNachten",
      label: "Minste aantal nachtjes",
      min: 1,
      max: 14,
    },
    {
      soort: "getal",
      sleutel: "maxNachten",
      label: "Meeste aantal nachtjes",
      min: 1,
      max: 20,
    },
    {
      soort: "tekst",
      sleutel: "feesten",
      label: "Waar het over gaat",
      plaatshouder: STANDAARD_FEESTEN,
      hulp: "Per situatie een stukje tekst dat achter \"Op 10 mei\" past, gescheiden door komma's.",
    },
    ...vraagtekstVelden(NACHTZINNEN, {
      voorbeeldzinnen: {
        "34": "Vandaag is het 3 mei. Op 10 mei is het feest. Hoeveel nachtjes nog slapen?",
        "56": "Vandaag is het 3 mei. Op 10 mei is het feest. Hoeveel nachtjes nog slapen?",
        "78": "Vandaag is het 3 mei. Op 10 mei is het feest. Hoeveel nachtjes nog slapen?",
      },
      extraHulp: "Op de plek van {zin} komt het verhaaltje van deze opgave te staan.",
    }),
  ],
  vraagteksten: { standaard: NACHTZINNEN },
  standaard: { jaar: STANDAARDJAAR, minNachten: 2, maxNachten: 14, feesten: STANDAARD_FEESTEN },
  foutpatronen: tijdPatronen,
  aanpak: kalendertellenAanpak,
  uitleganimatie: kalendertellenUitleg,

  waarschuwing: (inst) =>
    feesten(inst).length === 0
      ? "Er staat niets bij \"Waar het over gaat\". Schrijf er een paar situaties neer, gescheiden door komma's."
      : null,

  maximum: (inst) => {
    const min = Math.max(1, Math.min(14, getal(inst, "minNachten", 2)));
    const max = Math.max(min, Math.min(20, getal(inst, "maxNachten", 14)));
    /* Twaalf maanden, de dagen erin, en de afstanden die passen. */
    return 12 * 20 * (max - min + 1);
  },

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const jaar = jaarVan(inst);
    const minN = Math.max(1, Math.min(14, getal(inst, "minNachten", 2)));
    const maxN = Math.max(minN, Math.min(20, getal(inst, "maxNachten", 14)));
    const waar = feesten(inst);
    if (waar.length === 0) return [];
    const uit: Gegenereerd[] = [];

    for (let poging = 0; poging < aantal * 400 && uit.length < aantal; poging++) {
      const maand = 1 + Math.floor(kans() * 12);
      const dagen = dagenInMaand(jaar, maand);
      const nachten = minN + Math.floor(kans() * (maxN - minN + 1));
      const dag = 1 + Math.floor(kans() * (dagen - nachten));
      const doel = dag + nachten;
      /* Allebei binnen dezelfde maand, want er staat één kalender. */
      if (doel > dagen) continue;

      const handtekening = `kalendernachtjes:${maand}-${dag}-${doel}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const zin = `Vandaag is het ${datumInWoorden({ jaar, maand, dag })}. Op ${datumInWoorden({ jaar, maand, dag: doel })} ${kiesUit(kans, waar)}. Hoeveel nachtjes nog slapen?`;

      const gegevens = {
        soort: "kalendernachtjes",
        variant: "nachtjes",
        getallen: [dag, maand],
        goed: nachten,
      };

      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(kalendernachtjesGenerator, inst, groep, gegevens, { zin }),
        antwoord: String(nachten),
        figuur: { soort: "kalendernachtjes", jaar, maand, dag, doel, zin },
        somgegevens: gegevens,
      });
    }
    return uit;
  },
};
