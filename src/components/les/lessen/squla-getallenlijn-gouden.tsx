/**
 * DE GOUDEN LES GETALLENLIJN (10 november 2026; BOUWREGELS hoofdstuk 15, 15.22, 15.25, 15.27–15.30; LESRECEPT.md).
 *
 *   squla-getallenlijn-kat-1-gouden — een NIEUWE versie naast squla-getallenlijn-kat-1 "Het raketje op de getallenlijn"
 *   (BOUWREGELS 15.8). De oude les (squla-getallenlijn.tsx) blijft precies zoals hij is; pas na akkoord van Sara
 *   vervangt deze versie de oude voor kinderen.
 *
 * Waarom deze Squla-les: van de 4 Squla-lessen Getallenlijn (rangschikken, raketje, dingen op de getallen, terugtellen)
 * past alleen "het raketje" deels bij het draaiboek (Count the Jumps): een figuurtje op een getallenlijn dat per 1
 * springt, met bogen (draaiboek §8). Level 1 (kat-1) is gekozen omdat het met een lijn 0–10 begint, zoals Count the
 * Jumps (lijn 0–10), en vooral "bij welk getal staat het raketje" vraagt. Zie KEUZES-VOOR-SARA.md, Ronde 27.
 *
 * Inhoud (15.22 punt 1): die van squla-getallenlijn-kat-1. Dezelfde 15 vragen in dezelfde volgorde, dezelfde lijnen,
 * getallen en keuzes.
 *
 * Skelet (15.22 punt 3): het draaiboek Getallenlijn (SYNTHESIS-ANALYSE/DRAAIBOEKEN-NIEUW/getallenlijn.md):
 *   stap 3   groet + "wil je laten zien wat je weet?" in 1 stuk; Ja = een proef van 2 opgaven (vraag 1 en 2), 2 fouten =
 *            alsnog de uitleg; Nee = de uitleg (de opfrisser van stap 1–2 gaat over aftrekken: niet gebouwd);
 *   stap 4   uitleg: een lijn 0–10, het raketje bij de 0, het kind tikt de getallen en het raketje springt per 1 met
 *            blijvende bogen (§3 A en B: alleen tikbare getallen wit; overslaan = "steeds 1"); de vraag "hoeveel
 *            sprongen?" (§3 C, denkfout "getallen geteld in plaats van sprongen"); goed = bevestigen + waarom;
 *   stap 7   de vragen: het beeld komt, de vraag met de keuzes tegelijk (een tik is het antwoord); bij goed scherm 1 s
 *            groen, korte lof, het getal komt erbij met een lichtgolf, vanzelf door ±0,7 s (15.27; draaiboek 0,5 s);
 *   fout     1e fout: eerste zin + hint uit de fouttabel, een rood rondje om het getal waar je vanaf telt, de vraag in
 *            andere woorden; 2e fout: uitleg, dan SAMEN SPRINGEN (§3 E.3 en F.3: de getallen vastzetten en samen per 1
 *            springen, bogen blijven staan), nu pas het antwoord in beeld, en het kind tikt het aan (kleine stap, 15.11);
 *            nooit stoppen of pauze (15.18; Synthesis biedt pauze aan, dat doen we niet);
 *   hulp     hulphandje alleen bij opdrachten (springen, op volgorde, kleine stap), ± 6 s na de opdrachtzin; bij keuzes
 *            niets (§4: Synthesis geeft bij stilte nooit een hint; 15.19);
 *   snel     niets (§3 C.2 en F.2; BOUWREGELS 6.10: bij Getallenlijn zegt Bliepo niets);
 *   einde    slotzin, de kaart, een eindzin uit het rijtje en "Tik op de kaart." (geen pijl op de kaart).
 *
 * De verder-pijl (15.27): Bliepo praat door; na elk stuk tekst gaat de les ±0,7 s na de stem vanzelf verder (`zegDoor`).
 * De pijl staat rechts onder de tekst als snelkoppeling. Bij vragen en opdrachten staat er geen pijl.
 *
 * Elke fout wordt met zijn denkfout vastgelegd en elke vraag met zijn uitkomst (goed in 1 keer, goed na een fout,
 * samen gedaan) in de tabel les_uitkomsten (bewaarUitkomst; zonder gekozen kind gebeurt er niets).
 */

import type { Lesdraaiboek, Lesgids } from "../soort";
import { GetallenlijnGoudenVlak, KaartGetallenlijn, LIJN_Y, bordPlek, getalPlek, kaartThuis, vakPlek, wezenPlek, lijnX, type GLBeeld, type GLLicht, type GLProps, type Punt } from "../vlakken/squla-getallenlijn-gouden-vlak";
import { GETALLENLIJN_VOORWERPEN } from "../vlakken/squla-getallenlijn-teken";
import { zetTestAntwoord } from "./squla-hulp";
import { speelLesgeluid } from "@/lib/lesgeluiden";
import { bliepoScherm } from "@/lib/bliepo-scherm";
import { bewaarUitkomst } from "@/app/lesuitkomstacties";
import {
  AANMOEDIG_TIKKEN,
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
  REACTIE_JA,
  REACTIE_ROBOT,
  UITLEG_VRAAG,
  VRAGEN,
  ZIN,
  foutenVan,
  isKijkvraag,
  lijnFout,
  lijnReactie,
  metNaam,
  sprongStart,
  uitlegFout,
  type Fout,
  type Licht,
  type Rijtje,
  type Vraag,
  type Wezen,
} from "./squla-getallenlijn-gouden-zinnen";

const LES_ID = "squla-getallenlijn-kat-1-gouden";

/* ---------- tempo (draaiboek Getallenlijn §5) ---------- */

