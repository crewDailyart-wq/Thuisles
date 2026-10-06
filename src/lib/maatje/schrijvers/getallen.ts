/**
 * Schrijvers voor Getallen (hoofdstuk 5 van MAATJE-HANDLEIDING.md): tellen,
 * tientallen en eenheden, de getallenlijn, ordenen en vergelijken.
 *
 * 47 is 4 staven van 10 en 7 losse; op de getallenlijn ligt 47 tussen 40 en
 * 50, dicht bij 50.
 */

import { maak, zin, type Fout, type Ontwerp } from "@/lib/maatje/bouw";
import { getalWoord, hoofd, stuks } from "@/lib/maatje/taal";
import type { Geschreven } from "@/lib/maatje/types";
import type { Opgave } from "@/lib/maatje/schrijf";

const staven = (n: number) => stuks(n, "staaf", "staven");
const rijen = (n: number) => stuks(n, "rij", "rijen");
const groepjes = (n: number) => stuks(n, "groepje", "groepjes");
const sprongen = (stap: number, aantal: number, vanaf = 0) => Array.from({ length: aantal }, (_, i) => vanaf + (i + 1) * stap).join(", ");
const RANG = ["eerste", "tweede", "derde", "vierde", "vijfde", "zesde", "zevende", "achtste", "negende", "tiende"];

function omgedraaid(c: number): Fout | null {
  if (c < 10 || c > 99) return null;
  const t = Math.floor(c / 10);
  const e = c % 10;
  if (t === e || e === 0) return null;
  return {
    code: "cijfers-omgedraaid",
    antwoorden: [`${e}${t}`],
    zinnen: [zin("Eerst de tientallen, dan de losse."), zin(`${hoofd(getalWoord(c))} schrijf je als ${c}.`)],
    getallen: [t, e],
  };
}

/**
 * Bij meerkeuze is het antwoord het nummer van de knop. Een fout als "74"
 * wordt dan de knop waar 74 op staat; staat dat getal niet tussen de keuzes,
 * dan valt die fout weg.
 */
function naarKnoppen(o: Opgave, fouten: Fout[]): Fout[] {
  if (o.vorm !== "meerkeuze" || !o.opties) return fouten;
  return fouten
    .map((f) => ({
      ...f,
      antwoorden: f.antwoorden.flatMap((a) => o.opties!.map((op, i) => (op.tekst.trim() === a ? String(i) : null)).filter((x): x is string => x !== null)),
      getallen: [...(f.getallen ?? []), ...f.antwoorden.flatMap((a) => (a.match(/\d+/g) ?? []).map(Number))],
    }))
    .filter((f) => f.antwoorden.length > 0);
}

function metKnoppen(o: Opgave, ontwerp: Ontwerp): Geschreven {
  const opties = o.vorm === "meerkeuze" && o.opties ? o.opties.flatMap((op) => (op.tekst.match(/\d+/g) ?? []).map(Number)) : [];
  return maak({
    ...ontwerp,
    fouten: naarKnoppen(o, ontwerp.fouten),
    opgave: [...ontwerp.opgave, ...opties],
    /* De keuzes staan in beeld; voorlezen noemt ze niet, dus het goede getal blijft geheim. */
    geheim: o.vorm === "meerkeuze" ? [] : ontwerp.geheim,
  });
}

// ---------------------------------------------------------------------------

