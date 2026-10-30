/**
 * Lessen "Getallenlijn" (groep 3, 30 oktober 2026, opdracht eigenaar), naar
 * vier oefeningen van Squla Rekenen groep 3 · Getallenlijn. Per Squla-level
 * één les, met dezelfde soorten vragen in dezelfde volgorde en dezelfde
 * getallenreeks (tot en met 20), maar met eigen woorden, eigen getallen en
 * eigen tekeningen (zie SQULA-ANALYSE/getallenlijn-*-volledig.md):
 *
 *   16056 Getallen rangschikken t/m 20  → squla-getallenlijn-rangschikken-1/2/3
 *   16600 Getallenlijn (met een kat)     → squla-getallenlijn-kat-1/2
 *         (hier met Floep, een eigen kikker; geen figuren van Squla)
 *   15757 Getallenlijn met dieren        → squla-getallenlijn-dieren-1/2/3
 *   10986 Getallenlijn (terugtellen)     → squla-getallenlijn-terugtellen-1
 *
 * Alles in Phaser, als hologram vóór de blauwe ruimte
 * (`../vlakken/squla-getallenlijn-vlak.tsx`). De hulp is de vaste hulp van
 * Bliepo (`squla-hulp.ts`): na één fout "Wil je hulp, of nog een keer
 * proberen?", dan samen uitzoeken (op basis van wat Squla bij een fout
 * uitlegt, in eigen woorden en in beeld), en na 2× fout even pauze. Geen
 * "Weet ik niet"-knop bij de keuzes.
 *
 * Getallen in de getallenlijn en op de dingen zijn wit: in de zinnen {n:wit}.
 */

import type { Lesdraaiboek, Lesgids } from "../soort";
import { squlaBegin, squlaEind, squlaVraag, type SqulaVraag } from "./squla-hulp";
import { SqulaGetallenlijn, type Beeld, type GetallenlijnProps, type RijItem, type Rijding, type Wezen } from "../vlakken/squla-getallenlijn-vlak";
import { DIERNAAM, type Dier } from "../vlakken/squla-getallenlijn-teken";
import { speelLesgeluid } from "@/lib/lesgeluiden";

/* ---------- het vlak ---------- */

const w = (n: number) => `{${n}:wit}`;
const rijtje = (ns: number[]) => ns.map(w).join(", ");
const TELWOORD = ["nul", "één", "twee", "drie", "vier", "vijf", "zes", "zeven", "acht", "negen", "tien"];
const Telwoord = (n: number) => (n === 1 ? "Eén" : TELWOORD[n][0].toUpperCase() + TELWOORD[n].slice(1));
const RANG = ["eerste", "tweede", "derde", "vierde", "vijfde"];

let ronde = 0;
let golfTel = 0;

const zet = (l: Lesgids, p: Partial<GetallenlijnProps>) => l.pasVlakAan<GetallenlijnProps>(p);

/** Een nieuw beeld (alles opnieuw tevoorschijn getoverd). */
function toon(l: Lesgids, beeld: Beeld, extra: Partial<GetallenlijnProps> = {}) {
  zet(l, { beeld, ronde: ++ronde, licht: [], golf: null, invul: null, actief: false, handje: false, ...extra });
}
const licht = (l: Lesgids, ...ns: number[]) => zet(l, { licht: ns });
/** Het goede antwoord in beeld, met een lichtgolf. */
const vul = (l: Lesgids, op: number, t: string, golfOp = op) => zet(l, { invul: { op, t }, golf: { op: golfOp, keer: ++golfTel }, licht: [] });
const golf = (l: Lesgids, op: number) => zet(l, { golf: { op, keer: ++golfTel }, licht: [] });

async function kiesGetal(l: Lesgids, opties: number[]) {
  return Number(await l.kies(opties.map(String), { weetniet: false, direct: true }));
}

/** Een getal typen. "Weet ik niet" (het vraagteken bij het invulvak) = een hint, en dan nog eens. */
async function typGetal(l: Lesgids, hint: string[]): Promise<number> {
  for (;;) {
    const x = await l.getal();
    if (x !== null) return x;
    await l.zeg("Geen probleem.", ...hint);
  }
}

/** Een vraag met de vaste hulp; `true` = meteen goed. */
const vraag = <T,>(l: Lesgids, v: SqulaVraag<T>) => squlaVraag(l, v);

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
  const tip = [terug ? `Tel terug vanaf ${w(voor)}.` : `Tel verder vanaf ${w(voor)}.`];
  return {
    toon: () => toon(l, rijBeeld(v)),
    vraag: v.opties ? v.vraag : [...v.vraag, "Typ het getal."],
    antwoord: () => (v.opties ? kiesGetal(l, v.opties) : typGetal(l, tip)),
    isGoed: (x) => x === goed,
    noem: (x) => w(x),
    goed: async () => {
      vul(l, v.gat, String(goed));
      const buren = [waarde(v.gat - 1), goed, ...(v.gat + 1 < v.rij.length ? [waarde(v.gat + 1)] : [])];
      await l.zeg("Goed zo.", `${rijtje(buren)}.`);
      await l.wacht(300);
    },
    samen: async () => {
      await l.zeg(terug ? "We tellen samen terug." : "We tellen samen.");
      for (let i = 0; i < v.gat; i++) {
        licht(l, i);
        await l.zeg(`${w(waarde(i))}.`);
      }
      licht(l, v.gat);
      await l.zeg(terug ? `Welk getal komt na ${w(voor)}, als je terugtelt?` : `Welk getal komt na ${w(voor)}?`);
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
      licht(l, ...tel);
      await l.zeg(`${w(k)}.`);
    }
    if (n % 2 !== 0) {
      licht(l, n - 1, n + 1);
      await l.zeg(`${wat} ${ww} tussen ${w(n - 1)} en ${w(n + 1)}.`, "Precies in het midden.");
    } else {
      licht(l, ...tel, n);
      await l.zeg(`Welk getal hoort bij het streepje van ${wat.toLowerCase()}?`);
    }
    licht(l);
    return;
  }
  const L = ijkpunt(labels, n);
  const d = n - L;
  licht(l, L);
  await l.zeg(`Kijk, hier staat ${w(L)}.`, d > 0 ? "We tellen de streepjes verder." : "We tellen de streepjes terug.");
  const tel: number[] = [L];
  for (let k = 1; k <= Math.abs(d); k++) {
    tel.push(L + Math.sign(d) * k);
    licht(l, ...tel);
    await l.zeg(`${Telwoord(k)}.`);
  }
  await l.zeg(`${wat} ${ww} ${TELWOORD[Math.abs(d)]} ${Math.abs(d) === 1 ? "streepje" : "streepjes"} ${d > 0 ? "na" : "voor"} de ${w(L)}.`);
  licht(l);
}

