/**
 * Schrijvers voor Optellen en Aftrekken (hoofdstuk 6, 7 en 10 van
 * MAATJE-HANDLEIDING.md): gewone sommen, de vlek, aanvullen, beide kanten
 * gelijk, de pootjes, en de opdrachten waarin je kiest of koppelt.
 */

import { maak, zin, type Fout, type Ontwerp } from "@/lib/maatje/bouw";
import { minKern, plusKern, stap, type Kern, type Plaatje } from "@/lib/maatje/schrijvers/som";
import { hoofd } from "@/lib/maatje/taal";
import type { Geschreven } from "@/lib/maatje/types";
import type { Opgave } from "@/lib/maatje/schrijf";

type Op = "+" | "−";
const RANG = ["eerste", "tweede", "derde", "vierde", "vijfde", "zesde", "zevende", "achtste"];

export function somWoorden(a: number | string, op: Op, b: number | string): string {
  return `${a} ${op === "+" ? "plus" : "min"} ${b}`;
}

/** Tekst 1: de vraag, met de som erbij als die niet al in de vraag staat. */
export function metSom(vraagtekst: string, som: string): string {
  const v = vraagtekst.trim();
  /* Staat de som al in de vraag ("Hoeveel is 8 + 5?"), dan alleen de vraag. */
  if (/\d\s*[+−×:=-]\s*\d/.test(v)) return v;
  const eind = /[?.]$/.test(som) ? "" : ".";
  if (v.endsWith("?")) return `${v} ${hoofd(som)}${eind}`;
  return `${v.replace(/[.!]$/, "")}: ${som}${eind}`;
}

function uitKern(o: Opgave, kern: Kern, extra: Partial<Ontwerp> & { opgave: number[]; geheim: number[] }): Geschreven {
  return maak({
    antwoord: o.antwoord,
    voorlezen: extra.voorlezen ?? o.vraagtekst,
    bouw: extra.bouw ?? null,
    goed: kern.goed,
    fouten: kern.fouten,
    uitleg: kern.uitleg,
    tip: kern.tip,
    opgave: extra.opgave,
    tussen: [...kern.tussen, ...(extra.tussen ?? [])],
    geheim: extra.geheim,
  });
}

/** Een gewone som: a + b of a − b, het kind typt de uitkomst. */
export function gewoneSom(o: Opgave, a: number, op: Op, b: number, p: Plaatje, bouw?: string): Geschreven {
  const kern = op === "+" ? plusKern(a, b, p) : minKern(a, b, p);
  const c = op === "+" ? a + b : a - b;
  return uitKern(o, kern, {
    voorlezen: metSom(o.vraagtekst, somWoorden(a, op, b)),
    bouw: bouw ? zin(bouw, stap(p, "de som staat klaar")) : null,
    opgave: [a, b],
    geheim: [c],
  });
}

// ---------------------------------------------------------------------------
// Een leeg vakje in de som: aanvullen, de vlek, het begingetal
// ---------------------------------------------------------------------------

/** Van a naar c: in één keer, of eerst naar het tiental. */
function aanvulStappen(a: number, c: number) {
  const tiental = Math.ceil((a + 1) / 10) * 10;
  if (a % 10 !== 0 && tiental < c) return { tiental, n: tiental - a, m: c - tiental };
  return null;
}

/**
 * Een plussom met een leeg vakje: a + ☐ = c (of ☐ + b = c).
 * `bekend` is het getal dat er staat, `c` de uitkomst.
 */
