/**
 * DE GOUDEN LES PLUSSOMMEN (9 november 2026; BOUWREGELS hoofdstuk 15, 15.22, 15.25; LESRECEPT.md).
 *
 *   squla-plus-bakkerij-1-gouden — een NIEUWE versie naast squla-plus-bakkerij-1 "Plussommen in de bakkerij"
 *   (BOUWREGELS 15.8). De oude les (squla-plussommen.tsx) blijft precies zoals hij is; pas na akkoord van Sara vervangt
 *   deze versie de oude voor kinderen.
 *
 * Inhoud (15.22 punt 1): die van squla-plus-bakkerij-1. Dezelfde 16 vragen in dezelfde volgorde, dezelfde getallen (tot
 * 10), dezelfde keuzes (ook de foute, zoals 0 en 1) en hetzelfde lekkers, dezelfde disco en hetzelfde verbinden.
 *
 * Skelet (15.22 punt 3): het draaiboek Plussommen (Adding below 10, SYNTHESIS-ANALYSE/DRAAIBOEKEN-NIEUW/plussommen.md):
 *   stap 1  openen: geen startvraag en geen proef (§0); Bliepo groet, zegt wat we gaan doen en gaat vanzelf door;
 *   totaal  (§3 D, de verhaaltjes en de disco): de vraag met de keuzes tegelijk;
 *     - goed in 1 keer: scherm 1 s groen, lof + de som in kleur ("1 + 4 = 5"), vanzelf door na 0,5 s (geen pijl);
 *     - 1e fout: scherm 1,5 s rood, geen fout-geluidje; Bliepo zegt wat de keuze is en in welke richting het goede
 *       antwoord ligt (als dat niets verklapt), daarna dezelfde keuzes meteen terug met een hint (geen pijl);
 *     - 2e fout: korte uitleg, dan SAMEN verder tellen (de hulproute §3 C.5: het kind doet elke stap zelf): het kind
 *       tikt elk stuk lekkers van het 2e groepje (bij de disco: elke blauwe stip) en Bliepo telt mee; pijl; door (15.11);
 *     - goed na een fout: alleen een korte bevestiging met de som (§3 D.3);
 *   som     (§3 E, "welke som hoort erbij?"): idem; na de 2e fout wijst Bliepo de 2 groepjes aan ("erbij is plus") en
 *     tikt het kind de goede som (zoals de hulproute: alleen de goede is er nog);
 *   verbinden: EIGEN INVULLING, NIET VAN SYNTHESIS (15.22 punt 5): zelfde skelet; een opdracht, dus na ± 6 s stilte het
 *     hulphandje (15.19); nakijken pas na rust (0,7 s na de laatste lijn);
 *   heel snel: Bliepo zegt niets (§3 D.6); lang wachten bij een keuzevraag: niets (§4);
 *   stap 13 einde: een slotzin, de kaart, een eindzin uit het rijtje en "Tik op de kaart."
 *   Wat Synthesis verder heeft (tegels herkennen, aanvullen tot 5, 7 en 10, typen, omwisselen) zit er NIET in: de
 *   Squla-les heeft die vragen niet (KEUZES-VOOR-SARA.md, Ronde 22).
 *
 * Elke fout wordt met zijn denkfout vastgelegd en elke vraag met zijn uitkomst (goed in 1 keer, goed na een fout, samen
 * gedaan) in de tabel les_uitkomsten (bewaarUitkomst; zonder gekozen kind gebeurt er niets); mislukt dat, dan gaat de les
 * gewoon door.
 */

import type { Lesdraaiboek, Lesgids } from "../soort";
import { KaartBakkerij, type Kaart, type Lijn, type PlusBeeld } from "../vlakken/squla-plussommen-vlak";
import { GoudenPlusVlak, lekkersPlekken, stipPlek, verbindPlek, type GoudenPlusProps, type Punt } from "../vlakken/squla-plussommen-gouden-vlak";
import { KLEURHEX } from "../vlakken/squla-getalring";
import { VOORWERPEN_DISCO } from "../vlakken/squla-plussommen-tekenen";
import { zetTestAntwoord } from "./squla-hulp";
import { speelLesgeluid } from "@/lib/lesgeluiden";
import { bliepoScherm } from "@/lib/bliepo-scherm";
import { bewaarUitkomst } from "@/app/lesuitkomstacties";
import {
  AANMOEDIG_TIKKEN,
  BEVESTIG,
  BLAUW,
  EINDE,
  EINDE_VEEL_FOUTEN,
  LOF,
  LOF_KIJK_INDEX,
  MOMENT,
  NAAM_GROET,
  NAAM_LOF,
  ONDUIDELIJK,
  ONDUIDELIJK_NOG_1_KEER,
  ORANJE,
  OVERGANG,
  PLUSREACTIE,
  PLUSREACTIE_JA,
  PLUSREACTIE_ROBOT,
  VERBINDREACTIE,
  VERBINDREACTIE_JA,
  VRAGEN,
  ZIN,
  foutenVan,
  g,
  kleurenVan,
  metNaam,
  somTekst,
  verbindFout,
  type Disco,
  type Fout,
  type Rijtje,
  type Somkeuze,
  type Verbind,
  type Verhaal,
} from "./squla-plussommen-gouden-zinnen";

const LES_ID = "squla-plus-bakkerij-1-gouden";

/* ---------- tempo (draaiboek Plussommen §5) ---------- */

/** Reactie na een tik (6.10a: 0,2 tot 0,4 s; draaiboek: stem 0,0–0,5 s na de tik). */
const DENK_MS = 250;
/** Bij een opdracht: na zoveel stilte vanzelf het hulphandje (15.19: ± 6 s; draaiboek §4: 4,8–8,4 s). */
const AANWIJZING_MS = 6000;
/** Verbinden: zoveel rust na de laatste lijn voor het nakijken (geleerd bij Splitsen: nakijken pas na rust). */
const RUST_MS = 700;
/** De keuzes groot in het midden onder het lekkers (zoals de oude les, herstel 7 november). */
const MIDDEN_KEUZES = 578;

