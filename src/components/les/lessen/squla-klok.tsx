/**
 * Klokkijken naar Squla groep 3 Rekenen (31 oktober 2026, opdracht eigenaar):
 * per Squla-oefening per level één les, met eigen zinnen, eigen verhaaltjes
 * en andere tijden (alleen het leerdoel, de soorten vragen en de opbouw zijn
 * van Squla):
 *
 *   De digitale klok (16839)  level 1, 2     squla-klok-digitaal-1/2
 *   Hoe laat is het? (15822)  level 1, 2, 3  squla-klok-hoelaat-1/2/3
 *   Klokkijken (14274)        level 1, 3, 4  squla-klok-klokkijken-1/2/3
 *                             (level 2 is bij Squla een filmpje: geen les;
 *                             de uitleg van Bliepo gebruikt wat erin staat)
 *   Klokkijken 1 (10999)      level 1, 2, 3  squla-klok-klokkijken1-1/2/3
 *   Klokkijken 2 (11000)      level 1, 2, 3  squla-klok-klokkijken2-1/2/3
 *   Klokkijken 3 (6935)       level 1–4      squla-klok-klokkijken3-1/2/3/4
 *
 * Geen mensen en geen dieren: Squla's egelopvang werd een plantje in de kas
 * dat water krijgt en naar buiten gaat; bakker Bo werd de bakkerij zelf (de
 * oven, het deeg, de taarten), en de meneer aan de deur de bezorgbus die
 * broodjes komt halen. Kinderen bij "over een uur" werden dingen met een
 * klok: de bus bij de halte, het bedje met bedtijd, de oven, het raketje.
 *
 * Elke les volgt de opbouw van het Squla-level; aan het eind komen (zoals bij
 * Squla) de vragen terug die niet meteen goed waren, aangevuld tot minstens
 * 15 opgaven. De hulp is die van squla-hulp.ts. Stijl: nacht, klokken strak
 * in code, gloed alleen op het moment dat het iets betekent.
 *
 * 1 november 2026 (BOUWREGELS 8.1): alleen de gewone wijzerklok, en wel de klok
 * uit de Synthesis-kloklessen (zie squla-klok-tekenen.ts). Geen digitale klok
 * meer: de vragen die daarover gingen, gaan nu over de wijzerklok, met
 * dezelfde soort rekenvraag. De ids van de lessen zijn gelijk gebleven.
 * Elke les begint met een eigen zin over waar de les over gaat (BOUWREGELS 4.3).
 */

import { krijgtVervolgvraag, isBegeleideUitleg, uitlegKeuze, bevestig as kortBevestig, zetSynthesisHulp, terugAankondiging, terugAfsluiting } from "./squla-uitleg";
import type { Lesdraaiboek, Lesgids } from "../soort";
import { squlaBegin, squlaEind, squlaVraag, type SqulaVraag } from "./squla-hulp";
import { SqulaKlokVlak, KaartKlok, type Ding, type KlokVlakProps, type Naspeel } from "../vlakken/squla-klok-vlak";
import type { Kl } from "../vlakken/squla-klok-tekenen";
import { speelLesgeluid } from "@/lib/lesgeluiden";

/* =====================================================================
   tijden en dingen
   ===================================================================== */

/** Een tijd op de wijzerklok: `u` = waar de kleine wijzer vanaf komt (1–12), `m` = minuten. */
type T = { u: number; m: number };
const U = (n: number): T => ({ u: n, m: 0 });
/** half n: de kleine wijzer tussen n-1 en n. */
const H = (n: number): T => ({ u: n === 1 ? 12 : n - 1, m: 30 });
/** bijna half n (5 voor half). */
const B = (n: number): T => ({ u: n === 1 ? 12 : n - 1, m: 25 });
const na = (t: T) => (t.u % 12) + 1;

/** Zoals Bliepo het zegt ({…} = getal). */
function spreek(t: T) {
  if (t.m === 0) return `{${t.u}:oranje} uur`;
  if (t.m === 30) return `half {${na(t)}:oranje}`;
  return `bijna half {${na(t)}:oranje}`;
}
/** Zoals het op een knop staat. */
function woord(t: T) {
  if (t.m === 0) return `${t.u} uur`;
  if (t.m === 30) return `half ${na(t)}`;
  return `bijna half ${na(t)}`;
}
const KLEUREN: Kl[] = ["blauw", "oranje", "groen", "roze", "paars", "rood", "turkoois", "geel"];
let kleurTeller = 0;
const kleurRij = (n: number) => {
  const k = kleurTeller;
  kleurTeller += n;
  return Array.from({ length: n }, (_, i) => KLEUREN[(k + i) % KLEUREN.length]);
};

const W = (t: T, kleur: Kl, nadruk?: "uur" | "min"): Ding => ({ t: "wijzer", u: t.u, m: t.m, kleur, ...(nadruk ? { nadruk } : {}) });
const V = (naam: string, scherm?: T): Ding => ({ t: "vw", naam, ...(scherm ? { scherm: { u: scherm.u, m: scherm.m } } : {}) });
const Tx = (tekst: string): Ding => ({ t: "tekst", tekst });
const Tk = (tekst: string): Ding => ({ t: "teken", tekst });
const VINK: Ding = { t: "vink" };
const KRUIS: Ding = { t: "kruis" };

/** Zet de nadruk op een wijzer van een klok (of haal hem weg). */
const metNadruk = (d: Ding, nadruk?: "uur" | "min"): Ding => (d.t === "wijzer" ? W({ u: d.u, m: d.m }, d.kleur, nadruk) : d);

/** Getallen in een knoptekst tussen {…} (voor wat Bliepo zegt). */
const metHaken = (s: string) => s.replace(/\d+/g, (n) => `{${n}:oranje}`);
/** Bij een goed antwoord alleen een korte bevestiging (Sara, 4 nov); het waarom zit in het beeld. De goedgekeurde les
    squla-klok-hoelaat-1 houdt zijn "Goed zo." en zijn eigen goed-zinnen. */
const goedZeg = (l: Lesgids, zinnen: string[]): string[] => (l.lesId === "squla-klok-hoelaat-1" ? ["Goed zo.", ...zinnen] : [kortBevestig()]);
/** Goed-zin bij het lezen van een klok: wisselt met de tijd, zodat niet elke les "Het is ... uur." zegt (Sara, 4 nov). */
const goedLees = (l: Lesgids, t: T): string => {
  if (l.lesId === "squla-klok-hoelaat-1") return `Het is ${spreek(t)}.`;
  const n = (t.u * 7 + t.m) % 5;
  if (t.m === 0) return [`Het is ${spreek(t)}.`, `De kleine wijzer staat bij de {${t.u}:oranje}: ${spreek(t)}.`, `Ja, ${spreek(t)}.`, `Dat is ${spreek(t)} op deze klok.`, `Zo lees je het: ${spreek(t)}.`][n];
  return [`Dat is ${spreek(t)}.`, `Tussen de {${t.u}:oranje} en de {${na(t)}:oranje} staat de kleine wijzer: ${spreek(t)}.`, `Ja, ${spreek(t)}.`, `De klok laat ${spreek(t)} zien.`, `Zo lees je het: ${spreek(t)}.`][n];
};
/** Na de tweede fout: wat de wijzers laten zien en dus welke tijd het is (zonder weetje). */
const wijzerUitleg = (t: T): string[] => {
  if (t.m === 0) return [`De grote wijzer staat op de {12:paars} en de kleine wijzer op de {${t.u}:oranje}.`, `Dus het is ${spreek(t)}.`];
  return [`De grote wijzer staat ${t.m === 30 ? "op" : "net vóór"} de {6:paars} en de kleine wijzer tussen de {${t.u}:oranje} en de {${na(t)}:oranje}.`, `Dus het is ${spreek(t)}.`];
};
const Hoofd = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Een tijd uit een knoptekst terug ("7 uur", "half 5", "bijna half 3"). */
function leesWoord(x: string): T | null {
  const b = x.match(/^bijna half (\d+)$/i);
  if (b) return B(Number(b[1]));
  const h = x.match(/^half (\d+)$/i);
  if (h) return H(Number(h[1]));
  const u = x.match(/^(\d+) uur$/i);
  if (u) return U(Number(u[1]));
  return null;
}

/** Waar de kleine wijzer van een heel uur staat, in gewone woorden (voor een hint zonder het getal te noemen). */
function plekKleineWijzer(t: T): string {
  const k = (t.u % 12) + (t.m === 0 ? 0 : 0.5);
  if (k === 0) return "bovenaan";
  if (k === 6) return "onderaan";
  if (k === 3) return "rechts";
  if (k === 9) return "links";
  if (k < 3) return "rechtsboven";
  if (k < 6) return "rechtsonder";
  if (k < 9) return "linksonder";
  return "linksboven";
}

/** Eerste fout bij het lezen van een klok: het kind koos de tijd `g` (in woorden), de klok laat `t` zien. */
function reactieLees(x: string, t: T): string[] {
  const g = leesWoord(x);
  if (!g) return [`Je koos ${metHaken(x)}. Op deze klok staat de kleine wijzer ${plekKleineWijzer(t)}. Kijk naar het getal waar hij wijst.`];
  if (g.m === 0 && t.m === 0) return [`Bij {${g.u}:oranje} uur wijst de kleine wijzer naar de {${g.u}:oranje}.`, `Op deze klok wijst de kleine wijzer ${plekKleineWijzer(t)}. Kijk naar het getal daar.`];
  if (t.m === 0) return [`Bij ${spreek(g)} staat de grote wijzer ${g.m === 30 ? "precies op" : "net vóór"} de {6:paars}.`, "Op deze klok staat de grote wijzer bovenaan. Dat is een heel uur."];
  if (g.m === 0) return [`Bij ${spreek(g)} staat de grote wijzer op de {12:paars}.`, "Op deze klok staat hij niet op de {12:paars}."];
  if (g.m !== t.m) return t.m === 30 ? ["Bij bijna half staat de grote wijzer net vóór de {6:paars}.", "Hier staat hij precies op de {6:paars}."] : ["Bij half staat de grote wijzer precies op de {6:paars}.", "Hier staat hij er net vóór."];
  return [`Bij ${spreek(g)} staat de kleine wijzer tussen de {${g.u}:oranje} en de {${na(g)}:oranje}.`, `Op deze klok staat de kleine wijzer ${plekKleineWijzer(t)}. Kijk naar de 2 getallen waar hij tussen staat.`];
}

/** Eerste fout bij het kiezen van een klok: het kind koos een klok die `g` laat zien, gezocht wordt `doel`. */
function reactieKlokkeuze(g: T, doel: T): string[] {
  if (g.m === 0 && doel.m === 0) return [`Bij die klok wijst de kleine wijzer naar de {${g.u}:oranje}.`, `Zoek de klok waar hij naar de {${doel.u}:oranje} wijst.`];
  if (doel.m === 0) return [`Die klok laat ${spreek(g)} zien.`, "Bij een heel uur staat de grote wijzer op de {12:paars}."];
  if (g.m === 0) return [`Die klok laat ${spreek(g)} zien.`, `Bij ${spreek(doel)} staat de grote wijzer ${doel.m === 30 ? "precies op" : "net vóór"} de {6:paars}.`];
  if (g.m !== doel.m) return [`Die klok laat ${spreek(g)} zien.`, doel.m === 30 ? "Bij half staat de grote wijzer precies op de {6:paars}." : "Bij bijna half staat de grote wijzer net vóór de {6:paars}."];
  return [`Die klok laat ${spreek(g)} zien.`, `Zoek de klok waar de kleine wijzer tussen de {${doel.u}:oranje} en de {${na(doel)}:oranje} staat.`];
}

/** Hoeveel minuten de klok `g` na de klok `nu` komt (0 tot 719). */
const verschil = (g: T, nu: T) => ((((g.u % 12) * 60 + g.m) - ((nu.u % 12) * 60 + nu.m)) % 720 + 720) % 720;

/* =====================================================================
   het vlak besturen
   ===================================================================== */

const LEEG: KlokVlakProps = { sleutel: "", modus: "kies", boven: [], keuzes: [], pijl: false, paren: undefined, rechts: undefined, vast: null, actief: false, licht: [], goed: [], fout: [], uit: [], reis: undefined, naspeel: undefined, sfeer: undefined, vraagLabel: undefined };
const zet = (l: Lesgids, p: Partial<KlokVlakProps>) => l.pasVlakAan<KlokVlakProps>(p);
let beeldNr = 0;
const nieuw = () => `kk${++beeldNr}`;

/** Bliepo laat iets oplichten en zegt er iets bij. */
async function wijs(l: Lesgids, ids: string[], ...zinnen: string[]) {
  zet(l, { licht: ids });
  await l.zeg(...zinnen);
}

type Opgave = (l: Lesgids, terug: boolean) => SqulaVraag<string>;

