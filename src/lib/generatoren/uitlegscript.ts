/**
 * De vaste bouwvorm van een uitleg-animatie.
 *
 * Een uitlegscript is een lijstje stappen. Elke stap zegt: wat staat er in
 * beeld, wat licht er op, welke zin zegt Vos, en of het kind zelf iets moet
 * doen. De uitlegspeler kan elk script afspelen — met voorlezen, geluid en
 * tempo — zonder iets te weten over het soort som.
 *
 * Een generator-type levert dus alleen het script. Daardoor zien alle
 * uitleggen er hetzelfde uit en werkt een nieuw type meteen mee.
 *
 * De scripts zijn bewust gewone gegevens (geen code die tekent). Zo kunnen ze
 * later ook in het ouderdashboard worden getoond: een animatie werkt in elke
 * taal.
 */

import type { Somgegevens } from "@/lib/generatoren/foutpatroon";

/**
 * Welke vorm van uitleg. Eén per losse groep, niet per blok.
 *
 * Hier stonden eerder drie gekoppelde vormen ("34", "56", "78"). Elke groep is
 * nu apart in te stellen, zodat groep 3 een andere uitleg kan krijgen dan groep
 * 4 zonder dat je ze allebei moet omgooien.
 */
export type Groepsvorm = "3" | "4" | "5" | "6" | "7" | "8";

export const GROEPSVORMEN: Groepsvorm[] = ["3", "4", "5", "6", "7", "8"];

/**
 * De drie manieren waarop uitleg wordt opgebouwd.
 *
 * Dit is iets anders dan de groep: het zegt HOE de uitleg eruitziet, niet voor
 * wie. Meerdere groepen mogen dezelfde manier gebruiken — en dat doen ze nu ook,
 * want de bestaande animaties zijn per blok gemaakt.
 */
export type Uitlegmanier = "34" | "56" | "78";

/**
 * Welke manier hoort bij welke groep.
 *
 * Dit is de brug tussen de zes losse groepen en de animaties die er al zijn.
 * Groep 3 en 4 krijgen dus exact dezelfde uitleg als voorheen; alleen kun je ze
 * nu los aanspreken. Wil je later groep 3 een eigen animatie geven, dan verander
 * je hier één regel en schrijf je in het script een tak voor "3".
 */
export const MANIER_VAN_VORM: Record<Groepsvorm, Uitlegmanier> = {
  "3": "34",
  "4": "34",
  "5": "56",
  "6": "56",
  "7": "78",
  "8": "78",
};

const MANIER_OMSCHRIJVING: Record<Uitlegmanier, string> = {
  "34": "animatie met blokjes",
  "56": "animatie met getallen en schema's",
  "78": "compacte stappenlijst",
};

export const VORM_OMSCHRIJVING: Record<Groepsvorm, string> = Object.fromEntries(
  GROEPSVORMEN.map((v) => [v, `Groep ${v} — ${MANIER_OMSCHRIJVING[MANIER_VAN_VORM[v]]}`]),
) as Record<Groepsvorm, string>;

/**
 * De vorm die bij een groep hoort.
 *
 * Buiten 3 tot en met 8 wordt er afgekapt: een kind uit groep 2 krijgt de uitleg
 * van groep 3, een kind uit groep 9 die van groep 8. Zo komt er nooit een lege
 * vorm uit.
 */
export function vormBijGroep(groep: number): Groepsvorm {
  const begrensd = Math.min(8, Math.max(3, Math.round(groep)));
  return String(begrensd) as Groepsvorm;
}

/**
 * Een opgeslagen uitlegvorm omzetten naar een losse groep.
 *
 * Sjablonen en leerdoelen van vóór deze wijziging dragen nog een blokwaarde
 * ("34", "56", "78"). Die wordt gelezen als de eerste groep van dat blok. Dat
 * levert exact dezelfde uitleg op als voorheen, want beide groepen van een blok
 * gebruiken dezelfde manier — er gaat dus niets verloren.
 */
export function leesGroepsvorm(waarde: string | null | undefined): Groepsvorm | null {
  if (!waarde) return null;
  if (GROEPSVORMEN.includes(waarde as Groepsvorm)) return waarde as Groepsvorm;
  if (waarde === "34") return "3";
  if (waarde === "56") return "5";
  if (waarde === "78") return "7";
  return null;
}

// ---------------------------------------------------------------------------
// De visuele modellen die scholen gebruiken
// ---------------------------------------------------------------------------

/**
 * Toestand van één blokje. Bewust ook verschillend van vorm en rand, niet
 * alleen van kleur: zo blijft het te volgen voor kinderen die kleuren
 * moeilijk uit elkaar houden.
 */