function blokken(o: Opgave, t: number, e: number): Geschreven {
  const n = 10 * t + e;
  const fouten: Fout[] = [
    omgedraaid(n),
    { code: "achter-elkaar", antwoorden: [`${10 * t}${e}`], zinnen: [zin(`${10 * t} en ${e} schrijf je als één getal: ${n}.`, "staven en losse schuiven samen")] },
    { code: "staven-als-losse", antwoorden: [`${t + e}`], zinnen: [zin("Een staaf is 10."), zin(`${hoofd(staven(t))} is ${10 * t}, en nog ${e}: ${n}.`, "de staven lichten op")], getallen: [t + e] },
    { code: "een-ernaast", antwoorden: [`${n - 1}`, `${n + 1}`], zinnen: [zin("Je zit er 1 naast."), zin(`Tel de losse nog eens: het zijn er ${e}.`, "de losse lichten op")] },
    { code: "tien-ernaast", antwoorden: [`${n - 10}`, `${n + 10}`], zinnen: [zin("Je zit er 10 naast."), zin(`Tel de staven nog eens: ${staven(t)}.`, "de staven lichten op")] },
  ].filter((f): f is Fout => f !== null);
  return metKnoppen(o, {
    antwoord: o.antwoord,
    voorlezen: o.vraagtekst,
    goed: [zin(e === 0 ? `${hoofd(staven(t))} van 10 is ${n}.` : `${hoofd(staven(t))} van 10 en ${e} losse is ${n}.`, "staven en losse lichten op")],
    fouten,
    uitleg: [
      zin("Kijk, zo doe je het."),
      zin(t <= 6 ? `Tel de staven: ${sprongen(10, t)}.` : `${hoofd(staven(t))} is ${10 * t}.`, "de staven lichten één voor één op"),
      zin(e === 0 ? `Er zijn geen losse: ${n}.` : `En nog ${e} losse: ${n}.`, "de losse lichten op"),
    ],
    tip: zin("Tel eerst de staven, dan de losse."),
    rondewoord: "opdrachten",
    opgave: [],
    tussen: [t, e, 10, 10 * t, ...Array.from({ length: t }, (_, i) => (i + 1) * 10)],
    geheim: [n],
  });
}

function plaatjesTellen(o: Opgave, n: number, perRij: number): Geschreven {
  const r = Math.floor(n / perRij);
  const rest = n - r * perRij;
  const fouten: Fout[] = [
    { code: "een-ernaast", antwoorden: [`${n - 1}`, `${n + 1}`], zinnen: [zin("Je zit er 1 naast."), zin(r > 0 && rest > 0 ? `${hoofd(rijen(r))} van ${perRij} en nog ${rest}: ${n}.` : r > 0 ? `${hoofd(rijen(r))} van ${perRij} is ${n}.` : `Het zijn er ${n}.`, "de plaatjes lichten op")] },
    { code: "rij-ernaast", antwoorden: [`${n - perRij}`, `${n + perRij}`], zinnen: [zin("Je zit één rij ernaast."), zin(`Een volle rij is ${perRij}.`, "een volle rij licht op")] },
  ];
  const om = omgedraaid(n);
  if (om) fouten.push(om);
  return metKnoppen(o, {
    antwoord: o.antwoord,
    voorlezen: o.vraagtekst,
    goed: [zin(r > 0 && rest > 0 ? `${hoofd(rijen(r))} van ${perRij} en nog ${rest}: ${n}.` : r > 0 ? `${hoofd(rijen(r))} van ${perRij} is ${n}.` : `Het zijn er ${n}.`, "de rijen lichten op")],
    fouten,
    uitleg:
      r > 0 && r <= 5
        ? [zin(`Een volle rij is ${perRij}.`, "een volle rij licht op"), zin(`Tel de rijen: ${sprongen(perRij, r)}.`, "de rijen lichten één voor één op"), zin(rest > 0 ? `En nog ${rest}: ${n}.` : `Dus het zijn er ${n}.`, "de rest licht op")]
        : [zin("Kijk, zo doe je het."), zin("Tel ze één voor één, rij voor rij."), zin(`Het zijn er ${n}.`, "alles licht op")],
    tip: zin(r > 0 ? "Tel eerst de volle rijen." : "Tel ze één voor één."),
    rondewoord: "opdrachten",
    opgave: [],
    tussen: [perRij, r, rest, ...Array.from({ length: r }, (_, i) => (i + 1) * perRij)],
    geheim: [n],
  });
}

