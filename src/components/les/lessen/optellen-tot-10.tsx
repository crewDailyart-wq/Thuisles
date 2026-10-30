/**
 * Lessen van het onderdeel Optellen tot 10 — naar de Synthesis-unit
 * "Add within 10" (INSPIRATIE.md, ronde 1, 2 en 3). Groep 3. Zie ../soort.ts.
 *
 * "Adding below 10" staat apart in ./optellen-onder-10.ts. Hier de andere
 * zeven, in de volgorde van Synthesis:
 * Assessment · Doubles · True or False · Missing Numbers · Add Three Numbers ·
 * Splitting Sums · Mastery Check.
 *
 * Sinds 27 oktober 2026 (BOUWEN-PHASER.md) in Phaser, als hologrammen in
 * Bliepo's ruimte (wereld Oceaan, LESSENPLAN.md O1–O6, S1, S4):
 * - alle lessen met tegels gebruiken het gedeelde hologram-tegelvlak
 *   (../vlakken/optellen10-holo-tegels): tegels uit de rij rechts slepen of
 *   aantikken, torens, bedekken, een lege vorm vullen, samen tellen,
 *   omdraaien. De som staat groot bovenaan; het kind typt in het echte
 *   invulvak van het lesscherm (HARDE REGEL 5).
 * - Splitting Sums gebruikt de hologram-parels (../vlakken/optellen10-holo-parels).
 * De oude vlakken (optellen-tegelvlak, optellen-stippen) blijven bestaan.
 *
 * Hulp (INSPIRATIE.md R3, ALGEMENE HULPREGELS): 1× fout = vriendelijk + één
 * hint bij de handeling; 2× fout = Bliepo zegt of doet het voor; "weet ik
 * niet" = het antwoord + "daar komen we later op terug" (de vraag komt aan het
 * eind terug). Nooit het woord "fout". De toetsen geven geen uitleg bij een
 * fout. De eerste keer in een les wijst Bliepo de knoppen aan (groep 3 leest
 * nog niet).
 */

import type { Lesdraaiboek, Lesgids, Somdeel, Vlakgebeurtenis } from "../soort";
import { hoogte, TEGELKLEUR, vorm } from "../tegels";
import { knoppenOpPlek, type Knopregels } from "./antwoordknoppen";
import { HoloTegelvlak, zetIn, type HoloTegelProps, type Tegeltoren } from "../vlakken/optellen10-holo-tegels";
import { HoloParels, zelfdeGroepen, type Parelprops } from "../vlakken/optellen10-holo-parels";

/* ====================================================================== */
/* Kleine hulpjes                                                          */
/* ====================================================================== */

export function schud<T>(lijst: T[]): T[] {
  const uit = [...lijst];
  for (let i = uit.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [uit[i], uit[j]] = [uit[j], uit[i]];
  }
  return uit;
}

function kies1<T>(lijst: T[]): T {
  return lijst[Math.floor(Math.random() * lijst.length)];
}

export function reeks(van: number, tot: number): number[] {
  return Array.from({ length: tot - van + 1 }, (_, i) => van + i);
}

const optel = (delen: number[]) => delen.reduce((a, b) => a + b, 0);

/** "{2} plus {3} plus {4}", voor in een zin. */
const somWoorden = (delen: number[]) => delen.map((n) => `{${n}}`).join(" plus ");

/** "2 + 3 + 4" → [2, 3, 4] */
const losse = (som: string) => som.split("+").map((d) => Number(d.trim()));

/** "de {2} en de {3}", "de {2}, de {3} en de {4}" */
function opsomming(delen: number[]): string {
  const d = delen.map((n) => `de {${n}}`);
  return d.length < 2 ? d.join("") : `${d.slice(0, -1).join(", ")} en ${d[d.length - 1]}`;
}

const G = (n: number): Somdeel => ({ t: "getal", n });
const T = (s: string): Somdeel => ({ t: "teken", s });
const V = (waarde?: string): Somdeel => ({ t: "vak", waarde });

/** Een som voor bovenaan: getallen of vakjes, met plussen en een is-teken. */
export function somRij(delen: (number | string | null)[], totaal: number | string | null): Somdeel[] {
  const stuk = (d: number | string | null): Somdeel => (typeof d === "number" ? G(d) : V(d ?? undefined));
  const uit: Somdeel[] = [];
  delen.forEach((d, i) => {
    if (i > 0) uit.push(T("+"));
    uit.push(stuk(d));
  });
  uit.push(T("="), stuk(totaal));
  return uit;
}

const metNaam = (l: Lesgids, zin: string) => (l.naam ? `${zin}, ${l.naam}!` : `${zin}!`);

/** Wacht op iets, en zeg de hulpzinnen als het kind na een tijdje nog niets doet. */
async function metHulp<X>(l: Lesgids, p: Promise<X>, zinnen: string[], ms = 14000): Promise<X> {
  let klaar = false;
  const klok = setTimeout(() => {
    if (!klaar) void l.zeg(...zinnen).catch(() => {});
  }, ms);
  try {
    return await p;
  } finally {
    klaar = true;
    clearTimeout(klok);
  }
}

/**
 * Een belofte waarvan een afwijzing (de les is gestopt) niet als fout in de
 * console komt, ook als niemand er meer op wacht. Wie erop wacht, krijgt de
 * afwijzing gewoon.
 */
export function stil<T>(p: Promise<T>): Promise<T> {
  p.catch(() => {});
  return p;
}

/**
 * De gids, maar de eerste keer dat het kind iets moet doen, wijst Bliepo de
 * knoppen aan en zegt wat ze doen (ONTWERPREGELS.md "Groep 3: kinderen die
 * nog niet lezen", regel 5). De knoppen blijven daarbij gewoon staan.
 */
export function metUitleg(l: Lesgids): Lesgids {
  let getalUitgelegd = false;
  let kiesUitgelegd = false;
  let verderUitgelegd = false;
  let weetNietUitgelegd = false;
  const weetNiet = async () => {
    if (weetNietUitgelegd) return;
    weetNietUitgelegd = true;
    await l.wijsAan("weetniet", "Weet je het niet?", "Tik dan op het vraagteken.");
  };
  return {
    ...l,
    getal: async () => {
      const p = stil(l.getal());
      if (!getalUitgelegd) {
        getalUitgelegd = true;
        await l.wijsAan("controleer", "Typ het getal.", "Tik dan op het vinkje.");
        await weetNiet();
      }
      return p;
    },
    kies: async (opties) => {
      const p = stil(l.kies(opties));
      if (!kiesUitgelegd && opties.length > 1) {
        kiesUitgelegd = true;
        await l.wijsAan("weetniet", "Tik op je antwoord.", "Tik dan op het vinkje.");
        await weetNiet();
      }
      return p;
    },
    verder: async () => {
      const p = l.verder();
      if (!verderUitgelegd) {
        verderUitgelegd = true;
        await l.wijsAan("verder", "Tik op de pijl.", "Dan gaan we verder.");
      }
      return p;
    },
  };
}

/** Vragen die het kind niet wist; ze komen aan het eind van de les nog één keer terug. */
export class Later {
  private lijst: (() => Promise<void>)[] = [];
  bewaar(vraag: () => Promise<void>) {
    this.lijst.push(vraag);
  }
  async speel(l: Lesgids) {
    if (this.lijst.length === 0) return;
    await l.zeg("Weet je nog?", this.lijst.length === 1 ? "Er was nog één vraag." : "Er waren nog een paar vragen.", "Dat doen we nu.");
    for (const vraag of this.lijst.splice(0)) await vraag();
  }
}

/* ====================================================================== */
/* Het tegelvlak                                                           */
/* ====================================================================== */

/**
 * Het handje (hulp) staat als vraagteken op de vaste plek onder de zin van
 * Bliepo (28 oktober 2026). Uitzondering: in een toets en bij Ja/Nee staat daar
 * al een vraagteken ("Weet ik niet") met een ander gevolg; dan blijft het
 * handje in het vlak (`hulpInVlak`).
 */
const TEGEL_KNOPPEN: Knopregels = {
  voor: HoloTegelvlak,
  soorten: { hulp: "weetniet" },
  zichtbaar: (p) => (p.hulpKnop && !p.hulpInVlak ? ["hulp"] : []),
};

export const pas = (l: Lesgids, p: Partial<HoloTegelProps>) => l.pasVlakAan<HoloTegelProps>(p);

/** Wat er in het rooster ligt; elke verandering gaat meteen naar het scherm. */
export class Werkvlak {
  torens: Tegeltoren[] = [];
  private nr = 0;
  constructor(private l: Lesgids) {}

  toon() {
    pas(this.l, { torens: this.torens.map((t) => ({ ...t, stukken: [...t.stukken] })), tel: null });
  }
  zet(torens: Tegeltoren[]) {
    this.torens = torens.map((t) => ({ ...t, stukken: [...t.stukken] }));
    this.toon();
  }
  toren(i: number): Tegeltoren {
    while (this.torens.length <= i) this.torens.push({ stukken: [] });
    return this.torens[i];
  }
  /** Een tegel op toren `i`, netjes zonder gat. */
  leg(i: number, n: number) {
    const t = this.toren(i);
    t.stukken = optel(t.stukken) + n > 16 ? [n] : zetIn(t.stukken, n);
    t.wegLaatste = false;
    this.toon();
  }
  /** Een tegel precies bovenop (zonder de volgorde te veranderen), zoals het kind hem neerlegt. */
  legOp(i: number, n: number) {
    const t = this.toren(i);
    t.stukken = [...t.stukken, n];
    t.wegLaatste = false;
    this.toon();
  }
  maakLeeg(i: number) {
    this.toren(i).stukken = [];
    this.toon();
  }
  heeftStukken(i: number) {
    return (this.torens[i]?.stukken.length ?? 0) > 0;
  }
  totaal() {
    return this.torens.reduce((a, t) => a + optel(t.stukken), 0);
  }
  /** Een tegel die niet past: hij verschijnt even bovenop en verdwijnt weer. */
  async evenLaten(i: number, n: number) {
    const t = this.toren(i);
    t.stukken = [...t.stukken, n];
    this.toon();
    await this.l.wacht(650);
    t.wegLaatste = true;
    this.toon();
    await this.l.wacht(420);
    t.stukken = t.stukken.slice(0, -1);
    t.wegLaatste = false;
    this.toon();
  }
  /** Een lichtgolf over toren `i` (goed). */
  goed(i = 0) {
    pas(this.l, { golf: { toren: i, nr: ++this.nr } });
  }
  /** De toren draait om: de bovenste tegel komt onder. */
  async draai(i = 0) {
    pas(this.l, { draai: { toren: i, nr: ++this.nr } });
    await this.l.wacht(950);
    const t = this.toren(i);
    t.stukken = [...t.stukken].reverse();
    pas(this.l, { draai: null });
    this.toon();
  }
}

/** Wacht tot het kind een tegel in het rooster zet. */
export async function pakTegel(l: Lesgids, hulp?: string[], o: { hand?: boolean } = {}): Promise<number> {
  const p = stil(l.wachtOpVlak("tegel"));
  pas(l, { actief: true, hand: !!o.hand });
  const g = hulp ? await metHulp(l, p, hulp) : await p;
  pas(l, { actief: false, hand: false });
  return Number(g.n);
}

export const PAK_HULP = ["Tik op een tegel.", "Tik dan in het rooster.", "Of sleep hem erheen."];

/** De kleur van een tegel als woord, zoals de begeleider hem noemt ("de gele tegel"). */
const KLEURWOORD: Record<number, string> = {
  1: "rode",
  2: "oranje",
  3: "gele",
  4: "lichtgroene",
  5: "groene",
  6: "lichtblauwe",
  7: "blauwe",
  8: "paarse",
  9: "roze",
  10: "roze",
};

/**
 * Het kind typt een getal, en mag ondertussen tegels neerleggen om te helpen
 * (op toren `i`). Met Leegmaken gaan die tegels weer weg. Met `handje` kan
 * het kind ook om hulp vragen (in een toets): dan `"hulp"`.
 */
async function getalMetTegels(l: Lesgids, vak: Werkvlak, i = 0, handje = false): Promise<number | null | "hulp"> {
  const antwoord = stil(l.getal().then((v) => ({ t: "getal" as const, v })));
  for (;;) {
    const tegel = stil(l.wachtOpVlak(handje ? ["tegel", "leeg", "hulp"] : ["tegel", "leeg"]).then((e) => ({ t: "vlak" as const, e })));
    const leeg = vak.heeftStukken(i);
    pas(l, { actief: true, leegKnop: leeg });
    /* De eerste keer dat de knop Leegmaken er staat, wijst Bliepo hem aan. */
    if (leeg && !leegUitgelegd.has(l)) {
      leegUitgelegd.add(l);
      await l.wijsAan("leeg", "Wil je de tegels weghalen?", "Tik dan op deze knop.");
    }
    const r = await Promise.race([antwoord, tegel]);
    if (r.t === "getal") {
      pas(l, { actief: false, leegKnop: false });
      return r.v;
    }
    if (r.e.soort === "hulp") {
      pas(l, { actief: false, leegKnop: false });
      return "hulp";
    }
    if (r.e.soort === "leeg") vak.maakLeeg(i);
    else vak.leg(i, Number(r.e.n));
  }
}
const leegUitgelegd = new WeakSet<Lesgids>();

