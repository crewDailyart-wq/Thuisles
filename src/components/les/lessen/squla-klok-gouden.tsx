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
 * Hulp bij een keuzevraag (BOUWREGELS 5.1, 5.3, 5.4, 6.9; 4e ronde; opdracht Sara 8 nov):
 *   - goed in 1 keer: goed-geluidje, Bliepo's scherm 1 s groen, een lofzin uit het rijtje, vanzelf door (0,6 s);
 *   - 1e fout: geen fout-geluidje, Bliepo's scherm 1,5 s rood, vraag en knoppen weg, de eerste zin + hint uit de
 *     fouttabel met de hint in beeld; Bliepo wacht op de blauwe pijl (tik breekt de zin af); dan komt de vraag terug;
 *   - 2e fout: uitleg bij de NIEUWE denkfout, zonder het antwoord; dezelfde denkfout nog eens = vriendelijk zeggen dat
 *     het weer gebeurt en het op een andere manier uitleggen; vanzelf door naar de 3e poging;
 *   - 3e fout: samen voordoen (nu pas de oranje ring om het antwoord), alleen de goede knop blijft staan en het kind
 *     tikt hem zelf (de kleine stap); daarna gaat de les gewoon verder;
 *   - goed na een fout: alleen een korte bevestiging uit het rijtje.
 * Elke fout wordt met zijn denkfout vastgelegd (legDenkfoutVast).
 *
 * Twee draaiboekstappen staan klaar maar UIT, omdat ze vragen toevoegen aan het oefenblok (15.8): de vragen tussendoor
 * (stap 19) en de bonus (stap 20). Zie `DRAAIBOEK_EXTRA` en KEUZES-VOOR-SARA.md, "Ronde 14 — de gouden klokles".
 */

import type { Lesdraaiboek, Lesgids } from "../soort";
import { GoudenKlok, type GoudenKlokProps, type GoudenNaspeel, type GoudenWijzer } from "../vlakken/squla-klok-gouden-vlak";
import { KaartKlok } from "../vlakken/squla-klok-vlak";
import { zetTestAntwoord } from "./squla-hulp";
import { speelLesgeluid } from "@/lib/lesgeluiden";
import { bliepoScherm } from "@/lib/bliepo-scherm";
import { AANMOEDIG, BEVESTIG, EINDE, EINDE_VEEL_FOUTEN, KLOKKEN, KLOKREACTIE, LOF, LOF_KIJK_INDEX, MOMENT, NAAM_GROET, NAAM_LOF, ONDUIDELIJK, OVERGANG, SNEL, UITLEG, VOORDOEN, ZIN, metNaam, vraagMet, zetFout, type Fout, type Rijtje, type Scherm } from "./squla-klok-gouden-zinnen";

/**
 * Draaiboekstappen die vragen toevoegen aan het oefenblok (stap 19: "welke wijzer liet het uur zien?" en "waar wijst
 * de grote wijzer?"; stap 20: de bonus "hoe laat is het over 1 uur?"). Uit tot Sara akkoord geeft (BOUWREGELS 15.8).
 * De code ervan stond in de eerste opzet; die is bewaard in de back-upbranch (commit 96d6c65).
 */
export const DRAAIBOEK_EXTRA = false;

/* ---------- tijd ---------- */

const u = (uur: number, minuut = 0) => (uur % 12) * 60 + minuut;

/* ---------- het vlak ---------- */

const zet = (l: Lesgids, p: Partial<GoudenKlokProps>) => l.pasVlakAan<GoudenKlokProps>(p);

