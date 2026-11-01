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

import type { Lesdraaiboek, Lesgids } from "../soort";
import { squlaBegin, squlaEind, squlaVraag } from "./squla-hulp";
import { KaartRekenmix, SqulaRekenmix, type RMKleur, type RMLabel, type RMOpgave, type RMProps, type RMStuk, type RMTekening, type RMVorm } from "../vlakken/squla-rekenmix-vlak";

/* =====================================================================
   Voorwerpen en kleuren
   ===================================================================== */

/** Een ding om te tellen: de naam van het vaste plaatje, het meervoud, en de kleur van het getal in de zin. */
type Vw = { naam: string; meer: string; k: string };
const vw = (naam: string, meer: string, k: string): Vw => ({ naam, meer, k });

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
const PLANEET = vw("planeet", "planeten", "blauw");
const BOOM = vw("boom", "bomen", "groen");
const UFO = vw("ufo", "ufo's", "paars");
const SATELLIET = vw("satelliet", "satellieten", "groen");
const KNOOP = vw("knoop", "knopen", "blauw");

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
type Groep = { tek: RMTekening; stappen: Stap[]; n: number };

const ding = (naam: string, x: number, y: number, m: number, extra: Partial<Extract<RMStuk, { t: "vw" }>> = {}): RMStuk => ({ t: "vw", naam, x, y, m, ...extra });