function tipStreepjes(labels: number[], n: number, stap = 1) {
  const L = ijkpunt(labels, n);
  return stap === 2 ? [`Tel in sprongen van ${w(2)} vanaf de ${w(L)}.`] : [n > L ? `Tel de streepjes verder vanaf de ${w(L)}.` : `Tel de streepjes terug vanaf de ${w(L)}.`];
}

function lijnVraag(l: Lesgids, v: LijnVraag): SqulaVraag<number> {
  const tip = tipStreepjes(v.labels, v.n, v.stap);
  return {
    toon: () => toon(l, { soort: "lijn", van: v.van, tot: v.tot, stap: v.stap, streepjes: v.streepjes, labels: v.labels, vlag: { n: v.n, t: "?" } }),
    vraag: v.opties ? v.vraag : [...v.vraag, "Typ het getal."],
    antwoord: () => (v.opties ? kiesGetal(l, v.opties) : typGetal(l, tip)),
    isGoed: (x) => x === v.n,
    noem: (x) => w(x),
    goed: async () => {
      vul(l, v.n, String(v.n));
      await l.zeg("Goed zo.", `Het vlaggetje staat bij ${w(v.n)}.`);
      await l.wacht(300);
    },
    samen: () => telStreepjes(l, v.labels, v.n, "Het vlaggetje", v.stap),
    tip,
    testAntwoord: v.n,
  };
}

/* ---------- 3. op volgorde zetten ---------- */

type OrdenVraag = { vakken: (number | null)[]; kaarten: number[]; handje?: boolean; hokjes?: boolean; vraag?: string[] };

function ordenVraag(l: Lesgids, v: OrdenVraag): SqulaVraag<number[]> {
  const alles = [...v.vakken.filter((n): n is number => n !== null), ...v.kaarten].sort((a, b) => a - b);
  const vast = v.vakken.findIndex((n) => n !== null);
  const stap = alles[1] - alles[0];
  const kleinste = Math.min(...v.kaarten);
  const tip = vast === 0 ? [`Welk getal komt na ${w(v.vakken[0]!)}?`] : ["Begin met het kleinste getal."];
  let eerste = true;
  /* Liggen de kaarten nog van de vorige poging in de vakken, dan eerst terug (nieuwe ronde). */
  let vers = false;
  const leg = () => {
    toon(l, { soort: "orden", vakken: v.vakken, kaarten: v.kaarten, hokjes: v.hokjes });
    vers = true;
  };
  return {
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
      await l.zeg("Goed zo.", `${rijtje(alles)}.`);
      await l.wacht(300);
    },
    samen: async () => {
      leg();
      licht(l, ...alles);
      await l.zeg("Kijk naar alle getallen.");
      if (stap === 1) await l.zeg("Ze komen in de telrij na elkaar.");
      else await l.zeg(`Elk getal is ${w(stap)} meer dan het getal ervoor.`);
      if (vast === 0) {
        licht(l, v.vakken[0]!);
        await l.zeg(`Vooraan staat al ${w(v.vakken[0]!)}.`, "Welk getal komt daarna?");
      } else {
        if (vast > 0) {
          licht(l, v.vakken[vast]!);
          await l.zeg(`In het ${RANG[vast]} vak staat al ${w(v.vakken[vast]!)}.`);
        }
        licht(l, kleinste);
        await l.zeg("Dit is het kleinste getal.", "Dat komt helemaal vooraan.");
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
    toon: () => toon(l, { soort: "leeg" }),
    vraag: [zin],
    antwoord: () => kiesGetal(l, opties),
    isGoed: (x) => x === goed,
    noem: (x) => w(x),
    goed: async () => {
      await l.zeg("Goed zo.", `${w(goed)} is groter dan ${w(a)} en kleiner dan ${w(b)}.`);
      await l.wacht(300);
    },
    samen: async () => {
      toon(l, { soort: "lijn", van: 0, tot: 20, labels: Array.from({ length: 21 }, (_, i) => i) });
      licht(l, a, b);
      await l.zeg("Kijk op de getallenlijn.", `Het getal ligt tussen ${w(a)} en ${w(b)}.`);
      for (const o of opties) {
        if (o === goed) continue;
        licht(l, a, b, o);
        await l.zeg(o < a ? `${w(o)} is kleiner dan ${w(a)}.` : `${w(o)} is groter dan ${w(b)}.`);
      }
      licht(l, a, b);
      await l.zeg("Welk getal ligt ertussen?");
    },
    tip: [`Zoek het getal tussen ${w(a)} en ${w(b)}.`],
    testAntwoord: goed,
  };
}

/* ---------- 5. Floep de kikker op de getallenlijn ---------- */

const FLOEP = "Floep";
const naamVan = (z: Wezen) => (z === "kikker" ? FLOEP : z === "vlinder" ? "de vlinder" : "de slak");
const Naam = (z: Wezen) => {
  const n = naamVan(z);
  return n[0].toUpperCase() + n.slice(1);
};

/** Bij welk getal zit Floep? (Floep zit op het getal.) */
function floepBij(l: Lesgids, o: { van: number; tot: number; n: number; opties: number[]; vraag?: string[] }): SqulaVraag<number> {
  const labels = Array.from({ length: o.tot - o.van + 1 }, (_, i) => o.van + i);
  return {
    toon: () => toon(l, { soort: "lijn", van: o.van, tot: o.tot, labels, kikker: { n: o.n } }),
    vraag: o.vraag ?? ["Bij welk getal zit Floep?"],
    antwoord: () => kiesGetal(l, o.opties),
    isGoed: (x) => x === o.n,
    noem: (x) => w(x),
    goed: async () => {
      vul(l, o.n, String(o.n));
      await l.zeg("Goed zo.", `Floep zit bij ${w(o.n)}.`);
      await l.wacht(300);
    },
    samen: async () => {
      await l.zeg("We tellen samen langs de lijn.");
      const tel: number[] = [];
      for (let k = Math.max(o.van, o.n - 4); k < o.n; k++) {
        tel.push(k);
        licht(l, ...tel);
        await l.zeg(`${w(k)}.`);
      }
      licht(l, o.n - 1, o.n);
      await l.zeg(`En na ${w(o.n - 1)} zit Floep.`);
      licht(l);
    },
    tip: [`Welk getal komt na ${w(o.n - 1)}?`],
    testAntwoord: o.n,
  };
}

/** Welk getal komt na 10? (De lijn loopt door na 10, zonder getallen.) */
function naTien(l: Lesgids, opties: number[]): SqulaVraag<number> {
  const labels = Array.from({ length: 11 }, (_, i) => i);
  return {
    toon: () => toon(l, { soort: "lijn", van: 0, tot: 10, labels, door: true, kikker: { n: 11 } }),
    vraag: ["Floep springt verder dan de {10:wit}.", "Welk getal komt na {10:wit}?"],
    antwoord: () => kiesGetal(l, opties),
    isGoed: (x) => x === 11,
    noem: (x) => w(x),
    goed: async () => {
      vul(l, 11, "11");
      await l.zeg("Goed zo.", "Na {10:wit} komt {11:wit}.");
      await l.wacht(300);
    },
    samen: async () => {
      await l.zeg("We tellen samen.");
      for (const k of [8, 9, 10]) {
        licht(l, k);
        await l.zeg(`${w(k)}.`);
      }
      licht(l, 10, 11);
      await l.zeg("Floep zit één streepje verder.", "Welk getal komt na {10:wit}?");
      licht(l);
    },
    tip: ["Tel één verder dan {10:wit}."],
    testAntwoord: 11,
  };
}

/** Wat is meer? (kies uit 2) */
function watIsMeer(l: Lesgids, verhaal: string[], a: number, b: number): SqulaVraag<number> {
  const groot = Math.max(a, b);
  const klein = Math.min(a, b);
  return {
    toon: () => toon(l, { soort: "floep" }),
    vraag: [...verhaal, `Wat is meer: ${w(a)} of ${w(b)}?`],
    antwoord: () => kiesGetal(l, [b, a]),
    isGoed: (x) => x === groot,
    noem: (x) => w(x),
    goed: async () => {
      golf(l, 0);
      await l.zeg("Goed zo.", `${w(groot)} is meer dan ${w(klein)}.`);
      await l.wacht(300);
    },
    samen: async () => {
      toon(l, { soort: "lijn", van: 10, tot: 20, labels: Array.from({ length: 11 }, (_, i) => 10 + i) });
      licht(l, klein, groot);
      await l.zeg("Kijk op de getallenlijn.", "Hoe verder je telt, hoe meer het is.");
      licht(l, klein);
      await l.zeg(`Hier staat ${w(klein)}.`);
      licht(l, groot);
      await l.zeg(`En hier staat ${w(groot)}.`, "Welk getal komt later?");
      licht(l);
    },
    tip: ["Welk getal komt later als je telt?"],
    testAntwoord: groot,
  };
}

/** Wie zit er bij …? (tik op het beestje) */
function wieZitEr(
  l: Lesgids,
  o: { labels: number[]; n: number; wie: Wezen; kikker: number; anderen: { soort: Exclude<Wezen, "kikker">; n: number }[] },
): SqulaVraag<string> {
  const beeld: Beeld = { soort: "lijn", van: 10, tot: 20, labels: o.labels, kikker: { n: o.kikker }, wezens: o.anderen };
  const tip = tipStreepjes(o.labels, o.n);
  return {
    toon: () => toon(l, beeld),
    vraag: [`Wie zit er bij ${w(o.n)}?`, "Tik erop."],
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
      await l.zeg("Goed zo.", `${Naam(o.wie)} zit bij ${w(o.n)}.`);
      await l.wacht(300);
    },
    samen: () => telStreepjes(l, o.labels, o.n, w(o.n), 1, "is"),
    tip: [...tip, `Wie zit er bij ${w(o.n)}?`],
    testAntwoord: o.wie,
  };
}

