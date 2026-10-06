/**
 * Schrijvers voor Geld (hoofdstuk 9 van MAATJE-HANDLEIDING.md).
 *
 * 1 euro is 100 cent. Eerst de euro's tellen, dan de centen. Een bedrag
 * schrijf je als € 2,50: de komma staat tussen de euro's en de centen.
 *
 * Een getypt bedrag komt binnen als "2,50" (zie `antwoordVan` in
 * `src/lib/geld.ts`); bij kiezen is het antwoord het nummer van de keuze.
 */

import { maak, zin, type Fout, type Ontwerp } from "@/lib/maatje/bouw";
import { euro, hoofd, stuks } from "@/lib/maatje/taal";
import type { Geschreven, Zin } from "@/lib/maatje/types";
import type { Opgave } from "@/lib/maatje/schrijf";

const RANG = ["eerste", "tweede", "derde", "vierde", "vijfde", "zesde"];
const somVan = (l: number[]) => l.reduce((s, x) => s + x, 0);
/** Zoals het antwoord binnenkomt: "2,50". */
const alsAntwoord = (cent: number) => `${Math.floor(cent / 100)},${String(cent % 100).padStart(2, "0")}`;
const halveEuro = (cent: number) => Math.round(cent / 50) * 50;

/** Alle getallen die in bedragen kunnen staan: de centen, de euro's en het stuk na de komma. */
function geldGetallen(...centen: number[]): number[] {
  return centen.flatMap((c) => [c, Math.floor(c / 100), c % 100]);
}

/** Een munt of briefje in woorden: "een briefje van 5 euro", "een munt van 20 cent". */
function stuk(c: number): string {
  if (c >= 500) return `een briefje van ${euro(c)}`;
  return `een munt van ${euro(c)}`;
}

/** "Eerst de euro's, dan de centen" voor een stapel geld. */
function telZinnen(stukken: number[]): Zin[] {
  const E = somVan(stukken.filter((s) => s >= 100));
  const C = somVan(stukken.filter((s) => s < 100));
  const t = E + C;
  if (C === 0) return [zin(`Samen is het ${euro(t)}.`, "het geld licht op")];
  if (E === 0) return [zin(`Samen is het ${euro(t)}.`, "de munten lichten op")];
  return [zin(`Eerst de euro's: ${euro(E)}.`, "de euro's lichten op"), zin(`Met ${euro(C)} erbij: ${euro(t)}.`, "de centen lichten op")];
}

/** De bekende fouten bij een getypt bedrag (de tabel in hoofdstuk 9). */
function bedragFouten(t: number, stukken: number[] = []): Fout[] {
  const e = Math.floor(t / 100);
  const c = t % 100;
  const fouten: Fout[] = [];
  if (c > 0 && e > 0) {
    fouten.push({ code: "komma-vergeten", antwoorden: [alsAntwoord(t * 100)], zinnen: [zin("De komma staat tussen de euro's en de centen."), zin(`Dus ${euro(t)}.`)], getallen: [t] });
    if (c % 10 === 0) fouten.push({ code: "centen-een-cijfer", antwoorden: [alsAntwoord(e * 100 + c / 10)], zinnen: [zin(`${c} cent is ${euro(c)}.`), zin(`Dus samen ${euro(t)}.`)], getallen: [c / 10] });
  }
  if (e === 0 && c > 0) {
    fouten.push({ code: "cent-als-euro", antwoorden: [alsAntwoord(c * 100)], zinnen: [zin(`Dat is ${c} cent, geen ${c} euro.`), zin("100 cent is pas 1 euro.")], getallen: [100, 1] });
    if (c % 10 === 0) fouten.push({ code: "cent-als-euro-2", antwoorden: [alsAntwoord((c / 10) * 100)], zinnen: [zin(`Dat is ${c} cent, geen ${c / 10} euro.`), zin("100 cent is pas 1 euro.")], getallen: [c / 10, 100, 1] });
  }
  for (const v of [...new Set(stukken)]) {
    fouten.push({ code: `munt-ernaast-${v}`, antwoorden: [alsAntwoord(t - v), alsAntwoord(t + v)].filter((a) => !a.startsWith("-")), zinnen: [zin("Tel het geld nog eens."), zin(`Het is ${euro(t)}.`)], getallen: geldGetallen(t - v, t + v) });
  }
  return fouten;
}

function keuzeFouten(keuzes: unknown[], goed: number, waarom: (k: number) => Zin[]): Fout[] {
  return keuzes.map((_, i) => i).filter((i) => i !== goed).map((i) => ({ code: `keuze-${i}`, antwoorden: [String(i)], zinnen: waarom(i) }));
}

function uit(o: Opgave, ontwerp: Omit<Ontwerp, "antwoord" | "voorlezen"> & { voorlezen?: string }): Geschreven {
  return maak({ ...ontwerp, antwoord: o.antwoord, voorlezen: ontwerp.voorlezen ?? o.vraagtekst, rondewoord: "opdrachten" });
}