function stapstenen(o: Opgave, stenen: (number | null)[], sprong: number, vooruit: boolean): Geschreven | null {
  const volledig: number[] = [];
  const eerste = stenen.findIndex((s) => s !== null);
  if (eerste === -1) return null;
  for (let i = 0; i < stenen.length; i++) volledig.push((stenen[eerste] as number) + (vooruit ? 1 : -1) * sprong * (i - eerste));
  const leeg = stenen.map((s, i) => (s === null ? i : -1)).filter((i) => i >= 0);
  const juist = leeg.map((i) => volledig[i]);
  if (o.antwoord !== juist.join(",")) return null;
  const woord = vooruit ? "verder" : "terug";
  const fouten: Fout[] = [];
  if (juist.length > 1) {
    /* Allemaal de verkeerde kant op geteld. */
    const andersom = leeg.map((i) => (stenen[eerste] as number) + (vooruit ? -1 : 1) * sprong * (i - eerste));
    if (andersom.every((x) => x >= 0)) {
      fouten.push({ code: "verkeerde-kant", antwoorden: [andersom.join(",")], zinnen: [zin(vooruit ? "De getallen worden steeds groter." : "De getallen worden steeds kleiner."), zin(`Tel ${sprong} ${woord}: ${volledig.slice(0, 4).join(", ")}.`)] });
    }
  }
  leeg.forEach((idx, k) => {
    const x = juist[k];
    const voor = idx > 0 ? volledig[idx - 1] : null;
    fouten.push({
      code: `steen-${k}`,
      antwoorden: [juist.map((_, j) => (j === k ? `!${x}` : "*")).join(",")],
      zinnen: [zin("Eén steen klopt nog niet."), zin(voor !== null ? `Na ${voor} komt ${x}: ${sprong} ${woord}.` : `Vóór ${volledig[idx + 1]} komt ${x}.`, "de steen licht op")],
    });
  });
  const rij = volledig.length <= 7 ? volledig.join(", ") : volledig.slice(0, 7).join(", ");
  return maak({
    antwoord: o.antwoord,
    voorlezen: `${o.vraagtekst} Tel ${sprong} ${woord}.`,
    goed: [zin(`Steeds ${sprong} ${woord}: ${rij}.`, "Vos springt over de stenen")],
    fouten,
    uitleg: [zin("Kijk, zo doe je het."), zin(`Elke steen is ${sprong} ${vooruit ? "meer" : "minder"}.`), zin(`Dus: ${rij}.`, "Vos springt over de stenen")],
    tip: zin(`Tel steeds ${sprong} ${woord}.`),
    rondewoord: "opdrachten",
    opgave: [...stenen.filter((s): s is number => s !== null), sprong],
    tussen: volledig,
    geheim: juist,
  });
}

function tussenTientallen(x: number) {
  const lo = Math.floor(x / 10) * 10;
  return { lo, hi: lo + 10 };
}

