/**
 * Lessen "Rekenmix" naar Squla groep 3 Rekenen (31 oktober 2026, opdracht
 * eigenaar). Vier oefeningen met elk vier levels: per level één les. Elke les
 * volgt hoe dat Squla-level is opgebouwd (dezelfde soorten vragen in dezelfde
 * volgorde, dezelfde getallenreeks), met eigen getallen, eigen zinnen en eigen
 * tekeningen. De analyse staat in SQULA-ANALYSE/rekenmix-*-volledig.md.
 *
 *   Rekenmix 1 (12517)   squla-rekenmix-mix1-1..4   tellen · vormen · links/rechts · ordenen
 *   Rekenmix 2 (15728)   squla-rekenmix-mix2-1..4   meer/minder · in/op/voor · kleur+vorm · verbinden
 *   Rekenmix 3 (12505)   squla-rekenmix-mix3-1..4   klein-kleiner-kleinst · eerste/tweede · ervoor/erna · splitsen
 *   Rekenmix 4 (12435)   squla-rekenmix-mix4-1..4   tellen · op volgorde · welke kaart · meer dan/minder dan
 *
 * Squla gebruikt bij twee oefeningen figuren uit een bestaand kinderboek en
 * een bestaande strip; die gebruiken we niet (ook niet de naam of het idee).
 * Dieren zijn dingen geworden die logisch bij de vraag passen (zie de
 * aantekening per les). Geen mensen, geen kaders.
 *
 * De hulp is de vaste hulp van Bliepo (squla-hulp.ts). Wat Squla bij een fout
 * uitlegt (samen tellen, tellen in sprongen van 2, "links is de eerste,
 * rechts de laatste", "steeds minder") is de basis van Bliepo's uitleg, in
 * eigen woorden en in beeld (oplichten, samen tellen, getallen erbij).
 *
 * Alles in de hologramstijl, in Phaser (HARDE REGEL 7), nacht.
 */

import { bevestig, krijgtVervolgvraag, zetSynthesisHulp } from "./squla-uitleg";
import type { Lesdraaiboek, Lesgids } from "../soort";
import { squlaBegin, squlaEind, squlaVraag } from "./squla-hulp";
import { LABELKLEUR } from "../vlakken/squla-rekenmix-tekenen";
import { voorwerpKleurbaar } from "../voorwerpen";
import { meng, mengSleutel } from "./squla-meng";
import { KaartRekenmix, SqulaRekenmix, type RMKleur, type RMLabel, type RMOpgave, type RMProps, type RMStuk, type RMTekening, type RMVorm } from "../vlakken/squla-rekenmix-vlak";

/* =====================================================================
   Voorwerpen en kleuren
   ===================================================================== */

/** Een ding om te tellen: de naam van het vaste plaatje, het meervoud, en de kleur van het getal in de zin. */
type Vw = { naam: string; meer: string; k: string };
const vw = (naam: string, meer: string, k: string): Vw => ({ naam, meer, k });
/** Herstel 7 november: de bovenkant (punten) van de rij grote antwoordknoppen in het midden (Kiesinstel `midden`). */
const MIDDEN_RM = 572;

const APPEL = vw("appel", "appels", "rood");
const BAL = vw("bal", "ballen", "rood");
const POTLOOD = vw("potlood", "potloden", "groen");
const AUTO = vw("speelgoedauto", "auto's", "rood");
const BLOEM = vw("bloem", "bloemen", "rood");
const KNIKKER = vw("knikker", "knikkers", "blauw");
const STER = vw("ster", "sterren", "geel");
const KOEKJE = vw("koekje", "koekjes", "bruin");
const AARDBEI = vw("aardbei", "aardbeien", "rood");
const KRAAL = vw("kraal", "kralen", "paars");
const RAKET = vw("raketje", "raketjes", "rood");
const PLANEET = vw("planeet", "planeten", "paars");
const BOOM = vw("boom", "bomen", "groen");
const UFO = vw("ufo", "ufo's", "paars");
const SATELLIET = vw("satelliet", "satellieten", "groen");
const KNOOP = vw("knoop", "knopen", "blauw");

/** "1 knikker" en "3 knikkers" (BOUWREGELS 14.2): bij één het enkelvoud. */
const aantalNaam = (n: number, v: Vw) => (n === 1 ? `1 ${v.naam === "speelgoedauto" ? "auto" : v.naam}` : `${n} ${v.meer}`);

/** Hoe Bliepo een ding noemt: "de fiets" en "De fiets". */
const NAAM: Record<string, string> = {
  fiets: "de fiets",
  speelgoedauto: "de auto",
  bus: "de bus",
  treintje: "de trein",
  bootje: "de boot",
  skateboard: "het skateboard",
  raketje: "het raketje",
  ufo: "de ufo",
  satelliet: "de satelliet",
  planeet: "de planeet",
  komeet: "de komeet",
  bal: "de bal",
  vlieger: "de vlieger",
  ballon: "de ballon",
  pion: "de pion",
};
const Hoofd = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const g = (n: number, k: string) => `{${n}:${k}}`;
const w = (n: number) => g(n, "wit");

/* =====================================================================
   Tekeningen (in punten, ten opzichte van het midden)
   ===================================================================== */

/** Een groep om te tellen, met de telstappen (per stap welke stukken, en waar het getal komt). */
type Stap = { idx: number[]; lx: number; ly: number };
/** `kleuren`: per telstap de kleur (naam) van het groepje waar die stap bij hoort (BOUWREGELS 2.1); zonder: de kleur van het voorwerp. */
type Groep = { tek: RMTekening; stappen: Stap[]; n: number; kleuren?: string[] };

/** Speelgoed en dingen worden helemaal paars en oranje; fruit en eten houden hun echte kleur en krijgen een getalkleur die erbij past (rode en groene appels). */
const groepKleuren = (naam: string): [string, string] => (voorwerpKleurbaar(naam) ? [GROEP_A, GROEP_B] : ["rood", "groen"]);

/** De twee groepjes bij "samen" en splitsen: elk hun eigen kleur, in de zin, in de getallen en als ring om de voorwerpen. */
const GROEP_A = "paars";
const GROEP_B = "oranje";

const ding = (naam: string, x: number, y: number, m: number, extra: Partial<Extract<RMStuk, { t: "vw" }>> = {}): RMStuk => ({ t: "vw", naam, x, y, m, ...extra });

/** Rijen voorwerpen, links uitgelijnd; elke rij is een telstap (het getal komt achter de rij). */
function rijen(naam: string, lengtes: number[], cel = 104): Groep {
  /* Herstel ronde 2 (7 nov, keuring C mix1-1): potloden waren klein en dun in een vierkant vakje. Een potlood is lang en
     smal: hoge rijen en dicht naast elkaar, zodat ze groot en goed telbaar zijn. */
  if (naam === "potlood") return potloodRijen(lengtes, cel);
  const kol = Math.max(...lengtes);
  const b = kol * cel;
  const h = lengtes.length * cel;
  const stukken: RMStuk[] = [];
  const stappen: Stap[] = [];
  lengtes.forEach((len, r) => {
    const idx: number[] = [];
    for (let i = 0; i < len; i++) {
      idx.push(stukken.length);
      stukken.push(ding(naam, -b / 2 + (i + 0.5) * cel, -h / 2 + (r + 0.5) * cel, cel * 0.86));
    }
    stappen.push({ idx, lx: -b / 2 + len * cel + cel * 0.6, ly: -h / 2 + (r + 0.5) * cel });
  });
  return { tek: { stukken, b: b + cel * 2.4, h: h + 10 }, stappen, n: stukken.length };
}

/** In rijen van 5 (de laatste rij is het restje). */
const rijenVan5 = (n: number) => Array.from({ length: Math.ceil(n / 5) }, (_, r) => Math.min(5, n - r * 5));

/** Paren naast elkaar (twee onder elkaar): tellen in sprongen van 2. */
function paren(naam: string, n: number, cel = 96): Groep {
  if (naam === "potlood") return potloodParen(n, cel);
  const p = n / 2;
  const stap = cel * 1.45;
  const b = (p - 1) * stap + cel;
  const stukken: RMStuk[] = [];
  const stappen: Stap[] = [];
  for (let i = 0; i < p; i++) {
    const x = -b / 2 + cel / 2 + i * stap;
    stappen.push({ idx: [stukken.length, stukken.length + 1], lx: x, ly: -cel * 1.25 });
    stukken.push(ding(naam, x, -cel / 2, cel * 0.86), ding(naam, x, cel / 2, cel * 0.86));
  }
  return { tek: { stukken, b: b + 20, h: cel * 3 }, stappen, n };
}

/** Potloden in rijen: hoog (lang potlood) en dicht naast elkaar (herstel ronde 2, mix1-1). */
function potloodRijen(lengtes: number[], cel: number): Groep {
  const m = cel * 1.6;
  const dx = cel * 0.68;
  const dy = m * 1.06;
  const kol = Math.max(...lengtes);
  const b = kol * dx;
  const h = lengtes.length * dy;
  const stukken: RMStuk[] = [];
  const stappen: Stap[] = [];
  lengtes.forEach((len, r) => {
    const idx: number[] = [];
    for (let i = 0; i < len; i++) {
      idx.push(stukken.length);
      stukken.push(ding("potlood", -b / 2 + (i + 0.5) * dx, -h / 2 + (r + 0.5) * dy, m));
    }
    stappen.push({ idx, lx: -b / 2 + len * dx + cel * 0.6, ly: -h / 2 + (r + 0.5) * dy });
  });
  return { tek: { stukken, b: b + cel * 2.4, h: h + 10 }, stappen, n: stukken.length };
}

/** Potloden per 2 onder elkaar (tellen in sprongen van 2): lang, groot en dicht bij elkaar (herstel ronde 2, mix1-1). */
function potloodParen(n: number, cel: number): Groep {
  const p = n / 2;
  const m = cel * 1.6;
  const stap = cel * 0.95;
  const b = (p - 1) * stap;
  const dy = m * 0.53;
  const stukken: RMStuk[] = [];
  const stappen: Stap[] = [];
  for (let i = 0; i < p; i++) {
    const x = -b / 2 + i * stap;
    stappen.push({ idx: [stukken.length, stukken.length + 1], lx: x, ly: -dy - m / 2 - 26 });
    stukken.push(ding("potlood", x, -dy, m), ding("potlood", x, dy, m));
  }
  return { tek: { stukken, b: b + cel + 20, h: dy * 2 + m + 60 }, stappen, n };
}

