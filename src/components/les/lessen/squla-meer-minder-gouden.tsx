/**
 * DE GOUDEN LES MEER-MINDER (10 november 2026; BOUWREGELS hoofdstuk 15, 15.22, 15.25, 15.27–15.30; LESRECEPT.md).
 *
 *   squla-meer-minder-evenveel2-1-gouden — een NIEUWE versie naast squla-meer-minder-evenveel2-1 "De meeste"
 *   (BOUWREGELS 15.8). De oude les (squla-meer-minder.tsx) blijft precies zoals hij is; pas na akkoord van Sara vervangt
 *   deze versie de oude voor kinderen.
 *
 * Waarom deze Squla-les: van de 3 levels 1 (evenveel1-1, evenveel2-1, evenveel3-1) past "De meeste" (evenveel2-1) het
 * best bij het draaiboek Meer-minder (More or Less): de helft van de les is "waar liggen de meeste?" (draaiboek §1 A/B en
 * D: tik op de grootste groep + vinkje), en de kralen tellen past bij de hulp van het draaiboek (samen tellen, een getal
 * boven de groep). evenveel1-1 is alleen tellen en een getal kiezen (zit niet in More or Less), evenveel3-1 is getallen
 * op volgorde tot 49 (zit er ook niet in). Zie KEUZES-VOOR-SARA.md, Ronde 25.
 *
 * Inhoud (15.22 punt 1): die van squla-meer-minder-evenveel2-1. Dezelfde 15 vragen in dezelfde volgorde, dezelfde
 * getallen en dezelfde keuzes: 8 keer kralen tellen (3 keuzes), 7 keer 3 kaarten met koekjes (waar liggen de meeste?).
 *
 * Skelet (15.22 punt 3): het draaiboek Meer-minder (SYNTHESIS-ANALYSE/DRAAIBOEKEN-NIEUW/meer-minder.md):
 *   stap 1  openen: geen startvraag en geen proef; Bliepo groet en zegt in hetzelfde stuk wat we gaan doen; vanzelf door;
 *   tellen  (eigen invulling, niet van Synthesis: More or Less heeft geen telvraag): vraag + 3 keuzes tegelijk; de tik is
 *           het antwoord; 1e fout = eerste zin + hint uit de fouttabel en dezelfde keuzes terug; 2e fout = uitleg en samen
 *           tellen zoals het draaiboek (§3 A.5 en G): Bliepo telt de volle rijen, het KIND tikt de kralen van de laatste
 *           rij, het getal boven de kralen telt mee; daarna door;
 *   overgang (§2 stap 5: "nu iets anders");
 *   de meeste (§2 stap 2 en 3, §3 A/B): tik op een kaart (alleen een vinkje erop, 6.5) en dan het vinkje van het
 *           lesscherm; 1e fout = de koekjes gaan in rijen van 10 liggen (§6: het beeld zo veranderen dat je het verschil
 *           ziet, zoals Synthesis de blokken op een rij laat zakken) + eerste zin en hint; 2e fout = samen tellen (§3 A.5):
 *           Bliepo telt elke kaart, het getal staat erboven, en het kind tikt de kaart met het grootste getal;
 *   goed in 1 keer: scherm 1 s groen, lof + korte reactie; goed na een fout: korte bevestiging; vanzelf door;
 *   hulphandje: alleen bij het samen tellen (opdracht), na ± 6 s stilte met 1 korte zin; bij kiezen niets (15.19);
 *   heel snel: niets (draaiboek §3 A.2: Synthesis zegt niets over snelheid);
 *   stap 8 einde: een slotzin, de kaart, een eindzin uit het rijtje en "Tik op de kaart." (geen pijl op de kaart).
 *   Wat More or Less verder doet ("hoeveel meer?", meeste van 1 kleur, gelijk maken) zit er NIET in: Squla level 1
 *   heeft die vragen niet (15.22; KEUZES-VOOR-SARA.md, Ronde 25).
 *
 * De verder-pijl (15.27, zoals de gouden klokles en Minsommen): Bliepo praat door; na elk stuk tekst gaat de les ±0,7 s
 * na de stem vanzelf verder (`zegDoor`). De pijl staat rechts onder de tekst als snelkoppeling. Bij vragen en opdrachten
 * staat er geen pijl.
 *
 * Elke fout wordt met zijn denkfout vastgelegd en elke vraag met zijn uitkomst (goed in 1 keer, goed na een fout, samen
 * gedaan) in de tabel les_uitkomsten (bewaarUitkomst; zonder gekozen kind gebeurt er niets).
 */