function getallenlijn(o: Opgave, f: { stand?: string; gevraagd: number[]; marge?: number; start: number; eind: number; wijzer?: number }): Geschreven | null {
  if (f.stand === "schatten") {
    const x = f.gevraagd[0];
    const m = f.marge ?? 0;
    const { lo, hi } = tussenTientallen(x);
    const dichtbij = x - lo >= 5 ? hi : lo;
    const fouten: Fout[] = [];
    const onder = Math.ceil(x - m) - 1;
    const boven = Math.floor(x + m) + 1;
    if (onder >= f.start) fouten.push({ code: "te-laag", antwoorden: [`~${f.start}..${onder + 0.99}`], zinnen: [zin(`${x} ligt verder naar rechts.`), zin(`Het ligt tussen ${lo} en ${hi}, dicht bij ${dichtbij}.`, "de tientallen lichten op")], getallen: [lo, hi, dichtbij] });
    if (boven <= f.eind) fouten.push({ code: "te-hoog", antwoorden: [`~${boven - 0.99}..${f.eind}`], zinnen: [zin(`${x} ligt verder naar links.`), zin(`Het ligt tussen ${lo} en ${hi}, dicht bij ${dichtbij}.`, "de tientallen lichten op")], getallen: [lo, hi, dichtbij] });
    return maak({
      antwoord: o.antwoord,
      voorlezen: `${o.vraagtekst} Zet ${x} op de lijn.`,
      goed: [zin(`${x} ligt tussen ${lo} en ${hi}.`, "de tientallen lichten op"), zin(`Dicht bij ${dichtbij}.`)],
      fouten,
      uitleg: [zin("Kijk, zo doe je het."), zin(`Zoek eerst de tientallen: ${lo} en ${hi}.`, "de tientallen lichten op"), zin(`${x} ligt daartussen, dicht bij ${dichtbij}.`, "Vos gaat naar de goede plek")],
      tip: zin("Zoek eerst de tientallen op de lijn."),
      rondewoord: "opdrachten",
      opgave: [x, f.start, f.eind],
      tussen: [lo, hi],
      geheim: [],
    });
  }
  if (f.stand === "tussen" && typeof f.wijzer === "number") {
    const w = f.wijzer;
    const { lo, hi } = tussenTientallen(w);
    if (o.antwoord !== `${lo},${hi}`) return null;
    return maak({
      antwoord: o.antwoord,
      voorlezen: o.vraagtekst,
      goed: [zin(`${w} ligt tussen ${lo} en ${hi}.`, "de tientallen lichten op")],
      fouten: [
        { code: "omgewisseld", antwoorden: [`${hi},${lo}`], zinnen: [zin("Eerst het kleinste tiental."), zin(`${lo} en dan ${hi}.`)] },
        { code: "tientallen", antwoorden: [`!${lo},*`, `*,!${hi}`], zinnen: [zin(`${w} is meer dan ${lo} en minder dan ${hi}.`), zin(`Dus ${w} ligt tussen ${lo} en ${hi}.`, "de tientallen lichten op")] },
      ],
      uitleg: [zin("Kijk, zo doe je het."), zin(`${w} begint met ${stuks(Math.floor(w / 10), "tiental", "tientallen")}: ${lo}.`), zin(`Het volgende tiental is ${hi}.`, "de tientallen lichten op")],
      tip: zin("Kijk naar het eerste cijfer van het getal."),
      rondewoord: "opdrachten",
      opgave: [w],
      tussen: [lo, hi, Math.floor(w / 10)],
      geheim: [lo, hi],
    });
  }
  /* Schuiven: Vos naar een getal brengen. */
  if (f.stand === "schuiven" || f.stand === undefined) {
    const x = f.gevraagd?.[0] ?? (f as { doel?: number }).doel;
    if (typeof x !== "number" || String(x) !== o.antwoord) return null;
    const zichtbaar = ((f as { zichtbaar?: number[] }).zichtbaar ?? [f.start, f.eind]).slice();
    const m = zichtbaar.sort((a, b) => Math.abs(a - x) - Math.abs(b - x))[0];
    const d = x - m;
    const verschil = d === 0 ? `${x} staat al op de lijn.` : `${x} is ${Math.abs(d)} ${d > 0 ? "meer" : "minder"} dan ${m}.`;
    return maak({
      antwoord: o.antwoord,
      voorlezen: o.vraagtekst,
      goed: [zin(verschil, "Vos staat op de goede plek")],
      fouten: [
        { code: "een-ernaast", antwoorden: [`${x - 1}`, `${x + 1}`], zinnen: [zin("Je zit er 1 naast."), zin(verschil, "Vos gaat naar de goede plek")] },
        { code: "vijf-ernaast", antwoorden: [`${x - 5}`, `${x + 5}`], zinnen: [zin("Je zit er 5 naast."), zin(verschil, "Vos gaat naar de goede plek")] },
      ],
      uitleg: [zin("Kijk, zo doe je het."), zin(`Zoek eerst de ${m}.`, `de ${m} licht op`), zin(verschil, "Vos gaat naar de goede plek")],
      tip: zin("Kijk naar de getallen die er al staan."),
      rondewoord: "opdrachten",
      opgave: [x, ...zichtbaar],
      tussen: [Math.abs(d), 1, 5],
      geheim: [],
    });
  }

  /* Invullen: de getallen op hun plek slepen. */
  const juist = f.gevraagd;
  if (o.antwoord !== juist.join(",")) return null;
  const fouten: Fout[] = [];
  if (juist.length === 2) fouten.push({ code: "omgewisseld", antwoorden: [`${juist[1]},${juist[0]}`], zinnen: [zin("De getallen zijn omgewisseld."), zin(`${juist[0]} hoort links, ${juist[1]} verder naar rechts.`)] });
  juist.forEach((x, i) => {
    const { lo, hi } = tussenTientallen(x);
    fouten.push({ code: `plek-${i}`, antwoorden: [juist.map((_, j) => (j === i ? `!${x}` : "*")).join(",")], zinnen: [zin("Eén getal staat nog niet goed."), zin(`${x} ligt tussen ${lo} en ${hi}.`, "het vakje licht op")], getallen: [lo, hi] });
  });
  const { lo, hi } = tussenTientallen(juist[0]);
  return maak({
    antwoord: o.antwoord,
    voorlezen: o.vraagtekst,
    goed: [zin(`${juist[0]} ligt tussen ${lo} en ${hi}.`, "de getallen lichten op"), zin("Elk getal staat op zijn plek.")],
    fouten,
    uitleg: [zin("Kijk, zo doe je het."), zin("Kijk naar de getallen die er al staan."), zin(`${juist[0]} ligt tussen ${lo} en ${hi}.`, "het vakje licht op")],
    tip: zin("Kijk naar de getallen die er al staan."),
    rondewoord: "opdrachten",
    opgave: [...juist, f.start, f.eind],
    tussen: juist.flatMap((x) => [tussenTientallen(x).lo, tussenTientallen(x).hi]),
    geheim: [],
  });
}

