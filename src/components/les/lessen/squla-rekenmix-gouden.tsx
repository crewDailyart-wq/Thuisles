/**
 * DE GOUDEN LES REKENMIX (11 november 2026; BOUWREGELS 15.25: "Rekenmix komt als laatste: elke vraag volgt de gouden
 * les van zijn eigen onderwerp"; LESRECEPT.md).
 *
 *   squla-rekenmix-mix1-1-gouden — een NIEUWE versie naast squla-rekenmix-mix1-1 "Rekenmix 1" (BOUWREGELS 15.8). De oude
 *   les (squla-rekenmix.tsx) en het oude vlak blijven precies zoals ze zijn; pas na akkoord van Sara vervangt deze versie
 *   de oude voor kinderen.
 *
 * Inhoud (15.22 punt 1): die van squla-rekenmix-mix1-1 (Squla 12517 level 1). Dezelfde 15 vragen in dezelfde volgorde,
 * dezelfde dingen (appels, ballen, potloden, auto's, bloemen, knikkers, sterren), dezelfde aantallen (5 t/m 12), dezelfde
 * manier van liggen (door elkaar, in rijen, 2 aan 2) en dezelfde 3 keuzes per vraag.
 *
 * Elke vraag is een TELVRAAG; hij volgt dus de GOUDEN LES TELLEN (squla-tellen-fruit-1-gouden, draaiboek Tellen / Color
 * Count, SYNTHESIS-ANALYSE/DRAAIBOEKEN-NIEUW/tellen.md), stap voor stap:
 *   stap 1  openen: de dingen van vraag 1 verschijnen; Bliepo groet en zegt wat we gaan doen (1 stuk, geen startvraag:
 *           het draaiboek Tellen heeft er geen);
 *   stap 3/4 tellen en het getal tikken (elke vraag):
 *     - goed in 1 keer: Bliepo's scherm 1 s groen, lof met het aantal, de nummers 1 t/m n tegelijk bij de dingen
 *       (leesvolgorde); bij de EERSTE vraag samen natellen (Bliepo telt hardop, nummer voor nummer, ± 1,15 s);
 *     - 1e fout: scherm 1,5 s rood (geen fout-geluidje), geen nummers, Bliepo noemt het gekozen getal en (als dat niets
 *       verklapt) de richting; daarna komen de knoppen terug met de hint;
 *     - 2e fout: korte uitleg bij de denkfout, "we tellen samen", dan tikt het kind elk ding aan en Bliepo telt hardop
 *       mee; het laatste getal is het aantal; de les gaat door (15.11); vangnet: 20 s geen tik = Bliepo telt de rest;
 *     - goed na een fout: alleen een korte bevestiging;
 *     - heel snel: Bliepo zegt niets (6.10, Tellen); lang wachten bij een keuzevraag: niets;
 *     - samen tellen is een opdracht: na ± 6 s stilte komt vanzelf het hulphandje met 1 korte zin (15.19);
 *   stap 10 einde: een slotzin, de kaart en een eindzin uit het rijtje.
 * Het verloop en de code zijn die van squla-tellen-gouden.tsx (niet veranderd); alleen het vlak (de dingen van de
 * Rekenmix) en de fouttabel-hints (passend bij door elkaar / rijen / 2 aan 2) zijn anders.
 *
 * De verder-pijl (15.27): Bliepo praat door; na elk stuk tekst gaat de les ±0,7 s na de stem vanzelf verder
 * (`zegDoor`). De pijl staat rechts onder de tekst als snelkoppeling. Bij vragen en opdrachten (samen tellen) staat er
 * geen pijl. Bliepo praat zijn zinnen helemaal uit en elk woord licht op als hij het zegt (stemHeelUitpraten,
 * woordenMeeMetStem).
 *
 * Elke fout wordt met zijn denkfout vastgelegd en elke vraag met zijn uitkomst (goed in 1 keer, goed na een fout, samen
 * gedaan) in de tabel les_uitkomsten (bewaarUitkomst); mislukt dat, dan gaat de les gewoon door.
 */

