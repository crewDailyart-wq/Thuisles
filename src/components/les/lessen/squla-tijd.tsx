/**
 * Tijd naar Squla groep 3 Rekenen (30 oktober 2026, opdracht eigenaar): per
 * Squla-oefening per level één les, met eigen zinnen, eigen verhaaltjes en
 * eigen tekeningen (alleen het leerdoel en de opbouw zijn van Squla):
 *
 *   Dagen van de week  level 1, 2, 3   squla-tijd-dagen-1/2/3     weektrein (nacht)
 *   De kalender        level 1, 2      squla-tijd-kalender-1/2    vlak, vriendelijk
 *   Tijden             level 1, 2      squla-tijd-tijden-1/2      vlak, vriendelijk
 *
 * Elke les volgt de opbouw van het Squla-level: dezelfde soorten vragen in
 * dezelfde volgorde, en aan het eind komen er drie vragen terug (zoals Squla
 * de fout gemaakte vragen aan het eind herhaalt; zijn er minder dan drie fout,
 * dan vult de les aan met vaste vragen). Zo heeft elke les 15 opgaven.
 *
 * De hulp is overal die van squla-hulp.ts (zoals Synthesis): na één fout
 * "Wil je hulp, of nog een keer proberen?", dan samen uitzoeken, en na twee
 * keer fout even pauze. Geen "Weet ik niet".
 *
 * Groep 3 leest nog niet: Bliepo zegt elke vraag en noemt de keuzes als het
 * woorden zijn; kaartjes en knoppen lezen hun naam voor bij aanwijzen.
 */

import type { Lesdraaiboek, Lesgids } from "../soort";
import { squlaBegin, squlaEind, squlaVraag, zetTestAntwoord, type SqulaVraag } from "./squla-hulp";
import { SqulaTijdTrein, KaartWeektrein, dagNaam, kaartId, type DagKaart, type TreinProps } from "../vlakken/squla-tijd-trein";
import { SqulaTijdPlaatjes, KaartKalender, KaartTijden, type PDing, type PlaatjesProps } from "../vlakken/squla-tijd-plaatjes";
import { speelLesgeluid } from "@/lib/lesgeluiden";

/* ---------- gedeeld ---------- */

let teller = 0;
const volgend = () => ++teller;
const Hoofd = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
/** Een andere volgorde van de keuzes (bij een vraag die terugkomt). */
const schuif = <T,>(lijst: T[], keer: boolean) => (keer ? [...lijst.slice(1), lijst[0]] : lijst);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Opgave = (l: Lesgids, terug: boolean) => SqulaVraag<any>;

/**
 * Alle opgaven, en dan drie vragen die terugkomen: eerst de vragen die niet
 * meteen goed waren (zoals Squla), aangevuld met vaste vragen (`reserve`).
 * Geeft het aantal vragen dat niet meteen goed was.
 */
async function speelAlles(l: Lesgids, opgaven: Opgave[], reserve: number[]): Promise<number> {
  let fouten = 0;
  const mis: number[] = [];
  for (let i = 0; i < opgaven.length; i++) {
    if (!(await squlaVraag(l, opgaven[i](l, false)))) {
      fouten++;
      mis.push(i);
    }
  }
  const terug = [...mis, ...reserve.filter((i) => !mis.includes(i))].slice(0, 3);
  await l.zeg("Nu komen er nog drie vragen van net terug.");
  for (const i of terug) if (!(await squlaVraag(l, opgaven[i](l, true)))) fouten++;
  return fouten;
}

/* =====================================================================
   DAGEN VAN DE WEEK (weektrein, nacht)
   ===================================================================== */

const ALLE = [0, 1, 2, 3, 4, 5, 6];
const LEEG_TREIN = [null, null, null, null, null, null, null];
const naam = (d: number) => dagNaam(d);
const Naam = (d: number) => Hoofd(dagNaam(d));
const na = (d: number) => (d + 1) % 7;
const voor = (d: number) => (d + 6) % 7;

const LEEG_T: Omit<TreinProps, "nr"> = {
  trein: null,
  treinKlein: false,
  licht: [],
  vandaag: null,
  stappen: null,
  plaatje: null,
  vandaagKaart: null,
  kaarten: [],
  kaartenActief: false,
  uit: [],
  goed: [],
  fout: [],
  kaartLicht: [],
  orden: null,
};

const zetT = (l: Lesgids, p: Partial<TreinProps>) => l.pasVlakAan<TreinProps>(p);
let schudNr = 0;
let golfNr = 0;

/** Bliepo loopt langs de trein en zegt de dagen van `van` tot en met `tot`. */
async function zegDagen(l: Lesgids, van: number, tot: number, extra: Partial<TreinProps> = {}) {
  for (let i = van; i <= tot; i++) {
    zetT(l, { ...extra, licht: [i] });
    await l.zeg(`${Naam(i)}.`);
  }
}

type DagVraag = {
  beeld: Partial<TreinProps>;
  kaarten: number[][];
  goed: number[];
  vraag: string[];
  goedZin: string[];
  /** Wat er in beeld komt na een goed antwoord. */
  naGoed?: Partial<TreinProps>;
  samen: (l: Lesgids) => Promise<void>;
  /** Wat er na het samen uitzoeken in beeld blijft. */
  hulpBeeld: Partial<TreinProps>;
  tip: string[];
};

/** Een vraag met dagkaarten om aan te tikken. */
function dagVraag(l: Lesgids, o: DagVraag): SqulaVraag<string> {
  const nr = volgend();
  const goedId = kaartId(o.goed);
  const kaarten: DagKaart[] = o.kaarten.map((d) => ({ id: kaartId(d), dagen: d }));
  const uit: string[] = [];
  let naSamen = false;
  return {
    toon: () => zetT(l, { ...LEEG_T, nr, ...(naSamen ? o.hulpBeeld : o.beeld), kaarten, uit: [...uit] }),
    vraag: o.vraag,
    antwoord: async () => {
      zetT(l, { kaartenActief: true, fout: [] });
      const g = await l.wachtOpVlak<{ soort: string; id: string }>("kaart");
      zetT(l, { kaartenActief: false });
      return g.id;
    },
    isGoed: (x) => x === goedId,
    noem: (x) => Hoofd(x),
    goed: async () => {
      zetT(l, { goed: [goedId], kaartLicht: [], golf: { id: goedId, n: ++golfNr }, ...(o.naGoed ?? {}) });
      await l.zeg("Goed zo.", ...o.goedZin);
      await l.wacht(300);
    },
    fout: (x) => {
      if (!uit.includes(x)) uit.push(x);
      zetT(l, { fout: [x], schud: { id: x, n: ++schudNr } });
    },
    samen: async () => {
      zetT(l, { ...LEEG_T, kaarten, uit: [...uit] });
      await o.samen(l);
      naSamen = true;
    },
    tip: o.tip,
    testAntwoord: goedId,
  };
}

/** Een vraag met getallen als antwoord (knoppen bij Bliepo). */
function getalVraagT(l: Lesgids, o: { beeld: Partial<TreinProps>; opties: number[]; goed: number; vraag: string[]; goedZin: string[]; samen: (l: Lesgids) => Promise<void>; hulpBeeld: Partial<TreinProps>; tip: string[]; naGoed?: Partial<TreinProps> }): SqulaVraag<string> {
  const nr = volgend();
  let naSamen = false;
  return {
    toon: () => zetT(l, { ...LEEG_T, nr, ...(naSamen ? o.hulpBeeld : o.beeld) }),
    vraag: o.vraag,
    antwoord: async () => (await l.kies(o.opties.map(String), { weetniet: false, direct: true })) ?? "",
    isGoed: (x) => x === String(o.goed),
    noem: (x) => `{${x}:wit}`,
    goed: async () => {
      if (o.naGoed) zetT(l, o.naGoed);
      await l.zeg("Goed zo.", ...o.goedZin);
      await l.wacht(300);
    },
    samen: async () => {
      zetT(l, { ...LEEG_T });
      await o.samen(l);
      naSamen = true;
    },
    tip: o.tip,
    testAntwoord: String(o.goed),
  };
}

/* --- de soorten vragen --- */

function welkeNa(d: number, kaarten: number[]): Opgave {
  return (l, terug) => {
    const a = na(d);
    const vraag = [`Welke dag komt meteen na ${naam(d)}?`];
    return dagVraag(l, {
      beeld: { trein: [d, null] },
      kaarten: schuif(kaarten, terug).map((k) => [k]),
      goed: [a],
      vraag,
      goedZin: [`Na ${naam(d)} komt ${naam(a)}.`],
      naGoed: { trein: [d, a] },
      samen: async (l) => {
        zetT(l, { trein: ALLE });
        await l.zeg("Kijk naar de hele trein.", "Luister maar.");
        await zegDagen(l, 0, d);
        if (d === 6) {
          await l.zeg("Zondag is de laatste wagon.", "Daarna begint een nieuwe week.");
          zetT(l, { licht: [6, 0] });
          await l.zeg("Welke dag staat vooraan in de trein?");
        } else {
          zetT(l, { licht: [d] });
          await l.zeg(`Welke wagon staat achter ${naam(d)}?`);
        }
      },
      hulpBeeld: { trein: ALLE, licht: d === 6 ? [6, 0] : [d] },
      tip: d === 6 ? ["Na de laatste dag begint de week opnieuw.", ...vraag] : [`Kijk naar de wagon achter ${naam(d)}.`, ...vraag],
    });
  };
}

function welkeVoor(d: number, kaarten: number[]): Opgave {
  return (l, terug) => {
    const a = voor(d);
    const vraag = [`Welke dag komt vlak voor ${naam(d)}?`];
    return dagVraag(l, {
      beeld: { trein: [null, d] },
      kaarten: schuif(kaarten, terug).map((k) => [k]),
      goed: [a],
      vraag,
      goedZin: [`Vlak voor ${naam(d)} komt ${naam(a)}.`],
      naGoed: { trein: [a, d] },
      samen: async (l) => {
        zetT(l, { trein: ALLE });
        await l.zeg("Let op! Nu zoeken we de dag ervoor.", "Kijk naar de hele trein.");
        if (d === 0) {
          zetT(l, { licht: [0] });
          await l.zeg("Maandag is de eerste wagon.", "Daarvoor was de vorige week.");
          zetT(l, { licht: [6, 0] });
          await l.zeg("Die week eindigde met de laatste wagon.");
        } else {
          await l.zeg("Luister maar.");
          await zegDagen(l, 0, d);
          await l.zeg(`Welke wagon staat vlak voor ${naam(d)}?`);
        }
      },
      hulpBeeld: { trein: ALLE, licht: d === 0 ? [6, 0] : [d] },
      tip: d === 0 ? ["Voor maandag was de vorige week. Kijk naar het eind.", ...vraag] : [`Kijk naar de wagon vlak voor ${naam(d)}.`, ...vraag],
    });
  };
}

/* --- level 1: de opbouw van de week --- */