import type { Lesdraaiboek, Lesgids } from "../soort";
import { KaartMeerMinder, type MMGroep, type MMOpgave } from "../vlakken/squla-meer-minder-vlak";
import { MM_KLEUR, MM_VOORWERPEN } from "../vlakken/squla-meer-minder-tekenen";
import { GoudenMMVlak, kaartPlek, kraalPlek, type GoudenMMProps } from "../vlakken/squla-meer-minder-gouden-vlak";
import { zetTestAntwoord } from "./squla-hulp";
import { speelLesgeluid } from "@/lib/lesgeluiden";
import { bliepoScherm } from "@/lib/bliepo-scherm";
import { bewaarUitkomst } from "@/app/lesuitkomstacties";
import {
  AANMOEDIG_TIKKEN,
  BEVESTIG,
  DRIEREACTIE_JA,
  DRIEREACTIE_ROBOT,
  EINDE,
  EINDE_VEEL_FOUTEN,
  KOEKJE,
  KRAAL,
  LOF,
  LOF_KIJK_INDEX,
  MOMENT,
  NAAM_GROET,
  NAAM_LOF,
  ONDUIDELIJK,
  ONDUIDELIJK_NOG_1_KEER,
  OVERGANG,
  TELREACTIE,
  TELREACTIE_JA,
  TELREACTIE_ROBOT,
  VRAGEN,
  ZIN,
  drieReactie,
  foutenVan,
  metNaam,
  rijenVan,
  volleRijen,
  type Driekaart,
  type Fout,
  type Rijtje,
  type Telvraag,
  type Vraag,
} from "./squla-meer-minder-gouden-zinnen";

const LES_ID = "squla-meer-minder-evenveel2-1-gouden";

/* ---------- tempo (draaiboek Meer-minder §5) ---------- */

/** Reactie na een tik (6.10a: 0,2 tot 0,4 s; draaiboek: stem 0,1–0,3 s na het vinkje). */
const DENK_MS = 250;
/** Bij een opdracht: na zoveel stilte vanzelf het hulphandje (15.19: ± 6 s). */
const AANWIJZING_MS = 6000;
/** Zo lang na het einde van de stem komt het volgende stuk (zeg() wacht zelf al 0,3 s; samen ±0,7 s; 15.27). */
const DOOR_NA_MS = 400;
/** Vangnet bij het samen tellen (LESRECEPT, geleerd bij Splitsen): na zoveel stilte, of na 3 verkeerde tikken, doet Bliepo de stap zelf en gaat de les door. */
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
  eersteDrie: boolean;
};
const STAAT = new WeakMap<Lesgids, Staat>();
const st = (l: Lesgids): Staat => {
  let s = STAAT.get(l);
  if (!s)
    STAAT.set(
      l,
      (s = { vorige: new Map(), recent: new Map(), zinNr: 0, robotNr: -99, namen: 0, naamKeer: 0, naamVraag: -99, opRij: 0, momenten: new Set(), vraag: 0, haak: 0, laatste: false, eerste: new Map(), vraagFouten: new Map(), log: [], robotReactie: false, nakijk: 0, eersteDrie: true }),
    );
  return s;
};

const zet = (l: Lesgids, p: Partial<GoudenMMProps>) => l.pasVlakAan<GoudenMMProps>(p);
const LEEG: Partial<GoudenMMProps> = { kaarten: null, tellers: null, kraal: null, hulphand: null, tel: null };

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

