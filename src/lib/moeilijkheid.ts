/**
 * Hoe moeilijk een oefening is, berekend uit de instellingen van het sjabloon.
 *
 * ---------------------------------------------------------------------------
 * Waarom dit er is
 * ---------------------------------------------------------------------------
 * De moeilijkheid werd met de hand per leerdoel ingevuld. Dat is werk dat je
 * bij elke nieuwe oefening opnieuw moet doen, en twee oefeningen met dezelfde
 * instellingen kregen zo makkelijk verschillende bolletjes. Alles wat de
 * moeilijkheid bepaalt staat al in het sjabloon: het bereik, de sprong, de
 * stand, hoeveel er ingevuld moet worden, of het kind zelf typt of kiest. Dus
 * volgt de moeilijkheid daar nu uit.
 *
 * Met de hand instellen blijft gewoon kunnen: staat er bij een leerdoel een
 * eigen getal, dan gaat dat voor. Leeg betekent vanaf nu "automatisch", niet
 * meer "geen bolletjes".
 *
 * ---------------------------------------------------------------------------
 * Hoe het rekent
 * ---------------------------------------------------------------------------
 * Punten optellen, en die punten omzetten naar bolletjes. Elke verzwaring is
 * een punt of twee; een hulpje haalt er een af. De basis is voor elk type
 * hetzelfde — het grootste getal waar de oefening mee werkt — zodat een
 * bolletje overal in de app ongeveer hetzelfde betekent.
 *
 * De uitkomst hangt alleen van de instellingen af. Dezelfde instellingen geven
 * dus altijd dezelfde bolletjes, en het kan nooit onder 1 of boven 5 uitkomen.
 */

import { getal, lijst, tekst, vinkje, type Instellingen } from "@/lib/generatoren/soort";

/**
 * De basis: hoe groot de getallen zijn.
 *
 * Dit is bij elk type hetzelfde, want het is de belangrijkste reden waarom een
 * oefening moeilijker wordt: tellen tot 20 is iets anders dan tellen tot 100.
 */
export function bereikpunten(tot: number): number {
  if (tot <= 10) return 0;
  if (tot <= 20) return 1;
  if (tot <= 50) return 2;
  if (tot <= 100) return 3;
  return 4;
}

/** Van punten naar bolletjes. Nooit minder dan 1 en nooit meer dan 5. */
export function bolletjesVan(punten: number): number {
  if (punten <= 1) return 1;
  if (punten <= 3) return 2;
  if (punten <= 5) return 3;
  if (punten <= 7) return 4;
  return 5;
}

/** Kiest een getal bij een keuze uit een lijstje, of 0 als de keuze niet past. */
function bij(waarde: string, tabel: Record<string, number>): number {
  return tabel[waarde] ?? 0;
}

/**
 * Zelf het getal typen in plaats van kiezen uit vier antwoorden.
 *
 * Dat is het grootste verschil dat een instelling kan maken: bij meerkeuze
 * staat het goede antwoord op het scherm en kan een kind erheen redeneren,
 * bij zelf typen moet het er zonder hulp uit komen. Daarom twee punten, bij
 * elk type waar het te kiezen valt.
 */
const ZELF_TYPEN = 2;

/**
 * De punten van één oefening.
 *
 * Elk type heeft zijn eigen verzwaringen; de basis uit het bereik telt overal
 * mee. Kent een type hier geen eigen regel — de bosspellen bijvoorbeeld, die
 * alleen een bereik hebben — dan blijft het bij die basis.
 */