export function plusMetGat(o: Opgave, bekend: number, c: number, gatVoor: boolean, p: Plaatje, inleiding?: string): Geschreven {
  const b = c - bekend;
  const somMetGat = gatVoor ? `hoeveel plus ${bekend} is ${c}?` : `${bekend} plus hoeveel is ${c}?`;
  const somKlaar = gatVoor ? `${b} plus ${bekend} is ${c}` : `${bekend} plus ${b} is ${c}`;
  const st = aanvulStappen(bekend, c);
  const doel = c === 10 ? "om 10 te maken" : `om ${c} te krijgen`;

  const goed = st
    ? [zin(`Van ${bekend} naar ${st.tiental} is ${st.n}.`, stap(p, "eerst naar het tiental")), zin(`Van ${st.tiental} naar ${c} is ${st.m}: samen ${b}.`, stap(p, "dan de rest"))]
    : [zin(`${bekend} en ${b} is samen ${c}.`, stap(p, "alles licht op"))];
  const uitleg = st
    ? [
        zin("Kijk, zo doe je het."),
        zin(`Van ${bekend} naar ${st.tiental} is ${st.n}.`, stap(p, "eerst naar het tiental")),
        zin(`Van ${st.tiental} naar ${c} is ${st.m}.`, stap(p, "dan de rest")),
        zin(`Dus ${somKlaar}.`, stap(p, "alles licht op")),
      ]
    : [zin("Kijk, zo doe je het."), zin(`Tel verder van ${bekend} tot ${c}.`, stap(p, "tellen tot de uitkomst")), zin(`Dus ${somKlaar}.`, stap(p, "alles licht op"))];

  const fouten: Fout[] = [
    { code: "opgeteld", antwoorden: [`${bekend + c}`], zinnen: [zin(`Je hebt ${bekend} en ${c} opgeteld.`), zin(`Er moet ${b} bij ${bekend} ${doel}.`, stap(p, "wat erbij moet licht op"))] },
    { code: "uitkomst-overgeschreven", antwoorden: [`${c}`], zinnen: [zin(`${c} is de uitkomst al.`), zin(`Van ${bekend} naar ${c} is ${b}.`, stap(p, "wat erbij moet licht op"))] },
    { code: "een-ernaast", antwoorden: [`${b - 1}`, `${b + 1}`], zinnen: [zin("Je zit er 1 naast."), zin(`${bekend} en ${b} is samen ${c}.`, stap(p, "alles licht op"))] },
    { code: "getal-overgeschreven", antwoorden: [`${bekend}`], zinnen: [zin(`Je schreef ${bekend}.`), zin(`Er moet ${b} bij ${bekend} ${doel}.`, stap(p, "wat erbij moet licht op"))] },
  ];
  if (st) {
    fouten.push({ code: "alleen-naar-tiental", antwoorden: [`${st.n}`], zinnen: [zin(`Van ${bekend} naar ${st.tiental} is ${st.n}.`), zin(`Dan nog ${st.m} naar ${c}: samen ${b}.`, stap(p, "dan de rest"))] });
  }

  return maak({
    antwoord: o.antwoord,
    voorlezen: inleiding ? `${inleiding} ${hoofd(somMetGat)}` : metSom(o.vraagtekst, somMetGat),
    goed,
    fouten,
    uitleg,
    tip: zin(`Hoeveel moet er bij ${bekend} ${doel}?`),
    opgave: [bekend, c],
    tussen: st ? [st.tiental, st.n, st.m] : [],
    geheim: [b],
  });
}

/** ☐ − b = c: welk getal was er eerst? */
export function minBegingetal(o: Opgave, b: number, c: number, p: Plaatje, inleiding?: string): Geschreven {
  const a = c + b;
  const vraag = `hoeveel min ${b} is ${c}?`;
  return maak({
    antwoord: o.antwoord,
    voorlezen: inleiding ? `${inleiding} ${hoofd(vraag)}` : metSom(o.vraagtekst, vraag),
    goed: [zin(`Er ging ${b} af en er bleef ${c} over.`), zin(`${c} plus ${b} is ${a}.`, stap(p, "alles licht op"))],
    fouten: [
      { code: "min-gedaan", antwoorden: [`${c - b}`], zinnen: [zin(`Er ging ${b} af en er bleef ${c} over.`), zin(`Dus eerst was het meer: ${c} plus ${b} is ${a}.`, stap(p, "wat eraf ging komt terug"))] },
      { code: "uitkomst-overgeschreven", antwoorden: [`${c}`], zinnen: [zin(`${c} is wat er over bleef.`), zin(`Eerst was het meer: ${c} plus ${b} is ${a}.`, stap(p, "wat eraf ging komt terug"))] },
      { code: "een-ernaast", antwoorden: [`${a - 1}`, `${a + 1}`], zinnen: [zin("Je zit er 1 naast."), zin(`${c} plus ${b} is ${a}.`, stap(p, "alles licht op"))] },
    ],
    uitleg: [
      zin("Welk getal was er eerst?"),
      zin(`Als je ${b} eraf haalt, blijft er ${c} over.`, stap(p, "wat eraf gaat licht op")),
      zin(`Dus het begingetal is ${c} plus ${b}: ${a}.`, stap(p, "alles licht op")),
    ],
    tip: zin("Was het eerst meer of minder?"),
    opgave: [b, c],
    geheim: [a],
  });
}

