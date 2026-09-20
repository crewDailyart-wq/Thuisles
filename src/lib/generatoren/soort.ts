/**
 * Het raamwerk voor vraaggeneratoren.
 *
 * Een generator is een recept: uit een paar instellingen maakt het sommen.
 * Elke generator beschrijft zélf welke instellingen hij heeft, zodat het
 * beheerscherm het formulier kan opbouwen zonder iets over dat type te weten.
 * Een nieuw type toevoegen is dus: één bestand schrijven en hem aanmelden in
 * `alleGeneratoren`. Aan de schermen hoeft niets te veranderen.
 *
 * Deze bestanden bevatten alleen rekenwerk, geen database. Daardoor kan het
 * beheerscherm het voorbeeld meteen in de browser laten zien, zonder wachten.
 */

import type {
  Aanpak,
  Foutpatroon,
  Leeftijdsgroep,
  Somgegevens,
} from "@/lib/generatoren/foutpatroon";
import type { Uitlegbron } from "@/lib/generatoren/uitlegscript";
import type { AntwoordOptie, Vraagvorm } from "@/lib/vraagtypes";

export type { Somgegevens };

// ---------------------------------------------------------------------------
// Tekeningen
// ---------------------------------------------------------------------------

/**
 * Een tekening bij een vraag, opgeslagen als gegevens in plaats van als
 * plaatje. De kinderkant tekent hem met code, zodat hij op elk scherm scherp
 * blijft en netjes meeschaalt.
 */