export function puntenVan(soort: string, inst: Instellingen): number {
  /*
    De bioscoop heeft geen bereik maar stoelen, en bij het koppelen van
    minsommen is `tot` de grootste uitkomst terwijl de sommen zelf verder
    gaan; daar telt het grootste getal in een som. De rest rekent met `tot`.
  */
  const tot =
    soort === "bioscoop"
      ? getal(inst, "stoelen", 20)
      : soort === "minkoppelen"
        ? getal(inst, "grootste", 15)
        : getal(inst, "tot", 20);
  let p = bereikpunten(tot);

  switch (soort) {
    case "getallenlijn": {
      const stand = tekst(inst, "stand", "schuiven");
      p += bij(stand, { schuiven: 0, invullen: 1, tussen: 1, schatten: 2 });
      p += bij(tekst(inst, "zichtbaar", "alle"), {
        alle: 0,
        vijftallen: 1,
        tientallen: 2,
        uiteinden: 3,
      });
      /* Schatten met een smalle marge vraagt veel nauwkeuriger plaatsen. */
      if (stand === "schatten" && getal(inst, "marge", 5) <= 3) p += 1;
      /* In de tussenstand zonder de andere getallen moet het kind zelf tellen. */
      if (stand === "tussen" && !vinkje(inst, "buurgetallen", true)) p += 1;
      break;
    }

    case "stapstenen": {
      p += bij(tekst(inst, "sprong", "1"), { "1": 0, "10": 0, "5": 1, "2": 1 });
      p += bij(tekst(inst, "leeg", "1"), { "1": 0, "2": 1, "3": 2 });
      p += bij(tekst(inst, "plek", "achteraan"), {
        achteraan: 0,
        vooraan: 1,
        tussenin: 1,
        omenom: 1,
        willekeurig: 2,
      });
      /* Terugtellen is een stap moeilijker dan vooruit. */
      if (tekst(inst, "richting", "vooruit") === "terug") p += 1;
      break;
    }

    case "blokken":
      if (tekst(inst, "vraagvorm", "meerkeuze") === "open") p += ZELF_TYPEN;
      if (tekst(inst, "stand", "tellen") === "vosbouwt") p += 1;
      /* Alleen ronde tientallen: dan hoeven de losse blokjes niet geteld. */
      if (vinkje(inst, "rondeTientallen")) p -= 1;
      break;

    case "plaatjestellen":
      if (tekst(inst, "vraagvorm", "meerkeuze") === "open") p += ZELF_TYPEN;
      if (tekst(inst, "opstelling", "rijen") === "verspreid") p += 1;
      /* Zonder ruimte tussen de groepjes van vijf valt er niets te groeperen. */
      if (!vinkje(inst, "groepsruimte")) p += 1;
      if (getal(inst, "perRij", 5) > 5) p += 1;
      break;

    case "straat":
      if (tekst(inst, "sprong", "1") !== "1") p += 1;
      if (tekst(inst, "richting", "erna") !== "erna") p += 1;
      if (tekst(inst, "vraagvorm", "meerkeuze") === "open") p += ZELF_TYPEN;
      if (tekst(inst, "straatsoort", "gewoon") === "evenoneven") p += 1;
      break;

    case "vissen": {
      const vissen = getal(inst, "aantalVissen", 3);
      p += vissen <= 3 ? 0 : vissen <= 5 ? 1 : 2;
      if (tekst(inst, "zoek", "grootste") === "beide") p += 1;
      break;
    }

    case "trein": {
      const wagons = getal(inst, "aantalWagons", 4);
      p += wagons <= 4 ? 0 : wagons <= 6 ? 1 : 2;
      if (tekst(inst, "richting", "oplopend") !== "oplopend") p += 1;
      break;
    }

    case "kralen":
      if (getal(inst, "perGroep", 5) !== 5) p += 1;
      if (vinkje(inst, "alleenRond")) p -= 1;
      break;

    case "bus":
      if (tekst(inst, "animatie", "instappen") === "wegrijden") p += 1;
      if (vinkje(inst, "alleenVol")) p -= 1;
      break;

    case "tellenslepen":
      if (getal(inst, "hoeveel", 2) > 2) p += 1;
      if (vinkje(inst, "afleiders")) p += 1;
      break;

    case "bioscoop":
      p += bij(tekst(inst, "nummers", "vijftallen"), {
        vijftallen: 0,
        tientallen: 1,
        "alleen-eerste": 2,
      });
      break;

    case "tafels": {
      /* De moeilijkste tafel die is aangevinkt bepaalt het. */
      const tafels = lijst(inst, "tafels", ["1"]).map(Number);
      const zwaarste = Math.max(
        0,
        ...tafels.map((t) => ([1, 2, 5, 10].includes(t) ? 0 : [3, 4, 6].includes(t) ? 1 : 2)),
      );
      p = zwaarste;
      if (vinkje(inst, "omgekeerd")) p += 1;
      if (vinkje(inst, "delen")) p += 1;
      if (tekst(inst, "antwoordvorm", "open") === "open") p += ZELF_TYPEN;
      break;
    }

    case "optellen":
    case "aftrekken": {
      p = bereikpunten(getal(inst, "bereik", 20));
      p += bij(tekst(inst, "tiental", "beide"), { niet: 0, beide: 1, wel: 2 });
      if (vinkje(inst, "drie")) p += 1;
      if (vinkje(inst, "negatief")) p += 1;
      if (tekst(inst, "antwoordvorm", "open") === "open") p += ZELF_TYPEN;
      break;
    }

    case "splitsen":
      if (tekst(inst, "leeg", "wissel") === "wissel") p += 1;
      if (tekst(inst, "antwoordvorm", "open") === "open") p += ZELF_TYPEN;
      break;

    /*
      De opdrachten van het domein Splitsen.

      Bij deze vijf typt of sleept het kind altijd zelf; er is geen meerkeuze
      om uit te kiezen, dus er tellen ook geen punten voor "zelf typen". Wat de
      opdrachtvorm zelf vraagt telt wél mee, en dat verschilt flink: bij de
      tabel doet het kind drie keer dezelfde stap, bij de driehoek hangt elk
      vakje af van twee andere. Het uiterlijk (eenvoudig of speels) verandert
      niets aan de som en telt dus niet mee.
    */
    case "splitstabel": {
      /* Het grootste getal dat bovenaan kan staan bepaalt het bereik. */
      const laagste = getal(inst, "doel", 20);
      const hoogste = Math.max(laagste, getal(inst, "doelTot", laagste));
      p = bereikpunten(hoogste);
      /*
        Wisselt het getal bovenaan per vraag, dan telt dat een punt extra: het
        kind kan dan niet op één vast getal leunen en moet elke vraag opnieuw
        kijken waar het naartoe rekent.
      */
      if (hoogste > laagste) p += 1;
      break;
    }

    case "aanvullen":
      p = bereikpunten(getal(inst, "doel", 20)) + 1;
      break;

    case "splitsschema":
      p += 2;
      break;

    case "verdelen":
      p += 3;
      break;

    case "splitsdriehoek":
      p += 5;
      break;

    /*
      De opdrachten van het domein Optellen.

      Ook hier typt of sleept het kind altijd zelf, dus er tellen geen punten
      voor "zelf typen". Wat de opdrachtvorm vraagt verschilt sterk: plaatjes
      tellen en optellen is de eerste stap, terwijl beide kanten gelijk maken
      vraagt dat een kind twee sommen tegelijk overziet.
    */
    case "plaatjessom":
      break;

    case "plussom":
      p += 2;
      break;

    case "somkeuze":
    case "aanvultabel":
    case "evenveelsom":
    case "koppelsommen":
      p += 3;
      break;

    case "viatien":
    case "tweegetallen":
      p += 5;
      break;

    case "balans":
      p += 6;
      /* Wisselt het lege vakje van kant, dan moet het kind eerst kijken waar. */
      if (tekst(inst, "leeg", "links") === "wissel") p += 1;
      break;

    /*
      De opdrachten van het domein Erafsommen.

      Dezelfde opbouw als bij Optellen: eerst zien en doen, dan rekenen. Het
      wegstrepen is de eerste stap en krijgt er niets bij; de kale som en het
      koppelen vragen dat een kind het zonder beeld af kan.
    */
    case "wegstrepen":
    case "minsomplaatje":
      break;

    /*
      Met of zonder de getallen erbij telt even zwaar: zonder getallen moet een
      kind zelf tellen, met getallen moet het de stap van plaatje naar getal
      maken. Dat houdt ze in de lijst op hun eigen volgorde staan, eerst het
      tellen en daarna de getallen.
    */
    case "plaatjesminsom":
      p += 1;
      break;

    case "minsom":
      p += 3;
      break;

    case "minkoppelen":
      p += 5;
      break;

    /*
      De opdrachten met het rekenrek. Het flitsen is kijken en tellen; daarna
      loopt het op met wat een som vraagt: vanaf tien is één stap, binnen het
      tiental reken je met de eenheden, over de tien gaat in twee stappen, en
      zonder rek erbij moet dat allemaal uit het hoofd.
    */
    case "rekenrekflits":
      break;

    case "rekenrekaf":
      p += bij(tekst(inst, "stand", "via10"), { vanaf10: 0, klein: 1, via10: 3 });
      break;

    case "rekenrekhoofd":
      p += 5;
      break;

    case "vakken":
      p += bij(tekst(inst, "zoek", "precies"), { precies: 0, meer: 1, minder: 1, beide: 2 });
      break;

    default:
      /* De bosspellen en alles wat verder alleen een bereik heeft. */
      break;
  }

  return Math.max(0, p);
}