/** Een getal typen, of (in een toets) het handje: dan `"hulp"`. */
async function getalOfHulp(l: Lesgids): Promise<number | null | "hulp"> {
  const g = stil(l.getal().then((v) => ({ t: "g" as const, v })));
  const h = stil(l.wachtOpVlak("hulp").then(() => ({ t: "h" as const })));
  const r = await Promise.race([g, h]);
  return r.t === "h" ? "hulp" : r.v;
}

/** De mascotte telt de hokjes van toren `i` (of van alle torens), één voor één. */
export async function telHokjes(l: Lesgids, i: number | "alle", aantal: number, onbedekt = false) {
  for (let tot = 1; tot <= aantal; tot++) {
    pas(l, { tel: { toren: i, tot, onbedekt } });
    await l.wacht(420);
  }
  await l.wacht(300);
}

/**
 * Het kind zet tegels in het rooster tot alle `delen` erin liggen (op toren `i`).
 * Een tegel die er niet bij hoort, verschijnt even en verdwijnt weer.
 */
async function zetDelen(l: Lesgids, vak: Werkvlak, i: number, delen: number[], tussendoor: string[][] = []) {
  const over = [...delen];
  let gelegd = 0;
  while (over.length > 0) {
    const n = await pakTegel(l, [`Zet ${opsomming(over)} in het rooster.`]);
    const plek = over.indexOf(n);
    if (plek < 0) {
      await vak.evenLaten(i, n);
      await l.zeg(over.length === 1 ? `Zoek de {${over[0]}}.` : `Zoek ${opsomming(over)}.`);
      continue;
    }
    over.splice(plek, 1);
    vak.leg(i, n);
    if (over.length > 0 && tussendoor[gelegd]) await l.zeg(...tussendoor[gelegd]);
    gelegd++;
  }
}

/* ====================================================================== */
/* Toetsen: Assessment en Mastery Check                                    */
/* ====================================================================== */

type Toets = "instap" | "eind";
type Toetsuitslag = "goed" | "herkansing" | "fout" | "stop";

const LES_ONDER_10 = "Optellen onder de 10";
const LES_DUBBELEN = "Dubbelen";
const LES_ONTBREKEND = "Het ontbrekende getal";
const LES_KLOPT = "Klopt de som?";

/** Het handje in een toets: "ik kan dit nog niet" → naar de les (zoals Synthesis). */
async function naarLes(l: Lesgids, les: string): Promise<Toetsuitslag> {
  pas(l, { hulpKnop: false, actief: false, leegKnop: false });
  await l.zeg("Geen probleem.", "We leren het samen.", `Begin met de les "${les}".`);
  return "stop";
}

/**
 * Een toetsvraag met een getal. Geen uitleg bij een fout.
 * - Instaptoets: de eerste keer "kijk nog eens"; bij de tweede fout stopt de
 *   toets en noemt hij de les waar je dit leert (zoals Synthesis).
 * - Eindtoets: de foute som als vraag en nog een kans; daarna kort het
 *   antwoord, en de toets gaat door.
 * - "Weet ik niet": Bliepo zegt het antwoord; de vraag telt als niet
 *   beheerst en de toets gaat door (LESSENPLAN O1).
 * - Het handje: naar de les.
 */
async function toetsGetal(
  l: Lesgids,
  soort: Toets,
  juist: number,
  o: { vraag: string[]; fout: (x: number) => string; antwoord: string[]; les: string; getal?: () => Promise<number | null | "hulp"> },
): Promise<Toetsuitslag> {
  const lees = o.getal ?? (() => getalOfHulp(l));
  const weetNiet = async (): Promise<Toetsuitslag> => {
    await l.zeg("Geen zorgen.", ...o.antwoord);
    await l.verder();
    return "fout";
  };
  let x = await lees();
  if (x === "hulp") return naarLes(l, o.les);
  if (x === juist) return "goed";
  if (x === null) return weetNiet();
  if (soort === "instap") await l.zeg(o.fout(x), Math.abs(x - juist) <= 1 ? "Dat is heel dichtbij." : "Hmm, niet helemaal.", "Kijk nog eens.");
  else await l.zeg(o.fout(x), "Probeer die nog eens.");
  await l.verder();
  await l.zeg(...o.vraag);
  x = await lees();
  if (x === "hulp") return naarLes(l, o.les);
  if (x === juist) return "herkansing";
  if (x === null) return weetNiet();
  if (soort === "instap") {
    pas(l, { hulpKnop: false });
    await l.zeg(o.fout(x), "We stoppen de toets hier.", `In de les "${o.les}" leren we dit samen.`);
    return "stop";
  }
  await l.zeg(...o.antwoord);
  await l.verder();
  return "fout";
}

/** Een toetsvraag met knoppen. Zelfde regels, maar deze vragen stoppen de toets nooit (behalve het handje). */
async function toetsKies(
  l: Lesgids,
  soort: Toets,
  juist: string,
  o: { opties: string[]; vraag: string[]; fout: (x: string) => string; antwoord: string[]; les: string },
): Promise<Toetsuitslag> {
  const kiesOfHulp = async (opties: string[]) => {
    const k = stil(l.kies(opties).then((v) => ({ t: "k" as const, v })));
    const h = stil(l.wachtOpVlak("hulp").then(() => ({ t: "h" as const })));
    const r = await Promise.race([k, h]);
    return r.t === "h" ? ("hulp" as const) : r.v;
  };
  let k = await kiesOfHulp(o.opties);
  if (k === "hulp") return naarLes(l, o.les);
  if (k === juist) return "goed";
  if (k === null) {
    await l.zeg("Geen zorgen.", ...o.antwoord);
    await l.verder();
    return "fout";
  }
  if (soort === "instap") await l.zeg(o.fout(k), "Weet je het zeker?", "Kijk nog eens.");
  else await l.zeg(o.fout(k), "Probeer die nog eens.");
  await l.verder();
  await l.zeg(...o.vraag);
  const eerste = k;
  k = await kiesOfHulp(o.opties.length > 2 ? o.opties.filter((x) => x !== eerste) : o.opties);
  if (k === "hulp") return naarLes(l, o.les);
  if (k === juist) return "herkansing";
  await l.zeg(...o.antwoord);
  await l.verder();
  return "fout";
}

/** Een tegel pakken in een toets, of het handje. */
async function pakOfHulp(l: Lesgids, hand = false): Promise<number | "hulp"> {
  const p = stil(l.wachtOpVlak(["tegel", "hulp"]));
  pas(l, { actief: true, hand });
  const g = await metHulp(l, p, PAK_HULP);
  pas(l, { actief: false, hand: false });
  return g.soort === "hulp" ? "hulp" : Number(g.n);
}

/** Assessment en Mastery Check: dezelfde zeven vragen, met andere getallen. */
async function toetsOptellen(l0: Lesgids, soort: Toets) {
  const l = metUitleg(knoppenOpPlek(l0, TEGEL_KNOPPEN));
  const eind = soort === "eind";
  const vak = new Werkvlak(l);
  l.vlak(HoloTegelvlak, { torens: [], bak: [3, 4, 5, 6] });

  await l.zeg("In deze lessen maak je plussommen onder de {10}.", "Ben je daar al goed in?");
  const al = await l.kies(["Ja", "Nee"]);
  if (al === "Ja") {
    /* Zoals Synthesis: na "ja" mag het kind kiezen tussen de toets en de eerste les. */
    await l.zeg("Mooi.", "Wil je een korte toets doen?", "Of begin je liever bij de eerste les?");
    const keuze = await l.kies(["Toets", "Eerste les"]);
    if (keuze === "Eerste les") {
      vak.zet([]);
      pas(l, { bak: [] });
      await l.zeg("Prima.", `Begin dan met de les "${LES_ONDER_10}".`, "Daar leer je het stap voor stap.");
      return;
    }
    await l.zeg(keuze === "Toets" ? "Goed." : "Dan doen we de toets.", "Laat maar zien wat je kunt.");
  } else {
    await l.zeg("Geen probleem.", "We kijken gewoon wat je al weet.");
  }
  /* Het handje: "ik kan dit nog niet" (zoals Synthesis in een toets). */
  pas(l, { hulpKnop: true, hulpInVlak: true });
  await l.wijsAan("hulp", "Vind je een vraag te moeilijk?", "Tik dan op het handje.");

  /* 1. Een tegel herkennen. */
  await l.zeg("Oké.", "Zie je de tegels rechts?", "Sleep er één naar het midden.");
  const a = await pakOfHulp(l, true);
  if (a === "hulp") return void (await naarLes(l, LES_ONDER_10));
  vak.zet([{ stukken: [a] }]);
  const vraag1 = ["Welk getal is dit?"];
  await l.zeg(`Goed gekozen, de ${KLEURWOORD[a] ?? ""} tegel.`, ...vraag1);
  let r = await toetsGetal(l, soort, a, {
    vraag: vraag1,
    fout: (x) => `Een {${x}}?`,
    antwoord: [`Het is een {${a}}.`],
    les: LES_ONDER_10,
  });
  if (r === "stop") return;

  /* 2. Twee tegels samen. */
  pas(l, { bak: [2, 3, 4, 5, 6].filter((t) => t !== a) });
  await l.zeg(r === "fout" ? "" : `Ja, het is een {${a}}.`, "Zet er nog een tegel bij.");
  const b = await pakOfHulp(l);
  if (b === "hulp") return void (await naarLes(l, LES_ONDER_10));
  vak.leg(0, b);
  const vraag2 = [`Wat is {${a}} en {${b}} samen?`];
  await l.zeg(`Dat is een {${b}}.`, ...vraag2);
  r = await toetsGetal(l, soort, a + b, {
    vraag: vraag2,
    fout: (x) => `{${a}} en {${b}} is {${x}}?`,
    antwoord: [`{${a}} en {${b}} is samen {${a + b}}.`],
    les: LES_ONDER_10,
  });
  if (r === "stop") return;
  if (r !== "fout") await l.zeg(metNaam(l, r === "herkansing" ? "Nu klopt het" : "Dat klopt"), `{${a}} en {${b}} is samen {${a + b}}.`);

  /* 3. Een kale som; de tegels mogen helpen. */
  const [p, q] = kies1(eind ? [[4, 2], [2, 5], [3, 4]] : [[6, 2], [2, 6], [4, 2], [3, 5]]);
  vak.zet([]);
  pas(l, { bak: reeks(1, 8), som: somRij([p, q], "?"), somAan: 4 });
  const vraag3 = [`Wat is {${p}} plus {${q}}?`, "Je mag de tegels gebruiken."];
  await l.zeg(eind ? "Oké, nu deze." : "Hier komt de volgende vraag.", ...vraag3);
  r = await toetsGetal(l, soort, p + q, {
    vraag: vraag3,
    fout: (x) => `{${p}} plus {${q}} is {${x}}?`,
    antwoord: [`{${p}} plus {${q}} is {${p + q}}.`],
    les: LES_ONDER_10,
    getal: () => getalMetTegels(l, vak, 0, true),
  });
  if (r === "stop") return;
  pas(l, { som: somRij([p, q], p + q), somAan: null });
  if (r !== "fout") await l.zeg("Precies.", `{${p}} plus {${q}} is {${p + q}}.`);

  /* 4. Verdubbelen. */
  vak.zet([]);
  pas(l, { bak: [3, 4, 5], som: null });
  await l.zeg("Zet nog een tegel in het rooster.", "Nu gaan we verdubbelen.");
  const d = await pakOfHulp(l);
  if (d === "hulp") return void (await naarLes(l, LES_DUBBELEN));
  vak.zet([{ stukken: [d] }]);
  const vraag4 = [`Wat is het dubbele van {${d}}?`];
  await l.zeg("Mooie keuze.", ...vraag4);
  r = await toetsGetal(l, soort, 2 * d, {
    vraag: vraag4,
    fout: (x) => `{${x}}?`,
    antwoord: [`Het dubbele van {${d}} is {${2 * d}}.`],
    les: LES_DUBBELEN,
  });
  if (r === "stop") return;
  if (r !== "fout") {
    vak.leg(0, d);
    vak.goed(0);
    await l.zeg("Ja, dat klopt.", `Het dubbele van {${d}} is {${2 * d}}.`);
    await l.wacht(600);
  }

  /* 5. Een lastige som over de 10, met knoppen. */
  const [s1, s2] = eind ? [7, 8] : [6, 7];
  /* Echte kinderfouten: er 1 naast, of de 10 vergeten (7 + 8: alleen de 5 die na de 10 komt). */
  const opties5 = eind ? ["5", "14", "15", "16"] : ["3", "12", "13", "14"];
  vak.zet([]);
  pas(l, { raster: false, bak: [], som: somRij([s1, s2], "?"), somAan: 4 });
  const vraag5 = [`Wat is {${s1}} plus {${s2}}?`];
  await l.zeg("Nu een lastige som.", ...vraag5);
  r = await toetsKies(l, soort, String(s1 + s2), {
    opties: opties5,
    vraag: vraag5,
    fout: (x) => `{${s1}} plus {${s2}} is {${x}}?`,
    antwoord: [`{${s1}} plus {${s2}} is {${s1 + s2}}.`],
    les: LES_ONDER_10,
  });
  if (r === "stop") return;
  pas(l, { som: somRij([s1, s2], s1 + s2), somAan: null });
  if (r !== "fout") await l.zeg("Goed zo.");

  /* 6. Waar of niet waar. */
  const [w1, w2, wt] = eind ? [3, 8, 11] : [4, 9, 12];
  const waar = w1 + w2 === wt;
  pas(l, { som: somRij([w1, w2], wt) });
  const vraag6 = ["Kijk naar deze som.", "Is hij waar of niet waar?"];
  await l.zeg(...vraag6);
  r = await toetsKies(l, soort, waar ? "Waar" : "Niet waar", {
    opties: ["Waar", "Niet waar"],
    vraag: vraag6,
    fout: () => "Hmm.",
    antwoord: [`{${w1}} plus {${w2}} is {${w1 + w2}}.`, waar ? "Dus de som is *waar*." : "Dus de som is *niet waar*."],
    les: LES_KLOPT,
  });
  if (r === "stop") return;
  if (r !== "fout") await l.zeg("Dat klopt.", waar ? `{${w1}} plus {${w2}} is {${wt}}.` : `{${w1}} plus {${w2}} is niet {${wt}}.`);

  /* 7. Aanvullen tot 10: een tegel op de 10. */
  vak.zet([{ onder: [10], stukken: [] }]);
  pas(l, { raster: true, som: null, bak: [3, 4, 6, 7] });
  await l.zeg("Deze keer ligt er een {10} in het rooster.", "Leg er een tegel bovenop.");
  const k = await pakOfHulp(l);
  if (k === "hulp") return void (await naarLes(l, LES_ONTBREKEND));
  const n = 10 - k;
  vak.leg(0, k);
  pas(l, { som: somRij([k, "?"], 10), somAan: 2 });
  const vraag7 = [`Wat moet er bij de {${k}} om {10} te maken?`];
  await l.zeg("Kijk wat je hebt neergelegd.", ...vraag7);
  r = await toetsGetal(l, soort, n, {
    vraag: vraag7,
    fout: (x) => `{${k}} en {${x}} is {10}?`,
    antwoord: [`Er moet {${n}} bij.`],
    les: LES_ONTBREKEND,
  });
  if (r === "stop") return;
  pas(l, { som: somRij([k, n], 10), somAan: null });
  if (r !== "fout") {
    vak.goed(0);
    await l.zeg("Helemaal goed.", `Het ontbrekende getal is {${n}}.`);
    await l.verder();
  }

  /* Einde: de kaart. */
  vak.zet([]);
  pas(l, { bak: [], som: null, hulpKnop: false, hulpInVlak: false });
  const tik = l.kaart();
  await l.zeg(metNaam(l, "Goed gedaan"), "Je kunt plussommen maken tot {10}.", "Tik op de kaart om hem af te vinken.");
  await tik;
}

