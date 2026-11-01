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

import type { Lesgids } from "../soort";
import { squlaVraag } from "./squla-hulp";
import { foutBeeld, g, goedBeeld, kiesGetal, kiesTekst, kiesTwee, les, staafBeeld, tik, toon, typGetal, zet, type Stand, type Vraag } from "./squla-splitsen-hulp";
import { KaartDelen, KaartSplitsen, type Beeld, type Deel } from "../vlakken/squla-splitsen-vlak";

/* =====================================================================
   Woorden
   ===================================================================== */

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
const ANDERS: Record<string, [string, string]> = { voetbal: ["voetbal", "voetballen"] };
const aantalAnders = (n: number, vw: string) => `${g(n, KB)} ${(ANDERS[vw] ?? NAAM[vw])[n === 1 ? 0 : 1]}`;

const KOLOM = [200, 490, 780];

/** Gekoppelde kleuren (BOUWREGELS 2.1): het eerste deel van een splitsing is paars, het tweede oranje; de dingen en de getallen hebben dezelfde kleur. */
const KA = "paars";
const KB = "oranje";
const GK = { links: KA, rechts: KB };

/* =====================================================================
   Splitsen 1 · level 1: het splitshuisje met dingen, de zak, paren, het tienvak
   ===================================================================== */

type Optie = { n: number; vw: string };

/** De plekken van het grote huisje met dingen erin. */
const GROOT = { x: 490, y: 330, b: 520, kamerY: 430, links: 360, rechts: 620 };

function huisBeeld(id: string, tot: number, deel: number, links: boolean, vw: string, zak: boolean, opties: Optie[]): Beeld {
  const rest = tot - deel;
  const bekend = links ? GROOT.links : GROOT.rechts;
  const ander = links ? GROOT.rechts : GROOT.links;
  const delen: Deel[] = [
    { s: "huisje", id: "huis", x: GROOT.x, y: GROOT.y, b: GROOT.b, top: "", links: "", rechts: "" },
    { s: "groep", id: "top", vw, n: tot, x: GROOT.x, y: 280, per: 5, cel: 46, kleuren: Array.from({ length: tot }, (_, i) => (i < deel ? KA : KB)) },
    { s: "groep", id: "deel", vw, n: deel, x: bekend, y: GROOT.kamerY, per: 4, cel: 54, kl: KA },
    { s: "groep", id: "in", vw, n: rest, x: ander, y: GROOT.kamerY, per: 4, cel: 54, verborgen: true, kl: KB },
  ];
  if (zak) delen.push({ s: "ding", id: "zak", vw: "zak", x: ander, y: GROOT.kamerY, maat: 150 });
  opties.forEach((o, i) => {
    delen.push({ s: "groep", id: `k${i}`, vw: o.vw, n: o.n, x: KOLOM[i], y: 628, per: 5, cel: 50, kl: KB });
    delen.push({ s: "tik", id: `k${i}`, x: KOLOM[i], y: 628, b: 250, h: 120, aria: `${o.n}` });
  });
  return { id, delen };
}

function huisVraag(tot: number, deel: number, opties: Optie[], o: { vw?: string; zak?: boolean; links?: boolean } = {}): Vraag {
  const vw = o.vw ?? "pion";
  const zak = o.zak ?? false;
  const links = o.links ?? true;
  const rest = tot - deel;
  return (l, st) => {
    const id = `huis-${tot}-${deel}-${vw}-${zak}`;
    const beeld = huisBeeld(id, tot, deel, links, vw, zak, opties);
    const goedId = `k${opties.findIndex((x) => x.n === rest && x.vw === vw)}`;
    const vraag = zak
      ? [`Er zijn ${aantal(tot, vw)}.`, `Er ${deel === 1 ? "ligt" : "liggen"} ${aantal(deel, vw, KA)} naast de zak.`, "Hoeveel ballen zitten er in de zak?", "Tik op het goede plaatje."]
      : [`Er zijn ${aantal(tot, vw)}.`, `${aantal(deel, vw, KA)} ${deel === 1 ? "staat" : "staan"} aan de ene kant.`, `Hoeveel ${NAAM[vw][1]} staan er aan de andere kant?`, "Tik op het goede plaatje."];
    return squlaVraag<string>(l, {
      toon: () => {
        toon(l, st, beeld);
      },
      vraag,
      antwoord: () => tik(l),
      isGoed: (x) => x === goedId,
      noem: (x) => {
        const k = opties[Number(x.slice(1))];
        return k.vw === vw ? aantal(k.n, vw) : aantalAnders(k.n, k.vw);
      },
      goed: async () => {
        goedBeeld(l, st, { goedIds: [goedId], toon: ["in"], uit: zak ? ["zak"] : [] });
        await l.zeg(zak ? `Ja! In de zak ${rest === 1 ? "zit" : "zitten"} ${aantal(rest, vw, KB)}.` : "Ja!", `${g(tot)} kun je splitsen in ${g(deel, KA)} en ${g(rest, KB)}.`);
        await l.wacht(300);
      },
      fout: () => foutBeeld(l, st),
      samen: async () => {
        zet(l, { licht: ["top"] });
        await l.zeg(`Kijk: samen zijn het er ${g(tot)}.`);
        zet(l, { licht: ["deel"], uit: Array.from({ length: deel }, (_, i) => `top.${i}`) });
        await l.zeg(zak ? `${aantal(deel, vw, KA)} ${deel === 1 ? "ligt" : "liggen"} naast de zak.` : `${aantal(deel, vw, KA)} ${deel === 1 ? "staat" : "staan"} al aan de ene kant.`, "Die maak ik grijs.");
        zet(l, { licht: Array.from({ length: rest }, (_, i) => `top.${deel + i}`) });
        await l.zeg(zak ? "De andere zitten in de zak." : "De andere staan aan de andere kant.", "Tel de lichtjes maar.");
        if (opties.some((x) => x.vw !== vw)) await l.zeg(`Let op: het moeten ${NAAM[vw][1]} zijn.`);
      },
      tip: [`Tel de ${NAAM[vw][1]} die oplichten.`],
      testAntwoord: goedId,
    });
  };
}