/** Welk getal ligt het dichtst bij …? (drie bordjes) */
function dichtstBij(l: Lesgids, doel: number, getallen: number[], wezens: Wezen[]): SqulaVraag<number> {
  const goed = [...getallen].sort((a, b) => Math.abs(a - doel) - Math.abs(b - doel))[0];
  const verder = getallen.filter((g) => g !== goed).sort((a, b) => Math.abs(b - doel) - Math.abs(a - doel));
  return {
    toon: () => toon(l, { soort: "bordjes", getallen, wezens }),
    vraag: [`Welk getal ligt het dichtst bij ${w(doel)}?`],
    antwoord: () => kiesGetal(l, getallen),
    isGoed: (x) => x === goed,
    noem: (x) => w(x),
    goed: async () => {
      golf(l, getallen.indexOf(goed));
      await l.zeg("Goed zo.", `${w(goed)} ligt vlak bij ${w(doel)}.`);
      await l.wacht(300);
    },
    samen: async () => {
      const labels = [...new Set([0, 20, doel, ...getallen])].sort((a, b) => a - b);
      toon(l, { soort: "lijn", van: 0, tot: 20, labels });
      licht(l, doel);
      await l.zeg("Kijk op de getallenlijn.", `Hier is ${w(doel)}.`);
      licht(l, doel, verder[0]);
      await l.zeg(`${w(verder[0])} ligt ver van de ${w(doel)}.`);
      licht(l, doel, verder[1]);
      const even = Math.abs(verder[1] - doel) === Math.abs(verder[0] - doel);
      await l.zeg(even ? `${w(verder[1])} ligt ook ver van de ${w(doel)}.` : `${w(verder[1])} ligt al dichterbij.`, "Welk getal ligt er nog dichterbij?");
      licht(l);
    },
    tip: [`Kijk hoe ver elk getal van de ${w(doel)} af ligt.`],
    testAntwoord: goed,
  };
}

