/**
 * DE GOUDEN LES TELLEN (9 november 2026; BOUWREGELS hoofdstuk 15, 15.22; LESRECEPT.md).
 *
 *   squla-tellen-fruit-1-gouden — een NIEUWE versie naast squla-tellen-fruit-1 (BOUWREGELS 15.8). De oude les
 *   (squla-tellen.tsx) blijft precies zoals hij is; pas na akkoord van Sara vervangt deze versie de oude voor kinderen.
 *
 * Inhoud (15.22 punt 1): die van squla-tellen-fruit-1. Dezelfde 15 vragen in dezelfde volgorde, dezelfde getallen
 * (11 t/m 17), hetzelfde fruit (appels, peren, pruimen in rijen van 5) en dezelfde 3 keuzes per vraag.
 *
 * Skelet (15.22 punt 3): het draaiboek Tellen (Color Count, SYNTHESIS-ANALYSE/DRAAIBOEKEN-NIEUW/tellen.md):
 *   stap 1  openen: het fruit verschijnt, Bliepo zegt wat we gaan doen, wacht op de blauwe pijl;
 *   stap 3/4 tellen en het getal tikken (elke vraag):
 *     - goed in 1 keer: Bliepo's scherm 1 s groen, lof met het aantal, de nummers 1 t/m n tegelijk bij het fruit
 *       (leesvolgorde), wacht op de pijl; bij de EERSTE vraag samen natellen (Bliepo telt hardop, nummer voor nummer);
 *     - 1e fout: scherm 1,5 s rood (geen fout-geluidje), geen nummers, Bliepo noemt het gekozen getal en (als dat niets
 *       verklapt) de richting; de knoppen komen meteen terug met de hint (geen pijl);
 *     - 2e fout: korte uitleg bij de denkfout, "we tellen samen" (pijl), dan tikt het kind elk stuk fruit aan en Bliepo
 *       telt hardop mee; het laatste getal is het aantal; pijl; de les gaat door (15.11);
 *     - goed na een fout: alleen een korte bevestiging;
 *     - heel snel: Bliepo zegt niets (6.10); lang wachten bij een keuzevraag: niets (zoals het draaiboek);
 *     - samen tellen is een opdracht: na ± 6 s stilte komt vanzelf het hulphandje met 1 korte zin (15.19);
 *   stap 10 einde: een slotzin, de kaart en een eindzin uit het rijtje.
 *   Stap 2 (zelf een kleur kiezen) en stap 5 t/m 9 (welke kleur, 2 kleuren samen, zelf maken, lijstje) zitten er NIET in:
 *   de Squla-les heeft die vragen niet (KEUZES-VOOR-SARA.md, Ronde 20).
 * Alle vragen zijn 11 t/m 17 (boven het draaiboek, dat tot 10 gaat): zelfde skelet; de hints en de fouttabel zijn eigen
 * invulling, niet van Synthesis (15.22 punt 5).
 *
 * Elke fout wordt met zijn denkfout vastgelegd en elke vraag met zijn uitkomst (goed in 1 keer, goed na een fout, samen
 * gedaan) in de tabel les_uitkomsten (bewaarUitkomst); mislukt dat, dan gaat de les gewoon door.
 */

import type { Lesdraaiboek, Lesgids } from "../soort";
import { GoudenTelVlak, KaartTellenGouden, type GoudenTelProps } from "../vlakken/squla-tellen-gouden-vlak";
import type { Telopgave } from "../vlakken/squla-tellen-holo";
import { zetTestAntwoord } from "./squla-hulp";
import { speelLesgeluid } from "@/lib/lesgeluiden";
import { bliepoScherm } from "@/lib/bliepo-scherm";
import { bewaarUitkomst } from "@/app/lesuitkomstacties";
import { AANMOEDIG, AANMOEDIG_KIEST, BEVESTIG, EINDE, EINDE_VEEL_FOUTEN, LOF, LOF_KIJK_INDEX, MOMENT, NAAM_GROET, NAAM_LOF, ONDUIDELIJK, ONDUIDELIJK_NOG_1_KEER, OVERGANG, TELREACTIE, UITLEG, VRAGEN, ZIN, foutenVan, gk, metNaam, type Fout, type Rijtje, type Telvraag } from "./squla-tellen-gouden-zinnen";

const LES_ID = "squla-tellen-fruit-1-gouden";

/* ---------- tempo (draaiboek Tellen §5) ---------- */