/** Voor de eigen test: wat de les nu vraagt (window.__phaser.mmTaak). */
function haak(l: Lesgids, info: Record<string, unknown> | null, nieuw = false) {
  if (typeof window === "undefined") return;
  const s = st(l);
  if (nieuw) s.vraag++;
  window.__phaser = { ...window.__phaser, mmTaak: info ? { ...info, n: ++s.haak, v: s.vraag } : null } as typeof window.__phaser;
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

/** Lof bij goed in 1 keer: een speciaal moment, soms de naam, anders een lofzin; soms een korte reactie erachter. */
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
  /* "Dat heb je goed gezien" alleen bij kijkvragen: wel bij de koekjes (kijken waar de meeste liggen), niet bij tellen. */
  lof ??= kies(l, LOF, v.soort === "tel" ? [LOF_KIJK_INDEX] : []);
  const reactie = v.soort === "tel" ? TELREACTIE(v.n) : drieReactie(v);
  const ja = v.soort === "tel" ? TELREACTIE_JA : DRIEREACTIE_JA;
  const robot = v.soort === "tel" ? TELREACTIE_ROBOT : DRIEREACTIE_ROBOT;
  /* Lof en reactie beginnen niet met hetzelfde woord, en nooit 2 keer "Ja" (ook "ja" midden in de lofzin telt). */
  const zonder = reactie.zinnen.map((_, i) => i).filter((i) => woord(reactie.zinnen[i]) === woord(lof));
  if (/\bja\b/i.test(lof)) zonder.push(...ja);
  /* Een robotreactie hooguit 1 keer per les. */
  if (s.robotReactie || s.zinNr - s.robotNr <= 2) zonder.push(robot);
  const r = kies(l, reactie, zonder, `reactie-${v.soort}`);
  if (r === reactie.zinnen[robot]) s.robotReactie = true;
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

/* ---------- DE VERDER-PIJL (15.27, zoals de gouden klokles en Minsommen) ---------- */

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
  const z = zeg(l, ...zinnen);
  z.catch(() => {});
  await Promise.race([z, melding]);
}

