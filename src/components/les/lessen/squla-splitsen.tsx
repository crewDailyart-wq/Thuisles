/**
 * Lessen "Splitsen" naar Squla groep 3 Rekenen (31 oktober 2026, opdracht
 * eigenaar). Per Squla-oefening per level één les; elke les volgt hoe dat
 * level bij Squla is opgebouwd (zelfde soorten vragen in dezelfde volgorde,
 * dezelfde getallenreeks), met eigen getallen, eigen zinnen en eigen beeld.
 * De analyse staat in SQULA-ANALYSE/splitsen-*-volledig.md.
 *
 *   Splitsen 1 (16840)  squla-splits-splitsen1-1/2   tot 10
 *   Splitsen 2 (16841)  squla-splits-splitsen2-1/2   tot 20, met 10 als vast deel
 *   Delen (14737)       squla-splits-delen-1         eerlijk verdelen over bakjes
 *
 * Geen mensen (besluit Sara, 31 oktober 2026):
 *  - de jongleur (Splitsen 1 level 2) is een splitsmachine die ballen over
 *    twee bakjes verdeelt: je ziet de splitsing in de twee bakjes, net als in
 *    de twee handen van de jongleur;
 *  - de kinderen bij Delen zijn bakjes: "hoeveel knikkers krijgt elk kind?"
 *    wordt "hoeveel knikkers komen er in elk bakje?" (eerlijk verdelen blijft
 *    hetzelfde); de potloden in de bekers blijven.
 * Geen oogmonster en geen rode of groene kaders: goed of fout laat Bliepo
 * zien met de vaste hulp (squla-hulp.ts) en gloed op het moment.
 * Bliepo's uitleg bij splitsen van 10 en van 10 + een getal gebruikt
 * staafjes, naar het filmpje "Rekenen met staafjes" (twee staafjes samen
 * zijn even lang als de staaf van het totaal).
 */

import { bevestig, krijgtVervolgvraag, zetSynthesisHulp } from "./squla-uitleg";
import type { SqulaVraag } from "./squla-hulp";
import type { Lesgids } from "../soort";
import { foutBeeld, g, goedBeeld, les, squlaVraag as hulpVraag, staafBeeld, tik, toon, voorbeeldVan, zet, type Stand, type Vraag } from "./squla-splitsen-hulp";
import type { S1Spec, S1Stand } from "../vlakken/squla-splitsen-vlak";
import { KaartDelen, KaartSplitsen, SLEEP_BAKKLEUR, type Beeld, type Deel, type Sleep } from "../vlakken/squla-splitsen-vlak";
import type { S2, S2Doel, S2Leg, S2Stuk } from "../vlakken/squla-splitsen2-sleep";
import { meng } from "./squla-meng";

/* =====================================================================
   Woorden
   ===================================================================== */

/**
 * Hulp zoals Synthesis (BOUWREGELS 5.1 en 5.10, 4 november 2026): na één fout een korte reactie en meteen opnieuw, na
 * de tweede fout uitleg, het goede antwoord laten zien en door. Alleen de hulp is aangepast, niet het uiterlijk.
 * Vragen zonder `toonAntwoord` (de oude tik-versies, die niet meer in een les staan) houden de oude route.
 */
function squlaVraag<T>(l: Lesgids, v: SqulaVraag<T>): Promise<boolean> {
  zetSynthesisHulp(l);
  return hulpVraag(l, v.toonAntwoord ? { ...v, synthesis: true } : v);
}

const NAAM: Record<string, [string, string]> = {
  pion: ["pion", "pionnen"],
  voetbal: ["bal", "ballen"],
  pingpongbal: ["pingpongbal", "pingpongballen"],
  tennisbal: ["bal", "ballen"],
  voetbalshirt: ["shirt", "shirts"],
  basketbal: ["bal", "ballen"],
  knikker: ["knikker", "knikkers"],
  stuiterbal: ["stuiterbal", "stuiterballen"],
  potlood: ["potlood", "potloden"],
};
/** "{3} pionnen", "{1} pion". `anders`: de naam als afleider (voetballen tussen pionnen). */
const aantal = (n: number, vw: string, k = "wit") => `${g(n, k)} ${n === 1 ? NAAM[vw][0] : NAAM[vw][1]}`;
/** Wat het kind legde, tegenover wat het moest zijn: "Het moesten er 2 zijn. Er zijn er 4 te veel." */
const verschilZin = (gelegd: number, moet: number) => {
  const v = Math.abs(gelegd - moet);
  return `Het ${moet === 1 ? "moest er" : "moesten er"} ${g(moet, KA)} zijn. ${v === 1 ? `Er is er ${g(1)}` : `Er zijn er ${g(v)}`} ${gelegd > moet ? "te veel" : "te weinig"}.`;
};

const KOLOM = [200, 490, 780];

/** Gekoppelde kleuren (BOUWREGELS 2.1): het eerste deel van een splitsing is paars, het tweede oranje; de dingen en de getallen hebben dezelfde kleur. */
const KA = "paars";
const KB = "oranje";
const GK = { links: KA, rechts: KB };

/* =====================================================================
   Splitsen 1 · level 1: het splitshuisje met dingen, de zak, paren, het tienvak
   ===================================================================== */

type Optie = { n: number; vw: string };

/* =====================================================================
   Splitsen 1 · level 2: de splitsmachine en de splitspaal
   ===================================================================== */

type Huis = [number, number, number];

function paalBeeld(id: string, tot: number, a: number, rechts: string, extra: Deel[]): Beeld {
  return { id, delen: [{ s: "paal", id: "paal", x: 490, y: 140, top: String(tot), links: String(a), rechts, kleuren: GK }, ...extra] };
}

/** Uitleg met staafjes (naar het filmpje): de staaf van het totaal, het bekende stuk, en wat er over is. */
async function staafUitleg(l: Lesgids, st: Stand, tot: number, deel: number) {
  toon(l, st, staafBeeld(`staaf-${tot}-${deel}-${st.goed}-${st.fout}`, tot, deel));
  await l.zeg(`Kijk: een staaf van ${g(tot)} blokjes.`);
  zet(l, { licht: ["st-o"] });
  await l.zeg(`Eronder ${deel === 1 ? "ligt" : "liggen"} ${g(deel, KA)} paarse ${deel === 1 ? "blokje" : "blokjes"}.`);
  /* Het hele en het bekende stuk horen bij dezelfde som: het bekende stuk blijft zacht staan (besluit 4). */
  zet(l, { licht: ["st-o", "st-b"], lichtZacht: ["st-o"] });
  await l.zeg(tot - deel === 0 ? "Kijk of er nog iets overblijft." : "Kijk hoeveel blokjes er over zijn. Tel ze maar.");
  await l.verder();
}

/* =====================================================================
   Splitsen 2: tot 20, met 10 als vast deel
   ===================================================================== */

/** Geld als steuntje: een briefje van 10 en losse euro's. */
function geldDelen(los: number, muntenVerborgen = false): Deel[] {
  const d: Deel[] = [{ s: "geld", id: "briefje", soort: "briefje-10", x: 300, y: 150, maat: 190 }];
  for (let i = 0; i < los; i++) d.push({ s: "geld", id: "munten", soort: "munt-1", x: 470 + i * 62, y: 150, maat: 54, verborgen: muntenVerborgen });
  return d;
}

/* ---------- s2: zelf slepen (2 november 2026, opdracht Sara) ----------
   Getallen, sommen en een ster zijn glanzende tegels die het kind zelf naar een zacht vak sleept
   (squla-splitsen2-sleep.ts). Het rekenen blijft gelijk; alleen het antwoord geven is nu slepen. */

let s2Nr = 0;
const S2_KLEUREN = ["#ff7aa8", "#ffb02e", "#3fc1c9", "#8a6cff", "#4cc76a"];
const S2_SOM = ["#3a5bd9", "#7b4fd6", "#1f9aa6"];
const s2Spec = (stukken: S2Stuk[], doelen: S2Doel[], vast?: [string, string][]): S2 => ({ nr: ++s2Nr, stukken, doelen, vast });
/** x-plekken van `n` tegels naast elkaar. */
const s2Rij = (n: number, i: number, pitch: number) => 490 + (i - (n - 1) / 2) * pitch;
/** Een getaltegel (kleur wisselt per plek, niet per goed of fout). */
const s2Getal = (n: number, i: number, aantalTegels: number, y: number, doel?: string): S2Stuk => ({ id: `s${i}`, kleur: S2_KLEUREN[i % S2_KLEUREN.length], segm: [{ t: String(n) }], x: s2Rij(aantalTegels, i, 230), y, grootte: 56, doel });
/** Een somtegel ("13 = 10 + 3"). */
const s2Som = (t: string, i: number, x: number, y: number, doel?: string, grootte = 40): S2Stuk => ({ id: `s${i}`, kleur: S2_SOM[i % S2_SOM.length], segm: [{ t }], x, y, grootte, doel });

/** Wachten tot het kind `nodig` stukken in vakken heeft gesleept; geeft [stuk, vak] van alles wat ligt. */
async function s2Wacht(l: Lesgids, nodig: number): Promise<[string, string][]> {
  zet(l, { actief: true });
  for (;;) {
    const e = await l.wachtOpVlak<S2Leg>("s2");
    if (e.leg.length >= nodig) {
      zet(l, { actief: false });
      await l.wacht(nodig > 1 ? 450 : 250);
      return e.leg;
    }
  }
}

