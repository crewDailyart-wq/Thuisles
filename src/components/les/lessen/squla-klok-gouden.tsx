/**
 * DE GOUDEN KLOKLES (8 november 2026, opdracht Sara; BOUWREGELS hoofdstuk 15, LESRECEPT.md).
 *
 *   squla-klok-hoelaat-1-gouden — een NIEUWE versie naast squla-klok-hoelaat-1 (BOUWREGELS 15.8). De oude les blijft
 *   precies zoals hij is; pas na akkoord van Sara vervangt deze versie de oude voor kinderen.
 *
 * Inhoud (15.8): die van squla-klok-hoelaat-1. Dezelfde 13 klokken in dezelfde volgorde, dezelfde tijden, dezelfde 3
 * keuzes per klok, dezelfde verhaalzinnen en weetjes, dezelfde terugkom-regel (gemiste klokken en de reserve komen terug
 * tot er minstens 15 opgaven zijn) en in de uitleg dezelfde 2 vragen bij de klok op 3 uur. Geen eigen oefenvragen erbij.
 *
 * Verloop: het draaiboek klokkijken (SYNTHESIS-ANALYSE/DRAAIBOEKEN.md §1.1, Hour Hand Hunt), stap voor stap; bij elk stuk
 * staat het nummer van de draaiboekstap.
 *
 * ALLE ZINNEN staan in squla-klok-gouden-zinnen.ts (makkelijk te vervangen), met de FOUTTABEL: per vraag en per fout
 * antwoord de denkfout, Bliepo's eerste zin, de hint en wat er op het scherm gebeurt. Bliepo probeert altijd de denkfout
 * van het kind te begrijpen en reageert daarop (opdracht Sara, 8 november 2026).
 *
 * De verder-pijl (10 november 2026, DEFINITIEF, nieuwe regel van Sara; BOUWREGELS 15.27, SYNTHESIS-ANALYSE/PIJL-KLOK.md):
 * Bliepo praat door; na elk stuk tekst gaat de les ±0,7 s na de stem vanzelf verder (ook na lof, uitleg en hint). De pijl
 * staat er als snelkoppeling, RECHTS onder de tekst (Sara's keuze; Synthesis heeft hem links): een tik stopt de stem en
 * gaat meteen door. Bij vragen, opdrachten, het hulphandje en de eindkaart geen pijl. Zie "DE VERDER-PIJL" hieronder.
 *
 * Hulp bij een keuzevraag: 2 POGINGEN (besluit Sara 9 november 2026, ronde 6; BOUWREGELS 5.1, 15.11):
 *   - goed in 1 keer: goed-geluidje, Bliepo's scherm 1 s groen, een lofzin uit het rijtje, vanzelf door (±0,7 s na de stem; de
 *     pijl staat erbij als snelkoppeling);
 *   - 1e fout: geen fout-geluidje, Bliepo's scherm 1,5 s rood, vraag en knoppen weg, de eerste zin + hint uit de
 *     fouttabel met de hint in beeld; ±0,7 s na de stem komt de vraag vanzelf terug (tik op de pijl = meteen);
 *   - 2e fout: Bliepo legt het uit (bij de NIEUWE denkfout; dezelfde denkfout nog eens = vriendelijk zeggen dat het weer
 *     gebeurt en het op een andere manier uitleggen) en doet het samen voor (nu pas de oranje ring om het antwoord); de
 *     uitleg en het samen voordoen gaan vanzelf door; alleen de goede knop blijft staan en het kind tikt hem zelf; daarna
 *     gaat de les gewoon verder;
 *   - goed na een fout: alleen een korte bevestiging uit het rijtje.
 * Elke fout wordt met zijn denkfout vastgelegd (legDenkfoutVast) en elke vraag met zijn uitkomst: goed in 1 keer,
 * goed na een fout of samen gedaan (legUitkomstVast); alleen "goed in 1 keer" telt mee voor beheersing.
 *
 * De vragen tussendoor (stap 19) en de bonus (stap 20) staan AAN (besluit Sara 9 november 2026, ronde 14 punt 2):
 * alleen hele uren, geen getallen buiten het bereik van de Squla-les. Zie `DRAAIBOEK_EXTRA` en WEGGEHAALD.md.
 */

import type { Lesdraaiboek, Lesgids } from "../soort";
import { GoudenKlok, KaartKlokGouden, type GoudenKlokProps, type GoudenNaspeel, type GoudenWijzer } from "../vlakken/squla-klok-gouden-vlak";
import { zetTestAntwoord } from "./squla-hulp";
import { speelLesgeluid } from "@/lib/lesgeluiden";
import { bliepoScherm } from "@/lib/bliepo-scherm";
import { bewaarUitkomst } from "@/app/lesuitkomstacties";
import { AANMOEDIG, AANMOEDIG_KIEST, BEVESTIG, EINDE, EINDE_VEEL_FOUTEN, KLOKKEN, KLOKREACTIE, LOF, LOF_KIJK_INDEX, MOMENT, NAAM_GROET, NAAM_LOF, ONDUIDELIJK, ONDUIDELIJK_ANDERE, ONDUIDELIJK_NOG_1_KEER, OVERGANG, SNEL, UITLEG, VOORDOEN, ZIN, metNaam, vraagMet, zetFout, type Fout, type Rijtje, type Scherm } from "./squla-klok-gouden-zinnen";

/**
 * Draaiboekstappen die vragen toevoegen aan het oefenblok (stap 19: "welke wijzer liet het uur zien?" en "waar wijst
 * de grote wijzer?"; stap 20: de bonus "hoe laat is het over 1 uur?"). AAN sinds 9 november 2026 (besluit Sara,
 * ronde 14 punt 2); alleen hele uren. De vragen staan in EXTRAVRAGEN (squla-klok-gouden-zinnen.ts).
 */
export const DRAAIBOEK_EXTRA = true;

/* ---------- tijd ---------- */

const u = (uur: number, minuut = 0) => (uur % 12) * 60 + minuut;

/* ---------- het vlak ---------- */

const zet = (l: Lesgids, p: Partial<GoudenKlokProps>) => l.pasVlakAan<GoudenKlokProps>(p);

type Staat = { vorige: Map<Rijtje, number>; zinNr: number; robotNr: number; snelVraag: number; naamVraag: number; naamKeer: number; opRij: number; momenten: Set<string>; pijlUitgelegd: boolean; goed: number; rondje: number; speel: number; haak: number; vraag: number; denkfouten: Map<string, number>; foutVragen: Set<string>; laatste: boolean; eerste: Map<string, Uitkomst>; namen: number; snelGehad: Set<number>; log: unknown[]; vraagFouten: Map<string, string[]>; klokVorige: number };
const STAAT = new WeakMap<Lesgids, Staat>();
const st = (l: Lesgids): Staat => {
  let s = STAAT.get(l);
  if (!s) STAAT.set(l, (s = { vorige: new Map(), zinNr: 0, robotNr: -99, snelVraag: -99, naamVraag: -99, naamKeer: 0, opRij: 0, momenten: new Set(), pijlUitgelegd: false, goed: 0, rondje: 0, speel: 0, haak: 0, vraag: 0, denkfouten: new Map(), foutVragen: new Set(), laatste: false, eerste: new Map(), namen: 0, snelGehad: new Set(), log: [], vraagFouten: new Map(), klokVorige: -1 }));
  return s;
};

/** Zeg zinnen van Bliepo, met {naam} ingevuld (alleen op het scherm en met de browserstem; geen opname). */
const zeg = (l: Lesgids, ...zinnen: string[]) =>
  l.zeg(
    ...zinnen.map((z) => {
      if (!z.includes("{naam}")) return z;
      const s = st(l);
      s.namen++;
      return metNaam(z, s.namen <= 2 ? l.naam : "");
    }),
  );

/** Een klein logboek voor de eigen test (window.__gouden). Verandert niets aan de les. */
function log(l: Lesgids, wat: string, extra: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const s = st(l);
  s.log.push({ t: Math.round(performance.now()), wat, ...extra });
  (window as unknown as { __gouden?: unknown[] }).__gouden = s.log;
}