/* ---------- staat per les ---------- */

type Uitkomst = "goed" | "naFout" | "samen";
type Staat = {
  vorige: Map<Rijtje, number>;
  recent: Map<Rijtje, number[]>;
  zinNr: number;
  robotNr: number;
  namen: number;
  naamKeer: number;
  naamVraag: number;
  opRij: number;
  momenten: Set<string>;
  pijlUitgelegd: boolean;
  discoUitgelegd: boolean;
  verbindKeer: number;
  goed: number;
  fout: number;
  vraag: number;
  laatste: boolean;
  eerste: Map<string, Uitkomst>;
  vraagFouten: Map<string, string[]>;
  log: unknown[];
  robotReactie: boolean;
  nakijk: number;
};
const STAAT = new WeakMap<Lesgids, Staat>();
const st = (l: Lesgids): Staat => {
  let s = STAAT.get(l);
  if (!s)
    STAAT.set(
      l,
      (s = { vorige: new Map(), recent: new Map(), zinNr: 0, robotNr: -99, namen: 0, naamKeer: 0, naamVraag: -99, opRij: 0, momenten: new Set(), pijlUitgelegd: false, discoUitgelegd: false, verbindKeer: 0, goed: 0, fout: 0, vraag: 0, laatste: false, eerste: new Map(), vraagFouten: new Map(), log: [], robotReactie: false, nakijk: 0 }),
    );
  return s;
};

const zet = (l: Lesgids, p: Partial<GoudenPlusProps>) => l.pasVlakAan<GoudenPlusProps>(p);
const LEEG: Partial<GoudenPlusProps> = { sommen: [], actief: false, gekozen: [], uit: [], goedIds: [], lijnen: [], licht: [], lichtZacht: [], rek: null, tel: null, hand: null, vinkjes: [] };

/** Zinnen van Bliepo, met {naam} ingevuld (hooguit 2 keer per les; daarna valt de naam netjes weg). */
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

/* ---------- denkfouten en uitkomsten bewaren (zoals de andere gouden lessen) ---------- */

function legDenkfoutVast(l: Lesgids, d: { vraag: string; antwoord: string; denkfout: string; poging: number }) {
  const s = st(l);
  s.vraagFouten.set(d.vraag, [...(s.vraagFouten.get(d.vraag) ?? []), d.denkfout]);
  if (typeof window === "undefined") return;
  const w = window as unknown as { __denkfouten?: unknown[] };
  (w.__denkfouten ??= []).push({ les: LES_ID, tijd: new Date().toISOString(), ...d });
}

function noteer(l: Lesgids, vraag: string, uit: Uitkomst): Uitkomst {
  const s = st(l);
  if (!s.eerste.has(vraag)) s.eerste.set(vraag, uit);
  const fouten = s.vraagFouten.get(vraag) ?? [];
  s.vraagFouten.delete(vraag);
  if (typeof window === "undefined") return uit;
  const naam = { goed: "goed in één keer", naFout: "goed na een fout", samen: "samen gedaan" } as const;
  try {
    void bewaarUitkomst({ lesId: LES_ID, vraagId: vraag, uitkomst: naam[uit], denkfouten: uit === "goed" ? [] : fouten, pogingen: uit === "goed" ? 1 : 2 }).catch(() => {});
  } catch {
    /* bewaren mislukt: de les gaat gewoon door */
  }
  const w = window as unknown as { __uitkomsten?: unknown[] };
  (w.__uitkomsten ??= []).push({ les: LES_ID, vraag, uitkomst: { goed: "goed-in-een-keer", naFout: "goed-na-fout", samen: "samen-gedaan" }[uit], teltVoorBeheersing: uit === "goed", denkfouten: fouten, tijd: new Date().toISOString() });
  return uit;
}

/** "Volgende keer gaat het nog beter" alleen als de helft of meer niet in 1 keer goed was (15.13 punt 3). */
function veelFouten(l: Lesgids): boolean {
  const alle = [...st(l).eerste.values()];
  return alle.length > 0 && alle.filter((x) => x !== "goed").length * 2 >= alle.length;
}

/* ---------- het vaste rijtje (zelfde regels als de gouden lessen klok, Tellen en Splitsen) ---------- */

const NAKIJK = /nakijk|nagekeken/i;
const woord = (z: string) => z.split(/[\s,:!.]/)[0].toLowerCase();

function kies(l: Lesgids, r: Rijtje, zonder: number[] = []): string {
  const s = st(l);
  s.zinNr++;
  const vorige = s.vorige.get(r) ?? -1;
  /* Niet alleen niet 2 keer achter elkaar: ook geen zin die er net nog was (test 9 nov: dezelfde robotzin 2 keer in 1 les). */
  const recent = (s.recent.get(r) ?? []).slice(-Math.max(1, Math.min(8, r.zinnen.length - 3)));
  const robotMag = s.zinNr - s.robotNr > 6;
  /* "Nakijken" hooguit 2 keer per les, in lof, momenten en reacties samen (geleerd bij Splitsen). */
  const nakijkOp = s.nakijk >= 2;
  const mag = r.zinnen.map((_, i) => i).filter((i) => i !== vorige && !recent.includes(i) && !zonder.includes(i) && (robotMag || !r.robot.includes(i)) && !(nakijkOp && NAKIJK.test(r.zinnen[i])));
  const keuze = mag.length ? mag : r.zinnen.map((_, i) => i).filter((i) => i !== vorige && !zonder.includes(i));
  const i = keuze[Math.floor(Math.random() * keuze.length)] ?? 0;
  s.vorige.set(r, i);
  s.recent.set(r, [...(s.recent.get(r) ?? []), i]);
  if (r.robot.includes(i)) s.robotNr = s.zinNr;
  if (NAKIJK.test(r.zinnen[i])) s.nakijk++;
  return r.zinnen[i];
}