/** a − ☐ = c: hoeveel ging eraf? */
export function minAftrekker(o: Opgave, a: number, c: number, p: Plaatje, inleiding?: string): Geschreven {
  const b = a - c;
  const vraag = `${a} min hoeveel is ${c}?`;
  const st = c % 10 !== 0 && Math.ceil((c + 1) / 10) * 10 < a ? aanvulStappen(c, a) : null;
  return maak({
    antwoord: o.antwoord,
    voorlezen: inleiding ? `${inleiding} ${hoofd(vraag)}` : metSom(o.vraagtekst, vraag),
    goed: [zin(`Van ${c} naar ${a} is ${b}.`, stap(p, "wat eraf gaat licht op"))],
    fouten: [
      { code: "plus-gedaan", antwoorden: [`${a + c}`], zinnen: [zin("Het is min."), zin(`Van ${c} naar ${a} is ${b}.`, stap(p, "wat eraf gaat licht op"))] },
      { code: "uitkomst-overgeschreven", antwoorden: [`${c}`], zinnen: [zin(`${c} is wat er over blijft.`), zin(`Er gaan ${b} af: ${a} min ${b} is ${c}.`, stap(p, "wat eraf gaat licht op"))] },
      { code: "een-ernaast", antwoorden: [`${b - 1}`, `${b + 1}`], zinnen: [zin("Je zit er 1 naast."), zin(`${a} min ${b} is ${c}.`, stap(p, "wat eraf gaat licht op"))] },
      { code: "getal-overgeschreven", antwoorden: [`${a}`], zinnen: [zin(`Je schreef ${a}.`), zin(`Er gaan ${b} af: ${a} min ${b} is ${c}.`, stap(p, "wat eraf gaat licht op"))] },
    ],
    uitleg: st
      ? [zin("Kijk, zo doe je het."), zin(`Van ${c} naar ${st.tiental} is ${st.n}.`), zin(`Van ${st.tiental} naar ${a} is ${st.m}.`), zin(`Dus ${a} min ${b} is ${c}.`, stap(p, "alles licht op"))]
      : [zin("Kijk, zo doe je het."), zin(`Tel van ${c} verder tot ${a}.`, stap(p, "tellen tot het begingetal")), zin(`Dus ${a} min ${b} is ${c}.`, stap(p, "alles licht op"))],
    tip: zin(`${hoofd(somWoorden(a, "−", "hoeveel"))} is ${c}?`),
    opgave: [a, c],
    tussen: st ? [st.tiental, st.n, st.m] : [],
    geheim: [b],
  });
}

/** De som uit `rekensom` met het lege vakje op plek 0, 1 of 2. */
export function somMetLeeg(o: Opgave, op: Op, g: [number, number, number], leeg: number, p: Plaatje, inleiding?: string): Geschreven {
  const [a, b, c] = g;
  if (leeg === 2) {
    const s = gewoneSom(o, a, op, b, p);
    if (inleiding) s.teksten.voorlezen = zin(`${inleiding} ${hoofd(somWoorden(a, op, b))}.`);
    return s;
  }
  if (op === "+") return plusMetGat(o, leeg === 0 ? b : a, c, leeg === 0, p, inleiding);
  return leeg === 0 ? minBegingetal(o, b, c, p, inleiding) : minAftrekker(o, a, c, p, inleiding);
}

// ---------------------------------------------------------------------------
// De pootjes: a + b via de 10, het kind splitst b
// ---------------------------------------------------------------------------

