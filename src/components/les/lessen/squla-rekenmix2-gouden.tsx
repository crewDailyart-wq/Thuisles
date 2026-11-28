/**
 * DE GOUDEN LES REKENMIX 2 (12 november 2026; BOUWREGELS 15.25; LESRECEPT.md; KEUZES-VOOR-SARA.md Ronde 44 punt 7).
 *
 *   squla-rekenmix-mix2-1-gouden: een NIEUWE versie naast squla-rekenmix-mix2-1 "Rekenmix 2" (BOUWREGELS 15.8). De oude
 *   les (squla-rekenmix.tsx) en het oude vlak blijven precies zoals ze zijn; pas na akkoord van Sara vervangt deze versie
 *   de oude voor kinderen.
 *
 * Inhoud (15.22 punt 1): die van squla-rekenmix-mix2-1 (Squla level 1). Dezelfde 15 vragen in dezelfde volgorde: "Op welke
 * boterham zit meer kaas?" (meer, minder, evenveel met een plaatje bovenaan; de meeste en de minste zonder), met dezelfde
 * boterhammen, spiesjes en beleg en dezelfde volgorde van de 3 plaatjes. De plaatjes zijn de vaste plaatjes van de oude
 * les (public/voorwerpen), zonder getal.
 *
 * Elke vraag is een VERGELIJKVRAAG: hij volgt de gouden les Meer-minder (squla-meer-minder-evenveel2-1-gouden, draaiboek
 * Meer-minder): tik op een plaatje (alleen een vinkje erop) en dan op het vinkje van het lesscherm; 1e fout = eerste zin +
 * hint, 2e fout = uitleg en samen kijken (Bliepo wijst elk plaatje aan en zegt hoeveel erop zit; het kind tikt het goede
 * plaatje); goed = lof en een korte reactie; hulphandje alleen bij samen kijken; vangnet na 20 s; einde met slotzin en kaart.
 *
 * De verder-pijl (15.27): Bliepo praat door; na elk stuk tekst gaat de les ±0,7 s na de stem vanzelf verder (`zegDoor`).
 * Bij vragen en opdrachten (samen kijken) staat er geen pijl.
 *
 * Elke fout wordt met zijn denkfout vastgelegd en elke vraag met zijn uitkomst in de tabel les_uitkomsten
 * (bewaarUitkomst); mislukt dat, dan gaat de les gewoon door.
 */

import type { Lesdraaiboek, Lesgids } from "../soort";
import { GoudenRekenmixVlak, type GoudenRekenmixProps, type RmgOpgave } from "../vlakken/squla-rekenmix-gouden-vlak";
import { zetTestAntwoord } from "./squla-hulp";
import { speelLesgeluid } from "@/lib/lesgeluiden";
import { bliepoScherm } from "@/lib/bliepo-scherm";
import { bewaarUitkomst } from "@/app/lesuitkomstacties";
import { percentageGoed } from "@/lib/les-kleuren";
import { EIND_TIK_KAART, eindzin } from "../eindzinnen";
import { BEVESTIG, LOF, LOF_KIJK_INDEX, MOMENT, NAAM_GROET, NAAM_LOF, OVERGANG, VRAGEN, WISSEL, ZIN, foutReactie, foutenVan, goedPlaatje, goedReactie, handZin, metVoorbeeld, metNaam, opnieuwZin, samenKlaarZin, samenZinnen, vergelijkFout, woordenVan, type Rijtje, type Vraag2 as Rmvraag } from "./squla-rekenmix2-gouden-zinnen";
import { maakKiezer } from "./nooit-dubbel";
import { alleenBijKeuze } from "./squla-klok-gouden-zinnen";

const LES_ID = "squla-rekenmix-mix2-1-gouden";

/** Alle plaatjes van de les: vooruit tekenen. */
const ALLE_BEELDEN = [...new Set(VRAGEN.flatMap((v) => woordenVan(v).namen))].sort();

/* ---------- tempo (draaiboek Tellen §5; zelfde als de gouden les Tellen) ---------- */

