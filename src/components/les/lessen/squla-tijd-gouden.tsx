/**
 * DE GOUDEN LES TIJD (11 november 2026; BOUWREGELS hoofdstuk 15, 15.22, 15.25, 15.27–15.30; LESRECEPT.md).
 *
 *   squla-tijd-dagen-1-gouden — een NIEUWE versie naast squla-tijd-dagen-1 "Dagen van de week" (level 1; BOUWREGELS
 *   15.8). De oude les (squla-tijd.tsx) en de oude weektrein (squla-tijd-trein.tsx) blijven precies zoals ze zijn; pas na
 *   akkoord van Sara vervangt deze versie de oude voor kinderen.
 *
 * Waarom deze Squla-les: het onderwerp "Tijd" heeft 7 lessen (dagen-1/2/3, kalender-1/2, tijden-1/2; KOPPELING.md §10).
 * Klokkijken heeft al een gouden les (squla-klok-hoelaat-1-gouden). Dit is de eerste Tijd-les, level 1, en nog zonder
 * gouden les. Zie KEUZES-VOOR-SARA.md, Ronde 40.
 *
 * Inhoud (15.22 punt 1): die van squla-tijd-dagen-1. Dezelfde 12 vragen in dezelfde volgorde, met dezelfde dagen,
 * dagkaarten, getallen en goede antwoorden, en daarna 3 vragen die terugkomen (eerst wat niet meteen goed was, aangevuld
 * met vraag 1, 3 en 9), zoals de oude les.
 *
 * Skelet: er is GEEN Synthesis-les over dagen of de week (KOPPELING.md §10). Volgens BOUWREGELS 15.25 krijgt Tijd EXACT
 * HETZELFDE SKELET als de andere gouden lessen (laag 1); het deel dat per onderwerp anders is (hulp in beeld, denkfouten,
 * hints, samen voordoen) is "EIGEN INVULLING, NIET VAN SYNTHESIS" (SYNTHESIS-ANALYSE/DRAAIBOEKEN-NIEUW/tijd.md). Het
 * verloop is dat van de gouden les Dagen (zelfde weektrein), met 2 soorten vragen erbij: getallen (knoppen bij Bliepo,
 * zoals "Wat is dit?" bij Geld) en kaarten met 2 dagen.
 *   begin    geen startvraag; de groet en het uitlegdeel in 1 stuk, met de hele weektrein in beeld;
 *   vraag    het beeld komt, de vraag met de keuzes tegelijk. Kaart: tik (alleen een vinkje erop, 6.5) en dan het vinkje
 *            van het lesscherm. Getal: tik op de knop is het antwoord;
 *   goed     scherm 1 s groen, lof + korte reactie, een lichtgolf; de lege plek wordt gevuld of de hele trein rijdt
 *            binnen; vanzelf door ±0,7 s (15.27);
 *   fout     1e fout: eerste zin uit de fouttabel (met een rood rondje om de gekozen kaart), dan de hint en het kind kiest
 *            opnieuw; 2e fout: uitleg, dan SAMEN (Bliepo wijst de dagen aan met het rondje, dan een rondje om de goede
 *            kaart en het kind tikt hem; bij een getal tikt het kind het getal); nooit stoppen (15.18);
 *   hulp     hulphandje alleen bij de kleine stap op een kaart, ± 6 s na de opdrachtzin; bij kiezen niets (15.19);
 *   snel     niets (er is geen draaiboek met een opmerking over snelheid; 6.10);
 *   terug    3 vragen komen terug (de oude les), met een korte aankondiging;
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
import { KBODEM, TijdGoudenVlak, kaartX, type Punt, type TijdGoudenProps } from "../vlakken/squla-tijd-gouden-vlak";
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
  RESERVE,
  VRAGEN,
  ZIN,
  alsTerug,
  beeldVan,
  foutenVan,
  kaartNaam,
  lofLicht,
  metNaam,
  na,
  naGoedBeeld,
  tijdReactie,
  type Fout,
  type Rijtje,
  type Vraag,
} from "./squla-tijd-gouden-zinnen";

const LES_ID = "squla-tijd-dagen-1-gouden";

/* ---------- tempo (laag 1, zoals de andere gouden lessen) ---------- */

