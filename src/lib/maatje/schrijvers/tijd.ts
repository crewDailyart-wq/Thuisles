/**
 * Schrijvers voor Tijd (hoofdstuk 9 van MAATJE-HANDLEIDING.md): de klok, de
 * digitale klok, hoe lang iets duurt, en de kalender.
 *
 * De kleine wijzer wijst het uur aan, de grote wijzer de minuten. Op de 12 is
 * het "uur", op de 6 "half", op de 3 "kwart over", op de 9 "kwart voor". Half
 * drie is op weg naar de 3: 2:30.
 */

import { maak, zin, type Fout, type Ontwerp } from "@/lib/maatje/bouw";
import { getalWoord, hoofd } from "@/lib/maatje/taal";
import type { Geschreven, Zin } from "@/lib/maatje/types";
import type { Opgave } from "@/lib/maatje/schrijf";

const DAGEN = ["maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag", "zondag"];
const MAANDEN = ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"];
const RANG = ["eerste", "tweede", "derde", "vierde", "vijfde", "zesde", "zevende", "achtste", "negende", "tiende", "elfde", "twaalfde"];

// ---------------------------------------------------------------------------
// Tijd in woorden
// ---------------------------------------------------------------------------

const uurWoord = (h: number) => (h === 1 ? "één" : getalWoord(h));
const twaalf = (u: number) => u % 12 || 12;
const volgend = (u: number) => (twaalf(u) % 12) + 1;
const pad = (n: number) => String(n).padStart(2, "0");
const digitaal = (u: number, m: number) => `${u}:${pad(m)}`;

/** Zoals je het in Nederland zegt: "half drie", "tien over half vier". */
export function tijdWoorden(u: number, m: number): string {
  const h = twaalf(u);
  const nh = volgend(u);
  if (m === 0) return `${uurWoord(h)} uur`;
  if (m === 15) return `kwart over ${uurWoord(h)}`;
  if (m === 30) return `half ${uurWoord(nh)}`;
  if (m === 45) return `kwart voor ${uurWoord(nh)}`;
  if (m < 15) return `${getalWoord(m)} over ${uurWoord(h)}`;
  if (m < 30) return `${getalWoord(30 - m)} voor half ${uurWoord(nh)}`;
  if (m < 45) return `${getalWoord(m - 30)} over half ${uurWoord(nh)}`;
  return `${getalWoord(60 - m)} voor ${uurWoord(nh)}`;
}

/** Wat de wijzers laten zien, in twee zinnen. */
function wijzerZinnen(u: number, m: number): Zin[] {
  const h = twaalf(u);
  const nh = volgend(u);
  if (m === 0) return [zin("De grote wijzer staat op de 12.", "de grote wijzer licht op"), zin(`De kleine wijzer wijst naar de ${h}: ${tijdWoorden(u, m)}.`, "de kleine wijzer licht op")];
  if (m === 30) return [zin("De grote wijzer op de 6 is half.", "de grote wijzer licht op"), zin(`De kleine wijzer is op weg naar de ${nh}.`, "de kleine wijzer licht op")];
  if (m === 15) return [zin("De grote wijzer op de 3 is kwart over.", "de grote wijzer licht op"), zin(`De kleine wijzer is net voorbij de ${h}.`, "de kleine wijzer licht op")];
  if (m === 45) return [zin("De grote wijzer op de 9 is kwart voor.", "de grote wijzer licht op"), zin(`De kleine wijzer is bijna bij de ${nh}.`, "de kleine wijzer licht op")];
  if (m % 5 !== 0) return [zin(`Het is ${digitaal(u, m)}.`), zin(`Dat is ${tijdWoorden(u, m)}.`)];
  return [zin(`De grote wijzer staat op de ${m / 5}.`, "de grote wijzer licht op"), zin(`Het is ${tijdWoorden(u, m)}.`, "de kleine wijzer licht op")];
}

function tijdGetallen(u: number, m: number): number[] {
  return [u, m, twaalf(u), volgend(u), 12, 6, 3, 9, m / 5, 60 - m, 30 - m, m - 30, u + 12, u - 12, u * 60 + m];
}