export type Figuur =
  | import("./bosspellen-catalogus").Bosfiguur
  | {
      soort: "splitsboom";
      geheel: number;
      links: number | null;
      rechts: number | null;
    }
  | {
      soort: "kralenrij";
      /** Hoeveel kralen er in de rij hangen. */
      totaal: number;
      /** Om de hoeveel kralen de kleur wisselt. Vijf geeft de vijfstructuur. */
      perGroep: number;
      /** De hoeveelste kraal de pijl aanwijst, geteld vanaf links vanaf 1. */
      pijlOp: number;
      /** Welk kleurenpaar. De namen staan in `Figuurtekening`. */
      palet: string;
    }
  | {
      soort: "stapstenen";
      /**
       * Per steen het getal, of `null` als de steen leeg is.
       *
       * De lege stenen zijn tegelijk de invulvakken: het kind tikt op een steen
       * en vult hem ter plekke in. Er is daarom geen apart antwoordveld.
       */
      stenen: (number | null)[];
      /** Het verschil tussen twee stenen. Bepaalt de afstand en het boogje. */
      sprong: number;
      richting: "vooruit" | "terug";
      /**
       * Bestandsnaam van de mascotte op de eerste steen, of `null`.
       *
       * Bewust een afbeelding uit het afbeeldingenbeheer en geen tekening in
       * code: zo is de vos zelf te uploaden en later te vervangen zonder dat er
       * iets aan de code hoeft te veranderen. Staat er niets, dan staat er ook
       * geen mascotte — liever leeg dan een verkeerd poppetje.
       */
      mascotte: string | null;
      /**
       * Houdingen van de mascotte, elk een eigen afbeelding uit het beheer.
       *
       * Ontbreekt er een, dan wordt `mascotte` gebruikt. Zo werkt het meteen
       * met één plaatje, en kan er later per houding een betere bij zonder dat
       * er iets aan de code hoeft te veranderen.
       */
      mascotteSpringend?: string | null;
      mascotteJuichend?: string | null;
    }
  | {
      /**
       * Een aantal dezelfde plaatjes om te tellen.
       *
       * Het plaatje komt uit het afbeeldingenbeheer en staat niet in code: zo
       * is er een vrolijk plaatje bij te kiezen dat bij jonge kinderen past,
       * zonder dat er iets aan de code hoeft te veranderen.
       */
      soort: "plaatjesraster";
      /** Hoeveel plaatjes er staan. Dit is ook het antwoord. */
      aantal: number;
      /**
       * Welk getekend plaatje: "eend", "bal", "appel". Leeg = geen tekening.
       *
       * De namen staan in `components/oefenen/Telplaatjes.tsx`. Staat hier iets,
       * dan wint de tekening; `afbeelding` blijft daarnaast gewoon bestaan voor
       * wie liever een eigen plaatje uploadt.
       */
      plaatje: string | null;
      /** Bestandsnaam uit het afbeeldingenbeheer, of `null`. */
      afbeelding: string | null;
      /**
       * De mascotte, per houding een eigen afbeelding uit het beheer.
       *
       * Vangend als de plaatjes binnendwarrelen, wachtend zolang het kind
       * nadenkt, blij na een goed antwoord. Ontbreekt er een, dan wordt de
       * vangende genomen — liever dezelfde vos dan geen vos.
       */
      vos: { vangend: string | null; wachtend: string | null; blij: string | null };
      /**
       * Hoeveel plaatjes op een rij. 0 betekent verspreid, zonder rijen.
       *
       * Dit bepaalt wat er geoefend wordt: vijf per rij geeft de vijfstructuur,
       * tien per rij de tienstructuur, en verspreid is het moeilijkst omdat het
       * kind zelf structuur moet aanbrengen.
       */
      perRij: number;
      /** Kleine extra ruimte na elk groepje van vijf binnen een rij. */
      groepsruimte: boolean;
    }
  | {
      /**
       * MAB-blokken: staven van tien en losse blokjes.
       *
       * Hetzelfde materiaal dat op school in de kast staat. De staven staan
       * links, de losse blokjes rechts, met een stippellijn ertussen, zodat een
       * kind ziet dat het twee soorten zijn.
       */
      soort: "mabblokken";
      /** Hoeveel staven van tien. */
      tientallen: number;
      /** Hoeveel losse blokjes. Samen met de staven is dat het antwoord. */
      eenheden: number;
      /**
       * Wat er met de blokken gebeurt als de vraag opent.
       *
       *   tellen    alles ligt klaar; het kind telt
       *   vosbouwt  alles ligt eerst los; Vos schuift er staven van tien van
       *   slepen    (nog niet gebouwd) het kind legt zelf het getal neer
       *
       * Een naam en geen vinkje, zodat er een stand bij kan zonder dat de
       * bestaande twee verbouwd hoeven te worden.
       */
      stand: string;
      /**
       * De mascotte, per houding een eigen afbeelding uit het beheer.
       *
       * Alleen nodig bij de stand waarin Vos de staven bouwt. Ontbreekt er een,
       * dan wordt de vangende genomen.
       */
      vos: { vangend: string | null; wachtend: string | null; blij: string | null };
    }
  | {
      /**
       * Een rij huisjes met huisnummers: Vos' straat.
       *
       * Het huis waar Vos voor staat laat zijn nummer zien; de buren hebben een
       * leeg bordje. Bij even en oneven staan de huizen in twee rijen met de
       * straat ertussen, net als in het echt.
       */
      soort: "huizenrij";
      huizen: { nummer: number; kant: "boven" | "onder" }[];
      /** Bij welk huis Vos staat; dat nummer is zichtbaar. */
      vosBij: number;
      /** Welk huis gevraagd wordt; dat nummer komt pas bij een goed antwoord. */
      gevraagd: number;
      /**
       * Alle lege deuren, als het er meer dan één zijn.
       *
       * Bij de stand "allebei de buren" staat het middelste huis vol en zijn de
       * deuren links en rechts allebei leeg; dan staan hier hun twee plekken in.
       * Blijft dit leeg, dan is er precies één lege deur en geldt `gevraagd` —
       * zoals het altijd al was.
       */
      gevraagden?: number[];
      /** De mascotte, per houding een eigen afbeelding uit het beheer. */
      vos: { vangend: string | null; wachtend: string | null; blij: string | null };
    }
  | {
      /**
       * Vissen met getallen in een vijver: welk getal is het grootst?
       *
       * De vissen zijn tegelijk de antwoordknoppen — het kind tikt de vis aan
       * die het bedoelt. Er staan dus geen losse keuzeknoppen onder de vraag.
       */
      soort: "visvijver";
      vissen: { getal: number }[];
      /** Zoekt het kind de grootste of de kleinste? */
      zoek: string;
      /** De mascotte, per houding een eigen afbeelding uit het beheer. */
      vos: { vangend: string | null; wachtend: string | null; blij: string | null };
      /**
       * De vissende vos, met de plek van zijn hengelpuntje.
       *
       * Een eigen afbeelding voor dit type: een vos die rechtop staat met een
       * hengel in zijn poten. Het touw wordt in code getekend en moet precies
       * aan dat hengeltje vastzitten, dus staat erbij wáár dat puntje op het
       * plaatje zit: `x` en `y` in procenten van de breedte en de hoogte van
       * de afbeelding zelf. Zo blijft het touw eraan vast, ook als het plaatje
       * op een telefoon kleiner wordt.
       *
       * `null` of zonder afbeelding = geen hengelvos; dan geldt de gewone vos
       * en de hengel die in code getekend wordt.
       */
      hengel: { afbeelding: string | null; x: number; y: number } | null;
    }
  | {
      /**
       * Vos' trein: wagons met getallen die op volgorde gesleept worden.
       *
       * De wagons staan door elkaar op het rangeerspoor; het kind koppelt ze
       * achter de locomotief. Het antwoord is één getal per plek, met komma's
       * ertussen — dezelfde afspraak als bij "Tellen en slepen".
       */
      soort: "trein";
      /** De getallen zoals ze op het rangeerspoor klaarstaan. */
      wagons: number[];
      /** Van laag naar hoog, of andersom. */
      aflopend: boolean;
      /**
       * Vos als machinist: de afbeelding die in het raampje van de locomotief
       * komt te staan. Leeg of `null` = geen machinist; dan kijkt de gewone vos
       * mee vanaf de kant, zoals het hiervoor was.
       */
      machinist: { afbeelding: string | null } | null;
      /** De mascotte, per houding een eigen afbeelding uit het beheer. */
      vos: { vangend: string | null; wachtend: string | null; blij: string | null };
    }
  | {
      /**
       * Welk vak? — drie of vier vakken met spulletjes erin.
       *
       * Vos houdt een kaartje vast met het gevraagde getal; de vakken zijn
       * tegelijk de knoppen. Het materiaal komt uit het sjabloon: telplaatjes,
       * kralen of blokken.
       */
      soort: "vakken";
      /** Hoeveel er in elk vak zit. */
      vakken: number[];
      /** Welk materiaal: "telplaatjes", "kralen" of "blokken". */
      materiaal: string;
      /** Welk getekend telplaatje, als het materiaal telplaatjes zijn. */
      plaatje: string;
      /** Het getal op het kaartje van Vos. */
      kaart: number;
      /** 5 = rijen van vijf, 0 = verspreid door elkaar. */
      perRij: number;
      /** De mascotte, per houding een eigen afbeelding uit het beheer. */
      vos: { vangend: string | null; wachtend: string | null; blij: string | null };
    }
  | {
      /**
       * Vos in de bioscoop: een plek vinden in het twintigveld.
       *
       * Twee rijen van tien stoelen, waarvan er maar een paar een nummer
       * hebben. De stoelen zijn tegelijk de knoppen; het antwoord is het
       * stoelnummer zelf.
       */
      soort: "bioscoop";
      /** Hoeveel stoelen er staan. */
      aantal: number;
      perRij: number;
      /** Bij welke stoelen het nummer zichtbaar is. */
      zichtbaar: number[];
      /** Het getal op het kaartje van Vos. */
      gezocht: number;
      /** De mascotte, per houding een eigen afbeelding uit het beheer. */
      vos: { vangend: string | null; wachtend: string | null; blij: string | null };
    }
  | {
      soort: "telrij";
      /**
       * De figuren naast elkaar, elk met zijn eigen aantal telbare onderdelen.
       * Het antwoord is die aantallen, in deze volgorde.
       */
      items: { soort: string; aantal: number }[];
      /** Welk kleurenpaar. De namen staan in `Figuurtekening`. */
      palet: string;
    }
  | {
      soort: "bus";
      animatie?: "instappen" | "wegrijden";
      plaatsen?: number;
      /** Hoeveel kinderen er in de bus zitten. Dit is ook het antwoord. */
      totaal: number;
      /**
       * Hoeveel kinderen er in één raam passen. Vijf geeft de vijfstructuur:
       * het kind telt met sprongen mee in plaats van poppetje voor poppetje.
       */
      perGroep: number;
      /**
       * Welk kleurenpaar voor de poppetjes; de kleur wisselt per raam. De
       * namen staan in `Figuurtekening`.
       */
      palet: string;
    };