/*
  Het goede antwoord staat niet steeds op dezelfde plek (BOUWREGELS 1.23, Sara 7 november 2026). Bij elke les-start kiest
  de les een nieuw toeval-zaadje; daarmee krijgt elke vraag een eigen, willekeurige volgorde. Binnen één les-start blijft
  de volgorde van een vraag gelijk (het voorbeeld op het beginscherm en de vraag zelf zien er hetzelfde uit). Alleen de
  plek wisselt: de antwoorden, de beoordeling, de hints en de score blijven precies zoals ze waren.
*/
let lesZaad = 1;
function hash(tekst: string) {
  let h = 2166136261 ^ lesZaad;
  for (const ch of tekst) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function toeval(tekst: string) {
  let h = hash(tekst);
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/** Een willekeurige volgorde (per les-start en per vraag); de goede index schuift mee. Vinkje en kruisje blijven op hun plek. */
function draai<X>(lijst: X[], goed: number, terug: boolean, sleutel = ""): { lijst: X[]; goed: number } {
  if (lijst.length < 2 || lijst.some((d) => (d as { t?: string }).t === "vink" || (d as { t?: string }).t === "kruis")) return { lijst, goed };
  const r = toeval(`${sleutel}|${JSON.stringify(lijst)}|${terug ? "t" : ""}`);
  const volg = lijst.map((_, i) => i);
  for (let i = volg.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [volg[i], volg[j]] = [volg[j], volg[i]];
  }
  return { lijst: volg.map((i) => lijst[i]), goed: volg.indexOf(goed) };
}
/** Koppelen: de rechterkant door elkaar, en geen enkel paar recht tegenover elkaar (BOUWREGELS 1.23). */
function rechtsDoorElkaar(n: number, sleutel: string): number[] {
  const r = toeval(`rechts|${sleutel}`);
  for (let poging = 0; poging < 50; poging++) {
    const v = Array.from({ length: n }, (_, i) => i);
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [v[i], v[j]] = [v[j], v[i]];
    }
    if (v.every((k, j) => k !== j)) return v;
  }
  return Array.from({ length: n }, (_, i) => (i + 1) % n);
}

/* --- de algemene vraag: tikken op een ding in het vlak --- */

type KiesO = {
  boven?: Ding[];
  /** De vraagklok krijgt een eigen vak met dit woord erboven (bv. "nu"). */
  vraagLabel?: string;
  pijl?: boolean;
  keuzes: Ding[];
  goed: number;
  vraag: string[];
  goedZin: string[];
  /** Hoe Bliepo elk antwoord noemt bij een fout. */
  noem?: (i: number) => string;
  samen: (l: Lesgids, k: { keuzes: Ding[]; boven: Ding[] }) => Promise<void>;
  tip: string[];
  /** Eerste fout bij de Synthesis-hulp: wat Bliepo zegt over het gekozen ding (i = plek in `keuzes` zoals opgegeven). */
  reactie?: (i: number) => string[];
  /** Tweede fout: wat Bliepo zegt bij het goede antwoord (anders `goedZin`). */
  antwoordZin?: string[];
};

function kiesVraag(l: Lesgids, o: KiesO, terug: boolean): SqulaVraag<string> {
  const { lijst: keuzes, goed } = draai(o.keuzes, o.goed, terug, o.vraag.join(" "));
  const boven = o.boven ?? [];
  const oud = (i: number) => o.keuzes.indexOf(keuzes[i]);
  return {
    toon: () => zet(l, { ...LEEG, sleutel: nieuw(), modus: "kies", boven, keuzes, pijl: !!o.pijl, ...(o.vraagLabel ? { vraagLabel: o.vraagLabel } : {}) }),
    vraag: o.vraag,
    antwoord: async () => {
      zet(l, { actief: true, fout: [], licht: [] });
      const g = await l.wachtOpVlak<{ soort: string; id: string }>("kies");
      zet(l, { actief: false });
      return g.id;
    },
    isGoed: (x) => x === `k${goed}`,
    noem: (x) => (o.noem ? o.noem(oud(Number(x.slice(1)))) : "Die"),
    goed: async (x) => {
      zet(l, { goed: [x], licht: [] });
      await l.zeg(...goedZeg(l, o.goedZin));
      await l.wacht(250);
    },
    fout: (x) => zet(l, { fout: [x] }),
    samen: async () => {
      zet(l, { fout: [], licht: [], goed: [] });
      await o.samen(l, { keuzes, boven });
      zet(l, { licht: [], keuzes, boven });
    },
    tip: o.tip,
    reactie: o.reactie ? (x) => o.reactie!(oud(Number(x.slice(1)))) : undefined,
    toonAntwoord: async () => {
      zet(l, { fout: [], licht: [], goed: [`k${goed}`] });
      await l.zeg(...(o.antwoordZin ?? o.goedZin));
      await l.wacht(250);
    },
    testAntwoord: `k${goed}`,
  };
}

/* --- een vraag met knoppen bij Bliepo (tijden in woorden, getallen) --- */

type KnopO = {
  boven: Ding[];
  pijl?: boolean;
  opties: string[];
  goed: string;
  vraag: string[];
  goedZin: string[];
  samen: (l: Lesgids, boven: Ding[]) => Promise<void>;
  tip: string[];
  /** Eerste fout bij de Synthesis-hulp: wat Bliepo over het gekozen antwoord zegt. */
  reactie?: (x: string) => string[];
  /** Tweede fout: wat Bliepo zegt bij het goede antwoord (anders `goedZin`). */
  antwoordZin?: string[];
};

/** Bij goed licht de klok op, niet het ding ernaast (dat speelt eventueel het verhaal na). Zonder klok: alles. */
const klokIds = (boven: Ding[]) => {
  const ids = boven.map((d, i) => (d.t === "vw" && boven.some((e) => e.t !== "vw") ? "" : `b${i}`)).filter(Boolean);
  return ids;
};

function knopVraag(l: Lesgids, o: KnopO, terug: boolean): SqulaVraag<string> {
  /* de goede knop staat niet steeds vooraan: een vaste schuif per vraag (en een andere als hij terugkomt) */
  const n = o.opties.length;
  const k = (hash(o.vraag.join("") + o.goed + o.opties.join("")) + (terug ? 1 : 0)) % n;
  const opties = [...o.opties.slice(k), ...o.opties.slice(0, k)];
  return {
    toon: () => zet(l, { ...LEEG, sleutel: nieuw(), modus: "kies", boven: o.boven, keuzes: [], pijl: !!o.pijl }),
    vraag: o.vraag,
    antwoord: async () => (await l.kies(opties, { weetniet: false, direct: true })) ?? "",
    isGoed: (x) => x === o.goed,
    noem: (x) => Hoofd(metHaken(x)),
    goed: async () => {
      zet(l, { goed: klokIds(o.boven) });
      await l.zeg(...goedZeg(l, o.goedZin));
      await l.wacht(250);
    },
    samen: async () => {
      await o.samen(l, o.boven);
      zet(l, { licht: [], boven: o.boven });
    },
    tip: o.tip,
    reactie: o.reactie ? (x) => o.reactie!(x) : undefined,
    toonAntwoord: async () => {
      zet(l, { fout: [], licht: [], goed: klokIds(o.boven) });
      await l.zeg(...(o.antwoordZin ?? o.goedZin));
      await l.wacht(250);
    },
    testAntwoord: o.goed,
  };
}

/* =====================================================================
   uitleg die vaak terugkomt (samen kijken)
   ===================================================================== */

/** Beschrijf waar de kleine wijzer staat (zonder de tijd te noemen). */
function waarKlein(t: T, metGroot: boolean) {
  if (t.m === 0) return metGroot ? `Hier staat de grote wijzer op de {12:paars}, en de kleine wijst naar de {${t.u}:oranje}.` : `Hier wijst de kleine wijzer naar de {${t.u}:oranje}.`;
  const tussen = `de kleine wijzer tussen de {${t.u}:oranje} en de {${na(t)}:oranje}`;
  if (t.m === 30) return metGroot ? `Hier staat de grote wijzer op de {6:paars}, en ${tussen}.` : `Hier staat ${tussen}.`;
  return `Hier staat ${tussen}.`;
}

/** De regel voor de tijd die we zoeken. */
function regel(t: T): string[] {
  if (t.m === 0) return [`Bij {${t.u}:oranje} uur staat de grote wijzer op de {12:paars}.`, `En de kleine wijzer wijst naar de {${t.u}:oranje}.`];
  if (t.m === 30) return [`Bij half {${na(t)}:oranje} staat de grote wijzer op de {6:paars}.`, `En de kleine wijzer staat tussen de {${t.u}:oranje} en de {${na(t)}:oranje}.`];
  return [`Bij bijna half {${na(t)}:oranje} staat de grote wijzer net vóór de {6:paars}.`, `En de kleine wijzer staat tussen de {${t.u}:oranje} en de {${na(t)}:oranje}.`];
}

/** Samen langs de wijzerklokken: steeds de kleine wijzer oranje, en zeggen waar hij staat. */
async function samenKlokken(l: Lesgids, doel: T, keuzes: Ding[], boven: Ding[] = []) {
  const tijden = keuzes.map((d) => (d.t === "wijzer" ? { u: d.u, m: d.m } : null));
  const gemengd = new Set(tijden.filter(Boolean).map((t) => t!.m)).size > 1;
  if (doel.m === 0 && !gemengd) await l.zeg("Bij een heel uur staat de grote wijzer op de {12:paars}.", [
    "Kijk waar de kleine wijzer naartoe wijst. Dat getal vertelt welk uur het is.",
    "De kleine wijzer wijst een getal aan. Dat getal is het uur.",
    "Zoek het getal bij de kleine wijzer. Dat is het uur.",
  ][doel.u % 3]!);
  else if (doel.m === 30 && !gemengd) await l.zeg("Bij half staat de grote wijzer op de {6:paars}.", "De kleine wijzer staat dan tussen 2 getallen.");
  else if (doel.m === 25) await l.zeg("Bij bijna half staat de grote wijzer net vóór de {6:paars}.", "Kijk dan naar de kleine wijzer.");
  else await l.zeg("Kijk naar allebei de wijzers.", "Staat de grote wijzer op de {12:paars}? Dan is het een heel uur.", "Staat hij op de {6:paars}? Dan is het half.");
  for (let i = 0; i < keuzes.length; i++) {
    const t = tijden[i];
    if (!t) continue;
    zet(l, { keuzes: keuzes.map((d, j) => metNadruk(d, j === i ? "uur" : undefined)), boven });
    await wijs(l, [`k${i}`], waarKlein(t, gemengd));
  }
  zet(l, { keuzes, licht: [] });
  if (!krijgtVervolgvraag(l)) {
    await l.zeg(...regel(doel));
    await l.zeg("Zoek nu de klok waarop de wijzers zo staan.");
  }
}

/** Samen één wijzerklok lezen (de klok staat bovenaan als `b<i>`). */
async function samenLees(l: Lesgids, t: T, boven: Ding[], i: number) {
  const zetN = (n?: "uur" | "min") => zet(l, { boven: boven.map((d, j) => (j === i ? metNadruk(d, n) : d)) });
  zetN("min");
  const v = (t.u + i) % 3;
  if (t.m === 0) {
    await wijs(l, [`b${i}`], ["Kijk eerst naar de grote wijzer.", "Begin bij de grote wijzer.", "Eerst de grote wijzer."][v]!, "Die staat op de {12:paars}.", ["Dan is het een heel uur.", "Zo'n klok laat een heel uur zien.", "Dat betekent: een heel uur."][v]!);
    zetN("uur");
    await l.zeg(["Kijk nu naar de kleine wijzer.", "Nu is de kleine wijzer aan de beurt.", "Dan kijken we naar de kleine wijzer."][v]!, ...(krijgtVervolgvraag(l) ? [] : ["Naar welk getal wijst hij?"]));
  } else {
    await wijs(l, [`b${i}`], ["Kijk eerst naar de grote wijzer.", "Begin bij de grote wijzer.", "Eerst de grote wijzer."][v]!, "Die staat op de {6:paars}.", ["Dan is het half.", "Zo'n klok laat half zien.", "Dat betekent: half."][v]!);
    zetN("uur");
    await l.zeg(`De kleine wijzer staat tussen de {${t.u}:oranje} en de {${na(t)}:oranje}.`, "Kijk naar het volgende getal. Bij half zeg je dat getal, ook al is de kleine wijzer er nog niet.");
  }
  zetN(undefined);
}

/* =====================================================================
   de soorten vragen
   ===================================================================== */

const noemKlok = () => "Die klok";

/** Op welke wijzerklok is het …? (2 of 3 klokken). `zin`: eigen vraag, `boven`: wat erboven staat. */
function kiesKlok(doel: T, tijden: T[], o: { zin?: string[]; boven?: Ding[]; zelfdeKleur?: boolean; goedZin?: string[]; reactie?: (gekozen: T) => string[]; vraagLabel?: string; naspeel?: Naspeel; sfeer?: { naam: string; plek?: "hoog" | "laag" } } = {}): Opgave {
  return (l, terug) => {
    const v = kiesKlokKaal(doel, tijden, o)(l, terug);
    if (o.naspeel) return metNaspeel(l, v, o.naspeel);
    if (o.sfeer) return metSfeer(l, v, o.sfeer);
    return v;
  };
}
function kiesKlokKaal(doel: T, tijden: T[], o: { zin?: string[]; boven?: Ding[]; zelfdeKleur?: boolean; goedZin?: string[]; reactie?: (gekozen: T) => string[]; vraagLabel?: string } = {}): Opgave {
  return (l, terug) => {
    const kl = o.zelfdeKleur ? Array(tijden.length).fill(kleurRij(1)[0]) : kleurRij(tijden.length);
    const keuzes = tijden.map((t, i) => W(t, kl[i]));
    const goed = tijden.findIndex((t) => t.u === doel.u && t.m === doel.m);
    return kiesVraag(
      l,
      {
        boven: o.boven,
        ...(o.vraagLabel ? { vraagLabel: o.vraagLabel } : {}),
        keuzes,
        goed,
        /* Verhaal en vraag samen in beeld, anders staat er een bus of oven naast de klok zonder uitleg (Sara, 1 nov). */
        vraag: o.zin ? [o.zin.join(" ")] : [`Op welke klok is het ${spreek(doel)}?`],
        goedZin: o.goedZin ?? [`Op deze klok is het ${spreek(doel)}.`],
        noem: noemKlok,
        reactie: (i) => (o.reactie ? o.reactie(tijden[i]) : reactieKlokkeuze(tijden[i], doel)),
        samen: (l, k) => samenKlokken(l, doel, k.keuzes, k.boven),
        tip: doel.m === 0 ? [`Zoek de klok waar de kleine wijzer naar de {${doel.u}:oranje} wijst.`] : [`Zoek de klok waar de kleine wijzer tussen de {${doel.u}:oranje} en de {${na(doel)}:oranje} staat.`],
      },
      terug,
    );
  };
}

/** Een wijzerklok (en eventueel een ding) bovenaan: hoe laat is het? Antwoord met knoppen. */
function leesKlok(t: T, opties: T[], o: { ding?: string; zin?: string[]; weetje?: string[]; naspeel?: Naspeel; sfeer?: "hoog" | "laag" | true } = {}): Opgave {
  return (l, terug) => {
    const klok = W(t, kleurRij(1)[0]);
    /* Een ding staat alleen naast de klok als het het verhaal naspeelt; anders is het een zachte sfeer-achtergrond (BOUWREGELS 1.22). */
    const boven = o.ding && !o.sfeer ? [V(o.ding), klok] : [klok];
    const i = boven.length - 1;
    const v = knopVraag(
      l,
      {
        boven,
        opties: opties.map(woord),
        goed: woord(t),
        vraag: o.zin ? [o.zin.join(" ")] : ["Hoe laat is het?"],
        goedZin: [goedLees(l, t), ...(o.weetje ?? [])],
        antwoordZin: wijzerUitleg(t),
        samen: (l, b) => samenLees(l, t, b, i),
        tip: t.m === 0 ? ["Kijk naar het getal waar de punt van de kleine wijzer bij staat."] : ["Noem het getal waar de kleine wijzer naartoe gaat."],
        reactie: (x: string) => reactieLees(x, t),
      },
      terug,
    );
    if (o.ding && o.sfeer) return metSfeer(l, v, { naam: o.ding, ...(o.sfeer === true ? {} : { plek: o.sfeer }) });
    if (o.ding && o.naspeel) return metNaspeel(l, v, o.naspeel);
    return v;
  };
}

/** Goed of fout? Een wijzerklok, Bliepo zegt een tijd; vinkje of kruisje. */
function goedFout(klok: T, gezegd: T): Opgave {
  return (l) => {
    const klopt = klok.u === gezegd.u && klok.m === gezegd.m;
    const boven = [W(klok, kleurRij(1)[0])];
    return kiesVraag(
      l,
      {
        boven,
        keuzes: [VINK, KRUIS],
        goed: klopt ? 0 : 1,
        vraag: ["Kijk naar de klok.", `Het is ${spreek(gezegd)}.`, "Goed of fout?"],
        goedZin: klopt ? [`Het is ${spreek(klok)}.`] : [`Het is geen ${spreek(gezegd)}.`, `Het is ${spreek(klok)}.`],
        noem: (i) => (i === 0 ? "Het vinkje" : "Het kruisje"),
        reactie: (i) =>
          i === 0
            ? [`Met het vinkje zeg je dat de klok ${spreek(gezegd)} laat zien.`, `Kijk naar de kleine wijzer. Die wijst ${plekKleineWijzer(klok)}.`]
            : [`Met het kruisje zeg je dat de klok een andere tijd laat zien dan ${spreek(gezegd)}.`, `Kijk naar de kleine wijzer. Die wijst ${plekKleineWijzer(klok)}.`],
        antwoordZin: klopt ? [`De klok laat ${spreek(klok)} zien.`, "Dat is dezelfde tijd, dus het vinkje."] : [`De klok laat ${spreek(klok)} zien.`, `Dat is niet ${spreek(gezegd)}, dus het kruisje.`],
        samen: async (l, k) => {
          await samenLees(l, klok, k.boven, 0);
          await l.zeg(...(krijgtVervolgvraag(l) ? [] : [`Vergelijk de klok met ${spreek(gezegd)}.`]), "Kies goed als de tijd klopt. Kies fout als de klok een andere tijd laat zien.");
        },
        tip: ["Lees eerst zelf de klok.", `Vergelijk de tijd die je ziet met ${spreek(gezegd)}.`],
      },
      false,
    );
  };
}

/** Een tijd in woorden bovenaan (en een zinnetje): kies de klok die erbij hoort. */
function tijdNaarKlok(doel: T, tijden: T[], zin: string[] | null, zelfdeKleur = false): Opgave {
  return kiesKlok(doel, tijden, {
    boven: [Tx(woord(doel))],
    zin: zin ? [...zin, "Kies de goede klok."] : [`Hier staat ${spreek(doel)}.`, "Welke klok hoort erbij?"],
    zelfdeKleur,
  });
}

/** Hoe lang duurt het? Twee wijzerklokken met een pijl ertussen. */
function hoeLang(van: number, tot: number, opties: string[], zin: string[], wat: string): Opgave {
  return (l, terug) => {
    const kl = kleurRij(2);
    const boven = [W(U(van), kl[0]), W(U(tot), kl[1])];
    return knopVraag(
      l,
      {
        boven,
        pijl: true,
        opties,
        goed: `${tot - van} uur`,
        vraag: zin,
        goedZin: [`Van {${van}:oranje} uur tot {${tot}:oranje} uur is {${tot - van}:oranje} uur.`, `${Hoofd(wat)} zijn klaar.`],
        reactie: (x: string) => {
          const n = parseInt(x, 10);
          if (n === tot) return [`Om {${tot}:oranje} uur zijn ze klaar. Dat is niet hoe lang het duurt.`, `Tel van {${van}:oranje} uur naar {${tot}:oranje} uur.`];
          if (n === van) return [`Om {${van}:oranje} uur beginnen ze. Dat is niet hoe lang het duurt.`, `Tel van {${van}:oranje} uur naar {${tot}:oranje} uur.`];
          if (n === van + tot) return [`Je hebt {${van}:oranje} en {${tot}:oranje} bij elkaar gedaan.`, "Tel hoeveel uren er tussen zitten."];
          return [`Tel van {${van}:oranje} uur verder tot {${tot}:oranje} uur.`, "Elk uur is 1 stapje."];
        },
        samen: async (l) => {
          await wijs(l, ["b0"], `Om {${van}:oranje} uur gaan ${wat} de oven in.`);
          await wijs(l, ["b1"], `Om {${tot}:oranje} uur komen ze eruit.`);
          zet(l, { licht: [] });
          await l.zeg(`Tel van {${van}:oranje} uur verder tot {${tot}:oranje} uur.`);
        },
        tip: [`Tel van {${van}:oranje} uur naar {${tot}:oranje} uur.`],
      },
      terug,
    );
  };
}

/** Een ding met een wijzerklok erop (telefoon, laptop, oven): hoe laat is het? */
function leesInDing(ding: string, t: T, opties: T[], zin: string[], weetje: string[] = []): Opgave {
  return (l, terug) => {
    /* Het klokje op het scherm is klein: ernaast staat dezelfde klok groot, alsof je inzoomt (BOUWREGELS 1.24, 7 november 2026). */
    const boven = [V(ding, t), W(t, kleurRij(1)[0])];
    return knopVraag(
      l,
      {
        boven,
        opties: opties.map(woord),
        goed: woord(t),
        vraag: zin,
        goedZin: [goedLees(l, t), ...weetje],
        antwoordZin: wijzerUitleg(t),
        reactie: (x: string) => reactieLees(x, t),
        samen: async (l) => {
          await wijs(l, ["b1"], "Kijk naar het klokje.", "Kijk eerst naar de grote wijzer.", "Dan naar de kleine wijzer.");
          if (!krijgtVervolgvraag(l)) await l.zeg("Naar welk getal wijst de kleine wijzer?");
        },
        tip: [`Zoek op de ${ding} de kleine wijzer. Kijk naar het getal waar de punt bij staat.`],
      },
      terug,
    );
  };
}

/** Een vraag over de klok zelf: hoeveel wijzers of getallen? Antwoord met knoppen. */
function telOpKlok(t: T, vraag: string[], opties: string[], goed: string, goedZin: string[], uitleg: string[], tip: string, reactie?: (x: string) => string[]): Opgave {
  return (l, terug) => {
    const boven = [W(t, kleurRij(1)[0])];
    return knopVraag(
      l,
      {
        boven,
        opties,
        goed,
        vraag,
        goedZin,
        samen: async (l) => {
          await wijs(l, ["b0"], ...uitleg);
        },
        tip: [tip],
        ...(reactie ? { reactie } : {}),
      },
      terug,
    );
  };
}

/** Zet de klokken op volgorde van vroeg naar laat (de eerste staat er al). */
function sleepVolgorde(vast: T, rest: T[], bak: number[]): Opgave {
  return (l) => {
    const kl = kleurRij(4);
    const tegels = rest.map((t, i) => W(t, kl[i + 1]));
    const vastD = W(vast, kl[0]);
    return sleepVraag(l, {
      sleepSoort: "klok",
      vast: vastD,
      tegels,
      bak,
      vraag: ["Zet de klokken op volgorde.", "Van vroeg naar laat."],
      goedZin: [`${Hoofd(spreek(vast))}, ${rest.map(spreek).join(", ")}.`, "Steeds een half uur later."],
      samen: async (l) => {
        await wijs(l, ["v"], `De eerste klok staat er al. Het is ${spreek(vast)}.`, "Elke volgende klok is een half uur later.", "Een half uur later draait de grote wijzer een half rondje.");
        await l.zeg("Kijk naar de klokken die nog los liggen.", ...(krijgtVervolgvraag(l) ? [] : ["Welke komt een half uur na de eerste?"]));
      },
      tip: ["Zoek steeds de klok die een half uur later is."],
      reactie: (n) => [n === 0 ? "Geen enkele klok staat al goed." : "1 klok staat al goed.", "Na de eerste klok komt steeds de klok die een half uur later is."],
    });
  };
}

function sleepVraag(
  l: Lesgids,
  o: { sleepSoort: "digi" | "klok"; vast?: Ding; tegels: Ding[]; bak: number[]; vraag: string[]; goedZin: string[]; samen: (l: Lesgids) => Promise<void>; tip: string[]; reactie?: (aantalGoed: number) => string[]; antwoordZin?: string[] },
): SqulaVraag<string> {
  /* bak[i] = welk tegeltje (in de goede volgorde) op plek i in de bak ligt */
  const keuzes = o.bak.map((j) => o.tegels[j]);
  const goedVolgorde = o.tegels.map((_, j) => o.bak.indexOf(j));
  const toon = () => zet(l, { ...LEEG, sleutel: nieuw(), modus: "sleep", sleepSoort: o.sleepSoort, keuzes, vast: o.vast ?? null, goedVolgorde });
  let pogingen = 0;
  return {
    toon,
    vraag: o.vraag,
    antwoord: async () => {
      /* na een fout liggen alle klokken weer klaar in de bak */
      if (pogingen++ > 0) toon();
      zet(l, { actief: true });
      const g = await l.wachtOpVlak<{ soort: string; volgorde: number[] }>("sleep");
      zet(l, { actief: false });
      return g.volgorde.join(",");
    },
    isGoed: (x) => x === goedVolgorde.join(","),
    noem: () => "Zo",
    goed: async () => {
      zet(l, { goed: [...goedVolgorde.map((i) => `t${i}`), ...(o.vast ? ["v"] : [])] });
      await l.zeg(...goedZeg(l, o.goedZin));
      await l.wacht(250);
    },
    fout: (x) => {
      const v = x.split(",").map(Number);
      zet(l, { goed: v.filter((t, j) => t === goedVolgorde[j]).map((t) => `t${t}`), fout: v.filter((t, j) => t !== goedVolgorde[j]).map((t) => `t${t}`) });
    },
    samen: async () => {
      toon();
      await o.samen(l);
      zet(l, { licht: [] });
    },
    tip: o.tip,
    reactie: o.reactie ? (x) => o.reactie!(x.split(",").filter((t, j) => Number(t) === goedVolgorde[j]).length) : undefined,
    toonAntwoord: async () => {
      /* de klokken in de goede volgorde, van links naar rechts */
      zet(l, { ...LEEG, sleutel: nieuw(), modus: "kies", keuzes: [...(o.vast ? [o.vast] : []), ...o.tegels] });
      zet(l, { goed: [...(o.vast ? [o.vast] : []), ...o.tegels].map((_, i) => `k${i}`) });
      await l.zeg(...(o.antwoordZin ?? o.goedZin));
      await l.wacht(250);
    },
    testAntwoord: null,
  };
}

/** Memory: zoek de paren. Foute pogingen kosten niets (zoals bij Squla). */
function memory(paren: [Ding, Ding][], vraag: string[], goedZin: string[]): Opgave {
  return (l) => ({
    toon: () => zet(l, { ...LEEG, sleutel: nieuw(), modus: "memory", paren }),
    vraag,
    antwoord: async () => {
      zet(l, { actief: true });
      await l.wachtOpVlak("memory");
      zet(l, { actief: false });
      return "klaar";
    },
    isGoed: () => true,
    noem: () => "",
    goed: async () => {
      await l.zeg(...goedZeg(l, goedZin));
    },
    samen: async () => {},
    tip: [],
    testAntwoord: null,
  });
}

/** Verbinden: wat hoort bij elkaar? Een foute lijn verdwijnt meteen weer. */
function verbind(paren: [Ding, Ding][], _rechts: number[], vraag: string[], goedZin: string[]): Opgave {
  /* de rechterkant komt elke les-start anders te staan, en nooit recht tegenover zijn paar (BOUWREGELS 1.23) */
  return (l, terug) => ({
    toon: () => zet(l, { ...LEEG, sleutel: nieuw(), modus: "verbind", paren, rechts: rechtsDoorElkaar(paren.length, JSON.stringify(paren) + (terug ? "t" : "")) }),
    vraag,
    antwoord: async () => {
      zet(l, { actief: true });
      await l.wachtOpVlak("verbind");
      zet(l, { actief: false });
      return "klaar";
    },
    isGoed: () => true,
    noem: () => "",
    goed: async () => {
      await l.zeg(...goedZeg(l, goedZin));
    },
    samen: async () => {},
    tip: [],
    testAntwoord: null,
  });
}

/** Memory: een wijzerklok en de tijd in woorden horen bij elkaar. */
function memoryKlokTijd(uren: number[]): Opgave {
  return (l, terug) => {
    const kl = kleurRij(uren.length);
    return memory(
      uren.map((u, i) => [W(U(u), kl[i]), Tx(woord(U(u)))] as [Ding, Ding]),
      ["Wat hoort bij elkaar?", "Kijk goed, straks gaan de bolletjes dicht.", "Zoek een klok en de tijd die erbij past."],
      ["Je hebt alle paren gevonden!"],
    )(l, terug);
  };
}

/** Verbinden: links de wijzerklok, rechts de tijd in woorden. */
function verbindKlokTijd(uren: number[], rechts: number[]): Opgave {
  return (l, terug) => {
    const kl = kleurRij(uren.length);
    return verbind(
      uren.map((u, i) => [W(U(u), kl[i]), Tx(woord(U(u)))] as [Ding, Ding]),
      rechts,
      ["Wat hoort bij elkaar?", "Tik op een klok.", "Tik dan op de tijd die erbij hoort."],
      ["Alles is verbonden.", "Je kunt de klok lezen!"],
    )(l, terug);
  };
}

/** Rekenen met tijd: een ding met een klok bovenaan, kies de klok van straks of van net. */
function tijdRekenen(ding: string, nu: T, soort: "uur later" | "half later" | "uur eerder", tijden: T[], context: string, beeld: { naspeel?: Naspeel; sfeer?: boolean } = {}): Opgave {
  /* De bus speelt het verhaal na (BOUWREGELS 1.22): zie `metVerhaal`. */
  const verhaal = ding === "bus" && soort === "uur later";
  const doel: T =
    soort === "uur later" ? { u: na(nu), m: nu.m } : soort === "uur eerder" ? { u: ((nu.u + 10) % 12) + 1, m: nu.m } : nu.m === 30 ? { u: na(nu), m: 0 } : { u: nu.u, m: 30 };
  const vraag = soort === "uur later" ? "Hoe laat is het over een uur?" : soort === "half later" ? "Hoe laat is het over een half uur?" : "Hoe laat was het een uur geleden?";
  return (l, terug) => {
    /* Het ding staat alleen naast de vraagklok als het het verhaal naspeelt (raketje, lampje); anders is het een zachte
       sfeer-achtergrond of weg (BOUWREGELS 1.22). De vraagklok heeft een eigen vak met "nu" erboven (Sara, 7 november 2026). */
    const v = kiesKlok(doel, tijden, {
      boven: verhaal ? [] : beeld.naspeel ? [V(ding), W(nu, kleurRij(1)[0])] : [W(nu, kleurRij(1)[0])],
      ...(verhaal ? {} : { vraagLabel: "nu" }),
      ...(beeld.naspeel ? { naspeel: beeld.naspeel } : {}),
      ...(beeld.sfeer ? { sfeer: { naam: ding } } : {}),
      zin: [context, "Kijk op de klok.", vraag],
      goedZin: [`Nu is het ${spreek(nu)}.`, `${soort === "uur eerder" ? "Een uur geleden was het" : "Straks is het"} ${spreek(doel)}.`],
      reactie: (g) => {
        const d = verschil(g, nu);
        const naam: Record<number, string> = { 0: "de tijd van nu", 30: "een half uur later", 60: "een uur later", 660: "een uur eerder", 690: "een half uur eerder" };
        const wat = naam[d] ? `Die klok is ${naam[d]}.` : `Die klok laat ${spreek(g)} zien.`;
        const hint = soort === "half later" ? "Over een half uur draait de grote wijzer een half rondje." : soort === "uur later" ? "Over een uur is de kleine wijzer 1 getal verder." : "Een uur geleden was de kleine wijzer 1 getal terug.";
        return [wat, hint];
      },
    })(l, terug);
    return verhaal ? metVerhaal(l, v, ding, nu, 60, "1 uur") : v;
  };
}

/**
 * Het plaatje speelt het verhaal na (BOUWREGELS 1.22, oplossing 1). Tijdens de vraag staat alleen het begin in beeld: de bus
 * bij de halte met de klok van nu, een stukje weg met "1 uur" en bij school een klokje met een vraagteken (verklapt niets).
 * Pas NA het antwoord (goed = bevestiging, tweede fout = uitleg) rijdt de bus naar school en draaien de wijzers van de klok
 * bij school een uur verder. Het kiezen van het antwoord wordt nooit geblokkeerd; het naspelen breekt zelf af na 6 seconden.
 */
function metVerhaal(l: Lesgids, v: SqulaVraag<string>, ding: string, nu: T, min: number, label: string): SqulaVraag<string> {
  let speel = 0;
  const basis = { naam: ding, nu: { u: nu.u, m: nu.m }, min, label };
  const speelAf = async () => {
    let tijd: ReturnType<typeof setTimeout> | undefined;
    const stop = new Promise<void>((klaar) => (tijd = setTimeout(klaar, 6000)));
    const klaar = Promise.race([l.wachtOpVlak("reis"), stop]);
    speel++;
    zet(l, { reis: { ...basis, speel } });
    try {
      await klaar;
    } finally {
      clearTimeout(tijd);
    }
  };
  return {
    ...v,
    toon: () => {
      v.toon?.();
      zet(l, { reis: { ...basis, speel: 0 } });
    },
    goed: async (x) => {
      await Promise.all([v.goed(x), speelAf()]);
    },
    samen: async () => {
      zet(l, { fout: [], goed: [] });
      const af = speelAf();
      await l.zeg("Kijk eerst naar de klok bij de halte.");
      await af;
      await l.zeg("Over een uur draait de grote wijzer een heel rondje.", "Dan staat hij weer op dezelfde plek.", "De kleine wijzer schuift 1 getal verder.");
      zet(l, { licht: [] });
      if (!krijgtVervolgvraag(l)) await l.zeg("Zoek die klok.");
    },
    tip: ["Over een uur is de kleine wijzer 1 getal verder."],
  };
}

/**
 * Een ding bovenaan speelt het verhaal na (BOUWREGELS 1.22, 7 november 2026): tijdens de vraag staat het stil (de
 * beginsituatie), pas NA het antwoord beweegt het (goed = bevestiging, tweede fout = bij het laten zien van het antwoord).
 * Het kiezen wordt nooit geblokkeerd; het naspelen breekt zelf af na 4 seconden.
 */
let naspeelNr = 0;
function metNaspeel(l: Lesgids, v: SqulaVraag<string>, soort: Naspeel): SqulaVraag<string> {
  const speelAf = async () => {
    let tijd: ReturnType<typeof setTimeout> | undefined;
    const stop = new Promise<void>((klaar) => (tijd = setTimeout(klaar, 4000)));
    const klaar = Promise.race([l.wachtOpVlak("naspeel"), stop]);
    zet(l, { naspeel: { soort, speel: ++naspeelNr } });
    try {
      await klaar;
    } finally {
      clearTimeout(tijd);
    }
  };
  return {
    ...v,
    toon: () => {
      v.toon?.();
      zet(l, { naspeel: { soort, speel: 0 } });
    },
    goed: async (x) => {
      await Promise.all([v.goed(x), speelAf()]);
    },
    ...(v.toonAntwoord
      ? {
          toonAntwoord: async () => {
            await Promise.all([v.toonAntwoord!(), speelAf()]);
          },
        }
      : {}),
  };
}

/** Een ding als kleine, zachte sfeer-achtergrond achter de vraag (BOUWREGELS 1.22, oplossing 2). */
function metSfeer(l: Lesgids, v: SqulaVraag<string>, sfeer: { naam: string; plek?: "hoog" | "laag" }): SqulaVraag<string> {
  return {
    ...v,
    toon: () => {
      v.toon?.();
      zet(l, { sfeer });
    },
  };
}

/** Rekenen met tijd: de uitleg (vervangt de samen-uitleg van kiesKlok). */
function metRekenUitleg(op: Opgave, nu: T, soort: "uur later" | "half later" | "uur eerder", klokId = "b1"): Opgave {
  return (l, terug) => {
    const v = op(l, terug);
    return {
      ...v,
      samen: async () => {
        zet(l, { fout: [], goed: [] });
        await wijs(l, [klokId], "Kijk eerst naar de klok bovenaan.");
        if (soort === "uur later") await l.zeg("Over een uur draait de grote wijzer een heel rondje.", "Dan staat hij weer op dezelfde plek.", "De kleine wijzer schuift 1 getal verder.");
        else if (soort === "half later") await l.zeg("Over een half uur draait de grote wijzer een half rondje.", nu.m === 0 ? "Van de {12:paars} naar de {6:paars}." : "Van de {6:paars} naar de {12:paars}.", "De kleine wijzer schuift een klein stukje verder.");
        else await l.zeg("Een uur geleden stond de grote wijzer op dezelfde plek.", "De kleine wijzer stond 1 getal terug.");
        zet(l, { licht: [] });
        if (!krijgtVervolgvraag(l)) await l.zeg("Zoek die klok.");
      },
      tip: soort === "half later" ? ["Over een half uur draait de grote wijzer een half rondje."] : soort === "uur later" ? ["Over een uur is de kleine wijzer 1 getal verder."] : ["Een uur geleden was de kleine wijzer 1 getal terug."],
    };
  };
}

/** Op welke klok is het later? (2 klokken) */
function later(a: T, b: T): Opgave {
  const minA = (a.u % 12) * 60 + a.m;
  const minB = (b.u % 12) * 60 + b.m;
  const laat = minA > minB ? a : b;
  const vroeg = minA > minB ? b : a;
  return (l, terug) => {
    const v = kiesKlok(laat, [a, b], { reactie: (g) => [`${Hoofd(spreek(g))} is eerder dan ${spreek(g === a || (g.u === a.u && g.m === a.m) ? b : a)}.`, "Later betekent: verder op de dag."], zin: ["Op welke klok is het later?"], goedZin: [`${Hoofd(spreek(laat))} is later dan ${spreek(vroeg)}.`] })(l, terug);
    return {
      ...v,
      samen: async () => {
        zet(l, { fout: [], goed: [] });
        await wijs(l, ["k0", "k1"], "Lees eerst allebei de klokken.");
        /* een rijtje halve uren, van een uur vóór de vroegste tot een uur na de laatste */
        const begin = ((vroeg.u % 12) * 60 + vroeg.m - 60 + 720) % 720;
        const eind = (laat.u % 12) * 60 + laat.m + 60;
        const rij: string[] = [];
        for (let m = begin; m <= (eind < begin ? eind + 720 : eind); m += 30) {
          const mm = m % 720;
          const t: T = { u: Math.floor(mm / 60) || 12, m: mm % 60 };
          rij.push(spreek(t));
        }
        await l.zeg("Tel steeds een half uur verder.", `${Hoofd(rij.join(", "))}.`);
      },
      tip: ["Later betekent: verder op de dag."],
    };
  };
}

/* =====================================================================
   de les zelf
   ===================================================================== */

/** Verhaal en vraag samen in beeld (BOUWREGELS 14.25): anders valt het verhaal weg en blijft alleen het ding over. */
function alsEenBlok<V extends { vraag: string[] }>(v: V): V {
  return v.vraag.length > 1 ? { ...v, vraag: [v.vraag.join(" ")] } : v;
}

async function speelAlles(l: Lesgids, opgaven: Opgave[], reserve: number[], voorbeeldAfgerond = false, synthesisHulp = false): Promise<number> {
  let fouten = 0;
  const mis: number[] = [];
  for (let i = voorbeeldAfgerond ? 1 : 0; i < opgaven.length; i++) {
    if (!(await squlaVraag(l, { ...alsEenBlok(opgaven[i](l, false)), synthesis: synthesisHulp }))) {
      fouten++;
      mis.push(i);
    }
  }
  const nodig = Math.max(0, 15 - opgaven.length);
  const terug = [...mis.slice(0, 3), ...reserve.filter((i) => !mis.includes(i))].slice(0, Math.max(nodig, Math.min(3, mis.length)));
  if (terug.length) {
    await l.zeg(terugAankondiging(terug.length));
    let weerFout = 0;
    for (const i of terug) {
      if (!(await squlaVraag(l, { ...alsEenBlok(opgaven[i](l, true)), synthesis: synthesisHulp }))) {
        fouten++;
        weerFout++;
      }
    }
    if (weerFout) await l.zeg(terugAfsluiting());
  }
  return fouten;
}

type Klokles = {
  id: string;
  titel: string;
  oefening: string;
  level: number;
  /** Extra uitleg in de beheernaam (bijv. dat level 2 bij Squla een filmpje is). */
  noot?: string;
  voorwerpen: string[];
  start: Ding;
  welkom: string[];
  /** Zin 2 van het beginscherm (BOUWREGELS 4.4). */
  vraag?: string;
  /**
   * Het beginscherm (BOUWREGELS 4.1): welke opgave als voorbeeld in beeld staat bij
   * "Kun je dit al?" (index in `opgaven`). Zonder: alleen `start`.
   */
  voorbeeld?: number;
  uitleg: (l: Lesgids) => Promise<void>;
  /** Een verhaalzin na het welkom (zoals Squla's verhaalscherm). */
  verhaal?: string[];
  opgaven: Opgave[];
  reserve: number[];
  eind: string;
  eindZin?: string[];
};

function klokles(k: Klokles): Lesdraaiboek {
  return {
    id: k.id,
    titel: k.titel,
    synthesis: `Squla groep 3 · Klokkijken · ${k.oefening} · level ${k.level}${k.noot ? ` (${k.noot})` : ""} (alleen leerdoel)`,
    indeling: "synthesis",
    browserstem: true,
    nacht: true,
    voorwerpen: k.voorwerpen,
    kaarttekening: KaartKlok,
    async speel(l) {
      kleurTeller = 0;
      /* elke les-start een nieuwe volgorde van de keuzes (BOUWREGELS 1.23) */
      lesZaad = (Math.random() * 2 ** 31) | 0;
      zetSynthesisHulp(l);
      l.vlak<KlokVlakProps>(SqulaKlokVlak, { ...LEEG, sleutel: nieuw(), boven: [k.start] });
      speelLesgeluid("verschijn");
      const voorbeeldAfgerond = await squlaBegin(l, {
        welkom: k.welkom,
        ...(k.vraag ? { vraag: k.vraag } : {}),
        uitleg: () => k.uitleg(l),
        voordoen: true,
        samen: () => k.id === "squla-klok-hoelaat-1" ? k.uitleg(l) : squlaVraag(l, k.opgaven[k.voorbeeld ?? 0](l, false)),
        ...(k.voorbeeld !== undefined
          ? {
              voorbeeld: () => {
                k.opgaven[k.voorbeeld!](l, false).toon?.();
                /* De eerste vraag krijgt dezelfde kleur als het voorbeeld. */
                kleurTeller = 0;
              },
            }
          : {}),
      });
      if (k.verhaal) await l.zeg(...k.verhaal);
      const fouten = await speelAlles(l, k.opgaven, k.reserve, voorbeeldAfgerond && k.id !== "squla-klok-hoelaat-1" && (k.voorbeeld ?? 0) === 0, true);
      if (k.eindZin) await l.zeg(...k.eindZin);
      await squlaEind(l, fouten, k.eind);
    },
  };
}

/* --- de korte uitleg bij "Kun je dit al? Nee" --- */

const HEEL_OPEN = [
  "We bekijken de wijzers één voor één. De grote wijzer staat op de {12:paars}. Dan is het een heel uur.",
  "Eerst de grote wijzer: die staat op de {12:paars}. Dat betekent een heel uur.",
  "Kijk naar de grote wijzer. Hij staat bovenaan, op de {12:paars}. Zo laat de klok een heel uur zien.",
  "De grote wijzer wijst naar de {12:paars}. Dus de klok laat een heel uur zien.",
  "We beginnen bij de grote wijzer. Hij staat op de {12:paars}, dus het is een heel uur.",
  "Bovenaan, bij de {12:paars}, staat de grote wijzer. Dan hoort er een heel uur bij.",
  "Kijk waar de grote wijzer staat: op de {12:paars}. Dat is een heel uur.",
  "Zie je de grote wijzer? Hij wijst naar de {12:paars}. Dan is het een heel uur.",
];
const HEEL_KLEIN = [
  "De kleine wijzer vertelt welk uur het is.",
  "Nu de kleine wijzer: die wijst het uur aan.",
  "Daarna kijken we naar de kleine wijzer. Hij zegt welk uur het is.",
  "De kleine wijzer laat zien welk uur het is.",
  "Het uur lees je af bij de kleine wijzer.",
  "Welk uur het is, vertelt de kleine wijzer.",
  "Het uur staat bij de punt van de kleine wijzer.",
  "Kijk nu waar de kleine wijzer heen wijst. Dat is het uur.",
];

async function uitlegHeel(l: Lesgids, v = 0) {
  const t = U(3);
  zet(l, { ...LEEG, sleutel: nieuw(), boven: [W(t, "blauw", "min")] });
  if (isBegeleideUitleg(l)) {
    await l.zeg(HEEL_OPEN[v]!);
    zet(l, { boven: [W(t, "blauw", "uur")] });
    await l.zeg(HEEL_KLEIN[v]!);
    await uitlegKeuze(l, {
      vraag: "Naar welk getal wijst de kleine wijzer?", keuzes: ["12", "3", "6"], antwoord: "3",
      hint: "Volg de kleine wijzer vanaf het midden tot aan de punt.",
      goed: "Ja, de kleine wijzer wijst naar de {3:oranje}.",
      laatZien: "De punt van de kleine wijzer staat bij de {3:oranje}.",
      reactie: (x) => [x === "12" ? "De grote wijzer staat op de {12:paars}. We kijken nu naar de kleine wijzer." : "Er wijst geen wijzer naar de {6:oranje}.", "Volg de kleine wijzer vanaf het midden tot aan de punt."],
    });
    zet(l, { boven: [W(t, "blauw")] });
    await uitlegKeuze(l, {
      vraag: "Hoe laat is het dus?", keuzes: ["12 uur", "6 uur", "3 uur"], antwoord: "3 uur",
      hint: "De grote wijzer staat op de {12:paars}. De kleine wijzer wijst het uur aan.",
      goed: "Dat klopt: {3:oranje} uur. De kleine wijzer wijst naar de {3:oranje} en de grote wijzer staat op de {12:paars}.",
      laatZien: "Het is {3:oranje} uur. De kleine wijzer wijst naar de {3:oranje} en de grote wijzer staat op de {12:paars}.",
      reactie: (x) => [x === "12 uur" ? "De grote wijzer staat op de {12:paars}, maar de kleine wijzer vertelt het uur." : "Er wijst geen wijzer naar de {6:oranje}.", "De kleine wijzer vertelt het uur."],
    });
    return;
  }
  await wijs(l, ["b0"], "Dit is een wijzerklok.", "De lange wijzer is de grote wijzer.", "Bij een heel uur staat hij op de {12:paars}.");
  zet(l, { boven: [W(t, "blauw", "uur")] });
  await l.zeg("De korte wijzer is de kleine wijzer.", "Die wijst het uur aan.", "Hier wijst hij naar de {3:oranje}.", "Het is dus {3:oranje} uur.");
  zet(l, { boven: [W(t, "blauw")], licht: [] });
}

async function uitlegHalf(l: Lesgids) {
  const t = H(5);
  zet(l, { ...LEEG, sleutel: nieuw(), boven: [W(t, "oranje", "min")] });
  await wijs(l, ["b0"], "Kijk naar de grote wijzer.", "Bij half staat hij op de {6:paars}.");
  zet(l, { boven: [W(t, "oranje", "uur")] });
  await l.zeg("De kleine wijzer staat tussen de {4:oranje} en de {5:oranje}.", "Hij is al halverwege naar de {5:oranje}.", "Daarom heet het half {5:oranje}.");
  zet(l, { boven: [W(t, "oranje")], licht: [] });
}

async function uitlegRekenen(l: Lesgids) {
  zet(l, { ...LEEG, sleutel: nieuw(), boven: [W(U(2), "groen")] });
  await wijs(l, ["b0"], "Nu is het {2:oranje} uur.");
  zet(l, { boven: [W(U(3), "groen", "uur")] });
  await l.zeg("Een uur later is de kleine wijzer 1 getal verder.", "Dan is het {3:oranje} uur.");
  zet(l, { boven: [W(H(4), "groen", "min")] });
  await l.zeg("Nog een half uur later draait de grote wijzer een half rondje.", "Dan is het half {4:oranje}.");
  zet(l, { boven: [W(H(4), "groen")], licht: [] });
}

/* =====================================================================
   De klok (16839, eerst "De digitale klok") — nu met de wijzerklok:
   dezelfde soorten vragen, maar over de klok met wijzers
   ===================================================================== */

const digitaal1 = klokles({
  id: "squla-klok-digitaal-1",
  titel: "De klok en de tijd",
  oefening: "De digitale klok",
  level: 1,
  voorwerpen: ["oven", "zandloper", "telefoon", "laptop", "lampje"],
  start: W(U(12), "groen"),
  welkom: ["Een klok heeft 2 wijzers en getallen.", "Waar zie je nog meer zo'n klok?"],
  voorbeeld: 0,
  uitleg: (l) => uitlegHeel(l, 1),
  opgaven: [
    (l, terug) =>
      kiesVraag(
        l,
        {
          boven: [W(U(6), "roze")],
          keuzes: [V("zandloper"), V("telefoon", U(5)), V("lampje")],
          goed: 1,
          vraag: ["Kijk eens. Dit is een klok met wijzers.", "Waar zie je ook zo'n klok?"],
          goedZin: ["Op de telefoon staat ook een klok.", "Je ziet een rondje met 2 wijzers."],
          noem: (i) => ["De zandloper", "De telefoon", "Het lampje"][i],
          reactie: (i) => [i === 0 ? "Je koos de zandloper. Die laat zien hoe lang iets duurt, maar hij heeft geen wijzers." : "Je koos het lampje. Een lampje heeft geen wijzers en geen getallen.", "Zoek het rondje met 2 wijzers."],
          samen: async (l, k) => {
            await l.zeg("Een klok met wijzers is rond.", "Er staan getallen op, en er zijn 2 wijzers.");
            for (let i = 0; i < 3; i++) {
              const d = k.keuzes[i];
              const zin = d.t === "vw" && d.naam === "telefoon" ? "Kijk naar de telefoon. Wat zie je op het scherm?" : d.t === "vw" && d.naam === "zandloper" ? "In de zandloper zit zand." : "Dit is een lampje.";
              await wijs(l, [`k${i}`], zin);
            }
            zet(l, { licht: [] });
            if (!krijgtVervolgvraag(l)) await l.zeg("Waar zie je een rondje met 2 wijzers?");
          },
          tip: ["Kijk of je een rondje met 2 wijzers ziet."],
        },
        terug,
      ),
    telOpKlok(U(6), ["Hoeveel wijzers heeft deze klok?"], ["2", "12", "6"], "2", ["Een klok heeft 2 wijzers.", "Een grote wijzer en een kleine wijzer."], ["We tellen de wijzers.", "Een lange wijzer en een korte wijzer."], "Tel de lange en de korte wijzer.", (x) => [`De {${x}:oranje} is een getal op de klok. Dat is geen wijzer.`, "Tel alleen de lange en de korte wijzer."]),
    (l, terug) =>
      kiesVraag(
        l,
        {
          boven: [W(U(3), "blauw")],
          keuzes: [Tk("1"), Tk("3"), Tk("9")],
          goed: 1,
          vraag: ["Kijk naar de kleine wijzer.", "Naar welk getal wijst hij?"],
          goedZin: ["Ja, de korte wijzer staat bij de {3:oranje}.", "Zo weet je dat het {3:oranje} uur is."],
          noem: (i) => ["{1:oranje}", "{3:oranje}", "{9:oranje}"][i],
          reactie: (i) => [`Naar de {${i === 0 ? 1 : 9}:oranje} wijst geen wijzer.`, "Zoek de korte wijzer en kijk waar die naartoe wijst."],
          samen: async (l) => {
            await wijs(l, ["b0"], "De kleine wijzer is de korte wijzer.", "Hij wijst het uur aan.");
          },
          tip: ["Zoek de korte wijzer."],
        },
        terug,
      ),
    leesInDing("laptop", U(4), [U(4), U(12), U(6)], ["Op een laptop staat ook een klok.", "Hoe laat is het?"], ["Op een laptop kun je ook de tijd zien."]),
    leesKlok(U(6), [U(6), U(5), U(12)], { zin: ["Hoe laat is het?"] }),
    tijdNaarKlok(U(5), [U(6), U(5), U(12)], null),
    tijdNaarKlok(U(12), [U(11), U(10), U(12)], null),
    verbindKlokTijd([2, 10, 7], [2, 0, 1]),
    telOpKlok(U(10), ["Hoeveel getallen staan er op de klok?"], ["12", "10", "2"], "12", ["Er staan {12} getallen op de klok.", "Van {1} tot en met {12}."], ["We tellen de getallen op de klok.", "Het eerste getal is de {1}.", "Het laatste getal is de {12}."], "Het laatste getal is de {12}.", (x) => (x === "10" ? ["De kleine wijzer wijst naar de {10:oranje}, maar dat vertelt de tijd.", "Tel alle getallen rond de klok, van de {1:oranje} tot de {12:oranje}."] : ["Er zijn {2:oranje} wijzers, maar we tellen de getallen.", "Tel alle getallen rond de klok, van de {1:oranje} tot de {12:oranje}."])),
    leesKlok(U(9), [U(9), U(3), U(6)]),
    tijdNaarKlok(U(1), [U(1), U(11), U(12)], null),
    leesInDing("telefoon", U(8), [U(8), U(4), U(10)], ["Op een telefoon staat ook een klok.", "Hoe laat is het?"], ["Ook op een telefoon staat de tijd."]),
  ],
  reserve: [1, 3, 6],
  eind: "Je kunt de klok lezen.",
});

/* --- level 2: een dag bij de bakkerij (in plaats van een bakker: de bakkerij zelf, de oven en de bezorgbus) --- */

const digitaal2 = klokles({
  id: "squla-klok-digitaal-2",
  titel: "De klok en de tijd (moeilijker)",
  oefening: "De digitale klok",
  level: 2,
  voorwerpen: ["bakkerij", "maan", "deegkom", "oven", "bezorgbus", "taart"],
  start: V("bakkerij"),
  welkom: ["De bakkerij gaat op een vaste tijd open.", "Op welke klok is het zover?"],
  voorbeeld: 0,
  uitleg: (l) => uitlegHeel(l, 2),
  opgaven: [
    kiesKlok(U(9), [U(3), U(9), U(6)], { sfeer: { naam: "bakkerij" }, zin: ["Dit is de bakkerij.", "De winkel gaat om {9:oranje} uur open.", "Op welke klok is het {9:oranje} uur?"], goedZin: ["Om {9:oranje} uur gaat de winkel open.", "Op deze klok wijst de kleine wijzer naar de {9:oranje}."] }),
    kiesKlok(U(4), [U(6), U(4), U(9)], { sfeer: { naam: "maan" }, zin: ["Het is nog nacht. De maan schijnt.", "Om {4:oranje} uur gaat de oven van de bakkerij al aan.", "Op welke klok is het {4:oranje} uur?"], goedZin: ["Dat is vroeg!", "Om {4:oranje} uur is het buiten nog donker."] }),
    (l, terug) =>
      metNaspeel(l, knopVraag(
        l,
        {
          boven: [V("deegkom"), W(U(5), kleurRij(1)[0])],
          opties: ["5 uur", "5 broodjes", "6 uur"],
          goed: "5 uur",
          reactie: (x) => (x === "5 broodjes" ? ["Op de klok staat een tijd, geen aantal.", "Zoek de kleine wijzer."] : reactieLees(x, U(5))),
          vraag: ["Het deeg voor de broodjes is klaar.", "Kijk op de klok.", "Hoe laat is het?"],
          goedZin: ["Om {5:oranje} uur is het deeg klaar.", "Nu mag het even rusten."],
          samen: async (l, b) => {
            await l.zeg("Je telt hier geen broodjes.", "Je leest af hoe laat het is.");
            await samenLees(l, U(5), b, b.length - 1);
          },
          tip: ["Zoek een tijd, geen aantal broodjes."],
        },
        terug,
      ), "rijzen"),
    hoeLang(6, 7, ["1 uur", "7 uur", "2 uur"], ["De broodjes gaan om {6:oranje} uur de oven in.", "Om {7:oranje} uur zijn ze klaar.", "Hoe lang staan de broodjes in de oven?"], "de broodjes"),
    kiesKlok(U(8), [U(8), U(10), U(3)], { boven: [V("bezorgbus")], naspeel: "rijden", zin: ["De bezorgbus staat al voor de deur.", "Hij komt broodjes halen.", "Maar de winkel is nog dicht. Het is pas {8:oranje} uur.", "Op welke klok is het {8:oranje} uur?"], goedZin: ["De bus is vroeg: het is pas {8:oranje} uur.", "De winkel gaat pas om {9:oranje} uur open."] }),
    kiesKlok(U(10), [U(1), U(10), U(2)], { boven: [V("oven")], naspeel: "uitDeOven", zin: ["De taarten staan nog in de oven.", "Ze zijn om {10:oranje} uur klaar.", "Op welke klok is het {10:oranje} uur?"], goedZin: ["Om {10:oranje} uur zijn de taarten klaar.", "Dat ruikt lekker!"] }),
    memoryKlokTijd([3, 12, 5]),
    (l, terug) =>
      metNaspeel(l, knopVraag(
        l,
        {
          boven: [V("taart"), W(U(11), kleurRij(1)[0])],
          opties: ["11 uur", "1 uur", "12 uur"],
          goed: "11 uur",
          reactie: (x) => reactieLees(x, U(11)),
          vraag: ["De taarten zijn heel lekker.", "Ze zijn snel op.", "Kijk op de klok. Hoe laat zijn de taarten op?"],
          goedZin: ["Om {11:oranje} uur zijn de taarten op.", "Dan staat de kleine wijzer bij de {11:oranje}."],
          samen: async (l, b) => samenLees(l, U(11), b, b.length - 1),
          tip: ["Kijk naar de kleine wijzer."],
        },
        terug,
      ), "op"),
    kiesKlok(U(12), [U(1), U(12), U(6)], { boven: [V("bezorgbus")], naspeel: "wegrijden", zin: ["De bezorgbus komt terug.", "Nu zijn de broodjes wel klaar.", "Hij komt om {12:oranje} uur.", "Op welke klok is het {12:oranje} uur?"], goedZin: ["Om {12:oranje} uur haalt de bus de broodjes op.", "De bus rijdt weg met de broodjes."] }),
    kiesKlok(U(6), [U(12), U(6), U(5)], { zin: ["De bakkerij is dicht.", "We oefenen nog even.", "Op welke klok is het {6:oranje} uur?"] }),
    (l, terug) =>
      knopVraag(
        l,
        {
          boven: [W(U(8), kleurRij(1)[0])],
          opties: ["8 uur", "8 taarten", "9 uur"],
          goed: "8 uur",
          reactie: (x) => (x === "8 taarten" ? ["Op de klok lees je de tijd af. Taarten tel je er niet mee.", "Een taart tel je, maar de klok lees je. Zoek de kleine wijzer."] : reactieLees(x, U(8))),
          vraag: ["Kijk op de klok.", "Hoe laat is het?"],
          goedZin: ["De kleine wijzer staat op de {8:oranje}, dus {8:oranje} uur."],
          samen: async (l, b) => samenLees(l, U(8), b, 0),
          tip: ["Zoek een tijd, geen aantal taarten."],
        },
        terug,
      ),
    hoeLang(1, 2, ["2 uur", "1 uur", "3 uur"], ["De koekjes gaan om {1:oranje} uur de oven in.", "Om {2:oranje} uur zijn ze klaar.", "Hoe lang staan de koekjes in de oven?"], "de koekjes"),
  ],
  reserve: [2, 5, 3],
  eind: "Je kunt de klok lezen in een verhaal.",
});

/* =====================================================================
   Hoe laat is het? (15822) — een plantje in de kas (in plaats van de egelopvang)
   ===================================================================== */

/*
  Hoe laat is het? Het verhaal van Squla (een opvang waar op vaste tijden iets
  gebeurt, en bij elke gebeurtenis lees je de klok) is zonder dieren en mensen
  steeds een dag van de bezorgbus: op vaste tijden gebeurt er iets, en het kind
  leest de klok af. Zon en maan laten zien of het dag of avond is.
*/

const hoelaat1 = klokles({
  id: "squla-klok-hoelaat-1",
  titel: "Hoe laat is het?",
  oefening: "Hoe laat is het?",
  level: 1,
  voorwerpen: ["bezorgbus", "zon", "maan", "bakkerij"],
  start: V("bezorgbus"),
  welkom: ["Op de klok lees je de hele uren af en kies je hoe laat het is."],
  vraag: "Kun jij dit al?",
  voorbeeld: 0,
  uitleg: (l) => uitlegHeel(l, 0),
  opgaven: [
    leesKlok(U(7), [U(7), U(11), U(6)], { ding: "bezorgbus", naspeel: "laden", zin: ["De bezorgbus staat klaar bij de bakkerij.", "Hoe laat is het?"], weetje: ["Vroeg in de ochtend begint de dag."] }),
    leesKlok(U(8), [U(8), U(9), U(1)], { ding: "bezorgbus", naspeel: "wegrijden", zin: ["De bezorgbus vertrekt.", "Hoe laat is het?"] }),
    leesKlok(U(9), [U(9), U(3), U(10)], { ding: "zon", sfeer: true, zin: ["De zon schijnt. De bus rijdt naar de eerste halte.", "Hoe laat is het?"], weetje: ["De zon schijnt overdag."] }),
    leesKlok(U(10), [U(10), U(2), U(11)], { ding: "bezorgbus", naspeel: "rijden", zin: ["De bus komt bij de eerste halte.", "Hoe laat is het?"] }),
    leesKlok(U(11), [U(11), U(9), U(12)], { ding: "bakkerij", sfeer: true, zin: ["De bus haalt nieuwe broodjes bij de bakkerij.", "Hoe laat is het?"] }),
    leesKlok(U(12), [U(12), U(1), U(6)], { ding: "zon", sfeer: "hoog", zin: ["De zon staat hoog. De bus brengt de broodjes weg.", "Hoe laat is het?"] }),
    leesKlok(U(1), [U(1), U(7), U(12)], { ding: "bezorgbus", naspeel: "laden", zin: ["De bus staat weer bij de bakkerij.", "Hoe laat is het?"] }),
    leesKlok(U(2), [U(2), U(10), U(1)], { ding: "bezorgbus", naspeel: "wegrijden", zin: ["De bus rijdt weer weg.", "Hoe laat is het?"] }),
    leesKlok(U(3), [U(3), U(9), U(4)], { ding: "bezorgbus", naspeel: "rijden", zin: ["De bus komt bij de tweede halte.", "Hoe laat is het?"] }),
    leesKlok(U(4), [U(4), U(2), U(5)], { ding: "zon", sfeer: "laag", zin: ["De zon staat al lager. De bus rijdt naar huis.", "Hoe laat is het?"] }),
    leesKlok(U(5), [U(5), U(4), U(11)], { ding: "bakkerij", sfeer: true, zin: ["De bus is terug bij de bakkerij.", "Hoe laat is het?"] }),
    leesKlok(U(6), [U(6), U(5), U(12)], { ding: "maan", sfeer: true, zin: ["Het wordt donker. De maan komt op.", "Hoe laat is het?"], weetje: ["De maan zie je als het donker wordt."] }),
  ],
  reserve: [0, 2, 6],
  eind: "Je kunt hele uren lezen op de klok.",
});

const hoelaat2 = klokles({
  id: "squla-klok-hoelaat-2",
  titel: "Hoe laat is het? (moeilijker)",
  oefening: "Hoe laat is het?",
  level: 2,
  voorwerpen: ["oven", "bezorgbus", "zon", "bakkerij", "taart"],
  start: V("bakkerij"),
  welkom: ["In de bakkerij gaat de oven vroeg aan.", "Hoe laat is het op de klok?"],
  voorbeeld: 0,
  uitleg: (l) => uitlegHeel(l, 3),
  opgaven: [
    leesKlok(U(6), [U(6), U(7), U(9)], { ding: "oven", naspeel: "aan", zin: ["De oven in de bakkerij gaat aan.", "Hoe laat is het?"] }),
    leesKlok(U(8), [U(8), U(6), U(9)], { ding: "bezorgbus", naspeel: "laden", zin: ["De bezorgbus laadt de broodjes in.", "Hoe laat is het?"] }),
    leesKlok(U(9), [U(9), U(10), U(12)], { ding: "bezorgbus", naspeel: "wegrijden", zin: ["De bus vertrekt voor de eerste ronde.", "Hoe laat is het?"] }),
    tijdNaarKlok(U(10), [U(10), U(4), U(2)], ["De bus komt om {10:oranje} uur bij de eerste halte."]),
    leesKlok(U(11), [U(11), U(10), U(1)], { ding: "zon", sfeer: "hoog", zin: ["De zon schijnt fel. De bus rijdt verder.", "Hoe laat is het?"] }),
    tijdNaarKlok(U(12), [U(12), U(6), U(11)], ["De bus is om {12:oranje} uur terug bij de bakkerij."]),
    leesKlok(U(1), [U(1), U(11), U(2)], { ding: "oven", naspeel: "uitDeOven", zin: ["De taarten komen uit de oven.", "Hoe laat is het?"] }),
    tijdNaarKlok(U(2), [U(2), U(8), U(12)], ["De bus vertrekt om {2:oranje} uur voor de tweede ronde."]),
    leesKlok(U(3), [U(3), U(9), U(4)], { ding: "bezorgbus", naspeel: "rijden", zin: ["De bus komt bij de laatste halte.", "Hoe laat is het?"] }),
    tijdNaarKlok(U(4), [U(4), U(10), U(2)], ["De bus rijdt om {4:oranje} uur naar huis."]),
    leesKlok(U(5), [U(5), U(7), U(10)], { ding: "zon", sfeer: "laag", zin: ["De zon gaat bijna onder.", "Hoe laat is het?"] }),
    tijdNaarKlok(U(7), [U(7), U(1), U(5)], ["'s Avonds om {7:oranje} uur gaat de oven uit."]),
  ],
  reserve: [4, 1, 7],
  eind: "Je kunt de klok lezen, ook als de tijden dicht bij elkaar liggen.",
});

const hoelaat3 = klokles({
  id: "squla-klok-hoelaat-3",
  titel: "Hoe laat is het? (nog moeilijker)",
  oefening: "Hoe laat is het?",
  level: 3,
  voorwerpen: ["bezorgbus", "zon", "maan", "bakkerij", "oven"],
  start: V("bezorgbus"),
  welkom: ["De bezorgbus rijdt de laatste ronde van de dag.", "Lees de klok: hoe laat is het nu?"],
  voorbeeld: 0,
  uitleg: (l) => uitlegHeel(l, 4),
  opgaven: [
    leesKlok(U(10), [U(9), U(10), U(11)], { ding: "bezorgbus", naspeel: "wegrijden", zin: ["De bus vertrekt voor de laatste ronde.", "Hoe laat is het?"] }),
    leesKlok(U(11), [U(11), U(12), U(10)], { ding: "zon", sfeer: "hoog", zin: ["De zon staat bijna op de hoogste plek.", "Hoe laat is het?"] }),
    leesKlok(U(12), [U(12), U(1), U(11)], { ding: "bezorgbus", naspeel: "rijden", zin: ["De bus rijdt langs de eerste halte.", "Hoe laat is het?"] }),
    leesKlok(U(2), [U(1), U(2), U(3)], { ding: "zon", sfeer: true, zin: ["De zon schijnt. De bus rijdt verder.", "Hoe laat is het?"] }),
    (l, terug) =>
      kiesVraag(
        l,
        {
          keuzes: [V("maan"), V("zon")],
          goed: 1,
          vraag: ["De bus rijdt overdag.", "Op welk plaatje is het dag?"],
          goedZin: ["Overdag schijnt de zon."],
          noem: (i) => ["De maan", "De zon"][i],
          reactie: () => ["De maan zie je 's avonds en 's nachts.", "Overdag is het licht buiten."],
          samen: async (l) => {
            await l.zeg("De maan zie je meestal 's avonds en 's nachts.", "De zon zie je overdag.");
          },
          tip: ["Kijk hoe de lucht er overdag uitziet."],
        },
        terug,
      ),
    leesKlok(U(3), [U(3), U(9), U(12)], { ding: "bezorgbus", naspeel: "rijden", zin: ["De bus komt bij de laatste halte.", "Hoe laat is het?"] }),
    tijdNaarKlok(U(4), [U(4), U(10), U(2)], ["De bus rijdt om {4:oranje} uur terug naar de bakkerij."]),
    leesKlok(U(5), [U(5), U(7), U(10)], { ding: "bakkerij", sfeer: true, zin: ["De bus is terug bij de bakkerij.", "Hoe laat is het?"] }),
    (l, terug) =>
      kiesVraag(
        l,
        {
          keuzes: [V("bezorgbus"), V("bakkerij")],
          goed: 1,
          vraag: ["De broodjes worden vers gebakken.", "Waar worden de broodjes gebakken?"],
          goedZin: ["In de bakkerij worden de broodjes gebakken.", "De bus brengt ze weg."],
          noem: (i) => ["De bus", "De bakkerij"][i],
          reactie: () => ["De bus rijdt rond en brengt de broodjes weg.", "Denk aan de plek met de oven."],
          samen: async (l) => {
            await l.zeg("Een bus rijdt rond.", "In de bakkerij staat de oven.");
          },
          tip: ["Denk aan de plek met de oven."],
        },
        terug,
      ),
    leesKlok(U(6), [U(6), U(5), U(12)], { ding: "maan", sfeer: true, zin: ["Het wordt donker. De maan komt op.", "Hoe laat is het?"] }),
    leesKlok(U(7), [U(7), U(1), U(6)], { ding: "oven", naspeel: "uit", zin: ["De oven in de bakkerij gaat uit.", "Hoe laat is het?"] }),
    leesKlok(U(8), [U(8), U(4), U(7)], { ding: "maan", sfeer: true, zin: ["Het is avond. De maan schijnt.", "Hoe laat is het?"] }),
  ],
  reserve: [0, 3, 5],
  eindZin: ["Het was een drukke dag voor de bus."],
  eind: "Je kunt de klok lezen en de goede klok kiezen.",
});

/* =====================================================================
   Klokkijken (14274) — level 1, 3 en 4 (level 2 is een filmpje)
   ===================================================================== */

const klokkijken1 = klokles({
  id: "squla-klok-klokkijken-1",
  titel: "Klokkijken",
  oefening: "Klokkijken",
  level: 1,
  voorwerpen: [],
  start: W(U(12), "blauw"),
  welkom: ["Ik zeg hoe laat het is.", "Klopt dat met de klok?"],
  voorbeeld: 0,
  uitleg: (l) => uitlegHeel(l, 5),
  opgaven: [
    goedFout(U(4), U(4)),
    goedFout(U(7), U(10)),
    goedFout(U(11), U(5)),
    goedFout(U(9), U(9)),
    goedFout(U(3), U(4)),
    goedFout(U(1), U(1)),
    goedFout(U(8), U(8)),
    goedFout(U(12), U(6)),
    goedFout(U(5), U(5)),
    goedFout(U(10), U(2)),
    goedFout(U(6), U(6)),
    goedFout(U(2), U(7)),
  ],
  reserve: [0, 1, 4],
  eind: "Je kunt hele uren lezen op de klok.",
});

const klokkijken2 = klokles({
  id: "squla-klok-klokkijken-2",
  titel: "Klokkijken (moeilijker)",
  oefening: "Klokkijken",
  level: 3,
  noot: "level 2 is bij Squla een uitlegfilmpje",
  voorwerpen: [],
  start: W(U(12), "oranje"),
  welkom: ["Er staan 2 klokken.", "Op welke klok is het {2:oranje} uur?"],
  voorbeeld: 0,
  uitleg: (l) => uitlegHeel(l, 6),
  opgaven: [
    kiesKlok(U(2), [U(7), U(2)]),
    kiesKlok(U(5), [U(5), U(11)]),
    kiesKlok(U(10), [U(8), U(10)]),
    kiesKlok(U(4), [U(4), U(6)]),
    kiesKlok(U(3), [U(9), U(3)]),
    kiesKlok(U(12), [U(12), U(6)]),
    tijdNaarKlok(U(7), [U(7), U(5)], ["De bakkerij gaat om {7:oranje} uur dicht."]),
    tijdNaarKlok(U(10), [U(11), U(10)], ["De bus vertrekt om {10:oranje} uur."]),
    tijdNaarKlok(U(4), [U(4), U(3)], ["Het raketje vertrekt om {4:oranje} uur."]),
    tijdNaarKlok(U(8), [U(6), U(8)], ["Om {8:oranje} uur gaat het lampje uit."]),
    tijdNaarKlok(U(1), [U(1), U(11)], ["Om {1:oranje} uur 's nachts schijnt de maan."]),
    tijdNaarKlok(U(5), [U(7), U(5)], ["De taart is om {5:oranje} uur klaar."]),
  ],
  reserve: [0, 4, 10],
  eind: "Je kunt de goede klok kiezen.",
});

const klokkijken3 = klokles({
  id: "squla-klok-klokkijken-3",
  titel: "Klokkijken (nog moeilijker)",
  oefening: "Klokkijken",
  level: 4,
  voorwerpen: [],
  start: W(U(12), "groen"),
  welkom: ["De kleine wijzer vertelt het uur.", "Hoe laat is het op deze klok?"],
  voorbeeld: 0,
  uitleg: (l) => uitlegHeel(l, 7),
  opgaven: [
    leesKlok(U(9), [U(9), U(8), U(3)]),
    leesKlok(U(3), [U(3), U(2), U(9)]),
    leesKlok(U(6), [U(6), U(5), U(12)]),
    leesKlok(U(11), [U(10), U(11), U(12)]),
    leesKlok(U(1), [U(1), U(12), U(2)]),
    leesKlok(U(8), [U(8), U(7), U(4)]),
    kiesKlok(U(2), [U(1), U(2), U(3)]),
    kiesKlok(U(4), [U(4), U(5), U(3)]),
    kiesKlok(U(7), [U(6), U(7), U(9)]),
    kiesKlok(U(12), [U(12), U(11), U(1)]),
    kiesKlok(U(9), [U(8), U(9), U(10)]),
    kiesKlok(U(6), [U(5), U(6), U(12)]),
  ],
  reserve: [0, 6, 3],
  eind: "Je kunt hele uren lezen en kiezen.",
});

/* =====================================================================
   Klokkijken 1 (10999) — vergelijken, goed of fout, kiezen
   ===================================================================== */

/** Memory met 3 paren dezelfde klokken. */
function memoryKlokken(uren: number[]): Opgave {
  return (l, terug) => {
    const kl = kleurRij(3);
    return memory(
      uren.map((u, i) => [W(U(u), kl[i]), W(U(u), kl[i])] as [Ding, Ding]),
      ["Op welke klokken is het even laat?", "Kijk goed, straks gaan de bolletjes dicht.", "Zoek steeds 2 klokken die even laat zijn."],
      ["Je hebt alle paren gevonden!"],
    )(l, terug);
  };
}

/** Verbinden: links en rechts dezelfde klokken. */
function verbindKlokken(uren: number[], rechts: number[]): Opgave {
  return (l, terug) => {
    const kl = kleurRij(uren.length);
    return verbind(
      uren.map((u, i) => [W(U(u), kl[i]), W(U(u), kl[i])] as [Ding, Ding]),
      rechts,
      ["Op welke klokken is het even laat?", "Tik op een klok links.", "Tik dan op de klok rechts die even laat is."],
      ["Alle klokken zijn verbonden!"],
    )(l, terug);
  };
}

const klokkijken1a = klokles({
  id: "squla-klok-klokkijken1-1",
  titel: "Klokkijken 1",
  oefening: "Klokkijken 1",
  level: 1,
  voorwerpen: [],
  start: W(U(3), "paars"),
  welkom: ["Je vergelijkt klokken met elkaar.", "Op welke klok is het {11:oranje} uur?"],
  voorbeeld: 0,
  uitleg: (l) => uitlegHeel(l, 1),
  opgaven: [
    kiesKlok(U(11), [U(6), U(11)]),
    memoryKlokken([5, 11, 8]),
    verbindKlokken([4, 12, 2, 10], [0, 1, 2, 3]),
    kiesKlok(U(3), [U(3), U(10)]),
    memoryKlokken([6, 9, 1]),
    verbindKlokken([1, 6, 8, 11], [1, 2, 0, 3]),
    kiesKlok(U(5), [U(12), U(5)]),
    memoryKlokken([3, 7, 12]),
    kiesKlok(U(8), [U(8), U(4)]),
    memoryKlokken([10, 2, 4]),
    kiesKlok(U(10), [U(2), U(10)]),
    verbindKlokken([3, 5, 9, 7], [2, 3, 1, 0]),
  ],
  reserve: [0, 3, 6],
  eind: "Je kunt klokken vergelijken.",
});

const klokkijken1b = klokles({
  id: "squla-klok-klokkijken1-2",
  titel: "Klokkijken 1 (moeilijker)",
  oefening: "Klokkijken 1",
  level: 2,
  voorwerpen: [],
  start: W(U(6), "rood"),
  welkom: ["Soms klopt de tijd bij de klok, soms niet.", "Kijk goed naar de kleine wijzer."],
  voorbeeld: 0,
  uitleg: (l) => uitlegHeel(l, 2),
  opgaven: [
    goedFout(U(3), U(3)),
    kiesKlok(U(2), [U(2), U(1), U(12)]),
    goedFout(U(7), U(12)),
    kiesKlok(U(4), [U(3), U(4), U(5)]),
    goedFout(U(9), U(6)),
    kiesKlok(U(6), [U(6), U(5), U(8)]),
    goedFout(U(10), U(10)),
    kiesKlok(U(8), [U(9), U(7), U(8)]),
    goedFout(U(1), U(2)),
    kiesKlok(U(10), [U(12), U(10), U(11)]),
    goedFout(U(5), U(5)),
    kiesKlok(U(12), [U(11), U(12), U(1)]),
  ],
  reserve: [0, 1, 4],
  eind: "Je kijkt goed naar de kleine wijzer.",
});

const klokkijken1c = klokles({
  id: "squla-klok-klokkijken1-3",
  titel: "Klokkijken 1 (nog moeilijker)",
  oefening: "Klokkijken 1",
  level: 3,
  voorwerpen: [],
  start: W(U(9), "turkoois"),
  welkom: ["Sommige klokken lijken op elkaar.", "Op welke klok is het {11:oranje} uur?"],
  voorbeeld: 0,
  uitleg: (l) => uitlegHeel(l, 3),
  opgaven: [
    kiesKlok(U(11), [U(11), U(1), U(9)]),
    tijdNaarKlok(U(2), [U(2), U(3)], null),
    kiesKlok(U(1), [U(12), U(2), U(1)]),
    tijdNaarKlok(U(5), [U(5), U(7)], null),
    kiesKlok(U(3), [U(5), U(3), U(4)]),
    tijdNaarKlok(U(9), [U(9), U(3)], null),
    kiesKlok(U(7), [U(7), U(8), U(10)]),
    tijdNaarKlok(U(4), [U(4), U(8)], null),
    kiesKlok(U(9), [U(10), U(9), U(6)]),
    tijdNaarKlok(U(11), [U(11), U(1)], null, true),
    kiesKlok(U(6), [U(6), U(4), U(2)]),
    tijdNaarKlok(U(10), [U(10), U(2)], null, true),
  ],
  reserve: [1, 5, 9],
  eind: "Je laat je niet foppen door klokken die op elkaar lijken.",
});

/* =====================================================================
   Klokkijken 2 (11000) — wijzerklok en digitale klok door elkaar
   ===================================================================== */

const klokkijken2a = klokles({
  id: "squla-klok-klokkijken2-1",
  titel: "Klokkijken 2",
  oefening: "Klokkijken 2",
  level: 1,
  voorwerpen: [],
  start: W(U(9), "blauw"),
  welkom: ["Een klok en een tijd horen bij elkaar.", "Welke klok hoort bij {9:oranje} uur?"],
  voorbeeld: 0,
  uitleg: (l) => uitlegHeel(l, 4),
  opgaven: [
    tijdNaarKlok(U(9), [U(9), U(8), U(7)], null),
    leesKlok(U(8), [U(8), U(6), U(2)]),
    tijdNaarKlok(U(2), [U(12), U(2), U(1)], null),
    leesKlok(U(11), [U(11), U(12), U(5)]),
    tijdNaarKlok(U(5), [U(4), U(5), U(3)], null),
    leesKlok(U(3), [U(3), U(4), U(9)]),
    tijdNaarKlok(U(6), [U(9), U(6), U(5)], null),
    leesKlok(U(9), [U(9), U(10), U(8)]),
    tijdNaarKlok(U(1), [U(1), U(10), U(11)], null),
    leesKlok(U(4), [U(4), U(2), U(7)]),
    tijdNaarKlok(U(7), [U(7), U(1), U(9)], null),
    leesKlok(U(12), [U(12), U(1), U(6)]),
  ],
  reserve: [0, 1, 4],
  eind: "Je kunt een klok en een tijd in woorden bij elkaar zoeken.",
});

const klokkijken2b = klokles({
  id: "squla-klok-klokkijken2-2",
  titel: "Klokkijken 2 (moeilijker)",
  oefening: "Klokkijken 2",
  level: 2,
  voorwerpen: [],
  start: W(U(3), "oranje"),
  welkom: ["Hier staat een tijd in woorden.", "Zoek de klok die erbij past."],
  voorbeeld: 0,
  uitleg: (l) => uitlegHeel(l, 5),
  opgaven: [
    tijdNaarKlok(U(8), [U(8), U(9)], ["De bus vertrekt om {8:oranje} uur."]),
    leesKlok(U(2), [U(2), U(12), U(10)]),
    tijdNaarKlok(U(5), [U(5), U(3)], ["De bakkerij gaat om {5:oranje} uur dicht."]),
    verbindKlokTijd([6, 12, 7], [1, 2, 0]),
    tijdNaarKlok(U(10), [U(12), U(10)], ["Het raketje landt om {10:oranje} uur."]),
    leesKlok(U(9), [U(3), U(9), U(8)]),
    tijdNaarKlok(U(7), [U(7), U(5)], ["Om {7:oranje} uur gaat het lampje uit."]),
    leesKlok(U(11), [U(1), U(11), U(10)]),
    tijdNaarKlok(U(3), [U(1), U(3)], ["Om {3:oranje} uur 's nachts schijnt de maan."]),
    memoryKlokTijd([4, 8, 5]),
    tijdNaarKlok(U(12), [U(12), U(6)], ["De taart is om {12:oranje} uur klaar."]),
    leesKlok(U(1), [U(1), U(11), U(2)]),
  ],
  reserve: [1, 5, 2],
  eind: "Je ziet welke klok bij welke tijd past.",
});

const klokkijken2c = klokles({
  id: "squla-klok-klokkijken2-3",
  titel: "Klokkijken 2 (nog moeilijker)",
  oefening: "Klokkijken 2",
  level: 3,
  voorwerpen: [],
  start: W(U(12), "paars"),
  welkom: ["De tijden liggen dicht bij elkaar.", "Welke klok hoort bij {6:oranje} uur?"],
  voorbeeld: 0,
  uitleg: (l) => uitlegHeel(l, 6),
  opgaven: [
    tijdNaarKlok(U(6), [U(6), U(8), U(5)], null),
    leesKlok(U(8), [U(8), U(6), U(10)]),
    tijdNaarKlok(U(7), [U(9), U(7), U(12)], null),
    leesKlok(U(5), [U(7), U(5), U(4)]),
    tijdNaarKlok(U(9), [U(9), U(6), U(11)], null),
    leesKlok(U(10), [U(10), U(2), U(12)]),
    tijdNaarKlok(U(11), [U(11), U(1), U(10)], null),
    leesKlok(U(12), [U(12), U(6), U(11)]),
    tijdNaarKlok(U(8), [U(8), U(9), U(7)], null),
    leesKlok(U(6), [U(6), U(12), U(5)]),
    tijdNaarKlok(U(12), [U(12), U(2), U(10)], null),
    leesKlok(U(7), [U(7), U(5), U(8)]),
  ],
  reserve: [1, 3, 5],
  eind: "Je kunt de klok lezen en de goede klok kiezen.",
});

/* =====================================================================
   Klokkijken 3 (6935) — halve uren
   ===================================================================== */

const halfuur1 = klokles({
  id: "squla-klok-klokkijken3-1",
  titel: "Halve uren lezen",
  oefening: "Klokkijken 3",
  level: 1,
  voorwerpen: [],
  start: W(H(5), "oranje"),
  welkom: ["Bij half staat de grote wijzer op de {6:paars}.", "Op welke klok is het half {3:oranje}?"],
  voorbeeld: 0,
  uitleg: uitlegHalf,
  opgaven: [
    kiesKlok(H(3), [H(3), H(10)]),
    kiesKlok(H(5), [H(11), H(5)]),
    kiesKlok(H(8), [H(8), H(12)]),
    kiesKlok(H(10), [H(10), H(4)]),
    kiesKlok(H(1), [H(7), H(1)]),
    kiesKlok(H(6), [H(6), H(9)]),
    goedFout(H(2), H(2)),
    goedFout(H(4), H(4)),
    goedFout(H(11), H(6)),
    goedFout(H(7), H(7)),
    goedFout(H(9), H(12)),
    goedFout(H(12), H(1)),
  ],
  reserve: [0, 6, 8],
  eind: "Je kunt halve uren lezen.",
});

const halfuur2 = klokles({
  id: "squla-klok-klokkijken3-2",
  titel: "Halve uren lezen (moeilijker)",
  oefening: "Klokkijken 3",
  level: 2,
  voorwerpen: [],
  start: W(H(9), "groen"),
  welkom: ["We oefenen halve uren en bijna half.", "Welke klok hoort bij half {9:oranje}?"],
  voorbeeld: 0,
  uitleg: uitlegHalf,
  opgaven: [
    tijdNaarKlok(H(9), [H(9), H(11)], null),
    tijdNaarKlok(H(7), [H(4), H(7)], null),
    tijdNaarKlok(H(3), [H(2), H(3)], null),
    tijdNaarKlok(H(11), [H(11), H(10)], null),
    tijdNaarKlok(H(5), [H(4), H(5)], null),
    leesKlok(H(11), [H(11), H(10), H(7)]),
    leesKlok(H(4), [H(4), H(5), H(3)]),
    leesKlok(H(12), [H(11), H(12), H(2)]),
    leesKlok(H(7), [H(4), H(6), H(7)]),
    leesKlok(H(1), [H(7), H(1), H(12)]),
    kiesKlok(B(6), [B(9), B(6), B(4)]),
    kiesKlok(B(2), [B(12), B(2), B(10)]),
    kiesKlok(B(10), [B(9), B(1), B(10)]),
    kiesKlok(B(4), [B(4), B(3), B(10)]),
    kiesKlok(B(8), [B(1), B(8), B(9)]),
  ],
  reserve: [],
  eind: "Je kent half en bijna half.",
});

const halfuur3 = klokles({
  id: "squla-klok-klokkijken3-3",
  titel: "Halve uren lezen (nog moeilijker)",
  oefening: "Klokkijken 3",
  level: 3,
  voorwerpen: [],
  start: W(U(6), "paars"),
  welkom: ["Hele en halve uren staan door elkaar.", "Op welke klok is het {6:oranje} uur?"],
  voorbeeld: 0,
  uitleg: async (l) => {
    await uitlegHeel(l);
    await uitlegHalf(l);
  },
  opgaven: [
    kiesKlok(U(6), [H(6), U(6), H(2)]),
    kiesKlok(H(5), [U(9), H(5), H(12)]),
    kiesKlok(H(3), [H(3), U(7), U(12)]),
    kiesKlok(U(10), [U(8), H(4), U(10)]),
    kiesKlok(H(12), [H(12), H(6), U(4)]),
    kiesKlok(U(2), [H(2), U(2), H(3)]),
    sleepVolgorde(H(6), [U(6), H(7), U(7)], [1, 0, 2]),
    sleepVolgorde(U(9), [H(10), U(10), H(11)], [1, 2, 0]),
    sleepVolgorde(U(1), [H(2), U(2), H(3)], [2, 0, 1]),
    sleepVolgorde(H(11), [U(11), H(12), U(12)], [1, 2, 0]),
    sleepVolgorde(U(3), [H(4), U(4), H(5)], [2, 1, 0]),
    sleepVolgorde(H(8), [U(8), H(9), U(9)], [0, 2, 1]),
  ],
  reserve: [0, 6, 1],
  eind: "Je kunt hele en halve uren op volgorde zetten.",
});

/*
  Wat het ding doet (BOUWREGELS 1.22, Sara 7 november 2026): het raketje vertrekt en het lampje gaat uit pas NA het antwoord;
  schoolbord, bedje, oven, kampvuur, voetbal en treintje staan klein en zacht op de achtergrond; taart en gieter deden
  niets en zijn weg. De bus had al zijn eigen verhaal (metVerhaal).
  Herstel A ronde 2 (7 november 2026): "De taart is net klaar." en "De gieter staat klaar." noemden iets wat niet meer
  in beeld was. Taart en gieter staan nu ook klein en zacht op de achtergrond, zodat de zin weer klopt met het beeld
  (geen nieuwe zin nodig, dus geen nieuwe stem).
*/
const BEELD_REKEN: Record<string, { naspeel?: Naspeel; sfeer?: boolean }> = {
  raketje: { naspeel: "opstijgen" },
  lampje: { naspeel: "uit" },
  schoolbord: { sfeer: true },
  bed: { sfeer: true },
  oven: { sfeer: true },
  kampvuur: { sfeer: true },
  voetbal: { sfeer: true },
  treintje: { sfeer: true },
  taart: { sfeer: true },
  gieter: { sfeer: true },
};
const reken = (ding: string, nu: T, soort: "uur later" | "half later" | "uur eerder", tijden: T[], context: string) => {
  const beeld = BEELD_REKEN[ding] ?? {};
  return ding === "bus" && soort === "uur later" ? tijdRekenen(ding, nu, soort, tijden, context) : metRekenUitleg(tijdRekenen(ding, nu, soort, tijden, context, beeld), nu, soort, beeld.naspeel ? "b1" : "b0");
};

const halfuur4 = klokles({
  id: "squla-klok-klokkijken3-4",
  titel: "Halve uren: later en eerder",
  oefening: "Klokkijken 3",
  level: 4,
  voorwerpen: ["schoolbord", "bed", "oven", "bus", "raketje", "taart", "kampvuur", "voetbal", "lampje", "treintje", "gieter"],
  start: W(U(2), "groen"),
  welkom: ["De klok bij het schoolbord staat op {9:oranje} uur.", "Hoe laat is het over een uur?"],
  voorbeeld: 0,
  uitleg: uitlegRekenen,
  opgaven: [
    reken("schoolbord", U(9), "uur later", [U(10), U(11), U(8)], "De school is begonnen."),
    reken("bed", H(8), "half later", [U(8), H(9), U(7)], "Het bedje is klaar. Het is bijna bedtijd."),
    reken("oven", H(3), "uur later", [H(4), U(4), H(3)], "De oven is aan."),
    reken("bus", U(4), "uur later", [U(5), U(3), H(5)], "De bus staat bij de halte."),
    reken("raketje", U(11), "half later", [H(12), U(12), H(11)], "Het raketje staat klaar."),
    reken("taart", U(7), "uur eerder", [H(7), U(6), U(8)], "De taart is net klaar."),
    reken("kampvuur", H(9), "uur eerder", [H(8), U(9), H(10)], "Het kampvuur brandt."),
    reken("voetbal", H(6), "uur eerder", [H(5), H(7), U(5)], "De voetbal ligt al een uur in het gras."),
    reken("lampje", U(12), "uur eerder", [U(11), U(1), H(12)], "Het lampje gaat uit."),
    reken("treintje", H(11), "uur eerder", [H(10), H(12), U(10)], "Het treintje rijdt rondjes."),
    reken("gieter", U(2), "half later", [H(3), U(3), H(2)], "De gieter staat klaar."),
    later(H(4), U(4)),
    later(U(6), H(8)),
    later(U(4), U(2)),
    later(H(10), U(9)),
  ],
  reserve: [],
  eind: "Je kunt rekenen met de klok.",
});

export const LESSEN_SQULA_KLOK: Lesdraaiboek[] = [
  digitaal1,
  digitaal2,
  hoelaat1,
  hoelaat2,
  hoelaat3,
  klokkijken1,
  klokkijken2,
  klokkijken3,
  klokkijken1a,
  klokkijken1b,
  klokkijken1c,
  klokkijken2a,
  klokkijken2b,
  klokkijken2c,
  halfuur1,
  halfuur2,
  halfuur3,
  halfuur4,
];