/** Het splitshuisje met één lege kamer: sleep het getal dat mist naar die kamer. */
function huisGetal(tot: number, links: number | null, rechts: number | null, keuzes: number[], geld: boolean): Vraag {
  /* Herstel 7 november (BOUWREGELS 1.23): de plek van het goede antwoord wisselt per les-start; de waarden blijven. */
  keuzes = meng(keuzes);
  const bekend = (links ?? rechts)!;
  const rest = tot - bekend;
  return (l, st) => {
    const huis: Deel = { s: "huisje", id: "h", x: 490, y: 390, b: 360, top: String(tot), links: links === null ? "" : String(links), rechts: rechts === null ? "" : String(rechts) };
    /* Herstel 7 november (BOUWREGELS 1.22, OVERZICHT-C): de munten verklapten het antwoord (14 = 10 + ? met 4 munten
       ernaast). Tijdens de vraag ligt alleen het briefje er; de munten rollen pas in beeld na het antwoord of bij de uitleg. */
    const extra = geld ? geldDelen(tot - 10, true) : [];
    const id = `h2-${tot}-${links}-${rechts}-${geld}`;
    const beeld: Beeld = { id, delen: [...extra, huis] };
    const eerst = links ?? rest;
    const dan = rechts ?? rest;
    const gat: S2Doel = { id: "k", x: links === null ? 400 : 580, y: 459, b: 150, h: 112, label: "?" };
    const tegels = (vast?: [string, string][]) => s2Spec(keuzes.map((n, i) => s2Getal(n, i, keuzes.length, 640, n === rest ? "k" : undefined)), [gat], vast);
    return squlaVraag<number>(l, {
      toon: () => {
        toon(l, st, beeld);
        zet(l, { s2: tegels(), actief: false });
      },
      vraag: [`Splits het getal ${g(tot)}.`, "Welk getal mist er nog?", "Sleep het getal naar het huisje."],
      antwoord: async () => {
        const leg = await s2Wacht(l, 1);
        return keuzes[Number(leg[0][0].slice(1))];
      },
      isGoed: (x) => x === rest,
      noem: (x) => g(x),
      goed: async () => {
        goedBeeld(l, st, { goedIds: ["h"], ...(geld ? { toon: ["munten"] } : {}) });
        await l.zeg(bevestig());
        await l.wacht(geld ? 700 : 300);
      },
      fout: () => foutBeeld(l, st),
      samen: async () => {
        if (geld) {
          zet(l, { licht: ["briefje"] });
          await l.zeg(`Kijk: een briefje van ${g(10)} euro.`);
          zet(l, { licht: ["briefje", "munten"], lichtZacht: ["briefje"], toon: ["munten"] });
          await l.zeg("En munten van 1 euro.");
          /* "Samen": alle rondjes weer fel (besluit 4). */
          zet(l, { licht: ["briefje", "munten"], lichtZacht: [] });
          await l.zeg(`Samen is dat ${g(tot)} euro.`);
          zet(l, { licht: ["briefje"] });
          await l.zeg(`Het briefje is al ${g(10)} euro.`);
          zet(l, { licht: ["briefje", "munten"], lichtZacht: ["briefje"] });
          await l.zeg("Tel de munten erbij.");
          await l.verder();
          zet(l, { licht: [] });
          return;
        }
        await staafUitleg(l, st, tot, bekend);
      },
      tip: [`${g(tot)} is ${g(bekend, KA)} en nog een deel.`],
      reactie: (x) => {
        if (x === bekend) return [`${g(bekend, KA)} staat er al.`, "Er mist een ander getal."];
        if (x === tot) return [`${g(tot)} is het hele getal.`, "Kijk naar het getal dat er nog bij moet."];
        return [`${g(bekend, KA)} en ${g(x)} is samen ${g(bekend + x)}.`, `Dat moet ${g(tot)} zijn.`];
      },
      toonAntwoord: async () => {
        zet(l, { s2: tegels([[`s${keuzes.indexOf(rest)}`, "k"]]), goedIds: ["h"], actief: false, ...(geld ? { toon: ["munten"] } : {}) });
        await l.zeg(`${g(tot)} kun je splitsen in ${g(eerst)} en ${g(dan)}.`);
        await l.wacht(300);
      },
    });
  };
}

/** Het splitshuisje met twee lege kamers: sleep twee getallen erin die samen kloppen (allebei de volgordes mogen). */
function huisTwee(tot: number, tegels: number[]): Vraag {
  /* Herstel 7 november (BOUWREGELS 1.23): de plek van het goede antwoord wisselt per les-start; de waarden blijven. */
  tegels = meng(tegels);
  const goed = (a: number, b: number) => a + b === tot;
  return (l, st) => {
    const delen: Deel[] = [{ s: "huisje", id: "h", x: 490, y: 300, b: 320, top: String(tot), links: "", rechts: "" }];
    const beeld: Beeld = { id: `twee-${tot}`, delen };
    const tien = tot - 10;
    /* Elke tegel hoort bij een goede combinatie als er een andere tegel is waar hij mee optelt tot het totaal. */
    const hoort = (i: number) => tegels.some((b, j) => j !== i && goed(tegels[i], b));
    const doelen: S2Doel[] = [
      { id: "k0", x: 410, y: 361, b: 140, h: 104, label: "?" },
      { id: "k1", x: 570, y: 361, b: 140, h: 104, label: "?" },
    ];
    const spec = (vast?: [string, string][]) => s2Spec(tegels.map((n, i) => s2Getal(n, i, tegels.length, 560, hoort(i) ? "*" : undefined)), doelen, vast);
    return squlaVraag<[number, number]>(l, {
      toon: () => {
        toon(l, st, beeld);
        zet(l, { s2: spec(), actief: false });
      },
      vraag: [`Hoe kun je ${g(tot)} splitsen?`, "Sleep 2 getallen in het huisje, zodat het klopt."],
      antwoord: async () => {
        const leg = await s2Wacht(l, 2);
        const n = (sid: string) => tegels[Number(sid.slice(1))];
        return [n(leg[0][0]), n(leg[1][0])] as [number, number];
      },
      isGoed: ([a, b]) => goed(a, b),
      noem: () => "Die 2",
      goed: async () => {
        goedBeeld(l, st, { goedIds: ["h"] });
        await l.zeg(bevestig());
        await l.wacht(300);
      },
      fout: () => foutBeeld(l, st),
      samen: async () => {
        await staafUitleg(l, st, tot, 10);
        await l.zeg(`De getallen ${g(10)} en ${g(tien)} passen.`, "Het mag links of rechts.");
      },
      tip: [`${g(tot)} is ${g(10)} en nog een deel.`, "Het mag allebei: links of rechts."],
      reactie: ([a, b]) => [`Je sleepte ${g(a)} en ${g(b)}: samen is dat ${g(a + b)}.`, a + b > tot ? `Dat past niet in het huisje van ${g(tot)}: het is te veel.` : `Het huisje is ${g(tot)}, dus ${tot - a - b === 1 ? "mist er" : "missen er"} nog ${g(tot - a - b)}.`],
      toonAntwoord: async () => {
        let paar: [number, number] = [0, 1];
        for (let i = 0; i < tegels.length; i++) for (let j = 0; j < tegels.length; j++) if (i !== j && goed(tegels[i], tegels[j])) paar = [i, j];
        zet(l, { s2: spec([[`s${paar[0]}`, "k0"], [`s${paar[1]}`, "k1"]]), goedIds: ["h"], actief: false });
        await l.zeg(`${g(tot)} kun je splitsen in ${g(tegels[paar[0]])} en ${g(tegels[paar[1]])}.`);
        await l.wacht(300);
      },
    });
  };
}

const somTekst = (t: number, a: number, b: number) => `${t} = ${a} + ${b}`;

/** Het huisje is helemaal ingevuld: sleep de som die erbij past naar het vak onder het huisje. */
function huisSom(tot: number, a: number, b: number, opties: string[], geld: boolean): Vraag {
  /* Herstel 7 november (BOUWREGELS 1.23): de plek van het goede antwoord wisselt per les-start; de waarden blijven. */
  opties = meng(opties);
  const goed = somTekst(tot, a, b);
  return (l, st) => {
    /* Herstel 7 november (BOUWREGELS 1.22, OVERZICHT-C): het huisje is al helemaal ingevuld en je sleept een som; het geld
       deed niets in de opdracht (losse versiering). Daarom weg; de parameter `geld` blijft voor de bestaande aanroepen. */
    void geld;
    const extra: Deel[] = [];
    const beeld: Beeld = { id: `som-${tot}-${a}-${b}`, delen: [...extra, { s: "huisje", id: "h", x: 490, y: 330, b: 360, top: String(tot), links: String(a), rechts: String(b) }] };
    const gat: S2Doel = { id: "k", x: 490, y: 548, b: 340, h: 98, label: "?" };
    /* Herstel 7 november: de kaartjes iets dichter bij elkaar, niet tegen de rand of de microfoonknop. */
    const somTegels = (vast?: [string, string][]) => s2Spec(opties.map((o, i) => s2Som(o, i, s2Rij(opties.length, i, 290), 650, o === goed ? "k" : undefined)), [gat], vast);
    return squlaVraag<string>(l, {
      toon: () => {
        toon(l, st, beeld);
        zet(l, { s2: somTegels(), actief: false });
      },
      vraag: ["Kijk naar het huisje.", "Welke som past erbij?", "Sleep de som onder het huisje."],
      antwoord: async () => {
        const leg = await s2Wacht(l, 1);
        return opties[Number(leg[0][0].slice(1))];
      },
      isGoed: (x) => x === goed,
      noem: (x) => x,
      goed: async () => {
        goedBeeld(l, st, { goedIds: ["h"] });
        await l.zeg(bevestig());
        await l.wacht(300);
      },
      fout: () => foutBeeld(l, st),
      samen: async () => {
        zet(l, { licht: ["h"] });
        await l.zeg(`Boven in het huisje staat ${g(tot)}.`, "Dit getal schrijf je aan het begin van de som.", `Onder staan ${g(a)} en ${g(b)}.`, "Die 2 getallen tel je bij elkaar op. Samen zijn ze evenveel als het getal bovenaan.", ...(krijgtVervolgvraag(l) ? [] : ["Zoek de som met die 3 getallen."]));
        zet(l, { licht: [] });
      },
      tip: [`De goede som heeft de getallen ${g(tot)}, ${g(a)} en ${g(b)}.`],
      reactie: (x) => {
        const m = x.match(/^(\d+) = (\d+) \+ (\d+)$/);
        if (m && Number(m[1]) !== tot) return [`Die som begint met ${g(Number(m[1]))}.`, `Bovenaan het huisje staat ${g(tot)}.`];
        return ["Bovenaan klopt het.", `Maar onder het huisje staan ${g(a)} en ${g(b)}.`, "De goede som heeft precies die getallen."];
      },
      toonAntwoord: async () => {
        zet(l, { s2: somTegels([[`s${opties.indexOf(goed)}`, "k"]]), goedIds: ["h"], actief: false });
        await l.zeg(`${g(tot)} = ${g(a)} + ${g(b)}.`);
        await l.wacht(300);
      },
    });
  };
}