/** Het tienvak (een eierdoos van 2 rijen van 5) met een doek over een paar vakjes. */
function tienvakVraag(zicht: number, keuzes: number[]): Vraag {
  const rest = 10 - zicht;
  return (l, st) => {
    const beeld: Beeld = { id: `tien-${zicht}`, delen: [{ s: "tienvak", id: "doos", x: 490, y: 380, vw: "pingpongbal", n: zicht, doek: rest, kl: KA, kl2: KB }] };
    const onder = Array.from({ length: rest }, (_, i) => `doos.${zicht + i}`);
    return squlaVraag<number>(l, {
      toon: () => {
        toon(l, st, beeld);
      },
      vraag: [`In de doos liggen ${g(10)} pingpongballen.`, "Een paar liggen onder de doek.", "Hoeveel pingpongballen liggen er onder de doek?"],
      antwoord: () => kiesGetal(l, keuzes),
      isGoed: (x) => x === rest,
      noem: (x) => g(x),
      goed: async () => {
        goedBeeld(l, st, { uit: ["doos-doek"], goedIds: onder });
        await l.zeg("Ja!", `${g(10)} kun je splitsen in ${g(zicht, KA)} en ${g(rest, KB)}.`);
        await l.wacht(300);
      },
      fout: () => foutBeeld(l, st),
      samen: async () => {
        zet(l, { licht: Array.from({ length: zicht }, (_, i) => `doos.${i}`) });
        await l.zeg(`Deze ${aantal(zicht, "pingpongbal", KA)} kun je zien.`);
        zet(l, { licht: ["doos"] });
        await l.zeg(`In de doos passen er ${g(10)}: twee rijen van ${g(5)}.`);
        zet(l, { licht: onder, uit: ["doos-doek"] });
        await l.zeg("Ik til de doek even op.", "Tel de oranje pingpongballen die eronder liggen.");
      },
      tip: ["Tel de vakjes onder de doek."],
      testAntwoord: rest,
    });
  };
}

/** Paren maken: een huisje met een leeg stuk, en de ballen die erbij horen. */
function parenVraag(paren: [number, number][]): Vraag {
  /* De plekken door elkaar, zoals op een tafel: huisje, ballen, huisje / ballen, huisje, ballen. */
  const cellen: [string, number][] = [["h", 0], ["b", 2], ["h", 1], ["b", 0], ["h", 2], ["b", 1]];
  const plek = (i: number) => ({ x: KOLOM[i % 3], y: i < 3 ? 250 : 520 });
  return async (l, st) => {
    const basis: Deel[] = [];
    cellen.forEach(([soort, p], i) => {
      const q = plek(i);
      const [tot, deel] = paren[p];
      if (soort === "h") {
        basis.push({ s: "huisje", id: `h${p}`, x: q.x, y: q.y - 20, b: 170, top: String(tot), links: String(deel), rechts: "?", kleuren: GK });
        basis.push({ s: "tik", id: `h${p}`, x: q.x, y: q.y, b: 230, h: 190, aria: `${tot} is ${deel} en hoeveel?` });
      } else {
        basis.push({ s: "groep", id: `b${p}`, vw: "tennisbal", n: tot - deel, x: q.x, y: q.y, per: 3, cel: 54, kl: KB });
        basis.push({ s: "tik", id: `b${p}`, x: q.x, y: q.y, b: 230, h: 190, aria: `${tot - deel} ballen` });
      }
    });
    const beeld: Beeld = { id: `paren-${paren.flat().join("")}`, delen: basis };
    const klaar: number[] = [];
    let alles = true;
    for (let keer = 0; keer < paren.length; keer++) {
      const open = paren.map((_, i) => i).filter((i) => !klaar.includes(i));
      const eerste = open[0];
      const [tot, deel] = paren[eerste];
      const eerst = keer === 0;
      const gedaan = () => klaar.flatMap((i) => [`h${i}`, `b${i}`]);
      const meteen = await squlaVraag<[string, string]>(l, {
        toon: () => {
          toon(l, st, beeld);
          zet(l, { uit: gedaan(), goedIds: [] });
        },
        vraag: eerst ? ["Welke twee horen bij elkaar?", "Tik op een huisje.", "Tik dan op de ballen die erbij horen."] : ["Welke twee horen nog bij elkaar?"],
        antwoord: () => kiesTwee(l, `h${eerste}`, (a) => (a.startsWith("h") ? `b${a.slice(1)}` : `h${a.slice(1)}`)),
        isGoed: ([a, b]) => a.slice(1) === b.slice(1) && a[0] !== b[0] && open.includes(Number(a.slice(1))),
        noem: () => "Die twee",
        goed: async ([a]) => {
          const p = Number(a.slice(1));
          const [t, d] = paren[p];
          goedBeeld(l, st, { goedIds: [`h${p}`, `b${p}`] });
          await l.zeg(`Ja! ${g(t)} is ${g(d, KA)} en ${g(t - d, KB)}.`);
          klaar.push(p);
          zet(l, { goedIds: [], uit: gedaan() });
        },
        fout: () => foutBeeld(l, st),
        samen: async () => {
          zet(l, { licht: [`h${eerste}`] });
          await l.zeg("Kijk naar dit huisje.", `Bovenaan staat ${g(tot)}.`, `Aan de ene kant staat ${g(deel, KA)}.`, "Hoeveel ballen horen er aan de andere kant?", "Zoek die ballen.");
        },
        tip: [`${g(tot)} is ${g(deel)} en nog hoeveel?`, "Zoek die ballen."],
        testAntwoord: `h${eerste}`,
      });
      if (!meteen) alles = false;
    }
    return alles;
  };
}

/* =====================================================================
   Splitsen 1 · level 2: de splitsmachine en de splitspaal
   ===================================================================== */

type Huis = [number, number, number];