export function pootjes(o: Opgave, a: number, b: number): Geschreven | null {
  const n = 10 - a;
  const r = b - n;
  const c = a + b;
  const delen = o.antwoord.split(",");
  if (n <= 0 || r < 0 || delen.length !== 3 || delen.join(",") !== `${n},${r},${c}`) return null;

  const fouten: Fout[] = [];
  for (let v = 0; v <= b; v++) {
    if (v === n) continue;
    fouten.push({
      code: `linker-pootje-${v}`,
      antwoorden: [`${v},*,*`],
      zinnen: [zin(`${a} en ${v} is ${a + v}.`, "linker pootje licht op"), zin(`Bij ${a} moet ${n} om 10 te maken.`, "hartje met 10 licht op")],
      getallen: [v, a + v],
    });
  }
  for (let v = 0; v <= b + 1; v++) {
    if (v === r) continue;
    fouten.push({
      code: `rechter-pootje-${v}`,
      antwoorden: [`${n},${v},*`],
      zinnen: [zin(`${n} en ${v} is ${n + v}, maar je splitst ${b}.`, "beide pootjes lichten op"), zin(`${n} en ${r} is samen ${b}.`, "rechter pootje licht op")],
      getallen: [v, n + v],
    });
  }
  fouten.push({ code: "uitkomst", antwoorden: [`${n},${r},!${c}`], zinnen: [zin("De pootjes kloppen al."), zin(`10 en nog ${r} is ${c}.`, "rechter pootje springt naar de uitkomst")] });

  return maak({
    antwoord: o.antwoord,
    voorlezen: metSom(o.vraagtekst, somWoorden(a, "+", b)),
    bouw: zin(`Splits ${b} in twee pootjes.`, "de pootjes staan leeg onder de som"),
    goed: [zin(`${a} en ${n} is 10, en nog ${r} erbij: ${c}.`, "hartje met 10 licht op, dan de rest")],
    fouten,
    uitleg: [
      zin("Kijk, zo doe je het."),
      zin(`Maak eerst de 10 vol: ${a} en ${n} is 10.`, "linker pootje en hartje lichten op"),
      zin(`Dan nog ${r} erbij: ${c}.`, "rechter pootje springt naar de uitkomst"),
      zin(`Dus ${a} plus ${b} is ${c}.`, "alles licht op"),
    ],
    tip: zin("Maak eerst de 10 vol.", "hartje knippert zacht"),
    opgave: [a, b],
    tussen: [n, r, 10],
    geheim: [n, r, c].filter((x) => x !== a && x !== b),
  });
}

// ---------------------------------------------------------------------------
// Beide kanten gelijk
// ---------------------------------------------------------------------------

type Kant = [number | null, number | null];

export function balans(o: Opgave, links: Kant, linksOp: Op, rechts: Kant, rechtsOp: Op, p: Plaatje): Geschreven | null {
  const leegLinks = links.includes(null);
  const vol = leegLinks ? rechts : links;
  const half = leegLinks ? links : rechts;
  const volOp = leegLinks ? rechtsOp : linksOp;
  const halfOp = leegLinks ? linksOp : rechtsOp;
  if (vol.includes(null)) return null;
  const S = volOp === "+" ? (vol[0] as number) + (vol[1] as number) : (vol[0] as number) - (vol[1] as number);
  const gatEerst = half[0] === null;
  const k = (gatEerst ? half[1] : half[0]) as number;
  const x = halfOp === "+" ? S - k : gatEerst ? S + k : k - S;
  if (String(x) !== o.antwoord.split("|")[0]) return null;

  const kantNaam = leegLinks ? "Rechts" : "Links";
  const andere = leegLinks ? "links" : "rechts";
  const toon = (kant: Kant, op: Op) => `${kant[0] ?? "hoeveel"} ${op === "+" ? "plus" : "min"} ${kant[1] ?? "hoeveel"}`;
  const halfKlaar = gatEerst ? somWoorden(x, halfOp, k) : somWoorden(k, halfOp, x);
  const w = stap(p, "de weegschaal hangt recht");

  return maak({
    antwoord: o.antwoord,
    voorlezen: `${o.vraagtekst} ${hoofd(toon(links, linksOp))} is ${toon(rechts, rechtsOp)}?`,
    goed: [zin(`Beide kanten zijn ${S}.`, w), zin(`${hoofd(halfKlaar)} is ook ${S}.`, w)],
    fouten: [
      { code: "kant-uitgerekend", antwoorden: [`${S}`], zinnen: [zin(`${kantNaam} is ${S}, en ${andere} staat al ${k}.`, stap(p, "de weegschaal hangt scheef")), zin(`${hoofd(halfKlaar)} is ook ${S}.`, w)] },
      { code: "alles-bij-elkaar", antwoorden: [`${S + k}`], zinnen: [zin("Links en rechts moeten evenveel zijn."), zin(`${hoofd(halfKlaar)} is ${S}, net als ${andere === "links" ? "rechts" : "links"}.`, w)] },
      { code: "een-ernaast", antwoorden: [`${x - 1}`, `${x + 1}`], zinnen: [zin("Je zit er 1 naast."), zin(`${hoofd(halfKlaar)} is ${S}.`, w)] },
    ],
    uitleg: [
      zin("Links en rechts moeten evenveel zijn."),
      zin(`${kantNaam} is ${S}.`, stap(p, "de volle kant licht op")),
      zin(`Dus ${halfKlaar} is ook ${S}.`, w),
    ],
    tip: zin("Links en rechts moeten evenveel zijn."),
    opgave: [...links, ...rechts].filter((v): v is number => v !== null),
    tussen: [S],
    geheim: [x],
  });
}