/** Een tijd terugvinden uit een keuze als "half drie", "19:30" of "vier uur 's middags". */
function leesTijd(tekst: string): { u: number; m: number } | null {
  const d = tekst.match(/^(\d{1,2}):(\d{2})$/);
  if (d) return { u: Number(d[1]), m: Number(d[2]) };
  const schoon = tekst.replace(/\s*'s (ochtends|middags|avonds|nachts)$/, "").trim();
  for (let u = 0; u < 12; u++) for (let m = 0; m < 60; m += 5) if (tijdWoorden(u, m) === schoon) return { u, m };
  return null;
}

/** Waarom een gekozen tijd niet klopt, in twee zinnen. */
function tijdVerschil(goed: { u: number; m: number }, gekozen: { u: number; m: number }): Zin[] {
  const g = tijdWoorden(goed.u, goed.m);
  if (gekozen.m === goed.m && twaalf(gekozen.u) !== twaalf(goed.u)) {
    if (goed.m >= 30) return [zin(`${hoofd(g)} is op weg naar de ${volgend(goed.u)}.`, "de kleine wijzer licht op"), zin(`Bij ${tijdWoorden(gekozen.u, gekozen.m)} gaat hij naar de ${volgend(gekozen.u)}.`)];
    return [zin("Kijk naar de kleine wijzer: die wijst het uur.", "de kleine wijzer licht op"), zin(`Het is ${g}.`)];
  }
  if ((goed.m === 15 && gekozen.m === 45) || (goed.m === 45 && gekozen.m === 15)) {
    return [zin("Kwart over is de 3, kwart voor de 9.", "de grote wijzer licht op"), zin(`Het is ${g}.`)];
  }
  return [zin("Kijk naar de grote wijzer: die wijst de minuten.", "de grote wijzer licht op"), zin(`Het is ${g}.`)];
}

// ---------------------------------------------------------------------------
// Kiezen uit keuzes (het antwoord is het nummer van de keuze)
// ---------------------------------------------------------------------------

function keuzeOntwerp(o: Opgave, keuzes: string[], goed: number, basis: Omit<Ontwerp, "antwoord" | "fouten" | "geheim" | "voorlezen"> & { voorlezen?: string }, waarom: (keuze: string, i: number) => Zin[] | null): Geschreven | null {
  if (String(goed) !== o.antwoord || !keuzes[goed]) return null;
  const fouten: Fout[] = [];
  keuzes.forEach((k, i) => {
    if (i === goed) return;
    const z = waarom(k, i);
    if (z) fouten.push({ code: `keuze-${i}`, antwoorden: [String(i)], zinnen: z, getallen: (k.match(/\d+/g) ?? []).map(Number) });
  });
  return maak({
    ...basis,
    antwoord: o.antwoord,
    voorlezen: basis.voorlezen ?? o.vraagtekst,
    fouten,
    rondewoord: "opdrachten",
    opgave: [...basis.opgave, ...keuzes.flatMap((k) => (k.match(/\d+/g) ?? []).map(Number)), ...(o.vraagtekst.match(/\d+/g) ?? []).map(Number)],
    geheim: [],
  });
}

function klokKeuze(o: Opgave, u: number, m: number, keuzes: string[], goed: number): Geschreven | null {
  return keuzeOntwerp(
    o,
    keuzes,
    goed,
    {
      goed: wijzerZinnen(u, m),
      uitleg: [zin("Kijk eerst naar de grote wijzer, dan naar de kleine."), ...wijzerZinnen(u, m)],
      tip: zin("Kijk eerst naar de grote wijzer."),
      opgave: [],
      tussen: [...tijdGetallen(u, m), ...keuzes.flatMap((k) => {
        const t = leesTijd(k);
        return t ? tijdGetallen(t.u, t.m) : [];
      })],
    },
    (k) => {
      const t = leesTijd(k);
      return t ? tijdVerschil({ u, m }, t) : null;
    },
  );
}

// ---------------------------------------------------------------------------
// Tijdsduur
// ---------------------------------------------------------------------------

function duurWoorden(min: number): string {
  const h = Math.floor(min / 60);
  const r = min % 60;
  const deel = r === 15 ? "een kwartier" : r === 30 ? "een half uur" : r === 45 ? "drie kwartier" : `${r} minuten`;
  if (h === 0) return deel;
  if (r === 0) return h === 1 ? "een uur" : `${getalWoord(h)} uur`;
  if (r === 30) return h === 1 ? "anderhalf uur" : `${getalWoord(h)} en een half uur`;
  return `${h === 1 ? "een" : getalWoord(h)} uur en ${deel}`;
}

function uurMinZin(h: number, m: number): string {
  if (m === 0) return `precies ${h} uur`;
  if (h === 0) return `${m} minuten`;
  return `${h} uur en ${m} minuten`;
}

function verschilOpgave(o: Opgave, van: { u: number; m: number }, tot: { u: number; m: number }, vanTekst: string, totTekst: string): Geschreven | null {
  const a = van.u * 60 + van.m;
  const b = tot.u * 60 + tot.m;
  const d = Math.abs(b - a);
  const h = Math.floor(d / 60);
  const m = d % 60;
  if (o.antwoord !== `${h},${m}`) return null;
  const vroeg = a < b ? van : tot;
  const laat = a < b ? tot : van;
  const fouten: Fout[] = [
    { code: "uur-ernaast", antwoorden: [`${h - 1},${m}`, `${h + 1},${m}`], zinnen: [zin("Tel de hele uren nog eens."), zin(`Het is ${uurMinZin(h, m)}.`)] },
  ];
  /* Uren en minuten los van elkaar afgetrokken, terwijl je over een heel uur heen gaat. */
  if (laat.m < vroeg.m) {
    fouten.push({ code: "over-heel-uur", antwoorden: [`${laat.u - vroeg.u},${vroeg.m - laat.m}`], zinnen: [zin("Let op: je gaat over een heel uur heen."), zin(`Het is ${uurMinZin(h, m)}.`)], getallen: [laat.u - vroeg.u, vroeg.m - laat.m] });
  }
  if (m > 0) fouten.push({ code: "minuten", antwoorden: [`${h},!${m}`], zinnen: [zin("De hele uren kloppen al."), zin(`Er komen nog ${m} minuten bij.`)] });
  const volUur = vroeg.m === 0 ? vroeg.u : vroeg.u + 1;
  const stap1 = vroeg.m === 0 ? 0 : 60 - vroeg.m;
  return maak({
    antwoord: o.antwoord,
    voorlezen: o.vraagtekst,
    goed: [zin(`Van ${vanTekst} tot ${totTekst}.`), zin(`Dat is ${uurMinZin(h, m)}.`)],
    fouten,
    uitleg:
      stap1 > 0 && volUur * 60 <= laat.u * 60 + laat.m
        ? [zin(`Van ${digitaal(vroeg.u, vroeg.m)} naar ${digitaal(volUur, 0)} is ${stap1} minuten.`), zin(`Dan tel je de rest erbij.`), zin(`Samen is dat ${uurMinZin(h, m)}.`)]
        : [zin("Tel eerst de hele uren, dan de minuten."), zin(`Van ${vanTekst} tot ${totTekst}.`), zin(`Dat is ${uurMinZin(h, m)}.`)],
    tip: zin("Tel eerst de hele uren, dan de minuten."),
    rondewoord: "opdrachten",
    opgave: [van.u, van.m, tot.u, tot.m],
    tussen: [stap1, volUur, h, m, 60, h - 1, h + 1, 0],
    geheim: [h, m].filter((x) => x !== 0),
  });
}

// ---------------------------------------------------------------------------
// Kalender
// ---------------------------------------------------------------------------

const weekdag = (j: number, mnd: number, d: number) => DAGEN[(new Date(j, mnd - 1, d).getDay() + 6) % 7];
const dagenIn = (j: number, mnd: number) => new Date(j, mnd, 0).getDate();

function rij(lijst: string[], van: number, aantal: number): string {
  return Array.from({ length: aantal }, (_, i) => lijst[(((van + i) % lijst.length) + lijst.length) % lijst.length]).join(", ");
}

// ---------------------------------------------------------------------------

export function schrijfTijd(o: Opgave): Geschreven | null {
  const f = o.figuur;
  if (!f || typeof f !== "object") return null;

  switch (f.soort) {
    case "klokaflezen":
    case "klokvlek":
    case "digitaalaflezen":
      return Array.isArray(f.keuzes) ? klokKeuze(o, f.uur, f.minuut, f.keuzes, f.goed) : null;

    case "klokkiezen": {
      const keuzes = (f.keuzes as { uur: number; minuut: number }[]).map((k) => tijdWoorden(k.uur, k.minuut));
      const goedIndex = (f.keuzes as { uur: number; minuut: number }[]).findIndex((k) => twaalf(k.uur) === twaalf(f.uur + Math.floor((f.minuut + (f.stap ?? 0)) / 60)) && k.minuut === (f.minuut + (f.stap ?? 0)) % 60);
      if (goedIndex < 0) return null;
      const doel = (f.keuzes as { uur: number; minuut: number }[])[goedIndex];
      const s = klokKeuze(o, doel.uur, doel.minuut, keuzes, goedIndex);
      if (s && f.vraag === "verschuiving") {
        s.teksten.goed.zinnen = [zin(`Het is nu ${tijdWoorden(f.uur, f.minuut)}.`), zin(`${hoofd(duurWoorden(f.stap))} later is het ${tijdWoorden(doel.uur, doel.minuut)}.`)];
      }
      if (s) s.teksten.voorlezen = zin(f.vraag === "digitaal" ? `${o.vraagtekst} ${digitaal(f.uur, f.minuut)}.` : `${o.vraagtekst} Welke klok hoort erbij?`);
      return s;
    }

    case "klokklopt": {
      const u = f.uur as number;
      const m = f.minuut as number;
      const juist = f.klopt === true;
      if (o.antwoord !== (juist ? "0" : "1")) return null;
      const bewering = String(f.bewering).replace(/^Het is /, "").replace(/\.$/, "");
      const g = tijdWoorden(u, m);
      const t = leesTijd(bewering);
      return maak({
        antwoord: o.antwoord,
        voorlezen: `${o.vraagtekst} ${f.bewering}`,
        goed: juist ? wijzerZinnen(u, m) : [zin(`Het is niet ${bewering}.`), zin(`Het is ${g}.`)],
        fouten: [{ code: juist ? "klopt-wel" : "klopt-niet", antwoorden: [juist ? "1" : "0"], zinnen: juist ? wijzerZinnen(u, m) : t ? tijdVerschil({ u, m }, t) : [zin(`Het is ${g}.`)] }],
        uitleg: [zin("Kijk eerst naar de grote wijzer, dan naar de kleine."), ...wijzerZinnen(u, m)],
        tip: zin("Kijk eerst naar de grote wijzer."),
        rondewoord: "opdrachten",
        opgave: [],
        tussen: [...tijdGetallen(u, m), ...(t ? tijdGetallen(t.u, t.m) : [])],
        geheim: [],
      });
    }

    case "klokzetten": {
      const u0 = f.uur as number;
      const m0 = f.minuut as number;
      const schuif = (f.schuif ?? 0) as number;
      const totaal = (((u0 * 60 + m0 + schuif) % 720) + 720) % 720;
      const [au, am] = o.antwoord.split(",").map(Number);
      if (am !== totaal % 60 || twaalf(au) !== twaalf(Math.floor(totaal / 60))) return null;
      const g = tijdWoorden(au, am);
      const fouten: Fout[] = [];
      if (schuif !== 0) fouten.push({ code: "begintijd", antwoorden: [`${u0},${m0}`, `${twaalf(u0)},${m0}`], zinnen: [zin(`Tel ${duurWoorden(Math.abs(schuif))} ${schuif > 0 ? "verder" : "terug"}.`), zin(`Dan is het ${g}.`)] });
      if (am === 0) fouten.push({ code: "wijzers-verwisseld", antwoorden: [`12,${twaalf(au) * 5 % 60}`, `0,${twaalf(au) * 5 % 60}`], zinnen: [zin("De kleine wijzer wijst het uur aan."), zin("Bij hele uren staat de grote wijzer op de 12.", "de wijzers wisselen van plek")] });
      fouten.push({ code: "uur-ernaast", antwoorden: [`${au - 1},${am}`, `${au + 1},${am}`, `${twaalf(au - 1)},${am}`, `${twaalf(au + 1)},${am}`], zinnen: am >= 30 ? [zin(`${hoofd(g)} is op weg naar de ${volgend(au)}.`), zin(`De kleine wijzer staat tussen de ${twaalf(au)} en de ${volgend(au)}.`, "de kleine wijzer schuift naar het midden")] : [zin("Kijk naar de kleine wijzer: die wijst het uur."), zin(`Bij ${g} wijst hij naar de ${twaalf(au)}.`, "de kleine wijzer draait")] });
      fouten.push({ code: "minuten", antwoorden: [`${au},!${am}`], zinnen: [zin("Kijk naar de grote wijzer."), zin(am === 0 ? `Bij ${g} staat die op de 12.` : `Bij ${g} staat die op de ${am / 5}.`, "de grote wijzer draait")] });
      return maak({
        antwoord: o.antwoord,
        voorlezen: o.vraagtekst,
        bouw: zin("Draai de wijzers.", "beide wijzers staan klaar"),
        goed: wijzerZinnen(au, am),
        fouten,
        uitleg: [zin(schuif !== 0 ? `Tel ${duurWoorden(Math.abs(schuif))} ${schuif > 0 ? "verder" : "terug"}.` : `Zet de klok op ${g}.`), ...wijzerZinnen(au, am)],
        tip: zin(am === 30 ? "Bij half staat de grote wijzer altijd op de 6." : am === 0 ? "Bij hele uren staat de grote wijzer op de 12." : "Zet eerst de grote wijzer goed."),
        rondewoord: "opdrachten",
        opgave: [u0, m0],
        tussen: [...tijdGetallen(au, am), schuif / 60, au - 1, au + 1],
        geheim: [],
      });
    }

    case "kloktypen": {
      const u = f.uur as number;
      const m = f.minuut as number;
      if (o.antwoord !== `${u},${m}`) return null;
      const g = tijdWoorden(u, m);
      const dagdeel = u < 6 ? "'s nachts" : u < 12 ? "'s ochtends" : u < 18 ? "'s middags" : "'s avonds";
      const fouten: Fout[] = [];
      if (u > 12) fouten.push({ code: "na-twaalf", antwoorden: [`${u - 12},${m}`], zinnen: [zin("Na 12 uur tel je door: 13, 14, 15."), zin(`${hoofd(g)} ${dagdeel} is ${digitaal(u, m)}.`)], getallen: [13, 14, 15] });
      if (m === 30) fouten.push({ code: "half-uur-erna", antwoorden: [`${u + 1},30`], zinnen: [zin(`${hoofd(g)} is op weg naar de ${volgend(u)}.`), zin(`Dus ${digitaal(u, m)}.`)] });
      fouten.push({ code: "minuten", antwoorden: [`${u},!${m}`], zinnen: [zin("Het uur klopt al."), zin(m === 0 ? `Bij een heel uur typ je 0 bij de minuten.` : `Bij ${g} typ je ${m} bij de minuten.`)] });
      fouten.push({ code: "uur-ernaast", antwoorden: [`${u - 1},${m}`, `${u + 1},${m}`], zinnen: [zin("Kijk naar de kleine wijzer: die wijst het uur."), zin(`${hoofd(g)} ${dagdeel} is ${digitaal(u, m)}.`)] });
      return maak({
        antwoord: o.antwoord,
        voorlezen: o.vraagtekst,
        goed: [zin(`${hoofd(g)} ${dagdeel}.`), zin(`Dat schrijf je als ${digitaal(u, m)}.`)],
        fouten,
        uitleg: [...wijzerZinnen(u, m), zin(`${hoofd(dagdeel)} schrijf je dat als ${digitaal(u, m)}.`)],
        tip: zin(u >= 12 ? "Na 12 uur tel je door: 13, 14, 15." : "Kijk eerst naar de kleine wijzer."),
        rondewoord: "opdrachten",
        opgave: [],
        tussen: [...tijdGetallen(u, m), 13, 14, 15],
        geheim: [u, m].filter((x) => x !== 0 && x !== 12 && x !== 13 && x !== 14 && x !== 15),
      });
    }

    case "klokduur": {
      const nu = { u: f.uur as number, m: f.minuut as number };
      const ander = { u: f.andereUur as number, m: f.andereMinuut as number };
      if (!Array.isArray(f.keuzes)) return verschilOpgave(o, ander, nu, tijdWoorden(ander.u, ander.m), tijdWoorden(nu.u, nu.m));
      const d = Math.abs(nu.u * 60 + nu.m - (ander.u * 60 + ander.m));
      const goedIndex = (f.keuzes as string[]).indexOf(duurWoorden(d));
      if (goedIndex < 0) return null;
      return keuzeOntwerp(
        o,
        f.keuzes,
        goedIndex,
        {
          goed: [zin(`Van ${tijdWoorden(ander.u, ander.m)} tot ${tijdWoorden(nu.u, nu.m)}.`), zin(`Dat is ${duurWoorden(d)}.`)],
          uitleg: [zin("Kijk hoe ver de grote wijzer is gedraaid."), zin("Een heel rondje is een uur."), zin("Een kwart rondje is een kwartier."), zin(`Dus het duurde ${duurWoorden(d)}.`)],
          tip: zin("Kijk hoe ver de grote wijzer is gedraaid."),
          opgave: [],
          tussen: [...tijdGetallen(nu.u, nu.m), ...tijdGetallen(ander.u, ander.m)],
        },
        () => [zin(`Van ${tijdWoorden(ander.u, ander.m)} tot ${tijdWoorden(nu.u, nu.m)}.`), zin(`Dat is ${duurWoorden(d)}.`)],
      );
    }

    case "digitaalverschil": {
      const a = { u: f.eersteUur as number, m: f.eersteMinuut as number };
      const b = { u: f.tweedeUur as number, m: f.tweedeMinuut as number };
      return verschilOpgave(o, a, b, digitaal(a.u, a.m), digitaal(b.u, b.m));
    }

    case "klokkenvolgorde": {
      const klokken = f.klokken as { uur: number; minuut: number }[];
      const juist = klokken.map((k, i) => ({ i, t: k.uur * 60 + k.minuut })).sort((x, y) => x.t - y.t).map((x) => x.i);
      if (o.antwoord !== juist.join(",")) return null;
      const w = (i: number) => tijdWoorden(klokken[i].uur, klokken[i].minuut);
      const fouten: Fout[] = [
        { code: "andersom", antwoorden: [[...juist].reverse().join(",")], zinnen: [zin("Van vroeg naar laat: de vroegste eerst."), zin(`Begin met ${w(juist[0])}.`)] },
        { code: "begin", antwoorden: [juist.map((x, j) => (j === 0 ? `!${x}` : "*")).join(",")], zinnen: [zin("Begin met de vroegste tijd."), zin(`Dat is ${w(juist[0])}.`)] },
      ];
      juist.forEach((x, i) => {
        if (i === 0) return;
        fouten.push({ code: `klok-${i}`, antwoorden: [juist.map((y, j) => (j < i ? `${y}` : j === i ? `!${x}` : "*")).join(",")], zinnen: [zin("Eén klok staat nog niet goed."), zin(`Na ${w(juist[i - 1])} komt ${w(x)}.`)] });
      });
      return maak({
        antwoord: o.antwoord,
        voorlezen: o.vraagtekst,
        goed: [zin(`Eerst ${w(juist[0])}, als laatste ${w(juist[juist.length - 1])}.`)],
        fouten,
        uitleg: [zin("Kijk, zo doe je het."), zin(`Zoek eerst de vroegste tijd: ${w(juist[0])}.`), zin("Dan de tijd die daarna komt, en zo verder.")],
        tip: zin("Zoek eerst de vroegste tijd."),
        rondewoord: "opdrachten",
        opgave: [],
        tussen: klokken.flatMap((k) => tijdGetallen(k.uur, k.minuut)),
        geheim: [],
      });
    }

    case "klokkoppelen": {
      const klokken = f.klokken as { uur: number; minuut: number }[];
      const keuzes = f.keuzes as { uur: number; minuut: number }[];
      const juist = klokken.map((k) => keuzes.findIndex((c) => c.uur === k.uur && c.minuut === k.minuut));
      if (o.antwoord !== juist.join(",")) return null;
      const fouten: Fout[] = klokken.map((k, i) => ({
        code: `klok-${i}`,
        antwoorden: [juist.map((x, j) => (j === i ? `!${x}` : "*")).join(",")],
        zinnen: [zin(`Kijk naar de ${RANG[i]} klok.`), zin(`Die staat op ${tijdWoorden(k.uur, k.minuut)}.`)],
      }));
      return maak({
        antwoord: o.antwoord,
        voorlezen: o.vraagtekst,
        goed: [zin("Elke tijd hoort bij de goede klok.")],
        fouten,
        uitleg: [zin("Kijk bij elke klok eerst naar de grote wijzer."), ...wijzerZinnen(klokken[0].uur, klokken[0].minuut)],
        tip: zin("Kijk eerst naar de grote wijzer."),
        rondewoord: "opdrachten",
        opgave: [],
        tussen: klokken.flatMap((k) => tijdGetallen(k.uur, k.minuut)),
        geheim: [],
      });
    }

    case "wijzeraanwijzen":
    case "digitaaldelen": {
      const minuut = f.gevraagd === "minuut";
      if (o.antwoord !== (minuut ? "1" : "0")) return null;
      const klok = f.soort === "wijzeraanwijzen";
      const goedZin = klok
        ? minuut ? zin("De grote wijzer wijst de minuten.", "de grote wijzer licht op") : zin("De kleine wijzer wijst het uur.", "de kleine wijzer licht op")
        : minuut ? zin("Na de dubbele punt staan de minuten.", "de minuten lichten op") : zin("Vóór de dubbele punt staat het uur.", "het uur licht op");
      const fout = klok
        ? minuut ? zin("Dat is de kleine wijzer: die wijst het uur.") : zin("Dat is de grote wijzer: die wijst de minuten.")
        : minuut ? zin("Dat is het uur, vóór de dubbele punt.") : zin("Dat zijn de minuten, na de dubbele punt.");
      return maak({
        antwoord: o.antwoord,
        voorlezen: o.vraagtekst,
        goed: [goedZin],
        fouten: [{ code: "ander-deel", antwoorden: [minuut ? "0" : "1"], zinnen: [fout, goedZin] }],
        uitleg: klok ? [zin("De kleine wijzer wijst het uur."), zin("De grote wijzer wijst de minuten.")] : [zin("Vóór de dubbele punt staat het uur."), zin("Na de dubbele punt staan de minuten.")],
        tip: zin(klok ? "Welke wijzer is groot, en welke klein?" : "Kijk naar de dubbele punt in het midden."),
        rondewoord: "opdrachten",
        opgave: [],
        tussen: [f.uur, f.minuut],
        geheim: [],
      });
    }

    case "dagdeel":
    case "digitaaldagdeel": {
      const u = f.uur as number;
      const deel = u < 6 ? "nacht" : u < 12 ? "ochtend" : u < 18 ? "middag" : "avond";
      const grens: Record<string, [number, number]> = { nacht: [0, 6], ochtend: [6, 12], middag: [12, 18], avond: [18, 24] };
      return keuzeOntwerp(
        o,
        f.keuzes,
        f.goed,
        {
          voorlezen: o.vraagtekst,
          goed: [zin(`${digitaal(u, f.minuut)} is in de ${deel}.`), zin(`De ${deel} is van ${grens[deel][0]} tot ${grens[deel][1]} uur.`)],
          uitleg: [zin("De nacht is tot 6 uur."), zin("De ochtend is tot 12 uur."), zin("De middag is tot 18 uur, dan de avond."), zin(`${digitaal(u, f.minuut)} is in de ${deel}.`)],
          tip: zin("Na 12 uur tel je door: 13, 14, 15."),
          opgave: [u, f.minuut],
          tussen: [0, 6, 12, 18, 24, 13, 14, 15, ...tijdGetallen(u, f.minuut)],
        },
        () => [zin(`${digitaal(u, f.minuut)} is in de ${deel}.`), zin(`De ${deel} is van ${grens[deel][0]} tot ${grens[deel][1]} uur.`)],
      );
    }

    case "urenminuten": {
      const n = f.uitkomst as number;
      if (String(n) !== o.antwoord) return null;
      const vraag = String(f.zin).replace("▢", "hoeveel");
      return maak({
        antwoord: o.antwoord,
        voorlezen: `${o.vraagtekst.includes("▢") ? vraag : o.vraagtekst}?`.replace("??", "?"),
        goed: [zin("Een uur heeft 60 minuten."), zin(`Het antwoord is ${n} ${f.eenheid ?? "minuten"}.`)],
        fouten: [
          { code: "honderd", antwoorden: [`${Math.round((n / 60) * 100)}`].filter((x) => x !== String(n)), zinnen: [zin("Een uur heeft 60 minuten, niet 100."), zin(`Het antwoord is ${n}.`)], getallen: [100] },
          { code: "half-ernaast", antwoorden: [`${n - 30}`, `${n + 30}`], zinnen: [zin("Een half uur is 30 minuten."), zin(`Het antwoord is ${n}.`)], getallen: [30] },
        ],
        uitleg: [zin("Een uur heeft 60 minuten."), zin("Een half uur is 30, een kwartier is 15."), zin(`Dus het antwoord is ${n}.`)],
        tip: zin(n === 60 ? "Denk aan een heel rondje op de klok." : "Een uur heeft 60 minuten."),
        rondewoord: "opdrachten",
        opgave: (String(f.zin).match(/\d+/g) ?? []).map(Number),
        tussen: [60, 30, 15],
        geheim: [n],
      });
    }

    case "dagvraag":
    case "maandvraag": {
      const lijst = f.soort === "dagvraag" ? DAGEN : MAANDEN;
      const woord = f.soort === "dagvraag" ? "dag" : "maand";
      const keuzes = f.keuzes as string[];
      const goed = keuzes[f.goed];
      const naam = [...String(f.zin).toLowerCase().matchAll(/[a-z]+/g)].map((x) => x[0]).find((w) => lijst.includes(w));
      if (RANG.includes(goed)) {
        if (!naam) return null;
        const i = lijst.indexOf(naam);
        return keuzeOntwerp(
          o,
          keuzes,
          f.goed,
          {
            goed: [zin(`${hoofd(naam)} is de ${goed} ${woord}.`)],
            uitleg: i < 7 ? [zin(`Tel vanaf ${lijst[0]}: ${rij(lijst, 0, i + 1)}.`)] : [zin("Tel de maanden: januari, februari, en zo verder."), zin(`${hoofd(naam)} is de ${goed} ${woord}.`)],
            tip: zin(`Tel vanaf ${lijst[0]}.`),
            opgave: [],
            tussen: [],
          },
          () => [zin(`Tel vanaf ${lijst[0]}.`), zin(`${hoofd(naam)} is de ${goed} ${woord}.`)],
        );
      }
      if (!lijst.includes(goed)) return null;
      const gi = lijst.indexOf(goed);
      const venster = rij(lijst, gi - 1, 3);
      return keuzeOntwerp(
        o,
        keuzes,
        f.goed,
        {
          goed: [zin(`Zeg ze op volgorde: ${venster}.`), zin(`Dan zie je: ${goed}.`)],
          uitleg: [zin("Zeg ze op volgorde."), zin(`${hoofd(venster)}.`), zin(`Het antwoord is ${goed}.`)],
          tip: zin(`Zeg de ${woord === "dag" ? "dagen" : "maanden"} op volgorde op.`),
          opgave: (String(f.zin).match(/\d+/g) ?? []).map(Number),
          tussen: [],
        },
        () => [zin(`Zeg ze op volgorde: ${venster}.`), zin(`Het antwoord is ${goed}.`)],
      );
    }

    case "dagenaanvullen":
    case "maandenaanvullen": {
      const lijst = f.soort === "dagenaanvullen" ? DAGEN : MAANDEN;
      const r = f.rij as (string | null)[];
      const juist = f.ontbreekt as string[];
      if (o.antwoord.toLowerCase() !== juist.join(",").toLowerCase()) return null;
      const eerste = r.findIndex((x) => x !== null);
      const start = lijst.indexOf(String(r[eerste])) - eerste;
      const volledig = r.map((_, i) => lijst[(((start + i) % lijst.length) + lijst.length) % lijst.length]);
      const leeg = r.map((x, i) => (x === null ? i : -1)).filter((i) => i >= 0);
      const fouten: Fout[] = leeg.map((idx, k) => ({
        code: `vakje-${k}`,
        antwoorden: [juist.map((x, j) => (j === k ? `!${x}` : "*")).join(",")],
        zinnen: [zin(`Eén ${f.soort === "dagenaanvullen" ? "dag" : "maand"} klopt nog niet.`), zin(idx > 0 ? `Na ${volledig[idx - 1]} komt ${volledig[idx]}.` : `Vóór ${volledig[idx + 1]} komt ${volledig[idx]}.`)],
      }));
      return maak({
        antwoord: o.antwoord,
        voorlezen: o.vraagtekst,
        goed: [zin(`${hoofd(volledig.join(", "))}.`)],
        fouten,
        uitleg: [zin("Zeg ze op volgorde op."), zin(`${hoofd(volledig.join(", "))}.`)],
        tip: zin("Zeg ze op volgorde op."),
        rondewoord: "opdrachten",
        opgave: [],
        geheim: [],
      });
    }

    case "kalenderdag": {
      const j = f.jaar as number;
      const mnd = f.maand as number;
      const d = f.dag as number;
      const s = (f.schuif ?? 0) as number;
      const doel = new Date(j, mnd - 1, d + s);
      const goedDag = DAGEN[(doel.getDay() + 6) % 7];
      const keuzes = f.keuzes as string[];
      if (keuzes[f.goed] !== goedDag) return null;
      const startDag = weekdag(j, mnd, d);
      const maand = MAANDEN[mnd - 1];
      return keuzeOntwerp(
        o,
        keuzes,
        f.goed,
        {
          goed: s === 0 ? [zin(`${d} ${maand} valt op een ${goedDag}.`)] : [zin(`${d} ${maand} is een ${startDag}.`), zin(`${s} dagen verder is het ${goedDag}.`)],
          uitleg: s === 0 ? [zin("Zoek de datum in de kalender."), zin(`Kijk boven die kolom: ${goedDag}.`)] : [zin(`Zoek ${d} ${maand} in de kalender: een ${startDag}.`), zin(`Tel ${s} dagen verder: ${rij(DAGEN, DAGEN.indexOf(startDag) + 1, Math.min(s, 6))}.`)],
          tip: zin("Zoek de datum eerst in de kalender."),
          opgave: [d, s, Math.abs(s), j],
          tussen: [],
        },
        () => (s === 0 ? [zin("Zoek de datum in de kalender."), zin(`Kijk boven die kolom: ${goedDag}.`)] : [zin(`${d} ${maand} is een ${startDag}.`), zin(`${s} dagen verder is het ${goedDag}.`)]),
      );
    }

    case "kalenderdatum": {
      const j = f.jaar as number;
      const mnd = f.maand as number;
      const d = f.dag as number;
      const s = f.schuif as number;
      const doel = new Date(j, mnd - 1, d + s);
      const goedTekst = `${doel.getDate()} ${MAANDEN[doel.getMonth()]}`;
      const keuzes = f.keuzes as string[];
      if (keuzes[f.goed] !== goedTekst) return null;
      const maand = MAANDEN[mnd - 1];
      const stap =
        s === 1 ? "Morgen is één dag later." : s === -1 ? "Gisteren is één dag eerder." : s === 2 ? "Overmorgen is twee dagen later." : s === -2 ? "Eergisteren is twee dagen eerder." : s === 7 ? "Een week is 7 dagen." : s === -7 ? "Een week terug is 7 dagen eerder." : s > 0 ? `Tel ${s} dagen verder.` : `Tel ${-s} dagen terug.`;
      const grens = doel.getMonth() !== mnd - 1 ? `${hoofd(maand)} heeft ${dagenIn(j, mnd)} dagen.` : null;
      return keuzeOntwerp(
        o,
        keuzes,
        f.goed,
        {
          goed: [zin(stap), zin(grens ? `${grens.replace(/\.$/, "")}, dus ${goedTekst}.` : `Dus ${goedTekst}.`)],
          uitleg: grens ? [zin(stap), zin(grens), zin(`Dus het is ${goedTekst}.`)] : [zin(`Het is ${d} ${maand}.`), zin(stap), zin(`Dus het is ${goedTekst}.`)],
          tip: zin("Zoek vandaag eerst in de kalender."),
          opgave: [d, j],
          tussen: [Math.abs(s), dagenIn(j, mnd), doel.getDate(), 7],
        },
        () => [zin(stap), zin(`Dus ${goedTekst}.`)],
      );
    }

    case "kalendernachtjes": {
      const d = f.dag as number;
      const doel = f.doel as number;
      const n = doel - d;
      if (String(n) !== o.antwoord) return null;
      const maand = MAANDEN[(f.maand as number) - 1];
      return maak({
        antwoord: o.antwoord,
        voorlezen: o.vraagtekst,
        goed: [zin(`Van ${d} naar ${doel} ${maand} is ${n} nachtjes.`)],
        fouten: [
          { code: "dagen-geteld", antwoorden: [`${n + 1}`], zinnen: [zin("Tel de nachtjes, niet de dagen."), zin(`Van ${d} naar ${doel} is ${n}.`)] },
          { code: "een-ernaast", antwoorden: [`${n - 1}`], zinnen: [zin("Je zit er 1 naast."), zin(`Van ${d} naar ${doel} is ${n}.`)] },
          { code: "opgeteld", antwoorden: [`${d + doel}`], zinnen: [zin("Je hebt de datums opgeteld."), zin(`Van ${d} naar ${doel} is ${n}.`)] },
        ],
        uitleg: [zin("Elke nacht slapen is één dag verder."), zin(`Van ${d} naar ${doel} is ${doel} min ${d}.`), zin(`Dat is ${n} nachtjes.`)],
        tip: zin("Elke nacht slapen is één dag verder."),
        rondewoord: "opdrachten",
        opgave: [d, doel],
        geheim: [n],
      });
    }

    case "kalenderzoek": {
      const d = f.juisteDag as number;
      if (String(d) !== o.antwoord) return null;
      const maand = MAANDEN[(f.maand as number) - 1];
      const dag = weekdag(f.jaar, f.maand, d);
      const welke = String(f.zin).match(/de (eerste|tweede|derde|vierde|laatste)/)?.[1] ?? "";
      return maak({
        antwoord: o.antwoord,
        voorlezen: o.vraagtekst,
        goed: [zin(`De ${welke} ${dag} is ${d} ${maand}.`)],
        fouten: [
          { code: "week-ernaast", antwoorden: [`${d - 7}`, `${d + 7}`], zinnen: [zin("Je zit een week ernaast."), zin(`De ${welke} ${dag} is ${d} ${maand}.`)], getallen: [7] },
          { code: "dag-ernaast", antwoorden: [`${d - 1}`, `${d + 1}`], zinnen: [zin(`Kijk boven de kolom: daar staat ${dag}.`), zin(`De ${welke} ${dag} is ${d} ${maand}.`)] },
        ],
        uitleg: [zin(`Zoek de kolom van ${dag}.`), zin(welke === "laatste" ? "Kijk helemaal onderaan in die kolom." : `Tel van boven: de ${welke} in die kolom.`), zin(`Dat is ${d} ${maand}.`)],
        tip: zin(`Zoek eerst de kolom van ${dag}.`),
        rondewoord: "opdrachten",
        opgave: [f.jaar],
        geheim: [d],
      });
    }

    case "kalenderaantal": {
      const n = f.uitkomst as number;
      if (String(n) !== o.antwoord) return null;
      const naam = (String(f.zin).match(/Hoeveel (\w+)/) ?? [])[1] ?? "dagen";
      return maak({
        antwoord: o.antwoord,
        voorlezen: o.vraagtekst,
        goed: [zin(`Tel ze in de kolom: het zijn er ${n}.`)],
        fouten: [{ code: "een-ernaast", antwoorden: [`${n - 1}`, `${n + 1}`], zinnen: [zin(`Tel alle ${naam} in de kolom.`), zin(`Het zijn er ${n}.`)] }],
        uitleg: [zin("Zoek de goede kolom."), zin("Tel van boven naar beneden."), zin(`Het zijn er ${n}.`)],
        tip: zin("Zoek de goede kolom, en tel van boven naar beneden."),
        rondewoord: "opdrachten",
        opgave: [f.jaar],
        geheim: [n],
      });
    }

    default:
      return null;
  }
}
