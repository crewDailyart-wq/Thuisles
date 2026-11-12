/**
 * DE GOUDEN LES REKENMIX 3 "HEEL MOEILIJK" (12 november 2026; BOUWREGELS 15.25; LESRECEPT.md; KEUZES-VOOR-SARA.md Ronde 44 punt 7).
 *
 *   squla-rekenmix-mix3-4-gouden: een NIEUWE versie naast squla-rekenmix-mix3-4 "Rekenmix 3 (heel moeilijk)" (BOUWREGELS
 *   15.8). De oude les (squla-rekenmix.tsx) en het oude vlak blijven precies zoals ze zijn; pas na akkoord van Sara
 *   vervangt deze versie de oude voor kinderen.
 *
 * Inhoud (15.22 punt 1): die van squla-rekenmix-mix3-4 (Squla level 4). Dezelfde 15 vragen in dezelfde volgorde: "Er zijn 6
 * ballen. Hoeveel zitten er in de doos?" Het totaal, het deel dat je buiten ziet (ballen bij een doos, knikkers bij een
 * zak) en dezelfde 3 keuzes. Het splitsbeen (totaal, het deel dat je ziet, een vraagteken) staat linksboven, zoals in de
 * oude les.
 *
 * Elke vraag is een SPLITSVRAAG: hij volgt de gouden les Splitsen (het totaal, het deel dat je ziet, het deel dat je zoekt)
 * in het verloop van de gouden Rekenmix: openen zonder startvraag, vraag met 3 keuzes, 1e fout = eerste zin + hint, 2e fout
 * = uitleg en samen tellen (Bliepo telt wat buiten ligt; de ballen komen uit de doos en het kind tikt ze aan, Bliepo telt
 * verder), goed = lof en de doos gaat open, hulphandje alleen bij samen tellen, vangnet na 20 s, einde met slotzin en kaart.
 *
 * De verder-pijl (15.27): Bliepo praat door; na elk stuk tekst gaat de les ±0,7 s na de stem vanzelf verder (`zegDoor`).
 * Bij vragen en opdrachten (samen tellen) staat er geen pijl.
 *
 * Elke fout wordt met zijn denkfout vastgelegd en elke vraag met zijn uitkomst in de tabel les_uitkomsten
 * (bewaarUitkomst); mislukt dat, dan gaat de les gewoon door.
 */

import type { Lesdraaiboek, Lesgids } from "../soort";
import { GoudenRekenmixVlak, KaartRekenmixGouden, type GoudenRekenmixProps, type RmgOpgave } from "../vlakken/squla-rekenmix-gouden-vlak";
import { zetTestAntwoord } from "./squla-hulp";
import { speelLesgeluid } from "@/lib/lesgeluiden";
import { bliepoScherm } from "@/lib/bliepo-scherm";
import { bewaarUitkomst } from "@/app/lesuitkomstacties";
import { AANMOEDIG_TIKKEN, BEVESTIG, EINDE, EINDE_VEEL_FOUTEN, LOF, LOF_KIJK_INDEX, MOMENT, NAAM_GROET, NAAM_LOF, ONDUIDELIJK, ONDUIDELIJK_NOG_1_KEER, OVERGANG, SPLITSREACTIE, SPLITSREACTIE_JA, VRAGEN, ZIN, binnenIdx, buitenIdx, dichtbijAnders, foutenVan, gk, metNaam, plekken, zonderDichtbij, type Fout, type Rijtje, type Vraag3 as Rmvraag } from "./squla-rekenmix3-gouden-zinnen";

const LES_ID = "squla-rekenmix-mix3-4-gouden";

/** Alle plaatjes van de les: vooruit tekenen. */
const ALLE_BEELDEN = [...new Set(VRAGEN.flatMap((v) => [v.ding.beeld, v.houder]))].sort();

/* ---------- tempo (draaiboek Tellen §5; zelfde als de gouden les Tellen) ---------- */