function machineVraag(a: number, b: number, opties: Huis[], stippen: boolean): Vraag {
  const tot = a + b;
  const goedId = `k${opties.findIndex(([t, x, y]) => t === tot && x === a && y === b)}`;
  return (l, st) => {
    const delen: Deel[] = [
      { s: "ding", id: "machine", vw: "splitsmachine", x: 490, y: 170, maat: 170 },
      { s: "ding", id: "bak-l", vw: "bakje", x: 290, y: 400, maat: 170 },
      { s: "ding", id: "bak-r", vw: "bakje", x: 690, y: 400, maat: 170 },
      { s: "groep", id: "bl", vw: "tennisbal", n: a, x: 290, y: 410, per: 5, cel: 32, kl: KA },
      { s: "groep", id: "br", vw: "tennisbal", n: b, x: 690, y: 410, per: 5, cel: 32, kl: KB },
    ];
    opties.forEach(([t, x, y], i) => {
      delen.push({ s: "huisje", id: `k${i}`, x: KOLOM[i], y: 548, b: 200, top: String(t), links: String(x), rechts: String(y), stippen, kleuren: GK });
      delen.push({ s: "tik", id: `k${i}`, x: KOLOM[i], y: 568, b: 236, h: 180, aria: `${t} is ${x} en ${y}` });
    });
    const beeld: Beeld = { id: `machine-${a}-${b}-${stippen}`, delen };
    return squlaVraag<string>(l, {
      toon: () => {
        toon(l, st, beeld);
      },
      vraag: ["De machine verdeelt de ballen over twee bakjes.", "Welke splitsing hoort erbij?", "Tik op het goede huisje."],
      antwoord: () => tik(l),
      isGoed: (x) => x === goedId,
      noem: (x) => {
        const [t, p, q] = opties[Number(x.slice(1))];
        return `${g(t)}, ${g(p)} en ${g(q)}`;
      },
      goed: async () => {
        goedBeeld(l, st, { goedIds: [goedId] });
        await l.zeg(`Ja! ${aantal(a, "tennisbal", KA)} en ${aantal(b, "tennisbal", KB)}.`, `${g(tot)} kun je splitsen in ${g(a, KA)} en ${g(b, KB)}.`);
        await l.wacht(300);
      },
      fout: () => foutBeeld(l, st),
      samen: async () => {
        zet(l, { licht: ["bl"] });
        await l.zeg("Tel de ballen in dit bakje.");
        await l.wacht(1200);
        zet(l, { licht: ["br"] });
        await l.zeg("Tel nu de ballen in dat bakje.");
        await l.wacht(1200);
        zet(l, { licht: ["bl", "br"] });
        await l.zeg("Hoeveel zijn het samen?", "Zoek het huisje met die drie getallen.");
        zet(l, { licht: [] });
      },
      tip: ["Bovenaan staat hoeveel het er samen zijn.", "Onder staan de twee bakjes."],
      testAntwoord: goedId,
    });
  };
}

function paalBeeld(id: string, tot: number, a: number, rechts: string, extra: Deel[]): Beeld {
  return { id, delen: [{ s: "paal", id: "paal", x: 490, y: 140, top: String(tot), links: String(a), rechts, kleuren: GK }, ...extra] };
}

/** De splitspaal met shirts; kies het plaatje met het goede aantal. */
function shirtVraag(tot: number, a: number, opties: Optie[]): Vraag {
  const rest = tot - a;
  const goedId = `k${opties.findIndex((x) => x.n === rest && x.vw === "voetbalshirt")}`;
  return (l, st) => {
    const extra: Deel[] = [{ s: "groep", id: "sl", vw: "voetbalshirt", n: a, x: 390, y: 425, per: 4, cel: 54, kl: KA }];
    opties.forEach((o, i) => {
      extra.push({ s: "groep", id: `k${i}`, vw: o.vw, n: o.n, x: KOLOM[i], y: 590, per: 5, cel: 40, label: String(o.n), kl: KB });
      extra.push({ s: "tik", id: `k${i}`, x: KOLOM[i], y: 604, b: 240, h: 150, aria: `${o.n}` });
    });
    const id = `shirt-${tot}-${a}`;
    const beeld = paalBeeld(id, tot, a, "?", extra);
    return squlaVraag<string>(l, {
      toon: () => {
        toon(l, st, beeld);
      },
      vraag: ["Kijk naar de splitspaal.", "Welk getal mist er nog?", "Tik op het goede plaatje."],
      antwoord: () => tik(l),
      isGoed: (x) => x === goedId,
      noem: (x) => {
        const k = opties[Number(x.slice(1))];
        return k.vw === "voetbalshirt" ? aantal(k.n, k.vw) : aantalAnders(k.n, k.vw);
      },
      goed: async () => {
        goedBeeld(l, st, { goedIds: [goedId], beeld: paalBeeld(id, tot, a, String(rest), extra) });
        await l.zeg("Ja!", `${g(tot)} kun je splitsen in ${g(a, KA)} en ${g(rest, KB)}.`);
        await l.wacht(300);
      },
      fout: () => foutBeeld(l, st),
      samen: async () => {
        zet(l, { licht: ["sl"] });
        await l.zeg(`Hier ${a === 1 ? "is" : "zijn"} ${aantal(a, "voetbalshirt", KA)}.`, `Bovenaan staat ${g(tot)}.`);
        zet(l, { licht: [] });
        await l.zeg(`Tel verder vanaf ${g(a)} tot ${g(tot)}.`, "Dat mag op je vingers.", "Hoeveel heb je erbij geteld?");
        if (opties.some((x) => x.vw !== "voetbalshirt")) await l.zeg("Let op: het moeten shirts zijn.");
      },
      tip: [`Tel verder vanaf ${g(a)} tot ${g(tot)}.`],
      testAntwoord: goedId,
    });
  };
}

/** Uitleg met staafjes (naar het filmpje): de staaf van het totaal, het bekende stuk, en wat er over is. */
async function staafUitleg(l: Lesgids, st: Stand, tot: number, deel: number) {
  toon(l, st, staafBeeld(`staaf-${tot}-${deel}-${st.goed}-${st.fout}`, tot, deel));
  await l.zeg(`Kijk: een staaf van ${g(tot)} blokjes.`);
  zet(l, { licht: ["st-o"] });
  await l.zeg(`Eronder ${deel === 1 ? "ligt" : "liggen"} ${g(deel, "oranje")} oranje ${deel === 1 ? "blokje" : "blokjes"}.`);
  zet(l, { licht: ["st-b"] });
  await l.zeg(tot - deel === 0 ? "Blijft er nog iets over?" : "Hoeveel blokjes blijven er over? Tel ze maar.");
  await l.verder();
}