/** Voor de speelcontrole (scripts/speelcontrole.mjs): wat de les nu vraagt. */
function haak(l: Lesgids, info: Record<string, unknown> | null, nieuw = false) {
  if (typeof window === "undefined") return;
  const s = st(l);
  if (nieuw) s.vraag++;
  window.__phaser = { ...window.__phaser, klokTaak: info ? { ...info, n: ++s.haak, v: s.vraag } : null };
}

/**
 * De denkfout van het kind vastleggen (opdracht Sara, 8 november 2026: voor het ouderdashboard later).
 * Het bestaande voortgangsmechanisme kan dit niet bewaren zonder nieuwe databasekolom; daarom voorlopig ALLEEN lokaal:
 * in `window.__denkfouten` en, op de voorbeeldpagina (/voorbeeld), in de opslag van de browser onder
 * "thuisles-denkfouten-test". Niets naar de server of de database. Wat er voor echte opslag nodig is: KEUZES-VOOR-SARA.md.
 */
export type Denkfout = { les: string; vraag: string; antwoord: string; denkfout: string; poging: number; tijd: string };
export function legDenkfoutVast(l: Lesgids, d: Omit<Denkfout, "les" | "tijd">) {
  const regel: Denkfout = { les: l.lesId ?? "squla-klok-hoelaat-1-gouden", tijd: new Date().toISOString(), ...d };
  /* Voor de database: de denkfouten van deze vraag, tot noteer() de uitkomst bewaart. */
  const s = st(l);
  s.vraagFouten.set(d.vraag, [...(s.vraagFouten.get(d.vraag) ?? []), d.denkfout]);
  if (typeof window === "undefined") return;
  const w = window as unknown as { __denkfouten?: Denkfout[] };
  (w.__denkfouten ??= []).push(regel);
  if (window.location.pathname.startsWith("/voorbeeld")) {
    try {
      const oud = JSON.parse(window.localStorage.getItem("thuisles-denkfouten-test") ?? "[]") as Denkfout[];
      window.localStorage.setItem("thuisles-denkfouten-test", JSON.stringify([...oud, regel].slice(-200)));
    } catch {
      /* geen opslag beschikbaar: dan alleen in het geheugen */
    }
  }
}

/**
 * De uitkomst van elke vraag vastleggen (besluit Sara 9 november 2026): goed in 1 keer, goed na een fout of samen gedaan.
 * Alleen "goed in 1 keer" telt mee voor beheersing.
 *   - Naar de database (tabel `les_uitkomsten`, serveractie bewaarUitkomst): kind-id (bepaalt de server), les, vraag,
 *     uitkomst, denkfout, aantal pogingen, tijdstip. Niets anders. Mislukt het bewaren of is er geen kind gekozen, dan
 *     merkt het kind niets en gaat de les gewoon door.
 *   - Daarnaast blijft `window.__uitkomsten` (en op /voorbeeld "thuisles-uitkomsten-test") bestaan voor de eigen test
 *     (speelcontrole DUMP=1); dat is alleen een logboek in de browser.
 */
export type UitkomstRegel = { les: string; vraag: string; uitkomst: "goed-in-een-keer" | "goed-na-fout" | "samen-gedaan" | "niet-afgemaakt"; teltVoorBeheersing: boolean; tijd: string };
const UITKOMST_NAAM: Record<Uitkomst, UitkomstRegel["uitkomst"]> = { goed: "goed-in-een-keer", naFout: "goed-na-fout", voorgedaan: "samen-gedaan", gestopt: "niet-afgemaakt" };
function noteer(l: Lesgids, vraag: string, uit: Uitkomst): Uitkomst {
  const s = st(l);
  if (!s.eerste.has(vraag)) s.eerste.set(vraag, uit);
  const fouten = s.vraagFouten.get(vraag) ?? [];
  s.vraagFouten.delete(vraag);
  /* "gestopt" (de proef stopt na 2 fouten) is geen uitkomst van de vraag: die klok komt later in het oefenblok opnieuw. */
  if (uit !== "gestopt" && typeof window !== "undefined") {
    const naam = { goed: "goed in één keer", naFout: "goed na een fout", voorgedaan: "samen gedaan" } as const;
    try {
      void bewaarUitkomst({ lesId: l.lesId ?? "squla-klok-hoelaat-1-gouden", vraagId: vraag, uitkomst: naam[uit], denkfouten: uit === "goed" ? [] : fouten, pogingen: uit === "goed" ? 1 : 2 })
        .catch(() => {});
    } catch {
      /* bewaren mislukt: de les gaat gewoon door */
    }
  }
  if (typeof window === "undefined") return uit;
  const regel: UitkomstRegel = { les: l.lesId ?? "squla-klok-hoelaat-1-gouden", vraag, uitkomst: UITKOMST_NAAM[uit], teltVoorBeheersing: uit === "goed", tijd: new Date().toISOString() };
  const w = window as unknown as { __uitkomsten?: UitkomstRegel[] };
  (w.__uitkomsten ??= []).push(regel);
  if (window.location.pathname.startsWith("/voorbeeld")) {
    try {
      const oud = JSON.parse(window.localStorage.getItem("thuisles-uitkomsten-test") ?? "[]") as UitkomstRegel[];
      window.localStorage.setItem("thuisles-uitkomsten-test", JSON.stringify([...oud, regel].slice(-300)));
    } catch {
      /* geen opslag beschikbaar: dan alleen in het geheugen */
    }
  }
  return uit;
}
/** "Volgende keer gaat het nog beter" alleen als het kind de helft of meer van de vragen niet in 1 keer goed had (ronde 15). */
function veelFouten(l: Lesgids): boolean {
  const alle = [...st(l).eerste.values()];
  return alle.length > 0 && alle.filter((x) => x !== "goed").length * 2 >= alle.length;
}

/* ---------- het vaste rijtje ---------- */

/**
 * Een zin uit een rijtje van BLIEPO-KARAKTER.md: nooit 2 keer achter elkaar dezelfde uit dat rijtje, en robotzinnen
 * spaarzaam (nooit binnen 6 zinnen na de vorige robotzin). `zonder`: indexen die hier niet mogen.
 */
function kies(l: Lesgids, r: Rijtje, zonder: number[] = []): string {
  const s = st(l);
  s.zinNr++;
  const vorige = s.vorige.get(r) ?? -1;
  const robotMag = s.zinNr - s.robotNr > 6;
  const mag = r.zinnen.map((_, i) => i).filter((i) => i !== vorige && !zonder.includes(i) && (robotMag || !r.robot.includes(i)));
  const keuze = mag.length ? mag : r.zinnen.map((_, i) => i).filter((i) => i !== vorige);
  const i = keuze[Math.floor(Math.random() * keuze.length)] ?? 0;
  s.vorige.set(r, i);
  if (r.robot.includes(i)) s.robotNr = s.zinNr;
  return r.zinnen[i];
}

/**
 * De lof bij goed in 1 keer (BLIEPO-KARAKTER.md §3): een speciaal moment (eerste klok, 3 goed op rij, een lastige vraag,
 * de laatste klok; elk hooguit 1 keer per les), soms de naam (minstens 3 vragen ertussen, hooguit 2 keer per les, met de
 * groet erbij), anders een gewone lofzin, in het oefenblok soms met een reactie bij de klok (§4).
 */
