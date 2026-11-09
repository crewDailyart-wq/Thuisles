/**
 * DE GOUDEN LES SPLITSEN (9 november 2026; BOUWREGELS hoofdstuk 15, 15.22; LESRECEPT.md).
 *
 *   squla-splits-splitsen1-1-gouden — een NIEUWE versie naast squla-splits-splitsen1-1 ("Splitsen tot 10", BOUWREGELS
 *   15.8). De oude les (squla-splitsen.tsx) en het splitsvlak blijven precies zoals ze zijn; pas na akkoord van Sara
 *   vervangt deze versie de oude voor kinderen.
 *
 * Inhoud (15.22 punt 1): die van squla-splits-splitsen1-1. Dezelfde 15 vragen in dezelfde volgorde, dezelfde getallen
 * (totaal 4 t/m 10) en dezelfde voorwerpen: het huisje met pionnen (1–5), met ballen en de zak (6–9), 3 huisjes met een
 * leeg vakje (10) en de doos van 10 met een doek (11–15). Het kind sleept alles zelf (BOUWREGELS 14.26).
 *
 * Skelet (15.22 punt 3): het draaiboek Splitsen (Part Part Whole, SYNTHESIS-ANALYSE/DRAAIBOEKEN-NIEUW/splitsen.md):
 *   stap 1   openen: het huisje met 5 pionnen, de groet en de startvraag (Ja / Nee);
 *   stap 2a  Ja: een proef van 2 opgaven (vraag 1 en 2); 2 fouten in de proef = alsnog de uitleg (§3 A.4);
 *   stap 2b  Nee: "geen probleem", vanzelf door naar de uitleg;
 *   stap 7–10 de uitleg met het voorbeeld van het beginscherm (5 = 2 en 3): stap voor stap slepen, "hoeveel samen?",
 *            het totaal staat boven, en 5 zelf op een andere manier splitsen;
 *   stap 11–15 de opdrachten (de 15 vragen van Squla): na goed vanzelf door, na een fout op de pijl wachten (§0, §3 F);
 *   stap 16  einde: slotzin, kaart, eindzin uit het rijtje.
 * Wat er niet in zit (de woorden "samenstellen" en "ontleden", de piano, de tegel van 5, de somvraag, het lijstje en de
 * keuze 8 of 12) staat met de reden in KEUZES-VOOR-SARA.md, Ronde 21.
 *
 * Laag 1 (Bliepo): 2 pogingen (15.11): 1e fout = eerste zin en hint uit de fouttabel, pijl, opnieuw; 2e fout = uitleg en
 * samen voordoen (Bliepo legt het ene deel klaar, het kind sleept het andere deel: draaiboek §3 F.6), de les gaat door.
 * Het hulphandje komt vanzelf na ± 6 s stilte, met de eerste keer een aanmoediging en 1 korte zin (15.19). Rood scherm
 * 1,5 s, groen 1 s, geen fout-geluidje, geen rood op de keuze. Heel snel: Bliepo zegt niets (draaiboek §3 B.7, F.8).
 *
 * Elke fout wordt met zijn denkfout vastgelegd en elke vraag met zijn uitkomst (goed in één keer, goed na een fout,
 * samen gedaan) in de tabel les_uitkomsten (bewaarUitkomst; alleen als er een kind gekozen is); mislukt dat, dan gaat de
 * les gewoon door.
 */

import type { Lesdraaiboek, Lesgids } from "../soort";
import { GoudenSplitsVlak, KaartSplitsenGouden, type GoudenSplitsProps, type Hand, type Punt } from "../vlakken/squla-splitsen-gouden-vlak";
import { KLEUR, type Beeld, type Deel, type S1Spec, type S1Stand, type S1Zone } from "../vlakken/squla-splitsen-vlak";
import { zetTestAntwoord } from "./squla-hulp";
import { speelLesgeluid } from "@/lib/lesgeluiden";
import { bliepoScherm } from "@/lib/bliepo-scherm";
import { bewaarUitkomst } from "@/app/lesuitkomstacties";
import {
  AANMOEDIG_SLEPEN,
  BEVESTIG,
  EINDE,
  EINDE_VEEL_FOUTEN,
  KA,
  KB,
  LOF,
  LOF_KIJK_INDEX,
  MOMENT,
  NAAM_GROET,
  NAAM_LOF,
  ONDUIDELIJK,
  ONDUIDELIJK_NOG_1_KEER,
  OVERGANG,
  PARENREACTIE,
  PARENREACTIE_JA,
  SPLITSREACTIE,
  SPLITSREACTIE_JA,
  SPLITSREACTIE_ROBOT,
  TOTAAL_KEUZES,
  VRAGEN,
  ZIN,
  huisFout,
  ligtDing,
  metNaam,
  opdracht,
  opnieuw,
  parenFout,
  tienFout,
  totaalFout,
  tweedeVak,
  type Fout,
  type HuisVraag,
  type ParenVraag,
  type Rijtje,
  type Sleepvraag,
  type TienVraag,
} from "./squla-splitsen-gouden-zinnen";

const LES_ID = "squla-splits-splitsen1-1-gouden";

/* ---------- tempo (draaiboek Splitsen §5) ---------- */

/** Reactie na een tik of na het laatste ding (6.10a: 0,2 tot 0,4 s; draaiboek: 0,15–0,25 s). */
const DENK_MS = 200;
/** Na goed vanzelf door: 0,5–0,7 s na de zin (draaiboek §0, HB). */
const DOOR_MS = 600;
/** Bij een opdracht: na zoveel stilte vanzelf het hulphandje (15.19: ± 6 s; draaiboek stap 7: stilte-hint na 6,0 s). */
const AANWIJZING_MS = 6000;
/**
 * Alles ligt in een vak: zo lang rust (niets gesleept) voor het nakijken, zodat het kind nog kan schuiven. Na een fout
 * in de proef blijven de dingen liggen en schuift het kind er een paar: dan langer wachten (kind-test punt 3: elke schuif
 * werd meteen nagekeken). Elke nieuwe sleep zet de tijd weer op 0.
 */
const NAKIJK_MS = 400;
const NAKIJK_SCHUIF_MS = 1600;
/** Uitleg na Nee: als een stap zo lang niet lukt, of na zoveel keer een verkeerde stand, doet Bliepo hem voor (vangnet). */
const VANGNET_MS = 20000;
const VANGNET_KEER = 3;
/** Samen voordoen: zoveel tijd per ding dat Bliepo in een vak legt. */
const LEG_MS = 420;

/* ---------- staat per les ---------- */

type Uitkomst = "goed" | "naFout" | "samen";
type Staat = {
  vorige: Map<Rijtje, number>;
  zinNr: number;
  robotNr: number;
  namen: number;
  naamKeer: number;
  naamVraag: number;
  opRij: number;
  momenten: Set<string>;
  pijlUitgelegd: boolean;
  sleepUitgelegd: boolean;
  vinkjeUitgelegd: boolean;
  goed: number;
  fout: number;
  vraag: number;
  laatste: boolean;
  opnieuwNr: number;
  eerste: Map<string, Uitkomst>;
  vraagFouten: Map<string, string[]>;
  log: unknown[];
  robotReactie: boolean;
  huidig: string;
  /** Hoe vaak Bliepo al iets over nakijken zei (hooguit 2 keer per les; kind-test punt 19). */
  nakijk: number;
  /** Hoeveelste opdracht van elke soort (voor de kortere opdrachtzin; kind-test punt 17). */
  soortKeer: Map<string, number>;
};
const STAAT = new WeakMap<Lesgids, Staat>();
const st = (l: Lesgids): Staat => {
  let s = STAAT.get(l);
  if (!s)
    STAAT.set(
      l,
      (s = { vorige: new Map(), zinNr: 0, robotNr: -99, namen: 0, naamKeer: 0, naamVraag: -99, opRij: 0, momenten: new Set(), pijlUitgelegd: false, sleepUitgelegd: false, vinkjeUitgelegd: false, goed: 0, fout: 0, vraag: 0, laatste: false, opnieuwNr: 0, eerste: new Map(), vraagFouten: new Map(), log: [], robotReactie: false, huidig: "", nakijk: 0, soortKeer: new Map() }),
    );
  return s;
};

