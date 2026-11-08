/**
 * Lessen "Getallenlijn" (groep 3, 30 oktober 2026, opdracht eigenaar), naar
 * vier oefeningen van Squla Rekenen groep 3 · Getallenlijn. Per Squla-level
 * één les, met dezelfde soorten vragen in dezelfde volgorde en dezelfde
 * getallenreeks (tot en met 20), maar met eigen woorden, eigen getallen en
 * eigen tekeningen (zie SQULA-ANALYSE/getallenlijn-*-volledig.md):
 *
 *   16056 Getallen rangschikken t/m 20  → squla-getallenlijn-rangschikken-1/2/3
 *   16600 Getallenlijn (met een kat)     → squla-getallenlijn-kat-1/2
 *         (hier met een raketje; tot 31 oktober 2026 Floep de kikker)
 *   15757 Getallenlijn met dieren        → squla-getallenlijn-dieren-1/2/3
 *         (hier met dingen op de getallen, de olifant is een bus; geen dieren)
 *   10986 Getallenlijn (terugtellen)     → squla-getallenlijn-terugtellen-1
 *
 * Alles in Phaser, als hologram vóór de blauwe ruimte
 * (`../vlakken/squla-getallenlijn-vlak.tsx`). De hulp is de vaste hulp van
 * Bliepo (`squla-hulp.ts`), sinds 4 november 2026 zoals Synthesis (BOUWREGELS 5.1 en
 * 5.10): goed = kort en door; eerste fout = een korte reactie op wat het kind koos, met
 * een hint die bij de vraag past (een getal licht op waar je vanaf telt); tweede fout =
 * Bliepo telt of wijst het na en laat het goede antwoord zien, en het kind gaat door.
 * Geen pauze. Geen "Weet ik niet"-knop bij de keuzes.
 *
 * Getallen in de getallenlijn en op de dingen zijn wit: in de zinnen {n:wit}.
 */

import { bevestig, krijgtVervolgvraag, zetSynthesisHulp } from "./squla-uitleg";
import type { Lesdraaiboek, Lesgids } from "../soort";
import { squlaBegin, squlaEind, squlaVraag, type SqulaVraag } from "./squla-hulp";
import { SqulaGetallenlijn, type Beeld, type GetallenlijnProps, type RijItem, type Rijding, type Wezen } from "../vlakken/squla-getallenlijn-vlak";
import { DINGNAAM, GETALLENLIJN_VOORWERPEN, type Ding } from "../vlakken/squla-getallenlijn-teken";
import { speelLesgeluid } from "@/lib/lesgeluiden";

/* ---------- het vlak ---------- */

const w = (n: number) => `{${n}:wit}`;
const rijtje = (ns: number[]) => ns.map(w).join(", ");
const TELWOORD = ["nul", "één", "twee", "drie", "vier", "vijf", "zes", "zeven", "acht", "negen", "tien"];
/** Bliepo telt hardop met cijfers (3.20): "1, 2, 3". */
const Telwoord = (n: number) => String(n);
const RANG = ["eerste", "tweede", "derde", "vierde", "vijfde"];

let ronde = 0;
let golfTel = 0;

const zet = (l: Lesgids, p: Partial<GetallenlijnProps>) => l.pasVlakAan<GetallenlijnProps>(p);

/** Een nieuw beeld (alles opnieuw tevoorschijn getoverd). */
function toon(l: Lesgids, beeld: Beeld, extra: Partial<GetallenlijnProps> = {}) {
  zet(l, { beeld, ronde: ++ronde, licht: [], zacht: [], golf: null, invul: null, actief: false, handje: false, ...extra });
}
const licht = (l: Lesgids, ...ns: number[]) => zet(l, { licht: ns, zacht: [] });
/**
 * Dingen die bij dezelfde som horen (tellen, sprongen; Sara 8 november 2026, besluit 4): het laatste getal is fel,
 * wat al genoemd is blijft zacht staan. `alles`: bij "samen"/het antwoord zijn ze allemaal weer fel.
 */
const lichtBij = (l: Lesgids, ns: number[], alles = false) => zet(l, { licht: ns, zacht: alles ? [] : ns.slice(0, -1) });
/** Het goede antwoord in beeld, met een lichtgolf. */
const vul = (l: Lesgids, op: number, t: string, golfOp = op) => zet(l, { invul: { op, t }, golf: { op: golfOp, keer: ++golfTel }, licht: [] });
const golf = (l: Lesgids, op: number) => zet(l, { golf: { op, keer: ++golfTel }, licht: [] });