function trein(o: Opgave, wagons: number[], aflopend: boolean): Geschreven | null {
  const juist = [...wagons].sort((a, b) => (aflopend ? b - a : a - b));
  if (o.antwoord !== juist.join(",")) return null;
  const woord = aflopend ? "grootste" : "kleinste";
  const fouten: Fout[] = [
    { code: "andersom", antwoorden: [[...juist].reverse().join(",")], zinnen: [zin(aflopend ? "Van groot naar klein: het grootste eerst." : "Van klein naar groot: het kleinste eerst."), zin(`Begin met ${juist[0]}.`)] },
    { code: "begin", antwoorden: [juist.map((x, j) => (j === 0 ? `!${x}` : "*")).join(",")], zinnen: [zin(`Begin met het ${woord} getal.`), zin(`Dat is ${juist[0]}.`, "de eerste wagon licht op")] },
  ];
  juist.forEach((x, i) => {
    if (i === 0) return;
    fouten.push({ code: `wagon-${i}`, antwoorden: [juist.map((y, j) => (j < i ? `${y}` : j === i ? `!${x}` : "*")).join(",")], zinnen: [zin("Eén wagon staat nog niet goed."), zin(`Na ${juist[i - 1]} komt ${x}.`, "de wagon licht op")] });
  });
  return maak({
    antwoord: o.antwoord,
    voorlezen: o.vraagtekst,
    goed: [zin(`${juist[0]} eerst, ${juist[juist.length - 1]} als laatste.`, "de trein rijdt weg")],
    fouten,
    uitleg: [zin("Kijk, zo doe je het."), zin(`Zoek eerst het ${woord} getal: ${juist[0]}.`, "de eerste wagon licht op"), zin("Dan het getal dat erna komt, en zo verder.")],
    tip: zin(`Zoek eerst het ${woord} getal.`),
    rondewoord: "opdrachten",
    opgave: wagons,
    geheim: [],
  });
}

