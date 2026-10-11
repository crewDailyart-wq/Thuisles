/**
 * Schrijvers voor Verhaaltjessommen (hoofdstuk 10 van MAATJE-HANDLEIDING.md).
 *
 * In een verhaaltje zit een som verstopt. Eerst: wat weet je, en wat wordt
 * er gevraagd? Dan kies je de som. Pas daarna reken je.
 *
 * Welke som het is, leidt Thuisles af uit de getallen en het goede antwoord
 * van de opgave (en de naam van het soort verhaal); het maatje rekent niet
 * zelf iets nieuws uit.
 */

import { maak, zin, type Fout } from "@/lib/maatje/bouw";
import type { Geschreven } from "@/lib/maatje/types";
import type { Opgave } from "@/lib/maatje/schrijf";

type Op = "+" | "−" | "×" | ":";
const WOORD: Record<Op, string> = { "+": "plus", "−": "min", "×": "keer", ":": "gedeeld door" };
const MAANDEN = ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"];

function reken(a: number, op: Op, b: number): number {
  if (op === "+") return a + b;
  if (op === "−") return a - b;
  if (op === "×") return a * b;
  return b === 0 ? NaN : a / b;
}

/** Welke bewerkingen leveren het goede antwoord op? De naam van het verhaal beslist bij twijfel. */
function vindSom(getallen: number[], goed: number, soort: string): Op[] | null {
  const keer = /^(keer|dag|geld|terug)$/.test(soort);
  const deel = /^(deel|deelgeld|groep|team)$/.test(soort);
  const voorkeur: Op[] = keer ? ["×"] : deel ? [":"] : ["+", "−"];
  const alle: Op[] = ["+", "−", "×", ":"];
  if (getallen.length === 2) {
    const [a, b] = getallen;
    for (const op of [...voorkeur, ...alle]) if (reken(a, op, b) === goed) return [op];
    return null;
  }
  if (getallen.length === 3) {
    const [a, b, c] = getallen;
    for (const op1 of ["+", "−"] as Op[]) for (const op2 of ["+", "−"] as Op[]) if (reken(reken(a, op1, b), op2, c) === goed) return [op1, op2];
    return null;
  }
  return null;
}

function waaromZin(op: Op, soort: string): string {
  if (op === "+") return soort === "samen" || soort === "drie" ? "Je wilt weten hoeveel het samen is." : "Er komt iets bij, dus het wordt meer.";
  if (op === "−") {
    if (soort === "verschil") return "Je zoekt het verschil tussen de twee.";
    if (soort === "aanvul") return "Je zoekt hoeveel er nog bij moet.";
    return "Er gaat iets af, dus het wordt minder.";
  }
  if (op === "×") return "Steeds evenveel, dus het is keer.";
  return soort === "groep" || soort === "team" ? "Je maakt groepjes, dus gedeeld door." : "Je verdeelt eerlijk, dus gedeeld door.";
}

