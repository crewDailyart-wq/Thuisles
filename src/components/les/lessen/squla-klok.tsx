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
 */

import type { Lesdraaiboek, Lesgids } from "../soort";
import { squlaBegin, squlaEind, squlaVraag, type SqulaVraag } from "./squla-hulp";
import { SqulaKlokVlak, KaartKlok, type Ding, type KlokVlakProps } from "../vlakken/squla-klok-vlak";
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
  if (t.m === 0) return `{${t.u}} uur`;
  if (t.m === 30) return `half {${na(t)}}`;
  return `bijna half {${na(t)}}`;
}
/** Zoals het op een knop staat. */
function woord(t: T) {
  if (t.m === 0) return `${t.u} uur`;
  if (t.m === 30) return `half ${na(t)}`;
  return `bijna half ${na(t)}`;
}
/** "07:00" */
const dig = (h: number) => `${String(h).padStart(2, "0")}:00`;
/** Zoals Bliepo de cijfers vóór de dubbele punt zegt ("nul {7}", "{10}"). */
const zegUur = (tekst: string) => {
  const v = tekst.split(":")[0];
  if (v === "00") return "nul nul";
  return v.startsWith("0") ? `nul {${Number(v)}}` : `{${Number(v)}}`;
};

const KLEUREN: Kl[] = ["blauw", "oranje", "groen", "roze", "paars", "rood", "turkoois", "geel"];
let kleurTeller = 0;
const kleurRij = (n: number) => {
  const k = kleurTeller;
  kleurTeller += n;
  return Array.from({ length: n }, (_, i) => KLEUREN[(k + i) % KLEUREN.length]);
};

const W = (t: T, kleur: Kl, nadruk?: "uur" | "min"): Ding => ({ t: "wijzer", u: t.u, m: t.m, kleur, ...(nadruk ? { nadruk } : {}) });
const D = (tekst: string, kleur: Kl = "blauw"): Ding => ({ t: "digi", tekst, kleur });
const V = (naam: string, scherm?: string): Ding => ({ t: "vw", naam, ...(scherm ? { scherm } : {}) });
const Tx = (tekst: string): Ding => ({ t: "tekst", tekst });
const Tk = (tekst: string): Ding => ({ t: "teken", tekst });
const Tg = (tekst: string): Ding => ({ t: "tegel", tekst });
const VINK: Ding = { t: "vink" };
const KRUIS: Ding = { t: "kruis" };

/** Zet de nadruk op een wijzer van een klok (of haal hem weg). */
const metNadruk = (d: Ding, nadruk?: "uur" | "min"): Ding => (d.t === "wijzer" ? W({ u: d.u, m: d.m }, d.kleur, nadruk) : d);

/** Getallen in een knoptekst tussen {…} (voor wat Bliepo zegt). */
const metHaken = (s: string) => s.replace(/\d+/g, (n) => `{${n}}`);
const Hoofd = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/* =====================================================================
   het vlak besturen
   ===================================================================== */

const LEEG: KlokVlakProps = { sleutel: "", modus: "kies", boven: [], keuzes: [], pijl: false, paren: undefined, rechts: undefined, vast: null, actief: false, licht: [], goed: [], fout: [], uit: [] };
const zet = (l: Lesgids, p: Partial<KlokVlakProps>) => l.pasVlakAan<KlokVlakProps>(p);
let beeldNr = 0;
const nieuw = () => `kk${++beeldNr}`;

/** Bliepo laat iets oplichten en zegt er iets bij. */
async function wijs(l: Lesgids, ids: string[], ...zinnen: string[]) {
  zet(l, { licht: ids });
  await l.zeg(...zinnen);
}

type Opgave = (l: Lesgids, terug: boolean) => SqulaVraag<string>;
/** Een andere volgorde bij een vraag die terugkomt (de goede index schuift mee). */
function draai<X>(lijst: X[], goed: number, terug: boolean): { lijst: X[]; goed: number } {
  if (!terug || lijst.length < 2) return { lijst, goed };
  return { lijst: [...lijst.slice(1), lijst[0]], goed: (goed - 1 + lijst.length) % lijst.length };
}

/* --- de algemene vraag: tikken op een ding in het vlak --- */

type KiesO = {
  boven?: Ding[];
  pijl?: boolean;
  keuzes: Ding[];
  goed: number;
  vraag: string[];
  goedZin: string[];
  /** Hoe Bliepo elk antwoord noemt bij een fout. */
  noem?: (i: number) => string;
  samen: (l: Lesgids, k: { keuzes: Ding[]; boven: Ding[] }) => Promise<void>;
  tip: string[];
};

function kiesVraag(l: Lesgids, o: KiesO, terug: boolean): SqulaVraag<string> {
  const { lijst: keuzes, goed } = draai(o.keuzes, o.goed, terug);
  const boven = o.boven ?? [];
  const oud = (i: number) => o.keuzes.indexOf(keuzes[i]);
  return {
    toon: () => zet(l, { ...LEEG, sleutel: nieuw(), modus: "kies", boven, keuzes, pijl: !!o.pijl }),
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
      await l.zeg("Goed zo.", ...o.goedZin);
      await l.wacht(250);
    },
    fout: (x) => zet(l, { fout: [x] }),
    samen: async () => {
      zet(l, { fout: [], licht: [], goed: [] });
      await o.samen(l, { keuzes, boven });
      zet(l, { licht: [], keuzes, boven });
    },
    tip: o.tip,
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
};

function knopVraag(l: Lesgids, o: KnopO, terug: boolean): SqulaVraag<string> {
  /* de goede knop staat niet steeds vooraan: een vaste schuif per vraag (en een andere als hij terugkomt) */
  const n = o.opties.length;
  const k = ([...(o.vraag.join("") + o.goed)].reduce((a, c) => a + c.charCodeAt(0), 0) + (terug ? 1 : 0)) % n;
  const opties = [...o.opties.slice(k), ...o.opties.slice(0, k)];
  return {
    toon: () => zet(l, { ...LEEG, sleutel: nieuw(), modus: "kies", boven: o.boven, keuzes: [], pijl: !!o.pijl }),
    vraag: o.vraag,
    antwoord: async () => (await l.kies(opties, { weetniet: false, direct: true })) ?? "",
    isGoed: (x) => x === o.goed,
    noem: (x) => Hoofd(metHaken(x)),
    goed: async () => {
      zet(l, { goed: o.boven.map((_, i) => `b${i}`) });
      await l.zeg("Goed zo.", ...o.goedZin);
      await l.wacht(250);
    },
    samen: async () => {
      await o.samen(l, o.boven);
      zet(l, { licht: [], boven: o.boven });
    },
    tip: o.tip,
    testAntwoord: o.goed,
  };
}

/* =====================================================================
   uitleg die vaak terugkomt (samen kijken)
   ===================================================================== */

/** Beschrijf waar de kleine wijzer staat (zonder de tijd te noemen). */
function waarKlein(t: T, metGroot: boolean) {
  if (t.m === 0) return metGroot ? `Hier staat de grote wijzer op de {12}, en de kleine wijst naar de {${t.u}}.` : `Hier wijst de kleine wijzer naar de {${t.u}}.`;
  const tussen = `de kleine wijzer tussen de {${t.u}} en de {${na(t)}}`;
  if (t.m === 30) return metGroot ? `Hier staat de grote wijzer op de {6}, en ${tussen}.` : `Hier staat ${tussen}.`;
  return `Hier staat ${tussen}.`;
}

/** De regel voor de tijd die we zoeken. */
function regel(t: T): string[] {
  if (t.m === 0) return [`Bij {${t.u}} uur staat de grote wijzer op de {12}.`, `En de kleine wijzer wijst naar de {${t.u}}.`];
  if (t.m === 30) return [`Bij half {${na(t)}} staat de grote wijzer op de {6}.`, `En de kleine wijzer staat tussen de {${t.u}} en de {${na(t)}}.`];
  return [`Bij bijna half {${na(t)}} staat de grote wijzer net vóór de {6}.`, `En de kleine wijzer staat tussen de {${t.u}} en de {${na(t)}}.`];
}

