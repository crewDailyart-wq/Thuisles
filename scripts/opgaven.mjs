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
 *   1. een ronde telt vijftien opgaven, en er komen er net zoveel verschillende
 *      uit als er bestaan. Zijn dat er minder dan vijftien — bij "Hele uren
 *      aflezen" bestaan er maar twaalf verschillende klokstanden — dan vult de
 *      opslag aan met dubbele; dat is de bestaande afspraak van het platform,
 *      zie `vulAanMetDubbele`. Hoeveel verschillende er zijn, staat in de
 *      uitvoer, zodat je het ziet;
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
import { vulAanMetDubbele } from "../src/lib/generatoren/soort.ts";
import { isGoed } from "../src/lib/antwoord.ts";
import { controleerUitleg } from "../src/lib/generatoren/uitlegscript.ts";
import { controleerPatronen, herkenFout } from "../src/lib/generatoren/foutpatroon.ts";
import { bolletjesVan, puntenVan } from "../src/lib/moeilijkheid.ts";
import { isKeerfiguur, juisteAntwoorden as keerAntwoorden } from "../src/lib/keerfiguren.ts";
import { isTijdfiguur, juistAntwoord as tijdAntwoord } from "../src/lib/tijdfiguren.ts";

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

  // -------------------------------------------------------------------------
  // Groep 4 – Tijd – Onderwerp 1: Wijzerklok en digitale klok
  // -------------------------------------------------------------------------
  { groep: "Tijd · Wijzerklok en digitale klok", titel: "Uren en minuten", soort: "urenminuten", bolletjes: 1, inst: {} },
  { groep: "Tijd · Wijzerklok en digitale klok", titel: "Dagdelen", soort: "dagdeel", bolletjes: 1, inst: { tijden: ["heel"] } },
  { groep: "Tijd · Wijzerklok en digitale klok", titel: "Hoe laat is het straks?", soort: "klokkiezen", bolletjes: 2, inst: { vraag: "verschuiving", tijden: ["heel"], maxUren: 5 } },
  { groep: "Tijd · Wijzerklok en digitale klok", titel: "Zet de wijzers goed", soort: "klokzetten", bolletjes: 2, inst: { opdracht: "tijd", tijden: ["heel", "half"] } },
  { groep: "Tijd · Wijzerklok en digitale klok", titel: "Van wijzerklok naar digitale tijd: hele uren", soort: "klokaflezen", bolletjes: 3, inst: { tijden: ["heel"], antwoordsoort: "digitaal", metDagdeel: true } },
  { groep: "Tijd · Wijzerklok en digitale klok", titel: "Van wijzerklok naar digitale tijd: halve uren", soort: "klokaflezen", bolletjes: 3, inst: { tijden: ["half"], antwoordsoort: "digitaal", metDagdeel: true } },
  { groep: "Tijd · Wijzerklok en digitale klok", titel: "Klokken koppelen", soort: "klokkoppelen", bolletjes: 4, inst: { tijden: ["heel", "half"], hoeveel: 3 } },
  { groep: "Tijd · Wijzerklok en digitale klok", titel: "Van digitale tijd naar wijzerklok", soort: "klokkiezen", bolletjes: 4, inst: { vraag: "digitaal", tijden: ["heel", "half"] } },
  { groep: "Tijd · Wijzerklok en digitale klok", titel: "Schrijf de tijd digitaal", soort: "kloktypen", bolletjes: 5, inst: { tijden: ["heel", "half"], metDagdeel: true } },

  // -------------------------------------------------------------------------
  // Groep 4 – Tijd – Onderwerp 2: De wijzerklok — Aflezen
  // -------------------------------------------------------------------------
  { groep: "Tijd · De wijzerklok · Aflezen", titel: "De grote en de kleine wijzer", soort: "wijzeraanwijzen", bolletjes: 1, inst: { tijden: ["heel", "half"] } },
  { groep: "Tijd · De wijzerklok · Aflezen", titel: "Hele uren aflezen", soort: "klokaflezen", bolletjes: 1, inst: { tijden: ["heel"], antwoordsoort: "woorden" } },
  { groep: "Tijd · De wijzerklok · Aflezen", titel: "Halve uren aflezen", soort: "klokaflezen", bolletjes: 2, inst: { tijden: ["half"], antwoordsoort: "woorden" } },
  { groep: "Tijd · De wijzerklok · Aflezen", titel: "Hele en halve uren door elkaar", soort: "klokaflezen", bolletjes: 2, inst: { tijden: ["heel", "half"], antwoordsoort: "woorden" } },
  { groep: "Tijd · De wijzerklok · Aflezen", titel: "Klopt de klok?", soort: "klokklopt", bolletjes: 2, inst: { tijden: ["heel", "half"] } },
  { groep: "Tijd · De wijzerklok · Aflezen", titel: "Kwartieren aflezen", soort: "klokaflezen", bolletjes: 3, inst: { tijden: ["kwartier"], antwoordsoort: "woorden" } },
  { groep: "Tijd · De wijzerklok · Aflezen", titel: "Welke klok hoort erbij? Hele en halve uren", soort: "klokkiezen", bolletjes: 2, inst: { vraag: "woorden", tijden: ["heel", "half"] } },
  { groep: "Tijd · De wijzerklok · Aflezen", titel: "Welke klok hoort erbij? Kwartieren", soort: "klokkiezen", bolletjes: 3, inst: { vraag: "woorden", tijden: ["kwartier"] } },
  { groep: "Tijd · De wijzerklok · Aflezen", titel: "Vijf voor en tien over aflezen", soort: "klokaflezen", bolletjes: 5, inst: { tijden: ["vijf"], antwoordsoort: "woorden" } },
  { groep: "Tijd · De wijzerklok · Aflezen", titel: "Welke klok hoort erbij? Vijf voor en tien over", soort: "klokkiezen", bolletjes: 5, inst: { vraag: "woorden", tijden: ["vijf"] } },

  // -------------------------------------------------------------------------
  // Groep 4 – Tijd – Onderwerp 2: De wijzerklok — Klok zetten
  // -------------------------------------------------------------------------
  { groep: "Tijd · De wijzerklok · Klok zetten", titel: "Zet de klok: hele uren", soort: "klokzetten", bolletjes: 1, inst: { opdracht: "tijd", tijden: ["heel"] } },
  { groep: "Tijd · De wijzerklok · Klok zetten", titel: "Zet de klok: halve uren", soort: "klokzetten", bolletjes: 2, inst: { opdracht: "tijd", tijden: ["half"] } },
  { groep: "Tijd · De wijzerklok · Klok zetten", titel: "Zet de klok: kwartieren", soort: "klokzetten", bolletjes: 3, inst: { opdracht: "tijd", tijden: ["kwartier"] } },
  { groep: "Tijd · De wijzerklok · Klok zetten", titel: "Hoe laat is het straks?", soort: "klokzetten", bolletjes: 2, inst: { opdracht: "verschuiving", tijden: ["heel", "half"], richting: "vooruit", halveUren: true } },
  { groep: "Tijd · De wijzerklok · Klok zetten", titel: "Hoe laat was het eerder?", soort: "klokzetten", bolletjes: 3, inst: { opdracht: "verschuiving", tijden: ["heel", "half"], richting: "terug", halveUren: true } },
  { groep: "Tijd · De wijzerklok · Klok zetten", titel: "Hoe laat is het straks? Vijf voor en tien over", soort: "klokzetten", bolletjes: 5, inst: { opdracht: "verschuiving", tijden: ["vijf"], richting: "vooruit", halveUren: true } },
  { groep: "Tijd · De wijzerklok · Klok zetten", titel: "Klokken op volgorde", soort: "klokkenvolgorde", bolletjes: 4, inst: { tijden: ["heel", "half"], hoeveel: 4 } },

  // -------------------------------------------------------------------------
  // Groep 4 – Tijd – Onderwerp 2: De wijzerklok — Hoe lang duurt het?
  // -------------------------------------------------------------------------
  { groep: "Tijd · De wijzerklok · Hoe lang duurt het?", titel: "Hoe lang duurt het? Hele uren", soort: "klokduur", bolletjes: 1, inst: { richting: "duur", stap: "heel" } },
  { groep: "Tijd · De wijzerklok · Hoe lang duurt het?", titel: "Hoe lang duurt het? Halve uren", soort: "klokduur", bolletjes: 2, inst: { richting: "duur", stap: "half" } },
  { groep: "Tijd · De wijzerklok · Hoe lang duurt het?", titel: "Hoe lang duurt het? Over 12 uur heen", soort: "klokduur", bolletjes: 3, inst: { richting: "duur", stap: "heel", over12: true } },
  { groep: "Tijd · De wijzerklok · Hoe lang duurt het?", titel: "Hoe lang duurt het? Kwartieren", soort: "klokduur", bolletjes: 4, inst: { richting: "duur", stap: "kwartier" } },
  { groep: "Tijd · De wijzerklok · Hoe lang duurt het?", titel: "Hoe lang geleden? Hele uren", soort: "klokduur", bolletjes: 1, inst: { richting: "geleden", stap: "heel" } },
  { groep: "Tijd · De wijzerklok · Hoe lang duurt het?", titel: "Hoe lang geleden? Halve uren", soort: "klokduur", bolletjes: 2, inst: { richting: "geleden", stap: "half" } },
  { groep: "Tijd · De wijzerklok · Hoe lang duurt het?", titel: "Hoe lang geleden? Kwartieren", soort: "klokduur", bolletjes: 4, inst: { richting: "geleden", stap: "kwartier" } },
  { groep: "Tijd · De wijzerklok · Hoe lang duurt het?", titel: "Hoe lang? Alles door elkaar", soort: "klokduur", bolletjes: 5, inst: { richting: "beide", stap: "gemengd", over12: true } },

  // -------------------------------------------------------------------------
  // Groep 4 – Tijd – Onderwerp 3: Digitale klok — Aflezen
  // -------------------------------------------------------------------------
  { groep: "Tijd · Digitale klok · Aflezen", titel: "Uren en minuten (met uitleg)", soort: "digitaaldelen", bolletjes: 2, inst: { tijden: ["heel", "half"], metUitleg: true } },
  { groep: "Tijd · Digitale klok · Aflezen", titel: "Hele uren in de dag", soort: "digitaaldagdeel", bolletjes: 2, inst: { tijden: ["heel"] } },
  { groep: "Tijd · Digitale klok · Aflezen", titel: "Hele uren aflezen", soort: "digitaalaflezen", bolletjes: 2, inst: { tijden: ["heel"] } },
  { groep: "Tijd · Digitale klok · Aflezen", titel: "Hele en halve uren aflezen", soort: "digitaalaflezen", bolletjes: 3, inst: { tijden: ["heel", "half"] } },
  { groep: "Tijd · Digitale klok · Aflezen", titel: "Hele uren, halve uren en kwartieren aflezen", soort: "digitaalaflezen", bolletjes: 3, inst: { tijden: ["heel", "half", "kwartier"] } },
  { groep: "Tijd · Digitale klok · Aflezen", titel: "Vijf en tien over en voor", soort: "digitaalaflezen", bolletjes: 4, inst: { tijden: ["vijf"] } },
  { groep: "Tijd · Digitale klok · Aflezen", titel: "Op de minuut", soort: "digitaalaflezen", bolletjes: 5, inst: { tijden: ["minuut"] } },

  // -------------------------------------------------------------------------
  // Groep 4 – Tijd – Onderwerp 3: Digitale klok — Tijd vooruit
  // -------------------------------------------------------------------------
  { groep: "Tijd · Digitale klok · Later", titel: "Tijd vooruit: hele uren", soort: "digitaalverschil", bolletjes: 1, inst: { richting: "later", stand: "heleUren" } },
  { groep: "Tijd · Digitale klok · Later", titel: "Tijd vooruit: hele uren, andere minuten", soort: "digitaalverschil", bolletjes: 2, inst: { richting: "later", stand: "andereMinuten" } },
  { groep: "Tijd · Digitale klok · Later", titel: "Tijd vooruit: halve uren", soort: "digitaalverschil", bolletjes: 3, inst: { richting: "later", stand: "halveUren" } },
  { groep: "Tijd · Digitale klok · Later", titel: "Tijd vooruit: over het hele uur heen", soort: "digitaalverschil", bolletjes: 4, inst: { richting: "later", stand: "overHeelUur" } },
  { groep: "Tijd · Digitale klok · Later", titel: "Tijd vooruit: kwartieren", soort: "digitaalverschil", bolletjes: 5, inst: { richting: "later", stand: "kwartieren" } },

  // -------------------------------------------------------------------------
  // Groep 4 – Tijd – Onderwerp 3: Digitale klok — Tijd terug
  // -------------------------------------------------------------------------
  { groep: "Tijd · Digitale klok · Eerder", titel: "Tijd terug: hele uren", soort: "digitaalverschil", bolletjes: 1, inst: { richting: "eerder", stand: "heleUren" } },
  { groep: "Tijd · Digitale klok · Eerder", titel: "Tijd terug: hele uren, andere minuten", soort: "digitaalverschil", bolletjes: 2, inst: { richting: "eerder", stand: "andereMinuten" } },
  { groep: "Tijd · Digitale klok · Eerder", titel: "Tijd terug: halve uren", soort: "digitaalverschil", bolletjes: 3, inst: { richting: "eerder", stand: "halveUren" } },
  { groep: "Tijd · Digitale klok · Eerder", titel: "Tijd terug: over het hele uur heen", soort: "digitaalverschil", bolletjes: 4, inst: { richting: "eerder", stand: "overHeelUur" } },
  { groep: "Tijd · Digitale klok · Eerder", titel: "Tijd terug: kwartieren", soort: "digitaalverschil", bolletjes: 5, inst: { richting: "eerder", stand: "kwartieren" } },

  // -------------------------------------------------------------------------
  // Groep 4 – Tijd – Onderwerp 4: Wijzerklok met vlekken
  // -------------------------------------------------------------------------
  { groep: "Tijd · Wijzerklok met vlekken", titel: "Hele uren: cijfers onder een vlek (met uitleg)", soort: "klokvlek", bolletjes: 1, inst: { tijden: ["heel"], vlek: "cijfers", metUitleg: true } },
  { groep: "Tijd · Wijzerklok met vlekken", titel: "Hele uren: wijzer onder een vlek", soort: "klokvlek", bolletjes: 2, inst: { tijden: ["heel"], vlek: "wijzer" } },
  { groep: "Tijd · Wijzerklok met vlekken", titel: "Halve uren: cijfers onder een vlek", soort: "klokvlek", bolletjes: 2, inst: { tijden: ["half"], vlek: "cijfers" } },
  { groep: "Tijd · Wijzerklok met vlekken", titel: "Halve uren: wijzer onder een vlek", soort: "klokvlek", bolletjes: 3, inst: { tijden: ["half"], vlek: "wijzer" } },
  { groep: "Tijd · Wijzerklok met vlekken", titel: "Kwart over en kwart voor: cijfers onder een vlek", soort: "klokvlek", bolletjes: 3, inst: { tijden: ["kwartier"], vlek: "cijfers" } },
  { groep: "Tijd · Wijzerklok met vlekken", titel: "Kwart over en kwart voor: wijzer onder een vlek", soort: "klokvlek", bolletjes: 4, inst: { tijden: ["kwartier"], vlek: "wijzer" } },
  { groep: "Tijd · Wijzerklok met vlekken", titel: "Gemengd: cijfers onder een vlek", soort: "klokvlek", bolletjes: 4, inst: { tijden: ["heel", "half", "kwartier"], vlek: "cijfers" } },
  { groep: "Tijd · Wijzerklok met vlekken", titel: "Gemengd: grote vlek", soort: "klokvlek", bolletjes: 5, inst: { tijden: ["heel", "half", "kwartier"], vlek: "groot" } },

  // -------------------------------------------------------------------------
  // Groep 4 – Tijd – Onderwerp 5: Maanden en dagen
  // -------------------------------------------------------------------------
  { groep: "Tijd · Maanden en dagen · Dagen", titel: "De dagen op volgorde", soort: "dagvraag", bolletjes: 1, inst: { stand: "volgorde" } },
  { groep: "Tijd · Maanden en dagen · Dagen", titel: "Dagen aanvullen", soort: "dagenaanvullen", bolletjes: 1, inst: { lengte: 4, gaten: 2 } },
  { groep: "Tijd · Maanden en dagen · Dagen", titel: "De dag ervoor en de dag erna", soort: "dagvraag", bolletjes: 3, inst: { stand: "ervoorerna" } },
  { groep: "Tijd · Maanden en dagen · Maanden", titel: "De maand erna", soort: "maandvraag", bolletjes: 1, inst: { stand: "erna" } },
  { groep: "Tijd · Maanden en dagen · Maanden", titel: "De maanden op volgorde", soort: "maandvraag", bolletjes: 2, inst: { stand: "volgorde" } },
  { groep: "Tijd · Maanden en dagen · Maanden", titel: "Het nummer van de maand", soort: "maandvraag", bolletjes: 2, inst: { stand: "nummer" } },
  { groep: "Tijd · Maanden en dagen · Maanden", titel: "Maanden aanvullen met jaarcirkel", soort: "maandenaanvullen", bolletjes: 3, inst: { jaarcirkel: true } },
  { groep: "Tijd · Maanden en dagen · Maanden", titel: "Maanden aanvullen zonder hulp", soort: "maandenaanvullen", bolletjes: 3, inst: { jaarcirkel: false } },
  { groep: "Tijd · Maanden en dagen · Maanden", titel: "Maanden ervoor en erna", soort: "maandvraag", bolletjes: 4, inst: { stand: "ervoorerna" } },
  { groep: "Tijd · Maanden en dagen · Maanden", titel: "Maanden ervoor en erna over de jaargrens", soort: "maandvraag", bolletjes: 5, inst: { stand: "jaargrens" } },

  // -------------------------------------------------------------------------
  // Groep 4 – Tijd – Onderwerp 6: Kalender
  // -------------------------------------------------------------------------
  { groep: "Tijd · Kalender · Kalender lezen", titel: "Op welke dag valt het?", soort: "kalenderdag", bolletjes: 1, inst: { maxSchuif: 0 } },
  { groep: "Tijd · Kalender · Kalender lezen", titel: "Zoek de datum", soort: "kalenderzoek", bolletjes: 2, inst: {} },
  { groep: "Tijd · Kalender · Kalender lezen", titel: "Dagen in een maand", soort: "kalenderaantal", bolletjes: 2, inst: { weekdagen: true } },
  { groep: "Tijd · Kalender · Gisteren en morgen", titel: "Gisteren en morgen", soort: "kalenderdatum", bolletjes: 2, inst: { stand: "dag" } },
  { groep: "Tijd · Kalender · Gisteren en morgen", titel: "Eergisteren en overmorgen", soort: "kalenderdatum", bolletjes: 3, inst: { stand: "tweedagen" } },
  { groep: "Tijd · Kalender · Gisteren en morgen", titel: "Een week later of eerder", soort: "kalenderdatum", bolletjes: 3, inst: { stand: "week" } },
  { groep: "Tijd · Kalender · Rekenen met de kalender", titel: "Dagen verder en terug", soort: "kalenderdag", bolletjes: 4, inst: { maxSchuif: 6 } },
  { groep: "Tijd · Kalender · Rekenen met de kalender", titel: "Hoe lang nog?", soort: "kalendernachtjes", bolletjes: 4, inst: { minNachten: 2, maxNachten: 14 } },
  { groep: "Tijd · Kalender · Rekenen met de kalender", titel: "Over de maandgrens", soort: "kalenderdatum", bolletjes: 5, inst: { stand: "maandgrens" } },
];