/** Het ingevulde huisje: sleep de twee sommen die passen naar de twee vakken onder het huisje. */
function huisTweeSommen(tot: number, a: number, b: number, opties: string[]): Vraag {
  /* Herstel 7 november (BOUWREGELS 1.23): de plek van het goede antwoord wisselt per les-start; de waarden blijven. */
  opties = meng(opties);
  const passend = (s: string) => s === somTekst(tot, a, b) || s === somTekst(tot, b, a);
  return (l, st) => {
    const delen: Deel[] = [{ s: "huisje", id: "h", x: 490, y: 300, b: 320, top: String(tot), links: String(a), rechts: String(b) }];
    const beeld: Beeld = { id: `sommen-${tot}-${a}-${b}`, delen };
    const doelen: S2Doel[] = [
      { id: "k0", x: 345, y: 530, b: 270, h: 98, label: "?" },
      { id: "k1", x: 635, y: 530, b: 270, h: 98, label: "?" },
    ];
    /* Herstel 7 november (OVERZICHT-C splitsen2-2 v04–v09): de rechterkaart stond tegen Bliepo en zijn microfoonknop; nu dichter bij het midden. */
    const somTegels = (vast?: [string, string][]) => s2Spec(opties.map((o, i) => s2Som(o, i, s2Rij(opties.length, i, 286), 650, passend(o) ? "*" : undefined)), doelen, vast);
    return squlaVraag<[string, string]>(l, {
      toon: () => {
        toon(l, st, beeld);
        zet(l, { s2: somTegels(), actief: false });
      },
      vraag: ["Kijk naar het huisje.", "Welke sommen passen erbij?", "Er zijn er 2 goed. Sleep ze onder het huisje."],
      antwoord: async () => {
        const leg = await s2Wacht(l, 2);
        return [opties[Number(leg[0][0].slice(1))], opties[Number(leg[1][0].slice(1))]] as [string, string];
      },
      isGoed: ([x, y]) => x !== y && passend(x) && passend(y),
      noem: () => "Die 2",
      goed: async () => {
        goedBeeld(l, st, { goedIds: ["h"] });
        await l.zeg(bevestig());
        await l.wacht(300);
      },
      fout: () => foutBeeld(l, st),
      samen: async () => {
        zet(l, { licht: ["h"] });
        await l.zeg(`Het dak van het huisje zegt ${g(tot)}.`, "Met dit getal begint elke som.", `Onder staan ${g(a)} en ${g(b)}.`, "Die mogen in allebei de volgordes.");
        zet(l, { licht: [] });
      },
      tip: [`De goede sommen hebben de getallen ${g(tot)}, ${g(a)} en ${g(b)}.`],
      reactie: ([x, y]) => {
        const slecht = [x, y].find((o) => !passend(o));
        const m = slecht?.match(/^(\d+) = (\d+) \+ (\d+)$/);
        if (!m) return ["Dat is 2 keer dezelfde som.", "Kies 2 verschillende sommen."];
        return [`${g(Number(m[1]))} = ${g(Number(m[2]))} + ${g(Number(m[3]))} past niet bij dit huisje.`, `De goede sommen hebben de getallen ${g(tot)}, ${g(a)} en ${g(b)}.`];
      },
      toonAntwoord: async () => {
        zet(l, { s2: somTegels([[`s${opties.indexOf(somTekst(tot, a, b))}`, "k0"], [`s${opties.indexOf(somTekst(tot, b, a))}`, "k1"]]), goedIds: ["h"], actief: false });
        await l.zeg(`${g(tot)} = ${g(a)} + ${g(b)}.`, `En ${g(tot)} = ${g(b)} + ${g(a)}.`);
        await l.wacht(300);
      },
    });
  };
}

/** Verbinden: sleep elke som naar het vak naast het huisje waar hij bij hoort. */
function verbindVraag(huisjes: Huis[], volgorde: number[]): Vraag {
  /* Herstel 7 november (BOUWREGELS 1.23): de plek van het goede antwoord wisselt per les-start; de waarden blijven. */
  volgorde = meng(volgorde);
  const Y = [170, 370, 570];
  return async (l, st) => {
    const basis: Deel[] = [];
    huisjes.forEach(([t, a, b], i) => {
      basis.push({ s: "huisje", id: `h${i}`, x: 220, y: Y[i], b: 180, top: String(t), links: String(a), rechts: String(b) });
    });
    const id = `verbind-${huisjes.flat().join("-")}`;
    const beeld: Beeld = { id, delen: basis };
    const doelen: S2Doel[] = huisjes.map((_, i) => ({ id: `d${i}`, x: 500, y: Y[i] + 35, b: 280, h: 88, label: "?" }));
    const klaar: number[] = [];
    let huidig: S2 | null = null;
    let alles = true;
    let laatste: [string, string] | null = null;
    for (let keer = 0; keer < huisjes.length; keer++) {
      const open = huisjes.map((_, i) => i).filter((i) => !klaar.includes(i));
      const eerste = open[0];
      const [t, a, b] = huisjes[eerste];
      const meteen = await squlaVraag<[string, string]>(l, {
        toon: () => {
          toon(l, st, beeld);
          huidig = s2Spec(
            volgorde.map((h, r) => {
              const [tt, aa, bb] = huisjes[h];
              /* Herstel 7 november (OVERZICHT-C splitsen2-2 v04–v09): de sommen stonden tegen Bliepo en zijn microfoonknop;
                 alles schuift iets naar links (huisjes 220, vakken 500, sommen 790). */
              return { ...s2Som(somTekst(tt, aa, bb), h, 790, Y[r] + 35, `d${h}`, 36), id: `s${h}` };
            }),
            doelen,
            klaar.map((h) => [`s${h}`, `d${h}`] as [string, string]),
          );
          zet(l, { s2: huidig, actief: false });
        },
        vraag: keer === 0 ? ["Welk huisje hoort bij welke som?", "Sleep elke som naar zijn huisje."] : ["Welk huisje hoort bij welke som?"],
        antwoord: async () => {
          const leg = await s2Wacht(l, klaar.length + 1);
          const nieuw = leg.find(([sid]) => !klaar.includes(Number(sid.slice(1))))!;
          return nieuw;
        },
        isGoed: ([x, y]) => x.slice(1) === y.slice(1),
        noem: () => "Die 2",
        goed: async ([x]) => {
          const h = Number(x.slice(1));
          klaar.push(h);
          if (huidig) {
            huidig = { ...huidig, vast: klaar.map((q) => [`s${q}`, `d${q}`] as [string, string]) };
            zet(l, { s2: huidig });
          }
          goedBeeld(l, st, { goedIds: [`h${h}`] });
          const [tt, aa, bb] = huisjes[h];
          await l.zeg(bevestig());
          zet(l, { goedIds: [] });
        },
        fout: (x) => {
          laatste = x;
          foutBeeld(l, st);
        },
        samen: async () => {
          zet(l, { licht: [`h${eerste}`] });
          await l.zeg("Kijk naar dit huisje.", `Er staan ${g(t)}, ${g(a)} en ${g(b)} in.`, "Met die 3 getallen maak je 1 som.");
        },
        tip: [`De goede som heeft de getallen ${g(t)}, ${g(a)} en ${g(b)}.`],
        reactie: ([x, y]) => {
          const [tt, aa, bb] = huisjes[Number(x.slice(1))];
          const [t2, a2, b2] = huisjes[Number(y.slice(1))];
          return [`In dat huisje staan ${g(t2)}, ${g(a2)} en ${g(b2)}.`, `${g(tt)} = ${g(aa)} + ${g(bb)} past daar niet bij.`];
        },
        toonAntwoord: async () => {
          /* De som die het kind probeerde, gaat naar zijn eigen huisje; de volgende ronde gaat met de rest door. */
          const h = laatste ? Number(laatste[0].slice(1)) : eerste;
          if (!klaar.includes(h)) klaar.push(h);
          if (huidig) {
            huidig = { ...huidig, vast: klaar.map((q) => [`s${q}`, `d${q}`] as [string, string]) };
            zet(l, { s2: huidig });
          }
          zet(l, { goedIds: [`h${h}`] });
          const [tt, aa, bb] = huisjes[h];
          await l.zeg(`Zo hoort het: ${g(tt)} = ${g(aa)} + ${g(bb)}.`);
          zet(l, { goedIds: [] });
        },
      });
      if (!meteen) alles = false;
    }
    return alles;
  };
}

/* =====================================================================
   Delen: eerlijk verdelen over bakjes
   ===================================================================== */

type Bron = { vorm: "rijen"; per: number } | { vorm: "los" } | { vorm: "hoopjes"; per: number };

const bakX = (j: number, k: number) => 490 + (j - (k - 1) / 2) * 160;

/** Wat er te verdelen is (boven), de bakjes (midden) en wat er straks in elk bakje komt (verborgen). */
function verdeelDelen(n: number, k: number, vw: string, bron: Bron): Deel[] {
  const m = n / k;
  const d: Deel[] = [];
  if (bron.vorm === "los") d.push({ s: "groep", id: "bron", vw, n, x: 490, y: 200, los: [720, 170], cel: 52 });
  else if (bron.vorm === "rijen") d.push({ s: "groep", id: "bron", vw, n, x: 490, y: 200, per: bron.per, cel: 48 });
  else {
    /* Hoopjes: groepjes naast elkaar (zelfde id met een nummer). */
    const hoop = Math.ceil(n / bron.per);
    /* Herstel 7 november (BOUWREGELS 1.22, OVERZICHT-C): de knikkers lagen al in groepjes per kleur boven het bakje van
       dezelfde kleur; 1 groepje tellen gaf het antwoord. Nu ligt alles in 1 gemengde hoop (kleuren door elkaar). Pas na
       het antwoord komen ze in de bakjes. De ids blijven per "hoopje" van `per` (voor `bronIds`). */
    void hoop;
    const k2 = Math.max(2, Math.round(n / bron.per));
    const mix = Array.from({ length: n }, (_, i) => SLEEP_BAKKLEUR[(i * 3 + Math.floor(i / k2)) % Math.min(SLEEP_BAKKLEUR.length, k2 + 1)]);
    const kol = Math.min(8, Math.ceil(n / 2));
    for (let h = 0; h * bron.per < n; h++) {
      const aantalHier = Math.min(bron.per, n - h * bron.per);
      for (let i = 0; i < aantalHier; i++) {
        const idx = h * bron.per + i;
        /* Een rommelige maar nette hoop: 2 rijen, iets verschoven, niets over elkaar. */
        const r = Math.floor(idx / kol);
        const c = idx % kol;
        const x = 490 + (c - (kol - 1) / 2) * 62 + (r % 2 ? 22 : -8) + ((idx * 37) % 13) - 6;
        const y = 160 + r * 58 + ((idx * 23) % 15) - 7;
        d.push({ s: "ding", id: `bron-${h}.${i}`, vw, x, y, maat: 52, kl: mix[idx] });
      }
    }
  }
  for (let j = 0; j < k; j++) {
    d.push({ s: "ding", id: `bak${j}`, vw: "bakje", x: bakX(j, k), y: 400, maat: 140, kl: SLEEP_BAKKLEUR[j % SLEEP_BAKKLEUR.length] });
    for (let r = 0; r < m; r++) {
      /* Hoogstens 3 naast elkaar; de rest erboven. */
      const rij = Math.floor(r / 3);
      const inRij = Math.min(3, m - rij * 3);
      d.push({ s: "ding", id: `in${j}-${r}`, vw, x: bakX(j, k) + ((r % 3) - (inRij - 1) / 2) * 40, y: 384 - rij * 34, maat: 38, kl: SLEEP_BAKKLEUR[j % SLEEP_BAKKLEUR.length], verborgen: true });
    }
  }
  return d;
}

const alleIn = (k: number, m: number) => Array.from({ length: k * m }, (_, i) => `in${i % k}-${Math.floor(i / k)}`);

/** De ids van alles wat er te verdelen is (bij hoopjes per groepje). */
function bronIds(n: number, bron: Bron) {
  if (bron.vorm !== "hoopjes") return Array.from({ length: n }, (_, i) => `bron.${i}`);
  return Array.from({ length: n }, (_, i) => `bron-${Math.floor(i / bron.per)}.${i % bron.per}`);
}