/** De splitspaal van 10 (met of zonder ballen); kies het getal. */
function paalVraag(tot: number, a: number, keuzes: number[], ballen: boolean): Vraag {
  const rest = tot - a;
  return (l, st) => {
    const extra: Deel[] = ballen
      ? [
          { s: "groep", id: "gl", vw: "basketbal", n: a, x: 170, y: 330, per: 5, cel: 50, kl: KA },
          { s: "groep", id: "gr", vw: "basketbal", n: rest, x: 810, y: 330, per: 5, cel: 50, kl: KB },
        ]
      : [];
    const id = `paal-${tot}-${a}-${ballen}`;
    const beeld = paalBeeld(id, tot, a, "?", extra);
    return squlaVraag<number>(l, {
      toon: () => {
        toon(l, st, beeld);
      },
      vraag: [ballen ? "Kijk naar de ballen en de splitspaal." : "Kijk naar de splitspaal.", "Welk getal mist er nog?"],
      antwoord: () => kiesGetal(l, keuzes),
      isGoed: (x) => x === rest,
      noem: (x) => g(x),
      goed: async () => {
        goedBeeld(l, st, { goedIds: ["paal"], beeld: paalBeeld(id, tot, a, String(rest), extra) });
        await l.zeg("Ja!", `${g(tot)} kun je splitsen in ${g(a, KA)} en ${g(rest, KB)}.`);
        await l.wacht(300);
      },
      fout: () => foutBeeld(l, st),
      samen: () => staafUitleg(l, st, tot, a),
      tip: [`${g(tot)} is ${g(a)} en nog hoeveel?`],
      testAntwoord: rest,
    });
  };
}

/* =====================================================================
   Splitsen 2: tot 20, met 10 als vast deel
   ===================================================================== */

/** Geld als steuntje: een briefje van 10 en losse euro's. */
function geldDelen(los: number): Deel[] {
  const d: Deel[] = [{ s: "geld", id: "briefje", soort: "briefje-10", x: 300, y: 150, maat: 190 }];
  for (let i = 0; i < los; i++) d.push({ s: "geld", id: "munten", soort: "munt-1", x: 470 + i * 62, y: 150, maat: 54 });
  return d;
}

/** Het splitshuisje met één lege plek ("?"): kies het getal. */
function huisGetal(tot: number, links: number | null, rechts: number | null, keuzes: number[], geld: boolean): Vraag {
  const bekend = (links ?? rechts)!;
  const rest = tot - bekend;
  return (l, st) => {
    const huis = (vul?: number): Deel => ({ s: "huisje", id: "h", x: 490, y: 390, b: 360, top: String(tot), links: links === null ? (vul === undefined ? "?" : String(vul)) : String(links), rechts: rechts === null ? (vul === undefined ? "?" : String(vul)) : String(rechts) });
    const extra = geld ? geldDelen(tot - 10) : [];
    const id = `h2-${tot}-${links}-${rechts}-${geld}`;
    const beeld: Beeld = { id, delen: [...extra, huis()] };
    const eerst = links ?? rest;
    const dan = rechts ?? rest;
    return squlaVraag<number>(l, {
      toon: () => {
        toon(l, st, beeld);
      },
      vraag: [`Splits het getal ${g(tot)}.`, "Welk getal mist er nog?"],
      antwoord: () => kiesGetal(l, keuzes),
      isGoed: (x) => x === rest,
      noem: (x) => g(x),
      goed: async () => {
        goedBeeld(l, st, { goedIds: ["h"], beeld: { id, delen: [...extra, huis(rest)] } });
        await l.zeg("Ja!", `${g(tot)} kun je splitsen in ${g(eerst)} en ${g(dan)}.`);
        await l.wacht(300);
      },
      fout: () => foutBeeld(l, st),
      samen: async () => {
        if (geld) {
          zet(l, { licht: ["briefje"] });
          await l.zeg(`Kijk: een briefje van ${g(10)} euro.`);
          zet(l, { licht: ["munten"] });
          await l.zeg("En munten van één euro.", `Samen is dat ${g(tot)} euro.`, "Hoeveel munten zijn er bij de 10? Tel ze maar.");
          await l.verder();
          zet(l, { licht: [] });
          return;
        }
        await staafUitleg(l, st, tot, bekend);
      },
      tip: [`${g(tot)} is ${g(bekend)} en nog hoeveel?`],
      testAntwoord: rest,
    });
  };
}

/** Het splitshuisje met twee lege kamers: kies de twee huisjes die passen (allebei de volgordes). */
function huisTwee(tot: number, opties: [number, number][]): Vraag {
  const goed = opties.map((o, i) => (o[0] + o[1] === tot ? `k${i}` : "")).filter(Boolean);
  return (l, st) => {
    const delen: Deel[] = [{ s: "huisje", id: "h", x: 490, y: 300, b: 320, top: String(tot), links: "?", rechts: "?" }];
    opties.forEach(([a, b], i) => {
      delen.push({ s: "huisje", id: `k${i}`, x: KOLOM[i], y: 520, b: 200, top: "", links: String(a), rechts: String(b), dak: false });
      delen.push({ s: "tik", id: `k${i}`, x: KOLOM[i], y: 558, b: 236, h: 110, aria: `${a} en ${b}` });
    });
    const beeld: Beeld = { id: `twee-${tot}`, delen };
    const tien = tot - 10;
    return squlaVraag<[string, string]>(l, {
      toon: () => {
        toon(l, st, beeld);
      },
      vraag: [`Hoe kun je ${g(tot)} splitsen?`, "Er zijn twee goede huisjes.", "Tik op allebei."],
      antwoord: () => kiesTwee(l, goed[0], (a) => (goed.includes(a) ? goed.find((x) => x !== a)! : goed[0])),
      isGoed: ([a, b]) => goed.includes(a) && goed.includes(b),
      noem: () => "Die twee",
      goed: async () => {
        goedBeeld(l, st, { goedIds: goed });
        await l.zeg("Ja!", `${g(tot)} kun je splitsen in ${g(10)} en ${g(tien)}.`, `En ook in ${g(tien)} en ${g(10)}.`);
        await l.wacht(300);
      },
      fout: () => foutBeeld(l, st),
      samen: async () => {
        await staafUitleg(l, st, tot, 10);
        await l.zeg(`Zoek de huisjes met ${g(10)} en dat getal.`, "Het getal mag links of rechts staan.");
      },
      tip: [`${g(tot)} is ${g(10)} en nog hoeveel?`, "Het mag allebei: links of rechts."],
      testAntwoord: goed[0],
    });
  };
}

const somTekst = (t: number, a: number, b: number) => `${t} = ${a} + ${b}`;