function lofZinnen(l: Lesgids, o: { kijk?: boolean; lastig?: boolean; eerste?: boolean; uur?: number }): string[] {
  const s = st(l);
  s.opRij++;
  const moment = (naam: keyof typeof MOMENT, nu: boolean) => {
    if (!nu || s.momenten.has(naam)) return null;
    s.momenten.add(naam);
    return kies(l, MOMENT[naam]);
  };
  const speciaal = moment("laatste", s.laatste) ?? moment("eerste", !!o.eerste) ?? moment("moeilijk", !!o.lastig) ?? moment("drieOpRij", s.opRij >= 3);
  if (speciaal) return [speciaal];
  if (s.naamKeer < 2 && s.namen < 2 && s.vraag - s.naamVraag >= 4 && s.opRij >= 2 && l.naam) {
    s.naamKeer++;
    s.naamVraag = s.vraag;
    return [kies(l, NAAM_LOF)];
  }
  const zin = kies(l, LOF, o.kijk ? [] : [LOF_KIJK_INDEX]);
  if (o.uur !== undefined && s.vraag % 3 === 0) {
    /* Lof en reactie beginnen niet allebei met hetzelfde woord ("Ja, ... Ja, ..." of "Nagekeken: ... Nagekeken: ..."). */
    const eerste = (z: string) => z.split(/[\s,:!.]/)[0].toLowerCase();
    const reactie = KLOKREACTIE(o.uur);
    const zonder = reactie.zinnen.map((_, i) => i).filter((i) => eerste(reactie.zinnen[i]) === eerste(zin));
    /* Niet 2 keer achter elkaar dezelfde zin bij de klok, ook niet bij een ander uur ("Ja, het is precies 4 uur." en daarna
       "Ja, het is precies 7 uur."): elk uur heeft een eigen rijtje, dus onthoud de vorige zin over de hele les (Ronde 45,
       zelfde herstel als de gouden Rekenmix). Alleen als er dan nog een gewone zin over is. */
    const vrij = reactie.zinnen.map((_, i) => i).filter((i) => !zonder.includes(i) && i !== s.klokVorige);
    s.vorige.set(reactie, vrij.length ? s.klokVorige : -1);
    const gekozen = kies(l, reactie, zonder);
    s.klokVorige = reactie.zinnen.indexOf(gekozen);
    return [zin, gekozen];
  }
  return [zin];
}
const bevestig = (l: Lesgids) => {
  st(l).opRij = 0;
  return kies(l, BEVESTIG);
};
/** Elke snel-zin hooguit 1 keer per les (kind-test 8 nov); daarna niets meer over snel. */
const snelZin = (l: Lesgids): string | null => {
  const s = st(l);
  const vrij = SNEL.zinnen.map((_, i) => i).filter((i) => !s.snelGehad.has(i));
  if (!vrij.length) return null;
  const i = vrij[Math.floor(Math.random() * vrij.length)];
  s.snelGehad.add(i);
  return SNEL.zinnen[i];
};

/** Heel snel (6.10c): het draaiboek klok heeft een opmerking maar geen grens: binnen 2 s na het einde van de vraag; hooguit 1 keer per 3 klokken; alleen in het oefenblok. */
const SNEL_MS = 2000;
/** Reactie na een tik (6.10a: 0,2 tot 0,4 s). */
const DENK_MS = 200;
/** Bij een opdracht (tikken, zetten): na zoveel stilte komt vanzelf het hulphandje met 1 korte zin (6.10b, 5.10). */
const AANWIJZING_MS = 5500;
/** Bij een opdracht komt de aanmoediging SAMEN met het hulphandje (ronde 15); bij een keuzevraag zegt Bliepo niets. */
const handZinnen = (l: Lesgids, hint: string) => [kies(l, AANMOEDIG, [AANMOEDIG_KIEST]), hint];