/** Eén voor één verdelen: elk bakje krijgt er steeds één bij. */
async function verdeel(l: Lesgids, n: number, k: number, vw: string, bron: Bron) {
  const m = n / k;
  const ids = bronIds(n, bron);
  await l.zeg(`We verdelen de ${NAAM[vw][1]} 1 voor 1.`, "Elk bakje krijgt er steeds 1 bij.");
  const uit: string[] = [];
  const toonIds: string[] = [];
  for (let r = 0; r < m; r++) {
    for (let j = 0; j < k; j++) {
      uit.push(ids[r * k + j]);
      toonIds.push(`in${j}-${r}`);
      zet(l, { uit: [...uit], toon: [...toonIds], licht: [`in${j}-${r}`] });
      await l.wacht(420);
    }
  }
  zet(l, { licht: [] });
  await l.zeg("Alles is verdeeld.", "Tel wat er in 1 bakje ligt.");
}

const herhaal = (m: number, k: number) => Array.from({ length: k }, () => g(m)).join(" + ");

/** Eerlijk verdelen: sleep het getal dat in elk bakje komt naar het vak onder de bakjes (s2). */
function delenVraag(n: number, k: number, vw: string, bron: Bron, keuzes: number[]): Vraag {
  /* Herstel 7 november (BOUWREGELS 1.23): de plek van het goede antwoord wisselt per les-start; de waarden blijven. */
  keuzes = meng(keuzes);
  const m = n / k;
  const veel = NAAM[vw][1];
  return (l, st) => {
    const delen = verdeelDelen(n, k, vw, bron);
    const beeld: Beeld = { id: `delen-${n}-${k}-${vw}-s2`, delen };
    const gat: S2Doel = { id: "k", x: 490, y: 548, b: 200, h: 112, label: "?" };
    const tegels = (vast?: [string, string][]) => s2Spec(keuzes.map((x, i) => s2Getal(x, i, keuzes.length, 655, x === m ? "k" : undefined)), [gat], vast);
    return squlaVraag<number>(l, {
      toon: () => {
        toon(l, st, beeld);
        zet(l, { s2: tegels(), actief: false });
      },
      vraag: [`Er zijn ${aantal(n, vw)}.`, `Verdeel ze eerlijk over de ${g(k)} bakjes.`, `Hoeveel ${veel} komen er in elk bakje?`, "Sleep het goede getal naar het vak."],
      antwoord: async () => {
        const leg = await s2Wacht(l, 1);
        return keuzes[Number(leg[0][0].slice(1))];
      },
      isGoed: (x) => x === m,
      noem: (x) => g(x),
      goed: async () => {
        goedBeeld(l, st, { toon: alleIn(k, m), uit: bronIds(n, bron) });
        await l.zeg(bevestig());
        await l.wacht(300);
      },
      fout: () => foutBeeld(l, st),
      samen: () => verdeel(l, n, k, vw, bron),
      tip: [`Tel de ${veel} in 1 bakje.`],
      reactie: (x) => [`${herhaal(x, k)} = ${g(x * k)}.`, `Dat is niet ${g(n)}.`],
      toonAntwoord: async () => {
        zet(l, { s2: tegels([[`s${keuzes.indexOf(m)}`, "k"]]), toon: alleIn(k, m), uit: bronIds(n, bron), actief: false });
        await l.zeg(`Elk bakje krijgt ${aantal(m, vw)}.`, `${herhaal(m, k)} = ${g(n)}.`);
        await l.wacht(300);
      },
    });
  };
}


/* ---------- Zelf slepen: knikkers over bakjes (proef 2 november 2026, opdracht Sara) ----------
   Het kind sleept de knikkers zelf over de bakjes (met de muis of de vinger; tikken werkt ook).
   Eerlijk verdelen = in elk bakje evenveel: precies één goede verdeling (n : k = m). Elk bakje
   heeft een eigen kleur; de getallen in de som hebben die kleuren (BOUWREGELS 2.1). */

let sleepNr = 0;
const bakKleuren = (k: number) => Array.from({ length: k }, (_, j) => SLEEP_BAKKLEUR[j % SLEEP_BAKKLEUR.length]);
/** "{4:paars} + {4:oranje}": elk bakje in zijn eigen kleur. */
const somBakjes = (tel: number[]) => tel.map((c, j) => g(c, bakKleuren(tel.length)[j])).join(" + ");
/** "{3:paars} en {5:oranje}" of "{3:paars}, {4:oranje} en {5:groen}". */
const telBakjes = (tel: number[]) => {
  const d = tel.map((c, j) => g(c, bakKleuren(tel.length)[j]));
  return d.length > 1 ? `${d.slice(0, -1).join(", ")} en ${d[d.length - 1]}` : d[0];
};

/** De knikkers rollen één voor één over de bakjes (uitleg en hulp). */
async function rolOver(l: Lesgids, s: Sleep) {
  /* Het rondje (BOUWREGELS 7.8): eerst om de knikkers, dan om de bakjes, weg zodra het rollen begint. */
  zet(l, { licht: ["sl.knikkers"] });
  await l.zeg(`We verdelen de ${NAAM[s.vw ?? "knikker"][1]} 1 voor 1.`);
  zet(l, { licht: ["sl.bakjes"] });
  await l.zeg("Elk bakje krijgt er steeds 1 bij.");
  zet(l, { licht: [] });
  for (let t = 1; t <= s.n; t++) {
    zet(l, { sleep: { ...s, auto: t } });
    await l.wacht(450);
  }
}

function sleepVraag(n: number, k: number, vw = "knikker"): Vraag {
  const m = n / k;
  const eerlijk = Array.from({ length: k }, () => m);
  return (l, st) => {
    const beeld: Beeld = { id: `sleep-${n}-${k}`, delen: [] };
    return squlaVraag<number[]>(l, {
      toon: () => {
        const s: Sleep = { n, k, nr: ++sleepNr, ...(vw === "knikker" ? {} : { vw }) };
        if (!toon(l, st, beeld, { sleep: s })) zet(l, { sleep: s, actief: false });
      },
      vraag: [`Er zijn ${aantal(n, vw)}.`, `Verdeel ze over de ${g(k)} bakjes. Zorg dat in elk bakje evenveel ligt.`],
      antwoord: async () => {
        zet(l, { actief: true });
        /* Wachten tot alle knikkers in een bakje liggen; dan verschijnt het vinkje. Haalt het kind er weer een weg, dan verdwijnt het. */
        type Stand = { soort: "stand"; tel: number[]; los: number };
        const stand = () => l.wachtOpVlak<Stand>("stand");
        let s = await stand();
        for (;;) {
          if (s.los > 0) {
            s = await stand();
            continue;
          }
          const r = await Promise.race([l.knoppen(["controleer"]).then(() => null), stand()]);
          if (r === null) break;
          s = r;
        }
        zet(l, { actief: false });
        return s.tel;
      },
      isGoed: (x) => x.every((c) => c === m),
      noem: (x) => telBakjes(x),
      goed: async () => {
        goedBeeld(l, st);
        await l.zeg(bevestig());
        await l.wacht(300);
      },
      fout: () => foutBeeld(l, st),
      samen: async () => {
        const s: Sleep = { n, k, nr: ++sleepNr, auto: 0, ...(vw === "knikker" ? {} : { vw }) };
        zet(l, { sleep: s, actief: false });
        await l.wacht(500);
        await rolOver(l, s);
        await l.zeg("Alles is verdeeld.");
        zet(l, { licht: ["sl.bakje"] });
        await l.zeg("Tel wat er in 1 bakje ligt.");
        zet(l, { licht: [] });
      },
      tip: [`Tel de ${NAAM[vw][1]} in elk bakje.`, "Kijk of er in elk bakje evenveel liggen."],
      reactie: (x) => [`In de bakjes ${x.length === 1 ? "ligt" : "liggen"} ${telBakjes(x)}.`, "Verplaats er een paar, tot elk bakje evenveel heeft."],
      toonAntwoord: async () => {
        await l.zeg(`Elk bakje krijgt ${aantal(m, vw)}.`, `${somBakjes(eerlijk)} = ${g(n)}.`);
        await l.wacht(300);
      },
    });
  };
}

/** Potloden in bekers: sleep de ster naar de rij waar ze eerlijk verdeeld zijn (s2). */
function potlodenVraag(n: number, k: number, rijen: number[]): Vraag {
  /* Herstel 7 november (BOUWREGELS 1.23): de plek van het goede antwoord wisselt per les-start; de waarden blijven. */
  rijen = meng(rijen);
  const m = n / k;
  /* Rijen op 3 hoogtes; elke beker is 190 breed en 226 hoog (beker met uitgewaaierde, gekleurde potloden: BOUWREGELS 7.7 glans B). */
  /* Herstel 7 november (OVERZICHT-C delen-1 v13/v14): het rek vulde het hele scherm en raakte de bovenrand; nu kleinere
     bekers (80 %) met lucht erboven en eronder. */
  const Y = [142, 360, 578];
  const MAAT = 152;
  const sterX = Math.min(928, 490 + k * 82 + 46);
  return (l, st) => {
    const delen: Deel[] = [];
    rijen.forEach((p, r) => {
      for (let j = 0; j < k; j++) {
        const x = 490 + (j - (k - 1) / 2) * 164;
        delen.push({ s: "potloden", id: `r${r}`, n: p, x, y: Y[r], maat: MAAT });
      }
    });
    const goedId = `r${rijen.indexOf(m)}`;
    const beeld: Beeld = { id: `potlood-${n}-${k}`, delen };
    const doelen: S2Doel[] = rijen.map((_, r) => ({ id: `r${r}`, x: 490, y: Y[r], b: k * 164 + 6, h: 186, snap: { x: sterX, y: Y[r] } }));
    const sterSpec = (vast?: [string, string][]) => s2Spec([{ id: "ster", kleur: "#ffc21a", vorm: "ster", x: sterX, y: 240, doel: goedId }], doelen, vast);
    return squlaVraag<string>(l, {
      toon: () => {
        toon(l, st, beeld);
        zet(l, { s2: sterSpec(), actief: false });
      },
      vraag: [`Waar zijn ${g(n)} potloden eerlijk verdeeld?`, `Ze staan in ${g(k)} bekers.`, "Sleep de ster naar de goede rij."],
      antwoord: async () => (await s2Wacht(l, 1))[0][1],
      isGoed: (x) => x === goedId,
      noem: () => "Die rij",
      goed: async () => {
        goedBeeld(l, st, { goedIds: [goedId] });
        await l.zeg(bevestig());
        await l.wacht(300);
      },
      fout: () => foutBeeld(l, st),
      samen: async () => {
        await l.zeg(`We zoeken ${g(n)} potloden.`, "Tel in elke rij alle potloden.");
        for (const r of [0, 1, 2]) {
          zet(l, { licht: [`r${r}`] });
          await l.wacht(1500);
        }
        zet(l, { licht: [] });
        await l.zeg(`Kijk in welke rij het er ${g(n)} zijn.`);
      },
      tip: [`Tel alle potloden in een rij.`, `Kijk of het er ${g(n)} zijn.`],
      reactie: (x) => {
        const p = rijen[Number(x.slice(1))];
        return [`In die rij staan ${aantal(p, "potlood")} in elke beker.`, `${herhaal(p, k)} = ${g(p * k)}.`, `Dat is niet ${g(n)}.`];
      },
      toonAntwoord: async () => {
        zet(l, { s2: sterSpec([["ster", goedId]]), goedIds: [goedId], licht: [], actief: false });
        await l.zeg(`In elke beker staan ${aantal(m, "potlood")}.`, `${herhaal(m, k)} = ${g(n)}.`);
        await l.wacht(300);
      },
    });
  };
}