function eersteDag(): Opgave {
  return (l, terug) => {
    const vraag = ["Wat is de eerste dag van de week?"];
    return dagVraag(l, {
      beeld: { trein: LEEG_TREIN },
      kaarten: schuif([[2], [0], [6]], terug),
      goed: [0],
      vraag,
      goedZin: ["Maandag is de eerste dag van de week.", "Dan begint de school weer."],
      naGoed: { trein: [0, null, null, null, null, null, null] },
      samen: async (l) => {
        zetT(l, { trein: ALLE });
        await l.zeg("Kijk naar de hele trein.");
        zetT(l, { licht: [0] });
        await l.zeg("De eerste dag staat vooraan, vlak achter de locomotief.", "Op die dag begint de school weer.");
      },
      hulpBeeld: { trein: ALLE, licht: [0] },
      tip: ["Kijk naar de wagon vlak achter de locomotief.", ...vraag],
    });
  };
}

function laatsteDag(): Opgave {
  return (l, terug) => {
    const vraag = ["Wat is de laatste dag van de week?"];
    return dagVraag(l, {
      beeld: { trein: LEEG_TREIN },
      kaarten: schuif([[5], [1], [6]], terug),
      goed: [6],
      vraag,
      goedZin: ["Zondag is de laatste dag van de week.", "Daarna begint een nieuwe week."],
      naGoed: { trein: [null, null, null, null, null, null, 6] },
      samen: async (l) => {
        zetT(l, { trein: ALLE });
        await l.zeg("Kijk naar de hele trein.");
        zetT(l, { licht: [6] });
        await l.zeg("De laatste dag staat helemaal achteraan.", "Daarna begint een nieuwe week.");
      },
      hulpBeeld: { trein: ALLE, licht: [6] },
      tip: ["Kijk naar de wagon helemaal achteraan.", ...vraag],
    });
  };
}

function weekendHoeveel(): Opgave {
  return (l, terug) => {
    const vraag = ["In het weekend ga je niet naar school.", "Hoeveel dagen heeft het weekend?"];
    return getalVraagT(l, {
      beeld: { trein: LEEG_TREIN },
      opties: schuif([1, 2, 5], terug),
      goed: 2,
      vraag,
      goedZin: ["Het weekend heeft {2:wit} dagen."],
      naGoed: { trein: ALLE, licht: [5, 6] },
      samen: async (l) => {
        zetT(l, { trein: ALLE, licht: [0, 1, 2, 3, 4] });
        await l.zeg("Kijk naar de trein.", "Eerst ga je {5:wit} dagen naar school.");
        zetT(l, { licht: [5, 6] });
        await l.zeg("Daarna komt het weekend.", "Tel de wagons die nu oplichten.");
      },
      hulpBeeld: { trein: ALLE, licht: [5, 6] },
      tip: ["Tel de wagons achter vrijdag.", "Hoeveel dagen heeft het weekend?"],
    });
  };
}

function weekendWelke(): Opgave {
  return (l, terug) => {
    const vraag = ["Op welke dagen is het weekend?"];
    return dagVraag(l, {
      beeld: { trein: LEEG_TREIN },
      kaarten: schuif([[3, 4], [5, 6], [6, 0]], terug),
      goed: [5, 6],
      vraag,
      goedZin: ["Zaterdag en zondag zijn het weekend.", "Dan is er geen school."],
      naGoed: { trein: [null, null, null, null, null, 5, 6] },
      samen: async (l) => {
        zetT(l, { trein: ALLE, licht: [0, 1, 2, 3, 4] });
        await l.zeg("Kijk naar de trein.", "Op deze {5:wit} dagen ga je naar school.");
        zetT(l, { licht: [5, 6] });
        await l.zeg("Daarna komen {2:wit} dagen zonder school.", "Dat is het weekend.");
      },
      hulpBeeld: { trein: ALLE, licht: [5, 6] },
      tip: ["Het weekend zijn de laatste twee dagen van de week.", ...vraag],
    });
  };
}

function hoeveelWeek(): Opgave {
  return (l, terug) =>
    getalVraagT(l, {
      beeld: { plaatje: "vraag" },
      opties: schuif([6, 7, 8], terug),
      goed: 7,
      vraag: ["Hoeveel dagen heeft een week?"],
      goedZin: ["Een week heeft {7:wit} dagen.", "Van maandag tot en met zondag."],
      naGoed: { plaatje: null, trein: ALLE },
      samen: async (l) => {
        zetT(l, { trein: ALLE });
        await l.zeg("Elke wagon is een dag.", "Tel maar mee.");
        await zegDagen(l, 0, 6);
        zetT(l, { licht: [] });
        await l.zeg("Hoeveel wagons waren dat?");
      },
      hulpBeeld: { trein: ALLE },
      tip: ["Tel de wagons van maandag tot en met zondag.", "Hoeveel dagen heeft een week?"],
    });
}

async function welkomTrein(l: Lesgids, welkom: string[], uitleg: () => Promise<void>) {
  l.vlak<TreinProps>(SqulaTijdTrein, { ...LEEG_T, nr: volgend(), trein: ALLE, rit: 1 });
  speelLesgeluid("verschijn");
  await l.wacht(900);
  await squlaBegin(l, { welkom, uitleg });
}

const dagen1: Lesdraaiboek = {
  nacht: true,
  id: "squla-tijd-dagen-1",
  titel: "Dagen van de week",
  synthesis: "Squla groep 3 · Tijd · Dagen van de week · level 1 (alleen leerdoel)",
  indeling: "synthesis",
  browserstem: true,
  kaarttekening: KaartWeektrein,
  async speel(l) {
    await welkomTrein(l, ["Hoi!", "Kijk, daar komt de weektrein.", "Elke wagon is een dag van de week.", "We leren de volgorde van de dagen."], async () => {
      await l.zeg("Kijk mee.");
      await zegDagen(l, 0, 6);
      zetT(l, { licht: [0] });
      await l.zeg("De week begint met maandag.");
      zetT(l, { licht: [6] });
      await l.zeg("De week eindigt met zondag.");
      zetT(l, { licht: [5, 6] });
      await l.zeg("Zaterdag en zondag zijn het weekend.", "Dan is er geen school.");
      zetT(l, { licht: [] });
    });
    const opgaven: Opgave[] = [
      eersteDag(),
      laatsteDag(),
      weekendHoeveel(),
      weekendWelke(),
      welkeNa(0, [2, 1, 6]),
      welkeNa(3, [4, 2, 5]),
      welkeNa(2, [1, 6, 3]),
      welkeNa(5, [4, 6, 0]),
      welkeNa(6, [0, 5, 1]),
      hoeveelWeek(),
      welkeNa(1, [2, 0, 4]),
      welkeNa(4, [3, 5, 6]),
    ];
    const fouten = await speelAlles(l, opgaven, [0, 2, 8]);
    await squlaEind(l, fouten, "Je weet hoe de week is opgebouwd.");
  },
};

/* --- level 2: de dag erna en de dag ervoor --- */

const dagen2: Lesdraaiboek = {
  nacht: true,
  id: "squla-tijd-dagen-2",
  titel: "Dagen van de week (moeilijker)",
  synthesis: "Squla groep 3 · Tijd · Dagen van de week · level 2 (alleen leerdoel)",
  indeling: "synthesis",
  browserstem: true,
  kaarttekening: KaartWeektrein,
  async speel(l) {
    await welkomTrein(l, ["Hoi!", "Daar is de weektrein weer.", "We zoeken de dag erna en de dag ervoor."], async () => {
      zetT(l, { licht: [2] });
      await l.zeg("Kijk naar woensdag.");
      zetT(l, { licht: [2, 3] });
      await l.zeg("De dag erna staat erachter: donderdag.");
      zetT(l, { licht: [3] });
      await l.zeg("Kijk naar donderdag.");
      zetT(l, { licht: [2, 3] });
      await l.zeg("De dag ervoor staat ervoor: woensdag.");
      zetT(l, { licht: [6, 0] });
      await l.zeg("Na zondag begint de week weer met maandag.");
      zetT(l, { licht: [] });
    });
    const na6: Opgave[] = [welkeNa(1, [3, 2, 0, 5]), welkeNa(5, [6, 4, 0, 1]), welkeNa(3, [2, 5, 4, 0]), welkeNa(6, [5, 0, 1, 3]), welkeNa(0, [2, 6, 1, 4]), welkeNa(4, [6, 3, 5, 1])];
    const voor6: Opgave[] = [welkeVoor(2, [3, 1, 0, 4]), welkeVoor(5, [6, 4, 3, 2]), welkeVoor(4, [3, 5, 2, 6]), welkeVoor(0, [1, 6, 5, 2]), welkeVoor(1, [2, 3, 0, 6]), welkeVoor(6, [0, 5, 4, 1])];
    /* Bij de eerste vraag naar de dag ervoor zegt Bliepo het vooraf (Squla waarschuwt daar ook). */
    const eersteVoor: Opgave = (l, terug) => {
      const v = voor6[0](l, terug);
      return { ...v, vraag: terug ? v.vraag : ["Let op! Nu zoeken we de dag ervoor.", ...v.vraag] };
    };
    const fouten = await speelAlles(l, [...na6, eersteVoor, ...voor6.slice(1)], [3, 6, 9]);
    await squlaEind(l, fouten, "Je weet welke dag erna komt, en welke ervoor.");
  },
};

/* --- level 3: op volgorde, en verhaaltjes --- */

let handjeNr = 0;

/** Vier dagen op volgorde zetten (slepen of tikken). */
function opVolgorde(start: number, losse: number[], handje = false): Opgave {
  return (l, terug) => {
    const nr = volgend();
    const juist = [0, 1, 2, 3].map((i) => (start + i) % 7);
    const kaarten = schuif(losse, terug);
    let vakken: (number | null)[] = [null, null, null, null];
    let naSamen = false;
    let eerste = handje && !terug;
    const vraag = ["Zet de vier dagen op de goede volgorde."];
    const orden = (actief: boolean, uitslag?: (boolean | null)[]) => ({ vakken: [...vakken], losse: kaarten, uitslag, actief });
    return {
      toon: () => {
        /* Wat al goed lag, blijft liggen; de rest gaat terug. */
        vakken = vakken.map((v, i) => (v === juist[i] ? v : null));
        zetT(l, { ...LEEG_T, nr, ...(naSamen ? { trein: ALLE, treinKlein: true, licht: juist } : {}), orden: orden(false) });
      },
      vraag: eerste ? [...vraag, "Sleep een kaart naar een leeg vak.", "Tikken mag ook."] : vraag,
      antwoord: async () => {
        if (eerste) {
          zetT(l, { handje: ++handjeNr });
          eerste = false;
        }
        while (vakken.includes(null)) {
          const leeg = vakken.indexOf(null);
          zetTestAntwoord(naam(juist[leeg]));
          zetT(l, { orden: orden(true) });
          const g = await l.wachtOpVlak<{ soort: string; id: string; vak: number | null }>("leg");
          const dag = ALLE.find((d) => naam(d) === g.id);
          if (dag === undefined || vakken.includes(dag)) continue;
          const doel = g.vak ?? vakken.indexOf(null);
          if (vakken[doel] !== null) continue;
          vakken[doel] = dag;
          speelLesgeluid("schuif");
        }
        zetT(l, { orden: orden(false) });
        return [...vakken];
      },
      isGoed: (x) => (x as number[]).every((d, i) => d === juist[i]),
      noem: (x) => Hoofd((x as number[]).map(naam).join(", ")),
      goed: async () => {
        zetT(l, { orden: orden(false, [true, true, true, true]) });
        await l.zeg("Goed zo.", `${Hoofd(juist.map(naam).join(", "))}.`);
        await l.wacht(300);
      },
      fout: (x) => {
        zetT(l, { orden: orden(false, (x as number[]).map((d, i) => d === juist[i])) });
      },
      samen: async () => {
        vakken = vakken.map((v, i) => (v === juist[i] ? v : null));
        zetT(l, { trein: ALLE, treinKlein: true, orden: orden(false) });
        await l.zeg("Kijk naar de trein bovenaan.");
        zetT(l, { licht: juist });
        await l.zeg("Deze vier dagen staan ook in de trein.", "Kijk welke dag vooraan staat.");
        if (juist.includes(6) && juist.includes(0)) await l.zeg("Let op: na zondag begint de trein weer bij maandag.");
        naSamen = true;
      },
      tip: ["Zoek de dag die het eerst komt.", ...vraag],
      testAntwoord: naam(juist[0]),
    } as SqulaVraag<(number | null)[]>;
  };
}