import type { Lesdraaiboek, Lesgids } from "../soort";
import { GoudenRekenmixVlak, type GoudenRekenmixProps, type RmgOpgave } from "../vlakken/squla-rekenmix-gouden-vlak";
import { zegTelwoord, zetTestAntwoord } from "./squla-hulp";
import { speelLesgeluid } from "@/lib/lesgeluiden";
import { bliepoScherm } from "@/lib/bliepo-scherm";
import { bewaarUitkomst } from "@/app/lesuitkomstacties";
import { percentageGoed } from "@/lib/les-kleuren";
import { EIND_TIK_KAART, eindzin } from "../eindzinnen";
import { BEVESTIG, LOF, LOF_KIJK_INDEX, MOMENT, NAAM_GROET, NAAM_LOF, ONDUIDELIJK, ONDUIDELIJK_NOG_1_KEER, OVERGANG, RM, TELREACTIE_JA, TELREACTIE_ROBOT, TELREACTIE_RM, VRAGEN, WISSEL_RM, foutReactie, foutenRm, gk, metNaam, opnieuwZin, plekken, type Fout, type Rijtje, type Rmvraag, type Varianten } from "./squla-rekenmix-gouden-zinnen";
import { maakKiezer } from "./nooit-dubbel";
import { alleenBijKeuze } from "./squla-klok-gouden-zinnen";

const LES_ID = "squla-rekenmix-mix1-1-gouden";

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
type Staat = { vorige: Map<Rijtje, number>; zinNr: number; robotNr: number; naamVraag: number; naamKeer: number; namen: number; opRij: number; momenten: Set<string>; haak: number; goed: number; fout: number; vraag: number; laatste: boolean; eerste: Map<string, Uitkomst>; vraagFouten: Map<string, string[]>; alleDenkfouten: string[]; log: unknown[]; robotTel: boolean; telVorige: number };
const STAAT = new WeakMap<Lesgids, Staat>();
const st = (l: Lesgids): Staat => {
  let s = STAAT.get(l);
  if (!s) STAAT.set(l, (s = { vorige: new Map(), zinNr: 0, robotNr: -99, naamVraag: -99, naamKeer: 0, namen: 0, opRij: 0, momenten: new Set(), haak: 0, goed: 0, fout: 0, vraag: 0, laatste: false, eerste: new Map(), vraagFouten: new Map(), alleDenkfouten: [...(l.hervat?.denkfouten ?? [])], log: [], robotTel: false, telVorige: -1 }));
  return s;
};

const zet = (l: Lesgids, p: Partial<GoudenRekenmixProps>) => l.pasVlakAan<GoudenRekenmixProps>(p);

/**
 * NOOIT 2 KEER HETZELFDE (Sara, 18 november 2026; zoals de gouden les Tellen): alle zinnen in varianten (RM en de
 * fouttabel) kiest de les met deze gedeelde kiezer. Nooit dezelfde zin 2 keer achter elkaar, ook niet over vragen heen.
 * "Je koos 7." en "Je koos 9." tellen als dezelfde zin, net als "Tik op elke bal." en "Tik op elk potlood.".
 */
const KIEZER = maakKiezer({ wissel: WISSEL_RM });
const variant = (sleutel: string, zinnen: readonly string[], mag?: (z: string) => boolean) => KIEZER.kies(sleutel, zinnen, mag);

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

/* Voortgangsbalk (BOUWREGELS 15.54): zoveel vragen heeft een normale route; vragen die alleen na een fout terugkomen
   tellen niet mee (Math.min). Na elke afgeronde vraag een stukje verder; nooit terug (het lesscherm negeert een lagere waarde). */
const balkTotaal = (): number => VRAGEN.length;

