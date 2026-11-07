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
 * De hulp is overal die van squla-hulp.ts (zoals Synthesis, 4 november 2026):
 * na 1 fout een korte reactie en meteen opnieuw; na 2 keer fout uitleg, het
 * goede antwoord in beeld en door. Geen keuzevraag, geen pauze en geen weet-ik-niet-knop.
 *
 * Groep 3 leest nog niet: Bliepo zegt elke vraag en noemt de keuzes als het
 * woorden zijn; kaartjes en knoppen lezen hun naam voor bij aanwijzen.
 */

import { krijgtVervolgvraag, bevestig, zetSynthesisHulp, terugAankondiging, terugAfsluiting } from "./squla-uitleg";
import { laadKlokken } from "../vlakken/squla-klok-tekenen";
import type { Lesdraaiboek, Lesgids } from "../soort";
import { squlaBegin, squlaEind, squlaVraag, zetTestAntwoord, type SqulaVraag } from "./squla-hulp";
import { SqulaTijdTrein, KaartWeektrein, dagNaam, kaartId, type DagKaart, type TreinProps } from "../vlakken/squla-tijd-trein";
import { SqulaTijdPlaatjes, KaartKalender, KaartTijden, type PDing, type PlaatjesProps } from "../vlakken/squla-tijd-plaatjes";
import { speelLesgeluid } from "@/lib/lesgeluiden";
import { TIJD_VOORWERPEN } from "../vlakken/squla-tijd-tekeningen";

/* ---------- gedeeld ---------- */

let teller = 0;
const volgend = () => ++teller;
const Hoofd = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/* Bij een goed antwoord alleen een korte bevestiging uit de gedeelde `bevestig()` (Sara, 4 nov); het waarom zit in het beeld. */
/** Eerste fout zonder eigen reactie: de tip, zonder de herhaalde vraag aan het eind (BOUWREGELS 3.23). */
const hint = (tip: string[]) => (tip.length > 1 && tip[tip.length - 1].trim().endsWith("?") ? tip.slice(0, -1) : tip);
/** Het goede antwoord in woorden, zonder losse vragen erin. */
const antwoordZinnen = (z: string[]) => z.filter((x) => !x.trim().endsWith("?"));
const AANTAL = ["Geen", "1", "2", "3", "4"];
/** Eerste fout bij op volgorde zetten: hoeveel liggen er goed. */
const telGoed = (n: number, wat: string, tip: string) => {
  /* wat = "dag" (de-woord) of "kaartje", "plaatje", "getal" (het-woord) */
  const meer = wat === "dag" ? "dagen" : wat === "getal" ? "getallen" : `${wat}s`;
  const geen = wat === "dag" ? "Geen enkele dag" : `Geen enkel ${wat}`;
  return [n === 0 ? `${geen} ligt op de goede plek.` : n === 1 ? `1 ${wat} ligt op de goede plek.` : `${AANTAL[n]} ${meer} liggen op de goede plek.`, tip];
};

type Mis = Record<string, string[]> | ((x: string) => string[]);
/** Zet per vraag een eigen reactie op de eerste fout (sleutel = het gekozen antwoord). */
function metReactie(ops: Opgave[], mis: (Mis | undefined)[]): Opgave[] {
  return ops.map((op, i) => (l, t) => {
    const v = op(l, t);
    const m = mis[i];
    return m ? { ...v, reactie: typeof m === "function" ? m : (x: string) => m[x] ?? hint(v.tip) } : v;
  });
}
/** Een andere volgorde van de keuzes (bij een vraag die terugkomt). */
const schuif = <T,>(lijst: T[], keer: boolean) => (keer ? [...lijst.slice(1), lijst[0]] : lijst);

/*
  Het goede antwoord staat niet steeds op dezelfde plek (BOUWREGELS 1.23, Sara 7 november 2026): elke les-start een
  nieuw toeval-zaadje, en daarmee per vraag een willekeurige volgorde van de keuzes. Binnen één les-start houdt een vraag
  zijn volgorde (het voorbeeld op het beginscherm en de vraag zien er hetzelfde uit). Alleen de plek verandert; de
  antwoorden, de beoordeling, de hints en de score blijven gelijk.
*/
let tijdZaad = 1;
const nieuwTijdZaad = () => {
  tijdZaad = (Math.random() * 2 ** 31) | 0;
};
function toevalT(tekst: string) {
  let h = 2166136261 ^ tijdZaad;
  for (const ch of tekst) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/** De keuzes in een willekeurige volgorde (per les-start, per vraag; een vraag die terugkomt krijgt een andere). */
const schud = <T,>(lijst: T[], keer: boolean, extra = ""): T[] => {
  const r = toevalT(`${JSON.stringify(lijst)}|${keer ? "t" : ""}|${extra}`);
  const v = [...lijst];
  for (let i = v.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [v[i], v[j]] = [v[j], v[i]];
  }
  return v;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Opgave = (l: Lesgids, terug: boolean) => SqulaVraag<any>;

/** Verhaal en vraag samen in beeld (BOUWREGELS 14.25): anders valt het verhaal weg en blijft alleen het ding over. */
function alsEenBlok<V extends { vraag: string[] }>(v: V): V {
  return v.vraag.length > 1 ? { ...v, vraag: [v.vraag.join(" ")] } : v;
}

/**
 * Alle opgaven, en dan drie vragen die terugkomen: eerst de vragen die niet
 * meteen goed waren (zoals Squla), aangevuld met vaste vragen (`reserve`).
 * Geeft het aantal vragen dat niet meteen goed was.
 */
async function speelAlles(l: Lesgids, opgaven: Opgave[], reserve: number[], voorbeeldAfgerond = false): Promise<number> {
  let fouten = 0;
  const mis: number[] = [];
  for (let i = voorbeeldAfgerond ? 1 : 0; i < opgaven.length; i++) {
    if (!(await squlaVraag(l, { ...alsEenBlok(opgaven[i](l, false)), synthesis: true }))) {
      fouten++;
      mis.push(i);
    }
  }
  const terug = [...mis, ...reserve.filter((i) => !mis.includes(i))].slice(0, 3);
  await l.zeg(terugAankondiging(terug.length));
  let weerFout = 0;
  for (const i of terug) {
    if (!(await squlaVraag(l, { ...alsEenBlok(opgaven[i](l, true)), synthesis: true }))) {
      fouten++;
      weerFout++;
    }
  }
  if (weerFout) await l.zeg(terugAfsluiting());
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
  plaatjeStand: null,
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
let ritNr = 0;

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
  /** Eerste fout: wat Bliepo zegt over de gekozen dag(en). */
  reactie?: (gekozen: number[]) => string[];
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
      await l.zeg(bevestig());
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
    reactie: (x) => {
      const d = o.kaarten.find((k) => kaartId(k) === x);
      return d && o.reactie ? o.reactie(d) : hint(o.tip);
    },
    toonAntwoord: async () => {
      zetT(l, { fout: [], kaartLicht: [], goed: [goedId], golf: { id: goedId, n: ++golfNr }, ...(o.naGoed ?? {}) });
      await l.zeg(...antwoordZinnen(o.goedZin));
      await l.wacht(300);
    },
    testAntwoord: goedId,
  };
}

/** Een vraag met getallen als antwoord (knoppen bij Bliepo). */
function getalVraagT(l: Lesgids, o: { beeld: Partial<TreinProps>; opties: number[]; goed: number; vraag: string[]; goedZin: string[]; samen: (l: Lesgids) => Promise<void>; hulpBeeld: Partial<TreinProps>; tip: string[]; naGoed?: Partial<TreinProps>; reactie?: (x: string) => string[] }): SqulaVraag<string> {
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
      await l.zeg(bevestig());
      await l.wacht(300);
    },
    samen: async () => {
      zetT(l, { ...LEEG_T });
      await o.samen(l);
      naSamen = true;
    },
    tip: o.tip,
    reactie: (x) => (o.reactie ? o.reactie(x) : hint(o.tip)),
    toonAntwoord: async () => {
      if (o.naGoed) zetT(l, o.naGoed);
      await l.zeg(...antwoordZinnen(o.goedZin));
      await l.wacht(300);
    },
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
      kaarten: schud(kaarten, terug).map((k) => [k]),
      goed: [a],
      vraag,
      goedZin: [`Na ${naam(d)} komt ${naam(a)}.`],
      naGoed: { trein: [d, a] },
      samen: async (l) => {
        zetT(l, { trein: ALLE });
        await l.zeg("Hier komt de hele week voorbij.", "Luister maar.");
        await zegDagen(l, 0, d);
        if (d === 6) {
          /* Eén rondje tegelijk (BOUWREGELS 7.8): eerst zondag, dan maandag; bij de vraag is het rondje weg (anders wijst het het antwoord aan). */
          zetT(l, { licht: [6] });
          await l.zeg("Zondag is de laatste wagon.");
          zetT(l, { licht: [0] });
          await l.zeg("Daarna begint de week weer bij maandag.");
          zetT(l, { licht: [] });
          if (!krijgtVervolgvraag(l)) await l.zeg("Welke dag staat vooraan in de trein?");
        } else {
          zetT(l, { licht: [d] });
          if (!krijgtVervolgvraag(l)) await l.zeg(`Welke wagon staat achter ${naam(d)}?`);
        }
      },
      hulpBeeld: { trein: ALLE, licht: d === 6 ? [6] : [d] },
      tip: d === 6 ? ["Na de laatste dag begint de week opnieuw.", ...vraag] : [`Zoek ${naam(d)} en ga 1 wagon verder.`, ...vraag],
      reactie: ([c]) => [
        c === d ? `${Naam(d)} is de wagon waar je mee begint.` : c === voor(d) ? `${Naam(c)} hangt vóór ${naam(d)}, niet erachter.` : `Achter ${naam(d)} hangt niet ${naam(c)}.`,
        d === 6 ? "Na zondag begint de week weer bij de eerste wagon." : `Kijk welke wagon vlak achter ${naam(d)} hangt.`,
      ],
    });
  };
}