type Verhaal = { vandaag: number; goed: number; kaarten: number[]; plaatje: string; zinnen: string[]; goedZin: string[]; samen: (l: Lesgids) => Promise<void>; hulp: Partial<TreinProps>; tip: string };

function verhaal(v: Verhaal): Opgave {
  return (l, terug) =>
    dagVraag(l, {
      beeld: { plaatje: v.plaatje, vandaagKaart: v.vandaag },
      kaarten: schuif(v.kaarten, terug).map((k) => [k]),
      goed: [v.goed],
      vraag: v.zinnen,
      goedZin: v.goedZin,
      samen: async (l) => {
        zetT(l, { trein: ALLE, vandaag: v.vandaag });
        await l.zeg(`Kijk, de gele pijl staat bij ${naam(v.vandaag)}.`, "Dat is vandaag.");
        await v.samen(l);
      },
      hulpBeeld: { trein: ALLE, vandaag: v.vandaag, ...v.hulp },
      tip: [v.tip, v.zinnen[v.zinnen.length - 1]],
    });
}

const verhalen: Opgave[] = [
  verhaal({
    vandaag: 1,
    goed: 3,
    kaarten: [2, 3, 4, 1],
    plaatje: "zwemmen",
    zinnen: ["Vandaag is het dinsdag.", "Sam gaat niet morgen zwemmen, maar de dag daarna.", "Op welke dag gaat Sam zwemmen?"],
    goedZin: ["Morgen is het woensdag.", "De dag daarna is het donderdag."],
    samen: async (l) => {
      zetT(l, { stappen: [1, 2], licht: [2] });
      await l.zeg("Morgen is het woensdag.", "Maar Sam gaat de dag daarna.", "Welke dag komt na woensdag?");
    },
    hulp: { stappen: [1, 2] },
    tip: "Eerst morgen, en dan nog één dag verder.",
  }),
  verhaal({
    vandaag: 2,
    goed: 4,
    kaarten: [3, 5, 4, 1],
    plaatje: "schaar",
    zinnen: ["Vandaag is het woensdag.", "Morgen gaat Noor naar de bibliotheek.", "De dag daarna gaat ze naar de kapper.", "Op welke dag gaat Noor naar de kapper?"],
    goedZin: ["Morgen is het donderdag.", "De dag daarna is het vrijdag."],
    samen: async (l) => {
      zetT(l, { stappen: [2, 3], licht: [3] });
      await l.zeg("Morgen is het donderdag.", "Dan gaat Noor naar de bibliotheek.", "Welke dag komt daarna?");
    },
    hulp: { stappen: [2, 3] },
    tip: "Eerst morgen, en dan nog één dag verder.",
  }),
  verhaal({
    vandaag: 3,
    goed: 6,
    kaarten: [5, 6, 0, 4],
    plaatje: "tent",
    zinnen: ["Vandaag is het donderdag.", "Over {3:wit} nachtjes gaat Daan kamperen.", "Op welke dag gaat Daan kamperen?"],
    goedZin: ["Na {3:wit} nachtjes slapen is het zondag."],
    samen: async (l) => {
      zetT(l, { stappen: [3, 4], licht: [4] });
      await l.zeg("Na {1:wit} nachtje slapen is het vrijdag.");
      zetT(l, { stappen: [3, 4, 5], licht: [5] });
      await l.zeg("Na nog een nachtje is het zaterdag.");
      await l.zeg("Nu nog één nachtje.", "Welke dag is het dan?");
    },
    hulp: { stappen: [3, 4, 5] },
    tip: "Tel drie nachtjes vanaf donderdag.",
  }),
  verhaal({
    vandaag: 6,
    goed: 5,
    kaarten: [4, 5, 0, 1],
    plaatje: "huis",
    zinnen: ["Vandaag is het zondag.", "Gisteren was Lotte bij haar tante.", "Op welke dag was Lotte bij haar tante?"],
    goedZin: ["Gisteren was het zaterdag."],
    samen: async (l) => {
      await l.zeg("Gisteren is de dag ervoor.", "Kijk naar de wagon vlak voor zondag.");
    },
    hulp: {},
    tip: "Gisteren is de dag vlak voor vandaag.",
  }),
  verhaal({
    vandaag: 5,
    goed: 3,
    kaarten: [4, 3, 2, 6],
    plaatje: "taart",
    zinnen: ["Vandaag is het zaterdag.", "Gisteren had Ali een feestje.", "De dag daarvoor bakte hij een taart.", "Op welke dag bakte Ali een taart?"],
    goedZin: ["Gisteren was het vrijdag.", "De dag daarvoor was het donderdag."],
    samen: async (l) => {
      zetT(l, { stappen: [5, 4], licht: [4] });
      await l.zeg("Gisteren was het vrijdag.", "Toen had Ali een feestje.", "Welke dag komt vlak voor vrijdag?");
    },
    hulp: { stappen: [5, 4] },
    tip: "Eerst gisteren, en dan nog één dag terug.",
  }),
  verhaal({
    vandaag: 0,
    goed: 2,
    kaarten: [1, 2, 3, 4],
    plaatje: "bed",
    zinnen: ["Vandaag is het maandag.", "Over {2:wit} nachtjes komt opa logeren.", "Op welke dag komt opa logeren?"],
    goedZin: ["Na {2:wit} nachtjes slapen is het woensdag."],
    samen: async (l) => {
      zetT(l, { stappen: [0, 1], licht: [1] });
      await l.zeg("Na {1:wit} nachtje slapen is het dinsdag.");
      await l.zeg("Nu nog één nachtje.", "Welke dag is het dan?");
    },
    hulp: { stappen: [0, 1] },
    tip: "Tel twee nachtjes vanaf maandag.",
  }),
];

const dagen3: Lesdraaiboek = {
  nacht: true,
  id: "squla-tijd-dagen-3",
  titel: "Dagen van de week (nog moeilijker)",
  synthesis: "Squla groep 3 · Tijd · Dagen van de week · level 3 (alleen leerdoel)",
  indeling: "synthesis",
  browserstem: true,
  kaarttekening: KaartWeektrein,
  async speel(l) {
    await welkomTrein(l, ["Hoi!", "Daar is de weektrein weer.", "We zetten dagen op volgorde.", "En we rekenen met gisteren, vandaag en morgen."], async () => {
      await l.zeg("De dagen staan altijd in dezelfde volgorde.");
      zetT(l, { licht: [6, 0] });
      await l.zeg("Na zondag begint de week weer bij maandag.");
      zetT(l, { licht: [], vandaag: 2 });
      await l.zeg("Stel, vandaag is het woensdag.", "Kijk, de gele pijl.");
      zetT(l, { licht: [1] });
      await l.zeg("Gisteren was het dinsdag.");
      zetT(l, { licht: [3] });
      await l.zeg("Morgen is het donderdag.");
      zetT(l, { licht: [], vandaag: null });
      await l.zeg("Elke nacht slapen ben je een dag verder.");
    });
    const opgaven: Opgave[] = [
      opVolgorde(3, [5, 3, 6, 4], true),
      opVolgorde(0, [2, 0, 3, 1]),
      opVolgorde(6, [1, 2, 6, 0]),
      opVolgorde(2, [4, 5, 2, 3]),
      opVolgorde(5, [0, 6, 1, 5]),
      opVolgorde(1, [3, 1, 4, 2]),
      ...verhalen,
    ];
    const fouten = await speelAlles(l, opgaven, [0, 6, 8]);
    await squlaEind(l, fouten, "Je kunt rekenen met de dagen van de week.");
  },
};

/* =====================================================================
   DE KALENDER en TIJDEN (vlakke tekeningen)
   ===================================================================== */

const LEEG_P: Omit<PlaatjesProps, "nr"> = {
  groot: null,
  kaarten: [],
  kaartenActief: false,
  uit: [],
  goed: [],
  fout: [],
  licht: [],
  orden: null,
  verbind: null,
};

const zetP = (l: Lesgids, p: Partial<PlaatjesProps>) => l.pasVlakAan<PlaatjesProps>(p);

type PlaatjesVraag = {
  beeld: Partial<PlaatjesProps>;
  kaarten: PDing[];
  goed: string;
  vraag: string[];
  goedZin: string[];
  samen: (l: Lesgids) => Promise<void>;
  hulpBeeld?: Partial<PlaatjesProps>;
  tip: string[];
};

/** Een vraag met plaatjes (kaartjes in het vlak). */
function plaatjesVraag(l: Lesgids, o: PlaatjesVraag, terug: boolean): SqulaVraag<string> {
  const nr = volgend();
  const kaarten = schuif(o.kaarten, terug);
  const uit: string[] = [];
  let naSamen = false;
  const naamVan = (id: string) => {
    const d = kaarten.find((k) => k.id === id);
    return Hoofd(d?.zeg ?? d?.label ?? id);
  };
  return {
    toon: () => zetP(l, { ...LEEG_P, nr, ...o.beeld, ...(naSamen ? (o.hulpBeeld ?? {}) : {}), kaarten, uit: [...uit] }),
    vraag: o.vraag,
    antwoord: async () => {
      zetP(l, { kaartenActief: true, fout: [], licht: [] });
      const g = await l.wachtOpVlak<{ soort: string; id: string }>("kaart");
      zetP(l, { kaartenActief: false });
      return g.id;
    },
    isGoed: (x) => x === o.goed,
    noem: naamVan,
    goed: async () => {
      zetP(l, { goed: [o.goed], licht: [], golf: { id: o.goed, n: ++golfNr } });
      await l.zeg("Goed zo.", ...o.goedZin);
      await l.wacht(300);
    },
    fout: (x) => {
      if (!uit.includes(x)) uit.push(x);
      zetP(l, { fout: [x], schud: { id: x, n: ++schudNr } });
    },
    samen: async () => {
      zetP(l, { fout: [], licht: [] });
      await o.samen(l);
      zetP(l, { licht: [] });
      naSamen = true;
    },
    tip: o.tip,
    testAntwoord: o.goed,
  };
}