// ---------------------------------------------------------------------------
// De controle
// ---------------------------------------------------------------------------

const fouten = [];
/** Oefeningen waar minder dan vijftien verschillende opgaven bestaan. */
const weinig = [];
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

  /*
    1. Een ronde telt vijftien opgaven, met zoveel verschillende als er bestaan.

    De generator levert alleen verschillende opgaven; aanvullen tot vijftien
    doet de opslag met `vulAanMetDubbele`. Hier wordt allebei nagekeken: komen
    er zoveel verschillende uit als er zouden moeten, en staan er daarna echt
    vijftien?
  */
  const ronde = generator.maak(inst, PER_RONDE, new Set(), 4711, 4);
  const hoogstens = generator.maximum(inst);
  const verwacht = hoogstens === null ? PER_RONDE : Math.min(PER_RONDE, hoogstens);
  if (ronde.length < verwacht) {
    fouten.push(
      `${waar}: er komen ${ronde.length} verschillende opgaven uit terwijl er ${verwacht} mogelijk zijn.`,
    );
    continue;
  }
  const handtekeningen = new Set(ronde.map((v) => v.handtekening));
  if (handtekeningen.size !== ronde.length) {
    fouten.push(`${waar}: er zitten dubbele opgaven in één ronde.`);
  }
  if (vulAanMetDubbele(ronde, ronde, PER_RONDE).length !== PER_RONDE) {
    fouten.push(`${waar}: een ronde komt niet op ${PER_RONDE} opgaven uit.`);
  }
  /*
    Afspraak met de eigenaar: elke ronde telt vijftien verschillende opgaven.
    Aanvullen met dubbele kan de opslag nog, maar een oefening die er minder
    heeft, komt hier niet meer door.
  */
  if (ronde.length < PER_RONDE) {
    weinig.push(`${waar}: ${ronde.length} verschillende opgaven, aangevuld tot ${PER_RONDE}.`);
    fouten.push(`${waar}: maar ${ronde.length} verschillende opgaven; dat moeten er ${PER_RONDE} zijn.`);
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

    /*
      4. Het antwoord past op de vakjes die het scherm tekent.

      Bij Tijd kan het scherm het antwoord helemaal zelf uitrekenen uit de
      tekening, dus wordt daar niet alleen het aantal vakjes vergeleken maar het
      hele antwoord. Loopt dat uit de pas, dan ziet een kind een goed antwoord
      rood worden — precies de fout die je anders pas in de praktijk merkt.
    */
    if (isTijdfiguur(vraag.figuur)) {
      const vanHetScherm = tijdAntwoord(vraag.figuur);
      if (vanHetScherm !== vraag.antwoord) {
        fouten.push(
          `${waar}: de generator zegt "${vraag.antwoord}" en het scherm zegt "${vanHetScherm}".`,
        );
      }
    }

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

if (weinig.length > 0) {
  console.log(
    `\nMinder dan ${PER_RONDE} verschillende opgaven mogelijk (${weinig.length}); de ronde wordt aangevuld met dubbele:`,
  );
  for (const w of weinig) console.log("  · " + w);
}

if (fouten.length > 0) {
  console.error(`\nEEN OEFENING GEEFT NIET WAT WERKPLAN.MD BELOOFT (${fouten.length}):`);
  for (const f of new Set(fouten)) console.error("  ✗ " + f);
  process.exit(1);
}