export type Bloktoestand = "normaal" | "deel" | "weg" | "rest" | "geteld";

export type Model =
  | { soort: "bosspel"; figuur: import("./bosspellen-catalogus").Bosfiguur; opgelicht: number; opgelost: boolean }
  | {
      soort: "blokjes";
      /** Toestand per blokje, in volgorde. */
      blokjes: Bloktoestand[];
      /** Hoeveel blokjes op een rij. 10 geeft een twintigveld-gevoel. */
      perRij: number;
      /** Groot getal boven de blokjes, bijvoorbeeld het antwoord. */
      bijschrift?: string;
    }
  | {
      soort: "splitsboom";
      geheel: number;
      links: number | null;
      rechts: number | null;
      /** Welk vakje oplicht bij deze stap. */
      nadruk?: "geheel" | "links" | "rechts" | null;
    }
  | {
      soort: "kralen";
      totaal: number;
      /** Om de hoeveel kralen de kleur wisselt. */
      perGroep: number;
      /** Tot en met de hoeveelste kraal er al geteld is. */
      opgelicht: number;
      /** De kraal waar de pijl naar wijst; 0 laat de pijl weg. */
      pijlOp: number;
      palet: string;
      bijschrift?: string;
    }
  | {
      soort: "bus";
      plaatsen?: number;
      totaal: number;
      /** Hoeveel kinderen er per raam zitten. */
      perGroep: number;
      /** Hoeveel kinderen er al geteld zijn; die lichten op. */
      opgelicht: number;
      palet: string;
      bijschrift?: string;
    }
  | {
      soort: "telfiguur";
      /**
       * Welk figuur: "bloem", "boom", "lieveheersbeestje" ...
       *
       * Bewust hetzelfde figuur als in de vraag stond. Zou de uitleg losse
       * blokjes laten zien, dan moet een kind zelf bedenken dat die blokjes de
       * stippen op het lieveheersbeestje voorstellen — en juist dat verband is
       * wat hier geoefend wordt.
       */
      telsoort: string;
      /** Hoeveel onderdelen het figuur heeft. */
      aantal: number;
      /** Hoeveel er al geteld zijn; die lichten op. */
      opgelicht: number;
      bijschrift?: string;
    }
  | {
      /** De getallenlijn, met Vos die vanaf een zichtbaar getal doortelt. */
      soort: "getallenlijn";
      start: number;
      eind: number;
      /** Hoeveel één streepje verder is: 1, 5 of 10. */
      stap: number;
      zichtbaar: number[];
      /** Het getal dat gezocht wordt; staat groot boven de lijn. */
      doel: number;
      /** Bij welk streepje Vos nu staat. */
      telTot: number;
      /** Staat het vlaggetje er al? Dan is hij er. */
      vlag: boolean;
      /** Welk getal oplicht, of `null`. */
      nadruk: number | null;
    }
  | {
      soort: "stapstenen";
      /** De rij zoals hij nu in beeld staat; `null` is een steen die nog leeg is. */
      stenen: (number | null)[];
      sprong: number;
      richting: "vooruit" | "terug";
      /**
       * De mascotte. Blijft hier `null`: de bestandsnaam staat bij de vraag en
       * niet in de somgegevens, waar alleen getallen in passen. De speler vult
       * hem aan met het plaatje van de vraag die het kind net zag, zodat het
       * dezelfde vos is.
       */
      mascotte: string | null;
      /** Op welke steen de mascotte staat. */
      vosOp: number;
      /** Boogje van deze steen naar de volgende; `null` = geen boog. */
      boogVan: number | null;
    }
  | {
      /**
       * Dezelfde plaatjes in dezelfde opstelling als in de vraag.
       *
       * Geen blokjes en geen andere weergave: het kind moet de plaatjes
       * herkennen die het net zelf heeft zitten tellen.
       */
      soort: "plaatjesraster";
      aantal: number;
      /** Welk getekend plaatje; de namen staan in `Telplaatjes.tsx`. */
      plaatje: string | null;
      /**
       * Blijft hier `null`. De bestandsnaam staat bij de vraag en niet in de
       * somgegevens, waar alleen getallen in passen; de speler vult hem aan met
       * het plaatje van de vraag die het kind net zag.
       */
      afbeelding: string | null;
      perRij: number;
      groepsruimte: boolean;
      /** Hoeveel plaatjes er al geteld zijn; die krijgen een vinkje. */
      opgelicht: number;
      /** Welke rij in zijn geheel oplicht; `null` = geen rij apart. */
      rijNadruk: number | null;
      bijschrift?: string;
    }
  | {
      /**
       * Dezelfde MAB-blokken in hetzelfde vak als in de vraag.
       *
       * Geen getallenlijn en geen ander materiaal: het kind moet de staven
       * terugzien die het net zelf zat te tellen.
       */
      soort: "mabblokken";
      tientallen: number;
      eenheden: number;
      /** Hoeveel staven er al meegeteld zijn; de rest staat gedimd. */
      stavenOp: number;
      /** En hoeveel losse blokjes. */
      losseOp: number;
      /** Welke staaf nu aan de beurt is en oplicht; `null` = geen. */
      nadruk: number | null;
      bijschrift?: string;
    }
  | {
      /**
       * Dezelfde straat als in de vraag, met Vos ervoor.
       *
       * Geen getallenlijn en geen ander beeld: het kind moet de huisjes
       * terugzien waar het net naar keek.
       */
      soort: "huizenrij";
      huizen: { nummer: number; kant: "boven" | "onder" }[];
      /** Bij welk huis Vos staat. */
      vosBij: number;
      /** Welke huizen hun nummer laten zien. */
      zichtbaar: number[];
      /** Welk huis nu oplicht; `null` = geen. */
      nadruk: number | null;
      bijschrift?: string;
    }
  | {
      /**
       * Dezelfde vissen als in de vraag, maar dan op een rij van klein naar
       * groot. Vergelijken is ordenen: zodra ze op volgorde liggen, zíe je het.
       */
      soort: "visvijver";
      vissen: { getal: number }[];
      /** Welke vis oplicht, geteld in de gesorteerde rij; `null` = geen. */
      nadruk: number | null;
      bijschrift?: string;
    }
  | {
      /**
       * Dezelfde trein als in de vraag, met de wagons die één voor één op hun
       * plek springen. Ordenen is een handeling; die moet je zien gebeuren.
       */
      soort: "trein";
      /** De wagons in de goede volgorde. */
      volgorde: number[];
      /** Hoeveel er al gekoppeld zijn. */
      klaar: number;
      /** Welke wagon nu oplicht; `null` = geen. */
      nadruk: number | null;
      bijschrift?: string;
    }
  | {
      /**
       * Hetzelfde vak als in de vraag, met de inhoud die wordt meegeteld.
       *
       * Welk materiaal en welk plaatje erin zit, staat bij de vraag en niet in
       * de somgegevens — daar passen alleen getallen in. De speler vult het aan
       * met wat het kind net zag.
       */
      soort: "vak";
      aantal: number;
      materiaal: string | null;
      plaatje: string | null;
      /** Hoeveel er al geteld zijn; die staan vol in beeld. */
      geteld: number;
      bijschrift?: string;
    }
  | {
      /**
       * Dezelfde zaal als in de vraag, met de stoelen die één voor één hun
       * nummer laten zien vanaf een bekend nummer.
       */
      soort: "bioscoop";
      aantal: number;
      perRij: number;
      zichtbaar: number[];
      /** Het bekende nummer waar de uitleg begint. */
      vanaf: number;
      /** Tot welke stoel er al is doorgeteld. */
      tot: number;
      bijschrift?: string;
    }
  | {
      soort: "som";
      /** Grote som in cijfers, bijvoorbeeld "19 − 3 = 16". */
      tekst: string;
      /** Deel dat oplicht, als losse tekst. */
      nadruk?: string;
    };

