/**
 * Schrijvers voor Splitsen (hoofdstuk 5 van MAATJE-HANDLEIDING.md).
 *
 * Een getal kun je in twee stukken verdelen, en die stukken maken samen weer
 * het hele getal. De splitsingen van 10 zijn het belangrijkst.
 */

import { maak, zin, type Fout } from "@/lib/maatje/bouw";
import { metSom } from "@/lib/maatje/schrijvers/rekenen";
import { getalWoord, hoofd, stuks } from "@/lib/maatje/taal";
import type { Geschreven } from "@/lib/maatje/types";
import type { Opgave } from "@/lib/maatje/schrijf";

const RANG = ["eerste", "tweede", "derde", "vierde", "vijfde", "zesde", "zevende", "achtste"];
const kralen = (n: number) => stuks(n, "kraal", "kralen");
const doelZin = (geheel: number) => (geheel === 10 ? "om 10 te maken" : `om ${geheel} te krijgen`);

function omgedraaid(c: number): Fout | null {
  if (c < 10 || c > 99) return null;
  const t = Math.floor(c / 10);
  const e = c % 10;
  if (t === e || e === 0) return null;
  return {
    code: "cijfers-omgedraaid",
    antwoorden: [`${e}${t}`],
    zinnen: [zin(`${hoofd(getalWoord(c))} schrijf je als ${c}.`), zin(`Eerst de ${t}, dan de ${e}.`)],
    getallen: [t, e],
  };
}

/** Van stuk naar geheel: in één keer, of eerst naar het tiental. */
function stappen(stuk: number, geheel: number) {
  const tiental = Math.ceil((stuk + 1) / 10) * 10;
  if (stuk % 10 !== 0 && tiental < geheel) return { tiental, n: tiental - stuk, m: geheel - tiental };
  return null;
}

/**
 * De kern: het geheel en het stuk dat er staat; het kind zoekt het andere stuk.
 * `plaats(x)` maakt van één antwoord het patroon voor de herkenning (bij een
 * tabel staan de andere vakjes er met `*` omheen).
 */
function splitsKern(geheel: number, stuk: number, plaats: (x: string) => string = (x) => x) {
  const ander = geheel - stuk;
  const st = stappen(stuk, geheel);
  const fouten: Fout[] = [];
  const voeg = (f: Fout | null) => f && fouten.push(f);

  for (const d of [1, 2]) {
    voeg({
      code: `te-veel-${d}`,
      antwoorden: [plaats(String(ander + d))],
      zinnen:
        geheel === 10
          ? [zin(`${stuk} en ${ander + d} is ${stuk + ander + d}, dat is te veel.`), zin(`${stuk} en ${ander} maken samen 10.`, "een volle rij van 10")]
          : [zin(`${stuk} en ${ander + d} is ${geheel + d}, dat is te veel.`), zin(`Haal er ${d} af: ${stuk} en ${ander}.`, "het stuk wordt kleiner")],
      getallen: [ander + d, geheel + d, d],
    });
    if (ander - d >= 0) {
      voeg({
        code: `te-weinig-${d}`,
        antwoorden: [plaats(String(ander - d))],
        zinnen:
          geheel === 10
            ? [zin(`${stuk} en ${ander - d} is ${geheel - d}, dat is te weinig.`), zin(`${stuk} en ${ander} maken samen 10.`, "een volle rij van 10")]
            : [zin(`${stuk} en ${ander - d} is ${geheel - d}, dat is te weinig.`), zin(`Doe er ${d} bij: ${stuk} en ${ander}.`, "het stuk wordt groter")],
        getallen: [ander - d, geheel - d, d],
      });
    }
  }
  voeg({ code: "geheel-overgeschreven", antwoorden: [plaats(String(geheel))], zinnen: [zin(`${geheel} is het hele getal al.`), zin(`${stuk} en ${ander} is samen ${geheel}.`)] });
  if (stuk !== ander) voeg({ code: "stuk-overgeschreven", antwoorden: [plaats(String(stuk))], zinnen: [zin(`Je schreef ${stuk}.`), zin(`${stuk} en ${ander} is samen ${geheel}.`)] });
  voeg({ code: "opgeteld", antwoorden: [plaats(String(geheel + stuk))], zinnen: [zin("Je hebt de twee getallen opgeteld."), zin(`Er moet ${ander} bij ${stuk} ${doelZin(geheel)}.`)] });
  voeg(omgedraaid(ander));

  const uitleg = ander === 0
    ? [zin("Kijk, zo doe je het."), zin(`${stuk} is al het hele getal.`), zin(`Dus ${geheel} is ${stuk} en 0.`, "beide stukken lichten op")]
    : st
    ? [zin("Kijk, zo doe je het."), zin(`Van ${stuk} naar ${st.tiental} is ${st.n}.`, "eerst naar het tiental"), zin(`Van ${st.tiental} naar ${geheel} is ${st.m}.`, "dan de rest"), zin(`Dus ${geheel} is ${stuk} en ${ander}.`, "beide stukken lichten op")]
    : [zin("Kijk, zo doe je het."), zin(`Begin bij ${stuk} en tel door tot ${geheel}.`, "tellen tot het hele getal"), zin(`Dus ${geheel} is ${stuk} en ${ander}.`, "beide stukken lichten op")];

  return {
    ander,
    goed: geheel === 10 ? [zin(`${stuk} en ${ander} maken samen 10.`, "een volle rij van 10")] : [zin(`${geheel} is ${stuk} en ${ander}.`, "beide stukken lichten op"), zin(`Samen weer ${geheel}.`)],
    fouten,
    uitleg,
    tip: zin(`Hoeveel moet er bij ${stuk} ${doelZin(geheel)}?`),
    tussen: st ? [st.tiental, st.n, st.m] : [],
  };
}

