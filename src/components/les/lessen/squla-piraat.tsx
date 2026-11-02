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
import { foutBeeld, g, goedBeeld, kiesGetal, kiesTekst, les, squlaVraag, tik, toon, voorbeeldVan, zet, type Stand, type Vraag } from "./squla-splitsen-hulp";
import { getalkleur } from "../tegels";
import { kiesAnder, KLEURHEX } from "../vlakken/squla-getalring";
import { KaartSchat, type Beeld, type Deel } from "../vlakken/squla-splitsen-vlak";

/* =====================================================================
   Woorden en beeld
   ===================================================================== */

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
const KL: Record<string, string> = { goudstuk: "geel", diamant: "blauw", parel: "wit", kopermunt: "oranje", maansteen: "paars", sleutel: "geel", ster: "geel" };
/** Voorwerpen die al in hun eigen kleur kloppen (gouden en koperen munten, geel sterretje en sleutel): die krijgen hun glans en kleur van het plaatje zelf, niet een egale tint. */
const NATUURLIJK = new Set(["goudstuk", "kopermunt", "ster", "sleutel"]);
const gv = (n: number, vw: string) => g(n, KL[vw] ?? "wit");
/** Het getal dat weggaat (b) in een minsom: een duidelijk andere kleur dan het voorwerp (BOUWREGELS 2.1). */
const gb = (n: number, vw: string) => g(n, kiesAnder(KL[vw] ?? "wit"));
const aantal = (n: number, vw: string) => `${gv(n, vw)} ${n === 1 ? NAAM[vw][0] : NAAM[vw][1]}`;
const KOLOM = [200, 490, 780];

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
async function plusUitleg(l: Lesgids, a: number, b: number) {
  const groot = Math.max(a, b);
  const klein = Math.min(a, b);
  /* dezelfde kleuren als de som: het eerste getal paars, het tweede oranje */
  const kg = a >= b ? "paars" : "oranje";
  const kk = a >= b ? "oranje" : "paars";
  if (a % 10 === 0 && b % 10 === 0) {
    await l.zeg(`${g(a, "paars")} is ${g(a / 10)} ${a === 10 ? "tiental" : "tientallen"}.`, `${g(b, "oranje")} is ${g(b / 10)} ${b === 10 ? "tiental" : "tientallen"}.`, "Hoeveel tientallen zijn het samen?");
    return;
  }
  if (groot < 10 && a + b > 10) {
    await l.zeg(`Begin bij ${g(groot, kg)}.`, `Eerst maak je ${g(10)}: ${g(groot, kg)} + ${g(10 - groot)} = ${g(10)}.`, `Van de ${g(klein, kk)} ${klein - (10 - groot) === 1 ? "is" : "zijn"} er dan nog ${g(klein - (10 - groot))} over.`, `${g(10)} en nog ${g(klein - (10 - groot))}: hoeveel is dat?`);
    return;
  }
  if (groot > 10 && groot < 20) {
    const e = groot - 10;
    await l.zeg(`${g(groot, kg)} is ${g(10)} en ${g(e)}.`, `Reken eerst ${g(e)} + ${g(klein, kk)}.`, `Dan komt de ${g(10)} er nog bij.`);
    return;
  }
  await l.zeg(`Begin bij ${g(groot, kg)}.`, `Tel dan ${g(klein, kk)} verder.`, "Dat mag op je vingers.");
}

function plusTip(a: number, b: number): string[] {
  const groot = Math.max(a, b);
  const klein = Math.min(a, b);
  const kg = a >= b ? "paars" : "oranje";
  const kk = a >= b ? "oranje" : "paars";
  if (a % 10 === 0 && b % 10 === 0) return ["Tel de tientallen bij elkaar."];
  if (groot < 10 && a + b > 10) return [`Eerst naar ${g(10)}.`, "Dan de rest erbij."];
  return [`Begin bij ${g(groot, kg)}.`, `Tel ${g(klein, kk)} verder.`];
}

/* =====================================================================
   Soorten vragen
   ===================================================================== */