function vissen(o: Opgave, getallen: number[], grootste: boolean): Geschreven | null {
  const goedGetal = grootste ? Math.max(...getallen) : Math.min(...getallen);
  const index = getallen.indexOf(goedGetal);
  if (String(index) !== o.antwoord) return null;
  const woord = grootste ? "grootste" : "kleinste";
  const fouten: Fout[] = getallen
    .map((x, i) => ({ x, i }))
    .filter(({ i }) => i !== index)
    .map(({ x, i }) => ({
      code: `vis-${i}`,
      antwoorden: [String(i)],
      zinnen:
        Math.floor(x / 10) !== Math.floor(goedGetal / 10)
          ? [zin("Kijk eerst naar de tientallen."), zin(`${goedGetal} is ${grootste ? "groter" : "kleiner"} dan ${x}.`)]
          : [zin("De tientallen zijn gelijk, kijk naar de losse."), zin(`${goedGetal} is ${grootste ? "groter" : "kleiner"} dan ${x}.`)],
    }));
  return maak({
    antwoord: o.antwoord,
    voorlezen: o.vraagtekst,
    goed: [zin(`${goedGetal} is het ${woord} getal.`, "de vis komt boven")],
    fouten,
    uitleg: [zin("Kijk, zo doe je het."), zin("Kijk eerst naar de tientallen, dan naar de losse."), zin(`${goedGetal} is het ${woord}.`)],
    tip: zin("Kijk eerst naar de tientallen."),
    rondewoord: "opdrachten",
    opgave: getallen,
    geheim: [],
  });
}

function bioscoop(o: Opgave, gezocht: number, zichtbaar: number[], perRij: number): Geschreven | null {
  const m = [...zichtbaar].sort((a, b) => Math.abs(a - gezocht) - Math.abs(b - gezocht))[0];
  const d = gezocht - m;
  const verschil = d === 0 ? `Het staat erop: ${gezocht}.` : `${gezocht} is ${Math.abs(d)} ${d > 0 ? "meer" : "minder"} dan ${m}.`;
  return metKnoppen(o, {
    antwoord: o.antwoord,
    voorlezen: `${o.vraagtekst} Vos zoekt stoel ${gezocht}.`,
    goed: [zin(verschil, "de stoel licht op")],
    fouten: [
      { code: "een-ernaast", antwoorden: [`${gezocht - 1}`, `${gezocht + 1}`], zinnen: [zin("Je zit er 1 naast."), zin(verschil, "de stoel licht op")], getallen: [m, Math.abs(d)] },
      { code: "rij-ernaast", antwoorden: [`${gezocht - perRij}`, `${gezocht + perRij}`], zinnen: [zin("Je zit één rij ernaast."), zin(`Een rij heeft ${perRij} stoelen.`, "een rij licht op")] },
    ],
    uitleg: [zin("Kijk, zo doe je het."), zin(`Zoek eerst de ${m}.`, `stoel ${m} licht op`), zin(verschil, "de stoel licht op")],
    tip: zin("Kijk naar de nummers die er al staan."),
    rondewoord: "opdrachten",
    opgave: [gezocht, ...zichtbaar, perRij],
    tussen: [Math.abs(d), m],
    geheim: [],
  });
}

