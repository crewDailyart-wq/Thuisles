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
  if (doel.m === 0 && !gemengd) await l.zeg("Bij een heel uur staat de grote wijzer op de {12:paars}.", "De kleine wijzer wijst het uur aan.");
  else if (doel.m === 30 && !gemengd) await l.zeg("Bij half staat de grote wijzer op de {6:paars}.", "De kleine wijzer staat dan tussen twee getallen.");
  else if (doel.m === 25) await l.zeg("Bij bijna half staat de grote wijzer net vóór de {6:paars}.", "Kijk dan naar de kleine wijzer.");
  else await l.zeg("Kijk naar allebei de wijzers.", "Staat de grote wijzer op de {12:paars}? Dan is het een heel uur.", "Staat hij op de {6:paars}? Dan is het half.");
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

/** Samen één wijzerklok lezen (de klok staat bovenaan als `b<i>`). */
async function samenLees(l: Lesgids, t: T, boven: Ding[], i: number) {
  const zetN = (n?: "uur" | "min") => zet(l, { boven: boven.map((d, j) => (j === i ? metNadruk(d, n) : d)) });
  zetN("min");
  if (t.m === 0) {
    await wijs(l, [`b${i}`], "Kijk eerst naar de grote wijzer.", "Die staat op de {12:paars}.", "Dan is het een heel uur.");
    zetN("uur");
    await l.zeg("Kijk nu naar de kleine wijzer.", "Naar welk getal wijst hij?");
  } else {
    await wijs(l, [`b${i}`], "Kijk eerst naar de grote wijzer.", "Die staat op de {6:paars}.", "Dan is het half.");
    zetN("uur");
    await l.zeg(`De kleine wijzer staat tussen de {${t.u}:oranje} en de {${na(t)}:oranje}.`, "Bij half noem je het getal waar hij naartoe gaat.");
  }
  zetN(undefined);
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
          await l.zeg(`Klopt ${spreek(gezegd)}?`, "Klopt het, dan is het goed.", "Klopt het niet, dan is het fout.");
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
        samen: async (l) => {
          await wijs(l, ["b0"], `Om {${van}:oranje} uur gaan ${wat} de oven in.`);
          await wijs(l, ["b1"], `Om {${tot}:oranje} uur komen ze eruit.`);
          zet(l, { licht: [] });
          await l.zeg(`Tel van {${van}:oranje} uur verder tot {${tot}:oranje} uur.`, "Hoeveel uur is dat?");
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
    const boven = [V(ding, t)];
    return knopVraag(
      l,
      {
        boven,
        opties: opties.map(woord),
        goed: woord(t),
        vraag: zin,
        goedZin: [`Het is ${spreek(t)}.`, ...weetje],
        samen: async (l) => {
          await wijs(l, ["b0"], "Kijk naar het klokje.", "Kijk eerst naar de grote wijzer.", "Dan naar de kleine wijzer.");
          await l.zeg("Naar welk getal wijst de kleine wijzer?");
        },
        tip: ["Kijk naar de kleine wijzer. Naar welk getal wijst hij?"],
      },
      terug,
    );
  };
}

/** Een vraag over de klok zelf: hoeveel wijzers of getallen? Antwoord met knoppen. */
function telOpKlok(t: T, vraag: string[], opties: string[], goed: string, goedZin: string[], uitleg: string[], tip: string): Opgave {
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
        else if (soort === "half later") await l.zeg("Over een half uur draait de grote wijzer een half rondje.", nu.m === 0 ? "Van de {12:paars} naar de {6:paars}." : "Van de {6:paars} naar de {12:paars}.", "De kleine wijzer schuift een klein stukje verder.");
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
      l.vlak<KlokVlakProps>(SqulaKlokVlak, { ...LEEG, sleutel: nieuw(), boven: [k.start] });
      speelLesgeluid("verschijn");
      await squlaBegin(l, {
        welkom: k.welkom,
        uitleg: () => k.uitleg(l),
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
      const fouten = await speelAlles(l, k.opgaven, k.reserve);
      if (k.eindZin) await l.zeg(...k.eindZin);
      await squlaEind(l, fouten, k.eind);
    },
  };
}

/* --- de korte uitleg bij "Kun je dit al? Nee" --- */