/** Bij welk getal zit Floep ongeveer? (een lijn met bijna geen streepjes) */
function ongeveer(
  l: Lesgids,
  o: { van: number; tot: number; streepjes: number[]; labels: number[]; plek: number; goed: number; opties: number[]; hulp: { licht: number[]; zinnen: string[] }; tip: string[] },
): SqulaVraag<number> {
  return {
    toon: () => toon(l, { soort: "lijn", van: o.van, tot: o.tot, streepjes: o.streepjes, labels: o.labels, kikker: { n: o.plek } }),
    vraag: ["Bij welk getal zit Floep ongeveer?"],
    antwoord: () => kiesGetal(l, o.opties),
    isGoed: (x) => x === o.goed,
    noem: (x) => w(x),
    goed: async () => {
      golf(l, o.plek);
      await l.zeg("Goed zo.", `Floep zit ongeveer bij ${w(o.goed)}.`);
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

/** Welk getal komt voor …? (Floep op een blad met een getal) */
function komtVoor(l: Lesgids, n: number, opties: number[], aanloop: string): SqulaVraag<number> {
  return {
    toon: () => toon(l, { soort: "floep", blad: n }),
    vraag: [aanloop, `Welk getal komt voor ${w(n)}?`],
    antwoord: () => kiesGetal(l, opties),
    isGoed: (x) => x === n - 1,
    noem: (x) => w(x),
    goed: async () => {
      golf(l, 0);
      await l.zeg("Goed zo.", `Voor ${w(n)} komt ${w(n - 1)}.`);
      await l.wacht(300);
    },
    samen: async () => {
      toon(l, { soort: "lijn", van: 9, tot: 20, labels: Array.from({ length: 12 }, (_, i) => 9 + i).filter((k) => k !== n - 1) });
      licht(l, n);
      await l.zeg(`Hier is ${w(n)} op de getallenlijn.`, "Het getal ervoor staat er links naast.");
      licht(l, n - 1, n);
      await l.zeg("Dat is één terug.");
      licht(l);
    },
    tip: [`Tel één terug vanaf ${w(n)}.`],
    testAntwoord: n - 1,
  };
}

/** Floep wijst een streepje aan: welk getal is het? */
function floepWijst(l: Lesgids, n: number, opties: number[]): SqulaVraag<number> {
  const labels = [10, 15, 20];
  return {
    toon: () => toon(l, { soort: "lijn", van: 8, tot: 20, labels, kikker: { n, wijs: true } }),
    vraag: ["Floep wijst een streepje aan.", "Welk getal hoort daarbij?"],
    antwoord: () => kiesGetal(l, opties),
    isGoed: (x) => x === n,
    noem: (x) => w(x),
    goed: async () => {
      vul(l, n, String(n));
      await l.zeg("Goed zo.", `Floep wijst ${w(n)} aan.`);
      await l.wacht(300);
    },
    samen: () => telStreepjes(l, labels, n, "Het pijltje"),
    tip: tipStreepjes(labels, n),
    testAntwoord: n,
  };
}

/** Bij welk getal zit de vlinder of de slak? (lijn met alleen 15 en 20) */
function wezenGetal(l: Lesgids, o: { wie: Exclude<Wezen, "kikker">; n: number; kikker: number; ander: { soort: Exclude<Wezen, "kikker">; n: number }; opties: number[] }): SqulaVraag<number> {
  const labels = [15, 20];
  return {
    toon: () => toon(l, { soort: "lijn", van: 10, tot: 20, labels, kikker: { n: o.kikker }, wezens: [{ soort: o.wie, n: o.n }, o.ander] }),
    vraag: [`Bij welk getal zit ${naamVan(o.wie)}?`],
    antwoord: () => kiesGetal(l, o.opties),
    isGoed: (x) => x === o.n,
    noem: (x) => w(x),
    goed: async () => {
      vul(l, o.n, String(o.n));
      await l.zeg("Goed zo.", `${Naam(o.wie)} zit bij ${w(o.n)}.`);
      await l.wacht(300);
    },
    samen: () => telStreepjes(l, labels, o.n, Naam(o.wie), 1, "zit"),
    tip: tipStreepjes(labels, o.n),
    testAntwoord: o.n,
  };
}

/** Floep helemaal aan het eind van de lijn. */
function aanHetEind(l: Lesgids, opties: number[]): SqulaVraag<number> {
  return {
    toon: () => toon(l, { soort: "lijn", van: 0, tot: 20, streepjes: [0, 5, 10, 15, 20], labels: [0, 20], kikker: { n: 20 } }),
    vraag: ["Floep springt helemaal naar het eind.", "Bij welk getal zit Floep nu?"],
    antwoord: () => kiesGetal(l, opties),
    isGoed: (x) => x === 20,
    noem: (x) => w(x),
    goed: async () => {
      vul(l, 20, "20");
      await l.zeg("Goed zo.", "Deze getallenlijn eindigt bij {20:wit}.");
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
      await l.zeg("Floep zit op het laatste streepje.");
    },
    tip: ["Tel in sprongen van {5:wit} vanaf het midden: {10:wit}, {15:wit}…"],
    testAntwoord: 20,
  };
}

/* ---------- 6. dieren op de getallen ---------- */

/** Een dier zit op een getal: welk getal zit eronder? (kies uit 2) */
function dierOpGetal(l: Lesgids, rij: (number | Dier)[], opties: number[]): SqulaVraag<number> {
  const plek = rij.findIndex((p) => typeof p !== "number");
  const dier = rij[plek] as Dier;
  const eerste = rij.find((p): p is number => typeof p === "number")!;
  const start = plek === 0 ? eerste - 1 : (rij[0] as number);
  const goed = start + plek;
  const items: RijItem[] = rij.map((p) => (typeof p === "number" ? { t: String(p) } : { dier: p }));
  const tussen = plek < rij.length - 1;
  return {
    toon: () => toon(l, { soort: "rij", ding: "tegel", items }),
    vraag: [`Welk getal zit onder ${DIERNAAM[dier]}?`],
    antwoord: () => kiesGetal(l, opties),
    isGoed: (x) => x === goed,
    noem: (x) => w(x),
    goed: async () => {
      vul(l, plek, String(goed));
      await l.zeg("Goed zo.", tussen ? `${w(goed)} zit tussen ${w(goed - 1)} en ${w(goed + 1)}.` : `Na ${w(goed - 1)} komt ${w(goed)}.`);
      await l.wacht(300);
    },
    samen: async () => {
      await l.zeg("We tellen samen.");
      for (let i = 0; i < plek; i++) {
        licht(l, i);
        await l.zeg(`${w(start + i)}.`);
      }
      if (tussen) {
        licht(l, plek + 1);
        await l.zeg(`Na ${DIERNAAM[dier]} staat ${w(goed + 1)}.`);
      }
      licht(l, plek);
      await l.zeg(`Welk getal komt na ${w(goed - 1)}?`);
      licht(l);
    },
    tip: [`Tel één verder dan ${w(goed - 1)}.`],
    testAntwoord: goed,
  };
}

/** De olifant is zo groot dat hij op twee getallen zit. */
function olifant(l: Lesgids, a: number, goedEerst: boolean): SqulaVraag<string> {
  const goed = `${a + 1} en ${a + 2}`;
  const fout = `${a - 2} en ${a - 1}`;
  const items: RijItem[] = [{ t: String(a) }, { dier: "olifant" }];
  return {
    toon: () => toon(l, { soort: "rij", ding: "tegel", items }),
    vraag: ["De olifant is groot.", "Hij zit op twee getallen tegelijk.", "Welke getallen zitten onder de olifant?"],
    antwoord: async () => (await l.kies(goedEerst ? [goed, fout] : [fout, goed], { weetniet: false, direct: true })) ?? "",
    isGoed: (x) => x === goed,
    noem: (x) => x.replace(/(\d+)/g, "{$1:wit}"),
    goed: async () => {
      vul(l, 1, `${a + 1}   ${a + 2}`);
      await l.zeg("Goed zo.", `Na ${w(a)} komen ${w(a + 1)} en ${w(a + 2)}.`);
      await l.wacht(300);
    },
    samen: async () => {
      licht(l, 0);
      await l.zeg(`Hier staat ${w(a)}.`);
      licht(l, 1);
      await l.zeg("De olifant zit erna.", "Hij zit op twee plekken.", `Welke twee getallen komen na ${w(a)}?`);
      licht(l);
    },
    tip: [`Tel twee verder vanaf ${w(a)}.`],
    testAntwoord: goed,
  };
}

/* ---------- de lessen ---------- */

type Opgave = (l: Lesgids) => SqulaVraag<number> | SqulaVraag<number[]> | SqulaVraag<string>;

async function speelOpgaven(l: Lesgids, opgaven: Opgave[]) {
  let fouten = 0;
  for (const maak of opgaven) {
    const v = maak(l) as SqulaVraag<unknown>;
    speelLesgeluid("verschijn");
    if (!(await vraag(l, v))) fouten++;
  }
  return fouten;
}

/* ---- 16056 Getallen rangschikken t/m 20 ---- */

const RANGSCHIKKEN_1: Opgave[] = [
  /* een lichtslinger met één lege plek: kies uit 3 */
  (l) => rijVraag(l, { ding: "lampje", slinger: true, rij: [3, 4, 5, "…", 7], start: 3, gat: 3, opties: [8, 6, 2], vraag: ["Welk getal hoort op het lege lampje?"] }),
  (l) => rijVraag(l, { ding: "lampje", slinger: true, rij: [11, 12, "…", 14, 15], start: 11, gat: 2, opties: [13, 10, 3], vraag: ["Welk getal hoort op het lege lampje?"] }),
  (l) => rijVraag(l, { ding: "lampje", slinger: true, rij: [16, 17, 18, "…", 20], start: 16, gat: 3, opties: [15, 19, 9], vraag: ["Welk getal hoort op het lege lampje?"] }),
  /* planeetjes: één zonder getal, en een vraagteken */
  (l) => rijVraag(l, { ding: "planeet", rij: [4, 5, 6, "-", "?"], start: 4, gat: 4, opties: [7, 9, 8], vraag: ["Welk getal hoort bij het vraagteken?"] }),
  (l) => rijVraag(l, { ding: "planeet", rij: [12, 13, "-", "?", "-"], start: 12, gat: 3, opties: [15, 17, 11], vraag: ["Welk getal hoort bij het vraagteken?"] }),
  (l) => rijVraag(l, { ding: "planeet", rij: [7, 8, 9, "-", "?"], start: 7, gat: 4, opties: [10, 11, 12], vraag: ["Welk getal hoort bij het vraagteken?"] }),
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
  /* kristallen, getallen eronder, de puntjes in het midden */
  (l) => rijVraag(l, { ding: "kristal", onder: true, rij: [2, "-", "…", "-", 6], start: 2, gat: 2, opties: [3, 4, 5], vraag: ["Welk getal hoort op de puntjes?"] }),
  (l) => rijVraag(l, { ding: "kristal", onder: true, rij: [10, "-", "…", "-", 14], start: 10, gat: 2, opties: [12, 13, 11], vraag: ["Welk getal hoort op de puntjes?"] }),
  (l) => rijVraag(l, { ding: "kristal", onder: true, rij: [15, "-", "…", "-", 19], start: 15, gat: 2, opties: [16, 18, 17], vraag: ["Welk getal hoort op de puntjes?"] }),
  /* sterren, zelfde soort vraag */
  (l) => rijVraag(l, { ding: "ster", onder: true, rij: [6, "-", "…", "-", 10], start: 6, gat: 2, opties: [8, 7, 9], vraag: ["Welk getal hoort op de puntjes?"] }),
  (l) => rijVraag(l, { ding: "ster", onder: true, rij: [13, "-", "…", "-", 17], start: 13, gat: 2, opties: [14, 15, 16], vraag: ["Welk getal hoort op de puntjes?"] }),
  (l) => rijVraag(l, { ding: "ster", onder: true, rij: [16, "-", "…", "-", 20], start: 16, gat: 2, opties: [18, 19, 17], vraag: ["Welk getal hoort op de puntjes?"] }),
  /* een slinger van 7 lampjes, één is rood: kies uit 4 */
  (l) => rijVraag(l, { ding: "lampje", slinger: true, rij: [2, 3, "-", "-", "-", "-", "-"], start: 2, gat: 3, rood: true, opties: [4, 5, 6, 7], vraag: ["Welk getal hoort bij het rode lampje?"] }),
  (l) => rijVraag(l, { ding: "lampje", slinger: true, rij: [10, 11, "-", "-", "-", "-", "-"], start: 10, gat: 4, rood: true, opties: [12, 13, 14, 15], vraag: ["Welk getal hoort bij het rode lampje?"] }),
  (l) => rijVraag(l, { ding: "lampje", slinger: true, rij: [13, 14, "-", "-", "-", "-", "-"], start: 13, gat: 6, rood: true, opties: [17, 18, 19, 20], vraag: ["Welk getal hoort bij het rode lampje?"] }),
  /* getallenlijn met alleen 0, 10 en 20 */
  (l) => lijnVraag(l, { van: 0, tot: 20, labels: [0, 10, 20], n: 18, opties: [8, 18, 15], vraag: ["Welk getal hoort bij het vlaggetje?"] }),
  (l) => lijnVraag(l, { van: 0, tot: 20, labels: [0, 10, 20], n: 12, opties: [2, 12, 16], vraag: ["Welk getal hoort bij het vlaggetje?"] }),
  (l) => lijnVraag(l, { van: 0, tot: 20, labels: [0, 10, 20], n: 3, opties: [3, 13, 6], vraag: ["Welk getal hoort bij het vlaggetje?"] }),
  (l) => lijnVraag(l, { van: 0, tot: 20, labels: [0, 10, 20], n: 14, opties: [4, 14, 17], vraag: ["Welk getal hoort bij het vlaggetje?"] }),
  /* op volgorde in sprongen van 5; het vaste getal staat niet vooraan */
  (l) => ordenVraag(l, { vakken: [null, null, 10, null, null], kaarten: [20, 5, 15, 0], handje: true }),
  (l) => ordenVraag(l, { vakken: [null, null, null, 15, null], kaarten: [10, 0, 20, 5] }),
];

const RANGSCHIKKEN_3: Opgave[] = [
  /* getallenlijn 0–20 met een rijtje getallen erbij */
  (l) => lijnVraag(l, { van: 0, tot: 20, labels: [0, 10, 11, 12, 13, 14, 20], n: 15, opties: [15, 16, 5], vraag: ["Welk getal hoort bij het vlaggetje?"] }),
  (l) => lijnVraag(l, { van: 0, tot: 20, labels: [0, 15, 16, 17, 18, 19, 20], n: 14, opties: [14, 13, 4], vraag: ["Welk getal hoort bij het vlaggetje?"] }),
  /* getallenlijn 10–20 met streepjes per 2 */
  (l) => lijnVraag(l, { van: 10, tot: 20, stap: 2, labels: [10, 20], n: 14, opties: [4, 14, 15], vraag: ["Welk getal hoort bij het vlaggetje?"] }),
  /* op volgorde, zonder vast getal */
  (l) => ordenVraag(l, { vakken: [null, null, null, null], kaarten: [7, 5, 6, 4], handje: true }),
  (l) => ordenVraag(l, { vakken: [null, null, null, null], kaarten: [16, 18, 17, 19] }),
  (l) => ordenVraag(l, { vakken: [null, null, null, null], kaarten: [13, 11, 10, 12] }),
  /* streepjes per 2: het vlaggetje staat ertussen, of op een streepje */
  (l) => lijnVraag(l, { van: 10, tot: 20, stap: 2, labels: [10, 20], n: 17, opties: [17, 7, 19], vraag: ["Welk getal hoort bij het vlaggetje?"] }),
  (l) => lijnVraag(l, { van: 10, tot: 20, stap: 2, labels: [10, 20], n: 12, opties: [12, 13, 2], vraag: ["Welk getal hoort bij het vlaggetje?"] }),
  /* getallenlijn met om en om een getal: typen */
  (l) => lijnVraag(l, { van: 0, tot: 20, labels: [0, 6, 8, 10, 12, 14, 20], n: 3, vraag: ["Welk getal hoort bij het vlaggetje?"] }),
  (l) => lijnVraag(l, { van: 0, tot: 20, labels: [0, 5, 7, 9, 11, 13, 20], n: 16, vraag: ["Welk getal hoort bij het vlaggetje?"] }),
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
  await l.zeg("Kijk, een lichtslinger met getallen.", "Op één lampje staan puntjes.");
  for (const i of [0, 1, 2]) {
    licht(l, i);
    await l.zeg(`${w(i + 1)}.`);
  }
  licht(l, 3);
  await l.zeg("Na {3:wit} komt {4:wit}.");
  vul(l, 3, "4");
  await l.zeg("Elk lampje is één verder.");
  await l.verder();
}

async function uitlegLijn(l: Lesgids, labels: number[], n: number) {
  toon(l, { soort: "lijn", van: 0, tot: 20, labels, vlag: { n, t: "?" } });
  await l.zeg("Dit is een getallenlijn.", "Elk streepje is één verder.");
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
  async speel(l) {
    l.vlak<GetallenlijnProps>(SqulaGetallenlijn, { beeld: { soort: "rij", ding: "lampje", slinger: true, items: [3, 4, 5, 6, 7].map((n) => ({ t: String(n) })) } });
    speelLesgeluid("verschijn");
    await squlaBegin(l, {
      welkom: ["Hoi!", "Vandaag zetten we getallen op de goede plek.", "Alle getallen tot en met {20:wit}."],
      uitleg: () => uitlegRij(l),
    });
    const fouten = await speelOpgaven(l, RANGSCHIKKEN_1);
    await squlaEind(l, fouten, "Je weet welk getal waar hoort.");
  },
};

const rangschikken2: Lesdraaiboek = {
  id: "squla-getallenlijn-rangschikken-2",
  titel: "Getallen op hun plek (moeilijker)",
  synthesis: "Squla groep 3 · Getallenlijn · Getallen rangschikken t/m 20 · level 2 (alleen leerdoel)",
  indeling: "synthesis",
  browserstem: true,
  async speel(l) {
    l.vlak<GetallenlijnProps>(SqulaGetallenlijn, { beeld: { soort: "lijn", van: 0, tot: 20, labels: [0, 10, 20] } });
    speelLesgeluid("verschijn");
    await squlaBegin(l, {
      welkom: ["Hoi!", "We zetten weer getallen op de goede plek.", "Nu staan er minder getallen bij."],
      uitleg: () => uitlegLijn(l, [0, 10, 20], 12),
    });
    const fouten = await speelOpgaven(l, RANGSCHIKKEN_2);
    await squlaEind(l, fouten, "Je vindt getallen ook als er weinig staan.");
  },
};

const rangschikken3: Lesdraaiboek = {
  id: "squla-getallenlijn-rangschikken-3",
  titel: "Getallen op hun plek (nog moeilijker)",
  synthesis: "Squla groep 3 · Getallenlijn · Getallen rangschikken t/m 20 · level 3 (alleen leerdoel)",
  indeling: "synthesis",
  browserstem: true,
  async speel(l) {
    l.vlak<GetallenlijnProps>(SqulaGetallenlijn, { beeld: { soort: "lijn", van: 10, tot: 20, stap: 2, labels: [10, 20] } });
    speelLesgeluid("verschijn");
    await squlaBegin(l, {
      welkom: ["Hoi!", "Nu wordt het nog moeilijker.", "Soms staan de streepjes verder uit elkaar."],
      uitleg: () => uitlegPerTwee(l),
    });
    const fouten = await speelOpgaven(l, RANGSCHIKKEN_3);
    await squlaEind(l, fouten, "Je kent de getallenlijn tot {20:wit} goed.");
  },
};

/* ---- 16600 Getallenlijn met een figuur (bij ons: Floep de kikker) ---- */

const KAT_1: Opgave[] = [
  /* lijn 0–10: bij welk getal zit Floep? */
  (l) => floepBij(l, { van: 0, tot: 10, n: 6, opties: [7, 5, 6] }),
  (l) => floepBij(l, { van: 0, tot: 10, n: 2, opties: [2, 1, 4] }),
  (l) => floepBij(l, { van: 0, tot: 10, n: 9, opties: [8, 9, 10] }),
  /* na 10 */
  (l) => naTien(l, [11, 1, 12]),
  /* wat is meer (kies uit 2) */
  (l) => watIsMeer(l, ["Floep vangt graag vliegjes.", "Gisteren ving hij er {13:wit}.", "Vandaag ving hij er {14:wit}."], 13, 14),
  /* op volgorde, het eerste getal staat er al */
  (l) => ordenVraag(l, { vakken: [5, null, null, null], kaarten: [7, 8, 6], handje: true }),
  (l) => ordenVraag(l, { vakken: [12, null, null, null], kaarten: [14, 13, 15] }),
  /* een lange getallenlijn */
  (l) => floepBij(l, { van: 9, tot: 20, n: 14, opties: [15, 4, 14], vraag: ["Dit is een lange getallenlijn.", "Bij welk getal zit Floep nu?"] }),
  (l) => floepBij(l, { van: 9, tot: 20, n: 18, opties: [17, 18, 8] }),
  /* wie zit er bij …? */
  (l) => wieZitEr(l, { labels: [10, 15, 20], n: 17, wie: "kikker", kikker: 17, anderen: [{ soort: "vlinder", n: 12 }, { soort: "slak", n: 19 }] }),
  (l) => wieZitEr(l, { labels: [10, 15, 20], n: 14, wie: "vlinder", kikker: 11, anderen: [{ soort: "vlinder", n: 14 }, { soort: "slak", n: 18 }] }),
  /* welk getal ligt het dichtst bij …? */
  (l) => dichtstBij(l, 20, [18, 8, 14], ["vlinder", "slak", "kikker"]),
  (l) => dichtstBij(l, 10, [17, 4, 11], ["slak", "kikker", "vlinder"]),
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
      hulp: { licht: [10], zinnen: ["Kijk, hier staat {10:wit}.", "Floep zit vlak na de {10:wit}."] },
      tip: ["Welk getal komt vlak na {10:wit}?"],
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
      hulp: { licht: [20], zinnen: ["Kijk, hier staat {20:wit}.", "Floep zit vlak voor de {20:wit}."] },
      tip: ["Welk getal komt vlak voor {20:wit}?"],
    }),
];

const KAT_2: Opgave[] = [
  /* welk getal komt voor …? */
  (l) => komtVoor(l, 15, [16, 14, 13], "Floep zit op een blad met {15:wit}."),
  /* Floep wijst een streepje aan */
  (l) => floepWijst(l, 13, [13, 12, 3]),
  (l) => floepWijst(l, 17, [16, 17, 7]),
  /* bij welk getal zit de vlinder of de slak? */
  (l) => wezenGetal(l, { wie: "vlinder", n: 12, kikker: 17, ander: { soort: "slak", n: 19 }, opties: [12, 13, 18] }),
  (l) => wezenGetal(l, { wie: "slak", n: 18, kikker: 11, ander: { soort: "vlinder", n: 13 }, opties: [18, 17, 13] }),
  /* op volgorde, het eerste getal staat er al */
  (l) => ordenVraag(l, { vakken: [11, null, null, null], kaarten: [13, 12, 14], handje: true }),
  (l) => komtVoor(l, 19, [18, 20, 17], "Floep springt naar een blad met {19:wit}."),
  (l) => ordenVraag(l, { vakken: [15, null, null, null], kaarten: [17, 18, 16] }),
  (l) => komtVoor(l, 11, [12, 10, 9], "Nu zit Floep op een blad met {11:wit}."),
  /* welk getal ligt het dichtst bij …? */
  (l) => dichtstBij(l, 16, [17, 10, 6], ["vlinder", "kikker", "slak"]),
  (l) => dichtstBij(l, 7, [2, 8, 12], ["kikker", "slak", "vlinder"]),
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
      hulp: { licht: [15, 20], zinnen: ["Floep zit tussen {15:wit} en {20:wit}.", "Hij zit dichter bij de {15:wit}."] },
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
      hulp: { licht: [10], zinnen: ["Precies in het midden is {10:wit}.", "Floep zit daar net na."] },
      tip: ["Welk getal komt net na {10:wit}?"],
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
      hulp: { licht: [5], zinnen: ["Dit streepje is {5:wit}.", "Het zit precies tussen {0:wit} en {10:wit}.", "Floep zit net voor de {5:wit}."] },
      tip: ["Welk getal komt net voor {5:wit}?"],
    }),
  /* helemaal aan het eind */
  (l) => aanHetEind(l, [10, 20, 19]),
];