/** Reactie na een tik (6.10a: 0,2 tot 0,4 s). */
const DENK_MS = 250;
/** Bij een opdracht: na zoveel stilte vanzelf het hulphandje (15.19: ± 6 s). */
const AANWIJZING_MS = 6000;
/** Zo lang na het einde van de stem komt het volgende stuk (zeg() wacht zelf al 0,3 s; samen ±0,7 s; 15.27). */
const DOOR_NA_MS = 400;
/** Vangnet bij een kleine stap (LESRECEPT, geleerd bij Splitsen en Meer-minder): na zoveel stilte doet Bliepo de stap zelf. */
const VANGNET_MS = 20000;

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
  m: TijdGoudenProps;
};
const STAAT = new WeakMap<Lesgids, Staat>();

const LEEG: Omit<TijdGoudenProps, "beeld"> = { wagons: null, kaarten: [], licht: [], weekend: false, kies: null, hulphand: null };

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
const zet = (l: Lesgids, p: Partial<TijdGoudenProps>) => {
  const s = st(l);
  s.m = { ...s.m, ...p };
  l.pasVlakAan<TijdGoudenProps>(p);
};
/** Een nieuw beeld (Bliepo tovert de trein tevoorschijn): alles van de vorige vraag weg. */
const nieuwBeeld = (l: Lesgids, p: Partial<TijdGoudenProps>) => {
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

/** Voor de eigen test: wat de les nu vraagt (window.__phaser.tijdTaak). */
function haak(l: Lesgids, info: Record<string, unknown> | null, nieuw = false) {
  if (typeof window === "undefined") return;
  const s = st(l);
  if (nieuw) s.vraag++;
  window.__phaser = { ...window.__phaser, tijdTaak: info ? { ...info, n: ++s.haak, v: s.vraag } : null } as typeof window.__phaser;
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
function lofZinnen(l: Lesgids, v: Vraag, eerste: boolean): string[] {
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
  /* "Dat heb je goed gezien" niet: dit zijn geen kijkvragen (je zoekt niets in beeld, je weet het). */
  lof ??= kies(l, LOF, [LOF_KIJK_INDEX]);
  const reactie = tijdReactie(v);
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
const nuKoos = (z: string) => z.replace(/^Je koos /, "Nu koos je ");
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
function handKlok(l: Lesgids, plek: () => Punt | null, zin: string) {
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
      zet(l, { hulphand: { plek: p, sleutel: `hand-${Date.now()}` } });
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
      if (p && !weg) zet(l, { hulphand: { plek: p, sleutel: `hand-${Date.now()}` } });
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
const onduidelijk = (): Fout => ({ code: "onduidelijk", soort: "onduidelijk", denkfout: "niet duidelijk", eerste: "", hint: "De dagen staan op volgorde in de trein. Kijk goed.", uitleg: "De week begint met maandag en eindigt met zondag.", weer: [], scherm: "", rondje: false, bewering: { soort: "alleen-c" }, over: [] });

/* ---------- plekken (punten van het vlak) ---------- */

/** Het handje schuin rechtsonder bij een kaart, niet over het plaatje zelf (geleerd bij Tellen). */
function handBij(l: Lesgids, sl: string): Punt | null {
  const k = st(l).m.kaarten ?? [];
  const i = k.indexOf(sl);
  return i < 0 ? null : { x: kaartX(k, i) + 46, y: KBODEM + 6 };
}

/* ---------- kiezen: tik op een kaart (vinkje) en dan op het vinkje van het lesscherm ---------- */

/**
 * Het kind tikt een kaart (alleen een vinkje erop; nog een tik haalt het weg, een andere neemt het over) en dan het
 * vinkje van het lesscherm (6.5). Een tik tijdens de vraagzin telt. Geen pijl.
 */
async function kiesKaart(l: Lesgids, ids: string[], zinnen: string[]): Promise<string> {
  let gekozen: string | null = null;
  zet(l, { kies: { gekozen, tikbaar: ids, vinkjes: [] } });
  log(l, "vraag", { zin: zinnen.join(" "), opties: ids });
  l.verderWeg?.();
  const z = zeg(l, zinnen.join(" "));
  z.catch(() => {});
  void z.then(() => log(l, "vraag-klaar"), () => {});
  for (;;) {
    type Uit = { t: { soort: string; id: string } | null };
    const tik: Promise<Uit> = l.wachtOpVlak<{ soort: string; id: string }>("dagKies").then((t) => ({ t }));
    const knopP: Promise<Uit> | null = gekozen === null ? null : l.knoppen(["controleer"]).then(() => ({ t: null }));
    const r: Uit = await Promise.race(knopP ? [tik, knopP] : [tik]);
    if (!r.t) break;
    gekozen = gekozen === r.t.id ? null : r.t.id;
    log(l, "kies", { gekozen });
    speelLesgeluid("tik");
    zet(l, { kies: { gekozen, tikbaar: ids, vinkjes: [] } });
  }
  log(l, "tik", { x: gekozen });
  zet(l, { kies: { gekozen, tikbaar: [], vinkjes: [] } });
  return gekozen as string;
}

/** De keuzeknoppen bij Bliepo tegelijk met de vraag (een getal). Een tik tijdens de zin telt. Geen pijl (l.kies vervangt hem). */
async function kiesGetal(l: Lesgids, opties: string[], zinnen: string[]): Promise<string> {
  const p = l.kies(opties, { direct: true, weetniet: false });
  log(l, "vraag", { zin: zinnen.join(" "), opties });
  /* De vraag is 1 uiting (LESRECEPT, geleerd bij Tellen en Meer-minder). */
  const z = zeg(l, zinnen.join(" "));
  z.catch(() => {});
  const eerst = await Promise.race([z.then(() => "gezegd" as const), p.then(() => "getikt" as const)]);
  if (eerst === "gezegd") log(l, "vraag-klaar");
  const x = (await p) ?? "";
  log(l, "tik", { x });
  return x;
}

/**
 * De kleine stap bij het samen voordoen: het kind tikt de kaart met het rondje aan. Een tik op een andere kaart: het
 * handje wijst meteen de goede aan (het antwoord staat al in beeld). Vangnet: 20 s niets of 3 keer iets anders, dan doet
 * Bliepo het zelf. Geeft terug of Bliepo het zelf deed.
 */
async function tikSamen(l: Lesgids, o: { ids: string[]; goed: string; zin: string; vraag: string }): Promise<boolean> {
  zet(l, { kies: { gekozen: null, tikbaar: o.ids, vinkjes: [] } });
  haak(l, { soort: "samenTik", goed: o.goed, vraag: o.vraag });
  zetTestAntwoord(kaartNaam(o.goed));
  const hand = handKlok(l, () => handBij(l, o.goed), ZIN.handKaart);
  let eersteTik: (() => void) | null = null;
  const gedaan = new Promise<void>((r) => (eersteTik = r));
  void zegOpdracht(l, [o.zin], gedaan).then(() => hand.opnieuw(), () => {});
  let zelf = false;
  try {
    let mis = 0;
    for (;;) {
      const t = await Promise.race([l.wachtOpVlak<{ soort: string; id: string }>("dagKies"), l.wacht(VANGNET_MS).then(() => null)]);
      (eersteTik as (() => void) | null)?.();
      if (t === null || (t.id !== o.goed && ++mis >= 3)) {
        log(l, "vangnet", { mis });
        zelf = true;
        break;
      }
      log(l, "tik", { x: t.id, samen: true });
      if (t.id === o.goed) break;
      hand.nu();
    }
  } finally {
    hand.stop();
  }
  haak(l, null);
  zetTestAntwoord(null);
  zet(l, { kies: { gekozen: o.goed, tikbaar: [], vinkjes: [] } });
  return zelf;
}

/** De kleine stap bij een getal: het kind tikt het getal (de enige knop bij Bliepo; zoals de klokles). */
async function tikGetalSamen(l: Lesgids, v: Vraag) {
  zetTestAntwoord(v.goed);
  haak(l, { soort: "samenGetal", goed: v.goed, vraag: v.id });
  const p = l.kies([v.goed], { direct: true, weetniet: false });
  log(l, "opdrachtzin", { zin: ZIN.samenGetalJij(v.goed) });
  const z = zeg(l, ZIN.samenGetalJij(v.goed));
  z.catch(() => {});
  await Promise.race([z, p]);
  await p;
  log(l, "tik", { x: v.goed, samen: true });
  haak(l, null);
  zetTestAntwoord(null);
}

/** Samen voordoen (2e fout, 15.11): Bliepo wijst de dagen aan met het rondje, dan doet het kind de kleine stap. */
async function samenDoen(l: Lesgids, v: Vraag, kaarten: string[]) {
  zet(l, { kies: null });
  await zegDoor(l, samenZin(l));
  /* De hele weektrein in beeld (de kaarten blijven staan). */
  zet(l, { wagons: ALLE, licht: [] });
  let klaar = "";
  let zelfZin = "";
  if (v.soort === "eerste" || v.soort === "laatste") {
    const d = v.soort === "eerste" ? 0 : 6;
    zet(l, { licht: [`w${d}`] });
    await zegDoor(l, v.soort === "eerste" ? ZIN.samenEerste : ZIN.samenLaatste);
    klaar = v.soort === "eerste" ? ZIN.samenEersteKlaar : ZIN.samenLaatsteKlaar;
    zelfZin = v.soort === "eerste" ? ZIN.samenEersteZelf : ZIN.samenLaatsteZelf;
  } else if (v.soort === "weekendWelke") {
    zet(l, { licht: ["w0", "w1", "w2", "w3", "w4"] });
    await zegDoor(l, ZIN.samenSchool);
    zet(l, { licht: ["w5", "w6"] });
    await zegDoor(l, ZIN.samenWeekendDagen);
    klaar = ZIN.samenWelkeKlaar;
    zelfZin = ZIN.samenWelkeZelf;
  } else if (v.soort === "na") {
    const d = v.dag;
    zet(l, { licht: [`w${d}`] });
    await zegDoor(l, ZIN.samenHier(d));
    zet(l, { licht: [`w${na(d)}`] });
    await zegDoor(l, ZIN.samenNa(d));
    klaar = ZIN.samenNaKlaar(d);
    zelfZin = ZIN.samenNaZelf(d);
  } else if (v.soort === "weekendHoeveel") {
    zet(l, { licht: ["w0", "w1", "w2", "w3", "w4"] });
    await zegDoor(l, ZIN.samenSchool);
    zet(l, { licht: ["w5", "w6"] });
    await zegDoor(l, ZIN.samenWeekendTel);
  } else {
    /* Hoeveel dagen heeft een week: met het rondje langs de wagons (vast tempo; een tik op de pijl zet alles klaar). */
    let snel = await zegDoor(l, ZIN.samenTelBegin);
    for (let i = 0; i < 7 && !snel; i++) {
      zet(l, { licht: [`w${i}`] });
      snel = await zegDoor(l, ZIN.samenTelDag(i));
    }
    /* Geen rondje om de hele trein: dat zou tot onder het tekstvak lopen (15.30). */
    zet(l, { licht: [] });
    await zegDoor(l, ZIN.samenWeekTel);
  }
  if (v.invoer === "getal") {
    /* Het getal is een knop bij Bliepo: het rondje blijft om de wagons waar Bliepo over praat. */
    await tikGetalSamen(l, v);
    zet(l, { licht: [] });
    await l.wacht(DENK_MS);
    speelLesgeluid("goed");
    bliepoScherm("goed");
    await zegDoor(l, v.soort === "weekendHoeveel" ? ZIN.samenWeekendKlaar : ZIN.samenWeekKlaar);
    return;
  }
  /* Een rondje om de goede kaart; het kind tikt hem aan. */
  zet(l, { licht: [`k${v.goed}`] });
  const zelf = await tikSamen(l, { ids: kaarten, goed: v.goed, zin: ZIN.samenKaartJij(v.goed), vraag: v.id });
  zet(l, { licht: [], kaarten: [], kies: null, weekend: v.soort === "weekendWelke" });
  golf(l, v.soort === "na" ? `w${na(v.dag)}` : `w${v.soort === "eerste" ? 0 : v.soort === "laatste" ? 6 : 5}`);
  await l.wacht(DENK_MS);
  speelLesgeluid("goed");
  bliepoScherm("goed");
  await zegDoor(l, zelf ? zelfZin : klaar);
}

/* ---------- een vraag ---------- */

async function speelVraag(l: Lesgids, v: Vraag, eersteVraag: boolean): Promise<Uitkomst> {
  const s = st(l);
  const id = v.id;
  const kaarten = v.invoer === "kaart" ? schud(v.keuzes) : [];
  const knoppen = v.invoer === "getal" ? schud(v.keuzes) : [];
  void l.zeg().catch(() => {});
  nieuwBeeld(l, { wagons: beeldVan(v), kaarten });
  speelLesgeluid("verschijn");
  await l.wacht(150);
  const fouten = foutenVan(v);
  let zinnen = ZIN.vraag(v, v.invoer === "kaart" && !s.kaartUitgelegd);
  if (v.invoer === "kaart") s.kaartUitgelegd = true;
  let eerder: Fout | null = null;
  let eersteX: string | null = null;
  for (let poging = 1 as 1 | 2; poging <= 2; poging++) {
    const opties = v.invoer === "kaart" ? kaarten : knoppen;
    zetTestAntwoord(v.invoer === "kaart" ? kaartNaam(v.goed) : v.goed);
    haak(l, { soort: v.invoer, opties, goed: v.goed, fout: opties.filter((x) => x !== v.goed), poging, vraag: id }, poging === 1);
    const x = v.invoer === "kaart" ? await kiesKaart(l, kaarten, zinnen) : await kiesGetal(l, knoppen, zinnen);
    haak(l, null);
    zetTestAntwoord(null);
    await l.wacht(DENK_MS);
    if (x === v.goed) {
      /* De lege plek wordt gevuld (de kaarten weg), of de hele trein rijdt binnen, zoals in de oude les. */
      zet(l, { wagons: naGoedBeeld(v), kaarten: [], kies: null, weekend: v.soort === "weekendWelke" });
      const plek = v.soort === "na" ? `w${na(v.dag)}` : v.soort === "eerste" ? "w0" : v.soort === "laatste" ? "w6" : "w5";
      golf(l, plek);
      speelLesgeluid("goed");
      bliepoScherm("goed");
      const zz = poging === 1 ? lofZinnen(l, v, eersteVraag) : [bevestig(l)];
      log(l, "reactie", { soort: poging === 1 ? "goed" : "goed-na-fout", vraag: id, zin: zz.join(" ") });
      /* Het rondje om zaterdag en zondag alleen als de reactie ze noemt (7.8; alle reacties bij het weekend doen dat). */
      if (poging === 1 && lofLicht(v).length) zet(l, { licht: lofLicht(v) });
      await zegDoor(l, ...zz);
      zet(l, { licht: [] });
      return noteer(l, id, poging === 1 ? "goed" : "naFout");
    }
    /* Geen fout-geluidje en geen rood op de keuze; alleen Bliepo's scherm kleurt rood (BOUWREGELS 5.3). Het vinkje gaat weg. */
    bliepoScherm("fout");
    s.opRij = 0;
    zet(l, { kies: null });
    const f = fouten[x] ?? onduidelijk();
    legDenkfoutVast(l, { vraag: id, antwoord: v.invoer === "kaart" ? kaartNaam(x) : x, denkfout: f.code, poging });
    const fz = foutZinnen(l, f, poging, eerder).filter(Boolean);
    if (poging === 2 && x === eersteX && fz[0] === f.eerste) fz[0] = ZIN.weerGekozen(v, x);
    /* Een ander fout antwoord bij de 2e fout: niet 2 keer "Je koos …" achter elkaar (keuring Tellen en Splitsen). */
    else if (poging === 2 && eerder && fz[0] === f.eerste) fz[0] = nuKoos(fz[0]);
    log(l, "reactie", { soort: `fout${poging}`, vraag: id, x, denkfout: f.code, zin: fz.join(" ") });
    /* Het rondje om de gekozen kaart zolang Bliepo hem noemt (7.8; nooit om het antwoord, 15.17). Bij een getal geen
       rondje: het antwoord is een knop bij Bliepo. */
    if (f.rondje) {
      zet(l, { licht: [`k${x}`] });
      log(l, "rondje", { ids: [x], wanneer: "fout", goed: v.goed });
    }
    await zegDoor(l, fz[0]);
    zet(l, { licht: [] });
    if (poging === 1) {
      /* 1e fout: de hint (die zegt waar het over gaat en eindigt met de vraag, F1) is de nieuwe vraagzin; de keuzes komen
         meteen terug (geen 2 keer de vraag, LESRECEPT Ronde 30). */
      zinnen = [...fz.slice(1)];
      eerder = f;
      eersteX = x;
      continue;
    }
    /* 2e fout (15.11): uitleg, dan samen; het kind tikt de goede kaart of het goede getal. */
    await zegDoor(l, ...fz.slice(1));
    await samenDoen(l, v, kaarten);
    return noteer(l, id, "samen");
  }
  return noteer(l, id, "samen");
}

/* ---------- de les ---------- */

const gouden: Lesdraaiboek = {
  id: "squla-tijd-dagen-1-gouden",
  titel: "Dagen van de week",
  /* Begint met "Squla": dan kleurt het lesscherm de getallen in Bliepo's tekst (data-squla; geleerd bij Tellen). */
  synthesis: "Squla groep 3 · Tijd · Dagen van de week · level 1 · gouden les (nieuwe versie van squla-tijd-dagen-1) · geen Synthesis-les: skelet van de gouden lessen, eigen invulling",
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
    l.vlak<TijdGoudenProps>(TijdGoudenVlak, { ...s.m });
    speelLesgeluid("verschijn");
    await l.wacht(600);

    /* Het begin (geen startvraag): de groet en het uitlegdeel in 1 stuk. Zonder eerdere tik zegt Bliepo het bij de
       eerste tik (lib/stem.ts heelUitpraten). */
    await zegDoor(l, NAAM_GROET, ZIN.start);
    st(l).naamKeer = 1;
    st(l).naamVraag = 0;

    /* De 12 vragen van squla-tijd-dagen-1. */
    const mis: number[] = [];
    for (let i = 0; i < VRAGEN.length; i++) {
      /* Af en toe een overgangszin (BLIEPO-KARAKTER.md §12); meestal niet, het tempo gaat voor. */
      if (i === 8) await zegDoor(l, kies(l, OVERGANG));
      if ((await speelVraag(l, VRAGEN[i], i === 0)) !== "goed") mis.push(i);
    }

    /* Daarna 3 vragen terug: eerst wat niet meteen goed was, aangevuld met de vaste reserve (zoals de oude les). */
    const terug = [...mis, ...RESERVE.filter((i) => !mis.includes(i))].slice(0, 3);
    void l.zeg().catch(() => {});
    nieuwBeeld(l, { wagons: ALLE });
    await zegDoor(l, mis.length ? (terug.length === 1 ? ZIN.terug1 : ZIN.terugN(terug.length)) : terug.length === 1 ? ZIN.extra1 : ZIN.extraN(terug.length));
    let weerFout = 0;
    for (const [n, i] of terug.entries()) {
      st(l).laatste = n === terug.length - 1;
      if ((await speelVraag(l, alsTerug(VRAGEN[i]), false)) !== "goed") weerFout++;
    }
    if (weerFout) await zegDoor(l, ZIN.terugLastig);

    /* Einde: slotzin, kaart, eindzin uit het rijtje en wat het kind met de kaart doet (geen pijl). */
    void l.zeg().catch(() => {});
    nieuwBeeld(l, { wagons: ALLE });
    await zegDoor(l, ZIN.slot);
    log(l, "kaart");
    l.verderWeg?.();
    const tik = l.kaart();
    speelLesgeluid("kaart");
    await zeg(l, `${veelFouten(l) ? EINDE_VEEL_FOUTEN : kies(l, EINDE)} ${ZIN.kaartTik}`);
    await tik;
  },
};

export const LESSEN_SQULA_TIJD_GOUDEN: Lesdraaiboek[] = [gouden];