function welkeVoor(d: number, kaarten: number[]): Opgave {
  return (l, terug) => {
    const a = voor(d);
    const vraag = [`Welke dag komt vlak voor ${naam(d)}?`];
    return dagVraag(l, {
      beeld: { trein: [null, d] },
      kaarten: schud(kaarten, terug).map((k) => [k]),
      goed: [a],
      vraag,
      goedZin: [`Vlak voor ${naam(d)} komt ${naam(a)}.`],
      naGoed: { trein: [a, d] },
      samen: async (l) => {
        zetT(l, { trein: ALLE });
        await l.zeg("Let op! Nu zoeken we de dag ervoor.", "We lopen de hele week langs.");
        if (d === 0) {
          zetT(l, { licht: [0] });
          await l.zeg("Maandag is de eerste wagon.", "Daarvoor was de vorige week.");
          zetT(l, { licht: [6] });
          await l.zeg("Die week eindigde met de laatste wagon.");
        } else {
          await l.zeg("Luister maar.");
          await zegDagen(l, 0, d);
          if (!krijgtVervolgvraag(l)) await l.zeg(`Welke wagon staat vlak voor ${naam(d)}?`);
        }
      },
      hulpBeeld: { trein: ALLE, licht: d === 0 ? [0] : [d] },
      tip: d === 0 ? ["Voor maandag staat geen wagon. Dan hoort de vorige week erbij.", ...vraag] : [`Zoek ${naam(d)} en ga 1 wagon terug.`, ...vraag],
      reactie: ([c]) => [
        c === d ? `${Naam(d)} is de wagon waar je mee begint.` : c === na(d) ? `${Naam(c)} hangt ná ${naam(d)}, niet ervoor.` : `Vlak voor ${naam(d)} hangt niet ${naam(c)}.`,
        d === 0 ? "Voor maandag hangt de laatste wagon van de vorige week." : `Kijk welke wagon vlak voor ${naam(d)} hangt.`,
      ],
    });
  };
}

/* --- level 1: de opbouw van de week --- */

function eersteDag(): Opgave {
  return (l, terug) => {
    const vraag = ["Wat is de eerste dag van de week?"];
    return dagVraag(l, {
      beeld: { trein: LEEG_TREIN },
      kaarten: schud([[2], [0], [6]], terug),
      goed: [0],
      vraag,
      goedZin: ["Maandag is de eerste dag van de week.", "Dan begint de school weer."],
      naGoed: { trein: [0, null, null, null, null, null, null] },
      samen: async (l) => {
        zetT(l, { trein: ALLE });
        await l.zeg("Bekijk de trein van voren naar achteren.");
        zetT(l, { licht: [0] });
        await l.zeg("De eerste dag staat vooraan, vlak achter de locomotief.", "Op die dag begint de school weer.");
      },
      hulpBeeld: { trein: ALLE, licht: [0] },
      tip: ["Kijk naar de wagon die direct aan de locomotief hangt.", ...vraag],
      reactie: ([c]) => [c === 6 ? "Zondag is de laatste dag van de week, niet de eerste." : `${Naam(c)} is niet de eerste dag.`, "De eerste dag hangt direct aan de locomotief."],
    });
  };
}

function laatsteDag(): Opgave {
  return (l, terug) => {
    const vraag = ["Wat is de laatste dag van de week?"];
    return dagVraag(l, {
      beeld: { trein: LEEG_TREIN },
      kaarten: schud([[5], [1], [6]], terug),
      goed: [6],
      vraag,
      goedZin: ["Zondag is de laatste dag van de week.", "Na zondag begint er weer een nieuwe week."],
      naGoed: { trein: [null, null, null, null, null, null, 6] },
      samen: async (l) => {
        zetT(l, { trein: ALLE });
        await l.zeg("Loop de trein af tot de allerlaatste wagon.");
        zetT(l, { licht: [6] });
        await l.zeg("De laatste dag staat helemaal achteraan.", "Daarachter staat geen wagon meer. Dan begint de week opnieuw.");
      },
      hulpBeeld: { trein: ALLE, licht: [6] },
      tip: ["Kijk naar de wagon helemaal achteraan.", ...vraag],
      reactie: ([c]) => [c === 5 ? "Zaterdag is de dag vóór de laatste dag." : `${Naam(c)} is niet de laatste dag.`, "Kijk naar de wagon helemaal achteraan."],
    });
  };
}

function weekendHoeveel(): Opgave {
  return (l, terug) => {
    const vraag = ["In het weekend ga je niet naar school.", "Hoeveel dagen heeft het weekend?"];
    return getalVraagT(l, {
      /* Tijdens de vraag alleen de locomotief; pas na het antwoord rijdt de hele trein binnen met een rondje om het weekend
         (BOUWREGELS 1.22: de lege trein deed niets). */
      beeld: { trein: [] },
      opties: schud([1, 2, 5], terug),
      goed: 2,
      vraag,
      goedZin: ["Het weekend heeft {2:wit} dagen."],
      naGoed: { trein: ALLE, licht: [5, 6], rit: ++ritNr },
      samen: async (l) => {
        zetT(l, { trein: ALLE, licht: [0, 1, 2, 3, 4] });
        await l.zeg("Kijk naar de trein.", "Eerst ga je {5:wit} dagen naar school.");
        zetT(l, { licht: [5, 6] });
        await l.zeg("Daarna komt het weekend.", "Tel de wagons die nu oplichten.");
      },
      hulpBeeld: { trein: ALLE, licht: [5, 6] },
      tip: ["Tel de wagons achter vrijdag.", "Hoeveel dagen heeft het weekend?"],
      reactie: (x) => [x === "5" ? "Op 5 dagen ga je naar school. Het weekend telt apart." : "Zaterdag is maar 1 dag. Er komt nog een dag achter.", "Tel de wagons achter vrijdag."],
    });
  };
}

function weekendWelke(): Opgave {
  return (l, terug) => {
    const vraag = ["Op welke dagen is het weekend?"];
    return dagVraag(l, {
      beeld: { trein: LEEG_TREIN },
      kaarten: schud([[3, 4], [5, 6], [6, 0]], terug),
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
      tip: ["De laatste 2 dagen van de week zijn het weekend.", ...vraag],
      reactie: (c) => {
        const school = c.filter((x) => x < 5);
        return [school.length === 2 ? `${Naam(school[0])} en ${naam(school[1])} zijn schooldagen.` : `${Naam(school[0])} is een schooldag.`, "Het weekend is zaterdag en zondag."];
      },
    });
  };
}

function hoeveelWeek(): Opgave {
  return (l, terug) =>
    getalVraagT(l, {
      /* Geen los vraagteken meer: tijdens de vraag alleen de locomotief, en pas na het antwoord rijdt de trein met 7 wagons
         binnen (BOUWREGELS 1.22; vóór het antwoord zou hij het antwoord verklappen). */
      beeld: { trein: [] },
      opties: schud([6, 7, 8], terug),
      goed: 7,
      vraag: ["Hoeveel dagen heeft een week?"],
      goedZin: ["Een week heeft {7:wit} dagen.", "Van maandag tot en met zondag."],
      naGoed: { plaatje: null, trein: ALLE, rit: ++ritNr },
      samen: async (l) => {
        zetT(l, { trein: ALLE });
        await l.zeg("Elke wagon is 1 dag.", "Tel maar mee.");
        await zegDagen(l, 0, 6);
        zetT(l, { licht: [] });
        if (!krijgtVervolgvraag(l)) await l.zeg("Hoeveel wagons waren dat?");
      },
      hulpBeeld: { trein: ALLE },
      tip: ["Tel de wagons van maandag tot en met zondag.", "Hoeveel dagen heeft een week?"],
      reactie: (x) => [Number(x) < 7 ? "Er zijn meer wagons dan dat." : "Er zijn minder wagons dan dat.", "Tel de wagons van maandag tot en met zondag, één voor één."],
    });
}

async function welkomTrein(l: Lesgids, welkom: string[], uitleg: () => Promise<void>, voorbeeld?: Opgave) {
  nieuwTijdZaad();
  zetSynthesisHulp(l);
  l.vlak<TreinProps>(SqulaTijdTrein, { ...LEEG_T, nr: volgend(), trein: ALLE, rit: 1 });
  speelLesgeluid("verschijn");
  await l.wacht(900);
  const voorbeeldAfgerond = await squlaBegin(l, {
    welkom,
    /* Na "Nee" begint de uitleg weer met de hele trein (het voorbeeld verdwijnt). */
    voordoen: l.lesId !== "squla-tijd-dagen-1",
    samen: voorbeeld ? async () => {
      if (l.lesId === "squla-tijd-dagen-1") {
        zetT(l, { ...LEEG_T, nr: volgend(), trein: ALLE });
        await l.zeg("We lopen samen langs de weektrein. Elke wagon is 1 dag.");
        await zegDagen(l, 0, 6);
        /* Het rondje volgt Bliepo: bij "maandag" staat het rondje om maandag (niet meer om zondag). */
        zetT(l, { licht: [0] });
        await l.zeg("De week begint op maandag.");
        await squlaVraag(l, eersteDag()(l, false));
        await l.zeg("Zaterdag en zondag vormen samen het weekend.");
        await squlaVraag(l, weekendWelke()(l, false));
      } else await squlaVraag(l, voorbeeld(l, false));
    } : undefined,
    uitleg: voorbeeld
      ? async () => {
          zetT(l, { ...LEEG_T, nr: volgend(), trein: ALLE });
          await uitleg();
        }
      : uitleg,
    /* Het beginscherm laat de eerste opgave van de les zien (BOUWREGELS 4.1). */
    ...(voorbeeld ? { voorbeeld: () => voorbeeld(l, false).toon?.() } : {}),
  });
  return voorbeeldAfgerond;
}

