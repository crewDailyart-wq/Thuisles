/**
 * Lessen "Plussommen" naar Squla groep 3 Rekenen (30 oktober 2026, opdracht
 * eigenaar). Per Squla-oefening per level één les; elke les volgt hoe dat
 * level bij Squla is opgebouwd (zelfde soorten vragen in dezelfde volgorde,
 * dezelfde getallenreeks), met eigen getallen, eigen zinnen en eigen
 * tekeningen. De analyse staat in SQULA-ANALYSE/plussommen-*-volledig.md.
 *
 *   Plussommen (16054)        squla-plus-bakkerij-1/2/3   platte 2D: Bliepo's bakkerij
 *   Dansende sommen (15684)   squla-plus-dansen-1/2/3/4   donker met gloed: de disco
 *   Bussommen 1 (7272)        squla-plus-bus1-1/2/3       platte 2D-bus, instappers als poppetjes
 *   Bussommen 2 (7273)        squla-plus-bus2-1/2/3       platte 2D-bus, instappers als getal
 *   Kale sommen (7274)        squla-plus-kaal-1/2/3       hologram: alleen een sierplaatje
 *
 * Getallenreeks per level (zoals Squla): tot 10 · tot 20 zonder over het
 * tiental · over het tiental (bij de bakkerij level 3 ook dubbelsommen en
 * één makkelijke onder de 10; bij Dansende sommen alleen "samen 10").
 *
 * Keuzes van de hoofdagent (vooraf genoteerd):
 *  - De hulp is altijd de vaste hulp van Bliepo (squla-hulp.ts); bij een fout
 *    zegt Bliepo nooit "goed gedaan" (Squla deed dat soms bij typen).
 *  - Squla's rekentrucjes bij een fout (dubbelsom en één meer, omdraaien,
 *    eerst naar 10, "denk aan 3 + 4") zijn de basis van Bliepo's uitleg
 *    (`rekenUitleg`), in eigen woorden en in beeld: een rij van 10 (of twee
 *    rijen) met oranje en blauwe stippen. Bliepo zegt het antwoord niet voor.
 *  - Bij de bus telt Bliepo samen verder vanaf de kinderen in de bus; bij 10
 *    of meer is het een dubbeldekker met boven een volle rij van 10.
 *  - Disco: alleen de rekenvraag, zonder tijdsdruk, zonder bonusspel of muntjes.
 *  - Getallen typen: een echt invoerveld (l.getal, HARDE REGEL 5).
 */

import type { ComponentType } from "react";
import type { Lesdraaiboek, Lesgids } from "../soort";
import { speelLesgeluid } from "@/lib/lesgeluiden";
import { squlaBegin, squlaEind, squlaVraag, zetTestAntwoord } from "./squla-hulp";
import {
  KaartBakkerij,
  KaartBus,
  KaartDisco,
  KaartKaal,
  SqulaPlusVlak,
  type Groep,
  type Kaart,
  type Lijn,
  type PlusBeeld,
  type PlusProps,
  type Rek,
  type Stijl,
} from "../vlakken/squla-plussommen-vlak";

/* =====================================================================
   Woorden
   ===================================================================== */

/** Een getal in de zin (wit, of in de kleur van de stippen). */
const g = (n: number, k = "wit") => `{${n}:${k}}`;
const o = (n: number) => g(n, "oranje");
const bl = (n: number) => g(n, "blauw");
const plus = (a: number, b: number) => `${g(a)} + ${g(b)}`;
/** Een som op een kaartje of knop. */
const somTekst = (a: number, b: number) => `${a} + ${b} = ${a + b}`;
const somAria = (a: number, b: number) => `${a} plus ${b} is ${a + b}`;

/* =====================================================================
   Het vlak
   ===================================================================== */

type Stand = { stijl: Stijl; huidig: string; nr: number; goed: number; fout: number; typUitgelegd: boolean };
type Vraag = (l: Lesgids, st: Stand) => Promise<boolean>;

const zet = (l: Lesgids, p: Partial<PlusProps>) => l.pasVlakAan<PlusProps>(p);
const LEEG: Partial<PlusProps> = { sommen: [], actief: false, gekozen: [], uit: [], goedIds: [], lijnen: [], licht: [], rek: null, busLicht: false, busTel: 0, busLos: false };

/** Een nieuw beeld (Bliepo tovert het tevoorschijn). Hetzelfde beeld (nog een keer, na de uitleg): alles blijft staan. */
function toon(l: Lesgids, st: Stand, beeld: PlusBeeld, extra: Partial<PlusProps> = {}): boolean {
  if (st.huidig === beeld.id) return false;
  st.huidig = beeld.id;
  l.som(null);
  zet(l, { ...LEEG, beeld, ...extra });
  speelLesgeluid("verschijn");
  return true;
}

/** De som bovenaan: a + b = ▢ (met het antwoord als het er al is). */
function somBoven(l: Lesgids, a: number, b: number, uitkomst?: number) {
  l.som([{ t: "getal", n: a }, { t: "teken", s: "+" }, { t: "getal", n: b }, { t: "teken", s: "=" }, { t: "vak", waarde: uitkomst === undefined ? undefined : String(uitkomst) }]);
}

const goedBeeld = (l: Lesgids, st: Stand, extra: Partial<PlusProps> = {}) => zet(l, { goed: ++st.goed, licht: [], busLicht: false, rek: null, actief: false, ...extra });
const foutBeeld = (l: Lesgids, st: Stand) => zet(l, { fout: ++st.fout });

async function kiesGetal(l: Lesgids, keuzes: number[]) {
  return Number(await l.kies(keuzes.map(String), { weetniet: false, direct: true }));
}

/** Een getal typen (echt invoerveld, HARDE REGEL 5). De eerste keer wijst Bliepo het vinkje aan. */
async function typGetal(l: Lesgids, st: Stand, tip: string[]): Promise<number> {
  const p = l.getal();
  if (!st.typUitgelegd) {
    st.typUitgelegd = true;
    await l.wijsAan("controleer", "Typ het getal.", "Tik dan op het vinkje.");
  }
  let x = await p;
  while (x === null) {
    await l.zeg("Geen probleem.", ...tip);
    x = await l.getal();
  }
  return x;
}

/** Wachten tot het kind iets in de tekening aantikt. */
async function tik(l: Lesgids): Promise<string> {
  zet(l, { actief: true });
  const t = await l.wachtOpVlak<{ soort: string; id: string }>("tik");
  zet(l, { actief: false });
  return t.id;
}

/** Twee dingen aantikken (nog eens op hetzelfde tikken = niet meer gekozen). Daarna vanzelf nakijken, zoals Squla. */
async function kiesTwee(l: Lesgids, goedIds: string[]): Promise<[string, string]> {
  for (;;) {
    zetTestAntwoord(goedIds[0]);
    zet(l, { gekozen: [] });
    const a = await tik(l);
    zet(l, { gekozen: [a] });
    zetTestAntwoord(goedIds.includes(a) ? goedIds.find((x) => x !== a) : goedIds[0]);
    const b = await tik(l);
    if (b === a) continue;
    zet(l, { gekozen: [a, b] });
    await l.wacht(450);
    return [a, b];
  }
}

/* =====================================================================
   Bliepo's uitleg: de rij van 10 met stippen
   ===================================================================== */

/**
 * Samen uitrekenen, met de rekentrucjes van Squla als basis (eigen woorden,
 * in beeld met stippen): een dubbelsom, een dubbelsom en één meer, omdraaien
 * (begin bij het grootste getal), eerst naar 10, of "denk aan de som onder
 * de 10". Bliepo zegt het antwoord niet; het laatste stapje doet het kind.
 */