async function uitlegFloep(l: Lesgids) {
  toon(l, { soort: "lijn", van: 0, tot: 10, labels: Array.from({ length: 11 }, (_, i) => i), kikker: { n: 3 } });
  await l.zeg("Floep zit op de getallenlijn.", "Hij zit op een getal.", "We tellen samen.");
  for (const k of [0, 1, 2]) {
    licht(l, k);
    await l.zeg(`${w(k)}.`);
  }
  vul(l, 3, "3");
  await l.zeg("Na {2:wit} komt {3:wit}.", "Floep zit bij {3:wit}.");
  await l.verder();
}

const kat1: Lesdraaiboek = {
  id: "squla-getallenlijn-kat-1",
  titel: "Floep op de getallenlijn",
  synthesis: "Squla groep 3 · Getallenlijn · Getallenlijn met een figuur · level 1 (alleen leerdoel)",
  indeling: "synthesis",
  browserstem: true,
  async speel(l) {
    l.vlak<GetallenlijnProps>(SqulaGetallenlijn, { beeld: { soort: "floep" } });
    speelLesgeluid("verschijn");
    await squlaBegin(l, {
      welkom: ["Hoi!", "Dit is Floep, de kikker.", "Floep springt graag over de getallenlijn.", "Help je mee?"],
      uitleg: () => uitlegFloep(l),
    });
    const fouten = await speelOpgaven(l, KAT_1);
    await squlaEind(l, fouten, "Je weet waar Floep zit op de getallenlijn.");
  },
};

