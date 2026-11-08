/**
 * De schattenjacht: lessen "Rekenen met getallen" naar Squla groep 3, de
 * oefening "De piratenschat met plus en min" (15823), 31 oktober 2026,
 * opdracht eigenaar. Per level één les (squla-piraat-1/2/3); de analyse staat
 * in SQULA-ANALYSE/rekenen-met-getallen-15823-piratenschat-volledig.md.
 *
 * Zoals Squla: een rekenverhaal waarin elke vraag een letter oplevert van de
 * plek waar de schat ligt (ook als het eerst fout ging: het woord wordt
 * altijd heel). Het verhaal loopt over de drie levels door.
 *
 * Geen piraten, geen kinderen, geen papegaai, geen doodshoofden en geen
 * schatkist met ogen (besluit Sara, 31 oktober 2026). In plaats daarvan gaat
 * Bliepo zelf op schattenjacht in de ruimte, met een schatkaart:
 *   level 1  "onder de rode rots"   → een kistje met een nieuwe kaart
 *   level 2  "in de grote krater"   → een sleutel
 *   level 3  "naast de oude raket"  → de schatkist, vol glimmende sterren
 * De telvoorwerpen zijn dingen die bij een schat horen (goudstukken,
 * diamanten, parels, kopermunten, maanstenen, sleutels, sterren). Wat bij
 * Squla de kapitein of de papegaai opat, verliest of geeft Bliepo hier weg
 * (dezelfde minsom). De raadsels en weetjes over piraten zijn vervangen door
 * eigen raadsels over robots en de ruimte. Wat eraf gaat is grijs en half
 * doorzichtig (vaste beeldtaal voor minsommen), geen rood kruis.
 */

import type { Lesgids } from "../soort";
import type { SqulaVraag } from "./squla-hulp";
import { bevestig, krijgtVervolgvraag, zetSynthesisHulp } from "./squla-uitleg";
import { foutBeeld, g, goedBeeld, kiesTekst, les, squlaVraag as hulpVraag, tik, toon, voorbeeldVan, zet, type Stand, type Vraag } from "./squla-splitsen-hulp";
import { getalkleur } from "../tegels";
import { meng } from "./squla-meng";
import { kiesAnder, KLEURHEX } from "../vlakken/squla-getalring";
import { KaartSchat, type Beeld, type Deel, type S1Spec, type S1Stand } from "../vlakken/squla-splitsen-vlak";
import type { S2, S2Doel, S2Leg, S2Stuk } from "../vlakken/squla-splitsen2-sleep";

/* =====================================================================
   Woorden en beeld
   ===================================================================== */

/**
 * Hulp zoals Synthesis (BOUWREGELS 5.1 en 5.10, 4 november 2026): na één fout een korte reactie en meteen opnieuw, na
 * de tweede fout uitleg, het goede antwoord laten zien en door. Alleen de hulp is aangepast, niet het uiterlijk.
 */
function squlaVraag<T>(l: Lesgids, v: SqulaVraag<T>): Promise<boolean> {
  zetSynthesisHulp(l);
  return hulpVraag(l, { ...v, synthesis: true });
}

/** Een raadsel heeft zijn eigen bevestiging; bij het antwoord tonen laten we het uitroepje vooraan weg. */
const zonderJa = (zinnen: string[]) => zinnen.map((z) => z.replace(/^[^!.?]{2,22}!\s*/, "")).filter(Boolean);
/** Een hint zonder vraag: het kind probeert meteen opnieuw, dus Bliepo stelt de vraag niet nog eens (BOUWREGELS 3.23). */
const zonderVraag = (zinnen: string[]) => zinnen.filter((z) => !z.trim().endsWith("?"));

/** Eerste fout bij een getal: net ernaast of ver ernaast; de zinnen zijn per vraag geschreven (rekenkundig gecontroleerd). */
function getalReactie(x: number, goed: number, extra: string[], zin: { dicht: (hoog: boolean) => string; ver: (hoog: boolean) => string }): string[] {
  const hoog = x > goed;
  return [Math.abs(x - goed) === 1 ? zin.dicht(hoog) : zin.ver(hoog), ...extra];
}

const NAAM: Record<string, [string, string]> = {
  goudstuk: ["goudstuk", "goudstukken"],
  diamant: ["diamant", "diamanten"],
  parel: ["parel", "parels"],
  kopermunt: ["kopermunt", "kopermunten"],
  maansteen: ["maansteen", "maanstenen"],
  sleutel: ["sleutel", "sleutels"],
  ster: ["ster", "sterren"],
};
/** De kleur van een getal is de kleur van het voorwerp waar het over gaat (BOUWREGELS 2.2). */
const KL: Record<string, string> = { goudstuk: "geel", diamant: "blauw", parel: "roze", kopermunt: "oranje", maansteen: "paars", sleutel: "geel", ster: "geel" };
/** Voorwerpen die al in hun eigen kleur kloppen (gouden en koperen munten, geel sterretje en sleutel): die houden hun eigen glans en kleur van het plaatje. */
const NATUURLIJK = new Set(["goudstuk", "kopermunt", "ster", "sleutel"]);
const gv = (n: number, vw: string) => g(n, KL[vw] ?? "wit");
/** Het getal dat weggaat (b) in een minsom: een duidelijk andere kleur dan het voorwerp (BOUWREGELS 2.1). */
const gb = (n: number, vw: string) => g(n, kiesAnder(KL[vw] ?? "wit"));
const aantal = (n: number, vw: string) => `${gv(n, vw)} ${n === 1 ? NAAM[vw][0] : NAAM[vw][1]}`;

/** Het woord van dit level staat op de kaart: na elke vraag een letter erbij. */
const WOORD = new WeakMap<Stand, string>();
const LAATSTE = new WeakMap<Stand, Beeld>();
const letters = (st: Stand): Deel => ({ s: "letters", id: "letters", x: 490, y: 672, woord: WOORD.get(st) ?? "", tot: st.letters });

/** Een beeld met de letters eronder (en onthouden, zodat de letter er na de vraag bij kan). */
function metLetters(st: Stand, id: string, delen: Deel[]): Beeld {
  const b = { id, delen: [...delen, letters(st)] };
  LAATSTE.set(st, b);
  return b;
}