function bus(o: Opgave, n: number, pg: number): Geschreven | null {
  if (String(n) !== o.antwoord) return null;
  const g = Math.floor(n / pg);
  const r = n - g * pg;
  const zinGoed = r > 0 ? `${hoofd(groepjes(g))} van ${pg} en nog ${r}: ${n}.` : `${hoofd(groepjes(g))} van ${pg} is ${n}.`;
  return maak({
    antwoord: o.antwoord,
    voorlezen: o.vraagtekst,
    goed: [zin(zinGoed, "de groepjes lichten op")],
    fouten: [
      { code: "een-ernaast", antwoorden: [`${n - 1}`, `${n + 1}`], zinnen: [zin("Je zit er 1 naast."), zin(zinGoed, "de groepjes lichten op")] },
      { code: "groepje-ernaast", antwoorden: [`${n - pg}`, `${n + pg}`], zinnen: [zin("Je zit één groepje ernaast."), zin(zinGoed, "de groepjes lichten één voor één op")] },
    ],
    uitleg:
      g <= 6
        ? [zin("Kijk, zo doe je het."), zin(`Tel in groepjes van ${pg}: ${sprongen(pg, g)}.`, "de groepjes lichten één voor één op"), zin(r > 0 ? `En nog ${r}: ${n}.` : `Dus ${n}.`, "de rest licht op")]
        : [zin("Kijk, zo doe je het."), zin(zinGoed, "de groepjes lichten op")],
    tip: zin(n === pg ? "Tel ze één voor één." : `Tel in groepjes van ${pg}.`),
    rondewoord: "opdrachten",
    opgave: [],
    tussen: [g, r, pg, ...Array.from({ length: g }, (_, i) => (i + 1) * pg)],
    geheim: [n],
  });
}

function kralenrij(o: Opgave, p: number, pg: number): Geschreven | null {
  if (String(p) !== o.antwoord) return null;
  const g = Math.floor((p - 1) / pg);
  const r = p - g * pg;
  const zinGoed = g > 0 ? `${hoofd(groepjes(g))} van ${pg}, en dan nog ${r}: ${p}.` : `Tel vanaf het begin: ${sprongen(1, p)}.`;
  return maak({
    antwoord: o.antwoord,
    voorlezen: o.vraagtekst,
    goed: [zin(zinGoed, "de kralen lichten één voor één op")],
    fouten: [
      { code: "een-ernaast", antwoorden: [`${p - 1}`, `${p + 1}`], zinnen: [zin("Je zit er 1 naast."), zin("Begin bij de eerste kraal met 1.", "de eerste kraal licht op")] },
      { code: "groepje-ernaast", antwoorden: [`${p - pg}`, `${p + pg}`], zinnen: [zin("Je zit één groepje ernaast."), zin(zinGoed, "de kralen lichten op")] },
    ],
    uitleg: [zin("Kijk, zo doe je het."), zin(`Tel in groepjes van ${pg}.`, "de groepjes lichten op"), zin(zinGoed, "de kraal licht op")],
    tip: zin(`Tel in groepjes van ${pg}.`),
    rondewoord: "opdrachten",
    opgave: [],
    tussen: [g, r, pg, 1, ...Array.from({ length: p }, (_, i) => i + 1)],
    geheim: [p],
  });
}

function huizenrij(o: Opgave, nummers: number[], gevraagd: number[]): Geschreven | null {
  const juist = gevraagd.map((i) => nummers[i]);
  if (o.antwoord !== juist.join(",")) return null;
  const stap = nummers.length > 1 ? nummers[1] - nummers[0] : 1;
  const fouten: Fout[] = [];
  if (juist.length === 2) fouten.push({ code: "omgewisseld", antwoorden: [`${juist[1]},${juist[0]}`], zinnen: [zin("De nummers staan omgewisseld."), zin(`Eerst ${juist[0]}, dan ${juist[1]}.`)] });
  gevraagd.forEach((idx, k) => {
    const x = juist[k];
    const links = idx > 0 && !gevraagd.includes(idx - 1) ? nummers[idx - 1] : null;
    const rechts = idx < nummers.length - 1 && !gevraagd.includes(idx + 1) ? nummers[idx + 1] : null;
    fouten.push({
      code: `huis-${k}`,
      antwoorden: [juist.map((_, j) => (j === k ? `!${x}` : "*")).join(",")],
      zinnen: [zin("Eén huisnummer klopt nog niet."), zin(links !== null ? `Na ${links} komt ${x}.` : rechts !== null ? `Vóór ${rechts} komt ${x}.` : `Hier hoort ${x}.`, "het huis licht op")],
    });
  });
  return maak({
    antwoord: o.antwoord,
    voorlezen: o.vraagtekst,
    goed: [zin(`De nummers gaan steeds ${stap} verder.`), zin(`Dus ${juist.join(" en ")}.`, "de huizen lichten op")],
    fouten,
    uitleg: [zin("Kijk, zo doe je het."), zin(`Elk huis is ${stap} verder.`), zin(`De rij is ${nummers.join(", ")}.`, "de huizen lichten één voor één op")],
    tip: zin("Kijk naar het nummer naast het lege huis."),
    rondewoord: "opdrachten",
    opgave: nummers.filter((_, i) => !gevraagd.includes(i)),
    tussen: [stap, ...nummers],
    geheim: juist,
  });
}