function noteer(l: Lesgids, vraag: string, uit: Uitkomst): Uitkomst {
  const s = st(l);
  const nieuweVraag = !s.eerste.has(vraag);
  if (nieuweVraag) s.eerste.set(vraag, uit);
  l.voortgang?.(Math.min(1, s.eerste.size / balkTotaal()));
  const fouten = s.vraagFouten.get(vraag) ?? [];
  s.vraagFouten.delete(vraag);
  s.alleDenkfouten.push(...fouten);
  /* Verdergaan waar je was (15.53): na elke vraag onthouden waar het kind is. */
  l.stap?.(hervatId(vraag), uit, fouten);
  if (typeof window === "undefined") return uit;
  const naam = { goed: "goed in één keer", naFout: "goed na een fout", samen: "samen gedaan" } as const;
  /* Een sleutel per vraag is maar 1 keer te verdienen, ook bij opnieuw spelen (15.52, 15.55; zoals noteer in
     squla-extra-basis.ts): zegt de server "al verdiend", dan vliegt er geen sleutel. */
  const eerstKeer = uit === "goed" && nieuweVraag;
  try {
    void bewaarUitkomst({ lesId: LES_ID, vraagId: vraag, uitkomst: naam[uit], denkfouten: uit === "goed" ? [] : fouten, pogingen: uit === "goed" ? 1 : 2 })
      .then((r) => {
        if (eerstKeer && !(r.ok && r.nieuweSleutel === false)) l.sleutel?.();
      })
      .catch(() => {
        if (eerstKeer) l.sleutel?.();
      });
  } catch {
    /* bewaren mislukt: de les gaat gewoon door */
  }
  const w = window as unknown as { __uitkomsten?: unknown[] };
  (w.__uitkomsten ??= []).push({ les: LES_ID, vraag, uitkomst: { goed: "goed-in-een-keer", naFout: "goed-na-fout", samen: "samen-gedaan" }[uit], teltVoorBeheersing: uit === "goed", denkfouten: fouten, tijd: new Date().toISOString() });
  return uit;
}

/** De stand bewaart alleen letters, cijfers en _.:- (hervatstand.ts); andere tekens in de vraag-id worden "_". Alleen voor de stand. */
const hervatId = (vraag: string) => vraag.replace(/[^A-Za-z0-9_.:-]/g, "_");

/**
 * Verdergaan waar je was (15.53; zoals klaarAl in squla-extra-basis.ts): is deze vraag al gemaakt vóór het kind wegging, dan
 * telt het antwoord van toen (resultaat en voortgangsbalk) en slaat de les de vraag over. Geeft de uitkomst van toen, of null.
 */