// ---------------------------------------------------------------------------
// Kiezen: welke som klopt, welke hoort er niet bij, welke is evenveel
// ---------------------------------------------------------------------------

export type Kaart = { a: number; b: number; op: Op; uitkomst?: number };

export function leesKaart(tekst: string): Kaart | null {
  const m = tekst.match(/^\s*(\d+)\s*([+−-])\s*(\d+)\s*(?:=\s*(\d+))?\s*$/);
  if (!m) return null;
  return { a: Number(m[1]), op: m[2] === "+" ? "+" : "−", b: Number(m[3]), uitkomst: m[4] === undefined ? undefined : Number(m[4]) };
}

const waarde = (k: Kaart) => (k.op === "+" ? k.a + k.b : k.a - k.b);
const kaartZin = (k: Kaart) => somWoorden(k.a, k.op, k.b);

export function kaartKeuze(o: Opgave, stand: "klopt" | "nietbij" | "evenveel", kaarten: Kaart[], goed: number, doel?: number, boven?: Kaart): Geschreven | null {
  if (String(goed) !== o.antwoord || !kaarten[goed]) return null;
  const juist = kaarten[goed];
  const fouten: Fout[] = [];
  const getallen = kaarten.flatMap((k) => [k.a, k.b, ...(k.uitkomst === undefined ? [] : [k.uitkomst])]);
  const tussen = kaarten.map(waarde);

  let goedZinnen;
  let uitleg;
  let tip;
  if (stand === "klopt") {
    goedZinnen = [zin(`${hoofd(kaartZin(juist))} is ${waarde(juist)}.`), zin("De andere kloppen niet.")];
    kaarten.forEach((k, i) => {
      if (i === goed) return;
      fouten.push({
        code: `kaart-${i}`,
        antwoorden: [String(i)],
        zinnen: [zin(`${hoofd(kaartZin(k))} is ${waarde(k)}, niet ${k.uitkomst}.`), zin(`De som die klopt is ${kaartZin(juist)} is ${waarde(juist)}.`)],
      });
    });
    uitleg = [zin("Kijk, zo doe je het."), zin("Reken elke som uit."), zin(`Alleen ${kaartZin(juist)} is ${waarde(juist)}.`), zin("Dus die som klopt.")];
    tip = zin("Reken elke som uit.");
  } else if (stand === "nietbij") {
    const d = doel ?? waarde(kaarten[(goed + 1) % kaarten.length]);
    goedZinnen = [zin(`${hoofd(kaartZin(juist))} is ${waarde(juist)}.`), zin(`De andere zijn allemaal ${d}.`)];
    kaarten.forEach((k, i) => {
      if (i === goed) return;
      fouten.push({
        code: `kaart-${i}`,
        antwoorden: [String(i)],
        zinnen: [zin(`${hoofd(kaartZin(k))} is wel ${d}.`), zin(`${hoofd(kaartZin(juist))} is ${waarde(juist)}, die hoort er niet bij.`)],
      });
    });
    uitleg = [zin(`Drie sommen zijn ${d}.`), zin(`Alleen ${kaartZin(juist)} is ${waarde(juist)}.`), zin("Dus die hoort er niet bij.")];
    tip = zin("Reken elke som uit.");
    getallen.push(d);
  } else {
    if (!boven) return null;
    const d = waarde(boven);
    goedZinnen = [zin(`${hoofd(kaartZin(boven))} is ${d}.`), zin(`${hoofd(kaartZin(juist))} is ook ${d}.`)];
    kaarten.forEach((k, i) => {
      if (i === goed) return;
      fouten.push({
        code: `kaart-${i}`,
        antwoorden: [String(i)],
        zinnen: [zin(`${hoofd(kaartZin(k))} is ${waarde(k)}, niet ${d}.`), zin(`${hoofd(kaartZin(juist))} is wel ${d}.`)],
      });
    });
    uitleg = [zin("Kijk, zo doe je het."), zin(`${hoofd(kaartZin(boven))} is ${d}.`), zin(`${hoofd(kaartZin(juist))} is ook ${d}.`), zin("Dus die is evenveel.")];
    tip = zin(`Reken eerst ${kaartZin(boven)} uit.`);
    getallen.push(boven.a, boven.b);
  }

  return maak({
    antwoord: o.antwoord,
    voorlezen: o.vraagtekst,
    goed: goedZinnen,
    fouten,
    uitleg,
    tip,
    rondewoord: "opdrachten",
    opgave: getallen,
    tussen,
    /* Bij kiezen staat het goede antwoord als kaart in beeld; geheim is welke kaart. */
    geheim: [],
  });
}

