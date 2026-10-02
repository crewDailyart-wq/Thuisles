/**
 * Elke oefening uit WERKPLAN.md geeft vijftien opgaven, zonder dubbele.
 *
 * ---------------------------------------------------------------------------
 * Waarom dit bestaat
 * ---------------------------------------------------------------------------
 * De afspraak is hard: elke titel in WERKPLAN.md geeft minstens vijftien
 * opgaven per ronde, en binnen één ronde komt geen opgave twee keer voor. Dat is
 * precies het soort afspraak dat je niet merkt wanneer het breekt. Een oefening
 * die er elf uit haalt ziet er namelijk prima uit; je moet hem helemaal
 * doorspelen om te zien dat hij vroeg ophoudt.
 *
 * Daarom staat hieronder elke titel met de instellingen die erbij horen, en
 * wordt er van elke titel echt een ronde gemaakt. Dat kan zonder database en
 * zonder vragen aan te maken: een generator is puur rekenwerk (zie HARDE REGEL 2
 * in CLAUDE.md — dit script maakt niets aan).
 *
 * Deze lijst is tegelijk de brug tussen WERKPLAN.md en de code: hier staat welk
 * type en welke instellingen bij welke titel horen, en welke bolletjes daaruit
 * horen te volgen. Komt er een titel bij, zet hem erbij.
 *
 * ---------------------------------------------------------------------------
 * Wat er per opgave wordt nagekeken
 * ---------------------------------------------------------------------------
 *   1. er komen er minstens vijftien, en geen twee dezelfde;
 *   2. het antwoord is met dezelfde instellingen altijd hetzelfde (het zaad
 *      doet wat het belooft);
 *   3. het antwoord wordt door `isGoed` goed gerekend, en een leeg of onzinnig
 *      antwoord niet;
 *   4. het antwoord past precies op de vakjes die het scherm tekent;
 *   5. de bolletjes komen uit op wat WERKPLAN.md zegt;
 *   6. "zo los je het op", de foutpatronen en de uitleg-animatie zijn er, voor
 *      alle groepen.
 */

import assert from "node:assert/strict";
import { zoekGenerator } from "../src/lib/generatoren/index.ts";
import { isGoed } from "../src/lib/antwoord.ts";
import { controleerUitleg } from "../src/lib/generatoren/uitlegscript.ts";
import { controleerPatronen, herkenFout } from "../src/lib/generatoren/foutpatroon.ts";
import { bolletjesVan, puntenVan } from "../src/lib/moeilijkheid.ts";
import { isKeerfiguur, juisteAntwoorden as keerAntwoorden } from "../src/lib/keerfiguren.ts";

/* Hoeveel opgaven een ronde minstens moet opleveren. Nooit minder. */
const PER_RONDE = 15;

/**
 * De oefeningen, in de volgorde van WERKPLAN.md.
 *
 *   titel      zoals het kind hem ziet
 *   soort      welk generator-type
 *   bolletjes  wat WERKPLAN.md erbij zet
 *   inst       de instellingen die bij die titel horen
 */