/** Samen langs de wijzerklokken: steeds de kleine wijzer oranje, en zeggen waar hij staat. */
async function samenKlokken(l: Lesgids, doel: T, keuzes: Ding[], boven: Ding[] = []) {
  const tijden = keuzes.map((d) => (d.t === "wijzer" ? { u: d.u, m: d.m } : null));
  const gemengd = new Set(tijden.filter(Boolean).map((t) => t!.m)).size > 1;
  if (doel.m === 0 && !gemengd) await l.zeg("Bij een heel uur staat de grote wijzer op de {12}.", "De kleine wijzer wijst het uur aan.");
  else if (doel.m === 30 && !gemengd) await l.zeg("Bij half staat de grote wijzer op de {6}.", "De kleine wijzer staat dan tussen twee getallen.");
  else if (doel.m === 25) await l.zeg("Bij bijna half staat de grote wijzer net vóór de {6}.", "Kijk dan naar de kleine wijzer.");
  else await l.zeg("Kijk naar allebei de wijzers.", "Staat de grote wijzer op de {12}? Dan is het een heel uur.", "Staat hij op de {6}? Dan is het half.");
  for (let i = 0; i < keuzes.length; i++) {
    const t = tijden[i];
    if (!t) continue;
    zet(l, { keuzes: keuzes.map((d, j) => metNadruk(d, j === i ? "uur" : undefined)), boven });
    await wijs(l, [`k${i}`], waarKlein(t, gemengd));
  }
  zet(l, { keuzes, licht: [] });
  await l.zeg(...regel(doel));
  await l.zeg("Welke klok hoort erbij?");
}

/** Samen langs de digitale klokken: wat staat er vóór de dubbele punt? */
async function samenDigi(l: Lesgids, h: number, keuzes: Ding[]) {
  await l.zeg("Bij een digitale klok kijk je eerst vóór de dubbele punt.", "Daar staat het uur.");
  for (let i = 0; i < keuzes.length; i++) {
    const d = keuzes[i];
    if (d.t !== "digi") continue;
    const zinnen = [`Hier staat ${zegUur(d.tekst)} vóór de dubbele punt.`];
    if (!d.tekst.endsWith(":00")) zinnen.push("Na de dubbele punt staat geen nul nul.");
    await wijs(l, [`k${i}`], ...zinnen);
  }
  zet(l, { licht: [] });
  await l.zeg(`Bij {${h}} uur staat er ${zegUur(dig(h))} vóór de dubbele punt.`, "En na de dubbele punt staat nul nul.");
}

/** Samen één wijzerklok lezen (de klok staat bovenaan als `b<i>`). */
async function samenLees(l: Lesgids, t: T, boven: Ding[], i: number) {
  const zetN = (n?: "uur" | "min") => zet(l, { boven: boven.map((d, j) => (j === i ? metNadruk(d, n) : d)) });
  zetN("min");
  if (t.m === 0) {
    await wijs(l, [`b${i}`], "Kijk eerst naar de grote wijzer.", "Die staat op de {12}.", "Dan is het een heel uur.");
    zetN("uur");
    await l.zeg("Kijk nu naar de kleine wijzer.", "Naar welk getal wijst hij?");
  } else {
    await wijs(l, [`b${i}`], "Kijk eerst naar de grote wijzer.", "Die staat op de {6}.", "Dan is het half.");
    zetN("uur");
    await l.zeg(`De kleine wijzer staat tussen de {${t.u}} en de {${na(t)}}.`, "Bij half noem je het getal waar hij naartoe gaat.");
  }
  zetN(undefined);
}

/** Samen één digitale klok lezen. */
async function samenLeesDigi(l: Lesgids, i: number) {
  await wijs(l, [`b${i}`], "Zoek eerst de dubbele punt in het midden.", "Vóór de dubbele punt staat het uur.", "Na de dubbele punt staat nul nul: precies een heel uur.", "Welk getal staat vóór de dubbele punt?");
}

/* =====================================================================
   de soorten vragen
   ===================================================================== */

const noemKlok = () => "Die klok";

/** Op welke wijzerklok is het …? (2 of 3 klokken). `zin`: eigen vraag, `boven`: wat erboven staat. */
function kiesKlok(doel: T, tijden: T[], o: { zin?: string[]; boven?: Ding[]; zelfdeKleur?: boolean; goedZin?: string[] } = {}): Opgave {
  return (l, terug) => {
    const kl = o.zelfdeKleur ? Array(tijden.length).fill(kleurRij(1)[0]) : kleurRij(tijden.length);
    const keuzes = tijden.map((t, i) => W(t, kl[i]));
    const goed = tijden.findIndex((t) => t.u === doel.u && t.m === doel.m);
    return kiesVraag(
      l,
      {
        boven: o.boven,
        keuzes,
        goed,
        vraag: o.zin ?? [`Op welke klok is het ${spreek(doel)}?`],
        goedZin: o.goedZin ?? [`Op deze klok is het ${spreek(doel)}.`],
        noem: noemKlok,
        samen: (l, k) => samenKlokken(l, doel, k.keuzes, k.boven),
        tip: doel.m === 0 ? ["Kijk goed naar de kleine wijzer."] : ["Kijk naar het getal waar de kleine wijzer naartoe gaat."],
      },
      terug,
    );
  };
}

/** Op welke digitale klok is het … uur? */
function kiesDigi(h: number, opties: string[], o: { zin?: string[]; boven?: Ding[]; goedZin?: string[] } = {}): Opgave {
  return (l, terug) => {
    const kl = kleurRij(opties.length);
    return kiesVraag(
      l,
      {
        boven: o.boven,
        keuzes: opties.map((s, i) => D(s, kl[i])),
        goed: opties.indexOf(dig(h)),
        vraag: o.zin ?? [`Op welke digitale klok is het {${h}} uur?`],
        goedZin: o.goedZin ?? [`Hier staat ${zegUur(dig(h))} vóór de dubbele punt.`, `En nul nul erna. Het is {${h}} uur.`],
        noem: noemKlok,
        samen: (l, k) => samenDigi(l, h, k.keuzes),
        tip: ["Kijk naar het getal vóór de dubbele punt."],
      },
      terug,
    );
  };
}

/** Een wijzerklok bovenaan: welke digitale klok is even laat? */
function wijzerNaarDigi(h: number, opties: string[]): Opgave {
  return (l, terug) => {
    const kl = kleurRij(opties.length + 1);
    const boven = [W(U(h), kl[0])];
    return kiesVraag(
      l,
      {
        boven,
        keuzes: opties.map((s, i) => D(s, kl[i + 1])),
        goed: opties.indexOf(dig(h)),
        vraag: ["Kijk naar de wijzerklok.", "Op welke digitale klok is het even laat?"],
        goedZin: [`Allebei de klokken zeggen {${h}} uur.`],
        noem: noemKlok,
        samen: async (l, k) => {
          zet(l, { boven: [metNadruk(boven[0], "uur")] });
          await wijs(l, ["b0"], "Kijk eerst naar de wijzerklok.", "De grote wijzer staat op de {12}. Het is een heel uur.", "Naar welk getal wijst de kleine wijzer?");
          zet(l, { boven });
          await samenDigi(l, h, k.keuzes);
        },
        tip: ["Kijk naar de kleine wijzer, en dan naar het getal vóór de dubbele punt."],
      },
      terug,
    );
  };
}