/** Reactie na een tik (6.10a: 0,2 tot 0,4 s). */
const DENK_MS = 200;
/** Bij een opdracht (samen tellen): na zoveel stilte vanzelf het hulphandje (15.19: ongeveer 6 s). */
const AANWIJZING_MS = 6000;
/** Bij samen kijken (2e fout): het handje bij het goede plaatje ± 1,5 s na de opdrachtzin (keuring 20 nov 2026). */
const SAMEN_HAND_MS = 1500;
/** Samen natellen: zoveel tijd per nummer (draaiboek Tellen §3 A.1 b: 1,1 tot 1,2 s). */
const NATEL_MS = 1150;
/** Zo lang na het einde van de stem komt het volgende stuk (zeg() wacht zelf al 0,3 s; samen ±0,7 s; 15.27). */
const DOOR_NA_MS = 400;
/** Vangnet bij samen tellen: na zoveel stilte telt Bliepo de rest zelf. */
const VANGNET_MS = 20000;

/**
 * NOOIT 2 KEER HETZELFDE (Sara, 18 november 2026; zoals de proefles Tellen): alle zinnen in varianten kiest de les met de
 * gedeelde kiezer. Nooit dezelfde zin 2 keer achter elkaar, ook niet over vragen heen (de kiezer leeft zolang de pagina
 * open is). "Daar zit minder kaas op." en "Daar zit meer fruit op." tellen als dezelfde zin.
 */
const KIEZER = maakKiezer({ wissel: WISSEL });
const variant = (sleutel: string, zinnen: readonly string[], mag?: (z: string) => boolean) => KIEZER.kies(sleutel, zinnen, mag);

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
  /* De reactie na de lof: zegt wat er goed was, zonder een woord van de lofzin te herhalen ("Precies goed! Precies, …")
     en nooit 2 keer achter elkaar dezelfde zin, ook niet over vragen heen (gedeelde kiezer, 18 nov). */
  const aantal = goedReactie(variant, v, lof);
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

/* ---------- het beeld ---------- */

/** Bovenaan het plaatje om mee te vergelijken (meer, minder, evenveel), eronder de 3 plaatjes om uit te kiezen. */
const opgaveVan = (v: Rmvraag): RmgOpgave => {
  const h = woordenVan(v);
  const vb = metVoorbeeld(v);
  const kaart = (niveau: number, k: number) => ({ beeld: h.namen[niveau], x: (k - 1) * (vb ? 250 : 290), y: vb ? 100 : 0, m: vb ? 220 : 260, boven: 0 });
  return { id: `${LES_ID}-${v.nr}`, dingen: [...(vb ? [{ beeld: h.namen[1], x: 0, y: -190, m: 190, boven: 0 }] : []), ...v.keuzes.map(kaart)] };
};
/** Het eerste plaatje om te kiezen staat op plek 0 (zonder voorbeeld) of 1 (met het voorbeeld bovenaan). */
const eerstePlek = (v: Rmvraag) => (metVoorbeeld(v) ? 1 : 0);
const kaartPlekken = (v: Rmvraag) => v.keuzes.map((_, k) => eerstePlek(v) + k);
const beeldVan = (v: Rmvraag): Partial<GoudenRekenmixProps> => ({ opgave: opgaveVan(v), nummers: [], kleur: "wit", tikbaar: false, tikbaarOp: undefined, vierkant: true, vinkje: null, hand: null });

/**
 * Het kind tikt een plaatje (alleen een vinkje erop; nog een tik haalt het weg, een ander plaatje neemt het over) en dan
 * het vinkje van het lesscherm (draaiboek Meer-minder §2 stap 2: tik + vinkje; BOUWREGELS 6.5). Een tik tijdens de
 * vraagzin telt. Geeft de plek (0, 1 of 2 van links naar rechts) van het gekozen plaatje.
 */
async function kiesPlaatje(l: Lesgids, v: Rmvraag, zinnen: string[]): Promise<number> {
  let gekozen: number | null = null;
  const e = eerstePlek(v);
  zet(l, { tikbaar: true, tikbaarOp: kaartPlekken(v), vinkje: null });
  log(l, "vraag", { zin: zinnen.join(" "), opties: ["plaatje"] });
  l.verderWeg?.();
  const z = zeg(l, zinnen.join(" "));
  z.catch(() => {});
  void z.then(() => log(l, "vraag-klaar"), () => {});
  for (;;) {
    type Uit = { t: { soort: string; index: number } | null };
    const tik: Promise<Uit> = l.wachtOpVlak<{ soort: string; index: number }>("telTik").then((t) => ({ t }));
    const knop: Promise<Uit> | null = gekozen === null ? null : l.knoppen(["controleer"]).then(() => ({ t: null }));
    const r: Uit = await Promise.race(knop ? [tik, knop] : [tik]);
    if (!r.t) break;
    const k = r.t.index - e;
    gekozen = gekozen === k ? null : k;
    log(l, "tik", { plaatje: k, gekozen });
    speelLesgeluid("tik");
    zet(l, { vinkje: gekozen === null ? null : e + gekozen });
  }
  log(l, "tik", { nakijken: gekozen });
  zet(l, { tikbaar: false, vinkje: gekozen === null ? null : e + gekozen });
  return gekozen as number;
}

