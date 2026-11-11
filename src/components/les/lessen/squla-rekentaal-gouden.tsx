/**
 * DE GOUDEN LES REKENTAAL (11 november 2026; BOUWREGELS hoofdstuk 15, 15.22, 15.25, 15.27–15.30; LESRECEPT.md).
 *
 *   squla-rekentaal-gouden — een NIEUWE versie naast squla-rekentaal "Groot en klein, vol en leeg" (BOUWREGELS 15.8). De
 *   oude les (squla-rekentaal.tsx) en het oude vlak (squla-rekentaal-keuken.tsx) blijven precies zoals ze zijn; pas na
 *   akkoord van Sara vervangt deze versie de oude voor kinderen.
 *
 * Waarom deze Squla-les: het onderwerp "Rekentaal" heeft precies 1 les (KOPPELING.md §12, public/alle-lessen.html). De 3
 * lessen "Rekentaal met pizza" (squla-meten-pizza-1/2/3) horen bij het onderwerp Meten en maten. Zie KEUZES-VOOR-SARA.md,
 * Ronde 42.
 *
 * Inhoud (15.22 punt 1): die van squla-rekentaal. Dezelfde 16 vragen in dezelfde volgorde (8 in de keuken, 8 bij de
 * picknick), met dezelfde voorwerpen, maten, keuzes en goede antwoorden.
 *
 * Skelet: er is GEEN Synthesis-tutorles over groot en klein, vol en leeg, zwaar en licht of lang en kort (KOPPELING.md §12).
 * Volgens BOUWREGELS 15.25 krijgt Rekentaal EXACT HETZELFDE SKELET als de andere gouden lessen (laag 1); het deel dat per
 * onderwerp anders is (hulp in beeld, denkfouten, hints, samen voordoen) is "EIGEN INVULLING, NIET VAN SYNTHESIS"
 * (SYNTHESIS-ANALYSE/DRAAIBOEKEN-NIEUW/rekentaal.md). Het verloop is dat van de gouden les Tijd (tik + vinkje):
 *   begin    geen startvraag; de groet en het uitlegdeel in 1 stuk, met een grote en een kleine pannenkoek in beeld;
 *   vraag    het beeld komt, de vraag tegelijk. Tik op een voorwerp (alleen een vinkje erop, 6.5) en dan het vinkje van het
 *            lesscherm. Op volgorde: elke tik zet een voorwerp op de volgende plek (nog een tik zet het terug); als alle
 *            plekken vol zijn het vinkje (zoals op volgorde bij Getallenlijn);
 *   goed     scherm 1 s groen, lof + korte reactie, een lichtgolf; vanzelf door ±0,7 s (15.27);
 *   fout     1e fout: eerste zin uit de fouttabel (met een rood rondje om wat het kind koos), dan de hint en het kind kiest
 *            opnieuw; 2e fout: uitleg, dan SAMEN (Bliepo wijst de voorwerpen aan met het rondje, dan een rondje om het
 *            goede en het kind tikt het; bij op volgorde zet Bliepo de eerste 2 en tikt het kind de laatste); nooit
 *            stoppen (15.18);
 *   hulp     hulphandje alleen bij opdrachten (op volgorde zetten en de kleine stap), ± 6 s na de opdrachtzin; bij kiezen
 *            niets (15.19);
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
import { KaartRekentaal, type RekenDing } from "../vlakken/squla-rekentaal-keuken";
import { RekentaalGoudenVlak, plankPlek, plekVan, type Punt, type RTProps } from "../vlakken/squla-rekentaal-gouden-vlak";
import { zetTestAntwoord } from "./squla-hulp";
import { speelLesgeluid } from "@/lib/lesgeluiden";
import { bliepoScherm } from "@/lib/bliepo-scherm";
import { bewaarUitkomst } from "@/app/lesuitkomstacties";
import {
  AANMOEDIG_DOEN,
  BEVESTIG,
  EINDE,
  EINDE_VEEL_FOUTEN,
  LOF,
  MOMENT,
  NAAM_GROET,
  NAAM_LOF,
  ONDUIDELIJK,
  ONDUIDELIJK_NOG_1_KEER,
  REACTIE_JA,
  REACTIE_ROBOT,
  VRAGEN,
  ZIN,
  foutenVan,
  metNaam,
  naamVan,
  rekenReactie,
  type Fout,
  type Rijtje,
  type Vraag,
} from "./squla-rekentaal-gouden-zinnen";

const LES_ID = "squla-rekentaal-gouden";

/* ---------- tempo (laag 1, zoals de andere gouden lessen) ---------- */