/** Een wijzerklok (en eventueel een ding) bovenaan: hoe laat is het? Antwoord met knoppen. */
function leesKlok(t: T, opties: T[], o: { ding?: string; zin?: string[]; weetje?: string[] } = {}): Opgave {
  return (l, terug) => {
    const klok = W(t, kleurRij(1)[0]);
    const boven = o.ding ? [V(o.ding), klok] : [klok];
    const i = boven.length - 1;
    return knopVraag(
      l,
      {
        boven,
        opties: opties.map(woord),
        goed: woord(t),
        vraag: o.zin ?? ["Hoe laat is het?"],
        goedZin: [`Het is ${spreek(t)}.`, ...(o.weetje ?? [])],
        samen: (l, b) => samenLees(l, t, b, i),
        tip: t.m === 0 ? ["Kijk naar de kleine wijzer. Naar welk getal wijst hij?"] : ["Noem het getal waar de kleine wijzer naartoe gaat."],
      },
      terug,
    );
  };
}

/** Een digitale klok (en een ding) bovenaan: hoe laat is het? */
function leesDigi(h: number, opties: number[], o: { ding?: string; zin?: string[]; weetje?: string[] } = {}): Opgave {
  return (l, terug) => {
    const klok = D(dig(h), kleurRij(1)[0]);
    const boven = o.ding ? [V(o.ding), klok] : [klok];
    return knopVraag(
      l,
      {
        boven,
        opties: opties.map((n) => `${n} uur`),
        goed: `${h} uur`,
        vraag: o.zin ?? ["Hoe laat is het?"],
        goedZin: [`Het is {${h}} uur.`, ...(o.weetje ?? [])],
        samen: (l, b) => samenLeesDigi(l, b.length - 1),
        tip: ["Kijk naar het getal vóór de dubbele punt."],
      },
      terug,
    );
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
        samen: async (l, k) => {
          await samenLees(l, klok, k.boven, 0);
          await l.zeg(`Klopt ${spreek(gezegd)}?`, "Tik op het vinkje als het klopt.", "Tik op het kruisje als het niet klopt.");
        },
        tip: ["Lees eerst zelf de klok.", `Is het dan ${spreek(gezegd)}?`],
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

/** Ochtend of middag? Een digitale klok (en een ding) bovenaan. */
function ochtendMiddag(h: number, zin: string[], ding?: string): Opgave {
  return (l, terug) => {
    const klok = D(dig(h), kleurRij(1)[0]);
    const boven = ding ? [V(ding), klok] : [klok];
    const goed = h < 12 ? "ochtend" : "middag";
    return knopVraag(
      l,
      {
        boven,
        opties: ["ochtend", "middag"],
        goed,
        vraag: [...zin, "Is het ochtend of middag?"],
        goedZin: h < 12 ? [`Het is nog geen {12} uur.`, "Dus het is ochtend."] : [`Na {12} uur is het middag.`, `{${h}}:00 is {${h - 12}} uur 's middags.`],
        samen: async (l, b) => {
          await wijs(l, [`b${b.length - 1}`], "Kijk naar het getal vóór de dubbele punt.", "Tot {12} uur is het ochtend.", "Na {12} uur is het middag.", "Een digitale klok telt na {12} verder: {13}, {14}, {15}.", "Welk getal staat er hier?");
        },
        tip: ["Is het getal vóór de dubbele punt meer dan {12}?"],
      },
      terug,
    );
  };
}

/** Hoe lang duurt het? Twee digitale klokken met een pijl ertussen. */
function hoeLang(van: number, tot: number, opties: string[], zin: string[], wat: string): Opgave {
  return (l, terug) => {
    const kl = kleurRij(2);
    const boven = [D(dig(van), kl[0]), D(dig(tot), kl[1])];
    return knopVraag(
      l,
      {
        boven,
        pijl: true,
        opties,
        goed: `${tot - van} uur`,
        vraag: zin,
        goedZin: [`Van {${van}} uur tot {${tot}} uur is {${tot - van}} uur.`, `${Hoofd(wat)} zijn klaar.`],
        samen: async (l) => {
          await wijs(l, ["b0"], `Om {${van}} uur gaan ${wat} de oven in.`);
          await wijs(l, ["b1"], `Om {${tot}} uur komen ze eruit.`);
          zet(l, { licht: [] });
          await l.zeg(`Tel van {${van}} uur verder tot {${tot}} uur.`, "Hoeveel uur is dat?");
        },
        tip: [`Tel van {${van}} uur naar {${tot}} uur.`],
      },
      terug,
    );
  };
}

/** Zet de cijfers van een digitale klok op de goede plek (slepen of tikken). */
function sleepCijfers(h: number, bak: number[]): Opgave {
  return (l) => {
    const tegels = [Tg(String(h).padStart(2, "0")), Tg(":"), Tg("00")];
    return sleepVraag(l, {
      sleepSoort: "digi",
      tegels,
      bak,
      vraag: [`Het is {${h}} uur.`, "Zet de cijfers op de goede plek."],
      goedZin: [`${Hoofd(zegUur(dig(h)))}, dubbele punt, nul nul.`, `Zo staat {${h}} uur op een digitale klok.`],
      samen: async (l) => {
        await l.zeg("Een digitale klok heeft drie stukjes.", "Vóór de dubbele punt staat het uur.", "In het midden staat de dubbele punt.", "Na de dubbele punt staan de minuten.", "Bij een heel uur is dat nul nul.", `Welk stukje laat {${h}} uur zien?`);
      },
      tip: ["Het uur komt vóór de dubbele punt."],
    });
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
        await l.zeg("Kijk naar de klokken die nog los liggen.", "Welke komt een half uur na de eerste?");
      },
      tip: ["Zoek steeds de klok die een half uur later is."],
    });
  };
}

function sleepVraag(
  l: Lesgids,
  o: { sleepSoort: "digi" | "klok"; vast?: Ding; tegels: Ding[]; bak: number[]; vraag: string[]; goedZin: string[]; samen: (l: Lesgids) => Promise<void>; tip: string[] },
): SqulaVraag<string> {
  /* bak[i] = welk tegeltje (in de goede volgorde) op plek i in de bak ligt */
  const keuzes = o.bak.map((j) => o.tegels[j]);
  const goedVolgorde = o.tegels.map((_, j) => o.bak.indexOf(j));
  const toon = () => zet(l, { ...LEEG, sleutel: nieuw(), modus: "sleep", sleepSoort: o.sleepSoort, keuzes, vast: o.vast ?? null, goedVolgorde });
  return {
    toon,
    vraag: o.vraag,
    antwoord: async () => {
      zet(l, { actief: true });
      const g = await l.wachtOpVlak<{ soort: string; volgorde: number[] }>("sleep");
      zet(l, { actief: false });
      return g.volgorde.join(",");
    },
    isGoed: (x) => x === goedVolgorde.join(","),
    noem: () => "Zo",
    goed: async () => {
      zet(l, { goed: [...goedVolgorde.map((i) => `t${i}`), ...(o.vast ? ["v"] : [])] });
      await l.zeg("Goed zo.", ...o.goedZin);
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
      await l.zeg("Goed zo.", ...goedZin);
    },
    samen: async () => {},
    tip: [],
    testAntwoord: null,
  });
}

/** Verbinden: wat hoort bij elkaar? Een foute lijn verdwijnt meteen weer. */
function verbind(paren: [Ding, Ding][], rechts: number[], vraag: string[], goedZin: string[]): Opgave {
  return (l) => ({
    toon: () => zet(l, { ...LEEG, sleutel: nieuw(), modus: "verbind", paren, rechts }),
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
      await l.zeg("Goed zo.", ...goedZin);
    },
    samen: async () => {},
    tip: [],
    testAntwoord: null,
  });
}

