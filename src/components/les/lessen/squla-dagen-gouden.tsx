/**
 * DE GOUDEN LES DAGEN (11 november 2026; BOUWREGELS hoofdstuk 15, 15.22, 15.25, 15.27–15.30; LESRECEPT.md).
 *
 *   squla-dagen-van-de-week-gouden — een NIEUWE versie naast squla-dagen-van-de-week "Dagen van de week" (BOUWREGELS
 *   15.8). De oude les (squla-dagen.tsx) en de oude weektrein (squla-dagen-trein.tsx) blijven precies zoals ze zijn; pas
 *   na akkoord van Sara vervangt deze versie de oude voor kinderen.
 *
 * Waarom deze Squla-les: het onderwerp "Dagen" heeft 1 les, "Dagen van de week" (squla-dagen-van-de-week; KOPPELING.md
 * §9). De lessen squla-tijd-dagen-1/2/3 horen bij het onderwerp "Tijd" (§10) en zijn niet aangeraakt. Zie
 * KEUZES-VOOR-SARA.md, Ronde 38.
 *
 * Inhoud (15.22 punt 1): die van squla-dagen-van-de-week. Dezelfde 17 vragen in dezelfde volgorde, met dezelfde dagen,
 * dezelfde dagkaarten en dezelfde goede antwoorden (bij het weekend zijn zaterdag én zondag goed, 14.30).
 *
 * Skelet: er is GEEN Synthesis-les over dagen of de week (KOPPELING.md §9). Volgens BOUWREGELS 15.25 krijgt Dagen EXACT
 * HETZELFDE SKELET als de andere gouden lessen (laag 1); het deel dat per onderwerp anders is (hulp in beeld, denkfouten,
 * hints, samen voordoen) is "EIGEN INVULLING, NIET VAN SYNTHESIS" (SYNTHESIS-ANALYSE/DRAAIBOEKEN-NIEUW/dagen.md).
 *   begin    geen startvraag (de oude "Kun je dit al?" komt uit de Squla-opbouw; er is geen draaiboek met een startvraag);
 *            de groet en het uitlegdeel in 1 stuk, met de hele weektrein in beeld;
 *   vraag    het beeld komt, de vraag met de keuzes tegelijk. Kiezen: tik op een wagon of een dagkaart (alleen een vinkje
 *            erop, 6.5) en dan op het vinkje van het lesscherm. "Er mist een dag": een opdracht, slepen (of tikken) naar
 *            de lege plek, dan het vinkje;
 *   goed     scherm 1 s groen, lof + korte reactie, een lichtgolf; de lege plek wordt gevuld; vanzelf door ±0,7 s (15.27);
 *   fout     1e fout: eerste zin uit de fouttabel (met een rood rondje om de gekozen wagon of kaart), dan de hint en het
 *            kind kiest opnieuw; 2e fout: uitleg, dan SAMEN (Bliepo wijst de dagen aan met het rondje, dan een rondje om
 *            de goede wagon of kaart en het kind tikt of sleept hem); nooit stoppen (15.18);
 *   hulp     hulphandje alleen bij opdrachten (slepen naar de lege plek, de kleine stap bij het samen voordoen), ± 6 s na
 *            de opdrachtzin; bij kiezen niets (15.19);
 *   snel     niets (er is geen draaiboek met een opmerking over snelheid; 6.10);
 *   einde    slotzin, de kaart, een eindzin uit het rijtje en "Tik op de kaart." (geen pijl op de kaart).
 *
 * De verder-pijl (15.27): Bliepo praat door; na elk stuk tekst gaat de les ±0,7 s na de stem vanzelf verder (`zegDoor`).
 * De pijl staat rechts onder de tekst als snelkoppeling. Bij vragen en opdrachten staat er geen pijl.
 *
 * Elke fout wordt met zijn denkfout vastgelegd en elke vraag met zijn uitkomst (goed in 1 keer, goed na een fout, samen
 * gedaan) in de tabel les_uitkomsten (bewaarUitkomst; zonder gekozen kind gebeurt er niets).
 */

import type { Lesdraaiboek, Lesgids } from "../soort";
import { KaartWeektrein } from "../vlakken/squla-dagen-trein";
import { DagenGoudenVlak, KBODEM, RAIL_Y, W, gatMidden, kaartX, plekX, type DagenGoudenProps, type Kies, type Punt } from "../vlakken/squla-dagen-gouden-vlak";
import { zetTestAntwoord } from "./squla-hulp";
import { speelLesgeluid } from "@/lib/lesgeluiden";
import { bliepoScherm } from "@/lib/bliepo-scherm";
import { bewaarUitkomst } from "@/app/lesuitkomstacties";
import {
  AANMOEDIG_DOEN,
  ALLE,
  BEVESTIG,
  EINDE,
  EINDE_VEEL_FOUTEN,
  LOF,
  LOF_KIJK_INDEX,
  MOMENT,
  NAAM_GROET,
  NAAM_LOF,
  ONDUIDELIJK,
  ONDUIDELIJK_NOG_1_KEER,
  OVERGANG,
  REACTIE_JA,
  REACTIE_ROBOT,
  VRAGEN,
  ZIN,
  beeldVan,
  dagenReactie,
  foutenVan,
  metNaam,
  naGoedBeeld,
  naam,
  opties,
  weekend2,
  type Fout,
  type Rijtje,
  type Vraag,
} from "./squla-dagen-gouden-zinnen";

const LES_ID = "squla-dagen-van-de-week-gouden";

/* ---------- tempo (laag 1, zoals de andere gouden lessen) ---------- */