/** Reactie na een tik (6.10a: 0,2 tot 0,4 s). */
const DENK_MS = 250;
/** Bij een opdracht: na zoveel stilte vanzelf het hulphandje (15.19: ± 6 s). */
const AANWIJZING_MS = 6000;
/** Zo lang na het einde van de stem komt het volgende stuk (zeg() wacht zelf al 0,3 s; samen ±0,7 s; 15.27). */
const DOOR_NA_MS = 400;
/** Vangnet bij een kleine stap (LESRECEPT, geleerd bij Splitsen en Meer-minder): na zoveel stilte doet Bliepo de stap zelf. */
const VANGNET_MS = 20000;
/** Vangnet bij op volgorde zetten (zoals slepen bij de gouden les Dagen): zo lang zonder nakijken, dan doen we het samen. */
const VOLG_VANGNET_MS = 45000;

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
  /** Wat het vlak nu laat zien (om plekken uit te rekenen). */
  m: RTProps;
};
const STAAT = new WeakMap<Lesgids, Staat>();

const LEEG: Omit<RTProps, "beeld"> = { indeling: null, dingen: [], ondergrond: "tafel", zwaar: undefined, geplaatst: [], licht: [], kies: null, hulphand: null };

const st = (l: Lesgids): Staat => {
  let s = STAAT.get(l);
  if (!s)
    STAAT.set(
      l,
      (s = { vorige: new Map(), recent: new Map(), zinNr: 0, robotNr: -99, namen: 0, naamKeer: 0, naamVraag: -99, opRij: 0, momenten: new Set(), vraag: 0, haak: 0, laatste: false, eerste: new Map(), vraagFouten: new Map(), log: [], robotReactie: false, nakijk: 0, nr: 0, golf: 0, samenNr: 0, m: { ...LEEG, beeld: "b0" } }),
    );
  return s;
};

