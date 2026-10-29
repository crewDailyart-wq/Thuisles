/**
 * Lessen van het onderdeel Optellen tot 20 — naar Synthesis "Add up to 20"
 * (INSPIRATIE.md, ronde 1, 2 en 3). Groep 3. Zie ../soort.ts, ../BOUWEN.md en
 * ../BOUWEN-PHASER.md; LESSENPLAN.md O11–O15.
 *
 * 1. Instaptoets: de 10-tegel herkennen, 10 + een zelfgekozen tegel, 10 + 7, 10 + 5;
 *    daarna nog even oefenen (10 + n), samen minstens 15 opgaven.
 * 2. Optellen bij 10: snelle reeks 10 + n (15 sommen), met de valkuil "achter
 *    elkaar geschreven" (10 en 5 wordt 105).
 * 3. Over de 10 heen: twee liggende tegels vergelijken met een liggende 10, en de 10
 *    aanvullen tot ze even lang zijn (9 + 4 is evenveel als 10 + 3); daarna 12 sommen.
 * 4. Bijna dubbel: dubbel 5 en één erbij is 5 + 6; voor- en natoets van drie sommen.
 * 5. Eindtoets: alles uit de unit, en het tempo telt mee (zonder klok in beeld);
 *    daarna nog even oefenen, samen minstens 15 opgaven.
 *
 * Sinds 27 oktober 2026 spelen alle vijf in Phaser (HARDE REGEL 7): de tegels
 * zijn hologrammen vóór de blauwe ruimte (vlakken/optellen20-holo-tegels.tsx),
 * met grote cijferknoppen, het vraagteken en het vinkje onderaan.
 *
 * Bij een fout eerst een vriendelijke hint (de denkfout benoemen, of minder
 * keuzes), bij de tweede keer doet Bliepo het voor en komt de som later terug.
 * Een tegel die niet past, verdwijnt weer zonder het woord "fout".
 */

import type { Lesdraaiboek, Lesgids, Somdeel } from "../soort";
import { Lijntegel } from "../vlakken/optellen20-tegelbord";
import { MIDDEN_KOLOM } from "../vlakken/optellen20-holo-maten";
import {
  Optellen20HoloTegels,
  type Holo20Melding,
  type Holo20Props,
  type HoloDoel,
  type HoloStrook,
} from "../vlakken/optellen20-holo-tegels";

/* ---------- hulpjes (ook gebruikt door andere onderdelen; niet veranderen) ---------- */

export function schud<T>(lijst: T[]): T[] {
  const uit = [...lijst];
  for (let i = uit.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [uit[i], uit[j]] = [uit[j], uit[i]];
  }
  return uit;
}

/** Unieke getallen, in een willekeurige volgorde. */
export function opties(...getallen: number[]): number[] {
  return schud([...new Set(getallen.filter((g) => g >= 0))]);
}

export async function kiesGetal(l: Lesgids, lijst: number[]): Promise<number | null> {
  const k = await l.kies(lijst.map(String));
  return k === null ? null : Number(k);
}

/** "a + b = c" voor de balk bovenaan; zonder c een leeg vakje. */
export function plusSom(a: number, b: number, c?: number): Somdeel[] {
  return [
    { t: "getal", n: a },
    { t: "teken", s: "+" },
    { t: "getal", n: b },
    { t: "teken", s: "=" },
    c === undefined ? { t: "vak" } : { t: "getal", n: c },
  ];
}

/** Twee getallen achter elkaar geschreven: de bekende valkuil (10 en 5 wordt 105). */
export function achterElkaar(a: number, b: number): number {
  return Number(`${a}${b}`);
}

const TRAAG = 12000;
const SNEL = 5000;

export type Toetsvraag = {
  opties: number[];
  goed: number;
  /** De keuzes bij de herkansing. */
  herkansing: number[];
  bijGoed: string[];
  bijFout: (x: number | null) => string[];
  /** De vraag nog eens, vlak voor de herkansing. */
  opnieuw: string[];
  /** Kort het antwoord, als ook de herkansing niet lukt. */
  antwoord: () => Promise<void>;
  /** Na een goed antwoord iets zeggen over het tempo. */
  tempo?: "alleenTraag" | "beide";
};

/**
 * Een toetsvraag: één herkansing en geen lange uitleg (zoals de checks van
 * Synthesis). Geeft terug of het in één keer goed was, en of het traag ging.
 * (Met de keuzes van het lesscherm; Optellen tot 100 en Tientallen gebruiken hem.)
 */
export async function toetsvraag(l: Lesgids, v: Toetsvraag): Promise<{ goed: boolean; traag: boolean }> {
  const t0 = Date.now();
  const x = await kiesGetal(l, v.opties);
  const duur = Date.now() - t0;
  if (x === v.goed) {
    const traag = duur > TRAAG;
    const tempo =
      v.tempo && traag ? ["Probeer de volgende iets sneller."] : v.tempo === "beide" && duur < SNEL ? ["Dat ging supersnel!"] : [];
    await l.zeg(...v.bijGoed, ...tempo);
    return { goed: true, traag };
  }
  await l.zeg(...v.bijFout(x));
  await l.verder();
  await l.zeg(...v.opnieuw);
  const y = await kiesGetal(l, v.herkansing);
  if (y === v.goed) await l.zeg(...v.bijGoed);
  else await v.antwoord();
  return { goed: false, traag: false };
}

/** De gewone fout-zin bij een toetssom: de som met het foute antwoord als vraag. */
export function somFout(a: number, b: number) {
  return (x: number | null) =>
    x === null ? ["Geen zorgen.", "Kijk nog eens goed."] : [`{${a}} plus {${b}} is {${x}}?`, "Kijk nog eens goed."];
}

/* ---------- het hologramvlak: tegels, bak en keuzes ---------- */

/** De onderste rij van de torens (in hokjes van het vlak). */
const ONDER_RIJ = 6;

/**
 * Alles wat de lessen met het hologramvlak doen, op één plek: tegels in de
 * bak, torens naast elkaar (zoals l.bak / l.pak / l.leg / l.tel van het
 * gewone lesscherm), liggende stroken, de keuzeknoppen en het aanwijzen van
 * de knoppen de eerste keer.
 */
class Bord {
  private p: Holo20Props;
  private torens: number[][] = [];
  private vraagNr = 0;
  private golfNr = 0;
  private gewezen = { keuzes: false, verder: false };
  /** Hoe lang het kind over de laatste vraag deed, vanaf het moment dat het kon antwoorden. */
  duur = 0;

  constructor(private l: Lesgids) {
    this.p = { stroken: [], bak: [], slot: [], bakLiggend: false, actief: false, hand: false, doel: null, tel: 0, logboek: [], keuzes: null, golf: 0 };
    l.vlak(Optellen20HoloTegels, this.p);
  }

  zet(meer: Partial<Holo20Props>) {
    this.p = { ...this.p, ...meer };
    this.l.pasVlakAan<Holo20Props>(meer);
  }

  /* bak */

  bak(tegels: number[], opties: { liggend?: boolean; slot?: number[] } = {}) {
    this.zet({ bak: tegels, slot: opties.slot ?? [], bakLiggend: !!opties.liggend });
  }

  uitBak(n: number) {
    this.zet({ bak: this.p.bak.filter((t) => t !== n) });
  }

  slot(lijst: number[]) {
    this.zet({ slot: lijst });
  }

  /** Wachten tot het kind een tegel kiest. `hulp`: wat Bliepo zegt als het kind 12 seconden niets doet. */
  async pak(o: { hand?: boolean; hulp?: string[]; doel?: HoloDoel | null } = {}): Promise<number> {
    this.zet({ actief: true, hand: !!o.hand, doel: o.doel === undefined ? this.volgendePlek() : o.doel });
    const klok = o.hulp
      ? setTimeout(() => {
          void this.l.zeg(...o.hulp!).catch(() => {});
        }, 12000)
      : undefined;
    try {
      const g = await this.l.wachtOpVlak<Holo20Melding>("tegel");
      return g.soort === "tegel" ? g.n : 0;
    } finally {
      clearTimeout(klok);
      this.zet({ actief: false, hand: false, doel: null });
    }
  }

  /* torens naast elkaar, rond het midden onder de som */