/**
 * 2e fout: samen kijken. Bliepo wijst elk plaatje aan en zegt hoeveel erop zit (het handje wijst mee), dan tikt het kind
 * het goede plaatje (de kleine stap). Het handje wijst het goede plaatje ± 1,5 s na de opdrachtzin aan (keuring 20 nov:
 * was ± 6 s; bij samen voordoen mag het antwoord in beeld, 15.11), na 20 s wijst Bliepo zelf aan.
 */
async function samenKijken(l: Lesgids, v: Rmvraag) {
  const e = eerstePlek(v);
  const goedIdx = e + goedPlaatje(v);
  zet(l, { vinkje: null, tikbaar: false, hand: null });
  /* Van weinig naar veel, zodat het kind de volgorde hoort. */
  const volgorde = v.keuzes.map((niv, k) => ({ niv, k })).sort((a, b) => a.niv - b.niv);
  /* Alle zinnen van samen kijken in 1 keer gekozen (dezelfde functie als het fouttabel-script). */
  const samen = samenZinnen(variant, v);
  for (const [j, { niv, k }] of volgorde.entries()) {
    zet(l, { hand: e + k });
    log(l, "kijk-plaatje", { k, niv });
    await zegDoor(l, samen.plaatjes[j]);
  }
  zet(l, { hand: null, tikbaar: true, tikbaarOp: kaartPlekken(v) });
  zetTestAntwoord(`tel-${goedIdx}`);
  haak(l, { soort: "kaartSamen", goed: `tel-${goedIdx}`, vraag: v.id });
  let klok: ReturnType<typeof setTimeout> | undefined;
  let handGezegd = false;
  let afgelopen = false;
  const wachtOpHand = (ms = AANWIJZING_MS) => {
    clearTimeout(klok);
    if (afgelopen) return;
    klok = setTimeout(() => {
      log(l, "aanwijzing", { i: goedIdx });
      zet(l, { hand: goedIdx });
      if (!handGezegd) {
        handGezegd = true;
        void zeg(l, handZin(variant, v)).catch(() => {});
      }
    }, ms);
  };
  log(l, "samen-tellen", { vraag: v.id });
  void zegOpdracht(l, samen.tik).then(
    () => {
      log(l, "vraag-klaar");
      wachtOpHand(SAMEN_HAND_MS);
    },
    () => {},
  );
  wachtOpHand();
  let zelf = false;
  let anders = 0;
  let sinds = Date.now();
  try {
    for (;;) {
      const rest = Math.max(500, VANGNET_MS - (Date.now() - sinds));
      const t = await Promise.race([l.wachtOpVlak<{ soort: string; index: number }>("telTik"), l.wacht(rest).then(() => null)]);
      if (t === null) {
        zelf = true;
        log(l, "vangnet", {});
        break;
      }
      log(l, "tik", { x: `tel-${t.index}`, samen: true });
      speelLesgeluid("tik");
      if (t.index === goedIdx) break;
      /* Een ander plaatje: het handje wijst meteen het goede aan (het antwoord stond al aangewezen). Vangnet: 3 keer een
         ander plaatje = Bliepo wijst zelf aan en de les gaat door (zoals de gouden les Meer-minder). */
      if (++anders >= 3) {
        zelf = true;
        log(l, "vangnet", { anders });
        break;
      }
      sinds = Date.now();
      zet(l, { hand: goedIdx });
      wachtOpHand();
    }
  } finally {
    afgelopen = true;
    clearTimeout(klok);
    zet(l, { tikbaar: false, hand: null });
    haak(l, null);
    zetTestAntwoord(null);
  }
  zet(l, { vinkje: goedIdx, hand: null });
  const klaar = samenKlaarZin(variant, v, zelf, [samen.plaatjes[volgorde.findIndex((x) => x.k === goedIdx - e)], samen.tik]);
  if (zelf) {
    /* 15.40 (F20): ook na samen doen het groene scherm en het geluid (goed-na-hulp). */
    speelLesgeluid("goed");
    bliepoScherm("goed");
    await zegDoor(l, klaar);
    return;
  }
  await l.wacht(DENK_MS);
  speelLesgeluid("goed");
  bliepoScherm("goed");
  await zegDoor(l, klaar);
}