/** Rekenen met tijd: een ding met een klok bovenaan, kies de klok van straks of van net. */
function tijdRekenen(ding: string, nu: T, soort: "uur later" | "half later" | "uur eerder", tijden: T[], context: string): Opgave {
  const doel: T =
    soort === "uur later" ? { u: na(nu), m: nu.m } : soort === "uur eerder" ? { u: ((nu.u + 10) % 12) + 1, m: nu.m } : nu.m === 30 ? { u: na(nu), m: 0 } : { u: nu.u, m: 30 };
  const vraag = soort === "uur later" ? "Hoe laat is het over een uur?" : soort === "half later" ? "Hoe laat is het over een half uur?" : "Hoe laat was het een uur geleden?";
  return (l, terug) =>
    kiesKlok(doel, tijden, {
      boven: [V(ding), W(nu, kleurRij(1)[0])],
      zin: [context, "Kijk op de klok.", vraag],
      goedZin: [`Nu is het ${spreek(nu)}.`, `${soort === "uur eerder" ? "Een uur geleden was het" : "Straks is het"} ${spreek(doel)}.`],
    })(l, terug);
}

/** Rekenen met tijd: de uitleg (vervangt de samen-uitleg van kiesKlok). */
function metRekenUitleg(op: Opgave, nu: T, soort: "uur later" | "half later" | "uur eerder"): Opgave {
  return (l, terug) => {
    const v = op(l, terug);
    return {
      ...v,
      samen: async () => {
        zet(l, { fout: [], goed: [] });
        await wijs(l, ["b1"], "Kijk eerst naar de klok bovenaan.");
        if (soort === "uur later") await l.zeg("Over een uur draait de grote wijzer een heel rondje.", "Dan staat hij weer op dezelfde plek.", "De kleine wijzer schuift één getal verder.");
        else if (soort === "half later") await l.zeg("Over een half uur draait de grote wijzer een half rondje.", nu.m === 0 ? "Van de {12} naar de {6}." : "Van de {6} naar de {12}.", "De kleine wijzer schuift een klein stukje verder.");
        else await l.zeg("Een uur geleden stond de grote wijzer op dezelfde plek.", "De kleine wijzer stond één getal terug.");
        zet(l, { licht: [] });
        await l.zeg("Zoek die klok.");
      },
      tip: soort === "half later" ? ["Over een half uur draait de grote wijzer een half rondje."] : soort === "uur later" ? ["Over een uur is de kleine wijzer één getal verder."] : ["Een uur geleden was de kleine wijzer één getal terug."],
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
    const v = kiesKlok(laat, [a, b], { zin: ["Op welke klok is het later?"], goedZin: [`${Hoofd(spreek(laat))} is later dan ${spreek(vroeg)}.`] })(l, terug);
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
        await l.zeg("Tel steeds een half uur verder.", `${Hoofd(rij.join(", "))}.`, "Welke van de twee komt het laatst?");
      },
      tip: ["Later betekent: verder op de dag."],
    };
  };
}

/* =====================================================================
   de les zelf
   ===================================================================== */

async function speelAlles(l: Lesgids, opgaven: Opgave[], reserve: number[]): Promise<number> {
  let fouten = 0;
  const mis: number[] = [];
  for (let i = 0; i < opgaven.length; i++) {
    if (!(await squlaVraag(l, opgaven[i](l, false)))) {
      fouten++;
      mis.push(i);
    }
  }
  const nodig = Math.max(0, 15 - opgaven.length);
  const terug = [...mis.slice(0, 3), ...reserve.filter((i) => !mis.includes(i))].slice(0, Math.max(nodig, Math.min(3, mis.length)));
  if (terug.length) {
    await l.zeg(terug.length === 1 ? "Nu komt er nog één vraag van net terug." : `Nu komen er nog ${terug.length === 2 ? "twee" : "drie"} vragen van net terug.`);
    for (const i of terug) if (!(await squlaVraag(l, opgaven[i](l, true)))) fouten++;
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
      l.vlak<KlokVlakProps>(SqulaKlokVlak, { ...LEEG, sleutel: nieuw(), boven: [k.start] });
      speelLesgeluid("verschijn");
      await squlaBegin(l, { welkom: k.welkom, uitleg: () => k.uitleg(l) });
      if (k.verhaal) await l.zeg(...k.verhaal);
      const fouten = await speelAlles(l, k.opgaven, k.reserve);
      if (k.eindZin) await l.zeg(...k.eindZin);
      await squlaEind(l, fouten, k.eind);
    },
  };
}

/* --- de korte uitleg bij "Kun je dit al? Nee" --- */

async function uitlegDigi(l: Lesgids) {
  zet(l, { ...LEEG, sleutel: nieuw(), boven: [D("08:00", "blauw")] });
  await wijs(l, ["b0"], "Dit is een digitale klok.", "Er staan vier cijfers op.");
  await l.zeg("In het midden staan twee puntjes boven elkaar.", "Dat heet een dubbele punt.");
  await l.zeg("Vóór de dubbele punt staat het uur: nul {8}.", "Na de dubbele punt staan de minuten: nul nul.", "Het is dus precies {8} uur.");
  zet(l, { licht: [] });
}

async function uitlegHeel(l: Lesgids) {
  const t = U(3);
  zet(l, { ...LEEG, sleutel: nieuw(), boven: [W(t, "blauw", "min")] });
  await wijs(l, ["b0"], "Dit is een wijzerklok.", "De lange wijzer is de grote wijzer.", "Bij een heel uur staat hij op de {12}.");
  zet(l, { boven: [W(t, "blauw", "uur")] });
  await l.zeg("De korte wijzer is de kleine wijzer.", "Die wijst het uur aan.", "Hier wijst hij naar de {3}.", "Het is dus {3} uur.");
  zet(l, { boven: [W(t, "blauw")], licht: [] });
}

async function uitlegHalf(l: Lesgids) {
  const t = H(5);
  zet(l, { ...LEEG, sleutel: nieuw(), boven: [W(t, "oranje", "min")] });
  await wijs(l, ["b0"], "Kijk naar de grote wijzer.", "Bij half staat hij op de {6}.");
  zet(l, { boven: [W(t, "oranje", "uur")] });
  await l.zeg("De kleine wijzer staat tussen de {4} en de {5}.", "Hij is al halverwege naar de {5}.", "Daarom heet het half {5}.");
  zet(l, { boven: [W(t, "oranje")], licht: [] });
}

async function uitlegBeide(l: Lesgids) {
  await uitlegHeel(l);
  zet(l, { ...LEEG, sleutel: nieuw(), boven: [W(U(3), "blauw"), D("03:00", "oranje")] });
  await wijs(l, ["b1"], "Op een digitale klok staat dezelfde tijd zo.", "Nul {3}, dan een dubbele punt, dan nul nul.", "Allebei de klokken zeggen {3} uur.");
  zet(l, { licht: [] });
}

async function uitlegRekenen(l: Lesgids) {
  zet(l, { ...LEEG, sleutel: nieuw(), boven: [W(U(2), "groen")] });
  await wijs(l, ["b0"], "Nu is het {2} uur.");
  zet(l, { boven: [W(U(3), "groen", "uur")] });
  await l.zeg("Een uur later is de kleine wijzer één getal verder.", "Dan is het {3} uur.");
  zet(l, { boven: [W(H(4), "groen", "min")] });
  await l.zeg("Nog een half uur later draait de grote wijzer een half rondje.", "Dan is het half {4}.");
  zet(l, { boven: [W(H(4), "groen")], licht: [] });
}

async function uitlegOchtend(l: Lesgids) {
  await uitlegDigi(l);
  zet(l, { ...LEEG, sleutel: nieuw(), boven: [D("13:00", "oranje")] });
  await wijs(l, ["b0"], "Na {12} uur telt een digitale klok gewoon verder.", "{13}, {14}, {15}.", "Staat er meer dan {12} vóór de dubbele punt? Dan is het middag.");
  zet(l, { licht: [] });
}

const WELKOM_VINK = ["Klopt het? Tik dan op het vinkje.", "Klopt het niet? Tik dan op het kruisje."];

/* =====================================================================
   De digitale klok (16839)
   ===================================================================== */