  private torenStroken(wegLaatste = false): HoloStrook[] {
    const n = this.torens.length;
    const breed = n * 2 + Math.max(0, n - 1) * 0.5;
    const start = MIDDEN_KOLOM - breed / 2;
    return this.torens.map((t, i) => ({ id: `toren${i}`, stukken: [...t], kolom: start + i * 2.5, rij: ONDER_RIJ, wegLaatste: wegLaatste && i === n - 1 }));
  }

  private volgendePlek(): HoloDoel | null {
    if (this.p.stroken.some((st) => !st.id.startsWith("toren"))) return null;
    const n = this.torens.length + 1;
    const start = MIDDEN_KOLOM - (n * 2 + (n - 1) * 0.5) / 2;
    return { kolom: start + (n - 1) * 2.5, rij: ONDER_RIJ - 2, b: 2, h: 3 };
  }

  private toonTorens(weg = false) {
    this.zet({ stroken: this.torenStroken(weg), tel: 0 });
  }

  /** Een tegel neerzetten: op de laatste toren, of `naast` als nieuwe toren. */
  leg(n: number, naast = false) {
    if (naast || this.torens.length === 0) this.torens.push([n]);
    else this.torens[this.torens.length - 1].push(n);
    this.toonTorens();
  }

  /** De laatste toren wordt een andere tegel (de 10 blijft staan). */
  vervang(n: number) {
    if (this.torens.length < 2) this.leg(n, true);
    else {
      this.torens[this.torens.length - 1] = [n];
      this.toonTorens();
    }
  }

  /** De kleine tegel naast de 10, of null. */
  kleineTegel(): number | null {
    return this.torens.length >= 2 ? (this.torens[this.torens.length - 1][0] ?? null) : null;
  }

  /** De laatst gelegde tegel lost op. */
  async haalWeg() {
    if (!this.torens.length) return;
    this.toonTorens(true);
    await this.l.wacht(420);
    const t = this.torens[this.torens.length - 1];
    t.pop();
    if (!t.length) this.torens.pop();
    this.toonTorens();
  }

  /** Alles lost op. */
  async leeg() {
    this.torens = [];
    if (!this.p.stroken.length) return;
    this.zet({ stroken: [], tel: 0, logboek: [] });
    await this.l.wacht(420);
  }

  /** Bliepo telt de hokjes, één voor één. */
  async tel() {
    const totaal = this.p.stroken.reduce((a, st) => a + st.stukken.reduce((x, n) => x + n, 0), 0);
    for (let i = 1; i <= totaal; i++) {
      this.zet({ tel: i });
      await this.l.wacht(380);
    }
    await this.l.wacht(300);
  }

  /** Stroken die de les zelf neerlegt (liggend, met een plekje). */
  stroken(lijst: HoloStrook[], meer: Partial<Holo20Props> = {}) {
    this.torens = [];
    this.zet({ stroken: lijst, tel: 0, ...meer });
  }

  logboek(rijen: { a: number; b: number; c: number | null }[]) {
    this.zet({ logboek: rijen });
  }

  /** Een rustige lichtgolf over de tegels (goed antwoord). */
  goed() {
    this.zet({ golf: ++this.golfNr });
  }

  /* kiezen */

  /** De eerste keer in de les wijst Bliepo de knoppen aan (groep 3 leest nog niet). */
  private async wijsKnoppen() {
    if (this.gewezen.keuzes) return;
    this.gewezen.keuzes = true;
    await this.l.wijsAan("keuzes", "Kies je antwoord.");
    await this.l.wijsAan("controleer", "Tik dan op het vinkje.");
    await this.l.wijsAan("weetniet", "Weet je het niet? Tik dan op het vraagteken.");
  }

  /**
   * Wacht op een antwoord bij de keuzes in het vlak. Het vraagteken en het
   * vinkje staan op de vaste plek onder de zin van Bliepo (28 oktober 2026);
   * het vlak meldt alleen welke keuze is aangetikt. Het vinkje zonder keuze
   * doet niets. Geeft het antwoord, of `null` bij het vraagteken. Tegels die
   * het kind intussen legt, gaan naar `opTegel`.
   */
  private async antwoordOpPlek(
    opTegel?: (n: number) => void,
    wijs?: () => Promise<void>,
  ): Promise<number | string | null> {
    let gekozen: number | string | null = null;
    for (;;) {
      const soorten = opTegel ? ["tegel", "gekozen"] : ["gekozen"];
      const g: Promise<Holo20Melding> = this.l.wachtOpVlak<Holo20Melding>(soorten);
      const k = this.l.knoppen(["weetniet", "controleer"]);
      k.catch(() => {});
      const aanwijzen = wijs ? wijs() : null;
      if (wijs) wijs = undefined;
      aanwijzen?.catch(() => {});
      const r = await Promise.race([g.then((m) => ({ m })), k.then((knop) => ({ knop }))]);
      await aanwijzen;
      if ("m" in r) {
        if (r.m.soort === "tegel") opTegel?.(r.m.n);
        else if (r.m.soort === "gekozen") gekozen = r.m.waarde;
        continue;
      }
      if (r.knop === "weetniet") return null;
      if (gekozen !== null) return gekozen;
    }
  }

  /** Keuzeknoppen; geeft het gekozen antwoord, of `null` bij het vraagteken. `uit`: al geprobeerd (grijs). */
  async vraag<T extends number | string>(opties: T[], uit: T[] = [], goed?: T): Promise<T | null> {
    Bord.voorTest(goed);
    /* Woorden en sommen (Ja, Nee, "5 + 5"): de keuzes van het lesscherm, ook op de vaste plek. */
    if (opties.some((o) => typeof o === "string")) {
      const over = opties.filter((o) => !uit.includes(o)).map(String);
      const p = this.l.kies(over);
      p.catch(() => {});
      await this.wijsKnoppen();
      const t0 = Date.now();
      const x = await p;
      this.duur = Date.now() - t0;
      return x as T | null;
    }
    this.zet({ keuzes: { vraag: ++this.vraagNr, opties, uit } });
    const t0 = Date.now();
    const x = await this.antwoordOpPlek(undefined, () => this.wijsKnoppen());
    this.duur = Date.now() - t0;
    this.zet({ keuzes: null });
    return x as T | null;
  }

  /**
   * Keuzeknoppen terwijl het kind ook tegels mag leggen ("als dat helpt",
   * zoals Synthesis). `opTegel` krijgt elke gekozen tegel.
   */
  async vraagMetTegels(opties: number[], uit: number[], opTegel: (n: number) => void, doel: HoloDoel | null, goed?: number): Promise<number | null> {
    this.zet({ keuzes: { vraag: ++this.vraagNr, opties, uit }, actief: true, doel });
    Bord.voorTest(goed);
    const x = await this.antwoordOpPlek(opTegel, () => this.wijsKnoppen());
    this.zet({ keuzes: null, actief: false, doel: null });
    return x as number | null;
  }

  /** Voor de automatische test (zoals bij de flitslessen): welk antwoord er nu hoort. */
  private static voorTest(goed: unknown) {
    if (typeof window !== "undefined") window.__phaser = { ...window.__phaser, antwoord: goed ?? null };
  }

  /** Ja of nee (Bliepo leest het woord voor als het kind erop tikt). */
  async jaNee(): Promise<"Ja" | "Nee" | null> {
    return this.vraag<"Ja" | "Nee">(["Ja", "Nee"], [], "Ja");
  }

  /** De blauwe pijl; de eerste keer wijst Bliepo hem aan. */
  async verder() {
    const p = this.l.verder();
    if (!this.gewezen.verder) {
      this.gewezen.verder = true;
      await this.l.wijsAan("verder", "Tik op de pijl om verder te gaan.");
    }
    await p;
  }
}

/** Bij één oneven en één even tegel komt de even tegel voorop: dan sluit de strook zonder gat. */
function orden(stukken: number[]): number[] {
  return [...stukken].sort((a, b) => (a % 2) - (b % 2));
}

const ALLES = [1, 2, 3, 4, 5, 6, 7, 8, 9];

