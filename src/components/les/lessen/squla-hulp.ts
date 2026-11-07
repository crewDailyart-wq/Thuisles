/**
 * De vaste hulp van Bliepo in alle lessen naar Squla (30 oktober 2026, opdracht
 * eigenaar): PRECIES zoals de Synthesis-lessen (verhaaltjessommen, klokkijken)
 * en de drie voorbeeldlessen (squla-huisnummers, squla-rekentaal, squla-dagen).
 *
 *   1. Bliepo stelt de vraag; het kind antwoordt.
 *   2. Goed: geluidje, "Goed zo." + waarom het klopt.
 *   3. Eerste keer fout: een reactie die past bij deze vraag en dit antwoord, met een hint
 *      zonder het antwoord (BOUWREGELS 5.11), en meteen opnieuw proberen.
 *   4. Tweede keer fout: uitleg, het goede antwoord laten zien en door naar de volgende
 *      opgave (de vraag kan later nog eens terugkomen). Nooit een keuzevraag, nooit een
 *      pauze, de les stopt niet.
 *
 * Een les gebruikt `squlaVraag` voor elke opgave, `squlaBegin` voor het
 * welkom met "Kun je dit al?" en `squlaEind` voor de kaart aan het eind.
 *
 * ---------------------------------------------------------------------------
 * HET BEGINSCHERM (3 november 2026)
 * ---------------------------------------------------------------------------
 * De 135 actieve Squla-lessen gebruiken hun eigen twee zinnen uit beginzinnen.json.
 * Het voorbeeld staat vóór en tijdens de vraag in beeld. Ja begint de opgaven.
 * Nee geeft een gevarieerde aanmoediging en start `samen`: uitleg bij het beeld,
 * een kindhandeling, wachten op het antwoord en pas daarna bevestigen.
 * `voordoen` zet de visuele uitleg van de eerste vraag klaar vóór de kindhandeling.
 * Die begeleide oefening telt niet mee voor de beoordeling van zelfstandig werk.
 * Zonder canonieke beginzinnen en `samen` blijft de bestaande uitleg behouden.
 */

import type { Lesgids } from "../soort";
import { beginzinnen } from "@/lib/lessen/beginzinnen";
import { speelLesgeluid } from "@/lib/lesgeluiden";
import { begeleideVraag, isBegeleideUitleg, laatZienZin, naamMag, opener, samenOefenen, uitlegVoorVraag } from "./squla-uitleg";

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
  /**
   * Hulp zoals Synthesis (BOUWREGELS 5.1 en 5.10, 4 november 2026): na één fout een korte reactie die past bij wat
   * het kind koos (+ een hint als die bij de vraag past) en meteen opnieuw; na de tweede fout uitleg, het goede antwoord
   * laten zien en door naar de volgende opgave. Geen keuzevraag, geen pauze, geen vaste "Niet helemaal".
   */
  synthesis?: boolean;
  /** Eerste fout: wat Bliepo zegt over het gekozen antwoord (en de hint). Zonder: de tip van de vraag. */
  reactie?: (x: T) => string[];
  /** Tweede fout: het goede antwoord in beeld en in woorden, zonder de vraag nog eens te stellen. */
  toonAntwoord?: () => Promise<void>;
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
  l.opdracht?.(alsEenBlok(v).vraag.join(" "));
  await l.zeg(...alsEenBlok(v).vraag);
}

/** Eén opgave met de hulp van Bliepo. Geeft `true` als hij meteen goed was. */
export async function squlaVraag<T>(l: Lesgids, v: SqulaVraag<T>): Promise<boolean> {
  if (isBegeleideUitleg(l)) {
    l.opdracht?.(alsEenBlok(v).vraag.join(" "));
    return begeleideVraag(l, v);
  }
  /* Alle lessen gebruiken de hulp van Synthesis. De oude route ("Niet helemaal", keuzevraag, pauze) is weg (Sara, 6 november 2026). */
  return synthesisVraag(l, v);
}

/**
 * De hulp van Synthesis (BOUWREGELS 5.1): goed = door; eerste fout = reactie (+ hint) en meteen opnieuw; tweede fout =
 * uitleg, het goede antwoord laten zien en door naar de volgende opgave (geeft dan `false`, zodat de vraag later
 * nog eens terug kan komen). Nooit een keuzevraag, nooit een pauze, de les stopt niet.
 */
async function synthesisVraag<T>(l: Lesgids, v: SqulaVraag<T>): Promise<boolean> {
  v.toon?.();
  await vraagStellen(v, l);
  for (let poging = 1; ; poging++) {
    const x = await v.antwoord();
    if (v.isGoed(x)) {
      speelLesgeluid("goed");
      await v.goed(x);
      return poging === 1;
    }
    speelLesgeluid("mis");
    v.fout?.(x);
    if (poging === 1) {
      await l.zeg(...[opener(), ...(v.reactie ? v.reactie(x) : v.tip)].filter(Boolean));
      zetTestAntwoord(v.testAntwoord);
      continue;
    }
    await uitlegVoorVraag(l, v.samen);
    await v.toonAntwoord?.();
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
  /** De echte opdracht in kleine stappen oefenen, zonder een score toe te kennen. */
  samen?: () => Promise<unknown>;
  /** Zet eerst de bijbehorende visuele rekensteun klaar. */
  voordoen?: boolean;
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
 * Ja = meteen oefenen; Nee = begeleid oefenen (`samen`), met `uitleg` als oude terugvalroute.
 * Geeft true nadat `samen` volledig is afgerond. De les slaat alleen een identieke eerste opgave over.
 */
export async function squlaBegin(l: Lesgids, o: SqulaBeginOpties): Promise<boolean> {
  l.opdracht?.(null);
  const opening = beginzinnen(l.lesId);
  if (opening) o = { ...o, welkom: [opening.zin1], vraag: opening.zin2 };
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
    return false;
  }
  if (opening && o.samen) {
    const start = ["We doen het samen, stap voor stap.", "Ik help je op weg.", "We bekijken eerst een voorbeeld.", "Laten we het samen uitzoeken."];
    const index = [...(l.lesId ?? "")].reduce((n, c) => n + c.charCodeAt(0), 0) % start.length;
    await l.zeg(start[index]);
    await samenOefenen(l, o.samen, o.voordoen);
    await l.zeg("Nu ga je verder met oefenen.");
    return true;
  } else {
    await l.zeg("Geen probleem.", "Ik leg het kort uit.");
    await o.uitleg();
    await l.zeg("Nu jij!");
  }
  return false;
}

/** De kaart aan het eind, met een compliment. */
export async function squlaEind(l: Lesgids, fouten: number, wat: string) {
  l.opdracht?.(null);
  const tik = l.kaart();
  speelLesgeluid("kaart");
  const naam = l.naam && naamMag(l) ? l.naam : undefined;
  await l.zeg(fouten === 0 ? (naam ? `Alles goed, ${naam}!` : "Alles goed!") : naam ? `Goed gewerkt, ${naam}!` : "Goed gewerkt!", wat);
  await tik;
}