async function uitlegHeel(l: Lesgids) {
  const t = U(3);
  zet(l, { ...LEEG, sleutel: nieuw(), boven: [W(t, "blauw", "min")] });
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
  await l.zeg("Een uur later is de kleine wijzer één getal verder.", "Dan is het {3:oranje} uur.");
  zet(l, { boven: [W(H(4), "groen", "min")] });
  await l.zeg("Nog een half uur later draait de grote wijzer een half rondje.", "Dan is het half {4:oranje}.");
  zet(l, { boven: [W(H(4), "groen")], licht: [] });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- bewaard, niet meer gebruikt in het beginscherm
const WELKOM_VINK = ["Klopt het? Tik dan op het vinkje.", "Klopt het niet? Tik dan op het kruisje."];

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
  welkom: ["Een klok heeft twee wijzers en getallen.", "Waar zie je nog meer zo'n klok?"],
  voorbeeld: 0,
  uitleg: uitlegHeel,
  opgaven: [
    (l, terug) =>
      kiesVraag(
        l,
        {
          boven: [W(U(6), "roze")],
          keuzes: [V("zandloper"), V("telefoon", U(5)), V("lampje")],
          goed: 1,
          vraag: ["Kijk eens. Dit is een klok met wijzers.", "Waar zie je ook zo'n klok?"],
          goedZin: ["Op de telefoon staat ook een klok.", "Je ziet een rondje met twee wijzers."],
          noem: (i) => ["De zandloper", "De telefoon", "Het lampje"][i],
          samen: async (l, k) => {
            await l.zeg("Een klok met wijzers is rond.", "Er staan getallen op, en er zijn twee wijzers.");
            for (let i = 0; i < 3; i++) {
              const d = k.keuzes[i];
              const zin = d.t === "vw" && d.naam === "telefoon" ? "Kijk naar de telefoon. Wat zie je op het scherm?" : d.t === "vw" && d.naam === "zandloper" ? "In de zandloper zit zand." : "Dit is een lampje.";
              await wijs(l, [`k${i}`], zin);
            }
            zet(l, { licht: [] });
            await l.zeg("Waar zie je een rondje met twee wijzers?");
          },
          tip: ["Zoek een rondje met twee wijzers."],
        },
        terug,
      ),
    telOpKlok(U(6), ["Hoeveel wijzers heeft deze klok?"], ["2", "12", "6"], "2", ["Een klok heeft twee wijzers.", "Een grote wijzer en een kleine wijzer."], ["We tellen de wijzers.", "Een lange wijzer en een korte wijzer.", "Hoeveel wijzers zijn dat samen?"], "Tel de lange en de korte wijzer."),
    (l, terug) =>
      kiesVraag(
        l,
        {
          boven: [W(U(3), "blauw")],
          keuzes: [Tk("1"), Tk("3"), Tk("9")],
          goed: 1,
          vraag: ["Kijk naar de kleine wijzer.", "Naar welk getal wijst hij?"],
          goedZin: ["De kleine wijzer wijst naar de {3:oranje}.", "Het is {3:oranje} uur."],
          noem: (i) => ["{1:oranje}", "{3:oranje}", "{9:oranje}"][i],
          samen: async (l) => {
            await wijs(l, ["b0"], "De kleine wijzer is de korte wijzer.", "Hij wijst het uur aan.", "Naar welk getal wijst hij?");
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
    telOpKlok(U(10), ["Hoeveel getallen staan er op de klok?"], ["12", "10", "2"], "12", ["Er staan {12} getallen op de klok.", "Van {1} tot en met {12}."], ["We tellen de getallen op de klok.", "Het eerste getal is de {1}.", "Het laatste getal is de {12}."], "Het laatste getal is de {12}."),
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
  uitleg: uitlegHeel,
  opgaven: [
    kiesKlok(U(9), [U(3), U(9), U(6)], { boven: [V("bakkerij")], zin: ["Dit is de bakkerij.", "De winkel gaat om {9:oranje} uur open.", "Op welke klok is het {9:oranje} uur?"], goedZin: ["Het is {9:oranje} uur.", "De kleine wijzer wijst naar de {9:oranje}."] }),
    kiesKlok(U(4), [U(6), U(4), U(9)], { boven: [V("maan")], zin: ["Het is nog nacht. De maan schijnt.", "Om {4:oranje} uur gaat de oven van de bakkerij al aan.", "Op welke klok is het {4:oranje} uur?"], goedZin: ["Dat is vroeg!", "Om {4:oranje} uur is het buiten nog donker."] }),
    (l, terug) =>
      knopVraag(
        l,
        {
          boven: [V("deegkom"), W(U(5), kleurRij(1)[0])],
          opties: ["5 uur", "5 broodjes", "6 uur"],
          goed: "5 uur",
          vraag: ["Het deeg voor de broodjes is klaar.", "Kijk op de klok.", "Hoe laat is het?"],
          goedZin: ["Het is {5:oranje} uur.", "Nu mag het deeg even rusten."],
          samen: async (l, b) => {
            await l.zeg("De klok zegt niet hoeveel broodjes er zijn.", "De klok zegt hoe laat het is.");
            await samenLees(l, U(5), b, b.length - 1);
          },
          tip: ["De klok zegt hoe laat het is."],
        },
        terug,
      ),
    hoeLang(6, 7, ["1 uur", "7 uur", "2 uur"], ["De broodjes gaan om {6:oranje} uur de oven in.", "Om {7:oranje} uur zijn ze klaar.", "Hoe lang staan de broodjes in de oven?"], "de broodjes"),
    kiesKlok(U(8), [U(8), U(10), U(3)], { boven: [V("bezorgbus")], zin: ["De bezorgbus staat al voor de deur.", "Hij komt broodjes halen.", "Maar de winkel is nog dicht. Het is pas {8:oranje} uur.", "Op welke klok is het {8:oranje} uur?"], goedZin: ["Het is {8:oranje} uur.", "De winkel gaat pas om {9:oranje} uur open."] }),
    kiesKlok(U(10), [U(1), U(10), U(2)], { boven: [V("oven")], zin: ["De taarten staan nog in de oven.", "Ze zijn om {10:oranje} uur klaar.", "Op welke klok is het {10:oranje} uur?"], goedZin: ["Om {10:oranje} uur zijn de taarten klaar.", "Dat ruikt lekker!"] }),
    memoryKlokTijd([3, 12, 5]),
    (l, terug) =>
      knopVraag(
        l,
        {
          boven: [V("taart"), W(U(11), kleurRij(1)[0])],
          opties: ["11 uur", "1 uur", "12 uur"],
          goed: "11 uur",
          vraag: ["De taarten zijn heel lekker.", "Ze zijn snel op.", "Kijk op de klok. Hoe laat zijn de taarten op?"],
          goedZin: ["Om {11:oranje} uur zijn de taarten op.", "De kleine wijzer wijst naar de {11:oranje}."],
          samen: async (l, b) => samenLees(l, U(11), b, b.length - 1),
          tip: ["Kijk naar de kleine wijzer."],
        },
        terug,
      ),
    kiesKlok(U(12), [U(1), U(12), U(6)], { boven: [V("bezorgbus")], zin: ["De bezorgbus komt terug.", "Nu zijn de broodjes wel klaar.", "Hij komt om {12:oranje} uur.", "Op welke klok is het {12:oranje} uur?"], goedZin: ["Om {12:oranje} uur haalt de bus de broodjes op.", "De bus rijdt weg met de broodjes."] }),
    kiesKlok(U(6), [U(12), U(6), U(5)], { zin: ["De bakkerij is dicht.", "We oefenen nog even.", "Op welke klok is het {6:oranje} uur?"] }),
    (l, terug) =>
      knopVraag(
        l,
        {
          boven: [W(U(8), kleurRij(1)[0])],
          opties: ["8 uur", "8 taarten", "9 uur"],
          goed: "8 uur",
          vraag: ["Kijk op de klok.", "Hoe laat is het?"],
          goedZin: ["Het is {8:oranje} uur."],
          samen: async (l, b) => samenLees(l, U(8), b, 0),
          tip: ["De klok zegt hoe laat het is."],
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
  welkom: ["De bezorgbus rijdt de hele dag langs de winkels.", "Kijk steeds op de klok: hoe laat is het?"],
  voorbeeld: 0,
  uitleg: uitlegHeel,
  opgaven: [
    leesKlok(U(7), [U(7), U(11), U(6)], { ding: "bezorgbus", zin: ["De bezorgbus staat klaar bij de bakkerij.", "Hoe laat is het?"], weetje: ["Vroeg in de ochtend begint de dag."] }),
    leesKlok(U(8), [U(8), U(9), U(1)], { ding: "bezorgbus", zin: ["De bezorgbus vertrekt.", "Hoe laat is het?"] }),
    leesKlok(U(9), [U(9), U(3), U(10)], { ding: "zon", zin: ["De zon schijnt. De bus rijdt naar de eerste halte.", "Hoe laat is het?"], weetje: ["De zon schijnt overdag."] }),
    leesKlok(U(10), [U(10), U(2), U(11)], { ding: "bezorgbus", zin: ["De bus komt bij de eerste halte.", "Hoe laat is het?"] }),
    leesKlok(U(11), [U(11), U(9), U(12)], { ding: "bakkerij", zin: ["De bus haalt nieuwe broodjes bij de bakkerij.", "Hoe laat is het?"] }),
    leesKlok(U(12), [U(12), U(1), U(6)], { ding: "zon", zin: ["De zon staat hoog. De bus brengt de broodjes weg.", "Hoe laat is het?"] }),
    leesKlok(U(1), [U(1), U(7), U(12)], { ding: "bezorgbus", zin: ["De bus staat weer bij de bakkerij.", "Hoe laat is het?"] }),
    leesKlok(U(2), [U(2), U(10), U(1)], { ding: "bezorgbus", zin: ["De bus rijdt weer weg.", "Hoe laat is het?"] }),
    leesKlok(U(3), [U(3), U(9), U(4)], { ding: "bezorgbus", zin: ["De bus komt bij de tweede halte.", "Hoe laat is het?"] }),
    leesKlok(U(4), [U(4), U(2), U(5)], { ding: "zon", zin: ["De zon staat al lager. De bus rijdt naar huis.", "Hoe laat is het?"] }),
    leesKlok(U(5), [U(5), U(4), U(11)], { ding: "bakkerij", zin: ["De bus is terug bij de bakkerij.", "Hoe laat is het?"] }),
    leesKlok(U(6), [U(6), U(5), U(12)], { ding: "maan", zin: ["Het wordt donker. De maan komt op.", "Hoe laat is het?"], weetje: ["De maan zie je als het donker wordt."] }),
  ],
  reserve: [0, 2, 6],
  eind: "Je kunt hele uren lezen op de klok.",
});

const hoelaat2 = klokles({
  id: "squla-klok-hoelaat-2",
  titel: "Hoe laat is het? (moeilijker)",
  oefening: "Hoe laat is het?",
  level: 2,
  voorwerpen: ["oven", "bezorgbus", "zon", "bakkerij"],
  start: V("bakkerij"),
  welkom: ["In de bakkerij gaat de oven vroeg aan.", "Hoe laat is het op de klok?"],
  voorbeeld: 0,
  uitleg: uitlegHeel,
  opgaven: [
    leesKlok(U(6), [U(6), U(7), U(9)], { ding: "oven", zin: ["De oven in de bakkerij gaat aan.", "Hoe laat is het?"] }),
    leesKlok(U(8), [U(8), U(6), U(9)], { ding: "bezorgbus", zin: ["De bezorgbus laadt de broodjes in.", "Hoe laat is het?"] }),
    leesKlok(U(9), [U(9), U(10), U(12)], { ding: "bezorgbus", zin: ["De bus vertrekt voor de eerste ronde.", "Hoe laat is het?"] }),
    tijdNaarKlok(U(10), [U(10), U(4), U(2)], ["De bus komt om {10:oranje} uur bij de eerste halte."]),
    leesKlok(U(11), [U(11), U(10), U(1)], { ding: "zon", zin: ["De zon schijnt fel. De bus rijdt verder.", "Hoe laat is het?"] }),
    tijdNaarKlok(U(12), [U(12), U(6), U(11)], ["De bus is om {12:oranje} uur terug bij de bakkerij."]),
    leesKlok(U(1), [U(1), U(11), U(2)], { ding: "oven", zin: ["De taarten komen uit de oven.", "Hoe laat is het?"] }),
    tijdNaarKlok(U(2), [U(2), U(8), U(12)], ["De bus vertrekt om {2:oranje} uur voor de tweede ronde."]),
    leesKlok(U(3), [U(3), U(9), U(4)], { ding: "bezorgbus", zin: ["De bus komt bij de laatste halte.", "Hoe laat is het?"] }),
    tijdNaarKlok(U(4), [U(4), U(10), U(2)], ["De bus rijdt om {4:oranje} uur naar huis."]),
    leesKlok(U(5), [U(5), U(7), U(10)], { ding: "zon", zin: ["De zon gaat bijna onder.", "Hoe laat is het?"] }),
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
  uitleg: uitlegHeel,
  opgaven: [
    leesKlok(U(10), [U(9), U(10), U(11)], { ding: "bezorgbus", zin: ["De bus vertrekt voor de laatste ronde.", "Hoe laat is het?"] }),
    leesKlok(U(11), [U(11), U(12), U(10)], { ding: "zon", zin: ["De zon staat bijna op de hoogste plek.", "Hoe laat is het?"] }),
    leesKlok(U(12), [U(12), U(1), U(11)], { ding: "bezorgbus", zin: ["De bus rijdt langs de eerste halte.", "Hoe laat is het?"] }),
    leesKlok(U(2), [U(1), U(2), U(3)], { ding: "zon", zin: ["De zon schijnt. De bus rijdt verder.", "Hoe laat is het?"] }),
    (l, terug) =>
      kiesVraag(
        l,
        {
          keuzes: [V("maan"), V("zon")],
          goed: 1,
          vraag: ["De bus rijdt overdag.", "Op welk plaatje is het dag?"],
          goedZin: ["Overdag schijnt de zon."],
          noem: (i) => ["De maan", "De zon"][i],
          samen: async (l) => {
            await l.zeg("De maan zie je meestal 's avonds en 's nachts.", "De zon zie je overdag.");
          },
          tip: ["Wat zie je overdag aan de lucht?"],
        },
        terug,
      ),
    leesKlok(U(3), [U(3), U(9), U(12)], { ding: "bezorgbus", zin: ["De bus komt bij de laatste halte.", "Hoe laat is het?"] }),
    tijdNaarKlok(U(4), [U(4), U(10), U(2)], ["De bus rijdt om {4:oranje} uur terug naar de bakkerij."]),
    leesKlok(U(5), [U(5), U(7), U(10)], { ding: "bakkerij", zin: ["De bus is terug bij de bakkerij.", "Hoe laat is het?"] }),
    (l, terug) =>
      kiesVraag(
        l,
        {
          keuzes: [V("bezorgbus"), V("bakkerij")],
          goed: 1,
          vraag: ["De broodjes worden vers gebakken.", "Waar worden de broodjes gebakken?"],
          goedZin: ["In de bakkerij worden de broodjes gebakken.", "De bus brengt ze weg."],
          noem: (i) => ["De bus", "De bakkerij"][i],
          samen: async (l) => {
            await l.zeg("Een bus rijdt rond.", "In de bakkerij staat de oven.");
          },
          tip: ["Waar staat de oven?"],
        },
        terug,
      ),
    leesKlok(U(6), [U(6), U(5), U(12)], { ding: "maan", zin: ["Het wordt donker. De maan komt op.", "Hoe laat is het?"] }),
    leesKlok(U(7), [U(7), U(1), U(6)], { ding: "oven", zin: ["De oven in de bakkerij gaat uit.", "Hoe laat is het?"] }),
    leesKlok(U(8), [U(8), U(4), U(7)], { ding: "maan", zin: ["Het is avond. De maan schijnt.", "Hoe laat is het?"] }),
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
  welkom: ["Er staan twee klokken.", "Op welke klok is het {2:oranje} uur?"],
  voorbeeld: 0,
  uitleg: uitlegHeel,
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
  welkom: ["Je vergelijkt klokken met elkaar.", "Op welke klok is het {11:oranje} uur?"],
  voorbeeld: 0,
  uitleg: uitlegHeel,
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
  welkom: ["Sommige klokken lijken op elkaar.", "Op welke klok is het {11:oranje} uur?"],
  voorbeeld: 0,
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
  start: W(U(9), "blauw"),
  welkom: ["Een klok en een tijd horen bij elkaar.", "Welke klok hoort bij {9:oranje} uur?"],
  voorbeeld: 0,
  uitleg: uitlegHeel,
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
  uitleg: uitlegHeel,
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
  uitleg: uitlegHeel,
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

const r = (op: Opgave, nu: T, soort: "uur later" | "half later" | "uur eerder") => metRekenUitleg(op, nu, soort);
const reken = (ding: string, nu: T, soort: "uur later" | "half later" | "uur eerder", tijden: T[], context: string) => r(tijdRekenen(ding, nu, soort, tijden, context), nu, soort);

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