/* =====================================================================
   Splitsen 1: zelf slepen (s1, 2 november 2026, opdracht Sara)
   Het kind sleept de dingen (of getallentegels) zelf naar de vakken van het huisje, de splitspaal of
   de doos. De vakken hebben de kleur van hun getal (BOUWREGELS 2.1). Rekenen en getallen blijven gelijk.
   ===================================================================== */

type S1St = S1Stand;
let s1Nr = 0;
/** Verandert bij elk nieuw beeld: een lopende animatie (de machine) stopt dan vanzelf. */
let s1Gen = 0;
const s1Nieuw = <T extends object>(s: T) => ({ ...s, nr: ++s1Nr });

/** Beeld + sleepspel neerzetten; bij "nog een keer" (zelfde beeld) alleen het spel opnieuw. */
function s1Zet(l: Lesgids, st: Stand, beeld: Beeld, spec: S1Spec) {
  if (!toon(l, st, beeld, { s1: spec })) zet(l, { beeld, s1: spec, actief: false, licht: [], goedIds: [], uit: [], toon: [] });
}

/** Wachten tot het klaar is (`klaar`); dan verschijnt het vinkje. Haalt het kind er weer iets weg, dan verdwijnt het. */
async function s1Wacht(l: Lesgids, klaar: (s: S1St) => boolean): Promise<S1St> {
  zet(l, { actief: true });
  const stand = () => l.wachtOpVlak<S1St>("s1stand");
  let s = await stand();
  for (;;) {
    if (!klaar(s)) {
      s = await stand();
      continue;
    }
    const r = await Promise.race([l.knoppen(["controleer"]).then(() => null), stand()]);
    if (r === null) break;
    s = r;
  }
  zet(l, { actief: false });
  return s;
}

const s1TelTwee = (tel: number[]) => `${g(tel[0], KA)} en ${g(tel[1], KB)}`;

/* ---------- het huisje met dingen (pionnen, ballen en de zak) ---------- */

function s1HuisOpbouw(tot: number, deel: number, vw: string, o: { zak?: boolean; links?: boolean } = {}) {
  const zak = !!o.zak;
  const links = o.links ?? true;
  const rest = tot - deel;
  const [HX, HY, HB] = [490, 300, 640];
  const zx = [HX - 160, HX + 160];
  const kx = links ? zx : [zx[1], zx[0]];
  const id = `s1-huis-${tot}-${deel}-${vw}-${zak}-${links}`;
  const beeld = (klaar: boolean): Beeld => ({
    id,
    delen: [
      { s: "huisje", id: "huis", x: HX, y: HY, b: HB, top: "", links: "", rechts: "" },
      { s: "tekst", id: "la", t: String(deel), x: kx[0], y: 596, grootte: 60, kleur: KA },
      { s: "tekst", id: "lb", t: klaar ? String(rest) : "?", x: kx[1], y: 596, grootte: 60, kleur: KB },
      ...(zak ? ([{ s: "ding", id: "zak", vw: "zak", x: kx[1], y: 425, maat: 210 }] as Deel[]) : []),
    ],
  });
  const dia = tot <= 5 ? 84 : 66;
  const spec = (): S1Spec =>
    s1Nieuw({
      soort: "dingen" as const,
      vw,
      n: tot,
      tray: { x: HX, y: tot <= 5 ? 248 : 192, per: 5, dia },
      zones: [
        { id: "a", x: kx[0], y: 424, b: 300, h: 226, kl: KA, per: 4, dia: 68 },
        { id: "b", x: kx[1], y: 424, b: 300, h: 226, kl: KB, per: 4, dia: 68 },
      ],
      oplossing: [deel, rest],
      fout: deel === rest ? [tot, 0] : [rest, deel],
      route: Array.from({ length: tot }, (_, i) => [i, i < deel ? 0 : 1] as [number, number]),
    });
  const w = NAAM[vw][1];
  const vraag = zak
    ? [`Er zijn ${aantal(tot, vw)}.`, `Sleep ${aantal(deel, vw, KA)} naar het paarse vak naast de zak.`, `De andere ${w} sleep je in de zak.`]
    : [`Er zijn ${aantal(tot, vw)}.`, `Sleep ${aantal(deel, vw, KA)} naar het paarse vak.`, `De andere ${w} sleep je naar het oranje vak.`];
  return { beeld, spec, vraag, rest, w };
}

function s1HuisVraag(tot: number, deel: number, vw = "pion", o: { zak?: boolean; links?: boolean } = {}): Vraag {
  const rest = tot - deel;
  const zak = !!o.zak;
  return (l, st) => {
    const b = s1HuisOpbouw(tot, deel, vw, o);
    return squlaVraag<S1St>(l, {
      toon: () => s1Zet(l, st, b.beeld(false), b.spec()),
      vraag: b.vraag,
      antwoord: () => s1Wacht(l, (x) => x.los === 0),
      isGoed: (x) => x.tel[0] === deel && x.tel[1] === rest,
      noem: (x) => s1TelTwee(x.tel),
      goed: async () => {
        goedBeeld(l, st, { beeld: b.beeld(true) });
        await l.zeg(bevestig());
        await l.wacht(300);
      },
      fout: () => foutBeeld(l, st),
      samen: async () => {
        const sp = b.spec();
        zet(l, { s1: { ...sp, auto: 0 }, actief: false });
        await l.wacht(400);
        await l.zeg(`Kijk: er zijn ${aantal(tot, vw)}.`);
        for (let t = 1; t <= deel; t++) {
          zet(l, { s1: { ...sp, auto: t } });
          await l.wacht(420);
        }
        await l.zeg(`${aantal(deel, vw, KA)} ${deel === 1 ? "gaat" : "gaan"} naar het paarse vak.`);
        for (let t = deel + 1; t <= tot; t++) {
          zet(l, { s1: { ...sp, auto: t } });
          await l.wacht(420);
        }
        await l.zeg(zak ? `De andere ${b.w} gaan in de zak.` : "De andere gaan naar het oranje vak.", "Tel ze maar.");
      },
      tip: [`Sleep eerst ${g(deel, KA)} naar het paarse vak.`, zak ? "De andere gaan in de zak." : "De andere gaan naar het oranje vak."],
      reactie: (x) => [
        x.tel[0] === rest && deel !== rest ? "Je hebt de 2 vakken omgedraaid." : `In het paarse vak ${x.tel[0] === 1 ? "ligt" : "liggen"} er ${g(x.tel[0])}.`,
        verschilZin(x.tel[0], deel),
      ],
      toonAntwoord: async () => {
        zet(l, { beeld: b.beeld(true) });
        await l.zeg(`${g(tot)} kun je splitsen in ${g(deel, KA)} en ${g(rest, KB)}.`);
        await l.wacht(300);
      },
    });
  };
}

/* ---------- de splitspaal met shirts ---------- */

function s1ShirtVraag(tot: number, a: number): Vraag {
  const rest = tot - a;
  const id = `s1-shirt-${tot}-${a}`;
  const beeld = (klaar: boolean): Beeld => ({
    id,
    delen: [
      { s: "paal", id: "paal", x: 490, y: 140, top: String(tot), links: klaar ? String(a) : "", rechts: klaar ? String(rest) : "", kleuren: GK },
      /* Herstel 7 november (OVERZICHT-C splitsen1-2 v05–v08): het getal staat direct onder zijn vak, met lucht tot de shirts. */
      { s: "tekst", id: "la", t: String(a), x: 340, y: 578, grootte: 48, kleur: KA },
      { s: "tekst", id: "lb", t: klaar ? String(rest) : "?", x: 640, y: 578, grootte: 48, kleur: KB },
    ],
  });
  return (l, st) => {
    const spec = (): S1Spec =>
      s1Nieuw({
        soort: "dingen" as const,
        vw: "voetbalshirt",
        n: tot,
        tray: { x: 490, y: 670, per: 9, dia: 66, stap: 76 },
        zones: [
          { id: "a", x: 340, y: 436, b: 280, h: 206, kl: KA, per: 3, dia: 74 },
          { id: "b", x: 640, y: 436, b: 280, h: 206, kl: KB, per: 3, dia: 74 },
        ],
        oplossing: [a, rest],
        fout: a === rest ? [tot, 0] : [rest, a],
        route: Array.from({ length: tot }, (_, i) => [i, i < a ? 0 : 1] as [number, number]),
      });
    return squlaVraag<S1St>(l, {
      toon: () => s1Zet(l, st, beeld(false), spec()),
      vraag: [`Er zijn ${aantal(tot, "voetbalshirt")}.`, `Sleep ${aantal(a, "voetbalshirt", KA)} naar het paarse vak.`, "De andere shirts sleep je naar het oranje vak."],
      antwoord: () => s1Wacht(l, (x) => x.los === 0),
      isGoed: (x) => x.tel[0] === a && x.tel[1] === rest,
      noem: (x) => s1TelTwee(x.tel),
      goed: async () => {
        goedBeeld(l, st, { beeld: beeld(true) });
        await l.zeg(bevestig());
        await l.wacht(300);
      },
      fout: () => foutBeeld(l, st),
      samen: async () => {
        const sp = spec();
        zet(l, { s1: { ...sp, auto: 0 }, actief: false });
        await l.wacht(400);
        await l.zeg(`Bovenaan de splitspaal staat ${g(tot)}.`, `Dat zijn ${aantal(tot, "voetbalshirt")}.`);
        for (let t = 1; t <= tot; t++) {
          zet(l, { s1: { ...sp, auto: t } });
          await l.wacht(380);
          if (t === a) await l.zeg(`${aantal(a, "voetbalshirt", KA)} ${a === 1 ? "is" : "zijn"} paars.`);
        }
        await l.zeg("De andere shirts zijn oranje.", "Tel ze maar.");
      },
      tip: [`Sleep eerst ${g(a, KA)} shirts naar het paarse vak.`, "De andere shirts gaan naar het oranje vak."],
      reactie: (x) => [
        x.tel[0] === rest && a !== rest ? "Je hebt de 2 vakken omgedraaid." : `In het paarse vak ${x.tel[0] === 1 ? "ligt" : "liggen"} er ${g(x.tel[0])}.`,
        verschilZin(x.tel[0], a),
      ],
      toonAntwoord: async () => {
        zet(l, { beeld: beeld(true) });
        await l.zeg(`${g(tot)} kun je splitsen in ${g(a, KA)} en ${g(rest, KB)}.`);
        await l.wacht(300);
      },
    });
  };
}

