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
 * Hoe moeilijk één deeltafel is.
 *
 * Niet het getal zelf maar hoe makkelijk de tafel te onthouden is. Delen door 1
 * en 10 is bijna geen rekenen, door 2 nauwelijks, door 5 gaat op het ritme van
 * de vijfsprong, en 7 en 9 zijn de twee waar kinderen het langst over doen.
 * Deze volgorde is dezelfde als die in WERKPLAN.md: 1, 2, 10, 5, 3, 4, 6, 8, 7,
 * 9.
 */
const DEELTAFELPUNTEN: Record<number, number> = {
  1: 0, 2: 0, 10: 0, 5: 1, 3: 3, 4: 3, 6: 5, 8: 5, 7: 7, 9: 7,
};

/**
 * Het gemiddelde van de aangevinkte deeltafels, afgerond.
 *
 * Het gemiddelde en niet de zwaarste: "Delen door 9" is iets anders dan
 * "deelsommen door elkaar waar ook een negen tussen zit". Bij één aangevinkte
 * tafel komt er gewoon de waarde van die tafel uit.
 */
function deeltafelpunten(inst: Instellingen): number {
  const gekozen = lijst(inst, "delers", ["1", "2", "5", "10"])
    .map(Number)
    .filter((n) => n in DEELTAFELPUNTEN);
  if (gekozen.length === 0) return 0;
  const som = gekozen.reduce((n, t) => n + DEELTAFELPUNTEN[t], 0);
  return Math.round(som / gekozen.length);
}

/** Punten per klokniveau: 1 bolletje = 0, 2 = 2, 3 = 4, 4 = 6, 5 = 8 punten. */
const NIVEAUPUNTEN = [0, 0, 2, 4, 6, 8];

/**
 * Het niveau van een klok met het dagdeel erbij: alleen tijden tot 12:00 is
 * een stap lichter (●●●○○) dan na 12:00 of de hele dag (●●●●○), want daar
 * komt de 24-uursnotatie pas echt bij.
 */
function dagdeelniveau(inst: Instellingen): number {
  return tekst(inst, "dagbereik", "heledag") === "voor12" ? 3 : 4;
}

/** Het niveau van elke minutengroep op de klok. */
const KLOKNIVEAU: Record<string, number> = { heel: 1, half: 2, kwartier: 3, vijf: 4, minuut: 5 };

/** Het zwaarste klokniveau van de aangevinkte minutengroepen. */
function klokniveau(inst: Instellingen, terugval: string[]): number {
  const gekozen = lijst(inst, "tijden", terugval).filter((g) => g in KLOKNIVEAU);
  return Math.max(...(gekozen.length ? gekozen : terugval).map((g) => KLOKNIVEAU[g] ?? 1));
}

/**
 * Hoe zwaar een stel tafels weegt bij de keersommen.
 *
 * Twee dingen tellen mee, en dat moet ook: "Tafels van 1 tot en met 5" is iets
 * anders dan "Tafels van 6 tot en met 10", en die twee zijn allebei iets anders
 * dan alle tien door elkaar. Het hoogste getal zegt hoe moeilijk de zwaarste
 * tafel is; het aantal zegt hoeveel een kind tegelijk moet kunnen omschakelen.
 */