/** Tellen: waar liggen N goudstukken? Kies het goede plaatje. */
function telVraag(doel: number, opties: { n: number; per: number }[]): Vraag {
  const goedId = `k${opties.findIndex((o) => o.n === doel)}`;
  return (l, st) => {
    const delen: Deel[] = [];
    opties.forEach((o, i) => {
      delen.push({ s: "groep", id: `k${i}`, vw: "goudstuk", n: o.n, x: KOLOM[i], y: 360, per: o.per, cel: 48 });
      delen.push({ s: "tik", id: `k${i}`, x: KOLOM[i], y: 360, b: 270, h: 240, aria: `${o.n} goudstukken` });
    });
    const beeld = metLetters(st, `tel-${doel}`, delen);
    const goed = opties[Number(goedId.slice(1))];
    return squlaVraag<string>(l, {
      toon: () => {
        toon(l, st, beeld);
      },
      vraag: [`Waar liggen ${aantal(doel, "goudstuk")}?`, "Tik op het goede plaatje."],
      antwoord: () => tik(l),
      isGoed: (x) => x === goedId,
      noem: (x) => aantal(opties[Number(x.slice(1))].n, "goudstuk"),
      goed: async () => {
        goedBeeld(l, st, { goedIds: [goedId] });
        await l.zeg(`Ja! Hier liggen ${aantal(doel, "goudstuk")}.`);
      },
      fout: () => foutBeeld(l, st),
      samen: async () => {
        await l.zeg("Tel de goudstukken per rij.", goed.per === 5 ? `Een volle rij is ${gv(5, "goudstuk")}.` : "Tel ze één voor één.");
        for (let i = 0; i < opties.length; i++) {
          zet(l, { licht: [`k${i}`] });
          await l.wacht(1400);
        }
        zet(l, { licht: [] });
        await l.zeg(`Waar zijn het er ${gv(doel, "goudstuk")}?`);
      },
      tip: [`Rijen van ${gv(5, "goudstuk")} tel je snel: ${gv(5, "goudstuk")}, ${gv(10, "goudstuk")}, en dan verder.`],
      testAntwoord: goedId,
    });
  };
}

/** Twee groepjes met het getal eronder: hoeveel samen? */
function samenVraag(vw: string, a: number, b: number, keuzes: number[]): Vraag {
  const s = a + b;
  return (l, st) => {
    const beeld = metLetters(st, `samen-${vw}-${a}-${b}`, [
      { s: "groep", id: "a", vw, n: a, x: 290, y: 320, per: 5, cel: 66, label: String(a), kl: "paars" },
      { s: "groep", id: "b", vw, n: b, x: 690, y: 320, per: 5, cel: 66, label: String(b), kl: "oranje" },
    ]);
    return squlaVraag<number>(l, {
      toon: () => {
        toon(l, st, beeld);
      },
      vraag: [`Hoeveel ${NAAM[vw][1]} zijn dit samen?`],
      antwoord: () => kiesGetal(l, keuzes),
      isGoed: (x) => x === s,
      noem: (x) => g(x),
      goed: async () => {
        som(l, st, a, "+", b, s, "paars", "oranje", "wit");
        goedBeeld(l, st);
        await l.zeg(`Ja! ${g(a, "paars")} + ${g(b, "oranje")} = ${g(s)}.`);
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
      testAntwoord: s,
    });
  };
}

/** Een kale plussom met een plaatje als versiering. */
function kaalPlus(a: number, b: number, keuzes: number[], deco: string): Vraag {
  const s = a + b;
  return (l, st) => {
    const beeld = metLetters(st, `kaal-${a}-${b}`, [{ s: "ding", id: "deco", vw: deco, x: 490, y: 370, maat: 230 }]);
    return squlaVraag<number>(l, {
      toon: () => {
        if (toon(l, st, beeld)) som(l, st, a, "+", b, undefined, "paars", "oranje", "wit");
      },
      vraag: [`Hoeveel is ${g(a, "paars")} + ${g(b, "oranje")}?`],
      antwoord: () => kiesGetal(l, keuzes),
      isGoed: (x) => x === s,
      noem: (x) => g(x),
      goed: async () => {
        som(l, st, a, "+", b, s, "paars", "oranje", "wit");
        goedBeeld(l, st);
        await l.zeg(`Ja! ${g(a, "paars")} + ${g(b, "oranje")} = ${g(s)}.`);
      },
      fout: () => foutBeeld(l, st),
      samen: () => plusUitleg(l, a, b),
      tip: plusTip(a, b),
      testAntwoord: s,
    });
  };
}

/** Een minsom met alle dingen in beeld; wat eraf gaat is grijs. `zinnen`: een verhaaltje, anders de som bovenaan. */
function minVraag(vw: string, a: number, b: number, keuzes: number[], zinnen?: string[], metSom = !zinnen): Vraag {
  const s = a - b;
  const weg = Array.from({ length: b }, (_, i) => `m.${a - b + i}`);
  const blijft = Array.from({ length: s }, (_, i) => `m.${i}`);
  return (l, st) => {
    const beeld = metLetters(st, `min-${vw}-${a}-${b}`, [{ s: "groep", id: "m", vw, n: a, x: 490, y: 360, per: 5, cel: 62, ...(KL[vw] && KL[vw] !== "wit" && !NATUURLIJK.has(vw) ? { kl: KL[vw] } : {}) }]);
    return squlaVraag<number>(l, {
      toon: () => {
        if (toon(l, st, beeld, { uit: weg }) && metSom) som(l, st, a, "−", b, undefined, KL[vw] ?? "wit", kiesAnder(KL[vw] ?? "wit"), KL[vw] ?? "wit");
      },
      vraag: zinnen ?? [`Hoeveel ${NAAM[vw][1]} zijn er nog?`],
      antwoord: () => kiesGetal(l, keuzes),
      isGoed: (x) => x === s,
      noem: (x) => gv(x, vw),
      goed: async () => {
        som(l, st, a, "−", b, s, KL[vw] ?? "wit", kiesAnder(KL[vw] ?? "wit"), KL[vw] ?? "wit");
        goedBeeld(l, st, { goedIds: blijft });
        await l.zeg(`Ja! ${gv(a, vw)} − ${gb(b, vw)} = ${gv(s, vw)}.`);
      },
      fout: () => foutBeeld(l, st),
      samen: async () => {
        await l.zeg(`Eerst waren er ${aantal(a, vw)}.`);
        zet(l, { licht: weg });
        await l.zeg(`Er ${b === 1 ? "gaat" : "gaan"} er ${gb(b, vw)} weg.`, b === 1 ? "Die is grijs." : "Die zijn grijs.");
        zet(l, { licht: blijft });
        await l.zeg("Tel de dingen die nog fel zijn.");
      },
      tip: ["Tel alleen wat niet grijs is."],
      testAntwoord: s,
    });
  };
}

/** Een raadsel (grapje) met twee plaatjes om op te tikken. */
function raadselPlaatje(vraag: string[], opties: [string, string], goedNr: 0 | 1, goed: string[], samen: string[], tip: string[], namen: [string, string]): Vraag {
  return (l, st) => {
    const delen: Deel[] = [];
    opties.forEach((vw, i) => {
      delen.push({ s: "ding", id: `k${i}`, vw, x: i ? 680 : 300, y: 370, maat: 220 });
      delen.push({ s: "tik", id: `k${i}`, x: i ? 680 : 300, y: 370, b: 260, h: 260, aria: namen[i] });
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
        await l.zeg(...goed);
      },
      fout: () => foutBeeld(l, st),
      samen: async () => {
        await l.zeg(...samen);
      },
      tip,
      testAntwoord: `k${goedNr}`,
    });
  };
}