/** Reactie na een tik (6.10a: 0,2 tot 0,4 s). */
const DENK_MS = 200;
/** Bij een opdracht (samen tellen): na zoveel stilte vanzelf het hulphandje (15.19: ongeveer 6 s). */
const AANWIJZING_MS = 6000;
/** Samen natellen: zoveel tijd per nummer (draaiboek Tellen §3 A.1 b: 1,1 tot 1,2 s). */
const NATEL_MS = 1150;
/** Zo lang na het einde van de stem komt het volgende stuk (zeg() wacht zelf al 0,3 s; samen ±0,7 s; 15.27). */
const DOOR_NA_MS = 400;
/** Vangnet bij samen tellen: na zoveel stilte telt Bliepo de rest zelf. */
const VANGNET_MS = 20000;

/* ---------- staat per les ---------- */

type Uitkomst = "goed" | "naFout" | "samen";
type Staat = { vorige: Map<Rijtje, number>; zinNr: number; robotNr: number; naamVraag: number; naamKeer: number; namen: number; opRij: number; momenten: Set<string>; haak: number; goed: number; fout: number; vraag: number; laatste: boolean; eerste: Map<string, Uitkomst>; vraagFouten: Map<string, string[]>; log: unknown[]; robotTel: boolean; telVorige: number };
const STAAT = new WeakMap<Lesgids, Staat>();
const st = (l: Lesgids): Staat => {
  let s = STAAT.get(l);
  if (!s) STAAT.set(l, (s = { vorige: new Map(), zinNr: 0, robotNr: -99, naamVraag: -99, naamKeer: 0, namen: 0, opRij: 0, momenten: new Set(), haak: 0, goed: 0, fout: 0, vraag: 0, laatste: false, eerste: new Map(), vraagFouten: new Map(), log: [], robotTel: false, telVorige: -1 }));
  return s;
};

const zet = (l: Lesgids, p: Partial<GoudenRekenmixProps>) => l.pasVlakAan<GoudenRekenmixProps>(p);

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

/** Voor de eigen test: wat de les nu vraagt (window.__phaser.telTaak). Verandert niets aan de les. */
function haak(l: Lesgids, info: Record<string, unknown> | null) {
  if (typeof window === "undefined") return;
  const s = st(l);
  window.__phaser = { ...window.__phaser, telTaak: info ? { ...info, n: ++s.haak, v: s.vraag } : null } as typeof window.__phaser;
}

/* ---------- denkfouten en uitkomsten bewaren (zoals de gouden les Tellen) ---------- */