/** Reactie na een tik (6.10a: 0,2 tot 0,4 s; draaiboek: stem 0,2–0,8 s na een tik). */
const DENK_MS = 250;
/** Bij een opdracht: na zoveel stilte vanzelf het hulphandje (15.19: ± 6 s). */
const AANWIJZING_MS = 6000;
/** Zo lang na het einde van de stem komt het volgende stuk (zeg() wacht zelf al 0,3 s; samen ±0,7 s; 15.27; draaiboek 0,5 s). */
const DOOR_NA_MS = 400;
/** Vangnet bij een kleine stap (LESRECEPT, geleerd bij Splitsen en Meer-minder): na zoveel stilte, of 3 keer mis, doet Bliepo de stap zelf. */
const VANGNET_MS = 20000;
/** Een sprong van het raketje duurt ± 0,4 s (draaiboek §5: ± 1 s animatie; bij ons korter, met een boogje). */
const SPRONG_MS = 450;

/* ---------- staat per les ---------- */

type Uitkomst = "goed" | "naFout" | "samen" | "gestopt";
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
  terug: number;
  zetK: number;
  golf: number;
  ordenUitgelegd: boolean;
};
const STAAT = new WeakMap<Lesgids, Staat>();
const st = (l: Lesgids): Staat => {
  let s = STAAT.get(l);
  if (!s)
    STAAT.set(
      l,
      (s = { vorige: new Map(), recent: new Map(), zinNr: 0, robotNr: -99, namen: 0, naamKeer: 0, naamVraag: -99, opRij: 0, momenten: new Set(), vraag: 0, haak: 0, laatste: false, eerste: new Map(), vraagFouten: new Map(), log: [], robotReactie: false, nakijk: 0, terug: 0, zetK: 0, golf: 0, ordenUitgelegd: false }),
    );
  return s;
};

const zet = (l: Lesgids, p: Partial<GLProps>) => l.pasVlakAan<GLProps>(p);

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

/** Voor de eigen test: wat de les nu vraagt (window.__phaser.glTaak). */
function haak(l: Lesgids, info: Record<string, unknown> | null, nieuw = false) {
  if (typeof window === "undefined") return;
  const s = st(l);
  if (nieuw) s.vraag++;
  window.__phaser = { ...window.__phaser, glTaak: info ? { ...info, n: ++s.haak, v: s.vraag } : null } as typeof window.__phaser;
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
  /* "gestopt" (de proef stopt na 2 fouten) is geen uitkomst van de vraag: die vraag komt later opnieuw. */
  if (uit === "gestopt") return uit;
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

/** Een lofzin (zonder reactie): een speciaal moment, soms de naam, anders een lofzin. */
function lofZin(l: Lesgids, kijk: boolean, eerste: boolean): string {
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
  /* "Dat heb je goed gezien" alleen bij kijkvragen. */
  lof ??= kies(l, LOF, kijk ? [] : [LOF_KIJK_INDEX]);
  return lof;
}

/** Lof bij goed in 1 keer, met daarachter een korte reactie op wat het kind koos (BLIEPO-KARAKTER §4 Getallenlijn). */
function lofZinnen(l: Lesgids, v: Vraag, eerste: boolean): string[] {
  const s = st(l);
  const lof = lofZin(l, isKijkvraag(v), eerste);
  const reactie = lijnReactie(v);
  /* Lof en reactie beginnen niet met hetzelfde woord, en nooit 2 keer "Ja" (ook "ja" midden in de lofzin telt). */
  const zonder = reactie.zinnen.map((_, i) => i).filter((i) => woord(reactie.zinnen[i]) === woord(lof));
  if (/\bja\b/i.test(lof)) zonder.push(...REACTIE_JA);
  /* Een robotreactie hooguit 1 keer per les. */
  if (s.robotReactie || s.zinNr - s.robotNr <= 2) zonder.push(REACTIE_ROBOT);
  const r = kies(l, reactie, zonder, "reactie");
  if (r === reactie.zinnen[REACTIE_ROBOT]) s.robotReactie = true;
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
/** Kaarten nooit al op volgorde, en bij 3 ook nooit precies van groot naar klein (zoals de oude les). */
function schudNietOplopend(lijst: number[]): number[] {
  for (let i = 0; i < 40; i++) {
    const a = schud(lijst);
    const op = a.every((n, k) => k === 0 || a[k - 1] <= n);
    const af = a.every((n, k) => k === 0 || a[k - 1] >= n);
    if (!op && !af) return a;
  }
  const g = [...lijst].sort((x, y) => x - y);
  return [g[1], g[0], ...g.slice(2)];
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
        void zeg(l, `${AANMOEDIG_TIKKEN[Math.floor(Math.random() * AANMOEDIG_TIKKEN.length)]} ${zin}`).catch(() => {});
      }
    }, AANWIJZING_MS);
  };
  return {
    opnieuw: () => {
      zet(l, { hulphand: null });
      zetAan();
    },
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
  const zelfde = eerder !== null && eerder.soort === f.soort && !eerder.noot && !f.noot && f.weer.length > 0 && f.code !== "onduidelijk";
  return zelfde ? f.weer : [eerste, f.uitleg];
}

/* ---------- het beeld ---------- */

const LEEG: Partial<GLProps> = { bogen: [], extra: [], tik: null, grijs: false, wezens: null, licht: null, hulphand: null };

/** Het handje schuin naast een plek, in de lege ruimte (niet over een ander ding; geleerd bij Tellen). */
const plekNaast = (p: Punt): Punt => ({ x: p.x + 18, y: p.y + 26 });

type Ctx = { beeld: GLBeeld; kaarten: number[]; bordjes: number[] };