/** Iets aan het beeld veranderen (en onthouden, voor de plekken). */
const zet = (l: Lesgids, p: Partial<RTProps>) => {
  const s = st(l);
  s.m = { ...s.m, ...p };
  l.pasVlakAan<RTProps>(p);
};
/** Een nieuw beeld (Bliepo tovert alles tevoorschijn): alles van de vorige vraag weg. */
const nieuwBeeld = (l: Lesgids, p: Partial<RTProps>) => {
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

/** Voor de eigen test: wat de les nu vraagt (window.__phaser.rtTaak). */
function haak(l: Lesgids, info: Record<string, unknown> | null, nieuw = false) {
  if (typeof window === "undefined") return;
  const s = st(l);
  if (nieuw) s.vraag++;
  window.__phaser = { ...window.__phaser, rtTaak: info ? { ...info, n: ++s.haak, v: s.vraag } : null } as typeof window.__phaser;
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
  /* Dit zijn kijkvragen (je zoekt iets in beeld): "Dat heb je goed gezien" mag. */
  lof ??= kies(l, LOF);
  const reactie = rekenReactie(v);
  /* Lof en reactie beginnen niet met hetzelfde woord, en nooit 2 keer "Ja" (ook "ja" midden in de lofzin telt). */
  const zonder = reactie.zinnen.map((_, i) => i).filter((i) => woord(reactie.zinnen[i]) === woord(lof));
  if (/\bja\b/i.test(lof)) zonder.push(...REACTIE_JA);
  /* Een robotreactie hooguit 1 keer per les. */
  if (s.robotReactie || s.zinNr - s.robotNr <= 2) zonder.push(REACTIE_ROBOT);
  const r = kies(l, reactie, zonder, `reactie-${v.id}`);
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
const onduidelijk = (v: Vraag): Fout => ({ code: "onduidelijk", soort: "onduidelijk", denkfout: "niet duidelijk", eerste: "", hint: v.vraag.join(" "), uitleg: "We kijken het samen na.", weer: [], scherm: "", rondje: null, bewering: { soort: "alleen-c" }, over: [] });

/* ---------- plekken (punten van het vlak) ---------- */

/** Het handje schuin rechtsonder bij een voorwerp, niet over de tekening zelf (geleerd bij Tellen). */
function handBij(l: Lesgids, id: string): Punt | null {
  const pl = plekVan(st(l).m, id);
  return pl ? { x: pl.x + pl.b / 2 - 4, y: pl.y - 8 } : null;
}

/* ---------- kiezen: tik op een voorwerp (vinkje) en dan op het vinkje van het lesscherm ---------- */

/**
 * Het kind tikt een voorwerp (alleen een vinkje erop; nog een tik haalt het weg, een ander neemt het over) en dan het
 * vinkje van het lesscherm (6.5). Een tik tijdens de vraagzin telt. Geen pijl.
 */
async function kiesDing(l: Lesgids, ids: string[], zinnen: string[]): Promise<string> {
  let gekozen: string | null = null;
  zet(l, { kies: { gekozen, tikbaar: ids } });
  log(l, "vraag", { zin: zinnen.join(" "), opties: ids });
  l.verderWeg?.();
  const z = zeg(l, zinnen.join(" "));
  z.catch(() => {});
  void z.then(() => log(l, "vraag-klaar"), () => {});
  for (;;) {
    type Uit = { t: { soort: string; id: string } | null };
    const tik: Promise<Uit> = l.wachtOpVlak<{ soort: string; id: string }>("rtTik").then((t) => ({ t }));
    const knopP: Promise<Uit> | null = gekozen === null ? null : l.knoppen(["controleer"]).then(() => ({ t: null }));
    const r: Uit = await Promise.race(knopP ? [tik, knopP] : [tik]);
    if (!r.t) break;
    gekozen = gekozen === r.t.id ? null : r.t.id;
    log(l, "kies", { gekozen });
    speelLesgeluid("tik");
    zet(l, { kies: { gekozen, tikbaar: ids } });
  }
  log(l, "tik", { x: gekozen });
  zet(l, { kies: { gekozen, tikbaar: [] } });
  return gekozen as string;
}

/**
 * Op volgorde zetten (een opdracht): elke tik zet een voorwerp op de eerste lege plek; nog een tik zet het terug. Als alle
 * plekken vol zijn, komt het vinkje (6.5; zoals op volgorde bij Getallenlijn). Na ± 6 s stilte wijst het handje de eerste
 * lege plek aan (nooit het goede voorwerp, 15.17). Een tik tijdens de opdrachtzin telt. Geen pijl. Vangnet: na 45 s
 * zonder nakijken geeft dit `null`: dan doen we het samen (de les loopt nooit vast).
 */
async function volgordeAntwoord(l: Lesgids, v: Vraag, ids: string[], zinnen: string[]): Promise<string | null> {
  const tot = Date.now() + VOLG_VANGNET_MS;
  const goed = v.goed.split(",");
  let stand: (string | null)[] = [null, null, null];
  const volgende = () => goed.find((id, i) => stand[i] !== id && !stand.includes(id)) ?? null;
  const testAntwoord = () => {
    const n = volgende();
    zetTestAntwoord(n === null ? null : naamVan(v, n));
  };
  zet(l, { geplaatst: [...stand], kies: { gekozen: null, tikbaar: ids } });
  testAntwoord();
  const eersteLeeg = () => {
    const i = stand.findIndex((x) => x === null);
    return i < 0 ? null : plankPlek(i);
  };
  const hand = handKlok(l, eersteLeeg, ZIN.handVolgorde(v));
  let melding = l.wachtOpVlak<{ soort: string; id: string }>("rtTik");
  void zegOpdracht(l, zinnen, melding).then(() => {
    log(l, "vraag-klaar");
    hand.opnieuw();
  }, () => {});
  for (;;) {
    type Uit = { t: { soort: string; id: string } | null; tijd?: boolean };
    const vol = stand.every((x) => x !== null);
    const tik: Promise<Uit> = melding.then((t) => ({ t }));
    const knop: Promise<Uit> | null = vol ? l.knoppen(["controleer"]).then(() => ({ t: null })) : null;
    const tijd: Promise<Uit> = l.wacht(Math.max(0, tot - Date.now())).then(() => ({ t: null, tijd: true }));
    const r: Uit = await Promise.race(knop ? [tik, knop, tijd] : [tik, tijd]);
    if (r.tijd) {
      hand.stop();
      zetTestAntwoord(null);
      zet(l, { kies: { gekozen: null, tikbaar: [] } });
      return null;
    }
    if (!r.t) break;
    const id = r.t.id;
    const k = stand.indexOf(id);
    if (k >= 0) stand[k] = null;
    else {
      const leeg = stand.indexOf(null);
      if (leeg >= 0) stand[leeg] = id;
    }
    stand = [...stand];
    log(l, "plaatje", { stand });
    speelLesgeluid("tik");
    hand.opnieuw();
    zet(l, { geplaatst: [...stand] });
    testAntwoord();
    melding = l.wachtOpVlak<{ soort: string; id: string }>("rtTik");
  }
  hand.stop();
  zetTestAntwoord(null);
  zet(l, { kies: { gekozen: null, tikbaar: [] } });
  const x = stand.join(",");
  log(l, "tik", { x });
  return x;
}

/**
 * De kleine stap bij het samen voordoen: het kind tikt het voorwerp met het rondje aan. Een tik op iets anders: het
 * handje wijst meteen het goede aan (het antwoord staat al in beeld). Vangnet: 20 s niets of 3 keer iets anders, dan doet
 * Bliepo het zelf. Geeft terug of Bliepo het zelf deed.
 */
async function tikSamen(l: Lesgids, v: Vraag, o: { ids: string[]; goed: string; zin: string }): Promise<boolean> {
  zet(l, { kies: { gekozen: null, tikbaar: o.ids } });
  haak(l, { soort: "samenTik", goed: o.goed, goedNaam: naamVan(v, o.goed), vraag: v.id });
  zetTestAntwoord(naamVan(v, o.goed));
  const hand = handKlok(l, () => handBij(l, o.goed), ZIN.handDing);
  let eersteTik: (() => void) | null = null;
  const gedaan = new Promise<void>((r) => (eersteTik = r));
  void zegOpdracht(l, [o.zin], gedaan).then(() => hand.opnieuw(), () => {});
  let zelf = false;
  try {
    let mis = 0;
    for (;;) {
      const t = await Promise.race([l.wachtOpVlak<{ soort: string; id: string }>("rtTik"), l.wacht(VANGNET_MS).then(() => null)]);
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
  zet(l, { kies: { gekozen: v.soort === "volgorde" ? null : o.goed, tikbaar: [] } });
  return zelf;
}

/** Samen voordoen (2e fout, 15.11): Bliepo wijst de voorwerpen aan met het rondje, dan doet het kind de kleine stap. */
async function samenDoen(l: Lesgids, v: Vraag, ids: string[]) {
  zet(l, { kies: null, licht: [] });
  const volg = v.soort === "volgorde";
  if (volg) zet(l, { geplaatst: [null, null, null] });
  await zegDoor(l, samenZin(l));
  if (v.samen.intro) await zegDoor(l, v.samen.intro);
  const goed = v.goed.split(",");
  const gezet: (string | null)[] = [null, null, null];
  for (const [i, [id, zin]] of v.samen.stappen.entries()) {
    zet(l, { licht: [id] });
    /* Bij op volgorde zet Bliepo de kleinste en de middelste op hun plek. */
    if (volg) {
      gezet[i] = id;
      zet(l, { geplaatst: [...gezet] });
      speelLesgeluid("tik");
    }
    await zegDoor(l, zin);
  }
  /* Een rondje om het goede voorwerp (bij op volgorde: het laatste); het kind tikt het aan. */
  const laatst = volg ? goed[goed.length - 1] : v.goed;
  zet(l, { licht: [laatst] });
  const zelf = await tikSamen(l, v, { ids, goed: laatst, zin: v.samen.jij });
  if (volg) zet(l, { geplaatst: [...goed] });
  zet(l, { licht: [], kies: null });
  golf(l, laatst);
  await l.wacht(DENK_MS);
  speelLesgeluid("goed");
  bliepoScherm("goed");
  await zegDoor(l, zelf ? ZIN.zelf(v.samen.klaar) : v.samen.klaar);
}

/* ---------- een vraag ---------- */

async function speelVraag(l: Lesgids, v: Vraag, eersteVraag: boolean): Promise<Uitkomst> {
  const s = st(l);
  const id = v.id;
  /* Het goede voorwerp staat niet steeds op dezelfde plek (1.23): de plek wisselt bij elke les. */
  const dingen: RekenDing[] = schud(v.dingen);
  const ids = dingen.map((d) => d.id);
  const volg = v.soort === "volgorde";
  void l.zeg().catch(() => {});
  nieuwBeeld(l, { indeling: v.indeling, ondergrond: v.ondergrond, zwaar: v.zwaar, dingen, geplaatst: volg ? [null, null, null] : [] });
  speelLesgeluid("verschijn");
  await l.wacht(150);
  const fouten = foutenVan(v);
  let zinnen = [...v.vraag];
  let eerder: Fout | null = null;
  let eersteX: string | null = null;
  for (let poging = 1 as 1 | 2; poging <= 2; poging++) {
    const fout = volg ? Object.keys(fouten) : ids.filter((x) => x !== v.goed);
    haak(l, { soort: volg ? "volgorde" : "kies", opties: ids, namen: ids.map((x) => naamVan(v, x)), goed: v.goed, fout, poging, vraag: id }, poging === 1);
    let x: string;
    if (volg) {
      const y = await volgordeAntwoord(l, v, ids, zinnen);
      if (y === null) {
        /* Vangnet: lang niets nagekeken. Geen fout, wel samen voordoen (de les loopt nooit vast). */
        haak(l, null);
        log(l, "vangnet", { volgorde: true });
        await zegDoor(l, ZIN.volgVangnet);
        await samenDoen(l, v, ids);
        return noteer(l, id, "samen");
      }
      x = y;
    } else {
      zetTestAntwoord(naamVan(v, v.goed));
      x = await kiesDing(l, ids, zinnen);
    }
    haak(l, null);
    zetTestAntwoord(null);
    await l.wacht(DENK_MS);
    if (x === v.goed) {
      zet(l, { kies: volg ? null : { gekozen: x, tikbaar: [] } });
      golf(l, volg ? v.goed.split(",")[1] : x);
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
    const f = fouten[x] ?? onduidelijk(v);
    legDenkfoutVast(l, { vraag: id, antwoord: volg ? x : naamVan(v, x), denkfout: f.code, poging });
    const fz = foutZinnen(l, f, poging, eerder).filter(Boolean);
    if (poging === 2 && x === eersteX && fz[0] === f.eerste) fz[0] = ZIN.weerGekozen(v, x);
    /* Een ander fout antwoord bij de 2e fout: niet 2 keer "Je koos …" achter elkaar (keuring Tellen en Splitsen). */
    else if (poging === 2 && eerder && fz[0] === f.eerste) fz[0] = nuKoos(fz[0]);
    log(l, "reactie", { soort: `fout${poging}`, vraag: id, x, denkfout: f.code, zin: fz.join(" ") });
    /* Het rondje om wat het kind koos zolang Bliepo het noemt (7.8; nooit om het antwoord, 15.17). */
    if (f.rondje) {
      zet(l, { licht: [f.rondje] });
      log(l, "rondje", { ids: [f.rondje], wanneer: "fout", goed: volg ? null : v.goed });
    }
    await zegDoor(l, fz[0]);
    zet(l, { licht: [] });
    if (poging === 1) {
      /* 1e fout: de hint (die zegt waar het over gaat en eindigt met de vraag of de opdracht, F1) is de nieuwe vraagzin;
         de keuzes komen meteen terug (geen 2 keer de vraag, LESRECEPT Ronde 30). Bij op volgorde gaat alles terug. */
      if (volg) zet(l, { geplaatst: [null, null, null] });
      zinnen = [...fz.slice(1)];
      eerder = f;
      eersteX = x;
      continue;
    }
    /* 2e fout (15.11): uitleg, dan samen; het kind tikt het goede voorwerp. */
    await zegDoor(l, ...fz.slice(1));
    await samenDoen(l, v, ids);
    return noteer(l, id, "samen");
  }
  return noteer(l, id, "samen");
}

/* ---------- de les ---------- */

const gouden: Lesdraaiboek = {
  id: "squla-rekentaal-gouden",
  titel: "Groot en klein, vol en leeg",
  /* Begint met "Squla": dan kleurt het lesscherm de getallen in Bliepo's tekst (data-squla; geleerd bij Tellen). */
  synthesis: "Squla groep 3 · Meten en maten · Rekentaal · gouden les (nieuwe versie van squla-rekentaal) · geen Synthesis-les: skelet van de gouden lessen, eigen invulling",
  indeling: "synthesis",
  browserstem: true,
  /* BOUWREGELS 15.27: zinnen van 1 stuk onder elkaar, pijl rechts als snelkoppeling, een tik stopt de stem. */
  pijlZoalsSynthesis: true,
  /* Bliepo praat zijn zinnen helemaal uit (15.27 punt 5; lib/stem.ts heelUitpraten). */
  stemHeelUitpraten: true,
  /* Elk woord licht op als Bliepo het zegt, ook met de browserstem (BOUWREGELS 3.7; lib/stem.ts woordenMee). */
  woordenMeeMetStem: true,
  /* De donkere ruimte van alle gouden lessen (skelet). */
  nacht: true,
  kaarttekening: KaartRekentaal,
  async speel(l) {
    STAAT.delete(l);
    log(l, "start");
    /* Het beeld op het beginscherm (4.1): een grote en een kleine pannenkoek op tafel, zoals de oude les. */
    const s = st(l);
    s.m = {
      ...LEEG,
      beeld: `b${++s.nr}`,
      indeling: "rij",
      ondergrond: "tafel",
      dingen: [
        { id: "groot", soort: "pannenkoek", naam: "de grote pannenkoek", maat: 1 },
        { id: "klein", soort: "pannenkoek", naam: "de kleine pannenkoek", maat: 0.5 },
      ],
    };
    /* Alle voorwerpen van de les: het vlak tekent hun plaatjes alvast (geen hapering later, HARDE REGEL 7). */
    l.vlak<RTProps>(RekentaalGoudenVlak, { ...s.m, voorbak: VRAGEN.flatMap((v) => v.dingen) });
    speelLesgeluid("verschijn");
    await l.wacht(600);

    /* Het begin (geen startvraag): de groet en het uitlegdeel in 1 stuk. Zonder eerdere tik zegt Bliepo het bij de
       eerste tik (lib/stem.ts heelUitpraten). */
    await zegDoor(l, NAAM_GROET, ZIN.start);
    st(l).naamKeer = 1;
    st(l).naamVraag = 0;

    /* De 16 vragen van squla-rekentaal: eerst in de keuken, dan bij de picknick. */
    for (let i = 0; i < VRAGEN.length; i++) {
      if (i === 8) {
        void l.zeg().catch(() => {});
        nieuwBeeld(l, { indeling: "rij", ondergrond: "kleed", dingen: [] });
        await zegDoor(l, ...ZIN.picknick);
      }
      st(l).laatste = i === VRAGEN.length - 1;
      await speelVraag(l, VRAGEN[i], i === 0);
    }

    /* Einde: slotzin, kaart, eindzin uit het rijtje en wat het kind met de kaart doet (geen pijl). */
    void l.zeg().catch(() => {});
    nieuwBeeld(l, { indeling: "rij", ondergrond: "kleed", dingen: [] });
    await zegDoor(l, ZIN.slot);
    log(l, "kaart");
    l.verderWeg?.();
    const tik = l.kaart();
    speelLesgeluid("kaart");
    await zeg(l, `${veelFouten(l) ? EINDE_VEEL_FOUTEN : kies(l, EINDE)} ${ZIN.kaartTik}`);
    await tik;
  },
};

export const LESSEN_SQULA_REKENTAAL_GOUDEN: Lesdraaiboek[] = [gouden];
