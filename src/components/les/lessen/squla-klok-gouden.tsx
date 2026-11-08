/**
 * DE GOUDEN KLOKLES (8 november 2026, opdracht Sara; BOUWREGELS hoofdstuk 15).
 *
 *   squla-klok-hoelaat-1-gouden — een NIEUWE les naast squla-klok-hoelaat-1. De oude les blijft precies zoals hij was,
 *   zodat Sara ze kan vergelijken.
 *
 * Inhoud: die van squla-klok-hoelaat-1 (Squla groep 3, Klokkijken, "Hoe laat is het?" level 1: hele uren lezen). Dezelfde
 * 13 klokken, dezelfde tijden, dezelfde keuzes, dezelfde zinnen van de bezorgbus, de zon, de maan en de bakkerij, en
 * dezelfde weetjes. Geen eigen vragen erbij.
 *
 * Verloop: het draaiboek klokkijken (SYNTHESIS-ANALYSE/DRAAIBOEKEN.md §1.1, Hour Hand Hunt), stap voor stap, met eigen
 * Nederlandse zinnen ("3 uur", "de kleine wijzer", "de grote wijzer") en de besluiten van Sara in BOUWREGELS.md
 * (2e ronde van 8 november). Elke stap in de code heeft het nummer van de stap in het draaiboek. Waar het draaiboek
 * en een besluit botsen, of een besluit nog open staat (T15–T30), is de veiligste lezing gekozen; elke keuze staat in
 * KEUZES-VOOR-SARA.md, "Ronde 12 — de gouden klokles".
 *
 * De hulp bij een keuzevraag (BOUWREGELS 5.1, besluit 9, 2e ronde):
 *   - goed in 1 keer: goed-geluidje, groen scherm van Bliepo, een korte lofzin uit het vaste rijtje, vanzelf door;
 *   - 1e fout: geen fout-geluidje, rood scherm van Bliepo, knoppen weg, een reactie die past bij wat het kind koos
 *     + een hint in beeld; Bliepo wacht op de blauwe pijl (zoals Synthesis), dan dezelfde vraag opnieuw;
 *   - 2e fout: uitleg (waar je op moet letten), zonder het antwoord; wacht op de pijl; dan de 3e poging;
 *   - 3e fout: Bliepo doet het samen voor: een ring om het goede getal, het antwoord in woorden, en het kind tikt zelf
 *     het goede antwoord aan (de kleine stap); daarna gaat de les gewoon verder. Nooit stoppen.
 *   - goed na een fout: alleen een korte bevestiging.
 *
 * Niets van Synthesis overgenomen: geen tekst, beeld, geluid of code. Alleen het verloop (wat er wanneer gebeurt).
 */

import type { Lesdraaiboek, Lesgids } from "../soort";
import { GoudenKlok, type GoudenKlokProps, type GoudenNaspeel, type GoudenWijzer } from "../vlakken/squla-klok-gouden-vlak";
import { KaartKlok } from "../vlakken/squla-klok-vlak";
import { squlaEind, zetTestAntwoord } from "./squla-hulp";
import { speelLesgeluid } from "@/lib/lesgeluiden";
import { bliepoScherm } from "@/lib/bliepo-scherm";

/* ---------- tijd ---------- */

/** Minuten vanaf 12 uur. */
const u = (uur: number, minuut = 0) => (uur % 12) * 60 + minuut;
const achterkant = (n: number) => ((n + 5) % 12) + 1;

/* ---------- het vlak ---------- */

const zet = (l: Lesgids, p: Partial<GoudenKlokProps>) => l.pasVlakAan<GoudenKlokProps>(p);

/** Wat de les onthoudt terwijl hij loopt. */
type Staat = { lof: number; bevestig: number; snel: number; pijlUitgelegd: boolean; goed: number; rondje: number; speel: number; haak: number; vraag: number; log: unknown[] };
const STAAT = new WeakMap<Lesgids, Staat>();
const st = (l: Lesgids): Staat => {
  let s = STAAT.get(l);
  if (!s) STAAT.set(l, (s = { lof: 0, bevestig: 0, snel: 0, pijlUitgelegd: false, goed: 0, rondje: 0, speel: 0, haak: 0, vraag: 0, log: [] }));
  return s;
};

/**
 * Een klein logboek voor de eigen test (window.__gouden): welke stap, wanneer de vraag klaar was, wanneer het kind
 * tikte en wanneer Bliepo reageerde. Verandert niets aan de les.
 */
function log(l: Lesgids, wat: string, extra: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const s = st(l);
  const regel = { t: Math.round(performance.now()), wat, ...extra };
  s.log.push(regel);
  (window as unknown as { __gouden?: unknown[] }).__gouden = s.log;
}

/** Voor de speelcontrole (scripts/speelcontrole.mjs): wat de les nu vraagt. */
function haak(l: Lesgids, info: Record<string, unknown> | null, nieuw = false) {
  if (typeof window === "undefined") return;
  const s = st(l);
  if (nieuw) s.vraag++;
  window.__phaser = { ...window.__phaser, klokTaak: info ? { ...info, n: ++s.haak, v: s.vraag } : null };
}

/* ---------- vaste korte zinnen (BOUWREGELS 3.13, 5.11 punt 6; besluit 7, 8, 13, 2e ronde; welke precies: T19) ---------- */

const LOF = ["Klopt!", "Precies!", "Heel goed!", "Goed zo!", "Ja, goed!"];
const BEVESTIG = ["Ja.", "Zo is het.", "Nu klopt het."];
const SNEL = ["Dat ging snel!", "Wat snel!"];
const lof = (l: Lesgids) => LOF[st(l).lof++ % LOF.length];
const bevestig = (l: Lesgids) => BEVESTIG[st(l).bevestig++ % BEVESTIG.length];
/** Hoe snel telt als "heel snel" (T25): binnen 1,5 seconde na het einde van de vraag, alleen in het oefenblok. */
const SNEL_MS = 1500;
/** "Denken" na een tik, vóór Bliepo reageert (BOUWREGELS 6.10a: 0,2 tot 0,4 seconde). */
const DENK_MS = 200;
/** Vanzelf door na een zin die niet op de pijl wacht (draaiboek §1.5: 0,5 tot 0,7 s; zeg() zelf wacht al 0,3 s). */
const DOOR_MS = 300;
/** Bij een opdracht (tikken, zetten): na zoveel stilte komt vanzelf een aanwijzing (BOUWREGELS 6.10b: 5 à 6 s). */
const AANWIJZING_MS = 5500;