/** Het beeld van een vraag (zoals de oude les; de kaarten en bordjes in een willekeurige volgorde, 1.23). */
function maakCtx(v: Vraag): Ctx {
  const kaarten = v.soort === "orden" ? schudNietOplopend(v.opties.map(Number)) : [];
  const bordjes = v.soort === "dichtst" ? schud(v.bordjes!) : [];
  let beeld: GLBeeld;
  if (v.soort === "orden") beeld = { soort: "orden", id: v.id, vakken: v.vakken!, kaarten };
  else if (v.soort === "dichtst") beeld = { soort: "bordjes", id: v.id, getallen: bordjes };
  else beeld = { soort: "lijn", id: v.id, van: v.van!, tot: v.tot!, labels: v.labels!, ...(v.streepjes ? { streepjes: v.streepjes } : {}), ...(v.door ? { door: true } : {}), ...(v.wezens ? { wezens: v.wezens } : {}) };
  return { beeld, kaarten, bordjes };
}
const raketVan = (v: Vraag) => (v.soort === "bij" || v.soort === "natien" || v.soort === "ongeveer" || v.soort === "wie" ? (v.raketje ?? null) : null);

function lijnVan(c: Ctx) {
  return c.beeld.soort === "lijn" ? c.beeld : null;
}

/** Het rondje van de fouttabel in de vorm van het vlak. */
function lichtVan(f: Licht): GLLicht {
  if (!f) return null;
  if (f.soort === "getal") return { soort: "getal", n: f.n };
  if (f.soort === "bordje") return { soort: "bordje", n: f.n };
  return { soort: "vak", i: f.i };
}

/** De lichtgolf bij goed, op de plek van het antwoord (7.6). */
function golfBijGoed(l: Lesgids, v: Vraag, c: Ctx) {
  const s = st(l);
  const lijn = lijnVan(c);
  let plek: Punt | null = null;
  if (lijn && v.soort !== "wie" && v.soort !== "meer") plek = { ...getalPlek(lijn, Number(v.goed)), y: LIJN_Y - 50 };
  else if (lijn && v.soort === "wie") plek = { x: lijnX(lijn).x(v.n!), y: LIJN_Y - 50 };
  else if (lijn && v.soort === "meer") plek = { x: lijnX(lijn).x(v.meer!.b), y: LIJN_Y - 50 };
  else if (c.beeld.soort === "bordjes") plek = bordPlek(c.bordjes.indexOf(Number(v.goed)), c.bordjes.length);
  else if (c.beeld.soort === "orden") plek = vakPlek(3, 4);
  if (plek) zet(l, { golf: { plek, keer: ++s.golf } });
}

/** Het goede antwoord in beeld (na goed of bij het samen voordoen). */
function toonAntwoord(l: Lesgids, v: Vraag, c: Ctx) {
  if (v.soort === "bij" || v.soort === "natien" || v.soort === "ongeveer") zet(l, { extra: [Number(v.goed)] });
  else if (v.soort === "wie") zet(l, { extra: [v.n!] });
  else if (v.soort === "meer") zet(l, { raketje: v.meer!.b, extra: [v.meer!.b] });
  golfBijGoed(l, v, c);
}

/* ---------- antwoorden: kiezen, tikken op een ding, op volgorde ---------- */