/** `aantal` getallen uit 1–9, door elkaar, nooit twee keer hetzelfde na elkaar; begint met `eerste`. */
function reeksGetallen(aantal: number, eerste?: number): number[] {
  for (;;) {
    const uit: number[] = eerste === undefined ? [] : [eerste];
    while (uit.length < aantal) uit.push(...schud(ALLES));
    const lijst = uit.slice(0, aantal);
    if (lijst.every((n, i) => i === 0 || n !== lijst[i - 1])) return lijst;
  }
}

const BEVESTIG = ["Precies.", "Dat klopt.", "Juist.", "Ja!", "Goed zo."];

/**
 * Een oefensom a + b met de tegels in beeld (zoals in de lessen): 1× fout =
 * een vriendelijke hint (de denkfout benoemen) en de foute knop wordt grijs;
 * 2× fout of "weet ik niet" = samen tellen, het antwoord, en de som komt later terug.
 * De vraag zelf stelt de les; deze functie wacht op het antwoord.
 */
async function oefenSom(l: Lesgids, bord: Bord, a: number, b: number, beurt: number): Promise<"goed" | "hulp" | "later"> {
  const s = a + b;
  const naast = achterElkaar(a, b);
  const bij10 = a === 10 || b === 10;
  const bijnaDubbel = Math.abs(a - b) === 1;
  const lijst = bijnaDubbel ? opties(s - 2, s - 1, s, s + 1) : opties(s - 1, naast, s, s + 1);
  const klopt = async (eerste: boolean) => {
    bord.goed();
    l.som(plusSom(a, b, s));
    await l.zeg(eerste ? BEVESTIG[beurt % BEVESTIG.length] : "Precies.", `{${a}} plus {${b}} is {${s}}.`);
    await l.wacht(500);
    l.som(null);
  };

  const x = await bord.vraag(lijst, [], s);
  if (x === s) {
    await klopt(true);
    return "goed";
  }
  if (x !== null) {
    if (x === naast) {
      await l.zeg("Ah, ik zie wat je dacht.", `Je zette {${a}} en {${b}} achter elkaar.`);
      await bord.verder();
      await l.zeg("Maar hoeveel hokjes zijn het samen?");
    } else if (bij10) {
      await l.zeg("Net een beetje ernaast.", "Probeer het nog eens.", `Hoeveel is {${a}} plus {${b}}?`);
    } else if (bijnaDubbel) {
      const k = Math.min(a, b);
      await l.zeg("Net een beetje ernaast.", `Denk aan dubbel {${k}}.`, `Hoeveel is {${a}} plus {${b}}?`);
    } else {
      const groot = Math.max(a, b);
      await l.zeg("Net een beetje ernaast.", `De {${groot}} heeft nog {${10 - groot}} nodig om {10} te maken.`, `Hoeveel is {${a}} plus {${b}}?`);
    }
    const y = await bord.vraag(schud(lijst), [x], s);
    if (y === s) {
      await klopt(false);
      return "hulp";
    }
  }
  /* "Weet ik niet", of de tweede keer mis: Bliepo telt samen en zegt het antwoord. */
  await l.zeg(x === null ? "Geen zorgen." : "Kijk maar.", "We tellen samen.");
  await bord.tel();
  l.som(plusSom(a, b, s));
  await l.zeg(`Het zijn {${s}} hokjes.`, `{${a}} plus {${b}} is {${s}}.`, "Dat zien we later.");
  await bord.verder();
  l.som(null);
  bord.zet({ tel: 0 });
  return "later";
}

/**
 * De snelle reeks 10 + m: de kleine tegel naast de 10 wisselt steeds. Een som
 * die niet lukte, komt één keer later terug. Geeft het aantal sommen dat niet
 * in één keer goed was.
 */
async function reeksBij10(l: Lesgids, bord: Bord, getallen: number[]): Promise<number> {
  const lijst = [...getallen];
  const terug = new Set<number>();
  let fouten = 0;
  for (let i = 0; i < lijst.length; i++) {
    const m = lijst[i];
    if (bord.kleineTegel() !== m) {
      bord.vervang(m);
      await l.wacht(550);
    }
    await l.zeg(`Hoeveel is {10} plus {${m}}?`);
    const r = await oefenSom(l, bord, 10, m, i);
    if (r !== "goed") fouten++;
    if (r === "later" && !terug.has(m)) {
      terug.add(m);
      lijst.push(m);
    }
  }
  return fouten;
}

/* ---------- toetsvragen in het hologramvlak ---------- */

type Toetsuitslag = { goed: boolean; traag: boolean; weetNiet: boolean };

/**
 * Een toetsvraag met de keuzes in het vlak: één herkansing met andere keuzes
 * en geen lange uitleg (LESSENPLAN.md O11/O15). "Weet ik niet" betekent in een
 * toets: dat leren we samen (de les stopt de toets en gaat oefenen).
 */
async function toetsvraagHolo(l: Lesgids, bord: Bord, v: Toetsvraag): Promise<Toetsuitslag> {
  const x = await bord.vraag(v.opties, [], v.goed);
  if (x === null) return { goed: false, traag: false, weetNiet: true };
  if (x === v.goed) {
    bord.goed();
    const traag = bord.duur > TRAAG;
    const tempo =
      v.tempo && traag ? ["Probeer de volgende iets sneller."] : v.tempo === "beide" && bord.duur < SNEL ? ["Dat ging supersnel!"] : [];
    await l.zeg(...v.bijGoed, ...tempo);
    return { goed: true, traag, weetNiet: false };
  }
  await l.zeg(...v.bijFout(x));
  await bord.verder();
  await l.zeg(...v.opnieuw);
  const y = await bord.vraag(v.herkansing, [], v.goed);
  if (y === v.goed) {
    bord.goed();
    await l.zeg(...v.bijGoed);
  } else await v.antwoord();
  return { goed: false, traag: false, weetNiet: false };
}

/* ---------- kaarttekeningen (SVG van 244 × 190) ---------- */

function KaartTien() {
  return <Lijntegel n={10} x={62} y={14} c={32} liggend={false} />;
}
function KaartTienEnZes() {
  return (
    <g>
      <Lijntegel n={10} x={46} y={14} c={32} />
      <Lijntegel n={6} x={134} y={78} c={32} />
    </g>
  );
}
function KaartOverTien() {
  return (
    <g>
      <Lijntegel n={4} x={32} y={30} c={30} liggend />
      <Lijntegel n={7} x={92} y={30} c={30} liggend />
      <Lijntegel n={10} x={32} y={110} c={30} liggend />
    </g>
  );
}
function KaartBijnaDubbel() {
  return (
    <g>
      <Lijntegel n={4} x={44} y={66} c={34} />
      <Lijntegel n={3} x={132} y={66} c={34} />
      <rect x={133} y={67} width={32} height={32} rx={3} fill="none" stroke="#ffffff" strokeWidth={2.4} strokeDasharray="5 4" />
    </g>
  );
}
function KaartEindtoets() {
  return (
    <g>
      <Lijntegel n={3} x={44} y={60} c={34} />
      <Lijntegel n={1} x={140} y={94} c={34} />
      <Lijntegel n={10} x={174} y={10} c={17} kleur="#fde01a" />
    </g>
  );
}

/* ---------- 1. Instaptoets ---------- */