/** Lof bij goed in 1 keer: een speciaal moment, soms de naam, anders een lofzin; daarna de som (draaiboek §3 D.1). */
function lofZinnen(l: Lesgids, reactie: Rijtje, jaIndex: number[], robotIndex: number | null, eerste: boolean): string[] {
  const s = st(l);
  s.opRij++;
  const moment = (naam: keyof typeof MOMENT, nu: boolean) => {
    if (!nu || s.momenten.has(naam)) return null;
    s.momenten.add(naam);
    return kies(l, MOMENT[naam]);
  };
  let lof = moment("laatste", s.laatste) ?? moment("eerste", eerste) ?? moment("drieOpRij", s.opRij >= 3);
  if (!lof && s.naamKeer < 2 && s.namen < 2 && s.vraag - s.naamVraag >= 4 && s.opRij >= 2 && l.naam) {
    s.naamKeer++;
    s.naamVraag = s.vraag;
    lof = kies(l, NAAM_LOF);
  }
  /* "Dat heb je goed gezien" alleen bij kijkvragen (dit zijn rekenvragen). */
  lof ??= kies(l, LOF, [LOF_KIJK_INDEX]);
  /* Lof en reactie beginnen niet met hetzelfde woord, en nooit 2 keer "Ja" (ook "ja" midden in de lofzin telt). */
  const zonder = reactie.zinnen.map((_, i) => i).filter((i) => woord(reactie.zinnen[i]) === woord(lof));
  if (/\bja\b/i.test(lof)) zonder.push(...jaIndex);
  /* Een robotreactie hooguit 1 keer per les. */
  if (s.robotReactie && robotIndex !== null) zonder.push(robotIndex);
  const r = kies(l, reactie, zonder);
  if (robotIndex !== null && r === reactie.zinnen[robotIndex]) s.robotReactie = true;
  return [lof, r];
}
const bevestig = (l: Lesgids) => {
  st(l).opRij = 0;
  return kies(l, BEVESTIG);
};