function legDenkfoutVast(l: Lesgids, d: { vraag: string; antwoord: string; denkfout: string; poging: number }) {
  const s = st(l);
  s.vraagFouten.set(d.vraag, [...(s.vraagFouten.get(d.vraag) ?? []), d.denkfout]);
  if (typeof window === "undefined") return;
  const regel = { les: LES_ID, tijd: new Date().toISOString(), ...d };
  const w = window as unknown as { __denkfouten?: unknown[] };
  (w.__denkfouten ??= []).push(regel);
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

/* ---------- het vaste rijtje (zelfde regels als de gouden les Tellen) ---------- */

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

/** De reactie met wat er in de doos zat: per vraag 1 rijtje. */
const TELRIJTJES = new Map<string, Rijtje>();
const telrijtje = (v: Rmvraag): Rijtje => {
  let r = TELRIJTJES.get(v.id);
  if (!r) TELRIJTJES.set(v.id, (r = SPLITSREACTIE(v)));
  return r;
};

/** Lof bij goed in 1 keer: een speciaal moment, soms de naam, anders een lofzin; daarna het aantal (zoals Tellen). */
function lofZinnen(l: Lesgids, v: Rmvraag, eerste: boolean): string[] {
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
  lof ??= kies(l, LOF, [LOF_KIJK_INDEX]);
  /* Lof en aantal beginnen niet allebei met hetzelfde woord ("Ja, … Ja, …"). */
  const woord = (z: string) => z.split(/[\s,:!.]/)[0].toLowerCase();
  const r = telrijtje(v);
  const zonder = r.zinnen.map((_, i) => i).filter((i) => woord(r.zinnen[i]) === woord(lof));
  if (woord(lof) === "ja") zonder.push(...SPLITSREACTIE_JA);
  /* Niet 2 keer achter elkaar dezelfde zin met het aantal, ook niet bij een ander aantal ("Het zijn er 10." en daarna
     "Het zijn er 6."): elk aantal heeft een eigen rijtje, dus onthoud de vorige zin over de hele les (keuring 12 nov). */
  /* kies() slaat de vorige zin van hetzelfde rijtje over; hier is dat de vorige zin over de hele les. Alleen als er dan
     nog een gewone zin over is (anders zou kies() terugvallen op een zin met "Ja" na een lof met "Ja"). */
  const vrij = r.zinnen.map((_, i) => i).filter((i) => !zonder.includes(i) && i !== s.telVorige);
  s.vorige.set(r, vrij.length ? s.telVorige : -1);
  const aantal = kies(l, r, zonder);
  s.telVorige = r.zinnen.indexOf(aantal);
  return [lof, aantal];
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

/** De zin bij een opdracht: geen pijl; de les wacht daarna op de opdracht. */
function zegOpdracht(l: Lesgids, zin: string): Promise<void> {
  log(l, "opdrachtzin", { zin });
  l.verderWeg?.();
  const z = zeg(l, zin);
  z.catch(() => {});
  return z;
}

/** De keuzeknoppen tegelijk met de zinnen (de vraag, of bij de 2e poging de hint). Een tik tijdens de zin telt. */
async function vraagMetKnoppen(l: Lesgids, opties: string[], zinnen: string[]): Promise<string> {
  const p = l.kies(opties, { direct: true, weetniet: false });
  log(l, "vraag", { zin: zinnen.join(" "), opties });
  /* De vraag is 1 uiting: tikt het kind al tijdens de 1e zin, dan begint Bliepo niet alsnog aan de 2e. */
  const z = zeg(l, zinnen.join(" "));
  z.catch(() => {});
  const eerst = await Promise.race([z.then(() => "gezegd" as const), p.then(() => "getikt" as const)]);
  const klaar = eerst === "gezegd" ? performance.now() : null;
  if (klaar) log(l, "vraag-klaar");
  const x = (await p) ?? "";
  log(l, "tik", { x, naVraag: klaar ? Math.round(performance.now() - klaar) : -1 });
  return x;
}

/** Wat Bliepo zegt bij een fout, uit de fouttabel (zelfde regels als de gouden les Tellen). */
function foutZinnen(l: Lesgids, f: Fout, poging: 1 | 2, eerder: Fout | null): string[] {
  const eerste = f.eerste || kies(l, ONDUIDELIJK, poging === 2 ? [ONDUIDELIJK_NOG_1_KEER] : []);
  if (poging === 1) return [eerste, f.hint];
  /* "Weer" alleen als Bliepo de 1e keer al zei wat er mis was (niet na alleen "… is dichtbij."). */
  const zelfde = eerder !== null && eerder.soort === f.soort && !eerder.noot && f.code !== "onduidelijk";
  return zelfde ? f.weer : [eerste, f.uitleg];
}

/* ---------- het beeld ---------- */

const opgaveVan = (v: Rmvraag): RmgOpgave => ({ id: `${LES_ID}-${v.nr}`, reserveer: 200, dingen: plekken(v).map((p) => ({ beeld: p.beeld, x: p.x, y: p.y, m: p.m, boven: p.boven })) });
const leeg = (v: Rmvraag) => plekken(v).map(() => 0);
/** Alleen de nummers van wat buiten ligt (1 t/m het deel dat je ziet). */
const buitenNummers = (v: Rmvraag) => {
  const a = leeg(v);
  buitenIdx(v).forEach((d, k) => (a[d] = k + 1));
  return a;
};
/** Alle nummers: buiten 1 t/m b, in de doos verder tot het totaal. */
const alle = (v: Rmvraag) => {
  const a = buitenNummers(v);
  binnenIdx(v).forEach((d, k) => (a[d] = v.buiten + k + 1));
  return a;
};
/** Het vlak van een vraag: de dingen, het splitsbeen en wat er in de doos zit (verborgen). */
const beeldVan = (v: Rmvraag): Partial<GoudenRekenmixProps> => ({ opgave: opgaveVan(v), nummers: [], kleur: v.ding.kleur, tikbaar: false, tikbaarOp: undefined, hand: null, verborgen: binnenIdx(v), splitsbeen: { tot: v.tot, deel: v.buiten, kleur: v.ding.kleur } });

/**
 * Draaiboek Tellen §3 A.1 (b): Bliepo telt zelf hardop, bij elk ding komt om de beurt een nummer (± 1,15 s per nummer).
 * Tekst van Bliepo, geen opdracht: de pijl staat erbij als snelkoppeling (15.27); een tik zet alle nummers er meteen bij.
 */
async function natellen(l: Lesgids, v: Rmvraag) {
  const nummers = buitenNummers(v);
  /* De doos gaat open: wat er in zat komt tevoorschijn; Bliepo telt verder vanaf wat buiten lag. */
  zet(l, { nummers: [...nummers], verborgen: [] });
  const p = l.verder();
  let getikt = false;
  void p.then(() => (getikt = true));
  await Promise.race([l.wacht(300), p]);
  const binnen = binnenIdx(v);
  for (let i = 0; i < v.binnen && !getikt; i++) {
    nummers[binnen[i]] = v.buiten + i + 1;
    zet(l, { nummers: [...nummers] });
    log(l, "natel", { n: v.buiten + i + 1 });
    void zeg(l, `${gk(v.buiten + i + 1, v.ding)}.`).catch(() => {});
    await Promise.race([l.wacht(NATEL_MS), p]);
  }
  if (getikt) {
    log(l, "pijl-getikt");
    zet(l, { nummers: alle(v) });
  }
  log(l, "nageteld", { n: v.binnen });
  await zegDoor(l, ZIN.natellenKlaar(v));
}

/**
 * Draaiboek Tellen §3 A.3: samen tellen na de 2e fout. Het kind tikt elk ding aan (in elke volgorde); er komt een
 * nummer bij en Bliepo zegt het getal. Een ding met een nummer telt niet nog een keer. Na ± 6 s stilte komt vanzelf
 * het hulphandje (15.19): de eerste keer met een aanmoediging en 1 korte zin, daarna alleen het handje.
 */
async function samenTellen(l: Lesgids, v: Rmvraag) {
  const nummers = buitenNummers(v);
  let geteld = 0;
  let handGezegd = false;
  const doel = binnenIdx(v);
  /* Bliepo telt wat buiten ligt; dan komen de dingen uit de doos. */
  zet(l, { nummers: [...nummers], hand: null });
  await zegDoor(l, ZIN.samenBuiten(v));
  await zegDoor(l, ZIN.samenKomen(v));
  zet(l, { verborgen: [], tikbaar: true, tikbaarOp: doel });
  await l.wacht(400);
  const volgende = () => doel.find((d) => nummers[d] === 0) ?? -1;
  zetTestAntwoord(`tel-${volgende()}`);
  haak(l, { soort: "tel", goed: `tel-${volgende()}`, vraag: v.id });
  let klok: ReturnType<typeof setTimeout> | undefined;
  const wachtOpHand = () => {
    clearTimeout(klok);
    klok = setTimeout(() => {
      const i = volgende();
      if (i < 0) return;
      log(l, "aanwijzing", { i });
      zet(l, { hand: i });
      if (!handGezegd) {
        handGezegd = true;
        void zeg(l, `${AANMOEDIG_TIKKEN[Math.floor(Math.random() * AANMOEDIG_TIKKEN.length)]} ${ZIN.samenHand(v)}`).catch(() => {});
      }
    }, AANWIJZING_MS);
  };
  log(l, "samen-tellen", { vraag: v.id });
  void zegOpdracht(l, ZIN.samenTik(v)).then(() => log(l, "vraag-klaar"), () => {});
  wachtOpHand();
  let zelf = false;
  let sinds = Date.now();
  try {
    while (geteld < v.binnen) {
      const rest = Math.max(500, VANGNET_MS - (Date.now() - sinds));
      const t = await Promise.race([l.wachtOpVlak<{ soort: string; index: number }>("telTik"), l.wacht(rest).then(() => null)]);
      if (t === null) {
        zelf = true;
        log(l, "vangnet", { geteld });
        break;
      }
      log(l, "tik", { x: `tel-${t.index}`, samen: true });
      if (nummers[t.index] > 0) continue;
      sinds = Date.now();
      geteld++;
      nummers[t.index] = v.buiten + geteld;
      zet(l, { nummers: [...nummers], hand: null, ...(geteld === v.binnen ? { tikbaar: false } : {}) });
      speelLesgeluid("tik");
      log(l, "tel-tik", { i: t.index, n: geteld });
      if (geteld < v.binnen) {
        zetTestAntwoord(`tel-${volgende()}`);
        haak(l, { soort: "tel", goed: `tel-${volgende()}`, vraag: v.id });
        void zeg(l, `${gk(v.buiten + geteld, v.ding)}.`).catch(() => {});
        wachtOpHand();
      }
    }
  } finally {
    clearTimeout(klok);
    zet(l, { tikbaar: false, hand: null });
    haak(l, null);
    zetTestAntwoord(null);
  }
  if (zelf) {
    /* Bliepo zet de rest van de nummers erbij, 1 voor 1, zonder te praten; daarna "Kijk, …" (geen "Ja", geen "samen"). */
    while (geteld < v.binnen) {
      nummers[volgende()] = v.buiten + ++geteld;
      zet(l, { nummers: [...nummers] });
      speelLesgeluid("tik");
      await l.wacht(250);
    }
    await zegDoor(l, ZIN.samenZelf(v));
    return;
  }
  await l.wacht(DENK_MS);
  await zegDoor(l, ZIN.samenKlaar(v));
}

/* ---------- 1 telvraag: 2 pogingen (zoals de gouden les Tellen) ---------- */

async function telVraag(l: Lesgids, v: Rmvraag, eersteVraag: boolean): Promise<Uitkomst> {
  const s = st(l);
  s.vraag++;
  const opties = schud(v.keuzes).map(String);
  const fouten = foutenVan(v);
  const goed = String(v.binnen);
  /* De zin van de vorige vraag weg zodra de nieuwe dingen komen. */
  if (!eersteVraag) void l.zeg().catch(() => {});
  zet(l, beeldVan(v));
  if (!eersteVraag) speelLesgeluid("verschijn");
  await l.wacht(150);
  let eerder: Fout | null = null;
  let eersteX = "";
  let eersteZin = "";
  let zinnen = ZIN.vraag(v, eersteVraag);
  for (let poging = 1 as 1 | 2; poging <= 2; poging++) {
    zetTestAntwoord(goed);
    haak(l, { soort: "kies", opties, goed, poging, vraag: v.id, fout: v.keuzes.filter((k) => k !== v.binnen).map(String) });
    const x = await vraagMetKnoppen(l, opties, zinnen);
    haak(l, null);
    await l.wacht(DENK_MS);
    if (x === goed) {
      speelLesgeluid("goed");
      bliepoScherm("goed");
      zet(l, { goed: ++s.goed, ...(poging === 1 && eersteVraag ? {} : { nummers: alle(v), verborgen: [] }) });
      if (poging === 1) {
        const lof = lofZinnen(l, v, eersteVraag);
        log(l, "reactie", { soort: "goed", vraag: v.id, zin: lof.join(" ") });
        if (eersteVraag) {
          await zegDoor(l, lof[0], ZIN.natellen);
          await natellen(l, v);
        } else await zegDoor(l, lof.join(" "));
        return noteer(l, v.id, "goed");
      }
      const z = bevestig(l);
      log(l, "reactie", { soort: "goed-na-fout", vraag: v.id, zin: z });
      await zegDoor(l, z);
      return noteer(l, v.id, "naFout");
    }
    /* Geen fout-geluidje en geen rood op de keuze; alleen Bliepo's scherm kleurt rood (5.3). */
    bliepoScherm("fout");
    zet(l, { fout: ++s.fout });
    s.opRij = 0;
    const f = fouten[x] ?? { code: "onduidelijk", soort: "onduidelijk", denkfout: "niet duidelijk", eerste: "", hint: "", uitleg: "", weer: [], scherm: "" } satisfies Fout;
    legDenkfoutVast(l, { vraag: v.id, antwoord: x, denkfout: f.code, poging });
    const fz = foutZinnen(l, f, poging, eerder).filter(Boolean);
    /* Hetzelfde foute getal 2 keer: niet 2 keer dezelfde eerste zin. */
    if (poging === 2 && x === eersteX && fz[0] === f.eerste) fz[0] = ZIN.weerGekozen(Number(x), v.ding);
    /* Een ander fout getal, maar weer zonder richting: een andere versie van de eerste zin (keuring Meten). */
    else if (poging === 2 && eerder?.noot && f.noot && fz[0] === f.eerste) fz[0] = dichtbijAnders(Number(x), v);
    /* Nooit 2 keer "dichtbij" bij 1 vraag (keuring Tellen 11 nov). */
    if (poging === 2 && /dichtbij/.test(eersteZin) && /dichtbij/.test(fz[0]) && x !== eersteX) fz[0] = zonderDichtbij(Number(x), v);
    log(l, "reactie", { soort: `fout${poging}`, vraag: v.id, x, denkfout: f.code, zin: fz.join(" ") });
    if (poging === 1) {
      /* 1e fout (draaiboek Tellen §3 A.2): de vraag verdwijnt; de eerste zin (vanzelf door), dan komen de knoppen terug
         met de hint (een vraag: geen pijl). */
      await zegDoor(l, fz[0]);
      zinnen = fz.slice(1);
      eerder = f;
      eersteX = x;
      eersteZin = fz[0];
    } else {
      /* 2e fout (draaiboek Tellen §3 A.3, 15.11): uitleg, samen tellen, door. */
      await zegDoor(l, ...fz);
      await zegDoor(l, ZIN.samenHelp[st(l).fout % 3]);
      await samenTellen(l, v);
      return noteer(l, v.id, "samen");
    }
  }
  return noteer(l, v.id, "samen");
}

/* ---------- de les ---------- */

const gouden: Lesdraaiboek = {
  id: "squla-rekenmix-mix3-4-gouden",
  titel: "Rekenmix 3 (heel moeilijk)",
  /* Begint met "Squla": dan kleurt het lesscherm de getallen in Bliepo's tekst (data-squla). */
  synthesis: "Squla groep 3 · Rekenmix · Rekenmix 3 · level 4 · gouden les (nieuwe versie van squla-rekenmix-mix3-4) · alle vragen zijn splitsvragen (hoeveel zitten er in de doos): verloop van de gouden les Splitsen en de gouden Rekenmix",
  indeling: "synthesis",
  browserstem: true,
  nacht: true,
  /* BOUWREGELS 15.27: zinnen van 1 stuk onder elkaar, pijl rechts als snelkoppeling, een tik stopt de stem. */
  pijlZoalsSynthesis: true,
  /* Bliepo praat zijn zinnen helemaal uit (15.27 punt 5); de eindkaart staat links van het tekstvak. */
  stemHeelUitpraten: true,
  /* Elk woord licht op als Bliepo het zegt (BOUWREGELS 3.7). */
  woordenMeeMetStem: true,
  voorwerpen: ALLE_BEELDEN,
  kaarttekening: KaartRekenmixGouden,
  async speel(l) {
    STAAT.delete(l);
    log(l, "start");
    /* Stap 1. Openen: de appels van vraag 1 verschijnen; Bliepo groet en zegt wat we gaan doen, in 1 stuk. */
    l.vlak<GoudenRekenmixProps>(GoudenRekenmixVlak, { opgave: opgaveVan(VRAGEN[0]), ...beeldVan(VRAGEN[0]), voorraad: ALLE_BEELDEN });
    speelLesgeluid("verschijn");
    await l.wacht(600);
    st(l).naamKeer = 1;
    st(l).naamVraag = 0;
    await zegDoor(l, NAAM_GROET, ZIN.begin);

    /* Stap 3 en 4. De 15 vragen van squla-rekenmix-mix3-4. */
    for (const [i, v] of VRAGEN.entries()) {
      st(l).laatste = i === VRAGEN.length - 1;
      /* Af en toe een overgangszin (BLIEPO-KARAKTER.md §12); meestal niet (zoals Tellen: 1 keer, halverwege). */
      if (i === 7) await zegDoor(l, kies(l, OVERGANG));
      await telVraag(l, v, i === 0);
    }

    /* Stap 10. Einde: slotzin, kaart, eindzin uit het rijtje. */
    void l.zeg().catch(() => {});
    zet(l, { opgave: null, nummers: [], hand: null, tikbaar: false, splitsbeen: null, verborgen: [] });
    await zegDoor(l, ZIN.slot);
    log(l, "kaart");
    /* Geen pijl op de eindkaart (15.27). */
    l.verderWeg?.();
    const tik = l.kaart();
    speelLesgeluid("kaart");
    await zeg(l, `${veelFouten(l) ? EINDE_VEEL_FOUTEN : kies(l, EINDE)} ${ZIN.kaartTik}`);
    await tik;
  },
};

export const LESSEN_SQULA_REKENMIX3_GOUDEN: Lesdraaiboek[] = [gouden];