async function rekenUitleg(l: Lesgids, a: number, b: number) {
  const s = a + b;
  const rijen: 1 | 2 = s > 10 ? 2 : 1;
  const rek = (x: number, y: number, extra: Partial<Rek> = {}) => zet(l, { rek: { rijen, a: x, b: y, ...extra } });
  const stippen = (x: number, y: number) => `${o(x)} ${x === 1 ? "oranje stip" : "oranje stippen"} en ${bl(y)} ${y === 1 ? "blauwe stip" : "blauwe stippen"}.`;
  if (a === b) {
    rek(a, b);
    await l.zeg(`Kijk: ${stippen(a, b)}`, "Twee keer hetzelfde getal: dat is een dubbelsom.");
    if (a >= 4) {
      const rij = [a - 2, a - 1];
      await l.zeg(...rij.map((n) => `${plus(n, n)} = ${g(2 * n)}.`), `Elke keer komen er ${g(2)} bij.`, `Hoeveel is dan ${plus(a, b)}?`);
    } else await l.zeg("Tel alle stippen maar.");
    return;
  }
  const groot = Math.max(a, b);
  const klein = Math.min(a, b);
  if (groot - klein === 1 && klein >= 2 && groot < 10) {
    rek(a, b);
    await l.zeg(`Kijk: ${stippen(a, b)}`, `${plus(klein, klein)} is ${g(2 * klein)}.`, `${g(groot)} is één meer dan ${g(klein)}.`, `Dus ${plus(a, b)} is één meer dan ${g(2 * klein)}.`);
    return;
  }
  if (a < b) await l.zeg("Draai de som om.", `Begin bij het grootste getal: ${g(groot)}.`);
  if (groot >= 10) {
    const e = groot - 10;
    rek(groot, klein);
    if (e === 0) await l.zeg(`${o(10)} oranje stippen: de bovenste rij is vol.`, `Er komen ${bl(klein)} blauwe stippen bij.`, `${g(10)} en nog ${g(klein)}: hoeveel is dat?`);
    else await l.zeg(`${o(groot)} is ${g(10)} en nog ${g(e)}.`, `Kijk naar de ${g(e)} en de ${g(klein)}.`, `${plus(e, klein)} = ${g(e + klein)}.`, `Dan komt de ${g(10)} er nog bij.`);
    return;
  }
  if (s > 10) {
    const vul = 10 - groot;
    const rest = klein - vul;
    rek(groot, klein, { bZicht: 0 });
    await l.zeg(`Hier zijn ${o(groot)} oranje stippen.`, `Eerst maken we de rij vol tot ${g(10)}.`);
    rek(groot, klein, { bZicht: vul });
    await l.wacht(vul * 120 + 300);
    await l.zeg(`${plus(groot, vul)} = ${g(10)}.`, rest === 1 ? `Van de ${bl(klein)} blauwe stippen is er nog ${bl(1)} over.` : `Van de ${bl(klein)} blauwe stippen zijn er nog ${bl(rest)} over.`);
    rek(groot, klein);
    await l.wacht(rest * 120 + 300);
    await l.zeg(`${g(10)} en nog ${g(rest)}: hoeveel is dat?`);
    return;
  }
  /* Tot 10: verder tellen vanaf het grootste getal. */
  rek(groot, klein, { bZicht: 0 });
  await l.zeg(`Hier zijn ${o(groot)} oranje stippen.`, klein === 1 ? `Er komt ${bl(1)} blauwe stip bij.` : `Er komen ${bl(klein)} blauwe stippen bij.`);
  if (klein === 1) {
    rek(groot, klein);
    await l.zeg(`Eén meer dan ${g(groot)}: hoeveel is dat?`);
    return;
  }
  await l.zeg(`We tellen verder vanaf ${g(groot)}.`);
  const labels: { k: number; t: string }[] = [];
  for (let i = 1; i < klein; i++) {
    labels.push({ k: groot + i - 1, t: String(groot + i) });
    rek(groot, klein, { bZicht: i, labels: [...labels] });
    await l.zeg(`${g(groot + i)}.`);
  }
  rek(groot, klein, { bZicht: klein, labels: [...labels] });
  await l.zeg("Tel jij de laatste?");
}

/** De tip na een fout ná de uitleg (zonder het antwoord). */
function rekenTip(a: number, b: number): string[] {
  const groot = Math.max(a, b);
  const klein = Math.min(a, b);
  const s = a + b;
  if (a === b) return ["Het is een dubbelsom.", `Hoeveel is ${plus(a, b)}?`];
  if (groot - klein === 1 && klein >= 2 && groot < 10) return [`Denk aan ${plus(klein, klein)} = ${g(2 * klein)}.`, "Het antwoord is één meer."];
  if (groot >= 10) return groot === 10 ? [`${g(10)} en nog ${g(klein)}.`, "Hoeveel is dat?"] : [`Denk aan ${plus(groot - 10, klein)}.`, `Dan komt de ${g(10)} er nog bij.`];
  if (s > 10) {
    const rest = klein - (10 - groot);
    return [`Eerst naar ${g(10)}.`, rest === 1 ? `Dan komt er nog ${g(1)} bij.` : `Dan komen er nog ${g(rest)} bij.`];
  }
  return [`Begin bij ${g(groot)}.`, `Tel ${g(klein)} verder.`];
}

/** De korte uitleg bij "Kun je dit al?" → Nee: een voorbeeld met het antwoord. */
async function voorbeeldSom(l: Lesgids, a: number, b: number) {
  somBoven(l, a, b);
  await rekenUitleg(l, a, b);
  await l.wacht(300);
  somBoven(l, a, b, a + b);
  await l.zeg(`${plus(a, b)} = ${g(a + b)}.`);
  await l.verder();
  zet(l, { rek: null });
  l.som(null);
}

/* =====================================================================
   De bakkerij (Plussommen 16054)
   ===================================================================== */

const hier = (n: number) => (n === 1 ? `Hier is er ${g(1)}.` : `Hier zijn er ${g(n)}.`);
const erbij = (n: number) => (n === 1 ? `Daar komt er ${g(1)} bij.` : `Daar komen er ${g(n)} bij.`);

/** (A) Een verhaaltje met een tekening en de som bovenaan; kies het antwoord uit 4. */
function verhaal(groepen: Groep[], a: number, b: number, keuzes: number[], zinnen: string[]): Vraag {
  return (l, st) => {
    const id = `v${++st.nr}`;
    const s = a + b;
    return squlaVraag<number>(l, {
      toon: () => {
        if (toon(l, st, { soort: "bakkerij", id, groepen })) somBoven(l, a, b);
      },
      vraag: zinnen,
      antwoord: () => kiesGetal(l, keuzes),
      isGoed: (x) => x === s,
      noem: (x) => g(x),
      goed: async () => {
        somBoven(l, a, b, s);
        goedBeeld(l, st);
        await l.zeg(`Ja! ${plus(a, b)} = ${g(s)}.`);
        await l.wacht(400);
      },
      fout: () => foutBeeld(l, st),
      samen: async () => {
        if (groepen.length === 2) {
          zet(l, { licht: [0] });
          await l.zeg(hier(a));
          zet(l, { licht: [1] });
          await l.zeg(erbij(b));
          zet(l, { licht: [] });
        }
        await rekenUitleg(l, a, b);
      },
      tip: rekenTip(a, b),
      testAntwoord: s,
    });
  };
}

/** (B) Een verhaaltje met een tekening; welke som hoort erbij? Kies uit 4 sommen. */
function welkeSom(groepen: Groep[], a: number, b: number, opties: string[], zinnen: string[]): Vraag {
  return (l, st) => {
    const id = `v${++st.nr}`;
    const goed = somTekst(a, b);
    return squlaVraag<string>(l, {
      toon: () => {
        toon(l, st, { soort: "bakkerij", id, groepen });
      },
      vraag: zinnen,
      antwoord: async () => String(await l.kies(opties, { weetniet: false, direct: true })),
      isGoed: (x) => x === goed,
      noem: (x) => x,
      goed: async () => {
        somBoven(l, a, b, a + b);
        goedBeeld(l, st);
        await l.zeg(`Ja! Er komen er bij, dus het is een plussom.`, `${plus(a, b)} = ${g(a + b)}.`);
        await l.wacht(400);
      },
      fout: () => foutBeeld(l, st),
      samen: async () => {
        zet(l, { licht: [0] });
        await l.zeg(`Eerst waren er ${g(a)}.`);
        zet(l, { licht: [1] });
        await l.zeg(erbij(b), "Er komen er bij: dan is het een plussom.");
        zet(l, { licht: [] });
        await l.zeg(`Zoek de plussom met ${g(a)} en ${g(b)}.`);
      },
      tip: [`Zoek een plussom met ${g(a)} en ${g(b)}.`],
      testAntwoord: goed,
    });
  };
}

