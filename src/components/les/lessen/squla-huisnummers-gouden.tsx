/**
 * DE GOUDEN LES HUISNUMMERS (10 november 2026; BOUWREGELS hoofdstuk 15, 15.22, 15.25, 15.27–15.30; LESRECEPT.md).
 *
 *   squla-huisnummers-gouden — een NIEUWE versie naast squla-huisnummers "Huisnummers: wat komt erna?" (BOUWREGELS
 *   15.8). De oude les (squla-huisnummers.tsx) blijft precies zoals hij is; pas na akkoord van Sara vervangt deze versie
 *   de oude voor kinderen.
 *
 * Waarom deze Squla-les: bij Huisnummers is er maar 1 Squla-les (squla-huisnummers, 17 vragen, geen levels). Die past
 * bij het draaiboek Huisnummers (Counting On) voor "erna" en over het tiental (39 → 40). Zie KEUZES-VOOR-SARA.md,
 * Ronde 26.
 *
 * Inhoud (15.22 punt 1): die van squla-huisnummers. Dezelfde 17 vragen in dezelfde volgorde, dezelfde straten, getallen
 * en keuzes: 5 keer erna (2 keer typen), 3 keer ervoor (1 keer typen), 3 keer ertussen, 3 keer slepen, 3 keer terug.
 *
 * Skelet (15.22 punt 3): het draaiboek Huisnummers (SYNTHESIS-ANALYSE/DRAAIBOEKEN-NIEUW/huisnummers.md):
 *   stap 1  openen: geen startvraag (§0: "er is geen weet-je-dit-al"); Bliepo groet en zegt in hetzelfde stuk wat we
 *           gaan doen; de eerste straat staat er al; vanzelf door;
 *   vraag   de straat komt in beeld, de vraag met de keuzes tegelijk (een tik is het antwoord); typen: een echt invulvak
 *           op het bordje + het vinkje (§2 stap 6: vakje + vinkje; vinkje zonder nummer telt niet als fout); slepen
 *           (eigen invulling): het huis naar de lege plek;
 *   goed    scherm 1 s groen, korte lof met het getal (§3 A.1 en C.1), het nummer komt op het bordje en het huis wipt op;
 *           goed na een fout: korte bevestiging; vanzelf door ±0,7 s (15.27);
 *   1e fout een zin die past bij hoe ver het kind ernaast zit (§3 A.2 en C.2), een hint vanaf het buurhuis (rood rondje
 *           om dat huis) en de vraag in andere woorden (§3 A.2);
 *   2e fout uitleg, dan telt Bliepo zelf langs de huizen, 1 stap per keer, elk huis krijgt even het rondje (§3 C.5 en
 *           D.3); bij het gat komt het nummer op het bordje; de kleine stap: het kind tikt dat huis aan of sleept het
 *           goede huis naar de lege plek (15.11); daarna door. Nooit stoppen ("pauze" van Synthesis niet, 15.18);
 *   blok    bij grotere getallen een korte zin (§2 stap 2 en 4: "nu tellen we met grotere getallen");
 *   hulphandje alleen bij slepen (opdracht), na ± 6 s stilte, naar de lege plek (nooit naar het goede huis, 15.17);
 *           bij kiezen en typen niets (§4: bij verder tellen kwam er bij Synthesis nooit vanzelf hulp);
 *   heel snel: niets (§3 C.8: bij verder tellen zei Synthesis niets over snel);
 *   stap 10 einde: een slotzin, de kaart, een eindzin uit het rijtje en "Tik op de kaart." (geen pijl op de kaart).
 *   Wat Counting On verder doet (getal zoeken in het rooster, benoemen, 3 à 9 verder tellen, "hoeveel nog tot 50?",
 *   "wil je een moeilijkere?") zit er NIET in: de Squla-les heeft die vragen niet (15.22; KEUZES Ronde 26).
 *
 * De verder-pijl (15.27, zoals de andere gouden lessen): Bliepo praat door; na elk stuk tekst gaat de les ±0,7 s na de
 * stem vanzelf verder (`zegDoor`). De pijl staat rechts onder de tekst als snelkoppeling. Bij vragen en opdrachten
 * staat er geen pijl.
 *
 * Elke fout wordt met zijn denkfout vastgelegd en elke vraag met zijn uitkomst (goed in 1 keer, goed na een fout,
 * samen gedaan) in de tabel les_uitkomsten (bewaarUitkomst; zonder gekozen kind gebeurt er niets).
 */