/* ====================================================================== */
/* Kaarttekeningen (244 × 190)                                             */
/* ====================================================================== */

function Lijntegel({ n, x, y, c = 32 }: { n: number; x: number; y: number; c?: number }) {
  const h = hoogte(n);
  return (
    <g transform={`translate(${x} ${y})`} stroke={TEGELKLEUR[n] ?? "#ffffff"} strokeWidth="3" fill="none" strokeLinejoin="round">
      {vorm(n).map((hk) => (
        <g key={`${hk.k}-${hk.r}`}>
          <rect x={hk.k * c + 1} y={(h - 1 - hk.r) * c + 1} width={c - 2} height={c - 2} rx="3" />
          <circle cx={hk.k * c + c / 2} cy={(h - 1 - hk.r) * c + c / 2} r={c * 0.2} />
        </g>
      ))}
    </g>
  );
}

const kaartLetter = { fill: "#f1f3f8", fontSize: 30, fontWeight: 800, fontFamily: "inherit" } as const;

function KaartKlopt() {
  return (
    <g>
      <Lijntegel n={6} x={34} y={52} />
      <text x={122} y={112} textAnchor="middle" style={kaartLetter}>
        =
      </text>
      <Lijntegel n={2} x={146} y={116} />
      <Lijntegel n={4} x={146} y={50} />
      <text x={20} y={34} style={kaartLetter}>
        ?
      </text>
      <text x={210} y={34} style={kaartLetter}>
        ?
      </text>
    </g>
  );
}

function KaartOntbrekend() {
  return (
    <g>
      <text x={122} y={40} textAnchor="middle" style={kaartLetter}>
        <tspan fill={TEGELKLEUR[4]}>4</tspan> + ? = <tspan fill={TEGELKLEUR[7]}>7</tspan>
      </text>
      <Lijntegel n={4} x={58} y={110} />
      <g stroke={TEGELKLEUR[2]} strokeWidth="3" fill="none" strokeDasharray="5 4">
        <rect x={135} y={79} width={30} height={30} rx="3" />
        <rect x={167} y={111} width={30} height={30} rx="3" />
        <rect x={135} y={111} width={30} height={30} rx="3" />
      </g>
    </g>
  );
}

function KaartDrie() {
  return (
    <g>
      <text x={122} y={40} textAnchor="middle" style={kaartLetter}>
        ? + ? + ?
      </text>
      <Lijntegel n={8} x={30} y={58} c={28} />
      <Lijntegel n={3} x={112} y={114} c={28} />
      <Lijntegel n={1} x={180} y={142} c={28} />
    </g>
  );
}

function KaartStippen() {
  const groep = (n: number, x: number) =>
    Array.from({ length: n }, (_, i) => (
      <circle key={i} cx={x + (i % 2) * 24} cy={86 + Math.floor(i / 2) * 24} r={9} fill="none" stroke={TEGELKLEUR[n]} strokeWidth="3" />
    ));
  return (
    <g>
      {groep(3, 22)}
      <text x={82} y={110} textAnchor="middle" style={kaartLetter}>
        +
      </text>
      {groep(2, 104)}
      <text x={164} y={110} textAnchor="middle" style={kaartLetter}>
        +
      </text>
      {groep(2, 186)}
      <text x={122} y={44} textAnchor="middle" style={kaartLetter}>
        7
      </text>
    </g>
  );
}

/* ====================================================================== */
/* 1. Assessment                                                           */
/* ====================================================================== */

const instaptoets: Lesdraaiboek = {
  id: "optellen-tot-10-instaptoets",
  titel: "Instaptoets: optellen tot 10",
  synthesis: "Add within 10 · Assessment",
  kaarttegels: [3, 1],
  speel: (l) => toetsOptellen(l, "instap"),
};

/* ====================================================================== */
/* 2. Doubles (LESSENPLAN S4)                                              */
/* ====================================================================== */

/**
 * Het kind zet twee dezelfde tegels in het rooster. Een andere tegel wordt
 * niet aangenomen (hij verschijnt even en verdwijnt); dan verschijnt er een
 * doorschijnende schaduw van dezelfde tegel waar hij hoort (INSPIRATIE R3).
 */
async function maakDubbel(l: Lesgids, vak: Werkvlak): Promise<number> {
  const a = await pakTegel(l, ["Tik op een tegel.", "Zet hem in het rooster."]);
  vak.zet([{ stukken: [a] }]);
  /* Een oneven tegel draait om in de bak, zodat de tweede er precies tegenaan past. */
  if (a % 2 === 1) {
    pas(l, { om: true });
    await l.wacht(650);
  }
  for (let fouten = 0; ; ) {
    const b = await pakTegel(l, [`Zet er nog een {${a}} bij.`]);
    if (b === a) {
      pas(l, { hint: null });
      vak.leg(0, b);
      pas(l, { om: false });
      return a;
    }
    await vak.evenLaten(0, b);
    fouten++;
    pas(l, { hint: { toren: 0, n: a } });
    await l.zeg(fouten === 1 ? "Twee *dezelfde* tegels." : "", `Zet hier nog een {${a}} neer.`);
  }
}

/**
 * "Wat is het dubbele van a?" (INSPIRATIE R3): 1× fout = "niet helemaal" +
 * tel a en a samen; 2× fout = Bliepo zegt het antwoord; weet ik niet = het
 * antwoord en de vraag komt later terug. Geeft terug of het (ooit) goed was.
 */
async function dubbelVraag(l: Lesgids, vak: Werkvlak, a: number, later: Later, i = 0): Promise<void> {
  const d = 2 * a;
  let x = await l.getal();
  if (x === d) {
    vak.goed(i);
    await l.zeg("Ja!", `Het dubbele van {${a}} is {${d}}.`);
    return;
  }
  if (x === null) {
    await l.zeg("Hmm.", `Het dubbele van {${a}} is {${d}}.`, "Dat zien we later.");
    await l.verder();
    later.bewaar(async () => {
      vak.zet([{ stukken: [a, a].reduce<number[]>((s, n) => zetIn(s, n), []) }]);
      pas(l, { bak: [] });
      await l.zeg(`Wat is het dubbele van {${a}}?`);
      const y = await l.getal();
      if (y === d) {
        vak.goed(0);
        await l.zeg("Ja, nu weet je het!", `Het dubbele van {${a}} is {${d}}.`);
      } else {
        await telHokjes(l, 0, d);
        await l.zeg(`{${a}} en {${a}} is samen {${d}}.`, `Het dubbele van {${a}} is {${d}}.`);
        await l.verder();
      }
    });
    return;
  }
  await l.zeg("Niet helemaal.", `Tel de hokjes van {${a}} en {${a}} bij elkaar.`, "Dat is het dubbele.");
  x = await l.getal();
  if (x === d) {
    vak.goed(i);
    await l.zeg("Goed zo.", `Het dubbele van {${a}} is {${d}}.`);
    return;
  }
  await telHokjes(l, i, d);
  await l.zeg(`Het dubbele van {${a}} is {${d}}.`);
  await l.verder();
}

/** Welk getal moet je verdubbelen om `t` te maken? De t ligt er; tegels mogen erop. */
async function halveer(l: Lesgids, vak: Werkvlak, t: number, zinnen: string[], goed: string[], later: Later, terug = true) {
  const h = t / 2;
  vak.zet([{ onder: [t], stukken: [] }]);
  await l.zeg(...zinnen);
  const toonAntwoord = async (zin: string) => {
    vak.zet([{ onder: [t], stukken: [h, h] }]);
    await l.zeg(zin, `{${h}} en {${h}} passen precies op de {${t}}.`, `Het dubbele van {${h}} is {${t}}.`);
  };
  let x = await getalMetTegels(l, vak);
  if (x === h) {
    vak.zet([{ onder: [t], stukken: [h, h] }]);
    vak.goed(0);
    await l.zeg(...goed);
    return;
  }
  if (x === null) {
    await toonAntwoord("Geen zorgen.");
    if (terug) {
      await l.zeg("Dat zien we later.");
      later.bewaar(() => halveer(l, vak, t, [`Welk getal moet je verdubbelen om {${t}} te maken?`], ["Ja, nu weet je het!", `{${h}} en {${h}} is {${t}}.`], later, false));
    }
    await l.verder();
    return;
  }
  if (x !== "hulp") await l.zeg("Net niet.", `{${x}} en {${x}} is samen {${2 * x}}.`, `We zoeken {${t}}.`);
  x = await getalMetTegels(l, vak);
  if (x === h) {
    vak.zet([{ onder: [t], stukken: [h, h] }]);
    vak.goed(0);
    await l.zeg(...goed);
    return;
  }
  await toonAntwoord("Kijk eens.");
  await l.verder();
}