/** (C) Het discospel: de som bovenaan, tik op het goede kaartje (uit 3). */
function discoSom(a: number, b: number, kaarten: number[]): Vraag {
  return (l, st) => {
    const id = `v${++st.nr}`;
    const s = a + b;
    const beeld: PlusBeeld = { soort: "disco", id, vorm: "kaartje", kaarten: kaarten.map((n) => ({ id: `c${n}`, tekst: [String(n)], aria: String(n) })) };
    return squlaVraag<number>(l, {
      toon: () => {
        if (toon(l, st, beeld)) somBoven(l, a, b);
      },
      vraag: [`Welk kaartje hoort bij ${plus(a, b)}?`],
      antwoord: async () => Number((await tik(l)).slice(1)),
      isGoed: (x) => x === s,
      noem: (x) => g(x),
      goed: async () => {
        somBoven(l, a, b, s);
        goedBeeld(l, st, { goedIds: [`c${s}`] });
        await l.zeg(`Ja! ${plus(a, b)} = ${g(s)}.`);
        await l.wacht(600);
      },
      fout: () => foutBeeld(l, st),
      samen: async () => {
        await rekenUitleg(l, a, b);
        await l.verder();
        zet(l, { rek: null });
      },
      tip: rekenTip(a, b),
      testAntwoord: `c${s}`,
    });
  };
}

/** (D) Verbinden: 3 sommen links, 3 antwoorden rechts. Pas als alle lijnen er zijn, wordt nagekeken. */
function verbind(sommen: [number, number][], antwoorden: number[]): Vraag {
  return (l, st) => {
    const id = `v${++st.nr}`;
    const links: Kaart[] = sommen.map(([x, y], i) => ({ id: `s${i}`, tekst: [`${x} + ${y}`], aria: `${x} plus ${y}` }));
    const rechts: Kaart[] = antwoorden.map((n, i) => ({ id: `a${i}`, tekst: [String(n)], aria: String(n) }));
    const juist = (sid: string) => {
      const [x, y] = sommen[Number(sid.slice(1))];
      return `a${antwoorden.indexOf(x + y)}`;
    };
    const vast = new Map<string, string>();
    let laatsteFout = 0;
    const lijnenVan = (p: Map<string, string>, stand?: (van: string) => Lijn["stand"]): Lijn[] =>
      [...p].map(([van, naar]) => ({ van, naar, stand: stand ? stand(van) : vast.has(van) ? "goed" : "nu" }));
    const eersteFout = (p: Map<string, string>) => [...p].find(([van, naar]) => juist(van) !== naar);
    return squlaVraag<Map<string, string>>(l, {
      toon: () => {
        toon(l, st, { soort: "verbind", id, links, rechts });
      },
      vraag: ["Welk antwoord hoort bij welke som?", "Tik op een som en dan op het antwoord."],
      antwoord: async () => {
        const paren = new Map(vast);
        let selS: string | null = null;
        let selA: string | null = null;
        while (paren.size < sommen.length) {
          if (selS) zetTestAntwoord(juist(selS));
          else zetTestAntwoord(links.find((k) => !paren.has(k.id))?.id ?? null);
          zet(l, { gekozen: [selS, selA].filter((x): x is string => Boolean(x)), lijnen: lijnenVan(paren) });
          const t = await tik(l);
          if (t.startsWith("s")) {
            if (vast.has(t)) continue;
            paren.delete(t);
            selS = t;
          } else {
            if ([...vast.values()].includes(t)) continue;
            for (const [k, v] of paren) if (v === t) paren.delete(k);
            selA = t;
          }
          if (selS && selA) {
            paren.set(selS, selA);
            selS = null;
            selA = null;
          }
        }
        zet(l, { gekozen: [], lijnen: lijnenVan(paren) });
        await l.wacht(300);
        return paren;
      },
      isGoed: (p) => !eersteFout(p),
      noem: (p) => {
        const [van, naar] = eersteFout(p) ?? ["s0", "a0"];
        const [x, y] = sommen[Number(van.slice(1))];
        return `${plus(x, y)} = ${g(antwoorden[Number(naar.slice(1))])}`;
      },
      goed: async (p) => {
        goedBeeld(l, st, { lijnen: lijnenVan(p, () => "goed") });
        await l.zeg("Ja! Elke som hoort bij het goede antwoord.");
        await l.wacht(600);
      },
      fout: (p) => {
        foutBeeld(l, st);
        const f = eersteFout(p);
        if (f) laatsteFout = Number(f[0].slice(1));
        for (const [van, naar] of p) if (juist(van) === naar) vast.set(van, naar);
        zet(l, { lijnen: lijnenVan(p, (van) => (juist(van) === p.get(van) ? "goed" : "fout")) });
      },
      samen: async () => {
        zet(l, { lijnen: lijnenVan(vast) });
        const [x, y] = sommen[laatsteFout];
        await l.zeg(`Kijk naar ${plus(x, y)}.`);
        await rekenUitleg(l, x, y);
        await l.verder();
        zet(l, { rek: null });
        await l.zeg("Verbind de sommen die nog over zijn.");
      },
      tip: ["Reken de som eerst uit.", "Zoek dan het antwoord."],
      testAntwoord: "s0",
    });
  };
}

/** (E) Een tekening: één groepje met het aantal eronder, en een paar losse. Welke som past erbij? Tik op een somkaartje (uit 3). */
function somBijPlaatje(groepen: Groep[], opties: [number, number][], goed: number, wat: string): Vraag {
  return (l, st) => {
    const id = `v${++st.nr}`;
    const sommen: Kaart[] = opties.map(([x, y], i) => ({ id: `s${i}`, tekst: [somTekst(x, y)], aria: somAria(x, y) }));
    const metGetal = groepen.findIndex((gr) => gr.label);
    const los = metGetal === 0 ? 1 : 0;
    const [ga, gb] = opties[goed];
    return squlaVraag<number>(l, {
      toon: () => {
        toon(l, st, { soort: "bakkerij", id, groepen }, { sommen });
      },
      vraag: [`Hoeveel ${wat} zijn het samen?`, "Welke som past erbij?"],
      antwoord: async () => Number((await tik(l)).slice(1)),
      isGoed: (i) => i === goed,
      noem: (i) => `${plus(opties[i][0], opties[i][1])} = ${g(opties[i][0] + opties[i][1])}`,
      goed: async () => {
        goedBeeld(l, st, { goedIds: [`s${goed}`] });
        await l.zeg(`Ja! ${plus(ga, gb)} = ${g(ga + gb)}.`);
        await l.wacht(500);
      },
      fout: () => foutBeeld(l, st),
      samen: async () => {
        zet(l, { licht: [metGetal] });
        await l.zeg(`Hier staan er ${g(groepen[metGetal].n)}.`, "Dat getal staat eronder.");
        zet(l, { licht: [los] });
        await l.zeg("Hier staan er nog een paar los.", "Tel ze maar.");
        zet(l, { licht: [] });
        await l.zeg("Kijk welke som bij allebei de groepjes past.");
      },
      tip: [`Tel de losse ${wat} nog eens.`, "Welke som past erbij?"],
      testAntwoord: `s${goed}`,
    });
  };
}