async function nieuweLetter(l: Lesgids, st: Stand) {
  st.letters++;
  const b = LAATSTE.get(st);
  if (b) zet(l, { beeld: { ...b, delen: [...b.delen.filter((d) => d.s !== "letters"), letters(st)] } });
  if (st.letters === 1) await l.zeg("Kijk, de eerste letter!", "Bij elke vraag krijg je een letter.", "Samen zeggen de letters waar de schat ligt.");
  else await l.wacht(500);
}

/** De kleuren van de som bovenaan: elk getal heeft de kleur van zijn voorwerpen (BOUWREGELS 2.1); "tegel" = de kleur van het getal zelf (kale sommen). */
const SK: Record<string, string> = KLEURHEX;
const somKleur = (n: number, k: string) => (k === "tegel" ? getalkleur(n) : (SK[k] ?? "#ffffff"));

/** De som bovenaan, als tekst in het vlak (de som van het lesscherm kan geen kleur per voorwerp). */
function som(l: Lesgids, st: Stand, a: number, teken: "+" | "−", b: number, uitkomst?: number, ka = "tegel", kb = ka, ku = "wit") {
  const basis = LAATSTE.get(st);
  if (!basis) return;
  const y = 70;
  const delen: Deel[] = [
    { s: "tekst", id: "som-a", t: String(a), x: 330, y, grootte: 56, kleur: somKleur(a, ka) },
    { s: "tekst", id: "som-t", t: teken, x: 410, y, grootte: 56, kleur: "#c3c7d0" },
    { s: "tekst", id: "som-b", t: String(b), x: 490, y, grootte: 56, kleur: somKleur(b, kb) },
    { s: "tekst", id: "som-i", t: "=", x: 570, y, grootte: 56, kleur: "#c3c7d0" },
    { s: "tekst", id: "som-u", t: uitkomst === undefined ? "?" : String(uitkomst), x: 650, y, grootte: 56, kleur: uitkomst === undefined ? undefined : somKleur(uitkomst, ku) },
  ];
  const nieuw: Beeld = { ...basis, delen: [...basis.delen.filter((d) => !d.id.startsWith("som-")), ...delen] };
  LAATSTE.set(st, nieuw);
  zet(l, { beeld: nieuw });
}

/* =====================================================================
   Bliepo's uitleg
   ===================================================================== */

/** Plus: verder tellen vanaf het grootste getal, of eerst naar 10, of tientallen. */
async function plusUitleg(l: Lesgids, a: number, b: number, kleur = true) {
  const groot = Math.max(a, b);
  const klein = Math.min(a, b);
  /* dezelfde kleuren als de som: het eerste getal paars, het tweede oranje */
  const kg = !kleur ? "wit" : a >= b ? "paars" : "oranje";
  const kk = !kleur ? "wit" : a >= b ? "oranje" : "paars";
  if (a % 10 === 0 && b % 10 === 0) {
    await l.zeg(`${g(a, kleur ? "paars" : "wit")} is ${g(a / 10)} ${a === 10 ? "tiental" : "tientallen"}.`, `${g(b, kleur ? "oranje" : "wit")} is ${g(b / 10)} ${b === 10 ? "tiental" : "tientallen"}.`, ...(krijgtVervolgvraag(l) ? [] : ["Hoeveel tientallen zijn het samen?"]));
    return;
  }
  if (groot < 10 && a + b > 10) {
    await l.zeg(`Neem eerst ${g(groot, kg)}.`, `Eerst maak je ${g(10)}: ${g(groot, kg)} + ${g(10 - groot)} = ${g(10)}.`, `Van de ${g(klein, kk)} ${klein - (10 - groot) === 1 ? "is" : "zijn"} er dan nog ${g(klein - (10 - groot))} over.`, ...(krijgtVervolgvraag(l) ? [] : [`${g(10)} en nog ${g(klein - (10 - groot))}: hoeveel is dat?`]));
    return;
  }
  if (groot > 10 && groot < 20) {
    const e = groot - 10;
    await l.zeg(`${g(groot, kg)} is ${g(10)} en ${g(e)}.`, `Reken eerst ${g(e)} + ${g(klein, kk)}.`, `Dan komt de ${g(10)} er nog bij.`);
    return;
  }
  await l.zeg(`Het grootste getal is ${g(groot, kg)}.`, `Tel daar ${g(klein, kk)} bij, stap voor stap.`, "Dat mag op je vingers.");
}

function plusTip(a: number, b: number, kleur = true): string[] {
  const groot = Math.max(a, b);
  const klein = Math.min(a, b);
  const kg = !kleur ? "wit" : a >= b ? "paars" : "oranje";
  const kk = !kleur ? "wit" : a >= b ? "oranje" : "paars";
  if (a % 10 === 0 && b % 10 === 0) return ["Tel de tientallen bij elkaar."];
  if (groot < 10 && a + b > 10) return [`Eerst naar ${g(10)}.`, "Dan de rest erbij."];
  return [`Het grootste getal is ${g(groot, kg)}.`, `Tel daar ${g(klein, kk)} bij, stap voor stap.`];
}

/* =====================================================================
   Zelf slepen (2 november 2026, opdracht Sara: "het kind sleept of doet zelf")
   Dingen (s1, squla-splitsen-s1.ts) en getaltegels (s2, squla-splitsen2-sleep.ts) worden door het kind
   naar een zacht vak gesleept. Het rekenen blijft gelijk; alleen het antwoord geven is nu slepen.
   Eigen functies met prefix pz.
   ===================================================================== */

let pzNr = 0;
const pzRij = (n: number) => Array.from({ length: n }, (_, i) => i);
/** Drie antwoordtegels, elk een eigen kleur (niet de kleuren van de getallen in de som). */
const PZ_TEGEL = [
  { naam: "groen", hex: "#4cc76a" },
  { naam: "roze", hex: "#ff7aa8" },
  { naam: "blauw", hex: "#4aa3ff" },
];

/** Een hoopje dingen en één vak (s1): het kind sleept er `doel` naar het vak (`leeg` staat dof in het lege vak). */
/** Waar de gesloten schatkist in het verhaalbegin staat (midden en breedte); de kist bij de eerste vraag begint daar. */
const KIST_BEGIN = { x: 490, y: 360, maat: 320 };