function schud<T>(lijst: T[]): T[] {
  const a = [...lijst];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/*
 * DE VERDER-PIJL ZOALS SYNTHESIS (BOUWREGELS 15.27, Sara 10 november 2026; zoals de gouden klokles en
 * Lesdraaiboek.pijlZoalsSynthesis). Per stuk tekst (tabel in KEUZES-VOOR-SARA.md, Ronde 22):
 *   - de meeste stukken gaan VANZELF door (`zegDoor`): de pijl staat er tijdens het praten, is ±0,5 s na de stem weg en
 *     ±0,7 s na de stem komt het volgende stuk: groet, lof, goed na een fout, uitleg na de 2e fout, overgang;
 *   - WACHTEN op een tik (`zegEnPijl`): de hint na de 1e fout (daarna komt dezelfde vraag terug) en de zin die het samen
 *     voordoen afsluit (de som met het antwoord);
 *   - bij een vraag met keuzes nooit een pijl; bij een opdracht (verbinden, samen tellen) alleen tijdens de opdrachtzin
 *     (`zegOpdracht`); op de eindkaart geen pijl;
 *   - de zinnen van 1 stuk blijven onder elkaar staan; een tik tijdens het praten stopt de stem (het lesscherm doet dat).
 */
/** Na het einde van de stem (zeg() wacht zelf al 0,3 s): de pijl blijft nog zo lang, dan is hij weg (±0,5 s). */
const PIJL_NA_MS = 200;
/** En zo lang na het weghalen van de pijl komt het volgende stuk (samen ±0,7 s na het einde van de stem). */
const DOOR_NA_PIJL_MS = 200;

/** Bliepo zegt iets en wacht op de blauwe pijl. De pijl staat er vanaf het begin; een tik breekt de stem af. */
async function zegEnPijl(l: Lesgids, zinnen: string[], naFout = false) {
  const s = st(l);
  log(l, "pijl", { zin: zinnen.join(" ") });
  const p = l.verder();
  /* De eerste keer dat Bliepo op de pijl wacht, zegt hij wat de pijl doet (3.15); na een hint past "klaar met kijken" niet. */
  const uitleg = s.pijlUitgelegd ? [] : [naFout ? ZIN.pijlUitlegNaFout : ZIN.pijlUitleg];
  s.pijlUitgelegd = true;
  const z = zeg(l, ...zinnen, ...uitleg);
  z.catch(() => {});
  await Promise.race([z, p]);
  await p;
  log(l, "pijl-getikt");
}

/** Een stuk tekst dat vanzelf doorgaat; de pijl staat er alleen tijdens het praten (tik = de stem stopt, sneller door). */
async function zegDoor(l: Lesgids, zinnen: string[]) {
  zinnen = zinnen.filter(Boolean);
  if (!zinnen.length) return;
  log(l, "door", { zin: zinnen.join(" ") });
  const p = l.verder();
  const z = zeg(l, ...zinnen);
  z.catch(() => {});
  const wie = await Promise.race([z.then(() => "gezegd" as const), p.then(() => "getikt" as const)]);
  if (wie === "getikt") {
    log(l, "pijl-getikt");
    await l.wacht(100);
    return;
  }
  await l.wacht(PIJL_NA_MS);
  l.verderWeg?.();
  log(l, "pijl-weg");
  await l.wacht(DOOR_NA_PIJL_MS);
}

/**
 * De zin bij een opdracht: de pijl staat er tijdens het praten (een tik breekt de zin af), daarna is hij weg en wacht de
 * les op de opdracht. Doet het kind de opdracht al tijdens de zin (`gedaan`), dan is de pijl meteen weg.
 */
async function zegOpdracht(l: Lesgids, zinnen: string[], gedaan: Promise<unknown>) {
  log(l, "pijl-opdracht", { zin: zinnen.join(" ") });
  const p = l.verder();
  const z = zeg(l, ...zinnen);
  z.catch(() => {});
  const wie = await Promise.race([z.then(() => "gezegd" as const), p.then(() => "getikt" as const), gedaan.then(() => "gedaan" as const)]);
  if (wie === "gezegd") await l.wacht(PIJL_NA_MS);
  l.verderWeg?.();
  log(l, "pijl-weg");
}

/** De keuzeknoppen tegelijk met de zinnen (de vraag, of bij de 2e poging de hint). Een tik tijdens de zin telt. */
async function vraagMetKnoppen(l: Lesgids, opties: string[], zinnen: string[]): Promise<string> {
  const p = l.kies(opties, { direct: true, weetniet: false, midden: MIDDEN_KEUZES });
  log(l, "vraag", { zin: zinnen.join(" "), opties });
  const z = zeg(l, ...zinnen);
  z.catch(() => {});
  const eerst = await Promise.race([z.then(() => "gezegd" as const), p.then(() => "getikt" as const)]);
  const klaar = eerst === "gezegd" ? performance.now() : null;
  const x = (await p) ?? "";
  log(l, "tik", { x, naVraag: klaar ? Math.round(performance.now() - klaar) : -1 });
  return x;
}

/** Wat Bliepo zegt bij een fout, uit de fouttabel (zelfde regels als de andere gouden lessen). */
function foutZinnen(l: Lesgids, f: Fout, poging: 1 | 2, eerder: Fout | null): string[] {
  const eerste = f.eerste || kies(l, ONDUIDELIJK, poging === 2 ? [ONDUIDELIJK_NOG_1_KEER] : []);
  if (poging === 1) return [eerste, f.hint];
  /* "Weer" alleen als Bliepo de 1e keer al zei wat er mis was. */
  const zelfde = eerder !== null && eerder.soort === f.soort && !eerder.noot && !f.noot && f.weer.length > 0 && f.code !== "onduidelijk";
  return zelfde ? f.weer : [f.kort ?? eerste, f.uitleg];
}

/** Rood scherm, schudden, denkfout bewaren (BOUWREGELS 5.3, 15.9). */
function foutMoment(l: Lesgids, vraag: string, antwoord: string, f: Fout, poging: number) {
  const s = st(l);
  bliepoScherm("fout");
  zet(l, { fout: ++s.fout, hand: null });
  s.opRij = 0;
  legDenkfoutVast(l, { vraag, antwoord, denkfout: f.code, poging });
}

/** Groen scherm en de lichtgolf (5.3, 7.6). */
function goedMoment(l: Lesgids, extra: Partial<GoudenPlusProps> = {}) {
  const s = st(l);
  speelLesgeluid("goed");
  bliepoScherm("goed");
  zet(l, { goed: ++s.goed, licht: [], lichtZacht: [], hand: null, actief: false, ...extra });
}

/* ---------- het beeld ---------- */

/** Een nieuw beeld (Bliepo tovert het tevoorschijn); de zin van de vorige vraag gaat weg (geleerd bij Tellen). */
function toonBeeld(l: Lesgids, beeld: PlusBeeld, geluid = true) {
  l.som(null);
  zet(l, { ...LEEG, beeld });
  if (geluid) speelLesgeluid("verschijn");
}

/** De som bovenaan: a + b = ▢ (met het antwoord als het er al is), elk getal in zijn eigen kleur, het totaal wit (2.1). */
function somBoven(l: Lesgids, a: number, b: number, kleuren: [string, string], uitkomst?: number) {
  l.som([
    { t: "getal", n: a, kleur: KLEURHEX[kleuren[0]] ?? "#ffffff" },
    { t: "teken", s: "+" },
    { t: "getal", n: b, kleur: KLEURHEX[kleuren[1]] ?? "#ffffff" },
    { t: "teken", s: "=" },
    { t: "vak", waarde: uitkomst === undefined ? undefined : String(uitkomst), kleur: "#ffffff" },
  ]);
}

/**
 * Samen verder tellen (draaiboek §3 C.5: het kind doet elke stap zelf). Het kind tikt elke plek aan (in elke volgorde);
 * er komt het volgende getal op (vanaf `vanaf + 1`) en Bliepo zegt het. Een plek met een getal telt niet nog een keer.
 * Na ± 6 s stilte komt vanzelf het hulphandje bij een plek die echt nog geteld moet worden (15.19), de eerste keer met
 * een aanmoediging en 1 korte zin, daarna alleen het handje.
 */
async function samenTellen(l: Lesgids, o: { opdracht: string[]; plekken: Punt[]; vanaf: number; kleur: string; hex: string; handZin: string; maat?: number }) {
  const nummers = o.plekken.map(() => 0);
  let geteld = 0;
  let handGezegd = false;
  const tel = (tikbaar: boolean) => ({ plekken: o.plekken, nummers: [...nummers], kleur: o.hex, tikbaar, maat: o.maat });
  zet(l, { tel: tel(true), hand: null });
  const volgende = () => nummers.findIndex((x) => x === 0);
  zetTestAntwoord(`tel-${volgende()}`);
  let klok: ReturnType<typeof setTimeout> | undefined;
  const wachtOpHand = () => {
    clearTimeout(klok);
    klok = setTimeout(() => {
      const i = volgende();
      if (i < 0) return;
      /* De vingertop schuin rechtsonder de plek, in de ruimte ernaast (geleerd bij Tellen: niet over een ander ding). */
      const p = o.plekken[i];
      log(l, "aanwijzing", { i });
      zet(l, { hand: { plek: { x: p.x + 14, y: p.y + 16 }, sleutel: `tel-${i}-${Date.now()}` } });
      if (!handGezegd) {
        handGezegd = true;
        void zeg(l, `${AANMOEDIG_TIKKEN[Math.floor(Math.random() * AANMOEDIG_TIKKEN.length)]} ${o.handZin}`).catch(() => {});
      }
    }, AANWIJZING_MS);
  };
  log(l, "samen-tellen", { n: o.plekken.length });
  /* De opdrachtzin: de pijl staat er alleen tijdens het praten (15.27); een tik op een plek telt al. */
  let eersteTik: (() => void) | null = null;
  const gedaan = new Promise<void>((r) => (eersteTik = r));
  void zegOpdracht(l, o.opdracht, gedaan).catch(() => {});
  wachtOpHand();
  try {
    while (geteld < o.plekken.length) {
      const t = await l.wachtOpVlak<{ soort: string; index: number }>("telTik");
      (eersteTik as (() => void) | null)?.();
      if (nummers[t.index] > 0) continue;
      geteld++;
      nummers[t.index] = o.vanaf + geteld;
      const klaar = geteld === o.plekken.length;
      zet(l, { tel: tel(!klaar), hand: null });
      speelLesgeluid("tik");
      log(l, "tel-tik", { i: t.index, n: o.vanaf + geteld });
      if (!klaar) {
        zetTestAntwoord(`tel-${volgende()}`);
        void zeg(l, `${g(o.vanaf + geteld, o.kleur)}.`).catch(() => {});
        wachtOpHand();
      }
    }
  } finally {
    clearTimeout(klok);
    zet(l, { hand: null, tel: { plekken: o.plekken, nummers: [...nummers], kleur: o.hex, tikbaar: false, maat: o.maat } });
  }
}

/* ---------- (A) een verhaaltje: hoeveel samen? ---------- */

/** Het verhaal met het rode rondje om het groepje waar Bliepo het over heeft (7.8): eerst hier, dan daar. */
async function vertel(l: Lesgids, zinnen: [string, string, string]) {
  zet(l, { licht: [0], lichtZacht: [] });
  await zeg(l, zinnen[0]);
  zet(l, { licht: [1], lichtZacht: [] });
  await zeg(l, zinnen[1]);
  zet(l, { licht: [] });
}

async function verhaalVraag(l: Lesgids, v: Verhaal, eersteVraag: boolean): Promise<Uitkomst> {
  const s = st(l);
  s.vraag++;
  const [ka, kb] = kleurenVan(v);
  const somK: [string, string] = [ka, kb];
  const S = v.a + v.b;
  const goed = String(S);
  const opties = schud(v.keuzes).map(String);
  const fouten = foutenVan(v);
  const zinnen = v.zinnen(ka, kb);
  if (!eersteVraag) void l.zeg().catch(() => {});
  toonBeeld(l, { soort: "bakkerij", id: `gouden-${v.id}`, groepen: v.groepen }, !eersteVraag);
  somBoven(l, v.a, v.b, somK);
  await l.wacht(eersteVraag ? 200 : 600);
  await vertel(l, zinnen);
  let vraagZinnen = [zinnen[2]];
  let eerder: Fout | null = null;
  let eersteX = "";
  for (let poging = 1 as 1 | 2; poging <= 2; poging++) {
    zetTestAntwoord(goed);
    const x = await vraagMetKnoppen(l, opties, vraagZinnen);
    await l.wacht(DENK_MS);
    if (x === goed) {
      somBoven(l, v.a, v.b, somK, S);
      goedMoment(l);
      if (poging === 1) {
        const lof = lofZinnen(l, PLUSREACTIE(v.a, v.b, ka, kb), PLUSREACTIE_JA, PLUSREACTIE_ROBOT, eersteVraag);
        log(l, "reactie", { soort: "goed", vraag: v.id, zin: lof.join(" ") });
        await zegDoor(l, lof);
        return noteer(l, v.id, "goed");
      }
      const z = [bevestig(l), `${g(v.a, ka)} + ${g(v.b, kb)} = ${g(S)}.`];
      log(l, "reactie", { soort: "goed-na-fout", vraag: v.id, zin: z.join(" ") });
      await zegDoor(l, z);
      return noteer(l, v.id, "naFout");
    }
    const f = fouten[x] ?? totaalOnduidelijk();
    foutMoment(l, v.id, x, f, poging);
    const fz = foutZinnen(l, f, poging, eerder).filter(Boolean);
    if (poging === 2 && x === eersteX && fz[0] === f.eerste) fz[0] = ZIN.weerGekozen(g(Number(x)));
    log(l, "reactie", { soort: `fout${poging}`, vraag: v.id, x, denkfout: f.code, zin: fz.join(" ") });
    if (poging === 1) {
      /* 1e fout (draaiboek §3 D.2): de eerste zin, dan meteen dezelfde keuzes met de hint (geen pijl). */
      /* 15.27: de hint na de 1e fout wacht op de pijl; daarna komt dezelfde vraag terug. */
      await zegEnPijl(l, fz, true);
      vraagZinnen = [zinnen[2]];
      eerder = f;
      eersteX = x;
      continue;
    }
    /* 2e fout (15.11): uitleg, dan samen verder tellen; het kind tikt elk stuk lekkers van het 2e groepje. */
    await zegDoor(l, [...fz, ZIN.samenHelp]);
    const { plekken, cel } = lekkersPlekken(v.groepen);
    zet(l, { licht: [0] });
    await zegDoor(l, [ZIN.samenHier(v.a, v.namen[0], ka)]);
    zet(l, { licht: [1] });
    await samenTellen(l, {
      opdracht: [ZIN.samenVerder(v.a, ka, v.namen[1])], plekken: plekken[1], vanaf: v.a, kleur: kb, hex: KLEURHEX[kb] ?? "#ffffff", handZin: ZIN.samenHand(v.namen[1]), maat: Math.max(52, Math.min(80, cel * 0.9)) });
    zet(l, { licht: [] });
    somBoven(l, v.a, v.b, somK, S);
    await zegEnPijl(l, [ZIN.samenKlaar(S, v.wat, v.a, v.b, ka, kb)]);
    return noteer(l, v.id, "samen");
  }
  return noteer(l, v.id, "samen");
}

const totaalOnduidelijk = (): Fout => ({ code: "onduidelijk", soort: "onduidelijk", denkfout: "niet duidelijk", eerste: "", hint: "Tel ze nog eens samen.", uitleg: "We tellen ze samen.", weer: [], scherm: "", beperking: {} });

/* ---------- (B) welke som hoort erbij? ---------- */

async function somVraag(l: Lesgids, v: Somkeuze): Promise<Uitkomst> {
  const s = st(l);
  s.vraag++;
  const [ka, kb] = kleurenVan(v);
  const somK: [string, string] = [ka, kb];
  const S = v.a + v.b;
  const goed = somTekst(v.a, v.b);
  const opties = schud(v.opties);
  const fouten = foutenVan(v);
  const zinnen = v.zinnen(ka, kb);
  void l.zeg().catch(() => {});
  toonBeeld(l, { soort: "bakkerij", id: `gouden-${v.id}`, groepen: v.groepen });
  await l.wacht(600);
  await vertel(l, zinnen);
  let vraagZinnen = [zinnen[2]];
  let eerder: Fout | null = null;
  let eersteX = "";
  for (let poging = 1 as 1 | 2; poging <= 2; poging++) {
    zetTestAntwoord(goed);
    const x = await vraagMetKnoppen(l, opties, vraagZinnen);
    await l.wacht(DENK_MS);
    if (x === goed) {
      somBoven(l, v.a, v.b, somK, S);
      goedMoment(l);
      if (poging === 1) {
        const lof = lofZinnen(l, PLUSREACTIE(v.a, v.b, ka, kb), PLUSREACTIE_JA, PLUSREACTIE_ROBOT, false);
        log(l, "reactie", { soort: "goed", vraag: v.id, zin: lof.join(" ") });
        await zegDoor(l, lof);
        return noteer(l, v.id, "goed");
      }
      const z = [bevestig(l), `${g(v.a, ka)} + ${g(v.b, kb)} = ${g(S)}.`];
      log(l, "reactie", { soort: "goed-na-fout", vraag: v.id, zin: z.join(" ") });
      await zegDoor(l, z);
      return noteer(l, v.id, "naFout");
    }
    const f = fouten[x] ?? totaalOnduidelijk();
    foutMoment(l, v.id, x, f, poging);
    const fz = foutZinnen(l, f, poging, eerder).filter(Boolean);
    if (poging === 2 && x === eersteX && fz[0] === f.eerste) fz[0] = ZIN.weerGekozen(x);
    log(l, "reactie", { soort: `fout${poging}`, vraag: v.id, x, denkfout: f.code, zin: fz.join(" ") });
    if (poging === 1) {
      await zegEnPijl(l, fz, true);
      vraagZinnen = [zinnen[2]];
      eerder = f;
      eersteX = x;
      continue;
    }
    /* 2e fout (15.11): uitleg; Bliepo wijst de groepjes aan en zet de som klaar; het kind tikt de goede som (zoals de
       hulproute van het draaiboek §3 C.5: alleen het goede is er nog). */
    await zegDoor(l, [...fz, ZIN.samenKijk]);
    zet(l, { licht: [0] });
    await zegDoor(l, [ZIN.somEerst(v.a, v.namen[0], ka)]);
    zet(l, { licht: [1] });
    await zegDoor(l, [ZIN.somErbij(v.b, v.namen[1], kb)]);
    zet(l, { licht: [] });
    somBoven(l, v.a, v.b, somK, S);
    zetTestAntwoord(goed);
    await vraagMetKnoppen(l, [goed], [ZIN.somTik]);
    speelLesgeluid("tik");
    await zegEnPijl(l, [ZIN.somKlaar(v.a, v.b, ka, kb)]);
    return noteer(l, v.id, "samen");
  }
  return noteer(l, v.id, "samen");
}

/* ---------- samen tellen met de stippen (disco en verbinden: daar is geen lekkers) ---------- */

async function samenStippen(l: Lesgids, a: number, b: number) {
  zet(l, { rek: { rijen: 1, a, b } });
  await l.wacht(500);
  await zegDoor(l, [ZIN.stippen(a, b)]);
  await samenTellen(l, {
    opdracht: [ZIN.stippenVerder(a)], plekken: Array.from({ length: b }, (_, i) => stipPlek(a + i)), vanaf: a, kleur: BLAUW, hex: KLEURHEX[BLAUW], handZin: ZIN.stippenHand, maat: 54 });
}

/* ---------- (C) het discospel: welk kaartje hoort bij de som? ---------- */

async function discoVraag(l: Lesgids, v: Disco): Promise<Uitkomst> {
  const s = st(l);
  s.vraag++;
  const S = v.a + v.b;
  const goed = `c${S}`;
  const fouten = foutenVan(v);
  /* Een kale som: de getallen wijzen naar geen voorwerp, dus wit (2.1, 14.27). Bij de stippen: oranje en blauw. */
  const wit: [string, string] = ["wit", "wit"];
  const kaarten: Kaart[] = schud(v.kaarten).map((n) => ({ id: `c${n}`, tekst: [String(n)], aria: String(n) }));
  const ids = kaarten.map((k) => k.id);
  void l.zeg().catch(() => {});
  toonBeeld(l, { soort: "disco", id: `gouden-${v.id}`, vorm: "kaartje", kaarten });
  somBoven(l, v.a, v.b, wit);
  await l.wacht(600);
  let zinnen = s.discoUitgelegd ? [ZIN.disco(v.a, v.b)] : [ZIN.disco(v.a, v.b), ZIN.discoEerste];
  s.discoUitgelegd = true;
  let eerder: Fout | null = null;
  let eersteX = "";
  for (let poging = 1 as 1 | 2; poging <= 2; poging++) {
    zetTestAntwoord(goed);
    zet(l, { actief: true, uit: [] });
    const p = l.wachtOpVlak<{ soort: string; id: string }>("tik");
    log(l, "vraag", { zin: zinnen.join(" "), opties: ids });
    const z = zeg(l, ...zinnen);
    z.catch(() => {});
    const t = await p;
    /* Na een tik: de kaartjes worden dof en zijn niet meer te tikken (er komt niets om de keuze, 7.6). */
    zet(l, { actief: false, uit: ids });
    log(l, "tik", { x: t.id });
    await l.wacht(DENK_MS);
    const x = t.id.slice(1);
    if (t.id === goed) {
      somBoven(l, v.a, v.b, wit, S);
      goedMoment(l, { uit: [], goedIds: [goed] });
      if (poging === 1) {
        const lof = lofZinnen(l, PLUSREACTIE(v.a, v.b, "wit", "wit"), PLUSREACTIE_JA, PLUSREACTIE_ROBOT, false);
        log(l, "reactie", { soort: "goed", vraag: v.id, zin: lof.join(" ") });
        await zegDoor(l, lof);
        return noteer(l, v.id, "goed");
      }
      const zz = [bevestig(l), `${g(v.a)} + ${g(v.b)} = ${g(S)}.`];
      log(l, "reactie", { soort: "goed-na-fout", vraag: v.id, zin: zz.join(" ") });
      await zegDoor(l, zz);
      return noteer(l, v.id, "naFout");
    }
    const f = fouten[x] ?? totaalOnduidelijk();
    foutMoment(l, v.id, x, f, poging);
    const fz = foutZinnen(l, f, poging, eerder).filter(Boolean);
    if (poging === 2 && x === eersteX && fz[0] === f.eerste) fz[0] = ZIN.weerGekozen(g(Number(x)));
    log(l, "reactie", { soort: `fout${poging}`, vraag: v.id, x, denkfout: f.code, zin: fz.join(" ") });
    if (poging === 1) {
      await zegEnPijl(l, fz, true);
      zinnen = [ZIN.disco(v.a, v.b)];
      eerder = f;
      eersteX = x;
      continue;
    }
    /* 2e fout: uitleg, dan samen verder tellen met de stippen; daarna het goede kaartje. */
    await zegDoor(l, [...fz, ZIN.samenHelp]);
    somBoven(l, v.a, v.b, [ORANJE, BLAUW]);
    await samenStippen(l, v.a, v.b);
    somBoven(l, v.a, v.b, [ORANJE, BLAUW], S);
    await zegDoor(l, [ZIN.stippenKlaar(v.a, v.b)]);
    zet(l, { rek: null, tel: null, uit: [], goedIds: [goed] });
    /* Eerst de rij met stippen helemaal weg, dan pas over het kaartje praten. */
    await l.wacht(600);
    await zegEnPijl(l, [ZIN.discoKlaar(S)]);
    return noteer(l, v.id, "samen");
  }
  return noteer(l, v.id, "samen");
}

/* ---------- (D) verbinden: EIGEN INVULLING, NIET VAN SYNTHESIS ---------- */

async function verbindVraag(l: Lesgids, v: Verbind): Promise<Uitkomst> {
  const s = st(l);
  s.vraag++;
  const links: Kaart[] = v.sommen.map(([x, y], i) => ({ id: `s${i}`, tekst: [`${x} + ${y}`], aria: `${x} plus ${y}` }));
  const rechts: Kaart[] = schud(v.antwoorden.map((n, i) => ({ id: `a${i}`, tekst: [String(n)], aria: String(n) })));
  const juist = (sid: string) => {
    const [x, y] = v.sommen[Number(sid.slice(1))];
    return `a${v.antwoorden.indexOf(x + y)}`;
  };
  const waarde = (aid: string) => v.antwoorden[Number(aid.slice(1))];
  const plekVan = (id: string): Punt => (id.startsWith("s") ? verbindPlek("links", Number(id.slice(1))) : verbindPlek("rechts", rechts.findIndex((k) => k.id === id)));
  const lijnenVan = (p: Map<string, string>, stand: Lijn["stand"] = "nu"): Lijn[] => [...p].map(([van, naar]) => ({ van, naar, stand }));
  const eersteFout = (p: Map<string, string>) => [...p].find(([van, naar]) => juist(van) !== naar);
  void l.zeg().catch(() => {});
  toonBeeld(l, { soort: "verbind", id: `gouden-${v.id}`, links, rechts });
  await l.wacht(600);
  let zinnen = s.verbindKeer === 0 ? ZIN.verbind : ZIN.verbindKort;
  s.verbindKeer++;
  let eerder: Fout | null = null;
  for (let poging = 1 as 1 | 2; poging <= 2; poging++) {
    const paren = new Map<string, string>();
    let selS: string | null = null;
    let selA: string | null = null;
    let handGezegd = false;
    let klok: ReturnType<typeof setTimeout> | undefined;
    const teken = () => zet(l, { gekozen: [], lijnen: lijnenVan(paren), vinkjes: [selS, selA].filter((x): x is string => Boolean(x)).map(plekVan) });
    /* Een opdracht: na ± 6 s stilte vanzelf het hulphandje (15.19). Het wijst naar een som (de gekozen, of een zonder
       lijn), nooit naar een antwoord (15.17). */
    const wachtOpHand = () => {
      clearTimeout(klok);
      klok = setTimeout(() => {
        const som = selS ?? links.find((k) => !paren.has(k.id))?.id;
        if (!som) return;
        const p = plekVan(som);
        log(l, "aanwijzing", { som });
        zet(l, { hand: { plek: { x: p.x + 70, y: p.y + 22 }, sleutel: `verbind-${som}-${Date.now()}` } });
        const [x, y] = v.sommen[Number(som.slice(1))];
        const zin = selS ? ZIN.verbindHandGekozen(x, y) : ZIN.verbindHand;
        void zeg(l, handGezegd ? zin : `${AANMOEDIG_TIKKEN[Math.floor(Math.random() * AANMOEDIG_TIKKEN.length)]} ${zin}`).catch(() => {});
        handGezegd = true;
      }, AANWIJZING_MS);
    };
    log(l, "vraag", { zin: zinnen.join(" ") });
    let eersteTik: (() => void) | null = null;
    const gedaan = new Promise<void>((r) => (eersteTik = r));
    void zegOpdracht(l, zinnen, gedaan).catch(() => {});
    zet(l, { actief: true, uit: [], goedIds: [] });
    teken();
    wachtOpHand();
    try {
      for (;;) {
        zetTestAntwoord(selS ? juist(selS) : (links.find((k) => !paren.has(k.id))?.id ?? null));
        let t: { id: string } | null;
        if (paren.size === links.length) {
          /* Alles verbonden: pas nakijken na rust, zodat het kind nog een lijn kan veranderen (geleerd bij Splitsen). */
          t = await Promise.race([l.wachtOpVlak<{ soort: string; id: string }>("tik"), l.wacht(RUST_MS).then(() => null)]);
          if (!t) break;
        } else t = await l.wachtOpVlak<{ soort: string; id: string }>("tik");
        (eersteTik as (() => void) | null)?.();
        zet(l, { hand: null });
        wachtOpHand();
        const id = t.id;
        if (id.startsWith("s")) {
          if (selS === id) selS = null;
          else {
            paren.delete(id);
            selS = id;
          }
        } else if (selA === id) selA = null;
        else {
          for (const [k, w] of paren) if (w === id) paren.delete(k);
          selA = id;
        }
        if (selS && selA) {
          paren.set(selS, selA);
          selS = null;
          selA = null;
        }
        teken();
      }
    } finally {
      clearTimeout(klok);
      zet(l, { hand: null, actief: false, vinkjes: [] });
    }
    log(l, "tik", { x: [...paren].map(([a, b]) => `${a}-${b}`).join(",") });
    await l.wacht(DENK_MS);
    const fout = eersteFout(paren);
    if (!fout) {
      goedMoment(l, { lijnen: lijnenVan(paren, "goed") });
      if (poging === 1) {
        const lof = lofZinnen(l, VERBINDREACTIE, VERBINDREACTIE_JA, null, false);
        log(l, "reactie", { soort: "goed", vraag: v.id, zin: lof.join(" ") });
        await zegDoor(l, lof);
        return noteer(l, v.id, "goed");
      }
      const zz = [bevestig(l)];
      log(l, "reactie", { soort: "goed-na-fout", vraag: v.id, zin: zz.join(" ") });
      await zegDoor(l, zz);
      return noteer(l, v.id, "naFout");
    }
    const i = Number(fout[0].slice(1));
    const zGekozen = waarde(fout[1]);
    const f = verbindFout(v, i, zGekozen);
    const [x, y] = v.sommen[i];
    foutMoment(l, v.id, `${x} + ${y} → ${zGekozen}`, f, poging);
    const fz = foutZinnen(l, f, poging, eerder).filter(Boolean);
    log(l, "reactie", { soort: `fout${poging}`, vraag: v.id, x: `${x} + ${y} → ${zGekozen}`, denkfout: f.code, zin: fz.join(" ") });
    if (poging === 1) {
      /* De lijnen blijven staan terwijl Bliepo zegt welke som niet klopt (wit, geen rood: 5.3), daarna opnieuw. */
      await zegEnPijl(l, fz, true);
      zet(l, { lijnen: [] });
      zinnen = ZIN.verbindKort;
      eerder = f;
      continue;
    }
    /* 2e fout: uitleg, samen de som uitrekenen met de stippen, dan alle lijnen goed. */
    zet(l, { lijnen: [] });
    await zegDoor(l, [...fz, ZIN.verbindSamen(x, y)]);
    await samenStippen(l, x, y);
    await zegDoor(l, [ZIN.stippenKlaar(x, y)]);
    const alles = new Map(links.map((k) => [k.id, juist(k.id)] as [string, string]));
    zet(l, { rek: null, tel: null });
    await l.wacht(600);
    zet(l, { lijnen: lijnenVan(alles, "goed") });
    await zegEnPijl(l, [ZIN.verbindAlles(v.sommen)]);
    return noteer(l, v.id, "samen");
  }
  return noteer(l, v.id, "samen");
}

/* ---------- de les ---------- */

const gouden: Lesdraaiboek = {
  id: "squla-plus-bakkerij-1-gouden",
  titel: "Plussommen in de bakkerij",
  /* Begint met "Squla": dan kleurt het lesscherm de getallen in Bliepo's tekst (data-squla; geleerd bij Tellen). */
  synthesis: "Squla groep 3 · Plussommen · Plussommen · level 1 · gouden les (nieuwe versie van squla-plus-bakkerij-1) · verloop draaiboek Plussommen (Adding below 10)",
  indeling: "synthesis",
  browserstem: true,
  /* BOUWREGELS 15.27: zinnen van 1 stuk onder elkaar, een tik op de pijl stopt de stem (zoals de gouden klokles). */
  pijlZoalsSynthesis: true,
  kaarttekening: KaartBakkerij,
  nacht: true,
  voorwerpen: ["broodje", "brood", "bruin-brood", "koekje", "taart", "cupcake", "krentenbol", "croissant", "donut", ...VOORWERPEN_DISCO],
  async speel(l) {
    STAAT.delete(l);
    log(l, "start");
    /* Stap 1. Openen: het lekkers van vraag 1 staat er; Bliepo groet, zegt wat we gaan doen en gaat vanzelf door. */
    const v1 = VRAGEN[0] as Verhaal;
    l.vlak<GoudenPlusProps>(GoudenPlusVlak, { beeld: { soort: "bakkerij", id: `gouden-${v1.id}`, groepen: v1.groepen } });
    speelLesgeluid("verschijn");
    await l.wacht(600);
    st(l).naamKeer = 1;
    st(l).naamVraag = 0;
    await zegDoor(l, [NAAM_GROET, ZIN.begin]);

    /* De 16 vragen van squla-plus-bakkerij-1. */
    for (const [i, v] of VRAGEN.entries()) {
      st(l).laatste = i === VRAGEN.length - 1;
      /* Af en toe een overgangszin (BLIEPO-KARAKTER.md §12); meestal niet, het tempo gaat voor. */
      if (i === 8) await zegDoor(l, [kies(l, OVERGANG)]);
      if (v.soort === "verhaal") await verhaalVraag(l, v, i === 0);
      else if (v.soort === "som") await somVraag(l, v);
      else if (v.soort === "disco") await discoVraag(l, v);
      else await verbindVraag(l, v);
    }

    /* Stap 13. Einde: slotzin, kaart, eindzin uit het rijtje en wat het kind met de kaart doet. */
    l.som(null);
    zet(l, { ...LEEG, beeld: null });
    await zegDoor(l, [ZIN.slot]);
    log(l, "kaart");
    const tik = l.kaart();
    speelLesgeluid("kaart");
    await zeg(l, `${veelFouten(l) ? EINDE_VEEL_FOUTEN : kies(l, EINDE)} ${ZIN.kaartTik}`);
    await tik;
  },
};

export const LESSEN_SQULA_PLUSSOMMEN_GOUDEN: Lesdraaiboek[] = [gouden];