/** (F) Een tekening met twee groepjes; kies de twee sommen die passen (omdraaien). */
function tweeSommen(groepen: Groep[], opties: [number, number][], goed: [number, number], wat: string): Vraag {
  return (l, st) => {
    const id = `v${++st.nr}`;
    const sommen: Kaart[] = opties.map(([x, y], i) => ({ id: `s${i}`, tekst: [somTekst(x, y)], aria: somAria(x, y) }));
    const goedIds = goed.map((i) => `s${i}`);
    const [a, b] = opties[goed[0]];
    return squlaVraag<[string, string]>(l, {
      toon: () => {
        toon(l, st, { soort: "bakkerij", id, groepen }, { sommen });
      },
      vraag: [`Tel de ${wat} bij elkaar op.`, "Welke twee sommen passen erbij?", "Tik op twee sommen."],
      antwoord: () => kiesTwee(l, goedIds),
      isGoed: (x) => x.every((i) => goedIds.includes(i)),
      noem: (x) => {
        const fout = x.find((i) => !goedIds.includes(i)) ?? x[0];
        const [p, q] = opties[Number(fout.slice(1))];
        return `${plus(p, q)} = ${g(p + q)}`;
      },
      goed: async () => {
        goedBeeld(l, st, { gekozen: [], goedIds });
        await l.zeg(`Ja! ${plus(a, b)} = ${g(a + b)}.`, `En ${plus(b, a)} = ${g(a + b)}.`);
        await l.wacht(500);
      },
      fout: () => {
        foutBeeld(l, st);
        zet(l, { gekozen: [] });
      },
      samen: async () => {
        zet(l, { licht: [0] });
        await l.zeg(hier(groepen[0].n));
        zet(l, { licht: [1] });
        await l.zeg(hier(groepen[1].n));
        zet(l, { licht: [] });
        await l.zeg("Een plussom kun je omdraaien.", "Het antwoord blijft dan hetzelfde.", `Zoek twee sommen met ${g(a)} en ${g(b)}.`);
      },
      tip: [`Zoek de sommen met ${g(a)} en ${g(b)}.`],
      testAntwoord: goedIds[0],
    });
  };
}

/** (G) Zelf het antwoord typen (de som bovenaan; als versiering een taart). */
function typSom(a: number, b: number, beeldVan: (id: string) => PlusBeeld = (id) => ({ soort: "etalage", id })): Vraag {
  return (l, st) => {
    const id = `v${++st.nr}`;
    const s = a + b;
    return squlaVraag<number>(l, {
      toon: () => {
        if (toon(l, st, beeldVan(id))) somBoven(l, a, b);
      },
      vraag: ["Reken uit.", `Hoeveel is ${plus(a, b)}?`],
      antwoord: () => typGetal(l, st, ["Typ het getal dat jij denkt."]),
      isGoed: (x) => x === s,
      noem: (x) => g(x),
      goed: async () => {
        somBoven(l, a, b, s);
        goedBeeld(l, st);
        await l.zeg(`Ja! ${plus(a, b)} = ${g(s)}.`);
        await l.wacht(400);
      },
      fout: () => foutBeeld(l, st),
      samen: () => rekenUitleg(l, a, b),
      tip: rekenTip(a, b),
      testAntwoord: s,
    });
  };
}

/* Korte schrijfwijzen voor groepjes. */
const bord = (n: number, ding: Groep["ding"], label = false): Groep => ({ n, ding, bak: "bord", label });
const plaat = (n: number, ding: Groep["ding"], label = false): Groep => ({ n, ding, bak: "plaat", label });
const mand = (n: number, ding: Groep["ding"], label = false): Groep => ({ n, ding, bak: "mand", label });
const zak = (n: number, ding: Groep["ding"], label = false): Groep => ({ n, ding, bak: "zak", label });

const BAKKERIJ_WELKOM = ["Hoi!", "Kijk, mijn bakkerij.", "Ik bak broodjes, koekjes en taartjes.", "Jij rekent uit hoeveel het samen is."];

function bakkerijUitleg(groepen: Groep[], a: number, b: number, wat: string) {
  return async (l: Lesgids, st: Stand) => {
    toon(l, st, { soort: "bakkerij", id: "uitleg", groepen });
    somBoven(l, a, b);
    zet(l, { licht: [0] });
    await l.zeg(`Hier liggen ${g(a)} ${wat}.`);
    zet(l, { licht: [1] });
    await l.zeg(`Ik leg er ${g(b)} bij.`, `Erbij is plus: ${plus(a, b)}.`);
    zet(l, { licht: [] });
    await voorbeeldSom(l, a, b);
  };
}

/* =====================================================================
   De disco (Dansende sommen 15684): samen 10
   ===================================================================== */

/** Level 1 en 4: drie kaartjes met twee getallen; tik op het kaartje dat samen 10 is. */
function dansKaartje(paren: [number, number][]): Vraag {
  return (l, st) => {
    const id = `v${++st.nr}`;
    const kaarten: Kaart[] = paren.map(([x, y], i) => ({ id: `k${i}`, tekst: [String(x), String(y)], aria: `${x} en ${y}` }));
    const goedIdx = paren.findIndex(([x, y]) => x + y === 10);
    let gekozen = -1;
    return squlaVraag<number>(l, {
      toon: () => {
        toon(l, st, { soort: "disco", id, vorm: "kaartje", kaarten });
      },
      vraag: [`Welk kaartje is samen ${g(10)}?`],
      antwoord: async () => Number((await tik(l)).slice(1)),
      isGoed: (i) => i === goedIdx,
      noem: (i) => `${g(paren[i][0])} en ${g(paren[i][1])}`,
      goed: async () => {
        goedBeeld(l, st, { goedIds: [`k${goedIdx}`] });
        await l.zeg(`Ja! ${g(paren[goedIdx][0])} en ${g(paren[goedIdx][1])} is samen ${g(10)}.`);
        await l.wacht(900);
      },
      fout: (i) => {
        gekozen = i;
        foutBeeld(l, st);
      },
      samen: async () => {
        const [x, y] = paren[gekozen >= 0 ? gekozen : (goedIdx + 1) % paren.length];
        const s = x + y;
        zet(l, { rek: { rijen: s > 10 ? 2 : 1, a: x, b: y } });
        await l.zeg(`Kijk naar ${g(x)} en ${g(y)}.`, `${o(x)} oranje en ${bl(y)} blauwe stippen.`);
        if (s < 10) await l.zeg(10 - s === 1 ? `Er blijft ${g(1)} plekje leeg.` : `Er blijven ${g(10 - s)} plekjes leeg.`, `Dat is nog geen ${g(10)}.`);
        else await l.zeg("De rij is vol, en er zijn nog stippen over.", `Dat is meer dan ${g(10)}.`);
        await l.zeg(`Bij ${g(10)} is de rij precies vol.`);
        await l.verder();
        zet(l, { rek: null });
        await l.zeg("Zoek het kaartje waarbij de rij precies vol is.");
      },
      tip: ["Tel de twee getallen op elk kaartje samen.", `Welk kaartje is samen ${g(10)}?`],
      testAntwoord: `k${goedIdx}`,
    });
  };
}