/* ---------- getallentegels slepen: de splitspaal en de splitsmachine ---------- */

function s1PaalVraag(tot: number, a: number, keuzes: number[], ballen: boolean): Vraag {
  /* Herstel 7 november (BOUWREGELS 1.23): de plek van het goede antwoord wisselt per les-start; de waarden blijven. */
  keuzes = meng(keuzes);
  const rest = tot - a;
  const id = `s1-paal-${tot}-${a}-${ballen}`;
  const beeld: Beeld = {
    id,
    delen: [
      { s: "paal", id: "paal", x: 490, y: 140, top: String(tot), links: String(a), rechts: "", kleuren: GK },
      ...(ballen
        ? ([
            /* Herstel 7 november (OVERZICHT-C splitsen1-2 v09): de ballen meer naar het midden, niet tegen de rand. De ballen
               zijn de telhulp van deze vraag (zoals bij Squla: "Kijk naar de ballen en de splitspaal"). */
            { s: "groep", id: "gl", vw: "basketbal", n: a, x: 225, y: 330, per: 4, cel: 66, kl: KA },
            { s: "groep", id: "gr", vw: "basketbal", n: rest, x: 790, y: 330, per: 4, cel: 66, kl: KB },
          ] as Deel[])
        : []),
    ],
  };
  return (l, st) => {
    const spec = (): S1Spec =>
      s1Nieuw({
        soort: "tegels" as const,
        waarden: keuzes,
        n: keuzes.length,
        tray: { x: 490, y: 612, per: keuzes.length, dia: 86, stap: 106 },
        zones: [{ id: "gat", x: 590, y: 330, b: 100, h: 100, kl: KB, per: 1, dia: 80, max: 1, leeg: "?" }],
        oplossing: [rest],
        fout: [keuzes.find((k) => k !== rest)!],
        route: [[keuzes.indexOf(rest), 0]] as [number, number][],
      });
    return squlaVraag<S1St>(l, {
      toon: () => s1Zet(l, st, beeld, spec()),
      vraag: [ballen ? "Kijk naar de ballen en de splitspaal." : "Kijk naar de splitspaal.", "Welk getal mist er nog?", "Sleep het naar de lege plek."],
      antwoord: () => s1Wacht(l, (x) => x.tel[0] === 1),
      isGoed: (x) => x.waarden[0][0] === rest,
      noem: (x) => g(x.waarden[0][0]),
      goed: async () => {
        goedBeeld(l, st, { goedIds: ["paal"] });
        await l.zeg(bevestig());
        await l.wacht(300);
      },
      fout: () => foutBeeld(l, st),
      samen: async () => {
        zet(l, { s1: null });
        await staafUitleg(l, st, tot, a);
      },
      tip: [`${g(tot)} is ${g(a, KA)} en nog een deel.`],
      reactie: (x) => {
        const c = x.waarden[0][0];
        if (c === a) return [`${g(a, KA)} staat al in de splitspaal.`, `Er mist een ander getal: samen moet het ${g(tot)} zijn.`];
        return [`${g(a, KA)} en ${g(c, KB)} is samen ${g(a + c)}.`, `Dat moet ${g(tot)} zijn.`];
      },
      toonAntwoord: async () => {
        zet(l, { beeld: { ...beeld, delen: beeld.delen.map((d) => (d.s === "paal" ? { ...d, rechts: String(rest) } : d)) }, goedIds: ["paal"] });
        await l.zeg(`${g(tot)} kun je splitsen in ${g(a, KA)} en ${g(rest, KB)}.`);
        await l.wacht(300);
      },
    });
  };
}

/**
 * Level 2, de ballen: ze vallen zichtbaar (met een plopje per bal, steeds hoger) rechtstreeks in de twee kamers van
 * een groot huisje. Eronder staan drie huisjes in eigen vakken: welk huisje past bij wat je zag vallen?
 */
function s1MachineOpbouw(a: number, b: number, opties: Huis[], stippen: boolean) {
  const tot = a + b;
  const [HX, HY, HB] = [490, 300, 380];
  const f = HB / 240;
  const kamerH = 92 * f;
  const kx = [HX - HB / 4, HX + HB / 4];
  const ky = HY + kamerH / 2;
  const id = `s1-machine-${a}-${b}`;
  const beeld: Beeld = (() => {
    const delen: Deel[] = [{ s: "huisje", id: "grootHuis", x: HX, y: HY, b: HB, top: "", links: "", rechts: "" }];
    opties.forEach(([t, x, y], i) => {
      delen.push({ s: "huisje", id: `k${i}`, x: KOLOM[i], y: 548, b: 200, top: String(t), links: String(x), rechts: String(y), stippen, kleuren: GK });
      delen.push({ s: "tik", id: `k${i}`, x: KOLOM[i], y: 568, b: 236, h: 180, aria: `${t} is ${x} en ${y}` });
    });
    return { id, delen };
  })();
  const spec = (): S1Spec =>
    s1Nieuw({
      soort: "dingen" as const,
      vw: "tennisbal",
      n: tot,
      vast: true,
      kleuren: [...Array(a).fill(KA), ...Array(b).fill(KB)] as string[],
      tray: { x: HX, y: 100, per: 10, dia: 44, stap: 0 },
      deco: { vw: "splitsmachine", x: HX, y: 92, maat: 170 },
      zones: [
        { id: "l", x: kx[0], y: ky, b: HB / 2 - 14, h: kamerH - 14, kl: KA, per: 3, dia: 52 },
        { id: "r", x: kx[1], y: ky, b: HB / 2 - 14, h: kamerH - 14, kl: KB, per: 3, dia: 52 },
        ...opties.map((_, i) => ({ id: `v${i}`, x: KOLOM[i], y: 566, b: 238, h: 178, per: 1, dia: 1 })),
      ],
      oplossing: [a, b],
      fout: [a, b],
      route: Array.from({ length: tot }, (_, i) => [i, i < a ? 0 : 1] as [number, number]),
    });
  return { beeld, spec, tot };
}

function s1MachineVraag(a: number, b: number, opties: Huis[], stippen: boolean): Vraag {
  /* Herstel 7 november (BOUWREGELS 1.23): de plek van het goede antwoord wisselt per les-start; de waarden blijven. */
  opties = meng(opties);
  const tot = a + b;
  const goedId = `k${opties.findIndex(([t, x, y]) => t === tot && x === a && y === b)}`;
  const o = s1MachineOpbouw(a, b, opties, stippen);
  return (l, st) => {
    let anim: Promise<void> = Promise.resolve();
    return squlaVraag<string>(l, {
      toon: () => {
        const gen = ++s1Gen;
        const sp = o.spec();
        s1Zet(l, st, o.beeld, sp);
        anim = (async () => {
          await l.wacht(900);
          for (let t = 1; t <= tot; t++) {
            if (gen !== s1Gen) return;
            zet(l, { s1: { ...sp, auto: t } });
            await l.wacht(450);
          }
        })().catch(() => {});
      },
      vraag: ["De ballen gaan door de machine en vallen in het huisje.", "Welk huisje past erbij?", "Tik op het goede huisje."],
      antwoord: async () => {
        await anim;
        return tik(l);
      },
      isGoed: (x) => x === goedId,
      noem: (x) => {
        const [t, p, q] = opties[Number(x.slice(1))];
        return `${g(t)}, ${g(p)} en ${g(q)}`;
      },
      goed: async () => {
        goedBeeld(l, st, { goedIds: [goedId] });
        await l.zeg(bevestig());
        await l.wacht(300);
      },
      fout: () => foutBeeld(l, st),
      samen: async () => {
        ++s1Gen;
        const sp = o.spec();
        zet(l, { s1: { ...sp, auto: 0 }, actief: false });
        await l.wacht(500);
        for (let t = 1; t <= a; t++) {
          zet(l, { s1: { ...sp, auto: t } });
          await l.wacht(420);
        }
        await l.zeg("Tel de ballen in dit vak.");
        for (let t = a + 1; t <= tot; t++) {
          zet(l, { s1: { ...sp, auto: t } });
          await l.wacht(420);
        }
        await l.zeg("Tel nu de ballen in dat vak.", "Samen zijn dat alle ballen.");
        if (!krijgtVervolgvraag(l)) await l.zeg("Kijk welke getallen je hebt geteld. Zoek het huisje waar die getallen in staan.");
      },
      tip: ["Tel de ballen in de 2 vakken.", "Het goede huisje heeft die 2 getallen."],
      reactie: (x) => {
        const [t, p, q] = opties[Number(x.slice(1))];
        if (t !== tot) return [`Dat huisje is voor ${g(t)} ballen.`, `Hier zijn het er ${g(tot)}.`];
        return [`${g(t)} klopt, maar ${g(p)} en ${g(q)} niet.`, "Tel de ballen in elk vak apart."];
      },
      toonAntwoord: async () => {
        zet(l, { goedIds: [goedId], actief: false });
        await l.zeg(`${g(tot)} kun je splitsen in ${g(a, KA)} en ${g(b, KB)}.`);
        await l.wacht(300);
      },
      testAntwoord: goedId,
    });
  };
}

/* ---------- paren: de ballen die in elk huisje ontbreken ---------- */