/** Hoeveel cijfers staan er op deze digitale klok? */
function hoeveelCijfers(tekst: string, opties: string[], zin: string[]): Opgave {
  return (l, terug) => {
    const boven = [D(tekst, kleurRij(1)[0])];
    const [voor, achter] = tekst.split(":");
    const cijfers = (s: string) => [...s].map((c) => (c === "0" ? "nul" : `{${c}}`)).join(", ");
    return knopVraag(
      l,
      {
        boven,
        opties,
        goed: "4",
        vraag: zin,
        goedZin: [`Er staan vier cijfers op: ${cijfers(voor + achter)}.`, "Op een digitale klok staan altijd vier cijfers."],
        samen: async () => {
          await wijs(l, ["b0"], "We tellen samen.", `Vóór de dubbele punt: ${cijfers(voor)}. Dat zijn er twee.`, `Na de dubbele punt: ${cijfers(achter)}. Dat zijn er ook twee.`, "Twee en nog twee. Hoeveel is dat?");
        },
        tip: ["Tel ook de nullen mee."],
      },
      terug,
    );
  };
}

const digitaal1 = klokles({
  id: "squla-klok-digitaal-1",
  titel: "De digitale klok",
  oefening: "De digitale klok",
  level: 1,
  voorwerpen: ["oven", "zandloper", "telefoon", "laptop"],
  start: D("12:00", "groen"),
  welkom: ["Hoi!", "Je kent de klok met wijzers al.", "Er zijn ook klokken zonder wijzers.", "Daar staan alleen cijfers op.", "Dat heet een digitale klok."],
  uitleg: uitlegDigi,
  opgaven: [
    (l, terug) =>
      kiesVraag(
        l,
        {
          boven: [D("06:00", "roze")],
          keuzes: [V("oven", "05:00"), W(U(3), "blauw"), V("zandloper")],
          goed: 0,
          vraag: ["Kijk eens. Dit is een digitale klok.", "Waar zie je ook een digitale klok?"],
          goedZin: ["Op de oven staat ook een digitale klok.", "Je ziet cijfers met twee puntjes ertussen."],
          noem: (i) => ["De oven", "Die klok", "De zandloper"][i],
          samen: async (l, k) => {
            await l.zeg("Een digitale klok heeft geen wijzers.", "Je ziet alleen cijfers, met twee puntjes in het midden.");
            for (let i = 0; i < 3; i++) {
              const d = k.keuzes[i];
              const zin = d.t === "wijzer" ? "Deze klok heeft wijzers." : d.t === "vw" && d.naam === "oven" ? "Kijk naar de oven. Wat staat er bovenop?" : "In de zandloper zit zand.";
              await wijs(l, [`k${i}`], zin);
            }
            zet(l, { licht: [] });
            await l.zeg("Waar zie je cijfers met twee puntjes?");
          },
          tip: ["Zoek cijfers met twee puntjes ertussen."],
        },
        terug,
      ),
    hoeveelCijfers("06:00", ["10", "4", "6"], ["Hier is nog een digitale klok.", "Hoeveel cijfers staan erop?", "Let op: ook de {0} telt mee."]),
    (l, terug) =>
      kiesVraag(
        l,
        {
          boven: [V("telefoon", "05:00")],
          keuzes: [Tk("?"), Tk(":"), Tk("!")],
          goed: 1,
          vraag: ["Op een telefoon staat ook een digitale klok.", "Welk teken staat tussen de cijfers?"],
          goedZin: ["Tussen de cijfers staan twee puntjes boven elkaar.", "Dat heet een dubbele punt."],
          noem: (i) => ["Het vraagteken", "De dubbele punt", "Het uitroepteken"][i],
          samen: async (l, k) => {
            await wijs(l, ["b0"], "Kijk goed naar het midden van de klok.", "Hoeveel puntjes zie je daar?");
            for (let i = 0; i < 3; i++) {
              const t = k.keuzes[i].t === "teken" ? (k.keuzes[i] as { tekst: string }).tekst : "";
              if (t === "?") await wijs(l, [`k${i}`], "Dit is een vraagteken: een krul met een puntje.");
              if (t === "!") await wijs(l, [`k${i}`], "Dit is een uitroepteken: een streep met een puntje.");
            }
            zet(l, { licht: [] });
            await l.zeg("Welk teken heeft twee puntjes boven elkaar?");
          },
          tip: ["Zoek twee puntjes boven elkaar."],
        },
        terug,
      ),
    (l, terug) =>
      kiesVraag(
        l,
        {
          boven: [D("10:00", "groen")],
          keuzes: [Tk("0"), Tk("10"), Tk(":")],
          goed: 1,
          vraag: ["Welk getal staat vóór de dubbele punt?"],
          goedZin: ["Vóór de dubbele punt staat {10}.", "Dat is het uur. Het is {10} uur."],
          noem: (i) => ["{0}", "{10}", "De dubbele punt"][i],
          samen: async (l) => {
            await wijs(l, ["b0"], "Zoek eerst de dubbele punt in het midden.", "Vóór betekent: aan de linkerkant.", "Welke cijfers staan links van de twee puntjes?");
          },
          tip: ["Kijk links van de dubbele punt."],
        },
        terug,
      ),
    (l, terug) =>
      knopVraag(
        l,
        {
          boven: [V("laptop", "04:00")],
          opties: ["0", "4", "10"],
          goed: "0",
          vraag: ["Op een laptop staat ook een klok.", "Na de dubbele punt staan de minuten.", "Hoeveel minuten zie je?"],
          goedZin: ["Na de dubbele punt staat nul nul. Dat is {0} minuten.", "Het is precies {4} uur."],
          samen: async () => {
            await wijs(l, ["b0"], "Zoek de dubbele punt.", "Na betekent: aan de rechterkant.", "Welke cijfers staan rechts van de twee puntjes?");
          },
          tip: ["Kijk rechts van de dubbele punt."],
        },
        terug,
      ),
    sleepCijfers(6, [2, 1, 0]),
    kiesDigi(5, ["06:00", "05:00", "55:55"]),
    kiesDigi(12, ["11:00", "10:00", "12:00"], { goedZin: ["Hier staat {12} vóór de dubbele punt.", "Om {12} uur is het midden van de dag."] }),
    verbind(
      [
        [D("02:00", "blauw"), Tx("2 uur")],
        [D("10:00", "oranje"), Tx("10 uur")],
        [D("07:00", "groen"), Tx("7 uur")],
      ],
      [2, 0, 1],
      ["Wat hoort bij elkaar?", "Tik op een klok.", "Tik dan op de tijd die erbij hoort."],
      ["Alles is verbonden.", "Je kunt al digitaal klokkijken!"],
    ),
    hoeveelCijfers("10:00", ["2", "3", "4"], ["Hoeveel cijfers staan er op deze klok?"]),
    sleepCijfers(9, [1, 2, 0]),
    kiesDigi(1, ["01:00", "10:00", "11:11"]),
  ],
  reserve: [1, 3, 6],
  eind: "Je kunt een digitale klok lezen.",
});

/* --- level 2: een dag bij de bakkerij (in plaats van een bakker: de bakkerij zelf, de oven en de bezorgbus) --- */