/** De keuzeknoppen tegelijk met de zinnen. Een tik tijdens de zin telt. Geen pijl (l.kies vervangt hem). */
async function vraagMetKnoppen(l: Lesgids, opties: string[], zinnen: string[]): Promise<string> {
  const p = l.kies(opties, { direct: true, weetniet: false });
  log(l, "vraag", { zin: zinnen.join(" "), opties });
  /* De vraag is 1 uiting (LESRECEPT, geleerd bij Tellen): tikt het kind al tijdens de 1e zin, dan begint Bliepo niet alsnog aan de 2e. */
  const z = zeg(l, zinnen.join(" "));
  z.catch(() => {});
  const eerst = await Promise.race([z.then(() => "gezegd" as const), p.then(() => "getikt" as const)]);
  if (eerst === "gezegd") log(l, "vraag-klaar");
  const x = (await p) ?? "";
  log(l, "tik", { x });
  return x;
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

const KRAALHEX = MM_KLEUR[KRAAL as keyof typeof MM_KLEUR];
const KOEKJEHEX = MM_KLEUR[KOEKJE as keyof typeof MM_KLEUR];
const groep = (soort: "kraal" | "koekje", n: number, per = 5): MMGroep => ({ soort, blokken: [{ rijen: rijenVan(n, per), kleuren: [soort === "kraal" ? "paars" : "bruin"] }] });

/** Het beeld van een vraag (zoals de oude les: kralen in rijen van 5; 3 kaarten met koekjes in rijen van 5). */
function opgaveVan(v: Vraag, kaarten: number[] = [], per = 5): MMOpgave {
  if (v.soort === "tel") return { id: `gouden-${v.id}`, soort: "tel", groep: groep("kraal", v.n) };
  return { id: `gouden-${v.id}-${kaarten.join("-")}-${per}`, soort: "kaarten", kaarten: kaarten.map((n) => groep("koekje", n, per)) };
}

/** Alle beelden vooraf (het vlak bakt de plaatjes vóór het eerste beeld). */
const VOORAF: MMOpgave[] = VRAGEN.flatMap((v) => (v.soort === "tel" ? [opgaveVan(v)] : [opgaveVan(v, v.kaarten), opgaveVan(v, v.kaarten, 10)]));

/** Een nieuw beeld (Bliepo tovert het tevoorschijn); de zin van de vorige vraag gaat weg (geleerd bij Tellen). */
function toonBeeld(l: Lesgids, o: MMOpgave) {
  zet(l, { ...LEEG, opgave: o });
}

/** Het hulphandje na ± 6 s stilte, met 1 korte zin (alleen de 1e keer per opdracht). */
function handKlok(l: Lesgids, plek: () => { x: number; y: number } | null, zin: string) {
  let gezegd = false;
  let klok: ReturnType<typeof setTimeout> | undefined;
  const zetAan = () => {
    clearTimeout(klok);
    klok = setTimeout(() => {
      const p = plek();
      if (!p) return;
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
    stop: () => {
      clearTimeout(klok);
      zet(l, { hulphand: null });
    },
  };
}

/* ---------- samen tellen bij de kralen (2e fout; draaiboek §3 A.5 en G) ---------- */

/**
 * Bliepo telt de volle rijen (het getal boven de kralen telt mee, de rijen lichten op). Daarna tikt het KIND de kralen
 * van de laatste rij, 1 voor 1 (de kleine stap); elke tik licht een kraal op en het getal telt mee. Andere tikken doen
 * niets (zoals bij Synthesis). Na ± 6 s stilte komt het hulphandje bij de volgende kraal.
 */
async function samenKralen(l: Lesgids, v: Telvraag, o: MMOpgave) {
  const n = v.n;
  const vol = volleRijen(n);
  const einden = rijenVan(n).reduce<number[]>((a, r) => [...a, (a.at(-1) ?? 0) + r], []).filter((e) => e <= vol);
  zet(l, { tellers: [0], tellerKleur: KRAALHEX, tel: { vak: 0, geteld: 0, stil: true } });
  speelLesgeluid("verschijn");
  await zegDoor(l, ZIN.samenVol(n));
  for (const e of einden) {
    zet(l, { tel: { vak: 0, geteld: e, samen: true }, tellers: [e] });
    speelLesgeluid("tik");
    await zegDoor(l, ZIN.samenTelRij(e));
  }
  /* De opdracht: geen pijl (15.27). Een tik op de kraal telt al tijdens de zin. */
  let geteld = vol;
  zet(l, { tel: { vak: 0, geteld, stil: true }, kraal: { volgende: geteld } });
  haak(l, { soort: "kraal", vraag: v.id });
  zetTestAntwoord(`kraal-${geteld}`);
  const hand = handKlok(l, () => kraalPlek(o, geteld), ZIN.samenHand);
  let eersteTik: (() => void) | null = null;
  const gedaan = new Promise<void>((r) => (eersteTik = r));
  void zegOpdracht(l, [ZIN.samenJij(n)], gedaan).catch(() => {});
  hand.opnieuw();
  try {
    while (geteld < n) {
      const t = await Promise.race([l.wachtOpVlak<{ soort: string; index: number }>("kraalTik"), l.wacht(VANGNET_MS).then(() => null)]);
      (eersteTik as (() => void) | null)?.();
      if (t === null) {
        /* Vangnet: 20 s geen tik; Bliepo telt de rest zelf (de les loopt nooit vast). */
        log(l, "vangnet", { geteld });
        geteld = n;
        zet(l, { tel: { vak: 0, geteld, stil: true }, tellers: [geteld], kraal: null });
        break;
      }
      if (t.index !== geteld) continue;
      geteld++;
      const klaar = geteld === n;
      speelLesgeluid("tik");
      log(l, "kraal-tik", { geteld });
      zet(l, { tel: { vak: 0, geteld, stil: true }, tellers: [geteld], kraal: klaar ? null : { volgende: geteld } });
      if (!klaar) {
        zetTestAntwoord(`kraal-${geteld}`);
        void zeg(l, ZIN.samenTel(geteld)).catch(() => {});
        hand.opnieuw();
      }
    }
  } finally {
    hand.stop();
    zet(l, { kraal: null });
  }
  haak(l, null);
  zetTestAntwoord(null);
  await l.wacht(DENK_MS);
  speelLesgeluid("goed");
  bliepoScherm("goed");
  zet(l, { tel: { vak: 0, geteld: n, samen: true } });
  await zegDoor(l, ZIN.samenKlaar(n));
  zet(l, { tel: null, tellers: null });
}

/* ---------- samen tellen bij de koekjes (2e fout; draaiboek §3 A.5) ---------- */

/** Bliepo telt elke kaart; het getal staat erboven (in de kleur van de koekjes). Daarna tikt het kind de kaart met het grootste getal. */
async function samenKaarten(l: Lesgids, v: Driekaart, kaarten: number[], o: MMOpgave) {
  const max = Math.max(...kaarten);
  const goedIdx = kaarten.indexOf(max);
  const tellers: (number | null)[] = kaarten.map(() => null);
  zet(l, { kaarten: null, tellerKleur: KOEKJEHEX });
  for (const [j, n] of kaarten.entries()) {
    tellers[j] = n;
    zet(l, { tel: { vak: j, geteld: n, samen: true }, tellers: [...tellers] });
    speelLesgeluid("tik");
    await zegDoor(l, ZIN.samenKaart(n, j));
  }
  zet(l, { tel: null, kaarten: { soort: "samen", gekozen: null, tikbaar: true } });
  haak(l, { soort: "kaartSamen", goed: `kaart-${goedIdx}`, vraag: v.id });
  zetTestAntwoord(`kaart-${goedIdx}`);
  const hand = handKlok(l, () => kaartPlek(o, goedIdx), ZIN.samenKaartHand);
  let eersteTik: (() => void) | null = null;
  const gedaan = new Promise<void>((r) => (eersteTik = r));
  void zegOpdracht(l, [ZIN.samenMeeste(max)], gedaan).catch(() => {});
  hand.opnieuw();
  try {
    let mis = 0;
    for (;;) {
      const t = await Promise.race([l.wachtOpVlak<{ soort: string; vak: number }>("kaartKies"), l.wacht(VANGNET_MS).then(() => null)]);
      (eersteTik as (() => void) | null)?.();
      /* Vangnet: 20 s geen tik of 3 keer een andere kaart; Bliepo wijst de kaart zelf aan en de les gaat door. */
      if (t === null || (t.vak !== goedIdx && ++mis >= 3)) {
        log(l, "vangnet", { mis });
        break;
      }
      log(l, "tik", { kaart: t.vak });
      if (t.vak === goedIdx) break;
      /* Een andere kaart: het handje wijst meteen de kaart met het grootste getal aan (het antwoord staat al in beeld). */
      const p = kaartPlek(o, goedIdx);
      if (p) zet(l, { hulphand: { plek: p, sleutel: `hand-${Date.now()}` } });
    }
  } finally {
    hand.stop();
  }
  haak(l, null);
  zetTestAntwoord(null);
  zet(l, { kaarten: { soort: "samen", gekozen: goedIdx, tikbaar: false } });
  await l.wacht(DENK_MS);
  speelLesgeluid("goed");
  bliepoScherm("goed");
  await zegDoor(l, ZIN.samenKaartKlaar(max));
  zet(l, { tellers: null, kaarten: null });
}

/* ---------- een vraag: kralen tellen ---------- */

async function telVraag(l: Lesgids, v: Telvraag, i: number): Promise<Uitkomst> {
  const goed = String(v.n);
  const opties = schud(v.keuzes).map(String);
  const fouten = foutenVan(v);
  const o = opgaveVan(v);
  if (i > 0) {
    void l.zeg().catch(() => {});
    toonBeeld(l, o);
    /* De vraag komt met het nieuwe beeld (zoals Synthesis), ±0,7 s na het einde van de vorige zin (15.27). */
    await l.wacht(150);
  }
  let zinnen = ZIN.telVraag(v.nr > 2, v.nr);
  let eerder: Fout | null = null;
  let eersteX = "";
  for (let poging = 1 as 1 | 2; poging <= 2; poging++) {
    zetTestAntwoord(goed);
    haak(l, { soort: "kies", opties, goed, poging, vraag: v.id }, poging === 1);
    const x = await vraagMetKnoppen(l, opties, zinnen);
    haak(l, null);
    await l.wacht(DENK_MS);
    if (x === goed) {
      speelLesgeluid("goed");
      bliepoScherm("goed");
      const zz = poging === 1 ? lofZinnen(l, v, i === 0) : [bevestig(l)];
      log(l, "reactie", { soort: poging === 1 ? "goed" : "goed-na-fout", vraag: v.id, zin: zz.join(" ") });
      await zegDoor(l, ...zz);
      return noteer(l, v.id, poging === 1 ? "goed" : "naFout");
    }
    /* Geen fout-geluidje en geen rood op de keuze; alleen Bliepo's scherm kleurt rood (BOUWREGELS 5.3). */
    bliepoScherm("fout");
    st(l).opRij = 0;
    const f = fouten[x] ?? onduidelijk(v);
    legDenkfoutVast(l, { vraag: v.id, antwoord: x, denkfout: f.code, poging });
    const fz = foutZinnen(l, f, poging, eerder).filter(Boolean);
    if (poging === 2 && x === eersteX && fz[0] === f.eerste) fz[0] = ZIN.weerGekozen(Number(x));
    log(l, "reactie", { soort: `fout${poging}`, vraag: v.id, x, denkfout: f.code, zin: fz.join(" ") });
    if (poging === 1) {
      await zegDoor(l, ...fz);
      zinnen = ZIN.telOpnieuw;
      eerder = f;
      eersteX = x;
      continue;
    }
    /* 2e fout (15.11): uitleg, dan samen tellen; het kind tikt de laatste rij. */
    await zegDoor(l, ...fz, ZIN.samen);
    await samenKralen(l, v, o);
    return noteer(l, v.id, "samen");
  }
  return noteer(l, v.id, "samen");
}

const onduidelijk = (v: Vraag): Fout => ({ code: "onduidelijk", soort: "onduidelijk", denkfout: "niet duidelijk", eerste: "", hint: v.soort === "tel" ? "Tel nog een keer, rij voor rij." : `${ZIN.opRij} Kijk wat er onder de rij van 10 nog ligt.`, uitleg: "We tellen ze samen.", weer: [], scherm: "", over: [] });

/* ---------- een vraag: waar liggen de meeste koekjes? ---------- */

/**
 * Het kind tikt een kaart (alleen een vinkje erop; nog een tik haalt het weg, een andere kaart neemt het over) en dan
 * het vinkje van het lesscherm (draaiboek §2 stap 2: tik + vinkje; BOUWREGELS 6.5). Een tik tijdens de vraagzin telt.
 */
async function kiesKaart(l: Lesgids, zinnen: string[]): Promise<number> {
  let gekozen: number | null = null;
  zet(l, { kaarten: { soort: "kies", gekozen, tikbaar: true } });
  log(l, "vraag", { zin: zinnen.join(" "), opties: ["kaart"] });
  l.verderWeg?.();
  const z = zeg(l, zinnen.join(" "));
  z.catch(() => {});
  void z.then(() => log(l, "vraag-klaar"), () => {});
  for (;;) {
    type Uit = { t: { soort: string; vak: number } | null };
    const tik: Promise<Uit> = l.wachtOpVlak<{ soort: string; vak: number }>("kaartKies").then((t) => ({ t }));
    const knop: Promise<Uit> | null = gekozen === null ? null : l.knoppen(["controleer"]).then(() => ({ t: null }));
    const r: Uit = await Promise.race(knop ? [tik, knop] : [tik]);
    if (!r.t) break;
    gekozen = gekozen === r.t.vak ? null : r.t.vak;
    log(l, "tik", { kaart: r.t.vak, gekozen });
    speelLesgeluid("tik");
    zet(l, { kaarten: { soort: "kies", gekozen, tikbaar: true } });
  }
  log(l, "tik", { nakijken: gekozen });
  zet(l, { kaarten: { soort: "kies", gekozen, tikbaar: false } });
  return gekozen as number;
}

async function drieVraag(l: Lesgids, v: Driekaart): Promise<Uitkomst> {
  const s = st(l);
  const kaarten = schud(v.kaarten);
  const max = Math.max(...kaarten);
  const goedIdx = kaarten.indexOf(max);
  const fouten = foutenVan(v);
  let o = opgaveVan(v, kaarten);
  void l.zeg().catch(() => {});
  toonBeeld(l, o);
  await l.wacht(150);
  /* De overgang naar de koekjes: wat het kind ziet verandert (draaiboek §2 stap 5: "nu iets anders"). */
  if (s.eersteDrie) await zegDoor(l, ZIN.naarKoekjes);
  let zinnen = ZIN.drieVraag(s.eersteDrie, v.nr);
  s.eersteDrie = false;
  let eerder: Fout | null = null;
  for (let poging = 1 as 1 | 2; poging <= 2; poging++) {
    zetTestAntwoord(`kaart-${goedIdx}`);
    haak(l, { soort: "kaart", goed: `kaart-${goedIdx}`, fout: kaarten.map((_, k) => k).filter((k) => k !== goedIdx).map((k) => `kaart-${k}`), poging, vraag: v.id }, poging === 1);
    const k = await kiesKaart(l, zinnen);
    haak(l, null);
    await l.wacht(DENK_MS);
    if (k === goedIdx) {
      speelLesgeluid("goed");
      bliepoScherm("goed");
      const zz = poging === 1 ? lofZinnen(l, v, false) : [bevestig(l)];
      log(l, "reactie", { soort: poging === 1 ? "goed" : "goed-na-fout", vraag: v.id, zin: zz.join(" ") });
      await zegDoor(l, ...zz);
      zet(l, { kaarten: null });
      return noteer(l, v.id, poging === 1 ? "goed" : "naFout");
    }
    bliepoScherm("fout");
    s.opRij = 0;
    const x = String(kaarten[k]);
    const f = fouten[x] ?? onduidelijk(v);
    legDenkfoutVast(l, { vraag: v.id, antwoord: x, denkfout: f.code, poging });
    const fz = foutZinnen(l, f, poging, eerder).filter(Boolean);
    log(l, "reactie", { soort: `fout${poging}`, vraag: v.id, x, denkfout: f.code, zin: fz.join(" ") });
    /* Het vinkje gaat van de kaart (geen rood op de keuze, 5.3). */
    zet(l, { kaarten: null });
    if (poging === 1) {
      /* 1e fout: de koekjes gaan in rijen van 10 liggen (draaiboek §6: het beeld laat het verschil zien), met de hint. */
      o = opgaveVan(v, kaarten, 10);
      toonBeeld(l, o);
      await zegDoor(l, ...fz);
      zinnen = ZIN.drieOpnieuw;
      eerder = f;
      continue;
    }
    /* 2e fout (15.11): uitleg, dan samen tellen; het kind tikt de kaart met het grootste getal. */
    await zegDoor(l, ...fz, ZIN.samen);
    await samenKaarten(l, v, kaarten, o);
    return noteer(l, v.id, "samen");
  }
  return noteer(l, v.id, "samen");
}

/* ---------- de les ---------- */

const gouden: Lesdraaiboek = {
  id: "squla-meer-minder-evenveel2-1-gouden",
  titel: "De meeste",
  /* Begint met "Squla": dan kleurt het lesscherm de getallen in Bliepo's tekst (data-squla; geleerd bij Tellen). */
  synthesis: "Squla groep 3 · Meer, minder, evenveel · Meer, minder, evenveel 2 · level 1 · gouden les (nieuwe versie van squla-meer-minder-evenveel2-1) · verloop draaiboek Meer-minder (More or Less)",
  indeling: "synthesis",
  browserstem: true,
  /* BOUWREGELS 15.27: zinnen van 1 stuk onder elkaar, pijl rechts als snelkoppeling, een tik stopt de stem. */
  pijlZoalsSynthesis: true,
  /* Bliepo praat zijn zinnen helemaal uit (15.27 punt 5; lib/stem.ts heelUitpraten). */
  stemHeelUitpraten: true,
  /* Elk woord licht op als Bliepo het zegt, ook met de browserstem (BOUWREGELS 3.7, 10 nov 2026; lib/stem.ts woordenMee). */
  woordenMeeMetStem: true,
  kaarttekening: KaartMeerMinder,
  nacht: true,
  voorwerpen: MM_VOORWERPEN,
  async speel(l) {
    STAAT.delete(l);
    log(l, "start");
    /* Stap 1. Openen: de kralen van vraag 1 staan er; Bliepo groet en zegt in hetzelfde stuk wat we gaan doen. */
    l.vlak<GoudenMMProps>(GoudenMMVlak, { opgave: opgaveVan(VRAGEN[0]), vooraf: VOORAF });
    await l.wacht(600);
    st(l).naamKeer = 1;
    st(l).naamVraag = 0;
    await zegDoor(l, NAAM_GROET, ZIN.begin);

    /* De 15 vragen van squla-meer-minder-evenveel2-1. */
    for (const [i, v] of VRAGEN.entries()) {
      st(l).laatste = i === VRAGEN.length - 1;
      /* Af en toe een overgangszin (BLIEPO-KARAKTER.md §12); meestal niet, het tempo gaat voor. */
      if (i === 12) await zegDoor(l, kies(l, OVERGANG));
      if (v.soort === "tel") await telVraag(l, v, i);
      else await drieVraag(l, v);
    }

    /* Stap 8. Einde: slotzin, kaart, eindzin uit het rijtje en wat het kind met de kaart doet (geen pijl). */
    zet(l, { ...LEEG, opgave: null });
    await zegDoor(l, ZIN.slot);
    log(l, "kaart");
    l.verderWeg?.();
    const tik = l.kaart();
    speelLesgeluid("kaart");
    await zeg(l, `${veelFouten(l) ? EINDE_VEEL_FOUTEN : kies(l, EINDE)} ${ZIN.kaartTik}`);
    await tik;
  },
};

export const LESSEN_SQULA_MEER_MINDER_GOUDEN: Lesdraaiboek[] = [gouden];