// ---------------------------------------------------------------------------
// Het script
// ---------------------------------------------------------------------------

/**
 * Wat Vos zegt als een type zelf niets opgeeft bij een tikstap.
 *
 * Bewust zonder het woord waarop getikt wordt: dat weet alleen het type. "Tik
 * ze maar aan" klopt daardoor altijd, ook bij een model dat hier nog niet
 * bestaat.
 */
export const STANDAARD_TIKZIN = "Tik ze maar aan!";

/** Houdingen van Vos. De plaatjes heten hetzelfde. */
export type Voshouding = "blij" | "wijzend" | "denkend" | "juichend" | "verrast";

/** Hoe Vos beweegt bij deze stap. */
export type Vosbeweging = "stil" | "praten" | "wijzen" | "juichen";

export type Uitlegstap = {
  /** Wat er in beeld staat. Eén ding tegelijk. */
  model: Model;
  /** Eén korte zin van Vos. Groep 3-4: hoogstens zes woorden. */
  zin: string;
  /**
   * Het kind tikt zelf om mee te tellen.
   *
   * `aantal` is hoe vaak er getikt moet worden voordat de stap af is.
   *
   * `aansporing` zegt WAAROP getikt moet worden, en hoort dus bij het type:
   * "Tik de kralen aan!", "Tik de kinderen aan!", "Tik de blokjes aan!". Vos
   * zegt hem meteen als de stap begint, en herhaalt hem als het kind wacht.
   *
   * Geeft een type niets op, dan geldt `STANDAARD_TIKZIN`. Een nieuw type hoeft
   * er dus niets voor te doen, maar een eigen zin is bijna altijd duidelijker.
   */
  meetellen?: { aantal: number; aansporing?: string };
  /** Klein feestje bij deze stap: hier komt het antwoord. */
  feest?: boolean;
  /** Welke houding Vos aanneemt. Elk type geeft dit zelf mee. */
  houding?: Voshouding;
  /** Hoe Vos beweegt. Standaard: praten terwijl de zin klinkt. */
  beweging?: Vosbeweging;
  /** Waar Vos staat. Zo kan hij af en toe naar de andere kant lopen. */
  kant?: "links" | "rechts";
};