/** Een willekeurige volgorde (Fisher-Yates). */
function meng<T>(lijst: T[]): T[] {
  const a = [...lijst];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
/**
 * Willekeurig, maar nooit al van klein naar groot (dan verklapt het beeld het antwoord), en bij 3 of meer ook nooit precies van groot
 * naar klein (dan hoeft het kind alleen om te draaien; herstel ronde 2, 7 november).
 */
function mengNietOplopend(lijst: number[]): number[] {
  for (let i = 0; i < 40; i++) {
    const a = meng(lijst);
    const oplopend = a.every((n, k) => k === 0 || a[k - 1] <= n);
    const aflopend = a.every((n, k) => k === 0 || a[k - 1] >= n);
    if (a.length < 2 || (!oplopend && (a.length < 3 || !aflopend))) return a;
  }
  const g = [...lijst].sort((x, y) => x - y);
  if (g.length < 3) return g.reverse();
  return [g[1], g[0], ...g.slice(2)];
}

/**
 * Herstel 7 november (BOUWREGELS 1.23): de keuzes in een willekeurige volgorde, zodat het goede antwoord niet steeds op dezelfde plek
 * staat. Per vraag één keer gekozen (dezelfde lijst = dezelfde volgorde), dus na een fout blijven de knoppen op hun plek.
 */
const gemengd = new WeakMap<number[], number[]>();
async function kiesGetal(l: Lesgids, opties: number[]) {
  let volgorde = gemengd.get(opties);
  if (!volgorde) {
    volgorde = meng(opties);
    gemengd.set(opties, volgorde);
  }
  /* 4 keuzes: 2 × 2, niet 3 en 1 los eronder. */
  return Number(await l.kies(volgorde.map(String), { weetniet: false, direct: true, ...(volgorde.length === 4 ? { perTwee: true } : {}) }));
}

/** Een getal typen. "Weet ik niet" (het vraagteken bij het invulvak) = een hint, en dan nog eens. */
async function typGetal(l: Lesgids, hint: string[]): Promise<number> {
  for (;;) {
    const x = await l.getal();
    if (x !== null) return x;
    await l.zeg(...hint);
  }
}

/** Een vraag met de vaste hulp; `true` = meteen goed. */
const vraag = <T,>(l: Lesgids, v: SqulaVraag<T>) => squlaVraag(l, { synthesis: true, ...v });

/** Het getal met omgedraaide cijfers (34 en 43). */
const omgedraaid = (n: number) => Number([...String(n)].reverse().join(""));
const omgedraaidFout = (x: number, goed: number) => x > 9 && x % 11 !== 0 && omgedraaid(x) === goed;

const WAT_VLAG = "Het vlaggetje";

/** Eerste fout bij "bij welk getal staat het?" op een lijn: wat Bliepo zegt over het gekozen getal. */
function lijnReactie(labels: number[], n: number, x: number, tip: string[], stap = 1, wat = WAT_VLAG.toLowerCase()): string[] {
  const Wat = wat[0].toUpperCase() + wat.slice(1);
  let zin: string;
  if (omgedraaidFout(x, n)) zin = `Je koos ${w(x)}. Lees de cijfers nog eens: kijk welk cijfer voorop staat.`;
  else if (labels.includes(x)) zin = `${w(x)} staat al op de lijn, bij een ander streepje. ${Wat} staat ergens anders.`;
  else if (Math.abs(x - n) <= stap) zin = stap === 1 ? `${w(x)} is het streepje ernaast. Tel de streepjes nog eens.` : `${w(x)} ligt er vlak naast. Elk streepje is ${w(stap)} verder.`;
  else zin = x < n ? `${Wat} staat verder naar rechts dan ${w(x)}.` : `${Wat} staat nog niet zo ver als ${w(x)}.`;
  return [zin, ...tip];
}

/* ---------- 1. een rij met één lege plek (lampjes, planeetjes, kristallen, sterren, aftellen, tegels) ---------- */

type Plek = number | "…" | "?" | "-";

type RijVraag = {
  ding: Rijding;
  /** Wat er op de plekken staat: een getal, "…", "?" of "-" (niets). */
  rij: Plek[];
  /** Het getal op de eerste plek, en of de rij omhoog (1) of omlaag (-1) telt. */
  start: number;
  stap?: 1 | -1;
  /** De plek waar het om gaat. */
  gat: number;
  /** De plek met een andere kleur (het rode lampje). */
  rood?: boolean;
  onder?: boolean;
  slinger?: boolean;
  /** Keuzes; zonder keuzes typt het kind. */
  opties?: number[];
  vraag: string[];
};

function rijBeeld(v: RijVraag): Beeld {
  const items: RijItem[] = v.rij.map((p, i) => ({ t: p === "-" ? "" : String(p), rood: v.rood && i === v.gat ? true : undefined }));
  return { soort: "rij", ding: v.ding, items, onder: v.onder, slinger: v.slinger };
}

function rijVraag(l: Lesgids, v: RijVraag): SqulaVraag<number> {
  const stap = v.stap ?? 1;
  const waarde = (i: number) => v.start + stap * i;
  const goed = waarde(v.gat);
  const voor = waarde(v.gat - 1);
  const terug = stap < 0;
  /* Het laatste getal vóór de lege plek dat echt in beeld staat (bij diamanten met streepjes is dat niet altijd het buurvak). */
  let ankerNr = v.gat - 1;
  while (ankerNr > 0 && typeof v.rij[ankerNr] !== "number") ankerNr--;
  const afstand = v.gat - ankerNr;
  const anker = waarde(ankerNr);
  const plekNaam = v.ding === "lampje" ? "lampje" : v.ding === "kristal" ? "diamant" : v.ding === "ster" ? "ster" : v.ding === "planeet" ? "planeet" : "plek";
  const lidwoord = v.ding === "lampje" ? "het" : "de";
  const tip =
    afstand === 1
      ? [`Kijk naar ${lidwoord} ${plekNaam} met ${w(anker)}.`, terug ? "Tel vanaf dat getal 1 terug." : "Tel vanaf dat getal 1 verder."]
      : [`Begin bij ${lidwoord} ${plekNaam} met ${w(anker)} en tel ${w(afstand)} ${terug ? "terug" : "verder"}.`];
  const gaf = v.opties ? "koos" : "typte";
  const plekMv = v.ding === "lampje" ? "lampjes" : v.ding === "kristal" ? "diamanten" : v.ding === "ster" ? "sterren" : v.ding === "planeet" ? "planeten" : "plekken";
  let nFout = 0;
  return {
    synthesis: true,
    reactie: (x) => {
      let zin: string;
      if (v.rij.includes(x)) zin = `${w(x)} staat al in de rij. Op de lege plek hoort een ander getal.`;
      else if (omgedraaidFout(x, goed)) zin = `Je ${gaf} ${w(x)}. Kijk of de cijfers in de goede volgorde staan.`;
      else if (x === goed + stap) zin = `Met ${w(x)} sla je een ${plekNaam} over.`;
      else if (terug && x > voor) zin = `${w(x)} is groter dan ${w(voor)}, maar deze rij telt terug: de getallen worden steeds kleiner.`;
      else if (!terug && x < voor) zin = `${w(x)} is kleiner dan ${w(voor)}. In deze rij worden de getallen steeds groter.`;
      else zin = `${w(x)} past hier niet in de rij.`;
      return [zin, ...tip];
    },
    toonAntwoord: async () => {
      vul(l, v.gat, String(goed));
      const tot = Array.from({ length: afstand + 1 }, (_, i) => waarde(ankerNr + i));
      await l.zeg(`${terug ? "Terugtellen" : "Verdertellen"} vanaf ${w(anker)}: ${rijtje(tot)}.`, `Dus op deze plek hoort ${w(goed)}.`);
      await l.wacht(300);
    },
    fout: () => {
      nFout++;
    },
    /* Het rondje van de hint blijft zolang Bliepo erover praat (besluit 4). */
    wijs: () => {
      if (nFout === 1) licht(l, ankerNr);
    },
    wijsWeg: () => licht(l),
    toon: () => {
      nFout = 0;
      toon(l, rijBeeld(v));
    },
    vraag: v.opties ? v.vraag : [...v.vraag, "Typ het getal."],
    antwoord: () => (v.opties ? kiesGetal(l, v.opties) : typGetal(l, tip)),
    isGoed: (x) => x === goed,
    noem: (x) => w(x),
    goed: async () => {
      vul(l, v.gat, String(goed));
      const buren = [waarde(v.gat - 1), goed, ...(v.gat + 1 < v.rij.length ? [waarde(v.gat + 1)] : [])];
      await l.zeg(bevestig());
      await l.wacht(300);
    },
    samen: async () => {
      await l.zeg(terug ? `Ik tel terug langs de ${plekMv}.` : `Ik tel langs de ${plekMv}, van links naar rechts.`);
      for (let i = 0; i < v.gat; i++) {
        licht(l, i);
        await l.zeg(`${w(waarde(i))}.`);
      }
      licht(l, v.gat);
      if (!krijgtVervolgvraag(l)) await l.zeg(terug ? `Welk getal komt na ${w(voor)}, als je terugtelt?` : `Welk getal komt na ${w(voor)}?`);
      licht(l);
    },
    tip,
    testAntwoord: goed,
  };
}

/* ---------- 2. een vlaggetje op de getallenlijn ---------- */

type LijnVraag = {
  van: number;
  tot: number;
  stap?: number;
  streepjes?: number[];
  labels: number[];
  /** Waar het vlaggetje staat. */
  n: number;
  opties?: number[];
  vraag: string[];
};

/** Het getal op de lijn waar je het makkelijkst vanaf telt: het dichtstbij, bij gelijk het kleinste. */
function ijkpunt(labels: number[], n: number) {
  return [...labels].filter((a) => a !== n).sort((a, b) => Math.abs(a - n) - Math.abs(b - n) || a - b)[0];
}

/** Samen streepjes tellen vanaf een getal dat er staat, tot vlak bij de plek (zonder het antwoord te zeggen). */
async function telStreepjes(l: Lesgids, labels: number[], n: number, wat: string, stap = 1, ww = "staat") {
  if (stap === 2) {
    const L = ijkpunt(labels, n);
    await l.zeg("Kijk naar de streepjes.");
    licht(l, L);
    await l.zeg(`Hier staat ${w(L)}.`, `Elk streepje is ${w(2)} verder.`);
    const richting = n > L ? 2 : -2;
    const tel: number[] = [L];
    for (let k = L + richting; richting > 0 ? k < n - 1 : k > n + 1; k += richting) {
      tel.push(k);
      lichtBij(l, tel);
      await l.zeg(`${w(k)}.`);
    }
    if (n % 2 !== 0) {
      licht(l, n - 1, n + 1);
      await l.zeg(`${wat} ${ww} tussen ${w(n - 1)} en ${w(n + 1)}.`, "Precies in het midden.");
    } else {
      lichtBij(l, [...tel, n], true);
      if (!krijgtVervolgvraag(l)) await l.zeg(`Welk getal hoort bij het streepje van ${wat.toLowerCase()}?`);
    }
    licht(l);
    return;
  }
  const L = ijkpunt(labels, n);
  const d = n - L;
  licht(l, L);
  await l.zeg(`Kijk, hier staat ${w(L)}.`, d > 0 ? "Tel bij elk streepje 1 verder." : "We tellen de streepjes terug.");
  const tel: number[] = [L];
  for (let k = 1; k <= Math.abs(d); k++) {
    tel.push(L + Math.sign(d) * k);
    lichtBij(l, tel);
    await l.zeg(`${Telwoord(k)}.`);
  }
  /* Bij het antwoord zijn alle getallen van de telling weer fel. */
  lichtBij(l, tel, true);
  await l.zeg(`${wat} ${ww} ${Math.abs(d)} ${Math.abs(d) === 1 ? "streepje" : "streepjes"} ${d > 0 ? "na" : "voor"} de ${w(L)}.`);
  licht(l);
}

function tipStreepjes(labels: number[], n: number, stap = 1, wat = WAT_VLAG.toLowerCase()) {
  const L = ijkpunt(labels, n);
  return stap === 2 ? [`Begin bij de ${w(L)}. Elk streepje is ${w(2)} verder, dus tel in sprongen.`] : [n > L ? `Begin bij de ${w(L)} en tel streepje voor streepje verder naar ${wat}.` : `Begin bij de ${w(L)} en tel streepje voor streepje terug naar ${wat}.`];
}

/** Waarom het goede getal klopt, met wat er op de lijn staat. */
function lijnWaarom(labels: number[], n: number, stap: number, wat: string): string {
  const L = ijkpunt(labels, n);
  const d = n - L;
  if (stap === 2) return n % 2 === 0 ? `Vanaf de ${w(L)} ga je in sprongen van ${w(2)}. Zo kom je bij ${w(n)}.` : `${wat} staat tussen ${w(n - 1)} en ${w(n + 1)}, dus bij ${w(n)}.`;
  return `Vanaf de ${w(L)} is het ${Math.abs(d)} ${Math.abs(d) === 1 ? "streepje" : "streepjes"} ${d > 0 ? "verder" : "terug"}. Zo kom je bij ${w(n)}.`;
}

function lijnVraag(l: Lesgids, v: LijnVraag): SqulaVraag<number> {
  const tip = tipStreepjes(v.labels, v.n, v.stap);
  let nFout = 0;
  return {
    synthesis: true,
    reactie: (x) => lijnReactie(v.labels, v.n, x, tip, v.stap ?? 1),
    toonAntwoord: async () => {
      vul(l, v.n, String(v.n));
      await l.zeg(lijnWaarom(v.labels, v.n, v.stap ?? 1, WAT_VLAG), `Het vlaggetje staat bij ${w(v.n)}.`);
      await l.wacht(300);
    },
    fout: () => {
      nFout++;
    },
    /* Het rondje van de hint blijft zolang Bliepo erover praat (besluit 4). */
    wijs: () => {
      if (nFout === 1) licht(l, ijkpunt(v.labels, v.n));
    },
    wijsWeg: () => licht(l),
    toon: () => {
      nFout = 0;
      toon(l, { soort: "lijn", van: v.van, tot: v.tot, stap: v.stap, streepjes: v.streepjes, labels: v.labels, vlag: { n: v.n, t: "?" } });
    },
    vraag: v.opties ? v.vraag : [...v.vraag, "Typ het getal."],
    antwoord: () => (v.opties ? kiesGetal(l, v.opties) : typGetal(l, tip)),
    isGoed: (x) => x === v.n,
    noem: (x) => w(x),
    goed: async () => {
      vul(l, v.n, String(v.n));
      await l.zeg(bevestig());
      await l.wacht(300);
    },
    samen: () => telStreepjes(l, v.labels, v.n, "Het vlaggetje", v.stap),
    tip,
    testAntwoord: v.n,
  };
}

/* ---------- 3. op volgorde zetten ---------- */

type OrdenVraag = { vakken: (number | null)[]; kaarten: number[]; handje?: boolean; hokjes?: boolean; vraag?: string[] };

function ordenVraag(l: Lesgids, w0: OrdenVraag): SqulaVraag<number[]> {
  /* De kaarten liggen nooit al op volgorde (herstel 7 november: dan hoeft het kind niets te doen). */
  const v: OrdenVraag = { ...w0, kaarten: mengNietOplopend(w0.kaarten) };
  const alles = [...v.vakken.filter((n): n is number => n !== null), ...v.kaarten].sort((a, b) => a - b);
  const vast = v.vakken.findIndex((n) => n !== null);
  const stap = alles[1] - alles[0];
  const kleinste = Math.min(...v.kaarten);
  const tip = vast === 0 ? [`Het eerste vak heeft al ${w(v.vakken[0]!)}. Tel ${stap > 1 ? w(stap) : "1"} verder voor het volgende getal.`] : ["Welk getal zeg je het eerst als je telt? Dat getal komt vooraan."];
  let eerste = true;
  /* Liggen de kaarten nog van de vorige poging in de vakken, dan eerst terug (nieuwe ronde). */
  let vers = false;
  const leg = () => {
    toon(l, { soort: "orden", vakken: v.vakken, kaarten: v.kaarten, hokjes: v.hokjes });
    vers = true;
  };
  return {
    synthesis: true,
    reactie: (x) => {
      const p = x.findIndex((n, i) => n !== alles[i]);
      const omgekeerd = x.length > 1 && x.every((n, i) => n === alles[alles.length - 1 - i]);
      if (omgekeerd) return [`Je zette ${w(x[0])} vooraan. Dat is het grootste getal, en je begint bij het kleinste.`, ...tip];
      if (p > 0) return [`Tot en met ${w(x[p - 1])} staat het goed.`, vast === 0 ? `Tel ${stap > 1 ? w(stap) : "1"} verder vanaf ${w(x[p - 1])}.` : "Zoek het kleinste getal van wat nog over is."];
      if (p === 0) return [`Je zette ${w(x[0])} vooraan. Er is een kleiner getal.`, ...tip];
      return tip;
    },
    toonAntwoord: async () => {
      /* Alle getallen staan nu in de goede volgorde in de vakjes. */
      toon(l, { soort: "orden", vakken: alles, kaarten: [], hokjes: v.hokjes });
      await l.wacht(500);
      golf(l, 0);
      await l.zeg(`${rijtje(alles)}.`, `Van ${w(alles[0])} tot ${w(alles[alles.length - 1])} wordt het steeds groter.`);
      await l.wacht(300);
    },
    toon: leg,
    vraag: v.vraag ?? ["Zet de getallen op volgorde.", "Van klein naar groot."],
    antwoord: async () => {
      if (!vers) zet(l, { ronde: ++ronde });
      vers = false;
      zet(l, { actief: true, handje: eerste && !!v.handje });
      /* Eerst luisteren, dan pas praten: is het kind al klaar voordat Bliepo uitgesproken is, dan telt het toch. */
      const klaar = l.wachtOpVlak<{ soort: string; volgorde: number[] }>("orden");
      if (eerste && v.handje) await l.zeg("Sleep een kaart naar een vak.", "Of tik op een kaart.");
      eerste = false;
      const g = await klaar;
      zet(l, { actief: false, handje: false });
      return g.volgorde;
    },
    isGoed: (x) => x.join() === alles.join(),
    noem: (x) => rijtje(x),
    goed: async () => {
      golf(l, 0);
      await l.zeg(bevestig());
      await l.wacht(300);
    },
    samen: async () => {
      leg();
      licht(l, ...alles);
      await l.zeg(`Ik kijk naar de ${alles.length} getallen.`);
      if (stap === 1) await l.zeg("Ze volgen elkaar op: elk getal is 1 meer dan het getal ervoor.");
      else await l.zeg(`Elk getal is ${w(stap)} meer dan het getal ervoor.`);
      if (vast === 0) {
        licht(l, v.vakken[0]!);
        await l.zeg(`Vooraan staat al ${w(v.vakken[0]!)}.`, ...(krijgtVervolgvraag(l) ? [] : ["Welk getal komt daarna?"]));
      } else {
        if (vast > 0) {
          licht(l, v.vakken[vast]!);
          await l.zeg(`In het ${RANG[vast]} vak staat al ${w(v.vakken[vast]!)}.`);
        }
        licht(l, kleinste);
        await l.zeg(`${w(kleinste)} is het kleinste getal.`, "Dat komt helemaal vooraan.");
      }
      licht(l);
    },
    tip,
    testAntwoord: null,
  };
}

/* ---------- 4. groter dan … en kleiner dan … ---------- */

function tussenVraag(l: Lesgids, a: number, b: number, opties: number[]): SqulaVraag<number> {
  const goed = opties.find((o) => o > a && o < b)!;
  const zin = `Welk getal is groter dan ${w(a)} en kleiner dan ${w(b)}?`;
  return {
    synthesis: true,
    reactie: (x) => [
      x === a ? `${w(x)} is hetzelfde getal als ${w(a)}, dus niet groter.` : x === b ? `${w(x)} is hetzelfde getal als ${w(b)}, dus niet kleiner.` : x < a ? `${w(x)} is kleiner dan ${w(a)}, en het getal moet juist groter zijn.` : `${w(x)} is groter dan ${w(b)}, en het getal moet juist kleiner zijn.`,
      `Tel vanaf ${w(a)} verder tot ${w(b)}. Zoek het getal dat je onderweg zegt.`,
    ],
    toonAntwoord: async () => {
      toon(l, { soort: "lijn", van: 0, tot: 20, labels: Array.from({ length: 21 }, (_, i) => i) });
      vul(l, goed, String(goed));
      await l.zeg(`${w(goed)} is groter dan ${w(a)} en kleiner dan ${w(b)}.`);
      await l.wacht(300);
    },
    /* Herstel 7 november: geen leeg scherm. Een getallenlijn met alleen de 2 grenzen erop; het antwoord staat er niet bij. */
    toon: () => toon(l, { soort: "lijn", van: 0, tot: 20, labels: [0, a, b, 20] }),
    vraag: [zin],
    antwoord: () => kiesGetal(l, opties),
    isGoed: (x) => x === goed,
    noem: (x) => w(x),
    goed: async () => {
      await l.zeg(bevestig());
      await l.wacht(300);
    },
    samen: async () => {
      toon(l, { soort: "lijn", van: 0, tot: 20, labels: Array.from({ length: 21 }, (_, i) => i) });
      licht(l, a, b);
      await l.zeg(`Ik zet ${w(a)} en ${w(b)} op de getallenlijn.`, `Het getal ligt ertussen.`);
      for (const o of opties) {
        if (o === goed) continue;
        lichtBij(l, [a, b, o]);
        await l.zeg(o < a ? `${w(o)} is kleiner dan ${w(a)}.` : `${w(o)} is groter dan ${w(b)}.`);
      }
      licht(l, a, b);
      if (!krijgtVervolgvraag(l)) await l.zeg("Welk getal ligt ertussen?");
    },
    tip: [`Het getal moet meer zijn dan ${w(a)} en minder dan ${w(b)}.`],
    testAntwoord: goed,
  };
}

/* ---------- 5. het raketje op de getallenlijn (tot 31 oktober 2026: Floep de kikker) ---------- */

const naamVan = (z: Wezen) => (z === "raketje" ? "het raketje" : z === "ufo" ? "de ufo" : "de satelliet");
const Naam = (z: Wezen) => {
  const n = naamVan(z);
  return n[0].toUpperCase() + n.slice(1);
};

/** Bij welk getal staat het raketje? */
function raketjeBij(l: Lesgids, o: { van: number; tot: number; n: number; opties: number[]; vraag?: string[] }): SqulaVraag<number> {
  const labels = Array.from({ length: o.tot - o.van + 1 }, (_, i) => o.van + i);
  let nFout = 0;
  return {
    synthesis: true,
    reactie: (x) =>
      x === o.n - 1
        ? [`${w(x)} is het streepje net vóór het raketje.`, "Het raketje staat 1 streepje verder dan dat streepje."]
        : [x === o.n + 1 ? `${w(x)} is het streepje net na het raketje.` : x < o.n ? `Het raketje staat verder dan ${w(x)}.` : `Zo ver als ${w(x)} is het raketje nog niet.`, `Kijk naar het streepje direct voor het raketje. Tel daar 1 bij.`],
    toonAntwoord: async () => {
      vul(l, o.n, String(o.n));
      await l.zeg(`Na ${w(o.n - 1)} komt ${w(o.n)}.`, `Het raketje staat bij ${w(o.n)}.`);
      await l.wacht(300);
    },
    fout: () => {
      nFout++;
    },
    /* Het rondje van de hint blijft zolang Bliepo erover praat (besluit 4). */
    wijs: () => {
      if (nFout === 1) licht(l, o.n - 1);
    },
    wijsWeg: () => licht(l),
    toon: () => {
      nFout = 0;
      toon(l, { soort: "lijn", van: o.van, tot: o.tot, labels, raketje: { n: o.n } });
    },
    vraag: o.vraag ?? ["Bij welk getal staat het raketje?"],
    antwoord: () => kiesGetal(l, o.opties),
    isGoed: (x) => x === o.n,
    noem: (x) => w(x),
    goed: async () => {
      vul(l, o.n, String(o.n));
      await l.zeg(bevestig());
      await l.wacht(300);
    },
    samen: async () => {
      await l.zeg("Ik loop langs de streepjes tot vlak voor het raketje.");
      const tel: number[] = [];
      for (let k = Math.max(o.van, o.n - 4); k < o.n; k++) {
        tel.push(k);
        lichtBij(l, tel);
        await l.zeg(`${w(k)}.`);
      }
      licht(l, o.n - 1, o.n);
      await l.zeg(`En na ${w(o.n - 1)} staat het raketje.`);
      licht(l);
    },
    tip: [`Kijk naar het streepje direct voor het raketje. Tel daar 1 bij.`],
    testAntwoord: o.n,
  };
}

/** Welk getal komt na 10? (De lijn loopt door na 10, zonder getallen.) */
function naTien(l: Lesgids, opties: number[]): SqulaVraag<number> {
  const labels = Array.from({ length: 11 }, (_, i) => i);
  return {
    synthesis: true,
    reactie: (x) => [x === 10 ? "{10:wit} is het laatste getal op de lijn. Het raketje is al voorbij de {10:wit}." : x < 10 ? `Het raketje is het streepje van ${w(x)} al voorbij.` : `Zo ver vliegt het raketje nog niet: ${w(x)} komt pas later.`, "De lijn eindigt bij {10:wit}, maar het raketje vliegt door. Tel 1 verder."],
    toonAntwoord: async () => {
      vul(l, 11, "11");
      await l.zeg("Na {10:wit} komt {11:wit}.");
      await l.wacht(300);
    },
    wijs: () => licht(l, 10),
    wijsWeg: () => licht(l),
    toon: () => toon(l, { soort: "lijn", van: 0, tot: 10, labels, door: true, raketje: { n: 11 } }),
    vraag: ["Het raketje vliegt verder dan de {10:wit}.", "Welk getal komt na {10:wit}?"],
    antwoord: () => kiesGetal(l, opties),
    isGoed: (x) => x === 11,
    noem: (x) => w(x),
    goed: async () => {
      vul(l, 11, "11");
      await l.zeg(bevestig());
      await l.wacht(300);
    },
    samen: async () => {
      await l.zeg("Ik tel de laatste streepjes van de lijn.");
      const geteld: number[] = [];
      for (const k of [8, 9, 10]) {
        geteld.push(k);
        lichtBij(l, geteld);
        await l.zeg(`${w(k)}.`);
      }
      licht(l, 10, 11);
      await l.zeg("Het raketje staat 1 streepje verder.");
      licht(l);
    },
    tip: ["De lijn eindigt bij {10:wit}, maar het raketje vliegt door. Tel 1 verder."],
    testAntwoord: 11,
  };
}

/** Wat is meer? (kies uit 2) */
function watIsMeer(l: Lesgids, verhaal: string[], a: number, b: number): SqulaVraag<number> {
  const groot = Math.max(a, b);
  const klein = Math.min(a, b);
  const keuzes = [b, a];
  /* Herstel 7 november (BOUWREGELS 1.22): geen losse planeet meer. Tijdens de vraag de getallenlijn zonder raketje; na het antwoord landt het raketje bij het grootste getal. */
  const lijn = { soort: "lijn" as const, van: 10, tot: 20, labels: [10, 15, 20] };
  const landt = () => {
    toon(l, { ...lijn, raketje: { n: groot } });
    vul(l, groot, String(groot));
  };
  return {
    synthesis: true,
    reactie: (x) => [`Als je telt, zeg je ${w(x)} eerder dan ${w(x === a ? b : a)}.`, "Het getal dat je later zegt, is meer."],
    toonAntwoord: async () => {
      toon(l, { soort: "lijn", van: 10, tot: 20, labels: Array.from({ length: 11 }, (_, i) => 10 + i) });
      licht(l, klein, groot);
      await l.zeg(`${w(groot)} komt later dan ${w(klein)}.`, `${w(groot)} is meer dan ${w(klein)}.`);
      golf(l, groot);
      await l.wacht(300);
    },
    toon: () => toon(l, lijn),
    vraag: [...verhaal, `Wat is meer: ${w(a)} of ${w(b)}?`],
    antwoord: () => kiesGetal(l, keuzes),
    isGoed: (x) => x === groot,
    noem: (x) => w(x),
    goed: async () => {
      landt();
      await l.zeg(bevestig());
      await l.wacht(700);
    },
    samen: async () => {
      toon(l, { soort: "lijn", van: 10, tot: 20, labels: Array.from({ length: 11 }, (_, i) => 10 + i) });
      licht(l, klein, groot);
      await l.zeg(`Ik zet ${w(klein)} en ${w(groot)} op de getallenlijn.`, "Hoe verder je telt, hoe meer het is.");
      licht(l, klein);
      await l.zeg(`Hier staat ${w(klein)}.`);
      lichtBij(l, [klein, groot]);
      await l.zeg(`En hier staat ${w(groot)}.`, "Dit getal zeg je later als je telt.");
      licht(l);
    },
    tip: ["Het getal dat je later zegt als je telt, is meer."],
    testAntwoord: groot,
  };
}

/** Wat staat er bij …? (tik op het ding) */
function wieZitEr(
  l: Lesgids,
  o: { labels: number[]; n: number; wie: Wezen; raketje: number; anderen: { soort: Exclude<Wezen, "raketje">; n: number }[] },
): SqulaVraag<string> {
  const beeld: Beeld = { soort: "lijn", van: 10, tot: 20, labels: o.labels, raketje: { n: o.raketje }, wezens: o.anderen };
  const tip = tipStreepjes(o.labels, o.n, 1, `het streepje van ${w(o.n)}`);
  let nFout = 0;
  return {
    synthesis: true,
    reactie: (x) => [`Je tikte op ${naamVan(x as Wezen)}. Die staat bij een ander getal dan ${w(o.n)}.`, ...tip],
    toonAntwoord: async () => {
      vul(l, o.n, String(o.n));
      await l.zeg(`${Naam(o.wie)} staat bij ${w(o.n)}.`);
      await l.wacht(300);
    },
    fout: () => {
      nFout++;
    },
    /* Het rondje van de hint blijft zolang Bliepo erover praat (besluit 4). */
    wijs: () => {
      if (nFout === 1) licht(l, ijkpunt(o.labels, o.n));
    },
    wijsWeg: () => licht(l),
    toon: () => {
      nFout = 0;
      toon(l, beeld);
    },
    vraag: [`Wat staat er bij ${w(o.n)}?`, "Tik erop."],
    antwoord: async () => {
      zet(l, { actief: true });
      const g = await l.wachtOpVlak<{ soort: string; naam: Wezen }>("wezen");
      zet(l, { actief: false });
      return g.naam;
    },
    isGoed: (x) => x === o.wie,
    noem: (x) => Naam(x as Wezen),
    goed: async () => {
      vul(l, o.n, String(o.n));
      await l.zeg(bevestig());
      await l.wacht(300);
    },
    samen: () => telStreepjes(l, o.labels, o.n, w(o.n), 1, "is"),
    tip,
    testAntwoord: o.wie,
  };
}

/** Welk getal ligt het dichtst bij …? (drie bordjes) */
function dichtstBij(l: Lesgids, doel: number, g0: number[], wezens: Wezen[]): SqulaVraag<number> {
  /* Herstel 7 november: de bordjes in een willekeurige volgorde, en zonder losse ufo, satelliet en raketje ernaast (alleen versiering, BOUWREGELS 1.22). */
  void wezens;
  const getallen = meng(g0);
  const goed = [...getallen].sort((a, b) => Math.abs(a - doel) - Math.abs(b - doel))[0];
  const verder = getallen.filter((g) => g !== goed).sort((a, b) => Math.abs(b - doel) - Math.abs(a - doel));
  return {
    synthesis: true,
    reactie: (x) => [`${w(x)} is ${w(Math.abs(x - doel))} van de ${w(doel)} af. Een ander getal ligt dichterbij.`, `Tel hoeveel stapjes het van elk getal naar de ${w(doel)} is. Het kleinste aantal stapjes is het dichtst bij.`],
    toonAntwoord: async () => {
      golf(l, getallen.indexOf(goed));
      await l.zeg(`${w(goed)} ligt het dichtst bij ${w(doel)}.`, `Het is maar ${Math.abs(goed - doel)} verder of terug.`);
      await l.wacht(300);
    },
    toon: () => toon(l, { soort: "bordjes", getallen, wezens: [] }),
    vraag: [`Welk getal ligt het dichtst bij ${w(doel)}?`],
    antwoord: () => kiesGetal(l, getallen),
    isGoed: (x) => x === goed,
    noem: (x) => w(x),
    goed: async () => {
      golf(l, getallen.indexOf(goed));
      await l.zeg(bevestig());
      await l.wacht(300);
    },
    samen: async () => {
      const labels = [...new Set([0, 20, doel, ...getallen])].sort((a, b) => a - b);
      toon(l, { soort: "lijn", van: 0, tot: 20, labels });
      licht(l, doel);
      await l.zeg(`Ik zet de getallen op de getallenlijn.`, `Hier is ${w(doel)}.`);
      licht(l, doel, verder[0]);
      await l.zeg(`${w(verder[0])} ligt ver van de ${w(doel)}.`);
      licht(l, doel, verder[1]);
      const even = Math.abs(verder[1] - doel) === Math.abs(verder[0] - doel);
      await l.zeg(even ? `${w(verder[1])} ligt ook ver van de ${w(doel)}.` : `${w(verder[1])} ligt al dichterbij.`, ...(krijgtVervolgvraag(l) ? [] : ["Welk getal ligt er nog dichterbij?"]));
      licht(l);
    },
    tip: [`Tel hoeveel stapjes het van elk getal naar de ${w(doel)} is. Het kleinste aantal stapjes is het dichtst bij.`],
    testAntwoord: goed,
  };
}

/** Bij welk getal staat het raketje ongeveer? (een lijn met bijna geen streepjes) */
function ongeveer(
  l: Lesgids,
  o: { van: number; tot: number; streepjes: number[]; labels: number[]; plek: number; goed: number; opties: number[]; hulp: { licht: number[]; zinnen: string[] }; tip: string[] },
): SqulaVraag<number> {
  let nFout = 0;
  return {
    synthesis: true,
    reactie: (x) => [x < o.goed ? `Het raketje staat verder naar rechts dan ${w(x)}.` : `Het raketje staat nog links van ${w(x)}.`, ...o.tip],
    toonAntwoord: async () => {
      licht(l, ...o.hulp.licht);
      await l.zeg(...o.hulp.zinnen);
      golf(l, o.plek);
      await l.zeg(`Het raketje staat ongeveer bij ${w(o.goed)}.`);
      await l.wacht(300);
    },
    fout: () => {
      nFout++;
    },
    /* Het rondje van de hint blijft zolang Bliepo erover praat (besluit 4). */
    wijs: () => {
      if (nFout === 1) licht(l, ...o.hulp.licht);
    },
    wijsWeg: () => licht(l),
    toon: () => {
      nFout = 0;
      toon(l, { soort: "lijn", van: o.van, tot: o.tot, streepjes: o.streepjes, labels: o.labels, raketje: { n: o.plek } });
    },
    vraag: ["Bij welk getal staat het raketje ongeveer?"],
    antwoord: () => kiesGetal(l, o.opties),
    isGoed: (x) => x === o.goed,
    noem: (x) => w(x),
    goed: async () => {
      golf(l, o.plek);
      await l.zeg(bevestig());
      await l.wacht(300);
    },
    samen: async () => {
      licht(l, ...o.hulp.licht);
      await l.zeg(...o.hulp.zinnen);
      licht(l);
    },
    tip: o.tip,
    testAntwoord: o.goed,
  };
}

/** Welk getal komt voor …? (het raketje op een planeet met een getal) */
function komtVoor(l: Lesgids, n: number, opties: number[], aanloop: string): SqulaVraag<number> {
  return {
    synthesis: true,
    reactie: (x) => [x === n ? `${w(x)} is het getal van de planeet zelf, niet het getal ervoor.` : x > n ? `${w(x)} komt na ${w(n)}, niet ervoor.` : `Van ${w(n)} naar ${w(x)} is meer dan 1 terug.`, `Begin bij ${w(n)} op de planeet en tel 1 terug.`],
    toonAntwoord: async () => {
      toon(l, { soort: "lijn", van: 9, tot: 20, labels: Array.from({ length: 12 }, (_, i) => 9 + i) });
      vul(l, n - 1, String(n - 1));
      await l.zeg(`Voor ${w(n)} komt ${w(n - 1)}.`);
      await l.wacht(300);
    },
    toon: () => toon(l, { soort: "planeet", getal: n }),
    vraag: [aanloop, `Welk getal komt voor ${w(n)}?`],
    antwoord: () => kiesGetal(l, opties),
    isGoed: (x) => x === n - 1,
    noem: (x) => w(x),
    goed: async () => {
      golf(l, 0);
      await l.zeg(bevestig());
      await l.wacht(300);
    },
    samen: async () => {
      toon(l, { soort: "lijn", van: 9, tot: 20, labels: Array.from({ length: 12 }, (_, i) => 9 + i).filter((k) => k !== n - 1) });
      licht(l, n);
      await l.zeg(`Hier is ${w(n)} op de getallenlijn.`, "Het getal ervoor staat er links naast.");
      licht(l, n - 1, n);
      await l.zeg("Dat is 1 terug.");
      licht(l);
    },
    tip: [`Begin bij ${w(n)} op de planeet en tel 1 terug.`],
    testAntwoord: n - 1,
  };
}

/** Een pijl wijst een streepje aan: welk getal is het? */
function pijlWijst(l: Lesgids, n: number, opties: number[]): SqulaVraag<number> {
  const labels = [10, 15, 20];
  let nFout = 0;
  return {
    synthesis: true,
    reactie: (x) => lijnReactie(labels, n, x, tipStreepjes(labels, n, 1, "de pijl"), 1, "de pijl"),
    toonAntwoord: async () => {
      vul(l, n, String(n));
      await l.zeg(lijnWaarom(labels, n, 1, "De pijl"), `De pijl wijst ${w(n)} aan.`);
      await l.wacht(300);
    },
    fout: () => {
      nFout++;
    },
    /* Het rondje van de hint blijft zolang Bliepo erover praat (besluit 4). */
    wijs: () => {
      if (nFout === 1) licht(l, ijkpunt(labels, n));
    },
    wijsWeg: () => licht(l),
    toon: () => {
      nFout = 0;
      toon(l, { soort: "lijn", van: 8, tot: 20, labels, raketje: { n, wijs: true } });
    },
    vraag: ["De pijl wijst een streepje aan.", "Welk getal hoort daarbij?"],
    antwoord: () => kiesGetal(l, opties),
    isGoed: (x) => x === n,
    noem: (x) => w(x),
    goed: async () => {
      vul(l, n, String(n));
      await l.zeg(bevestig());
      await l.wacht(300);
    },
    samen: () => telStreepjes(l, labels, n, "De pijl"),
    tip: tipStreepjes(labels, n, 1, "de pijl"),
    testAntwoord: n,
  };
}

/**
 * Bij welk getal staat de ufo of de satelliet? Herstel ronde 2 (7 november): de lijn begint bij 10, en daar staat nu ook 10 onder,
 * net als bij de pijl en "wie zit er bij …" (eerst stonden alleen 15 en 20 eronder, dan wist een kind niet waar de lijn begint).
 */
function wezenGetal(l: Lesgids, o: { wie: Exclude<Wezen, "raketje">; n: number; raketje: number; ander: { soort: Exclude<Wezen, "raketje">; n: number }; opties: number[] }): SqulaVraag<number> {
  const labels = [10, 15, 20];
  let nFout = 0;
  return {
    synthesis: true,
    reactie: (x) => lijnReactie(labels, o.n, x, tipStreepjes(labels, o.n, 1, naamVan(o.wie)), 1, naamVan(o.wie)),
    toonAntwoord: async () => {
      vul(l, o.n, String(o.n));
      await l.zeg(lijnWaarom(labels, o.n, 1, Naam(o.wie)), `${Naam(o.wie)} staat bij ${w(o.n)}.`);
      await l.wacht(300);
    },
    fout: () => {
      nFout++;
    },
    /* Het rondje van de hint blijft zolang Bliepo erover praat (besluit 4). */
    wijs: () => {
      if (nFout === 1) licht(l, ijkpunt(labels, o.n));
    },
    wijsWeg: () => licht(l),
    toon: () => {
      nFout = 0;
      toon(l, { soort: "lijn", van: 10, tot: 20, labels, raketje: { n: o.raketje }, wezens: [{ soort: o.wie, n: o.n }, o.ander] });
    },
    vraag: [`Bij welk getal staat ${naamVan(o.wie)}?`],
    antwoord: () => kiesGetal(l, o.opties),
    isGoed: (x) => x === o.n,
    noem: (x) => w(x),
    goed: async () => {
      vul(l, o.n, String(o.n));
      await l.zeg(bevestig());
      await l.wacht(300);
    },
    samen: () => telStreepjes(l, labels, o.n, Naam(o.wie), 1, "staat"),
    tip: tipStreepjes(labels, o.n, 1, naamVan(o.wie)),
    testAntwoord: o.n,
  };
}

/** Het raketje helemaal aan het eind van de lijn. */
function aanHetEind(l: Lesgids, opties: number[]): SqulaVraag<number> {
  return {
    synthesis: true,
    reactie: (x) => [x < 20 ? `Het raketje vliegt nog verder dan ${w(x)}.` : `De lijn loopt niet zo ver als ${w(x)}.`, "Tel in sprongen van {5:wit} vanaf het midden."],
    toonAntwoord: async () => {
      vul(l, 20, "20");
      await l.zeg("Het raketje staat op het laatste streepje.", "Dat is {20:wit}.");
      await l.wacht(300);
    },
    toon: () => toon(l, { soort: "lijn", van: 0, tot: 20, streepjes: [0, 5, 10, 15, 20], labels: [0, 20], raketje: { n: 20 } }),
    vraag: ["Het raketje vliegt helemaal naar het eind.", "Bij welk getal staat het raketje nu?"],
    antwoord: () => kiesGetal(l, opties),
    isGoed: (x) => x === 20,
    noem: (x) => w(x),
    goed: async () => {
      vul(l, 20, "20");
      await l.zeg(bevestig());
      await l.wacht(300);
    },
    samen: async () => {
      licht(l, 0);
      await l.zeg("De lijn begint bij {0:wit}.");
      licht(l, 10);
      await l.zeg("Precies in het midden is {10:wit}.");
      licht(l, 10, 15);
      await l.zeg("Elk streepje is {5:wit} verder.");
      licht(l);
      await l.zeg("Het raketje staat op het laatste streepje.");
    },
    tip: ["Tel in sprongen van {5:wit} vanaf het midden."],
    testAntwoord: 20,
  };
}

/* ---------- 6. dingen op de getallen (bij Squla dieren) ---------- */

/** Een ding ligt op een getal: welk getal ligt eronder? (kies uit 2) */
function dingOpGetal(l: Lesgids, rij: (number | Ding)[], opties: number[]): SqulaVraag<number> {
  const plek = rij.findIndex((p) => typeof p !== "number");
  const ding = rij[plek] as Ding;
  const eerste = rij.find((p): p is number => typeof p === "number")!;
  const start = plek === 0 ? eerste - 1 : (rij[0] as number);
  const goed = start + plek;
  const items: RijItem[] = rij.map((p) => (typeof p === "number" ? { t: String(p) } : { voorwerp: p }));
  const tussen = plek < rij.length - 1;
  let nFout = 0;
  return {
    synthesis: true,
    reactie: (x) => [
      rij.includes(x) ? `${w(x)} staat al in de rij, op een andere plek.` : x === goed + 1 ? `${w(x)} is 1 getal te ver.` : x === goed - 1 ? `${w(x)} komt eerder in de rij.` : `${w(x)} komt niet direct na ${w(goed - 1)}.`,
      `Kijk naar het getal links van ${DINGNAAM[ding]}. Tel daar 1 bij.`,
    ],
    toonAntwoord: async () => {
      vul(l, plek, String(goed));
      await l.zeg(tussen ? `${w(goed)} zit tussen ${w(goed - 1)} en ${w(goed + 1)}.` : `Na ${w(goed - 1)} komt ${w(goed)}.`);
      await l.wacht(300);
    },
    fout: () => {
      nFout++;
    },
    /* Het rondje van de hint blijft zolang Bliepo erover praat (besluit 4). */
    wijs: () => {
      if (nFout === 1 && plek > 0) licht(l, plek - 1);
    },
    wijsWeg: () => licht(l),
    toon: () => {
      nFout = 0;
      toon(l, { soort: "rij", ding: "tegel", items });
    },
    vraag: [`Welk getal ligt onder ${DINGNAAM[ding]}?`],
    antwoord: () => kiesGetal(l, opties),
    isGoed: (x) => x === goed,
    noem: (x) => w(x),
    goed: async () => {
      vul(l, plek, String(goed));
      await l.zeg(bevestig());
      await l.wacht(300);
    },
    samen: async () => {
      await l.zeg(`Ik tel de getallen tot ${DINGNAAM[ding]}.`);
      for (let i = 0; i < plek; i++) {
        lichtBij(l, Array.from({ length: i + 1 }, (_, k) => k));
        await l.zeg(`${w(start + i)}.`);
      }
      if (tussen) {
        licht(l, plek + 1);
        await l.zeg(`Na ${DINGNAAM[ding]} staat ${w(goed + 1)}.`);
      }
      licht(l, plek);
      if (!krijgtVervolgvraag(l)) await l.zeg(`Welk getal komt na ${w(goed - 1)}?`);
      licht(l);
    },
    tip: [`Kijk naar het getal links van ${DINGNAAM[ding]}. Tel daar 1 bij.`],
    testAntwoord: goed,
  };
}

/** De bus is zo lang dat hij op twee getallen staat (bij Squla een olifant). */
function lang(l: Lesgids, a: number, goedEerst0: boolean): SqulaVraag<string> {
  /* Herstel 7 november: willekeurig welke keuze eerst staat. */
  void goedEerst0;
  const goedEerst = Math.random() < 0.5;
  const goed = `${a + 1} en ${a + 2}`;
  const fout = `${a - 2} en ${a - 1}`;
  const items: RijItem[] = [{ t: String(a) }, { voorwerp: "bus" }];
  return {
    synthesis: true,
    reactie: (x) => [`${x.replace(/(\d+)/g, "{$1:wit}")} komen vóór ${w(a)}, niet erna.`, `De bus staat rechts van ${w(a)}. Tel vanaf ${w(a)} 2 getallen verder.`],
    toonAntwoord: async () => {
      vul(l, 1, `${a + 1}   ${a + 2}`);
      await l.zeg(`Na ${w(a)} komen ${w(a + 1)} en ${w(a + 2)}.`, "De bus bedekt allebei die getallen.");
      await l.wacht(300);
    },
    toon: () => toon(l, { soort: "rij", ding: "tegel", items }),
    vraag: ["De bus is lang.", "Hij staat op 2 getallen tegelijk.", "Welke getallen liggen onder de bus?"],
    antwoord: async () => (await l.kies(goedEerst ? [goed, fout] : [fout, goed], { weetniet: false, direct: true })) ?? "",
    isGoed: (x) => x === goed,
    noem: (x) => x.replace(/(\d+)/g, "{$1:wit}"),
    goed: async () => {
      vul(l, 1, `${a + 1}   ${a + 2}`);
      await l.zeg(bevestig());
      await l.wacht(300);
    },
    samen: async () => {
      licht(l, 0);
      await l.zeg(`Hier staat ${w(a)}.`);
      lichtBij(l, [0, 1]);
      await l.zeg("De bus staat erna.", "Hij staat op 2 plekken.", ...(krijgtVervolgvraag(l) ? [] : [`Welke 2 getallen komen na ${w(a)}?`]));
      licht(l);
    },
    tip: [`De bus staat rechts van ${w(a)}. Tel vanaf ${w(a)} 2 getallen verder.`],
    testAntwoord: goed,
  };
}

/* ---------- de lessen ---------- */

type Opgave = (l: Lesgids) => SqulaVraag<number> | SqulaVraag<number[]> | SqulaVraag<string>;

async function speelOpgaven(l: Lesgids, opgaven: Opgave[], voorbeeldAfgerond = false) {
  let fouten = 0;
  for (const maak of opgaven.slice(voorbeeldAfgerond ? 1 : 0)) {
    const v = maak(l) as SqulaVraag<unknown>;
    speelLesgeluid("verschijn");
    if (!(await vraag(l, v))) fouten++;
  }
  return fouten;
}

/* ---- 16056 Getallen rangschikken t/m 20 ---- */

const RANGSCHIKKEN_1: Opgave[] = [
  /* een lichtslinger met één lege plek: kies uit 3 */
  (l) => rijVraag(l, { ding: "lampje", slinger: true, rij: [3, 4, 5, "…", 7], start: 3, gat: 3, opties: [8, 6, 2], vraag: ["Welk getal hoort op de puntjes?"] }),
  (l) => rijVraag(l, { ding: "lampje", slinger: true, rij: [11, 12, "…", 14, 15], start: 11, gat: 2, opties: [13, 10, 3], vraag: ["Welk getal hoort op de puntjes?"] }),
  (l) => rijVraag(l, { ding: "lampje", slinger: true, rij: [16, 17, 18, "…", 20], start: 16, gat: 3, opties: [15, 19, 9], vraag: ["Welk getal hoort op de puntjes?"] }),
  /* planeetjes: één zonder getal, en een vraagteken */
  /* Herstel 7 november: alleen het vraagteken is leeg; geen planeten zonder getal meer die niet worden uitgelegd. Het antwoord blijft hetzelfde. */
  (l) => rijVraag(l, { ding: "planeet", rij: [4, 5, 6, 7, "?"], start: 4, gat: 4, opties: [7, 9, 8], vraag: ["Welk getal hoort bij het vraagteken?"] }),
  (l) => rijVraag(l, { ding: "planeet", rij: [12, 13, 14, "?", 16], start: 12, gat: 3, opties: [15, 17, 11], vraag: ["Welk getal hoort bij het vraagteken?"] }),
  (l) => rijVraag(l, { ding: "planeet", rij: [7, 8, 9, 10, "?"], start: 7, gat: 4, opties: [10, 11, 12], vraag: ["Welk getal hoort bij het vraagteken?"] }),
  /* getallenlijn 0–20 met een vlaggetje */
  (l) => lijnVraag(l, { van: 0, tot: 20, labels: [0, 5, 10, 15, 20], n: 7, opties: [7, 6, 8], vraag: ["Bij welk getal staat het vlaggetje?"] }),
  (l) => lijnVraag(l, { van: 0, tot: 20, labels: [0, 5, 10, 15, 20], n: 13, opties: [14, 13, 12], vraag: ["Bij welk getal staat het vlaggetje?"] }),
  (l) => lijnVraag(l, { van: 0, tot: 20, labels: [0, 5, 10, 15, 20], n: 16, opties: [16, 17, 15], vraag: ["Bij welk getal staat het vlaggetje?"] }),
  /* een rij sterren met puntjes: typen */
  (l) => rijVraag(l, { ding: "ster", rij: [2, 3, 4, "…", 6, 7], start: 2, gat: 3, vraag: ["Welk getal hoort op de puntjes?"] }),
  (l) => rijVraag(l, { ding: "ster", rij: [10, 11, "…", 13, 14, 15], start: 10, gat: 2, vraag: ["Welk getal hoort op de puntjes?"] }),
  (l) => rijVraag(l, { ding: "ster", rij: [15, 16, 17, "…", 19, 20], start: 15, gat: 3, vraag: ["Welk getal hoort op de puntjes?"] }),
  /* op volgorde, in sprongen van 2, het eerste getal staat er al */
  (l) => ordenVraag(l, { vakken: [2, null, null, null, null], kaarten: [8, 4, 10, 6], handje: true }),
  (l) => ordenVraag(l, { vakken: [11, null, null, null, null], kaarten: [17, 13, 19, 15] }),
  (l) => ordenVraag(l, { vakken: [12, null, null, null, null], kaarten: [16, 20, 14, 18] }),
];

const RANGSCHIKKEN_2: Opgave[] = [
  /* diamanten, getallen eronder, de puntjes in het midden */
  /* Herstel 7 november: onder elke diamant (en ster) staat iets: een getal, puntjes of het vraagteken. Zo zie je welke plek het is. */
  (l) => rijVraag(l, { ding: "kristal", onder: true, rij: [2, "…", "?", "…", 6], start: 2, gat: 2, opties: [3, 4, 5], vraag: ["Welk getal hoort bij het vraagteken?"] }),
  (l) => rijVraag(l, { ding: "kristal", onder: true, rij: [10, "…", "?", "…", 14], start: 10, gat: 2, opties: [12, 13, 11], vraag: ["Welk getal hoort bij het vraagteken?"] }),
  (l) => rijVraag(l, { ding: "kristal", onder: true, rij: [15, "…", "?", "…", 19], start: 15, gat: 2, opties: [16, 18, 17], vraag: ["Welk getal hoort bij het vraagteken?"] }),
  /* sterren, zelfde soort vraag */
  (l) => rijVraag(l, { ding: "ster", onder: true, rij: [6, "…", "?", "…", 10], start: 6, gat: 2, opties: [8, 7, 9], vraag: ["Welk getal hoort bij het vraagteken?"] }),
  (l) => rijVraag(l, { ding: "ster", onder: true, rij: [13, "…", "?", "…", 17], start: 13, gat: 2, opties: [14, 15, 16], vraag: ["Welk getal hoort bij het vraagteken?"] }),
  (l) => rijVraag(l, { ding: "ster", onder: true, rij: [16, "…", "?", "…", 20], start: 16, gat: 2, opties: [18, 19, 17], vraag: ["Welk getal hoort bij het vraagteken?"] }),
  /* een slinger van 7 lampjes, één is rood: kies uit 4 */
  (l) => rijVraag(l, { ding: "lampje", slinger: true, rij: [2, 3, "-", "-", "-", "-", "-"], start: 2, gat: 3, rood: true, opties: [4, 5, 6, 7], vraag: ["Welk getal hoort bij het rode lampje?"] }),
  (l) => rijVraag(l, { ding: "lampje", slinger: true, rij: [10, 11, "-", "-", "-", "-", "-"], start: 10, gat: 4, rood: true, opties: [12, 13, 14, 15], vraag: ["Welk getal hoort bij het rode lampje?"] }),
  (l) => rijVraag(l, { ding: "lampje", slinger: true, rij: [13, 14, "-", "-", "-", "-", "-"], start: 13, gat: 6, rood: true, opties: [17, 18, 19, 20], vraag: ["Welk getal hoort bij het rode lampje?"] }),
  /* getallenlijn met alleen 0, 10 en 20 */
  (l) => lijnVraag(l, { van: 0, tot: 20, labels: [0, 10, 20], n: 18, opties: [8, 18, 15], vraag: ["Bij welk getal staat het vlaggetje?"] }),
  (l) => lijnVraag(l, { van: 0, tot: 20, labels: [0, 10, 20], n: 12, opties: [2, 12, 16], vraag: ["Bij welk getal staat het vlaggetje?"] }),
  (l) => lijnVraag(l, { van: 0, tot: 20, labels: [0, 10, 20], n: 3, opties: [3, 13, 6], vraag: ["Bij welk getal staat het vlaggetje?"] }),
  (l) => lijnVraag(l, { van: 0, tot: 20, labels: [0, 10, 20], n: 14, opties: [4, 14, 17], vraag: ["Bij welk getal staat het vlaggetje?"] }),
  /* op volgorde in sprongen van 5; het vaste getal staat niet vooraan */
  (l) => ordenVraag(l, { vakken: [null, null, 10, null, null], kaarten: [20, 5, 15, 0], handje: true }),
  (l) => ordenVraag(l, { vakken: [null, null, null, 15, null], kaarten: [10, 0, 20, 5] }),
];

const RANGSCHIKKEN_3: Opgave[] = [
  /* getallenlijn 0–20 met een rijtje getallen erbij */
  (l) => lijnVraag(l, { van: 0, tot: 20, labels: [0, 10, 11, 12, 13, 14, 20], n: 15, opties: [15, 16, 5], vraag: ["Bij welk getal staat het vlaggetje?"] }),
  (l) => lijnVraag(l, { van: 0, tot: 20, labels: [0, 15, 16, 17, 18, 19, 20], n: 14, opties: [14, 13, 4], vraag: ["Bij welk getal staat het vlaggetje?"] }),
  /* getallenlijn 10–20 met streepjes per 2 */
  (l) => lijnVraag(l, { van: 10, tot: 20, stap: 2, labels: [10, 20], n: 14, opties: [4, 14, 15], vraag: ["Bij welk getal staat het vlaggetje?"] }),
  /* op volgorde, zonder vast getal */
  (l) => ordenVraag(l, { vakken: [null, null, null, null], kaarten: [7, 5, 6, 4], handje: true }),
  (l) => ordenVraag(l, { vakken: [null, null, null, null], kaarten: [16, 18, 17, 19] }),
  (l) => ordenVraag(l, { vakken: [null, null, null, null], kaarten: [13, 11, 10, 12] }),
  /* streepjes per 2: het vlaggetje staat ertussen, of op een streepje */
  (l) => lijnVraag(l, { van: 10, tot: 20, stap: 2, labels: [10, 20], n: 17, opties: [17, 7, 19], vraag: ["Bij welk getal staat het vlaggetje?"] }),
  (l) => lijnVraag(l, { van: 10, tot: 20, stap: 2, labels: [10, 20], n: 12, opties: [12, 13, 2], vraag: ["Bij welk getal staat het vlaggetje?"] }),
  /* getallenlijn met om en om een getal: typen */
  (l) => lijnVraag(l, { van: 0, tot: 20, labels: [0, 6, 8, 10, 12, 14, 20], n: 3, vraag: ["Bij welk getal staat het vlaggetje?"] }),
  (l) => lijnVraag(l, { van: 0, tot: 20, labels: [0, 5, 7, 9, 11, 13, 20], n: 16, vraag: ["Bij welk getal staat het vlaggetje?"] }),
  /* groter dan … en kleiner dan … */
  (l) => tussenVraag(l, 3, 7, [6, 2, 8]),
  (l) => tussenVraag(l, 10, 14, [15, 12, 9]),
  (l) => tussenVraag(l, 13, 17, [16, 18, 12]),
  /* een lange rij met veel puntjes: typen */
  (l) => rijVraag(l, { ding: "ster", rij: [3, "…", "…", "?", "…", "…", 9], start: 3, gat: 3, vraag: ["Welk getal hoort bij het vraagteken?"] }),
  (l) => rijVraag(l, { ding: "ster", rij: [12, "…", "…", "?", "…", "…", 18], start: 12, gat: 3, vraag: ["Welk getal hoort bij het vraagteken?"] }),
];

async function uitlegRij(l: Lesgids) {
  toon(l, { soort: "rij", ding: "lampje", slinger: true, items: [{ t: "1" }, { t: "2" }, { t: "3" }, { t: "…" }, { t: "5" }] });
  await l.zeg("Kijk, een lichtslinger met getallen.", "Op 1 lampje staan puntjes.");
  for (const i of [0, 1, 2]) {
    lichtBij(l, Array.from({ length: i + 1 }, (_, k) => k));
    await l.zeg(`${w(i + 1)}.`);
  }
  licht(l, 3);
  await l.zeg("Na {3:wit} komt {4:wit}.");
  vul(l, 3, "4");
  await l.zeg("Elk lampje is 1 verder.");
  await l.verder();
}

/** Uitleg bij de diamanten met puntjes (het voorbeeld van level 2): dezelfde soort rij, andere getallen. */
async function uitlegDiamant(l: Lesgids) {
  toon(l, { soort: "rij", ding: "kristal", onder: true, items: [{ t: "7" }, { t: "…" }, { t: "?" }, { t: "…" }, { t: "11" }] });
  await l.zeg("Kijk, diamanten met getallen eronder.", "Onder 1 diamant staat een vraagteken.");
  licht(l, 0);
  await l.zeg("Links staat {7:wit}.");
  lichtBij(l, [0, 4]);
  await l.zeg("Rechts staat {11:wit}.", "Elke diamant is 1 verder.");
  licht(l, 0);
  await l.zeg("{7:wit}.");
  lichtBij(l, [0, 1]);
  await l.zeg("{8:wit}.");
  lichtBij(l, [0, 1, 2]);
  await l.zeg("Nu komt de plek met het vraagteken.");
  vul(l, 2, "9");
  await l.zeg("Bij het vraagteken hoort {9:wit}.");
  await l.verder();
}
/** Uitleg bij de planeet (het voorbeeld van kat-2): welk getal komt ervoor? */
async function uitlegVoor(l: Lesgids) {
  toon(l, { soort: "planeet", getal: 8 });
  await l.zeg("Het raketje landt op een planeet met {8:wit}.", "We zoeken het getal ervoor.", "Dat is 1 terug.");
  await l.zeg("Tel 1 terug vanaf {8:wit}.", "Dat is {7:wit}.");
  await l.verder();
}
async function uitlegLijn(l: Lesgids, labels: number[], n: number) {
  toon(l, { soort: "lijn", van: 0, tot: 20, labels, vlag: { n, t: "?" } });
  await l.zeg("Dit is een getallenlijn.", "Elk streepje is 1 verder.");
  await telStreepjes(l, labels, n, "Het vlaggetje");
  vul(l, n, String(n));
  await l.zeg(`Dus het vlaggetje staat bij ${w(n)}.`);
  await l.verder();
}

async function uitlegPerTwee(l: Lesgids) {
  toon(l, { soort: "lijn", van: 10, tot: 20, stap: 2, labels: [10, 20], vlag: { n: 16, t: "?" } });
  await l.zeg("Op deze getallenlijn staan niet alle streepjes.");
  licht(l, 10, 12);
  await l.zeg("Elk streepje is {2:wit} verder.");
  licht(l, 10, 12, 14);
  await l.zeg("{10:wit}, {12:wit}, {14:wit}.");
  vul(l, 16, "16");
  await l.zeg("Het vlaggetje staat bij {16:wit}.");
  await l.verder();
}

const rangschikken1: Lesdraaiboek = {
  id: "squla-getallenlijn-rangschikken-1",
  titel: "Getallen op hun plek",
  synthesis: "Squla groep 3 · Getallenlijn · Getallen rangschikken t/m 20 · level 1 (alleen leerdoel)",
  indeling: "synthesis",
  browserstem: true,
  nacht: true,
  voorwerpen: GETALLENLIJN_VOORWERPEN,
  async speel(l) {
    l.vlak<GetallenlijnProps>(SqulaGetallenlijn, { beeld: { soort: "rij", ding: "lampje", slinger: true, items: [3, 4, 5, 6, 7].map((n) => ({ t: String(n) })) } });
    speelLesgeluid("verschijn");
    zetSynthesisHulp(l);
    const voorbeeldAfgerond = await squlaBegin(l, {
      welkom: ["Een lichtslinger heeft lampjes met getallen.", "Welk getal hoort op de puntjes?"],
      voorbeeld: () => (RANGSCHIKKEN_1[0](l) as SqulaVraag<unknown>).toon?.(),
      voordoen: true,
      samen: () => squlaVraag(l, RANGSCHIKKEN_1[0](l) as SqulaVraag<unknown>),
      uitleg: () => uitlegRij(l),
    });
    const fouten = await speelOpgaven(l, RANGSCHIKKEN_1, voorbeeldAfgerond);
    await squlaEind(l, fouten, "Je weet welk getal waar hoort.");
  },
};

const rangschikken2: Lesdraaiboek = {
  id: "squla-getallenlijn-rangschikken-2",
  titel: "Getallen op hun plek (moeilijker)",
  synthesis: "Squla groep 3 · Getallenlijn · Getallen rangschikken t/m 20 · level 2 (alleen leerdoel)",
  indeling: "synthesis",
  browserstem: true,
  nacht: true,
  voorwerpen: GETALLENLIJN_VOORWERPEN,
  async speel(l) {
    l.vlak<GetallenlijnProps>(SqulaGetallenlijn, { beeld: { soort: "lijn", van: 0, tot: 20, labels: [0, 10, 20] } });
    speelLesgeluid("verschijn");
    zetSynthesisHulp(l);
    const voorbeeldAfgerond = await squlaBegin(l, {
      welkom: ["De diamanten hebben getallen eronder.", "Welk getal hoort op de puntjes?"],
      voorbeeld: () => (RANGSCHIKKEN_2[0](l) as SqulaVraag<unknown>).toon?.(),
      voordoen: true,
      samen: () => squlaVraag(l, RANGSCHIKKEN_2[0](l) as SqulaVraag<unknown>),
      uitleg: () => uitlegDiamant(l),
    });
    const fouten = await speelOpgaven(l, RANGSCHIKKEN_2, voorbeeldAfgerond);
    await squlaEind(l, fouten, "Je vindt getallen ook als er weinig staan.");
  },
};

const rangschikken3: Lesdraaiboek = {
  id: "squla-getallenlijn-rangschikken-3",
  titel: "Getallen op hun plek (nog moeilijker)",
  synthesis: "Squla groep 3 · Getallenlijn · Getallen rangschikken t/m 20 · level 3 (alleen leerdoel)",
  indeling: "synthesis",
  browserstem: true,
  nacht: true,
  voorwerpen: GETALLENLIJN_VOORWERPEN,
  async speel(l) {
    l.vlak<GetallenlijnProps>(SqulaGetallenlijn, { beeld: { soort: "lijn", van: 10, tot: 20, stap: 2, labels: [10, 20] } });
    speelLesgeluid("verschijn");
    zetSynthesisHulp(l);
    const voorbeeldAfgerond = await squlaBegin(l, {
      welkom: ["Op de getallenlijn staan niet alle getallen.", "Bij welk getal staat het vlaggetje?"],
      voorbeeld: () => (RANGSCHIKKEN_3[0](l) as SqulaVraag<unknown>).toon?.(),
      voordoen: true,
      samen: () => squlaVraag(l, RANGSCHIKKEN_3[0](l) as SqulaVraag<unknown>),
      uitleg: async () => {
        await uitlegLijn(l, [0, 10, 11, 12, 13, 14, 20], 18);
        await uitlegPerTwee(l);
      },
    });
    const fouten = await speelOpgaven(l, RANGSCHIKKEN_3, voorbeeldAfgerond);
    await squlaEind(l, fouten, "Je kent de getallenlijn tot {20:wit} goed.");
  },
};

/* ---- 16600 Getallenlijn met een figuur (bij ons: het raketje) ---- */

const KAT_1: Opgave[] = [
  /* lijn 0–10: bij welk getal staat het raketje? */
  (l) => raketjeBij(l, { van: 0, tot: 10, n: 6, opties: [7, 5, 6] }),
  (l) => raketjeBij(l, { van: 0, tot: 10, n: 2, opties: [2, 1, 4] }),
  (l) => raketjeBij(l, { van: 0, tot: 10, n: 9, opties: [8, 9, 10] }),
  /* na 10 */
  (l) => naTien(l, [11, 1, 12]),
  /* wat is meer (kies uit 2) */
  (l) => watIsMeer(l, ["Het raketje zoekt graag sterren.", "Gisteren vond het er {13:wit}.", "Vandaag vond het er {14:wit}."], 13, 14),
  /* op volgorde, het eerste getal staat er al */
  (l) => ordenVraag(l, { vakken: [5, null, null, null], kaarten: [7, 8, 6], handje: true }),
  (l) => ordenVraag(l, { vakken: [12, null, null, null], kaarten: [14, 13, 15] }),
  /* een lange getallenlijn */
  (l) => raketjeBij(l, { van: 9, tot: 20, n: 14, opties: [15, 4, 14], vraag: ["Dit is een lange getallenlijn.", "Bij welk getal staat het raketje nu?"] }),
  (l) => raketjeBij(l, { van: 9, tot: 20, n: 18, opties: [17, 18, 8] }),
  /* wie zit er bij …? */
  (l) => wieZitEr(l, { labels: [10, 15, 20], n: 17, wie: "raketje", raketje: 17, anderen: [{ soort: "ufo", n: 12 }, { soort: "satelliet", n: 19 }] }),
  (l) => wieZitEr(l, { labels: [10, 15, 20], n: 14, wie: "ufo", raketje: 11, anderen: [{ soort: "ufo", n: 14 }, { soort: "satelliet", n: 18 }] }),
  /* welk getal ligt het dichtst bij …? */
  (l) => dichtstBij(l, 20, [18, 8, 14], ["ufo", "satelliet", "raketje"]),
  (l) => dichtstBij(l, 10, [17, 4, 11], ["satelliet", "raketje", "ufo"]),
  /* schatten: weinig streepjes */
  (l) =>
    ongeveer(l, {
      van: 10,
      tot: 20,
      streepjes: [10, 15, 20],
      labels: [10, 15, 20],
      plek: 11,
      goed: 11,
      opties: [11, 16, 19],
      hulp: { licht: [10], zinnen: ["Kijk, hier staat {10:wit}.", "Het raketje staat vlak na de {10:wit}."] },
      tip: ["Zoek het getal dat vlak na {10:wit} komt."],
    }),
  (l) =>
    ongeveer(l, {
      van: 10,
      tot: 20,
      streepjes: [10, 15, 20],
      labels: [10, 15, 20],
      plek: 19,
      goed: 19,
      opties: [13, 19, 16],
      hulp: { licht: [20], zinnen: ["Kijk, hier staat {20:wit}.", "Het raketje staat vlak voor de {20:wit}."] },
      tip: ["Zoek het getal dat vlak voor {20:wit} komt."],
    }),
];

const KAT_2: Opgave[] = [
  /* welk getal komt voor …? */
  (l) => komtVoor(l, 15, [16, 14, 13], "Het raketje landt op een planeet met {15:wit}."),
  /* een pijl wijst een streepje aan */
  (l) => pijlWijst(l, 13, [13, 12, 3]),
  (l) => pijlWijst(l, 17, [16, 17, 7]),
  /* bij welk getal staat de ufo of de satelliet? */
  (l) => wezenGetal(l, { wie: "ufo", n: 12, raketje: 17, ander: { soort: "satelliet", n: 19 }, opties: [12, 13, 18] }),
  (l) => wezenGetal(l, { wie: "satelliet", n: 18, raketje: 11, ander: { soort: "ufo", n: 13 }, opties: [18, 17, 13] }),
  /* op volgorde, het eerste getal staat er al */
  (l) => ordenVraag(l, { vakken: [11, null, null, null], kaarten: [13, 12, 14], handje: true }),
  (l) => komtVoor(l, 19, [18, 20, 17], "Het raketje vliegt naar een planeet met {19:wit}."),
  (l) => ordenVraag(l, { vakken: [15, null, null, null], kaarten: [17, 18, 16] }),
  (l) => komtVoor(l, 11, [12, 10, 9], "Nu staat het raketje op een planeet met {11:wit}."),
  /* welk getal ligt het dichtst bij …? */
  (l) => dichtstBij(l, 16, [17, 10, 6], ["ufo", "raketje", "satelliet"]),
  (l) => dichtstBij(l, 7, [2, 8, 12], ["raketje", "satelliet", "ufo"]),
  /* schatten */
  (l) =>
    ongeveer(l, {
      van: 10,
      tot: 20,
      streepjes: [10, 15, 20],
      labels: [10, 15, 20],
      plek: 17,
      goed: 17,
      opties: [17, 12, 20],
      hulp: { licht: [15, 20], zinnen: ["Het raketje staat tussen {15:wit} en {20:wit}.", "Het staat dichter bij de {15:wit}."] },
      tip: ["Tel vanaf de {15:wit} een klein stukje verder."],
    }),
  (l) =>
    ongeveer(l, {
      van: 0,
      tot: 20,
      streepjes: [0, 5, 10, 15, 20],
      labels: [0, 20],
      plek: 11,
      goed: 11,
      opties: [11, 6, 16],
      hulp: { licht: [10], zinnen: ["Precies in het midden is {10:wit}.", "Het raketje staat daar net na."] },
      tip: ["Zoek het getal dat net na {10:wit} komt."],
    }),
  (l) =>
    ongeveer(l, {
      van: 0,
      tot: 20,
      streepjes: [0, 5, 10, 15, 20],
      labels: [0, 20],
      plek: 4,
      goed: 4,
      opties: [4, 9, 14],
      hulp: { licht: [5], zinnen: ["Dit streepje is {5:wit}.", "Het zit precies tussen {0:wit} en {10:wit}.", "Het raketje staat net voor de {5:wit}."] },
      tip: ["Zoek het getal dat net voor {5:wit} komt."],
    }),
  /* helemaal aan het eind */
  (l) => aanHetEind(l, [10, 20, 19]),
];

async function uitlegRaketje(l: Lesgids) {
  toon(l, { soort: "lijn", van: 0, tot: 10, labels: Array.from({ length: 11 }, (_, i) => i), raketje: { n: 3 } });
  await l.zeg("Het raketje staat op de getallenlijn.", "Het staat bij een getal.", "Ik tel mee tot het raketje.");
  for (const k of [0, 1, 2]) {
    licht(l, k);
    await l.zeg(`${w(k)}.`);
  }
  vul(l, 3, "3");
  await l.zeg("Na {2:wit} komt {3:wit}.", "Het raketje staat bij {3:wit}.");
  await l.verder();
}

const kat1: Lesdraaiboek = {
  id: "squla-getallenlijn-kat-1",
  titel: "Het raketje op de getallenlijn",
  synthesis: "Squla groep 3 · Getallenlijn · Getallenlijn met een figuur · level 1 (alleen leerdoel)",
  indeling: "synthesis",
  browserstem: true,
  nacht: true,
  voorwerpen: GETALLENLIJN_VOORWERPEN,
  async speel(l) {
    l.vlak<GetallenlijnProps>(SqulaGetallenlijn, { beeld: { soort: "planeet" } });
    speelLesgeluid("verschijn");
    zetSynthesisHulp(l);
    const voorbeeldAfgerond = await squlaBegin(l, {
      welkom: ["Het raketje vliegt over de getallenlijn.", "Bij welk getal staat het raketje?"],
      voorbeeld: () => (KAT_1[0](l) as SqulaVraag<unknown>).toon?.(),
      voordoen: true,
      samen: () => squlaVraag(l, KAT_1[0](l) as SqulaVraag<unknown>),
      uitleg: () => uitlegRaketje(l),
    });
    const fouten = await speelOpgaven(l, KAT_1, voorbeeldAfgerond);
    await squlaEind(l, fouten, "Je weet waar het raketje staat op de getallenlijn.");
  },
};

const kat2: Lesdraaiboek = {
  id: "squla-getallenlijn-kat-2",
  titel: "Het raketje op de getallenlijn (moeilijker)",
  synthesis: "Squla groep 3 · Getallenlijn · Getallenlijn met een figuur · level 2 (alleen leerdoel)",
  indeling: "synthesis",
  browserstem: true,
  nacht: true,
  voorwerpen: GETALLENLIJN_VOORWERPEN,
  async speel(l) {
    l.vlak<GetallenlijnProps>(SqulaGetallenlijn, { beeld: { soort: "planeet" } });
    speelLesgeluid("verschijn");
    zetSynthesisHulp(l);
    const voorbeeldAfgerond = await squlaBegin(l, {
      welkom: [`Het raketje landt op een planeet met ${w(15)}.`, `Welk getal komt voor ${w(15)}?`],
      voorbeeld: () => (KAT_2[0](l) as SqulaVraag<unknown>).toon?.(),
      voordoen: true,
      samen: () => squlaVraag(l, KAT_2[0](l) as SqulaVraag<unknown>),
      uitleg: () => uitlegVoor(l),
    });
    const fouten = await speelOpgaven(l, KAT_2, voorbeeldAfgerond);
    await squlaEind(l, fouten, "Je vindt het raketje op elke getallenlijn.");
  },
};

/* ---- 15757 Getallenlijn met dieren ---- */

const DIEREN_1: Opgave[] = [
  (l) => dingOpGetal(l, [12, "bal", 14], [13, 15]),
  (l) => dingOpGetal(l, [15, "pakje", 17], [15, 16]),
  (l) => dingOpGetal(l, [17, 18, "speelblok"], [16, 19]),
  (l) => dingOpGetal(l, [10, "speelgoedauto", 12], [11, 9]),
  (l) => dingOpGetal(l, [3, "ster", 5], [2, 4]),
  (l) => dingOpGetal(l, [14, "bal", 16], [15, 13]),
  (l) => dingOpGetal(l, [11, 12, "pakje"], [13, 10]),
  (l) => dingOpGetal(l, [18, "ster", 20], [17, 19]),
  (l) => dingOpGetal(l, [13, "speelblok", 15], [14, 12]),
  (l) => dingOpGetal(l, [15, 16, "speelgoedauto"], [14, 17]),
  (l) => dingOpGetal(l, [9, "pakje", 11], [10, 8]),
  (l) => dingOpGetal(l, [16, "bal", 18], [19, 17]),
  (l) => dingOpGetal(l, [7, 8, "ster"], [9, 6]),
  (l) => dingOpGetal(l, [11, "speelblok", 13], [12, 10]),
  (l) => dingOpGetal(l, [18, 19, "speelgoedauto"], [17, 20]),
];

const DIEREN_2: Opgave[] = [
  (l) => ordenVraag(l, { vakken: [null, null, null], kaarten: [13, 14, 12], handje: true }),
  (l) => ordenVraag(l, { vakken: [null, null, null], kaarten: [10, 8, 9] }),
  (l) => ordenVraag(l, { vakken: [null, null, null], kaarten: [16, 18, 17] }),
  (l) => ordenVraag(l, { vakken: [null, null, null], kaarten: [11, 12, 13] }),
  (l) => ordenVraag(l, { vakken: [null, null, null], kaarten: [19, 18, 20] }),
  (l) => ordenVraag(l, { vakken: [null, null, null], kaarten: [15, 13, 14] }),
  (l) => ordenVraag(l, { vakken: [null, null, null], kaarten: [9, 11, 10] }),
  (l) => ordenVraag(l, { vakken: [null, null, null], kaarten: [17, 16, 15] }),
  (l) => ordenVraag(l, { vakken: [null, null, null], kaarten: [12, 10, 11] }),
  (l) => ordenVraag(l, { vakken: [null, null, null], kaarten: [18, 17, 16] }),
  (l) => ordenVraag(l, { vakken: [null, null, null], kaarten: [14, 15, 16] }),
  (l) => ordenVraag(l, { vakken: [null, null, null], kaarten: [8, 7, 9] }),
  (l) => ordenVraag(l, { vakken: [null, null, null], kaarten: [13, 11, 12] }),
  (l) => ordenVraag(l, { vakken: [null, null, null], kaarten: [20, 19, 18] }),
  (l) => ordenVraag(l, { vakken: [null, null, null], kaarten: [16, 14, 15] }),
];

const DIEREN_3: Opgave[] = [
  (l) => dingOpGetal(l, [4, "bal", 6], [5, 7]),
  (l) => ordenVraag(l, { vakken: [null, null, null], kaarten: [16, 14, 15], hokjes: true, handje: true }),
  (l) => dingOpGetal(l, [11, "pakje", 13], [12, 14]),
  (l) => ordenVraag(l, { vakken: [null, null, null], kaarten: [10, 12, 11], hokjes: true }),
  (l) => lang(l, 14, true),
  (l) => dingOpGetal(l, [17, "speelgoedauto", 19], [18, 16]),
  (l) => ordenVraag(l, { vakken: [null, null, null], kaarten: [9, 11, 10], hokjes: true }),
  (l) => dingOpGetal(l, [13, "ster", 15], [12, 14]),
  (l) => ordenVraag(l, { vakken: [null, null, null], kaarten: [19, 17, 18], hokjes: true }),
  (l) => lang(l, 6, false),
  (l) => dingOpGetal(l, [15, "speelblok", 17], [16, 18]),
  (l) => ordenVraag(l, { vakken: [null, null, null], kaarten: [13, 12, 14], hokjes: true }),
  (l) => dingOpGetal(l, [8, "bal", 10], [7, 9]),
  (l) => ordenVraag(l, { vakken: [null, null, null], kaarten: [17, 15, 16], hokjes: true }),
  (l) => lang(l, 17, false),
];

async function uitlegDier(l: Lesgids) {
  toon(l, { soort: "rij", ding: "tegel", items: [{ t: "5" }, { voorwerp: "bal" }, { t: "7" }] });
  await l.zeg("Kijk, de bal ligt op een getal.", "Ik tel de getallen tot de bal.");
  licht(l, 0);
  await l.zeg("{5:wit}.");
  licht(l, 1);
  await l.zeg("Na {5:wit} komt {6:wit}.");
  vul(l, 1, "6");
  await l.zeg("Onder de bal ligt {6:wit}.");
  await l.verder();
}

async function uitlegOrden(l: Lesgids) {
  toon(l, { soort: "orden", vakken: [null, null, null], kaarten: [3, 1, 2] });
  await l.zeg("Kijk, 3 kaarten.", "We zetten ze op volgorde, van klein naar groot.");
  licht(l, 1);
  await l.zeg("Het kleinste getal komt vooraan: {1:wit}.");
  licht(l, 2);
  await l.zeg("Dan {2:wit}.");
  licht(l, 3);
  await l.zeg("En dan {3:wit}.");
  licht(l);
  await l.verder();
}

const dieren1: Lesdraaiboek = {
  id: "squla-getallenlijn-dieren-1",
  titel: "Dingen op de getallen",
  synthesis: "Squla groep 3 · Getallenlijn · Getallenlijn met dieren · level 1 (alleen leerdoel)",
  indeling: "synthesis",
  browserstem: true,
  nacht: true,
  voorwerpen: GETALLENLIJN_VOORWERPEN,
  async speel(l) {
    l.vlak<GetallenlijnProps>(SqulaGetallenlijn, { beeld: { soort: "rij", ding: "tegel", items: [{ voorwerp: "bal" }, { voorwerp: "pakje" }, { voorwerp: "ster" }] } });
    speelLesgeluid("verschijn");
    zetSynthesisHulp(l);
    const voorbeeldAfgerond = await squlaBegin(l, {
      welkom: ["Een ding ligt tussen 2 getallen.", "Welk getal ligt onder de bal?"],
      voorbeeld: () => (DIEREN_1[0](l) as SqulaVraag<unknown>).toon?.(),
      voordoen: true,
      samen: () => squlaVraag(l, DIEREN_1[0](l) as SqulaVraag<unknown>),
      uitleg: () => uitlegDier(l),
    });
    const fouten = await speelOpgaven(l, DIEREN_1, voorbeeldAfgerond);
    await squlaEind(l, fouten, "Je weet welk getal onder elk ding ligt.");
  },
};

const dieren2: Lesdraaiboek = {
  id: "squla-getallenlijn-dieren-2",
  titel: "Dingen op de getallen (moeilijker)",
  synthesis: "Squla groep 3 · Getallenlijn · Getallenlijn met dieren · level 2 (alleen leerdoel)",
  indeling: "synthesis",
  browserstem: true,
  nacht: true,
  voorwerpen: GETALLENLIJN_VOORWERPEN,
  async speel(l) {
    l.vlak<GetallenlijnProps>(SqulaGetallenlijn, { beeld: { soort: "rij", ding: "tegel", items: [{ voorwerp: "speelblok" }, { voorwerp: "speelgoedauto" }, { voorwerp: "pakje" }] } });
    speelLesgeluid("verschijn");
    zetSynthesisHulp(l);
    const voorbeeldAfgerond = await squlaBegin(l, {
      welkom: ["Er liggen 3 kaarten met getallen.", "Zet de getallen op volgorde, van klein naar groot."],
      voorbeeld: () => (DIEREN_2[0](l) as SqulaVraag<unknown>).toon?.(),
      voordoen: true,
      samen: () => squlaVraag(l, DIEREN_2[0](l) as SqulaVraag<unknown>),
      uitleg: () => uitlegOrden(l),
    });
    const fouten = await speelOpgaven(l, DIEREN_2, voorbeeldAfgerond);
    await squlaEind(l, fouten, "Je zet getallen goed op volgorde.");
  },
};

const dieren3: Lesdraaiboek = {
  id: "squla-getallenlijn-dieren-3",
  titel: "Dingen op de getallen (nog moeilijker)",
  synthesis: "Squla groep 3 · Getallenlijn · Getallenlijn met dieren · level 3 (alleen leerdoel)",
  indeling: "synthesis",
  browserstem: true,
  nacht: true,
  voorwerpen: GETALLENLIJN_VOORWERPEN,
  async speel(l) {
    l.vlak<GetallenlijnProps>(SqulaGetallenlijn, { beeld: { soort: "rij", ding: "tegel", items: [{ t: "10" }, { voorwerp: "bus" }] } });
    speelLesgeluid("verschijn");
    zetSynthesisHulp(l);
    const voorbeeldAfgerond = await squlaBegin(l, {
      welkom: [`Nu ligt de bal tussen ${w(4)} en ${w(6)}.`, "Welk getal ligt onder de bal?"],
      voorbeeld: () => (DIEREN_3[0](l) as SqulaVraag<unknown>).toon?.(),
      voordoen: true,
      samen: () => squlaVraag(l, DIEREN_3[0](l) as SqulaVraag<unknown>),
      uitleg: () => uitlegDier(l),
    });
    const fouten = await speelOpgaven(l, DIEREN_3, voorbeeldAfgerond);
    await squlaEind(l, fouten, "Je kent de getallen tot {20:wit} heel goed.");
  },
};

/* ---- 10986 Getallenlijn: terugtellen ---- */

/**
 * Een rij van 7 aftellichtjes, van groot naar klein, met puntjes op één plek.
 * Keuzes zoals bij Squla: het goede getal, het getal vóór de rij (bij 20: een getal ver na de rij),
 * het getal na de rij, en een getal met hetzelfde eindcijfer. `plek` = waar
 * het goede getal tussen de 4 keuzes staat.
 */
function aftel(l: Lesgids, start: number, gat: number, plek: number, laatste = false): SqulaVraag<number> {
  const rij: Plek[] = Array.from({ length: 7 }, (_, i) => (i === gat ? "…" : start - i));
  const goed = start - gat;
  const eind = start - 6;
  const anders = [start + 1 <= 20 ? start + 1 : eind - 2, eind - 1, goed >= 10 ? goed - 10 : goed + 10];
  const opties = [...anders];
  opties.splice(plek % 4, 0, goed);
  const v = rijVraag(l, { ding: "aftel", rij, start, stap: -1, gat, opties, vraag: ["Welk getal hoort op de puntjes?"] });
  /* Herstel 7 november (naspelen): na een goed antwoord trilt de raket en komt er rook onder vandaan; na de laatste vraag stijgt hij op. */
  const doe = () => zet(l, { raketDoe: { soort: laatste ? "op" : "tril", keer: ++raketTel } });
  return {
    ...v,
    goed: async (x: number) => {
      doe();
      await v.goed(x);
      await l.wacht(laatste ? 1200 : 200);
    },
    toonAntwoord: async () => {
      await v.toonAntwoord?.();
      doe();
      await l.wacht(laatste ? 1500 : 500);
    },
  };
}
let raketTel = 0;

const TERUGTELLEN: Opgave[] = [
  (l) => aftel(l, 17, 5, 1),
  (l) => aftel(l, 20, 1, 3),
  (l) => aftel(l, 15, 6, 0),
  (l) => aftel(l, 18, 3, 2),
  (l) => aftel(l, 13, 3, 1),
  (l) => aftel(l, 19, 4, 3),
  (l) => aftel(l, 16, 1, 0),
  (l) => aftel(l, 20, 6, 2),
  (l) => aftel(l, 14, 2, 1),
  (l) => aftel(l, 17, 3, 0),
  (l) => aftel(l, 14, 4, 3),
  (l) => aftel(l, 19, 1, 2),
  (l) => aftel(l, 15, 4, 1),
  (l) => aftel(l, 18, 6, 3),
  (l) => aftel(l, 16, 3, 0, true),
];

const terugtellen1: Lesdraaiboek = {
  id: "squla-getallenlijn-terugtellen-1",
  titel: "Terugtellen tot de start",
  synthesis: "Squla groep 3 · Getallenlijn · Getallenlijn (terugtellen) · level 1 (alleen leerdoel)",
  indeling: "synthesis",
  browserstem: true,
  nacht: true,
  voorwerpen: GETALLENLIJN_VOORWERPEN,
  async speel(l) {
    l.vlak<GetallenlijnProps>(SqulaGetallenlijn, { beeld: { soort: "rij", ding: "aftel", items: [7, 6, 5, 4, 3, 2, 1].map((n) => ({ t: String(n) })) } });
    speelLesgeluid("verschijn");
    zetSynthesisHulp(l);
    const voorbeeldAfgerond = await squlaBegin(l, {
      welkom: ["De raket telt af, van groot naar klein.", "Welk getal hoort op de puntjes?"],
      voorbeeld: () => (TERUGTELLEN[0](l) as SqulaVraag<unknown>).toon?.(),
      voordoen: true,
      samen: () => squlaVraag(l, TERUGTELLEN[0](l) as SqulaVraag<unknown>),
      uitleg: async () => {
        toon(l, { soort: "rij", ding: "aftel", items: [7, 6, 5, "…", 3, 2, 1].map((n) => ({ t: String(n) })) });
        await l.zeg("Ik tel mee terug.");
        for (const i of [0, 1, 2]) {
          licht(l, i);
          await l.zeg(`${w(7 - i)}.`);
        }
        licht(l, 3);
        await l.zeg("Na {5:wit} komt {4:wit}.");
        vul(l, 3, "4");
        await l.zeg("Terug wordt het getal steeds 1 minder.");
        await l.verder();
      },
    });
    const fouten = await speelOpgaven(l, TERUGTELLEN, voorbeeldAfgerond);
    await squlaEind(l, fouten, "Je kunt terugtellen vanaf {20:wit}.");
  },
};

export const LESSEN_SQULA_GETALLENLIJN: Lesdraaiboek[] = [rangschikken1, rangschikken2, rangschikken3, kat1, kat2, dieren1, dieren2, dieren3, terugtellen1];