/** Rijen voorwerpen, links uitgelijnd; elke rij is een telstap (het getal komt achter de rij). */
function rijen(naam: string, lengtes: number[], cel = 104): Groep {
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

/** Twee groepjes: boven en onder (samen tellen). */
function tweeGroepen(naam: string, a: number, b: number, cel = 110): Groep {
  const stukken: RMStuk[] = [];
  const stappen: Stap[] = [];
  const kol = Math.max(a, b);
  const breed = kol * cel;
  [a, b].forEach((n, r) => {
    const y = r === 0 ? -cel * 0.85 : cel * 0.85;
    for (let i = 0; i < n; i++) {
      const x = -breed / 2 + (i + 0.5) * cel;
      stappen.push({ idx: [stukken.length], lx: x, ly: y - cel * 0.6 });
      stukken.push(ding(naam, x, y, cel * 0.84));
    }
  });
  return { tek: { stukken, b: breed + 40, h: cel * 3 }, stappen, n: a + b };
}

/** Een kaartje met een groep in rijen van 5 (voor op volgorde, verbinden en "welke kaart"). */
function kaartGroep(naam: string, lengtes: number[], cel = 46): Groep {
  const kol = Math.max(...lengtes);
  const b = kol * cel;
  const h = lengtes.length * cel;
  const stukken: RMStuk[] = [];
  lengtes.forEach((len, r) => {
    for (let i = 0; i < len; i++) stukken.push(ding(naam, -b / 2 + (i + 0.5) * cel, -h / 2 + (r + 0.5) * cel, cel * 0.86));
  });
  const n = stukken.length;
  return { tek: { stukken, b: b + 16, h: h + 16 }, stappen: [{ idx: stukken.map((_, i) => i), lx: 0, ly: -h / 2 - 34 }], n };
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

function toonOpgave(l: Lesgids, st: Stand, o: RMOpgave, test: number[] | null = null) {
  if (st.huidig === o.id) return;
  st.huidig = o.id;
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
    aan.push(...stap.idx);
    n += stap.idx.length;
    labels.push({ deel, x: stap.lx, y: stap.ly, tekst: String(n), klein: stap.idx.length === 1 });
    zet(l, { licht: { deel, aan: [...aan] } });
    zetLabels(l, st, labels);
    if (losse) {
      reeks.push(g(n, k));
      await l.wacht(320);
    } else await l.zeg(`${g(n, k)}.`);
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
    labels.push({ deel: delen[i], x: gr.stappen[0].lx, y: gr.stappen[0].ly, tekst: String(gr.n) });
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
  | { t: "hoeveel"; ding: "boterham" | "spies"; keuzes: number[]; wat: "meer" | "minder" | "evenveel" | "meest" | "minst" }
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
};

const KLEUR_RM: Record<Kleurnaam, RMKleur> = { rood: "rood", geel: "geel", blauw: "blauw", groen: "groen", paars: "paars", oranje: "oranje" };
/** "rode", "gele" … (vóór een de-woord); bij het-woord vierkant zonder -e. */
const BIJV: Record<Kleurnaam, string> = { rood: "rode", geel: "gele", blauw: "blauwe", groen: "groene", paars: "paarse", oranje: "oranje" };
const eenKleurVorm = (k: Kleurnaam, v: Vormnaam) => (v === "vierkant" ? `een ${k} vierkant` : `een ${BIJV[k]} ${v}`);

const VORM_UITLEG: Record<Vormnaam, string[]> = {
  cirkel: ["Een cirkel is helemaal rond.", "Hij heeft geen hoeken."],
  driehoek: ["Een driehoek heeft drie hoeken.", "En drie rechte kanten."],
  vierkant: ["Een vierkant heeft vier hoeken.", "Alle kanten zijn even lang."],
  rechthoek: ["Een rechthoek heeft ook vier hoeken.", "Twee kanten zijn lang, twee zijn kort."],
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

/** Een kaart met één ding in een maat: `schaal` (klein/groot), `breed` (dik/dun), of een toren van blokken (laag). */
function maatKaart(woord: Maatwoord, naam: string, maat: number): RMTekening {
  const B = 230;
  const H = 250;
  if (woord === "laag") {
    const m = 54;
    const stukken = Array.from({ length: maat }, (_, k) => ding(naam, 0, H / 2 - 8 - m / 2 - k * (m - 4), m));
    return { stukken, b: B, h: H };
  }
  if (woord === "dik" || woord === "dun" || woord === "dikdun") return { stukken: [ding(naam, 0, 6, 220, { sx: maat })], b: B, h: H };
  const m = 230 * maat;
  return { stukken: [ding(naam, 0, H / 2 - 8 - m * 0.47, m)], b: B, h: H };
}

/* ---------- verhaaltjes (volgorde van gebeuren) ---------- */

const VERHAAL: Record<Verhaal, { namen: [string, string, string]; zinnen: [string, string, string] }> = {
  taart: { namen: ["beslagkom", "oven-taart", "taart"], zinnen: ["Eerst maak je beslag in een kom.", "Dan bakt de taart in de oven.", "En dan is de taart klaar."] },
  brood: { namen: ["deegkom", "oven-brood", "brood"], zinnen: ["Eerst maak je deeg in een kom.", "Dan bakt het brood in de oven.", "En dan is het brood klaar."] },
  spies: { namen: ["spies-leeg", "spies-twee", "spies-vol"], zinnen: ["Eerst is het spiesje nog leeg.", "Dan prik je er twee stukjes fruit op.", "En dan zit het spiesje vol."] },
  ijs: { namen: ["hoorntje", "ijsje", "ijsje-twee-bollen"], zinnen: ["Eerst heb je een leeg hoorntje.", "Dan komt er een bolletje ijs op.", "En dan nog een bolletje erbij."] },
};

/* ---------- hoeveelheden (kaas, fruit) ---------- */

const HOEVEEL = {
  boterham: { namen: ["boterham-weinig-kaas", "boterham-veel-kaas", "boterham-heel-veel-kaas"], ding: "boterham", wat: "kaas", lw: "de", welk: "welke boterham", het: "de" },
  spies: { namen: ["spies-leeg", "spies-twee", "spies-vol"], ding: "spiesje", wat: "fruit", lw: "het", welk: "welk spiesje", het: "het" },
} as const;

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
  else stukken = [ding("bal", kant * 55, -36, 90), doos];
  return { stukken, b: 640, h: 400 };
}

/* ---------- splitsen ---------- */

function splitsTekening(v: Vw, houder: "doos" | "zak", tot: number, buiten: number): Groep {
  const stukken: RMStuk[] = [
    { t: "lijn", x1: -270, y1: -200, x2: -350, y2: -90 },
    { t: "lijn", x1: -270, y1: -200, x2: -190, y2: -90 },
    { t: "rondje", tekst: String(tot), x: -270, y: -200, r: 46 },
    { t: "rondje", tekst: String(buiten), x: -350, y: -90, r: 40 },
    { t: "rondje", tekst: "?", x: -190, y: -90, r: 40, licht: true },
    ding(houder, 230, 110, 280),
  ];
  const stappen: Stap[] = [];
  const cel = 84;
  const lengtes = rijenVan5(buiten);
  lengtes.forEach((len, r) => {
    for (let i = 0; i < len; i++) {
      const x = -400 + (i + 0.5) * cel;
      const y = 150 + (r - (lengtes.length - 1) / 2) * cel;
      stappen.push({ idx: [stukken.length], lx: x, ly: y - cel * 0.58 });
      stukken.push(ding(v.naam, x, y, cel * 0.84));
    }
  });
  return { tek: { stukken, b: 900, h: 560 }, stappen, n: buiten };
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
  const kiesGetal = (keuzes: number[]) => async () => Number(await l.kies(keuzes.map(String), { weetniet: false, direct: true }));

  /* ---------- tellen ---------- */
  if (q.t === "tel") {
    const o: RMOpgave = { id, soort: "kijk", boven: q.gr.tek };
    const n = q.gr.n;
    const k = q.v.k;
    const sprongen = q.gr.stappen.every((s) => s.idx.length === 2);
    const rijtjes = !sprongen && q.gr.stappen.some((s) => s.idx.length > 2);
    const vraag =
      q.soort === "samen" ? [`Hoeveel ${q.v.meer} zijn het samen?`] : q.soort === "druk" ? [`Tel alleen de ${q.v.meer}.`, "Hoeveel zijn het er?"] : [`Tel de ${q.v.meer}.`, "Hoeveel zijn het er?"];
    /* Waar Bliepo stopt met samen tellen: bij rijen en sprongen voor de laatste stap, bij losse dingen voor de laatste twee. */
    const stop = rijtjes || sprongen ? Math.max(1, q.gr.stappen.length - 1) : Math.max(1, q.gr.stappen.length - 2);
    const begin = q.gr.stappen.slice(0, stop).reduce((t, s) => t + s.idx.length, 0);
    return {
      o,
      soort: `tel-${q.soort}`,
      eerste: [],
      vraag,
      antwoord: kiesGetal(q.keuzes),
      isGoed: (x) => x === n,
      noem: (x) => g(x as number, k),
      goedBeeld: () => zet(l, { goed: { deel: "b", keer: ++st.keer }, licht: null }),
      goedZin: q.soort === "samen" && q.delen ? [`Ja! ${g(q.delen[0], k)} en ${g(q.delen[1], k)} is samen ${g(n, k)}.`] : [`Ja! Het zijn er ${g(n, k)}.`],
      samen: async (alles) => {
        if (sprongen) await l.zeg("We tellen in sprongen van twee.");
        else if (rijtjes) await l.zeg("We tellen samen, rij voor rij.");
        else await l.zeg(q.soort === "druk" ? `We tellen alleen de ${q.v.meer}.` : "Tel maar mee.");
        const tot = await telMee(l, st, "b", q.gr, k, alles ? q.gr.stappen.length : stop);
        if (alles) await l.zeg(`Het zijn er ${g(tot, k)}.`);
        else await l.zeg(`Tel jij verder vanaf ${g(tot, k)}?`);
      },
      tip: sprongen ? [`Begin bij ${g(begin, k)}.`, "Tel er steeds twee bij."] : [`Begin bij ${g(begin, k)}.`, "Tel de rest één voor één."],
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
      eerste: ["Kijk goed naar het plaatje bovenaan.", "Tik dan op een vorm."],
      vraag: [`Kijk naar ${q.zin}.`, "Welke vorm lijkt erop?"],
      antwoord: () => tikKeuze(l),
      isGoed: (x) => x === goedI,
      noem: (x) => `Een ${q.keuzes[x as number]}`,
      goedBeeld: () => zet(l, { goed: { deel: `k${goedI}`, keer: ++st.keer } }),
      goedZin: [`Ja! ${Hoofd(q.zin)} ${lijkt} op een ${q.vorm}.`, VORM_UITLEG[q.vorm][0]],
      fout: (x) => zet(l, { fout: { deel: `k${x as number}`, keer: ++st.keer } }),
      samen: async (alles) => {
        await l.zeg("We kijken samen naar de vormen.");
        await vormenUitleggen(l, st, q.keuzes, 170);
        if (alles) return;
        await l.zeg(`Kijk nu weer naar ${q.zin}.`);
      },
      tip: ["Is het rond, of heeft het hoeken?", "Tel de hoeken maar."],
      testAntwoord: `keuze-${goedI}`,
    };
  }

  /* ---------- links, rechts, midden ---------- */
  if (q.t === "plaats") {
    const o: RMOpgave = { id, soort: "kijk", boven: rijDingen(q.rij, 210, 270), keuzes: q.keuzes.map((n) => eenDing(n, 190)), namen: q.keuzes.map((n) => Hoofd(NAAM[n])) };
    const plek = q.wat === "links" ? 0 : q.wat === "rechts" ? 2 : 1;
    const goedNaam = q.rij[plek];
    const goedI = q.keuzes.indexOf(goedNaam);
    const waar = q.wat === "midden" ? "in het midden" : q.wat;
    const UITLEG = {
      links: "Links staat de eerste van de rij.",
      rechts: "Rechts staat de laatste van de rij.",
      midden: "In het midden staat hij tussen de andere twee in.",
    } as const;
    return {
      o,
      soort: "plaats",
      eerste: ["Kijk naar de rij bovenaan.", "Tik dan op het goede plaatje."],
      vraag: ["Kijk naar de rij.", `Wat staat er ${waar}?`],
      antwoord: () => tikKeuze(l),
      isGoed: (x) => x === goedI,
      noem: (x) => Hoofd(NAAM[q.keuzes[x as number]]),
      goedBeeld: () => zet(l, { goed: { deel: `k${goedI}`, keer: ++st.keer }, licht: { deel: "b", aan: [plek] } }),
      goedZin: [`Ja! ${Hoofd(NAAM[goedNaam])} staat ${waar}.`, UITLEG[q.wat]],
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
    const o: RMOpgave = { id, soort: "kijk", boven: rijDingen(q.rij, 150, 185), keuzes: q.keuzes.map((n) => eenDing(n, 150)), namen: q.keuzes.map((n) => Hoofd(NAAM[n])) };
    const RANG = ["eerste", "tweede", "derde", "vierde", "laatste"];
    const goedNaam = q.rij[q.plek];
    const goedI = q.keuzes.indexOf(goedNaam);
    const rang = RANG[q.plek];
    return {
      o,
      soort: "rang",
      eerste: ["Kijk naar de rij bovenaan.", "We tellen vanaf links.", "Tik dan op het goede plaatje."],
      vraag: [`Wat staat als ${rang} in de rij?`],
      antwoord: () => tikKeuze(l),
      isGoed: (x) => x === goedI,
      noem: (x) => Hoofd(NAAM[q.keuzes[x as number]]),
      goedBeeld: () => zet(l, { goed: { deel: `k${goedI}`, keer: ++st.keer }, licht: { deel: "b", aan: [q.plek] } }),
      goedZin: [`Ja! ${Hoofd(NAAM[goedNaam])} staat als ${rang}.`, q.plek === 4 ? "Helemaal achteraan in de rij." : q.plek === 0 ? "Helemaal vooraan in de rij." : `Tel maar: ${RANG.slice(0, q.plek + 1).join(", ")}.`],
      fout: (x) => zet(l, { fout: { deel: `k${x as number}`, keer: ++st.keer } }),
      samen: async (alles) => {
        if (q.plek === 0 && !alles) {
          await l.zeg("We tellen vanaf links.", "De eerste staat helemaal vooraan, links.");
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
        if (!alles) await l.zeg(q.plek === 4 ? "De laatste staat helemaal achteraan." : `Welke komt daarna, als ${rang}?`);
      },
      tip: q.plek === 4 ? ["De laatste staat helemaal rechts."] : ["Tel vanaf links: eerste, tweede, derde …"],
      testAntwoord: `keuze-${goedI}`,
    };
  }

  /* ---------- groepjes op volgorde ---------- */
  if (q.t === "ordenAantal") {
    const groepen = q.aantallen.map((n) => kaartGroep(q.v.naam, rijenVan5(n), 44));
    const o: RMOpgave = { id, soort: "volgorde", kaarten: groepen.map((x) => x.tek), namen: q.aantallen.map((n) => `${n} ${q.v.meer}`) };
    const goed = q.aantallen.map((n, i) => ({ n, i })).sort((a, b) => (q.richting === "op" ? a.n - b.n : b.n - a.n)).map((x) => x.i);
    const k = q.v.k;
    const rij = goed.map((i) => g(q.aantallen[i], k)).join(", ");
    return {
      o,
      test: goed,
      soort: "orden",
      eerste: ["Sleep de groepjes naar de plekjes.", "Het eerste plekje is links."],
      vraag: [`Hier liggen ${q.v.meer}.`, `Zet ze op volgorde, van ${q.richting === "af" ? "meer naar minder" : "minder naar meer"}.`],
      antwoord: () => sleepOpVolgorde(l, st),
      isGoed: (x) => (x as number[]).every((i, p) => i === goed[p]),
      noem: () => "Deze volgorde",
      goedBeeld: () => zet(l, { goed: { deel: "*", keer: ++st.keer } }),
      goedZin: [`Ja! ${rij}.`, q.richting === "af" ? "Het worden er steeds minder." : "Het worden er steeds meer."],
      fout: (x) => zet(l, { plekGoed: (x as number[]).map((i, p) => i === goed[p]) }),
      samen: async () => {
        zet(l, { ronde: ++st.ronde, plekGoed: null });
        await l.wacht(300);
        await l.zeg("We tellen elk groepje.");
        await kaartenTellen(l, st, groepen.map((_, i) => `k${i}`), groepen, k, (n) => `Hier zijn het er ${g(n, k)}.`);
        await l.zeg(q.richting === "af" ? "De meeste komt vooraan." : "De minste komt vooraan.");
      },
      tip: [q.richting === "af" ? "Begin met de meeste." : "Begin met de minste.", "Die zet je op het eerste plekje."],
      testAntwoord: `kaart-${goed[0]}`,
    };
  }

  /* ---------- klein, kleiner, kleinst ---------- */
  if (q.t === "ordenMaat") {
    const kaarten = q.maten.map((m) => maatKaart(q.woord, q.naam, m));
    const woorden = MAATWOORDEN[q.woord];
    const o: RMOpgave = { id, soort: "volgorde", kaarten, namen: q.maten.map((_, i) => `Kaart ${i + 1}`) };
    const goed = q.maten.map((m, i) => ({ m, i })).sort((a, b) => (OPLOPEND[q.woord] ? a.m - b.m : b.m - a.m)).map((x) => x.i);
    const slotLabels = (): RMLabel[] => woorden.map((wd, p) => ({ deel: `s${p}`, x: 0, y: -150, tekst: wd, klein: true })).filter((lb) => lb.tekst);
    const dikDun = q.woord === "dikdun";
    return {
      o,
      test: goed,
      soort: "orden",
      eerste: ["Sleep de plaatjes naar de plekjes.", "Het eerste plekje is links."],
      vraag: dikDun ? ["Zet ze op volgorde, van dik naar dun."] : [`Zet op volgorde: ${woorden.join(", ")}.`],
      antwoord: () => sleepOpVolgorde(l, st),
      isGoed: (x) => (x as number[]).every((i, p) => i === goed[p]),
      noem: () => "Deze volgorde",
      goedBeeld: () => {
        zet(l, { goed: { deel: "*", keer: ++st.keer } });
        zetLabels(l, st, slotLabels());
      },
      goedZin: dikDun ? ["Ja! Van dik naar dun.", "De dunste staat achteraan."] : [`Ja! ${woorden.map(Hoofd).join(", ")}.`, `De ${ALLER[q.woord].replace("aller", "")} staat achteraan.`],
      fout: (x) => zet(l, { plekGoed: (x as number[]).map((i, p) => i === goed[p]) }),
      samen: async () => {
        zet(l, { ronde: ++st.ronde, plekGoed: null });
        zetLabels(l, st, slotLabels());
        if (dikDun) {
          await l.zeg("Dik is breed. Dun is smal.", "De dikste komt vooraan.", "De dunste komt achteraan.");
          return;
        }
        await l.zeg(`Kijk: ${woorden[0]}, ${woorden[1]}, ${woorden[2]}.`);
        await l.zeg(`${Hoofd(woorden[2])} is de ${ALLER[q.woord]}.`, "Die gaat op het laatste plekje.");
        await l.zeg(`Op het eerste plekje komt ${woorden[0]}.`);
      },
      tip: dikDun ? ["Begin met de allerdikste.", "Die zet je vooraan."] : [`Zoek eerst de ${ALLER[q.woord]}.`, "Die zet je achteraan."],
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
      eerste: [telrij ? "Sleep de getallen naar de plekjes." : "Sleep de raketjes naar de plekjes.", "Het eerste plekje is links."],
      vraag: telrij ? [`We tellen verder vanaf ${w(q.vast!)}.`, "Zet de getallen op hun plek."] : ["Kijk naar de getallen.", "Zet ze op volgorde, van hoog naar laag."],
      antwoord: () => sleepOpVolgorde(l, st),
      isGoed: (x) => (x as number[]).every((i, p) => i === goed[p]),
      noem: () => "Deze volgorde",
      goedBeeld: () => zet(l, { goed: { deel: "*", keer: ++st.keer } }),
      goedZin: telrij ? [`Ja! ${rij}.`, "Steeds één verder."] : [`Ja! ${rij}.`, "Van hoog naar laag."],
      fout: (x) => zet(l, { plekGoed: (x as number[]).map((i, p) => i === goed[p]) }),
      samen: async () => {
        zet(l, { ronde: ++st.ronde, plekGoed: null });
        if (telrij) {
          zet(l, { licht: { deel: "v0", aan: [0] } });
          await l.zeg(`Op het eerste plekje staat ${w(q.vast!)}.`, `Na ${w(q.vast!)} komt het getal dat één meer is.`, "Daarna weer één meer, en zo verder.");
          zet(l, { licht: null });
        } else {
          await l.zeg("Hoog is het grootste getal.", "Laag is het kleinste getal.");
          const klein = Math.min(...q.getallen);
          await l.zeg(`Tel maar mee: ${[0, 1, 2].map((d) => w(klein + d)).join(", ")}.`, "Welk getal kwam het laatst? Dat is het hoogst.");
        }
      },
      tip: telrij ? [`Welk getal komt na ${w(q.vast!)}?`, "Dat zet je op het lege plekje ernaast."] : ["Begin met het grootste getal.", "Dat zet je op het eerste plekje."],
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
      eerste: ["Sleep de plaatjes naar de plekjes.", "Het eerste plekje is links."],
      vraag: ["Wat gebeurt eerst?", "En wat daarna?", "Zet de plaatjes op volgorde."],
      antwoord: () => sleepOpVolgorde(l, st),
      isGoed: (x) => (x as number[]).every((i, p) => i === goed[p]),
      noem: () => "Deze volgorde",
      goedBeeld: () => zet(l, { goed: { deel: "*", keer: ++st.keer } }),
      goedZin: ["Ja!", ...vh.zinnen],
      fout: (x) => zet(l, { plekGoed: (x as number[]).map((i, p) => i === goed[p]) }),
      samen: async () => {
        zet(l, { ronde: ++st.ronde, plekGoed: null });
        await l.zeg("Ik vertel het verhaal.", ...vh.zinnen);
      },
      tip: ["Wat doe je als allereerste?", "Dat plaatje zet je vooraan."],
      testAntwoord: `kaart-${goed[0]}`,
    };
  }

  /* ---------- meer, minder, evenveel kaas ---------- */
  if (q.t === "hoeveel") {
    const h = HOEVEEL[q.ding];
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
        ? [`Ja! Daar zit evenveel ${h.wat} op als bovenaan.`]
        : metVoorbeeld
          ? [`Ja! Daar zit ${q.wat} ${h.wat} op dan bovenaan.`]
          : [`Ja! Daar zit ${h.lw} ${q.wat === "meest" ? "meeste" : "minste"} ${h.wat} op.`];
    const woordUitleg =
      q.wat === "meer"
        ? [`Meer ${h.wat}: je ziet méér ${h.wat} dan bovenaan.`]
        : q.wat === "minder"
          ? [`Minder ${h.wat}: je ziet minder ${h.wat} dan bovenaan.`]
          : q.wat === "evenveel"
            ? [`Evenveel ${h.wat}: precies zoveel als bovenaan.`, "Niet meer en niet minder."]
            : q.wat === "meest"
              ? [`${Hoofd(h.lw)} meeste ${h.wat}: daar zit het allermeeste op.`]
              : [`${Hoofd(h.lw)} minste ${h.wat}: daar zit het allerminste op.`];
    return {
      o,
      soort: metVoorbeeld ? "hoeveel-vb" : "hoeveel",
      eerste: metVoorbeeld ? ["Kijk eerst naar het plaatje bovenaan.", "Tik dan op een plaatje eronder."] : ["Kijk goed naar de drie plaatjes.", "Tik dan op het goede plaatje."],
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
        await l.zeg(metVoorbeeld ? "Vergelijk elk plaatje met dat bovenaan." : "Vergelijk de drie plaatjes.");
        for (let i = 0; i < q.keuzes.length; i++) {
          zet(l, { licht: { deel: `k${i}`, aan: [0], dof: false } });
          await l.wacht(900);
        }
        zet(l, { licht: null });
      },
      tip:
        q.wat === "meer" || q.wat === "meest"
          ? [`Zoek waar ${h.lw} meeste ${h.wat} op zit.`]
          : q.wat === "minder" || q.wat === "minst"
            ? [`Zoek waar ${h.lw} minste ${h.wat} op zit.`]
            : ["Zoek het plaatje dat er net zo uitziet als bovenaan."],
      testAntwoord: `keuze-${goedI}`,
    };
  }

  /* ---------- waar ligt de bal? ---------- */
  if (q.t === "waar") {
    const o: RMOpgave = { id, soort: "kijk", boven: waarTekening(q.plek, q.kant) };
    const opties = q.keuzes.map((p) => PLEKZIN[p]);
    const balI = q.plek === "achter" ? 0 : 1;
    return {
      o,
      soort: "waar",
      eerste: [],
      vraag: ["Waar ligt de bal?", `${Hoofd(opties[0])}, ${opties[1]} of ${opties[2]}?`],
      antwoord: async () => await l.kies(opties.map(Hoofd), { weetniet: false, direct: true }),
      isGoed: (x) => x === Hoofd(PLEKZIN[q.plek]),
      noem: (x) => String(x),
      goedBeeld: () => zet(l, { goed: { deel: "b", keer: ++st.keer } }),
      goedZin: [`Ja! De bal ligt ${PLEKZIN[q.plek]}.`, Hoofd(PLEKUITLEG[q.plek].split(": ")[1])],
      samen: async (alles) => {
        zet(l, { licht: { deel: "b", aan: [balI] } });
        await l.zeg("Kijk goed naar de bal.", "Zie je de hele bal, of maar een stukje?");
        zet(l, { licht: null });
        for (const p of alles ? [q.plek] : q.keuzes) await l.zeg(PLEKUITLEG[p]);
      },
      tip: ["Kijk waar de bal is.", "Zie je de hele bal, of maar een stukje?"],
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
      eerste: ["Tik op de goede vorm."],
      vraag: [`Waar zie je ${eenKleurVorm(q.kleur, q.vorm)}?`],
      antwoord: () => tikKeuze(l),
      isGoed: (x) => x === goedI,
      noem: (x) => Hoofd(eenKleurVorm(...q.keuzes[x as number])),
      goedBeeld: () => zet(l, { goed: { deel: `k${goedI}`, keer: ++st.keer } }),
      goedZin: [
        `Ja! ${Hoofd(eenKleurVorm(q.kleur, q.vorm))}.`,
        q.vorm === "cirkel"
          ? `Hij is ${q.kleur} en helemaal rond.`
          : q.vorm === "driehoek"
            ? `Hij is ${q.kleur} en heeft drie hoeken.`
            : q.vorm === "vierkant"
              ? `Het is ${q.kleur} en alle kanten zijn even lang.`
              : `Hij is ${q.kleur}, met twee lange en twee korte kanten.`,
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
      tip: [`Zoek eerst de vormen die ${q.kleur} zijn.`, `Welke daarvan is ${q.vorm === "vierkant" ? "een vierkant" : `een ${q.vorm}`}?`],
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
        for (let i = 0; i < len; i++) stukken.push({ t: "vorm", vorm: "blokje", kleur: "geel", x: -2.5 * cel + (i + 0.5) * cel - 30, y: (r - 0.5) * cel * 1.1, m: cel * 0.9 });
      }
      return { stukken, b: 5 * cel + 140, h: 2 * cel * 1.1 + 20 };
    };
    const o: RMOpgave = { id, soort: "kijk", keuzes: q.keuzes.map(tek), namen: q.keuzes.map((n) => `${n} blokjes`) };
    const goedI = q.keuzes.indexOf(q.n);
    return {
      o,
      soort: "blokjes",
      eerste: ["Tik op de goede groep."],
      vraag: [`Waar zie je ${g(q.n, "geel")} blokjes?`],
      antwoord: () => tikKeuze(l),
      isGoed: (x) => x === goedI,
      noem: () => "Deze",
      goedBeeld: () => zet(l, { goed: { deel: `k${goedI}`, keer: ++st.keer } }),
      goedZin: [`Ja! ${g(5, "geel")} en ${g(q.n - 5, "geel")} is ${g(q.n, "geel")}.`],
      fout: (x) => zet(l, { fout: { deel: `k${x as number}`, keer: ++st.keer } }),
      samen: async (alles) => {
        await l.zeg(`Bovenaan staan er altijd ${g(5, "geel")}.`);
        zetLabels(
          l,
          st,
          q.keuzes.map((_, i) => ({ deel: `k${i}`, x: 2.5 * cel - 30 + 44, y: -0.55 * cel, tekst: "5", klein: true })),
        );
        await l.wacht(400);
        await l.zeg(`Tel onderaan verder vanaf ${g(5, "geel")}.`);
        if (alles) {
          const gi = goedI;
          const onder = q.n - 5;
          const reeks = Array.from({ length: onder }, (_, j) => g(6 + j, "geel"));
          zet(l, { licht: { deel: `k${gi}`, aan: Array.from({ length: onder }, (_, j) => 5 + j) } });
          await l.zeg(`${reeks.join(", ")}.`);
        }
      },
      tip: [`Begin bij ${g(5, "geel")}.`, "Tel onderaan verder."],
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
      eerste: ["Trek een lijn van een stip naar een stip.", "Of tik links en dan rechts."],
      vraag: ["Wat hoort bij elkaar?", getallen ? "Verbind elk groepje met het goede getal." : "Verbind de groepjes die evenveel zijn."],
      antwoord: () => trekLijnen(l, st),
      isGoed: (x) => (x as number[]).every((r, i) => r === goed[i]),
      noem: () => "Deze lijnen",
      goedBeeld: () => zet(l, { uitslag: { goed: [true, true, true], keer: ++st.keer } }),
      goedZin: ["Ja! Alles hoort bij elkaar.", getallen ? "Elk groepje heeft zijn getal." : "Steeds evenveel."],
      fout: (x) => zet(l, { uitslag: { goed: (x as number[]).map((r, i) => r === goed[i]), keer: ++st.keer } }),
      samen: async () => {
        await l.zeg("We tellen elk groepje.");
        const labels = [...st.labels];
        const tel = async (deel: string, gr: Groep, k: string, rechtsKant: boolean) => {
          zet(l, { licht: { deel, aan: gr.stappen[0].idx } });
          await l.wacht(350);
          labels.push({ deel, x: rechtsKant ? gr.tek.b / 2 + 34 : -gr.tek.b / 2 - 34, y: 0, tekst: String(gr.n) });
          zetLabels(l, st, labels);
          await l.zeg(`${g(gr.n, k)}.`);
        };
        for (const [i, gr] of q.links.entries()) await tel(`l${i}`, gr, q.vl.k, false);
        if (!getallen) for (const [i, r] of q.rechts.entries()) if (typeof r !== "number") await tel(`r${i}`, r, (q.vr ?? q.vl).k, true);
        zet(l, { licht: null });
        await l.zeg(getallen ? "Zoek nu bij elk groepje hetzelfde getal." : "Zoek nu de groepjes met hetzelfde getal.");
      },
      tip: [getallen ? "Kijk naar het getal bij elk groepje." : "Verbind de groepjes die even groot zijn."],
      testAntwoord: "l-0",
    };
  }

  /* ---------- getal ervoor, getal erna ---------- */
  if (q.t === "buur") {
    const o: RMOpgave = { id, soort: "kijk", boven: q.plaatje ? q.plaatje.gr.tek : buurTekening(q.n, q.richting) };
    const doel = q.richting === "voor" ? q.n - 1 : q.n + 1;
    const hulp: RMOpgave = { id: `${id}-hulp`, soort: "kijk", boven: TELRIJ };
    const vraag = q.plaatje
      ? [`Hier zijn ${g(q.n, q.plaatje.v.k)} ${q.plaatje.v.meer}.`, q.richting === "voor" ? `Welk getal komt net voor ${w(q.n)}?` : `Welk getal komt na ${w(q.n)}?`, "Typ het getal."]
      : [q.richting === "voor" ? `Welk getal komt net voor ${w(q.n)}?` : `Welk getal komt na ${w(q.n)}?`];
    return {
      o,
      soort: q.plaatje ? "buur-typ" : "buur",
      eerste: [],
      vraag,
      antwoord: q.plaatje ? async () => await l.getal() : kiesGetal(q.keuzes ?? []),
      isGoed: (x) => x === doel,
      noem: (x) => (x === null ? "Niets" : w(x as number)),
      goedBeeld: () => zet(l, { goed: { deel: "b", keer: ++st.keer } }),
      goedZin: q.richting === "voor" ? [`Ja! ${w(doel)} komt net voor ${w(q.n)}.`, "Eén minder."] : [`Ja! Na ${w(q.n)} komt ${w(doel)}.`, "Eén meer."],
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
      tip: [q.richting === "voor" ? "Tel terug: één minder." : "Tel verder: één meer."],
      testAntwoord: doel,
    };
  }

  /* ---------- splitsen ---------- */
  if (q.t === "splits") {
    const gr = splitsTekening(q.v, q.houder, q.tot, q.buiten);
    const o: RMOpgave = { id, soort: "kijk", boven: gr.tek };
    const binnen = q.tot - q.buiten;
    const k = q.v.k;
    const waarin = q.houder === "doos" ? "in de doos" : "in de zak";
    return {
      o,
      soort: "splits",
      eerste: [],
      vraag: [`Er zijn ${g(q.tot, k)} ${q.v.meer}.`, `Hoeveel zitten er ${waarin}?`],
      antwoord: kiesGetal(q.keuzes),
      isGoed: (x) => x === binnen,
      noem: (x) => g(x as number, k),
      goedBeeld: () => zet(l, { goed: { deel: "b", keer: ++st.keer } }),
      goedZin: [`Ja! ${g(q.buiten, k)} en ${g(binnen, k)} is samen ${g(q.tot, k)}.`],
      samen: async (alles) => {
        await l.zeg(`Er zijn ${g(q.tot, k)} ${q.v.meer} in totaal.`, "Buiten zie je er een paar. Tel maar mee.");
        await telMee(l, st, "b", gr, k);
        zet(l, { licht: null });
        await l.zeg(`Buiten liggen er ${g(q.buiten, k)}.`, `De rest zit ${waarin}.`, `Tel verder van ${g(q.buiten, k)} tot ${g(q.tot, k)}.`);
        if (alles) {
          const reeks = Array.from({ length: binnen }, (_, j) => g(q.buiten + 1 + j, k));
          await l.zeg(`${reeks.join(", ")}.`, `Dat zijn er ${g(binnen, k)}.`);
        }
      },
      tip: [`Begin bij ${g(q.buiten, k)} en tel door tot ${g(q.tot, k)}.`, "Hoeveel tel je erbij?"],
      testAntwoord: binnen,
    };
  }

  /* ---------- welke kaart? ---------- */
  if (q.t === "welke") {
    const voorbeeld = q.vraagt === "evenveel" ? q.voorbeeld : undefined;
    const hint = q.vraagt === "meer" || q.vraagt === "minder" ? eenDing(q.v.naam, 150) : undefined;
    const o: RMOpgave = { id, soort: "kijk", boven: voorbeeld?.tek ?? hint, keuzes: q.groepen.map((x) => x.tek), namen: q.groepen.map((x) => `${x.n} ${q.v.meer}`) };
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
        ? [`Ja! Hier zijn er ${g(m, k)}.`]
        : q.vraagt === "evenveel"
          ? [`Ja! Hier zijn er ook ${g(m, k)}.`, "Dat is evenveel."]
          : [`Ja! Hier zijn er ${g(m, k)}.`, `Dat is ${q.vraagt} dan ${g(q.n, k)}.`];
    return {
      o,
      soort: `welke-${q.vraagt}`,
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
            ? [`Welk getal is groter dan ${g(q.n, k)}?`]
            : q.vraagt === "minder"
              ? [`Welk getal is kleiner dan ${g(q.n, k)}?`]
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
    eerste: ["Kijk naar de rij ballonnen.", "Tik dan op de goede kleur."],
    vraag: ["Kijk naar de rij ballonnen.", `Welke kleur heeft de ${kr2.wat} ballon?`],
    antwoord: () => tikKeuze(l),
    isGoed: (x) => x === goedI,
    noem: (x) => Hoofd(kr2.keuzes[x as number]),
    goedBeeld: () => zet(l, { goed: { deel: `k${goedI}`, keer: ++st.keer }, licht: { deel: "b", aan: [plek] } }),
    goedZin: [`Ja! De ${kr2.wat} ballon is ${goedKleur}.`, kr2.wat === "laatste" ? "Hij staat helemaal achteraan." : "Er staan er twee voor en twee achter."],
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
      await l.zeg(kr2.wat === "laatste" ? "De laatste staat helemaal achteraan." : "De middelste staat in het midden.", kr2.wat === "laatste" ? "Na de laatste komt er niets meer." : "Er staan er twee voor en twee achter.");
    },
    tip: [kr2.wat === "laatste" ? "Kijk naar de ballon helemaal rechts." : "Tel tot drie. De derde staat in het midden."],
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
    toon,
    vraag: a.vraag,
    antwoord: a.antwoord,
    isGoed: a.isGoed,
    noem: a.noem,
    goed: async () => {
      a.goedBeeld();
      await l.zeg(...a.goedZin);
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
  await l.zeg(...a.goedZin.map((z) => z.replace(/^Ja! /, "")));
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
      const eerste = opgaven[0];
      /* st.huidig blijft leeg: de eerste vraag zet zijn opgave dan nog eens, mét de test (zelfde beeld). */
      l.vlak<RMProps>(SqulaRekenmix, { opgave: eerste, namen: namenIn(opgaven), vooraf: opgaven });
      await squlaBegin(l, {
        welkom: d.welkom,
        uitleg: async () => {
          for (const [i, q] of d.voorbeeld.entries()) await legUit(l, st, `${d.id}-vb${i + 1}`, q);
        },
      });
      let fouten = 0;
      for (const [i, q] of d.vragen.entries()) if (!(await speelVraag(l, st, `${d.id}-${i + 1}`, q))) fouten++;
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
  welkom: ["Hoi!", "We gaan tellen.", "Tel goed, en kies het goede getal."],
  voorbeeld: [{ t: "tel", v: KNIKKER, gr: rijen("knikker", [3, 3]), keuzes: [6, 5, 7], soort: "tel" }],
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
const mix1_2 = les({
  id: "squla-rekenmix-mix1-2",
  titel: "Rekenmix 1 (moeilijker)",
  oefening: "Rekenmix 1",
  level: 2,
  welkom: ["Hoi!", "Bovenaan zie je een ding.", "Welke vorm lijkt erop?"],
  voorbeeld: [{ t: "vorm", naam: "zon", zin: "de zon", vorm: "cirkel", keuzes: ["vierkant", "cirkel", "driehoek"] }],
  vragen: [
    { t: "vorm", naam: "tent", zin: "de tent", vorm: "driehoek", keuzes: ["cirkel", "driehoek", "vierkant"] },
    { t: "vorm", naam: "mandarijn", zin: "de mandarijn", vorm: "cirkel", keuzes: ["driehoek", "rechthoek", "cirkel"] },
    { t: "vorm", naam: "wandplank", zin: "de plank", vorm: "rechthoek", keuzes: ["cirkel", "vierkant", "rechthoek"] },
    { t: "vorm", naam: "vlaggenlijn", zin: "de vlaggetjes", lijkt: "lijken", vorm: "driehoek", keuzes: ["rechthoek", "driehoek", "vierkant"] },
    { t: "vorm", naam: "planeet", zin: "de planeet", vorm: "cirkel", keuzes: ["vierkant", "rechthoek", "cirkel"] },
    { t: "vorm", naam: "pizzadoos", zin: "de pizzadoos", vorm: "vierkant", keuzes: ["vierkant", "driehoek", "cirkel"] },
    { t: "vorm", naam: "schoolbord", zin: "het schoolbord", vorm: "rechthoek", keuzes: ["rechthoek", "cirkel", "driehoek"] },
    { t: "vorm", naam: "pizzapunt", zin: "het stuk pizza", vorm: "driehoek", keuzes: ["cirkel", "vierkant", "driehoek"] },
    { t: "vorm", naam: "knoop", zin: "de knoop", vorm: "cirkel", keuzes: ["cirkel", "rechthoek", "driehoek"] },
    { t: "vorm", naam: "speelblok", zin: "het blok", vorm: "vierkant", keuzes: ["driehoek", "vierkant", "cirkel"] },
    { t: "vorm", naam: "telefoon", zin: "de telefoon", vorm: "rechthoek", keuzes: ["vierkant", "rechthoek", "cirkel"] },
    { t: "vorm", naam: "feesthoed", zin: "het feesthoedje", vorm: "driehoek", keuzes: ["driehoek", "cirkel", "rechthoek"] },
    { t: "vorm", naam: "koekje", zin: "het koekje", vorm: "cirkel", keuzes: ["rechthoek", "cirkel", "driehoek"] },
    { t: "vorm", naam: "pizzadoos", zin: "de pizzadoos", vorm: "vierkant", keuzes: ["cirkel", "driehoek", "vierkant"] },
    { t: "vorm", naam: "boek", zin: "het boek", vorm: "rechthoek", keuzes: ["driehoek", "rechthoek", "cirkel"] },
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
  welkom: ["Hoi!", "Drie dingen staan in een rij.", "Wat staat links, rechts of in het midden?"],
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
  welkom: ["Hoi!", "Drie groepjes.", "Zet ze op volgorde: van meer naar minder, of van minder naar meer."],
  voorbeeld: [{ t: "ordenAantal", v: APPEL, aantallen: [2, 6, 4], richting: "af" }],
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
  welkom: ["Hoi!", "We kijken naar boterhammen met kaas.", "Waar zit meer kaas op? En waar minder?"],
  voorbeeld: [{ t: "hoeveel", ding: "boterham", keuzes: [1, 0, 2], wat: "minder" }],
  vragen: [
    { t: "hoeveel", ding: "boterham", keuzes: [2, 1, 0], wat: "meer" },
    { t: "hoeveel", ding: "spies", keuzes: [2, 0, 1], wat: "meest" },
    { t: "hoeveel", ding: "boterham", keuzes: [1, 0, 2], wat: "minder" },
    { t: "hoeveel", ding: "spies", keuzes: [2, 0, 1], wat: "minst" },
    { t: "hoeveel", ding: "boterham", keuzes: [2, 1, 0], wat: "evenveel" },
    { t: "hoeveel", ding: "boterham", keuzes: [0, 2, 1], wat: "meer" },
    { t: "hoeveel", ding: "boterham", keuzes: [1, 2, 0], wat: "meest" },
    { t: "hoeveel", ding: "boterham", keuzes: [2, 0, 1], wat: "minder" },
    { t: "hoeveel", ding: "spies", keuzes: [1, 2, 0], wat: "minst" },
    { t: "hoeveel", ding: "boterham", keuzes: [0, 1, 2], wat: "evenveel" },
    { t: "hoeveel", ding: "boterham", keuzes: [1, 0, 2], wat: "meer" },
    { t: "hoeveel", ding: "spies", keuzes: [0, 1, 2], wat: "meest" },
    { t: "hoeveel", ding: "boterham", keuzes: [0, 2, 1], wat: "minder" },
    { t: "hoeveel", ding: "boterham", keuzes: [2, 1, 0], wat: "minst" },
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
  welkom: ["Hoi!", "Hier zie je een bal en een doos.", "Waar ligt de bal?"],
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
  welkom: ["Hoi!", "We zoeken een kleur en een vorm.", "En we tellen blokjes."],
  voorbeeld: [
    { t: "kleurvorm", kleur: "geel", vorm: "cirkel", keuzes: [["geel", "cirkel"], ["geel", "vierkant"], ["rood", "cirkel"]] },
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
const kl = (naam: string, n: number, zaad: number) => kaartLos(naam, n, zaad, 260, 180, 52);
const mix2_4 = les({
  id: "squla-rekenmix-mix2-4",
  titel: "Rekenmix 2 (heel moeilijk)",
  oefening: "Rekenmix 2",
  level: 4,
  welkom: ["Hoi!", "Links staan groepjes.", "Wat hoort bij elkaar? Trek een lijn."],
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
  volgt de woorden: bij "klein, kleiner, kleinst" komt de kleinste achteraan.
  Squla gebruikt knaagdieren, koeien en honden; wij ballen, appels, sterren,
  kaarsen, potloden, huizen, bomen, raketjes en torens van blokken (dat zijn
  dingen waar dik, dun, groot en laag goed bij te zien is).
*/
const mix3_1 = les({
  id: "squla-rekenmix-mix3-1",
  titel: "Rekenmix 3",
  oefening: "Rekenmix 3",
  level: 1,
  welkom: ["Hoi!", "Klein, kleiner, kleinst.", "Zet de plaatjes op volgorde."],
  voorbeeld: [{ t: "ordenMaat", woord: "groot", naam: "boom", maten: [0.75, 0.45, 1] }],
  vragen: [
    { t: "ordenMaat", woord: "klein", naam: "bal", maten: [0.62, 1, 0.38] },
    { t: "ordenMaat", woord: "dik", naam: "kaars", maten: [1.4, 0.55, 0.95] },
    { t: "ordenMaat", woord: "groot", naam: "huis", maten: [1, 0.48, 0.74] },
    { t: "ordenMaat", woord: "dun", naam: "potlood", maten: [1.15, 1.6, 0.7] },
    { t: "ordenMaat", woord: "laag", naam: "speelblok", maten: [2, 4, 3] },
    { t: "ordenMaat", woord: "klein", naam: "appel", maten: [0.4, 0.68, 1] },
    { t: "ordenMaat", woord: "dik", naam: "potlood", maten: [1.05, 1.6, 0.6] },
    { t: "ordenMaat", woord: "groot", naam: "boom", maten: [0.72, 1, 0.45] },
    { t: "ordenMaat", woord: "dun", naam: "kaars", maten: [0.6, 1.0, 1.45] },
    { t: "ordenMaat", woord: "laag", naam: "speelblok", maten: [1, 3, 2] },
    { t: "ordenMaat", woord: "klein", naam: "ster", maten: [1, 0.42, 0.7] },
    { t: "ordenMaat", woord: "dik", naam: "kaars", maten: [0.95, 0.6, 1.35] },
    { t: "ordenMaat", woord: "groot", naam: "raketje", maten: [0.5, 1, 0.75] },
    { t: "ordenMaat", woord: "dun", naam: "potlood", maten: [1.5, 0.75, 1.1] },
    { t: "ordenMaat", woord: "laag", naam: "speelblok", maten: [4, 2, 3] },
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
  welkom: ["Hoi!", "Vijf dingen staan in een rij.", "Wat staat als eerste? En als laatste?"],
  voorbeeld: [{ t: "rang", rij: RIJ_A, keuzes: ["bus", "fiets", "bootje", "speelgoedauto", "treintje"], plek: 1 }],
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
  welkom: ["Hoi!", "Welk getal komt ervoor?", "En welk getal komt erna?"],
  voorbeeld: [{ t: "buur", n: 5, richting: "na", keuzes: [4, 6, 7] }],
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
  welkom: ["Hoi!", "Een paar ballen zitten in de doos.", "Hoeveel zitten erin?"],
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
  welkom: ["Hoi!", "We gaan tellen in de ruimte.", "Kies het goede getal."],
  voorbeeld: [{ t: "tel", v: BAL, gr: tweeGroepen("bal", 2, 3), keuzes: [5, 4, 6], soort: "samen", delen: [2, 3] }],
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
  welkom: ["Hoi!", "We zetten dingen op volgorde.", "Sleep ze naar de plekjes."],
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
const kr = (naam: string, lengtes: number[]) => kaartGroep(naam, lengtes, 60);
/* Los door elkaar, maar compact: zo blijft er ruimte tussen de groepjes en zie je welke dingen bij elkaar horen. */
const kv = (naam: string, n: number, zaad: number) => kaartLos(naam, n, zaad, 230, 280, 66);
const bomen = (n: number) => kaartGroep("boom", [n], 50);
const mix4_3 = les({
  id: "squla-rekenmix-mix4-3",
  titel: "Rekenmix 4 (nog moeilijker)",
  oefening: "Rekenmix 4",
  level: 3,
  welkom: ["Hoi!", "Drie groepjes.", "Waar zie je het aantal dat ik noem?"],
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
  welkom: ["Hoi!", "Meer dan, minder dan en evenveel.", "En welke kleur staat waar in de rij?"],
  voorbeeld: [
    { t: "welke", v: BAL, groepen: [kr("bal", [3]), kr("bal", [4]), kr("bal", [2])], vraagt: "meer", n: 3 },
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