const zet = (l: Lesgids, p: Partial<GoudenSplitsProps>) => l.pasVlakAan<GoudenSplitsProps>(p);

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

/* ---------- denkfouten en uitkomsten bewaren (zoals de gouden lessen klok en Tellen) ---------- */

function legDenkfoutVast(l: Lesgids, d: { vraag: string; antwoord: string; denkfout: string; poging: number }) {
  const s = st(l);
  s.vraagFouten.set(d.vraag, [...(s.vraagFouten.get(d.vraag) ?? []), d.denkfout]);
  if (typeof window === "undefined") return;
  const w = window as unknown as { __denkfouten?: unknown[] };
  (w.__denkfouten ??= []).push({ les: LES_ID, tijd: new Date().toISOString(), ...d });
}

/** `telt`: alleen de 15 vragen van Squla tellen mee voor "volgende keer gaat het nog beter" (niet de uitlegvraag). */
function noteer(l: Lesgids, vraag: string, uit: Uitkomst, telt = true): Uitkomst {
  const s = st(l);
  if (telt && !s.eerste.has(vraag)) s.eerste.set(vraag, uit);
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

/* ---------- het vaste rijtje (zelfde regels als de gouden lessen klok en Tellen) ---------- */

function kies(l: Lesgids, r: Rijtje, zonder: number[] = []): string {
  const s = st(l);
  s.zinNr++;
  const vorige = s.vorige.get(r) ?? -1;
  const robotMag = s.zinNr - s.robotNr > 6;
  /* "Nakijken" hooguit 2 keer per les, in lof, momenten en reacties samen (kind-test punt 19). */
  const nakijkOp = s.nakijk >= 2;
  const mag = r.zinnen.map((_, i) => i).filter((i) => i !== vorige && !zonder.includes(i) && (robotMag || !r.robot.includes(i)) && !(nakijkOp && NAKIJK.test(r.zinnen[i])));
  const keuze = mag.length ? mag : r.zinnen.map((_, i) => i).filter((i) => i !== vorige && !zonder.includes(i));
  const i = keuze[Math.floor(Math.random() * keuze.length)] ?? 0;
  s.vorige.set(r, i);
  if (r.robot.includes(i)) s.robotNr = s.zinNr;
  if (NAKIJK.test(r.zinnen[i])) s.nakijk++;
  return r.zinnen[i];
}

const woord = (z: string) => z.split(/[\s,:!.]/)[0].toLowerCase();
const NAKIJK = /nakijk|nagekeken/i;

/** Lof bij goed in 1 keer: een speciaal moment, soms de naam, anders een lofzin; daarna wat er gesplitst is (draaiboek: lof met de 2 delen). */
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
  /* "Goed gekozen!" past niet bij slepen (14.35; keuring punt 4); "Dat heb je goed gezien" alleen bij kijkvragen. */
  lof ??= kies(l, LOF, [LOF_KIJK_INDEX, ...LOF.zinnen.map((z, i) => (/gekozen/i.test(z) ? i : -1)).filter((i) => i >= 0)]);
  /* Lof en reactie beginnen niet allebei met hetzelfde woord, nooit 2 keer "Ja" (BLIEPO-KARAKTER.md §2). */
  const zonder = reactie.zinnen.map((_, i) => i).filter((i) => woord(reactie.zinnen[i]) === woord(lof));
  /* Ook "ja" midden in de lofzin telt ("Even nakijken… ja, goed!"; kind-test punt 13). */
  if (/\bja\b/i.test(lof)) zonder.push(...jaIndex);
  /* Een robotreactie hooguit 1 keer per les (keuring Tellen, 9 nov). */
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

/**
 * Bliepo zegt iets en wacht op de blauwe pijl (draaiboek §0: na een fout wacht de les altijd op de pijl). Alles is 1
 * uiting, zodat een tik op de pijl niet een half begonnen 2e zin laat horen (LESRECEPT, geleerd bij Tellen).
 */
async function zegEnPijl(l: Lesgids, zinnen: string[], naFout = false) {
  const s = st(l);
  log(l, "pijl", { zin: zinnen.join(" ") });
  const p = l.verder();
  /* Komt de pijl voor het eerst na een hint, dan past "klaar met kijken" niet (kind-test punt 14). */
  const uitleg = s.pijlUitgelegd ? [] : [naFout ? ZIN.pijlUitlegNaFout : ZIN.pijlUitleg];
  s.pijlUitgelegd = true;
  const z = zeg(l, [...zinnen, ...uitleg].join(" "));
  z.catch(() => {});
  await Promise.race([z, p]);
  await p;
  log(l, "pijl-getikt");
}

/** Bliepo zegt iets en gaat vanzelf door (draaiboek §0: na goed 0,5–0,7 s na de zin). */
async function zegEnDoor(l: Lesgids, zinnen: string[]) {
  log(l, "door", { zin: zinnen.join(" ") });
  await zeg(l, zinnen.join(" "));
  await l.wacht(DOOR_MS);
}

/* ---------- het beeld (zelfde tekeningen en plekken als de oude les) ---------- */

type S1St = S1Stand;
let s1Nr = 0;
const nieuw = <T extends object>(x: T) => ({ ...x, nr: ++s1Nr });

/**
 * Waar het handje begint: bij een ding dat ECHT nog in het hoopje ligt (keuring punt 9). Het splitsvlak geeft die plek
 * in punten van de pagina (window.__phaser.s1Punt); die rekenen we terug naar punten van het vlak (980 × 720). Lukt dat
 * niet, dan de vaste plek `i` in het hoopje.
 */
function hoopVan(spec: S1Spec, i: number): Punt {
  if (typeof window !== "undefined") {
    try {
      const p = (window as unknown as { __phaser?: { s1Punt?: () => Punt } }).__phaser?.s1Punt?.();
      const c = [...document.querySelectorAll("canvas")].find((x) => {
        const r = x.getBoundingClientRect();
        return r.width > 300 && Math.abs(r.width / r.height - 980 / 720) < 0.05;
      });
      if (p && c) {
        const r = c.getBoundingClientRect();
        return { x: ((p.x - r.left) * 980) / r.width, y: ((p.y - r.top) * 720) / r.height };
      }
    } catch {
      /* dan de vaste plek */
    }
  }
  return hoopPlek(spec, i);
}

/** Waar ding `i` in het hoopje ligt (zelfde rekensom als het splitsvlak, squla-splitsen-s1.ts). */
function hoopPlek(spec: S1Spec, i: number): Punt {
  const t = spec.tray;
  const stap = t.stap ?? t.dia * 1.14;
  const rij = Math.floor(i / t.per);
  const inRij = Math.min(t.per, spec.n - rij * t.per);
  const col = i % t.per;
  return { x: t.x + (col - (inRij - 1) / 2) * stap, y: t.y + rij * stap * 0.96 };
}

/** Het huisje met dingen (vraag 1–9, en het voorbeeld van de uitleg). `la` / `lb` = het getal onder het vak ("?" = nog open). */
function huisOpbouw(v: HuisVraag) {
  const { tot, deel, vw, zak } = v;
  const rest = tot - deel;
  const [HX, HY, HB] = [490, 300, 640];
  const zx = [HX - 160, HX + 160];
  const kx = v.links ? zx : [zx[1], zx[0]];
  const id = `gouden-huis-${v.id}`;
  const beeld = (o: { la?: string; lb?: string; top?: string } = {}): Beeld => ({
    id,
    delen: [
      { s: "huisje", id: "huis", x: HX, y: HY, b: HB, top: o.top ?? "", links: "", rechts: "" },
      /* De getallen onder de vakken in de kleur van hun vak (2.1); als hex, want het splitsvlak zet deze kleur zo op de
         tekst (met "paars" werd het getal wit, zoals in de oude les; zie KEUZES-VOOR-SARA.md Ronde 21). */
      { s: "tekst", id: "la", t: o.la ?? String(deel), x: kx[0], y: 596, grootte: 60, kleur: KLEUR[KA] },
      { s: "tekst", id: "lb", t: o.lb ?? "?", x: kx[1], y: 596, grootte: 60, kleur: KLEUR[KB] },
      ...(zak ? ([{ s: "ding", id: "zak", vw: "zak", x: kx[1], y: 425, maat: 210 }] as Deel[]) : []),
    ],
  });
  /** Klaar: het andere deel onder het vak en het totaal in het dak (draaiboek stap 8: het totaal staat boven). */
  const klaar = () => beeld({ lb: String(rest), top: String(tot) });
  const dia = tot <= 5 ? 84 : 66;
  const zones: S1Zone[] = [
    { id: "a", x: kx[0], y: 424, b: 300, h: 226, kl: KA, per: 4, dia: 68 },
    { id: "b", x: kx[1], y: 424, b: 300, h: 226, kl: KB, per: 4, dia: 68 },
  ];
  const spec = (o: { oplossing?: number[]; fout?: number[]; route?: [number, number][] } = {}): S1Spec =>
    nieuw({
      soort: "dingen" as const,
      vw,
      n: tot,
      tray: { x: HX, y: tot <= 5 ? 248 : 192, per: 5, dia },
      zones,
      oplossing: o.oplossing ?? [deel, rest],
      fout: o.fout ?? (deel === rest ? [tot, 0] : [rest, deel]),
      route: o.route ?? Array.from({ length: tot }, (_, i) => [i, i < deel ? 0 : 1] as [number, number]),
    });
  return { beeld, klaar, spec, zones, rest };
}

/** De 3 huisjes met een leeg vakje (vraag 10). */
function parenOpbouw(v: ParenVraag) {
  const HX = [170, 490, 810];
  const [HY, HB] = [300, 260];
  const rests = v.paren.map(([t, d]) => t - d);
  const n = rests.reduce((x, y) => x + y, 0);
  const beeld: Beeld = { id: `gouden-${v.id}`, delen: v.paren.map(([t, d], i) => ({ s: "huisje", id: `h${i}`, x: HX[i], y: HY, b: HB, top: String(t), links: String(d), rechts: "", kleuren: { links: KA, rechts: KB } }) as Deel) };
  const zones: S1Zone[] = v.paren.map((_, i) => ({ id: `z${i}`, x: HX[i] + 65, y: HY + 50, b: 118, h: 96, kl: KB, per: 2, dia: 46, leeg: "?" }));
  const spec = (): S1Spec =>
    nieuw({
      soort: "dingen" as const,
      vw: "tennisbal",
      kleur: KB,
      n,
      tray: { x: 490, y: 560, per: Math.min(n, 10), dia: 62 },
      zones,
      oplossing: rests,
      fout: [rests[1], rests[0], rests[2]],
      route: rests.flatMap((r, h) => Array.from({ length: r }, (_, k) => [rests.slice(0, h).reduce((x, y) => x + y, 0) + k, h] as [number, number])),
    });
  return { beeld, spec, zones, rests, n };
}

/** De doos van 10 met een doek (vraag 11–15). */
function tienOpbouw(v: TienVraag) {
  const rest = 10 - v.zicht;
  const beeld = (klaar: boolean): Beeld => ({
    id: `gouden-${v.id}`,
    delen: [
      { s: "tienvak", id: "doos", x: 490, y: 205, vw: "pingpongbal", n: v.zicht, doek: rest, kl: KA, kl2: KB },
      { s: "tekst", id: "lv", t: klaar ? String(rest) : "?", x: 490, y: 520, grootte: 48, kleur: KLEUR[KB] },
    ],
  });
  const zones: S1Zone[] = [{ id: "onder", x: 490, y: 412, b: 470, h: 164, kl: KB, per: 5, dia: 70 }];
  const spec = (): S1Spec =>
    nieuw({
      soort: "dingen" as const,
      vw: "pingpongbal",
      kleur: KB,
      n: 10,
      tray: { x: 490, y: 594, per: 5, dia: 70, stap: 80 },
      zones,
      oplossing: [rest],
      fout: [rest + 1],
      route: Array.from({ length: rest }, (_, i) => [i, 0] as [number, number]),
    });
  const onder = Array.from({ length: rest }, (_, i) => `doos.${v.zicht + i}`);
  return { beeld, spec, zones, rest, onder };
}

/** Een nieuw beeld: de zin van de vorige vraag weg (LESRECEPT, geleerd bij Tellen), alles schoon, het geluidje. */
function toonBeeld(l: Lesgids, beeld: Beeld, spec: S1Spec, geluid = true) {
  const s = st(l);
  const zelfde = s.huidig === beeld.id;
  s.huidig = beeld.id;
  zet(l, { beeld, s1: spec, actief: false, licht: [], goedIds: [], uit: [], toon: [], hand: null });
  if (geluid && !zelfde) speelLesgeluid("verschijn");
}

/* ---------- slepen: wachten tot het klaar is, met het hulphandje ---------- */

type Wacht = {
  spec: S1Spec;
  /** Wanneer nakijken: vanzelf (alles ligt) of met het vinkje (`vinkje`). */
  klaar: (s: S1St) => boolean;
  vinkje?: boolean;
  /** Waar het handje heen wijst (alleen een LEEG vak; nooit een antwoord, 15.17). */
  hand: (s: S1St | null) => Hand | null;
  /** De korte zin bij het handje (de eerste keer, met een aanmoediging ervoor); een functie als hij van de stand afhangt. */
  handZin: string | (() => string);
  /** De zin van Bliepo die nu loopt: het handje komt pas ± 6 s nadat die klaar is. */
  zin: Promise<void>;
  /** Iets zeggen bij een tussenstand (alleen in de uitleg). */
  bijStand?: (s: S1St) => void;
  /** Hoe lang rust voor het vanzelf nakijken (standaard NAKIJK_MS). */
  rust?: number;
  /** Vangnet: als deze belofte klaar is, stopt het wachten (de uitleg doet het dan voor). */
  stop?: Promise<unknown>;
  /**
   * De stand bij het begin, als er al iets in de vakken ligt (proef na een fout, samen voordoen). Alleen voor het handje:
   * het moet de echte stand lezen (keuring punt 1). Nakijken gebeurt pas na een sleep van het kind.
   */
  begin?: S1St;
  /** Geen aanmoediging bij het handje (als er iets verkeerd ligt; keuring punt 5). */
  zonderAanmoediging?: () => boolean;
};

/** Van het hoopje naar het eerste lege vak, of alleen "pak er een" als er geen leeg vak meer is. */
/** Een stand die het vlak nog niet gemeld heeft (na een `auto` van Bliepo, of de stand van de vorige poging). */
const stand = (tel: number[], los: number): S1St => ({ soort: "s1stand", tel, waarden: [], los });

function handNaarLeeg(spec: S1Spec, s: S1St | null, sleutel: string): Hand | null {
  const tel = s?.tel ?? spec.zones.map(() => 0);
  const los = s ? s.los : spec.n;
  if (los <= 0) return null;
  const van = hoopVan(spec, 0);
  const leeg = spec.zones.findIndex((_, j) => (tel[j] ?? 0) === 0);
  return { van, naar: leeg >= 0 ? { x: spec.zones[leeg].x, y: spec.zones[leeg].y } : null, sleutel: `${sleutel}-${leeg}-${los}` };
}

async function wachtSleep(l: Lesgids, o: Wacht): Promise<S1St> {
  const STOP = { soort: "stop" } as const;
  const gestopt = o.stop ? o.stop.then(() => STOP) : new Promise<typeof STOP>(() => {});
  const s = st(l);
  let laatste: S1St | null = null;
  let klok: ReturnType<typeof setTimeout> | undefined;
  let handGezegd = false;
  let klaarMetZin = false;
  let weg = false;
  /* Alleen het vlak aanpassen als het handje er echt staat: elke aanpassing tekent het lesscherm opnieuw, en dat mag
     niet bij elke sleepbeweging gebeuren (HARDE REGEL 7). */
  let handAan = false;
  const armeer = () => {
    clearTimeout(klok);
    if (!klaarMetZin || weg) return;
    klok = setTimeout(() => {
      if (weg) return;
      const h = o.hand(laatste ?? o.begin ?? null);
      if (h) {
        log(l, "aanwijzing", { hand: h.naar ? "sleep" : "pak" });
        handAan = true;
        zet(l, { hand: h });
        if (!handGezegd) {
          handGezegd = true;
          /* Ronde 15: bij een opdracht komt de aanmoediging samen met het hulphandje; het kind moet slepen, niet nadenken (14.35). */
          const hz = typeof o.handZin === "function" ? o.handZin() : o.handZin;
          const aan = o.zonderAanmoediging?.() ? "" : `${AANMOEDIG_SLEPEN[Math.floor(Math.random() * AANMOEDIG_SLEPEN.length)]} `;
          void zeg(l, `${aan}${hz}`).catch(() => {});
        }
      }
      /* Ligt er bij de doos al iets in het vak, dan komt er niets: het vinkje oplichten lokte een tik uit terwijl het kind
         nog bezig was (kind-test punt 8). */
    }, AANWIJZING_MS);
  };
  void o.zin.then(
    () => {
      klaarMetZin = true;
      armeer();
    },
    () => {},
  );
  zet(l, { actief: true, hand: null });
  zetTestAntwoord(null);
  const handWeg = () => {
    if (!handAan) return;
    handAan = false;
    zet(l, { hand: null });
  };
  let p = l.wachtOpVlak<S1St>("s1stand");
  try {
    for (;;) {
      if (laatste && o.klaar(laatste)) {
        const wacht = o.vinkje ? l.knoppen(["controleer"]).then(() => null) : l.wacht(o.rust ?? NAKIJK_MS).then(() => null);
        /* Het vinkje legt het lesscherm zelf 1 keer uit ("Klaar? Tik dan op het vinkje."; 3.15). Geen 2e uitleg van de les
           (keuring punt 2). */
        if (o.vinkje) s.vinkjeUitgelegd = true;
        const r = await Promise.race([wacht, p, gestopt]);
        if (r === null || r.soort === "stop") break;
        laatste = r;
      } else {
        const r = await Promise.race([p, gestopt]);
        if (r.soort === "stop") break;
        laatste = r;
      }
      p = l.wachtOpVlak<S1St>("s1stand");
      klaarMetZin = true;
      handWeg();
      if (laatste) o.bijStand?.(laatste);
      armeer();
    }
  } finally {
    weg = true;
    clearTimeout(klok);
    zet(l, { actief: false, hand: null });
  }
  const uit = laatste ?? { soort: "s1stand" as const, tel: o.spec.zones.map(() => 0), waarden: [], los: o.spec.n };
  log(l, "gesleept", { tel: uit.tel, los: uit.los });
  return uit;
}

/** Bliepo legt de eerste `t` stappen van de route zelf (samen voordoen, uitleg). */
async function legZelf(l: Lesgids, spec: S1Spec, van: number, tot: number) {
  for (let t = van; t <= tot; t++) {
    zet(l, { s1: { ...spec, auto: t } });
    await l.wacht(LEG_MS);
  }
}

/* ---------- de fout: wat Bliepo zegt (uit de fouttabel) ---------- */

function foutZinnen(l: Lesgids, f: Fout, poging: 1 | 2, eerder: Fout | null): string[] {
  const eerste = f.eerste || kies(l, ONDUIDELIJK, poging === 2 ? [ONDUIDELIJK_NOG_1_KEER] : []);
  if (poging === 1) return [eerste, f.hint];
  /* "Weer" alleen als Bliepo de 1e keer al zei wat er mis was (niet bij een noot; geleerd bij Tellen). */
  const zelfde = eerder !== null && (eerder.soort ?? eerder.code) === (f.soort ?? f.code) && !eerder.noot && f.weer.length > 0;
  return zelfde ? f.weer : [eerste, f.uitleg];
}

function foutMoment(l: Lesgids, vraag: string, antwoord: string, f: Fout, poging: number) {
  const s = st(l);
  /* Geen fout-geluidje en geen rood op de keuze; alleen Bliepo's scherm kleurt rood (5.3). De dingen schudden even. */
  bliepoScherm("fout");
  zet(l, { fout: ++s.fout, hand: null });
  s.opRij = 0;
  legDenkfoutVast(l, { vraag, antwoord, denkfout: f.code, poging });
}

function goedMoment(l: Lesgids, extra: Partial<GoudenSplitsProps> = {}) {
  const s = st(l);
  speelLesgeluid("goed");
  bliepoScherm("goed");
  zet(l, { goed: ++s.goed, licht: [], hand: null, ...extra });
}

/** De opdracht: 1 uiting, de eerste keer met hoe je sleept (knop-uitleg 1 keer per les, 3.15). */
function opdrachtZin(l: Lesgids, zinnen: string[]): Promise<void> {
  const s = st(l);
  const uitleg = s.sleepUitgelegd ? [] : [ZIN.sleepUitleg];
  s.sleepUitgelegd = true;
  log(l, "opdracht", { zin: [...zinnen, ...uitleg].join(" ") });
  const z = zeg(l, [...zinnen, ...uitleg].join(" "));
  z.catch(() => {});
  return z;
}

/** Hoeveelste opdracht van deze soort (huisje, huisje met zak, doos): de opdrachtzin wordt daarna korter (kind-test punt 17). */
function keerVan(l: Lesgids, v: Sleepvraag): number {
  const s = st(l);
  const sleutel = v.soort === "huis" ? (v.zak ? "zak" : "huis") : v.soort;
  const k = s.soortKeer.get(sleutel) ?? 0;
  s.soortKeer.set(sleutel, k + 1);
  return k;
}

/* ---------- vraag 1–9: het huisje ---------- */

type Proef = { fouten: number };

/** Een huisje. `proef`: de proef na Ja (draaiboek §3 A: de dingen blijven liggen na een fout; 2 fouten = de uitleg). */
async function huisVraag(l: Lesgids, v: HuisVraag, eersteVraag: boolean, proef: Proef | null): Promise<Uitkomst | "gestopt"> {
  const s = st(l);
  s.vraag++;
  const b = huisOpbouw(v);
  let spec = b.spec();
  toonBeeld(l, b.beeld(), spec);
  await l.wacht(eersteVraag ? 200 : 700);
  let eerder: Fout | null = null;
  let eersteP = -1;
  let zinnen = opdracht(v, keerVan(l, v));
  let vorige: S1St | undefined;
  for (let poging = 1 as 1 | 2; poging <= 2; poging++) {
    const z = opdrachtZin(l, zinnen);
    /* In de proef blijven de dingen na een fout liggen: dan langer rust voor het nakijken, zodat het kind er een paar kan
       schuiven (kind-test punt 3). */
    const schuif = !!proef && poging === 2;
    const rust = schuif ? NAKIJK_SCHUIF_MS : NAKIJK_MS;
    /* Het handje leest de echte stand (keuring punt 1): ligt alles al in de vakken (proef na een fout), dan wijst het van
       het vak met te veel naar het andere vak, met een zin die daarbij past. Anders van het hoopje naar een leeg vak. */
    const schuifHand = (q: S1St | null): { hand: Hand; zin: string } | null => {
      if (!q || q.los > 0 || q.tel[0] === v.deel) return null;
      const meer = q.tel[0] > v.deel;
      return {
        hand: { van: { x: b.zones[meer ? 0 : 1].x, y: b.zones[meer ? 0 : 1].y }, naar: { x: b.zones[meer ? 1 : 0].x, y: b.zones[meer ? 1 : 0].y }, sleutel: `schuif-${v.id}-${q.tel.join("")}` },
        zin: meer ? ZIN.schuifNaarAnder(v) : ZIN.schuifNaarPaars(v),
      };
    };
    let huidig: S1St | null = vorige ?? null;
    const x = await wachtSleep(l, {
      spec,
      begin: schuif ? vorige : undefined,
      klaar: (q) => q.los === 0,
      rust,
      hand: (q) => {
        huidig = q;
        return schuifHand(q)?.hand ?? handNaarLeeg(spec, q, v.id);
      },
      handZin: () => schuifHand(huidig)?.zin ?? ZIN.hand(v.vw),
      zonderAanmoediging: () => !!schuifHand(huidig),
      zin: z,
    });
    vorige = x;
    void l.zeg().catch(() => {});
    const p = x.tel[0];
    if (p === v.deel) {
      goedMoment(l, { beeld: b.klaar() });
      if (poging === 1) {
        const lof = lofZinnen(l, SPLITSREACTIE(v.tot, v.deel, b.rest), SPLITSREACTIE_JA, SPLITSREACTIE_ROBOT, eersteVraag);
        log(l, "reactie", { soort: "goed", vraag: v.id, zin: lof.join(" ") });
        await zegEnDoor(l, lof);
        return noteer(l, v.id, "goed");
      }
      const zb = bevestig(l);
      log(l, "reactie", { soort: "goed-na-fout", vraag: v.id, zin: zb });
      await zegEnDoor(l, [zb]);
      return noteer(l, v.id, "naFout");
    }
    const f = huisFout(v, p);
    foutMoment(l, v.id, `${p}+${v.tot - p}`, f, poging);
    if (proef && ++proef.fouten >= 2) {
      /* Draaiboek §3 A.4: de 2e fout in de proef gaat vanzelf door naar de hele les; het antwoord wordt niet gezegd. */
      log(l, "reactie", { soort: "proef-stop", vraag: v.id, denkfout: f.code, zin: `${f.eerste} ${ZIN.proefLastig}` });
      s.vraagFouten.delete(v.id);
      await zegEnDoor(l, [f.eerste, ZIN.proefLastig]);
      return "gestopt";
    }
    const fz = foutZinnen(l, f, poging, eerder).filter(Boolean);
    /* Hetzelfde foute antwoord 2 keer: niet 2 keer dezelfde eerste zin (BLIEPO-KARAKTER.md §2). */
    if (poging === 2 && p === eersteP && fz[0] === f.eerste) fz[0] = `Weer ${ligtDing(p, v.vw, KA)} in het paarse vak.`;
    log(l, "reactie", { soort: `fout${poging}`, vraag: v.id, x: x.tel, denkfout: f.code, zin: fz.join(" ") });
    if (poging === 1) {
      /* Het getal onder het paarse vak krijgt een rondje zolang Bliepo erover praat (7.8): het is de opdracht, niet het antwoord. */
      if (/onder het paarse vak|getal eronder/.test(fz.join(" "))) zet(l, { licht: ["la"] });
      await zegEnPijl(l, fz, true);
      zet(l, { licht: [] });
      eerder = f;
      eersteP = p;
      if (proef) zinnen = [ZIN.proefOpnieuw(v)];
      else {
        /* Draaiboek §3 F.2: na de pijl gaan de vakken leeg en zegt de tutor de opdracht kort opnieuw. */
        spec = b.spec();
        zet(l, { s1: spec });
        zinnen = [opnieuw(v, s.opnieuwNr++)];
      }
      continue;
    }
    /* 2e fout (15.11): uitleg bij de denkfout, dan samen voordoen; de les gaat door. */
    await zeg(l, ...fz);
    await l.wacht(300);
    await samenHuis(l, v, b);
    return noteer(l, v.id, "samen");
  }
  return noteer(l, v.id, "samen");
}

/** Samen voordoen (draaiboek §3 F.6, het handje van Synthesis): Bliepo legt het ene deel klaar, het kind sleept de rest. */
async function samenHuis(l: Lesgids, v: HuisVraag, b: ReturnType<typeof huisOpbouw>) {
  const spec = b.spec();
  zet(l, { s1: { ...spec, auto: 0 }, actief: false, licht: [] });
  await zeg(l, ZIN.samenHelp);
  await legZelf(l, spec, 1, v.deel);
  log(l, "samen", { vraag: v.id });
  await zeg(l, ZIN.samenHuisDeel(v));
  const z = zeg(l, ZIN.samenHuisRest(v));
  z.catch(() => {});
  const x = await wachtSleep(l, {
    spec: { ...spec, auto: v.deel },
    klaar: (q) => q.los === 0,
    hand: (q) => (q && q.los === 0 ? null : { van: hoopVan(spec, v.tot - 1), naar: { x: b.zones[1].x, y: b.zones[1].y }, sleutel: `samen-${v.id}-${q?.los ?? ""}` }),
    handZin: ZIN.handRest(v),
    zin: z,
  });
  /* Ging er toch iets in het paarse vak: Bliepo legt het goed (de les gaat altijd door, 15.18). */
  if (x.tel[0] !== v.deel) zet(l, { s1: { ...spec, auto: v.tot } });
  goedMoment(l, { beeld: b.klaar() });
  await zegEnPijl(l, [ZIN.samenHuisKlaar(v)]);
}

/* ---------- vraag 10: de 3 huisjes ---------- */

async function parenVraag(l: Lesgids, v: ParenVraag): Promise<Uitkomst> {
  const s = st(l);
  s.vraag++;
  const b = parenOpbouw(v);
  let spec = b.spec();
  toonBeeld(l, b.beeld, spec);
  await l.wacht(700);
  let eerder: Fout | null = null;
  let zinnen = opdracht(v, keerVan(l, v));
  for (let poging = 1 as 1 | 2; poging <= 2; poging++) {
    const z = opdrachtZin(l, zinnen);
    const x = await wachtSleep(l, { spec, klaar: (q) => q.los === 0, hand: (q) => handNaarLeeg(spec, q, v.id), handZin: ZIN.hand("tennisbal"), zin: z });
    void l.zeg().catch(() => {});
    if (x.tel.every((c, i) => c === b.rests[i])) {
      goedMoment(l);
      if (poging === 1) {
        const lof = lofZinnen(l, PARENREACTIE, PARENREACTIE_JA, 2, false);
        log(l, "reactie", { soort: "goed", vraag: v.id, zin: lof.join(" ") });
        await zegEnDoor(l, lof);
        return noteer(l, v.id, "goed");
      }
      const zb = bevestig(l);
      log(l, "reactie", { soort: "goed-na-fout", vraag: v.id, zin: zb });
      await zegEnDoor(l, [zb]);
      return noteer(l, v.id, "naFout");
    }
    const f = parenFout(v, x.tel);
    foutMoment(l, v.id, x.tel.join("-"), f, poging);
    const fz = foutZinnen(l, f, poging, eerder).filter(Boolean);
    log(l, "reactie", { soort: `fout${poging}`, vraag: v.id, x: x.tel, denkfout: f.code, zin: fz.join(" ") });
    const mis = Math.max(0, x.tel.findIndex((c, j) => c !== b.rests[j]));
    if (poging === 1) {
      /* Het huisje waar Bliepo over praat krijgt een rondje (7.8). */
      zet(l, { licht: [`h${mis}`] });
      await zegEnPijl(l, fz, true);
      zet(l, { licht: [] });
      eerder = f;
      spec = b.spec();
      zet(l, { s1: spec });
      zinnen = [opnieuw(v, s.opnieuwNr++)];
      continue;
    }
    await zeg(l, ...fz);
    await l.wacht(300);
    await samenParen(l, v, b);
    return noteer(l, v.id, "samen");
  }
  return noteer(l, v.id, "samen");
}

async function samenParen(l: Lesgids, v: ParenVraag, b: ReturnType<typeof parenOpbouw>) {
  const spec = b.spec();
  zet(l, { s1: { ...spec, auto: 0 }, actief: false, licht: [] });
  await zeg(l, ZIN.samenHelp);
  log(l, "samen", { vraag: v.id });
  let t = 0;
  for (let h = 0; h < v.paren.length; h++) {
    zet(l, { licht: [`h${h}`] });
    await zeg(l, ZIN.samenParenHuis(v.paren[h][0], v.paren[h][1]));
    /* Het allerlaatste balletje laat Bliepo liggen: dat sleept het kind (1 kleine stap, 15.11). */
    const tot = h === v.paren.length - 1 ? b.n - 1 : t + b.rests[h];
    await legZelf(l, spec, t + 1, tot);
    t = tot;
  }
  zet(l, { licht: [] });
  const z = zeg(l, ZIN.samenParenRest);
  z.catch(() => {});
  const laatste = b.zones[b.zones.length - 1];
  const x = await wachtSleep(l, {
    spec: { ...spec, auto: b.n - 1 },
    klaar: (q) => q.los === 0,
    hand: (q) => (q && q.los === 0 ? null : { van: hoopVan(spec, b.n - 1), naar: { x: laatste.x, y: laatste.y }, sleutel: `samen-${v.id}` }),
    handZin: ZIN.samenParenRest,
    zin: z,
  });
  if (!x.tel.every((c, i) => c === b.rests[i])) zet(l, { s1: { ...spec, auto: b.n } });
  goedMoment(l);
  await zegEnPijl(l, [ZIN.samenParenKlaar]);
}

/* ---------- vraag 11–15: de doos van 10 met een doek ---------- */

async function tienVraag(l: Lesgids, v: TienVraag): Promise<Uitkomst> {
  const s = st(l);
  s.vraag++;
  const b = tienOpbouw(v);
  let spec = b.spec();
  toonBeeld(l, b.beeld(false), spec);
  await l.wacht(700);
  let eerder: Fout | null = null;
  let eersteN = -1;
  let zinnen = opdracht(v, keerVan(l, v));
  for (let poging = 1 as 1 | 2; poging <= 2; poging++) {
    const z = opdrachtZin(l, zinnen);
    /* Nakijken met het vinkje (zoals de oude les en de vrije opdrachten van het draaiboek, §3 F): vanzelf nakijken zodra
       het aantal klopt zou de opdracht "sleep tot het stopt" maken (KEUZES-VOOR-SARA.md, Ronde 21). */
    const x = await wachtSleep(l, {
      spec,
      klaar: (q) => q.tel[0] >= 1,
      vinkje: true,
      hand: (q) => ((q?.tel[0] ?? 0) === 0 ? { van: hoopVan(spec, 0), naar: { x: b.zones[0].x, y: b.zones[0].y }, sleutel: `${v.id}-leeg` } : null),
      handZin: ZIN.handTien,
      zin: z,
    });
    void l.zeg().catch(() => {});
    const n = x.tel[0];
    if (n === b.rest) {
      goedMoment(l, { beeld: b.beeld(true), uit: ["doos-doek"], goedIds: b.onder });
      if (poging === 1) {
        const lof = lofZinnen(l, SPLITSREACTIE(10, v.zicht, b.rest), SPLITSREACTIE_JA, SPLITSREACTIE_ROBOT, false);
        log(l, "reactie", { soort: "goed", vraag: v.id, zin: lof.join(" ") });
        await zegEnDoor(l, lof);
        return noteer(l, v.id, "goed");
      }
      const zb = bevestig(l);
      log(l, "reactie", { soort: "goed-na-fout", vraag: v.id, zin: zb });
      await zegEnDoor(l, [zb]);
      return noteer(l, v.id, "naFout");
    }
    const f = tienFout(v, n);
    foutMoment(l, v.id, String(n), f, poging);
    const fz = foutZinnen(l, f, poging, eerder).filter(Boolean);
    if (poging === 2 && n === eersteN && fz[0] === f.eerste) fz[0] = `Je legde er weer {${n}:${KB}}.`; /* slepen, niet kiezen (14.35) */
    log(l, "reactie", { soort: `fout${poging}`, vraag: v.id, x: n, denkfout: f.code, zin: fz.join(" ") });
    if (poging === 1) {
      /* De doos krijgt een rondje als Bliepo over de doek of de doos praat (7.8). */
      if (/doek|doos/.test(f.hint)) zet(l, { licht: ["doos"] });
      await zegEnPijl(l, fz, true);
      zet(l, { licht: [] });
      eerder = f;
      eersteN = n;
      spec = b.spec();
      zet(l, { s1: spec });
      zinnen = [opnieuw(v, s.opnieuwNr++)];
      continue;
    }
    await zeg(l, ...fz);
    await l.wacht(300);
    await samenTien(l, v, b);
    return noteer(l, v.id, "samen");
  }
  return noteer(l, v.id, "samen");
}

async function samenTien(l: Lesgids, v: TienVraag, b: ReturnType<typeof tienOpbouw>) {
  const spec = b.spec();
  zet(l, { s1: { ...spec, auto: 0 }, actief: false, licht: [] });
  await zeg(l, ZIN.samenHelp);
  log(l, "samen", { vraag: v.id });
  /* De doek gaat open: nu pas het antwoord in beeld (15.11). */
  zet(l, { uit: ["doos-doek"], goedIds: b.onder });
  await zeg(l, ZIN.samenTienDoek(v));
  await legZelf(l, spec, 1, b.rest - 1);
  const z = zeg(l, b.rest === 1 ? "Sleep jij de bal naar het vak." : ZIN.samenTienRest);
  z.catch(() => {});
  const x = await wachtSleep(l, {
    spec: { ...spec, auto: b.rest - 1 },
    klaar: (q) => q.tel[0] >= b.rest,
    hand: (q) => ((q?.tel[0] ?? b.rest - 1) >= b.rest ? null : { van: hoopVan(spec, b.rest - 1), naar: { x: b.zones[0].x, y: b.zones[0].y }, sleutel: `samen-${v.id}` }),
    handZin: b.rest === 1 ? "Sleep de bal naar het vak." : ZIN.samenTienRest,
    zin: z,
  });
  if (x.tel[0] !== b.rest) zet(l, { s1: { ...spec, auto: b.rest } });
  goedMoment(l, { beeld: b.beeld(true), uit: ["doos-doek"], goedIds: b.onder });
  await zegEnPijl(l, [ZIN.samenTienKlaar(v)]);
}

/* ---------- de uitleg na Nee (draaiboek stap 7 t/m 10) met het voorbeeld van het beginscherm: 5 = 2 en 3 ---------- */

async function uitlegRoute(l: Lesgids) {
  const s = st(l);
  const v = VRAGEN[0] as HuisVraag;
  const b = huisOpbouw(v);
  /* Stap 7: het lege huisje met de 5 pionnen van het beginscherm. Het voorbeeld is 5 = 1 en 4 (niet 2 en 3: dat is
     vraag 1, en een afgerond uitlegvoorbeeld komt niet meteen terug als eerste opgave; 3.23, kind-test punt 6). */
  const route: [number, number][] = [[0, 0], [1, 1], [2, 1], [3, 1], [4, 1]];
  /* fout = oplossing: de automatische speelcontrole doet de uitlegstappen altijd goed (de verkeerde standen test
     scripts/test-splitsen-gouden.mjs apart; daar vangt het vangnet ze op). */
  const spec = b.spec({ oplossing: [1, 4], fout: [1, 4], route });
  const uitlegBeeld = (o: { la?: string; lb?: string; top?: string }) => ({ ...b.beeld({ la: "?", lb: "?", ...o }), id: "gouden-uitleg" });
  toonBeeld(l, uitlegBeeld({}), spec);
  await l.wacht(500);
  await zeg(l, ZIN.uitlegHuis);
  await l.wacht(DOOR_MS);

  /*
   * Stap voor stap (draaiboek stap 7: de tutor wijst steeds 1 handeling aan). Slepen kan niet "stoppen bij het doel" zoals
   * de + van Synthesis. Daarom (kind-test punt 2):
   *   - ligt er iets op een verkeerde plek, dan zegt Bliepo wat er mis ligt en wijst het handje van die plek weg;
   *   - VANGNET: lukt de stap na 3 verkeerde standen of na 20 s zonder goede beweging nog niet, dan doet Bliepo hem voor en gaat de uitleg
   *     door. Het kind kan zo nooit vastlopen (15.18).
   */
  const midden = (j: number): Punt => ({ x: b.zones[j].x, y: b.zones[j].y });
  const stap = async (zin: string, doel: [number, number], handZin: string, mis: (q: S1St) => { zin: string; kort: string; hand: Hand } | null) => {
    const z = opdrachtZin(l, [zin]);
    let verkeerd = 0;
    let gezegd = "";
    let vangnet = () => {};
    const stop = new Promise<void>((r) => (vangnet = r));
    /* De tijd loopt opnieuw bij elke goede beweging: een langzaam kind dat goed bezig is, krijgt geen vangnet. */
    let klok = setTimeout(() => vangnet(), VANGNET_MS);
    let wasMis = false;
    let foutHand: Hand | null = null;
    let foutKort: string | null = null;
    const x = await wachtSleep(l, {
      spec,
      klaar: (q) => q.tel[0] === doel[0] && q.tel[1] === doel[1],
      rust: NAKIJK_MS,
      hand: (q) => foutHand ?? ((q?.los ?? spec.n) > 0 ? { van: hoopVan(spec, spec.n - 1), naar: midden(doel[0] > (q?.tel[0] ?? 0) ? 0 : 1), sleutel: `uitleg-${zin}-${q?.los}` } : null),
      /* Ligt er iets verkeerd, dan hoort bij het handje de zin over wat er mis ligt (kind-test punt 2). */
      handZin: () => foutKort ?? handZin,
      zonderAanmoediging: () => !!foutKort,
      zin: z,
      stop,
      bijStand: (q) => {
        const m = mis(q);
        foutHand = m?.hand ?? null;
        foutKort = m?.kort ?? null;
        if (!m) {
          wasMis = false;
          clearTimeout(klok);
          klok = setTimeout(() => vangnet(), VANGNET_MS);
          return;
        }
        /* Elke keer dat het kind in een verkeerde stand KOMT telt 1 keer (niet elke sleep in die stand). */
        if (!wasMis) verkeerd++;
        wasMis = true;
        log(l, "uitleg-mis", { tel: q.tel, zin: m.zin, keer: verkeerd });
        if (verkeerd >= VANGNET_KEER) vangnet();
        else if (m.zin !== gezegd) {
          gezegd = m.zin;
          void zeg(l, m.zin).catch(() => {});
        }
      },
    });
    clearTimeout(klok);
    if (x.tel[0] !== doel[0] || x.tel[1] !== doel[1]) {
      /* Vangnet: Bliepo legt het zelf goed (de pionnen gaan terug en dan naar hun plek). */
      log(l, "uitleg-voordoen", { tel: x.tel, doel });
      await zeg(l, ZIN.uitlegVoordoen);
      await legZelf(l, spec, 0, doel[0] + doel[1]);
    }
  };
  const oranjeTerug = (q: S1St) => ({ zin: ZIN.uitlegAlInOranje(q.tel[1]), kort: ZIN.handTerugOranje, hand: { van: midden(1), naar: null, sleutel: `terug-oranje-${q.tel.join("")}` } });
  const paarsTerug = (q: S1St) => ({ zin: ZIN.uitlegTeVeelPaars, kort: ZIN.handTerugPaars, hand: { van: midden(0), naar: null, sleutel: `terug-paars-${q.tel.join("")}` } });
  /* Stap a: 1 pion naar het paarse vak. */
  await stap(ZIN.uitlegEen, [1, 0], ZIN.uitlegEen, (q) => (q.tel[1] > 0 ? oranjeTerug(q) : q.tel[0] > 1 ? paarsTerug(q) : null));
  zet(l, { beeld: uitlegBeeld({ la: "1" }) });
  await zeg(l, ZIN.uitlegEenKlaar);
  /* Stap b: de andere pionnen naar het oranje vak. Het paarse vak blijft 1 (ook 2 en 3, of 0 en 5, worden opgevangen). */
  await stap(ZIN.uitlegRest, [1, 4], ZIN.uitlegRest, (q) =>
    q.tel[0] > 1 ? paarsTerug(q) : q.tel[0] === 0 ? { zin: ZIN.uitlegPaarsLeeg, kort: ZIN.handNaarPaars, hand: { van: q.los > 0 ? hoopVan(spec, 0) : midden(1), naar: midden(0), sleutel: `paars-leeg-${q.tel.join("")}` } } : null,
  );
  goedMoment(l, { beeld: uitlegBeeld({ la: "1", lb: "4" }) });
  await zegEnDoor(l, [ZIN.uitlegRestKlaar]);

  /* Stap 7 (slot) en 8: "Hoeveel pionnen zijn er samen?" (keuzevraag, 2 pogingen), dan: het totaal staat boven. */
  await totaalVraag(l);
  zet(l, { beeld: uitlegBeeld({ la: "1", lb: "4", top: "5" }) });
  await zegEnDoor(l, [ZIN.totaalUitleg]);

  /* Stap 10: kun je 5 ook anders splitsen? Het kind zoekt zelf 2 delen (elk juist antwoord is goed, 14.30). */
  await andersSplitsen(l);
  s.huidig = "";
}

async function totaalVraag(l: Lesgids) {
  const vraag = "uitleg-totaal-5";
  let opties = schud(TOTAAL_KEUZES).map(String);
  let eerder: Fout | null = null;
  let eersteX = "";
  let zinnen = [ZIN.totaalVraag];
  for (let poging = 1 as 1 | 2; poging <= 2; poging++) {
    zetTestAntwoord("5");
    const p = l.kies(opties, { direct: true, weetniet: false });
    log(l, "vraag", { zin: zinnen.join(" "), opties });
    void zeg(l, ...zinnen).catch(() => {});
    const x = (await p) ?? "";
    await l.wacht(DENK_MS);
    if (x === "5") {
      goedMoment(l);
      const z = poging === 1 ? ZIN.totaalGoed : bevestig(l);
      log(l, "reactie", { soort: poging === 1 ? "goed" : "goed-na-fout", vraag, zin: z });
      await zeg(l, z);
      noteer(l, vraag, poging === 1 ? "goed" : "naFout", false);
      return;
    }
    const f = totaalFout(Number(x));
    foutMoment(l, vraag, x, f, poging);
    const fz = foutZinnen(l, f, poging, eerder).filter(Boolean);
    if (poging === 2 && x === eersteX && fz[0] === f.eerste) fz[0] = `Je koos weer {${x}:${x === "1" ? KA : KB}}.`;
    log(l, "reactie", { soort: `fout${poging}`, vraag, x, denkfout: f.code, zin: fz.join(" ") });
    if (poging === 1) {
      /* Draaiboek §3 B.2: de vraag en de knoppen gaan weg; de eerste zin, dan WACHT de les op de pijl; daarna de vraag
         anders verwoord (de hint) en de knoppen in een andere volgorde (keuring punt 3). */
      await zegEnPijl(l, [fz[0]], true);
      zinnen = fz.slice(1);
      const oud = opties.join();
      for (let k = 0; k < 6 && opties.join() === oud; k++) opties = schud(TOTAAL_KEUZES).map(String);
      eerder = f;
      eersteX = x;
      continue;
    }
    /* 2e fout (draaiboek §3 B.3 en 15.11): uitleg en samen tellen; het antwoord in beeld; pijl. */
    await zeg(l, ...fz);
    zet(l, { licht: ["la", "lb"] });
    await zegEnPijl(l, [ZIN.totaalSamen], true);
    zet(l, { licht: [] });
    noteer(l, vraag, "samen", false);
    return;
  }
}

async function andersSplitsen(l: Lesgids) {
  const v = VRAGEN[0] as HuisVraag;
  const b = huisOpbouw(v);
  const id = "gouden-anders";
  /* Het totaal pas in het dak als het hoopje leeg is: anders staat de 5 over een pion (kind-test punt 7). */
  const vrij = (la: string, lb: string, top = "") => ({ ...b.beeld({ la, lb, top }), id });
  /* Na de hulp (Bliepo legt 3 in het paarse vak) is de route 3 en 2; zo kan Bliepo het ook afmaken. */
  const route: [number, number][] = [[0, 0], [1, 0], [2, 0], [3, 1], [4, 1]];
  let zin: string | null = ZIN.andersVraag;
  for (let ronde = 0; ; ronde++) {
    const hulp = ronde === 2;
    if (ronde === 3) {
      /* Ook met hulp niet gelukt: Bliepo maakt het af en de les gaat door (geen eindeloze lus; kind-test punt 5, 15.11). */
      const spec = b.spec({ oplossing: [3, 2], fout: [1, 4], route });
      toonBeeld(l, vrij("?", "?"), { ...spec, auto: 0 }, false);
      await legZelf(l, spec, 1, 5);
      goedMoment(l, { beeld: vrij("3", "2", "5") });
      log(l, "reactie", { soort: "voorgedaan", vraag: "uitleg-anders-5", zin: ZIN.andersAfmaken });
      await zegEnDoor(l, [ZIN.andersAfmaken]);
      break;
    }
    /* Na 2 keer zonder nieuwe manier: Bliepo legt 3 pionnen in het paarse vak (draaiboek §3 E, de hulp na Nee). */
    const spec = b.spec({ oplossing: [2, 3], fout: [1, 4], route });
    toonBeeld(l, vrij("?", "?"), hulp ? { ...spec, auto: 3 } : spec, ronde === 0);
    if (hulp) zin = ZIN.andersHelp;
    /* Eindigde de vorige zin al met de opdracht ("Probeer een andere manier."), dan niet nog eens (kind-test punt 10). */
    const z = zin ? opdrachtZin(l, [zin]) : Promise.resolve();
    const x = await wachtSleep(l, { spec: hulp ? { ...spec, auto: 3 } : spec, begin: hulp ? stand([3, 0], 2) : undefined, klaar: (q) => q.los === 0, hand: (q) => handNaarLeeg(spec, q, `anders-${ronde}`), handZin: ZIN.hand("pion"), zin: z });
    const [a, c] = x.tel;
    log(l, "anders", { tel: x.tel });
    if (a === 0 || c === 0) {
      /* Draaiboek §3 F.3: "vul eerst beide delen in"; geen fout (open punt 0 als deel: KEUZES Ronde 21). */
      await zeg(l, ZIN.andersLeegVak);
      zin = null;
      continue;
    }
    if (a === 1 && c === 4) {
      /* Draaiboek §3 A.5 / F.4: al gevonden telt niet als fout. */
      await zeg(l, ZIN.andersAlGevonden);
      zin = null;
      continue;
    }
    goedMoment(l, { beeld: vrij(String(a), String(c), "5") });
    /* Bij 5 rekent het draaiboek omgedraaid goed, met "interessant, je draaide ze om" (§3 F.5); 14.30: elk juist antwoord is goed. */
    const goedZin = a === 4 && c === 1 ? ZIN.andersOmgedraaid(a, c) : ZIN.andersGoed(a, c);
    log(l, "reactie", { soort: "goed", vraag: "uitleg-anders-5", zin: goedZin });
    await zegEnDoor(l, [goedZin]);
    break;
  }
  await zegEnDoor(l, [ZIN.andersKlaar]);
}

/* ---------- de les ---------- */

const gouden: Lesdraaiboek = {
  id: "squla-splits-splitsen1-1-gouden",
  titel: "Splitsen tot 10",
  /* Begint met "Squla": dan kleurt het lesscherm de getallen in Bliepo's tekst (data-squla; LESRECEPT, geleerd bij Tellen). */
  synthesis: "Squla groep 3 · Splitsen · Splitsen 1 · level 1 · gouden les (nieuwe versie van squla-splits-splitsen1-1) · verloop draaiboek Splitsen (Part Part Whole)",
  indeling: "synthesis",
  browserstem: true,
  nacht: true,
  voorwerpen: ["pion", "voetbal", "zak", "pingpongbal", "doek", "tennisbal"],
  kaarttekening: KaartSplitsenGouden,
  async speel(l) {
    STAAT.delete(l);
    log(l, "start");
    /* Stap 1. Openen: het huisje met 5 pionnen (het voorbeeld, BOUWREGELS 4.1); de groet; de startvraag. */
    const v0 = VRAGEN[0] as HuisVraag;
    const b0 = huisOpbouw(v0);
    const s0 = b0.spec();
    st(l).huidig = b0.beeld().id;
    l.vlak<GoudenSplitsProps>(GoudenSplitsVlak, { beeld: b0.beeld(), s1: s0, rondje: true, actief: false, hand: null });
    speelLesgeluid("verschijn");
    await l.wacht(600);
    await zeg(l, NAAM_GROET);
    st(l).naamKeer = 1;
    st(l).naamVraag = 0;
    log(l, "vraag", { zin: "startvraag" });
    zetTestAntwoord("Nee");
    const pStart = l.kies(["Ja", "Nee"], { direct: true, weetniet: false });
    /* Eerst wat je in deze les doet, dan de vraag (BOUWREGELS 4.3, 4.4; kind-test punt 12). 1 uiting. */
    void zeg(l, `${ZIN.begin} ${ZIN.start}`).catch(() => {});
    const start = await pStart;
    log(l, "tik", { x: start });
    await l.wacht(DENK_MS);

    let uitleg = start !== "Ja";
    let vanaf = 0;
    if (start === "Ja") {
      /* Stap 2a. De proef: vraag 1 en 2. Twee fouten samen = alsnog de uitleg (draaiboek §1 en §3 A.4). */
      await zeg(l, ZIN.proefBegin);
      const proef: Proef = { fouten: 0 };
      for (let i = 0; i < 2 && !uitleg; i++) {
        st(l).laatste = false;
        const uit = await huisVraag(l, VRAGEN[i] as HuisVraag, i === 0, proef);
        if (uit === "gestopt") uitleg = true;
      }
      log(l, "proef", { fouten: proef.fouten, uitleg });
      if (!uitleg) {
        await zegEnDoor(l, [ZIN.proefGoed]);
        vanaf = 2;
      } else {
        /* De vragen van de proef komen in de les opnieuw: hun uitkomst telt dan pas. */
        st(l).eerste.clear();
      }
    } else {
      /* Stap 2b. Nee: geen probleem, vanzelf door naar de uitleg. */
      await zegEnDoor(l, [ZIN.nee]);
    }
    if (uitleg) await uitlegRoute(l);

    /* Stap 11–15. De 15 vragen van squla-splits-splitsen1-1. */
    for (let i = vanaf; i < VRAGEN.length; i++) {
      const v: Sleepvraag = VRAGEN[i];
      st(l).laatste = i === VRAGEN.length - 1;
      /* Af en toe een overgangszin (BLIEPO-KARAKTER.md §12): alleen bij een nieuwe soort opdracht. */
      if (i === 9) await zeg(l, kies(l, OVERGANG));
      if (v.soort === "huis") await huisVraag(l, v, i === vanaf, null);
      else if (v.soort === "paren") await parenVraag(l, v);
      else await tienVraag(l, v);
    }

    /* Stap 16. Einde: slotzin, de kaart, een eindzin uit het rijtje. */
    void l.zeg().catch(() => {});
    zet(l, { s1: null, hand: null, licht: [], beeld: null });
    await zeg(l, ZIN.slot);
    await l.wacht(300);
    log(l, "kaart");
    const tik = l.kaart();
    speelLesgeluid("kaart");
    await zeg(l, veelFouten(l) ? EINDE_VEEL_FOUTEN : kies(l, EINDE), ZIN.kaartTik);
    await tik;
  },
};

export const LESSEN_SQULA_SPLITSEN_GOUDEN: Lesdraaiboek[] = [gouden];

/* Voor het fouttabel-script en de test: de vragen en hun type. */
export type { Sleepvraag };
export { tweedeVak };