/* ---------- 1 vraag: 2 pogingen (zoals de gouden les Meer-minder) ---------- */

async function plaatjeVraag(l: Lesgids, v: Rmvraag, eersteVraag: boolean): Promise<Uitkomst> {
  const s = st(l);
  s.vraag++;
  const fouten = foutenVan(v);
  const goedK = goedPlaatje(v);
  const e = eerstePlek(v);
  /* De zin van de vorige vraag weg zodra de nieuwe plaatjes komen. */
  if (!eersteVraag) void l.zeg().catch(() => {});
  zet(l, beeldVan(v));
  if (!eersteVraag) speelLesgeluid("verschijn");
  await l.wacht(150);
  let eersteX = "";
  let eersteZin = "";
  /* De vraag van de oude les; vanaf de 2e vraag wisselt de kijkzin ervoor ("Kijk naar de boterham bovenaan."). */
  let zinnen = ZIN.vraag(v, eersteVraag, eersteVraag || !metVoorbeeld(v) ? "" : variant("intro", ZIN.vraagIntro(v)));
  for (let poging = 1 as 1 | 2; poging <= 2; poging++) {
    zetTestAntwoord(`tel-${e + goedK}`);
    haak(l, { soort: "kaart", goed: `tel-${e + goedK}`, fout: v.keuzes.map((_, k) => k).filter((k) => k !== goedK).map((k) => `tel-${e + k}`), poging, vraag: v.id });
    const k = await kiesPlaatje(l, v, zinnen);
    haak(l, null);
    zetTestAntwoord(null);
    await l.wacht(DENK_MS);
    if (k === goedK) {
      speelLesgeluid("goed");
      bliepoScherm("goed");
      zet(l, { goed: ++s.goed });
      if (poging === 1) {
        const lof = lofZinnen(l, v, eersteVraag);
        log(l, "reactie", { soort: "goed", vraag: v.id, zin: lof.join(" ") });
        await zegDoor(l, lof.join(" "));
        zet(l, { vinkje: null });
        return noteer(l, v.id, "goed");
      }
      const z = bevestig(l);
      log(l, "reactie", { soort: "goed-na-fout", vraag: v.id, zin: z });
      await zegDoor(l, z);
      zet(l, { vinkje: null });
      return noteer(l, v.id, "naFout");
    }
    /* Geen fout-geluidje en geen rood op de keuze; alleen Bliepo's scherm kleurt rood (5.3). */
    bliepoScherm("fout");
    zet(l, { fout: ++s.fout });
    s.opRij = 0;
    const x = String(k);
    const f = fouten[x] ?? vergelijkFout(v.keuzes[k] ?? 0, v);
    legDenkfoutVast(l, { vraag: v.id, antwoord: x, denkfout: f.code, poging });
    /* Uit de varianten (foutReactie: dezelfde functie als het fouttabel-script). Hetzelfde plaatje 2 keer: "Je koos weer …". */
    const fz = foutReactie(variant, f, poging, { zelfdePlaatje: poging === 2 && x === eersteX, eersteZin }).filter(Boolean);
    log(l, "reactie", { soort: `fout${poging}`, vraag: v.id, x, denkfout: f.code, zin: fz.join(" ") });
    if (poging === 1) {
      /* 1e fout: de vraag verdwijnt; de eerste zin (vanzelf door), dan mag het kind opnieuw kiezen, met de hint (een vraag: geen pijl).
         Na de hint komt de vraag terug, zodat het kind weet wat het moet doen (F16, BOUWREGELS 15.37). */
      zet(l, { vinkje: null });
      await zegDoor(l, fz[0]);
      zinnen = [fz[1], opnieuwZin(variant, v, fz[1])];
      eersteX = x;
      eersteZin = fz[0];
    } else {
      /* 2e fout (15.11): uitleg, samen kijken, door. */
      await zegDoor(l, ...fz);
      await zegDoor(l, variant("samenHelp", ZIN.samenHelp));
      await samenKijken(l, v);
      zet(l, { vinkje: null });
      return noteer(l, v.id, "samen");
    }
  }
  return noteer(l, v.id, "samen");
}

/* ---------- de les ---------- */

