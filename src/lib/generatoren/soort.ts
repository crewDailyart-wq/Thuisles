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
  | { soort: "getal"; sleutel: string; label: string; min: number; max: number; hulp?: string }
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
export function vraagtekstVelden(standaard: Record<Leeftijdsgroep, string>): Veld[] {
  return [
    {
      soort: "tekst",
      sleutel: VRAAGTEKST_SLEUTEL,
      label: "Vraagtekst",
      plaatshouder: standaard["56"],
      hulp: "Leeg laten = de standaardzin van dit type. {som} wordt vervangen door de som zelf.",
    },
    ...VRAAGTEKST_GROEPEN.map((groep, i): Veld => ({
      soort: "tekst",
      sleutel: vraagtekstSleutel(groep),
      label: `Vraagtekst groep ${groep}`,
      plaatshouder: standaard[leeftijdsgroepVanGroep(groep)],
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
export function bepaalVraagtekst(
  generator: Pick<Generator, "vraagteksten">,
  inst: Instellingen,
  groep: number,
  som: Somgegevens,
): string {
  const blok = leeftijdsgroepVanGroep(groep);

  const eigen = tekst(inst, vraagtekstSleutel(groep), "").trim();
  const oudBlok = tekst(inst, VRAAGTEKST_BLOK_SLEUTELS[blok], "").trim();
  const gedeeld = tekst(inst, VRAAGTEKST_SLEUTEL, "").trim();
  const zin = eigen || oudBlok || gedeeld || generator.vraagteksten.standaard[blok];

  const somtekst = generator.vraagteksten.som?.(som) ?? "";
  return zin.replaceAll("{som}", somtekst).trim();
}

/** Groep 3 t/m 8 naar de drie groepsvormen. Zelfde indeling als de uitleg. */
export function leeftijdsgroepVanGroep(groep: number): Leeftijdsgroep {
  if (groep <= 4) return "34";
  if (groep <= 6) return "56";
  return "78";
}
