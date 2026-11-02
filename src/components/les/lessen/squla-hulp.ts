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
 *
 * ---------------------------------------------------------------------------
 * HET BEGINSCHERM "Kun je dit al?" (1 november 2026, BOUWREGELS 4.1-4.3)
 * ---------------------------------------------------------------------------
 * Vast (in `squlaBegin`, voor alle lessen gelijk):
 *   - de opbouw: een voorbeeld van de echte opdracht in beeld, Bliepo, en de
 *     knoppen Ja en Nee;
 *   - alleen de vraag "Kun je dit al?" aan het eind; verder GEEN vaste zin;
 *   - Ja = "Mooi. Laat maar eens zien." en meteen de opgaven;
 *     Nee = "Geen probleem. Ik leg het kort uit.", de uitleg, en "Nu jij!".
 * Per les (verplicht, door de les zelf):
 *   - `welkom`: een EIGEN zin over waar deze les over gaat (mag uit een paar
 *     korte zinnen bestaan). Nooit leeg, nooit een standaardzin, nooit zelf
 *     "Kun je dit al?". Is hij leeg of standaard, dan stopt de les tijdens
 *     ontwikkelen met een foutmelding (en dus faalt de speelcontrole).
 *   - `voorbeeld`: zet in het eigen vlak van de les een ECHTE opgave uit die
 *     les in beeld, zoals het kind hem straks krijgt, maar nog zonder dat het
 *     iets hoeft te doen (niets actief, geen keuzeknoppen). Het voorbeeld
 *     staat er vóór en tijdens de zin en blijft staan bij Ja en Nee. Daarna
 *     zet de eerste vraag (Ja) of de uitleg (Nee) het vlak zelf weer goed.
 * Met `voorbeeld` staan de eigen zin en "Kun je dit al?" samen als één tekst
 * boven Bliepo (de woorden lichten op terwijl hij praat, regel 3.7), zodat het
 * kind bij Ja en Nee nog leest waar de les over gaat. Lessen zonder
 * `voorbeeld` (nog niet omgezet) werken zoals vroeger; tijdens ontwikkelen
 * staat er dan een waarschuwing in de console.
 *
 * Voorbeeld (klokkijken):
 *
 *   l.vlak<KlokVlakProps>(SqulaKlokVlak, { ...LEEG });
 *   await squlaBegin(l, {
 *     welkom: ["Kijk eens naar de klok!", "Weet jij hoe laat het is?"],
 *     voorbeeld: () => opgaven[0](l, false).toon?.(),
 *     uitleg: () => uitlegHeel(l),
 *   });
 *
 * De zinnen komen in STEMZINNEN.md via `npm run stemzinnen` (dat script leest
 * de `welkom`-zinnen uit de broncode). Zie ook de handleiding in BOUWREGELS 4.1.
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

/**
 * Verhaal en vraag samen in beeld (BOUWREGELS 14.25): Bliepo zegt de zinnen als één blok, zodat het verhaal niet
 * wegvalt en er niet alleen "Hoeveel euro houd je over?" of "Typ het getal." naast het plaatje blijft staan.
 * Geldt voor alle Squla-lessen; een vraag van één zin blijft zoals hij was.
 */
export function alsEenBlok<V extends { vraag: string[] }>(v: V): V {
  return v.vraag.length > 1 ? { ...v, vraag: [v.vraag.join(" ")] } : v;
}

async function vraagStellen<T>(v: SqulaVraag<T>, l: Lesgids) {
  zetTestAntwoord(v.testAntwoord);
  await l.zeg(...alsEenBlok(v).vraag);
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

/** Wat een les aan `squlaBegin` geeft. */
export type SqulaBeginOpties = {
  /** De eigen zin van deze les: waar gaat de les over? Verplicht, nooit een standaardzin. */
  welkom: string[];
  /** Zin 2 van het beginscherm (BOUWREGELS 4.4): vraagt of het kind dit al kan, per les anders. Zonder: "Kun je dit al?". */
  vraag?: string;
  /** De korte uitleg na "Nee". */
  uitleg: () => Promise<void>;
  /**
   * Zet een echte opgave uit deze les in het vlak, zonder dat het kind iets
   * hoeft te doen (niets actief). Staat er vóór en tijdens de zin en bij Ja/Nee.
   */
  voorbeeld?: () => void;
};

/** De vraag aan het eind van het welkom: de enige vaste zin. */
export const KUN_JE_DIT_AL = "Kun je dit al?";

/**
 * Zinnen die te algemeen zijn om als eigen zin te tellen (ze zeggen niet waar
 * de les over gaat). Staat het welkom alleen uit zulke zinnen, dan is het een
 * standaardzin.
 */
const STANDAARDZINNEN = [
  /^(hoi|hallo|hee|hey)[!.,]?( \{?naam\}?)?[!.]?$/i,
  /^(we gaan|laten we) (beginnen|oefenen|starten|rekenen)[!.]?$/i,
  /^(daar gaan we|klaar\?|ben je er klaar voor\?|kom maar op)[!.]?$/i,
  /^(in deze les|vandaag) (gaan we|ga je) (oefenen|rekenen)[!.]?$/i,
  /^(goed|mooi|fijn)[!.]?$/i,
  /^nu jij[!.]?$/i,
];

/** Klopt het welkom? Geeft de reden als het niet klopt. */
export function welkomFout(welkom: readonly string[] | undefined): string | null {
  const zinnen = (welkom ?? []).map((z) => (z ?? "").trim()).filter(Boolean);
  if (!zinnen.length) return "deze les heeft geen eigen zin (welkom is leeg)";
  if (zinnen.some((z) => /kun je dit al/i.test(z))) return `"${KUN_JE_DIT_AL}" zegt squlaBegin zelf; zet het niet in welkom`;
  if (zinnen.every((z) => STANDAARDZINNEN.some((r) => r.test(z.replace(/[{}*]/g, ""))))) return `"${zinnen.join(" ")}" is een standaardzin; zeg waar deze les over gaat`;
  return null;
}

/**
 * Het beginscherm "Kun je dit al?" (zie de uitleg bovenaan dit bestand).
 * Ja = meteen oefenen; Nee = de korte uitleg (`uitleg`) en dan "Nu jij!".
 */
export async function squlaBegin(l: Lesgids, o: SqulaBeginOpties) {
  const fout = welkomFout(o.welkom);
  if (fout) {
    /* Tijdens ontwikkelen stopt de les (de speelcontrole ziet dat); online praat Bliepo gewoon door. */
    if (process.env.NODE_ENV !== "production") throw new Error(`squlaBegin: ${fout} (BOUWREGELS 4.3).`);
    console.error(`squlaBegin: ${fout} (BOUWREGELS 4.3).`);
  }
  const welkom = o.welkom.filter((z) => z && z.trim());
  if (typeof window !== "undefined") window.__phaser = { ...window.__phaser, begin: { welkom, voorbeeld: !!o.voorbeeld } };
  if (o.voorbeeld) {
    o.voorbeeld();
    /* De eigen zin en de vraag als één tekst: zo blijft bij Ja en Nee staan waar de les over gaat. */
    await l.zeg([...welkom, o.vraag ?? KUN_JE_DIT_AL].join(" "));
  } else {
    if (process.env.NODE_ENV !== "production") console.warn("squlaBegin: deze les heeft nog geen voorbeeld in beeld (BOUWREGELS 4.1).");
    await l.zeg(...welkom, o.vraag ?? KUN_JE_DIT_AL);
  }
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