/** Reactie na een tik (6.10a: 0,2 tot 0,4 s). */
const DENK_MS = 200;
/** Bij een opdracht (samen tellen): na zoveel stilte vanzelf het hulphandje (15.19: ongeveer 6 s). */
const AANWIJZING_MS = 6000;

/* ---------- staat per les ---------- */

type Uitkomst = "goed" | "naFout" | "samen";
type Staat = { vorige: Map<Rijtje, number>; zinNr: number; robotNr: number; naamVraag: number; naamKeer: number; namen: number; opRij: number; momenten: Set<string>; pijlUitgelegd: boolean; goed: number; fout: number; vraag: number; laatste: boolean; eerste: Map<string, Uitkomst>; vraagFouten: Map<string, string[]>; log: unknown[] };
const STAAT = new WeakMap<Lesgids, Staat>();
const st = (l: Lesgids): Staat => {
  let s = STAAT.get(l);
  if (!s) STAAT.set(l, (s = { vorige: new Map(), zinNr: 0, robotNr: -99, naamVraag: -99, naamKeer: 0, namen: 0, opRij: 0, momenten: new Set(), pijlUitgelegd: false, goed: 0, fout: 0, vraag: 0, laatste: false, eerste: new Map(), vraagFouten: new Map(), log: [] }));
  return s;
};

const zet = (l: Lesgids, p: Partial<GoudenTelProps>) => l.pasVlakAan<GoudenTelProps>(p);

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

/* ---------- denkfouten en uitkomsten bewaren (zoals de gouden klokles) ---------- */

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

/* ---------- het vaste rijtje (zelfde regels als de gouden klokles) ---------- */

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