function telrij(o: Opgave, items: { aantal: number }[]): Geschreven | null {
  const juist = items.map((i) => i.aantal);
  if (o.antwoord !== juist.join(",")) return null;
  const fouten: Fout[] = [];
  if (juist.length === 2 && juist[0] !== juist[1]) fouten.push({ code: "omgewisseld", antwoorden: [`${juist[1]},${juist[0]}`], zinnen: [zin("De getallen zijn omgewisseld."), zin(`Bij de eerste ${juist[0]}, bij de tweede ${juist[1]}.`)] });
  juist.forEach((x, i) => {
    fouten.push({ code: `tellen-${i}`, antwoorden: [juist.map((_, j) => (j === i ? `!${x}` : "*")).join(",")], zinnen: [zin(`Tel de ${RANG[i] ?? `${i + 1}e`} nog eens.`), zin(`Het zijn er ${x}.`, "ze lichten één voor één op")] });
  });
  return maak({
    antwoord: o.antwoord,
    voorlezen: o.vraagtekst,
    goed: [zin(`Het zijn er ${juist.join(" en ")}.`, "alles licht op")],
    fouten,
    uitleg: [zin("Kijk, zo doe je het."), zin("Tel ze één voor één, en wijs mee."), zin(`Het zijn er ${juist.join(" en ")}.`, "ze lichten één voor één op")],
    tip: zin("Tel ze één voor één, en wijs mee."),
    rondewoord: "opdrachten",
    opgave: [],
    tussen: juist,
    geheim: [],
  });
}

// ---------------------------------------------------------------------------

export function schrijfGetallen(o: Opgave): Geschreven | null {
  const f = o.figuur;
  if (!f || typeof f !== "object") return null;
  switch (f.soort) {
    case "mabblokken":
      return f.stand === "tellen" || f.stand === "vosbouwt" ? blokken(o, f.tientallen, f.eenheden) : null;
    case "plaatjesraster":
      return typeof f.aantal === "number" && typeof f.perRij === "number" ? plaatjesTellen(o, f.aantal, f.perRij) : null;
    case "stapstenen":
      return stapstenen(o, f.stenen, f.sprong, f.richting !== "terug");
    case "getallenlijn":
      return getallenlijn(o, f);
    case "trein":
      return trein(o, f.wagons, f.aflopend === true);
    case "visvijver":
      return vissen(o, (f.vissen as { getal: number }[]).map((v) => v.getal), f.zoek === "grootste");
    case "bioscoop":
      return bioscoop(o, f.gezocht, f.zichtbaar, f.perRij);
    case "bus":
      return f.animatie !== "wegrijden" ? bus(o, f.totaal, f.perGroep) : null;
    case "kralenrij":
      return typeof f.pijlOp === "number" ? kralenrij(o, f.pijlOp, f.perGroep) : null;
    case "huizenrij":
      return Array.isArray(f.gevraagden) ? huizenrij(o, (f.huizen as { nummer: number }[]).map((h) => h.nummer), f.gevraagden) : null;
    case "telrij":
      return telrij(o, f.items);
    default:
      return null;
  }
}