/** Level 2 en 3: vier platen met een getal; tik op de twee getallen die samen 10 zijn. */
function dansPlaten(getallen: number[]): Vraag {
  return (l, st) => {
    const id = `v${++st.nr}`;
    const kaarten: Kaart[] = getallen.map((n, i) => ({ id: `p${i}`, tekst: [String(n)], aria: String(n) }));
    let paar: [number, number] = [0, 1];
    for (let i = 0; i < getallen.length; i++) for (let j = i + 1; j < getallen.length; j++) if (getallen[i] + getallen[j] === 10) paar = [i, j];
    const goedIds = paar.map((i) => `p${i}`);
    const anker = Math.min(getallen[paar[0]], getallen[paar[1]]);
    const waarden = (x: [string, string]) => x.map((i) => getallen[Number(i.slice(1))]);
    return squlaVraag<[string, string]>(l, {
      toon: () => {
        toon(l, st, { soort: "disco", id, vorm: "plaat", kaarten });
      },
      vraag: [`Tik op twee getallen die samen ${g(10)} zijn.`],
      antwoord: () => kiesTwee(l, goedIds),
      isGoed: (x) => waarden(x)[0] + waarden(x)[1] === 10,
      noem: (x) => `${g(waarden(x)[0])} en ${g(waarden(x)[1])}`,
      goed: async () => {
        goedBeeld(l, st, { gekozen: [], goedIds });
        await l.zeg(`Ja! ${g(getallen[paar[0]])} en ${g(getallen[paar[1]])} is samen ${g(10)}.`);
        await l.wacht(900);
      },
      fout: () => {
        foutBeeld(l, st);
        zet(l, { gekozen: [] });
      },
      samen: async () => {
        zet(l, { rek: { rijen: 1, a: anker, b: 0 } });
        if (anker === 0) await l.zeg(`Kijk naar de ${g(0)}.`, "Bij nul zijn er nog geen stippen.", "De hele rij is nog leeg.");
        else await l.zeg(`Kijk naar de ${g(anker)}.`, `Ik zet ${o(anker)} stippen in de rij.`);
        await l.zeg("Hoeveel plekjes zijn er nog leeg?", "Tel ze maar.");
        await l.verder();
        zet(l, { rek: null });
        await l.zeg("Zoek het getal dat de rij vol maakt.");
      },
      tip: [`Welk getal maakt samen met ${g(anker)} precies ${g(10)}?`],
      testAntwoord: goedIds[0],
    });
  };
}

const DANS_WELKOM = ["Hoi!", "Welkom in de disco.", "Hier dansen de getallen.", `We zoeken getallen die samen ${g(10)} zijn.`];

function dansUitleg(kaartjes: boolean) {
  return async (l: Lesgids) => {
    zet(l, { rek: { rijen: 1, a: 7, b: 3, bZicht: 0 } });
    await l.zeg("Kijk, een rij van tien plekjes.", `Er staan ${o(7)} oranje stippen in.`, `Er zijn nog ${g(3)} plekjes leeg.`);
    zet(l, { rek: { rijen: 1, a: 7, b: 3 } });
    await l.wacht(700);
    await l.zeg(`${g(7)} en ${g(3)} is samen ${g(10)}.`, "Nu is de rij precies vol.");
    await l.verder();
    zet(l, { rek: null });
    await l.zeg(kaartjes ? `Zoek steeds het kaartje dat samen ${g(10)} is.` : `Zoek steeds twee getallen die samen ${g(10)} zijn.`);
  };
}

/* =====================================================================
   De bus (Bussommen 1 en 2)
   ===================================================================== */

function busZinnen(a: number, b: number): string[] {
  return [
    a === 1 ? `Er zit ${g(1)} kind in de bus.` : `Er zitten ${g(a)} kinderen in de bus.`,
    b === 1 ? `Bij de halte stapt er ${g(1)} kind in.` : `Bij de halte stappen er ${g(b)} kinderen in.`,
    "Hoeveel kinderen zitten er nu in de bus?",
  ];
}

/** Bliepo kijkt in de bus en telt samen verder met de kinderen die instappen (het laatste telt het kind). */
async function busSamen(l: Lesgids, a: number, b: number, helemaal = false) {
  somBoven(l, a, b);
  if (b >= 10) {
    await rekenUitleg(l, a, b);
    return;
  }
  zet(l, { busLicht: true });
  if (a >= 10) await l.zeg(`Boven zitten er ${g(10)}.`, a === 11 ? `Beneden zit er nog ${g(1)}.` : `Beneden zitten er nog ${g(a - 10)}.`, `Samen zijn dat ${g(a)} kinderen.`);
  else await l.zeg(a === 1 ? `In de bus zit ${g(1)} kind.` : `In de bus zitten ${g(a)} kinderen.`);
  zet(l, { busLos: true });
  await l.zeg(b === 1 ? `Bij de deur staat ${g(1)} kind.` : `Bij de deur staan ${g(b)} kinderen.`, `We tellen verder vanaf ${g(a)}.`);
  const tot = helemaal ? b : b - 1;
  for (let i = 1; i <= tot; i++) {
    zet(l, { busTel: i });
    await l.zeg(`${g(a + i)}.`);
  }
  if (!helemaal) await l.zeg(b === 1 ? `Eén meer dan ${g(a)}: hoeveel is dat?` : "Tel jij de laatste?");
}

function busVraag(a: number, b: number, alsGetal: boolean): Vraag {
  return (l, st) => {
    const id = `v${++st.nr}`;
    const s = a + b;
    return squlaVraag<number>(l, {
      toon: () => {
        toon(l, st, { soort: "bus", id, inBus: a, instap: b, alsGetal });
      },
      vraag: busZinnen(a, b),
      antwoord: () => typGetal(l, st, ["Typ hoeveel kinderen er nu in de bus zitten."]),
      isGoed: (x) => x === s,
      noem: (x) => g(x),
      goed: async () => {
        somBoven(l, a, b, s);
        goedBeeld(l, st);
        await l.zeg(`Ja! ${plus(a, b)} = ${g(s)}.`, `Er zitten nu ${g(s)} kinderen in de bus.`);
        await l.wacht(400);
      },
      fout: () => foutBeeld(l, st),
      samen: () => busSamen(l, a, b),
      tip: b >= 10 ? rekenTip(a, b) : [`Begin bij ${g(a)}.`, b === 1 ? "Tel het kind dat instapt erbij." : "Tel de kinderen die instappen erbij."],
      testAntwoord: s,
    });
  };
}

const BUS_WELKOM = ["Hoi!", "Kijk, daar komt de bus.", "Er zitten al kinderen in.", "Bij de halte stappen er kinderen in.", "Jij rekent uit hoeveel kinderen er dan in de bus zitten."];

function busUitleg(a: number, b: number, alsGetal: boolean) {
  return async (l: Lesgids, st: Stand) => {
    toon(l, st, { soort: "bus", id: "uitleg", inBus: a, instap: b, alsGetal });
    await l.zeg(...busZinnen(a, b).slice(0, 2));
    await busSamen(l, a, b, true);
    somBoven(l, a, b, a + b);
    await l.zeg(`Nu zitten er ${g(a + b)} kinderen in de bus.`, `${plus(a, b)} = ${g(a + b)}.`);
    await l.verder();
    l.som(null);
  };
}

/* =====================================================================
   Kale sommen (7274)
   ===================================================================== */

const KAAL_WELKOM = ["Hoi!", "We rekenen plussommen uit.", "Er staat alleen de som, zonder plaatjes.", "Plussommen uitrekenen heet ook optellen."];

function kaalUitleg(a: number, b: number, level: number) {
  return async (l: Lesgids, st: Stand) => {
    toon(l, st, { soort: "kaal", id: "uitleg", level });
    await voorbeeldSom(l, a, b);
  };
}

/* =====================================================================
   Een hele les
   ===================================================================== */

type Les = {
  id: string;
  titel: string;
  oefening: string;
  level: number;
  stijl: Stijl;
  kaart: ComponentType;
  welkom: string[];
  /** Wat er in beeld staat tijdens het welkom. */
  begin: PlusBeeld | null;
  uitleg: (l: Lesgids, st: Stand) => Promise<void>;
  vragen: Vraag[];
  eind: string;
};