function enkel(o: Opgave, geheel: number, stuk: number, somVraag: string): Geschreven | null {
  const k = splitsKern(geheel, stuk);
  if (String(k.ander) !== o.antwoord) return null;
  return maak({
    antwoord: o.antwoord,
    voorlezen: metSom(o.vraagtekst, somVraag),
    goed: k.goed,
    fouten: k.fouten,
    uitleg: k.uitleg,
    tip: k.tip,
    opgave: [geheel, stuk],
    tussen: k.tussen,
    geheim: [k.ander],
  });
}

export function schrijfSplitsen(o: Opgave): Geschreven | null {
  const f = o.figuur;
  if (!f || typeof f !== "object") return null;

  switch (f.soort) {
    case "aanvullen":
      return enkel(o, f.doel, f.gegeven, `${f.gegeven} en hoeveel?`);

    case "splitsschema": {
      const stuk = f.links ?? f.rechts;
      if (typeof stuk !== "number") return null;
      return enkel(o, f.geheel, stuk, `${f.geheel} is ${stuk} en hoeveel?`);
    }

    case "splitstabel": {
      const doel = f.doel as number;
      const gegeven = f.gegeven as number[];
      const juist = gegeven.map((g) => doel - g);
      if (o.antwoord !== juist.join(",")) return null;
      const fouten: Fout[] = [];
      gegeven.forEach((g, i) => {
        const plaats = (x: string) => gegeven.map((_, j) => (j === i ? x : "*")).join(",");
        const k = splitsKern(doel, g, plaats);
        /* Per vakje de bekende fouten, en daarna "dit vakje klopt nog niet". */
        for (const fout of k.fouten) fouten.push({ ...fout, code: `${fout.code}-vakje-${i}` });
        fouten.push({ code: `vakje-${i}`, antwoorden: [plaats(`!${juist[i]}`)], zinnen: [zin(`Kijk naar het ${RANG[i] ?? "volgende"} vakje.`), zin(`${g} en ${juist[i]} is samen ${doel}.`)] });
      });
      return maak({
        antwoord: o.antwoord,
        voorlezen: `${o.vraagtekst} Samen moet het steeds ${doel} zijn.`,
        goed: [zin(`${gegeven[0]} en ${juist[0]} is samen ${doel}.`), zin("Zo klopt elk vakje.")],
        fouten,
        uitleg: [zin("Kijk, zo doe je het."), zin(`Samen moet het steeds ${doel} zijn.`), zin(`${gegeven[0]} en ${juist[0]} is ${doel}.`), zin("Zo doe je het bij elk vakje.")],
        tip: zin(`Wat moet erbij om ${doel} te krijgen?`),
        rondewoord: "opdrachten",
        opgave: [doel, ...gegeven],
        tussen: [1, 2],
        geheim: juist,
      });
    }

    case "splitsdriehoek": {
      const boven = f.boven as number;
      const ro = f.rechtsonder as number;
      const onder = f.onder as number;
      const lo = onder - ro;
      const links = boven + lo;
      const rechts = boven + ro;
      if (o.antwoord !== `${lo},${links},${rechts}`) return null;
      return maak({
        antwoord: o.antwoord,
        voorlezen: o.vraagtekst,
        goed: [zin(`${lo} en ${ro} is samen ${onder}.`), zin(`Met ${boven} erbij: ${links} en ${rechts}.`)],
        fouten: [
          { code: "onderste-vakje", antwoorden: [`!${lo},*,*`], zinnen: [zin(`Onderaan moet het samen ${onder} zijn.`), zin(`${lo} en ${ro} is ${onder}.`)] },
          { code: "linker-vakje", antwoorden: [`${lo},!${links},*`], zinnen: [zin(`Tel ${boven} en ${lo} op.`), zin(`Dat is ${links}.`)] },
          { code: "rechter-vakje", antwoorden: [`${lo},${links},!${rechts}`], zinnen: [zin(`Tel ${boven} en ${ro} op.`), zin(`Dat is ${rechts}.`)] },
        ],
        uitleg: [zin(`Eerst onderaan: ${lo} en ${ro} is ${onder}.`), zin(`Dan ${boven} en ${lo} is ${links}.`), zin(`En ${boven} en ${ro} is ${rechts}.`)],
        tip: zin(`Begin onderaan: wat hoort er bij ${ro}?`),
        rondewoord: "opdrachten",
        opgave: [boven, ro, onder],
        geheim: [lo, links, rechts],
      });
    }

    case "verdelen": {
      const n = f.aantal as number;
      const v = f.verschil as number;
      const l = (n + v) / 2;
      const r = (n - v) / 2;
      if (o.antwoord !== `${l},${r}`) return null;
      const fouten: Fout[] = [];
      if (v > 0) fouten.push({ code: "omgedraaid", antwoorden: [`${r},${l}`], zinnen: [zin("Links moet er meer hebben."), zin(`Links ${l}, rechts ${r}.`)] });
      for (let x = 0; x <= n; x++) {
        if (x === l || (v > 0 && x === r)) continue;
        fouten.push({
          code: `verschil-${x}`,
          antwoorden: [`${x},${n - x}`],
          zinnen: [zin(`${x} en ${n - x} is wel ${n}.`), zin(v === 0 ? `Maar beide kanten evenveel: ${l} en ${r}.` : `Maar links moet er ${v} meer hebben: ${l} en ${r}.`)],
          getallen: [x, n - x],
        });
      }
      fouten.push({ code: "links-goed", antwoorden: [`${l},!${r}`], zinnen: [zin(`Samen moeten het ${kralen(n)} zijn.`), zin(`${l} en ${r} is ${n}.`)] });
      fouten.push({ code: "rechts-goed", antwoorden: [`!${l},${r}`], zinnen: [zin(`Samen moeten het ${kralen(n)} zijn.`), zin(`${l} en ${r} is ${n}.`)] });
      return maak({
        antwoord: o.antwoord,
        voorlezen: o.vraagtekst,
        goed: v === 0 ? [zin(`${l} en ${r} is ${n}, en beide kanten evenveel.`)] : [zin(`${l} en ${r} is ${n}.`), zin(`Links heeft er ${v} meer.`)],
        fouten,
        uitleg:
          v === 0
            ? [zin("Kijk, zo doe je het."), zin("Leg er steeds één links en één rechts."), zin(`Dan heeft elke kant er ${l}.`)]
            : [zin("Kijk, zo doe je het."), zin(`Leg eerst ${kralen(v)} links.`), zin(`Verdeel de rest eerlijk: ${(n - v) / 2} en ${(n - v) / 2}.`), zin(`Dus links ${l} en rechts ${r}.`)],
        tip: zin(v === 0 ? "Leg er steeds één links en één rechts." : `Leg eerst ${kralen(v)} extra links.`),
        rondewoord: "opdrachten",
        opgave: [n, v],
        tussen: [(n - v) / 2],
        geheim: [l, r],
      });
    }

    default:
      return null;
  }
}