const kat2: Lesdraaiboek = {
  id: "squla-getallenlijn-kat-2",
  titel: "Floep op de getallenlijn (moeilijker)",
  synthesis: "Squla groep 3 · Getallenlijn · Getallenlijn met een figuur · level 2 (alleen leerdoel)",
  indeling: "synthesis",
  browserstem: true,
  async speel(l) {
    l.vlak<GetallenlijnProps>(SqulaGetallenlijn, { beeld: { soort: "floep" } });
    speelLesgeluid("verschijn");
    await squlaBegin(l, {
      welkom: ["Hoi!", "Floep de kikker is er weer.", "Nu staan er minder getallen op de lijn."],
      uitleg: async () => {
        toon(l, { soort: "lijn", van: 8, tot: 20, labels: [10, 15, 20], kikker: { n: 13, wijs: true } });
        await l.zeg("Floep wijst een streepje aan.", "Niet bij elk streepje staat een getal.");
        await telStreepjes(l, [10, 15, 20], 13, "Het pijltje");
        vul(l, 13, "13");
        await l.zeg("Dus Floep wijst {13:wit} aan.");
        await l.verder();
      },
    });
    const fouten = await speelOpgaven(l, KAT_2);
    await squlaEind(l, fouten, "Je vindt Floep op elke getallenlijn.");
  },
};