export function schrijfVerhaal(o: Opgave): Geschreven | null {
  const f = o.figuur;
  const sg = o.somgegevens;
  if (!f || f.soort !== "verhaaltje" || !sg) return null;
  const soort = String(sg.variant ?? "").split("-")[0];
  const getallen = sg.getallen;
  const g = sg.goed;
  const ops = vindSom(getallen, g, soort);
  if (!ops) return null;

  const keuzes: string[] | null = Array.isArray(f.keuzes) ? f.keuzes : null;
  const keuzeGetal = (k: string) => Number((k.match(/\d+/) ?? [])[0]);
  if (keuzes ? String(f.goed) !== o.antwoord || keuzeGetal(keuzes[f.goed]) !== g : String(g) !== o.antwoord) return null;

  const eenheid = String(f.eenheid ?? "");
  const maand = MAANDEN.includes(eenheid);
  const metEenheid = (n: number) => (maand ? `${n} ${eenheid}` : eenheid && n !== 1 ? `${n} ${eenheid}` : `${n}`);

  /* De som in woorden, en de tussenstap bij twee stappen. */
  let somZinnen: string[];
  let tussen: number[] = [];
  if (ops.length === 1) {
    const [a, b] = getallen;
    const op = ops[0];
    if (op === "−" && (soort === "verschil" || soort === "aanvul")) {
      somZinnen = [`Van ${b} naar ${a} is ${g}.`];
    } else {
      somZinnen = [`${a} ${WOORD[op]} ${b} is ${g}.`];
    }
  } else {
    const [a, b, c] = getallen;
    const s1 = reken(a, ops[0], b);
    tussen = [s1];
    somZinnen = [`Eerst ${a} ${WOORD[ops[0]]} ${b} is ${s1}.`, `Dan ${s1} ${WOORD[ops[1]]} ${c} is ${g}.`];
  }
  const waarom = ops.length === 1 ? waaromZin(ops[0], soort) : "Er gebeuren twee dingen na elkaar.";

  /* Bekende fouten: de verkeerde som, een rekenfout van 1, en een getal uit het verhaal overgeschreven. */
  const fouten: Fout[] = [];
  const verkeerd = sg.extra?.verkeerd;
  if (typeof verkeerd === "number" && verkeerd !== g) {
    fouten.push({ code: "verkeerde-som", antwoorden: [`${verkeerd}`], zinnen: [zin(waarom), zin(somZinnen.length === 1 ? somZinnen[0] : somZinnen[1])] });
  }
  if (ops.length === 2 || getallen.length === 3) {
    const alles = getallen.reduce((s, x) => s + x, 0);
    if (alles !== g) fouten.push({ code: "alles-opgeteld", antwoorden: [`${alles}`], zinnen: [zin("Lees nog eens: wat gebeurt er met elk getal?"), zin(`${somZinnen[0]}`)], getallen: [alles] });
  }
  fouten.push({ code: "een-ernaast", antwoorden: [`${g - 1}`, `${g + 1}`], zinnen: [zin(somZinnen.length === 1 ? "De som klopt, maar reken nog eens." : "Reken de twee stappen nog eens."), zin(somZinnen.length === 1 ? somZinnen[0] : somZinnen[1])] });
  for (const x of getallen) {
    if (x === g) continue;
    fouten.push({ code: `getal-overgeschreven-${x}`, antwoorden: [`${x}`], zinnen: [zin(`${x} staat al in het verhaal.`), zin(somZinnen.length === 1 ? `Reken ermee: ${somZinnen[0].charAt(0).toLowerCase()}${somZinnen[0].slice(1)}` : `Na twee stappen is het ${g}.`)] });
  }

  /* Bij kiezen uit vier antwoorden is het antwoord het nummer van de keuze. */
  const naarKeuze = (lijst: Fout[]): Fout[] =>
    keuzes
      ? lijst
          .map((fout) => ({
            ...fout,
            antwoorden: fout.antwoorden.flatMap((a) => keuzes.map((k, i) => (String(keuzeGetal(k)) === a ? String(i) : null)).filter((x): x is string => x !== null)),
            getallen: [...(fout.getallen ?? []), ...fout.antwoorden.flatMap((a) => (a.match(/\d+/g) ?? []).map(Number))],
          }))
          .filter((fout) => fout.antwoorden.length > 0)
      : lijst;

  const geschreven = maak({
    antwoord: o.antwoord,
    voorlezen: o.vraagtekst,
    goed: [zin(waarom), zin(somZinnen.length === 1 ? somZinnen[0].replace(/is (\d+)\.$/, `is ${metEenheid(g)}.`) : `Dus het zijn ${metEenheid(g)}.`)],
    fouten: naarKeuze(fouten),
    uitleg:
      somZinnen.length === 1
        ? [zin("Lees het verhaal nog eens."), zin(waarom), zin(somZinnen[0]), zin(`Dus het antwoord is ${metEenheid(g)}.`)]
        : [zin(waarom), zin(somZinnen[0]), zin(somZinnen[1]), zin(`Dus het antwoord is ${metEenheid(g)}.`)],
    tip: zin("Wat weet je, en wat wordt er gevraagd?"),
    rondewoord: "sommen",
    opgave: [...getallen, ...(keuzes ? keuzes.map(keuzeGetal) : [])],
    tussen,
    geheim: keuzes ? [] : [g],
  });
  /* Tekst 1 is hier het verhaal zelf, zoals de eigenaar het schreef: dat telt niet mee voor de zinslengte. */
  geschreven.controle.voorlezenIsVraag = true;
  return geschreven;
}