/** Het huisje is helemaal ingevuld: welke som past erbij? (kies 1 uit 3) */
function huisSom(tot: number, a: number, b: number, opties: string[], geld: boolean): Vraag {
  const goed = somTekst(tot, a, b);
  return (l, st) => {
    const extra = geld ? geldDelen(tot - 10) : [];
    const beeld: Beeld = { id: `som-${tot}-${a}-${b}`, delen: [...extra, { s: "huisje", id: "h", x: 490, y: 390, b: 360, top: String(tot), links: String(a), rechts: String(b) }] };
    return squlaVraag<string>(l, {
      toon: () => {
        toon(l, st, beeld);
      },
      vraag: ["Kijk naar het huisje.", "Welke som past erbij?"],
      antwoord: () => kiesTekst(l, opties),
      isGoed: (x) => x === goed,
      noem: (x) => x,
      goed: async () => {
        goedBeeld(l, st, { goedIds: ["h"] });
        await l.zeg("Ja!", `${g(tot)} kun je splitsen in ${g(a)} en ${g(b)}.`, `${g(tot)} = ${g(a)} + ${g(b)}.`);
        await l.wacht(300);
      },
      fout: () => foutBeeld(l, st),
      samen: async () => {
        zet(l, { licht: ["h"] });
        await l.zeg(`Bovenaan staat ${g(tot)}.`, "Dat getal komt vooraan in de som.", `Onder staan ${g(a)} en ${g(b)}.`, "Die komen erachter, met een plus ertussen.", "Zoek de som met die drie getallen.");
        zet(l, { licht: [] });
      },
      tip: [`Zoek een som met ${g(tot)}, ${g(a)} en ${g(b)}.`],
      testAntwoord: goed,
    });
  };
}

/** Het ingevulde huisje: kies de twee sommen die passen. */
function huisTweeSommen(tot: number, a: number, b: number, opties: string[]): Vraag {
  const passend = (s: string) => s === somTekst(tot, a, b) || s === somTekst(tot, b, a);
  const goed = opties.map((s, i) => (passend(s) ? `k${i}` : "")).filter(Boolean);
  return (l, st) => {
    const delen: Deel[] = [{ s: "huisje", id: "h", x: 490, y: 300, b: 320, top: String(tot), links: String(a), rechts: String(b) }];
    opties.forEach((s, i) => {
      delen.push({ s: "tekst", id: `k${i}`, t: s, x: KOLOM[i], y: 590, grootte: 44 });
      delen.push({ s: "tik", id: `k${i}`, x: KOLOM[i], y: 590, b: 270, h: 96, aria: s });
    });
    const beeld: Beeld = { id: `sommen-${tot}-${a}-${b}`, delen };
    return squlaVraag<[string, string]>(l, {
      toon: () => {
        toon(l, st, beeld);
      },
      vraag: ["Kijk naar het huisje.", "Welke sommen passen erbij?", "Er zijn er twee goed. Tik op allebei."],
      antwoord: () => kiesTwee(l, goed[0], (x) => (goed.includes(x) ? goed.find((y) => y !== x)! : goed[0])),
      isGoed: ([x, y]) => goed.includes(x) && goed.includes(y),
      noem: () => "Die twee",
      goed: async () => {
        goedBeeld(l, st, { goedIds: [...goed, "h"] });
        await l.zeg("Ja!", `${g(tot)} = ${g(a)} + ${g(b)}.`, `En ${g(tot)} = ${g(b)} + ${g(a)}.`);
        await l.wacht(300);
      },
      fout: () => foutBeeld(l, st),
      samen: async () => {
        zet(l, { licht: ["h"] });
        await l.zeg(`Bovenaan staat ${g(tot)}.`, "Dat getal komt vooraan in de som.", `Onder staan ${g(a)} en ${g(b)}.`, "Die mogen in allebei de volgordes.");
        zet(l, { licht: [] });
      },
      tip: [`Zoek de sommen met ${g(tot)}, ${g(a)} en ${g(b)}.`],
      testAntwoord: goed[0],
    });
  };
}