/* ---- 15757 Getallenlijn met dieren ---- */

const DIEREN_1: Opgave[] = [
  (l) => dierOpGetal(l, [12, "uil", 14], [13, 15]),
  (l) => dierOpGetal(l, [15, "egel", 17], [15, 16]),
  (l) => dierOpGetal(l, [17, 18, "schildpad"], [16, 19]),
  (l) => dierOpGetal(l, [10, "pinguin", 12], [11, 9]),
  (l) => dierOpGetal(l, [3, "konijn", 5], [2, 4]),
  (l) => dierOpGetal(l, [14, "uil", 16], [15, 13]),
  (l) => dierOpGetal(l, [11, 12, "egel"], [13, 10]),
  (l) => dierOpGetal(l, [18, "konijn", 20], [17, 19]),
  (l) => dierOpGetal(l, [13, "schildpad", 15], [14, 12]),
  (l) => dierOpGetal(l, [15, 16, "pinguin"], [14, 17]),
  (l) => dierOpGetal(l, [9, "egel", 11], [10, 8]),
  (l) => dierOpGetal(l, [16, "uil", 18], [19, 17]),
  (l) => dierOpGetal(l, [7, 8, "konijn"], [9, 6]),
  (l) => dierOpGetal(l, [11, "schildpad", 13], [12, 10]),
  (l) => dierOpGetal(l, [18, 19, "pinguin"], [17, 20]),
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
  (l) => dierOpGetal(l, [4, "uil", 6], [5, 7]),
  (l) => ordenVraag(l, { vakken: [null, null, null], kaarten: [16, 14, 15], hokjes: true, handje: true }),
  (l) => dierOpGetal(l, [11, "egel", 13], [12, 14]),
  (l) => ordenVraag(l, { vakken: [null, null, null], kaarten: [10, 12, 11], hokjes: true }),
  (l) => olifant(l, 14, true),
  (l) => dierOpGetal(l, [17, "pinguin", 19], [18, 16]),
  (l) => ordenVraag(l, { vakken: [null, null, null], kaarten: [9, 11, 10], hokjes: true }),
  (l) => dierOpGetal(l, [13, "konijn", 15], [12, 14]),
  (l) => ordenVraag(l, { vakken: [null, null, null], kaarten: [19, 17, 18], hokjes: true }),
  (l) => olifant(l, 6, false),
  (l) => dierOpGetal(l, [15, "schildpad", 17], [16, 18]),
  (l) => ordenVraag(l, { vakken: [null, null, null], kaarten: [13, 12, 14], hokjes: true }),
  (l) => dierOpGetal(l, [8, "uil", 10], [7, 9]),
  (l) => ordenVraag(l, { vakken: [null, null, null], kaarten: [17, 15, 16], hokjes: true }),
  (l) => olifant(l, 17, false),
];