function pzDingen(vw: string, n: number, doel: number, fout: number, leeg: string, restWeg = false, kist = false): S1Spec {
  const kl = KL[vw] ?? "geel";
  return {
    nr: ++pzNr,
    soort: "dingen",
    vw,
    kleur: kl,
    echt: NATUURLIJK.has(vw),
    restWeg,
    n,
    tray: { x: 490, y: 160, per: n > 10 ? Math.ceil(n / 2) : n, dia: n <= 8 ? 84 : n <= 12 ? 72 : 58 },
    zones: [{ id: "vak", x: 490, y: 440, b: 480, h: 250, per: 5, dia: doel <= 5 ? 82 : doel <= 10 ? 68 : 58, leeg }],
    oplossing: [doel],
    fout: [fout],
    route: pzRij(doel).map((i): [number, number] => [i, 0]),
    /* De schatkist van het verhaalbegin (zelfde plek en grootte) schuift opzij, gaat open en de schatten springen eruit (BOUWREGELS 1.22). */
    ...(kist ? { kist: { x: 855, y: 470, maat: 190, van: KIST_BEGIN } } : {}),
  };
}

/** Wachten tot er dingen in het vak liggen; dan verschijnt het vinkje. Haalt het kind ze er weer uit, dan verdwijnt het. Geeft het aantal in het vak. */
async function pzWachtVak(l: Lesgids): Promise<number> {
  zet(l, { actief: true });
  const stand = () => l.wachtOpVlak<S1Stand>("s1stand");
  let s = await stand();
  for (;;) {
    if (s.tel[0] === 0) {
      s = await stand();
      continue;
    }
    const r = await Promise.race([l.knoppen(["controleer"]).then(() => null), stand()]);
    if (r === null) break;
    s = r;
  }
  zet(l, { actief: false });
  return s.tel[0];
}

/** De dingen rollen één voor één naar het vak (uitleg en hulp). */
async function pzLegVoor(l: Lesgids, spec: S1Spec, tot: number, pauze = 330) {
  const s: S1Spec = { ...spec, nr: ++pzNr, auto: 0 };
  zet(l, { s1: s, actief: false });
  await l.wacht(500);
  for (let t = 1; t <= tot; t++) {
    zet(l, { s1: { ...s, auto: t } });
    await l.wacht(pauze);
  }
}

/** Antwoordtegels (s2): het kind sleept het goede getal naar het vak op de plek van het antwoord. */
function pzTegels(keuzes: number[], goed: number, y: number, tegelY = 592): S2 {
  const stukken: S2Stuk[] = keuzes.map((n, i) => ({
    id: `t${i}`,
    kleur: PZ_TEGEL[i % PZ_TEGEL.length].hex,
    segm: [{ t: String(n) }],
    x: 490 + (i - (keuzes.length - 1) / 2) * 230,
    y: tegelY,
    grootte: 56,
    doel: n === goed ? "u" : undefined,
  }));
  const doelen: S2Doel[] = [{ id: "u", x: 650, y, b: 150, h: 104, label: "?" }];
  return { nr: ++pzNr, stukken, doelen };
}

/** Eerste fout bij een plussom met tegels: wat koos het kind? (a + b = s; bij plus is het antwoord groter dan beide getallen) */
function pzReactie(a: number, b: number, x: number, tip: string[]): string[] {
  const s = a + b;
  const hint = zonderVraag(tip);
  if (x === a || x === b) return [`Je sleepte de tegel ${g(x)}: dat getal staat al in de som.`, "Het antwoord is meer dan elk getal in de som.", ...hint];
  return getalReactie(x, s, hint, {
    dicht: (hoog) => hoog ? `Je sleepte de tegel ${g(x)}: dat is net 1 te veel.` : `Bij de tegel ${g(x)} mist er nog 1.`,
    ver: (hoog) => (hoog ? `De tegel ${g(x)} is meer dan ${g(a)} en ${g(b)} samen.` : `De tegel ${g(x)} is minder dan ${g(a)} en ${g(b)} samen.`),
  });
}

/** Na de tweede fout: de goede tegel ligt in het vak en Bliepo zegt de hele som. */
async function tegelAntwoord(l: Lesgids, spec: S2, keuzes: number[], goed: number, zin: string) {
  const i = keuzes.indexOf(goed);
  zet(l, { s2: { ...spec, vast: i >= 0 ? [[`t${i}`, "u"]] : [] }, actief: false });
  await l.wacht(500);
  await l.zeg(zin);
}

/** Wachten tot er een tegel in het vak ligt; geeft het getal op die tegel. */
async function pzWachtTegel(l: Lesgids, keuzes: number[]): Promise<number> {
  zet(l, { actief: true });
  for (;;) {
    const e = await l.wachtOpVlak<S2Leg>("s2");
    if (e.leg.length >= 1) {
      zet(l, { actief: false });
      await l.wacht(250);
      return keuzes[Number(e.leg[0][0].slice(1))];
    }
  }
}

/** De som op een eigen hoogte, nog zonder uitkomst: het antwoord ligt straks als tegel in het vak ernaast. */
function pzSom(l: Lesgids, st: Stand, a: number, teken: "+" | "−", b: number, ka: string, kb: string, y: number) {
  const basis = LAATSTE.get(st);
  if (!basis) return;
  const delen: Deel[] = [
    { s: "tekst", id: "som-a", t: String(a), x: 330, y, grootte: 56, kleur: somKleur(a, ka) },
    { s: "tekst", id: "som-t", t: teken, x: 410, y, grootte: 56, kleur: "#c3c7d0" },
    { s: "tekst", id: "som-b", t: String(b), x: 490, y, grootte: 56, kleur: somKleur(b, kb) },
    { s: "tekst", id: "som-i", t: "=", x: 570, y, grootte: 56, kleur: "#c3c7d0" },
  ];
  const nieuw: Beeld = { ...basis, delen: [...basis.delen.filter((d) => !d.id.startsWith("som-")), ...delen] };
  LAATSTE.set(st, nieuw);
  zet(l, { beeld: nieuw });
}

/* =====================================================================
   Soorten vragen
   ===================================================================== */