// ---------------------------------------------------------------------------
// Instellingen: het beheerscherm bouwt hier het formulier uit op
// ---------------------------------------------------------------------------

export type Veld =
  | {
      soort: "getal";
      sleutel: string;
      label: string;
      min: number;
      max: number;
      hulp?: string;
      /**
       * Hoe fijn er versteld mag worden. Weggelaten = per heel getal.
       *
       * Nodig voor waardes die geen aantal zijn maar een plek: het puntje van
       * een hengel op een plaatje bijvoorbeeld, waar een tiende procent al
       * scheelt of het touw er wel of niet aan vastzit.
       */
      stap?: number;
    }
  | {
      soort: "tekst";
      sleutel: string;
      label: string;
      hulp?: string;
      /** Wat er grijs in het veld staat zolang het leeg is. */
      plaatshouder?: string;
    }
  | { soort: "vinkje"; sleutel: string; label: string; hulp?: string }
  | {
      soort: "keuze";
      sleutel: string;
      label: string;
      opties: { waarde: string; label: string }[];
      hulp?: string;
    }
  | {
      soort: "vinkjes";
      sleutel: string;
      label: string;
      opties: { waarde: string; label: string }[];
      hulp?: string;
    }
  | {
      /**
       * Een afbeelding uit het afbeeldingenbeheer.
       *
       * Levert de bestandsnaam op, net als bij een vraag. Zo kan een sjabloon
       * een plaatje meegeven — de mascotte op de stapstenen bijvoorbeeld —
       * zonder dat dat plaatje in de code hoeft te staan.
       */
      soort: "afbeelding";
      sleutel: string;
      label: string;
      hulp?: string;
    };