/** Een vraag met woorden of getallen als antwoord (knoppen bij Bliepo). */
function knopVraag(
  l: Lesgids,
  o: { beeld: Partial<PlaatjesProps>; opties: string[]; goed: string; vraag: string[]; goedZin: string[]; samen: (l: Lesgids) => Promise<void>; hulpBeeld?: Partial<PlaatjesProps>; tip: string[] },
  terug: boolean,
): SqulaVraag<string> {
  const nr = volgend();
  let naSamen = false;
  const opties = schuif(o.opties, terug);
  return {
    toon: () => zetP(l, { ...LEEG_P, nr, ...o.beeld, ...(naSamen ? (o.hulpBeeld ?? {}) : {}) }),
    vraag: o.vraag,
    antwoord: async () => (await l.kies(opties, { weetniet: false, direct: true })) ?? "",
    isGoed: (x) => x === o.goed,
    noem: (x) => (/^\d+$/.test(x) ? `{${x}:wit}` : Hoofd(x.replace(/\.$/, ""))),
    goed: async () => {
      await l.zeg("Goed zo.", ...o.goedZin);
      await l.wacht(300);
    },
    samen: async () => {
      await o.samen(l);
      zetP(l, { licht: [] });
      naSamen = true;
    },
    tip: o.tip,
    testAntwoord: o.goed,
  };
}

/** Kaartjes op volgorde zetten (slepen of tikken); `vast` = vakken die al gevuld zijn. */
function ordenVraag(
  l: Lesgids,
  o: { beeld: Partial<PlaatjesProps>; juist: string[]; vast: number[]; vastDingen?: PDing[]; losse: PDing[]; vraag: string[]; goedZin: string[]; samen: (l: Lesgids) => Promise<void>; tip: string[]; handje?: boolean },
  terug: boolean,
): SqulaVraag<string[]> {
  const nr = volgend();
  const losse = schuif(o.losse, terug);
  let vakken: (string | null)[] = o.juist.map((id, i) => (o.vast.includes(i) ? id : null));
  let eerste = !!o.handje && !terug;
  const naamVan = (id: string) => {
    const d = o.losse.find((k) => k.id === id);
    return d?.zeg ?? d?.label ?? id;
  };
  const orden = (actief: boolean, uitslag?: (boolean | null)[]) => ({ vakken: [...vakken], vast: o.vast, vastDingen: o.vastDingen, losse, uitslag, actief });
  return {
    toon: () => {
      vakken = vakken.map((v, i) => (v === o.juist[i] ? v : null));
      zetP(l, { ...LEEG_P, nr, ...o.beeld, orden: orden(false) });
    },
    vraag: eerste ? [...o.vraag, "Sleep een kaartje naar een leeg vak.", "Tikken mag ook."] : o.vraag,
    antwoord: async () => {
      if (eerste) {
        zetP(l, { handje: ++handjeNr });
        eerste = false;
      }
      while (vakken.includes(null)) {
        zetTestAntwoord(o.juist[vakken.indexOf(null)]);
        zetP(l, { orden: orden(true), licht: [] });
        const g = await l.wachtOpVlak<{ soort: string; id: string; vak: number | null }>("leg");
        if (vakken.includes(g.id)) continue;
        const doel = g.vak ?? vakken.indexOf(null);
        if (vakken[doel] !== null) continue;
        vakken[doel] = g.id;
        speelLesgeluid("schuif");
      }
      zetP(l, { orden: orden(false) });
      return vakken as string[];
    },
    isGoed: (x) => x.every((id, i) => id === o.juist[i]),
    noem: (x) => Hoofd(x.filter((_, i) => !o.vast.includes(i)).map(naamVan).join(", ")),
    goed: async () => {
      zetP(l, { orden: orden(false, o.juist.map((_, i) => (o.vast.includes(i) ? null : true))) });
      await l.zeg("Goed zo.", ...o.goedZin);
      await l.wacht(300);
    },
    fout: (x) => zetP(l, { orden: orden(false, x.map((id, i) => (o.vast.includes(i) ? null : id === o.juist[i]))) }),
    samen: async () => {
      vakken = vakken.map((v, i) => (v === o.juist[i] ? v : null));
      zetP(l, { orden: orden(false) });
      await o.samen(l);
      zetP(l, { licht: [] });
    },
    tip: o.tip,
    testAntwoord: o.juist.find((_, i) => !o.vast.includes(i)) ?? null,
  };
}

/* --- De kalender, level 1: welke kalenders zijn er? --- */

const P = {
  klok: { id: "klok", tekening: "klok", zeg: "de klok" },
  maand: { id: "maandkalender", tekening: "maandklein", zeg: "de kalender van juni" },
  ritme: { id: "plaatjes", tekening: "dagritme|a=kring,rekenen,buiten,gym", zeg: "de plaatjes aan het lijntje" },
  rooster: { id: "weekkalender", tekening: "rooster|gym=1,3,4", zeg: "de kalender met de dagen van de week" },
} satisfies Record<string, PDing>;

const MAAND_L1 = "maand|rood=8|hoed=13";

const kalender1Opgaven: Opgave[] = [
  (l, t) =>
    plaatjesVraag(
      l,
      {
        beeld: {},
        kaarten: [P.klok, P.maand, P.ritme],
        goed: "plaatjes",
        vraag: ["Noa is op school.", "Waar zie je wat de klas vandaag gaat doen?", "Bij de klok, bij de kalender, of bij de plaatjes?"],
        goedZin: ["Op de plaatjes zie je wat de klas vandaag doet."],
        samen: async (l) => {
          zetP(l, { licht: ["klok"] });
          await l.zeg("Op een klok zie je hoe laat het is.");
          zetP(l, { licht: ["maandkalender"] });
          await l.zeg("Op deze kalender staan alle dagen van juni.");
          zetP(l, { licht: ["plaatjes"] });
          await l.zeg("Op deze plaatjes staat iets wat de klas doet.", "Eerst in de kring, dan rekenen.");
        },
        tip: ["Waar staat wat de klas doet?", "Waar zie je wat de klas vandaag gaat doen?"],
      },
      t,
    ),
  (l, t) =>
    plaatjesVraag(
      l,
      {
        beeld: { groot: "dagritme|a=kring,rekenen,buiten,gym" },
        kaarten: [
          { id: "kring", tekening: "activiteit|a=kring", label: "kring" },
          { id: "gym", tekening: "activiteit|a=gym", label: "gym" },
        ],
        goed: "kring",
        vraag: ["Op de plaatjes zie je wat de klas vandaag doet.", "Wat doet de klas als eerste?", "In de kring zitten, of gym?"],
        goedZin: ["Eerst zit de klas in de kring.", "Zo begint de dag."],
        samen: async (l) => {
          await l.zeg("Je kijkt naar de plaatjes van links naar rechts.", "Het eerste plaatje hangt helemaal links.");
        },
        tip: ["Kijk naar het plaatje helemaal links.", "Wat doet de klas als eerste?"],
      },
      t,
    ),
  (l, t) =>
    plaatjesVraag(
      l,
      {
        beeld: { groot: "dagritme|a=kring,rekenen,buiten,gym" },
        kaarten: [
          { id: "buiten spelen", tekening: "activiteit|a=buiten", label: "buiten" },
          { id: "rekenen", tekening: "activiteit|a=rekenen", label: "rekenen" },
        ],
        goed: "rekenen",
        vraag: ["Wat doet de klas na de kring?", "Buiten spelen, of rekenen?"],
        goedZin: ["Na de kring gaat de klas rekenen."],
        samen: async (l) => {
          await l.zeg("De kring is het eerste plaatje, helemaal links.", "Het plaatje daarnaast komt erna.");
        },
        tip: ["Kijk naar het plaatje naast de kring.", "Wat doet de klas na de kring?"],
      },
      t,
    ),
  (l, t) =>
    plaatjesVraag(
      l,
      {
        beeld: {},
        kaarten: [P.rooster, P.klok, P.maand],
        goed: "weekkalender",
        vraag: ["Vandaag heeft de klas gym.", "Dat is ook op donderdag. En op vrijdag!", "Op welke kalender zie je dat?"],
        goedZin: ["Dat is een kalender van de week: een weekkalender.", "Je ziet op welke dagen de klas gym heeft."],
        samen: async (l) => {
          zetP(l, { licht: ["klok"] });
          await l.zeg("Op de klok staan geen dagen.");
          zetP(l, { licht: ["maandkalender"] });
          await l.zeg("Op deze kalender staat geen gym.");
          zetP(l, { licht: ["weekkalender"] });
          await l.zeg("Op deze kalender staan de dagen van de week.", "Zoek de dagen met de bal.");
        },
        tip: ["Op welke kalender zie je een bal?", "Op welke kalender zie je dat?"],
      },
      t,
    ),
  (l, t) =>
    plaatjesVraag(
      l,
      {
        beeld: { groot: MAAND_L1 },
        kaarten: [
          { id: "waar", tekening: "duimop", label: "waar" },
          { id: "niet waar", tekening: "duimneer", label: "niet waar" },
        ],
        goed: "waar",
        vraag: ["Kijk naar de kalender.", "Op deze kalender zie je welke dag het is.", "Is dat waar of niet waar?"],
        goedZin: ["Dit is een kalender van een hele maand.", "Een maandkalender.", "Zie je het feesthoedje? Wat zou dat zijn?"],
        samen: async (l) => {
          await l.zeg("Bovenaan staan de dagen: maandag, dinsdag, woensdag, en zo verder.", "Onder elke dag staan getallen.", "Zo zie je bij elk getal welke dag het is.");
        },
        tip: ["Kijk naar de dagen bovenaan de kalender.", "Is dat waar of niet waar?"],
      },
      t,
    ),
  (l, t) =>
    knopVraag(
      l,
      {
        beeld: { groot: MAAND_L1 },
        opties: ["1 uur", "1 dag", "1 week"],
        goed: "1 dag",
        vraag: ["Op deze kalender staan {30:wit} vakjes met een getal.", "Wat betekent {1:wit} vakje?", "{1:wit} uur, {1:wit} dag of {1:wit} week?"],
        goedZin: ["{1:wit} vakje is {1:wit} dag.", "Er zijn {30:wit} vakjes, dus juni heeft {30:wit} dagen."],
        samen: async (l) => {
          await l.zeg("Elk vakje heeft een eigen getal.", "Vandaag is één vakje.", "Morgen is het vakje erna.");
        },
        tip: ["Denk aan vandaag en morgen.", "Wat betekent {1:wit} vakje?"],
      },
      t,
    ),
  (l, t) =>
    plaatjesVraag(
      l,
      {
        beeld: { groot: MAAND_L1 },
        kaarten: [
          { id: "8", label: "8" },
          { id: "ballon", tekening: "ballon", zeg: "de ballon" },
          { id: "13", label: "13" },
        ],
        goed: "8",
        vraag: ["Op de kalender is één vak rood.", "Welk getal staat in het rode vak?"],
        goedZin: ["In het rode vak staat {8:rood}.", "Het is {8:rood} juni."],
        samen: async (l) => {
          await l.zeg("Zoek op de kalender het vak met de rode rand.", "Kijk goed welk getal erin staat.");
        },
        tip: ["Kijk naar het vak met de rode rand.", "Welk getal staat in het rode vak?"],
      },
      t,
    ),
  (l, t) =>
    plaatjesVraag(
      l,
      {
        beeld: { groot: MAAND_L1 },
        kaarten: [
          { id: "13", label: "13" },
          { id: "8", label: "8" },
          { id: "ballon", tekening: "ballon", zeg: "de ballon" },
        ],
        goed: "13",
        vraag: ["Zie je het feesthoedje op de kalender?", "Welk getal staat in dat vakje?"],
        goedZin: ["Bij het feesthoedje staat {13:wit}.", "Dat is {13:wit} juni."],
        samen: async (l) => {
          await l.zeg("Zoek het vakje met het feesthoedje.", "Het staat in dezelfde rij als het rode vak.", "Kijk welk getal ernaast staat.");
        },
        tip: ["Kijk naar het getal naast het feesthoedje.", "Welk getal staat in dat vakje?"],
      },
      t,
    ),
  (l, t) => verbindVraag(l, t),
  (l, t) =>
    plaatjesVraag(
      l,
      {
        beeld: {},
        kaarten: [
          { id: "lijst", tekening: "lijst|maand=maart|dagen=31|bij=21|naam=Ravi", zeg: "de lijst met een naam" },
          { id: "boek", tekening: "boeknaam|naam=Ravi", zeg: "het boek" },
          { id: "feesthoedje", tekening: "feesthoed", zeg: "het feesthoedje" },
        ],
        goed: "lijst",
        vraag: ["Waar zie je een verjaardagskalender?", "Bij de lijst, bij het boek, of bij het feesthoedje?"],
        goedZin: ["Op deze kalender staat de naam Ravi bij {21:rood} maart.", "Dan is Ravi jarig."],
        samen: async (l) => {
          await l.zeg("Op een verjaardagskalender staan de namen van jarigen.", "Bij elke naam staat een datum.");
        },
        tip: ["Zoek de kalender met een naam bij een getal.", "Waar zie je een verjaardagskalender?"],
      },
      t,
    ),
  (l, t) =>
    plaatjesVraag(
      l,
      {
        beeld: {},
        kaarten: [
          { id: "week", tekening: "weekblad", zeg: "het blad met één week" },
          { id: "jaar", tekening: "jaar", zeg: "het blad met twaalf maanden" },
          { id: "maand", tekening: "lijst|maand=mei|dagen=31", zeg: "de lijst met één maand" },
        ],
        goed: "jaar",
        vraag: ["Een jaarkalender is een kalender van een heel jaar.", "Daar staan alle maanden op.", "Waar zie je een jaarkalender?"],
        goedZin: ["Hier staan alle {12:wit} maanden op.", "Een heel jaar, dat is lang!"],
        samen: async (l) => {
          await l.zeg("Een jaar heeft {12:wit} maanden.", "Zoek de kalender met de meeste blokjes.", "Elk blokje is een maand.");
        },
        tip: ["Zoek de kalender met twaalf blokjes.", "Waar zie je een jaarkalender?"],
      },
      t,
    ),
  (l, t) =>
    plaatjesVraag(
      l,
      {
        beeld: { groot: "maand|hoed=13" },
        kaarten: [
          { id: "ziek", tekening: "thermometer", label: "ziek" },
          { id: "jarig", tekening: "feesthoed", label: "jarig" },
          { id: "tandarts", tekening: "tand", label: "tandarts" },
        ],
        goed: "jarig",
        vraag: ["Kijk naar het vakje met het feesthoedje.", "Wat is er op {13:wit} juni?", "Is Noa dan ziek, is ze jarig, of moet ze naar de tandarts?"],
        goedZin: ["Op {13:wit} juni is Noa jarig.", "Maar hoe lang duurt het nog?", "Dat zie je in de volgende les."],
        samen: async (l) => {
          await l.zeg("Een feesthoedje hoort bij een feest.", "Welk feest heb jij één keer per jaar?");
        },
        tip: ["Een feesthoedje draag je op een feestje.", "Wat is er op {13:wit} juni?"],
      },
      t,
    ),
];