import type { Lesdraaiboek, Lesgids, Vlakgebeurtenis } from "../soort";
import { KaartHuisnummers } from "../vlakken/squla-huisnummers-straat";
import { HuisnummersGoudenVlak, huisMidden, losMidden, type HNProps, type Punt } from "../vlakken/squla-huisnummers-gouden-vlak";
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
  VRAGEN,
  ZIN,
  blok,
  buurPlek,
  foutenVan,
  gat,
  huisFout,
  huisReactie,
  metNaam,
  vooruit,
  type Fout,
  type Rijtje,
  type Vraag,
} from "./squla-huisnummers-gouden-zinnen";

const LES_ID = "squla-huisnummers-gouden";

/* ---------- tempo (draaiboek Huisnummers §5) ---------- */

/** Reactie na een tik (6.10a: 0,2 tot 0,4 s; draaiboek: stem 0,15–0,5 s na een tik). */
const DENK_MS = 250;
/** Bij een opdracht: na zoveel stilte vanzelf het hulphandje (15.19: ± 6 s). */
const AANWIJZING_MS = 6000;
/** Zo lang na het einde van de stem komt het volgende stuk (zeg() wacht zelf al 0,3 s; samen ±0,7 s; 15.27; draaiboek 0,5–0,6 s). */
const DOOR_NA_MS = 400;
/** Vangnet bij de kleine stap (LESRECEPT, geleerd bij Splitsen en Meer-minder): na zoveel stilte, of 3 keer mis, doet Bliepo de stap zelf. */
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
  gezien: Set<string>;
  typNr: number;
  terug: number;
  goed: number;
};
const STAAT = new WeakMap<Lesgids, Staat>();
const st = (l: Lesgids): Staat => {
  let s = STAAT.get(l);
  if (!s)
    STAAT.set(
      l,
      (s = { vorige: new Map(), recent: new Map(), zinNr: 0, robotNr: -99, namen: 0, naamKeer: 0, naamVraag: -99, opRij: 0, momenten: new Set(), vraag: 0, haak: 0, laatste: false, eerste: new Map(), vraagFouten: new Map(), log: [], robotReactie: false, nakijk: 0, gezien: new Set(), typNr: 0, terug: 0, goed: 0 }),
    );
  return s;
};

const zet = (l: Lesgids, p: Partial<HNProps>) => l.pasVlakAan<HNProps>(p);

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