export type Instellingen = Record<string, string | number | boolean | string[]>;

// ---------------------------------------------------------------------------
// Wat een generator oplevert
// ---------------------------------------------------------------------------

export type Gegenereerd = {
  /** Korte omschrijving van de som, om dubbele te herkennen: "tafels:6x4". */
  handtekening: string;
  vorm: Vraagvorm;
  vraagtekst: string;
  opties?: AntwoordOptie[];
  antwoord: string;
  figuur?: Figuur | null;
  /**
   * De getallen achter de som. Hiermee kan bij een fout antwoord worden
   * gekeken welke denkfout er waarschijnlijk is gemaakt.
   */
  somgegevens: Somgegevens;
};

export type Generator = {
  id: string;
  naam: string;
  uitleg: string;
  /** Suggestie per groep, zodat je niet hoeft na te denken over bereiken. */
  suggestie: string;
  velden: Veld[];
  standaard: Instellingen;
  /**
   * De standaardzin bij dit type, per leeftijdsgroep.
   *
   * VERPLICHT, zodat elk type in het beheer op dezelfde manier aan te passen
   * is. De beheerder kan de zin per sjabloon overschrijven — zie
   * `vraagtekstVelden` en `bepaalVraagtekst` hieronder.
   *
   * In de zin mag `{som}` staan; dat wordt vervangen door wat `som()` van deze
   * som maakt ("7 × 8", "48 − 6"). Bij een type waar de vraag ÍS de som is de
   * standaardzin dus gewoon "Hoeveel is {som}?", en kan een beheerder er
   * bijvoorbeeld "Reken uit: {som}" van maken.
   */
  vraagteksten: {
    standaard: Record<Leeftijdsgroep, string>;
    /** Hoe `{som}` eruitziet. Weglaten als het type geen som in de zin heeft. */
    som?: (s: Somgegevens) => string;
  };
  /**
   * VERPLICHT. De denkfouten die bij dit soort som horen. Zonder patronen is
   * een type niet af; de beheeromgeving waarschuwt daarvoor.
   */
  foutpatronen: Foutpatroon[];
  /**
   * VERPLICHT. Hoe je zo'n som aanpakt, los van wat er misging. Dit is wat een
   * kind ziet als er geen denkfout wordt herkend, en het levert ook de stappen
   * voor "Laat het me zien" en de zin met het antwoord plus de controle.
   */
  aanpak: Aanpak;
  /**
   * VERPLICHT. De uitleg-animatie voor alle drie de groepsvormen. Zolang een
   * vorm nog ontbreekt geeft het script `null` terug; er wordt dan
   * teruggevallen op de stappenlijst en de beheeromgeving waarschuwt.
   */
  uitleganimatie: Uitlegbron;
  /** Hoeveel verschillende sommen er hoogstens mogelijk zijn, of null. */
  maximum: (inst: Instellingen) => number | null;
  /**
   * Wat er mis is met deze instellingen, in gewone taal — of `null` als er
   * niets aan de hand is.
   *
   * Bedoeld voor het beheervoorbeeld: komen er geen sommen uit, dan hoort er te
   * staan wáárom, en wat je eraan kunt doen. "Er komen geen sommen uit" laat
   * een beheerder zelf puzzelen; "de rij past niet in dit bereik" zegt precies
   * welke knop hij moet omzetten. Laat een type dit weg, dan blijft de
   * algemene zin staan die er altijd stond.
   */
  waarschuwing?: (inst: Instellingen) => string | null;
  /**
   * Maakt sommen. `alGebruikt` bevat handtekeningen die al bestaan; die worden
   * overgeslagen. Levert er hoogstens `aantal` op — soms minder, als alles op
   * is.
   */
  maak: (
    inst: Instellingen,
    aantal: number,
    alGebruikt: Set<string>,
    zaad: number,
    /** Voor welke groep wordt er gemaakt; bepaalt welke vraagzin erbij hoort. */
    groep: number,
  ) => Gegenereerd[];
};