const digitaal2 = klokles({
  id: "squla-klok-digitaal-2",
  titel: "De digitale klok (moeilijker)",
  oefening: "De digitale klok",
  level: 2,
  voorwerpen: ["bakkerij", "maan", "deegkom", "oven", "bus", "taart"],
  start: V("bakkerij"),
  welkom: ["Hoi!", "Vandaag kijken we bij de bakkerij.", "Daar gebeurt alles op tijd.", "Zoek steeds de goede digitale klok."],
  uitleg: uitlegDigi,
  opgaven: [
    kiesDigi(9, ["06:00", "09:00", "00:09"], { boven: [V("bakkerij")], zin: ["Dit is de bakkerij.", "De winkel gaat om {9} uur open.", "Op welke klok is het {9} uur?"], goedZin: ["{9} uur is nul {9}, dubbele punt, nul nul.", "Vóór de dubbele punt staat het uur."] }),
    kiesDigi(4, ["06:00", "04:00", "09:00"], { boven: [V("maan")], zin: ["Het is nog nacht. De maan schijnt.", "Om {4} uur gaat de oven van de bakkerij al aan.", "Op welke klok is het {4} uur?"], goedZin: ["Dat is vroeg!", "Om {4} uur is het buiten nog donker."] }),
    (l, terug) =>
      knopVraag(
        l,
        {
          boven: [V("deegkom"), D("05:00", "blauw")],
          opties: ["5 uur", "5 broodjes", "6 uur"],
          goed: "5 uur",
          vraag: ["Het deeg voor de broodjes is klaar.", "Kijk op de klok.", "Hoe laat is het?"],
          goedZin: ["Het is {5} uur.", "Nu mag het deeg even rusten."],
          samen: async (l, b) => {
            await l.zeg("De klok zegt niet hoeveel broodjes er zijn.", "De klok zegt hoe laat het is.");
            await samenLeesDigi(l, b.length - 1);
          },
          tip: ["De klok zegt hoe laat het is."],
        },
        terug,
      ),
    hoeLang(6, 7, ["1 uur", "7 uur", "2 uur"], ["De broodjes gaan om {6} uur de oven in.", "Om {7} uur zijn ze klaar.", "Hoe lang staan de broodjes in de oven?"], "de broodjes"),
    kiesDigi(8, ["08:00", "10:00", "03:00"], { boven: [V("bus")], zin: ["De bezorgbus staat al voor de deur.", "Hij komt broodjes halen.", "Maar de winkel is nog dicht. Het is pas {8} uur.", "Op welke klok is het {8} uur?"], goedZin: ["Het is {8} uur.", "De winkel gaat pas om {9} uur open."] }),
    kiesDigi(10, ["01:00", "10:00", "00:10"], { boven: [V("oven")], zin: ["De taarten staan nog in de oven.", "Ze zijn om {10} uur klaar.", "Op welke klok is het {10} uur?"], goedZin: ["Om {10} uur zijn de taarten klaar.", "Dat ruikt lekker!"] }),
    memory(
      [
        [Tx("3 uur"), D("03:00", "groen")],
        [Tx("12 uur"), D("12:00", "roze")],
        [Tx("5 uur"), D("05:00", "paars")],
      ],
      ["Wat hoort bij elkaar?", "Kijk goed, straks gaan de bolletjes dicht.", "Zoek steeds twee die bij elkaar horen."],
      ["Je hebt alle paren gevonden!"],
    ),
    (l, terug) =>
      knopVraag(
        l,
        {
          boven: [V("taart"), D("11:00", "oranje")],
          opties: ["11 uur", "1 uur", "12 uur"],
          goed: "11 uur",
          vraag: ["De taarten zijn heel lekker.", "Ze zijn snel op.", "Kijk op de klok. Hoe laat zijn de taarten op?"],
          goedZin: ["Om {11} uur zijn de taarten op.", "Vóór de dubbele punt staat {11}."],
          samen: async (l, b) => samenLeesDigi(l, b.length - 1),
          tip: ["Kijk naar het getal vóór de dubbele punt."],
        },
        terug,
      ),
    kiesDigi(12, ["12:21", "12:00", "21:00"], { boven: [V("bus")], zin: ["De bezorgbus komt terug.", "Nu zijn de broodjes wel klaar.", "Hij komt om {12} uur.", "Op welke klok is het {12} uur?"], goedZin: ["Om {12} uur haalt de bus de broodjes op.", "Tot de volgende keer!"] }),
    kiesDigi(6, ["06:06", "06:00", "00:06"], { zin: ["De bakkerij is dicht.", "We oefenen nog even.", "Op welke digitale klok is het {6} uur?"] }),
    (l, terug) =>
      knopVraag(
        l,
        {
          boven: [D("08:00", "paars")],
          opties: ["8 uur", "8 taarten", "9 uur"],
          goed: "8 uur",
          vraag: ["Kijk op de klok.", "Hoe laat is het?"],
          goedZin: ["Het is {8} uur."],
          samen: async (l) => samenLeesDigi(l, 0),
          tip: ["De klok zegt hoe laat het is."],
        },
        terug,
      ),
    hoeLang(1, 2, ["2 uur", "1 uur", "3 uur"], ["De koekjes gaan om {1} uur de oven in.", "Om {2} uur zijn ze klaar.", "Hoe lang staan de koekjes in de oven?"], "de koekjes"),
  ],
  reserve: [2, 5, 3],
  eind: "Je kunt de digitale klok lezen in een verhaal.",
});

/* =====================================================================
   Hoe laat is het? (15822) — een plantje in de kas (in plaats van de egelopvang)
   ===================================================================== */

const hoelaat1 = klokles({
  id: "squla-klok-hoelaat-1",
  titel: "Hoe laat is het?",
  oefening: "Hoe laat is het?",
  level: 1,
  voorwerpen: ["gieter", "lampje", "plant", "bloem", "zon", "maan"],
  start: V("plant"),
  welkom: ["Hoi!", "In de kas staat een plantje.", "Help jij het plantje verzorgen?", "Dan houden we samen de tijd bij."],
  uitleg: uitlegHeel,
  opgaven: [
    leesKlok(U(2), [U(2), U(8), U(10)], { ding: "gieter", zin: ["Hoe laat krijgt het plantje water?"], weetje: ["Een plantje heeft water nodig om te groeien."] }),
    leesKlok(U(11), [U(11), U(9), U(12)], { ding: "lampje", zin: ["Hoe laat gaat het lampje in de kas uit?"], weetje: ["In het donker rust het plantje uit."] }),
    leesKlok(U(5), [U(4), U(5), U(6)], { ding: "gieter", zin: ["Hoe laat krijgt het plantje weer water?"], weetje: ["Niet te veel water geven, hoor."] }),
    leesKlok(U(8), [U(8), U(9), U(1)], { ding: "zon", zin: ["Hoe laat schijnt de zon in de kas?"], weetje: ["Een plantje groeit naar het licht toe."] }),
    leesDigi(10, [10, 6, 8], { ding: "plant", zin: ["Het plantje krijgt een grotere pot.", "Hoe laat is dat?"], weetje: ["In een grote pot hebben de wortels meer ruimte."] }),
    leesKlok(U(7), [U(7), U(11), U(6)], { ding: "lampje", zin: ["Hoe laat gaat het lampje weer aan?"] }),
    leesKlok(U(9), [U(9), U(3), U(10)], { ding: "bloem", zin: ["Hoe laat gaat de bloem open?"], weetje: ["Veel bloemen gaan open als het licht wordt."] }),
    leesKlok(U(12), [U(12), U(1), U(2)], { ding: "gieter", zin: ["Hoe laat krijgt het plantje water?"] }),
    leesKlok(U(1), [U(1), U(7), U(12)], { ding: "maan", zin: ["Het is nacht in de kas.", "Hoe laat is het nu?"] }),
    leesDigi(4, [4, 2, 5], { ding: "plant", zin: ["We draaien het plantje naar het licht.", "Hoe laat is dat?"] }),
    leesKlok(U(3), [U(3), U(9), U(4)], { ding: "zon", zin: ["Hoe laat schijnt de zon weer?"] }),
    leesKlok(U(6), [U(6), U(5), U(12)], { ding: "gieter", zin: ["Hoe laat krijgt het plantje water?"] }),
  ],
  reserve: [0, 2, 6],
  eind: "Je kunt hele uren lezen op de klok.",
});