const dubbelen: Lesdraaiboek = {
  id: "optellen-tot-10-dubbelen",
  titel: "Dubbelen",
  synthesis: "Add within 10 · Doubles",
  kaarttegels: [4, 4],

  async speel(l0) {
    const l = metUitleg(knoppenOpPlek(l0, TEGEL_KNOPPEN));
    const vak = new Werkvlak(l);
    const later = new Later();
    l.vlak(HoloTegelvlak, { torens: [], bak: [1, 2, 3, 4, 5] });
    await l.zeg(l.naam ? `Oké, ${l.naam}.` : "Oké.", "We gaan iets nieuws leren.", "Weet je wat een *dubbel* is?");
    const weet = await l.kies(["Ja", "Nee"]);
    if (weet === "Ja") await l.zeg("Mooi.", "Laat maar zien.");
    else await l.zeg("Geen probleem.", "We ontdekken het samen.");

    /* 1. Twee dezelfde tegels: een dubbel (drie keer). */
    let bak = [1, 2, 3, 4, 6, 7];
    pas(l, { bak });
    await l.zeg("Zet twee dezelfde tegels in het rooster.");
    const a = await maakDubbel(l, vak);
    await l.zeg("Goed zo!", "Je hebt een *dubbel* gemaakt.", "Twee keer hetzelfde getal.", `Wat is het dubbele van {${a}}?`);
    await dubbelVraag(l, vak, a, later);

    vak.zet([]);
    bak = bak.filter((t) => t !== a);
    pas(l, { bak });
    await l.zeg("Laten we nog een dubbel maken.", "Zet weer twee dezelfde tegels in het rooster.");
    const b = await maakDubbel(l, vak);
    await l.zeg("Mooi gemaakt!", `Wat krijg je als je {${b}} verdubbelt?`);
    await dubbelVraag(l, vak, b, later);

    vak.zet([]);
    bak = bak.filter((t) => t !== b);
    pas(l, { bak });
    await l.zeg("Nog één dubbel.");
    const c = await maakDubbel(l, vak);
    await l.zeg("Goed zo!", `Wat is het dubbele van {${c}}?`);
    await dubbelVraag(l, vak, c, later);

    /* 2. Dubbelen zonder slepen: de twee tegels liggen er al. */
    vak.zet([]);
    pas(l, { bak: [] });
    await l.zeg("Nu leg ik de tegels neer.", "Jij zegt het dubbele.");
    await l.verder();
    const gehad = [a, b, c];
    const rest = schud([1, 2, 3, 4, 5].filter((n) => !gehad.includes(n)));
    const vragen = [...rest, ...schud([1, 2, 3, 4, 5].filter((n) => gehad.includes(n)))].slice(0, 4);
    for (const [i, n] of vragen.entries()) {
      vak.zet([{ stukken: [n] }]);
      await l.wacht(500);
      vak.leg(0, n);
      await l.zeg(i === 0 ? `Dit is {${n}} en nog eens {${n}}.` : "En deze?", `Wat is het dubbele van {${n}}?`);
      await dubbelVraag(l, vak, n, later);
      vak.zet([]);
    }

    /* 3. Omgekeerd (halveren, zonder dat woord). */
    pas(l, { bak: reeks(1, 7) });
    await halveer(
      l,
      vak,
      4,
      ["Welk getal moet je verdubbelen om {4} te *maken*?", "Probeer het met de tegels als je wilt.", "Je mag ze ook op de {4} leggen."],
      ["Ja!", "{2} en {2} is {4}."],
      later,
    );
    await l.zeg("Nu proberen we grotere getallen.");
    await halveer(l, vak, 8, ["Welk getal moet je verdubbelen om {8} te maken?", "Je mag de tegels gebruiken."], ["Goed zo.", "{4} en {4} is {8}."], later);
    await halveer(l, vak, 6, ["En om {6} te maken?"], ["Precies.", "{3} en {3} is {6}."], later);
    await halveer(l, vak, 2, ["Welk getal moet je verdubbelen om {2} te maken?"], ["Ja.", "{1} en {1} is {2}."], later);
    await halveer(l, vak, 10, ["Welk getal moet je verdubbelen om {10} te maken?"], ["Knap gedaan!", "{5} en {5} is {10}.", "Je kent de dubbele sommen goed."], later);
    await l.verder();

    /* Wat het kind niet wist, komt nog één keer terug. */
    await later.speel(l);

    /* Einde. */
    vak.zet([]);
    pas(l, { bak: [] });
    const tik = l.kaart();
    await l.zeg("Goed gedaan!", "Deze les is klaar.", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

/* ====================================================================== */
/* 3. True or False (LESSENPLAN O3)                                        */
/* ====================================================================== */

/**
 * "Is dit een …?" bij één tegel, met het handje: dan zegt Bliepo de tip
 * (tel de hokjes; klopt dat met het getal?) en telt hij mee (INSPIRATIE R3).
 */
async function tegelBewering(l: Lesgids, vak: Werkvlak, n: number, bewering: number, zin: string, opties: string[], o: { handje?: boolean } = {}) {
  vak.zet([{ stukken: [n] }]);
  await l.zeg(zin);
  const k = stil(l.kies(opties).then((v) => ({ t: "k" as const, v })));
  if (o.handje) {
    pas(l, { hulpKnop: true, hulpInVlak: true });
    const h = stil(l.wachtOpVlak("hulp").then(() => ({ t: "h" as const })));
    const r = await Promise.race([k, h]);
    pas(l, { hulpKnop: false, hulpInVlak: false });
    if (r.t === "h") {
      /* De keuzeknoppen blijven staan terwijl Bliepo de tip zegt. */
      await l.wijsAan("hulp", "Tel de hokjes op de tegel.", "Klopt dat met het getal?");
      await telHokjes(l, 0, n);
    }
  }
  return { k: (await k).v, waar: n === bewering };
}

/**
 * Een som snel beoordelen. De totaaltegel staat er al; klopt het antwoord
 * niet, dan bouwt het kind de delen ernaast en ziet het zelf.
 */
async function snelleSom(l: Lesgids, vak: Werkvlak, delen: number[], totaal: number) {
  const echt = optel(delen);
  const waar = echt === totaal;
  vak.zet([{ stukken: [totaal] }]);
  pas(l, { som: somRij(delen, totaal), bak: [] });
  await l.zeg(`${somWoorden(delen)} is {${totaal}}.`, "Is dat waar of niet waar?");
  const k = await l.kies(["Waar", "Niet waar"]);
  if (k !== null && (k === "Waar") === waar) {
    if (waar) vak.goed(0);
    await l.zeg("Dat klopt.", waar ? `${somWoorden(delen)} is {${totaal}}.` : `${somWoorden(delen)} is {${echt}}.`, waar ? "De som is *waar*." : "De som is *niet waar*.");
    await l.verder();
    return;
  }
  await l.zeg(k === null ? "Geen zorgen." : "Laat het me dan maar zien met de tegels.", `Zet ${opsomming(delen)} naast de {${totaal}}.`);
  pas(l, { bak: [...new Set(delen)] });
  await zetDelen(l, vak, 1, delen);
  pas(l, { bak: [] });
  /* Zoals Synthesis: na het bouwen komt de vraag nog één keer. */
  await l.zeg("Goed gewerkt met de tegels.", "Kijk naar de twee kanten.", "Is de som dan waar of niet waar?");
  const k2 = await l.kies(["Waar", "Niet waar"]);
  if (k2 !== null && (k2 === "Waar") === waar) {
    await l.zeg("Dat klopt.", waar ? "De som is *waar*." : "De som is *niet waar*.", "Dat heb je goed laten zien!");
  } else {
    await l.zeg(waar ? "Kijk, ze zijn even hoog." : echt > totaal ? "Kijk, de delen samen zijn hoger." : "Kijk, de delen samen zijn lager.", waar ? "Dus de som is *waar*." : "Dus de som is *niet waar*.");
  }
  await l.verder();
}

/** Zijn de twee torens even hoog? Geeft terug of het kind het goed zag. */
async function evenHoog(l: Lesgids, vraag: string, gelijk: boolean): Promise<boolean> {
  await l.zeg("Kijk naar de tegels.", vraag);
  const k = await l.kies(["Ja", "Nee"]);
  return k !== null && (k === "Ja") === gelijk;
}

/**
 * Eén tegel bij toren `i` zodat beide kanten gelijk zijn. Met `bak` staat het
 * handje erbij (zoals Synthesis): dan verschijnt de schaduw van de tegel waar
 * hij hoort, en worden de andere tegels in de bak dof.
 */
async function repareer(l: Lesgids, vak: Werkvlak, i: number, nodig: number, bak?: number[]) {
  let hulpAan = !!bak;
  /* Het vraagteken staat er pas als de les erop wacht; daarom eerst wachten, dan aanwijzen. */
  let vroeg: Promise<Vlakgebeurtenis> | null = null;
  if (hulpAan) {
    pas(l, { hulpKnop: true });
    vroeg = stil(l.wachtOpVlak(["tegel", "hulp"]));
    await l.wijsAan("weetniet", "Hulp nodig?", "Tik dan op het vraagteken.");
  }
  for (let fouten = 0; ; ) {
    let n: number;
    if (hulpAan) {
      const p = vroeg ?? stil(l.wachtOpVlak(["tegel", "hulp"]));
      vroeg = null;
      pas(l, { actief: true, hulpKnop: true });
      const g = await p;
      pas(l, { actief: false, hulpKnop: false });
      if (g.soort === "hulp") {
        hulpAan = false;
        pas(l, { hint: { toren: i, n: nodig }, slot: (bak ?? []).filter((t) => t !== nodig) });
        await l.zeg(`Zet de {${nodig}} hier.`);
        continue;
      }
      n = Number(g.n);
    } else {
      n = await pakTegel(l, ["Zet een tegel erbij.", "Dan zijn ze even hoog."]);
    }
    if (n === nodig) {
      pas(l, { hint: null, slot: [], hulpKnop: false });
      vak.leg(i, n);
      vak.goed(i);
      return;
    }
    await vak.evenLaten(i, n);
    fouten++;
    if (fouten === 1) await l.zeg("Hmm, dan zijn ze nog niet even hoog.", "Kijk hoeveel hokjes er missen.");
    else {
      pas(l, { hint: { toren: i, n: nodig } });
      await l.zeg(nodig === 1 ? "Er mist nog {1} hokje." : `Er missen nog {${nodig}} hokjes.`, `Pak de {${nodig}}.`);
    }
  }
}

const kloptDeSom: Lesdraaiboek = {
  id: "optellen-tot-10-klopt-de-som",
  titel: "Klopt de som?",
  synthesis: "Add within 10 · True or False",
  kaarttekening: KaartKlopt,

  async speel(l0) {
    const l = metUitleg(knoppenOpPlek(l0, TEGEL_KNOPPEN));
    const vak = new Werkvlak(l);
    l.vlak(HoloTegelvlak, { torens: [], bak: [] });
    await l.zeg(l.naam ? `${l.naam}, ken je de woorden *waar* en *niet waar*?` : "Ken je de woorden *waar* en *niet waar*?");
    const ken = await l.kies(["Ja", "Nee"]);

    /*
      Ja: een korte proef van drie vragen (INSPIRATIE R3): geen uitleg bij een
      fout, meteen de volgende. Alles goed: dan slaan we de losse tegels over.
    */
    let proefGoed = false;
    if (ken === "Ja") {
      await l.zeg("Mooi.", "Dan eerst drie snelle vragen.");
      const proef: [number, number, string][] = schud([
        [3, 3, "Dit is een {3}."],
        [8, 6, "Deze tegel is een {6}."],
        [7, 7, "Dit is een {7}."],
      ]);
      let goed = 0;
      for (const [n, bewering, zin] of proef) {
        const r = await tegelBewering(l, vak, n, bewering, zin, ["Waar", "Niet waar"]);
        if (r.k !== null && (r.k === "Waar") === r.waar) goed++;
      }
      proefGoed = goed === proef.length;
      if (proefGoed) await l.zeg("Alle drie goed!", "Dan gaan we meteen naar de sommen.");
      else await l.zeg("Goed geprobeerd.", "We oefenen het eerst samen.");
    } else {
      await l.zeg("Geen probleem.", "We oefenen eerst met tegels.");
    }

    /* 1. Waar en niet waar, bij losse tegels. */
    if (!proefGoed) {
      const b = await tegelBewering(l, vak, 1, 1, "Is dit een {1}?", ["Ja", "Nee"]);
      if (b.k === "Ja") await l.zeg("Ja.", "Dit *is* een {1}.", "Dat is dus *waar*.");
      else await l.zeg("Kijk, het is één hokje.", "Dit is een {1}.", "Dat is dus *waar*.");
      await l.verder();

      vak.zet([{ stukken: [2] }]);
      await l.zeg("En deze dan?", "Dit is een {3}, toch?");
      const k3 = await l.kies(["Ja", "Nee"]);
      if (k3 === "Nee") await l.zeg("Goed gezien.", "Dit is een {2}.", "Een {3} zeggen is dus *niet waar*.");
      else await l.zeg("Deze tegel is een {2}.", "Een {3} zeggen is dus *niet waar*.", "Want het klopt niet.");
      await l.verder();

      const spel: [number, number, string][] = [
        [8, 6, "Dit is een {6}."],
        [10, 10, "Dit is een {10}."],
        [5, 5, "Dit is een {5}."],
      ];
      for (const [n, bewering, zin] of spel) {
        const r = await tegelBewering(l, vak, n, bewering, zin, ["Waar", "Niet waar"], { handje: true });
        const goed = r.k !== null && (r.k === "Waar") === r.waar;
        if (goed && r.waar) {
          vak.goed(0);
          await l.zeg("Goed.");
        } else if (goed) {
          await l.zeg("Dat klopt.", `Dit is een {${n}}.`);
          await l.verder();
        } else {
          await l.zeg("Kijk nog eens goed.", `Dit is een {${n}}.`, r.waar ? "Dus het is *waar*." : "Dus het is *niet waar*.");
          await l.verder();
        }
      }
      await l.zeg("Dit kun je goed.", "Nu iets wat *een beetje* lastiger is.");
      await l.verder();
    }

    /* 2. 3 + 2 = 6: nagaan met tegels en repareren. */
    vak.zet([]);
    pas(l, { som: somRij([3, 2], 6) });
    await l.zeg("Kijk naar de som bovenaan.", "{3} plus {2} is {6}.", "Klopt dat?");
    let k = await l.kies(["Ja", "Nee"]);
    pas(l, { bak: [2, 3, 6] });
    await l.zeg(k === "Nee" ? "We gaan het na." : "", "In de som is het samen {6}.", "Zet de {6} in het rooster.");
    await zetDelen(l, vak, 0, [6]);
    await l.zeg("Dus {6} is alles samen.", "Zet nu de kleine delen erin.", "De {2} en de {3}.");
    await zetDelen(l, vak, 1, [2, 3]);
    if (await evenHoog(l, "Zijn {2} en {3} samen {6}?", false)) await l.zeg("Goed gezien.", "Er mist een hokje.");
    else await l.zeg("Hmm, kijk goed.", "Bij {2} en {3} mist een hokje.");
    pas(l, { bak: [1, 2, 3] });
    await l.zeg("Kun je er één tegel bij zetten?", "Dan zijn ze *wél* even hoog.");
    await repareer(l, vak, 1, 1);
    pas(l, { bak: [], som: somRij([2, 3, 1], 6) });
    await l.zeg("Ja, zo is het beter.", "{2} plus {3} plus {1} is {6}.", "Nu klopt de som!");
    await l.verder();

    /* 3. 5 + 6 = 11: de 11 met de 10 en de 1. */
    vak.zet([]);
    pas(l, { som: somRij([5, 6], 11) });
    await l.zeg("Hier is een nieuwe som.", "{5} plus {6} is {11}.", "Klopt dat?");
    k = await l.kies(["Ja", "Nee"]);
    pas(l, { bak: [1, 5, 6, 10] });
    await l.zeg(k === "Ja" ? "We gaan het na met tegels." : "We gaan het na.", "Samen is het {11}.", "Maak {11} met de {10} en de {1}.");
    await zetDelen(l, vak, 0, [10, 1]);
    await l.zeg("Zet nu de {5} en de {6} erin.", "Dan zien we of ze samen {11} maken.");
    await zetDelen(l, vak, 1, [5, 6], [["Dat is er één.", "Nu de andere."]]);
    pas(l, { bak: [] });
    if (await evenHoog(l, "Zijn {5} en {6} samen {11}?", true)) {
      vak.goed(1);
      await l.zeg("Ja.", "Deze som is dus *waar*.", "{5} plus {6} is {11}.");
    } else await l.zeg("Kijk, ze zijn even hoog.", "Deze som is dus *waar*.", "{5} plus {6} is {11}.");
    await l.verder();

    /* 4. 2 + 3 + 4 = 8: één te veel, de 8 wordt een 9. */
    vak.zet([]);
    pas(l, { som: somRij([2, 3, 4], 8) });
    await l.zeg("Nu een som met meer getallen.", "{2} plus {3} plus {4} is {8}.", "Is dat waar of niet waar?");
    await l.kies(["Waar", "Niet waar"]);
    pas(l, { bak: [2, 3, 4, 8] });
    await l.zeg("We gaan het na.", "Zet eerst de {8} erin.", "Dat is alles samen.");
    await zetDelen(l, vak, 0, [8]);
    await l.zeg("Zet nu alle kleine delen erin.", "De {2}, de {3} en de {4}.");
    await zetDelen(l, vak, 1, [2, 3, 4], [["Goed zo.", "Ga zo door."], ["Goed.", "Nog één."]]);
    if (await evenHoog(l, "Zijn {2}, {3} en {4} samen {8}?", false)) await l.zeg("Goed gezien.", "De kant met {2}, {3} en {4} is groter.");
    else await l.zeg("Hmm, ik weet het niet zo zeker.", "Die kant ziet er een beetje groter uit.");
    await l.verder();
    pas(l, { bak: [1, 2, 3, 4] });
    await l.zeg("Kun je één tegel bij de {8} zetten?", "Dan zijn beide kanten gelijk.");
    await repareer(l, vak, 0, 1, [1, 2, 3, 4]);
    pas(l, { bak: [], som: somRij([2, 3, 4], 9) });
    await l.zeg("Dat ziet er veel beter uit.", "Nu zijn beide kanten even groot.", "{2} plus {3} plus {4} is {9}.");
    await l.verder();

    /* 5. Snel, zonder slepen. Daarna kiest het kind: nog zo een, of moeilijker. */
    await l.zeg("Nu een paar snelle sommen.");
    await snelleSom(l, vak, [2, 7], 9);
    await snelleSom(l, vak, [4, 4], 9);
    await snelleSom(l, vak, [5, 3], 8);
    vak.zet([]);
    pas(l, { som: null });
    await l.zeg("Nog één, en dan stoppen we.", "Wil je er nog zo een?", "Of iets moeilijkers, met meer getallen?");
    const keuze = await l.kies(["Nog zo een", "Moeilijker"]);
    if (keuze === "Moeilijker") await snelleSom(l, vak, [1, 2, 3, 4], 10);
    else await snelleSom(l, vak, [3, 4], 8);

    /* Einde. */
    vak.zet([]);
    pas(l, { som: null, bak: [] });
    const tik = l.kaart();
    await l.zeg("Goed gedaan!", "Deze les is klaar.", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

/* ====================================================================== */
/* 4. Missing Numbers (LESSENPLAN O4)                                      */
/* ====================================================================== */

/** Een getal vragen; bij een fout zegt de les het antwoord en gaat door. */
async function vraagKort(l: Lesgids, juist: number, bijFout: string[]) {
  const x = await l.getal();
  if (x !== juist) await l.zeg(...bijFout);
}

/** a + ? = totaal. De totaaltegel ligt er; tegels mogen erop. */
async function ontbrekend(l: Lesgids, vak: Werkvlak, a: number, totaal: number, onder: number[], bak: number[], o: { kort?: boolean } = {}) {
  const n = totaal - a;
  vak.zet([{ onder, stukken: [] }]);
  pas(l, { bak, som: somRij([a, "?"], totaal), somAan: 2 });
  const goed = async () => {
    vak.zet([{ onder, stukken: zetIn([a], n) }]);
    vak.goed(0);
    pas(l, { som: somRij([a, n], totaal), somAan: null });
    await l.zeg(o.kort ? "Ja!" : "Je hebt het!", `{${a}} plus {${n}} is {${totaal}}.`);
    if (!o.kort) await l.zeg(`Het ontbrekende getal was {${n}}.`);
    await l.verder();
  };
  await l.zeg(`{${a}} plus hoeveel is {${totaal}}?`, ...(o.kort ? [] : ["Je mag de tegels gebruiken."]));
  let x = await getalMetTegels(l, vak);
  if (x === n) return goed();
  if (typeof x === "number") {
    await l.zeg(
      `Kijk, {${a}} plus {${x}} is {${a + x}}.`,
      Math.abs(a + x - totaal) === 1 ? "Dichtbij, maar net niet." : a + x < totaal ? "Dat is te weinig." : "Dat is te veel.",
    );
    await l.verder();
    await l.zeg(`Wat moet er bij de {${a}} om {${totaal}} te maken?`);
    x = await getalMetTegels(l, vak);
    if (x === n) return goed();
  }
  /* Hulp: het bekende deel ligt over het totaal; tel wat er nog te zien is. */
  vak.zet([{ onder, stukken: [a] }]);
  pas(l, { bak: bak.filter((t) => t !== a) });
  await l.zeg(x === null ? "Geen zorgen." : "Ik help je een beetje.", `Ik heb een {${a}} op de {${totaal}} gelegd.`, "Tel de hokjes die je nog ziet.");
  await l.verder();
  await l.zeg(`Wat moet er bij de {${a}} om {${totaal}} te maken?`);
  x = await l.getal();
  if (x !== n) {
    await telHokjes(l, 0, n, true);
    await l.zeg(n === 1 ? "Ik tel {1} hokje." : `Ik tel {${n}} hokjes.`, `Het ontbrekende getal is {${n}}.`);
    pas(l, { som: somRij([a, n], totaal), somAan: null });
    await l.verder();
    return;
  }
  return goed();
}

/** Een tegel op de grote tegel leggen, de som kiezen en de tegel zoeken die hem vult. */
async function opDeGrote(l: Lesgids, vak: Werkvlak, totaal: number, eerste: boolean) {
  let bak = reeks(1, totaal - 1);
  vak.zet([{ onder: [totaal], stukken: [] }]);
  pas(l, { bak, som: somRij(["?", "?"], totaal), somAan: null });
  if (eerste) await l.zeg("Nu leggen we er een tegel bovenop.", `Kies een tegel voor op de {${totaal}}.`);
  else await l.zeg(`Nu ligt er een {${totaal}}.`, "Leg er weer een tegel bovenop.");
  const k = await pakTegel(l, PAK_HULP, { hand: eerste });
  const nodig = totaal - k;
  vak.leg(0, k);
  pas(l, { som: somRij([k, "?"], totaal), somAan: 2 });
  await l.zeg("Kijk eens.", eerste ? "Je hebt een som met een *ontbrekend* getal gemaakt." : "Weer een som met een gat.", "Welke som is het?");
  const anderTotaal = k + 2 === totaal ? k + 1 : k + 2;
  const juist = `${k} + ? = ${totaal}`;
  const keuze = await l.kies(schud([juist, `${k} + ? = ${anderTotaal}`]));
  if (keuze === juist) {
    await l.zeg("Ja.", `{${k}} plus iets is {${totaal}}.`);
  } else {
    /* De vraag in stukjes: het totaal, het deel dat er ligt, en dan aanvullen. Het vakje van de som licht dan even niet op. */
    pas(l, { somAan: null });
    await l.zeg(keuze === null ? "Geen zorgen." : "Laten we er samen over nadenken.", "Hoeveel is het samen?", "Kijk naar de grote tegel.");
    await vraagKort(l, totaal, [`Kijk, de grote tegel is een {${totaal}}.`, `Samen is het dus {${totaal}}.`]);
    await l.zeg(`Welk getal heb je op de {${totaal}} gelegd?`);
    await vraagKort(l, k, [`Je hebt de {${k}} erop gelegd.`]);
    await l.zeg(`Er moet iets bij de {${k}}.`, `Dan is het samen {${totaal}}.`);
    pas(l, { somAan: 2 });
    await l.verder();
  }

  await l.zeg("Zoek het ontbrekende getal.", `Zet de tegel erbij die met {${k}} samen {${totaal}} maakt.`);
  for (let fouten = 0; ; ) {
    const w = await pakTegel(l, [`Welke tegel past bij de {${k}}?`]);
    if (w === nodig) {
      pas(l, { hint: null });
      vak.leg(0, w);
      vak.goed(0);
      break;
    }
    await vak.evenLaten(0, w);
    bak = bak.filter((t) => t !== w);
    pas(l, { bak });
    fouten++;
    if (fouten === 1) await l.zeg(`Hmm, dat maakt geen {${totaal}}.`, `Wat moet er bij de {${k}} om {${totaal}} te maken?`);
    else if (fouten === 2) await l.zeg(`{${k}} en {${w}} is samen {${k + w}}.`, k + w < totaal ? "Dat is te weinig." : "Dat is te veel.", "Zoek de tegel die precies past.");
    else {
      pas(l, { hint: { toren: 0, n: nodig } });
      await l.zeg(`Je hebt nog {${nodig}} nodig.`, `Pak de {${nodig}}.`);
    }
  }
  pas(l, { som: somRij([k, nodig], totaal), somAan: null });
  await l.zeg("Je hebt het!", eerste ? "Je hebt het ontbrekende getal gevonden." : "", `{${k}} plus {${nodig}} is {${totaal}}.`);
  await l.verder();
}

const ontbrekendGetal: Lesdraaiboek = {
  id: "optellen-tot-10-ontbrekend-getal",
  titel: "Het ontbrekende getal",
  synthesis: "Add within 10 · Missing Numbers",
  kaarttekening: KaartOntbrekend,

  async speel(l0) {
    const l = metUitleg(knoppenOpPlek(l0, TEGEL_KNOPPEN));
    const vak = new Werkvlak(l);
    const later = new Later();
    l.vlak(HoloTegelvlak, { torens: [{ onder: [7], stukken: [] }], bak: [] });

    /* 1. Welk getal is dit? (INSPIRATIE R3: 1× fout = "een beetje ernaast"; 2× fout = de 7 wordt gegeven.) */
    await l.zeg("We beginnen met een makkelijke.", "Welk getal is dit?");
    let x = await l.getal();
    if (x !== 7 && x !== null) {
      await l.zeg(Math.abs(x - 7) <= 1 ? "Je zit er een beetje naast." : "Hmm, dat is het niet.", "Welk getal zie je erin?");
      x = await l.getal();
      if (x !== 7) {
        await l.zeg("Het is een {7}.");
        await l.verder();
      }
    } else if (x === null) {
      await l.zeg("Het is een {7}.", "Dat zien we later.");
      await l.verder();
      later.bewaar(async () => {
        vak.zet([{ onder: [7], stukken: [] }]);
        pas(l, { bak: [], som: null });
        await l.zeg("Welk getal is dit?");
        const y = await l.getal();
        if (y === 7) await l.zeg("Ja, het is een {7}.");
        else {
          await telHokjes(l, 0, 7);
          await l.zeg("Het zijn {7} hokjes.", "Dus het is een {7}.");
          await l.verder();
        }
      });
    }

    /* 2. Een tegel bovenop de 7 (en daarna de 8): een som met een ontbrekend getal. */
    if (x === 7) await l.zeg("Ja, het is een {7}.");
    await opDeGrote(l, vak, 7, true);
    await opDeGrote(l, vak, 8, false);

    /* 3. 5 + ? = 9, en dan een rijtje zonder slepen (de tegels mogen helpen). */
    await ontbrekend(l, vak, 5, 9, [9], reeks(1, 9));
    await l.zeg("Nu een paar sommen achter elkaar.");
    const rijtje: [number, number][] = schud([
      [3, 8],
      [6, 10],
      [2, 7],
      [4, 9],
      [1, 6],
      [7, 10],
      [5, 8],
      [3, 6],
    ]);
    for (const [a, t] of rijtje) await ontbrekend(l, vak, a, t, [t], reeks(1, t), { kort: true });

    /* 4. Het kind kiest zelf de volgende som. */
    vak.zet([]);
    pas(l, { som: null, bak: [] });
    await l.zeg(l.naam ? `${l.naam}, je doet het best goed.` : "Je doet het best goed.", "Kies er zelf een.");
    const zelf = await l.kies(["4 + ? = 11", "2 + ? = 5"]);
    if (zelf === "4 + ? = 11") await ontbrekend(l, vak, 4, 11, [10, 1], reeks(2, 9));
    else await ontbrekend(l, vak, 2, 5, [5], reeks(1, 4));

    await later.speel(l);

    /* Einde. */
    vak.zet([]);
    pas(l, { som: null, bak: [] });
    const tik = l.kaart();
    await l.zeg("Klaar!", "Deze les is af.", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

/* ====================================================================== */
/* 5. Add Three Numbers (LESSENPLAN O5)                                    */
/* ====================================================================== */

/** De som met drie vakjes; ingevulde getallen in hun kleur, de rest een vraagteken. */
function drieSom(getallen: number[], totaal: number | null, leeg = "?"): Somdeel[] {
  const d = [0, 1, 2].map((i) => (getallen[i] !== undefined ? String(getallen[i]) : leeg));
  return somRij(d, totaal);
}

/** Het kind typt drie getallen, één voor één; het vakje dat aan de beurt is licht op. */
async function typDrie(l: Lesgids, totaal: number): Promise<number[] | null> {
  const getallen: number[] = [];
  for (let i = 0; i < 3; i++) {
    pas(l, { som: drieSom(getallen, totaal), somAan: i * 2 });
    const x = await l.getal();
    if (x === null) {
      pas(l, { som: drieSom([], totaal), somAan: null });
      return null;
    }
    getallen.push(x);
  }
  pas(l, { som: drieSom(getallen, totaal), somAan: null });
  return getallen;
}

/** Samen invullen: per vakje zegt de les welke tegel erbij hoort (van boven naar onder). */
async function samenInvullen(l: Lesgids, volgorde: number[], totaal: number) {
  const woord = ["Bovenaan", "Daaronder", "Onderaan"];
  const getallen: number[] = [];
  for (let i = 0; i < 3; i++) {
    const n = volgorde[i];
    pas(l, { som: drieSom(getallen, totaal), somAan: i * 2 });
    await l.zeg(`${woord[i]} ligt een {${n}}.`, i === 0 ? "Typ hem in het eerste vakje." : "Typ hem in het volgende vakje.");
    let pogingen = 0;
    while ((await l.getal()) !== n) {
      pogingen++;
      if (pogingen >= 2) break;
      await l.zeg(`Kijk goed: het is een {${n}}.`, `Typ de {${n}}.`);
    }
    getallen.push(n);
  }
  pas(l, { som: drieSom(getallen, totaal), somAan: null });
}

/**
 * Het kind vult een lege vorm van `totaal` met tegels, tot er `aantal` liggen
 * (of tot `stopBij`). Een tegel die niet meer past, verschijnt even en
 * verdwijnt. Met `hulp` staan "Weet ik niet" en het handje erbij; die geven `null`.
 */
async function vulVorm(l: Lesgids, vak: Werkvlak, totaal: number, aantal: number, o: { hulp?: boolean; stopBij?: number; wijs?: string[] } = {}): Promise<number[] | null> {
  const stop = o.stopBij ?? aantal;
  if (o.hulp) pas(l, { hulpKnop: true });
  let wijs = o.wijs;
  for (;;) {
    const stukken = vak.toren(0).stukken;
    if (stukken.length >= stop) {
      pas(l, { hulpKnop: false });
      return [...stukken];
    }
    /* Het handje is hier het vraagteken van `kies([])` op de vaste plek: allebei geven `null`. */
    const tegel = stil(l.wachtOpVlak("tegel").then((e) => (e.soort === "hulp" ? null : Number(e.n))));
    pas(l, { actief: true });
    const kiesVraag = o.hulp ? stil(l.kies([]).then(() => null)) : null;
    if (wijs && kiesVraag) {
      const zinnen = wijs;
      wijs = undefined;
      await l.wijsAan("weetniet", ...zinnen);
    }
    const n = kiesVraag ? await Promise.race([tegel, kiesVraag]) : await tegel;
    pas(l, { actief: false });
    if (n === null) {
      pas(l, { hulpKnop: false });
      return null;
    }
    const rest = totaal - optel(stukken) - n;
    const nogTegels = aantal - stukken.length - 1;
    if (rest < nogTegels || (nogTegels === 0 && rest !== 0)) {
      await vak.evenLaten(0, n);
      if (rest < 0) await l.zeg("Die is te groot voor de vorm.");
      else if (nogTegels === 0) await l.zeg("Dan blijft er een gat over.", "Zoek een tegel die precies past.");
      else await l.zeg(nogTegels === 1 ? "Dan past er geen tegel meer bij." : "Dan passen er geen twee tegels meer bij.", "Kies een kleinere tegel.");
      continue;
    }
    vak.leg(0, n);
  }
}

/** Het hulppad van Synthesis: drie getallen die samen 7 zijn, stap voor stap. */
async function drieSamen(l: Lesgids, vak: Werkvlak) {
  await l.zeg("Geen zorgen.", "Een som met drie getallen is lastig.", "We doen het samen.");
  await l.verder();
  vak.zet([{ omtrek: 7, stukken: [] }]);
  pas(l, { som: null, bak: reeks(1, 7) });
  await l.zeg("Ik heb een nieuwe vorm neergezet.", "Zet de tegel erin die precies past.");
  for (let fouten = 0; ; ) {
    const n = await pakTegel(l, ["Welke tegel is net zo groot als de vorm?"]);
    if (n === 7) {
      pas(l, { hint: null });
      vak.leg(0, 7);
      vak.goed(0);
      break;
    }
    await vak.evenLaten(0, n);
    fouten++;
    if (fouten >= 2) pas(l, { hint: { toren: 0, n: 7 } });
    await l.zeg(fouten === 1 ? (n < 7 ? "Die is te klein." : "Die is te groot.") : "", fouten === 1 ? "Zoek een tegel die de vorm helemaal vult." : "Pak de {7}.");
  }
  pas(l, { som: somRij(["?", "?", "?"], "?"), somAan: 6 });
  await l.zeg("Ja, die past precies.", "Typ dit getal achter het is-teken.");
  let x = await l.getal();
  if (x !== 7) {
    await telHokjes(l, 0, 7);
    await l.zeg("Het zijn {7} hokjes.", "Typ de {7}.");
    x = await l.getal();
  }
  pas(l, { som: drieSom([], 7), somAan: null });
  await l.zeg("Kijk nu naar de som.", "Hoeveel getallen ontbreken er?");
  x = await l.getal();
  await l.zeg(x === 3 ? "Ja." : "Tel de vakjes met een vraagteken: het zijn er {3:wit}.", "We zoeken dus *drie* getallen.", "Samen moeten ze {7} zijn.");
  await l.verder();

  vak.zet([{ omtrek: 7, stukken: [] }]);
  pas(l, { bak: reeks(1, 5) });
  await l.zeg("Zet een tegel in de vorm.", "Welke je maar wilt.");
  await vulVorm(l, vak, 7, 3, { stopBij: 1 });
  await l.zeg("Mooi zo.", "Zet er nu precies *twee* bij.", "Dan is de vorm helemaal vol.");
  const stukken = (await vulVorm(l, vak, 7, 3)) ?? [];
  pas(l, { bak: [] });
  vak.goed(0);
  await l.zeg("Prachtig neergelegd.", "Mooie kleuren ook!");
  await l.verder();
  const volgorde = [...stukken].reverse();
  await l.zeg("Nu vullen we de som in.");
  await samenInvullen(l, volgorde, 7);
  await l.zeg("Knap gedaan!", `${somWoorden(volgorde)} is {7}.`);
  await l.verder();
}

/** Een toren van drie tegels aflezen. Geeft terug of het kind iets miste. */
async function aflezen(l: Lesgids, vak: Werkvlak, toren: number[], eerste: boolean): Promise<boolean> {
  const totaal = optel(toren);
  const vanBoven = [...toren].reverse();
  const opbouw = async () => {
    for (let i = 1; i <= toren.length; i++) {
      vak.zet([{ stukken: toren.slice(0, i), rand: i === toren.length }]);
      await l.wacht(450);
    }
  };
  pas(l, { bak: [], som: drieSom([], totaal, "") });
  vak.zet([]);
  await opbouw();
  if (eerste) {
    await l.zeg(`Deze keer maak ik {${totaal}} met drie tegels.`);
    await l.verder();
    await l.zeg("Vul de som in.", "Hij moet bij de tegels passen.");
  } else {
    await l.zeg("Hier is nog een toren.", "Welke som hoort erbij?");
  }
  let gemist = false;
  let g = await typDrie(l, totaal);
  if (g && !zelfdeGroepen(g, toren)) {
    gemist = true;
    /* Bij een fout vliegen de tegels weg en wordt de toren opnieuw opgebouwd (LESSENPLAN O5). */
    await l.zeg("Hmm, laten we kijken.", "Deze getallen passen niet bij de tegels.");
    await l.verder();
    pas(l, { som: drieSom([], totaal) });
    vak.zet([]);
    await l.wacht(300);
    await opbouw();
    await l.zeg("We proberen het nog een keer.", "Vul de som in.");
    g = await typDrie(l, totaal);
  }
  if (!g || !zelfdeGroepen(g, toren)) {
    gemist = true;
    await l.zeg(g ? "We doen het samen." : "Geen zorgen, we doen het samen.", "We lezen de tegels van boven naar onder.");
    await samenInvullen(l, vanBoven, totaal);
    g = vanBoven;
  }
  vak.goed(0);
  await l.zeg("Ja, je hebt het!", `${somWoorden(g)} is {${totaal}}.`);
  await l.verder();
  return gemist;
}

/** Een lege vorm met drie tegels vullen, en dan de som. Geeft terug of het kind iets miste. */
async function vulEnSom(l: Lesgids, vak: Werkvlak, totaal: number, eerste: boolean): Promise<boolean> {
  vak.zet([{ omtrek: totaal, stukken: [] }]);
  pas(l, { som: drieSom([], totaal), somAan: null, bak: reeks(1, Math.min(9, totaal - 2)) });
  await l.zeg(eerste ? "Zet drie tegels in deze vorm." : "Hier is een nieuwe vorm.", `Samen moeten ze {${totaal}} zijn.`);
  const gevuld = await vulVorm(l, vak, totaal, 3, { hulp: eerste, wijs: eerste ? ["Vind je het lastig?", "Tik dan op het vraagteken."] : undefined });
  if (!gevuld) {
    await drieSamen(l, vak);
    return true;
  }
  pas(l, { bak: [] });
  vak.goed(0);
  await l.zeg("Mooi, de vorm is vol!", "Vul nu de som in.");
  const h = await typDrie(l, totaal);
  const volgorde = [...gevuld].reverse();
  let gemist = false;
  if (h && zelfdeGroepen(h, gevuld)) {
    await l.zeg("Helemaal goed.", `${somWoorden(h)} is {${totaal}}.`);
  } else {
    gemist = true;
    await l.zeg(h ? "Hmm, die passen niet bij jouw tegels." : "Geen zorgen.", "We doen het samen.");
    await samenInvullen(l, volgorde, totaal);
    await l.zeg("Ja.", `${somWoorden(volgorde)} is {${totaal}}.`);
  }
  await l.verder();
  return gemist;
}

const drieGetallen: Lesdraaiboek = {
  id: "optellen-tot-10-drie-getallen",
  titel: "Drie getallen optellen",
  synthesis: "Add within 10 · Add Three Numbers",
  kaarttekening: KaartDrie,

  async speel(l0) {
    const l = metUitleg(knoppenOpPlek(l0, TEGEL_KNOPPEN));
    const vak = new Werkvlak(l);
    let gemist = 0;
    const later = new Later();
    l.vlak(HoloTegelvlak, { torens: [], bak: [], som: drieSom([], 10, "") });

    /* 1. Drie torens van drie tegels aflezen (de eerste maakt 10, zoals Synthesis). */
    const torens = [kies1([[3, 5, 2], [7, 1, 2], [5, 1, 4]]), kies1([[2, 4, 1], [4, 2, 2]]), kies1([[1, 3, 5], [6, 1, 1]])];
    for (const [i, toren] of torens.entries()) if (await aflezen(l, vak, toren, i === 0)) gemist++;

    /* 2. Een lege vorm met drie tegels vullen (eerst 9, dan 8). */
    if (await vulEnSom(l, vak, 9, true)) gemist++;
    if (await vulEnSom(l, vak, 8, false)) gemist++;

    /* 3. Snel: alleen de vorm en drie vakjes. */
    const voorbeeld: Record<number, number[]> = { 5: [2, 2, 1], 6: [3, 2, 1], 7: [4, 2, 1], 8: [4, 3, 1], 9: [4, 3, 2], 10: [5, 3, 2] };
    await l.zeg("Nu zonder tegels.", "Ik zet alleen de vorm neer.");
    for (const [i, totaal] of [6, 9, 8, 7, 10, 5, 9, 8].entries()) {
      vak.zet([{ omtrek: totaal, stukken: [] }]);
      pas(l, { som: drieSom([], totaal), bak: [] });
      await l.zeg(i === 0 ? "Vul de som in." : "Nog een.", `Samen moet het {${totaal}} zijn.`);
      let poging = await typDrie(l, totaal);
      const klopt = (p: number[] | null) => !!p && p.every((n) => n >= 1) && optel(p) === totaal;
      if (poging && !klopt(poging)) {
        gemist++;
        if (poging.some((n) => n < 1)) await l.zeg("Bijna.", "Elk getal moet minstens {1} zijn.");
        else await l.zeg("Bijna.", `${somWoorden(poging)} is {${optel(poging)}}.`, `We zoeken {${totaal}}.`);
        await l.zeg("Probeer het nog een keer.");
        poging = await typDrie(l, totaal);
      }
      if (poging && klopt(poging)) {
        /* De getallen vallen als tegels in de vorm. */
        vak.zet([{ omtrek: totaal, stukken: poging.reduce<number[]>((a, n) => zetIn(a, n), []) }]);
        vak.goed(0);
        await l.zeg(totaal === 8 ? "Raak!" : "Helemaal goed.", `${somWoorden(poging)} is {${totaal}}.`);
      } else {
        const v = voorbeeld[totaal];
        vak.zet([{ omtrek: totaal, stukken: v.reduce<number[]>((a, n) => zetIn(a, n), []) }]);
        pas(l, { som: drieSom(v, totaal) });
        if (!poging) {
          gemist++;
          await l.zeg("Geen zorgen, kijk eens.", `${somWoorden(v)} is {${totaal}}.`, "Dat zien we later.");
          later.bewaar(async () => {
            vak.zet([{ omtrek: totaal, stukken: [] }]);
            pas(l, { som: drieSom([], totaal), bak: [] });
            await l.zeg("Vul de som in.", `Samen moet het {${totaal}} zijn.`);
            const p = await typDrie(l, totaal);
            if (klopt(p)) {
              vak.zet([{ omtrek: totaal, stukken: p!.reduce<number[]>((a, n) => zetIn(a, n), []) }]);
              vak.goed(0);
              await l.zeg("Ja, nu lukt het!", `${somWoorden(p!)} is {${totaal}}.`);
            } else {
              vak.zet([{ omtrek: totaal, stukken: v.reduce<number[]>((a, n) => zetIn(a, n), []) }]);
              pas(l, { som: drieSom(v, totaal) });
              await l.zeg("Kijk, zo kan het.", `${somWoorden(v)} is {${totaal}}.`);
            }
            await l.verder();
          });
        } else await l.zeg("Kijk, zo kan het.", `${somWoorden(v)} is {${totaal}}.`);
      }
      await l.verder();
    }

    await later.speel(l);

    /* Einde. */
    vak.zet([]);
    pas(l, { som: null, bak: [] });
    const tik = l.kaart();
    if (gemist === 0) await l.zeg(metNaam(l, "Knap gedaan"), "Sommen met drie getallen kun je al.", "Tik op de kaart om hem af te vinken.");
    else await l.zeg("Goed gewerkt.", "Volgende keer gaat het vast nog beter.", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

/* ====================================================================== */
/* 6. Splitting Sums (LESSENPLAN S1)                                       */
/* ====================================================================== */

const ps = (l: Lesgids, p: Partial<Parelprops>) => l.pasVlakAan<Parelprops>(p);

/** Wat de parels laten zien, en een teller om ze opnieuw te beginnen. */
class Parelstand {
  sleutel = 0;
  constructor(private l: Lesgids) {}
  /** Opnieuw beginnen met deze groepjes. */
  zet(start: number[], extra: Partial<Parelprops> = {}) {
    this.sleutel++;
    ps(this.l, { start, sleutel: this.sleutel, doel: null, tel: 0, ...extra });
  }
}

/** Wacht tot de parels er zo uitzien. */
async function wachtTot(l: Lesgids, past: (g: number[]) => boolean, hulp?: string[]): Promise<number[]> {
  for (;;) {
    const e = stil(l.wachtOpVlak("verander"));
    ps(l, { actief: true });
    const g = (hulp ? await metHulp(l, e, hulp, 20000) : await e).groepen as number[];
    if (past(g)) return g;
  }
}

/** De mascotte telt de parels, één voor één. */
async function telParels(l: Lesgids, n: number) {
  for (let i = 1; i <= n; i++) {
    ps(l, { tel: i });
    await l.wacht(420);
  }
  await l.wacht(300);
}

/**
 * Het kind maakt deze groepjes. Duurt het lang, dan biedt de les hulp aan:
 * tik op de pijl, dan zet hij de parels goed.
 */
async function maakGroepen(l: Lesgids, stand: Parelstand, doel: number[]) {
  const past = stil(l.wachtOpVlak("past").then(() => "past" as const));
  ps(l, { doel, actief: true });
  let r = await Promise.race([past, l.wacht(45000).then(() => "tijd" as const)]);
  if (r === "tijd") {
    await l.zeg("Hier is een beetje hulp, als je wilt.", "Probeer het zelf, of tik op de pijl.", "Dan zet ik de parels goed.");
    r = await Promise.race([past, l.verder().then(() => "tijd" as const)]);
    if (r === "tijd") {
      stand.zet(doel, { actief: false });
      await l.wacht(600);
    }
  }
  ps(l, { doel: null, actief: false });
}

/** Lukt het om deze som met de parels te maken? Het vlak ziet het zelf, of het kind zegt "Het lukt niet". */
async function probeer(l: Lesgids, doel: number[]): Promise<"past" | "lukt niet"> {
  const past = stil(l.wachtOpVlak("past").then(() => "past" as const));
  ps(l, { doel, actief: true });
  const knop = stil(l.kies(["Het lukt niet"]).then(() => "lukt niet" as const));
  const r = await Promise.race([past, knop]);
  ps(l, { doel: null, actief: false });
  return r;
}

/**
 * Het kind kiest één som uit de lijst. `wel`: die je wél kunt maken met `n`,
 * anders die je níet kunt maken. Geeft terug of het meteen goed was.
 */
async function welkeSom(l: Lesgids, stand: Parelstand, n: number, opties: string[], wel: boolean): Promise<boolean> {
  stand.zet([n], { knoppen: true, tik: "eraf", actief: true });
  await l.zeg(wel ? `Welke som kun je maken met {${n}}?` : `Welke som kun je *niet* maken met {${n}}?`);
  const kan = (o: string) => optel(losse(o)) === n;
  const k = await l.kies(schud(opties));
  ps(l, { actief: false });
  if (k !== null && kan(k) === wel) {
    await l.zeg("Precies goed.");
    return true;
  }
  if (k === null) {
    const juist = opties.find((o) => kan(o) === wel) ?? opties[0];
    await l.zeg("Geen zorgen.", `${somWoorden(losse(juist))} is samen {${optel(losse(juist))}}.`, wel ? "Die kun je maken." : "Die kun je *niet* maken.");
    await l.verder();
    return false;
  }
  const delen = losse(k);
  await l.zeg("Laten we het zelf bekijken.", wel ? `Probeer ${somWoorden(delen)} te maken.` : `Maak ${somWoorden(delen)} met de parels.`);
  const r = await probeer(l, delen);
  if (wel) {
    const s = optel(delen);
    await l.zeg(r === "past" ? "Kijk eens." : "Klopt, dat lukt niet.", `${somWoorden(delen)} is samen {${s}}.`, s > n ? `We hebben maar {${n}} parels.` : `Dan blijven er parels over.`);
  } else {
    if (r === "lukt niet") {
      stand.zet(delen);
      await l.zeg("Kijk, zo kan het wel.");
    }
    await l.zeg("Je kunt die toch maken.", "We zochten welke *niet* kan.");
  }
  await l.verder();
  return false;
}

/**
 * Er zijn `aantal` goede sommen; het kind kiest ze één voor één. Een gekozen
 * som komt met een vinkje of kruisje in het lijstje. Geeft terug of het
 * zonder fouten ging.
 */
async function kiesMeerdere(l: Lesgids, stand: Parelstand, n: number, opties: string[], aantal: number, zinnen: string[]): Promise<boolean> {
  stand.zet([n], { knoppen: true, tik: "eraf", actief: true, lijst: [] });
  const kan = (o: string) => optel(losse(o)) === n;
  const lijst: { som: string; teken?: "goed" | "fout" }[] = [];
  let over = schud(opties);
  let goed = 0;
  let foutloos = true;
  await l.zeg(...zinnen, `Er zijn er ${aantal === 2 ? "*twee*" : "*drie*"}.`, "Kies er eerst één.");
  while (goed < aantal) {
    ps(l, { actief: true });
    const k = await l.kies(over);
    if (k === null) {
      foutloos = false;
      for (const o of over.filter(kan)) lijst.push({ som: o, teken: "goed" });
      ps(l, { lijst: [...lijst], actief: false });
      await l.zeg("Geen zorgen.", aantal === 2 ? "Deze twee kun je maken." : "Deze drie kun je maken.");
      await l.verder();
      break;
    }
    over = over.filter((o) => o !== k);
    if (kan(k)) {
      goed++;
      lijst.push({ som: k, teken: "goed" });
      ps(l, { lijst: [...lijst] });
      if (goed < aantal) await l.zeg("Ja, die kan.", goed === aantal - 1 ? "Nog één." : "Kies er nog één.");
    } else {
      foutloos = false;
      lijst.push({ som: k, teken: "fout" });
      ps(l, { lijst: [...lijst] });
      await l.zeg("Die kan niet.", `${somWoorden(losse(k))} is samen {${optel(losse(k))}}.`, "Kies een andere.");
    }
  }
  ps(l, { actief: false });
  if (foutloos) await l.zeg("Goed gedaan!", aantal === 2 ? "Je hebt ze allebei gevonden." : "Je hebt ze alle drie gevonden.");
  else if (goed === aantal) await l.zeg("Nu heb je ze allemaal.");
  await l.verder();
  ps(l, { lijst: [] });
  return foutloos;
}

/** De hulples van Synthesis: tellen, uit elkaar, samen, splitsen, en drie uitdagingen. */
async function splitsHulp(l: Lesgids, stand: Parelstand) {
  await l.zeg("Een getal splitsen kan lastig zijn.", "We kijken er samen naar.");
  await l.verder();

  stand.zet([6], { getallen: false, tik: "breek", knoppen: false, actief: false });
  await l.zeg("Hoeveel parels zijn er?");
  let k = await l.kies(["4", "5", "6", "7"]);
  if (k !== "6" && k !== null) {
    await l.zeg("Niet helemaal.", "Misschien heb je je vergist.", "Tel nog eens.");
    const fout = k;
    k = await l.kies(["4", "5", "6", "7"].filter((o) => o !== fout));
  }
  if (k !== "6") {
    await l.zeg("We tellen samen.");
    await telParels(l, 6);
    await l.zeg("Het zijn {6} parels.");
  } else {
    await l.zeg("Je hebt het.", "{6} parels.");
  }
  ps(l, { getallen: true, tel: 0 });
  await l.verder();

  await l.zeg("Tik op de groep parels.", "Kijk wat er gebeurt.");
  await wachtTot(l, (g) => g.length === 6, ["Tik op de parels."]);
  ps(l, { actief: false });
  await l.zeg("Goed zo.", "Hebben we nog evenveel parels?");
  const evenveel = await l.kies(["Ja", "Nee"]);
  if (evenveel === "Ja") {
    await l.zeg("Precies.", "Nog steeds {6} parels.");
  } else {
    await l.zeg("We tellen ze.", "Hoeveel parels zijn er?");
    const t = await l.kies(["4", "5", "6", "7"]);
    if (t !== "6") await telParels(l, 6);
    await l.zeg(t === "6" ? "Precies, {6} parels." : "Het zijn {6} parels.", "Dus nog evenveel.");
    ps(l, { tel: 0 });
  }
  await l.verder();

  ps(l, { knoppen: true, tik: "eraf" });
  await l.wijsAan("samen", "Met deze knop gaan alle parels weer bij elkaar.", "Tik erop.");
  await wachtTot(l, (g) => g.length === 1, ["Tik op de knop met de parels in een rondje."]);
  await l.zeg("Ze zijn weer samen.", "Tik nu één keer op de parels.");
  await wachtTot(l, (g) => zelfdeGroepen(g, [5, 1]), ["Tik op de knop met het rondje.", "Tik dan één keer op de parels."]);
  ps(l, { actief: false });
  await l.zeg("Goed zo!", "Je hebt {6} gesplitst in {5} en {1}.");
  await l.verder();
  await l.zeg("Tik nog eens op de groep van {5}.");
  await wachtTot(l, (g) => zelfdeGroepen(g, [4, 1, 1]), ["Tik op de groep van {5}."]);
  ps(l, { actief: false });
  await l.zeg("Nu hebben we {4} plus {1} plus {1}.");
  await l.verder();
  await l.zeg("Nu gaan we slepen.", "Sleep de twee losse parels naar elkaar.");
  await wachtTot(l, (g) => zelfdeGroepen(g, [4, 2]), ["Sleep een losse parel op de andere losse parel.", "Is er maar één losse parel? Tik dan eerst op de grote groep."]);
  ps(l, { actief: false });
  await l.zeg("Mooi gesleept!", "{4} en {2}.");
  await l.verder();
  await l.zeg("Hebben we nog steeds {6} parels?");
  const nog = await l.kies(["Ja", "Nee"]);
  ps(l, { lijst: [{ som: "1 + 1 + 1 + 1 + 1 + 1" }, { som: "5 + 1" }, { som: "4 + 1 + 1" }, { som: "4 + 2" }] });
  await l.zeg(nog === "Ja" ? "Ja!" : "Kijk, het zijn er nog steeds {6}.", "Dit hebben we allemaal gemaakt.", "Het blijft steeds {6}.");
  await l.verder();
  ps(l, { lijst: [] });

  /* Drie uitdagingen met 8 parels. */
  await l.zeg(l.naam ? `Oké, ${l.naam}.` : "Oké.", "Nu ga je het zelf gebruiken.");
  stand.zet([8], { knoppen: true, tik: "eraf", actief: false });
  await l.zeg("Uitdaging 1.", "Maak van de {8} allemaal losse parels.");
  await l.wijsAan("los", "Deze knop maakt alle parels los.");
  await maakGroepen(l, stand, Array<number>(8).fill(1));
  await l.zeg("Uitdaging 2.", "Maak {3} plus {5}.");
  await maakGroepen(l, stand, [3, 5]);
  await l.zeg("Uitdaging 3.", "Maak {2} plus {1} plus {3} plus {2}.");
  await maakGroepen(l, stand, [2, 1, 3, 2]);
  await l.zeg("Knap gedaan!", "Hebben we nog steeds {8} parels?");
  const acht = await l.kies(["Ja", "Nee"]);
  await l.zeg(acht === "Ja" ? "Helemaal goed." : "Tel maar: het zijn er nog steeds {8}.");
  await l.verder();
}

/** De oefenronde na een fout in de controle: elke som uitproberen met de parels. */
async function splitsOefenronde(l: Lesgids, stand: Parelstand) {
  const sommen = schud(["2 + 3 + 2", "3 + 2 + 1", "2 + 2 + 2", "1 + 1 + 1 + 2"]);
  const lijst: { som: string; teken?: "goed" | "fout" }[] = sommen.map((som) => ({ som }));
  stand.zet([6], { knoppen: true, tik: "eraf", actief: false, lijst: [...lijst] });
  await l.zeg("Nu hebben we {6} parels.", "We zoeken samen uit welke sommen je kunt maken.");
  await l.verder();
  for (let i = 0; i < sommen.length; i++) {
    const delen = losse(sommen[i]);
    const kan = optel(delen) === 6;
    await l.zeg(i === 0 ? "We beginnen met de eerste som." : i === sommen.length - 1 ? "Tot slot de laatste som." : "Nu de volgende som.", `Maak ${somWoorden(delen)} met de parels.`);
    const r = await probeer(l, delen);
    if (r === "past") {
      lijst[i].teken = "goed";
      ps(l, { lijst: [...lijst] });
      await l.zeg("Ja, die kun je maken!");
    } else if (!kan) {
      lijst[i].teken = "fout";
      ps(l, { lijst: [...lijst] });
      await l.zeg("Precies.", `${somWoorden(delen)} is samen {${optel(delen)}}.`, "Die kun je niet maken met {6}.");
    } else {
      stand.zet(delen, { knoppen: true, tik: "eraf", lijst: [...lijst] });
      lijst[i].teken = "goed";
      ps(l, { lijst: [...lijst] });
      await l.zeg("Kijk, deze kan wel.", "Zo ziet het eruit.");
    }
    await l.verder();
    stand.zet([6], { knoppen: true, tik: "eraf", actief: false, lijst: [...lijst] });
  }
  await kiesMeerdere(l, stand, 6, sommen, 2, ["Welke sommen kun je maken met {6}?"]);
  await l.zeg("Nu is het jouw beurt.");
  await kiesMeerdere(l, stand, 5, ["2 + 1 + 3", "3 + 1 + 1", "1 + 1 + 1 + 1", "1 + 2 + 2"], 2, ["Welke sommen kun je maken met {5}?", "Probeer ze uit met de parels."]);
}

const splitsen: Lesdraaiboek = {
  id: "optellen-tot-10-splitsen",
  titel: "Splitsen in delen",
  synthesis: "Add within 10 · Splitting Sums",
  kaarttekening: KaartStippen,

  async speel(l0) {
    const l = metUitleg(knoppenOpPlek(l0, TEGEL_KNOPPEN));
    const stand = new Parelstand(l);
    l.vlak(HoloParels, { start: [7], sleutel: 0, getallen: true, tik: "breek" });

    /* 1. Ontdekken: tik, en de groep valt uit elkaar. */
    await l.zeg("Kijk naar deze {7} parels.", "Tik erop.", "Kijk wat er gebeurt.");
    await wachtTot(l, (g) => g.length === 7, ["Tik op de parels."]);
    ps(l, { actief: false });
    await l.zeg("Wauw!", "De groep is uit elkaar gesprongen.", "Kijk wat je er nog meer mee kunt.");
    await l.verder();

    ps(l, { tik: "eraf" });
    await l.zeg("Sleep parels naar elkaar toe.", "Zo maak je groepjes.", "Tik op een groepje, dan springt er een parel af.");
    let samengevoegd = 0;
    let vorige = 7;
    while (samengevoegd < 2) {
      const g = await wachtTot(l, () => true, ["Sleep een parel op een andere parel."]);
      if (g.length < vorige) samengevoegd++;
      vorige = g.length;
    }
    ps(l, { actief: false });
    await l.zeg("Mooi!", "Tik op de pijl als je klaar bent.");
    await l.verder();

    /* Twee keer zelf iets maken met 7 parels, met de knoppen erbij. */
    stand.zet([7], { tik: "eraf", knoppen: true, actief: false });
    await l.wijsAan("los", "Met deze knop worden alle parels los.");
    await l.wijsAan("samen", "En met deze gaan ze weer bij elkaar.");
    await l.zeg("Maak {4} plus {3}.");
    await maakGroepen(l, stand, [4, 3]);
    await l.zeg("Goed zo!", "Maak nu {2} plus {2} plus {3}.");
    await maakGroepen(l, stand, [2, 2, 3]);
    await l.zeg("Knap!", "Het zijn nog steeds {7} parels.");
    stand.zet([7], { tik: "eraf", knoppen: true, actief: false });
    await l.zeg("Oké.", "Nu een moeilijke opdracht.");

    /* 2. Welke som kun je maken met 7? En met 8. */
    ps(l, { actief: true });
    await l.zeg("Welke som kun je maken met {7}?", "Je mag de parels gebruiken.");
    const k1 = await l.kies(schud(["1 + 3 + 2 + 1", "3 + 2 + 2 + 1", "2 + 1 + 2 + 1"]));
    ps(l, { actief: false });
    let hulp = false;
    stand.zet([8], { tik: "eraf", knoppen: true, actief: true });
    if (k1 === "1 + 3 + 2 + 1") {
      await l.zeg("Goed zo!", "{1} plus {3} plus {2} plus {1} is {7}.");
      await l.verder();
      await l.zeg("Nu hebben we {8} parels.", "Welke som kun je maken met {8}?");
      const k2 = await l.kies(schud(["1 + 4 + 2 + 1", "2 + 3 + 2 + 2", "3 + 2 + 1 + 1"]));
      ps(l, { actief: false });
      if (k2 === "1 + 4 + 2 + 1") await l.zeg("Ja!", "{1} plus {4} plus {2} plus {1} is {8}.");
      else if (k2 !== null) await l.zeg("Dat ziet er niet helemaal goed uit.", `${somWoorden(losse(k2))} is samen {${optel(losse(k2))}}.`, "{1} plus {4} plus {2} plus {1} is {8}.");
      else await l.zeg("Geen zorgen.", "{1} plus {4} plus {2} plus {1} is {8}.");
      await l.verder();
    } else if (k1 === null) {
      hulp = true;
    } else {
      await l.zeg("Dat ziet er niet helemaal goed uit.", `${somWoorden(losse(k1))} is samen {${optel(losse(k1))}}.`, "We hebben {7} parels.");
      await l.verder();
      await l.zeg("We proberen het nog een keer.", "Nu hebben we {8} parels.", "Welke som kun je maken met {8}?");
      const k2 = await l.kies(schud(["1 + 4 + 2 + 1", "2 + 3 + 2 + 2", "3 + 2 + 1 + 1"]));
      ps(l, { actief: false });
      if (k2 === "1 + 4 + 2 + 1") {
        await l.zeg("Goed zo!", "{1} plus {4} plus {2} plus {1} is {8}.");
        await l.verder();
      } else {
        if (k2 !== null) await l.zeg(`${somWoorden(losse(k2))} is samen {${optel(losse(k2))}}.`, "Dat is niet {8}.");
        hulp = true;
      }
    }
    if (hulp) await splitsHulp(l, stand);

    /* 3. De controle: welke wel, welke niet, welke drie. */
    let foutloos = true;
    foutloos = (await welkeSom(l, stand, 7, ["2 + 1 + 2 + 1", "1 + 3 + 2 + 1", "3 + 2 + 2 + 1", "2 + 2 + 1 + 1"], true)) && foutloos;
    foutloos = (await welkeSom(l, stand, 7, ["1 + 2 + 2 + 2", "2 + 1 + 3 + 1", "2 + 3 + 2 + 1", "2 + 2 + 2 + 1"], false)) && foutloos;
    await l.zeg("Nu denken we andersom.");
    foutloos = (await welkeSom(l, stand, 8, ["3 + 1 + 2 + 2", "2 + 2 + 2 + 2", "2 + 3 + 2 + 2", "1 + 2 + 2 + 3"], false)) && foutloos;
    foutloos = (await welkeSom(l, stand, 6, ["2 + 2 + 1 + 1", "3 + 2 + 2", "1 + 1 + 2 + 3", "2 + 3 + 2"], true)) && foutloos;
    foutloos = (await welkeSom(l, stand, 9, ["3 + 3 + 3", "4 + 2 + 3", "2 + 2 + 2 + 2", "5 + 2 + 2"], false)) && foutloos;
    foutloos =
      (await kiesMeerdere(l, stand, 7, ["2 + 2 + 1 + 1 + 1", "3 + 1 + 2 + 1", "1 + 2 + 1 + 2 + 1", "2 + 3 + 2 + 1"], 3, ["Tot slot: welke sommen kun je maken met {7}?"])) &&
      foutloos;

    /* Een fout in de controle: eerst oefenen, dan de controle nog één keer met andere sommen. */
    if (!foutloos) {
      await splitsOefenronde(l, stand);
      await welkeSom(l, stand, 8, ["1 + 3 + 2 + 1", "3 + 2 + 2 + 2", "2 + 1 + 2 + 2", "2 + 2 + 1 + 3"], true);
      await welkeSom(l, stand, 8, ["2 + 2 + 2 + 2", "1 + 2 + 2 + 3", "3 + 1 + 2 + 2", "2 + 3 + 2 + 2"], false);
      await kiesMeerdere(l, stand, 7, ["1 + 2 + 1 + 2 + 1", "2 + 3 + 2 + 1", "3 + 1 + 2 + 1", "2 + 2 + 1 + 1 + 1"], 3, ["Welke sommen kun je maken met {7}?"]);
    }

    /* Einde. */
    l.vlak(null);
    l.bak([]);
    const tik = l.kaart();
    await l.zeg("Goed gedaan!", "Je snapt hoe je een getal splitst.", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

/* ====================================================================== */
/* 7. Mastery Check                                                        */
/* ====================================================================== */

const eindtoets: Lesdraaiboek = {
  id: "optellen-tot-10-eindtoets",
  titel: "Eindtoets: optellen tot 10",
  synthesis: "Add within 10 · Mastery Check",
  kaarttegels: [3, 1],
  speel: (l) => toetsOptellen(l, "eind"),
};

export const LESSEN_OPTELLEN_TOT_10: Lesdraaiboek[] = [instaptoets, dubbelen, kloptDeSom, ontbrekendGetal, drieGetallen, splitsen, eindtoets];