type Staat = { vorige: Map<Rijtje, number>; zinNr: number; robotNr: number; snelVraag: number; naamVraag: number; naamKeer: number; opRij: number; momenten: Set<string>; pijlUitgelegd: boolean; goed: number; rondje: number; speel: number; haak: number; vraag: number; denkfouten: Map<string, number>; foutVragen: Set<string>; laatste: boolean; namen: number; snelGehad: Set<number>; log: unknown[] };
const STAAT = new WeakMap<Lesgids, Staat>();
const st = (l: Lesgids): Staat => {
  let s = STAAT.get(l);
  if (!s) STAAT.set(l, (s = { vorige: new Map(), zinNr: 0, robotNr: -99, snelVraag: -99, naamVraag: -99, naamKeer: 0, opRij: 0, momenten: new Set(), pijlUitgelegd: false, goed: 0, rondje: 0, speel: 0, haak: 0, vraag: 0, denkfouten: new Map(), foutVragen: new Set(), laatste: false, namen: 0, snelGehad: new Set(), log: [] }));
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
  if (o.uur !== undefined && s.vraag % 3 === 0) return [zin, kies(l, KLOKREACTIE(o.uur))];
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
/** Vanzelf door na een zin (draaiboek §1.5: 0,5 tot 0,7 s; zeg() wacht zelf al 0,3 s). */
const DOOR_MS = 300;
/** Bij een opdracht (tikken, zetten): na zoveel stilte komt vanzelf het hulphandje met 1 korte zin (6.10b, 5.10). */
const AANWIJZING_MS = 5500;
/** Doet het kind na het handje nog steeds niets: 1 keer een aanmoediging (BLIEPO-KARAKTER.md §11, ± 15 s). */
const AANMOEDIG_MS = 15000;

function schud<T>(lijst: T[]): T[] {
  const a = [...lijst];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Bliepo zegt iets en wacht op de blauwe pijl (6.9). De pijl staat er vanaf het begin; een tik breekt de zin af. */
async function zegEnPijl(l: Lesgids, zinnen: string[]) {
  const s = st(l);
  log(l, "pijl");
  const p = l.verder();
  const uitleg = s.pijlUitgelegd ? [] : [ZIN.pijlUitleg];
  s.pijlUitgelegd = true;
  const z = zeg(l, ...zinnen, ...uitleg);
  z.catch(() => {});
  await Promise.race([z, p]);
  await p;
  log(l, "pijl-getikt");
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
  else if (scherm === "pijl-6-7") zet(l, { pijl: { van: 6, naar: 7 } });
  else if (scherm === "pijl-12-1") zet(l, { pijl: { van: 12, naar: 1 } });
}

/**
 * Wat Bliepo zegt bij een fout, uit de fouttabel. `eerder` = de denkfout van de vorige poging bij deze vraag.
 * Dezelfde denkfout nog eens (bij deze vraag, of al eerder in de les): vriendelijk zeggen dat het weer gebeurt en het op
 * een andere manier uitleggen. Geen antwoord.
 */
function foutZinnen(l: Lesgids, f: Fout, poging: 1 | 2, eerder: Fout | null, weerGebruikt: { v: boolean }): string[] {
  const uit = UITLEG[f.soort];
  const eerste = f.eerste || kies(l, ONDUIDELIJK);
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
};

/** Een keuzevraag met de hulp hierboven. */
async function keuze(l: Lesgids, o: Keuzevraag): Promise<Uitkomst> {
  const v = vraagMet(o.id);
  const opties = o.vast ? v.opties : schud(v.opties);
  let eerder: Fout | null = null;
  const weerGebruikt = { v: false };
  for (let poging = 1; poging <= 3; poging++) {
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
      await zeg(l, ...zinnen);
      await l.wacht(DOOR_MS);
      log(l, "door");
      return poging === 1 ? "goed" : "naFout";
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
      return "gestopt";
    }
    if (poging <= 2) {
      toonScherm(l, f.scherm);
      const zinnen = foutZinnen(l, f, poging as 1 | 2, eerder, weerGebruikt).filter(Boolean);
      st(l).denkfouten.set(f.soort, (st(l).denkfouten.get(f.soort) ?? 0) + 1);
      log(l, "reactie", { soort: `fout${poging}`, vraag: v.id, x, denkfout: f.code, zin: zinnen.join(" ") });
      if (poging === 1) {
        await zegEnPijl(l, zinnen);
        if (o.naFout1) await o.naFout1();
      } else {
        await zeg(l, ...zinnen);
        await l.wacht(DOOR_MS);
      }
      o.opruimen?.();
      eerder = f;
    }
  }
  /* Na de 3e fout: samen voordoen, de kleine stap, en door (BOUWREGELS 5.1, 5.4). */
  const eigen = o.voordoen();
  const samen = eigen.length ? eigen : (v.samen ?? []);
  log(l, "reactie", { soort: "fout3", vraag: v.id, zin: samen.join(" ") });
  await zeg(l, ...samen);
  zetTestAntwoord(v.goed);
  haak(l, { soort: "kies", opties: [v.goed], goed: v.goed, poging: 4, vraag: v.id });
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
  return "voorgedaan";
}

/**
 * Een opdracht op de klok: zet de kleine wijzer op een getal (draaiboek stap 14). De opdracht blijft bovenaan staan
 * (14.32); de oranje ring om het doel mag (7.8e). Na 5,5 s stilte vanzelf het hulphandje met 1 korte zin (6.10b).
 * Fout getal: reactie op de denkfout uit de fouttabel + het handje; 2e fout: uitleg; 3e fout: samen, alleen het doel werkt.
 */
async function zetUur(l: Lesgids, doel: number): Promise<Uitkomst> {
  zet(l, { doel: ZIN.zetKop(doel), ring: doel, ringWijzer: "uur", ringPuls: false, licht: "uur", minuutwijzer: "fel", uurwijzer: "fel", hand: null });
  let eerder: Fout | null = null;
  const weerGebruikt = { v: false };
  for (let poging = 1; poging <= 4; poging++) {
    const kleineStap = poging === 4;
    haak(l, { soort: "uur", doel, poging, ...(kleineStap ? { alleen: true } : {}) }, poging === 1);
    zet(l, { actief: true, beweegbaar: true, alleenGetal: kleineStap ? doel : null });
    const melding = l.wachtOpVlak<{ soort: string; tijd: number }>("gezet");
    let gedaan = false;
    let aanwijzing: ReturnType<typeof setTimeout> | undefined;
    if (poging === 1) {
      log(l, "vraag", { zin: ZIN.zetOpdracht(doel) });
      const z = zeg(l, ZIN.zetOpdracht(doel));
      z.catch(() => {});
      await Promise.race([z, melding]);
      log(l, "vraag-klaar");
      aanwijzing = setTimeout(() => {
        if (gedaan) return;
        log(l, "aanwijzing");
        zet(l, { hand: doel });
        void zeg(l, ZIN.zetHand(doel)).catch(() => {});
        aanwijzing = setTimeout(() => {
          if (gedaan) return;
          log(l, "aanmoedigen");
          void zeg(l, kies(l, AANMOEDIG)).catch(() => {});
        }, AANMOEDIG_MS - AANWIJZING_MS);
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
      if (!kleineStap) await zeg(l, poging > 1 ? bevestig(l) : lofZinnen(l, {})[0]);
      await l.wacht(1100);
      return poging === 1 ? "goed" : kleineStap ? "voorgedaan" : "naFout";
    }
    bliepoScherm("fout");
    const f = zetFout(getal, doel);
    st(l).foutVragen.add(`stap14-zet-${doel}`);
    st(l).opRij = 0;
    legDenkfoutVast(l, { vraag: `stap14-zet-${doel}`, antwoord: String(getal), denkfout: f.code, poging });
    zet(l, { hand: doel, ...(poging >= 3 ? { ringPuls: true } : {}) });
    let zinnen: string[];
    if (poging <= 2) zinnen = foutZinnen(l, f, poging as 1 | 2, eerder, weerGebruikt);
    else zinnen = ZIN.zetSamen(doel);
    st(l).denkfouten.set(f.soort, (st(l).denkfouten.get(f.soort) ?? 0) + 1);
    log(l, "reactie", { soort: `fout${poging}`, vraag: `stap14-zet-${doel}`, x: getal, denkfout: f.code, zin: zinnen.join(" ") });
    await zeg(l, ...zinnen);
    eerder = f;
  }
  return "voorgedaan";
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
  titel: "Hoe laat is het? (gouden les)",
  synthesis: "Gouden les · inhoud Squla groep 3 · Klokkijken · Hoe laat is het? · level 1 (squla-klok-hoelaat-1) · verloop draaiboek klokkijken (Hour Hand Hunt)",
  indeling: "synthesis",
  browserstem: true,
  voorwerpen: ["bezorgbus", "zon", "maan", "bakkerij"],
  kaarttekening: KaartKlok,
  async speel(l) {
    STAAT.delete(l);
    log(l, "start");
    /* Stap 0. De klok op 3 uur (het voorbeeld op het beginscherm, BOUWREGELS 4.1). */
    l.vlak<GoudenKlokProps>(GoudenKlok, { stand: { tijd: u(3) } });
    speelLesgeluid("verschijn");
    await l.wacht(600);

    /* Stap 1. "Weet je dit al?" (4e ronde, T21): Ja = proef van 2 opgaven, 2 fouten = alsnog de uitleg; Nee = de uitleg. */
    /* Eerst de groet: Bliepo staat dan in beeld en praat. Pas daarna de startvraag met Ja en Nee, zodat er nooit knoppen
       zonder vraag en zonder Bliepo staan (kind-test 8 nov: Ja/Nee stonden 1,5 s alleen in beeld terwijl Bliepo laadde). */
    await zeg(l, NAAM_GROET);
    log(l, "vraag", { zin: "startvraag" });
    zetTestAntwoord("Nee");
    haak(l, { soort: "kies", opties: ["Ja", "Nee"], goed: "Nee", poging: 1, vraag: "start" }, true);
    const pStart = l.kies(["Ja", "Nee"], { direct: true, weetniet: false });
    void zeg(l, ZIN.start).catch(() => {});
    st(l).naamKeer = 1;
    const start = await pStart;
    haak(l, null);
    log(l, "tik", { x: start });
    await l.wacht(DENK_MS);

    let uitleg = start !== "Ja";
    let vanaf = 0;
    const proefMis: number[] = [];
    if (start === "Ja") {
      await zeg(l, ZIN.proefBegin);
      let proefFouten = 0;
      for (let i = 0; i < 2 && !uitleg; i++) {
        const uit = await oefenKlok(l, i, () => ++proefFouten >= 2);
        if (uit === "gestopt") uitleg = true;
        else if (uit !== "goed") proefMis.push(i);
      }
      log(l, "proef", { fouten: proefFouten, uitleg });
      if (uitleg) {
        zet(l, { verhaal: null, getalKleur: null, ring: null, licht: null, hand: null, uurwijzer: "fel", minuutwijzer: "fel" });
        await zeg(l, ...ZIN.proefLastig);
        proefMis.length = 0;
      } else {
        await zeg(l, ZIN.proefGoed);
        vanaf = 2;
      }
    } else {
      /* Stap 2. Samen beginnen. Gaat vanzelf door. */
      await zeg(l, ZIN.samenBeginnen);
    }

    if (uitleg) await uitlegRoute(l);

    /* Stap 19. Het oefenblok: de 13 klokken van squla-klok-hoelaat-1. */
    const fouten = await oefenblok(l, vanaf, proefMis);

    /* Stap 21. Afsluiten: één slotzin, dan de kaart met een eindzin uit het rijtje. */
    zet(l, { verhaal: null, ring: null, licht: null, getalKleur: null, hand: null, uurwijzer: "fel", minuutwijzer: "fel" });
    await zeg(l, ZIN.slot);
    await l.wacht(DOOR_MS);
    log(l, "kaart", { fouten });
    const tik = l.kaart();
    speelLesgeluid("kaart");
    await zeg(l, st(l).foutVragen.size >= 4 ? EINDE_VEEL_FOUTEN : kies(l, EINDE));
    await tik;
  },
};

/** Stap 2 t/m 18 van het draaiboek: de route na "Nee" (en na een mislukte proef). */
async function uitlegRoute(l: Lesgids) {
  zet(l, { stand: { tijd: u(3) }, wijzers: false, verhaal: null });
  await l.wacht(600);

  /* Stap 3. De klok rolt uit tot een getallenlijn (± 3 s in het draaiboek). */
  void zeg(l, ZIN.lijnKijk).catch(() => {});
  speelLesgeluid("klokDraai");
  zet(l, { vorm: "lijn" });
  await l.wacht(2400);

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
  const zTik = zeg(l, ZIN.tikGetal);
  zTik.catch(() => {});
  await Promise.race([zTik, getikt]);
  log(l, "vraag-klaar");
  const hint = setTimeout(() => {
    if (klaar) return;
    log(l, "aanwijzing");
    zet(l, { hand: 5 });
    void zeg(l, ZIN.tikGetalHand).catch(() => {});
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

  /* Stap 7. Het hoogste punt; het driehoekje komt ± 4 s na de vraag. */
  const driehoek12 = setTimeout(() => zet(l, { driehoek: 12 }), 4000);
  await keuze(l, {
    id: "stap7-hoogste",
    voordoen: () => {
      zet(l, { driehoek: 12, ring: 12, ringWijzer: "uur", getalKleur: { n: 12, wijzer: "uur" } });
      return [];
    },
    kleineStap: VOORDOEN.getalTik(12, null),
  });
  clearTimeout(driehoek12);
  zet(l, { driehoek: null, ring: null, getalKleur: null });

  /* Stap 8. Het laagste punt; het driehoekje springt naar onder de 6. */
  const driehoek6 = setTimeout(() => zet(l, { driehoek: 6 }), 1500);
  await keuze(l, {
    id: "stap8-laagste",
    voordoen: () => {
      zet(l, { driehoek: 6, ring: 6, ringWijzer: "uur", getalKleur: { n: 6, wijzer: "uur" } });
      return [];
    },
    kleineStap: VOORDOEN.getalTik(6, null),
  });
  clearTimeout(driehoek6);
  zet(l, { driehoek: null, ring: null, getalKleur: null });

  /* Stap 9. Wat komt na de 6? Met de klok mee (de blauwe pijl). */
  await keuze(l, {
    id: "stap9-na-6",
    bijGoed: () => zet(l, { pijl: { van: 6, naar: 7 } }),
    voordoen: () => {
      zet(l, { pijl: { van: 6, naar: 7 }, ring: 7, ringWijzer: "uur", getalKleur: { n: 7, wijzer: "uur" } });
      return [];
    },
    kleineStap: VOORDOEN.getalTik(7, null),
  });
  zet(l, { pijl: { van: 6, naar: 7 }, ring: null });
  await zegEnPijl(l, [ZIN.metDeKlokMee]);
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
  await zegEnPijl(l, [ZIN.tweeWijzers]);
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
  await zeg(l, ...ZIN.urenUitleg);
  await l.wacht(DOOR_MS);
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
  await zeg(l, ZIN.urenKlaar);
  await l.wacht(DOOR_MS);

  /* Stap 14. Zelf de kleine wijzer verzetten (3 keer). De grote wijzer is weer fel; eerst wacht Bliepo op de pijl. */
  zet(l, { licht: "minuut", minuutwijzer: "fel", uurwijzer: "fel", getalKleur: null, ring: null });
  await zegEnPijl(l, [ZIN.groteWijzerKijk]);
  zet(l, { licht: null });
  await zetUur(l, 2);
  await zeg(l, ZIN.na2);
  zet(l, { getalKleur: null });
  await zetUur(l, 3);
  await zeg(l, ZIN.na3);
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
  await zegEnPijl(l, ZIN.heelUur);
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
  await zeg(l, vanaf ? ZIN.oefenVerder : ZIN.oefenBegin);
  await l.wacht(DOOR_MS);
  let fouten = mis.length;
  for (let i = vanaf; i < KLOKKEN.length; i++) {
    /* Af en toe een overgangszin (BLIEPO-KARAKTER.md §12); meestal niet, want het draaiboek gaat vanzelf door. */
    if (i === 7) await zeg(l, kies(l, OVERGANG));
    if ((await oefenKlok(l, i)) !== "goed") {
      fouten++;
      mis.push(i);
    }
  }
  const nodig = Math.max(0, MINIMAAL - KLOKKEN.length);
  const terug = [...mis.slice(0, 3), ...RESERVE.filter((i) => !mis.includes(i))].slice(0, Math.max(nodig, Math.min(3, mis.length)));
  if (terug.length) {
    zet(l, { verhaal: null, ring: null, licht: null, getalKleur: null });
    await zeg(l, terug.length === 1 ? ZIN.terug1 : ZIN.terugN(terug.length));
    let weerFout = 0;
    for (const [n, i] of terug.entries()) {
      st(l).laatste = n === terug.length - 1;
      if ((await oefenKlok(l, i)) !== "goed") {
        fouten++;
        weerFout++;
      }
    }
    if (weerFout) await zeg(l, ZIN.terugLastig);
  }
  return fouten;
}

export const LESSEN_SQULA_KLOK_GOUDEN: Lesdraaiboek[] = [gouden];

/** Voor de rekencontrole: de klokken van het oefenblok (dezelfde als in squla-klok-hoelaat-1). */
export const GOUDEN_KLOKKEN = KLOKKEN;
export type { GoudenWijzer };