/** Reactie na een tik (6.10a: 0,2 tot 0,4 s). */
const DENK_MS = 250;
/** Bij een opdracht: na zoveel stilte vanzelf het hulphandje (15.19: ± 6 s). */
const AANWIJZING_MS = 6000;
/** Zo lang na het einde van de stem komt het volgende stuk (zeg() wacht zelf al 0,3 s; samen ±0,7 s; 15.27). */
const DOOR_NA_MS = 400;
/** Vangnet bij een kleine stap (LESRECEPT, geleerd bij Splitsen en Meer-minder): na zoveel stilte doet Bliepo de stap zelf. */
const VANGNET_MS = 20000;
/** Vangnet bij slepen naar de lege plek: zo lang zonder nakijken, dan doen we het samen (zoals de ketting bij Vormen). */
const MIST_VANGNET_MS = 45000;

/* ---------- staat per les ---------- */

type Uitkomst = "goed" | "naFout" | "samen";
type Staat = {
  vorige: Map<Rijtje | string, number>;
  recent: Map<Rijtje | string, number[]>;
  zinNr: number;
  robotNr: number;
  namen: number;
  naamKeer: number;
  naamVraag: number;
  opRij: number;
  momenten: Set<string>;
  vraag: number;
  haak: number;
  laatste: boolean;
  eerste: Map<string, Uitkomst>;
  vraagFouten: Map<string, string[]>;
  log: unknown[];
  robotReactie: boolean;
  nakijk: number;
  nr: number;
  golf: number;
  samenNr: number;
  kaartUitgelegd: boolean;
  /** Wat het vlak nu laat zien (om plekken uit te rekenen). */
  m: DagenGoudenProps;
};
const STAAT = new WeakMap<Lesgids, Staat>();

const LEEG: Omit<DagenGoudenProps, "beeld"> = { wagons: null, kaarten: [], inGat: null, licht: [], vandaag: null, weekend: false, kies: null, hulphand: null };

const st = (l: Lesgids): Staat => {
  let s = STAAT.get(l);
  if (!s)
    STAAT.set(
      l,
      (s = { vorige: new Map(), recent: new Map(), zinNr: 0, robotNr: -99, namen: 0, naamKeer: 0, naamVraag: -99, opRij: 0, momenten: new Set(), vraag: 0, haak: 0, laatste: false, eerste: new Map(), vraagFouten: new Map(), log: [], robotReactie: false, nakijk: 0, nr: 0, golf: 0, samenNr: 0, kaartUitgelegd: false, m: { ...LEEG, beeld: "b0" } }),
    );
  return s;
};

/** Iets aan het beeld veranderen (en onthouden, voor de plekken). */
const zet = (l: Lesgids, p: Partial<DagenGoudenProps>) => {
  const s = st(l);
  s.m = { ...s.m, ...p };
  l.pasVlakAan<DagenGoudenProps>(p);
};
/** Een nieuw beeld (Bliepo tovert de trein tevoorschijn): alles van de vorige vraag weg. */
const nieuwBeeld = (l: Lesgids, p: Partial<DagenGoudenProps>) => {
  const s = st(l);
  zet(l, { ...LEEG, beeld: `b${++s.nr}`, ...p });
};
/** De lichtgolf bij goed (7.6: geen gloed om de keuze, wel een korte golf). */
const golf = (l: Lesgids, id: string) => zet(l, { golf: { id, n: ++st(l).golf } });

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

