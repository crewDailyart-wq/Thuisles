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

import type { Hervatstand, HervatUitkomst } from "@/lib/hervatstand";
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
  /**
   * BOUWREGELS 15.47 (Sara, 19 november 2026; F19): Bliepo telt hardop mee terwijl het kind tikt ("2 appels."). De
   * opdracht (`opdracht`, wat Bliepo net zei, bijvoorbeeld "Tik op elke appel.") blijft dan bovenaan in zijn tekstvak
   * staan; alleen `zinnen` worden gesproken en komen eronder. Alleen bij lessen met `pijlZoalsSynthesis` (de gouden
   * lessen); zonder die optie is dit hetzelfde als `zeg(...zinnen)`.
   */
  zegBijOpdracht?(opdracht: string | readonly string[], ...zinnen: string[]): Promise<void>;
  /**
   * Voortgangsbalk bovenin (alleen gouden lessen, BOUWREGELS 15.54): `fractie` 0 tot 1 = hoever de les is; de balk gaat
   * nooit terug (een lagere waarde wordt genegeerd). `null` haalt de balk weg.
   */
  voortgang?(fractie: number | null): void;
  /**
   * Verdergaan waar je was (BOUWREGELS 15.53; alleen lessen met `eindscherm`). `hervat` = de stand van een speelbeurt die niet
   * af is (anders afwezig). `stap` na elke afgeronde vraag (in `noteer`, na `voortgang`). `onthoud` = een eigen keuze van de les
   * bewaren die nodig is om dezelfde stap terug te vinden. `openingsZin` = wat Bliepo eerst zegt bij verdergaan of opnieuw doen.
   */
  hervat?: Hervatstand;
  stap?(vraag: string, uit: HervatUitkomst, denkfouten: readonly string[]): void;
  onthoud?(sleutel: string, waarde: string | number): void;
  openingsZin?: string;
  /**
   * Proef eindscherm (Sara, 24 november 2026; EINDSCHERM-ONTWERP.md): er komt 1 sleutel bij (antwoord in 1 keer goed,
   * BOUWREGELS 15.52). Het lesscherm laat een sleuteltje naar de teller rechtsboven vliegen en zet de teller +1. Alleen in
   * lessen met `eindscherm`; anders bestaat deze functie niet.
   */
  sleutel?(): void;
  /**
   * Proef eindscherm: zet het nieuwe eindscherm in beeld (feestmoment, ster met "Les af!", sleutels, leerzin, knoppen
   * "Volgende les" en "Terug"). Alleen in lessen met `eindscherm`. De les zegt daarna zelf 1 eindzin.
   */
  eindscherm?(r?: { percentage: number; denkfouten: string[] }): void;
  /**
   * Na de eindzin (26 nov 2026): de leerzin hardop, dan zegt Bliepo `eindKaartZin` ("Tik op de kaart om hem af te vinken."),
   * de kaart met het onderwerp licht zacht op en wacht op de tik. Na de tik: vinkje + kleur (les-kleuren.ts), het resultaat
   * wordt bewaard en het kind gaat terug naar de onderwerpen. Alleen in lessen met `eindscherm`.
   */
  eindAfsluiten?(): Promise<void>;
  /**
   * Alleen op de voorbeeldpagina, als test (`&snel=1`, `&snel=alles`, `&snel=moeite`): de les slaat alles over en laat
   * meteen het eindscherm zien. Leeg of afwezig = gewoon spelen.
   */
  snelEinde?: "gewoon" | "alles" | "moeite";
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
  /**
   * De blauwe pijl weer weghalen zonder tik (10 november 2026, alleen gebruikt door de gouden klokles, zoals Synthesis:
   * bij een stuk tekst dat vanzelf doorgaat staat de pijl er tijdens het praten en verdwijnt hij daarna). De belofte van
   * `verder()` blijft dan open; wacht er dus niet los op. Doet niets als de les niet op de pijl wacht.
   */
  verderWeg?(): void;
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
  /**
   * Opt-in gouden lessen (Sara, 17 november 2026; BOUWREGELS 15.31, FOUTEN-VOORBEELDEN F11): staat de opdracht al ergens
   * anders in beeld (een kop in het speelvlak), dan toont Bliepo's tekstvak dezelfde zin NIET nog een keer; Bliepo
   * spreekt hem wel. De les meldt de zin met `l.opdracht(zin)`; alle andere zinnen van Bliepo blijven gewoon in zijn tekstvak.
   * Oude lessen hebben dit niet en blijven precies zoals ze zijn.
   */
  opdrachtInVlak?: true;
  /**
   * Opt-in (10 november 2026, DEFINITIEF met Sara's akkoord; BOUWREGELS 15.27, SYNTHESIS-ANALYSE/PIJL-KLOK.md): tekst en
   * pijl zoals Synthesis, nu alleen in de gouden klokles. (1) De zinnen van 1 `zeg`-aanroep blijven onder
   * elkaar staan in plaats van elkaar te vervangen; (2) een tik op de blauwe pijl breekt de stem meteen af; (3) de pijl
   * staat RECHTS onder de tekst (data-pijl="rechts"; Sara's keuze, Synthesis heeft hem links). Zonder deze optie
   * verandert er niets.
   */
  pijlZoalsSynthesis?: true;
  /**
   * Opt-in (10 november 2026, besluit Sara; nu alleen de gouden klokles, hoort bij het skelet van elke nieuwe of omgezette
   * gouden les, LESRECEPT.md): Bliepo praat zijn zinnen helemaal uit. Een zin telt pas als klaar als hij echt is
   * uitgesproken (of, als de stem niets uitspreekt, na de leestijd); zonder eerdere tik wacht de eerste zin op de eerste
   * tik van het kind. Zie zetLesStem / heelUitpraten in lib/stem.ts. Zonder deze optie verandert er niets.
   */
  stemHeelUitpraten?: true;
  /**
   * Opt-in (10 november 2026, eis Sara; BOUWREGELS 3.7; nu alleen de gouden les Minsommen): elk woord licht op op het
   * moment dat Bliepo het zegt, ook met de browserstem. Gebruikt de woordmeldingen van de browser (onboundary) als die er
   * zijn, anders het geleerde tempo van de stem (lib/stem.ts woordenMee). Andere lessen: zet deze ene regel erbij.
   * Zonder deze optie verandert er niets.
   */
  woordenMeeMetStem?: true;
  /**
   * Opt-in (proef, Sara 24 november 2026; EINDSCHERM-ONTWERP.md): het nieuwe eindscherm in plaats van de kaart, met de
   * sleutelteller rechtsboven tijdens de les. Nu alleen in Tellen extra. Zonder deze optie verandert er niets.
   */
  eindscherm?: true;
  /** Bij `eindscherm`: 1 korte zin over wat het kind geleerd heeft ("Je kunt nu fruit tellen tot 10."). */
  eindLeerzin?: string;
  /** Bij `eindscherm`: een plaatje uit de les bij de leerzin (pad in public/, bijvoorbeeld "/voorwerpen/appel.png"). */
  eindPlaatje?: string;
  /** Bij `eindscherm`: het onderwerp op de kaart ("Fruit tellen") en wat Bliepo zegt als de kaart aangetikt moet worden. */
  eindOnderwerp?: string;
  eindKaartZin?: string;
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