/**
 * De volgorde waarin de generator-types in een lijst komen te staan.
 *
 * Dit volgt de leerlijn van school: eerst tellen, dan tellen met sprongen, dan
 * buurgetallen, dan vergelijken en ordenen, en als laatste de getallenlijn.
 * Een vaste volgorde en geen berekende, zodat een nieuwe oefening nooit een
 * hele groep verspringt.
 *
 * Een type dat hier niet in staat komt erachter, op naam. Zo hoeft deze lijst
 * niet meteen te worden bijgewerkt als er een type bij komt.
 */
export const TYPEVOLGORDE = [
  "kralen",
  "bus",
  "tellenslepen",
  "plaatjestellen",
  "blokken",
  "bioscoop",
  "stapstenen",
  "straat",
  "vissen",
  "trein",
  "getallenlijn",
  /* Het domein Splitsen, in de volgorde waarin een kind ze leert. */
  "splitstabel",
  "aanvullen",
  "splitsschema",
  "verdelen",
  "splitsdriehoek",
  /* Het domein Optellen, in de volgorde waarin een kind ze leert. */
  "plaatjessom",
  "plussom",
  "somkeuze",
  "aanvultabel",
  "evenveelsom",
  "koppelsommen",
  "viatien",
  "tweegetallen",
  "balans",
  /* Het domein Erafsommen, in de volgorde waarin een kind ze leert. */
  "wegstrepen",
  "minsomplaatje",
  "plaatjesminsom",
  "minsom",
  "minkoppelen",
  /* Het onderwerp met het rekenrek, in de volgorde waarin een kind ze leert. */
  "rekenrekflits",
  "rekenrekaf",
  "rekenrekhoofd",
] as const;

/** Het plaatsnummer van een type; types zonder eigen plek komen erachter. */
export function typeVolgorde(soort: string): number {
  const plek = (TYPEVOLGORDE as readonly string[]).indexOf(soort);
  return plek === -1 ? TYPEVOLGORDE.length : plek;
}

/** De berekende moeilijkheid van één oefening: 1 tot en met 5 bolletjes. */
export function moeilijkheidVan(soort: string, inst: Instellingen): number {
  return bolletjesVan(puntenVan(soort, inst));
}