/** Tellen: sleep N goudstukken naar het vak (Squla: "waar liggen N goudstukken?"). */
function telVraag(doel: number, uitKist = false): Vraag {
  const n = doel + 6;
  return (l, st) => {
    const beeld = metLetters(st, `tel-${doel}`, []);
    const mk = (kist = false) => pzDingen("goudstuk", n, doel, doel > 12 ? doel - 2 : doel + 1, String(doel), false, kist);
    let kistGehad = false;
    return squlaVraag<number>(l, {
      toon: () => {
        /* De kist gaat maar één keer open (bij de eerste keer tonen), niet opnieuw na een fout of de uitleg. */
        const sp = mk(uitKist && !kistGehad);
        kistGehad = true;
        if (!toon(l, st, beeld, { s1: sp })) zet(l, { s1: sp, actief: false });
      },
      vraag: [`Sleep ${aantal(doel, "goudstuk")} naar het vak.`],
      antwoord: () => pzWachtVak(l),
      isGoed: (x) => x === doel,
      noem: (x) => aantal(x, "goudstuk"),
      goed: async () => {
        goedBeeld(l, st);
        await l.zeg(bevestig());
      },
      fout: () => foutBeeld(l, st),
      samen: async () => {
        await l.zeg("Ik leg de goudstukken één voor één in het vak.", "Tel maar mee.");
        await pzLegVoor(l, mk(), doel);
        await l.zeg("Kijk: rijen van 5.", `Samen zijn het er ${gv(doel, "goudstuk")}.`);
      },
      tip: [`Rijen van ${gv(5, "goudstuk")} tel je snel: ${gv(5, "goudstuk")}, ${gv(10, "goudstuk")}, en dan verder.`],
      reactie: (x) => {
        const veel = x > doel;
        return [`In het vak ${x === 1 ? "ligt" : "liggen"} ${aantal(x, "goudstuk")}.`, veel ? `Er moesten ${gv(doel, "goudstuk")} in het vak, dat zijn er te veel.` : `Er moesten ${gv(doel, "goudstuk")} in het vak, dat zijn er te weinig.`, doel > 5 ? `Tel in rijen van ${gv(5, "goudstuk")}: ${gv(5, "goudstuk")}, ${gv(10, "goudstuk")}, en dan verder.` : "Tel ze één voor één."];
      },
      /* De uitleg (samen) legt de goudstukken al één voor één in het vak; hier blijft het antwoord even staan. */
      toonAntwoord: async () => {
        await l.wacht(400);
      },
      testAntwoord: null,
    });
  };
}

/** Twee groepjes met het getal eronder: sleep het getal dat er samen uitkomt naar het vak achter de som. */
function samenVraag(vw: string, a: number, b: number, keuzesVast: number[]): Vraag {
  const s = a + b;
  /* Herstel 7 november (BOUWREGELS 1.23): het goede getal staat niet steeds in het midden; alleen de plek wisselt. */
  const keuzes = meng(keuzesVast);
  return (l, st) => {
    const cel = Math.max(a, b) <= 5 ? 92 : Math.max(a, b) <= 10 ? 78 : 66;
    const beeld = metLetters(st, `samen-${vw}-${a}-${b}`, [
      { s: "groep", id: "a", vw, n: a, x: 290, y: 255, per: 5, cel, label: String(a), kl: "paars" },
      { s: "groep", id: "b", vw, n: b, x: 690, y: 255, per: 5, cel, label: String(b), kl: "oranje" },
    ]);
    let spec: S2 | null = null;
    /* Herstel 7 november (OVERZICHT-C): de tegels iets hoger, met meer lucht tot de letters van de schat. */
    const tegels = (nieuw = false): S2 => (spec = nieuw || !spec ? pzTegels(keuzes, s, 455, 562) : spec);
    return squlaVraag<number>(l, {
      toon: () => {
        toon(l, st, beeld);
        pzSom(l, st, a, "+", b, "paars", "oranje", 455);
        zet(l, { s2: tegels(true), actief: false });
      },
      vraag: [`Hoeveel ${NAAM[vw][1]} zijn dit samen?`, "Sleep het goede getal naar het vak."],
      antwoord: () => pzWachtTegel(l, keuzes),
      isGoed: (x) => x === s,
      noem: (x) => g(x),
      goed: async () => {
        goedBeeld(l, st);
        await l.zeg(bevestig());
      },
      fout: () => foutBeeld(l, st),
      samen: async () => {
        zet(l, { licht: ["a"] });
        await l.zeg(`Hier ${a === 1 ? "is" : "zijn"} ${g(a, "paars")} ${a === 1 ? NAAM[vw][0] : NAAM[vw][1]}.`);
        zet(l, { licht: ["b"] });
        await l.zeg(`Daar ${b === 1 ? "is" : "zijn"} ${g(b, "oranje")} ${b === 1 ? NAAM[vw][0] : NAAM[vw][1]}.`);
        zet(l, { licht: [] });
        await plusUitleg(l, a, b);
      },
      tip: plusTip(a, b),
      reactie: (x) => pzReactie(a, b, x, plusTip(a, b)),
      toonAntwoord: () => tegelAntwoord(l, tegels(), keuzes, s, `${g(a, "paars")} + ${g(b, "oranje")} = ${g(s)}.`),
      testAntwoord: null,
    });
  };
}

/**
 * Een kale plussom: sleep het goede getal naar het vak.
 * Herstel 7 november (BOUWREGELS 1.22, OVERZICHT-C): de planeet, het raketje, de maan of de komeet boven de som deed niets
 * en trok de aandacht weg; die is weg (`deco` blijft als parameter voor de bestaande aanroepen). De som staat nu groot in
 * het midden en de tegels hebben ruim lucht tot de letters van de schat.
 */
function kaalPlus(a: number, b: number, keuzesVast: number[], deco: string): Vraag {
  const s = a + b;
  void deco;
  const keuzes = meng(keuzesVast);
  return (l, st) => {
    const beeld = metLetters(st, `kaal-${a}-${b}`, []);
    let spec: S2 | null = null;
    const tegels = (nieuw = false): S2 => (spec = nieuw || !spec ? pzTegels(keuzes, s, 300, 470) : spec);
    return squlaVraag<number>(l, {
      toon: () => {
        toon(l, st, beeld);
        pzSom(l, st, a, "+", b, "wit", "wit", 300);
        zet(l, { s2: tegels(true), actief: false });
      },
      vraag: [`Hoeveel is ${g(a)} + ${g(b)}?`, "Sleep het goede getal naar het vak."],
      antwoord: () => pzWachtTegel(l, keuzes),
      isGoed: (x) => x === s,
      noem: (x) => g(x),
      goed: async () => {
        goedBeeld(l, st);
        await l.zeg(bevestig());
      },
      fout: () => foutBeeld(l, st),
      samen: () => plusUitleg(l, a, b, false),
      tip: plusTip(a, b, false),
      reactie: (x) => pzReactie(a, b, x, plusTip(a, b, false)),
      toonAntwoord: () => tegelAntwoord(l, tegels(), keuzes, s, `${g(a)} + ${g(b)} = ${g(s)}.`),
      testAntwoord: null,
    });
  };
}