/** Lijnen trekken tussen drie kalenders en drie woorden. */
function verbindVraag(l: Lesgids, terug: boolean): SqulaVraag<[string, string][]> {
  const nr = volgend();
  const links: PDing[] = schuif(
    [
      { id: "lijst", tekening: "lijst|maand=mei|dagen=31", zeg: "de lijst met alle dagen van mei" },
      { id: "blad", tekening: "weekblad", zeg: "het blad met één week" },
      { id: "plaatjes", tekening: "dagritme|a=kring,rekenen,buiten,gym", zeg: "de plaatjes van één dag" },
    ],
    terug,
  );
  const rechts: PDing[] = [
    { id: "dagkalender", label: "dagkalender" },
    { id: "maandkalender", label: "maandkalender" },
    { id: "weekkalender", label: "weekkalender" },
  ];
  const juist: Record<string, string> = { lijst: "maandkalender", blad: "weekkalender", plaatjes: "dagkalender" };
  let lijnen: [string, string][] = [];
  let vast: string[] = [];
  let gekozen: string | null = null;
  let eerste = !terug;
  const zet = (actief: boolean) => zetP(l, { verbind: { links, rechts, lijnen: [...lijnen], vast: [...vast], gekozen, actief } });
  return {
    toon: () => {
      lijnen = lijnen.filter(([a]) => vast.includes(a));
      gekozen = null;
      zetP(l, { ...LEEG_P, nr, verbind: { links, rechts, lijnen: [...lijnen], vast: [...vast], gekozen: null, actief: false } });
    },
    vraag: ["Allemaal kalenders!", "Welk woord hoort erbij?", "De woorden zijn: dagkalender, maandkalender en weekkalender.", "Trek de lijnen."],
    antwoord: async () => {
      if (eerste) {
        zetP(l, { handje: ++handjeNr });
        eerste = false;
      }
      const klaar = () => links.every((d) => lijnen.some(([a]) => a === d.id));
      while (!klaar()) {
        const open = links.find((d) => !lijnen.some(([a]) => a === d.id))!;
        zetTestAntwoord(gekozen ? juist[gekozen] : open.id);
        zet(true);
        const g = await l.wachtOpVlak<{ soort: string; id?: string; links?: string; rechts?: string }>(["links", "rechts", "lijn"]);
        let paar: [string, string] | null = null;
        if (g.soort === "links" && g.id) gekozen = g.id;
        if (g.soort === "rechts" && g.id && gekozen) paar = [gekozen, g.id];
        if (g.soort === "lijn" && g.links && g.rechts) paar = [g.links, g.rechts];
        if (paar && !vast.includes(paar[0]) && !lijnen.some(([a, r]) => r === paar![1] && vast.includes(a))) {
          lijnen = [...lijnen.filter(([a, r]) => a !== paar![0] && r !== paar![1]), paar];
          gekozen = null;
          speelLesgeluid("schuif");
        }
      }
      zet(false);
      return lijnen;
    },
    isGoed: (x) => x.every(([a, r]) => juist[a] === r),
    noem: () => "Zo",
    goed: async () => {
      vast = links.map((d) => d.id);
      zet(false);
      await l.zeg("Goed zo.", "Een dagkalender, een weekkalender en een maandkalender.", "Ken je ook de verjaardagskalender?");
      await l.wacht(300);
    },
    fout: (x) => {
      /* Wat goed is, blijft staan (groen); de andere lijnen gaan weg. */
      vast = x.filter(([a, r]) => juist[a] === r).map(([a]) => a);
      lijnen = x.filter(([a]) => vast.includes(a));
      zet(false);
    },
    samen: async () => {
      zetP(l, { licht: ["blad"] });
      await l.zeg("Op dit blad staat één week: van maandag tot en met zondag.");
      zetP(l, { licht: ["lijst"] });
      await l.zeg("Op deze lijst staan alle dagen van een maand.");
      zetP(l, { licht: ["plaatjes"] });
      await l.zeg("En op deze plaatjes zie je wat je op één dag doet.");
      zetP(l, { licht: [] });
    },
    tip: ["Een maand heeft veel dagen. Een week heeft er zeven.", "Trek de lijnen."],
    testAntwoord: links[0].id,
  };
}

async function welkomPlaatjes(l: Lesgids, groot: string, welkom: string[], uitleg: () => Promise<void>) {
  l.vlak<PlaatjesProps>(SqulaTijdPlaatjes, { ...LEEG_P, nr: volgend(), groot });
  speelLesgeluid("verschijn");
  await l.wacht(500);
  await squlaBegin(l, { welkom, uitleg });
}

const kalender1: Lesdraaiboek = {
  id: "squla-tijd-kalender-1",
  titel: "De kalender",
  synthesis: "Squla groep 3 · Tijd · De kalender · level 1 (alleen leerdoel)",
  indeling: "synthesis",
  browserstem: true,
  kaarttekening: KaartKalender,
  async speel(l) {
    await welkomPlaatjes(l, "maand|hoed=13", ["Hoi!", "Dit is de kalender van juni.", "Noa is bijna jarig.", "We leren welke kalenders er zijn."], async () => {
      zetP(l, { ...LEEG_P, groot: null, kaarten: [P.ritme, P.rooster, P.maand] });
      zetP(l, { licht: ["plaatjes"] });
      await l.zeg("Op een dagkalender zie je wat je op één dag doet.");
      zetP(l, { licht: ["weekkalender"] });
      await l.zeg("Op een weekkalender zie je de dagen van één week.");
      zetP(l, { licht: ["maandkalender"] });
      await l.zeg("Op een maandkalender zie je alle dagen van een maand.");
      zetP(l, { licht: [] });
    });
    const fouten = await speelAlles(l, kalender1Opgaven, [0, 4, 5]);
    await squlaEind(l, fouten, "Je kent de dagkalender, de weekkalender, de maandkalender en meer.");
  },
};

/* --- De kalender, level 2: rekenen met de kalender --- */