/** Voor de eigen test: wat de les nu vraagt (window.__phaser.dagTaak). */
function haak(l: Lesgids, info: Record<string, unknown> | null, nieuw = false) {
  if (typeof window === "undefined") return;
  const s = st(l);
  if (nieuw) s.vraag++;
  window.__phaser = { ...window.__phaser, dagTaak: info ? { ...info, n: ++s.haak, v: s.vraag } : null } as typeof window.__phaser;
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
  const naamU = { goed: "goed in één keer", naFout: "goed na een fout", samen: "samen gedaan" } as const;
  try {
    void bewaarUitkomst({ lesId: LES_ID, vraagId: vraag, uitkomst: naamU[uit], denkfouten: uit === "goed" ? [] : fouten, pogingen: uit === "goed" ? 1 : 2 }).catch(() => {});
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

/* ---------- het vaste rijtje (zelfde regels als de andere gouden lessen) ---------- */

const NAKIJK = /nakijk|nagekeken/i;
const woord = (z: string) => z.split(/[\s,:!.]/)[0].toLowerCase();

/** Een zin uit een rijtje; `sleutel` = welk rijtje (een reactie-rijtje wordt per vraag opnieuw gemaakt). */
function kies(l: Lesgids, r: Rijtje, zonder: number[] = [], sleutel: Rijtje | string = r): string {
  const s = st(l);
  s.zinNr++;
  const vorige = s.vorige.get(sleutel) ?? -1;
  /* Niet alleen niet 2 keer achter elkaar: ook geen zin die er net nog was (F7, 15.28). */
  const recent = (s.recent.get(sleutel) ?? []).slice(-Math.max(1, Math.min(8, r.zinnen.length - 3)));
  const robotMag = s.zinNr - s.robotNr > 6;
  /* "Nakijken" hooguit 2 keer per les, in lof, momenten en reacties samen (geleerd bij Splitsen). */
  const nakijkOp = s.nakijk >= 2;
  const mag = r.zinnen.map((_, i) => i).filter((i) => i !== vorige && !recent.includes(i) && !zonder.includes(i) && (robotMag || !r.robot.includes(i)) && !(nakijkOp && NAKIJK.test(r.zinnen[i])));
  const keuze = mag.length ? mag : r.zinnen.map((_, i) => i).filter((i) => i !== vorige && !zonder.includes(i) && !(nakijkOp && NAKIJK.test(r.zinnen[i])));
  const i = keuze[Math.floor(Math.random() * keuze.length)] ?? 0;
  s.vorige.set(sleutel, i);
  s.recent.set(sleutel, [...(s.recent.get(sleutel) ?? []), i]);
  if (r.robot.includes(i)) s.robotNr = s.zinNr;
  if (NAKIJK.test(r.zinnen[i])) s.nakijk++;
  return r.zinnen[i];
}

/** Lof bij goed in 1 keer: een speciaal moment, soms de naam, anders een lofzin; met een korte reactie. */
function lofZinnen(l: Lesgids, v: Vraag, dag: number, eerste: boolean): string[] {
  const s = st(l);
  s.opRij++;
  const moment = (n: keyof typeof MOMENT, nu: boolean) => {
    if (!nu || s.momenten.has(n)) return null;
    s.momenten.add(n);
    return kies(l, MOMENT[n]);
  };
  let lof = moment("laatste", s.laatste) ?? moment("eerste", eerste) ?? moment("drieOpRij", s.opRij >= 3);
  if (!lof && s.naamKeer < 2 && s.namen < 2 && s.vraag - s.naamVraag >= 4 && s.opRij >= 2 && l.naam) {
    s.naamKeer++;
    s.naamVraag = s.vraag;
    lof = kies(l, NAAM_LOF);
  }
  /* "Dat heb je goed gezien" alleen bij een kijkvraag: een wagon zoeken in de trein (tik). */
  lof ??= kies(l, LOF, v.soort === "tik" ? [] : [LOF_KIJK_INDEX]);
  const reactie = dagenReactie(v, dag);
  /* Lof en reactie beginnen niet met hetzelfde woord, en nooit 2 keer "Ja" (ook "ja" midden in de lofzin telt). */
  const zonder = reactie.zinnen.map((_, i) => i).filter((i) => woord(reactie.zinnen[i]) === woord(lof));
  if (/\bja\b/i.test(lof)) zonder.push(...REACTIE_JA);
  /* Een robotreactie hooguit 1 keer per les. */
  if (s.robotReactie || s.zinNr - s.robotNr <= 2) zonder.push(REACTIE_ROBOT);
  const r = kies(l, reactie, zonder, `reactie-${v.soort}`);
  if (r === reactie.zinnen[REACTIE_ROBOT]) s.robotReactie = true;
  return [lof, r];
}
const bevestig = (l: Lesgids) => {
  st(l).opRij = 0;
  return kies(l, BEVESTIG);
};
/** De eerste zin bij de 2e fout met een ander antwoord: "Nu koos je …" in plaats van weer "Je koos …". */
const nuKoos = (z: string) => z.replace(/^Je koos /, "Nu koos je ").replace(/^Je sleepte /, "Nu sleepte je ");
/** "Kom, we kijken samen." in 3 versies, om de beurt (LESRECEPT, geleerd bij de omzetting Tellen en Splitsen). */
const samenZin = (l: Lesgids) => ZIN.samen[st(l).samenNr++ % ZIN.samen.length];

function schud<T>(lijst: T[]): T[] {
  const a = [...lijst];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ---------- DE VERDER-PIJL (15.27, zoals de andere gouden lessen) ---------- */

/** Bliepo zegt een stuk tekst; de les gaat ±0,7 s na de stem vanzelf door. De pijl staat erbij; een tik = meteen door. */
async function zegDoor(l: Lesgids, ...zinnen: string[]): Promise<boolean> {
  zinnen = zinnen.filter(Boolean);
  if (!zinnen.length) return false;
  log(l, "pijl-door", { zin: zinnen.join(" ") });
  const p = l.verder();
  const z = zeg(l, ...zinnen);
  z.catch(() => {});
  const wie = await Promise.race([z.then(() => "gezegd" as const), p.then(() => "getikt" as const)]);
  if (wie === "getikt") {
    log(l, "pijl-getikt");
    return true;
  }
  log(l, "zin-klaar");
  const tik = await Promise.race([l.wacht(DOOR_NA_MS).then(() => false), p.then(() => true)]);
  if (tik) log(l, "pijl-getikt");
  return tik;
}

/** De zin bij een opdracht: geen pijl; de les wacht daarna op de opdracht. Doet het kind hem al tijdens de zin, dan meteen door. */
async function zegOpdracht(l: Lesgids, zinnen: string[], melding: Promise<unknown>) {
  log(l, "opdrachtzin", { zin: zinnen.join(" ") });
  l.verderWeg?.();
  const z = zeg(l, zinnen.join(" "));
  z.catch(() => {});
  await Promise.race([z, melding]);
}

/** Het hulphandje na ± 6 s stilte (gerekend vanaf het einde van de opdrachtzin), met 1 korte zin (alleen de 1e keer per opdracht). */
function handKlok(l: Lesgids, plek: () => { plek: Punt; naar?: Punt | null } | null, zin: string) {
  let gezegd = false;
  let weg = false;
  let klok: ReturnType<typeof setTimeout> | undefined;
  const zetAan = () => {
    clearTimeout(klok);
    if (weg) return;
    klok = setTimeout(() => {
      const p = plek();
      if (!p || weg) return;
      log(l, "aanwijzing");
      zet(l, { hulphand: { ...p, sleutel: `hand-${Date.now()}` } });
      if (!gezegd) {
        gezegd = true;
        void zeg(l, `${AANMOEDIG_DOEN[Math.floor(Math.random() * AANMOEDIG_DOEN.length)]} ${zin}`).catch(() => {});
      }
    }, AANWIJZING_MS);
  };
  return {
    opnieuw: () => {
      zet(l, { hulphand: null });
      zetAan();
    },
    /** Meteen het handje (bij het samen voordoen na een tik op iets anders: het antwoord staat dan al in beeld). */
    nu: () => {
      const p = plek();
      if (p && !weg) zet(l, { hulphand: { ...p, sleutel: `hand-${Date.now()}` } });
    },
    stop: () => {
      weg = true;
      clearTimeout(klok);
      zet(l, { hulphand: null });
    },
  };
}

/** Wat Bliepo zegt bij een fout, uit de fouttabel (zelfde regels als de andere gouden lessen). */
function foutZinnen(l: Lesgids, f: Fout, poging: 1 | 2, eerder: Fout | null): string[] {
  const eerste = f.eerste || kies(l, ONDUIDELIJK, poging === 2 ? [ONDUIDELIJK_NOG_1_KEER] : []);
  if (poging === 1) return [eerste, f.hint];
  /* "Weer" alleen als Bliepo de 1e keer al zei wat er mis was. */
  const zelfde = eerder !== null && eerder.soort === f.soort && f.weer.length > 0 && f.code !== "onduidelijk";
  return zelfde ? f.weer : [eerste, f.uitleg];
}
const onduidelijk = (): Fout => ({ code: "onduidelijk", soort: "onduidelijk", denkfout: "niet duidelijk", eerste: "", hint: "De dagen staan op volgorde in de trein. Kijk goed.", uitleg: "De week begint met maandag en eindigt met zondag.", weer: [], scherm: "", bewering: { soort: "alleen-c" }, over: [] });

/* ---------- plekken (punten van het vlak) ---------- */

/** Het handje schuin rechtsonder bij een wagon of kaart, niet over het plaatje zelf (geleerd bij Tellen). */
function handBij(l: Lesgids, id: string): Punt | null {
  const m = st(l).m;
  const dag = Number(id.slice(1));
  if (id[0] === "w") {
    const i = (m.wagons ?? []).indexOf(dag);
    return i < 0 ? null : { x: plekX(m.wagons!.length, i) + W * 0.82, y: RAIL_Y + 10 };
  }
  const i = (m.kaarten ?? []).indexOf(dag);
  return i < 0 ? null : { x: kaartX(m.kaarten!.length, i) + 46, y: KBODEM + 6 };
}

/* ---------- kiezen: tik op een wagon of kaart (vinkje) en dan op het vinkje van het lesscherm ---------- */

/**
 * Het kind tikt een wagon of kaart (alleen een vinkje erop; nog een tik haalt het weg, een andere neemt het over) en
 * dan het vinkje van het lesscherm (6.5). Een tik tijdens de vraagzin telt. Geen pijl.
 */
async function kiesDag(l: Lesgids, soort: "wagon" | "kaart", ids: number[], vinkjes: number[], zinnen: string[]): Promise<number> {
  let gekozen: number | null = null;
  const k = (): Kies => ({ soort, gekozen, tikbaar: ids, vinkjes });
  zet(l, { kies: k() });
  log(l, "vraag", { zin: zinnen.join(" "), opties: ids });
  l.verderWeg?.();
  const z = zeg(l, zinnen.join(" "));
  z.catch(() => {});
  void z.then(() => log(l, "vraag-klaar"), () => {});
  for (;;) {
    type Uit = { t: { soort: string; dag: number } | null };
    const tik: Promise<Uit> = l.wachtOpVlak<{ soort: string; dag: number }>("dagKies").then((t) => ({ t }));
    const knopP: Promise<Uit> | null = gekozen === null ? null : l.knoppen(["controleer"]).then(() => ({ t: null }));
    const r: Uit = await Promise.race(knopP ? [tik, knopP] : [tik]);
    if (!r.t) break;
    gekozen = gekozen === r.t.dag ? null : r.t.dag;
    log(l, "kies", { gekozen });
    speelLesgeluid("tik");
    zet(l, { kies: k() });
  }
  log(l, "tik", { x: gekozen });
  zet(l, { kies: { soort, gekozen, tikbaar: [], vinkjes } });
  return gekozen as number;
}

/**
 * De kleine stap bij het samen voordoen: het kind tikt de wagon of kaart met het rondje aan. Een tik op iets anders: het
 * handje wijst meteen het goede aan (het antwoord staat al in beeld). Vangnet: 20 s niets of 3 keer iets anders, dan doet
 * Bliepo het zelf. Geeft de dag die gekozen is, en of Bliepo het zelf deed.
 */
async function tikSamen(l: Lesgids, o: { soort: "wagon" | "kaart"; ids: number[]; goed: number[]; vinkjes: number[]; zin: string; handZin: string; vraag: string }): Promise<{ dag: number; zelf: boolean }> {
  zet(l, { kies: { soort: o.soort, gekozen: null, tikbaar: o.ids, vinkjes: o.vinkjes } });
  haak(l, { soort: "samenTik", invoer: o.soort, goed: o.goed, vraag: o.vraag });
  zetTestAntwoord(naam(o.goed[0]));
  const hand = handKlok(l, () => {
    const p = handBij(l, `${o.soort === "wagon" ? "w" : "k"}${o.goed[0]}`);
    return p ? { plek: p } : null;
  }, o.handZin);
  let eersteTik: (() => void) | null = null;
  const gedaan = new Promise<void>((r) => (eersteTik = r));
  void zegOpdracht(l, [o.zin], gedaan).then(() => hand.opnieuw(), () => {});
  let uit = { dag: o.goed[0], zelf: false };
  try {
    let mis = 0;
    for (;;) {
      const t = await Promise.race([l.wachtOpVlak<{ soort: string; dag: number }>("dagKies"), l.wacht(VANGNET_MS).then(() => null)]);
      (eersteTik as (() => void) | null)?.();
      if (t === null || (!o.goed.includes(t.dag) && ++mis >= 3)) {
        log(l, "vangnet", { mis });
        uit = { dag: o.goed[0], zelf: true };
        break;
      }
      log(l, "tik", { x: t.dag, samen: true });
      if (o.goed.includes(t.dag)) {
        uit = { dag: t.dag, zelf: false };
        break;
      }
      hand.nu();
    }
  } finally {
    hand.stop();
  }
  haak(l, null);
  zetTestAntwoord(null);
  zet(l, { kies: { soort: o.soort, gekozen: uit.dag, tikbaar: [], vinkjes: o.vinkjes } });
  return uit;
}

/** Samen voordoen bij een keuzevraag (2e fout, 15.11): Bliepo wijst de dagen aan, dan het rondje om het goede en het kind tikt. */
async function samenKies(l: Lesgids, v: Vraag, id: string, kaarten: number[]) {
  const d = v.dag;
  const a = v.goed[0];
  zet(l, { kies: null });
  await zegDoor(l, samenZin(l));
  let klaarZin: (dag: number) => string;
  let zelfZin: (dag: number) => string;
  let soort: "wagon" | "kaart" = "wagon";
  let ids = opties(v);
  let vinkjes: number[] = [];
  let jij = "";
  if (v.soort === "tik") {
    /* Met het rondje langs de wagons, vanaf maandag (vast tempo; een tik op de pijl zet alles meteen klaar). */
    let snel = await zegDoor(l, ZIN.samenTelBegin);
    for (let i = 0; i <= d && !snel; i++) {
      zet(l, { licht: [`w${i}`] });
      snel = await zegDoor(l, ZIN.samenTelDag(i));
    }
    zet(l, { licht: [`w${d}`] });
    jij = ZIN.samenTikJij(d);
    klaarZin = () => ZIN.samenTikKlaar(d);
    zelfZin = () => ZIN.samenTikZelf(d);
  } else if (v.soort === "na" || v.soort === "voor") {
    /* De hele trein in beeld (de kaarten blijven), rondje om de dag van de vraag en dan om de goede dag. */
    zet(l, { wagons: ALLE, licht: [`w${d}`] });
    await zegDoor(l, ZIN.samenHier(d));
    zet(l, { licht: [`w${a}`] });
    await zegDoor(l, v.soort === "na" ? ZIN.samenNa(d) : ZIN.samenVoor(d));
    zet(l, { licht: [`k${a}`] });
    soort = "kaart";
    ids = kaarten;
    jij = ZIN.samenKaartJij(a);
    klaarZin = () => (v.soort === "na" ? ZIN.samenNaKlaar(d) : ZIN.samenVoorKlaar(d));
    zelfZin = () => (v.soort === "na" ? ZIN.samenNaZelf(d) : ZIN.samenVoorZelf(d));
  } else if (v.soort === "gm" || v.soort === "gmMaandag") {
    const wat = v.wat!;
    if (v.soort === "gmMaandag") zet(l, { wagons: ALLE, vandaag: 0 });
    zet(l, { licht: [`w${d}`] });
    await zegDoor(l, ZIN.samenVandaag(d));
    zet(l, { licht: [`w${a}`] });
    await zegDoor(l, ZIN.samenGm(d, wat));
    if (v.soort === "gmMaandag") {
      zet(l, { licht: [`k${a}`] });
      soort = "kaart";
      ids = kaarten;
    }
    jij = v.soort === "gmMaandag" ? ZIN.samenKaartJij(a) : ZIN.samenGmJij(a);
    klaarZin = () => ZIN.samenGmKlaar(a, wat);
    zelfZin = () => ZIN.samenGmZelf(a, wat);
  } else if (v.soort === "weekend1") {
    zet(l, { licht: ["w5", "w6"] });
    await zegDoor(l, ZIN.samenWeekend);
    jij = ZIN.samenWeekendJij;
    klaarZin = (x) => ZIN.samenWeekendKlaar(x);
    zelfZin = () => ZIN.samenWeekendZelf;
  } else {
    vinkjes = [d];
    zet(l, { licht: [`w${a}`] });
    await zegDoor(l, ZIN.samenWeekend2(a));
    jij = ZIN.samenWeekend2Jij(a);
    klaarZin = () => ZIN.samenWeekend2Klaar;
    zelfZin = () => ZIN.samenWeekend2Zelf;
  }
  const uit = await tikSamen(l, { soort, ids, goed: v.goed, vinkjes, zin: jij, handZin: soort === "wagon" ? ZIN.handWagon : ZIN.handKaart, vraag: id });
  zet(l, { licht: [] });
  /* De kaart gaat de trein in (de kaarten weg); bij het weekend de haak eronder. */
  if (soort === "kaart") zet(l, { kaarten: [], kies: null });
  if (v.soort === "weekend2") zet(l, { weekend: true, kies: { soort: "wagon", gekozen: null, tikbaar: [], vinkjes: [5, 6] } });
  golf(l, `w${uit.dag}`);
  await l.wacht(DENK_MS);
  speelLesgeluid("goed");
  bliepoScherm("goed");
  await zegDoor(l, uit.zelf ? zelfZin(uit.dag) : klaarZin(uit.dag));
  return uit.dag;
}

/** Een keuzevraag (wagon of kaart). Geeft de uitkomst en de dag die goed was (voor de 2e weekendvraag). */
async function keuzeVraag(l: Lesgids, v: Vraag, eersteVraag: boolean, kaarten: number[]): Promise<{ uit: Uitkomst; dag: number }> {
  const s = st(l);
  const id = v.id;
  const soort: "wagon" | "kaart" = v.invoer === "kaart" ? "kaart" : "wagon";
  const fouten = foutenVan(v);
  const ids = soort === "kaart" ? kaarten : opties(v);
  const vinkjes = v.soort === "weekend2" ? [v.dag] : [];
  let zinnen = ZIN.vraag(v, soort === "kaart" && !s.kaartUitgelegd);
  if (soort === "kaart") s.kaartUitgelegd = true;
  let eerder: Fout | null = null;
  let eersteX: number | null = null;
  for (let poging = 1 as 1 | 2; poging <= 2; poging++) {
    zetTestAntwoord(naam(v.goed[0]));
    haak(l, { soort, opties: ids, goed: v.goed, fout: ids.filter((x) => !v.goed.includes(x)), poging, vraag: id }, poging === 1);
    const x = await kiesDag(l, soort, ids, vinkjes, zinnen);
    haak(l, null);
    zetTestAntwoord(null);
    await l.wacht(DENK_MS);
    if (v.goed.includes(x)) {
      /* De lege plek wordt gevuld (de kaarten weg, de wagon wipt op), zoals in de oude les. */
      if (soort === "kaart") zet(l, { wagons: naGoedBeeld(v, x), kaarten: [], kies: null });
      if (v.soort === "weekend2") zet(l, { weekend: true, kies: { soort: "wagon", gekozen: null, tikbaar: [], vinkjes: [5, 6] } });
      golf(l, `w${x}`);
      speelLesgeluid("goed");
      bliepoScherm("goed");
      const zz = poging === 1 ? lofZinnen(l, v, x, eersteVraag) : [bevestig(l)];
      log(l, "reactie", { soort: poging === 1 ? "goed" : "goed-na-fout", vraag: id, zin: zz.join(" ") });
      await zegDoor(l, ...zz);
      return { uit: noteer(l, id, poging === 1 ? "goed" : "naFout"), dag: x };
    }
    /* Geen fout-geluidje en geen rood op de keuze; alleen Bliepo's scherm kleurt rood (BOUWREGELS 5.3). Het vinkje gaat weg. */
    bliepoScherm("fout");
    s.opRij = 0;
    zet(l, { kies: null });
    const f = fouten[String(x)] ?? onduidelijk();
    legDenkfoutVast(l, { vraag: id, antwoord: naam(x), denkfout: f.code, poging });
    const fz = foutZinnen(l, f, poging, eerder).filter(Boolean);
    if (poging === 2 && x === eersteX && fz[0] === f.eerste) fz[0] = ZIN.weerGekozen(v, x);
    /* Een ander fout antwoord bij de 2e fout: niet 2 keer "Je koos …" achter elkaar (keuring Tellen en Splitsen). */
    else if (poging === 2 && eerder && fz[0] === f.eerste) fz[0] = nuKoos(fz[0]);
    log(l, "reactie", { soort: `fout${poging}`, vraag: id, x, denkfout: f.code, zin: fz.join(" ") });
    /* Het rondje om de gekozen wagon of kaart zolang Bliepo hem noemt (7.8; nooit om het antwoord, 15.17). */
    const rondje = `${soort === "wagon" ? "w" : "k"}${x}`;
    zet(l, { licht: [rondje] });
    log(l, "rondje", { ids: [x], wanneer: "fout", goed: v.goed });
    await zegDoor(l, fz[0]);
    zet(l, { licht: [] });
    if (poging === 1) {
      /* 1e fout: de hint (die zegt waar het over gaat en eindigt met de vraag of de opdracht, F1) is de nieuwe vraagzin; de
         keuzes komen meteen terug (geen 2 keer de vraag, LESRECEPT Ronde 30). */
      zinnen = [...fz.slice(1)];
      eerder = f;
      eersteX = x;
      continue;
    }
    /* 2e fout (15.11): uitleg, dan samen; het kind tikt de goede wagon of kaart aan. */
    await zegDoor(l, ...fz.slice(1));
    const dag = await samenKies(l, v, id, kaarten);
    return { uit: noteer(l, id, "samen"), dag };
  }
  return { uit: noteer(l, id, "samen"), dag: v.goed[0] };
}

/* ---------- er mist een dag: slepen naar de lege plek (een opdracht), dan het vinkje ---------- */

/** Het handje bij de lege plek (daar moet een kaart heen; het zegt niet welke). */
const handGat = (l: Lesgids) => {
  const g = gatMidden(st(l).m.wagons ?? []);
  return g ? { plek: { x: g.x + 20, y: g.y + 24 } } : null;
};

/**
 * Wacht tot er een kaart in de lege plek ligt en het kind op het vinkje tikt (6.5). Het kind mag wisselen tot het vinkje.
 * Vangnet: na lange tijd zonder nakijken geeft dit `null`: dan doen we het samen.
 */
async function mistAntwoord(l: Lesgids, hand: ReturnType<typeof handKlok>, vangnetMs: number): Promise<number | null> {
  const tot = Date.now() + vangnetMs;
  for (;;) {
    const inGat = st(l).m.inGat ?? null;
    type Uit = { soort: string; dag?: number } | { soort: "vinkje" } | { soort: "tijd" };
    const ev: Promise<Uit> = l.wachtOpVlak<{ soort: string; dag: number }>(["gelegd", "terug"]);
    const knopP: Promise<Uit> | null = inGat !== null ? l.knoppen(["controleer"]).then(() => ({ soort: "vinkje" as const })) : null;
    const tijd: Promise<Uit> = l.wacht(Math.max(0, tot - Date.now())).then(() => ({ soort: "tijd" as const }));
    const r: Uit = await Promise.race(knopP ? [ev, knopP, tijd] : [ev, tijd]);
    if (r.soort === "tijd") return null;
    if (r.soort === "vinkje") return inGat;
    /* Het kind sleepte of tikte een kaart (voor de eigen test een actie van het kind, zoals een tik). */
    const dag = (r as { dag: number }).dag;
    log(l, "kies", { kaart: r.soort, dag });
    speelLesgeluid("tik");
    hand.opnieuw();
    zet(l, { inGat: r.soort === "gelegd" ? dag : null });
  }
}

async function samenMist(l: Lesgids, v: Vraag, id: string, kaarten: number[]) {
  const d = v.dag;
  zet(l, { inGat: null, kies: null });
  await zegDoor(l, samenZin(l));
  for (const [rondje, zin] of ZIN.samenMistBuren(d)) {
    zet(l, { licht: [rondje] });
    await zegDoor(l, zin);
  }
  zet(l, { licht: [`k${d}`] });
  await zegDoor(l, ZIN.samenMistDag(d));
  /* De kleine stap: het kind sleept (of tikt) de kaart naar de lege plek. Het handje doet het slepen voor. */
  zet(l, { kies: { soort: "sleep", gekozen: null, tikbaar: kaarten, vinkjes: [] } });
  haak(l, { soort: "samenSleep", goed: [d], vraag: id });
  zetTestAntwoord(naam(d));
  const hand = handKlok(l, () => {
    const g = gatMidden(st(l).m.wagons ?? []);
    const i = kaarten.indexOf(d);
    return g && i >= 0 ? { plek: { x: kaartX(kaarten.length, i) + 20, y: KBODEM - 20 }, naar: { x: g.x + 10, y: g.y + 4 } } : null;
  }, ZIN.handSleep);
  let eersteTik: (() => void) | null = null;
  const gedaan = new Promise<void>((r) => (eersteTik = r));
  void zegOpdracht(l, [ZIN.samenMistJij(d)], gedaan).then(() => hand.opnieuw(), () => {});
  let zelf = false;
  try {
    let mis = 0;
    for (;;) {
      const t = await Promise.race([l.wachtOpVlak<{ soort: string; dag: number }>(["gelegd", "terug"]), l.wacht(VANGNET_MS).then(() => null)]);
      (eersteTik as (() => void) | null)?.();
      if (t === null || (t.soort === "gelegd" && t.dag !== d && ++mis >= 3)) {
        log(l, "vangnet", { mis });
        zelf = true;
        break;
      }
      log(l, "kies", { kaart: t.soort, dag: t.dag, samen: true });
      if (t.soort === "gelegd" && t.dag === d) break;
      /* Een andere kaart: die gaat terug, en het handje doet het meteen voor. */
      zet(l, { inGat: null });
      hand.nu();
    }
  } finally {
    hand.stop();
  }
  haak(l, null);
  zetTestAntwoord(null);
  zet(l, { inGat: d, licht: [], kies: null });
  await l.wacht(300);
  zet(l, { wagons: ALLE, kaarten: [], inGat: null });
  golf(l, `w${d}`);
  await l.wacht(DENK_MS);
  speelLesgeluid("goed");
  bliepoScherm("goed");
  await zegDoor(l, zelf ? ZIN.samenMistZelf(d) : ZIN.samenMistKlaar);
}

async function mistVraag(l: Lesgids, v: Vraag, eersteVraag: boolean, kaarten: number[]): Promise<Uitkomst> {
  const s = st(l);
  const id = v.id;
  const d = v.dag;
  const fouten = foutenVan(v);
  /* Eerst wat er is (1 stuk, met de pijl), dan de opdracht: zo blijft elk stuk kort genoeg (15.30). */
  await zegDoor(l, ZIN.mistIntro);
  let opdracht = ZIN.vraag(v, false);
  let eerder: Fout | null = null;
  let eersteX: number | null = null;
  for (let poging = 1 as 1 | 2; poging <= 2; poging++) {
    zet(l, { inGat: null, kies: { soort: "sleep", gekozen: null, tikbaar: kaarten, vinkjes: [] } });
    haak(l, { soort: "mist", opties: kaarten, goed: [d], fout: kaarten.filter((x) => x !== d), poging, vraag: id }, poging === 1);
    zetTestAntwoord(naam(d));
    const hand = handKlok(l, () => handGat(l), ZIN.mistHand);
    let eersteTik: (() => void) | null = null;
    const gedaan = new Promise<void>((r) => (eersteTik = r));
    void zegOpdracht(l, opdracht, gedaan).then(() => hand.opnieuw(), () => {});
    let x: number | null;
    try {
      x = await mistAntwoord(l, hand, MIST_VANGNET_MS);
    } finally {
      hand.stop();
    }
    (eersteTik as (() => void) | null)?.();
    haak(l, null);
    zetTestAntwoord(null);
    zet(l, { kies: { soort: "sleep", gekozen: null, tikbaar: [], vinkjes: [] } });
    if (x === null) {
      /* Vangnet: lang niets nagekeken. Geen fout, wel samen voordoen (de les loopt nooit vast). */
      log(l, "vangnet", { mist: true });
      await zegDoor(l, ZIN.mistVangnet);
      await samenMist(l, v, id, kaarten);
      return noteer(l, id, "samen");
    }
    log(l, "tik", { x });
    await l.wacht(DENK_MS);
    if (x === d) {
      zet(l, { wagons: ALLE, kaarten: [], inGat: null, kies: null });
      golf(l, `w${d}`);
      speelLesgeluid("goed");
      bliepoScherm("goed");
      const zz = poging === 1 ? lofZinnen(l, v, d, eersteVraag) : [bevestig(l)];
      log(l, "reactie", { soort: poging === 1 ? "goed" : "goed-na-fout", vraag: id, zin: zz.join(" ") });
      await zegDoor(l, ...zz);
      return noteer(l, id, poging === 1 ? "goed" : "naFout");
    }
    bliepoScherm("fout");
    s.opRij = 0;
    const f = fouten[String(x)] ?? onduidelijk();
    legDenkfoutVast(l, { vraag: id, antwoord: naam(x), denkfout: f.code, poging });
    const fz = foutZinnen(l, f, poging, eerder).filter(Boolean);
    if (poging === 2 && x === eersteX && fz[0] === f.eerste) fz[0] = ZIN.weerGekozen(v, x);
    else if (poging === 2 && eerder && fz[0] === f.eerste) fz[0] = nuKoos(fz[0]);
    log(l, "reactie", { soort: `fout${poging}`, vraag: id, x, denkfout: f.code, zin: fz.join(" ") });
    /* De kaart schuift terug naar beneden; een rood rondje om die kaart zolang Bliepo hem noemt. */
    zet(l, { inGat: null, kies: null, licht: [`k${x}`] });
    log(l, "rondje", { ids: [x], wanneer: "fout", goed: [d] });
    await zegDoor(l, fz[0]);
    zet(l, { licht: [] });
    if (poging === 1) {
      /* 1e fout: de hint is de nieuwe opdrachtzin (bij een opdracht geen opdracht erachter, LESRECEPT Ronde 30). */
      opdracht = [...fz.slice(1)];
      eerder = f;
      eersteX = x;
      continue;
    }
    await zegDoor(l, ...fz.slice(1));
    await samenMist(l, v, id, kaarten);
    return noteer(l, id, "samen");
  }
  return noteer(l, id, "samen");
}

/* ---------- een vraag ---------- */

async function speelVraag(l: Lesgids, v: Vraag, o: { eerste: boolean; nieuw: boolean }): Promise<{ uit: Uitkomst; dag: number }> {
  const kaarten = schud(v.kaarten);
  if (o.nieuw) {
    void l.zeg().catch(() => {});
    const b = beeldVan(v);
    nieuwBeeld(l, { wagons: b.wagons, vandaag: b.vandaag, kaarten });
    speelLesgeluid("verschijn");
    await l.wacht(150);
  }
  if (v.invoer === "sleep") return { uit: await mistVraag(l, v, o.eerste, kaarten), dag: v.dag };
  return keuzeVraag(l, v, o.eerste, kaarten);
}

/* ---------- de les ---------- */

const gouden: Lesdraaiboek = {
  id: "squla-dagen-van-de-week-gouden",
  titel: "Dagen van de week",
  /* Begint met "Squla": dan kleurt het lesscherm de getallen in Bliepo's tekst (data-squla; geleerd bij Tellen). */
  synthesis: "Squla groep 3 · Tijd · Dagen van de week · gouden les (nieuwe versie van squla-dagen-van-de-week) · geen Synthesis-les: skelet van de gouden lessen, eigen invulling",
  indeling: "synthesis",
  browserstem: true,
  /* BOUWREGELS 15.27: zinnen van 1 stuk onder elkaar, pijl rechts als snelkoppeling, een tik stopt de stem. */
  pijlZoalsSynthesis: true,
  /* Bliepo praat zijn zinnen helemaal uit (15.27 punt 5; lib/stem.ts heelUitpraten). */
  stemHeelUitpraten: true,
  /* Elk woord licht op als Bliepo het zegt, ook met de browserstem (BOUWREGELS 3.7; lib/stem.ts woordenMee). */
  woordenMeeMetStem: true,
  nacht: true,
  kaarttekening: KaartWeektrein,
  async speel(l) {
    STAAT.delete(l);
    log(l, "start");
    /* Het beeld op het beginscherm (4.1): de hele weektrein, zoals de oude les. */
    const s = st(l);
    s.m = { ...LEEG, beeld: `b${++s.nr}`, wagons: ALLE };
    l.vlak<DagenGoudenProps>(DagenGoudenVlak, { ...s.m });
    speelLesgeluid("verschijn");
    await l.wacht(600);

    /* Het begin (geen startvraag): de groet en het uitlegdeel in 1 stuk. Zonder eerdere tik zegt Bliepo het bij de
       eerste tik (lib/stem.ts heelUitpraten). */
    await zegDoor(l, NAAM_GROET, ZIN.start);
    st(l).naamKeer = 1;
    st(l).naamVraag = 0;

    /* De 17 vragen van squla-dagen-van-de-week. */
    let weekendDag = 5;
    for (let i = 0; i < VRAGEN.length; i++) {
      st(l).laatste = i === VRAGEN.length - 1;
      /* Af en toe een overgangszin (BLIEPO-KARAKTER.md §12); meestal niet, het tempo gaat voor. */
      if (i === 10) await zegDoor(l, kies(l, OVERGANG));
      const v = VRAGEN[i].soort === "weekend2" ? weekend2(weekendDag) : VRAGEN[i];
      /* Vraag 1 gebruikt de trein van het beginscherm; de 2e weekendvraag de trein van de 1e (met het vinkje erop). */
      const nieuw = !(i === 0 || v.soort === "weekend2");
      const r = await speelVraag(l, v, { eerste: i === 0, nieuw });
      if (v.soort === "weekend1") weekendDag = r.dag;
    }

    /* Einde: slotzin, kaart, eindzin uit het rijtje en wat het kind met de kaart doet (geen pijl). */
    void l.zeg().catch(() => {});
    nieuwBeeld(l, { wagons: ALLE, weekend: false });
    await zegDoor(l, ZIN.slot);
    log(l, "kaart");
    l.verderWeg?.();
    const tik = l.kaart();
    speelLesgeluid("kaart");
    await zeg(l, `${veelFouten(l) ? EINDE_VEEL_FOUTEN : kies(l, EINDE)} ${ZIN.kaartTik}`);
    await tik;
  },
};

export const LESSEN_SQULA_DAGEN_GOUDEN: Lesdraaiboek[] = [gouden];