/** Een raadsel met twee antwoorden (Bliepo leest ze voor). */
function raadselTekst(vraag: string[], opties: [string, string], goedNr: 0 | 1, goed: string[], samen: string[], tip: string[], deco: string): Vraag {
  return (l, st) => {
    const beeld = metLetters(st, `raadsel-${deco}`, [{ s: "ding", id: "deco", vw: deco, x: 490, y: 360, maat: 230 }]);
    return squlaVraag<string>(l, {
      toon: () => {
        toon(l, st, beeld);
      },
      vraag,
      antwoord: () => kiesTekst(l, opties),
      isGoed: (x) => x === opties[goedNr],
      noem: (x) => x,
      goed: async () => {
        goedBeeld(l, st);
        await l.zeg(...goed);
      },
      fout: () => foutBeeld(l, st),
      samen: async () => {
        await l.zeg(...samen);
      },
      tip,
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

const EERSTE1 = telVraag(14, [{ n: 12, per: 4 }, { n: 14, per: 5 }, { n: 15, per: 5 }]);

const level1 = maak({
  level: 1,
  titel: "Schattenjacht: plussommen",
  woord: "onder de rode rots",
  voorwerpen: ["schatkaart", "goudstuk", "diamant", "parel", "kopermunt", "maansteen", "sleutel", "zak-chips", "kom-soep", "planeet", "maan", "raketje", "komeet", "rode-rots", "kistje"],
  begin: [{ vw: "schatkaart", x: 490, maat: 320 }],
  welkom: ["Op schattenjacht tel je goudstukken en maak je plussommen.", `Waar liggen ${aantal(14, "goudstuk")}?`],
  voorbeeld: EERSTE1,
  verhaal: ["Kijk, een schatkaart!", "Waar ligt de schat?", "De letters op de kaart zeggen het."],
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
    EERSTE1,
    telVraag(11, [{ n: 11, per: 5 }, { n: 10, per: 5 }, { n: 12, per: 4 }]),
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
      ["Welk eten heet net zo als iets in een computer?"],
      ["Een zak chips", "Een kom soep"],
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

const EERSTE2 = minVraag("ster", 6, 1, [4, 5, 6], [`Ik heb ${aantal(6, "ster")} in mijn tas.`, `Er valt er ${gb(1, "ster")} uit.`, "Hoeveel sterren heb ik nog?"]);

const level2 = maak({
  level: 2,
  titel: "Schattenjacht: minsommen",
  woord: "in de grote krater",
  voorwerpen: ["schatkaart", "ster", "diamant", "goudstuk", "parel", "maansteen", "kopermunt", "sleutel", "komeet", "kistje"],
  begin: [{ vw: "schatkaart", x: 490, maat: 320 }],
  welkom: ["Nu reken je met min: er gaat iets af.", `Ik heb ${aantal(6, "ster")} in mijn tas en er valt er ${gv(1, "ster")} uit.`],
  voorbeeld: EERSTE2,
  verhaal: ["We hebben een nieuwe schatkaart.", "Waar ligt de schat nu?"],
  uitleg: async (l, st) => {
    toon(l, st, metLetters(st, "voorbeeld", [{ s: "groep", id: "m", vw: "ster", n: 5, x: 490, y: 360, per: 5, cel: 62 }]));
    await l.zeg(`Kijk: ${aantal(5, "ster")}.`);
    zet(l, { uit: ["m.3", "m.4"], licht: ["m.3", "m.4"] });
    await l.zeg(`Er gaan er ${gv(2, "ster")} weg: die worden grijs.`);
    zet(l, { licht: ["m.0", "m.1", "m.2"] });
    await l.zeg(`Er zijn er nog ${gv(3, "ster")}.`, `${gv(5, "ster")} − ${gv(2, "ster")} = ${gv(3, "ster")}.`);
    zet(l, { licht: [] });
    await l.verder();
  },
  /* Zoals Squla level 2: eerst verhaaltjes, een raadsel, dan minsommen met een plaatje. Begin 5–11, eraf 1–5. */
  vragen: [
    EERSTE2,
    minVraag("diamant", 7, 3, [3, 4, 5], [`Ik vind ${aantal(7, "diamant")}.`, `Er rollen er ${gb(3, "diamant")} weg.`, "Hoeveel diamanten heb ik nog?"]),
    minVraag("goudstuk", 9, 4, [4, 5, 6], [`Ik heb ${aantal(9, "goudstuk")}.`, `Ik betaal er ${gb(4, "goudstuk")} voor een kompas.`, "Hoeveel goudstukken heb ik nog?"]),
    minVraag("parel", 10, 2, [7, 8, 9], [`Ik heb ${aantal(10, "parel")}.`, `Ik verlies er ${gb(2, "parel")}.`, "Hoeveel parels heb ik nog?"]),
    minVraag("maansteen", 8, 3, [4, 5, 6], [`Er liggen ${aantal(8, "maansteen")}.`, `Ik stop er ${gb(3, "maansteen")} in mijn tas.`, "Hoeveel maanstenen liggen er nog?"]),
    minVraag("kopermunt", 11, 4, [6, 7, 8], [`Ik heb ${aantal(11, "kopermunt")}.`, `Ik geef er ${gb(4, "kopermunt")} weg.`, "Hoeveel kopermunten heb ik nog?"]),
    raadselTekst(
      ["Nu een raadsel!", "Waarom gaat een robot nooit zwemmen?", "Is het omdat hij dan gaat roesten?", "Of omdat hij geen zwembroek heeft?"],
      ["Omdat hij dan gaat roesten.", "Omdat hij geen zwembroek heeft."],
      0,
      ["Ja! Een robot is van ijzer.", "IJzer gaat roesten in het water."],
      ["Het is een grapje.", "Een robot is van ijzer.", "Wat gebeurt er met ijzer in het water?"],
      ["IJzer in het water gaat roesten."],
      "komeet",
    ),
    minVraag("ster", 7, 2, [4, 5, 6]),
    minVraag("sleutel", 9, 5, [3, 4, 5]),
    minVraag("diamant", 6, 4, [1, 2, 3]),
    minVraag("goudstuk", 10, 4, [5, 6, 7]),
    minVraag("parel", 8, 1, [6, 7, 8]),
    minVraag("maansteen", 11, 5, [5, 6, 7]),
    minVraag("kopermunt", 5, 2, [2, 3, 4]),
    minVraag("ster", 10, 3, [6, 7, 8]),
  ],
  slot: async (l, st) => {
    toon(l, st, verhaalBeeld(st, "slot-2", [{ vw: "maansteen", x: 330, maat: 260 }, { vw: "sleutel", x: 690, maat: 200 }]));
    await l.zeg("De letters zeggen: in de grote krater!", "Kijk, daar ligt een maansteen met een sleutel ernaast.", "Waar past die sleutel op?", "Dat zoeken we de volgende keer.");
    await l.verder();
  },
  eind: "Je kunt minsommen maken.",
});

const EERSTE3 = minVraag("ster", 7, 4, [2, 3, 4], [`${gv(7, "ster")} − ${gb(4, "ster")}: hoeveel sterren zijn er nog?`], true);

const level3 = maak({
  level: 3,
  titel: "Schattenjacht: plus en min",
  woord: "naast de oude raket",
  voorwerpen: ["sleutel", "schatkaart", "ster", "goudstuk", "diamant", "parel", "maansteen", "kopermunt", "planeet", "maan", "raketje", "komeet", "oude-raket", "schatkist"],
  begin: [{ vw: "schatkaart", x: 330, maat: 280 }, { vw: "sleutel", x: 690, maat: 200 }],
  welkom: ["Plus en min staan door elkaar.", `${gv(7, "ster")} − ${gb(4, "ster")}: hoeveel sterren zijn er nog?`],
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
    toon(l, st, metLetters(st, "voorbeeld", [{ s: "ding", id: "deco", vw: "planeet", x: 490, y: 370, maat: 200 }]));
    som(l, st, 8, "+", 5, undefined, "paars", "oranje", "wit");
    await l.zeg("Kijk goed naar het teken.", "Een plus: er komt bij.", "Een min: er gaat af.");
    await plusUitleg(l, 8, 5);
    som(l, st, 8, "+", 5, 13, "paars", "oranje", "wit");
    await l.zeg(`${g(8, "paars")} + ${g(5, "oranje")} = ${g(13, "wit")}.`);
    await l.verder();
    l.som(null);
  },
  /* Zoals Squla level 3: plus en min door elkaar tot 20, ook over het tiental, en een raadsel. */
  vragen: [
    EERSTE3,
    kaalPlus(7, 6, [12, 13, 14], "planeet"),
    minVraag("goudstuk", 14, 6, [7, 8, 9], [`${gv(14, "goudstuk")} − ${gb(6, "goudstuk")}: hoeveel goudstukken zijn er nog?`], true),
    kaalPlus(13, 7, [10, 19, 20], "raketje"),
    raadselTekst(
      ["Nu een raadsel!", "Welke vrucht hoort in de ruimte?", "Is het de maan-darijn?", "Of de banaan?"],
      ["De maan-darijn!", "De banaan."],
      0,
      ["Ja! De maan-darijn.", "Net als de maan!"],
      ["Het is een grapje.", "Luister maar: maan… darijn.", "Er zit een woord uit de ruimte in."],
      ["Welk woord lijkt op maan?"],
      "maan",
    ),
    minVraag("diamant", 12, 5, [6, 7, 8], [`${gv(12, "diamant")} − ${gb(5, "diamant")}: hoeveel diamanten zijn er nog?`], true),
    minVraag("parel", 16, 5, [10, 11, 12], [`${gv(16, "parel")} − ${gb(5, "parel")}: hoeveel parels zijn er nog?`], true),
    kaalPlus(8, 8, [15, 16, 17], "komeet"),
    minVraag("sleutel", 11, 3, [7, 8, 9], [`${gv(11, "sleutel")} − ${gb(3, "sleutel")}: hoeveel sleutels zijn er nog?`], true),
    kaalPlus(6, 5, [10, 11, 12], "maan"),
    minVraag("maansteen", 15, 7, [7, 8, 9], [`${gv(15, "maansteen")} − ${gb(7, "maansteen")}: hoeveel maanstenen zijn er nog?`], true),
    kaalPlus(9, 8, [16, 17, 18], "planeet"),
    minVraag("kopermunt", 13, 4, [8, 9, 10], [`${gv(13, "kopermunt")} − ${gb(4, "kopermunt")}: hoeveel kopermunten zijn er nog?`], true),
    kaalPlus(15, 4, [18, 19, 20], "raketje"),
    minVraag("ster", 18, 8, [9, 10, 11], [`${gv(18, "ster")} − ${gb(8, "ster")}: hoeveel sterren zijn er nog?`], true),
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