const kalender2Opgaven: Opgave[] = [
  (l, t) =>
    knopVraag(
      l,
      {
        beeld: { groot: "maand|rood=9|hoed=13" },
        opties: ["8", "9", "16"],
        goed: "9",
        vraag: ["Zie je het rode vak op de kalender?", "Welk getal staat daar?"],
        goedZin: ["In het rode vak staat {9:rood}.", "Weet jij wat dat betekent?"],
        samen: async (l) => {
          await l.zeg("Zoek het vak met de rode rand.", "Kijk goed welk getal erin staat.");
        },
        tip: ["Kijk naar het vak met de rode rand.", "Welk getal staat daar?"],
      },
      t,
    ),
  (l, t) =>
    knopVraag(
      l,
      {
        beeld: { groot: "stukje|van=8|rood=9" },
        opties: ["Noa is 9 jaar.", "Het is 9 uur.", "Het is 9 juni."],
        goed: "Het is 9 juni.",
        vraag: ["Wat betekent de {9:rood} op de kalender?", "Is Noa {9:wit} jaar?", "Is het {9:wit} uur?", "Of is het {9:wit} juni?"],
        goedZin: ["Het is {9:rood} juni.", "Dat zie je op de kalender."],
        samen: async (l) => {
          await l.zeg("Een kalender gaat over dagen.", "Elk getal is een dag van de maand.", "En de maand is juni.");
        },
        tip: ["Op een kalender staan dagen, geen uren.", "Wat betekent de {9:rood} op de kalender?"],
      },
      t,
    ),
  (l, t) =>
    knopVraag(
      l,
      {
        beeld: { groot: "maand|rood=9|pijl=9|hoed=13" },
        opties: ["woensdag", "donderdag", "zondag"],
        goed: "woensdag",
        vraag: ["Op de kalender zie je ook welke dag het is.", "Volg de rode pijl naar boven.", "Welke dag is het vandaag?", "Woensdag, donderdag of zondag?"],
        goedZin: ["Vandaag is het woensdag {9:rood} juni.", "Handig, zo'n kalender."],
        samen: async (l) => {
          await l.zeg("Bovenaan staan de dagen, kort geschreven.", "ma is maandag, di is dinsdag.", "De pijl wijst naar wo.");
        },
        tip: ["Welke dag begint met wo?", "Welke dag is het vandaag?"],
      },
      t,
    ),
  (l, t) =>
    ordenVraag(
      l,
      {
        beeld: { groot: "dagritme|a=rekenen,fruit,gym" },
        juist: ["rekenen", "fruit eten", "gym"],
        vast: [],
        losse: [
          { id: "fruit eten", tekening: "activiteit|a=fruit", label: "fruit" },
          { id: "gym", tekening: "activiteit|a=gym", label: "gym" },
          { id: "rekenen", tekening: "activiteit|a=rekenen", label: "rekenen" },
        ],
        vraag: ["Dit is de dagkalender van Noa.", "Je ziet wat ze vandaag allemaal doet.", "Zet de kaartjes in dezelfde volgorde."],
        goedZin: ["Eerst rekenen, dan fruit eten, dan gym.", "Dat doet Noa vandaag."],
        samen: async (l) => {
          await l.zeg("Kijk naar de plaatjes bovenaan.", "Begin links.", "Welk plaatje hangt daar?");
        },
        tip: ["Leg de kaartjes net zo als de plaatjes bovenaan.", "Begin links."],
        handje: true,
      },
      t,
    ),
  (l, t) =>
    knopVraag(
      l,
      {
        beeld: { groot: "verjaardag|maand=juni|dagen=30|bij=13|naam=Noa" },
        opties: ["9", "13", "3"],
        goed: "13",
        vraag: ["Bij Noa thuis hangt een verjaardagskalender.", "Bij welk getal staat de naam Noa?"],
        goedZin: ["Noa staat bij {13:wit}.", "Ze is jarig op {13:wit} juni."],
        samen: async (l) => {
          await l.zeg("Op een verjaardagskalender staan namen.", "De naam Noa staat in het rood.");
        },
        tip: ["Zoek de rode naam.", "Bij welk getal staat de naam Noa?"],
      },
      t,
    ),
  (l, t) =>
    knopVraag(
      l,
      {
        beeld: { groot: "maand|rood=9|hoed=13" },
        opties: ["Ja", "Nee"],
        goed: "Ja",
        vraag: ["Vandaag is het {9:rood} juni.", "Kun je op de kalender tellen hoeveel nachtjes het nog duurt?", "Ja of nee?"],
        goedZin: ["Ja, dat kan.", "We gaan het tellen."],
        samen: async (l) => {
          await l.zeg("Elk vakje is een dag.", "Van het ene vakje naar het volgende is één nachtje slapen.");
        },
        tip: ["Elk vakje is een dag.", "Ja of nee?"],
      },
      t,
    ),
  (l, t) =>
    knopVraag(
      l,
      {
        beeld: { groot: "maand|rood=9|hoed=13|boog=9-13" },
        opties: ["3", "4", "5"],
        goed: "4",
        vraag: ["Tel de boogjes.", "Dan weet je over hoeveel nachtjes Noa jarig is.", "Hoeveel boogjes zijn het?"],
        goedZin: ["Over {4:wit} nachtjes is Noa jarig.", "Joepie!"],
        samen: async (l) => {
          await l.zeg("Begin bij het rode vak.", "Elk boogje is één nachtje.", "Tel de boogjes tot het feesthoedje.");
        },
        tip: ["Wijs elk boogje aan en tel.", "Hoeveel boogjes zijn het?"],
      },
      t,
    ),
  (l, t) =>
    knopVraag(
      l,
      {
        beeld: { groot: "stukje|van=8|rood=9" },
        opties: ["10 juni", "16 juni", "8 juni"],
        goed: "10 juni",
        vraag: ["Noa gaat slapen. Dan is het snel morgen.", "Welke datum is het morgen?", "{10:wit} juni, {16:wit} juni of {8:wit} juni?"],
        goedZin: ["Na {9:wit} juni komt {10:wit} juni.", "En daarna komt {11:wit} juni."],
        samen: async (l) => {
          await l.zeg("Vandaag is het rode vak: {9:rood} juni.", "Morgen is het vakje erna, rechts ernaast.");
        },
        tip: ["Kijk naar het vakje rechts van het rode vak.", "Welke datum is het morgen?"],
      },
      t,
    ),
  (l, t) =>
    knopVraag(
      l,
      {
        beeld: { groot: "droom|van=11|rood=12|hoed=13" },
        opties: ["13", "12", "1"],
        goed: "1",
        vraag: ["Kijk, Noa slaapt.", "Ze droomt dat het al {12:rood} juni is.", "Over hoeveel nachtjes is ze dan jarig?"],
        goedZin: ["Dan nog maar {1:wit} nachtje!", "Jammer, het was maar een droom."],
        samen: async (l) => {
          await l.zeg("In de droom is het rode vak {12:rood} juni.", "Het feesthoedje staat in het vakje ernaast.", "Hoeveel nachtjes slapen is dat?");
        },
        tip: ["Van het rode vak naar het feesthoedje is één stapje.", "Over hoeveel nachtjes is ze dan jarig?"],
      },
      t,
    ),
  (l, t) =>
    knopVraag(
      l,
      {
        beeld: { groot: "maand|rood=10|hoed=13|boog=10-13" },
        opties: ["0", "2", "3"],
        goed: "3",
        vraag: ["Nu is het echt morgen: {10:rood} juni.", "De verjaardag komt steeds dichterbij!", "Hoeveel nachtjes nog?"],
        goedZin: ["Nog {3:wit} nachtjes slapen.", "Morgen nog {2:wit}, de dag daarna nog {1:wit}.", "En dan is Noa jarig!"],
        samen: async (l) => {
          await l.zeg("Begin bij het rode vak.", "Tel de boogjes tot het feesthoedje.");
        },
        tip: ["Elk boogje is één nachtje.", "Hoeveel nachtjes nog?"],
      },
      t,
    ),
  (l, t) =>
    knopVraag(
      l,
      {
        beeld: { groot: "stukje|van=9|rood=10" },
        opties: ["9 juni", "11 juni", "17 juni"],
        goed: "11 juni",
        vraag: ["Vandaag is het {10:rood} juni.", "Welke datum is het morgen?", "{9:wit} juni, {11:wit} juni of {17:wit} juni?"],
        goedZin: ["Na {10:wit} juni komt {11:wit} juni."],
        samen: async (l) => {
          await l.zeg("Vandaag is het rode vak: {10:rood} juni.", "Morgen is het vakje erna, rechts ernaast.");
        },
        tip: ["Kijk naar het vakje rechts van het rode vak.", "Welke datum is het morgen?"],
      },
      t,
    ),
  (l, t) =>
    knopVraag(
      l,
      {
        beeld: { groot: "maand|rood=11|hoed=13|boog=11-13" },
        opties: ["1", "2", "3"],
        goed: "2",
        vraag: ["Nu is het {11:rood} juni.", "Hoeveel nachtjes nog tot Noa jarig is?"],
        goedZin: ["Nog maar {2:wit} nachtjes!"],
        samen: async (l) => {
          await l.zeg("Begin bij het rode vak.", "Tel de boogjes tot het feesthoedje.");
        },
        tip: ["Elk boogje is één nachtje.", "Hoeveel nachtjes nog tot Noa jarig is?"],
      },
      t,
    ),
];

const kalender2: Lesdraaiboek = {
  id: "squla-tijd-kalender-2",
  titel: "De kalender (moeilijker)",
  synthesis: "Squla groep 3 · Tijd · De kalender · level 2 (alleen leerdoel)",
  indeling: "synthesis",
  browserstem: true,
  kaarttekening: KaartKalender,
  async speel(l) {
    await welkomPlaatjes(l, "maand|hoed=13", ["Hoi!", "Dit is de kalender van juni.", "Noa is jarig op {13:wit} juni.", "We gaan tellen hoe lang het nog duurt."], async () => {
      zetP(l, { groot: "maand|boog=1-3" });
      await l.zeg("Elk vakje is een dag.", "Van vakje naar vakje is één nachtje slapen.", "Zie je de boogjes?", "Van {1:wit} juni naar {3:wit} juni is {2:wit} nachtjes slapen.");
      zetP(l, { groot: "maand|hoed=13" });
    });
    const fouten = await speelAlles(l, kalender2Opgaven, [0, 3, 6]);
    await squlaEind(l, fouten, "Je kunt rekenen met de kalender.");
  },
};

/* --- Tijden, level 1: woorden over tijd (Fien de kikker bij het kampvuur) --- */

const DAGDEEL = (d: string): PDing => ({ id: d, tekening: `dagdeel|d=${d}`, label: d });