/** Bedragen uit een zin: "€ 10,-" en "€ 3,20". */
function bedragenIn(tekst: string): number[] {
  return [...tekst.matchAll(/€\s?(\d+),(\d{2}|-)/g)].map((m) => Number(m[1]) * 100 + (m[2] === "-" ? 0 : Number(m[2])));
}

// ---------------------------------------------------------------------------

export function schrijfGeld(o: Opgave): Geschreven | null {
  const f = o.figuur;
  if (!f || typeof f !== "object") return null;

  switch (f.soort) {
    case "geldtellen":
    case "geldnotatie": {
      if (f.soort === "geldnotatie" && f.stand === "schrijfwijze") {
        const b = f.bedrag as number;
        const keuzes = f.keuzes as string[];
        if (String(f.goed) !== o.antwoord) return null;
        const waarde = (k: string) => {
          const m = k.match(/€\s?(\d+),(\d+|-)/);
          return m ? { e: Number(m[1]), na: m[2] } : null;
        };
        return uit(o, {
          voorlezen: o.vraagtekst,
          goed: [zin(`${f.woorden}: dat schrijf je als ${euro(b)}.`)],
          fouten: keuzeFouten(keuzes, f.goed, (i) => {
            const w = waarde(keuzes[i]);
            if (b % 100 === 0) return [zin("Bij hele euro's schrijf je een streepje na de komma."), zin(`Dus ${euro(b)}.`)];
            if (w && w.na === "-") return [zin("De komma staat tussen de euro's en de centen."), zin(`Dus ${euro(b)}.`)];
            if (w && w.na.length === 1) return [zin("Centen schrijf je altijd met 2 cijfers."), zin(`Dus ${euro(b)}.`)];
            return [zin(`${b % 100} cent is ${euro(b % 100)}.`), zin(`Dus samen ${euro(b)}.`)];
          }),
          uitleg: [zin("Eerst de euro's, dan een komma."), zin("Na de komma de centen, altijd met 2 cijfers."), zin(`Dus ${euro(b)}.`)],
          tip: zin("De komma staat tussen de euro's en de centen."),
          opgave: [...geldGetallen(b), ...keuzes.flatMap((k) => (k.match(/\d+/g) ?? []).map(Number))],
          tussen: [2],
          geheim: [],
        });
      }
      if (f.soort === "geldnotatie" && f.stand === "woorden") {
        const b = f.bedrag as number;
        if (o.antwoord !== alsAntwoord(b)) return null;
        return uit(o, {
          voorlezen: `${o.vraagtekst} ${hoofd(String(f.woorden))}.`,
          goed: [zin(`Eerst de euro's, dan de centen: ${euro(b)}.`)],
          fouten: bedragFouten(b),
          uitleg: [zin("Eerst de euro's, dan een komma."), zin("Na de komma de centen, altijd met 2 cijfers."), zin(`Dus ${euro(b)}.`)],
          tip: zin("De komma staat tussen de euro's en de centen."),
          opgave: [],
          tussen: [2, ...geldGetallen(b)],
          geheim: [],
        });
      }
      const stukken = f.stukken as number[] | null;
      if (!stukken) return null;
      const t = somVan(stukken);
      if (o.antwoord !== alsAntwoord(t)) return null;
      return uit(o, {
        goed: telZinnen(stukken),
        fouten: bedragFouten(t, stukken),
        uitleg: [zin("Kijk, zo doe je het."), zin("Eerst de euro's tellen, dan de centen."), ...telZinnen(stukken)],
        tip: zin("Eerst de euro's tellen, dan de centen."),
        opgave: [],
        tussen: geldGetallen(t, somVan(stukken.filter((s) => s >= 100)), somVan(stukken.filter((s) => s < 100)), ...stukken),
        geheim: geldGetallen(t).filter((x) => x > 0),
      });
    }

    case "geldsom": {
      const L = somVan(f.links);
      const R = somVan(f.rechts);
      const plus = f.teken === "+";
      const t = plus ? L + R : L - R;
      if (o.antwoord !== alsAntwoord(t)) return null;
      return uit(o, {
        goed: plus ? telZinnen([...f.links, ...f.rechts]) : [zin(`${euro(L)} min ${euro(R)} is ${euro(t)}.`, "het geld gaat weg")],
        fouten: [
          ...(plus ? [] : [{ code: "plus-gedaan", antwoorden: [alsAntwoord(L + R)], zinnen: [zin("Er gaat geld af, dus het wordt minder."), zin(`${euro(L)} min ${euro(R)} is ${euro(t)}.`)], getallen: geldGetallen(L + R) }]),
          ...bedragFouten(t, [...f.links, ...f.rechts]),
        ],
        uitleg: plus
          ? [zin(`Links is ${euro(L)}, rechts is ${euro(R)}.`), ...telZinnen([...f.links, ...f.rechts])]
          : [zin(`Er is ${euro(L)}.`), zin(`Er gaat ${euro(R)} af.`), zin(`Dan blijft er ${euro(t)} over.`)],
        tip: zin(plus ? "Eerst de euro's tellen, dan de centen." : "Hoeveel is er, en hoeveel gaat eraf?"),
        opgave: [...(o.vraagtekst.match(/\d+/g) ?? []).map(Number)],
        tussen: geldGetallen(L, R, t, somVan([...f.links, ...f.rechts].filter((s: number) => s >= 100)), somVan([...f.links, ...f.rechts].filter((s: number) => s < 100)), ...f.links, ...f.rechts),
        geheim: geldGetallen(t).filter((x) => x > 0),
      });
    }

    case "geldkiezen": {
      const s = f.stukken as number[];
      const meest = f.vraag === "meest";
      const g = s[f.goed];
      if (String(f.goed) !== o.antwoord) return null;
      return uit(o, {
        goed: [zin(`${hoofd(stuk(g))} is het ${meest ? "meest" : "minst"} waard.`)],
        fouten: keuzeFouten(s, f.goed, (i) => [zin(`${hoofd(stuk(s[i]))} is ${meest ? "minder" : "meer"} waard.`), zin(`${hoofd(stuk(g))} is het ${meest ? "meest" : "minst"} waard.`)]),
        uitleg: [zin("Kijk wat er op elk stuk staat."), ...(s.some((x) => x >= 500) ? [zin("Briefjes zijn meer waard dan munten.")] : [zin("Cent is minder dan euro.")]), zin(`${hoofd(stuk(g))} is het ${meest ? "meest" : "minst"} waard.`)],
        tip: zin("Kijk wat er op elk stuk staat."),
        opgave: geldGetallen(...s),
        geheim: [],
      });
    }

    case "geldgroepen": {
      const groepen = f.groepen as number[][];
      const sommen = groepen.map(somVan);
      const g = f.goed as number;
      if (String(g) !== o.antwoord) return null;
      let doelZin: string;
      if (f.stand === "precies") doelZin = `Je zoekt precies ${euro(f.prijs)}.`;
      else if (f.stand === "grootste") doelZin = `Het meeste geld is ${euro(sommen[g])}.`;
      else if (f.stand === "wisselen") doelZin = `De munt is ${euro(f.wissel)} waard.`;
      else if (f.stand === "wisselgeld") doelZin = `Je krijgt ${euro(f.betaald - f.prijs)} terug.`;
      else return null;
      return uit(o, {
        voorlezen: f.zin ?? o.vraagtekst,
        goed: [zin(`Dat groepje is ${euro(sommen[g])}.`, "het groepje licht op"), zin(doelZin)],
        fouten: keuzeFouten(groepen, g, (i) => [zin(`Dat groepje is ${euro(sommen[i])}.`), zin(doelZin)]),
        uitleg:
          f.stand === "wisselgeld"
            ? [zin(`Je betaalt ${euro(f.betaald)}.`), zin(`Het kost ${euro(f.prijs)}.`), zin(`Van ${euro(f.prijs)} naar ${euro(f.betaald)} is ${euro(f.betaald - f.prijs)}.`)]
            : [zin("Tel bij elk groepje het geld."), zin("Eerst de euro's, dan de centen."), zin(`Het goede groepje is ${euro(sommen[g])}.`)],
        tip: zin("Tel bij elk groepje eerst de euro's."),
        opgave: [...geldGetallen(...groepen.flat()), ...geldGetallen(f.prijs ?? 0, f.betaald ?? 0, f.wissel ?? 0), ...bedragenIn(String(f.zin ?? o.vraagtekst)).flatMap((x) => geldGetallen(x))],
        tussen: geldGetallen(...sommen, (f.betaald ?? 0) - (f.prijs ?? 0)),
        geheim: [],
      });
    }

    case "geldleggen": {
      const d = f.doel as number;
      if (o.antwoord !== alsAntwoord(d)) return null;
      return uit(o, {
        bouw: zin(`Leg precies ${euro(d)}.`, "het geld ligt klaar"),
        goed: [zin(`Je legde precies ${euro(d)}.`, "het geld licht op")],
        fouten: [
          { code: "te-veel", antwoorden: [`~${(d + 1) / 100}..99999`], zinnen: [zin("Gepast is precies genoeg, en dit is te veel."), zin("Haal er iets af.")] },
          { code: "te-weinig", antwoorden: [`~0..${(d - 1) / 100}`], zinnen: [zin("Gepast is precies genoeg, en dit is te weinig."), zin(`Samen moet het ${euro(d)} zijn.`)] },
        ],
        uitleg: [zin("Begin met het grootste geld dat past."), zin("Leg er dan kleiner geld bij."), zin(`Tot je precies ${euro(d)} hebt.`)],
        tip: zin("Begin met het grootste geld dat past."),
        opgave: geldGetallen(d),
        geheim: [],
      });
    }

    case "geldontbreekt": {
      const p = f.prijs as number;
      const lig = somVan(f.liggend);
      const mist = p - lig;
      const keuzes = f.keuzes as number[] | null;
      const goedZinnen = [zin(`Er ligt al ${euro(lig)}.`, "het geld licht op"), zin(`Tot ${euro(p)} moet er nog ${euro(mist)} bij.`)];
      if (keuzes) {
        if (String(f.goed) !== o.antwoord || keuzes[f.goed] !== mist) return null;
        return uit(o, {
          goed: goedZinnen,
          fouten: keuzeFouten(keuzes, f.goed, (i) => [zin(`Met ${euro(keuzes[i])} erbij is het ${euro(lig + keuzes[i])}.`), zin(`Dat is niet ${euro(p)}.`)]),
          uitleg: [zin(`Het kost ${euro(p)}.`), ...goedZinnen],
          tip: zin("Tel eerst wat er al ligt."),
          opgave: geldGetallen(p, ...f.liggend, ...keuzes),
          tussen: geldGetallen(lig, mist, ...keuzes.map((k) => lig + k)),
          geheim: [],
        });
      }
      if (o.antwoord !== alsAntwoord(mist)) return null;
      return uit(o, {
        goed: goedZinnen,
        fouten: [
          { code: "prijs-getypt", antwoorden: [alsAntwoord(p)], zinnen: [zin(`${euro(p)} is de hele prijs.`), zin(`Er ligt al ${euro(lig)}, dus nog ${euro(mist)}.`)] },
          { code: "ligt-getypt", antwoorden: [alsAntwoord(lig)], zinnen: [zin(`${euro(lig)} ligt er al.`), zin(`Tot ${euro(p)} moet er nog ${euro(mist)} bij.`)] },
          ...bedragFouten(mist),
        ],
        uitleg: [zin(`Het kost ${euro(p)}.`), ...goedZinnen],
        tip: zin("Tel eerst wat er al ligt."),
        opgave: geldGetallen(p, ...f.liggend),
        tussen: geldGetallen(lig, mist),
        geheim: geldGetallen(mist).filter((x) => x > 0),
      });
    }

    case "geldafronden": {
      const p = f.prijs as number;
      const keuzes = f.keuzes as number[];
      const stap = /halve/.test(o.vraagtekst) ? 50 : 100;
      const r = Math.round(p / stap) * stap;
      if (!keuzes) {
        if (o.antwoord !== alsAntwoord(r)) return null;
        const lo = Math.floor(p / stap) * stap;
        const hi = Math.ceil(p / stap) * stap;
        return uit(o, {
          goed: [zin(`${euro(p)} ligt het dichtst bij ${euro(r)}.`)],
          fouten: [
            { code: "andere-kant", antwoorden: [alsAntwoord(r === lo ? hi : lo)].filter((a) => a !== alsAntwoord(r)), zinnen: [zin(`${euro(p)} ligt tussen ${euro(lo)} en ${euro(hi)}.`), zin(`Het dichtst bij is ${euro(r)}.`)] },
            { code: "niet-afgerond", antwoorden: [alsAntwoord(p)].filter((a) => a !== alsAntwoord(r)), zinnen: [zin("Je moet nog afronden."), zin(`Het dichtst bij is ${euro(r)}.`)] },
          ],
          uitleg: [zin(stap === 50 ? "Hele en halve euro's: ,00 of ,50." : "Hele euro's eindigen op ,00."), zin(`${euro(p)} ligt tussen ${euro(lo)} en ${euro(hi)}.`), zin(`Het dichtst bij is ${euro(r)}.`)],
          tip: zin(stap === 50 ? "Ligt het dichter bij een hele of een halve euro?" : "Kijk naar wat er na de komma staat."),
          opgave: geldGetallen(p),
          tussen: [0, 50, ...geldGetallen(lo, hi)],
          geheim: geldGetallen(r).filter((x) => x > 0 && !geldGetallen(p).includes(x)),
        });
      }
      if (String(f.goed) !== o.antwoord || keuzes[f.goed] !== r) return null;
      return uit(o, {
        goed: [zin(`${euro(p)} ligt het dichtst bij ${euro(r)}.`)],
        fouten: keuzeFouten(keuzes, f.goed, () => [zin(`Kijk welk bedrag het dichtst bij ${euro(p)} ligt.`), zin(`Dat is ${euro(r)}.`)]),
        uitleg: [zin(stap === 50 ? "Hele en halve euro's: ,00 of ,50." : "Hele euro's eindigen op ,00."), zin(`${euro(p)} ligt tussen ${euro(Math.floor(p / stap) * stap)} en ${euro(Math.ceil(p / stap) * stap)}.`), zin(`Het dichtst bij is ${euro(r)}.`)],
        tip: zin(stap === 50 ? "Ligt het dichter bij een hele of een halve euro?" : "Kijk naar wat er na de komma staat."),
        opgave: geldGetallen(p, ...keuzes),
        tussen: [0, 50, ...geldGetallen(Math.floor(p / stap) * stap, Math.ceil(p / stap) * stap)],
        geheim: [],
      });
    }

    case "geldkorting": {
      const was = f.was as number;
      const k = f.korting as number;
      const na = was - k;
      if (f.stand === "korting" && Array.isArray(f.keuzes)) {
        const keuzes = f.keuzes as number[];
        if (String(f.goed) !== o.antwoord || keuzes[f.goed] !== k) return null;
        return uit(o, {
          goed: [zin(`Van ${euro(was)} naar ${euro(na)} is ${euro(k)}.`)],
          fouten: keuzeFouten(keuzes, f.goed, () => [zin("De korting is het verschil tussen de twee prijzen."), zin(`Van ${euro(was)} naar ${euro(na)} is ${euro(k)}.`)]),
          uitleg: [zin(`Eerst kostte het ${euro(was)}.`), zin(`Nu kost het ${euro(na)}.`), zin(`Het verschil is de korting: ${euro(k)}.`)],
          tip: zin("De korting is het verschil tussen de twee prijzen."),
          opgave: geldGetallen(was, na, ...keuzes),
          geheim: [],
        });
      }
      if (f.stand === "korting") {
        if (o.antwoord !== alsAntwoord(k)) return null;
        return uit(o, {
          goed: [zin(`Van ${euro(was)} naar ${euro(na)} is ${euro(k)}.`)],
          fouten: [
            { code: "nieuwe-prijs", antwoorden: [alsAntwoord(na)], zinnen: [zin(`${euro(na)} is de nieuwe prijs.`), zin(`De korting is het verschil: ${euro(k)}.`)] },
            { code: "oude-prijs", antwoorden: [alsAntwoord(was)], zinnen: [zin(`${euro(was)} is de oude prijs.`), zin(`De korting is het verschil: ${euro(k)}.`)] },
            ...bedragFouten(k),
          ],
          uitleg: [zin(`Eerst kostte het ${euro(was)}.`), zin(`Nu kost het ${euro(na)}.`), zin(`Het verschil is de korting: ${euro(k)}.`)],
          tip: zin("De korting is het verschil tussen de twee prijzen."),
          opgave: geldGetallen(was, na),
          geheim: geldGetallen(k).filter((x) => x > 0),
        });
      }
      const keuzes = f.keuzes as number[] | null;
      if (!keuzes) {
        if (o.antwoord !== alsAntwoord(na)) return null;
        return uit(o, {
          goed: [zin(`${euro(was)} min ${euro(k)} is ${euro(na)}.`)],
          fouten: [
            { code: "plus-gedaan", antwoorden: [alsAntwoord(was + k)], zinnen: [zin("Bij korting betaal je minder."), zin(`${euro(was)} min ${euro(k)} is ${euro(na)}.`)], getallen: geldGetallen(was + k) },
            { code: "korting-getypt", antwoorden: [alsAntwoord(k)], zinnen: [zin(`${euro(k)} is de korting.`), zin(`Je betaalt ${euro(was)} min ${euro(k)}: ${euro(na)}.`)] },
            ...bedragFouten(na),
          ],
          uitleg: [zin(`Het kostte ${euro(was)}.`), zin(`Je krijgt ${euro(k)} korting.`), zin(`Dus je betaalt ${euro(na)}.`)],
          tip: zin("Bij korting betaal je minder."),
          opgave: geldGetallen(was, k),
          geheim: geldGetallen(na).filter((x) => x > 0 && !geldGetallen(was, k).includes(x)),
        });
      }
      if (String(f.goed) !== o.antwoord || keuzes[f.goed] !== na) return null;
      return uit(o, {
        goed: [zin(`${euro(was)} min ${euro(k)} is ${euro(na)}.`)],
        fouten: keuzeFouten(keuzes, f.goed, (i) => (keuzes[i] === was + k ? [zin("Bij korting betaal je minder."), zin(`${euro(was)} min ${euro(k)} is ${euro(na)}.`)] : [zin("Reken het nog eens uit."), zin(`${euro(was)} min ${euro(k)} is ${euro(na)}.`)])),
        uitleg: [zin(`Het kostte ${euro(was)}.`), zin(`Je krijgt ${euro(k)} korting.`), zin(`Dus je betaalt ${euro(na)}.`)],
        tip: zin("Bij korting betaal je minder."),
        opgave: geldGetallen(was, k, ...keuzes),
        geheim: [],
      });
    }

    case "geldschatten": {
      const prijzen = f.prijzen as number[];
      /* Afronden op halve euro's, of op hele als dat is wat de opgave doet. */
      const opHalve = prijzen.map(halveEuro);
      const opHele = prijzen.map((p) => Math.round(p / 100) * 100);
      const pastBij = (r: number[]) => {
        const t = somVan(r);
        if (f.stand === "over") return Array.isArray(f.keuzes) ? (f.keuzes as number[])[f.goed] === (f.portemonnee as number) - t : o.antwoord === alsAntwoord((f.portemonnee as number) - t);
        return o.antwoord === (f.stand === "samenstap" ? [...r, t].map(alsAntwoord).join(",") : alsAntwoord(t));
      };
      const rond = pastBij(opHalve) ? opHalve : opHele;
      const vragen = bedragenIn(String(f.zin));
      const rondZin = prijzen.map((p, i) => `${euro(p)} is ongeveer ${euro(rond[i])}`);
      if (f.stand === "over") {
        const pm = f.portemonnee as number;
        const u = pm - somVan(rond);
        const keuzes = (f.keuzes as number[] | null) ?? [];
        if (keuzes.length === 0) {
          if (o.antwoord !== alsAntwoord(u)) return null;
          return uit(o, {
            goed: [zin(`${rondZin[0]}.`), zin(`${euro(pm)} min ${euro(rond[0])} is ${euro(u)}.`)],
            fouten: [{ code: "precies-gerekend", antwoorden: [alsAntwoord(pm - prijzen[0])].filter((a) => a !== alsAntwoord(u)), zinnen: [zin("Je hebt precies gerekend."), zin(`Maak de prijs eerst rond: ongeveer ${euro(u)}.`)], getallen: geldGetallen(pm - prijzen[0]) }],
            uitleg: [zin("Maak de prijs eerst rond."), zin(`${rondZin[0]}.`), zin(`${euro(pm)} min ${euro(rond[0])} is ${euro(u)}.`)],
            tip: zin("Maak de prijs eerst rond."),
            opgave: [...geldGetallen(...vragen, pm, ...prijzen)],
            tussen: geldGetallen(...rond, u),
            geheim: geldGetallen(u).filter((x) => x > 0 && !geldGetallen(...vragen, pm, ...prijzen).includes(x)),
          });
        }
        if (String(f.goed) !== o.antwoord || keuzes[f.goed] !== u) return null;
        return uit(o, {
          goed: [zin(`${rondZin[0]}.`), zin(`${euro(pm)} min ${euro(rond[0])} is ${euro(u)}.`)],
          fouten: keuzeFouten(keuzes, f.goed, () => [zin(`${rondZin[0]}.`), zin(`Dan houd je ongeveer ${euro(u)} over.`)]),
          uitleg: [zin("Maak de prijs eerst rond."), zin(`${rondZin[0]}.`), zin(`${euro(pm)} min ${euro(rond[0])} is ${euro(u)}.`)],
          tip: zin("Maak de prijs eerst rond."),
          opgave: [...geldGetallen(...vragen, ...keuzes, pm, ...prijzen)],
          tussen: geldGetallen(...rond, u),
          geheim: [],
        });
      }
      const t = somVan(rond);
      const goedAntwoord = f.stand === "samenstap" ? [...rond, t].map(alsAntwoord).join(",") : alsAntwoord(t);
      if (o.antwoord !== goedAntwoord || rond.length !== 2) return null;
      return uit(o, {
        goed: [zin(`Ongeveer ${euro(rond[0])} en ${euro(rond[1])}.`), zin(`Samen ongeveer ${euro(t)}.`)],
        fouten: [
          { code: "precies-opgeteld", antwoorden: f.stand === "samenstap" ? [`*,*,*,*,${alsAntwoord(somVan(prijzen))}`] : [alsAntwoord(somVan(prijzen))], zinnen: [zin("Je hebt precies opgeteld."), zin(`Maak ze eerst rond: samen ongeveer ${euro(t)}.`)], getallen: geldGetallen(somVan(prijzen)) },
        ],
        uitleg: [zin("Maak de prijzen eerst rond."), zin(`${rondZin[0]}.`), zin(`${rondZin[1]}.`), zin(`Samen ongeveer ${euro(t)}.`)],
        tip: zin("Maak de prijzen eerst rond."),
        opgave: geldGetallen(...vragen, ...prijzen),
        tussen: geldGetallen(...rond, t),
        geheim: f.stand === "samenstap" ? [] : geldGetallen(t).filter((x) => x > 0),
      });
    }

    case "geldverhaal": {
      const u = f.uitkomst as number;
      const b = bedragenIn(String(f.zin));
      if (b.length !== 2) return null;
      const groot = Math.max(...b);
      const klein = Math.min(...b);
      if (groot - klein !== u) return null;
      const keuzes = f.keuzes as number[] | null;
      const naarEuro = Math.ceil(klein / 100) * 100;
      const stappen =
        klein % 100 !== 0 && naarEuro < groot
          ? [zin(`Van ${euro(klein)} naar ${euro(naarEuro)} is ${euro(naarEuro - klein)}.`), zin(`Dan nog naar ${euro(groot)}: samen ${euro(u)}.`)]
          : [zin(`Van ${euro(klein)} naar ${euro(groot)} is ${euro(u)}.`)];
      const basis = {
        voorlezen: o.vraagtekst,
        goed: stappen,
        uitleg: [zin(`Je hebt ${euro(groot)}.`), zin(`Er gaat ${euro(klein)} af.`), ...stappen].slice(0, 4),
        tip: zin("Wat weet je, en wat wordt er gevraagd?"),
        opgave: geldGetallen(...b, ...(keuzes ?? [])),
        tussen: geldGetallen(naarEuro, naarEuro - klein, groot - naarEuro),
      };
      if (keuzes) {
        if (String(f.goed) !== o.antwoord || keuzes[f.goed] !== u) return null;
        return uit(o, { ...basis, fouten: keuzeFouten(keuzes, f.goed, () => [zin("Reken het nog eens stap voor stap."), stappen[stappen.length - 1]]), geheim: [] });
      }
      if (o.antwoord !== alsAntwoord(u)) return null;
      return uit(o, {
        ...basis,
        fouten: [
          { code: "plus-gedaan", antwoorden: [alsAntwoord(groot + klein)], zinnen: [zin("Er gaat geld af, dus het wordt minder."), stappen[stappen.length - 1]], getallen: geldGetallen(groot + klein) },
          ...bedragFouten(u),
        ],
        geheim: geldGetallen(u).filter((x) => x > 0 && !geldGetallen(...b).includes(x)),
      });
    }

    case "bonnetje": {
      const regels = f.regels as { ding: string; prijs: number }[];
      const T = somVan(regels.map((r) => r.prijs));
      const E = somVan(regels.map((r) => Math.floor(r.prijs / 100) * 100));
      const C = T - E;
      if (f.kwijt === null || f.kwijt === undefined) {
        if (o.antwoord !== alsAntwoord(T)) return null;
        return uit(o, {
          goed: [zin(`Eerst de euro's: ${euro(E)}.`), zin(`Met de centen erbij: ${euro(T)}.`)],
          fouten: [{ code: "centen-vergeten", antwoorden: [alsAntwoord(E)], zinnen: [zin("Je bent de centen vergeten."), zin(`Met ${euro(C)} erbij is het ${euro(T)}.`)] }, ...bedragFouten(T)],
          uitleg: [zin("Tel eerst de euro's, dan de centen."), zin(`De euro's samen: ${euro(E)}.`), zin(`De centen samen: ${euro(C)}.`), zin(`Samen is het ${euro(T)}.`)],
          tip: zin("Tel eerst de euro's, dan de centen."),
          opgave: geldGetallen(...regels.map((r) => r.prijs)),
          tussen: geldGetallen(E, C, T),
          geheim: geldGetallen(T).filter((x) => x > 0 && !geldGetallen(...regels.map((r) => r.prijs)).includes(x)),
        });
      }
      const x = regels[f.kwijt].prijs;
      if (o.antwoord !== alsAntwoord(x)) return null;
      const rest = T - x;
      return uit(o, {
        goed: [zin(`Samen is het ${euro(T)}.`), zin(`Haal de andere prijzen eraf: ${euro(x)}.`)],
        fouten: [{ code: "totaal-getypt", antwoorden: [alsAntwoord(T)], zinnen: [zin(`${euro(T)} is wat alles samen kost.`), zin(`Zonder de andere dingen: ${euro(x)}.`)] }, ...bedragFouten(x)],
        uitleg: [zin(`Alles samen kost ${euro(T)}.`), zin(`De andere dingen kosten samen ${euro(rest)}.`), zin(`${euro(T)} min ${euro(rest)} is ${euro(x)}.`)],
        tip: zin("Tel eerst de prijzen die je wel kunt lezen."),
        opgave: geldGetallen(T, ...regels.filter((_, i) => i !== f.kwijt).map((r) => r.prijs)),
        tussen: geldGetallen(rest),
        geheim: geldGetallen(x).filter((v) => v > 0),
      });
    }

    case "evenveel": {
      const totaal = f.aantal * f.van;
      const n = totaal / f.naar;
      if (String(n) !== o.antwoord) return null;
      return uit(o, {
        goed: [zin(`${f.aantal} keer ${euro(f.van)} is ${euro(totaal)}.`), zin(`Dat is ${n} keer ${euro(f.naar)}.`)],
        fouten: [
          { code: "aantal-overgeschreven", antwoorden: [`${f.aantal}`], zinnen: [zin(`Het zijn ${f.aantal} van ${euro(f.van)}: ${euro(totaal)}.`), zin(`Dat is ${n} keer ${euro(f.naar)}.`)] },
          { code: "een-ernaast", antwoorden: [`${n - 1}`, `${n + 1}`], zinnen: [zin(`${f.aantal} keer ${euro(f.van)} is ${euro(totaal)}.`), zin(`Dat is ${n} keer ${euro(f.naar)}.`)] },
        ],
        uitleg: [zin(`${f.aantal} keer ${euro(f.van)} is ${euro(totaal)}.`), zin(`Tel nu in stappen van ${euro(f.naar)}.`), zin(`Dat is ${n} keer.`)],
        tip: zin("Hoeveel geld is het samen?"),
        opgave: [...geldGetallen(f.van, f.naar), f.aantal, ...(o.vraagtekst.match(/\d+/g) ?? []).map(Number)],
        tussen: geldGetallen(totaal),
        geheim: [n],
      });
    }

    case "geldvolgorde": {
      const s = f.stukken as number[];
      const juist = s.map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v).map((x) => x.i);
      if (o.antwoord !== juist.join(",")) return null;
      const fouten: Fout[] = [
        { code: "andersom", antwoorden: [[...juist].reverse().join(",")], zinnen: [zin("Van weinig naar veel: het minste eerst."), zin(`Begin met ${stuk(s[juist[0]])}.`)] },
        { code: "begin", antwoorden: [juist.map((x, j) => (j === 0 ? `!${x}` : "*")).join(",")], zinnen: [zin("Begin met wat het minst waard is."), zin(`Dat is ${stuk(s[juist[0]])}.`)] },
      ];
      juist.forEach((x, i) => {
        if (i === 0) return;
        fouten.push({ code: `plek-${i}`, antwoorden: [juist.map((y, j) => (j < i ? `${y}` : j === i ? `!${x}` : "*")).join(",")], zinnen: [zin(`Kijk naar het ${RANG[i] ?? "volgende"} stuk.`), zin(`Na ${euro(s[juist[i - 1]])} komt ${euro(s[x])}.`)] });
      });
      return uit(o, {
        goed: [zin(`Eerst ${euro(s[juist[0]])}, als laatste ${euro(s[juist[juist.length - 1]])}.`)],
        fouten,
        uitleg: [zin("Kijk wat er op elk stuk staat."), zin("Cent is minder dan euro."), zin(`Begin met ${euro(s[juist[0]])}.`)],
        tip: zin("Begin met wat het minst waard is."),
        opgave: geldGetallen(...s),
        geheim: [],
      });
    }

    case "kunjebetalen": {
      const b = f.budget as number;
      const regels = f.regels as { aantal: number; prijs: number; ding: string }[];
      /* 0 is "ja, dat kan", 1 is "nee". */
      const juist = regels.map((r) => (r.aantal * r.prijs <= b ? "0" : "1"));
      if (o.antwoord !== juist.join(",")) return null;
      const fouten: Fout[] = regels.map((r, i) => {
        const t = r.aantal * r.prijs;
        return {
          code: `regel-${i}`,
          antwoorden: [juist.map((x, j) => (j === i ? `!${x}` : "*")).join(",")],
          zinnen: [zin(`${r.aantal} ${r.ding}: ${r.aantal} keer ${euro(r.prijs)} is ${euro(t)}.`), zin(t <= b ? `Dat is niet meer dan ${euro(b)}: dat kan.` : `Dat is meer dan ${euro(b)}: dat kan niet.`)],
        };
      });
      const r0 = regels[0];
      return uit(o, {
        goed: [zin(`Je rekende elke regel uit en keek of het past.`)],
        fouten,
        uitleg: [zin("Reken bij elke regel uit wat het samen kost."), zin(`${r0.aantal} keer ${euro(r0.prijs)} is ${euro(r0.aantal * r0.prijs)}.`), zin(`Is het meer dan ${euro(b)}? Dan kan het niet.`)],
        tip: zin("Reken bij elke regel uit wat het samen kost."),
        opgave: [...geldGetallen(b, ...regels.map((r) => r.prijs)), ...regels.map((r) => r.aantal)],
        tussen: geldGetallen(...regels.map((r) => r.aantal * r.prijs)),
        geheim: [],
      });
    }

    case "muntenofeuros": {
      const m = f.munt as number;
      const n = f.aantal as number;
      const t = m * n;
      if (t % 100 !== 0 || o.antwoord !== `${n},${t / 100}`) return null;
      return uit(o, {
        goed: [zin(`Het zijn ${stuks(n, "munt", "munten")} van ${euro(m)}.`), zin(`Samen is dat ${euro(t)}.`)],
        fouten: [
          { code: "omgewisseld", antwoorden: [`${t / 100},${n}`], zinnen: [zin("Eerst het aantal munten, dan de euro's."), zin(`${hoofd(stuks(n, "munt", "munten"))}, samen ${euro(t)}.`)] },
          { code: "munten-geteld", antwoorden: [`!${n},*`], zinnen: [zin("Tel de munten nog eens."), zin(`Het zijn er ${n}.`)] },
          { code: "euros", antwoorden: [`${n},!${t / 100}`], zinnen: [zin(`Elke munt is ${euro(m)}.`), zin(`Samen is dat ${euro(t)}.`)] },
        ],
        uitleg: [zin(`Tel eerst de munten: het zijn er ${n}.`), zin(`Elke munt is ${euro(m)}.`), zin(`Samen is dat ${euro(t)}.`)],
        tip: zin("Tel eerst de munten, dan het geld."),
        opgave: geldGetallen(m),
        tussen: [n, ...geldGetallen(t)],
        geheim: [n, t / 100],
      });
    }

    case "welkegroepjes": {
      const groepen = f.groepen as number[][];
      const sommen = groepen.map(somVan);
      const p = f.prijs as number;
      const juist = sommen.map((s, i) => (s === p ? i : -1)).filter((i) => i >= 0);
      if (o.antwoord !== juist.join(",")) return null;
      const fouten: Fout[] = sommen
        .map((s, i) => ({ s, i }))
        .filter(({ i }) => !juist.includes(i))
        .map(({ s, i }) => ({ code: `groepje-${i}`, antwoorden: [`${i},*`, `*,${i}`], zinnen: [zin(`Het ${RANG[i]} groepje is ${euro(s)}.`), zin(`Je zoekt precies ${euro(p)}.`)] }));
      return uit(o, {
        goed: [zin(`Die twee groepjes zijn allebei ${euro(p)}.`)],
        fouten,
        uitleg: [zin("Tel bij elk groepje het geld."), zin("Eerst de euro's, dan de centen."), zin(`Twee groepjes zijn precies ${euro(p)}.`)],
        tip: zin("Tel bij elk groepje eerst de euro's."),
        opgave: geldGetallen(p, ...groepen.flat()),
        tussen: geldGetallen(...sommen),
        geheim: [],
      });
    }

    default:
      return null;
  }
}