function s1ParenVraag(paren: [number, number][]): Vraag {
  const HX = [170, 490, 810];
  const [HY, HB] = [300, 260];
  const rests = paren.map(([t, d]) => t - d);
  const n = rests.reduce((x, y) => x + y, 0);
  const id = `s1-paren-${paren.flat().join("")}`;
  const beeld: Beeld = { id, delen: paren.map(([t, d], i) => ({ s: "huisje", id: `h${i}`, x: HX[i], y: HY, b: HB, top: String(t), links: String(d), rechts: "", kleuren: GK }) as Deel) };
  return (l, st) => {
    const spec = (): S1Spec =>
      s1Nieuw({
        soort: "dingen" as const,
        vw: "tennisbal",
        kleur: KB,
        n,
        tray: { x: 490, y: 560, per: Math.min(n, 10), dia: 62 },
        zones: paren.map((_, i) => ({ id: `z${i}`, x: HX[i] + 65, y: HY + 50, b: 118, h: 96, kl: KB, per: 2, dia: 46, leeg: "?" })),
        oplossing: rests,
        fout: [rests[1], rests[0], rests[2]],
        route: rests.flatMap((r, h) => Array.from({ length: r }, (_, k) => [rests.slice(0, h).reduce((x, y) => x + y, 0) + k, h] as [number, number])),
      });
    return squlaVraag<S1St>(l, {
      toon: () => s1Zet(l, st, beeld, spec()),
      vraag: ["Elk huisje heeft nog een leeg stuk.", "Sleep de ballen die er nog bij horen in het lege stuk."],
      antwoord: () => s1Wacht(l, (x) => x.los === 0),
      isGoed: (x) => x.tel.every((c, i) => c === rests[i]),
      noem: (x) => x.tel.map((c) => g(c, KB)).join(", "),
      goed: async () => {
        goedBeeld(l, st);
        await l.zeg(bevestig());
        await l.wacht(300);
      },
      fout: () => foutBeeld(l, st),
      samen: async () => {
        const sp = spec();
        zet(l, { s1: { ...sp, auto: 0 }, actief: false });
        await l.wacht(400);
        let t = 0;
        for (let h = 0; h < paren.length; h++) {
          zet(l, { licht: [`h${h}`] });
          await l.zeg(`Kijk naar dit huisje: ${g(paren[h][0])} is ${g(paren[h][1], KA)} en nog een deel.`);
          for (let k = 0; k < rests[h]; k++) {
            zet(l, { s1: { ...sp, auto: ++t } });
            await l.wacht(420);
          }
        }
        zet(l, { licht: [] });
        await l.zeg("Tel de ballen in elk leeg stuk.");
      },
      tip: [`${g(paren[0][0])} is ${g(paren[0][1], KA)} en nog een deel.`, "Sleep zoveel ballen in het lege stuk."],
      reactie: (x) => {
        const i = Math.max(0, x.tel.findIndex((c, j) => c !== rests[j]));
        const [t, d] = paren[i];
        return [`Bij het huisje met ${g(t)} ${x.tel[i] > rests[i] ? "heb je er te veel neergelegd" : "heb je er te weinig neergelegd"}.`, `Het lege stuk is wat er nog mist na ${g(d, KA)}: tel het aan tot ${g(t)}.`];
      },
      toonAntwoord: async () => {
        await l.zeg(...paren.map(([t, d]) => `${g(t)} is ${g(d, KA)} en ${g(t - d, KB)}.`));
        await l.wacht(300);
      },
    });
  };
}

/* ---------- het tienvak: leg de ballen die onder de doek liggen ---------- */

function s1TienvakVraag(zicht: number): Vraag {
  const rest = 10 - zicht;
  const id = `s1-tien-${zicht}`;
  const beeld = (klaar: boolean): Beeld => ({
    id,
    delen: [
      { s: "tienvak", id: "doos", x: 490, y: 205, vw: "pingpongbal", n: zicht, doek: rest, kl: KA, kl2: KB },
      { s: "tekst", id: "lv", t: klaar ? String(rest) : "?", x: 490, y: 520, grootte: 48, kleur: KB },
    ],
  });
  return (l, st) => {
    const spec = (): S1Spec =>
      s1Nieuw({
        soort: "dingen" as const,
        vw: "pingpongbal",
        kleur: KB,
        n: 10,
        tray: { x: 490, y: 594, per: 5, dia: 70, stap: 80 },
        zones: [{ id: "onder", x: 490, y: 412, b: 470, h: 164, kl: KB, per: 5, dia: 70 }],
        oplossing: [rest],
        fout: [rest + 1],
        route: Array.from({ length: rest }, (_, i) => [i, 0] as [number, number]),
      });
    const onder = Array.from({ length: rest }, (_, i) => `doos.${zicht + i}`);
    return squlaVraag<S1St>(l, {
      toon: () => s1Zet(l, st, beeld(false), spec()),
      vraag: [`In de doos liggen ${g(10)} pingpongballen.`, `Je ziet er ${g(zicht, KA)}.`, "De andere liggen onder de doek.", "Leg die ballen in het vak."],
      antwoord: () => s1Wacht(l, (x) => x.tel[0] >= 1),
      isGoed: (x) => x.tel[0] === rest,
      noem: (x) => (x.tel[0] === 1 ? `${g(1, KB)} bal` : `${g(x.tel[0], KB)} ballen`),
      goed: async () => {
        goedBeeld(l, st, { uit: ["doos-doek"], goedIds: onder, beeld: beeld(true) });
        await l.zeg(bevestig());
        await l.wacht(300);
      },
      fout: () => foutBeeld(l, st),
      samen: async () => {
        zet(l, { licht: Array.from({ length: zicht }, (_, i) => `doos.${i}`) });
        await l.zeg(`Deze ${aantal(zicht, "pingpongbal", KA)} kun je zien.`);
        zet(l, { licht: ["doos"] });
        await l.zeg(`In de doos passen er ${g(10)}: 2 rijen van ${g(5)}.`);
        zet(l, { licht: onder, uit: ["doos-doek"] });
        await l.zeg("Ik til de doek even op.", rest === 1 ? "Kijk naar de oranje pingpongbal die eronder ligt." : "Tel de oranje pingpongballen die eronder liggen.");
        zet(l, { licht: [], uit: [] });
      },
      tip: ["Tel de lege plekken in de doos.", "Zoveel ballen leg je in het vak."],
      reactie: (x) => [`In het vak ${x.tel[0] === 1 ? "ligt" : "liggen"} er ${g(x.tel[0], KB)}.`, x.tel[0] > rest ? "Onder de doek ligt minder dan dat." : "Onder de doek ligt meer dan dat.", "Tel de lege plekken in de doos."],
      toonAntwoord: async () => {
        zet(l, { uit: ["doos-doek"], goedIds: onder, beeld: beeld(true) });
        await l.zeg(`${g(10)} kun je splitsen in ${g(zicht, KA)} en ${g(rest, KB)}.`);
        await l.wacht(300);
      },
    });
  };
}

/* =====================================================================
   De lessen
   ===================================================================== */

const ONDERWERP = "Splitsen";

/* ---------- Splitsen 1, level 1 ---------- */

const S1_BEGIN = s1HuisOpbouw(5, 3 - 1, "pion").beeld(false);
/** De keuzes bij de eerste vraag van Splitsen 1 level 1 (ook het voorbeeld op het beginscherm). */
const S1_EERSTE: Optie[] = [{ n: 3, vw: "pion" }, { n: 2, vw: "pion" }, { n: 4, vw: "pion" }];
void S1_EERSTE;

const splitsen1a = les({
  id: "squla-splits-splitsen1-1",
  titel: "Splitsen tot 10",
  onderwerp: ONDERWERP,
  oefening: "Splitsen 1",
  level: 1,
  kaart: KaartSplitsen,
  voorwerpen: ["pion", "voetbal", "zak", "pingpongbal", "doek", "tennisbal"],
  begin: S1_BEGIN,
  welkom: ["Splitsen is een getal in 2 stukken verdelen.", "Kun jij de pionnen in 2 vakken slepen?"],
  /* Het voorbeeld is de eerste vraag hieronder: 5 pionnen, 2 naar het paarse vak. */
  voorbeeld: voorbeeldVan(s1HuisVraag(5, 2)),
  /* Na Nee: hetzelfde voorbeeld; de pionnen gaan zelf één voor één naar hun vak. */
  uitleg: async (l, st) => {
    const b = s1HuisOpbouw(5, 2, "pion");
    const sp = b.spec();
    toon(l, st, b.beeld(false), { s1: { ...sp, auto: 0 } });
    await l.zeg(`Kijk: er zijn ${aantal(5, "pion")}.`);
    for (let t = 1; t <= 2; t++) {
      zet(l, { s1: { ...sp, auto: t } });
      await l.wacht(420);
    }
    await l.zeg(`${aantal(2, "pion", KA)} staan in het paarse vak.`);
    for (let t = 3; t <= 5; t++) {
      zet(l, { s1: { ...sp, auto: t } });
      await l.wacht(420);
    }
    zet(l, { beeld: b.beeld(true) });
    await l.zeg(`${aantal(3, "pion", KB)} staan in het oranje vak.`, `${g(5)} kun je splitsen in ${g(2, KA)} en ${g(3, KB)}.`);
    await l.verder();
  },
  /* Zoals Squla level 1, maar nu slepen: het huisje met pionnen, de zak, paren maken, het tienvak. Totaal 4–10, het gevraagde deel 1–7. */
  vragen: [
    s1HuisVraag(5, 2),
    s1HuisVraag(9, 6),
    s1HuisVraag(7, 3),
    s1HuisVraag(6, 4),
    s1HuisVraag(10, 8),
    s1HuisVraag(7, 4, "voetbal", { zak: true }),
    s1HuisVraag(6, 5, "voetbal", { zak: true }),
    s1HuisVraag(9, 6, "voetbal", { zak: true, links: false }),
    s1HuisVraag(8, 3, "voetbal", { zak: true, links: false }),
    s1ParenVraag([[5, 1], [6, 4], [8, 5]]),
    s1TienvakVraag(7),
    s1TienvakVraag(9),
    s1TienvakVraag(4),
    s1TienvakVraag(5),
    s1TienvakVraag(3),
  ],
  eind: "Je kunt getallen tot 10 splitsen.",
});

/* ---------- Splitsen 1, level 2 ---------- */

const S1B_BEGIN = paalBeeld("begin", 7, 4, "3", []);