const OEFENINGEN = [
  // -------------------------------------------------------------------------
  // Groep 4 – Delen – Onderwerp 1: Deeltafels oefenen
  // -------------------------------------------------------------------------
  { groep: "Delen · Deeltafels oefenen", titel: "Delen door 1", soort: "deelsom", bolletjes: 1, inst: { delers: ["1"], tot: 15 } },
  { groep: "Delen · Deeltafels oefenen", titel: "Delen door 2", soort: "deelsom", bolletjes: 1, inst: { delers: ["2"], tot: 15 } },
  { groep: "Delen · Deeltafels oefenen", titel: "Delen door 10", soort: "deelsom", bolletjes: 1, inst: { delers: ["10"], tot: 15 } },
  { groep: "Delen · Deeltafels oefenen", titel: "Delen door 5", soort: "deelsom", bolletjes: 2, inst: { delers: ["5"], tot: 15 } },
  { groep: "Delen · Deeltafels oefenen", titel: "Delen door 3", soort: "deelsom", bolletjes: 3, inst: { delers: ["3"], tot: 15 } },
  { groep: "Delen · Deeltafels oefenen", titel: "Delen door 4", soort: "deelsom", bolletjes: 3, inst: { delers: ["4"], tot: 15 } },
  { groep: "Delen · Deeltafels oefenen", titel: "Delen door 6", soort: "deelsom", bolletjes: 4, inst: { delers: ["6"], tot: 15 } },
  { groep: "Delen · Deeltafels oefenen", titel: "Delen door 8", soort: "deelsom", bolletjes: 4, inst: { delers: ["8"], tot: 15 } },
  { groep: "Delen · Deeltafels oefenen", titel: "Delen door 7", soort: "deelsom", bolletjes: 5, inst: { delers: ["7"], tot: 15 } },
  { groep: "Delen · Deeltafels oefenen", titel: "Delen door 9", soort: "deelsom", bolletjes: 5, inst: { delers: ["9"], tot: 15 } },

  // -------------------------------------------------------------------------
  // Groep 4 – Delen – Onderwerp 2: Deelsommen
  // -------------------------------------------------------------------------
  { groep: "Delen · Deelsommen", titel: "Deelsommen tot en met 5", soort: "deelsom", bolletjes: 2, inst: { delers: ["1", "2", "3", "4", "5"], tot: 15 } },
  { groep: "Delen · Deelsommen", titel: "Deelsommen tot en met 10", soort: "deelsom", bolletjes: 3, inst: { delers: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"], tot: 15 } },
  { groep: "Delen · Deelsommen", titel: "Deelsommen koppelen: tafels van 1, 2, 5 en 10", soort: "deelkoppelen", bolletjes: 4, inst: { delers: ["1", "2", "5", "10"], tot: 15, rijen: 5 } },
  { groep: "Delen · Deelsommen", titel: "Deelsommen koppelen: tafels van 1 tot en met 10", soort: "deelkoppelen", bolletjes: 4, inst: { delers: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"], tot: 15, rijen: 5 } },
  { groep: "Delen · Deelsommen", titel: "Welke deelsommen passen?", soort: "welkedeelsom", bolletjes: 5, inst: { tot: 15, max: 10 } },

  // -------------------------------------------------------------------------
  // Groep 4 – Tafels – Onderwerp 1: Keersommen begrijpen
  // -------------------------------------------------------------------------
  { groep: "Tafels · Keersommen begrijpen", titel: "Rijen en kolommen tellen", soort: "keerraster", bolletjes: 1, inst: {} },
  { groep: "Tafels · Keersommen begrijpen", titel: "Een keersom bij een plaatje", soort: "keerplaatjes", bolletjes: 2, inst: {} },
  { groep: "Tafels · Keersommen begrijpen", titel: "Handig rekenen met keersommen", soort: "handigkeer", bolletjes: 3, inst: {} },
  { groep: "Tafels · Keersommen begrijpen", titel: "Rekenen met nullen", soort: "keernullen", bolletjes: 4, inst: {} },

  // -------------------------------------------------------------------------
  // Groep 4 – Tafels – Onderwerp 2: Tafels oefenen
  // -------------------------------------------------------------------------
  { groep: "Tafels · Tafels oefenen", titel: "Tafels van 1 tot en met 5", soort: "keersom", bolletjes: 1, inst: { tafels: ["1", "2", "3", "4", "5"], max: 10 } },
  { groep: "Tafels · Tafels oefenen", titel: "Tafels van 6 tot en met 10", soort: "keersom", bolletjes: 2, inst: { tafels: ["6", "7", "8", "9", "10"], max: 10 } },
  { groep: "Tafels · Tafels oefenen", titel: "Tafels koppelen: 1, 2, 5 en 10", soort: "keerkoppelen", bolletjes: 2, inst: { tafels: ["1", "2", "5", "10"], max: 10, rijen: 5 } },
  { groep: "Tafels · Tafels oefenen", titel: "Tafels koppelen: 1 tot en met 10", soort: "keerkoppelen", bolletjes: 3, inst: { tafels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"], max: 10, rijen: 5 } },
  { groep: "Tafels · Tafels oefenen", titel: "Tafels van 1 tot en met 10 door elkaar", soort: "keersom", bolletjes: 3, inst: { tafels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"], max: 10 } },
  { groep: "Tafels · Tafels oefenen", titel: "Welke keersommen passen?", soort: "welkekeersom", bolletjes: 3, inst: { van: 4, max: 10 } },
  { groep: "Tafels · Tafels oefenen", titel: "Tafels van 11 tot en met 15", soort: "keersom", bolletjes: 4, inst: { tafels: ["11", "12", "13", "14", "15"], max: 10 } },
  { groep: "Tafels · Tafels oefenen", titel: "Tafels van 16 tot en met 20", soort: "keersom", bolletjes: 5, inst: { tafels: ["16", "17", "18", "19", "20"], max: 10 } },

  // -------------------------------------------------------------------------
  // Groep 4 – Tafels – Onderwerp 3: Keersom en deelsom
  // -------------------------------------------------------------------------
  { groep: "Tafels · Keersom en deelsom", titel: "Keersom en deelsom koppelen", soort: "keerdeelkoppelen", bolletjes: 3, inst: {} },
  { groep: "Tafels · Keersom en deelsom", titel: "Keersom en deelsom samen", soort: "keerdeelsamen", bolletjes: 3, inst: {} },

  // -------------------------------------------------------------------------
  // Groep 4 – Tafels – Onderwerp 4: Keersommen in het echt
  // -------------------------------------------------------------------------
  { groep: "Tafels · Keersommen in het echt", titel: "Boodschappen op de markt", soort: "marktkraam", bolletjes: 1, inst: { wisselgeld: false } },
  { groep: "Tafels · Keersommen in het echt", titel: "Wisselgeld op de markt", soort: "marktkraam", bolletjes: 2, inst: { wisselgeld: true, betaaldMet: 20 } },
];

// ---------------------------------------------------------------------------
// De controle
// ---------------------------------------------------------------------------

const fouten = [];
let nagekeken = 0;

for (const oefening of OEFENINGEN) {
  const waar = `${oefening.groep} — "${oefening.titel}"`;
  const generator = zoekGenerator(oefening.soort);
  if (!generator) {
    fouten.push(`${waar}: het type "${oefening.soort}" bestaat niet.`);
    continue;
  }

  /* De instellingen zoals ze in de database zouden staan: standaard plus eigen. */
  const inst = { ...generator.standaard, ...oefening.inst };

  /* 1. Minstens vijftien, geen twee dezelfde. */
  const ronde = generator.maak(inst, PER_RONDE, new Set(), 4711, 4);
  if (ronde.length < PER_RONDE) {
    fouten.push(
      `${waar}: er komen ${ronde.length} opgaven uit in plaats van ${PER_RONDE}. ` +
        `Het type kent hier hoogstens ${generator.maximum(inst)} verschillende opgaven; ` +
        `zet het bereik ruimer of pas de instellingen in dit bestand aan.`,
    );
    continue;
  }
  const handtekeningen = new Set(ronde.map((v) => v.handtekening));
  if (handtekeningen.size !== ronde.length) {
    fouten.push(`${waar}: er zitten dubbele opgaven in één ronde.`);
  }

  /* 2. Hetzelfde zaad geeft dezelfde ronde. */
  const nogmaals = generator.maak(inst, PER_RONDE, new Set(), 4711, 4);
  assert.deepEqual(
    nogmaals.map((v) => v.handtekening),
    ronde.map((v) => v.handtekening),
    `${waar}: hetzelfde zaad geeft een andere ronde.`,
  );

  /* 5. De bolletjes zoals WERKPLAN.md ze opgeeft. */
  const bolletjes = bolletjesVan(puntenVan(oefening.soort, inst));
  if (bolletjes !== oefening.bolletjes) {
    fouten.push(
      `${waar}: ${bolletjes} bolletjes in plaats van ${oefening.bolletjes} uit WERKPLAN.md.`,
    );
  }

  /* 6. De uitleg hoort er te zijn, voor alle groepen. */
  const gebreken = controleerPatronen(generator.foutpatronen);
  if (gebreken.length > 0) {
    fouten.push(`${waar}: foutpatronen niet in orde — ${gebreken[0].wat}`);
  }

  for (const vraag of ronde) {
    /*
      3. Elk eigen antwoord is goed, een leeg of onzinnig antwoord niet.

      Bij "maak zelf een som" staan er meerdere goede antwoorden met een
      liggend streepje ertussen; dan hoort élk van die antwoorden goed gerekend
      te worden, en de hele reeks juist niet.
    */
    for (const mag of vraag.antwoord.split("|")) {
      if (!isGoed(vraag, mag)) {
        fouten.push(`${waar}: het eigen antwoord "${mag}" wordt niet goed gerekend.`);
      }
    }
    if (isGoed(vraag, "")) fouten.push(`${waar}: een leeg antwoord wordt goed gerekend.`);
    if (isGoed(vraag, "999999")) {
      fouten.push(`${waar}: een onzinnig antwoord wordt goed gerekend.`);
    }

    /* 4. Het antwoord past op de vakjes die het scherm tekent. */
    if (isKeerfiguur(vraag.figuur)) {
      const vakjes = keerAntwoorden(vraag.figuur);
      /* Bij "maak zelf een som" staan er meerdere antwoorden; dan telt het aantal. */
      const eerste = vraag.antwoord.split("|")[0].split(",");
      if (eerste.length !== vakjes.length) {
        fouten.push(
          `${waar}: het antwoord heeft ${eerste.length} getallen, maar het scherm tekent ${vakjes.length} vakjes.`,
        );
      }
    }

    /* De vraagzin is nooit leeg; een vraag zonder zin is geen vraag. */
    if (!vraag.vraagtekst.trim()) fouten.push(`${waar}: een opgave zonder vraagzin.`);

    /* "Zo los je het op" en de uitleg-animatie werken op deze som. */
    if (generator.aanpak.stappen(vraag.somgegevens).length === 0) {
      fouten.push(`${waar}: "zo los je het op" levert geen stappen.`);
    }
    if (!generator.aanpak.controle(vraag.somgegevens).trim()) {
      fouten.push(`${waar}: er komt geen zin met het goede antwoord uit.`);
    }
    const scriptgebrek = controleerUitleg(generator.uitleganimatie, vraag.somgegevens);
    if (scriptgebrek.length > 0) {
      fouten.push(
        `${waar}: uitleg-animatie niet in orde voor groep ${scriptgebrek[0].vorm} — ${scriptgebrek[0].wat}`,
      );
    }

    /*
      Bij een fout antwoord komt er altijd iets terug: óf een herkende denkfout,
      óf de algemene "zo los je het op". `herkenFout` mag null geven — dan valt
      het scherm terug op de aanpak, en die is hierboven al nagekeken.
      Belangrijk is dat het niet stuk kan lopen.
    */
    herkenFout(generator.foutpatronen, vraag.somgegevens, "1");

    nagekeken++;
  }
}

// ---------------------------------------------------------------------------

const perGroep = new Map();
for (const o of OEFENINGEN) perGroep.set(o.groep, (perGroep.get(o.groep) ?? 0) + 1);

console.log(
  `Opgaven: ${OEFENINGEN.length} oefeningen, ${nagekeken} opgaven nagekeken ` +
    `(${PER_RONDE} per ronde, zonder dubbele).`,
);
for (const [groep, hoeveel] of perGroep) console.log(`  ✓ ${groep} — ${hoeveel} oefeningen`);

if (fouten.length > 0) {
  console.error(`\nEEN OEFENING GEEFT NIET WAT WERKPLAN.MD BELOOFT (${fouten.length}):`);
  for (const f of new Set(fouten)) console.error("  ✗ " + f);
  process.exit(1);
}