const tijden1Opgaven: Opgave[] = [
  (l, t) =>
    knopVraag(
      l,
      {
        beeld: { groot: "kampvuur" },
        opties: ["donderdag", "zaterdag", "zondag"],
        goed: "zaterdag",
        vraag: ["Fien de kikker vertelt: gisteren was er een kampvuuravond.", "Dat was op vrijdag.", "Welke dag komt na vrijdag?", "Donderdag, zaterdag of zondag?"],
        goedZin: ["Gisteren was het vrijdag.", "Vandaag is het zaterdag."],
        samen: async (l) => {
          zetP(l, { groot: "week|licht=4" });
          await l.zeg("Hier staan de dagen van de week.", "Vrijdag is groter.", "Welke dag staat erna?");
        },
        hulpBeeld: { groot: "week|licht=4" },
        tip: ["Kijk naar de dag rechts van vrijdag.", "Welke dag komt na vrijdag?"],
      },
      t,
    ),
  (l, t) =>
    plaatjesVraag(
      l,
      {
        beeld: {},
        kaarten: [
          { id: "uil", tekening: "uil", zeg: "de uil" },
          { id: "vos", tekening: "vos", zeg: "de vos" },
          { id: "egel", tekening: "egel", zeg: "de egel" },
        ],
        goed: "uil",
        vraag: ["Bij het kampvuur vertelden de dieren een verhaal.", "Als eerste mocht de uil vertellen.", "Wie mocht er als eerste vertellen?"],
        goedZin: ["De uil begon.", "Hij vertelde als eerste."],
        samen: async (l) => {
          await l.zeg("Als eerste betekent: vóór alle anderen.", "Luister nog eens goed naar het verhaal.");
        },
        tip: ["Het was het dier met de grote ronde ogen.", "Wie mocht er als eerste vertellen?"],
      },
      t,
    ),
  (l, t) =>
    knopVraag(
      l,
      {
        beeld: { groot: "uil" },
        opties: ["lang", "rond", "snel"],
        goed: "lang",
        vraag: ["Het verhaal van de uil was niet kort.", "Het was juist heel erg ...", "Lang, rond of snel?"],
        goedZin: ["Het verhaal van de uil was heel lang."],
        samen: async (l) => {
          await l.zeg("Een kort verhaal is snel voorbij.", "Dit verhaal was niet snel voorbij.", "Het duurde en duurde maar.");
        },
        tip: ["Het tegenovergestelde van kort.", "Het verhaal was juist heel erg ..."],
      },
      t,
    ),
  (l, t) =>
    knopVraag(
      l,
      {
        beeld: { groot: "vos" },
        opties: ["groen", "kort", "zwaar"],
        goed: "kort",
        vraag: ["Daarna vertelde de vos.", "Zijn verhaal was niet lang.", "Het was juist heel erg ...", "Groen, kort of zwaar?"],
        goedZin: ["Het verhaal van de vos was kort.", "Het was zo voorbij."],
        samen: async (l) => {
          await l.zeg("Lang en kort horen bij elkaar.", "Het verhaal van de vos was snel voorbij.");
        },
        tip: ["Het tegenovergestelde van lang.", "Het was juist heel erg ..."],
      },
      t,
    ),
  (l, t) =>
    knopVraag(
      l,
      {
        beeld: { groot: "egel" },
        opties: ["straks", "gisteren", "vroeger"],
        goed: "straks",
        vraag: ["Nu vertelt de egel.", "Fien is over een poosje aan de beurt.", "Welk woord past bij: over een poosje?", "Straks, gisteren of vroeger?"],
        goedZin: ["Over een poosje is straks.", "Fien is straks aan de beurt."],
        samen: async (l) => {
          await l.zeg("Over een poosje is nog niet nu.", "Het komt nog.", "Gisteren en vroeger zijn al voorbij.");
        },
        tip: ["Welk woord gaat over iets wat nog komt?", "Welk woord past bij: over een poosje?"],
      },
      t,
    ),
  (l, t) =>
    plaatjesVraag(
      l,
      {
        beeld: {},
        kaarten: [DAGDEEL("ochtend"), DAGDEEL("middag"), DAGDEEL("nacht")],
        goed: "nacht",
        vraag: ["Eindelijk is Fien aan de beurt.", "Het is al laat in de avond.", "Wat komt er na de avond?"],
        goedZin: ["Na de avond komt de nacht."],
        samen: async (l) => {
          zetP(l, { kaarten: [DAGDEEL("ochtend"), DAGDEEL("middag"), DAGDEEL("avond")], uit: [] });
          zetP(l, { licht: ["ochtend"] });
          await l.zeg("Eerst is het ochtend.");
          zetP(l, { licht: ["middag"] });
          await l.zeg("Dan is het middag.");
          zetP(l, { licht: ["avond"] });
          await l.zeg("Dan is het avond.", "En wat komt daarna?");
        },
        tip: ["Wanneer slaap je?", "Wat komt er na de avond?"],
      },
      t,
    ),
  (l, t) =>
    plaatjesVraag(
      l,
      {
        beeld: {},
        kaarten: [DAGDEEL("nacht"), DAGDEEL("middag"), DAGDEEL("ochtend")],
        goed: "middag",
        vraag: ["En wat komt er vlak voor de avond?"],
        goedZin: ["Voor de avond komt de middag."],
        samen: async (l) => {
          zetP(l, { kaarten: [DAGDEEL("ochtend"), DAGDEEL("avond"), DAGDEEL("nacht")], uit: [] });
          zetP(l, { licht: ["ochtend"] });
          await l.zeg("Eerst is het ochtend.");
          zetP(l, { licht: ["avond"] });
          await l.zeg("Dan komt er iets.", "En dan is het avond.");
          zetP(l, { licht: ["nacht"] });
          await l.zeg("Daarna is het nacht.");
        },
        tip: ["Wat komt er na de ochtend?", "Wat komt er vlak voor de avond?"],
      },
      t,
    ),
  (l, t) =>
    ordenVraag(
      l,
      {
        beeld: {},
        juist: ["ochtend", "middag", "avond", "nacht"],
        vast: [0],
        vastDingen: [DAGDEEL("ochtend")],
        losse: [DAGDEEL("middag"), DAGDEEL("nacht"), DAGDEEL("avond")],
        vraag: ["Zet op volgorde:", "ochtend, middag, avond, nacht."],
        goedZin: ["Ochtend, middag, avond, nacht.", "Zo gaat een hele dag."],
        samen: async (l) => {
          await l.zeg("De ochtend staat er al.", "Luister nog eens:", "ochtend, middag, avond, nacht.");
        },
        tip: ["Leg ze zoals Bliepo ze zegt.", "Ochtend, middag, avond, nacht."],
        handje: true,
      },
      t,
    ),
  (l, t) =>
    knopVraag(
      l,
      {
        beeld: { groot: "dagdeel|d=nacht" },
        opties: ["laat", "kort", "straks"],
        goed: "laat",
        vraag: ["Na het kampvuur ging Fien naar huis.", "Toen was het al heel ...", "Laat, kort of straks?"],
        goedZin: ["Het was al heel laat.", "Tijd om te slapen!"],
        samen: async (l) => {
          await l.zeg("Het was al nacht.", "Dan is het niet vroeg meer.");
        },
        tip: ["Het tegenovergestelde van vroeg.", "Toen was het al heel ..."],
      },
      t,
    ),
  (l, t) =>
    ordenVraag(
      l,
      {
        beeld: {},
        juist: ["gisteren", "vandaag", "morgen"],
        vast: [1],
        vastDingen: [{ id: "vandaag", label: "vandaag" }],
        losse: [
          { id: "morgen", label: "morgen" },
          { id: "gisteren", label: "gisteren" },
        ],
        vraag: ["Zet op volgorde.", "Vandaag staat er al.", "Het ene kaartje is morgen.", "Het andere kaartje is gisteren."],
        goedZin: ["Gisteren, vandaag, morgen."],
        samen: async (l) => {
          await l.zeg("Gisteren was de kampvuuravond. Die is al voorbij.", "Vandaag rust Fien uit.", "Morgen komt nog.", "Wat al voorbij is, komt eerst.");
        },
        tip: ["Gisteren is al voorbij.", "Zet op volgorde."],
      },
      t,
    ),
  (l, t) =>
    knopVraag(
      l,
      {
        beeld: { groot: "zwemmen" },
        opties: ["vrijdag", "zondag", "maandag"],
        goed: "zondag",
        vraag: ["Morgen gaat Fien zwemmen!", "Vandaag is het zaterdag.", "Welke dag is het morgen?", "Vrijdag, zondag of maandag?"],
        goedZin: ["Morgen is het zondag.", "Dan gaat Fien zwemmen."],
        samen: async (l) => {
          zetP(l, { groot: "week|licht=5" });
          await l.zeg("Zaterdag is groter. Dat is vandaag.", "Morgen is de dag erna.");
        },
        hulpBeeld: { groot: "week|licht=5" },
        tip: ["Kijk naar de dag rechts van zaterdag.", "Welke dag is het morgen?"],
      },
      t,
    ),
  (l, t) =>
    knopVraag(
      l,
      {
        beeld: { groot: "kikker" },
        opties: ["donderdag", "vrijdag", "zondag"],
        goed: "vrijdag",
        vraag: ["Vandaag is het zaterdag.", "Welke dag was het gisteren?", "Donderdag, vrijdag of zondag?"],
        goedZin: ["Gisteren was het vrijdag.", "Toen was de kampvuuravond."],
        samen: async (l) => {
          zetP(l, { groot: "week|licht=5" });
          await l.zeg("Zaterdag is groter. Dat is vandaag.", "Gisteren is de dag ervoor.");
        },
        hulpBeeld: { groot: "week|licht=5" },
        tip: ["Kijk naar de dag links van zaterdag.", "Welke dag was het gisteren?"],
      },
      t,
    ),
];

const tijden1: Lesdraaiboek = {
  id: "squla-tijd-tijden-1",
  titel: "Tijden",
  synthesis: "Squla groep 3 · Tijd · Tijden · level 1 (alleen leerdoel)",
  indeling: "synthesis",
  browserstem: true,
  kaarttekening: KaartTijden,
  async speel(l) {
    await welkomPlaatjes(l, "kampvuur", ["Hoi!", "We leren woorden over tijd.", "Zoals eerst, straks, laat en morgen.", "Fien de kikker vertelt een verhaal."], async () => {
      zetP(l, { groot: null, kaarten: [DAGDEEL("ochtend"), DAGDEEL("middag"), DAGDEEL("avond"), DAGDEEL("nacht")] });
      zetP(l, { licht: ["ochtend"] });
      await l.zeg("Eerst is het ochtend.");
      zetP(l, { licht: ["middag"] });
      await l.zeg("Dan is het middag.");
      zetP(l, { licht: ["avond"] });
      await l.zeg("Dan is het avond.");
      zetP(l, { licht: ["nacht"] });
      await l.zeg("En dan is het nacht.");
      zetP(l, { kaarten: [], licht: [], groot: "kampvuur" });
      await l.zeg("Gisteren is al voorbij.", "Vandaag is nu.", "Morgen komt nog.");
    });
    const fouten = await speelAlles(l, tijden1Opgaven, [0, 5, 9]);
    await squlaEind(l, fouten, "Je kent woorden over tijd.");
  },
};

/* --- Tijden, level 2: wat duurt lang, wat duurt kort (bakker Tim) --- */

const twee = (a: PDing, b: PDing): PDing[] => [a, b];

