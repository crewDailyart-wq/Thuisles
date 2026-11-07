/**
 * Lessen "Minsommen" naar Squla groep 3 Rekenen (30 oktober 2026, opdracht
 * eigenaar). Per Squla-oefening per level één les; elke les volgt hoe dat level
 * bij Squla is opgebouwd (zelfde soorten vragen in dezelfde volgorde, dezelfde
 * getallenreeks), met eigen getallen, eigen zinnen en eigen tekeningen. De
 * analyse staat in SQULA-ANALYSE/minsommen-*-volledig.md.
 *
 *   Minsommen, onderwater (16055)   squla-min-ruimte-1/2/3     dingen in de ruimte
 *   Bussommen 1 (7275)              squla-min-bus1-1/2/3       platte 2D-bus
 *   Bussommen 2 (7276)              squla-min-bus2-1/2/3       platte 2D-bus, rood rondje
 *   Minsommen (6919)                squla-min-machine-1/2/3/4  platte 2D: machine, bord, bakjes, geld
 *   Kale sommen (7277)              squla-min-kaal-1/2/3       platte 2D: schoolbord
 *
 * Keuzes van de hoofdagent (vooraf genoteerd):
 *  - Bij de bus klopt het beeld altijd met het verhaal: eerst liggen alle
 *    pakjes in de bus, wat bezorgd is staat daarna buiten (of: een rood rondje
 *    met het getal, bij Bussommen 2); de rest blijft in de bus.
 *  - Regels van Sara (31 oktober): geen mensen en geen dieren. De kinderen in
 *    de bus van Squla zijn pakjes die bezorgd worden; de zeedieren zijn dingen
 *    uit de ruimte (raketjes die wegvliegen, bellen die knappen, sterren die
 *    vallen …) en de walvis/inktvis die eten is een ufo die er een paar
 *    meeneemt. Stijl: nacht, geen vaste gloed, geen kaders.
 *  - Luistervragen: Bliepo zegt de keuzes en ze staan als knop.
 *  - Bubbelspel en disco: alleen de vraag (tik de sommen met uitkomst 0 aan;
 *    kies het antwoord), zonder tijdsdruk of levens, zonder bonusspel.
 *  - Geld: alleen de officiële plaatjes uit public/geld/.
 *  - Over het tiental: de uitleg van Squla bij Minsommen level 3, "eerst terug
 *    naar 10, dan de rest eraf", is de basis van Bliepo's uitleg (samen), in
 *    beeld: eerst worden de dingen (of stippen) onder de tien grijs, dan de rest.
 *
 * De hulp is de vaste hulp van Bliepo (squla-hulp.ts). Squla laat bij een fout
 * alleen de som zien; Bliepo laat het in beeld zien: wat eraf gaat, wordt grijs
 * en half doorzichtig (ONTWERPREGELS.md, aftreksommen), en het kind telt zelf
 * wat er over is. Bliepo zegt het antwoord nooit voor.
 */

import { bevestig, krijgtVervolgvraag, isBegeleideUitleg, uitlegKeuze, zetSynthesisHulp } from "./squla-uitleg";
import type { Lesdraaiboek, Lesgids } from "../soort";
import { speelLesgeluid } from "@/lib/lesgeluiden";
import { squlaBegin, squlaEind, squlaVraag as echteSqulaVraag, type SqulaVraag } from "./squla-hulp";
import { KaartMinsommen, SqulaMinVlak, type Bakje, type Ding, type Geld, type MinVlakProps, type Speelgoed, type Toneel } from "../vlakken/squla-minsommen-vlak";
import { DING } from "../vlakken/squla-minsommen-tekenen";
import { basisNaam, KLEURHEX, somKleuren } from "../vlakken/squla-getalring";

/* =====================================================================
   Woorden
   ===================================================================== */

/**
 * Een getal in de zin: altijd in de kleur van dat getal, dus precies zoals in de som
 * en zoals de ring om de voorwerpen (BOUWREGELS 2.1 en 2.2). `_k` blijft staan zodat
 * de oude aanroepen niet veranderen.
 */
/*
 * De kleuren van de som die nu in beeld staat (BOUWREGELS 2.1, 14.22, 14.24): `somKleuren` geeft de twee getallen altijd
 * twee duidelijk verschillende kleuren (ook bij 10 − 10 en 14 − 7); het eerste getal en wat overblijft hebben de ene
 * kleur, het tweede getal en wat weggaat de andere. Dezelfde kleuren staan in de som, in de zin en op de voorwerpen.
 */