/**
 * Een minsom met alle dingen in een hoopje: het kind sleept de dingen die er nog zijn naar het vak (a − b).
 * `zinnen`: een verhaaltje (zonder de vraag), anders staat de som bovenaan en zegt Bliepo wat er gebeurt.
 */
function minVraag(vw: string, a: number, b: number, zinnen?: string[], metSom = !zinnen): Vraag {
  const s = a - b;
  const kl = KL[vw] ?? "wit";
  const slot = `Sleep de ${NAAM[vw][1]} die er nog zijn naar het vak.`;
  return (l, st) => {
    const beeld = metLetters(st, `min-${vw}-${a}-${b}`, []);
    const mk = () => pzDingen(vw, a, s, s + 1, "?", true);
    return squlaVraag<number>(l, {
      toon: () => {
        const sp = mk();
        if (toon(l, st, beeld, { s1: sp })) {
          if (metSom) som(l, st, a, "−", b, undefined, kl, kiesAnder(kl), kl);
        } else zet(l, { s1: sp, actief: false });
      },
      vraag: [...(zinnen ?? [`Er zijn ${aantal(a, vw)}.`, `Er ${b === 1 ? "gaat" : "gaan"} er ${gb(b, vw)} weg.`]), slot],
      antwoord: () => pzWachtVak(l),
      isGoed: (x) => x === s,
      noem: (x) => aantal(x, vw),
      goed: async () => {
        som(l, st, a, "−", b, s, kl, kiesAnder(kl), kl);
        goedBeeld(l, st);
        await l.zeg(bevestig());
      },
      fout: () => foutBeeld(l, st),
      samen: async () => {
        await l.zeg(`In het begin zijn er ${aantal(a, vw)}.`);
        /* Het rondje om wat wegvalt (de laatste in het hoopje) op het moment dat Bliepo het zegt (BOUWREGELS 7.8). */
        zet(l, { licht: Array.from({ length: b }, (_, i) => `s1.${s + i}`) });
        await l.zeg(`Er ${b === 1 ? "gaat" : "gaan"} er ${gb(b, vw)} weg.`);
        zet(l, { licht: [] });
        await l.zeg(b === 1 ? "Die telt niet meer mee." : "Die tellen niet meer mee.", "De andere leg ik in het vak.");
        await pzLegVoor(l, mk(), s);
        await l.zeg(`Er zijn er nog ${gv(s, vw)}.`);
      },
      tip: [`Eerst ${gv(a, vw)}, dan ${b === 1 ? "gaat" : "gaan"} er ${gb(b, vw)} weg.`, "Tel wat overblijft."],
      reactie: (x) => {
        if (x === a) return [`Je legde ze allemaal in het vak, ook die weggaan.`, `Er ${b === 1 ? "gaat" : "gaan"} er ${gb(b, vw)} weg.`];
        if (x === b) return [`Dat zijn de ${NAAM[vw][1]} die weggaan.`, "Het vak is voor wat er overblijft."];
        return getalReactie(x, s, [`Eerst ${gv(a, vw)}, dan ${b === 1 ? "gaat" : "gaan"} er ${gb(b, vw)} weg.`], {
          dicht: (hoog) => hoog ? `Je legde ${aantal(x, vw)} in het vak: dat is net 1 te veel.` : `Je legde ${aantal(x, vw)} in het vak: er blijft er net 1 meer over.`,
          ver: (hoog) => (hoog ? `Je legde ${aantal(x, vw)} in het vak, maar zoveel blijven er niet over.` : `Je legde ${aantal(x, vw)} in het vak, maar er blijven er meer over.`),
        });
      },
      /* De uitleg (samen) legt de overgebleven dingen al in het vak; hier komt het antwoord in de som. */
      toonAntwoord: async () => {
        som(l, st, a, "−", b, s, kl, kiesAnder(kl), kl);
        await l.wacht(500);
      },
      testAntwoord: null,
    });
  };
}

/** Een raadsel (grapje) met twee plaatjes om op te tikken. */
function raadselPlaatje(vraag: string[], opties: [string, string], goedNr: 0 | 1, goed: string[], samen: string[], tip: string[], namen: [string, string], waarom: string): Vraag {
  return (l, st) => {
    const delen: Deel[] = [];
    /* Herstel 7 november (BOUWREGELS 1.23): links of rechts wisselt per les-start; de ids (en dus de beoordeling) blijven. */
    const plek = meng([300, 680]);
    opties.forEach((vw, i) => {
      delen.push({ s: "ding", id: `k${i}`, vw, x: plek[i], y: 370, maat: 220 });
      delen.push({ s: "tik", id: `k${i}`, x: plek[i], y: 370, b: 260, h: 260, aria: namen[i] });
    });
    const beeld = metLetters(st, `raadsel-${opties.join("-")}`, delen);
    return squlaVraag<string>(l, {
      toon: () => {
        toon(l, st, beeld);
      },
      vraag,
      antwoord: () => tik(l),
      isGoed: (x) => x === `k${goedNr}`,
      noem: (x) => namen[Number(x.slice(1))],
      goed: async () => {
        goedBeeld(l, st, { goedIds: [`k${goedNr}`] });
        await l.zeg(bevestig());
      },
      fout: () => foutBeeld(l, st),
      samen: async () => {
        await l.zeg(...samen);
      },
      tip,
      reactie: (x) => [`Je tikte op ${namen[Number(x.slice(1))].replace(/^./, (c) => c.toLowerCase())}.`, waarom, ...zonderVraag(tip)],
      toonAntwoord: async () => {
        zet(l, { goedIds: [`k${goedNr}`], actief: false });
        await l.zeg(...zonderJa(goed));
      },
      testAntwoord: `k${goedNr}`,
    });
  };
}