/** Lof bij goed in 1 keer: een speciaal moment, soms de naam, anders een lofzin; daarna het aantal (draaiboek: lof met het aantal). */
function lofZinnen(l: Lesgids, v: Telvraag, eerste: boolean): string[] {
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
  const r = TELREACTIE(v.n, v.fruit);
  const zonder = r.zinnen.map((_, i) => i).filter((i) => woord(r.zinnen[i]) === woord(lof));
  return [lof, kies(l, r, zonder)];
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

/** Bliepo zegt iets en wacht op de blauwe pijl. De pijl staat er vanaf het begin; een tik breekt de zin af. */
async function zegEnPijl(l: Lesgids, zinnen: string[]) {
  const s = st(l);
  log(l, "pijl", { zin: zinnen.join(" ") });
  const p = l.verder();
  const uitleg = s.pijlUitgelegd ? [] : [ZIN.pijlUitleg];
  s.pijlUitgelegd = true;
  const z = zeg(l, ...zinnen, ...uitleg);
  z.catch(() => {});
  await Promise.race([z, p]);
  await p;
  log(l, "pijl-getikt");
}

/** De keuzeknoppen tegelijk met de zinnen (de vraag, of bij de 2e poging de hint). Een tik tijdens de zin telt. */
async function vraagMetKnoppen(l: Lesgids, opties: string[], zinnen: string[]): Promise<string> {
  const p = l.kies(opties, { direct: true, weetniet: false });
  log(l, "vraag", { zin: zinnen.join(" "), opties });
  const z = zeg(l, ...zinnen);
  z.catch(() => {});
  const eerst = await Promise.race([z.then(() => "gezegd" as const), p.then(() => "getikt" as const)]);
  const klaar = eerst === "gezegd" ? performance.now() : null;
  const x = (await p) ?? "";
  log(l, "tik", { x, naVraag: klaar ? Math.round(performance.now() - klaar) : -1 });
  return x;
}

/** Wat Bliepo zegt bij een fout, uit de fouttabel (zelfde regels als de gouden klokles). */
function foutZinnen(l: Lesgids, f: Fout, poging: 1 | 2, eerder: Fout | null, weer: { v: boolean }): string[] {
  const uit = UITLEG[f.soort];
  const eerste = f.eerste || kies(l, ONDUIDELIJK, poging === 2 ? [ONDUIDELIJK_NOG_1_KEER] : []);
  if (poging === 1 || !uit) return [eerste, f.hint];
  const zelfde = eerder !== null && eerder.soort === f.soort;
  if (zelfde && f.code !== "onduidelijk" && !weer.v) {
    weer.v = true;
    return uit.weer;
  }
  return [eerste, uit.uitleg[0]];
}

/* ---------- het beeld ---------- */

const opgaveVan = (v: Telvraag): Telopgave => ({ id: `${LES_ID}-${v.nr}`, vorm: "rijen5", n: v.n, plaatjes: [{ soort: v.fruit.soort, kleur: v.fruit.kleur }] });
const leeg = (v: Telvraag) => Array.from({ length: v.n }, () => 0);
const alle = (v: Telvraag) => Array.from({ length: v.n }, (_, i) => i + 1);

/** Draaiboek §3 A.1 (b): Bliepo telt zelf hardop, in elk stuk fruit komt om de beurt een nummer (± 1,1 s per nummer). */
async function natellen(l: Lesgids, v: Telvraag) {
  const nummers = leeg(v);
  zet(l, { nummers: [...nummers] });
  await l.wacht(300);
  for (let i = 0; i < v.n; i++) {
    nummers[i] = i + 1;
    zet(l, { nummers: [...nummers] });
    await zeg(l, `${gk(i + 1, v.fruit)}.`);
    await l.wacht(250);
  }
  log(l, "nageteld", { n: v.n });
  await zegEnPijl(l, ZIN.natellenKlaar(v.n, v.fruit));
}

/**
 * Draaiboek §3 A.3: samen tellen na de 2e fout. Het kind tikt elk stuk fruit aan (in elke volgorde); er komt een nummer
 * bij en Bliepo zegt het getal. Een stuk fruit met een nummer telt niet nog een keer. Na ± 6 s stilte komt vanzelf het
 * hulphandje (15.19): de eerste keer met een aanmoediging en 1 korte zin, daarna alleen het handje.
 */
async function samenTellen(l: Lesgids, v: Telvraag) {
  const nummers = leeg(v);
  let geteld = 0;
  let handGezegd = false;
  zet(l, { nummers: [...nummers], tikbaar: true, hand: null });
  const volgende = () => nummers.findIndex((x) => x === 0);
  zetTestAntwoord(`tel-${volgende()}`);
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
        void zeg(l, kies(l, AANMOEDIG, [AANMOEDIG_KIEST]), ZIN.samenHand(v.fruit)).catch(() => {});
      }
    }, AANWIJZING_MS);
  };
  log(l, "samen-tellen", { vraag: v.id });
  const z = zeg(l, ZIN.samenTik(v.fruit));
  z.catch(() => {});
  wachtOpHand();
  try {
    while (geteld < v.n) {
      const t = await l.wachtOpVlak<{ soort: string; index: number }>("telTik");
      if (nummers[t.index] > 0) continue;
      geteld++;
      nummers[t.index] = geteld;
      zet(l, { nummers: [...nummers], hand: null, ...(geteld === v.n ? { tikbaar: false } : {}) });
      speelLesgeluid("tik");
      log(l, "tel-tik", { i: t.index, n: geteld });
      if (geteld < v.n) {
        zetTestAntwoord(`tel-${volgende()}`);
        void zeg(l, `${gk(geteld, v.fruit)}.`).catch(() => {});
        wachtOpHand();
      }
    }
  } finally {
    clearTimeout(klok);
    zet(l, { tikbaar: false, hand: null });
  }
  await zegEnPijl(l, ZIN.samenKlaar(v.n, v.fruit));
}

/* ---------- 1 telvraag: 2 pogingen ---------- */