export type Uitlegscript = {
  vorm: Groepsvorm;
  /** Welke aanpak wordt getoond. Nooit twee door elkaar. */
  strategie: string;
  strategieNaam: string;
  stappen: Uitlegstap[];
};

/**
 * Wat een generator-type moet leveren.
 *
 * VASTE REGEL: elk type levert een uitlegscript voor alle drie de
 * groepsvormen. Zolang een vorm nog ontbreekt geeft de functie `null` terug;
 * er wordt dan teruggevallen op de stappenlijst en de beheeromgeving
 * waarschuwt dat het type nog niet af is.
 *
 * Let op het verschil per vorm:
 *   - groep 3-4 en 5-6 worden afgespeeld als animatie, met Vos en met tikken;
 *   - groep 7-8 wordt getoond als leeslijst: alles tegelijk, één regel per
 *     stap. Daar horen geen tik-stappen in, en elke stap gebruikt het model
 *     "som". `controleerUitleg` bewaakt dat.
 */
export type Uitlegbron = {
  /** Welke modellen dit type gebruikt, ter informatie in het beheer. */
  modellen: string[];
  /** De strategieën waaruit je per leerdoel kunt kiezen. */
  strategieen: { waarde: string; label: string; uitleg: string }[];
  standaardStrategie: (vorm: Groepsvorm) => string;
  /** Het script voor één som, in één vorm. Null als die vorm er nog niet is. */
  script: (som: Somgegevens, vorm: Groepsvorm, strategie: string) => Uitlegscript | null;
  /** Een nieuwe, vergelijkbare som om daarna te proberen. */
  vergelijkbaar: (som: Somgegevens) => Somgegevens | null;
};

// ---------------------------------------------------------------------------
// Volledigheid bewaken
// ---------------------------------------------------------------------------

export type Scriptgebrek = { vorm: Groepsvorm; wat: string };

export function controleerUitleg(
  bron: Uitlegbron | undefined,
  proef: Somgegevens,
): Scriptgebrek[] {
  if (!bron) {
    return GROEPSVORMEN.map((vorm) => ({ vorm, wat: "Er is nog geen uitleg-animatie." }));
  }

  const gebreken: Scriptgebrek[] = [];
  for (const vorm of GROEPSVORMEN) {
    const manier = MANIER_VAN_VORM[vorm];
    try {
      const script = bron.script(proef, vorm, bron.standaardStrategie(vorm));
      if (!script) {
        gebreken.push({ vorm, wat: "Deze vorm is nog niet gemaakt." });
      } else if (script.stappen.length === 0) {
        gebreken.push({ vorm, wat: "Het script heeft geen stappen." });
      } else if (manier === "34" && script.stappen.some((s) => s.zin.split(/\s+/).length > 6)) {
        gebreken.push({ vorm, wat: "Een zin is langer dan zes woorden." });
      } else if (manier === "78" && script.stappen.some((s) => s.meetellen)) {
        /*
          Groep 7-8 krijgt een lijst die je in één keer leest, geen animatie
          waarin je tikt. Een tik-stap hoort daar dus niet in. Deze controle
          houdt dat vast wanneer er nieuwe types bij komen.
        */
        gebreken.push({ vorm, wat: "Groep 7-8 is een leeslijst; hier hoort geen tik-stap in." });
      } else if (manier === "78" && script.stappen.some((s) => s.model.soort !== "som")) {
        gebreken.push({
          vorm,
          wat: "Groep 7-8 toont sommen op één regel; gebruik hier het model 'som'.",
        });
      }
    } catch {
      gebreken.push({ vorm, wat: "Het script kon niet worden opgebouwd." });
    }
  }
  return gebreken;
}