/** Een raadsel met twee antwoorden (Bliepo leest ze voor). */
function raadselTekst(vraag: string[], opties: [string, string], goedNr: 0 | 1, goed: string[], samen: string[], tip: string[], deco: string, waarom: string): Vraag {
  return (l, st) => {
    /* Herstel 7 november (BOUWREGELS 1.22, OVERZICHT-C): het plaatje (komeet, maan) deed niets en de maan verklapte zelfs
       het antwoord "maan-darijn". Nu geen plaatje; de 2 antwoorden staan groot in het midden (`midden`). */
    const beeld = metLetters(st, `raadsel-${deco}`, []);
    /* Ronde 7 (BOUWREGELS 1.25): Bliepo zegt in het antwoord "Net als de maan!"; de maan komt dus pas NA het antwoord in beeld
       (tijdens de vraag zou hij "maan-darijn" verklappen). Bij de komeet-grap zegt Bliepo niets over een komeet: die blijft weg. */
    const toonDeco = () => {
      if (deco !== "maan") return;
      zet(l, { beeld: { ...beeld, delen: [{ s: "ding", id: "deco", vw: deco, x: 490, y: 190, maat: 190 }, ...beeld.delen] } });
    };
    return squlaVraag<string>(l, {
      toon: () => {
        toon(l, st, beeld);
      },
      vraag,
      antwoord: () => kiesTekst(l, meng(opties), 330),
      isGoed: (x) => x === opties[goedNr],
      noem: (x) => x.replace(/[.!?]+$/, ""),
      goed: async () => {
        goedBeeld(l, st);
        /* Sara, 7 november 2026: de maan blijft ongeveer 3 seconden in beeld, of tot Bliepo klaar is met zijn zin (het langste van de twee). */
        const begin = Date.now();
        toonDeco();
        await l.zeg(bevestig());
        if (deco === "maan") await l.wacht(Math.max(0, 3000 - (Date.now() - begin)));
      },
      fout: () => foutBeeld(l, st),
      samen: async () => {
        await l.zeg(...samen);
      },
      tip,
      reactie: (x) => ["Dat antwoord past niet bij het raadsel.", waarom, ...zonderVraag(tip)],
      toonAntwoord: async () => {
        toonDeco();
        await l.zeg(...zonderJa(goed));
      },
      testAntwoord: opties[goedNr],
    });
  };
}

/* =====================================================================
   Het verhaal
   ===================================================================== */

function verhaalBeeld(st: Stand, id: string, dingen: { vw: string; x: number; maat: number }[]): Beeld {
  return metLetters(
    st,
    id,
    dingen.map((d, i) => ({ s: "ding", id: `v${i}`, vw: d.vw, x: d.x, y: 360, maat: d.maat })),
  );
}

function maak(o: {
  level: number;
  titel: string;
  woord: string;
  voorwerpen: string[];
  begin: { vw: string; x: number; maat: number }[];
  welkom: string[];
  /** De eerste vraag van de les: die staat als voorbeeld op het beginscherm. */
  voorbeeld: Vraag;
  /** Na "Kun je dit al?" en vóór de eerste vraag: het verhaalbegin (schatkaart of sleutel), kort. */
  verhaal: string[];
  uitleg: (l: Lesgids, st: Stand) => Promise<void>;
  vragen: Vraag[];
  slot: (l: Lesgids, st: Stand) => Promise<void>;
  eind: string;
}) {
  const letterTal = o.woord.replace(/ /g, "").length;
  if (letterTal !== o.vragen.length) throw new Error(`Schattenjacht level ${o.level}: ${letterTal} letters maar ${o.vragen.length} vragen.`);
  return les({
    id: `squla-piraat-${o.level}`,
    titel: o.titel,
    onderwerp: "Rekenen met getallen",
    oefening: "De piratenschat met plus en min",
    level: o.level,
    kaart: KaartSchat,
    voorwerpen: o.voorwerpen,
    begin: null,
    /* Het woord van dit level vastleggen en het beginbeeld tonen (met de lege letters). */
    start: (l, st) => {
      WOORD.set(st, o.woord);
      toon(l, st, verhaalBeeld(st, `start-${o.level}`, o.begin));
    },
    welkom: o.welkom,
    naBegin: async (l, st) => {
      toon(l, st, verhaalBeeld(st, `verhaal-${o.level}`, o.begin));
      await l.zeg(...o.verhaal);
    },
    voorbeeld: voorbeeldVan(o.voorbeeld),
    uitleg: o.uitleg,
    vragen: o.vragen,
    naVraag: nieuweLetter,
    slot: o.slot,
    eind: o.eind,
  });
}

/* =====================================================================
   De lessen
   ===================================================================== */

/** Het voorbeeld op het beginscherm laat de goudstukken gewoon zien; bij de echte eerste vraag springen ze uit de schatkist. */
const EERSTE1 = telVraag(14);
const EERSTE1_KIST = telVraag(14, true);