function les(t: Les): Lesdraaiboek {
  const boek: Lesdraaiboek = {
    id: t.id,
    titel: t.titel,
    synthesis: `Squla groep 3 · Plussommen · ${t.oefening} · level ${t.level} (alleen leerdoel)`,
    indeling: "synthesis",
    browserstem: true,
    kaarttekening: t.kaart,
    async speel(l) {
      const st: Stand = { stijl: t.stijl, huidig: t.begin?.id ?? "", nr: 0, goed: 0, fout: 0, typUitgelegd: false };
      l.vlak<PlusProps>(SqulaPlusVlak, { stijl: t.stijl, beeld: t.begin });
      if (t.begin) speelLesgeluid("verschijn");
      await squlaBegin(l, { welkom: t.welkom, uitleg: () => t.uitleg(l, st) });
      let fouten = 0;
      for (const v of t.vragen) if (!(await v(l, st))) fouten++;
      l.som(null);
      await squlaEind(l, fouten, t.eind);
    },
  };
  if (t.stijl === "nacht") boek.nacht = true;
  return boek;
}

/* ---------- Plussommen in de bakkerij ---------- */

const bakkerij1 = les({
  id: "squla-plus-bakkerij-1",
  titel: "Plussommen in de bakkerij",
  oefening: "Plussommen",
  level: 1,
  stijl: "plat",
  kaart: KaartBakkerij,
  welkom: BAKKERIJ_WELKOM,
  begin: { soort: "bakkerij", id: "begin", groepen: [bord(3, "broodje"), bord(2, "broodje")] },
  uitleg: bakkerijUitleg([bord(3, "broodje"), bord(2, "broodje")], 3, 2, "broodjes"),
  /* Level 1: tot 10. Zoals Squla: verhaaltjes, welke som, disco, verbinden, verhaaltje; daarna nog een ronde. */
  vragen: [
    verhaal([bord(1, "taart"), bord(4, "taart")], 1, 4, [4, 5, 6, 1], [`Op het ene bord ligt ${g(1)} taartje.`, `Op het andere bord liggen er ${g(4)}.`, "Hoeveel taartjes zijn het samen?"]),
    verhaal([plaat(5, "broodje"), plaat(2, "bruinbrood")], 5, 2, [6, 7, 8, 3], [`Hier liggen ${g(5)} witte broodjes.`, `Daar liggen ${g(2)} bruine broodjes.`, "Hoeveel broodjes zijn het samen?"]),
    verhaal([bord(4, "cupcake"), bord(5, "cupcake")], 4, 5, [8, 9, 10, 1], [`Er staan ${g(4)} cupcakes klaar.`, `Ik bak er nog ${g(5)} bij.`, "Hoeveel cupcakes zijn het samen?"]),
    verhaal([mand(2, "krentenbol", true), mand(6, "krentenbol", true)], 2, 6, [7, 8, 4, 9], [`In de ene mand zitten ${g(2)} krentenbollen.`, `In de andere mand zitten er ${g(6)}.`, "Hoeveel krentenbollen zijn het samen?"]),
    welkeSom([plaat(3, "koekje"), bord(7, "koekje")], 3, 7, ["7 − 3 = 4", "3 + 7 = 10", "3 + 3 = 6", "7 + 7 = 14"], [`Er liggen nog maar ${g(3)} koekjes.`, `Ik bak er ${g(7)} bij.`, "Welke som hoort erbij?"]),
    discoSom(5, 3, [9, 7, 8]),
    discoSom(6, 4, [10, 8, 9]),
    verbind([[3, 4], [5, 3], [2, 7]], [9, 7, 8]),
    verhaal([zak(4, "donut"), zak(4, "donut")], 4, 4, [4, 8, 7, 0], [`In elke zak zitten ${g(4)} donuts.`, "Hoeveel donuts zijn het bij elkaar?"]),
    verhaal([bord(2, "croissant"), bord(5, "croissant")], 2, 5, [6, 7, 8, 2], [`Ik heb ${g(2)} croissants gebakken.`, `Daarna bak ik er nog ${g(5)}.`, "Hoeveel croissants zijn het samen?"]),
    verhaal([bord(3, "broodje"), bord(6, "broodje")], 3, 6, [8, 9, 10, 3], [`Op dit bord liggen ${g(3)} broodjes.`, `Op dat bord liggen er ${g(6)}.`, "Hoeveel broodjes zijn het samen?"]),
    welkeSom([bord(4, "taart"), bord(5, "taart")], 4, 5, ["5 − 4 = 1", "4 + 5 = 9", "4 + 4 = 8", "5 + 5 = 10"], [`Er staan ${g(4)} taartjes.`, `Ik zet er ${g(5)} bij.`, "Welke som hoort erbij?"]),
    discoSom(2, 6, [7, 9, 8]),
    verbind([[1, 6], [4, 2], [5, 4]], [9, 7, 6]),
    verhaal([plaat(7, "koekje"), bord(2, "koekje")], 7, 2, [8, 9, 10, 5], [`Ik heb ${g(7)} koekjes.`, `Er komen er ${g(2)} bij.`, "Hoeveel koekjes zijn het samen?"]),
    verhaal([zak(5, "krentenbol"), zak(5, "krentenbol")], 5, 5, [5, 10, 9, 0], [`In de ene zak zitten ${g(5)} krentenbollen.`, `In de andere zak ook ${g(5)}.`, "Hoeveel krentenbollen zijn het samen?"]),
  ],
  eind: "Je kunt plussommen maken tot tien.",
});

const bakkerij2 = les({
  id: "squla-plus-bakkerij-2",
  titel: "Plussommen in de bakkerij (moeilijker)",
  oefening: "Plussommen",
  level: 2,
  stijl: "plat",
  kaart: KaartBakkerij,
  welkom: BAKKERIJ_WELKOM,
  begin: { soort: "bakkerij", id: "begin", groepen: [plaat(12, "koekje"), bord(3, "koekje")] },
  uitleg: bakkerijUitleg([plaat(12, "koekje"), bord(3, "koekje")], 12, 3, "koekjes"),
  /* Level 2: tot 20, niet over het tiental (zoals Squla één kleine over het tiental in het verbinden). */
  vragen: [
    verhaal([plaat(10, "stokbrood"), bord(3, "stokbrood")], 10, 3, [13, 7, 15, 3], [`Er liggen ${g(10)} stokbroden.`, `Ik leg er ${g(3)} bij.`, "Hoeveel stokbroden zijn het samen?"]),
    verhaal([plaat(13, "krentenbol"), bord(4, "krentenbol")], 13, 4, [16, 17, 18, 13], [`Er liggen ${g(13)} krentenbollen.`, `Ik bak er ${g(4)} bij.`, "Hoeveel krentenbollen zijn het samen?"]),
    verhaal([plaat(14, "donut"), bord(1, "donut")], 14, 1, [13, 5, 17, 15], [`Hier liggen ${g(14)} donuts.`, `Daar ligt er nog ${g(1)}.`, "Hoeveel donuts zijn het samen?"]),
    verhaal([bord(6, "broodje"), plaat(12, "broodje")], 6, 12, [6, 17, 18, 19], [`Ik heb ${g(6)} broodjes.`, `Ik bak er ${g(12)} bij.`, "Hoeveel broodjes zijn het samen?"]),
    verhaal([bord(5, "koekje"), plaat(14, "koekje")], 5, 14, [9, 18, 19, 17], [`Er liggen ${g(5)} koekjes.`, `Er komen er ${g(14)} bij.`, "Hoeveel koekjes zijn het samen?"]),
    somBijPlaatje([plaat(12, "cupcake", true), bord(3, "cupcake")], [[12, 3], [13, 3], [12, 4]], 0, "cupcakes"),
    somBijPlaatje([bord(3, "croissant"), plaat(11, "croissant", true)], [[3, 12], [3, 11], [3, 13]], 1, "croissants"),
    discoSom(15, 3, [17, 18, 19]),
    discoSom(11, 6, [16, 17, 18]),
    verbind([[14, 2], [6, 5], [4, 13]], [17, 16, 11]),
    verhaal([plaat(11, "taart"), bord(7, "taart")], 11, 7, [18, 4, 17, 19], [`Op de plaat staan ${g(11)} taartjes.`, `Ik zet er ${g(7)} bij.`, "Hoeveel taartjes zijn het samen?"]),
    verhaal([plaat(16, "croissant"), bord(3, "croissant")], 16, 3, [19, 13, 18, 20], [`Er liggen ${g(16)} croissants.`, `Ik bak er ${g(3)} bij.`, "Hoeveel croissants zijn het samen?"]),
    somBijPlaatje([plaat(13, "donut", true), bord(2, "donut")], [[13, 3], [14, 2], [13, 2]], 2, "donuts"),
    discoSom(12, 6, [17, 18, 19]),
    verbind([[10, 5], [12, 4], [2, 17]], [19, 15, 16]),
    verhaal([bord(3, "broodje"), plaat(15, "broodje")], 3, 15, [12, 17, 18, 19], [`Ik heb ${g(3)} broodjes.`, `Er komen er ${g(15)} bij.`, "Hoeveel broodjes zijn het samen?"]),
  ],
  eind: "Je kunt plussommen maken tot twintig.",
});