async function uitlegDier(l: Lesgids) {
  toon(l, { soort: "rij", ding: "tegel", items: [{ t: "5" }, { dier: "uil" }, { t: "7" }] });
  await l.zeg("Kijk, de uil zit op een getal.", "We tellen samen.");
  licht(l, 0);
  await l.zeg("{5:wit}.");
  licht(l, 1);
  await l.zeg("Na {5:wit} komt {6:wit}.");
  vul(l, 1, "6");
  await l.zeg("Onder de uil zit {6:wit}.");
  await l.verder();
}

async function uitlegOrden(l: Lesgids) {
  toon(l, { soort: "orden", vakken: [null, null, null], kaarten: [3, 1, 2] });
  await l.zeg("Kijk, drie kaarten.", "We zetten ze op volgorde, van klein naar groot.");
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
  titel: "Dieren op de getallen",
  synthesis: "Squla groep 3 · Getallenlijn · Getallenlijn met dieren · level 1 (alleen leerdoel)",
  indeling: "synthesis",
  browserstem: true,
  async speel(l) {
    l.vlak<GetallenlijnProps>(SqulaGetallenlijn, { beeld: { soort: "rij", ding: "tegel", items: [{ dier: "uil" }, { dier: "egel" }, { dier: "konijn" }] } });
    speelLesgeluid("verschijn");
    await squlaBegin(l, {
      welkom: ["Hoi!", "Kijk, allemaal dieren.", "Ze gaan op de getallen zitten.", "Welk getal zit onder het dier?"],
      uitleg: () => uitlegDier(l),
    });
    const fouten = await speelOpgaven(l, DIEREN_1);
    await squlaEind(l, fouten, "Je weet welk getal onder elk dier zit.");
  },
};

const dieren2: Lesdraaiboek = {
  id: "squla-getallenlijn-dieren-2",
  titel: "Dieren op de getallen (moeilijker)",
  synthesis: "Squla groep 3 · Getallenlijn · Getallenlijn met dieren · level 2 (alleen leerdoel)",
  indeling: "synthesis",
  browserstem: true,
  async speel(l) {
    l.vlak<GetallenlijnProps>(SqulaGetallenlijn, { beeld: { soort: "rij", ding: "tegel", items: [{ dier: "schildpad" }, { dier: "pinguin" }, { dier: "egel" }] } });
    speelLesgeluid("verschijn");
    await squlaBegin(l, {
      welkom: ["Hoi!", "De dieren hebben de kaarten door elkaar gegooid.", "Zet jij ze weer op volgorde?"],
      uitleg: () => uitlegOrden(l),
    });
    const fouten = await speelOpgaven(l, DIEREN_2);
    await squlaEind(l, fouten, "Je zet getallen goed op volgorde.");
  },
};

const dieren3: Lesdraaiboek = {
  id: "squla-getallenlijn-dieren-3",
  titel: "Dieren op de getallen (nog moeilijker)",
  synthesis: "Squla groep 3 · Getallenlijn · Getallenlijn met dieren · level 3 (alleen leerdoel)",
  indeling: "synthesis",
  browserstem: true,
  async speel(l) {
    l.vlak<GetallenlijnProps>(SqulaGetallenlijn, { beeld: { soort: "rij", ding: "tegel", items: [{ t: "10" }, { dier: "olifant" }] } });
    speelLesgeluid("verschijn");
    await squlaBegin(l, {
      welkom: ["Hoi!", "De dieren zijn terug.", "En er is een heel groot dier bij.", "We zoeken getallen en zetten ze op volgorde."],
      uitleg: () => uitlegDier(l),
    });
    const fouten = await speelOpgaven(l, DIEREN_3);
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
function aftel(l: Lesgids, start: number, gat: number, plek: number) {
  const rij: Plek[] = Array.from({ length: 7 }, (_, i) => (i === gat ? "…" : start - i));
  const goed = start - gat;
  const eind = start - 6;
  const anders = [start + 1 <= 20 ? start + 1 : eind - 2, eind - 1, goed >= 10 ? goed - 10 : goed + 10];
  const opties = [...anders];
  opties.splice(plek % 4, 0, goed);
  return rijVraag(l, { ding: "aftel", rij, start, stap: -1, gat, opties, vraag: ["Welk getal hoort op de puntjes?"] });
}

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
  (l) => aftel(l, 16, 3, 0),
];

const terugtellen1: Lesdraaiboek = {
  id: "squla-getallenlijn-terugtellen-1",
  titel: "Terugtellen tot de start",
  synthesis: "Squla groep 3 · Getallenlijn · Getallenlijn (terugtellen) · level 1 (alleen leerdoel)",
  indeling: "synthesis",
  browserstem: true,
  async speel(l) {
    l.vlak<GetallenlijnProps>(SqulaGetallenlijn, { beeld: { soort: "rij", ding: "aftel", items: [7, 6, 5, 4, 3, 2, 1].map((n) => ({ t: String(n) })) } });
    speelLesgeluid("verschijn");
    await squlaBegin(l, {
      welkom: ["Hoi!", "Kijk, een raket.", "Voor hij opstijgt, tellen we terug.", "Van groot naar klein."],
      uitleg: async () => {
        toon(l, { soort: "rij", ding: "aftel", items: [7, 6, 5, "…", 3, 2, 1].map((n) => ({ t: String(n) })) });
        await l.zeg("We tellen samen terug.");
        for (const i of [0, 1, 2]) {
          licht(l, i);
          await l.zeg(`${w(7 - i)}.`);
        }
        licht(l, 3);
        await l.zeg("Na {5:wit} komt {4:wit}.");
        vul(l, 3, "4");
        await l.zeg("Terug wordt het getal steeds één minder.");
        await l.verder();
      },
    });
    const fouten = await speelOpgaven(l, TERUGTELLEN);
    await squlaEind(l, fouten, "Je kunt terugtellen vanaf {20:wit}.");
  },
};

export const LESSEN_SQULA_GETALLENLIJN: Lesdraaiboek[] = [rangschikken1, rangschikken2, rangschikken3, kat1, kat2, dieren1, dieren2, dieren3, terugtellen1];