let kp: { a: number; b: number; ka: string; kb: string } | null = null;
/** Bij twee gelijke getallen (10 − 10) krijgt de eerste keer dat het getal in een zin staat de ene kleur, de tweede keer de andere. */
let tl = 0;
function stelSom(a: number, b: number) {
  tl = 0;
  if (kp && kp.a === a && kp.b === b) return;
  const [ka, kb] = somKleuren(a, b);
  kp = { a, b, ka, kb };
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const g = (n: number, _k = "wit") => {
  let naam = basisNaam(n);
  if (kp) {
    if (n === kp.a && n === kp.b) naam = tl++ % 2 === 0 ? kp.ka : kp.kb;
    else if (n === kp.a) naam = kp.ka;
    else if (n === kp.b) naam = kp.kb;
  }
  return `{${n}:${naam}}`;
};
/** De stippen in de hulp en uitleg hebben de kleur van het eerste getal (BOUWREGELS 2.1); wat weggaat wordt grijs (14.22). */
const stipStand = (n: number, grijs: number) => ({ n, grijs, kleur: kp ? KLEURHEX[kp.ka] : undefined });
/** Wat overblijft (de uitkomst) heeft de kleur van het eerste getal. */
const gu = (n: number) => `{${n}:${kp ? kp.ka : basisNaam(n)}}`;
/** "7 − 4" in de zin (wit). */
const somZin = (a: number, b: number, k = "wit") => `${g(a, k)} − ${g(b, k)}`;
/** Een som als knop of in beeld. */
const somTekst = (a: number, b: number, teken: "−" | "+" = "−") => `${a} ${teken} ${b} = ${teken === "−" ? a - b : a + b}`;

/** Wat de dingen in de ruimte doen (meervoud, enkelvoud). */
const RUIMTE: Record<Ding, { waar: string; weg: string; wegEen: string }> = {
  raketje: { waar: "Er staan {a} raketjes klaar.", weg: "{b} raketjes vliegen weg.", wegEen: "{b} raketje vliegt weg." },
  ballon: { waar: "Er zweven {a} ballonnen in de lucht.", weg: "{b} ballonnen vliegen weg.", wegEen: "{b} ballon vliegt weg." },
  zeepbel: { waar: "Er zweven {a} bellen.", weg: "{b} bellen knappen.", wegEen: "{b} bel knapt." },
  ufo: { waar: "Er vliegen {a} ufo's rond.", weg: "{b} ufo's vliegen weg.", wegEen: "{b} ufo vliegt weg." },
  satelliet: { waar: "Er draaien {a} satellieten rond de aarde.", weg: "{b} satellieten vallen terug naar de aarde.", wegEen: "{b} satelliet valt terug naar de aarde." },
  ster: { waar: "Er staan {a} sterren aan de hemel.", weg: "{b} sterren vallen naar beneden.", wegEen: "{b} ster valt naar beneden." },
  komeet: { waar: "Er vliegen {a} kometen door de ruimte.", weg: "{b} kometen verdwijnen.", wegEen: "{b} komeet verdwijnt." },
};

const vul = (zin: string, a: number, b: number, k: string) => zin.replace("{a}", g(a, k)).replace("{b}", g(b, k));

/** Het verhaaltje in de ruimte: wat er is, wat er weggaat (of wat de ufo meeneemt). */
function ruimteVerhaal(ding: Ding, a: number, b: number, ufo?: boolean): string[] {
  const z = RUIMTE[ding];
  const k = DING[ding].kleur;
  const eerste = vul(z.waar, a, b, k);
  if (!ufo) return [eerste, vul(b === 1 ? z.wegEen : z.weg, a, b, k)];
  if (b === a) return [eerste, "De ufo neemt ze allemaal mee."];
  if (b === 0) return [eerste, "De ufo neemt er geen enkele mee."];
  return [eerste, `De ufo neemt er ${g(b, k)} mee.`];
}
const hoeveelOver = (ding: Ding) => `Hoeveel ${DING[ding].veel} blijven er over?`;

const SPEELGOED: Record<Speelgoed, string> = { ijsje: "het ijsje", bal: "de bal", boek: "het boek", ballon: "de ballon", vlieger: "de vlieger" };
const BAKJE: Record<Bakje, { veel: string }> = { beker: { veel: "bekers" }, bordje: { veel: "bordjes" } };
const hoofd = (z: string) => z[0].toUpperCase() + z.slice(1);

/* =====================================================================
   Vragen
   ===================================================================== */

type SomKeuze = [number, number, ("−" | "+")?];

type Vraag =
  /* Minsommen (onderwater) */
  | { t: "verhaal"; ding: Ding; a: number; b: number; keuzes: number[] }
  | { t: "kaal"; ding?: Ding; deco?: Ding; a: number; b: number; keuzes: number[] }
  | { t: "welke"; ding: Ding; a: number; b: number; ufo?: boolean; keuzes: SomKeuze[] }
  | { t: "disco"; a: number; b: number; keuzes: number[]; luister?: boolean }
  | { t: "luister"; ding: Ding; a: number; b: number; keuzes: number[] }
  | { t: "typen"; a: number; b: number; deco?: Ding }
  | { t: "verbind"; sommen: [number, number][]; uitkomsten: number[] }
  | { t: "bubbels"; sommen: [number, number][] }
  /* Bussommen */
  | { t: "bus"; a: number; b: number; keuzes?: number[]; rondje: boolean }
  /* Minsommen (machine) en kale sommen */
  | { t: "machine"; b: number; keuzes: number[] }
  | { t: "bord"; a: number; b: number; keuzes?: number[] }
  | { t: "bakjes"; ding: Bakje; vol: number; leeg: number; keuzes: SomKeuze[] }
  | { t: "geld"; heb: Geld[]; prijs: Geld[]; ding: Speelgoed; keuzes: number[] };

/**
 * Het beginscherm ("Kun je dit al?") laat de EERSTE vraag van de les zien, zonder dat het
 * kind iets hoeft te doen: tijdens het voorbeeld zet `squlaVraag` alleen het beeld neer
 * (geen vraag, geen antwoord). Zo blijft het voorbeeld altijd gelijk aan de eerste vraag.
 */
let voorbeeldAan = false;
function squlaVraag<T>(l: Lesgids, v: SqulaVraag<T>): Promise<boolean> {
  if (voorbeeldAan) {
    v.toon?.();
    return Promise.resolve(true);
  }
  /* Hulp zoals Synthesis (BOUWREGELS 5.1): elke vraag in deze lessen heeft `reactie` en `toonAntwoord`. */
  return echteSqulaVraag(l, { ...v, synthesis: true });
}

type Stand = { huidig: string; nr: number; goed: number; fout: number; typUitgelegd: boolean; verbindKeer: number; bubbelKeer: number };

const zet = (l: Lesgids, p: Partial<MinVlakProps>) => l.pasVlakAan<MinVlakProps>(p);
const LEEG: Partial<MinVlakProps> = { som: null, grijs: 0, licht: null, stippen: null, uitkomst: null };

/** Een toneel in beeld zetten (nieuw: Bliepo tovert het tevoorschijn; zelfde: alleen de hulp weghalen). */
function toon(l: Lesgids, st: Stand, t: Toneel, extra: Partial<MinVlakProps> = {}) {
  /* Zelfde vraag (nog een keer, of na de uitleg): de hulp in beeld blijft staan. */
  if (st.huidig === t.id) return;
  st.huidig = t.id;
  zet(l, { toneel: t, ...LEEG, verbind: null, bubbels: null, ...extra });
  speelLesgeluid("verschijn");
}

const goedBeeld = (l: Lesgids, st: Stand, extra: Partial<MinVlakProps> = {}) => zet(l, { goed: ++st.goed, licht: null, ...extra });
const foutBeeld = (l: Lesgids, st: Stand) => zet(l, { fout: ++st.fout });

/** Kiezen uit getallen. */
async function kiesGetal(l: Lesgids, keuzes: number[]) {
  return Number(await l.kies(keuzes.map(String), { weetniet: false, direct: true }));
}

/** Een getal typen (echt invoerveld, HARDE REGEL 5). De eerste keer wijst Bliepo het vinkje aan. */
async function typGetal(l: Lesgids, st: Stand, tip: string[]): Promise<number> {
  const p = l.getal();
  if (!st.typUitgelegd) {
    st.typUitgelegd = true;
    /* Alleen aanwijzen: de vraag (met "Typ het getal.") blijft in beeld (BOUWREGELS 14.25). */
    await l.wijsAan("controleer");
  }
  let x = await p;
  while (x === null) {
    await l.zeg("Je mag het zelf proberen.", ...tip);
    x = await l.getal();
  }
  return x;
}

/* ---------- Bliepo's uitleg in beeld: wat eraf gaat wordt grijs ---------- */

type Beeld = "ruimte" | "bus" | "stippen";

/** Over het tiental terug (12 − 4, 15 − 8): eerst terug naar 10, dan de rest. */
const overTien = (a: number, b: number) => a > 10 && b > 0 && b < a && a - b < 10;

/** Tip na de uitleg (zonder het antwoord). */
function rekenTip(a: number, b: number, wat: string): string[] {
  if (overTien(a, b)) return [`Eerst terug naar ${g(10)}.`, b - (a - 10) === 1 ? `Dan gaat er nog ${g(1)} weg.` : `Dan gaan er nog ${g(b - (a - 10))} weg.`];
  if (wat === "") return [`Begin bij ${g(a)} en tel ${g(b)} terug.`];
  return [telZin(wat)];
}

/** Een hint zonder vraag: het kind probeert meteen opnieuw, dus Bliepo stelt de vraag niet nog eens (BOUWREGELS 3.23). */
const zonderVraag = (zinnen: string[]) => zinnen.filter((z) => !z.trim().endsWith("?"));

/**
 * Eerste fout bij een minsom (BOUWREGELS 5.10): wat koos het kind, en wat deed het waarschijnlijk? Rekenkundig
 * gecontroleerd: bij min is het antwoord kleiner dan het eerste getal (als er iets afgaat) en groter dan of gelijk aan 0.
 */
function minReactie(a: number, b: number, x: number, tip: string[], wat = "stippen"): string[] {
  const u = a - b;
  const hint = zonderVraag(tip);
  const gaat = b === 1 ? "gaat" : "gaan";
  if (wat === "") {
    if (x === a + b) return [`Je koos ${g(x)}: alsof er ${g(b)} bij ${b === 1 ? "komt" : "komen"}.`, "Maar bij min wordt het minder.", ...hint];
    if (x === a) return [`Je koos ${g(x)}: dat is het getal waar je mee begint.`, "Bij min wordt het minder, dus het antwoord is kleiner.", ...hint];
    if (x === b) return [`Je koos ${g(x)}: dat is het getal dat eraf gaat.`, "De vraag gaat over wat er overblijft.", ...hint];
    if (x > a) return [`Je koos ${g(x)}. Bij min wordt het minder, dus het antwoord is kleiner dan ${g(a)}.`, ...hint];
    return [x > u ? `Je koos ${g(x)}, maar het antwoord is kleiner.` : `Je koos ${g(x)}, maar het antwoord is groter.`, ...hint];
  }
  if (x === a + b) return [`Je koos ${g(x)}: alsof er ${g(b)} bij ${b === 1 ? "komt" : "komen"}.`, `Maar er ${gaat} er ${g(b)} weg.`, ...hint];
  if (x === a) return [`Je koos ${g(x)}: zoveel ${wat} waren er eerst.`, `Er ${gaat} er nog ${g(b)} weg, dus er blijven er minder over.`, ...hint];
  if (x === b) return [`Je koos ${g(x)}: zoveel ${wat} ${gaat} er weg.`, "De vraag gaat over wat er blijft.", ...hint];
  if (x > a) return [`Je koos ${g(x)}, maar er waren er maar ${g(a)}.`, "Als er iets weggaat, blijven er minder over.", ...hint];
  if (x === u + 1 || x === u - 1) return [x > u ? `${g(x)} is 1 te veel: er blijven er niet zoveel.` : `Er blijven er 1 meer dan ${g(x)}.`, `Tel de ${wat} die blijven nog eens na.`, ...hint];
  return [x > u ? `Je koos ${g(x)}, maar er blijven minder ${wat} over.` : `Je koos ${g(x)}, maar er blijven meer ${wat} over.`, ...hint];
}

/** Na de tweede fout: het goede antwoord in beeld (wat weggaat is grijs) en in woorden. */
async function toonMin(l: Lesgids, a: number, b: number, zin: string, extra: Partial<MinVlakProps> = {}) {
  zet(l, { som: `${a} − ${b} = ${a - b}`, grijs: b, ...extra });
  await l.zeg(zin);
  await l.wacht(400);
}

/** Welke som past, als het kind een somknop koos: wat klopt er niet aan? (`n` = het eerste getal, `b` = wat eraf gaat) */
function welkeReactie(x: string, n: number, b: number, eerst: string, na: string): string[] {
  const m = x.match(/^(\d+) ([−+]) (\d+)/);
  if (!m) return [eerst];
  if (m[2] === "+") return [`${g(Number(m[1]))} + ${g(Number(m[3]))} is een plussom.`, "Hier gaat er iets weg, dus het is een minsom."];
  if (Number(m[1]) !== n) return [`${somZin(Number(m[1]), Number(m[3]))} begint met een ander getal.`, eerst];
  if (Number(m[3]) !== b) return [`${somZin(Number(m[1]), Number(m[3]))} haalt een ander getal weg.`, na];
  return [eerst, na];
}

/** "Tel de raketjes die over zijn."; bij de bus: "Tel de pakjes die nog in de bus liggen." */
const telZin = (wat: string) => (wat === "pakjes in de bus" ? "Tel de pakjes die nog in de bus liggen." : `Tel de ${wat} die over zijn.`);

/**
 * Samen uitrekenen: Bliepo laat zien wat er eraf gaat (grijs), bij een som over
 * het tiental eerst terug naar 10 en dan de rest. Het kind telt zelf wat er over
 * is. `k` = de kleur van de getallen.
 */
async function samenRekenen(l: Lesgids, a: number, b: number, beeld: Beeld, k: string, wat: string) {
  const stip = (grijs: number) => (beeld === "stippen" ? zet(l, { stippen: stipStand(a, grijs) }) : zet(l, { grijs }));
  /* "Er gaan er 3 af", "Er gaat er 1 af"; bij de bus "Er gaan er 3 uit". */
  const gaan = (n: number) => (n === 1 ? "gaat" : "gaan");
  const af = beeld === "bus" ? "uit" : "weg";
  stip(0);
  zet(l, { licht: beeld === "stippen" ? "stippen" : "alle" });
  if (beeld === "bus") await l.zeg(`Eerst lagen er ${g(a, k)} pakjes in de bus.`);
  else if (beeld === "ruimte") await l.zeg(`We beginnen met ${g(a, k)} ${wat}.`);
  else await l.zeg(`Ik zet ${g(a, k)} stippen neer.`);
  zet(l, { licht: null });
  if (b === 0) {
    await l.zeg(beeld === "bus" ? "Er gaat niets uit." : "Er gaat niets weg.");
  } else if (overTien(a, b)) {
    const r1 = a - 10;
    const r2 = b - r1;
    await l.zeg(`Er ${gaan(b)} er ${g(b, k)} ${af}.`, `Eerst ${gaan(r1)} er ${g(r1, k)} ${af}.`);
    stip(r1);
    await l.wacht(r1 * 260 + 300);
    await l.zeg(beeld === "bus" ? `Dan liggen er nog ${g(10, k)} in.` : `Dan zijn er nog ${g(10, k)}.`, `Daarna ${gaan(r2)} er nog ${g(r2, k)} ${af}.`);
    stip(b);
    await l.wacht(r2 * 260 + 300);
  } else {
    await l.zeg(b === a && beeld !== "bus" ? `Ze gaan er alle ${g(b, k)} weg.` : `Er ${gaan(b)} er ${g(b, k)} ${af}.`);
    stip(b);
    await l.wacht(Math.min(b, 10) * 260 + 300);
  }
  /* Geen rondje om wat overblijft: de vraag "hoeveel zijn er over?" volgt, en het rondje zou het antwoord verklappen (BOUWREGELS 7.8). */
  zet(l, { licht: null });
  if (b !== a || !krijgtVervolgvraag(l)) await l.zeg(b === a ? "Wat blijft er dan over?" : telZin(wat));
}

/* ---------- de vragen zelf ---------- */

function ruimteToneel(st: Stand, ding: Ding, n: number, ufo?: boolean, b?: number): Toneel {
  return { soort: "ruimte", id: `ruimte-${st.nr}`, ding, n, b, ufo: !!ufo };
}

/** De twee getallen van de som die bij deze vraag in beeld staat (voor de kleuren). */
function somVan(v: Vraag): [number, number] | null {
  if (v.t === "geld") return [v.heb.reduce((t, x) => t + x, 0), v.prijs.reduce((t, x) => t + x, 0)];
  if (v.t === "bakjes") return [v.vol + v.leeg, v.leeg];
  if (v.t === "machine") return [10, v.b];
  if (v.t === "verbind" || v.t === "bubbels") return null;
  return [v.a, v.b];
}

async function speelVraag(l: Lesgids, v: Vraag, st: Stand): Promise<boolean> {
  st.nr++;
  const sv = somVan(v);
  if (sv) stelSom(sv[0], sv[1]);
  const id = `v${st.nr}`;

  /* Verhaaltje in de ruimte (met de som in het plaatje), of een kale som naast de dingen. */
  if (v.t === "verhaal" || v.t === "kaal" || v.t === "luister") {
    const u = v.a - v.b;
    const ding = v.ding;
    const k = ding ? DING[ding].kleur : "wit";
    const toneel: Toneel = ding ? ruimteToneel(st, ding, v.a, undefined, v.b) : { soort: "som", id, deco: v.t === "kaal" ? (v.deco ?? null) : null };
    const somInBeeld = v.t === "verhaal" ? `${v.a} − ${v.b}` : v.t === "kaal" ? `${v.a} − ${v.b} = ?` : null;
    const vraag =
      v.t === "kaal"
        ? [`Hoeveel is ${somZin(v.a, v.b)}?`]
        : v.t === "verhaal"
          ? [...ruimteVerhaal(v.ding, v.a, v.b), hoeveelOver(v.ding)]
          : [...ruimteVerhaal(v.ding, v.a, v.b), hoeveelOver(v.ding), `Is het ${v.keuzes.slice(0, -1).map((n) => g(n, k)).join(", ")} of ${g(v.keuzes[v.keuzes.length - 1], k)}?`];
    const wat = ding ? DING[ding].veel : "stippen";
    /* Een kale som zonder dingen: er staan geen stippen in beeld, dus de hint verwijst er niet naar. */
    const watHint = ding ? wat : "";
    return squlaVraag<number>(l, {
      toon: () => toon(l, st, toneel, { som: somInBeeld }),
      vraag,
      antwoord: () => kiesGetal(l, v.keuzes),
      isGoed: (x) => x === u,
      noem: (x) => g(x, k),
      goed: async () => {
        goedBeeld(l, st, { som: `${v.a} − ${v.b} = ${u}`, grijs: v.b });
        await l.zeg(bevestig());
        await l.wacht(400);
      },
      fout: () => foutBeeld(l, st),
      samen: () => samenRekenen(l, v.a, v.b, ding ? "ruimte" : "stippen", k, wat),
      tip: rekenTip(v.a, v.b, watHint),
      reactie: (x) => minReactie(v.a, v.b, x, rekenTip(v.a, v.b, watHint), watHint),
      toonAntwoord: () => toonMin(l, v.a, v.b, ding && v.t !== "kaal" ? `${u === 1 ? `Er blijft ${gu(u)} over` : `Er blijven ${gu(u)} ${DING[ding].veel} over`}: ${somZin(v.a, v.b, k)} = ${gu(u)}.` : `${somZin(v.a, v.b, k)} = ${gu(u)}.`, { licht: ding ? "over" : null }),
      testAntwoord: u,
    });
  }

  /* Welke som hoort bij het verhaaltje? */
  if (v.t === "welke") {
    const u = v.a - v.b;
    const k = DING[v.ding].kleur;
    const goed = somTekst(v.a, v.b);
    const toneel = ruimteToneel(st, v.ding, v.a, v.ufo, v.b);
    const verhaal = ruimteVerhaal(v.ding, v.a, v.b, v.ufo);
    return squlaVraag<string>(l, {
      toon: () => toon(l, st, toneel),
      vraag: [...verhaal, hoeveelOver(v.ding), "Welke som hoort hierbij?"],
      antwoord: async () => (await l.kies(v.keuzes.map(([a, b, t]) => somTekst(a, b, t)), { weetniet: false, direct: true })) ?? "",
      isGoed: (x) => x === goed,
      noem: (x) => x,
      goed: async () => {
        goedBeeld(l, st, { som: goed, grijs: v.b });
        await l.zeg(bevestig());
        await l.wacht(400);
      },
      fout: () => foutBeeld(l, st),
      samen: async () => {
        zet(l, { grijs: 0, licht: "alle" });
        await l.zeg(`In het begin zijn er ${g(v.a, k)} ${DING[v.ding].veel}.`, "Dit getal zet je vooraan in de som.");
        zet(l, { licht: null, grijs: v.b });
        if (v.keuzes.some(([, , t]) => t === "+")) await l.zeg("Er gaan er een paar weg.", "Dus het is een minsom.");
        await l.wacht(Math.min(v.b, 10) * 260 + 300);
        zet(l, { licht: "eraf" });
        if (v.b === 0) await l.zeg("Er gaat niets weg.", `Dus na de min komt ${g(0, k)}.`);
        else await l.zeg(v.b === v.a ? `Ze gaan alle ${g(v.b, k)} weg.` : `Er gaan er ${g(v.b, k)} weg.`, "Dat getal komt na de min.");
        zet(l, { licht: "over" });
        await l.zeg("Wat overblijft, komt achter het is-teken.");
      },
      tip: ["Vooraan staat hoeveel er eerst waren.", "Na de min staat hoeveel er weggaan."],
      reactie: (x) => welkeReactie(x, v.a, v.b, "Vooraan staat het getal van alles wat er eerst was.", "Na de min staat het getal van wat weggaat."),
      toonAntwoord: () => toonMin(l, v.a, v.b, `Er waren ${g(v.a, k)} ${DING[v.ding].veel} en er gaan er ${g(v.b, k)} weg. Dat is ${somZin(v.a, v.b, k)} = ${gu(u)}.`, { licht: null }),
      testAntwoord: goed,
    });
  }

  /* Een kale som: disco (kiezen) of typen; de som staat groot in beeld, of wordt alleen gezegd. */
  if (v.t === "disco" || v.t === "typen") {
    const u = v.a - v.b;
    const luister = v.t === "disco" && v.luister;
    const toneel: Toneel = { soort: "som", id, deco: luister ? "luidspreker" : v.t === "typen" ? (v.deco ?? null) : null };
    const somInBeeld = luister ? null : `${v.a} − ${v.b} = ?`;
    /* Er staan geen stippen in beeld, alleen de som: de hint verwijst er niet naar. */
    const tip = rekenTip(v.a, v.b, "");
    return squlaVraag<number>(l, {
      toon: () => toon(l, st, toneel, { som: somInBeeld }),
      vraag: luister ? ["Luister goed.", `Hoeveel is ${somZin(v.a, v.b)}?`] : v.t === "typen" ? [`Hoeveel is ${somZin(v.a, v.b)}?`, "Typ het getal."] : [`Hoeveel is ${somZin(v.a, v.b)}?`],
      antwoord: () => (v.t === "typen" ? typGetal(l, st, tip) : kiesGetal(l, v.keuzes)),
      isGoed: (x) => x === u,
      noem: (x) => g(x),
      goed: async () => {
        goedBeeld(l, st, { som: `${v.a} − ${v.b} = ${u}` });
        await l.zeg(bevestig());
        await l.wacht(400);
      },
      fout: () => foutBeeld(l, st),
      samen: async () => {
        if (luister) zet(l, { som: `${v.a} − ${v.b} = ?` });
        await samenRekenen(l, v.a, v.b, "stippen", "wit", "stippen");
      },
      tip,
      reactie: (x) => minReactie(v.a, v.b, x, tip, ""),
      toonAntwoord: () => toonMin(l, v.a, v.b, `${somZin(v.a, v.b)} = ${gu(u)}.`),
      testAntwoord: u,
    });
  }

  /* Verbinden: drie sommen met raketjes, drie antwoorden. */
  if (v.t === "verbind") {
    const correct = v.sommen.map(([a, b]) => v.uitkomsten.indexOf(a - b));
    const toneel: Toneel = { soort: "verbind", id, sommen: v.sommen, uitkomsten: v.uitkomsten };
    let vast: (number | null)[] = [null, null, null];
    let laatsteFout = 0;
    /* De hulp van Bliepo: bij één som worden raketjes grijs (blijft staan tot het goed is). */
    let hint: { kaart: number; n: number } | null = null;
    const stand = (actief: boolean, goed = false) => zet(l, { verbind: { actief, vast, keer: st.verbindKeer, goed, kaartGrijs: hint } });
    return squlaVraag<(number | null)[]>(l, {
      toon: () => {
        if (st.huidig !== id) {
          st.huidig = id;
          zet(l, { toneel, ...LEEG, bubbels: null, verbind: { actief: false, vast, keer: st.verbindKeer } });
          speelLesgeluid("verschijn");
        }
      },
      vraag: ["Verbind elke som met het goede antwoord.", "Tik op een som en dan op het antwoord."],
      antwoord: async () => {
        stand(true);
        const gb = await l.wachtOpVlak<{ soort: string; paren: (number | null)[] }>("verbonden");
        return gb.paren;
      },
      isGoed: (x) => x.every((j, i) => j === correct[i]),
      noem: (x) => {
        const i = x.findIndex((j, k) => j !== correct[k]);
        laatsteFout = Math.max(0, i);
        const [a, b] = v.sommen[laatsteFout];
        const j = x[laatsteFout];
        return `${somZin(a, b)} = ${g(j === null ? 0 : v.uitkomsten[j])}`;
      },
      goed: async () => {
        vast = [...correct];
        hint = null;
        stand(false, true);
        goedBeeld(l, st);
        await l.zeg(bevestig());
        await l.wacht(400);
      },
      fout: (x) => {
        /* De goede lijnen blijven staan; de foute gaan weg. */
        laatsteFout = Math.max(0, x.findIndex((j, k) => j !== correct[k]));
        vast = x.map((j, i) => (j === correct[i] ? j : null));
        st.verbindKeer++;
        stand(false);
        foutBeeld(l, st);
      },
      samen: async () => {
        const [a, b] = v.sommen[laatsteFout];
        hint = null;
        stand(false);
        await l.zeg(`Kijk naar ${somZin(a, b)}.`, `Daar staan ${g(a, "rood")} raketjes.`);
        hint = { kaart: laatsteFout, n: b };
        stand(false);
        await l.zeg(`Er gaan er ${g(b, "rood")} weg.`, "Tel de raketjes die over zijn.", ...(krijgtVervolgvraag(l) ? [] : ["Zoek dat getal rechts."]));
      },
      tip: ["Tel de raketjes die niet grijs zijn."],
      reactie: () => {
        const [a, b] = v.sommen[laatsteFout];
        hint = { kaart: laatsteFout, n: b };
        stand(false);
        return [`Bij ${somZin(a, b)} hoort een ander antwoord. De goede lijnen blijven staan.`, "De raketjes die weggaan zijn nu grijs.", "Tel de raketjes die niet grijs zijn."];
      },
      toonAntwoord: async () => {
        vast = [...correct];
        hint = null;
        stand(false);
        await l.zeg("Zo horen ze bij elkaar.", ...v.sommen.map(([a, b]) => `${somZin(a, b)} = ${g(a - b)}.`));
        await l.wacht(400);
      },
      testAntwoord: null,
    });
  }

  /* Bubbels: tik de sommen waar 0 uitkomt (zonder tijdsdruk). Elke bubbel is een opgave. */
  if (v.t === "bubbels") {
    const nul = v.sommen.map(([a, b], i) => (a === b ? i : -1)).filter((i) => i >= 0);
    const weg: number[] = [];
    const toneel: Toneel = { soort: "bubbels", id, sommen: v.sommen };
    const bubbelStand = (actief: boolean, fout: { i: number; keer: number } | null = null) => zet(l, { bubbels: { actief, weg: [...weg], fout } });
    let allesGoed = true;
    for (let r = 0; r < nul.length; r++) {
      const nog = nul.length - r;
      const meteen = await squlaVraag<number>(l, {
        toon: () => {
          if (st.huidig !== id) {
            st.huidig = id;
            zet(l, { toneel, ...LEEG, verbind: null, bubbels: { actief: false, weg: [], fout: null } });
            speelLesgeluid("verschijn");
          }
        },
        vraag: r === 0 ? [`Tik op de sommen waar ${g(0)} uitkomt.`, `Er zijn er ${g(nul.length)}.`] : [nog === 1 ? "Er is er nog 1." : `Er zijn er nog ${g(nog)}.`, `Tik op een som waar ${g(0)} uitkomt.`],
        antwoord: async () => {
          bubbelStand(true);
          const gb = await l.wachtOpVlak<{ soort: string; i: number }>("bubbel");
          bubbelStand(false);
          return gb.i;
        },
        isGoed: (i) => nul.includes(i) && !weg.includes(i),
        noem: (i) => somZin(v.sommen[i][0], v.sommen[i][1]),
        goed: async (i) => {
          weg.push(i);
          bubbelStand(false);
          await l.zeg(bevestig());
        },
        fout: (i) => bubbelStand(false, { i, keer: ++st.bubbelKeer }),
        samen: async () => {
          await l.zeg("Bij een som met uitkomst {0:wit} gaat alles weg.", "Dan blijft er niets over.", "Je haalt er net zoveel af als er waren.", "Dan staat er 2 keer hetzelfde getal.");
        },
        tip: ["Zoek een som waar je evenveel haalt als er waren."],
        reactie: (i) =>
          weg.includes(i)
            ? ["Die bubbel heb je al weggetikt.", "Zoek een som waar je evenveel haalt als er waren."]
            : [`${somZin(v.sommen[i][0], v.sommen[i][1])} geeft ${g(v.sommen[i][0] - v.sommen[i][1])}, niet ${g(0)}.`, "Zoek een som waar je evenveel haalt als er waren."],
        toonAntwoord: async () => {
          const i = nul.find((j) => !weg.includes(j));
          if (i === undefined) return;
          weg.push(i);
          bubbelStand(false);
          await l.zeg(`Kijk: ${somZin(v.sommen[i][0], v.sommen[i][1])} = ${g(0)}.`, "Er blijft niets over.");
        },
        testAntwoord: `b${nul.find((i) => !weg.includes(i))}`,
      });
      if (!meteen) allesGoed = false;
    }
    goedBeeld(l, st);
    await l.zeg("Je hebt ze allemaal gevonden!");
    return allesGoed;
  }

  /* Bussommen: de bus bezorgt pakjes (bij Squla stappen er kinderen uit). */
  if (v.t === "bus") {
    const u = v.a - v.b;
    const toneel: Toneel = { soort: "bus", id, in: v.a, b: v.b, rondje: v.rondje };
    const tip = rekenTip(v.a, v.b, "pakjes in de bus");
    let verteld = false;
    return squlaVraag<number>(l, {
      toon: () => {
        const nieuw = st.huidig !== id;
        toon(l, st, toneel, { grijs: nieuw ? 0 : v.b });
      },
      vraag: [`In de bus liggen ${g(v.a, "bruin")} pakjes.`, `De bus bezorgt er ${g(v.b, "bruin")}.`, "Hoeveel pakjes liggen er nu nog in de bus?", ...(v.keuzes ? [] : ["Typ het getal."])],
      antwoord: async () => {
        /* Het beeld volgt het verhaal: eerst zitten ze er allemaal in, dan stappen ze uit. */
        if (!verteld) {
          verteld = true;
          zet(l, { grijs: v.b });
        }
        return v.keuzes ? kiesGetal(l, v.keuzes) : typGetal(l, st, tip);
      },
      isGoed: (x) => x === u,
      noem: (x) => g(x, "bruin"),
      goed: async () => {
        goedBeeld(l, st, { som: `${v.a} − ${v.b} = ${u}`, grijs: v.b });
        await l.zeg(bevestig());
        await l.wacht(400);
      },
      fout: () => foutBeeld(l, st),
      samen: () => samenRekenen(l, v.a, v.b, "bus", "bruin", "pakjes in de bus"),
      tip,
      reactie: (x) => minReactie(v.a, v.b, x, tip, "pakjes"),
      toonAntwoord: () => toonMin(l, v.a, v.b, u === 1 ? `Er ligt nog ${gu(1)} pakje in de bus.` : `Er liggen nog ${gu(u)} pakjes in de bus.`, { licht: "over" }),
      testAntwoord: u,
    });
  }

  /* De min-machine: 10 erin, de machine haalt er wat af. */
  if (v.t === "machine") {
    const u = 10 - v.b;
    const toneel: Toneel = { soort: "machine", id, start: 10, eraf: v.b };
    return squlaVraag<number>(l, {
      toon: () => toon(l, st, toneel),
      vraag: [`${g(10)} blokjes gaan de machine in.`, `De machine haalt er ${g(v.b)} af.`, "Hoeveel blokjes komen eruit?"],
      antwoord: () => kiesGetal(l, v.keuzes),
      isGoed: (x) => x === u,
      noem: (x) => g(x),
      goed: async () => {
        goedBeeld(l, st, { uitkomst: u, som: `10 − ${v.b} = ${u}` });
        await l.zeg(bevestig());
        await l.wacht(400);
      },
      fout: () => foutBeeld(l, st),
      samen: () => samenRekenen(l, 10, v.b, "stippen", "wit", "stippen"),
      tip: rekenTip(10, v.b, "blokjes"),
      reactie: (x) => minReactie(10, v.b, x, rekenTip(10, v.b, "blokjes"), "blokjes"),
      toonAntwoord: async () => {
        zet(l, { uitkomst: u, som: `10 − ${v.b} = ${u}` });
        await l.zeg(`De machine haalt er ${g(v.b)} af. Dan ${u === 1 ? "komt" : "komen"} er ${gu(u)} ${u === 1 ? "blokje" : "blokjes"} uit: ${somZin(10, v.b)} = ${gu(u)}.`);
        await l.wacht(400);
      },
      testAntwoord: u,
    });
  }

  /* Het schoolbord: kiezen of typen. */
  if (v.t === "bord") {
    const u = v.a - v.b;
    const toneel: Toneel = { soort: "bord", id };
    /* Op het bord staat alleen de som, geen stippen: de hint verwijst er niet naar. */
    const tip = rekenTip(v.a, v.b, "");
    return squlaVraag<number>(l, {
      toon: () => toon(l, st, toneel, { som: `${v.a} − ${v.b} = ?` }),
      vraag: v.keuzes ? [`Hoeveel is ${somZin(v.a, v.b)}?`] : [`Hoeveel is ${somZin(v.a, v.b)}?`, "Typ het getal."],
      antwoord: () => (v.keuzes ? kiesGetal(l, v.keuzes) : typGetal(l, st, tip)),
      isGoed: (x) => x === u,
      noem: (x) => g(x),
      goed: async () => {
        goedBeeld(l, st, { som: `${v.a} − ${v.b} = ${u}` });
        await l.zeg(bevestig());
        await l.wacht(400);
      },
      fout: () => foutBeeld(l, st),
      samen: () => samenRekenen(l, v.a, v.b, "stippen", "wit", "stippen"),
      tip,
      reactie: (x) => minReactie(v.a, v.b, x, tip, ""),
      toonAntwoord: () => toonMin(l, v.a, v.b, `${somZin(v.a, v.b)} = ${gu(u)}.`),
      testAntwoord: u,
    });
  }

  /* Welke som hoort bij het plaatje? (volle en lege bekers of bordjes) */
  if (v.t === "bakjes") {
    const n = v.vol + v.leeg;
    const goed = somTekst(n, v.leeg);
    const wat = BAKJE[v.ding].veel;
    const toneel: Toneel = { soort: "bakjes", id, ding: v.ding, vol: v.vol, leeg: v.leeg };
    return squlaVraag<string>(l, {
      toon: () => toon(l, st, toneel),
      vraag: [`Kijk naar de ${wat}.`, "Welke som hoort bij het plaatje?"],
      antwoord: async () => (await l.kies(v.keuzes.map(([a, b, t]) => somTekst(a, b, t)), { weetniet: false, direct: true })) ?? "",
      isGoed: (x) => x === goed,
      noem: (x) => x,
      goed: async () => {
        goedBeeld(l, st, { som: goed });
        await l.zeg(bevestig());
        await l.wacht(400);
      },
      fout: () => foutBeeld(l, st),
      samen: async () => {
        zet(l, { licht: "alle" });
        await l.zeg(`Tel eerst alle ${wat} samen.`, "Dat aantal staat vooraan in de som.");
        zet(l, { licht: "leeg" });
        if (v.leeg === 1) await l.zeg(`${v.ding === "beker" ? "De lege beker gaat" : "Het lege bordje gaat"} weg.`, "Dat getal komt na de min.");
        else await l.zeg(`De lege ${wat} gaan weg.`, "Tel ze.", "Dat getal komt na de min.");
        zet(l, { licht: null });
      },
      tip: [`Vooraan staan alle ${wat}.`, `Na de min staan de lege ${wat}.`],
      reactie: (x) => welkeReactie(x, n, v.leeg, `Vooraan staat het getal van alle ${wat}, ook de lege.`, `Na de min staat het getal van de lege ${wat}.`),
      toonAntwoord: () => toonMin(l, n, v.leeg, `Er zijn ${g(n)} ${wat}. De ${g(v.leeg)} lege ${v.leeg === 1 ? "gaat" : "gaan"} weg: ${somZin(n, v.leeg)} = ${gu(v.vol)}.`, { som: goed, grijs: 0, licht: "leeg" }),
      testAntwoord: goed,
    });
  }

  /* Geld: hoeveel houd je over? */
  const heb = v.heb.reduce((t, x) => t + x, 0);
  const prijs = v.prijs.reduce((t, x) => t + x, 0);
  const u = heb - prijs;
  const toneel: Toneel = { soort: "geld", id, heb: v.heb, prijs: v.prijs, ding: v.ding };
  return squlaVraag<number>(l, {
    toon: () => toon(l, st, toneel),
    vraag: ["Kijk naar je geld.", `Je koopt ${SPEELGOED[v.ding]}.`, "Hoeveel euro houd je over?"],
    antwoord: () => kiesGetal(l, v.keuzes),
    isGoed: (x) => x === u,
    noem: (x) => `${g(x)} euro`,
    goed: async () => {
      goedBeeld(l, st, { som: `${heb} − ${prijs} = ${u}` });
      await l.zeg(bevestig());
      await l.wacht(400);
    },
    fout: () => foutBeeld(l, st),
    samen: async () => {
      const briefje = v.heb.find((x) => x >= 5);
      await l.zeg("We tellen eerst je geld.");
      if (briefje) await l.zeg(`Een briefje van ${g(briefje)} is ${g(briefje)} euro.`);
      await l.zeg(`Samen heb je ${g(heb)} euro.`, "Voor elke euro zet ik een stip.");
      zet(l, { stippen: stipStand(heb, 0) });
      await l.wacht(heb * 25 + 400);
      await l.zeg(`${hoofd(SPEELGOED[v.ding])} kost ${g(prijs)} euro.`, prijs === 1 ? "Die gaat weg." : "Die gaan weg.");
      zet(l, { stippen: stipStand(heb, prijs) });
      await l.wacht(prijs * 200 + 400);
      await l.zeg("Tel de stippen die over zijn.");
    },
    tip: ["Tel de stippen die over zijn."],
    reactie: (x) =>
      x === heb
        ? [`${g(heb)} euro had je.`, "Je koopt iets, dus je houdt minder over.", "Tel de stippen die over zijn."]
        : x === heb + prijs
          ? [`${g(x)} euro is ${g(heb)} plus ${g(prijs)}.`, "Je betaalt, dus er gaat geld af."]
          : x === prijs
            ? [`${g(prijs)} euro is wat het kost.`, "Het gaat om wat je overhoudt."]
            : [x > u ? `Je houdt minder over dan ${g(x)} euro.` : `Je houdt meer over dan ${g(x)} euro.`, "Tel de stippen die over zijn."],
    toonAntwoord: () => toonMin(l, heb, prijs, `Je had ${g(heb)} euro en betaalt ${g(prijs)} euro. Je houdt ${gu(u)} euro over.`, { grijs: 0, stippen: stipStand(heb, prijs) }),
    testAntwoord: u,
  });
}

/* =====================================================================
   Een hele les
   ===================================================================== */

type MinLes = {
  id: string;
  titel: string;
  oefening: string;
  level: number;
  welkom: string[];
  vragen: Vraag[];
  eind: string;
};

/** Welke vaste plaatjes een vraag tekent (voor `voorwerpen` in het draaiboek). */
function voorwerpenVanVraag(v: Vraag): string[] {
  if (v.t === "verhaal" || v.t === "luister") return [v.ding];
  if (v.t === "kaal") return v.ding ? [v.ding] : v.deco ? [v.deco] : [];
  if (v.t === "welke") return v.ufo ? [v.ding, "ufo"] : [v.ding];
  if (v.t === "typen") return v.deco ? [v.deco] : [];
  if (v.t === "verbind") return ["raketje"];
  if (v.t === "bubbels") return ["zeepbel"];
  if (v.t === "bus") return ["bezorgbus", "pakje"];
  if (v.t === "bord") return ["schoolbord"];
  if (v.t === "bakjes") return v.ding === "beker" ? ["beker-vol", "beker-leeg"] : ["bord", "koekje"];
  if (v.t === "geld") return ["portemonnee", v.ding];
  return [];
}

function minles(m: MinLes): Lesdraaiboek {
  return {
    voorwerpen: [...new Set(m.vragen.flatMap(voorwerpenVanVraag))],
    id: m.id,
    titel: m.titel,
    synthesis: `Squla groep 3 · Minsommen · ${m.oefening} · level ${m.level} (alleen leerdoel)`,
    indeling: "synthesis",
    nacht: true,
    browserstem: true,
    kaarttekening: KaartMinsommen,
    async speel(l) {
      const st: Stand = { huidig: "", nr: 0, goed: 0, fout: 0, typUitgelegd: false, verbindKeer: 0, bubbelKeer: 0 };
      zetSynthesisHulp(l);
      l.vlak<MinVlakProps>(SqulaMinVlak, { toneel: null });
      const voorbeeldAfgerond = await squlaBegin(l, {
        welkom: m.welkom,
        uitleg: () => uitlegVan(m.vragen[0])(l, st),
        samen: () => uitlegVan(m.vragen[0])(l, st),
        /* Het beginscherm laat de eerste vraag van de les zien (BOUWREGELS 4.1). */
        voorbeeld: () => {
          voorbeeldAan = true;
          try {
            void speelVraag(l, m.vragen[0], st).catch(() => {});
          } finally {
            voorbeeldAan = false;
          }
          /* De echte eerste vraag krijgt weer dezelfde naam (v1), dus het beeld blijft staan. */
          st.nr = 0;
        },
      });
      /* Na het voorbeeld tekent de eerste vraag zijn beeld zelf weer opnieuw. */
      st.huidig = "";
      let fouten = 0;
      // Bij bakjes oefent de uitleg het tellen; de eerste opgave vraagt nog om de som.
      const eersteAlBeantwoord = voorbeeldAfgerond && m.vragen[0].t !== "bakjes" && m.vragen[0].t !== "welke";
      for (const v of m.vragen.slice(eersteAlBeantwoord ? 1 : 0)) if (!(await speelVraag(l, v, st))) fouten++;
      zet(l, { toneel: null, ...LEEG, verbind: null, bubbels: null });
      await squlaEind(l, fouten, m.eind);
    },
  };
}

/* ---------- de korte uitleg (bij "Kun je dit al?" → Nee) ---------- */

/** In de ruimte: dingen, een paar gaan weg (grijs), tel wat er over is. */
async function vraagWatOverblijft(l: Lesgids, a: number, b: number, vraag: string, naam: string) {
  const rest = a - b;
  await uitlegKeuze(l, {
    vraag, keuzes: [String(rest + 1), String(rest), String(rest === 0 ? 2 : rest - 1)],
    antwoord: String(rest),
    hint: `Tel de ${naam} die er nog zijn. Wat weg is, hoef je niet mee te tellen.`,
    goed: bevestig(),
    reactie: (x) => [Number(x) === a ? `${g(a)} waren er eerst. Er gaan er ${g(b)} af.` : Number(x) > rest ? `Er blijven er minder over dan ${g(Number(x))}.` : `Er blijven er meer over dan ${g(Number(x))}.`, `Tel de ${naam} die er nog zijn.`],
    laatZien: `Er blijven ${gu(rest)} over: ${somZin(a, b)} = ${gu(rest)}.`,
    hulp: async () => { await l.zeg(`Je begon met ${g(a)}. Er ${b === 1 ? "ging" : "gingen"} er ${g(b)} af. Tel de ${naam} die er nog zijn.`); },
  });
}

function uitlegRuimte(ding: Ding, a: number, b: number) {
  return async (l: Lesgids, st: Stand) => {
    const k = DING[ding].kleur;
    const veel = DING[ding].veel;
    const u = a - b;
    stelSom(a, b);
    toon(l, st, { soort: "ruimte", id: `uitleg-${ding}-${a}`, ding, n: a, b }, { som: `${a} − ${b}` });
    await l.zeg(...ruimteVerhaal(ding, a, b));
    if (overTien(a, b)) {
      const r1 = a - 10;
      await l.zeg(`Eerst gaan er ${g(r1, k)} weg.`);
      zet(l, { grijs: r1 });
      await l.wacht(r1 * 260 + 300);
      await l.zeg(`Dan zijn er nog ${g(10, k)}.`, `Daarna gaan er nog ${g(b - r1, k)} weg.`);
      zet(l, { grijs: b });
      await l.wacht((b - r1) * 260 + 300);
    } else {
      zet(l, { grijs: b });
      await l.wacht(b * 260 + 300);
    }
    if (isBegeleideUitleg(l)) {
      zet(l, { licht: null });
      await vraagWatOverblijft(l, a, b, `Tel de ${veel} die overblijven. Hoeveel zijn het er?`, veel);
      zet(l, { licht: null, som: `${a} − ${b} = ${u}` });
      return;
    }
    zet(l, { licht: "over" });
    await l.zeg(u === 1 ? `Er blijft ${gu(u)} over.` : `Er blijven ${gu(u)} ${veel} over.`);
    zet(l, { licht: null, som: `${a} − ${b} = ${u}` });
    await l.zeg(`Dat is de minsom ${somZin(a, b, k)} = ${gu(u)}.`);
  };
}

/** De bus: alle pakjes liggen erin, de bus bezorgt er een paar. */
function uitlegBus(a: number, b: number, rondje: boolean) {
  return async (l: Lesgids, st: Stand) => {
    const u = a - b;
    const k = "bruin";
    stelSom(a, b);
    toon(l, st, { soort: "bus", id: `uitleg-bus-${a}`, in: a, b, rondje }, { grijs: 0 });
    await l.zeg(`In de bus liggen ${g(a, k)} pakjes.`, `De bus bezorgt er ${g(b, k)}.`);
    if (overTien(a, b)) {
      const r1 = a - 10;
      await l.zeg(`Eerst gaan er ${g(r1, k)} uit.`);
      zet(l, { grijs: r1 });
      await l.wacht(r1 * 260 + 300);
      await l.zeg(`Dan liggen er nog ${g(10, k)} in.`, `Daarna gaan er nog ${g(b - r1, k)} uit.`);
      zet(l, { grijs: b });
      await l.wacht((b - r1) * 260 + 300);
    } else {
      zet(l, { grijs: b });
      await l.wacht(b * 260 + 300);
    }
    if (rondje) await l.zeg("Kijk naar het getal in de cirkel. Zoveel pakjes zijn al bezorgd.");
    if (isBegeleideUitleg(l)) {
      zet(l, { licht: null });
      await vraagWatOverblijft(l, a, b, "Hoeveel pakjes liggen er nog in de bus?", "pakjes");
      zet(l, { licht: null, som: `${a} − ${b} = ${u}` });
      return;
    }
    zet(l, { licht: "over" });
    await l.zeg(u === 1 ? `Nu ligt er nog ${gu(u)} pakje in de bus.` : `Nu liggen er nog ${gu(u)} pakjes in de bus.`);
    zet(l, { licht: null, som: `${a} − ${b} = ${u}` });
    await l.zeg(`Dat is de minsom ${somZin(a, b, k)} = ${gu(u)}.`);
  };
}

/** Met stippen: eerst allemaal, dan wordt eraf grijs. Op het bord, bij de machine of zonder plaatje. */
function uitlegStippen(beeld: "bord" | "machine" | "som", a: number, b: number) {
  return async (l: Lesgids, st: Stand) => {
    const u = a - b;
    stelSom(a, b);
    const toneel: Toneel = beeld === "bord" ? { soort: "bord", id: "uitleg-bord" } : beeld === "machine" ? { soort: "machine", id: "uitleg-machine", start: a, eraf: b } : { soort: "som", id: "uitleg-som" };
    toon(l, st, toneel, { som: beeld === "machine" ? null : `${a} − ${b} = ?` });
    if (beeld === "machine") await l.zeg(`${g(a)} blokjes gaan de machine in.`, `De machine haalt er ${g(b)} af.`);
    else await l.zeg(`Kijk, ${somZin(a, b)}.`);
    zet(l, { stippen: stipStand(a, 0), licht: "stippen" });
    await l.zeg(`Ik zet ${g(a)} stippen neer.`);
    zet(l, { licht: null });
    if (overTien(a, b)) {
      const r1 = a - 10;
      await l.zeg(`Er gaan er ${g(b)} weg.`, `Eerst gaan er ${g(r1)} weg.`);
      zet(l, { stippen: stipStand(a, r1) });
      await l.wacht(r1 * 200 + 400);
      await l.zeg(`Dan zijn er nog ${g(10)}.`, `Daarna gaan er nog ${g(b - r1)} weg.`);
    } else await l.zeg(`Er gaan er ${g(b)} weg.`);
    zet(l, { stippen: stipStand(a, b) });
    await l.wacht((overTien(a, b) ? b - (a - 10) : b) * 200 + 400);
    if (isBegeleideUitleg(l)) {
      await vraagWatOverblijft(l, a, b, "Tel alleen de gekleurde stippen. Hoeveel zijn er nog?", "gekleurde stippen");
      zet(l, { som: `${a} − ${b} = ${u}`, ...(beeld === "machine" ? { uitkomst: u } : {}) });
      return;
    }
    await l.zeg(u === 1 ? `Er blijft ${gu(u)} stip over.` : `Er blijven ${gu(u)} stippen over.`);
    zet(l, beeld === "machine" ? { uitkomst: u, som: `${a} − ${b} = ${u}` } : { som: `${a} − ${b} = ${u}` });
    await l.zeg(`Dus ${somZin(a, b)} = ${gu(u)}.`);
  };
}

/** Bekers: tel alles, de lege gaan eraf. */
function uitlegBakjes(vol: number, leeg: number, ding: Bakje = "beker") {
  return async (l: Lesgids, st: Stand) => {
    const n = vol + leeg;
    stelSom(n, leeg);
    toon(l, st, { soort: "bakjes", id: "uitleg-bakjes", ding, vol, leeg });
    await l.zeg(ding === "beker" ? "Kijk, bekers met limonade." : "Kijk, bordjes met koekjes.", "Een paar zijn al leeg.");
    zet(l, { licht: "alle" });
    await l.zeg(ding === "beker" ? `We beginnen met ${g(n)} volle bekers.` : `We beginnen met ${g(n)} bordjes met koekjes.`);
    zet(l, { licht: "leeg" });
    await l.zeg(ding === "beker" ? `Er zijn ${g(leeg)} bekers leeggedronken.` : `Er zijn ${g(leeg)} bordjes leeg.`, "Die gaan weg.");
    if (isBegeleideUitleg(l)) {
      zet(l, { licht: null });
      await vraagWatOverblijft(l, n, leeg, ding === "beker" ? "Hoeveel bekers zijn nog vol?" : "Op hoeveel bordjes liggen nog koekjes?", ding === "beker" ? "volle bekers" : "bordjes met koekjes");
      zet(l, { som: somTekst(n, leeg) });
      return;
    }
    zet(l, { licht: null, som: somTekst(n, leeg) });
    await l.zeg(`De som is ${somZin(n, leeg)} = ${gu(vol)}.`);
  };
}

/** Geld: hoeveel houd je over? */
function uitlegGeld(heb: Geld[], prijs: Geld[], ding: Speelgoed) {
  return async (l: Lesgids, st: Stand) => {
    const h = heb.reduce((t, x) => t + x, 0);
    const p = prijs.reduce((t, x) => t + x, 0);
    stelSom(h, p);
    toon(l, st, { soort: "geld", id: "uitleg-geld", heb, prijs, ding });
    await l.zeg(`Kijk, je hebt ${g(h)} euro.`, `${hoofd(SPEELGOED[ding])} kost ${g(p)} euro.`);
    zet(l, { stippen: stipStand(h, 0) });
    await l.zeg("Voor elke euro zet ik een stip.");
    zet(l, { stippen: stipStand(h, p) });
    await l.wacht(p * 200 + 400);
    if (isBegeleideUitleg(l)) {
      await l.zeg(`Je betaalt ${g(p)} euro. Bij elke euro die je betaalt, wordt een stip grijs.`);
      await uitlegKeuze(l, {
        vraag: "Hoeveel euro houd je over?", keuzes: [String(h - p + 1), String(h - p), String(h - p === 0 ? 2 : h - p - 1)], antwoord: String(h - p),
        hint: "Tel de gekleurde stippen. Elke stip is 1 euro die je nog hebt.",
        goed: bevestig(),
        reactie: (x) => [Number(x) > h - p ? `Je houdt minder over dan ${g(Number(x))} euro.` : `Je houdt meer over dan ${g(Number(x))} euro.`, "Tel alleen de stippen die niet grijs zijn."],
        laatZien: `Je houdt ${gu(h - p)} euro over.`,
      });
      zet(l, { som: `${h} − ${p} = ${h - p}` });
      return;
    }
    await l.zeg(`Je betaalt ${g(p)} euro.`, p === 1 ? "Die gaat weg." : "Die gaan weg.", `Dan houd je ${gu(h - p)} euro over.`);
    zet(l, { som: `${h} − ${p} = ${h - p}` });
    await l.zeg(`${somZin(h, p)} = ${gu(h - p)}.`);
  };
}

/**
 * De korte uitleg na "Nee" gaat over HETZELFDE voorbeeld als het beginscherm: de eerste vraag van de les
 * (BOUWREGELS 14.21). Er staan dus geen eigen getallen meer in de lessen zelf.
 */
function uitlegVan(v: Vraag): (l: Lesgids, st: Stand) => Promise<void> {
  switch (v.t) {
    case "verhaal":
    case "luister":
    case "welke":
      return uitlegRuimte(v.ding, v.a, v.b);
    case "kaal":
      return v.ding ? uitlegRuimte(v.ding, v.a, v.b) : uitlegStippen("som", v.a, v.b);
    case "disco":
    case "typen":
      return uitlegStippen("som", v.a, v.b);
    case "bus":
      return uitlegBus(v.a, v.b, v.rondje);
    case "machine":
      return uitlegStippen("machine", 10, v.b);
    case "bord":
      return uitlegStippen("bord", v.a, v.b);
    case "bakjes":
      return uitlegBakjes(v.vol, v.leeg, v.ding);
    case "geld":
      return uitlegGeld(v.heb, v.prijs, v.ding);
    default:
      return async () => {};
  }
}

/* =====================================================================
   Minsommen, onderwater (16055)
   ===================================================================== */

/* Een eigen beginzin per les (BOUWREGELS 4.3), passend bij wat er in beeld staat. */
const RUIMTE_WELKOM = [
  [`Er zweven ${g(7)} ballonnen in de lucht en er vliegen er ${g(4)} weg.`, "Hoeveel ballonnen blijven er over?"],
  [`Er staan ${g(14)} raketjes klaar en er vliegen er ${g(3)} weg.`, "Hoeveel raketjes blijven er over?"],
  [`Nu staan er ${g(13)} raketjes klaar en er vliegen er ${g(6)} weg.`, "Hoeveel raketjes blijven er over?"],
];

const ruimte1 = minles({
  id: "squla-min-ruimte-1",
  titel: "Minsommen in de ruimte",
  oefening: "Minsommen (onderwater)",
  level: 1,
  welkom: RUIMTE_WELKOM[0],
  /* Level 1: tot en met 10, eraf 1 t/m 6; verhaal, verhaal, kaal, kaal, welke som, welke som, disco, verbinden, verhaal, en daarna nog eens dezelfde soorten. */
  vragen: [
    { t: "verhaal", ding: "ballon", a: 7, b: 4, keuzes: [3, 2, 4, 11] },
    { t: "verhaal", ding: "zeepbel", a: 9, b: 5, keuzes: [5, 4, 14, 3] },
    { t: "kaal", ding: "komeet", a: 8, b: 3, keuzes: [6, 5, 11, 4] },
    { t: "kaal", deco: "komeet", a: 10, b: 6, keuzes: [4, 3, 16, 5] },
    { t: "welke", ding: "ster", a: 8, b: 3, ufo: true, keuzes: [[5, 3], [8, 3], [8, 2], [5, 2]] },
    { t: "welke", ding: "satelliet", a: 9, b: 2, keuzes: [[9, 3], [7, 2], [9, 2], [7, 3]] },
    { t: "disco", a: 7, b: 5, keuzes: [2, 5, 3] },
    { t: "verbind", sommen: [[6, 5], [9, 6], [8, 4]], uitkomsten: [4, 1, 3] },
    { t: "verhaal", ding: "ufo", a: 6, b: 1, keuzes: [4, 5, 7, 6] },
    { t: "verhaal", ding: "raketje", a: 10, b: 3, keuzes: [7, 13, 6, 8] },
    { t: "kaal", ding: "zeepbel", a: 9, b: 4, keuzes: [5, 13, 4, 6] },
    { t: "welke", ding: "komeet", a: 7, b: 4, keuzes: [[6, 4], [7, 4], [7, 3], [4, 3]] },
    { t: "disco", a: 10, b: 2, keuzes: [8, 7, 9] },
    { t: "kaal", ding: "ufo", a: 5, b: 3, keuzes: [3, 2, 8, 1] },
    { t: "verhaal", ding: "ballon", a: 8, b: 6, keuzes: [2, 14, 3, 1] },
  ],
  eind: "Je kunt minsommen maken tot {10:wit}.",
});

const ruimte2 = minles({
  id: "squla-min-ruimte-2",
  titel: "Minsommen in de ruimte (moeilijker)",
  oefening: "Minsommen (onderwater)",
  level: 2,
  welkom: RUIMTE_WELKOM[1],
  /* Level 2: start 12 t/m 19, eraf 0 t/m 7, niet over het tiental; 3 keuzes; luistervragen, typen en bubbels erbij. */
  vragen: [
    { t: "verhaal", ding: "raketje", a: 14, b: 3, keuzes: [11, 12, 10] },
    { t: "welke", ding: "ufo", a: 16, b: 3, keuzes: [[13, 3], [16, 3], [16, 3, "+"]] },
    { t: "verhaal", ding: "zeepbel", a: 19, b: 6, keuzes: [13, 14, 11] },
    { t: "luister", ding: "ballon", a: 15, b: 1, keuzes: [16, 14, 13] },
    { t: "luister", ding: "ster", a: 17, b: 5, keuzes: [12, 11, 13] },
    { t: "welke", ding: "ster", a: 18, b: 5, ufo: true, keuzes: [[18, 5], [18, 6], [18, 2]] },
    { t: "welke", ding: "satelliet", a: 14, b: 2, ufo: true, keuzes: [[14, 2], [14, 1], [12, 2], [13, 2]] },
    { t: "disco", a: 17, b: 4, keuzes: [13, 14, 11] },
    { t: "typen", a: 19, b: 7, deco: "satelliet" },
    { t: "bubbels", sommen: [[17, 17], [9, 8], [6, 6], [14, 4], [13, 13], [15, 0]] },
    { t: "verhaal", ding: "satelliet", a: 15, b: 2, keuzes: [13, 12, 17] },
    { t: "welke", ding: "komeet", a: 13, b: 2, keuzes: [[13, 2, "+"], [11, 2], [13, 2]] },
    { t: "luister", ding: "raketje", a: 18, b: 4, keuzes: [14, 15, 12] },
    { t: "disco", a: 16, b: 5, keuzes: [10, 11, 12] },
    { t: "typen", a: 17, b: 6, deco: "raketje" },
  ],
  eind: "Je kunt minsommen maken tot {20:wit}.",
});

const ruimte3 = minles({
  id: "squla-min-ruimte-3",
  titel: "Minsommen in de ruimte (nog moeilijker)",
  oefening: "Minsommen (onderwater)",
  level: 3,
  welkom: RUIMTE_WELKOM[2],
  /* Level 3: start 11 t/m 19, over het tiental terug, plus "alles eraf" en "niets eraf". */
  vragen: [
    { t: "verhaal", ding: "raketje", a: 13, b: 6, keuzes: [7, 19, 8, 6] },
    { t: "verhaal", ding: "ballon", a: 15, b: 7, keuzes: [9, 8, 7, 6] },
    { t: "verhaal", ding: "zeepbel", a: 12, b: 5, keuzes: [8, 17, 7, 6] },
    { t: "verhaal", ding: "raketje", a: 17, b: 8, keuzes: [10, 9, 8, 11] },
    { t: "verhaal", ding: "ufo", a: 14, b: 6, keuzes: [9, 8, 20, 7] },
    { t: "welke", ding: "ster", a: 16, b: 16, ufo: true, keuzes: [[16, 0], [16, 16], [16, 6], [16, 1]] },
    { t: "welke", ding: "satelliet", a: 18, b: 0, ufo: true, keuzes: [[18, 18], [18, 0], [18, 8], [18, 10]] },
    { t: "disco", a: 12, b: 8, keuzes: [4, 5, 3] },
    { t: "disco", a: 17, b: 9, keuzes: [9, 8, 7] },
    { t: "typen", a: 14, b: 9 },
    { t: "verhaal", ding: "satelliet", a: 11, b: 3, keuzes: [8, 14, 9, 7] },
    { t: "welke", ding: "ster", a: 13, b: 4, ufo: true, keuzes: [[13, 3], [13, 4], [12, 4], [9, 4]] },
    { t: "disco", a: 15, b: 9, keuzes: [5, 7, 6] },
    { t: "typen", a: 16, b: 7 },
    { t: "verhaal", ding: "komeet", a: 16, b: 8, keuzes: [9, 8, 7, 6] },
  ],
  eind: "Je rekent terug over de {10:wit}.",
});

/* =====================================================================
   Bussommen 1 (7275) en Bussommen 2 (7276)
   ===================================================================== */

const BUS_WELKOM = [
  [`In de bus liggen ${g(8)} pakjes en er worden er ${g(3)} bezorgd.`, "Hoeveel pakjes liggen er nu nog in de bus?"],
  [`In de bus liggen ${g(16)} pakjes en er worden er ${g(4)} bezorgd.`, "Hoeveel pakjes liggen er nu nog in de bus?"],
  [`In de bus liggen ${g(15)} pakjes en er worden er ${g(7)} bezorgd.`, "Hoeveel pakjes liggen er nu nog in de bus?"],
];
const bus = (a: number, b: number, rondje = false, keuzes?: number[]): Vraag => ({ t: "bus", a, b, rondje, keuzes });

const bus11 = minles({
  id: "squla-min-bus1-1",
  titel: "Bussommen",
  oefening: "Bussommen 1",
  level: 1,
  welkom: BUS_WELKOM[0],
  /* Level 1 "tot 10": eerst kiezen uit 3 (startgetal en aftrekgetal als lokkers), daarna typen. */
  vragen: [bus(8, 3, false, [5, 3, 8]), bus(9, 7), bus(10, 4), bus(5, 1), bus(7, 3), bus(6, 4), bus(9, 2), bus(4, 2), bus(10, 6), bus(7, 5), bus(8, 1), bus(3, 2), bus(9, 8), bus(6, 1), bus(8, 6)],
  eind: "Je kunt bussommen maken tot {10:wit}.",
});

const bus12 = minles({
  id: "squla-min-bus1-2",
  titel: "Bussommen (moeilijker)",
  oefening: "Bussommen 1",
  level: 2,
  welkom: BUS_WELKOM[1],
  /* Level 2 "tot 20": alleen typen, start 12 t/m 19, eraf 1 t/m 6, niet over het tiental. */
  vragen: [bus(16, 4), bus(18, 5), bus(19, 3), bus(14, 2), bus(17, 1), bus(15, 4), bus(13, 3), bus(18, 6), bus(12, 1), bus(19, 6), bus(16, 5), bus(14, 3), bus(15, 2), bus(17, 4), bus(13, 1)],
  eind: "Je kunt bussommen maken tot {20:wit}.",
});

const bus13 = minles({
  id: "squla-min-bus1-3",
  titel: "Bussommen (nog moeilijker)",
  oefening: "Bussommen 1",
  level: 3,
  welkom: BUS_WELKOM[2],
  /* Level 3 "over het 10-tal": alleen typen, start 12 t/m 18, eraf 4 t/m 9, uitkomst onder de 10. */
  vragen: [bus(15, 7), bus(13, 5), bus(16, 9), bus(12, 6), bus(17, 8), bus(14, 6), bus(12, 7), bus(15, 9), bus(13, 4), bus(16, 7), bus(14, 9), bus(15, 6), bus(12, 8), bus(13, 9), bus(14, 7)],
  eind: "Je rekent terug over de {10:wit}.",
});

const BUS2_WELKOM = [
  [`De bus heeft ${g(10)} pakjes. In de cirkel staat ${g(7)}.`, "Hoeveel pakjes liggen er nu nog in de bus?"],
  [`De bus heeft ${g(17)} pakjes. In de cirkel staat ${g(5)}.`, "Hoeveel pakjes liggen er nu nog in de bus?"],
  [`De bus heeft ${g(16)} pakjes. In de cirkel staat ${g(8)}.`, "Hoeveel pakjes liggen er nu nog in de bus?"],
];

const bus21 = minles({
  id: "squla-min-bus2-1",
  titel: "Bussommen met een rondje",
  oefening: "Bussommen 2",
  level: 1,
  welkom: BUS2_WELKOM[0],
  /* Level 1 "tot 10": eerst kiezen uit 3, één keer met de pakjes buiten, verder het rode rondje; typen. */
  vragen: [
    bus(10, 7, true, [3, 7, 10]),
    bus(7, 4, false),
    bus(9, 8, true),
    bus(6, 1, true),
    bus(8, 2, true),
    bus(5, 4, true),
    bus(9, 5, true),
    bus(4, 1, true),
    bus(10, 6, true),
    bus(8, 4, true),
    bus(7, 6, true),
    bus(6, 4, true),
    bus(9, 3, true),
    bus(5, 2, true),
    bus(10, 5, true),
  ],
  eind: "Je kunt bussommen maken tot {10:wit}.",
});

const bus22 = minles({
  id: "squla-min-bus2-2",
  titel: "Bussommen met een rondje (moeilijker)",
  oefening: "Bussommen 2",
  level: 2,
  welkom: BUS2_WELKOM[1],
  /* Level 2 "tot 20": alleen typen, start 12 t/m 19, eraf 1 t/m 7, niet over het tiental. */
  vragen: [bus(17, 5, true), bus(19, 4, true), bus(16, 2, true), bus(18, 3, true), bus(13, 2, true), bus(15, 1, true), bus(19, 7, true), bus(14, 4, true), bus(18, 6, true), bus(16, 3, true), bus(17, 7, true), bus(15, 2, true), bus(19, 5, true), bus(12, 1, true), bus(18, 1, true)],
  eind: "Je kunt bussommen maken tot {20:wit}.",
});

const bus23 = minles({
  id: "squla-min-bus2-3",
  titel: "Bussommen met een rondje (nog moeilijker)",
  oefening: "Bussommen 2",
  level: 3,
  welkom: BUS2_WELKOM[2],
  /* Level 3 "over het 10-tal": alleen typen, start 11 t/m 19, eraf 6 t/m 10, uitkomst onder de 10. */
  vragen: [bus(16, 8, true), bus(13, 7, true), bus(11, 6, true), bus(17, 8, true), bus(14, 9, true), bus(18, 10, true), bus(15, 7, true), bus(12, 9, true), bus(16, 9, true), bus(13, 9, true), bus(15, 8, true), bus(11, 7, true), bus(12, 7, true), bus(14, 8, true), bus(16, 7, true)],
  eind: "Je rekent terug over de {10:wit}.",
});

/* =====================================================================
   Minsommen (6919): machine, schoolbord, bekers en bordjes, geld
   ===================================================================== */

const MACHINE_WELKOM = [`Er gaan ${g(10)} blokjes in de min-machine en de machine haalt er ${g(3)} af.`, "Hoeveel blokjes komen eruit?"];
const bord = (a: number, b: number, keuzes?: number[]): Vraag => ({ t: "bord", a, b, keuzes });
const machine = (b: number, keuzes: number[]): Vraag => ({ t: "machine", b, keuzes });
const disco = (a: number, b: number, keuzes: number[], luister = false): Vraag => ({ t: "disco", a, b, keuzes, luister });

const mach1 = minles({
  id: "squla-min-machine-1",
  titel: "Minsommen: hoeveel over?",
  oefening: "Minsommen",
  level: 1,
  welkom: MACHINE_WELKOM,
  /* Level 1: de min-machine (10 min 1 t/m 5), dan schoolbord en disco (6 t/m 10 min 3 t/m 6); keuzes: 3 getallen op een rij. */
  vragen: [
    machine(3, [6, 7, 8]),
    machine(5, [4, 5, 6]),
    machine(1, [8, 9, 10]),
    machine(4, [5, 6, 7]),
    machine(2, [7, 8, 9]),
    bord(8, 5, [2, 3, 4]),
    disco(9, 3, [6, 7, 8]),
    bord(7, 3, [3, 4, 5]),
    bord(10, 6, [4, 5, 6]),
    disco(6, 4, [1, 2, 3]),
    bord(9, 6, [2, 3, 4]),
    disco(8, 4, [3, 4, 5]),
    bord(6, 5, [1, 2, 3]),
    bord(10, 5, [4, 5, 6]),
    disco(7, 5, [2, 3, 4]),
  ],
  eind: "Je weet hoeveel er over is.",
});

const bakjes = (ding: Bakje, vol: number, leeg: number, keuzes: SomKeuze[]): Vraag => ({ t: "bakjes", ding, vol, leeg, keuzes });

const mach2 = minles({
  id: "squla-min-machine-2",
  titel: "Minsommen: hoeveel over? (moeilijker)",
  oefening: "Minsommen",
  level: 2,
  welkom: ["Hier staan bekers en een paar zijn leeg.", "Welke som hoort bij het plaatje?"],
  /* Level 2: welke som hoort bij het plaatje (volle en lege), dan de machine met 10 min 6 t/m 10; tot en met 10. */
  vragen: [
    bakjes("beker", 3, 2, [[5, 2], [4, 2], [5, 3]]),
    bakjes("bordje", 3, 5, [[7, 5], [8, 5], [9, 5]]),
    bakjes("beker", 2, 4, [[6, 3], [6, 4], [5, 4]]),
    bakjes("bordje", 8, 2, [[10, 1], [10, 2], [10, 3]]),
    bakjes("beker", 4, 3, [[7, 3], [6, 3], [10, 3]]),
    machine(8, [1, 2, 3]),
    machine(6, [3, 4, 5]),
    machine(10, [0, 1, 2]),
    machine(9, [0, 1, 2]),
    machine(7, [2, 3, 4]),
    bakjes("bordje", 6, 3, [[8, 3], [9, 3], [9, 4]]),
    bakjes("beker", 1, 3, [[3, 3], [4, 3], [5, 3]]),
    bakjes("beker", 5, 5, [[10, 5], [9, 5], [10, 4]]),
    bakjes("bordje", 6, 1, [[7, 2], [7, 1], [6, 1]]),
    bakjes("beker", 2, 7, [[8, 7], [9, 7], [10, 7]]),
  ],
  eind: "Je ziet welke som bij een plaatje hoort.",
});

const mach3 = minles({
  id: "squla-min-machine-3",
  titel: "Minsommen: hoeveel over? (nog moeilijker)",
  oefening: "Minsommen",
  level: 3,
  welkom: ["Het schoolbord is vol minsommen.", `Hoeveel is ${somZin(7, 4)}?`],
  /* Level 3: alleen het schoolbord en typen, tot en met 10. */
  vragen: [bord(7, 4), bord(10, 6), bord(9, 3), bord(6, 5), bord(5, 4), bord(10, 5), bord(7, 6), bord(6, 3), bord(9, 5), bord(7, 3), bord(6, 4), bord(7, 5), bord(9, 7), bord(8, 2), bord(10, 7)],
  eind: "Je kunt minsommen uitrekenen tot {10:wit}.",
});

const geld = (heb: Geld[], prijs: Geld[], ding: Speelgoed, keuzes: number[]): Vraag => ({ t: "geld", heb, prijs, ding, keuzes });

const mach4 = minles({
  id: "squla-min-machine-4",
  titel: "Minsommen: hoeveel over? (heel moeilijk)",
  oefening: "Minsommen",
  level: 4,
  welkom: ["Je haalt geld uit je portemonnee en koopt een ijsje.", "Hoeveel euro houd je over?"],
  /* Level 4: geld (hoeveel houd je over, tot 10 euro) en sommen die alleen gezegd worden; zelfde volgorde, drie keer. */
  vragen: [
    geld([2, 2, 1, 1], [2], "ijsje", [3, 4, 5]),
    disco(7, 2, [4, 5, 6], true),
    geld([5], [2, 1], "bal", [1, 2, 3]),
    geld([10], [2, 2, 1], "vlieger", [4, 5, 6]),
    disco(9, 7, [1, 2, 3], true),
    geld([2, 2, 2, 1], [2, 2], "boek", [2, 3, 4]),
    disco(10, 4, [5, 6, 7], true),
    geld([1, 1, 1, 1], [1], "ballon", [2, 3, 4]),
    geld([5, 2, 1], [2, 2, 2], "boek", [1, 2, 3]),
    disco(8, 5, [2, 3, 4], true),
    geld([10], [1], "ballon", [7, 8, 9]),
    disco(6, 5, [1, 2, 3], true),
    geld([2, 1, 1], [2], "ijsje", [1, 2, 3]),
    geld([5, 2, 2], [2, 2, 1], "vlieger", [3, 4, 5]),
    disco(9, 3, [5, 6, 7], true),
  ],
  eind: "Je weet hoeveel geld je overhoudt.",
});

/* =====================================================================
   Kale sommen (7277): schoolbord en typen
   ===================================================================== */

const KAAL_WELKOM = [
  ["Hier staat een minsom op het bord.", `Hoeveel is ${somZin(8, 3)}?`],
  ["De minsommen op het bord worden groter.", `Hoeveel is ${somZin(20, 4)}?`],
  [`Nu gaan we over de ${g(10)} heen.`, `Hoeveel is ${somZin(16, 9)}?`],
];

const kaal1 = minles({
  id: "squla-min-kaal-1",
  titel: "Kale minsommen",
  oefening: "Kale sommen",
  level: 1,
  welkom: KAAL_WELKOM[0],
  /* Level 1 "tot 10": start 3 t/m 10, eraf 1 t/m 6. */
  vragen: [bord(8, 3), bord(6, 2), bord(9, 6), bord(10, 4), bord(4, 1), bord(7, 6), bord(10, 3), bord(3, 2), bord(9, 1), bord(5, 2), bord(8, 4), bord(7, 3), bord(6, 5), bord(10, 2), bord(9, 4)],
  eind: "Je kunt kale minsommen maken tot {10:wit}.",
});

const kaal2 = minles({
  id: "squla-min-kaal-2",
  titel: "Kale minsommen (moeilijker)",
  oefening: "Kale sommen",
  level: 2,
  welkom: KAAL_WELKOM[1],
  /* Level 2 "tot 20": start 14 t/m 20, eraf 2 t/m 8, meestal binnen het tiental (één keer erover), ook van 20 af. */
  vragen: [bord(20, 4), bord(19, 5), bord(17, 6), bord(18, 3), bord(16, 2), bord(14, 7), bord(20, 6), bord(16, 6), bord(15, 3), bord(18, 8), bord(19, 2), bord(20, 8), bord(17, 4), bord(15, 4), bord(18, 7)],
  eind: "Je kunt kale minsommen maken tot {20:wit}.",
});

const kaal3 = minles({
  id: "squla-min-kaal-3",
  titel: "Kale minsommen (nog moeilijker)",
  oefening: "Kale sommen",
  level: 3,
  welkom: KAAL_WELKOM[2],
  /* Level 3 "over het 10-tal": start 11 t/m 18, eraf 6 t/m 10, uitkomst onder de 10. */
  vragen: [bord(16, 9), bord(12, 7), bord(14, 8), bord(11, 6), bord(17, 9), bord(13, 8), bord(15, 9), bord(12, 6), bord(16, 10), bord(11, 8), bord(14, 6), bord(13, 9), bord(12, 9), bord(16, 7), bord(11, 7)],
  eind: "Je rekent terug over de {10:wit}.",
});

export const LESSEN_SQULA_MINSOMMEN: Lesdraaiboek[] = [ruimte1, ruimte2, ruimte3, bus11, bus12, bus13, bus21, bus22, bus23, mach1, mach2, mach3, mach4, kaal1, kaal2, kaal3];