const gouden: Lesdraaiboek = {
  id: "squla-rekenmix-mix2-1-gouden",
  titel: "Rekenmix 2",
  /* Begint met "Squla": dan kleurt het lesscherm de getallen in Bliepo's tekst (data-squla). */
  synthesis: "Squla groep 3 · Rekenmix · Rekenmix 2 · level 1 · gouden les (nieuwe versie van squla-rekenmix-mix2-1) · alle vragen zijn vergelijkvragen (meer, minder, evenveel, de meeste, de minste; zonder getal): verloop van de gouden les Meer-minder en de gouden Rekenmix",
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
  /* Het nieuwe eindscherm (15.55, EINDSCHERM-INBOUW.md). De oude kaart (KaartRekenmixGouden) blijft in
     squla-rekenmix-gouden-vlak.tsx staan; deze les gebruikt hem niet meer. */
  eindscherm: true,
  eindOnderwerp: "Rekenmix 2",
  eindLeerzin: "Je kunt nu meer en minder zien.",
  eindPlaatje: "/voorwerpen/boterham-veel-kaas.png",
  eindKaartZin: EIND_TIK_KAART,
  async speel(l) {
    STAAT.delete(l);
    log(l, "start");
    if (l.snelEinde) return snelNaarEinde(l);
    l.voortgang?.(0);
    /* Stap 1. Openen: de appels van vraag 1 verschijnen; Bliepo groet en zegt wat we gaan doen, in 1 stuk. */
    l.vlak<GoudenRekenmixProps>(GoudenRekenmixVlak, { ...beeldVan(VRAGEN[0]), opgave: opgaveVan(VRAGEN[0]), voorraad: ALLE_BEELDEN });
    speelLesgeluid("verschijn");
    await l.wacht(600);
    st(l).naamKeer = 1;
    st(l).naamVraag = 0;
    /* Verdergaan (15.53): "welkom terug" in plaats van de groet en het uitlegdeel. Opnieuw doen: eerst zeggen dat het kind
       de les al deed, daarna de les zoals altijd. */
    if (l.hervat) await zegDoor(l, l.openingsZin ?? NAAM_GROET);
    /* Opnieuw doen na de beste kleur (15.60, zoals Synthesis): eerst de groet, dan "Dit ken je al", geen uitlegdeel. */
    else if (l.zonderUitleg) await zegDoor(l, NAAM_GROET, l.openingsZin ?? "");
    else await zegDoor(l, ...(l.openingsZin ? [l.openingsZin] : []), NAAM_GROET, variant("begin", ZIN.begin));

    /* Stap 3 en 4. De 15 vragen van squla-rekenmix-mix2-1. */
    for (const [i, v] of VRAGEN.entries()) {
      /* Verdergaan (15.53): een vraag die al gemaakt is, wordt met zijn overgangszin overgeslagen. */
      if (klaarAl(l, v.id)) continue;
      st(l).laatste = i === VRAGEN.length - 1;
      /* Af en toe een overgangszin (BLIEPO-KARAKTER.md §12); meestal niet (zoals Tellen: 1 keer, halverwege). */
      if (i === 7) await zegDoor(l, kies(l, OVERGANG));
      await plaatjeVraag(l, v, i === 0);
    }

    /* Stap 10. Einde: het nieuwe eindscherm (15.55). Was: slotzin (ZIN.slot), de kaart en een eindzin uit het rijtje. */
    void l.zeg().catch(() => {});
    zet(l, { opgave: null, nummers: [], hand: null, tikbaar: false, vinkje: null });
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
  l.vlak<GoudenRekenmixProps>(GoudenRekenmixVlak, { ...beeldVan(VRAGEN[0]), opgave: opgaveVan(VRAGEN[0]), voorraad: ALLE_BEELDEN });
  /* Eerst de groet: bij een geplakte link komt dan de afspeelknop (15.38) en mag er daarna geluid klinken. */
  await zeg(l, NAAM_GROET);
  await l.wacht(300);
  for (let i = 0; i < n; i++) {
    l.voortgang?.(Math.min(1, ((i + 1) * 3) / totaal));
    l.sleutel?.();
    await l.wacht(1100);
  }
  l.voortgang?.(1);
  zet(l, { opgave: null, nummers: [], hand: null, tikbaar: false, vinkje: null });
  await eindeScherm(l);
}

export const LESSEN_SQULA_REKENMIX2_GOUDEN: Lesdraaiboek[] = [gouden];