/** Een eenvoudige rekenmachine voor vaste "willekeur": steeds dezelfde plaatjes bij dezelfde vraag. */
function rng(zaad: number) {
  let s = zaad * 9301 + 49297;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/**
 * Los door elkaar, maar nooit over elkaar: elk ding krijgt een eigen vakje in
 * een raster (willekeurig gekozen, met een klein beetje speling). Meer soorten
 * kan ook (een druk plaatje); alleen de eerste soort telt mee.
 */
function los(soorten: { naam: string; n: number }[], zaad: number, b = 760, h = 560, cel = 124): Groep {
  const kol = Math.floor(b / cel);
  const rij = Math.floor(h / cel);
  const r = rng(zaad);
  const cellen = Array.from({ length: kol * rij }, (_, i) => i).sort(() => r() - 0.5);
  const totaal = soorten.reduce((t, x) => t + x.n, 0);
  if (totaal > cellen.length) throw new Error(`los(): ${totaal} dingen passen niet in ${cellen.length} vakjes`);
  const stukken: RMStuk[] = [];
  const doel: { i: number; x: number; y: number }[] = [];
  let c = 0;
  for (const [si, s] of soorten.entries())
    for (let k = 0; k < s.n; k++) {
      const cel_ = cellen[c++];
      const x = -b / 2 + ((cel_ % kol) + 0.5 + (r() - 0.5) * 0.24) * (b / kol);
      const y = -h / 2 + (Math.floor(cel_ / kol) + 0.5 + (r() - 0.5) * 0.24) * (h / rij);
      if (si === 0) doel.push({ i: stukken.length, x, y });
      stukken.push(ding(s.naam, x, y, cel * 0.78));
    }
  /* Samen tellen in leesvolgorde: van boven naar beneden, van links naar rechts. */
  doel.sort((a, z) => (Math.abs(a.y - z.y) > cel * 0.5 ? a.y - z.y : a.x - z.x));
  const stappen = doel.map((d) => ({ idx: [d.i], lx: d.x, ly: d.y - cel * 0.55 }));
  return { tek: { stukken, b, h: h + 40 }, stappen, n: doel.length };
}

/** Twee groepjes: boven en onder (samen tellen), elk met een eigen kleur. */
function tweeGroepen(naam: string, a: number, b: number, cel = 110): Groep {
  const stukken: RMStuk[] = [];
  const stappen: Stap[] = [];
  const kleuren: string[] = [];
  const kol = Math.max(a, b);
  const breed = kol * cel;
  [a, b].forEach((n, r) => {
    const y = r === 0 ? -cel * 0.85 : cel * 0.85;
    for (let i = 0; i < n; i++) {
      const x = -breed / 2 + (i + 0.5) * cel;
      stappen.push({ idx: [stukken.length], lx: x, ly: y - cel * 0.6 });
      const kn = groepKleuren(naam)[r];
      kleuren.push(kn);
      stukken.push(ding(naam, x, y, cel * 0.84, { ring: LABELKLEUR[kn] }));
    }
  });
  return { tek: { stukken, b: breed + 40, h: cel * 3 }, stappen, n: a + b, kleuren };
}

/** Een kaartje met een groep in rijen van 5 (voor op volgorde, verbinden en "welke kaart"). */
function kaartGroep(naam: string, lengtes: number[], cel = 46): Groep {
  const kol = Math.max(...lengtes);
  const b = kol * cel;
  /* Smalle dingen (een raketje, een potlood) zijn hoger dan breed: ze krijgen een hogere rij, anders worden het streepjes (BOUWREGELS 14.23). */
  const smal = naam === "raketje" || naam === "potlood";
  const stap = smal ? cel * 1.4 : cel;
  const m = smal ? cel * 1.5 : cel * 0.86;
  const h = lengtes.length * stap;
  const stukken: RMStuk[] = [];
  lengtes.forEach((len, r) => {
    for (let i = 0; i < len; i++) stukken.push(ding(naam, -b / 2 + (i + 0.5) * cel, -h / 2 + (r + 0.5) * stap, m));
  });
  const n = stukken.length;
  return { tek: { stukken, b: b + 16, h: h + 16 }, stappen: [{ idx: stukken.map((_, i) => i), lx: 0, ly: -h / 2 - 34 }], n };
}

/**
 * Een groepje dat het kaartje goed vult (BOUWREGELS 14.23: groot genoeg, de ruimte gebruikt): een rooster dat bij het
 * aantal past, met zo groot mogelijke voorwerpen. Potloden staan rechtop in twee rijen, zoals ze in een beker staan
 * (een potlood is lang en smal; in een vierkant vakje werd het een streepje).
 */
function kaartRaster(naam: string, n: number, maxB = 244, maxH = 284, maxCel = 88): Groep {
  const stukken: RMStuk[] = [];
  let b: number;
  let h: number;
  if (naam === "potlood") {
    const kol = Math.ceil(n / 2);
    const rijen = n > kol ? 2 : 1;
    const bw = Math.min(46, maxB / kol);
    const m = Math.min(140, maxH / rijen);
    for (let i = 0; i < n; i++) {
      const r = Math.floor(i / kol);
      const k = i % kol;
      const inRij = r === 0 ? Math.min(kol, n) : n - kol;
      stukken.push(ding(naam, (k - (inRij - 1) / 2) * bw, (r - (rijen - 1) / 2) * m * 0.96, m));
    }
    b = kol * bw + 16;
    h = rijen * m * 0.96 + 16;
  } else {
    const kol = Math.min(n, Math.ceil(Math.sqrt(n * 1.2)));
    const rijen = Math.ceil(n / kol);
    const cel = Math.min(maxCel, maxB / kol, maxH / rijen);
    for (let i = 0; i < n; i++) {
      const r = Math.floor(i / kol);
      const k = i % kol;
      const inRij = r === rijen - 1 ? n - kol * (rijen - 1) : kol;
      stukken.push(ding(naam, (k - (inRij - 1) / 2) * cel, (r - (rijen - 1) / 2) * cel, cel * 0.9));
    }
    b = kol * cel + 16;
    h = rijen * cel + 16;
  }
  return { tek: { stukken, b, h }, stappen: [{ idx: stukken.map((_, i) => i), lx: 0, ly: -h / 2 - 34 }], n };
}

/** Een kaartje met een losse groep (door elkaar). */
function kaartLos(naam: string, n: number, zaad: number, b = 260, h = 190, cel = 62): Groep {
  const gr = los([{ naam, n }], zaad, b, h, cel);
  return { tek: gr.tek, stappen: [{ idx: gr.stappen.map((s) => s.idx[0]), lx: 0, ly: -h / 2 - 30 }], n };
}

/** Eén groot ding. */
const eenDing = (naam: string, m = 290): RMTekening => ({ stukken: [ding(naam, 0, 0, m)], b: m + 20, h: m + 20 });

/** Een getaltegel. */
const tegel = (n: number, m = 130): RMTekening => ({ stukken: [{ t: "tegel", n, x: 0, y: 0, m }], b: m + 16, h: m + 16 });

/** Een platte vorm. */
const vorm = (v: RMVorm, k: RMKleur, m = 180): RMTekening => ({ stukken: [{ t: "vorm", vorm: v, kleur: k, x: 0, y: 0, m }], b: m + 20, h: m + 20 });

/** Dingen naast elkaar in een rij. */
function rijDingen(namen: string[], m: number, stap: number): RMTekening {
  const b = (namen.length - 1) * stap + m;
  return { stukken: namen.map((n, i) => ding(n, -b / 2 + m / 2 + i * stap, 0, m)), b: b + 20, h: m + 60 };
}

/* =====================================================================
   Het draaiboek: stand en hulpjes
   ===================================================================== */

type Stand = { huidig: string; keer: number; ronde: number; handGezien: boolean; verbindGezien: boolean; gezien: Set<string>; labels: RMLabel[] };

const zet = (l: Lesgids, p: Partial<RMProps>) => l.pasVlakAan<RMProps>(p);

/** Herstel 7 november (BOUWREGELS 1.23): de plek van de keuzes (vast per vraag binnen een les-start). */
function metPlek(o: RMOpgave): RMOpgave {
  return o.soort === "kijk" && o.keuzes && o.keuzes.length > 1 && !o.plek ? { ...o, plek: mengSleutel(o.id, o.keuzes.map((_, i) => i)) } : o;
}

function toonOpgave(l: Lesgids, st: Stand, o: RMOpgave, test: number[] | null = null) {
  if (st.huidig === o.id) return;
  st.huidig = o.id;
  /* Herstel 7 november (BOUWREGELS 1.23): bij tikken op een plaatje wisselt de plek van de keuzes per les-start (vast per
     vraag), behalve waar de plek zelf de vraag is (een rij waarin je direct tikt: `plek` staat dan al vast). */
  o = metPlek(o);
  st.labels = [];
  zet(l, { opgave: o, licht: null, labels: null, goed: null, fout: null, plekGoed: null, uitslag: null, hand: false, actief: false, test });
}

function zetLabels(l: Lesgids, st: Stand, labels: RMLabel[]) {
  st.labels = labels;
  zet(l, { labels: [...labels] });
}

async function tikKeuze(l: Lesgids): Promise<number> {
  zet(l, { actief: true });
  const x = await l.wachtOpVlak<{ soort: string; i: number }>("keuze");
  zet(l, { actief: false });
  return x.i;
}

async function sleepOpVolgorde(l: Lesgids, st: Stand): Promise<number[]> {
  /* De getallen bij de kaarten (van samen tellen) gaan weg; de woordjes bij de plekjes blijven. */
  zetLabels(
    l,
    st,
    st.labels.filter((lb) => lb.deel[0] === "s"),
  );
  zet(l, { ronde: ++st.ronde, plekGoed: null, actief: true, hand: !st.handGezien });
  const x = await l.wachtOpVlak<{ soort: string; rij: number[] }>("volgorde");
  st.handGezien = true;
  zet(l, { actief: false, hand: false });
  return x.rij;
}

async function trekLijnen(l: Lesgids, st: Stand): Promise<number[]> {
  zet(l, { actief: true, hand: !st.verbindGezien });
  const x = await l.wachtOpVlak<{ soort: string; paren: number[] }>("verbind");
  st.verbindGezien = true;
  zet(l, { actief: false, hand: false });
  return x.paren;
}

/**
 * Samen tellen in één tekening: wat geteld is licht op, de rest is dof, en
 * het getal tot dan toe komt erbij. `tot` = tot welke stap (zonder: tot het
 * eind). Geeft het getal tot waar geteld is.
 */
async function telMee(l: Lesgids, st: Stand, deel: string, gr: Groep, k: string, tot = gr.stappen.length): Promise<number> {
  const aan: number[] = [];
  const labels = [...st.labels];
  let n = 0;
  const losse = gr.stappen.every((s) => s.idx.length === 1);
  const reeks: string[] = [];
  for (let s = 0; s < tot; s++) {
    const stap = gr.stappen[s];
    /* Het getal heeft de kleur van het groepje waar de stap bij hoort, anders van het voorwerp (BOUWREGELS 2.1 en 2.2). */
    const kn = gr.kleuren?.[s] ?? k;
    aan.push(...stap.idx);
    n += stap.idx.length;
    labels.push({ deel, x: stap.lx, y: stap.ly, tekst: String(n), klein: stap.idx.length === 1, kleur: LABELKLEUR[kn] });
    zet(l, { licht: { deel, aan: [...aan] } });
    zetLabels(l, st, labels);
    if (losse) {
      reeks.push(g(n, kn));
      await l.wacht(320);
    } else await l.zeg(`${g(n, kn)}.`);
  }
  if (losse && reeks.length) await l.zeg(`${reeks.join(", ")}.`);
  return n;
}

/** Elke kaart in één keer tellen: het getal komt boven de kaart. */
async function kaartenTellen(l: Lesgids, st: Stand, delen: string[], groepen: Groep[], k: string, zin: (n: number, i: number) => string) {
  const labels = [...st.labels];
  for (let i = 0; i < delen.length; i++) {
    const gr = groepen[i];
    zet(l, { licht: { deel: delen[i], aan: gr.stappen[0].idx } });
    await l.wacht(350);
    labels.push({ deel: delen[i], x: gr.stappen[0].lx, y: gr.stappen[0].ly, tekst: String(gr.n), kleur: LABELKLEUR[k] });
    zetLabels(l, st, labels);
    await l.zeg(zin(gr.n, i));
  }
  zet(l, { licht: null });
}

/* =====================================================================
   Vragen
   ===================================================================== */

/** "dikdun" = "van dik naar dun" (Rekenmix 4); de rest zijn de drie trappen (klein, kleiner, kleinst). */
type Maatwoord = "klein" | "dik" | "groot" | "dun" | "laag" | "dikdun";
type Plekwoord = "in" | "op" | "voor" | "naast" | "achter";
type Vormnaam = "cirkel" | "driehoek" | "vierkant" | "rechthoek";
type Kleurnaam = "rood" | "geel" | "blauw" | "groen" | "paars" | "oranje";
type Verhaal = "taart" | "brood" | "spies" | "ijs";

type Vraag =
  /** Tel en kies het getal bij Bliepo. `soort`: gewoon, een druk plaatje (alleen één soort tellen), of twee groepjes samen. */
  | { t: "tel"; v: Vw; gr: Groep; keuzes: number[]; soort: "tel" | "druk" | "samen"; delen?: [number, number] }
  /** Welke vorm lijkt op dit ding? */
  | { t: "vorm"; naam: string; zin: string; lijkt?: "lijken"; vorm: Vormnaam; keuzes: Vormnaam[] }
  /** Wat staat er links, rechts of in het midden? */
  | { t: "plaats"; rij: string[]; keuzes: string[]; wat: "links" | "rechts" | "midden" }
  /** Wat staat als eerste, tweede … of laatste in de rij? (0 = eerste, 4 = laatste) */
  | { t: "rang"; rij: string[]; keuzes: string[]; plek: number }
  /** Kaarten met groepjes op volgorde. */
  | { t: "ordenAantal"; v: Vw; aantallen: number[]; richting: "op" | "af" }
  /** Eén ding in drie maten op volgorde (klein, kleiner, kleinst …). */
  | { t: "ordenMaat"; woord: Maatwoord; naam: string; maten: number[] }
  /** Getallen op volgorde: verder tellen (met het eerste getal al neergezet) of van hoog naar laag op raketjes. */
  | { t: "ordenGetal"; getallen: number[]; vast?: number; raketjes?: boolean; richting: "op" | "af" }
  /** Wat gebeurt eerst, en daarna? */
  | { t: "gebeuren"; verhaal: Verhaal; kaarten: number[] }
  /** Meer, minder, evenveel kaas (of fruit). Met `voorbeeld` bovenaan: meer/minder/evenveel; zonder: de meeste/minste. */
  | { t: "hoeveel"; ding: "boterham" | "spies"; keuzes: number[]; wat: "meer" | "minder" | "evenveel" | "meest" | "minst"; beleg?: Beleg }
  /** Waar ligt de bal? */
  | { t: "waar"; plek: Plekwoord; keuzes: Plekwoord[]; kant?: 1 | -1 }
  /** Waar zie je een rode cirkel? */
  | { t: "kleurvorm"; kleur: Kleurnaam; vorm: Vormnaam; keuzes: [Kleurnaam, Vormnaam][] }
  /** Waar zie je 7 blokjes? (bovenaan 5, onderaan de rest) */
  | { t: "blokjes"; n: number; keuzes: number[] }
  /** Verbinden: links groepjes, rechts getallen of groepjes. */
  | { t: "verbind"; links: Groep[]; rechts: (Groep | number)[]; vl: Vw; vr?: Vw }
  /** Welk getal komt net voor / na? Kiezen, of typen bij een plaatje. */
  | { t: "buur"; n: number; richting: "voor" | "na"; keuzes?: number[]; plaatje?: { v: Vw; gr: Groep } }
  /** Splitsen: hoeveel zitten er in de doos (zak)? */
  | { t: "splits"; v: Vw; houder: "doos" | "zak"; tot: number; buiten: number; keuzes: number[] }
  /** Welke kaart: precies n, meer dan n, minder dan n, of evenveel als bovenaan. */
  | { t: "welke"; v: Vw; groepen: Groep[]; vraagt: "is" | "meer" | "minder" | "evenveel"; n: number; voorbeeld?: Groep }
  /** Welke kleur heeft de laatste (middelste) ballon? */
  | { t: "kleurrij"; rij: Kleurnaam[]; wat: "laatste" | "middelste"; keuzes: Kleurnaam[] };

type Antw = number | number[] | string | null;

/** Alles wat squlaVraag nodig heeft, plus wat de korte uitleg gebruikt. */
type Aanpak = {
  o: RMOpgave;
  test?: number[] | null;
  /** Wat Bliepo de eerste keer bij deze soort vraag zegt. */
  soort: string;
  eerste: string[];
  vraag: string[];
  antwoord: () => Promise<Antw>;
  isGoed: (x: Antw) => boolean;
  noem: (x: Antw) => string;
  goedBeeld: () => void;
  goedZin: string[];
  fout?: (x: Antw) => void;
  /** De uitleg; `alles` = bij de korte uitleg aan het begin (dan mag Bliepo tot het eind gaan). */
  samen: (alles: boolean) => Promise<void>;
  tip: string[];
  testAntwoord: string | number;
  /** Eerste fout bij de hulp van Synthesis (BOUWREGELS 5.10): wat koos het kind, en wat deed het waarschijnlijk? */
  reactie: (x: Antw) => string[];
  /** Tweede fout: het goede antwoord in beeld. Zonder: het goede antwoord licht op (`goedBeeld`). */
  toonAntwoord?: () => Promise<void>;
};

/** Een hint zonder vraag: het kind probeert meteen opnieuw, dus Bliepo stelt de vraag niet nog eens (BOUWREGELS 3.23). */
const zonderVraag = (zinnen: string[]) => zinnen.filter((z) => !z.trim().endsWith("?"));
/** Haalt het uitroepje aan het begin weg ("Goed geteld! Het zijn er 5." wordt "Het zijn er 5."). */
const zonderJa = (zinnen: string[]) => zinnen.map((z) => z.replace(/^[^!.?]{2,28}!\s*/, "")).filter(Boolean);

/** Een volgorde laten zien: de kaarten gaan terug en lichten één voor één op, op de goede volgorde. */
async function toonVolgorde(l: Lesgids, st: Stand, goed: number[], zin: (p: number, i: number) => string) {
  zet(l, { ronde: ++st.ronde, plekGoed: null, actief: false });
  await l.wacht(300);
  for (let p = 0; p < goed.length; p++) {
    zet(l, { licht: { deel: `k${goed[p]}`, aan: [0], dof: false } });
    await l.zeg(zin(p, goed[p]));
  }
  zet(l, { licht: null });
}

/** Hoeveel staan er op de goede plek? Voor de reactie bij een volgorde. */
const opPlek = (x: Antw, goed: number[]) => (x as number[]).filter((i, p) => i === goed[p]).length;
const plekReactie = (x: Antw, goed: number[], tip: string[]): string[] => {
  const n = opPlek(x, goed);
  return [n === 0 ? "Geen enkel kaartje ligt al op de goede plek." : n === 1 ? "1 kaartje ligt al op de goede plek." : `${n} kaartjes liggen al op de goede plek.`, ...zonderVraag(tip)];
};

const KLEUR_RM: Record<Kleurnaam, RMKleur> = { rood: "rood", geel: "geel", blauw: "blauw", groen: "groen", paars: "paars", oranje: "oranje" };
/** "rode", "gele" … (vóór een de-woord); bij het-woord vierkant zonder -e. */
const BIJV: Record<Kleurnaam, string> = { rood: "rode", geel: "gele", blauw: "blauwe", groen: "groene", paars: "paarse", oranje: "oranje" };
const eenKleurVorm = (k: Kleurnaam, v: Vormnaam) => (v === "vierkant" ? `een ${k} vierkant` : `een ${BIJV[k]} ${v}`);

const VORM_UITLEG: Record<Vormnaam, string[]> = {
  cirkel: ["Een cirkel is helemaal rond.", "Hij heeft geen hoeken."],
  driehoek: ["Een driehoek heeft 3 hoeken.", "En 3 rechte kanten."],
  vierkant: ["Een vierkant heeft 4 hoeken.", "Alle kanten zijn even lang."],
  rechthoek: ["Een rechthoek heeft ook 4 hoeken.", "2 kanten zijn lang, 2 zijn kort."],
};

/** Waar de hoeken van een vorm zitten (om ze te tellen), in een vak van m. */
function hoeken(v: Vormnaam, m: number): { x: number; y: number }[] {
  if (v === "driehoek") return [{ x: 0, y: -0.37 * m }, { x: 0.43 * m, y: 0.41 * m }, { x: -0.43 * m, y: 0.41 * m }];
  if (v === "vierkant") return [{ x: -0.38 * m, y: -0.38 * m }, { x: 0.38 * m, y: -0.38 * m }, { x: 0.38 * m, y: 0.38 * m }, { x: -0.38 * m, y: 0.38 * m }];
  if (v === "rechthoek") return [{ x: -0.45 * m, y: -0.25 * m }, { x: 0.45 * m, y: -0.25 * m }, { x: 0.45 * m, y: 0.25 * m }, { x: -0.45 * m, y: 0.25 * m }];
  return [];
}

/** De vormen één voor één: wat voor vorm is het, en tel de hoeken. */
async function vormenUitleggen(l: Lesgids, st: Stand, vormen: Vormnaam[], m: number) {
  for (const [i, v] of vormen.entries()) {
    const deel = `k${i}`;
    zet(l, { licht: { deel, aan: [0], dof: false } });
    await l.zeg(VORM_UITLEG[v][0]);
    const hk = hoeken(v, m);
    if (hk.length) {
      const labels = [...st.labels];
      for (const [j, p] of hk.entries()) {
        labels.push({ deel, x: p.x * 1.18, y: p.y * 1.18, tekst: String(j + 1), klein: true });
        zetLabels(l, st, labels);
        await l.wacht(380);
      }
    }
    await l.zeg(VORM_UITLEG[v][1]);
  }
  zet(l, { licht: null });
}

/* ---------- maten (ordenen) ---------- */

const MAATWOORDEN: Record<Maatwoord, [string, string, string]> = {
  klein: ["klein", "kleiner", "kleinst"],
  dik: ["dik", "dikker", "dikst"],
  groot: ["groot", "groter", "grootst"],
  dun: ["dun", "dunner", "dunst"],
  laag: ["laag", "lager", "laagst"],
  dikdun: ["dik", "", "dun"],
};
/** Het laatste plekje: de aller…ste. */
const ALLER: Record<Maatwoord, string> = { klein: "allerkleinste", dik: "allerdikste", groot: "allergrootste", dun: "allerdunste", laag: "allerlaagste", dikdun: "allerdunste" };
/** Loopt de maat op (dik, groot) of af (klein, dun, laag)? */
const OPLOPEND: Record<Maatwoord, boolean> = { klein: false, dik: true, groot: true, dun: false, laag: false, dikdun: false };

/** De blokken van de toren in mix3-1, van onder naar boven. */
const BLOKKLEUR = ["blok-maat-rood", "blok-maat-blauw", "blok-maat-groen", "blok-maat-paars"];

/** Een kaart met één ding in een maat: `schaal` (klein/groot), `breed` (dik/dun), of een toren van blokken (laag). */
function maatKaart(woord: Maatwoord, naam: string, maat: number): RMTekening {
  const B = 230;
  const H = 250;
  if (woord === "laag" && naam === "blok-maat") {
    /* Ronde 4 (7 november 2026): een toren van losse blokken recht van voren (Magnific, stijl B), elk blok staat precies op
       het blok eronder. Van onder naar boven altijd rood, blauw, groen, paars: de kleur zegt dus niets over het antwoord. */
    /* Even hoog als de oude toren van 4: zo blijft het woord erboven (laag, lager, laagst) vrij. */
    const m = 66;
    const zicht = m * 0.865; /* hoe hoog het blok zelf is (zonder de lege rand van het plaatje) */
    const stap = zicht - 2;
    const Hl = H + 40;
    const stukken = Array.from({ length: maat }, (_, k) => ding(BLOKKLEUR[k % BLOKKLEUR.length], 0, Hl / 2 - 10 - zicht / 2 - k * stap, m));
    return { stukken, b: B, h: Hl };
  }
  if ((woord === "dik" || woord === "dun") && naam === "kaars-maat") {
    /* Ronde 4: alleen de kaars wordt breder of smaller; het vlammetje is een los plaatje en blijft overal even groot. */
    const m = 210;
    const romp = m * 0.865; /* de hoogte van de kaars in beeld */
    const y = 24;
    return { stukken: [ding(naam, 0, y, m, { sx: maat }), ding("vlammetje", 0, y - romp / 2 - 14, 40)], b: B, h: H };
  }
  if (woord === "laag") {
    /* De blokken staan echt op elkaar (BOUWREGELS 14.23): elk blok staat met zijn onderkant op de voorkant van het blok eronder. */
    const m = 88;
    const stap = m * 0.58;
    const Hl = H + 40;
    const stukken = Array.from({ length: maat }, (_, k) => ding(naam, 0, Hl / 2 - 8 - m * 0.43 - k * stap, m));
    return { stukken, b: B, h: Hl };
  }
  if (woord === "dik" || woord === "dun" || woord === "dikdun") return { stukken: [ding(naam, 0, 6, 220, { sx: maat })], b: B, h: H };
  const m = 230 * maat;
  return { stukken: [ding(naam, 0, H / 2 - 8 - m * 0.47, m)], b: B, h: H };
}

/* ---------- verhaaltjes (volgorde van gebeuren) ---------- */

const VERHAAL: Record<Verhaal, { namen: [string, string, string]; zinnen: [string, string, string] }> = {
  taart: { namen: ["beslagkom", "oven-taart", "taart"], zinnen: ["Eerst maak je beslag in een kom.", "Dan bakt de taart in de oven.", "En dan is de taart klaar."] },
  brood: { namen: ["deegkom", "oven-brood", "brood"], zinnen: ["Eerst maak je deeg in een kom.", "Dan bakt het brood in de oven.", "En dan is het brood klaar."] },
  spies: { namen: ["spies-leeg", "spies-twee", "spies-vol"], zinnen: ["Eerst is het spiesje nog leeg.", "Dan prik je er 2 stukjes fruit op.", "En dan zit het spiesje vol."] },
  ijs: { namen: ["hoorntje", "ijsje", "ijsje-twee-bollen"], zinnen: ["Eerst heb je een leeg hoorntje.", "Dan komt er een bolletje ijs op.", "En dan nog een bolletje erbij."] },
};

/* ---------- hoeveelheden (kaas, fruit) ---------- */

const HOEVEEL = {
  boterham: { namen: ["boterham-weinig-kaas", "boterham-veel-kaas", "boterham-heel-veel-kaas"], ding: "boterham", wat: "kaas", lw: "de", welk: "welke boterham", het: "de" },
  spies: { namen: ["spies-leeg", "spies-twee", "spies-vol"], ding: "spiesje", wat: "fruit", lw: "het", welk: "welk spiesje", het: "het" },
} as const;

/* Ronde 4 (Sara, 7 november 2026): niet steeds dezelfde 3 boterhammen. Andere boterhammen met 1, 3 of 6 plakjes
   (wit brood met banaan of tomaat, bruin brood met komkommer of ei). Zelfde vraag, zelfde antwoorden. */
type Beleg = "banaan" | "komkommer" | "tomaat" | "ei";
const belegVan = (b: Beleg) =>
  ({ namen: [`boterham-${b}-weinig`, `boterham-${b}-veel`, `boterham-${b}-heel-veel`], ding: "boterham", wat: b, lw: b === "ei" ? "het" : "de", welk: "welke boterham", het: "de" }) as const;
const BELEG: Record<Beleg, ReturnType<typeof belegVan>> = { banaan: belegVan("banaan"), komkommer: belegVan("komkommer"), tomaat: belegVan("tomaat"), ei: belegVan("ei") };

/* ---------- waar ligt de bal? ---------- */

const PLEKZIN: Record<Plekwoord, string> = { in: "in de doos", op: "op de doos", voor: "voor de doos", naast: "naast de doos", achter: "achter de doos" };
const PLEKUITLEG: Record<Plekwoord, string> = {
  in: "In: de bal zit binnen in de doos. Je ziet alleen de bovenkant.",
  op: "Op: de bal ligt bovenop de doos.",
  voor: "Voor: de bal ligt vooraan. Je ziet de hele bal.",
  naast: "Naast: de bal ligt ernaast, op de grond.",
  achter: "Achter: de doos staat ervoor. Je ziet maar een stukje bal.",
};

/** De doos en de bal (de doos is open als de bal erin zit). */
function waarTekening(plek: Plekwoord, kant: 1 | -1 = 1): RMTekening {
  const doos = ding(plek === "in" ? "doos-open" : "doos", 0, 40, 260);
  let stukken: RMStuk[];
  if (plek === "in") stukken = [doos, ding("bal", 0, 16, 100, { snij: 0.52 })];
  else if (plek === "op") stukken = [doos, ding("bal", 0, -88, 100)];
  else if (plek === "naast") stukken = [doos, ding("bal", kant * 210, 82, 100)];
  else if (plek === "voor") stukken = [doos, ding("bal", kant * 30, 120, 120)];
  /* Herstel 7 november (OVERZICHT-C mix2-2): achter de doos zag je maar een randje; nu steekt een duidelijke halve bal erboven uit. */
  else stukken = [ding("bal", kant * 84, -74, 112), doos];
  return { stukken, b: 640, h: 400 };
}

/* ---------- splitsen ---------- */

function splitsTekening(v: Vw, houder: "doos" | "zak", tot: number, buiten: number): Groep {
  const stukken: RMStuk[] = [
    { t: "lijn", x1: -270, y1: -200, x2: -350, y2: -90 },
    { t: "lijn", x1: -270, y1: -200, x2: -190, y2: -90 },
    { t: "rondje", tekst: String(tot), x: -270, y: -200, r: 46 },
    { t: "rondje", tekst: String(buiten), x: -350, y: -90, r: 40, kleur: LABELKLEUR[GROEP_A] },
    { t: "rondje", tekst: "?", x: -190, y: -90, r: 40, licht: true, kleur: LABELKLEUR[GROEP_B] },
    ding(houder, 230, 110, 280, { ring: LABELKLEUR[GROEP_B] }),
  ];
  const stappen: Stap[] = [];
  const cel = 84;
  const lengtes = rijenVan5(buiten);
  lengtes.forEach((len, r) => {
    for (let i = 0; i < len; i++) {
      const x = -400 + (i + 0.5) * cel;
      const y = 150 + (r - (lengtes.length - 1) / 2) * cel;
      stappen.push({ idx: [stukken.length], lx: x, ly: y - cel * 0.58 });
      stukken.push(ding(v.naam, x, y, cel * 0.84, { ring: LABELKLEUR[GROEP_A] }));
    }
  });
  return { tek: { stukken, b: 900, h: 560 }, stappen, n: buiten, kleuren: stappen.map(() => GROEP_A) };
}

/* ---------- getallen voor en na ---------- */

/** De vraag in beeld: een getaltegel met een vraagteken ervoor of erna. */
function buurTekening(n: number, richting: "voor" | "na"): RMTekening {
  const t: RMStuk = { t: "tegel", n, x: richting === "voor" ? 90 : -90, y: 0, m: 150 };
  const vraag: RMStuk = { t: "rondje", tekst: "?", x: richting === "voor" ? -90 : 90, y: 0, r: 62, licht: true };
  return { stukken: [vraag, t], b: 380, h: 200 };
}

/** De telrij 1 t/m 10 (bij de hulp). */
const TELRIJ: RMTekening = { stukken: Array.from({ length: 10 }, (_, i) => ({ t: "tegel" as const, n: i + 1, x: -405 + i * 90, y: 0, m: 82 })), b: 900, h: 140 };

/* =====================================================================
   Elke soort vraag
   ===================================================================== */

function aanpak(l: Lesgids, st: Stand, id: string, q: Vraag): Aanpak {
  /* Herstel 7 november (OVERZICHT-C punt 4, BOUWREGELS 1.23): de getallen groot in het midden onder de tekening, en het goede
     getal niet steeds op dezelfde plek (alleen de plek wisselt). De tekening bovenaan maakt daarvoor ruimte (`ruimteOnder`). */
  const kiesGetal = (keuzes: number[]) => async () => Number(await l.kies(meng(keuzes).map(String), { weetniet: false, direct: true, midden: MIDDEN_RM }));

  /* ---------- tellen ---------- */
  if (q.t === "tel") {
    const o: RMOpgave = { id, soort: "kijk", boven: q.gr.tek, ruimteOnder: true };
    const n = q.gr.n;
    const k = q.v.k;
    const sprongen = q.gr.stappen.every((s) => s.idx.length === 2);
    const rijtjes = !sprongen && q.gr.stappen.some((s) => s.idx.length > 2);
    const vraag =
      q.soort === "samen" ? [`Hoeveel ${q.v.meer} zijn het samen?`] : q.soort === "druk" ? [`Tel alleen de ${q.v.meer}.`, "Hoeveel zijn het er?"] : [`Tel de ${q.v.meer}.`, "Hoeveel zijn het er?"];
    /* Waar Bliepo stopt met samen tellen: bij rijen en sprongen voor de laatste stap, bij losse dingen voor de laatste twee. */
    const stop = rijtjes || sprongen ? Math.max(1, q.gr.stappen.length - 1) : Math.max(1, q.gr.stappen.length - 2);
    const begin = q.gr.stappen.slice(0, stop).reduce((t, s) => t + s.idx.length, 0);
    /* Bij twee groepjes samen: elk groepje zijn eigen kleur, het totaal wit (BOUWREGELS 2.1). */
    const kBegin = q.gr.kleuren?.[stop - 1] ?? k;
    const kTot = q.gr.kleuren ? "wit" : k;
    return {
      o,
      soort: `tel-${q.soort}`,
      reactie: (x) => {
        const c = x as number;
        const hint = sprongen ? [`Begin bij ${g(begin, kBegin)}.`, "Tel er steeds 2 bij."] : [`Begin bij ${g(begin, kBegin)}.`, "Tel daarna door tot het laatste."];
        if (q.soort === "samen" && q.delen && (c === q.delen[0] || c === q.delen[1])) return [`${g(c, kTot)} is maar 1 groepje.`, "Tel beide groepjes samen."];
        if (c === n + 1 || c === n - 1) return [c > n ? `Je koos ${g(c, kTot)}: dat is er 1 te veel.` : `Bij ${g(c, kTot)} mist er nog 1.`, ...hint];
        if (q.soort === "druk" && c > n) return [`Je koos ${g(c, kTot)}: dat zijn er te veel.`, `Tel alleen de ${q.v.meer}.`];
        return [c > n ? `Je koos ${g(c, kTot)}: zoveel ${q.v.meer} zijn het niet.` : `Je koos ${g(c, kTot)}: er zijn meer ${q.v.meer}.`, ...hint];
      },
      eerste: [],
      vraag,
      antwoord: kiesGetal(q.keuzes),
      isGoed: (x) => x === n,
      noem: (x) => g(x as number, kTot),
      goedBeeld: () => zet(l, { goed: { deel: "b", keer: ++st.keer }, licht: null }),
      goedZin: q.soort === "samen" && q.delen ? [`Goed samengeteld! ${g(q.delen[0], q.gr.kleuren?.[0] ?? GROEP_A)} en ${g(q.delen[1], q.gr.kleuren?.[q.gr.kleuren.length - 1] ?? GROEP_B)} is samen ${g(n, "wit")}.`] : [`Goed geteld! Het zijn er ${g(n, k)}.`],
      samen: async (alles) => {
        if (sprongen) await l.zeg("We tellen in sprongen van 2.");
        else if (rijtjes) await l.zeg("We tellen samen, rij voor rij.");
        else await l.zeg(q.soort === "druk" ? `We tellen alleen de ${q.v.meer}.` : "Tel maar mee.");
        const tot = await telMee(l, st, "b", q.gr, k, alles ? q.gr.stappen.length : stop);
        if (alles) await l.zeg(`Het zijn er ${g(tot, kTot)}.`);
        else if (!krijgtVervolgvraag(l)) await l.zeg(`Tel jij verder vanaf ${g(tot, kBegin)}?`);
      },
      tip: sprongen ? [`Start bij het groepje met ${g(begin, kBegin)}.`, "Tel er steeds 2 bij."] : [`Tel verder na ${g(begin, kBegin)}.`, "Tel daarna door tot het laatste."],
      testAntwoord: n,
    };
  }

  /* ---------- welke vorm lijkt erop? ---------- */
  if (q.t === "vorm") {
    const o: RMOpgave = { id, soort: "kijk", boven: eenDing(q.naam, 290), keuzes: q.keuzes.map((v) => vorm(v, "licht", 170)), namen: q.keuzes.map((v) => `Een ${v}`) };
    const goedI = q.keuzes.indexOf(q.vorm);
    const lijkt = q.lijkt ?? "lijkt";
    return {
      o,
      soort: "vorm",
      reactie: (x) => {
        const v = q.keuzes[x as number];
        return [VORM_UITLEG[v][0], `Kijk of dat ook zo is bij ${q.zin}.`];
      },
      eerste: ["Kijk goed naar het plaatje bovenaan.", "Tik dan op een vorm."],
      vraag: [`Kijk naar ${q.zin}.`, "Welke vorm lijkt erop?"],
      antwoord: () => tikKeuze(l),
      isGoed: (x) => x === goedI,
      noem: (x) => `Een ${q.keuzes[x as number]}`,
      goedBeeld: () => zet(l, { goed: { deel: `k${goedI}`, keer: ++st.keer } }),
      goedZin: [`Mooi gezien! ${Hoofd(q.zin)} ${lijkt} op een ${q.vorm}.`, VORM_UITLEG[q.vorm][0]],
      fout: (x) => zet(l, { fout: { deel: `k${x as number}`, keer: ++st.keer } }),
      samen: async (alles) => {
        await l.zeg("We kijken samen naar de vormen.");
        await vormenUitleggen(l, st, q.keuzes, 170);
        if (alles) return;
        if (!krijgtVervolgvraag(l)) await l.zeg(`Zoek de vorm die op ${q.zin} lijkt.`);
      },
      tip: ["Kijk of het rond is of hoeken heeft.", "Tel de hoeken maar."],
      testAntwoord: `keuze-${goedI}`,
    };
  }

  /* Ronde 7 (7 nov, Sara 1.25): de antwoordkeuzes (ook de foute, die niet in de rij staan) en Bliepo's zinnen erover staan weer terug.
     Bovenaan de rij (de vraag), eronder de keuzes in zachte vakken; de plek van de keuzes wisselt (metPlek, 1.23). */
  /* ---------- links, rechts, midden ---------- */
  if (q.t === "plaats") {
    const o: RMOpgave = { id, soort: "kijk", boven: rijDingen(q.rij, 210, 270), keuzes: q.keuzes.map((n) => eenDing(n, 190)), namen: q.keuzes.map((n) => Hoofd(NAAM[n])), vakken: true };
    const plek = q.wat === "links" ? 0 : q.wat === "rechts" ? 2 : 1;
    const goedNaam = q.rij[plek];
    const goedI = q.keuzes.indexOf(goedNaam);
    const waar = q.wat === "midden" ? "in het midden" : q.wat;
    const UITLEG = {
      links: "Links staat de eerste van de rij.",
      rechts: "Rechts staat de laatste van de rij.",
      midden: "In het midden staat hij tussen de andere 2 in.",
    } as const;
    return {
      o,
      soort: "plaats",
      reactie: (x) => {
        const naam = q.keuzes[x as number];
        const pos = q.rij.indexOf(naam);
        const waarStaat = pos === 0 ? "links" : pos === 1 ? "in het midden" : pos === 2 ? "rechts" : "";
        return [waarStaat ? `${Hoofd(NAAM[naam])} staat ${waarStaat}.` : `${Hoofd(NAAM[naam])} staat niet in de rij.`, `Kijk wat er ${waar} staat.`];
      },
      eerste: ["Kijk naar de rij bovenaan.", "Tik dan op het goede plaatje."],
      vraag: ["Kijk naar de rij.", `Wat staat er ${waar}?`],
      antwoord: () => tikKeuze(l),
      isGoed: (x) => x === goedI,
      noem: (x) => Hoofd(NAAM[q.keuzes[x as number]]),
      goedBeeld: () => zet(l, { goed: { deel: `k${goedI}`, keer: ++st.keer }, licht: { deel: "b", aan: [plek] } }),
      goedZin: [`Goed gekeken! ${Hoofd(NAAM[goedNaam])} staat ${waar}.`, UITLEG[q.wat]],
      fout: (x) => zet(l, { fout: { deel: `k${x as number}`, keer: ++st.keer } }),
      samen: async (alles) => {
        await l.zeg("We kijken van links naar rechts.");
        const uitleg: ["links" | "rechts" | "midden", number][] = [
          ["links", 0],
          ["midden", 1],
          ["rechts", 2],
        ];
        /* Bliepo wijst de andere twee plekken aan; de gevraagde plek zegt hij alleen. */
        for (const [wat, p] of uitleg) {
          if (wat === q.wat && !alles) continue;
          zet(l, { licht: { deel: "b", aan: [p] } });
          zetLabels(l, st, [...st.labels, { deel: "b", x: -270 + p * 270, y: 150, tekst: wat === "midden" ? "midden" : wat, klein: true }]);
          await l.zeg(`${Hoofd(NAAM[q.rij[p]])} staat ${wat === "midden" ? "in het midden" : wat}.`);
        }
        zet(l, { licht: null });
        if (!alles) await l.zeg(UITLEG[q.wat]);
      },
      tip: [q.wat === "links" ? "Links begint de rij." : q.wat === "rechts" ? "Rechts houdt de rij op." : "In het midden staat er links en rechts iets naast."],
      testAntwoord: `keuze-${goedI}`,
    };
  }

  /* ---------- eerste, tweede … laatste ---------- */
  if (q.t === "rang") {
    const o: RMOpgave = { id, soort: "kijk", boven: rijDingen(q.rij, 150, 185), keuzes: q.keuzes.map((n) => eenDing(n, 150)), namen: q.keuzes.map((n) => Hoofd(NAAM[n])), vakken: true };
    const RANG = ["eerste", "tweede", "derde", "vierde", "laatste"];
    const goedNaam = q.rij[q.plek];
    const goedI = q.keuzes.indexOf(goedNaam);
    const rang = RANG[q.plek];
    return {
      o,
      soort: "rang",
      reactie: (x) => {
        const naam = q.keuzes[x as number];
        const pos = q.rij.indexOf(naam);
        return [pos >= 0 ? `${Hoofd(NAAM[naam])} staat als ${RANG[pos]} in de rij.` : `${Hoofd(NAAM[naam])} staat niet in de rij.`, q.plek === 4 ? "De laatste staat helemaal rechts." : "Tel vanaf links, tot je bij de goede plek bent."];
      },
      eerste: ["Kijk naar de rij bovenaan.", "We tellen vanaf links.", "Tik dan op het goede plaatje."],
      vraag: [`Wat staat als ${rang} in de rij?`],
      antwoord: () => tikKeuze(l),
      isGoed: (x) => x === goedI,
      noem: (x) => Hoofd(NAAM[q.keuzes[x as number]]),
      goedBeeld: () => zet(l, { goed: { deel: `k${goedI}`, keer: ++st.keer }, licht: { deel: "b", aan: [q.plek] } }),
      goedZin: [`Dat klopt! ${Hoofd(NAAM[goedNaam])} staat als ${rang}.`, q.plek === 4 ? "Helemaal achteraan in de rij." : q.plek === 0 ? "Helemaal vooraan in de rij." : `Tel maar: ${RANG.slice(0, q.plek + 1).join(", ")}.`],
      fout: (x) => zet(l, { fout: { deel: `k${x as number}`, keer: ++st.keer } }),
      samen: async (alles) => {
        if (q.plek === 0 && !alles) {
          await l.zeg(...(krijgtVervolgvraag(l) ? [] : ["We tellen vanaf links."]), "De eerste staat helemaal vooraan, links.");
          return;
        }
        await l.zeg("We tellen samen vanaf links.");
        const tot = alles ? 5 : q.plek === 4 ? 4 : q.plek;
        const labels = [...st.labels];
        const aan: number[] = [];
        for (let p = 0; p < tot; p++) {
          aan.push(p);
          zet(l, { licht: { deel: "b", aan: [...aan] } });
          labels.push({ deel: "b", x: -370 + p * 185, y: 104, tekst: String(p + 1), klein: true });
          zetLabels(l, st, labels);
          await l.zeg(`${Hoofd(RANG[p === 4 ? 4 : p])}.`);
        }
        if (!alles && (q.plek === 4 || !krijgtVervolgvraag(l))) await l.zeg(q.plek === 4 ? "De laatste staat helemaal achteraan." : `Welke komt daarna, als ${rang}?`);
      },
      tip: q.plek === 4 ? ["De laatste staat helemaal rechts."] : ["Tel vanaf links: eerste, tweede, derde."],
      testAntwoord: `keuze-${goedI}`,
    };
  }

  /* ---------- groepjes op volgorde ---------- */
  if (q.t === "ordenAantal") {
    /* Herstel 7 november (OVERZICHT-C mix1-4): het grootste groepje had kleinere dingen dan de kleine groepjes (8 kleine
       koekjes naast 3 grote). Nu zijn alle dingen in deze vraag even groot: de maat van het grootste groepje geldt voor allemaal. */
    const nMax = Math.max(...q.aantallen);
    const kolMax = Math.min(nMax, Math.ceil(Math.sqrt(nMax * 1.2)));
    const celGelijk = Math.min(88, 244 / kolMax, 284 / Math.ceil(nMax / kolMax));
    const groepen = q.aantallen.map((n) => kaartRaster(q.v.naam, n, 244, 284, celGelijk));
    const o: RMOpgave = { id, soort: "volgorde", kaarten: groepen.map((x) => x.tek), namen: q.aantallen.map((n) => aantalNaam(n, q.v)) };
    const goed = q.aantallen.map((n, i) => ({ n, i })).sort((a, b) => (q.richting === "op" ? a.n - b.n : b.n - a.n)).map((x) => x.i);
    const k = q.v.k;
    const rij = goed.map((i) => g(q.aantallen[i], k)).join(", ");
    return {
      o,
      test: goed,
      soort: "orden",
      reactie: (x) => plekReactie(x, goed, [q.richting === "af" ? "Begin met de meeste." : "Begin met de minste."]),
      toonAntwoord: () => toonVolgorde(l, st, goed, (p, i) => (p === 0 ? `Eerst het groepje met ${g(q.aantallen[i], k)}.` : p === goed.length - 1 ? `En als laatste ${g(q.aantallen[i], k)}.` : `Dan ${g(q.aantallen[i], k)}.`)),
      eerste: ["Sleep de groepjes naar de plekjes.", "Het eerste plekje is links."],
      vraag: [`Hier liggen ${q.v.meer}.`, `Zet ze op volgorde, van ${q.richting === "af" ? "meer naar minder" : "minder naar meer"}.`],
      antwoord: () => sleepOpVolgorde(l, st),
      isGoed: (x) => (x as number[]).every((i, p) => i === goed[p]),
      noem: () => "Deze volgorde",
      goedBeeld: () => zet(l, { goed: { deel: "*", keer: ++st.keer } }),
      goedZin: [`Mooi op volgorde! ${rij}.`, q.richting === "af" ? "Het worden er steeds minder." : "Het worden er steeds meer."],
      fout: (x) => zet(l, { plekGoed: (x as number[]).map((i, p) => i === goed[p]) }),
      samen: async () => {
        zet(l, { ronde: ++st.ronde, plekGoed: null });
        await l.wacht(300);
        await l.zeg("We tellen elk groepje.");
        await kaartenTellen(l, st, groepen.map((_, i) => `k${i}`), groepen, k, (n) => `Hier zijn het er ${g(n, k)}.`);
        await l.zeg(q.richting === "af" ? "Het groepje met de meeste koekjes komt vooraan." : "De minste komt vooraan.");
      },
      tip: [q.richting === "af" ? "Begin met de meeste." : "Begin met de minste.", "Die zet je op het eerste plekje."],
      testAntwoord: `kaart-${goed[0]}`,
    };
  }

  /* ---------- klein, kleiner, kleinst ---------- */
  if (q.t === "ordenMaat") {
    const kaarten = q.maten.map((m) => maatKaart(q.woord, q.naam, m));
    /* Bij "klein" staat de kleinste links (Sara, 6 november 2026, optie B): de woorden blijven, de volgorde is omgedraaid: kleinst, kleiner, klein. */
    const kleinVoor = q.woord === "klein";
    const woorden: [string, string, string] = kleinVoor ? ["kleinst", "kleiner", "klein"] : MAATWOORDEN[q.woord];
    const o: RMOpgave = { id, soort: "volgorde", kaarten, namen: q.maten.map((_, i) => `Kaart ${i + 1}`) };
    const goed = q.maten.map((m, i) => ({ m, i })).sort((a, b) => (OPLOPEND[q.woord] || kleinVoor ? a.m - b.m : b.m - a.m)).map((x) => x.i);
    /* Waar de aller...ste staat: bij "klein" vooraan (links), anders achteraan. */
    const allerPlek = kleinVoor ? "vooraan" : "achteraan";
    const slotLabels = (): RMLabel[] => woorden.map((wd, p) => ({ deel: `s${p}`, x: 0, y: -150, tekst: wd, klein: true })).filter((lb) => lb.tekst);
    const dikDun = q.woord === "dikdun";
    return {
      o,
      test: goed,
      soort: "orden",
      reactie: (x) => plekReactie(x, goed, dikDun ? ["Begin met de allerdikste."] : [`Let eerst op de ${ALLER[q.woord]}.`]),
      toonAntwoord: async () => {
        zetLabels(l, st, slotLabels());
        await toonVolgorde(l, st, goed, (p) => (dikDun ? (p === 0 ? "Eerst de dikste." : p === goed.length - 1 ? "En als laatste de dunste." : "Dan de middelste.") : `${Hoofd(woorden[p])}.`));
      },
      eerste: ["Sleep de plaatjes naar de plekjes.", "Het eerste plekje is links."],
      vraag: dikDun ? ["Zet ze op volgorde, van dik naar dun."] : [`Zet op volgorde: ${woorden.join(", ")}.`],
      antwoord: () => sleepOpVolgorde(l, st),
      isGoed: (x) => (x as number[]).every((i, p) => i === goed[p]),
      noem: () => "Deze volgorde",
      goedBeeld: () => {
        zet(l, { goed: { deel: "*", keer: ++st.keer } });
        zetLabels(l, st, slotLabels());
      },
      goedZin: dikDun ? ["Goed gezet! Van dik naar dun.", "De dunste staat achteraan."] : [`Goed gezet! ${Hoofd(woorden.join(", "))}.`, `De ${ALLER[q.woord].replace("aller", "")} staat ${allerPlek}.`],
      fout: (x) => zet(l, { plekGoed: (x as number[]).map((i, p) => i === goed[p]) }),
      samen: async () => {
        zet(l, { ronde: ++st.ronde, plekGoed: null });
        zetLabels(l, st, slotLabels());
        if (dikDun) {
          await l.zeg("Dik is breed. Dun is smal.", "De dikste komt vooraan.", "De dunste komt achteraan.");
          return;
        }
        await l.zeg(`Kijk: ${woorden[0]}, ${woorden[1]}, ${woorden[2]}.`);
        await l.zeg(`${Hoofd(woorden[kleinVoor ? 0 : 2])} is de ${ALLER[q.woord]}.`, kleinVoor ? "Die gaat op het eerste plekje." : "Die gaat op het laatste plekje.");
        if (!krijgtVervolgvraag(l)) await l.zeg(kleinVoor ? "Kijk nu naar de 2 andere plaatjes. Welke hoort achteraan en welke in het midden?" : "Kijk nu naar de 2 andere plaatjes. Welke hoort vooraan en welke in het midden?");
      },
      tip: dikDun ? ["Begin met de allerdikste.", "Die zet je vooraan."] : [`Let eerst op de ${ALLER[q.woord]}.`, kleinVoor ? "Die zet je vooraan." : "Die zet je achteraan."],
      testAntwoord: `kaart-${goed[0]}`,
    };
  }

  /* ---------- getallen op volgorde ---------- */
  if (q.t === "ordenGetal") {
    const kaarten = q.getallen.map((n) =>
      q.raketjes ? { stukken: [ding("raketje", 0, -40, 170), { t: "tegel" as const, n, x: 0, y: 84, m: 92 }], b: 180, h: 250 } : tegel(n, 130),
    );
    const o: RMOpgave = { id, soort: "volgorde", kaarten, vast: q.vast !== undefined ? [tegel(q.vast, 130)] : undefined, namen: q.getallen.map(String) };
    const goed = q.getallen.map((n, i) => ({ n, i })).sort((a, b) => (q.richting === "op" ? a.n - b.n : b.n - a.n)).map((x) => x.i);
    const rij = [...(q.vast !== undefined ? [q.vast] : []), ...goed.map((i) => q.getallen[i])].map(w).join(", ");
    const telrij = q.vast !== undefined;
    return {
      o,
      test: goed,
      soort: "orden",
      reactie: (x) => {
        return telrij ? [...plekReactie(x, goed, []), `Na ${w(q.vast!)} komt het getal dat 1 meer is.`] : plekReactie(x, goed, ["Begin met het grootste getal."]);
      },
      toonAntwoord: () => toonVolgorde(l, st, goed, (p, i) => `${w(q.getallen[i])}.`),
      eerste: [telrij ? "Sleep de getallen naar de plekjes." : "Sleep de raketjes naar de plekjes.", "Het eerste plekje is links."],
      vraag: telrij ? [`We tellen verder vanaf ${w(q.vast!)}.`, "Zet de getallen op hun plek."] : ["Kijk naar de getallen.", "Zet ze op volgorde, van hoog naar laag."],
      antwoord: () => sleepOpVolgorde(l, st),
      isGoed: (x) => (x as number[]).every((i, p) => i === goed[p]),
      noem: () => "Deze volgorde",
      goedBeeld: () => zet(l, { goed: { deel: "*", keer: ++st.keer } }),
      goedZin: telrij ? [`De telrij klopt! ${rij}.`, "Steeds 1 verder."] : [`Mooi gelegd! ${rij}.`, "Van hoog naar laag."],
      fout: (x) => zet(l, { plekGoed: (x as number[]).map((i, p) => i === goed[p]) }),
      samen: async () => {
        zet(l, { ronde: ++st.ronde, plekGoed: null });
        if (telrij) {
          zet(l, { licht: { deel: "v0", aan: [0] } });
          await l.zeg(`Op het eerste plekje staat ${w(q.vast!)}.`, `Na ${w(q.vast!)} komt het getal dat 1 meer is.`, "Daarna weer 1 meer, en zo verder.");
          zet(l, { licht: null });
        } else {
          await l.zeg("Hoog is het grootste getal.", "Laag is het kleinste getal.");
          const klein = Math.min(...q.getallen);
          await l.zeg(`Tel maar mee: ${[0, 1, 2].map((d) => w(klein + d)).join(", ")}.`, "Het getal dat je het laatst zegt, is het hoogst.");
        }
      },
      tip: telrij ? [`Het getal na ${w(q.vast!)} is 1 meer.`, "Dat zet je op het lege plekje ernaast."] : ["Begin met het grootste getal.", "Dat zet je op het eerste plekje."],
      testAntwoord: `kaart-${goed[0]}`,
    };
  }

  /* ---------- wat gebeurt eerst? ---------- */
  if (q.t === "gebeuren") {
    const vh = VERHAAL[q.verhaal];
    const o: RMOpgave = { id, soort: "volgorde", kaarten: q.kaarten.map((i) => eenDing(vh.namen[i], 220)), namen: q.kaarten.map((i) => `Plaatje ${i + 1}`) };
    const goed = [0, 1, 2].map((stap) => q.kaarten.indexOf(stap));
    return {
      o,
      test: goed,
      soort: "orden",
      reactie: (x) => plekReactie(x, goed, ["Het plaatje van wat je als allereerste doet, zet je vooraan."]),
      toonAntwoord: () => toonVolgorde(l, st, goed, (p) => vh.zinnen[p]),
      eerste: ["Sleep de plaatjes naar de plekjes.", "Het eerste plekje is links."],
      vraag: ["Wat gebeurt eerst?", "En wat daarna?", "Zet de plaatjes op volgorde."],
      antwoord: () => sleepOpVolgorde(l, st),
      isGoed: (x) => (x as number[]).every((i, p) => i === goed[p]),
      noem: () => "Deze volgorde",
      goedBeeld: () => zet(l, { goed: { deel: "*", keer: ++st.keer } }),
      goedZin: ["Het verhaal klopt!", ...vh.zinnen],
      fout: (x) => zet(l, { plekGoed: (x as number[]).map((i, p) => i === goed[p]) }),
      samen: async () => {
        zet(l, { ronde: ++st.ronde, plekGoed: null });
        await l.zeg("Ik vertel het verhaal.", ...vh.zinnen);
      },
      tip: ["Denk aan wat je als allereerste doet.", "Dat plaatje zet je vooraan."],
      testAntwoord: `kaart-${goed[0]}`,
    };
  }

  /* ---------- meer, minder, evenveel kaas ---------- */
  if (q.t === "hoeveel") {
    const h = q.beleg ? BELEG[q.beleg] : HOEVEEL[q.ding];
    /* Bij plakjes (banaan, komkommer …) tel je de plakjes; bij kaas en fruit blijft de zin zoals hij was. */
    const telWat = q.beleg ? `plakjes ${h.wat}` : h.wat;
    const metVoorbeeld = q.wat === "meer" || q.wat === "minder" || q.wat === "evenveel";
    const o: RMOpgave = {
      id,
      soort: "kijk",
      boven: metVoorbeeld ? eenDing(h.namen[1], 280) : undefined,
      keuzes: q.keuzes.map((i) => eenDing(h.namen[i], metVoorbeeld ? 230 : 280)),
      namen: q.keuzes.map((i) => `${Hoofd(h.ding)} ${i + 1}`),
    };
    const doel = q.wat === "meer" || q.wat === "meest" ? 2 : q.wat === "minder" || q.wat === "minst" ? 0 : 1;
    const goedI = q.keuzes.indexOf(doel);
    const vraag = metVoorbeeld
      ? [`Kijk naar ${h.het} ${h.ding} bovenaan.`, `Op ${h.welk} zit ${q.wat} ${h.wat}?`]
      : [`Op ${h.welk} zit ${h.lw} ${q.wat === "meest" ? "meeste" : "minste"} ${h.wat}?`];
    const goedZin =
      q.wat === "evenveel"
        ? [`Goed vergeleken! Daar zit evenveel ${h.wat} op als bovenaan.`]
        : metVoorbeeld
          ? [`Goed vergeleken! Daar zit ${q.wat} ${h.wat} op dan bovenaan.`]
          : [`Goed uitgekozen! Daar zit ${h.lw} ${q.wat === "meest" ? "meeste" : "minste"} ${h.wat} op.`];
    const woordUitleg =
      q.wat === "meer"
        ? [`Kijk hoeveel ${h.wat} er bovenaan zit.`, `Zoek een plaatje dat voller is: daar zit meer ${h.wat} op.`]
        : q.wat === "minder"
          ? [`Kijk hoeveel ${h.wat} er bovenaan zit.`, `Zoek een plaatje dat leger is: daar zit minder ${h.wat} op.`]
          : q.wat === "evenveel"
            ? [`Evenveel ${h.wat}: precies zoveel als bovenaan.`, "Niet meer en niet minder."]
            : q.wat === "meest"
              ? [`Kijk hoeveel ${h.wat} er op elk plaatje zit.`, `Het plaatje dat het volst is, heeft ${h.lw} meeste ${h.wat}.`]
              : [`Kijk hoeveel ${h.wat} er op elk plaatje zit.`, `Het plaatje dat het leegst is, heeft ${h.lw} minste ${h.wat}.`];
    return {
      o,
      soort: metVoorbeeld ? "hoeveel-vb" : "hoeveel",
      reactie: (x) => {
        const c = q.keuzes[x as number];
        if (metVoorbeeld) return [c === 1 ? `Daar zit evenveel ${h.wat} op als bovenaan.` : c === 2 ? `Daar zit meer ${h.wat} op dan bovenaan.` : `Daar zit minder ${h.wat} op dan bovenaan.`, q.wat === "evenveel" ? "Zoek het plaatje dat er net zo vol uitziet als bovenaan." : q.wat === "meer" ? "Het plaatje dat je zoekt, is voller dan het plaatje bovenaan." : "Het plaatje dat je zoekt, is leger dan het plaatje bovenaan."];
        if (q.wat === "meest") return [c === 0 ? `Daar zit juist ${h.lw} minste ${h.wat} op.` : `Daar zit niet ${h.lw} meeste ${h.wat} op. Er is er nog 1 met meer.`, `Tel de ${telWat} op elk plaatje en kies het plaatje met ${h.lw} meeste ${h.wat}.`];
        return [c === 2 ? `Daar zit juist ${h.lw} meeste ${h.wat} op.` : `Daar zit niet ${h.lw} minste ${h.wat} op. Er is er nog 1 met minder.`, `Tel de ${telWat} op elk plaatje en kies het plaatje met ${h.lw} minste ${h.wat}.`];
      },
      eerste: metVoorbeeld ? [...(krijgtVervolgvraag(l) ? [] : ["Kijk eerst naar het plaatje bovenaan."]), "Tik dan op een plaatje eronder."] : ["Kijk goed naar de 3 plaatjes.", "Tik dan op het goede plaatje."],
      vraag,
      antwoord: () => tikKeuze(l),
      isGoed: (x) => x === goedI,
      noem: () => "Deze",
      goedBeeld: () => zet(l, { goed: { deel: `k${goedI}`, keer: ++st.keer } }),
      goedZin,
      fout: (x) => zet(l, { fout: { deel: `k${x as number}`, keer: ++st.keer } }),
      samen: async () => {
        if (metVoorbeeld) {
          zet(l, { licht: { deel: "b", aan: [0], dof: false } });
          await l.zeg(`Kijk eerst naar ${h.het} ${h.ding} bovenaan.`);
        }
        await l.zeg(...woordUitleg);
        await l.zeg(metVoorbeeld ? "Kijk steeds terug naar het bovenste plaatje. Kijk wat er anders is." : "Vergelijk de 3 plaatjes.");
        for (let i = 0; i < q.keuzes.length; i++) {
          zet(l, { licht: { deel: `k${i}`, aan: [0], dof: false } });
          await l.wacht(900);
        }
        zet(l, { licht: null });
      },
      tip:
        q.wat === "meer" || q.wat === "meest"
          ? [`Kijk op elk plaatje hoeveel ${h.wat} er zit.`, "Zoek het plaatje dat het volst is."]
          : q.wat === "minder" || q.wat === "minst"
            ? [`Kijk op elk plaatje hoeveel ${h.wat} er zit.`, "Zoek het plaatje dat het leegst is."]
            : ["Zoek het plaatje dat er net zo uitziet als bovenaan."],
      testAntwoord: `keuze-${goedI}`,
    };
  }

  /* ---------- waar ligt de bal? ---------- */
  if (q.t === "waar") {
    const o: RMOpgave = { id, soort: "kijk", boven: waarTekening(q.plek, q.kant), ruimteOnder: true };
    const opties = q.keuzes.map((p) => PLEKZIN[p]);
    const balI = q.plek === "achter" ? 0 : 1;
    return {
      o,
      soort: "waar",
      reactie: (x) => {
        const gekozen = q.keuzes.find((pk) => Hoofd(PLEKZIN[pk]) === x);
        return gekozen ? [`De bal ligt niet ${PLEKZIN[gekozen]}.`, Hoofd(PLEKUITLEG[gekozen].split(": ")[1]), "Kijk of de bal op het plaatje zo ligt."] : ["Kijk goed waar de bal ligt."];
      },
      eerste: [],
      vraag: ["Waar ligt de bal?"],
      antwoord: async () => await l.kies(meng(opties).map(Hoofd), { weetniet: false, direct: true, midden: MIDDEN_RM }),
      isGoed: (x) => x === Hoofd(PLEKZIN[q.plek]),
      noem: (x) => String(x),
      goedBeeld: () => zet(l, { goed: { deel: "b", keer: ++st.keer } }),
      goedZin: [`Die plek klopt! De bal ligt ${PLEKZIN[q.plek]}.`, Hoofd(PLEKUITLEG[q.plek].split(": ")[1])],
      samen: async (alles) => {
        zet(l, { licht: { deel: "b", aan: [balI] } });
        await l.zeg("Kijk goed naar de bal.", "Kijk of je de hele bal ziet of maar een stukje.");
        zet(l, { licht: null });
        for (const p of alles ? [q.plek] : q.keuzes) await l.zeg(PLEKUITLEG[p]);
      },
      tip: ["Kijk waar de bal is.", "Kijk of je de hele bal ziet of maar een stukje."],
      testAntwoord: Hoofd(PLEKZIN[q.plek]),
    };
  }

  /* ---------- kleur en vorm ---------- */
  if (q.t === "kleurvorm") {
    const o: RMOpgave = { id, soort: "kijk", keuzes: q.keuzes.map(([k, v]) => vorm(v, KLEUR_RM[k], 200)), namen: q.keuzes.map(([k, v]) => Hoofd(eenKleurVorm(k, v))) };
    const goedI = q.keuzes.findIndex(([k, v]) => k === q.kleur && v === q.vorm);
    return {
      o,
      soort: "kleurvorm",
      reactie: (x) => {
        const [kk, vv] = q.keuzes[x as number];
        const wat = Hoofd(eenKleurVorm(kk, vv));
        if (kk === q.kleur) return [`${wat}. De kleur klopt, maar de vorm niet.`, ...VORM_UITLEG[q.vorm].slice(0, 1)];
        if (vv === q.vorm) return [`${wat}. De vorm klopt, maar de kleur niet.`, `Kijk naar de vorm die ${q.kleur} is.`];
        return [`${wat}. Dat is niet de goede kleur en ook niet de goede vorm.`, `Begin met de vormen die ${q.kleur} zijn.`];
      },
      eerste: ["Tik op de goede vorm."],
      vraag: [`Waar zie je ${eenKleurVorm(q.kleur, q.vorm)}?`],
      antwoord: () => tikKeuze(l),
      isGoed: (x) => x === goedI,
      noem: (x) => Hoofd(eenKleurVorm(...q.keuzes[x as number])),
      goedBeeld: () => zet(l, { goed: { deel: `k${goedI}`, keer: ++st.keer } }),
      goedZin: [
        `Die vorm en kleur kloppen! ${Hoofd(eenKleurVorm(q.kleur, q.vorm))}.`,
        q.vorm === "cirkel"
          ? `Hij is ${q.kleur} en helemaal rond.`
          : q.vorm === "driehoek"
            ? `Hij is ${q.kleur} en heeft 3 hoeken.`
            : q.vorm === "vierkant"
              ? `Het is ${q.kleur} en alle kanten zijn even lang.`
              : `Hij is ${q.kleur}, met 2 lange en 2 korte kanten.`,
      ],
      fout: (x) => zet(l, { fout: { deel: `k${x as number}`, keer: ++st.keer } }),
      samen: async () => {
        await l.zeg("Eerst kijken we naar de kleur.");
        for (const [i, [k]] of q.keuzes.entries()) {
          zet(l, { licht: { deel: `k${i}`, aan: [0], dof: false } });
          await l.zeg(`Deze is ${k}.`);
        }
        zet(l, { licht: null });
        await l.zeg("Dan kijken we naar de vorm.", ...VORM_UITLEG[q.vorm]);
      },
      tip: [`Kijk eerst naar de vormen die ${q.kleur} zijn.`, `Daarvan is er 1 ${q.vorm}.`],
      testAntwoord: `keuze-${goedI}`,
    };
  }

  /* ---------- blokjes: bovenaan 5, onderaan de rest ---------- */
  if (q.t === "blokjes") {
    const cel = 54;
    const tek = (n: number): RMTekening => {
      const stukken: RMStuk[] = [];
      for (let r = 0; r < 2; r++) {
        const len = r === 0 ? 5 : n - 5;
        for (let i = 0; i < len; i++) stukken.push({ t: "vorm", vorm: "blokje", kleur: r === 0 ? GROEP_A : GROEP_B, x: -2.5 * cel + (i + 0.5) * cel - 30, y: (r - 0.5) * cel * 1.1, m: cel * 0.9 });
      }
      return { stukken, b: 5 * cel + 140, h: 2 * cel * 1.1 + 20 };
    };
    const o: RMOpgave = { id, soort: "kijk", keuzes: q.keuzes.map(tek), namen: q.keuzes.map((n) => `${n} blokjes`) };
    const goedI = q.keuzes.indexOf(q.n);
    return {
      o,
      soort: "blokjes",
      reactie: (x) => {
        const c = q.keuzes[x as number];
        return [`Op die groep zie je ${g(c, "wit")} blokjes.`, c > q.n ? `Er moesten ${g(q.n, "wit")} blokjes zijn, dat zijn er te veel.` : `Er moesten ${g(q.n, "wit")} blokjes zijn, dat zijn er te weinig.`, `De bovenste rij is vol met ${g(5, GROEP_A)}. Tel onderaan verder.`];
      },
      eerste: ["Tik op de goede groep."],
      vraag: [`Waar zie je ${g(q.n, "wit")} blokjes?`],
      antwoord: () => tikKeuze(l),
      isGoed: (x) => x === goedI,
      noem: () => "Deze",
      goedBeeld: () => zet(l, { goed: { deel: `k${goedI}`, keer: ++st.keer } }),
      goedZin: [`Zo is het! ${g(5, GROEP_A)} en ${g(q.n - 5, GROEP_B)} is ${g(q.n, "wit")}.`],
      fout: (x) => zet(l, { fout: { deel: `k${x as number}`, keer: ++st.keer } }),
      samen: async (alles) => {
        await l.zeg(`Bovenaan staan er altijd ${g(5, GROEP_A)}.`);
        zetLabels(
          l,
          st,
          q.keuzes.map((_, i) => ({ deel: `k${i}`, x: 2.5 * cel - 30 + 44, y: -0.55 * cel, tekst: "5", klein: true, kleur: LABELKLEUR[GROEP_A] })),
        );
        await l.wacht(400);
        await l.zeg(`Tel onderaan verder vanaf ${g(5, GROEP_A)}.`);
        if (alles) {
          const gi = goedI;
          const onder = q.n - 5;
          const reeks = Array.from({ length: onder }, (_, j) => g(6 + j, GROEP_B));
          zet(l, { licht: { deel: `k${gi}`, aan: Array.from({ length: onder }, (_, j) => 5 + j) } });
          await l.zeg(`${reeks.join(", ")}.`);
        }
      },
      tip: [`De bovenste rij heeft ${g(5, GROEP_A)} blokjes.`, "Tel onderaan verder."],
      testAntwoord: `keuze-${goedI}`,
    };
  }

  /* ---------- verbinden ---------- */
  if (q.t === "verbind") {
    const rechts = q.rechts.map((r) => (typeof r === "number" ? tegel(r, 120) : r.tek));
    const o: RMOpgave = { id, soort: "verbind", links: q.links.map((x) => x.tek), rechts };
    const nR = q.rechts.map((r) => (typeof r === "number" ? r : r.n));
    const goed = q.links.map((x) => nR.indexOf(x.n));
    const getallen = q.rechts.every((r) => typeof r === "number");
    return {
      o,
      test: goed,
      soort: "verbind",
      reactie: (x) => {
        const juist = (x as number[]).filter((r, i) => r === goed[i]).length;
        return [juist === 0 ? "Geen enkele lijn klopt nog." : juist === 1 ? "1 lijn klopt." : `${juist} lijnen kloppen.`, getallen ? "Kijk naar het getal bij elk groepje." : "Tel de groepjes en zoek de groepjes die even groot zijn."];
      },
      eerste: ["Verbind het groepje met het getal of plaatje dat erbij hoort. Trek een lijn tussen de stippen.", "Of tik links en dan rechts."],
      vraag: ["Wat hoort bij elkaar?", getallen ? "Verbind elk groepje met het goede getal." : "Verbind de groepjes die evenveel zijn."],
      antwoord: () => trekLijnen(l, st),
      isGoed: (x) => (x as number[]).every((r, i) => r === goed[i]),
      noem: () => "Deze lijnen",
      goedBeeld: () => zet(l, { uitslag: { goed: [true, true, true], keer: ++st.keer } }),
      goedZin: ["Mooi verbonden! Alles hoort bij elkaar.", getallen ? "Elk groepje heeft zijn getal." : "Steeds evenveel."],
      fout: (x) => zet(l, { uitslag: { goed: (x as number[]).map((r, i) => r === goed[i]), keer: ++st.keer } }),
      samen: async () => {
        await l.zeg("We tellen elk groepje.");
        const labels = [...st.labels];
        const tel = async (deel: string, gr: Groep, k: string, rechtsKant: boolean) => {
          zet(l, { licht: { deel, aan: gr.stappen[0].idx } });
          await l.wacht(350);
          labels.push({ deel, x: rechtsKant ? gr.tek.b / 2 + 34 : -gr.tek.b / 2 - 34, y: 0, tekst: String(gr.n), kleur: LABELKLEUR[k] });
          zetLabels(l, st, labels);
          await l.zeg(`${g(gr.n, k)}.`);
        };
        for (const [i, gr] of q.links.entries()) await tel(`l${i}`, gr, q.vl.k, false);
        if (!getallen) for (const [i, r] of q.rechts.entries()) if (typeof r !== "number") await tel(`r${i}`, r, (q.vr ?? q.vl).k, true);
        zet(l, { licht: null });
        if (!krijgtVervolgvraag(l)) await l.zeg(getallen ? "Zoek nu bij elk groepje hetzelfde getal." : "Zoek nu de groepjes met hetzelfde getal.");
      },
      tip: [getallen ? "Kijk naar het getal bij elk groepje." : "Verbind de groepjes die even groot zijn."],
      testAntwoord: "l-0",
    };
  }

  /* ---------- getal ervoor, getal erna ---------- */
  if (q.t === "buur") {
    const o: RMOpgave = { id, soort: "kijk", boven: q.plaatje ? q.plaatje.gr.tek : buurTekening(q.n, q.richting), ruimteOnder: !q.plaatje };
    const doel = q.richting === "voor" ? q.n - 1 : q.n + 1;
    const hulp: RMOpgave = { id: `${id}-hulp`, soort: "kijk", boven: TELRIJ };
    const vraag = q.plaatje
      ? [`Hier zijn ${g(q.n, q.plaatje.v.k)} ${q.plaatje.v.meer}.`, q.richting === "voor" ? `Welk getal komt net voor ${w(q.n)}?` : `Welk getal komt na ${w(q.n)}?`, "Typ het getal."]
      : [q.richting === "voor" ? `Welk getal komt net voor ${w(q.n)}?` : `Welk getal komt na ${w(q.n)}?`];
    return {
      o,
      soort: q.plaatje ? "buur-typ" : "buur",
      reactie: (x) => {
        const c = x as number | null;
        if (c === null) return [q.richting === "voor" ? `Typ het getal dat net voor ${w(q.n)} komt.` : `Typ het getal dat na ${w(q.n)} komt.`];
        if (c === q.n) return [`${w(c)} is het getal zelf.`, q.richting === "voor" ? "Kijk naar het getal er net voor." : "Kijk naar het getal er net na."];
        if (q.richting === "voor" && c === q.n + 1) return [`${w(c)} komt juist na ${w(q.n)}.`, "Het getal ervoor is 1 minder."];
        if (q.richting === "na" && c === q.n - 1) return [`${w(c)} komt juist voor ${w(q.n)}.`, "Het getal erna is 1 meer."];
        return [q.richting === "voor" ? `${w(c)} is niet 1 minder dan ${w(q.n)}.` : `${w(c)} is niet 1 meer dan ${w(q.n)}.`, q.richting === "voor" ? "Tel terug: 1 minder." : "Tel verder: 1 meer."];
      },
      eerste: [],
      vraag,
      antwoord: q.plaatje ? async () => await l.getal() : kiesGetal(q.keuzes ?? []),
      isGoed: (x) => x === doel,
      noem: (x) => (x === null ? "Niets" : w(x as number)),
      goedBeeld: () => zet(l, { goed: { deel: "b", keer: ++st.keer } }),
      goedZin: q.richting === "voor" ? [`Goed gedacht! ${w(doel)} komt net voor ${w(q.n)}.`, "1 minder."] : [`Goed gedacht! Na ${w(q.n)} komt ${w(doel)}.`, "1 meer."],
      samen: async (alles) => {
        /* De getallenrij blijft staan tot de vraag goed is (zie speelVraag). */
        st.huidig = hulp.id;
        st.labels = [];
        zet(l, { opgave: hulp, licht: null, labels: null });
        await l.wacht(500);
        await l.zeg("Kijk, de getallen op een rij.");
        zet(l, { licht: { deel: "b", aan: [q.n - 1] } });
        await l.zeg(`Hier staat ${w(q.n)}.`);
        await l.zeg(q.richting === "voor" ? `Net voor ${w(q.n)} staat het getal links ervan.` : `Na ${w(q.n)} komt het getal rechts ervan.`);
        if (alles) {
          zet(l, { licht: { deel: "b", aan: [q.n - 1, doel - 1] } });
          await l.zeg(`Dat is ${w(doel)}.`);
        }
      },
      tip: [q.richting === "voor" ? "Tel terug: 1 minder." : "Tel verder: 1 meer."],
      testAntwoord: doel,
    };
  }

  /* ---------- splitsen ---------- */
  if (q.t === "splits") {
    const gr = splitsTekening(q.v, q.houder, q.tot, q.buiten);
    const o: RMOpgave = { id, soort: "kijk", boven: gr.tek, ruimteOnder: true };
    const binnen = q.tot - q.buiten;
    const k = q.v.k;
    const waarin = q.houder === "doos" ? "in de doos" : "in de zak";
    return {
      o,
      soort: "splits",
      reactie: (x) => {
        const c = x as number;
        if (c === q.buiten) return [`${g(c, GROEP_A)} liggen er buiten.`, `Kijk wat er ${waarin} zit.`];
        return [`Buiten liggen er ${g(q.buiten, GROEP_A)}. ${g(q.buiten, GROEP_A)} en ${g(c, GROEP_B)} is samen ${g(q.buiten + c, "wit")}.`, `Dat moeten er ${g(q.tot, "wit")} zijn.`];
      },
      eerste: [],
      vraag: [`Er zijn ${g(q.tot, "wit")} ${q.v.meer}.`, `Hoeveel zitten er ${waarin}?`],
      antwoord: kiesGetal(q.keuzes),
      isGoed: (x) => x === binnen,
      noem: (x) => g(x as number, GROEP_B),
      goedBeeld: () => zet(l, { goed: { deel: "b", keer: ++st.keer } }),
      goedZin: [`Dat past! ${g(q.buiten, GROEP_A)} en ${g(binnen, GROEP_B)} is samen ${g(q.tot, "wit")}.`],
      samen: async (alles) => {
        await l.zeg(`Er zijn ${g(q.tot, "wit")} ${q.v.meer} in totaal.`, "Buiten zie je er een paar. Tel maar mee.");
        await telMee(l, st, "b", gr, k);
        zet(l, { licht: null });
        await l.zeg(`Buiten liggen er ${g(q.buiten, GROEP_A)}.`, `De rest zit ${waarin}.`, `Tel verder van ${g(q.buiten, GROEP_A)} tot ${g(q.tot, "wit")}.`);
        if (alles) {
          const reeks = Array.from({ length: binnen }, (_, j) => g(q.buiten + 1 + j, GROEP_B));
          await l.zeg(`${reeks.join(", ")}.`, `Dat zijn er ${g(binnen, GROEP_B)}.`);
        }
      },
      tip: [`Start bij de ${g(q.buiten, GROEP_A)} buiten en tel door tot ${g(q.tot, "wit")}.`, `Wat je erbij telt, zit ${waarin}.`],
      testAntwoord: binnen,
    };
  }

  /* ---------- welke kaart? ---------- */
  if (q.t === "welke") {
    const voorbeeld = q.vraagt === "evenveel" ? q.voorbeeld : undefined;
    /* Herstel 7 november (BOUWREGELS 1.22, OVERZICHT-C mix4-4): het losse ding bovenaan bij "meer dan / minder dan" deed
       niets en kon worden meegeteld; weg. */
    const hint: RMTekening | undefined = undefined;
    const o: RMOpgave = { id, soort: "kijk", boven: voorbeeld?.tek ?? hint, keuzes: q.groepen.map((x) => x.tek), namen: q.groepen.map((x) => aantalNaam(x.n, q.v)) };
    const goedI = q.groepen.findIndex((x) => (q.vraagt === "meer" ? x.n > q.n : q.vraagt === "minder" ? x.n < q.n : x.n === q.n));
    const k = q.v.k;
    const m = q.groepen[goedI].n;
    const vraag =
      q.vraagt === "is"
        ? [`Waar zie je ${g(q.n, k)} ${q.v.meer}?`]
        : q.vraagt === "meer"
          ? [`Waar zie je meer dan ${g(q.n, k)} ${q.v.meer}?`]
          : q.vraagt === "minder"
            ? [`Waar zie je minder dan ${g(q.n, k)} ${q.v.meer}?`]
            : [`Tel de ${q.v.meer} bovenaan.`, `Waar zie je evenveel ${q.v.meer}?`];
    const goedZin =
      q.vraagt === "is"
        ? [`Goed gevonden! Hier zijn er ${g(m, k)}.`]
        : q.vraagt === "evenveel"
          ? [`Goed gevonden! Hier zijn er ook ${g(m, k)}.`, "Dat is evenveel."]
          : [`Goed gevonden! Hier zijn er ${g(m, k)}.`, `Dat is ${q.vraagt} dan ${g(q.n, k)}.`];
    return {
      o,
      soort: `welke-${q.vraagt}`,
      reactie: (x) => {
        const c = q.groepen[x as number].n;
        if (q.vraagt === "is") return [`Daar zijn het er ${g(c, k)}.`, `Kijk waar ${g(q.n, k)} ${q.v.meer} zijn.`];
        if (q.vraagt === "evenveel") return [`Daar zijn het er ${g(c, k)}, bovenaan ${g(q.n, k)}.`, c > q.n ? "Dat is meer." : "Dat is minder."];
        if (q.vraagt === "meer") return [c === q.n ? `Daar zijn het er ${g(c, k)}. Dat is niet meer dan ${g(q.n, k)}.` : `${g(c, k)} is minder dan ${g(q.n, k)}.`, `Kijk waar meer dan ${g(q.n, k)} zijn.`];
        return [c === q.n ? `Daar zijn het er ${g(c, k)}. Dat is niet minder dan ${g(q.n, k)}.` : `${g(c, k)} is meer dan ${g(q.n, k)}.`, `Kijk waar minder dan ${g(q.n, k)} zijn.`];
      },
      eerste: ["Tik op de goede groep."],
      vraag,
      antwoord: () => tikKeuze(l),
      isGoed: (x) => x === goedI,
      noem: () => "Deze groep",
      goedBeeld: () => zet(l, { goed: { deel: `k${goedI}`, keer: ++st.keer } }),
      goedZin,
      fout: (x) => zet(l, { fout: { deel: `k${x as number}`, keer: ++st.keer } }),
      samen: async () => {
        if (q.vraagt === "meer") await l.zeg(`Meer dan ${g(q.n, k)} is ${g(q.n + 1, k)} of nog meer.`, `Precies ${g(q.n, k)} is niet meer dan ${g(q.n, k)}.`);
        if (q.vraagt === "minder") await l.zeg(`Minder dan ${g(q.n, k)} is ${g(q.n - 1, k)} of nog minder.`, `Precies ${g(q.n, k)} is niet minder dan ${g(q.n, k)}.`);
        if (voorbeeld) {
          await l.zeg("Eerst tellen we bovenaan.");
          await kaartenTellen(l, st, ["b"], [voorbeeld], k, (n) => `Bovenaan zijn het er ${g(n, k)}.`);
        }
        await l.zeg("We tellen elke groep.");
        await kaartenTellen(
          l,
          st,
          q.groepen.map((_, i) => `k${i}`),
          q.groepen,
          k,
          (n) => `Hier zijn het er ${g(n, k)}.`,
        );
      },
      tip:
        q.vraagt === "is"
          ? [`Zoek de groep met ${g(q.n, k)}.`]
          : q.vraagt === "meer"
            ? [`Het goede aantal is groter dan ${g(q.n, k)}.`]
            : q.vraagt === "minder"
              ? [`Het goede aantal is kleiner dan ${g(q.n, k)}.`]
              : ["Zoek de groep met hetzelfde getal als bovenaan."],
      testAntwoord: `keuze-${goedI}`,
    };
  }

  /* ---------- welke kleur heeft de laatste (middelste)? ---------- */
  const kr2 = q;
  const plek = kr2.wat === "laatste" ? 4 : 2;
  const goedKleur = kr2.rij[plek];
  const goedI = kr2.keuzes.indexOf(goedKleur);
  const o: RMOpgave = {
    id,
    soort: "kijk",
    boven: rijDingen(kr2.rij.map((k) => `ballon-${k}`), 150, 185),
    keuzes: kr2.keuzes.map((k) => vorm("vlek", KLEUR_RM[k], 150)),
    namen: kr2.keuzes.map(Hoofd),
  };
  return {
    o,
    soort: "kleurrij",
    reactie: (x) => [`De ${kr2.wat} ballon is niet ${kr2.keuzes[x as number]}.`, kr2.wat === "laatste" ? "Kijk naar de ballon helemaal rechts." : "Tel de ballonnen vanaf links."],
    eerste: ["Kijk naar de rij ballonnen.", "Tik dan op de goede kleur."],
    vraag: ["Kijk naar de rij ballonnen.", `Welke kleur heeft de ${kr2.wat} ballon?`],
    antwoord: () => tikKeuze(l),
    isGoed: (x) => x === goedI,
    noem: (x) => Hoofd(kr2.keuzes[x as number]),
    goedBeeld: () => zet(l, { goed: { deel: `k${goedI}`, keer: ++st.keer }, licht: { deel: "b", aan: [plek] } }),
    goedZin: [`Dat is de goede ballon! De ${kr2.wat} ballon is ${goedKleur}.`, kr2.wat === "laatste" ? "Hij staat helemaal achteraan." : "Er staan er 2 voor en 2 achter."],
    fout: (x) => zet(l, { fout: { deel: `k${x as number}`, keer: ++st.keer } }),
    samen: async (alles) => {
      await l.zeg("We tellen de ballonnen vanaf links.");
      const tot = alles ? 5 : kr2.wat === "laatste" ? 4 : 2;
      const labels = [...st.labels];
      const aan: number[] = [];
      for (let p = 0; p < tot; p++) {
        aan.push(p);
        zet(l, { licht: { deel: "b", aan: [...aan] } });
        labels.push({ deel: "b", x: -370 + p * 185, y: 104, tekst: String(p + 1), klein: true });
        zetLabels(l, st, labels);
        await l.wacht(380);
      }
      await l.zeg(kr2.wat === "laatste" ? "De laatste staat helemaal achteraan." : "De middelste staat in het midden.", kr2.wat === "laatste" ? "Na de laatste komt er niets meer." : "Er staan er 2 voor en 2 achter.");
    },
    tip: [kr2.wat === "laatste" ? "Kijk naar de ballon helemaal rechts." : "Tel de ballonnen vanaf links."],
    testAntwoord: `keuze-${goedI}`,
  };
}

/** Eén vraag met de vaste hulp van Bliepo. Geeft `true` als hij meteen goed was. */
async function speelVraag(l: Lesgids, st: Stand, id: string, q: Vraag): Promise<boolean> {
  const a = aanpak(l, st, id, q);
  let hulpTonen = false;
  const toon = () => {
    if (hulpTonen) return;
    toonOpgave(l, st, a.o, a.test ?? null);
  };
  toon();
  if (!st.gezien.has(a.soort)) {
    const eerder = st.gezien.size > 0;
    st.gezien.add(a.soort);
    if (a.eerste.length) await l.zeg(...(eerder ? ["Nu iets nieuws.", ...a.eerste] : a.eerste));
  }
  return squlaVraag<Antw>(l, {
    synthesis: true,
    reactie: (x) => a.reactie(x),
    toonAntwoord: async () => {
      if (a.toonAntwoord) await a.toonAntwoord();
      else a.goedBeeld();
      await l.zeg(...zonderJa(a.goedZin));
      await l.wacht(500);
    },
    toon,
    vraag: a.vraag,
    antwoord: a.antwoord,
    isGoed: a.isGoed,
    noem: a.noem,
    goed: async () => {
      a.goedBeeld();
      await l.zeg(bevestig());
      await l.wacht(500);
    },
    fout: a.fout,
    samen: async () => {
      await a.samen(false);
      /* Hoort er bij de hulp een eigen beeld (de getallenrij), dan blijft dat staan. */
      if (st.huidig !== a.o.id) hulpTonen = true;
    },
    tip: a.tip,
    testAntwoord: a.testAntwoord,
  });
}

/** De korte uitleg (bij "Kun je dit al?" → Nee): een voorbeeld, helemaal voorgedaan. */
async function legUit(l: Lesgids, st: Stand, id: string, q: Vraag) {
  const a = aanpak(l, st, id, q);
  toonOpgave(l, st, a.o, null);
  await l.wacht(700);
  await a.samen(true);
  if (st.huidig === a.o.id) a.goedBeeld();
  await l.zeg(...zonderJa(a.goedZin));
  await l.wacht(500);
}

/* =====================================================================
   Een hele les
   ===================================================================== */

type Lesdef = {
  id: string;
  titel: string;
  oefening: string;
  level: number;
  welkom: string[];
  /** Het voorbeeld bij de korte uitleg (een eigen vraag, niet een van de 15). */
  voorbeeld: Vraag[];
  /**
   * Het beginscherm laat het EERSTE voorbeeld zien in plaats van vraag 1 (BOUWREGELS 4.1, 14.13, 14.21): dan gaat
   * de uitleg na Nee over precies wat in beeld staat, en verklapt hij geen latere vraag. De welkomzin gaat
   * dan over dat voorbeeld.
   */
  beginMetVoorbeeld?: boolean;
  vragen: Vraag[];
  eind: string;
};

/** Alle vaste plaatjes die in deze opgaven voorkomen. */
function namenIn(opgaven: RMOpgave[]): string[] {
  const uit = new Set<string>();
  const tek = (t?: RMTekening) => t?.stukken.forEach((s) => s.t === "vw" && uit.add(s.naam));
  for (const o of opgaven) {
    if (o.soort === "kijk") {
      tek(o.boven);
      o.keuzes?.forEach(tek);
    } else if (o.soort === "volgorde") {
      o.vast?.forEach(tek);
      o.kaarten.forEach(tek);
    } else {
      o.links.forEach(tek);
      o.rechts.forEach(tek);
    }
  }
  /* Herstel 7 november: "bal" wordt getekend als "speelbal" (zie beeldNaam in squla-rekenmix-tekenen.ts). */
  if (uit.has("bal")) uit.add("speelbal");
  return [...uit].sort();
}

/** De opgaven van een les, zonder iets te spelen (voor de lijst met plaatjes en het vooraf tekenen). */
function opgavenVan(d: Lesdef): RMOpgave[] {
  const nep = {} as Lesgids;
  const st: Stand = { huidig: "", keer: 0, ronde: 0, handGezien: false, verbindGezien: false, gezien: new Set(), labels: [] };
  return [...d.vragen.map((q, i) => aanpak(nep, st, `${d.id}-${i + 1}`, q).o), ...d.voorbeeld.map((q, i) => aanpak(nep, st, `${d.id}-vb${i + 1}`, q).o), { id: "telrij", soort: "kijk", boven: TELRIJ }];
}

function les(d: Lesdef): Lesdraaiboek {
  const opgaven = opgavenVan(d);
  return {
    id: d.id,
    titel: d.titel,
    synthesis: `Squla groep 3 · Rekenmix · ${d.oefening} · level ${d.level} (alleen leerdoel)`,
    indeling: "synthesis",
    browserstem: true,
    nacht: true,
    voorwerpen: namenIn(opgaven),
    kaarttekening: KaartRekenmix,
    async speel(l) {
      const st: Stand = { huidig: "", keer: 0, ronde: 0, handGezien: false, verbindGezien: false, gezien: new Set(), labels: [] };
      zetSynthesisHulp(l);
      /* De opgaven staan op volgorde: eerst de 15 vragen, dan de voorbeelden. */
      const eerste = d.beginMetVoorbeeld ? opgaven[d.vragen.length] : opgaven[0];
      /* st.huidig blijft leeg: de eerste vraag zet zijn opgave dan nog eens, mét de test (zelfde beeld). */
      l.vlak<RMProps>(SqulaRekenmix, { opgave: metPlek(eerste), namen: namenIn(opgaven), vooraf: opgaven });
      const voorbeeldAfgerond = await squlaBegin(l, {
        welkom: d.welkom,
        voordoen: true,
        samen: () => speelVraag(l, st, `${d.id}-uitleg`, d.beginMetVoorbeeld ? d.voorbeeld[0] : d.vragen[0]),
        /* Het beginscherm laat de eerste vraag van de les zien, of het eerste voorbeeld (BOUWREGELS 4.1). */
        voorbeeld: () => {
          st.huidig = "";
          toonOpgave(l, st, eerste, null);
          /* De eerste vraag zet zijn opgave daarna nog eens, mét de test (zelfde beeld). */
          st.huidig = "";
        },
        uitleg: async () => {
          if (d.beginMetVoorbeeld) for (const [i, q] of d.voorbeeld.entries()) await legUit(l, st, `${d.id}-vb${i + 1}`, q);
          /* Staat er bij het beginscherm de eerste vraag, dan gaat de uitleg over diezelfde vraag (BOUWREGELS 14.21). */
          else await legUit(l, st, `${d.id}-u1`, d.vragen[0]);
        },
      });
      let fouten = 0;
      for (const [i, q] of d.vragen.entries()) if (!(voorbeeldAfgerond && !d.beginMetVoorbeeld && i === 0) && !(await speelVraag(l, st, `${d.id}-${i + 1}`, q))) fouten++;
      zet(l, { opgave: null });
      await squlaEind(l, fouten, d.eind);
    },
  };
}

/* =====================================================================
   Rekenmix 1 (Squla 12517)
   ===================================================================== */

/*
  Level 1: tellen, kies uit 3 getallen. Getallen 5 t/m 12; afleiders 1 meer
  en 1 minder (soms 3 verder). Door elkaar, in rijen, of in paren (dan telt
  Bliepo in sprongen van 2, zoals Squla). Squla telt dieren; wij appels,
  ballen, potloden, auto's en bloemen (tellen blijft hetzelfde).
*/
const mix1_1 = les({
  id: "squla-rekenmix-mix1-1",
  titel: "Rekenmix 1",
  oefening: "Rekenmix 1",
  level: 1,
  welkom: ["Er liggen appels door elkaar.", "Tel de appels. Hoeveel zijn het er?"],
  beginMetVoorbeeld: true,
  /* 6 appels door elkaar: dezelfde soort vraag als vraag 1, met een aantal dat in de les niet voorkomt. */
  voorbeeld: [{ t: "tel", v: APPEL, gr: los([{ naam: "appel", n: 6 }], 5), keuzes: [6, 5, 7], soort: "tel" }],
  vragen: [
    { t: "tel", v: APPEL, gr: los([{ naam: "appel", n: 7 }], 11), keuzes: [8, 6, 7], soort: "tel" },
    { t: "tel", v: BAL, gr: rijen("bal", [4, 4, 2]), keuzes: [10, 11, 9], soort: "tel" },
    { t: "tel", v: POTLOOD, gr: paren("potlood", 6), keuzes: [5, 6, 7], soort: "tel" },
    { t: "tel", v: AUTO, gr: rijen("speelgoedauto", [3, 3, 3]), keuzes: [9, 8, 10], soort: "tel" },
    { t: "tel", v: BLOEM, gr: rijen("bloem", [5, 5, 2]), keuzes: [11, 12, 13], soort: "tel" },
    { t: "tel", v: KNIKKER, gr: los([{ naam: "knikker", n: 5 }], 23), keuzes: [5, 4, 6], soort: "tel" },
    { t: "tel", v: BAL, gr: paren("bal", 10, 90), keuzes: [10, 11, 7], soort: "tel" },
    { t: "tel", v: APPEL, gr: rijen("appel", [4, 4, 3]), keuzes: [12, 11, 10], soort: "tel" },
    { t: "tel", v: AUTO, gr: los([{ naam: "speelgoedauto", n: 8 }], 37), keuzes: [7, 8, 9], soort: "tel" },
    { t: "tel", v: POTLOOD, gr: rijen("potlood", [4, 4]), keuzes: [8, 9, 5], soort: "tel" },
    { t: "tel", v: BLOEM, gr: paren("bloem", 12, 82), keuzes: [12, 11, 13], soort: "tel" },
    { t: "tel", v: STER, gr: rijen("ster", [3, 3, 3, 2], 96), keuzes: [11, 10, 12], soort: "tel" },
    { t: "tel", v: APPEL, gr: los([{ naam: "appel", n: 9 }], 51), keuzes: [9, 8, 10], soort: "tel" },
    { t: "tel", v: BAL, gr: rijen("bal", [5, 5]), keuzes: [10, 9, 7], soort: "tel" },
    { t: "tel", v: AUTO, gr: paren("speelgoedauto", 8), keuzes: [8, 7, 9], soort: "tel" },
  ],
  eind: "Jij kunt goed tellen.",
});

/*
  Level 2: welke vorm lijkt erop? Een ding bovenaan, drie vormen eronder
  (cirkel, driehoek, vierkant, rechthoek). Squla gebruikt plaatjes uit het
  boek (tanden van de krokodil, kinderen bij een schommel); wij een tent,
  pizzapunt, feesthoedje, vlaggetjes, mandarijn, planeet, knoop, een plank
  (het zitje van onze schommel is rond, dus geen rechthoek), schoolbord,
  telefoon, pizzadoos en blok.
*/
/* Herstel 7 november (OVERZICHT-C mix1-2): de plank was een dun schuin streepje en pizzadoos, blok, doos en boek waren
   schuin (3D) getekend, terwijl de keuzes platte vormen zijn. Nu een kleed van boven en platte tekeningen recht van voren of
   van boven (in code getekend, stijl B: pizzadoos-plat, speelblok-plat, doos-plat, boek-plat). */
const mix1_2 = les({
  id: "squla-rekenmix-mix1-2",
  titel: "Rekenmix 1 (moeilijker)",
  oefening: "Rekenmix 1",
  level: 2,
  welkom: ["Kijk naar de zon.", "Welke vorm lijkt erop?"],
  beginMetVoorbeeld: true,
  voorbeeld: [{ t: "vorm", naam: "zon", zin: "de zon", vorm: "cirkel", keuzes: ["vierkant", "cirkel", "driehoek"] }],
  vragen: [
    { t: "vorm", naam: "tent", zin: "de tent", vorm: "driehoek", keuzes: ["cirkel", "driehoek", "vierkant"] },
    { t: "vorm", naam: "mandarijn", zin: "de mandarijn", vorm: "cirkel", keuzes: ["driehoek", "rechthoek", "cirkel"] },
    { t: "vorm", naam: "picknickkleed", zin: "het kleed", vorm: "rechthoek", keuzes: ["cirkel", "vierkant", "rechthoek"] },
    { t: "vorm", naam: "vlaggenlijn", zin: "de vlaggetjes", lijkt: "lijken", vorm: "driehoek", keuzes: ["rechthoek", "driehoek", "vierkant"] },
    { t: "vorm", naam: "planeet", zin: "de planeet", vorm: "cirkel", keuzes: ["vierkant", "rechthoek", "cirkel"] },
    { t: "vorm", naam: "pizzadoos-plat", zin: "de pizzadoos", vorm: "vierkant", keuzes: ["vierkant", "driehoek", "cirkel"] },
    { t: "vorm", naam: "schoolbord", zin: "het schoolbord", vorm: "rechthoek", keuzes: ["rechthoek", "cirkel", "driehoek"] },
    { t: "vorm", naam: "pizzapunt", zin: "het stuk pizza", vorm: "driehoek", keuzes: ["cirkel", "vierkant", "driehoek"] },
    { t: "vorm", naam: "knoop", zin: "de knoop", vorm: "cirkel", keuzes: ["cirkel", "rechthoek", "driehoek"] },
    { t: "vorm", naam: "speelblok-plat", zin: "het blok", vorm: "vierkant", keuzes: ["driehoek", "vierkant", "cirkel"] },
    { t: "vorm", naam: "telefoon", zin: "de telefoon", vorm: "rechthoek", keuzes: ["vierkant", "rechthoek", "cirkel"] },
    { t: "vorm", naam: "feesthoed", zin: "het feesthoedje", vorm: "driehoek", keuzes: ["driehoek", "cirkel", "rechthoek"] },
    { t: "vorm", naam: "koekje", zin: "het koekje", vorm: "cirkel", keuzes: ["rechthoek", "cirkel", "driehoek"] },
    { t: "vorm", naam: "doos-plat", zin: "de doos", vorm: "vierkant", keuzes: ["cirkel", "driehoek", "vierkant"] },
    { t: "vorm", naam: "boek-plat", zin: "het boek", vorm: "rechthoek", keuzes: ["driehoek", "rechthoek", "cirkel"] },
  ],
  eind: "Jij ziet de vormen overal.",
});

/*
  Level 3: links, rechts, in het midden. Bovenaan drie dingen naast elkaar,
  eronder drie plaatjes; soms staat een plaatje er niet eens in de rij (zoals
  bij Squla). Squla gebruikt dieren; wij voertuigen, ruimtedingen en
  speelgoed. Zelfde volgorde als Squla: rechts, links, midden, …
*/
const mix1_3 = les({
  id: "squla-rekenmix-mix1-3",
  titel: "Rekenmix 1 (nog moeilijker)",
  oefening: "Rekenmix 1",
  level: 3,
  welkom: ["3 dingen staan in een rij.", "Wat staat er rechts?"],
  voorbeeld: [{ t: "plaats", rij: ["bus", "fiets", "bootje"], keuzes: ["fiets", "bootje", "bus"], wat: "links" }],
  vragen: [
    { t: "plaats", rij: ["fiets", "speelgoedauto", "bus"], keuzes: ["speelgoedauto", "bus", "fiets"], wat: "rechts" },
    { t: "plaats", rij: ["treintje", "bootje", "fiets"], keuzes: ["treintje", "bootje", "fiets"], wat: "links" },
    { t: "plaats", rij: ["bus", "skateboard", "treintje"], keuzes: ["bus", "skateboard", "treintje"], wat: "midden" },
    { t: "plaats", rij: ["bootje", "bus", "speelgoedauto"], keuzes: ["fiets", "speelgoedauto", "bus"], wat: "rechts" },
    { t: "plaats", rij: ["skateboard", "fiets", "bootje"], keuzes: ["fiets", "bootje", "skateboard"], wat: "links" },
    { t: "plaats", rij: ["raketje", "ufo", "satelliet"], keuzes: ["satelliet", "ufo", "raketje"], wat: "midden" },
    { t: "plaats", rij: ["planeet", "raketje", "ufo"], keuzes: ["ufo", "planeet", "raketje"], wat: "rechts" },
    { t: "plaats", rij: ["satelliet", "planeet", "raketje"], keuzes: ["raketje", "satelliet", "ufo"], wat: "links" },
    { t: "plaats", rij: ["ufo", "satelliet", "planeet"], keuzes: ["ufo", "planeet", "satelliet"], wat: "midden" },
    { t: "plaats", rij: ["raketje", "planeet", "satelliet"], keuzes: ["satelliet", "raketje", "planeet"], wat: "rechts" },
    { t: "plaats", rij: ["bal", "vlieger", "ballon"], keuzes: ["ballon", "bal", "vlieger"], wat: "links" },
    { t: "plaats", rij: ["vlieger", "ballon", "pion"], keuzes: ["pion", "ballon", "vlieger"], wat: "midden" },
    { t: "plaats", rij: ["pion", "bal", "vlieger"], keuzes: ["bal", "vlieger", "ballon"], wat: "rechts" },
    { t: "plaats", rij: ["ballon", "pion", "bal"], keuzes: ["pion", "bal", "ballon"], wat: "links" },
    { t: "plaats", rij: ["bal", "ballon", "vlieger"], keuzes: ["vlieger", "ballon", "bal"], wat: "midden" },
  ],
  eind: "Jij weet wat links, rechts en midden is.",
});

/*
  Level 4: drie groepjes op volgorde slepen, van meer naar minder (3×) en dan
  van minder naar meer (2×), steeds opnieuw. Getallen 1 t/m 14; eerst grote
  verschillen, dan dicht bij elkaar. Squla: een dier eet noten (blaadjes …);
  wij alleen de dingen zelf (koekjes, knikkers, sterren …), zonder dier.
*/
const mix1_4 = les({
  id: "squla-rekenmix-mix1-4",
  titel: "Rekenmix 1 (heel moeilijk)",
  oefening: "Rekenmix 1",
  level: 4,
  welkom: ["Hier liggen koekjes.", "Zet ze op volgorde, van meer naar minder."],
  beginMetVoorbeeld: true,
  voorbeeld: [{ t: "ordenAantal", v: KOEKJE, aantallen: [2, 6, 4], richting: "af" }],
  vragen: [
    { t: "ordenAantal", v: KOEKJE, aantallen: [3, 8, 5], richting: "af" },
    { t: "ordenAantal", v: KNIKKER, aantallen: [4, 1, 7], richting: "af" },
    { t: "ordenAantal", v: STER, aantallen: [9, 13, 11], richting: "af" },
    { t: "ordenAantal", v: AARDBEI, aantallen: [4, 2, 6], richting: "op" },
    { t: "ordenAantal", v: KRAAL, aantallen: [9, 7, 8], richting: "op" },
    { t: "ordenAantal", v: APPEL, aantallen: [6, 2, 9], richting: "af" },
    { t: "ordenAantal", v: BAL, aantallen: [3, 5, 1], richting: "af" },
    { t: "ordenAantal", v: BLOEM, aantallen: [11, 14, 12], richting: "af" },
    { t: "ordenAantal", v: KOEKJE, aantallen: [1, 4, 2], richting: "op" },
    { t: "ordenAantal", v: KNIKKER, aantallen: [12, 10, 11], richting: "op" },
    { t: "ordenAantal", v: STER, aantallen: [7, 2, 4], richting: "af" },
    { t: "ordenAantal", v: AARDBEI, aantallen: [6, 8, 3], richting: "af" },
    { t: "ordenAantal", v: KRAAL, aantallen: [13, 9, 10], richting: "af" },
    { t: "ordenAantal", v: APPEL, aantallen: [5, 1, 3], richting: "op" },
    { t: "ordenAantal", v: BAL, aantallen: [10, 7, 9], richting: "op" },
  ],
  eind: "Jij zet groepjes op volgorde.",
});

/* =====================================================================
   Rekenmix 2 (Squla 15728)
   ===================================================================== */

/*
  Level 1: meer, minder, evenveel; de meeste en de minste. Squla gebruikt een
  hek met meer of minder verf; wij een boterham met meer of minder kaas
  (bestaande plaatjes, zelfde idee: een hoeveelheid die je ziet, geen getal)
  en spiesjes met meer of minder fruit. Zelfde volgorde als Squla: meer,
  meeste, minder, minste, evenveel.
*/
const mix2_1 = les({
  id: "squla-rekenmix-mix2-1",
  titel: "Rekenmix 2",
  oefening: "Rekenmix 2",
  level: 1,
  welkom: ["Kijk naar de boterham bovenaan.", "Op welke boterham zit meer kaas?"],
  voorbeeld: [{ t: "hoeveel", ding: "boterham", keuzes: [1, 0, 2], wat: "minder" }],
  vragen: [
    { t: "hoeveel", ding: "boterham", keuzes: [2, 1, 0], wat: "meer" },
    { t: "hoeveel", ding: "spies", keuzes: [2, 0, 1], wat: "meest" },
    { t: "hoeveel", ding: "boterham", keuzes: [1, 0, 2], wat: "minder", beleg: "banaan" },
    { t: "hoeveel", ding: "spies", keuzes: [2, 0, 1], wat: "minst" },
    { t: "hoeveel", ding: "boterham", keuzes: [2, 1, 0], wat: "evenveel", beleg: "komkommer" },
    { t: "hoeveel", ding: "boterham", keuzes: [0, 2, 1], wat: "meer", beleg: "tomaat" },
    { t: "hoeveel", ding: "boterham", keuzes: [1, 2, 0], wat: "meest", beleg: "ei" },
    { t: "hoeveel", ding: "boterham", keuzes: [2, 0, 1], wat: "minder" },
    { t: "hoeveel", ding: "spies", keuzes: [1, 2, 0], wat: "minst" },
    { t: "hoeveel", ding: "boterham", keuzes: [0, 1, 2], wat: "evenveel", beleg: "banaan" },
    { t: "hoeveel", ding: "boterham", keuzes: [1, 0, 2], wat: "meer", beleg: "komkommer" },
    { t: "hoeveel", ding: "spies", keuzes: [0, 1, 2], wat: "meest" },
    { t: "hoeveel", ding: "boterham", keuzes: [0, 2, 1], wat: "minder", beleg: "tomaat" },
    { t: "hoeveel", ding: "boterham", keuzes: [2, 1, 0], wat: "minst", beleg: "ei" },
    { t: "hoeveel", ding: "boterham", keuzes: [1, 2, 0], wat: "evenveel" },
  ],
  eind: "Jij ziet waar meer en minder is.",
});

/*
  Level 2: waar is het? In, op, voor, naast, achter. Squla: een konijn bij een
  hoge hoed; wij een bal bij een doos (de doos is open als de bal erin zit).
  Squla zet de antwoorden als woorden neer; die leest Bliepo voor.
*/
const mix2_2 = les({
  id: "squla-rekenmix-mix2-2",
  titel: "Rekenmix 2 (moeilijker)",
  oefening: "Rekenmix 2",
  level: 2,
  welkom: ["Hier zie je een bal en een doos.", "Waar ligt de bal?"],
  voorbeeld: [{ t: "waar", plek: "naast", keuzes: ["op", "naast", "in"], kant: -1 }],
  vragen: [
    { t: "waar", plek: "in", keuzes: ["naast", "in", "voor"] },
    { t: "waar", plek: "op", keuzes: ["op", "achter", "in"] },
    { t: "waar", plek: "voor", keuzes: ["naast", "op", "voor"] },
    { t: "waar", plek: "naast", keuzes: ["in", "naast", "achter"], kant: 1 },
    { t: "waar", plek: "achter", keuzes: ["voor", "achter", "op"] },
    { t: "waar", plek: "op", keuzes: ["in", "naast", "op"] },
    { t: "waar", plek: "achter", keuzes: ["achter", "in", "naast"], kant: -1 },
    { t: "waar", plek: "in", keuzes: ["op", "in", "achter"] },
    { t: "waar", plek: "naast", keuzes: ["voor", "op", "naast"], kant: -1 },
    { t: "waar", plek: "voor", keuzes: ["voor", "achter", "in"], kant: -1 },
    { t: "waar", plek: "naast", keuzes: ["naast", "voor", "in"], kant: 1 },
    { t: "waar", plek: "achter", keuzes: ["op", "voor", "achter"] },
    { t: "waar", plek: "in", keuzes: ["in", "naast", "op"] },
    { t: "waar", plek: "voor", keuzes: ["achter", "voor", "naast"] },
    { t: "waar", plek: "op", keuzes: ["achter", "op", "voor"] },
  ],
  eind: "Jij weet waar de bal ligt.",
});

/*
  Level 3: kleur en vorm (waar zie je een rode cirkel?) en blokjes tellen in
  twee rijen: bovenaan 5, onderaan de rest (6 t/m 10). Squla zet de vormen op
  een hoed en de vierkantjes op een hek; wij tekenen alleen de vormen en de
  blokjes (rekenmateriaal). Zelfde volgorde: vorm, blokjes, vorm, blokjes, vorm.
*/
const mix2_3 = les({
  id: "squla-rekenmix-mix2-3",
  titel: "Rekenmix 2 (nog moeilijker)",
  oefening: "Rekenmix 2",
  level: 3,
  welkom: ["Hier zie je kleuren en vormen.", "Waar zie je een paarse driehoek?"],
  beginMetVoorbeeld: true,
  voorbeeld: [
    /* Paars komt in de vragen niet voor: het voorbeeld verklapt niets. */
    { t: "kleurvorm", kleur: "paars", vorm: "driehoek", keuzes: [["paars", "driehoek"], ["paars", "vierkant"], ["oranje", "driehoek"]] },
    { t: "blokjes", n: 8, keuzes: [7, 8, 9] },
  ],
  vragen: [
    { t: "kleurvorm", kleur: "rood", vorm: "cirkel", keuzes: [["rood", "driehoek"], ["rood", "cirkel"], ["blauw", "cirkel"]] },
    { t: "blokjes", n: 7, keuzes: [8, 7, 6] },
    { t: "kleurvorm", kleur: "geel", vorm: "driehoek", keuzes: [["geel", "vierkant"], ["blauw", "driehoek"], ["geel", "driehoek"]] },
    { t: "blokjes", n: 9, keuzes: [9, 10, 8] },
    { t: "kleurvorm", kleur: "blauw", vorm: "rechthoek", keuzes: [["blauw", "rechthoek"], ["rood", "rechthoek"], ["blauw", "cirkel"]] },
    { t: "kleurvorm", kleur: "groen", vorm: "vierkant", keuzes: [["groen", "vierkant"], ["groen", "driehoek"], ["geel", "vierkant"]] },
    { t: "blokjes", n: 6, keuzes: [7, 6, 8] },
    { t: "kleurvorm", kleur: "rood", vorm: "driehoek", keuzes: [["rood", "vierkant"], ["geel", "driehoek"], ["rood", "driehoek"]] },
    { t: "blokjes", n: 10, keuzes: [9, 8, 10] },
    { t: "kleurvorm", kleur: "geel", vorm: "cirkel", keuzes: [["geel", "cirkel"], ["geel", "rechthoek"], ["rood", "cirkel"]] },
    { t: "kleurvorm", kleur: "blauw", vorm: "vierkant", keuzes: [["blauw", "driehoek"], ["blauw", "vierkant"], ["groen", "vierkant"]] },
    { t: "blokjes", n: 8, keuzes: [8, 9, 7] },
    { t: "kleurvorm", kleur: "groen", vorm: "rechthoek", keuzes: [["geel", "rechthoek"], ["groen", "cirkel"], ["groen", "rechthoek"]] },
    { t: "blokjes", n: 7, keuzes: [6, 8, 7] },
    { t: "kleurvorm", kleur: "rood", vorm: "rechthoek", keuzes: [["rood", "rechthoek"], ["rood", "cirkel"], ["blauw", "rechthoek"]] },
  ],
  eind: "Jij kent je kleuren en vormen.",
});

/*
  Level 4: verbinden. Links drie groepjes, rechts drie getallen of drie
  groepjes; trek de lijnen. Om en om groepje ↔ getal en groepje ↔ groepje
  (evenveel). Eerst in rijen (vijfstructuur, dubbele rijen), dan los door
  elkaar. Getallen 4 t/m 10. Squla telt konijntjes, hoeden en toverstokjes;
  wij ballen, sterren, knikkers en appels.
*/
const r5 = (naam: string, lengtes: number[]) => kaartGroep(naam, lengtes, 50);
/* Herstel 7 november (OVERZICHT-C mix2-4): compacter, zodat elk groepje bij zijn eigen rij hoort en niet tegen de rand ligt. */
const kl = (naam: string, n: number, zaad: number) => kaartLos(naam, n, zaad, 208, 156, 50);
const mix2_4 = les({
  id: "squla-rekenmix-mix2-4",
  titel: "Rekenmix 2 (heel moeilijk)",
  oefening: "Rekenmix 2",
  level: 4,
  welkom: ["Links staan groepjes ballen.", "Verbind elk groepje met het goede getal."],
  voorbeeld: [{ t: "verbind", links: [r5("bal", [5]), r5("bal", [3, 3]), r5("bal", [4])], rechts: [4, 5, 6], vl: BAL }],
  vragen: [
    { t: "verbind", links: [r5("bal", [3, 3]), r5("bal", [5, 2]), r5("bal", [5])], rechts: [7, 5, 6], vl: BAL },
    { t: "verbind", links: [r5("ster", [3, 3]), r5("ster", [4, 4]), r5("ster", [4, 3])], rechts: [r5("knikker", [4, 3]), r5("knikker", [3, 3]), r5("knikker", [4, 4])], vl: STER, vr: KNIKKER },
    { t: "verbind", links: [r5("bal", [5, 5]), r5("bal", [5, 3]), r5("bal", [5, 4])], rechts: [9, 8, 10], vl: BAL },
    { t: "verbind", links: [kl("ster", 5, 3), kl("ster", 4, 5), kl("ster", 6, 7)], rechts: [kl("knikker", 4, 9), kl("knikker", 5, 13), kl("knikker", 6, 15)], vl: STER, vr: KNIKKER },
    { t: "verbind", links: [kl("appel", 5, 17), kl("appel", 7, 19), kl("appel", 8, 21)], rechts: [8, 7, 5], vl: APPEL },
    { t: "verbind", links: [r5("knikker", [4]), r5("knikker", [5, 4]), r5("knikker", [5, 1])], rechts: [6, 4, 9], vl: KNIKKER },
    { t: "verbind", links: [r5("appel", [5]), r5("appel", [4, 4]), r5("appel", [5, 5])], rechts: [r5("ster", [4, 4]), r5("ster", [5, 5]), r5("ster", [5])], vl: APPEL, vr: STER },
    { t: "verbind", links: [r5("bal", [5, 2]), r5("bal", [4]), r5("bal", [3, 3])], rechts: [4, 6, 7], vl: BAL },
    { t: "verbind", links: [kl("ster", 7, 23), kl("ster", 5, 25), kl("ster", 4, 27)], rechts: [kl("appel", 5, 29), kl("appel", 4, 31), kl("appel", 7, 33)], vl: STER, vr: APPEL },
    { t: "verbind", links: [kl("knikker", 6, 35), kl("knikker", 9, 37), kl("knikker", 8, 39)], rechts: [9, 8, 6], vl: KNIKKER },
    { t: "verbind", links: [r5("appel", [5, 3]), r5("appel", [3, 3]), r5("appel", [5, 4])], rechts: [6, 9, 8], vl: APPEL },
    { t: "verbind", links: [r5("bal", [5]), r5("bal", [4, 3]), r5("bal", [5, 5])], rechts: [r5("knikker", [5, 5]), r5("knikker", [5]), r5("knikker", [4, 3])], vl: BAL, vr: KNIKKER },
    { t: "verbind", links: [r5("ster", [5, 4]), r5("ster", [4]), r5("ster", [5, 2])], rechts: [7, 4, 9], vl: STER },
    { t: "verbind", links: [kl("knikker", 6, 41), kl("knikker", 4, 43), kl("knikker", 5, 45)], rechts: [kl("bal", 5, 47), kl("bal", 6, 49), kl("bal", 4, 53)], vl: KNIKKER, vr: BAL },
    { t: "verbind", links: [kl("bal", 10, 55), kl("bal", 7, 57), kl("bal", 6, 59)], rechts: [6, 10, 7], vl: BAL },
  ],
  eind: "Jij weet wat bij elkaar hoort.",
});

/* =====================================================================
   Rekenmix 3 (Squla 12505)
   ===================================================================== */

/*
  Level 1: op volgorde met klein-kleiner-kleinst, dik-dikker-dikst,
  groot-groter-grootst, dun-dunner-dunst en laag-lager-laagst. De volgorde
  volgt de woorden: bij "klein" (mix3-1) staat de kleinste links: kleinst, kleiner, klein (Sara, 6 nov).
  Squla gebruikt knaagdieren, koeien en honden; wij ballen, appels, sterren,
  kaarsen, potloden, huizen, bomen, raketjes en torens van blokken (dat zijn
  dingen waar dik, dun, groot en laag goed bij te zien is).
*/
const mix3_1 = les({
  id: "squla-rekenmix-mix3-1",
  titel: "Rekenmix 3",
  oefening: "Rekenmix 3",
  level: 1,
  welkom: ["3 ballen zijn niet even groot.", "Zet ze op volgorde: kleinst, kleiner, klein."],
  beginMetVoorbeeld: true,
  voorbeeld: [{ t: "ordenMaat", woord: "klein", naam: "bal-maat", maten: [0.82, 0.46, 1] }],
  vragen: [
    { t: "ordenMaat", woord: "klein", naam: "bal-maat", maten: [0.62, 1, 0.38] },
    { t: "ordenMaat", woord: "dik", naam: "kaars-maat", maten: [1.4, 0.55, 0.95] },
    { t: "ordenMaat", woord: "groot", naam: "huis-maat", maten: [1, 0.48, 0.74] },
    { t: "ordenMaat", woord: "dun", naam: "potlood-maat", maten: [1.15, 1.6, 0.7] },
    { t: "ordenMaat", woord: "laag", naam: "blok-maat", maten: [2, 4, 3] },
    { t: "ordenMaat", woord: "klein", naam: "appel-maat", maten: [0.4, 0.68, 1] },
    { t: "ordenMaat", woord: "dik", naam: "potlood-maat", maten: [1.05, 1.6, 0.6] },
    { t: "ordenMaat", woord: "groot", naam: "boom-maat", maten: [0.72, 1, 0.45] },
    { t: "ordenMaat", woord: "dun", naam: "kaars-maat", maten: [0.6, 1.0, 1.45] },
    { t: "ordenMaat", woord: "laag", naam: "blok-maat", maten: [1, 3, 2] },
    { t: "ordenMaat", woord: "klein", naam: "ster-maat", maten: [1, 0.42, 0.7] },
    { t: "ordenMaat", woord: "dik", naam: "kaars-maat", maten: [0.95, 0.6, 1.35] },
    { t: "ordenMaat", woord: "groot", naam: "raket-maat", maten: [0.5, 1, 0.75] },
    { t: "ordenMaat", woord: "dun", naam: "potlood-maat", maten: [1.5, 0.75, 1.1] },
    { t: "ordenMaat", woord: "laag", naam: "blok-maat", maten: [4, 2, 3] },
  ],
  eind: "Jij zet alles op volgorde.",
});

/*
  Level 2: eerste, tweede, derde, vierde en laatste in een rij van 5, vanaf
  links. Squla: vijf dieren in een rij; wij vijf voertuigen, vijf
  ruimtedingen en vijf speelgoedjes (drie rijen, elk 5 vragen).
*/
const RIJ_A = ["fiets", "speelgoedauto", "bus", "treintje", "bootje"];
const RIJ_B = ["raketje", "ufo", "satelliet", "planeet", "komeet"];
const RIJ_C = ["bal", "vlieger", "ballon", "pion", "skateboard"];
const mix3_2 = les({
  id: "squla-rekenmix-mix3-2",
  titel: "Rekenmix 3 (moeilijker)",
  oefening: "Rekenmix 3",
  level: 2,
  welkom: ["5 dingen staan in een rij.", "Wat staat als eerste in de rij?"],
  beginMetVoorbeeld: true,
  /* Een rij in een andere volgorde dan in de vragen, en de eerste van de rij zoals de welkomzin vraagt. */
  voorbeeld: [{ t: "rang", rij: ["bus", "bootje", "fiets", "treintje", "speelgoedauto"], keuzes: ["fiets", "treintje", "bus", "speelgoedauto", "bootje"], plek: 0 }],
  vragen: [
    { t: "rang", rij: RIJ_A, keuzes: ["bootje", "bus", "fiets", "treintje", "speelgoedauto"], plek: 0 },
    { t: "rang", rij: RIJ_A, keuzes: ["speelgoedauto", "treintje", "bootje", "bus", "fiets"], plek: 2 },
    { t: "rang", rij: RIJ_A, keuzes: ["bus", "fiets", "speelgoedauto", "bootje", "treintje"], plek: 1 },
    { t: "rang", rij: RIJ_A, keuzes: ["treintje", "bootje", "bus", "fiets", "speelgoedauto"], plek: 3 },
    { t: "rang", rij: RIJ_A, keuzes: ["fiets", "speelgoedauto", "treintje", "bus", "bootje"], plek: 4 },
    { t: "rang", rij: RIJ_B, keuzes: ["planeet", "ufo", "komeet", "raketje", "satelliet"], plek: 1 },
    { t: "rang", rij: RIJ_B, keuzes: ["satelliet", "komeet", "raketje", "ufo", "planeet"], plek: 4 },
    { t: "rang", rij: RIJ_B, keuzes: ["ufo", "planeet", "satelliet", "komeet", "raketje"], plek: 0 },
    { t: "rang", rij: RIJ_B, keuzes: ["raketje", "satelliet", "planeet", "ufo", "komeet"], plek: 3 },
    { t: "rang", rij: RIJ_B, keuzes: ["komeet", "raketje", "ufo", "satelliet", "planeet"], plek: 2 },
    { t: "rang", rij: RIJ_C, keuzes: ["vlieger", "pion", "bal", "skateboard", "ballon"], plek: 3 },
    { t: "rang", rij: RIJ_C, keuzes: ["ballon", "skateboard", "vlieger", "bal", "pion"], plek: 0 },
    { t: "rang", rij: RIJ_C, keuzes: ["pion", "bal", "skateboard", "ballon", "vlieger"], plek: 4 },
    { t: "rang", rij: RIJ_C, keuzes: ["skateboard", "ballon", "pion", "vlieger", "bal"], plek: 2 },
    { t: "rang", rij: RIJ_C, keuzes: ["bal", "vlieger", "ballon", "pion", "skateboard"], plek: 1 },
  ],
  eind: "Jij weet wat eerste en laatste is.",
});

/*
  Level 3: welk getal komt net voor (na) een getal? Kiezen uit 3 getallen, en
  twee keer zelf typen bij een plaatje met het startgetal (in rijen van 5).
  Getallen 5 t/m 10. Squla: koeien en muizen bij de typvraag; wij appels,
  ballen, sterren en knikkers.
*/
const mix3_3 = les({
  id: "squla-rekenmix-mix3-3",
  titel: "Rekenmix 3 (nog moeilijker)",
  oefening: "Rekenmix 3",
  level: 3,
  welkom: ["We zoeken getallen die naast elkaar staan.", `Welk getal komt net voor ${w(5)}?`],
  beginMetVoorbeeld: true,
  /* Net voor 5 (antwoord 4) komt in de vragen niet voor. */
  voorbeeld: [{ t: "buur", n: 5, richting: "voor", keuzes: [4, 6, 3] }],
  vragen: [
    { t: "buur", n: 7, richting: "voor", keuzes: [8, 6, 5] },
    { t: "buur", n: 9, richting: "na", keuzes: [10, 8, 7] },
    { t: "buur", n: 6, richting: "voor", keuzes: [7, 4, 5] },
    { t: "buur", n: 5, richting: "na", plaatje: { v: APPEL, gr: rijen("appel", [5]) } },
    { t: "buur", n: 8, richting: "voor", plaatje: { v: BAL, gr: rijen("bal", [5, 3]) } },
    { t: "buur", n: 9, richting: "voor", keuzes: [8, 10, 7] },
    { t: "buur", n: 6, richting: "na", keuzes: [5, 7, 8] },
    { t: "buur", n: 10, richting: "voor", keuzes: [8, 10, 9] },
    { t: "buur", n: 7, richting: "na", plaatje: { v: STER, gr: rijen("ster", [5, 2]) } },
    { t: "buur", n: 6, richting: "voor", plaatje: { v: KNIKKER, gr: rijen("knikker", [5, 1]) } },
    { t: "buur", n: 8, richting: "voor", keuzes: [9, 7, 6] },
    { t: "buur", n: 8, richting: "na", keuzes: [9, 7, 10] },
    { t: "buur", n: 7, richting: "na", keuzes: [6, 9, 8] },
    { t: "buur", n: 9, richting: "na", plaatje: { v: APPEL, gr: rijen("appel", [5, 4]) } },
    { t: "buur", n: 10, richting: "voor", plaatje: { v: BAL, gr: rijen("bal", [5, 5]) } },
  ],
  eind: "Jij weet welk getal ervoor en erna komt.",
});

/*
  Level 4: splitsen. Bovenaan een splitsbeen (het totaal, het deel dat je
  ziet, en een vraagteken); je ziet alleen wat buiten ligt, de rest zit in de
  doos (zak). Totalen 5 t/m 10; afleiders 1 hoger of lager. Squla: koeien bij
  een stal en muizen bij een hol; wij ballen bij een doos en knikkers bij een
  zak (het idee "een deel is verstopt" blijft hetzelfde).
*/
const mix3_4 = les({
  id: "squla-rekenmix-mix3-4",
  titel: "Rekenmix 3 (heel moeilijk)",
  oefening: "Rekenmix 3",
  level: 4,
  welkom: [`Er zijn ${g(6, "rood")} ballen.`, "Hoeveel zitten er in de doos?"],
  voorbeeld: [{ t: "splits", v: BAL, houder: "doos", tot: 5, buiten: 4, keuzes: [1, 2, 3] }],
  vragen: [
    { t: "splits", v: BAL, houder: "doos", tot: 6, buiten: 2, keuzes: [4, 5, 3] },
    { t: "splits", v: BAL, houder: "doos", tot: 5, buiten: 3, keuzes: [2, 1, 3] },
    { t: "splits", v: BAL, houder: "doos", tot: 8, buiten: 5, keuzes: [4, 3, 2] },
    { t: "splits", v: KNIKKER, houder: "zak", tot: 10, buiten: 7, keuzes: [3, 4, 2] },
    { t: "splits", v: KNIKKER, houder: "zak", tot: 9, buiten: 4, keuzes: [5, 6, 4] },
    { t: "splits", v: BAL, houder: "doos", tot: 7, buiten: 4, keuzes: [2, 3, 4] },
    { t: "splits", v: BAL, houder: "doos", tot: 9, buiten: 2, keuzes: [7, 6, 8] },
    { t: "splits", v: BAL, houder: "doos", tot: 10, buiten: 4, keuzes: [6, 5, 7] },
    { t: "splits", v: KNIKKER, houder: "zak", tot: 7, buiten: 2, keuzes: [4, 5, 6] },
    { t: "splits", v: KNIKKER, houder: "zak", tot: 8, buiten: 7, keuzes: [2, 1, 3] },
    { t: "splits", v: KNIKKER, houder: "zak", tot: 6, buiten: 5, keuzes: [1, 2, 3] },
    { t: "splits", v: BAL, houder: "doos", tot: 10, buiten: 2, keuzes: [8, 9, 7] },
    { t: "splits", v: KNIKKER, houder: "zak", tot: 5, buiten: 1, keuzes: [3, 4, 5] },
    { t: "splits", v: BAL, houder: "doos", tot: 9, buiten: 5, keuzes: [4, 3, 5] },
    { t: "splits", v: BAL, houder: "doos", tot: 8, buiten: 4, keuzes: [5, 4, 3] },
  ],
  eind: "Jij weet hoeveel er verstopt zijn.",
});

/* =====================================================================
   Rekenmix 4 (Squla 12435)
   ===================================================================== */

/*
  Level 1: tellen (ook in een druk plaatje: alleen één soort tellen), tellen
  in rijen van 5, en twee groepjes samen. Getallen 4 t/m 12. Squla gebruikt
  een stripfiguur; wij raketjes, ufo's, satellieten, planeten, sterren,
  knopen, ballen, appels en knikkers. De "stippen op de helm" worden knopen
  en aardbeien tellen (zelfde soort vraag: een klein aantal tellen).
*/
const mix4_1 = les({
  id: "squla-rekenmix-mix4-1",
  titel: "Rekenmix 4",
  oefening: "Rekenmix 4",
  level: 1,
  welkom: ["De ruimte staat vol raketjes, sterren en planeten.", "Tel alleen de raketjes."],
  beginMetVoorbeeld: true,
  /* Een druk plaatje zoals vraag 1, met 7 raketjes (in de vragen komen 8 voor). */
  voorbeeld: [{ t: "tel", v: RAKET, gr: los([{ naam: "raketje", n: 7 }, { naam: "ster", n: 3 }, { naam: "planeet", n: 2 }], 75, 820, 580, 120), keuzes: [7, 6, 8], soort: "druk" }],
  vragen: [
    { t: "tel", v: RAKET, gr: los([{ naam: "raketje", n: 8 }, { naam: "ster", n: 4 }, { naam: "planeet", n: 2 }], 61, 820, 580, 120), keuzes: [10, 8, 9], soort: "druk" },
    { t: "tel", v: KNOOP, gr: los([{ naam: "knoop", n: 6 }], 63, 620, 460, 130), keuzes: [5, 7, 6], soort: "tel" },
    { t: "tel", v: PLANEET, gr: rijen("planeet", [5, 5, 1], 100), keuzes: [11, 10, 12], soort: "tel" },
    { t: "tel", v: BAL, gr: tweeGroepen("bal", 3, 1), keuzes: [3, 4, 5], soort: "samen", delen: [3, 1] },
    { t: "tel", v: APPEL, gr: tweeGroepen("appel", 3, 3), keuzes: [6, 7, 5], soort: "samen", delen: [3, 3] },
    { t: "tel", v: UFO, gr: los([{ naam: "ufo", n: 5 }, { naam: "raketje", n: 3 }, { naam: "ster", n: 4 }], 67, 820, 580, 120), keuzes: [4, 5, 6], soort: "druk" },
    { t: "tel", v: AARDBEI, gr: los([{ naam: "aardbei", n: 5 }], 69, 620, 460, 130), keuzes: [5, 6, 4], soort: "tel" },
    { t: "tel", v: RAKET, gr: rijen("raketje", [5, 5, 2], 100), keuzes: [12, 11, 10], soort: "tel" },
    { t: "tel", v: KNIKKER, gr: tweeGroepen("knikker", 2, 2), keuzes: [4, 5, 3], soort: "samen", delen: [2, 2] },
    { t: "tel", v: BAL, gr: tweeGroepen("bal", 4, 3), keuzes: [7, 6, 8], soort: "samen", delen: [4, 3] },
    { t: "tel", v: SATELLIET, gr: los([{ naam: "satelliet", n: 6 }, { naam: "planeet", n: 3 }, { naam: "ster", n: 3 }], 71, 820, 580, 120), keuzes: [6, 7, 8], soort: "druk" },
    { t: "tel", v: KRAAL, gr: los([{ naam: "kraal", n: 4 }], 73, 620, 460, 130), keuzes: [3, 5, 4], soort: "tel" },
    { t: "tel", v: STER, gr: rijen("ster", [5, 4], 104), keuzes: [9, 8, 10], soort: "tel" },
    { t: "tel", v: APPEL, gr: tweeGroepen("appel", 4, 4), keuzes: [9, 8, 7], soort: "samen", delen: [4, 4] },
    { t: "tel", v: KNIKKER, gr: tweeGroepen("knikker", 5, 4, 100), keuzes: [9, 10, 8], soort: "samen", delen: [5, 4] },
  ],
  eind: "Jij telt alles in de ruimte.",
});

/*
  Level 2: slepen. Verder tellen na 10 (het eerste getal staat er al), groepjes
  van minder naar meer, getallen op raketjes van hoog naar laag, raketjes van
  dik naar dun, en wat gebeurt eerst en daarna. Getallen 8 t/m 16. Squla:
  een stripfiguur met een vuurpijl die ontploft; wij een taart, brood, een
  ijsje en een fruitspiesje (eerst, dan, en dan), en potloden, knikkers en
  sterren in plaats van lucifers.
*/
const mix4_2 = les({
  id: "squla-rekenmix-mix4-2",
  titel: "Rekenmix 4 (moeilijker)",
  oefening: "Rekenmix 4",
  level: 2,
  welkom: [`We tellen verder vanaf ${w(10)}.`, "Zet de getallen op hun plek."],
  voorbeeld: [{ t: "ordenGetal", getallen: [8, 6, 7], vast: 5, richting: "op" }],
  vragen: [
    { t: "ordenGetal", getallen: [12, 14, 11, 13], vast: 10, richting: "op" },
    { t: "ordenAantal", v: POTLOOD, aantallen: [10, 8, 9], richting: "op" },
    { t: "ordenGetal", getallen: [15, 16, 14], raketjes: true, richting: "af" },
    { t: "ordenMaat", woord: "dikdun", naam: "raketje", maten: [1.45, 0.65, 1.05] },
    { t: "gebeuren", verhaal: "taart", kaarten: [2, 0, 1] },
    { t: "ordenGetal", getallen: [14, 12, 15, 13], vast: 11, richting: "op" },
    { t: "ordenAantal", v: KNIKKER, aantallen: [9, 11, 10], richting: "op" },
    { t: "ordenGetal", getallen: [13, 15, 14], raketjes: true, richting: "af" },
    { t: "ordenMaat", woord: "dikdun", naam: "potlood", maten: [0.65, 1.1, 1.55] },
    { t: "gebeuren", verhaal: "brood", kaarten: [1, 2, 0] },
    { t: "ordenGetal", getallen: [16, 13, 15, 14], vast: 12, richting: "op" },
    { t: "ordenAantal", v: STER, aantallen: [8, 11, 9], richting: "op" },
    { t: "ordenGetal", getallen: [12, 14, 13], raketjes: true, richting: "af" },
    { t: "ordenMaat", woord: "dikdun", naam: "kaars", maten: [1.0, 1.45, 0.6] },
    { t: "gebeuren", verhaal: "ijs", kaarten: [2, 1, 0] },
  ],
  eind: "Jij zet alles in de goede volgorde.",
});

/*
  Level 3: welke kaart heeft dit aantal? Drie groepjes; kies de groep met het
  gevraagde aantal. Eerst los door elkaar (echt tellen), dan in rijen met een
  vijfstructuur (snel zien). Getallen 4 t/m 10; afleiders 1 of 2 meer/minder.
  Squla: egels, kikkers, bomen, helmen, vuurpijlen; wij sterren, bomen,
  ballen, raketjes, planeten, knikkers, appels, aardbeien en kralen.
*/
const kr = (naam: string, lengtes: number[]) => kaartGroep(naam, lengtes, 57);
/* Los door elkaar, maar compact: zo blijft er ruimte tussen de groepjes en zie je welke dingen bij elkaar horen. */
/* Herstel 7 november (OVERZICHT-C mix4-3, mix4-4): de groepjes lagen zo verspreid dat ze in elkaar overliepen; nu
   compacter (kleiner gebied, iets kleinere dingen), zodat er duidelijk lucht tussen de groepjes is. */
const kv = (naam: string, n: number, zaad: number) => kaartLos(naam, n, zaad, n > 8 ? 284 : 214, n > 6 ? 236 : 214, 70);
const bomen = (n: number) => kaartRaster("boom", n, 290, 330, 90);
const mix4_3 = les({
  id: "squla-rekenmix-mix4-3",
  titel: "Rekenmix 4 (nog moeilijker)",
  oefening: "Rekenmix 4",
  level: 3,
  welkom: ["3 groepjes sterren in de ruimte.", `Waar zie je ${g(6, "geel")} sterren?`],
  voorbeeld: [{ t: "welke", v: STER, groepen: [kv("ster", 3, 81), kv("ster", 5, 83), kv("ster", 4, 85)], vraagt: "is", n: 4 }],
  vragen: [
    { t: "welke", v: STER, groepen: [kv("ster", 6, 87), kv("ster", 8, 89), kv("ster", 5, 91)], vraagt: "is", n: 6 },
    { t: "welke", v: BOOM, groepen: [bomen(5), bomen(4), bomen(6)], vraagt: "is", n: 5 },
    { t: "welke", v: BAL, groepen: [kv("bal", 5, 93), kv("bal", 4, 95), kv("bal", 6, 97)], vraagt: "is", n: 4 },
    { t: "welke", v: RAKET, groepen: [kr("raketje", [5, 3]), kr("raketje", [5, 1]), kr("raketje", [5, 2])], vraagt: "is", n: 8 },
    { t: "welke", v: PLANEET, groepen: [kr("planeet", [5, 5]), kr("planeet", [5, 4]), kr("planeet", [5, 3])], vraagt: "is", n: 9 },
    { t: "welke", v: KNIKKER, groepen: [kv("knikker", 7, 99), kv("knikker", 9, 101), kv("knikker", 6, 103)], vraagt: "is", n: 7 },
    { t: "welke", v: BOOM, groepen: [bomen(6), bomen(7), bomen(5)], vraagt: "is", n: 6 },
    { t: "welke", v: APPEL, groepen: [kv("appel", 4, 105), kv("appel", 6, 107), kv("appel", 5, 109)], vraagt: "is", n: 5 },
    { t: "welke", v: STER, groepen: [kr("ster", [5, 3]), kr("ster", [5, 1]), kr("ster", [5, 2])], vraagt: "is", n: 6 },
    { t: "welke", v: BAL, groepen: [kr("bal", [5, 4]), kr("bal", [5, 5]), kr("bal", [5, 3])], vraagt: "is", n: 10 },
    { t: "welke", v: AARDBEI, groepen: [kv("aardbei", 8, 111), kv("aardbei", 7, 113), kv("aardbei", 10, 115)], vraagt: "is", n: 8 },
    { t: "welke", v: BOOM, groepen: [bomen(5), bomen(4), bomen(3)], vraagt: "is", n: 4 },
    { t: "welke", v: KRAAL, groepen: [kv("kraal", 9, 117), kv("kraal", 8, 119), kv("kraal", 6, 121)], vraagt: "is", n: 9 },
    { t: "welke", v: RAKET, groepen: [kr("raketje", [5, 2]), kr("raketje", [5, 4]), kr("raketje", [5, 1])], vraagt: "is", n: 7 },
    { t: "welke", v: KNIKKER, groepen: [kr("knikker", [5, 3]), kr("knikker", [5, 4]), kr("knikker", [5, 5])], vraagt: "is", n: 9 },
  ],
  eind: "Jij vindt elk aantal.",
});

/*
  Level 4: meer dan, minder dan, evenveel (bovenaan een hint: één ding, of de
  groep om mee te vergelijken), en de laatste en middelste in een rij van 5
  (welke kleur?). Getallen 3 t/m 8. Squla: kikkers met gekleurde T-shirts en
  vogels in een boom; wij ballonnen in vijf kleuren en appels.
*/
const mix4_4 = les({
  id: "squla-rekenmix-mix4-4",
  titel: "Rekenmix 4 (heel moeilijk)",
  oefening: "Rekenmix 4",
  level: 4,
  welkom: ["3 groepjes raketjes in de ruimte.", `Waar zie je meer dan ${g(4, "rood")} raketjes?`],
  beginMetVoorbeeld: true,
  voorbeeld: [
    { t: "welke", v: RAKET, groepen: [kr("raketje", [4]), kr("raketje", [3]), kr("raketje", [5])], vraagt: "meer", n: 4 },
    { t: "kleurrij", rij: ["rood", "groen", "geel", "blauw", "paars"], wat: "middelste", keuzes: ["geel", "rood", "blauw"] },
  ],
  vragen: [
    { t: "welke", v: RAKET, groepen: [kr("raketje", [5]), kr("raketje", [5, 1]), kr("raketje", [4])], vraagt: "meer", n: 5 },
    { t: "welke", v: STER, groepen: [kr("ster", [5, 1]), kr("ster", [5, 2]), kr("ster", [5])], vraagt: "minder", n: 6 },
    { t: "welke", v: APPEL, voorbeeld: kv("appel", 7, 131), groepen: [kv("appel", 6, 133), kv("appel", 7, 135), kv("appel", 8, 137)], vraagt: "evenveel", n: 7 },
    { t: "kleurrij", rij: ["groen", "rood", "paars", "geel", "blauw"], wat: "laatste", keuzes: ["geel", "blauw", "rood"] },
    { t: "kleurrij", rij: ["groen", "rood", "paars", "geel", "blauw"], wat: "middelste", keuzes: ["rood", "paars", "groen", "geel"] },
    { t: "welke", v: BAL, groepen: [kr("bal", [3]), kr("bal", [2]), kr("bal", [4])], vraagt: "meer", n: 3 },
    { t: "welke", v: KNIKKER, groepen: [kr("knikker", [4]), kr("knikker", [3]), kr("knikker", [5])], vraagt: "minder", n: 4 },
    { t: "welke", v: STER, voorbeeld: kv("ster", 5, 139), groepen: [kv("ster", 5, 141), kv("ster", 4, 143), kv("ster", 6, 145)], vraagt: "evenveel", n: 5 },
    { t: "kleurrij", rij: ["geel", "blauw", "groen", "rood", "oranje"], wat: "laatste", keuzes: ["oranje", "geel", "blauw"] },
    { t: "kleurrij", rij: ["geel", "blauw", "groen", "rood", "oranje"], wat: "middelste", keuzes: ["blauw", "groen", "rood", "geel"] },
    { t: "welke", v: APPEL, groepen: [kr("appel", [5, 1]), kr("appel", [5, 2]), kr("appel", [5])], vraagt: "meer", n: 6 },
    { t: "welke", v: RAKET, groepen: [kr("raketje", [5, 3]), kr("raketje", [5, 2]), kr("raketje", [5, 1])], vraagt: "minder", n: 7 },
    { t: "welke", v: BAL, voorbeeld: kv("bal", 8, 147), groepen: [kv("bal", 7, 149), kv("bal", 8, 151), kv("bal", 6, 153)], vraagt: "evenveel", n: 8 },
    { t: "kleurrij", rij: ["paars", "oranje", "rood", "blauw", "geel"], wat: "laatste", keuzes: ["rood", "geel", "paars"] },
    { t: "kleurrij", rij: ["paars", "oranje", "rood", "blauw", "geel"], wat: "middelste", keuzes: ["oranje", "blauw", "rood", "groen"] },
  ],
  eind: "Jij weet wat meer dan en minder dan is.",
});

export const LESSEN_SQULA_REKENMIX: Lesdraaiboek[] = [mix1_1, mix1_2, mix1_3, mix1_4, mix2_1, mix2_2, mix2_3, mix2_4, mix3_1, mix3_2, mix3_3, mix3_4, mix4_1, mix4_2, mix4_3, mix4_4];