const bakkerij3 = les({
  id: "squla-plus-bakkerij-3",
  titel: "Plussommen in de bakkerij (nog moeilijker)",
  oefening: "Plussommen",
  level: 3,
  stijl: "plat",
  kaart: KaartBakkerij,
  welkom: BAKKERIJ_WELKOM,
  begin: { soort: "bakkerij", id: "begin", groepen: [plaat(8, "cupcake"), bord(5, "cupcake")] },
  uitleg: bakkerijUitleg([plaat(8, "cupcake"), bord(5, "cupcake")], 8, 5, "cupcakes"),
  /* Level 3: tot 20 over het tiental, met dubbelsommen en één makkelijke onder de 10. */
  vragen: [
    verhaal([plaat(6, "koekje"), plaat(6, "koekje")], 6, 6, [11, 12, 13, 14], [`Er liggen ${g(6)} koekjes.`, `Ik bak er nog ${g(6)} bij.`, "Hoeveel koekjes zijn het samen?"]),
    verhaal([plaat(7, "croissant"), bord(6, "croissant")], 7, 6, [12, 13, 14, 15], [`Op de plaat liggen ${g(7)} croissants.`, `Er komen er nog ${g(6)} bij.`, "Hoeveel croissants zijn het samen?"]),
    verhaal([plaat(8, "broodje"), bord(4, "broodje")], 8, 4, [11, 12, 13, 14], [`Er liggen ${g(8)} broodjes.`, `Ik leg er ${g(4)} bij.`, "Hoeveel broodjes zijn het samen?"]),
    verhaal([bord(3, "donut"), bord(5, "donut")], 3, 5, [7, 8, 9, 10], [`Er liggen ${g(3)} donuts.`, `Ik bak er nog ${g(5)} bij.`, "Hoeveel donuts zijn het samen?"]),
    verhaal([bord(8, "taart"), bord(8, "taart")], 8, 8, [14, 16, 15, 8], [`Op het ene bord staan ${g(8)} taartjes.`, `Op het andere bord staan er ook ${g(8)}.`, "Hoeveel taartjes zijn het samen?"]),
    tweeSommen([plaat(6, "broodje"), plaat(9, "broodje")], [[6, 6], [6, 9], [9, 6], [9, 9]], [1, 2], "broodjes"),
    tweeSommen([plaat(8, "krentenbol", true), bord(3, "krentenbol")], [[3, 8], [3, 10], [8, 3], [10, 3]], [0, 2], "krentenbollen"),
    discoSom(7, 4, [10, 11, 12]),
    discoSom(9, 6, [14, 15, 16]),
    typSom(9, 9),
    verhaal([plaat(5, "cupcake"), plaat(7, "cupcake")], 5, 7, [11, 12, 13, 2], [`Er staan ${g(5)} cupcakes.`, `Ik bak er ${g(7)} bij.`, "Hoeveel cupcakes zijn het samen?"]),
    verhaal([plaat(7, "koekje"), plaat(7, "koekje")], 7, 7, [12, 14, 15, 16], [`Op de ene plaat liggen ${g(7)} koekjes.`, `Op de andere plaat ook ${g(7)}.`, "Hoeveel koekjes zijn het samen?"]),
    tweeSommen([bord(4, "donut"), plaat(7, "donut")], [[4, 4], [4, 7], [7, 7], [7, 4]], [1, 3], "donuts"),
    discoSom(8, 5, [12, 13, 14]),
    typSom(8, 6),
    verhaal([plaat(9, "croissant"), bord(4, "croissant")], 9, 4, [12, 13, 14, 15], [`Er liggen ${g(9)} croissants.`, `Ik bak er ${g(4)} bij.`, "Hoeveel croissants zijn het samen?"]),
  ],
  eind: "Je kunt plussommen maken over het tiental.",
});

/* ---------- Dansende sommen: samen 10 ---------- */

const dansen1 = les({
  id: "squla-plus-dansen-1",
  titel: "Samen 10 in de disco",
  oefening: "Dansende sommen",
  level: 1,
  stijl: "nacht",
  kaart: KaartDisco,
  welkom: DANS_WELKOM,
  begin: { soort: "disco", id: "begin", vorm: "kaartje", kaarten: [] },
  uitleg: dansUitleg(true),
  vragen: [
    [[7, 3], [5, 2], [6, 5]],
    [[4, 4], [9, 1], [3, 2]],
    [[6, 2], [2, 5], [4, 6]],
    [[5, 5], [3, 3], [8, 3]],
    [[1, 6], [2, 8], [7, 4]],
    [[3, 7], [4, 2], [9, 2]],
    [[5, 3], [6, 4], [1, 8]],
    [[2, 2], [7, 5], [1, 9]],
    [[8, 2], [5, 4], [3, 6]],
    [[4, 3], [6, 6], [7, 3]],
    [[9, 1], [2, 6], [5, 6]],
    [[3, 5], [4, 6], [8, 3]],
    [[2, 7], [5, 5], [6, 1]],
    [[1, 5], [3, 4], [2, 8]],
    [[6, 4], [7, 2], [5, 3]],
  ].map((p) => dansKaartje(p as [number, number][])),
  eind: `Je weet welke getallen samen ${g(10)} zijn.`,
});

const dansen2 = les({
  id: "squla-plus-dansen-2",
  titel: "Samen 10 in de disco (moeilijker)",
  oefening: "Dansende sommen",
  level: 2,
  stijl: "nacht",
  kaart: KaartDisco,
  welkom: DANS_WELKOM,
  begin: { soort: "disco", id: "begin", vorm: "plaat", kaarten: [] },
  uitleg: dansUitleg(false),
  vragen: [
    [3, 8, 7, 5],
    [9, 4, 1, 7],
    [2, 6, 9, 8],
    [5, 7, 2, 5],
    [0, 3, 10, 9],
    [6, 1, 4, 2],
    [7, 3, 5, 1],
    [10, 4, 0, 5],
    [2, 9, 1, 3],
    [8, 6, 2, 3],
    [4, 5, 7, 6],
    [5, 9, 5, 4],
    [3, 7, 9, 2],
    [1, 8, 6, 9],
    [0, 10, 2, 7],
  ].map(dansPlaten),
  eind: `Je weet welke getallen samen ${g(10)} zijn.`,
});

const dansen3 = les({
  id: "squla-plus-dansen-3",
  titel: "Samen 10 in de disco (nog moeilijker)",
  oefening: "Dansende sommen",
  level: 3,
  stijl: "nacht",
  kaart: KaartDisco,
  welkom: DANS_WELKOM,
  begin: { soort: "disco", id: "begin", vorm: "plaat", kaarten: [] },
  uitleg: dansUitleg(false),
  /* Zoals Squla level 3: vaak een tweede paar dat er net naast zit (samen 9 of 11). */
  vragen: [
    [9, 8, 1, 3],
    [4, 5, 6, 7],
    [3, 2, 8, 9],
    [7, 4, 3, 2],
    [10, 2, 9, 0],
    [6, 5, 3, 4],
    [1, 8, 9, 3],
    [5, 6, 5, 3],
    [7, 2, 3, 9],
    [8, 3, 2, 1],
    [3, 6, 4, 8],
    [9, 2, 0, 1],
    [6, 7, 3, 5],
    [2, 9, 8, 7],
    [0, 9, 10, 2],
  ].map(dansPlaten),
  eind: `Je weet welke getallen samen ${g(10)} zijn.`,
});

