/**
 * DE GOUDEN LES GELD (11 november 2026; BOUWREGELS hoofdstuk 15, 15.22, 15.25, 15.27–15.30; LESRECEPT.md).
 *
 *   squla-geld-geldmachine-1-gouden — een NIEUWE versie naast squla-geld-geldmachine-1 "Munten en briefjes"
 *   (BOUWREGELS 15.8). De oude les (squla-geld.tsx) blijft precies zoals hij is; pas na akkoord van Sara vervangt deze
 *   versie de oude voor kinderen.
 *
 * Waarom deze Squla-les: van de 6 Squla-lessen Geld (geldmachine 1–2, zakgeld 1–2, geld tellen 1–2) is "Munten en
 * briefjes" (geldmachine level 1) de eerste: munten en briefjes herkennen, en het getal op het geld lezen. De andere
 * lessen bouwen daarop voort (betalen, sparen, geld tellen). Sara keurde voor juist deze les het beginzinnetje goed
 * (BOUWREGELS 4.4). Zie KEUZES-VOOR-SARA.md, Ronde 34.
 *
 * Inhoud (15.22 punt 1): die van squla-geld-geldmachine-1. Dezelfde 12 vragen in dezelfde volgorde, met hetzelfde geld en
 * dezelfde keuzes, en daarna komen 3 vragen terug (eerst wat niet meteen goed was, aangevuld met de vaste reserve), zoals
 * de oude les: samen 15.
 *
 * Skelet: er is GEEN Synthesis-les over geld (KOPPELING.md §8). Volgens BOUWREGELS 15.25 krijgt Geld EXACT HETZELFDE
 * SKELET als de andere gouden lessen (laag 1); het deel dat per onderwerp anders is (uitleg, hulp in beeld, denkfouten,
 * hints, samen voordoen) is "EIGEN INVULLING, NIET VAN SYNTHESIS" (SYNTHESIS-ANALYSE/DRAAIBOEKEN-NIEUW/geld.md).
 *   begin    geen startvraag (er is geen draaiboek met een startvraag); de groet en het uitlegdeel in 1 stuk (laag 1);
 *   vraag    het beeld komt, de vraag met de keuzes tegelijk. "Waar zie je …?": tik op een kaartje (alleen een vinkje
 *            erop, 6.5) en dan op het vinkje van het lesscherm. "Wat is dit?": 3 knoppen bij Bliepo, een tik is het
 *            antwoord. De zwevende munten: een opdracht, elke goede tik telt meteen (vinkje op de munt);
 *   goed     scherm 1 s groen, lof + korte reactie (BLIEPO-KARAKTER §4 Geld), een lichtgolf; vanzelf door ±0,7 s (15.27);
 *   fout     1e fout: eerste zin uit de fouttabel (met een rood rondje om het gekozen geld), dan de hint en het kind
 *            kiest opnieuw; 2e fout: uitleg, dan SAMEN (rondje om het goede geld, Bliepo zegt wat het is, het kind tikt
 *            het aan); nooit stoppen (15.18);
 *   hulp     hulphandje alleen bij opdrachten (de zwevende munten, de kleine stap bij het samen voordoen), ± 6 s na de
 *            opdrachtzin; bij kiezen niets (15.19);
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
import { KaartMuntBriefje, type GeldProps, type GKaart, type Rect } from "../vlakken/squla-geld-vlak";
import { GoudenGeldVlak, grootRect, kaartRects, type GoudenGeldProps, type Punt } from "../vlakken/squla-geld-gouden-vlak";
import { zetTestAntwoord } from "./squla-hulp";
import { speelLesgeluid } from "@/lib/lesgeluiden";
import { bliepoScherm } from "@/lib/bliepo-scherm";
import { bewaarUitkomst } from "@/app/lesuitkomstacties";
import {
  AANMOEDIG_TIKKEN,
  BEVESTIG,
  EINDE,
  EINDE_VEEL_FOUTEN,
  GELD_VOORAF,
  LOF,
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
  dingVanKnop,
  foutenVan,
  geldReactie,
  knop,
  metNaam,
  type Bellenvraag,
  type Ding,
  type Fout,
  type Rijtje,
  type Vraag,
  type Waarvraag,
  type Watvraag,
} from "./squla-geld-gouden-zinnen";

const LES_ID = "squla-geld-geldmachine-1-gouden";

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
  waarUitgelegd: boolean;
  /** Wat het oude vlak nu laat zien (om plekken uit te rekenen). */
  m: GeldProps;
};
const STAAT = new WeakMap<Lesgids, Staat>();