const dagen1: Lesdraaiboek = {
  nacht: true,
  id: "squla-tijd-dagen-1",
  titel: "Dagen van de week",
  synthesis: "Squla groep 3 · Tijd · Dagen van de week · level 1 (alleen leerdoel)",
  indeling: "synthesis",
  browserstem: true,
  voorwerpen: TIJD_VOORWERPEN,
  kaarttekening: KaartWeektrein,
  async speel(l) {
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
const voorbeeldAfgerond = await welkomTrein(l, ["De weektrein heeft 7 wagons.", "Wat is de eerste dag van de week?"], async () => {
      await l.zeg("Kijk mee.");
      await zegDagen(l, 0, 6);
      zetT(l, { licht: [0] });
      await l.zeg("De week begint met maandag.");
      zetT(l, { licht: [6] });
      await l.zeg("De week eindigt met zondag.");
      zetT(l, { licht: [5, 6] });
      await l.zeg("Zaterdag en zondag zijn het weekend.", "Dan is er geen school.");
      zetT(l, { licht: [] });
    }, opgaven[0]);
    const fouten = await speelAlles(l, opgaven, [0, 2, 8], voorbeeldAfgerond);
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
  voorwerpen: TIJD_VOORWERPEN,
  kaarttekening: KaartWeektrein,
  async speel(l) {
        const na6: Opgave[] = [welkeNa(1, [3, 2, 0, 5]), welkeNa(5, [6, 4, 0, 1]), welkeNa(3, [2, 5, 4, 0]), welkeNa(6, [5, 0, 1, 3]), welkeNa(0, [2, 6, 1, 4]), welkeNa(4, [6, 3, 5, 1])];
    const voor6: Opgave[] = [welkeVoor(2, [3, 1, 0, 4]), welkeVoor(5, [6, 4, 3, 2]), welkeVoor(4, [3, 5, 2, 6]), welkeVoor(0, [1, 6, 5, 2]), welkeVoor(1, [2, 3, 0, 6]), welkeVoor(6, [0, 5, 4, 1])];
    /* Bij de eerste vraag naar de dag ervoor zegt Bliepo het vooraf (Squla waarschuwt daar ook). */
    const eersteVoor: Opgave = (l, terug) => {
      const v = voor6[0](l, terug);
      return { ...v, vraag: terug ? v.vraag : ["Let op! Nu zoeken we de dag ervoor.", ...v.vraag] };
    };
const voorbeeldAfgerond = await welkomTrein(l, ["Elke wagon in de trein is een dag.", "Welke dag komt meteen na dinsdag?"], async () => {
      zetT(l, { licht: [2] });
      await l.zeg("Kijk naar woensdag.");
      /* Eén rondje tegelijk, op wat Bliepo noemt (BOUWREGELS 7.8). */
      zetT(l, { licht: [3] });
      await l.zeg("De dag erna staat erachter: donderdag.");
      await l.zeg("Kijk naar donderdag.");
      zetT(l, { licht: [2] });
      await l.zeg("De dag ervoor staat ervoor: woensdag.");
      zetT(l, { licht: [6] });
      await l.zeg("Dit is zondag, de laatste dag.");
      zetT(l, { licht: [0] });
      await l.zeg("Daarna begint de week weer met maandag.");
      zetT(l, { licht: [] });
    }, na6[0]);
    const fouten = await speelAlles(l, [...na6, eersteVoor, ...voor6.slice(1)], [3, 6, 9], voorbeeldAfgerond);
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
    const vraag = ["Zet de 4 dagen op de goede volgorde."];
    const orden = (actief: boolean, uitslag?: (boolean | null)[]) => ({ vakken: [...vakken], losse: kaarten, uitslag, actief });
    return {
      toon: () => {
        /* Wat al goed lag, blijft liggen; de rest gaat terug. */
        vakken = vakken.map((v, i) => (v === juist[i] ? v : null));
        zetT(l, { ...LEEG_T, nr, ...(naSamen ? { trein: ALLE, treinKlein: true, licht: juist } : {}), orden: orden(false) });
      },
      vraag: eerste ? [...vraag, "Sleep een kaart naar een leeg vak.", "Tikken mag ook."] : vraag,
      antwoord: async () => {
        /* na een fout blijft wat goed lag liggen en gaat de rest terug */
        vakken = vakken.map((v, i) => (v === juist[i] ? v : null));
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
        await l.zeg(bevestig());
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
        await l.zeg("Zoek de 4 dagen in de trein. De trein laat zien in welke volgorde ze komen.", "Kijk welke dag vooraan staat.");
        if (juist.includes(6) && juist.includes(0)) await l.zeg("Let op: na zondag begint de trein weer bij maandag.");
        naSamen = true;
      },
      tip: ["Kijk welke dag het eerst komt.", ...vraag],
      reactie: (x: (number | null)[]) => telGoed(x.filter((d, i) => d === juist[i]).length, "dag", "Kijk in de trein welke dag het eerst komt."),
      toonAntwoord: async () => {
        vakken = [...juist];
        zetT(l, { trein: ALLE, treinKlein: true, licht: juist, orden: orden(false, [true, true, true, true]) });
        await l.zeg(`${Hoofd(juist.map(naam).join(", "))}.`);
        await l.wacht(300);
      },
      testAntwoord: naam(juist[0]),
    } as SqulaVraag<(number | null)[]>;
  };
}

/** `stand`: wat het plaatje doet (BOUWREGELS 1.22): "sfeer" = klein en zacht op de achtergrond; "komt" = eerst klein in de verte, na het antwoord komt het dichtbij; "weg" = geen plaatje. */
type Verhaal = { reactie?: (c: number) => string[]; vandaag: number; goed: number; kaarten: number[]; plaatje: string; stand?: "sfeer" | "komt" | "weg"; zinnen: string[]; goedZin: string[]; samen: (l: Lesgids) => Promise<void>; hulp: Partial<TreinProps>; tip: string };

function verhaal(v: Verhaal): Opgave {
  return (l, terug) =>
    dagVraag(l, {
      beeld: { plaatje: v.stand === "weg" ? null : v.plaatje, plaatjeStand: v.stand === "sfeer" ? "sfeer" : v.stand === "komt" ? "verte" : null, vandaagKaart: v.vandaag },
      kaarten: schud(v.kaarten, terug).map((k) => [k]),
      goed: [v.goed],
      vraag: v.zinnen,
      goedZin: v.goedZin,
      ...(v.stand === "komt" ? { naGoed: { plaatjeStand: "komt" as const } } : {}),
      samen: async (l) => {
        zetT(l, { trein: ALLE, vandaag: v.vandaag });
        await l.zeg(`Kijk, de gele pijl staat bij ${naam(v.vandaag)}.`, "De pijl wijst de dag van nu aan.");
        await v.samen(l);
      },
      hulpBeeld: { trein: ALLE, vandaag: v.vandaag, ...v.hulp },
      tip: [v.tip, v.zinnen[v.zinnen.length - 1]],
      reactie: ([c]) => (v.reactie ? [...v.reactie(c), v.tip] : [v.tip]),
    });
}

const verhalen: Opgave[] = [
  verhaal({
    reactie: (c) => [c === 2 ? "Woensdag is morgen. Dan is het zwembad nog dicht." : c === 1 ? "Dinsdag is vandaag." : "Vrijdag is een dag te laat."],
    vandaag: 1,
    goed: 3,
    kaarten: [2, 3, 4, 1],
    plaatje: "zwemmen",
    stand: "sfeer",
    zinnen: ["Vandaag is het dinsdag.", "Morgen is het zwembad dicht.", "De dag daarna gaat het zwembad open.", "Op welke dag gaat het zwembad open?"],
    goedZin: ["Morgen is het woensdag.", "De dag daarna is het donderdag."],
    samen: async (l) => {
      zetT(l, { stappen: [1, 2], licht: [2] });
      await l.zeg("Morgen is het woensdag.", "Dan is het zwembad nog dicht.", ...(krijgtVervolgvraag(l) ? [] : ["Welke dag komt na woensdag?"]));
    },
    hulp: { stappen: [1, 2] },
    tip: "Eerst morgen, en dan nog 1 dag verder.",
  }),
  verhaal({
    reactie: (c) => [c === 3 ? "Donderdag is morgen. Dan is de kapperszaak nog dicht." : c === 5 ? "Zaterdag is een dag te laat." : "Dinsdag was gisteren."],
    vandaag: 2,
    goed: 4,
    kaarten: [3, 5, 4, 1],
    plaatje: "schaar",
    stand: "sfeer",
    zinnen: ["Vandaag is het woensdag.", "Morgen is de kapperszaak dicht.", "De dag daarna gaat de kapperszaak open.", "Op welke dag gaat de kapperszaak open?"],
    goedZin: ["Morgen is het donderdag.", "De dag daarna is het vrijdag."],
    samen: async (l) => {
      zetT(l, { stappen: [2, 3], licht: [3] });
      await l.zeg("Morgen is het donderdag.", "Dan is de kapperszaak nog dicht.", ...(krijgtVervolgvraag(l) ? [] : ["Welke dag komt daarna?"]));
    },
    hulp: { stappen: [2, 3] },
    tip: "Eerst morgen, en dan nog 1 dag verder.",
  }),
  verhaal({
    reactie: (c) => [c === 5 ? "Na 2 nachtjes is het zaterdag. Er komt nog 1 nachtje bij." : c === 0 ? "Maandag is 1 nachtje te ver." : "Vrijdag is na 1 nachtje."],
    vandaag: 3,
    goed: 6,
    kaarten: [5, 6, 0, 4],
    plaatje: "tent",
    stand: "komt",
    zinnen: ["Vandaag is het donderdag.", "Over {3:wit} nachtjes begint het kamp.", "Op welke dag begint het kamp?"],
    goedZin: ["Na {3:wit} nachtjes slapen is het zondag."],
    samen: async (l) => {
      zetT(l, { stappen: [3, 4], licht: [4] });
      await l.zeg("Na {1:wit} nachtje slapen is het vrijdag.");
      zetT(l, { stappen: [3, 4, 5], licht: [5] });
      await l.zeg("Na nog 1 nachtje is het zaterdag.");
      await l.zeg("Nu nog 1 nachtje.", ...(krijgtVervolgvraag(l) ? [] : ["Welke dag is het dan?"]));
    },
    hulp: { stappen: [3, 4, 5] },
    tip: "Tel 3 nachtjes vanaf donderdag.",
  }),
  verhaal({
    reactie: (c) => [c === 4 ? "Vrijdag was 2 dagen geleden." : `${Naam(c)} komt ná zondag. Gisteren komt vóór vandaag.`],
    vandaag: 6,
    goed: 5,
    kaarten: [4, 5, 0, 1],
    plaatje: "huis",
    stand: "sfeer",
    zinnen: ["Vandaag is het zondag.", "Gisteren werd het huis geschilderd.", "Op welke dag werd het huis geschilderd?"],
    goedZin: ["Gisteren was het zaterdag."],
    samen: async (l) => {
      await l.zeg("Gisteren is de dag ervoor.", ...(krijgtVervolgvraag(l) ? ["Kijk naar de wagon vlak voor zondag."] : ["Welke wagon hangt vlak voor zondag?"]));
    },
    hulp: {},
    tip: "Gisteren is de dag vlak voor vandaag.",
  }),
  verhaal({
    reactie: (c) => [c === 4 ? "Vrijdag was gisteren. Toen was het feest." : c === 2 ? "Woensdag is een dag te vroeg." : "Zondag komt ná zaterdag."],
    vandaag: 5,
    goed: 3,
    kaarten: [4, 3, 2, 6],
    plaatje: "taart",
    stand: "sfeer",
    zinnen: ["Vandaag is het zaterdag.", "Gisteren was het feest.", "De dag daarvoor stond de taart in de oven.", "Op welke dag stond de taart in de oven?"],
    goedZin: ["Gisteren was het vrijdag.", "De dag daarvoor was het donderdag."],
    samen: async (l) => {
      zetT(l, { stappen: [5, 4], licht: [4] });
      await l.zeg("Vrijdag hangt vlak voor zaterdag.", "Toen was het feest.", ...(krijgtVervolgvraag(l) ? [] : ["Welke dag komt vlak voor vrijdag?"]));
    },
    hulp: { stappen: [5, 4] },
    tip: "Eerst gisteren, en dan nog 1 dag terug.",
  }),
  verhaal({
    reactie: (c) => [c === 1 ? "Dinsdag is na 1 nachtje." : c === 3 ? "Donderdag is 1 nachtje te ver." : "Vrijdag is 2 nachtjes te ver."],
    vandaag: 0,
    goed: 2,
    kaarten: [1, 2, 3, 4],
    plaatje: "bed",
    stand: "sfeer",
    zinnen: ["Vandaag is het maandag.", "Het bed staat klaar.", "Over {2:wit} nachtjes is het slaapfeest.", "Op welke dag is het slaapfeest?"],
    goedZin: ["Na {2:wit} nachtjes slapen is het woensdag."],
    samen: async (l) => {
      zetT(l, { stappen: [0, 1], licht: [1] });
      await l.zeg("Na {1:wit} nachtje slapen is het dinsdag.");
      await l.zeg("Nu nog 1 nachtje.", ...(krijgtVervolgvraag(l) ? [] : ["Welke dag is het dan?"]));
    },
    hulp: { stappen: [0, 1] },
    tip: "Tel 2 nachtjes vanaf maandag.",
  }),
];

const dagen3: Lesdraaiboek = {
  nacht: true,
  id: "squla-tijd-dagen-3",
  titel: "Dagen van de week (nog moeilijker)",
  synthesis: "Squla groep 3 · Tijd · Dagen van de week · level 3 (alleen leerdoel)",
  indeling: "synthesis",
  browserstem: true,
  voorwerpen: TIJD_VOORWERPEN,
  kaarttekening: KaartWeektrein,
  async speel(l) {
        const opgaven: Opgave[] = [
      opVolgorde(3, [5, 3, 6, 4], true),
      opVolgorde(0, [2, 0, 3, 1]),
      opVolgorde(6, [1, 2, 6, 0]),
      opVolgorde(2, [4, 5, 2, 3]),
      opVolgorde(5, [0, 6, 1, 5]),
      opVolgorde(1, [3, 1, 4, 2]),
      ...verhalen,
    ];
const voorbeeldAfgerond = await welkomTrein(l, ["4 dagen liggen door elkaar.", "Zet de 4 dagen op de goede volgorde."], async () => {
      await l.zeg("De dagen staan altijd in dezelfde volgorde.");
      zetT(l, { licht: [6] });
      await l.zeg("Dit is zondag, de laatste dag.");
      zetT(l, { licht: [0] });
      await l.zeg("Daarna begint de week weer bij maandag.");
      zetT(l, { licht: [], vandaag: 2 });
      await l.zeg("Stel, vandaag is het woensdag.", "Kijk, de gele pijl.");
      zetT(l, { licht: [1] });
      await l.zeg("Gisteren was het dinsdag.");
      zetT(l, { licht: [3] });
      await l.zeg("Morgen is het donderdag.");
      zetT(l, { licht: [], vandaag: null });
      await l.zeg("Elke nacht slapen ben je een dag verder.");
    }, opgaven[0]);
    const fouten = await speelAlles(l, opgaven, [0, 6, 8], voorbeeldAfgerond);
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
  sfeer: null,
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

/** "Je koos …": het gekozen antwoord noemen in de eerste reactie (dagen en maanden houden hun hoofdletter). */
const jeKoos = (naam: string): string => {
  const kaal = naam.replace(/\.$/, "");
  const eigen = /^(maandag|dinsdag|woensdag|donderdag|vrijdag|zaterdag|zondag|januari|februari|maart|april|mei|juni|juli|augustus|september|oktober|november|december)/i.test(kaal);
  return `Je koos ${eigen || /^[{\d]/.test(kaal) ? kaal : kaal.charAt(0).toLowerCase() + kaal.slice(1)}.`;
};

/** Een vraag met plaatjes (kaartjes in het vlak). */
function plaatjesVraag(l: Lesgids, o: PlaatjesVraag, terug: boolean): SqulaVraag<string> {
  const nr = volgend();
  const kaarten = schud(o.kaarten, terug);
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
      await l.zeg(bevestig());
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
    reactie: (x) => [jeKoos(naamVan(x)), ...hint(o.tip)],
    toonAntwoord: async () => {
      zetP(l, { fout: [], licht: [], goed: [o.goed], golf: { id: o.goed, n: ++golfNr } });
      await l.zeg(...antwoordZinnen(o.goedZin));
      await l.wacht(300);
    },
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
  const opties = schud(o.opties, terug);
  return {
    toon: () => zetP(l, { ...LEEG_P, nr, ...o.beeld, ...(naSamen ? (o.hulpBeeld ?? {}) : {}) }),
    vraag: o.vraag,
    /* lange keuzes (zinnetjes) onder elkaar en even breed (Sara, 7 november 2026) */
    antwoord: async () => (await l.kies(opties, { weetniet: false, direct: true, ...(opties.some((x) => x.length > 12) ? { onderElkaar: true } : {}) })) ?? "",
    isGoed: (x) => x === o.goed,
    noem: (x) => (/^\d+$/.test(x) ? `{${x}:wit}` : Hoofd(x.replace(/\.$/, ""))),
    goed: async () => {
      await l.zeg(bevestig());
      await l.wacht(300);
    },
    samen: async () => {
      await o.samen(l);
      zetP(l, { licht: [] });
      naSamen = true;
    },
    tip: o.tip,
    reactie: (x) => [jeKoos(/^\d+$/.test(x) ? `{${x}:wit}` : x), ...hint(o.tip)],
    toonAntwoord: async () => {
      await l.zeg(...antwoordZinnen(o.goedZin));
      await l.wacht(300);
    },
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
      /* na een fout blijft wat goed lag liggen en gaat de rest terug */
      vakken = vakken.map((v, i) => (v === o.juist[i] ? v : null));
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
      await l.zeg(bevestig());
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
    reactie: (x) => telGoed(x.filter((id, i) => !o.vast.includes(i) && id === o.juist[i]).length, "kaartje", o.tip[0]),
    toonAntwoord: async () => {
      vakken = [...o.juist];
      zetP(l, { orden: orden(false, o.juist.map((_, i) => (o.vast.includes(i) ? null : true))) });
      await l.zeg(...antwoordZinnen(o.goedZin));
      await l.wacht(300);
    },
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

const KAL1_MIS: (Mis | undefined)[] = [
  { klok: ["Op een klok zie je hoe laat het is, niet wat er gebeurt."], maandkalender: ["Op de kalender van juni staan alle dagen, maar niet wat er vandaag gebeurt."] },
  { gym: ["Gym is niet het eerste plaatje.", "Kijk naar het plaatje helemaal links."] },
  { "buiten spelen": ["Buiten spelen is het derde plaatje.", "Kijk naar het plaatje direct naast de kring."] },
  { klok: ["Op de klok staan geen dagen.", "Let op de kalender met een hoepel."], maandkalender: ["Op de kalender van juni staan alle dagen van de maand.", "Let op de kalender met een hoepel."] },
  { "niet waar": ["Kijk nog eens naar de kalender.", "Bovenaan staan de dagen en onder elke dag staan getallen."] },
  { "1 uur": ["Een uur zie je op een klok.", "Een vakje op de kalender is veel langer."], "1 week": ["Een week heeft 7 vakjes.", "1 vakje is minder."] },
  { "20": ["Het rode vak staat niet bij de {20:wit}."], "13": ["Bij de {13:wit} staat het feesthoedje, niet het rode vak."] },
  { "8": ["De {8:rood} heeft de rode rand, niet het feesthoedje."], "20": ["Bij de {20:wit} staat geen feesthoedje."] },
  undefined,
  { boek: ["In een boek staan verhalen, geen feestdagen."], feesthoedje: ["Een feesthoedje hoort bij een feest, maar het is geen kalender."] },
  { week: ["Op dit blad staat maar 1 week."], maand: ["Dit is de lijst met 1 maand.", "Een jaar heeft meer maanden: zoek 12 blokjes."] },
  { ziek: ["Een thermometer meet of je koorts hebt."], tandarts: ["Een tand hoort bij de tandarts."] },
];
const kalender1Opgaven: Opgave[] = metReactie([
  (l, t) =>
    plaatjesVraag(
      l,
      {
        beeld: {},
        kaarten: [P.klok, P.maand, P.ritme],
        goed: "plaatjes",
        vraag: ["Het is een nieuwe dag.", "Waar zie je wat er vandaag gaat gebeuren?"],
        goedZin: ["Op de plaatjes zie je wat er vandaag gebeurt."],
        samen: async (l) => {
          zetP(l, { licht: ["klok"] });
          await l.zeg("Op een klok zie je hoe laat het is.");
          zetP(l, { licht: ["maandkalender"] });
          await l.zeg("Op deze kalender staan alle dagen van juni.");
          zetP(l, { licht: ["plaatjes"] });
          await l.zeg("Op deze plaatjes staat wat er gebeurt.", "Eerst de kring, dan rekenen.");
        },
        tip: ["Zoek de plaatjes van wat je vandaag gaat doen.", "Waar zie je wat er vandaag gaat gebeuren?"],
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
        vraag: ["Op de plaatjes zie je wat er vandaag gebeurt.", "Wat gebeurt er als eerste?"],
        goedZin: ["Eerst is er de kring.", "Zo begint de dag."],
        samen: async (l) => {
          await l.zeg("Je kijkt naar de plaatjes van links naar rechts.", "Het eerste plaatje hangt helemaal links.");
        },
        tip: ["Kijk naar het plaatje helemaal links.", "Wat gebeurt er als eerste?"],
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
        vraag: ["Wat gebeurt er na de kring?"],
        goedZin: ["Na de kring is er rekenen."],
        samen: async (l) => {
          await l.zeg("De kring is het eerste plaatje, helemaal links.", "Het plaatje daarnaast komt erna.");
        },
        tip: ["Kijk naar het plaatje naast de kring.", "Wat gebeurt er na de kring?"],
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
        vraag: ["Vandaag is er gym.", "Dat is ook op donderdag. En op vrijdag!", "Op welke kalender zie je dat?"],
        goedZin: ["Dat is een kalender van de week: een weekkalender.", "Je ziet op welke dagen er gym is."],
        samen: async (l) => {
          zetP(l, { licht: ["klok"] });
          await l.zeg("Op de klok staan geen dagen.");
          zetP(l, { licht: ["maandkalender"] });
          await l.zeg("Op deze kalender staat geen gym.");
          zetP(l, { licht: ["weekkalender"] });
          await l.zeg("Op deze kalender staan de dagen van de week.", "Zoek de dagen met de hoepel.");
        },
        tip: ["Zoek de kalender met een hoepel erop.", "Op welke kalender zie je dat?"],
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
        vraag: ["Op deze kalender staan {30:wit} vakjes met een getal.", "Wat betekent {1:wit} vakje?"],
        goedZin: ["{1:wit} vakje is {1:wit} dag.", "Er zijn {30:wit} vakjes, dus juni heeft {30:wit} dagen."],
        samen: async (l) => {
          await l.zeg("Elk vakje heeft een eigen getal.", "Vandaag is 1 vakje.", "Morgen is het vakje erna.");
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
          { id: "20", label: "20" },
          { id: "13", label: "13" },
        ],
        goed: "8",
        vraag: ["Op de kalender is 1 vak rood.", "Welk getal staat in het rode vak?"],
        goedZin: ["In het rode vak staat {8:rood}.", "Dat is de datum: {8:rood} juni."],
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
          { id: "20", label: "20" },
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
          { id: "lijst", tekening: "lijst|maand=maart|dagen=31|bij=21|naam=feest", zeg: "de lijst met een woord bij een datum" },
          { id: "boek", tekening: "boeknaam|naam=boek", zeg: "het boek" },
          { id: "feesthoedje", tekening: "feesthoed", zeg: "het feesthoedje" },
        ],
        goed: "lijst",
        vraag: ["Waar zie je een feestkalender?"],
        goedZin: ["Op deze kalender staat het woord feest bij {21:rood} maart.", "Dan is het feest."],
        samen: async (l) => {
          await l.zeg("Op een feestkalender staan de feestdagen.", "Bij elk feest staat een datum.");
        },
        tip: ["Denk aan de kalender met een woord bij een getal.", "Waar zie je een feestkalender?"],
      },
      t,
    ),
  (l, t) =>
    plaatjesVraag(
      l,
      {
        beeld: {},
        kaarten: [
          { id: "week", tekening: "weekblad", zeg: "het blad met 1 week" },
          { id: "jaar", tekening: "jaar", zeg: "het blad met 12 maanden" },
          { id: "maand", tekening: "lijst|maand=mei|dagen=31", zeg: "de lijst met 1 maand" },
        ],
        goed: "jaar",
        vraag: ["Een jaarkalender is een kalender van een heel jaar.", "Daar staan alle maanden op.", "Waar zie je een jaarkalender?"],
        goedZin: ["Hier staan alle {12:wit} maanden op.", "Een heel jaar, dat is lang!"],
        samen: async (l) => {
          await l.zeg("Een jaar heeft {12:wit} maanden.", "Zoek de kalender met de meeste blokjes.", "Elk blokje is een maand.");
        },
        tip: ["Denk aan de kalender met 12 blokjes.", "Waar zie je een jaarkalender?"],
      },
      t,
    ),
  (l, t) =>
    plaatjesVraag(
      l,
      {
        beeld: { groot: "maand|hoed=13" },
        kaarten: [
          { id: "ziek", tekening: "thermometer", label: "koorts" },
          { id: "jarig", tekening: "feesthoed", label: "feest" },
          { id: "tandarts", tekening: "tand", label: "tandarts" },
        ],
        goed: "jarig",
        vraag: ["Kijk naar het vakje met het feesthoedje.", "Wat is er op {13:wit} juni?"],
        goedZin: ["Op {13:wit} juni is het feest.", "Maar hoe lang duurt het nog?", "Dat zie je in de volgende les."],
        samen: async (l) => {
          await l.zeg("Een feesthoedje hoort bij een feest.", ...(krijgtVervolgvraag(l) ? [] : ["Welk feest heb jij 1 keer per jaar?"]));
        },
        tip: ["Een feesthoedje draag je op een feestje.", "Wat is er op {13:wit} juni?"],
      },
      t,
    ),
], KAL1_MIS);

/** Koppelen: links willekeurig, maar nooit recht tegenover het woord dat erbij hoort (BOUWREGELS 1.23). */
function linksDoorElkaar(lijst: PDing[], terug: boolean): PDing[] {
  const rechtsVolgorde = ["dagkalender", "maandkalender", "weekkalender"];
  const juist: Record<string, string> = { lijst: "maandkalender", blad: "weekkalender", plaatjes: "dagkalender" };
  for (let k = 0; k < 30; k++) {
    const v = schud(lijst, terug, `koppel${k}`);
    if (v.every((d, i) => juist[d.id] !== rechtsVolgorde[i])) return v;
  }
  return schuif(lijst, terug);
}

/** Lijnen trekken tussen drie kalenders en drie woorden. */
function verbindVraag(l: Lesgids, terug: boolean): SqulaVraag<[string, string][]> {
  const nr = volgend();
  const links: PDing[] = linksDoorElkaar(
    [
      { id: "lijst", tekening: "lijst|maand=mei|dagen=31", zeg: "de lijst met alle dagen van mei" },
      { id: "blad", tekening: "weekblad", zeg: "het blad met 1 week" },
      { id: "plaatjes", tekening: "dagritme|a=kring,rekenen,buiten,gym", zeg: "de plaatjes van 1 dag" },
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
      await l.zeg(bevestig());
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
      await l.zeg("Op dit blad staat 1 week: van maandag tot en met zondag.");
      zetP(l, { licht: ["lijst"] });
      await l.zeg("Op deze lijst staan alle dagen van een maand.");
      zetP(l, { licht: ["plaatjes"] });
      await l.zeg("En op deze plaatjes zie je wat je op 1 dag doet.");
      zetP(l, { licht: [] });
    },
    tip: ["Een maand heeft veel dagen. Een week heeft er 7.", "Trek de lijnen."],
    reactie: (x) => {
      const n = x.filter(([a, r]) => juist[a] === r).length;
      return [n === 0 ? "Geen enkele lijn klopt." : n === 1 ? "1 lijn klopt. Die blijft staan." : "2 lijnen kloppen. Die blijven staan.", "Een maand heeft veel dagen. Een week heeft er 7."];
    },
    toonAntwoord: async () => {
      vast = links.map((d) => d.id);
      lijnen = links.map((d) => [d.id, juist[d.id]] as [string, string]);
      zet(false);
      await l.zeg("Een dagkalender, een weekkalender en een maandkalender.");
      await l.wacht(300);
    },
    testAntwoord: links[0].id,
  };
}

async function welkomPlaatjes(l: Lesgids, groot: string, welkom: string[], uitleg: () => Promise<void>, voorbeeld?: Opgave) {
  nieuwTijdZaad();
  zetSynthesisHulp(l);
  l.vlak<PlaatjesProps>(SqulaTijdPlaatjes, { ...LEEG_P, nr: volgend(), groot });
  speelLesgeluid("verschijn");
  await l.wacht(500);
  const voorbeeldAfgerond = await squlaBegin(l, {
    welkom,
    /* Na "Nee" begint de uitleg weer met het beeld waar hij op rekent (het voorbeeld verdwijnt). */
    voordoen: l.lesId !== "squla-tijd-dagen-1",
    samen: voorbeeld ? () => squlaVraag(l, voorbeeld(l, false)) : undefined,
    uitleg: voorbeeld
      ? async () => {
          zetP(l, { ...LEEG_P, nr: volgend(), groot });
          await uitleg();
        }
      : uitleg,
    /* Het beginscherm laat de eerste opgave van de les zien (BOUWREGELS 4.1). */
    ...(voorbeeld ? { voorbeeld: () => voorbeeld(l, false).toon?.() } : {}),
  });
  return voorbeeldAfgerond;
}

const kalender1: Lesdraaiboek = {
  id: "squla-tijd-kalender-1",
  titel: "De kalender",
  synthesis: "Squla groep 3 · Tijd · De kalender · level 1 (alleen leerdoel)",
  indeling: "synthesis",
  browserstem: true,
  nacht: true,
  voorwerpen: TIJD_VOORWERPEN,
  kaarttekening: KaartKalender,
  async speel(l) {
    await laadKlokken(); /* de Synthesis-klok op het plaatje "klok" */
    const voorbeeldAfgerond = await welkomPlaatjes(l, "maand|hoed=13", ["Een klok, een kalender en plaatjes.", "Waar zie je wat er vandaag gaat gebeuren?"], async () => {
      zetP(l, { ...LEEG_P, groot: null, kaarten: [P.ritme, P.rooster, P.maand] });
      zetP(l, { licht: ["plaatjes"] });
      await l.zeg("Op een dagkalender zie je wat je op 1 dag doet.");
      zetP(l, { licht: ["weekkalender"] });
      await l.zeg("Op een weekkalender zie je de dagen van 1 week.");
      zetP(l, { licht: ["maandkalender"] });
      await l.zeg("Op een maandkalender zie je alle dagen van een maand.");
      zetP(l, { licht: [] });
    }, kalender1Opgaven[0]);
    const fouten = await speelAlles(l, kalender1Opgaven, [0, 4, 5], voorbeeldAfgerond);
    await squlaEind(l, fouten, "Je kent de dagkalender, de weekkalender, de maandkalender en meer.");
  },
};

/* --- De kalender, level 2: rekenen met de kalender --- */

const KAL2_MIS: (Mis | undefined)[] = [
  { "8": ["De {8:wit} is het vak links van het rode vak.", "Kijk welk getal in het rode vak zelf staat."], "16": ["De {16:wit} staat in de rij eronder.", "Kijk welk getal in het rode vak zelf staat."] },
  { "Het is 9 graden.": ["Graden meet je met een thermometer.", "Op een kalender staan dagen."], "Het is 9 uur.": ["Uren zie je op een klok.", "Op een kalender staan dagen."] },
  { donderdag: ["Donderdag staat een vakje verder.", "Volg de rode pijl omhoog tot de dag bovenaan."], zondag: ["Zondag is een andere dag.", "Volg de rode pijl omhoog tot de dag bovenaan."] },
  undefined,
  (x) => [`Bij de {${x}:wit} staat het woord feest niet.`, "Zoek het getal bij het rode woord feest."],
  { Nee: ["Op de kalender kun je wel tellen.", "Elk vakje is een dag."] },
  { "3": ["Met 3 boogjes kom je op {12:wit} juni. Het hoedje hangt bij {13:wit} juni.", "Tel alle boogjes tussen het rode vak en het hoedje."], "5": ["Met 5 boogjes kom je op {14:wit} juni, voorbij het hoedje.", "Stop met tellen bij het feesthoedje."] },
  { "16 juni": ["{16:wit} juni is een week later dan {9:wit} juni.", "Morgen is maar 1 dag verder."], "8 juni": ["{8:wit} juni was gisteren.", "Morgen is de dag erna."] },
  { "13": ["{13:wit} is de datum van het feest, niet het aantal nachtjes.", "Tel de stapjes van het rode vak naar het feest."], "12": ["{12:wit} is de datum van vandaag.", "Tel de stapjes van het rode vak naar het feest."] },
  { "2": ["Je koos 2. Het feesthoedje hangt nog 1 boogje verder.", "Wijs de boogjes 1 voor 1 aan, tot het hoedje."], "0": ["Met 0 boogjes zou het feest nu zijn.", "Tussen het rode vak en het hoedje liggen boogjes."] },
  { "9 juni": ["{9:wit} juni was gisteren.", "Morgen is de dag erna."], "17 juni": ["{17:wit} juni is een week later dan {10:wit} juni.", "Morgen is maar 1 dag verder."] },
  { "1": ["Je koos 1. Dan zou het feest morgen zijn.", "Tel de boogjes tot het feesthoedje."], "3": ["Met 3 boogjes zou het feest op {14:wit} juni zijn.", "Het hoedje hangt al bij {13:wit} juni."] },
];
const kalender2Opgaven: Opgave[] = metReactie([
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
          await l.zeg("Zoek het vak met de rode rand.", ...(krijgtVervolgvraag(l) ? [] : ["Kijk goed welk getal erin staat."]));
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
        opties: ["Het is 9 graden.", "Het is 9 uur.", "Het is 9 juni."],
        goed: "Het is 9 juni.",
        vraag: ["Wat betekent de {9:rood} op de kalender?"],
        goedZin: ["Het rode vak betekent {9:rood} juni.", "Dat zie je op de kalender."],
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
        vraag: ["Op de kalender zie je ook welke dag het is.", "Volg de rode pijl naar boven.", "Welke dag is het vandaag?"],
        goedZin: ["Vandaag is het woensdag {9:rood} juni.", "Handig, zo'n kalender."],
        samen: async (l) => {
          await l.zeg("Bovenaan staan de dagen, kort geschreven.", "ma is maandag, di is dinsdag.", "De pijl wijst naar wo.");
        },
        tip: ["Zoek de dag die begint met wo.", "Welke dag is het vandaag?"],
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
        vraag: ["Dit is de dagkalender van vandaag.", "Je ziet wat er vandaag allemaal gebeurt.", "Zet de kaartjes in dezelfde volgorde."],
        goedZin: ["Eerst rekenen, dan fruit eten, dan gym.", "Dat gebeurt er vandaag."],
        samen: async (l) => {
          await l.zeg("Kijk naar de plaatjes bovenaan.", "Begin links.", ...(krijgtVervolgvraag(l) ? [] : ["Welk plaatje hangt daar?"]));
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
        beeld: { groot: "verjaardag|maand=juni|dagen=30|bij=13|naam=feest" },
        opties: ["9", "13", "3"],
        goed: "13",
        vraag: ["Dit is een feestkalender.", "Bij welk getal staat het woord feest?"],
        goedZin: ["Feest staat bij {13:wit}.", "Het feest is op {13:wit} juni."],
        samen: async (l) => {
          await l.zeg("Op een feestkalender staan feestdagen.", "Het woord feest staat in het rood.");
        },
        tip: ["Zoek in de lijst het rode woord feest. Welk getal staat ernaast?", "Bij welk getal staat het woord feest?"],
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
        vraag: ["Vandaag is het {9:rood} juni.", "Kun je op de kalender tellen hoeveel nachtjes het nog duurt tot het feest?", "Ja of nee?"],
        goedZin: ["Ja, dat kan.", "We gaan het tellen."],
        samen: async (l) => {
          await l.zeg("Elk vakje is een dag.", "Van het ene vakje naar het volgende is 1 nachtje slapen.");
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
        vraag: ["Tel de boogjes.", "Dan weet je over hoeveel nachtjes het feest is.", "Hoeveel boogjes zijn het?"],
        goedZin: ["Over {4:wit} nachtjes is het feest.", "Joepie!"],
        samen: async (l) => {
          await l.zeg("We starten bij het rode vak.", "Elk boogje is 1 nachtje slapen.", "Tel elk boogje tot je bij het feesthoedje bent.");
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
        vraag: ["De nacht gaat voorbij. Dan is het snel morgen.", "Welke datum is het morgen?"],
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
        vraag: ["Stel je voor dat het al {12:rood} juni is.", "Over hoeveel nachtjes is het feest dan?"],
        goedZin: ["Dan nog maar {1:wit} nachtje!", "Dat was maar even verzonnen."],
        samen: async (l) => {
          await l.zeg("Stel je voor: het rode vak is {12:rood} juni.", "Het feesthoedje staat in het vakje ernaast.");
        },
        tip: ["Van het rode vak naar het feesthoedje is 1 stapje.", "Over hoeveel nachtjes is het feest dan?"],
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
        vraag: ["Nu is het echt morgen: {10:rood} juni.", "Het feest komt steeds dichterbij!", "Hoeveel nachtjes nog?"],
        goedZin: ["Nog {3:wit} nachtjes slapen.", "Morgen nog {2:wit}, de dag daarna nog {1:wit}.", "En dan is het feest!"],
        samen: async (l) => {
          await l.zeg("Het rode vak is vandaag.", "Tel bij elk boogje 1 nachtje erbij, tot het feesthoedje.");
        },
        tip: ["Tel de boogjes tussen het rode vak en het feesthoedje.", "Hoeveel nachtjes nog?"],
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
        vraag: ["Vandaag is het {10:rood} juni.", "Welke datum is het morgen?"],
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
        vraag: ["Nu is het {11:rood} juni.", "Hoeveel nachtjes nog tot het feest?"],
        goedZin: ["Nog maar {2:wit} nachtjes!"],
        samen: async (l) => {
          await l.zeg("Het rode vak is vandaag.", "Loop boogje voor boogje naar het feesthoedje.");
        },
        tip: ["Elk boogje brengt je 1 nachtje dichter bij het feest.", "Hoeveel nachtjes nog tot het feest?"],
      },
      t,
    ),
], KAL2_MIS);

const kalender2: Lesdraaiboek = {
  id: "squla-tijd-kalender-2",
  titel: "De kalender (moeilijker)",
  synthesis: "Squla groep 3 · Tijd · De kalender · level 2 (alleen leerdoel)",
  indeling: "synthesis",
  browserstem: true,
  nacht: true,
  voorwerpen: TIJD_VOORWERPEN,
  kaarttekening: KaartKalender,
  async speel(l) {
    const voorbeeldAfgerond = await welkomPlaatjes(l, "maand|hoed=13", ["Op de kalender van juni staat een rood vak.", "Welk getal staat daar?"], async () => {
      /* Eerst over het rode vak en het getal erin (dat is het voorbeeld), met een getal dat in de les niet voorkomt. */
      zetP(l, { groot: "maand|rood=5|hoed=13" });
      await l.zeg("Kijk, het rode vak.", "Daar staat een getal: {5:rood}.", "Dat is {5:rood} juni.");
      zetP(l, { groot: "maand|boog=1-3" });
      await l.zeg("Elk vakje is een dag.", "Van vakje naar vakje is 1 nachtje slapen.", "Kijk, de boogjes.", "Van {1:wit} juni naar {3:wit} juni is {2:wit} nachtjes slapen.");
      zetP(l, { groot: "maand|hoed=13" });
    }, kalender2Opgaven[0]);
    const fouten = await speelAlles(l, kalender2Opgaven, [0, 3, 6], voorbeeldAfgerond);
    await squlaEind(l, fouten, "Je kunt rekenen met de kalender.");
  },
};

/* --- Tijden, level 1: woorden over tijd (voorlezen bij het kampvuur; tot 31 oktober 2026 met Fien de kikker en drie dieren) --- */

const DAGDEEL = (d: string): PDing => ({ id: d, tekening: `dagdeel|d=${d}`, label: d });

const TIJ1_MIS: (Mis | undefined)[] = [
  { donderdag: ["Donderdag komt vóór vrijdag.", "Denk aan de dag direct na vrijdag."], zondag: ["Zondag komt 2 dagen na vrijdag.", "Denk aan de dag direct na vrijdag."] },
  { blauw: ["Het blauwe boek was niet het eerste.", "Luister nog eens goed naar het verhaal."], groen: ["Het groene boek kwam het laatst.", "Luister nog eens goed naar het verhaal."] },
  { rond: ["Rond is een vorm, geen lengte.", "Denk aan het omgekeerde van kort."], snel: ["Een boek is niet snel of langzaam.", "Denk aan het omgekeerde van kort."] },
  { groen: ["Groen is een kleur.", "Denk aan het omgekeerde van lang."], zwaar: ["Zwaar zegt hoeveel iets weegt.", "Denk aan het omgekeerde van lang."] },
  (x) => [`${Hoofd(x)} is al voorbij.`, "Denk aan een woord voor iets wat nog moet komen."],
  { ochtend: ["De ochtend is aan het begin van de dag."], middag: ["De middag komt vóór de avond."] },
  { nacht: ["De nacht komt ná de avond."], ochtend: ["De ochtend komt eerst, vóór de middag."] },
  undefined,
  { kort: ["Kort gaat over hoe lang iets duurt, niet over hoe laat het is.", "Denk aan het omgekeerde van vroeg."], straks: ["Straks is iets wat nog komt.", "Het was al nacht."] },
  undefined,
  { vrijdag: ["Vrijdag is een dag vóór zaterdag.", "Morgen is de dag erna."], maandag: ["Maandag is 2 dagen na zaterdag.", "Morgen is de dag direct na zaterdag."] },
  { donderdag: ["Donderdag was eergisteren.", "Gisteren is de dag direct vóór zaterdag."], zondag: ["Zondag komt ná zaterdag.", "Gisteren is de dag vóór vandaag."] },
];
const tijden1Opgaven: Opgave[] = metReactie([
  (l, t) =>
    knopVraag(
      l,
      {
        /* het kampvuur klein en zacht op de achtergrond (BOUWREGELS 1.22) */
        beeld: { sfeer: "kampvuur" },
        opties: ["donderdag", "zaterdag", "zondag"],
        goed: "zaterdag",
        vraag: ["Gisteren was er een kampvuuravond.", "Dat was op vrijdag.", "Welke dag komt na vrijdag?"],
        goedZin: ["Na vrijdag komt zaterdag.", "Vandaag is het zaterdag."],
        samen: async (l) => {
          zetP(l, { groot: "week|licht=4" });
          await l.zeg("Hier staan de dagen van de week.", "Kijk, vrijdag staat in grote letters.", ...(krijgtVervolgvraag(l) ? [] : ["Welke dag staat erna?"]));
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
          { id: "rood", tekening: "boekrood", zeg: "het rode boek" },
          { id: "blauw", tekening: "boekblauw", zeg: "het blauwe boek" },
          { id: "groen", tekening: "boekgroen", zeg: "het groene boek" },
        ],
        goed: "rood",
        vraag: ["Bij het kampvuur lazen we 3 boeken voor.", "Als eerste lazen we het rode boek.", "Welk boek lazen we als eerste?"],
        goedZin: ["Het rode boek was eerst.", "Dat lazen we als eerste."],
        samen: async (l) => {
          await l.zeg("Als eerste betekent: vóór alle anderen.", "Luister nog eens goed naar het verhaal.");
        },
        tip: ["Het was het rode boek.", "Welk boek lazen we als eerste?"],
      },
      t,
    ),
  (l, t) =>
    knopVraag(
      l,
      {
        /* het boek wordt in de vraag genoemd: teruggezet (BOUWREGELS 1.25, 7 november 2026) */
        beeld: { groot: "boekrood" },
        opties: ["lang", "rond", "snel"],
        goed: "lang",
        vraag: ["Het rode boek was niet kort.", "Het was juist heel erg ..."],
        goedZin: ["Het rode boek was heel lang."],
        samen: async (l) => {
          await l.zeg("Een kort verhaal is snel voorbij.", "Dit boek was niet snel uit.", "Het duurde en duurde maar.");
        },
        tip: ["Het omgekeerde van kort.", "Het verhaal was juist heel erg ..."],
      },
      t,
    ),
  (l, t) =>
    knopVraag(
      l,
      {
        /* het boek wordt in de vraag genoemd: teruggezet (BOUWREGELS 1.25, 7 november 2026) */
        beeld: { groot: "boekblauw" },
        opties: ["groen", "kort", "zwaar"],
        goed: "kort",
        vraag: ["Daarna lazen we het blauwe boek.", "Dat was niet lang.", "Het was juist heel erg ..."],
        goedZin: ["Het blauwe boek was kort.", "Het was zo uit."],
        samen: async (l) => {
          await l.zeg("Lang en kort horen bij elkaar.", "Het blauwe boek was snel uit.");
        },
        tip: ["Het omgekeerde van lang.", "Het was juist heel erg ..."],
      },
      t,
    ),
  (l, t) =>
    knopVraag(
      l,
      {
        /* het boek wordt in de vraag genoemd: teruggezet (BOUWREGELS 1.25, 7 november 2026) */
        beeld: { groot: "boekgroen" },
        opties: ["straks", "gisteren", "vroeger"],
        goed: "straks",
        vraag: ["Toen was het groene boek nog niet aan de beurt.", "Dat kwam pas over een poosje.", "Welk woord past bij: over een poosje?"],
        goedZin: ["Over een poosje is straks.", "Het groene boek kwam pas later."],
        samen: async (l) => {
          await l.zeg("Over een poosje is nog niet nu.", "Het komt nog.", "Gisteren en vroeger zijn al voorbij.");
        },
        tip: ["Zoek het woord voor iets wat nog moet komen.", "Welk woord past bij: over een poosje?"],
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
        vraag: ["Eindelijk lazen we het groene boek.", "Het was al laat in de avond.", "Wat komt er na de avond?"],
        goedZin: ["Na de avond komt de nacht."],
        samen: async (l) => {
          zetP(l, { kaarten: [DAGDEEL("ochtend"), DAGDEEL("middag"), DAGDEEL("avond")], uit: [] });
          zetP(l, { licht: ["ochtend"] });
          await l.zeg("Eerst is het ochtend.");
          zetP(l, { licht: ["middag"] });
          await l.zeg("Dan is het middag.");
          zetP(l, { licht: ["avond"] });
          await l.zeg("Dan is het avond.");
        },
        tip: ["Denk aan het moment waarop je gaat slapen.", "Wat komt er na de avond?"],
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
        tip: ["Denk aan wat er na de ochtend komt.", "Wat komt er vlak voor de avond?"],
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
        /* de maan verklapt het antwoord "laat", dus niet tijdens de vraag; Bliepo zegt bij de uitleg "het was al nacht",
           dus dan staat de maan er wel (BOUWREGELS 1.22 en 1.25, 7 november 2026) */
        beeld: {},
        hulpBeeld: { groot: "dagdeel|d=nacht" },
        opties: ["laat", "kort", "straks"],
        goed: "laat",
        vraag: ["Na het kampvuur gingen we naar huis.", "Toen was het al heel ..."],
        goedZin: ["Het was al heel laat.", "Tijd om te slapen!"],
        samen: async (l) => {
          zetP(l, { groot: "dagdeel|d=nacht" });
          await l.zeg("Het was al nacht.", "Dan is het niet vroeg meer.");
        },
        tip: ["Het omgekeerde van vroeg.", "Toen was het al heel ..."],
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
          await l.zeg("Gisteren was de kampvuuravond. Die is al voorbij.", "Vandaag rusten we uit.", "Morgen komt nog.", "Wat al voorbij is, komt eerst.");
        },
        tip: ["Gisteren is al voorbij.", "Zet op volgorde."],
      },
      t,
    ),
  (l, t) =>
    knopVraag(
      l,
      {
        /* het zwemmen wordt in de vraag genoemd: teruggezet (BOUWREGELS 1.25, 7 november 2026) */
        beeld: { groot: "zwemmen" },
        opties: ["vrijdag", "zondag", "maandag"],
        goed: "zondag",
        vraag: ["Morgen gaan we zwemmen!", "Vandaag is het zaterdag.", "Welke dag is het morgen?"],
        goedZin: ["Morgen is het zondag.", "Dan gaan we zwemmen."],
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
        beeld: { sfeer: "kampvuur" },
        opties: ["donderdag", "vrijdag", "zondag"],
        goed: "vrijdag",
        vraag: ["Vandaag is het zaterdag.", "Welke dag was het gisteren?"],
        goedZin: ["Vrijdag was gisteren.", "Toen was de kampvuuravond."],
        samen: async (l) => {
          zetP(l, { groot: "week|licht=5" });
          await l.zeg("Zaterdag is groter. Dat is vandaag.", "Gisteren is de dag ervoor.");
        },
        hulpBeeld: { groot: "week|licht=5" },
        tip: ["Kijk naar de dag links van zaterdag.", "Welke dag was het gisteren?"],
      },
      t,
    ),
], TIJ1_MIS);

const tijden1: Lesdraaiboek = {
  id: "squla-tijd-tijden-1",
  titel: "Tijden",
  synthesis: "Squla groep 3 · Tijd · Tijden · level 1 (alleen leerdoel)",
  indeling: "synthesis",
  browserstem: true,
  nacht: true,
  voorwerpen: TIJD_VOORWERPEN,
  kaarttekening: KaartTijden,
  async speel(l) {
    const voorbeeldAfgerond = await welkomPlaatjes(l, "kampvuur", ["Gisteren was er een kampvuuravond op vrijdag.", "Welke dag komt na vrijdag?"], async () => {
      /* Eerst over "na een dag" (het voorbeeld), met een dag die in de vragen niet het antwoord is. */
      zetP(l, { groot: "week|licht=2" });
      await l.zeg("Stel, gisteren was het woensdag.");
      zetP(l, { groot: "week|licht=3" });
      await l.zeg("Na woensdag komt donderdag.", "Dus vandaag is het donderdag.");
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
    }, tijden1Opgaven[0]);
    const fouten = await speelAlles(l, tijden1Opgaven, [0, 5, 9], voorbeeldAfgerond);
    await squlaEind(l, fouten, "Je kent woorden over tijd.");
  },
};

/* --- Tijden, level 2: wat duurt lang, wat duurt kort (de bakkerij) --- */

const twee = (a: PDing, b: PDing): PDing[] => [a, b];

const TIJ2_MIS: (Mis | undefined)[] = [
  { boterham: ["Een boterham is zo op."] },
  { lopen: ["De bakkerij is vlakbij. Daar ben je zo."] },
  { deeg: ["Voor deeg moet je lang kneden."] },
  { versieren: ["Bij versieren doe je veel: room, fruit en nog meer."] },
  { koekje: ["Een koekje is in een paar happen op."] },
  { "ei koken": ["Een ei is al na een paar minuten klaar."] },
  { vegen: ["Bij vegen moet je overal langs."] },
  { "een broodje krijgen": ["Een broodje krijgen is zo gebeurd."] },
  undefined,
  { broodjes: ["100 broodjes bakken duurt de hele middag."], lunchen: ["Lunchen duurt langer dan een minuut."] },
  { afwassen: ["Afwassen kost een tijdje, maar het duurt niet langer dan een middag."], "een boterham eten": ["Een boterham eten is zo gebeurd."] },
  { keuken: ["Bij vegen moet je overal langs."] },
];
const tijden2Opgaven: Opgave[] = metReactie([
  (l, t) =>
    plaatjesVraag(
      l,
      {
        beeld: {},
        kaarten: twee({ id: "boterham", tekening: "boterham", zeg: "een boterham eten" }, { id: "slapen", tekening: "bed", zeg: "een nacht slapen" }),
        goed: "slapen",
        vraag: ["Het is heel vroeg in de ochtend.", "Eerst eet je een boterham.", "Wat duurt langer: een boterham eten of een nacht slapen?"],
        goedZin: ["Een nacht slapen duurt veel langer.", "Een boterham is zo op."],
        samen: async (l) => {
          zetP(l, { licht: ["boterham"] });
          await l.zeg("Een boterham is op in een paar happen.");
          zetP(l, { licht: ["slapen"] });
          await l.zeg("Slapen doe je de hele nacht.");
        },
        tip: ["Denk eens aan hoe lang een nacht slapen duurt."],
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
        vraag: ["Je loopt naar de bakkerij. Dat is vlakbij.", "In de bakkerij is het de hele dag druk.", "Wat duurt langer: naar de bakkerij lopen of de hele dag werken?"],
        goedZin: ["De hele dag werken duurt langer.", "Vlakbij ben je zo."],
        samen: async (l) => {
          zetP(l, { licht: ["lopen"] });
          await l.zeg("De bakkerij is vlakbij.", "Daar ben je zo.");
          zetP(l, { licht: ["werken"] });
          await l.zeg("Een hele dag duurt van de ochtend tot de avond.");
        },
        tip: ["Denk aan hoe lang je onderweg bent en hoe lang je werkt."],
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
        vraag: ["In de bakkerij wordt deeg gemaakt voor het brood.", "Daarna wordt er suiker op de koeken gestrooid.", "Wat duurt kort?"],
        goedZin: ["Suiker strooien duurt kort.", "Deeg maken duurt lang."],
        samen: async (l) => {
          zetP(l, { licht: ["deeg"] });
          await l.zeg("Voor deeg moet je lang kneden.");
          zetP(l, { licht: ["suiker"] });
          await l.zeg("Strooien doe je met een paar schudjes.");
        },
        tip: ["Zoek wat met een paar schudjes klaar is.", "Wat duurt kort?"],
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
        goedZin: ["Een kers op de taart leggen duurt korter.", "Dat is in 1 tel gebeurd."],
        samen: async (l) => {
          zetP(l, { licht: ["versieren"] });
          await l.zeg("Bij versieren doe je veel: room, fruit, en nog meer.");
          zetP(l, { licht: ["kers"] });
          await l.zeg("Een kers leg je er in 1 keer op.");
        },
        tip: ["Denk aan wat je in 1 keer doet.", "Wat duurt korter?"],
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
        vraag: ["Nu gaat het brood de oven in.", "Daarna is er een koekje om te eten.", "Wat duurt ongeveer een uur?"],
        goedZin: ["Brood bakken duurt ongeveer een uur."],
        samen: async (l) => {
          await l.zeg("Een uur is best lang.", "Een koekje is in een paar happen op.");
        },
        tip: ["Denk aan hoe lang bakken duurt en hoe lang eten duurt.", "Wat duurt ongeveer een uur?"],
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
        tip: ["Denk aan hoe lang een ei in het water moet, en hoe lang een taart in de oven."],
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
        vraag: ["Straks gaat de bakkerij open.", "Eerst gaat de deur van het slot.", "En de hele winkel wordt geveegd.", "Wat duurt korter?"],
        goedZin: ["De deur van het slot doen duurt kort.", "De hele winkel vegen duurt langer."],
        samen: async (l) => {
          zetP(l, { licht: ["slot"] });
          await l.zeg("Een sleutel draai je in 1 keer om.");
          zetP(l, { licht: ["vegen"] });
          await l.zeg("Bij vegen moet je overal langs.");
        },
        tip: ["Denk aan wat je in 1 keer doet.", "Wat duurt korter?"],
      },
      t,
    ),
  (l, t) =>
    knopVraag(
      l,
      {
        /* de bakkerij klein en zacht op de achtergrond (BOUWREGELS 1.22) */
        beeld: { sfeer: "bakkerij" },
        opties: ["de rondleiding", "een broodje krijgen"],
        goed: "de rondleiding",
        vraag: ["Er is een bezoek aan de bakkerij!", "Eerst is er een rondleiding door de hele bakkerij.", "Daarna is er een broodje.", "Wat duurt het langst?"],
        goedZin: ["De rondleiding duurt het langst.", "Je loopt langs de hele bakkerij."],
        samen: async (l) => {
          await l.zeg("Bij een rondleiding loop je overal langs.", "Een broodje krijgen is zo gebeurd.");
        },
        tip: ["Zoek waarbij je langs de hele bakkerij loopt.", "Wat duurt het langst?"],
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
        vraag: ["Oh nee, er is een taart gevallen!", "Er moet een nieuwe komen.", "Zet de klusjes op volgorde."],
        goedZin: ["Eerst het beslag, dan de oven, dan versieren.", "Klaar!"],
        samen: async (l) => {
          zetP(l, { licht: ["beslag"] });
          await l.zeg("Hier zit het beslag nog in de kom.");
          zetP(l, { licht: ["oven"] });
          await l.zeg("Hier staat de taart in de oven.");
          zetP(l, { licht: ["versierd"] });
          await l.zeg("Hier is de taart klaar, met een kaarsje.", ...(krijgtVervolgvraag(l) ? [] : ["Wat komt eerst?"]));
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
          { id: "broodjes", tekening: "brood", zeg: "100 broodjes bakken" },
          { id: "lunchen", tekening: "boterham", zeg: "lunchen" },
        ],
        goed: "water",
        vraag: ["Het is bijna lunchtijd.", "Eerst een glas water.", "Vanmiddag worden er 100 broodjes gebakken.", "Wat duurt ongeveer een minuut?"],
        goedZin: ["Een glas water drinken duurt ongeveer een minuut.", "100 broodjes bakken duurt de hele middag."],
        samen: async (l) => {
          await l.zeg("Een minuut is heel kort.", ...(krijgtVervolgvraag(l) ? [] : ["Wat is in zo'n korte tijd klaar?"]));
        },
        tip: ["Zoek wat het snelst klaar is.", "Wat duurt ongeveer een minuut?"],
      },
      t,
    ),
  (l, t) =>
    knopVraag(
      l,
      {
        /* Het brood staat er weer (de vraag noemt broodjes; BOUWREGELS 1.25). De vraag is korter, zodat hij niet achter de knoppen bovenaan valt (Sara, 7 november 2026).
           De knop heette al "1 week kamperen" (cijferafspraak 3.20); nu ook in de code, zodat de test hem vindt. */
        beeld: { groot: "brood" },
        opties: ["1 week kamperen", "afwassen", "een boterham eten"],
        goed: "1 week kamperen",
        vraag: ["De bakkerij bakt de hele middag broodjes.", "Wat duurt langer dan een hele middag?"],
        goedZin: ["1 week kamperen duurt veel langer.", "Een week heeft wel 7 dagen."],
        samen: async (l) => {
          await l.zeg("Een middag is een stuk van 1 dag.", "Een week is 7 dagen.");
        },
        tip: ["Denk aan wat langer duurt dan 1 dag."],
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
        vraag: ["De dag zit erop.", "Eerst gaat de jas aan.", "Thuis wordt de hele keuken geveegd.", "Wat duurt ongeveer een minuut?"],
        goedZin: ["Je jas aantrekken duurt ongeveer een minuut."],
        samen: async (l) => {
          await l.zeg("Een minuut is heel kort.", "Bij vegen moet je overal langs.");
        },
        tip: ["Zoek wat het snelst klaar is.", "Wat duurt ongeveer een minuut?"],
      },
      t,
    ),
], TIJ2_MIS);

const tijden2: Lesdraaiboek = {
  id: "squla-tijd-tijden-2",
  titel: "Tijden (moeilijker)",
  synthesis: "Squla groep 3 · Tijd · Tijden · level 2 (alleen leerdoel)",
  indeling: "synthesis",
  browserstem: true,
  nacht: true,
  voorwerpen: TIJD_VOORWERPEN,
  kaarttekening: KaartTijden,
  async speel(l) {
    const voorbeeldAfgerond = await welkomPlaatjes(l, "bakkerij", ["Wat duurt langer?", "Een boterham eten of een nacht slapen?"], async () => {
      zetP(l, { groot: null, kaarten: twee({ id: "koekje", tekening: "koekje", zeg: "een koekje eten" }, { id: "slapen", tekening: "bed", zeg: "een nacht slapen" }) });
      zetP(l, { licht: ["koekje"] });
      await l.zeg("Een koekje eten duurt heel kort.");
      zetP(l, { licht: ["slapen"] });
      await l.zeg("Een nacht slapen duurt heel lang.");
      zetP(l, { kaarten: [], licht: [], groot: "bakkerij" });
      await l.zeg("Een minuut is kort.", "Een uur is langer.", "En een hele middag is nog langer.");
    }, tijden2Opgaven[0]);
    const fouten = await speelAlles(l, tijden2Opgaven, [0, 6, 9], voorbeeldAfgerond);
    await squlaEind(l, fouten, "Je weet wat lang duurt en wat kort duurt.");
  },
};

export const LESSEN_SQULA_TIJD: Lesdraaiboek[] = [dagen1, dagen2, dagen3, kalender1, kalender2, tijden1, tijden2];