const level1 = maak({
  level: 1,
  titel: "Schattenjacht: plussommen",
  woord: "onder de rode rots",
  voorwerpen: ["schatkaart", "goudstuk", "diamant", "parel", "kopermunt", "maansteen", "sleutel", "zak-chips", "kom-soep", "planeet", "maan", "raketje", "komeet", "rode-rots", "kistje"],
  begin: [{ vw: "kistje", x: KIST_BEGIN.x, maat: KIST_BEGIN.maat }],
  welkom: ["Op schattenjacht tel je goudstukken en maak je plussommen.", `Sleep ${aantal(14, "goudstuk")} naar het vak.`],
  voorbeeld: EERSTE1,
  verhaal: ["Kijk, een schatkist!", "Wat zit erin?", "De letters zeggen straks waar de schat ligt."],
  uitleg: async (l, st) => {
    /* Eerst het voorbeeld van het beginscherm: 14 goudstukken tellen in rijen van 5. */
    toon(l, st, metLetters(st, "voorbeeld-tellen", [{ s: "groep", id: "g", vw: "goudstuk", n: 14, x: 490, y: 360, per: 5, cel: 54 }]));
    await l.zeg("Kijk, goudstukken in rijen.", `In elke rij liggen er ${gv(5, "goudstuk")}.`);
    await l.zeg(`${gv(5, "goudstuk")}, ${gv(10, "goudstuk")}.`, "Dan nog een paar los.", `Samen zijn het er ${gv(14, "goudstuk")}.`);
    await l.verder();
    toon(l, st, metLetters(st, "voorbeeld", [
      { s: "groep", id: "a", vw: "diamant", n: 3, x: 290, y: 320, per: 5, cel: 54, label: "3", kl: "paars" },
      { s: "groep", id: "b", vw: "diamant", n: 2, x: 690, y: 320, per: 5, cel: 54, label: "2", kl: "oranje" },
    ]));
    zet(l, { licht: ["a"] });
    await l.zeg(`Hier liggen ${g(3, "paars")} diamanten.`);
    zet(l, { licht: ["b"] });
    await l.zeg(`Daar liggen er ${g(2, "oranje")}.`);
    zet(l, { licht: ["a", "b"] });
    await l.zeg(`Samen zijn het er ${g(5)}.`, `${g(3, "paars")} + ${g(2, "oranje")} = ${g(5)}.`);
    zet(l, { licht: [] });
    await l.verder();
  },
  /* Zoals Squla level 1: eerst tellen, dan "hoeveel samen" met plaatjes, een raadsel, dan kale sommen (tot 20, en tientallen). */
  vragen: [
    EERSTE1_KIST,
    telVraag(11),
    samenVraag("diamant", 4, 2, [5, 6, 7]),
    samenVraag("parel", 7, 5, [11, 12, 13]),
    samenVraag("kopermunt", 12, 6, [17, 18, 19]),
    samenVraag("maansteen", 6, 3, [8, 9, 10]),
    samenVraag("sleutel", 9, 4, [12, 13, 14]),
    raadselPlaatje(
      ["Nu een raadsel!", "Wat eet een robot het liefst?", "Een zak chips, of een kom soep?", "Tik op het goede plaatje."],
      ["zak-chips", "kom-soep"],
      0,
      ["Ja! Chips.", "In een computer zitten ook chips.", "En in mijn hoofd zit een computer!"],
      ["Het is een grapje.", "In een computer zitten kleine stukjes.", "Die heten ook zo, net als iets wat je kunt eten."],
      ["Denk aan een eten dat net zo heet als iets in een computer."],
      ["Een zak chips", "Een kom soep"],
      "Soep zit niet in een computer, chips wel.",
    ),
    kaalPlus(3, 4, [6, 7, 8], "planeet"),
    kaalPlus(8, 2, [9, 10, 11], "raketje"),
    kaalPlus(7, 4, [10, 11, 12], "maan"),
    kaalPlus(6, 6, [11, 12, 13], "komeet"),
    kaalPlus(10, 10, [10, 20, 30], "planeet"),
    kaalPlus(9, 5, [13, 14, 15], "raketje"),
    kaalPlus(10, 20, [20, 30, 40], "maan"),
  ],
  slot: async (l, st) => {
    toon(l, st, verhaalBeeld(st, "slot-1", [{ vw: "rode-rots", x: 490, maat: 340 }]));
    await l.zeg("De letters zeggen: onder de rode rots!", "Daar gaan we kijken.");
    toon(l, st, verhaalBeeld(st, "slot-1b", [{ vw: "rode-rots", x: 330, maat: 300 }, { vw: "kistje", x: 690, maat: 200 }]));
    await l.zeg("Bij de rots ligt een kistje.", "Er zit een nieuwe schatkaart in!", "Die zoeken we de volgende keer.");
    await l.verder();
  },
  eind: "Je kunt plussommen maken, ook met tientallen.",
});

const EERSTE2 = minVraag("ster", 6, 1, [`Ik heb ${aantal(6, "ster")} in mijn tas.`, `Er valt er ${gb(1, "ster")} uit.`]);

const level2 = maak({
  level: 2,
  titel: "Schattenjacht: minsommen",
  woord: "in de grote krater",
  voorwerpen: ["schatkaart", "ster", "diamant", "goudstuk", "parel", "maansteen", "kopermunt", "sleutel", "komeet", "kistje"],
  begin: [{ vw: "schatkaart", x: 490, maat: 320 }],
  welkom: ["Nu reken je met min: er gaat iets af.", `Ik heb ${aantal(6, "ster")} in mijn tas en er valt er ${gv(1, "ster")} uit.`, "Sleep de sterren die er nog zijn naar het vak."],
  voorbeeld: EERSTE2,
  verhaal: ["We hebben een nieuwe schatkaart.", "Waar ligt de schat nu?"],
  uitleg: async (l, st) => {
    /* Het voorbeeld van het beginscherm: 6 sterren, er valt er 1 uit (BOUWREGELS 14.21). */
    toon(l, st, metLetters(st, "voorbeeld", [{ s: "groep", id: "m", vw: "ster", n: 6, x: 490, y: 360, per: 5, cel: 62, kl: "geel" }]));
    await l.zeg(`Kijk: ${aantal(6, "ster")} in mijn tas.`);
    zet(l, { uit: ["m.5"], licht: ["m.5"] });
    await l.zeg(`Er valt er ${gb(1, "ster")} uit: die wordt grijs.`);
    zet(l, { licht: ["m.0", "m.1", "m.2", "m.3", "m.4"] });
    await l.zeg(`Er zijn er nog ${gv(5, "ster")}.`, `${gv(6, "ster")} − ${gb(1, "ster")} = ${gv(5, "ster")}.`, "Die sleep je naar het vak.");
    zet(l, { licht: [] });
    await l.verder();
  },
  /* Zoals Squla level 2: eerst verhaaltjes, een raadsel, dan minsommen met een plaatje. Begin 5–11, eraf 1–5. */
  vragen: [
    EERSTE2,
    minVraag("diamant", 7, 3, [`Ik vind ${aantal(7, "diamant")}.`, `Er rollen er ${gb(3, "diamant")} weg.`]),
    minVraag("goudstuk", 9, 4, [`Ik heb ${aantal(9, "goudstuk")}.`, `Ik betaal er ${gb(4, "goudstuk")} voor een kompas.`]),
    minVraag("parel", 10, 2, [`Ik heb ${aantal(10, "parel")}.`, `Ik verlies er ${gb(2, "parel")}.`]),
    minVraag("maansteen", 8, 3, [`Er liggen ${aantal(8, "maansteen")}.`, `Ik stop er ${gb(3, "maansteen")} in mijn tas.`]),
    minVraag("kopermunt", 11, 4, [`Ik heb ${aantal(11, "kopermunt")}.`, `Ik geef er ${gb(4, "kopermunt")} weg.`]),
    raadselTekst(
      ["Nu een raadsel!", "Waarom gaat een robot nooit zwemmen?", "Is het omdat hij dan gaat roesten?", "Of omdat hij geen zwembroek heeft?"],
      ["Omdat hij dan gaat roesten.", "Omdat hij geen zwembroek heeft."],
      0,
      ["Precies! Een robot is van ijzer.", "IJzer gaat roesten in het water."],
      ["Het is een grapje.", "Een robot is van ijzer.", "Denk aan wat er met ijzer in het water gebeurt."],
      ["IJzer in het water gaat roesten."],
      "komeet",
      "Een zwembroek is niet het grapje, het gaat om waar een robot van gemaakt is.",
    ),
    minVraag("ster", 7, 2),
    minVraag("sleutel", 9, 5),
    minVraag("diamant", 6, 4),
    minVraag("goudstuk", 10, 4),
    minVraag("parel", 8, 1),
    minVraag("maansteen", 11, 5),
    minVraag("kopermunt", 5, 2),
    minVraag("ster", 10, 3),
  ],
  slot: async (l, st) => {
    toon(l, st, verhaalBeeld(st, "slot-2", [{ vw: "maansteen", x: 330, maat: 260 }, { vw: "sleutel", x: 690, maat: 200 }]));
    await l.zeg("De letters zeggen: in de grote krater!", "Kijk, daar ligt een maansteen met een sleutel ernaast.", "Waar past die sleutel op?", "Dat zoeken we de volgende keer.");
    await l.verder();
  },
  eind: "Je kunt minsommen maken.",
});