const hoelaat2 = klokles({
  id: "squla-klok-hoelaat-2",
  titel: "Hoe laat is het? (moeilijker)",
  oefening: "Hoe laat is het?",
  level: 2,
  voorwerpen: ["plant", "gieter", "mand", "zon", "bloem"],
  start: V("plant"),
  welkom: ["Hoi!", "De plantjes in de kas zijn gegroeid.", "Vandaag gaan ze naar buiten, om te wennen.", "Nu kijken we op een digitale klok."],
  uitleg: uitlegOchtend,
  opgaven: [
    leesDigi(7, [6, 7, 8], { ding: "plant", zin: ["Hoe laat is het nu?"] }),
    leesDigi(9, [9, 10, 12], { ding: "gieter", zin: ["Hoe laat krijgen de plantjes water?"], weetje: ["Water geef je het liefst in de ochtend."] }),
    leesDigi(10, [10, 11, 2], { ding: "mand", zin: ["De plantjes gaan in de mand naar buiten.", "Hoe laat is dat?"] }),
    leesDigi(11, [11, 10, 1], { ding: "zon", zin: ["Hoe laat schijnt de zon op de plantjes?"] }),
    ochtendMiddag(14, ["De plantjes gaan weer naar binnen."], "bloem"),
    leesDigi(8, [8, 6, 9], { ding: "bloem", zin: ["Hoe laat gaat de eerste bloem open?"] }),
    leesDigi(12, [12, 2, 11], { ding: "gieter", zin: ["Hoe laat krijgen de plantjes weer water?"] }),
    ochtendMiddag(9, ["De zon schijnt al."], "zon"),
    leesDigi(6, [6, 7, 9], { ding: "mand", zin: ["Hoe laat staat de mand klaar?"] }),
    ochtendMiddag(15, ["De plantjes krijgen water."], "gieter"),
    ochtendMiddag(13, ["De plantjes staan in de zon."], "zon"),
    ochtendMiddag(11, ["De mand gaat naar buiten."], "mand"),
  ],
  reserve: [4, 1, 7],
  eind: "Je kunt de digitale klok lezen, ook na {12} uur.",
});