/** De goede antwoorden staan niet steeds op dezelfde plek (BOUWREGELS 1.23): elke les-start een andere volgorde. */
function schud<T>(lijst: T[]): T[] {
  const a = [...lijst];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * De blauwe pijl (BOUWREGELS 6.9). De eerste keer in deze les zegt Bliepo wat hij doet (3.15, 2e ronde: knoppen
 * alleen de eerste keer uitleggen; per les, T29). Daarna nooit meer.
 */
async function pijl(l: Lesgids) {
  const s = st(l);
  log(l, "pijl");
  const p = l.verder();
  if (!s.pijlUitgelegd) {
    s.pijlUitgelegd = true;
    await l.zeg("Klaar met kijken? Tik dan op de blauwe pijl.");
  }
  await p;
  log(l, "pijl-getikt");
}

/** Een keuze tonen terwijl Bliepo de vraag zegt (de knoppen komen tegelijk met de vraag, draaiboek §1). */
async function vraagMetKnoppen(l: Lesgids, opties: string[], zinnen: string[]): Promise<{ x: string; snel: boolean }> {
  const p = l.kies(opties, { direct: true, weetniet: false });
  log(l, "vraag", { zin: zinnen.join(" "), opties });
  const gezegd = l.zeg(...zinnen).then(() => "gezegd" as const);
  const eerst = await Promise.race([gezegd, p.then(() => "getikt" as const)]);
  const vraagKlaar = eerst === "gezegd" ? performance.now() : null;
  if (vraagKlaar) log(l, "vraag-klaar");
  const x = (await p) ?? "";
  const nu = performance.now();
  log(l, "tik", { x, naVraag: vraagKlaar ? Math.round(nu - vraagKlaar) : -1 });
  return { x, snel: vraagKlaar === null || nu - vraagKlaar < SNEL_MS };
}

type Uitkomst = "goed" | "naFout" | "voorgedaan";

type Keuzevraag = {
  opties: string[];
  goed: string;
  /** De vraag (eerste keer). */
  vraag: string[];
  /** De vraag bij de 2e en 3e poging (anders dezelfde). */
  opnieuw?: string[];
  /** Extra zinnen na de lof of de bevestiging (het antwoord of een weetje). */
  naGoed?: string[];
  /** Wat er in beeld gebeurt bij goed (de bus rijdt, het getal kleurt). */
  bijGoed?: () => void;
  /** 1e fout: een reactie op wat het kind koos + een hint in beeld. Daarna wacht Bliepo op de pijl. */
  fout1: (x: string) => Promise<void>;
  /** 2e fout: uitleg zonder het antwoord. Daarna wacht Bliepo op de pijl. */
  fout2: (x: string) => Promise<void>;
  /** 3e fout: samen voordoen (ring om het goede getal, het antwoord in woorden). */
  voordoen: () => Promise<void>;
  /** De kleine stap na het voordoen: alleen de goede knop staat er, het kind tikt hem zelf aan. */
  kleineStap: string[];
  /** Het beeld weer rustig zetten na een hint (vóór de volgende poging). */
  opruimen?: () => void;
  /** Een heel snel antwoord krijgt een korte opmerking (alleen in het oefenblok, T25). */
  snel?: boolean;
  /** De keuzes niet door elkaar (Ja/Nee). */
  vast?: boolean;
};

/** Een keuzevraag met de hulp van de 2e ronde (zie bovenaan). */
async function keuze(l: Lesgids, o: Keuzevraag): Promise<Uitkomst> {
  const opties = o.vast ? o.opties : schud(o.opties);
  for (let poging = 1; poging <= 3; poging++) {
    zetTestAntwoord(o.goed);
    haak(l, { soort: "kies", opties, goed: o.goed, poging }, poging === 1);
    const { x, snel } = await vraagMetKnoppen(l, opties, poging === 1 ? o.vraag : (o.opnieuw ?? o.vraag));
    haak(l, null);
    await l.wacht(DENK_MS);
    if (x === o.goed) {
      speelLesgeluid("goed");
      bliepoScherm("goed");
      zet(l, { goed: ++st(l).goed });
      o.bijGoed?.();
      const zinnen = [poging === 1 ? lof(l) : bevestig(l), ...(o.naGoed ?? [])];
      if (poging === 1 && o.snel && snel) zinnen.push(SNEL[st(l).snel++ % SNEL.length]);
      log(l, "reactie", { soort: poging === 1 ? "goed" : "goed-na-fout", zin: zinnen.join(" ") });
      await l.zeg(...zinnen);
      await l.wacht(DOOR_MS);
      return poging === 1 ? "goed" : "naFout";
    }
    /* Geen fout-geluidje en geen rood op de keuze; alleen Bliepo's scherm kleurt rood (BOUWREGELS 5.3). */
    bliepoScherm("fout");
    log(l, "reactie", { soort: `fout${poging}` });
    if (poging === 1) {
      await o.fout1(x);
      await pijl(l);
      o.opruimen?.();
    } else if (poging === 2) {
      await o.fout2(x);
      await pijl(l);
      o.opruimen?.();
    }
  }
  /* Na de 3e fout: samen voordoen, de kleine stap, en door (BOUWREGELS 5.1, 5.4). */
  await o.voordoen();
  zetTestAntwoord(o.goed);
  haak(l, { soort: "kies", opties: [o.goed], goed: o.goed, poging: 4 });
  const p = l.kies([o.goed], { direct: true, weetniet: false });
  log(l, "kleine-stap");
  await l.zeg(...o.kleineStap);
  await p;
  haak(l, null);
  await l.wacht(DENK_MS);
  speelLesgeluid("goed");
  bliepoScherm("goed");
  zet(l, { goed: ++st(l).goed });
  o.bijGoed?.();
  await l.wacht(700);
  log(l, "voorgedaan-klaar");
  return "voorgedaan";
}

/**
 * Een vraag om rond te kijken (draaiboek stap 4, 11 en 18): Synthesis geeft hier geen 2e poging. Goed = kort bevestigen
 * en vanzelf door; fout = met begrip uitleggen hoe het zit, wachten op de pijl, en door. Telt niet als fout.
 */
async function kijkvraag(l: Lesgids, o: { opties: string[]; goed: string; vraag: string[]; goedZin: string[]; foutZin: (x: string) => string[]; naFout?: () => void; vast?: boolean; pijlBijGoed?: boolean }): Promise<boolean> {
  const opties = o.vast ? o.opties : schud(o.opties);
  zetTestAntwoord(o.goed);
  haak(l, { soort: "kies", opties, goed: o.goed, poging: 1 }, true);
  const { x } = await vraagMetKnoppen(l, opties, o.vraag);
  haak(l, null);
  await l.wacht(DENK_MS);
  if (x === o.goed) {
    speelLesgeluid("goed");
    bliepoScherm("goed");
    zet(l, { goed: ++st(l).goed });
    log(l, "reactie", { soort: "goed", zin: o.goedZin.join(" ") });
    await l.zeg(...o.goedZin);
    if (o.pijlBijGoed) await pijl(l);
    else await l.wacht(DOOR_MS);
    return true;
  }
  bliepoScherm("fout");
  log(l, "reactie", { soort: "fout-kijkvraag" });
  o.naFout?.();
  await l.zeg(...o.foutZin(x));
  await pijl(l);
  return false;
}

/**
 * Een opdracht op de klok: zet de kleine wijzer op een getal (draaiboek stap 14). De opdracht staat bovenaan en blijft
 * staan tijdens de hulp (BOUWREGELS 14.32). Doet het kind 5,5 s niets, dan komt vanzelf een aanwijzing (6.10b).
 * Fout getal: de wijzer gaat er wel heen; 1e fout = reactie, 2e fout = uitleg, 3e fout = samen voordoen en het kind
 * tikt zelf het goede getal (alleen dat getal werkt nog).
 */
async function zetUur(l: Lesgids, doel: number): Promise<Uitkomst> {
  const kop = `Kleine wijzer naar de ${doel}`;
  zet(l, { doel: kop, ring: doel, ringWijzer: "uur", ringPuls: false, licht: "uur", minuutwijzer: "fel", uurwijzer: "fel" });
  for (let poging = 1; poging <= 4; poging++) {
    const kleineStap = poging === 4;
    haak(l, { soort: "uur", doel, poging, ...(kleineStap ? { alleen: true } : {}) }, poging === 1);
    zet(l, { actief: true, beweegbaar: true, alleenGetal: kleineStap ? doel : null });
    const melding = l.wachtOpVlak<{ soort: string; tijd: number }>("gezet");
    let gedaan = false;
    let aanwijzing: ReturnType<typeof setTimeout> | undefined;
    if (poging === 1) {
      log(l, "vraag", { zin: `Zet de kleine wijzer op de ${doel}.` });
      await Promise.race([l.zeg(`Zet de kleine wijzer op de {${doel}:oranje}.`), melding]);
      log(l, "vraag-klaar");
      /* Aanwijzing na 5,5 s stilte, één keer, en alleen bij de eerste poging (daarna praat Bliepo al over de fout). */
      aanwijzing = setTimeout(() => {
        if (gedaan) return;
        log(l, "aanwijzing");
        void l.zeg(`Tik op de {${doel}:oranje}, of sleep de kleine wijzer erheen.`);
      }, AANWIJZING_MS);
    }
    const g = await melding;
    gedaan = true;
    clearTimeout(aanwijzing);
    const getal = Math.round(g.tijd / 60) % 12 || 12;
    log(l, "tik", { x: getal });
    zet(l, { actief: false });
    haak(l, null);
    await l.wacht(DENK_MS + 300);
    if (getal === doel) {
      speelLesgeluid("goed");
      if (!kleineStap) bliepoScherm("goed");
      zet(l, { goed: ++st(l).goed, ring: null, getalKleur: { n: doel, wijzer: "uur" }, rondje: ++st(l).rondje, doel: null });
      log(l, "reactie", { soort: poging === 1 ? "goed" : kleineStap ? "voorgedaan" : "goed-na-fout" });
      if (poging > 1 && !kleineStap) await l.zeg(bevestig(l));
      await l.wacht(1200);
      return poging === 1 ? "goed" : kleineStap ? "voorgedaan" : "naFout";
    }
    bliepoScherm("fout");
    log(l, "reactie", { soort: `fout${poging}` });
    if (poging === 1) await l.zeg(`Nu wijst hij naar de ${getal}.`, `De ring staat om de {${doel}:oranje}.`);
    else if (poging === 2) await l.zeg(`Kijk naar de ring.`, `Daar staat de {${doel}:oranje}.`, "Zet de punt van de kleine wijzer bij dat getal.");
    else {
      zet(l, { ringPuls: true });
      await l.zeg(`We doen het samen.`, `Hier is de {${doel}:oranje}, in de ring.`, `Tik op de {${doel}:oranje}.`);
    }
  }
  return "voorgedaan";
}

/* ---------- de 13 klokken van squla-klok-hoelaat-1 (inhoud ongewijzigd) ---------- */

type Klok = {
  uur: number;
  opties: number[];
  /** Het verhaal: de zin van de oude les (de vraag "Hoe laat is het?" komt erachter). */
  zin: string;
  ding: "bezorgbus" | "zon" | "maan" | "bakkerij";
  plek: "naast" | "hoog" | "laag" | "sfeer";
  naspeel?: GoudenNaspeel;
  weetje?: string;
};

/*
  Squla "Hoe laat is het?" level 1 (SQULA-ANALYSE/klokkijken-15822): de uren 1, 12, 1, 4 en 11, en daarna de 8 extra
  vragen van dezelfde soort die al in squla-klok-hoelaat-1 staan (KEUZES-VOOR-SARA.md, ronde 6). Tijden, keuzes, zinnen,
  plaatjes en weetjes zijn precies die van de oude les.
*/
const KLOKKEN: Klok[] = [
  { uur: 1, opties: [1, 9, 8], zin: "De bezorgbus staat klaar bij de bakkerij.", ding: "bezorgbus", plek: "naast", naspeel: "laden" },
  { uur: 12, opties: [12, 10, 11], zin: "De zon staat hoog. De bus rijdt weg.", ding: "zon", plek: "hoog" },
  { uur: 1, opties: [2, 12, 1], zin: "De bus rijdt weer terug.", ding: "bezorgbus", plek: "naast", naspeel: "rijden" },
  { uur: 4, opties: [6, 4, 5], zin: "De zon staat al lager.", ding: "zon", plek: "laag" },
  { uur: 11, opties: [11, 7, 8], zin: "De bus haalt nieuwe broodjes bij de bakkerij.", ding: "bakkerij", plek: "sfeer" },
  { uur: 7, opties: [7, 11, 6], zin: "De bezorgbus staat klaar bij de bakkerij.", ding: "bezorgbus", plek: "naast", naspeel: "laden", weetje: "Vroeg in de ochtend begint de dag." },
  { uur: 8, opties: [8, 9, 1], zin: "De bezorgbus vertrekt.", ding: "bezorgbus", plek: "naast", naspeel: "wegrijden" },
  { uur: 9, opties: [9, 3, 10], zin: "De zon schijnt. De bus rijdt naar de eerste halte.", ding: "zon", plek: "sfeer", weetje: "De zon schijnt overdag." },
  { uur: 10, opties: [10, 2, 11], zin: "De bus komt bij de eerste halte.", ding: "bezorgbus", plek: "naast", naspeel: "rijden" },
  { uur: 2, opties: [2, 10, 1], zin: "De bus rijdt weer weg.", ding: "bezorgbus", plek: "naast", naspeel: "wegrijden" },
  { uur: 3, opties: [3, 9, 4], zin: "De bus komt bij de tweede halte.", ding: "bezorgbus", plek: "naast", naspeel: "rijden" },
  { uur: 5, opties: [5, 4, 11], zin: "De bus is terug bij de bakkerij.", ding: "bakkerij", plek: "sfeer" },
  { uur: 6, opties: [6, 5, 12], zin: "Het wordt donker. De maan komt op.", ding: "maan", plek: "sfeer", weetje: "De maan zie je als het donker wordt." },
];

/** Waar de kleine wijzer staat, in gewone woorden (een hint zonder het getal te noemen; uit de oude les). */
function plekKleineWijzer(n: number): string {
  const k = n % 12;
  if (k === 0) return "bovenaan";
  if (k === 6) return "onderaan";
  if (k === 3) return "rechts";
  if (k === 9) return "links";
  if (k < 3) return "rechtsboven";
  if (k < 6) return "rechtsonder";
  if (k < 9) return "linksonder";
  return "linksboven";
}

/** De 1e fout bij een klok in het oefenblok: een reactie op wat het kind koos (BOUWREGELS 5.10, 5.11). */
function reactieOpKlok(gekozen: number, uur: number): string[] {
  if (gekozen === 12) return ["De {12:paars} hoort bij de grote wijzer.", "Het uur zie je aan de kleine wijzer."];
  if (gekozen === achterkant(uur)) return [`Ik snap waarom je de ${gekozen} koos: daar wijst de achterkant van de kleine wijzer heen.`, "Kijk naar de punt."];
  /* Uit de oude les (reactieLees): wat er bij de gekozen tijd hoort, en waar de kleine wijzer nu staat. */
  return [`Bij {${gekozen}:oranje} uur wijst de kleine wijzer naar de {${gekozen}:oranje}.`, `Op deze klok wijst de kleine wijzer ${plekKleineWijzer(uur)}. Kijk naar het getal daar.`];
}

/** Eén klok uit het oefenblok (draaiboek stap 19): de wijzers draaien naar de tijd, dan de vraag met het verhaal. */
async function oefenKlok(l: Lesgids, k: Klok, proef = false): Promise<Uitkomst> {
  const s = st(l);
  zet(l, { ring: null, licht: null, uurwijzer: "fel", minuutwijzer: "fel", getalKleur: null, driehoek: null, pijl: null, verhaal: { naam: k.ding, plek: k.plek, ...(k.naspeel ? { naspeel: k.naspeel } : {}), speel: s.speel } });
  zet(l, { stand: { tijd: u(k.uur), draai: true } });
  await l.wacht(1100);
  const naspelen = () => {
    if (k.naspeel) zet(l, { verhaal: { naam: k.ding, plek: k.plek, naspeel: k.naspeel, speel: ++s.speel } });
  };
  const goed = `${k.uur} uur`;
  const vraag = [`${k.zin} Hoe laat is het?`];
  if (proef) {
    /* De korte proef na "Ja" (besluit 12, 2e ronde): geen hulp, een fout = eerst samen uitleggen. */
    zetTestAntwoord(goed);
    haak(l, { soort: "kies", opties: k.opties.map((n) => `${n} uur`), goed, poging: 1 }, true);
    const { x } = await vraagMetKnoppen(l, schud(k.opties.map((n) => `${n} uur`)), vraag);
    haak(l, null);
    await l.wacht(DENK_MS);
    if (x === goed) {
      speelLesgeluid("goed");
      bliepoScherm("goed");
      zet(l, { goed: ++s.goed });
      naspelen();
      await l.zeg(lof(l), ...(k.weetje ? [k.weetje] : []));
      await l.wacht(DOOR_MS);
      return "goed";
    }
    bliepoScherm("fout");
    return "voorgedaan";
  }
  return keuze(l, {
    opties: k.opties.map((n) => `${n} uur`),
    goed,
    vraag,
    opnieuw: ["Hoe laat is het?"],
    naGoed: k.weetje ? [k.weetje] : [],
    bijGoed: naspelen,
    snel: true,
    fout1: async (x) => {
      /* Hint in beeld: de kleine wijzer licht op, de grote wordt vaag. De vraag verdwijnt tijdens de hint (14.32). */
      zet(l, { licht: "uur", minuutwijzer: "flets" });
      await l.zeg(...reactieOpKlok(parseInt(x, 10), k.uur));
    },
    fout2: async () => {
      /* Uitleg zonder het antwoord: eerst de grote wijzer, dan de kleine (uit de oude les, samenLees). */
      zet(l, { licht: "minuut", minuutwijzer: "fel", uurwijzer: "flets" });
      await l.zeg("Kijk eerst naar de grote wijzer.", "Die staat op de {12:paars}. Dan is het een heel uur.");
      zet(l, { licht: "uur", minuutwijzer: "flets", uurwijzer: "fel" });
      await l.zeg("Kijk nu naar de punt van de kleine wijzer.", "Het getal bij die punt is het uur.");
    },
    voordoen: async () => {
      zet(l, { licht: "uur", minuutwijzer: "flets", uurwijzer: "fel", ring: k.uur, ringWijzer: "uur" });
      await l.zeg(`We doen het samen. De kleine wijzer wijst naar de {${k.uur}:oranje}.`, `De grote wijzer staat op de {12:paars}. Dus het is {${k.uur}:oranje} uur.`);
      zet(l, { ring: null, getalKleur: { n: k.uur, wijzer: "uur" } });
    },
    kleineStap: [`Tik op {${k.uur}:oranje} uur.`],
    opruimen: () => zet(l, { licht: null, minuutwijzer: "fel", uurwijzer: "fel" }),
  });
}

/* ---------- de les ---------- */

const gouden: Lesdraaiboek = {
  id: "squla-klok-hoelaat-1-gouden",
  titel: "Hoe laat is het? (gouden les)",
  synthesis: "Gouden les · inhoud Squla groep 3 · Klokkijken · Hoe laat is het? · level 1 (squla-klok-hoelaat-1) · verloop draaiboek klokkijken (Hour Hand Hunt)",
  indeling: "synthesis",
  browserstem: true,
  voorwerpen: ["bezorgbus", "zon", "maan", "bakkerij"],
  kaarttekening: KaartKlok,
  async speel(l) {
    STAAT.delete(l);
    log(l, "start");
    l.vlak<GoudenKlokProps>(GoudenKlok, { stand: { tijd: u(3) } });
    speelLesgeluid("verschijn");
    await l.wacht(600);

    /*
      Stap 0–1. Openen en "weet je dit al?". Het draaiboek heeft hier een startvraag; besluit 12 (2e ronde): waar een
      startvraag is, geeft Ja eerst een korte proef. Het uitlegdeel en de persoonlijke vraag volgen BOUWREGELS 4.4.
    */
    log(l, "vraag", { zin: "startvraag" });
    const pStart = l.kies(["Ja", "Nee"], { direct: true, weetniet: false });
    zetTestAntwoord("Nee");
    /* Uitlegdeel en vraag als één tekst, zodat bij Ja en Nee allebei in beeld blijven (zoals squlaBegin). */
    void l.zeg("In deze les lees je op de klok hoe laat het is. Je kijkt naar de wijzers en kiest het hele uur. Weet jij al hoe dat moet?");
    const start = await pStart;
    log(l, "tik", { x: start });
    await l.wacht(DENK_MS);

    let uitleg = start !== "Ja";
    let vanaf = 0;
    if (start === "Ja") {
      /* De korte proef: de eerste 2 klokken van het oefenblok, zonder hulp. Gaat er 1 fout, dan eerst samen uitleggen (T21). */
      await l.zeg("Fijn! Dan kijken we eerst of het lukt.");
      for (const k of KLOKKEN.slice(0, 2)) {
        if ((await oefenKlok(l, k, true)) !== "goed") {
          uitleg = true;
          break;
        }
      }
      if (uitleg) {
        await l.zeg("Dat is nog lastig.", "We gaan het eerst samen bekijken.");
        zet(l, { verhaal: null, getalKleur: null, ring: null, licht: null });
      } else {
        await l.zeg("Mooi, dat kun je al!");
        vanaf = 2;
      }
    }

    if (uitleg) {
      if (start !== "Ja") {
        /* Stap 2. Samen beginnen; de wijzers verdwijnen. Gaat vanzelf door. */
        await l.zeg("Dat geeft niks. We gaan het samen bekijken.");
      }
      await uitlegRoute(l);
    }

    /* Stap 19. Het oefenblok: de 13 klokken van squla-klok-hoelaat-1. */
    const fouten = await oefenblok(l, vanaf);

    /* Stap 21. Afsluiten: één slotzin, dan de kaart. */
    zet(l, { verhaal: null, ring: null, licht: null, getalKleur: null });
    await l.zeg("Nu kun je het uur lezen met de kleine wijzer.");
    log(l, "kaart", { fouten });
    await squlaEind(l, fouten, fouten === 0 ? "Je had alle klokken goed." : "Volgende keer gaat het nog beter.");
  },
};

/** Stap 2 t/m 18 van het draaiboek: de route na "Nee" (en na een mislukte proef). */
async function uitlegRoute(l: Lesgids) {
  zet(l, { stand: { tijd: u(3) }, wijzers: false, verhaal: null });
  await l.wacht(600);

  /* Stap 3. De klok rolt uit tot een getallenlijn. */
  await l.zeg("Kijk eens wat de klok doet.");
  speelLesgeluid("klokDraai");
  zet(l, { vorm: "lijn" });
  await l.wacht(1300);

  /* Stap 4. Hoe heet dit? (geen 2e poging, zoals Synthesis) */
  await kijkvraag(l, {
    opties: ["een getallenlijn", "een klok"],
    goed: "een getallenlijn",
    vraag: ["Weet jij hoe dit heet?"],
    goedZin: ["Ja, een getallenlijn."],
    foutZin: () => ["Nog niet, maar je bent me al een stap voor!", "Dit is nog een getallenlijn: de getallen 1 tot en met 12 op een rij."],
  });

  /* Stap 5. Tik een getal aan; daarna buigt de lijn terug tot een klok. Aanwijzing na 5,5 s stilte (6.10b). */
  haak(l, { soort: "getal", poging: 1 }, true);
  zet(l, { actief: true, tikGetal: true });
  const getikt = l.wachtOpVlak("getal");
  let klaar = false;
  log(l, "vraag", { zin: "Tik op een van de getallen." });
  await Promise.race([l.zeg("Tik op een van de getallen."), getikt]);
  log(l, "vraag-klaar");
  const hint = setTimeout(() => {
    if (klaar) return;
    log(l, "aanwijzing");
    void l.zeg("Kies maar een getal op de lijn en tik erop.");
  }, AANWIJZING_MS);
  await getikt;
  klaar = true;
  clearTimeout(hint);
  log(l, "tik", { x: "getal" });
  haak(l, null);
  zet(l, { actief: false, tikGetal: false });
  speelLesgeluid("klokDraai");
  zet(l, { vorm: "klok" });
  await l.wacht(1500);

  /* Stap 6. En hoe heet dit nu? */
  await keuze(l, {
    opties: ["een klok", "een getallenlijn"],
    goed: "een klok",
    vraag: ["Zo houd je een getallenlijn wel heel raar vast!", "Hoe heet dit nu?"],
    opnieuw: ["Hoe heet dit nu?"],
    naGoed: [],
    fout1: async () => {
      await l.zeg("Kijk: de getallen staan nu in een rondje.");
    },
    fout2: async () => {
      await l.zeg("Een rondje met de getallen 1 tot en met 12 zie je aan de muur.", "Daar kijk je op hoe laat het is.");
    },
    voordoen: async () => {
      await l.zeg("We doen het samen.", "De getallen staan in een rondje. Dat is een klok.");
    },
    kleineStap: ["Tik nu op de knop: een klok."],
  });

  /* Stap 7. Het hoogste punt; het driehoekje komt pas na 4 seconden. */
  let driehoekTijd: ReturnType<typeof setTimeout> | undefined = setTimeout(() => zet(l, { driehoek: 12 }), 4000);
  await keuze(l, {
    opties: ["1", "6", "12"],
    goed: "12",
    vraag: ["Kijk naar het hoogste punt van de klok.", "Welk getal staat daar?"],
    opnieuw: ["Welk getal staat helemaal bovenaan?"],
    naGoed: ["De 12 staat helemaal bovenaan."],
    fout1: async (x) => {
      clearTimeout(driehoekTijd);
      zet(l, { driehoek: 12 });
      await l.zeg(x === "1" ? "De 1 staat hoog, maar kijk nog iets hoger." : "De 6 staat niet bovenaan.", "Kijk waar het driehoekje is.");
    },
    fout2: async () => {
      zet(l, { driehoek: 12 });
      await l.zeg("Het driehoekje wijst naar het hoogste getal.", "Zoek het getal vlak onder het driehoekje.");
    },
    voordoen: async () => {
      zet(l, { driehoek: 12, ring: 12, ringWijzer: "uur" });
      await l.zeg("We doen het samen.", "Kijk, in de ring: de 12 staat helemaal bovenaan.");
      zet(l, { ring: null, getalKleur: { n: 12, wijzer: "uur" } });
    },
    kleineStap: ["Tik op de knop met de 12."],
  });
  clearTimeout(driehoekTijd);
  driehoekTijd = undefined;
  zet(l, { driehoek: null, ring: null, getalKleur: null });

  /* Stap 8. Het laagste punt; het driehoekje springt naar onder de 6 (na 1,5 s). */
  const driehoek6 = setTimeout(() => zet(l, { driehoek: 6 }), 1500);
  await keuze(l, {
    opties: ["3", "6", "12"],
    goed: "6",
    vraag: ["Volg de klok helemaal rond.", "Welk getal staat onderaan?"],
    opnieuw: ["Welk getal staat helemaal onderaan?"],
    naGoed: ["De 6 staat helemaal onderaan."],
    fout1: async (x) => {
      clearTimeout(driehoek6);
      zet(l, { driehoek: 6 });
      await l.zeg(x === "3" ? "Ga verder dan de 3, helemaal naar beneden." : "De 12 staat bovenaan. Ga helemaal naar beneden.");
    },
    fout2: async () => {
      zet(l, { driehoek: 6 });
      await l.zeg("Kijk naar het driehoekje onder de klok.", "Het getal erboven is het laagste getal.");
    },
    voordoen: async () => {
      zet(l, { driehoek: 6, ring: 6, ringWijzer: "uur" });
      await l.zeg("We doen het samen.", "Kijk, in de ring: de 6 staat helemaal onderaan.");
      zet(l, { ring: null, getalKleur: { n: 6, wijzer: "uur" } });
    },
    kleineStap: ["Tik op de knop met de 6."],
  });
  clearTimeout(driehoek6);
  zet(l, { driehoek: null, ring: null, getalKleur: null });

  /* Stap 9. Wat komt na de 6? Met de klok mee. */
  const na6 = await keuze(l, {
    opties: ["5", "7", "8"],
    goed: "7",
    vraag: ["Kijk naar de 6.", "Welk getal komt erna?"],
    opnieuw: ["Welk getal komt na de 6?"],
    bijGoed: () => zet(l, { pijl: { van: 6, naar: 7 } }),
    naGoed: ["Van de 6 ga je deze kant op, naar de 7."],
    fout1: async () => {
      zet(l, { pijl: { van: 6, naar: 7 } });
      await l.zeg("Erna betekent: deze kant op.", "Volg de blauwe pijl vanaf de 6.");
    },
    fout2: async () => {
      zet(l, { pijl: { van: 6, naar: 7 } });
      await l.zeg("Begin bij de 6 en ga 1 getal verder.", "Ga de kant op van de pijl.");
    },
    voordoen: async () => {
      zet(l, { pijl: { van: 6, naar: 7 }, ring: 7, ringWijzer: "uur" });
      await l.zeg("We doen het samen.", "Van de 6 ga je 1 getal verder, naar de 7.");
      zet(l, { ring: null, getalKleur: { n: 7, wijzer: "uur" } });
    },
    kleineStap: ["Tik op de knop met de 7."],
    opruimen: () => zet(l, { pijl: { van: 6, naar: 7 } }),
  });
  if (na6 !== "goed") zet(l, { pijl: { van: 6, naar: 7 } });
  await l.zeg("Deze kant op heet: met de klok mee.");
  await pijl(l);
  zet(l, { pijl: null, getalKleur: null });

  /* Stap 10. Een lastige: na de 12 komt de 1. */
  await keuze(l, {
    opties: ["1", "11", "13"],
    goed: "1",
    vraag: ["Nu een lastige.", "Welk getal komt na de 12?"],
    opnieuw: ["Welk getal komt na de 12?"],
    bijGoed: () => zet(l, { pijl: { van: 12, naar: 1 } }),
    naGoed: ["Na de 12 begint de klok weer bij de 1."],
    fout1: async (x) => {
      if (x === "13") await l.zeg("De 13? Dat snap ik: op een getallenlijn komt de 13 na de 12.", "Maar op deze klok staat geen 13.");
      else await l.zeg("De 11 komt vóór de 12.", "We zoeken het getal erna.");
      zet(l, { pijl: { van: 12, naar: 1 } });
    },
    fout2: async () => {
      zet(l, { pijl: { van: 12, naar: 1 } });
      await l.zeg("Begin bij de 12 en ga met de klok mee.", "Volg de blauwe pijl.");
    },
    voordoen: async () => {
      zet(l, { pijl: { van: 12, naar: 1 }, ring: 1, ringWijzer: "uur" });
      await l.zeg("We doen het samen.", "Na de 12 begint de klok weer opnieuw, bij de 1.");
      zet(l, { ring: null, getalKleur: { n: 1, wijzer: "uur" } });
    },
    kleineStap: ["Tik op de knop met de 1."],
    opruimen: () => zet(l, { pijl: { van: 12, naar: 1 } }),
  });
  zet(l, { pijl: null, getalKleur: null, ring: null });
  await l.wacht(300);

  /* Stap 11. Twee wijzers verschijnen (plopje). Wacht op de pijl. Dan: wat telt de grote wijzer? (geen 2e poging) */
  zet(l, { stand: { tijd: u(1) } });
  await l.wacht(400);
  zet(l, { wijzers: true });
  speelLesgeluid("plop");
  await l.wacht(500);
  await l.zeg("Er staan nu 2 wijzers op de klok.");
  await pijl(l);
  await kijkvraag(l, {
    opties: ["de minuten", "de uren"],
    goed: "de minuten",
    vraag: ["De ene wijzer telt de minuten. De andere wijst het uur aan.", "Wat telt de lange wijzer?"],
    goedZin: ["Ja, de lange wijzer telt de minuten."],
    foutZin: () => ["Dat klinkt logisch: een uur duurt langer dan een minuut.", "Maar op de klok is het andersom.", "De lange wijzer telt de minuten."],
    pijlBijGoed: true,
  });

  /* Stap 12. De namen van de wijzers: de lange licht op, de korte is vaag; daarna andersom. */
  zet(l, { licht: "minuut", uurwijzer: "flets", minuutwijzer: "fel" });
  await keuze(l, {
    opties: ["de grote wijzer", "de kleine wijzer"],
    goed: "de grote wijzer",
    vraag: ["Deze lange paarse wijzer telt de minuten.", "Hoe heet hij?"],
    opnieuw: ["Hoe heet de lange wijzer?"],
    naGoed: ["De grote wijzer is lang."],
    fout1: async () => {
      await l.zeg("De korte wijzer is de kleine wijzer.", "Deze wijzer is lang.");
    },
    fout2: async () => {
      await l.zeg("Kijk hoe lang de paarse wijzer is.", "Een lange wijzer is groot.");
    },
    voordoen: async () => {
      await l.zeg("We doen het samen.", "De lange wijzer heet de grote wijzer.");
    },
    kleineStap: ["Tik nu op de knop: de grote wijzer."],
  });
  zet(l, { licht: "uur", uurwijzer: "fel", minuutwijzer: "flets" });
  await keuze(l, {
    opties: ["de kleine wijzer", "de grote wijzer"],
    goed: "de kleine wijzer",
    vraag: ["En deze korte oranje wijzer?", "Hoe heet die?"],
    opnieuw: ["Hoe heet de korte wijzer?"],
    naGoed: [],
    fout1: async () => {
      await l.zeg("De grote wijzer is de lange.", "Deze wijzer is kort.");
    },
    fout2: async () => {
      await l.zeg("Kijk hoe kort de oranje wijzer is.", "Een korte wijzer is klein.");
    },
    voordoen: async () => {
      await l.zeg("We doen het samen.", "De korte wijzer heet de kleine wijzer.");
    },
    kleineStap: ["Tik nu op de knop: de kleine wijzer."],
  });

  /* Stap 13. De kleine wijzer leest het uur: de grote is vaag; de kleine draait van 1 naar 3 terwijl de vraag klinkt. */
  await l.zeg("Met de kleine wijzer lees je het uur.", "Kijk maar hoe hij werkt.");
  await l.wacht(DOOR_MS);
  for (const [uur, opties, zin] of [
    [3, ["3", "9", "12"], ["Naar welk getal wijst de kleine wijzer?"]],
    [7, ["6", "7", "12"], ["Hij draait weer.", "Waar wijst hij nu?"]],
    [11, ["1", "11", "12"], ["Nog 1 keer.", "Naar welk getal wijst hij nu?"]],
  ] as [number, string[], string[]][]) {
    zet(l, { stand: { tijd: u(uur), draai: true }, licht: "uur", uurwijzer: "fel", minuutwijzer: "flets", getalKleur: null });
    await keuze(l, {
      opties,
      goed: String(uur),
      vraag: zin,
      opnieuw: ["Naar welk getal wijst de kleine wijzer?"],
      naGoed: [],
      fout1: async (x) => {
        if (Number(x) === achterkant(uur)) await l.zeg(`De ${x} snap ik: daar wijst de achterkant van de wijzer heen.`, "Kijk naar de punt van de kleine wijzer.");
        else if (x === "12") await l.zeg("Bij de 12 staat de grote wijzer.", "Kijk naar de kleine wijzer die oplicht.");
        else await l.zeg("Volg de kleine wijzer vanaf het midden tot aan zijn punt.");
      },
      fout2: async () => {
        await l.zeg("Begin in het midden van de klok.", "Ga langs de oranje wijzer naar buiten, tot aan de punt.", "Welk getal staat daar vlakbij?");
      },
      voordoen: async () => {
        zet(l, { ring: uur, ringWijzer: "uur" });
        await l.zeg("We doen het samen.", `De punt van de kleine wijzer staat bij de {${uur}:oranje}.`);
        zet(l, { ring: null, getalKleur: { n: uur, wijzer: "uur" } });
      },
      kleineStap: [`Tik op de knop met de {${uur}:oranje}.`],
    });
  }
  await l.zeg("Je kunt het uur lezen met de kleine wijzer.");
  await l.wacht(DOOR_MS);

  /* Stap 14. Zelf de kleine wijzer verzetten (3 keer). De grote wijzer is weer fel; wacht eerst op de pijl. */
  zet(l, { licht: "minuut", minuutwijzer: "fel", uurwijzer: "fel", getalKleur: null });
  await l.zeg("Nu gaan we kijken wat de grote wijzer doet.");
  await pijl(l);
  zet(l, { licht: null });
  await zetUur(l, 2);
  await l.zeg("Kijk: de grote wijzer wijst recht omhoog, naar de {12:paars}.");
  zet(l, { getalKleur: null });
  await zetUur(l, 3);
  await l.zeg("Weer staat de grote wijzer op de {12:paars}.");
  zet(l, { getalKleur: null });
  await zetUur(l, 6);
  zet(l, { licht: null, getalKleur: null });

  /* Stap 15. Waar wees de grote wijzer? De kleine wijzer is vaag. */
  zet(l, { uurwijzer: "flets", minuutwijzer: "fel" });
  const minuten = await keuze(l, {
    opties: ["6", "12"],
    goed: "12",
    vraag: ["Bij elk nieuw uur: waar wees de grote wijzer?"],
    opnieuw: ["Waar eindigde de grote wijzer?"],
    naGoed: ["Elke keer recht omhoog, naar de {12:paars}."],
    fout1: async () => {
      /* Zoals Synthesis: een extra keer verzetten, en dan goed op de grote wijzer letten. */
      zet(l, { licht: "minuut" });
      await l.zeg("Bij de 6 staat de kleine wijzer.", "Let deze keer goed op de grote wijzer.");
      await pijl(l);
      zet(l, { licht: null, uurwijzer: "fel" });
      await zetUur(l, 7);
      zet(l, { uurwijzer: "flets", licht: "minuut", getalKleur: null });
    },
    fout2: async () => {
      zet(l, { licht: "minuut" });
      await l.zeg("Kijk naar de paarse wijzer.", "Staat hij bovenaan of onderaan?");
    },
    voordoen: async () => {
      zet(l, { licht: "minuut", ring: 12, ringWijzer: "minuut" });
      await l.zeg("We doen het samen.", "De grote wijzer wijst recht omhoog, naar de {12:paars}.");
      zet(l, { ring: null, getalKleur: { n: 12, wijzer: "minuut" } });
    },
    kleineStap: ["Tik op de knop met de {12:paars}."],
  });
  void minuten;
  zet(l, { licht: "minuut", getalKleur: { n: 12, wijzer: "minuut" } });
  await l.zeg("Bij elk heel uur wijst de grote wijzer naar de {12:paars}.", "Dan begint er een nieuw uur.", "Zo'n tijd heet een heel uur.");
  await pijl(l);
  zet(l, { licht: null, uurwijzer: "fel", getalKleur: null });

  /* Stap 16. 3 uur: waar wijst de kleine wijzer, en hoe noemen we deze tijd? */
  zet(l, { stand: { tijd: u(3) } });
  await l.wacht(600);
  await keuze(l, {
    opties: ["3", "9", "12"],
    goed: "3",
    vraag: ["Waar wijst de kleine wijzer nu?"],
    naGoed: [],
    fout1: async (x) => {
      zet(l, { licht: "uur", minuutwijzer: "flets" });
      if (x === "9") await l.zeg("De 9 snap ik: daar wijst de achterkant heen.", "Kijk naar de punt van de kleine wijzer.");
      else await l.zeg("Bij de 12 staat de grote wijzer.", "Kijk naar de kleine wijzer die oplicht.");
    },
    fout2: async () => {
      zet(l, { licht: "uur", minuutwijzer: "flets" });
      await l.zeg("Begin in het midden van de klok.", "Ga langs de oranje wijzer naar buiten, tot aan de punt.");
    },
    voordoen: async () => {
      zet(l, { licht: "uur", ring: 3, ringWijzer: "uur" });
      await l.zeg("We doen het samen.", "De punt van de kleine wijzer staat bij de {3:oranje}.");
      zet(l, { ring: null, getalKleur: { n: 3, wijzer: "uur" } });
    },
    kleineStap: ["Tik op de knop met de {3:oranje}."],
    opruimen: () => zet(l, { licht: null, minuutwijzer: "fel" }),
  });
  zet(l, { licht: null, minuutwijzer: "fel", getalKleur: null });
  await keuze(l, {
    opties: ["3 uur", "12 uur", "9 uur"],
    goed: "3 uur",
    vraag: ["Hoe noemen we deze tijd?"],
    naGoed: [],
    fout1: async (x) => {
      zet(l, { licht: "uur", minuutwijzer: "flets", ring: 3, ringWijzer: "uur" });
      if (x === "12 uur") await l.zeg("De {12:paars} hoort bij de grote wijzer.", "Het uur komt van de kleine wijzer.");
      else await l.zeg("Bij de 9 is de achterkant van de kleine wijzer.", "Het uur staat bij de punt.");
    },
    fout2: async () => {
      zet(l, { licht: "uur", minuutwijzer: "flets", ring: 3, ringWijzer: "uur" });
      await l.zeg("Bij een heel uur zeg je het getal van de kleine wijzer.", "En daarna het woord: uur.");
    },
    voordoen: async () => {
      zet(l, { licht: "uur", ring: 3, ringWijzer: "uur" });
      await l.zeg("We doen het samen.", "De kleine wijzer staat op de {3:oranje}, de grote op de {12:paars}.", "Dus het is {3:oranje} uur.");
      zet(l, { ring: null, getalKleur: { n: 3, wijzer: "uur" } });
    },
    kleineStap: ["Tik op {3:oranje} uur."],
    opruimen: () => zet(l, { licht: null, minuutwijzer: "fel", ring: null }),
  });
  zet(l, { licht: null, minuutwijzer: "fel", ring: null, getalKleur: null });

  /* Stap 17. 6 uur. */
  zet(l, { stand: { tijd: u(6), draai: true } });
  await l.wacht(1300);
  await keuze(l, {
    opties: ["6 uur", "12 uur", "6 minuten"],
    goed: "6 uur",
    vraag: ["Hoe laat is het nu?"],
    naGoed: [],
    fout1: async (x) => {
      zet(l, { licht: "uur", minuutwijzer: "flets" });
      if (x === "6 minuten") await l.zeg("Je vond de 6. Goed gezien!", "Maar kijk bij welke wijzer de 6 hoort.");
      else await l.zeg("De {12:paars} hoort bij de grote wijzer.", "Het uur zie je aan de kleine wijzer.");
    },
    fout2: async () => {
      zet(l, { licht: "uur", minuutwijzer: "flets" });
      await l.zeg("De kleine wijzer wijst het uur aan.", "Bij een heel uur zeg je dat getal en dan: uur.");
    },
    voordoen: async () => {
      zet(l, { licht: "uur", ring: 6, ringWijzer: "uur" });
      await l.zeg("We doen het samen.", "De kleine wijzer wijst naar de {6:oranje}. Dus het is {6:oranje} uur.");
      zet(l, { ring: null, getalKleur: { n: 6, wijzer: "uur" } });
    },
    kleineStap: ["Tik op {6:oranje} uur."],
    opruimen: () => zet(l, { licht: null, minuutwijzer: "fel" }),
  });
  zet(l, { licht: null, minuutwijzer: "fel", getalKleur: null });

  /* Stap 18. Een strikvraag: is dit 7 uur? (de grote wijzer staat onderaan). Ook bij goed de uitleg. */
  speelLesgeluid("klokDraai");
  zet(l, { stand: { tijd: u(7, 30), draai: true } });
  await l.wacht(1500);
  zetTestAntwoord("Nee");
  haak(l, { soort: "kies", opties: ["Ja", "Nee"], goed: "Nee", poging: 1 }, true);
  const { x: strik } = await vraagMetKnoppen(l, ["Ja", "Nee"], ["Nu een lastige.", "Is het 7 uur?"]);
  haak(l, null);
  await l.wacht(DENK_MS);
  if (strik === "Nee") {
    /* Goed: toch de uitleg in 2 zinnen, en vanzelf door (draaiboek stap 18). */
    speelLesgeluid("goed");
    bliepoScherm("goed");
    zet(l, { goed: ++st(l).goed, licht: "minuut" });
    log(l, "reactie", { soort: "goed" });
    await l.zeg("Goed gezien! Bij een heel uur wijst de grote wijzer recht omhoog. Deze wijst naar beneden.");
    zet(l, { licht: "uur" });
    await l.zeg("De kleine wijzer is de {7:oranje} al voorbij, maar nog niet bij de {8:oranje}.");
    await l.wacht(DOOR_MS);
  } else {
    /* Fout: de uitleg in 3 zinnen, wachten op de pijl, geen 2e poging (draaiboek stap 18). */
    bliepoScherm("fout");
    log(l, "reactie", { soort: "fout-kijkvraag" });
    zet(l, { licht: "minuut" });
    await l.zeg("Kijk naar de grote wijzer. Bij een heel uur wijst hij recht omhoog.", "Deze wijst naar beneden.");
    zet(l, { licht: "uur" });
    await l.zeg("De kleine wijzer is de {7:oranje} al voorbij, maar nog niet bij de {8:oranje}. Dus het is geen {7:oranje} uur.");
    await pijl(l);
  }
  zet(l, { licht: null });
}

/** Stap 19 en 20: het oefenblok (de 13 klokken van de oude les), de vragen tussendoor en de bonus. Geeft het aantal fouten. */
async function oefenblok(l: Lesgids, vanaf: number): Promise<number> {
  zet(l, { stand: { tijd: u(12) }, wijzers: true, vorm: "klok", licht: null, ring: null, getalKleur: null, uurwijzer: "fel", minuutwijzer: "fel", driehoek: null, pijl: null });
  await l.zeg(vanaf ? "Nu nog meer klokken." : "Nu mag jij de klokken lezen.");
  await l.wacht(DOOR_MS);
  let fouten = 0;
  const mis: Klok[] = [];
  for (let i = vanaf; i < KLOKKEN.length; i++) {
    const k = KLOKKEN[i];
    const uit = await oefenKlok(l, k);
    if (uit !== "goed") {
      fouten++;
      mis.push(k);
    }
    /* Tussendoor (draaiboek stap 19): na de 1e klok "welke wijzer liet het uur zien?", na de 2e "waar wijst de grote wijzer?". */
    if (i === vanaf) {
      zet(l, { ring: null, getalKleur: null, licht: null });
      const w = await keuze(l, {
        opties: ["de kleine", "de grote"],
        goed: "de kleine",
        vraag: ["Welke wijzer liet het uur zien?"],
        naGoed: [],
        fout1: async () => {
          zet(l, { licht: "uur", minuutwijzer: "flets" });
          await l.zeg("Kijk naar de wijzer die oplicht.", "Die wijzer wijst het uur aan.");
        },
        fout2: async () => {
          zet(l, { licht: "uur", minuutwijzer: "flets" });
          await l.zeg("De grote wijzer staat op de {12:paars}.", "Het uur lees je bij de andere wijzer.");
        },
        voordoen: async () => {
          zet(l, { licht: "uur" });
          await l.zeg("We doen het samen.", "De kleine wijzer liet het uur zien.");
        },
        kleineStap: ["Tik nu op de knop: de kleine."],
        opruimen: () => zet(l, { licht: null, minuutwijzer: "fel" }),
      });
      if (w !== "goed") fouten++;
      zet(l, { licht: null, minuutwijzer: "fel" });
      if (i === 0) await l.zeg("Nog een paar klokken.");
    }
    if (i === vanaf + 1) {
      const nu = k.uur;
      const w = await keuze(l, {
        opties: [String(nu), "12"],
        goed: "12",
        vraag: ["Waar wijst de grote wijzer?"],
        naGoed: [],
        fout1: async () => {
          zet(l, { licht: "minuut", uurwijzer: "flets" });
          await l.zeg(`Bij de {${nu}:oranje} staat de kleine wijzer.`, "Kijk naar de grote wijzer die oplicht.");
        },
        fout2: async () => {
          zet(l, { licht: "minuut", uurwijzer: "flets" });
          await l.zeg("Bij een heel uur wijst de grote wijzer recht omhoog.");
        },
        voordoen: async () => {
          zet(l, { licht: "minuut", ring: 12, ringWijzer: "minuut" });
          await l.zeg("We doen het samen.", "De grote wijzer wijst naar de {12:paars}.");
          zet(l, { ring: null, getalKleur: { n: 12, wijzer: "minuut" } });
        },
        kleineStap: ["Tik op de knop met de {12:paars}."],
        opruimen: () => zet(l, { licht: null, uurwijzer: "fel" }),
      });
      if (w !== "goed") fouten++;
      zet(l, { licht: null, uurwijzer: "fel", getalKleur: null });
    }
  }
  /* Gemiste klokken komen nog 1 keer terug (zoals in de oude les; hooguit 3). */
  if (mis.length) {
    await l.zeg(mis.length === 1 ? "Er is nog 1 klok van net." : "Er zijn nog een paar klokken van net.");
    for (const k of mis.slice(0, 3)) await oefenKlok(l, k);
  }
  /* Stap 20. De bonus: alleen als het oefenblok helemaal goed ging. */
  if (fouten === 0) {
    zet(l, { verhaal: null, getalKleur: null });
    speelLesgeluid("klokDraai");
    zet(l, { stand: { tijd: u(12), draai: true } });
    await l.wacht(1500);
    await keuze(l, {
      opties: ["1 uur", "11 uur", "12 uur"],
      goed: "1 uur",
      vraag: ["Je had ze allemaal goed! Nog 1 als toetje.", "Het is nu 12 uur. Hoe laat is het over 1 uur?"],
      opnieuw: ["Hoe laat is het over 1 uur?"],
      naGoed: [],
      fout1: async (x) => {
        zet(l, { licht: "uur", pijl: { van: 12, naar: 1 } });
        await l.zeg(x === "12 uur" ? "Het is nu 12 uur. We zoeken de tijd straks." : "11 uur was het 1 uur geleden.", "Over 1 uur schuift de kleine wijzer 1 getal verder.");
      },
      fout2: async () => {
        zet(l, { licht: "uur", pijl: { van: 12, naar: 1 } });
        await l.zeg("Na de 12 begint de klok weer bij de 1.", "Volg de pijl.");
      },
      voordoen: async () => {
        zet(l, { pijl: { van: 12, naar: 1 }, ring: 1, ringWijzer: "uur" });
        await l.zeg("We doen het samen.", "Na de 12 komt de 1. Over 1 uur is het {1:oranje} uur.");
        zet(l, { ring: null, getalKleur: { n: 1, wijzer: "uur" } });
      },
      kleineStap: ["Tik op {1:oranje} uur."],
      opruimen: () => zet(l, { licht: null, pijl: null }),
    });
    zet(l, { licht: null, pijl: null });
  }
  return fouten;
}

export const LESSEN_SQULA_KLOK_GOUDEN: Lesdraaiboek[] = [gouden];

/** Voor de rekencontrole: de klokken van het oefenblok (dezelfde als in squla-klok-hoelaat-1). */
export const GOUDEN_KLOKKEN = KLOKKEN;
export type { GoudenWijzer };