// ---------------------------------------------------------------------------
// Koppelen: elke som aan zijn uitkomst
// ---------------------------------------------------------------------------

export function koppelen(o: Opgave, sommen: Kaart[]): Geschreven | null {
  const juist = sommen.map(waarde);
  if (o.antwoord !== juist.join(",")) return null;
  const fouten: Fout[] = sommen.map((k, i) => ({
    code: `koppel-${i}`,
    antwoorden: [sommen.map((_, j) => (j === i ? `!${juist[i]}` : "*")).join(",")],
    zinnen: [zin(`Reken ${kaartZin(k)} nog eens uit.`), zin(`${hoofd(kaartZin(k))} is ${juist[i]}.`)],
  }));
  return maak({
    antwoord: o.antwoord,
    voorlezen: o.vraagtekst,
    goed: [zin("Elke som staat bij de goede uitkomst.")],
    fouten,
    uitleg: [zin("Kijk, zo doe je het."), zin("Reken eerst één som uit."), zin(`${hoofd(kaartZin(sommen[0]))} is ${juist[0]}.`), zin("Zoek dan die uitkomst en sleep hem erbij.")],
    tip: zin("Reken eerst één som uit."),
    rondewoord: "opdrachten",
    opgave: sommen.flatMap((k) => [k.a, k.b]),
    tussen: juist,
    geheim: juist,
  });
}

// ---------------------------------------------------------------------------
// Twee getallen die samen … zijn
// ---------------------------------------------------------------------------

export function tweeGetallen(o: Opgave, lijst: number[], doel: number): Geschreven | null {
  const [p, q] = o.antwoord.split("|")[0].split(",").map(Number);
  if (p + q !== doel) return null;
  const groot = Math.max(p, q);
  const klein = Math.min(p, q);
  const fouten: Fout[] = [];
  for (let i = 0; i < lijst.length; i++) {
    for (let j = i + 1; j < lijst.length; j++) {
      const x = lijst[i];
      const y = lijst[j];
      if (x + y === doel) continue;
      fouten.push({
        code: `paar-${x}-${y}`,
        antwoorden: [`${x},${y}`, `${y},${x}`],
        zinnen: [zin(`${x} en ${y} is ${x + y}, niet ${doel}.`), zin(`${groot} en ${klein} maken samen ${doel}.`)],
        getallen: [x + y],
      });
    }
  }
  return maak({
    antwoord: o.antwoord,
    voorlezen: o.vraagtekst,
    goed: [zin(`${groot} en ${klein} is samen ${doel}.`)],
    fouten,
    uitleg: [zin("Kijk, zo doe je het."), zin(`Neem ${groot}: dan moet er nog ${klein} bij.`), zin(`Dus ${groot} en ${klein} maken samen ${doel}.`)],
    tip: zin("Begin bij het grootste getal en kijk wat erbij moet."),
    rondewoord: "opdrachten",
    opgave: [...lijst, doel],
    geheim: [],
  });
}

