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
export type Vlakbasis = { meld: (g: Vlakgebeurtenis) => void; schaal: number; metSom: boolean };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Vlak<P = any> = ComponentType<P & Vlakbasis>;

export type Somdeel =
  | { t: "getal"; n: number }
  | { t: "teken"; s: string }
  | { t: "vak"; waarde?: string };

export type Kiesinstel = { direct?: boolean; weetniet?: string | false; raster?: boolean };

export interface Lesgids {
  /** De naam van het kind, of leeg. */
  naam: string;
  /** De mascotte zegt deze zinnen; klaar als alles gezegd is. */
  zeg(...zinnen: string[]): Promise<void>;
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
  somVak(index: number): Promise<number>;
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
  /** Welke tegels er als lijntekening op de kaart staan. */
  kaarttegels?: number[];
  /** Of een eigen lijntekening voor op de kaart (SVG van 244 × 190). */
  kaarttekening?: ComponentType;
  speel(l: Lesgids): Promise<void>;
};