const instaptoets: Lesdraaiboek = {
  id: "optellen-20-instaptoets",
  titel: "Instaptoets: optellen tot 20",
  synthesis: "Add up to 20 · Assessment",
  kaarttekening: KaartTienEnZes,

  async speel(l) {
    const bord = new Bord(l);
    let goed = 0;
    let traag = 0;
    let gesteld = 0;
    let gestopt = false;

    bord.bak([2, 4, 6, 8, 10]);
    await l.zeg("In deze lessen maak je plussommen tot {20}.", "Ben je daar al best goed in?");
    const al = await bord.jaNee();
    await l.zeg(al === "Ja" ? "Mooi." : "Geen probleem.", "In deze toets laat je zien wat je al kunt.");
    bord.bak([]);

    /* De vier toetsvragen; bij "weet ik niet" stopt de toets en gaan we samen oefenen. */
    let n = 6;
    const stappen: (() => Promise<Toetsuitslag>)[] = [
      /* De 10-tegel herkennen. */
      async () => {
        bord.leg(10);
        await l.wacht(400);
        await l.zeg("Oké, ik heb een tegel neergezet.", "Welk getal laat hij zien?");
        return toetsvraagHolo(l, bord, {
          opties: [8, 9, 10, 12],
          goed: 10,
          herkansing: [8, 10, 11, 12],
          bijGoed: ["Ja, dat is een {10}."],
          bijFout: (x) => (x === null ? ["Geen zorgen.", "Kijk nog eens goed."] : [`Een {${x}}?`, x === 9 ? "Dat is heel dichtbij." : "", "Kijk nog eens."]),
          opnieuw: ["Welk getal laat deze tegel zien?"],
          antwoord: async () => {
            await bord.tel();
            await l.zeg("Het zijn {10} hokjes.", "Het is een {10}.");
            await bord.verder();
            bord.zet({ tel: 0 });
          },
        });
      },
      /* 10 + een tegel die het kind zelf kiest. */
      async () => {
        bord.bak([5, 6, 7]);
        await l.zeg("Nu doen we er iets bij.", "Zet er nog een tegel bij.");
        n = await bord.pak({ hand: true, hulp: ["Tik op een tegel.", "Of sleep hem naast de {10}."] });
        bord.leg(n, true);
        bord.bak([]);
        await l.zeg(`Mooi, je hebt een {${n}} gekozen.`, `Hoeveel is {10} plus {${n}}?`);
        const r = await toetsvraagHolo(l, bord, {
          opties: opties(n, 9 + n, 10 + n, 11 + n),
          goed: 10 + n,
          herkansing: opties(10, 9 + n, 10 + n, 11 + n),
          bijGoed: ["Precies.", `{10} plus {${n}} is {${10 + n}}.`],
          bijFout: somFout(10, n),
          opnieuw: ["Hoeveel hokjes zijn het samen?"],
          antwoord: async () => {
            await l.zeg(`{10} plus {${n}} is {${10 + n}}.`);
            await bord.verder();
          },
          tempo: "alleenTraag",
        });
        if (!r.weetNiet) {
          l.som(plusSom(10, n, 10 + n));
          await l.wacht(900);
          l.som(null);
        }
        await bord.leeg();
        return r;
      },
      /* 10 + 7 (of 10 + 8 als de 7 al geweest is), met de tegels erbij. */
      async () => {
        const m = n === 7 ? 8 : 7;
        bord.leg(10);
        bord.leg(m, true);
        await l.wacht(400);
        await l.zeg("Nu deze.", `Wat is {10} plus {${m}}?`);
        const r = await toetsvraagHolo(l, bord, {
          opties: opties(m, 9 + m, 10 + m, 11 + m),
          goed: 10 + m,
          herkansing: opties(10, 9 + m, 10 + m, 11 + m),
          bijGoed: ["Dat klopt."],
          bijFout: somFout(10, m),
          opnieuw: [`Tel de hokjes van de {10} en de {${m}}.`, "Hoeveel is het samen?"],
          antwoord: async () => {
            await l.zeg(`{10} plus {${m}} is {${10 + m}}.`);
            await bord.verder();
          },
          tempo: "alleenTraag",
        });
        await bord.leeg();
        return r;
      },
      /* 10 + 5 zonder tegels. */
      async () => {
        const p = [5, 4, 3].find((x) => x !== n) ?? 5;
        await l.zeg("Probeer deze eens.", `Wat is {10} plus {${p}}?`);
        l.som(plusSom(10, p));
        const r = await toetsvraagHolo(l, bord, {
          opties: opties(p, p + 9, p + 10, p + 11),
          goed: 10 + p,
          herkansing: opties(10, p + 9, p + 10, p + 11),
          bijGoed: [`Ja, samen {${10 + p}}.`],
          bijFout: somFout(10, p),
          opnieuw: [`Wat is {10} plus {${p}}?`],
          antwoord: async () => {
            await l.zeg(`{10} plus {${p}} is {${10 + p}}.`);
            await bord.verder();
          },
          tempo: "alleenTraag",
        });
        l.som(r.weetNiet ? null : plusSom(10, p, 10 + p));
        await l.wacht(r.weetNiet ? 0 : 900);
        l.som(null);
        return r;
      },
    ];
    for (const stap of stappen) {
      const r = await stap();
      gesteld++;
      if (r.goed) goed++;
      if (r.traag) traag++;
      if (r.weetNiet) {
        gestopt = true;
        break;
      }
    }

    /* Zeggen hoe het ging, en dan nog even oefenen (samen minstens 15 opgaven). */
    l.som(null);
    await bord.leeg();
    if (gestopt) await l.zeg("Geen probleem.", "We leren het samen.", "We gaan meteen oefenen.");
    else if (goed === 4 && traag === 0) await l.zeg("Knap gedaan.", "Je kunt al goed plussommen maken tot {20}.");
    else if (goed >= 3) await l.zeg("Goed gedaan.", "Je weet al veel.");
    else await l.zeg("Dank je wel.", "We gaan dit samen oefenen.");
    await bord.verder();

    const reeks = reeksGetallen(Math.max(11, 15 - gesteld));
    bord.leg(10);
    bord.leg(reeks[0], true);
    await l.wacht(400);
    await l.zeg(gestopt ? "Kijk, een {10} en een tegel erbij." : "Nu nog even oefenen.", "We doen steeds een getal bij de {10}.");
    await reeksBij10(l, bord, reeks);

    await bord.leeg();
    l.vlak(null);
    const tik = l.kaart();
    await l.zeg(goed === 4 && !gestopt ? "Super gedaan." : "Goed geoefend.", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

/* ---------- 2. Optellen bij 10 ---------- */

const optellenBij10: Lesdraaiboek = {
  id: "optellen-20-bij-10",
  titel: "Optellen bij 10",
  synthesis: "Add up to 20 · Adding onto 10",
  kaarttekening: KaartTien,

  async speel(l) {
    const bord = new Bord(l);
    bord.bak([4, 5, 6, 10]);
    await l.zeg("We gaan even snel oefenen.", "We doen steeds een getal bij de {10}.", "Zet de {10} en nog een tegel in het vak.");
    const eerste = await bord.pak({ hand: true, hulp: ["Tik op een tegel.", "Of sleep hem naar het vak."] });
    let n: number;
    if (eerste === 10) {
      bord.leg(10);
      bord.bak([4, 5, 6]);
      await l.zeg("Mooi.", "Kies nu nog een tegel.");
      n = await bord.pak({ hulp: ["Tik op een tegel.", "Of sleep hem naast de {10}."] });
      bord.leg(n, true);
    } else {
      n = eerste;
      bord.leg(n);
      /* De andere kleine tegels gaan weg; alleen de 10 blijft over. */
      bord.bak([10]);
      await l.zeg(`Een {${n}}.`, "Zet de {10} er nu bij.");
      await bord.pak({ hulp: ["Tik op de {10}.", "Of sleep hem naar het vak."] });
      /* De 10 komt links te staan, de kleine tegel rechts: die wisselt straks. */
      await bord.leeg();
      bord.leg(10);
      bord.leg(n, true);
    }
    bord.bak([]);
    await l.wacht(400);

    /* De snelle reeks: 15 sommen, de kleine tegel wisselt steeds. */
    const fouten = await reeksBij10(l, bord, reeksGetallen(15, n));

    if (fouten >= 5) await l.zeg("We stoppen hier even.", "We oefenen dit later nog eens.");
    await bord.leeg();
    l.vlak(null);
    const tik = l.kaart();
    await l.zeg(
      fouten === 0 ? "Zonder fouten gewerkt vandaag!" : "Goed gewerkt!",
      "Je kunt al plussommen met {10} maken.",
      "Tik op de kaart om hem af te vinken.",
    );
    await tik;
  },
};

/* ---------- 3. Over de 10 heen ---------- */

const overDe10: Lesdraaiboek = {
  id: "optellen-20-over-de-10",
  titel: "Over de 10 heen",
  synthesis: "Add up to 20 · Add Across 10",
  kaarttekening: KaartOverTien,

  async speel(l) {
    const bord = new Bord(l);
    /* Boven de twee tegels, eronder de 10: links gelijk, zodat je ziet welke langer is. */
    const KOLOM = 1;
    let boven: number[] = [];
    let onder: number[] = [];
    let wegOnder = false;
    let wegBoven = false;
    const stroken = (): HoloStrook[] => [
      ...(boven.length ? [{ id: "boven", stukken: boven, kolom: KOLOM, rij: 1, liggend: true, wegLaatste: wegBoven }] : []),
      ...(onder.length ? [{ id: "onder", stukken: onder, kolom: KOLOM, rij: 4, liggend: true, wegLaatste: wegOnder }] : []),
    ];
    const toon = (meer: Partial<Holo20Props> = {}) => bord.stroken(stroken(), meer);
    /** Het doel: rechts naast de 10. */
    const naastTien: HoloDoel = { kolom: KOLOM + 5, rij: 4, b: 2, h: 2 };

    /** Een tegel bij de 10 leggen tot het evenveel is als a + b. */
    const maakGelijk = async (a: number, b: number): Promise<number> => {
      const s = a + b;
      const nodig = s - 10;
      const slot: number[] = [];
      for (let fout = 0; ; ) {
        const k = fout >= 2 ? nodig : await bord.pak({ doel: naastTien });
        onder = [10, k];
        toon();
        if (k === nodig) return k;
        await l.wacht(500);
        await l.zeg(
          `Je legde een {${k}} bij de {10}.`,
          k < nodig ? `Dat is nog iets kleiner dan {${a}} plus {${b}}.` : `Dat is nu een beetje groter dan {${a}} plus {${b}}.`,
        );
        await bord.verder();
        wegOnder = true;
        toon();
        await l.wacht(450);
        wegOnder = false;
        onder = [10];
        slot.push(k);
        toon();
        bord.slot([...slot]);
        fout++;
        if (fout === 1) await l.zeg("Probeer het nog eens.", `Welke tegel moet erbij om {${s}} te maken?`);
        else await l.zeg(`Je hebt nog {${nodig}} nodig.`, `Kijk, ik leg de {${nodig}} erbij.`);
      }
    };

    /** Keuzes terwijl het kind ook een tegel bij de 10 mag leggen. Bliepo zegt wat hij ziet. */
    const kiesMetTegels = async (a: number, b: number, lijst: number[], uit: number[]) => {
      const nodig = a + b - 10;
      bord.bak([1, 2, 3, 4, 5, 6, 7, 8], { liggend: true });
      return bord.vraagMetTegels(
        lijst,
        uit,
        (k) => {
          onder = [10, k];
          toon();
          const zin =
            k === nodig
              ? ["Goed nagedacht met de tegels.", "De twee vormen zijn nu even groot."]
              : k < nodig
                ? [`Een {${k}} erbij is nog iets kleiner.`]
                : [`Een {${k}} erbij is iets groter.`];
          void l.zeg(...zin).catch(() => {});
        },
        naastTien,
        a + b,
      );
    };

    /** "Hoeveel is het samen?" bij de strook a + b met een 10 eronder. */
    const hoeveelSamen = async (a: number, b: number, metTegels: boolean): Promise<"goed" | "hulp" | "later"> => {
      const s = a + b;
      /* De bekende denkfout: de getallen achter elkaar (9 en 4 wordt 94). */
      const fout = achterElkaar(a, b);
      const lijst = opties(s, s - 1, s + 1, fout);
      const x = metTegels ? await kiesMetTegels(a, b, lijst, []) : await bord.vraag(lijst, [], s);
      if (x === s) {
        bord.goed();
        await l.zeg("Je hebt het!", `{${a}} plus {${b}} is {${s}}.`);
        return "goed";
      }
      if (x !== null) {
        if (x === fout) {
          await l.zeg("Ik zie wat je deed.", "Je zette de getallen achter elkaar.", "We moeten de hokjes van allebei de tegels tellen.");
        } else {
          await l.zeg("Net ernaast.", onder.length > 1 ? "Kijk naar de {10} en de tegel erbij." : "Leg een tegel bij de {10}.", "Dan zie je het beter.");
        }
        await bord.verder();
        await l.zeg("Hoeveel is het samen?");
        const y = await kiesMetTegels(a, b, schud(lijst), [x]);
        if (y === s) {
          bord.goed();
          await l.zeg("Je hebt het!", `{${a}} plus {${b}} is {${s}}.`);
          return "hulp";
        }
      }
      /* "Weet ik niet", of de tweede keer mis: Bliepo legt de goede tegel bij de 10 en zegt het antwoord. */
      onder = [10, s - 10];
      toon();
      bord.slot([]);
      await l.wacht(500);
      await l.zeg(x === null ? "Geen zorgen." : "Kijk.", `{10} plus {${s - 10}} is {${s}}.`, `Dus {${a}} plus {${b}} is ook {${s}}.`, "Dat zien we later.");
      await bord.verder();
      return "later";
    };

    bord.bak([3, 4, 5, 6, 7, 8, 9]);
    await l.zeg("We proberen iets nieuws.", "Zet twee tegels in het vak.", "Samen moeten ze *meer* dan {10} zijn.");

    /* Twee tegels die samen meer dan 10 zijn; vanaf de eerste liggen ze. */
    const eersteDoel: HoloDoel = { kolom: KOLOM, rij: 1, b: 3, h: 2 };
    const a = await bord.pak({ hand: true, doel: eersteDoel, hulp: ["Tik op een tegel.", "Of sleep hem naar het vak."] });
    boven = [a];
    toon();
    bord.bak([3, 4, 5, 6, 7, 8, 9], { liggend: true });
    await l.zeg("Ja.", "Zet er nog één bij.", "Samen moeten ze meer dan {10} zijn.");
    const naastBoven = (): HoloDoel => ({ kolom: KOLOM + Math.ceil(a / 2), rij: 1, b: 2, h: 2 });
    let b = await bord.pak({ doel: naastBoven() });
    while (a + b <= 10) {
      boven = [a, b];
      toon();
      await l.wacht(600);
      await l.zeg(`{${a}} en {${b}} is samen {${a + b}}.`, "Dat is niet meer dan {10}.");
      wegBoven = true;
      toon();
      await l.wacht(450);
      wegBoven = false;
      boven = [a];
      toon();
      await l.zeg("Kies een grotere tegel.");
      b = await bord.pak({ doel: naastBoven() });
    }
    boven = orden([a, b]);
    toon();
    bord.bak([]);

    await l.zeg("Ik leg er een {10} onder.", "Dan kunnen we ze vergelijken.");
    await bord.verder();
    onder = [10];
    toon();
    await l.wacht(500);

    /* Welke vorm is groter? (opgave 1) */
    await l.zeg("Welke vorm is groter?", `De {${a}} plus {${b}}?`, "Of de {10}?");
    const keuze = await bord.vraag([`${a} + ${b}`, "10"], [], `${a} + ${b}`);
    if (keuze === `${a} + ${b}`) {
      bord.goed();
      await l.zeg(`Ja, de {${a}} plus {${b}} is groter.`, "Hij steekt verder uit.");
    } else if (keuze === "10") {
      await l.zeg("Hmm.", `De {${a}} plus {${b}} lijkt mij groter.`, "Kijk maar, hij steekt verder uit.");
    } else {
      await l.zeg("Geen zorgen.", "Kijk waar de vormen ophouden.", `De {${a}} plus {${b}} steekt verder uit.`);
    }
    await bord.verder();

    /* De uitdaging: de 10 aanvullen (opgave 2), en hoeveel is het (opgave 3). */
    bord.bak([1, 2, 3, 4, 5, 6, 7, 8], { liggend: true });
    await l.zeg("Hier is een moeilijke opdracht.", "Leg een tegel bij de {10}.", `Dan is het evenveel als {${a}} plus {${b}}.`);
    const k = await maakGelijk(a, b);
    bord.goed();
    await l.zeg("Kijk, nu zijn ze even groot.", `Dus {10} plus {${k}} en {${a}} plus {${b}} zijn evenveel.`, "Hoeveel is het?");
    bord.bak([]);
    await hoeveelSamen(a, b, false);
    await bord.verder();

    /* Een reeks die Bliepo zelf neerlegt (12 sommen); de 10 eronder helpt als dat nodig is. */
    const zelfde = ([p, q]: number[]) => (p === a && q === b) || (p === b && q === a);
    const vast: [number, number][] = ([[8, 7], [9, 5], [8, 9]] as [number, number][]).filter((x) => !zelfde(x));
    const extra: [number, number][] = schud(
      ([[9, 4], [7, 5], [8, 6], [9, 3], [7, 6], [9, 7], [6, 5], [8, 4], [9, 8], [7, 4], [9, 6], [8, 3]] as [number, number][]).filter((x) => !zelfde(x)),
    );
    const reeks: [number, number][] = [...vast, ...extra].slice(0, 12);
    const terug = new Set<string>();
    for (let i = 0; i < reeks.length; i++) {
      const [p, q] = reeks[i];
      boven = orden([p, q]);
      onder = [10];
      toon();
      bord.slot([]);
      await l.wacht(500);
      await l.zeg(
        i === 0 ? `Nu heb ik {${p}} plus {${q}} gemaakt.` : i === 1 ? `Deze keer heb ik {${p}} plus {${q}} gemaakt.` : `En {${p}} plus {${q}}?`,
        i < 2 ? "Hoeveel is het samen?" : "",
        i === 0 ? "Leg een tegel bij de {10} als dat helpt." : "",
      );
      const r = await hoeveelSamen(p, q, true);
      if (r === "later" && !terug.has(`${p}+${q}`)) {
        terug.add(`${p}+${q}`);
        reeks.push([p, q]);
      }
      if (i === reeks.length - 2) await l.zeg("Nu nog één.");
      else if (i < reeks.length - 2 && i % 3 === 2) await l.zeg("Goed bezig.", "Nu de volgende.");
      await l.wacht(300);
    }

    await l.zeg("Knap gedaan.");
    await l.wacht(500);
    l.vlak(null);
    const tik = l.kaart();
    await l.zeg("Je kunt plussommen over de {10} maken.", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

/* ---------- 4. Bijna dubbel ---------- */

const bijnaDubbel: Lesdraaiboek = {
  id: "optellen-20-bijna-dubbel",
  titel: "Bijna dubbel",
  synthesis: "Add up to 20 · Close To Doubles",
  kaarttekening: KaartBijnaDubbel,

  async speel(l) {
    const bord = new Bord(l);
    /* Twee torens los van elkaar, rond het midden onder de som. */
    const LINKS = MIDDEN_KOLOM - 3.5;
    const RECHTS = MIDDEN_KOLOM + 1.5;
    let links: number[] = [];
    let rechts: number[] = [];
    let plekje = false;
    let wegRechts = false;
    const stroken = (): HoloStrook[] => [
      ...(links.length ? [{ id: "links", stukken: links, kolom: LINKS, rij: ONDER_RIJ }] : []),
      ...(rechts.length ? [{ id: "rechts", stukken: rechts, kolom: RECHTS, rij: ONDER_RIJ, plekje, wegLaatste: wegRechts }] : []),
    ];
    const toon = () => bord.stroken(stroken());
    const opLinks: HoloDoel = { kolom: LINKS, rij: ONDER_RIJ - 2, b: 2, h: 3 };

    /** Drie sommen snel achter elkaar, zonder reactie per som. Telt goed en bedenktijd. */
    const snelleRonde = async (sommen: [number, number][]) => {
      let goed = 0;
      let tijd = 0;
      for (const [i, [p, q]] of sommen.entries()) {
        links = [p];
        rechts = [q];
        plekje = false;
        toon();
        await l.wacht(300);
        await l.zeg(...(i === 0 ? ["Hier is de eerste.", `Wat is {${p}} plus {${q}}?`] : i === 1 ? [`En {${p}} plus {${q}}?`] : [`Wat is {${p}} plus {${q}}?`]));
        const s = p + q;
        const x = await bord.vraag(opties(s - 2, s - 1, s, s + 1), [], s);
        tijd += bord.duur;
        if (x === s) goed++;
      }
      links = [];
      rechts = [];
      toon();
      return { goed, tijd };
    };

    /**
     * Een vraag in de les met hulp: 1× fout = een hint en de foute knop wordt
     * grijs; 2× fout of "weet ik niet" = Bliepo zegt het antwoord.
     */
    const lesVraag = async (lijst: number[], goed: number, hint: string[], uitleg: string[], bijGoed: string[]): Promise<boolean> => {
      const x = await bord.vraag(lijst, [], goed);
      if (x === goed) {
        bord.goed();
        await l.zeg(...bijGoed);
        return true;
      }
      if (x !== null) {
        await l.zeg(...hint);
        const y = await bord.vraag(schud(lijst), [x], goed);
        if (y === goed) {
          bord.goed();
          await l.zeg(...bijGoed);
          return false;
        }
      }
      await l.zeg(x === null ? "Geen zorgen." : "Kijk.", ...uitleg);
      await bord.verder();
      return false;
    };

    /** Het kind zet een tegel bij de rechter toren, zodat p een p + 1 wordt. */
    const maakEenMeer = async (p: number) => {
      const slot: number[] = [];
      for (let fout = 0; ; ) {
        const k = fout >= 2 ? 1 : await bord.pak({ doel: null });
        plekje = false;
        rechts = [p, k];
        toon();
        if (k === 1) return;
        await l.wacht(400);
        await l.zeg(`Ah, dat maakt {${p + k}}.`);
        await bord.verder();
        wegRechts = true;
        toon();
        await l.wacht(450);
        wegRechts = false;
        rechts = [p];
        plekje = true;
        toon();
        slot.push(k);
        bord.slot([...slot]);
        fout++;
        if (fout === 1) await l.zeg("Probeer het nog eens.", `Zet een tegel bij de {${p}}, zodat het {${p + 1}} wordt.`);
        else await l.zeg("Je hebt er nog maar {1} nodig.", "Kijk, ik zet de {1} erbij.");
      }
    };

    /** Het dubbel van p in beeld zetten en vragen; daarna het blokje erbij en p + (p + 1). */
    const dubbelEnEenMeer = async (p: number, zelfErbij: boolean) => {
      links = [p];
      toon();
      await l.wacht(450);
      rechts = [p];
      toon();
      await l.wacht(450);
      await l.zeg(...(p === 5 ? ["Eerst een makkelijke.", "Wat is {5} plus {5}?"] : [`Oké, wat is dan {${p}} plus {${p}}?`]));
      await lesVraag(
        opties(2 * p - 2, 2 * p - 1, 2 * p, 2 * p + 1),
        2 * p,
        ["Bijna.", "Tel de hokjes van allebei de tegels."],
        [`Twee keer {${p}} is {${2 * p}}.`, `Dus {${p}} plus {${p}} is {${2 * p}}.`],
        [p === 5 ? "Juist." : "Ja.", `{${p}} plus {${p}} is {${2 * p}}.`],
      );
      l.som(plusSom(p, p, 2 * p));
      bord.logboek([{ a: p, b: p, c: 2 * p }]);

      /* Eén blokje erbij. */
      if (zelfErbij) {
        plekje = true;
        toon();
        bord.bak([1, 2, 3, 4, 5]);
        await l.zeg(
          ...(p === 5
            ? [`Nu {5} plus {6}.`, "Je weet het antwoord vast al.", "Maar we laten het ook zien met de tegels.", "Zet een tegel bij de {5}, zodat het {6} wordt."]
            : ["Zet er nu een tegel bij.", `Zo wordt de {${p}} een {${p + 1}}.`]),
        );
        await maakEenMeer(p);
        bord.bak([]);
      } else {
        await l.wacht(500);
        rechts = [p, 1];
        toon();
        await l.wacht(500);
      }
      l.som(plusSom(p, p + 1));
      bord.logboek([
        { a: p, b: p, c: 2 * p },
        { a: p, b: p + 1, c: null },
      ]);
      await l.zeg(zelfErbij ? "Goed zo." : "Kijk, er komt er één bij.", `{${p}} plus {${p}} is {${2 * p}}.`, `Wat is dan {${p}} plus {${p + 1}}?`);
      await lesVraag(
        opties(2 * p - 1, 2 * p, 2 * p + 1, 2 * p + 2),
        2 * p + 1,
        ["Net ernaast.", `Dubbel {${p}} is {${2 * p}}.`, "Er komt er één bij."],
        [`Dubbel {${p}} is {${2 * p}}.`, "Er komt er één bij.", `Dus {${p}} plus {${p + 1}} is {${2 * p + 1}}.`],
        [p === 5 ? "Juist." : "Precies.", `Het is één meer dan dubbel {${p}}.`, `{${p}} plus {${p + 1}} is {${2 * p + 1}}.`],
      );
      l.som(plusSom(p, p + 1, 2 * p + 1));
      bord.logboek([
        { a: p, b: p, c: 2 * p },
        { a: p, b: p + 1, c: 2 * p + 1 },
      ]);
      await bord.verder();
      l.som(null);
      links = [];
      rechts = [];
      plekje = false;
      toon();
      bord.logboek([]);
    };

    /* De voortoets (opgaven 1–3). */
    await l.zeg(l.naam ? `${l.naam}, eerst een korte toets.` : "Eerst een korte toets.", "Er komen drie vragen.", "Hoe snel kun je ze doen?");
    await bord.verder();
    const voor = await snelleRonde([
      [5, 6],
      [6, 7],
      [7, 8],
    ]);
    await l.zeg(
      voor.goed === 3 ? "Allemaal goed!" : voor.goed === 0 ? "Dat waren lastige vragen." : `Je had er {${voor.goed}} goed.`,
      voor.goed >= 2 ? "Goed geprobeerd." : "",
      "Ik heb een paar trucjes.",
      "Die kunnen je echt helpen.",
    );
    await bord.verder();

    /* Trucje: dubbel 5, en één erbij (opgaven 4 en 5). */
    bord.bak([1, 2, 3, 4, 5]);
    await l.zeg("Je bent goed in dubbele sommen.", "Die gaan we gebruiken.", "Zet een {5} in het vak.", "Dan maak ik hem dubbel.");
    for (let fout = 0; ; fout++) {
      const t = fout >= 2 ? 5 : await bord.pak({ hand: fout === 0, doel: opLinks, hulp: ["Zoek de {5}.", "Dat is de groene tegel."] });
      if (t === 5) break;
      if (fout === 0) await l.zeg("Zoek de {5}.", "Dat is de groene tegel.");
      else await l.zeg("Kijk, ik pak de {5}.");
    }
    bord.bak([]);
    await dubbelEnEenMeer(5, true);

    /* 6 + 7: welk dubbel helpt? (opgave 6, en 7 en 8) */
    bord.bak([1, 2, 3, 4, 5, 6], { slot: [1, 2, 3, 4, 5] });
    await l.zeg("Nu {6} plus {7}.", "Welk dubbel helpt je?", "{5} plus {5}, of {6} plus {6}?");
    const welk = await bord.vraag(["5 + 5", "6 + 6"], [], "6 + 6");
    if (welk === "6 + 6") {
      bord.goed();
      await l.zeg("Ja, dubbel {6}.");
    } else {
      await l.zeg(welk === null ? "Geen zorgen." : "Ik weet niet of dat werkt.", welk === null ? "" : "Ik zie geen {5} in {6} plus {7}.");
      await bord.verder();
      await l.zeg("Ik help je.");
    }
    await l.zeg("Zet de {6} in het vak.", "Dan maken we hem dubbel.");
    await bord.pak({ doel: opLinks });
    bord.bak([]);
    await dubbelEnEenMeer(6, true);

    await l.zeg(l.naam ? `${l.naam}, je doet het goed.` : "Je doet het goed.", "Nog even oefenen met de tegels.", "Daarna zijn we klaar.");
    await bord.verder();

    /* Vrij oefenen: het kind kiest zelf de tegel (minstens 2 keer, hooguit 4; opgaven 9–12). */
    const gehad: number[] = [];
    for (let ronde = 0; ronde < 4; ronde++) {
      bord.bak([2, 3, 4, 5, 6, 7, 8, 9], { slot: [...gehad] });
      await l.zeg(ronde === 0 ? "Zet een tegel in het vak." : "Kies een andere tegel.", "Dan maken we hem dubbel.");
      const n = await bord.pak({ doel: opLinks });
      gehad.push(n);
      bord.bak([]);
      links = [n];
      toon();
      await l.wacht(400);
      rechts = [n];
      toon();
      await l.zeg(`Wat is dubbel {${n}}?`);
      await lesVraag(
        opties(2 * n - 2, 2 * n - 1, 2 * n, 2 * n + 1),
        2 * n,
        ["Bijna.", "Tel de hokjes van allebei de tegels."],
        [`Dubbel {${n}} is {${2 * n}}.`],
        ["Juist.", `Dubbel {${n}} is {${2 * n}}.`],
      );
      l.som(plusSom(n, n, 2 * n));
      bord.logboek([{ a: n, b: n, c: 2 * n }]);
      await l.wacht(500);
      rechts = [n, 1];
      toon();
      bord.logboek([
        { a: n, b: n, c: 2 * n },
        { a: n, b: n + 1, c: null },
      ]);
      l.som(plusSom(n, n + 1));
      await l.zeg(`Nu {${n}} plus {${n + 1}}.`, "Hoeveel is dat?");
      await lesVraag(
        opties(2 * n - 1, 2 * n, 2 * n + 1, 2 * n + 2),
        2 * n + 1,
        ["Net ernaast.", `Dubbel {${n}} is {${2 * n}}.`, "Er komt er één bij."],
        [`Dubbel {${n}} is {${2 * n}}.`, "Er komt er één bij.", `Dus {${n}} plus {${n + 1}} is {${2 * n + 1}}.`],
        ["Juist.", `{${n}} plus {${n + 1}} is {${2 * n + 1}}.`],
      );
      l.som(plusSom(n, n + 1, 2 * n + 1));
      bord.logboek([
        { a: n, b: n, c: 2 * n },
        { a: n, b: n + 1, c: 2 * n + 1 },
      ]);
      await bord.verder();
      l.som(null);
      links = [];
      rechts = [];
      toon();
      bord.logboek([]);
      if (ronde === 3 || ronde === 0) continue;
      await l.zeg("Wil je er nog één doen?");
      if ((await bord.jaNee()) !== "Ja") break;
    }

    /* De natoets: alleen vergelijken met jezelf, zonder seconden (opgaven 13–15). */
    await l.zeg(
      voor.goed === 0 ? "Eerst had je er geen van de {3} goed." : `Eerst had je er {${voor.goed}} van de {3} goed.`,
      "Nu nog drie vragen.",
      "Kijk of het nu beter gaat.",
    );
    await bord.verder();
    const na = await snelleRonde([
      [6, 7],
      [8, 9],
      [7, 8],
    ]);
    const sneller = na.tijd < voor.tijd;
    await l.zeg(
      na.goed === 0 ? "Je had er deze keer geen goed." : `Je had er deze keer {${na.goed}} goed.`,
      na.goed > voor.goed ? "Dat zijn er meer dan eerst!" : na.goed === 3 ? "Weer allemaal goed!" : "",
      sneller ? "En je was sneller dan eerst." : "",
    );
    await bord.verder();

    l.vlak(null);
    const tik = l.kaart();
    await l.zeg("Deze les is klaar.", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

/* ---------- 5. Eindtoets ---------- */

const eindtoets: Lesdraaiboek = {
  id: "optellen-20-eindtoets",
  titel: "Eindtoets: optellen tot 20",
  synthesis: "Add up to 20 · Mastery Check",
  kaarttekening: KaartEindtoets,

  async speel(l) {
    const bord = new Bord(l);
    let goed = 0;
    let traag = 0;
    let gesteld = 0;
    let gestopt = false;

    bord.bak([2, 4, 6, 8, 10]);
    await l.zeg("Dit is de eindtoets: plussommen tot {20}.", "Ben je daar al best goed in?");
    const al = await bord.jaNee();
    await l.zeg(al === "Ja" ? "Mooi." : "Geen probleem.", "We kijken wat je al kunt.", "Antwoord maar zo snel je kunt.");
    bord.bak([]);

    let n = 6;
    const stappen: (() => Promise<Toetsuitslag>)[] = [
      /* De 10-tegel herkennen. */
      async () => {
        bord.leg(10);
        await l.wacht(400);
        await l.zeg("Welk getal laat deze tegel zien?");
        return toetsvraagHolo(l, bord, {
          opties: [8, 9, 10, 11],
          goed: 10,
          herkansing: [8, 10, 11, 12],
          bijGoed: ["Ja, dat is een {10}."],
          bijFout: (x) => (x === null ? ["Geen zorgen.", "Kijk nog eens goed."] : [`Een {${x}}?`, x === 9 || x === 11 ? "Dat is heel dichtbij." : "", "Kijk nog eens."]),
          opnieuw: ["Welk getal laat deze tegel zien?"],
          antwoord: async () => {
            await l.zeg("Het is een {10}.");
            await bord.verder();
          },
          tempo: "beide",
        });
      },
      /* 10 + een zelfgekozen tegel. */
      async () => {
        bord.bak([5, 6, 7]);
        await l.zeg("Zet er nog een tegel bij.");
        n = await bord.pak({ hand: true, hulp: ["Tik op een tegel.", "Of sleep hem naast de {10}."] });
        bord.leg(n, true);
        await l.zeg(`Je hebt een {${n}} gekozen.`, `Hoeveel is {10} plus {${n}}?`);
        return toetsvraagHolo(l, bord, {
          opties: opties(n, 9 + n, 10 + n, 11 + n),
          goed: 10 + n,
          herkansing: opties(10, 9 + n, 10 + n, 11 + n),
          bijGoed: [`Ja, {10} plus {${n}} is {${10 + n}}.`],
          bijFout: somFout(10, n),
          opnieuw: [`Hoeveel is {10} plus {${n}}?`],
          antwoord: async () => {
            await l.zeg(`{10} plus {${n}} is {${10 + n}}.`);
            await bord.verder();
          },
          tempo: "beide",
        });
      },
      /* Een nieuwe tegel bij de 10. */
      async () => {
        await bord.haalWeg();
        bord.uitBak(n);
        await l.zeg("Zet een nieuwe tegel bij de {10}.");
        const m = await bord.pak();
        bord.leg(m, true);
        bord.bak([]);
        await l.zeg(`Wat is {10} plus {${m}}?`);
        const r = await toetsvraagHolo(l, bord, {
          opties: opties(m, 9 + m, 10 + m, 11 + m),
          goed: 10 + m,
          herkansing: opties(10, 9 + m, 10 + m, 11 + m),
          bijGoed: [`Ja, samen {${10 + m}}.`],
          bijFout: somFout(10, m),
          opnieuw: [`Wat is {10} plus {${m}}?`],
          antwoord: async () => {
            await l.zeg(`{10} plus {${m}} is {${10 + m}}.`);
            await bord.verder();
          },
          tempo: "beide",
        });
        await bord.leeg();
        return r;
      },
      /* Aanvullen tot 20. */
      async () => {
        bord.leg(10);
        bord.leg(7, true);
        await l.wacht(400);
        await l.zeg("Dit is {17}.", "Wat moet er nog bij om {20} te maken?");
        const r = await toetsvraagHolo(l, bord, {
          opties: [1, 2, 3, 4],
          goed: 3,
          herkansing: [1, 2, 3, 4],
          bijGoed: ["Precies, {17} en {3} is {20}."],
          bijFout: (x) => (x === null ? ["Geen zorgen.", "Kijk nog eens goed."] : [`{17} en {${x}} is {${17 + x}}.`, x < 3 ? "Dat is nog geen {20}." : "Dat is meer dan {20}."]),
          opnieuw: ["Wat moet er bij {17} om {20} te maken?"],
          antwoord: async () => {
            await l.zeg("De {7} heeft nog {3} nodig om {10} te worden.", "Dus {17} en {3} is {20}.");
            await bord.verder();
          },
          tempo: "beide",
        });
        await bord.leeg();
        return r;
      },
      /* Over de 10 heen: 8 + een zelfgekozen tegel. */
      async () => {
        bord.leg(8);
        bord.bak([5, 6, 7]);
        await l.zeg("Hier is een {8}.", "Kies zelf een tegel om erbij te zetten.");
        const k = await bord.pak();
        bord.leg(k, true);
        bord.bak([]);
        await l.zeg(`Hoeveel is {8} plus {${k}}?`);
        const r = await toetsvraagHolo(l, bord, {
          opties: opties(k - 2, 7 + k, 8 + k, 9 + k),
          goed: 8 + k,
          herkansing: opties(6 + k, 7 + k, 8 + k, 9 + k),
          bijGoed: [`Goed zo, {8} plus {${k}} is {${8 + k}}.`],
          bijFout: somFout(8, k),
          opnieuw: [`Hoeveel is {8} plus {${k}}?`],
          antwoord: async () => {
            await l.zeg(`De {8} heeft nog {2} nodig om {10} te worden.`, `Dan is {8} plus {${k}} samen {${8 + k}}.`);
            await bord.verder();
          },
          tempo: "beide",
        });
        await bord.leeg();
        return r;
      },
      /* Een kale som: bijna dubbel. */
      async () => {
        l.som(plusSom(7, 8));
        await l.zeg("Nog één, zonder tegels.", "Hoeveel is {7} plus {8}?");
        const r = await toetsvraagHolo(l, bord, {
          opties: [13, 14, 15, 16],
          goed: 15,
          herkansing: [5, 14, 15, 16],
          bijGoed: ["Helemaal goed."],
          bijFout: somFout(7, 8),
          opnieuw: ["Hoeveel is {7} plus {8}?"],
          antwoord: async () => {
            await l.zeg("Dubbel {7} is {14}.", "Eén meer is {15}.");
            await bord.verder();
          },
          tempo: "beide",
        });
        if (!r.weetNiet) {
          l.som(plusSom(7, 8, 15));
          await l.wacht(900);
        }
        l.som(null);
        return r;
      },
    ];
    for (const stap of stappen) {
      const r = await stap();
      gesteld++;
      if (r.goed) goed++;
      if (r.traag) traag++;
      if (r.weetNiet) {
        gestopt = true;
        break;
      }
    }

    /* Zeggen hoe het ging, ook als het "goed maar traag" was. */
    l.som(null);
    await bord.leeg();
    if (gestopt) await l.zeg("Geen probleem.", "We leren het samen.", "We gaan meteen oefenen.");
    else if (goed === 6 && traag <= 1) await l.zeg(l.naam ? `Knap gedaan, ${l.naam}!` : "Knap gedaan!", "Je kunt plussommen maken tot {20}.");
    else if (goed >= 5) await l.zeg("Goed gedaan.", traag > 1 ? "Je weet het, nu nog wat sneller." : "Je weet het bijna allemaal.");
    else await l.zeg("Je weet al veel.", "We gaan nog wat oefenen.", "Daarna doe je de toets nog eens.");
    await bord.verder();

    /* Nog even oefenen: alles uit de unit door elkaar (samen minstens 15 opgaven). */
    const soorten: [number, number][] = [
      ...reeksGetallen(3).map((m): [number, number] => [10, m]),
      ...schud<[number, number]>([[8, 5], [9, 4], [7, 6], [9, 6], [8, 7], [6, 5]]).slice(0, 3),
      ...schud<[number, number]>([[6, 7], [7, 8], [8, 9], [5, 6], [4, 5]]).slice(0, 3),
    ];
    const aantal = Math.max(9, 15 - gesteld);
    const sommen: [number, number][] = [];
    while (sommen.length < aantal) sommen.push(...schud(soorten));
    const lijst = sommen.slice(0, aantal);
    const terug = new Set<string>();
    await l.zeg(gestopt ? "Kijk, ik zet de tegels neer." : "Nu nog even oefenen.");
    for (let i = 0; i < lijst.length; i++) {
      const [a, b] = lijst[i];
      await bord.leeg();
      bord.leg(a);
      bord.leg(b, true);
      await l.wacht(450);
      await l.zeg(`Hoeveel is {${a}} plus {${b}}?`);
      const r = await oefenSom(l, bord, a, b, i);
      if (r === "later" && !terug.has(`${a}+${b}`)) {
        terug.add(`${a}+${b}`);
        lijst.push([a, b]);
      }
    }

    await bord.leeg();
    l.vlak(null);
    const tik = l.kaart();
    await l.zeg(goed === 6 && !gestopt ? "Super gedaan." : "Goed geoefend.", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

export const LESSEN_OPTELLEN_TOT_20: Lesdraaiboek[] = [instaptoets, optellenBij10, overDe10, bijnaDubbel, eindtoets];