/**
 * Hoeveel sommen er hoogstens in één keer gemaakt worden.
 *
 * Eén grens voor het hele generator-systeem, niet per type: een nieuw type
 * krijgt hem dus vanzelf mee, zonder er iets voor te hoeven opgeven.
 *
 * De grens staat bewust hoog. Hij is er niet om te bepalen hoeveel sommen
 * zinnig zijn — dat bepaal jij — maar alleen om een vertypt getal (50000 in
 * plaats van 500) niet te laten uitlopen op een browser die minutenlang staat
 * te rekenen. Wat je in de praktijk tegenhoudt is het NATUURLIJKE maximum: het
 * aantal verschillende sommen dat bij de gekozen instellingen bestaat. Dat
 * getal staat in het beheer onder het voorbeeld.
 */
export const MAX_SOMMEN_PER_KEER = 5000;

// ---------------------------------------------------------------------------
// Hulpjes die de generatoren delen
// ---------------------------------------------------------------------------

/** Voorspelbare toevalsgenerator: hetzelfde zaad geeft dezelfde sommen. */
export function kansGenerator(zaad: number): () => number {
  let a = (zaad || 1) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function heelGetal(kans: () => number, van: number, tot: number): number {
  return van + Math.floor(kans() * (tot - van + 1));
}

export function kiesUit<T>(kans: () => number, lijst: T[]): T {
  return lijst[Math.floor(kans() * lijst.length)];
}

export function husselen<T>(kans: () => number, lijst: T[]): T[] {
  const uit = [...lijst];
  for (let i = uit.length - 1; i > 0; i--) {
    const j = Math.floor(kans() * (i + 1));
    [uit[i], uit[j]] = [uit[j], uit[i]];
  }
  return uit;
}

export function getal(inst: Instellingen, sleutel: string, terugval: number): number {
  const w = Number(inst[sleutel]);
  return Number.isFinite(w) ? w : terugval;
}

export function vinkje(inst: Instellingen, sleutel: string, terugval = false): boolean {
  const w = inst[sleutel];
  return typeof w === "boolean" ? w : terugval;
}

export function tekst(inst: Instellingen, sleutel: string, terugval: string): string {
  const w = inst[sleutel];
  return typeof w === "string" && w !== "" ? w : terugval;
}

export function lijst(inst: Instellingen, sleutel: string, terugval: string[]): string[] {
  const w = inst[sleutel];
  return Array.isArray(w) && w.length > 0 ? w.map(String) : terugval;
}

/**
 * Maakt geloofwaardige foute antwoorden rond het goede antwoord.
 *
 * Eerst typische denkfouten (één te veel, één te weinig, tien ernaast), dan
 * getallen dichtbij. Nooit het goede antwoord, nooit twee dezelfde, en nooit
 * negatief tenzij dat mag.
 */
export function afleiders(
  goed: number,
  kans: () => number,
  aantal = 3,
  magNegatief = false,
): number[] {
  const kandidaten = [
    goed + 1, goed - 1, goed + 2, goed - 2,
    goed + 10, goed - 10, goed + 5, goed - 5,
    goed * 2, Math.round(goed / 2),
  ].filter((n) => Number.isInteger(n) && n !== goed && (magNegatief || n >= 0));

  const uniek = [...new Set(kandidaten)];
  const gekozen = husselen(kans, uniek).slice(0, aantal);

  // Aanvullen als er te weinig geloofwaardige kandidaten waren.
  let extra = 3;
  while (gekozen.length < aantal) {
    const n = goed + extra;
    if (n !== goed && !gekozen.includes(n) && (magNegatief || n >= 0)) gekozen.push(n);
    extra++;
    if (extra > 60) break;
  }

  return gekozen;
}

/** Bouwt een meerkeuzevraag met het goede antwoord op een willekeurige plek. */
export function meerkeuze(
  goed: number,
  kans: () => number,
  aantalOpties = 4,
  magNegatief = false,
): { opties: AntwoordOptie[]; antwoord: string } {
  const fout = afleiders(goed, kans, aantalOpties - 1, magNegatief);
  const alles = husselen(kans, [goed, ...fout]);
  return {
    opties: alles.map((n) => ({ tekst: String(n), afbeelding: null })),
    antwoord: String(alles.indexOf(goed)),
  };
}


// ---------------------------------------------------------------------------
// De vraagtekst: standaard van het type, of wat de beheerder ervan maakte
// ---------------------------------------------------------------------------

/** De sleutel van de gezamenlijke vraagtekst. */
export const VRAAGTEKST_SLEUTEL = "vraagtekst";

/** De groepen waarvoor een eigen vraagtekst ingesteld kan worden. */
export const VRAAGTEKST_GROEPEN = [3, 4, 5, 6, 7, 8] as const;

/** De sleutel van de vraagtekst voor één losse groep: 3 wordt "vraagtekst3". */
export function vraagtekstSleutel(groep: number): string {
  return `vraagtekst${groep}`;
}

/**
 * De oude sleutels, per groepsblok.
 *
 * Hier stonden ooit maar drie velden in: 3-4, 5-6 en 7-8. Sjablonen die sinds
 * die tijd niet opnieuw zijn opgeslagen, dragen die sleutels nog. Ze worden
 * daarom nog steeds GELEZEN — als terugval, onder de losse groep — zodat een
 * zin die je ooit hebt ingevuld niet stilletjes verdwijnt. Geschreven worden
 * ze niet meer.
 */
export const VRAAGTEKST_BLOK_SLEUTELS: Record<Leeftijdsgroep, string> = {
  "34": "vraagtekst34",
  "56": "vraagtekst56",
  "78": "vraagtekst78",
};

/**
 * De velden waarmee een beheerder de vraagtekst aanpast.
 *
 * Elk type krijgt precies dezelfde zeven velden, zodat het overal hetzelfde
 * werkt: één gezamenlijke zin, en daaronder een optionele zin per losse groep.
 * Leeg laten betekent: neem de zin van het niveau erboven.
 *
 * Per losse groep en niet per blok, omdat het verschil tussen groep 3 en groep
 * 4 in taal groter is dan het verschil tussen groep 5 en 6 — een zin die voor
 * groep 4 goed werkt, is voor een net begonnen groep 3 vaak al te lang.
 */
export function vraagtekstVelden(
  standaard: Record<Leeftijdsgroep, string>,
  opties: {
    /**
     * Uitleg die alleen bij dit type hoort.
     *
     * Sommige types kennen een eigen plaatshouder naast `{som}`. Die uitleg komt
     * achter de gezamenlijke tekst te staan, zodat elk type verder precies
     * dezelfde velden en dezelfde uitleg houdt.
     */
    extraHulp?: string;
    /**
     * De zin zoals het kind hem krijgt, om als grijs voorbeeld te tonen.
     *
     * Zonder dit staat de standaardzin uit de code in het grijs, en die kan een
     * plaatshouder bevatten: "Sleep de wagons {som}." Wie dat leest, ziet niet
     * wat er straks op het scherm van het kind staat. Geeft een type deze zin
     * mee, dan staat daar een echte zin — met een voorbeeldwoord op de plek van
     * de plaatshouder.
     */
    voorbeeldzinnen?: Record<Leeftijdsgroep, string>;
  } = {},
): Veld[] {
  const grijs = (blok: Leeftijdsgroep) =>
    opties.voorbeeldzinnen?.[blok] ?? standaard[blok];

  return [
    {
      soort: "tekst",
      sleutel: VRAAGTEKST_SLEUTEL,
      label: "Vraagtekst",
      plaatshouder: grijs("56"),
      hulp:
        "Leeg laten = de standaardzin van dit type. {som} wordt vervangen door de som zelf." +
        (opties.voorbeeldzinnen
          ? " Het grijze voorbeeld hiernaast laat zien hoe de zin er bij een vraag uitkomt te zien."
          : "") +
        (opties.extraHulp ? ` ${opties.extraHulp}` : ""),
    },
    ...VRAAGTEKST_GROEPEN.map((groep, i): Veld => ({
      soort: "tekst",
      sleutel: vraagtekstSleutel(groep),
      label: `Vraagtekst groep ${groep}`,
      plaatshouder: grijs(leeftijdsgroepVanGroep(groep)),
      /* De uitleg hoort maar één keer boven de rij te staan. */
      hulp: i === 0 ? "Alleen invullen als deze groep een andere zin moet krijgen." : undefined,
    })),
  ];
}

/**
 * Vult de losse groepsvelden aan vanuit de oude blokvelden.
 *
 * Bedoeld voor het beheerscherm: open je een sjabloon dat nog met 3-4/5-6/7-8
 * is opgeslagen, dan staan de zinnen meteen op de juiste losse groepen (wat bij
 * 3-4 stond, komt bij groep 3 én groep 4). Sla je daarna op, dan zijn ze
 * overgezet.
 *
 * Bewust hier en niet als migratie op de database: er wordt niets aan opgeslagen
 * gegevens veranderd zonder dat jij zelf op opslaan drukt.
 */
export function neemVraagtekstenOver(inst: Instellingen): Instellingen {
  const uit: Instellingen = { ...inst };

  for (const groep of VRAAGTEKST_GROEPEN) {
    const sleutel = vraagtekstSleutel(groep);
    if (tekst(uit, sleutel, "").trim() !== "") continue;

    const oud = tekst(uit, VRAAGTEKST_BLOK_SLEUTELS[leeftijdsgroepVanGroep(groep)], "").trim();
    if (oud !== "") uit[sleutel] = oud;
  }

  return uit;
}

/**
 * Welke zin hoort bij deze som, voor een kind uit déze groep?
 *
 * Volgorde, van meest naar minst specifiek:
 *   1. de zin voor deze losse groep ("vraagtekst4");
 *   2. de oude zin voor het groepsblok ("vraagtekst34"), voor sjablonen die
 *      nog niet opnieuw zijn opgeslagen;
 *   3. de gezamenlijke zin ("vraagtekst");
 *   4. de standaardzin van het type.
 *
 * Daarna wordt `{som}` ingevuld.
 */
/**
 * Een reeks aanvullen met dubbele sommen tot het gevraagde aantal.
 *
 * Er komen er altijd zoveel als er gevraagd zijn. Zijn er minder verschillende
 * mogelijk, dan worden eerst alle verschillende gebruikt en daarna wordt er
 * aangevuld — om de beurt, zodat de ene som er niet drie keer in zit terwijl
 * een andere er maar één keer in staat.
 *
 * Staat hier en niet bij de opslag, omdat het beheervoorbeeld in de browser
 * dezelfde reeks moet laten zien als er straks wordt weggeschreven. Twee keer
 * dezelfde rekenregel zou vroeg of laat uit elkaar lopen.
 */
export function vulAanMetDubbele<T>(nieuwe: T[], voorraad: T[], gevraagd: number): T[] {
  const reeks = [...nieuwe];
  if (reeks.length >= gevraagd || voorraad.length === 0) return reeks;

  for (let i = 0; reeks.length < gevraagd; i++) {
    reeks.push(voorraad[i % voorraad.length]);
  }
  return reeks;
}

export function bepaalVraagtekst(
  generator: Pick<Generator, "vraagteksten">,
  inst: Instellingen,
  groep: number,
  som: Somgegevens,
  /**
   * Extra woorden die in de zin mogen worden ingevuld, per plaatshouder.
   *
   * `{som}` kent elk type; dit is voor woorden die alleen bij één type bestaan
   * en niet in de somgegevens passen, want daar staan alleen getallen in. Zo
   * vult "Plaatjes tellen" hier `{plaatjes}` mee met het meervoud van het
   * plaatje dat in die vraag staat.
   *
   * Is een woord leeg, dan verdwijnt de plaatshouder én de spatie ervoor, zodat
   * er geen dubbele spatie of een zin met een gat overblijft.
   */
  woorden: Record<string, string> = {},
): string {
  const blok = leeftijdsgroepVanGroep(groep);

  const eigen = tekst(inst, vraagtekstSleutel(groep), "").trim();
  const oudBlok = tekst(inst, VRAAGTEKST_BLOK_SLEUTELS[blok], "").trim();
  const gedeeld = tekst(inst, VRAAGTEKST_SLEUTEL, "").trim();
  const zin = eigen || oudBlok || gedeeld || generator.vraagteksten.standaard[blok];

  const somtekst = generator.vraagteksten.som?.(som) ?? "";
  let uit = zin.replaceAll("{som}", somtekst);
  for (const [naam, woord] of Object.entries(woorden)) {
    uit = woord === ""
      ? uit.replaceAll(` {${naam}}`, "").replaceAll(`{${naam}}`, "")
      : uit.replaceAll(`{${naam}}`, woord);
  }
  return uit.trim();
}

/** Groep 3 t/m 8 naar de drie groepsvormen. Zelfde indeling als de uitleg. */
export function leeftijdsgroepVanGroep(groep: number): Leeftijdsgroep {
  if (groep <= 4) return "34";
  if (groep <= 6) return "56";
  return "78";
}