const splitsen1b = les({
  id: "squla-splits-splitsen1-2",
  titel: "Splitsen tot 10 (moeilijker)",
  onderwerp: ONDERWERP,
  oefening: "Splitsen 1",
  level: 2,
  kaart: KaartSplitsen,
  voorwerpen: ["splitsmachine", "bakje", "tennisbal", "voetbalshirt", "voetbal", "basketbal"],
  begin: S1B_BEGIN,
  welkom: ["De ballen gaan door de splitsmachine.", "Welk huisje past erbij?"],
  /* Het voorbeeld is de eerste vraag hieronder (de machine heeft de ballen al verdeeld). */
  voorbeeld: voorbeeldVan(s1MachineVraag(2, 4, [[5, 2, 3], [6, 2, 4], [6, 3, 3]], true)),
  uitleg: async (l, st) => {
    /* Eerst het voorbeeld zelf: de ballen vallen in de twee kamers van het huisje; welk huisje past erbij? */
    ++s1Gen;
    const mo = s1MachineOpbouw(2, 4, [[5, 2, 3], [6, 2, 4], [6, 3, 3]], true);
    const sp = mo.spec();
    toon(l, st, mo.beeld, { s1: { ...sp, auto: 0 } });
    await l.wacht(500);
    for (let t = 1; t <= 2; t++) {
      zet(l, { s1: { ...sp, auto: t } });
      await l.wacht(420);
    }
    await l.zeg(`In dit vak liggen ${aantal(2, "tennisbal", KA)}.`);
    for (let t = 3; t <= 6; t++) {
      zet(l, { s1: { ...sp, auto: t } });
      await l.wacht(420);
    }
    await l.zeg(`In dat vak liggen ${aantal(4, "tennisbal", KB)}.`, `Samen zijn dat ${g(6)} ballen.`, `${g(6)} kun je splitsen in ${g(2, KA)} en ${g(4, KB)}.`, "Zoek het huisje met die getallen.");
    await l.verder();
    /* Zo schrijf je een splitsing ook op: de splitspaal. */
    toon(l, st, S1B_BEGIN, { s1: null });
    zet(l, { licht: ["paal"] });
    await l.zeg(`Dit is een splitspaal.`, `Bovenaan staat ${g(7)}.`, `Onder staan ${g(4, KA)} en ${g(3, KB)}.`, `${g(7)} kun je splitsen in ${g(4, KA)} en ${g(3, KB)}.`);
    zet(l, { licht: [] });
    await l.verder();
  },
  /* Zoals Squla level 2, maar nu slepen: de machine (eerst met stippen, dan zonder), de splitspaal met shirts, met ballen en kaal. Totaal 5–10, delen 0–7. */
  vragen: [
    s1MachineVraag(2, 4, [[5, 2, 3], [6, 2, 4], [6, 3, 3]], true),
    s1MachineVraag(4, 3, [[7, 4, 3], [6, 4, 2], [8, 4, 4]], true),
    s1MachineVraag(5, 2, [[7, 6, 1], [6, 5, 1], [7, 5, 2]], false),
    s1MachineVraag(3, 5, [[8, 4, 4], [8, 3, 5], [9, 3, 6]], false),
    s1ShirtVraag(6, 2),
    s1ShirtVraag(8, 5),
    s1ShirtVraag(9, 3),
    s1ShirtVraag(5, 4),
    s1PaalVraag(10, 6, [4, 5, 6], true),
    s1PaalVraag(10, 2, [7, 8, 9], true),
    s1PaalVraag(10, 5, [4, 5, 6], true),
    s1PaalVraag(10, 8, [2, 3, 1], false),
    s1PaalVraag(10, 3, [6, 7, 8], false),
    s1PaalVraag(10, 10, [1, 0, 10], false),
    s1PaalVraag(10, 1, [9, 8, 10], false),
  ],
  eind: "Je kunt splitsen met de splitspaal.",
});

/* ---------- Splitsen 2, level 1 ---------- */

const S2A_BEGIN: Beeld = { id: "begin", delen: [...geldDelen(3), { s: "huisje", id: "h", x: 490, y: 390, b: 360, top: "13", links: "10", rechts: "3" }] };

const S2A_EERSTE = huisGetal(14, 10, null, [4, 10, 14], true);

const splitsen2a = les({
  id: "squla-splits-splitsen2-1",
  titel: "Splitsen tot 20",
  onderwerp: ONDERWERP,
  oefening: "Splitsen 2",
  level: 1,
  kaart: KaartSplitsen,
  voorwerpen: [],
  begin: S2A_BEGIN,
  welkom: ["Een briefje van 10 en 4 munten.", "Welk getal mist er nog in het huisje?"],
  /* Het voorbeeld is de eerste vraag hieronder. */
  /* Herstel ronde 2 (7 nov): voorbeeld en eerste vraag delen dezelfde vraag, zodat de tegels op het beginscherm in
     dezelfde volgorde staan als bij de eerste vraag (de plek wisselt nog steeds per les-start). */
  voorbeeld: voorbeeldVan(S2A_EERSTE),
  uitleg: async (l, st) => {
    toon(l, st, S2A_BEGIN);
    zet(l, { licht: ["briefje"] });
    await l.zeg(`Kijk: een briefje van ${g(10)} euro.`);
    zet(l, { licht: ["munten"] });
    await l.zeg(`En ${g(3)} munten van 1 euro.`);
    zet(l, { licht: [] });
    await l.zeg(`Samen is dat ${g(13)} euro.`);
    zet(l, { licht: ["h"] });
    await l.zeg(`${g(13)} kun je splitsen in ${g(10)} en ${g(3)}.`);
    zet(l, { licht: [] });
    await l.verder();
  },
  /* Zoals Squla level 1: eerst met geld als steuntje, dan de lege plek links, dan "kies er twee", dan door elkaar. Totaal 10–19. */
  vragen: [
    S2A_EERSTE,
    huisGetal(17, 10, null, [6, 7, 17], true),
    huisGetal(11, 10, null, [1, 2, 11], true),
    huisGetal(15, 10, null, [5, 10, 4], true),
    huisGetal(16, null, 6, [6, 10, 16], false),
    huisGetal(12, null, 2, [20, 10, 2], false),
    huisGetal(18, null, 8, [10, 8, 1], false),
    huisTwee(15, [10, 5, 5]),
    huisTwee(13, [3, 10, 10]),
    huisTwee(19, [10, 9, 9]),
    huisGetal(14, 4, null, [10, 4, 8], false),
    huisGetal(18, null, 10, [8, 18, 9], false),
    huisGetal(10, 10, null, [0, 1, 10], false),
    huisGetal(16, 10, null, [6, 7, 16], false),
    huisGetal(11, null, 10, [1, 10, 11], false),
  ],
  eind: "Je kunt getallen tot 20 splitsen.",
});

/* ---------- Splitsen 2, level 2 ---------- */

const S2B_BEGIN: Beeld = { id: "begin", delen: [{ s: "huisje", id: "h", x: 490, y: 390, b: 360, top: "12", links: "10", rechts: "2" }] };

const splitsen2b = les({
  id: "squla-splits-splitsen2-2",
  titel: "Splitsen tot 20 (moeilijker)",
  onderwerp: ONDERWERP,
  oefening: "Splitsen 2",
  level: 2,
  kaart: KaartSplitsen,
  voorwerpen: [],
  begin: S2B_BEGIN,
  welkom: ["Bij elk huisje hoort een som.", "Welke som past bij dit huisje?"],
  /* Het voorbeeld is de eerste vraag hieronder. */
  voorbeeld: voorbeeldVan(huisSom(13, 10, 3, ["10 = 7 + 3", "13 = 10 + 3", "16 = 13 + 3"], true)),
  uitleg: async (l, st) => {
    toon(l, st, S2B_BEGIN);
    zet(l, { licht: ["h"] });
    await l.zeg(`Kijk: bovenaan staat ${g(12)}.`, `Onder staan ${g(10)} en ${g(2)}.`, `De som is: ${g(12)} = ${g(10)} + ${g(2)}.`);
    zet(l, { licht: [] });
    await l.verder();
  },
  /* Zoals Squla level 2: welke som past (met en zonder geld), kies twee sommen, ook zonder 10, en verbinden. Totaal 8–20. */
  vragen: [
    huisSom(13, 10, 3, ["10 = 7 + 3", "13 = 10 + 3", "16 = 13 + 3"], true),
    huisSom(16, 10, 6, ["10 = 4 + 6", "20 = 10 + 10", "16 = 10 + 6"], true),
    huisSom(19, 10, 9, ["19 = 10 + 9", "9 = 9 + 0", "18 = 10 + 8"], false),
    huisSom(14, 10, 4, ["10 = 6 + 4", "14 = 10 + 4", "15 = 10 + 5"], false),
    huisTweeSommen(12, 10, 2, ["12 = 10 + 2", "10 = 8 + 2", "12 = 2 + 10"]),
    huisTweeSommen(17, 7, 10, ["16 = 8 + 8", "17 = 7 + 10", "17 = 10 + 7"]),
    huisTweeSommen(15, 5, 10, ["15 = 10 + 5", "10 = 5 + 5", "15 = 5 + 10"]),
    huisSom(14, 7, 7, ["14 = 7 + 7", "7 = 3 + 4", "14 = 7 + 8"], false),
    huisSom(8, 2, 6, ["8 = 8 + 0", "8 = 2 + 6", "10 = 2 + 8"], false),
    huisSom(13, 9, 4, ["13 = 10 + 3", "12 = 9 + 3", "13 = 9 + 4"], false),
    huisSom(9, 7, 2, ["10 = 7 + 3", "9 = 7 + 2", "9 = 8 + 1"], false),
    huisSom(12, 7, 5, ["12 = 7 + 5", "12 = 10 + 2", "14 = 7 + 7"], false),
    verbindVraag([[17, 10, 7], [9, 3, 6], [11, 8, 3]], [1, 0, 2]),
    verbindVraag([[20, 10, 10], [14, 4, 10], [8, 6, 2]], [2, 0, 1]),
    verbindVraag([[13, 10, 3], [16, 9, 7], [10, 4, 6]], [1, 2, 0]),
  ],
  eind: "Je kunt bij een splitsing een som maken.",
});

/* ---------- Delen ---------- */

const delen = les({
  id: "squla-splits-delen-1",
  titel: "Eerlijk verdelen",
  onderwerp: ONDERWERP,
  oefening: "Delen",
  level: 1,
  kaart: KaartDelen,
  voorwerpen: ["knikker", "stuiterbal", "bakje", "potlood", "pennenbeker", "beker-leeg"],
  begin: null,
  welkom: ["Kijk, knikkers en 2 bakjes.", "Kun jij de knikkers eerlijk verdelen?"],
  /* Het voorbeeld is de eerste vraag hieronder: 8 knikkers en 2 bakjes. */
  voorbeeld: voorbeeldVan(sleepVraag(8, 2)),
  /* Na Nee: hetzelfde voorbeeld (8 knikkers, 2 bakjes); de knikkers rollen zelf één voor één over de bakjes. */
  uitleg: async (l) => {
    await rolOver(l, { n: 8, k: 2, nr: sleepNr });
    await l.zeg("Alles is verdeeld.");
    zet(l, { licht: ["sl.bakjes"] });
    await l.zeg("In elk bakje liggen evenveel knikkers.");
    zet(l, { licht: [] });
    await l.zeg(`${somBakjes([4, 4])} = ${g(8)}.`);
    await l.verder();
  },
  /* Zoals Squla: eerst verdelen (nu zelf slepen), dan een getal kiezen, typen, weer verdelen, de potloden en een getal. Totaal 6–16, 2–5 bakjes, uitkomst 2–5. */
  vragen: [
    sleepVraag(8, 2),
    sleepVraag(12, 3),
    sleepVraag(10, 2),
    sleepVraag(15, 5),
    sleepVraag(10, 5),
    delenVraag(16, 4, "knikker", { vorm: "hoopjes", per: 4 }, [3, 4, 5]),
    delenVraag(10, 2, "knikker", { vorm: "hoopjes", per: 5 }, [4, 5, 6]),
    sleepVraag(8, 2, "stuiterbal"),
    sleepVraag(9, 3, "stuiterbal"),
    sleepVraag(16, 4),
    sleepVraag(12, 3),
    sleepVraag(6, 3),
    potlodenVraag(12, 4, [2, 3, 4]),
    potlodenVraag(10, 2, [4, 5, 6]),
    delenVraag(15, 3, "knikker", { vorm: "hoopjes", per: 5 }, [3, 4, 5]),
  ],
  eind: "Je kunt eerlijk verdelen.",
});

export const LESSEN_SQULA_SPLITSEN = [splitsen1a, splitsen1b, splitsen2a, splitsen2b, delen];