const EERSTE3 = minVraag("ster", 7, 4, [`${gv(7, "ster")} − ${gb(4, "ster")}.`], true);

const level3 = maak({
  level: 3,
  titel: "Schattenjacht: plus en min",
  woord: "naast de oude raket",
  voorwerpen: ["sleutel", "schatkaart", "ster", "goudstuk", "diamant", "parel", "maansteen", "kopermunt", "planeet", "maan", "raketje", "komeet", "oude-raket", "schatkist"],
  begin: [{ vw: "schatkaart", x: 330, maat: 280 }, { vw: "sleutel", x: 690, maat: 200 }],
  welkom: ["Plus en min staan door elkaar.", `${gv(7, "ster")} − ${gb(4, "ster")}.`, "Sleep de sterren die er nog zijn naar het vak."],
  voorbeeld: EERSTE3,
  verhaal: ["We hebben een sleutel gevonden.", "Waar past hij op?"],
  uitleg: async (l, st) => {
    /* Eerst het voorbeeld van het beginscherm: de minsom 7 − 4 met sterren. */
    toon(l, st, metLetters(st, "voorbeeld-min", [{ s: "groep", id: "m", vw: "ster", n: 7, x: 490, y: 360, per: 5, cel: 62 }]));
    som(l, st, 7, "−", 4, undefined, "geel", kiesAnder("geel"), "geel");
    await l.zeg(`Kijk: ${aantal(7, "ster")}.`);
    /* pas bij "weg" grijs (BOUWREGELS 14.22: de kleur verklapt het antwoord niet vooraf) */
    zet(l, { licht: ["m.3", "m.4", "m.5", "m.6"], uit: ["m.3", "m.4", "m.5", "m.6"] });
    await l.zeg(`Er gaan er ${gb(4, "ster")} weg: die worden grijs.`);
    zet(l, { licht: ["m.0", "m.1", "m.2"] });
    await l.zeg(`Er zijn er nog ${gv(3, "ster")}.`, `${gv(7, "ster")} − ${gb(4, "ster")} = ${gv(3, "ster")}.`);
    zet(l, { licht: [] });
    await l.verder();
    toon(l, st, metLetters(st, "voorbeeld", []));
    som(l, st, 8, "+", 5, undefined, "wit", "wit", "wit");
    await l.zeg("Kijk goed naar het teken.", "Een plus: er komt bij.", "Een min: er gaat af.");
    await plusUitleg(l, 8, 5, false);
    som(l, st, 8, "+", 5, 13, "wit", "wit", "wit");
    await l.zeg(`${g(8)} + ${g(5)} = ${g(13)}.`);
    await l.verder();
    l.som(null);
  },
  /* Zoals Squla level 3: plus en min door elkaar tot 20, ook over het tiental, en een raadsel. */
  vragen: [
    EERSTE3,
    kaalPlus(7, 6, [12, 13, 14], "planeet"),
    minVraag("goudstuk", 14, 6, [`${gv(14, "goudstuk")} − ${gb(6, "goudstuk")}.`], true),
    kaalPlus(13, 7, [10, 19, 20], "raketje"),
    raadselTekst(
      ["Nu een raadsel!", "Welke vrucht hoort in de ruimte?", "Is het de maan-darijn?", "Of de banaan?"],
      ["De maan-darijn!", "De banaan."],
      0,
      ["Goed geluisterd! De maan-darijn.", "Net als de maan!"],
      ["Het is een grapje.", "Luister maar: maan… darijn.", "Er zit een woord uit de ruimte in."],
      ["Luister goed naar het eerste stukje van het woord."],
      "maan",
      "Een banaan komt niet uit de ruimte, dat hoort niet bij het raadsel.",
    ),
    minVraag("diamant", 12, 5, [`${gv(12, "diamant")} − ${gb(5, "diamant")}.`], true),
    minVraag("parel", 16, 5, [`${gv(16, "parel")} − ${gb(5, "parel")}.`], true),
    kaalPlus(8, 8, [15, 16, 17], "komeet"),
    minVraag("sleutel", 11, 3, [`${gv(11, "sleutel")} − ${gb(3, "sleutel")}.`], true),
    kaalPlus(6, 5, [10, 11, 12], "maan"),
    minVraag("maansteen", 15, 7, [`${gv(15, "maansteen")} − ${gb(7, "maansteen")}.`], true),
    kaalPlus(9, 8, [16, 17, 18], "planeet"),
    minVraag("kopermunt", 13, 4, [`${gv(13, "kopermunt")} − ${gb(4, "kopermunt")}.`], true),
    kaalPlus(15, 4, [18, 19, 20], "raketje"),
    minVraag("ster", 18, 8, [`${gv(18, "ster")} − ${gb(8, "ster")}.`], true),
    kaalPlus(5, 8, [12, 13, 14], "komeet"),
  ],
  slot: async (l, st) => {
    toon(l, st, verhaalBeeld(st, "slot-3", [{ vw: "oude-raket", x: 330, maat: 340 }, { vw: "schatkist", x: 690, maat: 240 }]));
    await l.zeg("De letters zeggen: naast de oude raket!", "Daar staat een kist.", "De sleutel past!", "De kist zit vol glimmende sterren.", "We hebben de schat gevonden!");
    await l.verder();
  },
  eind: "Je kunt plus en min door elkaar.",
});

export const LESSEN_SQULA_PIRAAT = [level1, level2, level3];