const hoelaat3 = klokles({
  id: "squla-klok-hoelaat-3",
  titel: "Hoe laat is het? (nog moeilijker)",
  oefening: "Hoe laat is het?",
  level: 3,
  voorwerpen: ["plant", "bloem", "gieter", "zon", "maan"],
  start: V("plant"),
  welkom: ["Hoi!", "De plantjes zijn groot genoeg.", "Ze gaan buiten in de grond.", "Kijk steeds goed op de klok."],
  uitleg: uitlegBeide,
  opgaven: [
    leesKlok(U(10), [U(9), U(10), U(11)], { ding: "plant", zin: ["Hoe laat gaat het eerste plantje de grond in?"] }),
    leesDigi(11, [11, 12, 10], { ding: "plant", zin: ["Hoe laat gaat het volgende plantje de grond in?"] }),
    ochtendMiddag(10, ["Dit plantje gaat ook de grond in."], "plant"),
    leesKlok(U(12), [U(12), U(1), U(11)], { ding: "gieter", zin: ["Alle plantjes staan buiten.", "Hoe laat krijgen ze water?"] }),
    (l, terug) =>
      kiesVraag(
        l,
        {
          keuzes: [V("plant"), V("bloem")],
          goed: 1,
          vraag: ["Op welk plaatje heeft het plantje al een bloem?"],
          goedZin: ["Hier zie je een rode bloem."],
          noem: (i) => ["Dat plantje", "Die bloem"][i],
          samen: async (l, k) => {
            for (let i = 0; i < 2; i++) await wijs(l, [`k${i}`], (k.keuzes[i] as { naam: string }).naam === "plant" ? "Hier zie je groene blaadjes." : "Hier zie je iets roods.");
            zet(l, { licht: [] });
            await l.zeg("Een bloem is rood, geel of paars.", "Welk plaatje heeft een bloem?");
          },
          tip: ["Zoek iets met een kleurtje."],
        },
        terug,
      ),
    leesKlok(U(2), [U(1), U(2), U(3)], { ding: "gieter", zin: ["Hoe laat krijgen ze weer water?"] }),
    ochtendMiddag(15, ["De plantjes krijgen nog wat water."], "gieter"),
    leesKlok(U(4), [U(4), U(5), U(8)], { ding: "bloem", zin: ["Hoe laat gaat de bloem dicht?"] }),
    (l, terug) =>
      kiesVraag(
        l,
        {
          keuzes: [V("maan"), V("zon")],
          goed: 1,
          vraag: ["Plantjes groeien in het licht.", "Op welk plaatje is het dag?"],
          goedZin: ["Overdag schijnt de zon."],
          noem: (i) => ["De maan", "De zon"][i],
          samen: async (l) => {
            await l.zeg("De maan zie je meestal 's nachts.", "De zon zie je overdag.");
          },
          tip: ["Wat zie je overdag aan de lucht?"],
        },
        terug,
      ),
    leesDigi(9, [9, 6, 8], { ding: "plant", zin: ["Hoe laat is het nu?"] }),
    leesKlok(U(11), [U(11), U(12), U(10)], { ding: "zon", zin: ["Hoe laat is het nu?"] }),
    ochtendMiddag(8, ["De bloemen gaan open."], "bloem"),
  ],
  reserve: [0, 2, 4],
  eindZin: ["Dag plantjes!", "Groei maar goed."],
  eind: "Je kunt de klok lezen, met wijzers en met cijfers.",
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
  welkom: ["Hoi!", "We gaan klokkijken.", "Je ziet steeds een klok.", "Ik zeg hoe laat het is.", ...WELKOM_VINK],
  uitleg: uitlegHeel,
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
  welkom: ["Hoi!", "Ik zeg een tijd.", "Kies jij de klok die erbij hoort?"],
  uitleg: uitlegHeel,
  opgaven: [
    kiesKlok(U(2), [U(7), U(2)]),
    kiesKlok(U(5), [U(5), U(11)]),
    kiesKlok(U(10), [U(8), U(10)]),
    kiesKlok(U(4), [U(4), U(6)]),
    kiesKlok(U(3), [U(9), U(3)]),
    kiesKlok(U(12), [U(12), U(6)]),
    tijdNaarKlok(U(7), [U(7), U(5)], ["De bakkerij gaat om {7} uur dicht."]),
    tijdNaarKlok(U(10), [U(11), U(10)], ["De bus vertrekt om {10} uur."]),
    tijdNaarKlok(U(4), [U(4), U(3)], ["Het raketje vertrekt om {4} uur."]),
    tijdNaarKlok(U(8), [U(6), U(8)], ["Om {8} uur gaat het lampje uit."]),
    tijdNaarKlok(U(1), [U(1), U(11)], ["Om {1} uur 's nachts schijnt de maan."]),
    tijdNaarKlok(U(5), [U(7), U(5)], ["De taart is om {5} uur klaar."]),
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
  welkom: ["Hoi!", "Kijk goed naar de kleine wijzer.", "Die zegt hoe laat het is."],
  uitleg: uitlegHeel,
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

/** Memory met drie paren dezelfde klokken. */
function memoryKlokken(uren: number[]): Opgave {
  return (l, terug) => {
    const kl = kleurRij(3);
    return memory(
      uren.map((u, i) => [W(U(u), kl[i]), W(U(u), kl[i])] as [Ding, Ding]),
      ["Op welke klokken is het even laat?", "Kijk goed, straks gaan de bolletjes dicht.", "Zoek steeds twee klokken die even laat zijn."],
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
  welkom: ["Hoi!", "We gaan klokken vergelijken.", "Kijk steeds goed naar de kleine wijzer."],
  uitleg: uitlegHeel,
  opgaven: [
    kiesKlok(U(2), [U(7), U(2)]),
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
  welkom: ["Hoi!", "Soms zeg ik hoe laat het is.", ...WELKOM_VINK, "En soms kies je zelf de goede klok."],
  uitleg: uitlegHeel,
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
  welkom: ["Hoi!", "Let goed op.", "Sommige klokken lijken veel op elkaar.", "Kijk dus goed waar de kleine wijzer naar wijst."],
  uitleg: uitlegHeel,
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
  start: D("09:00", "blauw"),
  welkom: ["Hoi!", "Er zijn klokken met wijzers.", "En er zijn digitale klokken.", "Vandaag oefen je ze allebei."],
  uitleg: uitlegBeide,
  opgaven: [
    kiesDigi(9, ["08:00", "09:00", "07:00"]),
    leesKlok(U(8), [U(8), U(6), U(2)]),
    kiesDigi(2, ["12:00", "02:00", "01:00"]),
    leesKlok(U(11), [U(11), U(12), U(5)]),
    kiesDigi(5, ["04:00", "05:00", "03:00"]),
    leesKlok(U(3), [U(3), U(4), U(9)]),
    kiesDigi(6, ["09:00", "06:00", "05:00"]),
    leesKlok(U(9), [U(9), U(10), U(8)]),
    kiesDigi(1, ["01:00", "10:00", "11:00"]),
    leesKlok(U(4), [U(4), U(2), U(7)]),
    kiesDigi(7, ["07:00", "01:00", "09:00"]),
    leesKlok(U(12), [U(12), U(1), U(6)]),
  ],
  reserve: [0, 1, 4],
  eind: "Je kunt allebei de klokken lezen.",
});

const klokkijken2b = klokles({
  id: "squla-klok-klokkijken2-2",
  titel: "Klokkijken 2 (moeilijker)",
  oefening: "Klokkijken 2",
  level: 2,
  voorwerpen: [],
  start: W(U(3), "oranje"),
  welkom: ["Hoi!", "Nu zoek je klokken die even laat zijn.", "Een wijzerklok en een digitale klok."],
  uitleg: uitlegBeide,
  opgaven: [
    tijdNaarKlok(U(8), [U(8), U(9)], ["De bus vertrekt om {8} uur."]),
    wijzerNaarDigi(2, ["02:00", "12:00", "10:00"]),
    tijdNaarKlok(U(5), [U(5), U(3)], ["De bakkerij gaat om {5} uur dicht."]),
    wijzerNaarDigi(6, ["06:00", "12:00", "07:00"]),
    tijdNaarKlok(U(10), [U(12), U(10)], ["Het raketje landt om {10} uur."]),
    wijzerNaarDigi(9, ["03:00", "09:00", "08:00"]),
    tijdNaarKlok(U(7), [U(7), U(5)], ["Om {7} uur gaat het lampje uit."]),
    wijzerNaarDigi(11, ["01:00", "11:00", "10:00"]),
    tijdNaarKlok(U(3), [U(1), U(3)], ["Om {3} uur 's nachts schijnt de maan."]),
    wijzerNaarDigi(4, ["04:00", "08:00", "05:00"]),
    tijdNaarKlok(U(12), [U(12), U(6)], ["De taart is om {12} uur klaar."]),
    wijzerNaarDigi(1, ["01:00", "11:00", "02:00"]),
  ],
  reserve: [1, 5, 2],
  eind: "Je ziet welke klokken even laat zijn.",
});

const klokkijken2c = klokles({
  id: "squla-klok-klokkijken2-3",
  titel: "Klokkijken 2 (nog moeilijker)",
  oefening: "Klokkijken 2",
  level: 3,
  voorwerpen: [],
  start: D("12:00", "paars"),
  welkom: ["Hoi!", "Nu liggen de tijden dicht bij elkaar.", "Kijk dus heel goed."],
  uitleg: uitlegBeide,
  opgaven: [
    kiesDigi(6, ["06:00", "08:00", "05:00"]),
    wijzerNaarDigi(8, ["08:00", "06:00", "10:00"]),
    kiesDigi(7, ["09:00", "07:00", "12:00"]),
    wijzerNaarDigi(5, ["07:00", "05:00", "04:00"]),
    kiesDigi(9, ["09:00", "06:00", "11:00"]),
    wijzerNaarDigi(10, ["10:00", "02:00", "12:00"]),
    kiesDigi(11, ["11:00", "01:00", "10:00"]),
    wijzerNaarDigi(12, ["12:00", "06:00", "11:00"]),
    kiesDigi(8, ["08:00", "09:00", "07:00"]),
    wijzerNaarDigi(6, ["06:00", "12:00", "05:00"]),
    kiesDigi(12, ["12:00", "02:00", "10:00"]),
    wijzerNaarDigi(7, ["07:00", "05:00", "08:00"]),
  ],
  reserve: [1, 3, 5],
  eind: "Je kunt wijzerklokken en digitale klokken lezen.",
});

/* =====================================================================
   Klokkijken 3 (6935) — halve uren
   ===================================================================== */

const halfuur1 = klokles({
  id: "squla-klok-klokkijken3-1",
  titel: "Halve uren",
  oefening: "Klokkijken 3",
  level: 1,
  voorwerpen: [],
  start: W(H(5), "oranje"),
  welkom: ["Hoi!", "Vandaag oefenen we halve uren.", "Bij half staat de grote wijzer op de {6}."],
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
  titel: "Halve uren (moeilijker)",
  oefening: "Klokkijken 3",
  level: 2,
  voorwerpen: [],
  start: W(H(9), "groen"),
  welkom: ["Hoi!", "We oefenen weer halve uren.", "Aan het eind komt er iets nieuws: bijna half."],
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
  titel: "Halve uren (nog moeilijker)",
  oefening: "Klokkijken 3",
  level: 3,
  voorwerpen: [],
  start: W(U(6), "paars"),
  welkom: ["Hoi!", "Nu komen hele en halve uren door elkaar.", "En je zet klokken op volgorde."],
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

const r = (op: Opgave, nu: T, soort: "uur later" | "half later" | "uur eerder") => metRekenUitleg(op, nu, soort);
const reken = (ding: string, nu: T, soort: "uur later" | "half later" | "uur eerder", tijden: T[], context: string) => r(tijdRekenen(ding, nu, soort, tijden, context), nu, soort);

const halfuur4 = klokles({
  id: "squla-klok-klokkijken3-4",
  titel: "Halve uren: later en eerder",
  oefening: "Klokkijken 3",
  level: 4,
  voorwerpen: ["schoolbord", "bed", "oven", "bus", "raketje", "taart", "kampvuur", "voetbal", "lampje", "treintje", "gieter"],
  start: W(U(2), "groen"),
  welkom: ["Hoi!", "Vandaag rekenen we met de klok.", "Hoe laat is het straks?", "En hoe laat was het net?"],
  uitleg: uitlegRekenen,
  opgaven: [
    reken("schoolbord", U(9), "uur later", [U(10), U(11), U(8)], "De school is begonnen."),
    reken("bed", H(8), "half later", [U(8), H(9), U(7)], "Het bedje is klaar. Het is bijna bedtijd."),
    reken("oven", H(3), "uur later", [H(4), U(4), H(3)], "De oven is aan."),
    reken("bus", U(4), "uur later", [U(5), U(3), H(5)], "De bus staat bij de halte."),
    reken("raketje", U(11), "half later", [H(12), U(12), H(11)], "Het raketje staat klaar."),
    reken("taart", U(7), "uur eerder", [H(7), U(6), U(8)], "De taart is net klaar."),
    reken("kampvuur", H(9), "uur eerder", [H(8), U(9), H(10)], "Het kampvuur brandt."),
    reken("voetbal", H(6), "uur eerder", [H(5), H(7), U(5)], "De voetbal ligt klaar in het gras."),
    reken("lampje", U(12), "uur eerder", [U(11), U(1), H(12)], "Het lampje gaat uit."),
    reken("treintje", H(11), "uur eerder", [H(10), H(12), U(10)], "Het treintje rijdt rondjes."),
    reken("gieter", U(2), "half later", [H(3), U(3), H(2)], "De plantjes krijgen water."),
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
