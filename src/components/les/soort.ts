/**
 * Een uitleg-les als draaiboek (oktober 2026), zoals de lessen van Synthesis.
 *
 * Een les is één doorlopend gesprek: de mascotte zegt iets, het kind doet iets
 * (een tegel pakken, een getal typen, kiezen) en de les reageert daarop. Wat
 * er bij een fout of bij "weet ik niet" gebeurt, staat gewoon in het
 * draaiboek, als een `if`. Zo leest een les van boven naar beneden zoals hij
 * gespeeld wordt.
 *
 * In zinnen staat een getal tussen accolades, bijvoorbeeld "{3} en {7}": dat
 * getal krijgt de kleur van zijn tegel. Een woord tussen sterretjes, "*dit*",
 * krijgt nadruk. De stem leest de zin zonder die tekens.
 */

import type { ComponentType } from "react";

/** Iets wat een eigen speelvlak meldt: een tik, een sleep, een gekozen getal. */
export type Vlakgebeurtenis = { soort: string; [sleutel: string]: unknown };

/**
 * Wat elk speelvlak meekrijgt. Het vlak tekent in punten van het vaste
 * speelvlak (1280 × 720); `schaal` is nodig om vingerposities om te rekenen.
 * `metSom`: de som staat bovenaan, laat dan de bovenste 118 punten vrij.
 */
export type Vlakbasis = {
  meld: (g: Vlakgebeurtenis) => void;
  schaal: number;
  metSom: boolean;
  /**
   * Alleen op een staand scherm (telefoon rechtop) en alleen voor een vlak dat `staandGroei` heeft (BOUWREGELS 1.24,
   * 7 november 2026): zoveel punten hoog mag het vlak zijn (meer dan 720), zodat het de lege ruimte boven de ballon
   * gebruikt. Andere vlakken krijgen dit niet en blijven precies zoals ze waren.
   */
  staandHoogte?: number;
};

