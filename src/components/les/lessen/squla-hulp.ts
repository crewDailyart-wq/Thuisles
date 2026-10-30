/**
 * De vaste hulp van Bliepo in alle lessen naar Squla (30 oktober 2026, opdracht
 * eigenaar): PRECIES zoals de Synthesis-lessen (verhaaltjessommen, klokkijken)
 * en de drie voorbeeldlessen (squla-huisnummers, squla-rekentaal, squla-dagen).
 *
 *   1. Bliepo stelt de vraag; het kind antwoordt.
 *   2. Goed: geluidje, "Goed zo." + waarom het klopt.
 *   3. Eén keer fout: "<antwoord>? Niet helemaal." en dan
 *      "Wil je hulp, of nog een keer proberen?" met de keuzes
 *      [Nog een keer] [Hulp] (geen "Weet ik niet"-knop).
 *        - Nog een keer: de vraag opnieuw. Weer fout: "Laten we het samen
 *          uitzoeken." en door naar de uitleg.
 *        - Hulp: "We doen het samen, stap voor stap." en de uitleg.
 *   4. De uitleg (`samen`): Bliepo laat het stap voor stap zien, zonder het
 *      antwoord voor te zeggen; daarna de vraag nog eens.
 *   5. Nog eens fout: een tip, en het kind probeert het weer.
 *   6. Dan nog fout (2× fout na de uitleg): "Zullen we even pauze nemen?" —
 *      de les stopt en het kind doet hem straks nog eens.
 *
 * Een les gebruikt `squlaVraag` voor elke opgave, `squlaBegin` voor het
 * welkom met "Kun je dit al?" en `squlaEind` voor de kaart aan het eind.
 */

import type { Lesgids } from "../soort";
import { speelLesgeluid } from "@/lib/lesgeluiden";

export type SqulaVraag<T> = {
  /** Zet het beeld klaar voor deze vraag (vóór de vraag). */
  toon?: () => void;
  /** De vraag (ook bij "Nog een keer" en na de uitleg). */
  vraag: string[];
  /** Wacht op het antwoord van het kind (kies, getal, tikken of slepen in het vlak). */
  antwoord: () => Promise<T>;
  /** Is dit antwoord goed? */
  isGoed: (x: T) => boolean;
  /** Hoe Bliepo het antwoord van het kind noemt ("Dinsdag", "{7}"). */
  noem: (x: T) => string;
  /** Wat Bliepo zegt en doet als het goed is (na het geluidje). */
  goed: (x: T) => Promise<void>;
  /** Iets in beeld bij een fout antwoord (schudden, grijs maken). */
  fout?: (x: T) => void;
  /** De uitleg, stap voor stap (op basis van wat Squla bij een fout uitlegt). */
  samen: () => Promise<void>;
  /** De tip na een fout ná de uitleg. */
  tip: string[];
  /** Voor de automatische test: het goede antwoord zoals het op de knop of in het veld staat. */
  testAntwoord?: string | number | null;
};

/** Voor de automatische test (scripts/speelcontrole.mjs leest window.__phaser.antwoord). */
export function zetTestAntwoord(waarde: string | number | null | undefined) {
  if (typeof window === "undefined") return;
  window.__phaser = { ...window.__phaser, antwoord: waarde ?? null };
}

async function vraagStellen<T>(v: SqulaVraag<T>, l: Lesgids) {
  zetTestAntwoord(v.testAntwoord);
  await l.zeg(...v.vraag);
}

/** Eén opgave met de hulp van Bliepo. Geeft `true` als hij meteen goed was. */
export async function squlaVraag<T>(l: Lesgids, v: SqulaVraag<T>): Promise<boolean> {
  v.toon?.();
  await vraagStellen(v, l);
  const x = await v.antwoord();
  if (v.isGoed(x)) {
    speelLesgeluid("goed");
    await v.goed(x);
    return true;
  }
  speelLesgeluid("mis");
  v.fout?.(x);
  await l.zeg(`${v.noem(x)}? Niet helemaal.`);
  await l.zeg("Wil je hulp, of nog een keer proberen?");
  const keuze = await l.kies(["Nog een keer", "Hulp"], { weetniet: false, direct: true });
  if (keuze === "Nog een keer") {
    v.toon?.();
    await vraagStellen(v, l);
    const y = await v.antwoord();
    if (v.isGoed(y)) {
      speelLesgeluid("goed");
      await v.goed(y);
      return false;
    }
    speelLesgeluid("mis");
    v.fout?.(y);
    await l.zeg(`${v.noem(y)}? Niet helemaal.`, "Laten we het samen uitzoeken.");
  } else await l.zeg("Goed.", "We doen het samen, stap voor stap.");

  await v.samen();
  v.toon?.();
  await vraagStellen(v, l);
  for (let poging = 1; ; poging++) {
    const z = await v.antwoord();
    if (v.isGoed(z)) {
      speelLesgeluid("goed");
      await v.goed(z);
      return false;
    }
    speelLesgeluid("mis");
    v.fout?.(z);
    if (poging === 1) {
      await l.zeg(`${v.noem(z)}? Niet helemaal.`, ...v.tip);
      continue;
    }
    await l.zeg(`${v.noem(z)}? Dat is het nog niet.`, "Zullen we even pauze nemen?", "Dan doen we het straks nog eens.");
    await l.verder();
    l.stopLes();
    return false;
  }
}

/**
 * Het welkom: een korte uitleg van wat we gaan doen, dan "Kun je dit al?".
 * Ja = meteen oefenen; Nee = de korte uitleg (`uitleg`) en dan "Nu jij!".
 */
export async function squlaBegin(l: Lesgids, o: { welkom: string[]; uitleg: () => Promise<void> }) {
  await l.zeg(...o.welkom, "Kun je dit al?");
  const kan = await l.kies(["Ja", "Nee"], { weetniet: false, direct: true });
  if (kan === "Ja") {
    await l.zeg("Mooi.", "Laat maar eens zien.");
    return;
  }
  await l.zeg("Geen probleem.", "Ik leg het kort uit.");
  await o.uitleg();
  await l.zeg("Nu jij!");
}

/** De kaart aan het eind, met een compliment. */
export async function squlaEind(l: Lesgids, fouten: number, wat: string) {
  const tik = l.kaart();
  speelLesgeluid("kaart");
  const naam = l.naam;
  await l.zeg(fouten === 0 ? (naam ? `Alles goed, ${naam}!` : "Alles goed!") : naam ? `Goed gewerkt, ${naam}!` : "Goed gewerkt!", wat);
  await tik;
}