const dansen4 = les({
  id: "squla-plus-dansen-4",
  titel: "Samen 10 in de disco (heel moeilijk)",
  oefening: "Dansende sommen",
  level: 4,
  stijl: "nacht",
  kaart: KaartDisco,
  welkom: DANS_WELKOM,
  begin: { soort: "disco", id: "begin", vorm: "kaartje", kaarten: [] },
  uitleg: dansUitleg(true),
  /* Zoals Squla level 4: de andere kaartjes zitten dicht bij 10 (8, 9, 11, 12). */
  vragen: [
    [[6, 3], [2, 8], [7, 4]],
    [[4, 5], [8, 3], [3, 7]],
    [[9, 1], [7, 1], [5, 6]],
    [[6, 6], [4, 6], [3, 6]],
    [[5, 5], [9, 2], [7, 2]],
    [[8, 1], [4, 7], [7, 3]],
    [[1, 9], [5, 3], [8, 4]],
    [[3, 8], [6, 4], [2, 7]],
    [[4, 4], [9, 3], [8, 2]],
    [[7, 3], [6, 5], [5, 4]],
    [[2, 9], [3, 5], [4, 6]],
    [[5, 5], [4, 5], [6, 5]],
    [[9, 1], [8, 3], [7, 1]],
    [[6, 2], [2, 8], [9, 2]],
    [[3, 6], [7, 5], [3, 7]],
  ].map((p) => dansKaartje(p as [number, number][])),
  eind: `Je weet welke getallen samen ${g(10)} zijn.`,
});

/* ---------- Bussommen 1 (instappers als poppetjes) en 2 (instappers als getal) ---------- */

function busLes(nr: 1 | 2, level: number, titel: string, voorbeeld: [number, number], sommen: [number, number][]) {
  const alsGetal = nr === 2;
  return les({
    id: `squla-plus-bus${nr}-${level}`,
    titel,
    oefening: `Bussommen ${nr}`,
    level,
    stijl: "plat",
    kaart: KaartBus,
    welkom: BUS_WELKOM,
    begin: { soort: "bus", id: "begin", inBus: voorbeeld[0], instap: voorbeeld[1], alsGetal },
    uitleg: busUitleg(voorbeeld[0], voorbeeld[1], alsGetal),
    vragen: sommen.map(([a, b]) => busVraag(a, b, alsGetal)),
    eind: "Je kunt bussommen uitrekenen.",
  });
}

/* Level 1: uitkomst tot 10, meestal 1 tot 3 instappers (één keer 6). */
const bus1a = busLes(1, 1, "Bussommen", [3, 2], [
  [2, 1], [4, 2], [6, 1], [2, 3], [6, 2], [7, 1], [5, 3], [8, 2], [3, 6], [2, 2], [4, 3], [9, 1], [5, 2], [3, 1], [6, 3],
]);
/* Level 2: in de bus 10–17, 1–7 instappers, tot 20 zonder over het tiental. */
const bus1b = busLes(1, 2, "Bussommen (moeilijker)", [12, 3], [
  [12, 5], [11, 2], [14, 2], [13, 5], [16, 4], [15, 2], [10, 6], [12, 7], [11, 5], [14, 4], [17, 2], [13, 3], [10, 7], [15, 4], [16, 3],
]);
/* Level 3: beide getallen 5–9, altijd over het tiental (uitkomst 11–17). */
const bus1c = busLes(1, 3, "Bussommen (nog moeilijker)", [8, 4], [
  [8, 5], [7, 7], [9, 5], [6, 7], [8, 8], [5, 7], [9, 6], [7, 8], [6, 6], [9, 8], [5, 6], [8, 6], [6, 9], [7, 9], [5, 8],
]);
/* Bussommen 2, level 1: uitkomst tot 10, 1–8 instappers. */
const bus2a = busLes(2, 1, "Bussommen met een getal", [4, 2], [
  [4, 3], [1, 8], [3, 3], [6, 1], [5, 4], [2, 6], [7, 3], [4, 5], [1, 7], [6, 3], [2, 2], [8, 2], [3, 5], [5, 1], [2, 7],
]);
/* Level 2: in de bus 10–18, 1–8 instappers, uitkomst 14–20 zonder over het tiental. */
const bus2b = busLes(2, 2, "Bussommen met een getal (moeilijker)", [12, 3], [
  [12, 6], [10, 7], [13, 2], [15, 3], [17, 2], [11, 5], [14, 5], [10, 4], [16, 2], [12, 8], [18, 1], [13, 6], [11, 3], [15, 5], [14, 2],
]);
/* Level 3: in de bus 2–9, 4–9 instappers en één keer een instapper boven de 10; bijna altijd over het tiental. */
const bus2c = busLes(2, 3, "Bussommen met een getal (nog moeilijker)", [8, 4], [
  [6, 13], [7, 6], [8, 8], [3, 9], [9, 7], [6, 5], [4, 8], [8, 6], [9, 4], [5, 9], [7, 7], [2, 9], [8, 5], [9, 9], [7, 4],
]);

/* ---------- Kale sommen ---------- */

function kaalLes(level: number, titel: string, voorbeeld: [number, number], sommen: [number, number][]) {
  return les({
    id: `squla-plus-kaal-${level}`,
    titel,
    oefening: "Kale sommen",
    level,
    stijl: "holo",
    kaart: KaartKaal,
    welkom: KAAL_WELKOM,
    begin: { soort: "kaal", id: "begin", level },
    uitleg: kaalUitleg(voorbeeld[0], voorbeeld[1], level),
    vragen: sommen.map(([a, b]) => typSom(a, b, (id) => ({ soort: "kaal", id, level }))),
    eind: "Je kunt plussommen uitrekenen.",
  });
}

/* Level 1: beide getallen 1–6, uitkomst tot 10. */
const kaal1 = kaalLes(1, "Plussommen uitrekenen", [4, 3], [
  [3, 4], [6, 2], [1, 5], [3, 3], [4, 1], [5, 4], [2, 5], [6, 4], [1, 3], [4, 4], [3, 5], [2, 1], [5, 5], [6, 3], [3, 2],
]);
/* Level 2: 10–17 plus 1–9, tot 20 zonder over het tiental. */
const kaal2 = kaalLes(2, "Plussommen uitrekenen (moeilijker)", [13, 5], [
  [10, 7], [13, 6], [15, 3], [12, 4], [11, 8], [16, 4], [14, 2], [10, 5], [17, 1], [12, 7], [13, 3], [11, 6], [15, 5], [14, 4], [16, 2],
]);
/* Level 3: beide getallen 3–9, altijd over het tiental; veel dubbelsommen, bijna-dubbel en sommen met 9. */
const kaal3 = kaalLes(3, "Plussommen uitrekenen (nog moeilijker)", [7, 6], [
  [7, 7], [7, 8], [6, 5], [8, 9], [5, 7], [9, 3], [6, 6], [4, 7], [9, 6], [8, 5], [9, 4], [6, 8], [3, 9], [8, 8], [7, 9],
]);

export const LESSEN_SQULA_PLUSSOMMEN: Lesdraaiboek[] = [
  bakkerij1,
  bakkerij2,
  bakkerij3,
  dansen1,
  dansen2,
  dansen3,
  dansen4,
  bus1a,
  bus1b,
  bus1c,
  bus2a,
  bus2b,
  bus2c,
  kaal1,
  kaal2,
  kaal3,
];