// ---------------------------------------------------------------------------
// Aanvullen in de tabel
// ---------------------------------------------------------------------------

export function aanvulTabel(o: Opgave, doel: number, getallen: number[], p: Plaatje): Geschreven | null {
  const juist = getallen.map((g) => doel - g);
  if (o.antwoord !== juist.join(",")) return null;
  const stijgend = getallen.every((g, i) => i === 0 || g === getallen[i - 1] + 1);
  const fouten: Fout[] = getallen.map((g, i) => ({
    code: `vakje-${i}`,
    antwoorden: [getallen.map((_, j) => (j === i ? `!${juist[i]}` : "*")).join(",")],
    zinnen: [zin(`Kijk naar het ${RANG[i] ?? "volgende"} vakje.`), zin(`Van ${g} naar ${doel} is ${juist[i]}.`, stap(p, "de strook vult zich aan"))],
  }));
  return maak({
    antwoord: o.antwoord,
    voorlezen: o.vraagtekst,
    goed: [zin(`${getallen[0]} en ${juist[0]} is ${doel}.`, stap(p, "de strook is vol")), zin("Zo gaat het bij elk vakje.")],
    fouten,
    uitleg: stijgend
      ? [zin(`Kijk naar het eerste vakje: ${getallen[0]} en ${juist[0]} is ${doel}.`, stap(p, "de strook vult zich aan")), zin("Elk volgend vakje is 1 minder.")]
      : [zin("Kijk, zo doe je het."), zin(`Hoeveel moet erbij tot ${doel}?`), zin(`${getallen[0]} en ${juist[0]} is ${doel}.`, stap(p, "de strook vult zich aan"))],
    tip: zin(`Hoeveel moet er bij elk getal tot ${doel}?`),
    rondewoord: "opdrachten",
    opgave: [doel, ...getallen],
    tussen: stijgend ? [1] : [],
    geheim: juist,
  });
}

// ---------------------------------------------------------------------------
// De som bij het plaatje: het kind typt a, b én de uitkomst
// ---------------------------------------------------------------------------

export function somBijPlaatje(o: Opgave, a: number, op: Op, b: number, p: Plaatje): Geschreven | null {
  const c = op === "+" ? a + b : a - b;
  if (o.antwoord !== `${a},${b},${c}`) return null;
  const kern = op === "+" ? plusKern(a, b, p) : minKern(a, b, p);
  const fouten: Fout[] = [
    { code: "eerste-geteld", antwoorden: [`!${a},*,*`], zinnen: [zin("Tel de eerste groep nog eens."), zin(a === 1 ? "Er is er maar 1." : `Het zijn er ${a}.`, stap(p, "de eerste groep licht op"))] },
    { code: "tweede-geteld", antwoorden: [`${a},!${b},*`], zinnen: [zin(op === "+" ? "Tel wat erbij komt nog eens." : "Tel wat eraf gaat nog eens."), zin(b === 1 ? "Er is er maar 1." : `Het zijn er ${b}.`, stap(p, "de tweede groep licht op"))] },
    { code: "uitkomst", antwoorden: [`${a},${b},!${c}`], zinnen: [zin("De som klopt al."), zin(`${hoofd(somWoorden(a, op, b))} is ${c}.`, stap(p, "alles licht op"))] },
  ];
  return maak({
    antwoord: o.antwoord,
    voorlezen: o.vraagtekst,
    goed: kern.goed,
    fouten,
    uitleg: kern.uitleg,
    tip: zin(op === "+" ? "Tel eerst de ene groep, dan de andere." : "Tel eerst alles, dan wat eraf gaat."),
    opgave: [],
    tussen: [...kern.tussen, a, b, c],
    geheim: [a, b, c],
  });
}

// ---------------------------------------------------------------------------
// Handig optellen: zoek twee getallen die samen een tiental zijn
// ---------------------------------------------------------------------------