function keertafelpunten(inst: Instellingen, terugval: string[]): number {
  const gekozen = lijst(inst, "tafels", terugval)
    .map(Number)
    .filter((n) => n >= 1 && n <= 20);
  if (gekozen.length === 0) return 0;

  const hoogste = Math.max(...gekozen);
  const zwaarte = hoogste <= 5 ? 0 : hoogste <= 10 ? 2 : hoogste <= 15 ? 6 : 8;
  /* Meer dan vijf tafels door elkaar vraagt het omschakelen erbij. */
  return zwaarte + (gekozen.length > 5 ? 2 : 0);
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

    /*
      ---------------------------------------------------------------------------
      Het domein Delen
      ---------------------------------------------------------------------------
      Bij de kale deelsom bepaalt de deeltafel zelf bijna alles: delen door 1 is
      een ander soort oefening dan delen door 9. Bij het koppelen en bij zelf een
      deelsom bedenken telt die tafel juist niet mee — daar is de handeling de
      moeilijkheid, en die is bij elke tafel hetzelfde.
    */
    case "deelsom":
      p += deeltafelpunten(inst);
      break;

    case "deelkoppelen":
      p += 5;
      break;

    case "welkedeelsom":
      p += 7;
      break;

    /*
      ---------------------------------------------------------------------------
      Het domein Tafels
      ---------------------------------------------------------------------------
      Deze types rekenen niet met een bereik maar met tafels, dus wordt de basis
      hier overschreven in plaats van opgeteld. Zou het bereik meetellen, dan
      zouden "Tafels van 1 tot en met 5" en "Tafels van 6 tot en met 10" op
      hetzelfde getal uitkomen, want hun getallen zitten in hetzelfde bereik —
      terwijl het juist de tafels zijn die het verschil maken.
    */
    case "keersom":
      p = keertafelpunten(inst, ["1", "2", "3", "4", "5"]);
      break;

    case "keerkoppelen":
      /* Vijf sommen door elkaar; meer tafels is meer omschakelen. */
      p = lijst(inst, "tafels", ["1", "2", "5", "10"]).length > 5 ? 4 : 2;
      break;

    case "welkekeersom":
      p = 4;
      break;

    /* Eerst begrijpen: zien, dan de som opschrijven, dan handig rekenen. */
    case "keerraster":
      p = 1;
      break;

    case "keerplaatjes":
      p = 2;
      break;

    case "handigkeer":
      p = 4;
      break;

    case "keernullen":
      p = 6;
      break;

    /* De twee kanten van dezelfde som; allebei een stap na de tafels zelf. */
    case "keerdeelkoppelen":
    case "keerdeelsamen":
      p = 4;
      break;

    /* Op de markt: eerst wat het samen kost, daarna ook het wisselgeld. */
    case "marktkraam":
      p = vinkje(inst, "wisselgeld") ? 2 : 0;
      break;

    /*
      ---------------------------------------------------------------------------
      Het domein Tijd
      ---------------------------------------------------------------------------
      Deze types rekenen niet met een bereik maar met de klok, de dagen of de
      kalender, dus wordt de basis hier overschreven in plaats van opgeteld.
      Bij de klok bepaalt de zwaarste minutengroep bijna alles: hele uren
      aflezen is een andere oefening dan vijf voor en tien over.
    */
    /*
      De klok volgt de leerlijn van school, één niveau per bolletje:

        1  hele uren; digitaal alleen 01:00 tot en met 12:00
        2  halve uren (en hele uren); digitaal tot en met 12:59
        3  kwartier over en kwartier voor
        4  per vijf minuten; dagdelen; 24-uurstijden met het dagdeel erbij
        5  op de minuut; 24-uurstijden zonder hulp

      Het niveau is het zwaarste dat in de oefening voorkomt. Zie `klokniveau`.
    */
    case "urenminuten":
      p = NIVEAUPUNTEN[
        Math.max(...lijst(inst, "soorten", ["uren", "half", "helft"]).map((s) => (s === "uren" ? 1 : 2)))
      ];
      break;

    case "dagdeel":
    case "digitaaldagdeel":
      p = NIVEAUPUNTEN[4];
      break;

    case "wijzeraanwijzen":
    case "klokklopt":
    case "klokkoppelen":
    case "klokkenvolgorde":
      p = NIVEAUPUNTEN[klokniveau(inst, ["heel", "half"])];
      break;

    case "klokaflezen":
      p = NIVEAUPUNTEN[
        Math.max(
          klokniveau(inst, ["heel"]),
          tekst(inst, "antwoordsoort", "woorden") === "digitaal" && vinkje(inst, "metDagdeel") ? dagdeelniveau(inst) : 0,
        )
      ];
      break;

    case "klokkiezen":
      p = NIVEAUPUNTEN[
        Math.max(
          klokniveau(inst, ["heel", "half"]),
          tekst(inst, "vraag", "woorden") === "verschuiving" && vinkje(inst, "halveUren") ? 2 : 0,
        )
      ];
      break;

    case "klokzetten":
      p = NIVEAUPUNTEN[
        Math.max(
          klokniveau(inst, ["heel"]),
          tekst(inst, "opdracht", "tijd") === "verschuiving" && vinkje(inst, "halveUren") ? 2 : 0,
        )
      ];
      break;

    case "kloktypen":
      p = NIVEAUPUNTEN[Math.max(klokniveau(inst, ["heel", "half"]), vinkje(inst, "metDagdeel", true) ? dagdeelniveau(inst) : 0)];
      break;

    case "klokduur":
      /* Over 12 uur heen gaat met 's ochtends en 's middags: dagdelen, niveau 4. */
      p = NIVEAUPUNTEN[
        Math.max(
          bij(tekst(inst, "stap", "heel"), { heel: 1, half: 2, kwartier: 3, gemengd: 3 }) || 1,
          vinkje(inst, "over12") ? 4 : 0,
        )
      ];
      break;

    case "klokvlek":
      p = NIVEAUPUNTEN[klokniveau(inst, ["heel"])];
      break;

    case "digitaaldelen":
      p = NIVEAUPUNTEN[vinkje(inst, "uren24") ? 5 : klokniveau(inst, ["heel", "half"])];
      break;

    case "digitaalaflezen":
      p = NIVEAUPUNTEN[vinkje(inst, "uren24") ? 5 : klokniveau(inst, ["heel"])];
      break;

    case "digitaalverschil":
      p = NIVEAUPUNTEN[
        vinkje(inst, "uren24")
          ? 5
          : bij(tekst(inst, "stand", "heleUren"), {
              heleUren: 1,
              halveUren: 2,
              andereMinuten: 3,
              kwartieren: 3,
              overHeelUur: 4,
            }) || 1
      ];
      break;

    /* De dagen, de maanden en de kalender. */
    case "dagvraag":
      p = tekst(inst, "stand", "volgorde") === "ervoorerna" ? 4 : 1;
      break;

    case "dagenaanvullen":
      p = 1;
      break;

    case "maandvraag":
      p = bij(tekst(inst, "stand", "erna"), {
        erna: 0,
        volgorde: 2,
        nummer: 2,
        ervoorerna: 6,
        jaargrens: 8,
      });
      break;

    case "maandenaanvullen":
      p = 4;
      break;

    case "kalenderdag":
      p = getal(inst, "maxSchuif", 0) >= 2 ? 6 : 1;
      break;

    case "kalenderzoek":
    case "kalenderaantal":
      p = 2;
      break;

    case "kalenderdatum":
      p = bij(tekst(inst, "stand", "dag"), {
        dag: 2,
        tweedagen: 4,
        week: 4,
        maandgrens: 8,
      });
      break;

    case "kalendernachtjes":
      p = 6;
      break;

    /*
      ---------------------------------------------------------------------------
      Het domein Geld
      ---------------------------------------------------------------------------
      Ook hier geen bereik als basis: wat het moeilijk maakt is wát er gevraagd
      wordt. Herkennen en tellen eerst, dan betalen, dan rekenen met wisselgeld,
      en schatten als laatste. De punten volgen de bolletjes uit WERKPLAN.md.
    */
    case "geldwaarde":
      /* Munten en briefjes door elkaar, met de valkuil van de grote munt. */
      p = tekst(inst, "geld", "munten") === "gemengd" ? 2 : 0;
      break;

    case "geldvolgorde":
      p = 6;
      break;

    case "geldtellen":
      p = 2;
      break;

    case "geldleggen": {
      /*
        Zelf precies betalen met alles door elkaar is het zwaarst. Daarna
        bepaalt de voorraad het: alleen munten van 2 euro is tellen in sprongen
        van twee, centen zijn een eigen stap, en kiezen tussen 1 en 2 euro
        vraagt meer dan alleen munten van 1 euro neerleggen.
      */
      const voorraad = lijst(inst, "voorraad", ["100"]);
      if (vinkje(inst, "metPrijs")) p = 6;
      else if (voorraad.length === 1 && voorraad[0] === "200") p = 0;
      else if (voorraad.every((v) => Number(v) < 100)) p = 2;
      else if (voorraad.length === 1 && voorraad[0] === "100") p = 4;
      else p = 6;
      break;
    }

    case "muntenofeuros":
      p = 4;
      break;

    case "geldgroepen": {
      const stand = tekst(inst, "stand", "grootste");
      p =
        stand === "wisselen"
          ? bij(tekst(inst, "wissel", "briefje"), { briefje: 0, euromunt: 2, centen: 2, gemengd: 4 })
          : stand === "grootste"
          ? 6
          : stand === "wisselgeld"
            ? 2
            : tekst(inst, "geld", "briefjes") === "gemengd"
              ? 4
              : 2;
      break;
    }

    case "welkegroepjes":
      p = 4;
      break;

    case "geldnotatie": {
      /* Kiezen, dan tellen en opschrijven, dan van woorden naar cijfers; hele euro's tot 100 is een stap verder. */
      const stand = tekst(inst, "stand", "schrijfwijze");
      const heel = vinkje(inst, "heel", true);
      p =
        stand === "schrijfwijze"
          ? heel ? 0 : 2
          : stand === "tellen"
            ? heel ? 4 : 2
            : heel ? 6 : 4;
      break;
    }

    case "evenveel":
      p = 8;
      break;

    case "geldontbreekt":
      p = tekst(inst, "antwoord", "kiezen") === "typen" ? 6 : 4;
      break;

    case "geldsom":
      p = bij(tekst(inst, "stand", "tweemunten"), { tweegroepjes: 2, komma: 6 });
      break;

    case "geldverhaal":
      p = bij(tekst(inst, "stand", "wisselgeld"), { wisselgeld: 2, over: 4, prijs: 6 });
      break;

    case "kunjebetalen":
      p = 8;
      break;

    case "bonnetje":
      p = 4;
      break;

    case "geldafronden":
      p = tekst(inst, "antwoord", "kiezen") === "typen" ? 2 : 0;
      break;

    case "geldschatten":
      p =
        tekst(inst, "stand", "samenstap") === "over" && tekst(inst, "antwoord", "typen") === "typen"
          ? 8
          : 6;
      break;

    case "geldkorting":
      p = tekst(inst, "stand", "korting") === "prijsna" ? 4 : 2;
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
  /* Het domein Tafels: eerst begrijpen, dan oefenen, dan de link met delen. */
  "keerraster",
  "keerplaatjes",
  "handigkeer",
  "keernullen",
  "keersom",
  "keerkoppelen",
  "welkekeersom",
  "keerdeelkoppelen",
  "keerdeelsamen",
  "marktkraam",
  /* Het domein Delen, in de volgorde waarin een kind ze leert. */
  "deelsom",
  "deelkoppelen",
  "welkedeelsom",
  /* Het domein Tijd: eerst de uren en de dagdelen, dan de klok. */
  "urenminuten",
  "dagdeel",
  "wijzeraanwijzen",
  "klokaflezen",
  "klokklopt",
  "klokkiezen",
  "klokzetten",
  "klokkoppelen",
  "klokkenvolgorde",
  "kloktypen",
  "klokduur",
  "klokvlek",
  "digitaaldelen",
  "digitaaldagdeel",
  "digitaalaflezen",
  "digitaalverschil",
  /* En de dagen, de maanden en de kalender. */
  "dagvraag",
  "dagenaanvullen",
  "maandvraag",
  "maandenaanvullen",
  "kalenderdag",
  "kalenderzoek",
  "kalenderaantal",
  "kalenderdatum",
  "kalendernachtjes",
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