async function telVraag(l: Lesgids, v: Telvraag, eersteVraag: boolean): Promise<Uitkomst> {
  const s = st(l);
  s.vraag++;
  const opties = schud(v.keuzes).map(String);
  const fouten = foutenVan(v);
  const goed = String(v.n);
  zet(l, { opgave: opgaveVan(v), nummers: [], kleur: v.fruit.kleur, tikbaar: false, hand: null });
  if (!eersteVraag) speelLesgeluid("verschijn");
  await l.wacht(eersteVraag ? 200 : 700);
  let eerder: Fout | null = null;
  const weer = { v: false };
  let zinnen = eersteVraag ? [ZIN.vraag(v.fruit), ZIN.vraagEerste] : [ZIN.vraag(v.fruit)];
  for (let poging = 1 as 1 | 2; poging <= 2; poging++) {
    zetTestAntwoord(goed);
    const x = await vraagMetKnoppen(l, opties, zinnen);
    await l.wacht(DENK_MS);
    if (x === goed) {
      speelLesgeluid("goed");
      bliepoScherm("goed");
      /* Draaiboek §3 A.1 (a): alle nummers tegelijk; bij de eerste vraag in 1 keer goed (b) telt Bliepo ze samen na. */
      zet(l, { goed: ++s.goed, nummers: poging === 1 && eersteVraag ? [] : alle(v) });
      if (poging === 1) {
        const lof = lofZinnen(l, v, eersteVraag);
        log(l, "reactie", { soort: "goed", vraag: v.id, zin: lof.join(" ") });
        if (eersteVraag) {
          /* Draaiboek §3 A.1 (b): bij de eerste telvraag samen natellen in plaats van alle nummers tegelijk. */
          await zegEnPijl(l, [lof[0], ZIN.natellen]);
          await natellen(l, v);
        } else await zegEnPijl(l, lof);
        return noteer(l, v.id, "goed");
      }
      const z = bevestig(l);
      log(l, "reactie", { soort: "goed-na-fout", vraag: v.id, zin: z });
      await zegEnPijl(l, [z]);
      return noteer(l, v.id, "naFout");
    }
    /* Geen fout-geluidje en geen rood op de keuze; alleen Bliepo's scherm kleurt rood (5.3). */
    bliepoScherm("fout");
    zet(l, { fout: ++s.fout });
    s.opRij = 0;
    const f = fouten[x] ?? { code: "onduidelijk", soort: "onduidelijk", denkfout: "niet duidelijk", eerste: "", hint: "", scherm: "" };
    legDenkfoutVast(l, { vraag: v.id, antwoord: x, denkfout: f.code, poging });
    const fz = foutZinnen(l, f, poging, eerder, weer).filter(Boolean);
    log(l, "reactie", { soort: `fout${poging}`, vraag: v.id, x, denkfout: f.code, zin: fz.join(" ") });
    if (poging === 1) {
      /* 1e fout (draaiboek §3 A.2): de vraag verdwijnt; de eerste zin, dan komen de knoppen meteen terug met de hint. */
      await zeg(l, fz[0]);
      zinnen = fz.slice(1);
      eerder = f;
    } else {
      /* 2e fout (draaiboek §3 A.3, 15.11): uitleg, samen tellen, door. */
      await zeg(l, ...fz);
      await l.wacht(300);
      await zegEnPijl(l, [ZIN.samenHelp]);
      await samenTellen(l, v);
      return noteer(l, v.id, "samen");
    }
  }
  return noteer(l, v.id, "samen");
}

/* ---------- de les ---------- */

const gouden: Lesdraaiboek = {
  id: "squla-tellen-fruit-1-gouden",
  titel: "Fruit tellen",
  synthesis: "Gouden les · inhoud Squla groep 3 · Tellen · Tellen met fruit · level 1 (squla-tellen-fruit-1) · verloop draaiboek Tellen (Color Count)",
  indeling: "synthesis",
  browserstem: true,
  nacht: true,
  voorwerpen: ["appel", "peer", "pruim"],
  kaarttekening: KaartTellenGouden,
  async speel(l) {
    STAAT.delete(l);
    log(l, "start");
    /* Stap 1. Openen: de appels van vraag 1 verschijnen; Bliepo groet, zegt wat we gaan doen en wacht op de pijl. */
    const plaatjes = [...new Map(VRAGEN.map((v) => [v.fruit.soort, { soort: v.fruit.soort, kleur: v.fruit.kleur }])).values()];
    l.vlak<GoudenTelProps>(GoudenTelVlak, { opgave: opgaveVan(VRAGEN[0]), nummers: [], kleur: VRAGEN[0].fruit.kleur, voorraad: plaatjes });
    speelLesgeluid("verschijn");
    await l.wacht(600);
    await zeg(l, NAAM_GROET);
    st(l).naamKeer = 1;
    st(l).naamVraag = 0;
    await zegEnPijl(l, ZIN.begin);

    /* Stap 3 en 4. De 15 vragen van squla-tellen-fruit-1. */
    for (const [i, v] of VRAGEN.entries()) {
      st(l).laatste = i === VRAGEN.length - 1;
      /* Af en toe een overgangszin (BLIEPO-KARAKTER.md §12); meestal niet. */
      if (i === 7) await zeg(l, kies(l, OVERGANG));
      await telVraag(l, v, i === 0);
    }

    /* Stap 10. Einde: slotzin, kaart, eindzin uit het rijtje. */
    zet(l, { opgave: null, nummers: [], hand: null, tikbaar: false });
    await zeg(l, ZIN.slot);
    await l.wacht(300);
    log(l, "kaart");
    const tik = l.kaart();
    speelLesgeluid("kaart");
    await zeg(l, veelFouten(l) ? EINDE_VEEL_FOUTEN : kies(l, EINDE));
    await tik;
  },
};

export const LESSEN_SQULA_TELLEN_GOUDEN: Lesdraaiboek[] = [gouden];