export function handig(o: Opgave, lijst: number[]): Geschreven | null {
  const c = lijst.reduce((s, x) => s + x, 0);
  if (String(c) !== o.antwoord) return null;
  const over = [...lijst];
  const paren: [number, number][] = [];
  while (over.length > 0) {
    const x = over.shift() as number;
    const j = over.findIndex((y) => (x + y) % 10 === 0);
    if (j === -1) return null;
    paren.push([x, over.splice(j, 1)[0]]);
  }
  if (paren.length > 3) return null;
  const paarZin = ([x, y]: [number, number]) => `${x} en ${y} is ${x + y}`;
  const uitleg =
    paren.length === 3
      ? [zin(`${paarZin(paren[0])}, ${paarZin(paren[1])}.`), zin(`${paarZin(paren[2])}.`), zin(`Dus samen is het ${c}.`)]
      : [zin("Kijk, zo doe je het."), ...paren.map((pp) => zin(`${paarZin(pp)}.`)), zin(`Dus samen is het ${c}.`)];
  return maak({
    antwoord: o.antwoord,
    voorlezen: o.vraagtekst,
    goed: [zin(`${paarZin(paren[0])}.`), zin(`Alles samen is ${c}.`)],
    fouten: [
      { code: "een-ernaast", antwoorden: [`${c - 1}`, `${c + 1}`], zinnen: [zin("Je zit er 1 naast."), zin(`Alles samen is ${c}.`)] },
      { code: "tiental-ernaast", antwoorden: [`${c - 10}`, `${c + 10}`], zinnen: [zin("Je zit er 10 naast."), zin(`Tel de tientallen nog eens: samen ${c}.`)] },
    ],
    uitleg,
    tip: zin("Zoek eerst twee getallen die samen een tiental zijn."),
    rondewoord: "sommen",
    opgave: lijst,
    tussen: paren.map(([x, y]) => x + y),
    geheim: [c],
  });
}

// ---------------------------------------------------------------------------
// Flitsen: even kijken naar het rekenrek, dan zeggen hoeveel het er waren
// ---------------------------------------------------------------------------

export function flitsen(o: Opgave, n: number): Geschreven | null {
  if (String(n) !== o.antwoord) return null;
  const r = n - 10;
  const kr = (x: number) => `${x} ${x === 1 ? "kraal" : "kralen"}`;
  const fouten: Fout[] = [{ code: "een-ernaast", antwoorden: [`${n - 1}`, `${n + 1}`], zinnen: [zin("Je zit er 1 naast."), zin(r > 0 ? `Een volle rij is 10, en nog ${r}: ${n}.` : `Er stonden ${kr(n)}.`, "het rek komt weer in beeld")] }];
  if (r > 0) {
    fouten.push({ code: "tien-vergeten", antwoorden: [`${r}`], zinnen: [zin("Je bent de volle rij vergeten."), zin(`10 en nog ${r} is ${n}.`, "bovenste rij licht op, dan de onderste")] });
    fouten.push({ code: "rijen-omgedraaid", antwoorden: [`${10 + (10 - r)}`].filter((x) => x !== String(n)), zinnen: [zin("Kijk goed naar de onderste rij."), zin(`Daar staan er ${r}: samen ${n}.`, "onderste rij licht op")], getallen: [10 - r] });
  } else if (n > 5) {
    fouten.push({ code: "vijf-ernaast", antwoorden: [`${n - 5}`, `${n + 5}`], zinnen: [zin("Kijk naar de 5 rode kralen."), zin(`5 en nog ${n - 5} is ${n}.`, "de eerste 5 kralen lichten op")], getallen: [5, n - 5] });
  }
  return maak({
    antwoord: o.antwoord,
    voorlezen: o.vraagtekst,
    goed: [zin(r > 0 ? `Een volle rij is 10, en nog ${r}: ${n}.` : `Er stonden ${kr(n)} op de bovenste rij.`, "het rek komt weer in beeld")],
    fouten,
    uitleg:
      r > 0
        ? [zin("Kijk, zo doe je het."), zin("De bovenste rij is vol: dat is 10.", "bovenste rij licht op"), zin(`Onderaan staan er nog ${r}: ${n}.`, "onderste rij licht op")]
        : [zin("Kijk, zo doe je het."), zin(`Op de bovenste rij staan ${kr(n)}.`, "de kralen lichten op")],
    tip: zin("Kijk eerst of de bovenste rij vol is."),
    rondewoord: "opdrachten",
    opgave: [],
    tussen: r > 0 ? [10, r, 5] : [5],
    geheim: [n],
  });
}