/** De keuzeknoppen tegelijk met de zinnen. Een tik tijdens de zin telt. Geen pijl (l.kies vervangt hem). */
async function kiesAntwoord(l: Lesgids, opties: string[], zinnen: string[]): Promise<string> {
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

/** "Wat staat er bij …? Tik erop.": een tik zet een vinkje op het ding (nog een tik haalt het weg); nakijken met het vinkje (6.5). */
async function wieAntwoord(l: Lesgids, zinnen: string[]): Promise<string> {
  let gekozen: string | null = null;
  zet(l, { wezens: { gekozen, tikbaar: true } });
  log(l, "vraag", { zin: zinnen.join(" "), opties: ["wezen"] });
  l.verderWeg?.();
  const z = zeg(l, zinnen.join(" "));
  z.catch(() => {});
  void z.then(() => log(l, "vraag-klaar"), () => {});
  for (;;) {
    type Uit = { t: { soort: string; naam: string } | null };
    const tik: Promise<Uit> = l.wachtOpVlak<{ soort: string; naam: string }>("wezenTik").then((t) => ({ t }));
    const knop: Promise<Uit> | null = gekozen === null ? null : l.knoppen(["controleer"]).then(() => ({ t: null }));
    const r: Uit = await Promise.race(knop ? [tik, knop] : [tik]);
    if (!r.t) break;
    gekozen = gekozen === r.t.naam ? null : r.t.naam;
    log(l, "kies", { gekozen });
    speelLesgeluid("tik");
    zet(l, { wezens: { gekozen, tikbaar: true } });
  }
  log(l, "tik", { x: gekozen });
  zet(l, { wezens: { gekozen, tikbaar: false } });
  return gekozen as string;
}

/** Op volgorde: slepen of tikken; als alle vakken vol zijn komt het vinkje (6.5). Na ± 6 s stilte wijst het handje een leeg vak aan. */
async function ordenAntwoord(l: Lesgids, v: Vraag, c: Ctx, zinnen: string[]): Promise<string> {
  const s = st(l);
  const goed = v.goed.split(",").map(Number);
  let stand: (number | null)[] = [...v.vakken!];
  const volgende = () => goed.find((n, i) => stand[i] !== n && !stand.includes(n)) ?? null;
  zetTestAntwoord(volgende() === null ? null : String(volgende()));
  zet(l, { orden: { actief: true, terug: s.terug } });
  const eersteLeeg = () => {
    const i = stand.findIndex((n) => n === null);
    return i < 0 ? null : { plek: plekNaast(vakPlek(i, 4)) };
  };
  const hand = handKlok(l, eersteLeeg, ZIN.ordenHand);
  const eerst = l.wachtOpVlak<{ soort: string; vakken: (number | null)[] }>("ordenStand");
  /* De eerste keer per les zegt Bliepo hoe het werkt (3.15). */
  const zin = s.ordenUitgelegd ? zinnen : [...zinnen, ZIN.ordenHoe];
  s.ordenUitgelegd = true;
  const zo = zegOpdracht(l, zin, eerst);
  void zo.then(() => {
    log(l, "vraag-klaar");
    hand.opnieuw();
  }, () => {});
  let melding: Promise<{ soort: string; vakken: (number | null)[] }> = eerst;
  for (;;) {
    type Uit = { t: { soort: string; vakken: (number | null)[] } | null };
    const vol = stand.every((n) => n !== null);
    const tik: Promise<Uit> = melding.then((t) => ({ t }));
    const knop: Promise<Uit> | null = vol ? l.knoppen(["controleer"]).then(() => ({ t: null })) : null;
    const r: Uit = await Promise.race(knop ? [tik, knop] : [tik]);
    if (!r.t) break;
    stand = r.t.vakken;
    log(l, "kaart", { stand });
    speelLesgeluid("tik");
    hand.opnieuw();
    zetTestAntwoord(volgende() === null ? null : String(volgende()));
    melding = l.wachtOpVlak<{ soort: string; vakken: (number | null)[] }>("ordenStand");
  }
  hand.stop();
  zetTestAntwoord(null);
  zet(l, { orden: { actief: false, terug: s.terug } });
  const x = stand.join(",");
  log(l, "tik", { x });
  void c;
  return x;
}

/* ---------- samen voordoen (2e fout; draaiboek §3 E.3 en F.3) ---------- */

/** Bliepo springt zelf over de lijn, 1 per keer; elke sprong krijgt een boog die blijft staan (draaiboek §0, §3 B). */
async function springSamen(l: Lesgids, lijn: Extract<GLBeeld, { soort: "lijn" }>, van: number, naar: number, telZin: (k: number, i: number) => string | null) {
  const stap = Math.sign(naar - van) || 1;
  const bogen: [number, number][] = [];
  let i = 0;
  for (let k = van + stap; stap > 0 ? k <= naar : k >= naar; k += stap) {
    i++;
    bogen.push([k - stap, k]);
    zet(l, { bogen: [...bogen], licht: lijn.labels.includes(k) ? { soort: "getal", n: k } : null });
    speelLesgeluid("tik");
    const z = telZin(k, i);
    /* De laatste sprong: geen eigen zin; de zin bij het doel komt meteen (de boog verschijnt intussen). */
    if (z) await zegDoor(l, z);
  }
  return bogen;
}

/**
 * Het samen voordoen na de 2e fout: Bliepo zet de getallen klaar en springt samen met het kind over de lijn (bogen
 * blijven staan), nu pas het antwoord in beeld (15.11). Dan de kleine stap van het kind: het getal of het ding
 * aantikken, of de laatste kaart in het vak slepen. Vangnet: 20 s niets of 3 keer mis = Bliepo doet het, zonder "Ja".
 */
async function samenDoen(l: Lesgids, v: Vraag, c: Ctx) {
  const s = st(l);
  zet(l, { ...LEEG });
  let zelf = false;

  if (v.soort === "orden") {
    const goed = v.goed.split(",").map(Number);
    s.terug++;
    zet(l, { orden: { actief: false, terug: s.terug } });
    await zegDoor(l, ZIN.samen(v));
    const gelegd: { n: number; vak: number }[] = [];
    for (let i = 1; i < goed.length - 1; i++) {
      gelegd.push({ n: goed[i], vak: i });
      zet(l, { orden: { actief: false, terug: s.terug, zet: { kaarten: [...gelegd], k: ++s.zetK } }, licht: { soort: "vak", i } });
      speelLesgeluid("tik");
      await zegDoor(l, ZIN.samenOrden(goed[i - 1], goed[i]));
    }
    zet(l, { licht: null });
    /* De kleine stap: de laatste kaart in het laatste vak (het handje doet het voor, het antwoord staat al in beeld). */
    const laatst = goed.at(-1)!;
    const van = kaartThuis(c.kaarten.indexOf(laatst), c.kaarten.length);
    const naar = vakPlek(goed.length - 1, goed.length);
    zet(l, { orden: { actief: true, terug: s.terug, zet: { kaarten: [...gelegd], k: ++s.zetK } } });
    haak(l, { soort: "ordenSamen", goed: String(laatst), vraag: v.id });
    zetTestAntwoord(String(laatst));
    const hand = handKlok(l, () => ({ plek: plekNaast(van), naar: plekNaast(naar) }), ZIN.samenHand(v));
    let gedaan: (() => void) | null = null;
    const klaar = new Promise<void>((r) => (gedaan = r));
    void zegOpdracht(l, [ZIN.samenStap(v)], klaar).then(() => hand.opnieuw(), () => {});
    try {
      let mis = 0;
      for (;;) {
        const t = await Promise.race([l.wachtOpVlak<{ soort: string; vakken: (number | null)[] }>("ordenStand"), l.wacht(VANGNET_MS).then(() => null)]);
        (gedaan as (() => void) | null)?.();
        if (t && t.vakken.join(",") === v.goed) {
          log(l, "tik", { x: laatst, samen: true });
          break;
        }
        if (t === null || ++mis >= 3) {
          log(l, "vangnet", { mis });
          zelf = true;
          break;
        }
        /* Anders gelegd: alles weer zoals Bliepo het legde, en het handje doet het meteen voor. */
        log(l, "tik", { x: t.vakken.join(","), samen: true });
        zet(l, { orden: { actief: true, terug: s.terug, zet: { kaarten: [...gelegd], k: ++s.zetK } } });
        hand.nu();
      }
    } finally {
      hand.stop();
    }
    zet(l, { orden: { actief: false, terug: s.terug, zet: { kaarten: [...gelegd, { n: laatst, vak: goed.length - 1 }], k: ++s.zetK } } });
  } else {
    /* De lijn waarop Bliepo springt: bij "ongeveer" met alle streepjes, bij "meer" en "dichtst" een lijn met de getallen. */
    let lijn = lijnVan(c);
    if (v.soort === "ongeveer" && lijn) {
      lijn = { ...lijn, id: `${v.id}-samen`, streepjes: undefined };
      zet(l, { beeld: lijn, raketje: v.raketje ?? null });
    } else if (v.soort === "meer") {
      lijn = { soort: "lijn", id: `${v.id}-samen`, van: 10, tot: 20, labels: Array.from({ length: 11 }, (_, i) => 10 + i) };
      zet(l, { beeld: lijn, raketje: null });
    } else if (v.soort === "dichtst") {
      const labels = [...new Set([0, 20, v.n!, ...v.bordjes!])].sort((a, b) => a - b);
      lijn = { soort: "lijn", id: `${v.id}-samen`, van: 0, tot: 20, labels };
      zet(l, { beeld: lijn, raketje: null });
    }
    if (!lijn) return;
    const start = sprongStart(v);
    const doel = v.soort === "wie" ? v.n! : v.soort === "meer" ? v.meer!.b : v.soort === "dichtst" ? v.n! : Number(v.goed);
    if (v.soort !== "ongeveer") zet(l, { licht: { soort: "getal", n: start } });
    if (v.soort === "ongeveer") {
      await zegDoor(l, ZIN.samen(v), ZIN.samenBegin(v)[0]);
      zet(l, { licht: { soort: "getal", n: start } });
      await zegDoor(l, ZIN.samenBegin(v)[1]);
    } else await zegDoor(l, ZIN.samen(v), ...ZIN.samenBegin(v));
    /* Samen springen. Bij "dichtst" telt Bliepo de sprongen (1, 2), anders zegt hij het getal waar het raketje landt. */
    await springSamen(l, lijn, start, doel, (k, i) => (k === doel ? null : v.soort === "dichtst" ? ZIN.samenTelSprong(i) : ZIN.samenSprong(k)));
    /* Bij het doel: het getal komt erbij (nu pas het antwoord in beeld, 15.11). */
    const doelGetal = v.soort === "dichtst" ? Number(v.goed) : doel;
    if (v.soort === "bij" || v.soort === "natien" || v.soort === "ongeveer" || v.soort === "wie") zet(l, { extra: [doel] });
    zet(l, { licht: v.soort === "wie" ? { soort: "wezen", naam: v.goed as Wezen } : { soort: "getal", n: doelGetal } });
    speelLesgeluid("tik");
    await zegDoor(l, ZIN.samenDoel(v));
    zet(l, { licht: null });

    /* De kleine stap: het kind tikt het getal (of het ding) aan. */
    const wie = v.soort === "wie";
    const tikGetal = doelGetal;
    if (wie) zet(l, { wezens: { gekozen: null, tikbaar: true, alleen: v.goed } });
    else zet(l, { tik: [tikGetal] });
    const doelPlek: Punt = wie ? (() => { const p = wezenPlek(v.goed as Wezen, lijnX(lijn).x(v.n!)); return { x: p.x + 10, y: p.y + 20 }; })() : plekNaast(getalPlek(lijn, tikGetal));
    haak(l, { soort: wie ? "wezenSamen" : "getalSamen", goed: wie ? v.goed : String(tikGetal), vraag: v.id });
    zetTestAntwoord(wie ? v.goed : String(tikGetal));
    const hand = handKlok(l, () => ({ plek: doelPlek }), ZIN.samenHand(v));
    let gedaan: (() => void) | null = null;
    const klaar = new Promise<void>((r) => (gedaan = r));
    void zegOpdracht(l, [ZIN.samenStap(v)], klaar).then(() => hand.opnieuw(), () => {});
    try {
      const t = await Promise.race([l.wachtOpVlak(wie ? "wezenTik" : "getalTik"), l.wacht(VANGNET_MS).then(() => null)]);
      (gedaan as (() => void) | null)?.();
      if (t === null) {
        log(l, "vangnet", {});
        zelf = true;
      } else log(l, "tik", { x: wie ? v.goed : tikGetal, samen: true });
    } finally {
      hand.stop();
      zet(l, { tik: null, wezens: null });
    }
    if (v.soort === "meer") zet(l, { raketje: v.meer!.b });
  }
  haak(l, null);
  zetTestAntwoord(null);
  await l.wacht(DENK_MS);
  golfBijGoed(l, v, c);
  speelLesgeluid("goed");
  bliepoScherm("goed");
  await zegDoor(l, zelf ? ZIN.samenZelf(v) : ZIN.samenKlaar(v));
}

/* ---------- een vraag ---------- */

async function speelVraag(l: Lesgids, v: Vraag, eersteVraag: boolean, stopNaFout?: () => boolean): Promise<Uitkomst> {
  const s = st(l);
  const c = maakCtx(v);
  const opties = v.soort === "orden" || v.soort === "wie" ? null : schud(v.opties);
  const fouten = foutenVan(v);
  /* Een nieuw beeld (Bliepo tovert het tevoorschijn); de zin van de vorige vraag gaat weg (geleerd bij Tellen). */
  void l.zeg().catch(() => {});
  zet(l, { ...LEEG, beeld: c.beeld, raketje: raketVan(v), orden: v.soort === "orden" ? { actief: false, terug: ++s.terug } : null });
  speelLesgeluid("verschijn");
  /* De vraag komt met het nieuwe beeld (zoals Synthesis), ±0,7 s na het einde van de vorige zin (15.27). */
  await l.wacht(150);

  let zinnen = ZIN.vraag(v);
  let eerder: Fout | null = null;
  let eersteX: string | null = null;
  for (let poging = 1 as 1 | 2; poging <= 2; poging++) {
    let x: string;
    if (opties) {
      zetTestAntwoord(v.goed);
      haak(l, { soort: "kies", opties, goed: v.goed, poging, vraag: v.id }, poging === 1);
      x = await kiesAntwoord(l, opties, zinnen);
    } else if (v.soort === "wie") {
      zetTestAntwoord(v.goed);
      haak(l, { soort: "wie", opties: v.opties, goed: v.goed, poging, vraag: v.id }, poging === 1);
      x = await wieAntwoord(l, zinnen);
    } else {
      haak(l, { soort: "orden", goed: v.goed, kaarten: c.kaarten, fout: Object.keys(fouten), poging, vraag: v.id }, poging === 1);
      x = await ordenAntwoord(l, v, c, zinnen);
    }
    haak(l, null);
    await l.wacht(DENK_MS);
    if (x === v.goed) {
      zet(l, { wezens: null, licht: null });
      toonAntwoord(l, v, c);
      speelLesgeluid("goed");
      bliepoScherm("goed");
      const zz = poging === 1 ? lofZinnen(l, v, eersteVraag) : [bevestig(l)];
      log(l, "reactie", { soort: poging === 1 ? "goed" : "goed-na-fout", vraag: v.id, zin: zz.join(" ") });
      await zegDoor(l, ...zz);
      return noteer(l, v.id, poging === 1 ? "goed" : "naFout");
    }
    /* Geen fout-geluidje en geen rood op de keuze; alleen Bliepo's scherm kleurt rood (BOUWREGELS 5.3). */
    bliepoScherm("fout");
    s.opRij = 0;
    const f = fouten[x] ?? lijnFout(x, v);
    legDenkfoutVast(l, { vraag: v.id, antwoord: x, denkfout: f.code, poging });
    if (stopNaFout?.()) {
      log(l, "reactie", { soort: "proef-stop", vraag: v.id, x, denkfout: f.code });
      zet(l, { wezens: null });
      return noteer(l, v.id, "gestopt");
    }
    const fz = foutZinnen(l, f, poging, eerder).filter(Boolean);
    if (poging === 2 && x === eersteX && fz[0] === f.eerste) fz[0] = ZIN.weerGekozen(x, v);
    log(l, "reactie", { soort: `fout${poging}`, vraag: v.id, x, denkfout: f.code, zin: fz.join(" ") });
    /* Het vinkje gaat weg; gelegde kaarten blijven even liggen bij de hint en glijden daarna terug (geen schudden, geen rood). */
    zet(l, { wezens: null });
    if (poging === 1) {
      /* 1e fout: het rondje om wat de hint noemt (nooit om het antwoord, 15.17). */
      zet(l, { licht: lichtVan(f.licht) });
      await zegDoor(l, ...fz);
      zet(l, { licht: null });
      if (v.soort === "orden") zet(l, { orden: { actief: false, terug: ++s.terug } });
      zinnen = ZIN.opnieuw(v);
      eerder = f;
      eersteX = x;
      continue;
    }
    /* 2e fout (15.11): uitleg, dan samen springen; het kind doet de laatste stap. */
    await zegDoor(l, ...fz);
    await samenDoen(l, v, c);
    return noteer(l, v.id, "samen");
  }
  return noteer(l, v.id, "samen");
}

/* ---------- de uitleg na Nee (draaiboek stap 4; BOUWREGELS 4.5: de 6 stappen) ---------- */

async function uitlegRoute(l: Lesgids, naProef: boolean) {
  const lijn: Extract<GLBeeld, { soort: "lijn" }> = { soort: "lijn", id: "uitleg", van: 0, tot: 10, labels: Array.from({ length: 11 }, (_, i) => i) };
  void l.zeg().catch(() => {});
  zet(l, { ...LEEG, beeld: lijn, raketje: null, orden: null });
  speelLesgeluid("verschijn");
  await l.wacht(300);
  /* 1. Samen beginnen en geruststellen. 2. 1 ding uitleggen en laten zien. */
  if (!naProef) await zegDoor(l, ZIN.samenBeginnen);
  await zegDoor(l, ...ZIN.uitlegLijn);
  zet(l, { raketje: 0, licht: { soort: "getal", n: 0 } });
  await zegDoor(l, ZIN.uitlegStart);
  zet(l, { licht: null });

  /* 3. De kleine stap: het raketje laten springen tot de 3 (draaiboek §3 A en B). Alleen de volgende getallen zijn wit. */
  const doel = 3;
  let nu = 0;
  const bogen: [number, number][] = [];
  const tikbaar = () => Array.from({ length: doel - nu }, (_, i) => nu + 1 + i);
  zet(l, { tik: tikbaar(), grijs: true });
  haak(l, { soort: "spring", goed: String(nu + 1), vraag: "uitleg-springen" }, true);
  zetTestAntwoord(String(nu + 1));
  const hand = handKlok(l, () => ({ plek: plekNaast(getalPlek(lijn, nu + 1)) }), ZIN.uitlegSpringHand);
  let eerste: (() => void) | null = null;
  const gedaan = new Promise<void>((r) => (eerste = r));
  void zegOpdracht(l, ZIN.uitlegSpring, gedaan).then(() => {
    log(l, "vraag-klaar");
    hand.opnieuw();
  }, () => {});
  let mis = 0;
  let sinds = Date.now();
  let zelf = false;
  let wachtend: Promise<{ soort: string; n: number }> | null = null;
  while (nu < doel) {
    const rest = Math.max(500, VANGNET_MS - (Date.now() - sinds));
    const melding = wachtend ?? l.wachtOpVlak<{ soort: string; n: number }>("getalTik");
    wachtend = null;
    const t = await Promise.race([melding, l.wacht(rest).then(() => null)]);
    (eerste as (() => void) | null)?.();
    if (t === null || mis >= 3) {
      zelf = true;
      break;
    }
    log(l, "tik", { x: t.n, samen: true });
    /* Een getal waar het raketje al geweest is (dubbel getikt): niets. */
    if (t.n <= nu) continue;
    if (t.n === nu + 1) {
      /* Goed: het raketje springt, met een boog; Bliepo zegt niets tussen de sprongen (draaiboek §3 B.1). */
      bogen.push([nu, t.n]);
      nu = t.n;
      speelLesgeluid("tik");
      zet(l, { raketje: nu, bogen: [...bogen], tik: nu < doel ? tikbaar() : null });
      sinds = Date.now();
      hand.opnieuw();
      zetTestAntwoord(nu < doel ? String(nu + 1) : null);
      if (nu < doel) haak(l, { soort: "spring", goed: String(nu + 1), vraag: "uitleg-springen" });
      continue;
    }
    /* Een sprong overslaan (draaiboek §3 B.3 en B.5): het raketje blijft staan en Bliepo zegt "steeds 1". */
    mis++;
    hand.stop();
    const zinnen = t.n === doel && nu === 0 && mis === 1 ? ZIN.uitlegHeleStuk : mis === 1 ? ZIN.uitlegOverslaan : [ZIN.uitlegOverslaan[1]];
    zet(l, { licht: { soort: "getal", n: nu } });
    /* Dit hoort bij de opdracht (het kind springt verder): geen pijl, en een tik tijdens de zin telt (zoals de klokles). */
    wachtend = l.wachtOpVlak<{ soort: string; n: number }>("getalTik");
    if (mis < 3) await zegOpdracht(l, zinnen, wachtend);
    zet(l, { licht: null });
    if (mis >= 3) {
      zelf = true;
      break;
    }
    hand.opnieuw();
  }
  hand.stop();
  if (zelf) {
    log(l, "vangnet", { mis });
    zet(l, { tik: null });
    while (nu < doel) {
      bogen.push([nu, nu + 1]);
      nu++;
      zet(l, { raketje: nu, bogen: [...bogen] });
      speelLesgeluid("tik");
      await l.wacht(SPRONG_MS);
    }
    await zegDoor(l, ZIN.uitlegSpringZelf);
  }
  zet(l, { tik: null, grijs: false });
  haak(l, null);
  zetTestAntwoord(null);
  /* Na de laatste sprong even kijken (de boog komt erbij), dan de vraag (draaiboek §3 B.1: de laatste sprong + 1 à 2 s). */
  if (!zelf) await l.wacht(700);

  /* 4. De vraag (draaiboek stap 4.4: "hoe ver sprong hij?"). 5. Goed = bevestigen en uitleggen waarom. */
  const opties = schud(UITLEG_VRAAG.opties);
  let zinnen = [ZIN.uitlegVraag];
  let eerder: Fout | null = null;
  let eersteX: string | null = null;
  for (let poging = 1 as 1 | 2; poging <= 2; poging++) {
    zetTestAntwoord(UITLEG_VRAAG.goed);
    haak(l, { soort: "kies", opties, goed: UITLEG_VRAAG.goed, poging, vraag: UITLEG_VRAAG.id }, poging === 1);
    const x = await kiesAntwoord(l, opties, zinnen);
    haak(l, null);
    await l.wacht(DENK_MS);
    if (x === UITLEG_VRAAG.goed) {
      speelLesgeluid("goed");
      bliepoScherm("goed");
      const zz = [poging === 1 ? lofZin(l, true, false) : bevestig(l), ZIN.uitlegWaarom];
      log(l, "reactie", { soort: poging === 1 ? "goed" : "goed-na-fout", vraag: UITLEG_VRAAG.id, zin: zz.join(" ") });
      await zegDoor(l, ...zz);
      break;
    }
    bliepoScherm("fout");
    st(l).opRij = 0;
    const f = uitlegFout(x);
    legDenkfoutVast(l, { vraag: UITLEG_VRAAG.id, antwoord: x, denkfout: f.code, poging });
    const fz = foutZinnen(l, f, poging, eerder).filter(Boolean);
    if (poging === 2 && x === eersteX && fz[0] === f.eerste) fz[0] = ZIN.weerGekozen(x, VRAGEN[0]);
    log(l, "reactie", { soort: `fout${poging}`, vraag: UITLEG_VRAAG.id, x, denkfout: f.code, zin: fz.join(" ") });
    if (poging === 1) {
      zet(l, { licht: lichtVan(f.licht) });
      await zegDoor(l, ...fz);
      zet(l, { licht: null });
      zinnen = [ZIN.uitlegVraagOpnieuw];
      eerder = f;
      eersteX = x;
      continue;
    }
    /* 2e fout: uitleg, en samen de bogen tellen; het kind tikt de 3 aan (kleine stap). */
    await zegDoor(l, ...fz);
    await zegDoor(l, "Kom, we tellen de bogen samen.");
    for (let k = 1; k <= doel; k++) {
      zet(l, { licht: { soort: "getal", n: k } });
      speelLesgeluid("tik");
      await zegDoor(l, ZIN.uitlegSamenTel(k));
    }
    zet(l, { licht: null });
    await zegDoor(l, ZIN.uitlegSamenKlaar);
    zet(l, { tik: [doel] });
    haak(l, { soort: "getalSamen", goed: String(doel), vraag: UITLEG_VRAAG.id });
    zetTestAntwoord(String(doel));
    const h = handKlok(l, () => ({ plek: plekNaast(getalPlek(lijn, doel)) }), "Tik op de {3:wit}.");
    let klaar: (() => void) | null = null;
    const k2 = new Promise<void>((r) => (klaar = r));
    void zegOpdracht(l, ["Tik jij op de {3:wit}?"], k2).then(() => h.opnieuw(), () => {});
    const t = await Promise.race([l.wachtOpVlak("getalTik"), l.wacht(VANGNET_MS).then(() => null)]);
    (klaar as (() => void) | null)?.();
    h.stop();
    zet(l, { tik: null });
    haak(l, null);
    zetTestAntwoord(null);
    if (t === null) log(l, "vangnet", {});
    else log(l, "tik", { x: doel, samen: true });
    await l.wacht(DENK_MS);
    speelLesgeluid("goed");
    bliepoScherm("goed");
    await zegDoor(l, ZIN.uitlegWaarom);
  }
  /* 6. Met minder hulp verder. */
  await zegDoor(l, ZIN.nuJij);
}

/* ---------- de les ---------- */

const gouden: Lesdraaiboek = {
  id: "squla-getallenlijn-kat-1-gouden",
  titel: "Het raketje op de getallenlijn",
  /* Begint met "Squla": dan kleurt het lesscherm de getallen in Bliepo's tekst (data-squla; geleerd bij Tellen). */
  synthesis: "Squla groep 3 · Getallenlijn · Getallenlijn met een figuur · level 1 · gouden les (nieuwe versie van squla-getallenlijn-kat-1) · verloop draaiboek Getallenlijn (Count the Jumps)",
  indeling: "synthesis",
  browserstem: true,
  /* BOUWREGELS 15.27: zinnen van 1 stuk onder elkaar, pijl rechts als snelkoppeling, een tik stopt de stem. */
  pijlZoalsSynthesis: true,
  /* Bliepo praat zijn zinnen helemaal uit (15.27 punt 5; lib/stem.ts heelUitpraten). */
  stemHeelUitpraten: true,
  /* Elk woord licht op als Bliepo het zegt, ook met de browserstem (BOUWREGELS 3.7, 10 nov 2026; lib/stem.ts woordenMee). */
  woordenMeeMetStem: true,
  kaarttekening: KaartGetallenlijn,
  nacht: true,
  voorwerpen: GETALLENLIJN_VOORWERPEN,
  async speel(l) {
    STAAT.delete(l);
    log(l, "start");
    /* Het voorbeeld op het beginscherm (4.1): de lijn en het raketje van vraag 1. */
    const c0 = maakCtx(VRAGEN[0]);
    l.vlak<GLProps>(GetallenlijnGoudenVlak, { beeld: c0.beeld, raketje: raketVan(VRAGEN[0]) });
    speelLesgeluid("verschijn");
    await l.wacht(600);

    /* Stap 3. Groet en startvraag zijn 1 stuk (Sara, 10 november 2026): Ja = proef van 2 opgaven, 2 fouten = alsnog de
       uitleg; Nee = de uitleg. Zonder eerdere tik zegt Bliepo het hele stuk bij de eerste tik (lib/stem.ts heelUitpraten). */
    log(l, "vraag", { zin: "startvraag", opties: ["Ja", "Nee"] });
    zetTestAntwoord("Nee");
    haak(l, { soort: "kies", opties: ["Ja", "Nee"], goed: "Nee", poging: 1, vraag: "start" }, true);
    const pStart = l.kies(["Ja", "Nee"], { direct: true, weetniet: false });
    void zeg(l, NAAM_GROET, ZIN.start).catch(() => {});
    st(l).naamKeer = 1;
    st(l).naamVraag = 0;
    const start = await pStart;
    haak(l, null);
    log(l, "tik", { x: start });
    await l.wacht(DENK_MS);

    let uitleg = start !== "Ja";
    let vanaf = 0;
    if (start === "Ja") {
      await zegDoor(l, ZIN.proefBegin);
      let proefFouten = 0;
      for (let i = 0; i < 2 && !uitleg; i++) {
        const uit = await speelVraag(l, VRAGEN[i], i === 0, () => ++proefFouten >= 2);
        if (uit === "gestopt") uitleg = true;
      }
      log(l, "proef", { fouten: proefFouten, uitleg });
      if (uitleg) {
        await zegDoor(l, ...ZIN.proefLastig);
        /* De vragen uit de proef tellen niet: alle 15 komen na de uitleg. */
        st(l).eerste.clear();
        st(l).momenten.delete("eerste");
      } else {
        await zegDoor(l, ZIN.proefGoed);
        vanaf = 2;
      }
    }
    if (uitleg) await uitlegRoute(l, start === "Ja");

    /* Stap 7. De 15 vragen van squla-getallenlijn-kat-1. */
    for (let i = vanaf; i < VRAGEN.length; i++) {
      st(l).laatste = i === VRAGEN.length - 1;
      await speelVraag(l, VRAGEN[i], i === 0);
    }

    /* Einde: slotzin, kaart, eindzin uit het rijtje en wat het kind met de kaart doet (geen pijl). */
    zet(l, { ...LEEG, beeld: { soort: "leeg", id: "einde" }, raketje: null, orden: null });
    await zegDoor(l, ZIN.slot);
    log(l, "kaart");
    l.verderWeg?.();
    const tik = l.kaart();
    speelLesgeluid("kaart");
    await zeg(l, `${veelFouten(l) ? EINDE_VEEL_FOUTEN : kies(l, EINDE)} ${ZIN.kaartTik}`);
    await tik;
  },
};

export const LESSEN_SQULA_GETALLENLIJN_GOUDEN: Lesdraaiboek[] = [gouden];