/** Voor de eigen test: wat de les nu vraagt (window.__phaser.hnTaak). */
function haak(l: Lesgids, info: Record<string, unknown> | null, nieuw = false) {
  if (typeof window === "undefined") return;
  const s = st(l);
  if (nieuw) s.vraag++;
  window.__phaser = { ...window.__phaser, hnTaak: info ? { ...info, n: ++s.haak, v: s.vraag } : null } as typeof window.__phaser;
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

/** Lof bij goed in 1 keer: een speciaal moment, soms de naam, anders een lofzin; daarachter een korte reactie met het getal (draaiboek §3 C.1). */
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
  /* "Dat heb je goed gezien" alleen bij kijkvragen: hier tel je (verder of terug), dus niet. */
  lof ??= kies(l, LOF, [LOF_KIJK_INDEX]);
  const reactie = huisReactie(v);
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

const LEEG: Partial<HNProps> = { licht: null, typ: null, tikHuis: null, sleepbaar: false, hulphand: null };

/** Een nieuwe straat (Bliepo tovert hem tevoorschijn); de zin van de vorige vraag gaat weg (geleerd bij Tellen). */
function toonStraat(l: Lesgids, v: Vraag, losse: number[]) {
  zet(l, { ...LEEG, huizen: v.huizen, beeld: v.id, losse });
}

/** De straat met het goede nummer op het gat. */
const ingevuld = (v: Vraag) => v.huizen.map((h, i) => (i === gat(v) ? v.goed : h));

/** Bliepo loopt terug langs de huizen en zegt elk nummer (de reeks van de oude les bij terugtellen); het huis krijgt het rondje. */
async function loopTerug(l: Lesgids, v: Vraag) {
  const g = gat(v);
  const plekken = v.huizen.map((_, i) => i).filter((i) => i !== g).reverse();
  for (const i of plekken) {
    zet(l, { licht: i });
    await zegDoor(l, ZIN.samenTel(v.huizen[i] as number));
  }
  zet(l, { licht: null });
}

/* ---------- antwoorden: kiezen, typen, slepen ---------- */

/** De keuzeknoppen tegelijk met de zinnen. Een tik tijdens de zin telt. Geen pijl (l.kies vervangt hem). */
async function kiesAntwoord(l: Lesgids, opties: string[], zinnen: string[]): Promise<number> {
  const p = l.kies(opties, { direct: true, weetniet: false });
  log(l, "vraag", { zin: zinnen.join(" "), opties });
  /* De vraag is 1 uiting (LESRECEPT, geleerd bij Tellen). */
  const z = zeg(l, zinnen.join(" "));
  z.catch(() => {});
  const eerst = await Promise.race([z.then(() => "gezegd" as const), p.then(() => "getikt" as const)]);
  if (eerst === "gezegd") log(l, "vraag-klaar");
  const x = (await p) ?? "";
  log(l, "tik", { x });
  return Number(x);
}

/**
 * Typen in het echte invulvak op het bordje (HARDE REGEL 5). Het vinkje van het lesscherm staat er pas als er een nummer
 * in het vak staat (zoals bij Meer-minder: pas na een keuze); Enter werkt ook. Geen "Weet ik niet" (1.27).
 */
async function typAntwoord(l: Lesgids, v: Vraag, zinnen: string[]): Promise<number> {
  const s = st(l);
  const invul = { waarde: "" };
  zet(l, { typ: { sleutel: `typ-${v.id}-${++s.typNr}` }, zetWaarde: (w) => (invul.waarde = w) });
  log(l, "vraag", { zin: zinnen.join(" "), opties: ["typ"] });
  l.verderWeg?.();
  const z = zeg(l, zinnen.join(" "));
  z.catch(() => {});
  void z.then(() => log(l, "vraag-klaar"), () => {});
  let vol = false;
  for (;;) {
    type Uit = { g: Vlakgebeurtenis | null };
    const tik: Promise<Uit> = l.wachtOpVlak(["typVol", "typKlaar"]).then((g) => ({ g }));
    const knop: Promise<Uit> | null = vol ? l.knoppen(["controleer"]).then(() => ({ g: null })) : null;
    const r: Uit = await Promise.race(knop ? [tik, knop] : [tik]);
    if (r.g?.soort === "typVol") {
      vol = !!r.g.vol;
      continue;
    }
    if (invul.waarde) break;
  }
  log(l, "tik", { x: invul.waarde });
  return Number(invul.waarde);
}

/** Slepen: het kind sleept een huis naar de lege plek (of tikt het aan). Na ± 6 s stilte wijst het handje de lege plek aan. */
async function sleepAntwoord(l: Lesgids, v: Vraag, zinnen: string[]): Promise<number> {
  zet(l, { sleepbaar: true });
  const gelegd = l.wachtOpVlak<{ soort: string; n: number }>("gelegd");
  const hand = handKlok(l, () => ({ plek: plekNaast(huisMidden(v.huizen, gat(v))) }), ZIN.sleepHand);
  const zo = zegOpdracht(l, zinnen, gelegd);
  void zo.then(() => hand.opnieuw(), () => {});
  const g = await gelegd;
  hand.stop();
  zet(l, { sleepbaar: false });
  log(l, "tik", { x: g.n });
  return g.n;
}

/** Het handje schuin naast een plek, in de lege ruimte (niet over een ander huis; geleerd bij Tellen). */
const plekNaast = (p: Punt): Punt => ({ x: p.x + 20, y: p.y + 30 });

/* ---------- samen voordoen (2e fout; draaiboek §3 C.5 en D.3) ---------- */

/**
 * Bliepo telt zelf langs de huizen, 1 stap per keer; elk huis krijgt even het rondje en hij zegt het nummer. Bij het gat
 * komt het nummer op het bordje (nu pas het antwoord in beeld, 15.11). Dan de kleine stap van het kind: het huis met het
 * nieuwe nummer aantikken, of het goede huis naar de lege plek slepen. Vangnet: 20 s niets of 3 keer mis = Bliepo doet het.
 */
async function samenDoen(l: Lesgids, v: Vraag, losse: number[]) {
  const s = st(l);
  const g = gat(v);
  zet(l, { ...LEEG });
  await zegDoor(l, ZIN.samen, ZIN.samenBegin(v));
  const plekken = v.huizen.map((_, i) => i).filter((i) => (vooruit(v) ? i < g : i > g));
  for (const i of vooruit(v) ? plekken : plekken.reverse()) {
    zet(l, { licht: i });
    speelLesgeluid("tik");
    await zegDoor(l, ZIN.samenTel(v.huizen[i] as number));
  }
  /* Bij het gat: het nummer komt op het bordje (bij slepen blijft de plek leeg: daar komt het huis van het kind). */
  if (v.soort !== "sleep") zet(l, { huizen: ingevuld(v) });
  zet(l, { licht: g });
  speelLesgeluid("tik");
  await zegDoor(l, ZIN.samenGat(v));
  zet(l, { licht: null });

  let zelf = false;
  if (v.soort === "sleep") {
    const k = losse.indexOf(v.goed);
    const van = losMidden(losse.length, k);
    const naar = huisMidden(v.huizen, g);
    zet(l, { sleepbaar: true });
    haak(l, { soort: "sleepSamen", goed: String(v.goed), vraag: v.id });
    zetTestAntwoord(String(v.goed));
    const hand = handKlok(l, () => ({ plek: plekNaast(van), naar: plekNaast(naar) }), ZIN.samenHand(v));
    let eersteTik: (() => void) | null = null;
    const gedaan = new Promise<void>((r) => (eersteTik = r));
    void zegOpdracht(l, [ZIN.samenStap(v)], gedaan).then(() => hand.opnieuw(), () => {});
    try {
      let mis = 0;
      for (;;) {
        const t = await Promise.race([l.wachtOpVlak<{ soort: string; n: number }>("gelegd"), l.wacht(VANGNET_MS).then(() => null)]);
        (eersteTik as (() => void) | null)?.();
        if (t && t.n === v.goed) {
          log(l, "tik", { x: t.n, samen: true });
          break;
        }
        if (t === null || ++mis >= 3) {
          log(l, "vangnet", { mis });
          zelf = true;
          break;
        }
        /* Een ander huis: het glijdt terug en het handje doet het meteen voor (het antwoord staat al in beeld). */
        log(l, "tik", { x: t.n, samen: true });
        zet(l, { losTerug: ++s.terug });
        hand.nu();
      }
    } finally {
      hand.stop();
      zet(l, { sleepbaar: false });
    }
  } else {
    zet(l, { tikHuis: g });
    haak(l, { soort: "huisTik", goed: `huis-${v.goed}`, vraag: v.id });
    zetTestAntwoord(`huis-${v.goed}`);
    const hand = handKlok(l, () => ({ plek: plekNaast(huisMidden(v.huizen, g)) }), ZIN.samenHand(v));
    let eersteTik: (() => void) | null = null;
    const gedaan = new Promise<void>((r) => (eersteTik = r));
    void zegOpdracht(l, [ZIN.samenStap(v)], gedaan).then(() => hand.opnieuw(), () => {});
    try {
      const t = await Promise.race([l.wachtOpVlak("huisTik"), l.wacht(VANGNET_MS).then(() => null)]);
      (eersteTik as (() => void) | null)?.();
      if (t === null) {
        log(l, "vangnet", {});
        zelf = true;
      } else log(l, "tik", { x: `huis-${v.goed}`, samen: true });
    } finally {
      hand.stop();
      zet(l, { tikHuis: null });
    }
  }
  haak(l, null);
  zetTestAntwoord(null);
  await l.wacht(DENK_MS);
  zet(l, { huizen: ingevuld(v), losse: [], goed: ++s.goed });
  speelLesgeluid("goed");
  bliepoScherm("goed");
  await zegDoor(l, zelf ? ZIN.samenZelf(v) : ZIN.samenKlaar(v));
}

/* ---------- een vraag ---------- */

async function speelVraag(l: Lesgids, v: Vraag, i: number): Promise<Uitkomst> {
  const s = st(l);
  const opties = v.opties ? schud(v.opties) : null;
  /* Herstel 7 november (BOUWREGELS 1.23): de keuzes en de losse huizen staan elke keer op een andere plek. */
  const losse = v.losse ? schud(v.losse) : [];
  const fouten = foutenVan(v);
  /* Een nieuw blok met grotere getallen (draaiboek §2 stap 2 en 4), nog bij de oude straat. */
  if (i > 0 && blok(v) !== blok(VRAGEN[i - 1])) await zegDoor(l, ZIN.blok[blok(v)]);
  if (i > 0) {
    void l.zeg().catch(() => {});
    toonStraat(l, v, losse);
    speelLesgeluid("verschijn");
    /* De vraag komt met het nieuwe beeld (zoals Synthesis), ±0,7 s na het einde van de vorige zin (15.27). */
    await l.wacht(150);
  } else zet(l, { losse });
  /* De zin van de oude les vóór de vraag: de eerste keer per soort; bij terugtellen elke keer (dan weet het kind dat we terug lopen). */
  if (ZIN.aanloop(v) && (v.soort === "terug" || !s.gezien.has(v.soort))) await zegDoor(l, ZIN.aanloop(v));
  s.gezien.add(v.soort);
  /* Terugtellen: Bliepo loopt eerst terug langs de huizen (de reeks van de oude les). */
  if (v.soort === "terug") await loopTerug(l, v);

  let zinnen = ZIN.vraag(v);
  let eerder: Fout | null = null;
  let eersteX: number | null = null;
  for (let poging = 1 as 1 | 2; poging <= 2; poging++) {
    let x: number;
    if (opties) {
      zetTestAntwoord(String(v.goed));
      haak(l, { soort: "kies", opties: opties.map(String), goed: String(v.goed), poging, vraag: v.id }, poging === 1);
      x = await kiesAntwoord(l, opties.map(String), zinnen);
    } else if (v.losse) {
      zetTestAntwoord(String(v.goed));
      haak(l, { soort: "sleep", goed: String(v.goed), fout: losse.filter((n) => n !== v.goed).map(String), poging, vraag: v.id }, poging === 1);
      x = await sleepAntwoord(l, v, zinnen);
    } else {
      zetTestAntwoord(v.goed);
      haak(l, { soort: "typ", goed: String(v.goed), fout: Object.keys(fouten), poging, vraag: v.id }, poging === 1);
      x = await typAntwoord(l, v, zinnen);
    }
    haak(l, null);
    await l.wacht(DENK_MS);
    if (x === v.goed) {
      zet(l, { ...LEEG, huizen: ingevuld(v), losse: [], goed: ++s.goed });
      speelLesgeluid("goed");
      bliepoScherm("goed");
      const zz = poging === 1 ? lofZinnen(l, v, i === 0) : [bevestig(l)];
      log(l, "reactie", { soort: poging === 1 ? "goed" : "goed-na-fout", vraag: v.id, zin: zz.join(" ") });
      await zegDoor(l, ...zz);
      return noteer(l, v.id, poging === 1 ? "goed" : "naFout");
    }
    /* Geen fout-geluidje en geen rood op de keuze; alleen Bliepo's scherm kleurt rood (BOUWREGELS 5.3). */
    bliepoScherm("fout");
    s.opRij = 0;
    const f = fouten[String(x)] ?? huisFout(x, v);
    legDenkfoutVast(l, { vraag: v.id, antwoord: String(x), denkfout: f.code, poging });
    const fz = foutZinnen(l, f, poging, eerder).filter(Boolean);
    if (poging === 2 && x === eersteX && fz[0] === f.eerste) fz[0] = ZIN.weerGekozen(x, v);
    log(l, "reactie", { soort: `fout${poging}`, vraag: v.id, x, denkfout: f.code, zin: fz.join(" ") });
    /* Het invulvak gaat leeg weg, een gesleept huis glijdt terug (geen schudden, geen rood). */
    zet(l, { typ: null, ...(v.losse ? { losTerug: ++s.terug } : {}) });
    if (poging === 1) {
      /* 1e fout: het rondje om het buurhuis dat de hint noemt (nooit om het antwoord, 15.17). */
      zet(l, { licht: buurPlek(v) });
      await zegDoor(l, ...fz);
      zet(l, { licht: null });
      zinnen = ZIN.opnieuw(v);
      eerder = f;
      eersteX = x;
      continue;
    }
    /* 2e fout (15.11): uitleg, dan samen tellen; het kind doet de laatste stap. "Kom, we tellen samen." staat in het
       volgende stuk, zodat een stuk nooit meer dan 2 zinnen heeft (het vaste tekstvak, 15.30). */
    await zegDoor(l, ...fz);
    await samenDoen(l, v, losse);
    return noteer(l, v.id, "samen");
  }
  return noteer(l, v.id, "samen");
}

/* ---------- de les ---------- */

const gouden: Lesdraaiboek = {
  id: "squla-huisnummers-gouden",
  titel: "Huisnummers: wat komt erna?",
  /* Begint met "Squla": dan kleurt het lesscherm de getallen in Bliepo's tekst (data-squla; geleerd bij Tellen). */
  synthesis: "Squla groep 3 · Tellen · Telrij · gouden les (nieuwe versie van squla-huisnummers) · verloop draaiboek Huisnummers (Counting On)",
  indeling: "synthesis",
  browserstem: true,
  /* BOUWREGELS 15.27: zinnen van 1 stuk onder elkaar, pijl rechts als snelkoppeling, een tik stopt de stem. */
  pijlZoalsSynthesis: true,
  /* Bliepo praat zijn zinnen helemaal uit (15.27 punt 5; lib/stem.ts heelUitpraten). */
  stemHeelUitpraten: true,
  /* Elk woord licht op als Bliepo het zegt, ook met de browserstem (BOUWREGELS 3.7, 10 nov 2026; lib/stem.ts woordenMee). */
  woordenMeeMetStem: true,
  kaarttekening: KaartHuisnummers,
  nacht: true,
  async speel(l) {
    STAAT.delete(l);
    log(l, "start");
    /* Stap 1. Openen: de straat van vraag 1 staat er; Bliepo groet en zegt in hetzelfde stuk wat we gaan doen. */
    l.vlak<HNProps>(HuisnummersGoudenVlak, { huizen: VRAGEN[0].huizen, beeld: VRAGEN[0].id, losse: [] });
    await l.wacht(600);
    st(l).naamKeer = 1;
    st(l).naamVraag = 0;
    await zegDoor(l, NAAM_GROET, ZIN.begin);

    /* De 17 vragen van squla-huisnummers. */
    for (const [i, v] of VRAGEN.entries()) {
      st(l).laatste = i === VRAGEN.length - 1;
      await speelVraag(l, v, i);
    }

    /* Stap 10. Einde: slotzin, kaart, eindzin uit het rijtje en wat het kind met de kaart doet (geen pijl). */
    zet(l, { ...LEEG, huizen: null, beeld: "einde", losse: [] });
    await zegDoor(l, ZIN.slot);
    log(l, "kaart");
    l.verderWeg?.();
    const tik = l.kaart();
    speelLesgeluid("kaart");
    await zeg(l, `${veelFouten(l) ? EINDE_VEEL_FOUTEN : kies(l, EINDE)} ${ZIN.kaartTik}`);
    await tik;
  },
};


export const LESSEN_SQULA_HUISNUMMERS_GOUDEN: Lesdraaiboek[] = [gouden];