function klaarAl(l: Lesgids, vraag: string): Uitkomst | null {
  const al = l.hervat?.antwoorden.find((a) => a[0] === hervatId(vraag))?.[1];
  if (!al) return null;
  const s = st(l);
  if (!s.eerste.has(vraag)) s.eerste.set(vraag, al);
  l.voortgang?.(Math.min(1, s.eerste.size / balkTotaal()));
  return al;
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

/** De reactie met het aantal: per aantal en ding 1 rijtje (zodat "niet 2 keer dezelfde" werkt zoals bij Tellen). */
const TELRIJTJES = new Map<string, Rijtje>();
const telrijtje = (v: Rmvraag): Rijtje => {
  const k = `${v.n}-${v.ding.kleur}`;
  let r = TELRIJTJES.get(k);
  if (!r) TELRIJTJES.set(k, (r = TELREACTIE_RM(v.n, v.ding)));
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
  lof ??= kies(l, LOF, [LOF_KIJK_INDEX, ...alleenBijKeuze(l, LOF)]);
  /* Lof en aantal beginnen niet allebei met hetzelfde woord ("Ja, … Ja, …"). */
  const woord = (z: string) => z.split(/[\s,:!.]/)[0].toLowerCase();
  const r = telrijtje(v);
  const zonder = r.zinnen.map((_, i) => i).filter((i) => woord(r.zinnen[i]) === woord(lof));
  if (woord(lof) === "ja") zonder.push(...TELREACTIE_JA);
  /* De robotzin (plek 4, "Inderdaad, je telde tot …") hooguit 1 keer per les. */
  if (s.robotTel) zonder.push(TELREACTIE_ROBOT);
  /* Niet 2 keer achter elkaar dezelfde zin met het aantal, ook niet bij een ander aantal ("Het zijn er 10." en daarna
     "Het zijn er 6."): elk aantal heeft een eigen rijtje, dus onthoud de vorige zin over de hele les (keuring 12 nov). */
  /* kies() slaat de vorige zin van hetzelfde rijtje over; hier is dat de vorige zin over de hele les. Alleen als er dan
     nog een gewone zin over is (anders zou kies() terugvallen op een zin met "Ja" na een lof met "Ja"). */
  const vrij = r.zinnen.map((_, i) => i).filter((i) => !zonder.includes(i) && i !== s.telVorige && i !== TELREACTIE_ROBOT);
  s.vorige.set(r, vrij.length ? s.telVorige : -1);
  const aantal = kies(l, r, zonder);
  s.telVorige = r.zinnen.indexOf(aantal);
  if (aantal === r.zinnen[TELREACTIE_ROBOT]) s.robotTel = true;
  return [lof, aantal];
}
const bevestig = (l: Lesgids) => {
  st(l).opRij = 0;
  return kies(l, BEVESTIG, alleenBijKeuze(l, BEVESTIG));
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

/** Wat Bliepo zegt bij een fout: foutReactie uit het zinnenbestand (het fouttabel-script keurt precies die functie). */
function foutZinnen(l: Lesgids, f: Fout & { v: Varianten }, v: Rmvraag, x: string, poging: 1 | 2, eerder: Fout | null, eersteX: string, eersteZin: string): string[] {
  return foutReactie(variant, f, v, { x: Number(x), poging, eerder, eersteX: eersteX ? Number(eersteX) : null, eersteZin, onduidelijk: () => kies(l, ONDUIDELIJK, poging === 2 ? [ONDUIDELIJK_NOG_1_KEER] : []) });
}

/* ---------- het beeld ---------- */

const opgaveVan = (v: Rmvraag): RmgOpgave => ({ id: `${LES_ID}-${v.nr}`, dingen: plekken(v).map((p) => ({ beeld: v.ding.beeld, ...p })) });
const leeg = (v: Rmvraag) => Array.from({ length: v.n }, () => 0);
const alle = (v: Rmvraag) => Array.from({ length: v.n }, (_, i) => i + 1);

/**
 * Draaiboek Tellen §3 A.1 (b): Bliepo telt zelf hardop, bij elk ding komt om de beurt een nummer (± 1,15 s per nummer).
 * Tekst van Bliepo, geen opdracht: de pijl staat erbij als snelkoppeling (15.27); een tik zet alle nummers er meteen bij.
 */
async function natellen(l: Lesgids, v: Rmvraag) {
  const nummers = leeg(v);
  zet(l, { nummers: [...nummers] });
  const p = l.verder();
  let getikt = false;
  void p.then(() => (getikt = true));
  await Promise.race([l.wacht(300), p]);
  for (let i = 0; i < v.n && !getikt; i++) {
    nummers[i] = i + 1;
    zet(l, { nummers: [...nummers] });
    log(l, "natel", { n: i + 1 });
    /* Het laatste getal zegt Bliepo in de zin hierna ("En 7! …"): zo klinkt het maar 1 keer (18 nov 2026). */
    if (i === v.n - 1) break;
    void zeg(l, `${gk(i + 1, v.ding)}.`).catch(() => {});
    await Promise.race([l.wacht(NATEL_MS), p]);
  }
  if (getikt) {
    log(l, "pijl-getikt");
    zet(l, { nummers: alle(v) });
  }
  log(l, "nageteld", { n: v.n });
  await zegDoor(l, getikt ? variant("natellenKlaarSnel", RM.natellenKlaarSnel(v.n, v.ding)) : variant("natellenKlaar", RM.natellenKlaar(v.n, v.ding)));
}

/**
 * Draaiboek Tellen §3 A.3: samen tellen na de 2e fout. Het kind tikt elk ding aan (in elke volgorde); er komt een
 * nummer bij en Bliepo zegt het getal. Een ding met een nummer telt niet nog een keer. Na ± 6 s stilte komt vanzelf
 * het hulphandje (15.19): de eerste keer met een aanmoediging en 1 korte zin, daarna alleen het handje.
 */
async function samenTellen(l: Lesgids, v: Rmvraag) {
  const nummers = leeg(v);
  let geteld = 0;
  let handGezegd = false;
  zet(l, { nummers: [...nummers], tikbaar: true, hand: null });
  const volgende = () => nummers.findIndex((x) => x === 0);
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
        /* Het kind moet tikken, niet nadenken (14.35). 1 uiting. */
        void zeg(l, `${variant("aanmoedigTikken", RM.aanmoedigTikken)} ${variant("samenHand", RM.samenHand(v.ding))}`).catch(() => {});
      }
    }, AANWIJZING_MS);
  };
  log(l, "samen-tellen", { vraag: v.id });
  const opdracht = variant("samenTik", RM.samenTik(v.ding));
  void zegOpdracht(l, opdracht).then(() => log(l, "vraag-klaar"), () => {});
  wachtOpHand();
  let zelf = false;
  let sinds = Date.now();
  try {
    while (geteld < v.n) {
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
      nummers[t.index] = geteld;
      zet(l, { nummers: [...nummers], hand: null, ...(geteld === v.n ? { tikbaar: false } : {}) });
      speelLesgeluid("tik");
      log(l, "tel-tik", { i: t.index, n: geteld });
      if (geteld < v.n) {
        zetTestAntwoord(`tel-${volgende()}`);
        haak(l, { soort: "tel", goed: `tel-${volgende()}`, vraag: v.id });
        void zegTelwoord(l, opdracht, `${gk(geteld, v.ding)}.`).catch(() => {}); /* 15.47: de opdracht blijft in beeld */
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
    while (geteld < v.n) {
      nummers[volgende()] = ++geteld;
      zet(l, { nummers: [...nummers] });
      speelLesgeluid("tik");
      await l.wacht(250);
    }
    /* 15.40 (F20): ook na samen tellen het groene scherm en het geluid (goed-na-hulp). */
    speelLesgeluid("goed");
    bliepoScherm("goed");
    await zegDoor(l, variant("samenZelf", RM.samenZelf(v.n, v.ding)));
    return;
  }
  await l.wacht(DENK_MS);
  speelLesgeluid("goed");
  bliepoScherm("goed");
  await zegDoor(l, variant("samenKlaar", RM.samenKlaar(v.n, v.ding)));
}

/* ---------- 1 telvraag: 2 pogingen (zoals de gouden les Tellen) ---------- */

async function telVraag(l: Lesgids, v: Rmvraag, eersteVraag: boolean): Promise<Uitkomst> {
  const s = st(l);
  s.vraag++;
  const opties = schud(v.keuzes).map(String);
  const fouten = foutenRm(v);
  const goed = String(v.n);
  /* De zin van de vorige vraag weg zodra de nieuwe dingen komen. */
  if (!eersteVraag) void l.zeg().catch(() => {});
  zet(l, { opgave: opgaveVan(v), nummers: [], kleur: v.ding.kleur, tikbaar: false, hand: null });
  if (!eersteVraag) speelLesgeluid("verschijn");
  await l.wacht(150);
  let eerder: Fout | null = null;
  let eersteX = "";
  let eersteZin = "";
  let zinnen = eersteVraag ? [RM.vraag(v.ding), RM.vraagEerste] : [RM.vraag(v.ding)];
  for (let poging = 1 as 1 | 2; poging <= 2; poging++) {
    zetTestAntwoord(goed);
    haak(l, { soort: "kies", opties, goed, poging, vraag: v.id, fout: v.keuzes.filter((k) => k !== v.n).map(String) });
    const x = await vraagMetKnoppen(l, opties, zinnen);
    haak(l, null);
    await l.wacht(DENK_MS);
    if (x === goed) {
      speelLesgeluid("goed");
      bliepoScherm("goed");
      zet(l, { goed: ++s.goed, nummers: poging === 1 && eersteVraag && !l.zonderUitleg ? [] : alle(v) });
      if (poging === 1) {
        const lof = lofZinnen(l, v, eersteVraag);
        log(l, "reactie", { soort: "goed", vraag: v.id, zin: lof.join(" ") });
        /* Opnieuw doen na de beste kleur (15.60): geen samen natellen bij de eerste vraag. */
        if (eersteVraag && !l.zonderUitleg) {
          await zegDoor(l, lof[0], variant("natellen", RM.natellen));
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
    const f = fouten[x] ?? { code: "onduidelijk", soort: "onduidelijk", denkfout: "niet duidelijk", eerste: "", hint: "", uitleg: "", weer: [], scherm: "", v: { eerste: [], hint: [], uitleg: [], weerEerste: [], weerUitleg: [] } };
    legDenkfoutVast(l, { vraag: v.id, antwoord: x, denkfout: f.code, poging });
    /* Hetzelfde getal 2 keer ("Je koos weer …"), nooit 2 keer "dichtbij" bij 1 vraag, geen stuk 2 keer: zie foutReactie. */
    const fz = foutZinnen(l, f, v, x, poging, eerder, eersteX, eersteZin).filter(Boolean);
    log(l, "reactie", { soort: `fout${poging}`, vraag: v.id, x, denkfout: f.code, zin: fz.join(" ") });
    if (poging === 1) {
      /* 1e fout (draaiboek Tellen §3 A.2): de vraag verdwijnt; de eerste zin (vanzelf door), dan komen de knoppen terug
         met de hint (een vraag: geen pijl). */
      await zegDoor(l, fz[0]);
      /* Na de hint komt de vraag terug (15.37, F16), tenzij de hint zelf al zegt dat het kind op het getal tikt. */
      zinnen = [...fz.slice(1), opnieuwZin(variant, v, fz.slice(1).join(" "))].filter(Boolean);
      eerder = f;
      eersteX = x;
      eersteZin = fz[0];
    } else {
      /* 2e fout (draaiboek Tellen §3 A.3, 15.11): uitleg, samen tellen, door. */
      await zegDoor(l, ...fz);
      await zegDoor(l, variant("samenHelp", RM.samenHelp));
      await samenTellen(l, v);
      return noteer(l, v.id, "samen");
    }
  }
  return noteer(l, v.id, "samen");
}

/* ---------- de les ---------- */

const gouden: Lesdraaiboek = {
  id: "squla-rekenmix-mix1-1-gouden",
  titel: "Rekenmix 1",
  /* Begint met "Squla": dan kleurt het lesscherm de getallen in Bliepo's tekst (data-squla). */
  synthesis: "Squla groep 3 · Rekenmix · Rekenmix 1 · level 1 · gouden les (nieuwe versie van squla-rekenmix-mix1-1) · alle vragen zijn telvragen: verloop van de gouden les Tellen (draaiboek Tellen, Color Count)",
  indeling: "synthesis",
  browserstem: true,
  nacht: true,
  /* BOUWREGELS 15.27: zinnen van 1 stuk onder elkaar, pijl rechts als snelkoppeling, een tik stopt de stem. */
  pijlZoalsSynthesis: true,
  /* Bliepo praat zijn zinnen helemaal uit (15.27 punt 5); de eindkaart staat links van het tekstvak. */
  stemHeelUitpraten: true,
  /* Elk woord licht op als Bliepo het zegt (BOUWREGELS 3.7). */
  woordenMeeMetStem: true,
  voorwerpen: [...new Set(VRAGEN.map((v) => v.ding.beeld))].sort(),
  /* Het nieuwe eindscherm (15.55, EINDSCHERM-INBOUW.md). De oude kaart (KaartRekenmixGouden) blijft in
     squla-rekenmix-gouden-vlak.tsx staan; deze les gebruikt hem niet meer. */
  eindscherm: true,
  eindOnderwerp: "Rekenmix 1",
  eindLeerzin: "Je kunt nu dingen tellen tot 12.",
  eindPlaatje: "/voorwerpen/speelbal.png",
  eindKaartZin: EIND_TIK_KAART,
  async speel(l) {
    STAAT.delete(l);
    log(l, "start");
    if (l.snelEinde) return snelNaarEinde(l);
    l.voortgang?.(0);
    /* Stap 1. Openen: de appels van vraag 1 verschijnen; Bliepo groet en zegt wat we gaan doen, in 1 stuk. */
    l.vlak<GoudenRekenmixProps>(GoudenRekenmixVlak, { opgave: opgaveVan(VRAGEN[0]), nummers: [], kleur: VRAGEN[0].ding.kleur, voorraad: [...new Set(VRAGEN.map((v) => v.ding.beeld))] });
    speelLesgeluid("verschijn");
    await l.wacht(600);
    st(l).naamKeer = 1;
    st(l).naamVraag = 0;
    /* Verdergaan (15.53): "welkom terug" in plaats van de groet en het uitlegdeel. Opnieuw doen: eerst zeggen dat het kind
       de les al deed, daarna de les zoals altijd. */
    if (l.hervat) await zegDoor(l, l.openingsZin ?? NAAM_GROET);
    /* Opnieuw doen na de beste kleur (15.60, zoals Synthesis): eerst de groet, dan "Dit ken je al", geen uitlegdeel. */
    else if (l.zonderUitleg) await zegDoor(l, NAAM_GROET, l.openingsZin ?? "");
    else await zegDoor(l, ...(l.openingsZin ? [l.openingsZin] : []), NAAM_GROET, variant("begin", RM.begin));

    /* Stap 3 en 4. De 15 vragen van squla-rekenmix-mix1-1. */
    for (const [i, v] of VRAGEN.entries()) {
      /* Verdergaan (15.53): een vraag die al gemaakt is, wordt met zijn overgangszin overgeslagen. */
      if (klaarAl(l, v.id)) continue;
      st(l).laatste = i === VRAGEN.length - 1;
      /* Af en toe een overgangszin (BLIEPO-KARAKTER.md §12); meestal niet (zoals Tellen: 1 keer, halverwege). */
      if (i === 7) await zegDoor(l, kies(l, OVERGANG));
      await telVraag(l, v, i === 0);
    }

    /* Stap 10. Einde: het nieuwe eindscherm (15.55). Was: slotzin (RM.slot), de kaart en een eindzin uit het rijtje. */
    void l.zeg().catch(() => {});
    zet(l, { opgave: null, nummers: [], hand: null, tikbaar: false });
    l.voortgang?.(1);
    await eindeScherm(l);
  },
};

/**
 * Percentage goed in 1 keer en de denkfouten van deze speelbeurt (voor de kleur van het rondje en het bewaren). Op de
 * voorbeeldpagina kun je met `&snel=p72` een percentage forceren (alleen om elke kleur te kunnen zien).
 */
function resultaat(l: Lesgids): { percentage: number; denkfouten: string[] } {
  if (l.snelEinde) {
    let p = l.snelEinde === "alles" ? 100 : l.snelEinde === "moeite" ? 40 : 80;
    try {
      const m = /^p(\d{1,3})$/.exec(new URLSearchParams(window.location.search).get("snel") ?? "");
      if (m) p = Math.min(100, Number(m[1]));
    } catch {
      /* standaard */
    }
    return { percentage: p, denkfouten: [] };
  }
  const s = st(l);
  const goed = [...s.eerste.values()].filter((x) => x === "goed").length;
  return { percentage: percentageGoed(goed, Math.max(balkTotaal(), s.eerste.size)), denkfouten: [...s.alleDenkfouten] };
}

/** Het eindscherm met 1 standaard eindzin van Bliepo (eindzinnen.ts), daarna de leerzin en de kaart (Lesscherm). */
async function eindeScherm(l: Lesgids) {
  void l.zeg().catch(() => {});
  l.verderWeg?.();
  /* Het laatste sleuteltje vliegt nog (±0,9 s): eerst laten aankomen, dan pas het feest. */
  await l.wacht(1000);
  log(l, "eindscherm");
  l.eindscherm?.(resultaat(l));
  /* Bliepo praat pas als het feestgeluid (±1,4 s) voorbij is en de ster komt. */
  await l.wacht(1500);
  await zeg(l, eindzin(resultaat(l).percentage));
  await l.eindAfsluiten?.();
}

/** Alleen op de voorbeeldpagina (`&snel=1`): meteen naar het eindscherm, met een paar sleutels om de teller te zien. Bewaart niets. */
async function snelNaarEinde(l: Lesgids) {
  const totaal = balkTotaal();
  l.voortgang?.(0);
  const n = l.snelEinde === "alles" ? 5 : l.snelEinde === "moeite" ? 1 : 3;
  l.vlak<GoudenRekenmixProps>(GoudenRekenmixVlak, { opgave: opgaveVan(VRAGEN[0]), nummers: [], kleur: VRAGEN[0].ding.kleur, voorraad: [...new Set(VRAGEN.map((v) => v.ding.beeld))] });
  /* Eerst de groet: bij een geplakte link komt dan de afspeelknop (15.38) en mag er daarna geluid klinken. */
  await zeg(l, NAAM_GROET);
  await l.wacht(300);
  for (let i = 0; i < n; i++) {
    l.voortgang?.(((i + 1) * 3) / totaal);
    l.sleutel?.();
    await l.wacht(1100);
  }
  l.voortgang?.(1);
  zet(l, { opgave: null, nummers: [], hand: null, tikbaar: false });
  await eindeScherm(l);
}

export const LESSEN_SQULA_REKENMIX_GOUDEN: Lesdraaiboek[] = [gouden];