function schud<T>(lijst: T[]): T[] {
  const a = [...lijst];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/*
 * DE VERDER-PIJL (10 november 2026, DEFINITIEF, nieuwe regel van Sara; BOUWREGELS 15.27; vervangt de regel "sommige
 * stukken wachten op een tik"): Bliepo praat door. Na ELK stuk tekst gaat de les vanzelf verder, ±0,7 s nadat de zin klaar
 * is, ook na lof, uitleg en de hint na de 1e fout (`zegDoor`). Het kind hoeft nooit op de pijl te tikken. De pijl staat er
 * als snelkoppeling, rechts onder de tekst (Sara's keuze; Synthesis: links): een tik stopt de stem en de les gaat meteen
 * door. Bij vragen en opdrachten wacht de les op het antwoord en staat er GEEN pijl (ook niet tijdens de opdrachtzin).
 * De zinnen van 1 stuk blijven onder elkaar staan (Lesdraaiboek.pijlZoalsSynthesis). Ontwerp (Sara, 10 nov): de pijl staat
 * op 1 vaste plek en blijft staan zolang er tekst is (ook tussen stukken); weg alleen bij een vraag, opdracht of de
 * eindkaart. De tekst staat in een vast vak (opdracht-nieuw.css, data-pijl="rechts").
 * Vervangen (niet meer gebruikt): `zegEnPijl` (wachten op een tik) en de pijl tijdens de opdrachtzin.
 */
/** Zo lang na het einde van de stem komt het volgende stuk (zeg() wacht zelf al 0,3 s; samen ±0,7 s). */
const DOOR_NA_MS = 400;

/** Bliepo zegt een stuk tekst; de les gaat ±0,7 s na de stem vanzelf door. De pijl staat erbij; een tik = meteen door. */
async function zegDoor(l: Lesgids, ...zinnen: string[]) {
  if (!zinnen.some(Boolean)) return;
  log(l, "pijl-door", { zin: zinnen.join(" ") });
  const p = l.verder();
  const z = zeg(l, ...zinnen);
  z.catch(() => {});
  const wie = await Promise.race([z.then(() => "gezegd" as const), p.then(() => "getikt" as const)]);
  if (wie === "getikt") {
    log(l, "pijl-getikt");
    return;
  }
  log(l, "zin-klaar");
  const tik = await Promise.race([l.wacht(DOOR_NA_MS).then(() => false), p.then(() => true)]);
  if (tik) log(l, "pijl-getikt");
  /* De pijl blijft staan tot er een vraag, opdracht of de eindkaart komt (ontwerp Sara 10 nov: niet aan/uit tussen stukken). */
}

/** De zin bij een opdracht (tikken, zetten): geen pijl; de les wacht daarna op de opdracht. Doet het kind hem al tijdens de zin, dan gaat de les meteen door. */
async function zegOpdracht(l: Lesgids, zin: string | string[], melding: Promise<unknown>) {
  const zinnen = Array.isArray(zin) ? zin : [zin];
  log(l, "opdrachtzin", { zin: zinnen.join(" ") });
  l.verderWeg?.();
  const z = zeg(l, ...zinnen);
  z.catch(() => {});
  await Promise.race([z, melding]);
}

async function vraagMetKnoppen(l: Lesgids, opties: string[], zinnen: string[]): Promise<{ x: string; snel: boolean }> {
  const p = l.kies(opties, { direct: true, weetniet: false });
  log(l, "vraag", { zin: zinnen.join(" "), opties });
  const gezegd = zeg(l, ...zinnen).then(() => "gezegd" as const);
  gezegd.catch(() => {});
  const eerst = await Promise.race([gezegd, p.then(() => "getikt" as const)]);
  const vraagKlaar = eerst === "gezegd" ? performance.now() : null;
  if (vraagKlaar) log(l, "vraag-klaar");
  const x = (await p) ?? "";
  const nu = performance.now();
  log(l, "tik", { x, naVraag: vraagKlaar ? Math.round(nu - vraagKlaar) : -1 });
  return { x, snel: vraagKlaar === null || nu - vraagKlaar < SNEL_MS };
}

/** De hint in beeld zetten (wat er op het scherm gebeurt volgens de fouttabel). */
function toonScherm(l: Lesgids, scherm: Scherm) {
  if (scherm === "licht-uur") zet(l, { licht: "uur", minuutwijzer: "flets", uurwijzer: "fel" });
  else if (scherm === "licht-minuut") zet(l, { licht: "minuut", uurwijzer: "flets", minuutwijzer: "fel" });
  else if (scherm === "driehoek-12") zet(l, { driehoek: 12 });
  else if (scherm === "driehoek-6") zet(l, { driehoek: 6 });
  /* Ronde 33 punt 1: de hint-pijl wijst alleen de richting en eindigt op het getal waar je begint (5 → 6, 11 → 12), nooit op het antwoord. */
  else if (scherm === "pijl-6-7") zet(l, { pijl: { van: 5, naar: 6 } });
  else if (scherm === "pijl-12-1") zet(l, { pijl: { van: 11, naar: 12 } });
}

/**
 * Wat Bliepo zegt bij een fout, uit de fouttabel. `eerder` = de denkfout van de vorige poging bij deze vraag.
 * Dezelfde denkfout nog eens (bij deze vraag, of al eerder in de les): vriendelijk zeggen dat het weer gebeurt en het op
 * een andere manier uitleggen. Geen antwoord.
 */
function foutZinnen(l: Lesgids, f: Fout, poging: 1 | 2, eerder: Fout | null, weerGebruikt: { v: boolean }, opdracht = false): string[] {
  const uit = UITLEG[f.soort];
  /* Niet duidelijk: een zin uit het rijtje, maar niet "nog 1 keer proberen" na de 2e fout (er is dan geen poging meer) en niet "Ik bedoelde een andere" bij een opdracht (tikken, zetten). */
  const eerste = f.eerste || kies(l, ONDUIDELIJK, [...(poging === 2 ? [ONDUIDELIJK_NOG_1_KEER] : []), ...(opdracht ? [ONDUIDELIJK_ANDERE] : [])]);
  const duidelijk = f.code !== "onduidelijk";
  /* 1e fout: altijd de eerste zin en de hint van déze vraag (geen "weer" bij een nieuwe vraag; kind-test 8 nov). */
  if (poging === 1) return [eerste, f.hint];
  if (!uit) return [eerste, f.hint];
  const zelfde = eerder !== null && eerder.soort === f.soort;
  if (zelfde && duidelijk && !weerGebruikt.v) {
    weerGebruikt.v = true;
    return uit.weer;
  }
  if (zelfde) return weerGebruikt.v ? uit.uitleg : uit.weer;
  /* Een nieuwe denkfout bij de 2e fout: de eerste zin en 1 korte uitleg (hooguit 2 zinnen). */
  return [eerste, uit.uitleg[0]];
}

type Uitkomst = "goed" | "naFout" | "voorgedaan" | "gestopt";

type Keuzevraag = {
  /** De vraag uit de fouttabel (squla-klok-gouden-zinnen.ts): tekst, keuzes, goed antwoord en de fouten. */
  id: string;
  bijGoed?: () => void;
  /** Na de pijl van de 1e fout nog iets doen (draaiboek stap 15: een extra keer verzetten). */
  naFout1?: () => Promise<void>;
  /** 3e fout: samen voordoen (nu pas het antwoord). Zet het beeld; geeft eigen zinnen of [] (dan de zinnen uit de fouttabel). */
  voordoen: () => string[];
  kleineStap: string;
  /** Het beeld weer rustig zetten na een hint. */
  opruimen?: () => void;
  snel?: boolean;
  vast?: boolean;
  /** De eerste klok van het oefenblok (lof "eerste vraag"). */
  eersteKlok?: boolean;
  /** Het uur van de klok (voor de reactie bij de klok na de lof). */
  uur?: number;
  stopNaFout?: () => boolean;
  /**
   * Bij goed: deze uitleg komt in HETZELFDE stuk onder de lof (Synthesis stap 9: "van 6 naar 7" en daaronder "met de
   * klok mee"); sinds 10 nov (15.27) gaat ook dit stuk vanzelf door. Na samen voordoen zegt de les deze uitleg zelf (de uitkomst is dan "voorgedaan").
   */
  wachtNaGoed?: string[];
};

/**
 * Een lange reactie bij een fout in 2 stukken (LESRECEPT, geleerd bij de omzetting van Splitsen; Ronde 30): eerst wat het
 * kind deed, dan de hint of uitleg. In 1 stuk liep bijvoorbeeld "Je koos het getal links, …" + "Kijk of de punt …" 32 px
 * uit het vaste tekstvak (15.30). Korte reacties blijven 1 stuk.
 */
async function zegDoorKort(l: Lesgids, zinnen: string[]) {
  if (zinnen.length >= 2 && zinnen.join(" ").length > 95) {
    await zegDoor(l, zinnen[0]);
    await zegDoor(l, ...zinnen.slice(1));
  } else await zegDoor(l, ...zinnen);
}

/** Een keuzevraag met de hulp hierboven: 2 pogingen. */
async function keuze(l: Lesgids, o: Keuzevraag): Promise<Uitkomst> {
  const v = vraagMet(o.id);
  const opties = o.vast ? v.opties : schud(v.opties);
  let eerder: Fout | null = null;
  const weerGebruikt = { v: false };
  let uitlegZinnen: string[] = [];
  for (let poging = 1; poging <= 2; poging++) {
    zetTestAntwoord(v.goed);
    haak(l, { soort: "kies", opties, goed: v.goed, poging, vraag: v.id }, poging === 1);
    const { x, snel } = await vraagMetKnoppen(l, opties, poging === 1 ? v.vraag : (v.opnieuw ?? v.vraag));
    haak(l, null);
    await l.wacht(DENK_MS);
    if (x === v.goed) {
      speelLesgeluid("goed");
      bliepoScherm("goed");
      zet(l, { goed: ++st(l).goed });
      o.bijGoed?.();
      const s = st(l);
      const zinnen = [...(poging === 1 ? lofZinnen(l, { kijk: v.kijk, lastig: v.lastig, eerste: o.eersteKlok, uur: v.naGoed?.length ? undefined : o.uur }) : [bevestig(l)]), ...(v.naGoed ?? [])];
      /* Hooguit 2 zinnen na goed (kind-test 8 nov): de lof, en dan óf het weetje óf de reactie bij de klok óf "snel". */
      if (poging === 1 && o.snel && snel && s.vraag - s.snelVraag >= 4 && zinnen.length < 2) {
        const z = snelZin(l);
        if (z) {
          s.snelVraag = s.vraag;
          zinnen.push(z);
        }
      }
      zinnen.splice(2);
      log(l, "reactie", { soort: poging === 1 ? "goed" : "goed-na-fout", vraag: v.id, zin: zinnen.join(" ") });
      /* Lof gaat vanzelf door (15.27); met wachtNaGoed komt de uitleg in hetzelfde stuk eronder ("met de klok mee"). */
      /* Keuring 11 nov 2026 (KEURING-PLUS-KLOK-MIN-GOUDEN.md): 3 zinnen met een lange lofzin ("Nu wordt mijn scherm groen.")
         liepen op 1024 × 768 6 px uit het vaste tekstvak (15.30). Dan de uitleg als eigen stuk, zoals bij het samen voordoen. */
      if (o.wachtNaGoed?.length && [...zinnen, ...o.wachtNaGoed].join(" ").length > 95) {
        await zegDoor(l, ...zinnen);
        await zegDoor(l, ...o.wachtNaGoed);
      } else if (o.wachtNaGoed?.length) await zegDoor(l, ...zinnen, ...o.wachtNaGoed);
      else await zegDoor(l, ...zinnen);
      log(l, "door");
      return noteer(l, v.id, poging === 1 ? "goed" : "naFout");
    }
    /* Geen fout-geluidje en geen rood op de keuze; alleen Bliepo's scherm kleurt rood (BOUWREGELS 5.3). */
    bliepoScherm("fout");
    const f: Fout = v.fouten[x] ?? { code: "onduidelijk", soort: "onduidelijk", denkfout: "niet duidelijk", eerste: "", hint: "", scherm: "geen" };
    st(l).foutVragen.add(v.id);
    st(l).opRij = 0;
    legDenkfoutVast(l, { vraag: v.id, antwoord: x, denkfout: f.code, poging });
    if (o.stopNaFout?.()) {
      st(l).denkfouten.set(f.soort, (st(l).denkfouten.get(f.soort) ?? 0) + 1);
      log(l, "reactie", { soort: "proef-stop", vraag: v.id, x, denkfout: f.code });
      return noteer(l, v.id, "gestopt");
    }
    toonScherm(l, f.scherm);
    const zinnen = foutZinnen(l, f, poging as 1 | 2, eerder, weerGebruikt).filter(Boolean);
    st(l).denkfouten.set(f.soort, (st(l).denkfouten.get(f.soort) ?? 0) + 1);
    log(l, "reactie", { soort: `fout${poging}`, vraag: v.id, x, denkfout: f.code, zin: zinnen.join(" ") });
    if (poging === 1) {
      /* 1e fout: Bliepo reageert op de denkfout met een hint; het kind mag nog 1 keer. */
      await zegDoorKort(l, zinnen);
      if (o.naFout1) await o.naFout1();
      o.opruimen?.();
      eerder = f;
    } else {
      /* 2e fout: Bliepo legt het uit en doet het samen voor (hieronder). */
      uitlegZinnen = zinnen;
    }
  }
  /* Na de 2e fout: uitleg, samen voordoen, de kleine stap, en door (BOUWREGELS 5.1, 5.4, 15.11). */
  /* De uitleg na de 2e fout gaat vanzelf door, zoals Synthesis (pijl alleen tijdens het praten). */
  if (uitlegZinnen.length) await zegDoorKort(l, uitlegZinnen);
  const eigen = o.voordoen();
  const samen = eigen.length ? eigen : (v.samen ?? []);
  log(l, "reactie", { soort: "fout2-samen", vraag: v.id, zin: samen.join(" ") });
  /* 3 zinnen of meer passen niet in het vaste tekstvak (42 px te lang, 15.30; Ronde 30): dan de laatste zin als eigen stuk. */
  if (samen.length >= 3) {
    await zegDoor(l, ...samen.slice(0, -1));
    await zegDoor(l, samen[samen.length - 1]);
  } else await zegDoor(l, ...samen);
  zetTestAntwoord(v.goed);
  haak(l, { soort: "kies", opties: [v.goed], goed: v.goed, poging: 3, vraag: v.id });
  const p = l.kies([v.goed], { direct: true, weetniet: false });
  log(l, "kleine-stap");
  const z = zeg(l, o.kleineStap);
  z.catch(() => {});
  await Promise.race([z, p]);
  await p;
  haak(l, null);
  await l.wacht(DENK_MS);
  speelLesgeluid("goed");
  bliepoScherm("goed");
  zet(l, { goed: ++st(l).goed });
  o.bijGoed?.();
  o.opruimen?.();
  await l.wacht(700);
  log(l, "voorgedaan-klaar");
  return noteer(l, v.id, "voorgedaan");
}

/**
 * Een opdracht op de klok: zet de kleine wijzer op een getal (draaiboek stap 14). De opdracht blijft bovenaan staan
 * (14.32); de oranje ring om het doel mag (7.8e). Na 5,5 s stilte vanzelf het hulphandje met 1 korte zin (6.10b).
 * Fout getal: reactie op de denkfout uit de fouttabel + het handje; 2e fout: uitleg en samen doen, alleen het doel werkt.
 */
async function zetUur(l: Lesgids, doel: number): Promise<Uitkomst> {
  const vraagId = `stap14-zet-${doel}`;
  zet(l, { doel: ZIN.zetKop(doel), ring: doel, ringWijzer: "uur", ringPuls: false, licht: "uur", minuutwijzer: "fel", uurwijzer: "fel", hand: null });
  let eerder: Fout | null = null;
  const weerGebruikt = { v: false };
  /* 3 rondes: 1e poging, 2e poging, en (na de 2e fout) samen doen: alleen het doel werkt. */
  for (let poging = 1; poging <= 3; poging++) {
    const kleineStap = poging === 3;
    haak(l, { soort: "uur", doel, poging, ...(kleineStap ? { alleen: true } : {}) }, poging === 1);
    zet(l, { actief: true, beweegbaar: true, alleenGetal: kleineStap ? doel : null });
    const melding = l.wachtOpVlak<{ soort: string; tijd: number }>("gezet");
    let gedaan = false;
    let aanwijzing: ReturnType<typeof setTimeout> | undefined;
    if (poging === 1) {
      log(l, "vraag", { zin: ZIN.zetOpdracht(doel) });
      /* De pijl alleen tijdens de opdrachtzin (PIJL-KLOK.md); daarna wacht de les op de opdracht. */
      await zegOpdracht(l, ZIN.zetOpdracht(doel), melding);
      log(l, "vraag-klaar");
      /* Het hulphandje komt vanzelf, samen met de aanmoediging (ronde 15). */
      aanwijzing = setTimeout(() => {
        if (gedaan) return;
        log(l, "aanwijzing");
        zet(l, { hand: doel });
        void zeg(l, ...handZinnen(l, ZIN.zetHand(doel))).catch(() => {});
      }, AANWIJZING_MS);
    }
    const g = await melding;
    gedaan = true;
    clearTimeout(aanwijzing);
    const getal = Math.round(g.tijd / 60) % 12 || 12;
    log(l, "tik", { x: getal });
    zet(l, { actief: false, hand: null });
    haak(l, null);
    await l.wacht(DENK_MS);
    if (getal === doel) {
      speelLesgeluid("goed");
      bliepoScherm("goed");
      zet(l, { goed: ++st(l).goed, ring: null, getalKleur: { n: doel, wijzer: "uur" }, rondje: ++st(l).rondje, doel: null, alleenGetal: null });
      log(l, "reactie", { soort: poging === 1 ? "goed" : kleineStap ? "voorgedaan" : "goed-na-fout" });
      /* Lof gaat vanzelf door (pijl alleen tijdens het praten); samen even lang als vroeger (zeg + 1,1 s). */
      if (!kleineStap) {
        await zegDoor(l, poging > 1 ? bevestig(l) : lofZinnen(l, {})[0]);
        await l.wacht(1100 - DOOR_NA_MS);
      } else await l.wacht(1100);
      return noteer(l, vraagId, poging === 1 ? "goed" : kleineStap ? "voorgedaan" : "naFout");
    }
    bliepoScherm("fout");
    const f = zetFout(getal, doel);
    st(l).foutVragen.add(vraagId);
    st(l).opRij = 0;
    legDenkfoutVast(l, { vraag: vraagId, antwoord: String(getal), denkfout: f.code, poging });
    zet(l, { hand: doel, ...(poging >= 2 ? { ringPuls: true } : {}) });
    /* 1e fout: hint; 2e fout: uitleg en samen doen; daarna doet het kind de laatste tik zelf. */
    const zinnen = poging === 1 ? foutZinnen(l, f, 1, eerder, weerGebruikt, true) : [...foutZinnen(l, f, 2, eerder, weerGebruikt, true), ...ZIN.zetSamen(doel)];
    st(l).denkfouten.set(f.soort, (st(l).denkfouten.get(f.soort) ?? 0) + 1);
    log(l, "reactie", { soort: `fout${poging}`, vraag: vraagId, x: getal, denkfout: f.code, zin: zinnen.join(" ") });
    /* Bij een opdracht is de hint zelf de opdracht voor de volgende poging ("Draai de punt naar de 2"): de pijl staat er
       alleen tijdens de zin, daarna wacht de les op de opdracht (15.27; bij Synthesis niet gezien, KEUZES Ronde 23). */
    await zegOpdracht(l, zinnen, new Promise(() => {}));
    eerder = f;
  }
  return noteer(l, vraagId, "voorgedaan");
}

/* ---------- het oefenblok ---------- */

type Klok = (typeof KLOKKEN)[number] & { weetje?: string; naspeel?: GoudenNaspeel };
/** De reserve van de oude les (`reserve: [0, 2, 6]`). */
const RESERVE = [0, 2, 6];
const MINIMAAL = 15;

async function oefenKlok(l: Lesgids, i: number, stopNaFout?: () => boolean): Promise<Uitkomst> {
  const k = KLOKKEN[i] as Klok;
  const s = st(l);
  const verhaal = (speel: number) => ({ naam: k.ding, plek: k.plek, ...(k.naspeel ? { naspeel: k.naspeel } : {}), speel });
  zet(l, { ring: null, licht: null, uurwijzer: "fel", minuutwijzer: "fel", getalKleur: null, driehoek: null, pijl: null, hand: null, verhaal: verhaal(s.speel) });
  zet(l, { stand: { tijd: u(k.uur), draai: true } });
  await l.wacht(1100);
  return keuze(l, {
    id: `klok${i + 1}-${k.uur}uur`,
    bijGoed: () => {
      if (k.naspeel) zet(l, { verhaal: verhaal(++s.speel) });
    },
    snel: true,
    uur: k.uur,
    eersteKlok: i === 0 && !st(l).momenten.has("eerste"),
    ...(stopNaFout ? { stopNaFout } : {}),
    voordoen: () => {
      zet(l, { licht: "uur", minuutwijzer: "flets", uurwijzer: "fel", ring: k.uur, ringWijzer: "uur" });
      return VOORDOEN.klok(k.uur);
    },
    kleineStap: VOORDOEN.klokTik(k.uur),
    opruimen: () => zet(l, { licht: null, minuutwijzer: "fel", uurwijzer: "fel", ring: null }),
  });
}

/* ---------- de les ---------- */

const gouden: Lesdraaiboek = {
  id: "squla-klok-hoelaat-1-gouden",
  titel: "Hoe laat is het?",
  synthesis: "Gouden les · inhoud Squla groep 3 · Klokkijken · Hoe laat is het? · level 1 (squla-klok-hoelaat-1) · verloop draaiboek klokkijken (Hour Hand Hunt)",
  indeling: "synthesis",
  browserstem: true,
  /* Tekst en pijl zoals Synthesis (10 nov 2026, DEFINITIEF; BOUWREGELS 15.27, PIJL-KLOK.md). */
  pijlZoalsSynthesis: true,
  /* Bliepo praat zijn zinnen helemaal uit (10 nov 2026, besluit Sara; lib/stem.ts heelUitpraten). */
  stemHeelUitpraten: true,
  /* Elk woord licht op als Bliepo het zegt, ook met de browserstem (BOUWREGELS 3.7; lib/stem.ts woordenMee; 11 nov 2026, Ronde 30). */
  woordenMeeMetStem: true,
  voorwerpen: ["bezorgbus", "zon", "maan", "bakkerij"],
  kaarttekening: KaartKlokGouden,
  async speel(l) {
    STAAT.delete(l);
    log(l, "start");
    /* Stap 0. De klok op 3 uur (het voorbeeld op het beginscherm, BOUWREGELS 4.1). */
    l.vlak<GoudenKlokProps>(GoudenKlok, { stand: { tijd: u(3) } });
    speelLesgeluid("verschijn");
    await l.wacht(600);

    /* Stap 1. "Weet je dit al?" (4e ronde, T21): Ja = proef van 2 opgaven, 2 fouten = alsnog de uitleg; Nee = de uitleg. */
    /* Groet en startvraag zijn 1 stuk (Sara, 10 november 2026, zoals Synthesis: 1 scherm, 2 alinea's): de korte groet met
       de naam en daaronder meteen de startvraag met Ja en Nee; geen eigen pijl of wachttijd voor de groet, en het geheel
       wordt 1 keer uitgesproken. De tekst staat er meteen (pijlZoalsSynthesis), ook als Bliepo nog laadt (kind-test 8 nov).
       Zonder eerdere tik (geen geluid) zegt Bliepo het hele stuk bij de eerste tik van het kind (lib/stem.ts heelUitpraten). */
    log(l, "vraag", { zin: "startvraag" });
    zetTestAntwoord("Nee");
    haak(l, { soort: "kies", opties: ["Ja", "Nee"], goed: "Nee", poging: 1, vraag: "start" }, true);
    const pStart = l.kies(["Ja", "Nee"], { direct: true, weetniet: false });
    void zeg(l, NAAM_GROET, ZIN.start).catch(() => {});
    st(l).naamKeer = 1;
    const start = await pStart;
    haak(l, null);
    log(l, "tik", { x: start });
    await l.wacht(DENK_MS);

    let uitleg = start !== "Ja";
    let vanaf = 0;
    const proefMis: number[] = [];
    if (start === "Ja") {
      await zegDoor(l, ZIN.proefBegin);
      let proefFouten = 0;
      for (let i = 0; i < 2 && !uitleg; i++) {
        const uit = await oefenKlok(l, i, () => ++proefFouten >= 2);
        if (uit === "gestopt") uitleg = true;
        else if (uit !== "goed") proefMis.push(i);
      }
      log(l, "proef", { fouten: proefFouten, uitleg });
      if (uitleg) {
        zet(l, { verhaal: null, getalKleur: null, ring: null, licht: null, hand: null, uurwijzer: "fel", minuutwijzer: "fel" });
        await zegDoor(l, ...ZIN.proefLastig);
        proefMis.length = 0;
      } else {
        await zegDoor(l, ZIN.proefGoed);
        vanaf = 2;
      }
    } else {
      /* Stap 2. Samen beginnen. Gaat vanzelf door. */
      await zegDoor(l, ZIN.samenBeginnen);
    }

    if (uitleg) await uitlegRoute(l);

    /* Stap 19. Het oefenblok: de 13 klokken van squla-klok-hoelaat-1. */
    const fouten = await oefenblok(l, vanaf, proefMis);

    /* Stap 21. Afsluiten: één slotzin, dan de kaart met een eindzin uit het rijtje. */
    zet(l, { verhaal: null, ring: null, licht: null, getalKleur: null, hand: null, uurwijzer: "fel", minuutwijzer: "fel" });
    await zegDoor(l, ZIN.slot);
    log(l, "kaart", { fouten });
    l.verderWeg?.();
    const tik = l.kaart();
    speelLesgeluid("kaart");
    await zeg(l, veelFouten(l) ? EINDE_VEEL_FOUTEN : kies(l, EINDE));
    await tik;
  },
};

/** Stap 2 t/m 18 van het draaiboek: de route na "Nee" (en na een mislukte proef). */
async function uitlegRoute(l: Lesgids) {
  zet(l, { stand: { tijd: u(3) }, wijzers: false, verhaal: null });
  await l.wacht(600);

  /* Stap 3. De klok rolt uit tot een getallenlijn (± 3 s in het draaiboek). */
  speelLesgeluid("klokDraai");
  zet(l, { vorm: "lijn" });
  const rolUit = l.wacht(2400);
  rolUit.catch(() => {});
  await zegDoor(l, ZIN.lijnKijk);
  await rolUit;

  /* Stap 4. Hoe heet dit? (het draaiboek geeft hier geen 2e poging; Sara 8 nov: na een fout komt de vraag terug) */
  await keuze(l, {
    id: "stap4-hoe-heet",
    voordoen: () => [],
    kleineStap: VOORDOEN.woordTik("een getallenlijn"),
  });

  /* Stap 5. Tik op een getal; daarna buigt de lijn terug tot een klok. Na 5,5 s stilte het hulphandje (6.10b). */
  haak(l, { soort: "getal", poging: 1 }, true);
  zet(l, { actief: true, tikGetal: true });
  const getikt = l.wachtOpVlak("getal");
  let klaar = false;
  log(l, "vraag", { zin: ZIN.tikGetal });
  /* De pijl alleen tijdens de opdrachtzin (PIJL-KLOK.md stap 6). */
  await zegOpdracht(l, ZIN.tikGetal, getikt);
  log(l, "vraag-klaar");
  const hint = setTimeout(() => {
    if (klaar) return;
    log(l, "aanwijzing");
    zet(l, { hand: 5 });
    void zeg(l, ...handZinnen(l, ZIN.tikGetalHand)).catch(() => {});
  }, AANWIJZING_MS);
  await getikt;
  klaar = true;
  clearTimeout(hint);
  log(l, "tik", { x: "getal" });
  haak(l, null);
  zet(l, { actief: false, tikGetal: false, hand: null });
  speelLesgeluid("klokDraai");
  zet(l, { vorm: "klok" });
  await l.wacht(2600);

  /* Stap 6. En hoe heet dit nu? */
  await keuze(l, {
    id: "stap6-hoe-heet-nu",
    voordoen: () => [],
    kleineStap: VOORDOEN.woordTik("een klok"),
  });

  /* Stap 7. Het hoogste punt; het driehoekje komt pas NA het antwoord (goed of samen voordoen; Ronde 33 punt 1, 15.17). */
  await keuze(l, {
    id: "stap7-hoogste",
    bijGoed: () => zet(l, { driehoek: 12 }),
    voordoen: () => {
      zet(l, { driehoek: 12, ring: 12, ringWijzer: "uur", getalKleur: { n: 12, wijzer: "uur" } });
      return [];
    },
    kleineStap: VOORDOEN.getalTik(12, null),
  });
  zet(l, { driehoek: null, ring: null, getalKleur: null });

  /* Stap 8. Het laagste punt; het driehoekje komt pas NA het antwoord (goed of samen voordoen). */
  await keuze(l, {
    id: "stap8-laagste",
    bijGoed: () => zet(l, { driehoek: 6 }),
    voordoen: () => {
      zet(l, { driehoek: 6, ring: 6, ringWijzer: "uur", getalKleur: { n: 6, wijzer: "uur" } });
      return [];
    },
    kleineStap: VOORDOEN.getalTik(6, null),
  });
  zet(l, { driehoek: null, ring: null, getalKleur: null });

  /* Stap 9. Wat komt na de 6? Met de klok mee (de blauwe pijl). */
  const stap9 = await keuze(l, {
    id: "stap9-na-6",
    bijGoed: () => zet(l, { pijl: { van: 6, naar: 7 } }),
    voordoen: () => {
      zet(l, { pijl: { van: 6, naar: 7 }, ring: 7, ringWijzer: "uur", getalKleur: { n: 7, wijzer: "uur" } });
      return [];
    },
    kleineStap: VOORDOEN.getalTik(7, null),
    /* Zoals Synthesis: "met de klok mee" komt in hetzelfde stuk onder de lof, en dan wacht Bliepo op de pijl. */
    wachtNaGoed: [ZIN.metDeKlokMee],
  });
  zet(l, { pijl: { van: 6, naar: 7 }, ring: null });
  if (stap9 === "voorgedaan") await zegDoor(l, ZIN.metDeKlokMee);
  zet(l, { pijl: null, getalKleur: null });

  /* Stap 10. Een lastige: na de 12 komt de 1. */
  await keuze(l, {
    id: "stap10-na-12",
    bijGoed: () => zet(l, { pijl: { van: 12, naar: 1 } }),
    voordoen: () => {
      zet(l, { pijl: { van: 12, naar: 1 }, ring: 1, ringWijzer: "uur", getalKleur: { n: 1, wijzer: "uur" } });
      return [];
    },
    kleineStap: VOORDOEN.getalTik(1, null),
  });
  zet(l, { pijl: null, getalKleur: null, ring: null });
  await l.wacht(300);

  /* Stap 11. Twee wijzers verschijnen (plopje). Wacht op de pijl. Dan: wat telt de lange wijzer? */
  zet(l, { stand: { tijd: u(1) } });
  await l.wacht(400);
  zet(l, { wijzers: true });
  speelLesgeluid("plop");
  await l.wacht(500);
  /* Synthesis gaat hier vanzelf door (PIJL-KLOK.md stap 20). */
  await zegDoor(l, ZIN.tweeWijzers);
  await keuze(l, {
    id: "stap11-lange-telt",
    voordoen: () => {
      zet(l, { licht: "minuut", uurwijzer: "flets" });
      return [];
    },
    kleineStap: VOORDOEN.woordTik("de minuten"),
    opruimen: () => zet(l, { licht: null, uurwijzer: "fel", minuutwijzer: "fel" }),
  });

  /* Stap 12. De namen van de wijzers: de lange licht op, de korte is vaag; daarna andersom. */
  zet(l, { licht: "minuut", uurwijzer: "flets", minuutwijzer: "fel" });
  await keuze(l, {
    id: "stap12-lange-naam",
    voordoen: () => [],
    kleineStap: VOORDOEN.woordTik("de grote wijzer"),
    opruimen: () => zet(l, { licht: "minuut", uurwijzer: "flets", minuutwijzer: "fel" }),
  });
  zet(l, { licht: "uur", uurwijzer: "fel", minuutwijzer: "flets" });
  await keuze(l, {
    id: "stap12-korte-naam",
    voordoen: () => [],
    kleineStap: VOORDOEN.woordTik("de kleine wijzer"),
    opruimen: () => zet(l, { licht: "uur", uurwijzer: "fel", minuutwijzer: "flets" }),
  });

  /* Stap 13. De kleine wijzer leest het uur: de grote is vaag; de kleine draait naar 3, 7 en 11 terwijl de vraag klinkt. */
  await zegDoor(l, ...ZIN.urenUitleg);
  for (const uur of [3, 7, 11]) {
    zet(l, { stand: { tijd: u(uur), draai: true }, licht: "uur", uurwijzer: "fel", minuutwijzer: "flets", getalKleur: null });
    await keuze(l, {
      id: `stap13-wijst-${uur}`,
      voordoen: () => {
        zet(l, { ring: uur, ringWijzer: "uur", getalKleur: { n: uur, wijzer: "uur" } });
        return [VOORDOEN.getal(uur)];
      },
      kleineStap: VOORDOEN.getalTik(uur),
      opruimen: () => zet(l, { ring: null, licht: "uur", uurwijzer: "fel", minuutwijzer: "flets" }),
    });
  }
  await zegDoor(l, ZIN.urenKlaar);

  /* Stap 14. Zelf de kleine wijzer verzetten (3 keer). De grote wijzer is weer fel; eerst wacht Bliepo op de pijl. */
  zet(l, { licht: "minuut", minuutwijzer: "fel", uurwijzer: "fel", getalKleur: null, ring: null });
  await zegDoor(l, ZIN.groteWijzerKijk);
  zet(l, { licht: null });
  await zetUur(l, 2);
  await zegDoor(l, ZIN.na2);
  zet(l, { getalKleur: null });
  await zetUur(l, 3);
  await zegDoor(l, ZIN.na3);
  zet(l, { getalKleur: null });
  await zetUur(l, 6);
  zet(l, { licht: null, getalKleur: null, doel: null });

  /* Stap 15. Waar stond de grote wijzer elke keer? De kleine wijzer is vaag. */
  zet(l, { uurwijzer: "flets", minuutwijzer: "fel" });
  await keuze(l, {
    id: "stap15-grote-steeds",
    naFout1: async () => {
      /* Zoals het draaiboek: een extra keer verzetten, en dan goed op de grote wijzer letten. */
      zet(l, { licht: null, uurwijzer: "fel", minuutwijzer: "fel" });
      await zetUur(l, 7);
      zet(l, { doel: null, getalKleur: null });
    },
    voordoen: () => {
      zet(l, { licht: "minuut", ring: 12, ringWijzer: "minuut", getalKleur: { n: 12, wijzer: "minuut" } });
      return [];
    },
    kleineStap: VOORDOEN.getalTik(12, "paars"),
    opruimen: () => zet(l, { uurwijzer: "flets", minuutwijzer: "fel", licht: "minuut" }),
  });
  zet(l, { licht: "minuut", ring: null, getalKleur: { n: 12, wijzer: "minuut" } });
  await zegDoor(l, ...ZIN.heelUur);
  zet(l, { licht: null, uurwijzer: "fel", getalKleur: null });

  /* Stap 16. De klok op 3 uur, met de 2 uitlegvragen van de oude les (12 / 3 / 6 en 12 uur / 6 uur / 3 uur). */
  zet(l, { stand: { tijd: u(3), draai: true }, licht: "uur", minuutwijzer: "flets" });
  await l.wacht(1300);
  await keuze(l, {
    id: "stap16-wijst-3",
    voordoen: () => {
      zet(l, { ring: 3, ringWijzer: "uur", getalKleur: { n: 3, wijzer: "uur" } });
      return [VOORDOEN.getal(3)];
    },
    kleineStap: VOORDOEN.getalTik(3),
    opruimen: () => zet(l, { ring: null, licht: "uur", minuutwijzer: "flets", uurwijzer: "fel" }),
  });
  zet(l, { licht: null, minuutwijzer: "fel", ring: null, getalKleur: null });
  await keuze(l, {
    id: "stap16-hoe-laat",
    voordoen: () => {
      zet(l, { licht: "uur", minuutwijzer: "flets", ring: 3, ringWijzer: "uur", getalKleur: { n: 3, wijzer: "uur" } });
      return VOORDOEN.klok(3);
    },
    kleineStap: VOORDOEN.klokTik(3),
    opruimen: () => zet(l, { licht: null, minuutwijzer: "fel", uurwijzer: "fel", ring: null }),
  });
  zet(l, { licht: null, minuutwijzer: "fel", ring: null, getalKleur: null });

  /* Stap 17. 6 uur. */
  speelLesgeluid("klokDraai");
  zet(l, { stand: { tijd: u(6), draai: true } });
  await l.wacht(1300);
  await keuze(l, {
    id: "stap17-6-uur",
    voordoen: () => {
      zet(l, { licht: "uur", minuutwijzer: "flets", ring: 6, ringWijzer: "uur", getalKleur: { n: 6, wijzer: "uur" } });
      return VOORDOEN.klok(6);
    },
    kleineStap: VOORDOEN.klokTik(6),
    opruimen: () => zet(l, { licht: null, minuutwijzer: "fel", uurwijzer: "fel", ring: null }),
  });
  zet(l, { licht: null, minuutwijzer: "fel", getalKleur: null, ring: null });

  /* Stap 18. Een strikvraag: is dit 7 uur? (de grote wijzer staat onderaan). Ook bij goed de uitleg. */
  speelLesgeluid("klokDraai");
  zet(l, { stand: { tijd: u(7, 30), draai: true } });
  await l.wacht(1500);
  await keuze(l, {
    id: "stap18-strik",
    vast: true,
    bijGoed: () => zet(l, { licht: "minuut", uurwijzer: "fel", minuutwijzer: "fel" }),
    voordoen: () => {
      zet(l, { licht: "minuut", uurwijzer: "fel", minuutwijzer: "fel" });
      return [];
    },
    kleineStap: VOORDOEN.woordTik("Nee"),
    opruimen: () => zet(l, { licht: null, uurwijzer: "fel", minuutwijzer: "fel" }),
  });
  zet(l, { licht: null });
}

/**
 * Stap 19: het oefenblok. De 13 klokken van de oude les, daarna komen gemiste klokken terug, aangevuld met de reserve
 * tot er minstens 15 opgaven zijn (dezelfde regel als `speelAlles` in squla-klok.tsx). Geeft het aantal fouten.
 */
async function oefenblok(l: Lesgids, vanaf: number, mis: number[]): Promise<number> {
  zet(l, { stand: { tijd: u(12) }, wijzers: true, vorm: "klok", licht: null, ring: null, getalKleur: null, uurwijzer: "fel", minuutwijzer: "fel", driehoek: null, pijl: null, hand: null });
  await zegDoor(l, vanaf ? ZIN.oefenVerder : ZIN.oefenBegin);
  let fouten = mis.length;
  let tussen = 0;
  for (let i = vanaf; i < KLOKKEN.length; i++) {
    /* Af en toe een overgangszin (BLIEPO-KARAKTER.md §12); meestal niet, want het draaiboek gaat vanzelf door. */
    if (i === 7) await zegDoor(l, kies(l, OVERGANG));
    if ((await oefenKlok(l, i)) !== "goed") {
      fouten++;
      mis.push(i);
    }
    /* Vragen tussendoor (draaiboek stap 19): na de eerste klok van het blok "welke wijzer liet het uur zien?", daarna bij
       de eerstvolgende klok die niet op 12 staat "waar wijst de grote wijzer?". Alleen hele uren. */
    if (DRAAIBOEK_EXTRA && tussen < 2) {
      const uur = KLOKKEN[i].uur;
      if (tussen === 0) {
        tussen = 1;
        zet(l, { verhaal: null, ring: null, getalKleur: null, licht: null });
        const w = await keuze(l, {
          id: "tussendoor-welke-wijzer",
          voordoen: () => {
            zet(l, { licht: "uur", minuutwijzer: "flets", uurwijzer: "fel" });
            return [];
          },
          kleineStap: VOORDOEN.woordTik("de kleine wijzer"),
          opruimen: () => zet(l, { licht: null, minuutwijzer: "fel", uurwijzer: "fel" }),
        });
        if (w !== "goed") fouten++;
      } else if (uur !== 12) {
        tussen = 2;
        zet(l, { verhaal: null, ring: null, getalKleur: null, licht: null });
        const w = await keuze(l, {
          id: `tussendoor-grote-${uur}uur`,
          voordoen: () => {
            zet(l, { licht: "minuut", uurwijzer: "flets", minuutwijzer: "fel", ring: 12, ringWijzer: "minuut", getalKleur: { n: 12, wijzer: "minuut" } });
            return [];
          },
          kleineStap: VOORDOEN.getalTik(12, "paars"),
          opruimen: () => zet(l, { licht: null, uurwijzer: "fel", minuutwijzer: "fel", ring: null, getalKleur: null }),
        });
        if (w !== "goed") fouten++;
      }
    }
  }
  const nodig = Math.max(0, MINIMAAL - KLOKKEN.length);
  const terug = [...mis.slice(0, 3), ...RESERVE.filter((i) => !mis.includes(i))].slice(0, Math.max(nodig, Math.min(3, mis.length)));
  if (terug.length) {
    zet(l, { verhaal: null, ring: null, licht: null, getalKleur: null });
    /* "Van net terug" alleen als het kind echt iets miste; anders zijn het gewoon extra klokken. */
    await zegDoor(l, mis.length ? (terug.length === 1 ? ZIN.terug1 : ZIN.terugN(terug.length)) : terug.length === 1 ? ZIN.extra1 : ZIN.extraN(terug.length));
    let weerFout = 0;
    for (const [n, i] of terug.entries()) {
      st(l).laatste = n === terug.length - 1;
      if ((await oefenKlok(l, i)) !== "goed") {
        fouten++;
        weerFout++;
      }
    }
    if (weerFout) await zegDoor(l, ZIN.terugLastig);
  }
  /* Stap 20. De bonus "hoe laat is het over 1 uur?": alleen als alles in 1 keer goed ging (draaiboek). */
  if (DRAAIBOEK_EXTRA && fouten === 0) {
    zet(l, { verhaal: null, ring: null, licht: null, getalKleur: null });
    speelLesgeluid("klokDraai");
    zet(l, { stand: { tijd: u(12), draai: true } });
    await l.wacht(1500);
    await keuze(l, {
      id: "bonus-over-1-uur",
      bijGoed: () => zet(l, { pijl: { van: 12, naar: 1 } }),
      voordoen: () => {
        zet(l, { licht: "uur", pijl: { van: 12, naar: 1 }, ring: 1, ringWijzer: "uur", getalKleur: { n: 1, wijzer: "uur" } });
        return [];
      },
      kleineStap: VOORDOEN.klokTik(1),
      opruimen: () => zet(l, { licht: null, ring: null }),
    });
    zet(l, { licht: null, pijl: null, ring: null, getalKleur: null });
  }
  return fouten;
}

export const LESSEN_SQULA_KLOK_GOUDEN: Lesdraaiboek[] = [gouden];

/** Voor de rekencontrole: de klokken van het oefenblok (dezelfde als in squla-klok-hoelaat-1). */
export const GOUDEN_KLOKKEN = KLOKKEN;
export type { GoudenWijzer };