/** Een vlak dat op een staand scherm hoger mag worden dan 720 punten (zie `Vlakbasis.staandHoogte`). */
export function magStaandGroeien(comp: unknown): boolean {
  return !!comp && (comp as { staandGroei?: boolean }).staandGroei === true;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Vlak<P = any> = ComponentType<P & Vlakbasis>;

export type Somdeel =
  /** `kleur`: een eigen kleur (hex) in plaats van de tegelkleur van het getal. */
  | { t: "getal"; n: number; kleur?: string }
  | { t: "teken"; s: string }
  | { t: "vak"; waarde?: string; kleur?: string };

export type Kiesinstel = {
  direct?: boolean;
  weetniet?: string | false;
  raster?: boolean;
  bijOpdracht?: boolean;
  /** Korte keuzes (getallen) per 2 naast elkaar, bijvoorbeeld 4 keuzes als 2 × 2 in plaats van 3 + 1 (herstel 7 november; alleen als de les het vraagt). */
  perTwee?: boolean;
  /** Lange woordkeuzes (hele zinnetjes) onder elkaar en even breed, niet 2 naast elkaar (herstel 7 november; alleen als de les het vraagt). */
  onderElkaar?: boolean;
  /**
   * Herstel 7 november (groep C, OVERZICHT-C punt 4): de antwoorden groot in een rij in het MIDDEN van het speelvlak,
   * niet als kleine knopjes onder de zin van Bliepo. Het getal is de bovenkant van de rij in punten van het vlak
   * (1280 × 720). Alleen op een liggend scherm met de indeling van Synthesis; staand blijft alles zoals het was.
   */
  midden?: number;
};

export interface Lesgids {
  /** De actieve les, voor de bijbehorende lesopening. */
  lesId?: string;
  /** De naam van het kind, of leeg. */
  naam: string;
  /** De mascotte zegt deze zinnen; klaar als alles gezegd is. */
  zeg(...zinnen: string[]): Promise<void>;
  /** Alleen presentatie: bewaar de opdracht boven het speelvlak, los van tutorfeedback. */
  opdracht?(tekst: string | null): void;
  /** Een invulvak links. Geeft het getal, of `null` bij "Weet ik niet". */
  getal(): Promise<number | null>;
  /**
   * Bliepo wijst een knop aan en zegt erbij wat hij doet (27 oktober 2026,
   * groep 3 kan nog niet lezen; ONTWERPREGELS.md). De knop met
   * `data-knop="<knop>"` pulseert zolang hij praat; wat er in beeld staat
   * (ook de knoppen) blijft staan. Gebruik dit de eerste keer in een les,
   * bijvoorbeeld: `const p = l.getal(); await l.wijsAan("weetniet", "Weet je
   * het niet? Tik dan op het vraagteken."); const v = await p;`
   * Knoppen: controleer, weetniet, verder, nogeens, opnieuw, terug, en wat
   * een vlak zelf een `data-knop` geeft.
   */
  wijsAan(knop: string, ...zinnen: string[]): Promise<void>;
  /** Knoppen links. Het kind kiest en bevestigt met het vinkje; `null` = "Weet ik niet". */
  /**
   * Kiezen uit knoppen. `instel` (28 oktober 2026, nabouw naar Synthesis):
   * `direct` = een tik is meteen het antwoord (geen vinkje), `weetniet` = de
   * tekst van de weet-ik-niet-knop of `false` voor geen, `raster` = cijfertegels
   * in een raster van 3 breed (antwoordtegels 1–9, besluit eigenaar).
   */
  kies(opties: string[], instel?: Kiesinstel): Promise<string | null>;
  /**
   * Losse knoppen op de vaste plek onder de zin van Bliepo (28 oktober 2026,
   * besluit eigenaar: antwoordknoppen staan altijd bij Bliepo, nooit in het
   * speelvlak). "weetniet" = het vraagteken, "controleer" = het vinkje. Geeft
   * terug welke knop getikt is. Verdwijnt vanzelf als het vlak een tik meldt
   * (net als `kies([])`). Gebruik met `Promise.race` naast `wachtOpVlak`.
   */
  knoppen(welke: ("weetniet" | "controleer" | "hulp")[]): Promise<"weetniet" | "controleer" | "hulp">;
  /** De blauwe pijl: het kind tikt als het klaar is met kijken. */
  verder(): Promise<void>;
  /** Wat er in de bak rechts ligt. `om`: alle tegels omgedraaid, zodat ze in de inham passen. */
  bak(tegels: number[], opties?: { om?: boolean }): void;
  /** Eén tegel uit de bak halen. */
  uitBak(n: number): void;
  /** Eén tegel in de bak op slot zetten (dof, niet te pakken). */
  slot(n: number): void;
  /** Wachten tot het kind een tegel in het vak zet. `hulp`: wat de mascotte zegt als het kind niets doet. */
  pak(opties?: { hand?: boolean; hulp?: string[] }): Promise<number>;
  /** Een tegel in het vak leggen: op de toren, of `naast` als nieuwe toren. */
  leg(n: number, opties?: { naast?: boolean }): void;
  /** De laatst gelegde tegel verdwijnt weer. */
  haalWeg(): Promise<void>;
  /** Het vak wordt leeg. */
  leeg(): Promise<void>;
  /** De toren draait om: de bovenste tegel komt onder. */
  draai(): Promise<void>;
  /** De mascotte telt de hokjes in het vak, één voor één. */
  tel(): Promise<void>;
  /** De som bovenaan, of `null` om hem weg te halen. */
  som(delen: Somdeel[] | null): void;
  /** Het kind typt in vakje `index` van de som bovenaan. */
  somVak(index: number, o: { weetniet: true }): Promise<number | null>;
  somVak(index: number, o?: { weetniet?: false }): Promise<number>;
  /** De verzamelkaart aan het eind. Staat meteen in beeld; de belofte is klaar als het kind erop tikt. */
  kaart(): Promise<void>;
  /**
   * De les stopt hier, zonder kaart (28 oktober 2026, besluit eigenaar: zoals
   * Synthesis bij 2× fout op het eindantwoord, "laten we even pauze nemen").
   * Zeg eerst de zinnen; daarna staan de knoppen "Nog een keer" en "Terug" in
   * beeld. De les telt niet als af. Komt nooit terug (de belofte wordt
   * afgewezen met het stopteken van het lesscherm).
   */
  stopLes(): Promise<never>;
  wacht(ms: number): Promise<void>;
  /**
   * Een eigen speelvlak in plaats van het tegelraster en de bak: een
   * getallenlijn, een klok, stippen. Het vlak staat rechts van de tekst, van
   * x = 300 tot 1280. `null` brengt het tegelraster terug.
   */
  vlak<P extends object>(vlak: Vlak<P> | null, props?: P): void;
  /** Eigenschappen van het huidige vlak aanpassen; de rest blijft staan. */
  pasVlakAan<P extends object>(props: Partial<P>): void;
  /** Wachten tot het vlak iets meldt (van deze soort, of één van deze soorten). */
  wachtOpVlak<G extends Vlakgebeurtenis = Vlakgebeurtenis>(soort?: string | string[]): Promise<G>;
}

export type Lesdraaiboek = {
  id: string;
  /** Naam voor het kind; staat ook op de kaart aan het eind. */
  titel: string;
  /** De Synthesis-les waar hij op lijkt, alleen voor in beheer. */
  synthesis: string;
  /**
   * "synthesis" (28 oktober 2026, besluit eigenaar): de indeling van het
   * scherm zoals Synthesis. Links een kolom met de zin en de knoppen, het
   * voorwerp in het midden, Bliepo en de microfoonknop rechts op hun plek.
   * Zonder: de zin en de knoppen in de ballon boven Bliepo.
   */
  indeling?: "synthesis";
  /**
   * Nieuwe lessen naar Squla (30 oktober 2026, opdracht eigenaar): voorlopig mag de
   * browserstem nieuwe zinnen voorlezen (nog geen Ruth-audio). Bestaande Ruth-zinnen
   * worden gewoon gebruikt. Alle zinnen staan in STEMZINNEN.md om later met Ruth te maken.
   */
  browserstem?: true;
  /**
   * Nacht (30 oktober 2026, keuze eigenaar bij de weektrein): de blauwe ruimte
   * wordt donker, zodat gloeiende plaatjes ("glow in the dark") goed uitkomen.
   */
  nacht?: true;
  /**
   * Opt-in geldmachine-1: de opdracht staat boven het speelvlak. Tutoruitspraak,
   * Ja/Nee en hulp blijven bij Bliepo. Alleen `bijOpdracht`-keuzes staan bij de opdracht.
   */
  vraagBoven?: true;
  /** Welke tegels er als lijntekening op de kaart staan. */
  kaarttegels?: number[];
  /** Of een eigen lijntekening voor op de kaart (SVG van 244 × 190). */
  kaarttekening?: ComponentType;
  /**
   * Vaste plaatjes die deze les gebruikt (31 oktober 2026): namen uit
   * src/lib/voorwerpen, bestand public/voorwerpen/<naam>.png. Het lesscherm
   * laadt ze vóór de les begint. Zie WISSELEN.md.
   */
  voorwerpen?: readonly string[];
  speel(l: Lesgids): Promise<void>;
};