const tijden2Opgaven: Opgave[] = [
  (l, t) =>
    plaatjesVraag(
      l,
      {
        beeld: {},
        kaarten: twee({ id: "boterham", tekening: "boterham", zeg: "een boterham eten" }, { id: "slapen", tekening: "bed", zeg: "een nacht slapen" }),
        goed: "slapen",
        vraag: ["Bakker Tim staat heel vroeg op.", "Eerst eet hij een boterham.", "Wat duurt langer: een boterham eten of een nacht slapen?"],
        goedZin: ["Een nacht slapen duurt veel langer.", "Een boterham is zo op."],
        samen: async (l) => {
          zetP(l, { licht: ["boterham"] });
          await l.zeg("Een boterham is op in een paar happen.");
          zetP(l, { licht: ["slapen"] });
          await l.zeg("Slapen doe je de hele nacht.");
        },
        tip: ["Wat doe je de hele nacht?", "Wat duurt langer?"],
      },
      t,
    ),
  (l, t) =>
    plaatjesVraag(
      l,
      {
        beeld: {},
        kaarten: twee({ id: "lopen", tekening: "schoen", zeg: "naar de bakkerij lopen" }, { id: "werken", tekening: "bakkerij", zeg: "de hele dag werken" }),
        goed: "werken",
        vraag: ["Tim loopt naar de bakkerij. Dat is vlakbij.", "Daar werkt hij de hele dag.", "Wat duurt langer: naar de bakkerij lopen of de hele dag werken?"],
        goedZin: ["De hele dag werken duurt langer.", "Vlakbij ben je zo."],
        samen: async (l) => {
          zetP(l, { licht: ["lopen"] });
          await l.zeg("De bakkerij is vlakbij.", "Daar ben je zo.");
          zetP(l, { licht: ["werken"] });
          await l.zeg("Een hele dag duurt van de ochtend tot de avond.");
        },
        tip: ["Wat duurt van de ochtend tot de avond?", "Wat duurt langer?"],
      },
      t,
    ),
  (l, t) =>
    plaatjesVraag(
      l,
      {
        beeld: {},
        kaarten: twee({ id: "deeg", tekening: "deegkom", zeg: "deeg maken" }, { id: "suiker", tekening: "strooibus", zeg: "suiker strooien" }),
        goed: "suiker",
        vraag: ["Tim maakt deeg voor het brood.", "Daarna strooit hij suiker op de koeken.", "Wat duurt kort?"],
        goedZin: ["Suiker strooien duurt kort.", "Deeg maken duurt lang."],
        samen: async (l) => {
          zetP(l, { licht: ["deeg"] });
          await l.zeg("Voor deeg moet je lang kneden.");
          zetP(l, { licht: ["suiker"] });
          await l.zeg("Strooien doe je met een paar schudjes.");
        },
        tip: ["Wat is met een paar schudjes klaar?", "Wat duurt kort?"],
      },
      t,
    ),
  (l, t) =>
    plaatjesVraag(
      l,
      {
        beeld: {},
        kaarten: twee({ id: "versieren", tekening: "taart", zeg: "een taart versieren" }, { id: "kers", tekening: "kers", zeg: "een kers op de taart leggen" }),
        goed: "kers",
        vraag: ["Wat duurt korter: een taart versieren, of een kers op de taart leggen?"],
        goedZin: ["Een kers op de taart leggen duurt korter.", "Dat is in één tel gebeurd."],
        samen: async (l) => {
          zetP(l, { licht: ["versieren"] });
          await l.zeg("Bij versieren doe je veel: room, fruit, en nog meer.");
          zetP(l, { licht: ["kers"] });
          await l.zeg("Een kers leg je er in één keer op.");
        },
        tip: ["Wat doe je in één keer?", "Wat duurt korter?"],
      },
      t,
    ),
  (l, t) =>
    plaatjesVraag(
      l,
      {
        beeld: {},
        kaarten: twee({ id: "brood bakken", tekening: "oven", zeg: "brood bakken" }, { id: "koekje", tekening: "koekje", zeg: "een koekje eten" }),
        goed: "brood bakken",
        vraag: ["Nu bakt Tim brood in de oven.", "Daarna eet hij een koekje.", "Wat duurt ongeveer een uur?"],
        goedZin: ["Brood bakken duurt ongeveer een uur."],
        samen: async (l) => {
          await l.zeg("Een uur is best lang.", "Een koekje is in een paar happen op.");
        },
        tip: ["Wat duurt lang: bakken of eten?", "Wat duurt ongeveer een uur?"],
      },
      t,
    ),
  (l, t) =>
    plaatjesVraag(
      l,
      {
        beeld: {},
        kaarten: twee({ id: "ei koken", tekening: "ei", zeg: "een ei koken" }, { id: "taart bakken", tekening: "taartoven", zeg: "een taart bakken" }),
        goed: "taart bakken",
        vraag: ["Wat duurt langer: een ei koken, of een taart bakken?"],
        goedZin: ["Een taart bakken duurt langer.", "Een ei is in een paar minuten klaar."],
        samen: async (l) => {
          await l.zeg("Een ei is snel gaar.", "Een taart moet lang in de oven.");
        },
        tip: ["Wat moet lang in de oven?", "Wat duurt langer?"],
      },
      t,
    ),
  (l, t) =>
    plaatjesVraag(
      l,
      {
        beeld: {},
        kaarten: twee({ id: "vegen", tekening: "bezem", zeg: "de hele winkel vegen" }, { id: "slot", tekening: "sleutel", zeg: "de deur van het slot doen" }),
        goed: "slot",
        vraag: ["Straks komen er klanten.", "Tim doet de deur van het slot.", "En hij veegt de hele winkel.", "Wat duurt korter?"],
        goedZin: ["De deur van het slot doen duurt kort.", "De hele winkel vegen duurt langer."],
        samen: async (l) => {
          zetP(l, { licht: ["slot"] });
          await l.zeg("Een sleutel draai je in één keer om.");
          zetP(l, { licht: ["vegen"] });
          await l.zeg("Bij vegen moet je overal langs.");
        },
        tip: ["Wat doe je in één keer?", "Wat duurt korter?"],
      },
      t,
    ),
  (l, t) =>
    knopVraag(
      l,
      {
        beeld: { groot: "bakkerij" },
        opties: ["de rondleiding", "een broodje krijgen"],
        goed: "de rondleiding",
        vraag: ["Daar komt groep 3 op bezoek!", "Eerst krijgen ze een rondleiding door de hele bakkerij.", "Daarna krijgt iedereen een broodje.", "Wat duurt het langst?", "De rondleiding, of een broodje krijgen?"],
        goedZin: ["De rondleiding duurt het langst.", "Ze lopen langs de hele bakkerij."],
        samen: async (l) => {
          await l.zeg("Bij een rondleiding loop je overal langs.", "Een broodje krijgen is zo gebeurd.");
        },
        tip: ["Waarbij loop je langs de hele bakkerij?", "Wat duurt het langst?"],
      },
      t,
    ),
  (l, t) =>
    ordenVraag(
      l,
      {
        beeld: {},
        juist: ["beslag", "oven", "versierd"],
        vast: [],
        losse: [
          { id: "oven", tekening: "taartoven", zeg: "de taart in de oven" },
          { id: "versierd", tekening: "taartkaars", zeg: "de taart met een kaarsje" },
          { id: "beslag", tekening: "beslag", zeg: "het beslag in de kom" },
        ],
        vraag: ["Oh nee, er is een taart gevallen!", "Tim maakt een nieuwe.", "Zet de klusjes op volgorde."],
        goedZin: ["Eerst het beslag, dan de oven, dan versieren.", "Klaar!"],
        samen: async (l) => {
          zetP(l, { licht: ["beslag"] });
          await l.zeg("Hier zit het beslag nog in de kom.");
          zetP(l, { licht: ["oven"] });
          await l.zeg("Hier staat de taart in de oven.");
          zetP(l, { licht: ["versierd"] });
          await l.zeg("Hier is de taart klaar, met een kaarsje.", "Wat komt eerst?");
        },
        tip: ["Je kunt pas versieren als de taart gebakken is.", "Zet de klusjes op volgorde."],
        handje: true,
      },
      t,
    ),
  (l, t) =>
    plaatjesVraag(
      l,
      {
        beeld: {},
        kaarten: [
          { id: "water", tekening: "glas", zeg: "een glas water drinken" },
          { id: "broodjes", tekening: "brood", zeg: "honderd broodjes bakken" },
          { id: "lunchen", tekening: "boterham", zeg: "lunchen" },
        ],
        goed: "water",
        vraag: ["Tim gaat zo lunchen.", "Eerst drinkt hij een glas water.", "Vanmiddag bakt hij honderd broodjes.", "Wat duurt ongeveer een minuut?"],
        goedZin: ["Een glas water drinken duurt ongeveer een minuut.", "Honderd broodjes bakken duurt de hele middag."],
        samen: async (l) => {
          await l.zeg("Een minuut is heel kort.", "Wat is in zo'n korte tijd klaar?");
        },
        tip: ["Wat is het snelst klaar?", "Wat duurt ongeveer een minuut?"],
      },
      t,
    ),
  (l, t) =>
    knopVraag(
      l,
      {
        beeld: { groot: "brood" },
        opties: ["een week kamperen", "afwassen", "een boterham eten"],
        goed: "een week kamperen",
        vraag: ["Tim bakt de hele middag broodjes.", "Wat duurt langer dan een hele middag?", "Een week kamperen, afwassen, of een boterham eten?"],
        goedZin: ["Een week kamperen duurt veel langer.", "Een week heeft wel zeven dagen."],
        samen: async (l) => {
          await l.zeg("Een middag is een stuk van één dag.", "Een week is zeven dagen.");
        },
        tip: ["Wat duurt meer dan één dag?", "Wat duurt langer dan een hele middag?"],
      },
      t,
    ),
  (l, t) =>
    plaatjesVraag(
      l,
      {
        beeld: {},
        kaarten: twee({ id: "jas", tekening: "jas", zeg: "je jas aantrekken" }, { id: "keuken", tekening: "bezem", zeg: "de hele keuken vegen" }),
        goed: "jas",
        vraag: ["Tim gaat naar huis.", "Hij trekt zijn jas aan.", "Thuis veegt hij nog de hele keuken.", "Wat duurt ongeveer een minuut?"],
        goedZin: ["Je jas aantrekken duurt ongeveer een minuut."],
        samen: async (l) => {
          await l.zeg("Een minuut is heel kort.", "Bij vegen moet je overal langs.");
        },
        tip: ["Wat is het snelst klaar?", "Wat duurt ongeveer een minuut?"],
      },
      t,
    ),
];

const tijden2: Lesdraaiboek = {
  id: "squla-tijd-tijden-2",
  titel: "Tijden (moeilijker)",
  synthesis: "Squla groep 3 · Tijd · Tijden · level 2 (alleen leerdoel)",
  indeling: "synthesis",
  browserstem: true,
  kaarttekening: KaartTijden,
  async speel(l) {
    await welkomPlaatjes(l, "bakkerij", ["Hoi!", "Dit is de bakkerij van bakker Tim.", "We kijken wat lang duurt en wat kort duurt."], async () => {
      zetP(l, { groot: null, kaarten: twee({ id: "koekje", tekening: "koekje", zeg: "een koekje eten" }, { id: "slapen", tekening: "bed", zeg: "een nacht slapen" }) });
      zetP(l, { licht: ["koekje"] });
      await l.zeg("Een koekje eten duurt heel kort.");
      zetP(l, { licht: ["slapen"] });
      await l.zeg("Een nacht slapen duurt heel lang.");
      zetP(l, { kaarten: [], licht: [], groot: "bakkerij" });
      await l.zeg("Een minuut is kort.", "Een uur is langer.", "En een hele middag is nog langer.");
    });
    const fouten = await speelAlles(l, tijden2Opgaven, [0, 6, 9]);
    await squlaEind(l, fouten, "Je weet wat lang duurt en wat kort duurt.");
  },
};

export const LESSEN_SQULA_TIJD: Lesdraaiboek[] = [dagen1, dagen2, dagen3, kalender1, kalender2, tijden1, tijden2];