/** Verbinden: drie huisjes links, drie sommen rechts. Tik een huisje en dan de som die erbij hoort. */
function verbindVraag(huisjes: Huis[], volgorde: number[]): Vraag {
  const Y = [170, 370, 570];
  return async (l, st) => {
    const basis: Deel[] = [];
    huisjes.forEach(([t, a, b], i) => {
      basis.push({ s: "huisje", id: `h${i}`, x: 250, y: Y[i], b: 180, top: String(t), links: String(a), rechts: String(b) });
      basis.push({ s: "tik", id: `h${i}`, x: 250, y: Y[i] + 10, b: 230, h: 160, aria: `${t} is ${a} en ${b}` });
    });
    volgorde.forEach((h, r) => {
      const [t, a, b] = huisjes[h];
      basis.push({ s: "tekst", id: `s${h}`, t: somTekst(t, a, b), x: 720, y: Y[r] + 35, grootte: 46 });
      basis.push({ s: "tik", id: `s${h}`, x: 720, y: Y[r] + 35, b: 300, h: 90, aria: somTekst(t, a, b) });
    });
    const id = `verbind-${huisjes.flat().join("-")}`;
    const lijnen: Deel[] = [];
    const beeld = () => ({ id, delen: [...basis, ...lijnen] });
    const klaar: number[] = [];
    let alles = true;
    for (let keer = 0; keer < huisjes.length; keer++) {
      const open = huisjes.map((_, i) => i).filter((i) => !klaar.includes(i));
      const eerste = open[0];
      const [t, a, b] = huisjes[eerste];
      const meteen = await squlaVraag<[string, string]>(l, {
        toon: () => {
          if (!toon(l, st, beeld())) zet(l, { beeld: beeld(), goedIds: [] });
          zet(l, { uit: klaar.flatMap((i) => [`h${i}`, `s${i}`]) });
        },
        vraag: keer === 0 ? ["Welk huisje hoort bij welke som?", "Tik op een huisje.", "Tik dan op de som die erbij hoort."] : ["Welk huisje hoort bij welke som?"],
        antwoord: () => kiesTwee(l, `h${eerste}`, (x) => (x.startsWith("h") ? `s${x.slice(1)}` : `h${x.slice(1)}`)),
        isGoed: ([x, y]) => x.slice(1) === y.slice(1) && x[0] !== y[0] && open.includes(Number(x.slice(1))),
        noem: () => "Die twee",
        goed: async ([x]) => {
          const h = Number(x.slice(1));
          const r = volgorde.indexOf(h);
          lijnen.push({ s: "lijn", id: `l${h}`, x1: 352, y1: Y[h] + 35, x2: 560, y2: Y[r] + 35, goed: true });
          goedBeeld(l, st, { beeld: beeld(), goedIds: [`h${h}`, `s${h}`] });
          const [tt, aa, bb] = huisjes[h];
          await l.zeg(`Ja! ${g(tt)} = ${g(aa)} + ${g(bb)}.`);
          klaar.push(h);
          zet(l, { goedIds: [] });
        },
        fout: () => foutBeeld(l, st),
        samen: async () => {
          zet(l, { licht: [`h${eerste}`] });
          await l.zeg("Kijk naar dit huisje.", `Er staan ${g(t)}, ${g(a)} en ${g(b)} in.`, "Maak met die drie getallen een som.", "Zoek die som.");
        },
        tip: [`Zoek de som met ${g(t)}, ${g(a)} en ${g(b)}.`],
        testAntwoord: `h${eerste}`,
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
    for (let h = 0; h < hoop; h++) d.push({ s: "groep", id: `bron-${h}`, vw, n: Math.min(bron.per, n - h * bron.per), x: 490 + (h - (hoop - 1) / 2) * 200, y: 200, per: 3, cel: 42 });
  }
  for (let j = 0; j < k; j++) {
    d.push({ s: "ding", id: `bak${j}`, vw: "bakje", x: bakX(j, k), y: 400, maat: 130 });
    for (let r = 0; r < m; r++) {
      /* Hoogstens 3 naast elkaar; de rest erboven. */
      const rij = Math.floor(r / 3);
      const inRij = Math.min(3, m - rij * 3);
      d.push({ s: "ding", id: `in${j}-${r}`, vw, x: bakX(j, k) + ((r % 3) - (inRij - 1) / 2) * 34, y: 384 - rij * 30, maat: 32, verborgen: true });
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
  await l.zeg(`We verdelen de ${NAAM[vw][1]} één voor één.`, "Elk bakje krijgt er steeds één bij.");
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
  await l.zeg("Alles is verdeeld.", "Tel wat er in één bakje ligt.");
}

const herhaal = (m: number, k: number) => Array.from({ length: k }, () => g(m)).join(" + ");

type Antwoordvorm = { soort: "plaatje"; opties: number[] } | { soort: "getal"; keuzes: number[] } | { soort: "typen" };

function delenVraag(n: number, k: number, vw: string, bron: Bron, vorm: Antwoordvorm): Vraag {
  const m = n / k;
  const [een, veel] = NAAM[vw];
  return (l, st) => {
    const delen = verdeelDelen(n, k, vw, bron);
    if (vorm.soort === "plaatje")
      vorm.opties.forEach((o, i) => {
        delen.push({ s: "ding", id: `kb${i}`, vw: "bakje", x: KOLOM[i], y: 640, maat: 110 });
        delen.push({ s: "groep", id: `k${i}`, vw, n: o, x: KOLOM[i], y: 610, per: 5, cel: 36 });
        delen.push({ s: "tik", id: `k${i}`, x: KOLOM[i], y: 630, b: 220, h: 120, aria: `${o} ${o === 1 ? een : veel}` });
      });
    const beeld: Beeld = { id: `delen-${n}-${k}-${vw}-${vorm.soort}`, delen };
    const goedId = vorm.soort === "plaatje" ? `k${vorm.opties.indexOf(m)}` : "";
    const vraag = [`Er zijn ${aantal(n, vw)}.`, `Verdeel ze eerlijk over de ${g(k)} bakjes.`, `Hoeveel ${veel} komen er in elk bakje?`];
    if (vorm.soort === "plaatje") vraag.push("Tik op het goede plaatje.");
    return squlaVraag<number>(l, {
      toon: () => {
        toon(l, st, beeld);
      },
      vraag,
      antwoord: async () => {
        if (vorm.soort === "plaatje") return vorm.opties[Number((await tik(l)).slice(1))];
        if (vorm.soort === "getal") return kiesGetal(l, vorm.keuzes);
        return typGetal(l, st);
      },
      isGoed: (x) => x === m,
      noem: (x) => (vorm.soort === "plaatje" ? aantal(x, vw) : g(x)),
      goed: async () => {
        goedBeeld(l, st, { toon: alleIn(k, m), uit: bronIds(n, bron), goedIds: goedId ? [goedId] : [] });
        await l.zeg(`Ja! Elk bakje krijgt ${aantal(m, vw)}.`, `${herhaal(m, k)} = ${g(n)}.`);
        await l.wacht(300);
      },
      fout: () => foutBeeld(l, st),
      samen: () => verdeel(l, n, k, vw, bron),
      tip: [`Tel de ${veel} in één bakje.`],
      testAntwoord: vorm.soort === "plaatje" ? goedId : m,
    });
  };
}

/** Potloden in bekers: in welke rij zijn ze eerlijk verdeeld? */
function potlodenVraag(n: number, k: number, rijen: number[]): Vraag {
  const m = n / k;
  const Y = [190, 365, 540];
  return (l, st) => {
    const delen: Deel[] = [];
    rijen.forEach((p, r) => {
      for (let j = 0; j < k; j++) {
        const x = 490 + (j - (k - 1) / 2) * 150;
        delen.push({ s: "groep", id: `r${r}`, vw: "potlood", n: p, x, y: Y[r] - 4, per: 6, cel: 16, maat: 66 });
        delen.push({ s: "ding", id: `r${r}`, vw: "pennenbeker", x, y: Y[r] + 34, maat: 84 });
      }
      delen.push({ s: "tik", id: `r${r}`, x: 490, y: Y[r] + 4, b: Math.max(300, k * 150), h: 150, aria: `${p} potloden per beker` });
    });
    const goedId = `r${rijen.indexOf(m)}`;
    const beeld: Beeld = { id: `potlood-${n}-${k}`, delen };
    return squlaVraag<string>(l, {
      toon: () => {
        toon(l, st, beeld);
      },
      vraag: [`Waar zijn ${g(n)} potloden eerlijk verdeeld?`, `Ze staan in ${g(k)} bekers.`, "Tik op de goede rij."],
      antwoord: () => tik(l),
      isGoed: (x) => x === goedId,
      noem: () => "Die rij",
      goed: async () => {
        goedBeeld(l, st, { goedIds: [goedId] });
        await l.zeg(`Ja! In elke beker staan ${aantal(m, "potlood")}.`, `${herhaal(m, k)} = ${g(n)}.`);
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
        await l.zeg(`In welke rij zijn het er ${g(n)}?`);
      },
      tip: [`Tel alle potloden in een rij.`, `Zijn het er ${g(n)}?`],
      testAntwoord: goedId,
    });
  };
}

/* =====================================================================
   De lessen
   ===================================================================== */

const ONDERWERP = "Splitsen";

/* ---------- Splitsen 1, level 1 ---------- */

const S1_BEGIN = huisBeeld("begin", 5, 2, true, "pion", false, []);

const splitsen1a = les({
  id: "squla-splits-splitsen1-1",
  titel: "Splitsen tot 10",
  onderwerp: ONDERWERP,
  oefening: "Splitsen 1",
  level: 1,
  kaart: KaartSplitsen,
  voorwerpen: ["pion", "voetbal", "zak", "pingpongbal", "doek", "tennisbal"],
  begin: S1_BEGIN,
  welkom: ["Een huisje met pionnen: een deel staat links, een deel rechts.", "Hoeveel staan er aan de andere kant?", "Splitsen is een getal in twee stukken verdelen."],
  uitleg: async (l) => {
    zet(l, { licht: ["top"] });
    await l.zeg(`Kijk: samen zijn het ${aantal(5, "pion")}.`);
    zet(l, { licht: ["deel"] });
    await l.zeg(`${aantal(2, "pion")} staan aan de ene kant.`);
    zet(l, { licht: [], toon: ["in"] });
    await l.zeg(`${aantal(3, "pion")} staan aan de andere kant.`, `${g(5)} kun je splitsen in ${g(2)} en ${g(3)}.`);
    await l.verder();
  },
  /* Zoals Squla level 1: het huisje met pionnen, de zak, paren maken, het tienvak. Totaal 4–10, het gevraagde deel 1–7. */
  vragen: [
    huisVraag(5, 2, [{ n: 3, vw: "pion" }, { n: 2, vw: "pion" }, { n: 4, vw: "pion" }]),
    huisVraag(9, 6, [{ n: 4, vw: "pion" }, { n: 3, vw: "pion" }, { n: 3, vw: "voetbal" }]),
    huisVraag(7, 3, [{ n: 5, vw: "pion" }, { n: 3, vw: "pion" }, { n: 4, vw: "pion" }]),
    huisVraag(6, 4, [{ n: 2, vw: "pion" }, { n: 4, vw: "pion" }, { n: 3, vw: "pion" }]),
    huisVraag(10, 8, [{ n: 3, vw: "pion" }, { n: 2, vw: "voetbal" }, { n: 2, vw: "pion" }]),
    huisVraag(7, 4, [{ n: 4, vw: "voetbal" }, { n: 2, vw: "voetbal" }, { n: 3, vw: "voetbal" }], { vw: "voetbal", zak: true }),
    huisVraag(6, 5, [{ n: 5, vw: "voetbal" }, { n: 1, vw: "voetbal" }, { n: 2, vw: "voetbal" }], { vw: "voetbal", zak: true }),
    huisVraag(9, 6, [{ n: 3, vw: "voetbal" }, { n: 6, vw: "voetbal" }, { n: 4, vw: "voetbal" }], { vw: "voetbal", zak: true, links: false }),
    huisVraag(8, 3, [{ n: 4, vw: "voetbal" }, { n: 3, vw: "voetbal" }, { n: 5, vw: "voetbal" }], { vw: "voetbal", zak: true, links: false }),
    parenVraag([[5, 1], [6, 4], [8, 5]]),
    tienvakVraag(7, [3, 7, 4]),
    tienvakVraag(9, [2, 1, 9]),
    tienvakVraag(4, [4, 6, 5]),
    tienvakVraag(5, [5, 4, 6]),
    tienvakVraag(3, [7, 6, 3]),
  ],
  eind: "Je kunt getallen tot 10 splitsen.",
});

/* ---------- Splitsen 1, level 2 ---------- */

const splitsen1b = les({
  id: "squla-splits-splitsen1-2",
  titel: "Splitsen tot 10 (moeilijker)",
  onderwerp: ONDERWERP,
  oefening: "Splitsen 1",
  level: 2,
  kaart: KaartSplitsen,
  voorwerpen: ["splitsmachine", "bakje", "tennisbal", "voetbalshirt", "voetbal", "basketbal"],
  begin: paalBeeld("begin", 7, 4, "3", []),
  welkom: ["De splitsmachine verdeelt ballen over twee bakjes.", "Zoek jij de splitsing die erbij hoort?", "Ook leer je de splitspaal."],
  uitleg: async (l) => {
    zet(l, { licht: ["paal"] });
    await l.zeg(`Dit is een splitspaal.`, `Bovenaan staat ${g(7)}.`, `Onder staan ${g(4)} en ${g(3)}.`, `${g(7)} kun je splitsen in ${g(4)} en ${g(3)}.`);
    zet(l, { licht: [] });
    await l.verder();
  },
  /* Zoals Squla level 2: de machine (eerst met stippen, dan zonder), de splitspaal met shirts, met ballen en kaal. Totaal 5–10, delen 0–7. */
  vragen: [
    machineVraag(2, 4, [[5, 2, 3], [6, 2, 4], [6, 3, 3]], true),
    machineVraag(4, 3, [[7, 4, 3], [6, 4, 2], [8, 4, 4]], true),
    machineVraag(5, 2, [[7, 6, 1], [6, 5, 1], [7, 5, 2]], false),
    machineVraag(3, 5, [[8, 4, 4], [8, 3, 5], [9, 3, 6]], false),
    shirtVraag(6, 2, [{ n: 6, vw: "voetbal" }, { n: 4, vw: "voetbalshirt" }, { n: 3, vw: "voetbalshirt" }]),
    shirtVraag(8, 5, [{ n: 2, vw: "voetbalshirt" }, { n: 3, vw: "voetbalshirt" }, { n: 5, vw: "voetbalshirt" }]),
    shirtVraag(9, 3, [{ n: 5, vw: "voetbalshirt" }, { n: 9, vw: "voetbal" }, { n: 6, vw: "voetbalshirt" }]),
    shirtVraag(5, 4, [{ n: 1, vw: "voetbalshirt" }, { n: 4, vw: "voetbalshirt" }, { n: 2, vw: "voetbalshirt" }]),
    paalVraag(10, 6, [4, 5, 6], true),
    paalVraag(10, 2, [7, 8, 9], true),
    paalVraag(10, 5, [4, 5, 6], true),
    paalVraag(10, 8, [2, 3, 1], false),
    paalVraag(10, 3, [6, 7, 8], false),
    paalVraag(10, 10, [1, 0, 10], false),
    paalVraag(10, 1, [9, 8, 10], false),
  ],
  eind: "Je kunt splitsen met de splitspaal.",
});

/* ---------- Splitsen 2, level 1 ---------- */

const splitsen2a = les({
  id: "squla-splits-splitsen2-1",
  titel: "Splitsen tot 20",
  onderwerp: ONDERWERP,
  oefening: "Splitsen 2",
  level: 1,
  kaart: KaartSplitsen,
  voorwerpen: [],
  begin: { id: "begin", delen: [...geldDelen(3), { s: "huisje", id: "h", x: 490, y: 390, b: 360, top: "13", links: "10", rechts: "3" }] },
  welkom: ["Een briefje van tien en een paar munten.", `Een getal boven de ${g(10)} is ${g(10)} en nog wat.`, "Zo splitsen we tot twintig."],
  uitleg: async (l) => {
    zet(l, { licht: ["briefje"] });
    await l.zeg(`Kijk: een briefje van ${g(10)} euro.`);
    zet(l, { licht: ["munten"] });
    await l.zeg(`En ${g(3)} munten van één euro.`, `Samen is dat ${g(13)} euro.`);
    zet(l, { licht: ["h"] });
    await l.zeg(`${g(13)} kun je splitsen in ${g(10)} en ${g(3)}.`);
    zet(l, { licht: [] });
    await l.verder();
  },
  /* Zoals Squla level 1: eerst met geld als steuntje, dan de lege plek links, dan "kies er twee", dan door elkaar. Totaal 10–19. */
  vragen: [
    huisGetal(14, 10, null, [4, 10, 14], true),
    huisGetal(17, 10, null, [6, 7, 17], true),
    huisGetal(11, 10, null, [1, 2, 11], true),
    huisGetal(15, 10, null, [5, 10, 4], true),
    huisGetal(16, null, 6, [6, 10, 26], false),
    huisGetal(12, null, 2, [20, 10, 2], false),
    huisGetal(18, null, 8, [10, 8, 1], false),
    huisTwee(15, [[5, 10], [10, 5], [5, 5]]),
    huisTwee(13, [[3, 10], [10, 10], [10, 3]]),
    huisTwee(19, [[10, 9], [9, 9], [9, 10]]),
    huisGetal(14, 4, null, [10, 4, 8], false),
    huisGetal(18, null, 10, [8, 18, 28], false),
    huisGetal(10, 10, null, [0, 1, 10], false),
    huisGetal(16, 10, null, [6, 7, 16], false),
    huisGetal(11, null, 10, [1, 10, 21], false),
  ],
  eind: "Je kunt getallen tot twintig splitsen.",
});

/* ---------- Splitsen 2, level 2 ---------- */

const splitsen2b = les({
  id: "squla-splits-splitsen2-2",
  titel: "Splitsen tot 20 (moeilijker)",
  onderwerp: ONDERWERP,
  oefening: "Splitsen 2",
  level: 2,
  kaart: KaartSplitsen,
  voorwerpen: [],
  begin: { id: "begin", delen: [{ s: "huisje", id: "h", x: 490, y: 390, b: 360, top: "12", links: "10", rechts: "2" }] },
  welkom: ["Bij elk huisje hoort een som.", "Het getal bovenaan komt vooraan.", "Maak jij de goede som?"],
  uitleg: async (l) => {
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
    huisSom(14, 7, 7, ["14 = 7 + 7", "7 = 3 + 4", "21 = 14 + 7"], false),
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
  voorwerpen: ["knikker", "stuiterbal", "bakje", "potlood", "pennenbeker"],
  begin: { id: "begin", delen: verdeelDelen(6, 2, "knikker", { vorm: "rijen", per: 3 }) },
  welkom: ["Knikkers eerlijk verdelen over bakjes.", "Eerlijk is: in elk bakje evenveel."],
  uitleg: async (l) => {
    await verdeel(l, 6, 2, "knikker", { vorm: "rijen", per: 3 });
    await l.zeg(`In elk bakje liggen ${aantal(3, "knikker")}.`, `${g(3)} + ${g(3)} = ${g(6)}.`);
    await l.verder();
  },
  /* Zoals Squla: eerst plaatjes (netjes in rijen, dan los), dan een getal kiezen, typen, weer plaatjes, de potloden en een getal. Totaal 6–16, 2–5 bakjes, uitkomst 2–5. */
  vragen: [
    delenVraag(8, 2, "knikker", { vorm: "rijen", per: 4 }, { soort: "plaatje", opties: [2, 4, 3] }),
    delenVraag(12, 3, "knikker", { vorm: "rijen", per: 4 }, { soort: "plaatje", opties: [3, 4, 5] }),
    delenVraag(10, 2, "stuiterbal", { vorm: "los" }, { soort: "plaatje", opties: [4, 3, 5] }),
    delenVraag(15, 5, "stuiterbal", { vorm: "los" }, { soort: "plaatje", opties: [2, 3, 4] }),
    delenVraag(10, 5, "stuiterbal", { vorm: "los" }, { soort: "plaatje", opties: [1, 2, 3] }),
    delenVraag(16, 4, "knikker", { vorm: "hoopjes", per: 4 }, { soort: "getal", keuzes: [3, 4, 5] }),
    delenVraag(10, 2, "knikker", { vorm: "hoopjes", per: 5 }, { soort: "getal", keuzes: [4, 5, 6] }),
    delenVraag(8, 2, "stuiterbal", { vorm: "los" }, { soort: "typen" }),
    delenVraag(9, 3, "stuiterbal", { vorm: "los" }, { soort: "typen" }),
    delenVraag(16, 4, "knikker", { vorm: "rijen", per: 5 }, { soort: "plaatje", opties: [4, 5, 3] }),
    delenVraag(12, 3, "stuiterbal", { vorm: "los" }, { soort: "plaatje", opties: [4, 3, 6] }),
    delenVraag(6, 3, "stuiterbal", { vorm: "los" }, { soort: "plaatje", opties: [1, 2, 3] }),
    potlodenVraag(12, 4, [2, 3, 4]),
    potlodenVraag(10, 2, [4, 5, 6]),
    delenVraag(15, 3, "knikker", { vorm: "hoopjes", per: 5 }, { soort: "getal", keuzes: [3, 4, 5] }),
  ],
  eind: "Je kunt eerlijk verdelen.",
});

export const LESSEN_SQULA_SPLITSEN = [splitsen1a, splitsen1b, splitsen2a, splitsen2b, delen];