const LEEG_M: Omit<GeldProps, "nr"> = { groot: null, kaarten: [], kaartenActief: false, zweven: false, uit: [], goed: [], fout: [], licht: [], gekozen: [], rondje: true, verbind: null, geteld: null, vakken: false, sfeer: null, vlieg: null, paneel: true, vooraf: GELD_VOORAF };
const LEEG_G: Partial<GoudenGeldProps> = { kies: null, grootTik: false, hulphand: null };

const st = (l: Lesgids): Staat => {
  let s = STAAT.get(l);
  if (!s)
    STAAT.set(
      l,
      (s = { vorige: new Map(), recent: new Map(), zinNr: 0, robotNr: -99, namen: 0, naamKeer: 0, naamVraag: -99, opRij: 0, momenten: new Set(), vraag: 0, haak: 0, laatste: false, eerste: new Map(), vraagFouten: new Map(), log: [], robotReactie: false, nakijk: 0, nr: 0, golf: 0, samenNr: 0, waarUitgelegd: false, m: { ...LEEG_M, nr: 0 } }),
    );
  return s;
};

const zet = (l: Lesgids, p: Partial<GoudenGeldProps>) => l.pasVlakAan<GoudenGeldProps>(p);
/** Iets aan het beeld van het oude vlak veranderen (en onthouden, voor de plekken). */
const pasM = (l: Lesgids, p: Partial<GeldProps>) => {
  const s = st(l);
  s.m = { ...s.m, ...p };
  zet(l, p);
};
/** Een nieuw beeld (Bliepo tovert het tevoorschijn): alles van de vorige vraag weg. */
const nieuwBeeld = (l: Lesgids, p: Partial<GeldProps>) => {
  const s = st(l);
  s.m = { ...LEEG_M, nr: ++s.nr, ...p };
  zet(l, { ...s.m, ...LEEG_G });
};
/** De lichtgolf bij goed (7.6: geen gloed om de keuze, wel een korte golf). */
const golf = (l: Lesgids, id: string) => pasM(l, { golf: { id, n: ++st(l).golf } });

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

/** Voor de eigen test: wat de les nu vraagt (window.__phaser.geldTaak). */
function haak(l: Lesgids, info: Record<string, unknown> | null, nieuw = false) {
  if (typeof window === "undefined") return;
  const s = st(l);
  if (nieuw) s.vraag++;
  window.__phaser = { ...window.__phaser, geldTaak: info ? { ...info, n: ++s.haak, v: s.vraag } : null } as typeof window.__phaser;
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

/** Lof bij goed in 1 keer: een speciaal moment, soms de naam, anders een lofzin; met een korte reactie (BLIEPO-KARAKTER §4 Geld). */
function lofZinnen(l: Lesgids, v: Vraag, eerste: boolean): string[] {
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
  /* Elke vraag in deze les is een kijkvraag (het kind moet het geld goed bekijken): "Dat heb je goed gezien" mag. */
  lof ??= kies(l, LOF);
  const reactie = geldReactie(v);
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
const nuKoos = (z: string) => z.replace(/^Je koos /, "Nu koos je ").replace(/^Je tikte op /, "Nu tikte je op ");
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
        void zeg(l, `${AANMOEDIG_TIKKEN[Math.floor(Math.random() * AANMOEDIG_TIKKEN.length)]} ${zin}`).catch(() => {});
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
const onduidelijk = (): Fout => ({ code: "onduidelijk", soort: "onduidelijk", denkfout: "niet duidelijk", eerste: "", hint: "Kijk naar de vorm en lees het getal op het geld.", uitleg: "Het getal op het geld zegt hoeveel het waard is.", weer: [], scherm: "", rondje: null, over: [] });

/* ---------- plekken (punten van het vlak) ---------- */

/** Het handje schuin rechtsonder in een kaartje, niet over het geld zelf (geleerd bij Tellen). */
const inHoek = (r: Rect): Punt => ({ x: r.x + r.b * 0.3, y: r.y + r.h * 0.28 });
const kaartRect = (l: Lesgids, id: string): Rect | null => {
  const m = st(l).m;
  const i = (m.kaarten ?? []).findIndex((k) => k.id === id);
  return i < 0 ? null : (kaartRects(m)[i] ?? null);
};

/* ---------- "Waar zie je …?" ---------- */

type Ctx = { kaarten: GKaart[] };
const waarCtx = (v: Waarvraag): Ctx => ({ kaarten: schud(v.keuzes).map((k) => ({ id: k, geld: [k] })) });
const bellenCtx = (v: Bellenvraag): Ctx => ({ kaarten: schud(v.bellen.map((b, i) => ({ b, i }))).map(({ b, i }) => (b === "knoop" ? { id: `b${i}`, tekening: "knoop", zeg: "een knoop" } : { id: `b${i}`, geld: [b] })) });
const soortVan = (k: GKaart): Ding => (k.tekening ? "knoop" : k.geld![0]);

/**
 * Het kind tikt een kaartje (alleen een vinkje erop; nog een tik haalt het weg, een ander kaartje neemt het over) en dan
 * het vinkje van het lesscherm (6.5). Een tik tijdens de vraagzin telt. Geen pijl.
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
    const tik: Promise<Uit> = l.wachtOpVlak<{ soort: string; id: string }>("geldKies").then((t) => ({ t }));
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

/**
 * De kleine stap bij het samen voordoen: het kind tikt het geld met het rondje aan. Een tik op iets anders: het handje
 * wijst meteen het goede aan (het antwoord staat al in beeld). Vangnet: 20 s niets of 3 keer iets anders, dan doet
 * Bliepo het zelf. Geeft true als Bliepo het zelf deed.
 */
async function tikSamen(l: Lesgids, o: { ids: string[]; goed: string; vinkjes: string[]; zin: string; handZin: string; plek: () => Punt | null; vraag: string }): Promise<boolean> {
  zet(l, { kies: { gekozen: null, tikbaar: o.ids, vinkjes: o.vinkjes } });
  haak(l, { soort: "samenTik", goed: o.goed, vraag: o.vraag });
  zetTestAntwoord(o.goed);
  const hand = handKlok(l, o.plek, o.handZin);
  let eersteTik: (() => void) | null = null;
  const gedaan = new Promise<void>((r) => (eersteTik = r));
  void zegOpdracht(l, [o.zin], gedaan).then(() => hand.opnieuw(), () => {});
  let zelf = false;
  try {
    let mis = 0;
    for (;;) {
      const t = await Promise.race([l.wachtOpVlak<{ soort: string; id: string }>("geldKies"), l.wacht(VANGNET_MS).then(() => null)]);
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
  return zelf;
}

async function samenWaar(l: Lesgids, v: Waarvraag, c: Ctx, id: string) {
  const d = v.doel;
  await zegDoor(l, samenZin(l));
  pasM(l, { licht: [d] });
  await zegDoor(l, ZIN.samenWaar(d));
  const zelf = await tikSamen(l, { ids: c.kaarten.map((k) => k.id), goed: d, vinkjes: [], zin: ZIN.samenWaarJij(d), handZin: ZIN.samenWaarHand, plek: () => { const r = kaartRect(l, d); return r ? inHoek(r) : null; }, vraag: id });
  zet(l, { kies: { gekozen: d, tikbaar: [], vinkjes: [] } });
  pasM(l, { licht: [] });
  golf(l, d);
  await l.wacht(DENK_MS);
  speelLesgeluid("goed");
  bliepoScherm("goed");
  await zegDoor(l, zelf ? ZIN.samenWaarZelf(d) : ZIN.samenWaarKlaar(d));
}

async function waarVraag(l: Lesgids, v: Waarvraag, id: string, eersteVraag: boolean, ctx?: Ctx): Promise<Uitkomst> {
  const s = st(l);
  const c = ctx ?? waarCtx(v);
  if (!ctx) {
    void l.zeg().catch(() => {});
    nieuwBeeld(l, { kaarten: c.kaarten });
    speelLesgeluid("verschijn");
    await l.wacht(150);
  }
  const fouten = foutenVan(v);
  const ids = c.kaarten.map((k) => k.id);
  let zinnen = ZIN.waarVraag(v, !s.waarUitgelegd);
  s.waarUitgelegd = true;
  let eerder: Fout | null = null;
  let eersteX: string | null = null;
  for (let poging = 1 as 1 | 2; poging <= 2; poging++) {
    zetTestAntwoord(v.doel);
    haak(l, { soort: "waar", opties: ids, goed: v.doel, fout: ids.filter((x) => x !== v.doel), poging, vraag: id }, poging === 1);
    const x = await kiesKaart(l, ids, zinnen);
    haak(l, null);
    zetTestAntwoord(null);
    await l.wacht(DENK_MS);
    if (x === v.doel) {
      golf(l, x);
      speelLesgeluid("goed");
      bliepoScherm("goed");
      const zz = poging === 1 ? lofZinnen(l, v, eersteVraag) : [bevestig(l)];
      log(l, "reactie", { soort: poging === 1 ? "goed" : "goed-na-fout", vraag: id, zin: zz.join(" ") });
      await zegDoor(l, ...zz);
      return noteer(l, id, poging === 1 ? "goed" : "naFout");
    }
    /* Geen fout-geluidje en geen rood op de keuze; alleen Bliepo's scherm kleurt rood (BOUWREGELS 5.3). Het vinkje gaat weg. */
    bliepoScherm("fout");
    s.opRij = 0;
    zet(l, { kies: null });
    const f = fouten[x] ?? onduidelijk();
    legDenkfoutVast(l, { vraag: id, antwoord: x, denkfout: f.code, poging });
    const fz = foutZinnen(l, f, poging, eerder).filter(Boolean);
    if (poging === 2 && x === eersteX && fz[0] === f.eerste) fz[0] = ZIN.weerGekozen(x as Ding, v);
    /* Een ander fout antwoord bij de 2e fout: niet 2 keer "Je koos …" achter elkaar (keuring Tellen en Splitsen). */
    else if (poging === 2 && eerder && fz[0] === f.eerste) fz[0] = nuKoos(fz[0]);
    log(l, "reactie", { soort: `fout${poging}`, vraag: id, x, denkfout: f.code, zin: fz.join(" ") });
    /* Het rondje om het gekozen geld zolang Bliepo het noemt (7.8; nooit om het antwoord, 15.17). */
    pasM(l, { licht: [x] });
    log(l, "rondje", { ids: [x], wanneer: "fout", goed: v.doel });
    await zegDoor(l, fz[0]);
    pasM(l, { licht: [] });
    if (poging === 1) {
      /* 1e fout: de hint en de vraag kort zijn de nieuwe vraagzin; de kaartjes komen meteen terug (geen 2 keer de vraag,
         LESRECEPT Ronde 30; de hint zegt waar het over gaat, F1). */
      zinnen = [...fz.slice(1), ZIN.opnieuwWaar(v)];
      eerder = f;
      eersteX = x;
      continue;
    }
    /* 2e fout (15.11): uitleg, dan samen; het kind tikt het goede kaartje aan. */
    await zegDoor(l, ...fz.slice(1));
    await samenWaar(l, v, c, id);
    return noteer(l, id, "samen");
  }
  return noteer(l, id, "samen");
}

/* ---------- "Wat is dit?" ---------- */

/** De keuzeknoppen bij Bliepo tegelijk met de zinnen. Een tik tijdens de zin telt. Geen pijl (l.kies vervangt hem). */
async function vraagMetKnoppen(l: Lesgids, opties: string[], zinnen: string[]): Promise<string> {
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

async function samenWat(l: Lesgids, v: Watvraag, id: string) {
  const d = v.ding;
  await zegDoor(l, samenZin(l));
  pasM(l, { licht: ["geld"] });
  await zegDoor(l, ZIN.samenWatVorm(d));
  await zegDoor(l, ZIN.samenWatGetal(d));
  /* De kleine stap: het kind tikt het geld aan. */
  zet(l, { grootTik: true });
  haak(l, { soort: "samenTik", goed: "groot", vraag: id });
  zetTestAntwoord("groot");
  const hand = handKlok(l, () => { const r = grootRect(st(l).m); return r ? { x: r.x + r.b / 2 + 12, y: r.y + 10 } : null; }, ZIN.samenWatHand(d));
  let eersteTik: (() => void) | null = null;
  const gedaan = new Promise<void>((r) => (eersteTik = r));
  void zegOpdracht(l, [ZIN.samenWatJij(d)], gedaan).then(() => hand.opnieuw(), () => {});
  let zelf = false;
  try {
    const t = await Promise.race([l.wachtOpVlak("grootTik"), l.wacht(VANGNET_MS).then(() => null)]);
    (eersteTik as (() => void) | null)?.();
    if (t === null) {
      log(l, "vangnet", {});
      zelf = true;
    } else log(l, "tik", { x: "groot", samen: true });
  } finally {
    hand.stop();
  }
  haak(l, null);
  zetTestAntwoord(null);
  zet(l, { grootTik: false });
  pasM(l, { licht: [] });
  golf(l, "geld");
  await l.wacht(DENK_MS);
  speelLesgeluid("goed");
  bliepoScherm("goed");
  await zegDoor(l, zelf ? ZIN.samenWatZelf(d) : ZIN.samenWatKlaar(d));
}

async function watVraag(l: Lesgids, v: Watvraag, id: string, eersteVraag: boolean): Promise<Uitkomst> {
  const s = st(l);
  void l.zeg().catch(() => {});
  nieuwBeeld(l, { groot: [{ soort: "geld", id: "geld", geld: [v.ding] }] });
  speelLesgeluid("verschijn");
  await l.wacht(150);
  const opties = schud(v.opties.map(knop));
  const goed = knop(v.ding);
  const fouten = foutenVan(v);
  let zinnen = ZIN.watVraag(v);
  let eerder: Fout | null = null;
  let eersteX: string | null = null;
  for (let poging = 1 as 1 | 2; poging <= 2; poging++) {
    zetTestAntwoord(goed);
    haak(l, { soort: "wat", opties, goed, poging, vraag: id }, poging === 1);
    const x = await vraagMetKnoppen(l, opties, zinnen);
    haak(l, null);
    zetTestAntwoord(null);
    pasM(l, { licht: [] });
    await l.wacht(DENK_MS);
    if (x === goed) {
      golf(l, "geld");
      speelLesgeluid("goed");
      bliepoScherm("goed");
      const zz = poging === 1 ? lofZinnen(l, v, eersteVraag) : [bevestig(l)];
      log(l, "reactie", { soort: poging === 1 ? "goed" : "goed-na-fout", vraag: id, zin: zz.join(" ") });
      await zegDoor(l, ...zz);
      return noteer(l, id, poging === 1 ? "goed" : "naFout");
    }
    bliepoScherm("fout");
    s.opRij = 0;
    const f = fouten[x] ?? onduidelijk();
    legDenkfoutVast(l, { vraag: id, antwoord: x, denkfout: f.code, poging });
    const fz = foutZinnen(l, f, poging, eerder).filter(Boolean);
    if (poging === 2 && x === eersteX && fz[0] === f.eerste) fz[0] = ZIN.weerGekozen(dingVanKnop(v, x) ?? "knoop", v);
    /* Een ander fout antwoord bij de 2e fout: niet 2 keer "Je koos …" achter elkaar (keuring Tellen en Splitsen). */
    else if (poging === 2 && eerder && fz[0] === f.eerste) fz[0] = nuKoos(fz[0]);
    log(l, "reactie", { soort: `fout${poging}`, vraag: id, x, denkfout: f.code, zin: fz.join(" ") });
    /* Eerst wat het kind koos (de knoppen zijn weg, vanzelf door). */
    await zegDoor(l, fz[0]);
    if (poging === 1) {
      /* 1e fout: dezelfde knoppen komen terug met de hint; het rondje om het geld in beeld (waar je moet kijken). */
      if (f.rondje === "geld") {
        pasM(l, { licht: ["geld"] });
        log(l, "rondje", { ids: ["geld"], wanneer: "fout", goed: "het antwoord is een knop" });
      }
      zinnen = [...fz.slice(1), ZIN.opnieuwWat];
      eerder = f;
      eersteX = x;
      continue;
    }
    /* 2e fout (15.11): uitleg, dan samen; het kind tikt het geld aan. */
    await zegDoor(l, ...fz.slice(1));
    await samenWat(l, v, id);
    return noteer(l, id, "samen");
  }
  return noteer(l, id, "samen");
}

/* ---------- de zwevende munten (een opdracht) ---------- */

async function samenBellen(l: Lesgids, v: Bellenvraag, c: Ctx, gevonden: string[], id: string) {
  const doelen = c.kaarten.filter((k) => soortVan(k) === v.zoek).map((k) => k.id);
  const rest = doelen.filter((d) => !gevonden.includes(d));
  await zegDoor(l, samenZin(l));
  /* Bliepo wijst de munten aan die nog niet gevonden zijn, 1 rondje tegelijk; de laatste tikt het kind zelf. */
  for (const [i, d] of rest.slice(0, -1).entries()) {
    pasM(l, { licht: [d] });
    await zegDoor(l, i === 0 ? ZIN.samenBelEen : ZIN.samenBelNog);
    gevonden.push(d);
    golf(l, d);
    zet(l, { kies: { gekozen: null, tikbaar: [], vinkjes: [...gevonden] } });
  }
  const laatste = rest.at(-1)!;
  pasM(l, { licht: [laatste] });
  const open = c.kaarten.map((k) => k.id).filter((k) => !gevonden.includes(k));
  const zelf = await tikSamen(l, { ids: open, goed: laatste, vinkjes: [...gevonden], zin: ZIN.samenBelJij, handZin: ZIN.samenBelHand, plek: () => { const r = kaartRect(l, laatste); return r ? inHoek(r) : null; }, vraag: id });
  gevonden.push(laatste);
  zet(l, { kies: { gekozen: null, tikbaar: [], vinkjes: [...gevonden] } });
  pasM(l, { licht: [] });
  golf(l, laatste);
  await l.wacht(DENK_MS);
  speelLesgeluid("goed");
  bliepoScherm("goed");
  await zegDoor(l, zelf ? ZIN.samenBelZelf : ZIN.samenBelKlaar(doelen.length));
}

async function bellenVraag(l: Lesgids, v: Bellenvraag, id: string, eersteVraag: boolean): Promise<Uitkomst> {
  const s = st(l);
  const c = bellenCtx(v);
  void l.zeg().catch(() => {});
  nieuwBeeld(l, { kaarten: c.kaarten, zweven: true });
  speelLesgeluid("verschijn");
  await l.wacht(150);
  /* Eerst wat er gebeurt (1 stuk, met de pijl), dan de opdracht: zo blijft elk stuk kort genoeg (15.30). */
  await zegDoor(l, ZIN.bellenIntro(v));
  const fouten = foutenVan(v);
  const doelen = c.kaarten.filter((k) => soortVan(k) === v.zoek).map((k) => k.id);
  const gevonden: string[] = [];
  let opdracht = ZIN.bellenOpdracht(v);
  let eerder: Fout | null = null;
  let eersteX: string | null = null;
  /* Het handje in de lege ruimte links van de munten (nooit op een munt: dat zou het antwoord verklappen, 15.17). */
  const leegPlek = (): Punt | null => {
    const rs = kaartRects(st(l).m);
    if (rs.length < 4) return null;
    return { x: rs[0].x - rs[0].b / 2 - 46, y: (rs[0].y + rs[3].y) / 2 };
  };
  for (let poging = 1 as 1 | 2; poging <= 2; poging++) {
    const open = () => c.kaarten.map((k) => k.id).filter((k) => !gevonden.includes(k));
    zet(l, { kies: { gekozen: null, tikbaar: open(), vinkjes: [...gevonden] } });
    haak(l, { soort: "bellen", goed: doelen.filter((d) => !gevonden.includes(d)), fout: c.kaarten.filter((k) => soortVan(k) !== v.zoek).map((k) => k.id), poging, vraag: id }, poging === 1);
    zetTestAntwoord(doelen.find((d) => !gevonden.includes(d)) ?? null);
    const hand = handKlok(l, leegPlek, ZIN.bellenHand(v));
    let eersteTik: (() => void) | null = null;
    const gedaan = new Promise<void>((r) => (eersteTik = r));
    void zegOpdracht(l, [opdracht], gedaan).then(() => hand.opnieuw(), () => {});
    let mis: string | null = null;
    try {
      while (gevonden.length < doelen.length) {
        const t = await l.wachtOpVlak<{ soort: string; id: string }>("geldKies");
        (eersteTik as (() => void) | null)?.();
        if (gevonden.includes(t.id)) continue;
        log(l, "tik", { x: t.id });
        if (!doelen.includes(t.id)) {
          mis = t.id;
          break;
        }
        gevonden.push(t.id);
        speelLesgeluid("munt");
        golf(l, t.id);
        zet(l, { kies: { gekozen: null, tikbaar: open(), vinkjes: [...gevonden] } });
        zetTestAntwoord(doelen.find((d) => !gevonden.includes(d)) ?? null);
        haak(l, { soort: "bellen", goed: doelen.filter((d) => !gevonden.includes(d)), fout: c.kaarten.filter((k) => soortVan(k) !== v.zoek).map((k) => k.id), poging, vraag: id });
        hand.opnieuw();
      }
    } finally {
      hand.stop();
    }
    haak(l, null);
    zetTestAntwoord(null);
    zet(l, { kies: { gekozen: null, tikbaar: [], vinkjes: [...gevonden] } });
    await l.wacht(DENK_MS);
    if (!mis) {
      speelLesgeluid("goed");
      bliepoScherm("goed");
      const zz = poging === 1 ? lofZinnen(l, v, eersteVraag) : [bevestig(l)];
      log(l, "reactie", { soort: poging === 1 ? "goed" : "goed-na-fout", vraag: id, zin: zz.join(" ") });
      await zegDoor(l, ...zz);
      return noteer(l, id, poging === 1 ? "goed" : "naFout");
    }
    bliepoScherm("fout");
    s.opRij = 0;
    const x = soortVan(c.kaarten.find((k) => k.id === mis)!);
    const f = fouten[x] ?? onduidelijk();
    legDenkfoutVast(l, { vraag: id, antwoord: x, denkfout: f.code, poging });
    const fz = foutZinnen(l, f, poging, eerder).filter(Boolean);
    if (poging === 2 && mis === eersteX && fz[0] === f.eerste) fz[0] = ZIN.weerGekozen(x, v);
    /* Een ander fout antwoord bij de 2e fout: niet 2 keer "Je koos …" achter elkaar (keuring Tellen en Splitsen). */
    else if (poging === 2 && eerder && fz[0] === f.eerste) fz[0] = nuKoos(fz[0]);
    log(l, "reactie", { soort: `fout${poging}`, vraag: id, x, denkfout: f.code, zin: fz.join(" ") });
    pasM(l, { licht: [mis] });
    log(l, "rondje", { ids: [mis], wanneer: "fout", goed: doelen.find((d) => !gevonden.includes(d)) });
    await zegDoor(l, fz[0]);
    pasM(l, { licht: [] });
    if (poging === 1) {
      /* 1e fout: de hint is de nieuwe opdrachtzin (bij een opdracht geen opdracht erachter, LESRECEPT Ronde 30). */
      opdracht = fz.slice(1).join(" ");
      eerder = f;
      eersteX = mis;
      continue;
    }
    await zegDoor(l, ...fz.slice(1));
    await samenBellen(l, v, c, gevonden, id);
    return noteer(l, id, "samen");
  }
  return noteer(l, id, "samen");
}

/* ---------- een vraag ---------- */

function speelVraag(l: Lesgids, v: Vraag, o: { eerste: boolean; terug: boolean; ctx?: Ctx }): Promise<Uitkomst> {
  const id = o.terug ? `${v.id}-terug` : v.id;
  if (v.soort === "waar") return waarVraag(l, v, id, o.eerste, o.ctx);
  if (v.soort === "wat") return watVraag(l, v, id, o.eerste);
  return bellenVraag(l, v, id, o.eerste);
}

/* ---------- de les ---------- */

const gouden: Lesdraaiboek = {
  id: "squla-geld-geldmachine-1-gouden",
  titel: "Munten en briefjes",
  /* Begint met "Squla": dan kleurt het lesscherm de getallen in Bliepo's tekst (data-squla; geleerd bij Tellen). */
  synthesis: "Squla groep 3 · Geld · De geldmachine · level 1 · gouden les (nieuwe versie van squla-geld-geldmachine-1) · geen Synthesis-les: skelet van de gouden lessen, eigen invulling",
  indeling: "synthesis",
  browserstem: true,
  /* BOUWREGELS 15.27: zinnen van 1 stuk onder elkaar, pijl rechts als snelkoppeling, een tik stopt de stem. */
  pijlZoalsSynthesis: true,
  /* Bliepo praat zijn zinnen helemaal uit (15.27 punt 5; lib/stem.ts heelUitpraten). */
  stemHeelUitpraten: true,
  /* Elk woord licht op als Bliepo het zegt, ook met de browserstem (BOUWREGELS 3.7; lib/stem.ts woordenMee). */
  woordenMeeMetStem: true,
  nacht: true,
  voorwerpen: ["knoop"],
  kaarttekening: KaartMuntBriefje,
  async speel(l) {
    STAAT.delete(l);
    log(l, "start");
    /* Het voorbeeld op het beginscherm (4.1): het beeld van vraag 1 (3 kaartjes met geld). */
    const v0 = VRAGEN[0] as Waarvraag;
    const c0 = waarCtx(v0);
    const s = st(l);
    s.m = { ...LEEG_M, nr: ++s.nr, kaarten: c0.kaarten };
    l.vlak<GoudenGeldProps>(GoudenGeldVlak, { ...s.m, ...LEEG_G } as GoudenGeldProps);
    speelLesgeluid("verschijn");
    await l.wacht(600);

    /* Het begin (geen startvraag): de groet en het uitlegdeel in 1 stuk. Zonder eerdere tik zegt Bliepo het bij de
       eerste tik (lib/stem.ts heelUitpraten). */
    await zegDoor(l, NAAM_GROET, ZIN.start);
    st(l).naamKeer = 1;
    st(l).naamVraag = 0;

    /* De 12 vragen van squla-geld-geldmachine-1. */
    const mis: number[] = [];
    for (let i = 0; i < VRAGEN.length; i++) {
      /* Af en toe een overgangszin (BLIEPO-KARAKTER.md §12); meestal niet, het tempo gaat voor. */
      if (i === 8) await zegDoor(l, kies(l, OVERGANG));
      const uit = await speelVraag(l, VRAGEN[i], { eerste: i === 0, terug: false, ctx: i === 0 ? c0 : undefined });
      if (uit !== "goed") mis.push(i);
    }

    /* Daarna 3 vragen terug: eerst wat niet meteen goed was, aangevuld met de vaste reserve (zoals de oude les). */
    const terug = [...mis, ...RESERVE.filter((i) => !mis.includes(i))].slice(0, 3);
    void l.zeg().catch(() => {});
    nieuwBeeld(l, {});
    await zegDoor(l, mis.length ? (terug.length === 1 ? ZIN.terug1 : ZIN.terugN(terug.length)) : terug.length === 1 ? ZIN.extra1 : ZIN.extraN(terug.length));
    let weerFout = 0;
    for (const [n, i] of terug.entries()) {
      st(l).laatste = n === terug.length - 1;
      if ((await speelVraag(l, VRAGEN[i], { eerste: false, terug: true })) !== "goed") weerFout++;
    }
    if (weerFout) await zegDoor(l, ZIN.terugLastig);

    /* Einde: slotzin, kaart, eindzin uit het rijtje en wat het kind met de kaart doet (geen pijl). */
    void l.zeg().catch(() => {});
    nieuwBeeld(l, {});
    await zegDoor(l, ZIN.slot);
    log(l, "kaart");
    l.verderWeg?.();
    const tik = l.kaart();
    speelLesgeluid("kaart");
    await zeg(l, `${veelFouten(l) ? EINDE_VEEL_FOUTEN : kies(l, EINDE)} ${ZIN.kaartTik}`);
    await tik;
  },
};

export const LESSEN_SQULA_GELD_GOUDEN: Lesdraaiboek[] = [gouden];
